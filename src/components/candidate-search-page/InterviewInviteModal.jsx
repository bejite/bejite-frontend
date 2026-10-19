import React, { useState, useEffect } from "react";
import { API_URL } from "../../config";
import { LuSend } from "react-icons/lu";
import { RxCross1 } from "react-icons/rx";
import { getEmployerDashboard } from "../../services/employerApi";

const InterviewInviteModal = ({ isOpen, onClose, candidate, onSuccess }) => {
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

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    const loadJobs = async () => {
      setJobsLoading(true);
      try {
        // Same source as Recruitment Management (not job-board "active" only).
        // Closed / expired exercises still need to accept invites into the pipeline.
        const response = await getEmployerDashboard({
          status: "all",
          listing_kind: "recruitment",
        });
        const list = response?.data?.jobs || [];
        if (!cancelled) setJobs(list);
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
  }, [isOpen]);

  useEffect(() => {
    if (!candidate || !isOpen) return;

    setFormData((prev) => {
      const hint = candidate.jobTitle || "";
      const matched = jobs.find(
        (j) =>
          String(j.title || "").toLowerCase() === String(hint).toLowerCase(),
      );
      return {
        ...prev,
        job_id: matched ? String(matched.id) : prev.job_id,
        job_title: matched?.title || hint || prev.job_title,
      };
    });
  }, [candidate, isOpen, jobs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleJobSelect = (e) => {
    const jobId = e.target.value;
    const selected = jobs.find((j) => String(j.id) === String(jobId));
    setFormData((prev) => ({
      ...prev,
      job_id: jobId,
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
        setError("You must be logged in to send invitations");
        setLoading(false);
        return;
      }

      if (!formData.interview_date || !formData.interview_time) {
        setError("Please enter interview date and time");
        setLoading(false);
        return;
      }

      if (formData.interview_type === "offline" && !formData.venue) {
        setError("Please enter the venue address for offline interview");
        setLoading(false);
        return;
      }

      if (formData.interview_type === "online" && !formData.meeting_link) {
        setError("Please enter the meeting link for online interview");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/interview-invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          candidate_id: candidate.id,
          job_id: formData.job_id ? Number(formData.job_id) : null,
          job_title: formData.job_title || null,
          interview_date: formData.interview_date,
          interview_time: formData.interview_time,
          interview_type: formData.interview_type,
          venue: formData.interview_type === "offline" ? formData.venue : null,
          meeting_link:
            formData.interview_type === "online" ? formData.meeting_link : null,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send invitation");
      }

      if (onSuccess) {
        onSuccess(data.data);
      }

      setFormData({
        job_id: "",
        job_title: "",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto nfl-scroll scroll-smooth">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#16730F]">
            Send Interview Invite
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <RxCross1 className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {candidate && (
          <div className="p-4 bg-[#6B8E23]/10 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#6B8E23] flex items-center justify-center text-white font-bold">
                {candidate.initials || candidate.name?.charAt(0) || "?"}
              </div>
              <div>
                <p className="font-medium text-[#16730F]">{candidate.name}</p>
                <p className="text-sm text-gray-600">{candidate.jobTitle}</p>
                <p className="text-sm text-gray-500">{candidate.location}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#16730F] mb-1">
              Recruitment / Job{" "}
              <span className="font-normal text-gray-500">(optional)</span>
            </label>
            <select
              name="job_id"
              value={formData.job_id}
              onChange={handleJobSelect}
              disabled={jobsLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16730F] bg-white"
            >
              <option value="">
                {jobsLoading
                  ? "Loading recruitments…"
                  : "Select a recruitment exercise (optional)"}
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
              <p className="text-xs text-gray-500 mt-1">
                No recruitments found. You can still send the invite without
                linking one.
              </p>
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
              Message (optional)
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={3}
              placeholder="Add a personal note..."
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16730F] resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-[#16730F] text-white rounded-xl font-medium hover:bg-[#125B0C] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <LuSend className="w-4 h-4" />
              {loading ? "Sending…" : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewInviteModal;
