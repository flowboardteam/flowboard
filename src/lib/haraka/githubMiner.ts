export interface GitHubProfile {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string;
  bio: string;
  location: string;
  public_repos: number;
  followers: number;
  created_at: string;
}

// ─── GitHub search strategies ─────────────────────────────────────────────────
//
// Problem with a single query like "Senior Frontend Engineer location:Remote":
//   1. GitHub search is bio/name text search — most devs don't write job titles
//   2. location:"Remote" barely matches — people write "🌍", "Earth", "Worldwide"
//   3. A single failed query = zero results
//
// Solution: run multiple queries in parallel, each targeting a different signal,
// then merge, deduplicate, and rank the union.
//
function buildSearchStrategies(spec: any): string[] {
  const strategies: string[] = [];
  const skills  = (spec.skills ?? []) as string[];
  const terms   = (spec.search_terms ?? skills.slice(0, 3)) as string[];
  const loc     = spec.location ?? "Global";
  const isGlobal = spec.location_flexible || loc.toLowerCase() === "global";

  // ── Strategy 1: primary skill + location (if not global) ─────────────────
  if (!isGlobal && terms[0]) {
    strategies.push(`${terms[0]} in:bio location:"${loc}" repos:>5`);
    strategies.push(`${terms[0]} in:bio location:"${loc}"`);
  }

  // ── Strategy 2: top skill in bio, no location filter ─────────────────────
  if (terms[0]) strategies.push(`${terms[0]} in:bio repos:>10`);
  if (terms[1]) strategies.push(`${terms[1]} in:bio repos:>10`);

  // ── Strategy 3: skill combo — finds specialists ───────────────────────────
  if (terms.length >= 2) {
    strategies.push(`${terms[0]} ${terms[1]} in:bio repos:>5`);
  }

  // ── Strategy 4: search by skill as a language/topic ──────────────────────
  // GitHub topics are indexed separately — great for framework-specific devs
  if (skills[0]) {
    const topic = skills[0].toLowerCase().replace(/[^a-z0-9-]/g, "-");
    strategies.push(`topic:${topic} stars:>20`);
  }
  if (skills[1]) {
    const topic = skills[1].toLowerCase().replace(/[^a-z0-9-]/g, "-");
    strategies.push(`topic:${topic} stars:>10`);
  }

  // ── Strategy 5: loose title search as fallback ────────────────────────────
  const titleWords = spec.role_title?.split(" ").slice(-2).join(" ").toLowerCase() ?? "";
  if (titleWords) strategies.push(`${titleWords} in:bio repos:>5`);

  // Deduplicate and return max 6 strategies
  return [...new Set(strategies)].slice(0, 6);
}

// ─── Single GitHub search call ────────────────────────────────────────────────
async function searchUsers(
  query: string,
  token: string | undefined,
  perPage = 12
): Promise<any[]> {
  try {
    const url = `https://api.github.com/search/users?q=${encodeURIComponent(query)}&per_page=${perPage}&sort=followers`;
    const res = await fetch(url, {
      headers: {
        ...(token ? { Authorization: `token ${token}` } : {}),
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!res.ok) {
      // 422 = query too complex, 403 = rate limit
      if (res.status === 422 || res.status === 403) return [];
      return [];
    }

    const data = await res.json();
    return data.items ?? [];
  } catch {
    return [];
  }
}

// ─── Fetch full profile for a user ────────────────────────────────────────────
async function fetchProfile(user: any, token: string | undefined): Promise<GitHubProfile | null> {
  try {
    const res = await fetch(user.url ?? `https://api.github.com/users/${user.login}`, {
      headers: { ...(token ? { Authorization: `token ${token}` } : {}) },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ─── Filter out noise ────────────────────────────────────────────────────────
function isRelevantProfile(profile: GitHubProfile, spec: any): boolean {
  const bio   = (profile.bio   ?? "").toLowerCase();
  const name  = (profile.name  ?? "").toLowerCase();
  const login = (profile.login ?? "").toLowerCase();

  // Remove bots and CI accounts
  const botPatterns = ["bot", "[bot]", "dependabot", "renovate", "github-actions"];
  if (botPatterns.some(p => login.includes(p))) return false;

  // Remove pure students unless the role asks for junior
  const isJuniorRole = ["junior", "intern"].includes(
    (spec.experience_level ?? "").toLowerCase()
  );
  if (!isJuniorRole) {
    const studentBio = ["student", "pursuing", "freshman", "sophomore", "high school"];
    if (studentBio.some(p => bio.includes(p))) return false;
  }

  // Must have at least some repos or followers — ghost accounts aren't useful
  if ((profile.public_repos ?? 0) < 2 && (profile.followers ?? 0) < 5) return false;

  return true;
}

// ─── Score a profile against the spec ────────────────────────────────────────
function scoreProfile(profile: GitHubProfile, spec: any): number {
  const bio   = (profile.bio      ?? "").toLowerCase();
  const loc   = (profile.location ?? "").toLowerCase();
  const skills = (spec.skills     ?? []) as string[];
  const terms  = (spec.search_terms ?? []) as string[];
  let score = 50; // base

  // Skills in bio
  const allTerms = [...new Set([...skills, ...terms])].map(s => s.toLowerCase());
  const bioMatches = allTerms.filter(s => bio.includes(s)).length;
  score += Math.min(bioMatches * 8, 32); // up to +32

  // Location match
  const specLoc = (spec.location ?? "").toLowerCase();
  const isGlobal = spec.location_flexible || specLoc === "global";
  if (isGlobal) {
    score += 10; // everyone gets location points for remote
  } else if (loc.includes(specLoc) || specLoc.includes(loc)) {
    score += 15;
  } else if (loc.includes("remote") || loc === "") {
    score += 8;
  }

  // Activity signals
  const repos = profile.public_repos ?? 0;
  const followers = profile.followers ?? 0;
  if (repos > 50)      score += 6;
  else if (repos > 20) score += 4;
  else if (repos > 10) score += 2;

  if (followers > 500)  score += 6;
  else if (followers > 100) score += 4;
  else if (followers > 20)  score += 2;

  // Seniority approximation from account age
  const createdYear = new Date(profile.created_at ?? "").getFullYear();
  const age = new Date().getFullYear() - createdYear;
  if (age >= 10)     score += 6;
  else if (age >= 6) score += 4;
  else if (age >= 3) score += 2;

  return Math.min(score, 99);
}

// ─── Main export ──────────────────────────────────────────────────────────────
export async function mineGitHubTalent(spec: any): Promise<GitHubProfile[]> {
  const token = (import.meta as any).env.VITE_GITHUB_TOKEN;

  const strategies = buildSearchStrategies(spec);
  console.log("[Haraka] Search strategies:", strategies);

  // ── Run all strategies in parallel ───────────────────────────────────────
  const rawResults = await Promise.all(
    strategies.map(q => searchUsers(q, token, 10))
  );

  // ── Merge and deduplicate by login ────────────────────────────────────────
  const seen  = new Set<string>();
  const users: any[] = [];
  for (const batch of rawResults) {
    for (const u of batch) {
      if (!seen.has(u.login)) {
        seen.add(u.login);
        users.push(u);
      }
    }
  }

  if (users.length === 0) return [];

  // ── Fetch full profiles — cap at 20 to stay within rate limits ───────────
  const topUsers = users.slice(0, 20);
  const profiles = await Promise.all(
    topUsers.map(u => fetchProfile(u, token))
  );

  // ── Filter noise ─────────────────────────────────────────────────────────
  const clean = profiles.filter(
    (p): p is GitHubProfile => p !== null && isRelevantProfile(p, spec)
  );

  // ── Score and sort ────────────────────────────────────────────────────────
  const scored = clean
    .map(p => ({ profile: p, score: scoreProfile(p, spec) }))
    .sort((a, b) => b.score - a.score);

  console.log(`[Haraka] Found ${scored.length} relevant profiles from ${users.length} candidates`);

  return scored.map(s => s.profile);
}