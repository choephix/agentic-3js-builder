import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, mix, noise, paint, smoothstep, svg } from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Piano Accordion (Madreperla)",
  description:
    "An Italian piano accordion covered in iridescent mother-of-pearl celluloid, with a ruby bellows, a gilt filigree grille, ivory keys, pearl bass buttons and jewelled trim.",
};

// ---------- palette & paints ----------
const RUBY_A = "#8e1420";
const RUBY_B = "#5a0b15";
const BAND = "#f1e6d2";
const IVORY = "#f6f0e2";
const EBONY = "#16100e";
const LEATHER = "#5a2e1c";
const DARK = "#241812";
const JEWEL = "#c8202e";
const JEWEL2 = "#22b6b0";

const PEARL = paint((p, n) => {
  const t = noise(p, 0.07, 3);
  const t2 = noise(p, 0.03, 11);
  let c = mix(mix("#f4ede2", "#f6cfdc", smoothstep(0.4, 0.7, t)), "#bfe6e0", smoothstep(0.55, 0.78, t2) * 0.75);
  c = mix(c, "#cfc2ee", smoothstep(0.62, 0.85, noise(p, 0.05, 21)) * 0.6);
  const swirl = 0.5 + 0.5 * Math.sin(p.x * 20 + p.y * 14 + p.z * 9 + t * 14);
  const k = 0.94 + 0.08 * swirl + 0.05 * n.y;
  return [Math.min(c[0] * k, 1), Math.min(c[1] * k, 1), Math.min(c[2] * k, 1)];
});
const GOLD = metal("gilt");
const CHROME = metal("steel", { polish: 0.7 });
const BRASS = metal("brass");

// ---------- dimensions ----------
const H = 0.42; // treble case height
const HB = 0.4; // bass case height
const HZ = 0.11; // half depth of cases
const TX0 = -0.26, TX1 = -0.09; // treble case x range
const BX0 = 0.17, BX1 = 0.26; // bass case x range
const NP = 14; // bellows pleats
const PP = (BX0 - TX1) / NP;
const BHY = 0.2, BHZ = 0.1, BCY = 0.21, INS = 0.86;

// ---------- textures ----------
const slots = (y0: number, rows: number) => {
  let s = "";
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < 10; c++)
      s += `<rect x="${18 + c * 11.5}" y="${y0 + r * 16}" width="6" height="11" rx="3" fill="#2b1a10"/>`;
  return s;
};
const petals = [...Array(8)]
  .map(
    (_, i) =>
      `<ellipse cx="70" cy="126" rx="9" ry="22" transform="rotate(${i * 45} 70 150)" fill="#f7ecef" stroke="#8a5f16" stroke-width="1.5"/>`,
  )
  .join("");
const GRILLE = svg(
  `<svg viewBox="0 0 140 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="140" height="300" fill="#2b1a10"/>
  <rect x="3" y="3" width="134" height="294" rx="10" fill="#d8a84a" stroke="#6b4a14" stroke-width="3"/>
  <rect x="9" y="9" width="122" height="282" rx="7" fill="none" stroke="#fff2b8" stroke-width="1.5"/>
  ${slots(20, 3)}${slots(232, 3)}
  <path d="M14 92 Q35 80 50 100 Q60 112 45 118 M126 92 Q105 80 90 100 Q80 112 95 118" fill="none" stroke="#6b4a14" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M14 208 Q35 220 50 200 Q60 188 45 182 M126 208 Q105 220 90 200 Q80 188 95 182" fill="none" stroke="#6b4a14" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="70" cy="150" r="52" fill="#2b1a10" stroke="#fff2b8" stroke-width="2.5"/>
  <circle cx="70" cy="150" r="46" fill="#d8a84a" stroke="#6b4a14" stroke-width="2"/>
  ${petals}
  <circle cx="70" cy="150" r="13" fill="#b3202c" stroke="#fff2b8" stroke-width="2"/>
  <circle cx="66" cy="146" r="4" fill="#ff9aa2"/>
</svg>`,
  { size: 320 },
);
const PLAQUE = svg(
  `<svg viewBox="0 0 120 30" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="118" height="28" rx="8" fill="#6e0f1c" stroke="#e5b84f" stroke-width="2"/>
  <rect x="7" y="7" width="5" height="16" fill="#1f8f4a"/><rect x="12" y="7" width="5" height="16" fill="#f4f0e6"/><rect x="17" y="7" width="5" height="16" fill="#cf2a2a"/>
  <text x="70" y="15" text-anchor="middle" font-family="serif" font-weight="bold" font-size="12" fill="#f0c860">BELLINI</text>
  <text x="70" y="25" text-anchor="middle" font-family="serif" font-style="italic" font-size="7" fill="#f6e7b8">Castelfidardo</text>
</svg>`,
  { size: 256 },
);
const dots = [1, 2, 3, 2, 1, 3, 2]
  .map((n, i) =>
    [...Array(n)].map((_, j) => `<circle cx="${12 + i * 17.5}" cy="${10 + j * 5}" r="1.8" fill="#f1e6d2"/>`).join(""),
  )
  .join("");
const REGISTER = svg(
  `<svg viewBox="0 0 130 65" xmlns="http://www.w3.org/2000/svg">
  <rect width="130" height="65" fill="#1b1412"/>
  <rect x="2" y="2" width="126" height="61" fill="none" stroke="#d8a84a" stroke-width="1.5"/>
  ${dots}
  ${[...Array(7)].map((_, i) => `<rect x="${7 + i * 17.5}" y="30" width="10" height="28" rx="5" fill="#000" stroke="#555" stroke-width="1"/>`).join("")}
</svg>`,
  { size: 256 },
);
const flower = (cx: number, cy: number, r: number) =>
  [...Array(6)]
    .map(
      (_, i) =>
        `<ellipse cx="${cx}" cy="${cy - r}" rx="${r * 0.55}" ry="${r}" transform="rotate(${i * 60} ${cx} ${cy})" fill="#fff6f0" stroke="#b98a2c" stroke-width="0.9"/>`,
    )
    .join("") + `<circle cx="${cx}" cy="${cy}" r="${r * 0.45}" fill="#e5b84f" stroke="#8a5f16" stroke-width="0.7"/>`;
const leaf = (cx: number, cy: number, rot: number) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="3.2" ry="7" transform="rotate(${rot} ${cx} ${cy})" fill="#7fd1c8" stroke="#b98a2c" stroke-width="0.9"/>`;
const INLAY = svg(
  `<svg viewBox="0 0 30 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M15 98 C3 82 27 70 15 55 C3 40 27 30 15 14" fill="none" stroke="#c99a35" stroke-width="2.4" stroke-linecap="round"/>
  ${leaf(7, 78, -40)}${leaf(23, 70, 40)}${leaf(7, 38, -40)}${leaf(23, 30, 40)}${leaf(8, 90, -60)}${leaf(22, 90, 60)}
  ${flower(15, 10, 6)}${flower(15, 55, 7.5)}${flower(15, 92, 5)}
</svg>`,
  { size: 320 },
);
const STRAP = svg(
  `<svg viewBox="0 0 60 12" xmlns="http://www.w3.org/2000/svg">
  <rect width="60" height="12" rx="2" fill="#6b3a22" stroke="#2c140a" stroke-width="1"/>
  <path d="M2 2.6 H58 M2 9.4 H58" stroke="#f1d9a8" stroke-width="0.8" stroke-dasharray="2 1.4"/>
</svg>`,
  { size: 256 },
);

// ---------- helpers ----------
const roundRect = (hz: number, y0: number, y1: number, c: number): [number, number][] => [
  [-hz, y0 + c], [-hz + c, y0], [hz - c, y0], [hz, y0 + c],
  [hz, y1 - c], [hz - c, y1], [-hz + c, y1], [-hz, y1 - c],
];
const bx = (sx: number, sy: number, sz: number, x: number, y: number, z: number) =>
  new THREE.BoxGeometry(sx, sy, sz).translate(x, y, z);
const toX = (g: THREE.BufferGeometry, x: number, y: number, z: number) => g.rotateZ(-Math.PI / 2).translate(x, y, z);

export default function build() {
  const b = createBuilder({ name: "accordion" });
  const put = (g: THREE.BufferGeometry, color: any, o: Record<string, any> = {}) =>
    b.part(g, color, { at: [0, 0, 0], ...o });
  const place = (g: THREE.BufferGeometry, color: any, at: [number, number, number], o: Record<string, any> = {}) =>
    b.part(g, color, { at, ...o });
  const plane = (w: number, h: number, tex: THREE.Texture, at: [number, number, number], dir: [number, number, number], up?: [number, number, number]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", up, texture: tex });

  // ----- case bodies (pearl) -----
  const trebleC = (TX0 + TX1) / 2;
  const bassC = (BX0 + BX1) / 2;
  b.extrude(roundRect(HZ, 0, H, 0.02), { at: [trebleC, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: TX1 - TX0, bevel: 0.008, color: PEARL });
  b.extrude(roundRect(HZ, 0, HB, 0.02), { at: [bassC, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: BX1 - BX0, bevel: 0.008, color: PEARL });

  // gilt bands where cases meet the bellows
  b.extrude(roundRect(HZ + 0.006, 0, H + 0.006, 0.022), { at: [TX1 - 0.002, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.012, bevel: 0.003, color: GOLD });
  b.extrude(roundRect(HZ + 0.006, 0, HB + 0.006, 0.022), { at: [BX0 + 0.002, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.012, bevel: 0.003, color: GOLD });
  // chrome bands round the outer ends
  b.extrude(roundRect(HZ + 0.004, 0, H + 0.004, 0.022), { at: [TX0 + 0.01, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.008, bevel: 0.002, color: CHROME });
  b.extrude(roundRect(HZ + 0.004, 0, HB + 0.004, 0.022), { at: [BX1 - 0.01, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.008, bevel: 0.002, color: CHROME });

  // ----- bellows -----
  for (let i = 0; i < NP * 2; i++) {
    const R = Math.SQRT2;
    const leftOuter = i % 2 === 0;
    const g = new THREE.CylinderGeometry(leftOuter ? R : R * INS, leftOuter ? R * INS : R, PP / 2, 4, 1);
    g.rotateY(Math.PI / 4);
    g.rotateZ(Math.PI / 2);
    b.part(g, leftOuter ? RUBY_A : RUBY_B, {
      at: [TX1 + (i + 0.5) * (PP / 2), BCY, 0],
      scale: [1, BHY, BHZ],
      flat: true,
      name: "pleat",
    });
  }
  const bands: THREE.BufferGeometry[] = [];
  const guards: THREE.BufferGeometry[] = [];
  for (let k = 0; k <= NP; k++) {
    const x = TX1 + k * PP;
    bands.push(bx(0.004, BHY * 2 + 0.004, BHZ * 2 + 0.004, x, BCY, 0));
    for (const sy of [1, -1])
      for (const sz of [1, -1]) guards.push(bx(0.012, 0.022, 0.022, x, BCY + sy * (BHY - 0.003), sz * (BHZ - 0.003)));
  }
  put(mergeGeometries(bands)!, BAND, { name: "bellowsBands" });
  put(mergeGeometries(guards)!, GOLD, { name: "bellowsCorners" });

  // bellows closure strap on the front
  place(new THREE.BoxGeometry(0.12, 0.03, 0.006), LEATHER, [0.1, 0.2, BHZ + 0.004], { name: "closureStrap" });
  plane(0.12, 0.024, STRAP, [0.1, 0.2, BHZ + 0.0075], [0, 0, 1]);
  place(new THREE.BoxGeometry(0.02, 0.038, 0.008), BRASS, [0.04, 0.2, BHZ + 0.006], { name: "buckle" });
  place(new THREE.BoxGeometry(0.01, 0.026, 0.01), DARK, [0.04, 0.2, BHZ + 0.008], { name: "buckleHole" });

  // ----- treble grille (front) -----
  const GX = -0.175, GY = 0.2;
  place(new THREE.BoxGeometry(0.148, 0.31, 0.004), GOLD, [GX, GY, HZ + 0.001], { name: "grilleBacking" });
  plane(0.14, 0.3, GRILLE, [GX, GY, HZ + 0.0035], [0, 0, 1]);
  const rods: THREE.BufferGeometry[] = [
    bx(0.152, 0.006, 0.006, GX, GY + 0.156, HZ + 0.002),
    bx(0.152, 0.006, 0.006, GX, GY - 0.156, HZ + 0.002),
    bx(0.006, 0.318, 0.006, GX - 0.073, GY, HZ + 0.002),
    bx(0.006, 0.318, 0.006, GX + 0.073, GY, HZ + 0.002),
  ];
  put(mergeGeometries(rods)!, GOLD, { name: "grilleFrame" });
  // nameplate
  place(new THREE.BoxGeometry(0.126, 0.036, 0.004), GOLD, [GX, 0.388, HZ + 0.001], { name: "plaqueFrame" });
  plane(0.12, 0.03, PLAQUE, [GX, 0.388, HZ + 0.0035], [0, 0, 1]);
  // jewels
  const jewelAt: [number, number, number, string][] = [
    [GX - 0.073, GY + 0.156, HZ + 0.006, JEWEL],
    [GX + 0.073, GY + 0.156, HZ + 0.006, JEWEL],
    [GX - 0.073, GY - 0.156, HZ + 0.006, JEWEL2],
    [GX + 0.073, GY - 0.156, HZ + 0.006, JEWEL2],
    [GX - 0.069, 0.388, HZ + 0.006, JEWEL2],
    [GX + 0.069, 0.388, HZ + 0.006, JEWEL2],
    [GX - 0.073, GY, HZ + 0.006, JEWEL],
    [GX + 0.073, GY, HZ + 0.006, JEWEL],
  ];
  for (const [x, y, z, c] of jewelAt) glow(place(new THREE.SphereGeometry(0.0065, 8, 5), c, [x, y, z], { name: "jewel" }), 0.6);

  // ----- treble keyboard (end face, -X) -----
  const BEDX = TX0 - 0.003;
  place(new THREE.BoxGeometry(0.006, 0.345, 0.168), DARK, [BEDX, 0.2175, -0.0175], { name: "keybed" });
  const rails = [
    bx(0.016, 0.008, 0.18, TX0 - 0.007, 0.043, -0.0175),
    bx(0.016, 0.008, 0.18, TX0 - 0.007, 0.392, -0.0175),
    bx(0.016, 0.352, 0.006, TX0 - 0.007, 0.2175, -0.103),
    bx(0.016, 0.352, 0.006, TX0 - 0.007, 0.2175, 0.068),
  ];
  put(mergeGeometries(rails)!, GOLD, { name: "keyRails" });
  const whites: THREE.BufferGeometry[] = [];
  const blacks: THREE.BufferGeometry[] = [];
  const pitch = 0.0148;
  for (let i = 0; i < 21; i++) {
    const y = 0.07 + i * pitch;
    whites.push(bx(0.012, 0.0136, 0.155, TX0 - 0.012, y, -0.0175));
    if (i < 20 && [0, 1, 3, 4, 5].includes(i % 7))
      blacks.push(bx(0.009, 0.0086, 0.065, TX0 - 0.0195, y + pitch / 2, -0.0625));
  }
  put(mergeGeometries(whites)!, IVORY, { name: "whiteKeys" });
  put(mergeGeometries(blacks)!, EBONY, { name: "blackKeys" });

  // ----- register switches (top of treble) -----
  place(new THREE.BoxGeometry(0.14, 0.003, 0.072), CHROME, [GX, H + 0.0015, -0.03], { name: "registerPlate" });
  plane(0.13, 0.065, REGISTER, [GX, H + 0.0033, -0.03], [0, 1, 0], [0, 0, -1]);
  for (let i = 0; i < 7; i++)
    place(new THREE.BoxGeometry(0.011, 0.007, 0.017), PEARL, [-0.2125 + i * 0.0175, H + 0.0068, -0.018 - (i % 2) * 0.012], { name: "registerTab" });
  // gold rim along treble top edges
  const topRims = [bx(0.17, 0.004, 0.006, trebleC, H + 0.001, HZ - 0.003), bx(0.17, 0.004, 0.006, trebleC, H + 0.001, -HZ + 0.003)];
  put(mergeGeometries(topRims)!, GOLD, { name: "trebleTopRim" });

  // ----- bass end (+X) -----
  const PX = BX1 + 0.003;
  place(new THREE.BoxGeometry(0.006, 0.35, 0.2), CHROME, [PX, 0.205, 0], { name: "bassPlate" });
  const bassRims = [
    bx(0.01, 0.006, 0.208, PX, 0.03, 0), bx(0.01, 0.006, 0.208, PX, 0.38, 0),
    bx(0.01, 0.35, 0.006, PX, 0.205, 0.103), bx(0.01, 0.35, 0.006, PX, 0.205, -0.103),
  ];
  put(mergeGeometries(bassRims)!, GOLD, { name: "bassRim" });
  const rings: THREE.BufferGeometry[] = [];
  const domes: THREE.BufferGeometry[] = [];
  const darkDomes: THREE.BufferGeometry[] = [];
  for (let r = 0; r < 10; r++)
    for (let c = 0; c < 6; c++) {
      const y = 0.19 + (r - 4.5) * 0.029;
      const z = (c - 2.5) * 0.03 + (r - 4.5) * 0.002;
      rings.push(toX(new THREE.CylinderGeometry(0.0092, 0.0092, 0.004, 10), PX + 0.005, y, z));
      const dome = toX(new THREE.SphereGeometry(0.0075, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), PX + 0.007, y, z);
      (c === 2 && r % 3 === 0 ? darkDomes : domes).push(dome);
    }
  put(mergeGeometries(rings)!, BRASS, { name: "buttonRings" });
  put(mergeGeometries(domes)!, PEARL, { name: "bassButtons" });
  put(mergeGeometries(darkDomes)!, EBONY, { name: "bassRootButtons" });
  place(toX(new THREE.CylinderGeometry(0.014, 0.014, 0.005, 12), PX + 0.005, 0.358, 0.07), GOLD, [0, 0, 0], { name: "airRing" });
  glow(place(toX(new THREE.SphereGeometry(0.01, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), PX + 0.007, 0.358, 0.07), JEWEL, [0, 0, 0], { name: "airButton" }), 0.5);

  // bass front inlay
  place(new THREE.BoxGeometry(0.003, 0.003, 0.003), PEARL, [0, 0, 0]);
  plane(0.075, 0.28, INLAY, [bassC, 0.2, HZ + 0.0015], [0, 0, 1]);

  // ----- straps (back) -----
  place(new THREE.BoxGeometry(0.07, 0.2, 0.012), LEATHER, [bassC, 0.2, -HZ - 0.006], { name: "bassPad" });
  plane(0.18, 0.04, STRAP, [bassC, 0.2, -HZ - 0.0125], [0, 0, -1]);
  for (const sy of [1, -1])
    place(new THREE.BoxGeometry(0.076, 0.012, 0.016), BRASS, [bassC, 0.2 + sy * 0.1, -HZ - 0.006], { name: "padClasp" });
  for (const sx of [-0.21, -0.14]) {
    place(new THREE.BoxGeometry(0.035, 0.37, 0.005), LEATHER, [sx, 0.215, -HZ - 0.003], { name: "shoulderStrap" });
    place(new THREE.BoxGeometry(0.04, 0.012, 0.012), BRASS, [sx, H - 0.01, -HZ - 0.004], { name: "strapSlide" });
  }

  // ----- pearl rivets on the chrome bands -----
  const rivets: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 9; i++) {
    const z = -0.09 + i * 0.0225;
    rivets.push(new THREE.SphereGeometry(0.0035, 6, 4).translate(TX1 - 0.008, H + 0.003, z));
    rivets.push(new THREE.SphereGeometry(0.0035, 6, 4).translate(BX0 + 0.008, HB + 0.003, z));
  }
  put(mergeGeometries(rivets)!, GOLD, { name: "rivets" });

  return b.root;
}
