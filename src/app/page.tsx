import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Brain,
  FileSearch,
  Shield,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "ATS Compatibility Score",
    description:
      "Get a calibrated score on how well your resume passes Applicant Tracking Systems used by 98% of Fortune 500 companies.",
  },
  {
    icon: Brain,
  title: "AI-Powered Deep Analysis",
    description:
      "Advanced AI analyzes content quality, impact statements, keyword density, and section structure with expert-level precision.",
  },
  {
    icon: Target,
    title: "Job Description Matching",
    description:
      "Paste a job posting and see keyword gaps, match percentage, and tailored suggestions to optimize for that specific role.",
  },
  {
    icon: Zap,
    title: "Actionable Improvements",
    description:
      "Prioritized fix list, grammar issues, missing skills, and strong action verbs — everything you need to land more interviews.",
  },
  {
    icon: FileSearch,
    title: "Section-by-Section Review",
    description:
      "Detailed feedback on every resume section — experience, education, skills, summary — with specific strengths and gaps.",
  },
  {
    icon: Shield,
    title: "Analysis History",
    description:
      "Every analysis is saved locally. Track improvements over time and compare scores as you refine your resume.",
  },
];

const stats = [
  { value: "6", label: "Score Dimensions" },
  { value: "50+", label: "Data Points Analyzed" },
  { value: "<30s", label: "Analysis Time" },
  { value: "100%", label: "Actionable Feedback" },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="hero-glow relative overflow-hidden px-4 pb-24 pt-16 sm:px-6 sm:pt-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl animate-pulse-glow" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm text-accent">
            <Sparkles className="h-4 w-4" />
            Powered by AI
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Your resume deserves
            <br />
            <span className="gradient-text">expert-level analysis</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted leading-relaxed sm:text-xl">
            Upload your resume and get instant ATS scoring, skill gap analysis, job matching,
            and prioritized improvements - the same insights career coaches charge hundreds for.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-base font-semibold text-white transition hover:bg-accent-hover"
            >
              Analyze My Resume
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/history"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-8 py-3.5 text-base font-medium transition hover:bg-card-hover"
            >
              View Past Analyses
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/60 bg-card/30 px-4 py-12 sm:px-6">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-accent">{stat.value}</p>
              <p className="mt-1 text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to stand out
            </h2>
            <p className="mx-auto max-w-2xl text-muted">
              Professional-grade resume analysis built for serious job seekers who want
              data-driven feedback, not generic templates.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="card-glow group rounded-2xl border border-border bg-card p-6 transition hover:border-accent/30 hover:bg-card-hover"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-accent/15 transition group-hover:bg-accent/25">
                  <feature.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24 sm:px-6">
        <div className="card-glow mx-auto max-w-4xl rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/10 via-card to-card p-10 text-center sm:p-14">
          <h2 className="mb-4 text-2xl font-bold sm:text-3xl">Ready to improve your resume?</h2>
          <p className="mx-auto mb-8 max-w-lg text-muted">
            Upload PDF, DOCX, or TXT. Get your full analysis in under 30 seconds.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3.5 font-semibold text-white transition hover:bg-accent-hover"
          >
            Start Free Analysis
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
