import React from "react";
import { Video, X } from "lucide-react";
import Button from "../../ui/Button";

export default function PitchModalHeader({ onSaveDraft, onClose }) {
  return (
    <div className="flex items-center justify-between px-3.5 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-white shrink-0">
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#16730F] flex items-center justify-center text-white shadow-sm shrink-0">
          <Video className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base md:text-lg font-bold text-[#1A3E32] leading-tight">
            Create Pitch
          </h2>
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium">
            Professional Opportunity Creation
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <Button
          onClick={onSaveDraft}
          variant="lightGreen"
          size="sm"
          className="text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3.5 py-1 sm:py-1.5"
        >
          Save Draft
        </Button>
        <button
          type="button"
          onClick={onClose}
          className="p-1 sm:p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}
