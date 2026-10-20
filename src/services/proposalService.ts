import axios from 'axios';
import { Proposal, CreateProposalData } from '../types/proposal';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // localStorage -> sessionStorage
      const token = sessionStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getProposals = async (): Promise<Proposal[]> => {
  const res = await api.get('/proposals/');
  return res.data;
};

export const getProposalById = async (id: string | number): Promise<Proposal> => {
  const res = await api.get(`/proposals/${id}/`);
  return res.data;
};

export const createProposal = async (data: CreateProposalData): Promise<Proposal> => {
  const res = await api.post('/proposals/', data);
  return res.data;
};

export const uploadProposalDocument = async (proposalId: number | string, formData: FormData) => {
  const res = await api.post(`/proposals/${proposalId}/upload-document/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export default api;
