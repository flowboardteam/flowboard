"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import NotificationModal from "@/components/ui/NotificationModal";

import {
  Building2,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  Briefcase,
  Globe,
  Users,
  Check,
  X
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function ClientSignUp() {
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

  // Password Requirements Logic
  const requirements = [
    { label: "At least 8 characters", test: password.length >= 8 },
    { label: "Contains a number", test: /[0-9]/.test(password) },
    { label: "Contains a capital letter", test: /[A-Z]/.test(password) },
    { label: "Special character", test: /[^A-Za-z0-9]/.test(password) },
  ];

  const passwordScore = requirements.filter(r => r.test).length;
  const isPasswordValid = requirements.every(r => r.test);
  const strengthColors = ["bg-slate-200", "bg-rose-500", "bg-orange-400", "bg-amber-400", "bg-indigo-500"];

  const handleSocialLogin = async (provider: "google" | "github") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        // Redirecting specifically to Client Onboarding
        redirectTo: `${window.location.origin}/client/onboarding`,
        queryParams: { access_type: 'offline', prompt: 'select_account' },
      },
    });
    if (error) console.error("Social Auth Error:", error.message);
  };

  const handleDuplicateRedirect = () => {
    navigate(`/client/login?email=${encodeURIComponent(email)}`);
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!agreed || !isPasswordValid) return;

  setIsLoading(true);

  try {
    // 1. CHECK IF EMAIL EXISTS IN PROFILES
    const { data: existingUser, error: fetchError } = await supabase
      .from('profiles')
      .select('id, role_type') // Grab role_type to make the message specific
      .eq('email', email.trim())
      .maybeSingle();

    if (existingUser) {
      setNotification({
        open: true,
        type: "error",
        title: "Account Already Exists",
        description: existingUser.role_type === 'talent' 
          ? "This email is registered as a Talent. Please use a different email for your Client account."
          : "You already have a Partner account. Log in to access your dashboard.",
        primaryAction: "Login Now",
        onPrimaryClick: handleDuplicateRedirect 
      });
      setIsLoading(false);
      return; // STOP the signup
    }

    // 2. IF CLEAR, PROCEED WITH SIGNUP
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName,
          role_type: "client",
          email: email.trim(), // Storing email in metadata makes checks easier
        },
        emailRedirectTo: `${window.location.origin}/client/onboarding`,
      },
    });

    if (authError) throw authError;

    setNotification({
      open: true,
      type: "success",
      title: "Verification Sent",
      description: "Check your corporate email for the activation link.",
    });
    
  } catch (error: any) {
    setNotification({
      open: true,
      type: "error",
      title: "Registration Failed",
      description: error.message,
    });
  } finally {
    setIsLoading(false);
  }
};
  return (
    <>
      <div className="min-h-screen grid lg:grid-cols-2 font-jakarta bg-white overflow-x-hidden">
        {/* LEFT SIDE: Brand Experience (Hiring Focused) */}
        <div className="hidden lg:flex flex-col justify-between p-16 text-white relative overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/clientloginimage.jpg" 
              className="w-full h-full object-cover grayscale-[0.1] contrast-[1.05]" 
              alt="Hiring Professional" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1229] via-[#0A1229]/60 to-transparent" />
            <div className="absolute inset-0 bg-indigo-900/10 mix-blend-multiply" />
          </div>
          
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2 mb-20 group">
              <img src="/flowboardlogo.png" alt="Logo" className="w-10 h-10 object-contain" />
              <span className="text-2xl font-black tracking-tighter text-white">Flowboard</span>
            </Link>
 
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold tracking-widest uppercase mb-6">
                <Users size={12} /> Elite Talent Cloud
              </div>
              <h2 className="text-6xl font-black leading-[1.05] mb-10 tracking-tighter text-white">
                Hire top <br />
                <span className="font-serif font-medium">AI Engineer.</span>
              </h2>
 
              <div className="space-y-6">
                {[
                  { text: "Vetted AI Specialists & LLM Experts", icon: CheckCircle2 },
                  { text: "Seamless contract & payroll management", icon: CheckCircle2 },
                  { text: "Scale your engineering team in days", icon: CheckCircle2 },
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
             <div className="mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                   <span key={s} className="text-[10px] text-amber-400 mr-0.5">★</span>
                ))}
             </div>
            <p className="text-base text-white font-medium leading-relaxed tracking-tight mb-6">
              "Flowboard is the first platform that actually understands the specific technical needs of startups."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-none bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg text-sm">JD</div>
              <div>
                <p className="font-bold text-white tracking-tight text-sm">James D.</p>
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest font-jakarta">CTO, NEURALSYNC</p>
              </div>
            </div>
          </div>
        </div>
 
        {/* RIGHT SIDE: Signup Form */}
        <div className="flex flex-col justify-center px-6 py-12 lg:px-24 bg-white relative">
          <div className="absolute top-8 right-8 text-sm font-medium text-slate-500">
            Need to hire? <Link to="/client/login" className="text-indigo-600 font-bold hover:text-indigo-700 ml-1">Log in</Link>
          </div>
 
          <div className="max-w-[420px] mx-auto w-full">
            <div className="mb-10 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4">
                <Building2 size={12} /> Business Signup
              </div>
              <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">Join as a Client</h1>
              <p className="text-slate-500 font-medium">Access the world's most elite AI talent pool.</p>
            </div>
 
            <div className="grid grid-cols-2 gap-4 mb-8">
              <Button variant="outline" onClick={() => handleSocialLogin("google")} className="h-12 border-slate-200 rounded-none font-bold hover:bg-slate-50">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4 mr-2" alt="G" /> Google
              </Button>
              <Button variant="outline" onClick={() => handleSocialLogin("github")} className="h-12 border-slate-200 rounded-none font-bold hover:bg-slate-50">
                <img src="https://www.svgrepo.com/show/512317/github-142.svg" className="w-4 h-4 mr-2" alt="GH" /> GitHub
              </Button>
            </div>
 
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
              <div className="relative flex justify-center text-[10px] uppercase text-slate-400 font-black tracking-widest"><span className="bg-white px-4">Corporate Email Signup</span></div>
            </div>
 
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">Hiring Manager Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your name" className="h-12 rounded-none border-slate-200 shadow-sm outline-none" required />
              </div>
 
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">Work Email Address</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="h-12 rounded-none border-slate-200 shadow-sm outline-none" required />
              </div>
 
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">Create Password</Label>
                <div className="relative group">
                  <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-12 pr-12 rounded-none border-slate-200 shadow-sm outline-none" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                {password && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-slate-50 rounded-none border border-slate-100 mt-2">
                    <div className="flex gap-1 h-1 mb-3">
                      {[1, 2, 3, 4].map((step) => (
                        <div key={step} className={`h-full flex-1 rounded-none transition-colors ${passwordScore >= step ? strengthColors[passwordScore] : "bg-slate-200"}`} />
                      ))}
                    </div>
                    {requirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-2 text-[10px] font-bold uppercase">
                        {req.test ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-slate-300" />}
                        <span className={req.test ? "text-emerald-600" : "text-slate-400"}>{req.label}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
 
              <div className="flex items-start space-x-3 py-2">
                <Checkbox id="terms" checked={agreed} onCheckedChange={(checked) => setAgreed(checked as boolean)} className="data-[state=checked]:bg-indigo-600 border-slate-300" />
                <Label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed cursor-pointer select-none">
                  By signing up, I agree to the <a href="/terms" className="text-indigo-600 font-bold hover:underline">Terms of Service</a>.
                </Label>
              </div>
 
              <Button className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-none shadow-xl shadow-indigo-900/10 gap-2 transition-all" disabled={isLoading || !agreed || !isPasswordValid}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Business Account <ArrowRight size={18} /></>}
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
      />
    </>
  );
}