"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, Clipboard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult } from "@/analyzer/patternTypes";
import { buildDebugReport, getPredictedOutput, getRecommendedDemo } from "@/analyzer/debugReport";
import { buildAnalyzerFixNotes } from "@/analyzer/exportNotes";
import { copyTextSafely } from "@/security/clipboard";
import { useDebugNotes } from "@/lib/debugNotes";

export function DebugReport({ result }: { result: AnalysisResult | null }) {
  const [copied, setCopied] = useState(false);
  const [copiedNotes, setCopiedNotes] = useState(false);
  const [savedNotes, setSavedNotes] = useState(false);
  const { saveNote } = useDebugNotes();
  const report = useMemo(() => buildDebugReport(result), [result]);
  const notes = useMemo(() => buildAnalyzerFixNotes(result), [result]);
  const output = getPredictedOutput(result);
  const recommended = getRecommendedDemo(result);

  if (!result) return null;

  async function copy() {
    await copyTextSafely(report);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  async function copyNotes() {
    await copyTextSafely(notes);
    saveNote({
      title: result?.ok ? `Analyzer: ${result.patterns.length} pattern(s)` : "Analyzer parse issue",
      body: notes,
      source: "analyzer",
      href: "/analyze"
    });
    setSavedNotes(true);
    setCopiedNotes(true);
    window.setTimeout(() => setCopiedNotes(false), 1400);
    window.setTimeout(() => setSavedNotes(false), 1800);
  }

  return (
    <Card className="border-teal-200">
      <CardHeader className="border-b pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base">Debug report</CardTitle>
          <Button variant="outline" size="sm" onClick={copy}>
            {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
            {copied ? "Copied" : "Copy report"}
          </Button>
          <Button variant="outline" size="sm" onClick={copyNotes}>
            {copiedNotes ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
            {savedNotes ? "Saved locally" : copiedNotes ? "Copied notes" : "Copy fix notes"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4 text-sm leading-6">
        {result.ok ? (
          <>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-md bg-teal-50 px-3 py-2 text-teal-950">
                <div className="font-semibold">Confidence</div>
                <div>{result.confidence}</div>
              </div>
              <div className="rounded-md bg-secondary px-3 py-2">
                <div className="font-semibold">Predicted output</div>
                <div>{output.length > 0 ? output.join(" -> ") : "none"}</div>
              </div>
              <div className="rounded-md bg-accent px-3 py-2">
                <div className="font-semibold">Warnings</div>
                <div>{result.warnings.length}</div>
              </div>
            </div>
            {recommended ? (
              <Button asChild size="sm">
                <Link href={`/demo/${recommended.id}`}>
                  Open matching demo: {recommended.label}
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            ) : null}
          </>
        ) : (
          <p className="text-red-800">{result.error}</p>
        )}
        <pre className="max-h-72 overflow-auto rounded-md bg-slate-950 p-3 font-mono text-xs leading-5 text-white">{report}</pre>
      </CardContent>
    </Card>
  );
}
