# Tasks.md: Phase 2 (Intelligence, Immersion and Reach)

**Project:** STEM learning platform for **CBSE Class 10 and Class 12** (Mathematics, Physics, Chemistry, Biology)
**Starts when:** Phase 1 (Tasks 0 to 11) is finished, deployed and working
**Ends when:** every feature in the final feature list below works inside the same website, plus the mobile app and the offline mode

---

## 0. How to use this file (rules for the user and for any tool or agent)

1. Every task and every subtask has its own checkbox: `- [ ]` means not done, `- [x]` means done.
2. A tool or agent marks a checkbox `- [x]` only when that exact item is finished and verified. It never marks items it did not do.
3. A parent task is marked `- [x]` only after ALL its subtasks are `- [x]`.
4. Task IDs look like `P2-3.4` (Phase 2, section 3, task 4). Do not renumber them; other tasks refer to them.
5. Keep each task to **one sitting** (about 1 to 3 hours). If a task feels bigger, split it into new subtasks instead of skipping it.
6. Order matters inside a section. Sections can overlap only where "Depends on" allows it.

### Legend

| Mark | Meaning |
|---|---|
| ✍️ | **Hand-write.** The user writes this core logic personally. The agent only guides, explains and reviews. |
| 🆕 | **New technology** for the user. The agent must say it is new, then teach it step by step before implementing. |
| 🔗 | **Depends on** another task. Do not start before that task is `[x]`. |
| ⚠️ | Risk or thing to double check (limits, licences, performance). |

### Naming decision

The AI character (earlier called "Chotu") is renamed **Saarthi** (Sanskrit for "guide / charioteer"). Saarthi is **one character** that works as both the **AI mentor** and the **24/7 doubt solver**. Wherever this file says Saarthi, it means that single character. The name can be changed in task P2-0.2 without affecting anything else.

### Final feature list covered by this file

| # | Feature | Section |
|---|---|---|
| 1 | CBSE-based RAG pipeline | 2 |
| 2 | Summary (ask Gemini) | 4 |
| 3 | MCQ questions | 5 |
| 4 | Human handwriting / notes | 6 |
| 5 | Interactive diagrams | 7 |
| 6 | **Virtual Learning section (new)** | 8 |
| 7 | 3D virtual labs (physics, chemistry, biology) | 9 |
| 8 | AI-based videos (dummy videos for chapters) | 10 |
| 9 | Community (Discord) | 11 |
| 10 | AI mentor with context storing (Saarthi) | 3 |
| 11 | 24/7 AI doubt solver (Saarthi) | 3 |
| 12 | Multi-board and multi-language support | 1 |
| 13 | Offline part of the app (questions, lectures, notes) | 12 |
| 14 | Mobile app | 13 |

Not part of Phase 2 (left for later): sign language, SaaS, gamification, teacher dashboard, role-play lessons.

---

## P2-0. Phase 2 setup and decisions

- [ ] **P2-0.1 Confirm Phase 1 is really finished**
  - [ ] Auth, profile, lessons, notes, MCQ practice, Gemini summary, SVG diagrams, pendulum lab, admin panel all work on the deployed site
  - [ ] Seed data exists (4 chapters, 10+ MCQs each) and is backed up
  - [ ] Phase 1 code is merged to `main` and tagged `v1.0`
  - [ ] Create a new branch `phase2` for all work in this file
- [ ] **P2-0.2 Lock the decisions (write answers into `Design.md`)**
  - [ ] Final name of the AI character (default: **Saarthi**)
  - [ ] Classes: **10 and 12** (CBSE). Confirm the chapter list for each subject and class
  - [ ] Languages: English + Hindi + **one regional language** (user to choose which one)
  - [ ] Database & Vector storage choice: **Supabase PostgreSQL with pgvector** (replaces MongoDB; native SQL similarity search via pgvector and unified relational schema, see P2-2.4)
  - [ ] Mobile app approach (default: Capacitor wrapping the PWA, see P2-13.1)
  - [ ] Hosting for videos (default: Cloudinary free tier, Supabase Storage, or unlisted YouTube, see P2-10.4)
- [ ] **P2-0.3 Update the planning files before coding**
  - [ ] Update `PRD.md`: classes 10 and 12, Phase 2 feature list, Virtual Learning section, Supabase database migration
  - [ ] Update `Design.md`: new pages, new data models (Supabase SQL tables & pgvector), new API routes (list below)
  - [ ] New pages: `/mentor` (Saarthi), `/virtual-learning`, `/virtual-learning/:topic`, `/labs`, `/labs/:id`, `/videos`, `/community`, `/notes/handwriting`, `/offline`
  - [ ] New models (Supabase SQL tables): `chunks` (with embedding vector), `documents`, `chat_sessions`, `chat_messages`, `memory_facts`, `videos`, `labs`, `virtual_topics`, `translation_strings`
  - [ ] New routes (grouped): `/api/rag/*`, `/api/mentor/*`, `/api/summary/*`, `/api/mcq/*`, `/api/notes/*`, `/api/videos/*`, `/api/labs/*`, `/api/virtual/*`
- [ ] **P2-0.4 Accounts, keys and limits** ⚠️
  - [ ] Gemini API key stored only in backend `.env` (never in frontend code)
  - [ ] Supabase URL and Service Role Key stored only in backend `.env` (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
  - [ ] Check the current Gemini and Supabase free-tier limits (500MB DB, pgvector, 1GB storage) and write them in `Design.md`
  - [ ] Add a per-user rate limit on every AI route (`express-rate-limit`) ✍️
  - [ ] Add a simple usage counter so free-tier limits are not exceeded during demo
- [ ] **P2-0.5 Folder structure additions**
  - [ ] `backend/src/rag/`, `backend/src/mentor/`, `backend/src/jobs/`
  - [ ] `frontend/src/features/virtual-learning/`, `frontend/src/features/labs/`, `frontend/src/features/mentor/`, `frontend/src/offline/`
  - [ ] `content/` folder (not deployed) for source PDFs, scripts and video storyboards

---

## P2-1. Multi-board and multi-language support (foundation, do this first)

Reason it comes first: board and language change how content is stored, so every later feature depends on it.

- [ ] **P2-1.1 Content model upgrade** ✍️
  - [ ] Add `board` (CBSE now; ICSE, State boards later), `class` (10, 12), `subject`, `language` to Chapter, Lesson, MCQ, Video and Chunk models
  - [ ] Write a migration script that tags all Phase 1 seed data as `board: CBSE`, `language: en`
  - [ ] Add compound indexes on `(board, class, subject, language)`
  - [ ] Update admin forms so every content item must choose board, class, subject, language
- [ ] **P2-1.2 Add Class 12 and complete Class 10 content skeleton**
  - [ ] Create chapter lists for Class 10 and Class 12 for all four subjects (titles and order only)
  - [ ] Mark which chapters will get full content, MCQs, video and virtual learning topics first
  - [ ] Seed at least 3 chapters per subject per class with lesson text (more can be added later)
- [ ] **P2-1.3 User preferences** ✍️
  - [ ] Profile stores `board`, `class`, `preferredLanguage`
  - [ ] Every content API filters by the user's profile unless overridden
  - [ ] "Change board / class / language" screen in settings
- [ ] **P2-1.4 UI translation (i18n)** 🆕
  - [ ] Install `react-i18next` and explain how translation files work
  - [ ] Move all hard-coded UI text into `en.json`
  - [ ] Create `hi.json` and the chosen regional language file
  - [ ] Language switcher in the navbar, choice saved in profile and localStorage
  - [ ] Check long words and non-Latin fonts do not break layouts (add Noto Sans fonts)
- [ ] **P2-1.5 Content translation**
  - [ ] Decide approach: admin-entered translations first, Gemini-assisted draft translation second
  - [ ] Add a "Translate this lesson" admin button that asks Gemini for a draft, saved as `status: draft`
  - [ ] Human review screen: admin approves or edits before a translated lesson goes live
  - [ ] Fallback rule: if a translation is missing, show English with a small "not available in your language" note
  - [ ] Translate at least 2 chapters per subject into Hindi and the regional language
- [ ] **P2-1.6 Multi-board readiness check**
  - [ ] Add one small non-CBSE sample chapter to prove the model works (can be removed later)
  - [ ] Confirm RAG and Saarthi filter by board (verified again in P2-2.8)

---

## P2-2. CBSE-based RAG pipeline 🆕

Goal: Saarthi and the summary tool answer from CBSE material and from the student's own notes, and show where the answer came from.
🔗 Depends on P2-1.1.

- [ ] **P2-2.1 Learn and write down the RAG idea (for viva)**
  - [ ] Write a one-page explanation in `docs/rag.md`: what RAG is, why not just prompt the LLM, what chunks, embeddings and vector search are
  - [ ] Draw the pipeline diagram (ingest, chunk, embed, store, retrieve, prompt, answer, cite)
  - [ ] Write 5 viva questions and answers about RAG
- [ ] **P2-2.2 Source documents** ⚠️
  - [ ] Collect CBSE source material for Class 10 and 12 (NCERT textbooks, CBSE syllabus, sample papers)
  - [ ] Check usage terms of each source. Keep only what is allowed for educational use and note the source on every chunk
  - [ ] Store PDFs in `content/` and list them in a `sources.md` table (title, class, subject, source, licence note)
- [ ] **P2-2.3 Ingestion script** ✍️
  - [ ] Extract text from PDFs (try `pdf-parse` or `pdfjs-dist`; use OCR in P2-6.6 for scanned pages)
  - [ ] Clean text: remove headers, footers, page numbers, broken hyphenation
  - [ ] Chunk by headings first, then by size (start with about 500 tokens and 50 token overlap)
  - [ ] Attach metadata to every chunk: `board, class, subject, chapter, page, language, source, type` (`textbook | notes | question`)
  - [ ] Save chunks in Supabase `chunks` table (linking to `documents` table)
  - [ ] Make the script re-runnable without duplicating chunks (hash each chunk)
- [ ] **P2-2.4 Embeddings and vector store (Supabase pgvector)** 🆕
  - [ ] Choose the embedding model (Gemini `text-embedding-004`, 768 dimensions) and note the vector size
  - [ ] Enable `vector` extension in Supabase (`create extension if not exists vector;`)
  - [ ] Define the `chunks` table with `id uuid`, `document_id uuid`, `content text`, `embedding vector(768)`, and metadata columns
  - [ ] Create the HNSW vector index in Supabase: `create index on chunks using hnsw (embedding vector_cosine_ops);`
  - [ ] Embed all chunks in batches using Gemini API, respecting rate limits, with retry and progress log
  - [ ] Store an `embedding_model` column so chunks can be re-embedded later if the model changes
- [ ] **P2-2.5 Retrieval service (Supabase RPC match_chunks)** ✍️
  - [ ] Create a PostgreSQL function `match_chunks(query_embedding vector(768), match_count int, filter_board text, filter_class int, filter_subject text, filter_user_id uuid)` using cosine distance `<=>`
  - [ ] Function `retrieve(query, filters, k)` that embeds the query via Gemini and invokes `supabase.rpc('match_chunks', ...)`
  - [ ] Always filter by board and class; filter by subject when known
  - [ ] Add a minimum similarity score threshold (e.g. 0.65); return "nothing relevant found" below it
  - [ ] Optional improvement: hybrid search (Postgres full-text search `tsvector` + `pgvector`) and re-ranking
  - [ ] Unit tests with 10 known questions and the chunk each should return
- [ ] **P2-2.6 Answer generation with citations** ✍️
  - [ ] Write the prompt template: role, rules, retrieved context, question, answer format
  - [ ] Rule in prompt: answer only from the context; if not found, say so and offer a general answer clearly labelled as such
  - [ ] Return answer plus sources (chapter, page) and show them in the UI
  - [ ] Keep answers at CBSE level for the student's class (simple language)
  - [ ] Reply in the student's preferred language (🔗 P2-1.3)
- [ ] **P2-2.7 User-based RAG (student's own notes)** 🆕
  - [ ] Students can upload text, PDF, or photo notes (photos handled in P2-6.6)
  - [ ] Each upload is chunked and embedded with `userId` in metadata
  - [ ] Retrieval merges two pools: CBSE chunks (shared) and the student's own chunks (private)
  - [ ] Privacy check: one user can never retrieve another user's chunks (write a test for this)
  - [ ] "My knowledge base" page: list, preview and delete uploaded notes (deleting also removes its chunks and vectors)
- [ ] **P2-2.8 Evaluate and tune**
  - [ ] Build a test set of 30 questions (about 8 per subject) with expected chapter
  - [ ] Measure: did the right chunk appear in the top 3 or top 5?
  - [ ] Try 2 chunk sizes and 2 values of `k`; record results in `docs/rag-eval.md`
  - [ ] Confirm board and class filtering works (a Class 10 question must not return Class 12 chunks)
- [ ] **P2-2.9 Admin RAG tools**
  - [ ] Admin page to upload a source PDF, pick metadata, and start ingestion
  - [ ] Show ingestion status and chunk count per document
  - [ ] Re-index and delete document buttons

---

## P2-3. Saarthi: AI mentor with context storing and 24/7 doubt solver 🆕

🔗 Depends on P2-2.6. Saarthi answers doubts (doubt solver) and remembers the student over time (mentor).

- [ ] **P2-3.1 Design Saarthi (write in `Design.md`)**
  - [ ] Personality: friendly, patient, encourages, never gives only the answer for homework without explanation
  - [ ] Scope: only STEM and study help for CBSE 10 and 12; politely refuses unrelated or unsafe topics
  - [ ] Two modes: **Doubt mode** (quick answer with steps) and **Mentor mode** (study plan, revision advice, weak topics)
  - [ ] Write the system prompt and keep it in one file `backend/src/mentor/systemPrompt.js`
- [ ] **P2-3.2 Chat data models** ✍️
  - [ ] `ChatSession` (userId, title, mode, subject, createdAt)
  - [ ] `ChatMessage` (sessionId, role, content, sources, createdAt)
  - [ ] `MemoryFact` (userId, type, text, subject, importance, createdAt, lastUsedAt)
- [ ] **P2-3.3 Chat API** ✍️
  - [ ] `POST /api/mentor/sessions` create session
  - [ ] `POST /api/mentor/sessions/:id/messages` send a message and get the reply
  - [ ] `GET /api/mentor/sessions` and `GET /api/mentor/sessions/:id` list and load history
  - [ ] `DELETE /api/mentor/sessions/:id`
  - [ ] Auth required on all routes; rate limits from P2-0.4 applied
- [ ] **P2-3.4 Prompt building with context**
  - [ ] Combine: system prompt + student profile (class, board, language) + relevant memories + last N messages + retrieved chunks (🔗 P2-2.5)
  - [ ] Count tokens and trim history so the prompt never goes over the limit
  - [ ] Log the final prompt in development mode for debugging
- [ ] **P2-3.5 Streaming replies** 🆕
  - [ ] Stream Gemini output to the browser (Server-Sent Events or fetch streaming)
  - [ ] Show a typing indicator and a Stop button
  - [ ] Handle network errors and show a "Try again" button
- [ ] **P2-3.6 Context storing (memory)** 🆕 ✍️
  - [ ] **Short-term memory:** last N messages of the session (done in P2-3.4)
  - [ ] **Long-term memory:** after each session, ask Gemini to extract facts (weak topics, goals, exam date, preferred explanation style) and save them as `MemoryFact`
  - [ ] **Session summary:** when a session gets long, store a summary and use it instead of old messages
  - [ ] Retrieve the top relevant memories for each new message (by subject and by embedding similarity)
  - [ ] "What Saarthi remembers about me" page: list, edit, delete memories (privacy and control)
  - [ ] Toggle in settings: "Let Saarthi remember me" (off means no memory is written)
- [ ] **P2-3.7 Chat UI**
  - [ ] Chat page `/mentor`, mobile first, with Saarthi avatar and quick-start chips ("Explain a concept", "Solve a numerical", "Quiz me")
  - [ ] Render markdown and maths (KaTeX) in answers
  - [ ] Show source citations under each answer with links to the chapter
  - [ ] Session list sidebar (drawer on mobile)
  - [ ] Floating "Ask Saarthi" button available on lesson, lab and virtual-learning pages, passing the page context
- [ ] **P2-3.8 Doubt from a photo**
  - [ ] Student uploads or captures a photo of a question
  - [ ] Send it to Gemini (vision) to read the question, then answer it with steps
  - [ ] Show the extracted text so the student can fix mistakes before answering
- [ ] **P2-3.9 Mentor features**
  - [ ] "Weak topics" list built from MCQ results (🔗 P2-5) and memory
  - [ ] Saarthi suggests a 7-day revision plan for a chapter
  - [ ] Saarthi can generate a quick 5-question quiz on request (uses P2-5.2)
- [ ] **P2-3.10 24/7 reliability** ⚠️
  - [ ] Handle Gemini errors, quota exhaustion and timeouts with friendly messages
  - [ ] Fallback: if the LLM fails, show the best matching chunks as a plain "From your textbook" answer
  - [ ] Uptime check and error logging (free tier tools such as UptimeRobot and basic logs)
  - [ ] Cache repeated identical questions for a short time to save quota
- [ ] **P2-3.11 Safety and quality**
  - [ ] Refusal tests: off-topic, unsafe, exam-cheating or personal-data requests
  - [ ] Thumbs up/down and "report a wrong answer" on each reply, saved for review
  - [ ] Test set of 20 doubts (5 per subject) checked by the user for correctness
  - [ ] Add a visible note: "Saarthi can make mistakes; check your textbook"

---

## P2-4. Summary (ask Gemini, upgraded)

Phase 1 already has a basic Gemini summary. This section upgrades it. 🔗 Depends on P2-2.5.

- [ ] **P2-4.1 Review Phase 1 summary** and list what to improve (length, accuracy, language)
- [ ] **P2-4.2 Summary options** ✍️
  - [ ] Choose length: short (5 bullets), medium, detailed
  - [ ] Choose style: bullet points, key formulas only, "explain like I am in Class 8"
  - [ ] Output in the student's language
- [ ] **P2-4.3 Summary sources**
  - [ ] Summarise a lesson, a whole chapter (using retrieved chunks), or the student's own uploaded note
  - [ ] Long input: split into parts, summarise each, then summarise the summaries
- [ ] **P2-4.4 Saving and caching**
  - [ ] Save generated summaries in a `Summary` collection (user, source, options, text)
  - [ ] Reuse a cached summary when the same options are requested again
  - [ ] "My summaries" list with copy, delete and "send to Notes" buttons
- [ ] **P2-4.5 Summary to flashcards** (small bonus)
  - [ ] One button turns a summary into 5 to 10 flashcards for quick revision

---

## P2-5. MCQ questions (upgraded)

🔗 Depends on P2-2.5 and P2-1.1.

- [ ] **P2-5.1 Question bank growth**
  - [ ] Add MCQs for Class 10 and 12 chapters (at least 15 per chapter for chapters that have lessons)
  - [ ] Tag each MCQ with `chapter, topic, difficulty, board, class, language`
  - [ ] Admin bulk import (CSV or JSON) with validation and error report
- [ ] **P2-5.2 AI-generated MCQs from CBSE content** 🆕
  - [ ] Generate N questions from retrieved chunks of a chapter in a fixed JSON format
  - [ ] Validate the JSON (4 options, exactly one correct answer, explanation present)
  - [ ] Store as `status: pending`; only approved questions appear to students
  - [ ] Admin review screen: approve, edit, reject
- [ ] **P2-5.3 Test modes** ✍️
  - [ ] Chapter test, mixed subject test, timed test (CBSE-style paper pattern as a stretch)
  - [ ] Scoring logic and negative marking option written by the user
  - [ ] Show explanation after each question or at the end (setting)
- [ ] **P2-5.4 Results and weak topics** ✍️
  - [ ] Store attempts per question (correct, time taken)
  - [ ] Results page with score, topic-wise accuracy and a simple chart
  - [ ] "Weak topics" list feeding Saarthi (🔗 P2-3.9)
- [ ] **P2-5.5 "Explain this answer" button** that sends the question and the student's option to Saarthi
- [ ] **P2-5.6 Offline readiness**
  - [ ] Make MCQ tests work from locally stored questions (completed in P2-12.5)

---

## P2-6. Human handwriting and notes

Meaning (assumed from the earlier context, confirm in P2-0.2): turn typed text into a realistic **handwritten-style page** (like texttohandwriting.com), and also read **photographed handwritten notes** (OCR) so they can be used by RAG.
The website `texttohandwriting.com` is only an example of the idea; build your own version.

- [ ] **P2-6.1 Notes editor basics**
  - [ ] Notes page with create, edit, delete, search, tags by subject and chapter
  - [ ] Rich text or markdown editor with maths support (KaTeX)
  - [ ] Notes saved per user and available to RAG (🔗 P2-2.7)
- [ ] **P2-6.2 Study the idea of text-to-handwriting** 🆕
  - [ ] Write down how it works: handwriting-style fonts, random small variations, paper background, drawing text on a canvas
  - [ ] Choose approach: **HTML Canvas with handwriting fonts** (default; free, works offline, easy to explain)
  - [ ] ⚠️ Use only fonts with a licence that allows web use (for example Google Fonts such as Caveat, Patrick Hand, Homemade Apple)
- [ ] **P2-6.3 Handwriting renderer** ✍️
  - [ ] Text input box and live preview on a canvas
  - [ ] Controls: font, ink colour, font size, line spacing, margin
  - [ ] Paper styles: ruled, plain, graph, with a margin line
  - [ ] Natural look: tiny random changes in letter position, rotation and baseline
  - [ ] Automatic page breaks for long text
- [ ] **P2-6.4 Export**
  - [ ] Download as PNG for one page
  - [ ] Download as PDF for multiple pages (`jsPDF` or similar)
  - [ ] "Save to my notes" stores the rendered pages and the original text
- [ ] **P2-6.5 Maths and diagrams in handwriting** (stretch)
  - [ ] Render simple formulas in a handwriting-like font
  - [ ] Allow inserting a diagram image from the interactive diagrams section
- [ ] **P2-6.6 OCR of handwritten notes** 🆕
  - [ ] Upload or capture a photo of notes
  - [ ] Extract text with Gemini vision (alternative: Tesseract.js, write the comparison in `Design.md`)
  - [ ] Show the extracted text for the student to correct
  - [ ] Save the corrected text as a note and send it to the RAG ingestion (🔗 P2-2.7)
  - [ ] Test with 10 real photos of different handwriting and lighting; record accuracy
- [ ] **P2-6.7 Offline readiness**
  - [ ] Notes and rendered pages available offline (completed in P2-12.6)

---

## P2-7. Interactive diagrams (expanded)

Phase 1 introduced SVG interaction. Here the library grows. 🔗 Depends on P2-1.2.

- [ ] **P2-7.1 Diagram component system** ✍️
  - [ ] One reusable `<InteractiveDiagram>` component: SVG, hotspots with labels, zoom and pan, tooltip, quiz mode
  - [ ] Diagrams described as JSON data (shapes, labels, hotspots) so admin can add more without code
- [ ] **P2-7.2 Biology diagrams**
  - [ ] Plant cell and animal cell
  - [ ] Human digestive system (Class 10)
  - [ ] Human reproductive system or flower parts (Class 10 / 12)
  - [ ] DNA structure (Class 12)
- [ ] **P2-7.3 Physics diagrams**
  - [ ] Ray diagrams for concave and convex mirrors and lenses (draggable object)
  - [ ] Simple electric circuit with switch, bulb, resistor
  - [ ] Magnetic field lines around a magnet or current-carrying wire
- [ ] **P2-7.4 Chemistry diagrams**
  - [ ] Periodic table with click-to-see element details
  - [ ] Electrolysis or electrochemical cell
  - [ ] Structure of carbon compounds (2D view)
- [ ] **P2-7.5 Maths diagrams**
  - [ ] Unit circle with draggable angle (also used in P2-8.9)
  - [ ] Geometry constructions (circle tangents, triangle similarity)
- [ ] **P2-7.6 Diagram features**
  - [ ] "Label the parts" quiz mode (drag labels or tap and answer)
  - [ ] Each diagram has "Ask Saarthi about this" button (🔗 P2-3.7)
  - [ ] Keyboard and screen reader labels (basic accessibility)
  - [ ] Offline: diagrams are small JSON + SVG, cache them (🔗 P2-12)

---

## P2-8. Virtual Learning section (NEW)

A new top-level section of the website: **Virtual Learning**. It holds interactive, explorable 3D / simulation topics for all four subjects. Each topic is a page where the student can rotate, play, change values and see what happens.

**Reference (for ideas only):** the demo style of `https://iamtechartist.com/demos/` and the topic pages listed below.
⚠️ Rule: study the references to understand the experience (layout, controls, learning flow), then **build our own versions**. Do not copy their code, models, text, images or assets. If any outside 3D model is used, check its licence and list it in `content/credits.md`.

### Topic list for this section

| Subject | Topic | Reference |
|---|---|---|
| Biology | Heart and circulatory system | https://iamtechartist.com/heart-and-circulatory-system/ |
| Biology | Skeleton and muscles | https://iamtechartist.com/the-13-muscles/ |
| Biology | Breathing and respiration | https://iamtechartist.com/breathing-and-respiration/ |
| Physics | Light and optics | https://iamtechartist.com/light-and-optics/ |
| Physics | Waves and sound | https://iamtechartist.com/waves-and-sound/ |
| Physics | Newton's laws of motion | https://iamtechartist.com/newtons-laws-of-motion/ |
| Chemistry | Molecule viewer + 2 examples | https://molview.org/ |
| Maths | Trigonometry (own build) | built by us |
| Maths | Conic sections (own build) | built by us |

### P2-8.0 Section foundation

- [ ] **P2-8.0.1 Plan the section**
  - [ ] Open each reference page and write notes: what the student can do, what is explained, what controls exist
  - [ ] For each of the 9 topics write a short spec in `Design.md`: learning goal, CBSE chapter link (Class 10 or 12), controls, what is shown
- [ ] **P2-8.0.2 Data model and routes** ✍️
  - [ ] `VirtualTopic` model: slug, subject, class, board, title, description, chapterId, type (`3d | graph | molecule`), config JSON, thumbnail, status
  - [ ] `GET /api/virtual` (list, filter by subject and class) and `GET /api/virtual/:slug`
  - [ ] Seed all 9 topics as `draft` until each one is finished
- [ ] **P2-8.0.3 Landing page `/virtual-learning`**
  - [ ] Four subject tabs (Maths, Physics, Chemistry, Biology) with topic cards (thumbnail, title, class)
  - [ ] Search and class filter
  - [ ] Add "Virtual Learning" to the main navigation and dashboard
- [ ] **P2-8.0.4 Topic page layout `/virtual-learning/:topic`**
  - [ ] Layout: big canvas area, side panel with controls, "Learn" tab (short explanation), "Quiz" tab (3 to 5 MCQs), "Ask Saarthi" button
  - [ ] Full-screen button and mobile layout (controls below the canvas)
  - [ ] Back link to the related lesson or chapter
- [ ] **P2-8.0.5 Shared 3D toolkit** 🆕 ✍️
  - [ ] Reusable `<Scene3D>` component for Three.js (renderer, camera, lights, orbit controls, resize handling, dispose on unmount)
  - [ ] Helper for loading `.glb` models with a loading bar (`GLTFLoader`)
  - [ ] Reusable label (annotation) component that follows a 3D point
  - [ ] Performance settings: low / high quality toggle, frame rate cap, pixel ratio limit for phones
  - [ ] Fallback message when WebGL is not available
- [ ] **P2-8.0.6 Shared 2D graph toolkit** 🆕 ✍️
  - [ ] Reusable `<GraphCanvas>` (SVG or Canvas) with axes, grid, zoom, pan, and function plotting
  - [ ] Slider component with live value and reset
  - [ ] Formula display with KaTeX that updates with the sliders
- [ ] **P2-8.0.7 Quiz and progress for topics**
  - [ ] Each topic has its own 3 to 5 MCQs stored in the MCQ bank (tag `virtualTopic`)
  - [ ] Save "topic completed" when the student finishes the quiz
  - [ ] Show completion on topic cards

### P2-8.1 Biology: Heart and circulatory system

🔗 Depends on P2-8.0.5.

- [ ] **P2-8.1.1 Model and assets**
  - [ ] Get or create a 3D heart model (self-made in Blender, or a free model with a clear licence, compressed `.glb` under 5 MB)
  - [ ] Separate parts: atria, ventricles, valves, aorta, vena cava, pulmonary artery and vein
  - [ ] Record source and licence in `content/credits.md`
- [ ] **P2-8.1.2 Interaction**
  - [ ] Rotate, zoom and click a part to see its name and function
  - [ ] Layer toggles: show/hide parts, X-ray / cut-away view
  - [ ] Colour code: oxygenated blood (red) vs deoxygenated blood (blue)
- [ ] **P2-8.1.3 Animation**
  - [ ] Heartbeat animation with a speed slider (beats per minute)
  - [ ] Blood flow animation as moving particles through the chambers in the correct order
  - [ ] Step-by-step mode: "Follow the blood" with next/previous buttons and short explanations
- [ ] **P2-8.1.4 Learning content**
  - [ ] Short notes tied to CBSE (Class 10: Life Processes; Class 12 as relevant)
  - [ ] 5 MCQs and a "label the parts" mini quiz
  - [ ] "Ask Saarthi about this" passes the topic as context
- [ ] **P2-8.1.5 Test** on a low-end phone and a laptop; fix performance and layout problems

### P2-8.2 Biology: Skeleton and muscles

- [ ] **P2-8.2.1 Model and assets**
  - [ ] Skeleton model plus major muscles (own model or properly licensed `.glb`)
  - [ ] Name list of bones and muscles to include (about 13 main muscles as in the reference idea, plus main bones)
- [ ] **P2-8.2.2 Interaction**
  - [ ] Click a bone or muscle to see name, function and type of joint or muscle action
  - [ ] Toggle layers: skeleton only, muscles only, both
  - [ ] Search box to find and highlight a part by name
- [ ] **P2-8.2.3 Animation**
  - [ ] Show muscle contraction and joint movement (for example, biceps and triceps at the elbow)
  - [ ] Slider to move the joint and see muscles change
- [ ] **P2-8.2.4 Learning content**
  - [ ] Notes linking to CBSE chapters (movement and locomotion as per syllabus)
  - [ ] 5 MCQs and a "name the bone" quiz
- [ ] **P2-8.2.5 Test** on mobile and desktop

### P2-8.3 Biology: Breathing and respiration

- [ ] **P2-8.3.1 Model and assets**
  - [ ] Respiratory system model: nose, trachea, bronchi, lungs, alveoli, diaphragm
  - [ ] Enlarged alveolus view for gas exchange
- [ ] **P2-8.3.2 Interaction and animation**
  - [ ] Inhale / exhale animation with the diaphragm and rib cage moving
  - [ ] Breathing rate slider; lungs expand and shrink with volume graph
  - [ ] Alveolus zoom showing O₂ moving into blood and CO₂ moving out
  - [ ] Click parts to see names and functions
- [ ] **P2-8.3.3 Learning content**
  - [ ] Notes linked to CBSE (Life Processes, Class 10; Breathing and Exchange of Gases, Class 11 revision for Class 12 as needed)
  - [ ] 5 MCQs and a "follow the air" step mode
- [ ] **P2-8.3.4 Test** on mobile and desktop

### P2-8.4 Physics: Light and optics

- [ ] **P2-8.4.1 Plan and ray engine** ✍️
  - [ ] Write the ray calculations yourself: reflection law, refraction (Snell's law), mirror formula, lens formula
  - [ ] Unit tests for each formula with textbook examples
- [ ] **P2-8.4.2 Simulations**
  - [ ] Mirrors: concave and convex with a draggable object, show image position, size, nature
  - [ ] Lenses: convex and concave with the same controls
  - [ ] Refraction through a glass slab and a prism with adjustable angle and refractive index
  - [ ] Optional: total internal reflection
- [ ] **P2-8.4.3 3D or 2.5D view**
  - [ ] Rays drawn in a 3D scene or a clean 2D scene (choose and justify the choice)
  - [ ] Principal axis, focus (F), centre of curvature (C) shown with labels
- [ ] **P2-8.4.4 Learning content**
  - [ ] Live table: u, v, f, magnification, image type, updating as the object moves
  - [ ] Notes for Class 10 (Light) and Class 12 (Ray Optics)
  - [ ] 5 MCQs, including numerical questions
- [ ] **P2-8.4.5 Test** the formulas against solved textbook problems

### P2-8.5 Physics: Waves and sound

- [ ] **P2-8.5.1 Wave maths** ✍️
  - [ ] Functions for wave equation, frequency, wavelength, speed, amplitude
  - [ ] Superposition of two waves
- [ ] **P2-8.5.2 Simulations**
  - [ ] Transverse and longitudinal wave animation with sliders for frequency and amplitude
  - [ ] Live graph of displacement vs time and vs position
  - [ ] Superposition and interference (constructive and destructive)
  - [ ] Standing waves on a string (stretch)
- [ ] **P2-8.5.3 Sound**
  - [ ] Play a tone using the Web Audio API 🆕 with frequency and volume controls (add a mute-safe warning)
  - [ ] Show pitch vs frequency and loudness vs amplitude
  - [ ] Echo or speed-of-sound demo (distance and time)
- [ ] **P2-8.5.4 Learning content**
  - [ ] Notes for Class 10 (Sound) and Class 12 (Waves)
  - [ ] 5 MCQs, including numerical questions
- [ ] **P2-8.5.5 Test** audio on mobile browsers (autoplay rules need a user tap)

### P2-8.6 Physics: Newton's laws of motion

- [ ] **P2-8.6.1 Physics engine choice** 🆕
  - [ ] Decide: own simple integrator (default, easier to explain) or a library such as `cannon-es`; write the reason
  - [ ] ✍️ Write the force, acceleration and motion update yourself
- [ ] **P2-8.6.2 Simulations (one scene per law)**
  - [ ] First law: object keeps moving or staying at rest; friction on/off
  - [ ] Second law: apply force and change mass; show F = ma with live graphs (a vs F, a vs m)
  - [ ] Third law: two carts or skaters pushing each other, equal and opposite forces with arrows
  - [ ] Momentum and collisions (stretch)
- [ ] **P2-8.6.3 Visuals**
  - [ ] Force arrows scaled to size, velocity and acceleration readouts, reset and slow-motion controls
- [ ] **P2-8.6.4 Learning content**
  - [ ] Notes for Class 11 basics revised for Class 12 and Class 10 force and motion as per syllabus
  - [ ] 5 MCQs and numerical practice linked to the simulation values
- [ ] **P2-8.6.5 Test** accuracy against hand calculation

### P2-8.7 Chemistry: Molecule viewer (MolView-style) with 2 examples

Reference: `https://molview.org/` (a molecule viewer where users search a compound and rotate it in 3D).
Assumption: build our own simple viewer and ship **2 worked examples**. Default examples: **Water (H₂O)** and **Ethanol (C₂H₅OH)**. Change them in P2-0.2 if you prefer others (for example methane or benzene).

- [ ] **P2-8.7.1 Choose the technology** 🆕
  - [ ] Use an open-source viewer such as **3Dmol.js** (or Three.js with own atoms and bonds) and write the reason
  - [ ] Check the licence of the library and of the data source
- [ ] **P2-8.7.2 Data**
  - [ ] Get 3D structure data (SDF or similar) from a public source such as PubChem and save the two examples locally so they work offline
  - [ ] Store molecule metadata: name, formula, molar mass, bond type, uses
- [ ] **P2-8.7.3 Viewer**
  - [ ] Show molecule in ball-and-stick, space-filling and wireframe styles with a style switch
  - [ ] Rotate, zoom, atom labels, bond lengths and angles on click
  - [ ] Element colour key (CPK colours)
- [ ] **P2-8.7.4 Example 1: Water (H₂O)**
  - [ ] Show bent shape and bond angle, polarity arrows, partial charges
  - [ ] Short explanation (covalent bond, polar molecule) with 3 MCQs
- [ ] **P2-8.7.5 Example 2: Ethanol (C₂H₅OH)**
  - [ ] Show the carbon chain and the -OH functional group highlighted
  - [ ] Short explanation (carbon compounds, functional groups, Class 10 Carbon and its Compounds) with 3 MCQs
- [ ] **P2-8.7.6 Search (stretch)**
  - [ ] Search box to load any molecule by name through the PubChem public API
  - [ ] Cache results, handle "not found" and slow network
- [ ] **P2-8.7.7 Test** on mobile (touch rotate) and with network off for the two saved examples

### P2-8.8 Maths: Trigonometry (own build)

- [ ] **P2-8.8.1 Maths and spec** ✍️
  - [ ] Write functions for sin, cos, tan, their reciprocals and identities using degrees and radians
  - [ ] Plan the screens: unit circle, graphs, right triangle, heights and distances
- [ ] **P2-8.8.2 Unit circle simulation**
  - [ ] Draggable angle on the unit circle with sin, cos and tan shown as live lengths
  - [ ] Table of standard angles (0°, 30°, 45°, 60°, 90°) highlighted when reached
  - [ ] Degrees / radians switch
- [ ] **P2-8.8.3 Graph simulation**
  - [ ] Plot y = a·sin(bx + c) + d with sliders for a, b, c, d
  - [ ] Plot cos and tan with asymptotes; show period and amplitude
  - [ ] Show formula in KaTeX that updates live
- [ ] **P2-8.8.4 Right triangle and applications (Class 10)**
  - [ ] Drag the triangle to see sin, cos, tan of an angle from the sides
  - [ ] Heights and distances scene: angle of elevation and depression with a movable observer
- [ ] **P2-8.8.5 Identity checker**
  - [ ] Check sin²θ + cos²θ = 1 and other identities with live numeric proof
- [ ] **P2-8.8.6 Learning content**
  - [ ] Notes for Class 10 (Introduction to Trigonometry, Applications) and Class 12 (Inverse Trigonometric Functions)
  - [ ] 5 MCQs and a few "find the value" practice questions
- [ ] **P2-8.8.7 Test** values against a calculator for at least 20 angles

### P2-8.9 Maths: Conic sections (own build)

- [ ] **P2-8.9.1 Maths and spec** ✍️
  - [ ] Write the equations: circle, parabola, ellipse, hyperbola (standard forms, focus, directrix, eccentricity)
  - [ ] Plan: a graph view and a 3D "cone cut by a plane" view
- [ ] **P2-8.9.2 Graph view**
  - [ ] Choose a conic type and change parameters with sliders (radius, a, b, focal length)
  - [ ] Show focus or foci, directrix, vertices, axes, eccentricity live
  - [ ] Formula panel updating in KaTeX
- [ ] **P2-8.9.3 Cone slicing view** 🆕
  - [ ] 3D double cone with a movable and tiltable plane
  - [ ] The cross-section curve is shown and named (circle, ellipse, parabola, hyperbola) as the plane angle changes
  - [ ] Link the 3D view and the graph view so changing one updates the other
- [ ] **P2-8.9.4 Locus demo**
  - [ ] Show the definition: a point moving so that distance to focus / directrix has a fixed ratio, tracing the curve
- [ ] **P2-8.9.5 Learning content**
  - [ ] Notes for Class 12 (conic sections as per the current CBSE syllabus; confirm the chapter) and Class 10 (circles)
  - [ ] 5 MCQs and practice questions
- [ ] **P2-8.9.6 Test** shapes against known equations and verify eccentricity values

### P2-8.10 Section finish

- [ ] **P2-8.10.1 Publish topics**
  - [ ] All 9 topics changed from `draft` to `published` after their tests pass
- [ ] **P2-8.10.2 Performance pass** ⚠️
  - [ ] Lazy-load Three.js and each topic's code so the main app stays fast (route-based code splitting)
  - [ ] Keep each model under 5 MB and total page load reasonable on 4G
  - [ ] Test on one low-end Android phone
- [ ] **P2-8.10.3 Credits and licences**
  - [ ] `content/credits.md` lists every model, font, library and data source with licence
  - [ ] Credits page in the app footer
- [ ] **P2-8.10.4 Offline readiness**
  - [ ] Decide which topics are cached offline (small ones: maths, molecule examples, waves) and which are online only (large 3D models); show this in the UI (completed in P2-12.7)

---

## P2-9. 3D virtual labs (experiments)

Different from Section 8: Virtual Learning explains a concept; **Labs** are step-by-step **experiments** with apparatus, measurements and a result sheet, aligned to CBSE practicals.
Phase 1 delivered the simple pendulum. 🔗 Depends on P2-8.0.5.

- [ ] **P2-9.1 Lab framework** ✍️
  - [ ] `Lab` model: title, subject, class, aim, apparatus list, steps, observation table template, expected result, viva questions
  - [ ] Lab page layout: aim, apparatus, 3D bench, steps panel, observation table, result and conclusion, viva questions
  - [ ] Step system: the student must do steps in order; wrong action shows a hint
  - [ ] Save lab attempts and show them on the profile
  - [ ] Saarthi button for help with the current step
- [ ] **P2-9.2 Physics labs**
  - [ ] **Simple pendulum** (from Phase 1): verify it works inside the new framework and add observation table
  - [ ] **Ohm's law** (Class 10/12): circuit with battery, rheostat, ammeter, voltmeter; plot V vs I graph automatically
  - [ ] **Refraction through a glass slab / focal length of a lens** (Class 10/12): ray tracing on a 3D bench
  - [ ] Optional: metre bridge (Class 12)
- [ ] **P2-9.3 Chemistry labs**
  - [ ] **Acid-base titration** (Class 12 practical idea): burette, conical flask, indicator colour change, reading the endpoint, calculating concentration
  - [ ] **Testing acids and bases with litmus / pH indicators** (Class 10)
  - [ ] **Reactions of metals with salt solutions or displacement reactions** (Class 10)
  - [ ] Safety rules shown at the start of every chemistry lab
- [ ] **P2-9.4 Biology labs**
  - [ ] **Using a microscope** to view an onion peel and a stomata slide (Class 10/12)
  - [ ] **Osmosis experiment** (potato osmoscope) (Class 12)
  - [ ] Optional: pollen germination or mitosis in onion root tip slide viewing
- [ ] **P2-9.5 Lab scoring and feedback**
  - [ ] Check observations against expected range and show the percentage error
  - [ ] Generate a downloadable lab report PDF with aim, observations and result
- [ ] **P2-9.6 Test**
  - [ ] Each lab completed from start to finish on mobile and desktop
  - [ ] Wrong-order and wrong-value cases handled without crashes
- [ ] **P2-9.7 Offline readiness**
  - [ ] Cache lab definitions and lightweight assets (completed in P2-12.7)

---

## P2-10. AI-based videos (dummy videos for chapters)

User note: "just give dummy videos". Real AI-generated videos are produced with a tool (for example pdftovideo.ai, or any other text/PDF-to-video tool); the project must have **at least one video for one chapter in each subject**, and the pipeline for adding more.

- [ ] **P2-10.1 Video plan**
  - [ ] Choose 4 chapters (one per subject) and, if time allows, 8 (two per subject)
  - [ ] For each, write a short storyboard/script (60 to 180 seconds) in `content/video-scripts/`
  - [ ] Decide the language of each (English first; Hindi version as stretch)
- [ ] **P2-10.2 Produce the videos** ⚠️
  - [ ] Try a PDF/text-to-video tool (for example pdftovideo.ai) using the chapter notes as input and note the free-tier limits and any watermark
  - [ ] If the tool is not usable, make dummy videos from slides plus narration (any screen recorder or video editor) so the platform can be tested
  - [ ] Label placeholder videos clearly as `dummy: true` in the data so they can be replaced later
  - [ ] Export in web-friendly MP4 (H.264), 720p, small size; also make a 360p version for slow networks
  - [ ] Create a thumbnail and subtitles file (`.vtt`) for each video
- [ ] **P2-10.3 Data model and API** ✍️
  - [ ] `Video` model: title, subject, class, board, language, chapterId, url, thumbnail, duration, subtitles, dummy flag, size
  - [ ] `GET /api/videos` (filters) and `GET /api/videos/:id`
  - [ ] Admin upload and edit form (with the metadata)
- [ ] **P2-10.4 Hosting** ⚠️
  - [ ] Choose a host: Cloudinary free tier, unlisted YouTube embeds, or Cloudflare R2 / S3. Write the reason and the limit
  - [ ] Do not store large video files in the Git repository
  - [ ] Add the video URLs through the admin panel
- [ ] **P2-10.5 Video pages**
  - [ ] `/videos` list with filters (subject, class, language)
  - [ ] Player page with play speed, quality choice (360p/720p), subtitles on/off
  - [ ] "Chapter videos" block on each lesson page
  - [ ] Remember watch progress per user (resume where they left)
- [ ] **P2-10.6 Video + Saarthi**
  - [ ] Store the video transcript as RAG chunks (`type: video`) so Saarthi can answer from it and cite the timestamp
  - [ ] "Ask about this video" button passes the transcript context
- [ ] **P2-10.7 Offline readiness**
  - [ ] Decide the offline lecture format: downloadable 360p video or audio plus transcript (completed in P2-12.8)

---

## P2-11. Community (Discord)

- [ ] **P2-11.1 Create and set up the Discord server**
  - [ ] Server name, icon, rules and welcome message
  - [ ] Channels: `#announcements`, `#rules`, `#general`, one per subject, one per class (10 and 12), `#doubts`, `#study-groups`, `#showcase`
  - [ ] Roles: Admin, Mentor, Student, plus class roles; set permissions so only admins post in announcements
  - [ ] Turn on moderation settings (verification level, spam filters)
- [ ] **P2-11.2 Safety for students** ⚠️
  - [ ] Write community guidelines (respect, no personal data sharing, no cheating)
  - [ ] Add report/contact instructions and at least 2 moderators
  - [ ] Note the age rules of Discord and mention them on the join page (since many users are school students)
- [ ] **P2-11.3 Website integration**
  - [ ] `/community` page with join button, rules and channel list
  - [ ] Embed the Discord server widget (member count, online users)
  - [ ] "Join community" link in navbar, footer and dashboard
  - [ ] Invite link set not to expire and kept in an environment variable
- [ ] **P2-11.4 Automation (webhook)** 🆕
  - [ ] Create a Discord webhook and call it from the backend
  - [ ] Post to `#announcements` when admin publishes new content (new chapter, video, lab)
  - [ ] Keep the webhook URL secret in `.env`
- [ ] **P2-11.5 Optional Discord bot** 🆕 (stretch)
  - [ ] Simple bot with `discord.js` that posts a "Question of the day" MCQ
  - [ ] Optional `/ask` command using the same RAG and Saarthi service (with rate limits)
- [ ] **P2-11.6 Optional account linking** (stretch)
  - [ ] "Login with Discord" or link Discord username to the profile
  - [ ] Auto-assign class role based on profile

---

## P2-12. Offline mode (questions, lectures, notes) 🆕

🔗 Depends on P2-5, P2-6, P2-7, P2-8, P2-9 and P2-10 (to know what to store).
Approach: turn the website into a **PWA** (Progressive Web App) with a service worker and IndexedDB. This also becomes the base of the mobile app in Section 13.

- [ ] **P2-12.1 Learn PWA basics (for viva)**
  - [ ] Write `docs/pwa.md`: manifest, service worker, cache vs IndexedDB, online/offline events, background sync
  - [ ] Decide the tool: `vite-plugin-pwa` (Workbox), and write why
- [ ] **P2-12.2 PWA setup**
  - [ ] Web app manifest: name, icons (192, 512, maskable), theme colour, `display: standalone`
  - [ ] Register the service worker; app is installable on Android and desktop
  - [ ] Offline fallback page
- [ ] **P2-12.3 Caching strategy** ✍️
  - [ ] App shell (HTML, JS, CSS, fonts, icons): precache
  - [ ] API data for lessons, questions, notes: network-first with cache fallback or stale-while-revalidate (choose per route and justify)
  - [ ] Images and thumbnails: cache-first with size limits
  - [ ] Cache versioning and cleanup of old caches
- [ ] **P2-12.4 Local database (IndexedDB)** 🆕
  - [ ] Use Dexie.js (or `idb`) and define stores: `lessons`, `questions`, `attempts`, `notes`, `downloads`, `syncQueue`
  - [ ] Wrapper functions for read/write kept in `frontend/src/offline/`
- [ ] **P2-12.5 Offline questions**
  - [ ] "Download for offline" per chapter downloads its MCQs into IndexedDB
  - [ ] Tests run entirely from local data and scoring works offline (the same scoring code as online)
  - [ ] Attempts are stored locally and synced when the network returns
- [ ] **P2-12.6 Offline notes**
  - [ ] Notes can be viewed, created and edited offline
  - [ ] Handwritten-style pages (images) cached
  - [ ] Sync queue with conflict rule (last edit wins, show a note when a conflict was resolved)
- [ ] **P2-12.7 Offline lessons and light interactive content**
  - [ ] Lesson text, diagrams (SVG/JSON) and small virtual-learning topics (maths, molecule examples) cached on request
  - [ ] Big 3D models are marked "online only" or downloadable with a size warning
- [ ] **P2-12.8 Offline lectures (videos)** ⚠️
  - [ ] Download choice: 360p video or audio-only plus transcript
  - [ ] Show storage used and a "Remove download" button
  - [ ] Store large media with the Cache Storage API, not localStorage; handle storage quota errors
- [ ] **P2-12.9 Offline UX**
  - [ ] Online/offline indicator and a banner when offline
  - [ ] `/offline` page listing everything downloaded
  - [ ] Disable or label features that need the internet (Saarthi, RAG, translation); show helpful text instead of errors
- [ ] **P2-12.10 Sync** ✍️
  - [ ] Background sync (where supported) or sync on reconnect for attempts and notes
  - [ ] Avoid duplicates using client-generated IDs
- [ ] **P2-12.11 Test offline**
  - [ ] Use browser DevTools offline mode and airplane mode on a real phone
  - [ ] Checklist: open the app, take a test, read a note, open a lesson, play a downloaded lecture, then go online and confirm sync

---

## P2-13. Mobile app

🔗 Depends on P2-12 (PWA). The app should feel like a real app, not just a bookmark.

- [ ] **P2-13.1 Decide the approach (write in `Design.md`)**
  - [ ] Options: (a) installable PWA only, (b) **Capacitor** wrapping the existing React app (default; reuse the same code), (c) React Native / Expo (rewrite)
  - [ ] Write 3 reasons for the final choice (time, code reuse, features needed)
- [ ] **P2-13.2 Mobile polish of the web app**
  - [ ] Safe areas, bottom navigation on small screens, touch-sized buttons
  - [ ] Splash screen, app icon and theme colours
  - [ ] Back button behaviour and pull-to-refresh where useful
- [ ] **P2-13.3 Build the app** 🆕
  - [ ] Add Capacitor to the project and create the Android project (`android/`)
  - [ ] Point the app to the production API (environment config)
  - [ ] Build a debug APK and install it on a real phone
- [ ] **P2-13.4 Native features**
  - [ ] Camera for scanning notes and doubts (🔗 P2-3.8, P2-6.6)
  - [ ] File access for downloads and handwriting export
  - [ ] Optional: push notifications for study reminders and new content
- [ ] **P2-13.5 Test on devices**
  - [ ] Test on at least one low-end Android phone and one newer phone
  - [ ] Test slow network and offline mode inside the app
  - [ ] Check 3D topics, labs and video playback inside the app webview
- [ ] **P2-13.6 Release**
  - [ ] Build a signed release APK/AAB
  - [ ] Share the APK via the website download link
  - [ ] Optional: Google Play internal testing track (needs a developer account and fee)
  - [ ] iOS is out of scope unless a Mac and a developer account are available

---

## P2-14. Admin panel updates

- [ ] **P2-14.1 Content management for new features**
  - [ ] Manage Virtual Learning topics (status, config, quiz questions)
  - [ ] Manage Labs (steps, apparatus, expected values)
  - [ ] Manage Videos (upload metadata, dummy flag, transcript)
  - [ ] Manage RAG documents (🔗 P2-2.9)
  - [ ] Review queues: AI-generated MCQs (🔗 P2-5.2), draft translations (🔗 P2-1.5), reported Saarthi answers (🔗 P2-3.11)
- [ ] **P2-14.2 Basic analytics**
  - [ ] Counts: users, Saarthi questions per day, most used topics and labs, most asked subjects
  - [ ] AI usage and quota status panel

---

## P2-15. Testing, security, performance and deployment

- [ ] **P2-15.1 Security checks** ⚠️
  - [ ] All AI keys only on the server; check the frontend bundle contains no secrets
  - [ ] Validate and size-limit all uploads (type, size) and scan filenames
  - [ ] Protect against prompt injection from uploaded notes (treat retrieved text as data, not instructions) and write a test
  - [ ] User data isolation tests (notes, chats, memories, chunks)
  - [ ] CORS, helmet and rate limiting reviewed
- [ ] **P2-15.2 Privacy**
  - [ ] Privacy page explaining what Saarthi stores and why
  - [ ] "Delete my data" button removing chats, memories, notes, chunks and vectors
  - [ ] Extra care for students under 18 (no unnecessary personal data)
- [ ] **P2-15.3 Automated tests**
  - [ ] Unit tests for scoring, retrieval, ray and physics formulas, trig and conic functions
  - [ ] API tests for the main routes
  - [ ] One end-to-end test of the main flow (login, open lesson, ask Saarthi, take MCQ) with Playwright or Cypress
- [ ] **P2-15.4 Performance**
  - [ ] Lighthouse run on the main pages and fix big issues
  - [ ] Code splitting for Three.js, labs and virtual topics
  - [ ] Compress images, models and videos
  - [ ] Database indexes checked for common queries
- [ ] **P2-15.5 Accessibility and usability**
  - [ ] Keyboard navigation, readable contrast, alt text, text-size option
  - [ ] Test with 3 real students (Class 10 or 12) and note feedback
- [ ] **P2-15.6 Deployment**
  - [ ] Update environment variables on the host (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`)
  - [ ] Deploy backend and frontend; check Supabase pgvector HNSW index and database connection in production
  - [ ] Set up error monitoring and uptime checks
  - [ ] Backup plan for the database and `content/`
- [ ] **P2-15.7 Documentation and demo**
  - [ ] Update `README.md` with setup steps and screenshots
  - [ ] Architecture diagram covering RAG, Saarthi, offline sync and the app
  - [ ] Demo script of 5 minutes (Virtual Learning, a lab, Saarthi with citations, offline mode, app on phone)
  - [ ] Viva sheet: 25 questions and answers covering RAG, embeddings, memory, PWA, Three.js, i18n and security
  - [ ] Tag release `v2.0`

---

## Final acceptance checklist (Phase 2 is done only when all are `[x]`)

- [ ] A student can pick **CBSE, Class 10 or 12, and a language**, and all content follows that choice
- [ ] Saarthi answers CBSE doubts at any time, with sources, in the chosen language, and remembers the student across sessions (with the ability to view and delete memory)
- [ ] RAG works with both CBSE content and the student's own notes, and user data stays private
- [ ] Gemini summary has length/style options and works on lessons and notes
- [ ] MCQs include AI-generated, admin-approved questions, timed tests and weak-topic results
- [ ] Typed text can be turned into handwriting-style pages (PNG/PDF), and photographed handwritten notes can be read by OCR
- [ ] Interactive diagrams exist for all four subjects
- [ ] **Virtual Learning** section has all 9 topics published: heart, skeleton and muscles, respiration, light and optics, waves and sound, Newton's laws, molecule viewer with 2 examples, trigonometry, conic sections
- [ ] 3D labs exist for physics, chemistry and biology, with observation tables and lab reports
- [ ] At least one video per subject plays on the site (dummy videos allowed), with subtitles and progress saving
- [ ] The Discord community is set up and linked from the site
- [ ] Questions, lectures and notes work offline and sync when back online
- [ ] The Android app installs and runs the full website features
- [ ] Security, privacy, performance and deployment tasks are finished and the demo and viva sheet are ready

---

## Appendix A. Difficulty guide (hardest first)

1. CBSE RAG pipeline and user-based RAG (new concepts: chunking, embeddings, vector search, evaluation)
2. Saarthi memory (context storing) and prompt building
3. Offline mode with sync (service worker, IndexedDB, conflicts)
4. 3D models and animations for the Virtual Learning section (asset creation, performance on phones)
5. 3D labs with step logic
6. Conic cone-slicing and ray-optics simulations (maths and visuals together)
7. Handwriting renderer and OCR
8. Mobile app build and device testing
9. Multi-language content
10. AI video production (tool limits)
11. Discord community (easy, mostly setup)
12. Summary and MCQ upgrades (closest to Phase 1)

## Appendix B. Non-code risks

- **Content volume:** two classes x four subjects is a lot; ship a few good chapters per subject first, then add more
- **3D assets:** good free models are limited; plan time for Blender or searching for properly licensed models
- **Licences:** textbooks, 3D models, fonts and videos each have terms; record them in `content/credits.md`
- **Free-tier limits:** Gemini quota, Supabase storage & PostgreSQL database (500MB DB with native pgvector, 1GB storage buckets), video hosting and bandwidth
- **Low-end phones:** 3D and video must have low-quality modes
- **Accuracy:** AI answers and AI-generated MCQs must be checked by a human before students rely on them
- **Time:** course sections to finish by 1 January and December exams; start Phase 2 sections only after Phase 1 is deployed, and take Sections 1 to 5 first

## Appendix C. Useful repos and references (remind the user when relevant)

- `Arindam200/awesome-ai-apps`: examples of LLM, RAG, agent and MCP apps (use for Sections 2 and 3)
- `public-apis/public-apis`: free APIs (for example science and chemistry data sources, relevant to Section 8.7)
- Reference sites for Virtual Learning: `https://iamtechartist.com/demos/` and the topic pages listed in Section 8; `https://molview.org/` for the chemistry viewer idea
- Idea site for handwriting: `https://texttohandwriting.com/` (example only; build your own)
- Idea site for AI videos: `pdftovideo.ai` (example only; any tool is fine)
