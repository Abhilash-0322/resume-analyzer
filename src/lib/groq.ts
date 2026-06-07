import Groq from "groq-sdk";
import type { AnalysisResult, BulletRewrite, RoleId } from "@/types/analysis";
import { getRoleTemplate } from "./role-templates";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const SYSTEM_PROMPT =
  "You are a professional resume analyst. Always respond with valid JSON only. No explanations outside JSON.";

function buildAnalysisPrompt(
  resumeText: string,
  jobDescription?: string,
  targetRole?: RoleId
): string {
  const jobSection = jobDescription
    ? `\n\nJOB DESCRIPTION TO MATCH AGAINST:\n${jobDescription}\n\nInclude a "jobMatch" object with matchScore (0-100), matchedKeywords, missingKeywords, and tailoredSuggestions.`
    : `\n\nNo job description provided. Set jobMatch to null.`;

  const roleSection = targetRole
    ? (() => {
        const role = getRoleTemplate(targetRole);
        return `\n\nTARGET ROLE: ${role.name}
Score this resume specifically against ${role.name} hiring expectations.
- Prioritize: ${role.dimensionLabels.impactStatements}, ${role.dimensionLabels.keywordOptimization}
- Expected keywords to check: ${role.expectedKeywords.slice(0, 8).join(", ")}
- Expected skills: ${[...role.expectedSkills.technical, ...role.expectedSkills.soft].slice(0, 8).join(", ")}
- Tailor skills.missing and skills.recommendations to this role.
- Calibrate scores relative to what strong ${role.name} candidates typically achieve.`;
      })()
    : "";

  return `You are an expert resume analyst and career coach with deep knowledge of ATS systems, hiring practices, and resume optimization.

Analyze the following resume and return ONLY valid JSON (no markdown, no code fences) matching this exact structure:

{
  "candidateName": "extracted name or Unknown",
  "summary": "2-3 sentence executive summary of the candidate's profile and resume quality",
  "scores": {
    "overall": 0-100,
    "atsCompatibility": 0-100,
    "contentQuality": 0-100,
    "formatting": 0-100,
    "keywordOptimization": 0-100,
    "impactStatements": 0-100
  },
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"],
    "missing": ["commonly expected skills not found"],
    "recommendations": ["specific skill additions to strengthen profile"]
  },
  "sections": [
    {
      "section": "Professional Summary|Experience|Education|Skills|Projects|Other",
      "score": 0-100,
      "strengths": ["specific strength"],
      "improvements": ["specific actionable improvement"]
    }
  ],
  "topStrengths": ["top 3-5 resume strengths"],
  "criticalImprovements": ["top 3-5 most important fixes, prioritized"],
  "actionVerbs": ["5-8 strong action verbs the candidate should use more"],
  "grammarIssues": ["specific grammar or writing issues found"],
  "atsTips": ["3-5 ATS-specific optimization tips for this resume"]
  ${jobDescription ? ',"jobMatch": {"matchScore": 0-100, "matchedKeywords": [], "missingKeywords": [], "tailoredSuggestions": []}' : ',"jobMatch": null'}
}

Scoring guidelines:
- Be honest and calibrated. Average resumes score 55-70.
- ATS compatibility: standard headings, no tables/graphics issues, keyword density.
- Impact statements: quantify achievements, use action verbs, show results.
- Provide specific, actionable feedback — not generic advice.

RESUME TEXT:
${resumeText}
${jobSection}${roleSection}`;
}

function extractJSON(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end !== -1) {
    return trimmed.slice(start, end + 1);
  }
  return trimmed;
}

function normalizeResult(parsed: AnalysisResult): AnalysisResult {
  if (!parsed.scores || typeof parsed.scores.overall !== "number") {
    throw new Error("AI returned invalid analysis structure");
  }
  if (parsed.jobMatch === null) {
    delete parsed.jobMatch;
  }
  return parsed;
}

export async function analyzeResumeWithAI(
  resumeText: string,
  jobDescription?: string,
  targetRole?: RoleId
): Promise<AnalysisResult> {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildAnalysisPrompt(resumeText, jobDescription, targetRole) },
    ],
    temperature: 0.3,
    max_tokens: 4096,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI returned empty response");
  }

  return normalizeResult(JSON.parse(extractJSON(content)) as AnalysisResult);
}

export async function streamResumeAnalysis(
  resumeText: string,
  jobDescription?: string,
  onChunk?: (text: string) => void,
  targetRole?: RoleId
): Promise<AnalysisResult> {
  const stream = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildAnalysisPrompt(resumeText, jobDescription, targetRole) },
    ],
    temperature: 0.3,
    max_tokens: 4096,
    response_format: { type: "json_object" },
    stream: true,
  });

  let fullContent = "";
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content || "";
    fullContent += delta;
    onChunk?.(delta);
  }

  if (!fullContent) {
    throw new Error("AI returned empty response");
  }

  return normalizeResult(JSON.parse(extractJSON(fullContent)) as AnalysisResult);
}

export function parsePartialAnalysis(text: string): Partial<AnalysisResult> {
  const partial: Partial<AnalysisResult> = {};

  try {
    const parsed = JSON.parse(extractJSON(text)) as Partial<AnalysisResult>;
    return parsed;
  } catch {
    const fields: Array<keyof AnalysisResult> = [
      "candidateName",
      "summary",
      "scores",
      "skills",
      "sections",
      "topStrengths",
      "criticalImprovements",
      "actionVerbs",
      "grammarIssues",
      "atsTips",
      "jobMatch",
      "roleBenchmark",
    ];

    for (const field of fields) {
      const regex = new RegExp(`"${field}"\\s*:\\s*`);
      if (regex.test(text)) {
        try {
          const fieldStart = text.indexOf(`"${field}"`);
          const colonIdx = text.indexOf(":", fieldStart);
          if (colonIdx === -1) continue;

          let valueStart = colonIdx + 1;
          while (valueStart < text.length && /\s/.test(text[valueStart])) valueStart++;

          const char = text[valueStart];
          if (char === '"') {
            const endQuote = text.indexOf('"', valueStart + 1);
            if (endQuote !== -1) {
              (partial as Record<string, unknown>)[field] = text.slice(valueStart + 1, endQuote);
            }
          } else if (char === "{" || char === "[") {
            const closeChar = char === "{" ? "}" : "]";
            let depth = 0;
            let end = valueStart;
            for (let i = valueStart; i < text.length; i++) {
              if (text[i] === char) depth++;
              if (text[i] === closeChar) {
                depth--;
                if (depth === 0) {
                  end = i + 1;
                  break;
                }
              }
            }
            if (end > valueStart) {
              try {
                (partial as Record<string, unknown>)[field] = JSON.parse(text.slice(valueStart, end));
              } catch {
                // incomplete JSON block
              }
            }
          }
        } catch {
          // skip unparseable field
        }
      }
    }
  }

  return partial;
}

function buildRewritePrompt(
  resumeText: string,
  criticalImprovements: string[],
  jobDescription?: string,
  bullets?: string[]
): string {
  const bulletSection = bullets?.length
    ? `\nSPECIFIC BULLETS TO REWRITE:\n${bullets.map((b, i) => `${i + 1}. ${b}`).join("\n")}`
    : "\nExtract the 5-8 weakest experience/project bullets from the resume and rewrite them.";

  const jobSection = jobDescription
    ? `\nTAILOR IMPROVEMENTS FOR THIS JOB:\n${jobDescription}`
    : "";

  return `You are an expert resume writer. Rewrite weak resume bullets into powerful, quantified impact statements using the STAR method.

Return ONLY valid JSON:
{
  "rewrites": [
    {
      "original": "exact original bullet text",
      "improved": "rewritten bullet with metrics and strong action verb",
      "reason": "brief explanation of what improved",
      "section": "Experience|Projects|Summary|Other"
    }
  ]
}

Rules:
- Start each improved bullet with a strong past-tense action verb
- Add quantified metrics where reasonable (%, $, time saved, users, etc.)
- Keep each bullet 1-2 lines, ATS-friendly
- Do not invent false experience — enhance wording of existing achievements
- Provide 5-8 rewrites

AREAS TO IMPROVE:
${criticalImprovements.map((c) => `- ${c}`).join("\n")}
${bulletSection}
${jobSection}

RESUME:
${resumeText}`;
}

export async function rewriteBulletsWithAI(
  resumeText: string,
  criticalImprovements: string[],
  jobDescription?: string,
  bullets?: string[]
): Promise<BulletRewrite[]> {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: "You are a professional resume writer. Respond with valid JSON only.",
      },
      {
        role: "user",
        content: buildRewritePrompt(resumeText, criticalImprovements, jobDescription, bullets),
      },
    ],
    temperature: 0.4,
    max_tokens: 3000,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI returned empty response");
  }

  const parsed = JSON.parse(extractJSON(content)) as { rewrites: BulletRewrite[] };
  if (!Array.isArray(parsed.rewrites)) {
    throw new Error("AI returned invalid rewrite structure");
  }

  return parsed.rewrites;
}
