import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NewsFeedLayout from "../../components/layout/NewsFeedLayout";
import {
  FaChevronLeft,
  FaEdit,
  FaSpinner,
  FaExclamationTriangle,
  FaSave,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import {
  JOB_ABOUT_MAX_LENGTH,
  getJobAboutValidationError,
} from "../../utils/jobAbout";
import { getEmployerJob, updateEmployerJob } from "../../services/employerApi";
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

const salaryToFormValue = (value) =>
  value != null && value !== "" ? String(value) : "";

const EditJob = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
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
  });
  const { countries, states } = useCountryStateOptions(formData.country);

  const loadJob = useCallback(async () => {
    if (!jobId) {
      setJob(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await getEmployerJob(jobId);
      if (!response?.success || !response?.data) {
        throw new Error(response?.message || "Job not found");
      }
      const data = response.data;
      setJob(data);
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
      setFormData({
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
      });
    } catch (error) {
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
    loadJob();
  }, [loadJob]);

  const handleCountryChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      country: value,
      state: value !== prev.country ? "" : prev.state,
    }));
  };

  const validateForm = () => {
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
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();
    if (!jobId || saving) return;

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSaving(true);
    try {
      const parsedMin = formData.salaryMin ? Number(formData.salaryMin) : null;
      const parsedMax = formData.salaryMax ? Number(formData.salaryMax) : null;
      const response = await updateEmployerJob(jobId, {
        title: formData.title.trim(),
        industry: formData.industry.trim(),
        about: formData.about.trim(),
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
      });
      if (!response?.success) {
        throw new Error(response?.message || "Failed to update job");
      }
      toast.success("Job updated successfully");
      navigate("/employer/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update job"
      );
    } finally {
      setSaving(false);
    }
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
              This job posting doesn't exist or you don't have permission to
              edit it.
            </p>
            <button
              type="button"
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

  return (
    <NewsFeedLayout showSidebars={false}>
      <Toaster position="top-center" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <button
          type="button"
          onClick={() => navigate("/employer/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-[#16730F] mb-4 transition-all group text-sm sm:text-base"
        >
          <FaChevronLeft className="group-hover:-translate-x-1 transition-transform text-xs sm:text-sm" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#16730F] to-[#1A3E32] px-5 sm:px-6 py-5 text-white flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <FaEdit className="text-xl" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold truncate">
                Edit Job Vacancy
              </h1>
              <p className="text-green-100 text-xs sm:text-sm mt-0.5 truncate">
                {job.title}
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5">
            <div>
              <label className="block mb-2 font-semibold text-[#1A3E32]">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#16730F]"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-[#1A3E32]">
                Industry <span className="text-red-500">*</span>
              </label>
              <AutocompleteInput
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
                placeholder="Enter or select industry"
                formName="employer-job"
                fieldName="industry_sector"
                staticOptions={INDUSTRY_SUGGESTIONS}
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-[#1A3E32]">
                About{" "}
                <span className="font-normal text-gray-500">(optional)</span>
              </label>
              <textarea
                rows={4}
                maxLength={JOB_ABOUT_MAX_LENGTH}
                className="w-full border rounded-xl px-4 py-3 resize-none focus:ring-2 focus:ring-[#16730F] outline-none"
                value={formData.about}
                onChange={(e) =>
                  setFormData({ ...formData, about: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-[#1A3E32]">
                Responsibilities <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={6}
                className="w-full border rounded-xl px-4 py-3 resize-none focus:ring-2 focus:ring-[#16730F] outline-none"
                value={formData.responsibilities}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    responsibilities: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-[#1A3E32]">
                Qualifications <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                className="w-full border rounded-xl px-4 py-3 resize-none focus:ring-2 focus:ring-[#16730F] outline-none"
                value={formData.qualifications}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    qualifications: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-[#1A3E32]">
                Requirements{" "}
                <span className="font-normal text-gray-500">(optional)</span>
              </label>
              <textarea
                rows={4}
                placeholder="Any additional requirements (one per line)..."
                className="w-full border rounded-xl px-4 py-3 resize-none focus:ring-2 focus:ring-[#16730F] outline-none"
                value={formData.requirements}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requirements: e.target.value,
                  })
                }
              />
            </div>

            <fieldset>
              <legend className="block mb-2 font-semibold text-[#1A3E32]">
                Where should candidates apply?
              </legend>
              <div className="grid sm:grid-cols-2 gap-3">
                <label
                  className={`cursor-pointer rounded-xl border-2 p-4 transition-colors ${
                    formData.applicationMethod === "bejite"
                      ? "border-[#16730F] bg-green-50"
                      : "border-gray-200 hover:border-[#16730F]/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="applicationMethod"
                    value="bejite"
                    checked={formData.applicationMethod === "bejite"}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        applicationMethod: "bejite",
                      })
                    }
                    className="mr-2 accent-[#16730F]"
                  />
                  <span className="font-semibold text-gray-900">
                    Apply on Bejite
                  </span>
                </label>
                <label
                  className={`cursor-pointer rounded-xl border-2 p-4 transition-colors ${
                    formData.applicationMethod === "external"
                      ? "border-[#16730F] bg-green-50"
                      : "border-gray-200 hover:border-[#16730F]/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="applicationMethod"
                    value="external"
                    checked={formData.applicationMethod === "external"}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        applicationMethod: "external",
                      })
                    }
                    className="mr-2 accent-[#16730F]"
                  />
                  <span className="font-semibold text-gray-900">
                    Apply on external website
                  </span>
                </label>
              </div>
              {formData.applicationMethod === "external" && (
                <div className="mt-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    External application link{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#16730F]"
                    value={formData.applicationUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        applicationUrl: e.target.value,
                      })
                    }
                    placeholder="https://..."
                  />
                </div>
              )}
            </fieldset>

            <div>
              <label className="block mb-2 font-semibold text-[#1A3E32]">
                Salary
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Optional. Helps candidates understand the compensation for this
                role. Leave max blank for a single amount.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-600">
                    Min amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g., 500000"
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#16730F]"
                    value={formData.salaryMin}
                    onChange={(e) =>
                      setFormData({ ...formData, salaryMin: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-600">
                    Max amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g., 800000"
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#16730F]"
                    value={formData.salaryMax}
                    onChange={(e) =>
                      setFormData({ ...formData, salaryMax: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-600">
                    Currency
                  </label>
                  <AutocompleteInput
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    placeholder="Select currency"
                    formName="employer-job"
                    fieldName="currency"
                    staticOptions={CURRENCY_OPTIONS}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-[#1A3E32]">
                Work Mode
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["Remote", "Onsite", "Hybrid"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, workMode: mode })
                    }
                    className={`py-3 rounded-xl border font-medium transition-colors ${
                      formData.workMode === mode
                        ? "bg-[#16730F] text-white border-[#16730F]"
                        : "bg-white border-gray-200 text-gray-700 hover:border-[#16730F]"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold text-[#1A3E32]">
                  Country <span className="text-red-500">*</span>
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
                <label className="block mb-2 font-semibold text-[#1A3E32]">
                  State{" "}
                  <span className="font-normal text-gray-500">(optional)</span>
                </label>
                <AutocompleteInput
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
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
                onClick={() => navigate("/employer/dashboard")}
                disabled={saving}
                className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#16730F] text-white py-2.5 rounded-xl font-semibold hover:bg-[#145A0C] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </NewsFeedLayout>
  );
};

export default EditJob;
