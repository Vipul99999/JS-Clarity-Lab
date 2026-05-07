import type { Metadata } from "next";
import { FirstRunTour } from "@/components/FirstRunTour";
import { SiteNav } from "@/components/SiteNav";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://js-clarity-lab.vercel.app";
const title = "JS Clarity Lab - Visual JavaScript Async and Node.js Runtime Playground";
const description =
  "Understand confusing JavaScript async behavior with guided demos, prediction, visual timelines, paste-code analysis, Node.js runtime scenarios, and real-world debugging playbooks.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "JS Clarity Lab",
  title: {
    default: title,
    template: "%s | JS Clarity Lab"
  },
  description,
  keywords: [
    "JavaScript event loop visualizer",
    "JavaScript async playground",
    "Node.js event loop visualizer",
    "Promise microtask queue",
    "setTimeout vs Promise",
    "process.nextTick visualizer",
    "Node.js thread pool",
    "JavaScript debugging tool",
    "async await visualization",
    "stream backpressure Node.js"
  ],
  authors: [{ name: "JS Clarity Lab" }],
  creator: "JS Clarity Lab",
  publisher: "JS Clarity Lab",
  category: "developer tools",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "JS Clarity Lab",
    title,
    description,
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title,
    description
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "JS Clarity Lab",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description,
    url: siteUrl,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    },
    featureList: [
      "Guided JavaScript async demos",
      "Prediction-first learning flow",
      "Visual event loop simulation",
      "Paste-code pattern analyzer",
      "Node.js runtime playground",
      "Thread pool and stream backpressure visualization",
      "Real-world debugging playbooks"
    ]
  };

  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-950 focus:shadow-lg">
          Skip to main content
        </a>
        <SiteNav />
        <div id="main-content">{children}</div>
        <FirstRunTour />
      </body>
    </html>
  );
}
