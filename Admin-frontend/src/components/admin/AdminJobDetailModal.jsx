import { useEffect, useState } from "react";
import {
  X,
  Briefcase,
  Building2,
  MapPin,
  UserRound,
  ExternalLink,
  Calendar,
  Clock,
  Banknote,
  Layers,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatSalary = (job) => {
  if (job?.salary_min != null || job?.salary_max != null) {
    const currency = job.currency || "";
    const min = job.salary_min != null ? Number(job.salary_min).toLocaleString() : null;
    const max = job.salary_max != null ? Number(job.salary_max).toLocaleString() : null;
    if (min && max) return `${currency} ${min} – ${max}`.trim();
    if (min) return `${currency} ${min}+`.trim();
    if (max) return `Up to ${currency} ${max}`.trim();
  }
  if (job?.expected_salary) {
    return [job.currency, job.expected_salary].filter(Boolean).join(" ");
  }
  return "Not specified";
};

const toList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const DetailRow = ({ label, value }) => {
  if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm text-gray-900 font-medium sm:text-right break-words whitespace-pre-wrap">
        {Array.isArray(value) ? value.join(", ") : value}
      </span>
    </div>
  );
};

const Section = ({ title, children }) => (
  <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
    <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">
      {title}
    </h3>
    {children}
  </section>
);

const AdminJobDetailModal = ({ jobId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [job, setJob] = useState(null);

  useEffect(() => {
    if (!jobId) return undefined;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axiosInstance.get(`/api/admin/data/jobs/${jobId}`);
        if (!cancelled) {
          setJob(data.job || null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.error || "Failed to load job details.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  const isJobseeker =
    String(job?.poster_role || "").toLowerCase() === "jobseeker";
  const posterName = [job?.poster_first_name, job?.poster_last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  const skills = toList(job?.skills);
  const requirements = toList(job?.requirements);
  const tags = toList(job?.tags);
  const location =
    job?.location ||
    [job?.preferred_state, job?.preferred_country].filter(Boolean).join(", ") ||
    "—";

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Job details"
    >
      <div
        className="bg-gray-50 w-full max-w-3xl h-full shadow-2xl flex flex-col"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
              {isJobseeker ? "Jobseeker Post" : "Job Listing"}
            </h2>
            <p className="text-sm text-gray-500 truncate">
              {job?.title || (loading ? "Loading…" : "Job details")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 shrink-0"
            aria-label="Close job details"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin inline-block rounded-full h-10 w-10 border-b-2 border-[#16730F]" />
              <p className="text-gray-500 mt-3">Loading job details…</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-600">{error}</div>
          ) : !job ? (
            <div className="py-12 text-center text-gray-500">Job not found.</div>
          ) : (
            <>
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                      isJobseeker
                        ? "bg-blue-50 text-blue-600"
                        : "bg-green-50 text-green-600"
                    }`}
                  >
                    {isJobseeker ? (
                      <UserRound size={24} />
                    ) : (
                      <Briefcase size={24} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-gray-900 break-words">
                        {job.title}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          job.listing_status === "active"
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {job.listing_status === "active" ? "Active" : "Expired"}
                      </span>
                      {job.status && job.status !== "Active" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {job.status}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1.5">
                        {isJobseeker ? (
                          <UserRound size={14} className="text-gray-400" />
                        ) : (
                          <Building2 size={14} className="text-gray-400" />
                        )}
                        {isJobseeker
                          ? posterName || job.poster_email || "Unknown poster"
                          : job.company || "Unknown Company"}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={14} className="text-gray-400" />
                        {location}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Banknote size={14} className="text-gray-400" />
                        {formatSalary(job)}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <Section title="Overview">
                <DetailRow label="Work type" value={job.work_type || job.type} />
                <DetailRow label="Work mode" value={job.remote_preference} />
                <DetailRow label="Industry" value={job.industry_sector} />
                <DetailRow label="Experience" value={job.experience_level} />
                <DetailRow label="Availability" value={job.availability} />
                <DetailRow
                  label="Applications"
                  value={String(job.applications_count ?? 0)}
                />
                {job.application_url ? (
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 py-2.5 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-500 shrink-0">
                      Application URL
                    </span>
                    <a
                      href={job.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#16730F] font-medium sm:text-right break-all inline-flex items-center gap-1.5 hover:underline"
                    >
                      Open link
                      <ExternalLink size={14} />
                    </a>
                  </div>
                ) : null}
              </Section>

              {(job.roles || job.description) && (
                <Section title={isJobseeker ? "Details" : "Description"}>
                  {job.roles ? (
                    <div className="mb-4 last:mb-0">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Roles
                      </p>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                        {job.roles}
                      </p>
                    </div>
                  ) : null}
                  {job.description ? (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        {job.roles ? "Responsibilities" : "Full description"}
                      </p>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
                        {job.description}
                      </p>
                    </div>
                  ) : null}
                </Section>
              )}

              {(skills.length > 0 ||
                requirements.length > 0 ||
                tags.length > 0) && (
                <Section title="Skills & requirements">
                  {skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 bg-[#16730F]/10 text-[#16730F] px-2.5 py-1 rounded-lg text-xs font-medium"
                          >
                            <Layers size={12} />
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <DetailRow label="Requirements" value={requirements} />
                  <DetailRow label="Tags" value={tags} />
                </Section>
              )}

              <Section title="Posted by">
                <DetailRow
                  label="Name"
                  value={posterName || "—"}
                />
                <DetailRow label="Email" value={job.poster_email} />
                <DetailRow
                  label="Role"
                  value={
                    job.poster_role
                      ? job.poster_role.charAt(0).toUpperCase() +
                        job.poster_role.slice(1)
                      : null
                  }
                />
                <DetailRow
                  label="Company"
                  value={job.poster_company_name || job.company}
                />
                <DetailRow label="Poster ID" value={job.posted_by} />
              </Section>

              <Section title="Timeline">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2.5 text-sm">
                    <Calendar size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-500">Created</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(job.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-sm">
                    <Clock size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-500">Updated</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(job.updated_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-sm">
                    <Clock size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-500">Expires</p>
                      <p className="font-medium text-gray-900">
                        {isJobseeker
                          ? "Does not expire"
                          : formatDate(
                              job.effective_expires_at || job.expires_at,
                            )}
                      </p>
                    </div>
                  </div>
                </div>
              </Section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminJobDetailModal;
