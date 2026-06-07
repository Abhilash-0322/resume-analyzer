"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AnalysisResults } from "@/components/AnalysisResults";
import { BulletRewriter } from "@/components/BulletRewriter";
import type { AnalysisResult, BulletRewrite } from "@/types/analysis";

export default function HistoryDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [fileName, setFileName] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [rewrites, setRewrites] = useState<BulletRewrite[]>([]);

  useEffect(() => {
    fetch(`/api/history/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setResult(data.result);
        setFileName(data.fileName);
        setCreatedAt(data.createdAt);
        setRewrites(data.rewrites || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="px-4 py-20 text-center sm:px-6">
        <p className="mb-4 text-rose-400">{error || "Analysis not found"}</p>
        <Link href="/history" className="text-accent hover:underline">
          Back to history
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/history"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold">Past Analysis</h1>
          {createdAt && (
            <p className="text-sm text-muted">
              Analyzed on {format(new Date(createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          )}
        </div>

        <AnalysisResults result={result} fileName={fileName} />
        <div className="mt-8">
          <BulletRewriter analysisId={id} initialRewrites={rewrites} />
        </div>
      </div>
    </div>
  );
}
