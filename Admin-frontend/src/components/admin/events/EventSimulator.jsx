import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Calendar, Clock, MapPin, Video, Users, Tag, ExternalLink } from "lucide-react";
import coverFallback from "../../../assets/Ellipse 32 (3).png";
import PhysicalLocationModal from "./PhysicalLocationModal";

const BADGE_MAP = {
  Technology: "bg-blue-500/20 text-blue-200",
  Finance: "bg-emerald-500/20 text-emerald-200",
  Product: "bg-purple-500/20 text-purple-200",
  Creative: "bg-rose-500/20 text-rose-200",
};

export default function EventSimulator({ form }) {
  const [showLocationModal, setShowLocationModal] = useState(false);

  const badge = BADGE_MAP[form.category] || "bg-gray-500/20 text-gray-200";
  const hasContent = form.title || form.summary;

  const handleCtaClick = () => {
    if (form.locationType === "virtual") {
      if (form.location && form.location.startsWith("http")) {
        window.open(form.location, "_blank");
      }
    } else {
      setShowLocationModal(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="lg:col-span-5"
    >
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-6">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
            <Eye size={14} className="text-violet-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Live Preview</h3>
            <p className="text-[10px] text-gray-400">How badge holders will see this event</p>
          </div>
        </div>

        {/* Preview Card */}
        <div className="p-5">
          {!hasContent ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300">
              <Eye size={36} strokeWidth={1.5} />
              <p className="text-sm font-semibold mt-3 text-gray-400">Nothing to preview yet</p>
              <p className="text-xs text-gray-300 mt-1">Start filling in the composer form</p>
            </div>
          ) : (
            <motion.div
              key={form.title + form.category}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl overflow-hidden border border-gray-100 shadow-md"
            >
              {/* Cover */}
              <div className="relative h-40 bg-gray-100 overflow-hidden">
                <img
                  src={form.coverImg || coverFallback}
                  alt="cover"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = coverFallback;
                  }}
                />

                {/* Category badge */}
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm ${badge}`}>
                    {form.category}
                  </span>
                </div>

                {/* Type badge */}
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/20 text-white/80 backdrop-blur-sm flex items-center gap-1">
                    {form.locationType === "virtual" ? <Video size={10} /> : <MapPin size={10} />}
                    {form.locationType === "virtual" ? "Virtual" : "In Person"}
                  </span>
                </div>

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                  <h3 className="text-white font-bold text-base leading-snug drop-shadow-md">
                    {form.title || "Event Title"}
                  </h3>
                </div>
              </div>

              {/* Body */}
              <div className="bg-white p-4 space-y-3">
                {form.summary && (
                  <p className="text-xs text-gray-500 italic leading-relaxed">
                    "{form.summary}"
                  </p>
                )}

                {/* Meta */}
                <div className="grid grid-cols-2 gap-2">
                  {form.host && (
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 bg-gray-50 px-2.5 py-2 rounded-lg">
                      <Users size={12} className="text-[#16730F] shrink-0" />
                      <span className="truncate font-medium">{form.host}</span>
                    </div>
                  )}
                  {form.date && (
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 bg-gray-50 px-2.5 py-2 rounded-lg">
                      <Calendar size={12} className="text-[#16730F] shrink-0" />
                      <span className="font-medium">{form.date}</span>
                    </div>
                  )}
                  {form.time && (
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 bg-gray-50 px-2.5 py-2 rounded-lg">
                      <Clock size={12} className="text-[#16730F] shrink-0" />
                      <span className="font-medium">{form.time}</span>
                    </div>
                  )}
                  {form.location && (
                    <div
                      onClick={handleCtaClick}
                      className={`flex items-center gap-1.5 text-[11px] px-2.5 py-2 rounded-lg transition-colors ${
                        form.locationType === "virtual"
                          ? "text-gray-500 bg-gray-50"
                          : "text-[#16730F] bg-emerald-50/60 hover:bg-emerald-100/60 cursor-pointer font-semibold"
                      }`}
                    >
                      {form.locationType === "virtual" ? (
                        <ExternalLink size={12} className="text-[#16730F] shrink-0" />
                      ) : (
                        <MapPin size={12} className="text-[#16730F] shrink-0" />
                      )}
                      <span className="truncate font-medium">{form.location}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {form.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-0.5 text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium"
                      >
                        <Tag size={8} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* CTA */}
                <button
                  type="button"
                  onClick={handleCtaClick}
                  className="w-full py-2.5 bg-[#16730F] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#0e4a09] transition-all shadow-sm cursor-pointer"
                >
                  {form.locationType === "virtual" ? (
                    <>
                      <ExternalLink size={12} />
                      Join Event
                    </>
                  ) : (
                    <>
                      <MapPin size={12} />
                      View Physical Venue
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Physical Location Modal */}
      <PhysicalLocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        location={form.location}
        title={form.title}
        host={form.host}
        date={form.date}
        time={form.time}
      />
    </motion.div>
  );
}
