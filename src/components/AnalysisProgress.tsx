"use client";

import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { REVEAL_STEPS, type RevealStepId } from "@/lib/staged-reveal";

interface AnalysisProgressProps {
  currentStep: RevealStepId;
  progress: number;
  message?: string;
}

export function AnalysisProgress({ currentStep, progress, message }: AnalysisProgressProps) {
  const currentIdx = REVEAL_STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="card-glow rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium">{message || "Processing your resume..."}</p>
        <span className="text-sm font-bold text-accent tabular-nums">{progress}%</span>
      </div>

      <div className="mb-6 h-2 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-accent transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {REVEAL_STEPS.map((step, idx) => {
          const isDone = currentIdx > idx || currentStep === "complete";
          const isActive = step.id === currentStep;
          const isPending = currentIdx < idx && currentStep !== "complete";

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-300",
                isActive && "bg-accent/10 text-accent scale-[1.02]",
                isDone && !isActive && "text-emerald-400",
                isPending && "text-muted/50",
                step.optional && !isActive && !isDone && "opacity-40"
              )}
            >
              {isDone && !isActive ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : isActive ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              ) : (
                <Circle className="h-4 w-4 shrink-0" />
              )}
              {step.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
