import type { AnalysisResult } from "@/types/analysis";

export type RevealStepId =
  | "parsing"
  | "ats-simulation"
  | "analyzing"
  | "header"
  | "score-overall"
  | "score-ats"
  | "score-content"
  | "score-formatting"
  | "score-keywords"
  | "score-impact"
  | "skills"
  | "sections"
  | "strengths"
  | "role-benchmark"
  | "job-match"
  | "tips"
  | "complete";

export interface RevealStepConfig {
  id: RevealStepId;
  label: string;
  message: string;
  minMs: number;
  progress: number;
  optional?: boolean;
  hasData: (result: AnalysisResult | null) => boolean;
}

export const REVEAL_STEPS: RevealStepConfig[] = [
  {
    id: "parsing",
    label: "Extracting text",
    message: "Reading and parsing your resume file...",
    minMs: 1400,
    progress: 6,
    hasData: () => true,
  },
  {
    id: "ats-simulation",
    label: "ATS structure scan",
    message: "Simulating ATS parsing — tables, columns, fonts, sections...",
    minMs: 1300,
    progress: 12,
    hasData: (r) => !!r?.atsSimulation,
  },
  {
    id: "analyzing",
    label: "AI analyzing",
    message: "Groq AI is reviewing your resume in depth...",
    minMs: 1600,
    progress: 18,
    hasData: () => true,
  },
  {
    id: "header",
    label: "Profile summary",
    message: "Identifying candidate profile and executive summary...",
    minMs: 1200,
    progress: 22,
    hasData: (r) => !!r?.candidateName && !!r?.summary,
  },
  {
    id: "score-overall",
    label: "Overall score",
    message: "Computing your overall resume score...",
    minMs: 900,
    progress: 30,
    hasData: (r) => (r?.scores.overall ?? 0) > 0,
  },
  {
    id: "score-ats",
    label: "ATS compatibility",
    message: "Evaluating ATS compatibility and parseability...",
    minMs: 800,
    progress: 38,
    hasData: (r) => (r?.scores.atsCompatibility ?? 0) > 0,
  },
  {
    id: "score-content",
    label: "Content quality",
    message: "Analyzing content quality and clarity...",
    minMs: 800,
    progress: 46,
    hasData: (r) => (r?.scores.contentQuality ?? 0) > 0,
  },
  {
    id: "score-formatting",
    label: "Formatting",
    message: "Checking formatting and visual structure...",
    minMs: 800,
    progress: 54,
    hasData: (r) => (r?.scores.formatting ?? 0) > 0,
  },
  {
    id: "score-keywords",
    label: "Keyword optimization",
    message: "Measuring keyword density and optimization...",
    minMs: 800,
    progress: 62,
    hasData: (r) => (r?.scores.keywordOptimization ?? 0) > 0,
  },
  {
    id: "score-impact",
    label: "Impact statements",
    message: "Scoring impact statements and achievements...",
    minMs: 900,
    progress: 70,
    hasData: (r) => (r?.scores.impactStatements ?? 0) > 0,
  },
  {
    id: "skills",
    label: "Skills analysis",
    message: "Extracting technical and soft skills...",
    minMs: 1100,
    progress: 76,
    hasData: (r) =>
      (r?.skills.technical.length ?? 0) > 0 || (r?.skills.soft.length ?? 0) > 0,
  },
  {
    id: "sections",
    label: "Section review",
    message: "Reviewing each resume section individually...",
    minMs: 1100,
    progress: 82,
    hasData: (r) => (r?.sections.length ?? 0) > 0,
  },
  {
    id: "strengths",
    label: "Strengths & gaps",
    message: "Identifying top strengths and critical improvements...",
    minMs: 1000,
    progress: 88,
    hasData: (r) =>
      (r?.topStrengths.length ?? 0) > 0 || (r?.criticalImprovements.length ?? 0) > 0,
  },
  {
    id: "role-benchmark",
    label: "Role benchmark",
    message: "Comparing scores against role-specific benchmarks...",
    minMs: 1000,
    progress: 92,
    optional: true,
    hasData: (r) => !!r?.roleBenchmark,
  },
  {
    id: "job-match",
    label: "Job matching",
    message: "Matching resume against job description keywords...",
    minMs: 1000,
    progress: 95,
    optional: true,
    hasData: (r) => !!r?.jobMatch,
  },
  {
    id: "tips",
    label: "ATS tips & verbs",
    message: "Generating ATS tips and action verb recommendations...",
    minMs: 1000,
    progress: 98,
    hasData: (r) => (r?.atsTips.length ?? 0) > 0 || (r?.actionVerbs.length ?? 0) > 0,
  },
  {
    id: "complete",
    label: "Complete",
    message: "Analysis complete!",
    minMs: 700,
    progress: 100,
    hasData: () => true,
  },
];

export const REVEAL_STEP_ORDER = REVEAL_STEPS.map((s) => s.id);

export function isStepAtOrPast(current: RevealStepId, target: RevealStepId): boolean {
  return REVEAL_STEP_ORDER.indexOf(current) >= REVEAL_STEP_ORDER.indexOf(target);
}

export function getRevealStepIndex(step: RevealStepId): number {
  return REVEAL_STEP_ORDER.indexOf(step);
}
