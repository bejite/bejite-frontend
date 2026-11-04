import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import {
  COURSE_BUILDER_STEPS,
  createEmptyCourseDraft,
} from "../../services/elearningService";
import CourseBuilderStepper from "./CourseBuilderStepper";
import CourseBasicInfoStep from "./CourseBasicInfoStep";
import CourseStructureStep from "./CourseStructureStep";
import LessonMediaContentEditor from "./LessonMediaContentEditor";
import AssessmentConfigurationStep from "./AssessmentConfigurationStep";
import ProjectConfigurationStep from "./ProjectConfigurationStep";
import CoursePricingStep from "./CoursePricingStep";
import CourseCompletionStep from "./CourseCompletionStep";
import CourseReviewStep from "./CourseReviewStep";
import CourseModuleModal from "./CourseModuleModal";
import CourseLessonModal from "./CourseLessonModal";
import CourseOutcomeModal from "./CourseOutcomeModal";
import CourseSubmitReviewModal from "./CourseSubmitReviewModal";

function stripModulePrefix(title = "") {
  return String(title).replace(/^module\s+\d+\s*:\s*/i, "").trim();
}

/**
 * Reusable 8-step Course Builder Wizard for Create and Edit workflows.
 */
export default function CourseBuilderWizard({
  mode = "create",
  initialCourse = null,
  onBack,
  onSaveCourse,
}) {
  const isEditMode = mode === "edit";
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState(() =>
    initialCourse
      ? {
          ...createEmptyCourseDraft(),
          ...initialCourse,
          learningOutcomes:
            Array.isArray(initialCourse.learningOutcomes) &&
            initialCourse.learningOutcomes.length > 0
              ? [...initialCourse.learningOutcomes]
              : createEmptyCourseDraft().learningOutcomes,
        }
      : createEmptyCourseDraft()
  );

  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [moduleModalState, setModuleModalState] = useState({
    isOpen: false,
    mode: "add",
    moduleIndex: null,
  });
  const [lessonModalState, setLessonModalState] = useState({
    isOpen: false,
    mode: "add",
    moduleIndex: 0,
    lessonIndex: null,
  });
  const [selectedContentIds, setSelectedContentIds] = useState({
    moduleIndex: 0,
    lessonIndex: 0,
  });

  const updateField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  // Learning Outcomes Handlers
  const handleOutcomeChange = (idx, value) => {
    setDraft((prev) => {
      const next = [...(prev.learningOutcomes || [])];
      next[idx] = value;
      return { ...prev, learningOutcomes: next };
    });
  };

  const handleAddOutcome = () => {
    setIsOutcomeModalOpen(true);
  };

  const handleSaveOutcome = (outcomeTitle) => {
    setDraft((prev) => {
      const list = [...(prev.learningOutcomes || [])];
      const emptyIdx = list.findIndex((item) => !String(item || "").trim());
      if (emptyIdx >= 0) {
        list[emptyIdx] = outcomeTitle;
      } else {
        list.push(outcomeTitle);
      }
      return { ...prev, learningOutcomes: list };
    });
    setIsOutcomeModalOpen(false);
    toast.success("Learning outcome added.");
  };

  const handleMoveOutcome = (idx, direction) => {
    setDraft((prev) => {
      const list = [...(prev.learningOutcomes || [])];
      const target = idx + direction;
      if (target < 0 || target >= list.length) return prev;
      [list[idx], list[target]] = [list[target], list[idx]];
      return { ...prev, learningOutcomes: list };
    });
  };

  const handleDeleteOutcome = (idx) => {
    setDraft((prev) => {
      const next = (prev.learningOutcomes || []).filter((_, i) => i !== idx);
      return { ...prev, learningOutcomes: next.length > 0 ? next : [""] };
    });
  };

  // Module Handlers
  const openAddModuleModal = () => {
    setModuleModalState({ isOpen: true, mode: "add", moduleIndex: null });
  };

  const openEditModuleModal = (mIdx) => {
    setModuleModalState({ isOpen: true, mode: "edit", moduleIndex: mIdx });
  };

  const handleSaveModule = (modulePayload) => {
    setDraft((prev) => {
      const modules = [...(prev.modules || [])];
      if (
        moduleModalState.mode === "edit" &&
        moduleModalState.moduleIndex != null &&
        modules[moduleModalState.moduleIndex]
      ) {
        modules[moduleModalState.moduleIndex] = {
          ...modules[moduleModalState.moduleIndex],
          title: stripModulePrefix(modulePayload.title),
          description: modulePayload.description || "",
        };
      } else {
        modules.push({
          id: `mod-${Date.now()}`,
          title: stripModulePrefix(modulePayload.title),
          description: modulePayload.description || "",
          lessons: [],
        });
      }
      return { ...prev, modules };
    });
    setModuleModalState({ isOpen: false, mode: "add", moduleIndex: null });
    toast.success(
      moduleModalState.mode === "edit"
        ? "Course module updated."
        : "Course module added."
    );
  };

  const handleMoveModule = (mIdx, direction) => {
    setDraft((prev) => {
      const modules = [...(prev.modules || [])];
      const target = mIdx + direction;
      if (target < 0 || target >= modules.length) return prev;
      [modules[mIdx], modules[target]] = [modules[target], modules[mIdx]];
      return { ...prev, modules };
    });
  };

  const handleDeleteModule = (mIdx) => {
    setDraft((prev) => ({
      ...prev,
      modules: (prev.modules || []).filter((_, i) => i !== mIdx),
    }));
  };

  // Lesson Handlers
  const openAddLessonModal = (mIdx) => {
    setLessonModalState({
      isOpen: true,
      mode: "add",
      moduleIndex: mIdx,
      lessonIndex: null,
    });
  };

  const openEditLessonModal = (mIdx, lIdx) => {
    setLessonModalState({
      isOpen: true,
      mode: "edit",
      moduleIndex: mIdx,
      lessonIndex: lIdx,
    });
  };

  const handleSaveLesson = (lessonPayload) => {
    const { mode: lMode, moduleIndex, lessonIndex } = lessonModalState;
    setDraft((prev) => {
      const modules = [...(prev.modules || [])];
      if (!modules[moduleIndex]) {
        modules[0] = {
          id: `mod-${Date.now()}`,
          title: "Core Lessons",
          description: "",
          lessons: [],
        };
      }
      const targetModIndex = modules[moduleIndex] ? moduleIndex : 0;
      const targetMod = { ...modules[targetModIndex] };
      const lessons = [...(targetMod.lessons || [])];

      if (lMode === "edit" && lessonIndex != null && lessons[lessonIndex]) {
        lessons[lessonIndex] = {
          ...lessons[lessonIndex],
          title: lessonPayload.title,
          summary: lessonPayload.summary,
          description: lessonPayload.description || lessonPayload.summary,
        };
      } else {
        lessons.push({
          id: `les-${Date.now()}`,
          title: lessonPayload.title,
          summary: lessonPayload.summary,
          description: lessonPayload.description || lessonPayload.summary,
          type: "Video",
          durationMinutes: 15,
          sectionHeading: lessonPayload.title,
          mediaType: "video",
          mediaUrl: "",
          videoUrl: "",
          mediaFileName: "",
          mediaFileSize: "",
          mediaDuration: "",
          mediaFormat: "",
          mediaStatus: "",
          bodyText: lessonPayload.summary || "",
          takeaways: [""],
          takeawaysText:
            "By the end of the course, the learner should be able to:\ne.g 1.",
        });
      }
      targetMod.lessons = lessons;
      modules[targetModIndex] = targetMod;
      return { ...prev, modules };
    });
    setLessonModalState({
      isOpen: false,
      mode: "add",
      moduleIndex: 0,
      lessonIndex: null,
    });
    toast.success(lMode === "edit" ? "Lesson updated." : "Lesson added.");
  };

  const handleUpdateLessonContent = (mIdx, lIdx, updates) => {
    setDraft((prev) => {
      const modules = [...(prev.modules || [])];
      const targetMod = modules[mIdx];
      if (!targetMod) return prev;
      const nextMod = { ...targetMod, lessons: [...(targetMod.lessons || [])] };
      if (!nextMod.lessons[lIdx]) return prev;
      nextMod.lessons[lIdx] = {
        ...nextMod.lessons[lIdx],
        ...updates,
      };
      modules[mIdx] = nextMod;
      return { ...prev, modules };
    });
  };

  const handleMoveLesson = (mIdx, lIdx, direction) => {
    setDraft((prev) => {
      const modules = [...(prev.modules || [])];
      const mod = { ...modules[mIdx] };
      const lessons = [...(mod.lessons || [])];
      const target = lIdx + direction;
      if (target < 0 || target >= lessons.length) return prev;
      [lessons[lIdx], lessons[target]] = [lessons[target], lessons[lIdx]];
      mod.lessons = lessons;
      modules[mIdx] = mod;
      return { ...prev, modules };
    });
  };

  const handleDeleteLesson = (mIdx, lIdx) => {
    setDraft((prev) => {
      const modules = [...(prev.modules || [])];
      const mod = { ...modules[mIdx] };
      mod.lessons = (mod.lessons || []).filter((_, i) => i !== lIdx);
      modules[mIdx] = mod;
      return { ...prev, modules };
    });
  };

  // Validation
  const validateBasicInfo = () => {
    if (!String(draft.title || "").trim()) {
      toast.error("Please provide a Course Title.");
      setStepIndex(0);
      return false;
    }
    if (!String(draft.summary || "").trim()) {
      toast.error("Please provide a Course Description.");
      setStepIndex(0);
      return false;
    }
    return true;
  };

  const handleSaveDraft = () => {
    const fallbackDraft = {
      ...draft,
      title: String(draft.title || "").trim() || "Untitled Course Draft",
    };
    onSaveCourse?.(fallbackDraft, { status: "draft" });
  };

  const handleConfirmReviewSubmission = () => {
    setIsReviewModalOpen(false);
    if (!validateBasicInfo()) return;
    onSaveCourse?.(draft, { status: "in_review" });
  };

  const handleContinue = () => {
    if (stepIndex === 0 && !validateBasicInfo()) return;
    if (stepIndex < COURSE_BUILDER_STEPS.length - 1) {
      setStepIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      if (!validateBasicInfo()) return;
      setIsReviewModalOpen(true);
    }
  };

  const totalLessonsCount = (draft.modules || []).reduce(
    (sum, m) => sum + ((m.lessons || []).length || 0),
    0
  );

  const activeModuleModalInitial =
    moduleModalState.mode === "edit" &&
    moduleModalState.moduleIndex != null &&
    draft.modules?.[moduleModalState.moduleIndex]
      ? {
          ...draft.modules[moduleModalState.moduleIndex],
          title: stripModulePrefix(
            draft.modules[moduleModalState.moduleIndex].title
          ),
        }
      : null;

  const activeLessonModalInitial =
    lessonModalState.mode === "edit" &&
    lessonModalState.lessonIndex != null &&
    draft.modules?.[lessonModalState.moduleIndex]?.lessons?.[
      lessonModalState.lessonIndex
    ]
      ? draft.modules[lessonModalState.moduleIndex].lessons[
          lessonModalState.lessonIndex
        ]
      : null;

  return (
    <div className="space-y-6 pb-10">
      {/* Top Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF0EC] hover:bg-[#DCE6DF] text-[#183B2E] font-bold px-4 py-2 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Go Back
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <button
          type="button"
          onClick={onBack}
          className="text-gray-400 hover:text-[#16730F] font-medium transition-colors cursor-pointer"
        >
          E-Learning Management
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-bold text-[#16730F]">
          {isEditMode ? "Edit Course" : "Create Course"}
        </span>
      </div>

      {/* 8-Step Stepper */}
      <CourseBuilderStepper
        steps={COURSE_BUILDER_STEPS}
        currentStepIndex={stepIndex}
        onStepSelect={(nextIdx) => setStepIndex(nextIdx)}
      />

      {/* STEP 1: BASIC INFO */}
      {stepIndex === 0 && (
        <CourseBasicInfoStep
          draft={draft}
          updateField={updateField}
          onAddOutcome={handleAddOutcome}
          onOutcomeChange={handleOutcomeChange}
          onMoveOutcome={handleMoveOutcome}
          onDeleteOutcome={handleDeleteOutcome}
        />
      )}

      {/* STEP 2: STRUCTURE */}
      {stepIndex === 1 && (
        <CourseStructureStep
          draft={draft}
          updateField={updateField}
          onOpenAddModule={openAddModuleModal}
          onOpenEditModule={openEditModuleModal}
          onMoveModule={handleMoveModule}
          onDeleteModule={handleDeleteModule}
          onOpenAddLesson={openAddLessonModal}
          onOpenEditLesson={openEditLessonModal}
          onMoveLesson={handleMoveLesson}
          onDeleteLesson={handleDeleteLesson}
        />
      )}

      {/* STEP 3: CONTENT */}
      {stepIndex === 2 && (
        <LessonMediaContentEditor
          modules={draft.modules || []}
          selectedModuleIndex={selectedContentIds.moduleIndex}
          selectedLessonIndex={selectedContentIds.lessonIndex}
          onSelectLesson={(mIdx, lIdx) =>
            setSelectedContentIds({ moduleIndex: mIdx, lessonIndex: lIdx })
          }
          onUpdateLesson={handleUpdateLessonContent}
        />
      )}

      {/* STEP 4: ASSESSMENT */}
      {stepIndex === 3 && (
        <AssessmentConfigurationStep
          quiz={draft.quiz || {}}
          onChangeQuiz={(nextQuiz) => updateField("quiz", nextQuiz)}
        />
      )}

      {/* STEP 5: PROJECT */}
      {stepIndex === 4 && (
        <ProjectConfigurationStep
          project={draft.project || {}}
          onChangeProject={(nextProject) => updateField("project", nextProject)}
        />
      )}

      {/* STEP 6: PRICING */}
      {stepIndex === 5 && (
        <CoursePricingStep
          pricing={draft.pricing || {}}
          onChangePricing={(nextPricing) => updateField("pricing", nextPricing)}
        />
      )}

      {/* STEP 7: COMPLETION */}
      {stepIndex === 6 && (
        <CourseCompletionStep
          completion={draft.completion || {}}
          onChangeCompletion={(nextCompletion) =>
            updateField("completion", nextCompletion)
          }
          modulesCount={(draft.modules || []).length}
          lessonsCount={totalLessonsCount}
          quizTitle={draft.quiz?.title}
          quizQuestionsCount={(draft.quiz?.questions || []).length}
          projectTitle={draft.project?.title}
        />
      )}

      {/* STEP 8: REVIEW */}
      {stepIndex === 7 && (
        <CourseReviewStep
          draft={draft}
          onSubmitForReview={() => setIsReviewModalOpen(true)}
        />
      )}

      {/* Bottom Action Bar */}
      <div className="pt-5 sm:pt-6 border-t border-[#E8EFE9] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <button
            type="button"
            disabled={stepIndex === 0}
            onClick={() => {
              setStepIndex((prev) => Math.max(0, prev - 1));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex-1 sm:flex-initial rounded-full bg-[#EAF2EA] hover:bg-[#DCE8DC] text-[#153B2E] disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs sm:text-sm px-5 sm:px-6 py-3 transition-colors cursor-pointer text-center"
          >
            Back to previous
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            className="flex-1 sm:flex-initial rounded-full bg-[#EAF2EA] hover:bg-[#DCE8DC] text-[#153B2E] font-bold text-xs sm:text-sm px-5 sm:px-6 py-3 transition-colors cursor-pointer text-center"
          >
            Save Draft
          </button>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          className="w-full sm:w-auto rounded-full bg-[#16730F] hover:bg-[#125E0C] text-white font-bold text-xs sm:text-sm px-8 py-3 transition-colors shadow-xs cursor-pointer text-center"
        >
          {stepIndex === COURSE_BUILDER_STEPS.length - 1
            ? "Submit for Review"
            : "Continue"}
        </button>
      </div>

      {/* Modals */}
      <CourseModuleModal
        isOpen={moduleModalState.isOpen}
        mode={moduleModalState.mode}
        initialData={activeModuleModalInitial}
        onClose={() =>
          setModuleModalState({ isOpen: false, mode: "add", moduleIndex: null })
        }
        onSave={handleSaveModule}
      />

      <CourseOutcomeModal
        isOpen={isOutcomeModalOpen}
        mode="add"
        onClose={() => setIsOutcomeModalOpen(false)}
        onSave={handleSaveOutcome}
      />

      <CourseLessonModal
        isOpen={lessonModalState.isOpen}
        mode={lessonModalState.mode}
        moduleIndex={lessonModalState.moduleIndex}
        initialData={activeLessonModalInitial}
        onClose={() =>
          setLessonModalState({
            isOpen: false,
            mode: "add",
            moduleIndex: 0,
            lessonIndex: null,
          })
        }
        onSave={handleSaveLesson}
      />

      <CourseSubmitReviewModal
        isOpen={isReviewModalOpen}
        courseTitle={draft.title || "Digital Marketing Fundamentals"}
        onClose={() => setIsReviewModalOpen(false)}
        onConfirm={handleConfirmReviewSubmission}
      />
    </div>
  );
}
