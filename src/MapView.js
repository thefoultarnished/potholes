import React from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X } from 'lucide-react';

// Fix Leaflet marker icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const SIZES = [
  { level: 1, label: 'Mild' },
  { level: 2, label: 'Moderate' },
  { level: 3, label: 'Serious' },
  { level: 4, label: 'Severe' },
  { level: 5, label: 'Critical' },
  { level: 6, label: 'Extreme' },
  { level: 7, label: 'Catastrophic' },
  { level: 8, label: 'Apocalyptic' }
];

const getSizeFromSeverity = (sev) => SIZES.find(s => s.level === Number(sev)) || SIZES[0];

const getDisplayLocation = (loc) => {
  if (!loc) return 'Somewhere on Earth';
  if (typeof loc === 'object' && !Array.isArray(loc)) {
    return loc.name || loc.address || 'Unknown Location';
  }
  if (loc === 'Unknown Location' || loc.startsWith('GPS:')) return 'Somewhere on Earth';
  if (loc.includes(' (GPS:')) return loc.split(' (GPS:')[0];
  return loc.split(',')[0].trim();
};

const MapView = ({ reports, onClose, darkMode }) => {
  const isValidLoc = (loc) => loc && typeof loc.lat === 'number' && typeof loc.lng === 'number';

  const getOffset = (id) => {
    let hash = 0;
    const str = String(id || '0');
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return [
      ((hash % 1000) / 1000 - 0.5) * 0.0006,
      (((hash >> 8) % 1000) / 1000 - 0.5) * 0.0006
    ];
  };

  const validReport = reports.find(r => isValidLoc(r.location));
  const initialCenter = validReport 
    ? [validReport.location.lat, validReport.location.lng] 
    : [20.5937, 78.9629];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md"
    >
      <div className={`relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border ${darkMode ? 'border-white/10' : 'border-white/40'}`}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-[500] p-3 bg-white rounded-full shadow-lg hover:bg-slate-100 text-slate-900 transition-colors"
        >
          <X size={24} />
        </button>
        <MapContainer center={initialCenter} zoom={validReport ? 13 : 5} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url={darkMode 
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' 
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            }
          />
          {reports.map((r) => {
            if (!isValidLoc(r.location)) return null;
            const [offLat, offLng] = getOffset(r.id);
            return (
              <Marker key={r.id} position={[r.location.lat + offLat, r.location.lng + offLng]}>
                <Popup>
                  <div className="text-sm font-sans">
                    <strong>{getDisplayLocation(r.location)}</strong>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-bold">{getSizeFromSeverity(r.severity).label}</span>
                      <span>• {r.votes} votes</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </motion.div>
  );
};

export default MapView;
