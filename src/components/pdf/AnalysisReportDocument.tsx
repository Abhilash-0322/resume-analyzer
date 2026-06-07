import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { AnalysisResult } from "@/types/analysis";

const colors = {
  accent: "#6366f1",
  accentLight: "#eef2ff",
  dark: "#18181b",
  muted: "#71717a",
  border: "#e4e4e7",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#f43f5e",
  white: "#ffffff",
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.dark,
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.dark,
    marginHorizontal: -40,
    marginTop: -40,
    paddingHorizontal: 40,
    paddingVertical: 28,
    marginBottom: 24,
  },
  brand: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
    marginBottom: 4,
  },
  brandAccent: {
    color: "#a5b4fc",
  },
  tagline: {
    fontSize: 9,
    color: "#a1a1aa",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  metaLabel: {
    fontSize: 8,
    color: colors.muted,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  metaValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: colors.accent,
    marginBottom: 10,
    marginTop: 16,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  summaryBox: {
    backgroundColor: colors.accentLight,
    padding: 12,
    borderRadius: 4,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#3f3f46",
  },
  scoreHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginBottom: 12,
  },
  overallScore: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  overallScoreText: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
  },
  overallLabel: {
    fontSize: 9,
    color: colors.muted,
  },
  scoreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  scoreCard: {
    width: "31%",
    padding: 8,
    backgroundColor: "#fafafa",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scoreCardLabel: {
    fontSize: 8,
    color: colors.muted,
    marginBottom: 4,
  },
  scoreCardValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: colors.accent,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 5,
    paddingLeft: 4,
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.45,
    color: "#3f3f46",
  },
  checkRow: {
    flexDirection: "row",
    marginBottom: 6,
    padding: 8,
    backgroundColor: "#fafafa",
    borderRadius: 3,
  },
  checkStatus: {
    width: 40,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    marginRight: 8,
  },
  checkLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  checkMessage: {
    fontSize: 8,
    color: colors.muted,
    lineHeight: 1.4,
  },
  tag: {
    fontSize: 7,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: colors.accentLight,
    color: colors.accent,
    borderRadius: 3,
    marginRight: 4,
    marginBottom: 4,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  sectionCard: {
    marginBottom: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  sectionName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  sectionScore: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.accent,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: colors.muted,
  },
  twoCol: {
    flexDirection: "row",
    gap: 16,
  },
  col: {
    flex: 1,
  },
});

function scoreColor(score: number): string {
  if (score >= 80) return colors.success;
  if (score >= 60) return colors.warning;
  return colors.danger;
}

function BulletList({
  items,
  dotColor = colors.accent,
}: {
  items: string[];
  dotColor?: string;
}) {
  return (
    <View>
      {items.map((item, i) => (
        <View key={i} style={styles.bulletItem}>
          <View style={[styles.bulletDot, { backgroundColor: dotColor }]} />
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function Tags({ items }: { items: string[] }) {
  return (
    <View style={styles.tagRow}>
      {items.slice(0, 12).map((item) => (
        <Text key={item} style={styles.tag}>
          {item}
        </Text>
      ))}
    </View>
  );
}

export interface AnalysisReportProps {
  result: AnalysisResult;
  fileName?: string;
  generatedAt: string;
}

export function AnalysisReportDocument({
  result,
  fileName,
  generatedAt,
}: AnalysisReportProps) {
  const scores = [
    { label: "ATS Compatibility", value: result.scores.atsCompatibility },
    { label: "Content Quality", value: result.scores.contentQuality },
    { label: "Formatting", value: result.scores.formatting },
    { label: "Keyword Optimization", value: result.scores.keywordOptimization },
    { label: "Impact Statements", value: result.scores.impactStatements },
  ];

  return (
    <Document
      title={`ResumeAI Report — ${result.candidateName}`}
      author="ResumeAI"
      subject="Resume Analysis Report"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>
            Resume<Text style={styles.brandAccent}>AI</Text>
          </Text>
          <Text style={styles.tagline}>
            Professional Resume Analysis Report · Powered by Groq LLM
          </Text>
        </View>

        <View style={styles.metaRow}>
          <View>
            <Text style={styles.metaLabel}>Candidate</Text>
            <Text style={styles.metaValue}>{result.candidateName}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Resume File</Text>
            <Text style={styles.metaValue}>{fileName || "—"}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Generated</Text>
            <Text style={styles.metaValue}>{generatedAt}</Text>
          </View>
        </View>

        <View style={styles.scoreHero}>
          <View style={styles.overallScore}>
            <Text style={styles.overallScoreText}>{result.scores.overall}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontFamily: "Helvetica-Bold", marginBottom: 6 }}>
              Overall Resume Score
            </Text>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>{result.summary}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Score Breakdown</Text>
        <View style={styles.scoreGrid}>
          {scores.map((s) => (
            <View key={s.label} style={styles.scoreCard}>
              <Text style={styles.scoreCardLabel}>{s.label}</Text>
              <Text style={[styles.scoreCardValue, { color: scoreColor(s.value) }]}>
                {s.value}
              </Text>
            </View>
          ))}
        </View>

        {result.atsSimulation && (
          <>
            <Text style={styles.sectionTitle}>ATS Structure Simulation</Text>
            <Text style={{ fontSize: 9, marginBottom: 8, color: colors.muted }}>
              Structural score: {result.atsSimulation.score}/100 · Parseability:{" "}
              {result.atsSimulation.parseability}
            </Text>
            {result.atsSimulation.checks.slice(0, 6).map((check) => (
              <View key={check.id} style={styles.checkRow}>
                <Text
                  style={[
                    styles.checkStatus,
                    {
                      color:
                        check.status === "pass"
                          ? colors.success
                          : check.status === "warn"
                            ? colors.warning
                            : colors.danger,
                    },
                  ]}
                >
                  {check.status.toUpperCase()}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.checkLabel}>{check.label}</Text>
                  <Text style={styles.checkMessage}>{check.message}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>ResumeAI · Confidential Analysis Report</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Strengths & Improvements</Text>
        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: colors.success, marginBottom: 8 }}>
              Top Strengths
            </Text>
            <BulletList items={result.topStrengths} dotColor={colors.success} />
          </View>
          <View style={styles.col}>
            <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: colors.warning, marginBottom: 8 }}>
              Critical Improvements
            </Text>
            <BulletList items={result.criticalImprovements} dotColor={colors.warning} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Skills Analysis</Text>
        <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 4 }}>Technical</Text>
        <Tags items={result.skills.technical} />
        <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 4 }}>Soft Skills</Text>
        <Tags items={result.skills.soft} />
        {result.skills.missing.length > 0 && (
          <>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 4 }}>Missing</Text>
            <Tags items={result.skills.missing} />
          </>
        )}

        {result.roleBenchmark && (
          <>
            <Text style={styles.sectionTitle}>
              Role Benchmark — {result.roleBenchmark.roleName}
            </Text>
            <Text style={{ fontSize: 9, marginBottom: 8, lineHeight: 1.5 }}>
              {result.roleBenchmark.gapSummary}
            </Text>
            <Text style={{ fontSize: 9, color: colors.muted }}>
              Status: {result.roleBenchmark.overallStatus} · Percentile:{" "}
              {result.roleBenchmark.percentileEstimate}th
            </Text>
          </>
        )}

        {result.jobMatch && (
          <>
            <Text style={styles.sectionTitle}>Job Description Match</Text>
            <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", color: colors.accent, marginBottom: 8 }}>
              {result.jobMatch.matchScore}% Match
            </Text>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 4 }}>Matched</Text>
            <Tags items={result.jobMatch.matchedKeywords} />
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 4 }}>Missing</Text>
            <Tags items={result.jobMatch.missingKeywords} />
          </>
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>ResumeAI · Confidential Analysis Report</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Section-by-Section Review</Text>
        {result.sections.map((section) => (
          <View key={section.section} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionName}>{section.section}</Text>
              <Text style={[styles.sectionScore, { color: scoreColor(section.score) }]}>
                {section.score}
              </Text>
            </View>
            {section.strengths.length > 0 && (
              <Text style={{ fontSize: 8, color: colors.success, marginBottom: 3 }}>
                + {section.strengths.join(" · ")}
              </Text>
            )}
            {section.improvements.length > 0 && (
              <Text style={{ fontSize: 8, color: colors.warning }}>
                → {section.improvements.join(" · ")}
              </Text>
            )}
          </View>
        ))}

        <Text style={styles.sectionTitle}>ATS Tips & Action Verbs</Text>
        <BulletList items={result.atsTips.slice(0, 5)} />
        <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginTop: 10, marginBottom: 6 }}>
          Recommended Action Verbs
        </Text>
        <Tags items={result.actionVerbs} />

        {result.grammarIssues.length > 0 && (
          <>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginTop: 10, marginBottom: 6 }}>
              Grammar & Writing Issues
            </Text>
            <BulletList items={result.grammarIssues.slice(0, 5)} dotColor={colors.danger} />
          </>
        )}

        <View style={{ marginTop: 20, padding: 12, backgroundColor: colors.accentLight, borderRadius: 4 }}>
          <Text style={{ fontSize: 9, lineHeight: 1.5, color: "#4338ca" }}>
            This report was generated by ResumeAI using AI-powered analysis. Scores are
            calibrated estimates — use alongside professional career coaching for best results.
          </Text>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>ResumeAI · Confidential Analysis Report</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
