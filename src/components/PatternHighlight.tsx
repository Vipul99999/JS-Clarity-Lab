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
  promise_allSettled: "bg-violet-50 text-violet-900 border-violet-200",
  promise_race: "bg-amber-50 text-amber-900 border-amber-200",
  promise_any: "bg-cyan-50 text-cyan-900 border-cyan-200",
  fetch_then: "bg-sky-50 text-sky-900 border-sky-200",
  fetch_catch: "bg-rose-50 text-rose-900 border-rose-200",
  event_listener: "bg-lime-50 text-lime-900 border-lime-200",
  fs_promises: "bg-indigo-50 text-indigo-900 border-indigo-200",
  await_promise_all: "bg-violet-50 text-violet-900 border-violet-200",
  express_middleware: "bg-blue-50 text-blue-900 border-blue-200",
  react_effect: "bg-emerald-50 text-emerald-900 border-emerald-200",
  react_effect_cleanup: "bg-teal-50 text-teal-900 border-teal-200",
  fake_timer_test: "bg-orange-50 text-orange-900 border-orange-200",
  process_nextTick: "bg-pink-50 text-pink-900 border-pink-200",
  setImmediate: "bg-blue-50 text-blue-900 border-blue-200",
  fs_readFileSync: "bg-rose-50 text-rose-900 border-rose-200",
  crypto_worker: "bg-cyan-50 text-cyan-900 border-cyan-200",
  stream_pipe: "bg-emerald-50 text-emerald-900 border-emerald-200",
  http_route: "bg-blue-50 text-blue-900 border-blue-200",
  async_function: "bg-emerald-50 text-emerald-900 border-emerald-200",
  await: "bg-green-50 text-green-900 border-green-200",
  async_map: "bg-green-50 text-green-900 border-green-200",
  async_forEach: "bg-green-50 text-green-900 border-green-200",
  missing_return_then: "bg-amber-50 text-amber-900 border-amber-200",
  floating_async_call: "bg-rose-50 text-rose-900 border-rose-200",
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
  if (pattern.type === "promise_allSettled") return `Promise.allSettled (${pattern.itemCount} inputs)`;
  if (pattern.type === "promise_race") return `Promise.race (${pattern.itemCount} inputs)`;
  if (pattern.type === "promise_any") return `Promise.any (${pattern.itemCount} inputs)`;
  if (pattern.type === "fetch_then") return "fetch().then";
  if (pattern.type === "fetch_catch") return "fetch().catch";
  if (pattern.type === "event_listener") return `addEventListener("${pattern.eventName}")`;
  if (pattern.type === "fs_promises") return `fs.promises.${pattern.method}`;
  if (pattern.type === "await_promise_all") return `await Promise.all (${pattern.itemCount} inputs)`;
  if (pattern.type === "express_middleware") return `${pattern.method} ${pattern.path} middleware${pattern.callsNext ? " -> next()" : ""}`;
  if (pattern.type === "react_effect") return `useEffect ${pattern.hasCleanup ? "with cleanup" : "without cleanup"}`;
  if (pattern.type === "react_effect_cleanup") return "effect cleanup";
  if (pattern.type === "fake_timer_test") return `${pattern.framework}.${pattern.method}`;
  if (pattern.type === "process_nextTick") return "process.nextTick";
  if (pattern.type === "setImmediate") return "setImmediate";
  if (pattern.type === "fs_readFileSync") return "fs.readFileSync";
  if (pattern.type === "crypto_worker") return pattern.method;
  if (pattern.type === "stream_pipe") return "stream.pipe";
  if (pattern.type === "http_route") return `${pattern.method} ${pattern.path}`;
  if (pattern.type === "async_function") return `async ${pattern.name}`;
  if (pattern.type === "await") return "await";
  if (pattern.type === "async_map") return "async map";
  if (pattern.type === "async_forEach") return "async forEach";
  if (pattern.type === "missing_return_then") return "missing return in .then";
  if (pattern.type === "floating_async_call") return `floating async call ${pattern.name}()`;
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
