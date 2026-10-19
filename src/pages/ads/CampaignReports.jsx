import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  TrendingUp,
  Users,
  MousePointer,
  Eye,
} from "lucide-react";
import { useState, useCallback } from "react";
import NewsFeedLayout from "../../components/layout/NewsFeedLayout";
import CampaignChart from "../../components/Ads/CampaignChart";
import ScrollToTop from "../../components/Ads/ScrollTOTOP";
import {
  AdProErrorBanner,
  AdProLoadingSpinner,
  AdProNotFound,
} from "../../components/Ads/AdProAsyncState";
import { useAdProCampaignReports } from "../../hooks/useAdProCampaignReports";

export default function CampaignReports() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { report, loading, error } = useAdProCampaignReports(id);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(() => {
    if (!report?.dailyData?.length) return;

    setIsExporting(true);

    const csvData = [
      ["Date", "Reach", "Clicks", "CTR (%)"],
      ...report.dailyData.map((day) => [day.date, day.reach, day.clicks, day.ctr]),
    ];
    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campaign_report_${id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setIsExporting(false);
  }, [id, report]);

  return (
    <NewsFeedLayout showSidebars={false}>
      <div className="bg-gray-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <button
              onClick={() => navigate(`/adpro/campaign/${id}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-[#1A3E32] transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Back to Campaign
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <AdProErrorBanner message={error} />

          {loading ? (
            <AdProLoadingSpinner />
          ) : !report ? (
            <AdProNotFound
              message="Campaign report not found."
              onBack={() => navigate("/adpro")}
            />
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Campaign Reports
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">{report.name}</p>
                </div>
                <button
                  onClick={handleExport}
                  disabled={isExporting || !report.dailyData?.length}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors text-sm disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {isExporting ? "Exporting..." : "Export Report"}
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 text-[#1A3E32] mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs sm:text-sm">Total Reach</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {report.totalReach.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 text-[#1A3E32] mb-2">
                    <MousePointer className="w-4 h-4" />
                    <span className="text-xs sm:text-sm">Clicks</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {report.totalClicks.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 text-[#1A3E32] mb-2">
                    <Eye className="w-4 h-4" />
                    <span className="text-xs sm:text-sm">CTR</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {report.ctr}%
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 text-[#1A3E32] mb-2">
                    <Users className="w-4 h-4" />
                    <span className="text-xs sm:text-sm">Engagement</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {report.engagement.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                    Performance Trend
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#1A3E32]" />
                      <span>Reach</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#2d6a54]" />
                      <span>Engagement</span>
                    </div>
                  </div>
                </div>
                <CampaignChart period="week" data={report.chartData} />
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4 text-base sm:text-lg">
                  Daily Breakdown
                </h3>
                {report.dailyData.length === 0 ? (
                  <p className="text-sm text-gray-500">No report data available yet.</p>
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50">
                          <tr>
                            <th className="text-left py-3 px-4 sm:px-4 font-semibold text-gray-600 text-xs sm:text-sm">
                              Date
                            </th>
                            <th className="text-right py-3 px-4 sm:px-4 font-semibold text-gray-600 text-xs sm:text-sm">
                              Reach
                            </th>
                            <th className="text-right py-3 px-4 sm:px-4 font-semibold text-gray-600 text-xs sm:text-sm">
                              Clicks
                            </th>
                            <th className="text-right py-3 px-4 sm:px-4 font-semibold text-gray-600 text-xs sm:text-sm">
                              CTR
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {report.dailyData.map((day, index) => (
                            <tr
                              key={day.date}
                              className={`hover:bg-gray-50 transition-colors ${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                              }`}
                            >
                              <td className="py-2.5 px-4 sm:px-4 text-gray-700 text-xs sm:text-sm">
                                {new Date(`${day.date}T12:00:00`).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )}
                              </td>
                              <td className="text-right py-2.5 px-4 sm:px-4 text-gray-700 text-xs sm:text-sm">
                                {day.reach.toLocaleString()}
                              </td>
                              <td className="text-right py-2.5 px-4 sm:px-4 text-gray-700 text-xs sm:text-sm">
                                {day.clicks.toLocaleString()}
                              </td>
                              <td className="text-right py-2.5 px-4 sm:px-4 font-medium text-[#1A3E32] text-xs sm:text-sm">
                                {day.ctr}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="border-t border-gray-200 bg-gray-50">
                          <tr>
                            <td className="py-3 px-4 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">
                              Total
                            </td>
                            <td className="text-right py-3 px-4 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">
                              {report.totalReach.toLocaleString()}
                            </td>
                            <td className="text-right py-3 px-4 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">
                              {report.totalClicks.toLocaleString()}
                            </td>
                            <td className="text-right py-3 px-4 sm:px-4 font-semibold text-[#1A3E32] text-xs sm:text-sm">
                              {report.ctr}%
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <ScrollToTop />
    </NewsFeedLayout>
  );
}
