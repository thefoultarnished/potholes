<script lang="ts">
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  export let value: number;
  export let fontSize: number = 11;

  const height = fontSize + 4;

  // Tweened store for smooth animation
  const animatedValue = tweened(value, {
    duration: 0,
    easing: cubicOut
  });

  // Update when value changes
  $: animatedValue.set(value);

  // Places based on TARGET value (not animated), so structure doesn't flicker
  $: places = getPlaces(value);

  function getPlaces(val: number): number[] {
    const str = Math.max(val, 0).toString();
    return str.split('').map((_, i) => Math.pow(10, str.length - i - 1));
  }

  // Calculate Y offset for a specific digit at a given place value
  function getY(currentValue: number, place: number, digitNum: number): number {
    const rollingValue = Math.floor(currentValue / place);
    const currentDigit = Math.floor(rollingValue % 10);
    const offset = (10 + digitNum - currentDigit) % 10;
    const adjustedOffset = offset > 5 ? offset - 10 : offset;
    return adjustedOffset * height;
  }
</script>

<span 
  class="inline-flex items-center" 
  style="font-size: {fontSize}px; line-height: 1; font-variant-numeric: tabular-nums;"
>
  {#each places as place (place)}
    <span 
      class="relative inline-flex overflow-hidden items-center justify-center" 
      style="height: {height}px; width: 0.6em;"
    >
      {#each [0,1,2,3,4,5,6,7,8,9] as num}
        <span 
          class="absolute flex items-center justify-center font-bold w-full"
          style="height: {height}px; transform: translateY({getY($animatedValue, place, num)}px); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);"
        >{num}</span>
      {/each}
    </span>
  {/each}
</span>
