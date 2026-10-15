import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  limb,
  paint,
  noise,
  cells,
  mix,
  smoothstep,
  gradient,
  svg,
} from "../../../../src/index";
import type { Fill, JointRef } from "../../../../src/index";
import { animeEye, cel, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Red Panda on a Mossy Stone",
  description:
    "A cel-shaded, Genshin-style red panda balancing on a mossy boulder: ringed bushy tail, cream cheek ruffs, anime eyes, a glowing charm, runes, crystals and drifting motes.",
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------------------------------------------------------
// Palette
const RUST = "#e0642a";
const RUST_D = "#b4401c";
const RUST_L = "#f08a3c";
const CREAM = "#fff0d4";
const DARK = "#3c2326";
const GOLD = "#f2c14e";
const TEAL = "#3fe6cc";
const CORD = "#d8434a";
const CLAW = "#fbe9c8";

// ---------------------------------------------------------------------------------------------------------------
// Drawings
const tuftSvg = (root: string, tip: string, line: string) =>
  svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${root}"/><stop offset="1" stop-color="${tip}"/></linearGradient></defs><path d="M16 1 C25 18 31 42 23 63 L9 63 C1 42 7 18 16 1Z" fill="url(#g)" stroke="${line}" stroke-width="1.8" stroke-linejoin="round"/><path d="M16 10 C18 26 18 44 16 60" stroke="${tip}" stroke-width="1.2" fill="none" opacity="0.6"/></svg>`,
    { size: 128 },
  );

const MOSS_TEX = svg(
  `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg"><path d="M2 40 C0 24 10 14 18 22 C20 8 34 4 40 18 C48 10 62 18 62 40Z" fill="#4f9a3a" stroke="#27562a" stroke-width="2" stroke-linejoin="round"/><path d="M10 36 C10 28 16 26 20 30 M26 34 C26 20 34 14 40 24 M46 36 C46 28 52 26 56 30" stroke="#8fd05a" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>`,
  { size: 128 },
);

const GRASS_TEX = svg(
  `<svg viewBox="0 0 16 48" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#2c7430"/><stop offset="1" stop-color="#a6dc62"/></linearGradient></defs><path d="M2 48 C4 28 6 12 9 1 C11 14 14 30 14 48Z" fill="url(#g)" stroke="#1f5a26" stroke-width="1.2" stroke-linejoin="round"/></svg>`,
  { size: 128 },
);

const LEAF_TEX = svg(
  `<svg viewBox="0 0 40 56" xmlns="http://www.w3.org/2000/svg"><path d="M20 55 C2 40 2 14 20 1 C38 14 38 40 20 55Z" fill="#e9702a" stroke="#7a2e12" stroke-width="2" stroke-linejoin="round"/><path d="M20 54 L20 10 M20 40 L9 30 M20 40 L31 30 M20 26 L12 18 M20 26 L28 18" stroke="#ffcf70" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`,
  { size: 128 },
);

const RUNE_TEX = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="28" fill="none" stroke="#6ff7e0" stroke-width="3.4"/><circle cx="32" cy="32" r="22" fill="none" stroke="#2fb8a8" stroke-width="1.8" stroke-dasharray="3 4"/><path d="M32 12 L32 52 M20 24 L44 24 M23 40 Q32 30 41 40" stroke="#c9fff4" stroke-width="3.4" stroke-linecap="round" fill="none"/><circle cx="32" cy="32" r="3.5" fill="#c9fff4"/></svg>`,
  { size: 192 },
);

const SPARK_TEX = svg(
  `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 1 L19.5 12.5 L31 16 L19.5 19.5 L16 31 L12.5 19.5 L1 16 L12.5 12.5Z" fill="#fff4b0" stroke="#ffd25a" stroke-width="2" stroke-linejoin="round"/></svg>`,
  { size: 96 },
);

const petals = [0, 1, 2, 3, 4]
  .map((i) => {
    const a = (i / 5) * Math.PI * 2;
    return `<circle cx="${(16 + Math.sin(a) * 6.5).toFixed(1)}" cy="${(14 - Math.cos(a) * 6.5).toFixed(1)}" r="5.2" fill="#fff6f4" stroke="#e58aa6" stroke-width="1.2"/>`;
  })
  .join("");
const FLOWER_TEX = svg(
  `<svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg"><path d="M16 40 L16 20" stroke="#3a8a3a" stroke-width="2.6" stroke-linecap="round"/><path d="M16 32 Q10 28 7 30 Q10 34 16 33Z" fill="#4aa646"/>${petals}<circle cx="16" cy="14" r="4" fill="#ffc83c" stroke="#c88a1a" stroke-width="1"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "redPanda" });

  // Scale constants
  const HC = V(0, 0.82, 0.12); // head centre
  const h = (x: number, y: number, z: number) => V(HC.x + x, HC.y + y, HC.z + z);
  const STONE_TOP = 0.345;

  // -------------------------------------------------------------------------------------------------------------
  // Textures
  const EYE = animeEye({ iris: "#f0a23a", irisLight: "#ffe08a" });
  const TUFT_RUST = tuftSvg(RUST_D, RUST_L, "#6a2a14");
  const TUFT_GOLD = tuftSvg("#e8a460", "#ffe0a8", "#6a2a14");
  const TUFT_DARK = tuftSvg("#3a2020", "#6a4038", "#1c0e10");
  const TUFT_RED = tuftSvg("#b83038", "#ff8a7a", "#5a1418");

  // -------------------------------------------------------------------------------------------------------------
  // Paints
  const cRust = cel(RUST);
  const cCream = cel(CREAM, "#f2c9a0");
  const cDark = cel(DARK, "#241418");
  const cNose = cel("#2b1b33", INK);
  const cPink = cel("#f08a9a");
  const cGold = cel(GOLD);
  const cBark = cel("#7a5236");
  const cEarIn = cel("#6a2e22");

  const furCream = cel(paint((_p, _n, s) => mix("#f5b985", CREAM, smoothstep(0, 0.09, s[0]))));
  const furRust = cel(paint((_p, _n, s) => mix(RUST_D, RUST_L, smoothstep(0, 0.07, s[0]))));

  const bodyP = cel(
    paint((p, n) => {
      if (p.y > 0.55 && n.z > 0.5 - 0.22 * zigzag(p.x / 0.03) && Math.abs(p.x) < 0.085) return CREAM;
      if (n.y < -0.2 + 0.18 * zigzag(p.z / 0.03)) return "#4a2c2a";
      return mix(RUST, RUST_D, smoothstep(0.55, 0.0, p.y) * 0.4);
    }),
  );

  const headP = cel(
    paint((p, _n) => {
      const dx = Math.abs(p.x - HC.x);
      const dy = p.y - HC.y;
      const dz = p.z - HC.z;
      const edge = -0.012 + 0.016 * zigzag(dx / 0.022);
      if (dz > -0.03 && dy < edge && dx > 0.02) {
        const cx = 0.07 - 0.35 * Math.max(0, -dy - 0.04);
        if (dy < -0.035 && dy > -0.085 && Math.abs(dx - cx) < 0.007 && dz > 0.0) return RUST_D;
        return CREAM;
      }
      return dy > 0.03 ? mix(RUST, RUST_D, smoothstep(0.04, 0.09, dy)) : RUST;
    }),
  );

  const tailP = cel(
    paint((_p, _n, s) => {
      const t = s[0];
      if (t > 0.9) return "#4a2a24";
      const k = Math.floor(t * 9);
      return k % 2 ? "#f4b26e" : RUST;
    }),
  );

  const MOSS = "#4f9a3a";
  const MOSS_L = "#86c850";
  const stoneP = cel(
    paint((p, n) => {
      const nz = noise(p, 0.12, 3);
      const top = n.y + (nz - 0.5) * 0.9;
      if (top > 0.55) return noise(p, 0.05, 6) > 0.6 ? MOSS_L : MOSS;
      if (p.y < 0.12) return mix("#5b4a3c", "#7a8296", smoothstep(0.04, 0.12, p.y) + (nz - 0.5) * 0.5);
      const c = cells(p, 0.07, 5);
      if (c.d1 < 0.11 && c.id > 0.62) return "#c4d49a";
      return mix("#7d8aa0", "#4f5a72", noise(p, 0.15, 8));
    }),
  );
  const baseP = cel(
    paint((p, n) => (n.y > 0.6 ? mix("#5a9a3a", "#86c850", noise(p, 0.12, 2)) : "#6a4a32")),
  );
  const mossP = cel(paint((p) => mix("#3f7f33", "#79c04a", noise(p, 0.05, 4))));

  // -------------------------------------------------------------------------------------------------------------
  // Helpers
  const sph = (seg = 10, rings = 7) => new THREE.SphereGeometry(1, seg, rings);
  const ell = (
    bone: JointRef,
    col: Fill,
    at: THREE.Vector3,
    sc: [number, number, number],
    flat = false,
  ) => b.part(sph(), col, { bone, at, scale: sc, flat });

  const blade = (
    at: THREE.Vector3,
    dir: number[],
    hint: number[],
    len: number,
    wid: number,
    thick: number,
    col: Fill,
    bone: JointRef,
  ) => {
    const x = V(dir[0], dir[1], dir[2]).normalize();
    const u = V(hint[0], hint[1], hint[2]);
    const y = u.sub(x.clone().multiplyScalar(u.dot(x))).normalize();
    return b.extrude(
      [
        [0, -wid],
        [len * 0.45, -wid * 0.85],
        [len, 0, "sharp"],
        [len * 0.45, wid * 0.85],
        [0, wid],
      ],
      { at, x, y, thickness: thick, bevel: thick * 0.25, color: col, bone },
    );
  };

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton
  const root = b.joint("root", { at: [0, 0.04, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, 0.5, -0.07], dir: [0, 0.6, 0.5], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.5, -0.07],
      [0, 0.57, -0.04],
      [0, 0.65, 0],
      [0, 0.72, 0.04],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "spine4"], role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];
  const neck = b.joint("neck", { parent: chest, at: [0, 0.72, 0.04], aim: HC, role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.76, 0.09], dir: [0, 0.15, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: h(0, -0.05, 0.03), aim: h(0, -0.06, 0.15), role: "jaw" });

  // -------------------------------------------------------------------------------------------------------------
  // Torso
  const torso = b.sweep(
    spine,
    (t) => [0.1 + 0.012 * Math.sin(Math.PI * t) - 0.02 * t, 0.095 + 0.01 * Math.sin(Math.PI * t) - 0.012 * t],
    { color: bodyP },
  );
  const torsoSkin = b.surface(torso);
  ell(neck, cRust, V(0, 0.73, 0.05), [0.11, 0.06, 0.09]);

  // Chest bib blades
  for (const az of [-40, -20, 0, 20, 40]) {
    const hit = torsoSkin.around(V(0, 0.62, 0)).at(az, -32);
    if (!hit) continue;
    blade(
      hit.at.clone().addScaledVector(hit.n, -0.012),
      [az * 0.004, -1, 0.3],
      [1, 0, 0],
      0.07,
      0.022,
      0.014,
      furCream,
      spine.joints[1],
    );
  }

  // Charm cord + pendant
  const cordLoop = catmull(
    [
      [0, 0.7, -0.04],
      [0.09, 0.68, 0.04],
      [0, 0.6, 0.12],
      [-0.09, 0.68, 0.04],
    ],
    { closed: true },
  );
  b.sweep(torsoSkin.drape(cordLoop, { lift: 0.006 }), 0.007, { color: CORD });
  const pHit = torsoSkin.ray([0, 0.6, 0.6], [0, 0, -1]);
  if (pHit) {
    const P = pHit.at.clone().add(V(0, -0.01, 0.028));
    const sp = spine.joints[2];
    b.part(new THREE.TorusGeometry(0.03, 0.006, 6, 14), cGold, { bone: sp, at: P, dir: [0, 0, 1], axis: "z" });
    glow(
      b.part(new THREE.OctahedronGeometry(1), TEAL, {
        bone: sp,
        at: P,
        scale: [0.017, 0.025, 0.012],
        flat: true,
      }),
      1.4,
    );
    ell(sp, cGold, P.clone().add(V(0, -0.045, 0)), [0.011, 0.011, 0.011]);
    b.cards([frame(P.clone().add(V(0, -0.05, 0)), [0, 1, 0])], TUFT_RED, {
      size: [0.03, 0.07],
      lean: 180,
      flow: [0, 0, 1],
      bone: sp,
    });
    b.part(new THREE.SphereGeometry(0.01, 6, 4), cGold, { bone: sp, at: P.clone().add(V(0.06, 0.07, -0.03)) });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipP = V(s * 0.075, 0.5, -0.06);
    const foot = V(s * 0.085, 0.385, 0.015);
    const pts = limb(hipP, foot, [0.1, 0.1], [[0, 0, 1]]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    b.sweep(leg, [0.058, 0.042], { color: cel(gradient(RUST, DARK, pts[0], pts[1])) });
    const ankle = leg.joints[leg.joints.length - 1];
    ell(ankle, cDark, V(s * 0.085, 0.368, 0.045), [0.05, 0.032, 0.078]);
    for (const k of [-1, 0, 1]) {
      const tp = V(s * 0.085 + k * 0.027, 0.357, 0.104 - Math.abs(k) * 0.008);
      ell(ankle, cDark, tp, [0.019, 0.016, 0.02]);
      b.spike(tp.clone().add(V(0, -0.002, 0.012)), [0, -0.25, 1], 0.026, 0.007, { color: CLAW, bone: ankle });
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Arms spread for balance
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulder = V(s * 0.1, 0.66, 0.03);
    const wrist = V(s * 0.27, 0.7, 0.1);
    const pts = limb(shoulder, wrist, [0.11, 0.1], [[0, -0.6, 0.4]]);
    const arm = b.chain(`arm${side}`, pts, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    b.sweep(arm, [0.045, 0.036], { color: cel(gradient(RUST, DARK, pts[0], pts[1])) });
    const wj = arm.joints[arm.joints.length - 1];
    const d = pts[2].clone().sub(pts[1]).normalize();
    ell(wj, cDark, pts[2].clone().addScaledVector(d, 0.03), [0.05, 0.04, 0.05]);
    for (let i = 0; i < 3; i++) {
      const fd = d.clone().applyAxisAngle(V(0, 1, 0), (i - 1) * 0.5);
      fd.y -= 0.15;
      fd.normalize();
      const base = pts[2].clone().addScaledVector(d, 0.045);
      const tip = base.clone().addScaledVector(fd, 0.05);
      const fj = b.joint(`finger${side}${i + 1}`, { parent: wj, at: base, aim: tip, role: "digit" });
      b.capsule(base, tip, 0.016, cDark, { bone: fj });
      b.spike(tip, fd, 0.024, 0.007, { color: CLAW, bone: fj });
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.53, -0.12],
      [0, 0.5, -0.25],
      [0, 0.52, -0.38],
      [0, 0.63, -0.46],
      [0, 0.76, -0.45],
      [0, 0.86, -0.36],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail" },
  );
  const tailSweep = b.sweep(tail, (t) => 0.05 + 0.05 * Math.sin(Math.PI * Math.pow(t, 0.7)), { color: tailP });
  const groups: { rust: any[]; gold: any[]; dark: any[] } = { rust: [], gold: [], dark: [] };
  const angs = [0, 75, -75, 140, -140];
  for (let i = 0; i < 24; i++) {
    const t = 0.06 + (0.92 * i) / 23;
    const f = tailSweep.at(t, angs[i % 5]);
    if (t > 0.9) groups.dark.push(f);
    else if (Math.floor(t * 9) % 2) groups.gold.push(f);
    else groups.rust.push(f);
  }
  const tailOpts = { size: [0.05, 0.075] as [number, number], lean: 55, bend: 20, vary: 0.3 };
  if (groups.rust.length) b.cards(groups.rust, TUFT_RUST, { ...tailOpts, rng: rng(11) });
  if (groups.gold.length) b.cards(groups.gold, TUFT_GOLD, { ...tailOpts, rng: rng(12) });
  if (groups.dark.length) b.cards(groups.dark, TUFT_DARK, { ...tailOpts, rng: rng(13) });

  // -------------------------------------------------------------------------------------------------------------
  // Head
  const skull = b.part(sph(14, 10), headP, { bone: head, at: HC, scale: [0.125, 0.1, 0.105] });
  const skin = b.surface(skull);

  // muzzle, jaws, nose
  ell(head, cCream, h(0, -0.04, 0.09), [0.044, 0.032, 0.05]);
  ell(jaw, cCream, h(0, -0.067, 0.085), [0.036, 0.016, 0.045]);
  ell(jaw, cPink, h(0, -0.062, 0.1), [0.018, 0.006, 0.026]);
  ell(head, cNose, h(0, -0.025, 0.138), [0.022, 0.015, 0.016]);
  b.rod(h(0, -0.036, 0.142), h(0, -0.058, 0.14), 0.0028, INK, { bone: head });
  for (const s of [1, -1]) {
    b.rod(h(0, -0.058, 0.14), h(s * 0.03, -0.056, 0.124), 0.0026, INK, { bone: head });
    for (let k = 0; k < 3; k++)
      b.rod(h(s * 0.04, -0.04, 0.12), h(s * 0.15, -0.035 + (k - 1) * 0.03, 0.1), 0.0018, "#ffffff", { bone: head });
  }

  // eyes + brows
  for (const s of [1, -1]) {
    const hit = skin.around(HC).at(s * 40, 4);
    if (hit)
      b.decal(skin, EYE, {
        at: hit,
        dir: [s * 0.3, 0.05, 1],
        size: [0.07, 0.096],
        mirror: s > 0,
        bone: head,
      });
    const bh = skin.around(HC).at(s * 38, 38);
    if (bh) b.stick(sph(8, 5), CREAM, bh, { embed: 0.4, scale: [0.022, 0.008, 0.012], bone: head });
  }

  // ears
  for (const s of [1, -1]) {
    const n = V(s * 0.4, 0.25, 0.88).normalize();
    const c = h(s * 0.085, 0.075, -0.012);
    const layer = (shift: number, sc: [number, number, number], col: Fill) =>
      b.part(sph(10, 6), col, {
        bone: head,
        at: c.clone().addScaledVector(n, shift),
        dir: n,
        axis: "z",
        scale: sc,
      });
    layer(0, [0.056, 0.058, 0.02], cRust);
    layer(0.012, [0.047, 0.05, 0.012], cCream);
    layer(0.019, [0.03, 0.032, 0.008], cEarIn);
  }

  // cheek ruffs
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++) {
      const at = h(s * 0.085, -0.008 - 0.028 * i, 0);
      blade(
        at,
        [s, [0.18, -0.12, -0.45][i], [-0.1, -0.18, -0.3][i]],
        [0, 1, 0],
        [0.085, 0.095, 0.08][i],
        0.026,
        0.016,
        furCream,
        head,
      );
    }

  // crown tufts
  for (const k of [-1, 0, 1])
    blade(h(k * 0.03, 0.085, 0), [k * 0.3, 1, -0.25], [1, 0, 0], 0.065 - Math.abs(k) * 0.012, 0.02, 0.014, furRust, head);

  // -------------------------------------------------------------------------------------------------------------
  // Scenery: base, stone, moss, rune
  b.lathe(
    [
      [0, 0],
      [0.56, 0],
      [0.58, 0.025],
      [0.55, 0.05],
      [0, 0.05],
    ],
    { at: [0, 0, 0], segments: 18, bone: root, color: baseP },
  );
  const baseSkin = b.surface(b.root);
  void baseSkin;

  const stone = b.lathe(
    [
      [0, 0.04],
      [0.31, 0.04],
      [0.34, 0.12],
      [0.29, 0.23],
      [0.255, 0.33],
      [0.21, STONE_TOP],
      [0, STONE_TOP],
    ],
    { at: [0, 0, 0], segments: 9, spin: 12, bone: root, color: stoneP },
  );
  const stoneSkin = b.surface(stone);

  const ledges: [number, number, number, [number, number, number]][] = [
    [-0.3, 0.09, 0.12, [0.14, 0.09, 0.12]],
    [0.32, 0.09, -0.08, [0.13, 0.08, 0.12]],
    [-0.12, 0.08, -0.3, [0.12, 0.07, 0.1]],
  ];
  for (const [x, y, z, sc] of ledges) {
    ell(root, stoneP, V(x, y, z), sc, true);
    ell(root, mossP, V(x, y + sc[1] * 0.8, z), [sc[0] * 0.85, 0.03, sc[2] * 0.8], true);
  }
  const pebbles: [number, number, number, number][] = [
    [0.4, 0.07, 0.22, 0.065],
    [-0.38, 0.065, 0.3, 0.055],
  ];
  for (const [x, y, z, r] of pebbles) {
    ell(root, stoneP, V(x, y, z), [r, r * 0.7, r * 0.9], true);
    ell(root, mossP, V(x, y + r * 0.5, z), [r * 0.7, 0.014, r * 0.6], true);
  }

  // moss on the stone top
  const mossHits = stoneSkin.scatter(36, {
    rng: rng(21),
    minDist: 0.05,
    filter: (hh) =>
      hh.n.y > 0.85 &&
      hh.at.y > 0.3 &&
      Math.hypot(hh.at.x, hh.at.z) > 0.14 &&
      Math.hypot(Math.abs(hh.at.x) - 0.085, hh.at.z - 0.05) > 0.09,
  });
  if (mossHits.length)
    b.cards(mossHits, MOSS_TEX, { size: [0.055, 0.04], lean: 25, vary: 0.3, rng: rng(22), bone: root });

  // glowing rune on the front face
  const runeHit = stoneSkin.around(V(0, 0.2, 0)).at(0, 2);
  if (runeHit)
    glow(b.decal(stoneSkin, RUNE_TEX, { at: runeHit, dir: [0, 0, 1], size: [0.13, 0.13], bone: root }), 1.3);

  // glowing crystals
  const crystals: [number, number, number, number, number][] = [
    [-0.4, 0.15, -0.1, 0.11, 14],
    [-0.45, 0.11, -0.03, 0.075, -18],
    [-0.36, 0.1, -0.2, 0.06, 28],
  ];
  for (const [x, y, z, hh2, tilt] of crystals)
    glow(
      b.part(new THREE.OctahedronGeometry(1), "#58f0dc", {
        bone: root,
        at: V(x, y, z),
        scale: [hh2 * 0.4, hh2, hh2 * 0.4],
        rotation: [0, 20, tilt],
        flat: true,
      }),
      1.2,
    );

  // grass ring and flowers
  const baseOnly = b.surface(b.root);
  void baseOnly;
  const groundHits = (seed: number, n: number, rMin: number, rMax: number, md: number) =>
    b.surface(stone).scatter(0, { rng: rng(seed) }) && // keep the stone surface untouched
    ((): ReturnType<typeof stoneSkin.scatter> => {
      const out: ReturnType<typeof stoneSkin.scatter> = [];
      const rr = rng(seed);
      for (let i = 0; i < n; i++) {
        const a = rr() * Math.PI * 2;
        const rad = rMin + (rMax - rMin) * rr();
        const x = Math.sin(a) * rad;
        const z = Math.cos(a) * rad;
        if (out.some((o) => Math.hypot(o.at.x - x, o.at.z - z) < md)) continue;
        const hit = ground.ray([x, 1, z], [0, -1, 0]);
        if (hit) out.push(hit);
      }
      return out;
    })();
  const groundMesh = b.part(new THREE.CylinderGeometry(0.55, 0.55, 0.01, 18), "#5a9a3a", {
    bone: root,
    at: [0, 0.045, 0],
  });
  const ground = b.surface(groundMesh);
  const grassHits = groundHits(31, 70, 0.37, 0.54, 0.04);
  if (grassHits.length)
    b.cards(grassHits, GRASS_TEX, {
      size: [0.035, 0.075],
      lean: 15,
      vary: 0.35,
      spin: 180,
      rng: rng(32),
      cross: true,
      bone: root,
    });
  const flowerHits = groundHits(41, 14, 0.4, 0.52, 0.08);
  if (flowerHits.length)
    b.cards(flowerHits, FLOWER_TEX, { size: [0.055, 0.07], lean: 5, vary: 0.25, rng: rng(42), cross: true, bone: root });

  // branch with autumn leaves
  const branchPath = catmull([
    [0.36, 0.05, -0.26],
    [0.32, 0.2, -0.3],
    [0.4, 0.32, -0.3],
    [0.47, 0.42, -0.26],
  ]);
  const branch = b.sweep(branchPath, [0.03, 0.012], { bone: root, color: cBark });
  b.sweep(
    catmull([
      [0.34, 0.24, -0.3],
      [0.27, 0.3, -0.33],
      [0.2, 0.36, -0.34],
    ]),
    [0.015, 0.006],
    { bone: root, color: cBark },
  );
  const leafFrames = [0.45, 0.6, 0.75, 0.9, 1].map((t, i) => branch.at(Math.min(t, 0.98), [60, -60, 120, -120, 0][i]));
  b.cards(leafFrames, LEAF_TEX, { size: [0.06, 0.08], lean: 60, vary: 0.25, rng: rng(51), bone: root });
  b.cards(
    [frame([0.2, 0.052, 0.4], [0, 1, 0]), frame([-0.22, 0.052, 0.38], [0, 1, 0]), frame([0.1, 0.052, -0.42], [0, 1, 0])],
    LEAF_TEX,
    {
      size: 0.07,
      lean: 90,
      flow: (_f, i) => [Math.cos(i * 2.1), 0, Math.sin(i * 2.1)],
      mirror: true,
      bone: root,
    },
  );

  // floating motes
  const motes: [number, number, number][] = [
    [-0.3, 0.75, -0.2],
    [0.35, 0.9, 0.05],
    [-0.38, 0.55, 0.15],
    [0.3, 0.62, -0.3],
    [0.15, 0.95, -0.1],
    [-0.2, 0.96, 0.1],
    [0.45, 0.7, 0.2],
    [-0.1, 0.97, -0.25],
  ];
  glow(
    b.cards(
      motes.map((m) => frame(m, [0, 1, 0])),
      SPARK_TEX,
      { size: 0.045, cross: true, vary: 0.3, rng: rng(61), bone: root },
    ),
    1.3,
  );

  // slight smile: a little open jaw
  b.pose(jaw, { axis: [1, 0, 0], deg: 5 });

  return b.root;
}
