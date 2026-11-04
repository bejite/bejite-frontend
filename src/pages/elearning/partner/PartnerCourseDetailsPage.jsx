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
  SlidersHorizontal,
  ArrowRight,
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

  // Load course by id (support recruiter managed list, standard catalog, or seeded fallback)
  const [course, setCourse] = useState(() => {
    return (
      getRecruiterCourseById(courseId) ||
      getCourseById(courseId) ||
      getRecruiterManagedCourses().find((c) => c.id === courseId) ||
      getRecruiterManagedCourses()[0] ||
      null
    );
  });

  // Current active preview status (allows seamless switching between In Review, Draft, Published)
  const [activeStatus, setActiveStatus] = useState(() => {
    return String(course?.status || "draft").toLowerCase();
  });

  useEffect(() => {
    const loaded =
      getRecruiterCourseById(courseId) ||
      getCourseById(courseId) ||
      getRecruiterManagedCourses().find((c) => c.id === courseId);
    if (loaded) {
      setCourse(loaded);
      setActiveStatus(String(loaded.status || "draft").toLowerCase());
    }
  }, [courseId]);

  // Drawer & Modal States
  const [isAssessmentDrawerOpen, setIsAssessmentDrawerOpen] = useState(false);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  if (!isRecruiterAccount(resolvedUser)) {
    return <Navigate to="/news-feed" replace />;
  }

  if (!course) {
    return (
      <NewsFeedLayout showSidebars={false} classes="bg-[#F8FAF8]">
        <div className="max-w-[1140px] mx-auto px-4 py-16 text-center">
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

  const isDraft = activeStatus === "draft";
  const isInReview = activeStatus === "in_review";
  const isPublished = activeStatus === "published";

  const modules = Array.isArray(course.modules) && course.modules.length > 0
    ? course.modules
    : [
        {
          id: "mod-1",
          title: "Foundations of Strategic Content Pillars",
          description: "45 mins total duration · Content planning and audience segmentation",
          lessons: [
            {
              id: "les-1-1",
              title: "Setting Up Content Pillars & Core Themes",
              mediaType: "Video",
              durationMinutes: 20,
              summary:
                "Foundational video lecture explaining how to architect repeatable multi-platform content pillars.",
            },
            {
              id: "les-1-2",
              title: "Audience Persona Mapping & Content Fit",
              mediaType: "Video",
              durationMinutes: 25,
              summary:
                "Practical walkthrough on mapping content ideas to buyer personas.",
            },
          ],
        },
        {
          id: "mod-2",
          title: "Editorial Calendar & Production Workflow",
          description: "60 mins total duration · Execution frameworks and scheduling cadences",
          lessons: [
            {
              id: "les-2-1",
              title: "Designing the Weekly & Monthly Calendar",
              mediaType: "Video",
              durationMinutes: 30,
              summary:
                "Structuring editorial calendars and production sprints for team handoffs.",
            },
            {
              id: "les-2-2",
              title: "Multi-Platform Distribution & Repurposing",
              mediaType: "Video",
              durationMinutes: 30,
              summary:
                "Optimizing one core anchor asset into multiple channel-native formats.",
            },
          ],
        },
      ];

  const totalLessons = modules.reduce(
    (acc, m) => acc + (m.lessons || []).length,
    0
  );

  const quiz = course.quiz || {
    title: `${course.title || "Course"} Knowledge Quiz`,
    instructions:
      "Evaluates learner grasp of core concepts, strategic planning, editorial workflows, and performance measurement.",
    passMark: 80,
    timeLimitMinutes: 45,
    maxAttempts: 2,
    questions: [
      {
        id: "q-1",
        prompt: "What is the primary role of a strategic content pillar?",
        type: "single",
        points: 1,
        options: [
          "To provide a consistent thematic anchor across all social channels",
          "To copy competitor social posts verbatim",
          "To eliminate the need for performance metrics",
          "To post randomly without an editorial calendar",
        ],
        correctOptionIndex: 0,
        correctAnswers: [0],
      },
      {
        id: "q-2",
        prompt: "Which metrics most accurately reflect audience retention and engagement?",
        type: "single",
        points: 1,
        options: [
          "Saves, shares, comments, and average watch time",
          "Total follower count without impressions",
          "Raw impressions without click-through data",
          "Account creation timestamp",
        ],
        correctOptionIndex: 0,
        correctAnswers: [0],
      },
      {
        id: "q-3",
        prompt: "Editorial content calendars should align with marketing campaigns and sales funnels.",
        type: "true_false",
        points: 1,
        options: ["True", "False"],
        correctOptionIndex: 0,
        correctAnswers: [0],
      },
    ],
  };

  const questions = quiz.questions || [];

  const project = course.project || {
    enabled: true,
    isRequired: true,
    title: "Comprehensive Campaign Brief & Content Plan",
    brief:
      "Create an end-to-end 30-day social media campaign strategy for a direct-to-consumer sustainable fashion brand launching in Nigeria. Define target personas, content pillars, promotional calendar, and performance metrics.",
    submissionFormats: ["file", "link", "text"],
  };

  const isProjectEnabled = project.enabled ?? true;
  const pricing = course.pricing || { isPaid: true, amount: "50000", currency: "NGN" };
  const outcomes = Array.isArray(course.learningOutcomes) &&
    course.learningOutcomes.filter(Boolean).length > 0
      ? course.learningOutcomes.filter(Boolean)
      : [
          "Architect repeatable multi-platform content pillars.",
          "Design editorial workflows and creative briefs for teams.",
          "Measure retention, saves, and attribution across social funnels.",
        ];

  const handleStatusSwitch = (nextStatus) => {
    setActiveStatus(nextStatus);
    updateRecruiterCourseStatus(course.id, nextStatus);
    setCourse((prev) => ({ ...prev, status: nextStatus }));
    toast.info(
      nextStatus === "published"
        ? "Displaying Published view."
        : nextStatus === "in_review"
        ? "Displaying In Review view."
        : "Displaying Draft view."
    );
  };

  const handleConfirmSubmitReview = () => {
    handleStatusSwitch("in_review");
    setIsSubmitModalOpen(false);
    toast.success("Course submitted to Bejite Academy administrators for review.");
  };

  return (
    <NewsFeedLayout
      showSidebars={false}
      classes="overflow-y-scroll overflow-x-hidden nfl-scroll scroll-smooth bg-[#F8FAF8]"
    >
      <div className="shrink-0 w-full min-h-screen bg-[#F8FAF8] pb-24">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {/* Top Breadcrumb Nav & Live Status Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
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
                {course.title || "Social Media Content Planning"}
              </span>
            </div>

            {/* Status Switcher Tabs (Matches Figma's 3 states: In Review [Image 1], Draft [Image 3], Published [Image 4]) */}
            <div className="inline-flex items-center rounded-full bg-white border border-[#DCE8DC] p-1 shadow-2xs self-start sm:self-auto">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-2.5 pr-1.5 hidden sm:inline">
                View State:
              </span>
              <button
                type="button"
                onClick={() => handleStatusSwitch("draft")}
                className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                  isDraft
                    ? "bg-[#ECEFED] text-[#1F2937] shadow-2xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Draft
              </button>
              <button
                type="button"
                onClick={() => handleStatusSwitch("in_review")}
                className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                  isInReview
                    ? "bg-[#FFF5E8] text-[#D97706] shadow-2xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                In Review
              </button>
              <button
                type="button"
                onClick={() => handleStatusSwitch("published")}
                className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                  isPublished
                    ? "bg-[#E5F4E6] text-[#16730F] shadow-2xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Published
              </button>
            </div>
          </div>

          {/* Hero Course Banner Card (Figma Exact Styling) */}
          <div className="bg-[#EFF5EF] border border-[#DCE8DC] rounded-3xl p-6 sm:p-7 space-y-3.5 shadow-2xs">
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Badge */}
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
                {course.levelShort || course.level || "Advanced Level"}
              </span>

              {/* Category / Subject Area */}
              <span className="bg-[#DDE7DD] text-gray-800 text-[11px] font-bold px-3 py-1 rounded-md">
                {course.subjectArea || course.category || "Content & Social Media"}
              </span>

              {/* Pricing */}
              <span className="bg-[#DDE7DD] text-gray-800 text-[11px] font-bold px-3 py-1 rounded-md">
                {pricing.isPaid
                  ? `Paid (₦${Number(pricing.amount || 50000).toLocaleString()})`
                  : "Free Course"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#112A20] tracking-tight leading-tight">
              {course.title || "Social Media Content Planning"}
            </h1>

            <p className="text-xs sm:text-sm text-[#4A6358] max-w-3xl leading-relaxed">
              {course.summary ||
                course.description ||
                "Learn how to organize content ideas, define strategic pillars, and scale multi-channel calendars across platforms."}
            </p>
          </div>

          {/* Section Header: Course Configuration Details + Top CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#122B20]">
                Course Configuration Details
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7B73] mt-0.5">
                Review all configured course properties, curriculum structure, assessment rules, practical project brief, and tuition parameters.
              </p>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0">
              {isDraft && (
                <>
                  <button
                    type="button"
                    onClick={() => navigate(`/e-learning/partner/${course.id}/edit`)}
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
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFF5E8] border border-[#FDE68A] text-[#D97706] font-bold text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    Under Administrative Review
                  </span>
                  <button
                    type="button"
                    onClick={() => handleStatusSwitch("draft")}
                    className="rounded-full border border-[#DCE8DC] bg-white hover:bg-gray-50 text-[#374151] font-bold text-xs px-4 py-2 transition-colors cursor-pointer"
                  >
                    Withdraw to Draft
                  </button>
                </div>
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

          {/* 7 Configuration Breakdown Sections (Figma Exact Layout & Cards) */}
          <div className="space-y-5">
            {/* 1. Basic Information Block */}
            <div className="rounded-3xl bg-white border border-[#E6ECE8] p-6 space-y-5 shadow-2xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#F0F4F1]">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#122B20]">
                      Basic Information
                    </h3>
                    <p className="text-xs text-[#6B7B73]">
                      Primary course identity, target audience, difficulty tier, and core learning goals.
                    </p>
                  </div>
                </div>

                {isDraft && (
                  <button
                    type="button"
                    onClick={() => navigate(`/e-learning/partner/${course.id}/edit`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 hover:border-[#16730F] hover:bg-[#F2F8F3] text-xs font-bold text-[#16730F] transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>

              {/* 2-Column Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      COURSE TITLE
                    </span>
                    <p className="font-extrabold text-[#122B20] text-base">
                      {course.title || "Social Media Content Planning"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      TARGET AUDIENCE
                    </span>
                    <p className="font-semibold text-[#1E3B2E]">
                      {course.targetAudience ||
                        "Content strategists, brand managers, and creators"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      COURSE DESCRIPTION
                    </span>
                    <p className="text-[#4A5D52] leading-relaxed">
                      {course.summary ||
                        course.description ||
                        "Learn how to organize content ideas, define strategic pillars, and scale multi-channel calendars across platforms."}
                    </p>
                  </div>

                  {/* Learning Outcomes */}
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                      LEARNING OUTCOMES
                    </span>
                    <div className="space-y-2">
                      {outcomes.map((out, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 text-xs text-[#2A4337]"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#16730F] shrink-0 mt-1.5" />
                          <span className="leading-relaxed">{out}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      COURSE LEVEL
                    </span>
                    <p className="font-extrabold text-[#122B20]">
                      {course.levelShort || course.level || "Advanced"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      ESTIMATED DURATION
                    </span>
                    <p className="text-[#4A5D52] leading-relaxed">
                      {course.estimatedDuration ||
                        "4 hours total estimated time to complete all modules and lessons."}
                    </p>
                  </div>

                  {/* Course Cover Image Preview Card */}
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                      COURSE COVER IMAGE
                    </span>
                    <div className="flex items-center gap-4 p-3.5 rounded-2xl border border-[#E5ECE7] bg-[#FAFCFA]">
                      <div className="w-28 h-16 rounded-xl overflow-hidden bg-black shrink-0 border border-gray-200">
                        {course.coverImage ? (
                          <img
                            src={course.coverImage}
                            alt="Course cover"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/40">
                            <FileVideo className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-[#112A20]">
                          Preview cover image asset
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Uploaded JPG / PNG / WebP, 16:9 ratio
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Modules & Curriculum Block */}
            <div className="rounded-3xl bg-white border border-[#E6ECE8] p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#F0F4F1]">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#122B20]">
                      Modules & Curriculum
                    </h3>
                    <p className="text-xs text-[#6B7B73]">
                      {modules.length} modules configured with structured lesson sequences and progress checkpoints.
                    </p>
                  </div>
                </div>

                {isDraft && (
                  <button
                    type="button"
                    onClick={() => navigate(`/e-learning/partner/${course.id}/edit`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 hover:border-[#16730F] hover:bg-[#F2F8F3] text-xs font-bold text-[#16730F] transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>

              {/* Module Cards */}
              <div className="space-y-3">
                {modules.map((mod, mIdx) => (
                  <div
                    key={mod.id || mIdx}
                    className="rounded-2xl border border-[#E8EFEA] bg-[#FAFCFA] overflow-hidden"
                  >
                    <div className="p-4 bg-[#EFF5EF]/60 border-b border-[#E8EFEA] flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-[#112A20]">
                          Module {mIdx + 1}: {mod.title}
                        </h4>
                        <p className="text-[11px] text-[#5A6D62] mt-0.5">
                          {(mod.lessons || []).length} lessons •{" "}
                          {mod.description ||
                            "Structured curriculum sequence with checkpoints"}
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-[#16730F] bg-[#EAF5EC] px-3 py-1 rounded-full">
                        {(mod.lessons || []).length}{" "}
                        {(mod.lessons || []).length === 1 ? "Lesson" : "Lessons"}
                      </span>
                    </div>

                    <div className="p-3 divide-y divide-gray-100">
                      {(mod.lessons || []).map((les, lIdx) => (
                        <div
                          key={les.id || lIdx}
                          className="py-2.5 px-2 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-gray-400 font-bold text-[11px] w-5">
                              #{lIdx + 1}
                            </span>
                            <span className="font-semibold text-[#1E3B2E] truncate">
                              {les.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-bold bg-[#EAF5EC] text-[#16730F] px-2.5 py-0.5 rounded-full">
                              {les.mediaType || les.type || "Video"}
                            </span>
                            <span className="text-[11px] text-gray-500 font-medium">
                              {les.durationMinutes || 20} mins
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Learning Content & Media Block */}
            <div className="rounded-3xl bg-white border border-[#E6ECE8] p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#F0F4F1]">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#122B20]">
                      Learning Content & Media
                    </h3>
                    <p className="text-xs text-[#6B7B73]">
                      Multi-format instructional assets, video lectures, and reading documents across configured modules.
                    </p>
                  </div>
                </div>

                {isDraft && (
                  <button
                    type="button"
                    onClick={() => navigate(`/e-learning/partner/${course.id}/edit`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 hover:border-[#16730F] hover:bg-[#F2F8F3] text-xs font-bold text-[#16730F] transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>

              {/* Media Blocks per Module */}
              <div className="space-y-4">
                {modules.map((mod, mIdx) => (
                  <div
                    key={mod.id || mIdx}
                    className="rounded-2xl border border-[#E5EDE7] bg-[#FAFCFA] p-4 sm:p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[#E8EFEA]">
                      <span className="text-xs sm:text-sm font-extrabold text-[#112A20]">
                        Module {mIdx + 1}: {mod.title}
                      </span>
                      <span className="text-[11px] font-bold text-[#16730F]">
                        {(mod.lessons || []).length} media items
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {(mod.lessons || []).map((les, lIdx) => {
                        const mType = String(
                          les.mediaType || les.type || "video"
                        ).toLowerCase();
                        return (
                          <div
                            key={les.id || lIdx}
                            className="rounded-xl border border-[#E5ECE7] bg-white p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#16730F]/40 transition-colors"
                          >
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-[#EBF4EC] text-[#16730F] flex items-center justify-center shrink-0">
                                  {mType.includes("audio") ? (
                                    <Headphones className="w-3 h-3" />
                                  ) : mType.includes("pdf") ? (
                                    <FileDown className="w-3 h-3" />
                                  ) : (
                                    <FileVideo className="w-3 h-3" />
                                  )}
                                </span>
                                <h5 className="font-bold text-xs sm:text-sm text-[#112A20] truncate">
                                  {les.title}
                                </h5>
                              </div>
                              <p className="text-xs text-[#5A6D62] pl-7 line-clamp-1">
                                {les.summary ||
                                  "Instructional lecture with practical application and takeaways."}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 sm:self-center pl-7 sm:pl-0 shrink-0">
                              <span className="rounded-full bg-[#F0F4F1] text-[#1E3B2E] text-[10px] font-bold px-2.5 py-0.5">
                                {mType.includes("audio")
                                  ? "Audio Lecture"
                                  : mType.includes("pdf")
                                  ? "PDF Document"
                                  : "Video Block (MP4)"}
                              </span>
                              <span className="text-xs text-gray-500 font-medium">
                                {les.durationMinutes || 20}m
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Assessment Configuration Block + View Assessment CTA */}
            <div className="rounded-3xl bg-white border border-[#E6ECE8] p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#F0F4F1]">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#122B20]">
                      Assessment Configuration
                    </h3>
                    <p className="text-xs text-[#6B7B73]">
                      Configured knowledge quiz with automatic grading and attempt rules.
                    </p>
                  </div>
                </div>

                {isDraft && (
                  <button
                    type="button"
                    onClick={() => navigate(`/e-learning/partner/${course.id}/edit`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 hover:border-[#16730F] hover:bg-[#F2F8F3] text-xs font-bold text-[#16730F] transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>

              {/* Green Knowledge Quiz Card */}
              <div className="rounded-2xl border border-[#DCE8DC] bg-[#F7FAF8] p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <span className="inline-block rounded-md bg-[#16730F] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 tracking-wider">
                      Knowledge Assessment
                    </span>
                    <h4 className="text-base sm:text-lg font-extrabold text-[#112A20]">
                      {quiz.title || "Social Media Content Planning Quiz"}
                    </h4>
                    <p className="text-xs text-[#4A5D52] leading-relaxed max-w-2xl">
                      {quiz.instructions ||
                        "Evaluates learner grasp of content pillar development, audience persona mapping, editorial workflows, and social performance measurement."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAssessmentDrawerOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#16730F] hover:bg-[#125E0C] text-white font-bold text-xs px-5 py-2.5 transition-colors shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Assessment
                  </button>
                </div>

                {/* 4 Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#E5EDE7]">
                  <div className="text-xs">
                    <span className="text-gray-400 font-bold block text-[10px] uppercase">
                      Passing Mark
                    </span>
                    <span className="font-extrabold text-[#112A20] text-sm mt-0.5 block">
                      {quiz.passMark || 80}% minimum
                    </span>
                  </div>

                  <div className="text-xs">
                    <span className="text-gray-400 font-bold block text-[10px] uppercase">
                      Total Questions
                    </span>
                    <span className="font-extrabold text-[#112A20] text-sm mt-0.5 block">
                      {questions.length || 3} questions
                    </span>
                  </div>

                  <div className="text-xs">
                    <span className="text-gray-400 font-bold block text-[10px] uppercase">
                      Time Limit
                    </span>
                    <span className="font-extrabold text-[#112A20] text-sm mt-0.5 block">
                      {quiz.timeLimitMinutes || quiz.timeLimit || 45} minutes
                    </span>
                  </div>

                  <div className="text-xs">
                    <span className="text-gray-400 font-bold block text-[10px] uppercase">
                      Attempt Policy
                    </span>
                    <span className="font-extrabold text-[#112A20] text-sm mt-0.5 block">
                      {quiz.maxAttempts || 2} attempts max
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Practical Project Deliverable Block + View Brief CTA */}
            <div className="rounded-3xl bg-white border border-[#E6ECE8] p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#F0F4F1]">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#122B20]">
                      Practical Project Deliverable
                    </h3>
                    <p className="text-xs text-[#6B7B73]">
                      Hands-on capstone project evaluating real-world application of course skills.
                    </p>
                  </div>
                </div>

                {isDraft && (
                  <button
                    type="button"
                    onClick={() => navigate(`/e-learning/partner/${course.id}/edit`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 hover:border-[#16730F] hover:bg-[#F2F8F3] text-xs font-bold text-[#16730F] transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>

              {/* Green Capstone Project Card */}
              <div className="rounded-2xl border border-[#DCE8DC] bg-[#F7FAF8] p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <span className="inline-block rounded-md bg-[#16730F] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 tracking-wider">
                      Practical Capstone
                    </span>
                    <h4 className="text-base sm:text-lg font-extrabold text-[#112A20]">
                      {project.title || "Comprehensive Campaign Brief & Content Plan"}
                    </h4>
                    <p className="text-xs text-[#4A5D52] leading-relaxed max-w-2xl">
                      {project.brief ||
                        "Create an end-to-end 30-day social media campaign strategy for a direct-to-consumer sustainable fashion brand launching in Nigeria. Define target personas, content pillars, promotional calendar, and performance metrics."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsProjectDrawerOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#16730F] hover:bg-[#125E0C] text-white font-bold text-xs px-5 py-2.5 transition-colors shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    View Brief
                  </button>
                </div>

                <div className="pt-2 border-t border-[#E5EDE7] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-gray-400 font-bold text-[11px] uppercase">
                      Accepted Formats:
                    </span>
                    {(project.submissionFormats || ["file", "link", "text"]).map(
                      (fmt) => (
                        <span
                          key={fmt}
                          className="rounded-full bg-white border border-[#DCE8DC] text-[#1E3B2E] text-[10px] font-bold px-3 py-1 uppercase"
                        >
                          {fmt === "file"
                            ? "File Upload (PDF, DOCX)"
                            : fmt === "link"
                            ? "External Link"
                            : "Written Response"}
                        </span>
                      )
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16730F]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Required for course completion
                  </span>
                </div>
              </div>
            </div>

            {/* 6. Access & Tuition Fee Block */}
            <div className="rounded-3xl bg-white border border-[#E6ECE8] p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#F0F4F1]">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#122B20]">
                      Access & Tuition Fee
                    </h3>
                    <p className="text-xs text-[#6B7B73]">
                      Configured enrollment access model and pricing parameters.
                    </p>
                  </div>
                </div>

                {isDraft && (
                  <button
                    type="button"
                    onClick={() => navigate(`/e-learning/partner/${course.id}/edit`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 hover:border-[#16730F] hover:bg-[#F2F8F3] text-xs font-bold text-[#16730F] transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>

              {/* Access Model Card */}
              <div className="rounded-2xl border border-[#E5EDE7] bg-[#FAFCFA] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[#112A20] text-sm sm:text-base">
                      {pricing.isPaid ? "Paid Course" : "Free Access"}
                    </span>
                    <span className="rounded-md bg-[#16730F] text-white text-[10px] font-extrabold px-2 py-0.5 tracking-wider">
                      {pricing.isPaid ? "TUITION" : "OPEN"}
                    </span>
                  </div>
                  <p className="text-xs text-[#5A6D62]">
                    {pricing.isPaid
                      ? "Learners must pay tuition to access course materials, quizzes, and project review."
                      : "Learners can enroll instantly without payment. Ideal for foundational training or community courses."}
                  </p>
                </div>

                {pricing.isPaid && (
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                      Tuition Amount
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-[#16730F]">
                      ₦{Number(pricing.amount || 50000).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold block">
                      NGN / Nigerian Naira
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 7. Completion Rules Block */}
            <div className="rounded-3xl bg-white border border-[#E6ECE8] p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#F0F4F1]">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#122B20]">
                      Completion Rules
                    </h3>
                    <p className="text-xs text-[#6B7B73]">
                      Criteria learners must fulfill before the course is marked completed.
                    </p>
                  </div>
                </div>

                {isDraft && (
                  <button
                    type="button"
                    onClick={() => navigate(`/e-learning/partner/${course.id}/edit`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 hover:border-[#16730F] hover:bg-[#F2F8F3] text-xs font-bold text-[#16730F] transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>

              {/* 3 Criteria Checklist Cards */}
              <div className="space-y-3">
                {/* 1. Content */}
                <div className="rounded-2xl border border-[#E5EDE7] bg-[#FAFCFA] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-md bg-[#16730F] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs sm:text-sm text-[#112A20]">
                        Complete the required learning content
                      </h5>
                      <p className="text-xs text-[#5A6D62] mt-0.5">
                        Learners must work through the instructional materials and lessons defined in the course structure.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white border border-[#DCE8DC] text-[#1E3B2E] text-[11px] font-bold px-3 py-1 shrink-0 self-start sm:self-auto">
                    {modules.length} modules • {totalLessons} lessons
                  </span>
                </div>

                {/* 2. Assessment */}
                <div className="rounded-2xl border border-[#E5EDE7] bg-[#FAFCFA] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-md bg-[#16730F] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs sm:text-sm text-[#112A20]">
                        Complete the configured assessment
                      </h5>
                      <p className="text-xs text-[#5A6D62] mt-0.5">
                        Learners must complete the quiz configured for this course and achieve the minimum passing grade.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white border border-[#DCE8DC] text-[#1E3B2E] text-[11px] font-bold px-3 py-1 shrink-0 self-start sm:self-auto">
                    {quiz.title || "Knowledge Quiz"} ({questions.length || 3} questions)
                  </span>
                </div>

                {/* 3. Practical Project */}
                {isProjectEnabled && (
                  <div className="rounded-2xl border border-[#E5EDE7] bg-[#FAFCFA] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-md bg-[#16730F] text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <div>
                        <h5 className="font-bold text-xs sm:text-sm text-[#112A20]">
                          Submit the practical project
                        </h5>
                        <p className="text-xs text-[#5A6D62] mt-0.5">
                          Learners must submit their practical deliverable ({project.title || "Campaign Brief"}) to complete the course.
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-white border border-[#DCE8DC] text-[#1E3B2E] text-[11px] font-bold px-3 py-1 shrink-0 self-start sm:self-auto">
                      {project.title || "Capstone Deliverable"}
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
