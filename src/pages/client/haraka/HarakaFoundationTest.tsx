/**
 * Haraka AI Foundation - Developer Diagnostic Test Console
 * Path: src/pages/client/haraka/HarakaFoundationTest.tsx
 *
 * Minimal test interface strictly dedicated to testing and verifying the Haraka AI Foundation:
 * Flowboard frontend -> Supabase Edge Function -> Anthropic -> Edge Function -> Flowboard frontend.
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useGroups } from "@/contexts/GroupContext";
import { supabase } from "@/lib/supabase";
import { runHarakaFoundationTest, HarakaDiagnosticReport } from "@/lib/haraka/testHarness";
import { executeHarakaTask } from "@/lib/haraka/gateway";
import { getExecutionLogs, HarakaExecutionLogRecord } from "@/lib/haraka/executionLogger";
import { HARAKA_MODEL_REGISTRY } from "@/lib/haraka/models";
import { HARAKA_TASK_REGISTRY } from "@/lib/haraka/tasks";
import { HarakaTaskType } from "@/lib/haraka/types";
import {
  BrainCircuit,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Server,
  ShieldCheck,
  Zap,
  Terminal,
} from "lucide-react";

export default function HarakaFoundationTest() {
  const { activeGroup, groups } = useGroups();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<HarakaDiagnosticReport | null>(null);
  const [recentLogs, setRecentLogs] = useState<HarakaExecutionLogRecord[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Custom prompt sandbox state
  const [selectedTask, setSelectedTask] = useState<HarakaTaskType>("GENERAL_ASSISTANT");
  const [customPrompt, setCustomPrompt] = useState("Explain what Haraka does in one sentence.");
  const [customResponse, setCustomResponse] = useState<any>(null);
  const [customRunning, setCustomRunning] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user);
    });
  }, []);

  const fetchLogs = async () => {
    if (!activeGroup?.id) return;
    setLogsLoading(true);
    const { logs } = await getExecutionLogs(activeGroup.id, 10);
    setRecentLogs(logs);
    setLogsLoading(false);
  };

  useEffect(() => {
    if (activeGroup?.id) {
      fetchLogs();
    }
  }, [activeGroup?.id]);

  const handleRunStandardTest = async () => {
    if (!activeGroup?.id) {
      alert("Please ensure an active organization group is selected.");
      return;
    }
    setIsRunning(true);
    setReport(null);
    try {
      const result = await runHarakaFoundationTest(activeGroup.id);
      setReport(result);
      await fetchLogs();
    } catch (err: any) {
      console.error("Test harness error:", err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunCustomPrompt = async () => {
    if (!activeGroup?.id) {
      alert("Please ensure an active organization group is selected.");
      return;
    }
    setCustomRunning(true);
    setCustomResponse(null);
    try {
      const result = await executeHarakaTask({
        task: selectedTask,
        groupId: activeGroup.id,
        prompt: customPrompt,
        agentId: "system",
      });
      setCustomResponse(result);
      await fetchLogs();
    } catch (err: any) {
      setCustomResponse({ success: false, error: err.message });
    } finally {
      setCustomRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Link
                to="/client/haraka"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Haraka AI Foundation v1.0
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 pt-2">
              <BrainCircuit className="w-7 h-7 text-indigo-400" />
              Anthropic Gateway & Foundation Verification
            </h1>
            <p className="text-sm text-slate-400">
              Diagnostic verification harness testing the end-to-end server-side AI pipeline.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunStandardTest}
              disabled={isRunning || !activeGroup?.id}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Testing Gateway...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white" />
                  Run Foundation Test
                </>
              )}
            </button>
          </div>
        </div>

        {/* Environment & Tenant Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              Active Tenant Group
            </div>
            <div className="font-semibold text-slate-200">
              {activeGroup?.name || "No Active Group"}
            </div>
            <div className="text-xs font-mono text-slate-500 truncate">
              {activeGroup?.id || "N/A"}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Auth Status
            </div>
            <div className="font-semibold text-emerald-400 flex items-center gap-2">
              {currentUser ? "Authenticated" : "Unauthenticated"}
            </div>
            <div className="text-xs font-mono text-slate-500 truncate">
              {currentUser?.email || "N/A"}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              AI Provider Gateway
            </div>
            <div className="font-semibold text-slate-200">
              Anthropic Claude (Server-Side)
            </div>
            <div className="text-xs text-slate-500">
              Supabase Edge Function: <code className="text-slate-400">haraka-gateway</code>
            </div>
          </div>
        </div>

        {/* Standard Verification Test Results */}
        {report && (
          <div className={`p-6 rounded-2xl border transition-all ${
            report.overallSuccess
              ? "bg-emerald-950/20 border-emerald-800/50"
              : "bg-rose-950/20 border-rose-800/50"
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
              <div className="flex items-center gap-3">
                {report.overallSuccess ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                )}
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {report.overallSuccess ? "Round-Trip Verification Succeeded" : "Verification Failed"}
                  </h3>
                  <p className="text-xs text-slate-400">{report.summary}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Total: {report.totalDurationMs}ms
              </div>
            </div>

            {/* Test Step Pipeline */}
            <div className="divide-y divide-slate-800/60 my-4">
              {report.tests.map((test, idx) => (
                <div key={idx} className="py-3 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 mt-0.5">
                      Step {idx + 1}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-slate-200">{test.step}</div>
                      {test.error && (
                        <div className="text-xs text-rose-400 mt-0.5">{test.error}</div>
                      )}
                      {test.data && (
                        <pre className="text-[11px] font-mono text-slate-400 mt-1 bg-slate-900/90 p-2 rounded border border-slate-800/80 max-w-xl overflow-x-auto">
                          {JSON.stringify(test.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-500 font-mono">{test.durationMs}ms</span>
                    {test.passed ? (
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        PASS
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        FAIL
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Model Output Demonstration */}
            {report.response?.content && (
              <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-indigo-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    Anthropic Claude Verified Output:
                  </span>
                  <span className="font-mono text-slate-500">
                    {report.response.model} · {report.response.usage?.totalTokens} tokens · {report.response.latencyMs}ms
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed italic bg-slate-950/60 p-3 rounded-lg border border-slate-800/50">
                  "{report.response.content}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Interactive Custom Prompt Test Panel */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-semibold text-white">Developer Prompt Sandbox</h3>
              <p className="text-xs text-slate-400">
                Execute any registered Haraka task with server-side validation and schema enforcement.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value as HarakaTaskType)}
                className="text-xs bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                {Object.keys(HARAKA_TASK_REGISTRY).map((taskKey) => (
                  <option key={taskKey} value={taskKey}>
                    {taskKey}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <textarea
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Enter prompt for Haraka..."
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl p-3 focus:outline-none focus:border-indigo-500 font-mono resize-none"
            />
            <div className="flex justify-end">
              <button
                onClick={handleRunCustomPrompt}
                disabled={customRunning || !customPrompt.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white transition-colors cursor-pointer"
              >
                {customRunning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    Execute Request
                  </>
                )}
              </button>
            </div>
          </div>

          {customResponse && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold ${customResponse.success ? "text-emerald-400" : "text-rose-400"}`}>
                  {customResponse.success ? "✓ Execution Success" : "✕ Execution Error"}
                </span>
                {customResponse.latencyMs && (
                  <span className="text-slate-500 font-mono">{customResponse.latencyMs}ms</span>
                )}
              </div>
              {customResponse.error ? (
                <p className="text-xs text-rose-400 font-mono">{customResponse.error}</p>
              ) : (
                <pre className="text-xs font-mono text-slate-300 overflow-x-auto max-h-60 p-2 rounded bg-slate-900 border border-slate-800">
                  {customResponse.parsedData
                    ? JSON.stringify(customResponse.parsedData, null, 2)
                    : customResponse.content}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Audit Log Stream */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Recent Haraka Execution Logs</h3>
              <p className="text-xs text-slate-400">
                Live audit records from <code className="text-slate-300">haraka_execution_logs</code> (sanitized metadata).
              </p>
            </div>
            <button
              onClick={fetchLogs}
              disabled={logsLoading}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${logsLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2 font-medium">Task</th>
                  <th className="pb-2 font-medium">Agent</th>
                  <th className="pb-2 font-medium">Model</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Tokens</th>
                  <th className="pb-2 font-medium">Latency</th>
                  <th className="pb-2 font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {recentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500 font-sans">
                      No execution logs found for this tenant group. Run a test to create one.
                    </td>
                  </tr>
                ) : (
                  recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 font-sans font-medium text-slate-300">{log.task}</td>
                      <td className="py-2.5 text-slate-400 capitalize">{log.agent_id}</td>
                      <td className="py-2.5 text-slate-400">{log.model}</td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-sans font-semibold ${
                            log.status === "success"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : log.status === "rate_limited"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-400">{log.total_tokens || 0}</td>
                      <td className="py-2.5 text-slate-400">{log.latency_ms}ms</td>
                      <td className="py-2.5 text-right text-slate-500">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
