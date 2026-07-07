'use client';
import { useRef, useState } from 'react';
import { uploadCmsImage, CmsFolder } from '@/lib/storage';
import { Upload, X, Loader } from 'lucide-react';

interface Props {
  folder:    CmsFolder;
  value:     string;
  onChange:  (url: string) => void;
  label?:    string;
  height?:   number;
}

export default function CmsImageUpload({ folder, value, onChange, label = 'Image', height = 160 }: Props) {
  const fileRef         = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const url = await uploadCmsImage(folder, file);
      onChange(url);
    } catch {
      alert("Erreur upload. Réessaie.");
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-2">{label}</label>
      {value ? (
        <div className="relative rounded-2xl overflow-hidden group" style={{ height }}>
          <img src={value} alt="preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
            <button onClick={() => fileRef.current?.click()} disabled={loading}
              className="bg-white text-anthracite px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-100 transition">
              <Upload size={14} /> Changer
            </button>
            <button onClick={() => onChange('')}
              className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-red-700 transition">
              <X size={14} /> Supprimer
            </button>
          </div>
          {loading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Loader size={28} className="text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <button type="button" onClick={() => fileRef.current?.click()} disabled={loading}
          className="w-full border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-solar hover:text-solar transition disabled:opacity-60"
          style={{ height }}>
          {loading ? <Loader size={24} className="animate-spin" /> : <Upload size={24} />}
          <span className="text-sm font-medium">{loading ? 'Upload en cours…' : 'Cliquer pour uploader'}</span>
          <span className="text-xs">JPG, PNG, WEBP</span>
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}
