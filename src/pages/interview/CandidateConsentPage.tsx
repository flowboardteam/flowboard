import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShieldCheck, Sparkles, CheckCircle2, ArrowRight, Bot, Mic, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase";

export default function CandidateConsentPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [agreed, setAgreed] = useState(false);

  // Candidate Data Form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  useEffect(() => {
    fetchInvitation();
  }, [token]);

  const fetchInvitation = async () => {
    setLoading(true);
    try {
      const { data: inv } = await supabase
        .from("invitations")
        .select("*, jobs(*)")
        .eq("token", token)
        .single();

      if (inv) {
        setInvitation(inv);
        setJob(inv.jobs);
        setFullName(inv.candidate_name || "");
        setEmail(inv.candidate_email || "");
      }
    } catch (err) {
      console.error("Error fetching invitation token:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;

    try {
      // 1. Create or upsert candidate
      const { data: candidate } = await supabase
        .from("candidates")
        .insert({
          full_name: fullName,
          email,
          phone,
          linkedin_url: linkedinUrl,
          github_url: githubUrl,
          portfolio_url: portfolioUrl
        })
        .select()
        .single();

      const candidateId = candidate?.id || "00000000-0000-0000-0000-000000000000";

      // 2. Create Interview Session State Machine
      const { data: session } = await supabase
        .from("interview_sessions")
        .insert({
          invitation_id: invitation?.id,
          job_id: job?.id || invitation?.job_id,
          candidate_id: candidateId,
          status: "in_progress",
          format: "text",
          duration_minutes: 30,
          started_at: new Date().toISOString(),
          state_data: {
            questions_asked: 0,
            max_questions: 6,
            competency_index: 0,
            completed_competencies: []
          }
        })
        .select()
        .single();

      const sessionId = session?.id || "demo-session-id";
      navigate(`/interview/${token}/session?sessionId=${sessionId}`);
    } catch (err) {
      console.error("Error starting session:", err);
      // Fallback redirect for MVP demo
      navigate(`/interview/${token}/session?sessionId=demo-session-id`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-jakarta">
        <div className="text-center space-y-3">
          <Bot className="w-8 h-8 text-emerald-400 animate-pulse mx-auto" />
          <p className="text-sm font-bold text-slate-400">Verifying secure invitation token...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-jakarta flex flex-col justify-between p-6 md:p-12">
      {/* Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">Flowboard AI Interview</span>
        </div>

        <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold">
          Role: {job?.title || "Engineering Position"}
        </span>
      </div>

      {/* Main Body */}
      <div className="max-w-2xl mx-auto w-full space-y-8 py-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            Welcome, {fullName || "Candidate"}
          </h1>
          <p className="text-slate-400 font-medium text-sm mt-2 leading-relaxed">
            You have been invited by <strong>Flowboard Team</strong> to complete an AI-assisted hiring interview for the <strong>{job?.title || "Software Engineer"}</strong> position.
          </p>
        </div>

        {/* AI Disclaimer Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> AI Assistance Disclosure & Privacy
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            "This interview is conducted with the assistance of Flowboard AI. Your responses will be evaluated based on technical evidence to provide a structured assessment report to the hiring manager. AI does not make the final hiring decision."
          </p>
        </div>

        {/* Candidate Profile Form */}
        <form onSubmit={handleStartSetup} className="space-y-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Candidate Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-400">Full Name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-slate-950 border-slate-800 text-white h-11 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-400">Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-950 border-slate-800 text-white h-11 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-400">LinkedIn URL</Label>
              <Input
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="bg-slate-950 border-slate-800 text-white h-11 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-400">GitHub / Portfolio URL</Label>
              <Input
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="bg-slate-950 border-slate-800 text-white h-11 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="consent"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(!!checked)}
              className="mt-1 border-slate-700 data-[state=checked]:bg-emerald-500"
            />
            <label htmlFor="consent" className="text-xs text-slate-400 font-medium leading-relaxed cursor-pointer">
              I consent to participate in this AI-assisted evaluation and understand that my responses will be recorded and summarized for hiring consideration.
            </label>
          </div>

          <Button
            type="submit"
            disabled={!agreed}
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 text-sm mt-4"
          >
            Start AI Interview Session <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-600 font-medium max-w-4xl mx-auto w-full pt-6 border-t border-slate-900">
        Flowboard AI Interview Kernel v1.0 • Secure Token: {token}
      </div>
    </div>
  );
}
