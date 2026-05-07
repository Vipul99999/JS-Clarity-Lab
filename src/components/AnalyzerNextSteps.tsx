"use client";

import Link from "next/link";
import { ArrowRight, Play, SearchCode, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult } from "@/analyzer/patternTypes";
import { getRecommendedDemo } from "@/analyzer/debugReport";

export function AnalyzerNextSteps({
  result,
  canVisualize,
  onVisualize
}: {
  result: AnalysisResult | null;
  canVisualize: boolean;
  onVisualize: () => void;
}) {
  if (!result) {
    return (
      <Card className="border-cyan-100 bg-cyan-50">
        <CardContent className="p-4 text-sm leading-6 text-cyan-950">
          Paste or edit code, click Analyze Code, then use the result to visualize supported async behavior or open a matching guided case.
        </CardContent>
      </Card>
    );
  }

  const recommended = getRecommendedDemo(result);
  const hasNodeSignals = result.ok && result.patterns.some((pattern) => ["setInterval", "promise_all", "promise_allSettled", "promise_race", "promise_any", "queueMicrotask", "process_nextTick", "setImmediate"].includes(pattern.type));

  return (
    <Card className="border-cyan-100">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-base">What should I do next?</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 p-4 md:grid-cols-3">
        <div className="rounded-lg bg-cyan-50 p-3 text-sm leading-6 text-cyan-950">
          <div className="mb-2 flex items-center gap-2 font-semibold"><SearchCode className="h-4 w-4" /> Trust the scope</div>
          {result.ok
            ? `Confidence is ${result.confidence}. Use the warnings to know where this model may differ from real runtime behavior.`
            : "Parsing failed, so fix syntax first before trusting any visualization."}
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="mb-2 text-sm font-semibold">Run the visual model</div>
          <Button size="sm" onClick={onVisualize} disabled={!canVisualize}>
            <Play className="h-4 w-4" />
            Visualize detected flow
          </Button>
        </div>
        <div className="rounded-lg bg-white p-3 ring-1 ring-black/10">
          <div className="mb-2 text-sm font-semibold">Open a matching case</div>
          {recommended ? (
            <Button asChild size="sm" variant="outline">
              <Link href={`/demo/${recommended.id}`}>
                {recommended.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : hasNodeSignals ? (
            <Button asChild size="sm" variant="outline">
              <Link href="/node-playground">
                Node Runtime Lab
                <Server className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link href="/discover">
                Find related case
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
