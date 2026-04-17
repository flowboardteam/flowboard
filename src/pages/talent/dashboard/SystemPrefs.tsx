"use client";

import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom"; 
import { supabase } from "@/lib/supabase"; 
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor,
  Bell,
  ShieldCheck,
  ChevronRight,
  Eye,
  Loader2,
  CheckCircle2,
  Sun, 
  Moon
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function SystemPrefs() {
  const { theme, toggleTheme } = useOutletContext<{ theme: string; toggleTheme: () => void }>();
  
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [prefs, setPrefs] = useState({
    emailAlerts: true,
    pushNotifications: false,
    publicDiscovery: true,
    compactMode: false,
    language: "EN-US",
  });

  useEffect(() => {
    setMounted(true);
    async function loadPrefs() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("system_prefs")
          .eq("id", user.id)
          .single();

        if (data?.system_prefs) {
          setPrefs(data.system_prefs);
        }
      }
      setIsLoading(false);
    }
    loadPrefs();
  }, []);

  const handleApplyChanges = async () => {
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ system_prefs: prefs })
        .eq("id", user.id);

      if (!error) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    }
    setIsSaving(false);
  };

  if (!mounted || isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-[#00A86B]" />
    </div>
  );

  const isDark = theme === "dark";

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 px-4 md:px-0">
      <header className="flex justify-between items-end">
        <div>
          {/* FIXED: Text color now uses var(--text-main) */}
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-[var(--text-main)]">
            System Configuration
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Optimize your workspace interface and communication protocols.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-none bg-blue-500/5 border border-[var(--border-color)]">
          <div className="w-2 h-2 rounded-none bg-[#00A86B] animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sync Active</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-none p-8 shadow-sm">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 mb-8">
              <Monitor className="w-3 h-3 text-blue-500" /> Interface Aesthetics
            </h4>

            <div className="space-y-2">
              {/* DARK MODE PROTOCOL */}
              <div className="flex items-center justify-between py-4 border-b border-[var(--border-color)] group hover:border-blue-500/50 transition-all">
                <div className="flex gap-4 items-start">
                  <div className="mt-1 p-2 rounded-none bg-slate-500/5 text-slate-400 group-hover:text-[#00A86B] transition-colors">
                    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </div>
                  <div>
                    {/* FIXED: text-slate-900 changed to text-[var(--text-main)] */}
                    <span className="text-xs font-black uppercase tracking-tighter block text-[var(--text-main)]">
                      Dark Mode Protocol
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                      Current Status: <span className="text-[#00A86B]">{isDark ? "Active" : "Standby"}</span>
                    </span>
                  </div>
                </div>

                <Switch
                  checked={isDark}
                  onCheckedChange={toggleTheme}
                  className="data-[state=checked]:bg-[#00A86B]"
                />
              </div>

              {/* DATA DENSITY */}
              <div className="flex items-center justify-between py-4 border-b border-[var(--border-color)] group hover:border-blue-500/50 transition-all">
                <div>
                   {/* FIXED: text-slate-900 changed to text-[var(--text-main)] */}
                  <span className="text-xs font-black uppercase tracking-tighter block text-[var(--text-main)]">Data Density</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Minimize padding for a more compact view.</span>
                </div>
                <Switch
                  checked={prefs.compactMode}
                  onCheckedChange={(val) => setPrefs({ ...prefs, compactMode: val })}
                />
              </div>

              {/* LANGUAGE SELECTION */}
              <div className="flex items-center justify-between py-4 group transition-all">
                <div>
                   {/* FIXED: text-slate-900 changed to text-[var(--text-main)] */}
                  <span className="text-xs font-black uppercase tracking-tighter block text-[var(--text-main)]">System Language</span>
                </div>
                <select
                  value={prefs.language}
                  onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}
                  className="bg-transparent text-right text-xs font-black outline-none text-blue-500 cursor-pointer appearance-none uppercase"
                >
                  <option className="text-black" value="EN-US">English (US)</option>
                  <option className="text-black" value="EN-UK">English (UK)</option>
                  <option className="text-black" value="FR">French</option>
                </select>
              </div>
            </div>
          </section>

          {/* SECURITY & PRIVACY */}
          <section className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-none p-8 shadow-sm">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 mb-8">
              <ShieldCheck className="w-3 h-3 text-[#00A86B]" /> Security & Privacy
            </h4>
            <div className="flex items-center justify-between p-6 bg-slate-500/5 rounded-none border border-[var(--border-color)]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-none bg-[#00A86B]/10 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-[#00A86B]" />
                </div>
                <div>
                   {/* FIXED: text-slate-900 changed to text-[var(--text-main)] */}
                  <span className="text-xs font-black uppercase tracking-tighter block text-[var(--text-main)]">Talent Discovery</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Allow verified orgs to find your profile.</span>
                </div>
              </div>
              <Switch
                checked={prefs.publicDiscovery}
                onCheckedChange={(val) => setPrefs({ ...prefs, publicDiscovery: val })}
              />
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <section className="bg-[#050B1E] text-white rounded-none p-8 shadow-xl relative overflow-hidden group border border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h4 className="text-[10px] font-black uppercase text-blue-300 tracking-widest flex items-center gap-2 mb-8">
                <Bell className="w-3 h-3" /> Communication
              </h4>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase italic tracking-tighter">Email Briefings</span>
                  <Switch
                    className="data-[state=checked]:bg-blue-500"
                    checked={prefs.emailAlerts}
                    onCheckedChange={(val) => setPrefs({ ...prefs, emailAlerts: val })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase italic tracking-tighter">Push Alerts</span>
                  <Switch
                    className="data-[state=checked]:bg-blue-500"
                    checked={prefs.pushNotifications}
                    onCheckedChange={(val) => setPrefs({ ...prefs, pushNotifications: val })}
                  />
                </div>
              </div>
            </div>
          </section>

          <button
            onClick={handleApplyChanges}
            disabled={isSaving}
            className={`
              w-full py-5 rounded-none flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-lg
              ${isSaving ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.02]"}
              bg-slate-900 text-white dark:bg-white dark:text-slate-900
            `}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isSaving ? "Syncing..." : "Apply Global Changes"}</span>
          </button>

          <AnimatePresence>
            {showSuccess && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-3 p-4 bg-[#00A86B]/10 border border-[#00A86B]/20 rounded-none">
                <CheckCircle2 className="w-4 h-4 text-[#00A86B]" />
                <span className="text-[10px] font-black uppercase text-[#00A86B] tracking-widest">Preferences Updated</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}