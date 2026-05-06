"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Explanation } from "@/engine/types";

export function ExplanationPanel({ explanation, activeExplain }: { explanation: Explanation; activeExplain?: string }) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Explanation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4 text-sm leading-6">
        {activeExplain ? (
          <div className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-teal-900">{activeExplain}</div>
        ) : null}
        <p className="font-medium">{explanation.summary}</p>
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">What happens</h4>
          <ol className="space-y-1">
            {explanation.steps.map((step, index) => (
              <li key={step}>
                {index + 1}. {step}
              </li>
            ))}
          </ol>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md bg-secondary px-3 py-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide">Common mistake</h4>
            <p>{explanation.mistake}</p>
          </div>
          <div className="rounded-md bg-accent px-3 py-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide">Where you will face this</h4>
            <p>{explanation.realWorld}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
