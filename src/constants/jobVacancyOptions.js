export const WORK_MODE_OPTIONS = [
  { value: "Remote", label: "Remote" },
  { value: "Onsite", label: "Onsite" },
  { value: "Hybrid", label: "Hybrid" },
];

export const JOB_TYPE_OPTIONS = [
  { value: "Full-time", label: "Full-time" },
  { value: "Part-time", label: "Part-time" },
  { value: "Contract", label: "Contract" },
  { value: "Internship", label: "Internship" },
  { value: "Freelance", label: "Freelance" },
  { value: "Temporary", label: "Temporary" },
];

export const EXPERIENCE_LEVEL_OPTIONS = [
  { value: "Entry", label: "Beginner / Entry" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Senior", label: "Senior" },
  { value: "Lead", label: "Lead" },
  { value: "Executive", label: "Executive" },
];

export const DEFAULT_WORK_MODE = "Remote";
export const DEFAULT_JOB_TYPE = "Full-time";
export const DEFAULT_EXPERIENCE_LEVEL = "Intermediate";

export const normalizeWorkMode = (mode) => {
  const key = String(mode || "").trim().toLowerCase();
  if (key === "remote") return "Remote";
  if (key === "onsite" || key === "on-site" || key === "on site") {
    return "Onsite";
  }
  if (key === "hybrid") return "Hybrid";
  return DEFAULT_WORK_MODE;
};

export const normalizeJobType = (value) => {
  const key = String(value || "").trim().toLowerCase();
  const match = JOB_TYPE_OPTIONS.find(
    (opt) => opt.value.toLowerCase() === key || opt.label.toLowerCase() === key,
  );
  if (match) return match.value;
  if (key === "full time" || key === "fulltime") return "Full-time";
  if (key === "part time" || key === "parttime") return "Part-time";
  if (key === "paid internship") return "Internship";
  return DEFAULT_JOB_TYPE;
};

export const normalizeExperienceLevel = (value) => {
  const key = String(value || "").trim().toLowerCase();
  const match = EXPERIENCE_LEVEL_OPTIONS.find(
    (opt) => opt.value.toLowerCase() === key || opt.label.toLowerCase() === key,
  );
  if (match) return match.value;
  if (
    key === "beginner" ||
    key === "beginner level" ||
    key === "entry level" ||
    key === "entry-level" ||
    key === "junior"
  ) {
    return "Entry";
  }
  if (key === "mid" || key === "mid-level" || key === "intermediate level") {
    return "Intermediate";
  }
  if (key === "senior level") return "Senior";
  if (key === "lead level") return "Lead";
  if (key === "executive level" || key === "executive (c-level)") {
    return "Executive";
  }
  return DEFAULT_EXPERIENCE_LEVEL;
};

export const formatExperienceLevelLabel = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const match = EXPERIENCE_LEVEL_OPTIONS.find(
    (opt) => opt.value.toLowerCase() === raw.toLowerCase(),
  );
  return match ? match.label : raw;
};

export const formatExperienceLevelBadge = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/level$/i.test(raw)) return raw;
  if (raw.toLowerCase() === "entry") return "Beginner / Entry Level";
  return `${raw} Level`;
};

