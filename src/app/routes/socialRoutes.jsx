import { Route } from "react-router-dom";
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

export const socialRoutes = (
  <>
    <Route path="/post-page" element={<PostPage />} />
    <Route path="/post/:postId" element={<PostDetailPage />} />
    <Route path="/p/:postId" element={<SharedPostRedirect />} />
    <Route path="/j/:jobId" element={<SharedJobRedirect />} />
    <Route path="/a/:campaignId" element={<SharedAdRedirect />} />
    <Route path="/news-feed" element={<Recruitment />} />
    <Route path="/pitch" element={<PitchPage />} />
    <Route path="/pitches" element={<PitchPage />} />
    <Route path="/badge" element={<BadgeStatus />} />
    <Route path="/badge/payment-callback" element={<BadgePaymentCallback />} />
    <Route path="/activity-logs" element={<ActivityLog />} />
    <Route path="/account-settings" element={<AccountSettings />} />
    <Route path="/badge-holder" element={<BadgeHolder />} />
    <Route path="/job-vacancy" element={<JobVacancyListing />} />
    <Route path="/chats" element={<Chat />} />
    <Route path="/messages" element={<MessagesToChatsRedirect />} />
    <Route path="/connection" element={<Connections />} />
    <Route path="/milestones" element={<Birthdays />} />
    <Route path="/notification" element={<Notifications />} />
    <Route path="/notifications" element={<Notifications />} />
  </>
);
