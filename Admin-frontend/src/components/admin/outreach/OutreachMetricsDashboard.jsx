import { useState } from "react";
import { Send, BarChart3, Clock } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ChartPeriodSelect from "../ChartPeriodSelect";
import {
  DEFAULT_CHART_PERIOD,
  getChartPeriodDays,
  getChartPeriodLabel,
} from "../../../constants/chartPeriods";

const DAY_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

function dayKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function buildDailyVolume(sentCampaigns, daysBack = 14) {
  const totals = new Map();
  for (const c of sentCampaigns) {
    const raw = c.sentAt || c.createdAt;
    if (!raw) continue;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) continue;
    const key = dayKey(d);
    totals.set(key, (totals.get(key) || 0) + (Number(c.sentCount) || 0));
  }

  const now = new Date();
  const points = [];
  for (let i = daysBack - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = dayKey(d);
    points.push({
      day: DAY_FMT.format(d),
      Sent: totals.get(key) || 0,
    });
  }
  return points;
}

const OutreachMetricsDashboard = ({ campaigns = [] }) => {
  const [period, setPeriod] = useState(DEFAULT_CHART_PERIOD);
  const periodLabel = getChartPeriodLabel(period);
  const daysBack = getChartPeriodDays(period);

  const sentCampaigns = campaigns.filter((c) => c.status === "Sent");
  const totalSent = sentCampaigns.reduce(
    (sum, c) => sum + (Number(c.sentCount) || 0),
    0,
  );
  const scheduledCount = campaigns.filter(
    (c) => c.status === "Scheduled",
  ).length;
  const sendingCount = campaigns.filter((c) => c.status === "Sending").length;

  const chartData = buildDailyVolume(sentCampaigns, daysBack);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm font-medium">Emails sent</span>
            <div className="p-2 bg-green-50 text-[#16730F] rounded-xl">
              <Send size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-3">
            {totalSent.toLocaleString()}
          </h3>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm font-medium">
              Campaigns sent
            </span>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
              <BarChart3 size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-3">
            {sentCampaigns.length}
          </h3>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm font-medium">Queued</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Clock size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-3">
            {scheduledCount + sendingCount}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {scheduledCount} scheduled · {sendingCount} sending
          </p>
        </div>
      </div>

      {sentCampaigns.length > 0 ? (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="text-sm font-bold text-gray-900">
              Campaign volume ({periodLabel})
            </h3>
            <ChartPeriodSelect
              id="outreach-chart-period"
              value={period}
              onChange={setPeriod}
            />
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  interval="preserveStartEnd"
                  minTickGap={28}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="Sent"
                  stroke="#16730F"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#16730F", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default OutreachMetricsDashboard;
