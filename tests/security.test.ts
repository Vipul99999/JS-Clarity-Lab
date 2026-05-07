import { describe, expect, it } from "vitest";
import { getSecurityHeaderValue, securityHeaders } from "@/security/headers";
import { copyTextSafely } from "@/security/clipboard";
import { isInternalHref, limitText, MAX_RECENT_SNIPPET_CHARS, safeJsonParse, safeSnippetTitle } from "@/security/privacy";
import { securityChecklist, securityPosture } from "@/security/posture";

describe("security hardening", () => {
  it("ships browser security headers", () => {
    const names = securityHeaders.map((header) => header.key);

    expect(names).toContain("Content-Security-Policy");
    expect(names).toContain("X-Frame-Options");
    expect(names).toContain("X-Content-Type-Options");
    expect(names).toContain("Permissions-Policy");
    expect(getSecurityHeaderValue("Content-Security-Policy")).toContain("frame-ancestors 'none'");
    expect(getSecurityHeaderValue("Content-Security-Policy")).toContain("object-src 'none'");
    expect(getSecurityHeaderValue("X-Frame-Options")).toBe("DENY");
  });

  it("documents the no-execution security posture", () => {
    expect(securityPosture.noArbitraryExecution).toContain("never executed");
    expect(securityChecklist).toContain("No arbitrary JavaScript execution");
    expect(securityChecklist).toContain("No backend code upload");
  });

  it("bounds local snippet storage and removes unsafe title characters", () => {
    const long = "x".repeat(MAX_RECENT_SNIPPET_CHARS + 100);

    expect(limitText(long).length).toBeLessThan(long.length);
    expect(safeSnippetTitle("<script>alert(1)</script>")).not.toContain("<");
    expect(safeJsonParse("{bad", { ok: true })).toEqual({ ok: true });
  });

  it("allows only internal saved links", () => {
    expect(isInternalHref("/demo/promise-before-timeout")).toBe(true);
    expect(isInternalHref("//evil.test")).toBe(false);
    expect(isInternalHref("javascript:alert(1)")).toBe(false);
    expect(isInternalHref("https://evil.test")).toBe(false);
  });

  it("bounds clipboard text", async () => {
    let copied = "";
    Object.assign(globalThis.navigator, {
      clipboard: {
        writeText: async (value: string) => {
          copied = value;
        }
      }
    });

    await copyTextSafely("abcdef", 3);
    expect(copied).toContain("abc");
    expect(copied).toContain("truncated");
  });
});
