import { toast } from "react-toastify";
import {
  getSocialShareUrl,
  openExternalShare,
  openShareWindow,
} from "./postShare";
import { sharePitch } from "../services/pitchesApi";

export function getPitchShareUrl(pitchId) {
  if (!pitchId || pitchId === "latest") {
    return `${window.location.origin}/pitch`;
  }
  return `${window.location.origin}/pitch?id=${encodeURIComponent(pitchId)}`;
}

export function buildPitchShareText(pitch) {
  const creatorName =
    pitch?.creator?.name?.trim() ||
    [pitch?.creator?.firstName, pitch?.creator?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    pitch?.userName?.trim() ||
    "Someone";

  const headline = pitch?.headline?.trim()?.replace(/[«»]/g, "");
  const role =
    pitch?.creator?.role?.trim() ||
    (Array.isArray(pitch?.targetRoles) ? pitch.targetRoles[0] : null) ||
    pitch?.userRole?.trim();

  if (headline && role) {
    return `Check out ${creatorName}'s pitch (${role}): "${headline}" on Bejite`;
  }
  if (headline) {
    return `Check out ${creatorName}'s pitch: "${headline}" on Bejite`;
  }
  if (role) {
    return `Check out ${creatorName}'s pitch for ${role} on Bejite`;
  }
  return `Check out this pitch on Bejite`;
}

export function getPitchWhatsAppShareHref(pitch) {
  const url = getPitchShareUrl(pitch?.id);
  const text = buildPitchShareText(pitch);
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n${url}`)}`;
}

/** Direct href for share modal links — avoids popup blockers on mobile and desktop. */
export function getPitchPlatformHref(pitch, platform) {
  if (!pitch || platform === "copy") return null;

  const url = getPitchShareUrl(pitch.id);
  const text = buildPitchShareText(pitch);

  if (platform === "whatsapp") {
    return getPitchWhatsAppShareHref(pitch);
  }

  return getSocialShareUrl(platform, url, { text, title: pitch.headline });
}

export async function copyPitchLink(pitchId) {
  const url = getPitchShareUrl(pitchId);
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      toast.success("Pitch link copied to clipboard!");
    } else {
      toast.success("Pitch link copied to clipboard!");
    }
  } catch {
    toast.info(`Pitch link: ${url}`);
  }
  return url;
}

export async function recordPitchShare(pitchId) {
  if (!pitchId || pitchId === "latest") return null;
  try {
    return await sharePitch(pitchId);
  } catch (error) {
    console.error("recordPitchShare failed:", error);
    return null;
  }
}
