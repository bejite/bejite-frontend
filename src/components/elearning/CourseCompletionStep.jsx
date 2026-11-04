import React from "react";
import { Check } from "lucide-react";

/**
 * Step 7: Completion Requirements Component.
 * Matches Figma Image 2 (media_1793753186885_db271577.png).
 */
export default function CourseCompletionStep({
  completion = {},
  onChangeCompletion,
  modulesCount = 3,
  lessonsCount = 6,
  quizTitle = "Digital Marketing Basics Quiz",
  quizQuestionsCount = 3,
  projectTitle = "Comprehensive Campaign Brief & Content Plan",
}) {
  const requireAllLessons = completion.requireAllLessons ?? true;
  const requireQuizPass = completion.requireQuizPass ?? true;
  const requireProjectSubmission = Boolean(completion.requireProjectSubmission);

  const toggle = (field) => {
    onChangeCompletion?.({
      ...completion,
      [field]: !completion[field],
    });
  };

  const REQUIREMENTS = [
    {
      key: "requireAllLessons",
      checked: requireAllLessons,
      title: "Complete the required learning content",
      description:
        "Learners must work through the instructional material and lessons defined in the course structure.",
      badge: `${modulesCount} modules • ${lessonsCount} lessons`,
    },
    {
      key: "requireQuizPass",
      checked: requireQuizPass,
      title: "Complete the configured assessment",
      description: "Learners must complete the quiz configured for this course.",
      badge: `${quizTitle || "Digital Marketing Basics Quiz"} (${quizQuestionsCount} questions)`,
    },
    {
      key: "requireProjectSubmission",
      checked: requireProjectSubmission,
      title: "Submit the practical project",
      description:
        "Learners must submit their practical deliverable (2-4 page Campaign Brief (PDF) or public Google Doc / Figma link) to complete the course.",
      badge: projectTitle || "Comprehensive Campaign Brief & Content Plan",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Sage Top Banner */}
      <div className="rounded-3xl bg-[#EFF5EF] border border-[#DCE8DC] p-6 sm:p-7">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#122B20]">
          Completion Requirements
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#5A6D62]">
          Define what learners must complete before this course can be marked as completed.
        </p>
      </div>

      {/* Main Requirements Card */}
      <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-7 space-y-4 shadow-2xs">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-[#122B20]">
            What must learners complete?
          </h2>
          <p className="mt-0.5 text-xs text-[#6B7B73]">
            Select only the requirements that apply to this course based on its configured components.
          </p>
        </div>

        {/* Requirements Stack */}
        <div className="space-y-3 pt-1">
          {REQUIREMENTS.map((req) => (
            <div
              key={req.key}
              onClick={() => toggle(req.key)}
              className={`p-4 sm:p-5 rounded-2xl cursor-pointer transition-all border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                req.checked
                  ? "border-[#16730F] bg-white ring-1 ring-[#16730F] shadow-xs"
                  : "border-[#E2EAE4] bg-[#FAFCFA] hover:border-[#A2C2A6]"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Square / Rounded Checkbox */}
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    req.checked
                      ? "bg-[#16730F] text-white"
                      : "border border-gray-300 bg-white"
                  }`}
                >
                  {req.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#122B20]">
                    {req.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-[#6B7B73] leading-relaxed max-w-xl">
                    {req.description}
                  </p>
                </div>
              </div>

              {/* Dynamic Metadata Badge Pill */}
              <div className="pl-8 sm:pl-0 shrink-0">
                <span className="rounded-xl bg-[#F0F4F1] border border-[#E2EAE4] text-[#1E3B2E] text-xs font-semibold px-3.5 py-1.5 inline-block">
                  {req.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

