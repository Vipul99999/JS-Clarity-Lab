"use client";

import { ArrowRightLeft, CheckCircle2 } from "lucide-react";
import { compareScenarioModes } from "@/nodePlayground/compare";
import type { NodeScenario } from "@/nodePlayground/types";

export function ScenarioComparisonPanel({ scenario }: { scenario: NodeScenario }) {
  const comparison = compareScenarioModes(scenario);

  return (
    <section className="rounded-xl border border-cyan-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-semibold">
          <ArrowRightLeft className="h-4 w-4 text-cyan-700" />
          Problem vs fixed
        </h3>
        <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-950">
          {comparison.hasFixedVersion ? "comparable" : "concept only"}
        </span>
      </div>
      <div className="grid gap-2 md:grid-cols-4">
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs font-semibold uppercase text-slate-500">Output</div>
          <div className="mt-1 text-sm font-semibold">{comparison.output.changed ? "changes" : "same"}</div>
          <div className="mt-1 text-xs text-muted-foreground">{comparison.output.problem.join(" -> ") || "none"} / {comparison.output.fixed.join(" -> ") || "none"}</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs font-semibold uppercase text-slate-500">Blocked time</div>
          <div className="mt-1 text-sm font-semibold">{comparison.blocked.problem}ms {"->"} {comparison.blocked.fixed}ms</div>
          <div className="mt-1 text-xs text-muted-foreground">{comparison.blocked.saved}ms saved</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs font-semibold uppercase text-slate-500">Retained memory</div>
          <div className="mt-1 text-sm font-semibold">{comparison.memory.problemRetained} {"->"} {comparison.memory.fixedRetained}</div>
          <div className="mt-1 text-xs text-muted-foreground">{comparison.memory.improved ? "improved" : "no change"}</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs font-semibold uppercase text-slate-500">Worker pressure</div>
          <div className="mt-1 text-sm font-semibold">{comparison.threadPool.problemPressure} {"->"} {comparison.threadPool.fixedPressure}</div>
          <div className="mt-1 text-xs text-muted-foreground">{comparison.threadPool.improved ? "improved" : "no change"}</div>
        </div>
      </div>
      <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-950">
        <div className="flex items-center gap-2 font-semibold">
          <CheckCircle2 className="h-4 w-4" />
          Why fixed is safer
        </div>
        <p className="mt-1 leading-6">{comparison.saferSummary}</p>
      </div>
    </section>
  );
}
