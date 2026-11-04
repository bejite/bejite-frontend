import React, { useEffect } from "react";
import {
  X,
  FileText,
  Upload,
  ExternalLink,
  CheckCircle2,
  Check,
  ShieldCheck,
  Layers,
  Sparkles,
} from "lucide-react";

/**
 * Slide-over drawer to inspect full practical project brief, deliverables, and rubric.
 * Matches Figma Image 5 (media_1793756099993_0bcf8096.png).
 */
export default function ProjectBriefDrawer({
  isOpen,
  onClose,
  project = {},
  courseTitle = "",
}) {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isEnabled = project.enabled ?? true;
  const title =
    project.title || "Comprehensive Campaign Brief & Content Plan";
  const brief =
    project.brief ||
    "Create an end-to-end 30-day social media campaign strategy for a direct-to-consumer sustainable fashion brand launching in Nigeria. Define target personas, content pillars, promotional calendar, and performance metrics.";
  const submissionFormats = project.submissionFormats || [
    "file",
    "link",
    "text",
  ];
  const isRequired = project.isRequired ?? true;

  const requirements = Array.isArray(project.requirements) &&
    project.requirements.length > 0
      ? project.requirements
      : [
          "Define at least 3 distinct target audience personas with demographic and psychographic profiles.",
          "Map 3 to 5 core content pillars with clear strategic rationale and brand alignment.",
          "Produce 12 sample post briefs including copy hooks, call-to-actions, and creative direction.",
          "Create a weekly content calendar with optimal posting cadences and platform format mix.",
          "Build a KPI measurement scorecard (reach, engagement rate, click-through, conversions).",
        ];

  const rubric = Array.isArray(project.rubric) && project.rubric.length > 0
    ? project.rubric
    : [
        {
          title: "Strategic Alignment",
          weight: "25%",
          description:
            "Project demonstrates clear understanding of brand identity, target personas, and market positioning.",
        },
        {
          title: "Content Quality & Creativity",
          weight: "25%",
          description:
            "Visual ideas and copywriting hooks are engaging, persuasive, and platform-appropriate.",
        },
        {
          title: "Planning & Organization",
          weight: "25%",
          description:
            "Content calendar is realistic, structured, and includes complete posting cadences.",
        },
        {
          title: "Performance & Metric Scorecard",
          weight: "25%",
          description:
            "Measurement framework has actionable KPIs, realistic benchmarks, and attribution tracking plans.",
        },
      ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="p-4 sm:p-6 border-b border-[#EDF3EE] bg-[#FAFCFA] flex items-start justify-between gap-3 sm:gap-4 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#EBF4EC] text-[#16730F] text-[10px] font-extrabold uppercase px-2.5 py-0.5 tracking-wider">
                  Project Deliverable
                </span>
                {courseTitle && (
                  <span className="text-xs text-gray-400 font-medium truncate max-w-[220px]">
                    {courseTitle}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#112A20] mt-1.5 leading-snug">
                Practical Project Brief
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer shrink-0"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Project Hero Card */}
            <div className="rounded-2xl border border-[#DCE8DC] bg-[#EFF6F0] p-5 space-y-3 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#16730F]">
                  Capstone Project
                </span>
                {isRequired ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#16730F] text-white text-[10px] font-extrabold px-3 py-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Required for Course Completion
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-200 text-gray-700 text-[10px] font-extrabold px-3 py-1">
                    Optional Deliverable
                  </span>
                )}
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-[#112A20] leading-snug">
                {title}
              </h3>
            </div>

            {/* Scenario Brief Card */}
            <div className="rounded-2xl border border-[#E5EDE7] bg-white p-5 space-y-2 shadow-2xs">
              <span className="font-extrabold text-[#112A20] block text-xs uppercase tracking-wider">
                Scenario Brief & Overview
              </span>
              <p className="text-xs sm:text-sm text-[#3E5246] leading-relaxed">
                {brief}
              </p>
            </div>

            {/* Deliverable Requirements & Breakdown */}
            <div className="rounded-2xl border border-[#E5EDE7] bg-white p-5 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#112A20] text-xs uppercase tracking-wider">
                  Deliverable Requirements & Tasks
                </span>
                <span className="text-[11px] text-gray-500 font-medium">
                  {requirements.length} Items
                </span>
              </div>

              <div className="space-y-2.5">
                {requirements.map((req, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-[#2A4337] leading-relaxed"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#EAF5EC] text-[#16730F] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Accepted Submission Formats */}
            <div className="rounded-2xl border border-[#E5EDE7] bg-white p-5 space-y-3 shadow-2xs">
              <span className="font-extrabold text-[#112A20] block text-xs uppercase tracking-wider">
                Accepted Submission Formats
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {submissionFormats.includes("file") && (
                  <div className="rounded-xl border border-[#DCE8DC] bg-[#FAFCFA] p-3 text-center space-y-1">
                    <div className="w-7 h-7 rounded-full bg-[#EBF4EC] text-[#16730F] mx-auto flex items-center justify-center">
                      <Upload className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#112A20] block">
                      File Upload
                    </span>
                    <span className="text-[10px] text-gray-500 block">
                      PDF, DOCX, ZIP (25MB)
                    </span>
                  </div>
                )}

                {submissionFormats.includes("link") && (
                  <div className="rounded-xl border border-[#DCE8DC] bg-[#FAFCFA] p-3 text-center space-y-1">
                    <div className="w-7 h-7 rounded-full bg-[#EBF4EC] text-[#16730F] mx-auto flex items-center justify-center">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#112A20] block">
                      External Link
                    </span>
                    <span className="text-[10px] text-gray-500 block">
                      Google Doc, Figma, Notion
                    </span>
                  </div>
                )}

                {submissionFormats.includes("text") && (
                  <div className="rounded-xl border border-[#DCE8DC] bg-[#FAFCFA] p-3 text-center space-y-1">
                    <div className="w-7 h-7 rounded-full bg-[#EBF4EC] text-[#16730F] mx-auto flex items-center justify-center">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#112A20] block">
                      Written Response
                    </span>
                    <span className="text-[10px] text-gray-500 block">
                      Direct text editor
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Evaluation Criteria & Rubric */}
            <div className="rounded-2xl border border-[#E5EDE7] bg-white p-5 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#112A20] text-xs uppercase tracking-wider">
                  Evaluation Criteria & Grading Standards
                </span>
                <span className="text-[11px] text-[#16730F] font-bold">
                  100% Total
                </span>
              </div>

              <div className="space-y-3">
                {rubric.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-[#EDF3EE] bg-[#FAFCFA] p-3.5 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#112A20]">
                        {idx + 1}. {item.title}
                      </span>
                      <span className="rounded-full bg-[#16730F] text-white text-[10px] font-extrabold px-2 py-0.5">
                        {item.weight}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#4A5D52] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Drawer Footer */}
          <div className="p-4 sm:p-5 border-t border-[#EDF3EE] bg-white shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full bg-[#16730F] hover:bg-[#125E0C] text-white font-bold text-xs sm:text-sm py-3 transition-colors shadow-xs cursor-pointer"
            >
              Close Brief
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

