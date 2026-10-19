import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaTimes,
  FaFileAlt,
  FaLink,
  FaEye,
  FaDownload,
  FaPencilAlt,
  FaSave,
  FaStar,
  FaCommentDots,
} from "react-icons/fa";
import { toast } from "react-toastify";
import Button from "../ui/Button";
import FormField from "../ui/FormField";
import {
  getApplicationProfile,
  updateApplicationNotes,
  createApplicationFeedback,
  downloadJobApplicationResume,
} from "../../services/employerApi";
import { formatDisplayText } from "../../utils/displayFormatUtils";
import { resolveCandidateUserId } from "../../utils/resolveCandidateUserId";

const mapRecommendationToOutcome = (rec = "") => {
  const value = String(rec).toLowerCase();
  if (value.includes("reject")) return "Failed";
  if (value.includes("hold")) return "Pending";
  if (value.includes("pass")) return "Passed";
  return "Pending";
};

const formatExperience = (value) => {
  if (value == null || value === "") return "—";
  if (typeof value === "number") return `${value} Year${value === 1 ? "" : "s"}`;
  return String(value);
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString();
};

export default function CandidateProfileModal({
  isOpen,
  onClose,
  candidate,
  jobId,
  onMoveToNextStage,
  onChangeOutcome,
  onSendFeedback,
  initialTab = "overview",
  onProfileUpdated,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showLogFeedback, setShowLogFeedback] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [resumeBusy, setResumeBusy] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const [recruiterNotes, setRecruiterNotes] = useState("");
  const [feedbackRating, setFeedbackRating] = useState("5 Stars - Excellent");
  const [feedbackRec, setFeedbackRec] = useState("Pass to Next stage");
  const [feedbackInterviewer, setFeedbackInterviewer] = useState("");
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const navigate = useNavigate();

  const applicationId = candidate?.id;

  const loadProfile = useCallback(async () => {
    if (!jobId || !applicationId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const response = await getApplicationProfile(jobId, applicationId);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to load candidate profile");
      }
      const data = response.data || {};
      setProfile(data);
      setRecruiterNotes(data.recruiterNotes || "");
      if (onProfileUpdated) onProfileUpdated(data);
    } catch (err) {
      setLoadError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load candidate profile",
      );
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [jobId, applicationId, onProfileUpdated]);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!isOpen || !jobId || !applicationId) return;
    loadProfile();
  }, [isOpen, jobId, applicationId, loadProfile]);

  if (!isOpen || !candidate) return null;

  const display = {
    ...candidate,
    ...(profile || {}),
  };
  const profileUserId = resolveCandidateUserId(display) || resolveCandidateUserId(candidate);

  const openPublicProfile = () => {
    if (!profileUserId) {
      toast.error("This candidate has no linked profile yet.");
      return;
    }
    onClose?.();
    navigate(`/user-profile/${profileUserId}`);
  };

  const candidateScore =
    display.score != null
      ? `${display.score}/100`
      : display.matchScore != null
        ? `${display.matchScore}/100`
        : "—";
  const candidateOutcome = display.outcome || "Pending";
  const candidateStage = display.currentStage || display.pipelineStageName || "—";
  const timelineItems = Array.isArray(display.timeline) ? display.timeline : [];
  const evaluations = Array.isArray(display.evaluations)
    ? display.evaluations
    : [];

  const handleSaveNotes = async () => {
    if (!jobId || !applicationId || savingNotes) return;
    setSavingNotes(true);
    try {
      const response = await updateApplicationNotes(
        jobId,
        applicationId,
        recruiterNotes,
      );
      if (!response?.success) {
        throw new Error(response?.message || "Failed to save notes");
      }
      setProfile((prev) =>
        prev
          ? { ...prev, recruiterNotes: response.data?.recruiterNotes ?? recruiterNotes }
          : prev,
      );
      toast.success("Recruiter notes saved");
      await loadProfile();
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to save notes",
      );
    } finally {
      setSavingNotes(false);
    }
  };

  const handleLogFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackNotes.trim()) {
      toast.error("Please enter evaluation notes");
      return;
    }
    if (!jobId || !applicationId || submittingFeedback) return;

    setSubmittingFeedback(true);
    try {
      const outcome = mapRecommendationToOutcome(feedbackRec);
      const response = await createApplicationFeedback(jobId, applicationId, {
        outcome,
        rating: feedbackRating,
        feedback: feedbackNotes.trim(),
        interviewerName: feedbackInterviewer.trim() || undefined,
      });
      if (!response?.success) {
        throw new Error(response?.message || "Failed to submit feedback");
      }
      setFeedbackNotes("");
      setShowLogFeedback(false);
      toast.success("Interviewer feedback submitted");
      await loadProfile();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit feedback",
      );
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const openResumeBlob = async ({ download = false } = {}) => {
    if (!jobId || !applicationId || resumeBusy) return;
    setResumeBusy(true);
    try {
      const blob = await downloadJobApplicationResume(jobId, applicationId);
      const url = window.URL.createObjectURL(blob);
      if (download) {
        const link = document.createElement("a");
        link.href = url;
        link.download =
          display.resumeLabel ||
          `${String(display.name || "Candidate").replace(/\s+/g, "_")}_Resume.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
      setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "No resume file available for this candidate",
      );
    } finally {
      setResumeBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden p-4 sm:p-6 shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#E6F4EA] text-[#16730F] flex items-center justify-center text-base sm:text-lg shrink-0">
              <FaUser />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-xl font-bold text-[#1A3E32] tracking-tight truncate">
                Candidate Profile
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors focus:outline-none shrink-0"
            aria-label="Close modal"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto nfl-scroll flex-1 min-h-0 space-y-4 pr-1 sm:pr-2 pt-3">
          {loading && (
            <div className="text-sm text-gray-500 py-10 text-center font-medium">
              Loading candidate profile…
            </div>
          )}

          {loadError && !loading && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span>{loadError}</span>
              <Button size="sm" variant="gray" onClick={loadProfile}>
                Retry
              </Button>
            </div>
          )}

          {!loading && !loadError && (
            <>
              <div className="bg-[#16730F] text-white rounded-2xl p-3.5 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 shadow-sm">
                <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                  <img
                    src={display.avatar || "/assets/images/photo_placeholder.png"}
                    alt={display.name}
                    className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white/40 shrink-0 ${
                      profileUserId ? "cursor-pointer" : ""
                    }`}
                    onClick={profileUserId ? openPublicProfile : undefined}
                    onError={(e) => {
                      e.currentTarget.src = "/assets/images/photo_placeholder.png";
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-lg font-bold tracking-tight truncate">
                        {profileUserId ? (
                          <button
                            type="button"
                            onClick={openPublicProfile}
                            className="text-left truncate underline-offset-2 hover:underline focus:underline focus:outline-none"
                            title="View full profile"
                          >
                            {display.name || "Candidate"}
                          </button>
                        ) : (
                          display.name || "Candidate"
                        )}
                      </h4>
                      <span className="bg-white/20 text-white text-[9px] sm:text-[10px] font-extrabold px-2 sm:px-2.5 py-0.5 rounded-full uppercase shrink-0">
                        SCORE: {candidateScore}
                      </span>
                    </div>
                    <div className="text-xs text-emerald-100 font-medium mt-0.5 truncate">
                      {display.title || "—"}
                    </div>
                    <div className="text-[11px] sm:text-xs text-emerald-200 font-normal mt-0.5 truncate">
                      Stage: {candidateStage}
                    </div>
                  </div>
                </div>

                <div className="self-start sm:self-auto text-left sm:text-right shrink-0 border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
                  <div className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 mb-0.5">
                    CURRENT OUTCOME
                  </div>
                  <span className="inline-block bg-[#856404] text-white text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-xs">
                    {candidateOutcome}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
                <Button
                  variant="secondary"
                  className="w-full text-xs sm:text-sm py-2"
                  onClick={() => onMoveToNextStage && onMoveToNextStage(candidate)}
                >
                  Move to Next Stage
                </Button>
                <Button
                  variant="lightGreen"
                  className="w-full text-xs sm:text-sm py-2"
                  onClick={() => onChangeOutcome && onChangeOutcome(candidate)}
                >
                  Change Outcome
                </Button>
                <Button
                  variant="amber"
                  className="w-full text-xs sm:text-sm py-2"
                  onClick={() => onSendFeedback && onSendFeedback(candidate)}
                >
                  Send Feedback
                </Button>
              </div>

              <div className="border-b border-gray-200 flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-bold overflow-x-auto nfl-scroll pt-1 pb-1">
                {[
                  ["overview", "Profile Overview"],
                  ["timeline", "Activity Timeline"],
                  ["notes", "Recruiter's Note"],
                  ["documents", "Documents"],
                  ["feedback", "Interviewers Feedback"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key)}
                    className={`pb-2 border-b-2 whitespace-nowrap transition-colors shrink-0 ${
                      activeTab === key
                        ? "border-[#16730F] text-[#16730F]"
                        : "border-transparent text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {activeTab === "overview" && (
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="bg-[#F7FAF8] border border-[#D5E5DD] rounded-2xl p-3.5 sm:p-5 space-y-3">
                    <div className="flex items-center gap-2 text-[#1A3E32] font-extrabold text-xs uppercase tracking-wider">
                      <FaUser className="text-[#16730F]" />
                      <span>Personal Information & Application</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5 text-xs pt-1">
                      <div>
                        <div className="text-gray-500 font-medium">Full Name</div>
                        <div className="font-bold text-gray-900 mt-0.5 truncate">
                          {profileUserId ? (
                            <button
                              type="button"
                              onClick={openPublicProfile}
                              className="text-[#16730F] hover:underline underline-offset-2 truncate max-w-full"
                              title="View full profile"
                            >
                              {display.name || "—"}
                            </button>
                          ) : (
                            display.name || "—"
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 font-medium">
                          Email Address
                        </div>
                        <div className="font-bold text-[#16730F] mt-0.5 truncate">
                          {display.email || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 font-medium">
                          Phone Number
                        </div>
                        <div className="font-bold text-gray-900 mt-0.5 truncate">
                          {display.phone || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 font-medium">Location</div>
                        <div className="font-bold text-gray-900 mt-0.5 truncate">
                          {formatDisplayText(display.location) || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 font-medium">
                          Application Date
                        </div>
                        <div className="font-bold text-[#16730F] mt-0.5">
                          {formatDate(
                            display.applicationDate || display.appliedAt,
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 font-medium">
                          Invitation Status
                        </div>
                        <div className="mt-0.5">
                          <span className="inline-block bg-[#FEF3C7] text-[#D97706] text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize">
                            {display.invitationStatus || "Not invited"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 font-medium">
                          Assigned Recruiter
                        </div>
                        <div className="font-bold text-gray-900 mt-0.5 truncate">
                          {display.recruiter || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 font-medium">
                          Next Scheduled Activity
                        </div>
                        <div className="font-bold text-[#16730F] mt-0.5 truncate">
                          {display.nextActivity || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 font-medium">
                          Experience
                        </div>
                        <div className="font-bold text-gray-900 mt-0.5">
                          {formatExperience(display.experience)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#F7FAF8] border border-[#D5E5DD] rounded-2xl p-3.5 sm:p-5 space-y-3">
                    <div className="text-[#1A3E32] font-extrabold text-xs uppercase tracking-wider">
                      Technical Competencies & Skills
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
                      {(display.skills || []).length > 0 ? (
                        display.skills.map((sk, i) => (
                          <span
                            key={`${sk}-${i}`}
                            className="bg-white border border-gray-200 text-gray-800 text-xs font-bold px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full shadow-2xs"
                          >
                            {sk}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">
                          No skills listed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "timeline" && (
                <div className="bg-[#F7FAF8] border border-[#D5E5DD] rounded-2xl p-3.5 sm:p-5 space-y-3 text-xs sm:text-sm">
                  <div className="font-extrabold text-[#1A3E32] uppercase tracking-wider text-xs">
                    Activity Timeline
                  </div>

                  {timelineItems.length > 0 ? (
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-[#16730F] pt-2">
                      {timelineItems.map((item) => (
                        <div
                          key={item.id || `${item.time}-${item.label}`}
                          className="relative flex items-center justify-between gap-3"
                        >
                          <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-[#16730F] ring-4 ring-[#F7FAF8] shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] text-gray-500 font-medium">
                              {item.time}
                            </div>
                            <div className="font-extrabold text-[#16730F] text-xs sm:text-sm mt-0.5">
                              {item.label}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white border-2 border-dashed border-[#8EB398] rounded-2xl py-10 px-6 text-center text-[#1A3E32] font-medium text-xs sm:text-sm">
                      No activity recorded for this candidate yet.
                    </div>
                  )}
                </div>
              )}

              {activeTab === "notes" && (
                <div className="bg-[#F7FAF8] border border-[#D5E5DD] rounded-2xl p-3.5 sm:p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <div className="flex items-center gap-2 text-[#1A3E32] font-extrabold text-xs uppercase tracking-wider">
                        <FaPencilAlt className="text-[#16730F]" />
                        <span>Private Recruiter Notes</span>
                      </div>
                      <p className="text-xs text-gray-500 font-normal mt-0.5">
                        Internal notes visible only to talent acquisition team members.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      icon={FaSave}
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      className="self-start sm:self-auto shrink-0"
                    >
                      {savingNotes ? "Saving…" : "Save Notes"}
                    </Button>
                  </div>

                  <FormField
                    type="textarea"
                    rows={5}
                    value={recruiterNotes}
                    onChange={(e) => setRecruiterNotes(e.target.value)}
                    placeholder="Type recruiter observations, salary expectations, notice period details, or key interview highlights..."
                  />
                </div>
              )}

              {activeTab === "documents" && (
                <div className="bg-[#F7FAF8] border border-[#D5E5DD] rounded-2xl p-3.5 sm:p-5 space-y-3">
                  <div className="text-[#1A3E32] font-extrabold text-xs uppercase tracking-wider">
                    Candidate Documents & Attachments
                  </div>

                  <div className="space-y-3 pt-1">
                    <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#16730F] flex items-center justify-center text-lg shrink-0">
                          <FaFileAlt />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                            {display.resumeLabel || "Resume / CV"}
                          </div>
                          <div className="text-[11px] text-gray-500 truncate">
                            {display.hasResume
                              ? `Uploaded ${formatDate(display.applicationDate || display.appliedAt)}`
                              : "No resume file attached"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-stretch sm:self-auto">
                        <Button
                          size="sm"
                          variant="gray"
                          icon={FaEye}
                          disabled={!display.hasResume || resumeBusy}
                          onClick={() => openResumeBlob({ download: false })}
                          className="flex-1 sm:flex-none justify-center"
                        >
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          icon={FaDownload}
                          disabled={!display.hasResume || resumeBusy}
                          onClick={() => openResumeBlob({ download: true })}
                          className="flex-1 sm:flex-none justify-center"
                        >
                          Download
                        </Button>
                      </div>
                    </div>

                    {display.portfolioUrl ? (
                      <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg shrink-0">
                            <FaLink />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                              {display.portfolioLabel || "External profile link"}
                            </div>
                            <div className="text-[11px] text-gray-500 truncate">
                              {display.portfolioUrl}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-stretch sm:self-auto">
                          <Button
                            size="sm"
                            variant="primary"
                            icon={FaEye}
                            onClick={() =>
                              window.open(
                                display.portfolioUrl,
                                "_blank",
                                "noopener,noreferrer",
                              )
                            }
                            className="w-full sm:w-auto justify-center"
                          >
                            Open
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border-2 border-dashed border-[#8EB398] rounded-2xl py-8 px-6 text-center text-[#1A3E32] font-medium text-xs sm:text-sm">
                        No portfolio or external profile link on file.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "feedback" && (
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="bg-[#F7FAF8] border border-[#D5E5DD] rounded-2xl p-3.5 sm:p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="text-[#1A3E32] font-extrabold text-xs uppercase tracking-wider">
                        Interviewer Logs
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={FaCommentDots}
                        onClick={() => setShowLogFeedback((prev) => !prev)}
                        className="self-start sm:self-auto shrink-0"
                      >
                        Log Interviewer Feedback
                      </Button>
                    </div>

                    {evaluations.length > 0 ? (
                      <div className="space-y-3 pt-1">
                        {evaluations.map((ev) => (
                          <div
                            key={ev.id}
                            className="bg-white border border-gray-200 rounded-xl p-3.5 sm:p-4 space-y-2 shadow-2xs"
                          >
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div>
                                <span className="font-bold text-gray-900 text-sm">
                                  {ev.name}
                                </span>
                                <span className="text-xs text-gray-500 font-medium ml-2">
                                  {ev.role} • {ev.date}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center text-amber-400 text-xs">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar
                                      key={star}
                                      className={
                                        star <= (ev.stars || 0)
                                          ? "text-amber-400"
                                          : "text-gray-200"
                                      }
                                    />
                                  ))}
                                </div>
                                <span className="bg-[#FEF3C7] text-[#B45309] font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                                  {ev.badge}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-700 italic font-medium leading-relaxed">
                              {ev.notes ? `"${ev.notes}"` : "No notes provided"}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white border-2 border-dashed border-[#8EB398] rounded-2xl py-12 px-6 text-center text-[#1A3E32] font-medium text-xs sm:text-sm">
                        No evaluations submitted for this candidate yet.
                      </div>
                    )}
                  </div>

                  {showLogFeedback && (
                    <div className="bg-[#F7FAF8] border border-[#D5E5DD] rounded-2xl p-3.5 sm:p-5 space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2 text-[#1A3E32] font-extrabold text-xs uppercase tracking-wider">
                        <FaCommentDots className="text-[#16730F]" />
                        <span>Log Interviewer Feedback</span>
                      </div>

                      <form
                        onSubmit={handleLogFeedbackSubmit}
                        className="space-y-3 pt-1"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <FormField
                            label="Rating"
                            type="select"
                            value={feedbackRating}
                            onChange={(e) => setFeedbackRating(e.target.value)}
                            options={[
                              "5 Stars - Excellent",
                              "4 Stars - Good",
                              "3 Stars - Average",
                              "2 Stars - Below Average",
                              "1 Star - Poor",
                            ]}
                          />
                          <FormField
                            label="Recommendation"
                            type="select"
                            value={feedbackRec}
                            onChange={(e) => setFeedbackRec(e.target.value)}
                            options={[
                              "Pass to Next stage",
                              "Hold",
                              "Reject",
                            ]}
                          />
                          <FormField
                            label="Interviewer"
                            value={feedbackInterviewer}
                            onChange={(e) =>
                              setFeedbackInterviewer(e.target.value)
                            }
                            placeholder="Your name"
                          />
                        </div>

                        <FormField
                          label="Evaluation Notes & Observations"
                          type="textarea"
                          rows={3}
                          value={feedbackNotes}
                          onChange={(e) => setFeedbackNotes(e.target.value)}
                          placeholder="Provide specific notes regarding technical competency, culture fit, or questions raised..."
                        />

                        <div className="flex justify-end pt-1">
                          <Button
                            type="submit"
                            variant="primary"
                            disabled={submittingFeedback}
                            className="w-full sm:w-auto"
                          >
                            {submittingFeedback
                              ? "Submitting…"
                              : "Submit Feedback"}
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

