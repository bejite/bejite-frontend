import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { FaCheck, FaPlus } from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance";
import {
  getPortaledMenuStyle,
  usePortaledMenu,
} from "../../hooks/usePortaledMenu";

export function AutocompleteInput({
  value,
  onChange,
  onOptionSelect,
  placeholder,
  formName,
  fieldName,
  staticOptions = [],
  type = "text",
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const { triggerRef, menuRef, menuPos } = usePortaledMenu({
    isOpen: open,
    onClose: () => setOpen(false),
    maxHeight: 208,
    extraContainRefs: [containerRef],
  });

  useEffect(() => {
    let cancelled = false;

    const fetchSuggestions = async () => {
      try {
        const res = await axiosInstance.get(
          `/api/cv-builder/suggestions/${formName}/${fieldName}`,
          { params: { q: value || "" } },
        );
        if (!cancelled && res.data?.success) {
          setSuggestions(res.data.data || []);
        }
      } catch {
        if (!cancelled) setSuggestions([]);
      }
    };

    fetchSuggestions();
    return () => {
      cancelled = true;
    };
  }, [formName, fieldName, value]);

  const filteredOptions = useMemo(() => {
    const merged = [
      ...new Set(
        [...staticOptions, ...suggestions].filter(
          (opt) => opt && opt !== "Not Available",
        ),
      ),
    ];
    const query = value.trim().toLowerCase();
    if (!query) return merged.slice(0, 15);
    return merged
      .filter((opt) => opt.toLowerCase().includes(query))
      .slice(0, 15);
  }, [staticOptions, suggestions, value]);

  const trimmedValue = value.trim();
  const hasExactMatch = filteredOptions.some(
    (opt) => opt.toLowerCase() === trimmedValue.toLowerCase(),
  );
  const showAddOption = trimmedValue && !hasExactMatch;

  const selectOption = (option) => {
    onChange({ target: { value: option } });
    onOptionSelect?.(option);
    setOpen(false);
  };

  const showDropdown =
    open && (filteredOptions.length > 0 || showAddOption) && type === "text";

  return (
    <div
      className={`relative w-full ${open ? "z-[200]" : "z-0"}`}
      ref={containerRef}
    >
      <input
        ref={triggerRef}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className={`w-full h-11 bg-white border border-gray-300 rounded-xl px-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3E32] focus:border-transparent transition-all shadow-sm placeholder-gray-400 ${
          type === "date" && value ? "hide-calendar-icon" : ""
        }`}
      />
      {value && (
        <FaCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-lg pointer-events-none" />
      )}

      {showDropdown &&
        menuPos &&
        typeof document !== "undefined" &&
        createPortal(
          <ul
            ref={menuRef}
            className="overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl isolate"
            style={{
              ...getPortaledMenuStyle(menuPos),
              maxHeight: menuPos.maxHeight,
            }}
          >
            {filteredOptions.map((option) => (
              <li key={option} className="bg-white">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectOption(option)}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  {option}
                </button>
              </li>
            ))}
            {showAddOption && (
              <li className="bg-white">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectOption(trimmedValue)}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#1A3E32] font-medium bg-white hover:bg-green-50 flex items-center gap-2 border-t border-gray-100"
                >
                  <FaPlus className="text-xs" />
                  Add &quot;{trimmedValue}&quot;
                </button>
              </li>
            )}
          </ul>,
          document.body,
        )}
    </div>
  );
}

export default AutocompleteInput;
