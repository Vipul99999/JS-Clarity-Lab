"use client";

import Editor, { type OnMount } from "@monaco-editor/react";
import { useEffect, useRef } from "react";
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

  const handleMount: OnMount = (instance) => {
    editorRef.current = instance;
    decorationsRef.current = instance.createDecorationsCollection();
  };

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
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={code}
          theme="vs-light"
          onMount={handleMount}
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
      </CardContent>
    </Card>
  );
}
