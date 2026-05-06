import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AnalysisLab } from "@/components/AnalysisLab";
import { Button } from "@/components/ui/button";

export default function AnalyzePage() {
  return (
    <main className="min-h-screen">
      <header className="relative overflow-hidden border-b border-white/10 bg-[#071615] text-white">
        <div className="lab-grid absolute inset-0 opacity-60" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-4 px-4 py-7 md:px-6">
          <Button asChild variant="outline" size="sm" className="w-fit">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          </Button>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-lime-200">Phase 4 Analyzer</p>
            <h1 className="mt-1 max-w-4xl text-3xl font-semibold tracking-normal text-white md:text-5xl">Paste code. Get a visual debug report you can trust.</h1>
            <p className="mt-3 max-w-3xl leading-7 text-white/72">
              This is partial understanding by design. It parses JavaScript, extracts supported patterns, and teaches the queue model without executing arbitrary code.
            </p>
          </div>
        </div>
      </header>
      <AnalysisLab />
    </main>
  );
}
