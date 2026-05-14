"use client";

import Editor, { type OnMount } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import type { editor } from "monaco-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CodePanelProps = {
  code: string;
  currentLine: number;
  editableBadge?: boolean;
};

export function CodePanel({ code, currentLine, editableBadge }: CodePanelProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<editor.IEditorDecorationsCollection | null>(null);
  const [editorReady, setEditorReady] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const handleMount: OnMount = (instance) => {
    editorRef.current = instance;
    decorationsRef.current = instance.createDecorationsCollection();
    setEditorReady(true);
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => setShowFallback(true), 1600);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!editorRef.current || !decorationsRef.current) return;
    decorationsRef.current.set([
      {
        range: {
          startLineNumber: currentLine,
          startColumn: 1,
          endLineNumber: currentLine,
          endColumn: 1
        },
        options: {
          isWholeLine: true,
          className: "active-line-highlight"
        }
      }
    ]);
    editorRef.current.revealLineInCenterIfOutsideViewport(currentLine);
  }, [currentLine]);

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Code</CardTitle>
          {editableBadge ? <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-800">Editable through controls</span> : null}
        </div>
      </CardHeader>
      <CardContent className="h-[430px] p-0">
        {showFallback && !editorReady ? (
          <div className="h-full overflow-auto bg-[#101217] py-3 font-mono text-[13px] leading-6 text-slate-100" role="code" aria-label="Code fallback view">
            {code.split("\n").map((line, index) => {
              const lineNumber = index + 1;
              const active = lineNumber === Math.max(1, currentLine);
              return (
                <div key={`${lineNumber}-${line}`} className={`grid min-w-max grid-cols-[48px_minmax(0,1fr)] border-l-4 pr-4 ${active ? "border-cyan-300 bg-cyan-300/16 text-white" : "border-transparent"}`}>
                  <span className={`select-none px-3 text-right text-xs ${active ? "text-cyan-200" : "text-slate-500"}`}>{lineNumber}</span>
                  <span className="whitespace-pre">{line || " "}</span>
                </div>
              );
            })}
          </div>
        ) : null}
        {!showFallback || editorReady ? (
          <Editor
            height="100%"
            defaultLanguage="javascript"
            value={code}
            theme="vs-light"
            onMount={handleMount}
            loading={<div className="flex h-full items-center justify-center bg-[#101217] p-4 text-sm text-cyan-100">Opening code view...</div>}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
              lineHeight: 22,
              scrollBeyondLastLine: false,
              folding: false,
              renderLineHighlight: "none",
              overviewRulerLanes: 0,
              padding: { top: 16, bottom: 16 }
            }}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
