import React, { useState } from 'react';
import { 
  Search,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  Check,
  CreditCard,
  Building,
  User,
  Phone,
  Calendar,
  DollarSign,
  AlertCircle,
  Link,
  MapPin,
  FileText
} from 'lucide-react';

const TemplateFormElementsPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [toggleActive, setToggleActive] = useState(false);
  const [radioValue, setRadioValue] = useState('personal');
  const [checkboxValues, setCheckboxValues] = useState({ updates: true, offers: false });

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* 👑 Hero Spotlight Section */}
      <section className="relative group overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-violet-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10 p-10 sm:p-14">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Design System • Forms</span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
                Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-300">Input Elements</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80">
                A comprehensive collection of highly polished, accessible, and responsive form components powered by pure Tailwind CSS and Lucide Icons.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 📝 Input Fields */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="glass-card p-8 rounded-[2.5rem] shadow-premium">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-8">Standard Text Inputs</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Default Input</label>
              <input type="text" placeholder="Enter your full name" className="form-input" />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">With Helper Text</label>
              <input type="text" placeholder="username" className="form-input" />
              <p className="text-[10px] font-bold text-slate-400 mt-2">Only letters and numbers are allowed.</p>
            </div>

            <div>
              <label className="block text-xs font-black text-rose-500 uppercase tracking-widest mb-2">Error State</label>
              <input type="email" defaultValue="invalid-email@" className="form-input !border-rose-300 focus:!ring-rose-500/20 focus:!border-rose-500 text-rose-600" />
              <div className="flex items-center gap-1.5 mt-2 text-rose-500 text-[10px] font-bold">
                <AlertCircle size={12} /> Please enter a valid email address.
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Disabled State</label>
              <input type="text" disabled defaultValue="Not editable" className="form-input bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed" />
            </div>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2.5rem] shadow-premium">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-8">Inputs with Adornments</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Left Icon</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input type="email" placeholder="Email address" className="form-input pl-11" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Password with Toggle</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input type={showPassword ? 'text' : 'password'} placeholder="Password" className="form-input pl-11 pr-11" />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Prefix & Suffix</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-500 font-bold text-sm">https://</span>
                <input type="text" placeholder="example" className="form-input pl-20 pr-12" />
                <span className="absolute right-4 text-slate-500 font-bold text-sm">.com</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Search Bar</label>
              <div className="relative">
                <input type="text" placeholder="Search for anything..." className="form-input pr-12 rounded-full !py-3 bg-slate-50 border-transparent focus:bg-white" />
                <button className="absolute inset-y-1.5 right-1.5 w-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors">
                  <Search size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* 🔘 Controls & Selects */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Checkboxes & Radios */}
        <div className="glass-card p-8 rounded-[2.5rem] shadow-premium lg:col-span-1 border-t-4 border-t-violet-500">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-8">Selection Controls</h2>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Checkboxes</h3>
              
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" className="peer sr-only" checked={checkboxValues.updates} onChange={(e) => setCheckboxValues({...checkboxValues, updates: e.target.checked})} />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded-md peer-checked:border-indigo-600 peer-checked:bg-indigo-600 transition-all group-hover:border-indigo-400"></div>
                  <Check size={14} strokeWidth={3} className="absolute text-white scale-0 peer-checked:scale-100 transition-transform duration-300" />
                </div>
                <span className="text-sm font-bold text-slate-700 select-none">Subscribe to updates</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" className="peer sr-only" checked={checkboxValues.offers} onChange={(e) => setCheckboxValues({...checkboxValues, offers: e.target.checked})} />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded-md peer-checked:border-indigo-600 peer-checked:bg-indigo-600 transition-all group-hover:border-indigo-400"></div>
                  <Check size={14} strokeWidth={3} className="absolute text-white scale-0 peer-checked:scale-100 transition-transform duration-300" />
                </div>
                <span className="text-sm font-bold text-slate-700 select-none">Receive special offers</span>
              </label>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Toggle Switch</h3>
              
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-bold text-slate-700 select-none">Two-Factor Authentication</span>
                <div className="relative">
                  <input type="checkbox" className="peer sr-only" checked={toggleActive} onChange={() => setToggleActive(!toggleActive)} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Fancy Radio Selectors */}
        <div className="glass-card p-8 rounded-[2.5rem] shadow-premium lg:col-span-2">
           <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-8">Premium Radio Cards</h2>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                 { id: 'personal', title: 'Personal Account', desc: 'For individuals and freelancers', icon: User, color: 'text-violet-500', bg: 'bg-violet-50' },
                 { id: 'business', title: 'Business Account', desc: 'For companies and teams', icon: Building, color: 'text-indigo-500', bg: 'bg-indigo-50' }
              ].map((opt) => (
                 <label 
                   key={opt.id} 
                   className={`relative p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 ${radioValue === opt.id ? 'border-indigo-600 bg-indigo-50/50 shadow-soft' : 'border-slate-100 hover:border-slate-300 bg-white'}`}
                 >
                    <input type="radio" name="account_type" value={opt.id} checked={radioValue === opt.id} onChange={(e) => setRadioValue(e.target.value)} className="sr-only" />
                    <div className="flex items-start gap-4">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${opt.bg} ${opt.color}`}>
                          <opt.icon size={24} />
                       </div>
                       <div className="flex-1">
                          <h4 className="text-sm font-black text-slate-800 mb-1">{opt.title}</h4>
                          <p className="text-xs font-bold text-slate-500">{opt.desc}</p>
                       </div>
                       <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${radioValue === opt.id ? 'border-indigo-600' : 'border-slate-300'}`}>
                          {radioValue === opt.id && <div className="w-3 h-3 rounded-full bg-indigo-600"></div>}
                       </div>
                    </div>
                 </label>
              ))}
           </div>

           <div className="mt-8 space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Dropdowns</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Standard Select</label>
                    <div className="relative">
                       <select className="form-input appearance-none pr-10">
                          <option>Select an option</option>
                          <option>United States</option>
                          <option>United Kingdom</option>
                          <option>Indonesia</option>
                       </select>
                       <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
                          <ChevronDown size={18} />
                       </div>
                    </div>
                 </div>
                 
                 <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Icon Select</label>
                    <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-indigo-500">
                          <Globe size={18} />
                       </div>
                       <select className="form-input appearance-none pl-11 pr-10">
                          <option>Global Region</option>
                          <option>APAC</option>
                          <option>EMEA</option>
                          <option>NA</option>
                       </select>
                       <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
                          <ChevronDown size={18} />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 🚀 Advanced Elements */}
      <section className="glass-card p-8 sm:p-12 rounded-[3.5rem] shadow-premium relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 rounded-full blur-[80px] -z-10"></div>
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-8">Complex Form Layout</h2>
        
        <form className="space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                 <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Full Name</label>
                    <input type="text" className="form-input" placeholder="John Doe" />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Phone</label>
                       <div className="relative">
                          <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="tel" className="form-input pl-11" placeholder="+1 (555) 000-0000" />
                       </div>
                    </div>
                    <div>
                       <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">DOB</label>
                       <div className="relative">
                          <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="date" className="form-input pl-11 text-slate-500 font-bold" />
                       </div>
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Bio / Description</label>
                    <textarea 
                      className="form-input min-h-[120px] resize-none" 
                      placeholder="Tell us a little about yourself..."
                    ></textarea>
                 </div>
              </div>

              <div className="space-y-6 p-6 sm:p-8 rounded-[2rem] bg-slate-50 border border-slate-100">
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <CreditCard size={18} className="text-indigo-500" /> Payment Details
                 </h3>
                 
                 <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Card Number</label>
                    <div className="relative">
                       <CreditCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input type="text" className="form-input pl-11 tracking-widest font-mono" placeholder="0000 0000 0000 0000" />
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Expiry Date</label>
                       <input type="text" className="form-input text-center placeholder:text-slate-300 font-mono tracking-widest" placeholder="MM/YY" />
                    </div>
                    <div>
                       <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">CVC</label>
                       <div className="relative">
                          <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                          <input type="text" className="form-input font-mono tracking-widest" placeholder="123" />
                       </div>
                    </div>
                 </div>

                 <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between">
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Amount</p>
                       <p className="text-2xl font-black text-slate-800">$129.00</p>
                    </div>
                    <button type="button" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-200 active:scale-95">
                       Complete Payment
                    </button>
                 </div>
              </div>
           </div>
        </form>
      </section>

    </div>
  );
};

// Extracted a simple globe icon since it wasn't imported from lucide
const Globe = ({ size, className }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

export default TemplateFormElementsPage;