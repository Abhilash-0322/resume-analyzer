import JSZip from "jszip";
import type { AnalysisResult, AtsCheck, AtsSimulationResult } from "@/types/analysis";

const STANDARD_SECTIONS: { id: string; label: string; patterns: RegExp[] }[] = [
  {
    id: "contact",
    label: "Contact Information",
    patterns: [/@[a-z0-9.-]+\.[a-z]{2,}/i, /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, /linkedin\.com/i],
  },
  {
    id: "summary",
    label: "Professional Summary",
    patterns: [
      /\b(professional\s+summary|summary|profile|about\s+me|objective|career\s+objective)\b/i,
    ],
  },
  {
    id: "experience",
    label: "Work Experience",
    patterns: [
      /\b(work\s+experience|professional\s+experience|employment|experience|work\s+history)\b/i,
    ],
  },
  {
    id: "education",
    label: "Education",
    patterns: [/\b(education|academic|degree|university|college|b\.?s\.?|m\.?s\.?|b\.?a\.?|ph\.?d)\b/i],
  },
  {
    id: "skills",
    label: "Skills",
    patterns: [/\b(skills|technical\s+skills|core\s+competencies|technologies|tools)\b/i],
  },
];

const STANDARD_FONTS = new Set([
  "arial",
  "helvetica",
  "times",
  "timesnewroman",
  "times-roman",
  "calibri",
  "cambria",
  "garamond",
  "verdana",
  "tahoma",
  "courier",
  "georgia",
  "trebuchet",
  "opensans",
  "roboto",
  "lato",
  "montserrat",
  "noto",
  "ubuntu",
  "sourcesans",
  "liberation",
  "nimbus",
  "carlito",
]);

const DECORATIVE_FONT_PATTERNS = [
  /script/i,
  /brush/i,
  /comic/i,
  /papyrus/i,
  /chalk/i,
  /handwriting/i,
  /curlz/i,
  /jokerman/i,
  /impact/i,
  /fantasy/i,
];

interface TextItem {
  str: string;
  x: number;
  y: number;
  fontName: string;
  page: number;
  pageHeight: number;
}

function checkSections(rawText: string): {
  found: string[];
  missing: string[];
  check: AtsCheck;
} {
  const lower = rawText.toLowerCase();
  const found: string[] = [];
  const missing: string[] = [];

  for (const section of STANDARD_SECTIONS) {
    const matched = section.patterns.some((p) => p.test(lower));
    if (matched) {
      found.push(section.label);
    } else {
      missing.push(section.label);
    }
  }

  const status =
    missing.length === 0 ? "pass" : missing.length <= 2 ? "warn" : "fail";

  return {
    found,
    missing,
    check: {
      id: "sections",
      label: "Standard section headings",
      status,
      message:
        missing.length === 0
          ? "All standard ATS section headings detected."
          : `Missing ${missing.length} standard section(s): ${missing.join(", ")}.`,
      details:
        found.length > 0
          ? `Found: ${found.join(", ")}`
          : "Use clear headings like Experience, Education, Skills.",
    },
  };
}

function scoreFromChecks(checks: AtsCheck[]): number {
  let score = 100;
  for (const check of checks) {
    if (check.status === "fail") score -= 18;
    else if (check.status === "warn") score -= 8;
  }
  return Math.max(0, Math.min(100, score));
}

function parseabilityFromScore(score: number): AtsSimulationResult["parseability"] {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "fair";
  return "poor";
}

function buildRecommendations(checks: AtsCheck[], missingSections: string[]): string[] {
  const recs: string[] = [];
  for (const check of checks) {
    if (check.status !== "pass") {
      if (check.id === "tables")
        recs.push("Remove tables — use simple bullet lists instead for ATS compatibility.");
      if (check.id === "columns")
        recs.push("Use a single-column layout. Multi-column designs break most ATS parsers.");
      if (check.id === "header-footer")
        recs.push("Remove headers and footers — ATS often strips or misreads them.");
      if (check.id === "fonts")
        recs.push("Stick to standard fonts: Arial, Calibri, Helvetica, or Times New Roman.");
      if (check.id === "image-only")
        recs.push("Use a text-based PDF, not a scanned image. OCR fails in many ATS systems.");
      if (check.id === "text-density")
        recs.push("Increase selectable text content — low text density suggests graphics-heavy layout.");
    }
  }
  if (missingSections.length > 0) {
    recs.push(
      `Add missing sections with standard headings: ${missingSections.slice(0, 3).join(", ")}.`
    );
  }
  if (recs.length === 0) {
    recs.push("Resume structure looks ATS-friendly. Maintain simple formatting when updating.");
  }
  return recs.slice(0, 6);
}

async function analyzePdfStructure(buffer: Buffer): Promise<{
  items: TextItem[];
  fonts: Set<string>;
  pageCount: number;
  hasImages: boolean;
}> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const doc = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    standardFontDataUrl: undefined,
  }).promise;

  const items: TextItem[] = [];
  const fonts = new Set<string>();
  let hasImages = false;
  const pageCount = doc.numPages;

  for (let p = 1; p <= pageCount; p++) {
    const page = await doc.getPage(p);
    const viewport = page.getViewport({ scale: 1 });
    const textContent = await page.getTextContent();
    const ops = await page.getOperatorList();

    const imageOps = [
      pdfjs.OPS.paintImageXObject,
      pdfjs.OPS.paintXObject,
      pdfjs.OPS.paintFormXObjectBegin,
    ].filter((op): op is number => op !== undefined);

    if (ops.fnArray.some((fn) => imageOps.includes(fn))) {
      hasImages = true;
    }

    for (const item of textContent.items) {
      if (!("str" in item) || !item.str.trim()) continue;
      const transform = item.transform;
      const fontName = (item as { fontName?: string }).fontName || "unknown";
      fonts.add(fontName);
      items.push({
        str: item.str,
        x: transform[4],
        y: viewport.height - transform[5],
        fontName,
        page: p,
        pageHeight: viewport.height,
      });
    }
  }

  return { items, fonts, pageCount, hasImages };
}

function detectColumns(items: TextItem[]): boolean {
  const byPageLine = new Map<string, TextItem[]>();

  for (const item of items) {
    const lineKey = `${item.page}-${Math.round(item.y / 6)}`;
    const line = byPageLine.get(lineKey) || [];
    line.push(item);
    byPageLine.set(lineKey, line);
  }

  for (const line of byPageLine.values()) {
    if (line.length < 4) continue;
    const sorted = [...line].sort((a, b) => a.x - b.x);
    const midGap = sorted.findIndex((item, i) => {
      if (i === 0) return false;
      return item.x - sorted[i - 1].x > 120;
    });
    if (midGap > 0 && midGap < sorted.length - 1) {
      const left = sorted.slice(0, midGap);
      const right = sorted.slice(midGap);
      if (left.length >= 2 && right.length >= 2) return true;
    }
  }
  return false;
}

function detectTables(items: TextItem[], rawText: string): boolean {
  if ((rawText.match(/\t/g) || []).length >= 6) return true;

  const byPageLine = new Map<string, TextItem[]>();
  for (const item of items) {
    const lineKey = `${item.page}-${Math.round(item.y / 6)}`;
    const line = byPageLine.get(lineKey) || [];
    line.push(item);
    byPageLine.set(lineKey, line);
  }

  let gridLines = 0;
  for (const line of byPageLine.values()) {
    if (line.length >= 4) {
      const xs = line.map((i) => Math.round(i.x / 20) * 20).sort((a, b) => a - b);
      const unique = new Set(xs);
      if (unique.size >= 3) gridLines++;
    }
  }
  return gridLines >= 3;
}

function detectHeaderFooter(items: TextItem[], pageCount: number): boolean {
  if (pageCount < 2) return false;

  const topTexts = new Map<string, number>();
  const bottomTexts = new Map<string, number>();

  for (const item of items) {
    const normalized = item.str.trim().toLowerCase();
    if (normalized.length < 3 || normalized.length > 60) continue;

    if (item.y < 72) {
      topTexts.set(normalized, (topTexts.get(normalized) || 0) + 1);
    }
    if (item.y > item.pageHeight - 72) {
      bottomTexts.set(normalized, (bottomTexts.get(normalized) || 0) + 1);
    }
  }

  const repeating = (map: Map<string, number>) =>
    [...map.values()].some((count) => count >= 2);

  return repeating(topTexts) || repeating(bottomTexts);
}

function analyzeFonts(fonts: Set<string>): { unusual: string[]; check: AtsCheck } {
  const fontList = [...fonts];
  const unusual: string[] = [];

  for (const font of fontList) {
    const normalized = font.replace(/[^a-z0-9]/gi, "").toLowerCase();
    const isStandard = [...STANDARD_FONTS].some(
      (s) => normalized.includes(s) || s.includes(normalized)
    );
    const isDecorative = DECORATIVE_FONT_PATTERNS.some((p) => p.test(font));
    if (isDecorative || (!isStandard && normalized.length > 2)) {
      unusual.push(font);
    }
  }

  const tooManyFonts = fontList.length > 4;
  const hasUnusual = unusual.length > 0;

  let status: AtsCheck["status"] = "pass";
  let message = "Fonts are ATS-friendly and standard.";

  if (hasUnusual && tooManyFonts) {
    status = "fail";
    message = `Unusual fonts detected (${unusual.slice(0, 3).join(", ")}) and ${fontList.length} font families used.`;
  } else if (hasUnusual) {
    status = "warn";
    message = `Non-standard fonts may not parse correctly: ${unusual.slice(0, 3).join(", ")}.`;
  } else if (tooManyFonts) {
    status = "warn";
    message = `${fontList.length} different fonts detected — keep to 2-3 for ATS safety.`;
  }

  return {
    unusual,
    check: {
      id: "fonts",
      label: "Font compatibility",
      status,
      message,
      details: fontList.length > 0 ? `Fonts used: ${fontList.slice(0, 6).join(", ")}` : undefined,
    },
  };
}

async function analyzeDocxStructure(buffer: Buffer): Promise<{
  hasTables: boolean;
  hasColumns: boolean;
  hasHeaderFooter: boolean;
  fonts: string[];
  hasImages: boolean;
}> {
  const zip = await JSZip.loadAsync(buffer);
  const documentXml = await zip.file("word/document.xml")?.async("string");
  if (!documentXml) {
    return {
      hasTables: false,
      hasColumns: false,
      hasHeaderFooter: false,
      fonts: [],
      hasImages: false,
    };
  }

  const hasTables = /<w:tbl[\s>]/i.test(documentXml);
  const hasColumns = /<w:cols\b/i.test(documentXml);
  const hasHeaderFooter =
    /<w:headerReference\b/i.test(documentXml) || /<w:footerReference\b/i.test(documentXml);
  const hasImages = /<w:drawing\b/i.test(documentXml) || /<w:pict\b/i.test(documentXml);

  const fontMatches = documentXml.match(/w:(ascii|hAnsi)="([^"]+)"/gi) || [];
  const fonts = [
    ...new Set(
      fontMatches.map((m) => {
        const match = m.match(/="([^"]+)"/);
        return match ? match[1] : "";
      })
    ),
  ].filter(Boolean);

  return { hasTables, hasColumns, hasHeaderFooter, fonts, hasImages };
}

function checkImageOnly(
  textLength: number,
  fileSize: number,
  hasImages: boolean,
  pageCount?: number
): AtsCheck {
  const density = textLength / Math.max(fileSize, 1);
  const charsPerPage = pageCount ? textLength / pageCount : textLength;

  const likelyScanned =
    textLength < 200 || (density < 0.02 && hasImages) || (charsPerPage < 80 && hasImages);

  return {
    id: "image-only",
    label: "Text extractability",
    status: likelyScanned ? "fail" : textLength < 400 ? "warn" : "pass",
    message: likelyScanned
      ? "Resume appears image-based or scanned — ATS cannot reliably parse this."
      : textLength < 400
        ? "Low text content — verify the file is not a scanned image PDF."
        : "Text is extractable and ATS-readable.",
    details: `${textLength} characters extracted across ${pageCount || 1} page(s).`,
  };
}

export async function runAtsSimulation(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  rawText: string,
  pageCount?: number
): Promise<AtsSimulationResult> {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  const isPdf = mimeType === "application/pdf" || ext === "pdf";
  const isDocx =
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === "docx";

  const checks: AtsCheck[] = [];
  let metadata: AtsSimulationResult["metadata"] = {
    fileType: isPdf ? "pdf" : isDocx ? "docx" : "txt",
    textCharCount: rawText.length,
    textDensity: rawText.length / Math.max(buffer.length, 1),
  };

  const sectionResult = checkSections(rawText);
  checks.push(sectionResult.check);

  let hasImages = false;
  let fonts: string[] = [];
  let hasTables = false;
  let hasColumns = false;
  let hasHeaderFooter = false;

  if (isPdf) {
    try {
      const pdfData = await analyzePdfStructure(buffer);
      metadata = {
        ...metadata,
        pageCount: pdfData.pageCount,
        fontCount: pdfData.fonts.size,
        fonts: [...pdfData.fonts].slice(0, 10),
        hasImages: pdfData.hasImages,
        hasTables: detectTables(pdfData.items, rawText),
        hasColumns: detectColumns(pdfData.items),
        hasHeaderFooter: detectHeaderFooter(pdfData.items, pdfData.pageCount),
      };

      hasImages = pdfData.hasImages;
      hasTables = metadata.hasTables ?? false;
      hasColumns = metadata.hasColumns ?? false;
      hasHeaderFooter = metadata.hasHeaderFooter ?? false;

      const fontResult = analyzeFonts(pdfData.fonts);
      fonts = [...pdfData.fonts];
      checks.push(fontResult.check);
    } catch {
      checks.push({
        id: "pdf-structure",
        label: "PDF structure scan",
        status: "warn",
        message: "Could not fully analyze PDF layout — using text heuristics only.",
      });
      hasTables = (rawText.match(/\t/g) || []).length >= 6;
    }
  } else if (isDocx) {
    try {
      const docxData = await analyzeDocxStructure(buffer);
      hasTables = docxData.hasTables;
      hasColumns = docxData.hasColumns;
      hasHeaderFooter = docxData.hasHeaderFooter;
      hasImages = docxData.hasImages;
      fonts = docxData.fonts;

      metadata = {
        ...metadata,
        fontCount: fonts.length,
        fonts: fonts.slice(0, 10),
        hasImages,
        hasTables,
        hasColumns,
        hasHeaderFooter,
      };

      if (fonts.length > 0) {
        checks.push(analyzeFonts(new Set(fonts)).check);
      }
    } catch {
      checks.push({
        id: "docx-structure",
        label: "DOCX structure scan",
        status: "warn",
        message: "Could not fully analyze DOCX layout — using text heuristics only.",
      });
    }
  }

  checks.push(
    checkImageOnly(rawText.length, buffer.length, hasImages, pageCount ?? metadata.pageCount)
  );

  checks.push({
    id: "tables",
    label: "Tables detection",
    status: hasTables ? "fail" : "pass",
    message: hasTables
      ? "Tables detected — most ATS systems cannot parse tabular layouts."
      : "No tables detected — good for ATS parsing.",
  });

  checks.push({
    id: "columns",
    label: "Multi-column layout",
    status: hasColumns ? "fail" : "pass",
    message: hasColumns
      ? "Multi-column layout detected — ATS may read columns out of order."
      : "Single-column layout detected — optimal for ATS.",
  });

  checks.push({
    id: "header-footer",
    label: "Headers & footers",
    status: hasHeaderFooter ? "warn" : "pass",
    message: hasHeaderFooter
      ? "Headers or footers detected — ATS may strip or misplace this content."
      : "No problematic headers/footers detected.",
  });

  if (!isPdf && !isDocx) {
    checks.push({
      id: "format",
      label: "Plain text format",
      status: "pass",
      message: "Plain text files are fully ATS-parseable.",
    });
  }

  const score = scoreFromChecks(checks);

  return {
    score,
    parseability: parseabilityFromScore(score),
    checks,
    foundSections: sectionResult.found,
    missingSections: sectionResult.missing,
    recommendations: buildRecommendations(checks, sectionResult.missing),
    metadata,
  };
}

export function mergeAtsScores(
  aiAtsScore: number,
  structuralScore: number
): number {
  return Math.round(aiAtsScore * 0.55 + structuralScore * 0.45);
}

export function enrichResultWithAts(
  result: AnalysisResult,
  simulation: AtsSimulationResult
): AnalysisResult {
  const structuralIssues = simulation.checks
    .filter((c) => c.status === "fail")
    .map((c) => `[ATS] ${c.message}`);

  return {
    ...result,
    atsSimulation: simulation,
    scores: {
      ...result.scores,
      atsCompatibility: mergeAtsScores(result.scores.atsCompatibility, simulation.score),
      formatting: mergeAtsScores(result.scores.formatting, simulation.score),
    },
    criticalImprovements: [
      ...structuralIssues.slice(0, 2),
      ...result.criticalImprovements,
    ].slice(0, 7),
    atsTips: [...simulation.recommendations.slice(0, 2), ...result.atsTips].slice(0, 7),
  };
}

export function formatAtsContextForAI(simulation: AtsSimulationResult): string {
  const failed = simulation.checks.filter((c) => c.status === "fail");
  const warned = simulation.checks.filter((c) => c.status === "warn");

  return `ATS STRUCTURAL SCAN (pre-analysis, score ${simulation.score}/100, parseability: ${simulation.parseability}):
- Found sections: ${simulation.foundSections.join(", ") || "none"}
- Missing sections: ${simulation.missingSections.join(", ") || "none"}
- Critical issues: ${failed.map((c) => c.message).join("; ") || "none"}
- Warnings: ${warned.map((c) => c.message).join("; ") || "none"}
- Tables: ${simulation.metadata.hasTables ? "YES" : "no"}, Columns: ${simulation.metadata.hasColumns ? "YES" : "no"}, Headers/Footers: ${simulation.metadata.hasHeaderFooter ? "yes" : "no"}
Factor these structural findings into atsCompatibility and formatting scores.`;
}
