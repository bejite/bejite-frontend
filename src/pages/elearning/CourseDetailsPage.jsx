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
} from "lucide-react";
import {
  ELearningLayout,
  ELearningBackPill,
  ELearningBadge,
  ELearningButton,
  CourseProgressBar,
  CurriculumModuleAccordion,
  ELearningSideCard,
  ELearningSectionHeader,
  CourseCatalogCard,
  KnowledgeQuizModal,
  DeliverableWorkspaceModal,
} from "../../components/elearning";
import {
  getCourseById,
  getPartnerCourses,
  enrollInCourse,
  setCurrentLesson,
  recordQuizSubmission,
  submitCourseDeliverable,
} from "../../services/elearningService";

export default function CourseDetailsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(() => getCourseById(courseId));
  const [partnerCourses, setPartnerCourses] = useState(() =>
    getPartnerCourses(course?.partnerId, course?.id)
  );
  const [quizOpen, setQuizOpen] = useState(false);
  const [deliverableOpen, setDeliverableOpen] = useState(false);

  useEffect(() => {
    const loaded = getCourseById(courseId);
    setCourse(loaded);
    setPartnerCourses(getPartnerCourses(loaded?.partnerId, loaded?.id));
  }, [courseId]);

  if (!course) return null;

  const handleStartOrContinue = () => {
    enrollInCourse(course.id);
    navigate(`/e-learning/courses/${course.id}/learn`);
  };

  const handleOpenLesson = (lesson) => {
    setCurrentLesson(course.id, lesson.id);
    navigate(`/e-learning/courses/${course.id}/learn`);
  };

  return (
    <ELearningLayout activeNavId="dashboard">
      <div className="space-y-6">
        {/* Top Back Pill */}
        <div>
          <ELearningBackPill
            label="Back to Courses"
            onClick={() => navigate("/e-learning")}
          />
        </div>

        {/* Hero Course Banner Card */}
        <div className="bg-[#EFF5EF] border border-[#DCE8DC] rounded-2xl p-6 sm:p-7 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <ELearningBadge variant="solidGreen">{course.level}</ELearningBadge>
            <ELearningBadge variant="neutral">{course.category}</ELearningBadge>
            <ELearningBadge variant="neutral">
              {course.accessLabel}
            </ELearningBadge>
          </div>

          <div>
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/e-learning/explore?partner=${encodeURIComponent(
                    course.partnerId
                  )}`
                )
              }
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16730F] hover:underline cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span>Offered by {course.partnerName}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#112A20] tracking-tight mt-1">
              {course.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#4A6358] mt-1.5 max-w-3xl leading-relaxed">
              {course.summary}
            </p>
          </div>

          {/* Course Meta Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-600 pt-0.5">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Layers className="w-3.5 h-3.5 text-[#16730F]" />
              {course.totalModules} Modules
            </span>
            <span className="text-gray-300">•</span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <BookOpen className="w-3.5 h-3.5 text-[#16730F]" />
              {course.totalLessons} Practical Lessons
            </span>
            <span className="text-gray-300">•</span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#16730F]" />
              {course.totalDurationLabel}
            </span>
            <span className="text-gray-300">•</span>
            <span>
              Partner:{" "}
              <strong className="text-gray-900">{course.partnerName}</strong>
            </span>
          </div>

          {/* Progress & Primary CTA */}
          <div className="pt-4 border-t border-[#DCE8DC] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CourseProgressBar
              className="flex-1 max-w-xl"
              label="Your Current Progress"
              percent={course.overallPercent}
              rightText={`${course.overallPercent}% Complete`}
              trackClassName="bg-white"
              footer={
                <>
                  <span>
                    {course.completedLessonsCount} of {course.totalLessons}{" "}
                    lessons finished • Next up:{" "}
                  </span>
                  <strong className="text-gray-900">
                    {course.nextLesson?.title || "Review Course"}
                  </strong>
                </>
              }
            />

            <ELearningButton
              variant="primary"
              size="lg"
              leftIcon={PlayCircle}
              onClick={handleStartOrContinue}
              className="md:min-w-[205px]"
            >
              {course.enrolled ? "Continue Learning" : "Enroll & Start Course"}
            </ELearningButton>
          </div>
        </div>

        {/* Two-Column Syllabus & Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_290px] gap-6 items-start">
          {/* Left Main Column */}
          <div className="space-y-6">
            {/* What You Will Learn */}
            <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#16730F]" />
                <h2 className="text-base font-extrabold text-gray-900">
                  What You Will Learn
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {(course.learningOutcomes || []).map((outcome, idx) => (
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
            <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
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
              <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
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

                  <ELearningBadge variant="statusSuccess">
                    {course.deliverable.badge || "Portfolio Deliverable"}
                  </ELearningBadge>
                </div>

                <div className="border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-2.5">
                  <h3 className="text-sm font-extrabold text-gray-900">
                    {course.deliverable.title}
                  </h3>
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
            <ELearningSideCard
              overline="COURSE PARTNER"
              icon={Building2}
              footer={
                <ELearningButton
                  variant="soft"
                  size="sm"
                  fullWidth
                  leftIcon={Building2}
                  onClick={() =>
                    navigate(
                      `/e-learning/explore?partner=${encodeURIComponent(
                        course.partnerId
                      )}`
                    )
                  }
                >
                  View All Courses from This Partner
                </ELearningButton>
              }
            >
              <p className="text-sm font-extrabold text-gray-900">
                {course.partnerName}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                {course.partnerDescription}
              </p>
            </ELearningSideCard>

            {/* Knowledge Assessment Quiz */}
            {course.quiz && (
              <ELearningSideCard
                title="Knowledge Assessment Quiz"
                icon={HelpCircle}
                footer={
                  <ELearningButton
                    variant="soft"
                    size="sm"
                    fullWidth
                    leftIcon={PlayCircle}
                    onClick={() => setQuizOpen(true)}
                  >
                    Take Quiz
                  </ELearningButton>
                }
              >
                <p className="text-xs text-gray-500">
                  {course.quiz.description}
                </p>

                <div className="pt-1 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Questions</span>
                    <span className="font-bold text-gray-900">
                      {course.quiz.questions?.length || 0} Questions
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Passing Score</span>
                    <span className="font-bold text-gray-900">
                      {course.quiz.passMark}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Allowed Attempts</span>
                    <span className="font-bold text-gray-900">
                      {course.quiz.allowedAttempts || "Unlimited"}
                    </span>
                  </div>
                </div>
              </ELearningSideCard>
            )}

            {/* Completion Criteria */}
            <ELearningSideCard
              title="Completion Criteria"
              icon={CheckCircle2}
              footer={
                <ELearningButton
                  variant="soft"
                  size="sm"
                  fullWidth
                  leftIcon={CheckCircle2}
                  onClick={() =>
                    navigate(`/e-learning/courses/${course.id}/progress`)
                  }
                >
                  View Progress & Detailed Requirements
                </ELearningButton>
              }
            >
              <p className="text-xs text-gray-500">
                To complete this course and earn verified evidence for your
                Bejite talent profile:
              </p>

              <ul className="space-y-2 pt-1">
                <li className="flex items-start gap-2 text-xs text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16730F] mt-1.5 shrink-0" />
                  <span>Complete all {course.totalLessons} curriculum lessons</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16730F] mt-1.5 shrink-0" />
                  <span>
                    Pass the knowledge quiz with at least{" "}
                    {course.quiz?.passMark || 80}%
                  </span>
                </li>
                <li className="flex items-start gap-2 text-xs text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16730F] mt-1.5 shrink-0" />
                  <span>Submit the practical project deliverable</span>
                </li>
              </ul>
            </ELearningSideCard>

            {/* Bejite Talent Ecosystem Note */}
            <ELearningSideCard
              overline="BEJITE TALENT ECOSYSTEM"
              icon={ShieldCheck}
              tone="sage"
            >
              <p className="text-[11px] text-[#355246] leading-relaxed">
                Course completion equips you with verified skills evidence.
                Please remember that course completion does not automatically
                guarantee employment, paid placements, interviews, or
                professional certification.
              </p>
            </ELearningSideCard>
          </div>
        </div>

        {/* Partner Catalogue Bottom Section */}
        {partnerCourses.length > 0 && (
          <section className="pt-4 space-y-4">
            <ELearningSectionHeader
              overline="PARTNER CATALOGUE"
              overlineIcon={BookOpen}
              title={`More Courses from ${course.partnerName}`}
              subtitle="Explore related guided curriculums offered by the same partner academy."
              actionLabel="View all partner courses"
              showActionChevron
              onActionClick={() =>
                navigate(
                  `/e-learning/explore?partner=${encodeURIComponent(
                    course.partnerId
                  )}`
                )
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {partnerCourses.slice(0, 2).map((related) => (
                <CourseCatalogCard
                  key={related.id}
                  course={related}
                  onViewCourse={(c) => navigate(`/e-learning/courses/${c.id}`)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Interactive Modals */}
      <KnowledgeQuizModal
        quiz={course.quiz}
        isOpen={quizOpen}
        onClose={() => setQuizOpen(false)}
        onSubmitQuiz={(answers) => {
          const outcome = recordQuizSubmission(course.id, answers);
          if (outcome?.course) setCourse(outcome.course);
          return outcome;
        }}
      />

      <DeliverableWorkspaceModal
        deliverable={course.deliverable}
        existingState={course.deliverableState}
        isOpen={deliverableOpen}
        onClose={() => setDeliverableOpen(false)}
        onSubmitDeliverable={(payload) => {
          const updated = submitCourseDeliverable(course.id, payload);
          setCourse(updated);
        }}
      />
    </ELearningLayout>
  );
}

