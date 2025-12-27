"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Lock,
  Loader2,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Check URL for errors like "otp_expired"
    const hash = window.location.hash;
    if (hash && hash.includes("error=access_denied")) {
      setIsExpired(true);
      toast.error("Link Expired", {
        description:
          "This password reset link is no longer valid. Please request a new one.",
      });
    }
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const newPassword = (
      document.getElementById("password") as HTMLInputElement
    ).value;

    // 1. Update the password
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast.error("Update failed", { description: error.message });
      setIsLoading(false);
    } else {
      toast.success("Password updated!", {
        description:
          "Logging you out for security. Please log in with your new password.",
      });

      // 2. CRITICAL: Sign out immediately to clear the session
      await supabase.auth.signOut();

      // 3. Redirect to login
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    }
  };

  if (isExpired) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-[400px] w-full text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">
            Link Expired
          </h1>
          <p className="text-slate-500 mb-8 font-medium">
            For security, reset links are only valid for a short time.
          </p>
          <a
            href="/forgot-password"
            className="inline-flex items-center gap-2 font-bold text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" /> Try again
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative">
      <div className="max-w-[400px] w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            Reset Password
          </h1>
          <p className="text-slate-500 font-medium">
            Create a strong, unique password.
          </p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-slate-700 font-bold ml-1" htmlFor="password">
              New Password
            </Label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="h-12 pl-11 pr-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all outline-none"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            className="w-full h-14 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-xl flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}