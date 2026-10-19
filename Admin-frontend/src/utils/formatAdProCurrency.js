export function formatAdProCurrency(amount) {
  const value = Number(amount) || 0;
  return `₦${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatAdProNumber(value) {
  return (Number(value) || 0).toLocaleString();
}

export function isAdProCampaignCacheValid(campaign, campaignId) {
  if (!campaign || String(campaign.id) !== String(campaignId)) return false;

  return (
    typeof campaign.status === "string" &&
    Number.isFinite(Number(campaign.reachPurchased)) &&
    Number.isFinite(Number(campaign.reachDelivered))
  );
}

export function getCampaignProgress(campaign) {
  if (!campaign || !campaign.reachPurchased) return 0;
  const delivered = Number(campaign.reachDelivered) || 0;
  return (delivered / campaign.reachPurchased) * 100;
}
