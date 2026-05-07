import type { Explanation, Prediction } from "@/engine/types";

export type NodePlaygroundLevel = "beginner" | "intermediate" | "advanced" | "production";

export type NodePlaygroundCategory =
  | "Node.js Fundamentals"
  | "Async & Event Loop"
  | "Streams & Buffers"
  | "Files & Networking"
  | "Errors & Debugging"
  | "Memory & Performance"
  | "Security"
  | "Testing"
  | "Deployment"
  | "Interview Questions";

export type NodePanel =
  | "callStack"
  | "microtasks"
  | "timers"
  | "io"
  | "check"
  | "close"
  | "threadPool"
  | "streams"
  | "memory"
  | "performance"
  | "debugger";

export type NodeEvent =
  | { type: "line"; line: number; detail?: string }
  | { type: "stack_push"; name: string }
  | { type: "stack_pop"; name: string }
  | { type: "nexttick_add"; name: string }
  | { type: "nexttick_run"; name: string }
  | { type: "microtask_add"; name: string }
  | { type: "microtask_run"; name: string }
  | { type: "timer_add"; name: string; delay?: number }
  | { type: "timer_run"; name: string }
  | { type: "io_add"; name: string; detail?: string }
  | { type: "io_run"; name: string }
  | { type: "check_add"; name: string }
  | { type: "check_run"; name: string }
  | { type: "close_add"; name: string }
  | { type: "close_run"; name: string }
  | { type: "threadpool_add"; name: string; work: "fs" | "crypto" | "zlib" | "dns"; duration: number }
  | { type: "threadpool_start"; name: string }
  | { type: "threadpool_done"; name: string }
  | { type: "stream_chunk"; stream: string; chunk: string; bytes: number }
  | { type: "stream_backpressure"; stream: string; reason: string }
  | { type: "stream_drain"; stream: string }
  | { type: "memory_allocate"; id: string; label: string; size: number }
  | { type: "memory_retain"; id: string; reason: string }
  | { type: "memory_release"; id: string }
  | { type: "gc_attempt"; result: "collected" | "not_collected"; reason: string }
  | { type: "performance_block"; duration: number; reason: string }
  | { type: "variable_set"; name: string; value: string }
  | { type: "promise_pending"; name: string }
  | { type: "promise_settled"; name: string; result: string }
  | { type: "timer_active"; name: string }
  | { type: "timer_clear"; name: string }
  | { type: "listener_add"; name: string }
  | { type: "listener_remove"; name: string }
  | { type: "async_chain"; value: string }
  | { type: "console"; value: string }
  | { type: "wait"; duration: number; reason: string };

export type NodeState = {
  currentLine: number;
  callStack: string[];
  nextTickQueue: string[];
  microtaskQueue: string[];
  timerQueue: string[];
  ioQueue: string[];
  checkQueue: string[];
  closeQueue: string[];
  threadPool: { name: string; work: string; duration: number; status: "queued" | "running" | "done" }[];
  streamEvents: { stream: string; chunk?: string; bytes?: number; status: string }[];
  consoleOutput: string[];
  memory: Record<string, { label: string; size: number; retainedBy: string[]; released?: boolean }>;
  variables: Record<string, string>;
  pendingPromises: Record<string, string>;
  activeTimers: string[];
  eventListeners: string[];
  asyncChain: string[];
  blockedDuration: number;
  elapsedTime: number;
  activeEvent?: NodeEvent;
};

export type NodeScenario = {
  id: string;
  title: string;
  category: NodePlaygroundCategory;
  level: NodePlaygroundLevel;
  concept: string;
  realWorld: string;
  panels: NodePanel[];
  problemCode: string;
  fixedCode?: string;
  events: NodeEvent[];
  fixedEvents?: NodeEvent[];
  prediction: Prediction;
  explanation: Explanation;
  variation: string;
  whatGoesWrong?: string;
  whyFixWorks?: string;
  limitations?: string[];
};
