"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, ExternalLink, Code2, Eye, X, Plus } from "lucide-react"; // Ada icon Plus baru
import { Toaster, toast } from "sonner";
import { supabase } from "@/lib/supabase"; 
import CodeEditor from "@/components/CodeEditor";
import { useRouter } from "next/navigation"; // Buat pindah halaman

// ... (Bagian SpotlightCard tetap sama, tidak perlu diubah)
function SpotlightCard({ children, className = "" }) {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-md ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.1), transparent 40%)`,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

// ... (Bagian ProjectModal tetap sama, tidak perlu diubah)
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Link disalin!");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0a0a0a] w-full max-w-5xl h-[85vh] rounded-[2rem] border border-neutral-800 overflow-hidden flex flex-col shadow-2xl relative"
      >
        <div className="flex justify-between items-center p-6 border-b border-neutral-800">
          <h2 className="text-2xl font-bold text-white">{project.title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-800 text-white">
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden relative bg-neutral-950">
          {viewMode === "preview" ? (
            <div className="w-full h-full flex items-center justify-center relative group">
              <img 
                src={project.preview_image || "https://placehold.co/800x600/1e1e1e/FFF?text=No+Preview"} 
                alt="Preview" 
                className="w-full h-full object-cover opacity-80" 
              />
              <a href={project.link} target="_blank" className="absolute bg-white text-black px-6 py-3 rounded-full font-bold flex gap-2 items-center opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                <ExternalLink size={18} /> Buka Website
              </a>
            </div>
          ) : (
            <CodeEditor 
                initialCode={project.code_snippet || "// Kosong"} 
                onSave={handleSaveCode} 
                isSaving={isSaving}
            />
          )}
        </div>
        <div className="p-4 border-t border-neutral-800 bg-neutral-900 flex justify-between items-center">
          <div className="flex bg-black p-1 rounded-full border border-neutral-800">
            <button onClick={() => setViewMode("preview")} className={`px-4 py-2 rounded-full text-sm font-medium transition ${viewMode === "preview" ? "bg-neutral-800 text-white" : "text-neutral-500"}`}>
              <Eye size={16} className="inline mr-2" /> Visual
            </button>
            <button onClick={() => setViewMode("code")} className={`px-4 py-2 rounded-full text-sm font-medium transition ${viewMode === "code" ? "bg-blue-600 text-white" : "text-neutral-500"}`}>
              <Code2 size={16} className="inline mr-2" /> Code
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Main Page (YANG KITA UPDATE) ---
export default function PortfolioVault() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true); // Tambah loading state
  const [selectedProject, setSelectedProject] = useState(null);
  const router = useRouter(); // Buat navigasi

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    // Coba ambil data
    const { data, error } = await supabase.from('projects').select('*').order('id');
    
    if (error) {
      console.error("Error fetching:", error);
      toast.error("Gagal mengambil data database");
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  }

  const handleUpdateProject = (updated) => {
    setProjects(projects.map(p => p.id === updated.id ? updated : p));
    setSelectedProject(updated);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Toaster position="bottom-center" />
      
      {/* Header Baru dengan Tombol Admin */}
      <header className="flex justify-between items-center pt-8 px-6 max-w-7xl mx-auto mb-12">
        <div>
          <h1 className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-500">Project Vault.</h1>
          <p className="text-neutral-400">Simpan link & codingan projectmu disini.</p>
        </div>
        
        {/* Tombol Menuju Admin */}
        <button 
          onClick={() => router.push('/admin')}
          className="flex items-center gap-2 px-5 py-3 bg-white text-black font-bold rounded-full hover:bg-neutral-200 transition"
        >
          <Plus size={20} /> Add Project
        </button>
      </header>

      <main className="pb-20 px-6 max-w-7xl mx-auto">
        
        {/* Tampilan Loading */}
        {loading && (
          <div className="text-center py-20 text-neutral-500 animate-pulse">
            Memuat data dari Vault...
          </div>
        )}

        {/* Tampilan Jika Data Kosong */}
        {!loading && projects.length === 0 && (
          <div className="text-center py-20 border border-dashed border-neutral-800 rounded-3xl">
            <h3 className="text-xl font-bold text-neutral-400 mb-2">Belum ada project</h3>
            <p className="text-neutral-600 mb-6">Database Supabase kamu masih kosong.</p>
            <button 
              onClick={() => router.push('/admin')}
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Klik disini untuk tambah project pertamamu
            </button>
          </div>
        )}

        {/* Tampilan Grid Project */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className={`cursor-pointer group ${project.size === 'large' ? 'md:col-span-2' : ''}`}
            >
              <SpotlightCard className="h-full flex flex-col justify-between p-6">
                 <div>
                   <h3 className="text-2xl font-bold group-hover:text-purple-400 transition">{project.title}</h3>
                   <p className="text-neutral-500 line-clamp-2 mt-2">{project.description}</p>
                 </div>
                 <div className="flex gap-2 mt-4">
                    {project.tags?.map(tag => (
                      <span key={tag} className="text-xs bg-neutral-800 px-2 py-1 rounded text-neutral-400">{tag}</span>
                    ))}
                 </div>
              </SpotlightCard>
            </div>
          ))}
        </div>
      </main>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} onUpdateProject={handleUpdateProject} />
        )}
      </AnimatePresence>
    </div>
  );
}