"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import type { AnalysisResult } from "@/types/analysis";
import { isStepAtOrPast, type RevealStepId } from "@/lib/staged-reveal";
import { ScoreRing } from "./ScoreRing";
import { ScoreBar } from "./ScoreBar";
import { RoleBenchmark } from "./RoleBenchmark";
import { AtsSimulationReport } from "./AtsSimulationReport";
import { RevealSection } from "./RevealSection";
import { cn } from "@/lib/utils";

interface AnalysisResultsProps {
  result: AnalysisResult;
  fileName?: string;
  isPartial?: boolean;
  revealStep?: RevealStepId;
}

function show(revealStep: RevealStepId | undefined, target: RevealStepId): boolean {
  if (!revealStep) return true;
  return isStepAtOrPast(revealStep, target);
}

export function AnalysisResults({ result, fileName, isPartial, revealStep }: AnalysisResultsProps) {
  const inProgress = isPartial || (revealStep && revealStep !== "complete");

  const radarData = [
    { metric: "ATS", score: result.scores.atsCompatibility },
    { metric: "Content", score: result.scores.contentQuality },
    { metric: "Format", score: result.scores.formatting },
    { metric: "Keywords", score: result.scores.keywordOptimization },
    { metric: "Impact", score: result.scores.impactStatements },
  ];

  const showAnyScore =
    show(revealStep, "score-overall") ||
    show(revealStep, "score-ats") ||
    show(revealStep, "score-content") ||
    show(revealStep, "score-formatting") ||
    show(revealStep, "score-keywords") ||
    show(revealStep, "score-impact");

  return (
    <div className="space-y-8">
      {/* ATS Simulation */}
      {result.atsSimulation && (
        <RevealSection visible={show(revealStep, "ats-simulation")}>
          <AtsSimulationReport simulation={result.atsSimulation} />
        </RevealSection>
      )}

      {/* Header */}
      <RevealSection visible={show(revealStep, "header")}>
        <div className="card-glow rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-accent">
                {inProgress ? "Analysis in progress..." : "Analysis Complete"}
              </p>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {result.candidateName || "Analyzing..."}
              </h2>
              {fileName && <p className="text-sm text-muted">{fileName}</p>}
              {result.summary && (
                <p className="max-w-2xl text-muted leading-relaxed">{result.summary}</p>
              )}
            </div>
            {show(revealStep, "score-overall") && result.scores.overall > 0 && (
              <ScoreRing score={result.scores.overall} />
            )}
          </div>
        </div>
      </RevealSection>

      {/* Scores Grid */}
      {showAnyScore && (
        <RevealSection visible={show(revealStep, "score-ats")}>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card-glow rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold">
                <TrendingUp className="h-5 w-5 text-accent" />
                Score Breakdown
              </h3>
              <div className="space-y-4">
                <RevealSection visible={show(revealStep, "score-ats")}>
                  <ScoreBar label="ATS Compatibility" score={result.scores.atsCompatibility} />
                </RevealSection>
                <RevealSection visible={show(revealStep, "score-content")}>
                  <ScoreBar label="Content Quality" score={result.scores.contentQuality} />
                </RevealSection>
                <RevealSection visible={show(revealStep, "score-formatting")}>
                  <ScoreBar label="Formatting" score={result.scores.formatting} />
                </RevealSection>
                <RevealSection visible={show(revealStep, "score-keywords")}>
                  <ScoreBar label="Keyword Optimization" score={result.scores.keywordOptimization} />
                </RevealSection>
                <RevealSection visible={show(revealStep, "score-impact")}>
                  <ScoreBar label="Impact Statements" score={result.scores.impactStatements} />
                </RevealSection>
              </div>
            </div>

            {show(revealStep, "score-impact") && (
              <div className="card-glow rounded-2xl border border-border bg-card p-6 animate-fade-in-up">
                <h3 className="mb-4 text-lg font-semibold">Performance Radar</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#27272a" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </RevealSection>
      )}

      {/* Skills */}
      <RevealSection visible={show(revealStep, "skills")}>
        <div className="card-glow rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h3 className="mb-6 text-lg font-semibold">Skills Analysis</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <SkillGroup title="Technical Skills" skills={result.skills.technical} color="accent" />
            <SkillGroup title="Soft Skills" skills={result.skills.soft} color="purple" />
            <SkillGroup title="Missing Skills" skills={result.skills.missing} color="rose" />
            <div>
              <p className="mb-3 text-sm font-medium text-muted">Recommendations</p>
              <ul className="space-y-2">
                {result.skills.recommendations.map((r, i) => (
                  <li key={i} className="text-sm text-muted leading-relaxed">
                    • {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* Section Feedback */}
      <RevealSection visible={show(revealStep, "sections")}>
        <div className="card-glow rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h3 className="mb-6 text-lg font-semibold">Section-by-Section Review</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {result.sections.map((section, i) => (
              <div
                key={section.section}
                className="rounded-xl border border-border bg-background/50 p-5 animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-medium">{section.section}</h4>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-bold",
                      section.score >= 80
                        ? "bg-emerald-500/15 text-emerald-400"
                        : section.score >= 60
                          ? "bg-amber-500/15 text-amber-400"
                          : "bg-rose-500/15 text-rose-400"
                    )}
                  >
                    {section.score}
                  </span>
                </div>
                {section.strengths.length > 0 && (
                  <div className="mb-2">
                    <p className="mb-1 text-xs font-medium text-emerald-400">Strengths</p>
                    <ul className="space-y-1">
                      {section.strengths.map((s, j) => (
                        <li key={j} className="text-xs text-muted">
                          + {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {section.improvements.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-amber-400">Improve</p>
                    <ul className="space-y-1">
                      {section.improvements.map((s, j) => (
                        <li key={j} className="text-xs text-muted">
                          → {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* Strengths & Improvements */}
      <RevealSection visible={show(revealStep, "strengths")}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card-glow rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              Top Strengths
            </h3>
            <ul className="space-y-3">
              {result.topStrengths.map((s, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm leading-relaxed animate-fade-in-up"
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="card-glow rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              Critical Improvements
            </h3>
            <ul className="space-y-3">
              {result.criticalImprovements.map((s, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm leading-relaxed animate-fade-in-up"
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </RevealSection>

      {/* Role Benchmark */}
      {result.roleBenchmark && (
        <RevealSection visible={show(revealStep, "role-benchmark")}>
          <RoleBenchmark benchmark={result.roleBenchmark} />
        </RevealSection>
      )}

      {/* Job Match */}
      {result.jobMatch && (
        <RevealSection visible={show(revealStep, "job-match")}>
          <div className="card-glow rounded-2xl border border-accent/30 bg-accent/5 p-6 sm:p-8">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold">
              <Target className="h-5 w-5 text-accent" />
              Job Description Match
              <span className="ml-auto rounded-full bg-accent/20 px-3 py-1 text-sm font-bold text-accent">
                {result.jobMatch.matchScore}% Match
              </span>
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-medium text-muted">Matched Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {result.jobMatch.matchedKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/30"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-medium text-muted">Missing Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {result.jobMatch.missingKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-full bg-rose-500/15 px-3 py-1 text-xs font-medium text-rose-400 ring-1 ring-rose-500/30"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <ul className="mt-6 space-y-2">
              {result.jobMatch.tailoredSuggestions.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </RevealSection>
      )}

      {/* ATS Tips & Action Verbs */}
      <RevealSection visible={show(revealStep, "tips")}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card-glow rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Zap className="h-5 w-5 text-accent" />
              ATS Optimization Tips
            </h3>
            <ul className="space-y-3">
              {result.atsTips.map((tip, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm text-muted leading-relaxed animate-fade-in-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <span className="font-mono text-xs text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="card-glow rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">Recommended Action Verbs</h3>
            <div className="flex flex-wrap gap-2">
              {result.actionVerbs.map((verb, i) => (
                <span
                  key={verb}
                  className="rounded-lg bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent ring-1 ring-accent/20 animate-fade-in-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {verb}
                </span>
              ))}
            </div>
            {result.grammarIssues.length > 0 && (
              <div className="mt-6">
                <p className="mb-3 text-sm font-medium text-muted">Grammar & Writing Issues</p>
                <ul className="space-y-2">
                  {result.grammarIssues.map((issue, i) => (
                    <li key={i} className="text-sm text-muted">
                      • {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </RevealSection>
    </div>
  );
}

function SkillGroup({
  title,
  skills,
  color,
}: {
  title: string;
  skills: string[];
  color: "accent" | "purple" | "rose";
}) {
  const colorMap = {
    accent: "bg-accent/10 text-accent ring-accent/20",
    purple: "bg-purple-500/10 text-purple-400 ring-purple-500/20",
    rose: "bg-rose-500/10 text-rose-400 ring-rose-500/20",
  };

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-muted">{title}</p>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, i) => (
          <span
            key={skill}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium ring-1 animate-fade-in-up",
              colorMap[color]
            )}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
