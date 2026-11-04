import React, { useMemo, useState, useEffect } from "react";
import { Navigate, useNavigate, useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  Pencil,
  BookOpen,
  FileText,
  Upload,
  ExternalLink,
  HelpCircle,
  Award,
  ChevronDown,
  ChevronUp,
  FileVideo,
  Headphones,
  FileDown,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";
import NewsFeedLayout from "../../../components/layout/NewsFeedLayout";
import {
  AssessmentPreviewDrawer,
  ProjectBriefDrawer,
  CourseSubmitReviewModal,
} from "../../../components/elearning";
import { isRecruiterAccount } from "../../../services/accountDelegationService";
import {
  getRecruiterCourseById,
  getRecruiterManagedCourses,
  getCourseById,
  updateRecruiterCourseStatus,
} from "../../../services/elearningService";
import { getUser, mergeAuthUsers } from "../../../utils/tokenManager";

export default function PartnerCourseDetailsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const reduxUser = useSelector((state) => state.auth?.user);
  const resolvedUser = useMemo(
    () => mergeAuthUsers(getUser() || {}, reduxUser || {}),
    [reduxUser]
  );

  // Load course by id (support recruiter managed list, standard catalog, or first available)
  const [course, setCourse] = useState(() => {
    return (
      getRecruiterCourseById(courseId) ||
      getCourseById(courseId) ||
      getRecruiterManagedCourses().find((c) => c.id === courseId) ||
      getRecruiterManagedCourses()[0] ||
      null
    );
  });

  useEffect(() => {
    const loaded =
      getRecruiterCourseById(courseId) ||
      getCourseById(courseId) ||
      getRecruiterManagedCourses().find((c) => c.id === courseId);
    if (loaded) {
      setCourse(loaded);
    }
  }, [courseId]);

  // Drawer & Modal States
  const [isAssessmentDrawerOpen, setIsAssessmentDrawerOpen] = useState(false);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [collapsedModules, setCollapsedModules] = useState({});

  if (!isRecruiterAccount(resolvedUser)) {
    return <Navigate to="/news-feed" replace />;
  }

  if (!course) {
    return (
      <NewsFeedLayout showSidebars={false} classes="bg-white">
        <div className="max-w-[1220px] mx-auto px-4 py-16 text-center">
          <h2 className="text-xl font-bold text-gray-800">Course Not Found</h2>
          <p className="text-xs text-gray-500 mt-2">
            The requested course could not be located.
          </p>
          <button
            type="button"
            onClick={() => navigate("/e-learning/partner")}
            className="mt-4 rounded-full bg-[#16730F] text-white px-6 py-2 text-xs font-bold"
          >
            Back to E-Learning Management
          </button>
        </div>
      </NewsFeedLayout>
    );
  }

  const status = String(course.status || "draft").toLowerCase();
  const isDraft = status === "draft";
  const isInReview = status === "in_review";
  const isPublished = status === "published";

  const modules = course.modules || [];
  const totalLessons = modules.reduce(
    (acc, m) => acc + (m.lessons || []).length,
    0
  );
  const quiz = course.quiz || {};
  const questions = quiz.questions || [];
  const project = course.project || {};
  const isProjectEnabled = project.enabled ?? true;
  const pricing = course.pricing || {};
  const completion = course.completion || {};

  const toggleModuleCollapse = (idx) => {
    setCollapsedModules((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleConfirmSubmitReview = () => {
    updateRecruiterCourseStatus(course.id, "in_review");
    const refreshed =
      getRecruiterCourseById(course.id) ||
      getCourseById(course.id) || { ...course, status: "in_review" };
    setCourse({ ...refreshed, status: "in_review" });
    setIsSubmitModalOpen(false);
    toast.success("Course submitted to Bejite Academy administrators for review.");
  };

  const handleQuickStatusChange = (nextStatus) => {
    updateRecruiterCourseStatus(course.id, nextStatus);
    setCourse((prev) => ({ ...prev, status: nextStatus }));
    toast.info(
      nextStatus === "published"
        ? "Course is now Published."
        : nextStatus === "in_review"
        ? "Course is now In Review."
        : "Course moved to Draft."
    );
  };

  return (
    <NewsFeedLayout
      showSidebars={false}
      classes="overflow-y-scroll overflow-x-hidden nfl-scroll scroll-smooth bg-white"
    >
      <div className="shrink-0 w-full bg-white pb-16">
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {/* Top Breadcrumb Nav */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => navigate("/e-learning/partner")}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF0EC] hover:bg-[#DCE6DF] text-[#183B2E] font-bold px-4 py-2 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Go Back
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <Link
              to="/e-learning/partner"
              className="font-bold text-[#5A6D62] hover:text-[#16730F] transition-colors"
            >
              E-Learning Management
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-extrabold text-[#16730F] truncate max-w-[280px] sm:max-w-md">
              {course.title || "Course Details"}
            </span>
          </div>

          {/* Hero Course Banner Card (Dual-State: In Review [Image 1], Draft [Image 2], Published [Image 3]) */}
          <div className="bg-[#EFF5EF] border border-[#DCE8DC] rounded-3xl p-6 sm:p-7 space-y-3.5 shadow-2xs">
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Dynamic Status Badge */}
              {isInReview && (
                <span className="inline-flex items-center gap-1 rounded-md bg-[#FFF5E8] text-[#D97706] text-[11px] font-extrabold uppercase px-3 py-1 tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  In Review
                </span>
              )}
              {isDraft && (
                <span className="inline-flex items-center gap-1 rounded-md bg-[#ECEFED] text-[#374151] text-[11px] font-extrabold uppercase px-3 py-1 tracking-wider">
                  Draft
                </span>
              )}
              {isPublished && (
                <span className="inline-flex items-center gap-1 rounded-md bg-[#E5F4E6] text-[#16730F] text-[11px] font-extrabold uppercase px-3 py-1 tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Published
                </span>
              )}

              {/* Difficulty Level */}
              <span className="bg-[#133023] text-[#A6E88E] text-[11px] font-bold px-3 py-1 rounded-md">
                {course.levelShort || course.level || "Beginner Level"}
              </span>

              {/* Category / Subject Area */}
              <span className="bg-[#DDE7DD] text-gray-800 text-[11px] font-bold px-3 py-1 rounded-md">
                {course.subjectArea || course.category || "Marketing & Growth"}
              </span>

              {/* Pricing */}
              <span className="bg-[#DDE7DD] text-gray-800 text-[11px] font-bold px-3 py-1 rounded-md">
                {pricing.isPaid
                  ? `Paid (₦${Number(pricing.amount || 0).toLocaleString()})`
                  : "Free Course"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#112A20] tracking-tight leading-tight">
              {course.title || "Social Media Content Planning"}
            </h1>

            <p className="text-xs sm:text-sm text-[#4A6358] max-w-3xl leading-relaxed">
              {course.summary ||
                course.description ||
                "Learn how to organize content ideas, define strategic pillars, and execute a consistent editorial content calendar across social platforms."}
            </p>
          </div>

          {/* Section Header: Course Configuration Details + Primary Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 border-b border-[#EDF3EE] pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#122B20]">
                Course Configuration Details
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7B73] mt-0.5">
                Review all configured course properties, curriculum structure, assessment rules, practical project brief, and tuition parameters.
              </p>
            </div>

            {/* Action Buttons based on status */}
            <div className="flex items-center gap-2.5 shrink-0">
              {isDraft && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/e-learning/partner/${course.id}/edit`)
                    }
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#DCE8DC] bg-white hover:bg-gray-50 text-[#183B2E] font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit Course
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="rounded-full bg-[#16730F] hover:bg-[#125E0C] text-white font-bold text-xs sm:text-sm px-6 py-2.5 transition-colors shadow-xs cursor-pointer"
                  >
                    Submit for Review
                  </button>
                </>
              )}

              {isInReview && (
                <>
                  <button
                    type="button"
                    onClick={() => handleQuickStatusChange("draft")}
                    className="rounded-full border border-[#DCE8DC] bg-white hover:bg-gray-50 text-[#374151] font-bold text-xs sm:text-sm px-5 py-2.5 transition-colors cursor-pointer"
                  >
                    Withdraw to Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickStatusChange("published")}
                    className="rounded-full bg-[#16730F] hover:bg-[#125E0C] text-white font-bold text-xs sm:text-sm px-5 py-2.5 transition-colors shadow-xs cursor-pointer"
                  >
                    Approve & Publish
                  </button>
                </>
              )}

              {isPublished && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/e-learning/jobseeker/courses/${course.id}`)
                    }
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#16730F] text-[#16730F] bg-white hover:bg-[#F2F8F3] font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Learner Preview
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/e-learning/partner/${course.id}/edit`)
                    }
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#16730F] hover:bg-[#125E0C] text-white font-bold text-xs sm:text-sm px-5 py-2.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit Course
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 7 Configuration Breakdown Blocks */}
          <div className="space-y-4">
            {/* 1. Basic Information Block */}
            <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F1]">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#122B20]">
                    Basic Information
                  </h3>
                </div>

                {isDraft && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/e-learning/partner/${course.id}/edit`)
                    }
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#16730F] hover:underline cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 font-medium">Subject Area:</span>
                  <p className="font-bold text-[#122B20] mt-0.5">
                    {course.subjectArea || course.category || "Digital Marketing"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Target Audience:</span>
                  <p className="font-bold text-[#122B20] mt-0.5">
                    {course.targetAudience || "Aspiring Marketers & Entrepreneurs"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Difficulty Level:</span>
                  <p className="font-bold text-[#122B20] mt-0.5">
                    {course.levelShort || course.level || "Beginner"}
                  </p>
                </div>
              </div>

              {/* Learning Outcomes */}
              {Array.isArray(course.learningOutcomes) &&
                course.learningOutcomes.filter(Boolean).length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs text-gray-400 font-medium">
                      Learning Outcomes:
                    </span>
                    <ul className="mt-1.5 space-y-1">
                      {course.learningOutcomes.filter(Boolean).map((out, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-[#2A4337] flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#16730F]" />
                          <span>{out}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Cover Image Preview */}
              {course.coverImage && (
                <div className="pt-2">
                  <span className="text-xs text-gray-400 font-medium">
                    Cover Image:
                  </span>
                  <div className="mt-2 w-48 h-28 rounded-2xl overflow-hidden border border-[#DCE8DC] bg-black">
                    <img
                      src={course.coverImage}
                      alt="Course cover"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Modules & Curriculum Block */}
            <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F1]">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#122B20]">
                    Modules & Curriculum
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#5A6D62] font-semibold">
                    {modules.length} Modules • {totalLessons} Lessons
                  </span>
                  {isDraft && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/e-learning/partner/${course.id}/edit`)
                      }
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#16730F] hover:underline cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {modules.map((mod, mIdx) => {
                  const isCollapsed = Boolean(collapsedModules[mIdx]);
                  const lessonCount = (mod.lessons || []).length;

                  return (
                    <div
                      key={mod.id || mIdx}
                      className="rounded-2xl border border-[#E8EFEA] bg-[#FAFCFA] overflow-hidden"
                    >
                      <div
                        onClick={() => toggleModuleCollapse(mIdx)}
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#F2F7F3] transition-colors"
                      >
                        <span className="text-xs font-bold text-[#122B20]">
                          Module {mIdx + 1}: {mod.title}
                        </span>
                        <div className="flex items-center gap-2.5">
                          <span className="text-[11px] text-gray-500 font-medium">
                            {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
                          </span>
                          {isCollapsed ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {!isCollapsed && (
                        <div className="px-4 pb-4 pt-1 border-t border-[#EDF3EE] space-y-1.5">
                          {(mod.lessons || []).map((les, lIdx) => (
                            <div
                              key={les.id || lIdx}
                              className="text-xs text-[#4A5D52] flex items-center justify-between py-1 border-b border-gray-100 last:border-0"
                            >
                              <span className="truncate pr-2">
                                #{lIdx + 1} {les.title}
                              </span>
                              <span className="text-[10px] bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full shrink-0">
                                {les.mediaType || les.type || "Video"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Learning Content & Media Block */}
            <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-6 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F1]">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#122B20]">
                    Learning Content & Media
                  </h3>
                </div>

                {isDraft && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/e-learning/partner/${course.id}/edit`)
                    }
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#16730F] hover:underline cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>

              <p className="text-xs text-[#5A6D62]">
                Total {totalLessons} lessons configured across modules with video, audio, and PDF reading checkpoints.
              </p>

              {/* Module cards preview with lesson media icons */}
              <div className="space-y-2.5 pt-1">
                {modules.map((mod, mIdx) => (
                  <div
                    key={mod.id || mIdx}
                    className="rounded-2xl border border-[#EDF3EE] bg-[#F9FCFA] p-4 space-y-2"
                  >
                    <span className="text-xs font-bold text-[#112A20] block">
                      Module {mIdx + 1}: {mod.title}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {(mod.lessons || []).map((les, lIdx) => {
                        const mType = String(
                          les.mediaType || les.type || "video"
                        ).toLowerCase();
                        return (
                          <div
                            key={les.id || lIdx}
                            className="rounded-xl border border-[#E5ECE7] bg-white p-2.5 text-xs flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {mType.includes("audio") ? (
                                <Headphones className="w-4 h-4 text-[#16730F] shrink-0" />
                              ) : mType.includes("pdf") ? (
                                <FileDown className="w-4 h-4 text-[#16730F] shrink-0" />
                              ) : (
                                <FileVideo className="w-4 h-4 text-[#16730F] shrink-0" />
                              )}
                              <span className="truncate font-medium text-[#1E3B2E]">
                                {les.title}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-500 font-bold shrink-0">
                              {les.durationMinutes || 15}m
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Assessment Configuration Block + View Assessment CTA */}
            <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0F4F1]">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#122B20]">
                      Assessment Configuration
                    </h3>
                    <span className="text-xs text-[#5A6D62] font-semibold">
                      Pass mark: {quiz.passMark || 80}% • {questions.length} questions
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  {isDraft && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/e-learning/partner/${course.id}/edit`)
                      }
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#16730F] hover:underline cursor-pointer mr-2"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  )}
                  {/* View Assessment CTA opens Right Sidebar Popup (Image 4) */}
                  <button
                    type="button"
                    onClick={() => setIsAssessmentDrawerOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#16730F] hover:bg-[#125E0C] text-white font-bold text-xs px-5 py-2 transition-colors shadow-xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Assessment
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-[#2A4337]">
                <p className="font-bold text-[#112A20] text-sm">
                  {quiz.title || "Digital Marketing Basics Quiz"}
                </p>
                <p className="text-gray-500">
                  {quiz.instructions ||
                    "Answer questions testing audience segmentation, content calendar execution, and campaign attribution."}
                </p>
              </div>
            </div>

            {/* 5. Practical Project Deliverable Block + View Brief CTA */}
            <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-6 space-y-3.5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0F4F1]">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#122B20]">
                      Practical Project Deliverable
                    </h3>
                    <span className="text-xs text-[#5A6D62] font-semibold">
                      {isProjectEnabled ? "Included" : "None Configured"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  {isDraft && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/e-learning/partner/${course.id}/edit`)
                      }
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#16730F] hover:underline cursor-pointer mr-2"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  )}
                  {/* View Brief CTA opens Right Sidebar Popup (Image 5) */}
                  <button
                    type="button"
                    onClick={() => setIsProjectDrawerOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#16730F] hover:bg-[#125E0C] text-white font-bold text-xs px-5 py-2 transition-colors shadow-xs cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    View Brief
                  </button>
                </div>
              </div>

              {isProjectEnabled ? (
                <div className="space-y-2 text-xs">
                  <p className="font-bold text-[#122B20] text-sm">
                    {project.title || "Comprehensive Campaign Brief & Content Plan"}
                  </p>
                  <p className="text-[#5A6D62] leading-relaxed line-clamp-2">
                    {project.brief ||
                      "Create an end-to-end 30-day social media campaign strategy for a direct-to-consumer sustainable fashion brand launching in Nigeria."}
                  </p>
                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    <span className="text-gray-400 font-medium">Accepted:</span>
                    {(project.submissionFormats || ["file", "link"]).map((fmt) => (
                      <span
                        key={fmt}
                        className="rounded-full bg-[#F0F4F1] text-[#1E3B2E] text-[10px] font-bold px-2.5 py-0.5 uppercase"
                      >
                        {fmt}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  No practical project configured.
                </p>
              )}
            </div>

            {/* 6. Access & Tuition Fee Block */}
            <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-6 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F1]">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#122B20]">
                    Access & Tuition Fee
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#16730F]">
                    {pricing.isPaid
                      ? `₦${Number(pricing.amount || 0).toLocaleString()}`
                      : "Free Enrollment"}
                  </span>
                  {isDraft && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/e-learning/partner/${course.id}/edit`)
                      }
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#16730F] hover:underline cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-[#5A6D62]">
                {pricing.isPaid
                  ? "Paid course model — learners pay tuition fee at checkout to access video lectures and submit deliverables."
                  : "Open access model — free enrollment for all registered talent."}
              </p>
            </div>

            {/* 7. Completion Rules Block */}
            <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-6 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F1]">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#122B20]">
                    Completion Rules
                  </h3>
                </div>

                {isDraft && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/e-learning/partner/${course.id}/edit`)
                    }
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#16730F] hover:underline cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>

              <div className="space-y-2 text-xs text-[#3E5246]">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#16730F]" />
                  <span>
                    Complete the required learning content ({modules.length} modules • {totalLessons} lessons)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#16730F]" />
                  <span>
                    Complete configured assessment with at least {quiz.passMark || 80}% passing score
                  </span>
                </div>
                {isProjectEnabled && (
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#16730F]" />
                    <span>
                      Submit the practical capstone project deliverable for review
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar Drawer: View Assessment (Image 4) */}
      <AssessmentPreviewDrawer
        isOpen={isAssessmentDrawerOpen}
        onClose={() => setIsAssessmentDrawerOpen(false)}
        quiz={quiz}
        courseTitle={course.title}
      />

      {/* Right Sidebar Drawer: View Brief (Image 5) */}
      <ProjectBriefDrawer
        isOpen={isProjectDrawerOpen}
        onClose={() => setIsProjectDrawerOpen(false)}
        project={project}
        courseTitle={course.title}
      />

      {/* Review Submission Confirmation Modal */}
      <CourseSubmitReviewModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={handleConfirmSubmitReview}
        courseTitle={course.title}
      />
    </NewsFeedLayout>
  );
}

