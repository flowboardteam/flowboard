export interface JobCompetency {
  id?: string;
  job_id?: string;
  name: string;
  description: string;
  weight_percentage: number;
  evaluation_criteria: Record<string, string>;
  suggested_questions: string[];
}

export interface Job {
  id: string;
  company_id?: string;
  title: string;
  department?: string;
  description: string;
  raw_description?: string;
  seniority?: string;
  experience_years?: number;
  salary_range?: string;
  employment_type?: string;
  location?: string;
  time_zone?: string;
  status: 'draft' | 'active' | 'paused' | 'closed';
  created_at: string;
  competencies?: JobCompetency[];
}

export interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  resume_url?: string;
  skills?: string[];
  experience_years?: number;
  current_title?: string;
  location?: string;
}

export interface Invitation {
  id: string;
  job_id: string;
  candidate_id?: string;
  token: string;
  candidate_email: string;
  candidate_name?: string;
  status: 'pending' | 'consent_given' | 'in_progress' | 'completed' | 'expired';
  expires_at: string;
  created_at: string;
  job?: Job;
  candidate?: Candidate;
}

export interface InterviewSession {
  id: string;
  invitation_id: string;
  job_id: string;
  candidate_id: string;
  status: 'setup' | 'in_progress' | 'completed' | 'abandoned' | 'evaluated';
  format: 'text' | 'voice';
  current_competency_id?: string;
  duration_minutes: number;
  started_at?: string;
  completed_at?: string;
  state_data: {
    questions_asked: number;
    max_questions: number;
    competency_index: number;
    completed_competencies: string[];
  };
  created_at: string;
}

export interface InterviewMessage {
  id: string;
  session_id: string;
  sender: 'interviewer' | 'candidate';
  content: string;
  audio_url?: string;
  competency_id?: string;
  action_type?: string;
  created_at: string;
}

export interface CompetencyScore {
  name: string;
  score: number;
  evidence: string[];
}

export interface InterviewReport {
  id: string;
  session_id: string;
  candidate_id: string;
  job_id: string;
  overall_score: number;
  recommendation: 'Strongly Recommend' | 'Recommend' | 'Consider' | 'Further Assessment' | 'Not Recommended';
  summary: string;
  key_strengths: string[];
  key_concerns: string[];
  competency_scores: CompetencyScore[];
  created_at: string;
  candidate?: Candidate;
  job?: Job;
}
