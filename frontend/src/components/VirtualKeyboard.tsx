import { useMemo } from "react";

interface VirtualKeyboardProps {
  nextChar?: string;
}

const KEYBOARD_ROWS = [
  // Row 1
  [
    { key: "`", display: "`" }, { key: "1", display: "1" }, { key: "2", display: "2" },
    { key: "3", display: "3" }, { key: "4", display: "4" }, { key: "5", display: "5" },
    { key: "6", display: "6" }, { key: "7", display: "7" }, { key: "8", display: "8" },
    { key: "9", display: "9" }, { key: "0", display: "0" }, { key: "-", display: "-" },
    { key: "=", display: "=" }, { key: "backspace", display: "Backspace", width: "w-14 sm:w-16 flex-grow" }
  ],
  // Row 2
  [
    { key: "tab", display: "Tab", width: "w-10 sm:w-12" }, { key: "q", display: "Q" }, { key: "w", display: "W" },
    { key: "e", display: "E" }, { key: "r", display: "R" }, { key: "t", display: "T" },
    { key: "y", display: "Y" }, { key: "u", display: "U" }, { key: "i", display: "I" },
    { key: "o", display: "O" }, { key: "p", display: "P" }, { key: "[", display: "[" },
    { key: "]", display: "]" }, { key: "\\", display: "\\" }
  ],
  // Row 3
  [
    { key: "capslock", display: "Caps", width: "w-12 sm:w-14" }, { key: "a", display: "A" }, { key: "s", display: "S" },
    { key: "d", display: "D" }, { key: "f", display: "F" }, { key: "g", display: "G" },
    { key: "h", display: "H" }, { key: "j", display: "J" }, { key: "k", display: "K" },
    { key: "l", display: "L" }, { key: ";", display: ";" }, { key: "'", display: "'" },
    { key: "enter", display: "Enter", width: "w-14 sm:w-16 flex-grow" }
  ],
  // Row 4
  [
    { key: "left-shift", display: "Shift", width: "w-16 sm:w-20" }, { key: "z", display: "Z" }, { key: "x", display: "X" },
    { key: "c", display: "C" }, { key: "v", display: "V" }, { key: "b", display: "B" },
    { key: "n", display: "N" }, { key: "m", display: "M" }, { key: ",", display: "," },
    { key: ".", display: "." }, { key: "/", display: "/" }, { key: "right-shift", display: "Shift", width: "w-16 sm:w-20" }
  ],
  // Row 5
  [
    { key: " ", display: "Spacebar", width: "w-[240px] sm:w-[360px] md:w-[420px] flex-grow" }
  ]
];

const SHIFT_MAP: Record<string, string> = {
  "~": "`", "!": "1", "@": "2", "#": "3", "$": "4", "%": "5", "^": "6", "&": "7", "*": "8", "(": "9", ")": "0",
  "_": "-", "+": "=", "{": "[", "}": "]", "|": "\\", ":": ";", "\"": "'", "<": ",", ">": ".", "?": "/"
};

export function VirtualKeyboard({ nextChar }: VirtualKeyboardProps) {
  const activeKeys = useMemo(() => {
    const keys = new Set<string>();
    if (!nextChar) return keys;

    if (nextChar === " ") {
      keys.add(" ");
      return keys;
    }

    const lower = nextChar.toLowerCase();
    
    // Check if shift is needed
    const isShiftedSymbol = nextChar in SHIFT_MAP;
    const isUppercaseLetter = nextChar !== lower && nextChar.toUpperCase() === nextChar;

    if (isShiftedSymbol) {
      keys.add(SHIFT_MAP[nextChar]);
      keys.add("left-shift");
      keys.add("right-shift");
    } else if (isUppercaseLetter) {
      keys.add(lower);
      keys.add("left-shift");
      keys.add("right-shift");
    } else {
      keys.add(lower);
    }

    return keys;
  }, [nextChar]);

  return (
    <div className="w-full bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-4 space-y-1.5 shadow-2xl select-none max-w-2xl mx-auto">
      <div className="flex items-center justify-between px-1 mb-1 text-[10px] sm:text-xs font-mono font-bold text-muted-foreground">
        <span>KEYBOARD PATHFINDER</span>
        {nextChar && (
          <span className="text-primary animate-pulse">
            Next key: <span className="bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded font-bold font-mono">{nextChar === " " ? "Space" : nextChar}</span>
          </span>
        )}
      </div>

      <div className="space-y-1 sm:space-y-1.5">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5">
            {row.map((k) => {
              const isActive = activeKeys.has(k.key);
              const isShift = k.key.includes("shift");
              
              let highlightClass = "bg-muted/40 text-muted-foreground border-transparent";
              if (isActive) {
                highlightClass = isShift
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)] animate-pulse"
                  : "bg-primary/25 text-primary border-primary/50 shadow-[0_0_12px_rgba(var(--primary-rgb),0.35)]";
              }

              return (
                <div
                  key={k.key}
                  className={`h-7 sm:h-9 rounded sm:rounded-md border text-[10px] sm:text-xs font-bold font-mono flex items-center justify-center transition-all ${k.width || "w-7 sm:w-9"} ${highlightClass}`}
                >
                  {k.display}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
