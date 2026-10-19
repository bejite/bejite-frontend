import { Users, Banknote, Eye, Loader } from "lucide-react";
import {
  formatAdProCostPerUser,
  formatAdProCurrency,
  ADPRO_COST_PER_USER_NGN,
} from "../../utils/formatAdProCurrency";

function EstimateRow({ icon: Icon, title, value, subtitle }) {
  return (
    <div className="flex flex-col gap-2 p-3 bg-white/10 rounded-xl sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-white/70 text-xs">{title}</p>
          <p className="text-xl sm:text-2xl font-bold break-words">{value}</p>
        </div>
      </div>
      {subtitle ? (
        <p className="text-white/70 text-xs sm:text-right shrink-0 pl-12 sm:pl-0">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export default function AudienceEstimator({ estimate, loading }) {
  const costPerUser =
    estimate.reach > 0
      ? estimate.cost / estimate.reach
      : estimate.costPerUser ?? ADPRO_COST_PER_USER_NGN;

  return (
    <div className="w-full min-w-0 bg-gradient-to-r from-[#1A3E32] to-[#2d6a54] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
      <h3 className="font-semibold text-base sm:text-lg mb-4">
        Audience Estimate
      </h3>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          <EstimateRow
            icon={Users}
            title="Estimated Reach"
            value={estimate.reach.toLocaleString()}
            subtitle="users"
          />

          <EstimateRow
            icon={Banknote}
            title="Estimated Cost"
            value={formatAdProCurrency(estimate.cost)}
            subtitle={`${formatAdProCostPerUser(costPerUser)} per user`}
          />

          <EstimateRow
            icon={Eye}
            title="Guaranteed Delivery"
            value="✓ Pay only for reach"
          />
        </div>
      )}
    </div>
  );
}
