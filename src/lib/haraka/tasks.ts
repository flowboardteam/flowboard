/**
 * Haraka Task Registry
 * Path: src/lib/haraka/tasks.ts
 *
 * Typed registry of all 15 autonomous workforce tasks.
 * Defines execution defaults, retry policies, model assignments, and safety requirements.
 */

import { HarakaTaskType, TaskDefinition } from "./types";

export const HARAKA_TASK_REGISTRY: Record<HarakaTaskType, TaskDefinition> = {
  JD_GENERATION: {
    type: "JD_GENERATION",
    displayName: "Job Description Generation",
    description: "Generates comprehensive, market-competitive role descriptions, responsibilities, and skill requirements.",
    associatedAgent: "mia",
    defaultModelId: "claude-sonnet-4-6",
    maxOutputTokens: 4096,
    temperature: 0.2,
    timeoutMs: 30000,
    retryPolicy: { maxRetries: 2, initialBackoffMs: 1000, maxBackoffMs: 4000 },
    toolsAllowed: true,
    requiresHumanApproval: false,
  },

  JD_IMPROVEMENT: {
    type: "JD_IMPROVEMENT",
    displayName: "Job Description Optimization",
    description: "Refines, modernizes, and optimizes existing job descriptions based on hiring manager feedback.",
    associatedAgent: "mia",
    defaultModelId: "claude-sonnet-4-6",
    maxOutputTokens: 4096,
    temperature: 0.2,
    timeoutMs: 25000,
    retryPolicy: { maxRetries: 2, initialBackoffMs: 1000, maxBackoffMs: 4000 },
    toolsAllowed: true,
    requiresHumanApproval: false,
  },

  TALENT_SEARCH: {
    type: "TALENT_SEARCH",
    displayName: "Talent Discovery & Sourcing",
    description: "Expands natural language search queries into high-signal technical developer search parameters.",
    associatedAgent: "sam",
    defaultModelId: "claude-sonnet-4-6",
    maxOutputTokens: 2048,
    temperature: 0.1,
    timeoutMs: 20000,
    retryPolicy: { maxRetries: 3, initialBackoffMs: 500, maxBackoffMs: 2000 },
    toolsAllowed: true,
    requiresHumanApproval: false,
  },

  TALENT_MATCHING: {
    type: "TALENT_MATCHING",
    displayName: "Talent Profile Evaluation & Scoring",
    description: "Evaluates candidate skills, repositories, and experience against requisition requirements.",
    associatedAgent: "sam",
    defaultModelId: "claude-sonnet-4-6",
    maxOutputTokens: 3000,
    temperature: 0.1,
    timeoutMs: 25000,
    retryPolicy: { maxRetries: 2, initialBackoffMs: 1000, maxBackoffMs: 3000 },
    toolsAllowed: false,
    requiresHumanApproval: false,
  },

  TALENT_SUMMARY: {
    type: "TALENT_SUMMARY",
    displayName: "Candidate Profile Synthesis",
    description: "Synthesizes multi-source profile data into concise, recruiter-ready briefings.",
    associatedAgent: "sam",
    defaultModelId: "claude-sonnet-4-6",
    maxOutputTokens: 2048,
    temperature: 0.2,
    timeoutMs: 15000,
    retryPolicy: { maxRetries: 2, initialBackoffMs: 500, maxBackoffMs: 2000 },
    toolsAllowed: false,
    requiresHumanApproval: false,
  },

  INTERVIEW_PLANNING: {
    type: "INTERVIEW_PLANNING",
    displayName: "Interview Competency Blueprint",
    description: "Analyzes job requirements and creates structured competency rubrics, weights, and evaluation criteria.",
    associatedAgent: "randy",
    defaultModelId: "claude-sonnet-4-6",
    maxOutputTokens: 4096,
    temperature: 0.2,
    timeoutMs: 30000,
    retryPolicy: { maxRetries: 2, initialBackoffMs: 1000, maxBackoffMs: 4000 },
    toolsAllowed: true,
    requiresHumanApproval: false,
  },

  INTERVIEW_QUESTION: {
    type: "INTERVIEW_QUESTION",
    displayName: "Adaptive Interview Question Generation",
    description: "Generates tailored, conversational technical interview questions evaluating active competencies.",
    associatedAgent: "randy",
    defaultModelId: "claude-sonnet-4-6",
    maxOutputTokens: 1024,
    temperature: 0.3,
    timeoutMs: 15000,
    retryPolicy: { maxRetries: 2, initialBackoffMs: 500, maxBackoffMs: 2000 },
    toolsAllowed: false,
    requiresHumanApproval: false,
  },

  INTERVIEW_FOLLOWUP: {
    type: "INTERVIEW_FOLLOWUP",
    displayName: "Interview Deep-Dive Follow-Up",
    description: "Asks probing technical follow-ups to extract concrete evidence from candidate answers.",
    associatedAgent: "randy",
    defaultModelId: "claude-sonnet-4-6",
    maxOutputTokens: 1024,
    temperature: 0.3,
    timeoutMs: 15000,
    retryPolicy: { maxRetries: 2, initialBackoffMs: 500, maxBackoffMs: 2000 },
    toolsAllowed: false,
    requiresHumanApproval: false,
  },

  INTERVIEW_SCORING: {
    type: "INTERVIEW_SCORING",
    displayName: "Interview Evaluation & Scorecard",
    description: "Evaluates full interview transcripts against competency rubrics to produce evidence-based scores.",
    associatedAgent: "randy",
    defaultModelId: "claude-sonnet-4-6",
    maxOutputTokens: 4096,
    temperature: 0.1,
    timeoutMs: 40000,
    retryPolicy: { maxRetries: 2, initialBackoffMs: 1500, maxBackoffMs: 5000 },
    toolsAllowed: false,
    requiresHumanApproval: false,
  },

  CANDIDATE_COMPARISON: {
    type: "CANDIDATE_COMPARISON",
    displayName: "Multi-Candidate Pipeline Benchmarking",
    description: "Compares shortlisted candidates side-by-side to highlight relative strengths, trade-offs, and gaps.",
    associatedAgent: "arlan",
    defaultModelId: "claude-sonnet-4-6",
    maxOutputTokens: 4096,
    temperature: 0.2,
    timeoutMs: 35000,
    retryPolicy: { maxRetries: 2, initialBackoffMs: 1000, maxBackoffMs: 4000 },
    toolsAllowed: true,
    requiresHumanApproval: false,
  },

  HIRING_RECOMMENDATION: {
    type: "HIRING_RECOMMENDATION",
    displayName: "Hiring Decision Advisory",
    description: "Recommends hiring decisions, compensation proposals, or stage advancements based on all pipeline signals.",
    associatedAgent: "arlan",
    defaultModelId: "claude-sonnet-4-6",
    maxOutputTokens: 4096,
    temperature: 0.1,
    timeoutMs: 35000,
    retryPolicy: { maxRetries: 2, initialBackoffMs: 1000, maxBackoffMs: 4000 },
    toolsAllowed: true,
    requiresHumanApproval: true, // Strict recruiter approval gate for hiring moves
  },

  COMPLIANCE_CHECK: {
    type: "COMPLIANCE_CHECK",
    displayName: "EOR & Contractor Compliance Verification",
    description: "Evaluates employment classifications, statutory country rules, and contractor agreements.",
    associatedAgent: "jane",
    defaultModelId: "claude-sonnet-4-6",
    maxOutputTokens: 3000,
    temperature: 0.1,
    timeoutMs: 30000,
    retryPolicy: { maxRetries: 2, initialBackoffMs: 1000, maxBackoffMs: 4000 },
    toolsAllowed: false,
    requiresHumanApproval: false,
  },

  ONBOARDING: {
    type: "ONBOARDING",
    displayName: "Workforce Onboarding Plan",
    description: "Generates customized onboarding checklists, milestone schedules, and documentation requirements.",
    associatedAgent: "jane",
    defaultModelId: "claude-sonnet-4-6",
    maxOutputTokens: 3000,
    temperature: 0.2,
    timeoutMs: 25000,
    retryPolicy: { maxRetries: 2, initialBackoffMs: 1000, maxBackoffMs: 3000 },
    toolsAllowed: false,
    requiresHumanApproval: false,
  },

  WORKFORCE_ASSISTANCE: {
    type: "WORKFORCE_ASSISTANCE",
    displayName: "Workforce Operations & Amendments",
    description: "Drafts contract amendments, salary adjustments, and operational changes for existing team members.",
    associatedAgent: "jane",
    defaultModelId: "claude-sonnet-4-6",
    maxOutputTokens: 3000,
    temperature: 0.1,
    timeoutMs: 30000,
    retryPolicy: { maxRetries: 2, initialBackoffMs: 1000, maxBackoffMs: 4000 },
    toolsAllowed: true,
    requiresHumanApproval: true, // Contract amendments require human confirmation
  },

  GENERAL_ASSISTANT: {
    type: "GENERAL_ASSISTANT",
    displayName: "Haraka General Assistant",
    description: "General-purpose workforce intelligence, Q&A, and system diagnostics.",
    associatedAgent: "system",
    defaultModelId: "claude-sonnet-4-6",
    maxOutputTokens: 2048,
    temperature: 0.3,
    timeoutMs: 20000,
    retryPolicy: { maxRetries: 2, initialBackoffMs: 500, maxBackoffMs: 2000 },
    toolsAllowed: false,
    requiresHumanApproval: false,
  },
};

/**
 * Get task definition by type
 */
export function getTaskDefinition(type: HarakaTaskType): TaskDefinition {
  const task = HARAKA_TASK_REGISTRY[type];
  if (!task) {
    throw new Error(`Unknown Haraka task type: ${type}`);
  }
  return task;
}

/**
 * List all task definitions
 */
export function getAllTasks(): TaskDefinition[] {
  return Object.values(HARAKA_TASK_REGISTRY);
}
