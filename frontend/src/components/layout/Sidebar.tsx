// platform/frontend-mui/src/components/layout/Sidebar.tsx
import React, { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, ChevronDown } from 'lucide-react';

import { useNavigation } from '../../layouts/MainLayout';
import { AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';

const Sidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    sidebarOpen, 
    mobileOpen, 
    setMobileOpen,
    openCollapseMenus,
    toggleCollapseMenu,
    activeHorizontalTab,
    topLevelMenuItems,
  } = useNavigation();

  const activeModule = topLevelMenuItems[activeHorizontalTab];
  const sidebarItems = useMemo(() => activeModule?.children || [], [activeModule]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isItemActive = useMemo(() => {
    const currentPath = location.pathname;
    return (item: any): boolean => {
      if (item.url && currentPath === item.url) return true;
      if (item.url && currentPath.startsWith(item.url + '/')) return true;
      return false;
    };
  }, [location.pathname]);

  const handleItemClick = (item: any) => {
    if (item.url) {
      navigate(item.url);
      setMobileOpen(false);
    }
  };

  const renderMenuItem = (item: any, level: number = 0) => {
    const isActive = isItemActive(item);
    const isOpen = openCollapseMenus[item.id];
    
    if (item.type === 'collapse') {
      return (
        <React.Fragment key={item.id}>
          <li className="px-3">
            <button
              onClick={() => toggleCollapseMenu(item.id)}
              className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition-all duration-300 group ${isActive ? 'bg-primary-500/10 text-primary-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <div className={`flex items-center ${!sidebarOpen ? 'justify-center w-full' : ''}`}>
                {item.icon && (
                  <span className={`${sidebarOpen ? 'mr-3' : ''} p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary-500 text-white shadow-glow-primary scale-110' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-primary-500'}`}>
                    <item.icon className="w-4 h-4" />
                  </span>
                )}
                {sidebarOpen && (
                  <span className="text-xs font-bold tracking-tight uppercase truncate">{item.title}</span>
                )}
              </div>
              {sidebarOpen && (
                <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
              )}
            </button>
          </li>
          
          {sidebarOpen && item.children && (
            <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-96 opacity-100 py-1' : 'max-h-0 opacity-0'}`}>
              <ul className="space-y-1 ml-4 border-l border-slate-100">
                {item.children.map((child: any) => renderMenuItem(child, level + 1))}
              </ul>
            </div>
          )}
        </React.Fragment>
      );
    }
    
    if (item.type === 'item') {
      return (
        <li key={item.id} className="px-3">
          <button
            onClick={() => handleItemClick(item)}
            className={`w-full flex items-center py-2.5 px-3 rounded-xl transition-all duration-300 group ${isActive ? 'bg-primary-500 text-white shadow-premium shadow-primary-500/30' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'}`}
          >
            <div className={`flex items-center ${!sidebarOpen ? 'justify-center w-full' : ''}`}>
              {item.icon && (
                <span className={`${sidebarOpen ? 'mr-3' : ''} flex-shrink-0 transition-all duration-300 ${isActive ? 'text-white scale-110' : 'text-slate-400 group-hover:text-primary-500'}`}>
                  <item.icon className="w-5 h-5" />
                </span>
              )}
              {sidebarOpen && (
                <span className="text-sm font-bold leading-tight py-1">{item.title}</span>
              )}
            </div>
            {isActive && sidebarOpen && (
              <div className="ml-auto flex-shrink-0 w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
            )}
          </button>
        </li>
      );
    }
    return null;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-6">
      <div className={`px-6 flex items-center mb-8 ${sidebarOpen ? 'justify-start gap-3' : 'justify-center'}`}>
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center p-1 shadow-sm">
            <img src="/logo.png" alt="SEMAR Logo" className="w-full h-full object-contain" />
          </div>
        </div>
        {sidebarOpen && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="font-black text-lg text-slate-800 tracking-tighter leading-none">SEMAR</span>
            <span className="text-[8px] font-bold text-primary-500 uppercase tracking-widest mt-0.5 leading-tight truncate">Reliability Meets<br/>Intelligence</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-6">
        <div>
          {sidebarOpen && (
            <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Main Menu</p>
          )}
          <ul className="space-y-1.5">
            {sidebarItems.length > 0 ? (
              sidebarItems.map((item) => renderMenuItem(item))
            ) : (
              <div className="px-6 py-4 rounded-2xl bg-slate-50/50 mx-4 text-center border border-dashed border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">No modules</span>
              </div>
            )}
          </ul>
        </div>
      </div>

      <div className="px-4 mt-auto">
        <div className={`p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl ${!sidebarOpen ? 'px-0 flex justify-center' : ''}`}>
          <button
            onClick={handleLogout}
            className={`flex items-center group transition-all ${sidebarOpen ? 'w-full' : ''}`}
          >
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-red-500 transition-colors">
              <LogOut className="w-4 h-4 text-white" />
            </div>
            {sidebarOpen && (
              <div className="ml-3 text-left overflow-hidden">
                <p className="text-xs font-bold leading-none truncate">Logout</p>
                <p className="text-[9px] text-slate-400 font-medium truncate">Clear session</p>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside 
        className={`hidden lg:flex flex-col fixed inset-y-4 left-4 z-40 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${sidebarOpen ? 'w-[260px]' : 'w-[80px]'}`}
      >
        <div className="glass h-full rounded-3xl shadow-premium border-white/40 overflow-hidden">
          <SidebarContent />
        </div>
      </aside>

      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40 lg:hidden transition-all duration-500"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-4 left-4 z-50 w-[280px] transition-all duration-500 ease-in-out lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-[120%]'}`}
      >
        <div className="glass h-full rounded-3xl shadow-2xl border-white/40 overflow-hidden">
          <SidebarContent />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;