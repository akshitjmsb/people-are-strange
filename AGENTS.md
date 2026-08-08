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
