import { describe, expect, it } from "vitest";
import { decodeDemoState } from "@/utils/decodeDemoState";
import { encodeDemoState } from "@/utils/encodeDemoState";
import type { EditableControl } from "@/editable/types";

const controls: EditableControl[] = [
  { type: "number", key: "timerDelay", label: "Delay", min: 0, max: 1000, step: 10 },
  { type: "boolean", key: "cleanup", label: "Cleanup" },
  { type: "text", key: "label", label: "Label", maxLength: 10 }
];

describe("URL state helpers", () => {
  it("encodes only changed values and decodes types", () => {
    const defaults = { timerDelay: 0, cleanup: false, label: "A" };
    const query = encodeDemoState({ timerDelay: 1000, cleanup: true, label: "A" }, defaults, controls);
    expect(query).toContain("timerDelay=1000");
    expect(query).toContain("cleanup=true");
    expect(query).not.toContain("label=");

    const decoded = decodeDemoState(new URLSearchParams(query), controls);
    expect(decoded).toEqual({ timerDelay: 1000, cleanup: true });
  });
});
