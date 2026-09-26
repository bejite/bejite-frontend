import React, { useState, useEffect, useCallback } from "react";
import { API_URL } from "../../config";
import { useNavigate } from "react-router-dom";

const SentInvitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const fetchInvitations = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken") || localStorage.getItem("authToken") || localStorage.getItem("token");

      if (!token) {
        setError("Please log in to view your invitations");
        setLoading(false);
        return;
      }

      const queryParams = new URLSearchParams();
      if (filter !== "all") {
        queryParams.append("status", filter);
      }

      const response = await fetch(
        `${API_URL}/api/interview-invitations/employer?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch invitations");
      }

      setInvitations(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-green-100 text-green-800",
      declined: "bg-red-100 text-red-800",
      expired: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          statusClasses[status] || statusClasses.pending
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#16730F]"></div>
          <p className="text-[#16730F] mt-4">Loading invitations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-md">
          <p className="text-red-500 text-center">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 w-full py-2 bg-[#16730F] text-white rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#16730F] text-center mb-6">
          Sent Interview Invitations
        </h1>

        {/* Filter Tabs */}
        <div className="flex justify-center gap-2 mb-6">
          {["all", "pending", "accepted", "declined", "expired"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? "bg-[#16730F] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {invitations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-500">No invitations found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#6B8E23] flex items-center justify-center text-white font-bold">
                      {invitation.first_name?.[0]}
                      {invitation.last_name?.[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#16730F]">
                        {invitation.first_name} {invitation.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {invitation.candidate_title || "Candidate"}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(invitation.status)}
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Job Title</p>
                      <p className="font-medium">
                        {invitation.job_title || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p className="font-medium">
                        {formatDate(invitation.interview_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Time</p>
                      <p className="font-medium">
                        {formatTime(invitation.interview_time)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Type</p>
                      <p className="font-medium capitalize">
                        {invitation.interview_type}
                      </p>
                    </div>
                  </div>

                  {(invitation.venue || invitation.meeting_link) && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-gray-500 text-sm">
                        {invitation.interview_type === "online" ? "Meeting Link:" : "Venue:"}
                      </p>
                      <p className="font-medium text-[#16730F]">
                        {invitation.interview_type === "online"
                          ? invitation.meeting_link
                          : invitation.venue}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <p>Sent: {formatDate(invitation.created_at)}</p>
                  {invitation.status === "accepted" && (
                    <p className="text-green-600 font-medium">
                      ✓ Candidate accepted the invitation
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SentInvitations;
