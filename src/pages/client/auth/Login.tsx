"use client";

import { motion } from "framer-motion";
import { Building2, ShieldCheck, ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function ClientLogin() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 font-jakarta bg-white overflow-x-hidden">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex flex-col justify-between p-16 text-white relative overflow-hidden">
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
          <a href="https://flowboard.team" className="flex items-center gap-2 mb-20 group">
            <img src="/flowboardlogo.png" alt="Logo" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-black tracking-tighter">Flowboard</span>
          </a>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold tracking-widest uppercase mb-6">
              <Building2 size={12} /> Client Portal
            </div>
            <h2 className="text-6xl font-black leading-[1.05] mb-8 tracking-tighter">
              Manage your <br />
              <span className="text-white">entire workforce.</span>
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
          <div className="mb-4">{[1,2,3,4,5].map((s) => <span key={s} className="text-xs text-amber-400 mr-0.5">★</span>)}</div>
          <p className="text-lg text-white font-medium leading-relaxed tracking-tight mb-6">
            "Centralizing our hiring process through Flowboard saved us over 40 hours of technical screening per month."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-white/30" />
            <p className="text-xs font-bold text-white uppercase tracking-widest">— Head of Engineering, Nozolio Labs Inc.</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-col justify-center px-6 py-12 lg:px-24 bg-white relative">
        <div className="absolute top-8 right-8 text-sm font-medium text-slate-500">
          Not on the list yet?{" "}
          <Link to="/client/signup" className="text-indigo-600 font-bold hover:text-indigo-700 ml-1">Join Waitlist</Link>
        </div>

        <div className="max-w-[400px] mx-auto w-full text-center lg:text-left">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

            <div className="w-16 h-16 rounded-none bg-indigo-50 flex items-center justify-center mb-8 mx-auto lg:mx-0">
              <Clock className="w-8 h-8 text-indigo-600" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-6">
              <Building2 size={12} /> Client Portal
            </div>

            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">
              We're almost ready.
            </h1>

            <p className="text-slate-500 font-medium mb-6 leading-relaxed">
              Flowboard is currently in private beta. If you've joined our waitlist, we'll be reaching out to you personally very soon with your access details.
            </p>

            <div className="p-5 bg-slate-50 border border-slate-100 rounded-none mb-8">
              <p className="text-sm text-slate-600 font-medium">
                Already received your invite?{" "}
                <span className="text-slate-400 text-xs block mt-1">Client login will be available once we reach out to you directly.</span>
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                to="/client/signup"
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-none shadow-xl gap-2 transition-all flex items-center justify-center"
              >
                Join the Waitlist <ArrowRight size={18} className="ml-2" />
              </Link>

              <p className="text-center text-xs text-slate-400 pt-2">
                Looking to join as talent instead?{" "}
                <Link to="/talent/login" className="text-indigo-600 font-bold hover:underline">Talent Login</Link>
              </p>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}