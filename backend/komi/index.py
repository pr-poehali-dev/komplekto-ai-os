"""
KOMI AI — умный ассистент KOMPLEKTO.
Анализ рынка, поставщики, спецификации, бюджеты, советы по закупкам.
POST / — задать вопрос
GET /history — история диалога
"""
import json, os, hashlib, psycopg2
from datetime import datetime

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p96360387_komplekto_ai_os')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
}

MARKET = {
    'Керамогранит': {'trend': '+6%', 'dir': 'up', 'note': 'Рост спроса перед сезоном. Рекомендуем закупить сейчас — ожидается дефицит.'},
    'Сантехника': {'trend': '0%', 'dir': 'flat', 'note': 'Цены стабильны. Grohe и Duravit держат позиции.'},
    'Освещение': {'trend': '+3%', 'dir': 'up', 'note': 'Импортный премиум дорожает. Рассмотрите альтернативы.'},
    'Мебель': {'trend': '−2%', 'dir': 'down', 'note': 'Снижение из-за конкуренции. Выгодное время для закупок.'},
    'Отделочные материалы': {'trend': '+4%', 'dir': 'up', 'note': 'Дефицит позиций из Европы.'},
    'Двери': {'trend': '+1%', 'dir': 'flat', 'note': 'Рынок умеренно растёт. Скрытый монтаж в тренде.'},
}

SUPPLIERS = [
    {'name': 'СтройОпт', 'rating': 4.8, 'delivery': 3, 'idx': 92, 'spec': 'широкий ассортимент, быстрая доставка'},
    {'name': 'ПлиткаПро', 'rating': 4.6, 'delivery': 5, 'idx': 88, 'spec': 'лучшая цена на плитку и керамогранит'},
    {'name': 'LightHouse', 'rating': 4.9, 'delivery': 7, 'idx': 105, 'spec': 'премиум освещение, топ по рейтингу'},
    {'name': 'MebelLux', 'rating': 5.0, 'delivery': 21, 'idx': 120, 'spec': 'высший рейтинг, но долгая доставка'},
    {'name': 'DoorMaster', 'rating': 4.5, 'delivery': 14, 'idx': 96, 'spec': 'скрытый монтаж, межкомнатные двери'},
]

def komi_answer(q: str) -> str:
    t = q.lower()

    if any(w in t for w in ['привет','здравствуй','добрый','хай','hi','hello','start']):
        return ("Привет! Я **KOMI** — AI-ассистент KOMPLEKTO 👋\n\n"
                "Я умею:\n"
                "• 📊 Анализировать рынок стройматериалов\n"
                "• 🏆 Сравнивать поставщиков\n"
                "• 💰 Находить экономию в бюджете\n"
                "• 📋 Генерировать спецификации\n"
                "• 📈 Давать прогнозы цен\n\n"
                "Попробуйте спросить: *«анализ рынка»*, *«сравни поставщиков»*, *«как сэкономить?»*")

    if any(w in t for w in ['рынок','тренд','новост','что дорожает','прогноз','аналитика']):
        month = datetime.now().strftime('%B %Y')
        lines = [f"📊 **Анализ рынка стройматериалов — {month}:**\n"]
        for cat, d in MARKET.items():
            a = '↑' if d['dir']=='up' else ('↓' if d['dir']=='down' else '→')
            lines.append(f"**{cat}** {a} {d['trend']} — {d['note']}")
        lines.append("\n💡 **Главный совет месяца:** керамогранит и отделку закупайте сейчас — ожидается рост +6–8% к лету.")
        return '\n'.join(lines)

    if any(w in t for w in ['дешев','эконом','сократить','снизить','сэкономить','оптимиз','бюджет','расход']):
        return ("💰 **Топ-5 способов сэкономить:**\n\n"
                "1. **Замените Grohe → Hansgrohe** — −15–20%, качество то же\n"
                "2. **ПлиткаПро** — индекс цен 88 (рынок = 100), самые выгодные цены\n"
                "3. **Мебель сейчас** — цены упали −2%, хорошее окно для закупки\n"
                "4. **Консолидируйте заказы** — объединение в 1–2 поставщика даёт скидку объёма\n"
                "5. **Спецификации в KOMPLEKTO** — контроль бюджета по каждой комнате\n\n"
                "📉 Средняя экономия наших клиентов: **−27%** от первоначального бюджета проекта.")

    if any(w in t for w in ['поставщик','сравн','лучш','кому','рейтинг']):
        lines = ["🏆 **Рейтинг поставщиков KOMPLEKTO:**\n"]
        for s in sorted(SUPPLIERS, key=lambda x: -x['rating']):
            badge = ' ⭐' if s['rating'] >= 4.9 else ''
            price = '↓ ниже рынка' if s['idx'] < 100 else ('↑ выше рынка' if s['idx'] > 100 else '≈ рынок')
            lines.append(f"**{s['name']}**{badge} — {s['rating']}★ | доставка {s['delivery']}д | цены {price}\n  _{s['spec']}_")
        lines.append("\n💡 Срочно нужно? → **СтройОпт** (3 дня). Лучшее качество? → **LightHouse** (4.9★)")
        return '\n'.join(lines)

    if any(w in t for w in ['срок','доставк','быстр','когда','ожидани']):
        return ("🚚 **Сроки доставки:**\n\n"
                "• СтройОпт — **3 дня** ✅ самый быстрый\n"
                "• ПлиткаПро — **5 дней**\n"
                "• LightHouse — **7 дней**\n"
                "• DoorMaster — **14 дней** ⚠️\n"
                "• MebelLux — **21 день** ⚠️ риск срыва\n\n"
                "**Совет:** мебель заказывайте в первую очередь — долгий срок тормозит сдачу всего объекта.")

    if any(w in t for w in ['спецификац','составить','перечень','список товаров']):
        return ("📋 **Как работать со спецификациями:**\n\n"
                "1. Откройте проект → вкладка **«Спецификации»**\n"
                "2. Нажмите **«+ Новая спецификация»**\n"
                "3. Добавляйте строки: комната, товар, кол-во, цена\n"
                "4. Бюджет считается автоматически\n"
                "5. Экспорт в PDF/Excel одной кнопкой\n\n"
                "💡 Напишите мне: *«сгенерируй спецификацию для квартиры 80 м²»* — я подготовлю базовый список.")

    if any(w in t for w in ['сгенерируй','создай спец','спек для','базовый список','сделай список']):
        size = 100
        for word in t.split():
            if word.isdigit(): size = int(word); break
        tile_qty = int(size * 0.35)
        budget_est = size * 8500
        return (f"📋 **Базовая спецификация — квартира {size} м²:**\n\n"
                f"**🚿 Санузлы:**\n"
                f"• Керамогранит 60×60 — {tile_qty} м² × 2 400₽ = {tile_qty*2400:,} ₽\n"
                f"• Смеситель Grohe Essence — 3 шт × 18 900₽ = 56 700 ₽\n"
                f"• Унитаз Duravit подвесной — 2 шт × 32 100₽ = 64 200 ₽\n\n"
                f"**💡 Освещение:**\n"
                f"• Подвесной Vibia — 4 шт × 34 500₽ = 138 000 ₽\n"
                f"• Бра Flos — 6 шт × 21 300₽ = 127 800 ₽\n\n"
                f"**🚪 Двери:**\n"
                f"• Скрытый монтаж — {size//20} шт × 42 000₽ = {(size//20)*42000:,} ₽\n\n"
                f"**🎨 Отделка:**\n"
                f"• Little Greene краска — {size//5} банок × 7 800₽ = {(size//5)*7800:,} ₽\n\n"
                f"💰 **Ориентировочный итог: {budget_est:,} ₽**\n"
                f"Хотите добавить этот список в спецификацию проекта? Перейдите во вкладку «Спецификации».")

    if any(w in t for w in ['плитк','керамогранит','кафель']):
        m = MARKET['Керамогранит']
        return (f"🧱 **Керамогранит:**\n\n"
                f"Тренд: {m['trend']} — {m['note']}\n\n"
                f"**Топ позиции:**\n"
                f"• Marazzi 60×60 — 2 400 ₽/м² | рейтинг 4.6 | ПлиткаПро\n"
                f"• Минимальный заказ — от 20 м²\n\n"
                f"💡 Индекс цен у ПлиткаПро = **88** (ниже рынка). Лучший выбор по соотношению цена/качество.")

    if any(w in t for w in ['свет','освещен','лампа','люстра','бра','vibia','flos']):
        m = MARKET['Освещение']
        return (f"💡 **Освещение:**\n\n"
                f"Тренд: {m['trend']} — {m['note']}\n\n"
                f"**Наш выбор:**\n"
                f"• Vibia подвесной — 34 500 ₽ | LightHouse (4.9★)\n"
                f"• Flos бра — 21 300 ₽ | LightHouse\n\n"
                f"⭐ LightHouse — лидер по рейтингу (4.9★). Доставка 7 дней.")

    if any(w in t for w in ['мебел','диван','стол','шкаф','minotti']):
        m = MARKET['Мебель']
        return (f"🛋️ **Мебель:**\n\n"
                f"Тренд: {m['trend']} — {m['note']}\n\n"
                f"**MebelLux** — рейтинг 5.0★, но срок 21 день. Заказывайте **заранее**!\n\n"
                f"💰 Сейчас выгодно: цены снизились. Не упустите окно.")

    if any(w in t for w in ['дверь','двери','скрытый монтаж']):
        m = MARKET['Двери']
        return (f"🚪 **Двери:**\n\n"
                f"Тренд: {m['trend']} — {m['note']}\n\n"
                f"**DoorMaster** — рейтинг 4.5★, доставка 14 дней\n"
                f"Скрытый монтаж особенно в тренде в 2024–2025.\n"
                f"Цена: 42 000 ₽/дверь.")

    if any(w in t for w in ['санте','смеситель','унитаз','grohe','duravit']):
        m = MARKET['Сантехника']
        return (f"🚿 **Сантехника:**\n\n"
                f"Тренд: {m['trend']} — {m['note']}\n\n"
                f"**Топ позиции:**\n"
                f"• Grohe Essence смеситель — 18 900 ₽ | СтройОпт (4.8★)\n"
                f"• Duravit подвесной унитаз — 32 100 ₽ | ПлиткаПро\n\n"
                f"💡 Хотите сэкономить? Hansgrohe — аналог Grohe на 15–20% дешевле.")

    if any(w in t for w in ['верифик','проверк','аккаунт','статус']):
        return ("✅ **Верификация аккаунта:**\n\n"
                "Верификация открывает:\n"
                "• Полный доступ к платформе\n"
                "• Агентский договор и комиссии\n"
                "• Прямые контакты поставщиков\n\n"
                "Администратор проверяет заявки в течение **24–48 часов**.\n"
                "Вопросы: admin@komplekto.ru")

    if any(w in t for w in ['помощь','что умеешь','функции','возможности','справка']):
        return ("🤖 **Возможности KOMI:**\n\n"
                "• 📊 *«анализ рынка»* — тренды цен по категориям\n"
                "• 🏆 *«сравни поставщиков»* — рейтинг, сроки, цены\n"
                "• 💰 *«как сэкономить»* — топ советов по оптимизации\n"
                "• 📋 *«создай спецификацию»* — базовый список для объекта\n"
                "• 🚚 *«сроки доставки»* — что и когда придёт\n"
                "• 🧱 Любой вопрос по конкретному товару или поставщику")

    return ("🤔 Отличный вопрос! Уточните, пожалуйста:\n\n"
            "• По какой категории? (плитка, мебель, свет, двери...)\n"
            "• Нужен анализ рынка или сравнение поставщиков?\n"
            "• Или помочь со спецификацией конкретного проекта?\n\n"
            "Попробуйте: *«анализ рынка»*, *«сравни поставщиков»*, *«сгенерируй спецификацию для квартиры 120 м²»*")


def get_member(token, db):
    cur = db.cursor()
    cur.execute(f"SELECT id, full_name, email FROM {SCHEMA}.members")
    for r in cur.fetchall():
        t = hashlib.sha256(f"{r[0]}:{r[2]}:komplekto_secret_2024".encode()).hexdigest()[:32]
        if t == token:
            return {'id': r[0], 'name': r[1]}
    return None

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    token = (event.get('headers') or {}).get('X-Auth-Token', '')
    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')

    db = psycopg2.connect(os.environ['DATABASE_URL'])
    member = get_member(token, db)
    if not member:
        db.close()
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'unauthorized'})}

    if method == 'GET' and '/history' in path:
        cur = db.cursor()
        cur.execute(f"SELECT sender, message FROM {SCHEMA}.komi_messages "
                    f"WHERE member_id={member['id']} ORDER BY created_at DESC LIMIT 60")
        rows = cur.fetchall(); db.close()
        return {'statusCode': 200, 'headers': CORS,
                'body': json.dumps([{'from': r[0], 'text': r[1]} for r in reversed(rows)])}

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        question = body.get('message', '').strip()
        if not question:
            db.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'empty'})}
        answer = komi_answer(question)
        cur = db.cursor()
        q_s = question.replace("'", "''"); a_s = answer.replace("'", "''")
        cur.execute(f"INSERT INTO {SCHEMA}.komi_messages (member_id,sender,message,created_at) VALUES ({member['id']},'user','{q_s}',NOW())")
        cur.execute(f"INSERT INTO {SCHEMA}.komi_messages (member_id,sender,message,created_at) VALUES ({member['id']},'komi','{a_s}',NOW())")
        db.commit(); db.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'answer': answer})}

    db.close()
    return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'not found'})}
