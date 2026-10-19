import { Calendar, Clock, MapPin, Video } from "lucide-react";
import { motion } from "framer-motion";

export function EventCard({ event, onSelect }) {
  const seatsPercent = Math.round(
    ((event.seats - event.seatsLeft) / event.seats) * 100,
  );
  const almostFull = event.seatsLeft <= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
      onClick={() => onSelect(event)}
    >
      {/* Cover */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={event.coverImg}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t ${event.color} opacity-60`}
        />
        <div className="absolute top-3 left-3">
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30`}
          >
            {event.category}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${event.type === "virtual" ? "bg-blue-500/80 text-white" : "bg-amber-500/80 text-white"} backdrop-blur-sm`}
          >
            {event.type === "virtual" ? (
              <Video className="w-3 h-3" />
            ) : (
              <MapPin className="w-3 h-3" />
            )}
            {event.type === "virtual" ? "Virtual" : "In Person"}
          </span>
        </div>
        {/* Host chip */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full bg-gradient-to-br ${event.color} flex items-center justify-center text-white text-[10px] font-bold border-2 border-white`}
          >
            {event.hostAvatar}
          </div>
          <div>
            <p className="text-white text-xs font-semibold drop-shadow">
              {event.host}
            </p>
            <p className="text-white/80 text-[9px] drop-shadow">
              {event.hostTitle}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <h3 className="font-bold text-gray-900 text-sm leading-snug">
          {event.title}
        </h3>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <Calendar className="w-3.5 h-3.5 text-[#1A3E32]" />
            {event.date}
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <Clock className="w-3.5 h-3.5 text-[#1A3E32]" />
            {event.time}
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <MapPin className="w-3.5 h-3.5 text-[#1A3E32]" />
            {event.location}
          </div>
        </div>

        {/* Seats */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500">
              {event.seatsLeft} seats left of {event.seats}
            </span>
            {almostFull && (
              <span className="text-[10px] font-semibold text-rose-500 animate-pulse">
                Almost Full!
              </span>
            )}
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${almostFull ? "bg-rose-400" : "bg-[#1A3E32]"} transition-all`}
              style={{ width: `${seatsPercent}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {event.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
