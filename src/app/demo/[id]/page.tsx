import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditableDemoPageClient } from "@/components/EditableDemoPageClient";
import { Visualizer } from "@/components/Visualizer";
import { demos, editableDemos, getDemo, getEditableDemo, getNextDemoId } from "@/demos";

export function generateStaticParams() {
  const ids = Array.from(new Set([...demos.map((demo) => demo.id), ...editableDemos.map((demo) => demo.id)]));
  return ids.map((id) => ({ id }));
}

export default async function DemoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const demo = getDemo(id);
  const editableDemo = getEditableDemo(id);
  if (!demo && !editableDemo) notFound();
  const title = editableDemo?.title ?? demo!.title;
  const concept = editableDemo?.concept.detail ?? demo!.concept;
  const category = editableDemo?.category ?? demo!.category;
  const nextDemoId = getNextDemoId(demo?.id ?? editableDemo!.id);

  return (
    <main className="min-h-screen">
      <header className="relative overflow-hidden border-b border-white/10 bg-[#071615] text-white">
        <div className="lab-grid absolute inset-0 opacity-55" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Demos
              </Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href={`/demo/${nextDemoId}`}>
                Next demo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-lime-200">
              {editableDemo ? `Editable ${category}` : `Demo ${demo!.number}`}
              {editableDemo ? ` · ${editableDemo.difficulty}` : ""}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-white md:text-5xl">{title}</h1>
            <p className="mt-2 max-w-3xl leading-7 text-white/72">{concept}</p>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        {editableDemo ? (
          <Suspense fallback={<div className="rounded-lg border bg-white p-4 text-sm text-muted-foreground">Loading editable case...</div>}>
            <EditableDemoPageClient id={editableDemo.id} />
          </Suspense>
        ) : (
          <Visualizer demo={demo!} />
        )}
      </section>
    </main>
  );
}
