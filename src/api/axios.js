import axios from 'axios';
import { getApiBaseUrl } from '../utils/apiBaseUrl';
import { clearBossSession } from '../utils/bossAuthStorage';

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  const token =
    localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      void clearBossSession();
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      if (path.startsWith('/boss') && !path.includes('/login')) {
        window.location.replace('/boss/login');
      }
    }
    return Promise.reject(error);
  },
);

export default api;
