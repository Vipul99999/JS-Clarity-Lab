"use client";

import Link from "next/link";
import { Clipboard, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDebugNotes } from "@/lib/debugNotes";
import { copyTextSafely } from "@/security/clipboard";

export function DebugNotesWorkspace() {
  const { notes, clearNotes } = useDebugNotes();

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Saved notes</h2>
          <p className="mt-1 text-sm text-muted-foreground">Copied analyzer and Node playbook notes are saved locally so you can continue later.</p>
        </div>
        {notes.length ? (
          <Button variant="outline" size="sm" onClick={clearNotes}>
            <Trash2 className="h-4 w-4" />
            Clear notes
          </Button>
        ) : null}
      </div>

      {!notes.length ? (
        <Card className="border-cyan-100 bg-cyan-50">
          <CardContent className="p-5">
            <FileText className="h-5 w-5 text-cyan-800" />
            <h3 className="mt-3 text-xl font-semibold text-cyan-950">No debug notes yet</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-cyan-900">
              Analyze a snippet or open a Node scenario, then copy fix notes. The note will appear here without creating an account or sending your code to a backend.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm"><Link href="/analyze">Analyze code</Link></Button>
              <Button asChild size="sm" variant="outline"><Link href="/node-playground?scenario=node-queue-priority&mode=problem">Open Node Lab</Link></Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {notes.map((note) => (
            <Card key={note.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-cyan-700">{note.source}</div>
                    <h3 className="mt-1 font-semibold">{note.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => copyTextSafely(note.body)}>
                      <Clipboard className="h-4 w-4" />
                      Copy
                    </Button>
                    <Button asChild size="sm" variant="outline"><Link href={note.href}>Continue</Link></Button>
                  </div>
                </div>
                <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-3 text-xs leading-5 text-white">{note.body}</pre>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
