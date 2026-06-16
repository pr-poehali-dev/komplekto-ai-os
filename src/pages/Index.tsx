import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const HERO_IMG = 'https://cdn.poehali.dev/projects/415921c3-1667-4a42-a71c-c7503db9c0c5/files/0438d708-2190-4793-a290-f0e76ff4cfc9.jpg';

const nav = [
  { label: 'Платформа', href: '#about' },
  { label: 'KOMI', href: '#komi' },
  { label: 'Возможности', href: '#features' },
  { label: 'Тарифы', href: '#pricing' },
];

const benefits = [
  { icon: 'FileSpreadsheet', title: 'Конец хаосу в Excel', text: 'Спецификации, бюджеты и расчёты в одном живом пространстве. Никаких потерянных версий и ручных формул.' },
  { icon: 'MessageSquareOff', title: 'Без переписок в WhatsApp', text: 'Вся коммуникация с поставщиками, файлы и согласования собраны внутри проекта.' },
  { icon: 'TrendingDown', title: 'Без перерасхода бюджета', text: 'KOMI отслеживает цены, находит экономию и предупреждает о рисках до того, как они случатся.' },
  { icon: 'Zap', title: 'Закупки за минуты', text: 'Одна корзина — несколько поставщиков. Автосплит заказов и отслеживание доставки в реальном времени.' },
];

const komiFeatures = [
  { icon: 'Search', title: 'Поиск товаров и поставщиков' },
  { icon: 'GitCompareArrows', title: 'Сравнение цен и сроков' },
  { icon: 'Lightbulb', title: 'Рекомендации альтернатив' },
  { icon: 'ListChecks', title: 'Генерация спецификаций' },
  { icon: 'PiggyBank', title: 'Оптимизация бюджета' },
  { icon: 'Radar', title: 'Анализ рынка и спроса' },
];

const features = [
  { icon: 'LayoutDashboard', title: 'Главная панель', text: 'Проекты, заказы, бюджеты и KOMI-инсайты на одном экране.' },
  { icon: 'FolderKanban', title: 'Проекты', text: 'Квартиры, дома, офисы, отели и ЖК с продуктами, комнатами и аналитикой.' },
  { icon: 'Package', title: 'Каталог', text: 'Сантехника, плитка, свет, мебель, отделка — фото, отзывы, наличие.' },
  { icon: 'Table2', title: 'Спецификации', text: 'Опыт Excel + Notion: drag-and-drop, автоподсчёты, экспорт PDF/Excel.' },
  { icon: 'ShoppingCart', title: 'Заказы', text: 'Мультипоставщицкая корзина, автосплит и отслеживание доставки.' },
  { icon: 'Users', title: 'Поставщики', text: 'Сравнение по цене, наличию, срокам, рейтингу и рекомендации KOMI.' },
  { icon: 'LineChart', title: 'Аналитика', text: 'Экономия, риски поставщиков, оптимизация бюджета и отчёты.' },
  { icon: 'Globe2', title: 'Market Intelligence', text: 'Цены, тренды, дефициты и спрос с объяснениями от KOMI.' },
];

const plans = [
  { name: 'FREE', price: '0', desc: 'Старт работы', features: ['Каталог', 'Проекты', 'Заказы', 'Базовый KOMI'], cta: 'Начать бесплатно', highlight: false },
  { name: 'PRO', price: '2 900', desc: 'Для профессионалов', features: ['Всё из Free', 'Аналитика', 'Сравнение поставщиков', 'Оптимизация бюджета', 'Полный KOMI'], cta: 'Выбрать PRO', highlight: true },
  { name: 'BUSINESS', price: '7 900', desc: 'Для команд', features: ['Всё из Pro', 'Командная работа', 'Отчётность', 'Procurement Intelligence'], cta: 'Выбрать Business', highlight: false },
  { name: 'ENTERPRISE', price: 'Custom', desc: 'Для корпораций', features: ['API и интеграции', 'Выделенная поддержка', 'Кастомные комиссии', 'SLA'], cta: 'Связаться', highlight: false },
];

const Index = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-komi/30">
      {/* NAV */}
      <header className="fixed top-0 inset-x-0 z-50">
        <div className="container mx-auto px-5 mt-4">
          <div className="glass rounded-2xl flex items-center justify-between px-5 py-3">
            <a href="#" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-komi flex items-center justify-center komi-glow">
                <Icon name="Boxes" size={18} className="text-background" />
              </div>
              <span className="font-display font-extrabold text-lg tracking-tight">KOMPLEKTO</span>
            </a>
            <nav className="hidden md:flex items-center gap-8">
              {nav.map((n) => (
                <a key={n.href} href={n.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{n.label}</a>
              ))}
            </nav>
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" className="text-sm hover:bg-white/5">Войти</Button>
              <Button className="bg-komi hover:bg-komi-glow text-background font-semibold rounded-xl">Начать</Button>
            </div>
            <button className="md:hidden text-foreground" onClick={() => setMenuOpen(!menuOpen)}>
              <Icon name={menuOpen ? 'X' : 'Menu'} size={22} />
            </button>
          </div>
          {menuOpen && (
            <div className="glass rounded-2xl mt-2 p-5 flex flex-col gap-4 md:hidden animate-fade-in">
              {nav.map((n) => (
                <a key={n.href} href={n.href} onClick={() => setMenuOpen(false)} className="text-muted-foreground hover:text-foreground">{n.label}</a>
              ))}
              <Button className="bg-komi hover:bg-komi-glow text-background font-semibold rounded-xl w-full">Начать</Button>
            </div>
          )}
        </div>
      </header>

      {/* HERO */}
      <section className="relative pt-40 pb-24 grid-pattern">
        <div className="container mx-auto px-5 relative">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 glass-komi rounded-full px-4 py-1.5 mb-8">
              <span className="h-2 w-2 rounded-full bg-komi animate-glow-pulse" />
              <span className="text-sm text-komi-glow font-medium">KOMI — AI слой внутри платформы</span>
            </div>
            <h1 className="font-display font-black text-5xl md:text-7xl leading-[1.05] tracking-tight mb-6">
              Операционная система <br className="hidden md:block" />
              <span className="text-komi-gradient">строительства и дизайна</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              KOMPLEKTO заменяет Excel, WhatsApp, ручные закупки и поиск поставщиков. KOMI находит товары, сравнивает цены и оптимизирует бюджеты — за вас.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-komi hover:bg-komi-glow text-background font-semibold rounded-xl px-8 h-13 text-base komi-glow">
                Запустить платформу
                <Icon name="ArrowRight" size={18} className="ml-1" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl px-8 h-13 text-base border-white/15 bg-white/5 hover:bg-white/10">
                <Icon name="Play" size={16} className="mr-1" />
                Смотреть демо
              </Button>
            </div>
          </div>

          <div className="relative mt-16 max-w-5xl mx-auto animate-scale-in">
            <div className="absolute -inset-4 bg-komi/20 blur-3xl rounded-full opacity-40" />
            <div className="relative glass rounded-3xl p-2 overflow-hidden">
              <img src={HERO_IMG} alt="KOMPLEKTO интерфейс" className="rounded-2xl w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT / STATS */}
      <section id="about" className="py-20 border-y border-border">
        <div className="container mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { v: '8', l: 'стран рынка' },
              { v: '12', l: 'категорий товаров' },
              { v: '−27%', l: 'средняя экономия' },
              { v: '24/7', l: 'работа KOMI' },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display font-black text-4xl md:text-5xl text-komi-gradient mb-2">{s.v}</div>
                <div className="text-muted-foreground text-sm">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-24">
        <div className="container mx-auto px-5">
          <div className="max-w-2xl mb-14">
            <p className="text-komi font-semibold mb-3">Зачем KOMPLEKTO</p>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight">Один инструмент вместо десяти</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="glass rounded-3xl p-8 hover:border-komi/30 transition-colors group">
                <div className="h-12 w-12 rounded-2xl bg-komi/10 flex items-center justify-center mb-5 group-hover:bg-komi/20 transition-colors">
                  <Icon name={b.icon} size={24} className="text-komi" />
                </div>
                <h3 className="font-display font-bold text-xl mb-2">{b.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KOMI */}
      <section id="komi" className="py-24">
        <div className="container mx-auto px-5">
          <div className="glass-komi rounded-[2rem] p-8 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-72 w-72 bg-komi/30 blur-3xl rounded-full animate-glow-pulse" />
            <div className="relative grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-komi/15 rounded-full px-4 py-1.5 mb-6">
                  <Icon name="Sparkles" size={16} className="text-komi" />
                  <span className="text-sm text-komi-glow font-medium">Интеллектуальный слой</span>
                </div>
                <h2 className="font-display font-black text-4xl md:text-6xl tracking-tight mb-5">
                  Знакомьтесь, <span className="text-komi-gradient">KOMI</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  AI ассистент встроен в каждый модуль. Он находит товары, сравнивает поставщиков, генерирует спецификации, оптимизирует бюджеты и следит за рынком — пока вы создаёте проекты.
                </p>
                <Button size="lg" className="bg-komi hover:bg-komi-glow text-background font-semibold rounded-xl px-8">
                  Попробовать KOMI
                  <Icon name="Sparkles" size={16} className="ml-1" />
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {komiFeatures.map((f, i) => (
                  <div key={f.title} className="glass rounded-2xl p-5 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                    <Icon name={f.icon} size={22} className="text-komi mb-3" />
                    <p className="font-medium text-sm leading-snug">{f.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-5">
          <div className="max-w-2xl mb-14">
            <p className="text-komi font-semibold mb-3">Модули</p>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight">Целая экосистема</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div key={f.title} className="glass rounded-3xl p-6 hover:-translate-y-1 hover:border-komi/30 transition-all duration-300">
                <div className="h-11 w-11 rounded-xl bg-komi/10 flex items-center justify-center mb-4">
                  <Icon name={f.icon} size={22} className="text-komi" />
                </div>
                <h3 className="font-display font-bold text-lg mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-5">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-komi font-semibold mb-3">Тарифы</p>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight">Растёт вместе с вами</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map((p) => (
              <div key={p.name} className={`rounded-3xl p-7 flex flex-col ${p.highlight ? 'glass-komi komi-glow' : 'glass'}`}>
                {p.highlight && <span className="self-start text-xs font-semibold bg-komi text-background rounded-full px-3 py-1 mb-4">Популярный</span>}
                <h3 className="font-display font-extrabold text-xl mb-1">{p.name}</h3>
                <p className="text-sm text-muted-foreground mb-5">{p.desc}</p>
                <div className="mb-6">
                  <span className="font-display font-black text-4xl">{p.price}</span>
                  {p.price !== 'Custom' && <span className="text-muted-foreground text-sm"> ₽/мес</span>}
                </div>
                <ul className="space-y-3 mb-7 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Icon name="Check" size={16} className="text-komi mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button className={`rounded-xl w-full font-semibold ${p.highlight ? 'bg-komi hover:bg-komi-glow text-background' : 'bg-white/10 hover:bg-white/15 text-foreground'}`}>
                  {p.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT / CTA */}
      <section id="contact" className="py-24">
        <div className="container mx-auto px-5">
          <div className="glass rounded-[2rem] p-8 md:p-16 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight mb-5">
                Готовы заменить хаос на <span className="text-komi-gradient">систему?</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Оставьте заявку — покажем, как KOMPLEKTO и KOMI работают на вашем проекте.
              </p>
              <div className="flex flex-wrap gap-3">
                {['Россия', 'Казахстан', 'Беларусь', 'Узбекистан', 'Армения', 'Кыргызстан'].map((c) => (
                  <span key={c} className="glass rounded-full px-3.5 py-1.5 text-sm text-muted-foreground">{c}</span>
                ))}
              </div>
            </div>
            <form className="glass-komi rounded-3xl p-7 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <Input placeholder="Ваше имя" className="bg-white/5 border-white/10 h-12 rounded-xl" />
              <Input type="email" placeholder="Email" className="bg-white/5 border-white/10 h-12 rounded-xl" />
              <Textarea placeholder="Расскажите о проекте" className="bg-white/5 border-white/10 rounded-xl min-h-28" />
              <Button className="w-full bg-komi hover:bg-komi-glow text-background font-semibold rounded-xl h-12">
                Отправить заявку
                <Icon name="Send" size={16} className="ml-1" />
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-komi flex items-center justify-center">
              <Icon name="Boxes" size={18} className="text-background" />
            </div>
            <span className="font-display font-extrabold text-lg">KOMPLEKTO</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 KOMPLEKTO. Платформа. KOMI — интеллектуальный слой.</p>
          <div className="flex gap-4">
            <a href="#" className="text-muted-foreground hover:text-komi transition-colors"><Icon name="Send" size={20} /></a>
            <a href="#" className="text-muted-foreground hover:text-komi transition-colors"><Icon name="Mail" size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
