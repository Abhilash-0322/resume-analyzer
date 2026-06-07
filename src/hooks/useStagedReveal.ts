"use client";

import { useEffect, useRef, useState } from "react";
import type { AnalysisResult } from "@/types/analysis";
import { REVEAL_STEPS, type RevealStepId } from "@/lib/staged-reveal";

const POLL_MS = 150;
const DATA_TIMEOUT_MS = 90_000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface UseStagedRevealOptions {
  active: boolean;
  bufferedResult: AnalysisResult | null;
  streamComplete: boolean;
  onFinished?: () => void;
}

export function useStagedReveal({
  active,
  bufferedResult,
  streamComplete,
  onFinished,
}: UseStagedRevealOptions) {
  const [revealStep, setRevealStep] = useState<RevealStepId>("parsing");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Starting analysis...");
  const [isFinished, setIsFinished] = useState(false);

  const bufferedRef = useRef(bufferedResult);
  const streamCompleteRef = useRef(streamComplete);
  const onFinishedRef = useRef(onFinished);

  bufferedRef.current = bufferedResult;
  streamCompleteRef.current = streamComplete;
  onFinishedRef.current = onFinished;

  useEffect(() => {
    if (!active) {
      setRevealStep("parsing");
      setProgress(0);
      setMessage("Starting analysis...");
      setIsFinished(false);
      return;
    }

    let cancelled = false;

    async function waitForStepData(
      hasData: (result: AnalysisResult | null) => boolean
    ): Promise<boolean> {
      const start = Date.now();
      while (!cancelled) {
        if (hasData(bufferedRef.current)) return true;
        if (streamCompleteRef.current) return hasData(bufferedRef.current);
        if (Date.now() - start > DATA_TIMEOUT_MS) return false;
        await sleep(POLL_MS);
      }
      return false;
    }

    async function runReveal() {
      for (let i = 0; i < REVEAL_STEPS.length; i++) {
        if (cancelled) return;

        const step = REVEAL_STEPS[i];

        if (step.optional) {
          if (!step.hasData(bufferedRef.current)) {
            const ready = await waitForStepData(step.hasData);
            if (cancelled) return;
            if (!ready) continue;
          }
        } else if (i >= 2 && !step.hasData(bufferedRef.current)) {
          await waitForStepData(step.hasData);
          if (cancelled) return;
        }

        setRevealStep(step.id);
        setProgress(step.progress);
        setMessage(step.message);

        await sleep(step.minMs);
      }

      if (!cancelled) {
        setRevealStep("complete");
        setProgress(100);
        setMessage("Analysis complete!");
        setIsFinished(true);
        onFinishedRef.current?.();
      }
    }

    runReveal();

    return () => {
      cancelled = true;
    };
  }, [active]);

  return { revealStep, progress, message, isFinished };
}
