<script lang="ts">
  import UpvoteButton from './UpvoteButton.svelte';
  import { getSizeFromSeverity, getDisplayLocation, formatDate, type Report } from '$lib/stores';
  
  export let data: Report;
  export let index: number;
  export let onVote: () => void;
  export let onSelect: (data: Report) => void;
  export let darkMode: boolean;
  export let soundEnabled: boolean;
  
  $: sizeInfo = getSizeFromSeverity(data.severity);
</script>

<div
  class="rounded-3xl overflow-hidden backdrop-blur-sm border cursor-pointer transition-all duration-300 hover:-translate-y-1
    {darkMode 
      ? 'bg-white/[0.03] border-white/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(6,182,212,0.2)]' 
      : 'bg-white/20 border-white/30 shadow-[0_8px_24px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_40px_rgba(6,182,212,0.1)]'
    }"
  style="animation-delay: {index * 50}ms"
>
  <div class="aspect-square relative overflow-hidden group" on:click={() => onSelect(data)} on:keypress={() => onSelect(data)} role="button" tabindex="0">
    <img 
      src={data.image_url.includes('cloudinary') ? data.image_url.replace('/upload/', '/upload/w_500,h_500,c_fill,f_auto,q_auto/') : data.image_url} 
      alt={getDisplayLocation(data.location)} 
      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      loading="lazy"
      on:error={(e) => {
        const target = e.target as HTMLImageElement;
        target.onerror = null;
        target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect fill="%23374151" width="400" height="400"/><text fill="%239ca3af" font-family="sans-serif" font-size="24" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">Image Not Available</text></svg>';
      }}
    />
    <div class="absolute top-3 left-3 text-white text-[9px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md {darkMode ? 'bg-white/10' : 'bg-black/20'}">
      {sizeInfo.label}
    </div>
  </div>

  <div class="p-4">
    <h4 class="text-sm font-bold mb-2 leading-tight line-clamp-2 min-h-[2.8em] {darkMode ? 'text-white' : 'text-slate-800'}">
      {getDisplayLocation(data.location)}
    </h4>
    <div class="flex items-center justify-between gap-2">
      <span class="text-xs font-medium {darkMode ? 'text-zinc-400' : 'text-slate-500'}">
        {formatDate(data.created_at)}
      </span>
      <UpvoteButton {onVote} votes={data.votes} size="sm" {darkMode} {soundEnabled} />
    </div>
  </div>
</div>
