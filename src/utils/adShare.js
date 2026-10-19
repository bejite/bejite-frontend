import { toast } from "react-toastify";
import { shareAdCampaign } from "../services/adProApi";
import { getLandingHref } from "./landingDestination";
import { getSocialShareUrl, openShareWindow } from "./postShare";

export function getAdShareUrl(ad) {
  const landingUrl = getLandingHref(ad?.landingType, ad?.landingDestination);
  if (landingUrl) return landingUrl;
  return `${window.location.origin}/a/${encodeURIComponent(ad.id)}`;
}

export function buildAdShareText(ad) {
  const headline = ad?.headline?.trim() || "Campaign on Bejite";
  const description = ad?.description?.trim();
  if (description) {
    const snippet =
      description.length > 120 ? `${description.slice(0, 117).trimEnd()}...` : description;
    return `${headline} — ${snippet}`;
  }
  return headline;
}

export async function recordAdShare(campaignId) {
  try {
    const data = await shareAdCampaign(campaignId);
    return data;
  } catch (err) {
    const message = err.response?.data?.message || err.response?.data?.error;
    if (err.response?.status !== 409) {
      toast.error(message || "Failed to record share");
      throw err;
    }
    return { success: true, counted: false };
  }
}

export async function copyAdLink(ad) {
  const url = getAdShareUrl(ad);
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard.");
    } else {
      toast.success("Share link ready.");
    }
  } catch {
    toast.success("Share link ready.");
  }
  return url;
}

export async function shareAdToPlatform(ad, platform) {
  const result = await recordAdShare(ad.id);
  const url = getAdShareUrl(ad);
  const text = buildAdShareText(ad);
  if (platform === "copy") {
    await copyAdLink(ad);
    return result;
  }
  openShareWindow(getSocialShareUrl(platform, url, { text, title: ad.headline }));
  return result;
}

export async function nativeShareAd(ad) {
  if (!navigator.share) return { usedNative: false, counted: false };

  const url = getAdShareUrl(ad);
  await navigator.share({
    title: ad.headline,
    text: buildAdShareText(ad),
    url,
  });
  const result = await recordAdShare(ad.id);
  return { usedNative: true, counted: result?.counted !== false };
}
