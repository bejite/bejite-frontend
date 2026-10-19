import { useState, useRef } from "react";
import coverFallback from "../../../assets/Ellipse 32 (3).png";
import RecruiterSelect from "../RecruiterSelect";
import {
  ArrowLeft,
  Image as ImageIcon,
  CalendarDays,
  Clock,
  MapPin,
  Video,
  Hash,
  Type,
  FileText,
  ChevronDown,
  X,
  Send,
  Loader2,
  Users,
  Upload,
  Trash2,
} from "lucide-react";

const CATEGORIES = ["Technology", "Finance", "Product", "Creative"];

/* ─── Reusable Field Wrapper ─── */
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

const inputClass =
  "w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:border-[#16730F] focus:ring-2 focus:ring-[#16730F]/10 outline-none transition-all placeholder:text-gray-400";

export default function EventComposerForm({ initialData, onSubmit, onCancel, isSubmitting }) {
  const isEditing = !!initialData?.id;

  const [form, setForm] = useState({
    title: initialData?.title || "",
    summary: initialData?.summary || "",
    description: initialData?.description || "",
    category: initialData?.category || "Technology",
    type: initialData?.type || "virtual",
    date: initialData?.date || "",
    time: initialData?.time || "",
    host: initialData?.host || "",
    seats: initialData?.seats || 50,
    coverImg: initialData?.coverImg || "",
    tags: initialData?.tags || [],
    link: initialData?.link || "",
    location: initialData?.location || "",
  });

  const [tagInput, setTagInput] = useState("");

  const handleChange = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const fileInputRef = useRef(null);

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleChange("coverImg", event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleChange("coverImg", event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag) && form.tags.length < 6) {
      handleChange("tags", [...form.tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (t) => handleChange("tags", form.tags.filter((x) => x !== t));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.time || !form.host) {
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ─── Back button ─── */}
      <button
        type="button"
        onClick={onCancel}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#16730F] transition-colors font-medium cursor-pointer"
      >
        <ArrowLeft size={16} />
        Back to list
      </button>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Form header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {isEditing ? "Edit Event" : "Create New Event"}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {isEditing
              ? "Update the event details below."
              : "Fill in the details below to publish a partner event."}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Cover Image Upload */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-2">
              <ImageIcon size={13} className="text-gray-400" /> Cover Image
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageFileChange}
              className="hidden"
            />

            {form.coverImg ? (
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-gray-200 group bg-gray-50">
                <img
                  src={form.coverImg}
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = coverFallback;
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white text-gray-800 text-xs font-semibold rounded-lg shadow hover:bg-gray-100 transition-all cursor-pointer"
                  >
                    <Upload size={13} />
                    Change Image
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange("coverImg", "")}
                    className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg shadow hover:bg-rose-700 transition-all cursor-pointer"
                  >
                    <Trash2 size={13} />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="w-full h-36 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 hover:bg-emerald-50/30 hover:border-[#16730F]/40 transition-all cursor-pointer flex flex-col items-center justify-center text-center group relative overflow-hidden"
              >
                <img
                  src={coverFallback}
                  alt="Fallback Banner"
                  className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity"
                />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-50/90 backdrop-blur-sm text-[#16730F] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm">
                    <Upload size={18} />
                  </div>
                  <p className="text-xs font-semibold text-gray-800">
                    Click to upload cover image from your file manager
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    PNG, JPG, WEBP or GIF (Drag & Drop supported)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Title & Summary */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Event Title" icon={Type} required>
              <input
                type="text"
                placeholder="e.g. AI Summit 2026"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className={inputClass}
                maxLength={80}
              />
              <p className="text-right text-[10px] text-gray-400 mt-0.5">
                {form.title.length}/80
              </p>
            </Field>
            <Field label="Hosted by" icon={Users} required>
              <input
                type="text"
                placeholder="e.g. Google Nigeria"
                value={form.host}
                onChange={(e) => handleChange("host", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Short Summary" icon={FileText}>
            <textarea
              placeholder="A brief one-liner shown in the event card..."
              value={form.summary}
              onChange={(e) => handleChange("summary", e.target.value)}
              className={`${inputClass} resize-none`}
              rows={2}
              maxLength={150}
            />
            <p className="text-right text-[10px] text-gray-400 mt-0.5">
              {form.summary.length}/150
            </p>
          </Field>

          <Field label="Full Description">
            <textarea
              placeholder="Detailed event description, agenda, speakers..."
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className={`${inputClass} resize-none`}
              rows={4}
            />
          </Field>

          {/* Category / Type */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Category" icon={Hash}>
              <RecruiterSelect
                name="category"
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                options={CATEGORIES}
                placeholder="Select category"
              />
            </Field>

            <Field label="Event Type">
              <div className="flex gap-2">
                {[
                  { val: "virtual", icon: Video, label: "Virtual" },
                  { val: "in-person", icon: MapPin, label: "In Person" },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.val}
                    onClick={() => handleChange("type", opt.val)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      form.type === opt.val
                        ? "bg-[#16730F] text-white border-[#16730F]"
                        : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <opt.icon size={14} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Total Seats">
              <input
                type="number"
                min={1}
                max={5000}
                value={form.seats}
                onChange={(e) => handleChange("seats", +e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          {/* Date / Time / Link */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Date" icon={CalendarDays} required>
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Time" icon={Clock} required>
              <input
                type="time"
                value={form.time}
                onChange={(e) => handleChange("time", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label={form.type === "virtual" ? "Meeting Link" : "Location"} icon={form.type === "virtual" ? Video : MapPin}>
              <input
                type="text"
                placeholder={form.type === "virtual" ? "https://zoom.us/j/..." : "Victoria Island, Lagos"}
                value={form.type === "virtual" ? form.link : form.location}
                onChange={(e) =>
                  handleChange(form.type === "virtual" ? "link" : "location", e.target.value)
                }
                className={inputClass}
              />
            </Field>
          </div>

          {/* Tags */}
          <Field label="Tags" icon={Hash}>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 bg-[#16730F]/10 text-[#16730F] text-xs font-semibold px-2.5 py-1 rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={addTag}
                disabled={!tagInput.trim()}
                className="px-3 py-2 bg-gray-100 text-gray-500 rounded-xl text-xs font-semibold hover:bg-gray-200 disabled:opacity-40 transition-all cursor-pointer"
              >
                Add
              </button>
            </div>
          </Field>
        </div>

        {/* Footer */}
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
            disabled={isSubmitting || !form.title || !form.date || !form.time || !form.host}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#16730F] text-white text-sm font-bold rounded-xl hover:bg-[#0e4a09] disabled:opacity-40 transition-all cursor-pointer shadow-sm"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            {isEditing ? "Update Event" : "Publish Event"}
          </button>
        </div>
      </div>
    </form>
  );
}
