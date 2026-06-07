import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, AuthError } from "@/lib/auth";
import Analysis from "@/models/Analysis";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await connectDB();
    const analyses = await Analysis.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("fileName targetRole result.scores.overall result.candidateName result.summary result.roleBenchmark createdAt")
      .lean();

    const items = analyses.map((a) => ({
      id: a._id.toString(),
      fileName: a.fileName,
      candidateName: a.result.candidateName,
      overallScore: a.result.scores.overall,
      summary: a.result.summary,
      targetRole: a.targetRole,
      roleName: a.result.roleBenchmark?.roleName,
      benchmarkStatus: a.result.roleBenchmark?.overallStatus,
      createdAt: a.createdAt,
    }));

    return NextResponse.json({ items });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("History error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
