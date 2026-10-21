import api from './proposalService';
import { User } from '../types/auth';

export const getReviewers = async (): Promise<User[]> => {
  const response = await api.get('/proposals/reviewers/');
  return response.data;
};

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/users/');
  return response.data;
};