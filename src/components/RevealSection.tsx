"use client";

import { cn } from "@/lib/utils";

interface RevealSectionProps {
  visible: boolean;
  children: React.ReactNode;
  className?: string;
}

export function RevealSection({ visible, children, className }: RevealSectionProps) {
  if (!visible) return null;

  return (
    <div className={cn("animate-fade-in-up", className)}>
      {children}
    </div>
  );
}
