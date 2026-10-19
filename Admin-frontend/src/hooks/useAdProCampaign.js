import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  getAdProCampaign,
  updateAdProCampaign,
} from "../services/adProApi";
import { isAdProCampaignCacheValid } from "../utils/formatAdProCurrency";

export function useAdProCampaign(campaignId, { initialData } = {}) {
  const location = useLocation();
  const cachedCampaign =
    initialData ??
    (isAdProCampaignCacheValid(location.state?.campaign, campaignId)
      ? location.state.campaign
      : null);

  const [campaign, setCampaign] = useState(cachedCampaign);
  const [loading, setLoading] = useState(!cachedCampaign);
  const [error, setError] = useState(null);
  const [mutating, setMutating] = useState(false);
  const hasCachedData = useRef(Boolean(cachedCampaign));

  const loadCampaign = useCallback(
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
        const response = await getAdProCampaign(campaignId);

        if (!response?.success) {
          throw new Error(response?.message || "Failed to load campaign");
        }

        setCampaign(response.data);
        setError(null);
        return response.data;
      } catch (err) {
        console.error("Campaign load error:", err);
        const message =
          err.response?.data?.message ||
          err.message ||
          "Failed to load campaign";

        if (!background || !hasCachedData.current) {
          setCampaign(null);
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
  const [prevCachedCampaign, setPrevCachedCampaign] = useState(cachedCampaign);

  if (campaignId !== prevCampaignId || cachedCampaign !== prevCachedCampaign) {
    setPrevCampaignId(campaignId);
    setPrevCachedCampaign(cachedCampaign);
    setCampaign(cachedCampaign);
    setLoading(!cachedCampaign);
    setError(null);
  }

  useEffect(() => {
    hasCachedData.current = Boolean(cachedCampaign);
    Promise.resolve().then(() => {
      if (cachedCampaign) {
        loadCampaign({ background: true });
      } else {
        loadCampaign();
      }
    });
  }, [campaignId, cachedCampaign, loadCampaign]);

  const updateCampaign = useCallback(
    async (payload) => {
      if (!campaignId) {
        throw new Error("Campaign ID is required");
      }

      setMutating(true);
      setError(null);

      try {
        const response = await updateAdProCampaign(campaignId, payload);

        if (!response?.success) {
          throw new Error(response?.message || "Failed to update campaign");
        }

        setCampaign(response.data);
        return response.data;
      } catch (err) {
        console.error("Campaign update error:", err);
        const message =
          err.response?.data?.message ||
          err.message ||
          "Failed to update campaign";
        setError(message);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [campaignId],
  );

  return {
    campaign,
    loading,
    error,
    mutating,
    reload: loadCampaign,
    updateCampaign,
    setCampaign,
  };
}
