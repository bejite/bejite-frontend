import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import {
  Search,
  Building2,
  MapPin,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  UserRound,
  Eye,
} from "lucide-react";
import AdminJobDetailModal from "../../components/admin/AdminJobDetailModal";

const SEGMENTS = [
  {
    id: "recruiter",
    label: "Recruiter Listings",
    description: "Jobs posted by recruiters and employers.",
  },
  {
    id: "jobseeker",
    label: "Jobseeker Posts",
    description: "Open-to-work / availability posts from jobseekers.",
  },
];

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "expired", label: "Expired" },
];

const listingStatusMeta = (job) => {
  const listingStatus = String(job.listing_status || "").toLowerCase();
  if (listingStatus === "active") {
    return {
      label: "Active",
      className: "bg-green-50 text-green-700",
    };
  }
  return {
    label: "Expired",
    className: "bg-amber-50 text-amber-800",
  };
};

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [segment, setSegment] = useState("recruiter");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState({
    all: 0,
    recruiter: 0,
    jobseeker: 0,
    active: 0,
    expired: 0,
    status_all: 0,
  });
  const [selectedJobId, setSelectedJobId] = useState(null);
  const itemsPerPage = 10;

  const activeSegment =
    SEGMENTS.find((item) => item.id === segment) || SEGMENTS[0];
  const isJobseekerSegment = segment === "jobseeker";

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, segment, statusFilter]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(itemsPerPage),
          source: segment,
          status: statusFilter,
        });

        if (debouncedSearch) {
          params.append("q", debouncedSearch);
        }

        const response = await axiosInstance.get(
          `/api/admin/data/jobs?${params.toString()}`,
        );
        setJobs(response.data.jobs || []);

        if (response.data.pagination) {
          setTotalJobs(response.data.pagination.total);
          setTotalPages(response.data.pagination.pages);
        } else {
          setTotalJobs((response.data.jobs || []).length);
          setTotalPages(1);
        }

        if (response.data.counts) {
          setCounts({
            all: response.data.counts.all ?? 0,
            recruiter: response.data.counts.recruiter ?? 0,
            jobseeker: response.data.counts.jobseeker ?? 0,
            active: response.data.counts.active ?? 0,
            expired: response.data.counts.expired ?? 0,
            status_all: response.data.counts.status_all ?? 0,
          });
        }
      } catch (error) {
        console.error("Error fetching jobs", error);
        toast.error("Failed to load jobs data");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [currentPage, debouncedSearch, segment, statusFilter]);

  const startIndex = totalJobs === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalJobs);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push("...");
      pageNumbers.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(1);
      pageNumbers.push("...");
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      pageNumbers.push("...");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push("...");
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const posterName = (job) => {
    const name = [job.poster_first_name, job.poster_last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
    return name || job.poster_email || "Unknown poster";
  };

  const statusFilterCount = (id) => {
    if (id === "active") return counts.active;
    if (id === "expired") return counts.expired;
    return counts.status_all || counts.active + counts.expired;
  };

  return (
    <div
      className="max-w-7xl mx-auto w-full space-y-6"
      data-testid="admin-jobs-page"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Job Listings</h1>
          <p className="text-gray-500 text-sm mt-1">
            {activeSegment.description}
            {counts.all > 0 && (
              <span className="ml-1 text-[#16730F] font-medium">
                ({counts.all} total across platform)
              </span>
            )}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder={
              isJobseekerSegment
                ? "Search posts or posters..."
                : "Search jobs or companies..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#16730F] focus:ring-1 focus:ring-[#16730F] transition"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      {/* Segment tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
        {SEGMENTS.map((item) => {
          const isActive = segment === item.id;
          const count =
            item.id === "recruiter" ? counts.recruiter : counts.jobseeker;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSegment(item.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                isActive
                  ? "bg-[#16730F] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {item.id === "recruiter" ? (
                <Building2 size={16} />
              ) : (
                <UserRound size={16} />
              )}
              {item.label}
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {count.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active / Expired filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 mr-1">
          Listing status
        </span>
        {STATUS_FILTERS.map((item) => {
          const isActive = statusFilter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setStatusFilter(item.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-green-800 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {item.label}
              <span
                className={`ml-1.5 text-xs ${
                  isActive ? "text-white/80" : "text-gray-400"
                }`}
              >
                {statusFilterCount(item.id).toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">
                  {isJobseekerSegment ? "Post Details" : "Job Details"}
                </th>
                <th className="px-6 py-4">
                  {isJobseekerSegment ? "Posted By" : "Company"}
                </th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Posted Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="animate-spin inline-block rounded-full h-8 w-8 border-b-2 border-[#16730F]"></div>
                    <p className="text-gray-500 mt-2">Loading jobs...</p>
                  </td>
                </tr>
              ) : jobs.length > 0 ? (
                jobs.map((job) => {
                  const statusMeta = listingStatusMeta(job);
                  return (
                    <tr
                      key={job.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                              isJobseekerSegment
                                ? "bg-blue-50 text-blue-600"
                                : "bg-green-50 text-green-600"
                            }`}
                          >
                            {isJobseekerSegment ? (
                              <UserRound size={20} />
                            ) : (
                              <Briefcase size={20} />
                            )}
                          </div>
                          <div>
                            <p className="max-w-74 text-sm font-medium text-gray-900 break-words whitespace-normal">
                              {job.title}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <MapPin size={12} /> {job.location || "Remote"}
                              </span>
                              <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                {job.work_type || "Full-time"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isJobseekerSegment ? (
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-800 font-medium flex items-center gap-1.5">
                              <UserRound size={14} className="text-gray-400" />
                              {posterName(job)}
                            </span>
                            <span className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                              {job.industry_sector || job.poster_email || "—"}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-800 font-medium flex items-center gap-1.5">
                              <Building2 size={14} className="text-gray-400" />
                              {job.company || "Unknown Company"}
                            </span>
                            <span className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                              {job.industry_sector}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex w-fit items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusMeta.className}`}
                          >
                            {statusMeta.label}
                          </span>
                          {job.status &&
                            job.status !== "Active" &&
                            statusMeta.label === "Expired" && (
                              <span className="text-[11px] text-gray-400 capitalize">
                                {job.status}
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(job.created_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setSelectedJobId(job.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#16730F] hover:bg-[#16730F]/10 rounded-lg transition-colors"
                          >
                            <Eye size={16} />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {debouncedSearch || statusFilter !== "all"
                      ? `No ${isJobseekerSegment ? "jobseeker posts" : "recruiter listings"} match your filters.`
                      : `No ${isJobseekerSegment ? "jobseeker posts" : "recruiter listings"} found.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalJobs > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium text-gray-700">{startIndex}</span>{" "}
                to <span className="font-medium text-gray-700">{endIndex}</span>{" "}
                of{" "}
                <span className="font-medium text-gray-700">{totalJobs}</span>{" "}
                {isJobseekerSegment ? "posts" : "listings"}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1
                      ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-gray-300"
                      }`}
                >
                  <ChevronLeft size={16} />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) =>
                    page === "..." ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-3 py-2 text-gray-400"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`min-w-[40px] h-10 px-3 rounded-lg text-sm font-medium transition-all duration-200
                            ${
                              currentPage === page
                                ? "bg-[#16730F] text-white shadow-md shadow-green-200"
                                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                            }`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1
                      ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-gray-300"
                      }`}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedJobId != null && (
        <AdminJobDetailModal
          jobId={selectedJobId}
          onClose={() => setSelectedJobId(null)}
        />
      )}
    </div>
  );
};

export default AdminJobs;
