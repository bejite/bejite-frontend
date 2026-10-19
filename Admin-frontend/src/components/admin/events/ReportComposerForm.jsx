import { useState } from "react";
import { ArrowLeft, FileText, Send, Loader2, Type, AlignLeft } from "lucide-react";

const inputClass =
  "w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:border-[#16730F] focus:ring-2 focus:ring-[#16730F]/10 outline-none transition-all placeholder:text-gray-400";

const Field = ({ label, icon: Icon, required, children }) => (
  <div>
    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
      {Icon && <Icon size={13} className="text-gray-400" />}
      {label}
      {required && <span className="text-rose-400">*</span>}
    </label>
    {children}
  </div>
);

export default function ReportComposerForm({ initialData, onSubmit, onCancel, isSubmitting }) {
  const isEditing = !!initialData?.id;

  const [form, setForm] = useState({
    title: initialData?.title || "",
    summary: initialData?.summary || "",
    content: initialData?.content || "",
  });

  const handleChange = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.summary) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <button
        type="button"
        onClick={onCancel}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#16730F] transition-colors font-medium cursor-pointer"
      >
        <ArrowLeft size={16} />
        Back to list
      </button>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {isEditing ? "Edit Report" : "Create Monthly Report"}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Publish a monthly employment report visible to all verified badge holders.
          </p>
        </div>

        <div className="p-6 space-y-5">
          <Field label="Report Title" icon={Type} required>
            <input
              type="text"
              placeholder="e.g. July 2026 Employment Report"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className={inputClass}
              maxLength={100}
            />
          </Field>

          <Field label="Executive Summary" icon={FileText} required>
            <textarea
              placeholder="One paragraph summarizing key findings..."
              value={form.summary}
              onChange={(e) => handleChange("summary", e.target.value)}
              className={`${inputClass} resize-none`}
              rows={3}
              maxLength={300}
            />
            <p className="text-right text-[10px] text-gray-400 mt-0.5">
              {form.summary.length}/300
            </p>
          </Field>

          <Field label="Full Report Content" icon={AlignLeft}>
            <textarea
              placeholder="Detailed report content, statistics, analysis..."
              value={form.content}
              onChange={(e) => handleChange("content", e.target.value)}
              className={`${inputClass} resize-none`}
              rows={8}
            />
          </Field>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !form.title || !form.summary}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#16730F] text-white text-sm font-bold rounded-xl hover:bg-[#0e4a09] disabled:opacity-40 transition-all cursor-pointer shadow-sm"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {isEditing ? "Update Report" : "Publish Report"}
          </button>
        </div>
      </div>
    </form>
  );
}
