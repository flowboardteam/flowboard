"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Inbox, Loader2, CheckCircle2, XCircle, Clock,
  DollarSign, Calendar, Briefcase, Building2,
  X, Zap, AlertCircle, RefreshCw, FileText, Check, MapPin, Award
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface HireOffer {
  id: string;
  client_id: string;
  talent_id: string;
  sender_name: string;
  sender_email: string;
  role_id?: string | null;
  role_title: string | null;
  role_type: string | null;
  salary_monthly: number | null;
  salary_currency: string;
  start_date: string | null;
  contract_length: string | null;
  offer_message: string | null;
  message?: string | null;
  status: string;
  source: string;
  group_avatar?: string | null;
  created_at: string;
  responded_at: string | null;
  client_profile?: {
    full_name: string;
    avatar_url: string | null;
    company_name: string | null;
  } | null;
}

const STATUS_CONFIG: Record<string, {
  label: string; color: string; bg: string; icon: any;
}> = {
  pending:   { label: "Awaiting response", color: "text-amber-600",   bg: "bg-amber-500/10 border-amber-500/20",     icon: Clock        },
  viewed:    { label: "Viewed",            color: "text-blue-600",    bg: "bg-blue-500/10 border-blue-500/20",       icon: Clock        },
  accepted:  { label: "Accepted",          color: "text-emerald-600", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  declined:  { label: "Declined",          color: "text-red-500",     bg: "bg-red-500/10 border-red-500/20",         icon: XCircle      },
  withdrawn: { label: "Withdrawn",         color: "text-slate-500",   bg: "bg-slate-500/10 border-slate-500/20",     icon: XCircle      },
};

const TABS = ["all", "pending", "accepted", "declined"] as const;

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function fmtCurrency(amount: number | null, currency = "USD") {
  if (!amount) return "Not specified";
  return (
    new Intl.NumberFormat("en-US", {
      style: "currency", currency, maximumFractionDigits: 0,
    }).format(amount) + "/mo"
  );
}

function fmtRoleType(rt: string | null) {
  if (!rt) return null;
  return rt.replace("_", "-");
}

function cleanMessage(msg: string | null) {
  if (!msg) return "No message provided.";
  return msg.replace(/\[GROUP_ID:[^\]]+\]/g, '').replace(/\[GROUP_AVATAR:[^\]]+\]/g, '').trim();
}

function getOrgDisplayName(offer: HireOffer) {
  const comp = offer.client_profile?.company_name?.trim();
  const clientName = offer.client_profile?.full_name?.trim();
  const sender = offer.sender_name?.trim();

  // If sender is "My Workplace" or generic, pair it with the client's actual company name or full name
  if (sender && sender.toLowerCase() === "my workplace") {
    if (comp) return `${comp} (${sender})`;
    if (clientName) return `${clientName} (${sender})`;
    return "Client Organization (My Workplace)";
  }

  if (comp && sender && comp !== sender) {
    return `${comp} — ${sender}`;
  }

  if (comp) return comp;
  if (sender) return sender;
  if (clientName) return `${clientName}'s Organization`;
  return "Client Organization";
}

// ─── Offer Card ───────────────────────────────────────────────────────────────
function OfferCard({ offer, onRespond, onView }: {
  offer: HireOffer;
  onRespond: (offer: HireOffer, action: "accepted" | "declined") => void;
  onView: (offer: HireOffer) => void;
}) {
  const cfg       = STATUS_CONFIG[offer.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const isPending  = ["pending", "viewed"].includes(offer.status);
  const orgName    = getOrgDisplayName(offer);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="p-4 sm:p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] flex flex-col gap-3 hover:border-blue-500/30 transition-all shadow-sm hover:shadow-md"
    >
      {/* Top row: status + date */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${cfg.bg} ${cfg.color}`}>
          <StatusIcon className="w-3 h-3 shrink-0" />
          {cfg.label}
        </span>
        <span className="text-[10px] font-bold text-slate-400 shrink-0">{fmtDate(offer.created_at)}</span>
      </div>

      {/* Org + role */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-slate-500/10 border border-[var(--border-color)] flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
          {offer.group_avatar
            ? <img src={offer.group_avatar} alt={orgName} className="w-full h-full object-cover" />
            : (offer as any).is_group_offer
              ? <Building2 className="w-5 h-5 text-slate-400" />
              : offer.client_profile?.avatar_url
                ? <img src={offer.client_profile.avatar_url} alt={orgName} className="w-full h-full object-cover" />
                : <Building2 className="w-5 h-5 text-slate-400" />
          }
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black dark:text-white truncate">{orgName}</p>
          <p className="text-xs font-black text-blue-600 uppercase tracking-widest truncate mt-0.5">
            {offer.role_title ?? "Role not specified"}
          </p>
        </div>
      </div>

      {/* Key details — compact grid */}
      <div className="grid grid-cols-2 gap-2 bg-slate-500/5 p-3 rounded-xl border border-[var(--border-color)]">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
          <DollarSign className="w-3 h-3 shrink-0 text-emerald-500" />
          <span className="truncate">{fmtCurrency(offer.salary_monthly, offer.salary_currency)}</span>
        </div>
        {offer.role_type && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
            <Briefcase className="w-3 h-3 shrink-0 text-blue-500" />
            <span className="truncate capitalize">{fmtRoleType(offer.role_type)}</span>
          </div>
        )}
        {offer.start_date && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 col-span-2 border-t border-[var(--border-color)] pt-1.5 mt-0.5">
            <Calendar className="w-3 h-3 shrink-0 text-amber-500" />
            <span>Starts {fmtDate(offer.start_date)}</span>
          </div>
        )}
      </div>

      {/* Message preview */}
      {offer.offer_message && (
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 italic">
          "{cleanMessage(offer.offer_message)}"
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-[var(--border-color)]">
        <button
          onClick={() => onView(offer)}
          className="flex-1 py-2.5 bg-slate-500/10 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-500/20 transition-all"
        >
          Read offer
        </button>

        {isPending && (
          <>
            <button
              onClick={() => onRespond(offer, "accepted")}
              className="flex items-center justify-center gap-1 px-4 py-2.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 shrink-0"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Accept</span>
            </button>
            <button
              onClick={() => onRespond(offer, "declined")}
              className="flex items-center justify-center gap-1 px-3 py-2.5 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20 shrink-0"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Decline</span>
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─── Offer Detail Modal ───────────────────────────────────────────────────────
function OfferDetailModal({ offer, onClose, onRespond, responding }: {
  offer: HireOffer;
  onClose: () => void;
  onRespond: (offer: HireOffer, action: "accepted" | "declined", reason?: string) => void;
  responding: boolean;
}) {
  const [declineReason, setDeclineReason]     = useState("");
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const cfg       = STATUS_CONFIG[offer.status] ?? STATUS_CONFIG.pending;
  const isPending = ["pending", "viewed"].includes(offer.status);
  const orgName   = getOrgDisplayName(offer);

  const [roleDetails, setRoleDetails] = useState<any>(null);
  const [loadingRole, setLoadingRole] = useState(false);

  useEffect(() => {
    if (offer.role_id) {
      setLoadingRole(true);
      supabase.from("roles").select("*").eq("id", offer.role_id).single()
        .then(({ data }) => {
          if (data) setRoleDetails(data);
          setLoadingRole(false);
        });
    }
  }, [offer.role_id]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          onClick={e => e.stopPropagation()}
          className="w-full sm:max-w-xl max-h-[90vh] flex flex-col bg-[var(--card-bg)] border border-[var(--border-color)] rounded-t-[2rem] sm:rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Drag handle (mobile only) */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
            <div className="w-10 h-1 rounded-full bg-slate-500/30" />
          </div>

          {/* Header */}
          <div className="px-6 pt-4 pb-4 border-b border-[var(--border-color)] shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border mb-2 ${cfg.bg} ${cfg.color}`}>
                  <cfg.icon className="w-3 h-3" />{cfg.label}
                </span>
                <h2 className="text-xl font-black dark:text-white tracking-tight leading-tight flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-500 shrink-0" />
                  {offer.role_title ?? "Role not specified"}
                </h2>
                <div className="flex items-center gap-2 mt-1.5">
                  {(offer.group_avatar || (!(offer as any).is_group_offer && offer.client_profile?.avatar_url)) && (
                    <img 
                      src={offer.group_avatar || offer.client_profile?.avatar_url || ""} 
                      className="w-5 h-5 rounded-lg object-cover border border-[var(--border-color)] shadow-sm" 
                      alt="Logo" 
                    />
                  )}
                  {((offer as any).is_group_offer && !offer.group_avatar) && (
                    <Building2 className="w-5 h-5 text-slate-400" />
                  )}
                  <p className="text-xs font-bold text-slate-400">Offer from <strong className="text-[var(--text-main)] dark:text-white">{orgName}</strong></p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-500/10 text-slate-400 transition-colors flex-shrink-0 mt-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Key details grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
              {[
                { label: "Type",       value: fmtRoleType(offer.role_type) ?? "—" },
                { label: "Salary",     value: fmtCurrency(offer.salary_monthly, offer.salary_currency) },
                { label: "Start date", value: fmtDate(offer.start_date) },
                { label: "Duration",   value: offer.contract_length ?? (offer.role_type === "full_time" ? "Permanent" : "—") },
              ].map(m => (
                <div key={m.label} className="bg-slate-500/5 rounded-xl p-3 border border-[var(--border-color)]">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{m.label}</p>
                  <p className="text-xs font-black dark:text-white capitalize truncate">{m.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scrollable Body: Offer Letter + Attached Role Details */}
          <div className="px-6 py-6 overflow-y-auto space-y-6 flex-1">
            {/* Offer letter */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-500" /> Offer Letter / Client Message
              </p>
              <div className="p-4 bg-slate-500/5 rounded-2xl border border-[var(--border-color)]">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {cleanMessage(offer.offer_message || offer.message)}
                </p>
              </div>
            </div>

            {/* Attached Role Specification */}
            {loadingRole ? (
              <div className="flex items-center gap-3 py-4 text-slate-400 text-xs font-bold">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> Loading attached role specification...
              </div>
            ) : roleDetails ? (
              <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-blue-500" /> Attached Role Specification
                </p>
                
                <div className="space-y-3 bg-[var(--sidebar-bg)] p-5 rounded-2xl border border-[var(--border-color)]">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-400">
                    {roleDetails.department && <span>Department: {roleDetails.department}</span>}
                    {roleDetails.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-500" /> {roleDetails.location}</span>}
                    {roleDetails.experience_level && <span>Level: {roleDetails.experience_level}</span>}
                  </div>

                  {roleDetails.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {roleDetails.description}
                    </p>
                  )}

                  {roleDetails.responsibilities?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Key Responsibilities</p>
                      <ul className="space-y-1.5">
                        {roleDetails.responsibilities.map((req: string, idx: number) => (
                          <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {roleDetails.skills?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Required Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {roleDetails.skills.map((skill: string) => (
                          <span key={skill} className="px-2.5 py-1 bg-blue-500/10 rounded-lg text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {roleDetails.benefits?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Benefits & Perks</p>
                      <div className="flex flex-wrap gap-1.5">
                        {roleDetails.benefits.map((b: string, idx: number) => (
                          <span key={idx} className="px-2.5 py-1 bg-emerald-500/10 rounded-lg text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-500" /> {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Decline reason form */}
            {showDeclineForm && (
              <div className="pt-4 border-t border-[var(--border-color)]">
                <label className="block text-[10px] font-black uppercase tracking-widest text-red-500 mb-2">
                  Decline Reason (optional)
                </label>
                <textarea
                  value={declineReason}
                  onChange={e => setDeclineReason(e.target.value)}
                  rows={3}
                  placeholder="Let them know why you're declining..."
                  className="w-full bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-sm font-medium outline-none focus:ring-2 ring-red-500/20 transition-all resize-none"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 pt-4 border-t border-[var(--border-color)] shrink-0">
            {isPending ? (
              showDeclineForm ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeclineForm(false)}
                    className="flex-1 py-3.5 border border-[var(--border-color)] text-xs font-black uppercase tracking-widest text-slate-500 rounded-xl hover:bg-slate-500/5 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => onRespond(offer, "declined", declineReason)}
                    disabled={responding}
                    className="flex-1 py-3.5 bg-red-500 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 disabled:opacity-40"
                  >
                    {responding
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <XCircle className="w-4 h-4" />
                    }
                    Confirm decline
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeclineForm(true)}
                    className="flex-1 py-3.5 border border-red-500/20 bg-red-500/10 text-red-500 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-500/20 transition-all"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => onRespond(offer, "accepted")}
                    disabled={responding}
                    className="flex-1 py-3.5 bg-emerald-500 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-40"
                  >
                    {responding
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <CheckCircle2 className="w-4 h-4" />
                    }
                    Accept offer
                  </button>
                </div>
              )
            ) : (
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-[#1A1C21] hover:bg-black text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-black/10"
              >
                Close Offer Details
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TalentOffersPage() {
  const { toast } = useToast();

  const [offers, setOffers]         = useState<HireOffer[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [activeTab, setActiveTab]   = useState<string>("all");
  const [viewOffer, setViewOffer]   = useState<HireOffer | null>(null);
  const [responding, setResponding] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchOffers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error: dbErr } = await supabase
        .from("hire_inquiries")
        .select(`
          *,
          client_profile:profiles!hire_inquiries_client_id_fkey(full_name, avatar_url, company_name)
        `)
        .eq("talent_id", user.id)
        .order("created_at", { ascending: false });

      const combined = (data ?? []).map(o => {
        const msg = o.offer_message || o.message || "";
        const avatarMatch = msg.match(/\[GROUP_AVATAR:(.*?)\]/);
        const hasGroupId = msg.includes("[GROUP_ID:");
        
        let groupAvatar = o.group_avatar;
        if (avatarMatch && avatarMatch[1]) {
          groupAvatar = avatarMatch[1];
        }

        return { 
          ...o, 
          group_avatar: groupAvatar,
          is_group_offer: hasGroupId
        };
      });

      // Deduplicate by id OR by combination of (role_title + talent_id)
      const unique = combined.filter((v, i, a) => 
        a.findIndex(t => 
          t.id === v.id || 
          (
            (t.role_title || "Untitled") === (v.role_title || "Untitled") && 
            t.talent_id === v.talent_id && 
            (t.client_id === v.client_id || !t.client_id || !v.client_id) &&
            t.created_at?.split('T')[0] === v.created_at?.split('T')[0]
          )
        ) === i
      );
      unique.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setOffers(unique as HireOffer[]);

      // Auto-mark pending → viewed
      const pendingIds = unique
        .filter(o => o.status === "pending" && o.id.length > 20) // Only attempt for UUIDs
        .map(o => o.id);
      if (pendingIds.length > 0) {
        await supabase
          .from("hire_inquiries")
          .update({ status: "viewed" })
          .in("id", pendingIds);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOffers(); }, [fetchOffers]);

  // ── Respond ───────────────────────────────────────────────────────────────
  const handleRespond = async (
    offer: HireOffer,
    response: "accepted" | "declined",
    reason = ""
  ) => {
    setResponding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      const { error } = await supabase
        .from("hire_inquiries")
        .update({
          status:         response,
          decline_reason: response === "declined" ? reason : null,
        })
        .eq("id", offer.id);
      
      if (error && !error.message.includes("invalid input syntax for type uuid")) {
        console.warn("DB Update failed:", error);
      }

      // ── ADD TO WORKFORCE ──
      if (response === "accepted") {
        const { data: talProfile } = await supabase.from("profiles").select("full_name, avatar_url, location").eq("id", user.id).single();

        const newMember = {
          member_type: offer.role_type === "full_time" ? "hired_full_time" : "hired_contract",
          start_date: offer.start_date || new Date().toISOString().split("T")[0],
        };
        
        // Extract group ID from the offer message
        let groupId = null;
        const msgText = offer.offer_message || offer.message || "";
        if (msgText) {
          const match = msgText.match(/\[GROUP_ID:([^\]]+)\]/);
          if (match) {
            groupId = match[1];
          }
        }

        // Fallback: Fetch group_id from roles if it is still null
        if (!groupId && offer.role_id) {
          try {
            const { data: roleData } = await supabase
              .from("roles")
              .select("group_id")
              .eq("id", offer.role_id)
              .single();
            if (roleData?.group_id) {
              groupId = roleData.group_id;
            }
          } catch (e) {
            console.error("Failed to fetch group_id from role fallback:", e);
          }
        }

        // organization_id in workforce_members FK → auth.users(id) = offer.client_id
        const { error: wfErr } = await supabase.from("workforce_members").insert({
          organization_id: offer.client_id,  // FK to auth.users(id)
          group_id:        groupId,          // Links to the specific active group
          source_role_id:  offer.role_id || null,
          profile_id:      user.id,
          full_name:       talProfile?.full_name || user.email || "New Hire",
          avatar_url:      talProfile?.avatar_url || null,
          email:           user.email,
          role_title:      offer.role_title,
          location:        talProfile?.location || null,
          member_type:     newMember.member_type,
          payment_monthly: offer.salary_monthly || null,
          payment_currency:offer.salary_currency || "USD",
          start_date:      newMember.start_date,
          is_active:       true,
          online_status:   "online",
          availability_status: "available"
        });
        if (wfErr) {
          console.error("DB workforce_members insert failed:", wfErr.message, wfErr.details, wfErr.hint);
        } else {
          console.log("✅ workforce_members row created in DB for org:", offer.client_id);
        }

        // ── AUTO-INCREMENT ROLE APPLICANTS / HIRES COUNT ──
        if (offer.role_id) {
          try {
            const { data: curRole } = await supabase.from("roles").select("applicants_count").eq("id", offer.role_id).single();
            if (curRole) {
              await supabase.from("roles").update({ applicants_count: (curRole.applicants_count || 0) + 1 }).eq("id", offer.role_id);
            }
          } catch(e) {}
        }
      }

      setOffers(prev =>
        prev.map(o => o.id === offer.id ? { ...o, status: response } : o)
      );
      setViewOffer(null);

      toast(
        response === "accepted"
          ? { title: "Offer accepted! 🎉", description: "You've been added to their workforce." }
          : { title: "Offer declined",     description: "The organisation has been notified."  }
      );
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setResponding(false);
    }
  };

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = offers.filter(o => {
    if (activeTab === "all")     return true;
    if (activeTab === "pending") return ["pending", "viewed"].includes(o.status);
    return o.status === activeTab;
  });

  const counts = {
    all:      offers.length,
    pending:  offers.filter(o => ["pending", "viewed"].includes(o.status)).length,
    accepted: offers.filter(o => o.status === "accepted").length,
    declined: offers.filter(o => o.status === "declined").length,
  };

  // ── States ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Loading offers...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-sm font-bold text-red-500">{error}</p>
        <button
          onClick={fetchOffers}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-20 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">

      {/* ── Header ── */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-blue-600 text-[11px] font-bold uppercase tracking-widest">
          <Inbox className="w-3.5 h-3.5" /> Offers
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold dark:text-white tracking-tight">
          Your <span className="text-blue-600">offers.</span>
        </h1>
        <p className="text-sm font-medium text-slate-400">
          {counts.pending > 0
            ? <span className="text-amber-600 font-black">{counts.pending} pending — review and respond</span>
            : `${counts.all} total · ${counts.accepted} accepted`
          }
        </p>
      </div>

      {/* ── Pending alert banner ── */}
      {counts.pending > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 shadow-sm"
        >
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-amber-600 uppercase tracking-widest">
              {counts.pending} offer{counts.pending > 1 ? "s" : ""} awaiting your response
            </p>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">
              Tap a card to read the full offer, then accept or decline.
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Tabs — scrollable row on mobile ── */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab
                ? "bg-[var(--card-bg)] text-blue-600 shadow-sm border border-blue-500/20"
                : "text-slate-400 hover:text-slate-600 border border-transparent"
            }`}
          >
            {tab}
            <span className="ml-1.5 text-[9px] opacity-60">{counts[tab]}</span>
          </button>
        ))}
      </div>

      {/* ── Grid ── */}
      <AnimatePresence mode="popLayout">
        {filtered.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            <AnimatePresence>
              {filtered.map(offer => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onRespond={handleRespond}
                  onView={o => setViewOffer(o)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="py-24 text-center space-y-4 bg-slate-500/5 rounded-2xl border border-dashed border-[var(--border-color)]"
          >
            <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-black tracking-tighter uppercase dark:text-white">
              {activeTab === "all" ? "No offers yet" : `No ${activeTab} offers`}
            </h3>
            <p className="text-sm text-slate-400 font-medium">
              {activeTab === "all"
                ? "Organisations will send you offers once they find your profile"
                : "Nothing here yet"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Offer detail modal ── */}
      <AnimatePresence>
        {viewOffer && (
          <OfferDetailModal
            offer={viewOffer}
            onClose={() => setViewOffer(null)}
            onRespond={handleRespond}
            responding={responding}
          />
        )}
      </AnimatePresence>
    </div>
  );
}