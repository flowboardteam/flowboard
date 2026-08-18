import { Link } from "react-router-dom";
import { CheckCircle2, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InterviewCompletePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-jakarta flex flex-col justify-between p-6 md:p-12">
      <div className="max-w-2xl mx-auto w-full text-center my-auto space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>

        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
          Interview Complete!
        </h1>

        <p className="text-slate-400 font-medium text-sm max-w-md mx-auto leading-relaxed">
          Thank you for completing your Flowboard AI interview. Your responses have been processed and an objective, evidence-based assessment report has been submitted to the hiring team.
        </p>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left max-w-md mx-auto space-y-3">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Next Steps
          </span>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            The hiring team will review your competency evidence report and transcript. If selected for the human round, they will reach out directly.
          </p>
        </div>

        <div className="pt-4">
          <Link to="/">
            <Button className="h-11 px-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs">
              Return to Flowboard Base
            </Button>
          </Link>
        </div>
      </div>

      <div className="text-center text-xs text-slate-600 font-medium max-w-4xl mx-auto w-full pt-6 border-t border-slate-900">
        Flowboard AI Interview Kernel v1.0 • Assessment Complete
      </div>
    </div>
  );
}
