# MVP Task List

- [ ] Task: Bootstrap Next.js TypeScript project and French-first shell
  - Acceptance: App runs locally with a French landing screen and strict TypeScript configuration.
  - Verify: `npm run build`
  - Files: project configuration, `app/`, `components/`

- [ ] Task: Add Docker Compose with PostgreSQL and persistent volumes
  - Acceptance: One command starts the app and database; database and uploads survive container restart.
  - Verify: `docker compose up --build` and restart persistence check.
  - Files: `Dockerfile`, `docker-compose.yml`, `.env.example`

- [ ] Task: Create database schema and migrations
  - Acceptance: Workspace, document, page, chunk, curriculum, practice, and processing-status tables exist with required indexes.
  - Verify: migration command and schema smoke test.
  - Files: `supabase/` or `db/`, server database modules

- [ ] Task: Implement anonymous workspace and recovery code
  - Acceptance: User can create, leave, and restore a workspace using a recovery code; recovery code is not stored in plaintext.
  - Verify: integration test using a new browser/session identifier.
  - Files: workspace API/routes, workspace UI, database migration, tests

- [ ] Task: Implement multi-image camera and file upload flow
  - Acceptance: User can capture/select multiple images and upload scanned PDFs; requests over 10 pages are rejected clearly.
  - Verify: mobile browser manual test and upload API tests.
  - Files: upload UI, upload API, file validation, tests

- [ ] Task: Implement GLM 5.3 Flash Vision OCR pipeline
  - Acceptance: Uploaded pages are sent server-side through OpenRouter, OCR text is stored per page, and processing failures are recoverable.
  - Verify: mocked provider integration test and one real local smoke test with sample pages.
  - Files: OCR client, processing service, document/page modules, tests

- [ ] Task: Add OCR review and document metadata editor
  - Acceptance: User can correct extracted text and assign subject, level, series, and chapter.
  - Verify: save/reload test.
  - Files: review UI, document API, validation, tests

- [ ] Task: Add chunking, embeddings, and workspace-scoped retrieval
  - Acceptance: Correct chunks are searchable by meaning and never cross workspace boundaries.
  - Verify: retrieval tests with two isolated workspaces.
  - Files: indexing service, vector queries, migrations, tests

- [ ] Task: Implement French-first AI tutor
  - Acceptance: Tutor answers from retrieved content, includes page references, and admits insufficient context.
  - Verify: mocked retrieval and provider tests plus manual French smoke test.
  - Files: tutor service, prompt templates, chat UI, tests

- [ ] Task: Implement MCQ and structured-question practice
  - Acceptance: Valid practice sets can be generated, answered, scored, and explained in French.
  - Verify: schema validation and end-to-end practice test.
  - Files: practice service, schemas, UI, tests

- [ ] Task: Make the application installable as a PWA
  - Acceptance: Supported mobile browser offers installation and the installed app opens the French-first shell.
  - Verify: manual install test on mobile browser.
  - Files: manifest, icons, metadata, layout

- [ ] Task: Run MVP verification and document local deployment
  - Acceptance: Clean checkout starts with Docker, passes tests/build, and demonstrates upload → OCR → tutor → practice.
  - Verify: documented verification checklist.
  - Files: `README.md`, test files, deployment configuration
