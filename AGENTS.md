# Project context

## Resume source of truth

- Use the `$pas-resume-coach` skill when Akshit starts a resume-refinement session, asks to work on his resume, approves resume edits, or asks for resume-to-role matching.
- When Akshit says "my resume", use the latest content from the connected Google Drive folder `PAS_Resume`.
- The editable source of truth is the Google Doc `PAS_Resume_MASTER` (file ID `1Sz8ZeQ3tq2q1SOKLq2Zt5NLqlLOHxlZoYioQ2DoDhPc`).
- `PAS_Resume_CURRENT.pdf` (file ID `1kYGzulxSB2IzTGVUNvkZLWY8cSP-aCne`) is the current export for applications, not the editing source.
- Fetch the Google Doc again at the start of resume, job-search, or role-matching work so the task uses the latest revision; do not rely on a copy remembered from an earlier chat.
- When resume edits are approved, update `PAS_Resume_MASTER`. Refresh `PAS_Resume_CURRENT.pdf` only when Akshit asks to create or update the application-ready export.
- If Google Drive is unavailable or disconnected, say so instead of silently using stale resume text.

## Communication

- Always end user-facing task handoffs with clear, concrete next steps.

## City feature parity

- Treat every supported city as a first-class experience at the same feature level.
- A city is not complete unless it supports the same map, list, matches, upside, search, filtering, mobile, metadata/PWA, validation, and data-quality capabilities as every other city.
- Build shared functionality through city configuration and shared components; do not introduce city-specific feature gaps.
- When adding or changing a cross-city feature, verify it for every supported city before handoff.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
