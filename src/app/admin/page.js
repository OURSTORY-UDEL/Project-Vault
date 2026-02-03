"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion"; // Animasi magic
import { 
  ArrowLeft, Save, Plus, Trash2, Edit3, 
  Link as LinkIcon, Image as ImageIcon, Search, 
  LayoutGrid, Sparkles, X 
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null); 

  const initialForm = {
    title: "",
    description: "",
    link: "",
    preview_image: "",
    tags: "", 
    code_snippet: "",
    size: "small"
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => { fetchProjects(); }, []);

  async function fetchProjects() {
    setFetching(true);
    const { data, error } = await supabase.from('projects').select('*').order('id', { ascending: false });
    if (error) toast.error("Gagal load data database");
    else setProjects(data || []);
    setFetching(false);
  }

  const ensureHttps = (url) => {
    if (!url) return "";
    return url.match(/^https?:\/\//) ? url : `https://${url}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanData = {
        ...formData,
        link: ensureHttps(formData.link),
        preview_image: ensureHttps(formData.preview_image),
        tags: typeof formData.tags === 'string' ? formData.tags.split(",").map(t => t.trim()).filter(t => t) : formData.tags
      };

      let error;
      if (editingId) {
        const { error: err } = await supabase.from('projects').update(cleanData).eq('id', editingId);
        error = err;
        // Custom Pop-up Notification
        toast.custom((t) => (
          <div className="bg-neutral-900/90 backdrop-blur-md border border-yellow-500/30 text-white p-4 rounded-2xl shadow-[0_0_30px_-5px_rgba(234,179,8,0.3)] flex items-center gap-4">
            <div className="bg-yellow-500/20 p-2 rounded-full text-yellow-400"><Sparkles size={18}/></div>
            <div>
              <h3 className="font-bold text-sm">Data Updated!</h3>
              <p className="text-xs text-neutral-400">Project berhasil diperbarui dengan gaya.</p>
            </div>
          </div>
        ));
      } else {
        const { error: err } = await supabase.from('projects').insert([cleanData]);
        error = err;
        toast.custom((t) => (
          <div className="bg-neutral-900/90 backdrop-blur-md border border-purple-500/30 text-white p-4 rounded-2xl shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)] flex items-center gap-4">
            <div className="bg-purple-500/20 p-2 rounded-full text-purple-400"><Sparkles size={18}/></div>
            <div>
              <h3 className="font-bold text-sm">New Project Added!</h3>
              <p className="text-xs text-neutral-400">Satu lagi karya masterpiece tersimpan.</p>
            </div>
          </div>
        ));
      }

      if (error) throw error;
      fetchProjects();
      resetForm();
    } catch (error) {
      toast.error("Gagal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (project) => {
    setEditingId(project.id);
    setFormData({ ...project, tags: project.tags ? project.tags.join(", ") : "" });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus project ini selamanya?")) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (!error) {
      toast.success("Project dihapus dari existence.");
      fetchProjects();
      if (editingId === id) resetForm();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30 relative overflow-x-hidden">
      {/* Background Ambience (Living Gradient) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-900/20 rounded-full blur-[100px]" />
      </div>

      <Toaster position="top-center" />
      
      {/* Navbar Glass */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="group flex items-center gap-3 text-neutral-400 hover:text-white transition">
            <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 border border-white/5 transition">
              <ArrowLeft size={18} />
            </div>
            <span className="font-medium text-sm tracking-wide">Back to Vault</span>
          </button>
          
          <div className="flex items-center gap-3">
             <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-neutral-400">
                ADMIN_MODE :: ACTIVE
             </div>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-10 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* --- KOLOM KIRI: FORM EDITOR (5 Columns) --- */}
        <div className="lg:col-span-5">
          <motion.div 
            initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}
            className="sticky top-28"
          >
            {/* Form Container */}
            <div className="bg-[#050505]/80 backdrop-blur-md border border-white/10 rounded-[2rem] p-1 shadow-2xl overflow-hidden relative">
              {/* Glowing Line at Top */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${editingId ? 'via-yellow-500' : 'via-purple-500'} to-transparent opacity-50`} />
              
              <div className="p-7 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-500">
                      {editingId ? "Edit Project" : "New Entry"}
                    </h2>
                    <p className="text-neutral-500 text-xs mt-1">
                      {editingId ? "Melakukan perubahan data." : "Tambahkan ke koleksi vault."}
                    </p>
                  </div>
                  {editingId && (
                    <button onClick={resetForm} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white transition">
                      <X size={16} />
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Title Input */}
                  <div className="group relative">
                    <input 
                      name="title" required value={formData.title} onChange={handleChange} placeholder=" "
                      className="peer w-full bg-transparent border-b border-neutral-800 py-3 text-lg font-medium text-white focus:border-purple-500 outline-none transition-all placeholder-transparent"
                    />
                    <label className="absolute left-0 top-3 text-neutral-500 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-4 peer-focus:text-xs peer-focus:text-purple-500 peer-not-placeholder-shown:-top-4 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-purple-500 pointer-events-none">
                      Project Title
                    </label>
                  </div>

                  {/* Grid & Tags Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Grid Size</label>
                       <div className="relative">
                         <select 
                            name="size" value={formData.size} onChange={handleChange}
                            className="w-full appearance-none bg-neutral-900/50 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-300 focus:border-purple-500 focus:bg-neutral-900 outline-none transition"
                          >
                            <option value="small">Small (1x1)</option>
                            <option value="large">Large (2x1)</option>
                          </select>
                          <LayoutGrid size={14} className="absolute right-4 top-3.5 text-neutral-500 pointer-events-none"/>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Tags</label>
                       <input 
                        name="tags" value={formData.tags} onChange={handleChange}
                        placeholder="React, CSS..."
                        className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:border-purple-500 outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Description</label>
                     <textarea 
                      name="description" rows={3} value={formData.description} onChange={handleChange}
                      className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:border-purple-500 outline-none transition resize-none"
                    />
                  </div>

                  {/* Links Group */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                     <div className="flex items-center gap-3">
                        <LinkIcon size={16} className="text-neutral-500"/>
                        <input 
                          name="link" value={formData.link} onChange={handleChange} placeholder="Link Website (URL)"
                          className="flex-1 bg-transparent border-none text-sm focus:ring-0 placeholder-neutral-600 text-blue-400"
                        />
                     </div>
                     <div className="w-full h-[1px] bg-white/5" />
                     <div className="flex items-center gap-3">
                        <ImageIcon size={16} className="text-neutral-500"/>
                        <input 
                          name="preview_image" value={formData.preview_image} onChange={handleChange} placeholder="Link Gambar Preview"
                          className="flex-1 bg-transparent border-none text-sm focus:ring-0 placeholder-neutral-600 text-green-400"
                        />
                     </div>
                  </div>

                  {/* Dynamic Preview */}
                  <AnimatePresence>
                    {formData.preview_image && (
                      <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} exit={{opacity: 0, height: 0}} className="rounded-xl overflow-hidden border border-neutral-800 relative group">
                        <img src={ensureHttps(formData.preview_image)} alt="Preview" className="w-full h-32 object-cover opacity-60 group-hover:opacity-100 transition duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                          <span className="text-[10px] text-neutral-400 font-mono">PREVIEW SOURCE</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Button */}
                  <button 
                    type="submit" disabled={loading}
                    className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex justify-center items-center gap-2 relative overflow-hidden group ${
                      editingId 
                      ? "bg-yellow-500 text-black shadow-yellow-900/20" 
                      : "bg-white text-black shadow-purple-900/20"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full h-full -translate-x-full group-hover:animate-shimmer" />
                    {loading ? "PROCESSING..." : (editingId ? <><Save size={18}/> UPDATE DATA</> : <><Plus size={18}/> CREATE ENTRY</>)}
                  </button>

                </form>
              </div>
            </div>
          </motion.div>
        </div>

        {/* --- KOLOM KANAN: LIST PROJECT (7 Columns) --- */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
             <h3 className="text-neutral-400 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/> Database Records ({projects.length})
             </h3>
             <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-neutral-600"/>
                <input type="text" placeholder="Search..." disabled className="bg-neutral-900/50 border border-neutral-800 rounded-full pl-9 pr-4 py-2 text-xs w-40 cursor-not-allowed"/>
             </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {fetching ? (
              [1,2,3].map(i => <div key={i} className="h-24 bg-neutral-900/30 animate-pulse rounded-2xl"/>)
            ) : projects.length === 0 ? (
               <div className="text-center py-20 text-neutral-600 border border-dashed border-neutral-800 rounded-2xl">Data Kosong.</div>
            ) : (
              projects.map((item, index) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                  key={item.id} 
                  className={`group relative bg-neutral-900/40 backdrop-blur-sm border ${editingId === item.id ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-neutral-800 hover:border-neutral-600'} rounded-2xl p-4 flex gap-5 transition-all duration-300 hover:bg-neutral-900/60`}
                >
                  {/* Thumbnail Card */}
                  <div className="w-24 h-24 rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden flex-shrink-0 relative">
                     <img src={item.preview_image} alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition duration-500"/>
                     <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-mono border border-white/10 text-white">
                        {item.size === 'large' ? '2x1' : '1x1'}
                     </div>
                  </div>

                  {/* Content Info */}
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <div className="flex justify-between items-start mb-1">
                       <h4 className="font-bold text-lg text-white truncate pr-4 group-hover:text-purple-400 transition-colors">{item.title}</h4>
                    </div>
                    <p className="text-xs text-neutral-500 line-clamp-1 mb-3 font-mono">{item.link}</p>
                    
                    <div className="flex gap-2">
                       <button onClick={() => handleEditClick(item)} className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-white hover:text-black text-neutral-300 text-xs font-medium transition-all flex items-center gap-1.5">
                         <Edit3 size={12}/> Edit
                       </button>
                       <button onClick={() => handleDelete(item.id)} className="px-3 py-1.5 rounded-lg border border-red-900/30 text-red-500 hover:bg-red-950/50 text-xs font-medium transition-all">
                         <Trash2 size={12}/>
                       </button>
                    </div>
                  </div>

                  {/* Active Indicator */}
                  {editingId === item.id && (
                     <motion.div layoutId="active-glow" className="absolute -inset-[1px] rounded-2xl border-2 border-yellow-500/30 pointer-events-none z-10" />
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}