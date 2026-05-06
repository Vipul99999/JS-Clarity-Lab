"use client";

import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult } from "@/analyzer/patternTypes";

const defaultLimitations = [
  "Code is parsed and simulated, not executed.",
  "Loops, recursion, DOM, external APIs, closures, memory behavior, and Promise combinators are not fully simulated.",
  "The visualization is a teaching model for supported async patterns, not a browser or Node debugger."
];

export function LimitationsPanel({ result }: { result: AnalysisResult | null }) {
  const warnings = result?.warnings ?? [];
  return (
    <Card className="border-amber-200">
      <CardHeader className="border-b pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          Limitations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 text-sm leading-6">
        <ul className="space-y-1 text-muted-foreground">
          {defaultLimitations.map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
        {warnings.length > 0 ? (
          <div className="space-y-2">
            {warnings.map((warning, index) => (
              <div key={`${warning.title}-${index}`} className="rounded-md bg-amber-50 px-3 py-2 text-amber-950">
                <div className="font-semibold">{warning.title}{warning.line ? ` on line ${warning.line}` : ""}</div>
                <div>{warning.detail}</div>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
