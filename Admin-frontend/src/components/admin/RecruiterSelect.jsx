import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaChevronDown, FaSearch, FaCheck } from "react-icons/fa";

const MENU_Z_INDEX = 10060;
const MENU_GAP = 6;
const MENU_MAX_HEIGHT = 224;

export function RecruiterSelect({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  required = false,
  disabled = false,
  hint,
  className = "",
  id,
  closeBtn = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuPos, setMenuPos] = useState(null);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const searchInputRef = useRef(null);

  const normalizedOptions = Array.isArray(options)
    ? options.map((opt) => {
        if (typeof opt === "string" || typeof opt === "number") {
          return { value: opt, label: String(opt) };
        }
        return {
          value: opt.value ?? opt.label ?? "",
          label: String(opt.label ?? opt.value ?? ""),
        };
      })
    : [];

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value),
  );

  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase().trim()),
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      const inTrigger = dropdownRef.current?.contains(event.target);
      const inMenu = menuRef.current?.contains(event.target);
      if (!inTrigger && !inMenu) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && menuPos && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, menuPos]);

  useEffect(() => {
    if (!isOpen) {
      setMenuPos(null);
      return undefined;
    }

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const margin = 8;
      const width = Math.max(rect.width, 140);
      const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP - margin;
      const spaceAbove = rect.top - MENU_GAP - margin;
      const openUp = spaceBelow < 140 && spaceAbove > spaceBelow;

      let left = rect.left;
      if (left + width > window.innerWidth - margin) {
        left = Math.max(margin, window.innerWidth - width - margin);
      }
      if (left < margin) left = margin;

      setMenuPos({
        top: openUp ? undefined : rect.bottom + MENU_GAP,
        bottom: openUp ? window.innerHeight - rect.top + MENU_GAP : undefined,
        left,
        width,
        maxHeight: Math.max(
          120,
          Math.min(MENU_MAX_HEIGHT, openUp ? spaceAbove : spaceBelow),
        ),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  const handleSelect = (val) => {
    if (disabled) return;
    if (onChange) {
      onChange({
        target: {
          name,
          value: val,
        },
      });
    }
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (disabled) return;
    if (onChange) {
      onChange({
        target: {
          name,
          value: "",
        },
      });
    }
  };

  return (
    <div className={`relative ${className}`.trim()} ref={dropdownRef} id={id}>
      {label &&
        (typeof label === "string" ? (
          <label className="block mb-1.5 text-xs font-bold text-gray-700 tracking-wide">
            {label} {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        ) : (
          label
        ))}

      {/* Main Trigger Button */}
      <div
        ref={triggerRef}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        className={`w-full h-10 bg-white border ${
          isOpen
            ? "border-[#16730F] ring-2 ring-[#16730F]/20 shadow-sm"
            : "border-gray-200 hover:border-gray-300"
        } rounded-xl px-3 flex items-center justify-between cursor-pointer transition-all duration-200 ${
          disabled
            ? "bg-gray-50 text-gray-400 cursor-not-allowed opacity-75"
            : ""
        }`}
      >
        <span
          className={`text-xs sm:text-sm truncate select-none ${
            selectedOption
              ? "text-gray-900 font-semibold"
              : "text-gray-400 font-normal"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {Boolean(closeBtn) &&
            value !== "" &&
            value !== null &&
            value !== undefined &&
            !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                title="Clear selection"
              >
                <FaTimes className="w-2.5 h-2.5" />
              </button>
            )}
          <FaChevronDown
            className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[#16730F]" : ""
            }`}
          />
        </div>
      </div>

      {isOpen &&
        !disabled &&
        menuPos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className="bg-white rounded-xl shadow-2xl border border-gray-100 py-2 overflow-hidden min-w-[140px]"
            style={{
              position: "fixed",
              top: menuPos.top,
              bottom: menuPos.bottom,
              left: menuPos.left,
              width: menuPos.width,
              zIndex: MENU_Z_INDEX,
            }}
          >
            {normalizedOptions.length >= 4 && (
              <div className="px-3 pb-2 mb-1 border-b border-gray-100">
                <div className="relative flex items-center">
                  <FaSearch className="absolute left-3 w-3 h-3 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="w-full h-8 pl-8 pr-3 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#16730F] focus:ring-1 focus:ring-[#16730F] transition-all"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      <FaTimes className="w-2 h-2" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div
              className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 divide-y divide-gray-50/50"
              style={{ maxHeight: menuPos.maxHeight }}
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = String(opt.value) === String(value);
                  return (
                    <div
                      key={opt.value}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(opt.value)}
                      className={`px-3.5 py-2 text-xs sm:text-sm cursor-pointer flex items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-emerald-50 text-[#16730F] font-semibold"
                          : "text-gray-700 hover:bg-emerald-50/50 hover:text-[#16730F]"
                      }`}
                    >
                      <span className="truncate pr-2">{opt.label}</span>
                      {isSelected && (
                        <FaCheck className="w-3 h-3 text-[#16730F] shrink-0" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-6 text-center text-xs text-gray-400">
                  {searchTerm
                    ? `No matches for "${searchTerm}"`
                    : "No options available"}
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}

      {hint && <p className="text-xs text-gray-500 mt-1.5">{hint}</p>}
    </div>
  );
}

export default RecruiterSelect;
