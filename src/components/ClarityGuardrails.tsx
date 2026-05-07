"use client";

import { CheckCircle2, ShieldAlert, Waypoints } from "lucide-react";
import { productGuardrails } from "@/product/clarity";
import { Card, CardContent } from "@/components/ui/card";

export function ClarityGuardrails() {
  const blocks = [
    { title: "What this helps with", icon: <CheckCircle2 className="h-4 w-4 text-emerald-700" />, items: productGuardrails.canDo, tone: "bg-emerald-50 text-emerald-950" },
    { title: "Clear limits", icon: <ShieldAlert className="h-4 w-4 text-amber-700" />, items: productGuardrails.cannotDo, tone: "bg-amber-50 text-amber-950" },
    { title: "Best way to use it", icon: <Waypoints className="h-4 w-4 text-cyan-700" />, items: productGuardrails.bestUse, tone: "bg-cyan-50 text-cyan-950" }
  ];

  return (
    <Card className="border-black/10">
      <CardContent className="grid gap-3 p-4 lg:grid-cols-3">
        {blocks.map((block) => (
          <section key={block.title} className={`rounded-xl p-3 ${block.tone}`}>
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              {block.icon}
              {block.title}
            </h2>
            <ul className="mt-2 space-y-1 text-sm leading-6">
              {block.items.map((item) => <li key={item}>- {item}</li>)}
            </ul>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}
