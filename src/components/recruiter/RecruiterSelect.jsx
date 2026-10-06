import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaChevronDown, FaSearch, FaCheck, FaPlus } from "react-icons/fa";
import FormLabel from "../forms/FormLabel";

const MENU_Z_INDEX = 10060;
const MENU_GAP = 6;
const MENU_MAX_HEIGHT = 224;

/**
 * Shared searchable select used across onboarding, recruitment, and admin.
 * Supports editable top input and custom option creation.
 * Menu is portaled so overflow-hidden parents (modals, scroll areas) cannot clip it.
 */
export function RecruiterSelect({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  required = false,
  optional = false,
  disabled = false,
  tooltip,
  hint,
  className = "",
  id,
  closeBtn = true,
  searchable,
  children,
  editable = false,
  creatable = false,
  onAddNew,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customOptions, setCustomOptions] = useState([]);
  const [menuPos, setMenuPos] = useState(null);

  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const searchInputRef = useRef(null);

  const optionsFromChildren = React.Children.toArray(children)
    .filter((child) => React.isValidElement(child) && child.type === "option")
    .map((child) => ({
      value: child.props.value ?? "",
      label: String(child.props.children ?? child.props.value ?? ""),
    }));

  const sourceOptions =
    Array.isArray(options) && options.length > 0 ? options : optionsFromChildren;

  const allOptions = useMemo(() => {
    const merged = [...sourceOptions, ...customOptions];
    const valTrim = String(value ?? "").trim();
    if (valTrim && (editable || creatable)) {
      const exists = merged.some((opt) => {
        const candidate =
          typeof opt === "string" || typeof opt === "number"
            ? opt
            : opt?.value ?? opt?.label;
        return String(candidate).toLowerCase() === valTrim.toLowerCase();
      });
      if (!exists) {
        merged.unshift({ value: valTrim, label: valTrim });
      }
    }
    return merged;
  }, [sourceOptions, customOptions, value, editable, creatable]);

  const normalizedOptions = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const opt of allOptions) {
      if (opt === null || opt === undefined) continue;
      const item =
        typeof opt === "string" || typeof opt === "number"
          ? { value: opt, label: String(opt) }
          : {
              value: opt.value ?? opt.label ?? "",
              label: String(opt.label ?? opt.value ?? ""),
            };
      const key = String(item.value).toLowerCase().trim();
      if (!key) continue;
      if (!seen.has(key)) {
        seen.add(key);
        list.push(item);
      }
    }
    return list;
  }, [allOptions]);

  const selectedOption = normalizedOptions.find(
    (opt) =>
      String(opt.value).toLowerCase() === String(value ?? "").toLowerCase(),
  );

  const activeQuery = editable
    ? (isSearching ? searchQuery : "").trim().toLowerCase()
    : searchTerm.trim().toLowerCase();

  const filteredOptions = activeQuery
    ? normalizedOptions.filter((opt) =>
        opt.label.toLowerCase().includes(activeQuery)
      )
    : normalizedOptions;

  const typedCandidate = editable
    ? (isSearching ? searchQuery : "").trim()
    : (creatable ? searchTerm : "").trim();

  const hasExactMatch = typedCandidate
    ? normalizedOptions.some(
        (opt) => opt.label.toLowerCase() === typedCandidate.toLowerCase()
      )
    : true;

  const showAddOption =
    (creatable || editable) && Boolean(typedCandidate) && !hasExactMatch;

  const displayValue = isSearching
    ? searchQuery
    : selectedOption
      ? selectedOption.label
      : value !== null && value !== undefined
        ? String(value)
        : "";

  useEffect(() => {
    const handleClickOutside = (event) => {
      const inTrigger = dropdownRef.current?.contains(event.target);
      const inMenu = menuRef.current?.contains(event.target);
      if (!inTrigger && !inMenu) {
        if (editable && isOpen) {
          const currentText = (inputRef.current?.value ?? "").trim();
          if (currentText) {
            const exactMatch = normalizedOptions.find(
              (opt) => opt.label.toLowerCase() === currentText.toLowerCase()
            );
            if (!exactMatch && (creatable || editable)) {
              setCustomOptions((prev) => {
                const exists = prev.some(
                  (opt) =>
                    String(opt.value ?? opt.label ?? opt).toLowerCase() ===
                    currentText.toLowerCase()
                );
                if (exists) return prev;
                return [...prev, { value: currentText, label: currentText }];
              });
              if (onAddNew) onAddNew(currentText);
            }
          }
        }
        setIsOpen(false);
        setIsSearching(false);
        setSearchQuery("");
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [editable, isOpen, creatable, normalizedOptions, onAddNew]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setIsSearching(false);
        setSearchQuery("");
        setSearchTerm("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setIsSearching(false);
      setSearchQuery("");
      setSearchTerm("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!editable && isOpen && menuPos && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [editable, isOpen, menuPos]);

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
    setIsSearching(false);
    setSearchQuery("");
    setSearchTerm("");
  };

  const handleAddCustom = (customVal) => {
    if (disabled) return;
    const trimmed = String(customVal ?? "").trim();
    if (!trimmed) return;

    setCustomOptions((prev) => {
      const exists = prev.some(
        (opt) =>
          String(opt.value ?? opt.label ?? opt).toLowerCase() ===
          trimmed.toLowerCase()
      );
      if (exists) return prev;
      return [...prev, { value: trimmed, label: trimmed }];
    });

    if (onAddNew) {
      onAddNew(trimmed);
    }

    handleSelect(trimmed);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (disabled) return;
    setIsSearching(false);
    setSearchQuery("");
    setSearchTerm("");
    if (onChange) {
      onChange({
        target: {
          name,
          value: "",
        },
      });
    }
    if (editable && inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  };

  const handleInputFocus = (e) => {
    if (disabled) return;
    setIsOpen(true);
    setIsSearching(false);
    setSearchQuery("");
    e.target.select();
  };

  const handleInputClick = (e) => {
    e.stopPropagation();
    if (disabled) return;
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleInputChange = (e) => {
    if (disabled) return;
    const newVal = e.target.value;
    setIsSearching(true);
    setSearchQuery(newVal);
    if (!isOpen) setIsOpen(true);

    if (onChange) {
      onChange({
        target: {
          name,
          value: newVal,
        },
      });
    }
  };

  const handleInputKeyDown = (e) => {
    if (disabled) return;

    if (e.key === "Enter") {
      e.preventDefault();
      const currentVal = (inputRef.current?.value ?? "").trim();
      if (!currentVal) {
        handleSelect("");
        return;
      }

      const exactMatch = normalizedOptions.find(
        (opt) => opt.label.toLowerCase() === currentVal.toLowerCase()
      );

      if (exactMatch) {
        handleSelect(exactMatch.value);
      } else if (creatable || editable) {
        handleAddCustom(currentVal);
      } else if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0].value);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setIsSearching(false);
      setSearchQuery("");
    } else if (e.key === "ArrowDown") {
      if (!isOpen) {
        setIsOpen(true);
      }
    }
  };

  return (
    <div
      className={`relative ${isOpen ? "z-[200]" : "z-0"} ${className}`.trim()}
      ref={dropdownRef}
      id={id}
    >
      {label &&
        (typeof label === "string" ? (
          <FormLabel
            label={label}
            required={required}
            optional={optional}
            tooltip={tooltip}
          />
        ) : (
          label
        ))}

      <div
        ref={triggerRef}
        tabIndex={disabled || editable ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => {
          if (!disabled) {
            if (editable) {
              if (!isOpen) setIsOpen(true);
              inputRef.current?.focus();
            } else {
              setIsOpen((prev) => !prev);
            }
          }
        }}
        onKeyDown={(e) => {
          if (!editable && (e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        className={`w-full h-11 bg-white border ${
          isOpen
            ? "border-[#16730F] ring-2 ring-[#16730F]/20 shadow-sm"
            : "border-gray-200 hover:border-gray-300"
        } rounded-xl px-4 flex items-center justify-between transition-all duration-200 ${
          editable ? "cursor-text" : "cursor-pointer"
        } ${
          disabled
            ? "bg-gray-50 text-gray-400 cursor-not-allowed opacity-75"
            : ""
        }`}
      >
        {editable ? (
          <input
            ref={inputRef}
            type="text"
            id={id ? `${id}-input` : undefined}
            name={name}
            disabled={disabled}
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onClick={handleInputClick}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            className="w-full h-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none font-medium truncate"
          />
        ) : (
          <span
            className={`text-sm truncate select-none ${
              selectedOption ||
              (value !== null &&
                value !== undefined &&
                String(value).trim() !== "")
                ? "text-gray-900 font-medium"
                : "text-gray-400"
            }`}
          >
            {selectedOption
              ? selectedOption.label
              : value !== null &&
                  value !== undefined &&
                  String(value).trim() !== ""
                ? String(value)
                : placeholder}
          </span>
        )}

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {Boolean(closeBtn) &&
            value !== "" &&
            value !== null &&
            value !== undefined &&
            !disabled && (
              <button
                type="button"
                tabIndex={-1}
                onClick={handleClear}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                title="Clear selection"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            )}
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) {
                setIsOpen((prev) => !prev);
                if (!isOpen && editable) {
                  inputRef.current?.focus();
                }
              }
            }}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
            aria-label="Toggle options"
          >
            <FaChevronDown
              className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                isOpen ? "rotate-180 text-[#16730F]" : ""
              }`}
            />
          </button>
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
            {!editable && (searchable ?? normalizedOptions.length >= 4) && (
              <div className="px-3 pb-2 mb-1 border-b border-gray-100">
                <div className="relative flex items-center">
                  <FaSearch className="absolute left-3 w-3.5 h-3.5 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search options..."
                    className="w-full h-9 pl-9 pr-3 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#16730F] focus:ring-1 focus:ring-[#16730F] transition-all"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      <FaTimes className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {showAddOption && (
              <div className="px-2 pb-1.5 mb-1 border-b border-gray-100">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleAddCustom(typedCandidate)}
                  className="w-full px-3 py-2 text-xs font-semibold text-[#16730F] bg-emerald-50 hover:bg-emerald-100/80 rounded-lg flex items-center gap-2 transition-colors text-left"
                >
                  <FaPlus className="w-3 h-3 text-[#16730F] shrink-0" />
                  <span className="truncate">Add &ldquo;{typedCandidate}&rdquo;</span>
                </button>
              </div>
            )}

            <div
              className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 divide-y divide-gray-50/50"
              style={{ maxHeight: menuPos.maxHeight }}
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected =
                    String(opt.value).toLowerCase() ===
                    String(value ?? "").toLowerCase();
                  return (
                    <div
                      key={String(opt.value)}
                      role="option"
                      aria-selected={isSelected}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelect(opt.value)}
                      className={`px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-emerald-50 text-[#16730F] font-semibold"
                          : "text-gray-700 hover:bg-emerald-50/50 hover:text-[#16730F]"
                      }`}
                    >
                      <span className="truncate pr-2">{opt.label}</span>
                      {isSelected && (
                        <FaCheck className="w-3.5 h-3.5 text-[#16730F] shrink-0" />
                      )}
                    </div>
                  );
                })
              ) : !showAddOption ? (
                <div className="px-4 py-6 text-center text-xs text-gray-400">
                  {activeQuery
                    ? `No matches for "${activeQuery}"`
                    : "No options available"}
                </div>
              ) : null}
            </div>
          </div>,
          document.body,
        )}

      {hint && <p className="text-xs text-gray-500 mt-1.5">{hint}</p>}
    </div>
  );
}

export default RecruiterSelect;
