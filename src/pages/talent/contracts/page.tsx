"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LayoutGrid, List } from "lucide-react";
import ContractCard from "@/components/talent/contracts/ContractCard";
import ContractBriefing from "./ContractBriefing";
import DeploymentTerminal from "@/components/talent/contracts/DeploymentTerminal";
import { MOCK_CONTRACTS_DB, Contract } from "@/lib/mock-db";

export default function ContractsPage() {
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isDeploying, setIsDeploying] = useState(false);

  // Triggered when user clicks "Confirm & Deploy" in the Briefing Panel
  const handleDeployInitiated = () => {
    setSelectedContract(null); // Close the side panel
    setIsDeploying(true);      // Launch the terminal handshake
  };

  const handleDeploymentComplete = () => {
    setIsDeploying(false);
    // Future: Redirect to "Active Missions" or show a success toast
    console.log("Mission Node Successfully Deployed");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 p-4 md:p-0 pb-24 md:pb-8">
      {/* 1. Header Section */}
      <header className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter">
            Contracts
          </h1>
        </div>

        {/* Stats Blocks */}
        <div className="grid grid-cols-2 gap-3 md:flex md:gap-4">
          <div className="flex-1 px-4 py-3 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)]">
            <p className="text-slate-400 text-[8px] font-black tracking-widest">Active roles</p>
            <p className="text-lg font-black text-[var(--foreground)]">124</p>
          </div>
          <div className="flex-1 px-4 py-3 rounded-xl bg-[#050B1E] text-white border border-white/5 relative overflow-hidden">
             <div className="relative z-10">
                <p className="text-slate-100 text-[8px] font-black tracking-widest">Sync rate</p>
               <p className="text-lg font-black">98%</p>
             </div>
             <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-[#0B2A52] to-[#3b82f6]" />
          </div>
        </div>
      </header>

      {/* 2. Controls & Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            placeholder="Filter jobs..."
            className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl py-4 pl-12 pr-4 text-[10px] font-black tracking-widest outline-none focus:border-blue-500 transition-all text-[var(--foreground)]"
          />
        </div>
        
        <div className="hidden sm:flex items-center gap-1 bg-[var(--card-bg)] border border-[var(--border-color)] p-1 rounded-xl">
           <button 
             onClick={() => setViewMode('list')}
             className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-200'}`}
           >
             <List className="w-4 h-4" />
           </button>
           <button 
             onClick={() => setViewMode('grid')}
             className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-200'}`}
           >
             <LayoutGrid className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* 3. The Contract Feed */}
      <motion.div 
        layout
        className={viewMode === 'list' ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"}
      >
        {MOCK_CONTRACTS_DB.map((contract) => (
          <motion.div 
            layout 
            key={contract.id} 
            onClick={() => setSelectedContract(contract)}
            className="cursor-pointer"
          >
            <ContractCard contract={contract} viewMode={viewMode} />
          </motion.div>
        ))}
      </motion.div>

      {/* Overlays: Briefing & Terminal */}
      <AnimatePresence>
        {selectedContract && (
          <ContractBriefing 
            contract={selectedContract} 
            isOpen={!!selectedContract} 
            onClose={() => setSelectedContract(null)}
            onDeploy={handleDeployInitiated} 
          />
        )}
      </AnimatePresence>

      <DeploymentTerminal 
        isOpen={isDeploying} 
        onComplete={handleDeploymentComplete} 
      />
    </div>
  );
}