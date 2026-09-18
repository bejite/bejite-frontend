import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { Users, Building, MapPin, Globe } from "lucide-react";
import {
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
  LabelList,
} from "recharts";
import WorldMap from "../../components/admin/WorldMap";

// StatCard component
const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }) => (
  <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
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

const AdminDemographics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const COLORS = [
    "#16730F",
    "#2563eb",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f43f5e",
    "#84cc16",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          "/api/admin/metrics/demographics",
        );
        setMetrics(response.data.demographics);
      } catch (error) {
        console.error("Error fetching demographics metrics", error);
        toast.error("Failed to load demographics data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div
        className="h-[80vh] flex items-center justify-center capitalize   font-nunito-regular"
        style={{ fontFamily: "NunitoRegular" }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16730F]"></div>
      </div>
    );
  }

  // Format object data into chart arrays
  const formatPieData = (dataObj) => {
    if (!dataObj || Object.keys(dataObj).length === 0) return [];
    return Object.entries(dataObj)
      .map(([name, count]) => ({ name, count: parseInt(count) }))
      .sort((a, b) => b.count - a.count);
  };

  const formatBarData = (dataObj) => {
    if (!dataObj || Object.keys(dataObj).length === 0) return [];
    return Object.entries(dataObj)
      .map(([name, count]) => ({ name, count: parseInt(count) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10
  };

  const jobseekersByCountry = formatPieData(metrics?.jobseekers_by_country);
  const topCountriesJobseekers = formatBarData(metrics?.jobseekers_by_country);
  const jobseekersByGender = formatPieData(metrics?.jobseekers_by_gender);
  const jobseekersByAge = formatPieData(metrics?.jobseekers_by_age_group);
  const jobseekersByState = formatBarData(metrics?.jobseekers_by_state);
  const employersByCountry = formatBarData(metrics?.employers_by_country);

  return (
    <div
      className="max-w-7xl mx-auto w-full space-y-6 sm:space-y-8 capitalize   font-nunito-regular"
      style={{ fontFamily: "NunitoRegular" }}
    >
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">User Demographics</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">
          Geographic and demographic distribution of jobseekers and employers.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Jobseekers"
          value={metrics?.total_jobseekers || 0}
          icon={Users}
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Total Recruiters"
          value={metrics?.total_employers || 0}
          icon={Building}
          colorClass="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Top Country"
          value={
            jobseekersByCountry.length > 0 ? jobseekersByCountry[0].name : "N/A"
          }
          icon={Globe}
          colorClass="bg-green-50 text-green-600"
        />
        <StatCard
          title="Top State"
          value={
            jobseekersByState.length > 0 ? jobseekersByState[0].name : "N/A"
          }
          icon={MapPin}
          colorClass="bg-orange-50 text-orange-600"
        />
      </div>

      {/* Jobseekers by Country - World Map + Top Countries Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* World Map (Left, 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-800">
                Jobseekers by Country
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                <span className="hidden sm:inline">
                  Hover over a country to see jobseeker count. Use + / - buttons to zoom, drag to pan.
                </span>
                <span className="sm:hidden">
                  Tap a country to see count. Use + / - buttons to zoom.
                </span>
              </p>
            </div>
            <div className="self-start sm:self-auto flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-gray-100 shrink-0 whitespace-nowrap font-medium">
              <Globe size={13} className="text-[#16730F]" />
              <span>{jobseekersByCountry.length} countries</span>
            </div>
          </div>
          <div className="w-full min-h-[300px] sm:min-h-[360px] lg:h-[420px] flex flex-col">
            {jobseekersByCountry.length > 0 ? (
              <WorldMap
                data={jobseekersByCountry}
                totalJobseekers={metrics?.total_jobseekers || 0}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No country data available
              </div>
            )}
          </div>
        </div>

        {/* Top Countries (Jobseekers) (Right, 1 col - styled like Top States) */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-800">
                Top Countries (Jobseekers)
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Countries with highest total jobseekers
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-[#16730F] border border-green-100 shrink-0 whitespace-nowrap">
              Top {topCountriesJobseekers.length}
            </span>
          </div>
          <div className="w-full h-80 sm:h-96 lg:h-[420px]">
            {topCountriesJobseekers.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                <BarChart
                  data={topCountriesJobseekers}
                  layout="vertical"
                  margin={{ top: 4, right: 36, left: 8, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    type="number"
                    hide
                    domain={[
                      0,
                      (dataMax) =>
                        Math.max(dataMax + 1, Math.ceil(dataMax * 1.18)),
                    ]}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#4b5563", fontSize: 11, fontFamily: "NunitoRegular" }}
                    width={75}
                    tickFormatter={(val) =>
                      val && val.length > 11 ? `${val.slice(0, 10)}…` : val
                    }
                  />
                  <RechartsTooltip
                    cursor={{ fill: "transparent" }}
                    formatter={(value) => [
                      `${Number(value).toLocaleString()} jobseekers${
                        metrics?.total_jobseekers
                          ? ` (${(
                              (value / metrics.total_jobseekers) *
                              100
                            ).toFixed(1)}%)`
                          : ""
                      }`,
                      "Jobseekers",
                    ]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontFamily: "NunitoRegular",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Jobseekers"
                    fill="#16730F"
                    radius={[0, 4, 4, 0]}
                    barSize={16}
                  >
                    <LabelList
                      dataKey="count"
                      position="right"
                      offset={6}
                      formatter={(val) =>
                        val != null ? Number(val).toLocaleString() : ""
                      }
                      style={{
                        fill: "#15803d",
                        fontSize: "11px",
                        fontWeight: 700,
                        fontFamily: "NunitoRegular",
                      }}
                    />
                    {topCountriesJobseekers.map((entry, index) => (
                      <Cell
                        key={`cell-country-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No country data available
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Age Distribution (Bar) */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6">
            Age Distribution
          </h3>
          <div className="h-72 w-full">
            {jobseekersByAge.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={jobseekersByAge}
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
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#4b5563", fontSize: 12, fontFamily: "NunitoRegular" }}
                  />
                  <RechartsTooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontFamily: "NunitoRegular",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Jobseekers"
                    fill="#f59e0b"
                    radius={[0, 4, 4, 0]}
                    barSize={18}
                  >
                    {jobseekersByAge.map((entry, index) => (
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
                No age data available
              </div>
            )}
          </div>
        </div>

        {/* Jobseekers by Gender (Pie) */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6">
            Gender Distribution
          </h3>
          <div className="h-64 w-full">
            {jobseekersByGender.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={jobseekersByGender}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="name"
                  >
                    {jobseekersByGender.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value) => [value, "Users"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontFamily: "NunitoRegular",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontFamily: "NunitoRegular" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No gender data available
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jobseekers by State (Bar) */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6">
            Top States (Jobseekers)
          </h3>
          <div className="h-72 w-full">
            {jobseekersByState.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={jobseekersByState}
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
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#4b5563", fontSize: 12, fontFamily: "NunitoRegular" }}
                  />
                  <RechartsTooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontFamily: "NunitoRegular",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Users"
                    fill="#3b82f6"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  >
                    {jobseekersByState.map((entry, index) => (
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
                No state data available
              </div>
            )}
          </div>
        </div>

        {/* Top Countries (Employers) - Pie Chart */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6">
            Top Countries (Employers)
          </h3>
          <div className="h-72 w-full">
            {employersByCountry.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={employersByCountry}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    labelLine={{ strokeWidth: 1, stroke: "#ccc" }}
                  >
                    {employersByCountry.map((entry, index) => (
                      <Cell
                        key={`cell-emp-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value, name) => [value, "Employers"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontFamily: "NunitoRegular",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontFamily: "NunitoRegular" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No country data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDemographics;
