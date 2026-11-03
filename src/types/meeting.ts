import { Proposal } from './proposal';

export type MeetingStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type FinalDecision = 'APPROVED' | 'REJECTED' | 'REVISION_REQUIRED';

export interface DecisionLog {
    id: number;
    meeting: number;
    proposal: number;
    decision: FinalDecision;
    decision_display: string;
    meeting_minutes?: string;
    protocol_file?: string;
    recorded_by: number;
    recorded_by_name: string;
    created_at: string;
}

export interface Meeting {
    id: number;
    title: string;
    meeting_date: string;
    location?: string;
    status: MeetingStatus;
    status_display: string;
    proposals: number[];
    proposals_detail?: any[];
    decisions: DecisionLog[];
    created_at: string;
    updated_at: string;
}
