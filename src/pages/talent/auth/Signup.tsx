"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, ArrowRight, Loader2, CheckCircle2, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function TalentSignUp() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { error: insertError } = await supabase
      .from("waitlist")
      .insert({
        full_name: fullName.trim(),
        email: email.trim(),
        role_type: "talent",
      });

    if (insertError) {
      if (insertError.code === "23505") {
        setError("This email is already on the waitlist!");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setIsLoading(false);
      return;
    }

    setIsSuccess(true);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 font-jakarta bg-white overflow-x-hidden">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex flex-col justify-between p-16 text-white relative overflow-hidden">
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
          <a href="https://flowboard.team" className="flex items-center gap-2 mb-20 group">
            <img src="/flowboardlogo.png" alt="Logo" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-black tracking-tighter text-white">Flowboard</span>
          </a>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold tracking-widest uppercase mb-6">
              <Users size={12} /> Global Talent Cloud
            </div>
            <h2 className="text-6xl font-black leading-[1.05] mb-10 tracking-tighter text-white">
              Join the global <br />
              <span className="font-serif font-medium">Talent Cloud.</span>
            </h2>
            <div className="space-y-6">
              {[
                "Access exclusive high-ticket AI roles",
                "Automated profile matching with Top Orgs",
                "Secure payments & contract compliance",
              ].map((text) => (
                <div key={text} className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-none bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/90 text-lg font-medium tracking-tight">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 p-8 bg-black/40 backdrop-blur-xl rounded-none border border-white/10 max-w-md mt-12">
          <p className="text-lg text-white font-medium leading-relaxed tracking-tight mb-8">
            "Flowboard isn't just a job board; it's a career accelerator for tech engineers and professionals."
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-none bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/40">AK</div>
            <div>
              <p className="font-bold text-white tracking-tight">Amara K.</p>
              <p className="text-xs text-blue-300 font-bold uppercase tracking-widest">SENIOR AI ENGINEER</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-col justify-center px-6 py-12 lg:px-24 bg-white relative">
        <div className="absolute top-8 right-8 text-sm font-medium text-slate-500">
          Already have an account?{" "}
          <Link to="/talent/login" className="text-blue-600 font-bold hover:text-blue-700 ml-1">Log in</Link>
        </div>

        <div className="max-w-[420px] mx-auto w-full">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="mb-10 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-4">
                    <Rocket size={12} /> Talent Signup
                  </div>
                  <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">Join the Waitlist</h1>
                  <p className="text-slate-500 font-medium">Be first in line when we launch. We'll reach out personally.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">Full Name</Label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="h-12 rounded-none border-slate-200 shadow-sm outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">Email Address</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@email.com"
                      className="h-12 rounded-none border-slate-200 shadow-sm outline-none"
                      required
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-500 font-medium">{error}</p>
                  )}

                  <Button
                    className="w-full h-14 bg-[#050B1E] hover:bg-blue-700 text-white font-black rounded-none shadow-xl gap-2 transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Join Waitlist <ArrowRight size={18} /></>}
                  </Button>

                  <p className="text-center text-xs text-slate-400 pt-2">
                    Looking to hire talent instead?{" "}
                    <Link to="/client/signup" className="text-blue-600 font-bold hover:underline">Sign up as Client</Link>
                  </p>
                </form>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className="w-20 h-20 rounded-none bg-blue-50 flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">You're on the list!</h2>
                <p className="text-slate-500 font-medium mb-2">We've added <span className="font-bold text-slate-700">{email}</span> to our waitlist.</p>
                <p className="text-slate-400 text-sm">We'll reach out personally when Flowboard is ready for you.</p>
                <a href="https://flowboard.team" className="inline-block mt-10 text-sm font-bold text-blue-600 hover:underline">
                  ← Back to Flowboard
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}