import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBriefcase,
  FaUsers,
  FaClock,
  FaRobot,
  FaPlus,
  FaCheckCircle,
  FaTrash,
  FaEdit,
} from "react-icons/fa";
import NewsFeedLayout from "../../components/layout/NewsFeedLayout";
import {
  getEmployerDashboard,
  deleteEmployerJob,
} from "../../services/employerApi";

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingJobId, setDeletingJobId] = useState(null);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getEmployerDashboard({ status: statusFilter, listing_kind: "job_posting" });

      if (response?.success) {
        setJobs(response.data?.jobs || []);
        setStats(
          response.data?.stats || {
            totalJobs: 0,
            activeJobs: 0,
            totalApplications: 0,
            totalRevenue: 0,
          },
        );
      } else {
        throw new Error(response?.message || "Failed to load dashboard");
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load employer dashboard",
      );
      setJobs([]);
      setStats({
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
        totalRevenue: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleDeleteJob = async (job) => {
    const confirmed = window.confirm(
      `Delete "${job.title}"? This will permanently remove the job and all applications. This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingJobId(job.id);
    setError(null);

    try {
      const response = await deleteEmployerJob(job.id);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to delete job");
      }

      setJobs((current) => current.filter((entry) => entry.id !== job.id));
      setStats((current) => ({
        ...current,
        totalJobs: Math.max(0, current.totalJobs - 1),
        activeJobs:
          job.status === "active"
            ? Math.max(0, current.activeJobs - 1)
            : current.activeJobs,
        totalApplications: Math.max(
          0,
          current.totalApplications - (job.applications || 0),
        ),
      }));
    } catch (err) {
      console.error("Delete job error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete job vacancy",
      );
    } finally {
      setDeletingJobId(null);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2 flex items-center gap-2">
            {value}
          </p>
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
        >
          <Icon className="text-white text-xl" />
        </div>
      </div>
    </div>
  );

  const JobCard = ({ job }) => {
    const isDeleting = deletingJobId === job.id;

    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow h-full flex  flex-col min-w-0">
        <div className="mb-3 sm:mb-4 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 break-words min-w-0 flex-1">
              {job.title}
            </h3>
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                  job.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {job.status === "active" ? "Active" : "Expired"}
              </span>
              <button
                type="button"
                onClick={() => navigate(`/employer/job/${job.id}/edit`)}
                aria-label={`Edit ${job.title}`}
                title="Edit job"
                className="p-1.5 rounded-lg text-gray-400 hover:text-[#16730F] hover:bg-green-50 transition-colors"
              >
                <FaEdit className="text-xs sm:text-sm" />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteJob(job)}
                disabled={isDeleting}
                aria-label={`Delete ${job.title}`}
                title="Delete job"
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaTrash className="text-xs sm:text-sm" />
              </button>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed break-words">
            {[job.industry, job.workMode, job.country]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-1 sm:gap-4 mb-3 sm:mb-4 pt-3 sm:pt-4 border-t border-gray-100">
          <div className="min-w-0 text-center sm:text-center">
            <p className="text-lg sm:text-2xl font-bold text-[#16730F] leading-none">
              {job.applications}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 leading-tight mt-1">
              <span className="sm:hidden">Apps</span>
              <span className="hidden sm:inline">Applications</span>
            </p>
          </div>
          <div className="min-w-0 text-center">
            <div className="flex items-center justify-center gap-0.5 sm:gap-1 min-w-0">
              <FaClock className="text-orange-500 text-[10px] sm:text-sm shrink-0" />
              <p className="text-[11px] sm:text-sm font-medium text-gray-700 leading-tight">
                {job.timeLeft}
              </p>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 leading-tight mt-1">
              Time Left
            </p>
          </div>
          <div className="min-w-0 text-center">
            <p className="text-lg sm:text-sm font-medium text-gray-700 leading-none">
              {job.extensions}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 leading-tight mt-1">
              <span className="sm:hidden">Ext.</span>
              <span className="hidden sm:inline">Extensions</span>
            </p>
          </div>
        </div>

        <div className="flex flex-row gap-2 mt-auto">
          {job.status === "active" ? (
            <>
              <button
                type="button"
                onClick={() => navigate(`/employer/job/${job.id}/applications`)}
                className="flex-1 min-w-0 bg-[#16730F] text-white py-2 px-2 sm:px-3 rounded-xl hover:bg-[#145A0C] transition-colors text-[11px] sm:text-sm font-medium"
              >
                <span className="sm:hidden">Applications</span>
                <span className="hidden sm:inline">View Applications</span>
              </button>
              <button
                type="button"
                onClick={() => navigate(`/employer/job/${job.id}/extend`)}
                className="shrink-0 py-2 px-3 sm:px-4 border border-[#16730F] text-[#16730F] rounded-xl hover:bg-green-50 transition-colors text-[11px] sm:text-sm font-medium"
              >
                Extend
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate(`/employer/job/${job.id}/recruit`)}
                className="flex-1 min-w-0 bg-gradient-to-r from-[#16730F] to-[#1A3E32] text-white py-2 px-2 sm:px-3 rounded-xl hover:opacity-90 transition-opacity text-[11px] sm:text-sm font-medium flex items-center justify-center gap-1 sm:gap-2"
              >
                <FaRobot className="shrink-0 text-xs sm:text-sm" />
                <span className="truncate sm:hidden">Recruit ASE</span>
                <span className="hidden sm:inline">Recruit with ASE</span>
              </button>
              <button
                type="button"
                onClick={() => navigate(`/employer/job/${job.id}/repost`)}
                className="shrink-0 py-2 px-3 sm:px-4 border border-[#16730F] text-[#16730F] rounded-xl hover:bg-green-50 transition-colors text-[11px] sm:text-sm font-medium"
              >
                Repost
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

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
      <div
        className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-8 flex flex-col"
        data-testid="employer-dashboard"
      >
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Employer Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your job vacancies and candidate applications
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={FaBriefcase}
            title="Total Jobs"
            value={stats.totalJobs}
            color="bg-blue-500"
          />
          <StatCard
            icon={FaCheckCircle}
            title="Active Jobs"
            value={stats.activeJobs}
            color="bg-green-500"
          />
          <StatCard
            icon={FaUsers}
            title="Total Applications"
            value={stats.totalApplications}
            color="bg-purple-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => navigate("/employer/create-job")}
            className="bg-gradient-to-r from-[#16730F] to-[#1A3E32] text-white rounded-2xl p-6 text-left hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <FaPlus className="text-2xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Post a New Job</h3>
                <p className="text-green-100 text-sm mt-1">
                  Create and publish a job vacancy
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/employer/bulk-create")}
            className="bg-white border-2 border-[#16730F] text-[#16730F] rounded-2xl p-6 text-left hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <FaBriefcase className="text-2xl text-[#16730F]" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Post Multiple Jobs</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Bulk upload job vacancies
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Jobs List */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Your Job Vacancies
              </h2>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "all", label: "All" },
                  { key: "active", label: "Active" },
                  { key: "expired", label: "Expired" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setStatusFilter(key)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      statusFilter === key
                        ? "bg-[#16730F] text-white font-medium"
                        : "text-gray-600 hover:text-[#16730F]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="px-6 py-4 bg-red-50 text-red-700 text-sm border-b border-red-100">
              {error}
            </div>
          )}

          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {jobs.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                {statusFilter === "all"
                  ? "No job vacancies yet. Post your first job to get started."
                  : `No ${statusFilter} jobs found.`}
              </div>
            ) : (
              jobs.map((job) => <JobCard key={job.id} job={job} />)
            )}
          </div>
        </div>

        {/* ASE Promotion */}
        <div className="mt-8 bg-gradient-to-r from-[#1A3E32] to-[#16730F] rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-2xl font-bold mb-2">
                Advanced Search Engine (ASE)
              </h3>
              <p className="text-green-100">
                Find the best candidates with AI-powered matching technology
              </p>
            </div>
            <button
              onClick={() => navigate("/subscription-pricing")}
              className="px-6 py-3 bg-white text-[#16730F] rounded-xl font-semibold hover:shadow-lg transition-shadow"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </NewsFeedLayout>
  );
};

export default EmployerDashboard;
