import { motion } from "framer-motion";
import {
  Send,
  Users,
  Calendar,
  TrendingUp,
  Sparkles,
  Plus,
  History,
  LayoutGrid,
  LayoutTemplate,
} from "lucide-react";

export default function EventHeader({
  onCreateEvent,
  eventsCount,
  verifiedSubscribers = 0,
  upcomingCount = 0,
  totalRegistrations = 0,
  currentTab,
  setCurrentTab,
}) {
  const stats = [
    {
      label: "Total Broadcasts",
      value: eventsCount || 0,
      Icon: Send,
      iconColor: "text-[#16730F]",
      bg: "bg-[#16730F]/10",
    },
    {
      label: "Verified Subscribers",
      value: Number(verifiedSubscribers || 0).toLocaleString(),
      Icon: Users,
      iconColor: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Upcoming Events",
      value: upcomingCount || 0,
      Icon: Calendar,
      iconColor: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Total Registrations",
      value: Number(totalRegistrations || 0).toLocaleString(),
      Icon: TrendingUp,
      iconColor: "text-violet-600",
      bg: "bg-violet-50",
    },
  ];

  const tabs = [
    { id: "history", label: "Broadcast History", Icon: History },
    { id: "live", label: "Active Live Events", Icon: LayoutGrid },
    { id: "templates", label: "Template Center", Icon: LayoutTemplate },
  ];

  return (
    <div className="space-y-6" style={{ fontFamily: "NunitoSemi" }}>
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-[#16730F] via-[#1a8a12] to-[#0e5a09] rounded-2xl p-6 sm:p-8 shadow-xl"
      >
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/[0.06] rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-44 h-44 bg-green-300/[0.08] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/10 shrink-0">
              <Sparkles className="w-6 h-6 text-green-200" />
            </div>
            <div>
              <h1
                style={{ fontFamily: "NunitoBold" }}
                className="text-2xl font-extrabold text-[#fff] tracking-tight"
              >
                Event Broadcast Studio
              </h1>
              <p className="text-green-100/60 text-sm mt-0.5 font-medium">
                Create, preview and broadcast events to verified badge holders
              </p>
            </div>
          </div>

          {/* Create Event Button */}
          <button
            type="button"
            onClick={onCreateEvent}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#16730F] font-bold text-sm rounded-xl hover:bg-green-50 active:scale-[0.97] transition-all duration-200 cursor-pointer shadow-lg shadow-black/10 shrink-0"
          >
            <Plus size={18} strokeWidth={2.5} />
            Create Event
          </button>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 * i, duration: 0.35 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
              >
                <stat.Icon size={20} className={stat.iconColor} />
              </div>
            </div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              {stat.label}
            </p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-gray-200/80">
        <div className="flex gap-6">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`relative pb-4 flex items-center gap-2 text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "text-[#16730F]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <tab.Icon size={16} />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#16730F] rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
