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
      ? '' 
      : 'bg-white/40 border border-white/40 ring-1 ring-white/40 text-slate-500 hover:bg-white/60 shadow-sm backdrop-blur-md'
    }"
  style={darkMode ? `
    background: 
      linear-gradient(rgba(0, 0, 0, 0) 80%, rgba(255, 243, 215, 0.04) 100%), 
      linear-gradient(rgba(255, 243, 215, 0.04) 0%, rgba(0, 0, 0, 0) 20%), 
      linear-gradient(rgba(255, 242, 212, 0.06), rgba(255, 242, 212, 0.02));
    color: rgb(34, 211, 238);
    box-shadow: 
      rgba(10, 8, 5, 0.08) 0px 48px 56px 0px, 
      rgba(10, 8, 5, 0.12) 0px 24px 32px 0px, 
      inset 0px 0px 0px 1px rgba(255, 243, 215, 0.06), 
      inset 0px 0.5px 0.5px 0px rgba(255, 243, 215, 0.24), 
      inset 0px -0.5px 0.5px 0px rgba(255, 243, 215, 0.24), 
      inset 0px 4px 12px -6px rgba(255, 243, 215, 0.06);
  ` : ""}
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
