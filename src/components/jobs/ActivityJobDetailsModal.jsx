import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Briefcase,
  MapPin,
  Building2,
  User,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { profileAvatarSrc } from "../../utils/profilePhotoUrl";
import { FaMoneyBillWave } from "react-icons/fa";
import { formatDisplayText } from "../../utils/displayFormatUtils";
import { formatSalaryExpectation } from "../../utils/formatSalary";

const DetailRow = ({ label, value }) => {
  if (value === null || value === undefined || value === "") return null;

  return (
    <div className="flex justify-between gap-4 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 text-sm shrink-0">{label}</span>
      <span className="text-gray-900 text-sm font-medium text-right break-words">
        {value}
      </span>
    </div>
  );
};

const formatPostedDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const parseSkills = (skills = []) => {
  if (!Array.isArray(skills)) return [];
  return skills
    .map((entry) => {
      if (typeof entry === "string") return entry.trim();
      if (entry && typeof entry === "object") {
        return entry.skill || entry.name || "";
      }
      return "";
    })
    .filter(Boolean);
};

const parseDescriptionLines = (description) => {
  if (!description?.trim()) return [];
  return description
    .split(/\n+/)
    .map((line) => line.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
};

const ActivityJobDetailsModal = ({
  job,
  isRecruiterViewer,
  loading = false,
  onClose,
}) => {
  const modalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  if (!job) return null;

  const isJobSeekerRole = isRecruiterViewer;
  const modalTitle = isJobSeekerRole ? "Job Application" : "Job Posting";
  const badgeClass = isJobSeekerRole
    ? "bg-amber-50 text-amber-700 border-amber-100"
    : "bg-green-50 text-[#16730F] border-green-100";

  const location = formatDisplayText(
    [job.preferred_state, job.preferred_country].filter(Boolean).join(", "),
  );

  const skills = parseSkills(job.skills);
  const descriptionLines = isJobSeekerRole
    ? parseDescriptionLines(job.bio || job.description)
    : parseDescriptionLines(job.description);
  const salary =
    job.expected_salary && job.expected_salary !== "Any"
      ? formatSalaryExpectation(job.expected_salary, job.currency)
      : null;

  const poster = job.poster;
  const posterName =
    poster?.name ||
    [poster?.firstName, poster?.lastName].filter(Boolean).join(" ").trim() ||
    "Job seeker";
  const posterPhoto = profileAvatarSrc(
    poster?.profilePhoto || "/assets/images/photo_placeholder.png",
  );

  const handleViewPosterProfile = () => {
    if (!poster?.userId) return;
    onClose();
    navigate(`/user-profile/${poster.userId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close job details"
        onClick={onClose}
      />

      <div
        ref={modalRef}
        className="relative bg-white w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-job-modal-title"
      >
        <div className="flex items-start justify-between gap-4 px-5 sm:px-6 py-5 border-b border-gray-100 bg-[#1A3E32] text-white shrink-0">
          <div className="min-w-0">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border mb-2 ${badgeClass}`}
            >
              {modalTitle}
            </span>
            <h2
              id="activity-job-modal-title"
              className="text-xl sm:text-2xl font-bold leading-tight break-words"
            >
              {job.title || "Untitled"}
            </h2>
            {job.industry_sector && (
              <p className="text-green-100 text-sm mt-1">{job.industry_sector}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">
          {loading ? (
            <div className="py-16 text-center text-gray-500 text-sm">
              Loading details...
            </div>
          ) : (
            <div className="space-y-6">
              {isJobSeekerRole && poster?.userId && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Posted by
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={posterPhoto}
                        alt={posterName}
                        className="w-14 h-14 rounded-full object-cover border-2 border-[#16730F]/20 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {posterName}
                        </p>
                        {poster.jobTitle && (
                          <p className="text-sm text-gray-600 truncate">
                            {poster.jobTitle}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                          {poster.location && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3 h-3 shrink-0" />
                              {formatDisplayText(poster.location)}
                            </span>
                          )}
                          {poster.experienceYears > 0 && (
                            <span>{poster.experienceYears}y experience</span>
                          )}
                          {poster.industry && <span>{poster.industry}</span>}
                        </div>
                        {poster.summary && (
                          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                            {poster.summary}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleViewPosterProfile}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#16730F] text-white text-sm font-semibold hover:bg-[#145A0C] transition-colors shrink-0 w-full sm:w-auto"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View profile
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {job.work_type && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <Briefcase className="w-4 h-4 text-[#16730F] mb-1.5" />
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
                      Type
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                      {job.work_type}
                    </p>
                  </div>
                )}
                {job.remote_preference && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <Building2 className="w-4 h-4 text-[#16730F] mb-1.5" />
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
                      Work mode
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                      {job.remote_preference}
                    </p>
                  </div>
                )}
                {location && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <MapPin className="w-4 h-4 text-[#16730F] mb-1.5" />
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
                      Location
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5 line-clamp-2">
                      {location}
                    </p>
                  </div>
                )}
                {salary && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <FaMoneyBillWave className="w-4 h-4 text-[#16730F] mb-1.5" />
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
                      {isJobSeekerRole ? "Expected salary" : "Salary"}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                      {salary}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Details</h3>
                <DetailRow label="Industry" value={job.industry_sector} />
                <DetailRow
                  label="Country"
                  value={formatDisplayText(job.preferred_country)}
                />
                <DetailRow
                  label="State / City"
                  value={formatDisplayText(job.preferred_state)}
                />
                <DetailRow label="Work type" value={job.work_type} />
                <DetailRow label="Work mode" value={job.remote_preference} />
                <DetailRow
                  label={isJobSeekerRole ? "Expected salary" : "Salary"}
                  value={salary}
                />
                <DetailRow label="Availability" value={job.availability} />
                {isJobSeekerRole && (
                  <DetailRow label="Rate" value={job.rate} />
                )}
                {!isJobSeekerRole && (
                  <>
                    <DetailRow label="Experience level" value={job.experience_level} />
                    <DetailRow label="Status" value={job.status} />
                    <DetailRow label="Company" value={job.company} />
                    <DetailRow
                      label="Expires"
                      value={formatPostedDate(job.expires_at)}
                    />
                  </>
                )}
                <DetailRow
                  label={isJobSeekerRole ? "Preference set" : "Posted"}
                  value={formatPostedDate(job.created_at)}
                />
                <DetailRow
                  label="Last updated"
                  value={formatPostedDate(job.updated_at)}
                />
              </div>

              {!isJobSeekerRole && job.about?.trim() && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">About</h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                    {job.about}
                  </p>
                </div>
              )}

              {descriptionLines.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {isJobSeekerRole
                      ? "About this role preference"
                      : "Description & responsibilities"}
                  </h3>
                  <ul className="space-y-2">
                    {descriptionLines.map((line) => (
                      <li
                        key={line}
                        className="flex gap-2 text-sm text-gray-700 leading-relaxed"
                      >
                        <span className="text-[#16730F] mt-1.5 shrink-0">•</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {isJobSeekerRole && job.bio?.trim() && descriptionLines.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">About</h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {job.bio}
                  </p>
                </div>
              )}

              {job.description?.trim() && descriptionLines.length === 0 && !isJobSeekerRole && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {isJobSeekerRole
                      ? "About this role preference"
                      : "Description"}
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {job.description}
                  </p>
                </div>
              )}

              {skills.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {isJobSeekerRole ? "Skills" : "Required skills"}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 bg-[#16730F]/10 text-[#16730F] text-xs font-medium rounded-lg border border-[#16730F]/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(job.requirements?.length > 0 || job.tags?.length > 0) && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {(job.tags || job.requirements || []).map((tag) => (
                      <span
                        key={String(tag)}
                        className="px-3 py-1.5 bg-gray-50 text-gray-700 text-xs font-medium rounded-lg border border-gray-100"
                      >
                        {String(tag)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {isJobSeekerRole && (
                <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-100 p-4">
                  <User className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-900">
                    This is a job seeker&apos;s preferred role and work
                    preferences, not an open vacancy from a recruiter.
                  </p>
                </div>
              )}

              {!isJobSeekerRole && job.expires_at && (
                <div className="flex items-start gap-3 rounded-2xl bg-blue-50 border border-blue-100 p-4">
                  <Calendar className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-900">
                    Application window closes{" "}
                    <span className="font-semibold">
                      {formatPostedDate(job.expires_at)}
                    </span>
                    . Visit the job board to apply if this posting is still
                    active.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#16730F] text-white text-sm font-semibold hover:bg-[#145A0C] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityJobDetailsModal;
