<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project-Specific Agent Rules

- **Documentation Sync:** Whenever we change something from the plan in the docs, update it in the docs immediately to keep the AI Context up to date.
- **Environment Files:** NEVER read or write files with `.env*`. Keep secrets secure and never output them.
- **Phase Completion:** Whenever a phase has been completed, first review it (provide a brief in steps and ask if it is okay or if anything else is needed), and ONLY THEN mark it as done in `phases.md`.
- **Version Control:** After every phase, provide the user with the git commands to commit and push to GitHub. Do NOT run the git commit or push commands yourself.
