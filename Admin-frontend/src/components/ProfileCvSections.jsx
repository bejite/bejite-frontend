import {
  formatDateRange,
  formatDateToMonthYear,
  isOngoingCvEntry,
} from "../utils/checksFormat";
import { CertificateViewLink } from "./CertificateViewerModal";
import {
  normalizeProfileSkills,
  resolveProfileSkillSource,
} from "../utils/profileSkills";
import ProfileSkillsDisplay from "./ProfileSkillsDisplay";
import ResponsibilitiesList from "./ResponsibilitiesList";
import {
  getFormattedEducationFields,
  getFormattedWorkHistoryFields,
  toTitleCaseWords,
} from "../utils/displayFormatUtils";

const Section = ({ title, children, empty }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6 min-w-0">
    <h2 className="text-lg sm:text-xl font-semibold text-[#1A3E32] mb-3 sm:mb-4 break-words">
      {title}
    </h2>
    {empty ? <p className="text-gray-500 text-sm">Not provided</p> : children}
  </div>
);

const ProfileCvSections = ({
  cv,
  candidate = null,
  showCertificates = true,
}) => {
  if (!cv) return null;

  const bio = cv.bio;
  const skillItems = normalizeProfileSkills(
    resolveProfileSkillSource({ cv, candidate }),
  );
  const hasBioDetails =
    bio &&
    (bio.gender ||
      bio.marital_status ||
      bio.age ||
      bio.country ||
      bio.tribe ||
      bio.zip);

  const personalDetails = [
    { label: "Gender", value: bio?.gender, format: "title" },
    { label: "Marital status", value: bio?.marital_status, format: "title" },
    { label: "Age", value: bio?.age },
    { label: "Country", value: bio?.country, format: "title" },
    { label: "City", value: bio?.city, format: "title" },
    { label: "Tribe", value: bio?.tribe, format: "title" },
  ]
    .filter(
      (detail) => detail.value != null && String(detail.value).trim() !== "",
    )
    .map((detail) => ({
      ...detail,
      display:
        detail.format === "title"
          ? toTitleCaseWords(detail.value)
          : String(detail.value),
    }));

  return (
    <>
      {hasBioDetails && (
        <Section title="Personal details">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {personalDetails.map((detail) => (
              <div
                key={detail.label}
                className="rounded-lg border border-gray-100 bg-[#F9FAF8] px-4 py-3"
              >
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  {detail.label}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-[#1A3E32] break-words">
                  {detail.display}
                </dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      <Section title="Education" empty={!cv.education?.length}>
        <ul className="space-y-4">
          {cv.education?.map((edu) => {
            const formatted = getFormattedEducationFields(edu);
            const meta = [formatted.field, formatted.location]
              .filter(Boolean)
              .join(" · ");
            return (
              <li
                key={edu.id}
                className="border-b border-gray-100 pb-4 last:border-0 last:pb-0 min-w-0"
              >
                {formatted.educationLevel && (
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {formatted.educationLevel}
                  </p>
                )}
                {formatted.degree && (
                  <p className="font-semibold text-[#1A3E32] text-sm sm:text-base break-words">
                    {formatted.degree}
                  </p>
                )}
                {formatted.institution && (
                  <p className="text-gray-600 text-sm sm:text-base break-words">
                    {formatted.institution}
                  </p>
                )}
                {meta && (
                  <p className="text-xs sm:text-sm text-gray-500 break-words">
                    {meta}
                  </p>
                )}
                <p className="text-sm text-[#16730F]">
                  {formatDateRange(
                    edu.start_date ?? edu.startDate,
                    edu.end_date ?? edu.endDate,
                    isOngoingCvEntry(edu),
                  )}
                </p>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title="Skills" empty={!skillItems.length}>
        <ProfileSkillsDisplay
          skills={resolveProfileSkillSource({ cv, candidate })}
          variant="card"
        />
      </Section>

      <Section title="Work history" empty={!cv.workHistory?.length}>
        <ul className="space-y-4">
          {cv.workHistory?.map((job) => {
            const formatted = getFormattedWorkHistoryFields(job);
            return (
              <li
                key={job.id}
                className="border-b border-gray-100 pb-4 last:border-0 last:pb-0 min-w-0"
              >
                {formatted.title && (
                  <p className="font-semibold text-[#1A3E32] text-sm sm:text-base break-words">
                    {formatted.title}
                  </p>
                )}
                {formatted.company && (
                  <p className="text-gray-600 text-sm sm:text-base break-words">
                    {formatted.company}
                  </p>
                )}
                <p className="text-sm text-[#16730F]">
                  {formatDateRange(
                    job.start_date ?? job.startDate,
                    job.end_date ?? job.endDate,
                    isOngoingCvEntry(job),
                  )}
                </p>
                {formatted.description && (
                  <ResponsibilitiesList
                    text={formatted.description}
                    className="mt-2 space-y-1.5 list-disc list-outside pl-5 text-sm text-gray-700 break-words"
                  />
                )}
              </li>
            );
          })}
        </ul>
      </Section>

      {showCertificates && (
        <Section title="Certificates" empty={!cv.certificates?.length}>
          <ul className="space-y-3">
            {cv.certificates?.map((cert) => {
              const issueDate = formatDateToMonthYear(
                cert.issue_date ?? cert.issueDate,
              );
              const meta = [cert.issuer, issueDate].filter(Boolean).join(" · ");
              const certTitle = cert.cert_name ?? cert.certName;

              return (
                <li key={cert.id} className="min-w-0">
                  <p className="font-semibold text-[#1A3E32] text-sm sm:text-base break-words">
                    {certTitle}
                  </p>
                  {meta && (
                    <p className="text-xs sm:text-sm text-gray-600 break-words">
                      {meta}
                    </p>
                  )}
                  <CertificateViewLink
                    fileUrl={cert.file_url ?? cert.fileUrl}
                    title={certTitle}
                    className="text-sm text-[#16730F] hover:underline mt-1"
                  />
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      <Section
        title="Links"
        empty={
          !cv.links ||
          !["linkedin", "twitter", "instagram", "portfolio"].some(
            (k) => cv.links[k],
          )
        }
      >
        <ul className="space-y-2 min-w-0">
          {cv.links?.linkedin && (
            <li className="min-w-0 break-words">
              <span className="text-gray-500 text-sm">LinkedIn: </span>
              <a
                href={cv.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#16730F] hover:underline break-words"
              >
                {cv.links.linkedin}
              </a>
            </li>
          )}
          {cv.links?.twitter && (
            <li className="min-w-0 break-words">
              <span className="text-gray-500 text-sm">Twitter: </span>
              <a
                href={cv.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#16730F] hover:underline break-words"
              >
                {cv.links.twitter}
              </a>
            </li>
          )}
          {cv.links?.instagram && (
            <li className="min-w-0 break-words">
              <span className="text-gray-500 text-sm">Instagram: </span>
              <a
                href={cv.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#16730F] hover:underline break-words"
              >
                {cv.links.instagram}
              </a>
            </li>
          )}
          {cv.links?.portfolio && (
            <li className="min-w-0 break-words">
              <span className="text-gray-500 text-sm">Portfolio: </span>
              <a
                href={cv.links.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#16730F] hover:underline break-words"
              >
                {cv.links.portfolio}
              </a>
            </li>
          )}
        </ul>
      </Section>
    </>
  );
};

export default ProfileCvSections;
