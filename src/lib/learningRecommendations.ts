import type { LearningRecord } from "./learningProgress";
import { demos, editableDemos } from "@/demos";
import { nodeScenarios } from "@/nodePlayground/scenarios";

export type LearningRecommendation = {
  title: string;
  href: string;
  reason: string;
};

const path = [
  { title: "Promise runs before setTimeout", href: "/demo/promise-before-timeout", category: "Event Loop" },
  { title: "Missing await", href: "/demo/missing-await", category: "Async/Await" },
  { title: "Promise.all vs allSettled", href: "/node-playground?scenario=promise-allsettled-errors&mode=problem", category: "Async & Event Loop" },
  { title: "Stream pipe with backpressure", href: "/node-playground?scenario=stream-backpressure-pipe&mode=problem", category: "Streams & Buffers" },
  { title: "Large JSON parse blocks requests", href: "/node-playground?scenario=blocking-json-parse&mode=problem", category: "Memory & Performance" }
];

export function getWeakAreas(records: LearningRecord[]) {
  const touched = records.filter((record) => !record.completed);
  const counts = touched.reduce<Record<string, number>>((acc, record) => {
    acc[record.category] = (acc[record.category] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category, count]) => ({ category, count }));
}

export function getRecommendedNext(records: LearningRecord[]): LearningRecommendation {
  const completedHrefs = new Set(records.filter((record) => record.completed).map((record) => record.href));
  const nextPathItem = path.find((item) => !completedHrefs.has(item.href));
  if (nextPathItem) {
    return {
      title: nextPathItem.title,
      href: nextPathItem.href,
      reason: `Next core concept: ${nextPathItem.category}`
    };
  }

  const completedIds = new Set(records.filter((record) => record.completed).map((record) => record.id));
  const fallbackDemo = demos.find((demo) => !completedIds.has(demo.id));
  if (fallbackDemo) return { title: fallbackDemo.title, href: `/demo/${fallbackDemo.id}`, reason: "Continue guided clarity cases" };

  const fallbackEditable = editableDemos.find((demo) => !completedIds.has(demo.id));
  if (fallbackEditable) return { title: fallbackEditable.title, href: `/demo/${fallbackEditable.id}`, reason: "Try a controlled variation" };

  const fallbackNode = nodeScenarios.find((scenario) => !completedIds.has(scenario.id)) ?? nodeScenarios[0];
  return {
    title: fallbackNode.title,
    href: `/node-playground?scenario=${fallbackNode.id}&mode=problem`,
    reason: "Deepen Node runtime skill"
  };
}
