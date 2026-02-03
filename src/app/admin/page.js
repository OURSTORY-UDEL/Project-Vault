"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State untuk menyimpan inputan form
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    preview_image: "",
    tags: "", // Nanti kita pisahkan dengan koma
    code_snippet: "",
    size: "small"
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Ubah string tags "Nextjs, React" menjadi array ["Nextjs", "React"]
      const tagsArray = formData.tags.split(",").map(tag => tag.trim()).filter(t => t);

      // Kirim data ke Supabase
      const { error } = await supabase.from('projects').insert([{
        ...formData,
        tags: tagsArray
      }]);

      if (error) throw error;

      toast.success("Project berhasil disimpan!");
      
      // Tunggu 1 detik lalu balik ke halaman utama
      setTimeout(() => router.push("/"), 1000);
      
    } catch (error) {
      toast.error("Gagal menyimpan: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans selection:bg-purple-500/30">
      <Toaster position="bottom-center" />
      
      <div className="max-w-2xl mx-auto pt-10">
        <button 
          onClick={() => router.push("/")}
          className="flex items-center text-neutral-400 hover:text-white mb-8 transition gap-2"
        >
          <ArrowLeft size={20} /> Kembali ke Vault
        </button>

        <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Add New Project.
          </h1>
          <p className="text-neutral-500 mb-8">Masukkan detail karya masterpiecemu.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Judul & Ukuran Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-neutral-400">Judul Project</label>
                <input 
                  name="title" required placeholder="Contoh: E-Commerce Dashboard"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none transition"
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400">Ukuran Grid</label>
                <select 
                  name="size" 
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none transition"
                  onChange={handleChange}
                >
                  <option value="small">Small (1 Kotak)</option>
                  <option value="large">Large (2 Kotak)</option>
                </select>
              </div>
            </div>

            {/* Deskripsi */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-400">Deskripsi Singkat</label>
              <textarea 
                name="description" rows={3} placeholder="Ceritakan sedikit tentang project ini..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none transition"
                onChange={handleChange}
              />
            </div>

            {/* Link & Gambar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400">Link Website</label>
                <input 
                  name="link" placeholder="https://..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none transition"
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400">Link Gambar (Preview)</label>
                <input 
                  name="preview_image" placeholder="https://..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none transition"
                  onChange={handleChange}
                />
                <p className="text-[10px] text-neutral-600">
                  Tips: Upload screenshot ke <a href="https://postimages.org/" target="_blank" className="text-blue-400 underline">postimages.org</a> lalu copy "Direct Link".
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-400">Tags (Pisahkan koma)</label>
              <input 
                name="tags" placeholder="Next.js, Tailwind, Supabase"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none transition"
                onChange={handleChange}
              />
            </div>

            {/* Code Snippet */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-400">Codingan Awal (Opsional)</label>
              <textarea 
                name="code_snippet" rows={6} placeholder="// Tempel kodemu disini..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 font-mono text-sm text-blue-300 focus:ring-2 focus:ring-purple-500 outline-none transition"
                onChange={handleChange}
              />
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition transform active:scale-95 flex justify-center items-center gap-2"
            >
              {loading ? "Menyimpan..." : <><Save size={20} /> Simpan ke Vault</>}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}