import { useState, useEffect, useRef } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { CreditCard, DollarSign, Activity, TrendingUp, Eye } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import ChartPeriodSelect from "../../components/admin/ChartPeriodSelect";
import AdminTransactionDetailModal from "../../components/admin/AdminTransactionDetailModal";
import {
  DEFAULT_CHART_PERIOD,
  getChartPeriodLabel,
  formatChartTick,
  fillDailyChartSeries,
  getChartTickInterval,
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

const ITEMS_PER_PAGE = 5;

const formatCurrency = (amount, currency = "NGN") => {
  const code = currency || "NGN";
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: code,
    }).format(Number(amount || 0));
  } catch {
    return `${code} ${Number(amount || 0).toLocaleString()}`;
  }
};

const formatAxisAmount = (value) => {
  const n = Number(value) || 0;
  if (Math.abs(n) >= 1000) {
    const thousands = n / 1000;
    return `₦${Number.isInteger(thousands) ? thousands : thousands.toFixed(1)}k`;
  }
  return `₦${n}`;
};

const AdminRevenue = () => {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    recentTransactions: [],
    monthlyRevenue: [],
    revenueTrend: [],
  });
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [period, setPeriod] = useState(DEFAULT_CHART_PERIOD);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txPagination, setTxPagination] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 0,
  });
  const [metricsReady, setMetricsReady] = useState(false);
  const periodLabel = getChartPeriodLabel(period);
  const hasLoadedRef = useRef(false);
  const metricsRef = useRef(metrics);
  metricsRef.current = metrics;

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        if (!hasLoadedRef.current) setLoading(true);
        const [revenueRes, overviewRes] = await Promise.all([
          axiosInstance.get(`/api/admin/metrics/revenue?period=${period}`),
          axiosInstance.get("/api/admin/metrics/overview"),
        ]);

        setMetrics(revenueRes.data);
        setTotalUsers(overviewRes.data?.totalUsers || 0);
        hasLoadedRef.current = true;
        setMetricsReady(true);
      } catch (error) {
        console.error("Error fetching revenue metrics", error);
        toast.error("Failed to load revenue data");
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [period]);

  useEffect(() => {
    let cancelled = false;

    const fetchTransactions = async () => {
      try {
        const { data } = await axiosInstance.get(
          `/api/admin/metrics/revenue/transactions?page=${currentPage}&limit=${ITEMS_PER_PAGE}`,
        );
        if (cancelled) return;
        setTransactions(data.transactions || []);
        setTxPagination(
          data.pagination || {
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            total: (data.transactions || []).length,
            totalPages: 1,
          },
        );
      } catch {
        if (cancelled) return;
        const all = metricsRef.current.recentTransactions || [];
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        setTransactions(all.slice(start, start + ITEMS_PER_PAGE));
        setTxPagination({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          total: all.length,
          totalPages: all.length > 0 ? Math.ceil(all.length / ITEMS_PER_PAGE) : 0,
        });
      }
    };

    fetchTransactions();
    return () => {
      cancelled = true;
    };
  }, [currentPage, metricsReady]);

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16730F]"></div>
      </div>
    );
  }

  const totalTx = txPagination.total || 0;
  const totalPages = txPagination.totalPages || 0;
  const startIdx =
    totalTx === 0 ? 0 : (txPagination.page - 1) * txPagination.limit;
  const endIdx = Math.min(startIdx + (transactions.length || 0), totalTx);
  const paginatedTx = transactions;

  const revenueChartData = fillDailyChartSeries(
    metrics.revenueTrend || metrics.monthlyRevenue,
    period,
    "revenue",
  );
  const tickInterval = getChartTickInterval(revenueChartData.length);

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Revenue Performance
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Monitor platform earnings and payment transactions.
          </p>
        </div>
        <ChartPeriodSelect
          id="revenue-chart-period"
          value={period}
          onChange={setPeriod}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          icon={DollarSign}
          colorClass="bg-green-50 text-green-600"
          subtitle="Lifetime platform revenue"
        />
        <StatCard
          title="Total Transactions"
          value={metrics.totalTransactions}
          icon={CreditCard}
          colorClass="bg-blue-50 text-blue-600"
          subtitle="Successful payments"
        />
        <StatCard
          title="Avg Revenue Per User"
          value={formatCurrency(
            totalUsers > 0 ? Number(metrics.totalRevenue) / totalUsers : 0,
          )}
          icon={Activity}
          colorClass="bg-purple-50 text-purple-600"
          subtitle="Total revenue ÷ Total users on platform"
        />
        <StatCard
          title="Active Subscriptions"
          value={Number(
            metrics.advanced?.active_recruiter_subscriptions ??
              metrics.advanced?.active_subscriptions ??
              0,
          )}
          icon={TrendingUp}
          colorClass="bg-amber-50 text-amber-600"
          subtitle="Recruiters with active subscriptions"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Breakdown */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <h2 className="text-lg font-bold text-gray-800 mb-6">
            Revenue Breakdown
          </h2>
          <div className="space-y-6">
            {(() => {
              const aseRevenue = Number(metrics.advanced?.ase_revenue || 0);
              const subscriptionRevenue = Number(
                metrics.advanced?.subscription_revenue || 0,
              );
              const oneTimeRevenue = Number(
                metrics.advanced?.one_time_revenue || 0,
              );
              const total = aseRevenue + subscriptionRevenue + oneTimeRevenue;

              const asePercent =
                total > 0 ? Math.round((aseRevenue / total) * 100) : 0;
              const subPercent =
                total > 0 ? Math.round((subscriptionRevenue / total) * 100) : 0;
              const oneTimePercent =
                total > 0 ? Math.round((oneTimeRevenue / total) * 100) : 0;

              return (
                <>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">
                        ASE Searches
                      </span>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(aseRevenue)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${asePercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">
                        Subscriptions
                      </span>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(subscriptionRevenue)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${subPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">
                        One-Time Payments
                      </span>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(oneTimeRevenue)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full transition-all"
                        style={{ width: `${oneTimePercent}%` }}
                      ></div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">
            Revenue ({periodLabel})
          </h2>
          <div className="h-[300px]">
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueChartData}
                  margin={{ top: 8, right: 12, left: 0, bottom: 28 }}
                >
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
                    interval={tickInterval}
                    minTickGap={0}
                    dy={8}
                    padding={{ left: 12, right: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatAxisAmount}
                  />
                  <RechartsTooltip
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={formatChartTick}
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill="#16730F"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No revenue data available for this period.
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions - Full Width */}
        <div className="bg-white w-full p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-3">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Recent Transactions
          </h2>
          <div className="overflow-x-auto">
            <div className="space-y-4 min-w-[500px]">
              {totalTx > 0 ? (
                paginatedTx.map((tx) => {
                  const payerName =
                    tx.payer_name ||
                    [tx.first_name, tx.last_name]
                      .filter(Boolean)
                      .join(" ")
                      .trim();
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                          <CreditCard size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 capitalize truncate">
                            {tx.plan_type || tx.transaction_type || "Custom Plan"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {payerName ? `${payerName} · ` : ""}
                            {new Date(tx.created_at).toLocaleDateString()}
                            {tx.status ? ` · ${tx.status}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="font-bold text-gray-800">
                          {formatCurrency(tx.amount, tx.currency)}
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedTransaction(tx)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-white hover:border-[#16730F] hover:text-[#16730F] transition-colors"
                        >
                          <Eye size={14} />
                          View details
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-400 py-8">
                  No recent transactions.
                </div>
              )}
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-gray-100 text-sm">
              <div className="text-gray-500">
                Showing {startIdx + 1}–{endIdx} of {totalTx}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="px-2 text-gray-700 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedTransaction && (
        <AdminTransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
};

export default AdminRevenue;
