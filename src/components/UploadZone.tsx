"use client";

import { useCallback, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
}

export function UploadZone({ file, onFileChange, disabled }: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      const dropped = e.dataTransfer.files[0];
      if (dropped) onFileChange(dropped);
    },
    [disabled, onFileChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) onFileChange(selected);
  };

  if (file) {
    return (
      <div className="card-glow flex items-center gap-4 rounded-xl border border-border bg-card p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/15">
          <FileText className="h-6 w-6 text-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{file.name}</p>
          <p className="text-sm text-muted">{(file.size / 1024).toFixed(1)} KB</p>
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={() => onFileChange(null)}
            className="rounded-lg p-2 text-muted transition hover:bg-card-hover hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        "card-glow flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors",
        dragOver ? "border-accent bg-accent/5" : "border-border bg-card/50 hover:border-accent/50 hover:bg-card",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <input
        type="file"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
        <Upload className="h-6 w-6 text-accent" />
      </div>
      <p className="mb-1 font-medium">Drop your resume here</p>
      <p className="text-sm text-muted">PDF, DOCX, or TXT — max 5MB</p>
    </label>
  );
}
