"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2, KeyRound, Timer, Sparkles, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import NotificationModal from "@/components/ui/NotificationModal";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [notification, setNotification] = useState({ open: false, type: "success" as "success" | "error", title: "", description: "" });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/client/reset-password`,
    });

    if (error) {
      setNotification({ open: true, type: "error", title: "Transmission Failed", description: error.message });
      if (error.status === 429) setCountdown(60);
    } else {
      setNotification({ open: true, type: "success", title: "Email Sent", description: "Check your inbox for the secure recovery link." });
      setCountdown(60);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 font-jakarta bg-white overflow-x-hidden">
      {/* LEFT SIDE: Brand Experience */}
      <div className="hidden lg:flex flex-col justify-between bg-[#050B1E] p-16 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full -mr-48 -mt-48" />
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-20 group">
            <img src="/flowboardlogo.png" alt="Logo" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-black tracking-tighter uppercase">FLOWBOARD</span>
          </Link>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-6">
              <ShieldCheck size={14} /> Secure Access Recovery
            </div>
            <h2 className="text-5xl font-extrabold leading-[1.1] mb-8 tracking-tight">
              Don't lose your <br />
              <span className="text-blue-400 text-6xl text-glow">Connection.</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-md font-medium">
              Our encrypted recovery system ensures you get back to the Client Cloud safely.
            </p>
          </motion.div>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="flex flex-col justify-center px-6 py-12 lg:px-24 bg-white relative">
        <div className="max-w-[400px] mx-auto w-full">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">Recover Access</h1>
            <p className="text-slate-500 font-medium">"Lost credentials? We've got the backup."</p>
          </div>

          <form onSubmit={handleResetRequest} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold text-xs uppercase tracking-widest" htmlFor="email">Work Email</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="h-12 pl-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all shadow-sm outline-none"
                  required
                  disabled={countdown > 0}
                />
              </div>
            </div>

            <Button className="w-full h-14 bg-[#050B1E] hover:bg-blue-700 text-white font-black rounded-xl shadow-xl shadow-blue-900/10 gap-2 transition-all" disabled={isLoading || countdown > 0}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : countdown > 0 ? (
                <><Timer className="w-5 h-5" /> Retry in {countdown}s</>
              ) : "Send Recovery Link"}
            </Button>

            <Link to="/client/login" className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors pt-2">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </form>
        </div>
      </div>

      <NotificationModal open={notification.open} type={notification.type} title={notification.title} description={notification.description} onClose={() => setNotification((prev) => ({ ...prev, open: false }))} />
    </div>
  );
}