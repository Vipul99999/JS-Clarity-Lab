# Operations Guide

## Local Development

Install dependencies:

```bash
pnpm install
```

Run development server:

```bash
pnpm dev
```

Open:

```txt
http://127.0.0.1:3000
```

## Production Build

Build:

```bash
pnpm build
```

Run production locally:

```bash
pnpm start
```

## Required Quality Checks

Before merging or deploying:

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm budget
pnpm qa:browser
```

## Environment Variables

Recommended production variable:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

This controls canonical URLs, sitemap URLs, robots host, and structured data URL.

## Deployment

Target platform: Vercel.

Deployment checklist:

1. Set `NEXT_PUBLIC_SITE_URL`.
2. Run all quality checks.
3. Deploy preview.
4. Test home, learning paths, notes, analyze, discover, a demo page, topic pages, and Node Runtime Lab.
5. Verify `/robots.txt`.
6. Verify `/sitemap.xml`.
7. Verify `/topics/promise-vs-settimeout`.
8. Verify `/why`.
9. Verify security headers.
10. Verify no pasted code is executed.

## Browser QA

Playwright smoke and visual QA tests cover key product pages. Add a browser test when a new page becomes part of the core user journey.

Current core journey:

- Home.
- Start.
- Learning Paths.
- Discover.
- Analyze.
- Debug Notes.
- Demo page.
- Node Runtime Lab.
- Quality dashboard.

## Release Notes Template

```txt
Release:

Added:
- ...

Improved:
- ...

Fixed:
- ...

Trust and safety:
- ...

QA:
- pnpm typecheck
- pnpm test
- pnpm build
- pnpm qa:browser
```
