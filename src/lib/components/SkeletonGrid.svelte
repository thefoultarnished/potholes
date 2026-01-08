<script lang="ts">
  export let darkMode: boolean;
  export let count: number = 6;
</script>

<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
  {#each Array(count) as _, i}
    <div 
      class="rounded-3xl overflow-hidden border backdrop-blur-xl
        {darkMode 
          ? 'bg-white/[0.02] border-white/10' 
          : 'bg-white/20 border-white/40'
        }"
    >
      <!-- Image skeleton -->
      <div class="aspect-square relative overflow-hidden">
        <div class="absolute inset-0 {darkMode ? 'bg-white/5' : 'bg-black/5'} animate-pulse"></div>
        <div 
          class="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"
          style="animation-delay: {i * 100}ms"
        ></div>
      </div>
      
      <!-- Content skeleton -->
      <div class="p-4 space-y-3">
        <div class="h-4 rounded-full {darkMode ? 'bg-white/10' : 'bg-black/10'} animate-pulse w-3/4"></div>
        <div class="flex items-center justify-between">
          <div class="h-3 rounded-full {darkMode ? 'bg-white/5' : 'bg-black/5'} animate-pulse w-1/3"></div>
          <div class="h-8 w-16 rounded-full {darkMode ? 'bg-white/5' : 'bg-black/5'} animate-pulse"></div>
        </div>
      </div>
    </div>
  {/each}
</div>

<style>
  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }
</style>
