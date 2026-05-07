import { getPredictedOutput, getRecommendedDemo } from "./debugReport";
import { getAnalyzerInsights } from "./insights";
import type { AnalysisResult } from "./patternTypes";

export type TrustLevel = "fully simulated" | "partially simulated" | "pattern detected only" | "unsupported";

export type AnalyzerActionPlan = {
  trustLevel: TrustLevel;
  likelyOutput: string[];
  riskFound: string;
  whyThisHappens: string;
  fixSuggestion: string;
  nodeBridge?: {
    scenarioId: string;
    reason: string;
    href: string;
  };
  matchingDemo?: {
    label: string;
    href: string;
  };
};

function getNodeBridge(result: AnalysisResult) {
  if (!result.ok) return undefined;
  const code = result.formattedCode.toLowerCase();
  const has = (...needles: string[]) => needles.some((needle) => code.includes(needle.toLowerCase()));
  const patternTypes = result.patterns.map((pattern) => pattern.type);

  if (patternTypes.includes("process_nextTick")) return { scenarioId: "node-queue-priority", reason: "process.nextTick has Node-only priority." };
  if (patternTypes.includes("setImmediate")) return { scenarioId: "setimmediate-inside-io", reason: "setImmediate belongs to Node's check phase." };
  if (patternTypes.includes("fs_readFileSync")) return { scenarioId: "fs-sync-blocks-server", reason: "Synchronous fs can block server requests." };
  if (patternTypes.includes("crypto_worker")) return { scenarioId: "threadpool-saturation", reason: "Crypto work can saturate the worker pool." };
  if (patternTypes.includes("stream_pipe")) return { scenarioId: "stream-error-handling", reason: "Streams need backpressure and cleanup reasoning." };
  if (patternTypes.includes("http_route")) return { scenarioId: "http-db-lifecycle", reason: "HTTP handlers pause and resume around async work." };
  if (has("fs.readfilesync")) return { scenarioId: "fs-sync-blocks-server", reason: "Synchronous fs can block server requests." };
  if (has("fs.readfile", "fs.promises", "node:fs")) return { scenarioId: "fs-readfile-threadpool", reason: "Async fs work returns through libuv and the I/O queue." };
  if (has("crypto.", "pbkdf2", "scrypt", "bcrypt")) return { scenarioId: "threadpool-saturation", reason: "Crypto work can saturate the worker pool." };
  if (has("zlib.", "gzip", "brotli")) return { scenarioId: "zlib-compression-pool", reason: "Compression uses limited worker capacity." };
  if (has("createreadstream", "createwritestream", ".pipe(", "pipeline(", "stream")) return { scenarioId: "stream-backpressure-pipe", reason: "Streams need backpressure and cleanup reasoning." };
  if (has("app.get", "app.post", "req.", "res.", "fetch(", "http.")) return { scenarioId: "http-db-lifecycle", reason: "HTTP handlers pause and resume around async work." };
  if (has("json.parse")) return { scenarioId: "blocking-json-parse", reason: "Large synchronous parsing can block the event loop." };
  return undefined;
}

export function getAnalyzerTrustLevel(result: AnalysisResult | null): TrustLevel {
  if (!result || !result.ok) return "unsupported";
  if (result.patterns.length === 0) return "unsupported";
  if (result.confidence === "High" && result.warnings.length === 0) return "fully simulated";
  if (result.confidence === "Medium") return "partially simulated";
  return "pattern detected only";
}

export function buildAnalyzerActionPlan(result: AnalysisResult | null): AnalyzerActionPlan | null {
  if (!result) return null;
  if (!result.ok) {
    return {
      trustLevel: "unsupported",
      likelyOutput: [],
      riskFound: "The code could not be parsed.",
      whyThisHappens: result.error ?? "The parser needs valid JavaScript or TypeScript syntax before it can detect runtime patterns.",
      fixSuggestion: "Fix syntax first, then analyze again.",
    };
  }

  const output = getPredictedOutput(result);
  const insights = getAnalyzerInsights(result);
  const recommended = getRecommendedDemo(result);
  const nodeBridge = getNodeBridge(result);
  const has = (...types: string[]) => result.patterns.some((pattern) => types.includes(pattern.type));
  const topRisk = insights.find((insight) => insight.severity === "Risk") ?? insights.find((insight) => insight.severity === "Watch");

  let whyThisHappens = "Synchronous code runs first. Queued callbacks run later according to the simplified event-loop model.";
  let fixSuggestion = "Use the visualizer to verify the order, then open the matching case for a focused explanation.";

  if (has("process_nextTick")) {
    whyThisHappens = "In Node, process.nextTick runs before Promise microtasks, so it can change output order and starve timers if repeated.";
    fixSuggestion = "Use process.nextTick sparingly. Prefer Promise microtasks or setImmediate when other phases need a turn.";
  } else if (has("promise_race")) {
    whyThisHappens = "Promise.race settles with the first promise, but it does not cancel slower operations.";
    fixSuggestion = "Pair race-based timeouts with AbortController or explicit cancellation.";
  } else if (has("promise_all")) {
    whyThisHappens = "Promise.all rejects the combined promise as soon as one input rejects.";
    fixSuggestion = "Use allSettled when partial success is valuable, or catch each branch intentionally.";
  } else if (has("setInterval")) {
    whyThisHappens = "Intervals keep scheduling callbacks until cleared and can retain data through closures.";
    fixSuggestion = "Store the interval id and clear it during cleanup or shutdown.";
  } else if (has("await") && result.patterns.filter((pattern) => pattern.type === "await").length >= 2) {
    whyThisHappens = "Each await pauses the async function. Independent awaits can accidentally become sequential latency.";
    fixSuggestion = "Start independent work together and await Promise.all when failure behavior is acceptable.";
  }
  if (has("fs_readFileSync")) {
    whyThisHappens = "readFileSync keeps JavaScript on the call stack until disk work completes.";
    fixSuggestion = "Use async fs, cache before the hot path, or stream large files.";
  } else if (has("crypto_worker")) {
    whyThisHappens = "Crypto helpers can use libuv workers, so bursts compete with fs, DNS, and zlib.";
    fixSuggestion = "Add concurrency limits or move heavy CPU work to Worker Threads.";
  } else if (has("stream_pipe")) {
    whyThisHappens = "Streams move chunks over time and need error, close, and backpressure handling.";
    fixSuggestion = "Prefer pipeline and test slow writable/error cases.";
  } else if (has("missing_return_then")) {
    whyThisHappens = ".then callbacks pass along the returned value or promise. Missing return breaks that chain.";
    fixSuggestion = "Return the promise/value from .then or rewrite the flow with await.";
  } else if (has("floating_async_call")) {
    whyThisHappens = "Calling an async function starts it, but the caller continues unless it awaits or returns the promise.";
    fixSuggestion = "await it, return it, or attach a catch handler for intentional background work.";
  }

  return {
    trustLevel: getAnalyzerTrustLevel(result),
    likelyOutput: output,
    riskFound: topRisk ? topRisk.title : result.warnings[0]?.title ?? "No major risk found in supported patterns.",
    whyThisHappens,
    fixSuggestion,
    nodeBridge: nodeBridge ? { ...nodeBridge, href: `/node-playground?scenario=${nodeBridge.scenarioId}&mode=problem` } : undefined,
    matchingDemo: nodeBridge
      ? { label: "Open matching Node Runtime Lab", href: `/node-playground?scenario=${nodeBridge.scenarioId}&mode=problem` }
      : topRisk ? { label: topRisk.action, href: topRisk.href } : recommended ? { label: recommended.label, href: `/demo/${recommended.id}` } : undefined
  };
}
