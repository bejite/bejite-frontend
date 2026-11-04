import React, { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Plus,
} from "lucide-react";
import { toast } from "react-toastify";
import NewsFeedLayout from "../../../components/layout/NewsFeedLayout";
import RecruitmentStatCard from "../../../components/recruitment-management/RecruitmentStatCard";
import {
  ELearningManagementFilterBar,
  RecruiterCoursesTable,
  RecruiterCourseViewModal,
} from "../../../components/elearning";
import { isRecruiterAccount } from "../../../services/accountDelegationService";
import {
  deleteRecruiterCourse,
  getRecruiterManagedCourses,
  updateRecruiterCourseStatus,
} from "../../../services/elearningService";
import { getUser, mergeAuthUsers } from "../../../utils/tokenManager";

const PAGE_SIZE = 5;

export default function ELearningManagementPage() {
  const navigate = useNavigate();
  const reduxUser = useSelector((state) => state.auth?.user);
  const resolvedUser = useMemo(
    () => mergeAuthUsers(getUser() || {}, reduxUser || {}),
    [reduxUser]
  );

  const [courses, setCourses] = useState(() => getRecruiterManagedCourses());

  // Draft filter inputs vs applied filter state
  const [searchInput, setSearchInput] = useState("");
  const [courseFilterInput, setCourseFilterInput] = useState("all");
  const [statusFilterInput, setStatusFilterInput] = useState("all");
  const [dateFromInput, setDateFromInput] = useState("2026-06-10");
  const [dateToInput, setDateToInput] = useState("2026-06-17");

  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    courseFilter: "all",
    statusFilter: "all",
    dateFrom: "",
    dateTo: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const stats = useMemo(() => {
    const total = courses.length;
    const drafts = courses.filter((c) => c.status === "draft").length;
    const published = courses.filter((c) => c.status === "published").length;
    const inReview = courses.filter((c) => c.status === "in_review").length;
    return { total, drafts, published, inReview };
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const query = appliedFilters.search.trim().toLowerCase();

    return courses.filter((course) => {
      // Hide archived courses in default view unless explicitly filtered to "archived"
      if (
        appliedFilters.statusFilter === "all" &&
        course.status === "archived"
      ) {
        return false;
      }

      if (query) {
        const haystack = `${course.title || ""} ${course.summary || ""} ${
          course.subjectArea || ""
        }`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      if (appliedFilters.courseFilter === "free" && course.pricing?.isPaid) {
        return false;
      }
      if (appliedFilters.courseFilter === "paid" && !course.pricing?.isPaid) {
        return false;
      }
      if (
        ["Beginner", "Intermediate", "Advanced"].includes(
          appliedFilters.courseFilter
        ) &&
        course.levelShort !== appliedFilters.courseFilter
      ) {
        return false;
      }

      if (
        appliedFilters.statusFilter !== "all" &&
        course.status !== appliedFilters.statusFilter
      ) {
        return false;
      }

      if (appliedFilters.dateFrom || appliedFilters.dateTo) {
        const refIso = course.createdAt || course.updatedAt;
        if (refIso) {
          const dayStr = String(refIso).slice(0, 10);
          if (appliedFilters.dateFrom && dayStr < appliedFilters.dateFrom) {
            return false;
          }
          if (appliedFilters.dateTo && dayStr > appliedFilters.dateTo) {
            return false;
          }
        }
      }

      return true;
    });
  }, [courses, appliedFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCourses = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredCourses.slice(start, start + PAGE_SIZE);
  }, [filteredCourses, safePage]);

  if (!isRecruiterAccount(resolvedUser)) {
    return <Navigate to="/news-feed" replace />;
  }

  const handleApplyFilters = () => {
    setAppliedFilters({
      search: searchInput,
      courseFilter: courseFilterInput,
      statusFilter: statusFilterInput,
      dateFrom: dateFromInput,
      dateTo: dateToInput,
    });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setCourseFilterInput("all");
    setStatusFilterInput("all");
    setDateFromInput("");
    setDateToInput("");
    setAppliedFilters({
      search: "",
      courseFilter: "all",
      statusFilter: "all",
      dateFrom: "",
      dateTo: "",
    });
    setCurrentPage(1);
  };

  const handleStatusChange = (courseId, nextStatus) => {
    const updated = updateRecruiterCourseStatus(courseId, nextStatus);
    const refreshed = getRecruiterManagedCourses();
    setCourses(refreshed);
    if (updated) {
      setSelectedCourse(updated);
      toast.success(
        nextStatus === "published"
          ? "Course published to Bejite Academy!"
          : nextStatus === "in_review"
          ? "Course moved to admin review."
          : "Course moved to drafts."
      );
    }
  };

  const handleDeleteCourse = (course) => {
    const nextList = deleteRecruiterCourse(course.id);
    setCourses(nextList);
    setSelectedCourse(null);
    toast.info(`Removed "${course.title}".`);
  };

  return (
    <NewsFeedLayout
      showSidebars={false}
      classes="overflow-y-scroll overflow-x-hidden nfl-scroll scroll-smooth bg-white"
    >
      <div className="shrink-0 w-full bg-white">
        <div className="max-w-[1220px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6">
          {/* Top Breadcrumb */}
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => navigate("/news-feed")}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF0EC] hover:bg-[#DCE6DF] text-[#183B2E] font-bold px-3.5 sm:px-4 py-1.5 sm:py-2 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Go Back
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-bold text-[#16730F]">
              E-Learning Management
            </span>
          </div>

          {/* Page Header + Create Course CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-2xl">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#112A20] tracking-tight">
                E-Learning Management
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#5A6D62] leading-relaxed">
                Monitor recruitment progress, manage interview pipelines, and
                track candidate outcomes across all hiring exercises. Manage
                your courses and keep track of their progress.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/e-learning/partner/create")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#16730F] hover:bg-[#125E0C] text-white font-bold text-sm px-7 py-3.5 transition-colors shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Create Course
            </button>
          </div>

          {/* 4 KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            <RecruitmentStatCard
              icon={() => <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />}
              value={stats.total}
              label="TOTAL COURSE"
              sublabel="All managed records"
              variant="green"
            />
            <RecruitmentStatCard
              icon={() => <FileText className="w-4 h-4 sm:w-5 sm:h-5" />}
              value={stats.drafts}
              label="DRAFTS"
              sublabel="In configuration"
              variant="amber"
            />
            <RecruitmentStatCard
              icon={() => <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />}
              value={stats.published}
              label="PUBLISHED"
              sublabel="Available to learners"
              variant="green"
            />
            <RecruitmentStatCard
              icon={() => <Clock className="w-4 h-4 sm:w-5 sm:h-5" />}
              value={stats.inReview}
              label="IN REVIEW"
              sublabel="Awaiting admin check"
              variant="amber"
            />
          </div>

          {/* Filter Bar */}
          <ELearningManagementFilterBar
            searchQuery={searchInput}
            onSearchChange={(val) => {
              setSearchInput(val);
              setAppliedFilters((prev) => ({ ...prev, search: val }));
              setCurrentPage(1);
            }}
            courseFilter={courseFilterInput}
            onCourseFilterChange={setCourseFilterInput}
            statusFilter={statusFilterInput}
            onStatusFilterChange={setStatusFilterInput}
            dateFrom={dateFromInput}
            dateTo={dateToInput}
            onDateFromChange={setDateFromInput}
            onDateToChange={setDateToInput}
            onClearDate={() => {
              setDateFromInput("");
              setDateToInput("");
              setAppliedFilters((prev) => ({
                ...prev,
                dateFrom: "",
                dateTo: "",
              }));
            }}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />

          {/* My Courses Table */}
          <RecruiterCoursesTable
            courses={paginatedCourses}
            totalCount={stats.total}
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onViewCourse={(course) =>
              navigate(`/e-learning/partner/${course.id}`)
            }
            onEditCourse={(course) =>
              navigate(`/e-learning/partner/${course.id}/edit`)
            }
          />
        </div>
      </div>

      {/* Course Overview & Quick Actions Modal */}
      <RecruiterCourseViewModal
        course={selectedCourse}
        isOpen={Boolean(selectedCourse)}
        onClose={() => setSelectedCourse(null)}
        onEdit={(course) => {
          setSelectedCourse(null);
          navigate(`/e-learning/partner/${course.id}/edit`);
        }}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteCourse}
      />
    </NewsFeedLayout>
  );
}


