"use client";

import { ClipboardCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { copyTextSafely } from "@/security/clipboard";
import { getPlaybooksForScenario } from "@/nodePlayground/playbooks";
import { summarizeNodeTrace } from "@/nodePlayground/trace";
import type { NodeEvent, NodeScenario } from "@/nodePlayground/types";
import { useDebugNotes } from "@/lib/debugNotes";

export function ProductionPlaybookPanel({ scenario, events }: { scenario: NodeScenario; events: NodeEvent[] }) {
  const [copied, setCopied] = useState(false);
  const { saveNote } = useDebugNotes();
  const summary = summarizeNodeTrace(events, scenario);
  const playbooks = getPlaybooksForScenario(scenario, summary.findings.map((finding) => finding.area));
  const notes = useMemo(() => {
    return [
      `JS Clarity Lab production notes: ${scenario.title}`,
      "",
      `Symptom: ${scenario.realWorld}`,
      `Likely cause: ${summary.findings[0]?.title ?? scenario.explanation.mistake}`,
      `Visual proof: ${summary.findings[0]?.detail ?? scenario.explanation.summary}`,
      "",
      ...playbooks.slice(0, 3).flatMap((playbook) => [
        `Risk: ${playbook.risk}`,
        `Metric: ${playbook.metric}`,
        `Log: ${playbook.log}`,
        `Profiler: ${playbook.profilerStep}`,
        `Test: ${playbook.testToWrite}`,
        `Fix: ${playbook.fixPattern}`,
        ""
      ])
    ].join("\n");
  }, [playbooks, scenario, summary]);

  async function copyNotes() {
    await copyTextSafely(notes);
    saveNote({
      title: `Node: ${scenario.title}`,
      body: notes,
      source: "node",
      href: `/node-playground?scenario=${scenario.id}&mode=problem`
    });
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <section className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-semibold">
          <ClipboardCheck className="h-4 w-4 text-cyan-700" />
          Production debugging playbook
        </h3>
        <Button size="sm" variant="outline" onClick={copyNotes}>{copied ? "Copied notes" : "Copy fix notes"}</Button>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {playbooks.slice(0, 4).map((playbook) => (
          <div key={playbook.risk} className="rounded-lg border border-black/10 bg-slate-50 p-3 text-sm">
            <div className="font-semibold text-slate-950">{playbook.risk}</div>
            <dl className="mt-2 space-y-1 leading-6">
              <div><dt className="inline font-semibold">Metric:</dt> <dd className="inline">{playbook.metric}</dd></div>
              <div><dt className="inline font-semibold">Log:</dt> <dd className="inline">{playbook.log}</dd></div>
              <div><dt className="inline font-semibold">Profiler:</dt> <dd className="inline">{playbook.profilerStep}</dd></div>
              <div><dt className="inline font-semibold">Test:</dt> <dd className="inline">{playbook.testToWrite}</dd></div>
              <div><dt className="inline font-semibold">Fix:</dt> <dd className="inline">{playbook.fixPattern}</dd></div>
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}
