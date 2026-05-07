import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { demos, editableDemos } from "@/demos";
import { topicLandingPages } from "@/product/topicLandingPages";

describe("SEO surface", () => {
  it("publishes robots rules with a sitemap and keeps quality dashboard out of search", () => {
    const rules = robots();

    expect(rules.sitemap).toContain("/sitemap.xml");
    expect(rules.rules).toMatchObject({
      userAgent: "*",
      allow: "/",
      disallow: ["/quality"]
    });
  });

  it("publishes important product routes and every demo route in the sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls.some((url) => url.endsWith("/"))).toBe(true);
    expect(urls.some((url) => url.endsWith("/analyze"))).toBe(true);
    expect(urls.some((url) => url.endsWith("/node-playground"))).toBe(true);
    expect(urls.some((url) => url.endsWith("/discover"))).toBe(true);
    expect(urls.some((url) => url.endsWith("/why"))).toBe(true);

    for (const topic of topicLandingPages) {
      expect(urls.some((url) => url.endsWith(`/topics/${topic.slug}`))).toBe(true);
    }

    for (const demo of [...demos, ...editableDemos]) {
      expect(urls.some((url) => url.endsWith(`/demo/${demo.id}`))).toBe(true);
    }
  });
});
