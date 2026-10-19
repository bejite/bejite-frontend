import React from "react";
import { RecruiterSelect } from "../recruiter/recruiterOnboardingUi";

export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  options = [],
  rows = 4,
  required = false,
  error,
  helperText,
  className = "",
  inputClassName = "",
  searchable,
  children: _children,
  ...props
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {type === "select" ? (
        <RecruiterSelect
          label={label}
          name={name}
          value={value}
          onChange={onChange}
          options={options}
          placeholder={placeholder || "Select option"}
          required={required}
          searchable={searchable}
        />
      ) : (
        <>
          {label && (
            <label className="block text-xs font-bold text-[#1A3E32]">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
          )}
          {type === "textarea" ? (
            <textarea
              rows={rows}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              className={`w-full bg-white border border-gray-300 text-gray-800 text-xs sm:text-sm p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16730F]/40 placeholder:text-gray-400 font-medium resize-none ${inputClassName}`}
              {...props}
            />
          ) : (
            <input
              type={type}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              className={`w-full bg-white border border-gray-300 text-gray-800 text-xs sm:text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16730F]/40 placeholder:text-gray-400 font-medium ${inputClassName}`}
              {...props}
            />
          )}
        </>
      )}

      {helperText && (
        <p className="text-[11px] text-gray-500 font-normal">{helperText}</p>
      )}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
