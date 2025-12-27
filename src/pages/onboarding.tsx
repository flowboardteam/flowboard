"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Building2, User, ArrowRight, Loader2 } from "lucide-react";

export default function Onboarding() {
  const [role, setRole] = useState<"recruiter" | "talent" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCompleteOnboarding = async () => {
    if (!role) {
      toast.error("Selection Required", { description: "Please select your role to continue." });
      return;
    }

    setIsLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          user_type: role,
          onboarding_completed: true,
          updated_at: new Date()
        })
        .eq("id", user.id);

      if (error) {
        toast.error("Update failed", { description: error.message });
        setIsLoading(false);
      } else {
        toast.success("Welcome to the team!", { description: "Setting up your workspace..." });
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050B1E] flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[500px] text-center"
      >
        <div className="flex justify-center mb-12">
          <div className="relative w-12 h-12">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain drop-shadow-md" />
          </div>
        </div>

        <h1 className="text-4xl font-black mb-4 tracking-tight">One last step.</h1>
        <p className="text-slate-400 font-medium mb-12">How do you plan to use Flowboard-Team?</p>

        <div className="grid gap-4 mb-10">
          {/* Recruiter Option */}
          <button
            onClick={() => setRole("recruiter")}
            className={`flex items-center gap-5 p-6 rounded-2xl border-2 transition-all text-left group ${
              role === "recruiter" 
              ? "border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]" 
              : "border-white/5 bg-white/5 hover:bg-white/10"
            }`}
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
              role === "recruiter" ? "bg-blue-500 text-white" : "bg-white/5 text-slate-400 group-hover:text-white"
            }`}>
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-lg">I'm a Recruiter</h3>
              <p className="text-sm text-slate-400">I want to hire elite AI talent.</p>
            </div>
          </button>

          {/* Talent Option */}
          <button
            onClick={() => setRole("talent")}
            className={`flex items-center gap-5 p-6 rounded-2xl border-2 transition-all text-left group ${
              role === "talent" 
              ? "border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]" 
              : "border-white/5 bg-white/5 hover:bg-white/10"
            }`}
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
              role === "talent" ? "bg-blue-500 text-white" : "bg-white/5 text-slate-400 group-hover:text-white"
            }`}>
              <User className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-lg">I'm a Talent</h3>
              <p className="text-sm text-slate-400">I'm looking for AI-focused roles.</p>
            </div>
          </button>
        </div>

        <Button 
          onClick={handleCompleteOnboarding}
          className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-xl shadow-blue-600/20"
          disabled={isLoading || !role}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Finalizing...
            </>
          ) : (
            <>
              Get Started <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}