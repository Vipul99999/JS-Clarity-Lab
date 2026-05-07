"use client";

import { ShieldQuestion } from "lucide-react";
import type { AnalysisResult } from "@/analyzer/patternTypes";
import { getAnalyzerTrustLevel } from "@/analyzer/actionPlan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const simulated = new Set(["console", "setTimeout", "setInterval", "queueMicrotask", "promise_then", "promise_catch", "promise_all", "promise_allSettled", "promise_race", "promise_any", "process_nextTick", "setImmediate", "await"]);
const detectedOnly = new Set(["fs_readFileSync", "crypto_worker", "stream_pipe", "http_route", "async_map", "async_forEach", "missing_return_then", "floating_async_call", "function_call", "async_function", "try_catch_await"]);

export function AnalyzerConfidenceExplainer({ result }: { result: AnalysisResult | null }) {
  if (!result) return null;
  if (!result.ok) {
    return (
      <Card className="border-rose-200">
        <CardContent className="p-4 text-sm text-rose-900">Confidence is unsupported because the code could not be parsed.</CardContent>
      </Card>
    );
  }

  const supported = result.patterns.filter((pattern) => simulated.has(pattern.type));
  const detected = result.patterns.filter((pattern) => detectedOnly.has(pattern.type));
  const unsupported = result.warnings;

  return (
    <Card className="border-cyan-100">
      <CardHeader className="border-b pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldQuestion className="h-4 w-4 text-cyan-700" />
          Why this confidence?
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 p-4 md:grid-cols-4">
        <div className="rounded-lg bg-cyan-50 p-3 text-sm text-cyan-950">
          <div className="font-semibold">Trust level</div>
          <div className="mt-1">{getAnalyzerTrustLevel(result)}</div>
        </div>
        <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-950">
          <div className="font-semibold">Simulated</div>
          <div className="mt-1">{supported.length} supported pattern(s)</div>
        </div>
        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-950">
          <div className="font-semibold">Detected only</div>
          <div className="mt-1">{detected.length} production risk pattern(s)</div>
        </div>
        <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-950">
          <div className="font-semibold">Unsupported</div>
          <div className="mt-1">{unsupported.length} warning(s)</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-sm md:col-span-4">
          <div className="font-semibold">What this means</div>
          <p className="mt-1 leading-6 text-muted-foreground">
            Simulated patterns can appear in the visual timeline. Detected-only patterns are routed to curated cases or Node Lab explanations. Unsupported warnings tell you where the model may differ from real runtime behavior.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
