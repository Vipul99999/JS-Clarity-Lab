"use client";

import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSavedCases, type SavedCase } from "@/lib/savedCases";

type SaveCaseButtonProps = Omit<SavedCase, "savedAt"> & {
  compact?: boolean;
};

export function SaveCaseButton({ compact, ...item }: SaveCaseButtonProps) {
  const { toggle, isSaved } = useSavedCases();
  const saved = isSaved(item);

  return (
    <Button
      type="button"
      size="sm"
      variant={saved ? "secondary" : "outline"}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(item);
      }}
      aria-label={saved ? `Unsave ${item.title}` : `Save ${item.title}`}
    >
      <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
      {compact ? null : saved ? "Saved" : "Save"}
    </Button>
  );
}
