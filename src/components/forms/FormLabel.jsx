import React, { useState, useRef, useEffect } from "react";

const FormLabel = ({
  label,
  required = false,
  optional = false,
  tooltip,
  className = "text-gray-600",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block mb-1.5 max-w-full">
      <label
        style={{ fontFamily: "NunitoBold", fontWeight: "bold" }}
        className={`inline-flex items-center flex-wrap text-[11px] font-bold ${className}`}
      >
        <span style={{ fontFamily: "NunitoBold", fontWeight: "bold" }}>
          {label}
        </span>

        {required && (
          <span
            style={{ fontFamily: "NunitoBold", fontWeight: "bold" }}
            className="ml-1 text-red-500"
          >
            *
          </span>
        )}

        {optional && (
          <span
            style={{ fontFamily: "NunitoSemi", fontWeight: "bold" }}
            className="ml-1 text-gray-400 font-medium normal-case"
          >
            (Optional)
          </span>
        )}

        {tooltip && (
          <span
            ref={triggerRef}
            className="relative inline-flex items-center ml-1.5 align-middle"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen((prev) => !prev);
              }}
              aria-label={`About ${label}`}
              className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all duration-150 cursor-pointer shadow-xs focus:outline-none ${
                isOpen
                  ? "bg-[#16730F] text-white border-[#16730F] scale-110"
                  : "bg-emerald-50 text-[#16730F] border-emerald-300 hover:bg-[#16730F] hover:text-white hover:border-[#16730F]"
              }`}
              style={{ fontFamily: "NunitoBold", fontWeight: "bold" }}
            >
              ?
            </button>

            {/* Hover/Touch Dropdown Tooltip */}
            {isOpen && (
              <div
                className="absolute bottom-full left-0 mb-2.5 z-[9999] w-64 sm:w-72 bg-white border border-emerald-200/90 rounded-xl shadow-2xl p-3 text-left pointer-events-none transition-all duration-150 animate-fadeIn"
                style={{
                  boxShadow:
                    "0 10px 25px -5px rgba(22, 115, 15, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)",
                }}
              >
                {/* Header with pill and label */}
                <div className="flex items-center gap-1.5 pb-1.5 mb-1.5 border-b border-gray-100">
                  <span className="w-2 h-2 rounded-full bg-[#16730F]"></span>
                  <span
                    style={{ fontFamily: "NunitoBold", fontWeight: "bold" }}
                    className="text-[11px] text-[#16730F] uppercase tracking-wider truncate"
                  >
                    {label}
                  </span>
                </div>

                {/* Description */}
                <p
                  style={{ fontFamily: "NunitoSemi", fontWeight: "600" }}
                  className="text-[11px] text-gray-700 leading-relaxed normal-case"
                >
                  {tooltip}
                </p>

                {/* Bottom arrow notch */}
                <div className="absolute -bottom-1.5 left-2.5 w-3 h-3 bg-white border-b border-r border-emerald-200/90 rotate-45"></div>
              </div>
            )}
          </span>
        )}
      </label>
    </div>
  );
};

export default FormLabel;

