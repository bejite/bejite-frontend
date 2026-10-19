import { useState } from "react";
import { Plus } from "lucide-react";
import { AutocompleteInput } from "./AutocompleteInput";

export function MultiAutocompleteField({
  label,
  placeholder,
  formName,
  fieldName,
  staticOptions = [],
  selectedValues = [],
  onChange,
  addButtonLabel = "Add",
}) {
  const [draft, setDraft] = useState("");

  const addValue = (rawValue) => {
    const value = String(rawValue || "").trim();
    if (!value) return;

    const exists = selectedValues.some(
      (item) => item.toLowerCase() === value.toLowerCase(),
    );
    if (exists) {
      setDraft("");
      return;
    }

    onChange([...selectedValues, value]);
    setDraft("");
  };

  const removeValue = (value) => {
    onChange(selectedValues.filter((item) => item !== value));
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addValue(draft);
    }
  };

  return (
    <div className="mb-5 relative overflow-visible">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedValues.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => removeValue(value)}
              className="px-3 py-1.5 rounded-full text-xs sm:text-sm bg-[#1A3E32] text-white shadow-sm"
            >
              {value} ×
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1" onKeyDown={handleKeyDown}>
          <AutocompleteInput
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onOptionSelect={addValue}
            placeholder={placeholder}
            formName={formName}
            fieldName={fieldName}
            staticOptions={staticOptions}
          />
        </div>
        <button
          type="button"
          onClick={() => addValue(draft)}
          disabled={!draft.trim()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A3E32] text-white text-sm font-medium hover:bg-[#2d6a54] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Plus className="w-4 h-4" />
          {addButtonLabel}
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        Type to search, pick from the list, or add your own value.
      </p>
    </div>
  );
}

export default MultiAutocompleteField;
