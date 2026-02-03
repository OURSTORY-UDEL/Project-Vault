"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import { ArrowLeft, Save, Plus, Trash2, Edit3, Link as LinkIcon, Image as ImageIcon, Search } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [projects, setProjects] = useState([]);
  
  // State untuk mode Edit vs Baru
  const [editingId, setEditingId] = useState(null); 

  // Form State
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

  // --- 1. Load Semua Data Project (Biar bisa milih mana yang mau diedit) ---
  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setFetching(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('id', { ascending: false }); // Yang baru diatas
    
    if (error) toast.error("Gagal load data");
    else setProjects(data || []);
    setFetching(false);
  }

  // --- 2. Helper: Auto HTTPS ---
  // Fungsi ini otomatis nambahin https:// kalau belum ada
  const ensureHttps = (url) => {
    if (!url) return "";
    // Kalau sudah ada http/https, biarkan. Kalau belum, tambahin.
    return url.match(/^https?:\/\//) ? url : `https://${url}`;
  };

  // --- 3. Handle Submit (Bisa Simpan Baru / Update) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Rapikan data sebelum dikirim
      const cleanData = {
        ...formData,
        link: ensureHttps(formData.link),           // AUTO HTTPS
        preview_image: ensureHttps(formData.preview_image), // AUTO HTTPS
        // Ubah string "React, Next" jadi array ["React", "Next"]
        tags: typeof formData.tags === 'string' 
              ? formData.tags.split(",").map(t => t.trim()).filter(t => t) 
              : formData.tags
      };

      let error;

      if (editingId) {
        // MODE UPDATE: Kalau lagi ngedit, update data yang id-nya cocok
        const { error: err } = await supabase
          .from('projects')
          .update(cleanData)
          .eq('id', editingId);
        error = err;
        toast.success("Data berhasil diperbarui!");
      } else {
        // MODE INSERT: Kalau baru, insert data baru
        const { error: err } = await supabase
          .from('projects')
          .insert([cleanData]);
        error = err;
        toast.success("Project baru berhasil ditambahkan!");
      }

      if (error) throw error;

      // Refresh list dan reset form
      fetchProjects();
      resetForm();

    } catch (error) {
      toast.error("Gagal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 4. Handle Edit & Delete ---
  const handleEditClick = (project) => {
    setEditingId(project.id);
    setFormData({
      ...project,
      tags: project.tags ? project.tags.join(", ") : "" // Ubah array balik jadi string buat di form
    });
    // Scroll ke atas (ke form)
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info(`Mengedit: ${project.title}`);
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin mau hapus project ini selamanya?")) return;

    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      toast.error("Gagal menghapus");
    } else {
      toast.success("Project dihapus");
      fetchProjects();
      if (editingId === id) resetForm(); // Kalau yg dihapus lagi diedit, reset form
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
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30 pb-20">
      <Toaster position="bottom-center" />
      
      {/* Header */}
      <div className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/")} className="p-2 hover:bg-neutral-800 rounded-full transition">
              <ArrowLeft size={20} className="text-neutral-400" />
            </button>
            <h1 className="font-bold text-lg">Admin Dashboard</h1>
          </div>
          <button 
            onClick={resetForm}
            className="text-xs font-medium px-3 py-1.5 bg-neutral-800 rounded-full hover:bg-neutral-700 transition flex items-center gap-2"
          >
            <Plus size={14} /> Mode Buat Baru
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI: FORM EDITOR (Sticky di Desktop) */}
        <div className="lg:col-span-1">
          <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 shadow-2xl sticky top-24">
            <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
              {editingId ? <span className="text-yellow-500">Edit Mode ✏️</span> : <span className="text-purple-400">Buat Baru ✨</span>}
            </h2>
            <p className="text-neutral-500 text-xs mb-6">
              {editingId ? "Sedang mengubah data project lama." : "Isi form untuk menambah project."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-400">Nama Project</label>
                <input 
                  name="title" required value={formData.title} onChange={handleChange}
                  placeholder="Nama Website..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-sm focus:ring-1 focus:ring-purple-500 outline-none"
                />
              </div>

              {/* Grid Size */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-400">Ukuran Grid</label>
                <select 
                  name="size" value={formData.size} onChange={handleChange}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-sm focus:ring-1 focus:ring-purple-500 outline-none"
                >
                  <option value="small">Small (Kotak Kecil)</option>
                  <option value="large">Large (Kotak Lebar)</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-400">Deskripsi</label>
                <textarea 
                  name="description" rows={3} value={formData.description} onChange={handleChange}
                  placeholder="Jelaskan fitur project ini..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-sm focus:ring-1 focus:ring-purple-500 outline-none"
                />
              </div>

              {/* Links (Auto HTTPS) */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1 relative">
                  <label className="text-xs font-medium text-neutral-400 flex items-center gap-1"><LinkIcon size={12}/> Link Website</label>
                  <input 
                    name="link" value={formData.link} onChange={handleChange}
                    placeholder="google.com (Otomatis https)"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-sm focus:ring-1 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div className="space-y-1 relative">
                  <label className="text-xs font-medium text-neutral-400 flex items-center gap-1"><ImageIcon size={12}/> Link Gambar</label>
                  <input 
                    name="preview_image" value={formData.preview_image} onChange={handleChange}
                    placeholder="Link gambar langsung..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-sm focus:ring-1 focus:ring-purple-500 outline-none"
                  />
                  {formData.preview_image && (
                    <div className="mt-2 rounded-lg overflow-hidden h-20 w-full border border-neutral-800">
                      <img src={ensureHttps(formData.preview_image)} alt="Preview" className="w-full h-full object-cover opacity-50" />
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-400">Tags</label>
                <input 
                  name="tags" value={formData.tags} onChange={handleChange}
                  placeholder="React, Nextjs, CSS (Pisahkan koma)"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-sm focus:ring-1 focus:ring-purple-500 outline-none"
                />
              </div>

              {/* Submit Button */}
              <button 
                type="submit" disabled={loading}
                className={`w-full py-3 font-bold rounded-xl transition transform active:scale-95 flex justify-center items-center gap-2 ${
                  editingId ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-white text-black hover:bg-neutral-200"
                }`}
              >
                {loading ? "Memproses..." : (editingId ? <><Save size={18}/> Update Data</> : <><Plus size={18}/> Simpan Baru</>)}
              </button>

              {editingId && (
                <button 
                  type="button" onClick={resetForm}
                  className="w-full py-2 text-xs text-neutral-500 hover:text-white transition"
                >
                  Batal Edit (Kembali ke Mode Baru)
                </button>
              )}

            </form>
          </div>
        </div>

        {/* KOLOM KANAN: LIST PROJECT (Manajemen Data) */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-neutral-200">Daftar Project ({projects.length})</h3>
            <div className="text-xs text-neutral-500 flex items-center gap-1">
              <Search size={12}/> Pilih project untuk diedit
            </div>
          </div>

          {fetching ? (
            <div className="text-neutral-500 text-sm animate-pulse">Mengambil data vault...</div>
          ) : projects.length === 0 ? (
            <div className="p-8 border border-dashed border-neutral-800 rounded-2xl text-center text-neutral-500">
              Belum ada data. Isi form di sebelah kiri/atas untuk menambah.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((item) => (
                <div 
                  key={item.id} 
                  className={`relative group p-4 rounded-2xl border transition-all duration-300 flex gap-4 ${
                    editingId === item.id 
                    ? "bg-yellow-500/10 border-yellow-500/50" 
                    : "bg-neutral-900/50 border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  {/* Thumbnail Kecil */}
                  <div className="w-16 h-16 rounded-lg bg-neutral-800 overflow-hidden flex-shrink-0">
                     <img 
                       src={item.preview_image || "https://placehold.co/100"} 
                       alt="thumb" 
                       className="w-full h-full object-cover"
                     />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white truncate">{item.title}</h4>
                    <p className="text-xs text-neutral-500 truncate mb-2">{item.description || "Tidak ada deskripsi"}</p>
                    <div className="flex gap-2">
                      {/* Tombol EDIT */}
                      <button 
                        onClick={() => handleEditClick(item)}
                        className="px-3 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 rounded-md text-white transition flex items-center gap-1"
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                      
                      {/* Tombol HAPUS */}
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1.5 text-xs font-medium bg-red-900/20 hover:bg-red-900/50 text-red-400 rounded-md transition flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Hapus
                      </button>
                    </div>
                  </div>

                  {/* Indikator Status */}
                  {editingId === item.id && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}