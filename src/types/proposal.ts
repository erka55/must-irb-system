export interface Document {
  id?: number | string;
  proposal?: number | string;
  document_type?: string;
  document_type_display?: string;
  file?: string;
  uploaded_at?: string;
}

export interface Reviewer {
  id: number | string;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface Proposal {
  id: number | string;
  title: string;
  summary?: string;
  status: string;
  status_display?: string;
  researcher?: number;
  researcher_name?: string;
  reviewers?: Reviewer[];
  created_at?: string;
  updated_at?: string;
  documents?: Document[];
  reviews?: any[];
  final_decisions?: any[];
}
