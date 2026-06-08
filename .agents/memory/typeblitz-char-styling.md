---
name: TypeBlitz neon char styling conventions
description: CSS classes and patterns for typed text and progress bars across all typing surfaces
---

# Neon Char Styling Conventions

**The rule:** Every page that renders typed text character-by-character must use the CSS classes from `index.css`, not ad-hoc Tailwind classes. Progress bars must use `typing-progress-bar`.

**Why:** Consistency across play.tsx, challenge.tsx, lesson.tsx, and practice.tsx. The CSS classes include neon glow effects and keyframe animations that can't be replicated inline.

**Char classes (from index.css):**
```
char-correct     → green (#39FF14) with glow + key-correct animation
char-wrong       → red/pink (#FF2079) with bg highlight + key-wrong shake
char-wrong-space → red bg highlight (for space characters that are wrong)
char-cursor      → neon cyan bottom border + cursor-blink animation
char-untyped     → muted grey, no glow
```

**Usage pattern:**
```tsx
{text.split("").map((char, i) => {
  let cls = "char-untyped";
  if (i < input.length) {
    cls = input[i] === char ? "char-correct" : (char === " " ? "char-wrong-space" : "char-wrong");
  } else if (i === input.length) {
    cls = "char-cursor";
  }
  return <span key={i} className={cls}>{char}</span>;
})}
```

**Progress bar class:**
```tsx
<div className="h-1.5 overflow-hidden rounded-full bg-muted/40 relative">
  <motion.div
    className="typing-progress-bar h-full rounded-full absolute left-0 top-0"
    animate={{ width: `${progress}%` }}
    transition={{ duration: 0.12 }}
  />
</div>
```
`typing-progress-bar` gives a cyan→green→amber gradient with neon glow.

**Input field neon focus pattern:**
```tsx
style={{ background: "rgba(14,14,18,0.8)", border: "1px solid rgba(0,245,255,0.2)" }}
onFocus={e => { e.currentTarget.style.border = "1px solid rgba(0,245,255,0.45)"; ... }}
onBlur={e => { e.currentTarget.style.border = "1px solid rgba(0,245,255,0.2)"; ... }}
```

**Pages updated:** play.tsx (already used these), challenge.tsx, lesson.tsx. Practice page uses its own component — check if it needs updating.
