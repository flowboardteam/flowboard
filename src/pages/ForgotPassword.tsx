"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2, KeyRound, Timer } from "lucide-react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Timer logic to handle the cooldown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const email = (document.getElementById("email") as HTMLInputElement).value;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      if (error.status === 429) {
        toast.error("Too many requests", { description: "Please wait a moment before trying again." });
        setCountdown(60); // Force a 60s wait if we hit the limit
      } else {
        toast.error("Error", { description: error.message });
      }
    } else {
      toast.success("Check your email", { 
        description: "Recovery link sent. Check your spam if you don't see it." 
      });
      setCountdown(60); // Start the cooldown on success
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50" />

      <div className="max-w-[400px] w-full relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <KeyRound className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Forgot Password?</h1>
          <p className="text-slate-500 font-medium italic">No worries, it happens to the best of us.</p>
        </div>

        <form onSubmit={handleResetRequest} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-slate-700 font-bold ml-1" htmlFor="email">Work Email</Label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input id="email" type="email" placeholder="name@email.com" className="h-12 pl-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all outline-none disabled:opacity-50" required disabled={countdown > 0} />
            </div>
          </div>

          <Button 
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none" 
            disabled={isLoading || countdown > 0}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : countdown > 0 ? (
              <>
                <Timer className="w-5 h-5" />
                Wait {countdown}s
              </>
            ) : (
              "Send Recovery Link"
            )}
          </Button>

          <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors pt-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </form>
      </div>
    </div>
  );
}