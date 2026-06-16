import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { api } from './api';
import { Product } from './data';

export type User = { id: number; name: string; email: string; role: string; is_admin: boolean; is_verified: boolean };
export type CartItem = Product & { qty: number };

export type Project = {
  id: number; member_id?: number; name: string; type: string;
  budget: number; spent: number; items: number;
  status: string; cover: string; progress: number;
};

export type SpecRow = {
  id: number; spec_id: number; position: number; room: string;
  product: string; category: string; unit: string;
  qty: number; price: number; supplier: string; note: string;
};

export type Spec = { id: number; project_id: number; name: string };

export type Order = {
  id: number; order_number: string; total: number; items_count: number;
  status: string; suppliers: string[]; date: string; member_name?: string;
};

type Store = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<{ vcode?: string }>;
  logout: () => void;
  verify: (code: string) => Promise<void>;

  projects: Project[];
  loadProjects: () => Promise<void>;
  createProject: (data: Partial<Project>) => Promise<void>;

  specs: Spec[];
  loadSpecs: (project_id: number) => Promise<void>;
  createSpec: (project_id: number, name: string) => Promise<Spec>;
  specRows: SpecRow[];
  loadSpecRows: (spec_id: number) => Promise<void>;
  addSpecRow: (data: Partial<SpecRow> & { spec_id: number }) => Promise<void>;
  updateSpecRow: (id: number, data: Partial<SpecRow>) => Promise<void>;
  deleteSpecRow: (id: number) => Promise<void>;

  cart: CartItem[];
  addToCart: (p: Product) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;

  orders: Order[];
  loadOrders: () => Promise<void>;
  checkout: () => Promise<void>;
};

const Ctx = createContext<Store | null>(null);

const loadLS = <T,>(key: string, fallback: T): T => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [specRows, setSpecRows] = useState<SpecRow[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => loadLS('komi_cart', []));

  useEffect(() => localStorage.setItem('komi_cart', JSON.stringify(cart)), [cart]);

  useEffect(() => {
    const token = localStorage.getItem('komi_token');
    if (!token) { setLoading(false); return; }
    api.me()
      .then((u: User) => { setUser(u); setLoading(false); })
      .catch(() => { localStorage.removeItem('komi_token'); setLoading(false); });
  }, []);

  const _setAuth = (data: User & { token: string }) => {
    localStorage.setItem('komi_token', data.token);
    setUser({ id: data.id, name: data.name, email: data.email, role: data.role, is_admin: data.is_admin, is_verified: data.is_verified });
  };

  const login = async (email: string, password: string) => { const d = await api.login(email, password); _setAuth(d); };
  const loginDemo = async () => { const d = await api.login('demo@komplekto.ru', 'demo1234'); _setAuth(d); };
  const register = async (name: string, email: string, password: string, role: string) => {
    const d = await api.register(name, email, password, role); _setAuth(d); return { vcode: d.vcode };
  };
  const logout = () => { localStorage.removeItem('komi_token'); setUser(null); setProjects([]); setOrders([]); };
  const verify = async (code: string) => { await api.verify(code); setUser(u => u ? { ...u, is_verified: true } : u); };

  const loadProjects = useCallback(async () => { const d = await api.getProjects(); setProjects(d); }, []);
  const createProject = async (data: Partial<Project>) => { const p = await api.createProject(data); setProjects(prev => [p, ...prev]); };

  const loadSpecs = useCallback(async (pid: number) => { const d = await api.getSpecs(pid); setSpecs(d); }, []);
  const createSpec = async (pid: number, name: string): Promise<Spec> => {
    const s = await api.createSpec(pid, name); setSpecs(prev => [...prev, s]); return s;
  };
  const loadSpecRows = useCallback(async (sid: number) => { const d = await api.getSpecRows(sid); setSpecRows(d); }, []);
  const addSpecRow = async (data: Partial<SpecRow> & { spec_id: number }) => {
    const row = await api.addSpecRow(data);
    setSpecRows(prev => [...prev, { ...data, ...row } as SpecRow]);
  };
  const updateSpecRow = async (id: number, data: Partial<SpecRow>) => {
    await api.updateSpecRow(id, data); setSpecRows(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  };
  const deleteSpecRow = async (id: number) => { await api.deleteSpecRow(id); setSpecRows(prev => prev.filter(r => r.id !== id)); };

  const addToCart = (p: Product) => setCart(prev => {
    const ex = prev.find(i => i.id === p.id);
    return ex ? prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...p, qty: 1 }];
  });
  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const setQty = (id: string, qty: number) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, qty) } : i));
  const clearCart = () => setCart([]);

  const loadOrders = useCallback(async () => { const d = await api.getOrders(); setOrders(d); }, []);
  const checkout = async () => {
    if (!cart.length) return;
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const items_count = cart.reduce((s, i) => s + i.qty, 0);
    const suppliers = Array.from(new Set(cart.map(i => i.supplier)));
    const order = await api.createOrder({ total, items_count, suppliers });
    setOrders(prev => [{ ...order, total, items_count, suppliers, date: new Date().toLocaleDateString('ru-RU') }, ...prev]);
    clearCart();
  };

  return (
    <Ctx.Provider value={{
      user, loading, login, loginDemo, register, logout, verify,
      projects, loadProjects, createProject,
      specs, loadSpecs, createSpec,
      specRows, loadSpecRows, addSpecRow, updateSpecRow, deleteSpecRow,
      cart, addToCart, removeFromCart, setQty, clearCart,
      orders, loadOrders, checkout,
    }}>
      {children}
    </Ctx.Provider>
  );
};

export const useStore = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useStore must be used within StoreProvider');
  return c;
};
