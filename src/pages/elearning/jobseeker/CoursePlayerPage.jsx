import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
  ChevronRight,
  Clock,
  Check,
  HelpCircle,
  FileText,
} from "lucide-react";
import {
  ELearningLayout,
  ELearningBackPill,
  ELearningBadge,
  ELearningButton,
  CurriculumModuleAccordion,
  LessonVideoPlayer,
  LessonTakeawaysCard,
} from "../../../components/elearning";
import {
  getCourseById,
  flattenCourseLessons,
  setCurrentLesson,
  markLessonCompleted,
} from "../../../services/elearningService";

export default function CoursePlayerPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(() => getCourseById(courseId));
  const [activeLessonId, setActiveLessonId] = useState(
    () => getCourseById(courseId)?.modules?.[0]?.lessons?.[0]?.id || null
  );

  useEffect(() => {
    const loaded = getCourseById(courseId);
    setCourse(loaded);
    const all = flattenCourseLessons(loaded);
    setActiveLessonId(loaded?.currentLesson?.id || all[0]?.id || null);
  }, [courseId]);

  const flatLessons = useMemo(
    () => flattenCourseLessons(course),
    [course]
  );

  const activeIndex = useMemo(() => {
    const idx = flatLessons.findIndex((l) => l.id === activeLessonId);
    return idx >= 0 ? idx : 0;
  }, [flatLessons, activeLessonId]);

  const activeLesson = flatLessons[activeIndex] || null;
  const isActiveLessonCompleted = Boolean(
    activeLesson && course?.completedLessonIds?.includes(activeLesson.id)
  );

  if (!course || !activeLesson) return null;

  const handleSelectLesson = (lesson) => {
    setActiveLessonId(lesson.id);
    const updated = setCurrentLesson(course.id, lesson.id);
    setCourse(updated);
  };

  const handlePreviousLesson = () => {
    if (activeIndex <= 0) return;
    const prev = flatLessons[activeIndex - 1];
    handleSelectLesson(prev);
  };

  const handleNextLesson = () => {
    const next =
      activeIndex < flatLessons.length - 1
        ? flatLessons[activeIndex + 1]
        : null;
    const updated = markLessonCompleted(
      course.id,
      activeLesson.id,
      next ? next.id : activeLesson.id
    );
    setCourse(updated);
    if (next) {
      setActiveLessonId(next.id);
    }
  };

  const handleMarkCompleteOnly = () => {
    const updated = markLessonCompleted(
      course.id,
      activeLesson.id,
      activeLesson.id
    );
    setCourse(updated);
  };

  return (
    <ELearningLayout activeNavId="dashboard">
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Top Player Header Bar */}
        <div className="px-3 sm:px-6 py-3 sm:py-3.5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <ELearningBackPill
              label="My Learning"
              onClick={() => navigate("/e-learning/jobseeker/my-learning")}
            />
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-extrabold text-gray-900 truncate">
                {course.title}
              </h1>
              <p className="text-[10px] sm:text-[11px] text-gray-400 truncate mt-0.5">
                {activeLesson.moduleTitle} • {activeLesson.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 self-end sm:self-center shrink-0">
            <div className="w-24 sm:w-28 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#16A34A] transition-all duration-300"
                style={{ width: `${course.overallPercent}%` }}
              />
            </div>
            <span className="text-xs font-extrabold text-gray-900">
              {course.overallPercent}%
            </span>
          </div>
        </div>

        {/* Two-Column Curriculum + Lesson Viewer (collapses smoothly on mobile: player first, curriculum second) */}
        <div className="grid grid-cols-1 lg:grid-cols-[295px_minmax(0,1fr)]">
          {/* Left Pane: Course Curriculum & Requirements (rendered below player on mobile for instant playback) */}
          <div className="order-2 lg:order-1 border-t lg:border-t-0 lg:border-r border-gray-200 bg-[#FCFCFC] flex flex-col">
            <div className="p-3.5 sm:p-4 border-b border-gray-100">
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-gray-900">
                <BookOpen className="w-3.5 h-3.5 text-[#16730F]" />
                <span>COURSE CURRICULUM</span>
              </div>

              <div className="flex items-center justify-between gap-2 mt-1">
                <span className="text-[11px] text-gray-400">
                  {course.completedLessonsCount}/{course.totalLessons} Lessons •{" "}
                  {course.overallPercent}% Overall
                </span>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/e-learning/jobseeker/courses/${course.id}/progress`)
                  }
                  className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#16730F] hover:underline cursor-pointer"
                >
                  <span>View Criteria</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <CurriculumModuleAccordion
              modules={course.modules}
              completedLessonIds={course.completedLessonIds}
              activeLessonId={activeLesson.id}
              variant="player"
              onSelectLesson={handleSelectLesson}
            />

            {/* Bottom Assessment & Deliverable Cards */}
            <div className="p-3.5 sm:p-4 space-y-3.5 sm:space-y-4 border-t border-gray-100">
              {course.quiz && (
                <div className="space-y-1.5">
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">
                    COURSE KNOWLEDGE ASSESSMENT
                  </p>
                  <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-3.5 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <HelpCircle className="w-3.5 h-3.5 text-[#16730F] shrink-0" />
                        <p className="text-xs font-extrabold text-gray-900 truncate">
                          {course.quiz.title}
                        </p>
                      </div>
                      <ELearningBadge variant="required">
                        {course.quizState?.passed ? "Passed" : "Required"}
                      </ELearningBadge>
                    </div>

                    <p className="text-[11px] text-gray-500">
                      Pass mark: {course.quiz.passMark}% •{" "}
                      {course.quiz.questions?.length || 0} questions
                    </p>

                    <ELearningButton
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() =>
                        navigate(`/e-learning/jobseeker/courses/${course.id}/assessment`)
                      }
                    >
                      Take Knowledge Quiz
                    </ELearningButton>
                  </div>
                </div>
              )}

              {course.deliverable && (
                <div className="space-y-1.5">
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">
                    PRACTICAL PORTFOLIO EVIDENCE
                  </p>
                  <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-3.5 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-[#16730F] shrink-0" />
                        <p className="text-xs font-extrabold text-gray-900 truncate">
                          {course.deliverable.title}
                        </p>
                      </div>
                      <ELearningBadge variant="required">
                        {course.deliverableState?.submitted
                          ? "Submitted"
                          : "Required"}
                      </ELearningBadge>
                    </div>

                    <p className="text-[11px] text-gray-500">
                      {course.deliverable.subtitle ||
                        "Submit your hands-on deliverable."}
                    </p>

                    <ELearningButton
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() =>
                        navigate(`/e-learning/jobseeker/courses/${course.id}/project`)
                      }
                    >
                      {course.deliverableState?.submitted
                        ? "View Project"
                        : "Submit Practical Evidence"}
                    </ELearningButton>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Pane: Active Lesson Content (order-1 on mobile for immediate playback) */}
          <div className="order-1 lg:order-2 p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 bg-white flex flex-col justify-between">
            <div className="space-y-5 sm:space-y-6">
              {/* Module Meta & Lesson Status */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#15372B]">
                  {activeLesson.moduleTitle.toUpperCase()}
                </p>

                <div className="flex items-center gap-3">
                  {isActiveLessonCompleted ? (
                    <ELearningBadge variant="statusSuccess" icon={Check}>
                      Completed
                    </ELearningBadge>
                  ) : (
                    <button
                      type="button"
                      onClick={handleMarkCompleteOnly}
                      className="text-[11px] font-bold text-[#16730F] hover:underline cursor-pointer"
                    >
                      Mark as completed
                    </button>
                  )}

                  <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    {activeLesson.durationMinutes} mins
                  </span>
                </div>
              </div>

              {/* Lesson Title & Summary */}
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-[#112A20] tracking-tight">
                  {activeLesson.title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-relaxed max-w-2xl">
                  {activeLesson.summary}
                </p>
              </div>

              {/* Section Subheading & Video Player */}
              <div className="space-y-3">
                {activeLesson.sectionHeading && (
                  <h3 className="text-sm sm:text-base font-extrabold text-gray-900">
                    {activeLesson.sectionHeading}
                  </h3>
                )}

                <LessonVideoPlayer
                  title={activeLesson.title}
                  durationLabel={activeLesson.videoDuration || "04:00"}
                  onCompleteMedia={handleMarkCompleteOnly}
                />
              </div>

              {/* Lesson Reading Paragraphs */}
              {Array.isArray(activeLesson.bodyParagraphs) &&
                activeLesson.bodyParagraphs.length > 0 && (
                  <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {activeLesson.bodyParagraphs.map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                )}

              {/* Core Lesson Takeaways */}
              <LessonTakeawaysCard takeaways={activeLesson.takeaways} />
            </div>

            {/* Bottom Lesson Pagination Bar */}
            <div className="pt-5 sm:pt-6 border-t border-gray-100 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
              <ELearningButton
                variant="outline"
                size="sm"
                pill
                disabled={activeIndex === 0}
                onClick={handlePreviousLesson}
                className="w-full sm:w-auto"
              >
                Previous Lesson
              </ELearningButton>

              <span className="text-xs text-gray-400 font-medium order-first sm:order-none w-full sm:w-auto text-center">
                Lesson {activeIndex + 1} of {flatLessons.length}
              </span>

              <ELearningButton
                variant="primary"
                size="sm"
                pill
                onClick={handleNextLesson}
                className="w-full sm:w-auto"
              >
                {activeIndex < flatLessons.length - 1
                  ? "Next Lesson"
                  : isActiveLessonCompleted
                    ? "View Progress"
                    : "Complete Course Lessons"}
              </ELearningButton>
            </div>
          </div>
        </div>
      </div>
    </ELearningLayout>
  );
}


