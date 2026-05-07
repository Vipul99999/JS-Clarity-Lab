"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, TriangleAlert } from "lucide-react";
import type { AnalysisResult } from "@/analyzer/patternTypes";
import { buildAnalyzerActionPlan } from "@/analyzer/actionPlan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrustBadge } from "@/components/TrustBadge";

export function AnalyzerActionPlan({ result }: { result: AnalysisResult | null }) {
  const plan = buildAnalyzerActionPlan(result);
  if (!plan) return null;

  return (
    <Card className="border-cyan-100">
      <CardHeader className="border-b pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-cyan-700" />
            Practical answer
          </CardTitle>
          <TrustBadge level={plan.trustLevel} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 p-4 lg:grid-cols-5">
        <div className="rounded-lg bg-slate-50 p-3 lg:col-span-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Likely output</div>
          <div className="mt-2 font-mono text-sm font-semibold text-slate-950">
            {plan.likelyOutput.length ? plan.likelyOutput.join(" -> ") : "No supported console output detected"}
          </div>
        </div>
        <div className="rounded-lg bg-rose-50 p-3 text-rose-950">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
            <TriangleAlert className="h-3.5 w-3.5" />
            Risk found
          </div>
          <p className="mt-2 text-sm leading-6">{plan.riskFound}</p>
        </div>
        <div className="rounded-lg bg-cyan-50 p-3 text-cyan-950">
          <div className="text-xs font-semibold uppercase tracking-wide">Why this happens</div>
          <p className="mt-2 text-sm leading-6">{plan.whyThisHappens}</p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-3 text-emerald-950">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Fix suggestion
          </div>
          <p className="mt-2 text-sm leading-6">{plan.fixSuggestion}</p>
          {plan.nodeBridge ? (
            <p className="mt-2 rounded-md bg-white px-2 py-1 text-xs font-semibold text-cyan-900">
              Node bridge: {plan.nodeBridge.reason}
            </p>
          ) : null}
          {plan.matchingDemo ? (
            <Button asChild size="sm" variant="outline" className="mt-3 bg-white">
              <Link href={plan.matchingDemo.href}>
                {plan.matchingDemo.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
