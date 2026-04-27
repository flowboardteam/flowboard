"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search, Loader2, Users, X, ExternalLink, FileText,
  Calendar, Zap, MapPin, CheckCircle2, DollarSign,
  Clock, Send, AlertCircle, ChevronDown,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { TalentCard } from "@/components/client/TalentCard";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useGroups } from "@/contexts/GroupContext";

export default function TalentPool() {
  const { activeGroup } = useGroups();
  const [talents, setTalents]                 = useState<any[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [searchTerm, setSearchTerm]           = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");
  const [selectedRole, setSelectedRole]       = useState("All Roles");
  const [selectedTalent, setSelectedTalent]   = useState<any | null>(null);
  const [showOfferModal, setShowOfferModal]   = useState(false);
  const [currentUser, setCurrentUser]         = useState<any | null>(null);
  const [isSending, setSending]               = useState(false);

  // Offer form state
  const [offerForm, setOfferForm] = useState({
    role_title:      "",
    role_type:       "full_time",
    salary_monthly:  "",
    salary_currency: "USD",
    start_date:      new Date().toISOString().split("T")[0],
    contract_length: "Indefinite",
    offer_message:   "",
  });

  const navigate  = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setCurrentUser({ ...user, ...profile });
      }
      const { data, error } = await supabase.from("profiles").select("*").eq("role_type", "talent");
      if (!error) setTalents(data || []);
      setLoading(false);
    };
    initPage();
  }, []);

  const industries = useMemo(() =>
    ["All Industries", ...new Set(talents.map(t => t.industry).filter(Boolean))], [talents]);
  const roles = useMemo(() =>
    ["All Roles", ...new Set(talents.map(t => t.primary_role?.trim()).filter(Boolean))], [talents]);

  const filteredTalents = talents.filter(t => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      t.full_name?.toLowerCase().includes(search) ||
      t.primary_role?.toLowerCase().includes(search) ||
      t.skills?.some((s: string) => s.toLowerCase().includes(search));
    return matchesSearch &&
      (selectedIndustry === "All Industries" || t.industry === selectedIndustry) &&
      (selectedRole === "All Roles" || t.primary_role?.trim() === selectedRole);
  });

  const updateOffer = (k: string, v: string) => setOfferForm(p => ({ ...p, [k]: v }));

  // Open offer modal — pre-fill role title from talent's primary role
  const openOfferModal = () => {
    setOfferForm(p => ({
      ...p,
      role_title: selectedTalent?.primary_role ?? "",
      offer_message: "",
    }));
    setShowOfferModal(true);
  };

  // Send formal hire offer
  const handleSendOffer = async () => {
    if (!currentUser || !selectedTalent) {
      toast({ variant: "destructive", title: "Authentication Required" });
      return;
    }
    if (!offerForm.role_title.trim() || !offerForm.offer_message.trim()) {
      toast({ variant: "destructive", title: "Please fill in all required fields" });
      return;
    }

    try {
      setSending(true);

      const groupId = activeGroup?.id || "default-group";
      const localKey = `flowboard_offers_${groupId}`;
      const existing = localStorage.getItem(localKey);
      const offersArr = existing ? JSON.parse(existing) : [];

      // Insert formal hire offer in DB
      try {
        await supabase.from("hire_inquiries").insert({
          talent_id:       selectedTalent.id,
          client_id:       currentUser.id,
          sender_name:     activeGroup?.name || currentUser.full_name,
          sender_email:    currentUser.email,
          role_title:      offerForm.role_title,
          role_type:       offerForm.role_type,
          salary_monthly:  offerForm.salary_monthly ? Number(offerForm.salary_monthly) : null,
          salary_currency: offerForm.salary_currency,
          start_date:      offerForm.start_date || null,
          contract_length: offerForm.role_type !== "full_time" ? offerForm.contract_length : null,
          offer_message:   offerForm.offer_message + `\n\n[GROUP_ID:${groupId}]`,
          message:         offerForm.offer_message + `\n\n[GROUP_ID:${groupId}]`,
          source:          "talent_pool",
          status:          "pending",
        });

      } catch (dbErr) {
        console.warn("Offer DB save skipped/failed:", dbErr);
      }

      const newOffer: any = {
        id: `off-${groupId}-${Math.random().toString(36).substr(2, 9)}`,
        talent_id: selectedTalent.id,
        sender_name: activeGroup?.name || currentUser.full_name,
        sender_email: currentUser.email,
        role_title: offerForm.role_title,
        role_type: offerForm.role_type,
        salary_monthly: offerForm.salary_monthly ? Number(offerForm.salary_monthly) : null,
        salary_currency: offerForm.salary_currency,
        start_date: offerForm.start_date || null,
        contract_length: offerForm.role_type !== "full_time" ? offerForm.contract_length : null,
        offer_message: offerForm.offer_message,
        status: "pending",
        source: "talent_pool",
        created_at: new Date().toISOString(),
        talent_profile: {
          full_name: selectedTalent.full_name,
          avatar_url: selectedTalent.avatar_url || null,
          primary_role: selectedTalent.primary_role || null,
          location: selectedTalent.location || null
        }
      };

      try {
        // Notify the talent
        await supabase.from("notifications").insert({
          user_id: selectedTalent.id,
          title:   "You have a new job offer! 🎉",
          message: `${activeGroup?.name || currentUser.full_name} has sent you a formal offer for ${offerForm.role_title}.\n\n[OFFER_DATA:${JSON.stringify(newOffer)}]`,
          type:    "hire_offer",
        });
      } catch (dbErr) {
        console.warn("Offer Notification save skipped/failed:", dbErr);
      }

      localStorage.setItem(localKey, JSON.stringify([...offersArr, newOffer]));

      const globalTalentKey = `global_talent_offers_${selectedTalent.id}`;
      const existingGlobal = localStorage.getItem(globalTalentKey);
      const globalArr = existingGlobal ? JSON.parse(existingGlobal) : [];
      localStorage.setItem(globalTalentKey, JSON.stringify([...globalArr, newOffer]));

      toast({
        title:       "Offer sent successfully ✓",
        description: `Formal offer delivered to ${selectedTalent.full_name.split(" ")[0]}. Sent by ${activeGroup?.name || "your organization"}.`,
      });

      setShowOfferModal(false);
      setSelectedTalent(null);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[var(--main-bg)]">
      <div className="p-4 sm:p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <Users className="w-3.5 h-3.5" />
            <span>Talent & AI / Talent Pool</span>
          </div>
          <h1 className="text-2xl font-black text-[#1A1C21] uppercase tracking-tighter">
            Global Talent Pool
          </h1>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:flex gap-4 items-center bg-[var(--sidebar-bg)] p-4 rounded-2xl border border-[var(--border-color)]">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name, role, or skill-set..."
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl py-3 pl-12 text-sm font-bold focus:border-emerald-500/50 outline-none transition-all" />
          </div>
          <div className="flex gap-2">
            <select value={selectedIndustry} onChange={e => setSelectedIndustry(e.target.value)}
              className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-[10px] font-black uppercase text-slate-400 outline-none focus:border-emerald-500">
              {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
            </select>
            <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)}
              className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-[10px] font-black uppercase text-slate-400 outline-none focus:border-emerald-500">
              {roles.map(role => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Scanning Database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTalents.map(talent => (
              <TalentCard key={talent.id} talent={talent} onReview={t => setSelectedTalent(t)} />
            ))}
          </div>
        )}
      </div>

      {/* Talent Dossier Drawer */}
      {selectedTalent && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={() => setSelectedTalent(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-[var(--sidebar-bg)] border-l border-[var(--border-color)] z-[101] shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-500">
            <div className="sticky top-0 bg-[var(--sidebar-bg)]/90 backdrop-blur-md p-6 flex justify-between items-center border-b border-[var(--border-color)] z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Talent Dossier</span>
              <button onClick={() => setSelectedTalent(null)} className="p-2 hover:bg-rose-500/10 rounded-xl group transition-all">
                <X className="w-5 h-5 text-slate-400 group-hover:text-rose-500" />
              </button>
            </div>
            <div className="p-8 space-y-8">
              {/* Profile */}
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                <div className="w-28 h-28 rounded-2xl bg-slate-800 border-2 border-emerald-500/20 p-1 shrink-0 overflow-hidden shadow-xl">
                  {selectedTalent.avatar_url
                    ? <img src={selectedTalent.avatar_url} className="w-full h-full object-cover rounded-xl" alt="" />
                    : <div className="w-full h-full flex items-center justify-center text-4xl font-black text-slate-600 bg-slate-900 rounded-xl">{selectedTalent.full_name?.charAt(0)}</div>
                  }
                </div>
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-[var(--text-main)] uppercase tracking-tighter">{selectedTalent.full_name}</h2>
                  <p className="text-emerald-500 font-black uppercase text-xs tracking-widest">{selectedTalent.primary_role}</p>
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 mt-3 text-slate-400 text-[10px] font-black uppercase">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-emerald-500" /> {selectedTalent.location || "Remote"}</span>
                    <span className="w-1 h-1 bg-slate-700 rounded-full" />
                    <span>{selectedTalent.experience_level || "Expert"} Level</span>
                  </div>
                </div>
              </div>
              {/* Bio */}
              <div className="bg-[var(--bg-main)] p-6 rounded-2xl border border-[var(--border-color)] relative">
                <div className="absolute -top-3 left-6 px-3 py-1 bg-[var(--sidebar-bg)] border border-[var(--border-color)] rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500">Biography</div>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">"{selectedTalent.bio || "Candidate has not provided a bio yet."}"</p>
              </div>
              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={openOfferModal}
                  className="flex items-center justify-center gap-3 bg-emerald-500 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-emerald-400 hover:scale-[1.02] shadow-lg shadow-emerald-500/20">
                  <Zap className="w-4 h-4 fill-white" /> Send offer
                </button>
                <Link to={`/@${selectedTalent.username || selectedTalent.id}`}
                  className="flex items-center justify-center gap-3 bg-[var(--text-main)] text-[var(--sidebar-bg)] py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90">
                  <ExternalLink className="w-4 h-4" /> Full Profile
                </Link>
                <button onClick={() => navigate(`/interview-scheduler/${selectedTalent.id}`)}
                  className="flex items-center justify-center gap-3 bg-transparent text-[var(--text-main)] py-4 rounded-xl font-black text-[10px] uppercase tracking-widest border border-[var(--border-color)] hover:bg-slate-500/5 transition-all">
                  <Calendar className="w-4 h-4" /> Schedule Interview
                </button>
                {selectedTalent.resume_url
                  ? <a href={selectedTalent.resume_url} target="_blank" rel="noreferrer"
                      className="flex items-center justify-center gap-3 bg-blue-500/10 text-blue-500 py-4 rounded-xl font-black text-[10px] uppercase border border-blue-500/20 hover:bg-blue-500/20 transition-all">
                      <FileText className="w-4 h-4" /> View Resume
                    </a>
                  : <div className="flex items-center justify-center gap-3 opacity-30 bg-slate-500/5 py-4 rounded-xl font-black text-[10px] uppercase border border-dashed border-[var(--border-color)] cursor-not-allowed">
                      <X className="w-4 h-4" /> No Resume
                    </div>
                }
              </div>
            </div>
          </div>
        </>
      )}

      {/* Formal Hire Offer Modal */}
      {showOfferModal && selectedTalent && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowOfferModal(false)} />
          <div className="relative w-full max-w-lg bg-[var(--sidebar-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

            {/* Header */}
            <div className="p-8 pb-0">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-emerald-500/20 overflow-hidden shrink-0">
                  {selectedTalent.avatar_url
                    ? <img src={selectedTalent.avatar_url} className="w-full h-full object-cover" alt="" />
                    : <div className="w-full h-full flex items-center justify-center text-lg font-black text-slate-500">{selectedTalent.full_name?.charAt(0)}</div>
                  }
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-0.5">Sending hire offer to</p>
                  <h2 className="text-lg font-black text-[var(--text-main)] tracking-tight">{selectedTalent.full_name}</h2>
                  <p className="text-xs font-bold text-slate-400">{selectedTalent.primary_role}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 mb-6">
                <AlertCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                  This sends a <strong className="text-slate-600 dark:text-slate-300">formal job offer</strong>. {selectedTalent.full_name.split(" ")[0]} will receive a notification and can accept or decline from their Flowboard dashboard.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="px-8 pb-0 space-y-4 max-h-[45vh] overflow-y-auto">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Role title *</label>
                <input value={offerForm.role_title} onChange={e => updateOffer("role_title", e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-emerald-500/50 transition-all" />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Employment type *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ value: "full_time", label: "Full-time" }, { value: "contract", label: "Contract" }, { value: "part_time", label: "Part-time" }].map(t => (
                    <button key={t.value} type="button" onClick={() => updateOffer("role_type", t.value)}
                      className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                        offerForm.role_type === t.value
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
                          : "border-[var(--border-color)] text-slate-400 hover:bg-slate-500/5"
                      }`}>{t.label}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    <DollarSign className="inline w-3 h-3" />Monthly salary
                  </label>
                  <input value={offerForm.salary_monthly} onChange={e => updateOffer("salary_monthly", e.target.value)}
                    placeholder="e.g. 5000" type="number"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-emerald-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    <Calendar className="inline w-3 h-3" />Start date
                  </label>
                  <input type="date" value={offerForm.start_date} onChange={e => updateOffer("start_date", e.target.value)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-emerald-500/50 transition-all" />
                </div>
              </div>

              {offerForm.role_type !== "full_time" && (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    <Clock className="inline w-3 h-3" />Contract length
                  </label>
                  <div className="relative">
                    <select value={offerForm.contract_length} onChange={e => updateOffer("contract_length", e.target.value)}
                      className="w-full appearance-none bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-emerald-500/50 transition-all cursor-pointer">
                      {["1 month","3 months","6 months","1 year","2 years","Indefinite"].map(l => <option key={l}>{l}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Offer message *</label>
                <textarea value={offerForm.offer_message} onChange={e => updateOffer("offer_message", e.target.value)}
                  rows={4}
                  placeholder="Dear [Name], we're excited to extend this offer... describe the role, team, expectations and why you want them."
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-4 text-sm font-medium outline-none focus:border-emerald-500/50 transition-all resize-none" />
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 pt-5 flex flex-col gap-3">
              <button onClick={handleSendOffer} disabled={isSending || !offerForm.role_title.trim() || !offerForm.offer_message.trim()}
                className="w-full bg-emerald-500 text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20">
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send formal offer</>}
              </button>
              <button type="button" onClick={() => setShowOfferModal(false)}
                className="w-full py-3 text-[10px] font-black uppercase text-slate-500 tracking-widest hover:text-rose-500 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}