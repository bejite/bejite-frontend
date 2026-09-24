import { Route } from "react-router-dom";
import ProtectedRoute from "../../components/ProtectedRoute.jsx";
import {
  Recruitment,
  PostDetailPage,
  SharedPostRedirect,
  SharedJobRedirect,
  SharedAdRedirect,
  PostPage,
  Chat,
  Connections,
  Birthdays,
  Notifications,
  ActivityLog,
  AccountSettings,
  BadgeStatus,
  BadgeHolder,
  BadgePaymentCallback,
  JobVacancyListing,
  PitchPage,
} from "../lazyPages.js";
import MessagesToChatsRedirect from "./MessagesToChatsRedirect.jsx";

const guard = (element, message) => (
  <ProtectedRoute redirectMessage={message}>{element}</ProtectedRoute>
);

export const socialRoutes = (
  <>
    <Route path="/post-page" element={guard(<PostPage />, "Please log in to continue.")} />
    <Route path="/post/:postId" element={<PostDetailPage />} />
    <Route path="/p/:postId" element={<SharedPostRedirect />} />
    <Route path="/j/:jobId" element={<SharedJobRedirect />} />
    <Route path="/a/:campaignId" element={<SharedAdRedirect />} />
    <Route
      path="/news-feed"
      element={guard(<Recruitment />, "Please log in to view your feed.")}
    />
    <Route path="/pitch" element={guard(<PitchPage />, "Please log in to view pitches.")} />
    <Route path="/pitches" element={guard(<PitchPage />, "Please log in to view pitches.")} />
    <Route path="/badge" element={guard(<BadgeStatus />, "Please log in.")} />
    <Route
      path="/badge/payment-callback"
      element={guard(<BadgePaymentCallback />, "Please log in.")}
    />
    <Route
      path="/activity-logs"
      element={guard(<ActivityLog />, "Please log in to view activity.")}
    />
    <Route
      path="/account-settings"
      element={guard(<AccountSettings />, "Please log in to manage your account.")}
    />
    <Route
      path="/badge-holder"
      element={guard(<BadgeHolder />, "Please log in.")}
    />
    <Route path="/job-vacancy" element={<JobVacancyListing />} />
    <Route path="/chats" element={guard(<Chat />, "Please log in to view chats.")} />
    <Route path="/messages" element={<MessagesToChatsRedirect />} />
    <Route
      path="/connection"
      element={guard(<Connections />, "Please log in to view connections.")}
    />
    <Route
      path="/milestones"
      element={guard(<Birthdays />, "Please log in.")}
    />
    <Route
      path="/notification"
      element={guard(<Notifications />, "Please log in.")}
    />
    <Route
      path="/notifications"
      element={guard(<Notifications />, "Please log in.")}
    />
  </>
);
