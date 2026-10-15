```ts
import * as THREE from "three";
import { createBuilder, rng, limb, catmull, polyline, bezier, frame, svg } from "agentic-3js-builder";
import { cells, mottle, paint } from "agentic-3js-builder";
import { cel, INK } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Basalt Lava Golem",
  description:
    "A hulking golem of cel-shaded basalt plates and columns with glowing molten seams, a flame crest, and a rune-etched lava base. Genshin-style stylized monster.",
};

// ---------- palette ----------
const LAVA = "#ff7a1c";
const HOT = "#ffd45a";
const EMBER = "#ff4a1a";
const OBS = "#1f1a2c";
const TOOTH = "#e6d8bc";
const DEG = Math.PI / 180;

const basaltLit = mottle("#575175", "#6a6490", { size: 0.22, seed: 4 });
const BASALT = cel(basaltLit, "#2c2742");
const BASALT_DARK = cel(mottle("#3a3552", "#463f62", { size: 0.2, seed: 8 }), "#1e1a30");
const cracked = (size: number, seed: number) =>
  paint((p, n) => {
    const c = cells(p, size, seed);
    const e = c.d2 - c.d1;
    if (e < 0.035) return HOT;
    if (e < 0.075) return LAVA;
    return BASALT;
  });
const BASALT_CRACK = cracked(0.3, 3);
const BASALT_CRACK2 = cracked(0.26, 11);

// ---------- textures ----------
const eyeSvg = (flip: boolean) => {
  const x = (v: number) => (flip ? 64 - v : v);
  return svg(
    `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M${x(1)} 4 L${x(63)} 18 L${x(52)} 29 L${x(5)} 15 Z" fill="#ff8a1c" stroke="#fff3b0" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M${x(10)} 12 L${x(54)} 21 L${x(48)} 25 L${x(12)} 16 Z" fill="#fff6c8"/>
    </svg>`,
    { size: 128 },
  );
};
const EYE_R = eyeSvg(false);
const EYE_L = eyeSvg(true);

const FLAME = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="f" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#e8361a"/><stop offset="0.5" stop-color="#ff8a1c"/><stop offset="1" stop-color="#ffe27a"/>
    </linearGradient></defs>
    <path d="M16 63 C3 55 2 40 11 28 C10 36 14 38 15 32 C14 20 20 12 17 1 C26 14 30 30 29 44 C28 54 23 60 16 63Z" fill="url(#f)"/>
    <path d="M16 60 C10 54 11 46 16 38 C21 46 22 54 16 60Z" fill="#ffe9a0"/>
  </svg>`,
  { size: 128 },
);

let runeMarkup = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="96" fill="none" stroke="#ff9a2a" stroke-width="3"/>
  <circle cx="100" cy="100" r="84" fill="none" stroke="#ffd45a" stroke-width="1.6"/>
  <circle cx="100" cy="100" r="58" fill="none" stroke="#ff7a1c" stroke-width="2.4" stroke-dasharray="10 6"/>`;
for (let i = 0; i < 8; i++) {
  const a = (i / 8) * Math.PI * 2;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const pt = (r: number, o: number) => `${(100 + c * r - s * o).toFixed(1)} ${(100 + s * r + c * o).toFixed(1)}`;
  runeMarkup += `<path d="M${pt(66, 0)} L${pt(78, 5)} L${pt(72, -2)} L${pt(82, -6)} M${pt(70, -6)} L${pt(76, 0)}" fill="none" stroke="#ffcf5a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
  runeMarkup += `<path d="M${pt(24, 0)} L${pt(54, 0)}" stroke="#ff7a1c" stroke-width="1.8"/>`;
}
runeMarkup += `<path d="M100 66 L134 100 L100 134 L66 100Z" fill="none" stroke="#ffb53a" stroke-width="2.6"/></svg>`;
const RUNES = svg(runeMarkup, { size: 512 });

// ---------- module ----------
export default function build() {
  const b = createBuilder({ name: "lavaGolem" });
  const R = rng(21);

  const hips = b.joint("hips", { at: [0, 1.05, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.05, 0],
      [0, 1.45, 0.05],
      [0, 1.9, 0.1],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const spine2 = spine.joints[1];
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 2.2, 0.12], dir: [0, 0.6, 1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 2.38, 0.18], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.32, 0.12], aim: [0, 2.3, 0.6], role: "jaw" });

  const rock = (geo: THREE.BufferGeometry, color: any, bone: any, at: any, opts: any = {}) =>
    b.part(geo, color, { bone, at, flat: true, ...opts });
  const dod = () => new THREE.DodecahedronGeometry(1, 0);

  const column = (bone: any, base: number[], tilt: number, yaw: number, h: number, r: number, cap = true, color: any = BASALT) => {
    const t = tilt * DEG;
    const y = yaw * DEG;
    const d = new THREE.Vector3(Math.sin(t) * Math.sin(y), Math.cos(t), Math.sin(t) * Math.cos(y));
    const bs = new THREE.Vector3(base[0], base[1], base[2]);
    rock(new THREE.CylinderGeometry(r * 0.85, r, h, 6), color, bone, bs.clone().addScaledVector(d, h / 2), { dir: d });
    if (cap)
      glow(
        b.part(new THREE.CylinderGeometry(r * 0.7, r * 0.7, 0.04, 6), HOT, {
          bone,
          at: bs.clone().addScaledVector(d, h + 0.008),
          dir: d,
          flat: true,
        }),
        1.4,
      );
  };

  // ---------- base ----------
  rock(new THREE.CylinderGeometry(1.9, 2.0, 0.12, 12), BASALT_DARK, hips, [0, 0.06, 0]);
  glow(b.part(new THREE.CircleGeometry(1.55, 28), "#ffffff", { bone: hips, at: [0, 0.127, 0], dir: [0, 1, 0], axis: "z", texture: RUNES }), 1.2);
  glow(b.part(new THREE.TorusGeometry(1.76, 0.045, 4, 28), EMBER, { bone: hips, at: [0, 0.125, 0], rotation: [90, 0, 0], flat: true }), 1.3);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.2;
    const rr = 1.88 + R() * 0.06;
    column(hips, [Math.sin(a) * rr, 0.0, Math.cos(a) * rr], R() * 8, (a / DEG) + 180, 0.2 + R() * 0.4, 0.15 + R() * 0.07, R() < 0.5, BASALT_DARK);
  }
  for (let i = 0; i < 6; i++) {
    const a = R() * Math.PI * 2;
    rock(dod(), BASALT_DARK, hips, [Math.sin(a) * 1.5, 0.13, Math.cos(a) * 1.5], { scale: [0.1 + R() * 0.08, 0.07, 0.1], rotation: [R() * 60, R() * 360, 0] });
  }
  for (let i = 0; i < 16; i++) {
    const a = R() * Math.PI * 2;
    const rr = 0.9 + R() * 1.1;
    glow(
      b.part(new THREE.OctahedronGeometry(0.025 + R() * 0.02, 0), i % 3 ? LAVA : HOT, {
        bone: hips,
        at: [Math.sin(a) * rr, 0.9 + R() * 2.4, Math.cos(a) * rr],
        flat: true,
        rotation: [R() * 90, R() * 90, 0],
      }),
      1.6,
    );
  }

  // ---------- torso ----------
  const pelvis = rock(dod(), BASALT_CRACK, hips, [0, 1.08, 0], { scale: [0.6, 0.38, 0.5] });
  const belly = rock(dod(), BASALT_CRACK2, spine2, [0, 1.45, 0.05], { scale: [0.66, 0.5, 0.52], rotation: [0, 18, 0] });
  const chestP = rock(dod(), BASALT, chest, [0, 1.9, 0.1], { scale: [0.9, 0.68, 0.68] });
  // chest plates: stacked ribs of basalt
  for (const s of [1, -1]) {
    rock(new THREE.BoxGeometry(0.5, 0.2, 0.18), BASALT, chest, [s * 0.38, 2.1, 0.58], { rotation: [-18, s * 22, s * -12] });
    rock(new THREE.BoxGeometry(0.42, 0.16, 0.16), BASALT, chest, [s * 0.34, 1.72, 0.58], { rotation: [14, s * 20, s * 10] });
  }
  // molten core
  glow(rock(new THREE.IcosahedronGeometry(0.2, 0), HOT, chest, [0, 1.9, 0.7]), 1.8);
  glow(rock(new THREE.IcosahedronGeometry(0.3, 0), LAVA, chest, [0, 1.9, 0.68], { scale: [1, 1.1, 0.5] }), 1.0);
  b.ring(frame([0, 1.9, 0.68], [0, 0, 1]), { count: 8, radius: 0.3 }, (item) =>
    b.stick(new THREE.ConeGeometry(0.06, 0.2, 5), OBS, item, { embed: 0.15, bone: chest }),
  );

  // molten seams draped on the torso
  const skin = b.surface([pelvis, belly, chestP]);
  const seam = (pts: number[][], r = 0.02) =>
    glow(b.sweep(skin.drape(polyline(pts), { lift: 0.012 }), r, { color: LAVA, sides: 5, caps: "flat" }), 1.4);
  for (const s of [1, -1]) {
    seam([[s * 0.1, 1.7, 0.72], [s * 0.28, 1.45, 0.6], [s * 0.18, 1.2, 0.5], [s * 0.3, 1.0, 0.4]]);
    seam([[s * 0.3, 2.0, 0.7], [s * 0.62, 2.15, 0.45], [s * 0.82, 2.2, 0.2]]);
    seam([[s * 0.3, 1.8, 0.7], [s * 0.7, 1.7, 0.4], [s * 0.85, 1.55, 0.1]], 0.017);
  }
  seam([[0, 2.3, -0.5], [0, 1.9, -0.65], [0, 1.4, -0.5], [0, 1.0, -0.4]], 0.025);

  // back columns
  const backCols: number[][] = [
    [-0.5, 2.05, -0.4, 28, 200, 0.85],
    [0.5, 2.05, -0.4, 28, 160, 0.85],
    [0, 2.25, -0.45, 18, 180, 1.05],
    [-0.28, 1.65, -0.5, 40, 190, 0.65],
    [0.28, 1.65, -0.5, 40, 170, 0.65],
    [0, 1.35, -0.45, 50, 180, 0.5],
  ];
  for (const [x, y, z, t, yw, h] of backCols) column(chest, [x, y, z], t, yw, h, 0.12);

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.32, 1.05, 0], [s * 0.4, 0.32, 0.1], [0.5, 0.5], [[0, 0, 1]]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.4, 0.12, 0.2],
    });
    b.sweep(leg, [0.27, 0.22], { color: BASALT_CRACK2, sides: 8 });
    const knee = leg.joints[1];
    const ankle = leg.joints[2];
    rock(dod(), BASALT, knee, [pts[1].x, pts[1].y, pts[1].z + 0.17], { scale: [0.22, 0.2, 0.2] });
    column(knee, [pts[1].x, pts[1].y + 0.05, pts[1].z - 0.12], 80, 180, 0.35, 0.07, true);
    const calf = leg.at(0.78);
    glow(b.part(new THREE.TorusGeometry(0.235, 0.03, 4, 10), EMBER, { bone: calf.bone, at: calf.at, dir: calf.tangent, axis: "z", flat: true }), 1.3);
    // foot
    rock(new THREE.BoxGeometry(0.52, 0.22, 0.72), BASALT, ankle, [s * 0.4, 0.23, 0.2]);
    for (let i = -1; i <= 1; i++) {
      rock(new THREE.BoxGeometry(0.15, 0.14, 0.2), BASALT_DARK, ankle, [s * 0.4 + i * 0.17, 0.2, 0.6], { rotation: [-10, 0, 0] });
      glow(b.part(new THREE.BoxGeometry(0.06, 0.02, 0.08), LAVA, { bone: ankle, at: [s * 0.4 + i * 0.17, 0.285, 0.62], flat: true }), 1.3);
    }
  }

  // ---------- arms ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${side}`,
      catmull([
        [s * 0.85, 2.05, 0.05],
        [s * 1.12, 1.4, 0.15],
        [s * 1.15, 0.78, 0.45],
      ]),
      { parent: chest, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm" },
    );
    b.sweep(arm, [0.25, 0.3, 0.28, 0.32], { color: BASALT_CRACK, sides: 8 });
    const [sh, el, wr] = arm.joints;
    // pauldron with lava rim
    rock(dod(), BASALT, sh, [s * 0.92, 2.25, 0.05], { scale: [0.52, 0.4, 0.52] });
    glow(b.part(new THREE.TorusGeometry(0.4, 0.03, 4, 10), LAVA, { bone: sh, at: [s * 0.92, 2.12, 0.05], rotation: [90, 0, s * 8], flat: true }), 1.3);
    column(sh, [s * 0.95, 2.4, 0.0], 22, s > 0 ? 90 : 270, 0.55, 0.1, true);
    column(sh, [s * 0.8, 2.42, 0.2], 10, 0, 0.35, 0.08, true);
    // arm bands
    for (const t of [0.22, 0.7]) {
      const q = arm.at(t);
      glow(b.part(new THREE.TorusGeometry(t < 0.5 ? 0.31 : 0.34, 0.035, 4, 10), EMBER, { bone: q.bone, at: q.at, dir: q.tangent, axis: "z", flat: true }), 1.3);
    }
    // elbow spike columns
    column(el, [s * 1.2, 1.45, -0.1], 75, s > 0 ? 120 : 240, 0.5, 0.09, true);
    // fist
    rock(new THREE.BoxGeometry(0.5, 0.42, 0.46), BASALT_CRACK, wr, [s * 1.15, 0.62, 0.5], { rotation: [6, 0, 0] });
    for (let i = -1; i <= 1; i++) rock(dod(), BASALT, wr, [s * 1.15 + i * 0.15, 0.84, 0.62], { scale: 0.09 });
    // fingers
    [-0.17, -0.06, 0.06, 0.17].forEach((o, i) => {
      const x = s * 1.15 + o;
      const f = b.chain(
        `finger${i}${side}`,
        polyline([[x, 0.45, 0.58], [x, 0.32, 0.7], [x, 0.2, 0.72]]),
        { parent: wr, names: [`finger${i}${side}a`, `finger${i}${side}b`, `finger${i}${side}c`], role: "digit" },
      );
      b.sweep(f, [0.065, 0.05], { color: BASALT_DARK, sides: 6 });
    });
  }

  // ---------- head ----------
  rock(new THREE.BoxGeometry(0.76, 0.46, 0.62), BASALT, head, [0, 2.6, 0.33], { rotation: [4, 0, 0] });
  rock(new THREE.BoxGeometry(0.62, 0.2, 0.5), BASALT_DARK, head, [0, 2.48, 0.38]);
  rock(new THREE.BoxGeometry(0.86, 0.12, 0.2), BASALT, head, [0, 2.78, 0.5], { rotation: [14, 0, 0] });
  for (const s of [1, -1]) {
    rock(new THREE.BoxGeometry(0.34, 0.1, 0.18), BASALT, head, [s * 0.22, 2.7, 0.62], { rotation: [-6, 0, s * -22] });
    rock(dod(), BASALT, head, [s * 0.4, 2.55, 0.28], { scale: [0.1, 0.18, 0.2] });
    b.part(new THREE.PlaneGeometry(0.24, 0.12), "#ffffff", {
      bone: head,
      at: [s * 0.2, 2.6, 0.646],
      dir: [0, 0, 1],
      axis: "z",
      texture: s > 0 ? EYE_L : EYE_R,
    });
    glow(
      b.part(new THREE.PlaneGeometry(0.24, 0.12), "#ffffff", { bone: head, at: [s * 0.2, 2.6, 0.648], dir: [0, 0, 1], axis: "z", texture: s > 0 ? EYE_L : EYE_R }),
      1.6,
    );
    // horns
    const base = [s * 0.3, 2.78, 0.22];
    b.sweep(bezier(base, [s * 0.55, 2.95, 0.1], [s * 0.6, 3.25, 0.0]), [0.09, 0.0], {
      bone: head,
      color: OBS,
      sides: 6,
      caps: { start: "flat", end: "point" },
    });
    glow(b.sweep(bezier([s * 0.4, 2.86, 0.18], [s * 0.55, 2.98, 0.1], [s * 0.58, 3.1, 0.04]), [0.025, 0.0], { bone: head, color: LAVA, sides: 4, caps: "point" }), 1.3);
  }
  // flame crest
  glow(
    b.cards(
      [-3, -2, -1, 0, 1, 2, 3].map((i) => frame([i * 0.09, 2.82, 0.1 - Math.abs(i) * 0.03], [0, 1, 0])),
      FLAME,
      { size: [0.24, 0.5], lean: -10, flow: [0, 0, 1], bend: 20, vary: 0.35, rng: R, cross: true, bone: head },
    ),
    1.5,
  );

  // mouth
  glow(b.part(new THREE.BoxGeometry(0.5, 0.05, 0.4), LAVA, { bone: jaw, at: [0, 2.33, 0.4], flat: true }), 1.5);
  rock(new THREE.BoxGeometry(0.6, 0.14, 0.5), BASALT_DARK, jaw, [0, 2.24, 0.38]);
  rock(new THREE.BoxGeometry(0.4, 0.16, 0.14), BASALT, jaw, [0, 2.2, 0.66], { rotation: [-10, 0, 0] });
  for (let i = -2; i <= 2; i++) {
    b.spike([i * 0.11, 2.3, 0.6], [0, 1, 0], 0.1, 0.032, { bone: jaw, color: TOOTH, sides: 4 });
    b.spike([i * 0.11, 2.37, 0.62], [0, -1, 0], 0.08, 0.03, { bone: head, color: TOOTH, sides: 4 });
  }

  b.pose(jaw, { axis: [1, 0, 0], deg: 6 });

  return b.root;
}
```