# NeuroLearn Hackathon Implementation Plan

This implementation plan is based on the analysis of `PRD.doc`, `techstack.doc`, and `design.doc`. It is structured for a 24-hour hackathon timeline, prioritizing core flows and "wow" factors for judges.

---

## 🚀 Phase 1: Project Initialization & Setup (Hour 0-2)

### 1.1 Repo & Environment
- [ ] Initialize Git repository (already done).
- [ ] Set up Monorepo structure (optional) or separate folders: `client` and `server`.
- [ ] Create `.env` examples for both client and server.

### 1.2 Database & Auth (Supabase + MongoDB)
- [ ] **Supabase:** New project setup.
    - [ ] Enable OAuth (Google/GitHub).
    - [ ] Get API Keys (`SUPABASE_URL`, `SUPABASE_ANON_KEY`).
- [ ] **MongoDB Atlas:** New cluster setup.
    - [ ] Whitelist IP.
    - [ ] Create Database: `neurolearn_db`.
    - [ ] Get Connection String (`MONGO_URI`).

### 1.3 Tech Stack Scaffolding
- [ ] **Frontend:** `npm create vite@latest client -- --template react-ts`
    - [ ] Install dependencies: `tailwindcss`, `postcss`, `autoprefixer`.
    - [ ] Install UI libs: `shadcn/ui`, `framer-motion`, `lucide-react`, `react-router-dom`.
    - [ ] Initialize shadcn: `npx shadcn-ui@latest init`.
- [ ] **Backend:** Python Environment Setup.
    - [ ] `python -m venv venv`
    - [ ] Install dependencies: `fastapi`, `uvicorn`, `motor` (for Mongo), `pydantic`.

---

## 🧠 Phase 2: Backend Core & "AI" Logic (Hour 2-6)

### 2.1 API Structure (FastAPI)
- [ ] Setup `main.py` with CORS middleware.
- [ ] Create route groups: `/auth`, `/domains`, `/quiz`, `/analytics`, `/roadmap`.

### 2.2 Data Models (Pydantic)
- [ ] `User`: `userId` (static), `email`.
- [ ] `Domain`: `id`, `name`, `description`.
- [ ] `QuizSubmit`: `questionId`, `selectedOption`, `timeTaken`, `switchCount`, `userExplanation`.
- [ ] `Analytics`: `userId`, `conceptScores`, `weaknesses`.

### 2.3 Simulated AI Engines (The "Brain")
- [ ] **Diagnostic Logic:** Function to take quiz answers -> Return `proficiencyScore` & `weakConcepts`.
    - [ ] *Mock logic:* If accuracy < 50% -> "Beginner", > 80% -> "Advanced".
- [ ] **Revision Engine:** Function to calculate "Urgency".
    - [ ] *Mock logic:* If `lastInteracted` > 3 days AND `accuracy` < 60% -> "Revise Now".

---

## 🎨 Phase 3: Frontend Foundation & Design System (Hour 6-10)

### 3.1 Global Styles & Layout
- [ ] Configure Tailwind theme (Fonts, Colors per Design Doc).
- [ ] Create `Layout` component:
    - [ ] **Persistent Sidebar:** Home, Roadmap, Analytics, Revision, Profile.
    - [ ] **Responsive Wrapper:** Mobile collapse handling.

### 3.2 UI Components (Shadcn + Custom)
- [ ] **Cards:** Domain Cards, Module Cards (Rounded, soft shadows).
- [ ] **Buttons:** Primary (Gradient/Accent), Secondary (Ghost).
- [ ] **Progress:** Bars and Circular indicators for scores.

---

## 🛣️ Phase 4: Onboarding & Diagnostic Flow (Hour 10-15)

### 4.1 Landing & Domain Selection
- [ ] **Page:** `DomainSelection`
    - [ ] Grid of cards: DSA, WebDev, AI/ML, etc.
    - [ ] Click interaction -> Open Skill Modal.

### 4.2 Skill Level & Diagnostic Quiz
- [ ] **Modal:** `SkillAssessmentModal` (Beginner/Int/Adv).
- [ ] **Page:** `DiagnosticQuiz` (Focus Mode).
    - [ ] One question per screen.
    - [ ] Timer (visible), Option switching tracker (invisible).
    - [ ] POST result to backend -> Get Roadmap.

---

## 📚 Phase 5: Core Learning Experience (Hour 15-20)

### 5.1 Personalized Roadmap
- [ ] **Page:** `RoadmapView`
    - [ ] Render Nodes: `Locked` (Grey), `Active` (Accent), `Completed` (Green).
    - [ ] *Wow Factor:* Framer Motion animation for unlocking nodes.

### 5.2 Module Player
- [ ] **Page:** `ModuleView`
    - [ ] **Header:** Title + Progress.
    - [ ] **Content:** Video Embed vs Text toggle.
    - [ ] **TL;DR Panel:** Always visible, collapsible side panel.

### 5.3 Micro-Quiz & Integrity Check
- [ ] **Component:** `MicroQuiz`
    - [ ] Question + Options.
    - [ ] **Input Field:** "Why did you choose this?" (Conversational UI).
- [ ] **Feedback Screen:**
    - [ ] "You’re strong in X, weak in Y."
    - [ ] *No red fail screens.* Positive reinforcement.

---

## 📊 Phase 6: Analytics & Dashboards (Hour 20-22)

### 6.1 User Dashboard
- [ ] **Page:** `Analytics`
    - [ ] Charts: Time vs Accuracy, Concept Mastery.
    - [ ] Simple Grid layout.

### 6.2 Revision Planner
- [ ] **Page:** `RevisionPlanner`
    - [ ] Fetch "Urgency" data from backend.
    - [ ] Render cards with color codes: 🔴 Revise Now, 🟡 Soon, 🟢 Later.

---

## 🏆 Phase 7: Polish & Demo Prep (Hour 22-24)

### 7.1 Final Polish
- [ ] **Animations:** Add smooth transitions between pages.
- [ ] **Empty States:** "No revision needed yet" placeholders.
- [ ] **Consistency Check:** Ensure all fonts/colors match Design Doc.

### 7.2 Hackathon Justification
- [ ] Add "About" or "How it works" modal explaining the *Simulated AI* logic for judges.
- [ ] **Judge Note:** "This architecture scales to any domain."

### 7.3 Deployment
- [ ] Frontend -> Vercel.
- [ ] Backend -> Render/Highway.
- [ ] Verify `git remote` and final push.
