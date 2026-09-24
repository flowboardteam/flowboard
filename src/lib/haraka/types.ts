/**
 * Haraka AI Workforce Core Types
 * Path: src/lib/haraka/types.ts
 */

export type HarakaAgentId = "mia" | "sam" | "randy" | "arlan" | "jane" | "system";

export type AIProvider = "anthropic" | "openai" | "google";

export type HarakaTaskType =
  | "JD_GENERATION"
  | "JD_IMPROVEMENT"
  | "TALENT_SEARCH"
  | "TALENT_MATCHING"
  | "TALENT_SUMMARY"
  | "INTERVIEW_PLANNING"
  | "INTERVIEW_QUESTION"
  | "INTERVIEW_FOLLOWUP"
  | "INTERVIEW_SCORING"
  | "CANDIDATE_COMPARISON"
  | "HIRING_RECOMMENDATION"
  | "COMPLIANCE_CHECK"
  | "ONBOARDING"
  | "WORKFORCE_ASSISTANCE"
  | "GENERAL_ASSISTANT";

export interface RetryPolicy {
  maxRetries: number;
  initialBackoffMs: number;
  maxBackoffMs: number;
}

export interface TaskDefinition {
  type: HarakaTaskType;
  displayName: string;
  description: string;
  associatedAgent: HarakaAgentId;
  defaultModelId: string;
  maxOutputTokens: number;
  temperature: number;
  timeoutMs: number;
  retryPolicy: RetryPolicy;
  toolsAllowed: boolean;
  requiresHumanApproval: boolean;
}

export interface ModelDefinition {
  id: string;
  provider: AIProvider;
  modelId: string;
  displayName: string;
  isActive: boolean;
  taskSuitability: HarakaTaskType[];
  maxOutputTokens: number;
  contextWindow: number;
  costMetadata: {
    inputCostPerMillion: number;
    outputCostPerMillion: number;
    currency: string;
  };
  priority: number; // Lower = higher preference
  supportsThinking?: boolean;
}

export interface PromptTemplate {
  agent: HarakaAgentId;
  task: HarakaTaskType;
  version: string;
  systemInstructions: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HarakaGatewayRequestOptions {
  task: HarakaTaskType;
  groupId: string;
  prompt: string;
  agentId?: HarakaAgentId;
  systemPromptOverride?: string;
  modelOverride?: string;
  temperature?: number;
  maxTokens?: number;
  metadata?: Record<string, any>;
}

export interface HarakaTokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface HarakaGatewayResponse<T = any> {
  success: boolean;
  task: HarakaTaskType;
  agentId: HarakaAgentId;
  model: string;
  content: string;
  parsedData?: T;
  usage: HarakaTokenUsage;
  latencyMs: number;
  timestamp: string;
  error?: string;
  code?: string;
}

// ── Agent Mia (Job Description & Role Agent) Types ───────────────────────────

export interface MiaRoleInput {
  roleTitle?: string;
  department?: string | null;
  employmentType?: string | null;
  location?: string | null;
  experienceLevel?: string | null;
  salaryRange?: string | null;
  companyContext?: string | null;
  requirements?: string[];
  responsibilities?: string[];
  additionalNotes?: string | null;
}

export interface MiaCompetency {
  name: string;
  description: string;
  importance: "required" | "preferred";
}

export interface MiaRoleOutput {
  jobTitle: string;
  department?: string | null;
  employmentType?: string | null;
  locationType?: string | null;
  locationDetails?: string | null;
  summary: string;
  responsibilities: string[];
  requiredQualifications: string[];
  preferredQualifications: string[];
  skills: string[];
  competencies: MiaCompetency[];
  experienceRequirement: string | null;
  educationRequirement?: string | null;
  salaryGuidance: string | null;
  benefits?: string[];
  screeningQuestions: string[];
  formattedDescription?: string | null;
  missingInformation: string[];
  notesForRecruiter: string[];
}


