import React from "react";
import {
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaGithub,
  FaGlobe,
  FaGraduationCap,
  FaBriefcase,
  FaCertificate,
  FaUser,
  FaExternalLinkAlt,
  FaLink,
  FaCode,
} from "react-icons/fa";
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

const toExternalHref = (url) => {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const formatDisplayUrl = (url) => {
  if (!url) return "";
  return String(url)
    .trim()
    .replace(/^https?:\/\/(www\.)?/i, "")
    .replace(/\/$/, "");
};

const getUrlHostname = (rawUrl) => {
  const trimmed = String(rawUrl || "").trim();
  if (!trimmed) return "";
  try {
    const href = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    return new URL(href).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return trimmed
      .replace(/^[a-z][a-z\d+.-]*:\/\//i, "")
      .split("/")[0]
      .replace(/^www\./i, "")
      .toLowerCase();
  }
};

const hostIs = (hostname, domain) =>
  hostname === domain || hostname.endsWith(`.${domain}`);

const getLinkMeta = (key, rawUrl) => {
  const hostname = getUrlHostname(rawUrl);
  if (key === "linkedin" || hostIs(hostname, "linkedin.com")) {
    return {
      label: "LinkedIn",
      icon: FaLinkedin,
      brandBadge: "bg-[#0A66C2]/10 text-[#0A66C2] border-[#0A66C2]/20",
      hoverBorder: "hover:border-[#0A66C2]/50",
      hoverBg: "hover:bg-[#0A66C2]/5",
      accentText: "group-hover:text-[#0A66C2]",
    };
  }
  if (
    key === "twitter" ||
    hostIs(hostname, "twitter.com") ||
    hostIs(hostname, "x.com")
  ) {
    return {
      label: "X (Twitter)",
      icon: FaTwitter,
      brandBadge: "bg-slate-100 text-slate-900 border-slate-200",
      hoverBorder: "hover:border-slate-400",
      hoverBg: "hover:bg-slate-50",
      accentText: "group-hover:text-slate-900",
    };
  }
  if (key === "instagram" || hostIs(hostname, "instagram.com")) {
    return {
      label: "Instagram",
      icon: FaInstagram,
      brandBadge: "bg-pink-50 text-pink-600 border-pink-200",
      hoverBorder: "hover:border-pink-400",
      hoverBg: "hover:bg-pink-50/70",
      accentText: "group-hover:text-pink-600",
    };
  }
  if (key === "github" || hostIs(hostname, "github.com")) {
    return {
      label: "GitHub",
      icon: FaGithub,
      brandBadge: "bg-gray-100 text-gray-900 border-gray-200",
      hoverBorder: "hover:border-gray-400",
      hoverBg: "hover:bg-gray-50",
      accentText: "group-hover:text-gray-900",
    };
  }
  if (key === "website") {
    return {
      label: "Website",
      icon: FaGlobe,
      brandBadge: "bg-emerald-50 text-[#16730F] border-emerald-200",
      hoverBorder: "hover:border-emerald-400",
      hoverBg: "hover:bg-emerald-50/70",
      accentText: "group-hover:text-[#16730F]",
    };
  }
  return {
    label: key ? toTitleCaseWords(key) : "Website",
    icon: FaGlobe,
    brandBadge: "bg-emerald-50 text-[#16730F] border-emerald-200",
    hoverBorder: "hover:border-emerald-400",
    hoverBg: "hover:bg-emerald-50/70",
    accentText: "group-hover:text-[#16730F]",
  };
};

export const ProfileLinkItem = ({ type, url }) => {
  if (!url || typeof url !== "string" || !url.trim()) return null;
  const meta = getLinkMeta(type, url);
  const Icon = meta.icon;
  const href = toExternalHref(url);
  const displayUrl = formatDisplayUrl(url);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 bg-white ${meta.hoverBorder} ${meta.hoverBg} transition-all duration-200 shadow-2xs hover:shadow-xs min-w-0 w-full cursor-pointer`}
      title={url}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${meta.brandBadge} flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105 shadow-2xs`}
        >
          <Icon className="text-base sm:text-lg" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {meta.label}
          </p>
          <p
            className={`text-xs sm:text-sm font-semibold text-slate-800 ${meta.accentText} transition-colors truncate max-w-full`}
          >
            {displayUrl}
          </p>
        </div>
      </div>
      <div className="shrink-0 text-slate-400 group-hover:text-[#16730F] transition-colors p-1">
        <FaExternalLinkAlt className="w-3 h-3 opacity-70 group-hover:opacity-100" />
      </div>
    </a>
  );
};

const Section = ({ title, icon: Icon, children, empty, className = "" }) => (
  <div
    className={`bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/80 p-5 sm:p-6 min-w-0 transition-all ${
      className ? className : "mb-5 sm:mb-6"
    }`}
  >
    <h2 className="text-base sm:text-lg font-bold text-[#1A3E32] mb-4 pb-3 border-b border-slate-100 flex items-center gap-2.5">
      {Icon && (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 text-[#16730F] flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      )}
      <span className="truncate">{title}</span>
    </h2>
    {empty ? (
      <div className="text-center py-6 text-slate-400 text-xs sm:text-sm font-medium">
        Not provided
      </div>
    ) : (
      children
    )}
  </div>
);

const ProfileCvSections = ({ cv, candidate = null, exclude = [] }) => {
  if (!cv) return null;
  const hidden = new Set(exclude);

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
        <Section title="Personal details" icon={FaUser}>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            {personalDetails.map((detail) => (
              <div
                key={detail.label}
                className="rounded-2xl border border-slate-200/80 bg-[#FAFAFA] p-3.5 hover:border-slate-300 transition-colors"
              >
                <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {detail.label}
                </dt>
                <dd className="mt-1 text-xs sm:text-sm font-bold text-[#1A3E32] break-words">
                  {detail.display}
                </dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      <Section title="Education" icon={FaGraduationCap} empty={!cv.education?.length}>
        <div className="space-y-3.5">
          {cv.education?.map((edu) => {
            const formatted = getFormattedEducationFields(edu);
            const meta = [formatted.field, formatted.location]
              .filter(Boolean)
              .join(" · ");
            const dateRange = formatDateRange(
              edu.start_date ?? edu.startDate,
              edu.end_date ?? edu.endDate,
              isOngoingCvEntry(edu),
            );
            return (
              <div
                key={edu.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs transition-all min-w-0"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
                  <div className="min-w-0 flex-1">
                    {formatted.educationLevel && (
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {formatted.educationLevel}
                      </p>
                    )}
                    {formatted.degree && (
                      <h3 className="font-bold text-[#1A3E32] text-sm sm:text-base break-words mt-0.5">
                        {formatted.degree}
                      </h3>
                    )}
                    {formatted.institution && (
                      <p className="text-slate-600 font-medium text-xs sm:text-sm break-words mt-0.5">
                        {formatted.institution}
                      </p>
                    )}
                    {meta && (
                      <p className="text-xs text-slate-500 break-words mt-0.5">
                        {meta}
                      </p>
                    )}
                  </div>
                  {dateRange && (
                    <span className="self-start inline-flex items-center text-[11px] font-bold text-[#16730F] bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-full shrink-0 mt-1 sm:mt-0">
                      {dateRange}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {!hidden.has("skills") && (
        <Section title="Skills" icon={FaCode} empty={!skillItems.length}>
          <ProfileSkillsDisplay
            skills={resolveProfileSkillSource({ cv, candidate })}
            variant="card"
          />
        </Section>
      )}

      <Section title="Work history" icon={FaBriefcase} empty={!cv.workHistory?.length}>
        <div className="space-y-3.5">
          {cv.workHistory?.map((job) => {
            const formatted = getFormattedWorkHistoryFields(job);
            const dateRange = formatDateRange(
              job.start_date ?? job.startDate,
              job.end_date ?? job.endDate,
              isOngoingCvEntry(job),
            );
            return (
              <div
                key={job.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs transition-all min-w-0"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
                  <div className="min-w-0 flex-1">
                    {formatted.title && (
                      <h3 className="font-bold text-[#1A3E32] text-sm sm:text-base break-words">
                        {formatted.title}
                      </h3>
                    )}
                    {formatted.company && (
                      <p className="text-slate-600 font-medium text-xs sm:text-sm break-words mt-0.5">
                        {formatted.company}
                      </p>
                    )}
                  </div>
                  {dateRange && (
                    <span className="self-start inline-flex items-center text-[11px] font-bold text-[#16730F] bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-full shrink-0 mt-1 sm:mt-0">
                      {dateRange}
                    </span>
                  )}
                </div>
                {formatted.description && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <ResponsibilitiesList
                      text={formatted.description}
                      className="space-y-1.5 list-disc list-outside pl-4 text-xs sm:text-sm text-slate-700 break-words"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Certificates" icon={FaCertificate} empty={!cv.certificates?.length}>
        <div className="space-y-3">
          {cv.certificates?.map((cert) => {
            const issueDate = formatDateToMonthYear(
              cert.issue_date ?? cert.issueDate,
            );
            const meta = [cert.issuer, issueDate].filter(Boolean).join(" · ");
            const certTitle = cert.cert_name ?? cert.certName;

            return (
              <div
                key={cert.id}
                className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs transition-all min-w-0 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-[#1A3E32] text-xs sm:text-sm break-words">
                    {certTitle}
                  </h3>
                  {meta && (
                    <p className="text-xs text-slate-500 break-words mt-0.5">
                      {meta}
                    </p>
                  )}
                </div>
                <CertificateViewLink
                  fileUrl={cert.file_url ?? cert.fileUrl}
                  title={certTitle}
                  className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-[#16730F] bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors"
                />
              </div>
            );
          })}
        </div>
      </Section>

      {!hidden.has("links") && (
        <Section
          title="Links"
          icon={FaLink}
          empty={
            !cv.links ||
            !["linkedin", "portfolio", "github", "twitter", "instagram", "website"].some(
              (k) => cv.links[k] && String(cv.links[k]).trim(),
            )
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
            {["linkedin", "portfolio", "github", "twitter", "instagram", "website"]
              .filter((k) => cv.links?.[k] && String(cv.links[k]).trim())
              .map((key) => (
                <ProfileLinkItem key={key} type={key} url={cv.links[key]} />
              ))}
          </div>
        </Section>
      )}
    </>
  );
};

export default ProfileCvSections;

/** Standalone Skills section for sidebar use */
export const ProfileSkillsSection = ({
  cv,
  candidate = null,
  className = "",
}) => {
  if (!cv) return null;
  const skillItems = normalizeProfileSkills(
    resolveProfileSkillSource({ cv, candidate }),
  );
  if (!skillItems.length) return null;
  return (
    <Section title="Skills" icon={FaCode} className={className}>
      <ProfileSkillsDisplay
        skills={resolveProfileSkillSource({ cv, candidate })}
        variant="card"
      />
    </Section>
  );
};

/** Standalone Links section for sidebar use */
export const ProfileLinksSection = ({ cv, className = "" }) => {
  if (!cv) return null;
  const links = cv.links || {};
  const availableKeys = [
    "linkedin",
    "portfolio",
    "github",
    "twitter",
    "instagram",
    "website",
  ].filter((k) => links[k] && String(links[k]).trim());

  if (!availableKeys.length) return null;
  return (
    <Section title="Links & Social" icon={FaLink} className={className}>
      <div className="space-y-2.5 min-w-0">
        {availableKeys.map((key) => (
          <ProfileLinkItem key={key} type={key} url={links[key]} />
        ))}
      </div>
    </Section>
  );
};

