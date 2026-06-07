import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { parseResumeFile } from "@/lib/parse-resume";
import { analyzeResumeWithAI } from "@/lib/groq";
import { attachRoleBenchmark } from "@/lib/role-benchmark";
import { isValidRoleId } from "@/lib/role-templates";
import { requireAuth, AuthError } from "@/lib/auth";
import Analysis from "@/models/Analysis";
import type { RoleId } from "@/types/analysis";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const jobDescription = (formData.get("jobDescription") as string) || undefined;
    const targetRoleRaw = (formData.get("targetRole") as string) || undefined;
    const targetRole = targetRoleRaw && isValidRoleId(targetRoleRaw) ? targetRoleRaw : undefined;

    if (!file) {
      return NextResponse.json({ error: "No resume file provided" }, { status: 400 });
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
      return NextResponse.json(
        { error: "Invalid file type. Upload PDF, DOCX, or TXT." },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const resumeText = await parseResumeFile(buffer, file.name, file.type);
    let result = await analyzeResumeWithAI(
      resumeText,
      jobDescription?.trim() || undefined,
      targetRole
    );
    result = attachRoleBenchmark(targetRole, result, resumeText);

    await connectDB();
    const analysis = await Analysis.create({
      userId: user.id,
      fileName: file.name,
      fileType: file.type || "unknown",
      resumeText,
      jobDescription: jobDescription?.trim() || undefined,
      targetRole: targetRole as RoleId | undefined,
      result,
    });

    return NextResponse.json({
      id: analysis._id.toString(),
      fileName: analysis.fileName,
      result: analysis.result,
      createdAt: analysis.createdAt,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Analysis error:", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
