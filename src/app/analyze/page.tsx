"use client";

import { useCallback, useRef, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { UploadZone } from "@/components/UploadZone";
import { AnalysisResults } from "@/components/AnalysisResults";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { BulletRewriter } from "@/components/BulletRewriter";
import { RoleSelector } from "@/components/RoleSelector";
import { useStagedReveal } from "@/hooks/useStagedReveal";
import type { AnalysisResult, RoleId, StreamEvent } from "@/types/analysis";

const EMPTY_RESULT: AnalysisResult = {
  candidateName: "",
  summary: "",
  scores: {
    overall: 0,
    atsCompatibility: 0,
    contentQuality: 0,
    formatting: 0,
    keywordOptimization: 0,
    impactStatements: 0,
  },
  skills: { technical: [], soft: [], missing: [], recommendations: [] },
  sections: [],
  topStrengths: [],
  criticalImprovements: [],
  actionVerbs: [],
  grammarIssues: [],
  atsTips: [],
};

function mergePartialResult(
  current: AnalysisResult,
  partial: Partial<AnalysisResult>
): AnalysisResult {
  return {
    candidateName: partial.candidateName ?? current.candidateName,
    summary: partial.summary ?? current.summary,
    scores: partial.scores ? { ...current.scores, ...partial.scores } : current.scores,
    skills: partial.skills
      ? {
          technical: partial.skills.technical ?? current.skills.technical,
          soft: partial.skills.soft ?? current.skills.soft,
          missing: partial.skills.missing ?? current.skills.missing,
          recommendations: partial.skills.recommendations ?? current.skills.recommendations,
        }
      : current.skills,
    sections: partial.sections ?? current.sections,
    topStrengths: partial.topStrengths ?? current.topStrengths,
    criticalImprovements: partial.criticalImprovements ?? current.criticalImprovements,
    actionVerbs: partial.actionVerbs ?? current.actionVerbs,
    grammarIssues: partial.grammarIssues ?? current.grammarIssues,
    atsTips: partial.atsTips ?? current.atsTips,
    jobMatch: partial.jobMatch ?? current.jobMatch,
    roleBenchmark: partial.roleBenchmark ?? current.roleBenchmark,
  };
}

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState<RoleId | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [bufferedResult, setBufferedResult] = useState<AnalysisResult | null>(null);
  const [streamComplete, setStreamComplete] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const finalResultRef = useRef<AnalysisResult | null>(null);

  const handleRevealFinished = useCallback(() => {
    if (finalResultRef.current) {
      setResult(finalResultRef.current);
      finalResultRef.current = null;
    }
    setAnalyzing(false);
    setBufferedResult(null);
    setStreamComplete(false);
  }, []);

  const { revealStep, progress, message } = useStagedReveal({
    active: analyzing,
    bufferedResult,
    streamComplete,
    onFinished: handleRevealFinished,
  });

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload a resume file first.");
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResult(null);
    setBufferedResult({ ...EMPTY_RESULT });
    setStreamComplete(false);
    setAnalysisId(null);
    setFileName("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (jobDescription.trim()) {
        formData.append("jobDescription", jobDescription.trim());
      }
      if (targetRole) {
        formData.append("targetRole", targetRole);
      }

      const response = await fetch("/api/analyze/stream", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Analysis failed");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Streaming not supported");

      const decoder = new TextDecoder();
      let buffer = "";
      let pendingComplete: {
        id: string;
        fileName: string;
        result: AnalysisResult;
      } | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const event: StreamEvent = JSON.parse(line.slice(6));

          if (event.phase === "error") {
            throw new Error(event.message || "Analysis failed");
          }

          if (event.data && event.phase !== "complete") {
            setBufferedResult((prev) =>
              mergePartialResult(prev || EMPTY_RESULT, event.data as Partial<AnalysisResult>)
            );
          }

          if (event.phase === "complete" && event.data) {
            pendingComplete = event.data as {
              id: string;
              fileName: string;
              result: AnalysisResult;
            };
          }
        }
      }

      if (pendingComplete) {
        finalResultRef.current = pendingComplete.result;
        setBufferedResult(pendingComplete.result);
        setAnalysisId(pendingComplete.id);
        setFileName(pendingComplete.fileName);
        setStreamComplete(true);
      } else {
        throw new Error("Analysis completed without results");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBufferedResult(null);
      setAnalyzing(false);
      setStreamComplete(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setJobDescription("");
    setTargetRole(null);
    setResult(null);
    setBufferedResult(null);
    setAnalysisId(null);
    setFileName("");
    setError(null);
    setAnalyzing(false);
    setStreamComplete(false);
  };

  const showLiveAnalysis = analyzing && bufferedResult;
  const showForm = !result && !showLiveAnalysis;

  return (
    <div className="px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-4xl">
        {showForm && (
          <>
            <div className="mb-10 text-center">
              <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Analyze Your Resume
              </h1>
              <p className="text-muted">
                Upload your resume for AI-powered scoring, ATS checks, and actionable feedback.
              </p>
            </div>

            <div className="space-y-6">
              <UploadZone file={file} onFileChange={setFile} disabled={analyzing} />

              <RoleSelector value={targetRole} onChange={setTargetRole} disabled={analyzing} />

              <div className="card-glow rounded-xl border border-border bg-card p-5">
                <label className="mb-2 block text-sm font-medium">
                  Job Description{" "}
                  <span className="font-normal text-muted">(optional — enables job matching)</span>
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job posting here to get keyword matching and tailored suggestions..."
                  rows={5}
                  disabled={analyzing}
                  className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
                  {error}
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={!file || analyzing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Run Full Analysis
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {showLiveAnalysis && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold">Live Analysis</h1>
              <p className="text-sm text-muted">
                Watch each criterion being evaluated step by step...
              </p>
            </div>

            <AnalysisProgress currentStep={revealStep} progress={progress} message={message} />

            <div className="mt-8">
              <AnalysisResults
                result={bufferedResult}
                fileName={fileName}
                isPartial
                revealStep={revealStep}
              />
            </div>
          </>
        )}

        {result && (
          <>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold">Your Results</h1>
                {analysisId && (
                  <p className="text-sm text-muted">
                    Saved to history · ID: {analysisId.slice(-8)}
                  </p>
                )}
              </div>
              <button
                onClick={handleReset}
                className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition hover:bg-card-hover"
              >
                Analyze Another Resume
              </button>
            </div>
            <AnalysisResults result={result} fileName={fileName} />
            {analysisId && (
              <div className="mt-8">
                <BulletRewriter analysisId={analysisId} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
