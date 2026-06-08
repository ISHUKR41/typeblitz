# TypeBlitz Design System

> Inspired by top-tier dark design systems (Linear, Vercel, Raycast, Arc). Use this file as the authoritative design reference for all UI/canvas work.

---

## 🎨 Color Tokens

### Core Palette
```css
/* Base */
--color-background:     #0D0D0F;   /* Near-black — page bg */
--color-surface:        #141418;   /* Slightly lighter — cards, panels */
--color-surface-raised: #1A1A20;   /* Elevated surfaces — modals, dropdowns */
--color-border:         #2A2A32;   /* Subtle borders */
--color-border-strong:  #3A3A46;   /* Focused / hover borders */

/* Text */
--color-text-primary:   #F1F1F3;   /* Primary readable text */
--color-text-secondary: #8B8B8B;   /* Muted / descriptions */
--color-text-disabled:  #4A4A58;   /* Disabled / placeholder */

/* Brand / Game */
--color-primary:        #00F5FF;   /* Neon cyan — CTAs, progress, highlights */
--color-primary-dim:    #00F5FF26; /* 15% opacity — hover backgrounds */

/* Game Feedback (canvas + UI) */
--color-correct:        #39FF14;   /* Neon green — correct keystrokes */
--color-error:          #FF2079;   /* Neon pink-red — wrong keystrokes */
--color-warning:        #FFB800;   /* Amber — caution, timers */
--color-info:           #00A8FF;   /* Blue — neutral info */

/* Chart / Data */
--color-chart-1:        #00F5FF;   /* Primary data series */
--color-chart-2:        #a855f7;   /* Secondary — purple */
--color-chart-3:        #39FF14;   /* Tertiary — neon green */
--color-chart-4:        #f59e0b;   /* Quaternary — amber */
```

### Canvas Game Palette
All canvas games must use these exact values — do not use Tailwind classes inside canvas `ctx` calls.

```javascript
const GAME_COLORS = {
  bg:        '#050510',   // Deep space black (canvas backgrounds)
  primary:   '#00F5FF',   // Neon cyan
  correct:   '#39FF14',   // Correct char highlight
  error:     '#FF2079',   // Wrong char highlight
  dim:       '#404058',   // Untyped char dim color
  gold:      '#FFD700',   // Score, combo, reward
  health:    '#34d399',   // Player health bar
  enemy:     '#f87171',   // Enemy, threat
  warning:   '#FFB800',   // Timer, danger zone
};
```

---

## 📐 Typography

### Font Stack
```css
/* UI text */
font-family: "Inter", "SF Pro Display", system-ui, sans-serif;

/* Game data — WPM, score, accuracy, timer */
font-family: "JetBrains Mono", "Fira Code", ui-monospace, monospace;

/* Canvas text */
ctx.font = "bold 14px monospace";   /* game labels */
ctx.font = "bold 18px monospace";   /* score popups */
ctx.font = "bold 22px monospace";   /* large canvas text */
```

### Type Scale
```
xs:   11px / 0.75rem   — badges, labels, timestamp
sm:   13px / 0.8125rem — secondary text, descriptions
base: 15px / 0.9375rem — body text
lg:   18px / 1.125rem  — section subheadings
xl:   22px / 1.375rem  — headings
2xl:  28px / 1.75rem   — page titles
3xl:  36px / 2.25rem   — hero stats (WPM counter)
4xl+: 56px+            — hero headline, typing word
```

### Font Weights
```
normal (400) — body text, descriptions
medium (500) — interactive elements, labels
semibold (600) — section headings
bold (700)    — important data, scores
extrabold (800) — hero headline, titles
black (900)   — WPM numbers, game score
```

---

## 📏 Spacing System

Uses 4px base grid (Tailwind default):
```
0.5 →  2px   micro gaps between chars
1   →  4px   icon-to-text gaps
2   →  8px   inline element gaps
3   →  12px  component internal padding (sm)
4   →  16px  component internal padding (base)
5   →  20px  card padding (small)
6   →  24px  card padding (standard)
8   →  32px  section padding (horizontal)
10  →  40px  section padding (vertical)
14  →  56px  hero CTA height
16  →  64px  section vertical gap
24  →  96px  page-level vertical padding
```

---

## 🔲 Border Radius

```
sm:   6px    — tags, badges, small chips
base: 8px    — buttons (sm), input fields
md:   12px   — buttons (base/lg), cards (sm)
lg:   16px   — cards (standard), panels
xl:   20px   — feature cards, game area wrappers
2xl:  24px   — hero sections, large modals
full: 9999px — pill badges, circular elements
```

---

## ✨ Effects & Elevation

### Neon Glow (Canvas)
```javascript
// Correct keystroke glow
ctx.shadowColor = '#39FF14';
ctx.shadowBlur = 12;

// Error glow
ctx.shadowColor = '#FF2079';
ctx.shadowBlur = 10;

// Primary element glow
ctx.shadowColor = '#00F5FF';
ctx.shadowBlur = 16;

// Always reset after use
ctx.shadowBlur = 0;
ctx.globalAlpha = 1;
```

### Box Shadow (UI)
```css
/* Card elevation */
box-shadow: 0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3);

/* Focused/hover glow */
box-shadow: 0 0 0 2px rgba(0,245,255,0.25);

/* Button — primary */
box-shadow: 0 4px 24px rgba(0,245,255,0.25);

/* Button — primary hover */
box-shadow: 0 4px 32px rgba(0,245,255,0.45);
```

### Background Glows (Decorative)
```jsx
/* Large ambient glow — hero section */
<div className="absolute top-1/4 left-1/3 w-[750px] h-[750px]
  bg-primary/10 rounded-full blur-[160px] pointer-events-none" />

/* Medium accent glow */
<div className="absolute bottom-1/4 right-1/3 w-[550px] h-[550px]
  bg-chart-2/9 rounded-full blur-[130px] pointer-events-none" />
```

---

## 🧩 Component Patterns

### Game Card
```jsx
<div className="group p-5 rounded-2xl bg-gradient-to-br from-[color] border border-white/5
  cursor-pointer h-full transition-all duration-300 relative overflow-hidden
  hover:border-primary/30">
  {/* Content */}
</div>
```

### Neon Badge
```jsx
<span className="inline-flex items-center gap-1.5 px-3 py-1
  bg-primary/10 border border-primary/25 text-primary
  rounded-full text-xs font-bold font-mono">
  {label}
</span>
```

### HUD Panel (Game Canvas UI)
```jsx
<div className="bg-black/50 border border-white/10 backdrop-blur
  rounded-xl px-3 py-1.5 flex items-center gap-1.5">
  <Icon className="w-3.5 h-3.5 text-primary" />
  <span className="font-mono font-bold text-sm text-white">{value}</span>
</div>
```

### Typing Display (Word Color-Split)
```jsx
{word.split("").map((ch, i) => {
  let cls = "text-[#404058]"; // dim — not yet typed
  if (i < input.length) {
    cls = input[i] === ch
      ? "text-[#39FF14] drop-shadow-[0_0_6px_#39FF14]" // correct — neon green glow
      : "text-[#FF2079] bg-[#FF2079]/15 rounded-sm";   // error — red + background
  } else if (i === input.length) {
    cls = "text-white border-b-2 border-primary animate-pulse"; // cursor position
  }
  return <span key={i} className={`transition-all duration-75 ${cls}`}>{ch}</span>;
})}
```

### Progress Bar
```jsx
<motion.div
  className="h-full bg-gradient-to-r from-primary via-primary/90 to-chart-2 rounded-full"
  animate={{ width: `${progress}%` }}
  transition={{ duration: 0.15, ease: "easeOut" }}
/>
```

---

## 🎬 Animation Principles

### Timing
```
instant:    0ms     — state feedback (key press highlight)
fast:       100ms   — micro-interactions (button press, icon swap)
normal:     200ms   — hover state transitions
moderate:   300ms   — element enter/exit
slow:       500ms   — page transitions, large reveals
very-slow:  700ms+  — hero section entry, scroll-triggered
```

### Easing
```
easeOut      — enter animations (elements arriving)
easeIn       — exit animations (elements leaving)
spring       — interactive elements (buttons, cards, game objects)
linear       — continuous animations (progress bars, timers, tickers)
```

### Framer Motion Presets
```javascript
// Fade up (scroll reveal)
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
transition={{ duration: 0.5, ease: "easeOut" }}

// Pop in (modal/card)
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ type: "spring", stiffness: 300, damping: 25 }}

// Slide in from right
initial={{ opacity: 0, x: 20 }}
animate={{ opacity: 1, x: 0 }}
transition={{ duration: 0.3, ease: "easeOut" }}

// Stagger children
transition={{ delay: index * 0.07 }}
```

---

## 🕹️ Canvas Game Design Rules

1. **Background first**: Always fill background with `#050510` or a dark gradient before drawing anything else.

2. **Glow then draw**: Set `ctx.shadowColor` and `ctx.shadowBlur` *before* drawing the element. Reset to `0` immediately after.

3. **Alpha restore**: Always restore `ctx.globalAlpha = 1` after semi-transparent draws.

4. **Color-split rule**: Every word displayed in a canvas game must show:
   - Typed-correctly chars → `#39FF14` (neon green)
   - Typed-wrong chars → `#FF2079` (neon red)
   - Untyped chars → `#404058` (dim blue-grey)
   - Current cursor position char → `#FFFFFF` (white)

5. **Particle system**: Every correct word triggers 10-20 particles. Every wrong word triggers 5-8 red particles. Particles have gravity (vy += 0.15) and alpha decay.

6. **HUD position**: Score, WPM, accuracy in top-left corner. Health bars in top-left/right for player/enemy. Keep HUD out of the center play area.

7. **Canvas text legibility**: Use `ctx.shadowBlur` on text to create contrast against busy backgrounds.

8. **Performance**: Avoid `ctx.shadowBlur` on more than 3-4 simultaneous elements per frame. Reset `shadowBlur = 0` when drawing backgrounds/fills.

---

## 📱 Responsive Breakpoints

```
sm:  640px    — phones landscape, small tablets
md:  768px    — tablets portrait
lg:  1024px   — tablets landscape, small laptops
xl:  1280px   — standard laptops
2xl: 1536px   — large displays
```

### Mobile-First Canvas Strategy
Canvas games scale using CSS: `className="w-full"` with a fixed canvas `width/height`. The actual rendering resolution stays consistent while the visual size adapts to container.

```jsx
<canvas
  width={800}
  height={260}
  className="w-full h-[260px] block"
/>
```

---

## 🔤 Game Vocabulary Color Coding

For government exam vocabulary, use category-specific accent colors in the HUD (not in typing display):
```
SSC/General:  #00F5FF  (cyan)
UPSC:         #a855f7  (purple)
Banking:      #22d3ee  (teal)
Railways:     #fb923c  (orange)
Police:       #f87171  (red)
Coding:       #39FF14  (neon green)
```

---

## ✅ Do / ❌ Don't

| ✅ Do | ❌ Don't |
|-------|---------|
| Dark backgrounds everywhere | Light mode or white backgrounds |
| Monospace font for all numeric data | Proportional font for scores/WPM |
| Neon glow on interactive elements | Flat, unlit buttons |
| Particle explosions on word submit | Silent, no-feedback word completion |
| Screen shake on damage/error | Static response to game events |
| Color-split typing display | Plain white text for current word |
| Lazy load all game components | Eagerly import all 13 canvas games |
| Spring physics for health bars | Linear transitions for health bars |
| Reset shadowBlur after each draw | Leave shadowBlur on and leak to next draw |
| `ctx.save()` / `ctx.restore()` pairs | Mutate context state without restoring |
