import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Sparkles,
  RotateCcw,
  Check,
  CalendarDays,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Calculates exact age in years from YYYY-MM-DD
 */
export const calculateAge = (dateString) => {
  if (!dateString) return null;
  const parts = dateString.split("-");
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const birthDate = new Date(year, month, day);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
};

/**
 * Formats YYYY-MM-DD to "15 Oct 1998"
 */
export const formatDateDisplay = (dateString) => {
  if (!dateString) return "";
  const parts = dateString.split("-");
  if (parts.length !== 3) return dateString;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(monthIdx) || monthIdx < 0 || monthIdx > 11 || isNaN(day)) {
    return dateString;
  }
  const monthName = MONTHS[monthIdx]?.substring(0, 3);
  return `${day} ${monthName} ${year}`;
};

const DobCalendarPicker = ({
  value = "",
  onChange,
  onAgeChange,
  name = "dob",
  placeholder = "Select date of birth",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState("calendar"); // "calendar" | "yearGrid" | "monthGrid"

  const today = useMemo(() => new Date(), []);
  const defaultYear = value
    ? new Date(value).getFullYear()
    : today.getFullYear() - 20;
  const defaultMonth = value ? new Date(value).getMonth() : 0;

  const [currentYear, setCurrentYear] = useState(defaultYear);
  const [currentMonth, setCurrentMonth] = useState(defaultMonth);

  const yearGridRef = useRef(null);

  // Sync internal year/month when value changes
  useEffect(() => {
    if (value) {
      const parts = value.split("-");
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        if (!isNaN(y) && !isNaN(m)) {
          setCurrentYear(y);
          setCurrentMonth(m);
        }
      }
    }
  }, [value]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Generate Year options (1940 to current year)
  const maxYear = today.getFullYear();
  const minYear = 1940;
  const yearsList = useMemo(() => {
    const list = [];
    for (let y = maxYear; y >= minYear; y--) {
      list.push(y);
    }
    return list;
  }, [maxYear, minYear]);

  // Decades list for fast DOB scrolling
  const decades = [
    { label: "2010s", start: 2010, end: 2019 },
    { label: "2000s", start: 2000, end: 2009 },
    { label: "1990s", start: 1990, end: 1999 },
    { label: "1980s", start: 1980, end: 1989 },
    { label: "1970s", start: 1970, end: 1979 },
    { label: "1960s", start: 1960, end: 1969 },
    { label: "1950s", start: 1950, end: 1959 },
  ];

  // Calendar days grid
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // Prev month padding
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        dateString: null,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, "0");
      const dayStr = String(d).padStart(2, "0");
      const dateStr = `${currentYear}-${monthStr}-${dayStr}`;

      const cellDate = new Date(currentYear, currentMonth, d);
      const isFuture = cellDate > today;

      days.push({
        day: d,
        isCurrentMonth: true,
        dateString: dateStr,
        isFuture,
      });
    }

    // Next month padding
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        dateString: null,
      });
    }

    return days;
  }, [currentYear, currentMonth, today]);

  // When user clicks on a day cell
  const handleSelectDate = (dateStr) => {
    if (!dateStr) return;
    const ageVal = calculateAge(dateStr);

    if (onChange) {
      onChange({
        target: {
          name,
          value: dateStr,
        },
      });
    }

    if (onAgeChange && ageVal !== null) {
      onAgeChange(String(ageVal));
    }

    // Immediately close modal upon selecting date so it instantly populates the field
    setIsOpen(false);
    setViewMode("calendar");
  };

  const handleConfirmAndClose = () => {
    setIsOpen(false);
    setViewMode("calendar");
  };

  const handleClear = (e) => {
    if (e) e.stopPropagation();
    if (onChange) {
      onChange({
        target: {
          name,
          value: "",
        },
      });
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const scrollToDecade = (year) => {
    setCurrentYear(year);
    if (yearGridRef.current) {
      const targetElement = document.getElementById(`modal-year-btn-${year}`);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const currentAge = calculateAge(value);

  // Modal Content Component
  const modalJSX = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Dark Blurred Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleConfirmAndClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Centered Modal Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative w-full max-w-[390px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 z-10"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#1A3E32] via-[#16730F] to-[#1A3E32] text-white p-5 relative">
              <button
                type="button"
                onClick={handleConfirmAndClose}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-emerald-300">
                  <CalendarDays className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold tracking-wide uppercase text-emerald-200">
                    Date of Birth
                  </h3>
                  <p className="text-[11px] text-white/80">
                    Select your official birth date
                  </p>
                </div>
              </div>

              {/* Selected Date Summary & Age Pill */}
              <div className="mt-3.5 pt-3 border-t border-white/15 flex items-center justify-between">
                <div>
                  <span className="text-xs text-white/70 block font-medium">
                    Selected Date:
                  </span>
                  <span className="text-lg font-black tracking-tight text-white">
                    {value ? formatDateDisplay(value) : "Not selected"}
                  </span>
                </div>

                {currentAge !== null ? (
                  <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black border border-white/30 text-white shadow-xs">
                    🎉 {currentAge} yrs old
                  </div>
                ) : (
                  <span className="text-xs text-emerald-200 italic font-medium">
                    Select a date below
                  </span>
                )}
              </div>

              {/* Navigation Bar */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/15">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setViewMode(viewMode === "monthGrid" ? "calendar" : "monthGrid")
                    }
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                      viewMode === "monthGrid"
                        ? "bg-white text-[#16730F] shadow-sm"
                        : "bg-white/15 text-white hover:bg-white/25"
                    }`}
                  >
                    <span>{MONTHS[currentMonth]}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setViewMode(viewMode === "yearGrid" ? "calendar" : "yearGrid")
                    }
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                      viewMode === "yearGrid"
                        ? "bg-white text-[#16730F] shadow-sm"
                        : "bg-white/15 text-white hover:bg-white/25"
                    }`}
                  >
                    <span>{currentYear}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                  </button>
                </div>

                {viewMode === "calendar" && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
                      title="Previous Month"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      disabled={
                        currentYear === today.getFullYear() &&
                        currentMonth === today.getMonth()
                      }
                      className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Next Month"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 bg-white">
              {/* VIEW 1: Year Grid Selector with Decade Pills */}
              {viewMode === "yearGrid" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
                    {decades.map((dec) => {
                      const isActive =
                        currentYear >= dec.start && currentYear <= dec.end;
                      return (
                        <button
                          key={dec.label}
                          type="button"
                          onClick={() => scrollToDecade(dec.start + 5)}
                          className={`px-3 py-1 rounded-full whitespace-nowrap font-extrabold transition-all cursor-pointer ${
                            isActive
                              ? "bg-[#16730F] text-white shadow-xs"
                              : "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-[#16730F]"
                          }`}
                        >
                          {dec.label}
                        </button>
                      );
                    })}
                  </div>

                  <div
                    ref={yearGridRef}
                    className="grid grid-cols-4 gap-2 max-h-[240px] overflow-y-auto pr-1"
                  >
                    {yearsList.map((yr) => (
                      <button
                        key={yr}
                        id={`modal-year-btn-${yr}`}
                        type="button"
                        onClick={() => {
                          setCurrentYear(yr);
                          setViewMode("monthGrid");
                        }}
                        className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                          yr === currentYear
                            ? "bg-[#16730F] text-white shadow-md scale-105"
                            : "bg-gray-50 text-gray-700 hover:bg-emerald-50 hover:text-[#16730F]"
                        }`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW 2: Month Grid Selector */}
              {viewMode === "monthGrid" && (
                <div className="grid grid-cols-3 gap-2.5 py-1">
                  {MONTHS.map((mName, idx) => (
                    <button
                      key={mName}
                      type="button"
                      onClick={() => {
                        setCurrentMonth(idx);
                        setViewMode("calendar");
                      }}
                      className={`py-3.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                        idx === currentMonth
                          ? "bg-[#16730F] text-white shadow-md scale-105"
                          : "bg-gray-50 text-gray-700 hover:bg-emerald-50 hover:text-[#16730F]"
                      }`}
                    >
                      {mName.substring(0, 3)}
                    </button>
                  ))}
                </div>
              )}

              {/* VIEW 3: Calendar Days Matrix */}
              {viewMode === "calendar" && (
                <>
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {DAYS_OF_WEEK.map((d) => (
                      <span
                        key={d}
                        className="text-xs font-extrabold text-gray-400 uppercase tracking-wider py-1"
                      >
                        {d[0]}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {calendarDays.map((item, idx) => {
                      if (!item.isCurrentMonth) {
                        return (
                          <div
                            key={`empty-${idx}`}
                            className="h-9 flex items-center justify-center text-gray-300 text-xs select-none"
                          >
                            {item.day}
                          </div>
                        );
                      }

                      const isSelected = value === item.dateString;

                      return (
                        <button
                          key={item.dateString}
                          type="button"
                          disabled={item.isFuture}
                          onClick={() => handleSelectDate(item.dateString)}
                          className={`h-9 w-full rounded-2xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#16730F] text-white shadow-lg scale-110 ring-4 ring-emerald-200/60 font-black"
                              : item.isFuture
                              ? "text-gray-300 cursor-not-allowed opacity-30"
                              : "text-gray-700 hover:bg-emerald-100 hover:text-[#16730F] hover:scale-105"
                          }`}
                        >
                          {item.day}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const targetYear = today.getFullYear() - 25;
                  setCurrentYear(targetYear);
                  setCurrentMonth(5);
                  setViewMode("calendar");
                }}
                className="text-xs font-bold text-[#16730F] hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Jump to ~25 yrs ago</span>
              </button>

              <div className="flex items-center gap-2">
                {value && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-3 py-1.5 text-gray-500 hover:text-gray-800 font-bold text-xs cursor-pointer"
                  >
                    Clear
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleConfirmAndClose}
                  className="px-4 py-2 bg-[#16730F] hover:bg-[#125c0c] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Done</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={`w-full h-11 bg-white border rounded-xl px-3.5 flex items-center justify-between text-left transition-all duration-200 shadow-xs cursor-pointer ${
          isOpen
            ? "border-[#16730F] ring-2 ring-[#16730F]/20 shadow-sm"
            : "border-gray-300 hover:border-gray-400"
        } ${disabled ? "opacity-60 cursor-not-allowed bg-gray-50" : ""}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-1 overflow-hidden">
          <CalendarIcon className="w-4.5 h-4.5 text-[#16730F] shrink-0" />
          <span
            className={`text-sm truncate whitespace-nowrap ${
              value ? "font-bold text-gray-800" : "text-gray-400 font-normal"
            }`}
          >
            {value ? formatDateDisplay(value) : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-1">
          {currentAge !== null && (
            <span className="px-2.5 py-0.5 text-xs font-black bg-emerald-100 text-[#16730F] rounded-md whitespace-nowrap">
              {currentAge} yrs
            </span>
          )}

          {value && (
            <span
              role="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="Clear date"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}

          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </button>

      {/* Render Modal into Portal */}
      {typeof document !== "undefined" && createPortal(modalJSX, document.body)}
    </div>
  );
};

export default DobCalendarPicker;
