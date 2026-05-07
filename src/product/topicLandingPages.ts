import type { DemoCategory } from "@/engine/types";

export type TopicLandingPage = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  shortAnswer: string;
  searchIntent: string[];
  primaryDemoId: string;
  relatedDemoIds: string[];
  nodeScenarioId?: string;
  sections: {
    title: string;
    body: string;
  }[];
  category: DemoCategory | "node-playground";
};

export const topicLandingPages: TopicLandingPage[] = [
  {
    slug: "promise-vs-settimeout",
    title: "Promise vs setTimeout",
    eyebrow: "High-confusion async output",
    description: "See why Promise callbacks run before setTimeout callbacks, even when the timer delay is 0ms.",
    shortAnswer: "Synchronous code runs first, Promise callbacks run next as microtasks, and timer callbacks run after the microtask queue is empty.",
    searchIntent: ["Promise vs setTimeout", "setTimeout 0 promise order", "why promise runs before timer"],
    primaryDemoId: "promise-before-timeout",
    relatedDemoIds: ["settimeout-0", "timeout-inside-promise", "promise-inside-timeout"],
    category: "event-loop",
    sections: [
      {
        title: "Why developers get surprised",
        body: "A 0ms timer does not mean immediate execution. It only schedules a callback for a future timer phase after the current stack and microtasks finish."
      },
      {
        title: "Where this appears in real apps",
        body: "This shows up in React state updates, toast cleanup, test assertions, retry timers, analytics flushing, and UI code that mixes Promise work with timer-based fallback logic."
      },
      {
        title: "Fix direction",
        body: "When order matters, use one scheduling model or make the dependency explicit with await, returned promises, or a dedicated helper."
      }
    ]
  },
  {
    slug: "javascript-event-loop-visualizer",
    title: "JavaScript Event Loop Visualizer",
    eyebrow: "Call stack, microtasks, timers",
    description: "Visualize how JavaScript moves from synchronous code to microtasks, timers, runtime callbacks, output, memory, and blocked work.",
    shortAnswer: "The event loop only moves queued work forward when the call stack is clear, and microtasks usually drain before timer callbacks.",
    searchIntent: ["JavaScript event loop visualizer", "microtask queue visualizer", "JavaScript call stack timer queue"],
    primaryDemoId: "promise-before-timeout",
    relatedDemoIds: ["sync-execution", "blocking-loop", "microtask-flood", "multiple-timers"],
    category: "event-loop",
    sections: [
      {
        title: "What the visualizer shows",
        body: "The page highlights the current code line, call stack, queues, console output, waiting runtime work, blocked time, and explanation for the active step."
      },
      {
        title: "Why it matters",
        body: "Most confusing async bugs are ordering bugs. A visual timeline helps users see what waits, what runs now, and what cannot run until later."
      },
      {
        title: "Best first case",
        body: "Start with Promise before setTimeout, then move into blocking loops, nested timers, and microtask floods."
      }
    ]
  },
  {
    slug: "nodejs-event-loop-visualizer",
    title: "Node.js Event Loop Visualizer",
    eyebrow: "Node runtime internals",
    description: "Understand Node.js queues, process.nextTick, Promises, timers, I/O poll, setImmediate, close callbacks, and the thread pool.",
    shortAnswer: "Node has multiple queues and phases. nextTick and Promise microtasks can run before timers, while I/O, check callbacks, and worker-pool callbacks depend on the selected runtime path.",
    searchIntent: ["Node.js event loop visualizer", "Node event loop phases", "setImmediate vs setTimeout visualizer"],
    primaryDemoId: "promise-before-timeout",
    relatedDemoIds: ["settimeout-0", "timeout-inside-promise", "promise-inside-timeout"],
    nodeScenarioId: "node-queue-priority",
    category: "node-playground",
    sections: [
      {
        title: "What makes Node different",
        body: "Node adds runtime-specific behavior: nextTick, libuv phases, I/O polling, check callbacks, close callbacks, and a shared worker pool for selected APIs."
      },
      {
        title: "What to inspect",
        body: "Use the Node Runtime Lab to inspect queue priority, active phase, console order, thread-pool pressure, blocked time, streams, memory, and problem vs fixed code."
      },
      {
        title: "Production connection",
        body: "This helps explain slow endpoints, delayed I/O callbacks, worker-pool starvation, stream stalls, and event loop blocking in real Node services."
      }
    ]
  },
  {
    slug: "process-nexttick-vs-promise",
    title: "process.nextTick vs Promise",
    eyebrow: "Node queue priority",
    description: "See why process.nextTick can run before Promise microtasks and how overusing it can starve other Node runtime phases.",
    shortAnswer: "In Node.js, process.nextTick callbacks are drained before Promise microtasks, so too many nextTick callbacks can delay timers, I/O, and Promise continuations.",
    searchIntent: ["process.nextTick vs Promise", "nextTick microtask priority", "Node nextTick starvation"],
    primaryDemoId: "microtask-flood",
    relatedDemoIds: ["promise-before-timeout", "settimeout-0", "timeout-inside-promise"],
    nodeScenarioId: "nexttick-starvation",
    category: "node-playground",
    sections: [
      {
        title: "Common wrong assumption",
        body: "Many developers treat nextTick and Promise.then as the same kind of microtask. In Node, nextTick has its own priority and can run first."
      },
      {
        title: "Risk in real apps",
        body: "A nextTick loop can delay I/O callbacks and make a service feel stuck under load, even though the process is still running JavaScript."
      },
      {
        title: "Safer pattern",
        body: "Use nextTick sparingly. Prefer Promise microtasks or setImmediate when other runtime phases need a chance to run."
      }
    ]
  },
  {
    slug: "async-await-mistakes",
    title: "Async/Await Mistakes",
    eyebrow: "Missing awaits and slow APIs",
    description: "Learn the async/await mistakes behind early success messages, slow endpoints, broken loops, and swallowed promise failures.",
    shortAnswer: "await pauses only the current async function. Missing await lets later code continue early, while sequential awaits can make independent work unnecessarily slow.",
    searchIntent: ["async await mistakes", "await not waiting JavaScript", "async forEach issue", "sequential await slow"],
    primaryDemoId: "missing-await",
    relatedDemoIds: ["async-foreach-issue", "sequential-await", "parallel-promise-all", "missing-return"],
    category: "async-await",
    sections: [
      {
        title: "Most common symptoms",
        body: "Success UI appears before saving, tests finish too early, loops log done before work finishes, and APIs wait for independent calls one by one."
      },
      {
        title: "What to practice",
        body: "Compare missing await, async forEach, sequential await, and Promise.all. Each case shows the output order and the safer fixed pattern."
      },
      {
        title: "Production fix direction",
        body: "Await real dependencies, return promise chains, use Promise.all for independent work, and choose for...of when sequential behavior is intentional."
      }
    ]
  },
  {
    slug: "nodejs-stream-backpressure",
    title: "Node.js Stream Backpressure",
    eyebrow: "Streams and memory",
    description: "Visualize readable streams, writable streams, chunks, pipe, backpressure, and memory difference between full reads and streaming.",
    shortAnswer: "Backpressure means the writable side cannot keep up, so the readable side must pause or slow down instead of buffering unlimited data in memory.",
    searchIntent: ["Node.js stream backpressure", "stream backpressure visualizer", "Node pipe memory usage"],
    primaryDemoId: "cache-growth",
    relatedDemoIds: ["node-stream-pipeline-error", "node-large-file-stream", "cache-growth"],
    nodeScenarioId: "stream-backpressure-pipe",
    category: "node-playground",
    sections: [
      {
        title: "Why this matters",
        body: "Large file reads, uploads, downloads, transforms, CSV imports, and proxy responses can grow memory or hang when backpressure is ignored."
      },
      {
        title: "What the visualizer proves",
        body: "Chunks move from readable to writable. When writes are slow, the queue grows unless the code respects drain or uses pipe/pipeline."
      },
      {
        title: "Real fix pattern",
        body: "Use pipe or pipeline, handle error and close paths, and avoid reading entire large files into memory when streaming is possible."
      }
    ]
  }
];

export function getTopicLandingPage(slug: string) {
  return topicLandingPages.find((page) => page.slug === slug);
}
