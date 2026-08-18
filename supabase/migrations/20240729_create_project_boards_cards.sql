-- Create persisted project boards and cards for organization projects

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.project_boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  group_id uuid,
  name text NOT NULL,
  department text NOT NULL DEFAULT 'General',
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_boards_project_id_idx ON public.project_boards (project_id);
CREATE INDEX IF NOT EXISTS project_boards_organization_id_idx ON public.project_boards (organization_id);

ALTER TABLE public.project_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow org owner select on project_boards"
  ON public.project_boards
  FOR SELECT USING (organization_id = auth.uid());

CREATE POLICY "Allow org owner insert on project_boards"
  ON public.project_boards
  FOR INSERT WITH CHECK (organization_id = auth.uid());

CREATE POLICY "Allow org owner update on project_boards"
  ON public.project_boards
  FOR UPDATE USING (organization_id = auth.uid())
  WITH CHECK (organization_id = auth.uid());

CREATE POLICY "Allow org owner delete on project_boards"
  ON public.project_boards
  FOR DELETE USING (organization_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.project_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  board_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  group_id uuid,
  title text NOT NULL,
  labels text[] NOT NULL DEFAULT '{}',
  start_date date,
  due_date date,
  reminder timestamptz,
  checklist jsonb NOT NULL DEFAULT '[]',
  members text[] NOT NULL DEFAULT '{}',
  attachments int NOT NULL DEFAULT 0,
  custom_fields jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_cards_project_id_idx ON public.project_cards (project_id);
CREATE INDEX IF NOT EXISTS project_cards_board_id_idx ON public.project_cards (board_id);
CREATE INDEX IF NOT EXISTS project_cards_organization_id_idx ON public.project_cards (organization_id);

ALTER TABLE public.project_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow org owner select on project_cards"
  ON public.project_cards
  FOR SELECT USING (organization_id = auth.uid());

CREATE POLICY "Allow org owner insert on project_cards"
  ON public.project_cards
  FOR INSERT WITH CHECK (organization_id = auth.uid());

CREATE POLICY "Allow org owner update on project_cards"
  ON public.project_cards
  FOR UPDATE USING (organization_id = auth.uid())
  WITH CHECK (organization_id = auth.uid());

CREATE POLICY "Allow org owner delete on project_cards"
  ON public.project_cards
  FOR DELETE USING (organization_id = auth.uid());
