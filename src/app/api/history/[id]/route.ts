import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, AuthError } from "@/lib/auth";
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

    return NextResponse.json({
      id: analysis._id.toString(),
      fileName: analysis.fileName,
      fileType: analysis.fileType,
      jobDescription: analysis.jobDescription,
      targetRole: analysis.targetRole,
      result: analysis.result,
      rewrites: analysis.rewrites || [],
      createdAt: analysis.createdAt,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Fetch analysis error:", error);
    return NextResponse.json({ error: "Failed to fetch analysis" }, { status: 500 });
  }
}
