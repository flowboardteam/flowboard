"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, Eye, EyeOff, Check, X, ShieldCheck } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import NotificationModal from "@/components/ui/NotificationModal";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const navigate = useNavigate();
  
  const [notification, setNotification] = useState({ open: false, type: "success" as "success" | "error", title: "", description: "" });

  useEffect(() => {
    const checkUserAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setNotification({
          open: true,
          type: "error",
          title: "Access Denied",
          description: "This link is invalid or expired. Please request a new recovery link.",
        });
        setTimeout(() => navigate("/talent/login"), 3000);
      } else {
        setIsValidating(false);
      }
    };

    checkUserAccess();
  }, [navigate]);

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

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-slate-900 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-jakarta p-6">
      <div className="max-w-[400px] w-full space-y-10">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
            <img src="/flowboardlogo.png" alt="Logo" className="w-12 h-12 object-contain" />
            <span className="text-2xl font-black tracking-tighter uppercase text-slate-900">FLOWBOARD</span>
          </Link>
          <h1 className="text-4xl font-medium text-slate-900 mb-2 tracking-tighter">New password</h1>
          <p className="text-slate-500 font-medium">Reset your credentials to continue.</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-slate-700 font-bold text-xs uppercase tracking-widest">New Password</Label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-14 pl-11 pr-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 transition-all shadow-sm outline-none"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-bold text-xs uppercase tracking-widest">Confirm Password</Label>
            <div className="relative group">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="h-14 pl-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 transition-all shadow-sm outline-none"
                required
              />
            </div>
          </div>

          {/* Live Requirements Checklist */}
          <div className="p-5 bg-slate-50 rounded-2xl space-y-3 border border-slate-100 shadow-inner">
            {requirements.map((req, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-tight">
                {req.test ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-slate-300" />}
                <span className={req.test ? "text-emerald-600" : "text-slate-400"}>{req.label}</span>
              </div>
            ))}
          </div>

          <Button className="w-full h-16 bg-slate-900 hover:bg-black text-white font-black rounded-xl shadow-xl transition-all active:scale-[0.98]" disabled={isLoading || !canSubmit}>
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Credentials"}
          </Button>
        </form>
      </div>

      <NotificationModal open={notification.open} type={notification.type} title={notification.title} description={notification.description} onClose={() => setNotification((prev) => ({ ...prev, open: false }))} />
    </div>
  );
}

const Eye = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);