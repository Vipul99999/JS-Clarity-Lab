import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Search } from "lucide-react";
import { demos, getDemo } from "@/demos";
import { nodeScenarios } from "@/nodePlayground/scenarios";
import { getTopicLandingPage, topicLandingPages } from "@/product/topicLandingPages";
import { Card, CardContent } from "@/components/ui/card";

export function generateStaticParams() {
  return topicLandingPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getTopicLandingPage(slug);
  if (!page) return {};

  return {
    title: page.title,
    description: page.description,
    keywords: page.searchIntent,
    alternates: {
      canonical: `/topics/${page.slug}`
    },
    openGraph: {
      title: `${page.title} | JS Clarity Lab`,
      description: page.description,
      url: `/topics/${page.slug}`,
      type: "article"
    },
    twitter: {
      card: "summary",
      title: page.title,
      description: page.description
    }
  };
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getTopicLandingPage(slug);
  if (!page) notFound();

  const primaryDemo = getDemo(page.primaryDemoId);
  const related = page.relatedDemoIds
    .map((id) => getDemo(id) ?? demos.find((demo) => demo.id === id))
    .filter(Boolean);
  const nodeScenario = page.nodeScenarioId ? nodeScenarios.find((scenario) => scenario.id === page.nodeScenarioId) : undefined;

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#101217] text-white">
        <div className="lab-grid absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-6">
          <p className="inline-flex rounded-full border border-cyan-200/25 bg-cyan-200/10 px-3 py-1 text-sm font-semibold uppercase tracking-wide text-cyan-100">
            {page.eyebrow}
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-normal md:text-6xl">{page.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/74 md:text-lg">{page.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {primaryDemo ? (
              <Link href={`/demo/${primaryDemo.id}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cyan-200 px-4 py-2 text-sm font-semibold text-[#101217] transition-all hover:-translate-y-0.5 hover:bg-cyan-100">
                Open visual demo
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
            {nodeScenario ? (
              <Link href={`/node-playground?scenario=${nodeScenario.id}&mode=problem`} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/14 bg-white/[0.07] px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/[0.12]">
                Open Node lab
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 md:px-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-cyan-100 bg-cyan-50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-900">
              <CheckCircle2 className="h-4 w-4" />
              Short answer
            </div>
            <p className="mt-3 text-lg font-semibold leading-8 text-cyan-950">{page.shortAnswer}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Search className="h-4 w-4" />
              People search this as
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {page.searchIntent.map((intent) => (
                <span key={intent} className="rounded-full border bg-white px-3 py-1 text-sm font-medium text-slate-700">{intent}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 md:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {page.sections.map((section) => (
            <Card key={section.title} className="h-full">
              <CardContent className="p-5">
                <h2 className="text-lg font-semibold">{section.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{section.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 md:px-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Practice this topic</h2>
            <p className="mt-1 text-sm text-muted-foreground">Start with the strongest case, then continue through related examples.</p>
          </div>
          <Link href="/discover" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-800">
            Search all cases
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {primaryDemo ? (
            <Link href={`/demo/${primaryDemo.id}`}>
              <Card className="h-full border-cyan-200 bg-cyan-50 transition-all hover:-translate-y-1">
                <CardContent className="p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-cyan-800">Best first demo</div>
                  <h3 className="mt-2 font-semibold text-cyan-950">{primaryDemo.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-cyan-900">{primaryDemo.concept}</p>
                </CardContent>
              </Card>
            </Link>
          ) : null}
          {nodeScenario ? (
            <Link href={`/node-playground?scenario=${nodeScenario.id}&mode=problem`}>
              <Card className="h-full transition-all hover:-translate-y-1">
                <CardContent className="p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Node Runtime Lab</div>
                  <h3 className="mt-2 font-semibold">{nodeScenario.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{nodeScenario.realWorld}</p>
                </CardContent>
              </Card>
            </Link>
          ) : null}
          {related.map((demo) => (
            <Link href={`/demo/${demo!.id}`} key={demo!.id}>
              <Card className="h-full transition-all hover:-translate-y-1">
                <CardContent className="p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Related case</div>
                  <h3 className="mt-2 font-semibold">{demo!.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{demo!.explanation.realWorld}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
