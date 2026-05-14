import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Share2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SaveCaseButton } from "@/components/SaveCaseButton";
import { TrustBadge } from "@/components/TrustBadge";
import { FeedbackPrompt } from "@/components/FeedbackPrompt";
import { demos, editableDemos, getDemo, getEditableDemo, getNextDemoId } from "@/demos";
import { buildDemoPageCopy } from "@/product/demoCopy";
import { LazyEditableDemoSurface, LazyVisualizerSurface } from "@/components/LazyDemoSurfaces";

export function generateStaticParams() {
  const ids = Array.from(new Set([...demos.map((demo) => demo.id), ...editableDemos.map((demo) => demo.id)]));
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const demo = getDemo(id);
  const editableDemo = getEditableDemo(id);
  if (!demo && !editableDemo) return {};

  const title = editableDemo?.title ?? demo!.title;
  const description = editableDemo?.concept.detail ?? demo!.concept;
  const realWorld = editableDemo?.generateExplanation(editableDemo.defaultParams).realWorld ?? demo!.explanation.realWorld;

  return {
    title,
    description: `${description} ${realWorld}`.slice(0, 155),
    alternates: {
      canonical: `/demo/${id}`
    },
    openGraph: {
      title,
      description,
      url: `/demo/${id}`,
      type: "article"
    },
    twitter: {
      card: "summary",
      title,
      description
    }
  };
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
  const pageCopy = demo ? buildDemoPageCopy(demo) : null;
  const editableExplanation = editableDemo?.generateExplanation(editableDemo.defaultParams);
  const related = pageCopy?.related ?? demos.filter((item) => item.category === category).slice(0, 3);

  return (
    <main className="min-h-screen">
      <header className="relative overflow-hidden border-b border-white/10 bg-[#111318] text-white">
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
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-200">
              {editableDemo ? `Editable ${category}` : `Demo ${demo!.number}`}
              {editableDemo ? ` - ${editableDemo.difficulty}` : ""}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-white md:text-5xl">{title}</h1>
            <p className="mt-2 max-w-3xl leading-7 text-white/72">{concept}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <TrustBadge level={editableDemo ? "partially simulated" : "fully simulated"} />
              <TrustBadge level="curated scenario" />
              <TrustBadge level="does not execute real code" />
            </div>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mb-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-cyan-100 bg-cyan-50">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-cyan-900">
                <CheckCircle2 className="h-4 w-4" />
                Short answer
              </div>
              <p className="mt-3 text-lg font-semibold leading-8 text-cyan-950">
                {pageCopy?.shortAnswer ?? editableExplanation?.summary}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-5 text-sm leading-6">
              <div>
                <div className="font-semibold">Real-world bug this helps solve</div>
                <p className="mt-1 text-muted-foreground">{pageCopy?.realWorldBug ?? editableExplanation?.realWorld}</p>
              </div>
              <div>
                <div className="font-semibold">Common wrong assumption</div>
                <p className="mt-1 text-muted-foreground">{pageCopy?.wrongAssumption ?? editableExplanation?.mistake}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 font-semibold">
                  <Wrench className="h-4 w-4 text-cyan-700" />
                  Fix direction
                </div>
                <p className="mt-1 text-muted-foreground">{pageCopy?.fixedNote ?? editableExplanation?.mistake}</p>
              </div>
              <div>
                <div className="font-semibold">Fixed code pattern</div>
                <pre className="mt-2 overflow-x-auto rounded-md bg-slate-950 p-3 text-xs leading-5 text-cyan-100">{pageCopy?.fixedCode ?? "// Change the safe controls, then compare the generated fixed behavior."}</pre>
              </div>
              <div>
                <div className="font-semibold">Visual proof</div>
                <p className="mt-1 text-muted-foreground">{pageCopy?.visualProof ?? "Change the controls and watch the generated timeline reset so the changed behavior is visible."}</p>
              </div>
              <div>
                <div className="font-semibold">How to verify in a real app</div>
                <p className="mt-1 text-muted-foreground">{pageCopy?.howToVerify ?? "Reproduce the small case, apply the safer pattern, and verify output, timing, or memory before and after the change."}</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <SaveCaseButton id={editableDemo?.id ?? demo!.id} type={editableDemo ? "editable" : "demo"} title={title} href={`/demo/${editableDemo?.id ?? demo!.id}`} category={category} />
                <Button asChild size="sm" variant="outline">
                  <a href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Open this JS Clarity Lab case: /demo/${editableDemo?.id ?? demo!.id}`)}`}>
                    <Share2 className="h-4 w-4" />
                    Share
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        {editableDemo ? (
          <Suspense fallback={<div className="rounded-lg border bg-white p-4 text-sm text-muted-foreground">Loading editable case...</div>}>
            <LazyEditableDemoSurface id={editableDemo.id} />
          </Suspense>
        ) : (
          <LazyVisualizerSurface demo={demo!} />
        )}
        <section className="mt-6 rounded-xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">Related cases</h2>
              <p className="mt-1 text-sm text-muted-foreground">Continue with nearby confusion while the mental model is fresh.</p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href={`/demo/${nextDemoId}`}>
                Recommended next
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {related.map((item) => (
              <Link href={`/demo/${item.id}`} key={item.id}>
                <Card className="h-full transition-all hover:-translate-y-1 hover:border-primary">
                  <CardContent className="p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.category}</div>
                    <h3 className="mt-2 font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.explanation.realWorld}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
        <div className="mt-6">
          <FeedbackPrompt pageId={`demo:${editableDemo?.id ?? demo!.id}`} context={title} />
        </div>
      </section>
    </main>
  );
}
