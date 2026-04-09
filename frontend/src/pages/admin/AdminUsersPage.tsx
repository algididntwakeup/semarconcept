import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye, 
  CheckCircle, 
  Shield, 
  ShieldCheck,
  X,
  ChevronLeft,
  ChevronRight,
  Mail,
  User as UserIcon,
  Calendar,
  AlertTriangle,
  Activity
} from 'lucide-react';

// Real authentication utilities
import { 
  isAuthenticated, 
  canManageUsers,
} from '../../utils/auth';

// API utilities
import { 
  UsersAPI, 
  RolesAPI, 
  handleAPIError, 
  type User, 
  type Role, 
  type UserFilters,
  type UserStats
} from '../../lib/api/endpoints';

const AdminUsersPage: React.FC = () => {
  const navigate = useNavigate();

  // Authentication state management
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Data state
  const [users, setUsers] = useState<User[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    superusers: 0,
    by_role: {},
    by_department: {},
    recent_logins: 0,
    never_logged_in: 0
  });

  // UI state
  const [selectedUserId, setSelectedUserId] = useState<number | string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view' | 'delete'>('view');
  const [formUser, setFormUser] = useState<Partial<User>>({});
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Authentication check
  useEffect(() => {
    const isAuth = isAuthenticated();
    if (!isAuth) {
      navigate('/login', { replace: true });
      return;
    }
    if (!canManageUsers()) {
      setAuthError('You do not have permission to manage users');
      return;
    }
    setAuthChecked(true);
  }, [navigate]);

  // Data fetching
  useEffect(() => {
    if (authChecked) {
      fetchData();
    }
  }, [authChecked, page, rowsPerPage, searchTerm, statusFilter, roleFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const filters: UserFilters = {
        page: page + 1,
        limit: rowsPerPage,
      };
      if (searchTerm) filters.search = searchTerm;
      if (statusFilter !== 'all') filters.status = statusFilter as any;
      if (roleFilter !== 'all') filters.role = roleFilter;

      const [usersRes, statsRes, rolesRes] = await Promise.all([
        UsersAPI.getUsers(filters),
        UsersAPI.getUserStats(),
        RolesAPI.getRoles()
      ]);

      console.log('API Responses:', { usersRes, statsRes, rolesRes });

      if (usersRes.data?.data) {
        setUsers(usersRes.data.data.users || []);
        setTotalUsers(usersRes.data.data.pagination?.total || 0);
      }

      if (statsRes.data?.data) {
        console.log('Setting stats:', statsRes.data.data);
        setStats(statsRes.data.data);
      }

      if (rolesRes.data?.data) {
        const roleData = (rolesRes.data.data as any).roles || (Array.isArray(rolesRes.data.data) ? rolesRes.data.data : []);
        setRoles(roleData);
        setAllRoles(roleData);
      }
    } catch (err: any) {
      handleAPIError(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setRoleFilter('all');
    setSelectedIds([]);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(users.map(u => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleOpenBulkDelete = () => {
    setModalType('delete');
    setModalOpen(true);
  };

  const handleOpenCreate = () => {
    setFormUser({
      first_name: '',
      last_name: '',
      email: '',
      username: '',
      password: '',
      is_active: true,
      roles: []
    });
    setModalType('create');
    setModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setFormUser({ ...user, password: '' });
    setSelectedUserId(user.id);
    setModalType('edit');
    setModalOpen(true);
  };

  const handleOpenView = (user: User) => {
    setFormUser(user);
    setSelectedUserId(user.id);
    setModalType('view');
    setModalOpen(true);
  };

  const handleOpenDelete = (user: User) => {
    setFormUser(user);
    setSelectedUserId(user.id);
    setModalType('delete');
    setModalOpen(true);
  };

  const handleSaveUser = async () => {
    setSaving(true);
    try {
      const payload = {
        ...formUser,
        role_ids: formUser.roles?.map(r => r.id) || []
      };
      
      // Remove roles object as backend expects role_ids
      delete (payload as any).roles;
      
      // Remove empty password on edit
      if (modalType === 'edit' && !payload.password) {
        delete payload.password;
      }

      if (modalType === 'edit') {
        await UsersAPI.updateUser(selectedUserId!, payload as any);
      } else {
        if (!payload.password) {
          alert('Password is required for new users');
          setSaving(false);
          return;
        }
        await UsersAPI.createUser(payload as any);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      handleAPIError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    setSaving(true);
    try {
      if (selectedIds.length > 0) {
        await UsersAPI.bulkDeleteUsers(selectedIds);
        setSelectedIds([]);
      } else if (selectedUserId) {
        await UsersAPI.deleteUser(selectedUserId);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      handleAPIError(err);
    } finally {
      setSaving(false);
    }
  };

  if (authError) {
    return (
      <div className="p-8">
        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-8 max-w-2xl mx-auto shadow-sm">
          <div className="flex items-center gap-4 text-rose-600 mb-4">
            <AlertTriangle size={32} />
            <h2 className="text-2xl font-black tracking-tight">Access Denied</h2>
          </div>
          <p className="text-rose-700/70 font-medium mb-8 leading-relaxed">
            {authError}
          </p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 hover:scale-105 transition-all"
          >
            Return to Safety
          </button>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(totalUsers / rowsPerPage);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Welcome Section */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-blue-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-500/30 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 group-hover:translate-x-1 transition-transform">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Administration • User Management</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight">
                User <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-300">Management</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg mb-8 leading-relaxed">
                Control access, manage roles, and monitor user activity across the platform. Ensure your team has the right permissions for maximum productivity.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={handleOpenCreate}
                  className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <UserPlus size={18} strokeWidth={3} />
                  Add New User
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all flex items-center gap-2">
                  <Download size={18} />
                  Export Directory
                </button>
              </div>
            </div>
            
            {/* Quick Stats Grid - More Robust */}
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-inner group-hover:-translate-y-2 transition-transform duration-500" data-stats={JSON.stringify(stats)}>
               {[
                 { label: 'Total Users', value: stats?.total, color: 'text-indigo-400' },
                 { label: 'Active Now', value: stats?.active, color: 'text-emerald-400' },
                 { label: 'Admins', value: stats?.admins, color: 'text-amber-400' },
                 { label: 'Superusers', value: stats?.superusers, color: 'text-rose-400' },
               ].map((s, i) => (
                 <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 min-w-[120px]">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                   <p className={`text-2xl font-black ${s.color}`}>
                     {typeof s.value === 'number' ? s.value : '0'}
                   </p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* 🛠️ Dynamic Toolbar */}
      <section className="glass-card p-4 rounded-[2rem] shadow-premium flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email or username..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${showFilters ? 'bg-primary-500 text-white shadow-glow-primary' : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'}`}
          >
            <Filter size={16} />
            Advanced Filters
          </button>
          <div className="h-8 w-[1px] bg-slate-100 hidden md:block"></div>
          <button 
            onClick={clearFilters}
            className="px-4 py-3 rounded-2xl text-xs font-bold text-slate-400 hover:text-slate-600 transition-all"
          >
            Reset
          </button>
          {selectedIds.length > 0 && (
            <button 
              onClick={handleOpenBulkDelete}
              className="px-4 py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl text-xs font-bold hover:bg-rose-100 transition-all flex items-center gap-2 animate-in slide-in-from-right-4 duration-300"
            >
              <Trash2 size={16} />
              Delete {selectedIds.length} Selected
            </button>
          )}
        </div>
      </section>

      {/* 📂 Expanded Filters */}
      {showFilters && (
        <div className="glass-card p-6 rounded-[2rem] shadow-premium grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-300">
          <div className="space-y-2">
            <p className="form-label">Status</p>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="space-y-2">
            <p className="form-label">Role</p>
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="form-input"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role.id} value={role.name}>{role.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* 📊 Premium User Table */}
      <div className="glass-card overflow-hidden rounded-[2.5rem] shadow-premium border border-white/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 w-10">
                  <input 
                    type="checkbox" 
                    checked={users.length > 0 && selectedIds.length === users.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Profile</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Roles & Access</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Activity</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                    <td className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                    <td className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-16 mx-auto"></div></td>
                    <td className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                    <td className="px-6 py-6"></td>
                  </tr>
                ))
              ) : users.map((user) => (
                <tr key={user.id} className={`hover:bg-slate-50/80 transition-colors group ${selectedIds.includes(user.id) ? 'bg-indigo-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(user.id)}
                      onChange={() => handleSelectRow(user.id)}
                      className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg group-hover:scale-110 transition-transform shadow-inner border border-indigo-100">
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 leading-none mb-1">{user.full_name || `${user.first_name} ${user.last_name}`}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Mail size={10} /> {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {user.roles.map(role => (
                        <span key={role.id} className="inline-block px-2 py-0.5 rounded-lg bg-white border border-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${user.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Calendar size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Join: {new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Activity size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Login: {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 pr-2">
                       <button 
                        onClick={() => handleOpenView(user)}
                        className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                       >
                         <Eye size={18} />
                       </button>
                       <button 
                        onClick={() => handleOpenEdit(user)}
                        className="p-2 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                       >
                         <Edit2 size={18} />
                       </button>
                       <button 
                        onClick={() => handleOpenDelete(user)}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 📑 Premium Pagination */}
        <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             Found {totalUsers} registered users
           </p>
           <div className="flex items-center gap-2">
              <button 
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-xl">
                 <span className="text-xs font-black text-indigo-600">{page + 1}</span>
                 <span className="text-xs font-bold text-slate-300">/</span>
                 <span className="text-xs font-black text-slate-400">{totalPages || 1}</span>
              </div>
              <button 
                disabled={page >= (totalPages - 1)}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 transition-all"
              >
                <ChevronRight size={18} />
              </button>
           </div>
        </div>
      </div>

      {/* 📦 User Management Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setModalOpen(false)}></div>
          
          {modalType === 'delete' ? (
            <div className="modal-glass w-full max-w-md relative z-10 p-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-[2rem] bg-rose-50 text-rose-500 flex items-center justify-center mb-6 shadow-glow-rose">
                <Trash2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2 text-balance">
                {selectedIds.length > 1 ? `Delete ${selectedIds.length} Users?` : `Delete ${formUser.username}?`}
              </h3>
              <p className="font-medium text-slate-500 mb-8 leading-relaxed">
                {selectedIds.length > 1 
                  ? "This action is permanent and will revoke access for all selected accounts immediately."
                  : `This action is permanent and will revoke all access for ${formUser.full_name} immediately.`
                }
              </p>
              <div className="flex flex-col w-full gap-3">
                 <button 
                   onClick={handleDeleteUser}
                   disabled={saving}
                   className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold shadow-xl shadow-rose-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
                 >
                   {saving ? 'Processing...' : 'Confirm Deletion'}
                 </button>
                 <button onClick={() => setModalOpen(false)} className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors">
                   Cancel Action
                 </button>
              </div>
            </div>
          ) : (
            <div className="modal-glass w-full max-w-2xl relative z-10 flex flex-col">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                 <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                      {modalType === 'create' ? 'Create New User Account' : modalType === 'edit' ? 'Update Profile' : 'User Identity'}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {modalType === 'create' ? 'Define system access and identity' : `Identity ID: ${selectedUserId}`}
                    </p>
                 </div>
                 <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                   <X size={20} className="text-slate-400" />
                 </button>
              </div>
              
              <div className="p-8 overflow-y-auto max-h-[70vh] space-y-6">
                 {modalType === 'view' ? (
                   <div className="space-y-8">
                     <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl font-black shadow-inner border border-indigo-100">
                          {formUser.first_name?.[0]}{formUser.last_name?.[0]}
                        </div>
                        <div>
                           <h4 className="text-2xl font-black text-slate-800 leading-none mb-1 text-balance">{formUser.full_name}</h4>
                           <p className="text-slate-400 font-bold mb-3">{formUser.email}</p>
                           <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${formUser.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                             {formUser.is_active ? 'Active Status' : 'Inactive Status'}
                           </span>
                           <div className="mt-4 flex flex-wrap gap-2">
                             {formUser.roles?.map(role => (
                               <span key={role.id} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-black uppercase tracking-widest">
                                 {role.name}
                               </span>
                             ))}
                             {(!formUser.roles || formUser.roles.length === 0) && (
                               <span className="text-[10px] font-bold text-slate-400 italic">No roles assigned</span>
                             )}
                           </div>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-8 border-t border-slate-100 pt-8">
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Username</p>
                           <p className="text-sm font-black text-slate-700">{formUser.username}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Joined Date</p>
                           <p className="text-sm font-black text-slate-700">{formUser.created_at ? new Date(formUser.created_at).toLocaleDateString() : '-'}</p>
                        </div>
                        <div className="col-span-full">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Roles & Authorizations</p>
                           <div className="flex flex-wrap gap-2">
                              {formUser.roles?.map((r: any) => (
                                <span key={r.id} className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-600 uppercase tracking-wide">
                                  {r.name}
                                </span>
                              ))}
                           </div>
                        </div>
                     </div>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">First Name</label>
                         <input 
                           type="text" 
                           className="form-input" 
                           value={formUser.first_name || ''} 
                           onChange={(e) => setFormUser({ ...formUser, first_name: e.target.value })} 
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Last Name</label>
                         <input 
                           type="text" 
                           className="form-input" 
                           value={formUser.last_name || ''} 
                           onChange={(e) => setFormUser({ ...formUser, last_name: e.target.value })} 
                         />
                      </div>
                      <div className="space-y-2 col-span-full">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                         <input 
                           type="email" 
                           className="form-input" 
                           value={formUser.email || ''} 
                           onChange={(e) => setFormUser({ ...formUser, email: e.target.value })} 
                         />
                      </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Username</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            value={formUser.username || ''} 
                            onChange={(e) => setFormUser({ ...formUser, username: e.target.value })} 
                          />
                       </div>
                       {modalType === 'create' && (
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Initial Password</label>
                            <input 
                              type="password" 
                              className="form-input" 
                              value={formUser.password || ''} 
                              onChange={(e) => setFormUser({ ...formUser, password: e.target.value })} 
                            />
                         </div>
                       )}
                       <div className="space-y-2">
                          <label className="form-label">System Status</label>
                          <select 
                            className="form-input" 
                            value={formUser.is_active ? 'active' : 'inactive'} 
                            onChange={(e) => setFormUser({ ...formUser, is_active: e.target.value === 'active' })}
                          >
                             <option value="active">Active Access</option>
                             <option value="inactive">Suspended Access</option>
                          </select>
                       </div>
                       <div className="space-y-2 col-span-full">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Assign Architectural Roles</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 max-h-[200px] overflow-y-auto no-scrollbar">
                             {allRoles.map(role => {
                               const isSelected = formUser.roles?.some(r => r.id === role.id);
                               return (
                                 <label key={role.id} className={`flex items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${isSelected ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200'}`}>
                                   <input 
                                     type="checkbox"
                                     className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                     checked={isSelected}
                                     onChange={(e) => {
                                       const currentRoles = formUser.roles || [];
                                       const newRoles = e.target.checked 
                                         ? [...currentRoles, role]
                                         : currentRoles.filter(r => r.id !== role.id);
                                       setFormUser({ ...formUser, roles: newRoles });
                                     }}
                                   />
                                   <div className="flex flex-col">
                                      <span className="text-[10px] font-black uppercase tracking-tight leading-none">{role.name}</span>
                                      <span className="text-[8px] font-bold opacity-60 uppercase">{role.code}</span>
                                   </div>
                                 </label>
                               );
                             })}
                          </div>
                          <p className="text-[9px] text-slate-400 font-medium pl-1 italic">Users can possess multiple roles simultaneously.</p>
                       </div>
                   </div>
                 )}
              </div>

              <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
                 <button onClick={() => setModalOpen(false)} className="btn-secondary-premium">
                   {modalType === 'view' ? 'Close Panel' : 'Cancel'}
                 </button>
                 {modalType !== 'view' && (
                    <button 
                      onClick={handleSaveUser} 
                      disabled={saving}
                      className="btn-premium"
                    >
                      {saving ? 'Saving...' : modalType === 'create' ? 'Create User' : 'Update Profile'}
                    </button>
                 )}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AdminUsersPage;