import { useState, useEffect } from "react";
import { LuSend } from "react-icons/lu";
import { RxCross1 } from "react-icons/rx";
import { API_URL } from "../../config";
import { getEmployerDashboard } from "../../services/employerApi";

const BatchInterviewInviteModal = ({
  isOpen,
  onClose,
  candidates = [],
  jobId = null,
  jobTitle = "",
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    job_id: "",
    job_title: "",
    interview_date: "",
    interview_time: "",
    interview_type: "online",
    venue: "",
    meeting_link: "",
    message: "",
  });
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const lockedJobId = jobId != null && jobId !== "" ? String(jobId) : "";

  useEffect(() => {
    if (!isOpen) return;

    if (lockedJobId) {
      setFormData((prev) => ({
        ...prev,
        job_id: lockedJobId,
        job_title: jobTitle || prev.job_title,
      }));
      return;
    }

    let cancelled = false;
    const loadJobs = async () => {
      setJobsLoading(true);
      try {
        // Same source as Recruitment Management (include Closed / expired).
        const response = await getEmployerDashboard({
          status: "all",
          listing_kind: "recruitment",
        });
        const list = response?.data?.jobs || [];
        if (!cancelled) {
          setJobs(list);
          const matched = jobTitle
            ? list.find(
                (j) =>
                  String(j.title || "").toLowerCase() ===
                  String(jobTitle).toLowerCase(),
              )
            : null;
          if (matched) {
            setFormData((prev) => ({
              ...prev,
              job_id: String(matched.id),
              job_title: matched.title,
            }));
          } else if (jobTitle) {
            setFormData((prev) => ({ ...prev, job_title: jobTitle }));
          }
        }
      } catch {
        if (!cancelled) setJobs([]);
      } finally {
        if (!cancelled) setJobsLoading(false);
      }
    };
    loadJobs();
    return () => {
      cancelled = true;
    };
  }, [isOpen, lockedJobId, jobTitle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleJobSelect = (e) => {
    const selectedId = e.target.value;
    const selected = jobs.find((j) => String(j.id) === String(selectedId));
    setFormData((prev) => ({
      ...prev,
      job_id: selectedId,
      job_title: selected?.title || prev.job_title,
    }));
  };

  const handleTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      interview_type: type,
      venue: type === "offline" ? prev.venue : "",
      meeting_link: type === "online" ? prev.meeting_link : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("token");

      if (!token) {
        throw new Error("You must be logged in to send invitations");
      }

      if (!formData.job_id) {
        throw new Error("Please select a recruitment / job");
      }

      if (!formData.interview_date || !formData.interview_time) {
        throw new Error("Please enter interview date and time");
      }

      if (formData.interview_type === "offline" && !formData.venue) {
        throw new Error("Please enter the venue address for offline interview");
      }

      if (formData.interview_type === "online" && !formData.meeting_link) {
        throw new Error("Please enter the meeting link for online interview");
      }

      const payload = {
        job_id: Number(formData.job_id),
        job_title: formData.job_title,
        interview_date: formData.interview_date,
        interview_time: formData.interview_time,
        interview_type: formData.interview_type,
        venue: formData.interview_type === "offline" ? formData.venue : null,
        meeting_link:
          formData.interview_type === "online" ? formData.meeting_link : null,
        message: formData.message,
      };

      const results = await Promise.allSettled(
        candidates.map((candidate) =>
          fetch(`${API_URL}/api/interview-invitations`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
            body: JSON.stringify({
              ...payload,
              candidate_id: candidate.candidateId,
            }),
          }).then(async (response) => {
            const data = await response.json();
            if (!response.ok) {
              throw new Error(data.error || "Failed to send invitation");
            }
            return data;
          }),
        ),
      );

      const failed = results.filter((r) => r.status === "rejected");
      const succeeded = results.filter((r) => r.status === "fulfilled");

      if (succeeded.length === 0) {
        throw new Error(
          failed[0]?.reason?.message || "Failed to send invitations",
        );
      }

      if (onSuccess) {
        onSuccess(succeeded.length, failed.length);
      }

      setFormData({
        job_id: lockedJobId || "",
        job_title: jobTitle || "",
        interview_date: "",
        interview_time: "",
        interview_type: "online",
        venue: "",
        meeting_link: "",
        message: "",
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto nfl-scroll scroll-smooth">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#16730F]">
            Send Interview Invites
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <RxCross1 className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 bg-[#6B8E23]/10 border-b border-gray-200">
          <p className="text-sm text-gray-700">
            Sending to{" "}
            <span className="font-semibold text-[#16730F]">
              {candidates.length}
            </span>{" "}
            candidate{candidates.length !== 1 ? "s" : ""}
          </p>
          <p className="text-xs text-gray-500 mt-1 truncate">
            {candidates.map((c) => c.name).join(", ")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#16730F] mb-1">
              Recruitment / Job *
            </label>
            {lockedJobId ? (
              <input
                type="text"
                value={formData.job_title || jobTitle || `Job #${lockedJobId}`}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50 text-gray-700"
              />
            ) : (
              <>
                <select
                  name="job_id"
                  value={formData.job_id}
                  onChange={handleJobSelect}
                  required
                  disabled={jobsLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16730F] bg-white"
                >
                  <option value="">
                    {jobsLoading
                      ? "Loading recruitments…"
                      : "Select a recruitment exercise"}
                  </option>
                  {jobs.map((job) => {
                    const closed =
                      job.status !== "active" ||
                      String(job.dbStatus || "").toLowerCase() === "closed";
                    return (
                      <option key={job.id} value={job.id}>
                        {job.title}
                        {closed ? " (Closed)" : ""}
                      </option>
                    );
                  })}
                </select>
                {jobs.length === 0 && !jobsLoading && (
                  <p className="text-xs text-amber-700 mt-1">
                    No recruitments found. Create one in Recruitment Management
                    first.
                  </p>
                )}
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#16730F] mb-1">
                Interview Date *
              </label>
              <input
                type="date"
                name="interview_date"
                value={formData.interview_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16730F]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#16730F] mb-1">
                Interview Time *
              </label>
              <input
                type="time"
                name="interview_time"
                value={formData.interview_time}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16730F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#16730F] mb-2">
              Interview Type *
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleTypeChange("online")}
                className={`flex-1 py-2 px-4 rounded-xl border-2 transition-colors ${
                  formData.interview_type === "online"
                    ? "border-[#16730F] bg-[#16730F]/10 text-[#16730F]"
                    : "border-gray-300 text-gray-600 hover:border-[#16730F]"
                }`}
              >
                Online
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("offline")}
                className={`flex-1 py-2 px-4 rounded-xl border-2 transition-colors ${
                  formData.interview_type === "offline"
                    ? "border-[#16730F] bg-[#16730F]/10 text-[#16730F]"
                    : "border-gray-300 text-gray-600 hover:border-[#16730F]"
                }`}
              >
                Offline
              </button>
            </div>
          </div>

          {formData.interview_type === "offline" ? (
            <div>
              <label className="block text-sm font-medium text-[#16730F] mb-1">
                Venue Address *
              </label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="Enter physical address"
                required={formData.interview_type === "offline"}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16730F]"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-[#16730F] mb-1">
                Meeting Link *
              </label>
              <input
                type="url"
                name="meeting_link"
                value={formData.meeting_link}
                onChange={handleChange}
                placeholder="https://meet.google.com/..."
                required={formData.interview_type === "online"}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16730F]"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#16730F] mb-1">
              Custom Message (Optional)
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write a custom message to the candidates..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16730F] resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border-2 border-[#EB5757] text-[#EB5757] rounded-xl font-medium hover:bg-red-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-[#16730F] text-white rounded-xl font-medium hover:bg-[#125a0c] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LuSend className="w-4 h-4" />
                  Send {candidates.length} Invite
                  {candidates.length !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BatchInterviewInviteModal;
