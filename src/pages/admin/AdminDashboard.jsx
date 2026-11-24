import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import Loader from '../../components/ui/Loader';
import { toast } from 'react-toastify';
import { 
  Users, Briefcase, FileText, Activity, 
  TrendingUp, BarChart2, PieChart as PieChartIcon 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [userMetrics, setUserMetrics] = useState(null);
  const [jobMetrics, setJobMetrics] = useState(null);
  const [advancedUserMetrics, setAdvancedUserMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Canonical industry list (matches jobseekerSignup/JobType.jsx)
  const industries = [
    "Information Technology", "Healthcare", "Finance", "Education", "Construction",
    "Manufacturing", "Retail", "Transportation and Logistics", "Hospitality", "Energy",
    "Telecommunications", "Real Estate", "Legal", "Marketing and Advertising", "Media and Entertainment",
    "Agriculture", "Aerospace", "Biotechnology", "Automotive", "Nonprofit",
    "Government", "Insurance", "Pharmaceuticals", "Environmental Services", "Engineering",
    "Consulting", "Human Resources", "Public Relations", "Utilities", "Mining", "Not Available"
  ];

  // Resolve numeric IDs (e.g. "8") to real names + normalize counts
  const topSectors = (userMetrics?.topSectors || [])
    .map((item) => {
      const raw = item.industry;
      const idx = parseInt(raw, 10);
      const name = (idx >= 0 && idx < industries.length) ? industries[idx] : raw;
      return {
        industry: name,
        count: Number(item.count) || 0,
      };
    })
    .filter((item) => item.industry && item.industry !== "Not Available")
    .slice(0, 10);

  // Normalized top applied job titles (top 10 most common jobs jobseekers actually apply for)
  const topJobTitles = (jobMetrics?.topJobTitles || [])
    .map((item) => ({
      title: item.title,
      count: Number(item.count) || 0,
    }))
    .slice(0, 10);

const COLORS = ['#16730F', '#2563eb', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [overviewRes, userRes, jobRes, advancedUserRes] = await Promise.all([
          axiosInstance.get('/api/admin/metrics/overview'),
          axiosInstance.get('/api/admin/metrics/users'),
          axiosInstance.get('/api/admin/metrics/jobs'),
          axiosInstance.get('/api/admin/metrics/users-advanced')
        ]);
        
        setOverview(overviewRes.data);
        setUserMetrics(userRes.data);
        setJobMetrics(jobRes.data);
        setAdvancedUserMetrics(advancedUserRes.data);
      } catch (error) {
        console.error('Error fetching metrics', error);
        toast.error('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return <Loader fullscreen={false} description="Loading dashboard metrics..." />;
  }

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Total Users</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={20} /></div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-800">{overview?.totalUsers.toLocaleString()}</h3>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <TrendingUp size={14} className="text-green-500" />
                <span className="text-green-500 font-medium">{overview?.weeklySignups}</span> this week
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Active Jobs</span>
              <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Briefcase size={20} /></div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-800">{overview?.activeJobs.toLocaleString()}</h3>
              <p className="text-sm text-gray-500 mt-1">Currently open listings</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Total Applications</span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><FileText size={20} /></div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-800">{overview?.totalApplications.toLocaleString()}</h3>
              <p className="text-sm text-gray-500 mt-1">Across all jobs</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Daily Active Users (DAU)</span>
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Activity size={20} /></div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-800">{advancedUserMetrics?.latest?.dau?.toLocaleString() || 0}</h3>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <span className="font-medium text-gray-700">{advancedUserMetrics?.latest?.mau?.toLocaleString() || 0}</span> MAU
              </p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* User Growth Line Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <BarChart2 className="text-gray-400" size={20} />
              <h3 className="text-lg font-bold text-gray-800">User Growth (Last 30 Days)</h3>
            </div>
            <div className="h-72 w-full">
              {userMetrics?.signupsTrend?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userMetrics.signupsTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(tick) => new Date(tick).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                      axisLine={false}
                      tickLine={false}
                      tick={{fill: '#9ca3af', fontSize: 12}}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{fill: '#9ca3af', fontSize: 12}}
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      name="New Users"
                      stroke="#16730F" 
                      strokeWidth={3} 
                      dot={{r: 4, strokeWidth: 2}}
                      activeDot={{r: 6, strokeWidth: 0}}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">No data available</div>
              )}
            </div>
          </div>

{/* User Roles Bar Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <BarChart2 className="text-gray-400" size={20} />
              <h3 className="text-lg font-bold text-gray-800">User Roles</h3>
            </div>
            <div className="h-64 w-full">
              {userMetrics?.roles?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userMetrics.roles}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="role" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#4b5563', fontSize: 12}}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{fill: '#9ca3af', fontSize: 12}}
                      dx={-10}
                    />
                    <Tooltip 
                      formatter={(value) => [value, 'Users']}
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="count" name="Users" radius={[4, 4, 0, 0]} barSize={60}>
                      {userMetrics.roles.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
               ) : (
                 <div className="h-full flex items-center justify-center text-gray-400">No data available</div>
               )}
             </div>

             {/* Explicit totals for Jobseekers and Recruiters from /api/admin/metrics/users */}
            
           </div>
         </div>

        {/* Bottom Section: Top Sectors & Jobs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
           {/* Top Sectors */}
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
             <h3 className="text-lg font-bold text-gray-800 mb-6">Top Candidate Sectors (by Jobseekers)</h3>
             <div className="h-80 w-full">
               {topSectors.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={topSectors} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                     <XAxis type="number" hide />
                     <YAxis 
                       type="category" 
                       dataKey="industry" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fill: '#4b5563', fontSize: 12}}
                     />
                     <Tooltip 
                       cursor={{fill: 'transparent'}}
                       contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                     />
                     <Bar dataKey="count" name="Candidates" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={18}>
                       {topSectors.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="h-full flex items-center justify-center text-gray-400">No data available</div>
               )}
             </div>
             <p className="text-xs text-gray-500 mt-2 text-center">Top 10 most sought-after sectors by jobseekers</p>
           </div>

           {/* Top Job Titles Applied */}
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
             <h3 className="text-lg font-bold text-gray-800 mb-6">Top Job Titles Applied</h3>
             <div className="h-64 w-full">
               {topJobTitles.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={topJobTitles}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                     <XAxis 
                       dataKey="title" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fill: '#4b5563', fontSize: 12}}
                       dy={10}
                     />
                     <YAxis hide />
                     <Tooltip 
                       cursor={{fill: '#f3f4f6'}}
                       contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                     />
                     <Bar dataKey="count" name="Applications" fill="#16730F" radius={[4, 4, 0, 0]} barSize={40} />
                   </BarChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="h-full flex items-center justify-center text-gray-400">No data available</div>
               )}
             </div>
             <p className="text-xs text-gray-500 mt-2 text-center">Top 10 most common jobs applied for by jobseekers</p>
           </div>

        </div>
      </div>
  );
};

export default AdminDashboard;
