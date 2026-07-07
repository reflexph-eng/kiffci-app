'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';
import { getExperiences } from '@/lib/firestore';
import { Experience } from '@/types';

const defaultIcon = new L.Icon({
  iconUrl:    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize:   [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});
const premiumIcon = new L.Icon({
  iconUrl:    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl:  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize:   [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

export default function MapClient() {
  const [exps,     setExps]     = useState<Experience[]>([]);
  const [cat,      setCat]      = useState('');
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getExperiences().then(setExps).finally(() => setLoading(false));
  }, []);

  const categories = Array.from(new Set(exps.map((e) => e.category))).sort();
  const filtered   = cat ? exps.filter((e) => e.category === cat) : exps;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setCat('')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${!cat ? 'bg-solar text-white border-solar' : 'bg-white text-gray-600 border-gray-200 hover:border-solar'}`}>
          Tout ({exps.length})
        </button>
        {categories.map((c) => (
          <button key={c} onClick={() => setCat(c === cat ? '' : c)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${cat === c ? 'bg-solar text-white border-solar' : 'bg-white text-gray-600 border-gray-200 hover:border-solar'}`}>
            {c} ({exps.filter((e) => e.category === c).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-[65vh] rounded-4xl bg-gray-100 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-solar border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="h-[65vh] rounded-4xl overflow-hidden shadow-soft">
          <MapContainer center={[5.33, -4.01]} zoom={12} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filtered.map((e) => (
              <Marker key={e.id} position={[e.latitude, e.longitude]} icon={e.isPremium ? premiumIcon : defaultIcon}>
                <Popup maxWidth={220}>
                  <div className="p-1">
                    <span className="text-xs font-bold text-orange-500 uppercase">{e.category}</span>
                    <p className="font-bold text-sm mt-0.5 leading-tight">{e.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{e.district}</p>
                    <p className="text-xs font-semibold text-green-600 mt-1">{e.priceText}</p>
                    <Link href={`/experiences/${e.id}`}
                      className="mt-2 block text-center bg-orange-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg hover:bg-orange-600 transition">
                      Voir la fiche →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
      <p className="text-sm text-gray-500 text-center">
        {filtered.length} expérience{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}
        {cat ? ` · "${cat}"` : ''}
      </p>
    </div>
  );
}
