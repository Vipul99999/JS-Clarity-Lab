"use client";

import { Play, SearchCode } from "lucide-react";
import { Button } from "@/components/ui/button";

type CodeInputProps = {
  code: string;
  isAnalyzing: boolean;
  hasAnalysis: boolean;
  onChange: (code: string) => void;
  onAnalyze: () => void;
  onVisualize: () => void;
};

export function CodeInput({ code, isAnalyzing, hasAnalysis, onChange, onAnalyze, onVisualize }: CodeInputProps) {
  return (
    <section className="rounded-lg border border-black/10 bg-white/95 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Paste JavaScript code</h2>
          <p className="text-sm text-muted-foreground">The analyzer parses code and simulates only supported async patterns. It never executes your code.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onAnalyze} disabled={isAnalyzing || code.trim().length === 0}>
            <SearchCode className="h-4 w-4" />
            {isAnalyzing ? "Analyzing..." : "Analyze Code"}
          </Button>
          <Button variant="secondary" onClick={onVisualize} disabled={!hasAnalysis}>
            <Play className="h-4 w-4" />
            Run Visualization
          </Button>
        </div>
      </div>
      <div className="mb-3 grid gap-2 rounded-lg bg-cyan-50 p-3 text-sm text-cyan-950 md:grid-cols-3">
        <div><span className="font-semibold">1. Paste small:</span> use the smallest confusing snippet.</div>
        <div><span className="font-semibold">2. Read Practical answer:</span> likely output, risk, fix.</div>
        <div><span className="font-semibold">3. Visualize:</span> step only the supported runtime model.</div>
      </div>
      <textarea
        aria-label="JavaScript code to analyze"
        value={code}
        onChange={(event) => onChange(event.currentTarget.value)}
        spellCheck={false}
        className="code-textarea min-h-[280px] w-full resize-y rounded-lg border border-white/10 p-4 font-mono text-sm leading-6 text-white outline-none focus:ring-2 focus:ring-ring"
      />
    </section>
  );
}
