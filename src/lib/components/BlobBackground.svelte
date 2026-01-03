<script lang="ts">
  import { onMount } from 'svelte';
  
  let canvas: HTMLCanvasElement;
  let animationId: number;
  
  const COLORS = [
    '#0f172a', '#1e3a8a', '#172554', '#0e7490', '#155e75', '#1e40af', '#312e81'
  ];
  
  class BlobParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rx: number;
    ry: number;
    angle: number;
    va: number;
    colorHex: string;
    alpha: number;
    pulseSpeed: number;
    pulseOffset: number;
    currentRx: number;
    currentRy: number;
    
    constructor(width: number, height: number) {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = (Math.random() - 0.5) * 0.8;
      const baseSize = Math.max(width, height) * 0.4;
      this.rx = Math.random() * baseSize + 100;
      this.ry = Math.random() * baseSize + 100;
      this.currentRx = this.rx;
      this.currentRy = this.ry;
      this.angle = Math.random() * Math.PI * 2;
      this.va = (Math.random() - 0.5) * 0.001;
      this.colorHex = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = Math.random() * 0.3 + 0.1;
      this.pulseSpeed = Math.random() * 0.001 + 0.0005;
      this.pulseOffset = Math.random() * Math.PI * 2;
    }
    
    update(width: number, height: number) {
      this.x += this.vx;
      this.y += this.vy;
      this.angle += this.va;
      
      const margin = Math.max(this.rx, this.ry);
      if (this.x < -margin) this.x = width + margin;
      if (this.x > width + margin) this.x = -margin;
      if (this.y < -margin) this.y = height + margin;
      if (this.y > height + margin) this.y = -margin;
      
      const pulse = Math.sin(Date.now() * this.pulseSpeed + this.pulseOffset);
      this.currentRx = this.rx * (1 + pulse * 0.1);
      this.currentRy = this.ry * (1 + pulse * 0.1);
    }
    
    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      const maxR = Math.max(this.currentRx, this.currentRy);
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, maxR);
      gradient.addColorStop(0, this.colorHex);
      gradient.addColorStop(0.5, this.colorHex);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.currentRx, this.currentRy, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  
  onMount(() => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    
    const blobs = Array.from({ length: 20 }, () => new BlobParticle(width, height));
    
    const targetFps = 24;
    const frameInterval = 1000 / targetFps;
    let lastFrameTime = 0;
    
    const animate = (currentTime: number) => {
      animationId = requestAnimationFrame(animate);
      
      const elapsed = currentTime - lastFrameTime;
      if (elapsed < frameInterval) return;
      lastFrameTime = currentTime - (elapsed % frameInterval);
      
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'screen';
      blobs.forEach(blob => { blob.update(width, height); blob.draw(ctx); });
      ctx.globalCompositeOperation = 'source-over';
    };
    
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    window.addEventListener('resize', handleResize);
    requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  });
</script>

<canvas bind:this={canvas} class="fixed inset-0 w-full h-full pointer-events-none" style="z-index: 0"></canvas>
<div class="fixed inset-0 pointer-events-none" style="z-index: 1; background: radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.4) 100%)"></div>
