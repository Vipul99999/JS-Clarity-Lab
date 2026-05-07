# Safety and Security Guide

## Security Position

JS Clarity Lab is designed as a safe visual reasoning tool, not an arbitrary code execution sandbox.

The most important security rule:

```txt
Never execute pasted user JavaScript.
```

## What The Product Does

- Parses code into an AST.
- Detects supported async patterns.
- Generates simplified event timelines.
- Shows confidence and limitations.
- Lets users edit controlled parameters in curated demos.
- Stores progress locally in the browser.

## What The Product Does Not Do

- It does not run arbitrary user code.
- It does not call external APIs from pasted snippets.
- It does not provide login or backend persistence.
- It does not claim perfect runtime debugging.
- It does not hide unsupported constructs.

## Trust Levels

Every educational result should be honest about confidence:

- Fully simulated: curated scenario with known visual events.
- Partially simulated: known pattern with simplified model.
- Pattern detected only: found a signal but cannot model full behavior.
- Unsupported: product should explain why it cannot help yet.

## Security Headers

Security headers are configured in `src/security/headers.ts` and applied from `next.config.ts`.

Current protections include:

- Content Security Policy.
- `X-Frame-Options: DENY`.
- `X-Content-Type-Options: nosniff`.
- Strict referrer policy.
- Permissions policy.
- Cross-origin opener and resource policy.
- Disabled Next.js powered-by header.

## Clipboard and Sharing

Share and export features should only copy generated notes, URLs, or known product content. They should not execute pasted code or send it to a backend.

## Local Storage

Learning progress and saved cases are local-only. No account is required.

Stored information should remain non-sensitive:

- Completed cases.
- Weak areas.
- Saved case IDs.
- Recommended next case.

## JSON-LD SEO Script

The app includes JSON-LD structured data in the root layout for search engines. This script is generated from static product metadata and is not based on user input.

## Future Backend Rules

If a backend is added later:

- Keep anonymous use possible.
- Do not store pasted code by default.
- Add explicit consent for saving snippets.
- Add rate limits.
- Add CSRF protection for state-changing endpoints.
- Add strict input validation.
- Add audit logging for account actions.
- Add a deletion/export path for user data.

## Security Review Checklist

Before release:

- Run `pnpm test`.
- Run `pnpm typecheck`.
- Run `pnpm build`.
- Run `pnpm qa:browser`.
- Verify security headers on the deployed site.
- Verify no feature executes pasted code.
- Verify analyzer limitation messaging is visible.
- Verify share URLs do not include sensitive content by default.

