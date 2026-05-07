import { z } from "zod";
import type { NodeEvent, NodeScenario } from "./types";

export type BugRecipe = {
  symptom: string;
  badCode: string;
  whyItFails: string;
  visualProof: string[];
  fixedCode: string;
  howToVerify: string[];
};

export type ScenarioContract = {
  id: string;
  valid: boolean;
  issues: string[];
  concept: string;
  prediction: NodeScenario["prediction"];
  visualEvents: NodeEvent[];
  explanation: NodeScenario["explanation"];
  realWorldBug: string;
  fixedVersion: {
    code: string;
    events: NodeEvent[];
    explanation: string;
  };
  recommendedNextId: string;
  bugRecipe: BugRecipe;
};

const scenarioSchema = z.object({
  id: z.string().min(2),
  concept: z.string().min(20),
  realWorld: z.string().min(20),
  prediction: z.object({
    question: z.string().min(5)
  }).passthrough(),
  events: z.array(z.object({ type: z.string() }).passthrough()).min(1),
  explanation: z.object({
    summary: z.string().min(10),
    steps: z.array(z.string()).min(1),
    mistake: z.string().min(10),
    realWorld: z.string().min(20)
  }).passthrough(),
  problemCode: z.string().min(5),
  variation: z.string().min(10)
}).passthrough();

function eventProof(events: NodeEvent[]) {
  const proof: string[] = [];
  if (events.some((event) => event.type === "performance_block")) proof.push("The visual trace shows the event loop blocked before later callbacks can run.");
  if (events.some((event) => event.type === "threadpool_add")) proof.push("The worker-pool lane shows tasks leaving JavaScript and competing for limited workers.");
  if (events.some((event) => event.type === "stream_backpressure")) proof.push("The stream lane shows backpressure when the writable side cannot keep up.");
  if (events.some((event) => event.type === "memory_retain" || event.type === "gc_attempt")) proof.push("The memory lane shows retained references or a GC attempt that cannot collect data.");
  if (events.some((event) => event.type === "nexttick_run" || event.type === "microtask_run" || event.type === "timer_run")) proof.push("The queue lanes show exactly which callback gets priority.");
  if (events.some((event) => event.type === "io_add" || event.type === "io_run")) proof.push("The I/O lane shows where Node waits for filesystem, network, database, or shutdown work.");
  return proof.length ? proof : ["The timeline shows the runtime order step by step, including the current source line and console output."];
}

function verifySteps(scenario: NodeScenario) {
  const steps = ["Run the problem version and confirm the console output or timing matches the visual trace."];
  if (scenario.fixedCode) steps.push("Switch to Fixed mode and compare output, blocked time, retained memory, or queued workers.");
  if (scenario.category === "Memory & Performance") steps.push("In a real app, check p95 latency, CPU profiles, heap snapshots, or worker-pool saturation during repeated runs.");
  if (scenario.category === "Files & Networking") steps.push("Measure dependency latency separately from JavaScript execution time.");
  if (scenario.category === "Streams & Buffers") steps.push("Watch memory usage and backpressure/drain signals with large inputs.");
  if (scenario.category === "Errors & Debugging") steps.push("Add a failing test or forced rejection to confirm the error reaches the intended handler.");
  return steps;
}

export function buildScenarioContract(scenario: NodeScenario, allScenarios: NodeScenario[]): ScenarioContract {
  const parsed = scenarioSchema.safeParse(scenario);
  const currentIndex = allScenarios.findIndex((item) => item.id === scenario.id);
  const recommendedNext = allScenarios[currentIndex + 1] ?? allScenarios[0] ?? scenario;
  const issues = parsed.success ? [] : parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  const fixedCode = scenario.fixedCode ?? `// Fixed thinking pattern for this case\n// ${scenario.whyFixWorks ?? scenario.explanation.summary}\n${scenario.problemCode}`;
  const fixedEvents = scenario.fixedEvents ?? scenario.events;
  const whyItFails = scenario.whatGoesWrong ?? scenario.explanation.mistake;

  return {
    id: scenario.id,
    valid: issues.length === 0,
    issues,
    concept: scenario.concept,
    prediction: scenario.prediction,
    visualEvents: scenario.events,
    explanation: scenario.explanation,
    realWorldBug: scenario.realWorld,
    fixedVersion: {
      code: fixedCode,
      events: fixedEvents,
      explanation: scenario.whyFixWorks ?? scenario.explanation.realWorld
    },
    recommendedNextId: recommendedNext.id,
    bugRecipe: {
      symptom: scenario.realWorld,
      badCode: scenario.problemCode,
      whyItFails,
      visualProof: eventProof(scenario.events),
      fixedCode,
      howToVerify: verifySteps(scenario)
    }
  };
}

export function validateScenarioLibrary(scenarios: NodeScenario[]) {
  return scenarios.map((scenario) => buildScenarioContract(scenario, scenarios));
}
