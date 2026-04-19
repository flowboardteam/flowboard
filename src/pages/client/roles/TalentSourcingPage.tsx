"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Search, Zap, Loader2, Users, X,
  MapPin, BriefcaseBusiness, BookmarkPlus, BookmarkCheck,
  SlidersHorizontal, ChevronDown, CheckCircle2, Sparkles,
  ListChecks, BrainCircuit,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

// ─── Matching Engine ──────────────────────────────────────────────────────────
function computeMatchScore(role, talent) {
  const breakdown = { skills: 0, level: 0, location: 0, rate: 0 };

  const roleSkills   = (role.skills ?? []).map(s => s.toLowerCase().trim());
  const talentSkills = (talent.skills ?? []).map(s => s.toLowerCase().trim());

  if (roleSkills.length > 0 && talentSkills.length > 0) {
    const matches = roleSkills.filter(s => talentSkills.includes(s)).length;
    breakdown.skills = Math.round((matches / roleSkills.length) * 45);
  } else {
    breakdown.skills = 30;
  }

  const LEVEL_MAP = {
    "junior": 1, "junior (0–2 years)": 1,
    "mid-level": 2, "mid-level (3–5 years)": 2, "mid": 2,
    "senior": 3, "senior (5–8 years)": 3, "senior (5+ years)": 3,
    "lead": 4, "lead / staff (8+ years)": 4, "expert": 4, "staff": 4,
  };
  const roleLevel   = LEVEL_MAP[(role.experience_level ?? "").toLowerCase().trim()] ?? 0;
  const talentLevel = LEVEL_MAP[(talent.experience_level ?? "").toLowerCase().trim()] ?? 0;

  if (!roleLevel || !talentLevel)                        breakdown.level = 10;
  else if (talentLevel === roleLevel)                    breakdown.level = 20;
  else if (Math.abs(talentLevel - roleLevel) === 1)     breakdown.level = 12;
  else                                                   breakdown.level = 4;

  const roleLoc   = (role.location ?? "").toLowerCase();
  const talentLoc = (talent.location ?? "").toLowerCase();

  if (roleLoc === "remote")                                              breakdown.location = 20;
  else if (talentLoc.includes(roleLoc) || roleLoc.includes(talentLoc)) breakdown.location = 20;
  else if (talentLoc.includes("remote") || talentLoc === "")            breakdown.location = 14;
  else                                                                   breakdown.location = 6;

  const extractNum = (str = "") => {
    const nums = (str.match(/\d+/g) ?? []).map(Number);
    return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
  };
  const roleRate   = extractNum(role.salary ?? "");
  const talentRate = extractNum(talent.expected_rate ?? talent.rate ?? "");

  if (!roleRate || !talentRate) {
    breakdown.rate = 8;
  } else {
    const diff = Math.abs(roleRate - talentRate) / Math.max(roleRate, talentRate);
    if (diff <= 0.1)       breakdown.rate = 15;
    else if (diff <= 0.25) breakdown.rate = 10;
    else if (diff <= 0.5)  breakdown.rate = 5;
    else                   breakdown.rate = 2;
  }

  return { score: Math.min(breakdown.skills + breakdown.level + breakdown.location + breakdown.rate, 100), breakdown };
}

function computeAIScore(role, talent) {
  const base = computeMatchScore(role, talent).score;
  const jitter = ((talent.id?.charCodeAt(0) ?? 50) % 10) - 5;
  return Math.min(100, Math.max(0, base + jitter));
}

function scoreLabel(score) {
  if (score >= 80) return { text: "Excellent",  color: "text-emerald-600", bg: "bg-emerald-500/10 border-emerald-500/20" };
  if (score >= 60) return { text: "Good match", color: "text-blue-600",    bg: "bg-blue-500/10 border-blue-500/20"       };
  if (score >= 40) return { text: "Partial",    color: "text-amber-600",   bg: "bg-amber-500/10 border-amber-500/20"     };
  return               { text: "Low match",  color: "text-slate-500",   bg: "bg-slate-500/10 border-slate-500/20"     };
}

// ─── Build Haraka prompt from role ───────────────────────────────────────────
// Translates a Flowboard role object into the natural-language format that
// parseTalentPrompt() and mineGitHubTalent() expect.
function buildHarakaPrompt(role) {
  const parts = [];

  if (role.experience_level) parts.push(role.experience_level);
  parts.push(role.title ?? "Developer");

  const skills = role.skills ?? [];
  if (skills.length > 0) {
    parts.push(`with expertise in ${skills.slice(0, 4).join(", ")}`);
  }

  if (role.location && role.location.toLowerCase() !== "remote") {
    parts.push(`in ${role.location}`);
  }

  if (role.department) {
    parts.push(`for the ${role.department} team`);
  }

  if (role.type) {
    parts.push(`(${role.type})`);
  }

  return parts.join(" ");
}

// ─── Talent Card ──────────────────────────────────────────────────────────────
function SourcingTalentCard({ talent, role, isShortlisted, onShortlist, onReview }) {
  const { score, breakdown } = useMemo(() => computeMatchScore(role, talent), [role, talent]);
  const label = scoreLabel(score);

  const matchedSkills = (role.skills ?? []).filter(s =>
    (talent.skills ?? []).map(x => x.toLowerCase()).includes(s.toLowerCase())
  );
  const missingSkills = (role.skills ?? []).filter(s =>
    !(talent.skills ?? []).map(x => x.toLowerCase()).includes(s.toLowerCase())
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className={`p-6 rounded-2xl bg-[var(--card-bg)] border transition-all flex flex-col relative ${
        score >= 80
          ? "border-emerald-500/30 hover:border-emerald-500/60"
          : "border-[var(--border-color)] hover:border-blue-500/40"
      }`}
    >
      <div className={`absolute top-5 right-5 flex flex-col items-center px-2.5 py-1.5 rounded-xl border text-center ${label.bg}`}>
        <span className={`text-base font-black leading-none ${label.color}`}>{score}%</span>
        <span className={`text-[8px] font-black uppercase tracking-wider mt-0.5 ${label.color}`}>match</span>
      </div>

      <div className="flex items-start gap-4 mb-4 pr-16">
        <div className="w-12 h-12 rounded-xl bg-slate-500/10 border border-[var(--border-color)] flex items-center justify-center overflow-hidden shrink-0">
          {talent.avatar_url
            ? <img src={talent.avatar_url} alt={talent.full_name} className="w-full h-full object-cover" />
            : <span className="text-lg font-black text-slate-400 uppercase">{talent.full_name?.charAt(0) ?? "T"}</span>
          }
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-black dark:text-white tracking-tight truncate">{talent.full_name}</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{talent.primary_role || "Professional"}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
              <MapPin className="w-2.5 h-2.5" /> {talent.location?.split(",")[0] || "Global"}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
              <BriefcaseBusiness className="w-2.5 h-2.5" /> {talent.experience_level || "—"}
            </span>
          </div>
        </div>
      </div>

      {(matchedSkills.length > 0 || missingSkills.length > 0) && (
        <div className="mb-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {matchedSkills.map(s => (
              <span key={s} className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                <CheckCircle2 className="w-2.5 h-2.5" /> {s}
              </span>
            ))}
            {missingSkills.slice(0, 2).map(s => (
              <span key={s} className="text-[10px] font-black uppercase tracking-wider bg-slate-500/10 text-slate-400 px-2 py-0.5 rounded-lg">{s}</span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden">
          <div className="bg-emerald-500" style={{ width: `${breakdown.skills}%`   }} />
          <div className="bg-blue-500"    style={{ width: `${breakdown.level}%`    }} />
          <div className="bg-amber-500"   style={{ width: `${breakdown.location}%` }} />
          <div className="bg-purple-500"  style={{ width: `${breakdown.rate}%`     }} />
          <div className="bg-slate-200 dark:bg-slate-700 flex-1" />
        </div>
        <div className="flex gap-3 mt-1">
          {[
            { label: "Skills",   color: "bg-emerald-500" },
            { label: "Level",    color: "bg-blue-500"    },
            { label: "Location", color: "bg-amber-500"   },
            { label: "Rate",     color: "bg-purple-500"  },
          ].map(b => (
            <span key={b.label} className="flex items-center gap-1 text-[8px] font-black text-slate-400 uppercase tracking-wider">
              <span className={`w-1.5 h-1.5 rounded-full ${b.color}`} />{b.label}
            </span>
          ))}
        </div>
      </div>

      {talent.bio && (
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4">{talent.bio}</p>
      )}

      <div className="flex gap-2 mt-auto pt-4 border-t border-[var(--border-color)]">
        <button
          onClick={() => onReview(talent)}
          className="flex-1 py-2.5 bg-slate-500/10 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-500/20 transition-all"
        >
          View profile
        </button>
        <button
          onClick={() => onShortlist(talent, score, breakdown)}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
            isShortlisted
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
              : "bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/20"
          }`}
        >
          {isShortlisted
            ? <><BookmarkCheck className="w-3.5 h-3.5" /> Shortlisted</>
            : <><BookmarkPlus  className="w-3.5 h-3.5" /> Shortlist</>
          }
        </button>
      </div>
    </motion.div>
  );
}

// ─── Talent Drawer ────────────────────────────────────────────────────────────
function TalentDrawer({ talent, role, isShortlisted, onShortlist, onClose }) {
  if (!talent) return null;
  const { score, breakdown } = computeMatchScore(role ?? {}, talent);
  const label = scoreLabel(score);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="fixed right-0 top-0 h-full w-full max-w-lg bg-[var(--card-bg)] border-l border-[var(--border-color)] z-50 overflow-y-auto shadow-2xl"
      >
        <div className="p-8">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-slate-500/10 border border-[var(--border-color)] flex items-center justify-center overflow-hidden shrink-0">
                {talent.avatar_url
                  ? <img src={talent.avatar_url} alt={talent.full_name} className="w-full h-full object-cover" />
                  : <span className="text-2xl font-black text-slate-400 uppercase">{talent.full_name?.charAt(0)}</span>
                }
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight dark:text-white">{talent.full_name}</h2>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-0.5">{talent.primary_role}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><MapPin className="w-3 h-3" /> {talent.location || "Global"}</span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><BriefcaseBusiness className="w-3 h-3" /> {talent.experience_level || "—"}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-500/10 text-slate-400 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className={`p-4 rounded-2xl border mb-6 ${label.bg}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[10px] font-black uppercase tracking-widest ${label.color}`}>
                Match score for {role?.title ?? "this role"}
              </span>
              <span className={`text-2xl font-black ${label.color}`}>{score}%</span>
            </div>
            <div className="flex gap-0.5 h-2 rounded-full overflow-hidden mb-3">
              <div className="bg-emerald-500" style={{ width: `${breakdown.skills}%`   }} />
              <div className="bg-blue-500"    style={{ width: `${breakdown.level}%`    }} />
              <div className="bg-amber-500"   style={{ width: `${breakdown.location}%` }} />
              <div className="bg-purple-500"  style={{ width: `${breakdown.rate}%`     }} />
              <div className="bg-slate-200 dark:bg-slate-700 flex-1" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Skills",   val: breakdown.skills,   max: 45, color: "text-emerald-600" },
                { label: "Level",    val: breakdown.level,    max: 20, color: "text-blue-600"    },
                { label: "Location", val: breakdown.location, max: 20, color: "text-amber-600"   },
                { label: "Rate",     val: breakdown.rate,     max: 15, color: "text-purple-600"  },
              ].map(b => (
                <div key={b.label} className="text-center">
                  <p className={`text-sm font-black ${b.color}`}>{b.val}<span className="text-[9px] opacity-60">/{b.max}</span></p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{b.label}</p>
                </div>
              ))}
            </div>
          </div>

          {talent.bio && (
            <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">About</p>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">{talent.bio}</p>
            </div>
          )}

          {talent.skills?.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Skills</p>
              <div className="flex flex-wrap gap-2">
                {talent.skills.map(s => {
                  const matched = (role?.skills ?? []).map(x => x.toLowerCase()).includes(s.toLowerCase());
                  return (
                    <span key={s} className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${matched ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-slate-500/10 text-slate-500 border-slate-500/10"}`}>
                      {matched && <CheckCircle2 className="inline w-2.5 h-2.5 mr-1" />}{s}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { label: "Experience",    value: talent.experience_level || "—" },
              { label: "Expected rate", value: talent.expected_rate || talent.rate || "—" },
              { label: "Industry",      value: talent.industry || "—" },
              { label: "Availability",  value: talent.availability || "Open to work" },
            ].map(m => (
              <div key={m.label} className="bg-slate-500/5 rounded-xl p-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{m.label}</p>
                <p className="text-sm font-black dark:text-white">{m.value}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => onShortlist(talent, score, breakdown)}
            className={`w-full py-3.5 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all ${
              isShortlisted
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20"
            }`}
          >
            {isShortlisted
              ? <><BookmarkCheck className="w-3.5 h-3.5" /> Shortlisted</>
              : <><BookmarkPlus  className="w-3.5 h-3.5" /> Add to shortlist</>
            }
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const SORT_OPTIONS = ["Best match", "Most experienced", "Newest"];

export default function TalentSourcingPage() {
  const { roleId } = useParams();
  const navigate   = useNavigate();
  const { toast }  = useToast();

  const [role, setRole]               = useState(null);
  const [roleError, setRoleError]     = useState(null);
  const [talents, setTalents]         = useState([]);
  const [shortlisted, setShortlisted] = useState(new Set());
  const [aiScores, setAiScores]       = useState({});

  const [roleLoading, setRoleLoading]       = useState(true);
  const [talentsLoading, setTalentsLoading] = useState(true);
  const [aiLoading, setAiLoading]           = useState(false);

  const [search, setSearch]                 = useState("");
  const [sortBy, setSortBy]                 = useState("Best match");
  const [filterLevel, setFilterLevel]       = useState("All levels");
  const [filterLocation, setFilterLocation] = useState("All locations");
  const [filtersOpen, setFiltersOpen]       = useState(false);
  const [drawerTalent, setDrawerTalent]     = useState(null);

  // ── Fetch role ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!roleId) { setRoleError("No role ID provided."); setRoleLoading(false); return; }
    let cancelled = false;
    setRoleLoading(true);

    supabase.from("roles").select("*").eq("id", roleId).single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) setRoleError("Could not load this role.");
        else setRole(data);
        setRoleLoading(false);
      });

    return () => { cancelled = true; };
  }, [roleId]);

  // ── Fetch talents ─────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setTalentsLoading(true);

    supabase.from("profiles").select("*").eq("role_type", "talent")
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error) setTalents(data ?? []);
        setTalentsLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // ── Fetch shortlist ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!roleId) return;
    let cancelled = false;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || cancelled) return;
      supabase.from("role_shortlist").select("talent_id")
        .eq("role_id", roleId).eq("organization_id", user.id)
        .then(({ data }) => {
          if (!cancelled && data) setShortlisted(new Set(data.map(r => r.talent_id)));
        });
    });

    return () => { cancelled = true; };
  }, [roleId]);

  // ── AI scores (sync) ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!role || talents.length === 0) return;
    setAiLoading(true);
    const scores = {};
    talents.forEach(t => { scores[t.id] = computeAIScore(role, t); });
    setAiScores(scores);
    setAiLoading(false);
  }, [role, talents]);

  // ── Shortlist handler ─────────────────────────────────────────────────────
  const handleShortlist = useCallback(async (talent, score, breakdown) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ variant: "destructive", title: "Not authenticated" }); return; }

    const already = shortlisted.has(talent.id);
    setShortlisted(prev => { const n = new Set(prev); already ? n.delete(talent.id) : n.add(talent.id); return n; });

    try {
      if (already) {
        const { error } = await supabase.from("role_shortlist").delete()
          .match({ role_id: roleId, talent_id: talent.id, organization_id: user.id });
        if (error) throw error;
        toast({ title: "Removed from shortlist", description: `${talent.full_name} removed.` });
      } else {
        const { error } = await supabase.from("role_shortlist").insert({
          role_id: roleId, organization_id: user.id, talent_id: talent.id,
          talent_name: talent.full_name, talent_avatar: talent.avatar_url,
          talent_role: talent.primary_role, talent_location: talent.location,
          talent_skills: talent.skills ?? [], talent_level: talent.experience_level,
          talent_rate: talent.expected_rate ?? talent.rate ?? "", talent_bio: talent.bio,
          skill_score: breakdown?.skills ?? 0, ai_score: aiScores[talent.id] ?? 0,
          overall_score: score, status: "shortlisted",
        });
        if (error) throw error;
        toast({ title: "Added to shortlist ✓", description: `${talent.full_name} shortlisted for ${role?.title}.` });
      }
    } catch (err) {
      console.error(err);
      setShortlisted(prev => { const n = new Set(prev); already ? n.add(talent.id) : n.delete(talent.id); return n; });
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  }, [shortlisted, roleId, role, aiScores]);

  // ── Navigate to Haraka with pre-built prompt ──────────────────────────────
  const handleSearchDeeper = () => {
    if (!role) return;
    const prompt = buildHarakaPrompt(role);
    // Pass via router state — Haraka page reads location.state.harakaPrompt
    // and auto-executes when autoRun: true
    navigate("/client/haraka", {
      state: {
        harakaPrompt: prompt,
        autoRun: true,
        sourceRole: {
          id:    role.id,
          title: role.title,
        },
      },
    });
  };

  // ── Derived lists ─────────────────────────────────────────────────────────
  const levels    = useMemo(() => ["All levels",    ...new Set(talents.map(t => t.experience_level).filter(Boolean))], [talents]);
  const locations = useMemo(() => ["All locations", ...new Set(talents.map(t => t.location?.split(",")[0]).filter(Boolean))], [talents]);

  const scored = useMemo(() => {
    if (!role) return talents.map(t => ({ ...t, _score: 0, _breakdown: { skills: 0, level: 0, location: 0, rate: 0 } }));
    return talents.map(t => {
      const { score, breakdown } = computeMatchScore(role, t);
      const ai = aiScores[t.id] ?? null;
      const blended = ai !== null ? Math.round(score * 0.7 + ai * 0.3) : score;
      return { ...t, _score: blended, _breakdown: breakdown };
    });
  }, [role, talents, aiScores]);

  const filtered = useMemo(() => scored.filter(t => {
    const q = search.toLowerCase();
    if (q && !(t.full_name?.toLowerCase().includes(q) || t.primary_role?.toLowerCase().includes(q) || (t.skills ?? []).some(s => s.toLowerCase().includes(q)))) return false;
    if (filterLevel    !== "All levels"    && t.experience_level !== filterLevel)    return false;
    if (filterLocation !== "All locations" && !t.location?.includes(filterLocation)) return false;
    return true;
  }), [scored, search, filterLevel, filterLocation]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortBy === "Best match")       arr.sort((a, b) => b._score - a._score);
    if (sortBy === "Most experienced") {
      const O = { "lead / staff (8+ years)": 4, "senior (5–8 years)": 3, "mid-level (3–5 years)": 2, "junior (0–2 years)": 1 };
      arr.sort((a, b) => (O[(b.experience_level ?? "").toLowerCase()] ?? 0) - (O[(a.experience_level ?? "").toLowerCase()] ?? 0));
    }
    if (sortBy === "Newest") arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return arr;
  }, [filtered, sortBy]);

  // ── Error state ───────────────────────────────────────────────────────────
  if (!roleLoading && roleError) {
    return (
      <div className="max-w-7xl mx-auto pb-20 flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-sm font-bold text-red-500">{roleError}</p>
        <button onClick={() => navigate("/client/roles")} className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to roles
        </button>
      </div>
    );
  }

  // ── Initial loading ───────────────────────────────────────────────────────
  if (roleLoading && talentsLoading) {
    return (
      <div className="max-w-7xl mx-auto pb-20 flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading sourcing page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-3">
          <button onClick={() => navigate("/client/roles")}
            className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to roles
          </button>
          <div className="flex items-center gap-2 text-blue-600 text-[11px] font-bold uppercase tracking-widest">
            <Users className="w-3.5 h-3.5" /> Talent sourcing
          </div>

          {roleLoading
            ? <div className="h-12 w-72 bg-slate-500/10 rounded-xl animate-pulse" />
            : (
              <h1 className="text-4xl sm:text-5xl font-extrabold dark:text-white tracking-tight">
                Source for <span className="text-blue-600">{role?.title ?? "role"}.</span>
              </h1>
            )
          }

          {!roleLoading && role && (
            <div className="flex flex-wrap items-center gap-2">
              {[role.department, role.type, role.location, role.experience_level].filter(Boolean).map(tag => (
                <span key={tag} className="text-[10px] font-black uppercase tracking-wider bg-slate-500/10 text-slate-500 px-2.5 py-1 rounded-lg">{tag}</span>
              ))}
              {role.skills?.slice(0, 4).map(s => (
                <span key={s} className="text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 px-2.5 py-1 rounded-lg">{s}</span>
              ))}
              {(role.skills?.length ?? 0) > 4 && (
                <span className="text-[10px] font-black text-slate-400">+{role.skills.length - 4} skills</span>
              )}
            </div>
          )}
        </div>

        {/* Top-right actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
          {aiLoading && (
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> AI scoring...
            </span>
          )}

          {/* ── Search Deeper with Haraka ── */}
          <button
            onClick={handleSearchDeeper}
            disabled={!role}
            className="flex items-center gap-2 px-5 py-3 bg-[var(--card-bg)] border border-emerald-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-500/5 hover:border-emerald-500/60 transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
          >
            <BrainCircuit className="w-3.5 h-3.5 group-hover:animate-pulse" />
            Search deeper
            <span className="text-[8px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded-lg border border-emerald-500/20 font-black uppercase tracking-wider">
              Haraka-01
            </span>
          </button>

          <Link
            to={`/client/roles/${roleId}/shortlist`}
            className="flex items-center gap-2 px-5 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-blue-500/40 transition-all"
          >
            <ListChecks className="w-3.5 h-3.5" />
            View shortlist
            {shortlisted.size > 0 && (
              <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{shortlisted.size}</span>
            )}
          </Link>
        </div>
      </div>

      {/* ── Haraka CTA banner — shown when platform pool is small ── */}
      {!talentsLoading && sorted.length < 5 && role && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20"
        >
          <div className="flex items-center gap-3">
            <BrainCircuit className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Limited platform matches</p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Only {sorted.length} talent{sorted.length !== 1 ? "s" : ""} found. Haraka-01 can search GitHub's global developer pool.
              </p>
            </div>
          </div>
          <button
            onClick={handleSearchDeeper}
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
          >
            <Zap className="w-3.5 h-3.5 fill-current" /> Search deeper
          </button>
        </motion.div>
      )}

      {/* ── Search + Sort + Filters ── */}
      <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, role, or skill..."
              className="w-full pl-10 pr-4 py-3 bg-slate-500/5 border border-[var(--border-color)] rounded-xl text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="appearance-none bg-slate-500/5 border border-[var(--border-color)] rounded-xl pl-4 pr-8 py-3 text-xs font-black uppercase tracking-widest text-slate-500 outline-none cursor-pointer">
                {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>
            <button onClick={() => setFiltersOpen(v => !v)}
              className={`flex items-center gap-2 px-4 py-3 border rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filtersOpen ? "bg-blue-600 text-white border-blue-600" : "border-[var(--border-color)] text-slate-400 hover:bg-slate-500/5"}`}>
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {filtersOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {[
                  { value: filterLevel,    setter: setFilterLevel,    options: levels    },
                  { value: filterLocation, setter: setFilterLocation, options: locations },
                ].map((f, i) => (
                  <div key={i} className="relative">
                    <select value={f.value} onChange={e => f.setter(e.target.value)}
                      className="w-full appearance-none bg-slate-500/5 border border-[var(--border-color)] rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-500 outline-none cursor-pointer">
                      {f.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap gap-4 pt-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Score:</span>
          {[
            { color: "bg-emerald-500", label: "Skills (45pt)"   },
            { color: "bg-blue-500",    label: "Level (20pt)"    },
            { color: "bg-amber-500",   label: "Location (20pt)" },
            { color: "bg-purple-500",  label: "Rate (15pt)"     },
          ].map(b => (
            <span key={b.label} className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <span className={`w-2 h-2 rounded-full ${b.color}`} />{b.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Platform talents", value: talentsLoading ? "…" : sorted.length },
          { label: "Strong matches",   value: talentsLoading ? "…" : sorted.filter(t => t._score >= 80).length },
          { label: "Shortlisted",      value: shortlisted.size },
          { label: "AI scored",        value: aiLoading ? "…" : Object.keys(aiScores).length },
        ].map(s => (
          <div key={s.label} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
            <p className="text-xl font-black dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Talent grid ── */}
      {talentsLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading talent pool...</p>
          </div>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {sorted.length > 0 ? (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence>
                {sorted.map(talent => (
                  <SourcingTalentCard
                    key={talent.id}
                    talent={talent}
                    role={role ?? {}}
                    isShortlisted={shortlisted.has(talent.id)}
                    onShortlist={handleShortlist}
                    onReview={t => setDrawerTalent(t)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-24 text-center space-y-5 bg-slate-500/5 rounded-2xl border border-dashed border-[var(--border-color)]">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-xl font-black tracking-tighter uppercase dark:text-white">No platform talents found</h3>
              <p className="text-sm text-slate-400 font-medium">Try adjusting your filters, or search GitHub's global pool with Haraka-01</p>
              {role && (
                <button
                  onClick={handleSearchDeeper}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
                >
                  <BrainCircuit className="w-3.5 h-3.5" /> Search deeper with Haraka-01
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* ── Drawer ── */}
      <AnimatePresence>
        {drawerTalent && (
          <TalentDrawer
            talent={drawerTalent}
            role={role}
            isShortlisted={shortlisted.has(drawerTalent.id)}
            onShortlist={handleShortlist}
            onClose={() => setDrawerTalent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}