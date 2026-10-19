// CampaignChart.js - Fully Responsive
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const mockData = {
  week: [
    { day: "Mon", reach: 1200, engagement: 45 },
    { day: "Tue", reach: 1890, engagement: 62 },
    { day: "Wed", reach: 2450, engagement: 89 },
    { day: "Thu", reach: 2180, engagement: 78 },
    { day: "Fri", reach: 3020, engagement: 112 },
    { day: "Sat", reach: 1560, engagement: 56 },
    { day: "Sun", reach: 980, engagement: 34 },
  ],
  month: [
    { day: "W1", reach: 8920, engagement: 320 },
    { day: "W2", reach: 10750, engagement: 410 },
    { day: "W3", reach: 8230, engagement: 290 },
    { day: "W4", reach: 13100, engagement: 480 },
  ],
  quarter: [
    { day: "Jan", reach: 36800, engagement: 1350 },
    { day: "Feb", reach: 44100, engagement: 1620 },
    { day: "Mar", reach: 39900, engagement: 1480 },
  ],
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 md:p-3 md:min-w-[180px]">
      <p className="text-xs font-semibold text-gray-900 mb-2">{label}</p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1A3E32]" />
            <span className="text-xs text-gray-500">Reach</span>
          </div>
          <span className="text-xs font-semibold text-gray-900">
            {payload[0]?.value?.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#2d6a54]" />
            <span className="text-xs text-gray-500">Engagement</span>
          </div>
          <span className="text-xs font-semibold text-gray-900">
            {payload[1]?.value?.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function CampaignChart({ period, data }) {
  const dataByPeriod = {
    week: data,
    month: data,
    quarter: data,
  };
  const chartData = dataByPeriod[period] || data || mockData.week;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1A3E32" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#1A3E32" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2d6a54" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#2d6a54" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="4 4"
          stroke="#E5E7EB"
          vertical={false}
        />
        <XAxis
          dataKey="day"
          stroke="#94A3B8"
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: "#E5E7EB" }}
          dy={8}
          interval={0}
        />
        <YAxis
          yAxisId="left"
          stroke="#94A3B8"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(val) =>
            val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val
          }
          dx={-8}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#94A3B8"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          dx={8}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: "#CBD5E1", strokeWidth: 1, strokeDasharray: "4" }}
        />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="reach"
          stroke="#1A3E32"
          strokeWidth={2}
          fill="url(#colorReach)"
          name="Reach"
        />
        <Area
          yAxisId="right"
          type="monotone"
          dataKey="engagement"
          stroke="#2d6a54"
          strokeWidth={2}
          fill="url(#colorEngagement)"
          name="Engagement"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
