/**
 * Haraka Execution Logging & Observability Utilities
 * Path: src/lib/haraka/executionLogger.ts
 *
 * Privacy-preserving audit utilities for Haraka AI executions.
 * Sanitizes candidate PII and exposes metrics for tenant dashboards.
 */

import { supabase } from "@/lib/supabase";
import { HarakaTaskType, HarakaAgentId } from "./types";

export interface HarakaExecutionLogRecord {
  id: string;
  group_id: string;
  user_id: string | null;
  agent_id: HarakaAgentId;
  task: HarakaTaskType;
  trigger_mode: "manual" | "autopilot" | "event" | "test";
  provider: string;
  model: string;
  prompt_version: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  latency_ms: number;
  status: "success" | "failed" | "blocked" | "timeout" | "rate_limited";
  error_message: string | null;
  tool_calls: any[];
  metadata: Record<string, any>;
  created_at: string;
}

export interface ExecutionStats {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  rateLimitedExecutions: number;
  totalTokensUsed: number;
  averageLatencyMs: number;
}

/**
 * Strips personally identifiable information (PII) before recording metadata.
 * Ensures candidate email, phone numbers, and raw identity data are not stored in logs.
 */
export function sanitizeLogMetadata(metadata: Record<string, any>): Record<string, any> {
  const sensitiveKeys = new Set([
    "email",
    "password",
    "token",
    "phone",
    "full_name",
    "candidate_name",
    "address",
    "ssn",
    "national_id",
    "credit_card",
    "resume_text",
  ]);

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(metadata)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.has(lowerKey)) {
      sanitized[key] = "[REDACTED_PII]";
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeLogMetadata(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Fetch execution logs for the current tenant group (enforces RLS)
 */
export async function getExecutionLogs(
  groupId: string,
  limit: number = 50,
  agentFilter?: HarakaAgentId
): Promise<{ logs: HarakaExecutionLogRecord[]; error: string | null }> {
  try {
    let query = supabase
      .from("haraka_execution_logs")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (agentFilter) {
      query = query.eq("agent_id", agentFilter);
    }

    const { data, error } = await query;

    if (error) {
      return { logs: [], error: error.message };
    }

    return { logs: (data as HarakaExecutionLogRecord[]) || [], error: null };
  } catch (err: any) {
    return { logs: [], error: err.message || "Failed to fetch execution logs." };
  }
}

/**
 * Aggregate summary statistics for Haraka AI usage within a group
 */
export async function getExecutionStats(groupId: string): Promise<ExecutionStats> {
  const { logs } = await getExecutionLogs(groupId, 200);

  if (!logs.length) {
    return {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      rateLimitedExecutions: 0,
      totalTokensUsed: 0,
      averageLatencyMs: 0,
    };
  }

  const totalExecutions = logs.length;
  let successfulExecutions = 0;
  let failedExecutions = 0;
  let rateLimitedExecutions = 0;
  let totalTokensUsed = 0;
  let totalLatency = 0;

  for (const log of logs) {
    if (log.status === "success") successfulExecutions++;
    if (log.status === "failed" || log.status === "timeout") failedExecutions++;
    if (log.status === "rate_limited") rateLimitedExecutions++;
    totalTokensUsed += log.total_tokens || 0;
    totalLatency += log.latency_ms || 0;
  }

  return {
    totalExecutions,
    successfulExecutions,
    failedExecutions,
    rateLimitedExecutions,
    totalTokensUsed,
    averageLatencyMs: Math.round(totalLatency / totalExecutions),
  };
}
