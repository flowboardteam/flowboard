"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import NotificationModal from "@/components/ui/NotificationModal";
import {
  ArrowRight,
  ShieldCheck,
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Link, useNavigate } from "react-router-dom";

export default function ClientLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [notification, setNotification] = useState<{
    open: boolean;
    type: "success" | "error";
    title: string;
    description?: string;
  }>({
    open: false,
    type: "success",
    title: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
      document.getElementById('password')?.focus();
    }
  }, []);

  // Check for pending invitation after successful login
  useEffect(() => {
    const checkPendingInvite = async () => {
      const pendingToken = localStorage.getItem("pendingInviteToken");
      const pendingEmail = localStorage.getItem("pendingInviteEmail");
      
      if (pendingToken && window.location.pathname === "/client/login") {
        // Handled by handleLogin
      }
    };
    checkPendingInvite();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setNotification({
        open: true,
        type: "error",
        title: "Access Denied",
        description: error.message,
      });
      setIsLoading(false);
    } else if (data.session) {
      setNotification({
        open: true,
        type: "success",
        title: "Welcome back!",
        description: "Opening the Client Command Center...",
      });

      const pendingToken = localStorage.getItem("pendingInviteToken");
      const intendedRedirect = localStorage.getItem("intended_redirect");

      // Safelist of paths that should NOT be used as post-login redirects
      const invalidRedirects = ["/", "/login", "/client/login", "/talent/login", "/client/signup", "/talent/signup"];
      const isValidRedirect = (path: string | null): boolean =>
        !!path && !invalidRedirects.includes(path) && !path.startsWith("/login") && !path.startsWith("/auth");

      let defaultRedirect = "/client/dashboard";
      if (pendingToken) {
        defaultRedirect = `/invite/${pendingToken}`;
      } else if (isValidRedirect(intendedRedirect)) {
        defaultRedirect = intendedRedirect!;
        localStorage.removeItem("intended_redirect");
      } else if (intendedRedirect) {
        // Clear bad redirect values
        localStorage.removeItem("intended_redirect");
      }

      setTimeout(() => navigate(defaultRedirect, { replace: true }), 1000);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    localStorage.setItem("intended_role", "client");
    
    const pendingToken = localStorage.getItem("pendingInviteToken");
    const intendedRedirect = localStorage.getItem("intended_redirect");
    let redirect = "/client/dashboard";
    if (pendingToken) {
      redirect = `/invite/${pendingToken}`;
    } else if (intendedRedirect) {
      redirect = intendedRedirect;
    }

    localStorage.setItem("intended_redirect", redirect);
    const callbackRedirectUrl = `${window.location.origin}/login/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackRedirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      setNotification({
        open: true,
        type: "error",
        title: "Social Login Failed",
        description: error.message,
      });
    }
  };

  return (
    <>
      <div className="min-h-screen grid lg:grid-cols-2 font-jakarta bg-white overflow-x-hidden">
        {/* --- LEFT SIDE: Client Branding (Premium Image Background) --- */}
        <div className="hidden lg:flex flex-col justify-between p-16 text-white relative overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/clientloginimage.jpg" 
              className="w-full h-full object-cover grayscale-[0.2] contrast-[1.1]" 
              alt="Professional Background" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1229] via-[#0A1229]/60 to-transparent" />
            <div className="absolute inset-0 bg-indigo-900/10 mix-blend-multiply" />
          </div>
          
          <div className="relative z-10">
            <a href="https://flowboard.team" className="flex items-center gap-2.5 mb-20 group">
              <div className="relative flex items-center justify-center w-7 h-7 md:w-8 md:h-8 shrink-0">
                <img
                  src="/flowboardlogo.png"
                  alt="Flowboard Logo"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-baseline">
                Flowboard{" "}
                <span className="font-semibold text-sm md:text-base opacity-80 ml-1">
                  Team
                </span>
              </span>
            </a>
 
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-5xl lg:text-6xl font-light leading-[1.05] mb-8 tracking-tight">
                Manage your <br />
                <span className="text-white font-normal">entire workforce.</span>
              </h2>
              <div className="flex items-center gap-4 text-white/80">
                <div className="w-10 h-10 rounded-none bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <p className="text-lg font-medium tracking-tight text-white/90">
                  Secure access to your hiring and people management suite.
                </p>
              </div>
            </motion.div>
          </div>
 
          <div className="relative z-10 p-10 bg-black/40 backdrop-blur-xl rounded-none border border-white/10 max-w-lg">
             <div className="mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="text-xs text-amber-400 mr-0.5">★</span>
                ))}
             </div>
            <p className="text-lg text-white font-medium leading-relaxed tracking-tight mb-6">
              "Centralizing our hiring process through Flowboard saved us over 40 hours of technical screening per month."
            </p>
            <div>
               <p className="text-sm font-medium text-white/90">Head of engineering, Nozolio Labs Inc.</p>
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDE: Login Form --- */}
        <div className="flex flex-col justify-center px-6 py-12 lg:px-24 bg-white relative">
          <div className="absolute top-8 right-8 text-sm font-medium text-slate-500">
            Need an account?{" "}
            <Link to="/client/signup" className="text-slate-900 font-bold hover:text-indigo-700 ml-1">
              Join as Business
            </Link>
          </div>

          <div className="max-w-[400px] mx-auto w-full">
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-3xl lg:text-4xl font-light text-slate-900 mb-2 tracking-tight">Client Login</h1>
              <p className="text-slate-500 font-medium text-sm">Welcome back. Sign in to your Flowboard workspace.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-medium text-xs tracking-wide ml-1" htmlFor="email">Corporate Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="h-12 pl-11 rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white transition-all shadow-sm outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-slate-700 font-medium text-xs tracking-wide ml-1" htmlFor="password">Password</Label>
                  <Link to="/client/forgot-password" size="sm" className="text-xs font-medium text-slate-500 hover:text-slate-900 hover:underline">Forgot Password?</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 pl-11 pr-11 rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white transition-all shadow-sm outline-none"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit"
                className="w-full h-12 bg-[#A079FF] hover:bg-[#9165f7] active:bg-[#8050ee] text-white font-medium rounded-lg shadow-md shadow-[#A079FF]/20 gap-2 transition-all transform active:scale-[0.98]" 
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ArrowRight size={18} /></>}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
              <div className="relative flex justify-center text-xs text-slate-400 font-normal"><span className="bg-white px-3">or continue with</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => handleSocialLogin("google")} variant="outline" className="h-11 border-slate-200 rounded-lg font-medium text-sm text-slate-700 hover:bg-slate-50 shadow-sm transition-all flex items-center justify-center">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4 mr-2" alt="G" /> Google
              </Button>
              <Button onClick={() => handleSocialLogin("github")} variant="outline" className="h-11 border-slate-200 rounded-lg font-medium text-sm text-slate-700 hover:bg-slate-50 shadow-sm transition-all flex items-center justify-center">
                <img src="https://www.svgrepo.com/show/512317/github-142.svg" className="w-4 h-4 mr-2" alt="GH" /> GitHub
              </Button>
            </div>
          </div>
        </div>
      </div>

      <NotificationModal
        open={notification.open}
        type={notification.type}
        title={notification.title}
        description={notification.description}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
}