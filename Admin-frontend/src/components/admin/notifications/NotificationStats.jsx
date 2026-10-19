import { Bell, AlertCircle, UserPlus, Megaphone, Mail } from "lucide-react";

const NotificationStats = ({
  totalCount,
  unreadCount,
  verificationCount = 0,
  adproCount = 0,
  contactCount = 0,
  onFilterClick,
}) => {
  const stats = [
    {
      label: "Total pending",
      value: totalCount,
      icon: Bell,
      bg: "bg-blue-50",
      color: "text-blue-600",
      filter: "all",
    },
    {
      label: "Unread",
      value: unreadCount,
      icon: AlertCircle,
      bg: "bg-red-50",
      color: "text-red-600",
      filter: "unread",
    },
    {
      label: "Verifications",
      value: verificationCount,
      icon: UserPlus,
      bg: "bg-amber-50",
      color: "text-amber-600",
      filter: "verification",
    },
    {
      label: "AdPro reviews",
      value: adproCount,
      icon: Megaphone,
      bg: "bg-purple-50",
      color: "text-purple-600",
      filter: "adpro",
    },
    {
      label: "Support",
      value: contactCount,
      icon: Mail,
      bg: "bg-emerald-50",
      color: "text-emerald-700",
      filter: "support",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          onClick={() => onFilterClick && onFilterClick(stat.filter)}
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-3.5 group"
        >
          <div
            className={`p-3 ${stat.bg} ${stat.color} rounded-xl transition-transform duration-200 group-hover:scale-110`}
          >
            <stat.icon size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationStats;
