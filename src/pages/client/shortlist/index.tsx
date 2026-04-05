"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trash2, 
  ExternalLink, 
  Award, 
  Loader2, 
  BookmarkCheck, 
  Code2, 
  History, 
  UserMinus,
  Search,
  Zap,
  AlertCircle,
  X
} from "lucide-react";
import { Link } from "react-router-dom"; 
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

export default function Shortlist() {
  const [savedTalent, setSavedTalent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showClearModal, setShowClearModal] = useState(false); // Modal State
  const { toast } = useToast();

  useEffect(() => {
    fetchSavedTalent();
  }, []);

  const fetchSavedTalent = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('shortlisted_talent')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) setSavedTalent(data || []);
    setLoading(false);
  };

  const handleRemove = async (githubId: string, name: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('shortlisted_talent')
      .delete()
      .match({ github_id: githubId, user_id: user?.id });

    if (!error) {
      setSavedTalent(prev => prev.filter(item => item.github_id !== githubId));
      toast({
        title: "Profile Removed",
        description: `${name} has been removed from your shortlist.`,
      });
    }
  };

  const confirmClearAll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('shortlisted_talent')
      .delete()
      .eq('user_id', user.id);

    if (!error) {
      setSavedTalent([]);
      setShowClearModal(false);
      toast({
        title: "Shortlist Cleared",
        description: "All experts have been removed from your list.",
      });
    }
  };

  const filteredTalent = savedTalent.filter(t => 
    t.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.role_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      <p className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Opening Secure Shortlist...</p>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-8 animate-in fade-in duration-500 relative">
      
      {/* --- CUSTOM CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {showClearModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[var(--sidebar-bg)] border border-[var(--border-color)] rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50" />
              
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-black uppercase tracking-tighter">Clear Shortlist?</h3>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed px-4">
                    This will permanently remove all <span className="font-black">{savedTalent.length} experts</span> from your current shortlist. This action is irreversible.
                  </p>
                </div>

                <div className="flex flex-col w-full gap-3 pt-4">
                  <button 
                    onClick={confirmClearAll}
                    className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-red-500/20"
                  >
                    Confirm Wipe
                  </button>
                  <button 
                    onClick={() => setShowClearModal(false)}
                    className="w-full py-4 bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                  >
                    Nevermind
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <BookmarkCheck className="w-4 h-4 text-blue-500" />
            <span>Node: Haraka / Shortlisted Talent</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-main)] uppercase tracking-tighter">
            My <span className="text-blue-600">Shortlist</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter saved experts..."
              className="w-full bg-[var(--sidebar-bg)] border border-[var(--border-color)] rounded-xl py-3 pl-12 text-xs font-bold outline-none focus:border-blue-500/50 transition-all"
            />
          </div>

          {savedTalent.length > 0 && (
            <button
              onClick={() => setShowClearModal(true)}
              className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500 transition-colors flex items-center gap-2 px-2"
            >
              <Trash2 className="w-3 h-3" /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filteredTalent.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredTalent.map((person) => (
              <motion.div
                layout
                key={person.github_id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-8 rounded-[2.5rem] bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm group hover:border-blue-500/30 transition-all relative"
              >
                <button 
                  onClick={() => handleRemove(person.github_id, person.full_name)}
                  className="absolute top-6 right-6 p-2 bg-red-500/10 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white z-10"
                >
                  <UserMinus className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-4 mb-6">
                  <img src={person.avatar_url} className="w-14 h-14 rounded-2xl border border-[var(--border-color)] object-cover" alt="" />
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tighter leading-none mb-1 pr-6">{person.full_name}</h3>
                    <div className="flex items-center gap-2 text-[9px] font-bold text-blue-600 uppercase">
                      <Award className="w-3 h-3" /> {person.seniority_label} • {person.match_score}%
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 font-medium leading-relaxed italic mb-8 line-clamp-2">
                  "{person.bio || 'Technical expert identified via Haraka Discovery node.'}"
                </p>

                <div className="space-y-4">
                   <div className="flex items-center justify-between px-2 text-[10px] font-black text-slate-400 uppercase border-t border-[var(--border-color)] pt-4">
                      <span className="flex items-center gap-1"><Code2 className="w-3 h-3 text-blue-500"/> {person.repos_count} Repos</span>
                      <span className="flex items-center gap-1"><History className="w-3 h-3 text-blue-500"/> {person.followers_count} Followers</span>
                   </div>
                   
                   <a 
                    href={person.github_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-slate-900 dark:bg-white dark:text-black text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-md"
                  >
                    GitHub Profile <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="py-32 text-center border-2 border-dashed border-[var(--border-color)] rounded-[3rem] bg-[var(--sidebar-bg)]/50">
           <p className="font-black uppercase text-slate-400 tracking-[0.2em] mb-6">No experts in this shortlist yet.</p>
           <Link to="/client/haraka" className="bg-blue-600 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all inline-flex items-center gap-2">
             <Zap className="w-4 h-4 fill-current" /> Run Haraka Discovery
           </Link>
        </div>
      )}
    </div>
  );
}