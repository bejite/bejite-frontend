import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { BookOpen } from "lucide-react";
import {
  ELearningLayout,
  ELearningWelcomeBanner,
  ELearningSectionHeader,
  EnrolledCourseCard,
  ELearningButton,
} from "../../components/elearning";
import { getEnrolledCourses } from "../../services/elearningService";
import { getUser, mergeAuthUsers } from "../../utils/tokenManager";
import { formatDisplayPersonName } from "../../utils/personDisplayName";

export default function ELearningDashboardPage() {
  const navigate = useNavigate();
  const reduxUser = useSelector((state) => state.auth?.user);

  const firstName = useMemo(() => {
    const localUser = getUser();
    const merged = mergeAuthUsers(localUser || {}, reduxUser || localUser || {});
    const rawFirst = String(merged?.firstName ?? merged?.first_name ?? "").trim();
    if (rawFirst) return formatDisplayPersonName(rawFirst, "Learner");
    const full = formatDisplayPersonName(merged, "Learner");
    return full.split(/\s+/)[0] || "Learner";
  }, [reduxUser]);

  const [enrolledCourses] = useState(() => getEnrolledCourses());

  return (
    <ELearningLayout activeNavId="dashboard">
      <div className="space-y-7">
        {/* Welcome Banner */}
        <ELearningWelcomeBanner
          title={`Welcome back, ${firstName}`}
          description="Your Bejite Academy learning hub. Continue active courses, discover employer-partner curriculums, complete assessments, and build evidence for your recruitment profile."
        />

        {/* Active Curriculum Section */}
        <section className="space-y-4">
          <ELearningSectionHeader
            overline="ACTIVE CURRICULUM"
            overlineIcon={BookOpen}
            title="Continue Learning"
            subtitle="Courses you are currently enrolled in with immediate next steps."
            actionLabel="View all my courses"
            onActionClick={() => navigate("/e-learning/my-learning")}
          />

          {enrolledCourses.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center space-y-3">
              <p className="text-sm font-bold text-gray-900">
                You have not enrolled in any courses yet
              </p>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Explore employer-partner curriculums to build verified skill
                evidence for your Bejite profile.
              </p>
              <ELearningButton
                variant="primary"
                onClick={() => navigate("/e-learning/explore")}
              >
                Explore Courses
              </ELearningButton>
            </div>
          ) : (
            <div className="space-y-4">
              {enrolledCourses.map((course) => (
                <EnrolledCourseCard
                  key={course.id}
                  course={course}
                  progressMode="lessons"
                  onContinue={(c) =>
                    navigate(`/e-learning/courses/${c.id}/learn`)
                  }
                  onViewDetails={(c) =>
                    navigate(`/e-learning/courses/${c.id}`)
                  }
                  onTrackProgress={(c) =>
                    navigate(`/e-learning/courses/${c.id}/progress`)
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </ELearningLayout>
  );
}

