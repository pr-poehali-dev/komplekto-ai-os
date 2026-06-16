import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { products, suppliers, fmt } from '@/lib/data';

type Msg = { from: 'komi' | 'user'; text: string };

const answer = (q: string): string => {
  const t = q.toLowerCase();
  if (t.includes('дешев') || t.includes('эконом') || t.includes('бюджет')) {
    const cheapest = [...products].sort((a, b) => a.price - b.price)[0];
    return `Самый выгодный вариант сейчас — «${cheapest.name}» за ${fmt(cheapest.price)} от ${cheapest.supplier}. Замена дорогих позиций на аналоги может сократить бюджет на 15–27%.`;
  }
  if (t.includes('поставщик') || t.includes('сравн')) {
    const best = [...suppliers].sort((a, b) => b.rating - a.rating)[0];
    return `По рейтингу лидирует ${best.name} (${best.rating}★, доставка ${best.delivery} дн.). Для срочных закупок советую СтройОпт — доставка от 3 дней.`;
  }
  if (t.includes('срок') || t.includes('доставк')) {
    const fast = [...products].sort((a, b) => a.delivery - b.delivery)[0];
    return `Быстрее всего приедет «${fast.name}» — ${fast.delivery} дня. Долгие позиции (мебель) лучше заказывать заранее.`;
  }
  if (t.includes('свет') || t.includes('освещ')) {
    return 'В категории «Освещение» рекомендую LightHouse (4.9★). Подвесной светильник Vibia и бра Flos — премиум-сегмент с высоким рейтингом.';
  }
  if (t.includes('тренд') || t.includes('рынок') || t.includes('цен')) {
    return 'Прогноз рынка: керамогранит подорожает на ~6% в след. квартале, сантехника стабильна. Рекомендую закупить плитку сейчас.';
  }
  return 'Я помогу найти товары, сравнить поставщиков, оптимизировать бюджет и оценить рынок. Спросите, например: «где сэкономить?» или «лучший поставщик света?».';
};

const suggestions = ['Где сэкономить?', 'Лучший поставщик?', 'Быстрая доставка', 'Тренды рынка'];

const KomiChat = () => {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ from: 'komi', text: 'Привет! Я KOMI — ваш AI-ассистент. Чем помочь с проектом?' }]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [msgs, open]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { from: 'user', text }]);
    setInput('');
    setTimeout(() => setMsgs((m) => [...m, { from: 'komi', text: answer(text) }]), 450);
  };

  return (
    <>
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-2xl bg-komi flex items-center justify-center komi-glow hover:scale-105 transition-transform">
        <Icon name={open ? 'X' : 'Sparkles'} size={24} className="text-background" />
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 h-[520px] glass rounded-3xl flex flex-col overflow-hidden animate-scale-in">
          <div className="glass-komi p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-komi flex items-center justify-center">
              <Icon name="Sparkles" size={18} className="text-background" />
            </div>
            <div>
              <div className="font-display font-bold text-sm">KOMI</div>
              <div className="text-xs text-komi-glow flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-komi animate-glow-pulse" /> онлайн
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.from === 'user' ? 'bg-komi text-background' : 'bg-white/8 text-foreground'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="p-3 border-t border-border">
            <div className="flex gap-1.5 mb-2.5 flex-wrap">
              {suggestions.map((s) => (
                <button key={s} onClick={() => send(s)} className="text-xs glass rounded-full px-3 py-1 text-muted-foreground hover:text-komi transition-colors">{s}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send(input)}
                placeholder="Спросите KOMI..." className="bg-white/5 border-white/10 h-10 rounded-xl text-sm" />
              <Button onClick={() => send(input)} size="icon" className="bg-komi hover:bg-komi-glow text-background rounded-xl shrink-0">
                <Icon name="Send" size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KomiChat;
