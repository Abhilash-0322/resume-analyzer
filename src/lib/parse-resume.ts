import pdf from "pdf-parse";
import mammoth from "mammoth";

const MAX_TEXT_LENGTH = 15000;

export async function parseResumeFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  let text = "";

  if (mimeType === "application/pdf" || ext === "pdf") {
    const data = await pdf(buffer);
    text = data.text;
  } else if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === "docx"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else if (mimeType === "text/plain" || ext === "txt") {
    text = buffer.toString("utf-8");
  } else {
    throw new Error("Unsupported file type. Please upload PDF, DOCX, or TXT.");
  }

  text = text.replace(/\s+/g, " ").trim();

  if (!text || text.length < 50) {
    throw new Error(
      "Could not extract enough text from the file. Ensure the resume is not scanned/image-only."
    );
  }

  if (text.length > MAX_TEXT_LENGTH) {
    text = text.slice(0, MAX_TEXT_LENGTH);
  }

  return text;
}
