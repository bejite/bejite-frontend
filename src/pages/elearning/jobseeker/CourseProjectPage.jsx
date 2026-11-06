import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import {
  ELearningLayout,
  ProjectWorkspaceBanner,
  ProjectBriefCard,
  ProjectSubmissionFormCard,
  ELearningSideCard,
} from "../../../components/elearning";
import {
  getCourseById,
  submitCourseDeliverable,
} from "../../../services/elearningService";

export default function CourseProjectPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(() => getCourseById(courseId));
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const loaded = getCourseById(courseId);
    setCourse(loaded);
    setPortfolioUrl(loaded?.deliverableState?.portfolioUrl || "");
    setFileName(loaded?.deliverableState?.fileName || "");
    setFileSize(loaded?.deliverableState?.fileSize || null);
    setNotes(loaded?.deliverableState?.content || "");
  }, [courseId]);

  if (!course || !course.deliverable) return null;

  const { deliverable, deliverableState } = course;
  const isSubmitted = Boolean(deliverableState?.submitted);
  const hasDraft = Boolean(
    portfolioUrl.trim() || fileName.trim() || notes.trim()
  );

  const bannerStatus = isSubmitted
    ? "Submitted"
    : hasDraft
      ? "In Progress"
      : "Not Yet Started";

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const updated = submitCourseDeliverable(course.id, {
        portfolioUrl,
        fileName,
        fileSize,
        content: notes,
      });
      setCourse(updated);
      toast.success(
        "Practical deliverable submitted! Your completion criteria have been updated."
      );
    } catch (err) {
      toast.error(err?.message || "Could not submit deliverable.");
    }
  };

  const stepsList =
    Array.isArray(deliverable.steps) && deliverable.steps.length > 0
      ? deliverable.steps
      : [deliverable.instructions].filter(Boolean);

  return (
    <ELearningLayout activeNavId="my-learning">
      <div className="space-y-6">
        {/* Top Sage Project Banner */}
        <ProjectWorkspaceBanner
          title={deliverable.title}
          courseTitle={course.title}
          status={bannerStatus}
          isSubmitted={isSubmitted}
          onCourseClick={() =>
            navigate(`/e-learning/jobseeker/courses/${course.id}/progress`)
          }
        />

        {/* Two-Column Project Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_315px] gap-6 items-start">
          {/* Left Main Column */}
          <div className="space-y-6">
            <ProjectBriefCard
              briefText={deliverable.projectBrief || deliverable.instructions}
              expectedDeliverable={deliverable.expectedDeliverable}
            />

            <ProjectSubmissionFormCard
              portfolioUrl={portfolioUrl}
              onPortfolioUrlChange={setPortfolioUrl}
              placeholderUrl={deliverable.placeholderUrl}
              fileName={fileName}
              fileSize={fileSize}
              onFileSelect={({ fileName: pickedName, fileSize: pickedSize }) => {
                setFileName(pickedName);
                setFileSize(pickedSize);
              }}
              onFileRemove={() => {
                setFileName("");
                setFileSize(null);
              }}
              notes={notes}
              onNotesChange={setNotes}
              placeholderNotes={deliverable.placeholderNotes}
              isSubmitted={isSubmitted}
              onSubmit={handleSubmit}
              onBackToProgress={() =>
                navigate(`/e-learning/jobseeker/courses/${course.id}/progress`)
              }
            />
          </div>

          {/* Right Instructions & Pathway Sidebar */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#374151]">
                STEP BY STEP INSTRUCTIONS
              </h3>

              <ul className="space-y-3.5">
                {stepsList.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-[#4B5563] leading-relaxed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16730F] mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <ELearningSideCard
              overline="EVIDENCE BUILDING PATHWAY"
              icon={CheckCircle2}
              tone="sage"
            >
              <p className="text-[11px] text-[#355246] leading-relaxed">
                Completing this practical deliverable creates verified work
                evidence for your portfolio. Please note that completing a
                project or course does not automatically guarantee employment,
                grant formal professional certification, or award an internship.
              </p>
            </ELearningSideCard>
          </div>
        </div>
      </div>
    </ELearningLayout>
  );
}


