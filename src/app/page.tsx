import Link from "next/link";
import { ArrowRight, Brain, BriefcaseBusiness, Bug, Clock, Code2, Layers, MemoryStick, MousePointerClick, Server, Sparkles, Zap } from "lucide-react";
import { ClarityScanner } from "@/components/ClarityScanner";
import { ProblemNavigator } from "@/components/ProblemNavigator";
import { Card, CardContent } from "@/components/ui/card";
import { categories, demos, editableDemos } from "@/demos";

const icons = {
  "event-loop": Clock,
  promises: Layers,
  "async-await": Sparkles,
  memory: MemoryStick,
  performance: Zap,
  "node-runtime": Server,
  "real-world": Bug
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#071615] text-white">
        <div className="lab-grid absolute inset-0 opacity-70" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-lime-200/70 to-transparent" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:px-6 md:py-14">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-lime-200">JS Clarity Lab</p>
            <h1 className="mt-2 max-w-4xl text-4xl font-semibold tracking-normal text-white md:text-6xl">
              Debug confusing JavaScript behavior like it appears in real products.
            </h1>
          </div>
          <p className="max-w-3xl text-base leading-7 text-white/76 md:text-lg">
            Instant answers, controlled experiments, and production playbooks for async surprises, hidden bugs, unexpected output, memory leaks, and performance stalls.
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { icon: Zap, title: "Fast answer", body: "Spot the likely trap within seconds." },
              { icon: Brain, title: "Think first", body: "Predict the result before the animation reveals it." },
              { icon: BriefcaseBusiness, title: "Production fix", body: "See symptoms, safer patterns, and where the bug appears in modern apps." }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-lg border border-white/10 bg-white/[0.07] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.16)]">
                  <Icon className="h-5 w-5 text-lime-200" />
                  <div className="mt-2 font-semibold text-white">{item.title}</div>
                  <p className="text-sm leading-6 text-white/68">{item.body}</p>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            {[
              { label: "guided concepts", value: demos.length },
              { label: "editable cases", value: editableDemos.length },
              { label: "real-world traps", value: "Node + UI + tests" }
            ].map((stat) => (
              <div key={stat.label} className="rounded-md border border-white/10 bg-black/18 px-3 py-2 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
                <span className="font-semibold text-lime-200">{stat.value}</span>
                <span className="ml-2 text-white/66">{stat.label}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/analyze" className="premium-link inline-flex h-10 items-center justify-center gap-2 rounded-md bg-lime-200 px-4 py-2 text-sm font-semibold text-[#071615] transition-all hover:-translate-y-0.5 hover:bg-lime-100">
              <Code2 className="h-4 w-4" />
              Paste code analyzer
            </Link>
            <Link href="/demo/promise-before-timeout" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/14 bg-white/[0.07] px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/[0.12]">
              Start with editable cases
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      <ClarityScanner />
      <ProblemNavigator />
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="grid gap-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MousePointerClick className="h-5 w-5 text-teal-700" />
              <h2 className="text-xl font-semibold">Editable Cases</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {editableDemos.map((demo) => (
                <Link href={`/demo/${demo.id}`} key={demo.id}>
                  <Card className="h-full border-teal-200/80 transition-all hover:-translate-y-1 hover:border-primary hover:bg-white">
                    <CardContent className="flex h-full flex-col gap-3 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-teal-700">{demo.difficulty}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{demo.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{demo.concept.short}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
          {categories.map((category) => {
            const Icon = icons[category.id];
            const categoryDemos = demos.filter((demo) => demo.category === category.id);
            return (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-teal-700" />
                  <h2 className="text-xl font-semibold">{category.label}</h2>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {categoryDemos.map((demo) => (
                    <Link href={`/demo/${demo.id}`} key={demo.id}>
                      <Card className="h-full transition-all hover:-translate-y-1 hover:border-primary hover:bg-white">
                        <CardContent className="flex h-full flex-col gap-3 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-semibold text-muted-foreground">Demo {demo.number}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{demo.title}</h3>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">{demo.concept}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
