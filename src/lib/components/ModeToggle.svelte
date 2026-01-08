<script lang="ts">
  import { Sun, Moon } from 'lucide-svelte';
  
  export let darkMode: boolean;
  export let setDarkMode: (val: boolean) => void;
</script>

<button
  on:click={() => setDarkMode(!darkMode)}
  aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
  class="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 border ring-1 backdrop-blur-md
    {darkMode 
      ? 'bg-white/[0.05] border-white/10 ring-white/5 text-amber-400 hover:bg-white/10' 
      : 'bg-white/40 border-white/40 ring-white/40 text-cyan-600 hover:bg-white/60 shadow-sm'
    }"
>
  {#if darkMode}
    <Sun size={20} />
  {:else}
    <Moon size={20} />
  {/if}
</button>
