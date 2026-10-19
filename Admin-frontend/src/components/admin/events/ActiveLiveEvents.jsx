import { useState } from "react";
import { Calendar, Clock, MapPin, Video, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import coverFallback from "../../../assets/Ellipse 32 (3).png";
import PhysicalLocationModal from "./PhysicalLocationModal";

const CATEGORY_STYLES = {
  Technology: { color: "from-blue-600 to-indigo-700", text: "text-blue-600", bg: "bg-blue-50" },
  Finance: { color: "from-emerald-600 to-teal-700", text: "text-emerald-600", bg: "bg-emerald-50" },
  Product: { color: "from-purple-600 to-violet-700", text: "text-purple-600", bg: "bg-purple-50" },
  Creative: { color: "from-rose-500 to-pink-700", text: "text-rose-600", bg: "bg-rose-50" },
};

export default function ActiveLiveEvents({ eventsList }) {
  const [selectedPhysicalEvent, setSelectedPhysicalEvent] = useState(null);

  const handleJoin = (event) => {
    if (event.locationType === "virtual") {
      if (event.location && event.location.startsWith("http")) {
        window.open(event.location, "_blank");
      }
    } else {
      setSelectedPhysicalEvent(event);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Active Live Events</h2>
          <p className="text-xs text-gray-400">Events currently active or upcoming for verified subscribers</p>
        </div>
      </div>

      {eventsList.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl flex flex-col items-center justify-center py-16 text-gray-400">
          <Calendar size={40} strokeWidth={1.5} className="text-gray-300" />
          <p className="text-sm font-semibold mt-3">No active events found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventsList.map((event, i) => {
            const style = CATEGORY_STYLES[event.category] || {
              color: "from-[#16730F] to-[#0e4a09]",
              text: "text-[#16730F]",
              bg: "bg-[#16730F]/10",
            };
            const hostInitials = (event.host || "?")
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            // Mock registration stats
            const registered = event.metrics?.registered || 0;
            const limit = event.metrics?.delivered || 500;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Cover image header */}
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={event.coverImg || coverFallback}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = coverFallback;
                      }}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${style.color} opacity-50`} />

                    {/* Category tag */}
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30">
                        {event.category}
                      </span>
                    </div>

                    {/* Type indicator */}
                    <div className="absolute top-3 right-3">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 bg-black/20 text-white backdrop-blur-sm`}>
                        {event.locationType === "virtual" ? <Video className="w-3 h-3 text-blue-300" /> : <MapPin className="w-3 h-3 text-amber-300" />}
                        {event.locationType === "virtual" ? "Virtual" : "Physical"}
                      </span>
                    </div>

                    {/* Host avatar overlay */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${style.color} flex items-center justify-center text-white text-[10px] font-bold border-2 border-white`}>
                        {hostInitials}
                      </div>
                      <div>
                        <p className="text-white text-xs font-semibold drop-shadow">{event.host}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description & info body */}
                  <div className="p-4 space-y-3">
                    <h3 className="font-bold text-gray-900 text-sm leading-snug truncate">
                      {event.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{event.summary || event.description}</p>

                    <div className="space-y-1.5 pt-1 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-[#16730F]" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-[#16730F]" />
                        <span>{event.time}</span>
                      </div>
                      <div
                        onClick={() => handleJoin(event)}
                        className={`flex items-center gap-2 ${
                          event.locationType !== "virtual"
                            ? "cursor-pointer text-[#16730F] font-semibold hover:underline"
                            : ""
                        }`}
                      >
                        <MapPin size={13} className="text-[#16730F] shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Join Action */}
                <div className="p-4 pt-0 border-t border-gray-50 mt-auto">
                  <div className="flex items-center justify-between mb-3 text-[10px] text-gray-400 font-semibold pt-3">
                    <span>{registered} registered</span>
                    <span>{limit} delivery pool</span>
                  </div>
                  <button
                    onClick={() => handleJoin(event)}
                    className="w-full py-2 bg-gray-50 hover:bg-[#16730F]/10 text-gray-700 hover:text-[#16730F] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {event.locationType === "virtual" ? (
                      <>
                        <ExternalLink size={12} />
                        Join Meeting
                      </>
                    ) : (
                      <>
                        <MapPin size={12} />
                        View Venue Address
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Physical Location Modal */}
      <PhysicalLocationModal
        isOpen={!!selectedPhysicalEvent}
        onClose={() => setSelectedPhysicalEvent(null)}
        location={selectedPhysicalEvent?.location}
        title={selectedPhysicalEvent?.title}
        host={selectedPhysicalEvent?.host}
        date={selectedPhysicalEvent?.date}
        time={selectedPhysicalEvent?.time}
      />
    </motion.div>
  );
}
