import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import RecruiterSelect from "../../components/admin/RecruiterSelect";
import {
  Search,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  Plus,
  X,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  ADMIN_ROLES,
  ADMIN_ROLE_LABELS,
  getAdminRoleLabel,
} from "../../constants/adminPermissions";

const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]{3,50}$/;

const ROLE_OPTIONS = [
  {
    value: ADMIN_ROLES.SUPER_ADMIN,
    label: ADMIN_ROLE_LABELS[ADMIN_ROLES.SUPER_ADMIN],
  },
  { value: ADMIN_ROLES.ADMIN, label: ADMIN_ROLE_LABELS[ADMIN_ROLES.ADMIN] },
  {
    value: ADMIN_ROLES.ACCOUNT,
    label: ADMIN_ROLE_LABELS[ADMIN_ROLES.ACCOUNT],
  },
];

const emptyForm = {
  username: "",
  password: "",
  isActive: true,
  admin_role: ADMIN_ROLES.ADMIN,
};

const AdminList = () => {
  const currentUser = useSelector((state) => state.auth.user);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const selfRecord = admins.find(
    (admin) => String(admin.id) === String(currentUser?.id),
  );
  const isSuperAdmin =
    (currentUser?.admin_role ?? selfRecord?.admin_role) ===
    ADMIN_ROLES.SUPER_ADMIN;

  const [modalMode, setModalMode] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/admin-auth/admins");
      setAdmins(response.data.admins ?? []);
    } catch (error) {
      console.error("Error fetching admins", error);
      toast.error("Failed to load admins data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const response = await axiosInstance.get("/api/admin/data/admins");
        setAdmins(response.data.admins);
      } catch (error) {
        console.error("Error fetching admins", error);
        toast.error("Failed to load admins data");
      } finally {
        setLoading(false);
      }
    };
    loadAdmins();
  }, []);

  const closeModal = () => {
    setModalMode(null);
    setEditingAdmin(null);
    setFormData(emptyForm);
    setShowPassword(false);
  };

  const openCreateModal = () => {
    setModalMode("create");
    setEditingAdmin(null);
    setFormData(emptyForm);
    setShowPassword(false);
  };

  const openEditModal = (admin) => {
    setModalMode("edit");
    setEditingAdmin(admin);
    setFormData({
      username: admin.username || "",
      password: "",
      isActive: admin.isActive !== false,
      admin_role: admin.admin_role || ADMIN_ROLES.ADMIN,
    });
    setShowPassword(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateUsername = (username) => {
    if (!USERNAME_PATTERN.test(username)) {
      toast.error(
        'Username must be 3-50 characters and may only contain letters, numbers, ".", "_" or "-".',
      );
      return false;
    }
    return true;
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    const username = formData.username.trim();
    const { password } = formData;

    if (!validateUsername(username)) return;

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await axiosInstance.post("/api/admin-auth/admins", {
        username,
        password,
        admin_role: formData.admin_role,
      });
      toast.success(response.data.message || "Admin added successfully");
      closeModal();
      fetchAdmins();
    } catch (error) {
      console.error("Error adding admin", error);
      toast.error(error.response?.data?.error || "Failed to add admin");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    if (!editingAdmin) return;

    const username = formData.username.trim();
    const password = formData.password.trim();

    if (!validateUsername(username)) return;

    if (password && password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    const payload = {
      username,
      isActive: formData.isActive,
      admin_role: formData.admin_role,
    };
    if (password) payload.password = password;

    try {
      setSubmitting(true);
      const response = await axiosInstance.put(
        `/api/admin-auth/admins/${editingAdmin.id}`,
        payload,
      );
      toast.success(response.data.message || "Admin updated successfully");
      closeModal();
      fetchAdmins();
    } catch (error) {
      console.error("Error updating admin", error);
      toast.error(error.response?.data?.error || "Failed to update admin");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;

    try {
      setSubmitting(true);
      const response = await axiosInstance.delete(
        `/api/admin-auth/admins/${adminToDelete.id}`,
      );
      toast.success(response.data.message || "Admin deleted successfully");
      setAdminToDelete(null);
      fetchAdmins();
    } catch (error) {
      console.error("Error deleting admin", error);
      toast.error(error.response?.data?.error || "Failed to delete admin");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAdmins = admins.filter((admin) => {
    const term = searchTerm.toLowerCase();
    return (
      admin.username?.toLowerCase().includes(term) ||
      admin.firstName?.toLowerCase().includes(term) ||
      admin.lastName?.toLowerCase().includes(term) ||
      admin.email?.toLowerCase().includes(term)
    );
  });

  const isSelf = (admin) => String(currentUser?.id) === String(admin.id);

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            View, create, edit, and remove platform administrators.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#16730F] focus:ring-1 focus:ring-[#16730F] transition"
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>
          <button
            onClick={openCreateModal}
            disabled={!isSuperAdmin}
            className="flex items-center justify-center gap-2 bg-[#16730F] text-white px-4 py-2 rounded-xl hover:bg-[#125c0c] transition-colors whitespace-nowrap font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              isSuperAdmin
                ? "Add a new admin"
                : "Only super admins can create admins"
            }
          >
            <Plus size={18} />
            Add Admin
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Admin User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
                {isSuperAdmin && (
                  <th className="px-6 py-4 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={isSuperAdmin ? 5 : 4}
                    className="px-6 py-12 text-center"
                  >
                    <div className="animate-spin inline-block rounded-full h-8 w-8 border-b-2 border-[#16730F]" />
                    <p className="text-gray-500 mt-2">Loading admins...</p>
                  </td>
                </tr>
              ) : filteredAdmins.length > 0 ? (
                filteredAdmins.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold shrink-0">
                          {(
                            user.username?.[0] ||
                            user.email?.[0] ||
                            "A"
                          ).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.username || "—"}
                            {user.is_admin && (
                              <Shield
                                className="inline ml-2 text-blue-500"
                                size={14}
                                title="Admin"
                              />
                            )}
                          </p>
                          {user.email && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                              <Mail size={12} />
                              <span>{user.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-50 text-blue-700">
                        {getAdminRoleLabel(user.admin_role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {user.isActive ? (
                          <>
                            <CheckCircle className="text-green-500" size={16} />
                            <span className="text-sm text-gray-700">
                              Active
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="text-red-500" size={16} />
                            <span className="text-sm text-gray-700">
                              Inactive
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(
                        user.createdAt ?? user.created_at,
                      ).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    {isSuperAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            className="p-2 text-gray-500 hover:text-[#16730F] hover:bg-[#16730F]/10 rounded-lg transition-colors"
                            title="Edit admin"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setAdminToDelete(user)}
                            disabled={isSelf(user)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            title={
                              isSelf(user)
                                ? "You cannot delete your own account"
                                : "Delete admin"
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={isSuperAdmin ? 5 : 4}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No admins found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!isSuperAdmin && !loading && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          Only super admins can manage admin accounts.
        </p>
      )}

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Shield className="text-[#16730F]" size={24} />
                {modalMode === "create" ? "Add New Admin" : "Edit Admin"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto nfl-scroll scroll-smooth flex-1">
              <form
                id="adminForm"
                onSubmit={
                  modalMode === "create" ? handleCreateAdmin : handleUpdateAdmin
                }
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    required
                    minLength={3}
                    maxLength={50}
                    pattern="[a-zA-Z0-9_.-]{3,50}"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16730F]/20 focus:border-[#16730F]"
                    placeholder="e.g. johndoe"
                    autoComplete="username"
                  />
                  <p className="text-xs text-gray-500">
                    3-50 characters. Letters, numbers, &quot;.&quot;,
                    &quot;_&quot; or &quot;-&quot; only.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    {modalMode === "create" ? "Password" : "New Password"}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required={modalMode === "create"}
                      minLength={modalMode === "create" ? 8 : undefined}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16730F]/20 focus:border-[#16730F]"
                      placeholder={
                        modalMode === "create"
                          ? "Min. 8 characters"
                          : "Leave blank to keep current password"
                      }
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <RecruiterSelect
                    label="Role"
                    name="admin_role"
                    value={formData.admin_role}
                    onChange={handleInputChange}
                    options={ROLE_OPTIONS}
                    placeholder="Select Role"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    Super Admin: all pages. Admin: analytics &amp; ops pages.
                    Account: Revenue only.
                  </p>
                </div>

                {modalMode === "edit" && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#16730F] rounded border-gray-300 focus:ring-[#16730F]"
                    />
                    <span className="text-sm text-gray-700">
                      Account is active
                    </span>
                  </label>
                )}
              </form>
            </div>

            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="adminForm"
                disabled={submitting}
                className="px-4 py-2 bg-[#16730F] text-white font-medium rounded-lg hover:bg-[#125c0c] transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    {modalMode === "create" ? "Creating..." : "Saving..."}
                  </>
                ) : modalMode === "create" ? (
                  "Create Admin"
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {adminToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800">Delete Admin</h2>
            <p className="text-gray-600 mt-2">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{adminToDelete.username}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setAdminToDelete(null)}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAdmin}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70"
              >
                {submitting ? "Deleting..." : "Delete Admin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminList;
