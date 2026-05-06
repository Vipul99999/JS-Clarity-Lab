"use client";

import { useEffect, useMemo, useState } from "react";
import { analyzeCode } from "@/analyzer/analyzeCode";
import { buildSimulation } from "@/analyzer/buildSimulation";
import type { AnalysisResult } from "@/analyzer/patternTypes";
import { AnalysisSummary } from "./AnalysisSummary";
import { CodeInput } from "./CodeInput";
import { CuratedExamples } from "./CuratedExamples";
import { DebugReport } from "./DebugReport";
import { LimitationsPanel } from "./LimitationsPanel";
import { PatternHighlight } from "./PatternHighlight";
import { RecentSnippets, type RecentSnippet } from "./RecentSnippets";
import { Visualizer } from "./Visualizer";

const example = `console.log("A");

setTimeout(() => console.log("B"), 0);

Promise.resolve().then(() => console.log("C"));

console.log("D");`;

const recentKey = "js-clarity-lab:recent-snippets";

export function AnalysisLab() {
  const [code, setCode] = useState(example);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [recent, setRecent] = useState<RecentSnippet[]>([]);

  const simulation = useMemo(() => (result?.ok ? buildSimulation(result) : null), [result]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(recentKey);
      if (stored) setRecent(JSON.parse(stored) as RecentSnippet[]);
    } catch {
      setRecent([]);
    }
  }, []);

  function saveRecent(nextCode: string, nextResult: AnalysisResult) {
    if (!nextResult.ok) return;
    const firstLine = nextCode.trim().split("\n")[0] ?? "Untitled snippet";
    const snippet: RecentSnippet = {
      id: `${Date.now()}`,
      title: firstLine.slice(0, 70),
      code: nextCode,
      confidence: nextResult.confidence
    };
    setRecent((items) => {
      const nextItems = [snippet, ...items.filter((item) => item.code !== nextCode)].slice(0, 8);
      window.localStorage.setItem(recentKey, JSON.stringify(nextItems));
      return nextItems;
    });
  }

  async function analyze() {
    setIsAnalyzing(true);
    const next = await analyzeCode(code);
    setResult(next);
    setCode(next.formattedCode);
    saveRecent(next.formattedCode, next);
    setShowVisualization(false);
    setIsAnalyzing(false);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-5 md:px-6">
      <CuratedExamples
        onPick={(nextCode) => {
          setCode(nextCode);
          setResult(null);
          setShowVisualization(false);
        }}
      />
      <RecentSnippets
        snippets={recent}
        onPick={(nextCode) => {
          setCode(nextCode);
          setResult(null);
          setShowVisualization(false);
        }}
        onClear={() => {
          setRecent([]);
          window.localStorage.removeItem(recentKey);
        }}
      />
      <CodeInput
        code={code}
        isAnalyzing={isAnalyzing}
        hasAnalysis={Boolean(simulation)}
        onChange={setCode}
        onAnalyze={analyze}
        onVisualize={() => setShowVisualization(true)}
      />
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <AnalysisSummary result={result} />
        <LimitationsPanel result={result} />
      </div>
      <PatternHighlight result={result} />
      <DebugReport result={result} />
      {showVisualization && simulation ? <Visualizer demo={simulation} /> : null}
    </div>
  );
}
