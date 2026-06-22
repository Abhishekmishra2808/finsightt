import React, { useState } from 'react';
import { Map as MapIcon, Navigation, MapPin, Layers, Search, Globe, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export default function MapViewer() {
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [mapType, setMapType] = useState<'m' | 'k'>('k'); // 'm' = roadmap, 'k' = satellite
  const [activeLocation, setActiveLocation] = useState<{lat: string, lng: string} | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (lat && lng) {
      setActiveLocation({ lat, lng });
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-medium font-heading">Satellite Map Viewer</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Enter latitude and longitude coordinates to view the location on an interactive map with satellite imagery.
        </p>
      </div>

      <div className="bg-card border rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium mb-2">Latitude</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="e.g., 28.6139"
                className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                required
              />
            </div>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium mb-2">Longitude</label>
            <div className="relative">
              <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="e.g., 77.2090"
                className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 min-w-[140px] w-full md:w-auto"
          >
            <Search className="w-5 h-5" />
            View Map
          </button>
        </form>
      </div>

      {activeLocation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border rounded-2xl overflow-hidden shadow-sm flex flex-col"
        >
          <div className="p-4 border-b bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Location View</h3>
              <span className="text-sm text-muted-foreground ml-2">
                ({activeLocation.lat}, {activeLocation.lng})
              </span>
            </div>
            
            <div className="flex flex-wrap items-center bg-background border rounded-lg p-1 self-start sm:self-auto gap-1">
              <button
                onClick={() => setMapType('m')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  mapType === 'm' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                Standard Map
              </button>
              <button
                onClick={() => setMapType('k')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  mapType === 'k' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Layers className="w-4 h-4" />
                Satellite
              </button>
              <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>
              <a
                href={`https://earth.google.com/web/@${activeLocation.lat},${activeLocation.lng},800a,0y,60t,0r`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                title="Open in Google Earth 3D"
              >
                <Globe className="w-4 h-4" />
                3D Earth View
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
          </div>
          
          <div className="w-full h-[600px] bg-muted relative">
            <iframe
              title="Map View"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${activeLocation.lat},${activeLocation.lng}&t=${mapType}&z=16&output=embed`}
            ></iframe>
          </div>
        </motion.div>
      )}
    </div>
  );
}
