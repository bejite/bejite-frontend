import { Route } from "react-router-dom";
import ProtectedRoute from "../../components/ProtectedRoute.jsx";
import {
  Profile,
  UserProfilePosts,
  SentInvite,
  EmployeeSentInvite,
  InterviewInvite,
  InterviewNotifications,
  SentInvitations,
} from "../lazyPages.js";

export const profileRoutes = (
  <>
      <Route path="/sent-invite" element={<SentInvite />} />
      <Route path="/employee-sent-invite" element={<EmployeeSentInvite />} />
      <Route path="/interview-invite" element={<InterviewInvite />} />
      <Route path="/my-invitations" element={<InterviewNotifications />} />
      <Route path="/sent-invitations" element={<SentInvitations />} />
      <Route
        path="/profile/posts"
        element={
          <ProtectedRoute>
            <UserProfilePosts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-profile/:userId/posts"
        element={
          <ProtectedRoute>
            <UserProfilePosts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-profile/:userId"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
  </>
);
