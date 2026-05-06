"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult, ExtractedPattern } from "@/analyzer/patternTypes";

const styles: Record<ExtractedPattern["type"], string> = {
  console: "bg-sky-50 text-sky-900 border-sky-200",
  setTimeout: "bg-orange-50 text-orange-900 border-orange-200",
  setInterval: "bg-orange-50 text-orange-900 border-orange-200",
  queueMicrotask: "bg-fuchsia-50 text-fuchsia-900 border-fuchsia-200",
  promise_then: "bg-violet-50 text-violet-900 border-violet-200",
  promise_catch: "bg-rose-50 text-rose-900 border-rose-200",
  promise_all: "bg-violet-50 text-violet-900 border-violet-200",
  async_function: "bg-emerald-50 text-emerald-900 border-emerald-200",
  await: "bg-green-50 text-green-900 border-green-200",
  async_map: "bg-green-50 text-green-900 border-green-200",
  try_catch_await: "bg-emerald-50 text-emerald-900 border-emerald-200",
  function_call: "bg-slate-50 text-slate-900 border-slate-200"
};

function label(pattern: ExtractedPattern) {
  if (pattern.type === "console") return `console.log("${pattern.value}")`;
  if (pattern.type === "setTimeout") return `setTimeout ${pattern.delay}ms`;
  if (pattern.type === "setInterval") return `setInterval ${pattern.delay}ms`;
  if (pattern.type === "queueMicrotask") return "queueMicrotask";
  if (pattern.type === "promise_then") return "Promise.resolve().then";
  if (pattern.type === "promise_catch") return "Promise.reject().catch";
  if (pattern.type === "promise_all") return `Promise.all (${pattern.itemCount} inputs)`;
  if (pattern.type === "async_function") return `async ${pattern.name}`;
  if (pattern.type === "await") return "await";
  if (pattern.type === "async_map") return "async map";
  if (pattern.type === "try_catch_await") return "try/catch await";
  return `${pattern.name}()`;
}

export function PatternHighlight({ result }: { result: AnalysisResult | null }) {
  if (!result?.ok || result.patterns.length === 0) return null;
  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-base">Pattern highlights</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 p-4">
        {result.patterns.map((pattern, index) => (
          <span key={`${pattern.type}-${pattern.line}-${index}`} className={`rounded-md border px-2 py-1 text-xs font-semibold ${styles[pattern.type]}`}>
            line {pattern.line}: {label(pattern)}
          </span>
        ))}
      </CardContent>
    </Card>
  );
}
