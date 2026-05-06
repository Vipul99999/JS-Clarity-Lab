"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, ClipboardCheck, Code2, Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlaybook } from "@/realWorld/playbooks";

export function ProductionPlaybook({ demoId }: { demoId: string }) {
  const playbook = getPlaybook(demoId);
  const [active, setActive] = useState(0);
  if (!playbook) return null;
  const context = playbook.contexts[Math.min(active, playbook.contexts.length - 1)];

  return (
    <Card className="border-teal-200">
      <CardHeader className="border-b">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Stethoscope className="h-4 w-4 text-teal-700" />
            Production playbook
          </CardTitle>
          <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-800">Risk: {playbook.severity}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4 text-sm leading-6">
        <div className="rounded-md bg-teal-50 px-3 py-2 text-teal-950">
          <span className="font-semibold">Why this wins in real work: </span>
          {playbook.impact}
        </div>
        <div className="flex flex-wrap gap-2">
          {playbook.contexts.map((item, index) => (
            <button
              key={item.name}
              onClick={() => setActive(index)}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium ${index === active ? "border-primary bg-teal-50 text-teal-900" : "bg-white text-muted-foreground"}`}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="rounded-md border bg-white p-3">
            <div className="mb-1 flex items-center gap-2 font-semibold">
              <ClipboardCheck className="h-4 w-4 text-teal-700" />
              Scenario
            </div>
            <p>{context.scenario}</p>
          </div>
          <div className="rounded-md border bg-white p-3">
            <div className="mb-1 flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Symptom
            </div>
            <p>{context.symptom}</p>
          </div>
          <div className="rounded-md border bg-white p-3">
            <div className="mb-1 flex items-center gap-2 font-semibold">
              <CheckCircle2 className="h-4 w-4 text-teal-700" />
              Fix direction
            </div>
            <p>{context.fix}</p>
          </div>
        </div>
        <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-md bg-secondary p-3">
            <div className="mb-2 font-semibold">Debug checklist</div>
            <ul className="space-y-1">
              {playbook.checklist.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-md bg-slate-950 p-3 text-white">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <Code2 className="h-4 w-4" />
              Safer pattern
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-5 text-slate-100">{playbook.saferPattern}</pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
