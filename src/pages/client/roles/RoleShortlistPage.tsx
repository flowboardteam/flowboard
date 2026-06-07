"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Zap, Loader2, Users, X, MapPin, BriefcaseBusiness,
  CheckCircle2, Trash2, MoreHorizontal, RefreshCw, ListChecks,
  Send, DollarSign, Calendar, Clock, FileText, UserCheck,
  ChevronDown, AlertCircle, ExternalLink, Mail,
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

// ─── Hire Offer Modal (Replicated from TalentPublicProfile) ───────────────────
function HireOfferModal({ candidate, role, activeGroup, onClose, onOfferSent }) {
  const { toast } = useToast();
  const [clientGroups, setClientGroups] = useState<any[]>([]);
  const [clientRoles, setClientRoles]   = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(activeGroup?.id || "");
  const [selectedRoleId, setSelectedRoleId]   = useState<string>(role?.id || "new");
  const [currentUser, setCurrentUser]         = useState<any>(null);
  const [sending, setSending]                 = useState(false);

  useEffect(() => {
    const fetchModalData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setCurrentUser(profile);

      const { data: ownedGroups } = await supabase.from("groups")
        .select("*").eq("organization_id", user.id).eq("status", "active");

      const { data: memberGroups } = await supabase.from("group_members")
        .select(`group:groups!group_id (*)`).eq("user_id", user.id);

      const allGroups: any[] = [];
      const groupIds = new Set<string>();

      if (ownedGroups) {
        ownedGroups.forEach((g: any) => {
          if (g.status === "active" && !groupIds.has(g.id)) {
            groupIds.add(g.id);
            allGroups.push(g);
          }
        });
      }

      if (memberGroups) {
        memberGroups.forEach((mg: any) => {
          const g = mg.group;
          if (g && g.status === "active" && !groupIds.has(g.id)) {
            groupIds.add(g.id);
            allGroups.push(g);
          }
        });
      }

      setClientGroups(allGroups);
      if (allGroups.length > 0 && !selectedGroupId) {
        setSelectedGroupId(allGroups[0].id);
      }

      const { data: rolesData } = await supabase.from("roles")
        .select("*").eq("status", "open");

      if (rolesData) {
        const userGroupIds = Array.from(groupIds);
        const filteredRoles = rolesData.filter(r => userGroupIds.includes(r.group_id) || r.organization_id === user.id);
        setClientRoles(filteredRoles);
      }
    };

    fetchModalData();
  }, [activeGroup?.id, role?.id]);

  const handleHireSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) return;

    const formData = new FormData(e.currentTarget);
    const message = formData.get("message") as string;

    let finalRoleId = selectedRoleId;
    let finalRoleTitle = "";
    let finalRoleType = "";
    let finalSalaryRaw = "";
    let groupId = selectedGroupId || activeGroup?.id || "default-group";
    let groupName = activeGroup?.name || "";

    try {
      setSending(true);

      if (selectedRoleId === "new") {
        const userGroup = clientGroups.find((g) => g.id === selectedGroupId);
        if (!userGroup && !activeGroup) {
          throw new Error("You must select an active organization group to create roles.");
        }
        const targetGroup = userGroup || activeGroup;
        groupId = targetGroup.id;
        groupName = targetGroup.name;

        finalRoleTitle = formData.get("newRoleTitle") as string;
        finalRoleType = formData.get("newRoleType") as string;
        finalSalaryRaw = formData.get("newRoleSalary") as string;

        const newRoleId = crypto.randomUUID();

        const { data: newRole, error: roleError } = await supabase
          .from("roles")
          .insert({
            id: newRoleId,
            organization_id: targetGroup.organization_id || currentUser.id,
            group_id: targetGroup.id,
            title: finalRoleTitle,
            type: finalRoleType,
            salary: finalSalaryRaw,
            status: "open",
            department: "",
            location: "Remote",
            location_details: "",
            experience_level: candidate.talent_level || "Mid-Level",
            description: "Role automatically created from shortlist offer.",
            responsibilities: [],
            skills: candidate.talent_skills || [],
            benefits: [],
            education: "",
            other_requirements: [],
            applicants_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (roleError) throw roleError;
        finalRoleId = newRole.id;
      } else {
        const existingRole = clientRoles.find((r) => r.id === selectedRoleId) || role;
        if (existingRole) {
          finalRoleTitle = existingRole.title;
          finalRoleType = existingRole.type;
          finalSalaryRaw = existingRole.salary;
          groupId = existingRole.group_id;

          const { data: gData } = await supabase.from("groups").select("name").eq("id", groupId).single();
          if (gData) groupName = gData.name;
        }
      }

      const numericSalary = finalSalaryRaw
        ? parseFloat(finalSalaryRaw.replace(/,/g, "").replace(/[^0-9.]/g, ""))
        : null;

      const offerId = crypto.randomUUID();

      let realTalentId = candidate.talent_id;
      if (!realTalentId || realTalentId.length < 30 || realTalentId.includes("|")) {
        const { data: pData } = await supabase.from("profiles").select("id").eq("full_name", candidate.talent_name).limit(1).single();
        if (pData?.id) {
          realTalentId = pData.id;
        } else {
          const { data: fallbackP } = await supabase.from("profiles").select("id").eq("role_type", "talent").limit(1).single();
          if (fallbackP?.id) realTalentId = fallbackP.id;
        }
      }

      const { error } = await supabase.from("hire_inquiries").insert({
        id: offerId,
        talent_id: realTalentId,
        client_id: currentUser.id,
        sender_name: groupName || currentUser.full_name,
        sender_email: currentUser.email,
        message: message + `\n\n[GROUP_ID:${groupId}]`,
        offer_message: message + `\n\n[GROUP_ID:${groupId}]`,
        role_id: finalRoleId !== "new" ? finalRoleId : null,
        role_title: finalRoleTitle,
        role_type: finalRoleType.toLowerCase().replace("-", "_"),
        salary_monthly: numericSalary && !isNaN(numericSalary) ? numericSalary : null,
        source: "role_shortlist",
        shortlist_id: null, // Omit to prevent FK violation against role_shortlist table
        status: "pending",
      });

      if (error) {
        console.error("Supabase hire_inquiries insert failed:", error);
        throw error;
      }

      await supabase.from("notifications").insert({
        user_id: candidate.talent_id,
        title: "New Job Offer! 🎉",
        message: `${groupName || currentUser.full_name} has sent you a formal offer for ${finalRoleTitle}.\n\n[OFFER_DATA:${JSON.stringify({
          id: offerId,
          role_title: finalRoleTitle,
          salary_monthly: numericSalary,
          sender_name: groupName || currentUser.full_name,
          status: "pending"
        })}]`,
        type: "hire_offer",
      });

      toast({
        title: "Offer Sent! 🚀",
        description: `We've delivered your offer to ${candidate.talent_name?.split(" ")[0]} regarding the ${finalRoleTitle} position.`,
      });

      onOfferSent(candidate.id, "contacted");
      onClose();
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Transmission Error",
        description: err.message || "We couldn't deliver your offer. Please try again.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-[40px] w-full max-w-lg p-10 lg:p-14 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-8 right-8 text-slate-300 hover:text-[#1A1C21] transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-[#1A1C21] uppercase tracking-tighter leading-none">
                Hire {candidate.talent_name?.split(" ")[0]}
              </h2>
              <p className="text-slate-500 font-bold">
                Signal formal interest for your project. Discussion starts instantly.
              </p>
            </div>

            <form onSubmit={handleHireSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Organization / Workplace
                  </label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => {
                      setSelectedGroupId(e.target.value);
                      setSelectedRoleId("new");
                    }}
                    className="w-full bg-slate-50 border border-[#EEEEF0] rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1C21] outline-none focus:border-emerald-500 transition-all cursor-pointer"
                  >
                    {clientGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Removed local storage checks for existing offers/workforce */}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Target Role Offer (in selected workplace)
                  </label>
                  <select
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(e.target.value)}
                    className="w-full bg-slate-50 border border-[#EEEEF0] rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1C21] outline-none focus:border-emerald-500 transition-all cursor-pointer"
                  >
                    <option value="new">+ Create New Role Offer</option>
                    {clientRoles
                      .filter((r) => r.group_id === selectedGroupId)
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.title} ({r.type})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {selectedRoleId === "new" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-slate-50/50 border border-[#EEEEF0] rounded-3xl">
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Role Title
                    </label>
                    <input
                      type="text"
                      name="newRoleTitle"
                      required
                      defaultValue={role?.title || ""}
                      placeholder="e.g. Senior Frontend Engineer"
                      className="w-full bg-white border border-[#EEEEF0] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Role Type
                    </label>
                    <select
                      name="newRoleType"
                      required
                      defaultValue={role?.type || "Full-time"}
                      className="w-full bg-white border border-[#EEEEF0] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Part-time">Part-time</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Monthly Salary
                    </label>
                    <input
                      type="text"
                      name="newRoleSalary"
                      required
                      defaultValue={role?.salary || candidate.talent_rate || ""}
                      placeholder="e.g. $5,000"
                      className="w-full bg-white border border-[#EEEEF0] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Offer & Mission Details
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  className="w-full bg-slate-50 border border-[#EEEEF0] rounded-3xl p-6 text-sm font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none"
                  placeholder={`Describe the position, team, expectations, and why you want ${candidate.talent_name?.split(" ")[0]}...`}
                />
              </div>

              <div className="p-6 bg-emerald-50 rounded-3xl flex items-start gap-4">
                <Mail className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
                <p className="text-xs font-bold text-emerald-700 leading-relaxed">
                  Your verified client identity will be shared with the talent to facilitate immediate communication.
                </p>
              </div>

                <button
                  disabled={sending}
                  type="submit"
                  className="w-full h-16 bg-[#1A1C21] hover:bg-black text-white rounded-[24px] font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] disabled:opacity-50"
                >
                  {sending ? "Transmitting..." : "Send Formal Offer"}
                </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── Candidate Card ───────────────────────────────────────────────────────────
function CandidateCard({ candidate, onStageChange, onRemove, onHire }) {
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string|null>(null);
  const stage  = stageConfig[candidate.status] ?? stageConfig.shortlisted;
  const sLabel = scoreLabel(candidate.overall_score ?? 0);

  const handleViewProfile = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("username").eq("id", candidate.talent_id).single();
      if (data?.username) {
        window.open(`/${data.username}`, "_blank");
      } else {
        window.open(`/@${candidate.talent_id}`, "_blank");
      }
    } catch (err) {
      window.open(`/@${candidate.talent_id}`, "_blank");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] flex flex-col gap-4 hover:border-blue-500/30 transition-all relative"
    >
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

      {candidate.talent_skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {candidate.talent_skills.slice(0, 4).map((s: string) => (
            <span key={s} className="text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-lg">{s}</span>
          ))}
          {candidate.talent_skills.length > 4 && (
            <span className="text-[9px] font-black text-slate-400">+{candidate.talent_skills.length - 4}</span>
          )}
        </div>
      )}

      <div className="h-1 w-full bg-slate-500/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all"
          style={{ width: `${candidate.overall_score ?? 0}%` }}
        />
      </div>

      <div className="flex gap-2 pt-2 border-t border-[var(--border-color)]">
        <button onClick={handleViewProfile}
          className="flex-1 py-2.5 bg-slate-500/10 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-500/20 transition-all">
          View Profile
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
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-50 transition-all shadow-md shadow-blue-600/20">
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

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const groupId = activeGroup?.id || "default-group";
      const localKey = `flowboard_roles_${groupId}`;
      const localRoles = localStorage.getItem(localKey);
      let localRole = null;
      if (localRoles) {
        const parsed = JSON.parse(localRoles);
        localRole = parsed.find((r: any) => r.id === roleId);
      }

      const [{ data: roleData }, { data: listData }] = await Promise.all([
        supabase.from("roles").select("*").eq("id", roleId).single(),
        supabase.from("role_shortlist").select("*")
          .eq("role_id", roleId)
          .eq("organization_id", user.id)
          .or(`group_id.eq.${groupId},group_id.is.null`) // Scoped to activeGroup with fallback
          .order("overall_score", { ascending: false })
      ]);

      if (roleData) {
        if (activeGroup && roleData.group_id && roleData.group_id !== activeGroup.id) {
          toast({ title: "Role Not in Active Workplace", description: `Redirecting to ${activeGroup.name} roles.` });
          navigate("/client/roles");
          return;
        }
        setRole(roleData);
      } else if (localRole) {
        if (activeGroup && localRole.group_id && localRole.group_id !== activeGroup.id) {
          toast({ title: "Role Not in Active Workplace", description: `Redirecting to ${activeGroup.name} roles.` });
          navigate("/client/roles");
          return;
        }
        setRole(localRole);
      }
      
      setCandidates(listData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [roleId, activeGroup?.id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleStageChange = async (id: string, newStatus: string) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    const { error } = await supabase.from("role_shortlist").update({ status: newStatus }).eq("id", id);
    if (error) { console.error(error); fetchAll(); }
  };

  const handleRemove = async (id: string) => {
    setCandidates(prev => prev.filter(c => c.id !== id));
    const { error } = await supabase.from("role_shortlist").delete().eq("id", id);
    if (error) { console.error(error); fetchAll(); }
    else toast({ title: "Removed from shortlist" });
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
    <div className="max-w-7xl mx-auto space-y-8 pb-20 p-4 sm:p-6 lg:p-10 animate-in fade-in duration-500">
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
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link to="/client/shortlist"
            className="flex items-center gap-2 px-5 py-3.5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-xs font-black tracking-widest text-slate-600 hover:border-blue-500/40 transition-all shadow-sm">
            Master Pipeline
          </Link>
          <Link to={`/client/roles/${roleId}/source`}
            className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all shadow-md shadow-blue-600/20">
            <Users className="w-3.5 h-3.5" /> Source more talent
          </Link>
        </div>
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
      <div className="flex gap-0 rounded-2xl overflow-hidden border border-[var(--border-color)] shadow-sm bg-[var(--card-bg)]">
        {PIPELINE_STAGES.map((s, i) => {
          const count = stageCounts[s.key] ?? 0;
          return (
            <div key={s.key}
              className={`flex-1 p-4 text-center cursor-pointer transition-all ${activeStage === s.key ? "bg-slate-500/10" : "hover:bg-slate-500/5"} ${i < PIPELINE_STAGES.length - 1 ? "border-r border-[var(--border-color)]" : ""}`}
              onClick={() => setActiveStage(s.key)}>
              <p className={`text-xl font-black ${s.text}`}>{count}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <AnimatePresence mode="popLayout">
        {filtered.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered.map(c => (
                <CandidateCard key={c.id} candidate={c}
                  onStageChange={handleStageChange}
                  onRemove={handleRemove}
                  onHire={setHireTarget}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="py-28 text-center space-y-4 bg-[var(--card-bg)] rounded-2xl border border-dashed border-[var(--border-color)] shadow-sm">
            <ListChecks className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-xl font-black tracking-tighter uppercase dark:text-white">
              {activeStage === "all" ? "No candidates yet" : `No ${activeStage} candidates`}
            </h3>
            <p className="text-sm text-slate-400 font-medium max-w-md mx-auto">
              {activeStage === "all" ? "Source talent to start building your shortlist for this role." : "Move candidates here from other stages."}
            </p>
            {activeStage === "all" && (
              <Link to={`/client/roles/${roleId}/source`}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all shadow-md shadow-blue-600/20">
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
            activeGroup={activeGroup}
            onClose={() => setHireTarget(null)}
            onOfferSent={handleStageChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
}