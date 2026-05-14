import Link from "next/link";
import { ArrowRight, CheckCircle2, Play, Route, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressDashboard } from "@/components/ProgressDashboard";
import { ProductAnalyticsPanel } from "@/components/ProductAnalyticsPanel";
import { ClarityGuardrails } from "@/components/ClarityGuardrails";
import { CanThisHelpChecker } from "@/components/CanThisHelpChecker";
import { ProductDecisionGuide } from "@/components/ProductDecisionGuide";
import { PremiumProductPreview } from "@/components/PremiumProductPreview";
import {
  corePromise,
  primaryActions,
  problemRoutes,
  productAreas,
  productDecisions,
  realProblemsSolved,
  universalFlow,
  userPaths
} from "@/product/architecture";
import { demos, editableDemos } from "@/demos";

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#101217] text-white">
        <div className="lab-grid absolute inset-0 opacity-70" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 via-55% to-rose-300/60" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 md:px-6 md:py-14 lg:grid-cols-[1.02fr_0.98fr]">
          <div>
            <p className="inline-flex rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-sm font-semibold uppercase tracking-wide text-cyan-100">
              JS Clarity Lab
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-normal text-white md:text-6xl">
              {corePromise.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-white/74 md:text-lg">{corePromise.body}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/start" className="premium-link inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cyan-200 px-4 py-2 text-sm font-semibold text-[#101217] transition-all hover:-translate-y-0.5 hover:bg-cyan-100">
                <Play className="h-4 w-4" />
                Start in 30 seconds
              </Link>
              <Link href="/clinic" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/14 bg-white/[0.07] px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/[0.12]">
                Diagnose a real bug
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/concepts" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/14 bg-white/[0.07] px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/[0.12]">
                Break down concepts
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-3">
            {primaryActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link href={action.href} key={action.title}>
                  <Card className="border-white/10 bg-white/[0.08] text-white shadow-[0_18px_55px_rgba(0,0,0,0.16)] transition-all hover:-translate-y-1 hover:bg-white/[0.12]">
                    <CardContent className="grid gap-3 p-4 sm:grid-cols-[42px_1fr_auto] sm:items-center">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-200 text-[#101217]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h2 className="font-semibold">{action.title}</h2>
                        <p className="mt-1 text-sm leading-6 text-white/66">{action.body}</p>
                      </div>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-100">
                        {action.cta}
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <PremiumProductPreview />

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-xl border border-black/10 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Public promise</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">Stop guessing why JavaScript printed that.</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Pick a real confusion, predict the output, run a visual timeline, then leave with a fix note you can use in an app, test, or interview.
            </p>
            <div className="mt-5 grid gap-2">
              <Link href="/demo/promise-before-timeout" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5">
                Start with Promise vs Timer
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/analyze" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-4 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:bg-slate-50">
                Analyze code safely
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/node-playground?scenario=node-queue-priority&mode=problem" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-4 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:bg-slate-50">
                Open Node Runtime Lab
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-black/10 bg-[#101217] text-white shadow-[0_18px_50px_rgba(15,23,42,0.14)]">
            <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold text-cyan-100">Preview of the learning loop</div>
            <div className="grid gap-3 p-4 md:grid-cols-2">
              <div className="rounded-lg bg-white/[0.07] p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-white/50">Code</div>
                <pre className="mt-3 overflow-hidden rounded-md bg-black/35 p-3 text-xs leading-6 text-cyan-100">
                  {`console.log("A")
setTimeout(() => console.log("B"), 0)
Promise.resolve().then(() => console.log("C"))
console.log("D")`}
                </pre>
              </div>
              <div className="grid gap-2">
                {["Predict first", "Run visual timeline", "Inspect queues", "Copy fix notes"].map((step, index) => (
                  <div key={step} className="rounded-lg border border-white/10 bg-white/[0.07] px-3 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-200 text-sm font-semibold text-[#101217]">{index + 1}</span>
                      <span className="font-semibold">{step}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-6">
          <ProgressDashboard />
        </div>
        <div className="mb-6">
          <ProductAnalyticsPanel />
        </div>
        <div className="mb-6">
          <ProductDecisionGuide />
        </div>
        <div className="mb-6">
          <CanThisHelpChecker />
        </div>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">What do you need right now?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose the symptom. The product routes you to the simplest useful surface.</p>
          </div>
          <Link href="/discover" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-800">
            Search all cases
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {problemRoutes.map((item) => {
            const Icon = item.icon;
            return (
              <Link href={item.href} key={item.label}>
                <Card className="h-full transition-all hover:-translate-y-1 hover:border-primary hover:bg-white">
                  <CardContent className="flex h-full gap-4 p-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-800">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-semibold">{item.label}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.outcome}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 md:px-6">
        <ClarityGuardrails />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 md:px-6">
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <Card className="overflow-hidden border-black/10 bg-[#101217] text-white">
            <CardContent className="relative p-5">
              <div className="lab-grid absolute inset-0 opacity-35" />
              <div className="relative">
                <div className="flex items-center gap-2 text-sm font-semibold text-cyan-100">
                  <Route className="h-4 w-4" />
                  Universal learning flow
                </div>
                <div className="mt-5 grid gap-2">
                  {universalFlow.map((step, index) => (
                    <div key={step} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-200 text-sm font-semibold text-[#101217]">{index + 1}</span>
                      <span className="text-sm font-medium">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-2xl font-semibold">Built for different real users</h2>
            <p className="mt-1 text-sm text-muted-foreground">Same product, different depth. Nobody should be forced into the advanced lab before they need it.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {userPaths.map((path) => {
                const Icon = path.icon;
                return (
                  <Link href={path.href} key={path.audience}>
                    <Card className="h-full transition-all hover:-translate-y-1 hover:border-primary hover:bg-white">
                      <CardContent className="p-4">
                        <Icon className="h-5 w-5 text-cyan-700" />
                        <h3 className="mt-3 font-semibold">{path.audience}</h3>
                        <p className="mt-2 text-sm font-medium leading-6">{path.need}</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{path.productAnswer}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 md:px-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-black/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-700" />
                <h2 className="text-2xl font-semibold">Why users come back</h2>
              </div>
              <div className="mt-4 space-y-2">
                {productDecisions.map((decision) => (
                  <div key={decision.title} className="rounded-lg bg-slate-50 px-3 py-2">
                    <div className="font-semibold">{decision.title}</div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{decision.body}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-black/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-cyan-700" />
                <h2 className="text-2xl font-semibold">Real problems solved</h2>
              </div>
              <div className="mt-4 space-y-2">
                {realProblemsSolved.map((problem) => (
                  <div key={problem} className="flex gap-2 rounded-lg bg-cyan-50 px-3 py-2 text-sm leading-6 text-cyan-950">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0" />
                    <span>{problem}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 md:px-6">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold">Product map</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Four areas, one learning flow. Current library: {demos.length} guided demos and {editableDemos.length} editable cases.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {productAreas.map((area) => (
            <Link href={area.href} key={area.title}>
              <Card className="h-full transition-all hover:-translate-y-1 hover:border-primary hover:bg-white">
                <CardContent className="p-4">
                  <div className="font-semibold">{area.title}</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{area.body}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
