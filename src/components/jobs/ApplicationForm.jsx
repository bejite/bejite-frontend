import { useEffect, useRef, useState } from "react";
import {
  FaArrowLeft,
  FaUserCircle,
  FaFilePdf,
  FaUpload,
  FaTimes,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import { submitJobApplication } from "../../services/jobVacancyApi";
import {
  isAlreadyAppliedError,
  useAppliedJobsStore,
} from "../../store/useAppliedJobsStore";

const inputClass =
  "w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-[#16730F] outline-none";
const cardClass = "bg-white border border-gray-200 rounded-2xl p-4 sm:p-5";
const sectionTitleClass = "font-bold text-base sm:text-lg mb-3 sm:mb-4";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

export const ApplicationForm = ({ job, onBack, onSubmit, onAlreadyApplied }) => {
  const markJobApplied = useAppliedJobsStore((state) => state.markJobApplied);
  const fileInputRef = useRef(null);
  const [applicationMethod, setApplicationMethod] = useState("profile");
  const [resumeFile, setResumeFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    coverLetter: "",
  });

  useEffect(() => {
    const user = getStoredUser();
    const fullName =
      [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
      user.full_name ||
      user.name ||
      "";
    setProfile((prev) => ({
      ...prev,
      fullName: prev.fullName || fullName,
      email: prev.email || user.email || "",
      phone: prev.phone || user.phone || user.phone_number || "",
      location:
        prev.location ||
        [user.city, user.country].filter(Boolean).join(", ") ||
        user.location ||
        "",
    }));
  }, []);

  const handleResumeChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF resume.");
      event.target.value = "";
      return;
    }

    setResumeFile(file);
  };

  const clearResume = () => {
    setResumeFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!job?.id) {
      setSubmitError("Job details are missing. Please go back and try again.");
      return;
    }

    if (!profile.fullName?.trim() || !profile.email?.trim()) {
      setSubmitError("Please fill in your name and email.");
      return;
    }

    if (applicationMethod === "resume" && !resumeFile) {
      setSubmitError("Please upload your PDF resume.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await submitJobApplication(job.id, {
        applicationMethod,
        fullName: profile.fullName.trim(),
        email: profile.email.trim(),
        phone: profile.phone?.trim() || "",
        location: profile.location?.trim() || "",
        coverLetter: profile.coverLetter?.trim() || "",
        resume: applicationMethod === "resume" ? resumeFile : null,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to submit application");
      }

      markJobApplied(job.id, { applicationMethod });
      onSubmit?.(response.data);
    } catch (error) {
      console.error("Application submit error:", error);
      if (isAlreadyAppliedError(error)) {
        markJobApplied(job.id);
        onAlreadyApplied?.();
        return;
      }
      setSubmitError(
        error.response?.data?.message ||
          error.message ||
          "Failed to submit application",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const methodCardClass = (method) =>
    `w-full text-left rounded-2xl border-2 p-4 sm:p-5 transition-all ${
      applicationMethod === method
        ? "border-[#16730F] bg-[#16730F]/5 shadow-sm"
        : "border-gray-200 hover:border-[#16730F]/40"
    }`;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 sticky top-0 bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 z-10">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-gray-900 text-sm sm:text-base shrink-0"
        >
          <FaArrowLeft />
          <span className="hidden sm:inline">Back to Job</span>
          <span className="sm:hidden">Back</span>
        </button>
        <h2 className="text-sm sm:text-lg font-semibold text-center truncate min-w-0 px-1">
          Apply for {job?.title || "Job"}
        </h2>
        <div className="w-10 sm:w-20 shrink-0" />
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 pb-24 sm:pb-6">
        {submitError && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <div className="space-y-4 sm:space-y-6">
          <div className={cardClass}>
            <h3 className={sectionTitleClass}>How would you like to apply?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setApplicationMethod("profile")}
                className={methodCardClass("profile")}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#16730F]/10 flex items-center justify-center shrink-0">
                    <FaUserCircle className="text-[#16730F] text-xl" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">
                      Apply with Profile
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                      Submit your Bejite profile so employers can view your CV
                      and experience.
                    </p>
                  </div>
                </div>
                {applicationMethod === "profile" && (
                  <p className="mt-3 text-xs sm:text-sm text-[#16730F] flex items-center gap-1.5">
                    <FaCheckCircle /> Selected
                  </p>
                )}
              </button>

              <button
                type="button"
                onClick={() => setApplicationMethod("resume")}
                className={methodCardClass("resume")}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <FaFilePdf className="text-red-600 text-xl" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">
                      Upload PDF Resume
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                      Attach a PDF resume instead of using your Bejite profile.
                    </p>
                  </div>
                </div>
                {applicationMethod === "resume" && (
                  <p className="mt-3 text-xs sm:text-sm text-[#16730F] flex items-center gap-1.5">
                    <FaCheckCircle /> Selected
                  </p>
                )}
              </button>
            </div>
          </div>

          {applicationMethod === "profile" ? (
            <div className="bg-[#16730F]/5 border border-[#16730F]/15 rounded-2xl p-4 sm:p-5">
              <p className="text-sm sm:text-base text-gray-800 font-medium">
                Your Bejite profile will be shared with the employer.
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                Make sure your profile is up to date before submitting. You can
                update it from your dashboard if needed.
              </p>
            </div>
          ) : (
            <div className={cardClass}>
              <h3 className={sectionTitleClass}>Upload Resume (PDF)</h3>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleResumeChange}
                className="hidden"
              />

              {!resumeFile ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-6 sm:p-8 text-center hover:border-[#16730F] hover:bg-[#16730F]/5 transition"
                >
                  <FaUpload className="mx-auto text-2xl text-gray-400 mb-3" />
                  <p className="font-medium text-gray-800 text-sm sm:text-base">
                    Click to upload your resume
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    PDF only · Max recommended 5MB
                  </p>
                </button>
              ) : (
                <div className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                      <FaFilePdf className="text-red-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">
                        {resumeFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearResume}
                    className="p-2 text-gray-500 hover:text-red-600 shrink-0"
                    aria-label="Remove resume"
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className={cardClass}>
            <h3 className={sectionTitleClass}>Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  className={inputClass}
                  value={profile.fullName}
                  onChange={(e) =>
                    setProfile({ ...profile, fullName: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  className={inputClass}
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  className={inputClass}
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  className={inputClass}
                  value={profile.location}
                  onChange={(e) =>
                    setProfile({ ...profile, location: e.target.value })
                  }
                  placeholder="City, Country"
                />
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <h3 className={sectionTitleClass}>Cover Letter (Optional)</h3>
            <textarea
              rows={4}
              className={inputClass}
              placeholder="Why are you interested in this role? What makes you a great fit?"
              value={profile.coverLetter}
              onChange={(e) =>
                setProfile({ ...profile, coverLetter: e.target.value })
              }
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="hidden sm:flex w-full items-center justify-center gap-2 bg-[#16730F] text-white py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-[#145A0C] transition disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin" /> Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </button>
        </div>
      </div>

      <div className="sm:hidden shrink-0 border-t border-gray-200 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-[#16730F] text-white py-3 rounded-xl font-semibold hover:bg-[#145A0C] transition text-sm disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <FaSpinner className="animate-spin" /> Submitting...
            </>
          ) : (
            "Submit Application"
          )}
        </button>
      </div>
    </div>
  );
};
