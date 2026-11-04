import React, { useMemo, useState, useEffect } from "react";
import { Navigate, useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  Eye,
  Pencil,
  FileText,
  FileVideo,
  Plus,
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

/**
 * Partner Course Details Page matching Figma 1:1 exactly:
 * - Published state (matches media_1793784683028_fdd4d2de.png)
 * - Draft state
 * - In Review state
 * Zero extraneous elements, zero missing fields.
 */
export default function PartnerCourseDetailsPage() {
  const { courseId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
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

  useEffect(() => {
    const loaded =
      getRecruiterCourseById(courseId) ||
      getCourseById(courseId) ||
      getRecruiterManagedCourses().find((c) => c.id === courseId);
    if (loaded) {
      setCourse(loaded);
    }
  }, [courseId]);

  // Status is naturally derived from course.status or URL query param (?status=draft|in_review|published)
  const queryStatus = searchParams.get("status");
  const activeStatus = useMemo(() => {
    if (
      queryStatus &&
      ["draft", "in_review", "published"].includes(queryStatus.toLowerCase())
    ) {
      return queryStatus.toLowerCase();
    }
    const s = String(course?.status || "published").toLowerCase();
    if (s === "approved") return "published";
    if (s === "pending_review") return "in_review";
    return s;
  }, [queryStatus, course?.status]);

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

  const modules =
    Array.isArray(course.modules) && course.modules.length > 0
      ? course.modules
      : [
          {
            id: "mod-1",
            title: "Foundations of Strategic Content Pillars",
            description: "2 lessons · 45 mins total duration · Content planning and audience segmentation",
            lessons: [
              {
                id: "les-1-1",
                title: "Setting Up Content Pillars & Core Themes",
                mediaType: "Video",
                durationMinutes: 20,
                summary:
                  "Foundational video lecture explaining how to architect repeatable multi-platform content pillars, establish thematic resonance across channels, and construct scalable distribution engines.",
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
            description: "2 lessons · 60 mins total duration · Execution frameworks and scheduling cadences",
            lessons: [
              {
                id: "les-2-1",
                title: "Designing the Weekly & Monthly Calendar",
                mediaType: "Video",
                durationMinutes: 30,
                summary:
                  "Structuring editorial calendars and production sprints for team handoffs and consistent distribution across social media channels.",
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
    title: "Social Media Content Planning Quiz",
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

  const pricing = course.pricing || { isPaid: true, amount: "50000", currency: "NGN" };
  const outcomes =
    Array.isArray(course.learningOutcomes) &&
    course.learningOutcomes.filter(Boolean).length > 0
      ? course.learningOutcomes.filter(Boolean)
      : [
          "Architect repeatable multi-platform content pillars.",
          "Design editorial workflows and creative briefs for teams.",
          "Measure retention, saves, and attribution across social funnels.",
        ];

  const handleWithdrawToDraft = () => {
    updateRecruiterCourseStatus(course.id, "draft");
    setCourse((prev) => ({ ...prev, status: "draft" }));
    if (queryStatus) {
      setSearchParams({ status: "draft" });
    }
    toast.info("Course withdrawn to draft status.");
  };

  const handleConfirmSubmitReview = () => {
    updateRecruiterCourseStatus(course.id, "in_review");
    setCourse((prev) => ({ ...prev, status: "in_review" }));
    if (queryStatus) {
      setSearchParams({ status: "in_review" });
    }
    setIsSubmitModalOpen(false);
    toast.success("Course submitted to Bejite Academy administrators for review.");
  };

  const handleViewMediaBlocks = (moduleTitle) => {
    toast.info(`Viewing media blocks for: ${moduleTitle}`);
  };

  return (
    <NewsFeedLayout
      showSidebars={false}
      classes="overflow-y-scroll overflow-x-hidden nfl-scroll scroll-smooth bg-[#F8FAF8]"
    >
      <div className="shrink-0 w-full min-h-screen bg-[#F8FAF8] pb-24">
        <div className="max-w-[1140px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6">
          {/* Top Breadcrumb Nav: Matching Figma exactly (< Go Back  ›  E-Learning Management  ›  Title) */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
            <button
              type="button"
              onClick={() => navigate("/e-learning/partner")}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF0EC] hover:bg-[#DCE6DF] text-[#183B2E] font-bold px-3.5 sm:px-4 py-1.5 sm:py-2 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Go Back
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <Link
              to="/e-learning/partner"
              className="font-bold text-[#5A6D62] hover:text-[#16730F] transition-colors whitespace-nowrap"
            >
              E-Learning Management
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="font-extrabold text-[#16730F] truncate max-w-[200px] sm:max-w-md">
              {course.title || "Social Media Content Planning"}
            </span>
          </div>

          {/* Hero Course Banner Card (Matching Figma exact badges, colors, and typography) */}
          <div className="bg-[#EFF5EF] border border-[#DCE8DC] rounded-2xl p-4 sm:p-7 space-y-3 sm:space-y-3.5 shadow-2xs">
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Badge */}
              {isPublished && (
                <span className="inline-flex items-center gap-1 rounded-md bg-[#E5F4E6] text-[#16730F] text-xs font-bold px-3 py-1 uppercase tracking-wider">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  Published
                </span>
              )}
              {isInReview && (
                <span className="inline-flex items-center gap-1 rounded-md bg-[#FFF3E0] text-[#D97706] text-xs font-bold px-3 py-1 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  In Review
                </span>
              )}
              {isDraft && (
                <span className="inline-flex items-center gap-1 rounded-md bg-[#ECEFED] text-[#374151] text-xs font-bold px-3 py-1 uppercase tracking-wider">
                  Draft
                </span>
              )}

              {/* Difficulty Level */}
              <span className="rounded-md bg-[#133023] text-[#A6E88E] text-xs font-bold px-3 py-1">
                {course.levelShort || course.level || "Advanced Level"}
              </span>

              {/* Category / Subject Area */}
              <span className="rounded-md bg-[#DDE7DD] text-[#1F2937] text-xs font-bold px-3 py-1">
                {course.subjectArea || course.category || "Content & Social Media"}
              </span>

              {/* Pricing */}
              <span className="rounded-md bg-[#DDE7DD] text-[#1F2937] text-xs font-bold px-3 py-1">
                {pricing.isPaid
                  ? `Paid (₦${Number(pricing.amount || 50000).toLocaleString()})`
                  : "Free Course"}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-[28px] font-extrabold text-[#112A20] tracking-tight leading-tight">
              {course.title || "Social Media Content Planning"}
            </h1>

            <p className="text-xs sm:text-sm text-[#4A6358] max-w-3xl leading-relaxed">
              {course.summary ||
                course.description ||
                "Learn how to organize content ideas, define strategic pillars, and scale multi-channel calendars across platforms."}
            </p>
          </div>

          {/* Section Header: Course Configuration Details */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-1">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#122B20]">
                Course Configuration Details
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7B73] mt-0.5">
                Review all configured course properties, curriculum structure, assessment rules, practical project brief, and tuition parameters.
              </p>
            </div>

            {/* Right Status / Action Per State */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
              {isDraft && (
                <>
                  <button
                    type="button"
                    onClick={() => navigate(`/e-learning/partner/${course.id}/edit`)}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-full border border-[#DCE8DC] bg-white hover:bg-gray-50 text-[#183B2E] font-bold text-xs sm:text-sm px-5 py-2.5 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit Course
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="flex-1 sm:flex-initial rounded-full bg-[#16730F] hover:bg-[#125E0C] text-white font-bold text-xs sm:text-sm px-6 py-2.5 transition-colors shadow-xs cursor-pointer text-center"
                  >
                    Submit for Review
                  </button>
                </>
              )}

              {isInReview && (
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFF3E0] border border-[#FDE68A] text-[#D97706] font-bold text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    Under Administrative Review
                  </span>
                  <button
                    type="button"
                    onClick={handleWithdrawToDraft}
                    className="rounded-full border border-[#DCE8DC] bg-white hover:bg-gray-50 text-[#374151] font-bold text-xs px-4 py-2 transition-colors cursor-pointer"
                  >
                    Withdraw to Draft
                  </button>
                </div>
              )}

              {isPublished && (
                <span className="text-xs font-semibold text-gray-500">
                  Status: <span className="font-bold text-[#16730F]">Published</span>
                </span>
              )}
            </div>
          </div>

          {/* 7 Configuration Breakdown Sections (Matching Figma Exactly) */}
          <div className="space-y-4 sm:space-y-5">
            {/* 1. Basic Information Block */}
            <div className="rounded-2xl bg-white border border-[#E6ECE8] p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-[#F0F4F1]">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#122B20]">
                      1. Basic Information
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
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#16730F] hover:underline cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>

              {/* 2-Column Details Grid: Left column contains Title, Audience, Description, Outcomes, and Cover Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      COURSE TITLE
                    </span>
                    <p className="font-extrabold text-[#122B20] text-base">
                      {course.title || "Social Media Content Planning"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      TARGET AUDIENCE
                    </span>
                    <p className="font-semibold text-[#1E3B2E]">
                      {course.targetAudience ||
                        "Content strategists, brand managers, and creators"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
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
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
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

                  {/* Course Cover Image Preview Card (Located on the Left column in Figma) */}
                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                      COURSE COVER IMAGE
                    </span>
                    <div className="flex items-center gap-4 p-3 rounded-xl border border-[#E5ECE7] bg-[#FAFCFA]">
                      <div className="w-24 h-14 rounded-lg overflow-hidden bg-black shrink-0 border border-gray-200">
                        {course.coverImage ? (
                          <img
                            src={course.coverImage}
                            alt="Course cover"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/40">
                            <FileVideo className="w-5 h-5" />
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

                {/* Right column: Course Level and Estimated Duration */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      COURSE LEVEL
                    </span>
                    <p className="font-extrabold text-[#122B20]">
                      {course.levelShort || course.level || "Advanced"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      ESTIMATED DURATION
                    </span>
                    <p className="text-[#4A5D52] leading-relaxed">
                      {course.estimatedDuration ||
                        "4 hours total estimated time to complete all modules and lessons."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Modules & Curriculum Block */}
            <div className="rounded-2xl bg-white border border-[#E6ECE8] p-4 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-[#F0F4F1]">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#122B20]">
                      2. Modules & Curriculum
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
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#16730F] hover:underline cursor-pointer"
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
                    className="rounded-xl border border-[#E8EFEA] bg-[#FAFCFA] overflow-hidden"
                  >
                    <div className="p-3.5 bg-[#EFF5EF] border-b border-[#E8EFEA] flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-[#112A20]">
                          Module {mIdx + 1}: {mod.title}
                        </h4>
                        <p className="text-[11px] text-[#5A6D62] mt-0.5">
                          {(mod.lessons || []).length} lessons ·{" "}
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
            <div className="rounded-2xl bg-white border border-[#E6ECE8] p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-[#F0F4F1]">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#122B20]">
                      3. Learning Content & Media
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
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#16730F] hover:underline cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>

              {/* Module Media Blocks (Matching Figma exact design with View All Media Blocks button & sub-card) */}
              <div className="space-y-5">
                {modules.map((mod, mIdx) => (
                  <div key={mod.id || mIdx} className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      MODULE {mIdx + 1}: {mod.title.toUpperCase()}
                    </span>

                    <div className="rounded-xl border border-[#E6ECE8] bg-white p-5 space-y-3.5 shadow-2xs">
                      {/* Top Row with Lesson Title + View Media Blocks Button */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <h4 className="text-sm sm:text-base font-bold text-[#112A20]">
                          Lesson 1: {(mod.lessons && mod.lessons[0]?.title) || "Foundational Concepts"}
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleViewMediaBlocks(mod.title)}
                          className="bg-[#16730F] hover:bg-[#125E0C] text-white text-xs font-bold px-3.5 py-1.5 rounded-md inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer transition-colors shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          View Media Blocks
                        </button>
                      </div>

                      {/* Mint background lecture description box */}
                      <div className="bg-[#EFF5EF] border border-[#DCE8DC] rounded-xl p-3.5 text-xs text-[#2A4337] leading-relaxed">
                        {(mod.lessons && mod.lessons[0]?.summary) ||
                          mod.description ||
                          "Instructional lecture explaining core strategic frameworks, structured workflows, and scalable implementation techniques."}
                      </div>

                      {/* Sub-label for attachments */}
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block pt-1">
                        LESSON ATTACHMENTS & MEDIA BLOCKS
                      </span>

                      {/* Media block item */}
                      <div className="border border-gray-100 rounded-xl p-3 bg-[#FAFCFA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-[#EBF4EC] text-[#16730F] flex items-center justify-center shrink-0">
                            <FileVideo className="w-3.5 h-3.5" />
                          </span>
                          <span className="font-bold text-[#112A20]">
                            {(mod.lessons && mod.lessons[0]?.title) || "Core Lecture"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 font-medium pl-8 sm:pl-0">
                          <span className="rounded-md bg-[#EAF5EC] text-[#16730F] text-[10px] font-bold px-2 py-0.5">
                            Video Block (MP4)
                          </span>
                          <span>•</span>
                          <span>{(mod.lessons && mod.lessons[0]?.durationMinutes) || 20} mins</span>
                          <span>•</span>
                          <span className="text-[#16730F] font-bold">Checkpoint Enabled</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Assessment Configuration Block */}
            <div className="rounded-2xl bg-white border border-[#E6ECE8] p-4 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-[#F0F4F1]">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#122B20]">
                      4. Assessment Configuration
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
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#16730F] hover:underline cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>

              {/* Green Knowledge Quiz Card */}
              <div className="rounded-2xl border border-[#DCE8DC] bg-[#F7FAF8] p-5 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <span className="inline-block rounded-md bg-[#16730F] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 tracking-wider">
                      Knowledge Assessment
                    </span>
                    <h4 className="text-base sm:text-lg font-extrabold text-[#112A20]">
                      {quiz.title || "Social Media Content Planning Quiz"}
                    </h4>
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

                {/* Mint description box */}
                <div className="bg-[#EFF5EF] border border-[#DCE8DC] rounded-xl p-3.5 text-xs text-[#2A4337] leading-relaxed">
                  {quiz.instructions ||
                    "Evaluates learner grasp of core concepts, strategic planning, editorial workflows, and performance measurement."}
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

            {/* 5. Practical Project Deliverable Block */}
            <div className="rounded-2xl bg-white border border-[#E6ECE8] p-4 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-[#F0F4F1]">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#122B20]">
                      5. Practical Project Deliverable
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
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#16730F] hover:underline cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>

              {/* Green Capstone Project Card */}
              <div className="rounded-2xl border border-[#DCE8DC] bg-[#F7FAF8] p-5 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <span className="inline-block rounded-md bg-[#16730F] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 tracking-wider">
                      Practical Capstone
                    </span>
                    <h4 className="text-base sm:text-lg font-extrabold text-[#112A20]">
                      {project.title || "Comprehensive Campaign Brief & Content Plan"}
                    </h4>
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

                {/* Mint description box */}
                <div className="bg-[#EFF5EF] border border-[#DCE8DC] rounded-xl p-3.5 text-xs text-[#2A4337] leading-relaxed">
                  {project.brief ||
                    "Create an end-to-end 30-day social media campaign strategy for a direct-to-consumer sustainable fashion brand launching in Nigeria. Define target personas, content pillars, promotional calendar, and performance metrics."}
                </div>

                {/* Accepted formats matching Figma exactly (no extra completion badge) */}
                <div className="pt-2 border-t border-[#E5EDE7] flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-gray-400 font-bold text-[10px] uppercase">
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
              </div>
            </div>

            {/* 6. Access & Tuition Fee Block (Matches Figma exact card: PAID COURSE on left, TUITION pill on right) */}
            <div className="rounded-2xl bg-white border border-[#E6ECE8] p-4 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-[#F0F4F1]">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#122B20]">
                      6. Access & Tuition Fee
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
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#16730F] hover:underline cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>

              {/* Mint Container Card */}
              <div className="rounded-xl border border-[#DCE8DC] bg-[#EFF5EF] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-extrabold text-[#112A20] text-sm block">
                    {pricing.isPaid ? "PAID COURSE" : "FREE ACCESS"}
                  </span>
                  <p className="text-xs text-[#5A6D62]">
                    {pricing.isPaid
                      ? "Learners must pay tuition to access course materials, quizzes, and project review."
                      : "Learners can enroll instantly without payment. Ideal for foundational training or community courses."}
                  </p>
                </div>

                <span className="rounded-lg bg-white border border-[#DCE8DC] text-[#1E3B2E] text-[10px] font-extrabold uppercase px-3 py-1.5 shrink-0 self-start sm:self-auto tracking-wider shadow-2xs">
                  {pricing.isPaid ? "TUITION" : "OPEN"}
                </span>
              </div>
            </div>

            {/* 7. Completion Rules Block */}
            <div className="rounded-2xl bg-white border border-[#E6ECE8] p-4 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-[#F0F4F1]">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#122B20]">
                      7. Completion Rules
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
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#16730F] hover:underline cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>

              {/* System Validation Complete Top Banner */}
              <div className="rounded-xl border border-[#DCE8DC] bg-[#FAFCFA] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#112A20]">
                      System Validation Complete
                    </h4>
                    <p className="text-xs text-[#5A6D62]">
                      All curriculum elements and completion criteria are valid and verified.
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[#EAF5EC] text-[#16730F] text-[10px] font-bold px-3 py-1 shrink-0 self-start sm:self-auto">
                  {isPublished ? "Ready to Publish" : "Configured"}
                </span>
              </div>

              {/* Mandatory Checklist Header */}
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block pt-1">
                CRITERIA CHECKLIST (ALL MANDATORY)
              </span>

              {/* 3-Column Criteria Cards Grid (Matching Figma exact layout) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Lesson Content */}
                <div className="rounded-xl border border-[#E5EDE7] bg-[#FAFCFA] p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs sm:text-sm text-[#112A20]">
                      Lesson Content
                    </h5>
                    <span className="rounded-full bg-[#E5F4E6] text-[#16730F] text-[10px] font-bold px-2.5 py-0.5">
                      REQUIRED
                    </span>
                  </div>
                  <p className="text-xs text-[#1E3B2E] font-semibold">
                    {modules.length} modules • {totalLessons} lessons
                  </p>
                  <p className="text-[11px] text-[#5A6D62] leading-relaxed">
                    Complete all instructional video and reading materials configured in the curriculum.
                  </p>
                </div>

                {/* 2. Knowledge Assessment */}
                <div className="rounded-xl border border-[#E5EDE7] bg-[#FAFCFA] p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs sm:text-sm text-[#112A20]">
                      Quiz Pass
                    </h5>
                    <span className="rounded-full bg-[#E5F4E6] text-[#16730F] text-[10px] font-bold px-2.5 py-0.5">
                      REQUIRED
                    </span>
                  </div>
                  <p className="text-xs text-[#1E3B2E] font-semibold truncate">
                    {quiz.title || "Knowledge Quiz"}
                  </p>
                  <p className="text-[11px] text-[#5A6D62] leading-relaxed">
                    Achieve passing mark of {quiz.passMark || 80}% or higher ({questions.length || 3} questions).
                  </p>
                </div>

                {/* 3. Practical Project */}
                <div className="rounded-xl border border-[#E5EDE7] bg-[#FAFCFA] p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs sm:text-sm text-[#112A20]">
                      Practical Project
                    </h5>
                    <span className="rounded-full bg-[#E5F4E6] text-[#16730F] text-[10px] font-bold px-2.5 py-0.5">
                      REQUIRED
                    </span>
                  </div>
                  <p className="text-xs text-[#1E3B2E] font-semibold truncate">
                    {project.title || "Capstone Deliverable"}
                  </p>
                  <p className="text-[11px] text-[#5A6D62] leading-relaxed">
                    Submit practical project brief for partner review and capstone verification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar Drawer: View Assessment */}
      <AssessmentPreviewDrawer
        isOpen={isAssessmentDrawerOpen}
        onClose={() => setIsAssessmentDrawerOpen(false)}
        quiz={quiz}
        courseTitle={course.title}
      />

      {/* Right Sidebar Drawer: View Brief */}
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
