import { renderToBuffer } from "@react-pdf/renderer";
import type { AnalysisResult } from "@/types/analysis";
import { AnalysisReportDocument } from "@/components/pdf/AnalysisReportDocument";

export async function generateAnalysisPdf(
  result: AnalysisResult,
  fileName: string,
  generatedAt: string
): Promise<Buffer> {
  const buffer = await renderToBuffer(
    <AnalysisReportDocument
      result={result}
      fileName={fileName}
      generatedAt={generatedAt}
    />
  );
  return Buffer.from(buffer);
}
