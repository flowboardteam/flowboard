// Supabase Edge Function: haraka-gateway
// Path: supabase/functions/haraka-gateway/index.ts
// Secure server-side gateway for Haraka AI communication with Anthropic.
// Protects ANTHROPIC_API_KEY, enforces tenant authorization, and records execution audit logs.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface HarakaGatewayRequest {
  task: string;
  groupId: string;
  prompt: string;
  agentId?: string;
  systemPromptOverride?: string;
  modelOverride?: string;
  temperature?: number;
  maxTokens?: number;
  metadata?: Record<string, any>;
}

// ── Server-Side Authorized Registry ──────────────────────────────────────────
const AUTHORIZED_MODELS = new Set([
  "claude-sonnet-4-6",
]);
const DEFAULT_SERVER_MODEL = "claude-sonnet-4-6";

const AUTHORIZED_TASKS = new Set([
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
]);

serve(async (req: Request) => {
  // 1. CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startTime = Date.now();
  let user: any = null;
  let validatedGroupId: string | null = null;
  let taskName = "GENERAL_ASSISTANT";
  let agentIdentifier = "system";
  let chosenModel = DEFAULT_SERVER_MODEL;

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  try {
    // 2. Validate Authentication Header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header", code: "UNAUTHORIZED" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Authenticate user via Supabase
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const { data: { user: authUser }, error: userError } = await userClient.auth.getUser();
    if (userError || !authUser) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired session token", code: "INVALID_TOKEN" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    user = authUser;

    // 3. Parse and Validate Request Payload
    const body: HarakaGatewayRequest = await req.json();
    const {
      task,
      groupId,
      prompt,
      agentId = "system",
      systemPromptOverride,
      modelOverride,
      temperature,
      maxTokens = 4096,
      metadata = {},
    } = body;

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid request: 'prompt' must be a non-empty string", code: "BAD_REQUEST" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!groupId) {
      return new Response(
        JSON.stringify({ error: "Invalid request: 'groupId' is required for tenant isolation", code: "MISSING_GROUP_ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    taskName = task || "GENERAL_ASSISTANT";
    if (!AUTHORIZED_TASKS.has(taskName)) {
      return new Response(
        JSON.stringify({ error: `Task '${taskName}' is not an authorized Haraka task.`, code: "UNAUTHORIZED_TASK" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    agentIdentifier = agentId || "system";
    validatedGroupId = groupId;

    // 4. Group Authorization Check (User must be owner or group member)
    const adminClient = createClient(
      supabaseUrl, 
      supabaseServiceKey || supabaseAnonKey,
      { auth: { persistSession: false } }
    );

    // Check if user is owner of the group or member in group_members
    const { data: groupCheck, error: groupError } = await adminClient
      .from("groups")
      .select("id, organization_id")
      .eq("id", groupId)
      .maybeSingle();

    if (groupError || !groupCheck) {
      return new Response(
        JSON.stringify({ error: "Group not found", code: "GROUP_NOT_FOUND" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isOrgOwner = groupCheck.organization_id === user.id;
    let isMember = false;

    if (!isOrgOwner) {
      const { data: memberCheck } = await adminClient
        .from("group_members")
        .select("id, role")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .maybeSingle();

      isMember = !!memberCheck;
    }

    if (!isOrgOwner && !isMember) {
      return new Response(
        JSON.stringify({ error: "Access denied: You are not authorized for this organization group", code: "FORBIDDEN" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Check Anthropic API Key
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      return new Response(
        JSON.stringify({
          error: "ANTHROPIC_API_KEY is not configured in Supabase Edge Function secrets. Please set ANTHROPIC_API_KEY via Supabase dashboard or CLI.",
          code: "MISSING_ANTHROPIC_KEY",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Select Model & Validate against registry (prevent arbitrary browser overrides)
    if (modelOverride) {
      if (!AUTHORIZED_MODELS.has(modelOverride)) {
        return new Response(
          JSON.stringify({
            error: `Model '${modelOverride}' is not an authorized Haraka model.`,
            code: "UNAUTHORIZED_MODEL",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      chosenModel = modelOverride;
    } else {
      chosenModel = DEFAULT_SERVER_MODEL;
    }

    // 7. Assemble Anthropic Request
    const systemInstruction = systemPromptOverride || "You are Haraka, the autonomous AI workforce layer inside Flowboard Team.";

    const anthropicPayload: any = {
      model: chosenModel,
      max_tokens: Math.min(maxTokens, 8192),
      system: systemInstruction,
      messages: [
        { role: "user", content: prompt }
      ],
    };

    if (temperature !== undefined && temperature !== null) {
      anthropicPayload.temperature = Math.max(0, Math.min(temperature, 1));
    }

    // 8. Call Anthropic API with Timeout Handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s server timeout

    let anthropicResponse: Response;
    try {
      anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify(anthropicPayload),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const latencyMs = Date.now() - startTime;

    // Handle Anthropic Errors
    if (!anthropicResponse.ok) {
      const errorData = await anthropicResponse.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `Anthropic API error status ${anthropicResponse.status}`;

      // Log failure in execution logs
      await adminClient.from("haraka_execution_logs").insert({
        group_id: validatedGroupId,
        user_id: user.id,
        agent_id: agentIdentifier,
        task: taskName,
        trigger_mode: "manual",
        provider: "anthropic",
        model: chosenModel,
        prompt_version: "1.0.0",
        prompt_tokens: 0,
        completion_tokens: 0,
        latency_ms: latencyMs,
        status: anthropicResponse.status === 429 ? "rate_limited" : "failed",
        error_message: errorMessage,
        metadata: { ...metadata, httpStatus: anthropicResponse.status },
      });

      return new Response(
        JSON.stringify({
          error: errorMessage,
          code: anthropicResponse.status === 429 ? "RATE_LIMITED" : "PROVIDER_ERROR",
          status: anthropicResponse.status,
        }),
        { status: anthropicResponse.status === 429 ? 429 : 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 9. Process Success Response
    const responseJson = await anthropicResponse.json();
    const outputContent = responseJson.content?.[0]?.text || "";
    const promptTokens = responseJson.usage?.input_tokens || 0;
    const completionTokens = responseJson.usage?.output_tokens || 0;

    // 10. Audit Logging (Sanitized, no candidate PII stored)
    await adminClient.from("haraka_execution_logs").insert({
      group_id: validatedGroupId,
      user_id: user.id,
      agent_id: agentIdentifier,
      task: taskName,
      trigger_mode: "manual",
      provider: "anthropic",
      model: chosenModel,
      prompt_version: "1.0.0",
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      latency_ms: latencyMs,
      status: "success",
      metadata: {
        taskName,
        agentIdentifier,
        tokensTotal: promptTokens + completionTokens,
      },
    });

    // 11. Return Safe Response to Frontend
    return new Response(
      JSON.stringify({
        success: true,
        task: taskName,
        agentId: agentIdentifier,
        model: chosenModel,
        content: outputContent,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        },
        latencyMs,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    const isTimeout = err.name === "AbortError";
    const errorMessage = isTimeout ? "Request to Anthropic timed out after 45 seconds" : err.message || "Internal server error";

    // Attempt to log error if group was validated
    if (validatedGroupId && user?.id) {
      try {
        const adminClient = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);
        await adminClient.from("haraka_execution_logs").insert({
          group_id: validatedGroupId,
          user_id: user.id,
          agent_id: agentIdentifier,
          task: taskName,
          trigger_mode: "manual",
          provider: "anthropic",
          model: chosenModel,
          latency_ms: latencyMs,
          status: isTimeout ? "timeout" : "failed",
          error_message: errorMessage,
        });
      } catch (_) {
        // Ignore secondary logging failure
      }
    }

    return new Response(
      JSON.stringify({
        error: errorMessage,
        code: isTimeout ? "TIMEOUT" : "INTERNAL_ERROR",
      }),
      { status: isTimeout ? 504 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
