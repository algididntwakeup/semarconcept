// platform/frontend-mui/src/layouts/MainLayout.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Menu as MenuIcon, 
  Bell, 
  LogOut, 
  User as UserIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import Sidebar from '../components/layout/Sidebar';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import GlobalSearchBar from '../components/layout/GlobalSearchBar';
import { loadMenuItems, convertMenuItemToNavItem } from '../config/menu-loader';
import { MenusAPI } from '../lib/api/endpoints';
import { checkRouteAccess } from '../config/route-manifest';
import { NavItem } from '../types/navigation';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';

// Kontrak navigasi bersama dipindah ke config/navigation-context.ts agar dapat
// dipakai di luar pohon provider (module landing page) tanpa circular import.
// Re-export lama dipertahankan agar komponen lain tidak berubah.
import { NavigationContext, NavigationContextType } from '../config/navigation-context';
export type { NavigationContextType } from '../config/navigation-context';
export { NavigationContext, useNavigation } from '../config/navigation-context';

// ---------------------------------------------------------------------------
// Custom hook for click outside
// ---------------------------------------------------------------------------
function useOnClickOutside(ref: React.RefObject<any>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const location = useLocation();

  const isMobile = window.innerWidth < 768;
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHorizontalTab, setActiveHorizontalTab] = useState(0);
  const [openCollapseMenus, setOpenCollapseMenus] = useState<Record<string, boolean>>({});
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const headerMenuRef = useRef<HTMLDivElement>(null);
  const headerTabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useOnClickOutside(userMenuRef, () => setIsUserMenuOpen(false));
  useOnClickOutside(notificationsRef, () => setIsNotificationsOpen(false));

  const [dynamicMenuItems, setDynamicMenuItems] = useState<NavItem[]>([]);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await MenusAPI.getUserMenuTree();
        if (response.data && Array.isArray(response.data.data)) {
          const items = response.data.data
            .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
            .map(convertMenuItemToNavItem);
          setDynamicMenuItems(items);
        }
      } catch (err) {
        console.error('Failed to fetch dynamic menus:', err);
      }
    };
    fetchMenus();

    const handleReload = () => {
      console.log('🔄 Reloading menus via event...');
      fetchMenus();
    };

    window.addEventListener('reksolindo:reload-menus', handleReload);
    return () => window.removeEventListener('reksolindo:reload-menus', handleReload);
  }, []);

  const menuItems = useMemo(() => {
    if (dynamicMenuItems.length > 0) return dynamicMenuItems;
    return loadMenuItems();
  }, [dynamicMenuItems]);
  const topLevelMenuItems = useMemo(
    () =>
      menuItems
        .filter((item) => item.type !== 'group' && (item.type === 'item' || item.type === 'collapse')),
    [menuItems]
  );

  useEffect(() => {
    const activeItem = topLevelMenuItems[activeHorizontalTab];
    const container = headerMenuRef.current;
    const activeTab = activeItem ? headerTabRefs.current.get(activeItem.id) : undefined;

    if (!container || !activeTab) return;

    const centeredLeft = activeTab.offsetLeft - (container.clientWidth - activeTab.offsetWidth) / 2;
    container.scrollTo({
      left: Math.max(0, centeredLeft),
      behavior: 'smooth',
    });
  }, [activeHorizontalTab, topLevelMenuItems]);

  const notifications = useMemo(
    () => [
      { id: 1, title: 'System Update', message: 'New features available', time: '5 min ago', unread: true },
      { id: 2, title: 'Data Backup', message: 'Backup completed successfully', time: '1 hour ago', unread: true },
    ],
    []
  );
  const unreadCount = useMemo(() => notifications.filter((n) => n.unread).length, [notifications]);

  const findActiveTopLevelTab = useCallback(
    (currentPath: string): number => {
      const checkNode = (node: NavItem): boolean => {
        const normalizedItemUrl = node.url?.replace(/\/$/, '') || '';
        const normalizedTargetUrl = currentPath.replace(/\/$/, '') || '';
        if (normalizedItemUrl && (normalizedItemUrl === normalizedTargetUrl || normalizedTargetUrl.startsWith(normalizedItemUrl + '/'))) return true;
        if (node.children) {
          for (const child of node.children) {
            if (checkNode(child)) return true;
          }
        }
        return false;
      };

      for (let i = 0; i < topLevelMenuItems.length; i++) {
        if (checkNode(topLevelMenuItems[i])) return i;
      }
      return 0; // default to first
    },
    [topLevelMenuItems]
  );

  useEffect(() => {
    const currentPath = location.pathname;

    const isSuperuser = user?.is_superuser || (user as any)?.isSuperuser;

    // --- Access Guard Logic (Delegated to route-manifest.ts) ---
    const accessCheck = checkRouteAccess(menuItems, currentPath, isSuperuser);
    if (accessCheck.blocked) {
      console.warn(`🚫 Access blocked to inactive or unauthorized path: ${currentPath} (reason: ${accessCheck.reason})`);
      navigate('/access-inactive', { replace: true });
      return;
    }
    // --- End Access Guard ---

    const tabIdx = findActiveTopLevelTab(currentPath);
    setActiveHorizontalTab(tabIdx);

    // 🔥 Auto-expand parent collapse menus
    const findParentChain = (items: NavItem[], targetUrl: string, chain: string[] = []): string[] | null => {
      for (const item of items) {
        // Normalize URLs for comparison (strip trailing slashes)
        const normalizedItemUrl = item.url?.replace(/\/$/, '') || '';
        const normalizedTargetUrl = targetUrl.replace(/\/$/, '') || '';
        
        if (normalizedItemUrl && normalizedItemUrl === normalizedTargetUrl) return chain;
        
        if (item.children) {
          const result = findParentChain(item.children, targetUrl, [...chain, item.id]);
          if (result) return result;
        }
      }
      return null;
    };

    const parentIds = findParentChain(menuItems, currentPath);
    const next: Record<string, boolean> = {};
    if (parentIds) {
      parentIds.forEach((id) => {
        next[id] = true;
      });
    }
    // Only update if we found a chain, to avoid closing open menus unnecessarily
    if (Object.keys(next).length > 0) {
      setOpenCollapseMenus(next);
    }

    // 🔥 Update Document Title
    let activeTitle = '';
    const findTitle = (items: NavItem[]): boolean => {
      for (const item of items) {
        const normalizedItemUrl = item.url?.replace(/\/$/, '') || '';
        const normalizedTargetUrl = currentPath.replace(/\/$/, '') || '';
        if (normalizedItemUrl && normalizedTargetUrl === normalizedItemUrl) {
          activeTitle = item.title;
          return true;
        }
        if (item.children && findTitle(item.children)) return true;
      }
      return false;
    };
    findTitle(menuItems);
    
    if (activeTitle) {
      document.title = `${activeTitle} - SEMAR`;
    } else {
      document.title = 'SEMAR - Reliability Meets Intelligence';
    }
  }, [location.pathname, findActiveTopLevelTab, menuItems, navigate]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setMobileOpen(false);
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const findFirstUrl = (item: NavItem): string | null => {
    if (item.url) return item.url;
    if (item.children) {
      for (const child of item.children) {
        const url = findFirstUrl(child);
        if (url) return url;
      }
    }
    return null;
  };

  const handleMenuItemClick = useCallback(
    (item: NavItem, fromHorizontal = false) => {
      // 1. Always prioritize direct /dashboard canonical route for Dashboard module
      if (item.id === 'dashboard' || item.url === '/dashboard' || item.id === 'dashboard-home' || item.id === 'dashboard-mission-control') {
        navigate('/dashboard');
        if (window.innerWidth < 1024) setMobileOpen(false);
        return;
      }

      // 2. Direct URL click from sidebar
      if (item.url && !fromHorizontal) {
        navigate(item.url);
        if (window.innerWidth < 1024) setMobileOpen(false);
        return;
      }

      // 3. Top horizontal module switcher click
      if (fromHorizontal) {
        if (item.type === 'collapse') {
          const next: Record<string, boolean> = { [item.id]: true };
          setOpenCollapseMenus(next);
        }
        if (item.url) {
          navigate(item.url);
          return;
        }
        if (item.children && item.children.length > 0) {
          const firstUrl = findFirstUrl(item);
          if (firstUrl) {
            navigate(firstUrl);
            return;
          }
        }
      }

      // 4. Fallback item click
      if (item.url) {
        navigate(item.url);
        if (window.innerWidth < 1024) setMobileOpen(false);
      }
    },
    [navigate, findFirstUrl]
  );

  const toggleCollapseMenu = useCallback((id: string) => {
    setOpenCollapseMenus((prev) => {
      const isOpen = prev[id];
      if (isOpen) {
        return { ...prev, [id]: false };
      } else {
        // Accordion: close others when opening one.
        return { [id]: true };
      }
    });
  }, []);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);

  const getUserInitials = useCallback((u: any) => {
    if (!u) return 'U';
    const f = u.first_name || u.firstName || '';
    const l = u.last_name || u.lastName || '';
    if (f && l) return (f.charAt(0) + l.charAt(0)).toUpperCase();
    if (f) return f.slice(0, 2).toUpperCase();
    return 'U';
  }, []);

  const userRoleLabel = useMemo(() => {
    if (!user) return 'User';
    if ((user as any).is_superuser) return 'Super Admin';
    if (Array.isArray((user as any).roles) && (user as any).roles.length > 0) {
      const role = (user as any).roles[0];
      return typeof role === 'string' ? role : role.name || 'User';
    }
    return 'User';
  }, [user]);

  const navigationContextValue = useMemo<NavigationContextType>(
    () => ({
      sidebarOpen,
      setSidebarOpen,
      mobileOpen,
      setMobileOpen,
      activeHorizontalTab,
      setActiveHorizontalTab,
      openCollapseMenus,
      setOpenCollapseMenus,
      topLevelMenuItems,
      handleMenuItemClick,
      toggleCollapseMenu,
    }),
    [sidebarOpen, mobileOpen, activeHorizontalTab, openCollapseMenus, topLevelMenuItems, handleMenuItemClick, toggleCollapseMenu]
  );

  return (
    <NavigationContext.Provider value={navigationContextValue}>
      <div className="flex w-full min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-primary-100 selection:text-primary-700">
        
        {/* Background Decorative blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary-100/30 rounded-full blur-[120px] animate-float"></div>
          <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-blue-100/30 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute top-[30%] right-[10%] w-[15%] h-[15%] bg-indigo-100/20 rounded-full blur-[80px]"></div>
        </div>

        <Sidebar />

        <div 
          className={`flex-1 flex flex-col min-h-screen transition-all duration-500 ease-in-out ${
            sidebarOpen ? 'lg:ml-[290px]' : 'lg:ml-[110px]'
          }`}
        >
          {/* Modern Floating Header */}
          <div className="sticky top-4 z-40 px-4 sm:px-6 md:px-8 transition-all duration-300">
            <div className="glass flex items-center justify-between h-16 px-4 rounded-2xl shadow-premium border-white/50 backdrop-blur-xl bg-white/75">
              <div className="flex items-center gap-1 sm:gap-4 h-full">
                <button 
                  className="lg:hidden p-2 rounded-xl hover:bg-white/50 text-slate-600 transition-colors"
                  onClick={() => setMobileOpen(true)}
                >
                  <MenuIcon className="w-5 h-5" />
                </button>
                <div className="sm:hidden font-black text-primary-600 text-lg tracking-tighter self-center">SEMAR</div>
                
                {/* Horizontal Module Switcher (Improved for scalability) */}
                <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                  <button 
                    className="hidden lg:block p-2 rounded-xl hover:bg-white/50 text-slate-400 hover:text-primary-600 transition-all active:scale-95"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                  >
                    <MenuIcon className="w-5 h-5" />
                  </button>
                  <div className="h-6 w-px bg-slate-200/50 mx-1"></div>
                  
                  <div className="relative flex items-center group/nav">
                    {/* Left arrow - visible when scrolled */}
                    <button 
                      type="button"
                      aria-label="Scroll modules left"
                      onClick={() => headerMenuRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
                      className="absolute -left-3 flex w-8 h-8 items-center justify-center bg-white rounded-full shadow-premium border border-slate-100 text-slate-400 hover:text-primary-600 z-20 transition-all opacity-0 group-hover/nav:opacity-100"
                    >
                      <ChevronLeft size={14} strokeWidth={3} />
                    </button>

                    <div 
                      ref={headerMenuRef}
                      className="flex items-center h-11 px-1.5 bg-slate-100/40 backdrop-blur-sm rounded-2xl border border-slate-200/50 overflow-x-auto overscroll-x-contain touch-pan-x max-w-[50vw] md:max-w-[40vw] xl:max-w-[50vw] scroll-smooth no-scrollbar"
                    >
                      <div className="flex items-center min-w-max px-0.5">
                        {topLevelMenuItems.map((item, idx) => {
                          const isActive = activeHorizontalTab === idx;
                          return (
                            <button
                              key={item.id}
                              ref={(node) => {
                                if (node) headerTabRefs.current.set(item.id, node);
                                else headerTabRefs.current.delete(item.id);
                              }}
                              type="button"
                              onClick={() => handleMenuItemClick(item, true)}
                              className={`rounded-xl px-3 sm:px-5 py-2.5 mx-0.5 text-[10px] font-black uppercase tracking-widest transition-colors duration-200 whitespace-nowrap border ${
                                isActive 
                                  ? 'bg-white text-primary-600 shadow-sm border-slate-200/60' 
                                  : 'text-slate-400 border-transparent hover:text-slate-700 hover:bg-white/50'
                              }`}
                            >
                              {item.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right arrow - visible when scrolled */}
                    <button 
                      type="button"
                      aria-label="Scroll modules right"
                      onClick={() => headerMenuRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
                      className="absolute -right-3 flex w-8 h-8 items-center justify-center bg-white rounded-full shadow-premium border border-slate-100 text-slate-400 hover:text-primary-600 z-20 transition-all opacity-0 group-hover/nav:opacity-100"
                    >
                      <ChevronRight size={14} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="hidden md:block">
                  <GlobalSearchBar />
                </div>

                <div className="relative" ref={notificationsRef}>
                  <button 
                    className="p-2 rounded-xl hover:bg-white/50 text-slate-600 transition-all active:scale-95"
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 flex h-2 w-2">
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                      </span>
                    )}
                  </button>
                  {isNotificationsOpen && (
                    <div className="absolute top-full right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100 font-bold text-slate-800 text-sm">Notifications</div>
                      <div className="max-h-60 overflow-y-auto">
                        {notifications.map(n => (
                          <div key={n.id} className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-l-2 border-transparent hover:border-primary-500 transition-all">
                            <p className="text-xs font-bold text-slate-800">{n.title}</p>
                            <p className="text-[10px] text-slate-500">{n.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative" ref={userMenuRef}>
                  <button 
                    className="flex items-center p-1 rounded-full hover:shadow-md transition-all active:scale-95"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-600 border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-[10px]">
                      {getUserInitials(user)}
                    </div>
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute top-full right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 py-2 z-50 overflow-hidden">
                      <div className="px-4 py-3 bg-slate-50/50">
                        <p className="text-xs font-bold text-slate-800">{user?.first_name || 'Admin'}</p>
                        <p className="text-[10px] text-slate-500">{userRoleLabel}</p>
                      </div>
                      <button className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-primary-50 transition-colors flex items-center">
                        <UserIcon className="w-3.5 h-3.5 mr-2" /> Profile
                      </button>
                      <div className="h-px bg-slate-100 my-1"></div>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors flex items-center"
                      >
                        <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Breadcrumbs (Second Line) with proper spacing */}
          <div className="px-4 mt-6 sm:px-6 md:px-8">
            <div className="flex items-center justify-between border-b border-slate-200/50 pb-4">
              <Breadcrumbs />
            </div>
          </div>

          <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 md:p-8 animate-in fade-in zoom-in-95 duration-700">
            <Outlet />
          </main>
        </div>

      </div>
    </NavigationContext.Provider>
  );
};

export default MainLayout;
