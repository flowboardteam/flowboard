"use client";

import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Ghost, MapPinOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Log the error for tracking
    console.error(
      "404 Error: User attempted to access non-existent route:", 
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#050B1E] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-blue-600/10 blur-[120px] rounded-none" />
        <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-blue-400/5 blur-[120px] rounded-none" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center"
      >
        {/* Animated Icon */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-none bg-white/5 border border-white/10 mb-8 backdrop-blur-xl"
        >
          <MapPinOff className="w-12 h-12 text-blue-500" />
        </motion.div>

        <h1 className="text-8xl md:text-[12rem] font-black italic uppercase tracking-tighter text-white/5 leading-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 select-none">
          404
        </h1>

        <div className="space-y-4">
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
            Lost in the <br />
            <span className="text-blue-500 text-glow">Talent Cloud?</span>
          </h2>
          
          <p className="text-slate-400 font-medium max-w-xs mx-auto text-sm md:text-base opacity-80">
            The coordinate <code className="text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-none">{location.pathname}</code> doesn't exist in our network.
          </p>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            asChild
            className="w-full sm:w-auto px-8 py-7 bg-white text-slate-900 hover:bg-slate-200 rounded-none font-black italic uppercase tracking-widest text-xs transition-all shadow-xl"
          >
            <Link to="/">
              <Home className="w-4 h-4 mr-2" /> Return to Base
            </Link>
          </Button>

          <Button 
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-8 py-7 border-white/10 bg-transparent text-white hover:bg-white/5 rounded-none font-black italic uppercase tracking-widest text-xs transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </Button>
        </div>

        {/* System Message */}
        <div className="mt-16 pt-8 border-t border-white/5">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
            Status: Route_Not_Defined // Flowboard_Kernel
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;