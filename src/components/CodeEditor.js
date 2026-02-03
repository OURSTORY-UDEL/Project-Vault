"use client";
import React, { useState } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css"; // Tema gelap coding

export default function CodeEditor({ initialCode, onSave, isSaving }) {
  const [code, setCode] = useState(initialCode);
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (newCode) => {
    setCode(newCode);
    setIsDirty(newCode !== initialCode);
  };

  return (
    <div className="flex flex-col h-full relative group bg-[#1e1e1e]">
      <div className="flex-1 overflow-auto font-mono text-sm custom-scrollbar p-4">
        <Editor
          value={code}
          onValueChange={handleChange}
          highlight={(code) => highlight(code, languages.js)}
          padding={10}
          style={{
            fontFamily: '"Fira Code", "JetBrains Mono", monospace',
            fontSize: 14,
            backgroundColor: "transparent",
            minHeight: "100%",
          }}
          className="text-blue-300"
        />
      </div>
      {isDirty && (
        <div className="absolute bottom-6 right-6 z-20">
          <button
            onClick={() => { onSave(code); setIsDirty(false); }}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full shadow-lg transition-all"
          >
            {isSaving ? "Menyimpan..." : "💾 Simpan"}
          </button>
        </div>
      )}
    </div>
  );
}