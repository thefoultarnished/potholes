<script lang="ts">
  import { X } from 'lucide-svelte';
  import { fade, fly } from 'svelte/transition';
  
  export let message: string;
  export let type: 'success' | 'error' | 'info' = 'info';
  export let onClose: () => void;
  
  const colors = {
    success: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
    error: 'bg-red-500/20 border-red-500/30 text-red-400',
    info: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'
  };
  
  // Auto-dismiss after 4 seconds
  setTimeout(onClose, 4000);
</script>

<div 
  class="fixed bottom-6 right-6 z-[100] max-w-sm p-4 rounded-2xl border backdrop-blur-xl shadow-2xl {colors[type]}"
  in:fly={{ y: 50, duration: 300 }}
  out:fade={{ duration: 200 }}
>
  <div class="flex items-start gap-3">
    <p class="flex-1 text-sm font-medium">{message}</p>
    <button 
      on:click={onClose}
      class="p-1 rounded-lg hover:bg-white/10 transition-colors"
    >
      <X size={16} />
    </button>
  </div>
</div>
