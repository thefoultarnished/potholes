<script lang="ts">
  import { playPopSound } from '$lib/stores';
  import AnimatedCounter from './AnimatedCounter.svelte';
  
  export let onVote: () => void;
  export let votes: number = 0;
  export let size: 'sm' | 'md' = 'md';
  export let darkMode: boolean = true;
  export let soundEnabled: boolean = true;
  
  const sizes = {
    sm: { height: 'h-9', padding: 'px-3', icon: 16, text: 'text-[13px]', fontSize: 13 },
    md: { height: 'h-10', padding: 'px-4', icon: 18, text: 'text-sm', fontSize: 14 }
  };
  
  $: s = sizes[size] || sizes.md;
  
  function handleClick(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    
    playPopSound(soundEnabled);
    onVote();
  }
</script>

<button
  on:click={handleClick}
  class="relative {s.height} {s.padding} rounded-full font-bold {s.text} transition-all duration-200 flex items-center gap-2 flex-shrink-0 hover:scale-105 border ring-1 backdrop-blur-md
    {darkMode 
      ? 'bg-white/[0.05] border-white/10 ring-white/5 text-cyan-400 hover:bg-white/10' 
      : 'bg-white/40 border-white/40 ring-white/40 text-cyan-600 hover:bg-white/60 shadow-sm'
    }"
>
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    width={s.icon} 
    height={s.icon}
    class={darkMode ? 'text-cyan-400' : 'text-cyan-500'}
  >
    <path d="M4 14h4v7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7h4a1.001 1.001 0 0 0 .781-1.625l-8-10c-.381-.475-1.181-.475-1.562 0l-8 10A1.001 1.001 0 0 0 4 14z"/>
  </svg>
  
  <span class="inline-flex items-center font-bold tracking-wide">
    <AnimatedCounter value={votes} fontSize={s.fontSize} />
  </span>
</button>
