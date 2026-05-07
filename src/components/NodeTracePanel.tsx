"use client";

import { Activity, Cpu, Database, Gauge, Layers, MemoryStick, Network, ShieldCheck } from "lucide-react";
import type { NodeEvent, NodeScenario } from "@/nodePlayground/types";
import { summarizeNodeTrace } from "@/nodePlayground/trace";

const findingTone = {
  good: "border-emerald-200 bg-emerald-50 text-emerald-950",
  watch: "border-amber-200 bg-amber-50 text-amber-950",
  risk: "border-rose-200 bg-rose-50 text-rose-950"
};

export function NodeTracePanel({
  events,
  scenario,
  step
}: {
  events: NodeEvent[];
  scenario: NodeScenario;
  step: number;
}) {
  const summary = summarizeNodeTrace(events.slice(0, step), scenario);
  const stats = [
    { label: "Queue priority", value: summary.queuePriority.notes.length ? summary.queuePriority.notes[0] : "No queue conflict yet", icon: <Activity className="h-4 w-4" /> },
    { label: "Thread pool", value: `${summary.threadPool.pressure} pressure`, icon: <Cpu className="h-4 w-4" /> },
    { label: "Streams", value: summary.streams.status, icon: <Layers className="h-4 w-4" /> },
    { label: "Blocking", value: `${summary.blockedDuration}ms`, icon: <Gauge className="h-4 w-4" /> },
    { label: "Memory", value: summary.memory.status, icon: <MemoryStick className="h-4 w-4" /> },
    { label: "HTTP", value: summary.httpLifecycle.status, icon: summary.httpLifecycle.detected ? <Network className="h-4 w-4" /> : <Database className="h-4 w-4" /> }
  ];

  return (
    <section className="mb-4 rounded-xl border border-cyan-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-4 w-4 text-cyan-700" />
            Node trace diagnosis
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">A runtime-specific summary for queues, worker pool, streams, memory, blocking, and request lifecycle.</p>
        </div>
        <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-950">{summary.confidence}</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-black/10 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {stat.icon}
              {stat.label}
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-950">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-2 lg:grid-cols-2">
        {summary.findings.length ? summary.findings.slice(0, 4).map((finding) => (
          <div key={`${finding.area}-${finding.title}`} className={`rounded-lg border p-3 ${findingTone[finding.severity]}`}>
            <div className="text-xs font-semibold uppercase tracking-wide">{finding.area}</div>
            <div className="mt-1 font-semibold">{finding.title}</div>
            <p className="mt-1 text-sm leading-6 opacity-85">{finding.detail}</p>
            <p className="mt-2 text-sm font-medium">{finding.fixHint}</p>
          </div>
        )) : (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950 lg:col-span-2">
            No runtime risk has appeared yet. Step forward to build the trace.
          </div>
        )}
      </div>
    </section>
  );
}
