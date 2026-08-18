import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Bot, Award, CheckCircle2, AlertTriangle, ArrowLeft, 
  Sparkles, FileText, User, ChevronRight, BarChart3 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function InterviewReportPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    fetchReport();
  }, [sessionId]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("interview_reports")
        .select("*, candidate:candidates(*), job:jobs(*)")
        .eq("session_id", sessionId)
        .maybeSingle();

      if (data) {
        setReport(data);
      } else {
        // Mock fallback report for preview
        setReport({
          overall_score: 92,
          recommendation: "Strongly Recommend",
          summary: "The candidate demonstrated exceptional problem-solving and software architecture capabilities. Communicated technical decisions clearly and provided concrete metrics on past system optimization.",
          key_strengths: [
            "Strong root-cause isolation methodology for backend bottlenecks",
            "Deep understanding of database index optimization and query execution",
            "Clear technical communication and stakeholder alignment"
          ],
          key_concerns: [
            "Limited hands-on experience with Kubernetes orchestration"
          ],
          competency_scores: [
            {
              name: "Technical Execution",
              score: 94,
              evidence: ["Described tuning SQL queries resulting in 60% latency reduction."]
            },
            {
              name: "Problem Solving",
              score: 91,
              evidence: ["Identified memory leak in Node.js microservice using heap snapshots."]
            },
            {
              name: "Communication",
              score: 90,
              evidence: ["Articulated trade-offs between REST and GraphQL endpoints concisely."]
            }
          ],
          candidate: {
            full_name: "Sarah Mensah",
            email: "sarah.mensah@example.com",
            current_title: "Senior Software Engineer"
          },
          job: {
            title: "Senior Full Stack Engineer"
          }
        });
      }
    } catch (err) {
      console.error("Error fetching report:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 font-jakarta text-slate-500 font-medium">
        Loading AI Candidate Assessment Report...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-jakarta pb-16">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigate("/client/interviews")}
          className="h-10 px-4 text-xs font-bold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Interviews
        </Button>

        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
          Report ID: {sessionId?.substring(0, 8)}
        </span>
      </div>

      {/* Main Candidate Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-widest">
              Flowboard AI Evaluation Report
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-2 tracking-tight">
              {report?.candidate?.full_name || "Sarah Mensah"}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Role: <strong>{report?.job?.title || "Senior Full Stack Engineer"}</strong>
            </p>
          </div>

          {/* Overall Score Badge */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 text-center shrink-0 border border-slate-800 shadow-xl">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
              Overall Score
            </span>
            <div className="text-4xl font-black text-emerald-400">
              {report?.overall_score || 92} <span className="text-lg text-slate-400">/ 100</span>
            </div>
            <div className="mt-2 text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {report?.recommendation || "STRONGLY RECOMMEND"}
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/60 space-y-2">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-emerald-600" /> AI Executive Summary
          </h4>
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            {report?.summary}
          </p>
        </div>
      </div>

      {/* Strengths & Concerns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Strengths
          </h3>
          <ul className="space-y-2.5">
            {report?.key_strengths?.map((str: string, idx: number) => (
              <li key={idx} className="text-xs font-medium text-slate-700 flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Areas for Further Exploration
          </h3>
          <ul className="space-y-2.5">
            {report?.key_concerns?.map((con: string, idx: number) => (
              <li key={idx} className="text-xs font-medium text-slate-700 flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Competency Evidence Breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-sm">
        <h3 className="font-black text-lg text-slate-900 tracking-tight">Competency Evidence Breakdown</h3>

        <div className="space-y-6">
          {report?.competency_scores?.map((comp: any, idx: number) => (
            <div key={idx} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">{comp.name}</span>
                <span className="font-extrabold text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl">
                  {comp.score} / 100
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Supporting Answer Evidence
                </span>
                {comp.evidence?.map((ev: string, evIdx: number) => (
                  <p key={evIdx} className="text-xs text-slate-700 font-medium italic leading-relaxed">
                    "{ev}"
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Employer Actions Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div>
          <h4 className="font-bold text-sm text-white">Employer Decision</h4>
          <p className="text-xs text-slate-400 mt-0.5">Move this candidate forward in your hiring pipeline.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => alert("Candidate added to Shortlist!")}
            className="h-11 px-5 border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-bold rounded-xl"
          >
            Shortlist Candidate
          </Button>

          <Button
            onClick={() => alert("Human interview requested!")}
            className="h-11 px-6 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20"
          >
            Schedule Human Interview
          </Button>
        </div>
      </div>
    </div>
  );
}
