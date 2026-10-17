import api from '../../lib/api';
import { Proposal, CreateProposalData } from '../types/proposal';

export const getProposals = async (): Promise<Proposal[]> => {
  const response = await api.get('/proposals/');
  return response.data;
};

export const getProposalDetail = async (id: number): Promise<Proposal> => {
  const response = await api.get(`/proposals/${id}/`);
  return response.data;
};

export const createProposal = async (data: CreateProposalData): Promise<Proposal> => {
  const response = await api.post('/proposals/', data);
  return response.data;
};

export const uploadProposalDocument = async (proposalId: number, file: File, docType: string = 'PROTOCOL') => {
  const formData = new FormData();
  formData.append('proposal', proposalId.toString());
  formData.append('file', file);
  formData.append('document_type', docType);

  const response = await api.post('/documents/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const assignReviewer = async (proposalId: number, reviewerId: number) => {
  const response = await api.post(`/proposals/${proposalId}/assign-reviewer/`, {
    reviewer_id: reviewerId,
  });
  return response.data;
};
