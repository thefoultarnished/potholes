<script lang="ts">
  export let soundEnabled: boolean;
  export let setSoundEnabled: (val: boolean) => void;
  export let darkMode: boolean;
</script>

<button
  on:click={() => setSoundEnabled(!soundEnabled)}
  aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
  class="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-102 active:scale-98
    {darkMode 
      ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] text-cyan-400 shadow-[0_4px_12px_rgba(0,0,0,0.4)]' 
      : 'bg-white text-slate-500 shadow-[0_4px_12px_rgba(0,0,0,0.08)]'
    }"
>
  {#if soundEnabled}
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width={18} height={18}>
      <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="currentColor" />
      <path d="M15.54 8.46C16.4774 9.39764 17.004 10.6692 17.004 11.995C17.004 13.3208 16.4774 14.5924 15.54 15.53" />
    </svg>
  {:else}
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width={18} height={18}>
      <path d="M11 5L6 9H2V15H6L11 19V5Z" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  {/if}
</button>
