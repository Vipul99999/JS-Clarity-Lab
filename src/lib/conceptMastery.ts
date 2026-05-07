import type { LearningRecord } from "./learningProgress";

export type MasteryConcept =
  | "Async ordering"
  | "Promise failure"
  | "Node event loop"
  | "Streams"
  | "Memory"
  | "Performance"
  | "Security"
  | "Testing";

export type ConceptMastery = {
  concept: MasteryConcept;
  completed: number;
  touched: number;
  level: "new" | "warming up" | "building" | "strong";
};

function conceptsFor(record: LearningRecord): MasteryConcept[] {
  const text = `${record.id} ${record.title} ${record.category}`.toLowerCase();
  const concepts = new Set<MasteryConcept>();
  if (text.includes("event loop") || text.includes("timer") || text.includes("microtask") || text.includes("nexttick") || text.includes("await")) concepts.add("Async ordering");
  if (text.includes("promise") || text.includes("rejection") || text.includes("error")) concepts.add("Promise failure");
  if (record.type === "node" || text.includes("node") || text.includes("threadpool") || text.includes("setimmediate")) concepts.add("Node event loop");
  if (text.includes("stream") || text.includes("buffer") || text.includes("backpressure")) concepts.add("Streams");
  if (text.includes("memory") || text.includes("leak") || text.includes("cache") || text.includes("listener")) concepts.add("Memory");
  if (text.includes("performance") || text.includes("blocking") || text.includes("worker") || text.includes("json") || text.includes("pool")) concepts.add("Performance");
  if (text.includes("security") || text.includes("validation") || text.includes("rate")) concepts.add("Security");
  if (text.includes("test") || text.includes("interview")) concepts.add("Testing");
  return [...concepts];
}

export function getConceptMastery(records: LearningRecord[]): ConceptMastery[] {
  const concepts: MasteryConcept[] = ["Async ordering", "Promise failure", "Node event loop", "Streams", "Memory", "Performance", "Security", "Testing"];
  return concepts.map((concept) => {
    const relevant = records.filter((record) => conceptsFor(record).includes(concept));
    const completed = relevant.filter((record) => record.completed).length;
    const touched = relevant.length;
    const level: ConceptMastery["level"] = completed >= 5 ? "strong" : completed >= 3 ? "building" : touched > 0 ? "warming up" : "new";
    return { concept, completed, touched, level };
  });
}
