import { toast } from "react-toastify";
import {
  getSocialShareUrl,
  openExternalShare,
} from "./postShare";

export function getJobShareUrl(jobId) {
  if (jobId == null || jobId === "") {
    return `${window.location.origin}/job-vacancy`;
  }
  return `${window.location.origin}/j/${encodeURIComponent(jobId)}`;
}

export const JOB_VACANCY_ALERT_HEADING = "Job vacancy alert:";

export function buildJobShareText(job) {
  const title = job?.title?.trim() || "Job opportunity";
  const company = job?.company?.trim();
  if (company) {
    return `${JOB_VACANCY_ALERT_HEADING} ${title} at ${company}`;
  }
  return `${JOB_VACANCY_ALERT_HEADING} ${title}`;
}

export function getJobWhatsAppShareHref(job) {
  const url = getJobShareUrl(job.id);
  const text = buildJobShareText(job);
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n${url}`)}`;
}

/** Direct href for share modal links — avoids popup blockers on mobile. */
export function getJobPlatformHref(job, platform) {
  if (!job || platform === "copy") return null;

  const url = getJobShareUrl(job.id);
  const text = buildJobShareText(job);

  if (platform === "whatsapp") {
    return getJobWhatsAppShareHref(job);
  }

  return getSocialShareUrl(platform, url, { text, title: job.title });
}

export async function copyJobLink(jobId) {
  const url = getJobShareUrl(jobId);
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

export function shareJobToPlatform(job, platform) {
  const href = getJobPlatformHref(job, platform);
  if (href) {
    openExternalShare(href);
    return;
  }
  if (platform === "copy") {
    copyJobLink(job.id);
  }
}
