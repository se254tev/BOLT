import axios from 'axios';
import API_BASE_URL from '../config/api';
import { notifyToast } from '../utils/toast';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

api.interceptors.request.use((request) => {
  const token = localStorage.getItem('bolt_admin_token');
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest?.url?.includes('/admin/auth/refresh') || originalRequest?.url?.includes('/admin/auth/login')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const resp = await refreshClient.post('/admin/auth/refresh');
        const newToken = resp.data?.data?.accessToken;
        if (newToken) {
          localStorage.setItem('bolt_admin_token', newToken);
          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
        throw new Error('Token refresh failed');
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('bolt_admin_token');
        localStorage.removeItem('bolt_admin_role');
        notifyToast('Session expired. Please sign in again.');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
