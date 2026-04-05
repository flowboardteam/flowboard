import { GoogleGenerativeAI } from "@google/generative-ai";

export interface TalentSpec {
  role_title: string;
  experience_level: "Junior" | "Mid" | "Senior" | "Lead" | "Expert";
  skills: string[];                // required skills — used for primary GitHub search
  nice_to_have?: string[];         // secondary skills
  location: string;                // raw location string from prompt
  location_flexible: boolean;      // true when role is remote / location doesn't matter much
  search_terms: string[];          // 2–4 GitHub-friendly search keywords extracted by AI
  urgency?: "High" | "Medium" | "Low";
  raw_prompt: string;
}

export async function parseTalentPrompt(prompt: string): Promise<TalentSpec> {
  const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("VITE_GEMINI_API_KEY is missing.");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // ── Richer system prompt ──────────────────────────────────────────────────
  // We now ask Gemini to also produce search_terms — short, GitHub-friendly
  // keywords that actually appear in developer bios and repo descriptions.
  // We also ask it to flag location_flexible so the miner can skip location
  // filtering for remote roles.
  const systemPrompt = `
You are an expert technical recruiter AI. Analyse the job description and return ONLY a valid JSON object with these exact keys:

{
  "role_title": "Concise job title, e.g. 'Frontend Engineer'",
  "experience_level": "Junior" | "Mid" | "Senior" | "Lead" | "Expert",
  "skills": ["primary skills array — max 6, most important first"],
  "nice_to_have": ["secondary or bonus skills — max 4"],
  "location": "City or country name only, or 'Global' if remote/worldwide",
  "location_flexible": true | false,  // true if role is remote, worldwide, or location is not critical
  "search_terms": [
    // 2 to 4 SHORT strings to search on GitHub — think developer bios, not job titles.
    // Good: "React developer", "TypeScript", "frontend"
    // Bad: "Senior Frontend Engineer with 5 years experience"
    // Use the most distinctive skills/tools, not seniority words.
  ],
  "urgency": "High" | "Medium" | "Low"
}

Rules:
- search_terms must be SHORT (1–3 words each), lowercase preferred
- For remote roles, set location_flexible to true and location to "Global"
- skills must be specific technologies/tools, not soft skills
- Do NOT include markdown, code fences, or any text outside the JSON object
`;

  try {
    const result = await model.generateContent(
      `${systemPrompt}\n\nJob description to parse:\n${prompt}`
    );
    const response = await result.response;
    let text = response.text()
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Strip any leading/trailing non-JSON characters
    const jsonStart = text.indexOf("{");
    const jsonEnd   = text.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      text = text.slice(jsonStart, jsonEnd + 1);
    }

    const spec: TalentSpec = JSON.parse(text);
    spec.raw_prompt = prompt;

    // Ensure search_terms always has something useful
    if (!spec.search_terms || spec.search_terms.length === 0) {
      spec.search_terms = spec.skills.slice(0, 3).map(s => s.toLowerCase());
    }

    // Normalise location_flexible
    if (spec.location_flexible === undefined) {
      spec.location_flexible =
        !spec.location ||
        spec.location.toLowerCase() === "global" ||
        prompt.toLowerCase().includes("remote");
    }

    return spec;

  } catch (err: any) {
    console.warn("Gemini parse failed, falling back to local extraction:", err?.message);
    return localFallback(prompt);
  }
}

// ─── Local fallback (no API) ──────────────────────────────────────────────────
function localFallback(prompt: string): TalentSpec {
  const lower = prompt.toLowerCase();

  // Extract location from "in [Place]" or "based in [Place]"
  const locationMatch = prompt.match(/(?:in|based in|located in)\s+([A-Z][a-zA-Z\s,]+?)(?:\s+for|\s+\(|,|$)/i);
  const location = locationMatch ? locationMatch[1].trim() : "Global";

  // Common skill keywords to look for
  const KNOWN_SKILLS = [
    "react", "vue", "angular", "nextjs", "typescript", "javascript", "python",
    "node", "nodejs", "django", "fastapi", "golang", "rust", "java", "kotlin",
    "swift", "flutter", "dart", "aws", "gcp", "azure", "docker", "kubernetes",
    "postgres", "mongodb", "redis", "graphql", "tailwind", "figma", "css",
  ];
  const foundSkills = KNOWN_SKILLS.filter(s => lower.includes(s));

  const experienceLevel =
    lower.includes("lead") || lower.includes("staff") ? "Lead" :
    lower.includes("senior") || lower.includes("sr.") ? "Senior" :
    lower.includes("mid") || lower.includes("middle") ? "Mid" :
    lower.includes("junior") || lower.includes("jr.") ? "Junior" : "Mid";

  // Derive a sensible role title
  const titleKeywords = ["engineer", "developer", "designer", "manager", "analyst", "architect", "lead"];
  const titleWord = titleKeywords.find(k => lower.includes(k)) ?? "developer";
  const stack = foundSkills[0] ?? "";
  const role_title = stack
    ? `${stack.charAt(0).toUpperCase() + stack.slice(1)} ${titleWord}`
    : titleWord.charAt(0).toUpperCase() + titleWord.slice(1);

  return {
    role_title,
    experience_level: experienceLevel,
    skills: foundSkills.slice(0, 6),
    nice_to_have: [],
    location,
    location_flexible: location === "Global" || lower.includes("remote"),
    search_terms: foundSkills.slice(0, 3).map(s => s.toLowerCase()),
    urgency: "Medium",
    raw_prompt: prompt,
  };
}