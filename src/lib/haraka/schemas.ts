/**
 * Haraka Structured Output Validation Schemas
 * Path: src/lib/haraka/schemas.ts
 *
 * Enforces task-specific JSON schemas using Zod.
 * Rejects malformed or hallucinated responses before they reach the database or UI.
 */

import { z } from "zod";
import { HarakaTaskType } from "./types";

// ── 1. General Assistant Schema ──────────────────────────────────────────────
export const GeneralAssistantOutputSchema = z.object({
  answer: z.string().min(1),
  keyPoints: z.array(z.string()).optional(),
  suggestedFollowUps: z.array(z.string()).optional(),
});

// ── 2. Job Description Generation Schema (Mia) ──────────────────────────────
export const MiaCompetencySchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
  importance: z.enum(["required", "preferred"]),
});

export const JDGenerationOutputSchema = z.object({
  jobTitle: z.string().min(2),
  department: z.string().nullable().default(null),
  employmentType: z.string().nullable().default("Full-time"),
  locationType: z.string().nullable().default("Remote"),
  locationDetails: z.string().nullable().default(""),
  summary: z.string().min(10),
  responsibilities: z.array(z.string()).min(1),
  requiredQualifications: z.array(z.string()).default([]),
  preferredQualifications: z.array(z.string()).default([]),
  skills: z.array(z.string()).min(1),
  competencies: z.array(MiaCompetencySchema).default([]),
  experienceRequirement: z.string().nullable().default(null),
  educationRequirement: z.string().nullable().default(null),
  salaryGuidance: z.string().nullable().default(null),
  benefits: z.array(z.string()).default([]),
  screeningQuestions: z.array(z.string()).default([]),
  formattedDescription: z.string().nullable().optional(),
  missingInformation: z.array(z.string()).default([]),
  notesForRecruiter: z.array(z.string()).default([]),
});

export type JDGenerationOutput = z.infer<typeof JDGenerationOutputSchema>;

// ── 3. Talent Search Spec Schema (Sam) ──────────────────────────────────────
export const TalentSearchOutputSchema = z.object({
  role_title: z.string(),
  experience_level: z.enum(["Junior", "Mid", "Senior", "Lead", "Expert"]),
  skills: z.array(z.string()).min(1),
  nice_to_have: z.array(z.string()).default([]),
  location: z.string(),
  location_flexible: z.boolean().default(true),
  search_terms: z.array(z.string()).min(1),
  urgency: z.enum(["High", "Medium", "Low"]).default("Medium"),
});

// ── 4. Talent Match Score Schema (Sam) ──────────────────────────────────────
export const TalentMatchingOutputSchema = z.object({
  matchScore: z.number().min(0).max(100),
  seniorityLabel: z.string(),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()).default([]),
  strengths: z.array(z.string()).min(1),
  concerns: z.array(z.string()).default([]),
  rationale: z.string().min(10),
});

// ── 5. Interview Blueprint Planning Schema (Randy) ──────────────────────────
export const InterviewPlanningOutputSchema = z.object({
  competencies: z.array(
    z.object({
      name: z.string().min(2),
      weight_percentage: z.number().min(5).max(100),
      description: z.string().min(10),
      evaluation_criteria: z.record(z.string(), z.string()).or(
        z.object({
          "1": z.string(),
          "3": z.string(),
          "5": z.string(),
        })
      ),
      suggested_questions: z.array(z.string()).min(1),
    })
  ).min(2),
  estimated_duration_minutes: z.number().default(30),
});

// ── 6. Interview Question Schema (Randy) ─────────────────────────────────────
export const InterviewQuestionOutputSchema = z.object({
  action: z.enum(["ask_question", "follow_up", "wrap_up"]),
  competency: z.string(),
  question: z.string().min(10),
  reason: z.string(),
});

// ── 7. Interview Scoring Report Schema (Randy) ──────────────────────────────
export const InterviewScoringOutputSchema = z.object({
  overall_score: z.number().min(0).max(100),
  recommendation: z.enum([
    "Strongly Recommend",
    "Recommend",
    "Consider",
    "Further Assessment",
    "Not Recommended",
  ]),
  summary: z.string().min(20),
  key_strengths: z.array(z.string()).min(1),
  key_concerns: z.array(z.string()),
  competency_scores: z.array(
    z.object({
      name: z.string(),
      score: z.number().min(0).max(100),
      evidence: z.array(z.string()).min(1),
    })
  ),
});

// ── 8. Candidate Comparison Schema (Arlan) ──────────────────────────────────
export const CandidateComparisonOutputSchema = z.object({
  comparisonSummary: z.string().min(20),
  rankings: z.array(
    z.object({
      candidateId: z.string(),
      candidateName: z.string(),
      rank: z.number(),
      score: z.number().min(0).max(100),
      keyDifferentiator: z.string(),
    })
  ),
  recommendedNextSteps: z.array(z.string()),
});

// ── 9. Hiring Recommendation Schema (Arlan) ────────────────────────────────
export const HiringRecommendationOutputSchema = z.object({
  decision: z.enum(["HIRE", "PASS", "ADDITIONAL_ROUND"]),
  recommendedSalary: z.string().optional(),
  rationale: z.string().min(20),
  risks: z.array(z.string()).default([]),
  onboardingFocusAreas: z.array(z.string()).default([]),
  requiresHumanApproval: z.literal(true),
});

// ── 10. Compliance Check Schema (Jane) ──────────────────────────────────────
export const ComplianceCheckOutputSchema = z.object({
  recommendedModel: z.enum(["eor", "contractor", "direct"]),
  country: z.string(),
  complianceScore: z.number().min(0).max(100),
  risksIdentified: z.array(z.string()),
  statutoryRequirements: z.array(z.string()),
  standardBenefits: z.array(z.string()),
});

// ── Schema Registry Mapping ──────────────────────────────────────────────────
export const TASK_SCHEMA_MAP: Partial<Record<HarakaTaskType, z.ZodTypeAny>> = {
  GENERAL_ASSISTANT: GeneralAssistantOutputSchema,
  JD_GENERATION: JDGenerationOutputSchema,
  JD_IMPROVEMENT: JDGenerationOutputSchema,
  TALENT_SEARCH: TalentSearchOutputSchema,
  TALENT_MATCHING: TalentMatchingOutputSchema,
  INTERVIEW_PLANNING: InterviewPlanningOutputSchema,
  INTERVIEW_QUESTION: InterviewQuestionOutputSchema,
  INTERVIEW_FOLLOWUP: InterviewQuestionOutputSchema,
  INTERVIEW_SCORING: InterviewScoringOutputSchema,
  CANDIDATE_COMPARISON: CandidateComparisonOutputSchema,
  HIRING_RECOMMENDATION: HiringRecommendationOutputSchema,
  COMPLIANCE_CHECK: ComplianceCheckOutputSchema,
};

/**
 * Validate and safely parse task outputs
 */
export function validateTaskOutput<T = any>(
  task: HarakaTaskType,
  rawContent: string | Record<string, any>
): { success: true; data: T } | { success: false; error: string } {
  const schema = TASK_SCHEMA_MAP[task];

  // If no strict schema is mapped, return raw string or object safely
  if (!schema) {
    if (typeof rawContent === "object" && rawContent !== null) {
      return { success: true, data: rawContent as T };
    }
    return { success: true, data: { text: rawContent } as T };
  }

  // Parse JSON if rawContent is a string
  let parsedJson: any;
  if (typeof rawContent === "string") {
    try {
      let cleaned = rawContent
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      if (start !== -1 && end !== -1) {
        cleaned = cleaned.slice(start, end + 1);
      }

      parsedJson = JSON.parse(cleaned);
    } catch (parseError: any) {
      // Fallback for simple assistant text answers
      if (task === "GENERAL_ASSISTANT") {
        return { success: true, data: { answer: rawContent.trim() } as T };
      }
      return {
        success: false,
        error: `Failed to parse AI JSON response: ${parseError.message}`,
      };
    }
  } else {
    parsedJson = rawContent;
  }

  // Run Zod validation
  const validation = schema.safeParse(parsedJson);
  if (!validation.success) {
    const errorDetails = validation.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    return {
      success: false,
      error: `AI output failed schema validation (${task}): ${errorDetails}`,
    };
  }

  return { success: true, data: validation.data as T };
}
