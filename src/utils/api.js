import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://vatu-backend.onrender.com/api';
// const API_URL = import.meta.env.VITE_API_URL || ' http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function get(path, config) {
  return api.get(path, config).then(res => res.data);
}

export function post(path, data, config) {
  return api.post(path, data, config).then(res => res.data);
}

export function put(path, data, config) {
  return api.put(path, data, config).then(res => res.data);
}

export function del(path, config) {
  return api.delete(path, config);
}

export { api }; 