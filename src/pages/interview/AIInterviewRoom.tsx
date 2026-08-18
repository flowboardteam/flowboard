import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Send, Bot, User, Clock, CheckCircle2, AlertCircle, Sparkles, Volume2, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { generateNextInterviewQuestion, evaluateInterviewSession } from "@/lib/interviewAi";

export default function AIInterviewRoom() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [job, setJob] = useState<any>(null);
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [currentCompetencyIdx, setCurrentCompetencyIdx] = useState(0);

  // Chat Transcript State
  const [messages, setMessages] = useState<Array<{ sender: "interviewer" | "candidate"; content: string }>>([]);
  const [candidateInput, setCandidateInput] = useState("");
  const [questionsAskedCount, setQuestionsAskedCount] = useState(0);
  const maxQuestions = 6;

  // Voice Mode Simulation
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  useEffect(() => {
    initInterviewSession();
  }, [token, sessionId]);

  const initInterviewSession = async () => {
    setLoading(true);
    try {
      // 1. Fetch invitation and job
      const { data: inv } = await supabase
        .from("invitations")
        .select("*, jobs(*, job_competencies(*))")
        .eq("token", token)
        .single();

      if (inv) {
        setJob(inv.jobs);
        const comps = inv.jobs?.job_competencies || [
          { name: "Technical Execution", description: "Core technical proficiency", weight_percentage: 40 },
          { name: "Problem Solving", description: "Debugging and root cause analysis", weight_percentage: 30 },
          { name: "Communication", description: "Clarity of technical explanation", weight_percentage: 30 }
        ];
        setCompetencies(comps);

        // Initial Opening Question from AI
        const initialQuestion = await generateNextInterviewQuestion(
          inv.jobs?.title || "Senior Engineer",
          comps,
          0,
          [],
          false
        );

        setMessages([
          {
            sender: "interviewer",
            content: `Hello! I'm Flowboard's AI Interviewer for the ${inv.jobs?.title || "Engineering"} position. We'll explore ${comps.length} key competencies today. Let's start with ${comps[0]?.name}.\n\n${initialQuestion.question}`
          }
        ]);
        setQuestionsAskedCount(1);
      }
    } catch (err) {
      console.error("Error initializing interview room:", err);
      // Fallback initial state
      setMessages([
        {
          sender: "interviewer",
          content: "Hello! Welcome to your Flowboard AI interview. Let's discuss your technical background and problem solving experience. Could you introduce yourself and walk me through a complex project you recently engineered?"
        }
      ]);
      setQuestionsAskedCount(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSendAnswer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!candidateInput.trim() || isSubmitting) return;

    const currentAnswer = candidateInput.trim();
    setCandidateInput("");
    setIsSubmitting(true);

    // Append candidate message
    const updatedMessages = [...messages, { sender: "candidate" as const, content: currentAnswer }];
    setMessages(updatedMessages);

    try {
      // Check if interview limit reached
      if (questionsAskedCount >= maxQuestions) {
        // Complete & Evaluate
        setMessages([
          ...updatedMessages,
          {
            sender: "interviewer",
            content: "Thank you for sharing such thorough answers! That completes our AI interview session. Generating your evaluation report for the hiring team now..."
          }
        ]);

        const evaluation = await evaluateInterviewSession(
          job?.title || "Senior Software Engineer",
          competencies,
          updatedMessages
        );

        // Store Report in Supabase
        await supabase.from("interview_reports").insert({
          session_id: sessionId || "demo-session-id",
          candidate_id: "00000000-0000-0000-0000-000000000000",
          job_id: job?.id || "demo-job-id",
          overall_score: evaluation.overall_score || 88,
          recommendation: evaluation.recommendation || "Strongly Recommend",
          summary: evaluation.summary || "Candidate demonstrated solid experience.",
          key_strengths: evaluation.key_strengths || [],
          key_concerns: evaluation.key_concerns || [],
          competency_scores: evaluation.competency_scores || []
        });

        setTimeout(() => {
          navigate(`/interview/${token}/complete`);
        }, 2500);
        return;
      }

      // Determine follow-up or next competency
      const isShort = currentAnswer.split(" ").length < 15;
      const isFollowUp = isShort && Math.random() > 0.3;
      
      let nextCompIdx = currentCompetencyIdx;
      if (!isFollowUp && questionsAskedCount % 2 === 0) {
        nextCompIdx = Math.min(currentCompetencyIdx + 1, competencies.length - 1);
        setCurrentCompetencyIdx(nextCompIdx);
      }

      const aiResponse = await generateNextInterviewQuestion(
        job?.title || "Senior Software Engineer",
        competencies,
        nextCompIdx,
        updatedMessages,
        isFollowUp
      );

      setMessages([
        ...updatedMessages,
        {
          sender: "interviewer",
          content: aiResponse.question
        }
      ]);
      setQuestionsAskedCount(prev => prev + 1);
    } catch (err) {
      console.error("Error processing answer:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-jakarta">
        <div className="text-center space-y-3">
          <Bot className="w-8 h-8 text-emerald-400 animate-pulse mx-auto" />
          <p className="text-sm font-bold text-slate-400">Loading AI Interview Room & Blueprint...</p>
        </div>
      </div>
    );
  }

  const activeComp = competencies[currentCompetencyIdx] || competencies[0];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-jakarta flex flex-col justify-between overflow-hidden">
      {/* Top Header & State Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white tracking-tight">{job?.title || "AI Interview Session"}</h2>
            <p className="text-[11px] font-medium text-slate-400">Flowboard Adaptive Assessment Engine</p>
          </div>
        </div>

        {/* Competency & Progress Indicator */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-extrabold uppercase text-slate-500">Active Competency:</span>
            <span className="text-xs font-bold text-emerald-400">{activeComp?.name || "Problem Solving"}</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Question {questionsAskedCount} / {maxQuestions}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsVoiceActive(!isVoiceActive)}
            className={`h-9 px-3 rounded-xl border-slate-800 text-xs font-bold ${
              isVoiceActive ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-slate-950 text-slate-400"
            }`}
          >
            {isVoiceActive ? <Mic className="w-3.5 h-3.5 mr-1.5 animate-pulse" /> : <MicOff className="w-3.5 h-3.5 mr-1.5" />}
            {isVoiceActive ? "Voice Enabled" : "Voice Mode"}
          </Button>
        </div>
      </header>

      {/* Main Chat Conversation Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6 scroll-smooth">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-4 ${msg.sender === "candidate" ? "flex-row-reverse" : ""}`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold ${
              msg.sender === "interviewer"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
            }`}>
              {msg.sender === "interviewer" ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>

            <div className={`max-w-2xl rounded-2xl p-5 text-sm leading-relaxed ${
              msg.sender === "interviewer"
                ? "bg-slate-900 border border-slate-800 text-slate-200"
                : "bg-blue-600 text-white font-medium"
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {isSubmitting && (
          <div className="flex items-center gap-3 text-slate-400 text-xs font-bold">
            <Bot className="w-4 h-4 text-emerald-400 animate-spin" /> Flowboard AI is analyzing your response...
          </div>
        )}
      </main>

      {/* Candidate Response Input Form */}
      <footer className="bg-slate-900 border-t border-slate-800 p-4 md:p-6 max-w-4xl mx-auto w-full rounded-t-2xl">
        <form onSubmit={handleSendAnswer} className="space-y-3">
          <Textarea
            value={candidateInput}
            onChange={(e) => setCandidateInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendAnswer();
              }
            }}
            placeholder="Type your response here... (Press Enter to submit)"
            rows={3}
            disabled={isSubmitting}
            className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs md:text-sm p-4 focus:ring-emerald-500"
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">
              Provide concrete technical examples and metrics for best evaluation scoring.
            </span>

            <Button
              type="submit"
              disabled={!candidateInput.trim() || isSubmitting}
              className="h-10 px-6 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg shadow-emerald-500/20"
            >
              Submit Answer <Send className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </form>
      </footer>
    </div>
  );
}
