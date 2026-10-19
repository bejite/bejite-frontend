import FormLabel from "../forms/FormLabel";

export { RecruiterSelect } from "./RecruiterSelect";

const inputClass =
  "w-full h-11 bg-white border border-gray-200 rounded-xl px-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#16730F] focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500";

const textareaClass =
  "w-full min-h-[120px] bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#16730F] focus:border-transparent transition-all resize-none";

export function RecruiterPageHero({ icon: Icon, eyebrow, title, description }) {
  return (
    <div className="text-center mb-8">
      {Icon && (
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#16730F] to-[#145a0c] rounded-2xl shadow-lg mb-4">
          <Icon className="text-3xl text-white" />
        </div>
      )}
      {eyebrow && (
        <p className="text-[#16730F] text-sm font-medium uppercase tracking-wide">
          {eyebrow}
        </p>
      )}
      <h1 className="text-2xl sm:text-3xl font-bold text-[#16730F] mt-1 mb-2">
        {title}
      </h1>
      {description && (
        <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

export function RecruiterFormShell({
  sectionTitle,
  sectionHint,
  icon: Icon,
  children,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 relative overflow-visible">
      <div className="bg-gradient-to-r from-[#16730F] to-[#145a0c] px-6 py-4 rounded-t-2xl">
        <h2 className="text-white text-lg font-semibold flex items-center gap-2">
          {Icon && <Icon className="text-white/80 shrink-0" />}
          {sectionTitle}
        </h2>
        {sectionHint && (
          <p className="text-white/70 text-sm mt-1">{sectionHint}</p>
        )}
      </div>
      <div className="p-6 space-y-5 rounded-b-2xl relative z-10 overflow-visible">
        {children}
      </div>
    </div>
  );
}

export function RecruiterTextField({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  optional = false,
  disabled = false,
  hint,
}) {
  return (
    <div>
      <FormLabel label={label} required={required} optional={optional} />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClass}
      />
      {hint && <p className="text-xs text-gray-500 mt-1.5">{hint}</p>}
    </div>
  );
}

export function RecruiterTextArea({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  maxLength,
  rows = 4,
  hint,
}) {
  return (
    <div>
      <FormLabel label={label} required={required} />
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={textareaClass}
      />
      {maxLength && (
        <p className="text-xs text-gray-400 text-right mt-1">
          {String(value || "").length}/{maxLength}
        </p>
      )}
      {hint && <p className="text-xs text-gray-500 mt-1.5">{hint}</p>}
    </div>
  );
}
