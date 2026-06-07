import { useMemo } from "react";
import type React from "react";

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
    <div
      className="w-full backdrop-blur-md rounded-2xl p-3 sm:p-4 space-y-1.5 shadow-2xl select-none max-w-2xl mx-auto"
      style={{ background: "rgba(13,13,15,0.85)", border: "1px solid rgba(0,245,255,0.12)" }}
    >
      <div className="flex items-center justify-between px-1 mb-2 text-[10px] sm:text-xs font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(0,245,255,0.5)" }}>
        <span>KEYBOARD GUIDE</span>
        {nextChar && (
          <span style={{ color: "#00F5FF" }}>
            Next:{" "}
            <span
              className="px-1.5 py-0.5 rounded font-bold"
              style={{ background: "rgba(0,245,255,0.15)", border: "1px solid rgba(0,245,255,0.4)", color: "#00F5FF", boxShadow: "0 0 6px rgba(0,245,255,0.3)" }}
            >
              {nextChar === " " ? "Space" : nextChar}
            </span>
          </span>
        )}
      </div>

      <div className="space-y-1 sm:space-y-1.5">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5">
            {row.map((k) => {
              const isActive = activeKeys.has(k.key);
              const isShift = k.key.includes("shift");

              const baseStyle: React.CSSProperties = {
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "10px",
                background: "linear-gradient(135deg, rgba(42,42,53,0.8), rgba(20,20,24,0.8))",
                border: "1px solid rgba(42,42,53,0.9)",
                borderBottom: "2px solid rgba(0,0,0,0.5)",
                color: "rgba(150,155,170,0.7)",
                transition: "all 80ms ease-out",
              };

              const activeStyle: React.CSSProperties = isShift ? {
                background: "linear-gradient(135deg, rgba(255,184,0,0.2), rgba(255,184,0,0.06))",
                border: "1px solid rgba(255,184,0,0.6)",
                borderBottom: "2px solid rgba(255,184,0,0.3)",
                color: "#FFB800",
                boxShadow: "0 0 10px rgba(255,184,0,0.3)",
              } : {
                background: "linear-gradient(135deg, rgba(0,245,255,0.18), rgba(0,245,255,0.06))",
                border: "1px solid rgba(0,245,255,0.65)",
                borderBottom: "2px solid rgba(0,245,255,0.25)",
                color: "#00F5FF",
                boxShadow: "0 0 12px rgba(0,245,255,0.35)",
                transform: "translateY(1px)",
              };

              return (
                <div
                  key={k.key}
                  className={`h-7 sm:h-9 rounded sm:rounded-md flex items-center justify-center font-bold ${k.width || "w-7 sm:w-9"}`}
                  style={isActive ? { ...baseStyle, ...activeStyle } : baseStyle}
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
