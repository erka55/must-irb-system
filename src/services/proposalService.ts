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
      const token = sessionStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 1. Бүх хүсэлтийг татах (Export шаардлагатай)
export const getProposals = async (): Promise<Proposal[]> => {
  const res = await api.get('/proposals/');
  return res.data;
};

// 2. ID-гаар тухайн хүсэлтийг татах
export const getProposalById = async (id: string | number): Promise<Proposal> => {
  const res = await api.get(`/proposals/${id}/`);
  return res.data;
};

// 3. Шинэ хүсэлт үүсгэх
export const createProposal = async (data: CreateProposalData): Promise<Proposal> => {
  const res = await api.post('/proposals/', data);
  return res.data;
};

// 4. Файл хуулах
export const uploadProposalDocument = async (
  proposalId: number | string,
  file: File,
  docType: string = 'PROTOCOL'
) => {
  const formData = new FormData();
  formData.append('proposal', proposalId.toString());
  formData.append('file', file);
  formData.append('document_type', docType);

  // API замыг /documents/ болгон засна
  const res = await api.post('/documents/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// 5. Шүүмжлэгчдийн жагсаалт авах
export const getReviewers = async () => {
  const res = await api.get('/proposals/reviewers/');
  return res.data;
};

// 6. Шүүмжлэгч томилох
export const assignReviewer = async (proposalId: number | string, reviewerId: number | string) => {
  const res = await api.post(`/proposals/${proposalId}/assign-reviewer/`, {
    reviewer_id: reviewerId,
  });
  return res.data;
};

// 7. Тухайн төслийн баримт бичгүүдийг татах
export const getProposalDocuments = async (proposalId: string | number) => {
  const res = await api.get(`/documents/?proposal=${proposalId}`);
  return res.data;
};

// 8. Баримт бичиг устгах
export const deleteProposalDocument = async (docId: number) => {
  const res = await api.delete(`/documents/${docId}/`);
  return res.data;
};

// 9. Ноорог төслийг албан ёсоор илгээх
export const submitProposal = async (proposalId: number | string) => {
  const res = await api.post(`/proposals/${proposalId}/submit/`);
  return res.data;
};

// 10. Ноорог төслийг устгах
export const deleteProposal = async (id: string | number): Promise<void> => {
  await api.delete(`/proposals/${id}/`);
};

// 11. Төслийн мэдээлэл шинэчлэх (Засах)
export const updateProposal = async (id: string | number, data: { title?: string, summary?: string }): Promise<Proposal> => {
  const res = await api.patch(`/proposals/${id}/`, data);
  return res.data;
};

// 12. Шүүмжлэгчийн дүгнэлт оруулах
export const submitReview = async (data: { proposal: number | string; comments: string; decision: string }) => {
  const res = await api.post('/reviews/', data);
  return res.data;
};

export default api;
