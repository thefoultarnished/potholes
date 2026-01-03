<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { X } from 'lucide-svelte';
  import { getSizeFromSeverity, getDisplayLocation, type Report } from '$lib/stores';
  
  export let reports: Report[];
  export let onClose: () => void;
  export let darkMode: boolean;
  
  let mapContainer: HTMLDivElement;
  let map: any;
  
  const isValidLoc = (loc: any) => loc && typeof loc.lat === 'number' && typeof loc.lng === 'number';
  
  const getOffset = (id: string) => {
    let hash = 0;
    const str = String(id || '0');
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return [
      ((hash % 1000) / 1000 - 0.5) * 0.0006,
      (((hash >> 8) % 1000) / 1000 - 0.5) * 0.0006
    ];
  };
  
  onMount(async () => {
    const L = (await import('leaflet')).default;
    await import('leaflet/dist/leaflet.css');
    
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
    
    const validReport = reports.find(r => isValidLoc(r.location));
    const initialCenter: [number, number] = validReport && typeof validReport.location === 'object'
      ? [validReport.location.lat, validReport.location.lng] 
      : [20.5937, 78.9629];
    
    map = L.map(mapContainer).setView(initialCenter, validReport ? 13 : 5);
    
    L.tileLayer(darkMode 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: '&copy; OpenStreetMap contributors' }
    ).addTo(map);
    
    reports.forEach(r => {
      if (!isValidLoc(r.location) || typeof r.location !== 'object') return;
      const [offLat, offLng] = getOffset(r.id);
      const marker = L.marker([r.location.lat + offLat, r.location.lng + offLng]).addTo(map);
      marker.bindPopup(`
        <div class="text-sm font-sans">
          <strong>${getDisplayLocation(r.location)}</strong>
          <div class="mt-1">
            <span class="font-bold">${getSizeFromSeverity(r.severity).label}</span>
            <span>• ${r.votes} votes</span>
          </div>
        </div>
      `);
    });
  });
  
  onDestroy(() => {
    if (map) map.remove();
  });
</script>

<div class="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md">
  <div class="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border {darkMode ? 'border-white/10' : 'border-white/40'}">
    <button 
      on:click={onClose}
      class="absolute top-4 right-4 z-[500] p-3 bg-white rounded-full shadow-lg hover:bg-slate-100 text-slate-900 transition-colors"
    >
      <X size={24} />
    </button>
    <div bind:this={mapContainer} class="w-full h-full"></div>
  </div>
</div>
