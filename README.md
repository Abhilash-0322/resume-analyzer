# ResumeAI — Professional Resume Analyzer

AI-powered resume analysis built with Next.js, Groq LLM, and MongoDB.

## Features

- **JWT Authentication** — Register/login with secure httpOnly cookies
- **Resume Upload** — PDF, DOCX, and TXT support
- **Streaming Analysis** — Live progressive results via SSE as AI completes each section
- **ATS Compatibility Score** — Calibrated scoring across 6 dimensions
- **AI Bullet Rewriter** — Side-by-side original vs improved bullets with copy
- **Skills Analysis** — Technical/soft skills, gaps, and recommendations
- **Job Description Matching** — Keyword match, gaps, and tailored suggestions
- **Section-by-Section Review** — Detailed feedback per resume section
- **ATS Tips & Action Verbs** — Practical optimization guidance
- **Analysis History** — Per-user analyses saved to MongoDB

## Prerequisites

- Node.js 18+
- MongoDB running locally on port 27017
- Groq API key

## Setup

```bash
npm install
```

Create `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/resume_analyzer
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=7d
```

## Run

```bash
# Start MongoDB (if not running)
sudo systemctl start mongod

# Start dev server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

1. Register at `/register`
2. Upload a resume at `/analyze`
3. Watch live streaming results
4. Click **Rewrite Bullets** for AI-improved versions

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **AI:** Groq SDK (Llama 3.3 70B)
- **Database:** MongoDB + Mongoose
- **Parsing:** pdf-parse, mammoth
- **UI:** Tailwind CSS, Recharts, Lucide Icons
