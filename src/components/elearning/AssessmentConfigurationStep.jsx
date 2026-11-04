import React, { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  CheckCircle2,
  FileText,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import CourseQuestionModal from "./CourseQuestionModal";

const QUESTION_TYPE_LABELS = {
  multiple_choice: "Multi-Choice",
  single_choice: "Single Choice",
  true_false: "True or False",
  text_based: "Text-Based",
};

/**
 * Reusable Assessment Configuration Step (Step 4) for Course Builder.
 * Matches Figma Image 1 and Image 2 pixel-for-pixel.
 */
export default function AssessmentConfigurationStep({
  quiz = {},
  onChangeQuiz,
}) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "add",
    questionIndex: null,
  });

  const isEnabled = quiz.enabled !== false;
  const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
  const passingScoreEnabled = quiz.passingScoreEnabled !== false;
  const retryLimitEnabled = quiz.retryLimitEnabled !== false;

  const totalPoints = questions.reduce(
    (sum, q) => sum + (Number(q.points) || 1),
    0
  );

  const updateQuizField = (field, value) => {
    onChangeQuiz?.({
      ...quiz,
      [field]: value,
    });
  };

  const handleOpenAddQuestion = () => {
    setModalState({
      isOpen: true,
      mode: "add",
      questionIndex: null,
    });
  };

  const handleOpenEditQuestion = (qIdx) => {
    setModalState({
      isOpen: true,
      mode: "edit",
      questionIndex: qIdx,
    });
  };

  const handleSaveQuestion = (questionPayload) => {
    const nextQuestions = [...questions];
    if (modalState.mode === "edit" && modalState.questionIndex != null) {
      nextQuestions[modalState.questionIndex] = questionPayload;
    } else {
      nextQuestions.push(questionPayload);
    }
    updateQuizField("questions", nextQuestions);
    setModalState({ isOpen: false, mode: "add", questionIndex: null });
  };

  const handleMoveQuestion = (qIdx, direction) => {
    const targetIdx = qIdx + direction;
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    const nextQuestions = [...questions];
    [nextQuestions[qIdx], nextQuestions[targetIdx]] = [
      nextQuestions[targetIdx],
      nextQuestions[qIdx],
    ];
    updateQuizField("questions", nextQuestions);
  };

  const handleDeleteQuestion = (qIdx) => {
    const nextQuestions = questions.filter((_, idx) => idx !== qIdx);
    updateQuizField("questions", nextQuestions);
  };

  const activeQuestionData =
    modalState.mode === "edit" && modalState.questionIndex != null
      ? questions[modalState.questionIndex]
      : null;

  return (
    <div className="space-y-6">
      {/* Sage Header Banner */}
      <div className="rounded-3xl bg-[#EFF5EF] border border-[#DCE8DC] p-6 sm:p-7">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#122B20]">
          Assessment Configuration
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#5A6D62]">
          Configure an optional assessment to check learners&apos; understanding of
          the course.
        </p>
      </div>

      {/* Include assessment selector (Yes vs No) */}
      <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-6 shadow-2xs space-y-4">
        <div>
          <div className="text-sm font-bold text-[#122B20]">
            Include an assessment in this course?
          </div>
          <p className="mt-0.5 text-xs text-[#6B7B73]">
            Decide whether to add a knowledge evaluation for learners completing
            this course.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Yes, Include an assessment */}
          <button
            type="button"
            onClick={() => updateQuizField("enabled", true)}
            className={`rounded-2xl p-5 text-left transition-all flex items-start justify-between gap-3 ${
              isEnabled
                ? "border-2 border-[#16730F] bg-[#F7FBF7]"
                : "border border-[#E2EAE4] bg-white hover:border-[#9EC49B]"
            }`}
          >
            <div>
              <div className="text-sm font-bold text-[#122B20]">
                Yes, Include an assessment
              </div>
              <p className="mt-1.5 text-xs text-[#6B7B73] leading-relaxed">
                Configure a quiz/test with multiple questions, answer options,
                and pass marks, etc.
              </p>
            </div>
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                isEnabled
                  ? "bg-[#16730F] text-white"
                  : "border border-[#76B572] bg-white"
              }`}
            >
              {isEnabled && <Check className="w-3 h-3 stroke-[3]" />}
            </span>
          </button>

          {/* No assessment for this course */}
          <button
            type="button"
            onClick={() => updateQuizField("enabled", false)}
            className={`rounded-2xl p-5 text-left transition-all flex items-start justify-between gap-3 ${
              !isEnabled
                ? "border-2 border-[#16730F] bg-[#F7FBF7]"
                : "border border-[#E2EAE4] bg-white hover:border-[#9EC49B]"
            }`}
          >
            <div>
              <div className="text-sm font-bold text-[#122B20]">
                No assessment for this course
              </div>
              <p className="mt-1.5 text-xs text-[#6B7B73] leading-relaxed">
                Course will not require a knowledge check. Any existing question
                configuration will be saved.
              </p>
            </div>
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                !isEnabled
                  ? "bg-[#16730F] text-white"
                  : "border border-[#76B572] bg-white"
              }`}
            >
              {!isEnabled && <Check className="w-3 h-3 stroke-[3]" />}
            </span>
          </button>
        </div>
      </div>

      {/* When Assessment is Disabled -> Empty State Card (Image 1) */}
      {!isEnabled ? (
        <div className="rounded-3xl bg-white border border-[#E6ECE8] py-16 px-6 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-[#F0F4F1] border border-[#E0E8E2] text-gray-400 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6 text-[#6B7B73]" />
          </div>
          <h2 className="text-base font-extrabold text-[#122B20]">
            Assessments are turned off for this course
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-[#6B7B73] max-w-md mx-auto leading-relaxed">
            Learners will not be required to take an assessment. Your previously
            saved configuration is stored safely and can be turned on again at
            any time.
          </p>
        </div>
      ) : (
        /* When Assessment is Enabled -> Full Assessment Configuration (Image 2) */
        <div className="space-y-6">
          {/* Assessment Information Card */}
          <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="text-sm font-bold text-[#122B20]">
              Assessment Information
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <label
                  htmlFor="assessment-title-input"
                  className="text-xs font-bold text-[#122B20]"
                >
                  Assessment Title <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] font-medium text-gray-400">
                  Required
                </span>
              </div>
              <input
                id="assessment-title-input"
                type="text"
                value={quiz.title || ""}
                onChange={(e) => updateQuizField("title", e.target.value)}
                placeholder="e.g. Digital Marketing Basics Quiz"
                className="w-full rounded-2xl border border-[#E2EAE4] px-4 py-3 text-sm text-gray-900 focus:border-[#16730F] focus:ring-2 focus:ring-[#16730F]/20 outline-none transition"
              />
            </div>

            <div>
              <label
                htmlFor="assessment-instructions-input"
                className="block text-xs font-bold text-[#122B20] mb-1.5"
              >
                Instructions for Learners (Optional)
              </label>
              <textarea
                id="assessment-instructions-input"
                rows={3}
                value={quiz.description || ""}
                onChange={(e) => updateQuizField("description", e.target.value)}
                placeholder="Answer the questions to check your understanding of digital marketing audiences and campaign planning."
                className="w-full rounded-2xl border border-[#E2EAE4] px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#16730F] focus:ring-2 focus:ring-[#16730F]/20 outline-none transition resize-none"
              />
            </div>
          </div>

          {/* Questions Section Card */}
          <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-[#122B20]">
                  Questions
                </h2>
                <p className="mt-0.5 text-xs text-[#6B7B73]">
                  Manage questions, correct answers, and point weighting.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddQuestion}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#16730F] hover:bg-[#125E0C] text-white font-bold text-xs px-5 py-2.5 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Add Questions
              </button>
            </div>

            {/* Questions List */}
            {questions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#D2E0D4] bg-[#FAFDFB] p-8 text-center">
                <p className="text-sm font-bold text-[#122B20]">
                  No questions added yet
                </p>
                <p className="mt-1 text-xs text-[#6B7B73]">
                  Click &ldquo;+ Add Questions&rdquo; above to create your first
                  assessment question.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, qIdx) => {
                  const typeLabel =
                    QUESTION_TYPE_LABELS[q.type] || "Single Choice";
                  const qPoints = Number(q.points) || 1;
                  const isTextBased = q.type === "text_based";
                  const isTrueFalse = q.type === "true_false";

                  return (
                    <div
                      key={q.id || qIdx}
                      className="rounded-2xl border border-[#E2ECE3] bg-white p-4 sm:p-5 space-y-3.5 hover:border-[#BED6C1] transition-colors"
                    >
                      {/* Question Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <span className="w-6 h-6 rounded-full bg-[#16730F] text-white text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                            {qIdx + 1}
                          </span>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-[#122B20] leading-snug">
                              {q.prompt}
                            </h3>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-[#EFF5EF] text-[#5A6D62] text-[10px] font-bold px-2.5 py-0.5">
                                {typeLabel}
                              </span>
                              <span className="rounded-full bg-[#EFF5EF] text-[#5A6D62] text-[10px] font-semibold px-2.5 py-0.5">
                                {qPoints} {qPoints === 1 ? "point" : "points"}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF5EC] text-[#16730F] text-[10px] font-bold px-2.5 py-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#16730F]" />
                                Configured
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Question Action Controls */}
                        <div className="flex items-center gap-1 shrink-0 text-gray-400">
                          <button
                            type="button"
                            onClick={() => handleMoveQuestion(qIdx, -1)}
                            disabled={qIdx === 0}
                            aria-label="Move question up"
                            className="p-1.5 hover:text-[#183B2E] disabled:opacity-30 transition-colors"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveQuestion(qIdx, 1)}
                            disabled={qIdx === questions.length - 1}
                            aria-label="Move question down"
                            className="p-1.5 hover:text-[#183B2E] disabled:opacity-30 transition-colors"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-[1px] h-4 bg-gray-200 mx-0.5" />
                          <button
                            type="button"
                            onClick={() => handleOpenEditQuestion(qIdx)}
                            aria-label="Edit question"
                            className="p-1.5 hover:text-[#16730F] transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(qIdx)}
                            aria-label="Delete question"
                            className="p-1.5 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Options Preview */}
                      {isTextBased ? (
                        <div className="rounded-xl border border-[#DCE7DC] bg-[#FAFDFB] p-3 text-xs text-[#5A6D62] italic">
                          {q.correctText || "Expected answer configured."}
                        </div>
                      ) : (
                        <div className="space-y-2 pt-1">
                          {(isTrueFalse ? ["True", "False"] : q.options || []).map(
                            (optText, optIdx) => {
                              const isCorrect =
                                Array.isArray(q.correctAnswers)
                                  ? q.correctAnswers.includes(optIdx)
                                  : Number(q.correctIndex) === optIdx;
                              const letter = String.fromCharCode(65 + optIdx);

                              return (
                                <div
                                  key={optIdx}
                                  className={`rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs border transition-colors ${
                                    isCorrect
                                      ? "bg-[#EFF8F0] border-[#92C796] text-[#122B20] font-bold"
                                      : "bg-white border-[#E8EEE9] text-[#5A6D62]"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span
                                      className={`text-[11px] font-bold ${
                                        isCorrect
                                          ? "text-[#16730F]"
                                          : "text-gray-400"
                                      }`}
                                    >
                                      {letter}.
                                    </span>
                                    <span className="truncate">{optText}</span>
                                  </div>

                                  {isCorrect && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#D8EEDB] text-[#16730F] text-[10px] font-extrabold px-2.5 py-0.5 shrink-0">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Correct Answer
                                    </span>
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Scoring & Attempt Rules Card */}
          <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-6 shadow-2xs space-y-6">
            {/* Header with Counter Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EEF3EF]">
              <div>
                <h2 className="text-base font-extrabold text-[#122B20]">
                  Scoring & Attempt Rules
                </h2>
                <p className="mt-0.5 text-xs text-[#6B7B73]">
                  Define passing marks, retry permissions, and assessment
                  behavior.
                </p>
              </div>

              {/* Questions & Points Counter Badge Box */}
              <div className="inline-flex items-center rounded-xl border border-[#DCE7DC] bg-[#FAFDFB] px-3.5 py-1.5 text-xs font-bold text-[#122B20] gap-3">
                <span>
                  QUESTIONS:{" "}
                  <strong className="text-[#16730F]">{questions.length}</strong>
                </span>
                <span className="w-[1px] h-3.5 bg-gray-200" />
                <span>
                  TOTAL POINTS:{" "}
                  <strong className="text-[#16730F]">{totalPoints} pts</strong>
                </span>
              </div>
            </div>

            {/* Rule 1: Optional Passing Threshold */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#122B20]">
                    Optional Passing Threshold
                  </div>
                  <p className="mt-0.5 text-xs text-[#6B7B73]">
                    Specify minimum score required to pass this assessment.
                  </p>
                </div>

                {/* Toggle Switch */}
                <button
                  type="button"
                  onClick={() =>
                    updateQuizField("passingScoreEnabled", !passingScoreEnabled)
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none shrink-0 ${
                    passingScoreEnabled ? "bg-[#16730F]" : "bg-gray-300"
                  }`}
                  aria-label="Toggle passing threshold"
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                      passingScoreEnabled ? "left-5.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              {passingScoreEnabled && (
                <div className="pt-1 flex items-center gap-3">
                  <div className="w-32">
                    <label
                      htmlFor="passing-score-input"
                      className="block text-[11px] font-bold text-[#5A6D62] mb-1"
                    >
                      Passing Score / Desired
                    </label>
                    <input
                      id="passing-score-input"
                      type="number"
                      min={10}
                      max={100}
                      value={quiz.passMark ?? 80}
                      onChange={(e) =>
                        updateQuizField(
                          "passMark",
                          Math.max(1, Number(e.target.value) || 80)
                        )
                      }
                      className="w-full rounded-xl border border-[#DCE6DF] px-3.5 py-2.5 text-xs font-bold text-gray-900 focus:border-[#16730F] outline-none"
                    />
                  </div>
                  <span className="text-xs text-[#6B7B73] mt-5">
                    percentage of high score
                  </span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-[#EEF3EF]" />

            {/* Rule 2: Optional Retry Limit */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#122B20]">
                    Optional Retry Limit
                  </div>
                  <p className="mt-0.5 text-xs text-[#6B7B73]">
                    Restrict the maximum number of times learners can attempt
                    this quiz.
                  </p>
                </div>

                {/* Toggle Switch */}
                <button
                  type="button"
                  onClick={() =>
                    updateQuizField("retryLimitEnabled", !retryLimitEnabled)
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none shrink-0 ${
                    retryLimitEnabled ? "bg-[#16730F]" : "bg-gray-300"
                  }`}
                  aria-label="Toggle retry limit"
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                      retryLimitEnabled ? "left-5.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              {retryLimitEnabled && (
                <div className="pt-1 flex items-center gap-3">
                  <div className="w-32">
                    <label
                      htmlFor="max-attempts-input"
                      className="block text-[11px] font-bold text-[#5A6D62] mb-1"
                    >
                      Maximum Number of Attempts
                    </label>
                    <input
                      id="max-attempts-input"
                      type="number"
                      min={1}
                      max={20}
                      value={quiz.maxAttempts ?? 2}
                      onChange={(e) =>
                        updateQuizField(
                          "maxAttempts",
                          Math.max(1, Number(e.target.value) || 2)
                        )
                      }
                      className="w-full rounded-xl border border-[#DCE6DF] px-3.5 py-2.5 text-xs font-bold text-gray-900 focus:border-[#16730F] outline-none"
                    />
                  </div>
                  <span className="text-xs text-[#6B7B73] mt-5">
                    allowed attempts
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reusable Add / Edit Question Modal */}
      <CourseQuestionModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        initialData={activeQuestionData}
        onClose={() =>
          setModalState({ isOpen: false, mode: "add", questionIndex: null })
        }
        onSave={handleSaveQuestion}
      />
    </div>
  );
}

