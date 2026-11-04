import React, { useMemo } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import NewsFeedLayout from "../../../components/layout/NewsFeedLayout";
import { CourseBuilderWizard } from "../../../components/elearning";
import { isRecruiterAccount } from "../../../services/accountDelegationService";
import {
  getRecruiterCourseById,
  saveRecruiterCourse,
} from "../../../services/elearningService";
import { getUser, mergeAuthUsers } from "../../../utils/tokenManager";

export default function CourseBuilderPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const reduxUser = useSelector((state) => state.auth?.user);
  const resolvedUser = useMemo(
    () => mergeAuthUsers(getUser() || {}, reduxUser || {}),
    [reduxUser]
  );

  const existingCourse = useMemo(
    () => (courseId ? getRecruiterCourseById(courseId) : null),
    [courseId]
  );

  if (!isRecruiterAccount(resolvedUser)) {
    return <Navigate to="/news-feed" replace />;
  }

  if (courseId && !existingCourse) {
    return <Navigate to="/e-learning/partner" replace />;
  }

  const isEditMode = Boolean(courseId && existingCourse);

  const handleSaveCourse = (courseDraft, { status } = {}) => {
    const saved = saveRecruiterCourse(courseDraft, { status });
    if (status === "published") {
      toast.success(
        `"${saved.title}" is now published on Bejite Academy!`
      );
    } else if (status === "in_review") {
      toast.success(`"${saved.title}" submitted for admin review.`);
    } else {
      toast.success(`"${saved.title}" saved to drafts.`);
    }
    navigate("/e-learning/partner");
  };

  return (
    <NewsFeedLayout
      showSidebars={false}
      classes="overflow-y-scroll overflow-x-hidden nfl-scroll scroll-smooth bg-white"
    >
      <div className="shrink-0 w-full bg-white">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <CourseBuilderWizard
            key={courseId || "new-course"}
            mode={isEditMode ? "edit" : "create"}
            initialCourse={existingCourse}
            onBack={() => navigate("/e-learning/partner")}
            onSaveCourse={handleSaveCourse}
          />
        </div>
      </div>
    </NewsFeedLayout>
  );
}


