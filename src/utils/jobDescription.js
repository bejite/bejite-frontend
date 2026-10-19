const SUMMARY_MAX_LENGTH = 160;

export const parseDescriptionLines = (text) => {
  if (!text?.trim()) return [];

  return text
    .split(/\n+/)
    .map((line) => line.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
};

export const truncateJobExcerpt = (text, maxLength = SUMMARY_MAX_LENGTH) => {
  const normalized = String(text || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return "";
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
};

/** Insert breaks before common section headers and numbered list items. */
export const formatJobDescriptionText = (text) => {
  if (!text?.trim()) return "";

  return text
    .replace(
      /\s*(Position Summary|Success in this role(?: will be measured by)?|Roles(?: and Responsibilities)?|Key Responsibilities)\s*:?\s*/gi,
      "\n\n$1\n",
    )
    .replace(/\s+(\d+)\.\s+/g, "\n$1. ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

/** Short teaser for listing cards — prefer responsibilities, then qualifications. */
export const getJobCardExcerpt = (job) => {
  if (!job) return "";

  if (job.summary?.trim()) {
    return truncateJobExcerpt(job.summary);
  }

  if (Array.isArray(job.responsibilities) && job.responsibilities.length > 0) {
    return truncateJobExcerpt(job.responsibilities[0]);
  }

  const source =
    job.responsibilitiesText?.trim() ||
    job.qualificationsText?.trim() ||
    job.rolesText?.trim() ||
    job.description?.trim() ||
    "";
  const [firstLine] = parseDescriptionLines(source);

  return truncateJobExcerpt(firstLine || source);
};
