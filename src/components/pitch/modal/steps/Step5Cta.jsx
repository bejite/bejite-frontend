import React, { useState, useEffect } from "react";
import { Check, Plus, X, Trash2 } from "lucide-react";
import { CTA_OPTIONS } from "../pitchModalConstants";
import Button from "../../../ui/Button";

// Keep custom CTAs in memory so navigating back/forth between modal steps preserves them
let savedCustomCtas = [];

export default function Step5Cta({ ctaType, onSelectCta }) {
  const [customOptions, setCustomOptions] = useState(() => savedCustomCtas);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [titleError, setTitleError] = useState("");

  // Ensure any custom ctaType that was previously selected (e.g. from draft) is represented
  const allCustomOptions = [...customOptions];
  if (
    ctaType &&
    !CTA_OPTIONS.some((opt) => opt.id === ctaType) &&
    !allCustomOptions.some((opt) => opt.id === ctaType)
  ) {
    allCustomOptions.push({
      id: ctaType,
      desc: "Custom call to action",
      isCustom: true,
    });
  }

  const allOptions = [...CTA_OPTIONS, ...allCustomOptions];

  // Close modal on Escape key
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
        setTitleError("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const handleOpenModal = () => {
    setCustomTitle("");
    setCustomDesc("");
    setTitleError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTitleError("");
  };

  const handleSaveCustom = (e) => {
    e?.preventDefault();
    const trimmedTitle = customTitle.trim();
    if (!trimmedTitle) {
      setTitleError("Please enter a title for your call to action.");
      return;
    }

    const newOption = {
      id: trimmedTitle,
      desc: customDesc.trim() || "Custom call to action",
      isCustom: true,
    };

    // Replace if an option with the same ID already exists, or append
    const updated = [
      ...savedCustomCtas.filter(
        (opt) => opt.id.toLowerCase() !== trimmedTitle.toLowerCase()
      ),
      newOption,
    ];
    savedCustomCtas = updated;
    setCustomOptions(updated);

    // Pre-select the new custom CTA
    onSelectCta(trimmedTitle);

    handleCloseModal();
  };

  const handleDeleteCustom = (idToDelete) => {
    const updated = savedCustomCtas.filter((opt) => opt.id !== idToDelete);
    savedCustomCtas = updated;
    setCustomOptions(updated);
    if (ctaType === idToDelete) {
      onSelectCta("");
    }
  };

  return (
    <div className="space-y-3.5 sm:space-y-4">
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-[#1A3E32]">
          Choose Your Call to Action
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
          Select what viewers should do when they want to connect or work with you.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
        {allOptions.map((item) => {
          const isSelected = ctaType === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onSelectCta(item.id)}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                isSelected
                  ? "border-[#16730F] bg-green-50/30 shadow-sm ring-1 ring-[#16730F]"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="min-w-0 pr-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-bold text-xs sm:text-sm text-[#1A3E32] truncate">
                    {item.id}
                  </h4>
                  {item.isCustom && (
                    <span className="text-[9px] sm:text-[10px] font-semibold text-[#16730F] bg-green-100/70 px-1.5 py-0.5 rounded-md">
                      Custom
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {item.desc}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {item.isCustom && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCustom(item.id);
                    }}
                    title="Delete custom option"
                    className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-[#16730F] border-[#16730F] text-white"
                      : "border-gray-300"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            </div>
          );
        })}

        {/* Choosing what to write Card */}
        <div
          onClick={handleOpenModal}
          className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#16730F] hover:bg-green-50/20 bg-gray-50/50 transition-all cursor-pointer flex items-center justify-between gap-2.5 group"
        >
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-[#1A3E32] group-hover:text-[#16730F] transition-colors flex items-center gap-1.5">
              Choosing what to write
            </h4>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
              Create a custom call to action with your own title and description
            </p>
          </div>

          <div className="w-5 h-5 rounded-full border border-gray-300 group-hover:border-[#16730F] group-hover:bg-[#16730F] group-hover:text-white text-gray-400 transition-all flex items-center justify-center shrink-0">
            <Plus className="w-3 h-3 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Modal Popup to Write Custom Title & Description */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={handleCloseModal}
          />

          <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-gray-100 z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#1A3E32]">
                  Choosing What to Write
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Write your custom call to action title and description.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustom} className="space-y-3.5 sm:space-y-4">
              <div>
                <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-gray-700 uppercase mb-1 sm:mb-1.5">
                  <span>Call to Action Title</span>
                  <span className="text-gray-400 font-normal text-[10px] sm:text-xs">
                    {customTitle.length}/40
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={40}
                  value={customTitle}
                  onChange={(e) => {
                    setCustomTitle(e.target.value);
                    if (titleError) setTitleError("");
                  }}
                  placeholder="e.g. Schedule a Demo, Hire as Consultant"
                  className={`w-full p-2.5 sm:p-3 rounded-xl border text-xs sm:text-sm focus:outline-none transition-colors ${
                    titleError
                      ? "border-red-400 focus:border-red-500 bg-red-50/20"
                      : "border-gray-300 focus:border-[#16730F]"
                  }`}
                  autoFocus
                />
                {titleError && (
                  <p className="text-[11px] text-red-500 mt-1">{titleError}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-gray-700 uppercase mb-1 sm:mb-1.5">
                  <span>Description</span>
                  <span className="text-gray-400 font-normal text-[10px] sm:text-xs">
                    {customDesc.length}/140
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={140}
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="e.g. Prompt viewers to book a discovery session or view custom pricing..."
                  className="w-full p-2.5 sm:p-3 rounded-xl border border-gray-300 focus:border-[#16730F] focus:outline-none text-xs sm:text-sm resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  onClick={handleCloseModal}
                  variant="outline"
                  size="sm"
                  className="py-2 px-4 text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="py-2 px-5 text-xs font-bold"
                >
                  Save CTA
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

