import axios from 'axios';

const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001/api').replace(/\/$/, '');

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export function getApiError(error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.data) {
      const payload = error.response.data;
      if (typeof payload.detail === 'string') return payload.detail;
      const firstField = Object.values(payload).flat(Infinity).find((value) => typeof value === 'string');
      if (firstField) return firstField;
    }
    if (error.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
    if (!error.response) return 'The API is unreachable. Is the Django server running?';
  }
  return 'Something went wrong. Please try again.';
}

export default api;
