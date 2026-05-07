"use client";

import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { summarizeTrace } from "@/engine/trace";
import type { VisualEvent } from "@/engine/types";

export function TraceSummaryPanel({ events }: { events: VisualEvent[] }) {
  const summary = summarizeTrace(events);
  if (!summary.riskFlags.length && summary.steps < 2) return null;

  return (
    <Card className="border-cyan-100">
      <CardHeader className="border-b pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4 text-cyan-700" />
          Trace engine summary
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 p-4 md:grid-cols-[220px_1fr]">
        <div className="grid grid-cols-3 gap-2 md:grid-cols-1">
          <div className="rounded-md bg-slate-50 px-3 py-2 text-sm"><span className="font-semibold">{summary.steps}</span> steps</div>
          <div className="rounded-md bg-slate-50 px-3 py-2 text-sm"><span className="font-semibold">{summary.elapsedTime}ms</span> elapsed</div>
          <div className="rounded-md bg-slate-50 px-3 py-2 text-sm"><span className="font-semibold">{summary.blockedDuration}ms</span> blocked</div>
        </div>
        <div className="space-y-2">
          {summary.riskFlags.length ? summary.riskFlags.map((flag) => (
            <div key={flag} className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-950">{flag}</div>
          )) : <div className="rounded-md bg-cyan-50 px-3 py-2 text-sm text-cyan-950">No major trace risk flags detected.</div>}
        </div>
      </CardContent>
    </Card>
  );
}
