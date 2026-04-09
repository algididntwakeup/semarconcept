// platform/frontend-mui/src/pages/dashboard/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { Users, HardDrive, Activity, Bell } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Get time of day for greeting
  const hours = currentDate.getHours();
  let greeting = 'Good morning';
  if (hours >= 12 && hours < 18) {
    greeting = 'Good afternoon';
  } else if (hours >= 18) {
    greeting = 'Good evening';
  }

  // Mock data for dashboard
  const stats = {
    totalUsers: 1254,
    userGrowth: 5.2,
    storageUsed: '45.2 GB',
    storageChange: -2.1,
    systemLoad: '24%',
    notifications: 7,
  };

  return (
    <div className="flex-1 font-sans">
      {/* Header Section */}
      <div
        className="p-6 md:p-8 mb-8 rounded-3xl text-white shadow-lg relative overflow-hidden"
        style={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-20 -mb-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-1 tracking-tight">{greeting}, adi</h1>
            <p className="text-white/80 font-medium">{formattedDate}</p>
          </div>
          <button className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 rounded-xl font-bold text-sm tracking-wide uppercase transition-colors shadow-sm">
            View Analytics
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Dashboard Overview</h2>
        <div className="h-px bg-slate-200 w-full mb-2"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">
                Total Users
              </p>
              <h3 className="text-3xl font-extrabold text-slate-800 mb-2">{stats.totalUsers}</h3>
              <div
                className={`flex items-center text-sm font-bold ${stats.userGrowth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}
              >
                <span className="mr-1">{stats.userGrowth >= 0 ? '↑' : '↓'}</span>
                <span>
                  {Math.abs(stats.userGrowth)}%{' '}
                  <span className="text-slate-500 font-medium ml-1">from last period</span>
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="text-blue-500 w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Storage Used */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">
                Storage Used
              </p>
              <h3 className="text-3xl font-extrabold text-slate-800 mb-2">{stats.storageUsed}</h3>
              <div
                className={`flex items-center text-sm font-bold ${stats.storageChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}
              >
                <span className="mr-1">{stats.storageChange >= 0 ? '↑' : '↓'}</span>
                <span>
                  {Math.abs(stats.storageChange)}%{' '}
                  <span className="text-slate-500 font-medium ml-1">from last period</span>
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
              <HardDrive className="text-indigo-500 w-6 h-6" />
            </div>
          </div>
        </div>

        {/* System Load */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">
                System Load
              </p>
              <h3 className="text-3xl font-extrabold text-slate-800 mb-2">{stats.systemLoad}</h3>
              <div className="flex items-center text-sm text-slate-500 font-medium">
                Stable operation
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
              <Activity className="text-violet-500 w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">
                Notifications
              </p>
              <h3 className="text-3xl font-extrabold text-slate-800 mb-2">{stats.notifications}</h3>
              <div className="flex items-center text-sm text-slate-500 font-medium">
                Unread alerts
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Bell className="text-amber-500 w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity and System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="mb-4 pb-4 border-b border-slate-100 last:mb-0 last:pb-0 last:border-0">
              <p className="font-semibold text-slate-800 mb-1">Created new user</p>
              <p className="text-sm text-slate-500 font-medium">Admin • 10 minutes ago</p>
            </div>
            <div className="mb-4 pb-4 border-b border-slate-100 last:mb-0 last:pb-0 last:border-0">
              <p className="font-semibold text-slate-800 mb-1">Updated system settings</p>
              <p className="text-sm text-slate-500 font-medium">System • 1 hour ago</p>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-800">System Status</h3>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
              <p className="font-semibold text-slate-800">API Server</p>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                Healthy
              </span>
            </div>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
              <p className="font-semibold text-slate-800">Database</p>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                Healthy
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-800">Storage</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">High usage</p>
              </div>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                Warning
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
