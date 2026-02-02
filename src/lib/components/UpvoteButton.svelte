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
  class="relative {s.height} {s.padding} rounded-full font-bold {s.text} transition-all duration-200 flex items-center gap-2 flex-shrink-0 hover:scale-105 active:scale-95
    {darkMode 
      ? '' 
      : 'bg-white/40 border border-white/40 ring-1 ring-white/40 text-cyan-600 hover:bg-white/60 shadow-sm backdrop-blur-md'
    }"
  style={darkMode ? `
    background: 
      linear-gradient(rgba(0, 0, 0, 0) 80%, rgba(255, 243, 215, 0.04) 100%), 
      linear-gradient(rgba(255, 243, 215, 0.04) 0%, rgba(0, 0, 0, 0) 20%), 
      linear-gradient(rgba(255, 242, 212, 0.06), rgba(255, 242, 212, 0.02));
    color: rgb(34, 211, 238);
    border: 1px solid rgba(255, 243, 215, 0.06);
    box-shadow: 
      rgba(10, 8, 5, 0.08) 0px 4px 6px 0px, 
      inset 0px 0.5px 0.5px 0px rgba(255, 243, 215, 0.24), 
      inset 0px -0.5px 0.5px 0px rgba(255, 243, 215, 0.24), 
      inset 0px 2px 6px -3px rgba(255, 243, 215, 0.06);
  ` : ""}
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
