import type {
  AnalysisResult,
  RoleBenchmarkResult,
  RoleId,
  ScoreBreakdown,
} from "@/types/analysis";
import { getRoleTemplate } from "./role-templates";

const SCORE_KEYS: (keyof ScoreBreakdown)[] = [
  "overall",
  "atsCompatibility",
  "contentQuality",
  "formatting",
  "keywordOptimization",
  "impactStatements",
];

function computeDeltas(user: ScoreBreakdown, benchmark: ScoreBreakdown): ScoreBreakdown {
  return {
    overall: user.overall - benchmark.overall,
    atsCompatibility: user.atsCompatibility - benchmark.atsCompatibility,
    contentQuality: user.contentQuality - benchmark.contentQuality,
    formatting: user.formatting - benchmark.formatting,
    keywordOptimization: user.keywordOptimization - benchmark.keywordOptimization,
    impactStatements: user.impactStatements - benchmark.impactStatements,
  };
}

function matchTerms(source: string, terms: string[]): { found: string[]; missing: string[] } {
  const lower = source.toLowerCase();
  const found: string[] = [];
  const missing: string[] = [];

  for (const term of terms) {
    if (lower.includes(term.toLowerCase())) {
      found.push(term);
    } else {
      missing.push(term);
    }
  }

  return { found, missing };
}

function deriveStatus(avgDelta: number): RoleBenchmarkResult["overallStatus"] {
  if (avgDelta >= 5) return "exceeds";
  if (avgDelta >= -5) return "meets";
  return "below";
}

function estimatePercentile(avgDelta: number): number {
  const base = 50 + avgDelta * 2.5;
  return Math.min(99, Math.max(5, Math.round(base)));
}

function buildGapSummary(
  roleName: string,
  status: RoleBenchmarkResult["overallStatus"],
  avgDelta: number,
  weakest: string
): string {
  const statusText = {
    exceeds: `exceeds expectations for ${roleName} roles`,
    meets: `meets baseline expectations for ${roleName} roles`,
    below: `is below typical benchmarks for ${roleName} roles`,
  }[status];

  const deltaText =
    avgDelta >= 0 ? `${Math.abs(avgDelta)} points above average` : `${Math.abs(avgDelta)} points below average`;

  return `Your resume ${statusText} (${deltaText}). Biggest gap: ${weakest}.`;
}

function buildRoleTips(
  roleId: RoleId,
  deltas: ScoreBreakdown,
  keywordMissing: string[],
  skillMissing: string[]
): string[] {
  const template = getRoleTemplate(roleId);
  const tips: string[] = [];

  type DimKey = Exclude<keyof ScoreBreakdown, "overall">;
  const weakDimensions = (SCORE_KEYS.filter((k) => k !== "overall" && deltas[k] < -5) as DimKey[])
    .sort((a, b) => deltas[a] - deltas[b])
    .slice(0, 2);

  for (const dim of weakDimensions) {
    tips.push(template.dimensionLabels[dim]);
  }

  if (keywordMissing.length > 0) {
    tips.push(`Add role keywords: ${keywordMissing.slice(0, 4).join(", ")}.`);
  }

  if (skillMissing.length > 0) {
    tips.push(`Highlight missing skills: ${skillMissing.slice(0, 3).join(", ")}.`);
  }

  for (const tip of template.tips) {
    if (tips.length >= 5) break;
    if (!tips.some((t) => t.toLowerCase().includes(tip.slice(0, 20).toLowerCase()))) {
      tips.push(tip);
    }
  }

  return tips.slice(0, 5);
}

export function computeRoleBenchmark(
  roleId: RoleId,
  result: AnalysisResult,
  resumeText: string
): RoleBenchmarkResult {
  const template = getRoleTemplate(roleId);
  const userScores = result.scores;
  const deltas = computeDeltas(userScores, template.benchmarks);

  const dimensionDeltas = SCORE_KEYS.filter((k) => k !== "overall").map((key) => ({
    dimension: key,
    label: template.dimensionLabels[key],
    userScore: userScores[key],
    benchmark: template.benchmarks[key],
    delta: deltas[key],
  }));

  const nonOverallDeltas = dimensionDeltas.map((d) => d.delta);
  const avgDelta = Math.round(
    nonOverallDeltas.reduce((sum, d) => sum + d, 0) / nonOverallDeltas.length
  );

  const weakest = [...dimensionDeltas].sort((a, b) => a.delta - b.delta)[0];
  const overallStatus = deriveStatus(avgDelta);

  const keywordSource = `${resumeText} ${result.skills.technical.join(" ")} ${result.skills.soft.join(" ")}`;
  const keywordMatch = matchTerms(keywordSource, template.expectedKeywords);

  const allSkills = [
    ...result.skills.technical,
    ...result.skills.soft,
    ...result.skills.missing,
  ].join(" ");
  const technicalMatch = matchTerms(allSkills, template.expectedSkills.technical);
  const softMatch = matchTerms(allSkills, template.expectedSkills.soft);

  const skillFound = [...new Set([...technicalMatch.found, ...softMatch.found])];
  const skillMissing = [
    ...new Set([...technicalMatch.missing, ...softMatch.missing]),
  ].filter((s) => !skillFound.some((f) => f.toLowerCase() === s.toLowerCase()));

  return {
    roleId,
    roleName: template.name,
    benchmarks: template.benchmarks,
    userScores,
    deltas,
    dimensionComparisons: dimensionDeltas,
    overallStatus,
    percentileEstimate: estimatePercentile(avgDelta),
    keywordMatch,
    skillMatch: { found: skillFound, missing: skillMissing },
    roleSpecificTips: buildRoleTips(roleId, deltas, keywordMatch.missing, skillMissing),
    gapSummary: buildGapSummary(template.name, overallStatus, avgDelta, weakest.label),
  };
}

export function attachRoleBenchmark(
  roleId: RoleId | undefined,
  result: AnalysisResult,
  resumeText: string
): AnalysisResult {
  if (!roleId) return result;

  return {
    ...result,
    roleBenchmark: computeRoleBenchmark(roleId, result, resumeText),
  };
}
