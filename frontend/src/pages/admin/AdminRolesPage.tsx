import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  X,
  Activity,
  Zap,
  Check
} from 'lucide-react';
import { 
  RolesAPI, 
  PermissionsAPI,
  handleAPIError, 
  type Role, 
  type Permission 
} from '../../lib/api/endpoints';

const AdminRolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('view');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    level: 1,
    permission_ids: [] as number[],
    is_active: true
  });

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await RolesAPI.getRoles();
      setRoles(response.data.data.roles || []);
    } catch (error) {
      console.error('Failed to fetch roles:', handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await PermissionsAPI.getPermissions({ limit: 1000 });
      setPermissions(response.data.data.permissions || []);
    } catch (error) {
      console.error('Failed to fetch permissions:', handleAPIError(error));
    }
  };

  React.useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      level: 1,
      permission_ids: [],
      is_active: true
    });
    setModalType('create');
    setModalOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      code: role.code,
      description: role.description,
      level: role.level || 1,
      permission_ids: role.permissions?.map(p => p.id) || [],
      is_active: true
    });
    setModalType('edit');
    setModalOpen(true);
  };

  const handleOpenView = (role: Role) => {
    setSelectedRole(role);
    setModalType('view');
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modalType === 'create') {
        await RolesAPI.createRole(formData);
      } else if (modalType === 'edit' && selectedRole) {
        await RolesAPI.updateRole(selectedRole.id, formData);
      }
      setModalOpen(false);
      fetchRoles();
    } catch (error) {
      alert(handleAPIError(error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (roleId?: number) => {
    const idsToDelete = roleId ? [roleId] : selectedIds;
    if (idsToDelete.length === 0) return;

    const message = idsToDelete.length > 1 
      ? `Are you sure you want to delete ${idsToDelete.length} roles?` 
      : 'Are you sure you want to delete this role?';

    if (!window.confirm(message)) return;

    setSaving(true);
    try {
      if (idsToDelete.length > 1) {
        await RolesAPI.bulkDeleteRoles(idsToDelete);
        setSelectedIds([]);
      } else {
        await RolesAPI.deleteRole(idsToDelete[0]);
      }
      fetchRoles();
    } catch (error) {
      alert(handleAPIError(error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // Only select roles that are NOT system roles
      const selectableRoles = paginatedRoles.filter(r => !r.is_system_role).map(r => r.id);
      setSelectedIds(selectableRoles);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const roleStats = {
    total: roles.length,
    active: roles.length, 
    system: roles.filter(role => role.is_system_role).length,
    totalUsers: roles.reduce((sum, role) => sum + (role.user_count || 0), 0)
  };

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    role.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedRoles = filteredRoles.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filteredRoles.length / rowsPerPage);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Welcome Section */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-purple-500/30 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 group-hover:translate-x-1 transition-transform">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Security Architecture • Role Engine</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight">
                Role <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">Definitions</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg mb-8 leading-relaxed">
                Configure system access boundaries and security policies. Define granular permissions that align with your organizational structure and operational goals.
              </p>
              <div className="flex flex-wrap gap-4">
                {selectedIds.length > 0 && (
                  <button 
                    onClick={() => handleDelete()}
                    className="px-6 py-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl font-bold flex items-center gap-2 hover:bg-rose-100 transition-all shadow-sm"
                  >
                    <Trash2 size={18} />
                    <span>Delete {selectedIds.length} Roles</span>
                  </button>
                )}

                <button 
                  onClick={handleOpenCreate}
                  className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Plus size={18} strokeWidth={3} />
                  Define New Role
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all flex items-center gap-2">
                  <ShieldCheck size={18} />
                  Security Audit
                </button>
              </div>
            </div>
            
            {/* Quick Stats Grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-inner group-hover:-translate-y-2 transition-transform duration-500">
               {[
                 { label: 'Total Roles', value: roleStats.total, color: 'text-purple-400' },
                 { label: 'Active', value: roleStats.active, color: 'text-emerald-400' },
                 { label: 'System Roles', value: roleStats.system, color: 'text-amber-400' },
                 { label: 'Total Managed', value: roleStats.totalUsers, color: 'text-blue-400' },
               ].map((s, i) => (
                 <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 min-w-[120px]">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                   <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
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
            placeholder="Search roles by ID or name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-all">
            <Filter size={16} />
            Filter Categories
          </button>
          <div className="h-8 w-[1px] bg-slate-100 hidden md:block"></div>
          <div className="flex bg-slate-100/50 p-1 rounded-xl">
             <button className="p-2 text-slate-400 hover:text-primary-500 transition-colors"><Zap size={18} /></button>
             <button className="p-2 text-slate-400 hover:text-primary-500 transition-colors"><Shield size={18} /></button>
          </div>
          {selectedIds.length > 0 && (
            <button 
              onClick={() => handleDelete()}
              disabled={saving}
              className="px-4 py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl text-xs font-bold hover:bg-rose-100 transition-all flex items-center gap-2 animate-in slide-in-from-right-4 duration-300 ml-2"
            >
              <Trash2 size={16} />
              {saving ? 'Deleting...' : `Delete ${selectedIds.length}`}
            </button>
          )}
        </div>
      </section>

      {/* 📊 Premium Roles Table */}
      <div className="glass-card overflow-hidden rounded-[2.5rem] shadow-premium border border-white/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 w-10">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    checked={paginatedRoles.length > 0 && paginatedRoles.filter(r => !r.is_system_role).every(r => selectedIds.includes(r.id))}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role Identification</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description & Scope</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Managed Users</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Modified</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Architecting Data...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedRoles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No roles discovered</p>
                  </td>
                </tr>
              ) : (
                paginatedRoles.map((role) => (
                  <tr key={role.id} className={`hover:bg-slate-50/80 transition-colors group ${selectedIds.includes(role.id) ? 'bg-purple-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 disabled:opacity-30"
                        checked={selectedIds.includes(role.id)}
                        onChange={() => handleSelectRow(role.id)}
                        disabled={role.is_system_role}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:rotate-12 transition-transform shadow-inner border border-purple-100">
                          {role.is_system_role ? <Shield size={22} fill="currentColor" fillOpacity={0.1} /> : <ShieldCheck size={22} />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 leading-none mb-1 flex items-center gap-1.5">
                            {role.name}
                            {role.is_system_role && <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-100 font-black tracking-widest">SYSTEM</span>}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{role.code}</p>
                             <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-600 border border-purple-100 font-black">LVL {role.level}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-medium text-slate-500 max-w-[300px] leading-relaxed line-clamp-2">
                        {role.description}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-[14px] font-black text-slate-700 leading-none mb-1">{role.user_count || 0}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Users</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border bg-emerald-50 text-emerald-600 border-emerald-100`}>
                        OPERATIONAL
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Activity size={14} className="text-slate-300" />
                        <span className="text-xs font-bold">Latest Update</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 pr-2">
                        <button 
                          onClick={() => handleOpenView(role)}
                          className="p-2 text-slate-300 hover:text-purple-500 hover:bg-purple-50 rounded-xl transition-all"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleOpenEdit(role)}
                          className="p-2 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent" 
                          disabled={role.is_system_role}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(role.id)}
                          className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent" 
                          disabled={role.is_system_role}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 📑 Premium Pagination */}
        <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             Showing {paginatedRoles.length} of {filteredRoles.length} architectural roles
           </p>
           <div className="flex items-center gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-xl">
                 <span className="text-xs font-black text-purple-600">{page}</span>
                 <span className="text-xs font-bold text-slate-300">/</span>
                 <span className="text-xs font-black text-slate-400">{totalPages || 1}</span>
              </div>
              <button 
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 transition-all"
              >
                <ChevronRight size={18} />
              </button>
           </div>
        </div>
      </div>

      {/* 📦 Role Definition Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setModalOpen(false)}></div>
          <div className="modal-glass w-full max-w-4xl relative z-10 flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
               <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                    {modalType === 'create' ? 'Initialize New Role' : modalType === 'edit' ? 'Modify Role Specification' : 'Role Specifications'}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {modalType === 'create' ? 'Define structural access boundaries' : `Reference ID: ${selectedRole?.id}`}
                  </p>
               </div>
               <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                 <X size={20} className="text-slate-400" />
               </button>
            </div>
            
            <div className="p-8 overflow-y-auto max-h-[70vh] space-y-8">
               {modalType === 'view' ? (
                 <div className="space-y-8">
                   <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-[2.5rem] bg-purple-50 text-purple-600 flex items-center justify-center text-3xl shadow-inner border border-purple-100">
                        {selectedRole?.is_system_role ? <Shield size={32} /> : <ShieldCheck size={32} />}
                      </div>
                      <div>
                         <h4 className="text-2xl font-black text-slate-800 leading-none mb-1">{selectedRole?.name}</h4>
                         <p className="text-slate-400 font-bold mb-3 uppercase text-[10px] tracking-widest">{selectedRole?.code} • {selectedRole?.is_system_role ? 'SYSTEM ROLE' : 'ADMIN DEFINED'}</p>
                          <div className="flex items-center gap-6">
                             <div className="flex items-center gap-1.5 text-slate-500">
                                <Users size={14} />
                                <span className="text-xs font-bold">{selectedRole?.user_count || 0} Users Assigned</span>
                             </div>
                             <div className="flex items-center gap-1.5 text-purple-600">
                                <Zap size={14} />
                                <span className="text-xs font-black uppercase tracking-widest">Authority Level {selectedRole?.level}</span>
                             </div>
                          </div>
                      </div>
                   </div>
                   <div className="space-y-6">
                      <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 italic text-slate-600 text-sm leading-relaxed">
                         "{selectedRole?.description || 'No description provided.'}"
                      </div>
                      <div>
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Functional Capabilities</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {selectedRole?.permissions?.map(perm => (
                            <div key={perm.id} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-100 rounded-xl">
                              <Check size={12} className="text-emerald-500" />
                              <span className="text-[10px] font-bold text-slate-700 truncate">{perm.name}</span>
                            </div>
                          ))}
                          {(!selectedRole?.permissions || selectedRole.permissions.length === 0) && (
                            <p className="text-[10px] text-slate-400 font-medium">No granular permissions assigned.</p>
                          )}
                        </div>
                      </div>
                   </div>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Role Name</label>
                         <input 
                          type="text" 
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" 
                          placeholder="e.g. Asset Integrity Manager" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                         />
                      </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Identification Code</label>
                          <input 
                           type="text" 
                           className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" 
                           placeholder="e.g. ASSET_MGR" 
                           value={formData.code}
                           onChange={(e) => setFormData({...formData, code: e.target.value})}
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 text-purple-600">Authority Level</label>
                          <input 
                           type="number" 
                           className="w-full px-5 py-3.5 bg-purple-50/30 border border-purple-100 rounded-2xl text-sm font-black text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" 
                           placeholder="1-10" 
                           min="1"
                           max="10"
                           value={formData.level}
                           onChange={(e) => setFormData({...formData, level: parseInt(e.target.value) || 1})}
                          />
                          <p className="text-[9px] text-slate-400 font-medium pl-1 italic">Higher levels indicate greater hierarchical power.</p>
                       </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Capabilities Manifest</label>
                         <textarea 
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all min-h-[150px]" 
                          placeholder="Describe the scope and responsibilities of this role..."
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                         ></textarea>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2">Bind Permissions</label>
                      <div className="flex-1 bg-slate-50 rounded-3xl border border-slate-100 p-4 overflow-y-auto max-h-[400px] space-y-2 no-scrollbar">
                        {permissions.map(perm => (
                          <label key={perm.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:border-purple-300 transition-colors group">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                              checked={formData.permission_ids.includes(perm.id)}
                              onChange={(e) => {
                                const newIds = e.target.checked 
                                  ? [...formData.permission_ids, perm.id]
                                  : formData.permission_ids.filter(id => id !== perm.id);
                                setFormData({...formData, permission_ids: newIds});
                              }}
                            />
                            <div>
                              <p className="text-[11px] font-black text-slate-800 leading-none mb-1 group-hover:text-purple-600 transition-colors">{perm.name}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{perm.resource} • {perm.action}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                 </div>
               )}
            </div>

            <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
               <button onClick={() => setModalOpen(false)} className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all">
                 {modalType === 'view' ? 'Close Specifications' : 'Discard Variations'}
               </button>
               {modalType !== 'view' && (
                 <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary-200 transition-all disabled:opacity-50"
                 >
                   {saving ? 'Processing...' : modalType === 'create' ? 'Initialize Role' : 'Commit Changes'}
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminRolesPage;