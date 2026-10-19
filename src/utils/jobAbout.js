export const JOB_ABOUT_MAX_LENGTH = 5000;

export const getJobAboutValidationError = (value) => {
  const about = String(value || "").trim();
  if (about.length > JOB_ABOUT_MAX_LENGTH) {
    return `About must be ${JOB_ABOUT_MAX_LENGTH.toLocaleString()} characters or fewer`;
  }
  return null;
};
