import { ChevronRight, CheckCircle2, Video, MapPin, Tag } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORY_COLORS = {
  Technology: { text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", color: "from-blue-600 to-indigo-700" },
  Finance: { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", color: "from-emerald-600 to-teal-700" },
  Product: { text: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100", color: "from-purple-600 to-violet-700" },
  Creative: { text: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", color: "from-rose-500 to-pink-700" },
};

export default function TemplateCenter({ templates, onSelectTemplate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "NunitoBold" }}>
            Event Templates
          </h2>
          <p className="text-xs text-gray-400">Select an optimized preset layout to compose your broadcast event instantly</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((temp, i) => {
          const style = CATEGORY_COLORS[temp.category] || {
            text: "text-gray-600",
            bg: "bg-gray-50",
            border: "border-gray-100",
            color: "from-gray-600 to-gray-800",
          };
          const hostInitials = (temp.host || "?")
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <motion.div
              key={temp.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col hover:-translate-y-0.5 duration-300"
            >
              {/* Cover Header */}
              <div className="relative h-40 overflow-hidden shrink-0 bg-gray-100">
                <img src={temp.coverImg} alt="" className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-t ${style.color} opacity-50`} />

                {/* Category tag */}
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30">
                    {temp.category}
                  </span>
                </div>

                {/* Type indicator */}
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 bg-black/20 text-white backdrop-blur-sm">
                    {temp.locationType === "virtual" ? <Video className="w-3 h-3 text-blue-300" /> : <MapPin className="w-3 h-3 text-amber-300" />}
                    {temp.locationType === "virtual" ? "Virtual" : "Physical"}
                  </span>
                </div>

                {/* Host badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${style.color} flex items-center justify-center text-white text-[10px] font-bold border border-white`}>
                    {hostInitials}
                  </div>
                  <span className="text-white text-xs font-semibold drop-shadow">{temp.host}</span>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-gray-900 text-sm leading-snug">
                    {temp.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {temp.summary}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                    <MapPin size={12} className="text-[#16730F] shrink-0" />
                    <span className="truncate">{temp.location}</span>
                  </div>

                  {temp.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {temp.tags.map((tag) => (
                        <span key={tag} className="text-[9px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                          <Tag size={8} /> {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-500" /> Template Preset
                  </span>
                  <button
                    onClick={() => onSelectTemplate(temp)}
                    className="flex items-center gap-1 text-[#16730F] hover:text-[#0e4a09] text-xs font-bold transition-colors cursor-pointer"
                  >
                    Use Template <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
