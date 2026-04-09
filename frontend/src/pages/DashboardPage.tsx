import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import WidgetGrid from '../components/dashboard/WidgetGrid';
import { RootState } from '../store';
import { Loader2 } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: RootState) => state.auth.user);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => {
      clearTimeout(timer);
      clearInterval(timeInterval);
    };
  }, []);

  // Format greeting based on time of day
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Format date for display
  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex-1 font-sans">
      <div
        className="p-6 md:p-8 mb-8 rounded-3xl text-white shadow-lg relative overflow-hidden"
        style={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-20 -mb-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-1 tracking-tight">
              {getGreeting()}, {user?.first_name || 'User'}
            </h1>
            <p className="text-white/80 font-medium">{formattedDate}</p>
          </div>
          <button className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 rounded-xl font-bold text-sm tracking-wide uppercase transition-colors shadow-sm cursor-pointer">
            View Analytics
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Dashboard Overview</h2>
        <div className="h-px bg-slate-200 w-full mb-2"></div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <WidgetGrid />
      )}
    </div>
  );
};

export default DashboardPage;
