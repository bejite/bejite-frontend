import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import { Search, Mail, Shield, CheckCircle, XCircle, MoreVertical, X } from 'lucide-react';
import { RecruiterSelect } from '../../components/recruiter/recruiterOnboardingUi';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter states
  const [roleFilter, setRoleFilter] = useState('all'); // all | jobseeker | recruiter | unassigned
  const [dateFilter, setDateFilter] = useState('all'); // all | today | week | month | year
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Server-side pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const filterMenuRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Build query params
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
        });
        
        // Add search param if present
        if (searchTerm) {
          params.append('search', searchTerm);
        }
        
        // Add role filter if not 'all'
        if (roleFilter !== 'all') {
          params.append('role', roleFilter);
        }
        
        const response = await axiosInstance.get(`/api/admin/data/users?${params.toString()}`);
        setUsers(response.data.users);
        
        // Update pagination from server response
        if (response.data.pagination) {
          setTotalUsers(response.data.pagination.total);
          setTotalPages(response.data.pagination.pages);
        }
      } catch (error) {
        console.error('Error fetching users', error);
        toast.error('Failed to load users data');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, itemsPerPage, searchTerm, roleFilter]);

  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };

    if (showFilterMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterMenu]);

// Reset to first page whenever filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, dateFilter]);

  // Calculate display range for "Showing X-Y of Z users"
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalUsers);

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            <p className="text-gray-500 text-sm mt-1">View and manage all registered users on the platform.</p>
          </div>
          
           <div className="flex items-center gap-3 w-full sm:w-auto">
             <div className="relative w-full sm:w-72">
               <input 
                 type="text" 
                 placeholder="Search users..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#16730F] focus:ring-1 focus:ring-[#16730F] transition"
               />
               <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
             </div>

             {/* Filter Menu Trigger (Ellipsis) */}
             <div className="relative">
               <button
                 onClick={() => setShowFilterMenu(!showFilterMenu)}
                 className={`p-2.5 border rounded-xl hover:bg-gray-50 transition flex items-center justify-center ${
                   (roleFilter !== 'all' || dateFilter !== 'all') 
                     ? 'border-[#16730F] bg-[#16730F]/5' 
                     : 'border-gray-200'
                 }`}
                 title="Filter users"
               >
                 <MoreVertical 
                   size={18} 
                   className={(roleFilter !== 'all' || dateFilter !== 'all') ? 'text-[#16730F]' : 'text-gray-600'} 
                 />
               </button>

               {/* Filter Dropdown */}
               {showFilterMenu && (
                 <div ref={filterMenuRef} className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-4">
                   <div className="flex justify-between items-center mb-4">
                     <span className="font-semibold text-gray-800">Filters</span>
                     <button 
                       onClick={() => setShowFilterMenu(false)}
                       className="text-gray-400 hover:text-gray-600"
                     >
                       <X size={16} />
                     </button>
                   </div>

                   {/* Role Filter */}
                   <div className="mb-4">
                     <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Role</p>
                     <div className="space-y-1">
                       {[
                         { value: 'all', label: 'All Users' },
                         { value: 'jobseeker', label: 'Jobseekers' },
                         { value: 'recruiter', label: 'Recruiters' },
                         { value: 'unassigned', label: 'Unassigned' },
                       ].map((option) => (
                         <button
                           key={option.value}
                           onClick={() => setRoleFilter(option.value)}
                           className={`w-full text-left px-3 py-2 text-sm rounded-lg transition ${
                             roleFilter === option.value 
                               ? 'bg-[#16730F] text-white' 
                               : 'hover:bg-gray-100 text-gray-700'
                           }`}
                         >
                           {option.label}
                         </button>
                       ))}
                     </div>
                   </div>

                   {/* Joined Date Filter */}
                   <div>
                     <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Joined Date</p>
                     <div className="space-y-1">
                       {[
                         { value: 'all', label: 'All Time' },
                         { value: 'today', label: 'Today' },
                         { value: 'week', label: 'This Week' },
                         { value: 'month', label: 'This Month' },
                         { value: 'year', label: 'This Year' },
                       ].map((option) => (
                         <button
                           key={option.value}
                           onClick={() => setDateFilter(option.value)}
                           className={`w-full text-left px-3 py-2 text-sm rounded-lg transition ${
                             dateFilter === option.value 
                               ? 'bg-[#16730F] text-white' 
                               : 'hover:bg-gray-100 text-gray-700'
                           }`}
                         >
                           {option.label}
                         </button>
                       ))}
                     </div>
                   </div>

                   {/* Clear Filters */}
                   <div className="mt-4 pt-4 border-t border-gray-100">
                     <button
                       onClick={() => {
                         setRoleFilter('all');
                         setDateFilter('all');
                         setSearchTerm('');
                       }}
                       className="w-full text-sm text-gray-600 hover:text-red-600 py-2 transition"
                     >
                       Clear all filters
                     </button>
                   </div>
                 </div>
               )}
             </div>
           </div>
        </div>

        {/* Active Filters Bar */}
        {(roleFilter !== 'all' || dateFilter !== 'all' || searchTerm) && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-gray-500">Active filters:</span>
            
            {searchTerm && (
              <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="hover:text-red-500">
                  <X size={12} />
                </button>
              </span>
            )}
            
            {roleFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 bg-[#16730F]/10 text-[#16730F] px-3 py-1 rounded-full text-xs font-medium">
                Role: {roleFilter === 'unassigned' ? 'Unassigned' : roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}
                <button onClick={() => setRoleFilter('all')} className="hover:text-red-500">
                  <X size={12} />
                </button>
              </span>
            )}
            
            {dateFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                Joined: {dateFilter === 'week' ? 'This Week' : dateFilter.charAt(0).toUpperCase() + dateFilter.slice(1)}
                <button onClick={() => setDateFilter('all')} className="hover:text-red-500">
                  <X size={12} />
                </button>
              </span>
            )}

            <button 
              onClick={() => {
                setRoleFilter('all');
                setDateFilter('all');
                setSearchTerm('');
              }}
              className="ml-2 text-xs text-gray-500 hover:text-red-600 underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="animate-spin inline-block rounded-full h-8 w-8 border-b-2 border-[#16730F]"></div>
                      <p className="text-gray-500 mt-2">Loading users...</p>
                    </td>
                  </tr>
) : users.length > 0 ? (
                   users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-[#16730F]/10 rounded-full flex items-center justify-center text-[#16730F] font-bold shrink-0">
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${user.role === 'recruiter' ? 'bg-purple-50 text-purple-700' : 
                            user.role === 'jobseeker' ? 'bg-blue-50 text-blue-700' : 
                            'bg-gray-100 text-gray-700'}`}>
                          {user.role || 'Unassigned'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {(user.verified || user.isEmailVerified) ? (
                            <><CheckCircle className="text-green-500" size={16} /><span className="text-sm text-gray-700">Verified</span></>
                          ) : (
                            <><XCircle className="text-amber-500" size={16} /><span className="text-sm text-gray-700">Pending</span></>
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
                       {searchTerm || roleFilter !== 'all' || dateFilter !== 'all' 
                         ? 'No users match your current filters.' 
                         : 'No users found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
           </div>

           {/* Pagination */}
{!loading && users.length > 0 && (
             <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gray-50 border-t border-gray-100 text-sm">
               {/* Items per page + Showing info */}
               <div className="flex items-center gap-4 text-gray-600">
                 <div className="flex items-center gap-2">
                    <RecruiterSelect
                      name="itemsPerPage"
                      value={String(itemsPerPage)}
                      onChange={(e) => {
                        const newSize = Number(e.target.value);
                        setItemsPerPage(newSize);
                        setCurrentPage(1);
                      }}
                      options={[
                        { value: "5", label: "5" },
                        { value: "10", label: "10" },
                        { value: "20", label: "20" },
                        { value: "50", label: "50" },
                      ]}
                      placeholder="Rows"
                    />
                 </div>

                 <span className="text-gray-400">|</span>

<span>
                   Showing <span className="font-medium text-gray-800">{startIndex + 1}</span>–<span className="font-medium text-gray-800">{endIndex}</span> of <span className="font-medium text-gray-800">{totalUsers}</span> users
                 </span>
               </div>

               {/* Page navigation */}
               <div className="flex items-center gap-1">
                 <button
                   onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                   disabled={currentPage === 1}
                   className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                 >
                   Previous
                 </button>

                 {/* Page numbers */}
                 <div className="flex items-center gap-1 mx-1">
                   {Array.from({ length: totalPages }, (_, i) => i + 1)
                     .filter(page => 
                       page === 1 || 
                       page === totalPages || 
                       Math.abs(page - currentPage) <= 1
                     )
                     .map((page, index, arr) => {
                       const showEllipsisBefore = index > 0 && arr[index - 1] !== page - 1;
                       const showEllipsisAfter = index < arr.length - 1 && arr[index + 1] !== page + 1;

                       return (
                         <React.Fragment key={page}>
                           {showEllipsisBefore && <span className="px-2 text-gray-400">...</span>}
                           <button
                             onClick={() => setCurrentPage(page)}
                             className={`min-w-[32px] px-3 py-1.5 text-sm rounded-lg transition ${
                               currentPage === page
                                 ? 'bg-[#16730F] text-white font-medium'
                                 : 'border border-gray-300 hover:bg-gray-100'
                             }`}
                           >
                             {page}
                           </button>
                           {showEllipsisAfter && <span className="px-2 text-gray-400">...</span>}
                         </React.Fragment>
                       );
                     })}
                 </div>

                 <button
                   onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                   disabled={currentPage === totalPages}
                   className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                 >
                   Next
                 </button>
               </div>
             </div>
           )}
         </div>

       </div>
   );
 };

export default AdminUsers;
