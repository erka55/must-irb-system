export type MeetingStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface DecisionLog {
  id: number;
  meeting: number;
  proposal: number;
  decision: 'APPROVED' | 'REJECTED' | 'REVISION_REQUIRED';
  decision_display: string;
  meeting_minutes: string;
  recorded_by: number;
  recorded_by_name: string;
  created_at: string;
}

export interface Meeting {
  id: number;
  title: string;
  meeting_date: string;
  location: string;
  status: MeetingStatus;
  status_display: string;
  proposals: number[]; // Proposal ID-нууд
  decisions: DecisionLog[];
  created_at: string;
  updated_at: string;
}
