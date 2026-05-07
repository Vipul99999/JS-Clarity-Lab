"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ConceptBreakdownCard } from "@/components/ConceptBreakdownCard";
import { conceptBreakdowns } from "@/realWorld/concepts";

export function ConceptAtlas() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/[-_]+/g, " ");
    if (!q) return conceptBreakdowns;
    return conceptBreakdowns.filter((concept) =>
      [
        concept.title,
        concept.short,
        concept.mentalModel,
        concept.commonMistake,
        ...concept.realWorldSignals,
        ...concept.debugQuestions
      ].join(" ").toLowerCase().replace(/[-_]+/g, " ").includes(q)
    );
  }, [query]);

  return (
    <div className="space-y-4">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Search concepts: await, memory, streams, worker pool, Promise.all..."
          className="h-10 w-full rounded-md border bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </label>
      <div className="text-sm text-muted-foreground">{filtered.length} concept breakdowns</div>
      <div className="grid gap-4 xl:grid-cols-2">
        {filtered.map((concept) => <ConceptBreakdownCard key={concept.id} concept={concept} />)}
      </div>
    </div>
  );
}
