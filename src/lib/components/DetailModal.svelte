<script lang="ts">
  import { X, ZoomIn, ZoomOut, RotateCcw, Maximize, Minimize, MapPin, Calendar, Activity, Zap, Skull, AlertTriangle, Crosshair } from 'lucide-svelte';
  import UpvoteButton from './UpvoteButton.svelte';
  import { getSizeFromSeverity, getDisplayLocation, formatDate, playPopSound, type Report } from '$lib/stores';
  import { spring } from 'svelte/motion';
  import { fade, scale } from 'svelte/transition';

  export let data: Report;
  export let onClose: () => void;
  export let onVote: () => void;
  export let darkMode: boolean;
  export let soundEnabled: boolean;

  $: sizeInfo = getSizeFromSeverity(data.severity);

  let fullScreen = false;
  let isDragging = false;
  let startMousePos = { x: 0, y: 0 };
  let startImagePos = { x: 0, y: 0 };
  let dragDistance = 0;

  // Spring animations for smooth movement/zooming like Framer Motion
  const zoom = spring(1, { stiffness: 0.1, damping: 0.8 });
  const pos = spring({ x: 0, y: 0 }, { stiffness: 0.15, damping: 0.8 });

  function handleZoom(delta: number) {
    const nextZoom = Math.min(Math.max($zoom + delta, 1), 5);
    zoom.set(nextZoom);
    if (nextZoom === 1) pos.set({ x: 0, y: 0 });
    playPopSound(soundEnabled);
  }

  function resetZoom() {
    zoom.set(1);
    pos.set({ x: 0, y: 0 });
    playPopSound(soundEnabled);
  }

  function toggleFullScreen() {
    fullScreen = !fullScreen;
    resetZoom();
    playPopSound(soundEnabled);
  }

  function handleMouseDown(e: MouseEvent) {
    if ($zoom <= 1) return;
    isDragging = true;
    dragDistance = 0;
    startMousePos = { x: e.clientX, y: e.clientY };
    startImagePos = { ...$pos };
    e.preventDefault();
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    const dx = e.clientX - startMousePos.x;
    const dy = e.clientY - startMousePos.y;
    dragDistance = Math.abs(dx) + Math.abs(dy);
    // Use hard: true for instant drag response without spring lag during drag
    pos.set({
      x: startImagePos.x + dx,
      y: startImagePos.y + dy
    }, { hard: true });
  }

  function handleMouseUp() {
    isDragging = false;
  }

  function handleImageClick(e: MouseEvent) {
    if (dragDistance > 5) return;
    if ($zoom > 1) {
      resetZoom();
    } else {
      handleZoom(1.5);
    }
  }

  // Handle keyboard events for accessibility
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<div 
  class="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl {fullScreen ? 'z-[60]' : ''} {darkMode ? 'bg-black/30' : 'bg-black/5'}"
  on:click={onClose}
  on:keydown={(e) => e.key === 'Escape' && onClose()}
  role="button"
  tabindex="0"
  transition:fade={{ duration: 200 }}
>
  <div 
    class="{fullScreen 
      ? 'fixed inset-0 w-screen h-screen max-w-none rounded-none z-[70] flex flex-col' 
      : 'w-full max-w-xl md:max-w-4xl max-h-[92vh] md:max-h-none overflow-y-auto md:overflow-visible rounded-[2rem] flex flex-col md:flex-row'
    } overflow-hidden transition-all duration-300 backdrop-blur-[75px] border {
      darkMode 
        ? 'bg-[#0f172a]/60 border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]' 
        : 'bg-white/70 border-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.8)]'
    }"
    on:click|stopPropagation
    on:keydown|stopPropagation
    role="dialog"
    tabindex="-1"
    transition:scale={{ duration: 300, start: 0.95 }}
  >
    <!-- Image Section -->
    <div 
      class="relative overflow-hidden group {$zoom > 1 ? 'cursor-grab' : 'cursor-zoom-in'} {isDragging ? 'cursor-grabbing' : ''} {fullScreen ? 'flex-1 w-full h-full' : 'flex-1 aspect-video md:aspect-auto rounded-t-[2rem] md:rounded-l-[2rem] md:rounded-tr-none'} {darkMode ? 'bg-black' : 'bg-slate-300/50'}"
      on:mousemove={handleMouseMove}
      on:mouseup={handleMouseUp}
      on:mouseleave={handleMouseUp}
      role="application"
    >
      <div 
        class="w-full h-full flex items-center justify-center"
        style="transform: scale({$zoom}) translate({$pos.x / $zoom}px, {$pos.y / $zoom}px);"
        on:mousedown={handleMouseDown}
        on:click={handleImageClick}
        on:keydown={(e) => e.key === 'Enter' && handleImageClick(e as any)}
        role="button"
        tabindex="0"
      >
        <img 
          src={data.image_url} 
          class="w-full h-full {fullScreen ? 'object-contain' : 'object-cover'} select-none pointer-events-none" 
          alt="Pothole Inspection" 
        />
      </div>

      <!-- Controls Overlay -->
      <div 
        class="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl z-50" 
        on:click|stopPropagation
        on:keydown|stopPropagation
        role="toolbar"
        tabindex="0"
      >
        <button on:click={() => handleZoom(0.5)} class="p-3 rounded-xl hover:bg-white/10 text-white transition-colors" title="Zoom In"><ZoomIn size={18} /></button>
        <div class="w-px h-6 bg-white/10"></div>
        <button on:click={() => handleZoom(-0.5)} class="p-3 rounded-xl hover:bg-white/10 text-white transition-colors" title="Zoom Out"><ZoomOut size={18} /></button>
        <div class="w-px h-6 bg-white/10"></div>
        <button on:click={resetZoom} class="p-3 rounded-xl hover:bg-white/10 text-white transition-colors" title="Reset Camera"><RotateCcw size={18} /></button>
        <div class="w-px h-6 bg-white/10"></div>
        <button on:click={toggleFullScreen} class="p-3 rounded-xl hover:bg-white/10 text-white transition-colors" title={fullScreen ? "Exit Full Screen" : "Enter Full Screen"}>
          {#if fullScreen}
            <Minimize size={18} />
          {:else}
            <Maximize size={18} />
          {/if}
        </button>
      </div>

      <!-- Badge Overlay -->
      <div class="absolute top-6 left-6 text-[10px] font-bold px-4 py-2 rounded-full flex items-center gap-2 z-50 {
        darkMode 
          ? 'bg-white/10 text-white backdrop-blur-md' 
          : 'bg-black/10 text-slate-700 backdrop-blur-md'
      }">
        <div class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
        {fullScreen ? 'Cinematic Mode' : `${sizeInfo.label} Damage`}
      </div>

      {#if fullScreen}
        <button 
          on:click={toggleFullScreen}
          class="absolute top-6 right-6 p-4 rounded-full backdrop-blur-md transition-all z-50 {
            darkMode 
              ? 'bg-white/10 hover:bg-white/20 text-white' 
              : 'bg-black/10 hover:bg-black/20 text-slate-700'
          }"
        >
          <X size={24} />
        </button>
      {/if}
    </div>

    <!-- Details Section -->
    {#if !fullScreen}
      <div class="w-full md:w-[400px] p-6 md:p-8 flex flex-col md:h-full md:max-h-[90vh] md:overflow-y-auto">
        <!-- Details Header -->
        <div class="flex justify-between items-start mb-8">
          <div class="space-y-1">
            <div class="text-[10px] font-bold tracking-[0.2em] uppercase {darkMode ? 'text-cyan-400/70' : 'text-cyan-600'}">
              Subject Inspection
            </div>
            <h2 class="text-3xl font-black tracking-tight leading-tight {darkMode ? 'text-white' : 'text-slate-800'}">
              {sizeInfo.title}
            </h2>
            <div class="flex items-center gap-1.5 text-sm font-medium {darkMode ? 'text-zinc-400' : 'text-slate-500'}">
              <MapPin size={14} class={darkMode ? 'text-cyan-400' : 'text-cyan-600'} />
              {getDisplayLocation(data.location)}
            </div>
          </div>
          <button 
            on:click={onClose} 
            class="p-2.5 rounded-full transition-all flex-shrink-0 hover:rotate-90 duration-300 {
              darkMode 
                ? 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white' 
                : 'bg-black/5 hover:bg-black/10 text-slate-500 hover:text-slate-800'
            }"
          >
            <X size={20} />
          </button>
        </div>

        <!-- Info Cards -->
        <div class="space-y-4">
          <!-- Threat Level Card -->
          <div class="p-5 rounded-[2rem] border transition-all duration-300 {
            darkMode 
              ? 'bg-white/[0.03] border-white/10 shadow-[inner_0_0_20px_rgba(0,0,0,0.2)]' 
              : 'bg-white/40 border-white/60 shadow-sm'
          }">
            <div class="text-[9px] font-bold tracking-widest uppercase mb-2 text-center {darkMode ? 'text-zinc-500' : 'text-slate-400'}">
              Threat Level
            </div>
            <div class="flex flex-col items-center gap-2">
              <div class="text-4xl {sizeInfo.textColor}">
                {#if sizeInfo.icon === 'Coffee'}
                  <svelte:component this={Activity} size={40} strokeWidth={2.5} />
                {:else if sizeInfo.icon === 'Activity'}
                  <svelte:component this={Activity} size={40} strokeWidth={2.5} />
                {:else if sizeInfo.icon === 'Zap'}
                  <svelte:component this={Zap} size={40} strokeWidth={2.5} />
                {:else if sizeInfo.icon === 'Cog'}
                  <Activity size={40} strokeWidth={2.5} /> 
                {:else if sizeInfo.icon === 'Skull'}
                  <Skull size={40} strokeWidth={2.5} />
                {:else if sizeInfo.icon === 'Waves'}
                  <Activity size={40} strokeWidth={2.5} />
                {:else if sizeInfo.icon === 'AlertTriangle'}
                  <AlertTriangle size={40} strokeWidth={2.5} />
                {:else}
                  <Activity size={40} strokeWidth={2.5} />
                {/if}
              </div>
              <div class="text-2xl font-black tracking-tight {sizeInfo.textColor}">
                {sizeInfo.title}
              </div>
              <div class="text-[10px] font-bold px-3 py-1 rounded-full {darkMode ? 'bg-white/10 text-cyan-400' : 'bg-cyan-50 text-cyan-700'}">
                {sizeInfo.label}
              </div>
            </div>
          </div>

          <!-- Public Outrage Card -->
          <div class="p-5 rounded-[2rem] border transition-all duration-300 {
            darkMode 
              ? 'bg-white/[0.03] border-white/10 shadow-[inner_0_0_20px_rgba(0,0,0,0.2)]' 
              : 'bg-white/40 border-white/60 shadow-sm'
          }">
            <div class="flex flex-col items-center text-center">
              <div class="text-[9px] font-bold tracking-widest uppercase mb-4 {darkMode ? 'text-zinc-500' : 'text-slate-400'}">
                Public Outrage
              </div>
              <UpvoteButton onVote={onVote} votes={data.votes} size="md" {darkMode} {soundEnabled} />
              <p class="text-[10px] mt-4 leading-relaxed font-medium max-w-[220px] {darkMode ? 'text-zinc-500' : 'text-slate-400'}">
                High interaction levels escalate this hazard into the <span class={darkMode ? 'text-cyan-400' : 'text-cyan-600'}>Hall of Shame</span>.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Footer Info -->
        <div class="mt-auto pt-8 flex flex-col gap-4">
          <div class="flex items-center gap-3 p-4 rounded-2xl border {darkMode ? 'bg-black/20 border-white/5' : 'bg-white/30 border-black/5'}">
            <div class="p-2 rounded-xl {darkMode ? 'bg-white/5' : 'bg-black/5'}">
              <Calendar size={14} class={darkMode ? 'text-cyan-400' : 'text-cyan-600'} />
            </div>
            <div class="flex flex-col">
              <span class="text-[9px] font-bold tracking-widest uppercase {darkMode ? 'text-zinc-600' : 'text-slate-400'}">DISCOVERED ON</span>
              <span class="text-xs font-bold {darkMode ? 'text-zinc-400' : 'text-slate-600'}">{formatDate(data.created_at)}</span>
            </div>
          </div>
          <div class="text-[9px] text-center font-bold tracking-tight {darkMode ? 'text-zinc-700' : 'text-slate-300'}">
            ID: {data.id.toString().toUpperCase().slice(0, 16)} • REPORT_AUTH_SECURED
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

