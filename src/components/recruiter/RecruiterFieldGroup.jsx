import React from "react";
import FormLabel from "../forms/FormLabel";
import RecruiterSelect from "./RecruiterSelect";
// import { RecruiterSelect } from "./recruiterOnboardingUi";

const countWords = (text) => {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
};

const truncateToWordLimit = (text, limit) => {
  const words = String(text ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length <= limit) return text;
  return words.slice(0, limit).join(" ");
};

/**
 * Field groups styled like the jobseeker Bio page (FieldGroup.jsx).
 */
const RecruiterFieldGroup = ({ formData, handleChange, fieldGroups }) => (
  <div className="w-full flex-1 space-y-5">
    {fieldGroups.map((group, i) => (
      <div key={i} className="flex flex-wrap gap-4">
        {group.map((f) => (
          <div key={f.name} className={f.width || "w-full"}>
            <FormLabel
              label={f.label}
              optional={f.optional}
              required={f.required !== false && !f.optional}
            />
            {f.type === "select" ? (
              <RecruiterSelect
                name={f.name}
                value={formData[f.name] ?? ""}
                onChange={handleChange}
                disabled={f.disabled}
                options={f.options || []}
                placeholder={f.placeholder || "Select"}
              />
            ) : f.type === "textarea" ? (
              <>
                <textarea
                  name={f.name}
                  value={formData[f.name] ?? ""}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (f.maxWords != null) {
                      value = truncateToWordLimit(value, f.maxWords);
                    }
                    handleChange({ target: { name: f.name, value } });
                  }}
                  placeholder={f.placeholder}
                  rows={f.rows || 5}
                  maxLength={f.maxWords == null ? f.maxLength : undefined}
                  className="w-full min-h-[120px] bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#16730F] focus:border-transparent transition-all shadow-sm resize-none"
                />
                {f.maxWords != null && (
                  <p className="text-xs text-gray-400 text-right mt-1">
                    {countWords(formData[f.name])}/{f.maxWords} words
                  </p>
                )}
                {f.maxWords == null && f.maxLength != null && (
                  <p className="text-xs text-gray-400 text-right mt-1">
                    {String(formData[f.name] ?? "").length}/{f.maxLength}
                  </p>
                )}
              </>
            ) : (
              <input
                name={f.name}
                value={formData[f.name] ?? ""}
                onChange={handleChange}
                type={f.type || "text"}
                placeholder={f.placeholder}
                disabled={f.disabled}
                className="w-full h-11 bg-white border border-gray-300 rounded-xl px-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#16730F] focus:border-transparent transition-all shadow-sm placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
              />
            )}
            {f.hint && <p className="text-xs text-gray-500 mt-1.5">{f.hint}</p>}
          </div>
        ))}
      </div>
    ))}
  </div>
);

export default RecruiterFieldGroup;
