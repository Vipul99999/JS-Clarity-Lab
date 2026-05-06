import { asyncAwaitDemos } from "./asyncAwait";
import { eventLoopDemos } from "./eventLoop";
import { memoryDemos } from "./memory";
import { nodeRuntimeDemos } from "./nodeRuntime";
import { performanceDemos } from "./performance";
import { promiseDemos } from "./promises";
import { realWorldDemos } from "./realWorld";
import { editableDemos } from "./editable";

export const demos = [
  ...eventLoopDemos,
  ...promiseDemos,
  ...asyncAwaitDemos,
  ...memoryDemos,
  ...performanceDemos,
  ...nodeRuntimeDemos,
  ...realWorldDemos
];

export const categories = [
  { id: "event-loop", label: "Event Loop" },
  { id: "promises", label: "Promises" },
  { id: "async-await", label: "Async/Await" },
  { id: "memory", label: "Memory" },
  { id: "performance", label: "Performance" },
  { id: "node-runtime", label: "Node.js Runtime" },
  { id: "real-world", label: "Real-World Bugs" }
] as const;

export function getDemo(id: string) {
  return demos.find((demo) => demo.id === id);
}

export function getNextDemoId(id: string) {
  const index = demos.findIndex((demo) => demo.id === id);
  return demos[index + 1]?.id ?? demos[0]?.id;
}

export { editableDemos };

export function getEditableDemo(id: string) {
  return editableDemos.find((demo) => demo.id === id);
}
