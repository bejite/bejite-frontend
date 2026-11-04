import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ELearningLayout,
  ELearningBackPill,
  AssessmentIntroCard,
  AssessmentProgressHeader,
  AssessmentQuestionCard,
  AssessmentSubmitConfirmCard,
  AssessmentResultCard,
  AssessmentCompletedCard,
} from "../../../components/elearning";
import {
  getCourseById,
  recordQuizSubmission,
} from "../../../services/elearningService";

export default function CourseAssessmentPage() {
  const { courseId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(() => getCourseById(courseId));
  const modeParam = searchParams.get("mode");

  const initialStep = useMemo(() => {
    const loaded = getCourseById(courseId);
    if (
      modeParam === "review" &&
      loaded?.quizState?.attempts > 0 &&
      loaded?.quizState?.lastAnswers
    ) {
      return "result";
    }
    return "intro";
  }, [courseId, modeParam]);

  const [step, setStep] = useState(initialStep);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [remainingSeconds, setRemainingSeconds] = useState(15 * 60);
  const [submissionOutcome, setSubmissionOutcome] = useState(null);

  useEffect(() => {
    const loaded = getCourseById(courseId);
    setCourse(loaded);
    const timeLimitSec = (loaded?.quiz?.timeLimitMinutes || 15) * 60;
    setRemainingSeconds(timeLimitSec);

    if (
      modeParam === "review" &&
      loaded?.quizState?.attempts > 0 &&
      loaded?.quizState?.lastAnswers
    ) {
      setAnswers(loaded.quizState.lastAnswers);
      setStep("result");
    } else {
      setStep("intro");
      setAnswers({});
      setCurrentIndex(0);
      setSubmissionOutcome(null);
    }
  }, [courseId, modeParam]);

  // Countdown timer active during question runner
  useEffect(() => {
    if (step !== "question") return undefined;

    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [step]);

  // Auto-advance to submit confirmation if timer reaches 0:00
  useEffect(() => {
    if (step === "question" && remainingSeconds === 0) {
      toast.info("Time is up! Please confirm and submit your assessment.");
      setStep("confirm");
    }
  }, [step, remainingSeconds]);

  const quiz = course?.quiz;
  const questions = useMemo(() => quiz?.questions || [], [quiz]);
  const totalQuestions = questions.length;

  const answeredCount = useMemo(
    () =>
      questions.reduce(
        (count, q) => (answers[q.id] != null ? count + 1 : count),
        0
      ),
    [questions, answers]
  );

  if (!course || !quiz) return null;

  const attemptsAlreadyUsed = course.quizState?.attempts || 0;
  const currentAttemptNumber = attemptsAlreadyUsed + 1;
  const configuredMaxAttempts = quiz.maxAttempts || 2;
  const displayMaxAttempts = Math.max(
    configuredMaxAttempts,
    currentAttemptNumber
  );

  const handleStartAssessment = () => {
    if (modeParam) {
      setSearchParams({}, { replace: true });
    }
    setAnswers({});
    setCurrentIndex(0);
    setSubmissionOutcome(null);
    setRemainingSeconds((quiz.timeLimitMinutes || 15) * 60);
    setStep("question");
  };

  const handleSelectOption = (optionIndex) => {
    const activeQuestion = questions[currentIndex];
    if (!activeQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [activeQuestion.id]: optionIndex,
    }));
  };

  const handlePreviousQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNextOrFinish = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    // Ensure every question has an answer before showing Ready to Submit
    const firstUnansweredIdx = questions.findIndex(
      (q) => answers[q.id] == null
    );
    if (firstUnansweredIdx >= 0) {
      setCurrentIndex(firstUnansweredIdx);
      toast.info(
        `Please answer Question ${firstUnansweredIdx + 1} before submitting.`
      );
      return;
    }

    setStep("confirm");
  };

  const handleConfirmSubmit = () => {
    const outcome = recordQuizSubmission(course.id, answers);
    if (outcome?.course) {
      setCourse(outcome.course);
    }
    setSubmissionOutcome(outcome);
    if (outcome?.passed) {
      toast.success(
        `Assessment passed with ${outcome.scorePercent}%! Requirement satisfied.`
      );
    } else if (outcome) {
      toast.warning(
        `You scored ${outcome.scorePercent}%. At least ${quiz.passMark}% is required to pass.`
      );
    }
    setStep("result");
  };

  const handleBackNavigation = () => {
    navigate(`/e-learning/jobseeker/courses/${course.id}/progress`);
  };

  const activeQuestion = questions[currentIndex] || questions[0];
  const resolvedScore =
    submissionOutcome?.scorePercent ?? course.quizState?.latestScore ?? 0;
  const resolvedPassed =
    submissionOutcome != null
      ? submissionOutcome.passed
      : Boolean(course.quizState?.passed);
  const resolvedAttempts = course.quizState?.attempts || 1;
  const resolvedReviewAnswers =
    Object.keys(answers).length > 0
      ? answers
      : course.quizState?.lastAnswers || {};
  const resolvedCorrectCount =
    submissionOutcome?.correct ??
    questions.reduce(
      (sum, q) =>
        Number(resolvedReviewAnswers?.[q.id]) === q.correctIndex ? sum + 1 : sum,
      0
    );

  return (
    <ELearningLayout activeNavId="my-learning">
      {step === "confirm" ? (
        <AssessmentSubmitConfirmCard
          assessmentTitle={quiz.title}
          passMark={quiz.passMark}
          answeredCount={answeredCount}
          totalQuestions={totalQuestions}
          attemptNumber={currentAttemptNumber}
          maxAttempts={displayMaxAttempts}
          onReturnToQuestions={() => setStep("question")}
          onConfirmSubmit={handleConfirmSubmit}
        />
      ) : (
        <div className="space-y-6">
          {/* Top Back Pill */}
          <div>
            <ELearningBackPill
              label="My Learning"
              onClick={handleBackNavigation}
            />
          </div>

          {step === "intro" && (
            <AssessmentIntroCard
              quiz={quiz}
              onReviewLessons={() =>
                navigate(`/e-learning/jobseeker/courses/${course.id}/learn`)
              }
              onStartAssessment={handleStartAssessment}
              startLabel="Start Assessment"
            />
          )}

          {step === "question" && activeQuestion && (
            <div className="space-y-5">
              <AssessmentProgressHeader
                attemptNumber={currentAttemptNumber}
                maxAttempts={displayMaxAttempts}
                currentIndex={currentIndex}
                totalQuestions={totalQuestions}
                answeredCount={answeredCount}
                remainingSeconds={remainingSeconds}
                questions={questions}
                answers={answers}
                onJumpToQuestion={(idx) => setCurrentIndex(idx)}
              />

              <AssessmentQuestionCard
                question={activeQuestion}
                questionNumber={currentIndex + 1}
                totalQuestions={totalQuestions}
                selectedOptionIndex={
                  answers[activeQuestion.id] != null
                    ? answers[activeQuestion.id]
                    : null
                }
                onSelectOption={handleSelectOption}
                onPrevious={handlePreviousQuestion}
                onNext={handleNextOrFinish}
                canGoPrevious={currentIndex > 0}
              />
            </div>
          )}

          {step === "result" && (
            <AssessmentCompletedCard
              passed={resolvedPassed}
              scorePercent={resolvedScore}
              correctCount={resolvedCorrectCount}
              totalCount={totalQuestions || questions.length || 3}
              passMark={quiz.passMark || 80}
              attemptNumber={resolvedAttempts}
              maxAttempts={displayMaxAttempts}
              initialCooldownSeconds={38}
              onProceedToProject={() =>
                navigate(`/e-learning/jobseeker/courses/${course.id}/project`)
              }
              onReturnToCurriculum={() =>
                navigate(`/e-learning/jobseeker/courses/${course.id}/learn`)
              }
              onRetakeAssessment={handleStartAssessment}
              questions={questions}
              answers={resolvedReviewAnswers}
            />
          )}
        </div>
      )}
    </ELearningLayout>
  );
}

