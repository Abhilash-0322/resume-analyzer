import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, AuthError } from "@/lib/auth";
import { generateAnalysisPdf } from "@/lib/generate-pdf-report";
import Analysis from "@/models/Analysis";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    await connectDB();
    const analysis = await Analysis.findOne({ _id: id, userId: user.id }).lean();

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    const generatedAt = format(
      new Date(analysis.createdAt),
      "MMMM d, yyyy 'at' h:mm a"
    );

    const buffer = await generateAnalysisPdf(
      analysis.result,
      analysis.fileName,
      generatedAt
    );

    const safeName = (analysis.result.candidateName || "resume")
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    const filename = `ResumeAI_Report_${safeName}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("PDF export error:", error);
    return NextResponse.json({ error: "Failed to generate PDF report" }, { status: 500 });
  }
}
