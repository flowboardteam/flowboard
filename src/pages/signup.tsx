"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Zap,
  CheckCircle2,
  ArrowRight,
  Globe,
  ShieldCheck,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

export default function SignUp() {
  const [role, setRole] = useState<"recruiter" | "talent">("recruiter");
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      toast.error("Terms of Service", {
        description: "Please agree to the terms to continue.",
      });
      return;
    }

    setIsLoading(true);

    const email = (document.getElementById("email") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement)
      .value;
    const nameOrCompany =
      role === "recruiter"
        ? (document.getElementById("company") as HTMLInputElement).value
        : (document.getElementById("fullname") as HTMLInputElement).value;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: nameOrCompany,
          user_type: role,
        },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast.error("Registration Failed", {
        description: error.message,
      });
      setIsLoading(false);
    } else {
      toast.success("Account created successfully!", {
        description: "Please check your email for the confirmation link.",
      });
      setTimeout(() => setIsLoading(false), 2000);
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
      {/* --- LEFT SIDE: Brand Experience --- */}
      <div className="hidden lg:flex flex-col justify-between bg-[#050B1E] p-16 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full -ml-32 -mb-32" />

        <div className="relative z-10">
          <a href="/" className="flex items-center gap-2 mb-20 group">
            <div className="relative w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <img
                src="/logo.png"
                alt="Flowboard Logo"
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>
            <span className="text-2xl font-bold tracking-tight uppercase italic">
              Flowboard-Team
            </span>
          </a>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl font-extrabold leading-[1.1] mb-8 tracking-tight">
              Bridge the <span className="text-blue-400">skill gap</span> <br />
              with global AI talent.
            </h2>

            <div className="space-y-5">
              {[
                { text: "Pre-vetted engineering pool", icon: ShieldCheck },
                { text: "Contextual semantic search", icon: Zap },
                { text: "Risk-free replacement model", icon: Globe },
              ].map((item, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  key={item.text}
                  className="flex items-center gap-4 group"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-gray-300 text-lg font-medium group-hover:text-white transition-colors">
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative z-10 p-8 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl"
        >
          <p className="text-lg text-blue-100/90 leading-relaxed mb-6 font-medium italic">
            "Flowboard eliminated the friction in our hiring cycle. We found our
            lead AI researcher in days, not months."
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold">
              JD
            </div>
            <div>
              <p className="font-bold text-white text-base">James Dunbar</p>
              <p className="text-sm text-blue-400/80 font-medium">
                Head of Talent @ SnappyCX
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- RIGHT SIDE: Signup Form --- */}
      <div className="flex flex-col justify-center px-6 py-12 lg:px-24 bg-white relative">
        <div className="absolute top-8 right-8 text-sm font-medium text-slate-500">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-blue-600 font-bold hover:text-blue-700 ml-1 transition-colors"
          >
            Log in
          </a>
        </div>

        <div className="max-w-[440px] mx-auto w-full mt-8 lg:mt-0">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
              Create Account
            </h1>
            <p className="text-slate-500 font-medium">
              Join Flowboard-Team to start your journey.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <Button
              variant="outline"
              onClick={() => handleSocialLogin("google")}
              className="h-12 border-slate-200 hover:bg-slate-50 flex items-center gap-2 font-semibold rounded-xl"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
              Google
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialLogin("github")}
              className="h-12 border-slate-200 hover:bg-slate-50 flex items-center gap-2 font-semibold rounded-xl"
            >
              <img src="https://www.svgrepo.com/show/512317/github-142.svg" className="w-4 h-4" alt="GitHub" />
              GitHub
            </Button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase text-slate-400 font-bold tracking-widest">
              <span className="bg-white px-4">Or with email</span>
            </div>
          </div>

          <div className="relative flex p-1.5 bg-slate-100 rounded-2xl mb-8">
            <div
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-in-out ${
                role === "talent" ? "translate-x-full" : "translate-x-0"
              }`}
            />
            <button
              onClick={() => setRole("recruiter")}
              className={`relative z-10 flex-1 py-3 text-sm font-bold transition-colors ${
                role === "recruiter" ? "text-blue-600" : "text-slate-500"
              }`}
            >
              Hiring Company
            </button>
            <button
              onClick={() => setRole("talent")}
              className={`relative z-10 flex-1 py-3 text-sm font-bold transition-colors ${
                role === "talent" ? "text-blue-600" : "text-slate-500"
              }`}
            >
              Apply as Talent
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {role === "recruiter" ? (
                <motion.div
                  key="recruiter"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  <Label className="text-slate-700 font-bold" htmlFor="company">
                    Company Name
                  </Label>
                  <Input
                    id="company"
                    placeholder="e.g. Nexus AI Labs"
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all outline-none"
                    required
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="talent"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  <Label
                    className="text-slate-700 font-bold"
                    htmlFor="fullname"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="fullname"
                    placeholder="John Doe"
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all outline-none"
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label className="text-slate-700 font-bold" htmlFor="email">
                Work Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@email.com"
                className="h-12 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-bold" htmlFor="password">
                Password
              </Label>
              <div className="relative group">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-12 pr-12 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all outline-none"
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

            <div className="flex items-start space-x-3 pt-2">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
                className="mt-1 border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <Label
                htmlFor="terms"
                className="text-sm text-slate-500 leading-relaxed cursor-pointer select-none"
              >
                I agree to the{" "}
                <a
                  href="/terms"
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Privacy Policy
                </a>
                .
              </Label>
            </div>

            <Button
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/10 mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isLoading || !agreed}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Create Free Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400 font-medium tracking-wide">
            FLOWBOARD-TEAM &copy; 2025. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </div>
  );
}