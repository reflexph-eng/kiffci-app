'use client';
import { useRef, useState } from 'react';
import { uploadImage } from '@/lib/storage';
import { Upload, X, Loader } from 'lucide-react';

type Folder = 'experiences' | 'establishments' | 'events';

interface Props {
  folder:   Folder;
  entityId: string;
  images:   string[];
  onChange: (images: string[]) => void;
  max?:     number;
}

export default function ImageUploader({ folder, entityId, images, onChange, max = 5 }: Props) {
  const fileRef  = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const url = await uploadImage(folder, entityId || `temp_${Date.now()}`, file);
      onChange([...images, url]);
    } catch {
      alert("Erreur lors de l'upload. Réessaie.");
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function remove(url: string) {
    onChange(images.filter(u => u !== url));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {images.map(url => (
          <div key={url} className="relative w-20 h-20 rounded-2xl overflow-hidden group">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button onClick={() => remove(url)}
              className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
      {images.length < max && (
        <>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={loading}
            className="flex items-center gap-2 border border-dashed border-gray-300 rounded-2xl px-4 py-2.5 text-sm text-gray-500 hover:border-solar hover:text-solar transition disabled:opacity-60">
            {loading ? <Loader size={15} className="animate-spin" /> : <Upload size={15} />}
            {loading ? 'Upload en cours…' : 'Ajouter une image'}
          </button>
        </>
      )}
    </div>
  );
}
