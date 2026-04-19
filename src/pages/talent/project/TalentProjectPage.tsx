"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderKanban, Calendar, DollarSign, Users, Globe,
  Lock, Loader2, AlertTriangle, Tag, CheckCircle2,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  budget_currency: string;
  budget_spent: number | null;
  tags: string[];
  is_client_facing: boolean;
  progress: number;
  // my role on this project
  my_role?: string | null;
  // team members
  members?: TeamMember[];
}

interface TeamMember {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role_title: string | null;
  role_on_project: string | null;
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  active:    { label: "Active",    color: "text-emerald-600", bg: "bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-500" },
  on_hold:   { label: "On hold",   color: "text-amber-600",   bg: "bg-amber-500/10 border-amber-500/20",     dot: "bg-amber-500"   },
  completed: { label: "Completed", color: "text-blue-600",    bg: "bg-blue-500/10 border-blue-500/20",       dot: "bg-blue-500"    },
  cancelled: { label: "Cancelled", color: "text-slate-500",   bg: "bg-slate-500/10 border-slate-500/20",     dot: "bg-slate-400"   },
};

const PRIORITY_CFG: Record<string, { color: string; bg: string }> = {
  low:      { color: "text-slate-500", bg: "bg-slate-500/10"  },
  medium:   { color: "text-blue-600",  bg: "bg-blue-500/10"   },
  high:     { color: "text-amber-600", bg: "bg-amber-500/10"  },
  critical: { color: "text-red-500",   bg: "bg-red-500/10"    },
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function daysUntil(iso: string | null) {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
function getInitials(n: string) {
  return n?.split(" ").map(x => x[0]).join("").toUpperCase().slice(0, 2) ?? "?";
}

// ─── Single Project Card ──────────────────────────────────────────────────────
function ProjectCard({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);
  const sc = STATUS_CFG[project.status] ?? STATUS_CFG.active;
  const pc = PRIORITY_CFG[project.priority] ?? PRIORITY_CFG.medium;
  const daysLeft = daysUntil(project.end_date);
  const overdue = daysLeft !== null && daysLeft < 0;
  const nearDeadline = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
  const progressColor = project.progress >= 100
    ? "bg-emerald-500" : project.progress >= 60 ? "bg-blue-500" : "bg-amber-500";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl bg-[var(--card-bg)] border overflow-hidden transition-all ${
        overdue ? "border-red-500/30" : nearDeadline ? "border-amber-500/30" : "border-[var(--border-color)]"
      }`}
    >
      {/* Deadline banner */}
      {(overdue || nearDeadline) && (
        <div className={`flex items-center gap-2 px-5 py-2.5 ${overdue ? "bg-red-500/5" : "bg-amber-500/5"}`}>
          <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${overdue ? "text-red-500" : "text-amber-500"}`} />
          <p className={`text-[11px] font-black ${overdue ? "text-red-500" : "text-amber-600"}`}>
            {overdue
              ? `Overdue by ${Math.abs(daysLeft!)} day${Math.abs(daysLeft!) !== 1 ? "s" : ""}`
              : `Deadline in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`}
          </p>
        </div>
      )}

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-black dark:text-white tracking-tight leading-tight mb-2">
              {project.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${sc.bg} ${sc.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
              </span>
              <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${pc.bg} ${pc.color}`}>
                {project.priority}
              </span>
              {project.my_role && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 border border-blue-500/10 px-2.5 py-1 rounded-lg">
                  My role: {project.my_role}
                </span>
              )}
              {project.is_client_facing
                ? <Globe className="w-3.5 h-3.5 text-blue-400" />
                : <Lock className="w-3.5 h-3.5 text-slate-400" />
              }
            </div>
          </div>
          <button
            onClick={() => setExpanded(v => !v)}
            className="p-2 rounded-xl hover:bg-slate-500/10 text-slate-400 transition-colors shrink-0"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Progress</span>
            <span className="text-[10px] font-black dark:text-white">{project.progress}%</span>
          </div>
          <div className="h-2 w-full bg-slate-500/10 rounded-full overflow-hidden">
            <div className={`h-full ${progressColor} rounded-full transition-all duration-500`}
              style={{ width: `${project.progress}%` }} />
          </div>
          {project.progress >= 100 && (
            <div className="flex items-center gap-1.5 mt-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <p className="text-[10px] font-black text-emerald-600">Project complete!</p>
            </div>
          )}
        </div>

        {/* Quick meta */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4">
          {project.start_date && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
              <Calendar className="w-3 h-3" /> {fmtDate(project.start_date)} → {fmtDate(project.end_date)}
            </span>
          )}
          {project.members && project.members.length > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
              <Users className="w-3 h-3" /> {project.members.length} member{project.members.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Team avatars strip */}
        {project.members && project.members.length > 0 && (
          <div className="flex -space-x-2 mb-4">
            {project.members.slice(0, 6).map(m => (
              <div key={m.id} className="w-7 h-7 rounded-full bg-slate-500/10 border-2 border-[var(--card-bg)] overflow-hidden flex items-center justify-center"
                title={`${m.full_name}${m.role_on_project ? ` — ${m.role_on_project}` : ""}`}>
                {m.avatar_url
                  ? <img src={m.avatar_url} alt={m.full_name} className="w-full h-full object-cover" />
                  : <span className="text-[8px] font-black text-slate-400">{getInitials(m.full_name)}</span>
                }
              </div>
            ))}
            {project.members.length > 6 && (
              <div className="w-7 h-7 rounded-full bg-slate-500/20 border-2 border-[var(--card-bg)] flex items-center justify-center">
                <span className="text-[8px] font-black text-slate-500">+{project.members.length - 6}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expandable detail section */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-5 pb-5 space-y-4 border-t border-[var(--border-color)] pt-4">

              {/* Description */}
              {project.description && (
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">About</p>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              )}

              {/* Tags */}
              {project.tags?.length > 0 && (
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">
                    <Tag className="w-3 h-3" />Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map(t => (
                      <span key={t} className="text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 border border-blue-500/10 px-2 py-0.5 rounded-lg">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Full team list */}
              {project.members && project.members.length > 0 && (
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">
                    <Users className="inline w-3 h-3 mr-1" />Team
                  </p>
                  <div className="space-y-2">
                    {project.members.map(m => (
                      <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-500/5 border border-[var(--border-color)]">
                        <div className="w-8 h-8 rounded-xl bg-slate-500/10 border border-[var(--border-color)] overflow-hidden flex items-center justify-center shrink-0">
                          {m.avatar_url
                            ? <img src={m.avatar_url} alt={m.full_name} className="w-full h-full object-cover" />
                            : <span className="text-[10px] font-black text-slate-400">{getInitials(m.full_name)}</span>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black dark:text-white truncate">{m.full_name}</p>
                          <p className="text-[10px] font-bold text-slate-400 truncate">
                            {m.role_on_project ?? m.role_title ?? "Team member"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TalentProjectPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);
  const [noProject, setNoProject] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Find my workforce_member row(s)
        const { data: wmRows } = await supabase
          .from("workforce_members")
          .select("id")
          .eq("profile_id", user.id)
          .eq("is_active", true);

        if (!wmRows || wmRows.length === 0) {
          setNoProject(true); setLoading(false); return;
        }
        const wmIds = wmRows.map(w => w.id);

        // 2. Find all project assignments for my workforce_member rows
        const { data: pmRows } = await supabase
          .from("project_members")
          .select("project_id, role_on_project")
          .in("workforce_member_id", wmIds);

        if (!pmRows || pmRows.length === 0) {
          setNoProject(true); setLoading(false); return;
        }

        const projectIds = [...new Set(pmRows.map(r => r.project_id))];
        const myRoleMap: Record<string, string | null> = {};
        pmRows.forEach(r => { myRoleMap[r.project_id] = r.role_on_project; });

        // 3. Fetch the actual projects (RLS allows if assigned)
        const { data: projData } = await supabase
          .from("projects")
          .select("*")
          .in("id", projectIds)
          .order("created_at", { ascending: false });

        if (!projData || projData.length === 0) {
          setNoProject(true); setLoading(false); return;
        }

        // 4. For each project, fetch team members
        const { data: allPmData } = await supabase
          .from("project_members")
          .select("project_id, workforce_member_id, role_on_project")
          .in("project_id", projectIds);

        // Fetch workforce member profiles
        const teamMemberIds = [...new Set((allPmData ?? []).map(pm => pm.workforce_member_id))];
        let memberMap: Record<string, any> = {};
        if (teamMemberIds.length > 0) {
          const { data: wmData } = await supabase
            .from("workforce_members")
            .select("id, full_name, avatar_url, role_title, profile_id")
            .in("id", teamMemberIds);

          // Enrich with profiles
          const profileIds = (wmData ?? []).map(m => m.profile_id).filter(Boolean);
          let profileMap: Record<string, any> = {};
          if (profileIds.length > 0) {
            const { data: pData } = await supabase
              .from("profiles")
              .select("id, full_name, avatar_url")
              .in("id", profileIds);
            if (pData) profileMap = Object.fromEntries(pData.map(p => [p.id, p]));
          }

          memberMap = Object.fromEntries(
            (wmData ?? []).map(m => [m.id, {
              ...m,
              full_name:  profileMap[m.profile_id]?.full_name  ?? m.full_name,
              avatar_url: profileMap[m.profile_id]?.avatar_url ?? m.avatar_url,
            }])
          );
        }

        // 5. Assemble projects with team + my role
        const enriched: Project[] = (projData as Project[]).map(p => ({
          ...p,
          my_role: myRoleMap[p.id] ?? null,
          members: (allPmData ?? [])
            .filter(pm => pm.project_id === p.id)
            .map(pm => ({
              id:              pm.workforce_member_id,
              full_name:       memberMap[pm.workforce_member_id]?.full_name  ?? "Unknown",
              avatar_url:      memberMap[pm.workforce_member_id]?.avatar_url ?? null,
              role_title:      memberMap[pm.workforce_member_id]?.role_title  ?? null,
              role_on_project: pm.role_on_project,
            })),
        }));

        setProjects(enriched);
      } catch (err) {
        console.error(err);
        setNoProject(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) return (
    <div className="w-full flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading your projects...</p>
      </div>
    </div>
  );

  if (noProject || projects.length === 0) return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="py-24 text-center space-y-4 bg-slate-500/5 rounded-2xl border border-dashed border-[var(--border-color)]">
        <FolderKanban className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-xl font-black tracking-tighter uppercase dark:text-white">Not assigned to any project</h3>
        <p className="text-sm text-slate-400 font-medium">Your organisation will assign you to projects from the Active Workforce page.</p>
      </div>
    </div>
  );

  const activeProjects    = projects.filter(p => p.status === "active");
  const otherProjects     = projects.filter(p => p.status !== "active");

  return (
    <div className="w-full space-y-6 pb-20 p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-blue-600 text-[11px] font-bold uppercase tracking-widest">
          <FolderKanban className="w-3.5 h-3.5" /> My Projects
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold dark:text-white tracking-tight">
          Your <span className="text-blue-600">projects.</span>
        </h1>
        <p className="text-sm font-medium text-slate-400">
          {projects.length} project{projects.length !== 1 ? "s" : ""} assigned · {activeProjects.length} active
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total",     value: projects.length                                },
          { label: "Active",    value: activeProjects.length                          },
          { label: "Completed", value: projects.filter(p=>p.status==="completed").length },
          { label: "Avg progress", value: projects.length > 0
              ? `${Math.round(projects.reduce((a,p)=>a+p.progress,0)/projects.length)}%`
              : "—"
          },
        ].map(s => (
          <div key={s.label} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
            <p className="text-2xl font-black dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Active projects */}
      {activeProjects.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeProjects.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
        </div>
      )}

      {/* Other projects */}
      {otherProjects.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Other</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {otherProjects.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}