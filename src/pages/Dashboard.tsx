import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useStore } from '@/lib/store';
import KomiChat from '@/components/KomiChat';
import { products, suppliers, categories, komiInsights, fmt } from '@/lib/data';

const menu = [
  { id: 'home', label: 'Главная', icon: 'LayoutDashboard' },
  { id: 'projects', label: 'Проекты', icon: 'FolderKanban' },
  { id: 'catalog', label: 'Каталог', icon: 'Package' },
  { id: 'cart', label: 'Заказы', icon: 'ShoppingCart' },
  { id: 'suppliers', label: 'Поставщики', icon: 'Users' },
  { id: 'analytics', label: 'Аналитика', icon: 'LineChart' },
  { id: 'market', label: 'Market Intel', icon: 'Globe2' },
];

const Dashboard = () => {
  const { user, logout, projects, addProject, cart, addToCart, removeFromCart, setQty, orders, checkout } = useStore();
  const nav = useNavigate();
  const [tab, setTab] = useState('home');
  const [cat, setCat] = useState('Все');
  const [search, setSearch] = useState('');
  const [sidebar, setSidebar] = useState(false);

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const filtered = useMemo(
    () => products.filter((p) => (cat === 'Все' || p.category === cat) && p.name.toLowerCase().includes(search.toLowerCase())),
    [cat, search]
  );
  const supplierGroups = useMemo(() => {
    const g: Record<string, typeof cart> = {};
    cart.forEach((i) => { (g[i.supplier] ||= []).push(i); });
    return g;
  }, [cart]);

  if (!user) {
    nav('/auth');
    return null;
  }

  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = projects.reduce((s, p) => s + p.spent, 0);

  const createProject = () => {
    const covers = ['🏙️', '🏡', '🏢', '🏨', '🏬'];
    addProject({
      name: 'Новый проект ' + (projects.length + 1),
      type: 'Квартира · 100 м²',
      budget: 5000000, spent: 0, items: 0, status: 'Планирование',
      cover: covers[Math.floor(Math.random() * covers.length)], progress: 2,
    });
    setTab('projects');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* SIDEBAR */}
      <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 glass border-r border-border flex flex-col transition-transform ${sidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 flex items-center gap-2.5 border-b border-border">
          <div className="h-8 w-8 rounded-lg bg-komi flex items-center justify-center komi-glow">
            <Icon name="Boxes" size={18} className="text-background" />
          </div>
          <span className="font-display font-extrabold">KOMPLEKTO</span>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menu.map((m) => (
            <button key={m.id} onClick={() => { setTab(m.id); setSidebar(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === m.id ? 'bg-komi text-background' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}>
              <Icon name={m.icon} size={18} />
              {m.label}
              {m.id === 'cart' && cartCount > 0 && (
                <span className={`ml-auto text-xs rounded-full px-2 py-0.5 ${tab === m.id ? 'bg-background/20' : 'bg-komi text-background'}`}>{cartCount}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="h-9 w-9 rounded-full bg-komi/20 flex items-center justify-center text-komi font-bold text-sm">
              {user.name[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user.role}</div>
            </div>
            <button onClick={() => { logout(); nav('/'); }} className="text-muted-foreground hover:text-komi">
              <Icon name="LogOut" size={18} />
            </button>
          </div>
        </div>
      </aside>

      {sidebar && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebar(false)} />}

      {/* MAIN */}
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 glass border-b border-border px-5 py-3 flex items-center gap-4">
          <button className="lg:hidden" onClick={() => setSidebar(true)}><Icon name="Menu" size={22} /></button>
          <div className="relative flex-1 max-w-md">
            <Icon name="Search" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => { setSearch(e.target.value); setTab('catalog'); }}
              placeholder="Поиск товаров, поставщиков..." className="bg-white/5 border-white/10 h-10 rounded-xl pl-10" />
          </div>
          <Button onClick={() => setTab('cart')} variant="outline" size="icon" className="relative border-white/10 bg-white/5 rounded-xl shrink-0">
            <Icon name="ShoppingCart" size={18} />
            {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-komi text-background text-xs flex items-center justify-center font-bold">{cartCount}</span>}
          </Button>
        </header>

        <div className="p-5 md:p-8 max-w-7xl">
          {/* HOME */}
          {tab === 'home' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="font-display font-black text-3xl md:text-4xl mb-1">Добро пожаловать, {user.name} 👋</h1>
                <p className="text-muted-foreground">Сводка по вашим проектам и инсайты KOMI</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { l: 'Проектов', v: projects.length, i: 'FolderKanban' },
                  { l: 'Общий бюджет', v: fmt(totalBudget), i: 'Wallet' },
                  { l: 'Освоено', v: fmt(totalSpent), i: 'TrendingUp' },
                  { l: 'Заказов', v: orders.length, i: 'ShoppingCart' },
                ].map((s) => (
                  <div key={s.l} className="glass rounded-2xl p-5">
                    <Icon name={s.i} size={20} className="text-komi mb-3" />
                    <div className="font-display font-bold text-xl">{s.v}</div>
                    <div className="text-sm text-muted-foreground">{s.l}</div>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="Sparkles" size={20} className="text-komi" />
                  <h2 className="font-display font-bold text-xl">Инсайты KOMI</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {komiInsights.map((k) => (
                    <div key={k.title} className="glass-komi rounded-2xl p-5">
                      <Icon name={k.icon} size={22} className={k.tone === 'good' ? 'text-green-400' : 'text-komi'} />
                      <h3 className="font-semibold mt-3 mb-1.5">{k.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{k.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-bold text-xl">Активные проекты</h2>
                  <Button variant="ghost" onClick={() => setTab('projects')} className="text-komi hover:bg-komi/10">Все <Icon name="ArrowRight" size={16} className="ml-1" /></Button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {projects.slice(0, 2).map((p) => (
                    <div key={p.id} className="glass rounded-2xl p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl">{p.cover}</div>
                        <div><div className="font-semibold">{p.name}</div><div className="text-sm text-muted-foreground">{p.type}</div></div>
                      </div>
                      <Progress value={p.progress} className="h-2 mb-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{fmt(p.spent)}</span><span>{p.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PROJECTS */}
          {tab === 'projects' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <h1 className="font-display font-black text-3xl">Проекты</h1>
                <Button onClick={createProject} className="bg-komi hover:bg-komi-glow text-background font-semibold rounded-xl">
                  <Icon name="Plus" size={18} className="mr-1" /> Новый проект
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((p) => (
                  <div key={p.id} className="glass rounded-2xl p-5 hover:border-komi/30 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-14 w-14 rounded-xl bg-white/5 flex items-center justify-center text-3xl">{p.cover}</div>
                      <span className={`text-xs rounded-full px-2.5 py-1 ${p.status === 'Завершён' ? 'bg-green-500/15 text-green-400' : p.status === 'В работе' ? 'bg-komi/15 text-komi' : 'bg-white/10 text-muted-foreground'}`}>{p.status}</span>
                    </div>
                    <h3 className="font-display font-bold text-lg mb-0.5">{p.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{p.type}</p>
                    <Progress value={p.progress} className="h-2 mb-3" />
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><div className="text-muted-foreground text-xs">Бюджет</div><div className="font-medium">{fmt(p.budget)}</div></div>
                      <div><div className="text-muted-foreground text-xs">Позиций</div><div className="font-medium">{p.items}</div></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CATALOG */}
          {tab === 'catalog' && (
            <div className="space-y-6 animate-fade-in">
              <h1 className="font-display font-black text-3xl">Каталог</h1>
              <div className="flex gap-2 flex-wrap">
                {['Все', ...categories].map((c) => (
                  <button key={c} onClick={() => setCat(c)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${cat === c ? 'bg-komi text-background' : 'glass text-muted-foreground hover:text-foreground'}`}>{c}</button>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((p) => (
                  <div key={p.id} className="glass rounded-2xl p-5 hover:-translate-y-1 hover:border-komi/30 transition-all">
                    <div className="h-24 rounded-xl bg-white/5 flex items-center justify-center text-5xl mb-4">{p.image}</div>
                    <div className="text-xs text-komi mb-1">{p.category}</div>
                    <h3 className="font-semibold text-sm mb-2 leading-snug">{p.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-0.5"><Icon name="Star" size={12} className="text-komi" /> {p.rating}</span>
                      <span>·</span><span>{p.supplier}</span><span>·</span><span>{p.delivery} дн.</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold">{fmt(p.price)}</span>
                      <Button onClick={() => addToCart(p)} size="sm" className="bg-komi hover:bg-komi-glow text-background rounded-lg h-8">
                        <Icon name="Plus" size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
                {!filtered.length && <p className="text-muted-foreground col-span-full">Ничего не найдено.</p>}
              </div>
            </div>
          )}

          {/* CART / ORDERS */}
          {tab === 'cart' && (
            <div className="space-y-6 animate-fade-in">
              <h1 className="font-display font-black text-3xl">Заказы и корзина</h1>
              {cart.length > 0 ? (
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 text-sm text-komi">
                      <Icon name="Sparkles" size={16} /> KOMI разбил корзину по поставщикам
                    </div>
                    {Object.entries(supplierGroups).map(([sup, items]) => (
                      <div key={sup} className="glass rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-4 font-semibold"><Icon name="Truck" size={18} className="text-komi" /> {sup}</div>
                        <div className="space-y-3">
                          {items.map((i) => (
                            <div key={i.id} className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-lg bg-white/5 flex items-center justify-center text-2xl">{i.image}</div>
                              <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{i.name}</div><div className="text-xs text-muted-foreground">{fmt(i.price)}</div></div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => setQty(i.id, i.qty - 1)} className="h-7 w-7 rounded-lg glass">−</button>
                                <span className="w-6 text-center text-sm">{i.qty}</span>
                                <button onClick={() => setQty(i.id, i.qty + 1)} className="h-7 w-7 rounded-lg glass">+</button>
                              </div>
                              <button onClick={() => removeFromCart(i.id)} className="text-muted-foreground hover:text-red-400"><Icon name="Trash2" size={16} /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="glass-komi rounded-2xl p-6 h-fit sticky top-24">
                    <h3 className="font-display font-bold text-lg mb-4">Итого</h3>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between"><span className="text-muted-foreground">Позиций</span><span>{cartCount}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Поставщиков</span><span>{Object.keys(supplierGroups).length}</span></div>
                    </div>
                    <div className="flex justify-between font-display font-bold text-xl mb-5 pt-4 border-t border-white/10">
                      <span>Сумма</span><span>{fmt(cartTotal)}</span>
                    </div>
                    <Button onClick={checkout} className="w-full bg-komi hover:bg-komi-glow text-background font-semibold rounded-xl h-12">
                      Оформить заказ <Icon name="ArrowRight" size={18} className="ml-1" />
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
                  <h2 className="font-display font-bold text-xl mb-4 mt-4">История заказов</h2>
                  <div className="space-y-3">
                    {orders.map((o) => (
                      <div key={o.id} className="glass rounded-2xl p-4 flex items-center gap-4 flex-wrap">
                        <div className="h-10 w-10 rounded-xl bg-komi/15 flex items-center justify-center"><Icon name="Package" size={18} className="text-komi" /></div>
                        <div><div className="font-medium text-sm">{o.id}</div><div className="text-xs text-muted-foreground">{o.date} · {o.items} поз.</div></div>
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
            <div className="space-y-6 animate-fade-in">
              <h1 className="font-display font-black text-3xl">Поставщики</h1>
              <p className="text-muted-foreground -mt-3">Сравнение по цене, срокам и рейтингу</p>
              <div className="glass rounded-2xl overflow-hidden">
                <div className="grid grid-cols-5 gap-2 p-4 text-xs text-muted-foreground border-b border-border font-medium">
                  <span className="col-span-2">Поставщик</span><span>Рейтинг</span><span>Доставка</span><span>Цены</span>
                </div>
                {suppliers.map((s) => (
                  <div key={s.id} className="grid grid-cols-5 gap-2 p-4 items-center border-b border-border last:border-0 hover:bg-white/5 transition-colors">
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">{s.logo}</div>
                      <div><div className="font-medium text-sm">{s.name}</div><div className="text-xs text-muted-foreground">{s.orders} заказов</div></div>
                    </div>
                    <span className="flex items-center gap-1 text-sm"><Icon name="Star" size={14} className="text-komi" /> {s.rating}</span>
                    <span className="text-sm">{s.delivery} дн.</span>
                    <span className={`text-sm font-medium ${s.priceIndex < 100 ? 'text-green-400' : 'text-komi'}`}>{s.priceIndex < 100 ? '↓' : '↑'} {s.priceIndex}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {tab === 'analytics' && (
            <div className="space-y-6 animate-fade-in">
              <h1 className="font-display font-black text-3xl">Аналитика</h1>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { l: 'Экономия с KOMI', v: '−27%', i: 'TrendingDown', c: 'text-green-400' },
                  { l: 'Среднее освоение', v: Math.round((totalSpent / totalBudget) * 100) + '%', i: 'Percent', c: 'text-komi' },
                  { l: 'Активных поставщиков', v: suppliers.length, i: 'Users', c: 'text-komi' },
                ].map((s) => (
                  <div key={s.l} className="glass rounded-2xl p-6">
                    <Icon name={s.i} size={22} className={s.c} />
                    <div className="font-display font-black text-3xl mt-3">{s.v}</div>
                    <div className="text-sm text-muted-foreground">{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="font-display font-bold mb-5">Бюджет по проектам</h3>
                <div className="space-y-4">
                  {projects.map((p) => (
                    <div key={p.id}>
                      <div className="flex justify-between text-sm mb-1.5"><span>{p.name}</span><span className="text-muted-foreground">{fmt(p.spent)} / {fmt(p.budget)}</span></div>
                      <Progress value={p.progress} className="h-2.5" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MARKET */}
          {tab === 'market' && (
            <div className="space-y-6 animate-fade-in">
              <h1 className="font-display font-black text-3xl">Market Intelligence</h1>
              <p className="text-muted-foreground -mt-3">Цены, тренды и спрос с объяснениями KOMI</p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { cat: 'Керамогранит', trend: '+6%', dir: 'up', text: 'Рост спроса перед сезоном. Рекомендуем закупить сейчас.' },
                  { cat: 'Сантехника', trend: '0%', dir: 'flat', text: 'Цены стабильны. Хорошее время для плановых закупок.' },
                  { cat: 'Освещение', trend: '+3%', dir: 'up', text: 'Премиум-сегмент дорожает из-за импорта.' },
                  { cat: 'Мебель', trend: '−2%', dir: 'down', text: 'Снижение из-за конкуренции. Выгодные предложения.' },
                ].map((m) => (
                  <div key={m.cat} className="glass rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{m.cat}</h3>
                      <span className={`text-sm font-bold ${m.dir === 'up' ? 'text-komi' : m.dir === 'down' ? 'text-green-400' : 'text-muted-foreground'}`}>{m.trend}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{m.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <KomiChat />
    </div>
  );
};

export default Dashboard;