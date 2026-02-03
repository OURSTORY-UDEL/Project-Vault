"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Code2, Eye, X, ArrowRight, Terminal, Sparkles } from "lucide-react"; 
import { Toaster, toast } from "sonner";
import { supabase } from "@/lib/supabase"; 
import CodeEditor from "@/components/CodeEditor";
import { useRouter } from "next/navigation"; 

// --- Komponen Modal Detail (Updated Style) ---
const ProjectModal = ({ project, onClose, onUpdateProject }) => {
  const [viewMode, setViewMode] = useState("preview");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveCode = async (newCode) => {
    setIsSaving(true);
    const { error } = await supabase
      .from('projects')
      .update({ code_snippet: newCode })
      .eq('id', project.id);

    if (!error) {
      onUpdateProject({ ...project, code_snippet: newCode });
      toast.success("Kode berhasil disimpan!");
    } else {
      toast.error("Gagal menyimpan.");
    }
    setIsSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0a0a0a] w-full max-w-6xl h-[90vh] rounded-[2rem] border border-white/10 overflow-hidden flex flex-col shadow-2xl relative"
      >
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5">
          <div>
             <h2 className="text-2xl font-bold text-white tracking-tight">{project.title}</h2>
             <p className="text-xs text-neutral-400 font-mono mt-1">{project.description}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white transition">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden relative bg-[#050505]">
          {viewMode === "preview" ? (
            <div className="w-full h-full flex items-center justify-center relative group p-10">
              {/* Gambar Full di Modal */}
              <img 
                src={project.preview_image || "https://placehold.co/800x600/1e1e1e/FFF?text=No+Preview"} 
                alt="Preview" 
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-white/5" 
              />
              <div className="absolute inset-0 flex items-end justify-center pb-10 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all">
                <a href={project.link} target="_blank" className="bg-white text-black px-8 py-3 rounded-full font-bold flex gap-2 items-center hover:scale-105 transition transform shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  <ExternalLink size={18} /> Visit Live Site
                </a>
              </div>
            </div>
          ) : (
            <CodeEditor 
                initialCode={project.code_snippet || "// Kosong"} 
                onSave={handleSaveCode} 
                isSaving={isSaving}
            />
          )}
        </div>

        <div className="p-4 border-t border-white/5 bg-black flex justify-center gap-4">
            <button onClick={() => setViewMode("preview")} className={`px-6 py-2 rounded-full text-sm font-bold transition flex items-center gap-2 ${viewMode === "preview" ? "bg-white text-black" : "text-neutral-500 hover:text-white"}`}>
              <Eye size={16} /> Visual
            </button>
            <button onClick={() => setViewMode("code")} className={`px-6 py-2 rounded-full text-sm font-bold transition flex items-center gap-2 ${viewMode === "code" ? "bg-purple-600 text-white shadow-lg shadow-purple-900/50" : "text-neutral-500 hover:text-white"}`}>
              <Code2 size={16} /> Code Editor
            </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Main Page ---
export default function PortfolioVault() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    const { data, error } = await supabase.from('projects').select('*').order('id', { ascending: false });
    if (!error) setProjects(data || []);
    setLoading(false);
  }

  const handleUpdateProject = (updated) => {
    setProjects(projects.map(p => p.id === updated.id ? updated : p));
    setSelectedProject(updated);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30 overflow-x-hidden relative">
      <Toaster position="bottom-center" />
      
      {/* --- 1. Background Ambience (Sama kayak admin biar kece) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[0%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      {/* --- 2. Hero Section (Header) --- */}
      <header className="relative z-10 pt-20 pb-16 px-6 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-8 border-b border-white/5">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-purple-300">
            <Terminal size={12} />
            <span>SYSTEM_READY</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-neutral-600">
            The Vault.
          </h1>
          <p className="text-neutral-400 text-lg max-w-xl leading-relaxed">
            Arsip digital berisi eksperimen coding, projek klien, dan <span className="text-white font-bold underline decoration-purple-500">masterpiece</span> yang sudah teruji.
          </p>
        </div>
        
        <button 
          onClick={() => router.push('/admin')}
          className="group flex items-center gap-3 px-6 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        >
          <Sparkles size={18} className="group-hover:rotate-12 transition" />
          Dashboard Admin
        </button>
      </header>

      {/* --- 3. Content Grid --- */}
      <main className="relative z-10 py-12 px-6 max-w-7xl mx-auto">
        
        {loading && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[1,2,3].map(i => <div key={i} className="h-64 bg-white/5 rounded-3xl animate-pulse"/>)}
           </div>
        )}

        {!loading && projects.length === 0 && (
          <div className="text-center py-32 border border-dashed border-white/10 rounded-3xl bg-white/5">
            <h3 className="text-2xl font-bold text-neutral-500">Data Kosong</h3>
            <p className="text-neutral-600 mt-2">Masuk ke Admin Dashboard untuk mengisi vault.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[350px]">
          {projects.map((project, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className={`group relative rounded-[2rem] overflow-hidden cursor-pointer border border-white/10 bg-[#0a0a0a] ${project.size === 'large' ? 'md:col-span-2' : ''}`}
            >
              {/* GAMBAR FULL SEBAGAI BACKGROUND */}
              <div className="absolute inset-0 z-0">
                 <img 
                    src={project.preview_image || "https://placehold.co/600x400/101010/FFF"} 
                    alt={project.title}
                    className="w-full h-full object-cover transition duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40"
                 />
                 {/* Overlay Gradient biar teks terbaca */}
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              </div>

              {/* KONTEN KARTU */}
              <div className="absolute inset-0 z-10 p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                   {/* Tags */}
                   <div className="flex flex-wrap gap-2">
                      {project.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md px-2 py-1 rounded border border-white/5 text-neutral-300">
                          {tag}
                        </span>
                      ))}
                   </div>
                   
                   {/* Arrow Icon */}
                   <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center transform -rotate-45 group-hover:rotate-0 transition duration-300 opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100">
                      <ArrowRight size={20} />
                   </div>
                </div>

                {/* Judul & Deskripsi */}
                <div className="transform translate-y-4 group-hover:translate-y-0 transition duration-300">
                   <h3 className="text-3xl font-bold text-white mb-2 leading-tight group-hover:text-purple-300 transition-colors">
                     {project.title}
                   </h3>
                   <p className="text-neutral-400 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition duration-500 delay-100">
                     {project.description}
                   </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* --- 4. Footer Simple --- */}
      <footer className="relative z-10 py-8 text-center text-neutral-600 text-xs font-mono">
        <p>PROJECT VAULT SYSTEM © {new Date().getFullYear()}</p>
      </footer>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} onUpdateProject={handleUpdateProject} />
        )}
      </AnimatePresence>
    </div>
  );
}