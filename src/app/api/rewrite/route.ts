import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { rewriteBulletsWithAI } from "@/lib/groq";
import { requireAuth, AuthError } from "@/lib/auth";
import Analysis from "@/models/Analysis";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { analysisId, resumeText, jobDescription, bullets, criticalImprovements } = body;

    let text = resumeText as string | undefined;
    let jd = jobDescription as string | undefined;
    let improvements = criticalImprovements as string[] | undefined;
    let analysisDoc = null;

    if (analysisId) {
      await connectDB();
      analysisDoc = await Analysis.findOne({ _id: analysisId, userId: user.id });
      if (!analysisDoc) {
        return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
      }
      text = analysisDoc.resumeText;
      jd = analysisDoc.jobDescription;
      improvements = analysisDoc.result.criticalImprovements;
    }

    if (!text) {
      return NextResponse.json({ error: "Resume text or analysisId required" }, { status: 400 });
    }

    const rewrites = await rewriteBulletsWithAI(
      text,
      improvements || [],
      jd,
      bullets as string[] | undefined
    );

    if (analysisDoc) {
      analysisDoc.rewrites = rewrites;
      await analysisDoc.save();
    }

    return NextResponse.json({ rewrites });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Rewrite error:", error);
    const message = error instanceof Error ? error.message : "Rewrite failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
