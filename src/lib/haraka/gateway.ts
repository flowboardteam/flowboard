/**
 * Haraka AI Gateway Client SDK
 * Path: src/lib/haraka/gateway.ts
 *
 * Secure client-side dispatcher invoking the server-side Supabase Edge Function gateway.
 * Enforces task defaults, retry policies with exponential backoff, and structured Zod validation.
 */

import { supabase } from "@/lib/supabase";
import {
  HarakaGatewayRequestOptions,
  HarakaGatewayResponse,
  HarakaTaskType,
  HarakaAgentId,
} from "./types";
import { HARAKA_TASK_REGISTRY, getTaskDefinition } from "./tasks";
import { HARAKA_MODEL_REGISTRY, getModelDefinition } from "./models";
import { getActivePrompt } from "./prompts";
import { validateTaskOutput } from "./schemas";

/**
 * Sleep helper for retry backoff
 */
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Execute a Haraka AI task securely through the Supabase Edge Function gateway.
 * Never calls Anthropic directly from the client.
 */
export async function executeHarakaTask<T = any>(
  options: HarakaGatewayRequestOptions
): Promise<HarakaGatewayResponse<T>> {
  const startTime = Date.now();
  const taskDef = getTaskDefinition(options.task);
  const agentId: HarakaAgentId = options.agentId || taskDef?.associatedAgent || "system";

  // 1. Verify Authentication
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session?.access_token) {
    return {
      success: false,
      task: options.task,
      agentId,
      model: "unknown",
      content: "",
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      latencyMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      error: "User is not authenticated. Please log in to use Haraka AI.",
      code: "UNAUTHORIZED",
    };
  }

  // 2. Validate Tenant Group Scope
  if (!options.groupId) {
    return {
      success: false,
      task: options.task,
      agentId,
      model: "unknown",
      content: "",
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      latencyMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      error: "Missing required 'groupId' for tenant isolation.",
      code: "MISSING_GROUP_ID",
    };
  }

  // 3. Resolve Model and Settings
  const modelKey = options.modelOverride || taskDef?.defaultModelId || "claude-sonnet-4-6";
  const modelDef = getModelDefinition(modelKey);
  const actualAnthropicModelId = modelDef?.modelId || "claude-sonnet-4-6";

  // 4. Resolve System Prompt
  const activePrompt = getActivePrompt(options.task);
  const systemPrompt = options.systemPromptOverride || activePrompt?.systemInstructions;

  const maxTokens = options.maxTokens || taskDef?.maxOutputTokens || 4096;
  const temperature = options.temperature !== undefined ? options.temperature : taskDef?.temperature;

  // 5. Setup Retry Policy
  const retryPolicy = taskDef?.retryPolicy || {
    maxRetries: 2,
    initialBackoffMs: 1000,
    maxBackoffMs: 4000,
  };

  const payload = {
    task: options.task,
    groupId: options.groupId,
    prompt: options.prompt,
    agentId,
    systemPromptOverride: systemPrompt,
    modelOverride: actualAnthropicModelId,
    temperature,
    maxTokens,
    metadata: {
      ...options.metadata,
      promptVersion: activePrompt?.version || "1.0.0",
      clientTimestamp: new Date().toISOString(),
    },
  };

  let lastError: any = null;
  let attempt = 0;

  while (attempt <= retryPolicy.maxRetries) {
    try {
      // 6. Invoke Edge Function with Authorization header passed automatically by Supabase client
      const response = await supabase.functions.invoke("haraka-gateway", {
        body: payload,
      });

      const { data, error } = response;

      if (error) {
        // FunctionsHttpError or network error
        const httpStatus = (error as any)?.context?.status || 500;

        // Check if rate limited (429) or temporary gateway error (503, 504)
        const isRetryable = httpStatus === 429 || httpStatus === 503 || httpStatus === 504;

        if (isRetryable && attempt < retryPolicy.maxRetries) {
          const backoff = Math.min(
            retryPolicy.initialBackoffMs * Math.pow(2, attempt) + Math.random() * 200,
            retryPolicy.maxBackoffMs
          );
          console.warn(`[Haraka Gateway] Retryable error (${httpStatus}). Backing off for ${Math.round(backoff)}ms (Attempt ${attempt + 1}/${retryPolicy.maxRetries})`);
          await wait(backoff);
          attempt++;
          continue;
        }

        let errorMessage = error.message || "Failed to communicate with Haraka Gateway";
        try {
          if ((error as any)?.context) {
            const bodyText = await (error as any).context.text();
            const parsed = JSON.parse(bodyText);
            if (parsed.error) errorMessage = parsed.error;
          }
        } catch (_) {
          // Keep original error message
        }

        return {
          success: false,
          task: options.task,
          agentId,
          model: actualAnthropicModelId,
          content: "",
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          latencyMs: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          error: errorMessage,
          code: (error as any)?.code || (httpStatus === 429 ? "RATE_LIMITED" : "GATEWAY_ERROR"),
        };
      }

      if (!data || !data.success) {
        return {
          success: false,
          task: options.task,
          agentId,
          model: data?.model || actualAnthropicModelId,
          content: data?.content || "",
          usage: data?.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          latencyMs: data?.latencyMs || Date.now() - startTime,
          timestamp: data?.timestamp || new Date().toISOString(),
          error: data?.error || "Haraka task execution failed.",
          code: data?.code || "EXECUTION_ERROR",
        };
      }

      // 7. Structured Output Validation (Zod)
      const rawContent = data.content;
      const validationResult = validateTaskOutput<T>(options.task, rawContent);

      if (!validationResult.success) {
        console.error(`[Haraka Gateway] Structured validation failed for task ${options.task}:`, validationResult.error);
        return {
          success: false,
          task: options.task,
          agentId,
          model: data.model,
          content: rawContent,
          usage: data.usage,
          latencyMs: data.latencyMs || Date.now() - startTime,
          timestamp: data.timestamp,
          error: validationResult.error,
          code: "SCHEMA_VALIDATION_FAILED",
        };
      }

      // 8. Successful and Validated Return
      return {
        success: true,
        task: options.task,
        agentId,
        model: data.model,
        content: rawContent,
        parsedData: validationResult.data,
        usage: data.usage,
        latencyMs: data.latencyMs || Date.now() - startTime,
        timestamp: data.timestamp,
      };
    } catch (err: any) {
      lastError = err;
      if (attempt < retryPolicy.maxRetries) {
        const backoff = Math.min(
          retryPolicy.initialBackoffMs * Math.pow(2, attempt) + Math.random() * 200,
          retryPolicy.maxBackoffMs
        );
        await wait(backoff);
        attempt++;
        continue;
      }
      break;
    }
  }

  return {
    success: false,
    task: options.task,
    agentId,
    model: actualAnthropicModelId,
    content: "",
    usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    latencyMs: Date.now() - startTime,
    timestamp: new Date().toISOString(),
    error: lastError?.message || "Maximum retry attempts exceeded for Haraka gateway request.",
    code: "MAX_RETRIES_EXCEEDED",
  };
}
