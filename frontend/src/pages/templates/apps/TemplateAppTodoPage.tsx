import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Calendar, 
  User, 
  CheckCircle2, 
  Circle, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Flag,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const TemplateAppTodoPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Routines', icon: Flag, count: 12, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { id: 'active', label: 'In Progress', icon: Clock, count: 5, color: 'text-amber-500', bg: 'bg-amber-50' },
    { id: 'completed', label: 'Finalized', icon: CheckCircle2, count: 7, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'starred', label: 'Critical Path', icon: Star, count: 3, color: 'text-rose-500', bg: 'bg-rose-50' },
  ];

  const [todos, setTodos] = useState([
    { id: 'T-001', title: 'Asset Integrity Audit', description: 'Annual review of pressure vessel certifications.', category: 'active', priority: 'High', starred: true, dueDate: '2025-06-15', assignee: 'John Smith' },
    { id: 'T-002', title: 'System Patch Update', description: 'Apply pending security patches to core nodes.', category: 'completed', priority: 'Medium', starred: false, dueDate: '2025-06-12', assignee: 'Sarah Johnson' },
    { id: 'T-003', title: 'Resource Allocation', description: 'Optimize maintenance crew schedules for Q3.', category: 'active', priority: 'Medium', starred: false, dueDate: '2025-06-14', assignee: 'Mike Wilson' },
    { id: 'T-004', title: 'Emergency Drill', description: 'Quarterly safety and evacuation protocol test.', category: 'active', priority: 'High', starred: true, dueDate: '2025-06-16', assignee: 'John Smith' },
  ]);

  const toggleStar = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, starred: !t.starred } : t));
  };

  const toggleComplete = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, category: t.category === 'completed' ? 'active' : 'completed' } : t));
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-teal-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-10 sm:p-14">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
             <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Operations • Task Engine</span>
                </div>
                <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
                   Routine <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-300">Planner</span>
                </h1>
                <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80">
                   Orchestrate enterprise workflows and operational tasks. Manage priorities and track execution progress across departments seamlessly.
                </p>
                <div className="mt-10 flex flex-wrap gap-4">
                  <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                    <Plus size={18} strokeWidth={3} />
                    New Objective
                  </button>
                  <button className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white/20 transition-all">
                    System Audit
                  </button>
                </div>
             </div>
             
             <div className="hidden lg:grid grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-inner group-hover:-translate-y-2 transition-transform duration-500">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Execution Index</p>
                   <p className="text-4xl font-black text-white">94%</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-inner group-hover:-translate-y-2 transition-transform duration-500 delay-75">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Actions</p>
                   <p className="text-4xl font-black text-indigo-400">12</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 🚀 Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar - Category Filter */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-card p-6 rounded-[2.5rem] shadow-premium border border-white/40">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-2">Task Collections</h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button 
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeCategory === cat.id ? 'bg-slate-900 text-white shadow-xl translate-x-1' : 'hover:bg-slate-50 text-slate-600'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeCategory === cat.id ? 'bg-white/10 text-white' : `${cat.bg} ${cat.color}`}`}>
                      <cat.icon size={18} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider">{cat.label}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${activeCategory === cat.id ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-400'}`}>{cat.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] bg-indigo-600 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
            <div className="relative z-10">
              <h4 className="text-sm font-black mb-1">Weekly Target</h4>
              <p className="text-[10px] uppercase font-bold text-white/60 tracking-widest mb-6">Execution Velocity</p>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-black">72%</span>
                <span className="text-[10px] font-bold opacity-60">8/12 Fixed</span>
              </div>
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[72%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Task List Main */}
        <div className="lg:col-span-9 space-y-6">
           <div className="glass-card p-4 rounded-[2rem] shadow-premium flex flex-col md:flex-row gap-4 items-center justify-between border border-white/40">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Filter routines by objective or ID..." 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                 <button className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-primary-500 hover:border-primary-200 transition-all">
                    <Filter size={18} />
                 </button>
                 <div className="h-8 w-[1px] bg-slate-100"></div>
                 <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-200 flex items-center gap-2">
                    <Plus size={16} /> New Entry
                 </button>
              </div>
           </div>

           <div className="space-y-4">
              {todos.map((todo) => (
                <div 
                  key={todo.id} 
                  className={`glass-card p-6 rounded-[2.5rem] shadow-premium border border-white/40 transition-all group hover:scale-[1.01] ${todo.category === 'completed' ? 'opacity-60 grayscale-[0.5]' : ''}`}
                >
                  <div className="flex items-start gap-6">
                    <button 
                      onClick={() => toggleComplete(todo.id)}
                      className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${todo.category === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 hover:border-emerald-400'}`}
                    >
                      {todo.category === 'completed' && <CheckCircle2 size={16} />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className={`text-base font-black tracking-tight ${todo.category === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>{todo.title}</h4>
                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                          todo.priority === 'High' ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>{todo.priority}</span>
                      </div>
                      <p className={`text-xs font-medium leading-relaxed mb-6 ${todo.category === 'completed' ? 'text-slate-400' : 'text-slate-500'}`}>{todo.description}</p>
                      <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2 text-slate-400">
                           <Calendar size={14} className="text-slate-300" />
                           <span className="text-[10px] font-black uppercase tracking-widest">{todo.dueDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                           <User size={14} className="text-slate-300" />
                           <span className="text-[10px] font-black uppercase tracking-widest">{todo.assignee}</span>
                        </div>
                        <div className="flex items-center gap-1.5 ml-auto">
                           <button 
                             onClick={() => toggleStar(todo.id)}
                             className={`p-2 rounded-lg transition-all ${todo.starred ? 'bg-amber-50 text-amber-500 shadow-sm shadow-amber-100' : 'text-slate-300 hover:text-amber-500'}`}
                           >
                             <Star size={18} fill={todo.starred ? "currentColor" : "none"} />
                           </button>
                           <button className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-slate-50 rounded-lg transition-all"><Edit2 size={18} /></button>
                           <button className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={18} /></button>
                           <button className="p-2 text-slate-300 hover:text-slate-600 rounded-lg transition-all"><MoreVertical size={18} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
           </div>

           <div className="flex items-center justify-center gap-2 py-8">
              <button className="p-3 rounded-2xl border border-slate-100 text-slate-400 hover:bg-white hover:shadow-md transition-all"><ChevronLeft size={20} /></button>
              <div className="flex bg-white p-1.5 rounded-[1.5rem] shadow-premium border border-slate-100 items-center gap-1">
                <button className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-xs">1</button>
                <button className="w-10 h-10 rounded-xl text-slate-400 hover:bg-slate-50 font-black text-xs">2</button>
                <button className="w-10 h-10 rounded-xl text-slate-400 hover:bg-slate-50 font-black text-xs">3</button>
              </div>
              <button className="p-3 rounded-2xl border border-slate-100 text-slate-400 hover:bg-white hover:shadow-md transition-all"><ChevronRight size={20} /></button>
           </div>
        </div>

      </div>

    </div>
  );
};

export default TemplateAppTodoPage;