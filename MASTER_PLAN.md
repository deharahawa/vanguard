# ⚔️ PROJECT KINTSUGI: THE VANGUARD PROTOCOL (V2)

> "The daily routine is the input. The weekly review is the strategy. Everything else is noise."

## 1. THE CORE PHILOSOPHY

We are building a **Tactical Logbook**, not a habit tracker.

1.  **Low Friction Input:** A "Pilot's Checklist" (Toggles & Mood), not abstract XP grinding.
2.  **High Value Output:** A "Friday Debrief" (The Chronicle) that aggregates data into a strategy report.
3.  **The Trinity:** Balance between **Operator** (Work), **Stoic** (Mind), and **Diplomat** (Social).
4.  **Privacy First:** Biometric locks on journals. No social sharing.

---

## 2. THE TECH STACK

**Architecture:** Monorepo (Turborepo).
**Web:** Next.js 14+ (App Router), Tailwind CSS.
**Mobile:** React Native (Expo SDK 50+), NativeWind v4.
**Backend:** Supabase (Auth + Postgres + RLS).
**AI:** Vercel AI SDK (On-demand mentorship).

---

## 3. THE EXECUTION ROADMAP (REVISED SLICES)

### 🧱 PHASE 1: THE LOOP (MVP)

_Goal: A functional logbook that saves data daily and reports weekly._

- **SLICE 0: THE FORGE (INFRASTRUCTURE)**
  - **Goal:** Running Monorepo (Web + Mobile) with the "Dark Kintsugi" aesthetic.
  - **Task:** Setup Turborepo, configure Tailwind/NativeWind Colors (Void Black, Gold, Indigo).
  - **Check:** "System Online" screen on localhost & simulator.

- **SLICE 1: THE IDENTITY (AUTH & DB)**
  - **Goal:** Secure User Identity so data persists.
  - **Task:** Supabase Auth (Google/Apple + Magic Link). RLS Policies (Users see only their own data).
  - **Check:** Login redirects to Dashboard. Guest blocked.

- **SLICE 2: THE PROTOCOL (INPUT)**
  - **Goal:** The Daily Interface. Low friction.
  - **Task:** `DailyMetrics` Schema (hydration, movement, breathing, mood, notes).
  - **UI:** The "Pilot's Checklist" Card (Toggles) + Emoji Mood Slider + Text Dump.
  - **Check:** Saving the form populates the Database.

- **SLICE 3: THE CHRONICLE (OUTPUT)**
  - **Goal:** The Weekly Consolidation.
  - **Task:** Logic that aggregates the last 5 `DailyMetrics`.
  - **UI:** A "Friday Report" view unlocking after 4 PM Friday. Shows adherence % and Mood Graph.
  - **Check:** A JSON summary of the week is generated on screen.

---

### 🎮 PHASE 2: THE GAMIFICATION

_Goal: Connecting the mundane inputs to the larger journey._

- **SLICE 4: THE TRINITY (CONTEXT)**
  - **Goal:** Categorize inputs.
  - **Task:** Tag checklist items to Paths (Operator, Stoic, Diplomat).
  - **UI:** Visual accents (Red/Blue/Green) on the Checklist toggles.

- **SLICE 5: THE LOADOUT (PERKS)**
  - **Goal:** Replace generic "Habits" with "Skill Perks".
  - **Task:** Database of Perks (e.g., "Protocol Zero", "Deep Work I").
  - **Logic:** Checking "Breathing" adds progress to "Protocol Zero".

- **SLICE 6: THE HEXAGON (VISUALS)**
  - **Goal:** The "GitHub" effect.
  - **UI:** Render the Trinity balance as a Hexagon on the Dashboard.

---

### 🧠 PHASE 3: THE INTELLIGENCE

_Goal: Guidance when needed._

- **SLICE 7: THE MENTOR (ON-DEMAND)**
  - **Goal:** Strategy, not nagging.
  - **UI:** A "Dojo" page. "Consult the Mentor".
  - **Logic:** AI reads the Weekly Chronicle and offers 3 sentences of advice.

- **SLICE 8: THE BLACK BOX (PRIVACY)**
  - **Goal:** Safe space for raw honesty.
  - **Task:** Biometric Lock (FaceID) wrapper for the "Text Dump" history.

---

## 4. CODING STANDARDS (DoD)

1.  **Mobile First:** The Input (Slice 2) must feel perfect on a phone thumb-zone.
2.  **Dark Mode Only:** No light mode. Save battery, save eyes.
3.  **Local State:** Optimistic UI updates. Never wait for the DB to tick a box.
