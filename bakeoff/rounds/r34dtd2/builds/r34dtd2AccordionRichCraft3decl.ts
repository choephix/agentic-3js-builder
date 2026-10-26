import * as THREE from "three";
import { createBuilder, paint, patches, mix, smoothstep, noise, svg } from "../../../../src/index";

export const meta = {
  name: "Piano Accordion",
  description:
    "Italian piano accordion in mother-of-pearl: pearl-chip casing, 21-key piano keyboard, 72 bass buttons, red pleated bellows, gilt trim, filigree grilles, straps and a medallion.",
};

const H = 0.4; // instrument height
const D = 0.2; // depth
const CY = H / 2;
const GOLD = "#d4a838";
const BLACK = "#17121a";
const IVORY = "#fbf6ea";
const LEATHER = "#3a2216";

// ---------- paints ----------
const chips = patches("#b9a58e", ["#f7f0e8", "#e6f2f0", "#f4e4ee", "#e4e4f6", "#fbf3dc", "#efe9f8"], {
  size: 0.034,
  gap: 0.07,
  seed: 3,
});
const PEARL = paint((p, n) => {
  const c = chips.at(p, n);
  const sheen = noise(p, 0.12, 9);
  const t = smoothstep(0.35, 0.75, sheen) * 0.25;
  const k = 0.84 + 0.16 * smoothstep(-0.6, 1, n.y);
  const m = mix(c, [0.78, 0.9, 0.95], t);
  return [m[0] * k, m[1] * k, m[2] * k];
});
const DARKPEARL = paint((p, n) => {
  const c = PEARL.at(p, n);
  return [c[0] * 0.55, c[1] * 0.55, c[2] * 0.62];
});

// ---------- textures ----------
const scroll = (cx: number, cy: number, s: number, flip: number) =>
  `<path d="M${cx} ${cy} c${8 * s * flip} -10 ${22 * s * flip} -6 ${18 * s * flip} 6 c-3 8 -14 6 -12 -1 c1 -4 6 -4 6 0" fill="none" stroke="#e0b94a" stroke-width="2" stroke-linecap="round"/>`;
const GRILLE = svg(
  `<svg viewBox="0 0 150 120" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="146" height="116" rx="10" fill="#1b1218" stroke="#e0b94a" stroke-width="3"/>
  <rect x="9" y="9" width="132" height="102" rx="6" fill="none" stroke="#a8812c" stroke-width="1.6"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    .map((i) => `<path d="M${14 + i * 11} 15 L${14 + i * 11} 105" stroke="#3a2a30" stroke-width="3"/>`)
    .join("")}
  <circle cx="75" cy="60" r="30" fill="#1b1218" stroke="#e0b94a" stroke-width="2.4"/>
  <circle cx="75" cy="60" r="21" fill="none" stroke="#f4e4ee" stroke-width="2"/>
  <path d="M75 36 L81 54 L99 60 L81 66 L75 84 L69 66 L51 60 L69 54Z" fill="#e0b94a"/>
  <circle cx="75" cy="60" r="5" fill="#f6efe8"/>
  ${scroll(30, 40, 1, 1)}${scroll(30, 80, 1, 1)}${scroll(120, 40, 1, -1)}${scroll(120, 80, 1, -1)}
  ${[20, 40, 60, 80, 100].map((y) => `<circle cx="14" cy="${y}" r="2.2" fill="#f6efe8"/><circle cx="136" cy="${y}" r="2.2" fill="#f6efe8"/>`).join("")}
  </svg>`,
  { size: 512 },
);
const MEDALLION = svg(
  `<svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="3" width="94" height="194" rx="14" fill="#241a22" stroke="#e0b94a" stroke-width="3"/>
  <ellipse cx="50" cy="100" rx="38" ry="78" fill="#f1e9f2" stroke="#e0b94a" stroke-width="3"/>
  <ellipse cx="50" cy="100" rx="31" ry="70" fill="none" stroke="#b98fc4" stroke-width="2"/>
  <path d="M50 52 L56 82 L84 88 L60 104 L66 134 L50 118 L34 134 L40 104 L16 88 L44 82Z" fill="#e0b94a" stroke="#8a6a1e" stroke-width="1.5"/>
  <text x="50" y="40" text-anchor="middle" font-family="serif" font-weight="bold" font-size="14" fill="#3a2a30">ITALIA</text>
  <text x="50" y="164" text-anchor="middle" font-family="serif" font-style="italic" font-size="12" fill="#3a2a30">Madreperla</text>
  <path d="M20 180 q30 12 60 0" fill="none" stroke="#e0b94a" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M20 20 q30 -12 60 0" fill="none" stroke="#e0b94a" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,
  { size: 512 },
);
const BRAND = svg(
  `<svg viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="116" height="46" rx="8" fill="#e8c356" stroke="#8a6a1e" stroke-width="2.5"/>
  <rect x="7" y="7" width="106" height="36" rx="5" fill="none" stroke="#fff3b8" stroke-width="1.6"/>
  <text x="60" y="31" text-anchor="middle" font-family="serif" font-weight="bold" font-size="17" fill="#2a1a10">ROSSINI</text>
  <path d="M12 38 q8 -6 14 0 M108 38 q-8 -6 -14 0" fill="none" stroke="#8a6a1e" stroke-width="1.8"/>
  </svg>`,
  { size: 384 },
);

export default function build() {
  const b = createBuilder({ name: "accordion" });

  const box = (w: number, h: number, d: number, color: any, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });

  const decalPlane = (tex: THREE.Texture, w: number, h: number, at: number[], dir: number[], up: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, up, axis: "z", texture: tex });

  // ---------- the two casings ----------
  const casing = (cx: number) => {
    box(0.18, H - 0.024, D, PEARL, cx, CY, 0);
    for (const y of [0.006, H - 0.006]) box(0.19, 0.012, D + 0.01, DARKPEARL, cx, y, 0);
    // gilt corner rods and corner beads
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        b.rod([cx + sx * 0.09, 0.012, sz * (D / 2)], [cx + sx * 0.09, H - 0.012, sz * (D / 2)], 0.0035, GOLD);
        for (const y of [0.0, H])
          b.part(new THREE.SphereGeometry(0.0065, 6, 4), GOLD, { at: [cx + sx * 0.095, y === 0 ? 0.006 : y - 0.006, sz * (D / 2 + 0.005)] });
      }
  };
  casing(0.22); // treble (model's left, +X)
  casing(-0.22); // bass

  // ---------- bellows ----------
  const N = 14;
  const step = 0.26 / N;
  for (let i = 0; i < N; i++) {
    const x = -0.13 + (i + 0.5) * step;
    const peak = i % 2 === 0;
    const hh = peak ? H - 0.018 : H - 0.06;
    const dd = peak ? D - 0.014 : D - 0.05;
    box(step * 0.62, hh, dd, peak ? "#9b1b2a" : "#650c18", x, CY, 0);
    if (peak) {
      b.part(new THREE.BoxGeometry(step * 0.64, 0.01, dd * 0.9), "#d8c7a0", { at: [x, CY + hh / 2, 0] });
      for (const sy of [-1, 1])
        for (const sz of [-1, 1])
          box(step * 0.66, 0.026, 0.022, BLACK, x, CY + sy * (hh / 2 - 0.011), sz * (dd / 2 - 0.008));
    }
  }

  // ---------- keyboard (treble front) ----------
  const kp = 0.0165;
  const kb = 21;
  const zf = D / 2;
  box(0.15, 0.37, 0.006, "#1c1417", 0.22, CY, zf + 0.003);
  for (const sx of [-1, 1]) {
    box(0.02, 0.372, 0.014, DARKPEARL, 0.22 + sx * 0.085, CY, zf + 0.005);
    b.rod([0.22 + sx * 0.0745, 0.012, zf + 0.012], [0.22 + sx * 0.0745, H - 0.012, zf + 0.012], 0.0022, GOLD);
  }
  const y0 = CY - (kb * kp) / 2 + kp / 2;
  for (let i = 0; i < kb; i++) {
    box(0.13, kp - 0.0016, 0.01, IVORY, 0.22, y0 + i * kp, zf + 0.011);
    box(0.004, kp - 0.0016, 0.004, "#e8dcc2", 0.22 - 0.063, y0 + i * kp, zf + 0.017);
  }
  for (let i = 0; i < kb - 1; i++) {
    if ([0, 1, 3, 4, 5].includes(i % 7)) box(0.075, 0.0105, 0.008, BLACK, 0.22 + 0.028, y0 + (i + 0.5) * kp, zf + 0.0195);
  }

  // register switches and grille on the treble top
  for (let i = 0; i < 6; i++) {
    box(0.016, 0.004, 0.012, i % 2 ? "#f1e3ee" : GOLD, 0.165 + i * 0.022, H + 0.002, 0.075);
  }
  decalPlane(GRILLE, 0.15, 0.12, [0.22, H + 0.0012, -0.02], [0, 1, 0], [0, 0, -1]);
  decalPlane(MEDALLION, 0.15, 0.3, [0.3155, CY, 0], [1, 0, 0], [0, 1, 0]);

  // ---------- bass buttons (bass front) ----------
  box(0.14, 0.36, 0.006, "#1c1417", -0.22, CY, zf + 0.003);
  const bg = new THREE.CylinderGeometry(0.0085, 0.0085, 0.008, 8);
  const ring = new THREE.CylinderGeometry(0.0105, 0.0105, 0.004, 8);
  for (let c = 0; c < 6; c++)
    for (let r = 0; r < 12; r++) {
      const x = -0.22 + (c - 2.5) * 0.022;
      const y = CY + (r - 5.5) * 0.026;
      const mark = c === 2 && r % 3 === 1;
      b.part(ring, GOLD, { at: [x, y, zf + 0.007], dir: [0, 0, 1] });
      b.part(bg, mark ? BLACK : c % 2 ? "#e9f1f0" : "#f6ece6", { at: [x, y, zf + 0.011], dir: [0, 0, 1] });
    }
  decalPlane(BRAND, 0.13, 0.054, [-0.22, H + 0.0012, 0.0], [0, 1, 0], [0, 0, -1]);
  decalPlane(MEDALLION, 0.15, 0.3, [-0.3155, CY, 0], [-1, 0, 0], [0, 1, 0]);

  // ---------- strap and buckle across the front ----------
  box(0.3, 0.02, 0.006, LEATHER, -0.16, 0.372, zf + 0.0045);
  box(0.03, 0.026, 0.01, GOLD, 0.0, 0.372, zf + 0.007);
  box(0.016, 0.012, 0.012, "#2a1a10", 0.0, 0.372, zf + 0.009);

  // ---------- straps at the back ----------
  for (const y of [0.33, 0.09]) {
    const path = [
      [0.2, y, -0.1],
      [0.17, y - 0.02, -0.15],
      [0, y - 0.03, -0.165],
      [-0.17, y - 0.02, -0.15],
      [-0.22, y, -0.1],
    ];
    b.sweep(b.root ? path : path, (t) => [0.016, 0.004], { color: LEATHER, up: [0, 1, 0], caps: "flat" });
    for (const x of [0.2, -0.22]) box(0.024, 0.02, 0.008, GOLD, x, y, -0.104);
  }
  // hand strap on the bass back
  const hand = [
    [-0.27, 0.12, -0.1],
    [-0.27, 0.12, -0.14],
    [-0.27, 0.28, -0.14],
    [-0.27, 0.28, -0.1],
  ];
  b.sweep(hand, [0.013, 0.003], { color: "#4a2c1a", caps: "flat", up: [1, 0, 0] });

  return b.root;
}
