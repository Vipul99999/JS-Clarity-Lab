import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Route } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { learningPaths } from "@/product/learningPaths";

export const metadata: Metadata = {
  title: "JavaScript Runtime Learning Paths",
  description: "Guided learning paths for async output, promise mistakes, Node.js internals, memory leaks, performance debugging, and interview prep.",
  alternates: { canonical: "/paths" }
};

export default function PathsPage() {
  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#101217] text-white">
        <div className="lab-grid absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-200">Learning Paths</p>
          <h1 className="mt-2 max-w-4xl text-4xl font-semibold tracking-normal md:text-6xl">Follow a path, not a catalog.</h1>
          <p className="mt-3 max-w-3xl leading-7 text-white/72">Each path gives you a short sequence of cases with one clear skill outcome per step.</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 md:grid-cols-2 md:px-6 xl:grid-cols-3">
        {learningPaths.map((path) => (
          <Link href={path.href} key={path.id}>
            <Card className="h-full transition-all hover:-translate-y-1 hover:border-primary">
              <CardContent className="p-5">
                <Route className="h-5 w-5 text-cyan-700" />
                <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{path.audience}</div>
                <h2 className="mt-1 text-xl font-semibold">{path.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{path.promise}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-800">
                  Start path
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </main>
  );
}
