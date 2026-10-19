import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import usersData from "../data/usersData";
import { getAccessToken } from "../utils/tokenManager";

const JobConnection = () => {
  const [addedUsers, setAddedUsers] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Get email, role & mode from URL query params
  const params = new URLSearchParams(location.search);
  const email = params.get("email");
  const role = params.get("role");
  const mode = params.get("mode");

  console.log("JobConnection loaded. Email:", email, "Role:", role, "Mode:", mode);

  const handleAdd = (id) => {
    if (!addedUsers.includes(id)) {
      const newAdded = [...addedUsers, id];
      setAddedUsers(newAdded);
      console.log("Added user id:", id, "Current added users:", newAdded);
    }
  };

  const handleContinue = async () => {
    if (addedUsers.length < 10) {
      toast.error("Please connect with at least 10 users.");
      return;
    }

    console.log("Submitting followings to API:", addedUsers);

    try {
      const token = getAccessToken();
      if (!token) {
        toast.error("Session expired. Please verify your email again.");
        return;
      }
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/complete-signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role, mode, followings: addedUsers }),
      });

      const data = await res.json();
      console.log("Complete signup response:", data);

      if (res.ok) {
        toast.success(data.message || "Signup completed!");
        navigate("/"); // redirect to login
      } else {
        toast.error(data.error || "Failed to complete signup.");
      }
    } catch (error) {
      console.error("CompleteSignup error:", error);
      toast.error("Something went wrong. Try again later.");
    }
  };

  return (
    <div className="bg-white min-h-screen relative">
      <div className="w-full px-4 py-6 flex justify-start items-center max-w-screen-xl mx-auto">
        <img src="/assets/images/logo.png" alt="logo" className="h-10" />
      </div>

      <div className="flex flex-col items-center justify-start px-4 mx-auto w-full max-w-4xl pb-12">
        <div className="w-full max-w-3xl text-center mb-10 mt-12">
          <p className="text-3xl sm:text-4xl md:text-5xl font-norican font-semibold text-[#E63357]">
            Connect With Users
          </p>
          <p className="text-[#FF6F61] font-normal text-sm sm:text-base md:text-lg mt-2">
            Connect with at least 10 users to complete your signup
          </p>
        </div>

        <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-3xl mb-6">
          {usersData.map((user) => (
            <div
              key={user.id}
              className={`p-4 rounded-lg border cursor-pointer ${
                addedUsers.includes(user.id) ? "bg-[#16730F]/20" : "bg-white"
              }`}
              onClick={() => handleAdd(user.id)}
            >
              {user.name}
            </div>
          ))}
        </div>

        <button
          onClick={handleContinue}
          className={`px-6 py-3 rounded-lg text-white font-semibold ${
            addedUsers.length >= 10 ? "bg-[#16730F] hover:bg-[#145a0c]" : "bg-[#16730F40] cursor-not-allowed"
          }`}
          disabled={addedUsers.length < 10}
        >
          Complete Signup
        </button>
      </div>
    </div>
  );
};

export default JobConnection;
