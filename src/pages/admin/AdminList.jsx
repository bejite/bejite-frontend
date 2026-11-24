import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import Loader from '../../components/ui/Loader';
import { toast } from 'react-toastify';
import { Search, Mail, Shield, CheckCircle, XCircle, Plus, X } from 'lucide-react';

const AdminList = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/admin/data/admins');
      setAdmins(response.data.admins);
    } catch (error) {
      console.error('Error fetching admins', error);
      toast.error('Failed to load admins data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const response = await axiosInstance.post('/api/admin/data/admins', formData);
      toast.success(response.data.message || 'Admin added successfully');
      
      // Reset form and close modal
      setFormData({ firstName: '', lastName: '', email: '', password: '' });
      setIsModalOpen(false);
      
      // Refresh list
      fetchAdmins();
    } catch (error) {
      console.error('Error adding admin', error);
      toast.error(error.response?.data?.error || 'Failed to add admin');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAdmins = admins.filter(admin => 
    (admin.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
    (admin.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
    (admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
  );

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6 relative">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Management</h1>
            <p className="text-gray-500 text-sm mt-1">View all platform administrators and add new ones.</p>
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
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-[#16730F] text-white px-4 py-2 rounded-xl hover:bg-[#125c0c] transition-colors whitespace-nowrap font-medium"
            >
              <Plus size={18} />
              Add Admin
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Admin User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <Loader fullscreen={false} size="sm" description="Loading admins..." />
                    </td>
                  </tr>
                ) : filteredAdmins.length > 0 ? (
                  filteredAdmins.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold shrink-0">
                            {user.firstName?.[0] || user.email?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                              {user.is_admin && <Shield className="inline ml-2 text-blue-500" size={14} title="Admin" />}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                              <Mail size={12} />
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-50 text-blue-700">
                          {user.role || 'Admin'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {user.isActive ? (
                            <><CheckCircle className="text-green-500" size={16} /><span className="text-sm text-gray-700">Active</span></>
                          ) : (
                            <><XCircle className="text-red-500" size={16} /><span className="text-sm text-gray-700">Inactive</span></>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      No admins found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      {/* Add Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Shield className="text-[#16730F]" size={24} />
                Add New Admin
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto nfl-scroll scroll-smooth flex-1">
              <form id="addAdminForm" onSubmit={handleAddAdmin} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input 
                      type="text" 
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16730F]/20 focus:border-[#16730F]"
                      placeholder="e.g. John"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input 
                      type="text" 
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16730F]/20 focus:border-[#16730F]"
                      placeholder="e.g. Doe"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16730F]/20 focus:border-[#16730F]"
                    placeholder="john@bejite.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input 
                    type="password" 
                    name="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16730F]/20 focus:border-[#16730F]"
                    placeholder="Min. 8 characters"
                  />
                </div>
              </form>
            </div>

            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="addAdminForm"
                disabled={submitting}
                className="px-4 py-2 bg-[#16730F] text-white font-medium rounded-lg hover:bg-[#125c0c] transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                {submitting ? (
                  <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div> Creating...</>
                ) : (
                  'Create Admin'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminList;
