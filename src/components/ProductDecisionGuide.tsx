"use client";

import Link from "next/link";
import { ArrowRight, HelpCircle } from "lucide-react";
import { clarityQuestions } from "@/product/clarity";
import { Card, CardContent } from "@/components/ui/card";

export function ProductDecisionGuide() {
  return (
    <Card className="border-cyan-100 bg-white/95">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-2 font-semibold text-cyan-900">
          <HelpCircle className="h-4 w-4" />
          Not sure where to start?
        </div>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {clarityQuestions.map((item) => (
            <div key={item.question} className="rounded-lg bg-slate-50 px-3 py-2 text-sm leading-6">
              <div className="font-semibold">{item.question}</div>
              <p className="mt-1 text-muted-foreground">{item.answer}</p>
            </div>
          ))}
        </div>
        <Link href="/discover" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-cyan-800">
          Search by symptom
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
