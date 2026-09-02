import React, { useState, useEffect, useMemo } from 'react';
import { 
  HardHat, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Edit2, 
  Eye,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  Activity,
  Shield,
  UploadCloud,
  Trash2
} from 'lucide-react';

import { Asset, AssetStatus, CriticalityLevel } from '../../types/asset';
import { assetService } from '../../services/assetServices';
import AssetFormModal, { ASSET_LEVELS } from '../../components/AssetFormModal';

const AssetRegistryPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  // Shared asset form modal
  const [isFormOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  // Import modal
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);

  // View detail modal
  const [isDetailOpen, setDetailOpen] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [criticalityFilter, setCriticalityFilter] = useState('');

  const fetchAssets = async () => {
    try {
      const response = await assetService.getAssets({ page, limit: rowsPerPage });
      const data = (response as any)?.data || (response as any)?.items || response;
      setAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load assets', err);
    }
  };

  useEffect(() => { fetchAssets(); }, [page, rowsPerPage]);

  // Build flat map for the shared form's parent picker
  const allAssetsMap = useMemo(() => {
    const m: Record<string, { id: string; name: string; type: string }> = {};
    for (const a of assets) {
      m[a.id] = { id: a.id, name: a.name, type: a.type };
    }
    return m;
  }, [assets]);

  // Filtering
  useEffect(() => {
    const filtered = assets.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          asset.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || asset.status === statusFilter;
      const matchesCategory = !categoryFilter || asset.type?.toLowerCase() === categoryFilter;
      
      let matchesCriticality = true;
      if (criticalityFilter) {
        matchesCriticality = asset.criticality === Number(criticalityFilter);
      }
      return matchesSearch && matchesStatus && matchesCategory && matchesCriticality;
    });
    setFilteredAssets(filtered);
    setPage(1);
  }, [searchTerm, statusFilter, categoryFilter, criticalityFilter, assets]);

  const handleDeleteAsset = async (assetId: string, assetName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${assetName}"?`)) return;
    try {
      await assetService.deleteAsset(assetId);
      await fetchAssets();
    } catch (err) {
      console.error('Failed to delete asset:', err);
      alert('Failed to delete asset.');
    }
  };

  const getStatusStyle = (status: AssetStatus) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'maintenance': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'inactive': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'decommissioned': return 'bg-slate-50 text-slate-600 border-slate-200';
      case 'planned': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getCriticalityStyle = (criticality: CriticalityLevel) => {
    switch (criticality) {
      case 1: return 'text-emerald-500';
      case 2: return 'text-blue-500';
      case 3: return 'text-amber-500';
      case 4: return 'text-orange-500';
      case 5: return 'text-rose-500';
      default: return 'text-slate-500';
    }
  };

  const getCriticalityName = (criticality: CriticalityLevel) => {
    switch (criticality) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      case 4: return 'Very High';
      case 5: return 'Critical';
      default: return 'Unknown';
    }
  };

  const paginatedAssets = filteredAssets.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / rowsPerPage));

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-500/30 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 group-hover:translate-x-1 transition-transform">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Asset Management • Enterprise Registry</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight">
                Asset <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Registry</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg mb-8 leading-relaxed">
                Centralized view of all registered assets. Monitor status, manage lifecycle, and track performance across your entire operation.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => { setFormMode('create'); setSelectedAsset(null); setFormOpen(true); }}
                  className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Plus size={18} strokeWidth={3} />
                  Register Asset
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all flex items-center gap-2">
                  <Download size={18} />
                  Export Data
                </button>
                <button 
                  onClick={() => setImportModalOpen(true)}
                  className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all flex items-center gap-2"
                >
                  <UploadCloud size={18} />
                  Import Data
                </button>
              </div>
            </div>
            
            <div className="hidden lg:grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-inner group-hover:-translate-y-2 transition-transform duration-500">
               {[
                 { label: 'Total Assets', value: assets.length, color: 'text-blue-400' },
                 { label: 'Active', value: assets.filter(a => a.status === 'active').length, color: 'text-emerald-400' },
                 { label: 'Critical', value: assets.filter(a => a.criticality === 5).length, color: 'text-rose-400' },
                 { label: 'Maintenance', value: assets.filter(a => a.status === 'maintenance').length, color: 'text-amber-400' },
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

      {/* 🛠️ Toolbar */}
      <section className="glass-card p-4 rounded-[2rem] shadow-premium flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by ID or name..." 
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
            Filters {showFilters && `(Active)`}
          </button>
        </div>
      </section>

      {/* 📂 Filters */}
      {showFilters && (
        <div className="glass-card p-6 rounded-[2rem] shadow-premium grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-300">
          <div className="space-y-2">
            <p className="form-label">Status</p>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-input">
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
              <option value="planned">Planned</option>
              <option value="decommissioned">Decommissioned</option>
            </select>
          </div>
          <div className="space-y-2">
            <p className="form-label">Asset Type</p>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="form-input">
              <option value="">All Types</option>
              {Object.entries(ASSET_LEVELS).map(([key, def]) => (
                <option key={key} value={key}>{def.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <p className="form-label">Criticality</p>
            <select value={criticalityFilter} onChange={(e) => setCriticalityFilter(e.target.value)} className="form-input">
              <option value="">All Levels</option>
              <option value="1">Low</option>
              <option value="2">Medium</option>
              <option value="3">High</option>
              <option value="4">Very High</option>
              <option value="5">Critical</option>
            </select>
          </div>
        </div>
      )}

      {/* 📊 Asset Table */}
      <div className="glass-card overflow-hidden rounded-[2.5rem] shadow-premium border border-white/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Criticality</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Health</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedAssets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <HardHat size={40} className="text-slate-200 mb-4" />
                      <p className="text-sm font-bold text-slate-500 mb-1">No assets found</p>
                      <p className="text-xs text-slate-400 mb-4">Register your first asset to get started</p>
                      <button 
                        onClick={() => { setFormMode('create'); setSelectedAsset(null); setFormOpen(true); }}
                        className="px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 transition-colors flex items-center gap-1"
                      >
                        <Plus size={14} /> Register Asset
                      </button>
                    </div>
                  </td>
                </tr>
              ) : paginatedAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <HardHat size={22} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 leading-none mb-1">{asset.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{asset.tagNumber || asset.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-600">{ASSET_LEVELS[asset.type?.toLowerCase()]?.label || asset.type?.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(asset.status)}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                       <Shield size={12} className={getCriticalityStyle(asset.criticality)} />
                       <span className={`text-[11px] font-black ${getCriticalityStyle(asset.criticality)}`}>{getCriticalityName(asset.criticality)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center">
                       <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                          <div 
                            className={`h-full rounded-full ${(asset.health?.overallScore || 0) > 80 ? 'bg-emerald-500' : (asset.health?.overallScore || 0) > 50 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                            style={{ width: `${asset.health?.overallScore || 0}%` }}
                          ></div>
                       </div>
                       <span className="text-[10px] font-bold text-slate-500">{asset.health?.overallScore || 0}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin size={14} className="text-slate-300" />
                      <span className="text-xs font-medium">{asset.location?.building || asset.location?.address || asset.hierarchyPath || '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 pr-2">
                       <button 
                        onClick={() => { setSelectedAsset(asset); setDetailOpen(true); }}
                        className="p-2 text-slate-300 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-all" title="View"
                       >
                         <Eye size={18} />
                       </button>
                       <button 
                        onClick={() => { setSelectedAsset(asset); setFormMode('edit'); setFormOpen(true); }}
                        className="p-2 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all" title="Edit"
                       >
                         <Edit2 size={18} />
                       </button>
                       <button 
                        onClick={() => handleDeleteAsset(asset.id, asset.name)}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all" title="Delete"
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

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             Showing {paginatedAssets.length} of {filteredAssets.length} assets
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
                 <span className="text-xs font-black text-primary-600">{page}</span>
                 <span className="text-xs font-bold text-slate-300">/</span>
                 <span className="text-xs font-black text-slate-400">{totalPages}</span>
              </div>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 transition-all"
              >
                <ChevronRight size={18} />
              </button>
           </div>
        </div>
      </div>

      {/* Shared Asset Form Modal */}
      <AssetFormModal
        isOpen={isFormOpen}
        mode={formMode}
        editingAsset={selectedAsset}
        allAssets={allAssetsMap}
        onClose={() => { setFormOpen(false); setSelectedAsset(null); }}
        onSaved={() => fetchAssets()}
      />

      {/* View Detail Modal */}
      {isDetailOpen && selectedAsset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDetailOpen(false)}></div>
          <div className="modal-glass w-full max-w-lg relative z-10 flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
               <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">{selectedAsset.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {ASSET_LEVELS[selectedAsset.type?.toLowerCase()]?.label || selectedAsset.type} • {selectedAsset.tagNumber || selectedAsset.id}
                  </p>
               </div>
               <button onClick={() => setDetailOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                 <X size={20} className="text-slate-400" />
               </button>
            </div>
            <div className="p-8 space-y-4">
               {[
                 { label: 'Status', value: selectedAsset.status },
                 { label: 'Type', value: ASSET_LEVELS[selectedAsset.type?.toLowerCase()]?.label || selectedAsset.type },
                 { label: 'Criticality', value: getCriticalityName(selectedAsset.criticality) },
                 { label: 'Health Score', value: `${selectedAsset.health?.overallScore || 0}%` },
                 { label: 'Location', value: selectedAsset.location?.address || selectedAsset.hierarchyPath || '—' },
               ].map((item, i) => (
                 <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                    <span className="text-sm font-bold text-slate-700">{item.value}</span>
                 </div>
               ))}
            </div>
            <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
               <button onClick={() => setDetailOpen(false)} className="btn-secondary-premium">Close</button>
               <button 
                 onClick={() => { setDetailOpen(false); setFormMode('edit'); setFormOpen(true); }}
                 className="px-6 py-3 bg-amber-500 text-white rounded-2xl font-black text-xs shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
               >
                 <Edit2 size={16} /> Edit Asset
               </button>
            </div>
          </div>
        </div>
      )}

      {/* 📦 Import Data Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setImportModalOpen(false)}></div>
          <div className="modal-glass w-full max-w-xl relative z-10 flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
               <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Import Asset Data</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bulk import from CSV or Excel</p>
               </div>
               <button onClick={() => { setImportModalOpen(false); setImportFile(null); setImportProgress(0); setIsImporting(false); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                 <X size={20} className="text-slate-400" />
               </button>
            </div>
            
            <div className="p-8 space-y-6">
               <div className="p-8 rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center gap-4 group">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-premium">
                     <UploadCloud size={32} />
                  </div>
                  <div className="text-center">
                     <p className="text-sm font-black text-slate-700 tracking-tight">{importFile ? importFile.name : 'Select a file to import'}</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                       {importFile ? `${(importFile.size / 1024).toFixed(1)} KB` : 'Supported: .csv, .xlsx, .xls'}
                     </p>
                  </div>
                  <label className="px-4 py-2 bg-white text-slate-700 rounded-xl font-bold text-xs border border-slate-200 hover:bg-slate-50 cursor-pointer transition-all">
                     Browse Files
                     <input type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={(e) => { if (e.target.files?.[0]) setImportFile(e.target.files[0]); }} />
                  </label>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="form-label">Import Mode</label>
                     <select className="form-input">
                        <option value="create">Create New Assets</option>
                        <option value="update">Update Existing</option>
                        <option value="upsert">Create or Update</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="form-label">Default Status</label>
                     <select className="form-input">
                        <option value="active">Active</option>
                        <option value="planned">Planned</option>
                        <option value="inactive">Inactive</option>
                     </select>
                  </div>
               </div>

               <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <Activity size={16} className="text-blue-500 flex-shrink-0" />
                  <p className="text-[10px] font-bold text-blue-600">Columns should include: name, asset_type, tag_number, status, and optionally parent_id, description.</p>
               </div>

               {isImporting && (
                 <div className="space-y-2">
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${importProgress}%` }}></div>
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Processing... {importProgress}%</p>
                 </div>
               )}
            </div>

            <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
               <button onClick={() => { setImportModalOpen(false); setImportFile(null); setImportProgress(0); setIsImporting(false); }} className="px-6 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-bold transition-colors">Cancel</button>
               <button 
                 disabled={!importFile || isImporting}
                 onClick={() => {
                   setIsImporting(true);
                   setImportProgress(0);
                   const interval = setInterval(() => {
                     setImportProgress(prev => {
                       if (prev >= 100) {
                         clearInterval(interval);
                         setIsImporting(false);
                         setImportModalOpen(false);
                         setImportFile(null);
                         return 100;
                       }
                       return prev + 10;
                     });
                   }, 300);
                 }}
                 className="px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
               >
                 {isImporting ? 'Importing...' : 'Start Import'}
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AssetRegistryPage;