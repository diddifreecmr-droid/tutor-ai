# Implementation Plan: Cameroon AI Tutor MVP

## Delivery approach

Build a Dockerized vertical slice first: create an anonymous workspace, upload a small document, extract text with GLM 5.3 Flash Vision, review the OCR result, and persist it. Then add retrieval, tutoring, practice generation, and PWA installability.

## Architecture

- Next.js and TypeScript application container.
- PostgreSQL with `pgvector` container.
- Persistent Docker volume for database data.
- Persistent Docker volume for original uploads and processed artifacts.
- OpenRouter server-side integration for GLM 5.3 Flash Vision and later generation models.
- Recovery-code-based anonymous workspaces.

## Implementation phases

### Phase 1 — Foundation

Create the Next.js project, Docker Compose setup, environment configuration, database migrations, health checks, and basic French-first application shell.

### Phase 2 — Anonymous workspace

Create workspaces without mandatory registration. Generate a recovery code, store only a secure hash server-side, and provide restore flow.

### Phase 3 — Upload and OCR

Support camera multi-capture, image upload, and scanned PDF upload. Enforce a maximum of 10 pages per analysis. Store originals, call GLM 5.3 Flash Vision through OpenRouter, preserve page boundaries, and allow OCR correction.

### Phase 4 — Library and indexing

Add subject/chapter metadata, document status tracking, text chunking, embeddings, and vector retrieval restricted to the active workspace.

### Phase 5 — Tutor

Implement French-first retrieval-augmented tutoring with source/page references, insufficient-context behavior, prompt versioning, and request logging without storing secrets.

### Phase 6 — Practice generator

Generate validated MCQs and structured questions from selected material, accept answers, and return explanations and source references.

### Phase 7 — PWA and verification

Add installable manifest, responsive mobile flows, Docker production build, integration tests, workspace-isolation tests, and an end-to-end demo path.

## Risks and mitigations

- Vision OCR may misread handwriting: show editable OCR text and preserve the original pages.
- Model output may be invalid: require structured JSON and validate it server-side.
- Anonymous data can be lost without recovery: require explicit recovery-code display and test restore on a clean browser.
- Large uploads can exhaust resources: enforce page, file-size, and processing limits before calling the model.
- Incorrect local context can mislead students: keep curriculum metadata explicit and show source provenance.
