<script lang="ts">
  import { onMount } from 'svelte';
  import { X, Loader2, Upload, LocateFixed, Camera, Trophy } from 'lucide-svelte';
  import { SIZES, playPopSound, CLOUDINARY_CLOUD_NAME, SUPABASE_URL, SUPABASE_ANON_KEY, type Report } from '$lib/stores';
  
  export let onClose: () => void;
  export let onCreate: (report: Report) => void;
  export let darkMode: boolean;
  
  let file: File | null = null;
  let preview: string | null = null;
  let severity: number | null = null;
  let location = '';
  let gpsCoords: { lat: number; lng: number } | null = null;
  let uploading = false;
  let aiStatus = '';
  let model: any = null;
  let isPothole = false;
  let scanning = false;
  let isLocating = false;
  let uploadSuccess = false;
  
  async function ensureAIModelLoaded() {
    if (model) return;
    
    aiStatus = 'LOADING AI MODEL...';
    
    const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject();
      document.body.appendChild(s);
    });

    try {
      if (!(window as any).tf) {
        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js');
      }
      if (!(window as any).tmImage) {
        await loadScript('https://cdn.jsdelivr.net/npm/@teachablemachine/image@latest/dist/teachablemachine-image.min.js');
      }
      
      if ((window as any).tmImage && !model) {
        model = await (window as any).tmImage.load('/pothole_model/model.json', '/pothole_model/metadata.json');
      }
    } catch (e) {
      console.error("AI Model Load Failed", e);
      throw new Error("Failed to load AI model");
    }
  }
  
  async function detectLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    isLocating = true;
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude: lat, longitude: lng } = position.coords;
      
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        const data = await res.json();
        const exactAddress = data.display_name || data.address?.road || data.address?.suburb || data.address?.city || 'Unknown Address';
        location = exactAddress;
        gpsCoords = { lat, lng };
      } catch (err) {
        console.warn("Reverse geocoding failed", err);
        location = `GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        gpsCoords = { lat, lng };
      } finally {
        isLocating = false;
        playPopSound(true);
      }
    }, () => {
      alert("Unable to retrieve your location. Check your browser permissions.");
      isLocating = false;
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
  }
  
  async function compressImage(file: File): Promise<Blob> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxWidth = 1920;
          const maxHeight = 1080;
          
          if (width > height) {
            if (width > maxWidth) { height = (height * maxWidth) / width; width = maxWidth; }
          } else {
            if (height > maxHeight) { width = (width * maxHeight) / height; height = maxHeight; }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.7);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }
  
  async function handleFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const f = input.files?.[0];
    if (!f) return;
    
    file = f;
    preview = URL.createObjectURL(f);
    
    scanning = true;
    try {
      if (!model) {
        await ensureAIModelLoaded();
      }
    } catch (e) {
      console.error("Model load failed", e);
      aiStatus = 'AI LOAD FAILED';
      scanning = false;
      return;
    }
    
    if (!model) return;
    
    isPothole = false;
    aiStatus = 'DETECTING POTHOLES...';
    
    try {
      await new Promise(r => setTimeout(r, 2000));

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = preview;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          if (img.width === 0 || img.height === 0) {
            img.width = img.naturalWidth;
            img.height = img.naturalHeight;
          }
          resolve();
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      });
      
      const predictions = await model.predict(img);
      const potholeScore = predictions.find((p: any) => p.className.toLowerCase().includes('pothole'))?.probability || 0;

      if (potholeScore < 0.98) {
        aiStatus = 'NO POTHOLE DETECTED';
        isPothole = false;
        await new Promise(r => setTimeout(r, 2500));
        aiStatus = '';
        file = null;
        preview = null;
      } else {
        aiStatus = `POTHOLE DETECTED: ${(potholeScore * 100).toFixed(0)}% MATCH`;
        isPothole = true;
        await new Promise(r => setTimeout(r, 1000));
        aiStatus = '';
      }
    } catch (err) {
      console.error("Detection Error:", err);
    } finally {
      scanning = false;
    }
  }
  
  async function handleUpload() {
    if (!file || !location || !isPothole || !severity) return;
    uploading = true;
    aiStatus = 'COMPRESSING IMAGE...';
    
    try {
      const compressedBlob = await compressImage(file);
      aiStatus = 'SECURING CHANNEL...';

      // 1. Get Secure Signature from Backend
      const signRes = await fetch(`${SUPABASE_URL}/functions/v1/sign-cloudinary-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!signRes.ok) {
        const errData = await signRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to get secure upload signature');
      }

      const { signature, timestamp, folder, apiKey } = await signRes.json();

      aiStatus = 'UPLOADING TO CLOUDINARY...';
      
      const formData = new FormData();
      formData.append('file', compressedBlob);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', folder);
      
      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!cloudinaryResponse.ok) {
        const errData = await cloudinaryResponse.json().catch(() => ({}));
        throw new Error(errData.error?.message || 'Cloudinary upload failed');
      }

      const cloudinaryData = await cloudinaryResponse.json();
      const imageUrl = cloudinaryData.secure_url;

      aiStatus = 'SAVING TO DATABASE...';

      const locObj = gpsCoords ? { lat: gpsCoords.lat, lng: gpsCoords.lng, name: location } : location;

      const reportData = {
        image_url: imageUrl,
        location: typeof locObj === 'object' ? JSON.stringify(locObj) : locObj,
        severity,
        votes: 0,
        created_at: new Date().toISOString()
      };

      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-pothole`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorText.slice(0, 100)}`);
      }

      let savedData: any[] = [];
      try { savedData = await response.json(); } catch {}

      const serverRecord = (Array.isArray(savedData) ? savedData[0] : savedData) || {};
      const finalReport: Report = { 
        ...reportData, 
        ...serverRecord, 
        location: locObj,
        id: serverRecord.id || Math.random().toString(), 
        isLocal: !serverRecord.id 
      };

      uploadSuccess = true;
      uploading = false;
      
      // Confetti
      const confetti = (await import('canvas-confetti')).default;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 10001,
        colors: ['#06b6d4', '#22d3ee', '#ffffff']
      });

      setTimeout(() => {
        onCreate(finalReport);
        // Reset state for next time (though component likely destroyed)
        uploadSuccess = false;
        file = null;
        preview = null;
        isPothole = false;
      }, 1500);
    } catch (err: any) {
      console.error('Upload failed:', err);
      aiStatus = 'UPLOAD FAILED ❌';
      uploading = false;
      alert(`Upload Error: ${err.message}`);
    }
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md {darkMode ? 'bg-black/30' : 'bg-black/5'}">
  <div class="w-full max-w-2xl rounded-[2.5rem] p-4 md:p-6 transition-all duration-300
    {darkMode 
      ? '' 
      : 'bg-white/20 border border-white/40 shadow-xl ring-1 ring-white/40 backdrop-blur-xl'
    }"
    style={darkMode ? `
      background: 
        linear-gradient(rgba(0, 0, 0, 0) 80%, rgba(255, 243, 215, 0.04) 100%), 
        linear-gradient(rgba(255, 243, 215, 0.04) 0%, rgba(0, 0, 0, 0) 20%), 
        linear-gradient(rgba(255, 242, 212, 0.04), rgba(255, 242, 212, 0.01)),
        rgba(6, 11, 25, 0.4);
      border: 1px solid rgba(255, 243, 215, 0.06);
      box-shadow: 
        rgba(10, 8, 5, 0.08) 0px 48px 56px 0px, 
        rgba(10, 8, 5, 0.12) 0px 24px 32px 0px, 
        inset 0px 0.5px 0.5px 0px rgba(255, 243, 215, 0.12), 
        inset 0px -0.5px 0.5px 0px rgba(255, 243, 215, 0.08), 
        inset 0px 4px 12px -6px rgba(255, 243, 215, 0.04);
    ` : ""}>
    
    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-2xl
          {darkMode ? '' : 'bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)]'}"
          style={darkMode ? `
            background: 
              linear-gradient(rgba(0, 0, 0, 0) 80%, rgba(255, 243, 215, 0.04) 100%), 
              linear-gradient(rgba(255, 243, 215, 0.04) 0%, rgba(0, 0, 0, 0) 20%), 
              linear-gradient(rgba(255, 242, 212, 0.06), rgba(255, 242, 212, 0.02));
            box-shadow: 
              inset 0px 0.5px 0.5px 0px rgba(255, 243, 215, 0.24), 
              inset 0px -0.5px 0.5px 0px rgba(255, 243, 215, 0.24);
          ` : ""}>
          <Camera size={20} class={darkMode ? 'text-cyan-400' : 'text-cyan-600'} />
        </div>
        <h2 class="text-xl font-bold tracking-tight {darkMode ? 'text-white' : 'text-slate-700'}">Mark My Pothole</h2>
      </div>
      <button 
        on:click={onClose} 
        class="p-2.5 rounded-full transition-all flex-shrink-0 hover:rotate-90 duration-300
          {darkMode ? '' : 'bg-white/40 border border-white/40 ring-1 ring-white/40 text-slate-500 hover:text-slate-800 hover:bg-white/60 shadow-sm backdrop-blur-md'}"
        style={darkMode ? `
          background: 
            linear-gradient(rgba(0, 0, 0, 0) 80%, rgba(255, 243, 215, 0.04) 100%), 
            linear-gradient(rgba(255, 243, 215, 0.04) 0%, rgba(0, 0, 0, 0) 20%), 
            linear-gradient(rgba(255, 242, 212, 0.06), rgba(255, 242, 212, 0.02));
          color: rgb(161, 161, 170);
          box-shadow: 
            inset 0px 0.5px 0.5px 0px rgba(255, 243, 215, 0.24), 
            inset 0px -0.5px 0.5px 0px rgba(255, 243, 215, 0.24);
        ` : ""}
      >
        <X size={18} />
      </button>
    </div>

    <div class="space-y-2">
      {#if uploadSuccess}
        <div class="py-16 flex flex-col items-center justify-center text-center space-y-6">
          <div class="w-24 h-24 rounded-[2rem] border-2 flex items-center justify-center
            {darkMode ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-green-500/5 border-green-500/10 text-green-600'}">
            <Trophy size={48} />
          </div>
          <div class="space-y-2">
            <h3 class="text-2xl font-black {darkMode ? 'text-white' : 'text-slate-800'}">Marked Successfully</h3>
            <p class="text-sm font-medium {darkMode ? 'text-zinc-500' : 'text-slate-400'}">Pothole coordinates logged into global database.</p>
          </div>
        </div>
      {:else}
        <div class="space-y-2.5">
          <!-- Upload Area -->
          <div>
            <div 
              on:click={() => !scanning && !uploading && document.getElementById('pothole-file')?.click()}
              on:keypress={() => {}}
              role="button"
              tabindex="0"
              class="cursor-pointer aspect-[2/1] rounded-[2rem] flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 group backdrop-blur-md border-2 border-dashed
                {darkMode ? 'bg-white/5 border-white/10 hover:border-cyan-400/50 hover:bg-white/[0.07]' : 'bg-black/5 border-black/5 hover:border-cyan-500/50 hover:bg-black/[0.07]'}
                {scanning || uploading ? 'cursor-wait opacity-80' : ''}"
            >
              {#if preview}
                <div class="relative w-full h-full">
                  <img src={preview} class="w-full h-full object-cover" alt="Preview" />
                  {#if scanning}
                    <div class="absolute inset-0 z-10 overflow-hidden pointer-events-none rounded-[2rem]">
                      <div class="absolute w-full h-[50%] bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent animate-scan" style="top: -50%;"></div>
                      <div class="absolute top-[50%] left-0 right-0 h-px bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-scan-line"></div>
                    </div>
                    
                    <div class="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-[2rem] z-20">
                      <div class="bg-black/80 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl shadow-2xl">
                        <div class="flex items-center gap-3">
                          <Loader2 size={16} class="text-cyan-400 animate-spin" />
                          <span class="font-bold text-xs tracking-widest text-white uppercase">{aiStatus}</span>
                        </div>
                      </div>
                    </div>
                  {/if}
                </div>
              {:else}
                <div class="flex flex-col items-center p-8 text-center space-y-4">
                  <div class="p-5 rounded-[2rem] transition-all group-hover:scale-110 duration-300 {darkMode ? 'bg-white/5 text-zinc-500' : 'bg-black/5 text-slate-400'}">
                    <Upload size={32} />
                  </div>
                  <div class="space-y-1">
                    <p class="text-sm font-bold {darkMode ? 'text-zinc-300' : 'text-slate-600'}">Select an Image</p>
                    <p class="text-[10px] font-medium {darkMode ? 'text-zinc-500' : 'text-slate-400'}">Supported formats: RAW, JPG, PNG (Max 10MB)</p>
                  </div>
                </div>
              {/if}
              <input id="pothole-file" type="file" accept="image/*" class="hidden" on:change={handleFileChange} disabled={scanning || uploading} />
            </div>
          </div>

          <!-- Location -->
          <div class="space-y-1.5 pb-3">
            <div class="space-y-1.5">
              <label for="location-input" class="text-[10px] font-bold tracking-[0.2em] uppercase pl-1 {darkMode ? 'text-zinc-500' : 'text-slate-400'}">
                Geographic Location
              </label>
              <div class="relative flex items-center p-1.5 rounded-2xl transition-all duration-300 backdrop-blur-md border
                {darkMode ? 'bg-white/5 border-white/10' : 'bg-white/40 border-black/5'} focus-within:ring-2 focus-within:ring-cyan-500/30">
                <input 
                  id="location-input"
                  type="text" 
                  bind:value={location}
                  placeholder="Automated GPS or Manual Address"
                  class="flex-1 bg-transparent p-2.5 font-bold outline-none text-[13px] {darkMode ? 'text-white placeholder-zinc-700' : 'text-slate-700 placeholder-slate-300'}"
                />
                <button 
                  on:click={detectLocation}
                  disabled={isLocating}
                  class="flex items-center justify-center gap-1.5 w-28 py-2.5 rounded-full text-[9px] font-black tracking-widest uppercase transition-all
                    {darkMode ? '' : 'bg-white/40 border border-white/40 ring-1 ring-white/40 text-cyan-600 hover:bg-white/60 shadow-sm backdrop-blur-md'}"
                  style={darkMode ? `
                    background: 
                      linear-gradient(rgba(0, 0, 0, 0) 80%, rgba(255, 243, 215, 0.04) 100%), 
                      linear-gradient(rgba(255, 243, 215, 0.04) 0%, rgba(0, 0, 0, 0) 20%), 
                      linear-gradient(rgba(255, 242, 212, 0.06), rgba(255, 242, 212, 0.02));
                    color: rgb(34, 211, 238);
                    border: 1px solid rgba(255, 243, 215, 0.06);
                    box-shadow: 
                      rgba(10, 8, 5, 0.12) 0px 4px 12px 0px, 
                      inset 0px 0.5px 0.5px 0px rgba(255, 243, 215, 0.24), 
                      inset 0px -0.5px 0.5px 0px rgba(255, 243, 215, 0.24),
                      inset 0px 2px 6px -3px rgba(255, 243, 215, 0.06);
                  ` : ""}
                >
                  {#if isLocating}
                    <Loader2 size={12} class="animate-spin" />
                    <span class="animate-pulse">Locating</span>
                  {:else}
                    <LocateFixed size={12} />
                    <span>Locate</span>
                  {/if}
                </button>
              </div>
            </div>

            <!-- Severity -->
            <div class="space-y-1.5">
              <span class="text-[10px] font-bold tracking-[0.2em] uppercase pl-1 {darkMode ? 'text-zinc-500' : 'text-slate-400'}">
                Threat Evaluation
              </span>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                {#each SIZES as s}
                  <button 
                    on:click={() => severity = s.level}
                    class="py-2.5 rounded-full font-black text-[9px] px-2 h-auto min-h-[40px] leading-tight backdrop-blur-md border uppercase tracking-wider
                      {severity === s.level 
                        ? 'text-white scale-[1.05] z-10' 
                        : darkMode 
                          ? '' 
                          : 'bg-white/40 border-white/40 ring-white/40 text-slate-500 hover:bg-white/60'
                      }"
                    style={darkMode ? `
                      background: 
                        linear-gradient(rgba(0, 0, 0, 0) 80%, rgba(255, 243, 215, 0.04) 100%), 
                        linear-gradient(rgba(255, 243, 215, 0.04) 0%, rgba(0, 0, 0, 0) 20%), 
                        linear-gradient(${severity === s.level ? 
                          (s.level === 1 ? 'rgba(34, 211, 238, 0.3)' : 
                           s.level === 2 ? 'rgba(14, 165, 233, 0.3)' : 
                           s.level === 3 ? 'rgba(59, 130, 246, 0.3)' : 
                           s.level === 4 ? 'rgba(99, 102, 241, 0.3)' : 
                           s.level === 5 ? 'rgba(139, 92, 246, 0.3)' : 
                           s.level === 6 ? 'rgba(217, 70, 239, 0.3)' : 
                           s.level === 7 ? 'rgba(244, 63, 94, 0.3)' : 
                           'rgba(220, 38, 38, 0.3)') : 
                          'rgba(255, 242, 212, 0.06)'}, ${severity === s.level ? 
                          (s.level === 1 ? 'rgba(34, 211, 238, 0.15)' : 
                           s.level === 2 ? 'rgba(14, 165, 233, 0.15)' : 
                           s.level === 3 ? 'rgba(59, 130, 246, 0.15)' : 
                           s.level === 4 ? 'rgba(99, 102, 241, 0.15)' : 
                           s.level === 5 ? 'rgba(139, 92, 246, 0.15)' : 
                           s.level === 6 ? 'rgba(217, 70, 239, 0.15)' : 
                           s.level === 7 ? 'rgba(244, 63, 94, 0.15)' : 
                           'rgba(220, 38, 38, 0.15)') : 
                          'rgba(255, 242, 212, 0.02)'});
                      color: ${severity === s.level ? '#fff' : 'rgb(161, 161, 170)'};
                      border: 1px solid ${severity === s.level ? 
                        (s.level === 1 ? 'rgba(34, 211, 238, 0.5)' : 
                         s.level === 2 ? 'rgba(14, 165, 233, 0.5)' : 
                         s.level === 3 ? 'rgba(59, 130, 246, 0.5)' : 
                         s.level === 4 ? 'rgba(99, 102, 241, 0.5)' : 
                         s.level === 5 ? 'rgba(139, 92, 246, 0.5)' : 
                         s.level === 6 ? 'rgba(217, 70, 239, 0.5)' : 
                         s.level === 7 ? 'rgba(244, 63, 94, 0.5)' : 
                         'rgba(220, 38, 38, 0.5)') : 
                        'rgba(255, 243, 215, 0.06)'};
                      box-shadow: 
                        ${severity === s.level ? 
                          (s.level === 1 ? 'rgba(34, 211, 238, 0.2)' : 
                           s.level === 2 ? 'rgba(14, 165, 233, 0.2)' : 
                           s.level === 3 ? 'rgba(59, 130, 246, 0.2)' : 
                           s.level === 4 ? 'rgba(99, 102, 241, 0.2)' : 
                           s.level === 5 ? 'rgba(139, 92, 246, 0.2)' : 
                           s.level === 6 ? 'rgba(217, 70, 239, 0.2)' : 
                           s.level === 7 ? 'rgba(244, 63, 94, 0.2)' : 
                           'rgba(220, 38, 38, 0.2)') + ' 0px 8px 20px -4px,' : 'rgba(10, 8, 5, 0.08) 0px 4px 6px 0px,'}
                        inset 0px 0.5px 0.5px 0px rgba(255, 243, 215, 0.12), 
                        inset 0px -0.5px 0.5px 0px rgba(255, 243, 215, 0.12);
                    ` : ""}
                  >
                    <div class="flex flex-col items-center gap-1">
                      <span>{s.title}</span>
                    </div>
                  </button>
                {/each}
              </div>
            </div>
          </div>

          <!-- Submit -->
          <button 
            on:click={handleUpload}
            disabled={uploading || scanning || !file || !location || !isPothole || !severity}
            class="w-full py-4 rounded-full font-black text-xs tracking-[0.2em] uppercase transition-all duration-300 disabled:opacity-30 disabled:grayscale mt-6
              {darkMode 
                ? '' 
                : 'bg-white/40 border border-white/40 ring-1 ring-white/40 text-slate-700 hover:bg-white/60 shadow-[0_20px_40px_-10px_rgba(15,23,42,0.1)] backdrop-blur-md'
              }"
            style={darkMode ? `
              background: 
                linear-gradient(rgba(0, 0, 0, 0) 80%, rgba(255, 243, 215, 0.04) 100%), 
                linear-gradient(rgba(255, 243, 215, 0.04) 0%, rgba(0, 0, 0, 0) 20%), 
                linear-gradient(rgba(255, 242, 212, 0.06), rgba(255, 242, 212, 0.02));
              color: white;
              border: 1px solid rgba(255, 243, 215, 0.06);
              box-shadow: 
                rgba(34, 211, 238, 0.1) 0px 20px 40px -10px, 
                inset 0px 0.5px 0.5px 0px rgba(255, 243, 215, 0.24), 
                inset 0px -0.5px 0.5px 0px rgba(255, 243, 215, 0.24);
            ` : ""}
          >
            {#if uploading}
              <div class="flex items-center justify-center gap-3">
                <Loader2 size={16} class="animate-spin" />
                <span>Marking...</span>
              </div>
            {:else}
              Mark It
            {/if}
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>
