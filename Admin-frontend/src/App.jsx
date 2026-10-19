import { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";

import AuthBootstrap from "./components/AuthBootstrap";
import PushNotificationBootstrap from "./components/PushNotificationBootstrap";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import { AdminInboxProvider } from "./context/AdminInboxContext";
import { getDefaultAdminPath } from "./constants/adminPermissions";

const AdminLogin = lazy(() => import("./page/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./page/admin/AdminDashboard"));
const AdminDemographics = lazy(() => import("./page/admin/AdminDemographics"));
const AdminEngagement = lazy(() => import("./page/admin/AdminEngagement"));
const AdminJobs = lazy(() => import("./page/admin/AdminJobs"));
const AdminList = lazy(() => import("./page/admin/AdminList"));
const AdminAdPro = lazy(() => import("./page/admin/AdminAdPro"));
const AdminUsers = lazy(() => import("./page/admin/AdminUsers"));
const AdminRevenue = lazy(() => import("./page/admin/AdminRevenue"));
const AdminRecruitment = lazy(() => import("./page/admin/AdminRecruitment"));
const AdminEmailOutreach = lazy(
  () => import("./page/admin/AdminEmailOutreach"),
);
const AdminEvents = lazy(() => import("./page/admin/AdminEvents"));
const AdminNotifications = lazy(
  () => import("./page/admin/AdminNotifications"),
);
const EmailSent = lazy(() => import("./page/auth/EmailSent"));
const AuthSuccess = lazy(() => import("./page/auth/AuthSuccess"));
const AuthFailure = lazy(() => import("./page/auth/AuthFailure"));

const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

function RouteFallback() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#16730F]" />
    </div>
  );
}

function AdminIndexRedirect() {
  const { user } = useSelector((state) => state.auth);
  return <Navigate to={getDefaultAdminPath(user?.admin_role)} replace />;
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <AuthBootstrap>
          <PushNotificationBootstrap />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* Admin Routes */}
              <Route path="/" element={<AdminLogin />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <AdminInboxProvider>
                      <AdminLayout />
                    </AdminInboxProvider>
                  </AdminProtectedRoute>
                }
              >
                <Route index element={<AdminIndexRedirect />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="jobs" element={<AdminJobs />} />
                <Route path="revenue" element={<AdminRevenue />} />
                <Route path="engagement" element={<AdminEngagement />} />
                <Route path="recruitment" element={<AdminRecruitment />} />
                <Route path="demographics" element={<AdminDemographics />} />
                <Route path="admins" element={<AdminList />} />
                <Route path="adpro" element={<AdminAdPro />} />
                <Route path="email-outreach" element={<AdminEmailOutreach />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="notifications" element={<AdminNotifications />} />
              </Route>

              <Route path="/auth/email-sent" element={<EmailSent />} />
              <Route path="/auth/success" element={<AuthSuccess />} />
              <Route path="/auth/failure" element={<AuthFailure />} />
            </Routes>
          </Suspense>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </AuthBootstrap>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
