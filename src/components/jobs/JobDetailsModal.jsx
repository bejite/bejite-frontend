import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FaArrowLeft,
  FaShareAlt,
  FaBuilding,
  FaBriefcase,
  FaGraduationCap,
  FaRegEnvelope,
  FaExternalLinkAlt,
  FaUserTie,
  FaPhone,
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaUser,
} from "react-icons/fa";
import { MdLocationOn, MdWork } from "react-icons/md";
import { formatTimeRemaining, formatSalary } from "../../utils/checksFormat";
import { profilePhotoUrl } from "../../utils/profilePhotoUrl";
import { ApplicationForm } from "./ApplicationForm";
import SharePostModal from "../SharePostModal";
import VerifiedBadge from "../VerifiedBadge";
import { userHasVerifiedBadge, userShowsUnverifiedRecruiterPill } from "../../utils/verifiedBadge";
import { getJobPlatformHref, copyJobLink } from "../../utils/jobShare";
import { formatJobDescriptionText } from "../../utils/jobDescription";
import { formatStoredRequirements } from "../../utils/jobRequirements";

const JOB_DETAIL_LIST_CLASS =
  "list-disc list-outside pl-5 space-y-1.5 sm:space-y-2 text-sm sm:text-base text-gray-700 break-words";

export const JobDetailsModal = ({ job, onClose, onApply }) => {
  const [isApplying, setIsApplying] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [showShareModal, setShowShareModal] = useState(false);
  const modalRef = useRef(null);

  const salary = formatSalary(job);
  const requirements = formatStoredRequirements(job?.requirements);
  const timeRemaining = formatTimeRemaining(job.expiresAt);
  const companyLogoSrc = profilePhotoUrl(
    job.recruiterProfilePhoto || job.companyLogo,
  );
  const recruiterPhotoSrc = profilePhotoUrl(
    job.recruiter?.profilePhoto || job.recruiterProfilePhoto || job.companyLogo,
  );
  const hasExternalApplication = Boolean(job.applicationUrl?.trim());
  const applyLabel = hasExternalApplication
    ? "Apply on Company Website"
    : "Apply Now";
  const isIndividualPoster =
    String(job.posterMode || "").toLowerCase() === "individual";
  const PosterIcon = isIndividualPoster ? FaUser : FaBuilding;

  const handleApplyClick = () => {
    if (hasExternalApplication) {
      window.open(job.applicationUrl, "_blank", "noopener,noreferrer");
      return;
    }
    setIsApplying(true);
  };

  const socialLinks = [
    { key: "linkedin", href: job.companyLinkedin, icon: FaLinkedin, label: "LinkedIn" },
    { key: "twitter", href: job.companyTwitter, icon: FaTwitter, label: "X (Twitter)" },
    { key: "instagram", href: job.companyInstagram, icon: FaInstagram, label: "Instagram" },
  ].filter((link) => link.href?.trim());

  const companyRegion = [job.companyState, job.companyCountry]
    .filter(Boolean)
    .join(", ");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showShareModal) return;
      if (event.target.closest("[data-share-modal]")) return;
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        if (showShareModal) {
          setShowShareModal(false);
          return;
        }
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [onClose, showShareModal]);

  const shareJob = () => {
    setShowShareModal(true);
  };

  const handleShareOption = (platform) => {
    if (platform === "copy") {
      copyJobLink(job.id);
    }
    setShowShareModal(false);
  };

  const jobSummaryCard = (
    <div className="bg-gray-50 rounded-2xl p-4 sm:p-5">
      <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
        Job Summary
      </h3>
      <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-gray-600 shrink-0">Job Type:</span>
          <span className="font-medium text-right">{job.jobType}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-gray-600 shrink-0">Experience:</span>
          <span className="font-medium text-right">{job.experienceLevel}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-gray-600 shrink-0">Industry:</span>
          <span className="font-medium text-right">{job.industry}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-gray-600 shrink-0">Work Mode:</span>
          <span className="font-medium text-right">{job.workMode}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-gray-600 shrink-0">Deadline:</span>
          <span className="font-medium text-red-600 text-right">
            {new Date(job.applicationDeadline).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );

  const applyCtaCard = (
    <div className="bg-[#16730F]/5 rounded-2xl p-4 sm:p-5 border border-[#16730F]/20">
      <h3 className="font-semibold text-[#16730F] mb-2 text-sm sm:text-base">
        Don&apos;t miss this opportunity!
      </h3>
      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
        This job expires in {timeRemaining.text}. Apply before it&apos;s gone.
      </p>
      <button
        type="button"
        onClick={handleApplyClick}
        className="w-full bg-[#16730F] text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-[#145A0C] transition text-sm sm:text-base inline-flex items-center justify-center gap-2"
      >
        {applyLabel}
        {hasExternalApplication && <FaExternalLinkAlt size={12} />}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
      <div
        ref={modalRef}
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-5xl w-full h-[100dvh] sm:h-auto sm:max-h-[95vh] flex flex-col overflow-hidden shadow-2xl"
      >
        {!isApplying ? (
          <>
            <div className="shrink-0 sticky top-0 bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 z-10">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-gray-900 text-sm sm:text-base min-w-0"
              >
                <FaArrowLeft className="shrink-0" />
                <span className="hidden sm:inline truncate">Back to Jobs</span>
                <span className="sm:hidden">Back</span>
              </button>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={shareJob}
                  className="p-2 rounded-full hover:bg-gray-100"
                  aria-label="Share job"
                >
                  <FaShareAlt className="text-gray-500 text-sm sm:text-base" />
                </button>
                <button
                  type="button"
                  onClick={handleApplyClick}
                  className="hidden sm:inline-flex items-center gap-2 bg-[#16730F] text-white px-4 sm:px-6 py-2 rounded-xl font-semibold hover:bg-[#145A0C] transition text-sm sm:text-base"
                >
                  {applyLabel}
                  {hasExternalApplication && <FaExternalLinkAlt size={12} />}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain pb-20 sm:pb-0">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                    {companyLogoSrc ? (
                      <img
                        src={companyLogoSrc}
                        alt={job.company}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#16730F] to-[#1A3E32] text-white font-bold text-lg sm:text-2xl">
                        {job.company.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-2">
                      <h1 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">
                        {job.title}
                      </h1>
                      {userHasVerifiedBadge(job) ? (
                        <VerifiedBadge size="xs" role="recruiter" />
                      ) : userShowsUnverifiedRecruiterPill(
                          { ...job, role: job.posterRole || job.role },
                          { forceRecruiter: job.posterRole !== "jobseeker" },
                        ) ? (
                        <VerifiedBadge size="xs" role="recruiter" unverified />
                      ) : null}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1.5 sm:gap-x-4 sm:gap-y-2 text-xs sm:text-sm text-gray-600">
                      <span className="flex items-center gap-1 min-w-0">
                        <PosterIcon className="shrink-0 text-[#16730F]" />
                        <span className="truncate">{job.company}</span>
                      </span>
                      <span className="flex items-center gap-1 min-w-0">
                        <MdLocationOn className="shrink-0 text-[#16730F]" />
                        <span className="truncate">{job.location}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MdWork className="shrink-0 text-[#16730F]" />
                        {job.workMode}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaBriefcase className="shrink-0 text-[#16730F]" />
                        {job.jobType}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaGraduationCap className="shrink-0 text-[#16730F]" />
                        {job.experienceLevel} Level
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div className="bg-gray-100 rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
                    <span className="text-gray-600">💰 {salary}</span>
                  </div>
                  <div className="bg-gray-100 rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
                    <span className="text-gray-600">
                      👥 {job.applicantsCount} applicants
                    </span>
                  </div>
                  <div
                    className={`rounded-full px-3 py-1.5 sm:px-4 sm:py-2 ${timeRemaining.isUrgent ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}
                  >
                    <span>⏰ {timeRemaining.text}</span>
                  </div>
                  <div className="bg-gray-100 rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
                    <span>
                      📅 Posted {new Date(job.postedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 px-3 sm:px-6">
                <div className="flex w-full">
                  <button
                    type="button"
                    onClick={() => setActiveTab("details")}
                    className={`flex-1 py-3 text-sm sm:text-base font-medium transition-colors text-center ${
                      activeTab === "details"
                        ? "text-[#16730F] border-b-2 border-[#16730F]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Job Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("company")}
                    className={`flex-1 py-3 text-sm sm:text-base font-medium transition-colors text-center ${
                      activeTab === "company"
                        ? "text-[#16730F] border-b-2 border-[#16730F]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Company Info
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {activeTab === "details" ? (
                  <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                    <div className="lg:col-span-2 space-y-5 sm:space-y-6 order-2 lg:order-1">
                      {job.about?.trim() ? (
                        <section>
                          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">
                            About
                          </h2>
                          <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line break-words">
                            {job.about}
                          </p>
                        </section>
                      ) : null}

                      {job.responsibilities?.length > 0 ? (
                        <section>
                          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">
                            Responsibilities
                          </h2>
                          <ul className={JOB_DETAIL_LIST_CLASS}>
                            {job.responsibilities.map((resp, idx) => (
                              <li key={idx}>{resp}</li>
                            ))}
                          </ul>
                        </section>
                      ) : job.responsibilitiesText?.trim() ||
                        (job.description?.trim() &&
                          !job.qualificationsText?.trim() &&
                          !job.rolesText?.trim()) ? (
                        <section>
                          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">
                            Responsibilities
                          </h2>
                          <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                            {formatJobDescriptionText(
                              job.responsibilitiesText || job.description,
                            )}
                          </p>
                        </section>
                      ) : null}

                      {(job.qualificationsText?.trim() ||
                        job.rolesText?.trim() ||
                        job.qualifications?.length > 0) && (
                        <section>
                          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">
                            Qualifications
                          </h2>
                          {job.qualifications?.length > 0 ||
                          job.roles?.length > 0 ? (
                            <ul className={JOB_DETAIL_LIST_CLASS}>
                              {(job.qualifications?.length
                                ? job.qualifications
                                : job.roles
                              ).map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                              {formatJobDescriptionText(
                                job.qualificationsText || job.rolesText,
                              )}
                            </p>
                          )}
                        </section>
                      )}

                      {requirements.length > 0 && (
                          <section>
                            <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">
                              Requirements
                            </h2>
                            <ul className={JOB_DETAIL_LIST_CLASS}>
                              {requirements.map((req, idx) => (
                                <li key={idx}>{req}</li>
                              ))}
                            </ul>
                          </section>
                        )}

                      {job.skillRequirements?.length > 0 && (
                        <section>
                          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">
                            Skills
                          </h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                            {job.skillRequirements.map((req, idx) => (
                              <div
                                key={idx}
                                className="bg-gray-50 rounded-xl p-3"
                              >
                                <div className="flex justify-between items-center gap-2">
                                  <span className="font-medium text-sm sm:text-base truncate">
                                    {req.skill}
                                  </span>
                                  {req.isRequired && (
                                    <span className="text-[10px] sm:text-xs text-red-500 shrink-0">
                                      Required
                                    </span>
                                  )}
                                </div>
                                {req.experience > 0 && (
                                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                                    {req.experience}+ years experience
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {job.benefits?.length > 0 && (
                        <section>
                          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">
                            Benefits & Perks
                          </h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                            {job.benefits.map((benefit, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-3 p-3 bg-green-50 rounded-xl"
                              >
                                <span className="text-xl sm:text-2xl shrink-0">
                                  {benefit.icon}
                                </span>
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                                    {benefit.title}
                                  </p>
                                  <p className="text-xs sm:text-sm text-gray-600">
                                    {benefit.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                    </div>

                    <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
                      {jobSummaryCard}
                      <div className="hidden lg:block">{applyCtaCard}</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5 sm:space-y-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                        {companyLogoSrc ? (
                          <img
                            src={companyLogoSrc}
                            alt={job.company}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#16730F] to-[#1A3E32] text-white font-bold text-xl sm:text-2xl">
                            {job.company.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-lg sm:text-2xl font-bold break-words">
                          {job.company}
                        </h2>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {job.industry}
                          {job.companySize && job.companySize !== "—"
                            ? ` · ${job.companySize}`
                            : ""}
                        </p>
                        {job.companyWebsite && (
                          <a
                            href={job.companyWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#16730F] text-xs sm:text-sm flex items-start gap-1 mt-1 break-all"
                          >
                            <span className="break-all">{job.companyWebsite}</span>
                            <FaExternalLinkAlt
                              size={12}
                              className="shrink-0 mt-0.5"
                            />
                          </a>
                        )}
                      </div>
                    </div>

                    {job.companyAbout && (
                      <section className="bg-gray-50 rounded-2xl p-4 sm:p-5">
                        <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
                          About Company
                        </h3>
                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                          {job.companyAbout}
                        </p>
                      </section>
                    )}

                    {(job.recruiter?.name || job.recruiter?.role) && (
                      <section className="bg-[#16730F]/5 rounded-2xl p-4 sm:p-5 border border-[#16730F]/15">
                        <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-[#16730F]">
                          Posted By
                        </h3>
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-100 overflow-hidden shrink-0 border-2 border-white shadow-sm">
                            {recruiterPhotoSrc ? (
                              <img
                                src={recruiterPhotoSrc}
                                alt={job.recruiter?.name || "Recruiter"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#16730F] to-[#1A3E32] text-white font-bold text-lg">
                                {(job.recruiter?.name || "R").charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1 space-y-2">
                            {job.recruiter?.name && (
                              <p className="font-semibold text-gray-900 text-sm sm:text-base">
                                {job.recruiter.name}
                              </p>
                            )}
                            {job.recruiter?.role && (
                              <p className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 bg-white rounded-full px-3 py-1 border border-gray-200">
                                <FaUserTie className="text-[#16730F] shrink-0" />
                                {job.recruiter.role}
                              </p>
                            )}
                            
                            
                          </div>
                        </div>
                      </section>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="bg-gray-50 rounded-2xl p-4 sm:p-5">
                        <h3 className="font-semibold mb-3 text-sm sm:text-base">
                          Company Address
                        </h3>                        
                        
                        {companyRegion && (
                          <div className="flex items-start gap-3 text-sm sm:text-base">
                            <MdLocationOn className="text-gray-400 shrink-0 mt-0.5" />
                            <span>{companyRegion}</span>
                          </div>
                        )}
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-4 sm:p-5">
                        <h3 className="font-semibold mb-3 text-sm sm:text-base">
                          Social Media Links
                        </h3>                        
                        {socialLinks.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {socialLinks.map(({ key, href, icon: Icon, label }) => (
                              <a
                                key={key}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#16730F] bg-white border border-[#16730F]/20 rounded-full px-3 py-1.5 hover:bg-[#16730F]/5 transition"
                              >
                                <Icon className="shrink-0" />
                                {label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="sm:hidden shrink-0 border-t border-gray-200 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={handleApplyClick}
                className="w-full bg-[#16730F] text-white py-3 rounded-xl font-semibold hover:bg-[#145A0C] transition text-sm inline-flex items-center justify-center gap-2"
              >
                {applyLabel}
                {hasExternalApplication && <FaExternalLinkAlt size={12} />}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <ApplicationForm
              job={job}
              onBack={() => setIsApplying(false)}
              onSubmit={() => {
                onApply?.();
                setIsApplying(false);
                onClose();
              }}
            />
          </div>
        )}
      </div>

      {createPortal(
        <SharePostModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          onShare={handleShareOption}
          getPlatformHref={(platform) => getJobPlatformHref(job, platform)}
          title="Share job"
        />,
        document.body,
      )}
    </div>
  );
};
