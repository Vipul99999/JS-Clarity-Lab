"use client";

import { ShieldCheck } from "lucide-react";
import type { TrustLevel } from "@/analyzer/actionPlan";

export type ProductTrustLevel = TrustLevel | "curated scenario" | "does not execute real code";

const tone: Record<ProductTrustLevel, string> = {
  "fully simulated": "border-emerald-200 bg-emerald-50 text-emerald-950",
  "partially simulated": "border-cyan-200 bg-cyan-50 text-cyan-950",
  "pattern detected only": "border-amber-200 bg-amber-50 text-amber-950",
  unsupported: "border-rose-200 bg-rose-50 text-rose-950",
  "curated scenario": "border-violet-200 bg-violet-50 text-violet-950",
  "does not execute real code": "border-slate-200 bg-slate-50 text-slate-800"
};

export function TrustBadge({ level }: { level: ProductTrustLevel }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${tone[level]}`}>
      <ShieldCheck className="h-3.5 w-3.5" />
      {level}
    </span>
  );
}
