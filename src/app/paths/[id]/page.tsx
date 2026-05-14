import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getLearningPath, learningPaths } from "@/product/learningPaths";

export function generateStaticParams() {
  return learningPaths.map((path) => ({ id: path.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const path = getLearningPath(id);
  if (!path) return {};
  return {
    title: path.title,
    description: path.promise,
    alternates: { canonical: `/paths/${path.id}` }
  };
}

export default async function LearningPathPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const path = getLearningPath(id);
  if (!path) notFound();

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#101217] text-white">
        <div className="lab-grid absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-200">Learning Path</p>
          <h1 className="mt-2 max-w-4xl text-4xl font-semibold tracking-normal md:text-6xl">{path.title}</h1>
          <p className="mt-3 max-w-3xl leading-7 text-white/72">{path.promise}</p>
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <div className="space-y-3">
          {path.steps.map((step, index) => (
            <Link href={step.href} key={step.href}>
              <Card className="transition-all hover:-translate-y-1 hover:border-primary">
                <CardContent className="grid gap-4 p-4 md:grid-cols-[48px_1fr_auto] md:items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-50 text-cyan-800">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step {index + 1}</div>
                    <h2 className="mt-1 text-xl font-semibold">{step.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.outcome}</p>
                  </div>
                  <ArrowRight className="hidden h-5 w-5 text-muted-foreground md:block" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
