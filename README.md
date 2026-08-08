# 🚀 Trafy Assessment Platform

A modern, high-performance, dark-mode technical assessment platform designed for evaluating candidates across 6 core technical tracks: **Core CS, C++, Java, Python, Web Development, and AI/ML**.

Built with Vite, React 19, TypeScript, Tailwind CSS v4, Monaco Editor, Supabase, and Resend.

---

## ✨ Features

- **🎯 6 Specialized Assessment Tracks**:
  - **Core Computer Science** (OS, DBMS, Computer Networks, DSA, System Design)
  - **C++ Programming** (Pointers, Memory Management, STL, Templates, OOP)
  - **Java Programming** (JVM Architecture, Collections, Multithreading, Exceptions, OOP)
  - **Python Programming** (Decorators, Generators, List Comprehensions, GIL, Memory)
  - **Web Development** (HTML/CSS, DOM, React Hooks, Event Loop, Promises, APIs)
  - **AI & Machine Learning** (Neural Networks, Backpropagation, Gradient Descent, NLP, CV)

- **📝 Assessment Format (Per Track)**:
  - **20 MCQs**: Concept-focused multiple-choice questions with balanced answer distributions.
  - **1 Coding Challenge**: Embedded IDE problem with test-case verification.

- **💻 In-Browser Monaco IDE**:
  - Full syntax highlighting & dark theme matching VS Code.
  - Instant client-side code evaluation (`Function` execution engine).
  - Real-time test case runner showing input, expected output, and actual results.

- **⏱️ Timed Assessment Engine**:
  - 30-minute countdown timer with low-time warning animations.
  - Auto-submission on timer expiry.
  - State persistence in `localStorage` to preserve progress on refresh.

- **📊 Comprehensive Score & Analytics**:
  - Animated SVG circular gauge for score percentage.
  - Percentile ranking indicator (Top 12%, etc.).
  - Itemized question-by-question pass/fail breakdown.

- **🏆 Global Leaderboard**:
  - Live ranking table showing top candidate performances across tracks.

- **📧 Automated Score Delivery (Supabase + Resend)**:
  - Serverless Edge Function integration to send branded HTML score reports directly to candidate email addresses.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 + TypeScript + Vite |
| **Styling** | Tailwind CSS v4 + Custom Dark Theme |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Code Editor** | `@monaco-editor/react` (Monaco Engine) |
| **Backend & DB** | Supabase (Postgres, Row Level Security, Edge Functions) |
| **Email Delivery** | Resend API (via Supabase Edge Function) |

---

## 📁 Project Structure

```
trafy-assessment/
├── generate-questions.js          # Generator script for assessment JSONs
├── index.html                     # HTML Entrypoint
├── package.json                   # Dependencies & scripts
├── vite.config.ts                 # Vite + React + Tailwind v4 configuration
├── .env.example                   # Environment variable template
├── public/                        # Static assets
├── supabase/
│   ├── schema.sql                 # SQL script for PostgreSQL tables & RLS policies
│   └── functions/
│       └── send-score/
│           └── index.ts           # Supabase Edge Function for Resend emails
└── src/
    ├── main.tsx                   # React root entrypoint
    ├── App.tsx                    # Router setup & main layout
    ├── index.css                  # Tailwind v4 theme & space background styles
    ├── components/
    │   ├── Navbar.tsx             # Header component
    │   ├── Footer.tsx             # Footer component
    │   ├── Button.tsx             # Animated Framer Motion button
    │   ├── SectionTag.tsx         # Styled tag pill
    │   └── AssessmentMockup.tsx   # Hero section interactive code mockup
    ├── data/
    │   └── questions/             # 6 JSON assessment files (21 questions each)
    │       ├── core-cs.json
    │       ├── cpp.json
    │       ├── java.json
    │       ├── python.json
    │       ├── webdev.json
    │       └── aiml.json
    └── pages/
        ├── Home.tsx               # Landing page with track catalog
        ├── Register.tsx           # Candidate credential collection
        ├── Assessment.tsx         # Assessment taking page (MCQs + Monaco IDE)
        ├── Results.tsx            # Animated score report
        └── Leaderboard.tsx        # Global candidate ranking
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18+` or `v20+`
- `npm` or `yarn` or `pnpm`

### 1. Clone & Install Dependencies
```bash
cd trafy-assessment
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗄️ Database & Email Setup (Supabase + Resend)

### 1. Database Setup
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor**.
3. Copy and run the contents of [`supabase/schema.sql`](./supabase/schema.sql). This will create:
   - `candidates` table (stores candidate credentials).
   - `sessions` table (stores test scores and detailed answers).
   - Row Level Security (RLS) policies for anonymous submissions and public leaderboard reads.

### 2. Configure Resend API Key in Supabase
> ⚠️ **Important Security Note**: The `RESEND_API_KEY` must **never** be placed in `.env` (frontend environment variables) to prevent exposing private keys in browser bundles. It must be set as a secret inside Supabase Edge Functions.

1. Get an API key from [Resend](https://resend.com).
2. Install the Supabase CLI if you haven't already:
   ```bash
   npm i -g supabase
   ```
3. Link your Supabase project and set the secret:
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   supabase secrets set RESEND_API_KEY=re_123456789
   ```

### 3. Deploy the Email Edge Function
Deploy the score email Edge Function:
```bash
supabase functions deploy send-score --no-verify-jwt
```

---

## 🔄 Regenerating or Customizing Questions

To re-generate or modify the 6 assessment JSON files, edit `generate-questions.js` and run:

```bash
node generate-questions.js
```

This will automatically re-populate all files in `src/data/questions/`.

---

## 📜 License

Distributed under the MIT License.
