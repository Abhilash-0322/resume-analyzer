"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Clock, FileText, Loader2 } from "lucide-react";
import { getScoreColor } from "@/lib/utils";

interface HistoryItem {
  id: string;
  fileName: string;
  candidateName: string;
  overallScore: number;
  summary: string;
  targetRole?: string;
  roleName?: string;
  benchmarkStatus?: "exceeds" | "meets" | "below";
  createdAt: string;
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setItems(data.items);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10">
          <h1 className="mb-3 text-3xl font-bold tracking-tight">Analysis History</h1>
          <p className="text-muted">
            Review past resume analyses and track your improvements over time.
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="card-glow rounded-2xl border border-border bg-card p-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted" />
            <h2 className="mb-2 text-lg font-semibold">No analyses yet</h2>
            <p className="mb-6 text-sm text-muted">
              Upload your first resume to see analysis history here.
            </p>
            <Link
              href="/analyze"
              className="inline-flex rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              Analyze Resume
            </Link>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="space-y-4">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/history/${item.id}`}
                className="card-glow group flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition hover:border-accent/30 hover:bg-card-hover"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/15">
                  <FileText className="h-5 w-5 text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold group-hover:text-accent transition-colors">
                      {item.candidateName || "Unknown Candidate"}
                    </h3>
                    <span className="text-sm text-muted">· {item.fileName}</span>
                    {item.roleName && (
                      <span className="rounded-full bg-purple-500/15 px-2 py-0.5 text-xs font-medium text-purple-400 ring-1 ring-purple-500/30">
                        {item.roleName}
                      </span>
                    )}
                  </div>
                  <p className="mb-2 line-clamp-2 text-sm text-muted">{item.summary}</p>
                  <div className="flex items-center gap-1 text-xs text-muted">
                    <Clock className="h-3.5 w-3.5" />
                    {format(new Date(item.createdAt), "MMM d, yyyy · h:mm a")}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`text-2xl font-bold tabular-nums ${getScoreColor(item.overallScore)}`}>
                    {item.overallScore}
                  </p>
                  <p className="text-xs text-muted">Overall</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
