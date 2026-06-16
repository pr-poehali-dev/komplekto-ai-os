import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

type Msg = { from: 'komi' | 'user'; text: string };

const suggestions = ['Анализ рынка', 'Сравни поставщиков', 'Как сэкономить?', 'Сроки доставки'];

// Simple markdown renderer: **bold**, *italic*, bullet lists, line breaks
const renderText = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('• ') || line.startsWith('* ')) {
      const content = line.slice(2);
      return <li key={i} className="ml-3 list-none before:content-['•'] before:mr-2 before:text-komi">{formatInline(content)}</li>;
    }
    if (line === '') return <br key={i} />;
    return <p key={i} className="leading-relaxed">{formatInline(line)}</p>;
  });
};

const formatInline = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="text-foreground">{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
    return <span key={i}>{part}</span>;
  });
};

const KomiChat = () => {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, open]);

  useEffect(() => {
    if (open && !historyLoaded) {
      const token = localStorage.getItem('komi_token');
      if (!token) {
        setMsgs([{ from: 'komi', text: 'Привет! Я **KOMI** — AI-ассистент KOMPLEKTO.\n\nЗадайте любой вопрос по закупкам, поставщикам или рынку стройматериалов.' }]);
        setHistoryLoaded(true);
        return;
      }
      api.komiHistory().then((history: Msg[]) => {
        if (history.length > 0) setMsgs(history);
        else setMsgs([{ from: 'komi', text: 'Привет! Я **KOMI** — AI-ассистент KOMPLEKTO.\n\nЗадайте любой вопрос по закупкам, поставщикам или рынку стройматериалов.' }]);
        setHistoryLoaded(true);
      }).catch(() => {
        setMsgs([{ from: 'komi', text: 'Привет! Я **KOMI**. Спросите меня что-нибудь!' }]);
        setHistoryLoaded(true);
      });
    }
  }, [open, historyLoaded]);

  const send = async (text: string) => {
    if (!text.trim() || sending) return;
    setMsgs(m => [...m, { from: 'user', text }]);
    setInput('');
    setSending(true);

    const token = localStorage.getItem('komi_token');
    if (!token) {
      setMsgs(m => [...m, { from: 'komi', text: 'Войдите в аккаунт, чтобы использовать KOMI.' }]);
      setSending(false);
      return;
    }

    try {
      const res = await api.komiAsk(text);
      setMsgs(m => [...m, { from: 'komi', text: res.answer }]);
    } catch {
      setMsgs(m => [...m, { from: 'komi', text: 'Что-то пошло не так. Попробуйте ещё раз.' }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-2xl bg-komi flex items-center justify-center komi-glow hover:scale-105 transition-transform shadow-2xl">
        <Icon name={open ? 'X' : 'Sparkles'} size={24} className="text-background" />
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-[380px] h-[540px] glass rounded-3xl flex flex-col overflow-hidden animate-scale-in shadow-2xl">
          <div className="glass-komi p-4 flex items-center gap-3 shrink-0">
            <div className="h-9 w-9 rounded-xl bg-komi flex items-center justify-center shrink-0">
              <Icon name="Sparkles" size={18} className="text-background" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-sm">KOMI</div>
              <div className="text-xs text-komi-glow flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-komi animate-glow-pulse" />
                AI-ассистент · онлайн
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="X" size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.from === 'komi' && (
                  <div className="h-7 w-7 rounded-full bg-komi/20 flex items-center justify-center mr-2 mt-1 shrink-0">
                    <Icon name="Sparkles" size={13} className="text-komi" />
                  </div>
                )}
                <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm ${m.from === 'user' ? 'bg-komi text-background rounded-br-sm' : 'bg-white/8 text-foreground rounded-bl-sm'}`}>
                  {m.from === 'komi' ? <div className="space-y-0.5">{renderText(m.text)}</div> : m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="h-7 w-7 rounded-full bg-komi/20 flex items-center justify-center mr-2 shrink-0">
                  <Icon name="Sparkles" size={13} className="text-komi" />
                </div>
                <div className="bg-white/8 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                  {[0, 1, 2].map(n => <div key={n} className="h-2 w-2 rounded-full bg-komi/60 animate-bounce" style={{ animationDelay: `${n * 150}ms` }} />)}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="p-3 border-t border-border shrink-0">
            <div className="flex gap-1.5 mb-2.5 flex-wrap">
              {suggestions.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="text-xs glass rounded-full px-2.5 py-1 text-muted-foreground hover:text-komi hover:border-komi/30 transition-colors">
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
                placeholder="Спросите KOMI..." disabled={sending}
                className="bg-white/5 border-white/10 h-10 rounded-xl text-sm" />
              <Button onClick={() => send(input)} disabled={sending || !input.trim()} size="icon"
                className="bg-komi hover:bg-komi-glow text-background rounded-xl h-10 w-10 shrink-0">
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
