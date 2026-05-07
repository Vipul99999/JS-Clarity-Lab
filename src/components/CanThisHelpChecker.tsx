"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, LifeBuoy, Search } from "lucide-react";
import { canProductHelp } from "@/product/coverage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const examples = ["await did not wait", "my API is slow", "stream hangs", "memory keeps growing", "Promise.all failed everything", "fs is slow during crypto"];

export function CanThisHelpChecker() {
  const [query, setQuery] = useState("await did not wait");
  const answer = useMemo(() => canProductHelp(query), [query]);

  return (
    <Card className="border-cyan-100 bg-white">
      <CardHeader className="border-b pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <LifeBuoy className="h-4 w-4 text-cyan-700" />
          Can JS Clarity Lab help?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Type your symptom, e.g. await did not wait"
            className="h-11 w-full rounded-md border bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {examples.map((example) => (
            <button key={example} onClick={() => setQuery(example)} className="shrink-0 rounded-full border bg-white px-3 py-1 text-xs font-semibold text-muted-foreground hover:border-cyan-500 hover:text-cyan-900">
              {example}
            </button>
          ))}
        </div>
        <div className="grid gap-3 rounded-xl bg-cyan-50 p-4 text-cyan-950 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="text-sm font-semibold">{answer.answer}</div>
            <h3 className="mt-1 text-lg font-semibold">{answer.label}</h3>
            <p className="mt-1 text-sm leading-6">{answer.reason}</p>
            <p className="mt-2 rounded-md bg-white/70 px-2 py-1 text-xs font-semibold">Limit: {answer.limitation}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold">{answer.status}</span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold">{answer.bestTool}</span>
            <Button asChild size="sm">
              <Link href={answer.href}>
                Open
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
