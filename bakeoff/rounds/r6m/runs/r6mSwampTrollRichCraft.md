```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  bezier,
  catmull,
  limb,
  countershade,
  mottle,
  grain,
  paint,
  noise,
  mix,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Swamp Troll",
  description:
    "A hunched, long-armed swamp troll with curved tusks, a flame-coloured mohawk and bone fetishes, standing on a mossy bog base with a totem, reeds and glowing mushrooms.",
};

// ---------------------------------------------------------------- palette
const GROUND = 0.085;
const BONE = "#e6d8b4";
const IVORY = "#f0e6c8";
const CLAW = "#cdbb8e";
const GOLD = "#d9a83a";
const DARK = "#1b1220";
const CORD = "#4b3220";
const GLOWG = "#9dffb0";
const LEATHER = grain("#6d4b2e", "#46301d", { size: 0.02, axis: "x" });
const WOOD = grain("#80562f", "#5a3a20", { size: 0.03 });
const MOSS_P = mottle("#5f8a3a", "#3f6a2c", { size: 0.05, seed: 4 });
const SKIN_BASE = countershade(mottle("#4c8f78", "#37705f", { size: 0.16, seed: 3 }), "#a0c48e", { level: -0.25 });
const SKIN = paint((p, n) => (n.y > 0.55 && noise(p, 0.12, 9) > 0.6 ? MOSS_P : SKIN_BASE));
const MUD = paint((p, n) =>
  n.y > 0.5 && noise(p, 0.3, 2) > 0.5
    ? mottle("#3f6a2c", "#587a34", { size: 0.08, seed: 8 })
    : mottle("#4b3b27", "#364a2a", { size: 0.18, seed: 5 }),
);
const ROCK = mottle("#6e7468", "#4f6b44", { size: 0.1, seed: 2 });

// cloth with a drawn zig-zag trim, read from the extrude's (x, y) metres
const CLOTH = paint((_p, _n, s) => {
  const x = s[0];
  const y = s[1];
  const zz = Math.abs((((x / 0.06) % 2) + 2) % 2 - 1);
  if (y > -0.07) return GOLD;
  if (y < -0.14 && y > -0.21 && (-y - 0.14) / 0.07 < zz) return "#2a1020";
  if (y < -0.46) return "#8c2a1e";
  return "#a8362a";
});

// ---------------------------------------------------------------- textures
const EYE = svg(
  `<svg viewBox="0 0 64 48"><path d="M2 30 Q32 -6 62 30 Q32 52 2 30Z" fill="#1a1020"/>
  <path d="M6 29 Q32 0 58 29 Q32 46 6 29Z" fill="#e9ff5a"/><ellipse cx="32" cy="27" rx="8" ry="17" fill="#ff8a1c"/>
  <ellipse cx="32" cy="27" rx="3" ry="15" fill="#1a1020"/><path d="M2 20 Q32 -10 62 20" stroke="#1a1020" stroke-width="6" fill="none"/></svg>`,
  { size: 128 },
);
const WARPAINT = svg(
  `<svg viewBox="0 0 64 64"><path d="M6 14 L58 24" stroke="#f1ece0" stroke-width="7" stroke-linecap="round"/>
  <path d="M6 30 L58 40" stroke="#f1ece0" stroke-width="7" stroke-linecap="round"/>
  <path d="M10 48 L50 54" stroke="#c8281e" stroke-width="7" stroke-linecap="round"/><circle cx="54" cy="52" r="5" fill="#c8281e"/></svg>`,
  { size: 128 },
);
const TATTOO = svg(
  `<svg viewBox="0 0 100 100" fill="none" stroke="#1c4a52" stroke-width="4.5" stroke-linecap="round">
  <circle cx="50" cy="50" r="22"/><path d="M50 28 L50 6 M50 72 L50 94 M28 50 L6 50 M72 50 L94 50 M34 34 L18 18 M66 34 L82 18 M34 66 L18 82 M66 66 L82 82"/>
  <path d="M50 50 m0 -10 a10 10 0 1 1 -10 10 a6 6 0 1 1 6 -6" stroke="#6b3a8a"/></svg>`,
  { size: 192 },
);
const TOTEMFACE = svg(
  `<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="6" fill="#9a6b3c"/>
  <path d="M8 18 L28 26 M56 18 L36 26" stroke="#2a1a10" stroke-width="5" stroke-linecap="round"/>
  <ellipse cx="20" cy="30" rx="7" ry="5" fill="#1a1020"/><ellipse cx="44" cy="30" rx="7" ry="5" fill="#1a1020"/>
  <path d="M12 46 Q32 38 52 46 L48 56 L40 48 L32 58 L24 48 L16 56Z" fill="#f0e6c8" stroke="#2a1a10" stroke-width="2"/>
  <path d="M4 8 L60 8 M4 60 L60 60" stroke="#c8281e" stroke-width="4"/></svg>`,
  { size: 128 },
);
const RUNE = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#1a1a1a" stroke="#d9a83a" stroke-width="4"/>
  <path d="M32 12 L32 52 M32 22 L46 14 M32 34 L46 26 M32 22 L18 30 M32 44 L20 52" stroke="#7dffa8" stroke-width="4" stroke-linecap="round" fill="none"/></svg>`,
  { size: 128 },
);
const REED = svg(
  `<svg viewBox="0 0 32 128"><path d="M4 128 Q8 60 16 0 Q24 60 28 128Z" fill="#5d8a3a"/><path d="M16 4 Q16 60 16 128" stroke="#8cb858" stroke-width="3" fill="none"/></svg>`,
  { size: 128 },
);
const CATTAIL = svg(
  `<svg viewBox="0 0 32 128"><path d="M15 128 L15 0" stroke="#5d8a3a" stroke-width="4"/><rect x="9" y="6" width="14" height="40" rx="7" fill="#5b3a22"/><path d="M16 4 L16 0" stroke="#3a2412" stroke-width="3"/></svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------- geometry helpers
const sph = (r: number, w = 7, h = 5) => new THREE.SphereGeometry(r, w, h);
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);

const bladePaint = (len: number) =>
  paint((_p, _n, s) => {
    const t = Math.min(Math.max(s[1] / len, 0), 1);
    return t < 0.5 ? mix("#6a1840", "#e0382a", t * 2) : mix("#e0382a", "#ffb03a", (t - 0.5) * 2);
  });

export default function build() {
  const b = createBuilder({ name: "swamp_troll" });
  const R = rng(11);

  // ------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 1.0, 0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 1.0, -0.1], [0, 1.4, 0.0], [0, 1.75, 0.2]]), {
    parent: hips,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });
  const sp2 = spine.joints[1];
  const sp3 = spine.joints[spine.joints.length - 1];
  const neck = b.chain("neck", catmull([[0, 1.75, 0.2], [0, 1.9, 0.33], [0, 2.0, 0.42]]), {
    parent: sp3,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 2.0, 0.42], aim: [0, 2.1, 0.8], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.97, 0.5], aim: [0, 1.92, 0.8], role: "jaw" });

  // ------------------------------------------------------------ body
  const bodyS = b.sweep(
    spine,
    (t) => [0.3 + 0.2 * t + 0.06 * Math.sin(Math.PI * t), 0.27 + 0.1 * Math.sin(Math.PI * Math.min(1, t * 1.3))],
    { color: SKIN },
  );
  const pelvis = b.part(sph(1, 9, 7), SKIN, { bone: hips, at: [0, 1.0, -0.02], scale: [0.34, 0.27, 0.3] });
  const hump = b.part(sph(1, 9, 7), SKIN, { bone: sp3, at: [0, 1.82, 0.08], scale: [0.42, 0.3, 0.34] });
  const neckS = b.sweep(neck, [0.2, 0.16], { color: SKIN });
  const all = b.surface([bodyS, pelvis, hump, neckS]);

  // ------------------------------------------------------------ head
  const HC = [0, 2.12, 0.5];
  const skull = b.part(sph(1, 10, 8), SKIN, { bone: head, at: HC, scale: [0.2, 0.17, 0.21] });
  b.part(box(0.36, 0.06, 0.11), SKIN, { bone: head, at: [0, 2.2, 0.63], rotation: [-14, 0, 0] });
  b.frustumBox([0, 2.04, 0.62], [0, 2.02, 0.8], [0.28, 0.16], [0.24, 0.12], { bone: head, color: SKIN });
  b.sweep(bezier([0, 2.14, 0.7], [0, 2.18, 0.82], [0, 2.06, 0.93]), [0.05, 0.025], { bone: head, color: SKIN, sides: 6 });
  for (const s of [1, -1]) b.part(sph(0.013, 5, 4), DARK, { bone: head, at: [s * 0.022, 2.07, 0.915] });
  // lower jaw
  b.frustumBox([0, 1.94, 0.55], [0, 1.93, 0.82], [0.3, 0.08], [0.27, 0.1], { bone: jaw, color: SKIN });
  b.part(box(0.22, 0.03, 0.2), "#3a1222", { bone: head, at: [0, 1.96, 0.7] });
  b.part(box(0.1, 0.03, 0.06), "#b04050", { bone: jaw, at: [0, 1.975, 0.68] });
  for (const x of [-0.08, -0.04, 0.04, 0.08]) {
    b.spike([x, 1.965, 0.8], [0, -1, 0], 0.035, 0.01, { bone: head, color: BONE });
    b.spike([x * 1.1, 1.965, 0.84], [0, 1, 0], 0.03, 0.01, { bone: jaw, color: BONE });
  }
  // eyes & war paint
  for (const s of [1, -1]) {
    glow(b.decal(skull, EYE, { at: [s * 0.08, 2.14, 0.69], dir: [0, 0, 1], size: [0.09, 0.065], bone: head }), 0.9);
    b.decal(skull, WARPAINT, { at: [s * 0.15, 2.07, 0.6], dir: [s * 0.8, 0, 0.6], size: [0.12, 0.12], mirror: s > 0, bone: head });
  }
  // tusks
  for (const s of [1, -1]) {
    const base = [s * 0.11, 1.92, 0.78];
    const ctrl = [s * 0.18, 2.0, 0.85];
    const tip = [s * 0.15, 2.22, 0.82];
    b.sweep(bezier(base, ctrl, tip), [0.045, 0.004], { bone: jaw, color: IVORY, sides: 6, caps: { start: "flat", end: "point" } });
    const pth = bezier(base, ctrl, tip);
    for (const t of [0.3, 0.5]) {
      b.part(new THREE.TorusGeometry(0.036 - t * 0.03, 0.009, 4, 8), t < 0.4 ? GOLD : "#c8281e", {
        bone: jaw,
        at: pth.at(t),
        dir: pth.tangentAt(t),
        axis: "z",
      });
    }
  }
  // ears with gold hoops
  const EAR: any = [[0, -0.05], [0.14, 0.0], [0.36, 0.3, "sharp"], [0.1, 0.1], [0, 0.08]];
  for (const s of [1, -1]) {
    b.extrude(EAR, { at: [s * 0.17, 2.16, 0.46], x: [s, 0.1, -0.3], y: [0, 1, 0], thickness: 0.03, bone: head, color: SKIN });
    b.part(new THREE.TorusGeometry(0.035, 0.008, 4, 8), GOLD, { bone: head, at: [s * 0.2, 2.11, 0.45], dir: [1, 0, 0], axis: "z" });
  }
  // feathers behind ears
  const LEAF: any = [[0, 0], [0.05, 0.12], [0.04, 0.3], [0, 0.42, "sharp"], [-0.04, 0.3], [-0.05, 0.12]];
  for (const s of [1, -1])
    b.extrude(LEAF, {
      at: [s * 0.2, 2.2, 0.4],
      x: [0, 0, 1],
      y: [s * 0.7, 1, -0.4],
      thickness: 0.012,
      smoothing: 1,
      bone: head,
      color: s > 0 ? "#2fbfa3" : "#e0702a",
    });

  // ------------------------------------------------------------ mohawk
  const top = b.surface([bodyS, hump, neckS, skull]);
  const zs = [0.7, 0.62, 0.54, 0.46, 0.38, 0.3, 0.22, 0.14, 0.06, -0.02];
  zs.forEach((z, i) => {
    const hit: any = top.ray([0, 3, z], [0, -1, 0]);
    if (!hit) return;
    const len = 0.3 - i * 0.008 + (i % 2) * 0.05;
    const w = 0.09 - i * 0.002;
    const outline: any = [[-w, 0], [w, 0], [-w - 0.05, len, "sharp"]];
    b.extrude(outline, {
      at: [hit.at.x, hit.at.y - 0.03, hit.at.z],
      thickness: [0.05, 0.012],
      bone: hit.bone ?? head,
      color: bladePaint(len),
    });
  });

  // ------------------------------------------------------------ legs
  const legs: any = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const foot = [s * 0.3, GROUND + 0.1, 0.14];
    const pts = limb([s * 0.26, 0.98, 0], foot, [0.58, 0.58], [[0, 0, 1]]);
    const leg = b.chain("leg" + side, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.3, GROUND, 0.25],
    });
    legs[side] = leg;
    b.sweep(leg, [0.2, 0.15, 0.1], { color: SKIN });
    const ankle = leg.joints[leg.joints.length - 1];
    b.part(box(0.25, 0.12, 0.34), SKIN, { bone: ankle, at: [s * 0.3, GROUND + 0.06, 0.2] });
    for (const dx of [-0.08, 0, 0.08]) {
      b.part(box(0.07, 0.07, 0.12), SKIN, { bone: ankle, at: [s * 0.3 + dx, GROUND + 0.045, 0.4] });
      b.spike([s * 0.3 + dx, GROUND + 0.04, 0.45], [0, -0.2, 1], 0.09, 0.028, { bone: ankle, color: CLAW, sides: 5 });
    }
    b.spike([s * 0.3, GROUND + 0.09, 0.02], [0, 0.3, -1], 0.1, 0.03, { bone: ankle, color: CLAW, sides: 5 });
    // leather shin wrap and gold anklet
    for (const [t, r, c] of [[0.62, 0.13, LEATHER], [0.8, 0.11, GOLD]] as any) {
      const cp = leg.at(t);
      b.part(new THREE.TorusGeometry(r, 0.022, 5, 10), c, { at: cp.at, dir: cp.tangent, axis: "z", bone: cp.bone });
    }
  }

  // ------------------------------------------------------------ arms
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hand = [s * 0.74, 0.46, 0.46];
    const pts = limb([s * 0.5, 1.72, 0.2], hand, [0.72, 0.72], [[s, 0, -0.5]]);
    const arm = b.chain("arm" + side, pts, {
      parent: sp3,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    b.sweep(arm, [0.17, 0.13, 0.12, 0.1], { color: SKIN });
    const sh = arm.joints[0];
    const wr = arm.joints[arm.joints.length - 1];
    b.part(sph(0.22, 8, 6), SKIN, { bone: sh, at: [s * 0.5, 1.72, 0.2] });
    // fist
    b.part(box(0.17, 0.15, 0.2), SKIN, { bone: wr, at: [hand[0], hand[1] - 0.06, hand[2] + 0.04] });
    [-0.05, 0, 0.05, 0.14].forEach((fx, i) => {
      const thumb = i === 3;
      const bx = hand[0] + (thumb ? -s * 0.1 : s * fx);
      const base = [bx, hand[1] - 0.1, hand[2] + (thumb ? 0.04 : 0.12)];
      const tip = [bx + (thumb ? -s * 0.03 : s * fx * 0.4), hand[1] - 0.15, hand[2] + (thumb ? 0.16 : 0.3)];
      const fj = b.joint(`${thumb ? "thumb" : "finger" + (i + 1)}${side}`, { parent: wr, at: base, aim: tip, role: "digit" });
      b.capsule(base, tip, 0.032, SKIN, { bone: fj });
      const d = V(tip).sub(V(base)).normalize();
      b.spike(tip, [d.x, d.y - 0.2, d.z], 0.09, 0.026, { bone: fj, color: CLAW, sides: 5 });
    });
    // pauldron + bone spikes
    const pc = [s * 0.54, 1.88, 0.2];
    const ax = [s * 0.4, 1, 0];
    b.lathe([[0, 0], [0.24, 0], [0.27, 0.05], [0.2, 0.14], [0.1, 0.2], [0, 0.22]] as any, {
      at: pc, axis: ax, bone: sh, color: LEATHER, smoothing: 1,
    });
    const topC = V(pc).add(V(ax).normalize().multiplyScalar(0.18));
    b.ring({ at: topC, axis: V(ax).normalize() } as any, { count: 5, radius: 0.15, tilt: 25 }, (it: any) =>
      b.spike(it, it, 0.17, 0.03, { bone: sh, color: BONE, sides: 5 }),
    );
    b.spike(topC, ax, 0.24, 0.045, { bone: sh, color: BONE, sides: 6 });
    // arm bands
    for (const [t, r, c] of [[0.22, 0.16, GOLD], [0.7, 0.13, LEATHER], [0.82, 0.12, BONE]] as any) {
      const cp = arm.at(t);
      b.part(new THREE.TorusGeometry(r, 0.024, 5, 10), c, { at: cp.at, dir: cp.tangent, axis: "z", bone: cp.bone });
    }
  }

  // ------------------------------------------------------------ warts & tattoo
  const wartSkin = b.surface([bodyS, hump]);
  for (const h of wartSkin.scatter(24, { rng: R, minDist: 0.17, filter: (x: any) => x.n.y > -0.2 }))
    b.stick(sph(0.03, 5, 4), "#6faa86", h, { embed: 0.4 });
  b.decal(bodyS, TATTOO, { at: [0, 1.3, 0.33], dir: [0, 0.1, 1], size: [0.3, 0.3], bone: sp2 });

  // ------------------------------------------------------------ fetishes
  const skullProp = (at: number[], r: number, bone: any, lit = false) => {
    b.part(sph(r, 7, 5), BONE, { bone, at, scale: [1, 0.92, 1] });
    b.part(box(r * 1.05, r * 0.45, r * 0.9), BONE, { bone, at: [at[0], at[1] - r * 0.75, at[2] + r * 0.15] });
    for (const s of [1, -1]) {
      const e = b.part(sph(r * 0.28, 5, 4), lit ? GLOWG : DARK, { bone, at: [at[0] + s * r * 0.38, at[1] + r * 0.05, at[2] + r * 0.82] });
      if (lit) glow(e, 1.4);
    }
    b.part(box(r * 0.14, r * 0.3, r * 0.1), DARK, { bone, at: [at[0], at[1] - r * 0.3, at[2] + r * 0.95] });
  };
  const boneStick = (a: number[], c: number[], bone: any, r = 0.014) => {
    b.rod(a, c, r, BONE, { bone });
    b.part(sph(r * 1.7, 5, 4), BONE, { bone, at: a });
    b.part(sph(r * 1.7, 5, 4), BONE, { bone, at: c });
  };

  // necklace of teeth with skull pendant
  const nPath = all.drape(
    catmull([[-0.3, 1.92, 0.26], [-0.22, 1.66, 0.46], [0, 1.52, 0.52], [0.22, 1.66, 0.46], [0.3, 1.92, 0.26]]),
    { lift: 0.03 },
  );
  b.sweep(nPath, 0.014, { color: CORD, bone: sp3 });
  b.along(nPath, 9, (at: any) => {
    const i = at.t < 0.5 ? Math.round(at.t * 18) : Math.round(at.t * 18);
    b.part(sph(0.026, 5, 4), i % 2 ? GOLD : BONE, { at });
    b.spike(at, [0, -1, 0], 0.075, 0.016, { color: BONE, sides: 5 });
  });
  const pend = nPath.at(0.5);
  skullProp([pend.x, pend.y - 0.1, pend.z + 0.07], 0.07, sp2, true);

  // belt, buckle and hanging fetishes
  const belt = all.loop([0, 1.12, 0], { dir: [0, 1, 0], lift: 0.03 });
  b.sweep(belt, 0.035, { color: LEATHER, bone: hips });
  glow(b.part(new THREE.CircleGeometry(0.07, 12), "#ffffff", { bone: hips, at: [0, 1.13, 0.345], dir: [0, 0, 1], axis: "z", texture: RUNE }), 0.7);
  const hang = (t: number, drop: number, fn: (p: number[]) => void) => {
    const q = belt.at(t);
    const o = V([q.x, 0, q.z]).normalize().multiplyScalar(0.05);
    const a = [q.x + o.x, q.y - 0.02, q.z + o.z];
    const e = [a[0], a[1] - drop, a[2]];
    b.rod(a, e, 0.007, CORD, { bone: hips });
    fn(e);
  };
  hang(0.11, 0.14, (e) => skullProp([e[0], e[1] - 0.05, e[2]], 0.05, hips));
  hang(0.89, 0.14, (e) => skullProp([e[0], e[1] - 0.05, e[2]], 0.05, hips));
  hang(0.19, 0.12, (e) => boneStick([e[0], e[1], e[2]], [e[0], e[1] - 0.2, e[2]], hips));
  hang(0.81, 0.12, (e) => {
    boneStick([e[0] - 0.07, e[1] - 0.05, e[2]], [e[0] + 0.07, e[1] - 0.17, e[2]], hips);
    boneStick([e[0] + 0.07, e[1] - 0.05, e[2]], [e[0] - 0.07, e[1] - 0.17, e[2]], hips);
  });
  hang(0.3, 0.1, (e) => b.part(sph(0.07, 7, 5), LEATHER, { bone: hips, at: [e[0], e[1] - 0.06, e[2]], scale: [1, 1.2, 0.8] }));
  hang(0.72, 0.1, (e) =>
    b.extrude(LEAF, { at: [e[0], e[1] + 0.1, e[2]], x: [0, 0, 1], y: [0, -1, 0], thickness: 0.01, smoothing: 1, bone: hips, color: "#2fbfa3" }),
  );

  // loincloth flaps
  const FLAP: any = [[-0.2, 0], [0.2, 0], [0.18, -0.5], [0.1, -0.58], [0, -0.5], [-0.1, -0.58], [-0.18, -0.5]];
  b.extrude(FLAP, { at: [0, 1.12, 0.31], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.03, bone: hips, color: CLOTH });
  b.extrude(FLAP, { at: [0, 1.12, -0.34], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.03, bone: hips, color: CLOTH });

  // ------------------------------------------------------------ base
  const base = b.lathe([[0, 0], [1.28, 0], [1.32, 0.03], [1.22, 0.075], [1.0, GROUND], [0, GROUND]] as any, {
    at: [0, 0, 0], bone: hips, color: MUD, segments: 20,
  });
  void base;
  // pool with lilies
  glow(b.part(new THREE.CylinderGeometry(0.32, 0.32, 0.02, 12), "#2d8f7f", { bone: hips, at: [-0.55, GROUND + 0.005, 0.85] }), 0.35);
  for (const [dx, dz, r] of [[0.1, 0.05, 0.08], [-0.12, -0.1, 0.06], [0.0, -0.17, 0.05]]) {
    b.part(new THREE.CylinderGeometry(r, r, 0.008, 8), "#4f9a3a", { bone: hips, at: [-0.55 + dx, GROUND + 0.02, 0.85 + dz] });
  }
  b.part(new THREE.ConeGeometry(0.035, 0.07, 6), "#ff7fb0", { bone: hips, at: [-0.45, GROUND + 0.055, 0.9] });
  // rocks
  [[-0.95, -0.55, 0.17], [0.55, 0.95, 0.13], [-0.4, -1.0, 0.12]].forEach(([x, z, r]) =>
    b.part(new THREE.DodecahedronGeometry(r, 0), ROCK, { bone: hips, at: [x, GROUND + r * 0.5, z], scale: [1.2, 0.8, 1], flat: true }),
  );
  // mushrooms
  [[0.5, 0.55, 0.12], [0.62, 0.7, 0.08], [-0.85, -0.2, 0.1], [0.2, -0.85, 0.09]].forEach(([x, z, h]) => {
    b.part(new THREE.CylinderGeometry(h * 0.18, h * 0.25, h, 6), "#e6dcc0", { bone: hips, at: [x, GROUND + h / 2, z] });
    glow(
      b.lathe([[0, 0], [h * 0.8, 0], [h * 0.65, h * 0.3], [0, h * 0.5]] as any, {
        at: [x, GROUND + h * 0.9, z], bone: hips, color: "#b66bff", segments: 8, smoothing: 1,
      }),
      0.9,
    );
  });
  // totem
  const TX = 0.95;
  const TZ = -0.5;
  b.rod([TX, GROUND, TZ], [TX, 1.45, TZ], [0.11, 0.09], WOOD, { bone: hips });
  b.part(box(0.36, 0.36, 0.3), WOOD, { bone: hips, at: [TX, 1.2, TZ] });
  b.part(new THREE.PlaneGeometry(0.33, 0.33), "#ffffff", { bone: hips, at: [TX, 1.2, TZ + 0.153], dir: [0, 0, 1], axis: "z", texture: TOTEMFACE });
  for (const s of [1, -1]) glow(b.part(sph(0.026, 5, 4), GLOWG, { bone: hips, at: [TX + s * 0.074, 1.235, TZ + 0.16] }), 1.3);
  skullProp([TX, 1.62, TZ], 0.12, hips, true);
  b.rod([TX - 0.4, 0.95, TZ], [TX + 0.4, 0.95, TZ], 0.028, WOOD, { bone: hips });
  for (const s of [1, -1]) {
    const ex = TX + s * 0.38;
    b.rod([ex, 0.95, TZ], [ex, 0.78, TZ], 0.006, CORD, { bone: hips });
    skullProp([ex, 0.72, TZ], 0.045, hips);
    b.extrude(LEAF, { at: [ex, 0.95, TZ + 0.03], x: [0, 0, 1], y: [0.1, -1, 0], thickness: 0.01, smoothing: 1, bone: hips, color: s > 0 ? "#2fbfa3" : "#e0702a" });
  }
  // wisps
  [[0.8, 1.9, -0.2], [-1.0, 1.5, 0.3], [0.2, 2.7, -0.7], [-0.7, 0.9, -0.9], [1.1, 0.6, 0.4]].forEach(([x, y, z]) =>
    glow(b.part(new THREE.OctahedronGeometry(0.035, 0), GLOWG, { bone: hips, at: [x, y, z] }), 1.6),
  );
  // reeds
  const reedFrames: any[] = [];
  const dirs: number[][] = [];
  for (let i = 0; i < 30; i++) {
    const a = (R() * 360 - 180) * (Math.PI / 180);
    const deg = (a * 180) / Math.PI;
    if (deg > -60 && deg < 45) continue;
    if (Math.abs(deg - 118) < 12) continue;
    const rad = 1.0 + R() * 0.22;
    const x = Math.sin(a) * rad;
    const z = Math.cos(a) * rad;
    reedFrames.push(frame([x, GROUND - 0.01, z], [0, 1, 0]));
    dirs.push([x, 0, z]);
  }
  b.cards(reedFrames, [REED, REED, CATTAIL], {
    size: [0.1, 0.9], vary: 0.35, lean: 12, bend: 20, cross: true, rng: rng(5), flow: (_f: any, i: number) => dirs[i],
  });

  return b.root;
}
```