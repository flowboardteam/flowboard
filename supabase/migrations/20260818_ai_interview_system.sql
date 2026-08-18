-- Flowboard AI Interview & Assessment System Schema Migration

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COMPANIES & MEMBERS (IF NOT EXISTING)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    website TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. JOBS TABLE
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    department TEXT,
    description TEXT NOT NULL,
    raw_description TEXT,
    seniority TEXT,
    experience_years INTEGER,
    salary_range TEXT,
    employment_type TEXT,
    location TEXT,
    time_zone TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. JOB COMPETENCIES (INTERVIEW BLUEPRINT)
CREATE TABLE IF NOT EXISTS public.job_competencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    weight_percentage NUMERIC(5,2) NOT NULL DEFAULT 20.00,
    evaluation_criteria JSONB NOT NULL DEFAULT '[]',
    suggested_questions JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CANDIDATES & INVITATIONS
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    resume_url TEXT,
    skills TEXT[] DEFAULT '{}',
    experience_years INTEGER,
    current_title TEXT,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES public.candidates(id) ON DELETE SET NULL,
    token TEXT UNIQUE NOT NULL,
    candidate_email TEXT NOT NULL,
    candidate_name TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INTERVIEW SESSIONS & TRANSCRIPT
CREATE TABLE IF NOT EXISTS public.interview_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invitation_id UUID REFERENCES public.invitations(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'setup',
    format TEXT NOT NULL DEFAULT 'text',
    current_competency_id UUID REFERENCES public.job_competencies(id),
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    state_data JSONB NOT NULL DEFAULT '{
        "questions_asked": 0,
        "max_questions": 8,
        "competency_index": 0,
        "completed_competencies": []
    }',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.interview_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
    sender TEXT NOT NULL,
    content TEXT NOT NULL,
    audio_url TEXT,
    competency_id UUID REFERENCES public.job_competencies(id),
    action_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. INTERVIEW REPORTS & EVALUATION
CREATE TABLE IF NOT EXISTS public.interview_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    overall_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    recommendation TEXT NOT NULL DEFAULT 'Consider',
    summary TEXT NOT NULL DEFAULT '',
    key_strengths TEXT[] DEFAULT '{}',
    key_concerns TEXT[] DEFAULT '{}',
    competency_scores JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES (ENABLE PUBLIC READ/WRITE FOR INVITATION AND SESSION TO ALLOW UNATHENTICATED CANDIDATES)
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read jobs" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Allow public all jobs" ON public.jobs FOR ALL USING (true);

CREATE POLICY "Allow public all competencies" ON public.job_competencies FOR ALL USING (true);
CREATE POLICY "Allow public all candidates" ON public.candidates FOR ALL USING (true);
CREATE POLICY "Allow public all invitations" ON public.invitations FOR ALL USING (true);
CREATE POLICY "Allow public all sessions" ON public.interview_sessions FOR ALL USING (true);
CREATE POLICY "Allow public all messages" ON public.interview_messages FOR ALL USING (true);
CREATE POLICY "Allow public all reports" ON public.interview_reports FOR ALL USING (true);
