/**
 * Haraka Agent Mia — Job Description & Role Agent
 * Path: src/lib/haraka/agents/miaJDAgent.ts
 *
 * Mia assists recruiters and hiring managers in creating, structuring,
 * and refining comprehensive role requisitions with human-in-the-loop oversight.
 *
 * All AI communication flows securely through executeHarakaTask() -> Supabase Edge Function -> Anthropic.
 */

import { executeHarakaTask } from "../gateway";
import {
  MiaRoleInput,
  MiaRoleOutput,
  HarakaGatewayResponse,
} from "../types";

/**
 * Serializes user role input into a clear, structured prompt for Mia.
 */
function buildMiaPrompt(input: MiaRoleInput): string {
  const parts: string[] = [];

  parts.push("Please generate a complete, structured, and launch-ready job description draft based on the following hiring requirements:");

  if (input.roleTitle?.trim()) {
    parts.push(`- Role Title: ${input.roleTitle.trim()}`);
  }
  if (input.department?.trim()) {
    parts.push(`- Department: ${input.department.trim()}`);
  }
  if (input.employmentType?.trim()) {
    parts.push(`- Employment Type: ${input.employmentType.trim()}`);
  }
  if (input.location?.trim()) {
    parts.push(`- Location: ${input.location.trim()}`);
  }
  if (input.experienceLevel?.trim()) {
    parts.push(`- Experience Level: ${input.experienceLevel.trim()}`);
  }
  if (input.salaryRange?.trim()) {
    parts.push(`- Salary Range / Guidance: ${input.salaryRange.trim()}`);
  }
  if (input.companyContext?.trim()) {
    parts.push(`- Company / Team Context: ${input.companyContext.trim()}`);
  }
  if (input.responsibilities && input.responsibilities.length > 0) {
    const list = input.responsibilities.map((r) => `  * ${r}`).join("\n");
    parts.push(`- Key Responsibilities to Include:\n${list}`);
  }
  if (input.requirements && input.requirements.length > 0) {
    const list = input.requirements.map((req) => `  * ${req}`).join("\n");
    parts.push(`- Key Requirements / Skills to Include:\n${list}`);
  }
  if (input.additionalNotes?.trim()) {
    parts.push(`- Additional Recruiter Notes & Hiring Criteria:\n${input.additionalNotes.trim()}`);
  }

  parts.push("\nFormatting & Launch Requirements:");
  parts.push("- Ensure all fields needed to launch on the Flowboard Job Board and external job boards (LinkedIn, Indeed, etc.) are fully populated: title, department, employmentType, locationType, locationDetails, summary, responsibilities, requiredQualifications, preferredQualifications, skills, competencies, experienceRequirement, educationRequirement, benefits, screeningQuestions, and formattedDescription.");
  parts.push("- Ensure the tone is engaging, professional, and launch-ready.");
  parts.push("- If any critical details are missing, note them in 'missingInformation' rather than fabricating company facts.");

  return parts.join("\n");
}

/**
 * Builds a clean, launch-ready Markdown job description ready for Flowboard
 * Job Board publication and external job board syndication (LinkedIn, Indeed, etc.).
 */
export function buildLaunchReadyMarkdown(draft: MiaRoleOutput): string {
  if (draft.formattedDescription && draft.formattedDescription.trim().length > 50) {
    return draft.formattedDescription.trim();
  }

  const lines: string[] = [];

  // Header / Title
  lines.push(`# ${draft.jobTitle || "Job Requisition"}\n`);

  // Key Metadata Bar
  const meta: string[] = [];
  if (draft.department) meta.push(`**Department:** ${draft.department}`);
  if (draft.employmentType) meta.push(`**Type:** ${draft.employmentType}`);
  if (draft.locationType) {
    const locStr = draft.locationDetails ? `${draft.locationType} (${draft.locationDetails})` : draft.locationType;
    meta.push(`**Location:** ${locStr}`);
  }
  if (draft.experienceRequirement) meta.push(`**Experience:** ${draft.experienceRequirement}`);
  if (draft.salaryGuidance) meta.push(`**Compensation:** ${draft.salaryGuidance}`);

  if (meta.length > 0) {
    lines.push(meta.join("  |  ") + "\n");
    lines.push("---\n");
  }

  // Summary / About the Role
  lines.push("## About the Role\n");
  lines.push(draft.summary || "No overview provided.");
  lines.push("");

  // Responsibilities
  if (draft.responsibilities && draft.responsibilities.length > 0) {
    lines.push("## Key Responsibilities\n");
    draft.responsibilities.forEach((r) => lines.push(`- ${r}`));
    lines.push("");
  }

  // Qualifications
  if (
    (draft.requiredQualifications && draft.requiredQualifications.length > 0) ||
    (draft.preferredQualifications && draft.preferredQualifications.length > 0) ||
    draft.educationRequirement
  ) {
    lines.push("## Qualifications & Experience\n");

    if (draft.educationRequirement) {
      lines.push(`- **Education:** ${draft.educationRequirement}`);
    }

    if (draft.requiredQualifications && draft.requiredQualifications.length > 0) {
      lines.push("\n### Required:");
      draft.requiredQualifications.forEach((q) => lines.push(`- ${q}`));
    }

    if (draft.preferredQualifications && draft.preferredQualifications.length > 0) {
      lines.push("\n### Preferred:");
      draft.preferredQualifications.forEach((q) => lines.push(`- ${q}`));
    }
    lines.push("");
  }

  // Skills & Competencies
  if ((draft.skills && draft.skills.length > 0) || (draft.competencies && draft.competencies.length > 0)) {
    lines.push("## Core Competencies & Skills\n");
    if (draft.skills && draft.skills.length > 0) {
      lines.push(`**Key Skills:** ${draft.skills.join(", ")}\n`);
    }
    if (draft.competencies && draft.competencies.length > 0) {
      draft.competencies.forEach((c) => {
        lines.push(`- **${c.name}** (${c.importance}): ${c.description}`);
      });
      lines.push("");
    }
  }

  // Benefits & Perks
  if (draft.benefits && draft.benefits.length > 0) {
    lines.push("## What We Offer (Benefits & Perks)\n");
    draft.benefits.forEach((b) => lines.push(`- ${b}`));
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Draft a structured job description with Mia.
 *
 * @param input The role input provided by the recruiter
 * @param groupId The active organization group ID (enforces tenant isolation)
 * @param options Optional model or prompt overrides
 */
export async function draftRoleWithMia(
  input: MiaRoleInput,
  groupId: string,
  options?: {
    modelOverride?: string;
    temperature?: number;
  }
): Promise<HarakaGatewayResponse<MiaRoleOutput>> {
  if (!groupId) {
    return {
      success: false,
      task: "JD_GENERATION",
      agentId: "mia",
      model: "unknown",
      content: "",
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      latencyMs: 0,
      timestamp: new Date().toISOString(),
      error: "Active organization group is required for role generation.",
      code: "MISSING_GROUP_ID",
    };
  }

  const prompt = buildMiaPrompt(input);

  const response = await executeHarakaTask<MiaRoleOutput>({
    task: "JD_GENERATION",
    agentId: "mia",
    groupId,
    prompt,
    modelOverride: options?.modelOverride,
    temperature: options?.temperature,
    metadata: {
      action: "draft_role",
      roleTitleInput: input.roleTitle || "Untitled Role",
    },
  });

  return response;
}

/**
 * Refine an existing Mia role draft based on human recruiter feedback.
 *
 * @param currentDraft The existing draft produced by Mia
 * @param feedback The human recruiter's refinement instructions
 * @param groupId The active organization group ID
 */
export async function refineRoleWithMia(
  currentDraft: MiaRoleOutput,
  feedback: string,
  groupId: string
): Promise<HarakaGatewayResponse<MiaRoleOutput>> {
  if (!groupId) {
    return {
      success: false,
      task: "JD_IMPROVEMENT",
      agentId: "mia",
      model: "unknown",
      content: "",
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      latencyMs: 0,
      timestamp: new Date().toISOString(),
      error: "Active organization group is required for role refinement.",
      code: "MISSING_GROUP_ID",
    };
  }

  const prompt = `Here is the current draft of the role:
${JSON.stringify(currentDraft, null, 2)}

The recruiter has requested the following refinement:
"${feedback.trim()}"

Please apply this refinement, preserving the existing strengths of the draft, and return the complete updated role object matching the exact JSON schema.`;

  const response = await executeHarakaTask<MiaRoleOutput>({
    task: "JD_IMPROVEMENT",
    agentId: "mia",
    groupId,
    prompt,
    metadata: {
      action: "refine_role",
      roleTitle: currentDraft.jobTitle,
      feedbackLength: feedback.length,
    },
  });

  return response;
}
