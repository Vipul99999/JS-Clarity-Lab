# Deployment Readiness

## Production Environment

Required:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Recommended Vercel settings:

- Framework preset: Next.js.
- Build command: `pnpm build`.
- Install command: `pnpm install`.
- Output: default Next.js output.

## Analytics Decision

Current product position: local-first, no backend, no account.

Recommended launch analytics:

- Start with Vercel Web Analytics or a privacy-friendly page analytics tool.
- Do not capture pasted code.
- Do not capture generated debug notes.
- Track only aggregate events such as page view, demo opened, analyzer used, Node scenario opened, and path completed.

## Error Monitoring Decision

Recommended:

- Add Sentry or Vercel runtime logs after first public traffic.
- Scrub user-provided code and query parameters.
- Capture route, component stack, and browser environment only.

## Accessibility Checklist

- Keyboard can reach primary actions.
- Skip link works.
- Icon buttons have accessible names.
- Code view has a screen-reader label.
- Reduced motion is respected.
- Mobile drawer can open and close.
- Color is not the only state indicator.

## Release Gate

Run before deploy:

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm budget
pnpm qa:browser
```

Manual smoke:

- Home.
- Start Here.
- Learning Paths.
- Analyze Code.
- Debug Notes.
- Demo page.
- Node Runtime Lab desktop.
- Node Runtime Lab mobile.
- `/robots.txt`.
- `/sitemap.xml`.

## Deploy Preview Checklist

Before sharing a Vercel preview link:

- Verify `NEXT_PUBLIC_SITE_URL` matches the preview or production URL used for metadata.
- Open the custom social card at `/opengraph-image` and `/twitter-image`.
- Share `/demo/promise-before-timeout`, `/analyze`, and `/node-playground?scenario=node-queue-priority&mode=problem` in a chat preview to inspect titles and images.
- Run the 5-user script in `/usability-test` or `docs/USABILITY_TEST.md`.
- Confirm the analyzer states “does not execute code” and every result exposes confidence and limitations.
- Confirm feedback buttons work locally on demo, analyzer, and Node Runtime Lab pages.

Recommended Vercel preview command after login:

```bash
vercel
```

Recommended production deploy command after the preview is accepted:

```bash
vercel --prod
```
