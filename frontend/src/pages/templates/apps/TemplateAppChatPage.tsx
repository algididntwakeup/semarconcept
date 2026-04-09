import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Info, 
  Plus, 
  Paperclip, 
  Smile,
  Shield,
  MessageSquare,
  Users,
  Circle,
  X
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isMe: boolean;
}

interface User {
  id: string;
  name: string;
  status: 'online' | 'away' | 'offline';
  avatar: string;
}

const TemplateAppChatPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contacts = [
    { id: '1', name: 'John Smith', status: 'online', lastMessage: 'Hey, checking the status.', time: '10:30 AM', unread: 0 },
    { id: '2', name: 'Sarah Johnson', status: 'away', lastMessage: 'Meeting at 2 PM.', time: '9:45 AM', unread: 2 },
    { id: '3', name: 'Alex Wong', status: 'offline', lastMessage: 'The report is ready.', time: 'Yesterday', unread: 0 },
  ];

  const [activeContact, setActiveContact] = useState(contacts[0]);

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', senderId: '2', senderName: 'John Smith', content: 'Hey, any updates on the inspection?', timestamp: '10:00 AM', isMe: false },
    { id: '2', senderId: 'me', senderName: 'You', content: 'Almost done. Just finalizing the report.', timestamp: '10:05 AM', isMe: true },
    { id: '3', senderId: '2', senderName: 'John Smith', content: 'Perfect, send it over once ready.', timestamp: '10:10 AM', isMe: false },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: 'You',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    setMessages([...messages, msg]);
    setNewMessage('');
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col gap-6 animate-in fade-in duration-700">
      
      {/* 👑 Hero Welcome Section */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10 shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700/20 to-slate-900/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-4 group-hover:translate-x-1 transition-transform">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Communication Hub • Real-Time</span>
              </div>
              <h1 className="text-3xl font-black text-white mb-2 tracking-tighter">
                Secure <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-slate-300">Messaging</span>
              </h1>
              <p className="text-slate-400 font-medium text-sm leading-relaxed">
                Connect with your team instantly. Encrypted channels for secure asset reporting and operational coordination.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center min-w-[100px]">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Active</p>
                <p className="text-xl font-black text-indigo-400">12</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center min-w-[100px]">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Unread</p>
                <p className="text-xl font-black text-rose-400">3</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📑 Main Content */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        
        {/* Contacts Sidebar */}
        <div className="w-80 glass-card rounded-[2.5rem] shadow-premium border border-white/40 flex flex-col overflow-hidden">
           <div className="p-6 border-b border-slate-100">
             <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input 
                 type="text" 
                 placeholder="Search messages..." 
                 className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-medium"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
             {contacts.map((contact) => (
               <button 
                 key={contact.id}
                 onClick={() => setActiveContact(contact)}
                 className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${activeContact.id === contact.id ? 'bg-primary-500 text-white shadow-lg shadow-primary-200' : 'hover:bg-slate-50 text-slate-600'}`}
               >
                 <div className="relative shrink-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm border ${activeContact.id === contact.id ? 'bg-white/20 border-white/20' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                      {contact.name.charAt(0)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${activeContact.id === contact.id ? 'border-primary-500' : 'border-white'} ${contact.status === 'online' ? 'bg-emerald-500' : contact.status === 'away' ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                 </div>
                 <div className="flex-1 text-left overflow-hidden">
                   <div className="flex justify-between items-center mb-0.5">
                     <p className="text-xs font-black truncate">{contact.name}</p>
                     <span className={`text-[9px] font-bold ${activeContact.id === contact.id ? 'text-white/60' : 'text-slate-400'}`}>{contact.time}</span>
                   </div>
                   <p className={`text-[10px] font-medium truncate ${activeContact.id === contact.id ? 'text-white/80' : 'text-slate-400'}`}>{contact.lastMessage}</p>
                 </div>
                 {contact.unread > 0 && activeContact.id !== contact.id && (
                   <div className="w-5 h-5 rounded-lg bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                     {contact.unread}
                   </div>
                 )}
               </button>
             ))}
           </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 glass-card rounded-[2.5rem] shadow-premium border border-white/40 flex flex-col overflow-hidden">
          {/* Active Header */}
          <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-white/40 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                {activeContact.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1">{activeContact.name}</h3>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${activeContact.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeContact.status}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
               {[Phone, Video, Info, MoreVertical].map((Icon, i) => (
                 <button key={i} className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-all">
                   <Icon size={18} />
                 </button>
               ))}
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col no-scrollbar bg-slate-50/30">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[70%] space-y-1 ${m.isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                   {!m.isMe && <span className="text-[10px] font-bold text-slate-400 ml-4 mb-1">{m.senderName}</span>}
                   <div className={`px-5 py-3 rounded-3xl text-sm font-medium shadow-sm transition-all hover:scale-[1.01] ${m.isMe ? 'bg-primary-500 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'}`}>
                      {m.content}
                   </div>
                   <span className="text-[9px] font-bold text-slate-400">{m.timestamp}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 shrink-0 bg-white/40 backdrop-blur-md border-t border-slate-100">
            <div className="flex items-center gap-3 bg-white border border-slate-100 p-2 rounded-[2rem] shadow-sm focus-within:ring-4 focus-within:ring-primary-500/5 transition-all">
              <button className="p-2 text-slate-400 hover:text-primary-500 transition-colors">
                <Paperclip size={20} />
              </button>
              <input 
                type="text" 
                placeholder="Write your message..." 
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium px-2"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button className="p-2 text-slate-400 hover:text-amber-500 transition-colors">
                <Smile size={20} />
              </button>
              <button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all shadow-lg shadow-primary-200"
              >
                <Send size={18} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default TemplateAppChatPage;