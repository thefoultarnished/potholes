<script lang="ts">
  import { playPopSound } from '$lib/stores';
  import AnimatedCounter from './AnimatedCounter.svelte';
  
  export let onVote: () => void;
  export let votes: number = 0;
  export let size: 'sm' | 'md' = 'md';
  export let darkMode: boolean = true;
  export let soundEnabled: boolean = true;
  export let blueColor = 'text-cyan-400';
  
  const sizes = {
    sm: { height: 'h-9', padding: 'px-3', icon: 16, text: 'text-[13px]', fontSize: 13 },
    md: { height: 'h-10', padding: 'px-4', icon: 18, text: 'text-sm', fontSize: 14 }
  };
  
  $: s = sizes[size] || sizes.md;
  
  let popped = false;

  function handleClick(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    
    // Trigger pop animation
    popped = true;
    setTimeout(() => popped = false, 150);

    playPopSound(soundEnabled);
    onVote();
  }
</script>

<button
  on:click={handleClick}
  class="relative {s.height} {s.padding} rounded-full font-bold {s.text} transition-all duration-200 flex items-center gap-2 flex-shrink-0 hover:scale-105 active:scale-95
    {darkMode 
      ? blueColor 
      : `bg-white/40 border border-white/40 ring-1 ring-white/40 ${blueColor} hover:bg-white/60 shadow-sm backdrop-blur-md`
    }"
  style={darkMode ? `
    background: 
      linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0.02) 100%),
      rgba(255, 255, 255, 0.02);
    color: currentColor;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 
      0px 4px 16px -2px rgba(0, 0, 0, 0.5), 
      inset 0px 1px 0px 0px rgba(255, 255, 255, 0.4), 
      inset 0px 0px 0px 1px rgba(255, 255, 255, 0.08);
  ` : ""}
>
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    width={s.icon} 
    height={s.icon}
    class="{darkMode ? blueColor : ''} transition-transform duration-100 ease-out {popped ? 'scale-150 -rotate-12' : ''}"
  >
    <path d="M4 14h4v7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7h4a1.001 1.001 0 0 0 .781-1.625l-8-10c-.381-.475-1.181-.475-1.562 0l-8 10A1.001 1.001 0 0 0 4 14z"/>
  </svg>
  
  <span class="inline-flex items-center font-bold tracking-wide {darkMode ? blueColor : ''}">
    <AnimatedCounter value={votes} fontSize={s.fontSize} />
  </span>
</button>
