import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaDownload,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBriefcase,
  FaSearch,
  FaChevronLeft,
  FaInfoCircle,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";
import NewsFeedLayout from "../../components/layout/NewsFeedLayout";
import {
  getJobApplications,
  updateJobApplicationStatus,
  downloadJobApplicationResume,
} from "../../services/employerApi";
import { profilePhotoUrl } from "../../utils/profilePhotoUrl";
import { formatDisplayText } from "../../utils/displayFormatUtils";
import { RecruiterSelect } from "../../components/recruiter/recruiterOnboardingUi";

const ApplicantAvatar = ({
  application,
  containerClassName,
  textClassName = "text-base sm:text-lg",
}) => {
  const photoSrc = profilePhotoUrl(application?.profilePhoto);

  if (photoSrc) {
    return (
      <img
        src={photoSrc}
        alt={application?.name || "Candidate"}
        className={`object-cover ${containerClassName}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center text-white font-bold bg-gradient-to-br from-[#16730F] to-[#1A3E32] ${containerClassName}`}
    >
      <span className={textClassName}>
        {(application?.name || "?").charAt(0)}
      </span>
    </div>
  );
};

const JobApplications = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statusDraft, setStatusDraft] = useState("pending");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [downloadingResume, setDownloadingResume] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const loadApplications = useCallback(async () => {
    if (!jobId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getJobApplications(jobId);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to load applications");
      }

      const items = response.data?.applications || [];
      setJobTitle(response.data?.job?.title || "Job");
      setApplications(items);
      setSelectedApplication(items[0] || null);
      setStatusDraft(items[0]?.status || "pending");
    } catch (err) {
      console.error("Applications load error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load job applications",
      );
      setApplications([]);
      setSelectedApplication(null);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  useEffect(() => {
    if (selectedApplication) {
      setStatusDraft(selectedApplication.status);
    }
  }, [selectedApplication]);

  const getMatchScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const handleCardClick = (app) => {
    setSelectedApplication(app);
    if (window.innerWidth < 1024) {
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleStatusUpdate = async () => {
    if (!selectedApplication || !jobId) return;

    setUpdatingStatus(true);
    try {
      const response = await updateJobApplicationStatus(
        jobId,
        selectedApplication.id,
        statusDraft,
      );

      if (!response?.success) {
        throw new Error(response?.message || "Failed to update status");
      }

      const updated = response.data;
      setApplications((prev) =>
        prev.map((app) => (app.id === updated.id ? updated : app)),
      );
      setSelectedApplication(updated);
    } catch (err) {
      console.error("Status update error:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to update application status",
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const hasStatusChange =
    selectedApplication && statusDraft !== selectedApplication.status;

  const handleContactCandidate = () => {
    if (!selectedApplication?.userId) {
      alert("This candidate profile is not available yet.");
      return;
    }

    navigate(`/user-profile/${selectedApplication.userId}`);
  };

  const handleDownloadResume = async () => {
    if (!selectedApplication || !jobId) return;

    setDownloadingResume(true);
    try {
      const blob = await downloadJobApplicationResume(
        jobId,
        selectedApplication.id,
      );
      const pdfBlob =
        blob.type === "application/pdf"
          ? blob
          : new Blob([blob], { type: "application/pdf" });
      const fileName = `${selectedApplication.name.replace(/\s+/g, "_")}_Resume.pdf`;
      const objectUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Resume download error:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to download resume",
      );
    } finally {
      setDownloadingResume(false);
    }
  };

  const renderStatusControls = () => (
    <div className="mt-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Update Status
      </label>
      <div className="flex gap-2">
        <div className="flex-1 min-w-0">
          <RecruiterSelect
            name="statusDraft"
            value={statusDraft}
            onChange={(e) => setStatusDraft(e.target.value)}
            options={[
              { value: "pending", label: "Pending" },
              { value: "reviewed", label: "Reviewed" },
              { value: "shortlisted", label: "Shortlisted" },
              { value: "hired", label: "Hired" },
              { value: "rejected", label: "Rejected" },
            ]}
            placeholder="Select Status"
          />
        </div>
        <button
          type="button"
          onClick={handleStatusUpdate}
          disabled={updatingStatus || !hasStatusChange}
          className={`px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-60 shrink-0 ${
            hasStatusChange
              ? "bg-[#16730F] text-white hover:bg-[#145A0C]"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {updatingStatus ? "Saving..." : "Update"}
        </button>
      </div>
    </div>
  );

  const renderApplicationDetails = () => {
    if (!selectedApplication) return null;

    return (
      <>
        <div className="text-center mb-6">
          <ApplicantAvatar
            application={selectedApplication}
            containerClassName="w-20 h-20 rounded-full mx-auto overflow-hidden"
            textClassName="text-2xl"
          />
          <h3 className="text-lg font-bold mt-3">{selectedApplication.name}</h3>
          <p className="text-gray-500 text-sm">{selectedApplication.email}</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-gray-600">
            <FaPhone className="flex-shrink-0" />
            <span className="text-sm break-all">{selectedApplication.phone}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <FaMapMarkerAlt className="flex-shrink-0" />
            <span className="text-sm">
              {formatDisplayText(selectedApplication.location) || "—"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <FaBriefcase className="flex-shrink-0" />
            <span className="text-sm">
              {selectedApplication.experience} years experience
            </span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <FaGraduationCap className="flex-shrink-0" />
            <span className="text-sm">{selectedApplication.education}</span>
          </div>
        </div>

        {selectedApplication.skills?.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {selectedApplication.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {selectedApplication.coverLetter && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">Cover Letter</h4>
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
              {selectedApplication.coverLetter}
            </p>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleContactCandidate}
            disabled={!selectedApplication.userId}
            className="w-full bg-[#16730F] text-white py-3 rounded-xl font-semibold hover:bg-[#145A0C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaEnvelope className="inline mr-2" />
            View Candidate Profile
          </button>
          {selectedApplication.applicationMethod === "profile" ? (
            <div className="w-full border-2 border-[#16730F]/30 text-[#16730F] py-3 rounded-xl font-semibold bg-[#16730F]/5 text-center text-sm">
              Applied with Bejite Profile
            </div>
          ) : (
            selectedApplication.resume && (
              <button
                type="button"
                onClick={handleDownloadResume}
                disabled={downloadingResume}
                className="block w-full border-2 border-[#16730F] text-[#16730F] py-3 rounded-xl font-semibold hover:bg-green-50 transition-colors text-center disabled:opacity-60"
              >
                <FaDownload className="inline mr-2" />
                {downloadingResume ? "Downloading..." : "Download Resume"}
              </button>
            )
          )}
        </div>

        {renderStatusControls()}
      </>
    );
  };

  const filteredApplications = applications.filter((app) => {
    if (filter !== "all" && app.status !== filter) return false;
    if (
      searchTerm &&
      !app.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  if (loading) {
    return (
      <NewsFeedLayout showSidebars={false}>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16730F]"></div>
        </div>
      </NewsFeedLayout>
    );
  }

  return (
    <NewsFeedLayout showSidebars={false}>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-6 sm:mb-8">
          <button
            onClick={() => navigate("/employer/dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-[#16730F] mb-4 transition-colors"
          >
            <FaChevronLeft />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Job Applications
          </h1>
          <p className="text-gray-500 text-sm sm:text-base mt-1">
            {jobTitle} · Review and manage candidate applications
          </p>
        </div>

        {error && (
          <div className="max-w-7xl mx-auto mb-6 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Main Content - Responsive Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Applications List - Left Side */}
            <div className="w-full lg:w-2/3">
              {/* Filters */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#16730F] focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                    {[
                      "all",
                      "pending",
                      "reviewed",
                      "shortlisted",
                      "hired",
                      "rejected",
                    ].map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-3 sm:px-4 py-2 rounded-xl capitalize transition-colors whitespace-nowrap text-sm sm:text-base ${
                          filter === status
                            ? "bg-[#16730F] text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Applications Grid - Responsive */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredApplications.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-200">
                    No applications found for this job yet.
                  </div>
                ) : (
                  filteredApplications.map((app) => {
                  const isSelected = selectedApplication?.id === app.id;
                  return (
                    <div
                      key={app.id}
                      className={`bg-white rounded-2xl border-2 p-4 sm:p-5 cursor-pointer transition-all hover:shadow-lg active:scale-[0.99] relative ${
                        isSelected && window.innerWidth >= 1024
                          ? "border-[#16730F] bg-green-50/30 shadow-md"
                          : "border-gray-200 hover:border-[#16730F]/50"
                      }`}
                      onClick={() => handleCardClick(app)}
                    >
                      {/* Selected Badge for Desktop */}
                      {isSelected && window.innerWidth >= 1024 && (
                        <div className="absolute top-3 right-3">
                          <div className="bg-[#16730F] text-white rounded-full p-1">
                            <FaCheckCircle className="text-xs" />
                          </div>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <ApplicantAvatar
                            application={app}
                            containerClassName={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0 overflow-hidden ${
                              isSelected &&
                              window.innerWidth >= 1024 &&
                              !profilePhotoUrl(app.profilePhoto)
                                ? "bg-[#16730F]"
                                : ""
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <h3
                              className={`font-bold text-sm sm:text-base truncate ${
                                isSelected && window.innerWidth >= 1024
                                  ? "text-[#16730F]"
                                  : "text-gray-900"
                              }`}
                            >
                              {app.name}
                            </h3>
                            <p className="text-xs text-gray-500 truncate">
                              {app.email}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <FaMapMarkerAlt className="text-[10px] flex-shrink-0" />
                                <span className="truncate">
                                  {formatDisplayText(
                                    app.location?.split(",")[0],
                                  ) || "—"}
                                </span>
                              </span>
                              <span className="text-xs text-gray-500">
                                {app.experience}y exp
                              </span>
                              <span className="text-xs text-gray-500 hidden sm:inline">
                                {new Date(app.appliedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {app.skills.slice(0, 2).map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-gray-100 rounded-lg text-xs text-gray-600"
                                >
                                  {skill}
                                </span>
                              ))}
                              {app.skills.length > 2 && (
                                <span className="px-2 py-0.5 bg-gray-100 rounded-lg text-xs text-gray-500">
                                  +{app.skills.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <div
                            className={`inline-flex items-center justify-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap ${getMatchScoreColor(app.matchScore)}`}
                          >
                            {app.matchScore}%
                          </div>
                          <span
                            className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs capitalize whitespace-nowrap ${
                              app.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : app.status === "reviewed"
                                  ? "bg-blue-100 text-blue-700"
                                  : app.status === "shortlisted"
                                    ? "bg-green-100 text-green-700"
                                    : app.status === "hired"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-red-100 text-red-700"
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
                )}
              </div>
            </div>

            {/* Right Panel - Desktop only */}
            <div className="hidden lg:block lg:w-1/3 lg:self-start lg:sticky lg:top-4 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto nfl-scroll">
              <div className="bg-white rounded-2xl border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">
                    Application Details
                  </h2>
                  <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                    <FaInfoCircle className="text-xs" />
                    Click on any candidate card to view details
                  </p>
                </div>

                {selectedApplication ? (
                  <div className="p-6">{renderApplicationDetails()}</div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaInfoCircle className="text-2xl text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">
                      No application selected
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Click on a candidate card to view details
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Application Details
              </h2>
              <button
                onClick={closeModal}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-5 pb-8">{renderApplicationDetails()}</div>
          </div>
        </div>
      )}
    </NewsFeedLayout>
  );
};

export default JobApplications;
