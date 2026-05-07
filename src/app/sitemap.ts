import type { MetadataRoute } from "next";
import { demos, editableDemos } from "@/demos";
import { topicLandingPages } from "@/product/topicLandingPages";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://js-clarity-lab.vercel.app";

const staticRoutes = ["/", "/start", "/clinic", "/concepts", "/discover", "/analyze", "/node-playground", "/quality", "/why"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const demoRoutes = [...demos, ...editableDemos].map((demo) => `/demo/${demo.id}`);
  const topicRoutes = topicLandingPages.map((page) => `/topics/${page.slug}`);

  return [...staticRoutes, ...topicRoutes, ...demoRoutes].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route.startsWith("/topics/") ? 0.88 : route.startsWith("/demo/") ? 0.72 : 0.82
  }));
}
