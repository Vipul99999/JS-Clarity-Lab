import type { AnalysisResult } from "./patternTypes";

export type AnalyzerInsight = {
  severity: "Info" | "Watch" | "Risk";
  title: string;
  detail: string;
  action: string;
  href: string;
};

export function getAnalyzerInsights(result: AnalysisResult | null): AnalyzerInsight[] {
  if (!result?.ok) return [];
  const patterns = result.patterns;
  const has = (...types: string[]) => patterns.some((pattern) => types.includes(pattern.type));
  const count = (...types: string[]) => patterns.filter((pattern) => types.includes(pattern.type)).length;
  const insights: AnalyzerInsight[] = [];

  if (has("process_nextTick") && has("promise_then", "queueMicrotask")) {
    insights.push({
      severity: "Risk",
      title: "Node-specific priority detected",
      detail: "process.nextTick runs before Promise microtasks in Node, which can surprise developers using a browser mental model.",
      action: "Open Node queue priority",
      href: "/node-playground?scenario=node-queue-priority&mode=problem"
    });
  }

  if (has("fs_readFileSync")) {
    insights.push({
      severity: "Risk",
      title: "Synchronous filesystem in a hot path",
      detail: "readFileSync blocks the event loop. In request handlers, this can delay unrelated users.",
      action: "Open sync fs server case",
      href: "/node-playground?scenario=fs-sync-blocks-server&mode=problem"
    });
  }

  if (has("crypto_worker")) {
    insights.push({
      severity: "Risk",
      title: "Worker-pool pressure risk",
      detail: "Crypto helpers use limited backend capacity. A burst can delay fs, DNS, zlib, and other crypto work.",
      action: "Open thread pool case",
      href: "/node-playground?scenario=threadpool-saturation&mode=problem"
    });
  }

  if (has("stream_pipe")) {
    insights.push({
      severity: "Watch",
      title: "Stream chain detected",
      detail: "Streams need backpressure, error, close, and cleanup handling. Manual pipe chains can miss failure paths.",
      action: "Open stream handling case",
      href: "/node-playground?scenario=stream-error-handling&mode=problem"
    });
  }

  if (has("fs_promises")) {
    insights.push({
      severity: "Info",
      title: "Async filesystem promise detected",
      detail: "fs.promises avoids blocking JavaScript, but the continuation still resumes later and can compete with other file work.",
      action: "Open async fs case",
      href: "/node-playground?scenario=fs-readfile-threadpool&mode=problem"
    });
  }

  if (has("fetch_then", "fetch_catch")) {
    insights.push({
      severity: "Watch",
      title: "Fetch chain detected",
      detail: "fetch starts external work and then/catch callbacks continue later through Promise microtasks. Network timing is still simplified.",
      action: "Open HTTP lifecycle",
      href: "/node-playground?scenario=http-db-lifecycle&mode=problem"
    });
  }

  if (has("express_middleware")) {
    insights.push({
      severity: "Watch",
      title: "Express middleware order detected",
      detail: "Express handlers run in registration order. A handler that does not call next or send a response can stop the chain.",
      action: "Open middleware order",
      href: "/node-playground?scenario=http-db-lifecycle&mode=problem"
    });
  }

  if (has("react_effect")) {
    insights.push({
      severity: has("react_effect_cleanup") ? "Info" : "Risk",
      title: has("react_effect_cleanup") ? "React effect cleanup detected" : "React effect without cleanup",
      detail: has("react_effect_cleanup")
        ? "The effect returns cleanup, which is the safer pattern for subscriptions, timers, and listeners."
        : "Effects that start timers, listeners, or subscriptions without cleanup commonly cause duplicated work and memory growth.",
      action: "Open React cleanup case",
      href: "/demo/react-effect-cleanup-missing"
    });
  }

  if (has("fake_timer_test")) {
    insights.push({
      severity: "Watch",
      title: "Fake timer test behavior detected",
      detail: "Fake timers flush timer callbacks, but Promise continuations may still require an explicit microtask or async flush.",
      action: "Open fake timer case",
      href: "/node-playground?scenario=testing-async-timers&mode=problem"
    });
  }

  if (has("event_listener")) {
    insights.push({
      severity: "Watch",
      title: "Event listener registration detected",
      detail: "Listeners run only when the event fires later. Missing cleanup is a common source of duplicated handlers and retained memory.",
      action: "Open listener leak",
      href: "/demo/event-listener-leak"
    });
  }

  if (has("http_route")) {
    insights.push({
      severity: "Info",
      title: "HTTP lifecycle detected",
      detail: "Route handlers mix sync work, awaits, dependency latency, response timing, and error handling.",
      action: "Open HTTP lifecycle",
      href: "/node-playground?scenario=http-db-lifecycle&mode=problem"
    });
  }

  if (has("missing_return_then")) {
    insights.push({
      severity: "Risk",
      title: "Missing return inside .then",
      detail: "A .then callback that starts work without returning it can break value flow and finish too early.",
      action: "Open missing return",
      href: "/demo/missing-return"
    });
  }

  if (has("floating_async_call")) {
    insights.push({
      severity: "Risk",
      title: "Async call is not awaited or returned",
      detail: "Starting an async function without await/catch can make errors disappear or let later code run too early.",
      action: "Open missing await",
      href: "/demo/missing-await"
    });
  }

  if (has("promise_race")) {
    insights.push({
      severity: "Watch",
      title: "Promise.race does not cancel slower work",
      detail: "race settles with the first result, but slower requests, timers, or jobs may still keep running unless you cancel them.",
      action: "Study request timeout",
      href: "/node-playground?scenario=promise-race-timeout&mode=problem"
    });
  }

  if (has("promise_all") && result.warnings.some((warning) => warning.title.toLowerCase().includes("external"))) {
    insights.push({
      severity: "Watch",
      title: "All-or-nothing batch behavior",
      detail: "Promise.all can reject the whole batch when one external request fails. That may be wrong for dashboards or imports.",
      action: "Compare allSettled",
      href: "/node-playground?scenario=promise-allsettled-errors&mode=problem"
    });
  }

  if (count("await") >= 2) {
    insights.push({
      severity: "Watch",
      title: "Multiple awaits detected",
      detail: "If these awaited operations are independent, sequential awaits may be adding unnecessary latency.",
      action: "Compare sequential vs parallel",
      href: "/demo/sequential-await"
    });
  }

  if (has("await_promise_all")) {
    insights.push({
      severity: "Info",
      title: "Parallel await pattern detected",
      detail: "await Promise.all resumes when every input fulfills. It is good for independent work but fails fast on one rejection.",
      action: "Compare sequential and parallel",
      href: "/demo/parallel-promise-all"
    });
  }

  if (has("setInterval")) {
    insights.push({
      severity: "Risk",
      title: "Repeating timer needs cleanup",
      detail: "Intervals keep running until cleared and can retain memory through closures.",
      action: "Open interval leak",
      href: "/demo/interval-leak"
    });
  }

  if (has("async_map", "async_forEach")) {
    insights.push({
      severity: "Risk",
      title: "Async collection behavior detected",
      detail: "Async callbacks inside collection helpers create promises that still need to be awaited or returned.",
      action: "Open async forEach issue",
      href: "/demo/async-foreach-issue"
    });
  }

  if (result.warnings.length > 0) {
    insights.push({
      severity: "Info",
      title: "Simulation has limits",
      detail: "Warnings mean the visualization is useful for known patterns but may not match the full runtime.",
      action: "Review Real Bug Clinic",
      href: "/clinic"
    });
  }

  return insights;
}
