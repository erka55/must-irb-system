import api from '../lib/api';

// Proposal дата загвар
export interface Proposal {
  id: number;
  application_no?: string;
  title: string;
  summary?: string;
  methodology?: string;
  status: string;
  status_display?: string;
  review_level?: string;
  review_level_display?: string;
  researcher?: number;
  researcher_name?: string;
  created_at?: string;
  updated_at?: string;
  submitted_at?: string;
  documents?: any[];
  reviews?: any[];
  final_decisions?: any[];
}

// Шинэ Proposal үүсгэхэд дамжуулах өгөгдлийн бүтцийн интерфейс
export interface CreateProposalData {
  title: string;
  summary: string;
  methodology: string;
}

// 1. Хэрэглэгчийн/систем дэх бүх хүсэлтийг унших
export const getProposals = async (): Promise<Proposal[]> => {
  const response = await api.get('/proposals/');
  return response.data;
};

// 2. Тодорхой нэг хүсэлтийн дэлгэрэнгүйг унших (Дэлгэрэнгүй хуудсанд зориулсан)
export const getProposalDetail = async (id: number): Promise<Proposal> => {
  const response = await api.get(`/proposals/${id}/`);
  return response.data;
};

// 3. Статистик / хяналтын мэдээлэл авах
export const getProposalStats = async () => {
  const response = await api.get('/proposals/stats/');
  return response.data;
};

// 4. Шинэ хүсэлт үүсгэх API
export const createProposal = async (data: CreateProposalData): Promise<Proposal> => {
  const response = await api.post('/proposals/', data);
  return response.data;
};

// 5. Төсөлд баримт бичиг / файл хавсаргаж хуулах
export const uploadProposalDocument = async (proposalId: number, file: File, docType: string = 'PROTOCOL') => {
  const formData = new FormData();
  formData.append('proposal', proposalId.toString());
  formData.append('file', file);
  formData.append('document_type', docType);

  const response = await api.post('/documents/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// 6. Шүүмжлэгч (Reviewer) томилох API
export const assignReviewer = async (proposalId: number, reviewerId: number) => {
  const response = await api.post(`/proposals/${proposalId}/assign_reviewer/`, {
    reviewer_id: reviewerId,
  });
  return response.data;
};

// 7. Системийн Шүүмжлэгчдийн (Reviewers) жагсаалтыг авах API
export const getReviewers = async () => {
  const response = await api.get('/users/all/?role=REVIEWER');
  return response.data;
};
