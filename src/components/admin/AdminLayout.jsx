import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  X,
  DollarSign,
  Activity,
  Shield,
  Megaphone,
} from "lucide-react";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/admin/login");
  };

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
    { name: "Settings", path: "#", icon: Settings },
  ];

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
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 flex flex-col h-screen lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
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
              Analytics
            </p>
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                  ${
                    isActive && item.path !== "#"
                      ? "bg-[#16730F] text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-50 hover:text-[#16730F]"
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon
                  size={20}
                  className={
                    item.path === "/admin/dashboard" ? "" : "text-gray-400"
                  }
                />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="shrink-0 border-t border-gray-100 px-4 py-4">
            <div className="flex items-center gap-3 px-3 py-3 mb-2">
              <div className="h-10 w-10 bg-[#16730F]/10 rounded-full flex items-center justify-center text-[#16730F] font-bold">
                {user?.firstName?.[0] || "A"}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs text-gray-500">Administrator</span>
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white shadow-sm h-16 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <span className="font-semibold text-gray-800">Admin Portal</span>
          </div>
          <div className="h-8 w-8 bg-[#16730F]/10 rounded-full flex items-center justify-center text-[#16730F] font-bold text-sm">
            {user?.firstName?.[0] || "A"}
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
