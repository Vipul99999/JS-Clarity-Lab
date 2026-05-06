export type VisualEvent =
  | { type: "line"; line: number; explain?: string }
  | { type: "stack_push"; name: string }
  | { type: "stack_pop"; name: string }
  | { type: "microtask_add"; name: string }
  | { type: "microtask_run"; name: string; explain?: string }
  | { type: "timer_add"; name: string; delay?: number }
  | { type: "timer_run"; name: string; explain?: string }
  | { type: "webapi_add"; name: string; detail?: string }
  | { type: "webapi_remove"; name: string }
  | { type: "console"; value: string }
  | { type: "memory_allocate"; id: string; label?: string; size: string | number }
  | { type: "memory_retain"; id: string; reason: string }
  | { type: "memory_release"; id: string }
  | { type: "gc_attempt"; result: "collected" | "not_collected" | string; reason?: string }
  | { type: "performance_block"; duration: number; reason: string }
  | { type: "timeline_wait"; duration: number; reason?: string };

export type VisualState = {
  currentLine: number;
  callStack: string[];
  microtaskQueue: string[];
  timerQueue: string[];
  webApis: string[];
  consoleOutput: string[];
  memory: Record<string, { label?: string; size?: string | number; retainedBy?: string[]; released?: boolean; gc?: string }>;
  blockedDuration: number;
  elapsedTime: number;
  activeEvent?: VisualEvent;
};

export type Prediction =
  | {
      type: "mcq";
      question: string;
      options: string[];
      correct: string;
    }
  | {
      type: "order";
      question: string;
      options: string[];
      correct: string[];
    }
  | {
      type: "text";
      question: string;
      correct: string;
      placeholder?: string;
    };

export type Explanation = {
  summary: string;
  steps: string[];
  mistake: string;
  realWorld: string;
};

export type DemoCategory =
  | "event-loop"
  | "promises"
  | "async-await"
  | "memory"
  | "performance"
  | "node-runtime"
  | "real-world";

export type Demo = {
  id: string;
  number: number;
  title: string;
  category: DemoCategory;
  concept: string;
  code: string;
  prediction: Prediction;
  events: VisualEvent[];
  explanation: Explanation;
};
