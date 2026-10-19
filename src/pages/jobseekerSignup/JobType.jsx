import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import NavigationButtons from "../../components/NavigationButtons";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { FaBriefcase } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import useLocalStorage from "../../hooks/useLocalStorage";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import OnboardingLayout from "../../components/layout/onboardingLayout";
import Loader from "../../components/ui/Loader";
import FormLabel from "../../components/forms/FormLabel";
import {
  JOB_TITLE_OPTIONS,
  INDUSTRY_OPTIONS,
  COUNTRY_OPTIONS,
  WORK_TYPE_OPTIONS,
  CURRENCY_OPTIONS,
  REMOTE_PREFERENCE_OPTIONS,
  AVAILABILITY_OPTIONS,
  RATE_OPTIONS,
  currencyLabelFromCode,
  currencyCodeFromLabel,
  JOBSEEKER_STATUS_OPTIONS,
  RECRUITER_TYPE_OPTIONS,
  toJobseekerStatusValue,
  toRecruiterTypeValue,
} from "../../data/jobTypeData";
import useCountryStateOptions from "../../hooks/useCountryStateOptions";
import RecruiterSelect from "../../components/recruiter/RecruiterSelect";
import { updateUser } from "../../features/auth/authSlice";
import { toTitleCaseWords } from "../../utils/displayFormatUtils";

function canonicalOption(value, options = []) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const matched = options.find((opt) => {
    const candidate =
      typeof opt === "string" ? opt : opt?.value ?? opt?.label ?? "";
    return String(candidate).toLowerCase() === raw.toLowerCase();
  });
  if (matched == null) return toTitleCaseWords(raw);
  return typeof matched === "string"
    ? matched
    : String(matched.value ?? matched.label ?? raw);
}

const EMPTY_FORM = {
  jobseekerStatus: "",
  jobTitle: "",
  industry: "",
  country: "",
  statePref: "",
  workType: "",
  salary: "",
  currency: "",
  remotePref: "",
  availability: "",
  rate: "",
};

function JobType() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { currentStep, isEditMode, getPath } = useOutletContext() ?? {};

  const { id: localUserId } = useLocalStorage("user");
  const userId = user?.id || localUserId;

  const steps = [
    "Bio",
    "Education",
    "Skills",
    "Work history",
    "Certificate",
    "Links",
    "Job Type",
  ];

  const handleStepClick = (path) => navigate(path);

  const [form, setForm] = useState(EMPTY_FORM);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    email,
    firstName,
    lastName,
    role,
    mode,
    followings,
    profileUpdateComplete,
  } = location.state || {};

  const userRole = (user?.role || role || "").toLowerCase();
  const isRecruiter =
    userRole === "recruiter" ||
    userRole === "employer" ||
    userRole === "corporate" ||
    userRole === "individual";

  const statusLabel = isRecruiter ? "RECRUITER TYPE" : "JOBSEEKER STATUS";
  const statusOptions = isRecruiter
    ? RECRUITER_TYPE_OPTIONS
    : JOBSEEKER_STATUS_OPTIONS;
  const defaultStatus = isRecruiter
    ? toRecruiterTypeValue(user?.mode || mode)
    : toJobseekerStatusValue(user?.mode || mode);

  useEffect(() => {
    if (!userId) {
      setDataLoaded(true);
      return;
    }
    if (dataLoaded) return;

    const fetchJobType = async () => {
      try {
        const res = await axiosInstance.get(
          `/api/cv-builder/job-type/${userId}`,
        );
        if (res.data?.success && res.data?.data) {
          const data = res.data.data;
          setForm({
            jobseekerStatus: isRecruiter
              ? toRecruiterTypeValue(
                  data.recruiter_type ||
                    data.recruiterType ||
                    data.mode ||
                    data.jobseeker_status ||
                    data.jobseekerStatus,
                  defaultStatus,
                )
              : toJobseekerStatusValue(
                  data.jobseeker_status ||
                    data.jobseekerStatus ||
                    data.mode ||
                    data.recruiter_type ||
                    data.recruiterType,
                  defaultStatus,
                ),
            jobTitle: data.job_title || "",
            industry: data.industry_sector || data.industry || "",
            country: canonicalOption(data.preferred_country, COUNTRY_OPTIONS),
            statePref: toTitleCaseWords(data.preferred_state || ""),
            workType: data.work_type || "",
            salary: data.expected_salary || data.salary_expectation || "",
            currency: currencyLabelFromCode(data.currency),
            remotePref: data.remote_preference || "",
            availability: data.availability || "",
            rate: data.rate || "",
          });
        } else {
          setForm((prev) => ({
            ...prev,
            jobseekerStatus: prev.jobseekerStatus || defaultStatus,
          }));
        }
      } catch (err) {
        console.error("Error fetching job type:", err);
        setForm((prev) => ({
          ...prev,
          jobseekerStatus: prev.jobseekerStatus || defaultStatus,
        }));
      } finally {
        setDataLoaded(true);
      }
    };

    fetchJobType();
  }, [userId, dataLoaded, defaultStatus, isRecruiter]);

  const { states } = useCountryStateOptions(form.country);

  useEffect(() => {
    if (!form.statePref || !states.length) return;
    const matched = canonicalOption(form.statePref, states);
    if (matched && matched !== form.statePref) {
      setForm((prev) => ({ ...prev, statePref: matched }));
    }
  }, [states, form.statePref]);

  const allFilled = Object.entries(form).every(([key, val]) => {
    if (key === "statePref" && form.country && states.length === 0) {
      return true;
    }
    return String(val).trim() !== "";
  });

  const updateField = (field) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "country" && value !== prev.country) {
        next.statePref = "";
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!allFilled) {
      toast.error("Please complete all fields before continuing.");
      return;
    }
    if (!userId) {
      toast.error("Could not determine your account. Please sign in again.");
      return;
    }

    setIsSubmitting(true);

    const activeStatus = String(
      form.jobseekerStatus || defaultStatus,
    ).trim();

    const payload = {
      userId,
      jobseeker_status: activeStatus,
      recruiter_type: isRecruiter ? activeStatus : undefined,
      job_title: String(form.jobTitle).trim(),
      industry_sector: String(form.industry).trim(),
      preferred_country: canonicalOption(form.country, COUNTRY_OPTIONS),
      preferred_state: canonicalOption(form.statePref, states),
      work_type: String(form.workType).trim(),
      expected_salary: String(form.salary).trim(),
      currency: currencyCodeFromLabel(form.currency),
      remote_preference: String(form.remotePref).trim(),
      availability: String(form.availability).trim(),
      rate: String(form.rate).trim(),
    };

    try {
      const res = await axiosInstance.post("/api/cv-builder/job-type", payload);
      const ok =
        res.data?.success === true ||
        (res.status >= 200 && res.status < 300 && res.data?.success !== false);

      if (ok) {
        const savedMode =
          res.data?.data?.mode ||
          res.data?.data?.jobseeker_status ||
          res.data?.data?.recruiter_type ||
          activeStatus;
        dispatch(updateUser({ mode: savedMode }));
        toast.success("Job preferences saved successfully!");
        if (isEditMode) {
          navigate("/profile", {
            state: { profileUpdateComplete: true },
          });
        } else {
          navigate("/news-feed", {
            state: {
              email,
              firstName,
              lastName,
              role,
              mode: savedMode,
              followings,
            },
          });
        }
      } else {
        toast.error(res.data?.message || "Failed to save job preferences");
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;
      toast.error(msg || "Submission failed");
      console.error("POST /api/cv-builder/job-type failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      steps={steps}
      currentStep={currentStep ?? 7}
      handleStepClick={handleStepClick}
      getPath={getPath}
      isEditMode={isEditMode}
    >
      <div className="pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#16730F] to-[#145a0c] rounded-2xl shadow-lg mb-4">
              <FaBriefcase className="text-3xl text-white" />
            </div>
            <p className="text-[#16730F] text-sm font-medium uppercase tracking-wide">
              Almost there!
            </p>
            <h1 className="text-3xl font-bold text-[#16730F] mt-1 mb-2">
              What type of job do you want?
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tell employers your ideal role, location, and compensation so they
              can match you to the right opportunities.
            </p>
            {(isEditMode || profileUpdateComplete) && (
              <p className="text-sm text-[#16730F] mt-3 font-medium">
                This is the final step of your CV profile.
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-visible relative z-20">
            <div className="bg-gradient-to-r from-[#16730F] to-[#145a0c] px-6 py-4">
              <h2 className="text-white text-lg font-semibold flex items-center gap-2">
                <FaBriefcase className="text-white/80" />
                Job preferences
              </h2>
              <p className="text-white/70 text-sm mt-1">
                All fields are required
              </p>
            </div>

            <div className="p-6 space-y-8 relative z-30">
              {/* Role & Industry */}
              <section className="relative z-40">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">
                  Role & industry
                </h3>
                <div className="flex flex-wrap gap-4 relative z-40">
                  <div className="flex-1 min-w-[220px]">
                    <RecruiterSelect
                      label={statusLabel}
                      tooltip="Your current career status (e.g. Actively Looking, Open to Offers, Employed)"
                      value={form.jobseekerStatus || defaultStatus}
                      onChange={updateField("jobseekerStatus")}
                      options={statusOptions}
                      placeholder={`Select ${
                        isRecruiter ? "recruiter type" : "jobseeker status"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-[220px]">
                    <RecruiterSelect
                      label="JOB TITLE / YOUR ROLE"
                      tooltip="Your target job role or desired position"
                      value={form.jobTitle}
                      onChange={updateField("jobTitle")}
                      options={JOB_TITLE_OPTIONS}
                      placeholder="Select job title"
                    />
                  </div>
                  <div className="flex-1 min-w-[220px]">
                    <RecruiterSelect
                      label="INDUSTRY / SECTOR"
                      tooltip="The industry or sector you want to work in (e.g. Technology, Finance, Healthcare)"
                      value={form.industry}
                      onChange={updateField("industry")}
                      options={INDUSTRY_OPTIONS}
                      placeholder="Select industry"
                    />
                  </div>
                </div>
              </section>

              {/* Location */}
              <section className="relative z-30">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">
                  Location
                </h3>
                <div className="flex flex-wrap gap-4 relative z-30">
                  <div className="flex-1 min-w-[220px]">
                    <RecruiterSelect
                      label="PREFERRED COUNTRY"
                      tooltip="The country where you prefer to work or be hired"
                      value={form.country}
                      onChange={updateField("country")}
                      options={COUNTRY_OPTIONS}
                      placeholder="Select country"
                    />
                  </div>
                  <div className="flex-1 min-w-[220px]">
                    <RecruiterSelect
                      label="PREFERRED STATE"
                      tooltip="The specific state or region within your preferred country"
                      value={form.statePref}
                      onChange={updateField("statePref")}
                      options={states}
                      placeholder={
                        !form.country
                          ? "Select country first"
                          : states.length > 0
                            ? "Select state"
                            : "Enter region (optional)"
                      }
                      disabled={!form.country}
                    />
                  </div>
                  <div className="flex-1 min-w-[220px]">
                    <RecruiterSelect
                      label="WORK TYPE"
                      tooltip="Your preferred employment arrangement (e.g. Full-Time, Part-Time, Contract, Internship)"
                      value={form.workType}
                      onChange={updateField("workType")}
                      options={WORK_TYPE_OPTIONS}
                      placeholder="Select work type"
                    />
                  </div>
                </div>
              </section>

              {/* Compensation & Availability */}
              <section className="relative z-20">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">
                  Compensation & availability
                </h3>
                <div className="flex flex-wrap gap-4 relative z-20">
                  <div className="flex-1 min-w-[220px]">
                    <FormLabel
                      label="EXPECTED SALARY"
                      tooltip="Your desired compensation or salary expectations"
                    />
                    <input
                      type="text"
                      inputMode="decimal"
                      value={form.salary}
                      onChange={updateField("salary")}
                      className="w-full h-11 bg-white border border-gray-200 rounded-xl px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#16730F] focus:border-transparent"
                      placeholder="e.g. 500000 or 500-800"
                    />
                  </div>
                  <div className="flex-1 min-w-[220px]">
                    <RecruiterSelect
                      label="CURRENCY"
                      tooltip="The currency for your expected salary or rate"
                      value={form.currency}
                      onChange={updateField("currency")}
                      options={CURRENCY_OPTIONS}
                      placeholder="Select currency"
                    />
                  </div>
                  <div className="flex-1 min-w-[220px]">
                    <RecruiterSelect
                      label="REMOTE PREFERENCE"
                      tooltip="Whether you prefer on-site, remote, or hybrid work arrangements"
                      value={form.remotePref}
                      onChange={updateField("remotePref")}
                      options={REMOTE_PREFERENCE_OPTIONS}
                      placeholder="Select remote preference"
                    />
                  </div>
                  <div className="flex-1 min-w-[220px]">
                    <RecruiterSelect
                      label="AVAILABILITY"
                      tooltip="How soon you can start working (e.g. Immediately, 2 Weeks, 1 Month)"
                      value={form.availability}
                      onChange={updateField("availability")}
                      options={AVAILABILITY_OPTIONS}
                      placeholder="Select availability"
                    />
                  </div>
                  <div className="flex-1 min-w-[220px]">
                    <RecruiterSelect
                      label="RATE"
                      tooltip="Your billing rate if applying for freelance or contract roles"
                      value={form.rate}
                      onChange={updateField("rate")}
                      options={RATE_OPTIONS}
                      placeholder="Select rate"
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Tip:</span> These preferences
              appear on your profile when employers search for candidates and
              help power better job matches.
            </p>
          </div>
        </div>

        <NavigationButtons
          isFormComplete={allFilled}
          isLoading={isSubmitting}
          nextLabel={isEditMode ? "Save changes" : "Finish profile"}
          onBack={() => {
            if (isEditMode && typeof getPath === "function") {
              navigate(getPath(currentStep - 1));
            } else {
              navigate(-1);
            }
          }}
          onNext={() => {
            if (!allFilled || isSubmitting) return;
            handleSubmit();
          }}
        />

        <Loader show={isSubmitting || !dataLoaded} />
      </div>
    </OnboardingLayout>
  );
}

export default JobType;
