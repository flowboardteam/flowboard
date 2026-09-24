/**
 * Haraka Agent Mia — Role Draft Review & Refinement Modal
 * Path: src/pages/client/roles/components/MiaRoleReviewModal.tsx
 *
 * Human-in-the-Loop review experience for AI-generated role requisitions.
 * Allows human recruiters to inspect, edit, add, remove, and refine sections
 * before committing data to the Flowboard role form.
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Check,
  X,
  Plus,
  Trash2,
  AlertTriangle,
  HelpCircle,
  BrainCircuit,
  RefreshCw,
  Send,
  Briefcase,
  Layers,
  ListChecks,
  CheckCircle2,
  FileText,
  Clock,
  Eye,
  Copy,
  MapPin,
  GraduationCap,
  Gift,
} from "lucide-react";
import { MiaRoleOutput } from "@/lib/haraka/types";
import { refineRoleWithMia, buildLaunchReadyMarkdown } from "@/lib/haraka/agents/miaJDAgent";

interface MiaRoleReviewModalProps {
  isOpen: boolean;
  draft: MiaRoleOutput;
  groupId: string;
  onApply: (approvedRole: MiaRoleOutput) => void;
  onClose: () => void;
}

export default function MiaRoleReviewModal({
  isOpen,
  draft: initialDraft,
  groupId,
  onApply,
  onClose,
}: MiaRoleReviewModalProps) {
  const [draft, setDraft] = useState<MiaRoleOutput>(initialDraft);
  const [activeTab, setActiveTab] = useState<"overview" | "responsibilities" | "qualifications" | "competencies" | "screening" | "preview">("overview");
  const [copiedPreview, setCopiedPreview] = useState(false);
  
  // Refinement state
  const [refineFeedback, setRefineFeedback] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);

  // New item inputs
  const [newResp, setNewResp] = useState("");
  const [newReqQual, setNewReqQual] = useState("");
  const [newPrefQual, setNewPrefQual] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [newQuestion, setNewQuestion] = useState("");

  if (!isOpen) return null;

  // ── Preview Markdown ───────────────────────────────────────────────────────
  const previewMarkdown = useMemo(() => buildLaunchReadyMarkdown(draft), [draft]);

  const handleCopyPreview = async () => {
    try {
      await navigator.clipboard.writeText(previewMarkdown);
      setCopiedPreview(true);
      setTimeout(() => setCopiedPreview(false), 2000);
    } catch {/* ignore */}
  };

  // ── Responsibilities Handlers ──────────────────────────────────────────────
  const handleAddResp = () => {
    if (!newResp.trim()) return;
    setDraft((prev) => ({
      ...prev,
      responsibilities: [...prev.responsibilities, newResp.trim()],
    }));
    setNewResp("");
  };

  const handleRemoveResp = (idx: number) => {
    setDraft((prev) => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== idx),
    }));
  };

  const handleUpdateResp = (idx: number, val: string) => {
    setDraft((prev) => {
      const copy = [...prev.responsibilities];
      copy[idx] = val;
      return { ...prev, responsibilities: copy };
    });
  };

  // ── Qualifications Handlers ────────────────────────────────────────────────
  const handleAddReqQual = () => {
    if (!newReqQual.trim()) return;
    setDraft((prev) => ({
      ...prev,
      requiredQualifications: [...prev.requiredQualifications, newReqQual.trim()],
    }));
    setNewReqQual("");
  };

  const handleRemoveReqQual = (idx: number) => {
    setDraft((prev) => ({
      ...prev,
      requiredQualifications: prev.requiredQualifications.filter((_, i) => i !== idx),
    }));
  };

  const handleAddPrefQual = () => {
    if (!newPrefQual.trim()) return;
    setDraft((prev) => ({
      ...prev,
      preferredQualifications: [...prev.preferredQualifications, newPrefQual.trim()],
    }));
    setNewPrefQual("");
  };

  const handleRemovePrefQual = (idx: number) => {
    setDraft((prev) => ({
      ...prev,
      preferredQualifications: prev.preferredQualifications.filter((_, i) => i !== idx),
    }));
  };

  // ── Skills Handlers ────────────────────────────────────────────────────────
  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    setDraft((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill.trim()],
    }));
    setNewSkill("");
  };

  const handleRemoveSkill = (idx: number) => {
    setDraft((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== idx),
    }));
  };

  // ── Screening Questions Handlers ───────────────────────────────────────────
  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    setDraft((prev) => ({
      ...prev,
      screeningQuestions: [...prev.screeningQuestions, newQuestion.trim()],
    }));
    setNewQuestion("");
  };

  const handleRemoveQuestion = (idx: number) => {
    setDraft((prev) => ({
      ...prev,
      screeningQuestions: prev.screeningQuestions.filter((_, i) => i !== idx),
    }));
  };

  // ── Refinement with Mia ────────────────────────────────────────────────────
  const handleRefine = async () => {
    if (!refineFeedback.trim() || isRefining) return;
    setIsRefining(true);
    setRefineError(null);
    try {
      const response = await refineRoleWithMia(draft, refineFeedback, groupId);
      if (response.success && response.parsedData) {
        setDraft(response.parsedData);
        setRefineFeedback("");
      } else {
        setRefineError(response.error || "Failed to refine draft with Mia.");
      }
    } catch (err: any) {
      setRefineError(err.message || "An unexpected error occurred during refinement.");
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-sm">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Mia's Role Draft</h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  AI-Assisted
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Review, edit, or refine sections before applying to the role requisition.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Missing Information / Warnings Banner */}
        {draft.missingInformation && draft.missingInformation.length > 0 && (
          <div className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-start gap-3 shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-300">
              <span className="font-semibold">Missing information identified: </span>
              {draft.missingInformation.join("; ")}
            </div>
          </div>
        )}

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-4 border-b border-slate-800/80 bg-slate-900/50 shrink-0 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "overview"
                ? "border-indigo-500 text-indigo-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Overview
          </button>
          <button
            onClick={() => setActiveTab("responsibilities")}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "responsibilities"
                ? "border-indigo-500 text-indigo-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" /> Responsibilities ({draft.responsibilities?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("qualifications")}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "qualifications"
                ? "border-indigo-500 text-indigo-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" /> Qualifications
          </button>
          <button
            onClick={() => setActiveTab("competencies")}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "competencies"
                ? "border-indigo-500 text-indigo-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Competencies ({draft.competencies?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("screening")}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "screening"
                ? "border-indigo-500 text-indigo-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" /> Screening ({draft.screeningQuestions?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "preview"
                ? "border-emerald-500 text-emerald-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-5">

              {/* Role Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Role Title
                </label>
                <input
                  type="text"
                  value={draft.jobTitle}
                  onChange={(e) => setDraft({ ...draft, jobTitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Role Summary */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Role Summary
                </label>
                <textarea
                  rows={4}
                  value={draft.summary}
                  onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Logistics Grid — Department, Type, Location, Education */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Department</span>
                  <input
                    type="text"
                    value={draft.department || ""}
                    placeholder="e.g. Engineering, Sales"
                    onChange={(e) => setDraft({ ...draft, department: e.target.value || null })}
                    className="w-full bg-transparent text-sm font-medium text-slate-200 outline-none border-b border-slate-800 focus:border-indigo-500 py-0.5"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Employment Type</span>
                  <select
                    value={draft.employmentType || ""}
                    onChange={(e) => setDraft({ ...draft, employmentType: e.target.value || null })}
                    className="w-full bg-transparent text-sm font-medium text-slate-200 outline-none border-b border-slate-800 focus:border-indigo-500 py-0.5 cursor-pointer"
                  >
                    <option value="" className="bg-slate-900">Select type...</option>
                    <option value="Full-time" className="bg-slate-900">Full-time</option>
                    <option value="Part-time" className="bg-slate-900">Part-time</option>
                    <option value="Contract" className="bg-slate-900">Contract</option>
                    <option value="Internship" className="bg-slate-900">Internship</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide flex items-center gap-1"><MapPin className="w-3 h-3" /> Work Model</span>
                  <select
                    value={draft.locationType || ""}
                    onChange={(e) => setDraft({ ...draft, locationType: e.target.value || null })}
                    className="w-full bg-transparent text-sm font-medium text-slate-200 outline-none border-b border-slate-800 focus:border-indigo-500 py-0.5 cursor-pointer"
                  >
                    <option value="" className="bg-slate-900">Select model...</option>
                    <option value="Remote" className="bg-slate-900">Remote</option>
                    <option value="Hybrid" className="bg-slate-900">Hybrid</option>
                    <option value="On-site" className="bg-slate-900">On-site</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide flex items-center gap-1"><MapPin className="w-3 h-3" /> Location Details</span>
                  <input
                    type="text"
                    value={draft.locationDetails || ""}
                    placeholder="e.g. Accra, Ghana / EST timezone"
                    onChange={(e) => setDraft({ ...draft, locationDetails: e.target.value || null })}
                    className="w-full bg-transparent text-sm font-medium text-slate-200 outline-none border-b border-slate-800 focus:border-indigo-500 py-0.5"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Experience Requirement</span>
                  <input
                    type="text"
                    value={draft.experienceRequirement || ""}
                    placeholder="e.g. 3–5 years"
                    onChange={(e) => setDraft({ ...draft, experienceRequirement: e.target.value || null })}
                    className="w-full bg-transparent text-sm font-medium text-slate-200 outline-none border-b border-slate-800 focus:border-indigo-500 py-0.5"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide flex items-center gap-1"><GraduationCap className="w-3 h-3" /> Education</span>
                  <input
                    type="text"
                    value={draft.educationRequirement || ""}
                    placeholder="e.g. BSc in Computer Science or equivalent"
                    onChange={(e) => setDraft({ ...draft, educationRequirement: e.target.value || null })}
                    className="w-full bg-transparent text-sm font-medium text-slate-200 outline-none border-b border-slate-800 focus:border-indigo-500 py-0.5"
                  />
                </div>

                <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Compensation</span>
                  <input
                    type="text"
                    value={draft.salaryGuidance || ""}
                    placeholder="e.g. $90,000 – $120,000 / year"
                    onChange={(e) => setDraft({ ...draft, salaryGuidance: e.target.value || null })}
                    className="w-full bg-transparent text-sm font-medium text-slate-200 outline-none border-b border-slate-800 focus:border-indigo-500 py-0.5"
                  />
                </div>
              </div>

              {/* Benefits */}
              {draft.benefits && draft.benefits.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5" /> Benefits & Perks
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {draft.benefits.map((benefit, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-900/20 text-emerald-300 text-xs font-medium border border-emerald-700/30"
                      >
                        {benefit}
                        <button
                          onClick={() => setDraft((prev) => ({ ...prev, benefits: prev.benefits?.filter((_, i) => i !== idx) }))}
                          className="hover:text-rose-400 transition-colors ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recruiter Notes */}
              {draft.notesForRecruiter && draft.notesForRecruiter.length > 0 && (
                <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-900/50 space-y-2">
                  <div className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Mia's Notes for Recruiter
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                    {draft.notesForRecruiter.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next Steps in Hiring Workflow (Clearly labeled Future Actions) */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Next Steps in Hiring Workflow
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/50">
                    Future Actions (Once Published)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 flex flex-col justify-between space-y-2 opacity-85">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-200">Have Sam source candidates</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Talent Scout will scan available talent profiles once the role is published.
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 w-fit">
                      Future Step (Next Milestone)
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 flex flex-col justify-between space-y-2 opacity-85">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-200">Have Randy prepare interview questions</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Interview Agent will generate adaptive competency rubrics during candidate screening.
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-blue-400/90 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 w-fit">
                      Future Step (Upcoming)
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 flex flex-col justify-between space-y-2 opacity-85">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-200">Have Arlan suggest compensation</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Hiring Advisor will benchmark compensation and offer packages once finalists emerge.
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-purple-400/90 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 w-fit">
                      Future Step (Upcoming)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RESPONSIBILITIES */}
          {activeTab === "responsibilities" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Key daily deliverables and role ownership responsibilities:
                </p>
                <span className="text-xs font-mono text-slate-500">
                  {draft.responsibilities.length} items
                </span>
              </div>

              <div className="space-y-2.5">
                {draft.responsibilities.map((resp, idx) => (
                  <div key={idx} className="flex items-start gap-2 group">
                    <span className="text-xs text-slate-500 font-mono mt-2.5 shrink-0">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={resp}
                      onChange={(e) => handleUpdateResp(idx, e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => handleRemoveResp(idx)}
                      className="p-2 text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add a new responsibility..."
                  value={newResp}
                  onChange={(e) => setNewResp(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddResp();
                  }}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleAddResp}
                  disabled={!newResp.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: QUALIFICATIONS & SKILLS */}
          {activeTab === "qualifications" && (
            <div className="space-y-6">
              {/* Technical Skills */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Technical Skills & Tools
                </label>
                <div className="flex flex-wrap gap-2">
                  {draft.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700"
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(idx)}
                        className="hover:text-rose-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1 max-w-sm">
                  <input
                    type="text"
                    placeholder="Add skill (e.g. PostgreSQL)..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddSkill();
                    }}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleAddSkill}
                    disabled={!newSkill.trim()}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Required Qualifications */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Required Qualifications (Must-Have)
                </label>
                <div className="space-y-2">
                  {draft.requiredQualifications.map((qual, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="flex-1 text-sm text-slate-200">{qual}</span>
                      <button
                        onClick={() => handleRemoveReqQual(idx)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add required qualification..."
                    value={newReqQual}
                    onChange={(e) => setNewReqQual(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddReqQual();
                    }}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleAddReqQual}
                    disabled={!newReqQual.trim()}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Preferred Qualifications */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Preferred Qualifications (Nice-to-Have)
                </label>
                <div className="space-y-2">
                  {draft.preferredQualifications.map((qual, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="flex-1 text-sm text-slate-200">{qual}</span>
                      <button
                        onClick={() => handleRemovePrefQual(idx)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add preferred qualification..."
                    value={newPrefQual}
                    onChange={(e) => setNewPrefQual(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddPrefQual();
                    }}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleAddPrefQual}
                    disabled={!newPrefQual.trim()}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COMPETENCIES */}
          {activeTab === "competencies" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Core competencies defined by Mia for downstream interview scoring and candidate assessment:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {draft.competencies.map((comp, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-white">{comp.name}</span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                          comp.importance === "required"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        }`}
                      >
                        {comp.importance}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{comp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SCREENING QUESTIONS */}
          {activeTab === "screening" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Recommended screening questions for initial candidate review:
              </p>
              <div className="space-y-2.5">
                {draft.screeningQuestions.map((q, idx) => (
                  <div key={idx} className="flex items-start gap-2 group">
                    <span className="text-xs text-slate-500 font-mono mt-2 shrink-0">
                      Q{idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={q}
                      onChange={(e) => {
                        const copy = [...draft.screeningQuestions];
                        copy[idx] = e.target.value;
                        setDraft({ ...draft, screeningQuestions: copy });
                      }}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => handleRemoveQuestion(idx)}
                      className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add custom screening question..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddQuestion();
                  }}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleAddQuestion}
                  disabled={!newQuestion.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: LAUNCH-READY PREVIEW */}
          {activeTab === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> Launch-Ready Preview
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    This is exactly how the job description will read when published to Flowboard Job Board and external boards.
                  </p>
                </div>
                <button
                  onClick={handleCopyPreview}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedPreview ? "Copied!" : "Copy Markdown"}
                </button>
              </div>

              {/* Rendered preview — clean prose layout */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 text-slate-900 shadow-sm border border-slate-200 font-sans leading-relaxed">
                {previewMarkdown.split("\n").map((line, idx) => {
                  if (line.startsWith("# ")) {
                    return (
                      <h1 key={idx} className="text-2xl font-bold text-slate-900 mb-2 leading-tight">
                        {line.replace(/^# /, "")}
                      </h1>
                    );
                  }
                  if (line.startsWith("## ")) {
                    return (
                      <h2 key={idx} className="text-base font-bold text-slate-800 mt-6 mb-2 uppercase tracking-wide border-b border-slate-200 pb-1">
                        {line.replace(/^## /, "")}
                      </h2>
                    );
                  }
                  if (line.startsWith("### ")) {
                    return (
                      <h3 key={idx} className="text-sm font-semibold text-slate-700 mt-3 mb-1">
                        {line.replace(/^### /, "")}
                      </h3>
                    );
                  }
                  if (line.startsWith("- ")) {
                    // Handle **bold** inside list items
                    const content = line.replace(/^- /, "");
                    const parts = content.split(/(\*\*[^*]+\*\*)/);
                    return (
                      <li key={idx} className="text-sm text-slate-700 ml-4 mb-1 list-disc">
                        {parts.map((part, i) =>
                          part.startsWith("**") && part.endsWith("**") ? (
                            <strong key={i}>{part.slice(2, -2)}</strong>
                          ) : (
                            part
                          )
                        )}
                      </li>
                    );
                  }
                  if (line === "---") {
                    return <hr key={idx} className="my-4 border-slate-200" />;
                  }
                  if (line.trim() === "") {
                    return <div key={idx} className="h-2" />;
                  }
                  // Inline bold support for metadata lines
                  const parts = line.split(/(\*\*[^*]+\*\*)/);
                  return (
                    <p key={idx} className="text-sm text-slate-600 mb-1">
                      {parts.map((part, i) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                          <strong key={i} className="text-slate-800">{part.slice(2, -2)}</strong>
                        ) : (
                          part
                        )
                      )}
                    </p>
                  );
                })}
              </div>

              <div className="p-3 bg-emerald-950/20 border border-emerald-800/30 rounded-xl text-[11px] text-emerald-400 flex items-center gap-2">
                <Check className="w-3.5 h-3.5 shrink-0" />
                Ready to publish. Click <strong className="text-white">"Apply to Role Form"</strong> below to transfer this draft to the role requisition form.
              </div>
            </div>
          )}
        </div>

        {/* Refinement Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask Mia to refine (e.g. 'Make tone more casual', 'Emphasize cloud architecture', 'Add mentoring')..."
              value={refineFeedback}
              onChange={(e) => setRefineFeedback(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRefine();
              }}
              disabled={isRefining}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleRefine}
              disabled={!refineFeedback.trim() || isRefining}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              {isRefining ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Refining...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Refine
                </>
              )}
            </button>
          </div>

          {refineError && (
            <p className="text-xs text-rose-400">{refineError}</p>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={onClose}
              className="text-xs font-medium text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg"
            >
              Discard / Cancel
            </button>
            <button
              onClick={() => onApply(draft)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              Apply to Role Form
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
