import { describe, expect, it } from "vitest";
import { getEditableDemo } from "@/demos";
import { validateWithDefaults } from "@/editable/schemas";

describe("editable validation", () => {
  it("falls back to safe defaults for invalid params", () => {
    const demo = getEditableDemo("promise-before-timeout");
    expect(demo).toBeTruthy();
    const result = validateWithDefaults(demo!.schema, { timerDelay: 99999, promiseCount: 50 }, demo!.defaultParams);
    expect(result.params.timerDelay).toBe(0);
    expect(result.params.promiseCount).toBe(1);
    expect(Object.keys(result.errors)).toEqual(expect.arrayContaining(["timerDelay", "promiseCount"]));
  });
});
