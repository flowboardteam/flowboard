import { motion } from "framer-motion";
import { Wallet, ArrowUpRight, Cpu } from "lucide-react";

export default function DashboardIndex() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-black tracking-tighter">
          Dashboard
        </h1>
        <p className="text-slate-500 font-medium">
          Monitoring your global workforce & AI performance.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric Card */}
        <div className="p-8 rounded-[2.5rem] bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-blue-500 font-bold text-xs">+5.2%</span>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-1">
            Net Earnings
          </p>
          <h2 className="text-3xl font-black mt-1">$12,840.50</h2>
        </div>

        {/* AI Match Card - Styled like Landing Page Hero */}
        <div className="md:col-span-2 p-8 rounded-[2.5rem] bg-[#050B1E] text-white shadow-xl relative overflow-hidden group border border-white/5">
          {/* Gradient Background like Landing Page */}
          <div
            className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity"
            style={{
              background: `linear-gradient(to bottom right, #0B2A52 0%, #3b82f6 100%)`,
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">
                AI Matching Engine Active
              </span>
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tighter">
              Find your next <br /> global mission.
            </h2>
            <button className="mt-6 px-8 py-3 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/40">
              Browse Contracts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
