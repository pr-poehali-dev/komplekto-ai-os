const API_URL = 'https://functions.poehali.dev/5662d43a-e968-4dea-9e07-995c64341cab';
const KOMI_URL = 'https://functions.poehali.dev/822169c7-58e4-4402-b513-122a99148925';

const getToken = () => localStorage.getItem('komi_token') || '';

const req = async (url: string, method = 'GET', body?: object) => {
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': getToken(),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка сервера');
  return data;
};

export const api = {
  // Auth
  login: (email: string, password: string) => req(`${API_URL}/auth/login`, 'POST', { email, password }),
  register: (name: string, email: string, password: string, role: string) =>
    req(`${API_URL}/auth/register`, 'POST', { name, email, password, role }),
  me: () => req(`${API_URL}/auth/me`),
  verify: (code: string) => req(`${API_URL}/auth/verify`, 'POST', { code }),

  // Projects
  getProjects: () => req(`${API_URL}/projects`),
  createProject: (data: object) => req(`${API_URL}/projects`, 'POST', data),
  updateProject: (id: number, data: object) => req(`${API_URL}/projects/${id}`, 'PUT', data),

  // Specs
  getSpecs: (project_id: number) => req(`${API_URL}/specs?project_id=${project_id}`),
  createSpec: (project_id: number, name: string) => req(`${API_URL}/specs`, 'POST', { project_id, name }),
  getSpecRows: (spec_id: number) => req(`${API_URL}/specs/rows?spec_id=${spec_id}`),
  addSpecRow: (data: object) => req(`${API_URL}/specs/rows`, 'POST', data),
  updateSpecRow: (id: number, data: object) => req(`${API_URL}/specs/rows/${id}`, 'PUT', data),
  deleteSpecRow: (id: number) => req(`${API_URL}/specs/rows/${id}`, 'DELETE'),

  // Orders
  getOrders: () => req(`${API_URL}/orders`),
  createOrder: (data: object) => req(`${API_URL}/orders`, 'POST', data),
  updateOrderStatus: (id: number, status: string) => req(`${API_URL}/orders/${id}`, 'PUT', { status }),

  // Admin
  adminStats: () => req(`${API_URL}/admin/stats`),
  adminMembers: () => req(`${API_URL}/admin/members`),
  adminVerify: (id: number) => req(`${API_URL}/admin/members/${id}/verify`, 'PUT'),
  adminBlock: (id: number, blocked: boolean) => req(`${API_URL}/admin/members/${id}/block`, 'PUT', { blocked }),

  // KOMI
  komiAsk: (message: string) => req(`${KOMI_URL}/`, 'POST', { message }),
  komiHistory: () => req(`${KOMI_URL}/history`),
};
