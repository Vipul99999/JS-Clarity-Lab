export type SymptomMatch = {
  id: string;
  label: string;
  query: string;
  href: string;
  reason: string;
  keywords: string[];
};

export const symptomMatches: SymptomMatch[] = [
  {
    id: "timer-late",
    label: "Timer runs late",
    query: "timer runs late",
    href: "/demo/blocking-loop-event-loop",
    reason: "Timers cannot run while the call stack is blocked or microtasks keep draining.",
    keywords: ["timer late", "settimeout late", "delay", "blocked timer", "timer not immediate"]
  },
  {
    id: "await-not-wait",
    label: "await did not wait",
    query: "await did not wait",
    href: "/demo/missing-await",
    reason: "Missing await lets later code continue before the async result is ready.",
    keywords: ["await not wait", "missing await", "runs too early", "promise instead of value", "async continues"]
  },
  {
    id: "api-slow",
    label: "API is slow",
    query: "api slow",
    href: "/node-playground?scenario=blocking-json-parse&mode=problem",
    reason: "Slow APIs often come from event-loop blocking, sequential awaits, or worker-pool pressure.",
    keywords: ["api slow", "latency", "p95", "slow endpoint", "response delayed", "server slow"]
  },
  {
    id: "memory-growing",
    label: "Memory keeps growing",
    query: "memory growing",
    href: "/node-playground?scenario=memory-leak-cache-listener-timer&mode=problem",
    reason: "Growing memory usually means retained references, listeners, timers, caches, or large buffers.",
    keywords: ["memory growing", "heap grows", "leak", "gc not collect", "listener leak", "cache growth"]
  },
  {
    id: "stream-hangs",
    label: "Stream hangs",
    query: "stream hangs",
    href: "/node-playground?scenario=stream-error-handling&mode=problem",
    reason: "Stream chains can hang when errors and close paths are not wired through pipeline.",
    keywords: ["stream hangs", "pipe hang", "upload hangs", "download stuck", "pipeline", "stream error"]
  },
  {
    id: "promise-all-failed",
    label: "Promise.all failed everything",
    query: "promise all failed",
    href: "/node-playground?scenario=promise-allsettled-errors&mode=problem",
    reason: "Promise.all rejects the whole combined promise when one input rejects.",
    keywords: ["promise all failed", "one request failed", "all rejected", "partial success", "allsettled"]
  },
  {
    id: "threadpool-slow",
    label: "fs or DNS is slow during crypto",
    query: "thread pool pressure",
    href: "/node-playground?scenario=threadpool-saturation&mode=problem",
    reason: "fs, DNS, crypto, and zlib can compete for limited libuv worker capacity.",
    keywords: ["thread pool", "crypto slow", "fs slow", "dns slow", "worker pool", "pbkdf2"]
  },
  {
    id: "nexttick-order",
    label: "nextTick order is surprising",
    query: "nextTick priority",
    href: "/node-playground?scenario=node-queue-priority&mode=problem",
    reason: "process.nextTick has Node-only priority before Promise microtasks.",
    keywords: ["nexttick", "process.nexttick", "node order", "promise order", "setimmediate"]
  },
  {
    id: "test-flaky",
    label: "Async test is flaky",
    query: "async test flaky",
    href: "/node-playground?scenario=testing-async-timers&mode=problem",
    reason: "Fake timers and promise continuations need separate flushing in tests.",
    keywords: ["test flaky", "fake timer", "jest", "vitest", "assertion early", "testing async"]
  }
];

function normalize(value: string) {
  return value.toLowerCase().replace(/[-_().]+/g, " ").replace(/\s+/g, " ").trim();
}

export function findSymptomMatches(input: string) {
  const q = normalize(input);
  if (!q) return symptomMatches.slice(0, 6);

  return symptomMatches
    .map((symptom) => {
      const haystack = normalize(`${symptom.label} ${symptom.query} ${symptom.reason} ${symptom.keywords.join(" ")}`);
      const exact = symptom.keywords.some((keyword) => q.includes(normalize(keyword)) || normalize(keyword).includes(q));
      const tokenScore = q.split(" ").filter((token) => token.length > 2 && haystack.includes(token)).length;
      return { symptom, score: exact ? tokenScore + 10 : tokenScore };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.symptom)
    .slice(0, 6);
}
