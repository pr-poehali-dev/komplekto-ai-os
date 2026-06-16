export type Product = {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  supplier: string;
  rating: number;
  stock: number;
  delivery: number;
};

export type Supplier = {
  id: string;
  name: string;
  rating: number;
  delivery: number;
  priceIndex: number;
  orders: number;
  logo: string;
};

export const categories = ['Сантехника', 'Плитка', 'Освещение', 'Мебель', 'Отделка', 'Двери'];

export const products: Product[] = [
  { id: 'p1', name: 'Смеситель Grohe Essence', category: 'Сантехника', image: '🚿', price: 18900, supplier: 'СтройОпт', rating: 4.8, stock: 24, delivery: 2 },
  { id: 'p2', name: 'Керамогранит Marazzi 60×60', category: 'Плитка', image: '🟫', price: 2400, supplier: 'ПлиткаПро', rating: 4.6, stock: 320, delivery: 5 },
  { id: 'p3', name: 'Подвесной светильник Vibia', category: 'Освещение', image: '💡', price: 34500, supplier: 'LightHouse', rating: 4.9, stock: 8, delivery: 7 },
  { id: 'p4', name: 'Диван модульный Minotti', category: 'Мебель', image: '🛋️', price: 289000, supplier: 'MebelLux', rating: 5.0, stock: 3, delivery: 21 },
  { id: 'p5', name: 'Краска Little Greene 5л', category: 'Отделка', image: '🎨', price: 7800, supplier: 'СтройОпт', rating: 4.7, stock: 56, delivery: 3 },
  { id: 'p6', name: 'Дверь скрытого монтажа', category: 'Двери', image: '🚪', price: 42000, supplier: 'DoorMaster', rating: 4.5, stock: 12, delivery: 14 },
  { id: 'p7', name: 'Унитаз подвесной Duravit', category: 'Сантехника', image: '🚽', price: 32100, supplier: 'ПлиткаПро', rating: 4.8, stock: 18, delivery: 4 },
  { id: 'p8', name: 'Бра настенное Flos', category: 'Освещение', image: '🔦', price: 21300, supplier: 'LightHouse', rating: 4.7, stock: 15, delivery: 6 },
];

export const suppliers: Supplier[] = [
  { id: 's1', name: 'СтройОпт', rating: 4.8, delivery: 3, priceIndex: 92, orders: 1240, logo: '🏗️' },
  { id: 's2', name: 'ПлиткаПро', rating: 4.6, delivery: 5, priceIndex: 88, orders: 980, logo: '🧱' },
  { id: 's3', name: 'LightHouse', rating: 4.9, delivery: 7, priceIndex: 105, orders: 540, logo: '💡' },
  { id: 's4', name: 'MebelLux', rating: 5.0, delivery: 21, priceIndex: 120, orders: 320, logo: '🛋️' },
  { id: 's5', name: 'DoorMaster', rating: 4.5, delivery: 14, priceIndex: 96, orders: 410, logo: '🚪' },
];

export const komiInsights = [
  { icon: 'TrendingDown', title: 'Экономия найдена', text: 'Замена смесителя на аналог снизит бюджет проекта «Бадаевский» на 4%.', tone: 'good' },
  { icon: 'AlertTriangle', title: 'Риск срыва срока', text: 'MebelLux: средний срок вырос до 21 дня. Рассмотрите альтернативу.', tone: 'warn' },
  { icon: 'TrendingUp', title: 'Рост цен', text: 'Керамогранит подорожает на ~6% в следующем квартале. Закупите сейчас.', tone: 'warn' },
];

export const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';