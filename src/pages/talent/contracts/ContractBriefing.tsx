"use client";

import { X, ShieldCheck, CreditCard, Zap, AlertCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Added onDeploy to the props destructuring
export default function ContractBriefing({ contract, isOpen, onClose, onDeploy }: any) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-stretch md:justify-end">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" 
            onClick={onClose} 
          />
          
          <motion.div 
            initial={{ y: "100%", x: 0 }} 
            animate={{ y: 0, x: 0 }}
            exit={{ y: "100%", x: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full md:max-w-xl bg-[var(--card-bg)] border-t md:border-t-0 md:border-l border-[var(--border-color)] h-[90vh] md:h-full rounded-none[2.5rem] md:rounded-none p-6 md:p-10 overflow-y-auto"
          >
            {/* Mobile Drag Handle */}
            <div className="w-12 h-1.5 bg-slate-800 rounded-none mx-auto mb-8 md:hidden" />

            <div className="flex justify-between items-start mb-8">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                ID: {contract.id}
              </span>
              <button onClick={onClose} className="p-2 bg-slate-800/50 rounded-none text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-8">
              <div className="flex flex-col gap-4">
                <div className="w-16 h-16 rounded-none bg-white/5 border border-[var(--border-color)] p-3">
                  <img src={contract.orgLogo} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <h2 className="text-3xl font-black italic text-[var(--foreground)] uppercase leading-none tracking-tighter">
                  {contract.role}
                </h2>
                <p className="text-blue-500 font-black text-xs uppercase tracking-widest">{contract.orgName}</p>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-none border border-[var(--border-color)] bg-white/5">
                   <ShieldCheck className="w-4 h-4 text-blue-500 mb-2" />
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Compliance</p>
                   <p className="text-sm font-bold text-[var(--foreground)]">{contract.complianceLevel} Access</p>
                </div>
                <div className="p-4 rounded-none border border-[var(--border-color)] bg-white/5">
                   <CreditCard className="w-4 h-4 text-emerald-500 mb-2" />
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Monthly Rate</p>
                   <p className="text-sm font-bold text-[var(--foreground)]">${contract.rate}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Mission Brief</h4>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">
                    {contract.description}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Required Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {contract.skills.map((skill: string) => (
                      <span key={skill} className="px-3 py-1 bg-white/5 border border-[var(--border-color)] rounded-none text-[9px] font-black uppercase text-slate-300 tracking-wider">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Section */}
              <div className="pt-6 border-t border-[var(--border-color)] mt-auto">
                 <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-none mb-6">
                    <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-blue-400/80 leading-tight uppercase">
                      Profile deployment will initiate a secure handshake with the organization's node.
                    </p>
                 </div>

                 {/* onClick={onDeploy} handles the Handshake Terminal trigger */}
                 <button 
                  onClick={onDeploy}
                  className="group w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-none font-black italic uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-blue-600/20"
                 >
                   Deploy Profile <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}