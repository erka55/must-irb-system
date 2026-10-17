import api from '../../lib/api';
import { User } from '../types/auth';

export const getReviewers = async (): Promise<User[]> => {
  const response = await api.get('/users/users/?role=REVIEWER');
  return response.data;
};

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/users/users/');
  return response.data;
};
