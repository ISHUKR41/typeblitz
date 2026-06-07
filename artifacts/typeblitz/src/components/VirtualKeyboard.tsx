import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// A basic QWERTY layout
const ROWS = [
  ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Backspace"],
  ["Tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
  ["Caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "Enter"],
  ["Shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "Shift"],
  ["Space"]
];

export default function VirtualKeyboard({ targetKey }: { targetKey?: string }) {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setPressedKeys(prev => new Set(prev).add(e.key.toLowerCase()));
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys(prev => {
        const next = new Set(prev);
        next.delete(e.key.toLowerCase());
        return next;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const getWidthClass = (key: string) => {
    switch (key.toLowerCase()) {
      case "backspace": return "w-16";
      case "tab": return "w-14";
      case "caps": return "w-16";
      case "enter": return "w-20";
      case "shift": return "w-24";
      case "space": return "w-[300px] md:w-[400px]";
      default: return "w-10";
    }
  };

  const isTarget = (k: string) => {
    if (!targetKey) return false;
    const t = targetKey.toLowerCase();
    const l = k.toLowerCase();
    if (t === " " && l === "space") return true;
    return t === l;
  };

  return (
    <div className="bg-secondary/40 p-4 md:p-6 rounded-2xl border border-border shadow-2xl max-w-full overflow-x-auto">
      <div className="flex flex-col gap-2 min-w-[700px]">
        {ROWS.map((row, rIdx) => (
          <div key={rIdx} className={`flex gap-2 ${rIdx === 4 ? 'justify-center' : ''}`}>
            {row.map((key, kIdx) => {
              const pressed = pressedKeys.has(key.toLowerCase()) || (key === "Space" && pressedKeys.has(" "));
              const target = isTarget(key);
              
              return (
                <div
                  key={`${rIdx}-${kIdx}`}
                  className={cn(
                    "h-10 md:h-12 flex items-center justify-center rounded-lg border font-mono text-sm shadow-sm transition-all duration-100",
                    getWidthClass(key),
                    pressed 
                      ? "bg-primary/20 border-primary text-primary translate-y-1 shadow-none" 
                      : target
                        ? "bg-accent/20 border-accent text-accent animate-pulse shadow-[0_0_10px_rgba(var(--accent),0.5)]"
                        : "bg-card border-border text-muted-foreground shadow-[0_2px_0_rgba(255,255,255,0.05)]"
                  )}
                >
                  {key === "Space" ? "" : key}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
