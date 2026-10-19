import axiosInstance from "../utils/axiosInstance";

function emptyInbox() {
  return {
    notifications: [],
    counts: { total: 0, verification: 0, adpro: 0, contact: 0 },
  };
}

function mapCampaignToNotification(campaign) {
  const advertiser =
    campaign.advertiserName || campaign.advertiserEmail || "An advertiser";
  const campaignName = campaign.name || campaign.headline || "Untitled campaign";

  return {
    id: `adpro-${campaign.id}`,
    type: "adpro_review",
    category: "adpro",
    priority: "warning",
    title: "AdPro campaign pending review",
    message: `${advertiser} submitted “${campaignName}” for campaign review.`,
    timestamp: campaign.createdAt || campaign.updatedAt,
    read: false,
    link: `/admin/adpro?campaignId=${campaign.id}`,
    entityId: String(campaign.id),
    entityType: "ad_campaign",
  };
}

function withCounts(notifications, counts) {
  const verification =
    counts?.verification ??
    notifications.filter((item) => item.type === "recruiter_verification").length;
  const adpro =
    counts?.adpro ??
    notifications.filter((item) => item.type === "adpro_review").length;
  const contact =
    counts?.contact ??
    notifications.filter((item) => item.type === "contact_message").length;
  const total = counts?.total ?? notifications.length;

  return {
    notifications: [...notifications].sort(
      (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0),
    ),
    counts: { total, verification, adpro, contact },
  };
}

async function fetchInboxFallback() {
  try {
    const campaignsRes = await axiosInstance.get("/api/admin/data/ad-campaigns", {
      params: { status: "pending_review", limit: 100 },
    });
    const campaigns = campaignsRes.data?.data?.campaigns || [];
    const total = campaignsRes.data?.data?.pagination?.total;
    return withCounts(
      campaigns.map(mapCampaignToNotification),
      Number.isFinite(total)
        ? { total, verification: 0, adpro: total, contact: 0 }
        : undefined,
    );
  } catch (error) {
    if (error.response?.status === 403) {
      return emptyInbox();
    }
    throw error;
  }
}

export async function fetchAdminInbox() {
  try {
    const response = await axiosInstance.get("/api/admin/data/inbox");
    if (response.data?.success && Array.isArray(response.data?.data?.notifications)) {
      const notifications = response.data.data.notifications;
      return withCounts(notifications, response.data.data.counts);
    }
    throw new Error(response.data?.message || "Failed to load admin notifications");
  } catch (error) {
    if (error.response?.status && error.response.status !== 404) {
      throw error;
    }
    if (!error.response) {
      throw error;
    }
  }

  return fetchInboxFallback();
}

export async function resolveContactMessage(contactId) {
  const id = String(contactId || "").replace(/^contact-/, "");
  const response = await axiosInstance.patch(
    `/api/admin/data/contact/${encodeURIComponent(id)}/resolve`,
  );
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to resolve contact message");
  }
  return response.data;
}
