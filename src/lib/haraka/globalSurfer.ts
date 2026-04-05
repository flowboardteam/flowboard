import { TalentSpec } from "./promptParser";

export interface SurferResult {
  platform: "GitHub" | "LinkedIn" | "X";
  searchUrl: string;
  label: string;
  description: string;
}

export function generateSurferLinks(spec: TalentSpec): SurferResult[] {
  const { role_title, skills, location } = spec;
  const primarySkill = skills[0] || "";
  const locationQuery = location ? `location:"${location}"` : "";

  return [
    {
      platform: "GitHub",
      label: "Code Depth Search",
      description: `Finding ${role_title}s active in ${primarySkill}`,
      searchUrl: `https://github.com/search?q=${primarySkill}+${locationQuery}+type:users&s=followers`
    },
    {
      platform: "LinkedIn",
      label: "X-Ray Professional Search",
      description: `Bypassing LinkedIn limits for ${location || 'Global'} talent`,
      // This uses Google to find LinkedIn profiles directly
      searchUrl: `https://www.google.com/search?q=site:linkedin.com/in/+"${role_title}"+"${primarySkill}"+"${location || ''}"`
    },
    {
      platform: "X",
      label: "Real-time Signal",
      description: `People discussing ${skills.slice(0,2).join(' & ')}`,
      searchUrl: `https://x.com/search?q=${primarySkill} ${location || ''} "hiring" OR "open to work"&f=user`
    }
  ];
}