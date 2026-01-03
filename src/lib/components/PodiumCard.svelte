<script lang="ts">
  import UpvoteButton from './UpvoteButton.svelte';
  import { getSizeFromSeverity, getAuraByRank, getDisplayLocation, formatDate, type Report } from '$lib/stores';
  
  export let data: Report;
  export let rank: number;
  export let onVote: () => void;
  export let onSelect: (data: Report) => void;
  export let darkMode: boolean;
  export let soundEnabled: boolean;
  
  $: sizeInfo = getSizeFromSeverity(data.severity);
  $: aura = getAuraByRank(rank);
  $: isChampion = rank === 1;
</script>

<div
  on:click={() => onSelect(data)}
  on:keypress={() => onSelect(data)}
  role="button"
  tabindex="0"
  class="relative rounded-2xl cursor-pointer backdrop-blur-sm border transition-all duration-300 hover:-translate-y-1 {aura?.frameClass || ''}
    {isChampion 
      ? 'w-full sm:w-[33%] order-1 sm:order-2 z-10 overflow-visible scale-[1.02] sm:scale-105 mb-2 sm:mb-0' 
      : 'w-[48%] sm:w-[33%] overflow-hidden ' + (rank === 2 ? 'order-2 sm:order-1' : 'order-3 sm:order-3')
    }
    {darkMode 
      ? 'bg-white/[0.03] border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)]' 
      : 'bg-white/20 border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.08)]'
    }"
>
  <!-- Rank Badge -->
  <div class="absolute top-3 left-3 z-20">
    <div class="font-black rounded-xl flex items-center justify-center backdrop-blur-md
      {isChampion 
        ? 'w-10 h-10 text-sm shadow-[0_4px_16px_rgba(6,182,212,0.4)] ' + (darkMode ? 'bg-gradient-to-b from-cyan-400 to-cyan-500 text-cyan-950' : 'bg-gradient-to-b from-cyan-500 to-cyan-600 text-white')
        : rank === 2
          ? 'w-8 h-8 text-xs ' + (darkMode ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] text-zinc-300 shadow-[0_2px_8px_rgba(0,0,0,0.3)]' : 'bg-white/80 text-slate-600 shadow-[0_2px_8px_rgba(0,0,0,0.1)]')
          : 'w-8 h-8 text-xs ' + (darkMode ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] text-zinc-400 shadow-[0_2px_8px_rgba(0,0,0,0.3)]' : 'bg-white/80 text-slate-500 shadow-[0_2px_8px_rgba(0,0,0,0.1)]')
      }">
      #{rank}
    </div>
  </div>

  <div class="relative overflow-hidden cursor-pointer {isChampion ? 'h-52 sm:h-52 rounded-t-2xl' : 'h-48 sm:h-48'}">
    <img src={data.image_url} alt={getDisplayLocation(data.location)} class="w-full h-full object-cover" loading="lazy" />
    
    {#if isChampion}
      <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
    {/if}

    <div class="absolute top-2 right-2 text-white font-bold px-2 py-0.5 rounded-full backdrop-blur-md {isChampion ? 'text-[9px]' : 'text-[8px]'} {darkMode ? 'bg-white/10' : 'bg-black/20'}">
      {sizeInfo.label}
    </div>

    {#if aura}
      <div class="absolute bottom-2 left-2 text-white text-[8px] font-bold px-2.5 py-1 rounded-full shadow-lg backdrop-blur-md {aura.className}">
        {aura.label}
      </div>
    {/if}
  </div>

  <div class="{isChampion ? 'p-4' : 'p-3'} {darkMode ? 'bg-black/10' : 'bg-white/10'}">
    <h4 class="font-bold mb-1.5 leading-tight line-clamp-2 {isChampion ? 'text-sm' : 'text-xs min-h-[2.5em]'} {darkMode ? 'text-white' : 'text-slate-800'}">
      {getDisplayLocation(data.location)}
    </h4>
    
    {#if isChampion}
      <p class="text-[13px] italic mb-2 {darkMode ? 'text-orange-400/80' : 'text-orange-500/80'}">
        "Congrats! You've ruined more tires than a Formula 1 pit stop."
      </p>
    {/if}
    
    {#if rank === 2}
      <p class="hidden sm:block text-[12px] italic mb-1.5 {darkMode ? 'text-violet-400/70' : 'text-violet-500/70'}">
        "Almost the worst. Try harder next time."
      </p>
    {/if}
    
    {#if rank === 3}
      <p class="hidden sm:block text-[12px] italic mb-1.5 {darkMode ? 'text-sky-300/70' : 'text-sky-500/70'}">
        "Bronze in destruction. Still impressive."
      </p>
    {/if}
    
    <div class="flex items-center justify-between gap-2">
      <span class="font-medium {isChampion ? 'text-xs' : 'text-[10px]'} {darkMode ? 'text-zinc-300' : 'text-slate-600'}">
        {formatDate(data.created_at)}
      </span>
      <UpvoteButton {onVote} votes={data.votes} size="sm" {darkMode} {soundEnabled} />
    </div>
  </div>
</div>
