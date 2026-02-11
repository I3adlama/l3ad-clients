"use client";

import BevelButton from "@/components/ui/BevelButton";

interface StepWrapperProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext: () => void;
  onBack?: () => void;
  isFirst: boolean;
  isLast: boolean;
  isSaving: boolean;
}

export default function StepWrapper({
  title,
  subtitle,
  children,
  onNext,
  onBack,
  isFirst,
  isLast,
  isSaving,
}: StepWrapperProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-display">{title}</h2>
        {subtitle && (
          <p className="text-[var(--text-soft)] mt-1">{subtitle}</p>
        )}
      </div>

      <div className="space-y-5">{children}</div>

      <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
        {!isFirst ? (
          <BevelButton
            variant="secondary"
            size="sm"
            onClick={onBack}
            disabled={isSaving}
          >
            Back
          </BevelButton>
        ) : (
          <div />
        )}

        <BevelButton onClick={onNext} disabled={isSaving}>
          {isSaving ? "Saving..." : isLast ? "Submit" : "Next"}
        </BevelButton>
      </div>
    </div>
  );
}
