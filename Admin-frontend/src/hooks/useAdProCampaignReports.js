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
      await Promise.resolve();
      if (!campaignId) {
        Promise.resolve().then(() => setLoading(false));
        return null;
      }

      if (!background) {
        Promise.resolve().then(() => {
          setLoading(true);
          setError(null);
        });
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

  const [prevCampaignId, setPrevCampaignId] = useState(campaignId);
  const [prevCachedReport, setPrevCachedReport] = useState(cachedReport);

  if (campaignId !== prevCampaignId || cachedReport !== prevCachedReport) {
    setPrevCampaignId(campaignId);
    setPrevCachedReport(cachedReport);
    setReport(cachedReport);
    setLoading(!cachedReport);
    setError(null);
  }

  useEffect(() => {
    hasCachedData.current = Boolean(cachedReport);
    Promise.resolve().then(() => {
      if (cachedReport) {
        loadReport({ background: true });
      } else {
        loadReport();
      }
    });
  }, [campaignId, cachedReport, loadReport]);

  return {
    report,
    loading,
    error,
    reload: loadReport,
  };
}
