"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { SignIn } from "@clerk/clerk-react";

export default function Login() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 font-jakarta bg-white overflow-x-hidden">
      {/* --- LEFT SIDE: Talent Branding --- */}
      <div className="hidden lg:flex flex-col justify-center p-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/talentlogin.jpg"
            className="w-full h-full object-cover grayscale-[0.2] contrast-[1.1]"
            alt="Global Talent"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050B1E] via-[#050B1E]/60 to-transparent" />
          <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply" />
        </div>

        <div className="absolute top-12 lg:top-16 left-12 lg:left-16 z-10">
          <a href="https://flowboard.team" className="flex items-center gap-2.5 group">
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
        </div>

        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold tracking-widest uppercase mb-6">
              Flowboard Talent Cloud
            </div>
            <h2 className="text-5xl lg:text-6xl font-light leading-[1.05] mb-8 tracking-tight text-white">
              Get Discovered by <br />
              <span className="text-white font-normal">Global Companies.</span>
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

      {/* --- RIGHT SIDE: Clerk Sign In Component --- */}
      <div className="flex flex-col justify-center items-center px-6 py-12 lg:px-24 bg-white relative">
        <SignIn
          path="/talent/login"
          routing="path"
          signUpUrl="/talent/signup"
          forceRedirectUrl="/talent/dashboard"
        />
      </div>
    </div>
  );
}