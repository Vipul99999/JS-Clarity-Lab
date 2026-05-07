"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Compass, RotateCcw, Search, Server, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SaveCaseButton } from "@/components/SaveCaseButton";
import { SavedCasesShelf } from "@/components/SavedCasesShelf";
import { categories, demos, editableDemos } from "@/demos";
import { nodeScenarioCategories, nodeScenarios } from "@/nodePlayground/scenarios";
import { useLearningProgress } from "@/lib/learningProgress";
import { findSymptomMatches } from "@/product/symptoms";

type DiscoveryItem = {
  id: string;
  type: "Guided" | "Editable" | "Node";
  title: string;
  category: string;
  level: string;
  body: string;
  realWorld: string;
  href: string;
};

const categoryLabels = Object.fromEntries(categories.map((category) => [category.id, category.label]));

const items: DiscoveryItem[] = [
  ...demos.map((demo) => ({
    id: demo.id,
    type: "Guided" as const,
    title: demo.title,
    category: categoryLabels[demo.category] ?? demo.category,
    level: "guided",
    body: demo.concept,
    realWorld: demo.explanation.realWorld,
    href: `/demo/${demo.id}`
  })),
  ...editableDemos.map((demo) => ({
    id: demo.id,
    type: "Editable" as const,
    title: demo.title,
    category: categoryLabels[demo.category] ?? demo.category,
    level: demo.difficulty,
    body: demo.concept.short,
    realWorld: demo.generateExplanation(demo.defaultParams).realWorld,
    href: `/demo/${demo.id}`
  })),
  ...nodeScenarios.map((scenario) => ({
    id: scenario.id,
    type: "Node" as const,
    title: scenario.title,
    category: scenario.category,
    level: scenario.level,
    body: scenario.concept,
    realWorld: scenario.realWorld,
    href: `/node-playground?scenario=${scenario.id}&mode=problem`
  }))
];

const problemFilters = [
  "All",
  "Confusing output",
  "Slow API",
  "Memory growing",
  "Node internals",
  "Streams",
  "Testing",
  "Security",
  "Interview"
];

const intentRoutes = [
  {
    title: "I saw weird output",
    body: "Start with promises, timers, await, output order, and queue priority.",
    problem: "Confusing output",
    type: "All"
  },
  {
    title: "My API is slow",
    body: "Find sequential await, blocking work, worker-pool pressure, and performance cases.",
    problem: "Slow API",
    type: "All"
  },
  {
    title: "Memory keeps growing",
    body: "Find leaks, intervals, listeners, caches, buffers, and stream memory cases.",
    problem: "Memory growing",
    type: "All"
  },
  {
    title: "I want Node internals",
    body: "Jump into nextTick, I/O, timers, thread pool, streams, and runtime behavior.",
    problem: "Node internals",
    type: "Node"
  }
] as const;

const recommendedIds = [
  "promise-before-timeout",
  "missing-await",
  "interval-leak",
  "node-queue-priority",
  "threadpool-saturation",
  "stream-backpressure-pipe"
];

function normalize(value: string) {
  return value.toLowerCase().replace(/[-_]+/g, " ");
}

function matchesProblem(item: DiscoveryItem, filter: string) {
  const text = normalize(`${item.title} ${item.category} ${item.body} ${item.realWorld}`);
  if (filter === "All") return true;
  if (filter === "Confusing output") return /(output|print|promise|timer|await|microtask|nexttick|race|any|allsettled)/.test(text);
  if (filter === "Slow API") return /(slow|api|performance|blocking|sequential|thread|worker|pool|json|latency|zlib|dns)/.test(text);
  if (filter === "Memory growing") return /(memory|leak|cache|listener|interval|stream|buffer|gc|heap|retain)/.test(text);
  if (filter === "Node internals") return item.type === "Node";
  return text.includes(normalize(filter));
}

export function DiscoveryHub() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [problem, setProblem] = useState("All");
  const [category, setCategory] = useState("All");
  const { completed } = useLearningProgress();
  const completedKeys = new Set(completed.map((record) => `${record.type}:${record.id}`));

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return items.filter((item) => {
      const typeMatch = type === "All" || item.type === type;
      const problemMatch = matchesProblem(item, problem);
      const categoryMatch = category === "All" || item.category === category;
      const searchable = normalize(`${item.title} ${item.category} ${item.level} ${item.body} ${item.realWorld}`);
      const queryMatch = !q || searchable.includes(q);
      return typeMatch && problemMatch && categoryMatch && queryMatch;
    });
  }, [category, problem, query, type]);

  const fallback = useMemo(() => items.filter((item) => recommendedIds.includes(item.id)), []);
  const displayItems = filtered.length ? filtered : fallback;
  const symptomResults = useMemo(() => findSymptomMatches(query || problem), [problem, query]);

  function clearFilters() {
    setQuery("");
    setType("All");
    setProblem("All");
    setCategory("All");
  }

  function applyIntent(route: (typeof intentRoutes)[number]) {
    setQuery("");
    setType(route.type);
    setProblem(route.problem);
    setCategory("All");
  }

  return (
    <div className="space-y-4">
      <SavedCasesShelf />

      <div className="grid gap-3 lg:grid-cols-4">
        {intentRoutes.map((route) => (
          <button key={route.title} onClick={() => applyIntent(route)} className="rounded-xl border border-black/10 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-cyan-400">
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-800">
              {route.type === "Node" ? <Server className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              {route.title}
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{route.body}</p>
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-3 xl:grid-cols-[1fr_auto_auto_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                placeholder="Search timers, streams, memory leaks, testing, worker pool..."
                className="h-10 w-full rounded-md border bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </label>
            <select value={type} onChange={(event) => setType(event.currentTarget.value)} className="h-10 rounded-md border bg-white px-3 text-sm font-semibold">
              {["All", "Guided", "Editable", "Node"].map((option) => <option key={option}>{option}</option>)}
            </select>
            <select value={problem} onChange={(event) => setProblem(event.currentTarget.value)} className="h-10 rounded-md border bg-white px-3 text-sm font-semibold">
              {problemFilters.map((option) => <option key={option}>{option}</option>)}
            </select>
            <select value={category} onChange={(event) => setCategory(event.currentTarget.value)} className="h-10 rounded-md border bg-white px-3 text-sm font-semibold">
              {["All", ...categories.map((item) => item.label), ...nodeScenarioCategories].map((option) => <option key={option}>{option}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {problemFilters.map((option) => (
              <button
                key={option}
                onClick={() => setProblem(option)}
                className={`rounded-full border px-3 py-1 font-semibold ${problem === option ? "border-cyan-500 bg-cyan-100 text-cyan-950" : "bg-white text-muted-foreground hover:border-cyan-400 hover:text-cyan-800"}`}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-3">
            <div className="text-sm font-semibold text-cyan-950">Search by symptom</div>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {symptomResults.map((symptom) => (
                <Link
                  key={symptom.id}
                  href={symptom.href}
                  className="min-w-[230px] rounded-lg border border-cyan-200 bg-white px-3 py-2 text-sm shadow-sm transition-all hover:-translate-y-0.5 hover:border-cyan-500"
                >
                  <div className="font-semibold text-cyan-950">{symptom.label}</div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{symptom.reason}</p>
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {filtered.length ? `${filtered.length} matching cases` : "No exact match. Showing strong starting points instead."}
        </div>
        <Button variant="outline" size="sm" onClick={clearFilters}>
          <RotateCcw className="h-4 w-4" />
          Reset filters
        </Button>
      </div>

      {!filtered.length ? (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 text-amber-950">
            <div>
              <div className="flex items-center gap-2 font-semibold"><Compass className="h-4 w-4" /> Nothing matched those filters</div>
              <p className="mt-1 text-sm leading-6">Try fewer filters, search a symptom like timer, await, stream, or open one of the recommended cases below.</p>
            </div>
            <Button size="sm" onClick={clearFilters}>Show everything</Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {displayItems.map((item) => {
          const key = `${item.type === "Node" ? "node" : item.type === "Editable" ? "editable" : "demo"}:${item.id}`;
          const done = completedKeys.has(key);
          return (
            <Link href={item.href} key={`${item.type}-${item.id}`}>
              <Card className="h-full transition-all hover:-translate-y-1 hover:border-primary hover:bg-white">
                <CardContent className="flex h-full flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-cyan-700">{item.type} - {item.category}</div>
                      <h2 className="mt-1 text-lg font-semibold">{item.title}</h2>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {done ? <span className="rounded-full bg-cyan-100 px-2 py-1 text-xs font-semibold text-cyan-950">Done</span> : null}
                      <SaveCaseButton
                        compact
                        id={item.id}
                        type={item.type === "Node" ? "node" : item.type === "Editable" ? "editable" : "demo"}
                        title={item.title}
                        href={item.href}
                        category={item.category}
                      />
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{item.body}</p>
                  <div className="mt-auto rounded-md bg-slate-50 px-3 py-2 text-sm">
                    <span className="font-semibold">Real use:</span> {item.realWorld}
                  </div>
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-800">
                    Open case
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
