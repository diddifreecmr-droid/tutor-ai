# Spec: Cameroon AI Tutor MVP

## Status

Draft — awaiting human approval.

## Objective

Build a French-first, installable Progressive Web App for a single initial student user in Cameroon. The student can capture or upload class notes and scanned documents, save them in a private library, ask questions grounded in those materials, and generate practice exercises.

The MVP should establish the foundation for later social learning, teacher tools, public content, and full mock exams without implementing those features yet.

## MVP Scope

### Included

- Optional user accounts; anonymous personal workspace is allowed.
- Camera capture of multiple note images in one upload session.
- Upload of image files and scanned PDF documents.
- OCR extraction from uploaded documents.
- Review and correction of extracted text before indexing.
- Organization by subject, level, series, chapter, and document type.
- Private note and past-question library.
- French-first interface and AI responses.
- Question answering based primarily on retrieved personal notes.
- Cameroon-specific educational metadata and terminology.
- MCQ generation.
- Structured-question generation.
- Explanations and feedback for submitted answers.
- PWA manifest and installability.

### Excluded from MVP

- Public social feed and sharing.
- Teacher verification and teacher plans.
- Classrooms and student groups.
- Public voting, reputation, or gamification.
- Full automated handwritten-answer grading.
- Full mock-exam simulation.
- Offline caching of application data.
- Regional expansion beyond Cameroon.

## User Experience

1. The user opens the PWA and enters an anonymous workspace or signs in.
2. The user selects a subject and chapter, then captures several images or uploads images/PDFs.
3. The system stores the original files and runs OCR.
4. The user reviews and corrects the extracted text.
5. The system indexes the document for retrieval.
6. The user asks a question in French.
7. The system retrieves relevant note excerpts and local curriculum context.
8. The AI responds in French, cites the relevant document/page where possible, and states when the material is insufficient.
9. The user generates MCQs or structured questions for a selected chapter.
10. The user submits answers and receives explanations and corrective feedback.

## Technical Architecture

- Frontend: Next.js-based responsive web application and installable PWA.
- Deployment: Docker-first for the MVP, with persistent named volumes.
- Storage and database: PostgreSQL with `pgvector`, plus a persistent application upload volume.
- Retrieval: PostgreSQL `pgvector` embeddings with metadata filtering.
- AI generation and OCR: OpenRouter through its OpenAI-compatible API, using GLM 5.3 Flash Vision for image/PDF page extraction and the selected generation model for tutoring and practice content.
- Workspace model: generated anonymous `workspace_id` initially, with a recovery code so the workspace can be restored after browser cache/cookie clearing.

OpenRouter is the model and vision layer, not the document database. Uploaded files, OCR text, metadata, and embeddings remain under application control. Each analysis request is limited to a maximum of 10 pages.

## Cameroon Context Model

Every document and generated exercise should support metadata such as:

- Country: Cameroon
- Education system: Francophone initially
- Level: 6e through Terminale
- Series: A, C, D, TI, or other configured series
- Subject
- Chapter
- Examination type: class/sequence exam, BEPC, Probatoire, BAC, or other
- Language: French
- Source type: personal note, past paper, marking scheme, or generated content
- Verification status

The initial knowledge base should contain a configurable curriculum catalogue and manually imported past questions. The system should use retrieval and metadata rather than fine-tuning the model for the MVP.

## Data Model

Core entities:

- `workspaces`
- `documents`
- `document_pages`
- `document_chunks`
- `subjects`
- `chapters`
- `curriculum_context`
- `past_questions`
- `marking_schemes`
- `practice_sets`
- `practice_items`
- `practice_attempts`

An anonymous workspace must have a server-side recovery mechanism. The UI should display a one-time recovery code and instruct the user to save it; entering that code on a new browser restores access to the workspace.

Each document should preserve its original file, OCR text, page boundaries, processing status, and metadata. Each searchable chunk should preserve its source document and page reference.

## Retrieval and AI Behavior

For each tutor or generation request:

1. Filter by workspace and selected curriculum metadata.
2. Search semantically for relevant note and past-question chunks.
3. Combine retrieved excerpts with the user request and the relevant Cameroon context.
4. Instruct the model to answer in French and distinguish source-backed claims from uncertainty.
5. Return source references where available.

Generated questions must be new questions inspired by retrieved material, not copied blindly from a past paper. Marking schemes must be treated as higher-trust content than generated explanations.

## Commands

Proposed commands after project bootstrap:

```text
Install: npm install
Dev: npm run dev
Build: npm run build
Lint: npm run lint
Test: npm test
```

## Project Structure

Proposed structure:

```text
app/                 Next.js routes and pages
components/          Reusable interface components
lib/                 AI, OCR, retrieval, and shared utilities
supabase/             Database migrations and seed data
public/               PWA manifest and static assets
tests/                Unit and integration tests
docs/                 Product and technical documentation
```

## Code Style

- TypeScript with strict mode enabled.
- Use clear domain names such as `documentChunk`, `curriculumContext`, and `practiceSet`.
- Keep OCR, retrieval, prompting, and UI concerns in separate modules.
- Validate all uploaded files and AI-generated structured responses at the application boundary.
- Store prompts as versioned server-side templates rather than embedding large prompts in UI components.

Example generated-content contract:

```ts
type PracticeItem = {
  type: "mcq" | "structured";
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  sourceRefs: string[];
};
```

## Testing Strategy

- Unit tests for metadata validation, chunking, retrieval filters, and response parsing.
- Integration tests for upload → OCR → indexing and tutor → retrieval → response flows.
- Tests confirming workspace isolation and private-document access.
- Tests confirming generated MCQs contain valid answers and explanations.
- Manual mobile testing for camera capture, multi-image upload, PDF upload, and PWA installation.
- Verify French interface labels and French AI responses.

## Boundaries

- Always: Keep documents private by default; validate files; preserve source/page references; answer in French by default; show uncertainty when retrieval is insufficient.
- Ask first: Adding paid infrastructure; selecting an OCR provider; changing the database schema; adding authentication; adding a new AI provider; expanding beyond the Francophone MVP scope.
- Never: Expose API keys in the browser; claim an answer is official without a trusted source; silently use unrelated users' documents; delete original uploads after OCR; commit secrets.

## Success Criteria

- The application can be installed from a supported browser as a PWA.
- The user can capture multiple images and upload scanned PDFs.
- Uploaded material is stored and associated with the correct workspace and metadata.
- OCR text can be reviewed and corrected before indexing.
- A question about an uploaded chapter returns a French answer grounded in relevant excerpts.
- The answer includes usable source/page references or explicitly states that no source was found.
- The user can generate valid MCQs and structured questions for a selected chapter.
- The user can submit an answer and receive French corrective feedback.
- A document from one workspace cannot be retrieved from another workspace.

## Open Questions

1. Which OCR provider should be used for the first implementation: local/open-source OCR or a paid cloud OCR service?
2. Which deployment and Supabase project should be used?
3. Which initial level, subject, and sample Cameroon past papers should seed the curriculum catalogue?
4. What maximum file size and number of pages should the MVP accept?
5. What generation model should be selected through OpenRouter after the GLM 5.3 Flash Vision OCR path is validated?
