"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  ShieldCheck,
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const email = (document.getElementById("email") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement)
      .value;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Authentication Failed", {
        description: error.message,
      });
      setIsLoading(false);
    } else {
      toast.success("Welcome back!", {
        description: "Redirecting to your dashboard...",
      });
      // Delay slightly so they can see the success toast
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 font-sans bg-white overflow-x-hidden">
      {/* --- LEFT SIDE: Branding --- */}
      <div className="hidden lg:flex flex-col justify-between bg-[#050B1E] p-16 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full -ml-32 -mb-32" />

        <div className="relative z-10">
          <a href="/" className="flex items-center gap-2 mb-20 group">
            <div className="relative w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-bold tracking-tight uppercase italic">
              Flowboard-Team
            </span>
          </a>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-5xl font-extrabold leading-[1.1] mb-8 tracking-tight">
              Welcome back to <br />
              <span className="text-blue-400">the future of work.</span>
            </h2>
            <div className="flex items-center gap-4 text-slate-400">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-lg font-medium">
                Secure, encrypted access to your dashboard.
              </p>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 text-slate-500 text-sm font-medium italic">
          "The fastest way to hire AI talent, period." — Flowboard Engineering
        </div>
      </div>

      {/* --- RIGHT SIDE: Login Form --- */}
      <div className="flex flex-col justify-center px-6 py-12 lg:px-24 bg-white relative">
        <div className="absolute top-8 right-8 text-sm font-medium text-slate-500">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="text-blue-600 font-bold hover:text-blue-700 ml-1 transition-colors"
          >
            Sign up
          </a>
        </div>

        <div className="max-w-[400px] mx-auto w-full">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
              Login
            </h1>
            <p className="text-slate-500 font-medium">
              Enter your credentials to access Flowboard.
            </p>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Button
              onClick={() => handleSocialLogin("google")}
              variant="outline"
              className="h-12 border-slate-200 hover:bg-slate-50 flex items-center gap-2 font-semibold rounded-xl transition-all"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                className="w-4 h-4"
                alt="Google"
              />
              Google
            </Button>
            <Button
              onClick={() => handleSocialLogin("github")}
              variant="outline"
              className="h-12 border-slate-200 hover:bg-slate-50 flex items-center gap-2 font-semibold rounded-xl transition-all"
            >
              <img
                src="https://www.svgrepo.com/show/512317/github-142.svg"
                className="w-4 h-4"
                alt="GitHub"
              />
              GitHub
            </Button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">
                Or with email
              </span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold ml-1" htmlFor="email">
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@email.com"
                  className="h-12 pl-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label
                  className="text-slate-700 font-bold ml-1"
                  htmlFor="password"
                >
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-12 pl-11 pr-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                  required
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
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 mt-2 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400 font-medium tracking-wide uppercase">
            &copy; 2025 Flowboard-Team
          </p>
        </div>
      </div>
    </div>
  );
}