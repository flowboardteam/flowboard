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
            className="relative w-full md:max-w-xl bg-[var(--card-bg)] border-t md:border-t-0 md:border-l border-[var(--border-color)] h-[90vh] md:h-full rounded-none p-6 md:p-10 overflow-y-auto"
          >
            {/* Mobile Drag Handle */}
            <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-8 md:hidden" />

            <div className="flex justify-between items-start mb-8">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                ID: {contract.id}
              </span>
              <button onClick={onClose} className="p-2 bg-slate-800/50 rounded-xl text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-8">
              <div className="flex flex-col gap-4">
                <div className="w-16 h-16 rounded-xl bg-white/5 border border-[var(--border-color)] p-3">
                  <img src={contract.orgLogo} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <h2 className="text-3xl font-black text-[var(--foreground)] uppercase leading-none tracking-tighter">
                  {contract.role}
                </h2>
                <p className="text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest">{contract.orgName}</p>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-none border border-purple-100 bg-purple-50/50">
                   <ShieldCheck className="w-4 h-4 text-purple-600 mb-2" />
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Compliance</p>
                   <p className="text-sm font-bold text-slate-900">{contract.complianceLevel} Access</p>
                </div>
                <div className="p-4 rounded-none border border-purple-100 bg-purple-50/50">
                   <CreditCard className="w-4 h-4 text-purple-600 mb-2" />
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Monthly Rate</p>
                   <p className="text-sm font-bold text-slate-900">${contract.rate}</p>
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
                      <span key={skill} className="px-3 py-1 bg-white/5 border border-[var(--border-color)] rounded-lg text-[9px] font-black uppercase text-slate-300 tracking-wider">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Section */}
              <div className="pt-6 border-t border-[var(--border-color)] mt-auto">
                 <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl mb-6">
                    <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-blue-400/80 leading-tight uppercase">
                      Profile deployment will initiate a secure handshake with the organization's node.
                    </p>
                 </div>

                 {/* onClick={onDeploy} handles the Handshake Terminal trigger */}
                 <button 
                  onClick={onDeploy}
                  className="group w-full bg-[#1A1C21] hover:bg-black text-white py-5 rounded-none font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-slate-900/10"
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