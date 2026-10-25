# tutor-ai

French-first AI tutor PWA for Cameroon.

The MVP will support private note uploads, OCR, retrieval-grounded tutoring, and practice questions. See [SPEC.md](SPEC.md) and [tasks/plan.md](tasks/plan.md).

## Local development

The first deployment target is Docker with persistent volumes. Secrets must be provided through environment variables or an untracked `.env` file; never commit API tokens.
