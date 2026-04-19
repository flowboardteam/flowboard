"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, ShieldCheck, Zap, Terminal, CheckCircle2, Loader2 } from "lucide-react";

const STEPS = [
  { id: 1, label: "Initializing Handshake", icon: Terminal },
  { id: 2, label: "Encrypting Profile Matrix", icon: ShieldCheck },
  { id: 3, label: "Syncing with Flowboard HRM", icon: Zap },
  { id: 4, label: "Vetting Credentials", icon: Cpu },
];

export default function DeploymentTerminal({ isOpen, onComplete }: any) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen && currentStep < STEPS.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    } else if (currentStep === STEPS.length) {
      setTimeout(onComplete, 1000);
    }
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="absolute inset-0 bg-[#0B0E14]/95 backdrop-blur-xl" 
      />
      
        <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-lg bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-8 md:p-12 overflow-hidden"
      >
        {/* Animated Background Pulse */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-[var(--foreground)]">
            Deploying Mission Node
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">
            Protocol: Secure Handshake v2.0
          </p>
        </div>

        <div className="space-y-4">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;

            return (
              <div 
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                  isActive ? "bg-blue-500/5 border-blue-500/30" : 
                  isCompleted ? "bg-emerald-500/5 border-emerald-500/20 opacity-50" : 
                  "bg-white/5 border-transparent opacity-20"
                }`}
              >
                <div className={`${isCompleted ? "text-emerald-500" : isActive ? "text-blue-500" : "text-slate-400"}`}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className={`w-5 h-5 ${isActive ? "animate-pulse" : ""}`} />}
                </div>
                <span className={`text-xs font-black uppercase tracking-widest ${isActive ? "text-[var(--foreground)]" : "text-slate-500"}`}>
                  {step.label}
                </span>
                {isActive && (
                   <div className="ml-auto flex gap-1">
                      <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-blue-500 rounded-full" />
                      <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-blue-500 rounded-full" />
                      <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-blue-500 rounded-full" />
                   </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-[9px] text-blue-400/60 leading-relaxed overflow-hidden">
           <p className="truncate">{`> INITIALIZING_SSH_AUTH...`}</p>
           <p className="truncate">{`> PING_REMOTE_SERVER: SUCCESS`}</p>
           <p className="truncate">{`> ENCRYPTING_DATA_PACKETS: SHA-256`}</p>
           <p className="truncate">{`> STATUS: SYNCING_NODE_00${currentStep}`}</p>
        </div>
      </motion.div>
    </div>
  );
}