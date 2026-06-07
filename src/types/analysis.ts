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

export type AtsCheckStatus = "pass" | "warn" | "fail";

export interface AtsCheck {
  id: string;
  label: string;
  status: AtsCheckStatus;
  message: string;
  details?: string;
}

export interface AtsSimulationMetadata {
  pageCount?: number;
  fontCount?: number;
  fonts?: string[];
  hasImages?: boolean;
  textCharCount?: number;
  textDensity?: number;
  hasTables?: boolean;
  hasColumns?: boolean;
  hasHeaderFooter?: boolean;
  fileType: string;
}

export interface AtsSimulationResult {
  score: number;
  parseability: "excellent" | "good" | "fair" | "poor";
  checks: AtsCheck[];
  foundSections: string[];
  missingSections: string[];
  recommendations: string[];
  metadata: AtsSimulationMetadata;
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
  atsSimulation?: AtsSimulationResult;
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
