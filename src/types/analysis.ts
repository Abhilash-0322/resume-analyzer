export type RoleId = "software-engineer" | "product-manager" | "data-analyst";

export interface ScoreBreakdown {
  overall: number;
  atsCompatibility: number;
  contentQuality: number;
  formatting: number;
  keywordOptimization: number;
  impactStatements: number;
}

export interface RoleTemplate {
  id: RoleId;
  name: string;
  description: string;
  icon: string;
  benchmarks: ScoreBreakdown;
  expectedKeywords: string[];
  expectedSkills: { technical: string[]; soft: string[] };
  dimensionLabels: Record<
    Exclude<keyof ScoreBreakdown, "overall">,
    string
  >;
  tips: string[];
}

export interface DimensionComparison {
  dimension: Exclude<keyof ScoreBreakdown, "overall">;
  label: string;
  userScore: number;
  benchmark: number;
  delta: number;
}

export interface RoleBenchmarkResult {
  roleId: RoleId;
  roleName: string;
  benchmarks: ScoreBreakdown;
  userScores: ScoreBreakdown;
  deltas: ScoreBreakdown;
  dimensionComparisons: DimensionComparison[];
  overallStatus: "exceeds" | "meets" | "below";
  percentileEstimate: number;
  keywordMatch: { found: string[]; missing: string[] };
  skillMatch: { found: string[]; missing: string[] };
  roleSpecificTips: string[];
  gapSummary: string;
}

export interface SkillAnalysis {
  technical: string[];
  soft: string[];
  missing: string[];
  recommendations: string[];
}

export interface SectionFeedback {
  section: string;
  score: number;
  strengths: string[];
  improvements: string[];
}

export interface KeywordMatch {
  keyword: string;
  found: boolean;
  importance: "high" | "medium" | "low";
}

export interface JobMatchResult {
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  tailoredSuggestions: string[];
}

export interface BulletRewrite {
  original: string;
  improved: string;
  reason: string;
  section: string;
}

export interface AnalysisResult {
  candidateName: string;
  summary: string;
  scores: ScoreBreakdown;
  skills: SkillAnalysis;
  sections: SectionFeedback[];
  topStrengths: string[];
  criticalImprovements: string[];
  actionVerbs: string[];
  grammarIssues: string[];
  atsTips: string[];
  jobMatch?: JobMatchResult;
  roleBenchmark?: RoleBenchmarkResult;
}

export type StreamPhase =
  | "parsing"
  | "analyzing"
  | "scores"
  | "skills"
  | "sections"
  | "strengths"
  | "tips"
  | "jobMatch"
  | "complete"
  | "error";

export interface StreamEvent {
  phase: StreamPhase;
  data?: Partial<AnalysisResult> | { id: string; fileName: string; result: AnalysisResult };
  message?: string;
  progress?: number;
}

export interface AnalysisDocument {
  _id: string;
  fileName: string;
  fileType: string;
  resumeText: string;
  jobDescription?: string;
  targetRole?: RoleId;
  result: AnalysisResult;
  createdAt: string;
}
