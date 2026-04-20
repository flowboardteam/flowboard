"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Zap, Loader2, Users, X, MapPin, BriefcaseBusiness,
  CheckCircle2, Trash2, MoreHorizontal, RefreshCw, ListChecks,
  Send, DollarSign, Calendar, Clock, FileText, UserCheck,
  ChevronDown, AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useGroups } from "@/contexts/GroupContext";

// ─── Pipeline config ──────────────────────────────────────────────────────────
const PIPELINE_STAGES = [
  { key: "shortlisted",  label: "Shortlisted",  color: "bg-blue-500",    text: "text-blue-600",    bg: "bg-blue-500/10 border-blue-500/20"    },
  { key: "contacted",    label: "Contacted",    color: "bg-amber-500",   text: "text-amber-600",   bg: "bg-amber-500/10 border-amber-500/20"   },
  { key: "interviewing", label: "Interviewing", color: "bg-purple-500",  text: "text-purple-600",  bg: "bg-purple-500/10 border-purple-500/20" },
  { key: "hired",        label: "Hired",        color: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-500/10 border-emerald-500/20"},
  { key: "rejected",     label: "Rejected",     color: "bg-red-400",     text: "text-red-500",     bg: "bg-red-500/10 border-red-500/20"       },
];
const stageConfig = Object.fromEntries(PIPELINE_STAGES.map(s => [s.key, s]));


// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({title,message,confirmLabel="Delete",onConfirm,onCancel}:{
  title:string;message:string;confirmLabel?:string;onConfirm:()=>void;onCancel:()=>void;
}){
  return (
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onCancel}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <motion.div initial={{opacity:0,scale:0.95,y:16}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:16}}
          onClick={e=>e.stopPropagation()}
          className="w-full max-w-sm bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 shadow-2xl">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
            <Trash2 className="w-5 h-5 text-red-500"/>
          </div>
          <h3 className="text-base font-black dark:text-white tracking-tight mb-2">{title}</h3>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{message}</p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-3 border border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-xl hover:bg-slate-500/5 transition-all">Cancel</button>
            <button onClick={onConfirm} className="flex-1 py-3 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-400 transition-all flex items-center justify-center gap-2 shadow-md shadow-red-500/20">
              <Trash2 className="w-3.5 h-3.5"/>{confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function scoreLabel(score: number) {
  if (score >= 80) return { color: "text-emerald-600", bg: "bg-emerald-500/10 border-emerald-500/20" };
  if (score >= 60) return { color: "text-blue-600",    bg: "bg-blue-500/10 border-blue-500/20"       };
  if (score >= 40) return { color: "text-amber-600",   bg: "bg-amber-500/10 border-amber-500/20"     };
  return               { color: "text-slate-500",   bg: "bg-slate-500/10 border-slate-500/20"     };
}

// ─── Hire Offer Modal ─────────────────────────────────────────────────────────
function HireOfferModal({ candidate, role, onClose, onConfirm, sending }) {
  const [form, setForm] = useState({
    role_title:      role?.title ?? "",
    role_type:       "full_time",
    salary_monthly:  "",
    salary_currency: "USD",
    start_date:      new Date().toISOString().split("T")[0],
    contract_length: "Indefinite",
    offer_message:   "",
  });

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const isValid = form.role_title.trim() && form.offer_message.trim();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-lg bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 pb-0">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-500/10 border border-[var(--border-color)] overflow-hidden flex items-center justify-center shrink-0">
                  {candidate.talent_avatar
                    ? <img src={candidate.talent_avatar} alt={candidate.talent_name} className="w-full h-full object-cover" />
                    : <span className="text-sm font-black text-slate-400 uppercase">{candidate.talent_name?.charAt(0)}</span>
                  }
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-0.5">Send hire offer</p>
                  <h2 className="text-lg font-black dark:text-white tracking-tight">
                    Hire {candidate.talent_name?.split(" ")[0]}
                  </h2>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">{candidate.talent_role}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-500/10 text-slate-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 mb-6">
              <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                This will send a formal hire offer to {candidate.talent_name?.split(" ")[0]}. They will receive a notification and can accept or decline from their dashboard.
              </p>
            </div>
          </div>

          {/* Form — scrollable */}
          <div className="px-8 pb-0 space-y-4 max-h-[50vh] overflow-y-auto">
            {/* Role title */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Role title *</label>
              <input
                value={form.role_title}
                onChange={e => update("role_title", e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full bg-slate-500/5 border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all"
              />
            </div>

            {/* Employment type */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Employment type *</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "full_time",  label: "Full-time"  },
                  { value: "contract",   label: "Contract"   },
                  { value: "part_time",  label: "Part-time"  },
                ].map(t => (
                  <button key={t.value} type="button" onClick={() => update("role_type", t.value)}
                    className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                      form.role_type === t.value
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20"
                        : "border-[var(--border-color)] text-slate-400 hover:bg-slate-500/5"
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Salary + Start date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  <DollarSign className="inline w-3 h-3 mr-0.5" />Monthly salary
                </label>
                <input
                  value={form.salary_monthly}
                  onChange={e => update("salary_monthly", e.target.value)}
                  placeholder="e.g. 5000"
                  type="number"
                  className="w-full bg-slate-500/5 border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  <Calendar className="inline w-3 h-3 mr-0.5" />Start date
                </label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={e => update("start_date", e.target.value)}
                  className="w-full bg-slate-500/5 border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Contract length (shown for contract/part-time) */}
            {form.role_type !== "full_time" && (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  <Clock className="inline w-3 h-3 mr-0.5" />Contract length
                </label>
                <div className="relative">
                  <select
                    value={form.contract_length}
                    onChange={e => update("contract_length", e.target.value)}
                    className="w-full appearance-none bg-slate-500/5 border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all cursor-pointer"
                  >
                    {["1 month","3 months","6 months","1 year","2 years","Indefinite"].map(l => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Offer message */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                <FileText className="inline w-3 h-3 mr-0.5" />Offer message *
              </label>
              <textarea
                value={form.offer_message}
                onChange={e => update("offer_message", e.target.value)}
                rows={4}
                placeholder="Dear [Name], we are excited to offer you this position. Describe the role, team, expectations and why you want them..."
                className="w-full bg-slate-500/5 border border-[var(--border-color)] rounded-xl p-4 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all resize-none"
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="p-8 pt-5 flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-3.5 border border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-xl hover:bg-slate-500/5 transition-all">
              Cancel
            </button>
            <button
              onClick={() => onConfirm(form)}
              disabled={!isValid || sending}
              className="flex-1 py-3.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {sending
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Send className="w-3.5 h-3.5" />
              }
              Send offer
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Candidate Card ───────────────────────────────────────────────────────────
function CandidateCard({ candidate, onStageChange, onRemove, onHire, onView }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string|null>(null);
  const stage  = stageConfig[candidate.status] ?? stageConfig.shortlisted;
  const sLabel = scoreLabel(candidate.overall_score ?? 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] flex flex-col gap-4 hover:border-blue-500/30 transition-all relative"
    >
      {/* Stage + menu */}
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${stage.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${stage.color}`} />
          {stage.label}
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${sLabel.bg} ${sLabel.color}`}>
            {candidate.overall_score ?? 0}% match
          </span>
          <div className="relative">
            <button onClick={() => setMenuOpen(v => !v)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-500/10 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  className="absolute right-0 top-8 z-30 w-48 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden"
                >
                  <div className="px-3 py-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Move to stage</p>
                    {PIPELINE_STAGES.filter(s => s.key !== candidate.status).map(s => (
                      <button key={s.key}
                        onClick={() => { onStageChange(candidate.id, s.key); setMenuOpen(false); }}
                        className={`flex items-center gap-2 w-full px-2 py-2 text-[11px] font-bold rounded-lg hover:bg-slate-500/5 transition-colors ${s.text}`}>
                        <span className={`w-2 h-2 rounded-full ${s.color}`} /> {s.label}
                      </button>
                    ))}
                  </div>
                  <div className="h-px bg-[var(--border-color)] mx-3" />
                  <button onClick={() => { setConfirmRemoveId(candidate.id); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-500/5 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Talent info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-500/10 border border-[var(--border-color)] flex items-center justify-center overflow-hidden shrink-0">
          {candidate.talent_avatar
            ? <img src={candidate.talent_avatar} alt={candidate.talent_name} className="w-full h-full object-cover" />
            : <span className="text-sm font-black text-slate-400 uppercase">{candidate.talent_name?.charAt(0)}</span>
          }
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-black dark:text-white tracking-tight truncate">{candidate.talent_name}</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{candidate.talent_role}</p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {candidate.talent_location && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
            <MapPin className="w-2.5 h-2.5" />{candidate.talent_location.split(",")[0]}
          </span>
        )}
        {candidate.talent_level && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
            <BriefcaseBusiness className="w-2.5 h-2.5" />{candidate.talent_level}
          </span>
        )}
      </div>

      {/* Skills */}
      {candidate.talent_skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {candidate.talent_skills.slice(0, 4).map(s => (
            <span key={s} className="text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-lg">{s}</span>
          ))}
          {candidate.talent_skills.length > 4 && (
            <span className="text-[9px] font-black text-slate-400">+{candidate.talent_skills.length - 4}</span>
          )}
        </div>
      )}

      {/* Score bar */}
      <div className="h-1 w-full bg-slate-500/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all"
          style={{ width: `${candidate.overall_score ?? 0}%` }}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-[var(--border-color)]">
        <button onClick={() => onView(candidate)}
          className="flex-1 py-2.5 bg-slate-500/10 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-500/20 transition-all">
          Profile
        </button>
        {candidate.status === "hired" ? (
          <span className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Hired
          </span>
        ) : candidate.status === "rejected" ? (
          <span className="flex items-center gap-1.5 px-4 py-2.5 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-red-500/20">
            Declined
          </span>
        ) : (
          <button onClick={() => onHire(candidate)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all shadow-md shadow-blue-600/20">
            <Zap className="w-3 h-3 fill-current" /> Send offer
          </button>
        )}
      </div>
      {confirmRemoveId && (
        <ConfirmDialog
          title="Remove from shortlist?"
          message="This candidate will be removed from your shortlist for this role."
          confirmLabel="Remove"
          onConfirm={() => { onRemove(confirmRemoveId); setConfirmRemoveId(null); }}
          onCancel={() => setConfirmRemoveId(null)}
        />
      )}
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RoleShortlistPage() {
  const { roleId }   = useParams();
  const navigate     = useNavigate();
  const { toast }    = useToast();
  const { activeGroup } = useGroups();

  const [role, setRole]               = useState<any>(null);
  const [candidates, setCandidates]   = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeStage, setActiveStage] = useState("all");
  const [hireTarget, setHireTarget]   = useState<any>(null);
  const [sending, setSending]         = useState(false);
  const [viewTarget, setViewTarget]   = useState<any>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: roleData }, { data: listData }] = await Promise.all([
        supabase.from("roles").select("*").eq("id", roleId).single(),
        supabase.from("role_shortlist").select("*")
          .eq("role_id", roleId)
          .eq("organization_id", user.id)
          .order("overall_score", { ascending: false }),
      ]);

      if (roleData) setRole(roleData);
      if (listData) setCandidates(listData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Stage change ────────────────────────────────────────────────────────
  const handleStageChange = async (id: string, newStatus: string) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    const { error } = await supabase.from("role_shortlist").update({ status: newStatus }).eq("id", id);
    if (error) { console.error(error); fetchAll(); }
  };

  // ── Remove ──────────────────────────────────────────────────────────────
  const handleRemove = async (id: string) => {
    setCandidates(prev => prev.filter(c => c.id !== id));
    const { error } = await supabase.from("role_shortlist").delete().eq("id", id);
    if (error) { console.error(error); fetchAll(); }
    else toast({ title: "Removed from shortlist" });
  };

  // ── Send formal hire offer ───────────────────────────────────────────────
  const handleSendOffer = async (offerForm: any) => {
    if (!hireTarget) return;
    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile }  = await supabase.from("profiles").select("full_name, email").eq("id", user!.id).single();

      // Insert / upsert the hire inquiry as a formal offer
      const { error: offerError } = await supabase.from("hire_inquiries").insert({
        talent_id:       hireTarget.talent_id,
        client_id:       user!.id,
        sender_name:     profile?.full_name ?? "Organisation",
        sender_email:    profile?.email ?? user!.email ?? "",
        role_title:      offerForm.role_title,
        role_type:       offerForm.role_type,
        salary_monthly:  offerForm.salary_monthly ? Number(offerForm.salary_monthly) : null,
        salary_currency: offerForm.salary_currency,
        start_date:      offerForm.start_date || null,
        contract_length: offerForm.contract_length,
        offer_message:   offerForm.offer_message,
        message:         offerForm.offer_message,   // keep legacy field in sync
        source:          "role_shortlist",
        role_id:         roleId,
        shortlist_id:    hireTarget.id,
        status:          "pending",
      });
      if (offerError) throw offerError;

      // Notify the talent
      await supabase.from("notifications").insert({
        user_id: hireTarget.talent_id,
        title:   "You have a new job offer! 🎉",
        message: `${profile?.full_name ?? "An organisation"} has sent you a formal offer for ${offerForm.role_title}.`,
        type:    "hire_offer",
      });

      // Advance shortlist stage to contacted
      await handleStageChange(hireTarget.id, "contacted");

      toast({
        title: "Offer sent ✓",
        description: `Formal offer delivered to ${hireTarget.talent_name?.split(" ")[0]}. Awaiting their response.`,
      });
      setHireTarget(null);
    } catch (err: any) {
      console.error(err);
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setSending(false);
    }
  };

  const filtered = activeStage === "all"
    ? candidates
    : candidates.filter(c => c.status === activeStage);

  const stageCounts = Object.fromEntries(
    PIPELINE_STAGES.map(s => [s.key, candidates.filter(c => c.status === s.key).length])
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto pb-20 flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading shortlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-3">
          <button onClick={() => navigate("/client/roles")}
            className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to roles
          </button>
          <div className="flex items-center gap-2 text-blue-600 text-[11px] font-bold uppercase tracking-widest">
            <ListChecks className="w-3.5 h-3.5" /> Shortlist
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold dark:text-white tracking-tight">
            {role?.title ?? "Role"} <span className="text-blue-600">candidates.</span>
          </h1>
          <p className="text-sm font-medium text-slate-400">
            {candidates.length} shortlisted · {stageCounts.hired ?? 0} hired · {stageCounts.interviewing ?? 0} interviewing
          </p>
        </div>
        <Link to={`/client/roles/${roleId}/source`}
          className="flex-shrink-0 flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all shadow-md shadow-blue-600/20">
          <Users className="w-3.5 h-3.5" /> Source more talent
        </Link>
      </div>

      {/* Stage tabs */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setActiveStage("all")}
          className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border ${activeStage === "all" ? "bg-[var(--card-bg)] text-blue-600 border-blue-500/30 shadow-sm" : "border-[var(--border-color)] text-slate-400 hover:bg-slate-500/5"}`}>
          All <span className="ml-1.5 text-[9px] opacity-60">{candidates.length}</span>
        </button>
        {PIPELINE_STAGES.map(s => (
          <button key={s.key} onClick={() => setActiveStage(s.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border ${activeStage === s.key ? `bg-[var(--card-bg)] ${s.text} border-current shadow-sm` : "border-[var(--border-color)] text-slate-400 hover:bg-slate-500/5"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.color}`} />
            {s.label}
            <span className="text-[9px] opacity-60">{stageCounts[s.key] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* Pipeline summary strip */}
      <div className="flex gap-0 rounded-2xl overflow-hidden border border-[var(--border-color)]">
        {PIPELINE_STAGES.map((s, i) => {
          const count = stageCounts[s.key] ?? 0;
          return (
            <div key={s.key}
              className={`flex-1 p-3 text-center cursor-pointer transition-all ${activeStage === s.key ? "bg-slate-500/10" : "hover:bg-slate-500/5"} ${i < PIPELINE_STAGES.length - 1 ? "border-r border-[var(--border-color)]" : ""}`}
              onClick={() => setActiveStage(s.key)}>
              <p className={`text-base font-black ${s.text}`}>{count}</p>
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <AnimatePresence mode="popLayout">
        {filtered.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {filtered.map(c => (
                <CandidateCard key={c.id} candidate={c}
                  onStageChange={handleStageChange}
                  onRemove={handleRemove}
                  onHire={setHireTarget}
                  onView={setViewTarget}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="py-24 text-center space-y-4 bg-slate-500/5 rounded-2xl border border-dashed border-[var(--border-color)]">
            <ListChecks className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-xl font-black tracking-tighter uppercase dark:text-white">
              {activeStage === "all" ? "No candidates yet" : `No ${activeStage} candidates`}
            </h3>
            <p className="text-sm text-slate-400 font-medium">
              {activeStage === "all" ? "Source talent to start building your shortlist" : "Move candidates here from other stages"}
            </p>
            {activeStage === "all" && (
              <Link to={`/client/roles/${roleId}/source`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all shadow-md shadow-blue-600/20">
                <Users className="w-3.5 h-3.5" /> Source talent
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hire offer modal */}
      <AnimatePresence>
        {hireTarget && (
          <HireOfferModal
            candidate={hireTarget}
            role={role}
            onClose={() => setHireTarget(null)}
            onConfirm={handleSendOffer}
            sending={sending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}