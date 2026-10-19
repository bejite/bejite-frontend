import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getAdProCampaignReports } from "../services/adProApi";

const isSameReport = (report, campaignId) =>
  report && String(report.id) === String(campaignId);

export function useAdProCampaignReports(campaignId) {
  const location = useLocation();
  const cachedReport = isSameReport(location.state?.report, campaignId)
    ? location.state.report
    : null;

  const [report, setReport] = useState(cachedReport);
  const [loading, setLoading] = useState(!cachedReport);
  const [error, setError] = useState(null);
  const hasCachedData = useRef(Boolean(cachedReport));

  const loadReport = useCallback(
    async ({ background = false } = {}) => {
      if (!campaignId) {
        setLoading(false);
        return null;
      }

      if (!background) {
        setLoading(true);
        setError(null);
      }

      try {
        const response = await getAdProCampaignReports(campaignId);

        if (!response?.success) {
          throw new Error(response?.message || "Failed to load campaign reports");
        }

        setReport(response.data);
        setError(null);
        return response.data;
      } catch (err) {
        console.error("Campaign reports load error:", err);
        const message =
          err.response?.data?.message ||
          err.message ||
          "Failed to load campaign reports";

        if (!background || !hasCachedData.current) {
          setReport(null);
        }
        setError(message);
        return null;
      } finally {
        if (!background) {
          setLoading(false);
        }
      }
    },
    [campaignId],
  );

  useEffect(() => {
    if (cachedReport) {
      setReport(cachedReport);
      setLoading(false);
      setError(null);
      hasCachedData.current = true;
      loadReport({ background: true });
      return;
    }

    hasCachedData.current = false;
    setReport(null);
    loadReport();
  }, [campaignId, cachedReport, loadReport]);

  return {
    report,
    loading,
    error,
    reload: loadReport,
  };
}
