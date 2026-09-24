/**
 * Haraka AI Foundation Developer Test Harness
 * Path: src/lib/haraka/testHarness.ts
 *
 * Diagnostic verification tool to test the end-to-end round trip:
 * Flowboard Frontend -> Supabase Edge Function -> Anthropic -> Edge Function -> Flowboard Frontend
 */

import { executeHarakaTask } from "./gateway";
import { HarakaGatewayResponse } from "./types";

export interface HarakaTestResult {
  step: string;
  passed: boolean;
  durationMs: number;
  data?: any;
  error?: string;
}

export interface HarakaDiagnosticReport {
  overallSuccess: boolean;
  totalDurationMs: number;
  response: HarakaGatewayResponse | null;
  tests: HarakaTestResult[];
  summary: string;
}

/**
 * Executes the standardized Haraka AI foundation developer verification test.
 * Task: GENERAL_ASSISTANT
 * Input: "Explain what Haraka does in one sentence."
 */
export async function runHarakaFoundationTest(
  groupId: string
): Promise<HarakaDiagnosticReport> {
  const overallStart = Date.now();
  const tests: HarakaTestResult[] = [];

  const testPrompt = "Explain what Haraka does in one sentence.";

  // Step 1: Input Validation
  const step1Start = Date.now();
  if (!groupId) {
    tests.push({
      step: "Tenant Isolation Validation",
      passed: false,
      durationMs: Date.now() - step1Start,
      error: "Missing groupId. Active group must be selected to test Haraka.",
    });

    return {
      overallSuccess: false,
      totalDurationMs: Date.now() - overallStart,
      response: null,
      tests,
      summary: "Test aborted: No active group provided.",
    };
  }

  tests.push({
    step: "Tenant Isolation Validation",
    passed: true,
    durationMs: Date.now() - step1Start,
    data: { groupId },
  });

  // Step 2: Edge Function Dispatch & Anthropic Round-Trip
  const step2Start = Date.now();
  const gatewayResponse = await executeHarakaTask({
    task: "GENERAL_ASSISTANT",
    groupId,
    prompt: testPrompt,
    agentId: "system",
    metadata: { isTestRun: true, testName: "foundation_connectivity_check" },
  });

  const step2Duration = Date.now() - step2Start;

  if (!gatewayResponse.success) {
    tests.push({
      step: "Supabase Edge Function & Anthropic Gateway Communication",
      passed: false,
      durationMs: step2Duration,
      error: gatewayResponse.error || "Gateway returned failure.",
      data: {
        code: gatewayResponse.code,
        latencyMs: gatewayResponse.latencyMs,
      },
    });

    return {
      overallSuccess: false,
      totalDurationMs: Date.now() - overallStart,
      response: gatewayResponse,
      tests,
      summary: `Test failed at gateway: ${gatewayResponse.error}`,
    };
  }

  tests.push({
    step: "Supabase Edge Function & Anthropic Gateway Communication",
    passed: true,
    durationMs: step2Duration,
    data: {
      model: gatewayResponse.model,
      tokensUsed: gatewayResponse.usage.totalTokens,
      latencyMs: gatewayResponse.latencyMs,
    },
  });

  // Step 3: Response & Schema Verification
  const step3Start = Date.now();
  const hasContent = Boolean(gatewayResponse.content && gatewayResponse.content.trim().length > 0);

  tests.push({
    step: "Structured Response & Non-empty Content Verification",
    passed: hasContent,
    durationMs: Date.now() - step3Start,
    data: {
      contentLength: gatewayResponse.content?.length || 0,
      preview: gatewayResponse.content ? gatewayResponse.content.slice(0, 150) + "..." : null,
    },
  });

  const totalDuration = Date.now() - overallStart;
  const overallSuccess = tests.every((t) => t.passed);

  return {
    overallSuccess,
    totalDurationMs: totalDuration,
    response: gatewayResponse,
    tests,
    summary: overallSuccess
      ? `Haraka Foundation verified successfully in ${totalDuration}ms via ${gatewayResponse.model}. Round-trip to Anthropic is operational.`
      : "Haraka Foundation verification failed.",
  };
}

// Attach to window in development for immediate browser console testing
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  (window as any).__testHarakaFoundation = runHarakaFoundationTest;
}
