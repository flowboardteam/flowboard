"use client";

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Zap, BrainCircuit, Target, ShieldCheck,
  SearchX, History, ExternalLink, Users, Code2,
  Bookmark, Check, ArrowLeft,
} from "lucide-react";
import { parseTalentPrompt, TalentSpec } from "@/lib/haraka/promptParser";
import { GitHubProfile, mineGitHubTalent } from "@/lib/haraka/githubMiner";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface ScoredCandidate extends GitHubProfile {
  matchScore: number;
  yearsActive: number;
  seniorityLabel: string;
}

export default function HarakaAgent() {
  const location = useLocation();

  // ── Read state passed from TalentSourcingPage ─────────────────────────────
  // navigate("/client/haraka", { state: { harakaPrompt, autoRun, sourceRole } })
  const incomingPrompt: string  = (location.state as any)?.harakaPrompt ?? "";
  const autoRun: boolean        = (location.state as any)?.autoRun ?? false;
  const sourceRole: any         = (location.state as any)?.sourceRole ?? null;

  const [prompt, setPrompt]           = useState(incomingPrompt);
  const [loading, setLoading]         = useState(false);
  const [phase, setPhase]             = useState<"idle" | "analyzing" | "result">("idle");
  const [spec, setSpec]               = useState<TalentSpec | null>(null);
  const [candidates, setCandidates]   = useState<ScoredCandidate[]>([]);
  const [statusMessage, setStatusMessage] = useState("Initializing...");
  const [savedIds, setSavedIds]       = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // ── Sync saved IDs on load ────────────────────────────────────────────────
  useEffect(() => {
    const syncSaves = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("shortlisted_talent").select("github_id").eq("user_id", user.id);
      if (data) setSavedIds(new Set(data.map(item => item.github_id)));
    };
    syncSaves();
  }, []);

  // ── Auto-run when arriving from TalentSourcingPage ────────────────────────
  // Runs once when the component mounts with autoRun=true + a pre-filled prompt.
  // We clear the router state after consuming it so a page refresh doesn't re-fire.
  useEffect(() => {
    if (autoRun && incomingPrompt) {
      // Replace history state so a refresh doesn't re-trigger
      window.history.replaceState({}, document.title);
      handleDiscovery(incomingPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Save / unsave ─────────────────────────────────────────────────────────
  const handleSave = async (person: ScoredCandidate) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      toast({ variant: "destructive", title: "Authentication Required", description: "You need to be logged in to shortlist talent." });
      return;
    }

    const isCurrentlySaved = savedIds.has(person.login);

    setSavedIds(prev => {
      const next = new Set(prev);
      isCurrentlySaved ? next.delete(person.login) : next.add(person.login);
      return next;
    });

    try {
      if (isCurrentlySaved) {
        const { error } = await supabase.from("shortlisted_talent").delete()
          .match({ github_id: person.login, user_id: user.id });
        if (error) throw error;
        toast({ title: "Removed from Shortlist", description: `${person.name || person.login} has been removed.` });
      } else {
        const { error } = await supabase.from("shortlisted_talent").upsert(
          {
            user_id: user.id, github_id: person.login,
            full_name: person.name || person.login, avatar_url: person.avatar_url,
            role_title: spec?.role_title || "Expert", match_score: person.matchScore,
            seniority_label: person.seniorityLabel, bio: person.bio || "",
            github_url: person.html_url, repos_count: person.public_repos,
            followers_count: person.followers,
          },
          { onConflict: "github_id, user_id" }
        );
        if (error) throw error;
        toast({ title: "Added to Shortlist", description: `${person.name || person.login} is now in your node.` });
      }
    } catch (err) {
      console.error("Database error:", err);
      setSavedIds(prev => {
        const next = new Set(prev);
        isCurrentlySaved ? next.add(person.login) : next.delete(person.login);
        return next;
      });
      toast({ variant: "destructive", title: "Connection Error", description: "Failed to update shortlist. Please try again." });
    }
  };

  // ── Discovery ─────────────────────────────────────────────────────────────
  const handleDiscovery = async (overridePrompt?: string) => {
    const activePrompt = overridePrompt ?? prompt;
    if (!activePrompt) return;

    setLoading(true);
    setPhase("analyzing");
    setCandidates([]);

    try {
      setStatusMessage("Reading requirements...");
      const parsedSpec = await parseTalentPrompt(activePrompt);
      setSpec(parsedSpec);

      setStatusMessage(`Searching for ${parsedSpec.role_title}s...`);
      const rawTalent = await mineGitHubTalent(parsedSpec);

      if (rawTalent.length === 0) {
        setPhase("result");
      } else {
        setStatusMessage("Ranking top matches...");
        const currentYear = new Date().getFullYear();
        const ranked = rawTalent
          .map(person => {
            const createdYear = new Date(person.created_at).getFullYear();
            const yearsActive = currentYear - createdYear;
            let score = 60;
            let label = "Junior";
            if (yearsActive >= 10) { score = 95; label = "Expert"; }
            else if (yearsActive >= 5) { score = 85; label = "Senior"; }
            else if (yearsActive >= 2) { score = 70; label = "Mid-Level"; }
            if (person.public_repos > 40) score += 4;
            return { ...person, matchScore: Math.min(score, 99), yearsActive, seniorityLabel: label };
          })
          .sort((a, b) => b.matchScore - a.matchScore);
        setCandidates(ranked);
      }
      setTimeout(() => setPhase("result"), 800);
    } catch (err) {
      setPhase("idle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          {/* Back link — only shown when arriving from a role sourcing page */}
          {sourceRole && (
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to sourcing
            </button>
          )}

          <div className="flex items-center gap-2 text-emerald-600 text-[11px] font-bold uppercase tracking-widest">
            <div className="w-2 h-2 rounded-none bg-emerald-500 animate-pulse" />
            Haraka-01 Talent Finder
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold dark:text-white tracking-tight">
            Find your next <span className="text-emerald-600">Expert.</span>
          </h1>

          {/* Context banner — shown when launched from a role */}
          {sourceRole && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Searching deeper for</span>
              <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2.5 py-1 rounded-none">
                {sourceRole.title}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Search box ── */}
      <div className="p-8 rounded-none bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm">
        {/* Pre-filled prompt indicator */}
        {sourceRole && phase === "idle" && (
          <div className="flex items-center gap-2 mb-4 px-1">
            <BrainCircuit className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
              Prompt auto-generated from role — edit if needed
            </span>
          </div>
        )}

        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Describe the role (e.g. Senior Backend Engineer in United States)..."
          className="w-full h-32 bg-slate-500/5 rounded-none p-6 text-lg font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all border border-[var(--border-color)] resize-none"
        />

        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
          <div className="flex gap-4 text-slate-400 font-black text-[10px] uppercase tracking-tighter">
            <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Global Search</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Verified Only</span>
          </div>
          <button
            disabled={!prompt || loading}
            onClick={() => handleDiscovery()}
            className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-none hover:bg-blue-500 transition-all hover:scale-105 shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
              : <><Zap className="w-4 h-4 fill-current" /> Start Discovery</>
            }
          </button>
        </div>
      </div>

      {/* ── Results ── */}
      <AnimatePresence mode="wait">
        {phase === "analyzing" && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="py-20 flex flex-col items-center justify-center space-y-4"
          >
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">{statusMessage}</p>
          </motion.div>
        )}

        {phase === "result" && spec && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="px-6 py-4 rounded-none bg-blue-500/5 border border-blue-500/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BrainCircuit className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-bold tracking-tight">
                  Found {candidates.length} {spec.role_title}s in {spec.location || "Global"}
                </span>
              </div>
              <button
                onClick={() => { setPhase("idle"); setPrompt(incomingPrompt); }}
                className="text-[10px] font-black uppercase text-slate-400 hover:text-blue-500 transition-colors"
              >
                Reset Agent
              </button>
            </div>

            {candidates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {candidates.map(person => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={person.login}
                      className="p-8 rounded-none bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm flex flex-col justify-between group hover:border-blue-500/50 transition-all relative"
                    >
                      <button
                        onClick={() => handleSave(person)}
                        className={`absolute top-6 right-6 p-2 rounded-none transition-all z-20 ${
                          savedIds.has(person.login)
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-110"
                            : "bg-slate-500/10 text-slate-400 hover:bg-blue-500 hover:text-white"
                        }`}
                      >
                        {savedIds.has(person.login)
                          ? <Check className="w-4 h-4" />
                          : <Bookmark className="w-4 h-4" />
                        }
                      </button>

                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <img src={person.avatar_url} className="w-16 h-16 rounded-none border border-[var(--border-color)] object-cover shadow-sm" alt="" />
                          <div className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-none text-center mr-10">
                            <div className="text-lg font-black leading-none">{person.matchScore}%</div>
                            <div className="text-[7px] font-black uppercase tracking-tighter">Match</div>
                          </div>
                        </div>

                        <h3 className="text-xl font-black tracking-tighter uppercase mb-1 line-clamp-1 pr-8">
                          {person.name || person.login}
                        </h3>

                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-none uppercase">{person.seniorityLabel}</span>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <Target className="w-3 h-3" /> {person.location || "Global"}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <History className="w-3 h-3" /> {person.yearsActive}Y Active
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-3 mb-6">
                          {person.bio || "Candidate demonstrates specialized knowledge in global workforce engineering."}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-px bg-[var(--border-color)] rounded-none overflow-hidden border border-[var(--border-color)]">
                          <div className="bg-[var(--card-bg)] p-3 text-center">
                            <div className="text-[8px] font-black text-slate-400 uppercase mb-1 flex items-center justify-center gap-1">
                              <Code2 className="w-3 h-3" /> Projects
                            </div>
                            <div className="text-sm font-black">{person.public_repos}</div>
                          </div>
                          <div className="bg-[var(--card-bg)] p-3 text-center">
                            <div className="text-[8px] font-black text-slate-400 uppercase mb-1 flex items-center justify-center gap-1">
                              <Users className="w-3 h-3" /> Followers
                            </div>
                            <div className="text-sm font-black">{person.followers}</div>
                          </div>
                        </div>

                        <a
                          href={person.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 w-full bg-slate-900 dark:bg-white dark:text-black text-white py-4 rounded-none text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-md"
                        >
                          Check Profile <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="py-20 text-center space-y-4 bg-slate-500/5 rounded-none border border-dashed border-[var(--border-color)]">
                <SearchX className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-xl font-black tracking-tighter uppercase dark:text-white">No Matches Found</h3>
                <button
                  onClick={() => setPhase("idle")}
                  className="text-xs font-black text-emerald-600 uppercase tracking-widest hover:underline"
                >
                  Adjust Parameters
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}