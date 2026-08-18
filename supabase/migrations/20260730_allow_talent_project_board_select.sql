-- Grant assigned talent select access to project boards and cards

ALTER TABLE public.project_boards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow assigned member select on project_boards" ON public.project_boards;
CREATE POLICY "Allow assigned member select on project_boards"
  ON public.project_boards
  FOR SELECT
  USING (
    organization_id = auth.uid()
    OR project_id IN (
      SELECT pm.project_id
      FROM public.project_members pm
      JOIN public.workforce_members wm ON wm.id = pm.workforce_member_id
      WHERE wm.profile_id = auth.uid()
    )
  );

ALTER TABLE public.project_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow assigned member select on project_cards" ON public.project_cards;
CREATE POLICY "Allow assigned member select on project_cards"
  ON public.project_cards
  FOR SELECT
  USING (
    organization_id = auth.uid()
    OR project_id IN (
      SELECT pm.project_id
      FROM public.project_members pm
      JOIN public.workforce_members wm ON wm.id = pm.workforce_member_id
      WHERE wm.profile_id = auth.uid()
    )
  );
