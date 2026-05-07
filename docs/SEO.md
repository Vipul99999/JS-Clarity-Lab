# SEO Guide

## SEO Goal

JS Clarity Lab should be discoverable by developers searching for practical answers to confusing JavaScript and Node.js behavior.

Primary search intent:

- "Why does Promise run before setTimeout?"
- "JavaScript event loop visualizer."
- "Node.js event loop visualizer."
- "process.nextTick vs Promise."
- "setImmediate vs setTimeout Node.js."
- "async await not waiting."
- "async forEach issue."
- "Node.js thread pool visualizer."
- "stream backpressure Node.js."
- "JavaScript memory leak examples."

## SEO Implementation

The app includes:

- Global metadata in `src/app/layout.tsx`.
- Per-route metadata for product pages.
- Dynamic metadata for `/demo/[id]`.
- JSON-LD structured data for `SoftwareApplication`.
- `src/app/sitemap.ts`.
- `src/app/robots.ts`.
- Focused topic landing pages under `/topics/[slug]`.

## Topic Landing Pages

Current SEO-focused pages:

- `/topics/promise-vs-settimeout`
- `/topics/javascript-event-loop-visualizer`
- `/topics/nodejs-event-loop-visualizer`
- `/topics/process-nexttick-vs-promise`
- `/topics/async-await-mistakes`
- `/topics/nodejs-stream-backpressure`

## Canonical URL

Set the production URL with:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

If unset, the app falls back to:

```txt
https://js-clarity-lab.vercel.app
```

## Route Strategy

Index:

- `/`
- `/start`
- `/clinic`
- `/concepts`
- `/discover`
- `/analyze`
- `/node-playground`
- `/demo/[id]`

Do not index:

- `/quality`

The quality page is valuable for trust, but it is not a primary landing page for search traffic.

## Content Strategy

Each demo page should be strong enough to stand alone:

- Human-readable title.
- Short concept.
- Real-world bug or usage.
- Prediction.
- Visual timeline.
- Explanation.
- Common wrong assumption.
- Fixed version where relevant.
- Recommended next case.

Good demo titles should use user language:

- "Why did this print first?"
- "Why is my timer late?"
- "Why did await not wait?"
- "Why is my API slow?"
- "Why is memory growing?"

Technical terms should appear after the user problem:

- microtask queue
- timer queue
- event loop
- thread pool
- stream backpressure

## Structured Data

The root layout publishes `SoftwareApplication` JSON-LD with:

- Name.
- Category.
- Description.
- URL.
- Free offer.
- Feature list.

The JSON-LD is static product metadata and does not include user content.

## SEO QA Checklist

Before release:

- Visit `/robots.txt`.
- Visit `/sitemap.xml`.
- Check that demo pages have unique titles.
- Check that major pages have meaningful descriptions.
- Check that `/quality` is noindex.
- Run `pnpm test`.
- Run `pnpm build`.
