import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Хүсэлт бүрд Header-т Bearer Token автоматаар залгах
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Токен дууссан (401) үед Токен шинэчлэх (Refresh)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = Cookies.get('refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/token/refresh/`, {
            refresh: refreshToken,
          });
          const { access } = res.data;
          Cookies.set('access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh токен хүчингүй болсон үед нэвтрэх хуудас руу шилжүүлэх
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
