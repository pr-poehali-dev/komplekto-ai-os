import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStore } from '@/lib/store';

const roles = [
  { id: 'designer', label: 'Дизайнер', fee: 'вознаграждение 1%', icon: 'Palette' },
  { id: 'wholesale', label: 'Опт', fee: 'своя комиссия', icon: 'Warehouse' },
  { id: 'developer', label: 'Застройщик', fee: 'корп. условия', icon: 'Building2' },
];

const Auth = () => {
  const { login } = useStore();
  const nav = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('designer');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = roles.find((x) => x.id === role)?.label || 'Дизайнер';
    login(email || 'demo@komplekto.ru', name || 'Гость', r);
    nav('/app');
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-12 relative grid-pattern border-r border-border overflow-hidden">
        <div className="absolute top-20 -left-20 h-96 w-96 bg-komi/20 blur-3xl rounded-full animate-glow-pulse" />
        <a href="/" className="flex items-center gap-2.5 relative">
          <div className="h-9 w-9 rounded-lg bg-komi flex items-center justify-center komi-glow">
            <Icon name="Boxes" size={20} className="text-background" />
          </div>
          <span className="font-display font-extrabold text-xl">KOMPLEKTO</span>
        </a>
        <div className="relative">
          <h1 className="font-display font-black text-5xl leading-tight mb-5">
            Операционная система <span className="text-komi-gradient">строительства</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md">
            Проекты, закупки, поставщики и KOMI-аналитика — в одном пространстве.
          </p>
        </div>
        <div className="flex gap-6 relative text-sm text-muted-foreground">
          <span className="flex items-center gap-2"><Icon name="ShieldCheck" size={16} className="text-komi" /> Безопасно</span>
          <span className="flex items-center gap-2"><Icon name="Sparkles" size={16} className="text-komi" /> KOMI внутри</span>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-md glass rounded-3xl p-8 animate-scale-in">
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-7">
            {(['register', 'login'] as const).map((m) => (
              <button key={m} type="button" onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${mode === m ? 'bg-komi text-background' : 'text-muted-foreground'}`}>
                {m === 'register' ? 'Регистрация' : 'Вход'}
              </button>
            ))}
          </div>

          <h2 className="font-display font-bold text-2xl mb-1">{mode === 'register' ? 'Создать аккаунт' : 'С возвращением'}</h2>
          <p className="text-muted-foreground text-sm mb-6">Начните работать с KOMPLEKTO за минуту</p>

          {mode === 'register' && (
            <div className="space-y-2 mb-4">
              <Label className="text-sm">Имя</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Иван Иванов" className="bg-white/5 border-white/10 h-11 rounded-xl" />
            </div>
          )}
          <div className="space-y-2 mb-4">
            <Label className="text-sm">Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.ru" className="bg-white/5 border-white/10 h-11 rounded-xl" />
          </div>
          <div className="space-y-2 mb-6">
            <Label className="text-sm">Пароль</Label>
            <Input type="password" placeholder="••••••••" className="bg-white/5 border-white/10 h-11 rounded-xl" />
          </div>

          {mode === 'register' && (
            <div className="mb-6">
              <Label className="text-sm mb-2.5 block">Тип аккаунта</Label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((r) => (
                  <button key={r.id} type="button" onClick={() => setRole(r.id)}
                    className={`p-3 rounded-xl border text-center transition-all ${role === r.id ? 'border-komi bg-komi/10' : 'border-white/10 bg-white/5'}`}>
                    <Icon name={r.icon} size={18} className={`mx-auto mb-1.5 ${role === r.id ? 'text-komi' : 'text-muted-foreground'}`} />
                    <div className="text-xs font-medium">{r.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{r.fee}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button type="submit" className="w-full bg-komi hover:bg-komi-glow text-background font-semibold rounded-xl h-12">
            {mode === 'register' ? 'Создать аккаунт' : 'Войти'}
            <Icon name="ArrowRight" size={18} className="ml-1" />
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Нажимая, вы соглашаетесь с условиями агентского договора
          </p>
        </form>
      </div>
    </div>
  );
};

export default Auth;
