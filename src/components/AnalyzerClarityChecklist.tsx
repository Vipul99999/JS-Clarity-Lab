"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, ClipboardCheck } from "lucide-react";
import type { AnalysisResult } from "@/analyzer/patternTypes";
import { buildAnalyzerActionPlan } from "@/analyzer/actionPlan";
import { getClarityScore } from "@/product/clarity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AnalyzerClarityChecklist({ result }: { result: AnalysisResult | null }) {
  const plan = buildAnalyzerActionPlan(result);
  if (!plan) return null;

  const checks = [
    { label: "Likely output identified", done: plan.likelyOutput.length > 0 || plan.trustLevel !== "unsupported" },
    { label: "Risk or limitation named", done: Boolean(plan.riskFound) },
    { label: "Fix direction available", done: Boolean(plan.fixSuggestion) },
    { label: "Next case available", done: Boolean(plan.matchingDemo) }
  ];
  const score = getClarityScore({
    hasAnswer: checks[0].done,
    hasRisk: checks[1].done,
    hasFix: checks[2].done,
    hasNext: checks[3].done
  });

  return (
    <Card className="border-cyan-100 bg-white">
      <CardHeader className="border-b pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardCheck className="h-4 w-4 text-cyan-700" />
          Clarity checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="grid gap-2 sm:grid-cols-2">
          {checks.map((check) => (
            <div key={check.label} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
              {check.done ? <CheckCircle2 className="h-4 w-4 text-emerald-700" /> : <Circle className="h-4 w-4 text-slate-400" />}
              <span className="font-medium">{check.label}</span>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-cyan-50 p-3 text-sm text-cyan-950">
          <div className="font-semibold">Clarity score: {score}/4</div>
          <p className="mt-1 leading-6">If any item is missing, use warnings and the matching case before trusting the conclusion.</p>
          {plan.matchingDemo ? (
            <Link href={plan.matchingDemo.href} className="mt-2 inline-flex items-center gap-2 font-semibold">
              Open next case
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
