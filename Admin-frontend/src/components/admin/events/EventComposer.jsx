import { useRef } from "react";
import { motion } from "framer-motion";
import coverFallback from "../../../assets/Ellipse 32 (3).png";
import RecruiterSelect from "../RecruiterSelect";
import {
  Type,
  Users,
  Hash,
  CalendarDays,
  Clock,
  MapPin,
  Video,
  Image as ImageIcon,
  FileText,
  ChevronDown,
  X,
  Send,
  Loader2,
  Sparkles,
  Trash2,
  Download,
  AlignLeft,
  Target,
  Bell,
  Mail,
  Smartphone,
  Upload,
} from "lucide-react";

const CATEGORIES = ["Technology", "Finance", "Product", "Creative"];

const AUDIENCE_OPTIONS = [
  { value: "all", label: "All Verified Badge Holders (1,248)" },
  { value: "Technology", label: "Tech Professionals (512)" },
  { value: "Finance", label: "Finance Professionals (320)" },
  { value: "Creative", label: "Creative Professionals (240)" },
  { value: "Product", label: "Product Professionals (176)" },
];

const TABS = [
  { key: "info", label: "Event Details", icon: FileText },
  { key: "audience", label: "Audience & Delivery", icon: Target },
];

/* ── Shared styles ── */
const inputBase =
  "w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 focus:border-[#16730F] focus:ring-2 focus:ring-[#16730F]/10 focus:bg-white outline-none transition-all duration-200 placeholder:text-gray-400";

const Field = ({ label, icon: Icon, required, hint, children }) => (
  <div>
    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
      {Icon && <Icon size={12} className="text-gray-400" />}
      {label}
      {required && <span className="text-rose-400 text-sm">*</span>}
    </label>
    {children}
    {hint && <p className="text-right text-[10px] text-gray-400 mt-0.5">{hint}</p>}
  </div>
);

export default function EventComposer({
  form,
  setForm,
  composerTab,
  setComposerTab,
  tagInput,
  setTagInput,
  isSubmitting,
  onChooseTemplate,
  onClearWorkspace,
  onSubmit,
  onClose,
  onSaveTemplate,
}) {
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

  const isValid = form.title && form.date && form.time && form.host;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="lg:col-span-7"
    >
      <form onSubmit={onSubmit}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* ── Composer Toolbar ── */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#16730F] flex items-center justify-center">
                <Sparkles size={14} className="text-emerald-300" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Broadcast Composer</h2>
                <p className="text-[10px] text-gray-400">Create & publish events</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
              >
                <X size={12} />
                Close
              </button>
              <button
                type="button"
                onClick={onChooseTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-[#16730F] bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <Download size={12} />
                Select Template
              </button>
              <button
                type="button"
                onClick={onClearWorkspace}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <Trash2 size={12} />
                Clear
              </button>
            </div>
          </div>

          {/* ── Tab Switcher ── */}
          <div className="px-5 pt-4">
            <div className="flex bg-gray-100/80 p-0.5 rounded-xl gap-0.5">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setComposerTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[10px] text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    composerTab === tab.key
                      ? "bg-white text-[#16730F] shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <tab.icon size={13} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── TAB: Event Details ── */}
          {composerTab === "info" && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="p-5 space-y-5"
            >
              {/* Cover */}
              <Field label="Cover Image" icon={ImageIcon}>
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
                      <p className="text-xs font-semibold text-gray-800 drop-shadow-xs">
                        Click to upload cover image from your file manager
                      </p>
                      <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                        PNG, JPG, WEBP or GIF (Drag & Drop supported)
                      </p>
                    </div>
                  </div>
                )}
              </Field>

              {/* Title + Host */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Event Title" icon={Type} required hint={`${form.title.length}/80`}>
                  <input
                    type="text"
                    placeholder="e.g. AI Summit 2026"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className={inputBase}
                    maxLength={80}
                  />
                </Field>
                <Field label="Hosted by" icon={Users} required>
                  <input
                    type="text"
                    placeholder="e.g. Bejite Academy"
                    value={form.host}
                    onChange={(e) => handleChange("host", e.target.value)}
                    className={inputBase}
                  />
                </Field>
              </div>

              {/* Summary */}
              <Field label="Summary" icon={AlignLeft} hint={`${form.summary.length}/150`}>
                <textarea
                  placeholder="A brief one-liner shown in the event card..."
                  value={form.summary}
                  onChange={(e) => handleChange("summary", e.target.value)}
                  className={`${inputBase} resize-none`}
                  rows={2}
                  maxLength={150}
                />
              </Field>

              {/* Description */}
              <Field label="Description" icon={FileText}>
                <textarea
                  placeholder="Detailed event description, agenda, speakers..."
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className={`${inputBase} resize-none`}
                  rows={3}
                />
              </Field>

              {/* Category / Type / Date / Time */}
              <div className="grid sm:grid-cols-2 gap-4">
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
                      { val: "physical", icon: MapPin, label: "In Person" },
                    ].map((opt) => (
                      <button
                        type="button"
                        key={opt.val}
                        onClick={() => handleChange("locationType", opt.val)}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                          form.locationType === opt.val
                            ? "bg-[#16730F] text-white border-[#16730F] shadow-sm"
                            : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <opt.icon size={13} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Date" icon={CalendarDays} required>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                    className={inputBase}
                  />
                </Field>
                <Field label="Time" icon={Clock} required>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => handleChange("time", e.target.value)}
                    className={inputBase}
                  />
                </Field>
                <Field label={form.locationType === "virtual" ? "Meeting Link" : "Location"} icon={form.locationType === "virtual" ? Video : MapPin}>
                  <input
                    type="text"
                    placeholder={form.locationType === "virtual" ? "https://zoom.us/j/..." : "Victoria Island, Lagos"}
                    value={form.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className={inputBase}
                  />
                </Field>
              </div>

              {/* Tags */}
              <Field label="Tags" icon={Hash}>
                <div className="flex flex-wrap items-center gap-1.5 mb-2 min-h-[28px]">
                  {form.tags.map((tag) => (
                    <motion.span
                      key={tag}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-1 bg-[#16730F]/10 text-[#16730F] text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <X size={11} />
                      </button>
                    </motion.span>
                  ))}
                  {form.tags.length === 0 && (
                    <span className="text-[10px] text-gray-300 italic">No tags added yet</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a tag & press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className={`${inputBase} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={!tagInput.trim()}
                    className="px-3.5 py-2 bg-gray-100 text-gray-500 rounded-xl text-[11px] font-bold hover:bg-gray-200 disabled:opacity-30 transition-all cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </Field>
            </motion.div>
          )}

          {/* ── TAB: Audience & Delivery ── */}
          {composerTab === "audience" && (
            <motion.div
              key="audience"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="p-5 space-y-5"
            >
              <Field label="Target Audience" icon={Target}>
                <RecruiterSelect
                  name="targetAudience"
                  value={form.targetAudience}
                  onChange={(e) => handleChange("targetAudience", e.target.value)}
                  options={AUDIENCE_OPTIONS}
                  placeholder="Select audience"
                />
              </Field>

              {/* Delivery Channels */}
              <Field label="Delivery Channels" icon={Bell}>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: "notifyApp", icon: Smartphone, label: "In-App" },
                    { key: "notifyPush", icon: Bell, label: "Push" },
                    { key: "notifyEmail", icon: Mail, label: "Email" },
                  ].map((ch) => (
                    <button
                      key={ch.key}
                      type="button"
                      onClick={() => handleChange(ch.key, !form[ch.key])}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                        form[ch.key]
                          ? "border-[#16730F] bg-[#16730F]/5 text-[#16730F]"
                          : "border-gray-200 bg-gray-50/50 text-gray-400 hover:border-gray-300"
                      }`}
                    >
                      <ch.icon size={20} />
                      <span className="text-[11px] font-bold">{ch.label}</span>
                      <div className={`w-8 h-4 rounded-full relative transition-all duration-300 ${
                        form[ch.key] ? "bg-[#16730F]" : "bg-gray-300"
                      }`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all duration-300 ${
                          form[ch.key] ? "left-[18px]" : "left-0.5"
                        }`} />
                      </div>
                    </button>
                  ))}
                </div>
              </Field>
            </motion.div>
          )}

          {/* ── Submit Footer ── */}
          <div className="px-5 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <p className="text-[10px] text-gray-400 font-medium">
              {isValid ? (
                <span className="text-emerald-600">✓ Ready to create</span>
              ) : (
                <span>Fill required fields to create</span>
              )}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onSaveTemplate}
                disabled={!isValid}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-[#16730F]/30 text-[#16730F] hover:bg-[#16730F]/5 text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-40"
              >
                Save & Template Create
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#16730F] to-[#2D5F4A] text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-[#16730F]/20 disabled:opacity-40 disabled:hover:shadow-none transition-all duration-300 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                Create Event
              </button>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
