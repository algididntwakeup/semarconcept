import React, { useState, useCallback } from 'react';
import { 
  FileText, 
  UploadCloud, 
  FolderPlus, 
  Search, 
  List, 
  Grid as GridIcon, 
  Download, 
  Star, 
  Clock, 
  HardDrive, 
  X,
  FileCode,
  FileImage,
  FileType,
  FileVideo,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  size: string;
  uploadDate: string;
  uploadedBy: string;
  tags: string[];
  isStarred: boolean;
  version: string;
  assetId?: string;
  description?: string;
}

const AssetDocumentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Documents state — initially empty, populated from API
  const [documents, setDocuments] = useState<Document[]>([]);

  const stats = [
    { label: 'Total Files', value: documents.length, icon: FileText, color: 'text-blue-500' },
    { label: 'Storage Used', value: '7.2 GB', icon: HardDrive, color: 'text-indigo-500' },
    { label: 'Important', value: documents.filter(d => d.isStarred).length, icon: Star, color: 'text-amber-500' },
    { label: 'Recently Added', value: 2, icon: Clock, color: 'text-emerald-500' }
  ];

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return <FileText size={20} className="text-rose-500" />;
      case 'excel': return <FileCode size={20} className="text-emerald-500" />;
      case 'image': return <FileImage size={20} className="text-blue-500" />;
      case 'video': return <FileVideo size={20} className="text-purple-500" />;
      default: return <FileType size={20} className="text-slate-500" />;
    }
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    setUploadModalOpen(true);
  }, []);

  const handleUploadSubmit = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploadModalOpen(false);
      setSelectedFiles([]);
    }, 1500);
  };

  const toggleStar = (id: string) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, isStarred: !d.isStarred } : d));
  };

  const handleEditDocument = (doc: Document) => {
    // TODO: Open edit modal with doc data
    console.log('Edit document:', doc.id);
  };

  const handleDeleteDocument = (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDocuments(prev => prev.filter(d => d.id !== id));
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.category.toLowerCase().includes(categoryFilter === 'all' ? '' : categoryFilter.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Welcome Section */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-slate-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-500/30 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 group-hover:translate-x-1 transition-transform">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Enterprise Library • Knowledge Base</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight">
                Asset <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-slate-300">Vault</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg mb-8 leading-relaxed">
                Manage all documents and technical metadata related to your infrastructure assets. Secure, version-controlled storage for critical operations manuals.
              </p>
              <div className="flex flex-wrap gap-4">
                <label className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer">
                  <UploadCloud size={18} strokeWidth={3} />
                  Upload Documents
                  <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                </label>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all flex items-center gap-2">
                  <FolderPlus size={18} />
                  Structural Folder
                </button>
              </div>
            </div>
            
            {/* Quick Stats Grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-inner group-hover:-translate-y-2 transition-transform duration-500">
               {stats.map((s, i) => (
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
            placeholder="Search by name, tags or metadata..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:border-blue-500 transition-all"
          >
             <option value="all">All Document Tiers</option>
             <option value="Technical Manual">Technical Manuals</option>
             <option value="Safety Documents">Safety Protocol</option>
          </select>
          <div className="h-8 w-[1px] bg-slate-100 hidden md:block"></div>
          <div className="flex bg-slate-100/50 p-1 rounded-xl">
             <button 
               onClick={() => setViewMode('list')}
               className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <List size={18} />
             </button>
             <button 
               onClick={() => setViewMode('grid')}
               className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <GridIcon size={18} />
             </button>
          </div>
        </div>
      </section>

      {/* 📊 Files content */}
      <div className="glass-card overflow-hidden rounded-[2.5rem] shadow-premium border border-white/40 min-h-[500px]">
        {filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-8">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
              <FileText size={36} className="text-slate-300" />
            </div>
            <h4 className="text-lg font-black text-slate-600 mb-2">No Documents Yet</h4>
            <p className="text-sm text-slate-400 font-medium text-center max-w-md mb-6">
              Upload your first document to start building your asset knowledge base. Supported formats include PDF, Excel, images, and more.
            </p>
            <label className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer">
              <UploadCloud size={18} strokeWidth={3} />
              Upload First Document
              <input type="file" multiple className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        ) : viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Registry</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Classification</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Payload</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Submission Date</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Rev.</th>
                  <th className="px-6 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          {getFileIcon(doc.type)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 leading-none mb-1 text-balance max-w-[200px] truncate">{doc.name}</p>
                          <div className="flex gap-1">
                             {doc.tags.slice(0, 2).map((tag, i) => (
                               <span key={i} className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">#{tag}</span>
                             ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest border border-slate-200">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="text-[10px] font-black text-slate-400">{doc.size}</span>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 uppercase">
                         <Clock size={12} className="text-slate-300" />
                         {doc.uploadDate}
                       </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">v{doc.version}</span>
                    </td>
                     <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => toggleStar(doc.id)} className={`p-2 transition-all ${doc.isStarred ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'}`}>
                           <Star size={18} fill={doc.isStarred ? 'currentColor' : 'none'} />
                         </button>
                         <button className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="Download"><Download size={18} /></button>
                         <button onClick={() => handleEditDocument(doc)} className="p-2 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all" title="Edit"><Edit2 size={18} /></button>
                         <button onClick={() => handleDeleteDocument(doc.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all" title="Delete"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {filteredDocs.map((doc) => (
               <div key={doc.id} className="p-6 bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-blue-100 rounded-[2rem] hover:shadow-premium transition-all group flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => toggleStar(doc.id)} className={`transition-all ${doc.isStarred ? 'text-amber-500' : 'text-slate-200 hover:text-amber-500'}`}>
                        <Star size={20} fill={doc.isStarred ? 'currentColor' : 'none'} />
                      </button>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-inner flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {getFileIcon(doc.type)}
                  </div>
                  <h4 className="text-sm font-black text-slate-800 tracking-tight mb-1 truncate pr-6">{doc.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{doc.category}</p>
                  
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{doc.size}</span>
                     <div className="flex gap-1">
                        <button className="p-2 text-slate-300 hover:text-blue-500 transition-all" title="Download"><Download size={16} /></button>
                        <button onClick={() => handleEditDocument(doc)} className="p-2 text-slate-300 hover:text-amber-500 transition-all" title="Edit"><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteDocument(doc.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-all" title="Delete"><Trash2 size={16} /></button>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        )}
        
        {/* 📑 Premium Pagination */}
        <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             Indexing and secure hashing of {documents.length} objects verified
           </p>
           <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 transition-all">
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-xl">
                 <span className="text-xs font-black text-blue-600">1</span>
                 <span className="text-xs font-bold text-slate-300">/</span>
                 <span className="text-xs font-black text-slate-400">4</span>
              </div>
              <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 transition-all">
                <ChevronRight size={18} />
              </button>
           </div>
        </div>
      </div>

      {/* 📦 Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setUploadModalOpen(false)}></div>
          <div className="modal-glass w-full max-w-xl relative z-10 flex flex-col scale-in">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
               <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Stage Repository Upload</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure ingestion pipeline</p>
               </div>
               <button onClick={() => setUploadModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                 <X size={20} className="text-slate-400" />
               </button>
            </div>
            
            <div className="p-8 space-y-6">
               <div className="p-6 rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center gap-4 group">
                  <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-premium">
                     <UploadCloud size={32} />
                  </div>
                  <div className="text-center">
                     <p className="text-sm font-black text-slate-700 tracking-tight">Active Ingestion Ready</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Found {selectedFiles.length} objects for staging</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="form-label">Classification Domain</label>
                     <select className="form-input">
                        <option>Technical Manuals</option>
                        <option>Maintenance Protocol</option>
                        <option>Safety Data Sheets</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="form-label">Searchable Tags</label>
                     <input type="text" className="form-input" placeholder="e.g. #boiler, #calibration, #2024" />
                  </div>
                  <div className="space-y-2">
                     <label className="form-label">Description Context</label>
                     <textarea className="form-input min-h-[80px]" placeholder="Provide brief operational context for these files..."></textarea>
                  </div>
               </div>

               {uploading && (
                 <div className="space-y-2">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 w-2/3 rounded-full animate-pulse transition-all"></div>
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Uploading metadata hashes...</p>
                 </div>
               )}
            </div>

            <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
               <button onClick={() => setUploadModalOpen(false)} className="btn-secondary-premium">Cancel Staging</button>
               <button 
                 onClick={handleUploadSubmit}
                 disabled={uploading}
                 className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-blue-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
               >
                 {uploading ? 'Processing...' : 'Commit Upload'}
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AssetDocumentsPage;