import React from "react";
import { AlertTriangle } from "lucide-react";
import Button from "../../ui/Button";

export default function PitchLeaveConfirmModal({
  isOpen,
  onContinueEditing,
  onDiscard,
  onSaveDraftAndExit,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        onClick={onContinueEditing}
      />
      <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl border border-gray-100 z-10 text-center animate-in fade-in zoom-in-95 duration-150">
        {/* Warning yellow icon */}
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-amber-50 text-amber-500 border border-amber-200 flex items-center justify-center mx-auto mb-2.5 sm:mb-3">
          <AlertTriangle className="w-5 h-5" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-[#1A3E32] mb-1">
          Leave Create Pitch?
        </h3>
        <p className="text-xs font-semibold text-gray-500 mb-1.5 sm:mb-2">
          You have unsaved progress in your draft
        </p>
        <p className="text-xs text-gray-600 leading-relaxed mb-5 sm:mb-6">
          Do you want to save your Pitch as a draft before leaving? You can resume editing anytime from &quot;My Pitches&quot;.
        </p>

        {/* 3 Actions Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full">
          <Button
            onClick={onContinueEditing}
            variant="gray"
            size="sm"
            className="w-full sm:flex-1 py-2.5 px-3 text-xs font-semibold text-center"
          >
            Continue Editing
          </Button>
          <Button
            onClick={onDiscard}
            variant="outline"
            size="sm"
            className="w-full sm:flex-1 py-2.5 px-3 text-xs font-semibold text-red-500 hover:bg-red-50 border-red-200 text-center"
          >
            Discard &amp; Leave
          </Button>
          <Button
            onClick={onSaveDraftAndExit}
            variant="primary"
            size="sm"
            className="w-full sm:flex-1 py-2.5 px-3 text-xs font-bold whitespace-nowrap text-center"
          >
            Save &amp; Exit
          </Button>
        </div>
      </div>
    </div>
  );
}
