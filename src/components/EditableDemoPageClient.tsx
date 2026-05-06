"use client";

import { getEditableDemo } from "@/demos";
import { EditableDemoRunner } from "./EditableDemoRunner";

export function EditableDemoPageClient({ id }: { id: string }) {
  const demo = getEditableDemo(id);
  if (!demo) return null;
  return <EditableDemoRunner demo={demo} />;
}
