const statusConfig = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-600" },
  pending_review: {
    label: "Pending Review",
    className: "bg-yellow-100 text-yellow-700",
  },
  approved: { label: "Approved", className: "bg-blue-100 text-blue-700" },
  active: { label: "Active", className: "bg-green-100 text-green-700" },
  paused: { label: "Paused", className: "bg-amber-100 text-amber-700" },
  completed: { label: "Completed", className: "bg-purple-100 text-purple-700" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
  expired: { label: "Expired", className: "bg-gray-100 text-gray-500" },
};

export default function CampaignStatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.draft;
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
