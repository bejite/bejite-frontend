import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Building2,
  ChevronRight,
  Layers,
  BookOpen,
  Clock,
  PlayCircle,
  Bookmark,
  CheckCircle2,
  FileText,
  HelpCircle,
  ShieldCheck,
  Check,
} from "lucide-react";
import {
  ELearningLayout,
  ELearningBackPill,
  CurriculumModuleAccordion,
  CourseCatalogCard,
} from "../../../components/elearning";
import {
  getCourseById,
  getPartnerCourses,
  enrollInCourse,
  setCurrentLesson,
} from "../../../services/elearningService";

export default function CourseDetailsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(() => getCourseById(courseId));
  const [partnerCourses, setPartnerCourses] = useState(() =>
    getPartnerCourses(course?.partnerId, course?.id)
  );

  useEffect(() => {
    const loaded = getCourseById(courseId);
    setCourse(loaded);
    setPartnerCourses(getPartnerCourses(loaded?.partnerId, loaded?.id));
  }, [courseId]);

  if (!course) return null;

  const handleEnroll = () => {
    enrollInCourse(course.id);
    const updated = getCourseById(course.id);
    setCourse(updated);
  };

  const handleStartOrContinue = () => {
    if (!course.enrolled) {
      enrollInCourse(course.id);
    }
    navigate(`/e-learning/jobseeker/courses/${course.id}/learn`);
  };

  const handleOpenLesson = (lesson) => {
    setCurrentLesson(course.id, lesson.id);
    navigate(`/e-learning/jobseeker/courses/${course.id}/learn`);
  };

  const formatNextLessonLabel = () => {
    if (!course.nextLesson) return "Review Course";
    let modNumber = 1;
    let lessonIndex = 1;
    if (course.modules) {
      for (let m = 0; m < course.modules.length; m++) {
        const mod = course.modules[m];
        const idx = (mod.lessons || []).findIndex((l) => l.id === course.nextLesson.id);
        if (idx !== -1) {
          modNumber = m + 1;
          lessonIndex = idx + 1;
          break;
        }
      }
    }
    return `Module ${modNumber} / Lesson ${lessonIndex} - ${course.nextLesson.title}`;
  };

  return (
    <ELearningLayout activeNavId="dashboard">
      <div className="space-y-6">
        {/* Top Back Pill */}
        <div>
          <ELearningBackPill
            label="Back to Courses"
            onClick={() => navigate("/e-learning/jobseeker/explore")}
          />
        </div>

        {/* Hero Course Banner Card (Dual-State: Unenrolled [Image 2 & 3] & Enrolled [Image 4]) */}
        <div className="bg-[#EFF5EF] border border-[#DCE8DC] rounded-2xl p-4 sm:p-7 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#133023] text-[#A6E88E] text-[11px] font-bold px-3 py-1 rounded-md">
              {course.level}
            </span>
            <span className="bg-[#DDE7DD] text-gray-800 text-[11px] font-bold px-3 py-1 rounded-md">
              {course.category}
            </span>
            <span className="bg-[#DDE7DD] text-gray-800 text-[11px] font-bold px-3 py-1 rounded-md">
              {course.isPaid ? "Paid Course" : "Free Course"}
            </span>
          </div>

          <div>
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/e-learning/jobseeker/explore?partner=${encodeURIComponent(
                    course.partnerId
                  )}`
                )
              }
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16730F] hover:underline cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>Offered by {course.partnerName}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <h1 className="text-xl sm:text-2xl lg:text-[28px] font-extrabold text-[#112A20] tracking-tight mt-1">
              {course.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#4A6358] mt-1.5 max-w-3xl leading-relaxed">
              {course.summary}
            </p>
          </div>

          {/* Course Meta Row */}
          <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1.5 text-xs text-gray-600 pt-0.5">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Layers className="w-3.5 h-3.5 text-[#16730F]" />
              {course.totalModules} Modules
            </span>
            <span className="text-gray-300">•</span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <BookOpen className="w-3.5 h-3.5 text-[#16730F]" />
              {course.totalLessons} Practical Lessons
            </span>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#16730F]" />
              {course.totalDurationLabel || "Approx 21 hours of content"}
            </span>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <span>
              Partner:{" "}
              <strong className="text-gray-900 font-semibold">{course.partnerName}</strong>
            </span>
          </div>

          {/* Hero Bottom Dual State:
              - Paid Unenrolled (Image 2): Forest green card with "Course Fee: N45,000" and "Proceed to Checkout (Paid Course)"
              - Free Unenrolled (Image 3): Forest green card with "Free Course Enrolment" and "Enroll in Course" CTA
              - Enrolled (Image 4): Progress bar, % Complete, Next Lesson label and "Start/Continue Learning" CTA
          */}
          {!course.enrolled ? (
            course.isPaid ? (
              <div className="bg-[#122F22] rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Course Fee: {course.priceBadge || "N50,000"}
                  </h3>
                  <p className="text-xs text-[#A1BDB0] leading-relaxed max-w-xl">
                    Paid course enrolment. Once payment is made, access is unlocked.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(`/e-learning/jobseeker/courses/${course.id}/checkout`)
                  }
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#4F7327] hover:bg-[#436221] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shrink-0 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Proceed to Checkout (Paid Course)</span>
                </button>
              </div>
            ) : (
              <div className="bg-[#122F22] rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Free Course Enrolment
                  </h3>
                  <p className="text-xs text-[#A1BDB0] leading-relaxed max-w-xl">
                    Open to all registered talent on Bejite. Enroll now to begin your curriculum today.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleEnroll}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#4F7327] hover:bg-[#436221] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shrink-0 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Enroll in Course</span>
                </button>
              </div>
            )
          ) : (
            <div className="pt-2 border-t border-[#DCE8DC] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700">Your Current Progress</span>
                <span className="font-bold text-[#16730F]">{course.overallPercent || 0}% Complete</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#DCE8DC] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#16730F] h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(course.overallPercent || 0, 0)}%` }}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <p className="text-xs text-gray-600">
                  Next Lesson:{" "}
                  <strong className="text-gray-900 font-semibold">
                    {formatNextLessonLabel()}
                  </strong>
                </p>

                <button
                  type="button"
                  onClick={handleStartOrContinue}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#16730F] hover:bg-[#125E0C] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 shadow-sm"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>{course.overallPercent > 0 ? "Continue Learning" : "Start Learning"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Two-Column Syllabus & Details Grid (Matching Image 2, 3 & 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
          {/* Left Main Column */}
          <div className="space-y-6">
            {/* What You Will Learn (2x2 checkmark grid) */}
            <section className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#16730F]" />
                <h2 className="text-base font-extrabold text-gray-900">
                  What You Will Learn
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {(course.learningOutcomes || [
                  "Explain what digital marketing covers.",
                  "Identify a target audience.",
                  "Choose suitable content for a simple campaign.",
                  "Outline a basic campaign plan.",
                ]).map((outcome, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#16730F] shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Course Curriculum & Lessons */}
            <section className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 space-y-4">
              <div>
                <h2 className="text-base font-extrabold text-gray-900">
                  Course Curriculum & Lessons
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {course.totalModules} Modules • {course.totalLessons} Lessons
                </p>
              </div>

              <CurriculumModuleAccordion
                modules={course.modules}
                completedLessonIds={course.completedLessonIds}
                variant="syllabus"
                defaultExpandedFirstOnly
                onSelectLesson={handleOpenLesson}
              />
            </section>

            {/* Practical Project Deliverable */}
            {course.deliverable && (
              <section className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EEF7EE] text-[#16730F] flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-gray-900">
                        Practical Project Deliverable
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Real-world assignment evaluated for recruitment profiles
                      </p>
                    </div>
                  </div>

                  <span className="border border-[#16730F]/40 text-[#16730F] bg-[#F4F9F4] text-[11px] font-bold px-3 py-1 rounded-full">
                    {course.deliverable.badge || "Evidence Deliverable"}
                  </span>
                </div>

                <div className="border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-extrabold text-gray-900">
                      {course.deliverable.title}
                    </h3>
                  </div>

                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                    INSTRUCTIONS:
                  </p>
                  <div className="bg-[#FAFAFA] border border-gray-100 rounded-xl p-3.5 text-xs text-gray-700 leading-relaxed">
                    {course.deliverable.instructions}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Right Info Sidebar */}
          <div className="space-y-4">
            {/* Course Partner */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#16730F]" />
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#16730F]">
                  COURSE PARTNER
                </p>
              </div>

              <div>
                <p className="text-sm font-extrabold text-gray-900">
                  {course.partnerName}
                </p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {course.partnerDescription ||
                    "Practical curriculum focused on real-world employer-aligned digital marketing and growth fundamentals."}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/e-learning/jobseeker/explore?partner=${encodeURIComponent(
                      course.partnerId
                    )}`
                  )
                }
                className="w-full bg-[#EFF5EF] hover:bg-[#E3EDE3] text-[#16730F] font-bold text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer text-center"
              >
                View All Courses from This Partner
              </button>
            </div>

            {/* Knowledge Assessment Quiz */}
            {course.quiz && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#16730F]" />
                  <p className="text-sm font-extrabold text-gray-900">
                    Knowledge Assessment Quiz
                  </p>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">
                  {course.quiz.description}
                </p>

                <div className="pt-1 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Questions</span>
                    <span className="font-bold text-gray-900">
                      {course.quiz.questions?.length || 8} Questions
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Passing Score</span>
                    <span className="font-bold text-gray-900">
                      {course.quiz.passMark || 80}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Allowed Attempts</span>
                    <span className="font-bold text-gray-900">
                      {course.quiz.allowedAttempts || "Unlimited"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(`/e-learning/jobseeker/courses/${course.id}/assessment`)
                  }
                  className="w-full bg-[#EFF5EF] hover:bg-[#E3EDE3] text-[#16730F] font-bold text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer text-center"
                >
                  Take Quiz
                </button>
              </div>
            )}

            {/* Completion Criteria */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16730F]" />
                <p className="text-sm font-extrabold text-gray-900">
                  Completion Criteria
                </p>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                To complete this course and earn verified evidence for your
                Bejite talent profile:
              </p>

              <ul className="space-y-2 pt-1">
                <li className="flex items-start gap-2 text-xs text-gray-700">
                  <Check className="w-3.5 h-3.5 text-[#16730F] mt-0.5 shrink-0" />
                  <span>Complete all {course.totalLessons} curriculum lessons</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-gray-700">
                  <Check className="w-3.5 h-3.5 text-[#16730F] mt-0.5 shrink-0" />
                  <span>
                    Pass the knowledge quiz with at least{" "}
                    {course.quiz?.passMark || 80}%
                  </span>
                </li>
                <li className="flex items-start gap-2 text-xs text-gray-700">
                  <Check className="w-3.5 h-3.5 text-[#16730F] mt-0.5 shrink-0" />
                  <span>Submit the practical project deliverable</span>
                </li>
              </ul>

              <button
                type="button"
                onClick={() =>
                  navigate(`/e-learning/jobseeker/courses/${course.id}/progress`)
                }
                className="w-full bg-[#EFF5EF] hover:bg-[#E3EDE3] text-[#16730F] font-bold text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer text-center"
              >
                View Progress & Detailed Requirements
              </button>
            </div>

            {/* Bejite Talent Ecosystem Sage Card */}
            <div className="bg-[#EEF4EE] border border-[#D7E3D7] rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-[#16730F]">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <p className="text-[10px] font-extrabold uppercase tracking-wider">
                  BEJITE TALENT ECOSYSTEM
                </p>
              </div>
              <p className="text-[11px] text-[#355246] leading-relaxed">
                Course completion equips you with verified skills evidence.
                Please remember that course completion does not automatically
                guarantee employment, paid placements, interviews, or
                professional certification.
              </p>
            </div>
          </div>
        </div>

        {/* Partner Catalogue Bottom Section */}
        {partnerCourses.length > 0 && (
          <section className="pt-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#16730F]">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>PARTNER CATALOGUE</span>
                </div>
                <h2 className="text-lg font-extrabold text-gray-900 mt-0.5">
                  More Courses from {course.partnerName}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Discover vetted and published courses designed to equip your career with in-demand industry competency.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/e-learning/jobseeker/explore?partner=${encodeURIComponent(
                      course.partnerId
                    )}`
                  )
                }
                className="text-xs font-bold text-[#16730F] hover:underline cursor-pointer shrink-0"
              >
                View all partner courses &gt;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {partnerCourses.slice(0, 2).map((related) => (
                <CourseCatalogCard
                  key={related.id}
                  course={related}
                  onViewCourse={(c) => navigate(`/e-learning/jobseeker/courses/${c.id}`)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </ELearningLayout>
  );
}

