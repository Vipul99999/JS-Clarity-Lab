import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Gauge } from "lucide-react";
import { getQualitySnapshot } from "@/product/coverage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RuntimeCoverageMatrix } from "@/components/RuntimeCoverageMatrix";
import { CanThisHelpChecker } from "@/components/CanThisHelpChecker";

export function QualityDashboard() {
  const snapshot = getQualitySnapshot();
  const visibleIssues = snapshot.issues.slice(0, 24);

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-6 md:px-6">
      <div className="grid gap-3 md:grid-cols-4">
        <Card className="border-cyan-100">
          <CardContent className="p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quality score</div>
            <div className="mt-2 flex items-center gap-2 text-3xl font-semibold text-cyan-900">
              <Gauge className="h-6 w-6" />
              {snapshot.qualityScore}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total cases</div>
            <div className="mt-2 text-3xl font-semibold">{snapshot.totals.total}</div>
            <p className="mt-1 text-xs text-muted-foreground">{snapshot.totals.guided} guided, {snapshot.totals.editable} editable, {snapshot.totals.node} Node</p>
          </CardContent>
        </Card>
        <Card className={snapshot.issueCount ? "border-amber-200" : "border-emerald-200"}>
          <CardContent className="p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quality flags</div>
            <div className="mt-2 flex items-center gap-2 text-3xl font-semibold">
              {snapshot.issueCount ? <AlertTriangle className="h-6 w-6 text-amber-700" /> : <CheckCircle2 className="h-6 w-6 text-emerald-700" />}
              {snapshot.issueCount}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-950 text-white">
          <CardContent className="p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-white/50">Best next QA action</div>
            <p className="mt-2 text-sm leading-6">{snapshot.issueCount ? "Fix flagged scenario metadata before adding more cases." : "Add deeper analyzer coverage and browser checks."}</p>
          </CardContent>
        </Card>
      </div>

      <CanThisHelpChecker />
      <RuntimeCoverageMatrix />

      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base">Case quality flags</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {visibleIssues.length ? (
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {visibleIssues.map((issue) => (
                <div key={`${issue.type}-${issue.id}-${issue.issue}`} className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                  <div className="text-xs font-semibold uppercase tracking-wide">{issue.type} - {issue.issue}</div>
                  <div className="mt-1 font-semibold">{issue.title}</div>
                  <Link href={issue.type === "Node" ? `/node-playground?scenario=${issue.id}&mode=problem` : `/demo/${issue.id}`} className="mt-2 inline-flex items-center gap-2 font-semibold">
                    Open case
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-950">No quality flags found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
