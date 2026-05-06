export type AnalyzerExample = {
  title: string;
  context: string;
  code: string;
};

export const analyzerExamples: AnalyzerExample[] = [
  {
    title: "Promise beats timer",
    context: "Debug surprising log order in tests or UI handlers.",
    code: `console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");`
  },
  {
    title: "queueMicrotask before timer",
    context: "Understand schedulers and state flushes.",
    code: `console.log("start");
queueMicrotask(() => console.log("microtask"));
setTimeout(() => console.log("timer"), 0);
console.log("end");`
  },
  {
    title: "Rejected promise catch",
    context: "See why catch handlers run asynchronously.",
    code: `console.log("before");
Promise.reject("bad").catch(() => console.log("caught"));
console.log("after");`
  },
  {
    title: "Promise.all simplified",
    context: "Reason about parallel request coordination.",
    code: `console.log("load");
Promise.all([fetchUser(), fetchPosts()]);
console.log("render shell");`
  },
  {
    title: "Await inside try/catch",
    context: "Model async error boundaries in form submits and loaders.",
    code: `async function submit() {
  console.log("start");
  try {
    await saveForm();
  } catch (error) {
    console.log("failed");
  }
}
submit();`
  },
  {
    title: "Async map warning",
    context: "Catch bulk-work bugs before shipping.",
    code: `const promises = items.map(async (item) => {
  await save(item);
  console.log("saved");
});
console.log("done");`
  },
  {
    title: "Interval first tick",
    context: "Recognize polling and timer cleanup risks.",
    code: `console.log("mount");
setInterval(() => console.log("poll"), 1000);
console.log("ready");`
  }
];
