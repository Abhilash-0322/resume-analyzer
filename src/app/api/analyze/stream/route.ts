import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { parseResumeFile } from "@/lib/parse-resume";
import { parsePartialAnalysis, streamResumeAnalysis } from "@/lib/groq";
import { attachRoleBenchmark } from "@/lib/role-benchmark";
import { isValidRoleId } from "@/lib/role-templates";
import { requireAuth, AuthError } from "@/lib/auth";
import Analysis from "@/models/Analysis";
import type { RoleId, StreamEvent } from "@/types/analysis";

export const maxDuration = 60;

function encodeEvent(event: StreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: StreamEvent) => {
        controller.enqueue(encoder.encode(encodeEvent(event)));
      };

      try {
        const user = await requireAuth(request);

        send({ phase: "parsing", message: "Extracting text from resume...", progress: 10 });

        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const jobDescription = (formData.get("jobDescription") as string) || undefined;
        const targetRoleRaw = (formData.get("targetRole") as string) || undefined;
        const targetRole = targetRoleRaw && isValidRoleId(targetRoleRaw) ? targetRoleRaw : undefined;

        if (!file) {
          send({ phase: "error", message: "No resume file provided" });
          controller.close();
          return;
        }

        const allowedTypes = [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
        ];

        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
          send({ phase: "error", message: "Invalid file type. Upload PDF, DOCX, or TXT." });
          controller.close();
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          send({ phase: "error", message: "File too large. Maximum size is 5MB." });
          controller.close();
          return;
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const resumeText = await parseResumeFile(buffer, file.name, file.type);

        send({ phase: "analyzing", message: "AI is analyzing your resume...", progress: 25 });

        let accumulated = "";
        const emitted = new Set<string>();

        let result = await streamResumeAnalysis(
          resumeText,
          jobDescription?.trim() || undefined,
          (chunk) => {
            accumulated += chunk;
            const partial = parsePartialAnalysis(accumulated);

            if (partial.candidateName && partial.summary && !emitted.has("header")) {
              emitted.add("header");
              send({
                phase: "scores",
                data: { candidateName: partial.candidateName, summary: partial.summary },
                progress: 40,
              });
            }

            if (partial.scores && !emitted.has("scores")) {
              emitted.add("scores");
              send({ phase: "scores", data: { scores: partial.scores }, progress: 50 });
            }

            if (partial.skills && !emitted.has("skills")) {
              emitted.add("skills");
              send({ phase: "skills", data: { skills: partial.skills }, progress: 60 });
            }

            if (partial.sections && partial.sections.length > 0 && !emitted.has("sections")) {
              emitted.add("sections");
              send({ phase: "sections", data: { sections: partial.sections }, progress: 70 });
            }

            if (partial.topStrengths && !emitted.has("strengths")) {
              emitted.add("strengths");
              send({
                phase: "strengths",
                data: {
                  topStrengths: partial.topStrengths,
                  criticalImprovements: partial.criticalImprovements,
                },
                progress: 80,
              });
            }

            if (partial.atsTips && !emitted.has("tips")) {
              emitted.add("tips");
              send({
                phase: "tips",
                data: {
                  atsTips: partial.atsTips,
                  actionVerbs: partial.actionVerbs,
                  grammarIssues: partial.grammarIssues,
                },
                progress: 90,
              });
            }

            if (partial.jobMatch && !emitted.has("jobMatch")) {
              emitted.add("jobMatch");
              send({ phase: "jobMatch", data: { jobMatch: partial.jobMatch }, progress: 95 });
            }
          },
          targetRole
        );

        result = attachRoleBenchmark(targetRole, result, resumeText);

        if (targetRole && result.roleBenchmark) {
          send({
            phase: "tips",
            data: { roleBenchmark: result.roleBenchmark },
            message: `Benchmarked against ${result.roleBenchmark.roleName} expectations`,
            progress: 92,
          });
        }

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

        send({
          phase: "complete",
          data: {
            id: analysis._id.toString(),
            fileName: analysis.fileName,
            result,
          },
          progress: 100,
        });
      } catch (error) {
        const message =
          error instanceof AuthError
            ? error.message
            : error instanceof Error
              ? error.message
              : "Analysis failed";
        controller.enqueue(encoder.encode(encodeEvent({ phase: "error", message })));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
