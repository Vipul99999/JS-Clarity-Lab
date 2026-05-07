# Launch Package

## Product Tagline

Visual clarity for confusing JavaScript and Node.js runtime behavior.

## Short Pitch

JS Clarity Lab helps developers understand why JavaScript and Node.js behave in surprising ways. Users predict output, run a visual runtime timeline, inspect queues and output, then learn the real-world fix.

## Launch Pages To Promote

- `/topics/promise-vs-settimeout`
- `/topics/javascript-event-loop-visualizer`
- `/topics/nodejs-event-loop-visualizer`
- `/topics/process-nexttick-vs-promise`
- `/topics/async-await-mistakes`
- `/topics/nodejs-stream-backpressure`
- `/why`
- `/start`
- `/analyze`
- `/node-playground`

## Screenshot Plan

Capture these screenshots before launch:

1. Home page product decision guide.
2. Promise vs setTimeout topic page.
3. Demo page short answer plus visualizer.
4. Analyze Code page after analyzing the default snippet.
5. Node Runtime Lab in Visual mode.
6. Node Runtime Lab in Fix notes tab.
7. Quality dashboard trust and coverage.

Recommended dimensions:

- 1600x1000 desktop hero screenshots.
- 390x844 mobile screenshots.
- 1200x630 Open Graph image if a custom image is added later.

## Demo GIF / Video Plan

Create a 30-45 second launch video:

1. Open `/topics/promise-vs-settimeout`.
2. Click the visual demo.
3. Predict output.
4. Run the timeline.
5. Show short answer and real-world bug.
6. Open `/analyze`.
7. Paste the same snippet and show likely output/fix suggestion.
8. Open Node Runtime Lab and show `process.nextTick` or stream backpressure.

Core message:

```txt
Confusing JavaScript behavior becomes visible.
```

## Release Checklist

- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm qa:browser`
- Verify `/robots.txt`.
- Verify `/sitemap.xml`.
- Verify `/topics/*` pages.
- Verify `/demo/promise-before-timeout`.
- Verify `/analyze`.
- Verify `/node-playground?scenario=node-queue-priority&mode=problem`.
- Verify mobile layout for home, demo, analyze, and Node Runtime Lab.
- Verify security headers.
- Verify pasted code is not executed.
- Verify analyzer limitations are visible.

## Vercel Deployment

Recommended environment variable:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Build command:

```bash
pnpm build
```

Start command:

```bash
pnpm start
```

## Launch Copy

### One sentence

JS Clarity Lab is a visual playground for understanding confusing JavaScript async output and Node.js runtime behavior.

### Social post

I built JS Clarity Lab: a visual reasoning tool for JavaScript and Node.js runtime confusion.

Predict output, run the timeline, inspect queues, see the explanation, and copy real-world fix notes.

It does not execute pasted code. It safely detects known patterns and shows clear limitations.

### Product Hunt style

Developers lose time on async behavior that feels invisible: promises before timers, missing await, async forEach, nextTick priority, stream backpressure, thread-pool pressure, and memory leaks. JS Clarity Lab makes those runtime steps visible with guided demos, prediction, safe analysis, and Node.js visual scenarios.
