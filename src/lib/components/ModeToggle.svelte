<script lang="ts">
  import { Sun, Moon, Flashlight } from 'lucide-svelte';
  
  // 0 = light, 1 = dark, 2 = torchlight
  export let mode: number;
  export let setMode: (val: number) => void;
  export let blueColor = 'text-cyan-400';
  export let themeColorRGB = '34, 211, 238';
  $: themeColor = blueColor.includes('yellow') ? 'yellow' : 'cyan';
</script>

<button
  on:click={() => setMode(mode === 1 ? 2 : 1)}
  aria-label={mode === 1 ? 'Switch to torchlight mode' : 'Switch to dark mode'}
  class="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95
    {mode === 0 
      ? `bg-white/40 border border-white/40 ring-1 ring-white/40 ${blueColor} hover:bg-white/60 shadow-sm backdrop-blur-md`
      : ''
    }"
  style={mode !== 0 ? `
    background: 
      linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0.02) 100%),
      rgba(255, 255, 255, 0.02);
    color: ${mode === 1 ? `rgb(${themeColorRGB})` : 'rgb(168, 85, 247)'};
    box-shadow: 
      0px 4px 16px -2px rgba(0, 0, 0, 0.5), 
      inset 0px 1px 0px 0px rgba(255, 255, 255, 0.4), 
      inset 0px 0px 0px 1px rgba(255, 255, 255, 0.08);
  ` : ""}
>
  {#if mode === 0}
    <Moon size={20} />
  {:else if mode === 1}
    <Sun size={20} />
  {:else}
    <Flashlight size={20} />
  {/if}
</button>
