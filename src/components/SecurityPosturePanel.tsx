import { ShieldCheck } from "lucide-react";
import { securityChecklist, securityPosture } from "@/security/posture";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SecurityPosturePanel() {
  return (
    <Card className="border-emerald-100">
      <CardHeader className="border-b pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4 text-emerald-700" />
          Security posture
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 p-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-2 text-sm leading-6">
          {Object.entries(securityPosture).map(([key, value]) => (
            <div key={key} className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-950">
              <span className="font-semibold">{key.replace(/([A-Z])/g, " $1")}:</span> {value}
            </div>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {securityChecklist.map((item) => (
            <div key={item} className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-950">
              {item}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
