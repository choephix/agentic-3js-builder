```ts
import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, svg } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Piano accordion",
  description: "Italian mother-of-pearl piano accordion with a red bellows, gilt trim, a grille and an inlay.",
};

const PEARL = paint((p, n) => {
  const t = noise(p, 0.05, 3);
  const u = noise(p, 0.13, 8);
  let c = mix("#f7f2ea", "#ecd8e4", smoothstep(0.3, 0.7, t));
  c = mix(c, "#cde9e4", 0.55 * smoothstep(0.55, 0.85, u));
  c = mix(c, "#ffffff", 0.35 * smoothstep(0.4, 1, n.y));
  const ao = 0.85 + 0.15 * smoothstep(-0.8, 0.4, n.y);
  return [c[0] * ao, c[1] * ao, c[2] * ao];
});
const PEARL_DARK = paint((p) => mix("#c9b8c8", "#a8cfc9", smoothstep(0.3, 0.7, noise(p, 0.06, 4))));
const GILT = metal("gilt");
const RED = paint((p, n) => {
  const g = noise(p, 0.02, 2);
  const c = mix("#8e1226", "#c22038", g * 0.6 + 0.3 * smoothstep(0.3, 1, n.y));
  return c;
});
const BLACK = "#16131a";
const LEATHER = paint((p) => mix("#4a2a1a", "#6e4228", noise(p, 0.03, 5)));
const IVORY = "#fbf7ee";
const KEYSIDE = "#d9d2c6";

const GRILLE = svg(
  `<svg viewBox="0 0 100 160">
  <rect x="2" y="2" width="96" height="156" rx="10" fill="#8a6a2a"/>
  <rect x="6" y="6" width="88" height="148" rx="8" fill="#1a1216"/>
  ${Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 5 }, (_, c) => `<circle cx="${18 + c * 16}" cy="${20 + r * 15}" r="4.2" fill="#e8c46a"/>`).join(""),
  ).join("")}
  <path d="M50 8 Q70 20 50 32 Q30 20 50 8Z" fill="#f3d98a"/>
  <path d="M50 152 Q70 140 50 128 Q30 140 50 152Z" fill="#f3d98a"/>
  <path d="M10 80 Q30 70 50 80 Q70 90 90 80" stroke="#f3d98a" stroke-width="2" fill="none"/>
  </svg>`,
  { size: 256 },
);

const INLAY = svg(
  `<svg viewBox="0 0 100 160">
  <rect width="100" height="160" fill="#f6efe6"/>
  <rect x="3" y="3" width="94" height="154" fill="none" stroke="#c9a24a" stroke-width="2.5"/>
  ${[0, 60, 120, 180, 240, 300]
    .map((a) => `<ellipse cx="50" cy="80" rx="9" ry="26" fill="#8fd0c8" stroke="#2a6a66" stroke-width="1.5" transform="rotate(${a} 50 80) translate(0 -22)"/>`)
    .join("")}
  ${[30, 90, 150, 210, 270, 330]
    .map((a) => `<ellipse cx="50" cy="80" rx="6" ry="17" fill="#f0a8c4" stroke="#a04a72" stroke-width="1.2" transform="rotate(${a} 50 80) translate(0 -14)"/>`)
    .join("")}
  <circle cx="50" cy="80" r="9" fill="#e8c46a" stroke="#7a5a1e" stroke-width="2"/>
  <path d="M10 20 Q25 10 40 20 M60 20 Q75 10 90 20 M10 140 Q25 150 40 140 M60 140 Q75 150 90 140" stroke="#2a6a66" stroke-width="2.5" fill="none"/>
  </svg>`,
  { size: 256 },
);

const BRAND = svg(
  `<svg viewBox="0 0 120 40">
  <rect width="120" height="40" rx="5" fill="#15101a" stroke="#e8c46a" stroke-width="2.5"/>
  <text x="60" y="26" text-anchor="middle" font-family="serif" font-style="italic" font-weight="bold" font-size="19" fill="#f3d98a">Fiorini</text>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "accordion" });
  const box = (sx: number, sy: number, sz: number, color: any, at: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), color, { at });
  const cyl = (r: number, h: number, seg: number, color: any, at: [number, number, number], dir: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, dir });

  const TH = 0.38, TD = 0.22, TW = 0.2, TX = 0.27; // treble
  const BH = 0.34, BD = 0.2, BW = 0.2, BX = -0.27; // bass
  const lerp = (a: number, c: number, t: number) => a + (c - a) * t;

  // Treble box
  box(TW, TH, TD, PEARL, [TX, TH / 2, 0]);
  box(TW + 0.008, 0.01, TD + 0.008, GILT, [TX, 0.005, 0]);
  box(TW + 0.008, 0.01, TD + 0.008, GILT, [TX, TH - 0.005, 0]);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      box(0.008, TH, 0.008, GILT, [TX + sx * (TW / 2), TH / 2, sz * (TD / 2)]);
      box(0.008, BH, 0.008, GILT, [BX + sx * (BW / 2), BH / 2, sz * (BD / 2 - 0.01)]);
    }
  // Bass box
  box(BW, BH, BD, PEARL, [BX, BH / 2, 0]);
  box(BW + 0.008, 0.01, BD + 0.008, GILT, [BX, 0.005, 0]);
  box(BW + 0.008, 0.01, BD + 0.008, GILT, [BX, BH - 0.005, 0]);

  // End plates
  b.part(new THREE.PlaneGeometry(0.19, 0.34), "#ffffff", { at: [TX + TW / 2 + 0.003, TH / 2, 0], dir: [1, 0, 0], axis: "z", texture: GRILLE });
  b.part(new THREE.PlaneGeometry(0.17, 0.27), "#ffffff", { at: [BX - BW / 2 - 0.003, BH / 2, 0], dir: [-1, 0, 0], axis: "z", texture: INLAY });
  box(0.004, BH - 0.03, BD - 0.03, PEARL_DARK, [BX - BW / 2 - 0.001, BH / 2, 0]);

  // Keyboard on the treble front
  const kz = TD / 2;
  box(0.16, 0.34, 0.006, GILT, [TX, TH / 2, kz + 0.002]);
  box(0.15, 0.332, 0.008, BLACK, [TX, TH / 2, kz + 0.003]);
  const N = 16, pitch = 0.0195, y0 = 0.032;
  for (let i = 0; i < N; i++) {
    const y = y0 + i * pitch + pitch / 2;
    box(0.138, pitch - 0.0018, 0.01, IVORY, [TX, y, kz + 0.008]);
    box(0.138, 0.0012, 0.002, KEYSIDE, [TX, y - pitch / 2 + 0.001, kz + 0.0135]);
  }
  for (let i = 0; i < N - 1; i++) {
    if (i % 7 === 2 || i % 7 === 6) continue;
    box(0.075, 0.011, 0.012, BLACK, [TX + 0.0315, y0 + (i + 1) * pitch, kz + 0.0145]);
  }

  // Top: register switches and brand
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 5; c++) {
      const x = TX - 0.04 + r * 0.05, z = -0.075 + c * 0.04;
      box(0.026, 0.006, 0.026, GILT, [x, TH + 0.003, z]);
      box(0.018, 0.006, 0.018, c % 2 ? PEARL : IVORY, [x, TH + 0.008, z]);
    }
  box(0.04, 0.008, 0.045, GILT, [TX + 0.065, TH + 0.004, 0.0]);
  cyl(0.012, 0.012, 8, "#b3202f", [TX + 0.065, TH + 0.012, 0.0], [0, 1, 0]);
  b.part(new THREE.PlaneGeometry(0.14, 0.047), "#ffffff", { at: [TX - 0.02, TH + 0.008, 0.045], dir: [0, 1, 0.0001], axis: "z", up: [0, 0, 1], texture: BRAND });
  // brand on bellows-facing front corner panel of treble
  b.part(new THREE.PlaneGeometry(0.09, 0.03), "#ffffff", { at: [TX - 0.0, 0.015 + 0.035, kz + 0.0045], dir: [0, 0, 1], axis: "z", texture: BRAND });

  // Bass front: button plate
  const bz = BD / 2;
  box(0.17, 0.3, 0.006, GILT, [BX, BH / 2, bz + 0.002]);
  box(0.162, 0.292, 0.008, BLACK, [BX, BH / 2, bz + 0.003]);
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 4; c++) {
      const x = BX - 0.0525 + c * 0.035, y = 0.06 + r * 0.044;
      cyl(0.0125, 0.012, 8, GILT, [x, y, bz + 0.008], [0, 0, 1]);
      const marker = (r + c) % 3 === 0;
      cyl(0.0095, 0.014, 8, marker ? BLACK : PEARL, [x, y, bz + 0.0095], [0, 0, 1]);
    }

  // Bellows
  const x0 = BX + BW / 2, x1 = TX - TW / 2;
  const steps = 18;
  const dims = (t: number) => ({ h: lerp(BH, TH, t), d: lerp(BD, TD, t) });
  box(x1 - x0, BH - 0.03, BD - 0.03, "#2a0c14", [(x0 + x1) / 2, (BH - 0.03) / 2 + 0.005, 0]);
  for (let i = 0; i < steps; i++) {
    const t = (i + 0.5) / steps;
    const x = lerp(x0, x1, t);
    const { h, d } = dims(t);
    const big = i % 2 === 0;
    const grow = big ? 0.022 : 0.004;
    const th = (x1 - x0) / steps;
    box(th * (big ? 0.9 : 0.5), h + grow * 0.5, d + grow, big ? RED : "#7a0f20", [x, (h + grow * 0.5) / 2 - 0.002, 0]);
    if (!big) box(th * 0.25, h + 0.012, d + 0.012, IVORY, [x, h / 2, 0]);
  }
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const bot = new THREE.Vector3(x0, 0.01, sz * (BD / 2 + 0.002));
      const top = new THREE.Vector3(x1, 0.01, sz * (TD / 2 + 0.002));
      b.rod(bot, top, 0.005, GILT);
      const bt = new THREE.Vector3(x0, BH - 0.01, sz * (BD / 2 + 0.002));
      const tt = new THREE.Vector3(x1, TH - 0.01, sz * (TD / 2 + 0.002));
      b.rod(bt, tt, 0.005, GILT);
      if (sx > 0) continue;
    }
  // Bellows clasp strap on front
  box(0.1, 0.03, 0.006, LEATHER, [0, 0.1, TD / 2 + 0.004]);
  box(0.016, 0.02, 0.008, GILT, [0.03, 0.1, TD / 2 + 0.01]);

  // Back straps
  const bk = -(BD / 2) - 0.004;
  box(0.12, 0.05, 0.008, LEATHER, [BX, 0.17, bk]);
  box(0.02, 0.058, 0.01, GILT, [BX + 0.04, 0.17, bk - 0.002]);
  box(0.12, 0.05, 0.008, LEATHER, [TX, 0.2, -TD / 2 - 0.004]);
  b.sweep(
    [[TX + 0.03, TH, -0.09], [0.2, 0.5, -0.12], [0, 0.57, -0.13], [-0.2, 0.5, -0.12], [BX - 0.03, BH, -0.08]],
    [0.022, 0.004],
    { color: LEATHER, section: "box", sides: 4, caps: "flat", detail: 0.8 },
  );
  for (const x of [TX + 0.03, BX - 0.03]) box(0.03, 0.012, 0.03, GILT, [x, x > 0 ? TH + 0.006 : BH + 0.006, -0.09]);

  return b.root;
}
```