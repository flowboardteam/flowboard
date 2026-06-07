-- Migration: create payroll tables
-- File: supabase/migrations/20240520_create_payroll.sql

CREATE TABLE public.payroll_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  group_id uuid NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  run_at timestamp with time zone DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending','processing','completed','failed'])),
  total_gross numeric DEFAULT 0,
  total_deductions numeric DEFAULT 0,
  total_net numeric DEFAULT 0,
  notes text,
  CONSTRAINT payroll_runs_pkey PRIMARY KEY (id),
  CONSTRAINT payroll_runs_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES auth.users(id),
  CONSTRAINT payroll_runs_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id)
);

CREATE TABLE public.payroll_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  payroll_run_id uuid NOT NULL,
  workforce_member_id uuid NOT NULL,
  gross_amount numeric NOT NULL,
  tax_amount numeric DEFAULT 0,
  deduction_amount numeric DEFAULT 0,
  net_amount numeric GENERATED ALWAYS AS (gross_amount - tax_amount - deduction_amount) STORED,
  notes text,
  CONSTRAINT payroll_items_pkey PRIMARY KEY (id),
  CONSTRAINT payroll_items_payroll_run_id_fkey FOREIGN KEY (payroll_run_id) REFERENCES public.payroll_runs(id),
  CONSTRAINT payroll_items_workforce_member_id_fkey FOREIGN KEY (workforce_member_id) REFERENCES public.workforce_members(id)
);

-- Optional: tax rates per organization (default 15%)
CREATE TABLE public.payroll_tax_rates (
  organization_id uuid PRIMARY KEY,
  tax_percent numeric NOT NULL DEFAULT 15,
  CONSTRAINT payroll_tax_rates_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES auth.users(id)
);

-- Optional: custom deductions (per organization)
CREATE TABLE public.payroll_deductions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  name text NOT NULL,
  amount numeric NOT NULL,
  CONSTRAINT payroll_deductions_pkey PRIMARY KEY (id),
  CONSTRAINT payroll_deductions_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES auth.users(id)
);
