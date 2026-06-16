"""
Основной API KOMPLEKTO: авторизация, проекты, спецификации, заказы, админка.
Роутинг по path:
  /auth/login, /auth/register, /auth/me, /auth/verify
  /projects  GET/POST/PUT
  /specs  GET/POST  | /specs/rows  GET/POST/PUT/DELETE
  /orders  GET/POST/PUT
  /admin/stats, /admin/members, /admin/members/{id}/verify, /admin/members/{id}/block
"""
import json, os, hashlib, random, string, psycopg2
from datetime import datetime

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p96360387_komplekto_ai_os')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
}

def conn(): return psycopg2.connect(os.environ['DATABASE_URL'])
def ok(data): return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(data, default=str)}
def err(code, msg): return {'statusCode': code, 'headers': CORS, 'body': json.dumps({'error': msg})}

def make_token(mid, email):
    return hashlib.sha256(f"{mid}:{email}:komplekto_secret_2024".encode()).hexdigest()[:32]

def get_member(token, db):
    cur = db.cursor()
    cur.execute(f"SELECT id, full_name, email, mtype, is_admin, is_verified FROM {SCHEMA}.members")
    for r in cur.fetchall():
        if make_token(r[0], r[2]) == token:
            return {'id': r[0], 'name': r[1], 'email': r[2], 'role': r[3], 'is_admin': r[4], 'is_verified': r[5]}
    return None

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    qs = event.get('queryStringParameters') or {}
    body = json.loads(event.get('body') or '{}')
    token = (event.get('headers') or {}).get('X-Auth-Token', '')

    db = conn()

    # ── AUTH ─────────────────────────────────────────────────────────────
    if '/auth/login' in path:
        email = body.get('email', '').lower().strip()
        pwd = body.get('password', '')
        cur = db.cursor()
        cur.execute(f"SELECT id, full_name, email, pass_hash, mtype, is_admin, is_verified FROM {SCHEMA}.members WHERE email = '{email}'")
        r = cur.fetchone()
        db.close()
        if not r or r[3] != pwd:
            return err(401, 'Неверный email или пароль')
        return ok({'token': make_token(r[0], r[2]), 'id': r[0], 'name': r[1],
                   'email': r[2], 'role': r[4], 'is_admin': r[5], 'is_verified': r[6]})

    if '/auth/register' in path:
        name = body.get('name', '').strip().replace("'", "''")
        email = body.get('email', '').lower().strip()
        pwd = body.get('password', '')
        mtype = body.get('role', 'Дизайнер').replace("'", "''")
        if not name or not email or not pwd:
            db.close(); return err(400, 'Заполните все поля')
        cur = db.cursor()
        cur.execute(f"SELECT id FROM {SCHEMA}.members WHERE email = '{email}'")
        if cur.fetchone():
            db.close(); return err(409, 'Email уже зарегистрирован')
        vcode = ''.join(random.choices(string.digits, k=6))
        cur.execute(f"INSERT INTO {SCHEMA}.members (full_name,email,pass_hash,mtype,is_admin,is_verified,vcode,created_at) "
                    f"VALUES ('{name}','{email}','{pwd}','{mtype}',FALSE,FALSE,'{vcode}',NOW()) RETURNING id")
        new_id = cur.fetchone()[0]
        db.commit(); db.close()
        return ok({'token': make_token(new_id, email), 'id': new_id, 'name': name,
                   'email': email, 'role': mtype, 'is_admin': False, 'is_verified': False, 'vcode': vcode})

    if '/auth/me' in path:
        member = get_member(token, db); db.close()
        if not member: return err(401, 'unauthorized')
        return ok(member)

    if '/auth/verify' in path:
        member = get_member(token, db)
        if not member: db.close(); return err(401, 'unauthorized')
        code = body.get('code', '')
        cur = db.cursor()
        cur.execute(f"SELECT vcode FROM {SCHEMA}.members WHERE id = {member['id']}")
        r = cur.fetchone()
        if not r or r[0] != code:
            db.close(); return err(400, 'Неверный код')
        cur.execute(f"UPDATE {SCHEMA}.members SET is_verified = TRUE WHERE id = {member['id']}")
        db.commit(); db.close()
        return ok({'ok': True})

    # ── требуем авторизацию для всего остального ─────────────────────────
    member = get_member(token, db)
    if not member:
        db.close(); return err(401, 'unauthorized')
    mid = member['id']

    # ── PROJECTS ─────────────────────────────────────────────────────────
    if '/projects' in path and '/specs' not in path:
        parts = [p for p in path.strip('/').split('/') if p]
        proj_id = int(parts[-1]) if parts and parts[-1].isdigit() else 0

        if method == 'GET':
            cur = db.cursor()
            q = f"SELECT id,member_id,pname,ptype,budget,spent,items,status,cover,progress,created_at FROM {SCHEMA}.projects"
            q += " ORDER BY created_at DESC" if member['is_admin'] else f" WHERE member_id={mid} ORDER BY created_at DESC"
            cur.execute(q)
            rows = cur.fetchall(); db.close()
            return ok([{'id':r[0],'member_id':r[1],'name':r[2],'type':r[3],'budget':r[4] or 0,
                        'spent':r[5] or 0,'items':r[6] or 0,'status':r[7],'cover':r[8],'progress':r[9] or 0} for r in rows])

        if method == 'POST':
            name = body.get('name','Новый проект').replace("'","''")
            ptype = body.get('type','Квартира').replace("'","''")
            budget = int(body.get('budget',0))
            cover = body.get('cover','🏠')
            cur = db.cursor()
            cur.execute(f"INSERT INTO {SCHEMA}.projects (member_id,pname,ptype,budget,spent,items,status,cover,progress,created_at) "
                        f"VALUES ({mid},'{name}','{ptype}',{budget},0,0,'Планирование','{cover}',0,NOW()) RETURNING id")
            new_id = cur.fetchone()[0]; db.commit(); db.close()
            return ok({'id':new_id,'name':name,'type':ptype,'budget':budget,'spent':0,'items':0,
                       'status':'Планирование','cover':cover,'progress':0})

        if method == 'PUT' and proj_id:
            fields = []
            if 'name' in body: fields.append(f"pname='{body['name'].replace(chr(39),chr(39)*2)}'")
            if 'status' in body: fields.append(f"status='{body['status']}'")
            if 'progress' in body: fields.append(f"progress={int(body['progress'])}")
            if 'budget' in body: fields.append(f"budget={int(body['budget'])}")
            if 'spent' in body: fields.append(f"spent={int(body['spent'])}")
            if fields:
                cur = db.cursor()
                where = f"id={proj_id}" if member['is_admin'] else f"id={proj_id} AND member_id={mid}"
                cur.execute(f"UPDATE {SCHEMA}.projects SET {','.join(fields)} WHERE {where}")
                db.commit()
            db.close(); return ok({'ok':True})

    # ── SPECS ROWS ────────────────────────────────────────────────────────
    if '/specs/rows' in path:
        parts = [p for p in path.strip('/').split('/') if p]
        row_id = int(parts[-1]) if parts[-1].isdigit() else 0

        if method == 'GET':
            spec_id = int(qs.get('spec_id', 0))
            cur = db.cursor()
            cur.execute(f"SELECT id,spec_id,position,room,product,category,unit,qty,price,supplier,note "
                        f"FROM {SCHEMA}.spec_rows WHERE spec_id={spec_id} AND product != '__deleted__' ORDER BY position")
            rows = cur.fetchall(); db.close()
            return ok([{'id':r[0],'spec_id':r[1],'position':r[2],'room':r[3] or '',
                        'product':r[4],'category':r[5] or '','unit':r[6] or 'шт',
                        'qty':float(r[7] or 1),'price':r[8] or 0,'supplier':r[9] or '','note':r[10] or ''} for r in rows])

        if method == 'POST':
            sid = int(body.get('spec_id',0))
            prod = body.get('product','Новый товар').replace("'","''")
            room = body.get('room','').replace("'","''")
            cat = body.get('category','').replace("'","''")
            unit = body.get('unit','шт').replace("'","''")
            qty = float(body.get('qty',1)); price = int(body.get('price',0))
            sup = body.get('supplier','').replace("'","''")
            note = body.get('note','').replace("'","''")
            cur = db.cursor()
            cur.execute(f"INSERT INTO {SCHEMA}.spec_rows (spec_id,position,room,product,category,unit,qty,price,supplier,note) "
                        f"VALUES ({sid},(SELECT COALESCE(MAX(position),0)+1 FROM {SCHEMA}.spec_rows WHERE spec_id={sid}),"
                        f"'{room}','{prod}','{cat}','{unit}',{qty},{price},'{sup}','{note}') RETURNING id,position")
            r = cur.fetchone(); db.commit(); db.close()
            return ok({'id':r[0],'position':r[1],'product':prod,'qty':qty,'price':price})

        if method == 'PUT' and row_id:
            fields = []
            for col in ['room','product','category','unit','supplier','note']:
                if col in body: fields.append(f"{col}='{str(body[col]).replace(chr(39),chr(39)*2)}'")
            if 'qty' in body: fields.append(f"qty={float(body['qty'])}")
            if 'price' in body: fields.append(f"price={int(body['price'])}")
            if fields:
                cur = db.cursor()
                cur.execute(f"UPDATE {SCHEMA}.spec_rows SET {','.join(fields)} WHERE id={row_id}")
                db.commit()
            db.close(); return ok({'ok':True})

        if method == 'DELETE' and row_id:
            cur = db.cursor()
            cur.execute(f"UPDATE {SCHEMA}.spec_rows SET product='__deleted__' WHERE id={row_id}")
            db.commit(); db.close(); return ok({'ok':True})

    # ── SPECS ─────────────────────────────────────────────────────────────
    if '/specs' in path:
        if method == 'GET':
            pid = int(qs.get('project_id',0))
            cur = db.cursor()
            cur.execute(f"SELECT id,project_id,spec_name,created_at FROM {SCHEMA}.specs WHERE project_id={pid} ORDER BY created_at")
            rows = cur.fetchall(); db.close()
            return ok([{'id':r[0],'project_id':r[1],'name':r[2]} for r in rows])

        if method == 'POST':
            pid = int(body.get('project_id',0))
            name = body.get('name','Спецификация').replace("'","''")
            cur = db.cursor()
            cur.execute(f"INSERT INTO {SCHEMA}.specs (project_id,spec_name,created_at) VALUES ({pid},'{name}',NOW()) RETURNING id")
            new_id = cur.fetchone()[0]; db.commit(); db.close()
            return ok({'id':new_id,'name':name,'project_id':pid})

    # ── ORDERS ────────────────────────────────────────────────────────────
    if '/orders' in path:
        parts = [p for p in path.strip('/').split('/') if p]
        order_id = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 0

        if method == 'GET':
            cur = db.cursor()
            if member['is_admin']:
                cur.execute(f"SELECT o.id,o.member_id,m.full_name,o.order_number,o.total,o.items_count,o.status,o.suppliers,o.created_at "
                            f"FROM {SCHEMA}.orders o JOIN {SCHEMA}.members m ON m.id=o.member_id ORDER BY o.created_at DESC")
            else:
                cur.execute(f"SELECT id,member_id,NULL,order_number,total,items_count,status,suppliers,created_at "
                            f"FROM {SCHEMA}.orders WHERE member_id={mid} ORDER BY created_at DESC")
            rows = cur.fetchall(); db.close()
            return ok([{'id':r[0],'member_id':r[1],'member_name':r[2],'order_number':r[3],
                        'total':r[4] or 0,'items_count':r[5] or 0,'status':r[6],
                        'suppliers':r[7] or [],'date':r[8].strftime('%d.%m.%Y') if r[8] else ''} for r in rows])

        if method == 'POST':
            total = int(body.get('total',0))
            items_count = int(body.get('items_count',0))
            suppliers = body.get('suppliers',[])
            order_number = 'ORD-'+str(random.randint(1000,9999))
            sup_arr = '{'+','.join(f'"{s}"' for s in suppliers)+'}'
            cur = db.cursor()
            cur.execute(f"INSERT INTO {SCHEMA}.orders (member_id,order_number,total,items_count,status,suppliers,created_at) "
                        f"VALUES ({mid},'{order_number}',{total},{items_count},'Сборка','{sup_arr}',NOW()) RETURNING id")
            new_id = cur.fetchone()[0]; db.commit(); db.close()
            return ok({'id':new_id,'order_number':order_number,'status':'Сборка'})

        if method == 'PUT' and order_id:
            status = body.get('status','Сборка').replace("'","''")
            cur = db.cursor()
            cur.execute(f"UPDATE {SCHEMA}.orders SET status='{status}' WHERE id={order_id}")
            db.commit(); db.close(); return ok({'ok':True})

    # ── ADMIN ─────────────────────────────────────────────────────────────
    if '/admin' in path:
        if not member['is_admin']:
            db.close(); return err(403, 'forbidden')

        if '/stats' in path:
            cur = db.cursor()
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.members"); tm = cur.fetchone()[0]
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.members WHERE is_verified=TRUE"); vm = cur.fetchone()[0]
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.projects"); tp = cur.fetchone()[0]
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.orders"); to_ = cur.fetchone()[0]
            cur.execute(f"SELECT COALESCE(SUM(total),0) FROM {SCHEMA}.orders"); gmv = cur.fetchone()[0]
            db.close()
            return ok({'total_members':tm,'verified_members':vm,'pending_verification':tm-vm,
                       'total_projects':tp,'total_orders':to_,'total_gmv':int(gmv or 0)})

        if '/members' in path and method == 'GET':
            cur = db.cursor()
            cur.execute(f"SELECT m.id,m.full_name,m.email,m.mtype,m.is_admin,m.is_verified,m.created_at,"
                        f"(SELECT COUNT(*) FROM {SCHEMA}.projects p WHERE p.member_id=m.id),"
                        f"(SELECT COUNT(*) FROM {SCHEMA}.orders o WHERE o.member_id=m.id) "
                        f"FROM {SCHEMA}.members m ORDER BY m.created_at DESC")
            rows = cur.fetchall(); db.close()
            return ok([{'id':r[0],'name':r[1],'email':r[2],'role':r[3],'is_admin':r[4],'is_verified':r[5],
                        'created_at':r[6].strftime('%d.%m.%Y') if r[6] else '','projects_count':r[7],'orders_count':r[8]} for r in rows])

        parts = [p for p in path.strip('/').split('/') if p]
        uid = next((int(p) for p in parts if p.isdigit()), 0)

        if '/verify' in path and method == 'PUT' and uid:
            cur = db.cursor()
            cur.execute(f"UPDATE {SCHEMA}.members SET is_verified=TRUE WHERE id={uid}")
            db.commit(); db.close(); return ok({'ok':True})

        if '/block' in path and method == 'PUT' and uid:
            blocked = body.get('blocked', True)
            val = 'FALSE' if blocked else 'TRUE'
            cur = db.cursor()
            cur.execute(f"UPDATE {SCHEMA}.members SET is_verified={val} WHERE id={uid}")
            db.commit(); db.close(); return ok({'ok':True})

    db.close()
    return err(404, 'not found')
