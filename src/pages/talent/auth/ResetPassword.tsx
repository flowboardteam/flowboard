"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, Eye, EyeOff, Check, X, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import NotificationModal from "@/components/ui/NotificationModal";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true); // New: Loading state for the guard
  const navigate = useNavigate();
  
  const [notification, setNotification] = useState({ open: false, type: "success" as "success" | "error", title: "", description: "" });

  // --- THE SECURITY GUARD (useEffect) ---
  useEffect(() => {
    const checkUserAccess = async () => {
      // We ask Supabase: "Does this person have a valid session from an email link?"
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // No session? Trigger an error and send them away
        setNotification({
          open: true,
          type: "error",
          title: "Access Denied",
          description: "This link is invalid or expired. Please request a new recovery link.",
        });
        setTimeout(() => navigate("/talent/login"), 3000);
      } else {
        // Session found! Let them see the form
        setIsValidating(false);
      }
    };

    checkUserAccess();
  }, [navigate]);

  // Password Requirements Logic
  const requirements = [
    { label: "At least 8 characters", test: password.length >= 8 },
    { label: "Contains a number", test: /[0-9]/.test(password) },
    { label: "Contains a capital letter", test: /[A-Z]/.test(password) },
    { label: "Passwords match", test: password === confirmPassword && password.length > 0 },
  ];

  const canSubmit = requirements.every(r => r.test);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setNotification({ open: true, type: "error", title: "Update Failed", description: error.message });
      setIsLoading(false);
    } else {
      setNotification({ open: true, type: "success", title: "Identity Secured", description: "Password updated. Logging out for security..." });
      await supabase.auth.signOut();
      setTimeout(() => navigate("/talent/login"), 2500);
    }
  };

  // If the guard is still checking the ID, show a clean loading screen
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050B1E]">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 font-sans bg-white overflow-x-hidden">
      {/* LEFT SIDE: Brand Experience (Same as Login/Signup) */}
      <div className="hidden lg:flex flex-col justify-between bg-[#050B1E] p-16 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-none -mr-48 -mt-48" />
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-20 group">
            <img src="/flowboardlogo.png" alt="Logo" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-black tracking-tighter uppercase italic text-white">FLOWBOARD</span>
          </Link>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-6">
              <Sparkles size={14} /> Security Protocol v2.0
            </div>
            <h2 className="text-5xl font-extrabold leading-[1.1] mb-8 tracking-tight text-white">
              Redefining <br />
              <span className="text-blue-400">Security.</span>
            </h2>
            <div className="p-6 bg-white/5 backdrop-blur-xl rounded-none border border-white/10 max-w-sm">
              <p className="text-slate-400 text-sm font-medium italic">
                "Your talent is your currency. We make sure the vault is impenetrable."
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT SIDE: Reset Form */}
      <div className="flex flex-col justify-center px-6 py-12 lg:px-24 bg-white">
        <div className="max-w-[400px] mx-auto w-full">
          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase italic">New Password</h1>
            <p className="text-slate-500 font-medium">Reset your credentials to continue your journey.</p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold text-xs uppercase tracking-widest">New Password</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 pl-11 pr-11 rounded-none border-slate-200 bg-slate-50/50 focus:bg-white transition-all shadow-sm outline-none"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-bold text-xs uppercase tracking-widest">Confirm Password</Label>
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 pl-11 rounded-none border-slate-200 bg-slate-50/50 focus:bg-white transition-all shadow-sm outline-none"
                  required
                />
              </div>
            </div>

            {/* Live Requirements Checklist */}
            <div className="p-4 bg-slate-50 rounded-none space-y-2 border border-slate-100 shadow-inner">
              {requirements.map((req, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-tight">
                  {req.test ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-slate-300" />}
                  <span className={req.test ? "text-emerald-600" : "text-slate-400"}>{req.label}</span>
                </div>
              ))}
            </div>

            <Button className="w-full h-14 bg-[#050B1E] hover:bg-blue-700 text-white font-black rounded-none shadow-xl transition-all active:scale-[0.98]" disabled={isLoading || !canSubmit}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Credentials"}
            </Button>
          </form>
        </div>
      </div>

      <NotificationModal open={notification.open} type={notification.type} title={notification.title} description={notification.description} onClose={() => setNotification((prev) => ({ ...prev, open: false }))} />
    </div>
  );
}