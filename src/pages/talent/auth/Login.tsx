"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 font-jakarta bg-white overflow-x-hidden">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex flex-col p-16 text-white relative overflow-hidden">
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
            <span className="text-2xl font-black tracking-tighter">Flowboard</span>
          </a>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold tracking-widest uppercase mb-6">
              Flowboard Talent Cloud
            </div>
            <h2 className="text-6xl font-black leading-[1.05] mb-8 tracking-tighter text-white">
              Your global corporate <br />
              <span className="text-white">journey starts here.</span>
            </h2>
            <div className="flex items-center gap-4 text-white/80">
              <div className="w-10 h-10 rounded-none bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <p className="text-lg font-medium tracking-tight">
                Your profile is protected by enterprise-grade security.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-col justify-center px-6 py-12 lg:px-24 bg-white relative">
        <div className="absolute top-8 right-8 text-sm font-medium text-slate-500">
          Not on the list yet?{" "}
          <Link to="/talent/signup" className="text-blue-600 font-bold hover:text-blue-700 ml-1">Join Waitlist</Link>
        </div>

        <div className="max-w-[400px] mx-auto w-full text-center lg:text-left">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

            <div className="w-16 h-16 rounded-none bg-blue-50 flex items-center justify-center mb-8 mx-auto lg:mx-0">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-6">
              Talent Portal
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
                <span className="text-slate-400 text-xs block mt-1">Talent login will be available once we reach out to you directly.</span>
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                to="/talent/signup"
                className="w-full h-14 bg-[#050B1E] hover:bg-blue-700 text-white font-black rounded-none shadow-xl gap-2 transition-all flex items-center justify-center"
              >
                Join the Waitlist <ArrowRight size={18} className="ml-2" />
              </Link>

              <p className="text-center text-xs text-slate-400 pt-2">
                Looking to hire talent instead?{" "}
                <Link to="/client/login" className="text-blue-600 font-bold hover:underline">Client Login</Link>
              </p>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}