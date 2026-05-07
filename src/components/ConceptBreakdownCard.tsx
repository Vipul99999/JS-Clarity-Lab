import Link from "next/link";
import { ArrowRight, Brain, Bug, ListChecks, SearchCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ConceptBreakdown } from "@/realWorld/concepts";

export function ConceptBreakdownCard({ concept }: { concept: ConceptBreakdown }) {
  return (
    <Card className="h-full border-cyan-100 bg-white">
      <CardContent className="space-y-4 p-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-cyan-800">
            <Brain className="h-4 w-4" />
            Concept breakdown
          </div>
          <h2 className="mt-1 text-xl font-semibold">{concept.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{concept.short}</p>
        </div>
        <div className="rounded-lg bg-cyan-50 px-3 py-2 text-sm leading-6 text-cyan-950">
          <span className="font-semibold">Mental model: </span>
          {concept.mentalModel}
        </div>
        <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-950">
          <span className="font-semibold">Common wrong assumption: </span>
          {concept.commonMistake}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <section>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Bug className="h-4 w-4 text-amber-600" />
              Real-world signals
            </div>
            <ul className="space-y-1 text-sm leading-6 text-muted-foreground">
              {concept.realWorldSignals.map((item) => <li key={item}>- {item}</li>)}
            </ul>
          </section>
          <section>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <SearchCheck className="h-4 w-4 text-cyan-700" />
              Debug questions
            </div>
            <ul className="space-y-1 text-sm leading-6 text-muted-foreground">
              {concept.debugQuestions.map((item) => <li key={item}>- {item}</li>)}
            </ul>
          </section>
        </div>
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <ListChecks className="h-4 w-4 text-cyan-700" />
            Learn this with
          </div>
          <div className="flex flex-wrap gap-2">
            {concept.primaryCases.map((item) => (
              <Link key={item.href} href={item.href} className="inline-flex h-9 items-center gap-2 rounded-md border bg-white px-3 text-sm font-semibold hover:border-cyan-400">
                {item.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
