"use client";

import { motion } from "framer-motion";
import { Zap, ArrowUpRight, Globe } from "lucide-react";

export default function ContractCard({ contract, viewMode = 'list' }: any) {
  return (
    <div className={`
      relative group overflow-hidden transition-all duration-300
      bg-[var(--card-bg)] border border-[var(--border-color)] 
      hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10
      /* Mobile: always smaller padding | Desktop: scales up */
      p-5 md:p-6 
      ${viewMode === 'list' ? 'rounded-2xl md:rounded-2xl' : 'rounded-2xl md:rounded-2xl flex flex-col h-full'}
    `}>
      
      {/* Subtle Hover Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-transparent group-hover:from-blue-600/5 transition-all duration-500" />

      <div className={`relative z-10 flex ${viewMode === 'list' ? 'flex-col md:flex-row md:items-center' : 'flex-col'} justify-between gap-4 md:gap-6`}>
        
        {/* Brand & Role Block */}
        <div className="flex gap-4 items-start md:items-center">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-xl bg-white/5 border border-[var(--border-color)] p-2.5 shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform">
            <img src={contract.orgLogo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded-md">
                 {contract.id}
               </span>
               <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase truncate max-w-[120px] md:max-w-none">
                 {contract.orgName}
               </p>
            </div>
            <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter text-[var(--foreground)] truncate">
              {contract.role}
            </h3>
          </div>
        </div>

        {/* Metrics Section - Stacks on mobile, Rows on Desktop */}
        <div className={`
          flex items-center justify-between md:justify-end gap-6 md:gap-8
          ${viewMode === 'list' ? 'border-t border-white/5 pt-4 md:border-none md:pt-0' : 'mt-2'}
        `}>
          <div className="text-left md:text-right">
             <div className="flex items-center md:justify-end gap-1 text-emerald-500">
               <Zap className="w-3 h-3 fill-current" />
               <span className="text-xs md:text-sm font-black">{contract.aiMatchScore}%</span>
             </div>
             <p className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-slate-500">Match Sync</p>
          </div>
          
          <div className="text-left md:text-right">
             <p className="text-xs md:text-sm font-black text-[var(--foreground)]">${contract.rate}</p>
             <p className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-slate-500">Monthly</p>
          </div>

          {/* Icon Button - Hidden on mobile list to save space, visible on desktop or grid */}
          <div className={`
            hidden md:flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-[var(--border-color)] text-slate-400 
            group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all
            ${viewMode === 'grid' ? 'md:absolute md:top-6 md:right-6' : ''}
          `}>
             <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Footer - Tags scroll horizontally on small screens */}
      <div className={`
        relative z-10 mt-5 md:mt-6 pt-4 border-t border-[var(--border-color)] flex items-center justify-between
        ${viewMode === 'grid' ? 'mt-auto' : ''}
      `}>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {contract.skills.slice(0, 3).map((skill: string) => (
            <span key={skill} className="whitespace-nowrap text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-500 border border-[var(--border-color)] px-2 py-1 rounded-md bg-white/5">
              {skill}
            </span>
          ))}
        </div>
        <div className="hidden sm:flex items-center gap-1.5 shrink-0 ml-2">
           <Globe className="w-3 h-3 text-slate-500" />
           <span className="text-[8px] font-black uppercase text-slate-500 tracking-tighter">Remote</span>
        </div>
      </div>
    </div>
  );
}