"use client";

import Link from "next/link";
import { ArrowRight, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult } from "@/analyzer/patternTypes";
import { getAnalyzerInsights } from "@/analyzer/insights";

const tone = {
  Info: "bg-slate-50 text-slate-900 border-slate-200",
  Watch: "bg-amber-50 text-amber-950 border-amber-200",
  Risk: "bg-rose-50 text-rose-950 border-rose-200"
};

export function AnalyzerInsights({ result }: { result: AnalysisResult | null }) {
  const insights = getAnalyzerInsights(result);
  if (!insights.length) return null;

  return (
    <Card className="border-cyan-100">
      <CardHeader className="border-b pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-4 w-4 text-cyan-700" />
          Engine insights
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 p-4 md:grid-cols-2">
        {insights.map((insight) => (
          <div key={insight.title} className={`rounded-lg border p-3 ${tone[insight.severity]}`}>
            <div className="text-xs font-semibold uppercase tracking-wide">{insight.severity}</div>
            <div className="mt-1 font-semibold">{insight.title}</div>
            <p className="mt-1 text-sm leading-6 opacity-80">{insight.detail}</p>
            <Link href={insight.href} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold">
              {insight.action}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
