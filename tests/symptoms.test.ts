import { describe, expect, it } from "vitest";
import { findSymptomMatches } from "@/product/symptoms";

describe("symptom search", () => {
  it("routes natural-language symptoms to product cases", () => {
    expect(findSymptomMatches("await did not wait")[0]?.href).toContain("missing-await");
    expect(findSymptomMatches("stream hangs during upload")[0]?.href).toContain("stream-error-handling");
    expect(findSymptomMatches("Promise.all failed everything")[0]?.href).toContain("promise-allsettled-errors");
  });
});
