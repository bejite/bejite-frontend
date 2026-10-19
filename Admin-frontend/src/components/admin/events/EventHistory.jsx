import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  Search,
  Calendar,
  Clock,
  Users,
  BarChart3,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  MapPin,
  Video,
  Tag,
  Send,
} from "lucide-react";

const CATEGORY_DOT = {
  Technology: "bg-blue-500",
  Finance: "bg-emerald-500",
  Product: "bg-purple-500",
  Creative: "bg-rose-500",
};

export default function EventHistory({ eventsList, onDeleteEvent, onResendEvent, onSelectEvent }) {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const filtered = eventsList.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <History size={14} className="text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Broadcast History</h3>
              <p className="text-[10px] text-gray-400">
                {eventsList.length} event{eventsList.length !== 1 ? "s" : ""} sent
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search broadcasts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:border-[#16730F] focus:ring-2 focus:ring-[#16730F]/10 outline-none transition-all"
            />
          </div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-gray-300">
            <Send size={32} strokeWidth={1.5} />
            <p className="text-sm font-semibold mt-3 text-gray-400">No broadcasts yet</p>
            <p className="text-xs text-gray-300 mt-1">Events you broadcast will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((evt) => {
              const isExpanded = expandedId === evt.id;
              const dot = CATEGORY_DOT[evt.category] || "bg-gray-400";
              const total = evt.metrics?.delivered || 0;
              const opened = evt.metrics?.opened || 0;
              const registered = evt.metrics?.registered || 0;
              const openRate = total > 0 ? Math.round((opened / total) * 100) : 0;

              return (
                <div key={evt.id} className="group">
                  {/* Row */}
                  <div
                    className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : evt.id)}
                  >
                    {/* Category dot */}
                    <div className={`w-2.5 h-2.5 rounded-full ${dot} shrink-0`} />

                    {/* Cover thumbnail */}
                    <div className="w-12 h-9 rounded-lg overflow-hidden shrink-0 hidden sm:block">
                      <img src={evt.coverImg} alt="" className="w-full h-full object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 truncate">{evt.title}</h4>
                      <div className="flex items-center gap-3 mt-0.5 text-[10px] text-gray-400 font-medium">
                        <span className="flex items-center gap-0.5">
                          <Users size={10} /> {evt.host}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Calendar size={10} /> {evt.date}
                        </span>
                      </div>
                    </div>

                    {/* Metrics preview */}
                    <div className="hidden md:flex items-center gap-4 text-xs text-gray-500 shrink-0">
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400 font-medium">Delivered</p>
                        <p className="font-bold text-gray-700">{total.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400 font-medium">Click Rate</p>
                        <p className="font-bold text-emerald-600">{openRate}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400 font-medium">Registered</p>
                        <p className="font-bold text-blue-600">{registered}</p>
                      </div>
                    </div>

                    {/* Status + expand */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {evt.status || "Sent"}
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 pt-0 ml-7">
                          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                            {/* Summary */}
                            {evt.summary && (
                              <p className="text-xs text-gray-600 italic">"{evt.summary}"</p>
                            )}

                            {/* Meta grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-500">
                              <div className="flex items-center gap-1.5 bg-white p-2 rounded-lg">
                                <Clock size={12} className="text-gray-400" />
                                <span>{evt.time}</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-white p-2 rounded-lg">
                                {evt.locationType === "virtual" ? (
                                  <Video size={12} className="text-gray-400" />
                                ) : (
                                  <MapPin size={12} className="text-gray-400" />
                                )}
                                <span className="truncate">{evt.location || "—"}</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-white p-2 rounded-lg">
                                <Users size={12} className="text-gray-400" />
                                <span className="truncate">{evt.targetAudience}</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-white p-2 rounded-lg">
                                <Calendar size={12} className="text-gray-400" />
                                <span>{formatDate(evt.sentAt)}</span>
                              </div>
                            </div>

                            {/* Tags */}
                            {evt.tags?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {evt.tags.map((tag) => (
                                  <span key={tag} className="text-[10px] bg-white text-gray-500 px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                                    <Tag size={8} /> {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onSelectEvent(evt); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors cursor-pointer"
                              >
                                <BarChart3 size={12} />
                                Analytics
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onResendEvent(evt); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                              >
                                <RefreshCw size={12} />
                                Resend
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onDeleteEvent(evt.id); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                              >
                                <Trash2 size={12} />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
