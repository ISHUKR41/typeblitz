---
name: TypeBlitz canvas jitter fix pattern
description: How all 13 arcade canvas games were made jitter-free — volatile prop refs + stable RAF deps
---

## The problem
Animation loop `useEffect` had volatile props (wpm, wordIndex, currentInput, comboStreak, progress, scrollSpeed, screenShake, shieldHp, screenFlash, descentPct, shipLayout) in its deps array. Every keystroke and every WPM tick (400ms) triggered a new RAF loop, causing a 1-frame blank flash (jitter).

## The fix pattern (applied to all 13 games)

```tsx
// 1. Add stable refs for every volatile prop captured in the animation closure
const wpmRef         = useRef(wpm);         wpmRef.current         = wpm;
const wordIndexRef   = useRef(wordIndex);   wordIndexRef.current   = wordIndex;
const currentInputRef = useRef(currentInput); currentInputRef.current = currentInput;
// ... same for comboStreak, progress, shieldHp, screenFlash, scrollSpeed, etc.

// 2. Inside the animation loop, read from refs instead of closure captures
const isTarget = obs.wordIdx === wordIndexRef.current;  // not wordIndex
const typedLen = currentInputRef.current.length;        // not currentInput.length

// 3. Reduce animation useEffect deps to only stable values
}, [words]); // eslint-disable-line react-hooks/exhaustive-deps
// words changes once per game start — safe to include; never changes per keystroke
```

## Games fixed
- BubblePopGame, FruitBlitzGame, SnakeTyperGame, WordInvadersGame, RacingGame — first batch
- ArenaBlitzGame, CyberHeistGame — second batch (spawnEnemy callback deps too)
- NeonRunnerGame, MeteorGame, GalaxyGame — third batch (incl. scrollSpeed, screenShake, shipLayout, descentPct)

## Special cases
- **RacingGame**: ghostPosRef needed a separate useEffect to update when ghostPos state changes
- **ArenaBlitzGame**: `spawnEnemy` useCallback deps `[wpm]` → `[]` since body reads `wpmRef.current`; spawn interval useEffect deps also trimmed
- **NeonRunnerGame**: `scrollSpeed` is computed in component body → add `scrollSpeedRef.current = scrollSpeed;` right after the calculation so the animation loop reads the ref
- **GalaxyGame**: `shipLayout` (useMemo) and `descentPct` (derived) both need refs: `const shipLayoutRef = useRef(shipLayout); shipLayoutRef.current = shipLayout;`
- **CyberHeistGame**: `hackedCount` state needed `hackedCountRef` for the HUD text

**Why:** React's useEffect re-runs when deps change. RAF loops re-running = cancelled + new RAF = 1 blank frame = visible jitter at every keystroke. Refs let the closure always read the latest value without the effect needing to restart.
