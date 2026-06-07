"use client";

import {
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  XCircle,
} from "lucide-react";
import type { AtsCheck, AtsSimulationResult } from "@/types/analysis";
import { cn } from "@/lib/utils";

interface AtsSimulationReportProps {
  simulation: AtsSimulationResult;
}

const PARSEABILITY_STYLES = {
  excellent: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
  good: "bg-accent/15 text-accent ring-accent/30",
  fair: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
  poor: "bg-rose-500/15 text-rose-400 ring-rose-500/30",
};

function CheckIcon({ status }: { status: AtsCheck["status"] }) {
  if (status === "pass") return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
  if (status === "warn") return <AlertTriangle className="h-4 w-4 text-amber-400" />;
  return <XCircle className="h-4 w-4 text-rose-400" />;
}

export function AtsSimulationReport({ simulation }: AtsSimulationReportProps) {
  const passCount = simulation.checks.filter((c) => c.status === "pass").length;

  return (
    <div className="card-glow rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
            <FileSearch className="h-5 w-5 text-cyan-400" />
            ATS Structure Simulation
          </h3>
          <p className="max-w-xl text-sm text-muted leading-relaxed">
            Pre-AI scan simulating how Applicant Tracking Systems parse your file — tables,
            columns, fonts, sections, and text extractability.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="text-3xl font-bold tabular-nums text-cyan-400">
            {simulation.score}
          </span>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1",
              PARSEABILITY_STYLES[simulation.parseability]
            )}
          >
            {simulation.parseability} parseability
          </span>
          <span className="text-xs text-muted">
            {passCount}/{simulation.checks.length} checks passed
          </span>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {simulation.checks.map((check) => (
          <div
            key={check.id}
            className={cn(
              "rounded-xl border p-4 transition-colors",
              check.status === "pass"
                ? "border-emerald-500/20 bg-emerald-500/5"
                : check.status === "warn"
                  ? "border-amber-500/20 bg-amber-500/5"
                  : "border-rose-500/20 bg-rose-500/5"
            )}
          >
            <div className="mb-2 flex items-center gap-2">
              <CheckIcon status={check.status} />
              <span className="text-sm font-medium">{check.label}</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">{check.message}</p>
            {check.details && (
              <p className="mt-1 text-xs text-muted/70">{check.details}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-medium text-muted">Sections found</p>
          <div className="flex flex-wrap gap-2">
            {simulation.foundSections.length > 0 ? (
              simulation.foundSections.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/30"
                >
                  {s}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted">No standard sections detected</span>
            )}
          </div>
          {simulation.missingSections.length > 0 && (
            <>
              <p className="mb-2 mt-4 text-sm font-medium text-muted">Missing sections</p>
              <div className="flex flex-wrap gap-2">
                {simulation.missingSections.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-rose-500/15 px-2.5 py-1 text-xs font-medium text-rose-400 ring-1 ring-rose-500/30"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-muted">File metadata</p>
          <ul className="space-y-1 text-xs text-muted">
            <li>Type: {simulation.metadata.fileType.toUpperCase()}</li>
            {simulation.metadata.pageCount != null && (
              <li>Pages: {simulation.metadata.pageCount}</li>
            )}
            {simulation.metadata.textCharCount != null && (
              <li>Characters extracted: {simulation.metadata.textCharCount}</li>
            )}
            {simulation.metadata.fontCount != null && (
              <li>Fonts: {simulation.metadata.fontCount}</li>
            )}
            {simulation.metadata.fonts && simulation.metadata.fonts.length > 0 && (
              <li className="truncate">Font list: {simulation.metadata.fonts.join(", ")}</li>
            )}
          </ul>
        </div>
      </div>

      {simulation.recommendations.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-medium">Structural recommendations</p>
          <ul className="space-y-2">
            {simulation.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted leading-relaxed">
                <span className="font-mono text-xs text-cyan-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
