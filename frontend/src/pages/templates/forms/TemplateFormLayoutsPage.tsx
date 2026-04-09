import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Upload, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Briefcase,
  Layers,
  Save,
  Trash2,
  AlertCircle
} from 'lucide-react';

const TemplateFormLayoutsPage: React.FC = () => {
  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* 👑 Hero Spotlight Section */}
      <section className="relative group overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-teal-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-10 sm:p-14">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Layouts • Advanced Forms</span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
                Architectural <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">Form Layouts</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80">
                Structural blueprints for multi-column and complex data entry interfaces. Designed for high-density information architecture.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         
         {/* 🧾 Multi-Column Profile Form */}
         <div className="lg:col-span-8 space-y-10">
            <div className="glass-card p-0 rounded-[2.5rem] shadow-premium overflow-hidden border-t-4 border-t-blue-500">
               <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-500 shadow-sm border border-slate-100">
                     <User size={24} />
                  </div>
                  <div>
                     <h2 className="text-xl font-black text-slate-800 tracking-tight">Organization Profile</h2>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Update company contact references</p>
                  </div>
               </div>
               
               <form className="p-10 space-y-8">
                  {/* Avatar Upload area */}
                  <div className="flex items-center gap-8">
                     <div className="relative group cursor-pointer w-24 h-24 rounded-[2rem] bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center hover:bg-blue-50 hover:border-blue-400 transition-all">
                        <Upload className="text-slate-400 group-hover:text-blue-500 transition-colors" size={28} />
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                           <User size={14} />
                        </div>
                     </div>
                     <div>
                        <h4 className="text-sm font-black text-slate-800 tracking-tight mb-2">Corporate Logo</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-xs leading-relaxed">JPG, GIF or PNG. Maximum file size 2MB. Dimensions 400x400px.</p>
                        <button type="button" className="mt-4 px-4 py-2 bg-white border border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all">Select Image</button>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                     <div className="sm:col-span-2">
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Legal Entity Name</label>
                        <div className="relative">
                           <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                           <input type="text" className="form-input pl-12" placeholder="e.g. Reksolindo Data Solutions Ltd." />
                        </div>
                     </div>
                     
                     <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Primary Email</label>
                        <div className="relative">
                           <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                           <input type="email" className="form-input pl-12" placeholder="contact@company.com" />
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Contact Number</label>
                        <div className="relative">
                           <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                           <input type="tel" className="form-input pl-12" placeholder="+62 811 0000 0000" />
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Industry Sector</label>
                        <div className="relative">
                           <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                           <select className="form-input pl-12 appearance-none">
                              <option>Engineering & Contracting</option>
                              <option>Software Operations</option>
                              <option>Manufacturing Logistics</option>
                           </select>
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Company Website</label>
                        <div className="relative">
                           <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                           <input type="url" className="form-input pl-12" placeholder="https://" />
                        </div>
                     </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100">
                     <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-6">
                        <MapPin size={18} className="text-blue-500" /> HQ Address
                     </h3>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="sm:col-span-3">
                           <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Street Address</label>
                           <input type="text" className="form-input" placeholder="Building name, street number..." />
                        </div>
                        <div>
                           <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">City</label>
                           <input type="text" className="form-input" placeholder="Jakarta" />
                        </div>
                        <div>
                           <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">State / Province</label>
                           <input type="text" className="form-input" placeholder="DKI Jakarta" />
                        </div>
                        <div>
                           <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Postal Code</label>
                           <input type="text" className="form-input" placeholder="10000" />
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex items-center justify-end gap-4 pt-8 border-t border-slate-100">
                     <button type="button" className="px-6 py-3 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl font-black text-xs uppercase tracking-widest hover:border-slate-300 transition-all flex items-center gap-2">
                        <Trash2 size={16} /> Discard
                     </button>
                     <button type="button" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
                        <Save size={16} /> Save Changes
                     </button>
                  </div>
               </form>
            </div>
         </div>

         {/* 📌 Side Panel Actions & Settings */}
         <div className="lg:col-span-4 space-y-8">
            <div className="glass-card p-8 rounded-[2.5rem] shadow-premium">
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-500 flex items-center justify-center">
                     <Layers size={20} />
                  </div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Visibility Settings</h3>
               </div>
               
               <div className="space-y-6">
                  <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex items-start gap-4 cursor-pointer hover:border-teal-300 hover:bg-teal-50 transition-all group">
                     <div className="mt-0.5">
                        <input type="radio" name="visibility" className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate-300" defaultChecked />
                     </div>
                     <div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1 group-hover:text-teal-700">Public Profile</h4>
                        <p className="text-[10px] font-bold text-slate-400">Visible to all registered contractors and visitors.</p>
                     </div>
                  </div>
                  
                  <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex items-start gap-4 cursor-pointer hover:border-teal-300 hover:bg-teal-50 transition-all group">
                     <div className="mt-0.5">
                        <input type="radio" name="visibility" className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate-300" />
                     </div>
                     <div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1 group-hover:text-teal-700">Internal Division</h4>
                        <p className="text-[10px] font-bold text-slate-400">Restricted to internal management and verified personnel only.</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] shadow-premium bg-slate-900 text-white relative overflow-hidden">
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-teal-500/20 rounded-full blur-2xl"></div>
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                     <AlertCircle className="text-teal-400" size={24} />
                     <h3 className="text-sm font-black uppercase tracking-widest">Compliance Alert</h3>
                  </div>
                  <p className="text-xs font-medium text-slate-300 leading-relaxed mb-6 opacity-80">
                     Ensure all corporate entity details reflect the legal articles registered. False entries will result in automated system lockdown.
                  </p>
                  <button className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all backdrop-blur-md">Read Guidelines</button>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
};

export default TemplateFormLayoutsPage;
