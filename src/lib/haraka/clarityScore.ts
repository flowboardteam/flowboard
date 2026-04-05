export function clarityScore(spec: any) {
  let score = 0;

  if (spec.role_title) score += 20;
  if (spec.seniority) score += 15;
  if (spec.must_have_skills?.length > 0) score += 25;
  if (spec.location) score += 15;
  if (spec.urgency) score += 10;

  return score;
}