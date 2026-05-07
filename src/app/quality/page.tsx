import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { QualityDashboard } from "@/components/QualityDashboard";
import { SecurityPosturePanel } from "@/components/SecurityPosturePanel";
import { ProductAnalyticsPanel } from "@/components/ProductAnalyticsPanel";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Product Quality, Coverage, and Trust",
  description:
    "Review JS Clarity Lab coverage, scenario quality, runtime limitations, confidence levels, and security posture for safe JavaScript and Node.js learning.",
  alternates: {
    canonical: "/quality"
  },
  robots: {
    index: false,
    follow: true
  },
  openGraph: {
    title: "Product Quality, Coverage, and Trust | JS Clarity Lab",
    description:
      "A transparent dashboard for simulation coverage, case quality, trust levels, limitations, and security posture.",
    url: "/quality",
    type: "website"
  }
};

export default function QualityPage() {
  return (
    <main className="min-h-screen">
      <header className="relative overflow-hidden border-b border-white/10 bg-[#111318] text-white">
        <div className="lab-grid absolute inset-0 opacity-60" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-4 px-4 py-7 md:px-6">
          <Button asChild variant="outline" size="sm" className="w-fit">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          </Button>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-200">Product Quality</p>
            <h1 className="mt-1 max-w-4xl text-3xl font-semibold tracking-normal text-white md:text-5xl">Trust dashboard for coverage, case quality, and user fit.</h1>
            <p className="mt-3 max-w-3xl leading-7 text-white/72">
              This page keeps the product honest: what is fully visualized, what is partial, what is only detected, and where case quality needs attention.
            </p>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-4 pt-6 md:px-6">
        <SecurityPosturePanel />
      </section>
      <section className="mx-auto max-w-7xl px-4 pt-6 md:px-6">
        <ProductAnalyticsPanel />
      </section>
      <QualityDashboard />
    </main>
  );
}
