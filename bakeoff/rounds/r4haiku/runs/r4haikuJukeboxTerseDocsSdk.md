```ts
import * as THREE from "three";
import { arc, createBuilder, gradient, mottle, spots, svg } from "agentic-3js-builder";

export const meta = {
  name: "Jukebox",
  description:
    "A 1950s cherry-red jukebox: cream bubble top with blue neon, a glowing record rack, a button bank and a spotted speaker grille.",
};

// Palette (sRGB)
const BLACK = "#1b181d";
const RED = "#c42a30";
const RED_DEEP = "#9a1c24";
const CREAM = "#f4e8cf";
const CREAM_WARM = "#f0c98c";
const CHROME = "#dde3e8";
const AMBER = "#f08b25";
const GLOW = "#ffe08a";
const WHITE = "#ffffff";
const BLUE = "#2f6fd6";
const YELLOW = "#f7d33a";
const GREEN = "#2fa36b";
const PURPLE = "#7d4cc0";
const ORANGE = "#f2692c";
const TEAL = "#1f9e9a";
const PINK = "#ef6fa0";

// Title marquee drawn as an SVG texture
const MARQUEE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 84">
    <rect width="640" height="84" fill="${CREAM}"/>
    <rect x="10" y="10" width="620" height="64" rx="12" fill="none" stroke="${RED}" stroke-width="5"/>
    <circle cx="50" cy="42" r="9" fill="${BLUE}"/>
    <circle cx="590" cy="42" r="9" fill="${BLUE}"/>
    <text x="320" y="60" text-anchor="middle" font-family="Georgia, serif" font-size="56" font-weight="bold" fill="${RED}" letter-spacing="7">MELODIA</text>
  </svg>`,
  { size: 1024 },
);

// Paints
const bakelite = mottle(RED, RED_DEEP, { size: 0.45, contrast: 0.6, seed: 4 });
const grille = spots(BLACK, "#4a434f", { size: 0.03, amount: 0.5, seed: 2 });
const glow = gradient(AMBER, GLOW, [0, 0.7, 0.28], [0, 1.1, 0.28]);
const domeGlow = gradient(CREAM, CREAM_WARM, [0, 1.5, 0], [0, 1.2, 0]);

export default function build() {
  const b = createBuilder({ name: "jukebox" });
  b.joint("cabinet", { at: [0, 0, 0] });

  // Plinth with a chrome kick strip
  b.part(new THREE.BoxGeometry(0.7, 0.1, 0.56), BLACK, { at: [0, 0.05, 0] });
  b.part(new THREE.BoxGeometry(0.72, 0.012, 0.58), CHROME, { at: [0, 0.106, 0] });

  // Lower cabinet, cream pinstripe belt, chrome top band
  b.part(new THREE.BoxGeometry(0.74, 0.488, 0.62), bakelite, { at: [0, 0.356, 0] });
  b.part(new THREE.BoxGeometry(0.748, 0.012, 0.624), CREAM, { at: [0, 0.384, 0] });
  b.part(new THREE.BoxGeometry(0.76, 0.02, 0.64), CHROME, { at: [0, 0.6, 0] });

  // Speaker grille: chrome bezel with a spotted black cloth behind it
  b.part(new THREE.BoxGeometry(0.6, 0.24, 0.01), CHROME, { at: [0, 0.25, 0.315] });
  b.part(new THREE.BoxGeometry(0.56, 0.2, 0.006), grille, { at: [0, 0.25, 0.323] });

  // Selection bank: cream plate with two rows of coloured keys
  b.part(new THREE.BoxGeometry(0.6, 0.16, 0.01), CREAM, { at: [0, 0.48, 0.315] });
  const keys = [AMBER, BLUE, GREEN, PURPLE, ORANGE, TEAL, YELLOW, PINK, RED, BLUE];
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 10; i++) {
      b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.014, 12), keys[(i + row * 3) % keys.length], {
        at: [(i - 4.5) * 0.055, row === 0 ? 0.52 : 0.44, 0.327],
        dir: [0, 0, 1],
      });
    }
  }

  // Tower body with chrome corner beads
  b.part(new THREE.BoxGeometry(0.7, 0.59, 0.52), bakelite, { at: [0, 0.905, 0] });
  for (const s of [-1, 1]) {
    b.rod([s * 0.35, 0.61, 0.26], [s * 0.35, 1.2, 0.26], 0.01, { color: CHROME });
    b.rod([s * 0.37, 0.12, 0.31], [s * 0.37, 0.6, 0.31], 0.01, { color: CHROME });
  }

  // Title marquee in a chrome frame
  b.part(new THREE.BoxGeometry(0.64, 0.088, 0.008), CHROME, { at: [0, 1.158, 0.262] });
  b.part(new THREE.PlaneGeometry(0.62, 0.0814), WHITE, { at: [0, 1.158, 0.27], texture: MARQUEE });

  // Record rack: chrome frame, amber backlight, four shelves, twenty sleeves
  b.part(new THREE.BoxGeometry(0.6, 0.42, 0.012), CHROME, { at: [0, 0.9, 0.266] });
  b.part(new THREE.BoxGeometry(0.56, 0.38, 0.008), glow, { at: [0, 0.9, 0.276] });

  const rowY = (j: number) => 0.9 + (j - 1.5) * 0.092;
  for (let j = 0; j < 4; j++) {
    b.part(new THREE.BoxGeometry(0.56, 0.008, 0.036), CHROME, { at: [0, rowY(j) - 0.046, 0.292] });
  }

  const sleeveColours = [YELLOW, BLUE, GREEN, PURPLE, ORANGE, TEAL, CREAM, PINK, BLACK, RED];
  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < 5; i++) {
      const k = j * 5 + i;
      const base = sleeveColours[(k * 3 + j) % sleeveColours.length];
      const color = k % 4 === 1 ? spots(base, WHITE, { size: 0.02, amount: 0.35, seed: k }) : base;
      b.part(new THREE.BoxGeometry(0.08, 0.08, 0.006), color, { at: [(i - 2) * 0.106, rowY(j), 0.287] });
    }
  }

  // Coin door on the lower tower
  b.part(new THREE.BoxGeometry(0.05, 0.036, 0.008), CHROME, { at: [0.24, 0.65, 0.264] });
  b.part(new THREE.BoxGeometry(0.014, 0.022, 0.004), BLACK, { at: [0.24, 0.65, 0.27] });

  // Chrome lip under the bubble, then the cream dome itself
  b.part(new THREE.BoxGeometry(0.75, 0.016, 0.63), CHROME, { at: [0, 1.2, 0] });
  b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.74, 14, 1, false, 0, Math.PI), domeGlow, {
    at: [0, 1.2, 0],
    rotation: [0, 0, 90],
    flat: true,
  });

  // Chrome bezels round the dome ends
  for (const s of [-1, 1]) {
    b.sweep(arc([s * 0.37, 1.2, 0], [s * 0.37, 1.2, 0.3], [1, 0, 0], -180), 0.012, { color: CHROME });
  }

  // Blue neon tubes running across the dome
  for (const deg of [40, 70]) {
    const a = (deg * Math.PI) / 180;
    const y = 1.2 + 0.305 * Math.sin(a);
    const z = 0.305 * Math.cos(a);
    b.capsule([-0.34, y, z], [0.34, y, z], 0.011, { color: BLUE });
  }

  // Chrome finial on the apex
  b.part(new THREE.SphereGeometry(0.03, 10, 6), CHROME, { at: [0, 1.5, 0] });

  return b.root;
}
```