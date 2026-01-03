<script lang="ts">
  import { ChevronUp } from 'lucide-svelte';
  import { playPopSound } from '$lib/stores';
  
  export let onVote: () => void;
  export let votes: number = 0;
  export let size: 'sm' | 'md' = 'md';
  export let darkMode: boolean = true;
  export let soundEnabled: boolean = true;
  
  let isAnimating = false;
  let burstKey = 0;
  
  const sizes = {
    sm: { height: 'h-8', padding: 'px-3', icon: 12, text: 'text-[11px]' },
    md: { height: 'h-9', padding: 'px-3.5', icon: 14, text: 'text-xs' }
  };
  
  $: s = sizes[size] || sizes.md;
  
  function handleClick(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    
    playPopSound(soundEnabled);
    isAnimating = true;
    burstKey++;
    onVote();
    
    setTimeout(() => isAnimating = false, 700);
  }
</script>

<button
  on:click={handleClick}
  class="relative {s.height} {s.padding} rounded-full font-bold {s.text} transition-all duration-200 flex items-center gap-2 flex-shrink-0 hover:scale-105 active:scale-90
    {isAnimating && darkMode
      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_20px_rgba(34,211,238,0.5)]'
      : isAnimating
        ? 'bg-gradient-to-r from-cyan-400 to-blue-400 text-white shadow-[0_0_20px_rgba(34,211,238,0.4)]'
        : darkMode 
          ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] text-cyan-400 shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:from-[#323d5e] hover:to-[#252f4e]' 
          : 'bg-white text-cyan-600 shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]'
    }"
>
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    width={s.icon} 
    height={s.icon}
    class="{isAnimating ? 'text-white animate-wiggle' : (darkMode ? 'text-cyan-400' : 'text-cyan-500')}"
  >
    <path d="M4 14h4v7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7h4a1.001 1.001 0 0 0 .781-1.625l-8-10c-.381-.475-1.181-.475-1.562 0l-8 10A1.001 1.001 0 0 0 4 14z"/>
  </svg>
  
  <span class="inline-block font-bold tracking-wide {isAnimating ? 'text-white' : ''}">
    {votes}
  </span>
  
  {#if isAnimating}
    <div class="absolute inset-0 pointer-events-none overflow-visible">
      {#key burstKey}
        {#each Array(12) as _, i}
          {@const angle = (i * 30 * Math.PI) / 180}
          {@const x = Math.cos(angle) * 45}
          {@const y = Math.sin(angle) * 45}
          {@const colors = ['#22d3ee', '#c084fc', '#f472b6', '#34d399']}
          {@const color = colors[i % 4]}
          <div
            class="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full animate-upvote-burst"
            style="background-color: {color}; box-shadow: 0 0 10px {color}; --travel: translate(calc(-50% + {x}px), calc(-50% + {y}px));"
          ></div>
        {/each}
      {/key}
    </div>
  {/if}
</button>
