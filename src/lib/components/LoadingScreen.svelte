<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import Logo from '$lib/components/Logo.svelte';
  
  export let darkMode: boolean = true;
  export let onComplete: () => void = () => {};
  export let blueColor = 'text-cyan-400';
  export let themeColorRGB = '34, 211, 238';
  $: themeColor = blueColor.includes('yellow') ? 'yellow' : 'cyan';
  
  let msg = '';
  let visible = true;
  
  const messages = [
    "Scanning Galaxy for Potholes...",
    "Calibrating suspension sensors...",
    "Locating rim benders...",
    "Loading public enemies...",
    "Preparing mental map...",
    "Searching for tire traps..."
  ];
  
  onMount(() => {
    msg = messages[Math.floor(Math.random() * messages.length)];
    
    // Auto-hide after delay
    const timeout = setTimeout(() => {
      visible = false;
      setTimeout(onComplete, 500);
    }, 2000);
    
    return () => clearTimeout(timeout);
  });
</script>

{#if visible}
  <div 
    class="fixed inset-0 z-[100] flex flex-col items-center justify-center transition-colors duration-300
      {darkMode ? 'bg-[#02040a]' : 'bg-[#e4e4e7]'}"
    transition:fade={{ duration: 500 }}
  >
    <!-- Background gradients -->
    <div class="absolute inset-0 {darkMode ? 'bg-[#02040a]' : 'bg-gradient-to-br from-[#e4e4e7] via-[#f1f5f9] to-[#e2e8f0]'}">
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[100px] {darkMode ? (themeColor === 'yellow' ? 'bg-yellow-900/40' : 'bg-cyan-900/40') : (themeColor === 'yellow' ? 'bg-yellow-300/70' : 'bg-cyan-300/70')}"></div>
        <div class="absolute -top-32 -right-20 w-[500px] h-[500px] rounded-full blur-[100px] {darkMode ? (themeColor === 'yellow' ? 'bg-yellow-900/40' : 'bg-blue-900/40') : (themeColor === 'yellow' ? 'bg-yellow-300/70' : 'bg-cyan-300/70')}"></div>
        <div class="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full blur-[100px] {darkMode ? (themeColor === 'yellow' ? 'bg-yellow-900/40' : 'bg-indigo-900/40') : (themeColor === 'yellow' ? 'bg-yellow-300/80' : 'bg-blue-300/80')}"></div>
      </div>
    </div>
    
    <!-- Content -->
    <div class="relative z-10 flex flex-col items-center">
      <!-- Logo with ring -->
      <div class="relative mb-8" in:scale={{ duration: 500, delay: 100 }}>
        <!-- Ping effect -->
        <div 
          class="absolute inset-0 rounded-full animate-ping opacity-20 {blueColor.replace('text-', 'bg-')}"
          style="animation-duration: 2s;"
        ></div>
        
        <!-- Logo container -->
        <div class="relative w-24 h-24 rounded-full flex items-center justify-center backdrop-blur-xl
          {darkMode 
            ? `bg-white/5 border border-white/10 shadow-[0_0_60px_rgba(${themeColorRGB},0.3)]` 
            : `bg-white/70 border border-white/50 shadow-[0_0_60px_rgba(${themeColorRGB},0.2)]`
          }">
          
          <!-- Spinning border -->
          <div class="absolute inset-2 animate-spin" style="animation-duration: 2s;">
            <div class="w-full h-full rounded-full border-2 border-transparent
              {themeColor === 'yellow' 
                ? (darkMode ? 'border-t-yellow-400 border-r-yellow-600' : 'border-t-yellow-500 border-r-yellow-400')
                : (darkMode ? 'border-t-cyan-400 border-r-blue-500' : 'border-t-cyan-500 border-r-blue-400')
              }">
            </div>
          </div>
          
          <!-- Logo icon -->
          <Logo size="32" className={darkMode ? 'text-white' : ''} />
        </div>
      </div>
      
      <!-- Title -->
      <div class="text-center" in:fade={{ duration: 500, delay: 200 }}>
        <h2 class="text-xl font-bold tracking-tight mb-2 {darkMode ? 'text-white' : 'text-slate-700'}">
          Quantifying Asphalt Neglect...
        </h2>
        <div class="flex items-center justify-center gap-1">
          {#each [0, 1, 2] as i}
            <div 
              class="w-2 h-2 rounded-full {blueColor.replace('text-', 'bg-')} animate-pulse"
              style="animation-delay: {i * 200}ms;"
            ></div>
          {/each}
        </div>
      </div>
      
      <!-- Subtitle -->
      <p 
        class="mt-4 text-sm {darkMode ? 'text-zinc-500' : 'text-slate-400'}"
        in:fade={{ duration: 500, delay: 500 }}
      >
        {msg}
      </p>
    </div>
  </div>
{/if}
