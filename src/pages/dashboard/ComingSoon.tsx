import { motion } from "framer-motion";
import { ArrowLeft, Construction, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mb-8"
      >
        <Construction className="w-10 h-10 text-blue-500" />
      </motion.div>

      <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
        Feature In Progress
      </h1>
      
      <p className="text-slate-500 max-w-md mb-10 text-lg leading-relaxed">
        We're currently fine-tuning this part of the <span className="text-blue-600 font-bold italic">Flowboard</span> experience. It'll be ready for takeoff soon!
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild variant="outline" className="h-12 px-8 rounded-xl font-bold">
          <Link to="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </Button>
        <Button asChild className="h-12 px-8 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold shadow-lg shadow-blue-600/20">
          <Link to="/dashboard" className="flex items-center gap-2 text-white">
            <Rocket className="w-4 h-4" /> Stay Notified
          </Link>
        </Button>
      </div>
    </div>
  );
}