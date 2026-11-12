# Tasks.md: STEM Education Platform

How to use this file:
- Do the tasks **in order**. Each one is small enough to finish in one sitting.
- Tick the box only when the **Done when** line is true.
- **NEW** means a technology you haven't learned yet. Learn it step by step first (a tiny practice project), then use it here.
- **Hand-write** means write the code yourself (no copy-paste generation) so you can explain it.
- Source of truth: `PRD.md` (what) and `Design.md` (how).

---

## Phase 0: Setup

- [x] **0.1 Create the project folder and Git repo**
  Make `project-name/` with `frontend/`, `backend/`, `PRD.md`, `Tasks.md`, and a `.gitignore` (node_modules, .env).
  Done when: the repo is pushed to GitHub with this structure.

- [x] **0.2 Write Design.md (part 1: pages and data models)**
  List every page, and the MongoDB collections with their fields: `User`, `Subject`, `Chapter`, `Lesson`, `Question`, `TestResult`, `Progress`, `Diagram`, `Lab`.
  Done when: every field has a type and a one-line purpose.

- [x] **0.3 Write Design.md (part 2: API routes)**
  List every route with method, path, who can call it, request and response shape.
  Done when: each MVP feature in PRD.md has the routes it needs.

- [x] **0.4 Decide the v1 content scope**
  Pick the board, classes, language, and one chapter per subject (4 chapters total).
  Done when: the four chapter names are written in Design.md.

---

## Phase 1: Backend foundation (`backend/`)

- [x] **1.1 Initialise the Node project**
  `npm init`, install `express`, `mongoose`, `dotenv`, `cors`, `nodemon`.
  Done when: `npm run dev` starts a server.

- [x] **1.2 Basic Express server and health route**
  Create `server.js` with `GET /api/health`.
  Done when: opening the URL returns `{ status: "ok" }`.

- [x] **1.3 Connect to MongoDB**
  Use MongoDB Atlas free tier; keep the connection string in `.env`.
  Done when: the server logs "DB connected" on start.

- [x] **1.4 Folder structure**
  Create `models/`, `routes/`, `controllers/`, `middleware/`, `utils/`.
  Done when: the folders exist and `server.js` mounts a routes index.

- [x] **1.5 Central error handler**
  Hand-write an error-handling middleware that returns `{ message }` with a proper status code.
  Done when: a thrown error in a test route returns clean JSON, not a stack trace.

---

## Phase 2: Authentication (hand-write)

- [x] **2.1 User model**
  Fields: name, email or phone, passwordHash, role (`student` / `admin`), class, board, language.
  Done when: you can create a user from a test script.

- [x] **2.2 Signup route**
  Validate input, hash the password with `bcrypt`, save the user.
  Done when: signing up twice with the same email returns a clear error.

- [x] **2.3 Login route and JWT**
  Check the password, return a signed JWT.
  Done when: a wrong password returns 401; a right one returns a token.

- [x] **2.4 Auth middleware**
  Hand-write `requireAuth` (verify token) and `requireAdmin` (role check).
  Done when: a protected test route rejects missing, invalid and non-admin tokens.

- [x] **2.5 Profile routes**
  `GET /api/me` and `PUT /api/me` (change class, board, language).
  Done when: updating the class changes what `GET /api/me` returns.

---

## Phase 3: Content models and APIs (`backend/`)

- [x] **3.1 Subject and Chapter models + routes**
  `GET /api/subjects`, `GET /api/subjects/:id/chapters` (filtered by the student's board, class, language).
  Done when: a test chapter shows up only for the matching profile.

- [x] **3.2 Lesson model + routes**
  `GET /api/chapters/:id/lessons`, `GET /api/lessons/:id`.
  Done when: a lesson returns its title and content blocks (text, image).

- [x] **3.3 Progress tracking**
  `POST /api/lessons/:id/complete`, and chapter progress percentage.
  Done when: completing 2 of 4 lessons shows 50%.

- [x] **3.4 Question model + test routes**
  `GET /api/chapters/:id/test` returns questions **without** correct answers.
  Done when: the response has no `correctIndex` field.

- [x] **3.5 Scoring route (hand-write)**
  `POST /api/chapters/:id/test/submit` scores on the server and returns score plus explanations.
  Done when: a known set of answers gives the expected score.

- [x] **3.6 Result history**
  Save each attempt in `TestResult`; `GET /api/results`.
  Done when: two attempts both appear, newest first.

---

## Phase 4: Frontend foundation (`frontend/`)

- [x] **4.1 Create the React app**
  Use Vite + React; install `react-router-dom`.
  Done when: the starter page loads.

- [x] **4.2 Folder structure and routes**
  Create `pages/`, `components/`, `services/`, `context/`; set up the routes from PRD section 7.
  Done when: each route shows a placeholder page.

- [x] **4.3 API service layer**
  One file that wraps `fetch` and attaches the token.
  Done when: the health route is called from the frontend.

- [x] **4.4 Auth context**
  Hand-write login state, token storage, and a `ProtectedRoute` component.
  Done when: opening `/dashboard` while logged out redirects to `/login`.

- [x] **4.5 Signup and login pages**
  Done when: a new user can sign up, choose class / board / language, and land on the dashboard.

- [x] **4.6 Mobile-first layout**
  Bottom tab bar (Home / Learn / Practice / Profile), colour tokens from PRD section 6.
  Done when: the layout looks right at 375px width.

---

## Phase 5: Lessons UI

- [x] **5.1 Subjects page**
  Done when: the four subjects show as cards.

- [x] **5.2 Chapter page**
  Lessons list with a progress bar.
  Done when: completed lessons show a tick.

- [x] **5.3 Lesson reader**
  Render text and image blocks; "Mark as complete" button.
  Done when: marking complete updates the progress bar.

- [x] **5.4 Dashboard**
  Continue learning, progress per subject, recent scores.
  Done when: it reflects real data from the API.

---

## Phase 6: MCQ practice

- [x] **6.1 Test page**
  Show one question at a time with options.
  Done when: you can move through all questions.

- [x] **6.2 Submit and result screen**
  Send answers, show score and an explanation for each question.
  Done when: right and wrong answers are marked with an icon **and** text (not colour alone).

- [x] **6.3 Results history page**
  Done when: past attempts are listed.

- [x] **6.4 Handle edge cases**
  Empty chapter (no questions), leaving the test midway.
  Done when: neither case shows an error screen.

---

## Phase 7: AI summary with Gemini (**NEW: LLM API calls**)

- [x] **7.1 Learn the basics**
  Get a free Gemini API key; in a throwaway script, send a prompt and print the reply.
  Done when: you can explain request, response, tokens and rate limits in your own words.

- [x] **7.2 Backend summary route**
  `POST /api/lessons/:id/summary` calls Gemini with the lesson text.
  Done when: the key is in `.env` only and the route returns a summary.

- [x] **7.3 Prompt design**
  Write a prompt for a simple, short, student-level summary in the chosen language.
  Done when: summaries for all 4 demo chapters read well.

- [x] **7.4 Cache summaries**
  Store the summary per lesson and language in MongoDB.
  Done when: the second request returns instantly without calling Gemini.

- [x] **7.5 Error handling**
  Handle timeout, rate limit and a too-long lesson.
  Done when: each case shows a friendly message and a retry button.

- [x] **7.6 Summarise button in the lesson reader**
  Bottom sheet with a loading state.
  Done when: the whole flow works end to end.

---

## Phase 8: Interactive diagrams (**NEW: SVG / canvas interaction**)

- [ ] **8.1 Learn SVG basics**
  Practice: draw shapes, add click handlers, change colours on hover or tap.
  Done when: you can make a shape that reacts to a tap.

- [ ] **8.2 Diagram data format**
  Define a JSON format: parts, labels, coordinates, explanations. Store it in the `Diagram` collection.
  Done when: one diagram is described fully in JSON.

- [ ] **8.3 Diagram component**
  A React component that renders any diagram from JSON and shows an explanation panel on tap.
  Done when: tapping a part shows its explanation.

- [ ] **8.4 Biology diagram**: plant or animal cell.
- [ ] **8.5 Chemistry diagram**: periodic table (check public-apis/public-apis for free element data).
- [ ] **8.6 Physics diagram**: a simple circuit or the lens ray diagram.
  Done when (8.4 to 8.6): each works by touch on a phone.

- [ ] **8.7 Embed diagrams in lessons**
  Done when: a lesson can include a diagram block.

---

## Phase 9: Virtual lab (**NEW: Three.js / 3D in the browser**)

- [ ] **9.1 Learn Three.js basics**
  Practice: scene, camera, renderer, a cube that rotates, then mouse or touch controls.
  Done when: you understand the render loop.

- [ ] **9.2 Pick the v1 experiment**
  Recommended: a simple pendulum (Physics), because it needs only simple maths.
  Done when: the experiment is written in Design.md with its variables and expected results.

- [ ] **9.3 Build the scene**
  Done when: the pendulum swings on screen.

- [ ] **9.4 Add controls**
  Sliders for length and mass (hand-write the physics maths).
  Done when: changing the length changes the period correctly.

- [ ] **9.5 Instructions and observation quiz**
  Step list plus 3 to 5 questions scored like MCQs.
  Done when: finishing the lab saves a result.

- [ ] **9.6 Performance and fallback**
  Test on a mid-range phone; show a message when WebGL is not supported.
  Done when: no crash on unsupported devices.

---

## Phase 10: Admin (hand-write)

- [ ] **10.1 Admin routes in the backend**
  CRUD for subjects, chapters, lessons, questions, diagrams (protected by `requireAdmin`).
  Done when: a non-admin gets 403.

- [ ] **10.2 Admin pages**
  Simple forms to add and edit content.
  Done when: a new chapter you add shows up for students.

- [ ] **10.3 Delete safely**
  Confirm before deleting content that has student progress.
  Done when: progress data stays consistent after a delete.

---

## Phase 11: Seed, polish, deploy

- [ ] **11.1 Seed script**
  One script loads 4 chapters (one per subject), lessons, and 10+ MCQs each. It must be safe to run twice.
  Done when: a fresh database becomes demo-ready with one command.

- [ ] **11.2 Check against PRD section 8**
  Go through all 11 acceptance criteria one by one.
  Done when: every one passes.

- [ ] **11.3 Security pass**
  No API keys in the frontend, passwords hashed, protected routes tested, `.env` not committed.
  Done when: you can show each item.

- [ ] **11.4 Deploy**
  Backend on a free host, frontend on a free static host.
  Done when: the public link works on your phone.

- [ ] **11.5 README and demo script**
  Done when: someone else can run the project from the README.
