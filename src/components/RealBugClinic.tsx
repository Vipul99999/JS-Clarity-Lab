"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Search, ShieldAlert, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { findIncidents, incidents } from "@/realWorld/incidents";
import { ConceptBreakdownCard } from "@/components/ConceptBreakdownCard";
import { getConceptsForIncident } from "@/realWorld/concepts";

export function RealBugClinic() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(incidents[0].id);
  const matches = useMemo(() => findIncidents(query), [query]);
  const active = matches.find((incident) => incident.id === activeId) ?? matches[0] ?? incidents[0];
  const concepts = getConceptsForIncident(active.id);

  return (
    <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
      <Card className="border-black/10 bg-white/95">
        <CardContent className="space-y-4 p-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-800">
              <Stethoscope className="h-4 w-4" />
              Real Bug Clinic
            </div>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Start from the symptom you actually have, then open the case that teaches the fix.
            </p>
          </div>
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.currentTarget.value);
                setActiveId("");
              }}
              placeholder="Search slow API, memory, stream, flaky test..."
              className="h-10 w-full rounded-md border bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </label>
          <div className="space-y-2">
            {(matches.length ? matches : incidents).map((incident) => (
              <button
                key={incident.id}
                onClick={() => setActiveId(incident.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left transition-all ${incident.id === active.id ? "border-cyan-400 bg-cyan-50 text-cyan-950" : "bg-white hover:border-cyan-300"}`}
              >
                <div className="text-sm font-semibold">{incident.symptom}</div>
                <div className="mt-1 text-xs text-muted-foreground">{incident.audience} - Risk {incident.severity}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-cyan-100 bg-white">
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-cyan-700">{active.audience} - Risk {active.severity}</div>
              <h2 className="mt-1 text-2xl font-semibold">{active.symptom}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{active.whyItMatters}</p>
            </div>
            <Button asChild>
              <Link href={active.primaryCase.href}>
                Open case
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-950">
            <span className="font-semibold">Likely cause: </span>
            {active.likelyCause}
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <section className="rounded-lg border bg-white p-3">
              <div className="mb-2 flex items-center gap-2 font-semibold"><ShieldAlert className="h-4 w-4 text-amber-600" /> Diagnose</div>
              <ul className="space-y-1 text-sm leading-6 text-muted-foreground">
                {active.diagnose.map((item) => <li key={item}>- {item}</li>)}
              </ul>
            </section>
            <section className="rounded-lg border bg-white p-3">
              <div className="mb-2 flex items-center gap-2 font-semibold"><Stethoscope className="h-4 w-4 text-cyan-700" /> Fix direction</div>
              <ul className="space-y-1 text-sm leading-6 text-muted-foreground">
                {active.fix.map((item) => <li key={item}>- {item}</li>)}
              </ul>
            </section>
            <section className="rounded-lg border bg-white p-3">
              <div className="mb-2 flex items-center gap-2 font-semibold"><CheckCircle2 className="h-4 w-4 text-cyan-700" /> Verify</div>
              <ul className="space-y-1 text-sm leading-6 text-muted-foreground">
                {active.verify.map((item) => <li key={item}>- {item}</li>)}
              </ul>
            </section>
          </div>

          <div>
            <div className="mb-2 text-sm font-semibold">Related learning cases</div>
            <div className="flex flex-wrap gap-2">
              <Link href={active.primaryCase.href} className="inline-flex h-9 items-center gap-2 rounded-md bg-cyan-700 px-3 text-sm font-semibold text-white hover:bg-cyan-800">
                {active.primaryCase.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
              {active.related.map((item) => (
                <Link key={item.href} href={item.href} className="inline-flex h-9 items-center gap-2 rounded-md border bg-white px-3 text-sm font-semibold hover:border-cyan-400">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {concepts.length ? (
            <div>
              <div className="mb-2 text-sm font-semibold">Concepts behind this bug</div>
              <div className="grid gap-3 xl:grid-cols-2">
                {concepts.map((concept) => <ConceptBreakdownCard key={concept.id} concept={concept} />)}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
