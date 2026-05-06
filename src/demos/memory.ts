import type { Demo } from "@/engine/types";

export const memoryDemos: Demo[] = [
  {
    id: "interval-leak",
    number: 23,
    title: "interval leak",
    category: "memory",
    concept: "Intervals keep callbacks and captured data alive until cleared.",
    code: `function mount() {
  const data = new Array(100000).fill("item");
  setInterval(() => console.log(data.length), 1000);
}
mount();`,
    prediction: { type: "mcq", question: "Why can data stay in memory?", options: ["The interval callback references it", "Arrays never get collected", "console.log stores it"], correct: "The interval callback references it" },
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 5 }, { type: "stack_push", name: "mount" }, { type: "line", line: 2 }, { type: "memory_allocate", id: "data", size: "large array" },
      { type: "line", line: 3 }, { type: "timer_add", name: "interval callback" }, { type: "memory_retain", id: "data", reason: "captured by interval callback" }, { type: "stack_pop", name: "mount" }, { type: "stack_pop", name: "global" },
      { type: "gc_attempt", result: "data retained because interval is still active" }
    ],
    explanation: {
      summary: "The active interval keeps its callback reachable, and the callback closes over `data`.",
      steps: ["The array is allocated.", "The interval callback captures it.", "The function returns.", "GC cannot remove the array while the interval remains active."],
      mistake: "Forgetting to clear intervals on unmount or teardown.",
      realWorld: "Clear polling intervals in React effects, widgets, and background refresh loops."
    }
  },
  {
    id: "event-listener-leak",
    number: 24,
    title: "event listener leak",
    category: "memory",
    concept: "Listeners can retain component state after the UI is gone.",
    code: `function mount(button) {
  const state = { modal: "settings" };
  button.addEventListener("click", () => {
    console.log(state.modal);
  });
}`,
    prediction: { type: "mcq", question: "What keeps state reachable?", options: ["The click listener closure", "The object literal syntax", "The function name"], correct: "The click listener closure" },
    events: [
      { type: "stack_push", name: "mount" }, { type: "line", line: 2 }, { type: "memory_allocate", id: "state", size: "component state" },
      { type: "line", line: 3 }, { type: "memory_retain", id: "state", reason: "captured by DOM listener" }, { type: "stack_pop", name: "mount" },
      { type: "gc_attempt", result: "state retained while listener remains attached" }
    ],
    explanation: {
      summary: "A registered listener is reachable from the DOM node, so captured values stay reachable too.",
      steps: ["State is allocated.", "The listener captures it.", "The listener is registered on a long-lived node.", "GC must keep the captured state."],
      mistake: "Removing DOM without removing listeners on long-lived targets.",
      realWorld: "Clean up window, document, and shared element listeners in component lifecycles."
    }
  },
  {
    id: "closure-memory-hold",
    number: 25,
    title: "closure memory hold",
    category: "memory",
    concept: "Closures keep referenced outer variables alive.",
    code: `function makeReader() {
  const big = new Array(100000).fill("x");
  return () => big[0];
}
const read = makeReader();`,
    prediction: { type: "mcq", question: "Can `big` be collected after makeReader returns?", options: ["No, read still references it", "Yes, the function returned", "Only after one second"], correct: "No, read still references it" },
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 5 }, { type: "stack_push", name: "makeReader" }, { type: "line", line: 2 }, { type: "memory_allocate", id: "big", size: "large array" },
      { type: "line", line: 3 }, { type: "memory_retain", id: "big", reason: "captured by returned function" }, { type: "stack_pop", name: "makeReader" }, { type: "stack_pop", name: "global" },
      { type: "gc_attempt", result: "big retained by read closure" }
    ],
    explanation: {
      summary: "The returned function forms a closure over `big`.",
      steps: ["The array is allocated inside makeReader.", "The returned function references it.", "The caller stores that function.", "The array remains reachable through the closure."],
      mistake: "Assuming local variables always disappear when a function returns.",
      realWorld: "Closures are useful for caches and private state, but can accidentally retain large objects."
    }
  },
  {
    id: "cache-growth",
    number: 26,
    title: "cache growth",
    category: "memory",
    concept: "Caches need eviction or they grow for the lifetime of the app.",
    code: `const cache = new Map();
function getUser(id) {
  cache.set(id, { id, profile: "..." });
  return cache.get(id);
}
getUser(1);
getUser(2);`,
    prediction: { type: "mcq", question: "What happens as more ids are requested?", options: ["The Map keeps growing", "Old entries vanish immediately", "Map only stores one item"], correct: "The Map keeps growing" },
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 1 }, { type: "memory_allocate", id: "cache", size: "Map" },
      { type: "line", line: 6 }, { type: "stack_push", name: "getUser(1)" }, { type: "line", line: 3 }, { type: "memory_allocate", id: "user:1", size: "profile object" }, { type: "memory_retain", id: "user:1", reason: "stored in cache" }, { type: "stack_pop", name: "getUser(1)" },
      { type: "line", line: 7 }, { type: "stack_push", name: "getUser(2)" }, { type: "line", line: 3 }, { type: "memory_allocate", id: "user:2", size: "profile object" }, { type: "memory_retain", id: "user:2", reason: "stored in cache" }, { type: "stack_pop", name: "getUser(2)" },
      { type: "gc_attempt", result: "cached profiles retained" }, { type: "stack_pop", name: "global" }
    ],
    explanation: {
      summary: "A plain `Map` strongly references every entry until you delete it.",
      steps: ["The Map is allocated.", "Each request stores a new object.", "The cache references those objects.", "GC cannot remove retained entries."],
      mistake: "Adding a cache without a size limit or expiry.",
      realWorld: "Use LRU, TTL, explicit invalidation, or WeakMap when appropriate."
    }
  }
];
