import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import Loader from "../../components/ui/Loader";
import { toast } from "react-toastify";
import {
  Search,
  Heart,
  MessageSquare,
  Share2,
  TrendingUp,
  Users,
  Activity,
  Eye,
  Layout,
  MousePointerClick,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
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
    <div className="text-2xl font-bold text-gray-800 break-all line-clamp-2">
      {value}
    </div>
    {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
  </div>
);

const AdminEngagement = () => {
  const [searchMetrics, setSearchMetrics] = useState(null);
  const [contentMetrics, setContentMetrics] = useState(null);
  const [pageUsage, setPageUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(DEFAULT_CHART_PERIOD);
  const periodLabel = getChartPeriodLabel(period);

  const COLORS = ["#16730F", "#2563eb", "#f59e0b", "#8b5cf6"];
  const ROLE_COLORS = ["#16730F", "#2563eb", "#f59e0b", "#8b5cf6", "#ec4899"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [searchRes, contentRes, pageUsageRes] = await Promise.allSettled([
          axiosInstance.get(`/api/admin/metrics/search?period=${period}`),
          axiosInstance.get(`/api/admin/metrics/content?period=${period}`),
          axiosInstance.get(`/api/admin/metrics/page-usage?period=${period}`),
        ]);

        if (searchRes.status === "fulfilled") {
          setSearchMetrics(searchRes.value.data);
        }
        if (contentRes.status === "fulfilled") {
          setContentMetrics(contentRes.value.data);
        }
        if (pageUsageRes.status === "fulfilled") {
          setPageUsage(pageUsageRes.value.data);
        } else {
          setPageUsage(null);
        }

        if (
          searchRes.status === "rejected" &&
          contentRes.status === "rejected"
        ) {
          toast.error("Failed to load engagement data");
        }
      } catch (error) {
        console.error("Error fetching engagement metrics", error);
        toast.error("Failed to load engagement data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  if (loading) {
    return <Loader fullscreen={false} description="Loading engagement data..." />;
  }

  return (
    <div
      style={{ fontFamily: "NunitoSemi" }}
      className="max-w-7xl mx-auto w-full space-y-8"
    >
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            style={{ fontFamily: "NunitoBold" }}
            className="text-2xl font-bold text-gray-800"
          >
            Engagement & Search Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Track page visits, feature use, searches, and content interactions.
          </p>
        </div>
        <ChartPeriodSelect
          id="engagement-chart-period"
          value={period}
          onChange={setPeriod}
        />
      </div>

      {/* Section: Page & Feature Usage */}
      <div>
        <h2
          style={{ fontFamily: "NunitoBold" }}
          className="text-xl font-bold text-gray-800 mb-4"
        >
          Page & Feature Usage
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Page Views"
            value={pageUsage?.latest?.total_views || 0}
            icon={Eye}
            colorClass="bg-emerald-50 text-emerald-600"
            subtitle={`In selected ${periodLabel.toLowerCase()}`}
          />
          <StatCard
            title="Unique Sessions"
            value={pageUsage?.latest?.unique_sessions || 0}
            icon={Activity}
            colorClass="bg-blue-50 text-blue-600"
            subtitle="Distinct browser sessions"
          />
          <StatCard
            title="Most Used Feature"
            value={pageUsage?.latest?.top_feature_label || "—"}
            icon={Layout}
            colorClass="bg-violet-50 text-violet-600"
            subtitle={
              pageUsage?.latest?.top_feature_views
                ? `${pageUsage.latest.top_feature_views} views`
                : "No views yet"
            }
          />
          <StatCard
            title="Top Page"
            value={pageUsage?.latest?.top_path || "—"}
            icon={MousePointerClick}
            colorClass="bg-amber-50 text-amber-600"
            subtitle={
              pageUsage?.latest?.top_path_views
                ? `${pageUsage.latest.top_path_views} views`
                : "No views yet"
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3
              style={{ fontFamily: "NunitoBold" }}
              className="text-lg font-bold text-gray-800 mb-6"
            >
              Top Features ({periodLabel})
            </h3>
            <div className="h-72 w-full">
              {pageUsage?.features?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={pageUsage.features}
                    layout="vertical"
                    margin={{ left: 8, right: 16 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#f0f0f0"
                    />
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9ca3af", fontSize: 12 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={120}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="views"
                      name="Views"
                      fill="#16730F"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-center px-4">
                  No page view data yet. Views appear after users browse the
                  main app.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3
              style={{ fontFamily: "NunitoBold" }}
              className="text-lg font-bold text-gray-800 mb-6"
            >
              Views by Role
            </h3>
            <div className="h-72 w-full">
              {pageUsage?.by_role?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pageUsage.by_role}
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="views"
                      nameKey="role"
                    >
                      {pageUsage.by_role.map((entry, index) => (
                        <Cell
                          key={`role-${entry.role}`}
                          fill={ROLE_COLORS[index % ROLE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value) => [value, "Views"]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No role breakdown yet
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3
              style={{ fontFamily: "NunitoBold" }}
              className="text-lg font-bold text-gray-800 mb-6"
            >
              Page View Trend ({periodLabel})
            </h3>
            <div className="h-64 w-full">
              {pageUsage?.trend?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pageUsage.trend}>
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
                      dataKey="views"
                      name="Views"
                      stroke="#16730F"
                      strokeWidth={3}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="sessions"
                      name="Sessions"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No page view trend yet
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3
              style={{ fontFamily: "NunitoBold" }}
              className="text-lg font-bold text-gray-800 mb-4"
            >
              Key Actions ({periodLabel})
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Period counts from product tables (published/active only where
              applicable) — not page views.
            </p>
            <div className="space-y-3">
              {(pageUsage?.actions || []).map((action) => (
                <div
                  key={action.key}
                  className="flex items-center justify-between gap-3 border-b border-gray-50 pb-2 last:border-0"
                >
                  <span className="text-sm text-gray-600">{action.label}</span>
                  <span
                    style={{ fontFamily: "NunitoBold" }}
                    className="text-sm text-gray-900"
                  >
                    {action.count ?? 0}
                  </span>
                </div>
              ))}
              {!pageUsage?.actions?.length && (
                <div className="text-sm text-gray-400 py-8 text-center">
                  No action counts available
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-x-auto">
          <h3
            style={{ fontFamily: "NunitoBold" }}
            className="text-lg font-bold text-gray-800 mb-4"
          >
            Top Pages
          </h3>
          {pageUsage?.pages?.length > 0 ? (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="py-2 pr-4 font-medium">Path</th>
                  <th className="py-2 pr-4 font-medium">Feature</th>
                  <th className="py-2 pr-4 font-medium text-right">Views</th>
                  <th className="py-2 pr-4 font-medium text-right">Sessions</th>
                  <th className="py-2 font-medium text-right">Users</th>
                </tr>
              </thead>
              <tbody>
                {pageUsage.pages.map((row) => (
                  <tr
                    key={`${row.path}-${row.feature}`}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="py-2.5 pr-4 text-gray-800 font-mono text-xs">
                      {row.path}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-600">{row.label}</td>
                    <td className="py-2.5 pr-4 text-right text-gray-800">
                      {row.views}
                    </td>
                    <td className="py-2.5 pr-4 text-right text-gray-800">
                      {row.sessions}
                    </td>
                    <td className="py-2.5 text-right text-gray-800">
                      {row.users}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-10 text-center text-gray-400">
              No page rankings yet
            </div>
          )}
        </div>
      </div>

      {/* Section: Search Metrics */}
      <div>
        <h2
          style={{ fontFamily: "NunitoBold" }}
          className="text-xl font-bold text-gray-800 mb-4"
        >
          Search Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Searches"
            value={searchMetrics?.latest?.total_searches || 0}
            icon={Search}
            colorClass="bg-blue-50 text-blue-600 "
            subtitle="All time job searches"
          />
          <StatCard
            title="Unique Searchers"
            value={searchMetrics?.latest?.unique_searchers || 0}
            icon={Users}
            colorClass="bg-purple-50 text-purple-600"
            subtitle="Distinct users searching"
          />
          <StatCard
            title="Search Success Rate"
            value={`${searchMetrics?.latest?.search_success_rate || 0}%`}
            icon={TrendingUp}
            colorClass="bg-green-50 text-green-600"
            subtitle="Searches returning candidates"
          />
          <StatCard
            title="Avg Search Time"
            value={`${searchMetrics?.latest?.avg_search_time || 0}s`}
            icon={Activity}
            colorClass="bg-orange-50 text-orange-600"
            subtitle="Latency per search"
          />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3
            style={{ fontFamily: "NunitoBold" }}
            className="text-lg font-bold text-gray-800 mb-6"
          >
            Search Volume Trend ({periodLabel})
          </h3>
          <div className="h-72 w-full">
            {searchMetrics?.trend?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={searchMetrics.trend}>
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
                    dataKey="total_searches"
                    name="Searches"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="unique_searchers"
                    name="Searchers"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No search trend data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section: Content Metrics */}
      <div>
        <h2
          style={{ fontFamily: "NunitoBold" }}
          className="text-xl font-bold text-gray-800 mb-4"
        >
          Content & Social Engagement
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Posts"
            value={contentMetrics?.latest?.total_posts || 0}
            icon={MessageSquare}
            colorClass="bg-indigo-50 text-indigo-600"
            subtitle="Created by users"
          />
          <StatCard
            title="Total Likes"
            value={contentMetrics?.latest?.total_likes || 0}
            icon={Heart}
            colorClass="bg-pink-50 text-pink-600"
            subtitle="Across all posts"
          />
          <StatCard
            title="Total Comments"
            value={contentMetrics?.latest?.total_comments || 0}
            icon={MessageSquare}
            colorClass="bg-teal-50 text-teal-600"
            subtitle="User discussions"
          />
          <StatCard
            title="Total Shares"
            value={contentMetrics?.latest?.total_shares || 0}
            icon={Share2}
            colorClass="bg-amber-50 text-amber-600"
            subtitle="Content virality"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Media Uploads Pie Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3
              style={{ fontFamily: "NunitoBold" }}
              className="text-lg font-bold text-gray-800 mb-6"
            >
              Media Uploads
            </h3>
            <div className="h-64 w-full">
              {contentMetrics?.media?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={contentMetrics.media}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="kind"
                    >
                      {contentMetrics.media.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value) => [value, "Uploads"]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No media data available
                </div>
              )}
            </div>
          </div>

          {/* Engagement Trend Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3
              style={{ fontFamily: "NunitoBold" }}
              className="text-lg font-bold text-gray-800 mb-6"
            >
              Engagement Trend ({periodLabel})
            </h3>
            <div className="h-64 w-full">
              {contentMetrics?.trend?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={contentMetrics.trend}>
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
                    <Bar
                      dataKey="total_likes"
                      name="Likes"
                      fill="#ec4899"
                      radius={[4, 4, 0, 0]}
                      stackId="a"
                    />
                    <Bar
                      dataKey="total_comments"
                      name="Comments"
                      fill="#14b8a6"
                      radius={[0, 0, 0, 0]}
                      stackId="a"
                    />
                    <Bar
                      dataKey="total_shares"
                      name="Shares"
                      fill="#f59e0b"
                      radius={[0, 0, 0, 0]}
                      stackId="a"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No engagement trend data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEngagement;
