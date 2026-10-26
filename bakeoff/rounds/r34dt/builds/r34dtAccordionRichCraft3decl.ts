import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, paint, noise, mix, smoothstep, svg, mottle, grain } from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Piano Accordion",
  description:
    "Italian mother-of-pearl piano accordion: iridescent celluloid cases, red bellows, chrome grilles, 26 piano keys, bass buttons and leather straps.",
};

// ---- dimensions (meters) ----
const W = 0.22; // case width (x)
const H = 0.46; // case height (y)
const BZ = 0.2; // half length of the bellows
const TZ = 0.38; // treble front plate
const FOLDS = 32;

// ---- palette ----
const BLACK = "#16131a";
const CREAM = "#f7f2e4";
const RED = "#7a1020";
const RED2 = "#951a2b";
const GOLD = "#d8a93c";
const LEATHER = "#2a1a16";
const RHINE = "#e0203a";

const PEARL_A = "#f6efe6";
const PEARL_B = "#cfe9ee";
const PEARL_C = "#f3cfdc";
const PEARL_D = "#ebdcae";

// Iridescent celluloid: a creamy base drifting through aqua, pink and gold with swirl bands.
const pearl = paint((p, n) => {
  const a = noise(p, 0.07, 3);
  const c = noise(p, 0.028, 9);
  const swirl = 0.5 + 0.5 * Math.sin((a * 8 + c * 3) * Math.PI);
  const base = mix(PEARL_A, PEARL_B, smoothstep(0.35, 0.7, a));
  const tint = mix(PEARL_C, PEARL_D, c);
  const col = mix(base, tint, swirl * 0.5);
  const lit = mix(col, "#ffffff", Math.max(0, n.y) * 0.25);
  const k = 0.9 + 0.1 * smoothstep(-0.8, 0.5, n.y);
  return [lit[0] * k, lit[1] * k, lit[2] * k];
});
const BELLOWS_A = mottle(RED, "#5a0b16", { size: 0.05, seed: 4 });
const BELLOWS_B = mottle(RED2, "#6e0f1c", { size: 0.05, seed: 5 });
const LEATH = grain("#34211b", "#1b100d", { size: 0.01, axis: "y", seed: 2 });
const CHROME = metal("steel", { polish: 0.8, tarnish: 0.05 });
const BRASS = metal("gilt");

// ---- textures ----
const GRILLE = (() => {
  let slots = "";
  for (let r = 0; r < 7; r++)
    for (let c = 0; c < 13; c++) {
      const x = 6 + c * 8.7;
      const y = 5 + r * 10.2;
      if (Math.hypot(x + 3 - 60, y + 1.5 - 40) < 17) continue;
      slots += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="6.4" height="3.4" rx="1.7" fill="#232833"/>`;
    }
  return svg(
    `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f7fb"/><stop offset="0.5" stop-color="#aab3c2"/><stop offset="1" stop-color="#e6ebf2"/></linearGradient></defs>
    <rect width="120" height="80" fill="url(#c)"/>
    ${slots}
    <circle cx="60" cy="40" r="16" fill="#d8a93c" stroke="#5c4310" stroke-width="1.6"/>
    <polygon points="60,26 63,36 73,33 66,41 74,47 64,47 60,56 56,47 46,47 54,41 47,33 57,36" fill="#7a1020" stroke="#3a0810" stroke-width="1"/>
    <circle cx="60" cy="40" r="3.4" fill="#f6efe6" stroke="#5c4310" stroke-width="0.8"/>
    <rect x="1" y="1" width="118" height="78" fill="none" stroke="#2a2f3a" stroke-width="2"/>
  </svg>`,
    { size: 384 },
  );
})();

const BADGE = svg(
  `<svg viewBox="0 0 150 100" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="g" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stop-color="#fff3c4"/><stop offset="1" stop-color="#b98a2a"/></radialGradient></defs>
    <ellipse cx="75" cy="50" rx="70" ry="44" fill="url(#g)" stroke="#4a3208" stroke-width="3"/>
    <ellipse cx="75" cy="50" rx="62" ry="36" fill="none" stroke="#7a5a18" stroke-width="1.5" stroke-dasharray="3 3"/>
    <ellipse cx="75" cy="46" rx="48" ry="26" fill="#f6efe6" stroke="#4a3208" stroke-width="1.5"/>
    <path d="M30 46 Q50 34 75 46 T120 46" fill="none" stroke="#9fd3de" stroke-width="3"/>
    <path d="M30 52 Q50 40 75 52 T120 52" fill="none" stroke="#f0b4c8" stroke-width="3"/>
    <text x="75" y="48" text-anchor="middle" font-family="serif" font-weight="bold" font-style="italic" font-size="19" fill="#7a1020">Armonia</text>
    <path d="M18 74 L132 74 L124 90 L26 90 Z" fill="#7a1020" stroke="#2a0409" stroke-width="2"/>
    <text x="75" y="86" text-anchor="middle" font-family="serif" font-weight="bold" font-size="12" fill="#f7e6a8">CASTELFIDARDO</text>
    <circle cx="75" cy="12" r="5" fill="#e0203a" stroke="#4a3208" stroke-width="1.5"/>
  </svg>`,
  { size: 384 },
);

const TRIM = svg(
  (() => {
    let d = "";
    for (let i = 0; i < 16; i++) {
      const x = i * 10;
      d += `<polygon points="${x + 5},1 ${x + 9},5 ${x + 5},9 ${x + 1},5" fill="${i % 2 ? "#16131a" : "#d8a93c"}"/>`;
    }
    return `<svg viewBox="0 0 160 10" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="10" fill="#f7f2e4"/>${d}<rect y="0" width="160" height="1" fill="#16131a"/><rect y="9" width="160" height="1" fill="#16131a"/></svg>`;
  })(),
  { size: 512 },
);

export default function build() {
  const b = createBuilder({ name: "pianoAccordion" });
  const R = rng7();

  const box = (w: number, h: number, d: number, x: number, y: number, z: number) =>
    new THREE.BoxGeometry(w, h, d).translate(x, y, z);
  const merged = (geos: THREE.BufferGeometry[], color: any, opts: any = {}) =>
    geos.length ? b.part(mergeGeometries(geos)!, color, { at: [0, 0, 0], ...opts }) : null;

  // ---- case builder shared by treble and bass ----
  function edgeRods(cx: number, cy: number, cz: number, w: number, h: number, d: number) {
    const xs = [-w / 2, w / 2];
    const ys = [-h / 2, h / 2];
    const zs = [-d / 2, d / 2];
    const o = { sides: 6, caps: "flat" as const };
    for (const y of ys)
      for (const z of zs) b.rod([cx - w / 2, cy + y, cz + z], [cx + w / 2, cy + y, cz + z], 0.004, CHROME, o);
    for (const x of xs)
      for (const z of zs) b.rod([cx + x, cy - h / 2, cz + z], [cx + x, cy + h / 2, cz + z], 0.004, CHROME, o);
    for (const x of xs)
      for (const y of ys) b.rod([cx + x, cy + y, cz - d / 2], [cx + x, cy + y, cz + d / 2], 0.004, CHROME, o);
  }

  const caseD = TZ - BZ;
  const trebleZ = (BZ + TZ) / 2;
  const bassZ = -trebleZ;
  b.part(new THREE.BoxGeometry(W, H, caseD), pearl, { at: [0, H / 2, trebleZ] });
  b.part(new THREE.BoxGeometry(W, H, caseD), pearl, { at: [0, H / 2, bassZ] });
  edgeRods(0, H / 2, trebleZ, W, H, caseD);
  edgeRods(0, H / 2, bassZ, W, H, caseD);

  // side trims and badge
  for (const s of [1, -1])
    for (const zc of [trebleZ, bassZ])
      for (const y of [0.03, H - 0.03])
        b.part(new THREE.BoxGeometry(0.004, 0.02, caseD * 0.84), "#ffffff", {
          at: [s * (W / 2 + 0.001), y, zc],
          texture: TRIM,
        });
  for (const zc of [trebleZ, bassZ])
    b.part(new THREE.PlaneGeometry(0.15, 0.1), "#ffffff", {
      at: [W / 2 + 0.0015, H / 2, zc],
      dir: [1, 0, 0],
      axis: "z",
      texture: BADGE,
    });

  // ---- bellows ----
  const peak: [number, number] = [W - 0.015, H - 0.015];
  const val: [number, number] = [0.15, 0.38];
  const zAt = (k: number) => -BZ + (k * 2 * BZ) / FOLDS;
  for (let k = 0; k < FOLDS; k++) {
    const aPeak = k % 2 === 0;
    b.frustumBox([0, H / 2, zAt(k)], [0, H / 2, zAt(k + 1)], aPeak ? peak : val, aPeak ? val : peak, {
      color: aPeak ? BELLOWS_A : BELLOWS_B,
    });
  }
  const plates: THREE.BufferGeometry[] = [];
  for (let k = 0; k <= FOLDS; k += 2) plates.push(box(W - 0.008, H - 0.008, 0.005, 0, H / 2, zAt(k)));
  merged(plates, CREAM);
  for (const sx of [1, -1])
    for (const sy of [1, -1])
      b.rod(
        [sx * (peak[0] / 2), H / 2 + sy * (peak[1] / 2), -BZ],
        [sx * (peak[0] / 2), H / 2 + sy * (peak[1] / 2), BZ],
        0.0045,
        BRASS,
        { sides: 6, caps: "flat" },
      );

  // ---- treble keyboard ----
  b.part(new THREE.BoxGeometry(0.17, H - 0.05, 0.006), BLACK, { at: [0, H / 2, TZ + 0.003] });
  // frame strips (black pearl) either side and top/bottom
  const frame: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) frame.push(box(0.025, H, 0.006, s * 0.0975, H / 2, TZ + 0.003));
  frame.push(box(0.17, 0.025, 0.006, 0, 0.0125, TZ + 0.003), box(0.17, 0.025, 0.006, 0, H - 0.0125, TZ + 0.003));
  merged(frame, BLACK);
  const yS = 0.045;
  const pitch = (H - 0.09) / 26;
  const whites: THREE.BufferGeometry[] = [];
  const blacks: THREE.BufferGeometry[] = [];
  const names = ["F", "G", "A", "B", "C", "D", "E"];
  for (let i = 0; i < 26; i++) {
    whites.push(box(0.14, pitch * 0.92, 0.02, 0, yS + (i + 0.5) * pitch, TZ + 0.013));
    const nm = names[i % 7];
    if (i < 25 && nm !== "E" && nm !== "B")
      blacks.push(box(0.08, 0.0085, 0.014, -0.03, yS + (i + 1) * pitch, TZ + 0.025));
  }
  merged(whites, CREAM);
  merged(blacks, BLACK);
  // rhinestones along the frame
  const stones: THREE.BufferGeometry[] = [];
  for (const s of [1, -1])
    for (let i = 0; i < 11; i++)
      stones.push(new THREE.SphereGeometry(0.0048, 6, 4).translate(s * 0.0975, 0.03 + i * 0.04, TZ + 0.008));
  const st = merged(stones, RHINE);
  if (st) glow(st, 0.6);

  // ---- treble top: grille + register switches ----
  const grZ = 0.27;
  b.part(new THREE.PlaneGeometry(0.17, 0.1), "#ffffff", {
    at: [0, H + 0.0012, grZ],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, 1],
    texture: GRILLE,
  });
  b.part(new THREE.BoxGeometry(0.18, 0.004, 0.11), CHROME, { at: [0, H + 0.0005, grZ] });
  b.part(new THREE.BoxGeometry(0.17, 0.004, 0.032), BLACK, { at: [0, H + 0.002, 0.345] });
  const sw: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) sw.push(box(0.02, 0.009, 0.014, -0.065 + i * 0.026, H + 0.0065, 0.345 + (i % 2 ? 0.004 : -0.004)));
  merged(sw, CREAM);

  // ---- bass end: buttons ----
  const BZF = -TZ;
  b.part(new THREE.BoxGeometry(0.17, H - 0.05, 0.006), BLACK, { at: [0, H / 2, BZF - 0.003] });
  const btnW: THREE.BufferGeometry[] = [];
  const btnB: THREE.BufferGeometry[] = [];
  const rings: THREE.BufferGeometry[] = [];
  for (let r = 0; r < 11; r++)
    for (let c = 0; c < 6; c++) {
      const x = (c - 2.5) * 0.026 + (r % 2 ? 0.006 : -0.006);
      const y = 0.055 + r * 0.035;
      const geo = new THREE.CylinderGeometry(0.0105, 0.0115, 0.012, 8).rotateX(-Math.PI / 2).translate(x, y, BZF - 0.01);
      (r % 5 === 2 && c === 2 ? btnB : btnW).push(geo);
      rings.push(new THREE.CylinderGeometry(0.0138, 0.0138, 0.004, 8).rotateX(-Math.PI / 2).translate(x, y, BZF - 0.0068));
    }
  merged(btnW, "#f8f5ee", { flat: true });
  merged(btnB, BLACK, { flat: true });
  merged(rings, CHROME, { flat: true });

  // ---- bass top: vent + air button ----
  b.part(new THREE.PlaneGeometry(0.17, 0.1), "#ffffff", {
    at: [0, H + 0.0012, bassZ + 0.02],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, 1],
    texture: GRILLE,
  });
  b.part(new THREE.BoxGeometry(0.18, 0.004, 0.11), CHROME, { at: [0, H + 0.0005, bassZ + 0.02] });
  b.part(new THREE.CylinderGeometry(0.014, 0.016, 0.012, 8), CHROME, { at: [0.06, H + 0.006, bassZ - 0.07], flat: true });
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.006, 8), BLACK, { at: [0.06, H + 0.015, bassZ - 0.07], flat: true });

  // ---- feet / corner caps ----
  const feet: THREE.BufferGeometry[] = [];
  for (const sx of [1, -1])
    for (const zc of [trebleZ, bassZ])
      for (const sz of [1, -1]) feet.push(box(0.03, 0.012, 0.03, sx * 0.095, 0.006, zc + sz * (caseD / 2 - 0.016)));
  merged(feet, CHROME);

  // ---- back (-X): straps ----
  for (const zc of [trebleZ + 0.0, bassZ]) {
    b.part(new THREE.BoxGeometry(0.01, H * 0.9, 0.05), LEATH, { at: [-W / 2 - 0.004, H / 2, zc] });
    b.part(new THREE.BoxGeometry(0.004, H * 0.9, 0.006), GOLD, { at: [-W / 2 - 0.0095, H / 2, zc + 0.016], flat: true });
    b.part(new THREE.BoxGeometry(0.004, H * 0.9, 0.006), GOLD, { at: [-W / 2 - 0.0095, H / 2, zc - 0.016], flat: true });
    // buckle
    b.part(new THREE.TorusGeometry(0.02, 0.0035, 6, 12), CHROME, {
      at: [-W / 2 - 0.012, H * 0.62, zc],
      dir: [-1, 0, 0],
      axis: "z",
    });
    b.part(new THREE.BoxGeometry(0.005, 0.01, 0.052), CHROME, { at: [-W / 2 - 0.012, H * 0.62 + 0.0, zc] });
    // D-ring at the top
    b.part(new THREE.TorusGeometry(0.014, 0.003, 6, 10), CHROME, { at: [-W / 2 - 0.006, H - 0.03, zc], dir: [-1, 0, 0], axis: "z" });
  }
  // rivets
  const rivets: THREE.BufferGeometry[] = [];
  for (const zc of [trebleZ, bassZ])
    for (let i = 0; i < 6; i++) rivets.push(new THREE.SphereGeometry(0.0045, 6, 4).translate(-W / 2 - 0.0095, 0.06 + i * 0.07, zc + 0.0));
  merged(rivets, BRASS);
  // hand loop on the bass box
  b.sweep(
    [
      [-W / 2 - 0.005, 0.12, bassZ - 0.03],
      [-W / 2 - 0.045, 0.12, bassZ - 0.035],
      [-W / 2 - 0.045, 0.3, bassZ - 0.035],
      [-W / 2 - 0.005, 0.3, bassZ - 0.03],
    ],
    () => [0.02, 0.004],
    { color: LEATH, section: "box", caps: "flat", up: [0, 0, 1] },
  );
  // thumb strap on treble back: small leather arch
  b.sweep(
    [
      [-W / 2 - 0.005, 0.14, trebleZ + 0.06],
      [-W / 2 - 0.035, 0.14, trebleZ + 0.065],
      [-W / 2 - 0.035, 0.26, trebleZ + 0.065],
      [-W / 2 - 0.005, 0.26, trebleZ + 0.06],
    ],
    () => [0.012, 0.003],
    { color: LEATH, section: "box", caps: "flat", up: [0, 0, 1] },
  );

  void R;
  return b.root;
}

function rng7() {
  return () => 0.5;
}
