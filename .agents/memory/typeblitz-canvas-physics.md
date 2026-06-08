---
name: TypeBlitz canvas game physics pattern
description: Frame-rate independent physics pattern used across all 13 canvas games
---

# Canvas Game Physics Pattern

**The rule:** Every canvas `requestAnimationFrame` loop must use `DT = dt/16.667` to scale all movement, so physics runs at the same speed at 30fps, 60fps, or 144fps.

**Why:** Without DT scaling, games run 2× faster at 120fps than 60fps — speeds, gravity, bullet travel all become frame-rate dependent.

**How to apply:**
```ts
let lastFrameT = 0;

const render = (ts: number) => {
  animId = requestAnimationFrame(render);
  const dt = Math.min(ts - (lastFrameT || ts), 50); // clamp at 50ms
  lastFrameT = ts;
  const DT = dt / 16.667; // 1.0 at 60fps, 0.5 at 30fps, 2.0 at 30fps drops
  
  // Scale ALL motion:
  obj.x += obj.vx * DT;
  obj.y += obj.vy * DT;
  obj.vy += gravity * DT;
  friction = Math.pow(0.95, DT); // exponential friction
};
animId = requestAnimationFrame(render); // start — NOT render()
```

**CodeRainGame specifics:**
- Column updates use a 50ms timestamp throttle (`if (ts - lastColUpdateT >= 50)`) not a frameCount modulo
- Spawn timer is ms-based (`sIntervalMs = Math.max(800, 1600 - progress*8)`)
- `glitchTimer` is decremented once via `s.glitchTimer -= DT` in the loop body (NOT in the render block — removing the old `s.glitchTimer--` from the if-block prevents double-decrement)
- Particle physics: `p.x += p.vx * DT; p.vx *= Math.pow(0.92, DT); p.life -= 0.025 * DT`

**Games fixed (all 13):** NeonRunnerGame, FruitBlitzGame, BubblePopGame, WordInvadersGame, MeteorGame, ArenaBlitzGame, RacingGame, GalaxyGame, ZombieGame, CyberHeistGame, FighterGame, CodeRainGame. SnakeTyperGame already used ms-based timing and didn't need changes.
