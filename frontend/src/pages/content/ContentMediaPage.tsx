// platform/frontend-mui/src/pages/content/ContentMediaPage.tsx
import React, { useState } from 'react';
import { 
  Upload, 
  Trash2, 
  Edit2, 
  Download, 
  Share2, 
  Folder, 
  Image as ImageIcon, 
  Video, 
  Music, 
  FileText, 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Plus, 
  MoreVertical, 
  CloudUpload, 
  Eye,
  ChevronLeft,
  ChevronRight,
  History,
  Activity,
  Shield,
  Layers
} from 'lucide-react';

interface MediaFile {
  id: string;
  name: string;
  originalName: string;
  type: 'image' | 'video' | 'audio' | 'document';
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
  tags: string[];
  folder?: string;
  isPublic: boolean;
  downloads: number;
}

interface MediaFolder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: string;
  fileCount: number;
}

const ContentMediaPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  const folders: MediaFolder[] = [
    { id: '1', name: 'Asset Photos', createdAt: '2025-01-01', fileCount: 15 },
    { id: '2', name: 'Documentation', createdAt: '2025-01-05', fileCount: 8 },
    { id: '3', name: 'Training Videos', createdAt: '2025-01-10', fileCount: 5 }
  ];

  const mediaFiles: MediaFile[] = [
    {
      id: '1',
      name: 'pump-a101-front-view.jpg',
      originalName: 'Pump A101 Front View.jpg',
      type: 'image',
      mimeType: 'image/jpeg',
      size: 1024576,
      url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=400&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=400&q=80',
      uploadedBy: 'John Smith',
      uploadedAt: '2025-01-15',
      description: 'Front view photograph of Pump A-101 for inspection records',
      tags: ['pump', 'inspection', 'equipment'],
      folder: '1',
      isPublic: true,
      downloads: 12
    },
    {
      id: '2',
      name: 'maintenance-manual-v2.pdf',
      originalName: 'Maintenance Manual v2.0.pdf',
      type: 'document',
      mimeType: 'application/pdf',
      size: 5242880,
      url: '#',
      uploadedBy: 'Sarah Johnson',
      uploadedAt: '2025-01-10',
      description: 'Updated maintenance manual for all pump equipment',
      tags: ['manual', 'maintenance', 'documentation'],
      folder: '2',
      isPublic: false,
      downloads: 45
    },
    {
      id: '3',
      name: 'safety-training-intro.mp4',
      originalName: 'Safety Training Introduction.mp4',
      type: 'video',
      mimeType: 'video/mp4',
      size: 52428800,
      url: '#',
      uploadedBy: 'Mike Davis',
      uploadedAt: '2025-01-08',
      description: 'Introduction video for new employee safety training',
      tags: ['training', 'safety', 'video'],
      folder: '3',
      isPublic: true,
      downloads: 28
    }
  ];

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || file.type === filterType;
    const matchesFolder = currentFolder ? file.folder === currentFolder : true;
    return matchesSearch && matchesType && matchesFolder;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: MediaFile['type']) => {
    switch (type) {
      case 'image': return <ImageIcon size={24} />;
      case 'video': return <Video size={24} />;
      case 'audio': return <Music size={24} />;
      default: return <FileText size={24} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 font-sans">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Assets • Cloud Infrastructure</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight font-sans">
                Media <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">Vault</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80 mb-8 font-sans">
                The definitive repository for your industrial intelligence. Securely store, manage, and distribute mission-critical visual assets and documentation across your operation.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  <Upload size={16} strokeWidth={3} />
                  Upload Assets
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                  <Folder size={16} />
                   New Folder
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-inner min-w-[320px]">
               {[
                 { label: 'Total Objects', value: '1,248', color: 'text-purple-400' },
                 { label: 'Storage Used', value: '4.2 TB', color: 'text-pink-400' },
                 { label: 'Public Link', value: '256', color: 'text-indigo-400' },
                 { label: 'Bandwidth', value: '1.2 GB', color: 'text-emerald-400' },
               ].map((s, i) => (
                 <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                   <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* 🛠️ Modern Toolbar */}
      <section className="glass-card p-4 rounded-[2rem] shadow-premium flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search vault identifiers, tags, or authors..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={18} />
            </button>
          </div>
          <div className="h-8 w-[1px] bg-slate-100 mx-1"></div>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-500 focus:outline-none cursor-pointer"
          >
            <option value="all">Global Types</option>
            <option value="image">Imagery</option>
            <option value="video">Motion</option>
            <option value="document">Schematics</option>
          </select>
        </div>
      </section>

      {/* 📁 Folder Navigator */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {folders.map(folder => (
          <button 
            key={folder.id}
            onClick={() => setCurrentFolder(folder.id)}
            className={`glass-card p-6 rounded-[2rem] shadow-premium hover:shadow-2xl transition-all border border-white/40 group text-left ${currentFolder === folder.id ? 'ring-2 ring-purple-500' : ''}`}
          >
             <div className="flex justify-between items-start mb-4">
               <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 group-hover:scale-110 transition-transform shadow-inner">
                  <Folder size={24} />
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{folder.fileCount} Objects</span>
                 <MoreVertical size={16} className="text-slate-300" />
               </div>
             </div>
             <h3 className="text-lg font-black text-slate-800 tracking-tight mb-1">{folder.name}</h3>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Archived {folder.createdAt}</p>
          </button>
        ))}
      </section>

      {/* 📦 Media Gallery */}
      <div className="glass-card overflow-hidden rounded-[2.5rem] shadow-premium border border-white/40 min-h-[400px]">
        {viewMode === 'grid' ? (
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredFiles.map(file => (
              <div key={file.id} className="group relative">
                <div className="aspect-square rounded-[2rem] overflow-hidden bg-slate-100 border border-slate-200 relative">
                  {file.thumbnailUrl ? (
                    <img src={file.thumbnailUrl} alt={file.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button className="p-3 bg-white rounded-2xl text-slate-900 hover:scale-110 transition-transform shadow-xl">
                      <Eye size={20} />
                    </button>
                    <button className="p-3 bg-white rounded-2xl text-slate-900 hover:scale-110 transition-transform shadow-xl">
                      <Download size={20} />
                    </button>
                  </div>
                </div>
                <div className="mt-4 px-2">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-sm font-black text-slate-800 leading-tight truncate flex-1">{file.originalName}</p>
                    <button className="text-slate-300 hover:text-slate-600">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{formatFileSize(file.size)}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{file.uploadedAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Asset</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Metadata</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Protocol</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Author</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredFiles.map(file => (
                  <tr key={file.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner border border-slate-200">
                          {getFileIcon(file.type)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 leading-none mb-1">{file.originalName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{file.mimeType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-1">
                          {file.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-100 text-[8px] font-black text-slate-500 uppercase tracking-tighter">#{tag}</span>
                          ))}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatFileSize(file.size)}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${file.isPublic ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                        {file.isPublic ? 'Encrypted' : 'Vaulted'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-700 leading-none mb-1">{file.uploadedBy}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{file.uploadedAt}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 text-slate-300">
                         <button className="p-2 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all">
                           <Download size={18} />
                         </button>
                         <button className="p-2 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                           <MoreVertical size={18} />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 📑 Premium Pagination */}
        <div className="px-8 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             Vault Intelligence • Monitoring {filteredFiles.length} distributed objects
           </p>
           <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white transition-all"><ChevronLeft size={18} /></button>
              <div className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                 <span className="text-xs font-black text-purple-600">01</span>
                 <span className="text-xs font-bold text-slate-300">/</span>
                 <span className="text-xs font-black text-slate-400">01</span>
              </div>
              <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white transition-all"><ChevronRight size={18} /></button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ContentMediaPage;