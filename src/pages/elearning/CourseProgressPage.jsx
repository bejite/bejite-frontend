import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Clock,
  CheckCircle2,
  HelpCircle,
  FileText,
  ShieldCheck,
  PlayCircle,
} from "lucide-react";
import {
  ELearningLayout,
  ELearningBackPill,
  ELearningBadge,
  ELearningButton,
  CompletionCriterionCard,
  CurriculumModuleAccordion,
  ELearningSideCard,
} from "../../components/elearning";
import {
  getCourseById,
  setCurrentLesson,
} from "../../services/elearningService";

export default function CourseProgressPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(() => getCourseById(courseId));

  useEffect(() => {
    setCourse(getCourseById(courseId));
  }, [courseId]);

  if (!course) return null;

  const { criteria, quizState, deliverableState } = course;

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
            label="My Learning"
            onClick={() => navigate("/e-learning/my-learning")}
          />
        </div>

        {/* Hero Progress Summary Banner */}
        <div className="bg-[#EFF5EF] border border-[#DCE8DC] rounded-2xl p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="min-w-0 max-w-2xl">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
              <span className="font-bold text-[#16730F]">{course.category}</span>
              <span>•</span>
              <span>Level: {course.levelShort}</span>
              <span>•</span>
              <span>{course.totalLessons} Total Lessons</span>
              <span>•</span>
              <span>{course.accessLabel}</span>
            </div>

            <h1 className="text-2xl sm:text-[26px] font-extrabold text-[#112A20] tracking-tight mt-1.5">
              {course.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#4A6358] mt-1.5 leading-relaxed">
              Track your exact completion status across required curriculum
              lessons, knowledge assessments, and practical project
              deliverables.
            </p>
          </div>

          {/* Olive / Forest Progress Summary Box */}
          <div className="bg-[#4B6322] text-white rounded-2xl p-4 sm:p-5 w-full lg:w-[278px] shrink-0 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/85">
                OVERALL COURSE PROGRESS
              </span>
              <span className="text-2xl font-extrabold text-[#4ADE80] leading-none">
                {course.overallPercent}%
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-white/90 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#22C55E] transition-all duration-300"
                style={{ width: `${course.overallPercent}%` }}
              />
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-white/90 font-medium pt-0.5">
              <span>Status:</span>
              {criteria.allComplete ? (
                <span className="inline-flex items-center gap-1 font-bold text-[#86EFAC]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Completed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-white/80" />
                  Requirements Outstanding
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Two-Column Criteria & Detailed Lesson Progress Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_325px] gap-6 items-start">
          {/* Left Main Column */}
          <div className="space-y-6">
            {/* Configured Completion Criteria */}
            <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-extrabold text-gray-900">
                    Configured Completion Criteria
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Based on the rules set for this course by the partner.
                  </p>
                </div>

                <span className="text-xs font-bold text-gray-600">
                  {criteria.satisfiedCount} of {criteria.totalCount} Satisfied
                </span>
              </div>

              <div className="space-y-3">
                <CompletionCriterionCard
                  stepNumber={1}
                  title="Complete All Lessons"
                  required
                  satisfied={criteria.lessonsSatisfied}
                  description="Study and mark complete every lesson inside all curriculum modules."
                  targetLabel={`${course.totalLessons} lessons`}
                  currentLabel={`${course.completedLessonsCount} completed`}
                  actionLabel={
                    criteria.lessonsSatisfied
                      ? "Review Learning"
                      : "Continue Learning"
                  }
                  onAction={() =>
                    navigate(`/e-learning/courses/${course.id}/learn`)
                  }
                />

                {course.quiz && (
                  <CompletionCriterionCard
                    stepNumber={2}
                    title={course.quiz.title}
                    required
                    satisfied={criteria.quizSatisfied}
                    description={`Complete the configured assessment quiz and achieve a passing score of at least ${course.quiz.passMark}%.`}
                    targetLabel={`>= ${course.quiz.passMark}% pass mark`}
                    currentLabel={`${quizState?.bestScore ?? 0}% score`}
                    actionLabel={
                      criteria.quizSatisfied
                        ? "Review Assessment"
                        : "Start Assessment"
                    }
                    onAction={() =>
                      navigate(
                        criteria.quizSatisfied
                          ? `/e-learning/courses/${course.id}/assessment?mode=review`
                          : `/e-learning/courses/${course.id}/assessment`
                      )
                    }
                  />
                )}

                {course.deliverable && (
                  <CompletionCriterionCard
                    stepNumber={3}
                    title={course.deliverable.title}
                    required
                    satisfied={criteria.deliverableSatisfied}
                    description="Submit required practical project evidence."
                    targetLabel="Approved submission"
                    currentLabel={
                      deliverableState?.submitted
                        ? "Submitted"
                        : "Not Submitted"
                    }
                    actionLabel={
                      deliverableState?.submitted
                        ? "View Project"
                        : "Submit Deliverable"
                    }
                    onAction={() =>
                      navigate(`/e-learning/courses/${course.id}/project`)
                    }
                  />
                )}
              </div>
            </section>

            {/* Lesson & Curriculum Progress */}
            <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-extrabold text-gray-900">
                    Lesson & Curriculum Progress
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Detailed status of each module and lesson in this course.
                  </p>
                </div>

                <ELearningBadge variant="statusSuccess">
                  {course.completedLessonsCount} / {course.totalLessons} Lessons
                  Finished
                </ELearningBadge>
              </div>

              <CurriculumModuleAccordion
                modules={course.modules}
                completedLessonIds={course.completedLessonIds}
                currentLessonId={
                  course.nextLesson?.id || course.currentLesson?.id
                }
                variant="progress"
                onSelectLesson={handleOpenLesson}
              />
            </section>
          </div>

          {/* Right Status Sidebar */}
          <div className="space-y-4">
            {/* Assessment Status */}
            {course.quiz && (
              <ELearningSideCard
                title="Assessment Status"
                icon={HelpCircle}
                headerDivider
                headerBadge={
                  <ELearningBadge
                    variant={
                      quizState?.passed ? "statusSuccess" : "statusMuted"
                    }
                  >
                    {quizState?.passed
                      ? "Passed"
                      : quizState?.attempts > 0
                        ? "Attempted"
                        : "Not Started"}
                  </ELearningBadge>
                }
                footer={
                  <ELearningButton
                    variant="soft"
                    size="sm"
                    fullWidth
                    leftIcon={quizState?.passed ? HelpCircle : PlayCircle}
                    onClick={() =>
                      navigate(
                        quizState?.passed
                          ? `/e-learning/courses/${course.id}/assessment?mode=review`
                          : `/e-learning/courses/${course.id}/assessment`
                      )
                    }
                  >
                    {quizState?.passed
                      ? "Review Quiz Answers"
                      : "Open Assessment"}
                  </ELearningButton>
                }
              >
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-400 shrink-0">Quiz Title:</span>
                    <span className="font-bold text-gray-900 truncate">
                      {course.quiz.title}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-400">Required Pass Mark:</span>
                    <span className="font-bold text-gray-900">
                      {course.quiz.passMark}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-400">Latest Score:</span>
                    <span className="font-bold text-gray-900">
                      {quizState?.latestScore != null
                        ? `${quizState.latestScore}%`
                        : "Not Attempted"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-400">Attempts Recorded:</span>
                    <span className="font-bold text-gray-900">
                      {quizState?.attempts || 0}
                    </span>
                  </div>
                </div>
              </ELearningSideCard>
            )}

            {/* Practical Evidence */}
            {course.deliverable && (
              <ELearningSideCard
                title="Practical Evidence"
                icon={FileText}
                headerDivider
                headerBadge={
                  <ELearningBadge
                    variant={
                      deliverableState?.submitted
                        ? "statusSuccess"
                        : "statusMuted"
                    }
                  >
                    {deliverableState?.submitted ? "Submitted" : "Not Submitted"}
                  </ELearningBadge>
                }
                footer={
                  <ELearningButton
                    variant="soft"
                    size="sm"
                    fullWidth
                    leftIcon={FileText}
                    onClick={() =>
                      navigate(`/e-learning/courses/${course.id}/project`)
                    }
                  >
                    {deliverableState?.submitted
                      ? "View Project"
                      : "Open Project Workspace"}
                  </ELearningButton>
                }
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-gray-400 shrink-0">Project Name:</span>
                  <span className="font-bold text-gray-900 truncate">
                    {course.deliverable.title}
                  </span>
                </div>
              </ELearningSideCard>
            )}

            {/* Bejite Learning & Verification Note */}
            <ELearningSideCard
              overline="BEJITE LEARNING & VERIFICATION NOTE"
              icon={ShieldCheck}
              tone="sage"
            >
              <p className="text-[11px] text-[#355246] leading-relaxed">
                Tracking and completing course requirements verifies your
                curriculum knowledge and evidence submissions. Course completion
                equips skill readiness on Bejite, without conferring
                institutional accreditation, external accrediting certification,
                or guaranteed employment.
              </p>
            </ELearningSideCard>
          </div>
        </div>
      </div>
    </ELearningLayout>
  );
}

