"use client";

import { useState, useMemo } from "react";
import { supabase, getSiteUrl } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import NotificationModal from "@/components/ui/NotificationModal";

import {
  Zap,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Users,
  Check,
  X
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function TalentSignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [notification, setNotification] = useState<{
    open: boolean;
    type: "success" | "error";
    title: string;
    description?: string;
    primaryAction?: string;
    onPrimaryClick?: () => void;
  }>({
    open: false,
    type: "success",
    title: "",
  });

  // --- NEW: Password Requirements Logic ---
  const requirements = [
    { label: "At least 8 characters", test: password.length >= 8 },
    { label: "Contains a number", test: /[0-9]/.test(password) },
    { label: "Contains a capital letter", test: /[A-Z]/.test(password) },
    { label: "Special character", test: /[^A-Za-z0-9]/.test(password) },
  ];

  const passwordScore = requirements.filter(r => r.test).length;
  const isPasswordValid = requirements.every(r => r.test);

  const strengthColors = ["bg-slate-200", "bg-rose-500", "bg-orange-400", "bg-amber-400", "bg-emerald-500"];

  const handleSocialLogin = async (provider: "google" | "github") => {
    localStorage.setItem("intended_role", "talent");
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}${redirect || "/talent/dashboard"}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });
    if (error) console.error("Social Auth Error:", error.message);
  };

  const handleDuplicateRedirect = () => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    const redirectQuery = redirect ? `&redirect=${encodeURIComponent(redirect)}` : "";
    navigate(`/talent/login?email=${encodeURIComponent(email)}${redirectQuery}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed || !isPasswordValid) return;

    setIsLoading(true);

    try {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim())
        .maybeSingle();

      if (existingUser) {
        setNotification({
          open: true,
          type: "error",
          title: "Account Already Exists",
          description: "You've already joined the cloud! Sign in to access your dashboard.",
          primaryAction: "Login Now",
          onPrimaryClick: handleDuplicateRedirect 
        });
        setIsLoading(false);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName,
            role_type: "talent",
          },
          emailRedirectTo: `${getSiteUrl()}/talent/dashboard`,
        },
      });

      if (authError) throw authError;

      if (authData?.user && authData.user.identities?.length === 0) {
        setNotification({
          open: true,
          type: "error",
          title: "Account Pending",
          description: "This email is already registered. Try logging in or resetting your password.",
        });
      } else {
        setNotification({
          open: true,
          type: "success",
          title: "Verification Sent",
          description: "Check your email for the activation link to join the Talent Cloud.",
        });
        
        setEmail("");
        setPassword("");
        setFullName("");
      }
    } catch (error: any) {
      setNotification({
        open: true,
        type: "error",
        title: "Registration Failed",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen grid lg:grid-cols-2 font-jakarta bg-white overflow-x-hidden">
        {/* LEFT SIDE: Brand Experience (Premium Image Background) */}
        <div className="hidden lg:flex flex-col justify-between p-16 text-white relative overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/talentlogin.jpg" 
              className="w-full h-full object-cover grayscale-[0.2] contrast-[1.1]" 
              alt="Global Talent" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050B1E] via-[#050B1E]/60 to-transparent" />
            <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply" />
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
 
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold tracking-widest uppercase mb-6">
                Flowboard Talent Cloud
              </div>
              <h2 className="text-5xl lg:text-6xl font-light leading-[1.05] mb-10 tracking-tight text-white">
                Join the global <br />
                <span className="text-white font-normal">Talent Cloud.</span>
              </h2>
 
              <div className="space-y-6">
                {[
                  { text: "Access exclusive high-ticket roles", icon: CheckCircle2 },
                  { text: "Automated profile matching with Top Orgs", icon: CheckCircle2 },
                  { text: "Secure payments & contract compliance", icon: CheckCircle2 },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-none bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white/90 text-lg font-medium tracking-tight">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
 
          <div className="relative z-10 p-8 bg-black/40 backdrop-blur-xl rounded-none border border-white/10 max-w-md mt-12">
            <p className="text-lg text-white font-medium leading-relaxed tracking-tight mb-8">
              "Flowboard isn't just a job board; it's a career accelerator for tech engineers and professional working in the tech space."
            </p>
            <div>
              <p className="font-bold text-white tracking-tight">Amara K.</p>
              <p className="text-xs text-blue-300 font-medium">Senior DevOps engineer</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Signup Form */}
        <div className="flex flex-col justify-center px-6 py-12 lg:px-24 bg-white relative">
          <div className="absolute top-8 right-8 text-sm font-medium text-slate-500">
            Already have an account? <Link to="/talent/login" className="text-blue-600 font-bold hover:text-blue-700 ml-1">Log in</Link>
          </div>

          <div className="max-w-[420px] mx-auto w-full">
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-3xl lg:text-4xl font-light text-slate-900 mb-2 tracking-tight">Get Started</h1>
              <p className="text-slate-500 font-medium text-sm">Get paid to work on global projects.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-medium text-xs tracking-wide ml-1" htmlFor="name">Full Name</Label>
                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" className="h-11 rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white transition-all shadow-sm outline-none" required />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 font-medium text-xs tracking-wide ml-1" htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@email.com" className="h-11 rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white transition-all shadow-sm outline-none" required />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 font-medium text-xs tracking-wide ml-1">Password</Label>
                <div className="relative group">
                  <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-11 pr-11 rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white transition-all shadow-sm outline-none" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                {/* --- Password Requirements Checklist --- */}
                {password && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-100 shadow-inner mt-2"
                  >
                    <div className="flex gap-1 h-1 mb-2.5">
                      {[1, 2, 3, 4].map((step) => (
                        <div key={step} className={`h-full flex-1 rounded-sm transition-colors duration-500 ${passwordScore >= step ? strengthColors[passwordScore] : "bg-slate-200"}`} />
                      ))}
                    </div>
                    {requirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tight">
                        {req.test ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-slate-300" />}
                        <span className={req.test ? "text-emerald-600" : "text-slate-400"}>{req.label}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>

              <div className="flex items-start space-x-3 py-1">
                <Checkbox id="terms" checked={agreed} onCheckedChange={(checked) => setAgreed(checked as boolean)} className="mt-0.5 border-slate-300 data-[state=checked]:bg-[#A079FF] data-[state=checked]:border-[#A079FF]" />
                <Label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed cursor-pointer select-none">
                  By signing up, I agree to the <a href="/terms" className="text-slate-900 font-bold hover:underline">Terms of Service</a> and <a href="/privacy" className="text-slate-900 font-bold hover:underline">Privacy Policy</a>.
                </Label>
              </div>

              <Button 
                type="submit"
                className="w-full h-12 bg-[#A079FF] hover:bg-[#9165f7] active:bg-[#8050ee] text-white font-medium rounded-lg shadow-md shadow-[#A079FF]/20 gap-2 transition-all transform active:scale-[0.98]" 
                disabled={isLoading || !agreed || !isPasswordValid}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight size={18} /></>}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
              <div className="relative flex justify-center text-xs text-slate-400 font-normal"><span className="bg-white px-3">or continue with</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => handleSocialLogin("google")} className="h-11 border-slate-200 rounded-lg font-medium text-sm text-slate-700 shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4 mr-2" alt="G" /> Google
              </Button>
              <Button variant="outline" onClick={() => handleSocialLogin("github")} className="h-11 border-slate-200 rounded-lg font-medium text-sm text-slate-700 shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center">
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
        description={notification.description || ""} 
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
        primaryAction={notification.primaryAction}
        onPrimaryClick={notification.onPrimaryClick}
      />
    </>
  );
}