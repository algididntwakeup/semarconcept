import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Eye, 
  Edit3, 
  Clock, 
  CheckCircle2, 
  Folder,
  Tag,
  Filter
} from 'lucide-react';

interface ContentEntry {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  publishedDate: string;
  status: 'Published' | 'Draft' | 'Archived';
  views: number;
}

const mockEntries: ContentEntry[] = [
  {
    id: '1',
    title: 'Standard Operating Procedure: Hydrotreater Startup Checklist',
    slug: 'sop-hydrotreater-startup',
    category: 'Operational Procedures',
    author: 'Chief Process Engineer',
    publishedDate: '2026-08-10',
    status: 'Published',
    views: 342
  },
  {
    id: '2',
    title: 'Corrosion Management Guidelines under API RP 571',
    slug: 'api-571-corrosion-guidelines',
    category: 'Integrity Guidelines',
    author: 'Materials & Corrosion Specialist',
    publishedDate: '2026-07-25',
    status: 'Published',
    views: 890
  },
  {
    id: '3',
    title: 'Emergency Shutdown Protocol: Hydrogen Line Leak Mitigation',
    slug: 'emergency-shutdown-h2-leak',
    category: 'Safety & Emergency',
    author: 'HSE Manager',
    publishedDate: '2026-08-01',
    status: 'Published',
    views: 520
  },
  {
    id: '4',
    title: 'Turnaround 2027 Pre-Commissioning Work Package',
    slug: 'ta-2027-work-package',
    category: 'Turnaround Planning',
    author: 'Maintenance Superintendent',
    publishedDate: '2026-08-18',
    status: 'Draft',
    views: 45
  }
];

const ContentEntriesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filtered = mockEntries.filter(item => {
    const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        item.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-primary-600" />
            Knowledge Base & Content Entries
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Pusat dokumentasi teknik, SOP, panduan integritas aset dan knowledge repository.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-primary-500/20 active:scale-95 transition-all">
          <Plus className="w-4 h-4" /> Create New Article
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Articles</p>
          <p className="text-3xl font-black text-slate-800 mt-1">{mockEntries.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Indexed documentation</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Published</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">{mockEntries.filter(i => i.status === 'Published').length}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Active & accessible</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Drafts</p>
          <p className="text-3xl font-black text-amber-600 mt-1">{mockEntries.filter(i => i.status === 'Draft').length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Work-in-progress</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Read Views</p>
          <p className="text-3xl font-black text-blue-600 mt-1">1,797</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Across engineering teams</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search article, SOP or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Operational Procedures">Operational Procedures</option>
            <option value="Integrity Guidelines">Integrity Guidelines</option>
            <option value="Safety & Emergency">Safety & Emergency</option>
            <option value="Turnaround Planning">Turnaround Planning</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Title & Slug</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Author</th>
                <th className="px-5 py-3.5">Published Date</th>
                <th className="px-5 py-3.5">Views</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-4 max-w-sm">
                    <p className="font-bold text-slate-800 hover:text-primary-600 cursor-pointer">{row.title}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">/{row.slug}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {row.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-700 font-medium">
                    {row.author}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {row.publishedDate}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-700 font-mono">
                    {row.views.toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      row.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary-600 transition-colors" title="Read Article">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors" title="Edit Article">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContentEntriesPage;
