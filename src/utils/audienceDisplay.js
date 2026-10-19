import { parseStateKey, parseCityKey, parseLgaKey } from "./countryStateData";

export const AUDIENCE_FIELD_DEFS = [
  {
    key: "targetRoles",
    label: "Show ads to",
    optionLabels: {
      jobseeker: "Jobseekers",
      recruiter: "Recruiters & employers",
    },
  },
  { key: "countries", label: "Countries" },
  { key: "states", label: "State / city / town", geographic: "state" },
  { key: "cities", label: "City / town / area", geographic: "city" },
  { key: "lgas", label: "LGAs", geographic: "lga" },
  { key: "gender", label: "Gender", single: true },
  { key: "ageRange", label: "Age range", optionLabels: {
    "18-24": "18-24 years",
    "25-34": "25-34 years",
    "35-44": "35-44 years",
    "45-54": "45-54 years",
    "55+": "55+ years",
  }},
  { key: "maritalStatus", label: "Marital status", single: true },
  { key: "jobTitles", label: "Job titles" },
  { key: "industries", label: "Industries" },
  { key: "yearsExperience", label: "Years of experience", optionLabels: {
    "0-2": "0-2 years",
    "3-5": "3-5 years",
    "6-10": "6-10 years",
    "10+": "10+ years",
  }},
  { key: "qualifications", label: "Qualifications", optionLabels: {
    diploma: "Diploma",
    bachelors: "Bachelor's Degree",
    masters: "Master's Degree",
    phd: "PhD",
    professional: "Professional Certification",
  }},
  { key: "activity", label: "Activity", optionLabels: {
    "7days": "Active last 7 days",
    "30days": "Active last 30 days",
    "90days": "Active last 90 days",
  }},
  { key: "jobSeekingStatus", label: "Job seeking status", optionLabels: {
    active: "Actively Seeking",
    open: "Open to Opportunities",
    not: "Not Seeking",
  }},
];

export function formatAudienceScalar(value, single = false) {
  if (single) {
    if (!value || value === "any") return "Any";
    return String(value).charAt(0).toUpperCase() + String(value).slice(1);
  }
  if (!Array.isArray(value) || value.length === 0) return "Any";
  return value.join(", ");
}

export function formatAudienceArrayWithLabels(values, optionLabels = {}) {
  if (!Array.isArray(values) || values.length === 0) return "Any";
  return values
    .map((value) => optionLabels[value] || value)
    .join(", ");
}

export function formatGeographicAudienceValue(geographic, value) {
  if (!Array.isArray(value) || value.length === 0) return null;

  if (geographic === "state") {
    const names = value
      .map((entry) => parseStateKey(entry).state)
      .filter(Boolean);
    return names.length > 0 ? names.join(", ") : null;
  }

  if (geographic === "city") {
    const names = value
      .map((entry) => parseCityKey(entry).city)
      .filter(Boolean);
    return names.length > 0 ? names.join(", ") : null;
  }

  if (geographic === "lga") {
    const names = value
      .map((entry) => parseLgaKey(entry).lga)
      .filter(Boolean);
    return names.length > 0 ? names.join(", ") : null;
  }

  return null;
}

export function getAudienceDisplayItems(audience = {}) {
  return AUDIENCE_FIELD_DEFS.map(({ key, label, single, geographic, optionLabels }) => {
    const rawValue = audience[key];
    let displayValue = null;

    if (geographic) {
      displayValue = formatGeographicAudienceValue(geographic, rawValue);
      if (!displayValue) return null;
    } else if (optionLabels) {
      displayValue = formatAudienceArrayWithLabels(rawValue, optionLabels);
      if (displayValue === "Any") return null;
    } else if (single) {
      displayValue = formatAudienceScalar(rawValue, true);
      if (displayValue === "Any") return null;
    } else {
      displayValue = formatAudienceScalar(rawValue, false);
      if (displayValue === "Any") return null;
    }

    return { key, label, displayValue };
  }).filter(Boolean);
}
