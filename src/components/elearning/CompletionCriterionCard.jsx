import React from "react";
import { Check, ChevronRight } from "lucide-react";
import ELearningBadge from "./ELearningBadge";
import ELearningButton from "./ELearningButton";

/**
 * Reusable Numbered Completion Criterion Card (used on Track Progress & Criteria view).
 */
export default function CompletionCriterionCard({
  stepNumber,
  title,
  required = true,
  satisfied = false,
  description,
  targetLabel,
  currentLabel,
  actionLabel,
  onAction,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3.5 min-w-0">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5 ${
            satisfied
              ? "bg-[#16730F] text-white"
              : "bg-[#EEF5EE] text-[#16730F]"
          }`}
        >
          {satisfied ? <Check className="w-3.5 h-3.5" /> : stepNumber}
        </div>

        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-extrabold text-gray-900">{title}</h4>
            {satisfied ? (
              <ELearningBadge variant="statusSuccess">Satisfied</ELearningBadge>
            ) : required ? (
              <ELearningBadge variant="required">REQUIRED</ELearningBadge>
            ) : null}
          </div>

          {description && (
            <p className="text-xs text-gray-500 leading-relaxed">
              {description}
            </p>
          )}

          {(targetLabel || currentLabel) && (
            <p className="text-[11px] text-gray-500 pt-0.5">
              {targetLabel && (
                <>
                  Target:{" "}
                  <span className="font-bold text-gray-800">{targetLabel}</span>
                </>
              )}
              {targetLabel && currentLabel && (
                <span className="mx-1.5 text-gray-300">•</span>
              )}
              {currentLabel && (
                <>
                  Current:{" "}
                  <span className="font-bold text-gray-800">
                    {currentLabel}
                  </span>
                </>
              )}
            </p>
          )}
        </div>
      </div>

      {actionLabel && onAction && (
        <div className="self-start sm:self-center shrink-0">
          <ELearningButton
            variant={satisfied ? "subtleGray" : "primary"}
            size="sm"
            pill
            rightIcon={ChevronRight}
            onClick={onAction}
          >
            {actionLabel}
          </ELearningButton>
        </div>
      )}
    </div>
  );
}

