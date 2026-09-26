import React, { useState, useEffect } from "react";
import { API_URL } from "../../config";
import { useNavigate } from "react-router-dom";

const InterviewNotifications = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken") || localStorage.getItem("authToken") || localStorage.getItem("token");

      if (!token) {
        setError("Please log in to view your invitations");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/interview-invitations/candidate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

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
  };

  const handleAccept = async (invitationId) => {
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("authToken") || localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/interview-invitations/${invitationId}/accept`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to accept invitation");
      }

      // Update local state
      setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === invitationId ? { ...inv, status: "accepted" } : inv
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDecline = async (invitationId) => {
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("authToken") || localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/interview-invitations/${invitationId}/decline`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to decline invitation");
      }

      // Update local state
      setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === invitationId ? { ...inv, status: "declined" } : inv
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;

    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? "s" : ""} remaining`;
    }

    return `${hours}h ${minutes}m remaining`;
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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#16730F] text-center mb-6">
          Interview Invitations
        </h1>

        {invitations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-500">No pending interview invitations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#16730F]">
                      {invitation.job_title || "Interview Invitation"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      From: {invitation.employer_first_name} {invitation.employer_last_name}
                      {invitation.company_name && ` (${invitation.company_name})`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        invitation.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : invitation.status === "accepted"
                          ? "bg-green-100 text-green-800"
                          : invitation.status === "declined"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p className="font-medium">
                        {new Date(invitation.interview_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Time</p>
                      <p className="font-medium">
                        {new Date(`2000-01-01T${invitation.interview_time}`).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Type</p>
                      <p className="font-medium capitalize">{invitation.interview_type}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Location</p>
                      <p className="font-medium">
                        {invitation.interview_type === "online"
                          ? invitation.meeting_link
                          : invitation.venue}
                      </p>
                    </div>
                  </div>
                </div>

                {invitation.message && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Message:</p>
                    <p className="text-sm">{invitation.message}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-xs text-red-500">
                    {getTimeRemaining(invitation.expires_at)}
                  </p>

                  {invitation.status === "pending" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleDecline(invitation.id)}
                        className="px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAccept(invitation.id)}
                        className="px-4 py-2 bg-[#16730F] text-white rounded-lg hover:bg-[#125a0c] transition-colors text-sm font-medium"
                      >
                        Accept
                      </button>
                    </div>
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

export default InterviewNotifications;
