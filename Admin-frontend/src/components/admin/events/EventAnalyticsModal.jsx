import { motion } from "framer-motion";
import { X, BarChart3, Users, Eye, UserCheck, TrendingUp } from "lucide-react";

export default function EventAnalyticsModal({ selectedAnalyticsEvent: evt, onClose }) {
  if (!evt) return null;

  const total = evt.metrics?.delivered || 0;
  const opened = evt.metrics?.opened || 0;
  const registered = evt.metrics?.registered || 0;
  const openRate = total > 0 ? ((opened / total) * 100).toFixed(1) : 0;
  const regRate = total > 0 ? ((registered / total) * 100).toFixed(1) : 0;

  const metrics = [
    {
      label: "Delivered",
      value: total.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      barColor: "bg-blue-500",
      pct: 100,
    },
    {
      label: "Clicked",
      value: opened.toLocaleString(),
      icon: Eye,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      barColor: "bg-emerald-500",
      pct: total > 0 ? (opened / total) * 100 : 0,
    },
    {
      label: "Registered",
      value: registered.toLocaleString(),
      icon: UserCheck,
      color: "text-violet-600",
      bg: "bg-violet-50",
      barColor: "bg-violet-500",
      pct: total > 0 ? (registered / total) * 100 : 0,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <BarChart3 size={18} className="text-violet-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 leading-snug">{evt.title}</h3>
              <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Broadcast Analytics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Rates */}
        <div className="px-6 py-5 grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 text-center">
            <TrendingUp size={18} className="text-emerald-600 mx-auto" />
            <p className="text-2xl font-extrabold text-emerald-700 mt-2">{openRate}%</p>
            <p className="text-[10px] font-semibold text-emerald-500 mt-0.5">Click Rate</p>
          </div>
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 text-center">
            <UserCheck size={18} className="text-violet-600 mx-auto" />
            <p className="text-2xl font-extrabold text-violet-700 mt-2">{regRate}%</p>
            <p className="text-[10px] font-semibold text-violet-500 mt-0.5">Registration Rate</p>
          </div>
        </div>

        {/* Funnel Bars */}
        <div className="px-6 pb-6 space-y-3">
          {metrics.map((m) => (
            <div key={m.label} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${m.bg} flex items-center justify-center shrink-0`}>
                <m.icon size={14} className={m.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-gray-600">{m.label}</span>
                  <span className="text-[11px] font-bold text-gray-800">{m.value}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${m.pct}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className={`h-full rounded-full ${m.barColor}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 text-center font-medium">
            Sent to {evt.targetAudience} • {new Date(evt.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
