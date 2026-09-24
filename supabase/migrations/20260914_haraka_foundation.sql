-- Migration: Haraka AI Workforce Foundation Schema
-- File: supabase/migrations/20260914_haraka_foundation.sql
-- Description: Core orchestration tables for Haraka AI layer: agent configs, pending approvals, and execution logs.
-- Tenant isolation: Scoped to public.groups(id).

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. HARAKA AGENT CONFIGS
-- Stores configuration, autopilot toggles, and customized instructions per tenant group
CREATE TABLE IF NOT EXISTS public.haraka_agent_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    agent_id TEXT NOT NULL, -- 'mia' | 'sam' | 'randy' | 'arlan' | 'jane' | custom
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    autopilot_enabled BOOLEAN NOT NULL DEFAULT false,
    default_model TEXT DEFAULT NULL,
    autopilot_settings JSONB NOT NULL DEFAULT '{
        "daily_action_limit": 25,
        "auto_invite_threshold": 85,
        "require_approval_for_offers": true
    }',
    custom_instructions TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_haraka_agent_configs_group_agent UNIQUE (group_id, agent_id)
);

CREATE INDEX IF NOT EXISTS idx_haraka_agent_configs_group_id 
    ON public.haraka_agent_configs(group_id);
CREATE INDEX IF NOT EXISTS idx_haraka_agent_configs_lookup 
    ON public.haraka_agent_configs(group_id, agent_id);

-- 2. HARAKA PENDING ACTIONS (Human-in-the-Loop Safety Gate)
-- Staging queue for autonomous agent actions requiring recruiter confirmation
CREATE TABLE IF NOT EXISTS public.haraka_pending_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    agent_id TEXT NOT NULL,
    task TEXT NOT NULL,
    action_type TEXT NOT NULL, -- 'send_offer' | 'advance_stage' | 'reject_candidate' | 'amend_contract'
    target_entity_type TEXT NOT NULL, -- 'role' | 'candidate' | 'workforce_member' | 'interview'
    target_entity_id UUID NOT NULL,
    action_payload JSONB NOT NULL DEFAULT '{}',
    rationale TEXT NOT NULL,
    confidence_score NUMERIC(5,2) DEFAULT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'executed', 'cancelled')),
    proposed_by_agent TEXT NOT NULL DEFAULT 'haraka',
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ DEFAULT NULL,
    execution_error TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_haraka_pending_actions_group_status 
    ON public.haraka_pending_actions(group_id, status);
CREATE INDEX IF NOT EXISTS idx_haraka_pending_actions_target 
    ON public.haraka_pending_actions(target_entity_type, target_entity_id);

-- 3. HARAKA EXECUTION LOGS
-- Audit trail tracking execution, token usage, latency, and status (sanitized metadata only)
CREATE TABLE IF NOT EXISTS public.haraka_execution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    agent_id TEXT NOT NULL,
    task TEXT NOT NULL,
    trigger_mode TEXT NOT NULL DEFAULT 'manual' CHECK (trigger_mode IN ('manual', 'autopilot', 'event', 'test')),
    provider TEXT NOT NULL DEFAULT 'anthropic',
    model TEXT NOT NULL,
    prompt_version TEXT NOT NULL DEFAULT '1.0.0',
    prompt_tokens INT DEFAULT 0,
    completion_tokens INT DEFAULT 0,
    total_tokens INT GENERATED ALWAYS AS (COALESCE(prompt_tokens, 0) + COALESCE(completion_tokens, 0)) STORED,
    latency_ms INT DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed', 'blocked', 'timeout', 'rate_limited')),
    error_message TEXT DEFAULT NULL,
    tool_calls JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_haraka_execution_logs_group_created 
    ON public.haraka_execution_logs(group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_haraka_execution_logs_task 
    ON public.haraka_execution_logs(task, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_haraka_execution_logs_agent 
    ON public.haraka_execution_logs(agent_id, created_at DESC);

-- ── ROW LEVEL SECURITY (RLS) POLICIES ───────────────────────────────────────

ALTER TABLE public.haraka_agent_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haraka_pending_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haraka_execution_logs ENABLE ROW LEVEL SECURITY;

-- Helper check for group membership or ownership:
-- A user has access if they are the organization owner of the group OR a member in group_members.

-- 1. haraka_agent_configs policies
CREATE POLICY "Allow group members to view agent configs"
    ON public.haraka_agent_configs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.groups g 
            WHERE g.id = haraka_agent_configs.group_id 
              AND g.organization_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.group_members gm 
            WHERE gm.group_id = haraka_agent_configs.group_id 
              AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow group admins/owners to update agent configs"
    ON public.haraka_agent_configs
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.groups g 
            WHERE g.id = haraka_agent_configs.group_id 
              AND g.organization_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.group_members gm 
            WHERE gm.group_id = haraka_agent_configs.group_id 
              AND gm.user_id = auth.uid()
              AND gm.role IN ('owner', 'admin')
        )
    );

-- 2. haraka_pending_actions policies
CREATE POLICY "Allow group members to view pending actions"
    ON public.haraka_pending_actions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.groups g 
            WHERE g.id = haraka_pending_actions.group_id 
              AND g.organization_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.group_members gm 
            WHERE gm.group_id = haraka_pending_actions.group_id 
              AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow group members to create and manage pending actions"
    ON public.haraka_pending_actions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.groups g 
            WHERE g.id = haraka_pending_actions.group_id 
              AND g.organization_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.group_members gm 
            WHERE gm.group_id = haraka_pending_actions.group_id 
              AND gm.user_id = auth.uid()
        )
    );

-- 3. haraka_execution_logs policies
CREATE POLICY "Allow group members to view execution logs"
    ON public.haraka_execution_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.groups g 
            WHERE g.id = haraka_execution_logs.group_id 
              AND g.organization_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.group_members gm 
            WHERE gm.group_id = haraka_execution_logs.group_id 
              AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow group members and agents to insert execution logs"
    ON public.haraka_execution_logs
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.groups g 
            WHERE g.id = haraka_execution_logs.group_id 
              AND g.organization_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.group_members gm 
            WHERE gm.group_id = haraka_execution_logs.group_id 
              AND gm.user_id = auth.uid()
        )
    );
