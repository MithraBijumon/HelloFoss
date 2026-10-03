"use client";

import { motion } from "framer-motion";

const COLUMNS = 22;
const ROWS = 7;
const CELL = 13;
const GAP = 4;
const PITCH = CELL + GAP;

const MONTH_LABELS = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];

/** Deterministic PRNG (mulberry32) so server and client render identical cells. */
function seededRandom(seed: number) {
  let t = seed;
  return function next() {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), t | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = seededRandom(1312);

const cells = Array.from({ length: COLUMNS * ROWS }, (_, i) => {
  const col = Math.floor(i / ROWS);
  const row = i % ROWS;
  const isWeekend = row === 0 || row === 6;
  const recency = col / COLUMNS;
  const score = rand() * 0.55 + recency * 0.35 + (isWeekend ? 0 : 0.1);
  const level = score > 0.82 ? 4 : score > 0.62 ? 3 : score > 0.42 ? 2 : score > 0.24 ? 1 : 0;
  return { id: `${col}-${row}`, col, row, level };
});

const levelFill = [
  "var(--border)",
  "color-mix(in srgb, var(--accent) 30%, transparent)",
  "color-mix(in srgb, var(--accent) 55%, transparent)",
  "color-mix(in srgb, var(--accent) 78%, transparent)",
  "var(--accent)",
];

const gridWidth = COLUMNS * PITCH - GAP;
const gridHeight = ROWS * PITCH - GAP;

export function HeroGraph() {
  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
        <span className="ml-3 font-mono text-xs text-muted-subtle">
          contributions · last 6 months
        </span>
      </div>

      <div className="flex flex-col gap-4 px-5 py-6 sm:px-8 sm:py-10">
        <svg
          viewBox={`0 0 ${gridWidth} ${gridHeight + 16}`}
          className="w-full"
          role="img"
          aria-label="Heatmap of open-source contributions growing over the last six months"
        >
          {MONTH_LABELS.map((label, i) => (
            <text
              key={label}
              x={(i * COLUMNS) / MONTH_LABELS.length * PITCH}
              y={10}
              className="font-mono"
              fontSize={9}
              fill="var(--muted-subtle)"
            >
              {label}
            </text>
          ))}
          <g transform="translate(0, 16)">
            {cells.map((cell) => (
              <motion.rect
                key={cell.id}
                x={cell.col * PITCH}
                y={cell.row * PITCH}
                width={CELL}
                height={CELL}
                rx={3}
                fill={levelFill[cell.level]}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.3,
                  delay: 0.3 + cell.col * 0.025 + cell.row * 0.01,
                  ease: "easeOut",
                }}
              />
            ))}
          </g>
        </svg>

        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-muted-subtle">
            Contributions ramp up as the program progresses
          </p>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-muted-subtle">Less</span>
            {levelFill.map((fill, i) => (
              <span
                key={i}
                className="h-2.5 w-2.5 rounded-[3px]"
                style={{ backgroundColor: fill }}
                aria-hidden="true"
              />
            ))}
            <span className="font-mono text-[10px] text-muted-subtle">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
