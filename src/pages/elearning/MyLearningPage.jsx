import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import {
  ELearningLayout,
  ELearningWelcomeBanner,
  ELearningSectionHeader,
  EnrolledCourseCard,
  ELearningButton,
} from "../../components/elearning";
import { getEnrolledCourses } from "../../services/elearningService";

const FILTERS = [
  { id: "all", label: "All Enrolled" },
  { id: "in_progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
];

export default function MyLearningPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [courses] = useState(() => getEnrolledCourses());

  const filteredCourses = useMemo(() => {
    if (filter === "completed") {
      return courses.filter((c) => c.criteria?.allComplete);
    }
    if (filter === "in_progress") {
      return courses.filter((c) => !c.criteria?.allComplete);
    }
    return courses;
  }, [courses, filter]);

  return (
    <ELearningLayout activeNavId="my-learning">
      <div className="space-y-6">
        <ELearningWelcomeBanner
          title="My Learning"
          description="Resume your enrolled courses, review syllabus modules, and track completion criteria across assessments and portfolio deliverables."
          rightSlot={
            <ELearningButton
              variant="primary"
              onClick={() => navigate("/e-learning/explore")}
            >
              Browse More Courses
            </ELearningButton>
          }
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <ELearningSectionHeader
            overline="ENROLLED CURRICULUM"
            overlineIcon={GraduationCap}
            title="Your Enrolled Courses"
            subtitle={`${filteredCourses.length} ${
              filteredCourses.length === 1 ? "course" : "courses"
            } shown`}
          />

          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl p-1">
            {FILTERS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filter === tab.id
                    ? "bg-[#16730F] text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center space-y-3">
            <p className="text-sm font-bold text-gray-900">
              No courses in this view yet
            </p>
            <p className="text-xs text-gray-500">
              Switch filters or explore additional partner courses.
            </p>
            <ELearningButton
              variant="soft"
              onClick={() => navigate("/e-learning/explore")}
            >
              Explore Courses
            </ELearningButton>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCourses.map((course) => (
              <EnrolledCourseCard
                key={course.id}
                course={course}
                progressMode="lessons"
                onContinue={(c) =>
                  navigate(`/e-learning/courses/${c.id}/learn`)
                }
                onViewDetails={(c) => navigate(`/e-learning/courses/${c.id}`)}
                onTrackProgress={(c) =>
                  navigate(`/e-learning/courses/${c.id}/progress`)
                }
              />
            ))}
          </div>
        )}
      </div>
    </ELearningLayout>
  );
}

