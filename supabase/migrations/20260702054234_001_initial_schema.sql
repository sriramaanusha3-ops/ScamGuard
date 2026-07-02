/*
# Initial Database Schema for AI Job Scam Detector

1. Overview
This migration creates the core tables for the AI-powered Job & Internship Scam Detection Platform.
The application requires user authentication, so all tables are owner-scoped with RLS policies.

2. New Tables
- `profiles` - User profile information (extends auth.users)
- `reports` - Analysis reports from document scans
- `detected_issues` - Individual issues detected in documents
- `company_verifications` - Company verification results
- `recruiter_verifications` - Recruiter verification results
- `agent_logs` - Execution logs from LangGraph agents
- `chat_messages` - AI chat conversation history
- `saved_companies` - User's favorite/bookmarked companies
- `notifications` - User notifications

3. Security
- Enable RLS on all tables
- Owner-scoped CRUD policies for authenticated users
- Cascade deletes for related data

4. Important Notes
1) All user_id columns have DEFAULT auth.uid() so inserts work without passing user_id
2) Reports cascade delete when user is deleted
3) Agent logs are tied to specific reports
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  avatar_url text,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Reports table - main analysis results
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('offer_letter', 'internship_letter', 'certificate', 'resume', 'job_description')),
  document_name text NOT NULL,
  document_url text,
  extracted_text text,
  risk_score integer NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  trust_score integer NOT NULL DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
  confidence_score integer NOT NULL DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  verdict text NOT NULL DEFAULT 'unknown' CHECK (verdict IN ('safe', 'suspicious', 'dangerous', 'unknown')),
  risk_level text NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  ai_summary text,
  company_name text,
  company_website text,
  recruiter_name text,
  recruiter_email text,
  salary_offered numeric,
  salary_currency text DEFAULT 'INR',
  recommendations jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Index for user's reports
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reports_select_own" ON reports;
CREATE POLICY "reports_select_own" ON reports FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "reports_insert_own" ON reports;
CREATE POLICY "reports_insert_own" ON reports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reports_update_own" ON reports;
CREATE POLICY "reports_update_own" ON reports FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reports_delete_own" ON reports;
CREATE POLICY "reports_delete_own" ON reports FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Detected issues table
CREATE TABLE IF NOT EXISTS detected_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  category text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description text NOT NULL,
  evidence text,
  confidence integer DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_detected_issues_report_id ON detected_issues(report_id);

ALTER TABLE detected_issues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "issues_select_own" ON detected_issues;
CREATE POLICY "issues_select_own" ON detected_issues FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM reports WHERE reports.id = detected_issues.report_id AND reports.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "issues_insert_own" ON detected_issues;
CREATE POLICY "issues_insert_own" ON detected_issues FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM reports WHERE reports.id = detected_issues.report_id AND reports.user_id = auth.uid())
  );

-- Company verifications table
CREATE TABLE IF NOT EXISTS company_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  website text,
  domain_age_days integer,
  ssl_valid boolean DEFAULT false,
  https_enabled boolean DEFAULT false,
  website_reachable boolean DEFAULT false,
  career_page_exists boolean DEFAULT false,
  contact_page_exists boolean DEFAULT false,
  linkedin_exists boolean DEFAULT false,
  github_exists boolean DEFAULT false,
  privacy_policy_exists boolean DEFAULT false,
  terms_exists boolean DEFAULT false,
  whois_registrar text,
  whois_creation_date timestamptz,
  reputation_score integer DEFAULT 0 CHECK (reputation_score >= 0 AND reputation_score <= 100),
  verification_score integer DEFAULT 0 CHECK (verification_score >= 0 AND verification_score <= 100),
  raw_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_verifications_user_id ON company_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_company_verifications_report_id ON company_verifications(report_id);

ALTER TABLE company_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "company_verifications_select_own" ON company_verifications;
CREATE POLICY "company_verifications_select_own" ON company_verifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "company_verifications_insert_own" ON company_verifications;
CREATE POLICY "company_verifications_insert_own" ON company_verifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Recruiter verifications table
CREATE TABLE IF NOT EXISTS recruiter_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  recruiter_name text,
  recruiter_email text NOT NULL,
  recruiter_phone text,
  linkedin_url text,
  is_disposable_email boolean DEFAULT false,
  is_public_email_provider boolean DEFAULT false,
  domain_matches_company boolean DEFAULT false,
  email_reputation_score integer DEFAULT 0 CHECK (email_reputation_score >= 0 AND email_reputation_score <= 100),
  linkedin_verified boolean DEFAULT false,
  consistency_score integer DEFAULT 0 CHECK (consistency_score >= 0 AND consistency_score <= 100),
  raw_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recruiter_verifications_user_id ON recruiter_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_verifications_report_id ON recruiter_verifications(report_id);

ALTER TABLE recruiter_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "recruiter_verifications_select_own" ON recruiter_verifications;
CREATE POLICY "recruiter_verifications_select_own" ON recruiter_verifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "recruiter_verifications_insert_own" ON recruiter_verifications;
CREATE POLICY "recruiter_verifications_insert_own" ON recruiter_verifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Agent logs table - tracks LangGraph agent execution
CREATE TABLE IF NOT EXISTS agent_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  agent_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  output text,
  error text,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100)
);

CREATE INDEX IF NOT EXISTS idx_agent_logs_report_id ON agent_logs(report_id);

ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agent_logs_select_own" ON agent_logs;
CREATE POLICY "agent_logs_select_own" ON agent_logs FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM reports WHERE reports.id = agent_logs.report_id AND reports.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "agent_logs_insert_own" ON agent_logs;
CREATE POLICY "agent_logs_insert_own" ON agent_logs FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM reports WHERE reports.id = agent_logs.report_id AND reports.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "agent_logs_update_own" ON agent_logs;
CREATE POLICY "agent_logs_update_own" ON agent_logs FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM reports WHERE reports.id = agent_logs.report_id AND reports.user_id = auth.uid())
  );

-- Chat messages table - AI assistant conversations
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  citations jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_report_id ON chat_messages(report_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_messages_select_own" ON chat_messages;
CREATE POLICY "chat_messages_select_own" ON chat_messages FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "chat_messages_insert_own" ON chat_messages;
CREATE POLICY "chat_messages_insert_own" ON chat_messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Saved companies table - user favorites
CREATE TABLE IF NOT EXISTS saved_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  company_website text,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, company_name)
);

CREATE INDEX IF NOT EXISTS idx_saved_companies_user_id ON saved_companies(user_id);

ALTER TABLE saved_companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "saved_companies_select_own" ON saved_companies;
CREATE POLICY "saved_companies_select_own" ON saved_companies FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_companies_insert_own" ON saved_companies;
CREATE POLICY "saved_companies_insert_own" ON saved_companies FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_companies_delete_own" ON saved_companies;
CREATE POLICY "saved_companies_delete_own" ON saved_companies FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('warning', 'error', 'success', 'info')),
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert_own" ON notifications;
CREATE POLICY "notifications_insert_own" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
