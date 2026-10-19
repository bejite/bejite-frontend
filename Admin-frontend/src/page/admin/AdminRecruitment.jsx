import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { Briefcase, CheckCircle, Activity, Users } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import ChartPeriodSelect from "../../components/admin/ChartPeriodSelect";
import {
  DEFAULT_CHART_PERIOD,
  getChartPeriodLabel,
  formatChartTick,
} from "../../constants/chartPeriods";

// StatCard component
const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>
    <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
    <div className="text-2xl font-bold text-gray-800">{value}</div>
    {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
  </div>
);

const AdminRecruitment = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(DEFAULT_CHART_PERIOD);
  const periodLabel = getChartPeriodLabel(period);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `/api/admin/metrics/recruitment?period=${period}`,
        );
        setMetrics(response.data);
      } catch (error) {
        console.error("Error fetching recruitment metrics", error);
        toast.error("Failed to load recruitment data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16730F]"></div>
      </div>
    );
  }

  // New data structure expected from backend
  const recruitmentTrendData = (metrics?.recruitment_trend || []).slice(0, 10);
  const aseUsageTrendData = metrics?.ase_usage_trend || [];
  const sectorTrendData = (
    metrics?.sector_trend ||
    metrics?.top_sectors ||
    []
  ).slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Recruitment Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Track ASE search trends and recruiter activity on the platform.
          </p>
        </div>
        <ChartPeriodSelect
          id="recruitment-chart-period"
          value={period}
          onChange={setPeriod}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Jobs Posted"
          value={metrics?.funnel?.total_jobs || 0}
          icon={Briefcase}
          colorClass="bg-blue-50 text-blue-600"
          subtitle="All time job listings"
        />
        <StatCard
          title="Total number of ASE searches conducted"
          value={
            metrics?.latest?.total_ase_searches ||
            metrics?.funnel?.total_applications ||
            0
          }
          icon={Users}
          colorClass="bg-purple-50 text-purple-600"
          subtitle="All ASE searches on the platform"
        />
        <StatCard
          title="Successful Hires Rate"
          value={`${metrics?.latest?.hire_rate || 0}%`}
          icon={CheckCircle}
          colorClass="bg-green-50 text-green-600"
          subtitle="Interview invites sent ÷ invites accepted"
        />
        <StatCard
          title="Employer Activity Rate"
          value={`${metrics?.latest?.employer_activity_rate || 0}%`}
          icon={Activity}
          colorClass="bg-orange-50 text-orange-600"
          subtitle="Employers active in last 30 days"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recruitment Chart - Top 10 jobs with most searches by Recruiters using ASE */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Recruitment Chart
          </h3>
          <p className="text-xs text-gray-500 -mt-4 mb-4">
            Top 10 jobs with the most searches by Recruiters using the ASE
          </p>
          <div className="h-64 w-full">
            {recruitmentTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={recruitmentTrendData}
                  layout="vertical"
                  margin={{ top: 0, right: 0, left: 40, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="job_type"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#4b5563", fontSize: 12 }}
                  />
                  <RechartsTooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="search_count"
                    name="Searches"
                    fill="#3b82f6"
                    radius={[0, 4, 4, 0]}
                    barSize={22}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No recruitment trend data available
              </div>
            )}
          </div>
        </div>

        {/* Hiring Trend - ASE Usage by Recruiters */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Hiring Trend ({periodLabel})
          </h3>
          <p className="text-xs text-gray-500 -mt-4 mb-4">
            Recruiter usage of Advanced Search (ASE)
          </p>
          <div className="h-64 w-full">
            {aseUsageTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={aseUsageTrendData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatChartTick}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    interval="preserveStartEnd"
                    minTickGap={28}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    labelFormatter={formatChartTick}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total_ase_searches"
                    name="Total ASE Searches"
                    stroke="#16730F"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="unique_recruiters"
                    name="Unique Recruiters"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No hiring trend data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Sectors Searched by Recruiters using ASE (Point 8) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6">
          Top Sectors Searched by Recruiters (ASE)
        </h3>
        <p className="text-xs text-gray-500 -mt-4 mb-4">
          Top 10 sectors most searched for by recruiters using the ASE
        </p>
        <div className="h-80 w-full">
          {sectorTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sectorTrendData}
                layout="vertical"
                margin={{ top: 0, right: 0, left: 60, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="sector"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#4b5563", fontSize: 12 }}
                />
                <RechartsTooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="search_count"
                  name="Searches"
                  fill="#8b5cf6"
                  radius={[0, 4, 4, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              No sector search data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRecruitment;
