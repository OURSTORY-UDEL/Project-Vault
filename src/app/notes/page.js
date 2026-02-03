"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Save, Plus, Trash2, Copy, 
  Search, FileText, Sparkles, BrainCircuit 
} from "lucide-react";

export default function NotesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  
  const [formData, setFormData] = useState({ title: "", content: "", category: "prompt" });

  useEffect(() => { fetchNotes(); }, []);

  async function fetchNotes() {
    const { data } = await supabase.from('notes').select('*').order('id', { ascending: false });
    setNotes(data || []);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('notes').insert([formData]);
    
    if (!error) {
      toast.custom((t) => (
        <div className="bg-neutral-900 border border-emerald-500/30 text-white p-4 rounded-xl flex items-center gap-3 shadow-2xl">
          <BrainCircuit className="text-emerald-500" size={20} />
          <div><p className="font-bold text-sm">Tersimpan!</p></div>
        </div>
      ));
      setFormData({ title: "", content: "", category: "prompt" }); // Reset form
      fetchNotes();
    } else {
      toast.error("Gagal menyimpan.");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus catatan ini?")) return;
    await supabase.from('notes').delete().eq('id', id);
    fetchNotes();
    toast.success("Dihapus.");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Teks disalin ke clipboard!");
  };

  // Filter search
  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30">
      <Toaster position="top-center" />
      
      {/* Background Ambience (Emerald Theme) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      {/* Navbar */}
      <div className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="flex items-center gap-2 text-neutral-400 hover:text-white transition">
            <ArrowLeft size={18} /> <span className="text-sm font-medium">Back to Home</span>
          </button>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-emerald-400">
            <Sparkles size={12} /> <span>PROMPT_VAULT</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* --- LEFT COL: FORM INPUT (Sticky) --- */}
        <div className="lg:col-span-4">
          <motion.div 
            initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className="sticky top-24 bg-[#050505] border border-white/10 rounded-3xl p-6 shadow-2xl"
          >
            <h2 className="text-xl font-bold mb-1 text-white flex items-center gap-2">
              <Plus className="bg-emerald-600 rounded-full p-1 w-6 h-6"/> Simpan Prompt
            </h2>
            <p className="text-neutral-500 text-xs mb-6">Simpan prompt AI atau catatan codingmu disini.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Judul (Misal: Prompt Midjourney Logo)"
                  required
                  className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl p-3 text-sm focus:border-emerald-500 outline-none transition"
                />
              </div>
              <div>
                 <div className="flex gap-2 mb-2">
                    {['prompt', 'note'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({...formData, category: type})}
                        className={`text-[10px] uppercase font-bold px-3 py-1 rounded-md border transition ${formData.category === type ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-neutral-800 text-neutral-500'}`}
                      >
                        {type}
                      </button>
                    ))}
                 </div>
                <textarea 
                  value={formData.content} 
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Paste prompt atau catatanmu disini..."
                  required
                  rows={10}
                  className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl p-3 text-sm font-mono text-neutral-300 focus:border-emerald-500 outline-none transition resize-none custom-scrollbar"
                />
              </div>
              <button 
                type="submit" disabled={loading}
                className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition flex justify-center items-center gap-2"
              >
                {loading ? "Menyimpan..." : <><Save size={18}/> Simpan ke Vault</>}
              </button>
            </form>
          </motion.div>
        </div>

        {/* --- RIGHT COL: LIST NOTES --- */}
        <div className="lg:col-span-8 space-y-6">
          {/* Search Bar */}
          <div className="relative">
             <Search className="absolute left-4 top-3.5 text-neutral-500" size={16} />
             <input 
               type="text" 
               placeholder="Cari prompt..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full bg-neutral-900/30 border border-white/5 rounded-full pl-12 pr-6 py-3 text-sm focus:border-emerald-500 outline-none transition backdrop-blur-sm"
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes.length === 0 ? (
               <div className="col-span-2 text-center py-20 text-neutral-600 border border-dashed border-neutral-800 rounded-3xl">
                 Tidak ada catatan.
               </div>
            ) : (
              filteredNotes.map((note, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  key={note.id}
                  className="group bg-[#0a0a0a] border border-white/5 hover:border-emerald-500/30 rounded-2xl p-5 flex flex-col justify-between transition-all hover:-translate-y-1"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${note.category === 'prompt' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                        {note.category}
                      </span>
                      <button onClick={() => handleDelete(note.id)} className="text-neutral-600 hover:text-red-500 transition"><Trash2 size={14}/></button>
                    </div>
                    <h3 className="font-bold text-white mb-2 line-clamp-1">{note.title}</h3>
                    <div className="bg-neutral-900 rounded-lg p-3 border border-neutral-800 relative group/code">
                      <p className="font-mono text-xs text-neutral-400 line-clamp-4 break-words">
                        {note.content}
                      </p>
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent opacity-50 pointer-events-none"/>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => copyToClipboard(note.content)}
                    className="mt-4 w-full py-2 bg-neutral-800 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-medium text-neutral-400 transition flex items-center justify-center gap-2"
                  >
                    <Copy size={14} /> Copy Full Text
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}