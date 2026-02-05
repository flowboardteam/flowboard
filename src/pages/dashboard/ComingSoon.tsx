"use client";

import { motion } from "framer-motion";
import { Coffee, Rocket, ArrowLeft, Heart, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ComingSoon() {
  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-[#050B1E] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-blue-600/15 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-blue-400/10 blur-[100px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="bg-white/[0.03] border border-white/10 backdrop-blur-2xl rounded-[3rem] p-8 md:p-20 text-center shadow-2xl">
          
          {/* Friendly Status */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">
                Something Big is Cooking
              </span>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white mb-6 leading-[0.9]">
            We're Almost <br />
            <span className="text-blue-500 text-glow">Ready For You</span>
          </h1>

          <p className="text-slate-300 text-sm md:text-lg font-medium max-w-sm mx-auto mb-12 leading-relaxed opacity-80">
            We're putting the finishing touches on our Client Experience to make sure hiring talent is as smooth as possible.
          </p>

          {/* Value Props - Simple & Human */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Heart, label: "Built for You", color: "text-pink-400" },
              { icon: Star, label: "Top 1% Talent", color: "text-yellow-400" },
              { icon: Rocket, label: "Instant Hire", color: "text-blue-400" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              onClick={() => navigateTo("/")}
              className="w-full sm:w-auto px-10 py-7 bg-white text-slate-900 hover:bg-blue-50 rounded-2xl font-black italic uppercase tracking-[0.1em] text-xs transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Take Me Back
            </Button>
            <Button 
              variant="outline"
              className="w-full sm:w-auto px-10 py-7 border-white/20 bg-white/5 text-white hover:bg-white/10 rounded-2xl font-black italic uppercase tracking-[0.1em] text-xs transition-all"
            >
              Get Notified
            </Button>
          </div>
        </div>

        {/* Friendly Footer */}
        <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-4 px-10 opacity-40">
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">© 2026 Flowboard Team</span>
        </div>
      </motion.div>
    </div>
  );
}