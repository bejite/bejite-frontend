import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  X,
  Copy,
  Check,
  ExternalLink,
  Navigation,
  Calendar,
  Clock,
  Users,
  Building2,
} from "lucide-react";
import { toast } from "react-toastify";

export default function PhysicalLocationModal({
  isOpen,
  onClose,
  location,
  title,
  host,
  date,
  time,
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const displayLocation = location || "Location address not specified yet";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    displayLocation
  )}`;

  const handleCopy = () => {
    if (location) {
      navigator.clipboard.writeText(location);
      setCopied(true);
      toast.success("Address copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden z-10 border border-gray-100"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#16730F] to-[#2D5F4A] p-5 text-white relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
            
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <MapPin size={16} className="text-emerald-200" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                Physical Event Venue
              </span>
            </div>

            <h3 className="text-base font-bold leading-snug drop-shadow-xs pr-6">
              {title || "Event Location Details"}
            </h3>

            {host && (
              <p className="text-xs text-emerald-100/90 mt-1 flex items-center gap-1 font-medium">
                <Users size={12} /> Hosted by {host}
              </p>
            )}
          </div>

          {/* Modal Body */}
          <div className="p-5 space-y-4">
            {/* Event Time Info if available */}
            {(date || time) && (
              <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-600">
                {date && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar size={13} className="text-[#16730F]" />
                    <span>{date}</span>
                  </div>
                )}
                {time && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock size={13} className="text-[#16730F]" />
                    <span>{time}</span>
                  </div>
                )}
              </div>
            )}

            {/* Address Box */}
            <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Building2 size={12} className="text-[#16730F]" /> Venue Address
                </span>
                {location && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#16730F] hover:text-emerald-800 transition-colors cursor-pointer bg-white px-2 py-1 rounded-lg border border-emerald-200 shadow-xs"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? "Copied" : "Copy Address"}
                  </button>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-800 leading-relaxed font-sans">
                {displayLocation}
              </p>
            </div>

            {/* Actions Footer */}
            <div className="pt-2 flex items-center gap-2">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#16730F] hover:bg-[#0e4a09] text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <Navigation size={14} />
                Open in Google Maps
                <ExternalLink size={12} className="opacity-70" />
              </a>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
