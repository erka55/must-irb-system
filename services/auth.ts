import api from '../lib/api';
import Cookies from 'js-cookie';

export interface LoginCredentials {
  username: string;
  password: string;
}

export const login = async (credentials: LoginCredentials) => {
  const response = await api.post('/token/', credentials);
  const { access, refresh } = response.data;

  // Токенуудаа Cookie-д хадгалах
  Cookies.set('access_token', access, { expires: 1 }); // 1 өдөр
  Cookies.set('refresh_token', refresh, { expires: 7 }); // 7 өдөр

  return response.data;
};

export const logout = () => {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
  window.location.href = '/login';
};
