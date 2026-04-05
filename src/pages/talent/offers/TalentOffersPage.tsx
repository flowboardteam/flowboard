"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Inbox, Loader2, CheckCircle2, XCircle, Clock,
  DollarSign, Calendar, Briefcase, Building2,
  X, Zap, AlertCircle, RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface HireOffer {
  id: string;
  client_id: string;
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

// ─── Offer Card ───────────────────────────────────────────────────────────────
function OfferCard({ offer, onRespond, onView }: {
  offer: HireOffer;
  onRespond: (offer: HireOffer, action: "accepted" | "declined") => void;
  onView: (offer: HireOffer) => void;
}) {
  const cfg       = STATUS_CONFIG[offer.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const isPending  = ["pending", "viewed"].includes(offer.status);
  const orgName    = offer.client_profile?.company_name ?? offer.sender_name;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="p-4 sm:p-5 rounded-[1.5rem] bg-[var(--card-bg)] border border-[var(--border-color)] flex flex-col gap-3 hover:border-blue-500/30 transition-all"
    >
      {/* Top row: status + date */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
          <StatusIcon className="w-3 h-3 shrink-0" />
          {cfg.label}
        </span>
        <span className="text-[10px] font-bold text-slate-400 shrink-0">{fmtDate(offer.created_at)}</span>
      </div>

      {/* Org + role */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-500/10 border border-[var(--border-color)] flex items-center justify-center overflow-hidden shrink-0">
          {offer.client_profile?.avatar_url
            ? <img src={offer.client_profile.avatar_url} alt={orgName} className="w-full h-full object-cover" />
            : <Building2 className="w-4 h-4 text-slate-400" />
          }
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black dark:text-white truncate">{orgName}</p>
          <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest truncate mt-0.5">
            {offer.role_title ?? "Role not specified"}
          </p>
        </div>
      </div>

      {/* Key details — compact grid */}
      <div className="grid grid-cols-2 gap-2">
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
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 col-span-2">
            <Calendar className="w-3 h-3 shrink-0 text-amber-500" />
            <span>Starts {fmtDate(offer.start_date)}</span>
          </div>
        )}
      </div>

      {/* Message preview */}
      {offer.offer_message && (
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
          {offer.offer_message}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-[var(--border-color)]">
        <button
          onClick={() => onView(offer)}
          className="flex-1 py-2 bg-slate-500/10 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-500/20 transition-all"
        >
          Read offer
        </button>

        {isPending && (
          <>
            <button
              onClick={() => onRespond(offer, "accepted")}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all shadow-sm shadow-emerald-500/20 shrink-0"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span className="hidden sm:inline">Accept</span>
            </button>
            <button
              onClick={() => onRespond(offer, "declined")}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20 shrink-0"
            >
              <XCircle className="w-3 h-3" />
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
  const orgName   = offer.client_profile?.company_name ?? offer.sender_name;

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
          // Bottom sheet on mobile, centered modal on sm+
          className="w-full sm:max-w-lg bg-[var(--card-bg)] border border-[var(--border-color)] rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden"
        >
          {/* Drag handle (mobile only) */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-slate-500/30" />
          </div>

          {/* Header */}
          <div className="px-6 pt-4 pb-4 border-b border-[var(--border-color)]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border mb-2 ${cfg.bg} ${cfg.color}`}>
                  <cfg.icon className="w-3 h-3" />{cfg.label}
                </span>
                <h2 className="text-base font-black dark:text-white tracking-tight leading-tight">
                  {offer.role_title ?? "Role not specified"}
                </h2>
                <p className="text-xs font-bold text-slate-400 mt-0.5">from {orgName}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-500/10 text-slate-400 transition-colors flex-shrink-0 mt-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Key details grid */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {[
                { label: "Type",       value: fmtRoleType(offer.role_type) ?? "—" },
                { label: "Salary",     value: fmtCurrency(offer.salary_monthly, offer.salary_currency) },
                { label: "Start date", value: fmtDate(offer.start_date) },
                { label: "Duration",   value: offer.contract_length ?? (offer.role_type === "full_time" ? "Permanent" : "—") },
              ].map(m => (
                <div key={m.label} className="bg-slate-500/5 rounded-xl p-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{m.label}</p>
                  <p className="text-xs font-black dark:text-white capitalize truncate">{m.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Offer letter — scrollable */}
          <div className="px-6 py-4 max-h-40 overflow-y-auto">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Offer letter</p>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {offer.offer_message ?? "No message provided."}
            </p>
          </div>

          {/* Decline reason */}
          {showDeclineForm && (
            <div className="px-6 pb-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Reason (optional)
              </label>
              <textarea
                value={declineReason}
                onChange={e => setDeclineReason(e.target.value)}
                rows={3}
                placeholder="Let them know why you're declining..."
                className="w-full bg-slate-500/5 border border-[var(--border-color)] rounded-xl p-3 text-sm font-medium outline-none focus:ring-2 ring-red-500/20 transition-all resize-none"
              />
            </div>
          )}

          {/* Actions */}
          <div className="px-6 pb-6 pt-3">
            {isPending ? (
              showDeclineForm ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeclineForm(false)}
                    className="flex-1 py-3 border border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-xl hover:bg-slate-500/5 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => onRespond(offer, "declined", declineReason)}
                    disabled={responding}
                    className="flex-1 py-3 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-400 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    {responding
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <XCircle className="w-3.5 h-3.5" />
                    }
                    Confirm decline
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeclineForm(true)}
                    className="flex-1 py-3 border border-red-500/20 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500/20 transition-all"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => onRespond(offer, "accepted")}
                    disabled={responding}
                    className="flex-1 py-3 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 disabled:opacity-40"
                  >
                    {responding
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <CheckCircle2 className="w-3.5 h-3.5" />
                    }
                    Accept offer
                  </button>
                </div>
              )
            ) : (
              <button
                onClick={onClose}
                className="w-full py-3 border border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-xl hover:bg-slate-500/5 transition-all"
              >
                Close
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

      if (dbErr) throw dbErr;
      setOffers((data ?? []) as HireOffer[]);

      // Auto-mark pending → viewed
      const pendingIds = (data ?? [])
        .filter(o => o.status === "pending")
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
      const { error } = await supabase
        .from("hire_inquiries")
        .update({
          status:         response,
          decline_reason: response === "declined" ? reason : null,
        })
        .eq("id", offer.id);
      if (error) throw error;

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
    // ── Full-width, no max-w container — matches the rest of the talent dashboard ──
    <div className="w-full space-y-6 pb-20 p-4 sm:p-6 lg:p-8">

      {/* ── Header ── */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-blue-600 text-[11px] font-bold uppercase tracking-widest">
          <Inbox className="w-3.5 h-3.5" /> Hire Offers
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
          className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20"
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
            className="py-24 text-center space-y-4 bg-slate-500/5 rounded-[2rem] border border-dashed border-[var(--border-color)]"
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

      {/* ── Offer detail — bottom sheet on mobile, centered modal on sm+ ── */}
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