import React from "react";
import { Loader2 } from "lucide-react";
import Button from "../../ui/Button";

export default function PitchModalFooter({
  step,
  totalSteps = 6,
  isPublishing,
  onBack,
  onContinue,
  onPublish,
}) {
  return (
    <div className="px-3.5 sm:px-6 py-3 sm:py-4 border-t border-gray-100 bg-white shrink-0 flex items-center justify-between gap-2.5 sm:gap-3">
      {step > 1 ? (
        <Button
          onClick={onBack}
          disabled={isPublishing}
          variant="gray"
          size="sm"
          className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold"
        >
          back
        </Button>
      ) : (
        <div />
      )}

      {step < totalSteps ? (
        <Button
          onClick={onContinue}
          variant="primary"
          size="sm"
          className="px-6 sm:px-8 py-2 sm:py-2.5 text-xs sm:text-sm font-bold ml-auto"
        >
          Continue
        </Button>
      ) : (
        <Button
          onClick={onPublish}
          disabled={isPublishing}
          variant="primary"
          size="sm"
          className="min-w-[120px] sm:min-w-[130px] px-6 sm:px-8 py-2 sm:py-2.5 text-xs sm:text-sm font-bold ml-auto"
        >
          {isPublishing ? (
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-white" />
          ) : (
            "Publish Pitch"
          )}
        </Button>
      )}
    </div>
  );
}
