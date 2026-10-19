export const DEFAULT_CAMPAIGN_AUDIENCE = {
  targetRoles: ["jobseeker", "recruiter"],
  countries: [],
  states: [],
  cities: [],
  lgas: [],
  gender: "any",
  ageRange: [],
  maritalStatus: "any",
  jobTitles: [],
  industries: [],
  yearsExperience: [],
  qualifications: [],
  activity: [],
  jobSeekingStatus: [],
};

export function normalizeCampaignAudience(audience) {
  if (!audience || typeof audience !== "object") {
    return { ...DEFAULT_CAMPAIGN_AUDIENCE };
  }

  return {
    ...DEFAULT_CAMPAIGN_AUDIENCE,
    ...audience,
  };
}
