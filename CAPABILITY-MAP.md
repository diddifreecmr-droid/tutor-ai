# Capability Map: Cameroon AI Tutor MVP

| Module | Responsibility | Depends on |
|---|---|---|
| `student-account` | Optional account support and anonymous personal workspace | — |
| `note-library` | Upload, OCR, organize, and retrieve private study material | `student-account` |
| `ai-tutor` | Answer questions using the student's retrieved notes and local context | `note-library` |
| `practice-generator` | Generate MCQs and structured questions with feedback | `note-library`, `ai-tutor` |
| `pwa-shell` | French-first responsive interface and installability | — |

Build order: `student-account` → `note-library` → `ai-tutor` → `practice-generator`.

`pwa-shell` runs alongside all modules.
