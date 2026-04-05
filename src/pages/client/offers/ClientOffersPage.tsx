"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Loader2, CheckCircle2, XCircle, Clock,
  DollarSign, Calendar, Briefcase, Users, X,
  RefreshCw, AlertCircle, Search, SlidersHorizontal,
  ChevronDown, Trash2, Building2, ArrowUpRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SentOffer {
  id: string;
  talent_id: string;
  sender_name: string;
  sender_email: string;
  role_title: string | null;
  role_type: string | null;
  salary_monthly: number | null;
  salary_currency: string;
  start_date: string | null;
  contract_length: string | null;
  offer_message: string | null;
  status: string;
  source: string;
  created_at: string;
  responded_at: string | null;
  decline_reason: string | null;
  talent_profile?: {
    full_name: string;
    avatar_url: string | null;
    primary_role: string | null;
    location: string | null;
  } | null;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, {
  label: string; color: string; bg: string; dot: string; icon: any;
}> = {
  pending:   { label: "Pending",   color: "text-amber-600",   bg: "bg-amber-500/10 border-amber-500/20",     dot: "bg-amber-500",   icon: Clock        },
  viewed:    { label: "Viewed",    color: "text-blue-600",    bg: "bg-blue-500/10 border-blue-500/20",       dot: "bg-blue-500",    icon: Clock        },
  accepted:  { label: "Accepted",  color: "text-emerald-600", bg: "bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-500", icon: CheckCircle2 },
  declined:  { label: "Declined",  color: "text-red-500",     bg: "bg-red-500/10 border-red-500/20",         dot: "bg-red-400",     icon: XCircle      },
  withdrawn: { label: "Withdrawn", color: "text-slate-500",   bg: "bg-slate-500/10 border-slate-500/20",     dot: "bg-slate-400",   icon: XCircle      },
  expired:   { label: "Expired",   color: "text-slate-500",   bg: "bg-slate-500/10 border-slate-500/20",     dot: "bg-slate-400",   icon: Clock        },
};


// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({title,message,confirmLabel="Confirm",onConfirm,onCancel,danger=true}:{
  title:string;message:string;confirmLabel?:string;onConfirm:()=>void;onCancel:()=>void;danger?:boolean;
}){
  return (
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onCancel}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <motion.div initial={{opacity:0,scale:0.95,y:16}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:16}}
          onClick={e=>e.stopPropagation()}
          className="w-full max-w-sm bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2rem] p-6 shadow-2xl">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 ${danger?"bg-red-500/10":"bg-amber-500/10"}`}>
            <AlertCircle className={`w-5 h-5 ${danger?"text-red-500":"text-amber-500"}`}/>
          </div>
          <h3 className="text-base font-black dark:text-white tracking-tight mb-2">{title}</h3>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{message}</p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-3 border border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-xl hover:bg-slate-500/5 transition-all">Cancel</button>
            <button onClick={onConfirm} className={`flex-1 py-3 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${danger?"bg-red-500 hover:bg-red-400 shadow-md shadow-red-500/20":"bg-amber-500 hover:bg-amber-400"}`}>
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const SOURCE_LABEL: Record<string, string> = {
  talent_pool:    "Talent Pool",
  role_shortlist: "Role Shortlist",
  direct:         "Direct",
};

const TABS = ["all", "pending", "viewed", "accepted", "declined"] as const;

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function fmtCurrency(amount: number | null, currency = "USD") {
  if (!amount) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency, maximumFractionDigits: 0,
  }).format(amount) + "/mo";
}

function getInitials(name: string) {
  return name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) ?? "??";
}

// ─── Offer Card ───────────────────────────────────────────────────────────────
function OfferCard({ offer, onView, onWithdraw, onConfirmWithdraw }: {
  offer: SentOffer;
  onView: (o: SentOffer) => void;
  onWithdraw: (id: string) => void;
  onConfirmWithdraw: (id: string) => void;
}) {
  const cfg        = STATUS_CONFIG[offer.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const talent     = offer.talent_profile;
  const canWithdraw = ["pending", "viewed"].includes(offer.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="p-4 sm:p-5 rounded-[1.5rem] bg-[var(--card-bg)] border border-[var(--border-color)] flex flex-col gap-3 hover:border-blue-500/30 transition-all"
    >
      {/* Status + source + date */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-500/10 px-2 py-0.5 rounded-full">
            {SOURCE_LABEL[offer.source] ?? offer.source}
          </span>
          <span className="text-[10px] font-bold text-slate-400">{fmtDate(offer.created_at)}</span>
        </div>
      </div>

      {/* Talent info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-500/10 border border-[var(--border-color)] flex items-center justify-center overflow-hidden shrink-0">
          {talent?.avatar_url
            ? <img src={talent.avatar_url} alt={talent.full_name} className="w-full h-full object-cover" />
            : <span className="text-sm font-black text-slate-400">{getInitials(talent?.full_name ?? "?")}</span>
          }
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black dark:text-white truncate">{talent?.full_name ?? offer.sender_name}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate mt-0.5">
            {talent?.primary_role ?? "Talent"}
          </p>
        </div>
        {/* Accepted badge — links to workforce */}
        {offer.status === "accepted" && (
          <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20 shrink-0">
            <CheckCircle2 className="w-3 h-3" /> In workforce
          </span>
        )}
      </div>

      {/* Role + offer details */}
      <div className="p-3 rounded-xl bg-slate-500/5 border border-[var(--border-color)]">
        <p className="text-xs font-black dark:text-white mb-2 truncate">
          {offer.role_title ?? "Role not specified"}
        </p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
            <DollarSign className="w-3 h-3 shrink-0 text-emerald-500" />
            <span className="truncate">{fmtCurrency(offer.salary_monthly, offer.salary_currency)}</span>
          </div>
          {offer.role_type && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
              <Briefcase className="w-3 h-3 shrink-0 text-blue-500" />
              <span className="truncate capitalize">{offer.role_type.replace("_", "-")}</span>
            </div>
          )}
          {offer.start_date && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 col-span-2">
              <Calendar className="w-3 h-3 shrink-0 text-amber-500" />
              <span>Starts {fmtDate(offer.start_date)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Decline reason */}
      {offer.status === "declined" && offer.decline_reason && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
            <span className="font-black text-red-500">Reason: </span>
            {offer.decline_reason}
          </p>
        </div>
      )}

      {/* Response timestamp */}
      {offer.responded_at && ["accepted", "declined"].includes(offer.status) && (
        <p className="text-[10px] font-bold text-slate-400">
          Responded {fmtDate(offer.responded_at)}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-[var(--border-color)]">
        <button
          onClick={() => onView(offer)}
          className="flex-1 py-2.5 bg-slate-500/10 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-500/20 transition-all"
        >
          View offer
        </button>
        {canWithdraw && (
          <button
            onClick={() => onConfirmWithdraw(offer.id)}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500/20 transition-all border border-red-500/10 shrink-0"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">Withdraw</span>
          </button>
        )}
        {offer.status === "accepted" && (
          <button
            onClick={() => navigate("/client/workforce")}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500/20 transition-all border border-emerald-500/10 shrink-0"
          >
            <ArrowUpRight className="w-3 h-3" />
            <span className="hidden sm:inline">Workforce</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Offer Detail Modal ───────────────────────────────────────────────────────
function OfferDetailModal({ offer, onClose }: {
  offer: SentOffer;
  onClose: () => void;
}) {
  const cfg    = STATUS_CONFIG[offer.status] ?? STATUS_CONFIG.pending;
  const talent = offer.talent_profile;

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
          className="w-full sm:max-w-lg bg-[var(--card-bg)] border border-[var(--border-color)] rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden"
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-slate-500/30" />
          </div>

          {/* Header */}
          <div className="px-6 pt-4 pb-4 border-b border-[var(--border-color)]">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-500/10 border border-[var(--border-color)] flex items-center justify-center overflow-hidden shrink-0">
                  {talent?.avatar_url
                    ? <img src={talent.avatar_url} alt={talent.full_name} className="w-full h-full object-cover" />
                    : <span className="text-sm font-black text-slate-400">{getInitials(talent?.full_name ?? "?")}</span>
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black dark:text-white truncate">{talent?.full_name ?? "Talent"}</p>
                  <p className="text-[10px] font-bold text-slate-400 truncate">{talent?.primary_role ?? "—"}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-500/10 text-slate-400 transition-colors flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border mb-3 ${cfg.bg} ${cfg.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
            </span>

            <p className="text-base font-black dark:text-white">{offer.role_title ?? "Role not specified"}</p>

            <div className="grid grid-cols-2 gap-2 mt-3">
              {[
                { label: "Type",     value: offer.role_type?.replace("_","-") ?? "—" },
                { label: "Salary",   value: fmtCurrency(offer.salary_monthly, offer.salary_currency) },
                { label: "Starts",   value: fmtDate(offer.start_date) },
                { label: "Duration", value: offer.contract_length ?? (offer.role_type === "full_time" ? "Permanent" : "—") },
              ].map(m => (
                <div key={m.label} className="bg-slate-500/5 rounded-xl p-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{m.label}</p>
                  <p className="text-xs font-black dark:text-white capitalize truncate">{m.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Offer letter */}
          <div className="px-6 py-4 max-h-48 overflow-y-auto">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Offer letter</p>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {offer.offer_message ?? "No message provided."}
            </p>
          </div>

          {/* Decline reason */}
          {offer.status === "declined" && offer.decline_reason && (
            <div className="px-6 pb-4">
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Decline reason</p>
                  <p className="text-xs font-medium text-slate-500">{offer.decline_reason}</p>
                </div>
              </div>
            </div>
          )}

          <div className="px-6 pb-6">
            <button onClick={onClose}
              className="w-full py-3 border border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-xl hover:bg-slate-500/5 transition-all">
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ClientOffersPage() {
  const navigate  = useNavigate();
  const { toast } = useToast();

  const [offers, setOffers]         = useState<SentOffer[]>([]);
  const [confirmWithdrawId, setConfirmWithdrawId] = useState<string|null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [activeTab, setActiveTab]   = useState<string>("all");
  const [search, setSearch]         = useState("");
  const [viewOffer, setViewOffer]   = useState<SentOffer | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);

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
          talent_profile:profiles!hire_inquiries_talent_id_fkey(
            full_name, avatar_url, primary_role, location
          )
        `)
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (dbErr) throw dbErr;
      setOffers((data ?? []) as SentOffer[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOffers(); }, [fetchOffers]);

  // Realtime — update when talent responds
  useEffect(() => {
    const channel = supabase
      .channel("client-offers-realtime")
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "hire_inquiries",
      }, () => fetchOffers())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchOffers]);

  // ── Withdraw offer ────────────────────────────────────────────────────────
  const handleWithdraw = async (id: string) => {
    setWithdrawing(true);
    // Optimistic
    setOffers(prev => prev.map(o => o.id === id ? { ...o, status: "withdrawn" } : o));
    const { error } = await supabase
      .from("hire_inquiries")
      .update({ status: "withdrawn" })
      .eq("id", id);
    if (error) {
      console.error(error);
      fetchOffers();
      toast({ variant: "destructive", title: "Could not withdraw offer" });
    } else {
      toast({ title: "Offer withdrawn" });
    }
    setWithdrawing(false);
  };

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = offers.filter(o => {
    if (activeTab === "pending" && !["pending", "viewed"].includes(o.status)) return false;
    if (!["all", "pending"].includes(activeTab) && o.status !== activeTab) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = (o.talent_profile?.full_name ?? "").toLowerCase();
      const role = (o.role_title ?? "").toLowerCase();
      if (!name.includes(q) && !role.includes(q)) return false;
    }
    return true;
  });

  const counts = {
    all:      offers.length,
    pending:  offers.filter(o => ["pending","viewed"].includes(o.status)).length,
    viewed:   offers.filter(o => o.status === "viewed").length,
    accepted: offers.filter(o => o.status === "accepted").length,
    declined: offers.filter(o => o.status === "declined").length,
  };

  // ── Loading / error ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading offers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-sm font-bold text-red-500">{error}</p>
        <button onClick={fetchOffers}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all">
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-20 p-4 sm:p-6 lg:p-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 text-[11px] font-bold uppercase tracking-widest">
            <Send className="w-3.5 h-3.5" /> Hire Offers Sent
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold dark:text-white tracking-tight">
            Sent <span className="text-blue-600">offers.</span>
          </h1>
          <p className="text-sm font-medium text-slate-400">
            {counts.pending > 0
              ? <span className="text-amber-600 font-black">{counts.pending} awaiting response · </span>
              : null
            }
            {counts.accepted} accepted · {counts.declined} declined
          </p>
        </div>
        <button
          onClick={() => navigate("/client/talent-pool")}
          className="flex-shrink-0 flex items-center gap-2 px-5 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all shadow-md shadow-blue-600/20"
        >
          <Users className="w-3.5 h-3.5" /> Find more talent
        </button>
      </div>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total sent",   value: counts.all,      color: "text-slate-600 dark:text-white"  },
          { label: "Pending",      value: counts.pending,  color: "text-amber-600"                  },
          { label: "Accepted",     value: counts.accepted, color: "text-emerald-600"                },
          { label: "Declined",     value: counts.declined, color: "text-red-500"                    },
        ].map(s => (
          <div key={s.label} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by talent name or role..."
          className="w-full pl-10 pr-4 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all"
        />
      </div>

      {/* ── Tabs — horizontal scroll on mobile ── */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border ${
              activeTab === tab
                ? "bg-[var(--card-bg)] text-blue-600 border-blue-500/20 shadow-sm"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab}
            <span className="ml-1.5 text-[9px] opacity-60">{counts[tab as keyof typeof counts] ?? offers.length}</span>
          </button>
        ))}
      </div>

      {/* ── Grid ── */}
      <AnimatePresence mode="popLayout">
        {filtered.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map(offer => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onView={setViewOffer}
                  onWithdraw={handleWithdraw}
                  onConfirmWithdraw={setConfirmWithdrawId}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="py-24 text-center space-y-4 bg-slate-500/5 rounded-[2rem] border border-dashed border-[var(--border-color)]">
            <Send className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-black tracking-tighter uppercase dark:text-white">
              {search ? "No offers match your search" : activeTab === "all" ? "No offers sent yet" : `No ${activeTab} offers`}
            </h3>
            <p className="text-sm text-slate-400 font-medium">
              {!search && activeTab === "all" && "Send your first offer from the Talent Pool or Role Shortlist"}
            </p>
            {!search && activeTab === "all" && (
              <button onClick={() => navigate("/client/talent-pool")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all shadow-md shadow-blue-600/20">
                <Users className="w-3.5 h-3.5" /> Go to talent pool
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Withdraw confirm ── */}
      <AnimatePresence>
        {confirmWithdrawId && (
          <ConfirmDialog
            title="Withdraw this offer?"
            message="The talent will be notified that the offer has been withdrawn. This cannot be undone."
            confirmLabel="Withdraw"
            danger={false}
            onConfirm={() => { handleWithdraw(confirmWithdrawId); setConfirmWithdrawId(null); }}
            onCancel={() => setConfirmWithdrawId(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Detail modal ── */}
      <AnimatePresence>
        {viewOffer && (
          <OfferDetailModal offer={viewOffer} onClose={() => setViewOffer(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}