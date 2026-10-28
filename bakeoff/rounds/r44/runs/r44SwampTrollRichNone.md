```ts
import * as THREE from "three";
import { createBuilder, frame, rng, offset, limb, bezier, catmull, polyline, paint, mix, smoothstep, mottle, countershade, gradient, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Swamp Troll",
  description: "Hunched Warcraft-style swamp troll with tusks, crimson mohawk and bone fetishes.",
};

const BONE = "#e8dcc0";
const LEATHER = "#5a4129";
const DARK = "#1a1410";
const RED = "#c4162a";
const ORANGE = "#ff7a2a";
const TEAL = "#2fb3a0";

const SKIN = countershade(mottle("#4f8f4c", "#3a7048", { size: 0.14, seed: 3 }), "#a9b96c", { level: -0.25 });
const LEG = gradient(SKIN, "#4a3a22", [0, 0.4, 0], [0, 0.03, 0]);
const HAIR = paint((_p, _n, s) => mix(RED, ORANGE, smoothstep(0.02, 0.28, s[1])));

const RUNE = svg(
  `<svg viewBox="0 0 64 100"><rect width="64" height="100" fill="#8a1a22"/><rect x="3" y="3" width="58" height="94" fill="none" stroke="#e8c070" stroke-width="3"/>
  <path d="M32 18 L48 38 L32 58 L16 38Z" fill="none" stroke="#e8c070" stroke-width="4"/><circle cx="32" cy="38" r="5" fill="#2fb3a0"/>
  <path d="M16 72 L32 84 L48 72 M16 82 L32 94 L48 82" fill="none" stroke="#e8c070" stroke-width="3.5"/></svg>`,
  { size: 128 },
);
const TATTOO = svg(
  `<svg viewBox="0 0 100 80"><path d="M50 8 L62 30 L88 24 L68 44 L80 70 L50 56 L20 70 L32 44 L12 24 L38 30Z" fill="none" stroke="#1d4a63" stroke-width="5" stroke-linejoin="round"/>
  <circle cx="50" cy="38" r="8" fill="#1d4a63"/><path d="M50 8 V30" stroke="#1d4a63" stroke-width="4"/></svg>`,
  { size: 192 },
);
const FEATHER = svg(
  `<svg viewBox="0 0 20 60"><path d="M10 2 Q22 20 12 58 Q10 40 10 2Z" fill="#2fb3a0" stroke="#10504a" stroke-width="1.5"/><path d="M10 2 Q2 22 9 58 Q10 40 10 2Z" fill="#c4162a" stroke="#6a0a14" stroke-width="1.5"/></svg>`,
  { size: 96 },
);

export default function build() {
  const b = createBuilder({ name: "swampTroll" });
  const rnd = rng(11);
  const hips = b.joint("hips", { at: [0, 1.12, -0.02], role: "spine" });

  // spine / neck / head
  const spinePath = catmull([[0, 1.12, -0.02], [0, 1.5, 0.06], [0, 1.85, 0.2], [0, 2.05, 0.3]]);
  const spine = b.chain("spine", spinePath, { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" });
  const chest = spine.joints[2];
  const neck = b.chain("neck", polyline([[0, 2.05, 0.3], [0, 2.18, 0.48], [0, 2.27, 0.62]]), { parent: chest, names: ["neck1", "neck2"], role: "neck" });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 2.27, 0.62], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: head.local({ forward: 0.08, down: 0.1 }), aim: head.local({ forward: 0.3, down: 0.1 }), role: "jaw" });

  const H = (f: number, u: number, x = 0) =>
    head.local({ forward: f, up: u, [x >= 0 ? "left" : "right"]: Math.abs(x) } as any);

  // torso
  const body = b.sweep(spinePath, (t) => [0.3 + 0.2 * t * t + 0.06 * Math.sin(t * 3), 0.26 + 0.1 * t], {
    bone: [hips, spine], color: SKIN, sides: 10,
  });
  b.sweep(neck, [0.2, 0.17, 0.15], { color: SKIN, sides: 8 });
  const sk = b.surface(body);

  // head
  b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, { bone: head, at: H(0.1, 0.05), scale: [0.2, 0.19, 0.22] });
  b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { bone: head, at: H(0.3, 0.0), scale: [0.15, 0.09, 0.14] });
  b.part(new THREE.BoxGeometry(0.36, 0.06, 0.14), "#3d6d44", { bone: head, at: H(0.2, 0.14) });
  b.part(new THREE.SphereGeometry(1, 8, 6), "#3d7a46", { bone: head, at: H(0.4, 0.05), scale: [0.06, 0.08, 0.1] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 6, 4), DARK, { bone: head, at: H(0.46, 0.04, s * 0.03) });
    b.part(new THREE.SphereGeometry(1, 6, 5), "#2a3a28", { bone: head, at: H(0.25, 0.1, s * 0.1), scale: [0.055, 0.045, 0.05] });
    glow(b.part(new THREE.SphereGeometry(0.032, 6, 5), "#ffd22a", { bone: head, at: H(0.28, 0.1, s * 0.1) }), 1.4);
    b.part(new THREE.SphereGeometry(0.014, 5, 4), DARK, { bone: head, at: H(0.31, 0.1, s * 0.1) });
    // ears
    b.extrude([[0, -0.05], [0.12, -0.05], [0.4, 0.15, "sharp"], [0.14, 0.08], [0, 0.07]], {
      at: H(0.0, 0.09, s * 0.17), x: [s, 0, 0], y: [0, 1, 0], thickness: 0.03, color: SKIN, bone: head,
    });
    // tusks
    b.sweep(bezier(H(0.2, -0.13, s * 0.09), H(0.33, -0.02, s * 0.14), H(0.31, 0.11, s * 0.13)), [0.035, 0], {
      bone: jaw, color: BONE, caps: { end: "point" }, sides: 6,
    });
    // brow tusk rings
    b.part(new THREE.TorusGeometry(0.04, 0.012, 5, 8), "#d6a430", { bone: head, at: H(0.0, 0.0, s * 0.19), dir: [s, 0, 0] });
  }
  // lower jaw
  b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { bone: jaw, at: H(0.2, -0.13), scale: [0.14, 0.06, 0.17] });
  b.part(new THREE.BoxGeometry(0.2, 0.02, 0.2), "#7a2a30", { bone: jaw, at: H(0.2, -0.085) });
  for (let i = 0; i < 4; i++) {
    const x = -0.075 + i * 0.05;
    b.part(new THREE.ConeGeometry(0.014, 0.04, 5), BONE, { bone: jaw, at: H(0.34, -0.07, x) });
  }
  // mohawk
  const us = [0.19, 0.22, 0.23, 0.22, 0.19, 0.14, 0.08, 0.02, -0.05];
  for (let i = 0; i < us.length; i++) {
    const h = 0.2 + 0.1 * Math.sin((i / 8) * Math.PI) + 0.04;
    b.extrude([[-0.05, 0], [0.05, 0], [0.1, h * 0.6], [0.09, h, "sharp"], [-0.04, h * 0.5]], {
      at: H(0.2 - i * 0.075, us[i]), x: [0, 0, -1], y: [0, 1, 0], thickness: 0.035, color: HAIR, bone: head, bevel: 0.006,
    });
  }

  // legs
  const footCols: any[] = [];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.24, 1.12, -0.02], [s * 0.3, 0.12, 0.05], [0.55, 0.55], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, pts, { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" });
    b.sweep(leg, [0.19, 0.15, 0.11, 0.1], { color: LEG, sides: 8 });
    const ft = leg.tip!;
    b.part(new THREE.BoxGeometry(0.22, 0.1, 0.3), LEG, { bone: ft, at: [s * 0.3, 0.07, 0.14] });
    b.part(new THREE.SphereGeometry(0.1, 7, 5), LEG, { bone: ft, at: [s * 0.3, 0.1, 0.0] });
    for (let k = -1; k <= 1; k++) {
      const a: [number, number, number] = [s * 0.3 + k * 0.07, 0.06, 0.26];
      const e: [number, number, number] = [s * 0.3 + k * 0.09, 0.05, 0.38];
      b.capsule(a, e, 0.04, LEG, { bone: ft, sides: 6 });
      b.spike(e, [0, 0, 1], 0.08, 0.03, { color: BONE, bone: ft, sides: 6 });
    }
    // knee wrap and bone bangle
    b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.08, 8), LEATHER, { bone: leg.joints[1], at: pts[1] });
    b.part(new THREE.CylinderGeometry(0.1, 0.11, 0.07, 8), LEATHER, { bone: ft, at: [s * 0.3, 0.3, 0.04] });
  }

  // arms
  const frames: any[] = [];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh: [number, number, number] = [s * 0.5, 1.95, 0.2];
    const el: [number, number, number] = [s * 0.98, 1.62, 0.25];
    const wr: [number, number, number] = [s * 1.28, 1.15, 0.35];
    const arm = b.chain(`arm${S}`, catmull([sh, el, wr]), { parent: chest, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm" });
    b.sweep(arm, [0.17, 0.14, 0.12, 0.1], { color: SKIN, sides: 8 });
    const pad = b.part(new THREE.SphereGeometry(0.2, 8, 6), LEATHER, { bone: arm.joints[0], at: [s * 0.58, 2.1, 0.2], scale: [1.1, 0.8, 1] });
    for (const h of b.surface(pad).scatter(5, { rng: rnd, minDist: 0.1, filter: (h) => h.n.y > 0.3 }))
      b.stick(new THREE.ConeGeometry(0.035, 0.14, 6), BONE, h, { embed: 0.3 });
    frames.push(frame([s * 0.7, 2.0, 0.28], [0, 1, 0]));
    b.part(new THREE.CylinderGeometry(0.11, 0.12, 0.1, 8), LEATHER, { bone: arm.joints[1], at: wr.map((v, i) => (i === 0 ? v - s * 0.15 : i === 1 ? v + 0.1 : v)) as any, dir: [s * 0.3, -1, 0.1] });
    // hand
    const wt = arm.tip!;
    b.part(new THREE.SphereGeometry(1, 7, 5), SKIN, { bone: wt, at: [s * 1.31, 1.06, 0.35], scale: [0.1, 0.13, 0.08] });
    for (let k = 0; k < 4; k++) {
      const z = 0.35 + (k - 1.5) * 0.055;
      const base: [number, number, number] = [s * 1.33, 0.97, z];
      const tip: [number, number, number] = [s * 1.37, 0.72, z + (k - 1.5) * 0.02];
      const f = b.chain(`finger${S}${k}`, polyline([base, tip]), { parent: wt, names: [`finger${S}${k}a`, `finger${S}${k}b`], role: "digit" });
      b.sweep(f, [0.035, 0.026, 0.022], { color: SKIN, sides: 6 });
      b.spike(tip, [s * 0.15, -1, 0.1], 0.07, 0.022, { color: BONE, bone: f.tip!, sides: 6 });
    }
    const th = b.chain(`thumb${S}`, polyline([[s * 1.26, 1.05, 0.42], [s * 1.2, 0.86, 0.5]]), { parent: wt, names: [`thumb${S}a`, `thumb${S}b`], role: "digit" });
    b.sweep(th, [0.04, 0.03, 0.025], { color: SKIN, sides: 6 });
  }

  // back hump and spines
  b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { bone: chest, at: [0, 2.05, -0.1], scale: [0.36, 0.3, 0.32] });
  for (let i = 0; i < 6; i++) {
    const z = -0.3 + i * 0.12;
    const h = sk.ray([0, 3, z], [0, -1, 0]);
    if (h) b.stick(new THREE.ConeGeometry(0.04, 0.16 - i * 0.012, 6), BONE, h, { embed: 0.2 });
  }

  // belt, loincloth
  const belt = sk.loop([0, 1.25, 0], { lift: 0.02 });
  b.sweep(belt, 0.04, { color: LEATHER, bone: hips, sides: 6 });
  b.along(belt, 8, (at) => {
    b.part(new THREE.CylinderGeometry(0.014, 0.02, 0.2, 6), BONE, { at: offset(at.at, [0, -1, 0], 0.12), bone: hips });
    frames.push(frame(at.at.clone(), [0, 1, 0]));
  });
  const fz = sk.ray([0, 1.2, 2], [0, 0, -1]);
  const cz = (fz ? fz.at.z : 0.3) + 0.03;
  b.extrude([[-0.18, 0], [0.18, 0], [0.15, -0.55], [0, -0.68, "sharp"], [-0.15, -0.55]], {
    at: [0, 1.3, cz], x: [1, 0, 0], thickness: 0.02, color: "#8a1a22", bone: hips,
  });
  b.part(new THREE.PlaneGeometry(0.26, 0.4), "#ffffff", { bone: hips, at: [0, 1.0, cz + 0.013], dir: [0, 0, 1], axis: "z", texture: RUNE });
  const bk = b.part(new THREE.SphereGeometry(0.06, 7, 5), BONE, { bone: hips, at: [0, 1.25, cz + 0.02], scale: [1, 1, 0.6] });
  b.part(new THREE.SphereGeometry(0.014, 5, 4), DARK, { bone: hips, at: [-0.02, 1.26, cz + 0.055] });
  b.part(new THREE.SphereGeometry(0.014, 5, 4), DARK, { bone: hips, at: [0.02, 1.26, cz + 0.055] });
  void bk;

  // chest tattoo
  const th = sk.ray([0, 1.8, 2], [0, 0, -1]);
  if (th) b.decal(body, TATTOO, { at: th, dir: [0, 0, 1], size: [0.4, 0.32] });

  // fetish necklace
  const xs = [-0.42, -0.28, -0.14, 0, 0.14, 0.28, 0.42];
  const hits = xs.map((x) => {
    const y = 1.78 + 0.22 * Math.pow(x / 0.45, 2);
    return sk.ray([x, y, 2.5], [0, 0, -1]);
  });
  const pts = hits.filter((h) => h).map((h) => offset(h!.at, h!.n, 0.03));
  if (pts.length > 3) b.sweep(catmull(pts), 0.012, { color: LEATHER, bone: chest, sides: 5 });
  hits.forEach((h, i) => {
    if (!h || i === 3) return;
    const p = offset(h.at, h.n, 0.05);
    if (i % 2) {
      b.part(new THREE.CylinderGeometry(0.018, 0.024, 0.15, 6), BONE, { at: [p.x, p.y - 0.07, p.z], bone: chest });
      b.part(new THREE.SphereGeometry(0.03, 5, 4), BONE, { at: [p.x, p.y - 0.15, p.z], bone: chest });
    } else {
      b.part(new THREE.SphereGeometry(0.045, 6, 5), BONE, { at: [p.x, p.y - 0.05, p.z], bone: chest });
      b.part(new THREE.BoxGeometry(0.04, 0.025, 0.04), BONE, { at: [p.x, p.y - 0.1, p.z + 0.005], bone: chest });
      b.part(new THREE.SphereGeometry(0.01, 4, 3), DARK, { at: [p.x - 0.015, p.y - 0.045, p.z + 0.04], bone: chest });
      b.part(new THREE.SphereGeometry(0.01, 4, 3), DARK, { at: [p.x + 0.015, p.y - 0.045, p.z + 0.04], bone: chest });
    }
    frames.push(frame([p.x, p.y - 0.08, p.z], [0, 1, 0]));
  });
  const c = hits[3];
  if (c) {
    const p = offset(c.at, c.n, 0.08);
    b.part(new THREE.SphereGeometry(0.1, 8, 6), BONE, { at: [p.x, p.y - 0.1, p.z], bone: chest, scale: [1, 1, 0.9] });
    b.part(new THREE.BoxGeometry(0.1, 0.06, 0.09), BONE, { at: [p.x, p.y - 0.19, p.z - 0.01], bone: chest });
    for (const s of [1, -1]) {
      glow(b.part(new THREE.SphereGeometry(0.026, 5, 4), TEAL, { at: [p.x + s * 0.04, p.y - 0.09, p.z + 0.08], bone: chest }), 1.2);
      b.part(new THREE.ConeGeometry(0.02, 0.1, 5), BONE, { at: [p.x + s * 0.12, p.y - 0.1, p.z], bone: chest, dir: [s, 0.6, 0] });
    }
  }
  b.cards(frames, FEATHER, { size: [0.07, 0.22], lean: 180, flow: [0, 0, 1], vary: 0.2, rng: rng(5) });

  void footCols;
  return b.root;
}
```