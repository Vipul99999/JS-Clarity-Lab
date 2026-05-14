"use client";

import { Activity, ListChecks } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult, PatternKind } from "@/analyzer/patternTypes";

const labels: Record<PatternKind, string> = {
  console: "console.log",
  setTimeout: "setTimeout",
  promise_then: "Promise.then",
  promise_catch: "Promise.catch",
  promise_all: "Promise.all",
  promise_allSettled: "Promise.allSettled",
  promise_race: "Promise.race",
  promise_any: "Promise.any",
  fetch_then: "fetch().then",
  fetch_catch: "fetch().catch",
  event_listener: "event listener",
  fs_promises: "fs.promises",
  await_promise_all: "await Promise.all",
  express_middleware: "Express middleware",
  react_effect: "React useEffect",
  react_effect_cleanup: "React effect cleanup",
  fake_timer_test: "fake timer test",
  process_nextTick: "process.nextTick",
  setImmediate: "setImmediate",
  fs_readFileSync: "fs.readFileSync",
  crypto_worker: "crypto worker",
  stream_pipe: "stream pipe",
  http_route: "HTTP route",
  queueMicrotask: "queueMicrotask",
  setInterval: "setInterval",
  async_function: "async function",
  await: "await",
  async_map: "async map",
  async_forEach: "async forEach",
  missing_return_then: "missing return in .then",
  floating_async_call: "floating async call",
  try_catch_await: "try/catch await",
  function_call: "function call"
};

export function AnalysisSummary({ result }: { result: AnalysisResult | null }) {
  if (!result) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">Analyze code to see detected patterns and predicted queue order.</CardContent>
      </Card>
    );
  }

  if (!result.ok) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-4 text-sm text-red-800">{result.error}</CardContent>
      </Card>
    );
  }

  const counts = result.patterns.reduce<Record<string, number>>((acc, pattern) => {
    acc[pattern.type] = (acc[pattern.type] ?? 0) + 1;
    return acc;
  }, {});
  const hasMicrotasks = result.patterns.some((pattern) => ["promise_then", "promise_catch", "queueMicrotask", "promise_all", "promise_allSettled", "promise_race", "promise_any", "fetch_then", "fetch_catch", "fs_promises", "await_promise_all", "await", "async_map"].includes(pattern.type));
  const hasTimers = result.patterns.some((pattern) => pattern.type === "setTimeout" || pattern.type === "setInterval" || pattern.type === "fake_timer_test");
  const hasFramework = result.patterns.some((pattern) => ["express_middleware", "react_effect", "react_effect_cleanup"].includes(pattern.type));

  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-teal-700" />
          Analysis summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4 text-sm leading-6">
        <div>
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <ListChecks className="h-4 w-4" />
            Detected
          </div>
          {Object.keys(counts).length > 0 ? (
            <ul className="space-y-1">
              {Object.entries(counts).map(([kind, count]) => (
                <li key={kind}>- {count} {labels[kind as PatternKind] ?? kind}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No supported patterns detected.</p>
          )}
        </div>
        <div className="rounded-md bg-teal-50 px-3 py-2 text-teal-950">
          <span className="font-semibold">Estimated execution: </span>
          sync code{hasFramework ? " -> framework lifecycle" : ""}{hasMicrotasks ? " -> microtasks" : ""}{hasTimers ? " -> timers" : ""}
        </div>
        <div className="rounded-md bg-[#f7f9f0] px-3 py-2 text-slate-950">
          <span className="font-semibold">Confidence: </span>
          {result.confidence}
          <ul className="mt-2 space-y-1 text-muted-foreground">
            {result.trustNotes.map((note) => (
              <li key={note}>- {note}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
