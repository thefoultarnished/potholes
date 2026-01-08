<script lang="ts">
  import { X, ZoomIn, ZoomOut, RotateCcw, Maximize, Minimize, MapPin, Calendar, Activity, Zap, Skull, AlertTriangle, Crosshair, Share2 } from 'lucide-svelte';
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
  let shareStatus = '';

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

  // Share functionality
  async function handleShare() {
    const shareUrl = `${window.location.origin}?pothole=${data.id}`;
    const shareText = `Check out this pothole at ${getDisplayLocation(data.location)}! ${sizeInfo.label} damage with ${data.votes} votes.`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MarkMyPothole Report',
          text: shareText,
          url: shareUrl
        });
        shareStatus = 'Shared!';
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await copyToClipboard(shareUrl);
        }
      }
    } else {
      await copyToClipboard(shareUrl);
    }
    
    setTimeout(() => shareStatus = '', 2000);
  }
  
  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      shareStatus = 'Link copied!';
      playPopSound(soundEnabled);
    } catch {
      shareStatus = 'Copy failed';
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
  <!-- Outer wrapper for clipping rounded corners + border/shadow -->
  <div 
    class="{fullScreen 
      ? 'fixed inset-0 w-screen h-screen max-w-none z-[70]' 
      : 'w-full max-w-xl md:max-w-4xl max-h-[92vh] md:max-h-none rounded-[2rem]'
    } overflow-hidden transition-all duration-300 border {
      darkMode 
        ? 'border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]' 
        : 'border-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.8)]'
    }"
  >
    <div 
      class="w-full h-full flex {fullScreen ? 'flex-col' : 'flex-col md:flex-row'} {fullScreen ? '' : 'overflow-y-auto md:overflow-visible'} backdrop-blur-[75px] {
        darkMode 
          ? 'bg-[#0f172a]/60' 
          : 'bg-white/70'
      }"
      on:click|stopPropagation
      on:keydown|stopPropagation
      role="dialog"
      tabindex="-1"
    >
    <!-- MOBILE: Header with title/location at TOP (hidden on desktop) -->
    {#if !fullScreen}
      <div class="md:hidden p-4 pb-2 flex justify-between items-start">
        <div class="space-y-1 flex-1 min-w-0">
          <div class="flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse flex-shrink-0"></div>
            <span class="text-[10px] font-bold {darkMode ? 'text-cyan-400' : 'text-cyan-600'}">{sizeInfo.label} Damage</span>
          </div>
          <h2 class="text-lg font-black tracking-tight leading-tight truncate {darkMode ? 'text-white' : 'text-slate-800'}">
            {sizeInfo.title}
          </h2>
          <div class="flex items-center gap-1 text-xs font-medium {darkMode ? 'text-zinc-400' : 'text-slate-500'}">
            <MapPin size={12} class={darkMode ? 'text-cyan-400' : 'text-cyan-600'} />
            <span class="line-clamp-1">{getDisplayLocation(data.location)}</span>
          </div>
        </div>
        <button 
          on:click={onClose} 
          class="p-2 rounded-full transition-all flex-shrink-0 border ring-1 backdrop-blur-md ml-2 {
            darkMode 
              ? 'bg-white/[0.05] border-white/10 ring-white/5 text-zinc-400 hover:text-white' 
              : 'bg-white/40 border-white/40 ring-white/40 text-slate-500 hover:text-slate-800'
          }"
        >
          <X size={18} />
        </button>
      </div>
    {/if}

    <!-- Image Section -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div 
      class="relative overflow-hidden group {$zoom > 1 ? 'cursor-grab' : 'cursor-zoom-in'} {isDragging ? 'cursor-grabbing' : ''} {fullScreen ? 'flex-1 w-full h-full' : 'flex-1 aspect-square md:aspect-auto'} {darkMode ? 'bg-black' : 'bg-slate-300/50'}"
      on:mousemove={handleMouseMove}
      on:mouseup={handleMouseUp}
      on:mouseleave={handleMouseUp}
      role="application"
      aria-label="Image viewer - drag to pan when zoomed"
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
          class="absolute top-6 right-6 p-2 rounded-full transition-all z-50 border ring-1 backdrop-blur-md {
            darkMode 
              ? 'bg-white/10 border-white/10 ring-white/5 text-white hover:bg-white/20' 
              : 'bg-black/10 border-white/40 ring-white/40 text-slate-700 hover:bg-black/20'
          }"
        >
          <X size={16} />
        </button>
      {/if}
    </div>

    <!-- Details Section -->
    {#if !fullScreen}
      <div class="w-full md:w-[400px] p-4 md:p-8 flex flex-col md:h-full md:max-h-[90vh] md:overflow-y-auto">
        <!-- Details Header - Desktop only (mobile header is at top) -->
        <div class="hidden md:flex justify-between items-start mb-8">
          <div class="space-y-1">
            <div class="text-[10px] font-bold tracking-[0.2em] uppercase {darkMode ? 'text-cyan-400/70' : 'text-cyan-600'}">
              Subject Inspection
            </div>
            <h2 class="text-3xl font-black tracking-tight leading-tight {darkMode ? 'text-white' : 'text-slate-800'}">
              {sizeInfo.title}
            </h2>
            <div class="flex items-center gap-1.5 text-sm font-medium {darkMode ? 'text-zinc-400' : 'text-slate-500'}">
              <MapPin size={14} class={darkMode ? 'text-cyan-400' : 'text-cyan-600'} />
              <span class="line-clamp-1">{getDisplayLocation(data.location)}</span>
            </div>
          </div>
          <button 
            on:click={onClose} 
            class="p-2.5 rounded-full transition-all flex-shrink-0 hover:rotate-90 duration-300 border ring-1 backdrop-blur-md {
              darkMode 
                ? 'bg-white/[0.05] border-white/10 ring-white/5 text-zinc-400 hover:text-white hover:bg-white/10' 
                : 'bg-white/40 border-white/40 ring-white/40 text-slate-500 hover:text-slate-800 hover:bg-white/60 shadow-sm'
            }"
          >
            <X size={20} />
          </button>
        </div>

        <!-- Info Cards -->
        <!-- Cards in horizontal layout on mobile, vertical on desktop -->
        <div class="flex flex-row md:flex-col gap-3 md:gap-4">
          <!-- Threat Level Card -->
          <div class="flex-1 p-4 md:p-5 rounded-2xl md:rounded-[2rem] border transition-all duration-300 {
            darkMode 
              ? 'bg-white/[0.03] border-white/10 shadow-[inner_0_0_20px_rgba(0,0,0,0.2)]' 
              : 'bg-white/40 border-white/60 shadow-sm'
          }">
            <div class="text-[8px] md:text-[9px] font-bold tracking-widest uppercase mb-1 md:mb-2 text-center {darkMode ? 'text-zinc-500' : 'text-slate-400'}">
              Threat Level
            </div>
            <div class="flex flex-col items-center gap-1 md:gap-2">
              <div class="{sizeInfo.textColor}">
                {#if sizeInfo.icon === 'Coffee'}
                  <svelte:component this={Activity} size={24} class="md:hidden" strokeWidth={2.5} />
                  <svelte:component this={Activity} size={40} class="hidden md:block" strokeWidth={2.5} />
                {:else if sizeInfo.icon === 'Activity'}
                  <svelte:component this={Activity} size={24} class="md:hidden" strokeWidth={2.5} />
                  <svelte:component this={Activity} size={40} class="hidden md:block" strokeWidth={2.5} />
                {:else if sizeInfo.icon === 'Zap'}
                  <svelte:component this={Zap} size={24} class="md:hidden" strokeWidth={2.5} />
                  <svelte:component this={Zap} size={40} class="hidden md:block" strokeWidth={2.5} />
                {:else if sizeInfo.icon === 'Cog'}
                  <Activity size={24} class="md:hidden" strokeWidth={2.5} />
                  <Activity size={40} class="hidden md:block" strokeWidth={2.5} />
                {:else if sizeInfo.icon === 'Skull'}
                  <Skull size={24} class="md:hidden" strokeWidth={2.5} />
                  <Skull size={40} class="hidden md:block" strokeWidth={2.5} />
                {:else if sizeInfo.icon === 'Waves'}
                  <Activity size={24} class="md:hidden" strokeWidth={2.5} />
                  <Activity size={40} class="hidden md:block" strokeWidth={2.5} />
                {:else if sizeInfo.icon === 'AlertTriangle'}
                  <AlertTriangle size={24} class="md:hidden" strokeWidth={2.5} />
                  <AlertTriangle size={40} class="hidden md:block" strokeWidth={2.5} />
                {:else}
                  <Activity size={24} class="md:hidden" strokeWidth={2.5} />
                  <Activity size={40} class="hidden md:block" strokeWidth={2.5} />
                {/if}
              </div>
              <div class="text-sm md:text-2xl font-black tracking-tight text-center {sizeInfo.textColor}">
                {sizeInfo.title}
              </div>
              <div class="text-[8px] md:text-[10px] font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full {darkMode ? 'bg-white/10 text-cyan-400' : 'bg-cyan-50 text-cyan-700'}">
                {sizeInfo.label}
              </div>
            </div>
          </div>

          <!-- Public Outrage Card -->
          <div class="flex-1 p-4 md:p-5 rounded-2xl md:rounded-[2rem] border transition-all duration-300 {
            darkMode 
              ? 'bg-white/[0.03] border-white/10 shadow-[inner_0_0_20px_rgba(0,0,0,0.2)]' 
              : 'bg-white/40 border-white/60 shadow-sm'
          }">
            <div class="flex flex-col items-center text-center">
              <div class="text-[8px] md:text-[9px] font-bold tracking-widest uppercase mb-2 md:mb-4 {darkMode ? 'text-zinc-500' : 'text-slate-400'}">
                Public Outrage
              </div>
              <UpvoteButton onVote={onVote} votes={data.votes} size="sm" {darkMode} {soundEnabled} />
              <p class="hidden md:block text-[10px] mt-4 leading-relaxed font-medium max-w-[220px] {darkMode ? 'text-zinc-500' : 'text-slate-400'}">
                High interaction levels escalate this hazard into the <span class={darkMode ? 'text-cyan-400' : 'text-cyan-600'}>Hall of Shame</span>.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Share Button -->
        <div class="mt-3 md:mt-4">
          <button 
            on:click={handleShare}
            class="w-full py-2 md:py-3 rounded-xl md:rounded-2xl font-bold text-[10px] md:text-xs tracking-wide transition-all flex items-center justify-center gap-2 border ring-1 backdrop-blur-md
              {darkMode 
                ? 'bg-white/[0.05] border-white/10 ring-white/5 text-cyan-400 hover:bg-white/10' 
                : 'bg-white/40 border-white/40 ring-white/40 text-cyan-600 hover:bg-white/60'
              }"
          >
            <Share2 size={14} class="md:hidden" />
            <Share2 size={16} class="hidden md:block" />
            {shareStatus || 'Share'}
          </button>
        </div>
        
        <!-- Footer Info - Hidden on mobile -->
        <div class="hidden md:flex mt-auto pt-8 flex-col gap-4">
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
</div>

