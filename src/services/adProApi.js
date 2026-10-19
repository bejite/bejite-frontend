import axiosInstance from "../utils/axiosInstance";

export const getAdProFeedAds = async (limit = 5) => {
  const response = await axiosInstance.get("/api/adpro/feed", {
    params: { limit },
  });
  return response.data;
};

export const getAdProDashboard = async (params = {}) => {
  const response = await axiosInstance.get("/api/adpro/dashboard", { params });
  return response.data;
};

export const getAdProCampaign = async (campaignId) => {
  const response = await axiosInstance.get(`/api/adpro/campaigns/${campaignId}`);
  return response.data;
};

export const getAdProCampaignReports = async (campaignId) => {
  const response = await axiosInstance.get(
    `/api/adpro/campaigns/${campaignId}/reports`,
  );
  return response.data;
};

export const updateAdProCampaign = async (campaignId, payload) => {
  const response = await axiosInstance.patch(
    `/api/adpro/campaigns/${campaignId}`,
    payload,
  );
  return response.data;
};

export const estimateAdProAudience = async (audience) => {
  const response = await axiosInstance.post("/api/adpro/audience/estimate", {
    audience,
  });
  return response.data;
};

export const createAdProCampaign = async (campaignData) => {
  const formData = new FormData();

  formData.append("name", campaignData.name);
  formData.append("headline", campaignData.headline);
  formData.append("description", campaignData.description);
  formData.append("landingType", campaignData.landingType);
  formData.append("landingDestination", campaignData.landingDestination);
  formData.append("audience", JSON.stringify(campaignData.audience || {}));
  formData.append("budget", String(campaignData.budget ?? 0));
  formData.append("reachPurchased", String(campaignData.reachPurchased ?? 0));
  formData.append("status", campaignData.status || "pending_review");

  if (campaignData.mediaType) {
    formData.append("mediaType", campaignData.mediaType);
  }

  if (campaignData.media) {
    formData.append("media", campaignData.media);
  }

  const response = await axiosInstance.post("/api/adpro/campaigns", formData);
  return response.data;
};

export const duplicateAdProCampaign = async (campaignId) => {
  const response = await axiosInstance.post(
    `/api/adpro/campaigns/${campaignId}/duplicate`,
  );
  return response.data;
};

export const deleteAdProCampaign = async (campaignId) => {
  const response = await axiosInstance.delete(`/api/adpro/campaigns/${campaignId}`);
  return response.data;
};

export const trackAdCampaignEvent = async (campaignId, type) => {
  const response = await axiosInstance.post(
    `/api/adpro/campaigns/${campaignId}/events`,
    { type },
  );
  return response.data;
};

export const likeAdCampaign = async (campaignId) => {
  const response = await axiosInstance.post(
    `/api/adpro/campaigns/${campaignId}/like`,
  );
  return response.data;
};

export const unlikeAdCampaign = async (campaignId) => {
  const response = await axiosInstance.delete(
    `/api/adpro/campaigns/${campaignId}/like`,
  );
  return response.data;
};

export const saveAdCampaign = async (campaignId) => {
  const response = await axiosInstance.post(
    `/api/adpro/campaigns/${campaignId}/save`,
  );
  return response.data;
};

export const unsaveAdCampaign = async (campaignId) => {
  const response = await axiosInstance.delete(
    `/api/adpro/campaigns/${campaignId}/save`,
  );
  return response.data;
};

export const shareAdCampaign = async (campaignId) => {
  const response = await axiosInstance.post(
    `/api/adpro/campaigns/${campaignId}/share`,
  );
  return response.data;
};

export default {
  getAdProFeedAds,
  getAdProDashboard,
  getAdProCampaign,
  getAdProCampaignReports,
  updateAdProCampaign,
  estimateAdProAudience,
  createAdProCampaign,
  duplicateAdProCampaign,
  deleteAdProCampaign,
  trackAdCampaignEvent,
  likeAdCampaign,
  unlikeAdCampaign,
  saveAdCampaign,
  unsaveAdCampaign,
  shareAdCampaign,
};
