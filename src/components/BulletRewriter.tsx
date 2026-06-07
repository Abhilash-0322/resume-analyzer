"use client";

import { useState } from "react";
import { ArrowRight, Check, Copy, Loader2, RefreshCw, Wand2 } from "lucide-react";
import type { BulletRewrite } from "@/types/analysis";
import { cn } from "@/lib/utils";

interface BulletRewriterProps {
  analysisId: string;
  initialRewrites?: BulletRewrite[];
}

export function BulletRewriter({ analysisId, initialRewrites = [] }: BulletRewriterProps) {
  const [rewrites, setRewrites] = useState<BulletRewrite[]>(initialRewrites);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const generateRewrites = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rewrite failed");

      setRewrites(data.rewrites);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="card-glow rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Wand2 className="h-5 w-5 text-accent" />
            AI Bullet Rewriter
          </h3>
          <p className="mt-1 text-sm text-muted">
            Transform weak bullets into quantified, impact-driven statements
          </p>
        </div>
        <button
          onClick={generateRewrites}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Rewriting...
            </>
          ) : rewrites.length > 0 ? (
            <>
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              Rewrite Bullets
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
          {error}
        </div>
      )}

      {rewrites.length === 0 && !loading && (
        <div className="rounded-xl border border-dashed border-border bg-background/50 p-8 text-center">
          <p className="text-sm text-muted">
            Click &quot;Rewrite Bullets&quot; to get AI-improved versions of your weakest resume bullets.
          </p>
        </div>
      )}

      {loading && rewrites.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      )}

      <div className="space-y-4">
        {rewrites.map((rewrite, idx) => (
          <div
            key={idx}
            className="overflow-hidden rounded-xl border border-border bg-background/50"
          >
            <div className="flex items-center gap-2 border-b border-border bg-card/50 px-4 py-2">
              <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
                {rewrite.section}
              </span>
              <span className="text-xs text-muted">{rewrite.reason}</span>
            </div>

            <div className="grid md:grid-cols-2">
              <div className="border-b border-border p-4 md:border-b-0 md:border-r">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                  Original
                </p>
                <p className="text-sm leading-relaxed text-muted">{rewrite.original}</p>
              </div>

              <div className="relative p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-emerald-400">
                  Improved
                </p>
                <p className="pr-10 text-sm leading-relaxed">{rewrite.improved}</p>
                <button
                  onClick={() => copyToClipboard(rewrite.improved, idx)}
                  className={cn(
                    "absolute right-3 top-3 rounded-lg p-2 transition",
                    copiedIdx === idx
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "text-muted hover:bg-card hover:text-foreground"
                  )}
                  title="Copy improved bullet"
                >
                  {copiedIdx === idx ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="hidden items-center justify-center px-4 py-1 md:flex md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
              <ArrowRight className="h-4 w-4 text-accent" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
