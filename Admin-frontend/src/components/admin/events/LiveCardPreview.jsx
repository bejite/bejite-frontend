import { useState } from "react";
import { X, Calendar, Clock, MapPin, Video, Users, ExternalLink, Tag } from "lucide-react";
import PhysicalLocationModal from "./PhysicalLocationModal";

export default function LiveCardPreview({ item, activeTab, onClose }) {
  const [showLocationModal, setShowLocationModal] = useState(false);

  if (!item) return null;

  const isPhysical = item.type === "physical" || item.locationType === "physical" || item.type === "In Person";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-gray-100 transition-colors cursor-pointer shadow-sm"
        >
          <X size={18} className="text-gray-600" />
        </button>

        {activeTab === "events" ? (
          <>
            {/* Cover */}
            <div className="relative h-48 overflow-hidden rounded-t-2xl">
              <img src={item.coverImg} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5">
                <span className="inline-block text-[10px] font-bold bg-white/20 backdrop-blur text-white px-2.5 py-1 rounded-full mb-2">
                  {item.category}
                </span>
                <h2 className="text-xl font-bold text-white leading-tight drop-shadow-md">
                  {item.title}
                </h2>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {item.summary && (
                <p className="text-sm text-gray-600 italic">"{item.summary}"</p>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl">
                  <Users size={14} className="text-[#16730F]" />
                  <span className="font-medium">{item.host}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl">
                  <Calendar size={14} className="text-[#16730F]" />
                  <span className="font-medium">{item.date}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl">
                  <Clock size={14} className="text-[#16730F]" />
                  <span className="font-medium">{item.time}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl">
                  {item.type === "virtual" ? (
                    <Video size={14} className="text-[#16730F]" />
                  ) : (
                    <MapPin size={14} className="text-[#16730F]" />
                  )}
                  <span className="font-medium">{item.type === "virtual" ? "Virtual" : "In Person"}</span>
                </div>
              </div>

              {/* Seats */}
              <div className="flex items-center justify-between bg-[#16730F]/5 p-3 rounded-xl">
                <span className="text-xs font-semibold text-[#16730F]">Available Seats</span>
                <span className="text-sm font-bold text-[#16730F]">
                  {item.seatsLeft ?? item.seats}/{item.seats}
                </span>
              </div>

              {item.description && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-600 mb-1">Description</h4>
                  <p className="text-sm text-gray-500 whitespace-pre-wrap leading-relaxed">
                    {item.description}
                  </p>
                </div>
              )}

              {item.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      <Tag size={9} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {(item.link || item.location) && (
                isPhysical ? (
                  <button
                    type="button"
                    onClick={() => setShowLocationModal(true)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#16730F] text-white text-sm font-bold rounded-xl hover:bg-[#0e4a09] transition-all cursor-pointer shadow-sm"
                  >
                    <MapPin size={14} />
                    View Physical Venue Address
                  </button>
                ) : (
                  <a
                    href={item.link || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#16730F] text-white text-sm font-bold rounded-xl hover:bg-[#0e4a09] transition-all shadow-sm cursor-pointer"
                  >
                    <ExternalLink size={14} />
                    Join Meeting
                  </a>
                )
              )}
            </div>
          </>
        ) : (
          /* ─── Report Preview ─── */
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Calendar size={20} className="text-[#16730F]" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">{item.title}</h2>
            </div>
            {item.summary && (
              <div className="bg-[#16730F]/5 p-4 rounded-xl">
                <p className="text-xs font-semibold text-[#16730F] mb-1">Executive Summary</p>
                <p className="text-sm text-gray-700 leading-relaxed italic">"{item.summary}"</p>
              </div>
            )}
            {item.content && (
              <div>
                <h4 className="text-xs font-semibold text-gray-600 mb-1">Full Report</h4>
                <p className="text-sm text-gray-500 whitespace-pre-wrap leading-relaxed">{item.content}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <PhysicalLocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        location={item.location}
        title={item.title}
        host={item.host}
        date={item.date}
        time={item.time}
      />
    </div>
  );
}
