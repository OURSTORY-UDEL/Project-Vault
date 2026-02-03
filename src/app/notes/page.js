"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Save, Plus, Trash2, Copy, 
  Search, Sparkles, BrainCircuit, Edit3, Eye, X 
} from "lucide-react";

export default function NotesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  
  // State untuk Edit & View
  const [editingId, setEditingId] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null); // Untuk pop-up detail

  const [formData, setFormData] = useState({ title: "", content: "", category: "prompt" });

  useEffect(() => { fetchNotes(); }, []);

  async function fetchNotes() {
    const { data } = await supabase.from('notes').select('*').order('id', { ascending: false });
    setNotes(data || []);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (editingId) {
      // --- MODE UPDATE ---
      const { error } = await supabase
        .from('notes')
        .update(formData)
        .eq('id', editingId);

      if (!error) {
        toast.success("Catatan berhasil diupdate!");
        setEditingId(null);
        setFormData({ title: "", content: "", category: "prompt" });
        fetchNotes();
      } else {
        toast.error("Gagal update.");
      }
    } else {
      // --- MODE CREATE ---
      const { error } = await supabase.from('notes').insert([formData]);
      
      if (!error) {
        toast.custom((t) => (
          <div className="bg-neutral-900 border border-emerald-500/30 text-white p-4 rounded-xl flex items-center gap-3 shadow-2xl">
            <BrainCircuit className="text-emerald-500" size={20} />
            <div><p className="font-bold text-sm">Tersimpan!</p></div>
          </div>
        ));
        setFormData({ title: "", content: "", category: "prompt" });
        fetchNotes();
      } else {
        toast.error("Gagal menyimpan.");
      }
    }
    setLoading(false);
  };

  const handleEdit = (note) => {
    setEditingId(note.id);
    setFormData({ 
      title: note.title, 
      content: note.content, 
      category: note.category 
    });
    // Scroll ke form di atas (untuk mobile/desktop)
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info("Mode Edit Aktif");
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus catatan ini?")) return;
    await supabase.from('notes').delete().eq('id', id);
    fetchNotes();
    if (editingId === id) resetForm();
    toast.success("Dihapus.");
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: "", content: "", category: "prompt" });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Teks disalin ke clipboard!");
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30">
      <Toaster position="top-center" />
      
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
        
        {/* --- LEFT COL: FORM INPUT --- */}
        <div className="lg:col-span-4">
          <motion.div 
            initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className={`sticky top-24 border rounded-3xl p-6 shadow-2xl transition-colors duration-300 ${editingId ? 'bg-emerald-900/10 border-emerald-500/50' : 'bg-[#050505] border-white/10'}`}
          >
            <h2 className="text-xl font-bold mb-1 text-white flex items-center gap-2">
              {editingId ? (
                <Edit3 className="bg-yellow-500 text-black rounded-full p-1 w-6 h-6"/> 
              ) : (
                <Plus className="bg-emerald-600 rounded-full p-1 w-6 h-6"/> 
              )}
              {editingId ? "Edit Catatan" : "Simpan Prompt"}
            </h2>
            <p className="text-neutral-500 text-xs mb-6">
              {editingId ? "Sedang mengedit data..." : "Simpan prompt AI atau catatan codingmu disini."}
            </p>

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
                className={`w-full py-3 font-bold rounded-xl transition flex justify-center items-center gap-2 ${editingId ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-white text-black hover:bg-neutral-200'}`}
              >
                {loading ? "Memproses..." : (editingId ? <><Save size={18}/> Update Note</> : <><Save size={18}/> Simpan ke Vault</>)}
              </button>
              
              {editingId && (
                <button 
                  type="button" onClick={resetForm}
                  className="w-full py-2 text-xs text-neutral-500 hover:text-white transition"
                >
                  Batal Edit
                </button>
              )}
            </form>
          </motion.div>
        </div>

        {/* --- RIGHT COL: LIST NOTES --- */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative">
             <Search className="absolute left-4 top-3.5 text-neutral-500" size={16} />
             <input 
               type="text" placeholder="Cari prompt..." value={search} onChange={(e) => setSearch(e.target.value)}
               className="w-full bg-neutral-900/30 border border-white/5 rounded-full pl-12 pr-6 py-3 text-sm focus:border-emerald-500 outline-none transition backdrop-blur-sm"
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes.length === 0 ? (
               <div className="col-span-2 text-center py-20 text-neutral-600 border border-dashed border-neutral-800 rounded-3xl">Tidak ada catatan.</div>
            ) : (
              filteredNotes.map((note, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  key={note.id}
                  className={`group bg-[#0a0a0a] border rounded-2xl p-5 flex flex-col justify-between transition-all hover:-translate-y-1 ${editingId === note.id ? 'border-emerald-500 bg-emerald-900/10' : 'border-white/5 hover:border-emerald-500/30'}`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${note.category === 'prompt' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                        {note.category}
                      </span>
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(note)} className="p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded transition" title="Edit">
                          <Edit3 size={14}/>
                        </button>
                        <button onClick={() => handleDelete(note.id)} className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-900/20 rounded transition" title="Hapus">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>
                    <h3 className="font-bold text-white mb-2 line-clamp-1">{note.title}</h3>
                    
                    {/* Area Konten (Klik untuk baca selengkapnya) */}
                    <div 
                      onClick={() => setSelectedNote(note)}
                      className="bg-neutral-900 rounded-lg p-3 border border-neutral-800 relative group/code cursor-pointer hover:border-emerald-500/50 transition"
                    >
                      <p className="font-mono text-xs text-neutral-400 line-clamp-4 break-words">
                        {note.content}
                      </p>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/code:opacity-100 transition bg-black/50 backdrop-blur-[1px] rounded-lg">
                        <span className="text-xs font-bold text-white flex items-center gap-1"><Eye size={12}/> Baca Full</span>
                      </div>
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

      {/* --- MODAL POP UP DETAIL --- */}
      <AnimatePresence>
        {selectedNote && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedNote(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0a0a] w-full max-w-2xl max-h-[80vh] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
                <div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border mb-2 inline-block ${selectedNote.category === 'prompt' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                    {selectedNote.category}
                  </span>
                  <h3 className="text-xl font-bold text-white">{selectedNote.title}</h3>
                </div>
                <button onClick={() => setSelectedNote(null)} className="p-2 hover:bg-white/10 rounded-full transition text-neutral-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar bg-[#050505]">
                <pre className="font-mono text-sm text-neutral-300 whitespace-pre-wrap break-words leading-relaxed">
                  {selectedNote.content}
                </pre>
              </div>

              <div className="p-4 border-t border-white/5 bg-black/50 flex justify-end gap-3">
                 <button 
                   onClick={() => { handleEdit(selectedNote); setSelectedNote(null); }}
                   className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white transition flex items-center gap-2"
                 >
                   <Edit3 size={14}/> Edit
                 </button>
                 <button 
                   onClick={() => copyToClipboard(selectedNote.content)}
                   className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition flex items-center gap-2"
                 >
                   <Copy size={14}/> Copy All
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}