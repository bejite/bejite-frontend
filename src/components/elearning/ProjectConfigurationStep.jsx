import React from "react";
import {
  Award,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Layers,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";

const SUGGESTED_CRITERIA = [
  "Clear problem statement and target audience definition",
  "Logical structure and practical applicability",
  "Professional presentation and clarity",
  "Actionable recommendations",
];

const SUBMISSION_FORMAT_OPTIONS = [
  {
    id: "file",
    title: "File Upload",
    description: "PDF, DOCX presentations, spreadsheets, or archives.",
    icon: Upload,
  },
  {
    id: "link",
    title: "External Link (URL)",
    description: "Figma, GitHub, Google Drive, or hosted portfolio URL.",
    icon: ExternalLink,
  },
  {
    id: "written",
    title: "Written Response",
    description: "Rich text response entered directly in Bejite.",
    icon: FileText,
  },
];

/**
 * Step 5 Practical Project Configuration Component.
 * Matches Figma Image 4 (Project Enabled) and Image 5 (Project Disabled).
 */
export default function ProjectConfigurationStep({
  project = {},
  onChangeProject,
}) {
  const isEnabled = project.enabled ?? true;
  const isRequired = project.isRequired ?? true;
  const formats = project.submissionFormats || ["file", "link"];
  const criteria =
    Array.isArray(project.evaluationCriteria) &&
    project.evaluationCriteria.length > 0
      ? project.evaluationCriteria
      : [
          "Clear problem statement and target audience definition",
          "Logical structure and practical applicability",
          "Professional presentation and clarity",
        ];

  const update = (updates) => {
    onChangeProject?.({
      ...project,
      ...updates,
    });
  };

  const handleToggleFormat = (formatId) => {
    let nextFormats;
    if (formats.includes(formatId)) {
      if (formats.length === 1) return; // Keep at least one format
      nextFormats = formats.filter((f) => f !== formatId);
    } else {
      nextFormats = [...formats, formatId];
    }
    update({ submissionFormats: nextFormats });
  };

  const handleAddCriteria = (text = "") => {
    update({
      evaluationCriteria: [...criteria, text],
    });
  };

  const handleCriteriaChange = (index, value) => {
    const next = [...criteria];
    next[index] = value;
    update({ evaluationCriteria: next });
  };

  const handleMoveCriteria = (index, direction) => {
    const next = [...criteria];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= next.length) return;
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    update({ evaluationCriteria: next });
  };

  const handleDeleteCriteria = (index) => {
    if (criteria.length <= 1) return;
    const next = criteria.filter((_, i) => i !== index);
    update({ evaluationCriteria: next });
  };

  return (
    <div className="space-y-6">
      {/* Sage Top Banner */}
      <div className="rounded-3xl bg-[#EFF5EF] border border-[#DCE8DC] p-6 sm:p-7">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#122B20]">
          Practical Project
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#5A6D62]">
          Create practical activity that helps learners apply what they have learned.
        </p>
      </div>

      {/* Card 1: Include Project Toggle (Image 4 & 5) */}
      <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-7 space-y-4 shadow-2xs">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-[#122B20]">
            Include a practical project in this course?
          </h2>
          <p className="mt-0.5 text-xs text-[#6B7B73]">
            Decide whether learners should produce a tangible deliverable to demonstrate competency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option: Yes */}
          <div
            onClick={() => update({ enabled: true })}
            className={`rounded-2xl p-4 sm:p-5 text-left cursor-pointer transition-all flex items-start justify-between gap-3 border ${
              isEnabled
                ? "border-[#16730F] bg-white ring-1 ring-[#16730F] shadow-xs"
                : "border-[#E2EAE4] bg-[#FAFCFA] hover:border-[#A2C2A6]"
            }`}
          >
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#122B20]">
                Yes, include a practical project
              </p>
              <p className="mt-1 text-xs text-[#6B7B73] leading-relaxed">
                Recommended for skills-focused courses — learners build a portfolio item or real-world artifact.
              </p>
            </div>
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                isEnabled
                  ? "bg-[#16730F] text-white"
                  : "border border-gray-300 bg-white"
              }`}
            >
              {isEnabled && <Check className="w-3 h-3 stroke-[3]" />}
            </span>
          </div>

          {/* Option: No */}
          <div
            onClick={() => update({ enabled: false })}
            className={`rounded-2xl p-4 sm:p-5 text-left cursor-pointer transition-all flex items-start justify-between gap-3 border ${
              !isEnabled
                ? "border-[#16730F] bg-white ring-1 ring-[#16730F] shadow-xs"
                : "border-[#E2EAE4] bg-[#FAFCFA] hover:border-[#A2C2A6]"
            }`}
          >
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#122B20]">
                No practical project needed
              </p>
              <p className="mt-1 text-xs text-[#6B7B73] leading-relaxed">
                Suitable for theory-only, short recap, or quick certification courses. Assessment/quizzes become the sole hurdle.
              </p>
            </div>
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                !isEnabled
                  ? "bg-[#16730F] text-white"
                  : "border border-gray-300 bg-white"
              }`}
            >
              {!isEnabled && <Check className="w-3 h-3 stroke-[3]" />}
            </span>
          </div>
        </div>
      </div>

      {/* When Project is Disabled (Image 5) */}
      {!isEnabled && (
        <div className="rounded-3xl border border-[#DCE8DC] bg-[#EFF5EF] p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-2">
          <p className="text-xs sm:text-sm font-medium text-[#4A6358] leading-relaxed">
            No practical project configured for this course. Learners will finish the curriculum via modules and quiz assessments.
          </p>
        </div>
      )}

      {/* When Project is Enabled (Image 4): 4 Full Configuration Cards */}
      {isEnabled && (
        <div className="space-y-6">
          {/* Card 2: Project Details & Scenario Brief */}
          <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-7 space-y-5 shadow-2xs">
            <div className="flex items-center gap-2 pb-3 border-b border-[#F0F4F1]">
              <FileText className="w-4 h-4 text-[#16730F]" />
              <div>
                <h3 className="text-sm font-bold text-[#122B20]">
                  Project Details & Scenario Brief
                </h3>
                <p className="text-xs text-[#6B7B73]">
                  Explain the scenario, deliverable requirements, and learning outcomes.
                </p>
              </div>
            </div>

            {/* Project Title */}
            <div>
              <label className="block text-xs font-bold text-[#122B20] mb-1.5">
                Project Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={project.title || ""}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Comprehensive Campaign Brief & Content Plan"
                className="w-full rounded-2xl border border-[#E2EAE4] focus:border-[#16730F] focus:ring-1 focus:ring-[#16730F]/20 px-4 py-3 text-xs sm:text-sm text-gray-900 outline-none transition"
              />
              <p className="mt-1 text-[11px] text-[#718279]">
                Give your project a descriptive name that reflects the final deliverable.
              </p>
            </div>

            {/* Scenario Brief (Instructions) */}
            <div>
              <label className="block text-xs font-bold text-[#122B20] mb-1.5">
                Scenario Brief (Instructions) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={project.brief || ""}
                onChange={(e) => update({ brief: e.target.value })}
                placeholder="Assume you are the lead digital strategist for a mid-market consumer brand launch. Produce an end-to-end launch plan covering budget allocation, channel strategy, and initial creative briefs."
                className="w-full rounded-2xl border border-[#E2EAE4] focus:border-[#16730F] focus:ring-1 focus:ring-[#16730F]/20 p-4 text-xs sm:text-sm text-gray-900 outline-none transition resize-none leading-relaxed"
              />
            </div>

            {/* Practical Competency or Skills Demonstrated */}
            <div>
              <label className="block text-xs font-bold text-[#122B20] mb-1.5">
                Practical Competency or Skills Demonstrated (Recommended)
              </label>
              <input
                type="text"
                value={project.skills || ""}
                onChange={(e) => update({ skills: e.target.value })}
                placeholder="Presentation preparation, practical client briefing, social channel strategy, content planning, and estimating campaign ROI"
                className="w-full rounded-2xl border border-[#E2EAE4] focus:border-[#16730F] focus:ring-1 focus:ring-[#16730F]/20 px-4 py-3 text-xs sm:text-sm text-gray-900 outline-none transition"
              />
              <p className="mt-1 text-[11px] text-[#718279]">
                Highlight key resume skills learners will demonstrate when submitting this project.
              </p>
            </div>

            {/* Deliverable Requirements Breakdown */}
            <div>
              <label className="block text-xs font-bold text-[#122B20] mb-1.5">
                Deliverable Requirements Breakdown
              </label>
              <textarea
                rows={5}
                value={project.requirements || ""}
                onChange={(e) => update({ requirements: e.target.value })}
                placeholder={`1. Audience Identification\n- Create 2 detailed customer personas detailing demographics, interests, pain points, and preferred social channels.\n\n2. Channel Strategy & Budget\n- Allocate a $10,000 monthly launch budget across paid search, social advertising, and influencer marketing with clear rationale for each.`}
                className="w-full rounded-2xl border border-[#E2EAE4] focus:border-[#16730F] focus:ring-1 focus:ring-[#16730F]/20 p-4 text-xs sm:text-sm text-gray-900 outline-none transition resize-none leading-relaxed"
              />
              <p className="mt-1 text-[11px] text-[#718279]">
                List bullet-point criteria so learners know exactly what to submit.
              </p>
            </div>
          </div>

          {/* Card 3: Deliverable Expectations & Submission Formats */}
          <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-7 space-y-5 shadow-2xs">
            <div className="flex items-center gap-2 pb-3 border-b border-[#F0F4F1]">
              <Layers className="w-4 h-4 text-[#16730F]" />
              <div>
                <h3 className="text-sm font-bold text-[#122B20]">
                  Deliverable Expectations & Submission Formats
                </h3>
                <p className="text-xs text-[#6B7B73]">
                  Define what formats learners should submit and where to host assets.
                </p>
              </div>
            </div>

            {/* Expected Submission Title */}
            <div>
              <label className="block text-xs font-bold text-[#122B20] mb-1.5">
                Expected Submission Title
              </label>
              <input
                type="text"
                value={project.expectedSubmissionTitle || ""}
                onChange={(e) => update({ expectedSubmissionTitle: e.target.value })}
                placeholder="Final Campaign Strategy PDF & Google Sheet Media Plan"
                className="w-full rounded-2xl border border-[#E2EAE4] focus:border-[#16730F] focus:ring-1 focus:ring-[#16730F]/20 px-4 py-3 text-xs sm:text-sm text-gray-900 outline-none transition"
              />
            </div>

            {/* Accepted Submission Format */}
            <div>
              <div className="mb-2">
                <label className="block text-xs font-bold text-[#122B20]">
                  Accepted Submission Format <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-[#718279]">
                  Choose at least one format learners can submit for review.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {SUBMISSION_FORMAT_OPTIONS.map((opt) => {
                  const isChecked = formats.includes(opt.id);
                  const IconComponent = opt.icon;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleToggleFormat(opt.id)}
                      className={`p-4 rounded-2xl cursor-pointer transition-all border flex items-start justify-between gap-3 ${
                        isChecked
                          ? "border-[#16730F] bg-white ring-1 ring-[#16730F] shadow-xs"
                          : "border-[#E2EAE4] bg-[#FAFCFA] hover:border-[#A2C2A6]"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4 text-[#16730F]" />
                          <span className="text-xs font-bold text-[#122B20]">
                            {opt.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6B7B73] leading-relaxed">
                          {opt.description}
                        </p>
                      </div>

                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isChecked
                            ? "bg-[#16730F] text-white"
                            : "border border-gray-300 bg-white"
                        }`}
                      >
                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Submission Guidelines (Instructions) */}
            <div>
              <label className="block text-xs font-bold text-[#122B20] mb-1.5">
                Detailed Submission Guidelines (Instructions)
              </label>
              <textarea
                rows={3}
                value={project.guidelines || ""}
                onChange={(e) => update({ guidelines: e.target.value })}
                placeholder="Please combine your PDF into a single export. Ensure Google Drive links are set to &quot;Anyone with the link can view&quot;."
                className="w-full rounded-2xl border border-[#E2EAE4] focus:border-[#16730F] focus:ring-1 focus:ring-[#16730F]/20 p-4 text-xs sm:text-sm text-gray-900 outline-none transition resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Card 4: Course Completion Requirement */}
          <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-7 space-y-4 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-[#122B20]">
                Course Completion Requirement
              </h3>
              <p className="mt-0.5 text-xs text-[#6B7B73]">
                Specify whether passing this project is mandatory to receive the course certificate.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Required */}
              <div
                onClick={() => update({ isRequired: true })}
                className={`rounded-2xl p-4 sm:p-5 text-left cursor-pointer transition-all flex items-start justify-between gap-3 border ${
                  isRequired
                    ? "border-[#16730F] bg-white ring-1 ring-[#16730F] shadow-xs"
                    : "border-[#E2EAE4] bg-[#FAFCFA] hover:border-[#A2C2A6]"
                }`}
              >
                <div>
                  <p className="text-xs sm:text-sm font-bold text-[#122B20]">
                    Required for Course Completion
                  </p>
                  <p className="mt-1 text-xs text-[#6B7B73] leading-relaxed">
                    Learners must submit this project and meet evaluation standards before the course certificate is awarded.
                  </p>
                </div>
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    isRequired
                      ? "bg-[#16730F] text-white"
                      : "border border-gray-300 bg-white"
                  }`}
                >
                  {isRequired && <Check className="w-3 h-3 stroke-[3]" />}
                </span>
              </div>

              {/* Optional */}
              <div
                onClick={() => update({ isRequired: false })}
                className={`rounded-2xl p-4 sm:p-5 text-left cursor-pointer transition-all flex items-start justify-between gap-3 border ${
                  !isRequired
                    ? "border-[#16730F] bg-white ring-1 ring-[#16730F] shadow-xs"
                    : "border-[#E2EAE4] bg-[#FAFCFA] hover:border-[#A2C2A6]"
                }`}
              >
                <div>
                  <p className="text-xs sm:text-sm font-bold text-[#122B20]">
                    Optional Practice Activity
                  </p>
                  <p className="mt-1 text-xs text-[#6B7B73] leading-relaxed">
                    Learners are encouraged to complete the project, but it is not mandatory to complete the course.
                  </p>
                </div>
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    !isRequired
                      ? "bg-[#16730F] text-white"
                      : "border border-gray-300 bg-white"
                  }`}
                >
                  {!isRequired && <Check className="w-3 h-3 stroke-[3]" />}
                </span>
              </div>
            </div>
          </div>

          {/* Card 5: Evaluation Criteria & Grading Standards */}
          <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-7 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-3 border-b border-[#F0F4F1]">
              <Award className="w-4 h-4 text-[#16730F]" />
              <div>
                <h3 className="text-sm font-bold text-[#122B20]">
                  Evaluation Criteria & Grading Standards
                </h3>
                <p className="text-xs text-[#6B7B73]">
                  Define criteria rubric used by evaluators when reviewing candidate submissions.
                </p>
              </div>
            </div>

            {/* Quick chips & Add Outcome Button */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                {SUGGESTED_CRITERIA.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => {
                      if (!criteria.includes(sug)) {
                        handleAddCriteria(sug);
                      }
                    }}
                    className="rounded-full bg-[#EAF2EA] hover:bg-[#DCE8DC] text-[#122B20] text-[11px] font-semibold px-3 py-1.5 transition-colors cursor-pointer border border-[#D5E1D7] flex items-center gap-1"
                  >
                    <span>+</span>
                    <span>{sug}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleAddCriteria("")}
                className="rounded-xl bg-[#16730F] hover:bg-[#125E0C] text-white text-xs font-bold px-4 py-2 transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Outcome</span>
              </button>
            </div>

            {/* Rubric Items List */}
            <div className="space-y-3 pt-2">
              {criteria.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 sm:gap-3 group"
                >
                  {/* Number Badge */}
                  <span className="w-7 h-7 rounded-full bg-[#16730F] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
                    {idx + 1}
                  </span>

                  {/* Input */}
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleCriteriaChange(idx, e.target.value)}
                    placeholder="Enter evaluation criteria..."
                    className="flex-1 rounded-2xl border border-[#DCE6DF] focus:border-[#16730F] focus:ring-1 focus:ring-[#16730F]/20 px-4 py-3 text-xs sm:text-sm text-gray-900 bg-white outline-none transition"
                  />

                  {/* Reorder Buttons */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveCriteria(idx, "up")}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      aria-label="Move criteria up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === criteria.length - 1}
                      onClick={() => handleMoveCriteria(idx, "down")}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      aria-label="Move criteria down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteCriteria(idx)}
                    className="rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold px-3.5 py-2 transition-colors cursor-pointer shrink-0 shadow-2xs"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

