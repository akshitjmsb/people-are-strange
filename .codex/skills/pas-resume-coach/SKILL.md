---
name: pas-resume-coach
description: Run Akshit Gupta's voice-friendly resume refinement workflow using the latest Google Drive master, explicit approval before edits, verified Google Doc updates, and a PAS job-matching handoff. Use when Akshit says "start my resume session," "work on my resume," "refine my resume," "resume coach," "update my master resume," asks to tailor or review his resume, or discusses resume-to-role matching.
---

# PAS Resume Coach

Run a conversational resume session without stale copies or manual uploads.

## Source of truth

- Treat `PAS_Resume_MASTER` as the only editable resume source.
- Google Doc ID: `1Sz8ZeQ3tq2q1SOKLq2Zt5NLqlLOHxlZoYioQ2DoDhPc`.
- Google Drive folder: `PAS_Resume`.
- Treat `PAS_Resume_CURRENT.pdf` (file ID `1kYGzulxSB2IzTGVUNvkZLWY8cSP-aCne`) as an application export, not an editing source.
- Fetch the master Doc again at the beginning of every session. Never rely on content remembered from an earlier chat.
- If Google Drive is unavailable, say so and stop instead of using stale resume text.

## Session workflow

1. Use the connected Google Drive/Google Docs capability to fetch the latest master Doc.
2. Confirm briefly that the latest revision is loaded. Do not read the entire resume aloud unless asked.
3. Ask one focused question at a time. Prefer natural prompts about outcomes, ownership, scale, decisions, and measurable impact.
4. Never invent employers, dates, metrics, skills, or achievements. Mark uncertain details and ask Akshit to confirm them.
5. Turn the discussion into proposed edits. Present a concise summary or exact before-and-after wording, optimized for listening in voice mode.
6. Keep proposals as drafts until Akshit explicitly says `approved`, `update the master`, `save these changes`, or an equivalent clear instruction.
7. Apply only approved edits to `PAS_Resume_MASTER`. Preserve unrelated content and structure.
8. Fetch the Doc again after writing and verify that every approved change is present. Report any partial or failed update immediately.
9. Do not refresh `PAS_Resume_CURRENT.pdf` unless Akshit explicitly asks for an application-ready export.
10. End with a short change summary and concrete next steps.

## Tailoring rules

- For a target role, fetch the latest master before reviewing the job description.
- Separate durable career facts from role-specific wording.
- Add only truthful, reusable facts to the master resume.
- Do not overwrite the master with speculative keywords or a one-off tailored version unless Akshit explicitly approves that outcome.

## PAS handoff

After a verified master update, explain that PAS will detect the new revision when Matches opens or during the daily refresh, then rebuild the candidate profile and re-rank active jobs.

- Matches: `https://people-are-strange-mtl.vercel.app/montreal?view=matches`
- Resume status: `https://people-are-strange-mtl.vercel.app/settings/resume`

For an immediate result, direct Akshit to open Matches. Otherwise, no manual action is required.
