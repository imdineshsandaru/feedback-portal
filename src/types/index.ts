export interface Survey {
  id: string;
  title: string;
  description: string;
  type: 'client' | 'event';
  fields: FormField[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'rating' | 'date';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  surveyTitle: string;
  surveyType: 'client' | 'event';
  responses: Record<string, any>;
  submittedAt: Date;
  respondentEmail?: string;
}

export interface DashboardStats {
  totalResponses: number;
  clientFeedback: number;
  eventFeedback: number;
  avgRating: number;
  recentResponses: SurveyResponse[];
}