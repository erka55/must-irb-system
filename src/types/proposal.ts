export type ProposalStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'REVISION_REQUIRED'
  | 'APPROVED'
  | 'REJECTED';

export interface ProposalDocument {
  id: number;
  file: string;
  document_type: string;
  uploaded_at: string;
}

export interface Proposal {
  id: number;
  application_no?: string;
  title: string;
  summary?: string;
  methodology?: string;
  status: ProposalStatus;
  status_display?: string;
  review_level?: string;
  review_level_display?: string;
  researcher?: number;
  researcher_name?: string;
  reviewers?: number[];
  reviewer_details?: Array<{ id: number; username: string; email: string }>;
  created_at?: string;
  updated_at?: string;
  submitted_at?: string;
  documents?: ProposalDocument[];
  reviews?: any[];
  final_decisions?: any[];
}

export interface CreateProposalData {
  title: string;
  summary: string;
  methodology: string;
}
