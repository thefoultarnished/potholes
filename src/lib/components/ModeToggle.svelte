<script lang="ts">
  import { Sun, Moon } from 'lucide-svelte';
  
  export let darkMode: boolean;
  export let setDarkMode: (val: boolean) => void;
</script>

<button
  on:click={() => setDarkMode(!darkMode)}
  aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
  class="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95
    {darkMode 
      ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] text-amber-400 shadow-[0_4px_12px_rgba(0,0,0,0.4)] hover:from-[#323d5e] hover:to-[#252f4e]' 
      : 'bg-white text-cyan-600 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]'
    }"
>
  {#if darkMode}
    <Sun size={20} />
  {:else}
    <Moon size={20} />
  {/if}
</button>
