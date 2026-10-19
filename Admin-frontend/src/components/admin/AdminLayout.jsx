import { useState, useCallback } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  LogOut,
  Menu,
  X,
  DollarSign,
  Activity,
  Shield,
  Megaphone,
  Mail,
  Calendar,
  Bell,
} from "lucide-react";
import {
  canAccessPath,
  getAdminRoleLabel,
} from "../../constants/adminPermissions";
import NotificationDropdown from "./NotificationDropdown";
import { useAdminInbox } from "../../context/AdminInboxContext";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [bellRing, setBellRing] = useState(false);
  const { notifications, unreadCount } = useAdminInbox();

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/admin/login");
  };

  const handleBellClick = useCallback(() => {
    setNotifOpen((prev) => !prev);
    setBellRing(true);
    setTimeout(() => setBellRing(false), 800);
  }, []);

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Demographics", path: "/admin/demographics", icon: Users },
    { name: "Engagement", path: "/admin/engagement", icon: Activity },
    { name: "Recruitment", path: "/admin/recruitment", icon: Briefcase },
    { name: "Revenue", path: "/admin/revenue", icon: DollarSign },
    { name: "Users List", path: "/admin/users", icon: Users },
    { name: "Admins", path: "/admin/admins", icon: Shield },
    { name: "Jobs List", path: "/admin/jobs", icon: Briefcase },
    { name: "AdPro Review", path: "/admin/adpro", icon: Megaphone },
    { name: "Email Outreach", path: "/admin/email-outreach", icon: Mail },
    { name: "Events Manager", path: "/admin/events", icon: Calendar },
    {
      name: "Notifications",
      path: "/admin/notifications",
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null,
    },
  ].filter((item) => canAccessPath(user?.admin_role, item.path));

  const roleLabel = getAdminRoleLabel(user?.admin_role);
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    "Admin";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 flex flex-col h-screen lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100 shrink-0">
          <img
            src="/assets/images/logo.png"
            alt="Bejite Logo"
            className="h-8"
          />
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <nav className="flex-1 overflow-y-auto nfl-scroll px-4 py-6 space-y-1">
            <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Analytics &amp; Management
            </p>
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200
                  ${
                    isActive
                      ? "bg-[#16730F] text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-50 hover:text-[#16730F]"
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <item.icon
                        size={20}
                        className={
                          isActive
                            ? "text-white"
                            : item.path === "/admin/notifications" && unreadCount > 0
                            ? "text-amber-500"
                            : "text-gray-400"
                        }
                      />
                      <span className="font-medium truncate">{item.name}</span>
                    </div>
                    {item.badge != null && (
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? "bg-white text-[#16730F]"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="shrink-0 border-t border-gray-100 px-4 py-4">
            <div className="flex items-center gap-3 px-3 py-3 mb-2">
              <div className="h-10 w-10 bg-[#16730F]/10 rounded-full flex items-center justify-center text-[#16730F] font-bold">
                {displayName?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-gray-800 truncate">
                  {displayName}
                </span>
                <span className="text-xs text-gray-500">{roleLabel}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar with Notification Bell and User Status */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 lg:px-8 shrink-0 border-b border-gray-100/80 z-20">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Admin Control Center
              </span>
            </div>
            <span className="sm:hidden font-semibold text-gray-800">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                onClick={handleBellClick}
                className={`relative p-2.5 rounded-xl border border-gray-100 text-gray-600 hover:text-[#16730F] hover:bg-[#16730F]/5 hover:border-[#16730F]/20 transition-all duration-200 shadow-sm ${
                  bellRing ? "notif-bell-ring" : ""
                }`}
                aria-label="Notifications"
                id="notification-bell"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center">
                    <span className="absolute h-4 w-4 rounded-full bg-red-500/40 notif-badge-pulse" />
                    <span className="relative h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center leading-none shadow-sm">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  </span>
                )}
              </button>

              <NotificationDropdown
                isOpen={notifOpen}
                onClose={() => setNotifOpen(false)}
                notifications={notifications}
                unreadCount={unreadCount}
              />
            </div>

            {/* Profile Avatar Pill */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
              <div className="h-9 w-9 bg-gradient-to-br from-[#16730F] to-[#0e4d0a] text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-sm">
                {displayName?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-gray-800 leading-tight">
                  {displayName}
                </span>
                <span className="text-[10px] text-gray-500 font-medium">
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto nfl-scroll scroll-smooth bg-gray-50/50 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
