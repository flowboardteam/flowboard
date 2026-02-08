"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Sparkles,
  Loader2,
  Users,
  X,
  ExternalLink,
  FileText,
  Calendar,
  Zap,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { TalentCard } from "@/components/client/TalentCard";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

export default function TalentPool() {
  // --- STATE ---
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");
  const [selectedRole, setSelectedRole] = useState("All Roles");
  
  // Modal & Selection States
  const [selectedTalent, setSelectedTalent] = useState<any | null>(null);
  const [showHireModal, setShowHireModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isSending, setSending] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  // --- FETCH DATA ---
  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      // Get Client Info
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setCurrentUser({ ...user, ...profile });
      }
      
      // Get Talent List
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role_type", "talent");
      
      if (!error) setTalents(data || []);
      setLoading(false);
    };

    initPage();
  }, []);

  // --- FILTER LOGIC ---
  const industries = useMemo(() => 
    ["All Industries", ...new Set(talents.map((t) => t.industry).filter(Boolean))], 
  [talents]);

  const roles = useMemo(() => 
    ["All Roles", ...new Set(talents.map((t) => t.primary_role?.trim()).filter(Boolean))], 
  [talents]);

  const filteredTalents = talents.filter((t) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      t.full_name?.toLowerCase().includes(search) ||
      t.primary_role?.toLowerCase().includes(search) ||
      t.skills?.some((s: string) => s.toLowerCase().includes(search));

    const matchesIndustry = selectedIndustry === "All Industries" || t.industry === selectedIndustry;
    const matchesRole = selectedRole === "All Roles" || t.primary_role?.trim() === selectedRole;

    return matchesSearch && matchesIndustry && matchesRole;
  });

  // --- ACTION HANDLER ---
  const handleHireSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) {
      toast({ variant: "destructive", title: "Authentication Required", description: "Please log in to hire talent." });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const message = formData.get("message") as string;

    try {
      setSending(true);

      // 1. Log the Inquiry
      const { error: inqError } = await supabase.from("hire_inquiries").insert({
        talent_id: selectedTalent.id,
        client_id: currentUser.id,
        sender_name: currentUser.full_name,
        sender_email: currentUser.email,
        message: message,
      });
      if (inqError) throw inqError;

      // 2. Alert the Talent via Notifications
      await supabase.from("notifications").insert({
        user_id: selectedTalent.id,
        title: "New Project Inquiry! 📬",
        message: `${currentUser.full_name} wants to collaborate on a new mission.`,
        type: "inquiry",
      });

      toast({
        title: "Transmission Successful 🚀",
        description: `Signal delivered to ${selectedTalent.full_name.split(" ")[0]}.`,
      });

      setShowHireModal(false);
      setSelectedTalent(null);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Signal Failure",
        description: err.message || "Could not deliver message.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[var(--main-bg)]">
      <div className="p-4 sm:p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <Users className="w-4 h-4 text-emerald-500" />
            <span>Node: Discovery / Talent Pool</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-main)] uppercase tracking-tighter">
            Global <span className="text-emerald-500">Talent Pool</span>
          </h1>
        </div>

        {/* Filters & Search */}
        <div className="grid grid-cols-1 md:flex gap-4 items-center bg-[var(--sidebar-bg)] p-4 rounded-2xl border border-[var(--border-color)]">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, role, or skill-set..."
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl py-3 pl-12 text-sm font-bold focus:border-emerald-500/50 outline-none transition-all"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-[10px] font-black uppercase text-slate-400 outline-none focus:border-emerald-500"
            >
              {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
            </select>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-[10px] font-black uppercase text-slate-400 outline-none focus:border-emerald-500"
            >
              {roles.map(role => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>
        </div>

        {/* Talent Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Scanning Database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTalents.map((talent) => (
              <TalentCard key={talent.id} talent={talent} onReview={(t) => setSelectedTalent(t)} />
            ))}
          </div>
        )}
      </div>

      {/* --- SIDE DOSSIER (Selection Drawer) --- */}
      {selectedTalent && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={() => setSelectedTalent(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-[var(--sidebar-bg)] border-l border-[var(--border-color)] z-[101] shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-500">
            <div className="sticky top-0 bg-[var(--sidebar-bg)]/90 backdrop-blur-md p-6 flex justify-between items-center border-b border-[var(--border-color)] z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Talent Dossier</span>
              <button onClick={() => setSelectedTalent(null)} className="p-2 hover:bg-rose-500/10 rounded-full group transition-all">
                <X className="w-5 h-5 text-slate-400 group-hover:text-rose-500" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                <div className="w-28 h-28 rounded-[2rem] bg-slate-800 border-2 border-emerald-500/20 p-1 shrink-0 overflow-hidden shadow-xl">
                  {selectedTalent.avatar_url ? (
                    <img src={selectedTalent.avatar_url} className="w-full h-full object-cover rounded-[1.8rem]" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-black text-slate-600 bg-slate-900">
                      {selectedTalent.full_name?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-[var(--text-main)] uppercase tracking-tighter">
                    {selectedTalent.full_name}
                  </h2>
                  <p className="text-emerald-500 font-black uppercase text-xs tracking-widest">{selectedTalent.primary_role}</p>
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 mt-3 text-slate-400 text-[10px] font-black uppercase">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-emerald-500" /> {selectedTalent.location || 'Remote'}</span>
                    <span className="w-1 h-1 bg-slate-700 rounded-full" />
                    <span>{selectedTalent.experience_level || 'Expert'} Level</span>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div className="bg-[var(--bg-main)] p-6 rounded-3xl border border-[var(--border-color)] relative">
                <div className="absolute -top-3 left-6 px-3 py-1 bg-[var(--sidebar-bg)] border border-[var(--border-color)] rounded-full text-[9px] font-black uppercase tracking-widest text-slate-500">
                  Biography
                </div>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                   "{selectedTalent.bio || "Candidate has not provided a bio-description for this node yet."}"
                </p>
              </div>

              {/* Action Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setShowHireModal(true)}
                  className="flex items-center justify-center gap-3 bg-emerald-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20"
                >
                  <Zap className="w-4 h-4 fill-white" /> Hire {selectedTalent.full_name?.split(" ")[0]}
                </button>

                <Link
                  to={`/@${selectedTalent.username || selectedTalent.id}`}
                  className="flex items-center justify-center gap-3 bg-[var(--text-main)] text-[var(--sidebar-bg)] py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:opacity-90"
                >
                  <ExternalLink className="w-4 h-4" /> Full Profile
                </Link>

                <button
                  onClick={() => navigate(`/interview-scheduler/${selectedTalent.id}`)}
                  className="flex items-center justify-center gap-3 bg-transparent text-[var(--text-main)] py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-[var(--border-color)] hover:bg-slate-500/5 transition-all"
                >
                  <Calendar className="w-4 h-4" /> Schedule Interview
                </button>

                {selectedTalent.resume_url ? (
                  <a href={selectedTalent.resume_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 bg-blue-500/10 text-blue-500 py-4 rounded-2xl font-black text-[10px] uppercase border border-blue-500/20 hover:bg-blue-500/20 transition-all">
                    <FileText className="w-4 h-4" /> View Resume
                  </a>
                ) : (
                  <div className="flex items-center justify-center gap-3 opacity-30 bg-slate-500/5 py-4 rounded-2xl font-black text-[10px] uppercase border border-dashed border-[var(--border-color)] cursor-not-allowed">
                    <X className="w-4 h-4" /> No Resume
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* --- HIRE MODAL (Transmission Popup) --- */}
      {showHireModal && selectedTalent && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowHireModal(false)} />
          <div className="relative w-full max-w-lg bg-[var(--sidebar-bg)] border border-[var(--border-color)] rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="space-y-1 mb-8">
              <h2 className="text-xl font-bold text-slate-900">
                  Hire Talent
                </h2>
            </div>

            <form onSubmit={handleHireSubmit} className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Project Details
                </label>
                <textarea
                  name="message"
                  required
                  placeholder="Identify your project scope, timeline, and core mission requirements..."
                  className="w-full h-48 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[2rem] p-6 text-sm font-medium outline-none focus:border-emerald-500/50 transition-all resize-none placeholder:text-slate-600"
                />
                <div className="absolute bottom-4 right-6 text-[9px] font-black text-slate-600 uppercase tracking-widest">Secure Link Active</div>
              </div>
              
              <div className="flex flex-col gap-3">
                <button
                  disabled={isSending}
                  type="submit"
                  className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-400 hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <><Zap className="w-4 h-4 fill-white" /> Send Hiring Inquiry</>
                  )}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowHireModal(false)}
                  className="w-full py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest hover:text-rose-500 transition-colors"
                >
                  Abort Transmission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}