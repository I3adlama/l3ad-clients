"use client";

import { STEP_LABELS } from "@/lib/types";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const percent = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="font-ui text-xs tracking-wider uppercase text-accent">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="text-sm text-[var(--text-soft)]">
          {STEP_LABELS[currentStep]}
        </span>
      </div>
      <div className="h-1 bg-noir-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
