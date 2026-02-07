"use client";

import { useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
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
  Rocket,
  ShieldCheck,
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
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      // Use window.location.origin to support both local and prod automatically
      redirectTo: `${window.location.origin}/talent/dashboard`,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  });
  if (error) console.error("Social Auth Error:", error.message);
};

  const handleDuplicateRedirect = () => {
    navigate(`/talent/login?email=${encodeURIComponent(email)}`);
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
          emailRedirectTo: `${window.location.origin}/talent/dashboard`,
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
      <div className="min-h-screen grid lg:grid-cols-2 font-sans bg-white overflow-x-hidden">
        {/* LEFT SIDE: Brand Experience */}
        <div className="hidden lg:flex flex-col justify-between bg-[#050B1E] p-16 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full -mr-48 -mt-48" />
          
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2 mb-20 group">
              <img src="/flowboardlogo.png" alt="Logo" className="w-10 h-10 object-contain" />
              <span className="text-2xl font-black tracking-tighter uppercase italic">FLOWBOARD</span>
            </Link>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-5xl font-extrabold leading-[1.1] mb-8 tracking-tight">
                Join the global <br />
                <span className="text-blue-400 text-6xl">AI Talent Cloud.</span>
              </h2>

              <div className="space-y-6">
                {[
                  { text: "Access exclusive high-ticket AI roles", icon: Sparkles },
                  { text: "Automated profile matching with Top Orgs", icon: Zap },
                  { text: "Secure payments & contract compliance", icon: ShieldCheck },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-4 group">
                    <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-gray-300 text-lg font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="relative z-10 p-8 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10">
            <p className="text-lg text-blue-100/90 leading-relaxed mb-6 font-medium italic">
              "Flowboard isn't just a job board; it's a career accelerator for engineers in the AI era."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold">AK</div>
              <div>
                <p className="font-bold text-white">Amara K.</p>
                <p className="text-sm text-blue-400/80 font-medium font-mono">Senior AI Engineer</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Signup Form */}
        <div className="flex flex-col justify-center px-6 py-12 lg:px-24 bg-white relative">
          <div className="absolute top-8 right-8 text-sm font-medium text-slate-500">
            Already have an account? <Link to="/talent/login" className="text-blue-600 font-bold hover:text-blue-700 ml-1">Log in</Link>
          </div>

          <div className="max-w-[420px] mx-auto w-full">
            <div className="mb-10 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-4">
                <Rocket size={12} /> Talent Registration
              </div>
              <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">Get Started</h1>
              <p className="text-slate-500 font-medium">Apply to join the Flowboard talent network.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <Button variant="outline" onClick={() => handleSocialLogin("google")} className="h-12 border-slate-200 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4 mr-2" alt="G" /> Google
              </Button>
              <Button variant="outline" onClick={() => handleSocialLogin("github")} className="h-12 border-slate-200 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all">
                <img src="https://www.svgrepo.com/show/512317/github-142.svg" className="w-4 h-4 mr-2" alt="GH" /> GitHub
              </Button>
            </div>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
              <div className="relative flex justify-center text-[10px] uppercase text-slate-400 font-black tracking-widest"><span className="bg-white px-4">Work Email Signup</span></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider" htmlFor="name">Full Name</Label>
                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all shadow-sm outline-none" required />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider" htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@email.com" className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all shadow-sm outline-none" required />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">Password</Label>
                <div className="relative group">
                  <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-12 pr-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all shadow-sm outline-none" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                {/* --- Password Requirements Checklist --- */}
                {password && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-100 shadow-inner mt-2"
                  >
                    <div className="flex gap-1 h-1.5 mb-3">
                      {[1, 2, 3, 4].map((step) => (
                        <div key={step} className={`h-full flex-1 rounded-full transition-colors duration-500 ${passwordScore >= step ? strengthColors[passwordScore] : "bg-slate-200"}`} />
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

              <div className="flex items-start space-x-3 py-2">
                <Checkbox id="terms" checked={agreed} onCheckedChange={(checked) => setAgreed(checked as boolean)} className="mt-1 border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                <Label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed cursor-pointer select-none">
                  By signing up, I agree to the <a href="/terms" className="text-blue-600 font-bold hover:underline">Terms of Service</a> and <a href="/privacy" className="text-blue-600 font-bold hover:underline">Privacy Policy</a>.
                </Label>
              </div>

              <Button 
                className="w-full h-14 bg-[#050B1E] hover:bg-blue-700 text-white font-black rounded-xl shadow-xl shadow-blue-900/10 gap-2 transition-all transform active:scale-[0.98]" 
                disabled={isLoading || !agreed || !isPasswordValid}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight size={18} /></>}
              </Button>
            </form>
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