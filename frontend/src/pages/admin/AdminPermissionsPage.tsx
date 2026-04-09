import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Shield, 
  ShieldAlert, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Lock, 
  ChevronLeft, 
  ChevronRight,
  X,
  Activity,
  UserCheck,
  Globe,
  Database,
  Trash2,
  Edit2
} from 'lucide-react';
import { 
  PermissionsAPI,
  handleAPIError, 
  type Permission 
} from '../../lib/api/endpoints';

const AdminPermissionsPage: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('view');
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    action: '',
    resource: '',
    scope: '',
    description: ''
  });

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const response = await PermissionsAPI.getPermissions({ limit: 1000 });
      setPermissions(response.data.data.permissions || []);
    } catch (error) {
      console.error('Failed to fetch permissions:', handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      action: '',
      resource: '',
      scope: '',
      description: ''
    });
    setModalType('create');
    setModalOpen(true);
  };

  const handleOpenView = (perm: Permission) => {
    setSelectedPermission(perm);
    setModalType('view');
    setModalOpen(true);
  };

  const handleOpenEdit = (perm: Permission) => {
    setSelectedPermission(perm);
    setFormData({
      name: perm.name,
      action: perm.action,
      resource: perm.resource,
      scope: perm.scope || '',
      description: perm.description
    });
    setModalType('edit');
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modalType === 'create') {
        await PermissionsAPI.createPermission(formData);
      } else if (modalType === 'edit' && selectedPermission) {
        await PermissionsAPI.updatePermission(selectedPermission.id, formData);
      }
      setModalOpen(false);
      fetchPermissions();
    } catch (error) {
      alert(handleAPIError(error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id?: number) => {
    const idsToDelete = id ? [id] : selectedIds;
    if (idsToDelete.length === 0) return;

    const message = idsToDelete.length > 1 
      ? `Delete ${idsToDelete.length} permissions?` 
      : 'Delete this permission?';

    if (!window.confirm(message)) return;

    setSaving(true);
    try {
      if (idsToDelete.length > 1) {
        await PermissionsAPI.bulkDeletePermissions(idsToDelete);
        setSelectedIds([]);
      } else {
        await PermissionsAPI.deletePermission(idsToDelete[0]);
      }
      fetchPermissions();
    } catch (error) {
      alert(handleAPIError(error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedPermissions.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return <Plus size={16} />;
      case 'read': return <Eye size={16} />;
      case 'update': return <Activity size={16} />;
      case 'delete': return <ShieldAlert size={16} />;
      default: return <Key size={16} />;
    }
  };

  const filteredPermissions = permissions.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.scope && p.scope.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const paginatedPermissions = filteredPermissions.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filteredPermissions.length / rowsPerPage);

  const permissionStats = { 
    total: permissions.length, 
    active: permissions.length, 
    inactive: 0, 
    system: permissions.filter(p => p.resource === 'system').length, 
    groups: new Set(permissions.map(p => p.resource)).size 
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Welcome Section */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 to-slate-900/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 group-hover:translate-x-1 transition-transform">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Infrasctructure Security • Access Control</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight">
                Permission <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-slate-300">Directory</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg mb-8 leading-relaxed">
                Define the granular capabilities available within the system. Granular permission management ensures your enterprise security architecture is robust and compliant.
              </p>
              <div className="flex flex-wrap gap-4">
                {selectedIds.length > 0 && (
                  <button 
                    onClick={() => handleDelete()}
                    className="px-6 py-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl font-bold flex items-center gap-2 hover:bg-rose-100 transition-all shadow-sm"
                  >
                    <Trash2 size={18} />
                    <span>Decommission {selectedIds.length}</span>
                  </button>
                )}
                <button 
                  onClick={handleOpenCreate}
                  className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Plus size={18} strokeWidth={3} />
                  New Capability
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all flex items-center gap-2">
                  <Shield size={18} />
                  Matrix View
                </button>
              </div>
            </div>
            
            {/* Quick Stats Grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-inner group-hover:-translate-y-2 transition-transform duration-500">
               {[
                 { label: 'Capabilities', value: permissionStats.total, color: 'text-blue-400' },
                 { label: 'Operational', value: permissionStats.active, color: 'text-emerald-400' },
                 { label: 'System Core', value: permissionStats.system, color: 'text-amber-400' },
                 { label: 'Resource Groups', value: permissionStats.groups, color: 'text-indigo-400' },
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
            placeholder="Search capabilities by name or domain..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-all">
            <Filter size={16} />
            Domain Filter
          </button>
          <div className="h-8 w-[1px] bg-slate-100 hidden md:block"></div>
          <div className="flex bg-slate-100/50 p-1 rounded-xl">
             <button className="p-2 text-slate-400 hover:text-primary-500 transition-colors"><Globe size={18} /></button>
             <button className="p-2 text-slate-400 hover:text-primary-500 transition-colors"><Database size={18} /></button>
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

      {/* 📑 Premium Content with Tabs */}
      <div className="glass-card overflow-hidden rounded-[2.5rem] shadow-premium border border-white/40">
        <div className="px-8 pt-6 border-b border-slate-100 flex gap-8">
           <button 
             onClick={() => setTabValue(0)}
             className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${tabValue === 0 ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Capability Matrix
             {tabValue === 0 && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-full"></div>}
           </button>
           <button 
             onClick={() => setTabValue(1)}
             className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${tabValue === 1 ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Security Domains
             {tabValue === 1 && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-full"></div>}
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 w-10 text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    checked={paginatedPermissions.length > 0 && selectedIds.length === paginatedPermissions.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Permission Key</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Functional Domain</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Operation</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Roles</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scanning Capabilities...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedPermissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No permissions detected</p>
                  </td>
                </tr>
              ) : (
                paginatedPermissions.map((perm) => (
                  <tr key={perm.id} className={`hover:bg-slate-50/80 transition-colors group ${selectedIds.includes(perm.id) ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedIds.includes(perm.id)}
                        onChange={() => handleSelectRow(perm.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform border border-slate-200 shadow-sm">
                          {getActionIcon(perm.action)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 leading-none mb-1 flex items-center gap-1.5">
                            {perm.name}
                            <Lock size={10} className="text-amber-500" />
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{perm.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-black text-[11px] text-slate-600 uppercase tracking-tighter">
                         {perm.resource}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-lg bg-white border border-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                        {perm.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-glow-emerald"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <UserCheck size={14} className="text-slate-300" />
                         <span className="text-xs font-bold text-slate-500">{perm.scope || 'Global'} Scope</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 pr-2">
                         <button 
                          onClick={() => handleOpenView(perm)}
                          className="p-2 text-slate-300 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-all"
                         >
                           <Eye size={18} />
                         </button>
                         <button 
                          onClick={() => handleOpenEdit(perm)}
                          className="p-2 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                         >
                           <Edit2 size={18} />
                         </button>
                         <button 
                          onClick={() => handleDelete(perm.id)}
                          className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
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
             Mapping {filteredPermissions.length} active system permissions
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
                 <span className="text-xs font-black text-slate-600">{page}</span>
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

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setModalOpen(false)}></div>
          <div className="modal-glass w-full max-w-2xl relative z-10 flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
               <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                    {modalType === 'create' ? 'Initialize Capability' : modalType === 'edit' ? 'Adjust Parameters' : 'Capability Specs'}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {modalType === 'create' ? 'Define new access boundary' : `Reference: ${selectedPermission?.id}`}
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
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shadow-inner border border-slate-200">
                        {selectedPermission && getActionIcon(selectedPermission.action)}
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-slate-800 leading-none mb-1">{selectedPermission?.name}</h4>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{selectedPermission?.id} • {selectedPermission?.resource || 'Global'}</p>
                      </div>
                    </div>
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 italic text-slate-600 text-sm leading-relaxed">
                      "{selectedPermission?.description || 'No description provided.'}"
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Resource</p>
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-tighter">{selectedPermission?.resource}</p>
                      </div>
                      <div className="p-4 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Functional Action</p>
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-tighter">{selectedPermission?.action}</p>
                      </div>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Permission Name</label>
                        <input 
                          type="text" 
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Resource</label>
                        <input 
                          type="text" 
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                          value={formData.resource}
                          onChange={(e) => setFormData({...formData, resource: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Action Type</label>
                        <select 
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                          value={formData.action}
                          onChange={(e) => setFormData({...formData, action: e.target.value})}
                        >
                          <option value="">Select Action</option>
                          <option value="create">CREATE</option>
                          <option value="read">READ</option>
                          <option value="update">UPDATE</option>
                          <option value="delete">DELETE</option>
                          <option value="manage">MANAGE</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Architectural Scope</label>
                        <input 
                          type="text" 
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                          value={formData.scope}
                          onChange={(e) => setFormData({...formData, scope: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Brief Manifest</label>
                      <textarea 
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all min-h-[100px]"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                      ></textarea>
                    </div>
                 </div>
               )}
            </div>

            <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
               <button onClick={() => setModalOpen(false)} className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all">
                 Discard
               </button>
               {modalType !== 'view' && (
                 <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary-200 transition-all disabled:opacity-50"
                 >
                   {saving ? 'Processing...' : modalType === 'create' ? 'Initalize' : 'Commit'}
                 </button>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPermissionsPage;