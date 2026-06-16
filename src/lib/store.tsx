import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Product, Project, initialProjects } from './data';

type User = { name: string; email: string; role: string };
type CartItem = Product & { qty: number };
type Order = { id: string; date: string; total: number; items: number; status: string; suppliers: string[] };

type Store = {
  user: User | null;
  login: (email: string, name: string, role: string) => void;
  logout: () => void;
  projects: Project[];
  addProject: (p: Omit<Project, 'id'>) => void;
  cart: CartItem[];
  addToCart: (p: Product) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  orders: Order[];
  checkout: () => void;
};

const Ctx = createContext<Store | null>(null);

const load = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => load('komi_user', null));
  const [projects, setProjects] = useState<Project[]>(() => load('komi_projects', initialProjects));
  const [cart, setCart] = useState<CartItem[]>(() => load('komi_cart', []));
  const [orders, setOrders] = useState<Order[]>(() => load('komi_orders', []));

  useEffect(() => localStorage.setItem('komi_user', JSON.stringify(user)), [user]);
  useEffect(() => localStorage.setItem('komi_projects', JSON.stringify(projects)), [projects]);
  useEffect(() => localStorage.setItem('komi_cart', JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem('komi_orders', JSON.stringify(orders)), [orders]);

  const login = (email: string, name: string, role: string) => setUser({ email, name, role });
  const logout = () => setUser(null);

  const addProject = (p: Omit<Project, 'id'>) => setProjects((prev) => [{ ...p, id: 'pr' + Date.now() }, ...prev]);

  const addToCart = (p: Product) =>
    setCart((prev) => {
      const ex = prev.find((i) => i.id === p.id);
      if (ex) return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...p, qty: 1 }];
    });
  const removeFromCart = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id));
  const setQty = (id: string, qty: number) =>
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)));
  const clearCart = () => setCart([]);

  const checkout = () => {
    if (!cart.length) return;
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const items = cart.reduce((s, i) => s + i.qty, 0);
    const supps = Array.from(new Set(cart.map((i) => i.supplier)));
    const order: Order = {
      id: 'ORD-' + Math.floor(Math.random() * 9000 + 1000),
      date: new Date().toLocaleDateString('ru-RU'),
      total,
      items,
      status: 'Сборка',
      suppliers: supps,
    };
    setOrders((prev) => [order, ...prev]);
    setCart([]);
  };

  return (
    <Ctx.Provider value={{ user, login, logout, projects, addProject, cart, addToCart, removeFromCart, setQty, clearCart, orders, checkout }}>
      {children}
    </Ctx.Provider>
  );
};

export const useStore = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useStore must be used within StoreProvider');
  return c;
};
