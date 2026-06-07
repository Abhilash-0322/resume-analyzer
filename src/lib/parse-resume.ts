import pdf from "pdf-parse";
import mammoth from "mammoth";

const MAX_TEXT_LENGTH = 15000;

export interface ParsedResume {
  text: string;
  rawText: string;
  pageCount?: number;
}

function normalizeForAI(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export async function parseResumeFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<ParsedResume> {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  let rawText = "";
  let pageCount: number | undefined;

  if (mimeType === "application/pdf" || ext === "pdf") {
    const data = await pdf(buffer);
    rawText = data.text;
    pageCount = data.numpages;
  } else if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === "docx"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    rawText = result.value;
  } else if (mimeType === "text/plain" || ext === "txt") {
    rawText = buffer.toString("utf-8");
  } else {
    throw new Error("Unsupported file type. Please upload PDF, DOCX, or TXT.");
  }

  rawText = rawText.replace(/\r\n/g, "\n").trim();
  const text = normalizeForAI(rawText);

  if (!text || text.length < 50) {
    throw new Error(
      "Could not extract enough text from the file. Ensure the resume is not scanned/image-only."
    );
  }

  return {
    text: text.length > MAX_TEXT_LENGTH ? text.slice(0, MAX_TEXT_LENGTH) : text,
    rawText,
    pageCount,
  };
}
