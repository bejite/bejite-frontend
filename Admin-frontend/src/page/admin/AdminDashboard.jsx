import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import {
  Users,
  Briefcase,
  FileText,
  Activity,
  TrendingUp,
  BarChart2,
  Download,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
} from "recharts";
import ChartPeriodSelect from "../../components/admin/ChartPeriodSelect";
import {
  DEFAULT_CHART_PERIOD,
  getChartPeriodLabel,
  formatChartTick,
} from "../../constants/chartPeriods";

function escapeCsvValue(value) {
  const str = String(value ?? "");
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function rowsToCsv(rows) {
  return rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
}

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [userMetrics, setUserMetrics] = useState(null);
  const [jobMetrics, setJobMetrics] = useState(null);
  const [advancedUserMetrics, setAdvancedUserMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(DEFAULT_CHART_PERIOD);
  const periodLabel = getChartPeriodLabel(period);

  // Canonical industry list (matches jobseekerSignup/JobType.jsx)
  const industries = [
    "Information Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Construction",
    "Manufacturing",
    "Retail",
    "Transportation and Logistics",
    "Hospitality",
    "Energy",
    "Telecommunications",
    "Real Estate",
    "Legal",
    "Marketing and Advertising",
    "Media and Entertainment",
    "Agriculture",
    "Aerospace",
    "Biotechnology",
    "Automotive",
    "Nonprofit",
    "Government",
    "Insurance",
    "Pharmaceuticals",
    "Environmental Services",
    "Engineering",
    "Consulting",
    "Human Resources",
    "Public Relations",
    "Utilities",
    "Mining",
    "Not Available",
  ];

  // Resolve numeric IDs (e.g. "8") to real names + normalize counts
  const topSectors = (userMetrics?.topSectors || [])
    .map((item) => {
      const raw = item.industry;
      const idx = parseInt(raw, 10);
      const name = idx >= 0 && idx < industries.length ? industries[idx] : raw;
      return {
        industry: name,
        count: Number(item.count) || 0,
      };
    })
    .filter((item) => item.industry && item.industry !== "Not Available")
    .slice(0, 10);

  // Normalized top applied job titles (top 10 most common jobs jobseekers actually apply for)
  const topJobTitles = (jobMetrics?.topJobTitles || [])
    .map((item) => ({
      title: item.title,
      count: Number(item.count) || 0,
    }))
    .slice(0, 10);

  const COLORS = [
    "#16730F",
    "#2563eb",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
  ];

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const [overviewRes, userRes, jobRes, advancedUserRes] =
          await Promise.all([
            axiosInstance.get("/api/admin/metrics/overview"),
            axiosInstance.get(`/api/admin/metrics/users?period=${period}`),
            axiosInstance.get("/api/admin/metrics/jobs"),
            axiosInstance.get(
              `/api/admin/metrics/users-advanced?period=${period}`,
            ),
          ]);

        setOverview(overviewRes.data);
        setUserMetrics(userRes.data);
        setJobMetrics(jobRes.data);
        setAdvancedUserMetrics(advancedUserRes.data);
      } catch (error) {
        console.error("Error fetching metrics", error);
        toast.error("Failed to load dashboard metrics");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [period]);

  const handleExportDashboard = () => {
    if (!overview) {
      toast.error("No dashboard data to export yet");
      return;
    }

    const exportedAt = new Date().toISOString();
    const sections = [];

    sections.push("Overview");
    sections.push(
      rowsToCsv([
        ["Metric", "Value"],
        ["Total Users", overview.totalUsers ?? 0],
        ["Weekly Signups", overview.weeklySignups ?? 0],
        ["Active Job Postings (Recruiters)", overview.activeJobPostings ?? 0],
        [
          "Active Jobseeker Job Posts",
          overview.activeJobseekerJobPosts ?? 0,
        ],
        ["Active Jobs (Total)", overview.activeJobs ?? 0],
        ["Total Applications", overview.totalApplications ?? 0],
        ["Exported At", exportedAt],
      ]),
    );

    sections.push("");
    sections.push("User Roles");
    sections.push(
      rowsToCsv([
        ["Role", "Count"],
        ...(userMetrics?.roles || []).map((r) => [r.role, r.count ?? 0]),
      ]),
    );

    sections.push("");
    sections.push(`User Growth (${periodLabel})`);
    sections.push(
      rowsToCsv([
        ["Date", "New Users"],
        ...(userMetrics?.signupsTrend || []).map((r) => [
          r.date,
          r.count ?? 0,
        ]),
      ]),
    );

    sections.push("");
    sections.push(`Active Users DAU & MAU (${periodLabel})`);
    sections.push(
      rowsToCsv([
        ["Date", "DAU", "MAU"],
        ...(advancedUserMetrics?.trend || []).map((r) => [
          r.date,
          r.dau ?? 0,
          r.mau ?? 0,
        ]),
      ]),
    );

    sections.push("");
    sections.push("Top Candidate Sectors");
    sections.push(
      rowsToCsv([
        ["Industry", "Candidates"],
        ...topSectors.map((r) => [r.industry, r.count]),
      ]),
    );

    sections.push("");
    sections.push("Top Job Titles Applied");
    sections.push(
      rowsToCsv([
        ["Title", "Applications"],
        ...topJobTitles.map((r) => [r.title, r.count]),
      ]),
    );

    const csv = sections.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const stamp = exportedAt.slice(0, 10);
    link.href = url;
    link.download = `bejite-admin-dashboard-${stamp}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success("Dashboard metrics exported");
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16730F]"></div>
      </div>
    );
  }

  return (
    <div
      className="max-w-7xl mx-auto w-full space-y-8"
      data-testid="admin-dashboard"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Platform overview and engagement metrics
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ChartPeriodSelect
            id="dashboard-chart-period"
            value={period}
            onChange={setPeriod}
          />
          <button
            type="button"
            onClick={handleExportDashboard}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16730F] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#125a0c] transition-colors"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span
              className="text-gray-500 font-medium"
              data-testid="admin-kpi-total-users"
            >
              Total Users
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-800">
              {overview?.totalUsers.toLocaleString()}
            </h3>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <TrendingUp size={14} className="text-green-500" />
              <span className="text-green-500 font-medium">
                {overview?.weeklySignups}
              </span>{" "}
              this week
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Job Postings</span>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <Briefcase size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-800">
              {(overview?.activeJobPostings ?? 0).toLocaleString()}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Recruiters job listings
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">
              Job Posts
            </span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <Briefcase size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-800">
              {(overview?.activeJobseekerJobPosts ?? 0).toLocaleString()}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Jobseekers job posts
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">
              Total Applications
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <FileText size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-800">
              {overview?.totalApplications.toLocaleString()}
            </h3>
            <p className="text-sm text-gray-500 mt-1">Across all jobs</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="text-gray-400" size={20} />
            <h3 className="text-lg font-bold text-gray-800">
              User Growth ({periodLabel})
            </h3>
          </div>
          <div className="h-72 w-full">
            {userMetrics?.signupsTrend?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userMetrics.signupsTrend}>
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
                    dy={10}
                    interval="preserveStartEnd"
                    minTickGap={28}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    labelFormatter={formatChartTick}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="New Users"
                    stroke="#16730F"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* User Roles Bar Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="text-gray-400" size={20} />
            <h3 className="text-lg font-bold text-gray-800">User Roles</h3>
          </div>
          <div className="h-64 w-full">
            {userMetrics?.roles?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userMetrics.roles}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="role"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#4b5563", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    dx={-10}
                  />
                  <Tooltip
                    formatter={(value) => [value, "Users"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Users"
                    radius={[4, 4, 0, 0]}
                    barSize={60}
                  >
                    {userMetrics.roles.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No data available
              </div>
            )}
          </div>

          {/* Explicit totals for Jobseekers and Recruiters from /api/admin/metrics/users */}
        </div>
      </div>

      {/* DAU / MAU Activity Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="text-gray-400" size={20} />
          <h3 className="text-lg font-bold text-gray-800">
            Active Users — DAU &amp; MAU ({periodLabel})
          </h3>
        </div>
        <div className="h-80 w-full">
          {advancedUserMetrics?.trend?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={advancedUserMetrics.trend}>
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
                  dy={10}
                  interval="preserveStartEnd"
                  minTickGap={28}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  dx={-10}
                  allowDecimals={false}
                />
                <Tooltip
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
                  dataKey="dau"
                  name="DAU"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="mau"
                  name="MAU"
                  stroke="#16730F"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              No activity data available
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          DAU = unique users active that day · MAU = unique users active in the
          trailing 30 days
        </p>
      </div>

      {/* Bottom Section: Top Sectors & Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Sectors */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Top Candidate Sectors (by Jobseekers)
          </h3>
          <div className="h-80 w-full">
            {topSectors.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topSectors}
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
                    dataKey="industry"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#4b5563", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Candidates"
                    fill="#3b82f6"
                    radius={[0, 4, 4, 0]}
                    barSize={18}
                  >
                    {topSectors.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No data available
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Top 10 most sought-after sectors by jobseekers
          </p>
        </div>

        {/* Top Job Titles Applied */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Top Job Titles Applied
          </h3>
          <div className="h-64 w-full">
            {topJobTitles.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topJobTitles}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="title"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#4b5563", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: "#f3f4f6" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Applications"
                    fill="#16730F"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No data available
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Top 10 most common jobs applied for by jobseekers
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
