import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ELearningLayout,
  ELearningWelcomeBanner,
  ELearningFilterTabs,
  MyLearningCourseCard,
  ELearningButton,
} from "../../../components/elearning";
import { getEnrolledCourses } from "../../../services/elearningService";

const FILTERS = [
  { id: "all", label: "All courses" },
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
          description="Manage your enrolled courses, track real-time learning progress, continue where you left off, and review completed study materials."
        />

        <ELearningFilterTabs
          tabs={FILTERS}
          activeTab={filter}
          onChange={setFilter}
        />

        {filteredCourses.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center space-y-3">
            <p className="text-sm font-bold text-gray-900">
              {filter === "completed"
                ? "No completed courses yet"
                : "No courses in this view yet"}
            </p>
            <p className="text-xs text-gray-500">
              {filter === "completed"
                ? "Finish all lessons, pass the assessment quiz, and submit your practical project to complete a course."
                : "Switch filters or explore additional partner courses."}
            </p>
            <ELearningButton
              variant="soft"
              onClick={() =>
                filter !== "all"
                  ? setFilter("all")
                  : navigate("/e-learning/jobseeker/explore")
              }
            >
              {filter !== "all" ? "View All Courses" : "Explore Courses"}
            </ELearningButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredCourses.map((course) => (
              <MyLearningCourseCard
                key={course.id}
                course={course}
                onPrimaryAction={(c) =>
                  navigate(`/e-learning/jobseeker/courses/${c.id}/learn`)
                }
                onProgressClick={(c) =>
                  navigate(`/e-learning/jobseeker/courses/${c.id}/progress`)
                }
                onOverviewClick={(c) =>
                  navigate(`/e-learning/jobseeker/courses/${c.id}`)
                }
              />
            ))}
          </div>
        )}
      </div>
    </ELearningLayout>
  );
}

