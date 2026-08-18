"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, Loader2, LayoutGrid, List } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Project {
  id: string;
  organization_id: string;
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
  my_role?: string | null;
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "text-emerald-600", bg: "bg-emerald-500/10" },
  on_hold: { label: "On hold", color: "text-amber-600", bg: "bg-amber-500/10" },
  completed: { label: "Completed", color: "text-blue-600", bg: "bg-blue-500/10" },
  cancelled: { label: "Cancelled", color: "text-slate-500", bg: "bg-slate-500/10" },
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ProjectCard({ project, viewMode, onSelect }: { project: Project; viewMode: "box"|"list"; onSelect: () => void }) {
  const status = STATUS_CFG[project.status] ?? STATUS_CFG.active;
  const progressColor = project.progress >= 100 ? "bg-emerald-500" : project.progress >= 60 ? "bg-blue-500" : "bg-amber-500";

  return (
    <button
      onClick={onSelect}
      className={`group cursor-pointer rounded-3xl border border-transparent bg-white/90 p-5 text-left shadow-sm shadow-slate-200 transition hover:-translate-y-0.5 hover:border-blue-400 hover:bg-white ${viewMode === "list" ? "w-full" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{project.my_role ?? "Assigned project"}</p>
          <h3 className="mt-2 text-lg font-black text-slate-950 truncate">{project.name}</h3>
          <p className="mt-2 text-sm text-slate-500 line-clamp-3">{project.description ?? "No description provided."}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] ${status.color} ${status.bg}`}>
          {status.label}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400">Timeline</p>
            <p className="text-sm font-bold text-slate-900">{fmtDate(project.start_date)} — {fmtDate(project.end_date)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400">Progress</p>
            <div className="mt-2 h-2 w-28 overflow-hidden rounded-full bg-slate-200">
              <div className={`${progressColor} h-full`} style={{ width: `${project.progress}%` }} />
            </div>
            <p className="mt-1 text-xs font-black text-slate-500">{project.progress}%</p>
          </div>
        </div>

        {project.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.tags.map(tag => (
              <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

export default function TalentProjectPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [noProject, setNoProject] = useState(false);
  const [viewMode, setViewMode] = useState<"box"|"list">("box");
  const navigate = useNavigate();

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw authError ?? new Error("Not authenticated");

      const { data: wfRows, error: wfError } = await supabase
        .from("workforce_members")
        .select("id")
        .eq("profile_id", user.id)
        .eq("is_active", true);

      if (wfError || !wfRows || wfRows.length === 0) {
        setNoProject(true);
        return;
      }

      const workforceIds = wfRows.map((row: any) => row.id);
      const { data: pmRows, error: pmError } = await supabase
        .from("project_members")
        .select("project_id, role_on_project")
        .in("workforce_member_id", workforceIds);

      if (pmError || !pmRows || pmRows.length === 0) {
        setNoProject(true);
        return;
      }

      const projectIds = [...new Set(pmRows.map((row: any) => row.project_id))];
      const roleMap: Record<string, string | null> = {};
      pmRows.forEach((row: any) => {
        roleMap[row.project_id] = row.role_on_project;
      });

      const { data: projRows, error: projError } = await supabase
        .from("projects")
        .select("*")
        .in("id", projectIds)
        .order("created_at", { ascending: false });

      if (projError || !projRows || projRows.length === 0) {
        setNoProject(true);
        return;
      }

      const normalizedProjects = projRows.map((proj: any) => ({
        ...proj,
        my_role: roleMap[proj.id] ?? null,
        tags: proj.tags ?? [],
      })) as Project[];

      setProjects(normalizedProjects);
      setNoProject(false);
    } catch (error) {
      console.error(error);
      setNoProject(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    const channel = supabase.channel("talent-projects-rt")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "projects" }, () => {
        fetchProjects();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProjects]);

  const activeProjects = projects.filter(project => project.status === "active");

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading assigned projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-20 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl sm:text-4xl font-extrabold dark:text-white tracking-tight">
          Projects.
        </h1>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <button
            type="button"
            onClick={() => setViewMode("box")}
            className={`inline-flex items-center justify-center rounded-2xl px-3 py-2 transition ${viewMode === "box" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`inline-flex items-center justify-center rounded-2xl px-3 py-2 transition ${viewMode === "list" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {noProject || projects.length === 0 ? (
        <div className="rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] p-10 text-center">
          <p className="text-lg font-extrabold text-slate-900">No assigned projects yet</p>
          <p className="mt-3 text-sm text-slate-500">You will see projects here once a client adds you to them.</p>
        </div>
      ) : (
        <div className={viewMode === "box" ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "space-y-4"}>
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              viewMode={viewMode}
              onSelect={() => navigate(`/talent/project/${project.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
