import * as THREE from "three";
import { createBuilder, svg, paint, mix, smoothstep, noise } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Synthwave Arcade Cabinet",
  description: "1980s upright arcade cabinet with neon synthwave marquee, sunset side art, screen, joystick and buttons.",
};

const BLACK = "#14061f";
const PURPLE = "#2a0b4d";
const PINK = "#ff2e9a";
const CYAN = "#22e6ff";
const YELLOW = "#ffd84a";
const CHROME = "#c8c8e0";
const DARK = "#0a0412";

// Side art: sunset with grid
const SIDE = svg(
  `<svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
   <linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0638"/><stop offset="0.6" stop-color="#7a1470"/><stop offset="1" stop-color="#ff5a7a"/></linearGradient>
   <linearGradient id="u" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe14a"/><stop offset="1" stop-color="#ff2e9a"/></linearGradient>
  </defs>
  <rect width="100" height="200" fill="url(#s)"/>
  <circle cx="50" cy="105" r="30" fill="url(#u)"/>
  <rect x="15" y="108" width="70" height="3" fill="#7a1470"/>
  <rect x="15" y="116" width="70" height="4" fill="#7a1470"/>
  <rect x="15" y="125" width="70" height="5" fill="#7a1470"/>
  <rect y="135" width="100" height="65" fill="#12042a"/>
  <g stroke="#22e6ff" stroke-width="1.2" fill="none">
   <path d="M0 140H100M0 150H100M0 163H100M0 180H100"/>
   <path d="M50 135L50 200M30 135L0 200M70 135L100 200M10 135L-50 200M90 135L150 200"/>
  </g>
  <path d="M0 135L20 120L35 132L55 112L75 130L100 118V135Z" fill="#0a0412"/>
  <g fill="#fff"><circle cx="12" cy="20" r="1"/><circle cx="80" cy="30" r="1.2"/><circle cx="40" cy="12" r="0.9"/><circle cx="65" cy="60" r="1"/><circle cx="20" cy="70" r="0.8"/></g>
 </svg>`,
  { size: 256 },
);

const MARQUEE = svg(
  `<svg viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="50" fill="#1a0638"/>
  <rect x="3" y="3" width="194" height="44" fill="none" stroke="#22e6ff" stroke-width="2"/>
  <text x="100" y="33" text-anchor="middle" font-family="Impact, sans-serif" font-weight="bold" font-size="28" fill="#ff2e9a" stroke="#ffd84a" stroke-width="1.2">NEON RACER</text>
  <path d="M10 42H190" stroke="#ffd84a" stroke-width="1.5"/>
  <path d="M10 10H60M140 10H190" stroke="#22e6ff" stroke-width="1.5"/>
 </svg>`,
  { size: 512 },
);

const SCREEN = svg(
  `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg">
  <defs>
   <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#10043a"/><stop offset="0.55" stop-color="#a0187c"/><stop offset="1" stop-color="#ff6a6a"/></linearGradient>
  </defs>
  <rect width="120" height="90" fill="url(#g)"/>
  <circle cx="60" cy="48" r="20" fill="#ffd84a"/>
  <rect y="46" width="120" height="3" fill="#a0187c"/>
  <rect y="52" width="120" height="3" fill="#a0187c"/>
  <rect y="58" width="120" height="32" fill="#0a0230"/>
  <g stroke="#22e6ff" stroke-width="0.8"><path d="M0 64H120M0 72H120M0 82H120M60 58V90M40 58L10 90M80 58L110 90M20 58L-30 90M100 58L150 90"/></g>
  <path d="M52 84L60 66L68 84Z" fill="#ff2e9a" stroke="#fff" stroke-width="1"/>
  <text x="8" y="10" font-family="monospace" font-size="7" fill="#fff">SCORE 004200</text>
  <text x="80" y="10" font-family="monospace" font-size="7" fill="#22e6ff">HI 099990</text>
  <path d="M0 0H120M0 3H120M0 6H120" stroke="#000" stroke-opacity="0.12" stroke-width="0.6"/>
 </svg>`,
  { size: 384 },
);

const PANEL = svg(
  `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="40" fill="#1a0638"/>
  <path d="M0 6H100" stroke="#ff2e9a" stroke-width="2"/>
  <path d="M0 36H100" stroke="#22e6ff" stroke-width="2"/>
  <text x="50" y="26" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="9" fill="#ffd84a">INSERT COIN</text>
 </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "arcade" });
  b.joint("root", { at: [0, 0, 0] });

  const W = 0.68; // width
  const D = 0.8; // depth
  const body = paint((p, n) => {
    const base = mix(PURPLE, BLACK, smoothstep(0.2, 1.8, p.y));
    const sp = noise(p, 0.05, 3) * 0.08;
    return mix(base, "#4a1a80", sp + (n.y > 0.5 ? 0.15 : 0));
  });

  const box = (w: number, h: number, d: number, col: any, x: number, y: number, z: number, tex?: any) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { at: [x, y, z], texture: tex });

  // Base plinth
  box(W, 0.1, D, DARK, 0, 0.05, 0);
  // Side panels (profile extrude)
  const prof: [number, number][] = [
    [0, 0.1], [D * 0.5 + 0.0, 0.1], [0.4, 0.95], [0.46, 1.02], [0.46, 1.42], [0.28, 1.42],
    [0.28, 1.62], [0.28, 1.88], [0.4, 1.88], [0.4, 1.95], [-0.4, 1.95], [-0.4, 0.1],
  ].map(([z, y]) => [z, y]) as any;
  const sideProfile: [number, number][] = [
    [-0.4, 0.1], [0.4, 0.1], [0.4, 0.92], [0.46, 1.02], [0.46, 1.32], [0.3, 1.34],
    [0.3, 1.5], [0.4, 1.5], [0.4, 1.95], [-0.4, 1.95],
  ];
  void prof;
  for (const s of [1, -1]) {
    const x = s * (W / 2 - 0.02);
    const e = b.extrude(sideProfile, { at: [x, 0, 0], x: [0, 0, 1], thickness: 0.04, color: body });
    // side art
    const art = new THREE.PlaneGeometry(0.62, 1.2);
    b.part(art, "#ffffff", {
      at: [s * (W / 2 + 0.003), 0.95, -0.02],
      dir: [s, 0, 0],
      axis: "z",
      texture: SIDE,
    });
    // neon edge strips
    glow(box(0.012, 1.85, 0.012, PINK, s * (W / 2 + 0.004), 1.02, 0.405), 1.5);
    glow(box(0.012, 0.012, 0.8, CYAN, s * (W / 2 + 0.004), 1.955, 0), 1.5);
    void e;
  }
  // Back
  box(W - 0.02, 1.85, 0.03, BLACK, 0, 1.025, -0.385);
  // Front lower
  box(W - 0.04, 0.82, 0.03, body, 0, 0.51, 0.385);
  glow(box(W - 0.08, 0.015, 0.01, CYAN, 0, 0.14, 0.403), 1.6);
  // Coin door
  box(0.2, 0.22, 0.012, "#241040", 0, 0.5, 0.4);
  for (const s of [1, -1]) {
    box(0.04, 0.05, 0.012, DARK, s * 0.05, 0.54, 0.408);
    glow(box(0.018, 0.03, 0.006, s > 0 ? PINK : YELLOW, s * 0.05, 0.54, 0.416), 1.4);
  }
  box(0.14, 0.02, 0.012, CHROME, 0, 0.42, 0.408);
  // Control deck
  const deck = b.part(new THREE.BoxGeometry(W - 0.04, 0.07, 0.36), body, { at: [0, 0.96, 0.58], rotation: [-14, 0, 0] });
  void deck;
  b.part(new THREE.BoxGeometry(W - 0.04, 0.012, 0.34), "#1a0638", { at: [0, 1.0, 0.585], rotation: [-14, 0, 0] });
  glow(box(W - 0.04, 0.012, 0.012, PINK, 0, 0.93, 0.76), 1.5);
  b.part(new THREE.PlaneGeometry(0.5, 0.2), "#ffffff", { at: [0, 1.012, 0.585], rotation: [-104, 0, 0], axis: "z", texture: PANEL });

  // Joystick
  const jy = 1.03;
  b.part(new THREE.CylinderGeometry(0.035, 0.04, 0.012, 12), CHROME, { at: [-0.15, jy, 0.58], rotation: [-14, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.1, 8), CHROME, { at: [-0.15, jy + 0.05, 0.575], rotation: [-14, 0, 0] });
  glow(b.part(new THREE.SphereGeometry(0.028, 10, 8), PINK, { at: [-0.15, jy + 0.105, 0.57] }), 0.5);
  // Buttons
  const cols = [CYAN, YELLOW, PINK, "#7dff6a", CYAN, YELLOW];
  cols.forEach((c, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.02 + col * 0.085;
    const z = 0.55 + row * 0.07;
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 12), DARK, { at: [x, 1.012 - row * 0.015, z], rotation: [-14, 0, 0] });
    glow(b.part(new THREE.CylinderGeometry(0.024, 0.026, 0.02, 12), c, { at: [x, 1.022 - row * 0.015, z - 0.003], rotation: [-14, 0, 0] }), 1.2);
  });
  // Start buttons
  for (const s of [1, -1]) glow(b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.01, 8), s > 0 ? "#ff4040" : "#4080ff", { at: [s * 0.1 + 0.1 * s, 1.025, 0.64], rotation: [-14, 0, 0] }), 1);

  // Monitor bezel
  box(W - 0.06, 0.5, 0.06, BLACK, 0, 1.45, 0.33);
  b.part(new THREE.BoxGeometry(0.52, 0.4, 0.04), DARK, { at: [0, 1.5, 0.34] });
  glow(b.part(new THREE.PlaneGeometry(0.46, 0.35), "#ffffff", { at: [0, 1.5, 0.362], texture: SCREEN }), 1.1);
  // screen glow frame
  glow(box(0.5, 0.01, 0.01, CYAN, 0, 1.705, 0.362), 1.5);
  glow(box(0.5, 0.01, 0.01, PINK, 0, 1.295, 0.362), 1.5);
  // Marquee
  box(W - 0.02, 0.2, 0.4, BLACK, 0, 1.85, 0.2 - 0.0);
  glow(b.part(new THREE.PlaneGeometry(W - 0.06, 0.16), "#ffffff", { at: [0, 1.85, 0.402], texture: MARQUEE }), 1.3);
  // Top cap and trim
  box(W + 0.02, 0.03, D + 0.02, DARK, 0, 1.965, 0);
  glow(box(W + 0.03, 0.012, 0.012, YELLOW, 0, 1.98, 0.41), 1.4);
  // Speaker slots on top-front under marquee
  for (let i = 0; i < 5; i++) box(0.4, 0.008, 0.01, DARK, 0, 1.2 - i * 0.025, 0.375);
  // Feet
  for (const sx of [1, -1]) for (const sz of [1, -1]) b.part(new THREE.CylinderGeometry(0.025, 0.03, 0.02, 8), CHROME, { at: [sx * 0.28, 0.0, sz * 0.32] });

  return b.root;
}
