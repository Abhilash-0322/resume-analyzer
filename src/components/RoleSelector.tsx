"use client";

import { BarChart3, Code2, LayoutGrid } from "lucide-react";
import type { RoleId } from "@/types/analysis";
import { ROLE_LIST } from "@/lib/role-templates";
import { cn } from "@/lib/utils";

const ICONS = {
  Code2,
  LayoutGrid,
  BarChart3,
} as const;

interface RoleSelectorProps {
  value: RoleId | null;
  onChange: (role: RoleId | null) => void;
  disabled?: boolean;
}

export function RoleSelector({ value, onChange, disabled }: RoleSelectorProps) {
  return (
    <div className="card-glow rounded-xl border border-border bg-card p-5">
      <label className="mb-1 block text-sm font-medium">
        Target Role{" "}
        <span className="font-normal text-muted">(optional — enables role benchmarks)</span>
      </label>
      <p className="mb-4 text-xs text-muted">
        Compare your scores against industry expectations for Software Engineer, Product Manager,
        or Data Analyst roles.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        {ROLE_LIST.map((role) => {
          const Icon = ICONS[role.icon as keyof typeof ICONS] || Code2;
          const selected = value === role.id;

          return (
            <button
              key={role.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(selected ? null : role.id)}
              className={cn(
                "rounded-xl border p-4 text-left transition",
                selected
                  ? "border-accent bg-accent/10 ring-1 ring-accent/30"
                  : "border-border bg-background/50 hover:border-accent/40 hover:bg-card-hover",
                disabled && "pointer-events-none opacity-50"
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    selected ? "bg-accent/20" : "bg-border/50"
                  )}
                >
                  <Icon className={cn("h-4 w-4", selected ? "text-accent" : "text-muted")} />
                </div>
                <span className="text-sm font-semibold">{role.name}</span>
              </div>
              <p className="text-xs text-muted leading-relaxed line-clamp-2">{role.description}</p>
              <p className="mt-2 text-xs text-muted">
                Benchmark: <span className="font-medium text-foreground">{role.benchmarks.overall}</span> overall
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
