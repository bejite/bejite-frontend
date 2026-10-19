import { useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Type } from "lucide-react";
import {
  getPortaledMenuStyle,
  usePortaledMenu,
} from "../../../hooks/usePortaledMenu";

const FONT_FAMILIES = [
  { name: "Sans-Serif (Clean)", value: "Arial, sans-serif" },
  { name: "Serif (Classic)", value: "Georgia, serif" },
  { name: "Monospace (Code)", value: "Courier New, monospace" },
  { name: "Outfit (Modern)", value: "Outfit, sans-serif" },
  { name: "Playfair (Elegant)", value: "Playfair Display, serif" },
];

const FontSelectorDropdown = ({ currentFontName, onSelectFont }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { triggerRef, menuRef, menuPos } = usePortaledMenu({
    isOpen,
    onClose: () => setIsOpen(false),
    minWidth: 192,
    maxHeight: 280,
  });

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-gray-50 transition-colors"
      >
        <Type size={14} className="text-gray-500" />
        <span>{currentFontName}</span>
        <ChevronDown size={12} className="text-gray-400" />
      </button>

      {isOpen &&
        menuPos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className="bg-white border border-gray-200 rounded-xl shadow-xl p-1 text-left"
            style={getPortaledMenuStyle(menuPos)}
          >
            {FONT_FAMILIES.map((font) => (
              <button
                key={font.name}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelectFont(font);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-xs text-gray-700 hover:bg-green-50 hover:text-[#16730F] font-medium rounded-lg text-left transition-colors cursor-pointer"
                style={{ fontFamily: font.value }}
              >
                {font.name}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default FontSelectorDropdown;
