import React from "react";
import {
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  FileVideo,
  Globe,
  Headphones,
  HelpCircle,
  Layers,
  Sparkles,
  Upload,
} from "lucide-react";

/**
 * Step 8: Course Review & Publishing Component.
 * Matches Figma Image 3 (media_1793753905598_0a382928.png).
 */
export default function CourseReviewStep({
  draft = {},
  onSubmitForReview,
}) {
  const modules = draft.modules || [];
  const totalLessons = modules.reduce(
    (acc, m) => acc + (m.lessons || []).length,
    0
  );
  const quiz = draft.quiz || {};
  const questions = quiz.questions || [];
  const project = draft.project || {};
  const isProjectEnabled = project.enabled ?? true;
  const pricing = draft.pricing || {};
  const completion = draft.completion || {};

  return (
    <div className="space-y-6">
      {/* Top Course Hero Card */}
      <div className="bg-[#EFF5EF] border border-[#DCE8DC] rounded-3xl p-6 sm:p-7 space-y-3.5 shadow-2xs">
        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-[#133023] text-[#A6E88E] text-[11px] font-bold px-3 py-1 rounded-md">
            {draft.levelShort || "Beginner Level"}
          </span>
          <span className="bg-[#DDE7DD] text-gray-800 text-[11px] font-bold px-3 py-1 rounded-md">
            {draft.subjectArea || "Marketing & Growth"}
          </span>
          <span className="bg-[#DDE7DD] text-gray-800 text-[11px] font-bold px-3 py-1 rounded-md">
            {pricing.isPaid ? `Paid (₦${Number(pricing.amount || 0).toLocaleString()})` : "Free Course"}
          </span>
        </div>

        <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#112A20] tracking-tight leading-tight">
          {draft.title || "Social Media Content Planning"}
        </h1>

        <p className="text-xs sm:text-sm text-[#4A6358] max-w-3xl leading-relaxed">
          {draft.summary ||
            "Learn how to organize content ideas, define strategic pillars, and execute a consistent editorial content calendar across social platforms."}
        </p>
      </div>

      {/* Main Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#122B20]">
            Course Configuration Details
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7B73]">
            Comprehensive summary of the curriculum, questions, project deliverable, and completion rules.
          </p>
        </div>

        <button
          type="button"
          onClick={onSubmitForReview}
          className="rounded-full bg-[#16730F] hover:bg-[#125E0C] text-white text-xs sm:text-sm font-bold px-6 py-2.5 transition-colors shadow-xs cursor-pointer shrink-0"
        >
          Submit for Review
        </button>
      </div>

      {/* 7 Review Blocks */}
      <div className="space-y-4">
        {/* 1. Basic Information */}
        <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0F4F1]">
            <div className="w-5 h-5 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <h3 className="text-sm font-bold text-[#122B20]">
              Basic Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-gray-400 font-medium">Subject Area:</span>
              <p className="font-bold text-[#122B20] mt-0.5">
                {draft.subjectArea || "Digital Marketing"}
              </p>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Target Audience:</span>
              <p className="font-bold text-[#122B20] mt-0.5">
                {draft.targetAudience || "Aspiring Marketers & Entrepreneurs"}
              </p>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Difficulty Level:</span>
              <p className="font-bold text-[#122B20] mt-0.5">
                {draft.levelShort || "Beginner"}
              </p>
            </div>
          </div>

          {/* Learning Outcomes */}
          {Array.isArray(draft.learningOutcomes) && draft.learningOutcomes.filter(Boolean).length > 0 && (
            <div className="pt-2">
              <span className="text-xs text-gray-400 font-medium">
                Learning Outcomes:
              </span>
              <ul className="mt-1.5 space-y-1">
                {draft.learningOutcomes.filter(Boolean).map((out, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-[#2A4337] flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16730F]" />
                    <span>{out}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cover Image Preview */}
          {draft.coverImage && (
            <div className="pt-2">
              <span className="text-xs text-gray-400 font-medium">
                Cover Image:
              </span>
              <div className="mt-2 w-48 h-28 rounded-2xl overflow-hidden border border-[#DCE8DC] bg-black">
                <img
                  src={draft.coverImage}
                  alt="Course cover"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* 2. Modules & Curriculum */}
        <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F1]">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <h3 className="text-sm font-bold text-[#122B20]">
                Modules & Curriculum
              </h3>
            </div>
            <span className="text-xs text-[#5A6D62] font-semibold">
              {modules.length} Modules • {totalLessons} Lessons
            </span>
          </div>

          <div className="space-y-3">
            {modules.map((mod, mIdx) => (
              <div
                key={mod.id || mIdx}
                className="rounded-2xl border border-[#E8EFEA] bg-[#FAFCFA] p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#122B20]">
                    Module {mIdx + 1}: {mod.title}
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {(mod.lessons || []).length} lessons
                  </span>
                </div>
                <div className="pl-3 border-l-2 border-[#16730F]/40 space-y-1.5 pt-1">
                  {(mod.lessons || []).map((les, lIdx) => (
                    <div
                      key={les.id || lIdx}
                      className="text-xs text-[#4A5D52] flex items-center justify-between"
                    >
                      <span>
                        #{lIdx + 1} {les.title}
                      </span>
                      <span className="text-[10px] bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                        {les.mediaType || "video"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Learning Content & Media */}
        <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-6 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0F4F1]">
            <div className="w-5 h-5 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <h3 className="text-sm font-bold text-[#122B20]">
              Learning Content & Media
            </h3>
          </div>
          <p className="text-xs text-[#5A6D62]">
            Total {totalLessons} lessons configured with Video, Audio, and PDF blocks with checkpoints.
          </p>
        </div>

        {/* 4. Assessment Configuration */}
        <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F1]">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <h3 className="text-sm font-bold text-[#122B20]">
                Assessment Configuration
              </h3>
            </div>
            <span className="text-xs text-[#5A6D62] font-semibold">
              Pass mark: {quiz.passMark || 80}% • {questions.length} questions
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-[#122B20]">
              {quiz.title || "Digital Marketing Basics Quiz"}
            </p>
            <div className="space-y-2 pt-1">
              {questions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="rounded-xl border border-[#E8EFEA] bg-[#FAFCFA] p-3 text-xs flex items-start justify-between gap-2"
                >
                  <div>
                    <span className="font-bold text-[#122B20] mr-1.5">
                      Q{idx + 1}.
                    </span>
                    <span className="text-[#3E5246]">{q.prompt}</span>
                  </div>
                  <span className="rounded-full bg-[#EAF5EC] text-[#16730F] text-[10px] font-bold px-2 py-0.5 shrink-0">
                    {q.type?.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Practical Project Deliverable */}
        <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-6 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F1]">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <h3 className="text-sm font-bold text-[#122B20]">
                Practical Project Deliverable
              </h3>
            </div>
            <span className="text-xs text-[#5A6D62] font-semibold">
              {isProjectEnabled ? "Included" : "None Configured"}
            </span>
          </div>

          {isProjectEnabled ? (
            <div className="space-y-2 text-xs">
              <p className="font-bold text-[#122B20]">
                {project.title || "Comprehensive Campaign Brief & Content Plan"}
              </p>
              <p className="text-[#5A6D62] leading-relaxed">
                {project.brief || "Practical hands-on activity."}
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-2">
                <span className="text-gray-400 font-medium">Accepted:</span>
                {(project.submissionFormats || ["file", "link"]).map((fmt) => (
                  <span
                    key={fmt}
                    className="rounded-full bg-[#F0F4F1] text-[#1E3B2E] text-[10px] font-bold px-2.5 py-0.5"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500">
              No practical project configured.
            </p>
          )}
        </div>

        {/* 6. Access & Tuition Fee */}
        <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-6 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F1]">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <h3 className="text-sm font-bold text-[#122B20]">
                Access & Tuition Fee
              </h3>
            </div>
            <span className="text-xs font-bold text-[#16730F]">
              {pricing.isPaid ? `₦${Number(pricing.amount || 0).toLocaleString()}` : "Free Enrollment"}
            </span>
          </div>
          <p className="text-xs text-[#5A6D62]">
            {pricing.isPaid
              ? "Paid access model — learners purchase enrollment on checkout."
              : "Open access model — free enrollment for all registered talent."}
          </p>
        </div>

        {/* 7. Completion Rules */}
        <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-6 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0F4F1]">
            <div className="w-5 h-5 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <h3 className="text-sm font-bold text-[#122B20]">
              Completion Rules
            </h3>
          </div>

          <div className="space-y-1.5 text-xs text-[#3E5246]">
            {completion.requireAllLessons && (
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#16730F]" />
                <span>All curriculum modules and practical lessons completed</span>
              </div>
            )}
            {completion.requireQuizPass && (
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#16730F]" />
                <span>Knowledge assessment quiz passed with at least {quiz.passMark || 80}%</span>
              </div>
            )}
            {completion.requireProjectSubmission && isProjectEnabled && (
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#16730F]" />
                <span>Hands-on practical project deliverable submitted</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

