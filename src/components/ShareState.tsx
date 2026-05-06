"use client";

import { useMemo, useState } from "react";
import { Check, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EditableControl } from "@/editable/types";
import { encodeDemoState } from "@/utils/encodeDemoState";

export function ShareState({
  pathname,
  params,
  defaultParams,
  controls
}: {
  pathname: string;
  params: Record<string, unknown>;
  defaultParams: Record<string, unknown>;
  controls: EditableControl[];
}) {
  const [copied, setCopied] = useState(false);
  const sharePath = useMemo(() => {
    const query = encodeDemoState(params, defaultParams, controls);
    return query ? `${pathname}?${query}` : pathname;
  }, [controls, defaultParams, params, pathname]);

  async function copy() {
    const url = `${window.location.origin}${sharePath}`;
    await navigator.clipboard?.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-3">
      <div className="min-w-0">
        <div className="text-sm font-semibold">Share this variation</div>
        <div className="truncate font-mono text-xs text-muted-foreground">{sharePath}</div>
      </div>
      <Button variant="outline" size="sm" onClick={copy}>
        {copied ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
        {copied ? "Copied" : "Copy link"}
      </Button>
    </div>
  );
}
