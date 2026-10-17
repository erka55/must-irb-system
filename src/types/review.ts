export type DecisionRecommendation = 
  | 'APPROVE'
  | 'MINOR_REVISION'
  | 'MAJOR_REVISION'
  | 'REJECT';

export interface Review {
  id: number;
  proposal: number;
  reviewer: number;
  reviewer_name?: string;
  comments: string;
  recommendation: DecisionRecommendation;
  submitted_at?: string;
}
