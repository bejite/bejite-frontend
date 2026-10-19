export function buildCandidateSearchParams(searchCriteria, page = 1, limit = 10) {
  const queryParams = new URLSearchParams();

  const searchTerms = [];
  if (searchCriteria.jobInput) searchTerms.push(searchCriteria.jobInput);

  if (searchTerms.length > 0) {
    queryParams.append("q", searchTerms.join(" "));
  }

  if (searchCriteria.industryInput) {
    queryParams.append("industry", searchCriteria.industryInput);
  }
  if (searchCriteria.countryInput) {
    queryParams.append("preferred_country", searchCriteria.countryInput);
  }
  if (searchCriteria.stateInput) {
    queryParams.append("preferred_state", searchCriteria.stateInput);
  }
  if (searchCriteria.workTypeInput) {
    queryParams.append("work_type", searchCriteria.workTypeInput);
  }
  if (searchCriteria.salaryInput) {
    queryParams.append("salary_min", searchCriteria.salaryInput);
  }
  if (searchCriteria.currencyInput) {
    queryParams.append("currency", searchCriteria.currencyInput);
  }
  if (searchCriteria.remoteInput) {
    queryParams.append("remote_preference", searchCriteria.remoteInput);
  }
  if (searchCriteria.availabilityInput) {
    queryParams.append("availability", searchCriteria.availabilityInput);
  }
  if (searchCriteria.rateInput) {
    queryParams.append("rate", searchCriteria.rateInput);
  }
  if (searchCriteria.educationInput) {
    queryParams.append("education_level", searchCriteria.educationInput);
  }
  if (searchCriteria.skillInput) {
    queryParams.append("skills", searchCriteria.skillInput);
  }
  if (searchCriteria.tribeInput) {
    queryParams.append("tribe", searchCriteria.tribeInput);
  }
  if (searchCriteria.ageInput) {
    queryParams.append("age", searchCriteria.ageInput);
  }
  if (searchCriteria.genderInput) {
    queryParams.append("gender", searchCriteria.genderInput);
  }
  if (searchCriteria.maritalInput) {
    queryParams.append("marital_status", searchCriteria.maritalInput);
  }

  queryParams.append("page", String(page));
  queryParams.append("limit", String(limit));

  return queryParams;
}
