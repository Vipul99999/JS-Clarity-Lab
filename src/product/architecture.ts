import {
  BookOpen,
  Brain,
  BriefcaseBusiness,
  Code2,
  GraduationCap,
  Gauge,
  MemoryStick,
  SearchCode,
  Server,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Users,
  Zap
} from "lucide-react";

export const corePromise = {
  title: "Visual answers for JavaScript behavior that feels impossible until you see it.",
  body:
    "JS Clarity Lab is built for the moment when output order, async timing, Node queues, memory growth, or slow APIs stop making sense. It turns that confusion into a predictable flow: choose the situation, predict, run, inspect, and apply the real-world fix."
};

export const primaryActions = [
  {
    title: "I want to understand a confusing output",
    body: "Use curated clarity cases when the code is small but the output order feels wrong.",
    href: "/demo/promise-before-timeout",
    icon: Brain,
    cta: "Start clarity case"
  },
  {
    title: "I want to debug pasted code",
    body: "Paste JavaScript and get partial pattern detection, confidence, limitations, and a visual simulation.",
    href: "/analyze",
    icon: SearchCode,
    cta: "Open analyzer"
  },
  {
    title: "I want to learn Node.js runtime behavior",
    body: "Enter the advanced lab for nextTick, timers, I/O, thread pool, streams, memory, and performance.",
    href: "/node-playground",
    icon: Server,
    cta: "Open Node lab"
  }
];

export const userPaths = [
  {
    audience: "Students and learners",
    icon: GraduationCap,
    need: "I do not know why JavaScript printed this order.",
    productAnswer: "Start with one tiny case, predict first, then watch the runtime move step by step.",
    href: "/start"
  },
  {
    audience: "Teachers and mentors",
    icon: BookOpen,
    need: "I need to explain async behavior without drawing the same queue diagram again.",
    productAnswer: "Use guided cases as live classroom visuals with prediction and real-world usage built in.",
    href: "/demo/promise-before-timeout"
  },
  {
    audience: "Working developers",
    icon: Code2,
    need: "My bug is probably async timing, missing await, a bad Promise combinator, or blocked work.",
    productAnswer: "Use analyzer and real-world demos to identify the pattern and compare problem vs fixed behavior.",
    href: "/analyze"
  },
  {
    audience: "Node professionals",
    icon: BriefcaseBusiness,
    need: "I need to reason about runtime internals, performance, streams, or production failure modes.",
    productAnswer: "Use Node Runtime Lab with visual/pro modes, thread-pool lanes, stream flow, memory, and debug panels.",
    href: "/node-playground?scenario=node-queue-priority&mode=problem"
  }
];

export const problemRoutes = [
  { label: "Why did this print first?", href: "/demo/promise-before-timeout", icon: Sparkles, outcome: "Understand stack, microtasks, and timers." },
  { label: "Why did await not wait?", href: "/demo/missing-await", icon: Zap, outcome: "Spot missing await and premature code flow." },
  { label: "Why is my API slow?", href: "/demo/sequential-await", icon: Gauge, outcome: "Compare sequential waits with parallel work." },
  { label: "Why is memory growing?", href: "/demo/interval-leak", icon: MemoryStick, outcome: "See retained references and cleanup fixes." },
  { label: "How does Node run this?", href: "/node-playground?scenario=node-queue-priority&mode=problem", icon: TerminalSquare, outcome: "Watch nextTick, promises, timers, check, and I/O queues." },
  { label: "Is this safe for production?", href: "/demo/security-validation-rate-limit", icon: ShieldCheck, outcome: "See validation, rate limits, and safer request flow." }
];

export const universalFlow = [
  "Concept",
  "Predict",
  "Run",
  "Inspect",
  "Fix / real-world use"
];

export const productAreas = [
  { title: "Clarity Cases", body: "Small guided demos for confusing JavaScript behavior.", href: "/demo/promise-before-timeout" },
  { title: "Try Variations", body: "Controlled editable cases where code, timeline, and explanation change together.", href: "/demo/promise-before-timeout" },
  { title: "Analyze Code", body: "Paste code and visualize supported async patterns without executing arbitrary code.", href: "/analyze" },
  { title: "Node Runtime Lab", body: "Advanced runtime playground for queues, workers, streams, memory, and production scenarios.", href: "/node-playground" }
];

export const productDecisions = [
  {
    title: "Default to fewer panels",
    body: "Beginners should see code, visual timeline, console, and one-line explanation first. Deep queues and debug details stay available when useful."
  },
  {
    title: "Use real problem language",
    body: "The product starts with symptoms like 'Why is my timer late?' and introduces technical terms only after the user enters the case."
  },
  {
    title: "Animate causality, not decoration",
    body: "Motion should show what moved, where it waited, and why it ran next. Extra animation that does not improve understanding gets removed."
  },
  {
    title: "Show trust and limits",
    body: "The analyzer is honest: it detects known patterns, shows confidence, and explains what it cannot simulate."
  }
];

export const realProblemsSolved = [
  "Unexpected console output order in promises, timers, nextTick, and async/await.",
  "Tests that fail because timers, promises, and microtasks are flushed in the wrong order.",
  "Slow APIs caused by sequential awaits, blocked event loops, large parsing, or saturated worker pools.",
  "Memory growth from intervals, listeners, caches, closures, streams, and retained references.",
  "Production Node confusion around I/O callbacks, thread pool work, streams, backpressure, and graceful shutdown."
];
