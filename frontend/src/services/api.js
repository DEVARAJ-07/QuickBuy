import axios from 'axios';

const API = axios.create({ baseURL: '/api', withCredentials: true });

API.interceptors.request.use(cfg => {
  const t = localStorage.getItem('qb-token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

API.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('qb-token');
    localStorage.removeItem('qb-user');
    if (!window.location.pathname.includes('/login')) window.location.href = '/login';
  }
  return Promise.reject(err);
});

export default API;
