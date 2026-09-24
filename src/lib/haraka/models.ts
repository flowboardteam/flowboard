/**
 * Haraka Configurable Model Registry
 * Path: src/lib/haraka/models.ts
 *
 * Open, provider-agnostic model registry.
 * Configures models, token boundaries, pricing metadata, and task suitability.
 */

import { ModelDefinition, HarakaTaskType } from "./types";

export const HARAKA_MODEL_REGISTRY: Record<string, ModelDefinition> = {
  // Anthropic Current Generation Model
  "claude-sonnet-4-6": {
    id: "claude-sonnet-4-6",
    provider: "anthropic",
    modelId: "claude-sonnet-4-6",
    displayName: "Claude Sonnet 4.6",
    isActive: true,
    taskSuitability: [
      "JD_GENERATION",
      "JD_IMPROVEMENT",
      "TALENT_SEARCH",
      "TALENT_MATCHING",
      "TALENT_SUMMARY",
      "INTERVIEW_PLANNING",
      "INTERVIEW_QUESTION",
      "INTERVIEW_FOLLOWUP",
      "INTERVIEW_SCORING",
      "CANDIDATE_COMPARISON",
      "HIRING_RECOMMENDATION",
      "COMPLIANCE_CHECK",
      "ONBOARDING",
      "WORKFORCE_ASSISTANCE",
      "GENERAL_ASSISTANT",
    ],
    maxOutputTokens: 8192,
    contextWindow: 200000,
    costMetadata: {
      inputCostPerMillion: 3.0,
      outputCostPerMillion: 15.0,
      currency: "USD",
    },
    priority: 1,
    supportsThinking: true,
  },
};

/**
 * Get all registered models
 */
export function getAllModels(): ModelDefinition[] {
  return Object.values(HARAKA_MODEL_REGISTRY);
}

/**
 * Get only active models, sorted by priority (lowest priority number = preferred)
 */
export function getActiveModels(): ModelDefinition[] {
  return Object.values(HARAKA_MODEL_REGISTRY)
    .filter((m) => m.isActive)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Retrieve a model by registry ID or upstream modelId
 */
export function getModelById(idOrModelId: string): ModelDefinition | undefined {
  if (HARAKA_MODEL_REGISTRY[idOrModelId]) {
    return HARAKA_MODEL_REGISTRY[idOrModelId];
  }
  return Object.values(HARAKA_MODEL_REGISTRY).find(
    (m) => m.modelId === idOrModelId
  );
}

export const getModelDefinition = getModelById;

/**
 * Resolve the best default model for a given task type
 */
export function getDefaultModelForTask(task: HarakaTaskType): ModelDefinition {
  const suitableActive = getActiveModels().filter((m) =>
    m.taskSuitability.includes(task)
  );

  if (suitableActive.length > 0) {
    return suitableActive[0];
  }

  // Fallback to highest priority active model
  return getActiveModels()[0] || HARAKA_MODEL_REGISTRY["claude-sonnet-4-6"];
}
