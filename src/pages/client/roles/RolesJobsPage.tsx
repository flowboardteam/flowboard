"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, SlidersHorizontal, MapPin, Users,
  ChevronDown, MoreHorizontal, Zap, BriefcaseBusiness,
  FileText, CircleDot, XCircle, Eye, Pencil, Trash2,
  Loader2, RefreshCw, Share2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useGroups } from "@/contexts/GroupContext";

// ─── Constants ────────────────────────────────────────────────────────────────
const DEPARTMENTS = ["All departments","Engineering","Design","Product","Operations","Marketing","Finance","Human Resources","Sales"];
const TYPES       = ["All types","Full-time","Contract","Part-time"];
const LOCATIONS   = ["All locations","Remote","On-site","Hybrid"];
const TABS        = ["all","open","draft","closed"];

const STATUS_CONFIG = {
  open:   { label: "Open",   className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", dot: "bg-emerald-500" },
  draft:  { label: "Draft",  className: "bg-amber-500/10 text-amber-600 border-amber-500/20",       dot: "bg-amber-500"  },
  closed: { label: "Closed", className: "bg-slate-500/10 text-slate-500 border-slate-500/20",       dot: "bg-slate-400"  },
};


// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ title, message, confirmLabel = "Delete", onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onCancel}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-sm bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 shadow-2xl">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="text-base font-black dark:text-white tracking-tight mb-2">{title}</h3>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{message}</p>
          <div className="flex gap-3">
            <button onClick={onCancel}
              className="flex-1 py-3 border border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-xl hover:bg-slate-500/5 transition-all">
              Cancel
            </button>
            <button onClick={onConfirm}
              className="flex-1 py-3 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-400 transition-all flex items-center justify-center gap-2 shadow-md shadow-red-500/20">
              <Trash2 className="w-3.5 h-3.5" />{confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Role Card ────────────────────────────────────────────────────────────────
function RoleCard({ role, navigate, onView, onEdit, onDelete, onStatusChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const { toast } = useToast();
  const status = STATUS_CONFIG[role.status] ?? STATUS_CONFIG.draft;

  const copyShareLink = () => {
    const url = `${window.location.origin}/jobs/${role.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: "You can now share this role on LinkedIn or other platforms.",
    });
    setMenuOpen(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm flex flex-col justify-between group hover:border-blue-500/40 transition-all relative"
    >
      {/* Status + menu */}
      <div className="flex items-center justify-between mb-5">
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${status.className}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-500/10 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                className="absolute right-0 top-8 z-30 w-44 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden"
              >
                <button onClick={() => { onView(role); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-bold hover:bg-slate-500/5 transition-colors">
                  <Eye className="w-3.5 h-3.5" /> View details
                </button>
                <button onClick={copyShareLink} className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-500/5 transition-colors">
                  <Share2 className="w-3.5 h-3.5" /> Copy public link
                </button>
                <button onClick={() => { onEdit(role); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-bold hover:bg-slate-500/5 transition-colors">
                  <Pencil className="w-3.5 h-3.5" /> Edit role
                </button>
                {role.status === "draft" && (
                  <button onClick={() => { onStatusChange(role.id, "open"); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-emerald-600 hover:bg-emerald-500/5 transition-colors">
                    <CircleDot className="w-3.5 h-3.5" /> Publish
                  </button>
                )}
                {role.status === "open" && (
                  <button onClick={() => { onStatusChange(role.id, "closed"); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-500/5 transition-colors">
                    <XCircle className="w-3.5 h-3.5" /> Close role
                  </button>
                )}
                {role.status === "closed" && (
                  <button onClick={() => { onStatusChange(role.id, "open"); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-blue-500 hover:bg-blue-500/5 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" /> Reopen
                  </button>
                )}
                <div className="h-px bg-[var(--border-color)] mx-2" />
                <button onClick={() => { setConfirmDeleteId(role.id); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-500/5 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Title */}
      <div className="mb-4">
        <h3 className="text-lg font-black tracking-tight dark:text-white leading-snug mb-1">{role.title}</h3>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{role.department || "No department"}</p>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4">
        <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400"><BriefcaseBusiness className="w-3 h-3" /> {role.type}</span>
        <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400"><MapPin className="w-3 h-3" /> {role.location}</span>
        <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400"><Users className="w-3 h-3" /> {role.applicants_count ?? 0} applicants</span>
      </div>

      {/* Skills */}
      {role.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {role.skills.slice(0, 4).map(s => (
            <span key={s} className="text-[10px] font-black uppercase tracking-wider bg-slate-500/10 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-lg">{s}</span>
          ))}
          {role.skills.length > 4 && <span className="text-[10px] font-black text-slate-400">+{role.skills.length - 4}</span>}
        </div>
      )}

      {confirmDeleteId && (
        <ConfirmDialog
          title="Delete this role?"
          message="This role and all associated data will be permanently deleted. This cannot be undone."
          confirmLabel="Delete role"
          onConfirm={() => { onDelete(confirmDeleteId); setConfirmDeleteId(null); }}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
        <span className="text-xs font-bold text-slate-400">{role.salary || "Salary TBD"}</span>
        {role.status === "open" && (
          <button
            onClick={() => navigate(`/client/roles/${role.id}/source`)}
            className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/20"
          >
            <Zap className="w-3 h-3 fill-current" /> Source talent
          </button>
        )}
        {role.status === "draft" && (
          <button onClick={() => onStatusChange(role.id, "open")} className="px-4 py-2 bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-500/20 transition-all border border-amber-500/20">
            Publish
          </button>
        )}
        {role.status === "closed" && (
          <button onClick={() => onStatusChange(role.id, "open")} className="px-4 py-2 bg-slate-500/10 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-500/20 transition-all">
            Reopen
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Role Detail Drawer ───────────────────────────────────────────────────────
function RoleDrawer({ role, navigate, onClose, onEdit }) {
  if (!role) return null;
  const status = STATUS_CONFIG[role.status] ?? STATUS_CONFIG.draft;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--card-bg)] border-l border-[var(--border-color)] z-50 overflow-y-auto shadow-2xl"
      >
        <div className="p-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border mb-3 ${status.className}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} /> {status.label}
              </span>
              <h2 className="text-2xl font-black tracking-tight dark:text-white">{role.title}</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{role.department} · {role.type}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-500/10 text-slate-400 transition-colors">
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { label: "Location",   value: role.location },
              { label: "Salary",     value: role.salary || "TBD" },
              { label: "Applicants", value: role.applicants_count ?? 0 },
              { label: "Posted",     value: fmtDate(role.created_at) },
            ].map(m => (
              <div key={m.label} className="bg-slate-500/5 rounded-xl p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{m.label}</p>
                <p className="text-sm font-black dark:text-white">{m.value}</p>
              </div>
            ))}
          </div>

          {role.description && (
            <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Description</p>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">{role.description}</p>
            </div>
          )}

          {role.responsibilities?.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Responsibilities</p>
              <div className="flex flex-wrap gap-2">
                {role.responsibilities.map(r => <span key={r} className="text-[11px] font-black uppercase tracking-wider bg-slate-500/10 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-lg">{r}</span>)}
              </div>
            </div>
          )}

          {role.skills?.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Skills & Requirements</p>
              <div className="flex flex-wrap gap-2">
                {role.skills.map(s => <span key={s} className="text-[11px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-500 px-3 py-1 rounded-lg">{s}</span>)}
              </div>
            </div>
          )}

          {role.benefits?.length > 0 && (
            <div className="mb-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Benefits</p>
              <div className="flex flex-wrap gap-2">
                {role.benefits.map(b => <span key={b} className="text-[11px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-lg">{b}</span>)}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => { navigate(`/client/roles/${role.id}/source`); onClose(); }}
              className="flex-1 py-3.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <Zap className="w-3.5 h-3.5 fill-current" /> Source talent
            </button>
            <button
              onClick={() => { onEdit(role); onClose(); }}
              className="px-5 py-3.5 bg-slate-500/10 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-500/20 transition-all flex items-center gap-2"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RolesJobsPage() {
  const navigate = useNavigate();
  const { activeGroup } = useGroups();

  const [roles, setRoles]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [activeTab, setActiveTab]     = useState("all");
  const [search, setSearch]           = useState("");
  const [dept, setDept]               = useState("All departments");
  const [type, setType]               = useState("All types");
  const [location, setLocation]       = useState("All locations");
  const [viewRole, setViewRole]       = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // ── Fetch roles ONCE on mount — no useCallback, no dep array trap ─────────
  // Using a ref to allow manual refetch (retry button) without recreating
  // the function and triggering infinite loops.
  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Not authenticated");

      const { data, error: dbError } = await supabase
        .from("roles")
        .select("*")
        .eq("organization_id", user.id)
        .order("created_at", { ascending: false });

      if (dbError) throw dbError;
      setRoles(data ?? []);
    } catch (err) {
      console.error("fetchRoles error:", err);
      setError(err.message ?? "Could not load roles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Run on mount
  useEffect(() => {
    fetchRoles();
  }, []);

  // ── Optimistic delete ─────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setRoles(prev => prev.filter(r => r.id !== id));
    const { error: dbError } = await supabase.from("roles").delete().eq("id", id);
    if (dbError) {
      console.error("Delete error:", dbError);
      fetchRoles(); // re-sync on failure
    }
  };

  // ── Optimistic status change ──────────────────────────────────────────────
  const handleStatusChange = async (id, newStatus) => {
    setRoles(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    const { error: dbError } = await supabase.from("roles").update({ status: newStatus }).eq("id", id);
    if (dbError) {
      console.error("Status change error:", dbError);
      fetchRoles();
    }
  };

  // ── Client-side filtering ─────────────────────────────────────────────────
  const filtered = roles.filter(r => {
    if (activeTab !== "all" && r.status !== activeTab) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (dept !== "All departments" && r.department !== dept) return false;
    if (type !== "All types" && r.type !== type) return false;
    if (location !== "All locations" && r.location !== location) return false;
    return true;
  });

  const counts = {
    all:    roles.length,
    open:   roles.filter(r => r.status === "open").length,
    draft:  roles.filter(r => r.status === "draft").length,
    closed: roles.filter(r => r.status === "closed").length,
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto pb-20 flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading roles...</p>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-7xl mx-auto pb-20 flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-sm font-bold text-red-500">{error}</p>
        <button
          onClick={fetchRoles}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-600 text-[11px] font-bold tracking-widest">
            <BriefcaseBusiness className="w-3.5 h-3.5" /> Roles & jobs
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
            Build your team.
          </h1>
          <p className="text-sm font-medium text-slate-400">
            {counts.open} open · {counts.draft} drafts · {counts.closed} closed
          </p>
        </div>
        <button
          onClick={() => navigate("/client/roles/create")}
          className="w-full md:w-auto px-8 py-4 bg-emerald-600 text-white font-black text-xs tracking-widest rounded-xl hover:bg-emerald-500 transition-all hover:scale-105 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create role
        </button>
      </div>

      {/* ── Search + Filters ── */}
      <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search roles by title..."
              className="w-full pl-10 pr-4 py-3 bg-slate-500/5 border border-[var(--border-color)] rounded-xl text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all"
            />
          </div>
          <button
            onClick={() => setFiltersOpen(v => !v)}
            className={`flex items-center gap-2 px-5 py-3 border rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              filtersOpen
                ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                : "border-[var(--border-color)] text-slate-400 hover:bg-slate-500/5"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
          </button>
        </div>

        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {[
                  { value: dept,     setter: setDept,     options: DEPARTMENTS },
                  { value: type,     setter: setType,     options: TYPES       },
                  { value: location, setter: setLocation, options: LOCATIONS   },
                ].map((f, i) => (
                  <div key={i} className="relative">
                    <select
                      value={f.value}
                      onChange={e => f.setter(e.target.value)}
                      className="w-full appearance-none bg-slate-500/5 border border-[var(--border-color)] rounded-xl px-4 py-3 text-xs font-black tracking-widest text-slate-500 outline-none focus:ring-2 ring-blue-500/20 cursor-pointer"
                    >
                      {f.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-slate-500/5 p-1 rounded-xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-[11px] font-black tracking-widest transition-all ${
              activeTab === tab
                ? "bg-[var(--card-bg)] text-blue-600 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab} <span className="ml-2 text-[9px] opacity-60">{counts[tab]}</span>
          </button>
        ))}
      </div>

      {/* ── Grid ── */}
      <AnimatePresence mode="popLayout">
        {filtered.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {filtered.map(role => (
                <RoleCard
                  key={role.id}
                  role={role}
                  navigate={navigate}
                  onView={setViewRole}
                  onEdit={r => navigate(`/client/roles/create?edit=${r.id}`)}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-24 text-center space-y-4 bg-slate-500/5 rounded-2xl border border-dashed border-[var(--border-color)]"
          >
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-xl font-black tracking-tighter dark:text-white">
              {search ? "No roles match your search" : "No roles yet"}
            </h3>
            <p className="text-sm text-slate-400 font-medium">
              {search ? "Try a different search term or clear your filters" : "Create your first role to start sourcing talent"}
            </p>
            {!search && (
              <button
                onClick={() => navigate("/client/roles/create")}
                className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all shadow-md shadow-blue-600/20"
              >
                <Plus className="w-3.5 h-3.5" /> Create role
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Drawer ── */}
      <AnimatePresence>
        {viewRole && (
          <RoleDrawer
            role={viewRole}
            navigate={navigate}
            onClose={() => setViewRole(null)}
            onEdit={r => navigate(`/client/roles/create?edit=${r.id}`)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}