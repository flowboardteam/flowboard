"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, FileText, ChevronRight,
  Check, X, Loader2, BriefcaseBusiness,
  MapPin, DollarSign, Tag, AlignLeft, ListChecks,
  CheckCircle2, Send, RefreshCw, Pencil, Eye,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useGroups } from "@/contexts/GroupContext";

// ─── Constants ────────────────────────────────────────────────────────────────
const DEPARTMENTS       = ["Engineering","Design","Product","Operations","Marketing","Finance","Human Resources","Sales"];
const TYPES             = ["Full-time","Contract","Part-time"];
const LOCATIONS         = ["Remote","On-site","Hybrid"];
const EXPERIENCE_LEVELS = ["Junior (0–2 years)","Mid-level (3–5 years)","Senior (5–8 years)","Lead / Staff (8+ years)"];

const STEPS = [
  { id: 1, label: "Basics",       icon: BriefcaseBusiness },
  { id: 2, label: "Description",  icon: AlignLeft         },
  { id: 3, label: "Requirements", icon: ListChecks        },
  { id: 4, label: "Review",       icon: CheckCircle2      },
];

const DEFAULT_FORM = {
  title: "", department: "", type: "Full-time", location: "Remote",
  salary: "", experience_level: "", description: "",
  responsibilities: [], skills: [], benefits: [],
  education: "", other_requirements: [],
};

// ─── Gemini Haraka01 helper ────────────────────────────────────────────────────
async function callHaraka01(
  userPrompt: string,
  existingRole?: any
): Promise<any> {
  const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("VITE_GEMINI_API_KEY is missing.");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const systemPrompt = `
You are Haraka01, an expert HR assistant that creates detailed job role descriptions.
${existingRole ? `You are refining an existing role based on user feedback. Current role:\n${JSON.stringify(existingRole, null, 2)}\n` : ""}

Based on the user's prompt, return ONLY a valid JSON object with these exact keys:
{
  "title": "Job title",
  "department": "One of: Engineering, Design, Product, Operations, Marketing, Finance, Human Resources, Sales",
  "type": "One of: Full-time, Contract, Part-time",
  "location": "One of: Remote, On-site, Hybrid",
  "salary": "Salary range string e.g. '$80k–$110k' or '$50/hr', or empty string if unclear",
  "experience_level": "One of: Junior (0–2 years), Mid-level (3–5 years), Senior (5–8 years), Lead / Staff (8+ years)",
  "description": "2–3 paragraph job description",
  "responsibilities": ["array", "of", "key", "responsibilities", "4 to 6 items"],
  "skills": ["array", "of", "required", "skills", "4 to 8 items"],
  "benefits": ["array", "of", "benefits", "2 to 5 items"],
  "education": "Education requirement or empty string",
  "other_requirements": []
}

Rules:
- Return ONLY the JSON object, no markdown, no code fences, no extra text
- responsibilities and skills must be arrays of strings
- description should be 2–3 sentences minimum, professional tone
- If refining, only change fields the user explicitly asks about; keep others the same
`;

  const result = await model.generateContent(
    `${systemPrompt}\n\nUser prompt: ${userPrompt}`
  );
  const response = await result.response;
  let text = response.text()
    .replace(/```json/g, "").replace(/```/g, "").trim();

  const start = text.indexOf("{");
  const end   = text.lastIndexOf("}");
  if (start !== -1 && end !== -1) text = text.slice(start, end + 1);

  return JSON.parse(text);
}

// ─── Tag Input ────────────────────────────────────────────────────────────────
function TagInput({ tags, onAdd, onRemove, placeholder }) {
  const [input, setInput] = useState("");
  const commit = () => {
    const val = input.trim().replace(/,$/, "");
    if (val && !tags.includes(val)) onAdd(val);
    setInput("");
  };
  return (
    <div
      className="min-h-[52px] bg-slate-500/5 border border-[var(--border-color)] rounded-xl px-3 py-2 flex flex-wrap gap-2 items-center focus-within:ring-2 ring-blue-500/20 transition-all cursor-text"
      onClick={e => (e.currentTarget.querySelector("input") as HTMLInputElement)?.focus()}
    >
      {tags.map(tag => (
        <span key={tag} className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 px-2.5 py-1 rounded-lg">
          {tag}
          <button type="button" onClick={() => onRemove(tag)} className="hover:text-red-500 transition-colors">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); commit(); } }}
        onBlur={commit}
        placeholder={tags.length === 0 ? placeholder : "Add more..."}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm font-medium placeholder:text-slate-400"
      />
    </div>
  );
}

// ─── Step Indicator — mobile-safe ─────────────────────────────────────────────
// On mobile we show a compact "Step X of Y — Label" text instead of the full
// horizontal stepper which overflows small screens.
function StepIndicator({ currentStep }) {
  const currentLabel = STEPS.find(s => s.id === currentStep)?.label ?? "";

  return (
    <>
      {/* ── Desktop: full horizontal stepper ── */}
      <div className="hidden sm:flex items-center gap-0">
        {STEPS.map((step, i) => {
          const isComplete = currentStep > step.id;
          const isActive   = currentStep === step.id;
          const Icon       = step.icon;
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  isComplete ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                  : isActive  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  :             "bg-slate-500/10 text-slate-400"
                }`}>
                  {isComplete ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${
                  isActive ? "text-blue-600" : isComplete ? "text-emerald-500" : "text-slate-400"
                }`}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-12 lg:w-20 mb-5 mx-2 transition-all ${
                  currentStep > step.id ? "bg-emerald-500" : "bg-[var(--border-color)]"
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Mobile: compact step pill + progress bar ── */}
      <div className="flex sm:hidden flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Step {currentStep} of {STEPS.length}
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
            {currentLabel}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-500/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
        {/* Completed steps as dots */}
        <div className="flex items-center gap-2">
          {STEPS.map(step => (
            <div key={step.id} className={`w-2 h-2 rounded-full transition-all ${
              currentStep > step.id  ? "bg-emerald-500"
              : currentStep === step.id ? "bg-blue-600 scale-125"
              : "bg-slate-500/20"
            }`} />
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Haraka01 Tab — real Gemini + iterative chat ────────────────────────────────
type ChatMessage = { role: "user" | "ai"; text: string };

function Haraka01Tab({ onGenerated }) {
  const [initialPrompt, setInitialPrompt] = useState("");
  const [generating, setGenerating]       = useState(false);
  const [statusMsg, setStatusMsg]         = useState("");
  const [generatedRole, setGeneratedRole] = useState<any>(null);
  const [chatHistory, setChatHistory]     = useState<ChatMessage[]>([]);
  const [refineInput, setRefineInput]     = useState("");
  const [refining, setRefining]           = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const statusMessages = [
    "Reading your requirements...",
    "Crafting job description...",
    "Generating responsibilities...",
    "Finalising role details...",
  ];

  const runGeneration = async (prompt: string, existing?: any, isRefinement = false) => {
    const setter = isRefinement ? setRefining : setGenerating;
    setter(true);

    if (!isRefinement) {
      setStatusMsg(statusMessages[0]);
      let i = 0;
      const interval = setInterval(() => {
        i = (i + 1) % statusMessages.length;
        setStatusMsg(statusMessages[i]);
      }, 1100);

      try {
        const role = await callHaraka01(prompt, existing);
        clearInterval(interval);
        setGeneratedRole(role);
        setChatHistory([{ role: "user", text: prompt }, { role: "ai", text: `Generated role: **${role.title}**` }]);
      } catch (err: any) {
        clearInterval(interval);
        console.error("Haraka01 error:", err);
        setChatHistory([{ role: "user", text: prompt }, { role: "ai", text: "Sorry, I couldn't generate the role. Please try again." }]);
      } finally {
        setGenerating(false);
        setStatusMsg("");
      }
    } else {
      // Refinement pass
      setChatHistory(prev => [...prev, { role: "user", text: prompt }]);
      try {
        const updated = await callHaraka01(prompt, existing);
        setGeneratedRole(updated);
        setChatHistory(prev => [...prev, { role: "ai", text: `Updated: **${updated.title}** — changes applied.` }]);
      } catch (err: any) {
        setChatHistory(prev => [...prev, { role: "ai", text: "Couldn't apply changes. Please try again." }]);
      } finally {
        setRefining(false);
        setRefineInput("");
      }
    }
  };

  const handleGenerate = () => {
    if (!initialPrompt.trim()) return;
    runGeneration(initialPrompt);
  };

  const handleRefine = () => {
    if (!refineInput.trim() || !generatedRole) return;
    runGeneration(refineInput, generatedRole, true);
  };

  const handleUseRole = () => {
    if (generatedRole) onGenerated(generatedRole);
  };

  // ── Initial prompt screen ─────────────────────────────────────────────────
  if (!generatedRole && !generating) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3 p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10 mb-2">
          <img src="/flowboardlogo.png" alt="" className="w-6 h-6 object-contain flex-shrink-0" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
            Describe the role in plain English — Haraka01 will generate a complete job description, responsibilities, skills, and benefits for you to review and refine.
          </p>
        </div>
        <div>
          <label className="block text-[11px] font-black tracking-widest text-slate-500 mb-2">Describe the role</label>
          <textarea
            value={initialPrompt}
            onChange={e => setInitialPrompt(e.target.value)}
            rows={5}
            onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
            placeholder="e.g. A senior backend engineer who knows Node.js and PostgreSQL, will own our API infrastructure, 5+ years experience, remote role..."
            className="w-full bg-slate-500/5 border border-[var(--border-color)] rounded-xl p-4 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all resize-none"
          />
          <p className="text-[11px] text-slate-500 mt-1.5">Press Cmd+Enter to generate</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={!initialPrompt.trim()}
          className="w-full py-4 bg-blue-600 text-white font-black text-xs tracking-widest rounded-xl hover:bg-blue-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
        >
          GENERATE WITH HARAKA01
        </button>
      </div>
    );
  }

  // ── Generating animation ──────────────────────────────────────────────────
  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-sm">
            <img src="/flowboardlogo.png" alt="Haraka01" className="w-10 h-10 object-contain" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
            <Loader2 className="w-2.5 h-2.5 text-white animate-spin" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black tracking-[0.2em] text-blue-600 mb-1">Haraka01</p>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{statusMsg}</p>
        </div>
      </div>
    );
  }

  // ── Generated role preview + refinement chat ──────────────────────────────
  return (
    <div className="space-y-5">
      {/* Preview card */}
      <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Role generated</span>
            </div>
            <h3 className="text-base font-black dark:text-white tracking-tight truncate">{generatedRole.title}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {generatedRole.department} · {generatedRole.type} · {generatedRole.location}
            </p>
          </div>
          <button
            onClick={() => { setGeneratedRole(null); setChatHistory([]); }}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-500/10 flex-shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick preview of key fields */}
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 mb-3">
          {generatedRole.description}
        </p>

        {generatedRole.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {generatedRole.skills.slice(0, 5).map(s => (
              <span key={s} className="text-[10px] font-black tracking-wider bg-blue-500/10 text-slate-900 px-2 py-0.5 rounded-lg">{s}</span>
            ))}
            {generatedRole.skills.length > 5 && (
              <span className="text-[10px] font-black text-slate-400">+{generatedRole.skills.length - 5}</span>
            )}
          </div>
        )}
      </div>

      {/* Chat refinement history */}
      {chatHistory.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs font-medium leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-500/10 text-slate-600 dark:text-slate-300"
              }`}>
                {msg.text.replace(/\*\*/g, "")}
              </div>
            </div>
          ))}
          {refining && (
            <div className="flex justify-start">
              <div className="px-3 py-2 rounded-xl bg-slate-500/10">
                <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      )}

      {/* Refine input */}
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
          Refine with a follow-up prompt
        </label>
        <div className="flex gap-2">
          <input
            value={refineInput}
            onChange={e => setRefineInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleRefine(); }}
            placeholder='e.g. "Make it more senior" or "Add GraphQL to skills"'
            disabled={refining}
            className="flex-1 bg-slate-500/5 border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all disabled:opacity-50 min-w-0"
          />
          <button
            onClick={handleRefine}
            disabled={!refineInput.trim() || refining}
            className="flex-shrink-0 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {refining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5">Press Enter to send · Changes apply to the role above</p>
      </div>

      {/* CTA */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={handleUseRole}
          className="flex-1 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
        >
          <Eye className="w-4 h-4" /> Preview & edit this role
        </button>
      </div>
    </div>
  );
}

// ─── Step 1: Basics ───────────────────────────────────────────────────────────
function StepBasics({ data, onChange }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Job title *</label>
        <input
          value={data.title}
          onChange={e => onChange("title", e.target.value)}
          placeholder="e.g. Senior Frontend Engineer"
          className="w-full bg-slate-500/5 border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Department</label>
          <select
            value={data.department}
            onChange={e => onChange("department", e.target.value)}
            className="w-full appearance-none bg-slate-500/5 border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all cursor-pointer"
          >
            <option value="">Select department</option>
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Employment type</label>
          <div className="flex gap-2">
            {TYPES.map(t => (
              <button
                key={t} type="button"
                onClick={() => onChange("type", t)}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                  data.type === t
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20"
                    : "border-[var(--border-color)] text-slate-400 hover:bg-slate-500/5"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            <MapPin className="inline w-3 h-3 mr-1" />Location
          </label>
          <div className="flex gap-2">
            {LOCATIONS.map(l => (
              <button
                key={l} type="button"
                onClick={() => onChange("location", l)}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                  data.location === l
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20"
                    : "border-[var(--border-color)] text-slate-400 hover:bg-slate-500/5"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            <DollarSign className="inline w-3 h-3 mr-1" />Salary / Rate
          </label>
          <input
            value={data.salary}
            onChange={e => onChange("salary", e.target.value)}
            placeholder="e.g. $80k–$110k or $50/hr"
            className="w-full bg-slate-500/5 border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Experience level</label>
        <div className="grid grid-cols-2 gap-2">
          {EXPERIENCE_LEVELS.map(l => (
            <button
              key={l} type="button"
              onClick={() => onChange("experience_level", l)}
              className={`py-3 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border text-center leading-tight ${
                data.experience_level === l
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20"
                  : "border-[var(--border-color)] text-slate-400 hover:bg-slate-500/5"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Description ──────────────────────────────────────────────────────
function StepDescription({ data, onChange }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Job description *</label>
        <textarea
          value={data.description}
          onChange={e => onChange("description", e.target.value)}
          rows={5}
          placeholder="Describe the role, team context, and what success looks like..."
          className="w-full bg-slate-500/5 border border-[var(--border-color)] rounded-xl p-4 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all resize-none"
        />
      </div>
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Key responsibilities</label>
        <p className="text-[11px] text-slate-400 font-medium mb-3">Press Enter or comma to add each one</p>
        <TagInput
          tags={data.responsibilities}
          onAdd={v => onChange("responsibilities", [...data.responsibilities, v])}
          onRemove={v => onChange("responsibilities", data.responsibilities.filter(r => r !== v))}
          placeholder="e.g. Build reusable components — press Enter"
        />
      </div>
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Benefits (optional)</label>
        <TagInput
          tags={data.benefits}
          onAdd={v => onChange("benefits", [...data.benefits, v])}
          onRemove={v => onChange("benefits", data.benefits.filter(b => b !== v))}
          placeholder="e.g. Health insurance, Remote-first..."
        />
      </div>
    </div>
  );
}

// ─── Step 3: Requirements ─────────────────────────────────────────────────────
function StepRequirements({ data, onChange }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
          <Tag className="inline w-3 h-3 mr-1" />Skills & technologies *
        </label>
        <p className="text-[11px] text-slate-400 font-medium mb-3">Press Enter or comma after each skill</p>
        <TagInput
          tags={data.skills}
          onAdd={v => onChange("skills", [...data.skills, v])}
          onRemove={v => onChange("skills", data.skills.filter(s => s !== v))}
          placeholder="e.g. React, Node.js, Figma..."
        />
      </div>
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Education (optional)</label>
        <input
          value={data.education}
          onChange={e => onChange("education", e.target.value)}
          placeholder="e.g. BSc Computer Science or equivalent experience"
          className="w-full bg-slate-500/5 border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all"
        />
      </div>
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Other requirements (optional)</label>
        <TagInput
          tags={data.other_requirements}
          onAdd={v => onChange("other_requirements", [...data.other_requirements, v])}
          onRemove={v => onChange("other_requirements", data.other_requirements.filter(r => r !== v))}
          placeholder="e.g. Portfolio required, Available for travel..."
        />
      </div>
    </div>
  );
}

// ─── Step 4: Review ───────────────────────────────────────────────────────────
function StepReview({ data, onPublish, onDraft, saving }) {
  const Pill = ({ text, color = "blue" }: { text: string; color?: string }) => {
    const styles: Record<string, string> = {
      blue:    "bg-blue-500/5 text-slate-900 border border-blue-500/10 shadow-sm",
      emerald: "bg-emerald-500/5 text-slate-900 border border-emerald-500/10 shadow-sm",
      slate:   "bg-slate-500/5 text-slate-900 border border-slate-500/10 shadow-sm",
    };
    return (
      <span className={`inline-flex text-[10px] font-black tracking-wider px-2.5 py-1 rounded-lg ${styles[color] ?? styles.blue}`}>
        {text}
      </span>
    );
  };

  const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="mb-5">
      <p className="text-[10px] font-black tracking-widest text-slate-500 mb-2">{label}</p>
      {children}
    </div>
  );

  return (
    <div>
      <div className="p-4 rounded-2xl bg-slate-500/5 border border-[var(--border-color)] mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-base font-black tracking-tight dark:text-white">{data.title || "—"}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{data.department || "No department"}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Pill text={data.type} />
            <Pill text={data.location} color="slate" />
            {data.salary && <Pill text={data.salary} color="emerald" />}
          </div>
        </div>
        {data.description && (
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">{data.description}</p>
        )}
      </div>

      <Section label="Responsibilities">
        {data.responsibilities.length > 0
          ? <div className="flex flex-wrap gap-2">{data.responsibilities.map(r => <Pill key={r} text={r} />)}</div>
          : <p className="text-sm text-slate-400 font-medium">None added</p>}
      </Section>

      <div className="h-px bg-[var(--border-color)] my-4" />

      <Section label="Skills & requirements">
        {data.skills.length > 0
          ? <div className="flex flex-wrap gap-2">{data.skills.map(s => <Pill key={s} text={s} />)}</div>
          : <p className="text-sm text-slate-400 font-medium">None added</p>}
      </Section>

      {data.benefits.length > 0 && (
        <>
          <div className="h-px bg-[var(--border-color)] my-4" />
          <Section label="Benefits">
            <div className="flex flex-wrap gap-2">{data.benefits.map(b => <Pill key={b} text={b} color="emerald" />)}</div>
          </Section>
        </>
      )}

      <div className="h-px bg-[var(--border-color)] my-6" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={onDraft}
          disabled={saving}
          className="py-4 rounded-xl border border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-500/5 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
          Save as draft
        </button>
        <button
          onClick={onPublish}
          disabled={saving}
          className="py-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-40"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <img src="/flowboardlogo.png" alt="" className="w-4 h-4 invert brightness-0" />}
          Publish role
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CreateRolePage() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const editId         = searchParams.get("edit");
  const { activeGroup } = useGroups();

  const [mode, setMode]         = useState<null | "manual" | "ai">(null);
  const [step, setStep]         = useState(1);
  const [form, setForm]         = useState(DEFAULT_FORM);
  const [saving, setSaving]     = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(!!editId);

  // ── Load existing role when editing ──────────────────────────────────────
  useEffect(() => {
    if (!editId) return;
    (async () => {
      setLoadingEdit(true);
      const { data, error } = await supabase.from("roles").select("*").eq("id", editId).single();
      if (data) {
        setForm({
          title:              data.title              ?? "",
          department:         data.department         ?? "",
          type:               data.type               ?? "Full-time",
          location:           data.location           ?? "Remote",
          salary:             data.salary             ?? "",
          experience_level:   data.experience_level   ?? "",
          description:        data.description        ?? "",
          responsibilities:   data.responsibilities   ?? [],
          skills:             data.skills             ?? [],
          benefits:           data.benefits           ?? [],
          education:          data.education          ?? "",
          other_requirements: data.other_requirements ?? [],
        });
        setMode("manual");
      }
      if (error) console.error("Load role error:", error);
      setLoadingEdit(false);
    })();
  }, [editId]);

  const updateField = (key: string, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }));

  // ── Save to Supabase ──────────────────────────────────────────────────────
  const handleSave = async (status: string) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const payload = { 
        ...form, 
        status, 
        organization_id: user.id
      };

      if (editId) {
        const { error } = await supabase.from("roles").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("roles").insert(payload);
        if (error) throw error;
      }
      navigate("/client/roles");
    } catch (err) {
      console.error("Save role error:", err);
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return form.title.trim().length > 0;
    if (step === 2) return form.description.trim().length > 0;
    return true;
  };

  // When Haraka01 generates a role, pre-fill the form and drop into manual review
  const handleAIGenerated = (generated: any) => {
    setForm(prev => ({ ...prev, ...generated }));
    setMode("manual");
    setStep(1);
  };

  // ── Loading (edit mode) ───────────────────────────────────────────────────
  if (loadingEdit) {
    return (
      <div className="max-w-2xl mx-auto pb-20 flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading role...</p>
        </div>
      </div>
    );
  }

  // ── Mode selection ────────────────────────────────────────────────────────
  if (!mode) {
    return (
      <div className="max-w-2xl mx-auto pb-20 px-4 sm:px-0">
        <button
          onClick={() => navigate("/client/roles")}
          className="flex items-center gap-2 text-[11px] font-black tracking-widest text-slate-400 hover:text-blue-600 transition-colors mb-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to roles
        </button>
        <div className="space-y-3 mb-10">
          <div className="flex items-center gap-2 text-blue-600 text-[11px] font-bold uppercase tracking-widest">
            <BriefcaseBusiness className="w-3.5 h-3.5" /> Roles & jobs
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
            Create a role.
          </h1>
          <p className="text-sm font-medium text-slate-500">Choose how you'd like to define this job role</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setMode("manual")}
            className="p-6 sm:p-8 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm text-left flex flex-col gap-4 hover:border-blue-500/50 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-500/10 flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
              <FileText className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <div>
              <p className="text-lg font-black dark:text-white tracking-tight mb-1">Manual</p>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">Fill in all the role details yourself step by step</p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-black text-slate-500 tracking-widest group-hover:text-blue-600 transition-colors mt-auto">
              START
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setMode("ai")}
            className="p-6 sm:p-8 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm text-left flex flex-col gap-4 hover:border-blue-500/50 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-4 right-4">
              <span className="text-[10px] font-black tracking-widest bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                AI POWERED
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-sm">
              <img src="/flowboardlogo.png" alt="Haraka01" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <p className="text-lg font-black dark:text-white tracking-tight mb-1">Haraka01</p>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">Describe the role in plain English — Haraka01 will generate a complete job description, responsibilities, skills, and benefits for you to review and refine.</p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-black text-blue-600 tracking-widest mt-auto">
              GENERATE
            </div>
          </motion.button>
        </div>
      </div>
    );
  }

  // ── Haraka01 mode ───────────────────────────────────────────────────────────
  if (mode === "ai") {
    return (
      <div className="max-w-2xl mx-auto pb-20 px-4 sm:px-0">
        <button
          onClick={() => setMode(null)}
          className="flex items-center gap-2 text-[11px] font-black tracking-widest text-slate-400 hover:text-blue-600 transition-colors mb-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <div className="space-y-2 mb-8">
          <div className="flex items-center gap-2 text-blue-600 text-[12px] font-bold tracking-widest">
            <img src="/flowboardlogo.png" alt="" className="w-5 h-5 object-contain" /> Haraka01
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
            Generate a role.
          </h1>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Describe the role in plain English — Haraka01 will generate a complete job description, responsibilities, skills, and benefits for you to review and refine.
          </p>
        </div>
        <div className="p-6 sm:p-8 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm">
          <Haraka01Tab onGenerated={handleAIGenerated} />
        </div>
      </div>
    );
  }

  // ── Manual multi-step ─────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto pb-20 px-4 sm:px-0">
      <div className="flex items-center justify-between mb-8 sm:mb-10">
        <button
          onClick={() => step > 1 ? setStep(step - 1) : setMode(null)}
          className="flex items-center gap-2 text-[11px] font-black tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <button
          onClick={() => navigate("/client/roles")}
          className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
        >
          Cancel
        </button>
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 text-blue-600 text-[11px] font-bold tracking-widest">
          <BriefcaseBusiness className="w-3.5 h-3.5" />
          {editId ? "Edit role" : "Create role"} — manual
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
          {step === 1 && "Basic information"}
          {step === 2 && "Role description"}
          {step === 3 && "Skills & requirements"}
          {step === 4 && "Review & publish"}
        </h1>
      </div>

      {/* Step indicator — mobile-safe */}
      <div className="mb-6 sm:mb-8">
        <StepIndicator currentStep={step} />
      </div>

      <div className="p-5 sm:p-8 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18 }}
          >
            {step === 1 && <StepBasics data={form} onChange={updateField} />}
            {step === 2 && <StepDescription data={form} onChange={updateField} />}
            {step === 3 && <StepRequirements data={form} onChange={updateField} />}
            {step === 4 && <StepReview data={form} saving={saving} onPublish={() => handleSave("open")} onDraft={() => handleSave("draft")} />}
          </motion.div>
        </AnimatePresence>

        {step < 4 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border-color)]">
            <span className="text-[11px] font-black tracking-widest text-slate-500">
              Step {step} of {STEPS.length}
            </span>
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 bg-blue-600 text-white text-[10px] font-black tracking-widest rounded-xl hover:bg-blue-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-600/20"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}