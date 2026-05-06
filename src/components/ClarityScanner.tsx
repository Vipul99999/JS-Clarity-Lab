"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, Bug, Clock3, Lightbulb, RotateCcw } from "lucide-react";
import { analyzeSnippet, scannerExamples } from "@/clarity/patterns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ClarityScanner() {
  const [code, setCode] = useState(scannerExamples[0].code);
  const matches = useMemo(() => analyzeSnippet(code), [code]);

  return (
    <section className="border-b border-black/10 bg-[#eef5ea]/80">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-8 md:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-teal-700">
              <Clock3 className="h-4 w-4" />
              Instant clarity scanner
            </div>
            <h2 className="text-2xl font-semibold tracking-normal">Paste a confusing snippet. Get the likely trap in seconds.</h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              This is intentionally narrow: async surprises, hidden bugs, unexpected output, memory retention, and performance traps.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {scannerExamples.map((example) => (
              <Button key={example.label} variant="outline" size="sm" onClick={() => setCode(example.code)}>
                {example.label}
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setCode("")}>
              <RotateCcw className="h-4 w-4" />
              Clear
            </Button>
          </div>
          <textarea
            value={code}
            onChange={(event) => setCode(event.target.value)}
            spellCheck={false}
            className="code-textarea min-h-[230px] w-full resize-y rounded-lg border border-white/10 p-4 font-mono text-sm leading-6 text-white outline-none ring-offset-2 focus:ring-2 focus:ring-ring"
            placeholder="Paste a small confusing JavaScript snippet..."
          />
        </div>
        <div className="space-y-3">
          {matches.length > 0 ? (
            matches.map((match) => (
              <Card key={match.id} className="border-teal-200/80 bg-white">
                <CardHeader className="border-b pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base">{match.title}</CardTitle>
                    <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-800">{match.confidence}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 p-4 text-sm leading-6">
                  <div>
                    <div className="mb-1 flex items-center gap-2 font-semibold">
                      <BadgeCheck className="h-4 w-4 text-teal-700" />
                      Fast answer
                    </div>
                    <p>{match.answer}</p>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2 font-semibold">
                      <Lightbulb className="h-4 w-4 text-amber-600" />
                      Why
                    </div>
                    <p>{match.why}</p>
                  </div>
                  <div className="rounded-md bg-amber-100 px-3 py-2 text-amber-950">
                    <div className="mb-1 flex items-center gap-2 font-semibold">
                      <Bug className="h-4 w-4" />
                      Hidden bug
                    </div>
                    <p>{match.hiddenBug}</p>
                  </div>
                  <div className="rounded-md bg-violet-100 px-3 py-2 text-violet-950">
                    <div className="font-semibold">Where you will face this</div>
                    <p>{match.realWorld}</p>
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/demo/${match.demoId}`}>
                      Open interactive demo
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-5 text-sm leading-6 text-muted-foreground">
                No focused confusion pattern detected yet. Try a small snippet with promises, timers, async/await, listeners, intervals, or heavy loops.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
