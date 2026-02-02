# Design System: Glassmetal

The "Glassmetal" aesthetic is a premium, high-tech design language inspired by Antimetal.com. It combines traditional glassmorphism with a machined-metal feel, using sophisticated light layers and complex shadowing.

## Core Visual Properties

### Dark Mode Base
- **Background Color:** `#100d0a` (Dark Charcoal)
- **Text Color:** `#fff3d7` (Light Cream)
- **Primary Accent:** Cyan/Pink (for icons/interactive glows)

### The Container (Glassmetal Surface)
A Glassmetal surface is achieved through multiple layers of gradients and shadows:

```css
/* Background Gradients (The "Machined" Light) */
background: 
  /* Top light catch */
  linear-gradient(rgba(0, 0, 0, 0) 80%, rgba(255, 243, 215, 0.04) 100%), 
  /* Bottom light catch */
  linear-gradient(rgba(255, 243, 215, 0.04) 0%, rgba(0, 0, 0, 0) 20%), 
  /* Surface gloss */
  linear-gradient(rgba(255, 242, 212, 0.06), rgba(255, 242, 212, 0.02));

/* Border (Machined Stroke) */
border: 1px solid rgba(255, 243, 215, 0.06);

/* Shadow System (Internal structure + External depth) */
box-shadow: 
  /* External Depth */
  rgba(10, 8, 5, 0.08) 0px 48px 56px 0px, 
  rgba(10, 8, 5, 0.12) 0px 24px 32px 0px, 
  /* Top highlighting bevel (sharp) */
  inset 0px 0.5px 0.5px 0px rgba(255, 243, 215, 0.24), 
  /* Bottom highlighting bevel (sharp) */
  inset 0px -0.5px 0.5px 0px rgba(255, 243, 215, 0.24), 
  /* Internal ambient light */
  inset 0px 4px 12px -6px rgba(255, 243, 215, 0.06);
```

### Background Environment
The background is not flat but filled with large, high-blur ambient light pools (blobs):
- **Radius:** 50vw - 100vw
- **Blur:** 100px - 160px
- **Opacity:** 3% - 8%
- **Colors:** Cream, Blue, Pink, Purple
