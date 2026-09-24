import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NewsFeedLayout from "../../components/layout/NewsFeedLayout";
import {
  FaChevronLeft,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowRight,
  FaCopy,
  FaEdit,
  FaSpinner,
  FaTimes,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import {
  JOB_ABOUT_MAX_LENGTH,
  getJobAboutValidationError,
} from "../../utils/jobAbout";
import {
  getEmployerJob,
  updateEmployerJob,
  extendJobForSubscriber,
  initJobExtensionPayment,
  getJobExtendInfo,
} from "../../services/employerApi";
import useCountryStateOptions from "../../hooks/useCountryStateOptions";
import { AutocompleteInput } from "../../components/forms/AutocompleteInput";
import {
  CURRENCY_OPTIONS,
  INDUSTRY_OPTIONS,
  currencyCodeFromLabel,
  currencyLabelFromCode,
} from "../../data/jobTypeData";

const INDUSTRY_SUGGESTIONS = INDUSTRY_OPTIONS;

const normalizeWorkMode = (mode) => {
  const map = {
    Remote: "Remote",
    Onsite: "Onsite",
    "On-site": "Onsite",
    Hybrid: "Hybrid",
  };
  return map[mode] || "Remote";
};

const normalizeApplicationUrl = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const parsed = new URL(withProtocol);
    if (!["http:", "https:"].includes(parsed.protocol)) return "";
    return parsed.toString();
  } catch {
    return "";
  }
};

const requirementsToText = (requirements) => {
  if (Array.isArray(requirements)) return requirements.join("\n");
  if (typeof requirements === "string") return requirements;
  return "";
};

const emptyForm = {
  title: "",
  industry: "",
  about: "",
  qualifications: "",
  responsibilities: "",
  requirements: "",
  workMode: "Remote",
  country: "",
  state: "",
  salaryMin: "",
  salaryMax: "",
  currency: "",
  applicationMethod: "bejite",
  applicationUrl: "",
};

const salaryToFormValue = (value) =>
  value != null && value !== "" ? String(value) : "";

const getPaystackCheckoutUrl = (payment) =>
  payment?.data?.authorization_url ||
  payment?.data?.authorizationUrl ||
  payment?.authorization_url ||
  null;

const RepostJob = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reposting, setReposting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [pricing, setPricing] = useState({ USD: 10, NGN: 10000 });
  const [formData, setFormData] = useState(emptyForm);
  const { countries, states } = useCountryStateOptions(formData.country);

  const mapJobToForm = (data) => {
    const min =
      data.salaryMin != null
        ? data.salaryMin
        : data.salary != null && data.salary !== ""
          ? data.salary
          : null;
    const max =
      data.salaryMax != null
        ? data.salaryMax
        : data.salary != null && data.salary !== ""
          ? data.salary
          : null;
    return {
      title: data.title || "",
      industry: data.industry || "",
      about: data.about || "",
      qualifications: data.qualifications || data.roles || "",
      responsibilities: data.responsibilities || data.description || "",
      requirements: requirementsToText(data.requirements),
      workMode: normalizeWorkMode(data.workMode),
      country: data.country || "",
      state: data.state || "",
      salaryMin: salaryToFormValue(min),
      salaryMax: salaryToFormValue(max),
      currency: data.currency
        ? currencyLabelFromCode(data.currency) || data.currency
        : "",
      applicationMethod: data.applicationUrl ? "external" : "bejite",
      applicationUrl: data.applicationUrl || "",
    };
  };

  const loadJobDetails = useCallback(async () => {
    if (!jobId) {
      setJob(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [jobRes, extendRes] = await Promise.all([
        getEmployerJob(jobId),
        getJobExtendInfo(jobId).catch(() => null),
      ]);

      if (!jobRes?.success || !jobRes?.data) {
        throw new Error(jobRes?.message || "Job not found");
      }

      const data = jobRes.data;
      setJob(data);
      setFormData(mapJobToForm(data));

      if (extendRes?.success && extendRes?.data) {
        setHasSubscription(Boolean(extendRes.data.hasActiveSubscription));
        if (extendRes.data.pricing) setPricing(extendRes.data.pricing);
      }
    } catch (error) {
      console.error("Failed to load job for repost:", error);
      setJob(null);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to load job details"
      );
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    loadJobDetails();
  }, [loadJobDetails]);

  const saveJobDetails = useCallback(
    async (payload) => {
      const response = await updateEmployerJob(jobId, payload);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to update job details");
      }
      return response;
    },
    [jobId],
  );

  const tryExtendOrPay = useCallback(async () => {
    try {
      const extended = await extendJobForSubscriber(jobId);
      if (extended?.success) return { mode: "extended", data: extended };
    } catch (error) {
      const requiresPayment =
        error.response?.status === 402 ||
        error.response?.data?.requiresPayment === true;
      if (!requiresPayment) throw error;
    }

    const payment = await initJobExtensionPayment(jobId, "NGN");
    const checkoutUrl = getPaystackCheckoutUrl(payment);
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
      return { mode: "payment" };
    }
    throw new Error(payment?.message || "Unable to start payment for repost");
  }, [jobId]);

  const handleRepost = useCallback(async () => {
    if (!jobId || reposting) return;
    setReposting(true);
    try {
      const result = await tryExtendOrPay();
      if (result.mode === "payment") return;
      toast.success(
        "Job reposted successfully! Your vacancy is now live for 72 hours."
      );
      navigate("/employer/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to repost job"
      );
    } finally {
      setReposting(false);
    }
  }, [jobId, navigate, reposting, tryExtendOrPay]);

  const validateEditForm = useCallback(() => {
    if (!formData.title.trim()) return "Job title is required";
    if (!formData.industry.trim()) return "Industry is required";
    if (!formData.country.trim()) return "Country is required";
    if (!formData.qualifications.trim()) return "Qualifications are required";
    if (!formData.responsibilities.trim()) {
      return "Responsibilities are required";
    }
    const aboutError = getJobAboutValidationError(formData.about);
    if (aboutError) return aboutError;
    const salaryMin = formData.salaryMin ? Number(formData.salaryMin) : null;
    const salaryMax = formData.salaryMax ? Number(formData.salaryMax) : null;
    if (salaryMin != null && salaryMin < 0) {
      return "Minimum salary must be zero or greater";
    }
    if (salaryMax != null && salaryMax < 0) {
      return "Maximum salary must be zero or greater";
    }
    if (salaryMin != null && salaryMax != null && salaryMin > salaryMax) {
      return "Minimum salary cannot be greater than maximum salary";
    }
    if ((salaryMin != null || salaryMax != null) && !formData.currency.trim()) {
      return "Currency is required when specifying a salary";
    }
    if (formData.applicationMethod === "external") {
      if (!formData.applicationUrl.trim()) {
        return "External application link is required";
      }
      if (!normalizeApplicationUrl(formData.applicationUrl)) {
        return "Enter a valid application website link";
      }
    }
    return null;
  }, [formData]);

  const buildEditPayload = useCallback(() => {
    const parsedMin = formData.salaryMin ? Number(formData.salaryMin) : null;
    const parsedMax = formData.salaryMax ? Number(formData.salaryMax) : null;
    return {
      title: formData.title.trim(),
      industry: formData.industry.trim(),
      about: formData.about?.trim() || "",
      qualifications: formData.qualifications.trim(),
      responsibilities: formData.responsibilities.trim(),
      requirements: formData.requirements.trim(),
      workMode: formData.workMode,
      country: formData.country.trim(),
      state: formData.state.trim(),
      salaryMin: parsedMin ?? parsedMax,
      salaryMax: parsedMax ?? parsedMin,
      currency: formData.currency.trim()
        ? currencyCodeFromLabel(formData.currency.trim()) ||
          formData.currency.trim()
        : "",
      applicationMethod: formData.applicationMethod,
      applicationUrl:
        formData.applicationMethod === "external"
          ? normalizeApplicationUrl(formData.applicationUrl)
          : "",
    };
  }, [formData]);

  const handleRepostWithEdit = useCallback(async () => {
    if (!jobId || reposting) return;

    const validationError = validateEditForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setReposting(true);
    try {
      await saveJobDetails(buildEditPayload());

      const result = await tryExtendOrPay();
      if (result.mode === "payment") {
        toast.success("Job details saved. Redirecting to payment...");
        return;
      }

      setEditMode(false);
      toast.success(
        "Job updated and reposted successfully! Your vacancy is now live for 72 hours."
      );
      navigate("/employer/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update and repost job"
      );
    } finally {
      setReposting(false);
    }
  }, [
    jobId,
    reposting,
    validateEditForm,
    saveJobDetails,
    buildEditPayload,
    tryExtendOrPay,
    navigate,
  ]);

  const handleFieldChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCountryChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      country: value,
      state: value !== prev.country ? "" : prev.state,
    }));
  };

  if (loading) {
    return (
      <NewsFeedLayout showSidebars={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <FaSpinner className="animate-spin text-5xl text-[#16730F] mx-auto mb-4" />
            <p className="text-gray-500">Loading job details...</p>
          </div>
        </div>
      </NewsFeedLayout>
    );
  }

  if (!job) {
    return (
      <NewsFeedLayout showSidebars={false}>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExclamationTriangle className="text-3xl text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Job Not Found
            </h2>
            <p className="text-gray-500 mb-6">
              The job posting you're trying to repost doesn't exist or has been
              removed.
            </p>
            <button
              onClick={() => navigate("/employer/dashboard")}
              className="px-6 py-3 bg-[#16730F] text-white rounded-xl font-semibold hover:bg-[#145A0C] transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </NewsFeedLayout>
    );
  }

  const feeLabel = hasSubscription ? (
    <span className="flex flex-col items-end text-right leading-tight">
      <span>Not Required</span>
      <span className="text-xs sm:text-sm font-medium italic text-gray-500 mt-0.5">
        Included in current plan
      </span>
    </span>
  ) : (
    `$${pricing.USD} / ₦${Number(pricing.NGN).toLocaleString()}`
  );

  return (
    <NewsFeedLayout showSidebars={false}>
      <Toaster position="top-center" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate("/employer/dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-[#16730F] mb-4 transition-all group text-sm sm:text-base"
          >
            <FaChevronLeft className="group-hover:-translate-x-1 transition-transform text-xs sm:text-sm" />
            Back to Dashboard
          </button>

          <div className="bg-gradient-to-r from-[#16730F] to-[#1A3E32] rounded-xl sm:rounded-2xl p-5 sm:p-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <FaCopy className="text-2xl sm:text-3xl" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                  Repost Job Vacancy
                </h1>
                <p className="text-green-100 text-xs sm:text-sm lg:text-base mt-1">
                  Give your expired job posting a second life and reach more
                  candidates
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-5 sm:p-6 mb-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-[#16730F]" />
            Original Job Details
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Job Title</p>
              <p className="font-semibold text-gray-900 text-sm sm:text-base">
                {job.title}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Industry</p>
              <p className="font-semibold text-gray-900 text-sm sm:text-base">
                {job.industry || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Work Mode</p>
              <p className="font-semibold text-gray-900 text-sm sm:text-base">
                {job.workMode || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Country</p>
              <p className="font-semibold text-gray-900 text-sm sm:text-base">
                {job.country || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">
                Previous Applications
              </p>
              <p className="font-semibold text-[#16730F] text-sm sm:text-base">
                {job.previousApplications} candidates
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">
                Previous Expiry Date
              </p>
              <p className="font-semibold text-gray-900 text-sm sm:text-base">
                {job.previousExpiry
                  ? new Date(job.previousExpiry).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
          <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-5 sm:p-6 hover:border-[#16730F] transition-all hover:shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FaCopy className="text-lg sm:text-xl text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                Quick Repost
              </h3>
            </div>

            <p className="text-gray-600 text-xs sm:text-sm mb-4 leading-relaxed">
              Repost the job exactly as it was
              {hasSubscription
                ? " — included with your ASE subscription."
                : " — pay and publish instantly."}
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-5 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <span className="text-gray-600 text-sm">Repost Fee</span>
                <span className="text-xl sm:text-2xl font-bold text-[#16730F]">
                  {feeLabel}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-gray-500">
                <FaClock className="text-xs" />
                <span>72 hours visibility</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRepost}
              disabled={reposting}
              className="w-full bg-[#16730F] text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-[#145A0C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {reposting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Quick Repost
                  <FaArrowRight className="text-xs sm:text-sm" />
                </>
              )}
            </button>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-5 sm:p-6 hover:border-[#16730F] transition-all hover:shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaEdit className="text-lg sm:text-xl text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                Edit & Repost
              </h3>
            </div>

            <p className="text-gray-600 text-xs sm:text-sm mb-4 leading-relaxed">
              Make changes to the job posting before republishing. Update
              requirements or description.
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-5 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <span className="text-gray-600 text-sm">Repost Fee</span>
                <span className="text-xl sm:text-2xl font-bold text-[#16730F]">
                  {feeLabel}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-gray-500">
                <FaClock className="text-xs" />
                <span>72 hours visibility</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="w-full border-2 border-[#16730F] text-[#16730F] py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-green-50 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              Edit & Repost
              <FaEdit />
            </button>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-blue-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm sm:text-base">
            <FaCheckCircle className="text-[#16730F]" />
            Previous Performance Insights
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-2">
              <p className="text-xl sm:text-2xl font-bold text-[#16730F]">
                {job.previousApplications}
              </p>
              <p className="text-xs text-gray-600">Total Applications</p>
            </div>
            <div className="text-center p-2">
              <p className="text-xl sm:text-2xl font-bold text-blue-600">
                {Math.round(job.previousApplications * 0.4)}
              </p>
              <p className="text-xs text-gray-600">Qualified Candidates</p>
            </div>
            <div className="text-center p-2">
              <p className="text-xl sm:text-2xl font-bold text-purple-600">
                {job.extensions}
              </p>
              <p className="text-xs text-gray-600">Prior Extensions</p>
            </div>
            <div className="text-center p-2">
              <p className="text-xl sm:text-2xl font-bold text-orange-600">
                72h
              </p>
              <p className="text-xs text-gray-600">Visibility Period</p>
            </div>
          </div>
        </div>

        {editMode && (
          <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget && !reposting) setEditMode(false);
            }}
          >
            <div className="bg-white rounded-xl sm:rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 sm:p-5 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Edit Job Details
                </h2>
                <button
                  type="button"
                  onClick={() => !reposting && setEditMode(false)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                  aria-label="Close modal"
                >
                  <FaTimes className="text-gray-600 text-sm" />
                </button>
              </div>

              <div className="p-5 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#16730F] outline-none"
                    value={formData.title}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry *
                  </label>
                  <AutocompleteInput
                    value={formData.industry}
                    onChange={(e) =>
                      handleFieldChange("industry", e.target.value)
                    }
                    placeholder="Enter or select industry"
                    formName="employer-job"
                    fieldName="industry_sector"
                    staticOptions={INDUSTRY_SUGGESTIONS}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    About
                  </label>
                  <textarea
                    rows={4}
                    maxLength={JOB_ABOUT_MAX_LENGTH}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#16730F] outline-none resize-none"
                    value={formData.about}
                    onChange={(e) => handleFieldChange("about", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsibilities *
                  </label>
                  <textarea
                    rows={5}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#16730F] outline-none resize-none"
                    value={formData.responsibilities}
                    onChange={(e) =>
                      handleFieldChange("responsibilities", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qualifications *
                  </label>
                  <textarea
                    rows={4}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#16730F] outline-none resize-none"
                    value={formData.qualifications}
                    onChange={(e) =>
                      handleFieldChange("qualifications", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requirements{" "}
                    <span className="font-normal text-gray-500">(optional)</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Any additional requirements (one per line)..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#16730F] outline-none resize-none"
                    value={formData.requirements}
                    onChange={(e) =>
                      handleFieldChange("requirements", e.target.value)
                    }
                  />
                </div>

                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 mb-2">
                    Where should candidates apply?
                  </legend>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <label
                      className={`cursor-pointer rounded-xl border-2 p-3 transition-colors ${
                        formData.applicationMethod === "bejite"
                          ? "border-[#16730F] bg-green-50"
                          : "border-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="repostApplicationMethod"
                        checked={formData.applicationMethod === "bejite"}
                        onChange={() =>
                          handleFieldChange("applicationMethod", "bejite")
                        }
                        className="mr-2 accent-[#16730F]"
                      />
                      <span className="font-semibold text-sm">
                        Apply on Bejite
                      </span>
                    </label>
                    <label
                      className={`cursor-pointer rounded-xl border-2 p-3 transition-colors ${
                        formData.applicationMethod === "external"
                          ? "border-[#16730F] bg-green-50"
                          : "border-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="repostApplicationMethod"
                        checked={formData.applicationMethod === "external"}
                        onChange={() =>
                          handleFieldChange("applicationMethod", "external")
                        }
                        className="mr-2 accent-[#16730F]"
                      />
                      <span className="font-semibold text-sm">
                        External website
                      </span>
                    </label>
                  </div>
                  {formData.applicationMethod === "external" && (
                    <div className="mt-3">
                      <input
                        type="url"
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#16730F] outline-none"
                        value={formData.applicationUrl}
                        onChange={(e) =>
                          handleFieldChange("applicationUrl", e.target.value)
                        }
                        placeholder="https://..."
                      />
                    </div>
                  )}
                </fieldset>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary{" "}
                    <span className="font-normal text-gray-500">(optional)</span>
                  </label>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <input
                      type="number"
                      min="0"
                      placeholder="Min amount"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#16730F] outline-none"
                      value={formData.salaryMin}
                      onChange={(e) =>
                        handleFieldChange("salaryMin", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="Max amount"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#16730F] outline-none"
                      value={formData.salaryMax}
                      onChange={(e) =>
                        handleFieldChange("salaryMax", e.target.value)
                      }
                    />
                    <AutocompleteInput
                      value={formData.currency}
                      onChange={(e) =>
                        handleFieldChange("currency", e.target.value)
                      }
                      placeholder="Currency"
                      formName="employer-job"
                      fieldName="currency"
                      staticOptions={CURRENCY_OPTIONS}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Mode *
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {["Remote", "Onsite", "Hybrid"].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => handleFieldChange("workMode", mode)}
                        className={`px-4 py-2 rounded-xl border transition-all ${
                          formData.workMode === mode
                            ? "bg-[#16730F] text-white border-[#16730F] shadow-sm"
                            : "border-gray-300 text-gray-700 hover:border-[#16730F] hover:bg-green-50"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <AutocompleteInput
                      value={formData.country}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      placeholder="Select country"
                      formName="employer-job"
                      fieldName="preferred_country"
                      staticOptions={countries}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State{" "}
                      <span className="font-normal text-gray-500">
                        (optional)
                      </span>
                    </label>
                    <AutocompleteInput
                      value={formData.state}
                      onChange={(e) =>
                        handleFieldChange("state", e.target.value)
                      }
                      placeholder="Select state"
                      formName="employer-job"
                      fieldName="preferred_state"
                      staticOptions={states}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    disabled={reposting}
                    className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRepostWithEdit}
                    disabled={reposting}
                    className="flex-1 bg-[#16730F] text-white py-2.5 rounded-xl font-semibold hover:bg-[#145A0C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {reposting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Repost with Changes"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </NewsFeedLayout>
  );
};

export default RepostJob;
