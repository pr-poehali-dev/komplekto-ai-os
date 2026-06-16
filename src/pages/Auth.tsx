import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStore } from '@/lib/store';

const roles = [
  { id: 'Дизайнер', label: 'Дизайнер', fee: 'агент. вознаграждение 1%', icon: 'Palette' },
  { id: 'Опт', label: 'Оптовик', fee: 'оптовая комиссия', icon: 'Warehouse' },
  { id: 'Застройщик', label: 'Застройщик', fee: 'корп. условия', icon: 'Building2' },
];

const Auth = () => {
  const { login, loginDemo, register, verify, user } = useStore();
  const nav = useNavigate();
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Дизайнер');
  const [code, setCode] = useState('');
  const [vcode, setVcode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) { nav('/app'); return null; }

  const handleDemo = async () => {
    setLoading(true); setError('');
    try { await loginDemo(); nav('/app'); }
    catch (e: unknown) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password); nav('/app');
      } else if (mode === 'register') {
        const res = await register(name, email, password, role);
        if (res.vcode) { setVcode(res.vcode); setMode('verify'); }
        else nav('/app');
      } else {
        await verify(code); nav('/app');
      }
    } catch (e: unknown) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-12 relative grid-pattern border-r border-border overflow-hidden">
        <div className="absolute top-20 -left-20 h-96 w-96 bg-komi/20 blur-3xl rounded-full animate-glow-pulse" />
        <Link to="/" className="flex items-center gap-2.5 relative">
          <div className="h-9 w-9 rounded-lg bg-komi flex items-center justify-center komi-glow">
            <Icon name="Boxes" size={20} className="text-background" />
          </div>
          <span className="font-display font-extrabold text-xl">KOMPLEKTO</span>
        </Link>
        <div className="relative">
          <h1 className="font-display font-black text-5xl leading-tight mb-5">
            Операционная система <span className="text-komi-gradient">строительства</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mb-8">
            Проекты, закупки, поставщики и KOMI-аналитика в одном пространстве.
          </p>
          <div className="glass rounded-2xl p-5 space-y-3">
            {[
              'Дизайнер: агентское вознаграждение 1% от объёма',
              'Оптовик: специальные условия по объёму',
              'Застройщик: корпоративный договор и API',
            ].map(t => (
              <div key={t} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <Icon name="Check" size={16} className="text-komi mt-0.5 shrink-0" />{t}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-6 relative text-sm text-muted-foreground">
          <span className="flex items-center gap-2"><Icon name="ShieldCheck" size={16} className="text-komi" />Безопасно</span>
          <span className="flex items-center gap-2"><Icon name="Sparkles" size={16} className="text-komi" />KOMI внутри</span>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4 animate-scale-in">
          <div className="glass-komi rounded-2xl p-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-sm">Демо-доступ</div>
              <div className="text-xs text-muted-foreground">demo@komplekto.ru · demo1234</div>
            </div>
            <Button onClick={handleDemo} disabled={loading} size="sm"
              className="bg-komi hover:bg-komi-glow text-background font-semibold rounded-xl shrink-0">
              {loading ? '...' : 'Войти как демо'}
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="glass rounded-3xl p-7">
            {mode !== 'verify' && (
              <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-6">
                {(['login', 'register'] as const).map(m => (
                  <button key={m} type="button" onClick={() => { setMode(m); setError(''); }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${mode === m ? 'bg-komi text-background' : 'text-muted-foreground'}`}>
                    {m === 'login' ? 'Вход' : 'Регистрация'}
                  </button>
                ))}
              </div>
            )}

            {mode === 'verify' ? (
              <>
                <h2 className="font-display font-bold text-2xl mb-1">Подтверждение email</h2>
                <p className="text-muted-foreground text-sm mb-2">Введите код для активации аккаунта.</p>
                <div className="glass-komi rounded-xl p-3 mb-5 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Ваш код верификации:</div>
                  <div className="font-mono text-2xl font-bold text-komi tracking-widest">{vcode}</div>
                </div>
                <div className="space-y-2 mb-5">
                  <Label className="text-sm">Введите код</Label>
                  <Input value={code} onChange={e => setCode(e.target.value)} placeholder="000000"
                    className="bg-white/5 border-white/10 h-11 rounded-xl tracking-widest text-center text-xl" maxLength={6} />
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display font-bold text-2xl mb-1">
                  {mode === 'login' ? 'С возвращением' : 'Создать аккаунт'}
                </h2>
                <p className="text-muted-foreground text-sm mb-5">
                  {mode === 'login' ? 'Войдите в платформу KOMPLEKTO' : 'Присоединитесь к экосистеме'}
                </p>
                {mode === 'register' && (
                  <div className="space-y-2 mb-4">
                    <Label className="text-sm">Имя</Label>
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Иван Иванов"
                      className="bg-white/5 border-white/10 h-11 rounded-xl" />
                  </div>
                )}
                <div className="space-y-2 mb-4">
                  <Label className="text-sm">Email</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.ru" className="bg-white/5 border-white/10 h-11 rounded-xl" />
                </div>
                <div className="space-y-2 mb-5">
                  <Label className="text-sm">Пароль</Label>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" className="bg-white/5 border-white/10 h-11 rounded-xl" />
                </div>
                {mode === 'register' && (
                  <div className="mb-5">
                    <Label className="text-sm mb-2.5 block">Тип аккаунта</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {roles.map(r => (
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
              </>
            )}

            {error && (
              <div className="mb-4 text-sm text-red-400 bg-red-400/10 rounded-xl px-3 py-2 flex items-center gap-2">
                <Icon name="AlertCircle" size={16} className="shrink-0" />{error}
              </div>
            )}

            <Button type="submit" disabled={loading}
              className="w-full bg-komi hover:bg-komi-glow text-background font-semibold rounded-xl h-11">
              {loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : mode === 'register' ? 'Создать аккаунт' : 'Подтвердить код'}
              {!loading && <Icon name="ArrowRight" size={16} className="ml-1" />}
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-3">
              Нажимая, вы принимаете <span className="text-komi cursor-pointer hover:underline">условия агентского договора</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
