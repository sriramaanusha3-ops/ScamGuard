export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export interface AnalysisReport {
  id: string;
  user_id: string;
  document_type: 'offer_letter' | 'internship_letter' | 'certificate' | 'resume' | 'job_description';
  document_name: string;
  extracted_text: string;
  risk_score: number;
  trust_score: number;
  confidence_score: number;
  verdict: 'safe' | 'suspicious' | 'dangerous' | 'unknown';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  detected_issues: DetectedIssue[];
  recommendations: string[];
  company_info: CompanyInfo | null;
  recruiter_info: RecruiterInfo | null;
  salary_analysis: SalaryAnalysis | null;
  ai_summary: string;
  agent_logs: AgentLog[];
  created_at: string;
}

export interface DetectedIssue {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: string;
  confidence: number;
}

export interface CompanyInfo {
  name: string;
  website: string;
  domain_age_days?: number;
  ssl_valid: boolean;
  https_enabled: boolean;
  website_reachable: boolean;
  career_page_exists: boolean;
  contact_page_exists: boolean;
  linkedin_exists: boolean;
  github_exists: boolean;
  privacy_policy_exists: boolean;
  terms_exists: boolean;
  whois_info?: WhoisInfo;
  reputation_score: number;
  verification_score: number;
}

export interface WhoisInfo {
  registrar: string;
  creation_date?: string;
  expiration_date?: string;
  name_servers: string[];
  status: string;
}

export interface RecruiterInfo {
  name: string;
  email: string;
  phone?: string;
  linkedin_url?: string;
  is_disposable_email: boolean;
  is_public_email: boolean;
  domain_matches_company: boolean;
  email_reputation_score: number;
  linkedin_verified: boolean;
  consistency_score: number;
}

export interface SalaryAnalysis {
  offered_amount: number;
  currency: string;
  market_low: number;
  market_high: number;
  market_median: number;
  deviation_percentage: number;
  assessment: 'too_low' | 'reasonable' | 'too_high' | 'unrealistic';
  confidence: number;
}

export interface AgentLog {
  agent_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  output?: string;
  error?: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  output?: string;
  error?: string;
}

export interface ScamPattern {
  id: string;
  pattern: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  found: boolean;
  evidence?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: string[];
}

export interface ResumeAnalysis {
  skills: string[];
  experience_years: number;
  education: Education[];
  ats_score: number;
  skill_gaps: string[];
  match_percentage: number;
  missing_skills: string[];
  recommendations: string[];
}

export interface Education {
  degree: string;
  institution: string;
  year: number;
}

export interface JobMatch {
  resume_id: string;
  job_id: string;
  match_percentage: number;
  matching_skills: string[];
  missing_skills: string[];
  recommendations: string[];
}

export interface Notification {
  id: string;
  type: 'warning' | 'error' | 'success' | 'info';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface AnalysisHistory {
  id: string;
  document_name: string;
  document_type: string;
  risk_score: number;
  verdict: string;
  created_at: string;
}

export interface DashboardStats {
  total_analyses: number;
  safe_count: number;
  suspicious_count: number;
  dangerous_count: number;
  average_risk_score: number;
  average_trust_score: number;
  most_common_issues: { issue: string; count: number }[];
  risk_trend: { date: string; score: number }[];
}

export interface ExportFormat {
  type: 'pdf' | 'excel' | 'json' | 'csv';
  include_details: boolean;
  include_recommendations: boolean;
  include_evidence: boolean;
}

export interface Theme {
  mode: 'light' | 'dark';
  primary_color: string;
  accent_color: string;
}

export interface AppState {
  user: User | null;
  theme: Theme;
  currentAnalysis: AnalysisReport | null;
  analysisHistory: AnalysisHistory[];
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
}

export const RISK_THRESHOLDS = {
  low: { min: 0, max: 25, label: 'Low Risk', color: 'success' },
  medium: { min: 26, max: 50, label: 'Medium Risk', color: 'warning' },
  high: { min: 51, max: 75, label: 'High Risk', color: 'danger' },
  critical: { min: 76, max: 100, label: 'Critical Risk', color: 'danger' },
} as const;

export const SCAM_PATTERNS: Record<string, ScamPattern> = {
  registration_fee: {
    id: 'registration_fee',
    pattern: /(registration\s*fee|registration\s*payment)/i,
    category: 'financial',
    severity: 'high',
    description: 'Request for registration fee',
    found: false,
  },
  security_deposit: {
    id: 'security_deposit',
    pattern: /(security\s*deposit|advance\s*deposit)/i,
    category: 'financial',
    severity: 'high',
    description: 'Request for security deposit',
    found: false,
  },
  training_fee: {
    id: 'training_fee',
    pattern: /(training\s*fee|training\s*cost|training\s*charges)/i,
    category: 'financial',
    severity: 'medium',
    description: 'Request for training fees',
    found: false,
  },
  equipment_purchase: {
    id: 'equipment_purchase',
    pattern: /(purchase\s*equipment|buy\s*laptop|buy\s*computer)/i,
    category: 'financial',
    severity: 'high',
    description: 'Equipment purchase requirement',
    found: false,
  },
  guaranteed_job: {
    id: 'guaranteed_job',
    pattern: /(guaranteed\s*job|100%\s*placement|assured\s*employment)/i,
    category: 'promise',
    severity: 'high',
    description: 'Unrealistic job guarantee',
    found: false,
  },
  work_from_home_easy: {
    id: 'work_from_home_easy',
    pattern: /(work\s*from\s*home.*easy|easy\s*money.*home|₹\d+\s*\/\s*day)/i,
    category: 'promise',
    severity: 'medium',
    description: 'Too good to be true work from home offer',
    found: false,
  },
  urgent_hiring: {
    id: 'urgent_hiring',
    pattern: /(urgent\s*hiring|immediate\s*joining|limited\s*seats)/i,
    category: 'pressure',
    severity: 'medium',
    description: 'Pressure tactics for quick decision',
    found: false,
  },
  telegram_whatsapp_only: {
    id: 'telegram_whatsapp_only',
    pattern: /(contact.*telegram|whatsapp.*only|telegram.*only)/i,
    category: 'communication',
    severity: 'high',
    description: 'Non-professional communication channels',
    found: false,
  },
  crypto_payment: {
    id: 'crypto_payment',
    pattern: /(bitcoin|cryptocurrency|crypto\s*payment)/i,
    category: 'financial',
    severity: 'high',
    description: 'Cryptocurrency payment request',
    found: false,
  },
  gift_card_payment: {
    id: 'gift_card_payment',
    pattern: /(gift\s*card|itunes\s*card|amazon\s*card)/i,
    category: 'financial',
    severity: 'critical',
    description: 'Gift card payment method',
    found: false,
  },
  personal_bank_account: {
    id: 'personal_bank_account',
    pattern: /(transfer\s*to\s*personal|deposit\s*to\s*personal\s*account)/i,
    category: 'financial',
    severity: 'high',
    description: 'Payment to personal bank account',
    found: false,
  },
  no_interview: {
    id: 'no_interview',
    pattern: /(no\s*interview|no\s*test|interview\s*not\s*required)/i,
    category: 'process',
    severity: 'high',
    description: 'No interview process',
    found: false,
  },
  processing_fee: {
    id: 'processing_fee',
    pattern: /(processing\s*fee|documentation\s*fee|admin\s*fee)/i,
    category: 'financial',
    severity: 'medium',
    description: 'Processing fee request',
    found: false,
  },
  unrealistic_salary: {
    id: 'unrealistic_salary',
    pattern: /(₹\s*\d+\s*lakhs?\s*pa.*freshers?|\d+\s*lpa.*no\s*experience)/i,
    category: 'promise',
    severity: 'high',
    description: 'Unrealistic salary for experience level',
    found: false,
  },
};

export const AGENT_WORKFLOW: Agent[] = [
  {
    id: 'pdf_extraction',
    name: 'PDF Extraction Agent',
    description: 'Extracts text content from uploaded PDF documents',
    icon: 'FileText',
    status: 'pending',
    progress: 0,
  },
  {
    id: 'ocr_agent',
    name: 'OCR Agent',
    description: 'Performs OCR on scanned documents and images',
    icon: 'Scan',
    status: 'pending',
    progress: 0,
  },
  {
    id: 'company_verification',
    name: 'Company Verification Agent',
    description: 'Verifies company website, domain, and online presence',
    icon: 'Building2',
    status: 'pending',
    progress: 0,
  },
  {
    id: 'domain_reputation',
    name: 'Domain Reputation Agent',
    description: 'Checks domain age, SSL, and reputation',
    icon: 'Globe',
    status: 'pending',
    progress: 0,
  },
  {
    id: 'scam_detection',
    name: 'Scam Pattern Detection Agent',
    description: 'Identifies known scam patterns and red flags',
    icon: 'AlertTriangle',
    status: 'pending',
    progress: 0,
  },
  {
    id: 'recruiter_verification',
    name: 'Recruiter Verification Agent',
    description: 'Verifies recruiter identity and email authenticity',
    icon: 'UserCheck',
    status: 'pending',
    progress: 0,
  },
  {
    id: 'salary_analysis',
    name: 'Salary Analysis Agent',
    description: 'Compares offered salary with market rates',
    icon: 'DollarSign',
    status: 'pending',
    progress: 0,
  },
  {
    id: 'risk_calculation',
    name: 'Risk Score Calculation Agent',
    description: 'Calculates overall risk score based on all findings',
    icon: 'Activity',
    status: 'pending',
    progress: 0,
  },
  {
    id: 'recommendation',
    name: 'Recommendation Agent',
    description: 'Generates actionable recommendations',
    icon: 'Lightbulb',
    status: 'pending',
    progress: 0,
  },
];
