import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/30">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Sparkles className="h-4 w-4 text-accent" />
          <span>ResumeAI — Powered by Groq LLM</span>
        </div>
        <p className="text-xs text-muted/70">
          ATS scoring · Skill analysis · Job matching · Actionable insights
        </p>
      </div>
    </footer>
  );
}
