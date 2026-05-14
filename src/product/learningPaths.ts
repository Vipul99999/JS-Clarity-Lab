export type LearningPath = {
  id: string;
  title: string;
  audience: string;
  promise: string;
  href: string;
  steps: {
    title: string;
    href: string;
    outcome: string;
  }[];
};

export const learningPaths: LearningPath[] = [
  {
    id: "async-output-basics",
    title: "Async Output Basics",
    audience: "Beginners and interview prep",
    promise: "Understand why output order does not always match source order.",
    href: "/paths/async-output-basics",
    steps: [
      { title: "Sync execution", href: "/demo/sync-execution", outcome: "Separate normal call stack work from queued work." },
      { title: "setTimeout 0", href: "/demo/settimeout-0", outcome: "See why 0ms does not mean immediate." },
      { title: "Promise before timeout", href: "/demo/promise-before-timeout", outcome: "Lock in the microtask-before-timer rule." },
      { title: "Blocking loop delays timer", href: "/demo/blocking-loop-event-loop", outcome: "Understand why timers run late." }
    ]
  },
  {
    id: "promise-mistakes",
    title: "Promise Mistakes",
    audience: "Frontend, backend, and test writers",
    promise: "Fix the promise patterns that cause undefined values, swallowed errors, and batch failures.",
    href: "/paths/promise-mistakes",
    steps: [
      { title: "Missing return", href: "/demo/missing-return", outcome: "Keep values flowing through .then chains." },
      { title: "Error in then", href: "/demo/error-in-then", outcome: "See how thrown errors become promise rejections." },
      { title: "Promise.all fail", href: "/demo/promise-all-fail", outcome: "Know when one failure cancels the group." },
      { title: "Promise.all vs allSettled", href: "/node-playground?scenario=promise-allsettled-errors&mode=problem", outcome: "Choose fail-fast or partial success intentionally." }
    ]
  },
  {
    id: "node-runtime-internals",
    title: "Node Runtime Internals",
    audience: "Node.js developers",
    promise: "See how Node moves work through nextTick, promises, timers, I/O, check callbacks, and workers.",
    href: "/paths/node-runtime-internals",
    steps: [
      { title: "Node queue priority", href: "/node-playground?scenario=node-queue-priority&mode=problem", outcome: "Understand nextTick, Promise, timer, and immediate order." },
      { title: "fs.readFile and thread pool", href: "/node-playground?scenario=fs-readfile-threadpool&mode=problem", outcome: "See async fs leave the call stack." },
      { title: "Thread pool saturation", href: "/node-playground?scenario=threadpool-saturation&mode=problem", outcome: "Spot worker capacity pressure." },
      { title: "setImmediate inside I/O", href: "/node-playground?scenario=setimmediate-inside-io&mode=problem", outcome: "Reason about check phase behavior." }
    ]
  },
  {
    id: "memory-leaks",
    title: "Memory Leaks",
    audience: "App and platform developers",
    promise: "Recognize references that keep memory alive and learn how to verify cleanup.",
    href: "/paths/memory-leaks",
    steps: [
      { title: "Interval leak", href: "/demo/interval-leak", outcome: "Clear long-lived timers." },
      { title: "Event listener leak", href: "/demo/event-listener-leak", outcome: "Remove listeners that retain state." },
      { title: "Cache growth", href: "/demo/cache-growth", outcome: "Bound memory with size or TTL." },
      { title: "Redis/cache memory growth", href: "/demo/redis-cache-memory-growth", outcome: "Connect app caches to production heap symptoms." }
    ]
  },
  {
    id: "performance-debugging",
    title: "Performance Debugging",
    audience: "Developers chasing slow UI or APIs",
    promise: "Find whether slowness comes from blocking work, sequential waits, worker pressure, or large data.",
    href: "/paths/performance-debugging",
    steps: [
      { title: "Sequential await", href: "/demo/sequential-await", outcome: "Spot additive latency." },
      { title: "Parallel Promise.all", href: "/demo/parallel-promise-all", outcome: "Start independent work together." },
      { title: "Express slow route", href: "/demo/express-slow-route-blocking", outcome: "See CPU work block requests." },
      { title: "Worker thread for CPU work", href: "/node-playground?scenario=worker-thread-cpu&mode=problem", outcome: "Move CPU off the event loop." }
    ]
  },
  {
    id: "interview-prep",
    title: "Interview Prep",
    audience: "Candidates and mentors",
    promise: "Practice explaining output order and runtime behavior clearly.",
    href: "/paths/interview-prep",
    steps: [
      { title: "Promise before timeout", href: "/demo/promise-before-timeout", outcome: "Explain microtasks before timers." },
      { title: "Async forEach issue", href: "/demo/async-foreach-issue", outcome: "Explain why forEach does not await callbacks." },
      { title: "process.nextTick vs Promise", href: "/demo/process-nexttick-priority", outcome: "Explain Node-only priority." },
      { title: "Interview: event loop story", href: "/node-playground?scenario=interview-event-loop-story&mode=problem", outcome: "Tell the full runtime story." }
    ]
  }
];

export function getLearningPath(id: string) {
  return learningPaths.find((path) => path.id === id);
}
