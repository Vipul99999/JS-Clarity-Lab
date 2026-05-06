import type { Demo } from "@/engine/types";

export const asyncAwaitDemos: Demo[] = [
  {
    id: "async-returns-promise",
    number: 16,
    title: "async returns promise",
    category: "async-await",
    concept: "An async function always returns a promise.",
    code: `async function getValue() {
  return 42;
}
console.log(getValue() instanceof Promise);`,
    prediction: { type: "mcq", question: "What is logged?", options: ["true", "false", "42"], correct: "true" },
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 1 }, { type: "line", line: 4 }, { type: "stack_push", name: "getValue" }, { type: "line", line: 2 }, { type: "stack_pop", name: "getValue" }, { type: "console", value: "true" }, { type: "stack_pop", name: "global" }
    ],
    explanation: {
      summary: "`async` wraps returned values in a resolved promise.",
      steps: ["Calling the function creates a promise.", "Returning 42 resolves that promise.", "The expression checks the wrapper promise."],
      mistake: "Expecting an async function to return the raw value.",
      realWorld: "Callers must `await` or `.then` async function results."
    }
  },
  {
    id: "await-behavior",
    number: 17,
    title: "await behavior",
    category: "async-await",
    concept: "`await` pauses the async function and resumes it in a microtask.",
    code: `async function run() {
  console.log("A");
  await Promise.resolve();
  console.log("B");
}
run();
console.log("C");`,
    prediction: { type: "order", question: "Predict the logs.", options: ["A", "B", "C"], correct: ["A", "C", "B"] },
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 6 }, { type: "stack_push", name: "run" }, { type: "line", line: 2 }, { type: "console", value: "A" }, { type: "line", line: 3 }, { type: "microtask_add", name: "resume run" }, { type: "stack_pop", name: "run" },
      { type: "line", line: 7 }, { type: "console", value: "C" }, { type: "stack_pop", name: "global" },
      { type: "microtask_run", name: "resume run" }, { type: "line", line: 4 }, { type: "console", value: "B" }, { type: "stack_pop", name: "resume run" }
    ],
    explanation: {
      summary: "`await` yields control even when the promise is already resolved.",
      steps: ["A logs before await.", "The continuation is queued.", "C logs from global code.", "The async function resumes and logs B."],
      mistake: "Thinking `await Promise.resolve()` continues synchronously.",
      realWorld: "Await points can let other code observe intermediate state."
    }
  },
  {
    id: "missing-await",
    number: 18,
    title: "missing await",
    category: "async-await",
    concept: "Without `await`, code keeps going while the promise is pending.",
    code: `async function save() {
  return "saved";
}
const result = save();
console.log(result);`,
    prediction: { type: "mcq", question: "What kind of value is logged?", options: ["A promise", "The string saved", "undefined"], correct: "A promise" },
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 4 }, { type: "stack_push", name: "save" }, { type: "line", line: 2 }, { type: "stack_pop", name: "save" }, { type: "line", line: 5 }, { type: "console", value: "Promise { 'saved' }" }, { type: "stack_pop", name: "global" }
    ],
    explanation: {
      summary: "Calling an async function gives you the promise unless you await it.",
      steps: ["`save()` returns a promise.", "The variable stores that promise.", "The log prints the promise object."],
      mistake: "Forgetting `await` in tests, handlers, and data loaders.",
      realWorld: "Missing awaits can cause loading states, redirects, or assertions to run too early."
    }
  },
  {
    id: "try-catch-await",
    number: 19,
    title: "try/catch",
    category: "async-await",
    concept: "A try/catch around `await` catches promise rejections.",
    code: `async function run() {
  try {
    await Promise.reject("nope");
  } catch (error) {
    console.log(error);
  }
}
run();`,
    prediction: { type: "mcq", question: "What is logged?", options: ["nope", "nothing", "undefined"], correct: "nope" },
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 8 }, { type: "stack_push", name: "run" }, { type: "line", line: 3 }, { type: "microtask_add", name: "throw into run" }, { type: "stack_pop", name: "run" }, { type: "stack_pop", name: "global" },
      { type: "microtask_run", name: "throw into run" }, { type: "line", line: 4 }, { type: "line", line: 5 }, { type: "console", value: "nope" }, { type: "stack_pop", name: "throw into run" }
    ],
    explanation: {
      summary: "`await` turns a rejected promise into a thrown value at the await point.",
      steps: ["The rejection pauses the function.", "Resume happens as a microtask.", "Control jumps to catch.", "The rejection reason is logged."],
      mistake: "Putting try/catch around the caller instead of around the awaited operation.",
      realWorld: "This is the normal shape for request error handling in async functions."
    }
  },
  {
    id: "sequential-await",
    number: 20,
    title: "sequential await",
    category: "async-await",
    concept: "Awaiting one operation before starting the next makes them sequential.",
    code: `async function load() {
  const user = await fetchUser();
  const posts = await fetchPosts();
  console.log("done");
}`,
    prediction: { type: "mcq", question: "When does fetchPosts start?", options: ["After fetchUser finishes", "At the same time", "Before fetchUser"], correct: "After fetchUser finishes" },
    events: [
      { type: "stack_push", name: "load" }, { type: "line", line: 2 }, { type: "timer_add", name: "fetchUser" }, { type: "stack_pop", name: "load" },
      { type: "timer_run", name: "fetchUser" }, { type: "microtask_add", name: "resume after user" }, { type: "stack_pop", name: "fetchUser" },
      { type: "microtask_run", name: "resume after user" }, { type: "line", line: 3 }, { type: "timer_add", name: "fetchPosts" }, { type: "stack_pop", name: "resume after user" },
      { type: "timer_run", name: "fetchPosts" }, { type: "microtask_add", name: "resume after posts" }, { type: "stack_pop", name: "fetchPosts" },
      { type: "microtask_run", name: "resume after posts" }, { type: "line", line: 4 }, { type: "console", value: "done" }, { type: "stack_pop", name: "resume after posts" }
    ],
    explanation: {
      summary: "The second request is not started until the first await resumes.",
      steps: ["Start fetchUser.", "Wait for it.", "Then start fetchPosts.", "Log after both are complete."],
      mistake: "Accidentally serializing independent work.",
      realWorld: "Sequential awaits are correct for dependencies but slow for independent API calls."
    }
  },
  {
    id: "parallel-promise-all",
    number: 21,
    title: "parallel Promise.all",
    category: "async-await",
    concept: "Start independent promises first, then await them together.",
    code: `async function load() {
  const userPromise = fetchUser();
  const postsPromise = fetchPosts();
  await Promise.all([userPromise, postsPromise]);
  console.log("done");
}`,
    prediction: { type: "mcq", question: "How do the requests run?", options: ["In parallel", "One after another", "They do not run"], correct: "In parallel" },
    events: [
      { type: "stack_push", name: "load" }, { type: "line", line: 2 }, { type: "timer_add", name: "fetchUser" }, { type: "line", line: 3 }, { type: "timer_add", name: "fetchPosts" }, { type: "line", line: 4 }, { type: "stack_pop", name: "load" },
      { type: "timer_run", name: "fetchUser" }, { type: "stack_pop", name: "fetchUser" }, { type: "timer_run", name: "fetchPosts" }, { type: "microtask_add", name: "resume all" }, { type: "stack_pop", name: "fetchPosts" },
      { type: "microtask_run", name: "resume all" }, { type: "line", line: 5 }, { type: "console", value: "done" }, { type: "stack_pop", name: "resume all" }
    ],
    explanation: {
      summary: "Both async operations start before the await.",
      steps: ["Start user request.", "Start posts request.", "Await both promises together.", "Resume after both complete."],
      mistake: "Using `Promise.all` after already awaiting each item.",
      realWorld: "This pattern reduces latency for independent dashboard or page data."
    }
  },
  {
    id: "async-foreach-issue",
    number: 22,
    title: "async forEach issue",
    category: "async-await",
    concept: "`forEach` does not await async callbacks.",
    code: `[1, 2].forEach(async (n) => {
  await Promise.resolve();
  console.log(n);
});
console.log("done");`,
    prediction: { type: "order", question: "What logs first to last?", options: ["1", "2", "done"], correct: ["done", "1", "2"] },
    events: [
      { type: "stack_push", name: "global" }, { type: "line", line: 1 }, { type: "stack_push", name: "callback 1" }, { type: "line", line: 2 }, { type: "microtask_add", name: "resume 1" }, { type: "stack_pop", name: "callback 1" },
      { type: "stack_push", name: "callback 2" }, { type: "line", line: 2 }, { type: "microtask_add", name: "resume 2" }, { type: "stack_pop", name: "callback 2" },
      { type: "line", line: 5 }, { type: "console", value: "done" }, { type: "stack_pop", name: "global" },
      { type: "microtask_run", name: "resume 1" }, { type: "line", line: 3 }, { type: "console", value: "1" }, { type: "stack_pop", name: "resume 1" },
      { type: "microtask_run", name: "resume 2" }, { type: "line", line: 3 }, { type: "console", value: "2" }, { type: "stack_pop", name: "resume 2" }
    ],
    explanation: {
      summary: "`forEach` starts callbacks and ignores the promises they return.",
      steps: ["Both async callbacks begin.", "Each pauses at await.", "The outer script logs done.", "Callbacks resume later."],
      mistake: "Expecting `forEach` to behave like `for...of` with await.",
      realWorld: "Use `for...of` for sequential work or `Promise.all(items.map(...))` for parallel work."
    }
  }
];
