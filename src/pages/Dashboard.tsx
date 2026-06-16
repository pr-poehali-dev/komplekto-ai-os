import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useStore, Project, Spec, SpecRow } from '@/lib/store';
import KomiChat from '@/components/KomiChat';
import { products, suppliers, categories, komiInsights, fmt } from '@/lib/data';

const menu = [
  { id: 'home', label: 'Главная', icon: 'LayoutDashboard' },
  { id: 'projects', label: 'Проекты', icon: 'FolderKanban' },
  { id: 'specs', label: 'Спецификации', icon: 'Table2' },
  { id: 'catalog', label: 'Каталог', icon: 'Package' },
  { id: 'cart', label: 'Заказы', icon: 'ShoppingCart' },
  { id: 'suppliers', label: 'Поставщики', icon: 'Users' },
  { id: 'analytics', label: 'Аналитика', icon: 'LineChart' },
  { id: 'market', label: 'Market Intel', icon: 'Globe2' },
];

// ── Specs module ──────────────────────────────────────────────────────────────
const SpecsModule = () => {
  const { projects, loadProjects, specs, loadSpecs, createSpec, specRows, loadSpecRows, addSpecRow, updateSpecRow, deleteSpecRow } = useStore();
  const [selProject, setSelProject] = useState<Project | null>(null);
  const [selSpec, setSelSpec] = useState<Spec | null>(null);
  const [newSpecName, setNewSpecName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editRow, setEditRow] = useState<Partial<SpecRow>>({});
  const [showAddRow, setShowAddRow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingCell, setEditingCell] = useState<{ id: number; field: string } | null>(null);

  useEffect(() => { if (!projects.length) loadProjects(); }, [projects.length, loadProjects]);

  const selectProject = useCallback(async (p: Project) => {
    setSelProject(p); setSelSpec(null);
    await loadSpecs(p.id);
  }, [loadSpecs]);

  const selectSpec = useCallback(async (s: Spec) => {
    setSelSpec(s); setLoading(true);
    await loadSpecRows(s.id);
    setLoading(false);
  }, [loadSpecRows]);

  const handleCreateSpec = async () => {
    if (!selProject || !newSpecName.trim()) return;
    const s = await createSpec(selProject.id, newSpecName);
    setNewSpecName(''); setCreating(false);
    await selectSpec(s);
  };

  const handleAddRow = async () => {
    if (!selSpec || !editRow.product?.trim()) return;
    await addSpecRow({ spec_id: selSpec.id, product: editRow.product || '', room: editRow.room || '', category: editRow.category || '', unit: editRow.unit || 'шт', qty: editRow.qty || 1, price: editRow.price || 0, supplier: editRow.supplier || '', note: editRow.note || '' });
    setEditRow({}); setShowAddRow(false);
  };

  const handleCellEdit = async (id: number, field: string, value: string | number) => {
    await updateSpecRow(id, { [field]: value });
    setEditingCell(null);
  };

  const total = specRows.reduce((s, r) => s + (r.price * r.qty), 0);

  if (!selProject) return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="font-display font-black text-3xl">Спецификации</h1>
      <p className="text-muted-foreground">Выберите проект для работы со спецификациями</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(p => (
          <button key={p.id} onClick={() => selectProject(p)}
            className="glass rounded-2xl p-5 text-left hover:border-komi/30 transition-all hover:-translate-y-0.5">
            <div className="text-3xl mb-3">{p.cover}</div>
            <div className="font-semibold">{p.name}</div>
            <div className="text-sm text-muted-foreground mt-1">{p.type}</div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setSelProject(null)} className="text-muted-foreground hover:text-komi transition-colors text-sm">Проекты</button>
        <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
        <button onClick={() => setSelSpec(null)} className={`text-sm ${!selSpec ? 'text-komi' : 'text-muted-foreground hover:text-komi transition-colors'}`}>{selProject.name}</button>
        {selSpec && <>
          <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
          <span className="text-sm text-komi">{selSpec.name}</span>
        </>}
      </div>

      {!selSpec ? (
        <>
          <div className="flex items-center justify-between">
            <h1 className="font-display font-bold text-2xl">Спецификации проекта</h1>
            {!creating ? (
              <Button onClick={() => setCreating(true)} className="bg-komi hover:bg-komi-glow text-background rounded-xl">
                <Icon name="Plus" size={16} className="mr-1" /> Новая спецификация
              </Button>
            ) : (
              <div className="flex gap-2">
                <Input value={newSpecName} onChange={e => setNewSpecName(e.target.value)} placeholder="Название спецификации"
                  className="bg-white/5 border-white/10 h-10 rounded-xl w-56" onKeyDown={e => e.key === 'Enter' && handleCreateSpec()} />
                <Button onClick={handleCreateSpec} className="bg-komi hover:bg-komi-glow text-background rounded-xl h-10">Создать</Button>
                <Button onClick={() => setCreating(false)} variant="ghost" className="h-10 rounded-xl">Отмена</Button>
              </div>
            )}
          </div>
          {specs.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <Icon name="Table2" size={40} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Нет спецификаций. Создайте первую!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {specs.map(s => (
                <button key={s.id} onClick={() => selectSpec(s)}
                  className="glass rounded-2xl p-5 text-left hover:border-komi/30 transition-all hover:-translate-y-0.5">
                  <Icon name="FileSpreadsheet" size={28} className="text-komi mb-3" />
                  <div className="font-semibold">{s.name}</div>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h1 className="font-display font-bold text-2xl">{selSpec.name}</h1>
            <div className="flex items-center gap-3">
              <div className="glass-komi rounded-xl px-4 py-2 text-sm">
                Итого: <span className="font-display font-bold text-komi">{fmt(total)}</span>
              </div>
              <Button onClick={() => setShowAddRow(true)} className="bg-komi hover:bg-komi-glow text-background rounded-xl">
                <Icon name="Plus" size={16} className="mr-1" /> Добавить строку
              </Button>
            </div>
          </div>

          {showAddRow && (
            <div className="glass rounded-2xl p-5 space-y-3">
              <h3 className="font-semibold text-sm">Новая позиция</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                <Input placeholder="Комната" value={editRow.room || ''} onChange={e => setEditRow(r => ({ ...r, room: e.target.value }))} className="bg-white/5 border-white/10 h-10 rounded-xl text-sm" />
                <Input placeholder="Товар *" value={editRow.product || ''} onChange={e => setEditRow(r => ({ ...r, product: e.target.value }))} className="bg-white/5 border-white/10 h-10 rounded-xl text-sm" />
                <Input placeholder="Категория" value={editRow.category || ''} onChange={e => setEditRow(r => ({ ...r, category: e.target.value }))} className="bg-white/5 border-white/10 h-10 rounded-xl text-sm" />
                <Input placeholder="Ед. изм." value={editRow.unit || ''} onChange={e => setEditRow(r => ({ ...r, unit: e.target.value }))} className="bg-white/5 border-white/10 h-10 rounded-xl text-sm" />
                <Input type="number" placeholder="Кол-во" value={editRow.qty || ''} onChange={e => setEditRow(r => ({ ...r, qty: Number(e.target.value) }))} className="bg-white/5 border-white/10 h-10 rounded-xl text-sm" />
                <Input type="number" placeholder="Цена ₽" value={editRow.price || ''} onChange={e => setEditRow(r => ({ ...r, price: Number(e.target.value) }))} className="bg-white/5 border-white/10 h-10 rounded-xl text-sm" />
                <Input placeholder="Поставщик" value={editRow.supplier || ''} onChange={e => setEditRow(r => ({ ...r, supplier: e.target.value }))} className="bg-white/5 border-white/10 h-10 rounded-xl text-sm" />
                <Input placeholder="Примечание" value={editRow.note || ''} onChange={e => setEditRow(r => ({ ...r, note: e.target.value }))} className="bg-white/5 border-white/10 h-10 rounded-xl text-sm" />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddRow} className="bg-komi hover:bg-komi-glow text-background rounded-xl">Добавить</Button>
                <Button onClick={() => { setShowAddRow(false); setEditRow({}); }} variant="ghost" className="rounded-xl">Отмена</Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="glass rounded-2xl p-10 text-center"><div className="text-muted-foreground">Загрузка...</div></div>
          ) : specRows.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <Icon name="Table2" size={36} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Нет позиций. Добавьте первую строку.</p>
            </div>
          ) : (
            <div className="glass rounded-2xl overflow-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs">
                    {['Комната', 'Товар', 'Категория', 'Ед.', 'Кол-во', 'Цена', 'Поставщик', 'Сумма', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {specRows.map(row => (
                    <tr key={row.id} className="border-b border-border/50 hover:bg-white/3 transition-colors">
                      {(['room', 'product', 'category', 'unit'] as const).map(field => (
                        <td key={field} className="px-4 py-2.5" onClick={() => setEditingCell({ id: row.id, field })}>
                          {editingCell?.id === row.id && editingCell.field === field ? (
                            <Input defaultValue={String(row[field] || '')} autoFocus className="bg-white/10 border-komi/50 h-8 rounded-lg text-xs w-full"
                              onBlur={e => handleCellEdit(row.id, field, e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleCellEdit(row.id, field, (e.target as HTMLInputElement).value)} />
                          ) : <span className="cursor-pointer hover:text-komi transition-colors">{String(row[field] || '—')}</span>}
                        </td>
                      ))}
                      {(['qty', 'price'] as const).map(field => (
                        <td key={field} className="px-4 py-2.5" onClick={() => setEditingCell({ id: row.id, field })}>
                          {editingCell?.id === row.id && editingCell.field === field ? (
                            <Input type="number" defaultValue={row[field]} autoFocus className="bg-white/10 border-komi/50 h-8 rounded-lg text-xs w-20"
                              onBlur={e => handleCellEdit(row.id, field, Number(e.target.value))}
                              onKeyDown={e => e.key === 'Enter' && handleCellEdit(row.id, field, Number((e.target as HTMLInputElement).value))} />
                          ) : <span className="cursor-pointer hover:text-komi transition-colors">{field === 'price' ? fmt(row.price) : row.qty}</span>}
                        </td>
                      ))}
                      <td className="px-4 py-2.5" onClick={() => setEditingCell({ id: row.id, field: 'supplier' })}>
                        {editingCell?.id === row.id && editingCell.field === 'supplier' ? (
                          <Input defaultValue={row.supplier || ''} autoFocus className="bg-white/10 border-komi/50 h-8 rounded-lg text-xs w-full"
                            onBlur={e => handleCellEdit(row.id, 'supplier', e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCellEdit(row.id, 'supplier', (e.target as HTMLInputElement).value)} />
                        ) : <span className="cursor-pointer hover:text-komi transition-colors">{row.supplier || '—'}</span>}
                      </td>
                      <td className="px-4 py-2.5 font-display font-semibold text-komi">{fmt(row.price * row.qty)}</td>
                      <td className="px-4 py-2.5">
                        <button onClick={() => deleteSpecRow(row.id)} className="text-muted-foreground hover:text-red-400 transition-colors">
                          <Icon name="Trash2" size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border bg-white/3">
                    <td colSpan={7} className="px-4 py-3 text-sm font-semibold text-muted-foreground">Итого</td>
                    <td className="px-4 py-3 font-display font-bold text-komi text-base">{fmt(total)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── Admin Panel ───────────────────────────────────────────────────────────────
const AdminPanel = () => {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [members, setMembers] = useState<Array<Record<string, unknown>>>([]);
  const [orders, setOrders] = useState<Array<Record<string, unknown>>>([]);
  const [tab, setTab] = useState<'stats' | 'members' | 'orders'>('stats');
  const { api: apiRef } = useStore() as unknown as { api: unknown };
  void apiRef;
  const { loadOrders } = useStore();

  useEffect(() => {
    import('@/lib/api').then(({ api }) => {
      api.adminStats().then(setStats);
      api.adminMembers().then(setMembers);
      api.getOrders().then(setOrders);
    });
  }, [loadOrders]);

  const handleVerify = async (id: number) => {
    const { api } = await import('@/lib/api');
    await api.adminVerify(id);
    setMembers(prev => prev.map(m => m.id === id ? { ...m, is_verified: true } : m));
  };

  const handleBlock = async (id: number, blocked: boolean) => {
    const { api } = await import('@/lib/api');
    await api.adminBlock(id, blocked);
    setMembers(prev => prev.map(m => m.id === id ? { ...m, is_verified: !blocked } : m));
  };

  const handleOrderStatus = async (id: number, status: string) => {
    const { api } = await import('@/lib/api');
    await api.updateOrderStatus(id, status);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const statuses = ['Сборка', 'Отправлен', 'Доставлен', 'Отменён'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-komi/20 flex items-center justify-center">
          <Icon name="Shield" size={20} className="text-komi" />
        </div>
        <h1 className="font-display font-black text-3xl">Админ-панель</h1>
      </div>

      <div className="flex gap-2">
        {(['stats', 'members', 'orders'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t ? 'bg-komi text-background' : 'glass text-muted-foreground hover:text-foreground'}`}>
            {t === 'stats' ? 'Статистика' : t === 'members' ? 'Пользователи' : 'Заказы'}
          </button>
        ))}
      </div>

      {tab === 'stats' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { l: 'Всего пользователей', v: stats.total_members, i: 'Users' },
            { l: 'Верифицировано', v: stats.verified_members, i: 'ShieldCheck' },
            { l: 'Ожидают верификации', v: stats.pending_verification, i: 'Clock' },
            { l: 'Проектов', v: stats.total_projects, i: 'FolderKanban' },
            { l: 'Заказов', v: stats.total_orders, i: 'ShoppingCart' },
            { l: 'Оборот', v: fmt(stats.total_gmv || 0), i: 'TrendingUp' },
          ].map(s => (
            <div key={s.l} className="glass rounded-2xl p-5">
              <Icon name={s.i} size={22} className="text-komi mb-3" />
              <div className="font-display font-bold text-2xl">{s.v ?? '—'}</div>
              <div className="text-sm text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'members' && (
        <div className="glass rounded-2xl overflow-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs">
                {['Пользователь', 'Email', 'Тип', 'Проекты', 'Заказы', 'Статус', 'Действия'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={String(m.id)} className="border-b border-border/50 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-komi/15 flex items-center justify-center text-komi text-xs font-bold">
                        {String(m.name || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{String(m.name)}</div>
                        {m.is_admin && <div className="text-[10px] text-komi">Администратор</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{String(m.email)}</td>
                  <td className="px-4 py-3">{String(m.role || m.mtype || '—')}</td>
                  <td className="px-4 py-3 text-center">{String(m.projects_count || 0)}</td>
                  <td className="px-4 py-3 text-center">{String(m.orders_count || 0)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs rounded-full px-2.5 py-1 ${m.is_verified ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                      {m.is_verified ? 'Верифицирован' : 'Ожидает'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {!m.is_admin && (
                      <div className="flex gap-2">
                        {!m.is_verified && (
                          <button onClick={() => handleVerify(Number(m.id))}
                            className="text-xs bg-green-500/20 text-green-400 rounded-lg px-2.5 py-1 hover:bg-green-500/30 transition-colors">
                            Верифицировать
                          </button>
                        )}
                        <button onClick={() => handleBlock(Number(m.id), Boolean(m.is_verified))}
                          className={`text-xs rounded-lg px-2.5 py-1 transition-colors ${m.is_verified ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-white/10 text-muted-foreground hover:bg-white/15'}`}>
                          {m.is_verified ? 'Заблокировать' : 'Разблокировать'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={String(o.id)} className="glass rounded-2xl p-4 flex items-center gap-4 flex-wrap">
              <div className="h-10 w-10 rounded-xl bg-komi/15 flex items-center justify-center">
                <Icon name="Package" size={18} className="text-komi" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{String(o.order_number)}</div>
                <div className="text-xs text-muted-foreground">
                  {String(o.member_name || '')} · {String(o.date || '')} · {String(o.items_count || 0)} поз.
                </div>
              </div>
              <div className="font-display font-bold">{fmt(Number(o.total || 0))}</div>
              <select value={String(o.status)} onChange={e => handleOrderStatus(Number(o.id), e.target.value)}
                className="glass rounded-xl px-3 py-1.5 text-sm bg-white/5 border border-white/10 text-foreground">
                {statuses.map(s => <option key={s} value={s} className="bg-background">{s}</option>)}
              </select>
            </div>
          ))}
          {!orders.length && <div className="glass rounded-2xl p-10 text-center text-muted-foreground">Заказов пока нет</div>}
        </div>
      )}
    </div>
  );
};

// ── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user, loading, logout, projects, loadProjects, createProject, cart, addToCart, removeFromCart, setQty, orders, loadOrders, checkout } = useStore();
  const nav = useNavigate();
  const [tab, setTab] = useState('home');
  const [cat, setCat] = useState('Все');
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newProjModal, setNewProjModal] = useState(false);
  const [newProj, setNewProj] = useState({ name: '', type: 'Квартира', budget: '' });
  const [projLoading, setProjLoading] = useState(false);

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const filtered = useMemo(
    () => products.filter(p => (cat === 'Все' || p.category === cat) && p.name.toLowerCase().includes(search.toLowerCase())),
    [cat, search]
  );
  const supplierGroups = useMemo(() => {
    const g: Record<string, typeof cart> = {};
    cart.forEach(i => { (g[i.supplier] ||= []).push(i); });
    return g;
  }, [cart]);
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = projects.reduce((s, p) => s + p.spent, 0);

  useEffect(() => {
    if (user && !loading) {
      loadProjects();
      loadOrders();
    }
  }, [user, loading, loadProjects, loadOrders]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <div className="h-12 w-12 rounded-xl bg-komi flex items-center justify-center mx-auto komi-glow">
          <Icon name="Boxes" size={24} className="text-background" />
        </div>
        <div className="text-muted-foreground text-sm">Загрузка KOMPLEKTO...</div>
      </div>
    </div>
  );

  if (!user) { nav('/auth'); return null; }

  const handleCreateProject = async () => {
    if (!newProj.name.trim()) return;
    setProjLoading(true);
    const covers = ['🏙️', '🏡', '🏢', '🏨', '🏬'];
    await createProject({ name: newProj.name, type: newProj.type, budget: Number(newProj.budget) || 0, cover: covers[Math.floor(Math.random() * covers.length)] });
    setNewProj({ name: '', type: 'Квартира', budget: '' });
    setNewProjModal(false); setProjLoading(false);
    setTab('projects');
  };

  const goTab = (t: string) => { setTab(t); setSidebarOpen(false); };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* SIDEBAR */}
      <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-60 glass border-r border-border flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 flex items-center gap-2.5 border-b border-border">
          <div className="h-8 w-8 rounded-lg bg-komi flex items-center justify-center komi-glow shrink-0">
            <Icon name="Boxes" size={18} className="text-background" />
          </div>
          <span className="font-display font-extrabold">KOMPLEKTO</span>
        </div>

        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
          {menu.map(m => (
            <button key={m.id} onClick={() => goTab(m.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === m.id ? 'bg-komi text-background' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}>
              <Icon name={m.icon} size={17} />
              {m.label}
              {m.id === 'cart' && cartCount > 0 && (
                <span className={`ml-auto text-xs rounded-full px-2 py-0.5 ${tab === m.id ? 'bg-background/20' : 'bg-komi text-background'}`}>{cartCount}</span>
              )}
            </button>
          ))}
          {user.is_admin && (
            <button onClick={() => goTab('admin')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mt-2 border-t border-border pt-3 ${tab === 'admin' ? 'bg-komi text-background' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}>
              <Icon name="Shield" size={17} />
              Админ-панель
            </button>
          )}
        </nav>

        <div className="p-3 border-t border-border">
          {!user.is_verified && (
            <div className="glass-komi rounded-xl p-3 mb-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 text-komi mb-1"><Icon name="Clock" size={13} />Верификация</div>
              Аккаунт на проверке. Откроет полный доступ.
            </div>
          )}
          <div className="flex items-center gap-3 px-1.5 py-1.5">
            <div className="h-8 w-8 rounded-full bg-komi/20 flex items-center justify-center text-komi font-bold text-sm shrink-0">
              {user.name[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user.role}</div>
            </div>
            <button onClick={() => { logout(); nav('/'); }} className="text-muted-foreground hover:text-komi transition-colors">
              <Icon name="LogOut" size={17} />
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* MAIN */}
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 glass border-b border-border px-5 py-3 flex items-center gap-3">
          <button className="lg:hidden shrink-0" onClick={() => setSidebarOpen(true)}>
            <Icon name="Menu" size={22} />
          </button>
          <div className="relative flex-1 max-w-sm">
            <Icon name="Search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => { setSearch(e.target.value); if (e.target.value) setTab('catalog'); }}
              placeholder="Поиск товаров..." className="bg-white/5 border-white/10 h-9 rounded-xl pl-9 text-sm" />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button onClick={() => setNewProjModal(true)} variant="outline" size="sm"
              className="hidden sm:flex border-white/15 bg-white/5 hover:bg-white/10 rounded-xl text-sm gap-1.5">
              <Icon name="Plus" size={15} />Проект
            </Button>
            <Button onClick={() => goTab('cart')} variant="outline" size="icon"
              className="relative border-white/15 bg-white/5 hover:bg-white/10 rounded-xl h-9 w-9">
              <Icon name="ShoppingCart" size={17} />
              {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-komi text-background text-[10px] flex items-center justify-center font-bold">{cartCount}</span>}
            </Button>
          </div>
        </header>

        <div className="flex-1 p-5 md:p-7 max-w-7xl w-full">

          {/* HOME */}
          {tab === 'home' && (
            <div className="space-y-7 animate-fade-in">
              <div>
                <h1 className="font-display font-black text-3xl md:text-4xl mb-1">
                  Добро пожаловать, {user.name.split(' ')[0]} 👋
                </h1>
                <p className="text-muted-foreground">Сводка по проектам и инсайты KOMI</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { l: 'Проектов', v: projects.length, i: 'FolderKanban' },
                  { l: 'Общий бюджет', v: fmt(totalBudget), i: 'Wallet' },
                  { l: 'Освоено', v: fmt(totalSpent), i: 'TrendingUp' },
                  { l: 'Заказов', v: orders.length, i: 'ShoppingCart' },
                ].map(s => (
                  <div key={s.l} className="glass rounded-2xl p-4">
                    <Icon name={s.i} size={19} className="text-komi mb-2.5" />
                    <div className="font-display font-bold text-lg">{s.v}</div>
                    <div className="text-xs text-muted-foreground">{s.l}</div>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="Sparkles" size={18} className="text-komi" />
                  <h2 className="font-display font-bold text-lg">Инсайты KOMI</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  {komiInsights.map(k => (
                    <div key={k.title} className="glass-komi rounded-2xl p-4">
                      <Icon name={k.icon} size={20} className={k.tone === 'good' ? 'text-green-400' : 'text-komi'} />
                      <h3 className="font-semibold mt-2.5 mb-1">{k.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{k.text}</p>
                    </div>
                  ))}
                </div>
              </div>
              {projects.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-display font-bold text-lg">Активные проекты</h2>
                    <button onClick={() => setTab('projects')} className="text-komi text-sm flex items-center gap-1 hover:underline">
                      Все <Icon name="ArrowRight" size={14} />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {projects.slice(0, 2).map(p => (
                      <div key={p.id} className="glass rounded-2xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-11 w-11 rounded-xl bg-white/5 flex items-center justify-center text-2xl">{p.cover}</div>
                          <div><div className="font-semibold">{p.name}</div><div className="text-xs text-muted-foreground">{p.type}</div></div>
                        </div>
                        <Progress value={p.progress} className="h-1.5 mb-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{fmt(p.spent)}</span><span>{p.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PROJECTS */}
          {tab === 'projects' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <h1 className="font-display font-black text-3xl">Проекты</h1>
                <Button onClick={() => setNewProjModal(true)} className="bg-komi hover:bg-komi-glow text-background font-semibold rounded-xl">
                  <Icon name="Plus" size={17} className="mr-1" /> Новый проект
                </Button>
              </div>
              {projects.length === 0 ? (
                <div className="glass rounded-2xl p-10 text-center">
                  <Icon name="FolderKanban" size={40} className="text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">Нет проектов. Создайте первый!</p>
                  <Button onClick={() => setNewProjModal(true)} className="bg-komi hover:bg-komi-glow text-background rounded-xl">Создать проект</Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map(p => (
                    <div key={p.id} className="glass rounded-2xl p-5 hover:border-komi/30 transition-colors cursor-pointer" onClick={() => { setTab('specs'); }}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl">{p.cover}</div>
                        <span className={`text-xs rounded-full px-2.5 py-1 ${p.status === 'Завершён' ? 'bg-green-500/15 text-green-400' : p.status === 'В работе' ? 'bg-komi/15 text-komi' : 'bg-white/10 text-muted-foreground'}`}>
                          {p.status}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-base mb-0.5">{p.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{p.type}</p>
                      <Progress value={p.progress} className="h-1.5 mb-2.5" />
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><div className="text-muted-foreground text-xs">Бюджет</div><div className="font-medium">{fmt(p.budget)}</div></div>
                        <div><div className="text-muted-foreground text-xs">Позиций</div><div className="font-medium">{p.items}</div></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SPECS */}
          {tab === 'specs' && <SpecsModule />}

          {/* CATALOG */}
          {tab === 'catalog' && (
            <div className="space-y-5 animate-fade-in">
              <h1 className="font-display font-black text-3xl">Каталог</h1>
              <div className="flex gap-2 flex-wrap">
                {['Все', ...categories].map(c => (
                  <button key={c} onClick={() => setCat(c)}
                    className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-colors ${cat === c ? 'bg-komi text-background' : 'glass text-muted-foreground hover:text-foreground'}`}>{c}</button>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map(p => (
                  <div key={p.id} className="glass rounded-2xl p-4 hover:-translate-y-0.5 hover:border-komi/30 transition-all">
                    <div className="h-20 rounded-xl bg-white/5 flex items-center justify-center text-5xl mb-3">{p.image}</div>
                    <div className="text-xs text-komi mb-1">{p.category}</div>
                    <h3 className="font-semibold text-sm mb-1.5 leading-snug">{p.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <Icon name="Star" size={11} className="text-komi" />{p.rating} · {p.supplier} · {p.delivery}д
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-sm">{fmt(p.price)}</span>
                      <Button onClick={() => addToCart(p)} size="sm" className="bg-komi hover:bg-komi-glow text-background rounded-lg h-8 w-8 p-0">
                        <Icon name="Plus" size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
                {!filtered.length && <p className="text-muted-foreground col-span-full">Ничего не найдено</p>}
              </div>
            </div>
          )}

          {/* CART */}
          {tab === 'cart' && (
            <div className="space-y-5 animate-fade-in">
              <h1 className="font-display font-black text-3xl">Заказы</h1>
              {cart.length > 0 ? (
                <div className="grid lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-komi glass-komi rounded-xl px-3 py-2">
                      <Icon name="Sparkles" size={15} />KOMI разбил корзину по поставщикам автоматически
                    </div>
                    {Object.entries(supplierGroups).map(([sup, items]) => (
                      <div key={sup} className="glass rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3 font-semibold text-sm">
                          <Icon name="Truck" size={17} className="text-komi" />{sup}
                        </div>
                        <div className="space-y-2.5">
                          {items.map(i => (
                            <div key={i.id} className="flex items-center gap-3">
                              <div className="h-11 w-11 rounded-lg bg-white/5 flex items-center justify-center text-2xl shrink-0">{i.image}</div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{i.name}</div>
                                <div className="text-xs text-muted-foreground">{fmt(i.price)}</div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button onClick={() => setQty(i.id, i.qty - 1)} className="h-7 w-7 rounded-lg glass flex items-center justify-center text-lg leading-none">−</button>
                                <span className="w-5 text-center text-sm">{i.qty}</span>
                                <button onClick={() => setQty(i.id, i.qty + 1)} className="h-7 w-7 rounded-lg glass flex items-center justify-center text-lg leading-none">+</button>
                              </div>
                              <button onClick={() => removeFromCart(i.id)} className="text-muted-foreground hover:text-red-400 transition-colors">
                                <Icon name="Trash2" size={15} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="glass-komi rounded-2xl p-5 h-fit sticky top-20">
                    <h3 className="font-display font-bold text-lg mb-4">Итого</h3>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between"><span className="text-muted-foreground">Позиций</span><span>{cartCount}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Поставщиков</span><span>{Object.keys(supplierGroups).length}</span></div>
                    </div>
                    <div className="flex justify-between font-display font-bold text-xl mb-4 pt-3 border-t border-white/10">
                      <span>Сумма</span><span>{fmt(cartTotal)}</span>
                    </div>
                    <Button onClick={checkout} className="w-full bg-komi hover:bg-komi-glow text-background font-semibold rounded-xl h-11">
                      Оформить заказ <Icon name="ArrowRight" size={16} className="ml-1" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="glass rounded-2xl p-10 text-center">
                  <Icon name="ShoppingCart" size={40} className="text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">Корзина пуста</p>
                  <Button onClick={() => setTab('catalog')} className="bg-komi hover:bg-komi-glow text-background rounded-xl">В каталог</Button>
                </div>
              )}
              {orders.length > 0 && (
                <div>
                  <h2 className="font-display font-bold text-xl mb-3 mt-2">История заказов</h2>
                  <div className="space-y-2.5">
                    {orders.map(o => (
                      <div key={o.id} className="glass rounded-2xl p-4 flex items-center gap-4 flex-wrap">
                        <div className="h-9 w-9 rounded-xl bg-komi/15 flex items-center justify-center">
                          <Icon name="Package" size={17} className="text-komi" />
                        </div>
                        <div><div className="font-medium text-sm">{o.order_number}</div><div className="text-xs text-muted-foreground">{o.date} · {o.items_count} поз.</div></div>
                        <span className="text-xs rounded-full px-3 py-1 bg-komi/15 text-komi">{o.status}</span>
                        <div className="ml-auto font-display font-bold">{fmt(o.total)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUPPLIERS */}
          {tab === 'suppliers' && (
            <div className="space-y-5 animate-fade-in">
              <h1 className="font-display font-black text-3xl">Поставщики</h1>
              <p className="text-muted-foreground -mt-3 text-sm">Сравнение по цене, срокам и рейтингу</p>
              <div className="glass rounded-2xl overflow-hidden">
                <div className="grid grid-cols-5 gap-2 p-4 text-xs text-muted-foreground border-b border-border font-medium">
                  <span className="col-span-2">Поставщик</span><span>Рейтинг</span><span>Доставка</span><span>Цены</span>
                </div>
                {suppliers.map(s => (
                  <div key={s.id} className="grid grid-cols-5 gap-2 p-4 items-center border-b border-border last:border-0 hover:bg-white/3 transition-colors">
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center text-xl">{s.logo}</div>
                      <div><div className="font-medium text-sm">{s.name}</div><div className="text-xs text-muted-foreground">{s.orders} заказов</div></div>
                    </div>
                    <span className="flex items-center gap-1 text-sm"><Icon name="Star" size={13} className="text-komi" />{s.rating}</span>
                    <span className="text-sm">{s.delivery} дн.</span>
                    <span className={`text-sm font-medium ${s.priceIndex < 100 ? 'text-green-400' : 'text-komi'}`}>{s.priceIndex < 100 ? '↓' : '↑'} {s.priceIndex}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {tab === 'analytics' && (
            <div className="space-y-5 animate-fade-in">
              <h1 className="font-display font-black text-3xl">Аналитика</h1>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { l: 'Экономия с KOMI', v: '−27%', i: 'TrendingDown', c: 'text-green-400' },
                  { l: 'Среднее освоение', v: totalBudget ? Math.round((totalSpent / totalBudget) * 100) + '%' : '0%', i: 'Percent', c: 'text-komi' },
                  { l: 'Поставщиков', v: suppliers.length, i: 'Users', c: 'text-komi' },
                ].map(s => (
                  <div key={s.l} className="glass rounded-2xl p-5">
                    <Icon name={s.i} size={21} className={s.c} />
                    <div className="font-display font-black text-3xl mt-2">{s.v}</div>
                    <div className="text-sm text-muted-foreground">{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="glass rounded-2xl p-5">
                <h3 className="font-display font-bold mb-4">Бюджет по проектам</h3>
                {projects.length === 0 ? <p className="text-muted-foreground text-sm">Нет проектов</p> : (
                  <div className="space-y-4">
                    {projects.map(p => (
                      <div key={p.id}>
                        <div className="flex justify-between text-sm mb-1.5"><span>{p.name}</span><span className="text-muted-foreground">{fmt(p.spent)} / {fmt(p.budget)}</span></div>
                        <Progress value={p.progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MARKET */}
          {tab === 'market' && (
            <div className="space-y-5 animate-fade-in">
              <h1 className="font-display font-black text-3xl">Market Intelligence</h1>
              <p className="text-muted-foreground -mt-3 text-sm">Цены, тренды и спрос с объяснениями KOMI</p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { cat: 'Керамогранит', trend: '+6%', dir: 'up', text: 'Рост спроса перед сезоном. Рекомендуем закупить сейчас.' },
                  { cat: 'Сантехника', trend: '0%', dir: 'flat', text: 'Цены стабильны. Хорошее время для плановых закупок.' },
                  { cat: 'Освещение', trend: '+3%', dir: 'up', text: 'Премиум-сегмент дорожает из-за импорта.' },
                  { cat: 'Мебель', trend: '−2%', dir: 'down', text: 'Снижение из-за конкуренции. Выгодные предложения.' },
                  { cat: 'Отделочные материалы', trend: '+4%', dir: 'up', text: 'Дефицит некоторых позиций из Европы.' },
                  { cat: 'Двери', trend: '+1%', dir: 'flat', text: 'Скрытый монтаж в тренде, умеренный рост.' },
                ].map(m => (
                  <div key={m.cat} className="glass rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{m.cat}</h3>
                      <span className={`font-bold ${m.dir === 'up' ? 'text-komi' : m.dir === 'down' ? 'text-green-400' : 'text-muted-foreground'}`}>{m.trend}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{m.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADMIN */}
          {tab === 'admin' && user.is_admin && <AdminPanel />}
        </div>
      </main>

      {/* New Project Modal */}
      {newProjModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-5">
          <div className="glass rounded-3xl p-7 w-full max-w-md animate-scale-in">
            <h2 className="font-display font-bold text-xl mb-5">Новый проект</h2>
            <div className="space-y-3 mb-5">
              <Input placeholder="Название проекта" value={newProj.name} onChange={e => setNewProj(p => ({ ...p, name: e.target.value }))} className="bg-white/5 border-white/10 h-11 rounded-xl" />
              <Input placeholder="Тип (квартира, дом, офис...)" value={newProj.type} onChange={e => setNewProj(p => ({ ...p, type: e.target.value }))} className="bg-white/5 border-white/10 h-11 rounded-xl" />
              <Input type="number" placeholder="Бюджет ₽" value={newProj.budget} onChange={e => setNewProj(p => ({ ...p, budget: e.target.value }))} className="bg-white/5 border-white/10 h-11 rounded-xl" />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCreateProject} disabled={projLoading} className="flex-1 bg-komi hover:bg-komi-glow text-background font-semibold rounded-xl h-11">
                {projLoading ? 'Создание...' : 'Создать проект'}
              </Button>
              <Button onClick={() => setNewProjModal(false)} variant="ghost" className="rounded-xl h-11 px-5">Отмена</Button>
            </div>
          </div>
        </div>
      )}

      <KomiChat />
    </div>
  );
};

export default Dashboard;
