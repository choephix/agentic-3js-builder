```ts
import * as THREE from "three";
import { createBuilder, frame, limb, rng, catmull, bezier, svg, paint, mix, noise, grain, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Elder Treant",
  description:
    "An ancient walking tree guardian: gnarled bark body, mossy shoulders with mushrooms, antler branches, leafy crown, glowing amber eyes and runes, jaw rigged to open.",
};

const BARK = "#6b4a2f", BARK_D = "#3a2517", MOSS = "#5f8f35", MOSS_D = "#3d6a2a";
const AMBER = "#ffb52e", GOLD = "#e8b84a", WOOD_L = "#a57a4a", CAP = "#c8402e", CREAM = "#efe3c2";

const barkBase = grain(BARK_D, "#8a6340", { size: 0.035, axis: "y", seed: 4 });
const BARKP = paint((p, n) => {
  if (n.y > 0.5 && noise(p, 0.25, 3) > 0.42) return mix(MOSS_D, MOSS, noise(p, 0.07, 8));
  if (p.y < 0.5) return mix(barkBase.at(p, n), "#2c1d12", 0.4);
  return barkBase;
});

const LEAF = svg(
  `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg"><path d="M20 63 C2 44 2 18 20 1 C38 18 38 44 20 63Z" fill="#79b83a" stroke="#2f5a22" stroke-width="3"/><path d="M20 60 L20 8 M20 40 L9 28 M20 30 L31 19 M20 48 L31 38" stroke="#2f5a22" stroke-width="2.5" fill="none"/></svg>`,
  { size: 128 },
);
const VINE = svg(
  `<svg viewBox="0 0 24 64" xmlns="http://www.w3.org/2000/svg"><path d="M12 0 C4 16 20 32 10 63" stroke="#4d7a2a" stroke-width="5" fill="none"/><path d="M10 20 l-7 5 l7 3z M13 38 l8 4 l-8 3z" fill="#79b83a"/></svg>`,
  { size: 128 },
);
const EYE = svg(
  `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="g"><stop offset="0" stop-color="#fff3b0"/><stop offset="1" stop-color="#ff9a1e"/></radialGradient></defs><path d="M2 24 Q32 -6 62 14 Q34 40 2 24Z" fill="url(#g)" stroke="#2a170a" stroke-width="3"/><ellipse cx="32" cy="19" rx="4" ry="10" fill="#3a1a05"/></svg>`,
  { size: 128 },
);
const RUNE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#ffc54a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="32" r="27"/><path d="M32 10 V54 M18 22 L32 34 L46 22 M20 46 L32 38 L44 46"/></g></svg>`,
  { size: 192 },
);
const RUNE2 = svg(
  `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg"><path d="M8 6 L24 6 L8 42 L24 42 M16 6 V42" stroke="#ffc54a" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "treant", paintSize: 2048 });
  const R = rng(9);

  // skeleton
  const hips = b.joint("hips", { at: [0, 1.5, 0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 1.5, 0], [0, 1.9, 0.03], [0, 2.35, 0.06], [0, 2.8, 0.05]]), {
    parent: hips, names: ["spine1", "spine2", "chest"], role: "spine",
  });
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 2.8, 0.05], aim: [0, 3.0, 0.1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 3.0, 0.1], aim: [0, 3.4, 0.15], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 3.08, 0.2], aim: [0, 3.02, 0.5], role: "jaw" });

  // torso
  const torso = b.sweep(spine, (t) => [0.62 + 0.22 * Math.sin(t * 3) * (1 - t * 0.2) - 0.1 * t, 0.5 + 0.12 * Math.sin(t * 3)], {
    color: BARKP, sides: 10, smooth: false,
  });
  const ts = b.surface(torso);
  for (const h of ts.scatter(16, { rng: R, minDist: 0.3, filter: (h) => h.at.y > 1.7 })) {
    b.stick(new THREE.IcosahedronGeometry(0.1 + R() * 0.07, 0), BARKP, h, { embed: 0.5, flat: true });
  }
  b.decal(torso, RUNE, { at: [0, 2.3, 0.6], dir: [0, 0, 1], size: [0.45, 0.45], segments: 12 });
  glow(b.decal(torso, RUNE, { at: [0, 2.3, 0.6], dir: [0, 0, 1], size: [0.4, 0.4], segments: 12, lift: 0.004 }), 1.3);
  glow(b.decal(torso, RUNE2, { at: [-0.35, 1.9, 0.55], dir: [-0.3, 0, 1], size: [0.14, 0.2] }), 1.2);
  glow(b.decal(torso, RUNE2, { at: [0.35, 1.9, 0.55], dir: [0.3, 0, 1], size: [0.14, 0.2], mirror: true }), 1.2);

  // belly girdle of roots + hip roots
  b.sweep(ts.loop([0, 1.65, 0], { lift: 0.02 }), 0.05, { color: MOSS_D, bone: spine.joints[0], sides: 6 });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const c = Math.cos(a), s = Math.sin(a);
    b.sweep(catmull([[c * 0.45, 1.75, s * 0.4], [c * 0.62, 1.4, s * 0.55], [c * 0.7, 1.15, s * 0.62]]), [0.1, 0.05], {
      color: BARKP, bone: hips, sides: 6, caps: "round",
    });
  }

  // neck, head
  b.sweep(catmull([[0, 2.7, 0.05], [0, 2.95, 0.1], [0, 3.1, 0.12]]), 0.3, { color: BARKP, bone: neck, sides: 8 });
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), BARKP, { bone: head, at: [0, 3.25, 0.12], scale: [0.4, 0.4, 0.42], flat: true });
  b.part(new THREE.BoxGeometry(0.62, 0.14, 0.3), BARKP, { bone: head, at: [0, 3.36, 0.42], rotation: [-8, 0, 0] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.28, 0.08, 0.14), BARK_D, { bone: head, at: [s * 0.16, 3.42, 0.5], rotation: [0, 0, -s * 22] });
    glow(b.decal(skull, EYE, { at: [s * 0.17, 3.3, 0.5], dir: [s * 0.15, 0, 1], size: [0.19, 0.12], mirror: s > 0, bone: head }), 1.5);
    b.part(new THREE.SphereGeometry(0.09, 7, 5), BARKP, { bone: head, at: [s * 0.27, 3.12, 0.4], flat: true });
  }
  b.spike([0, 3.28, 0.52], [0, -0.45, 1], 0.2, 0.07, { color: WOOD_L, bone: head, sides: 5 });
  // jaw
  b.part(new THREE.BoxGeometry(0.46, 0.14, 0.4), BARKP, { bone: jaw, at: [0, 3.0, 0.3] });
  b.part(new THREE.BoxGeometry(0.3, 0.1, 0.18), BARK_D, { bone: jaw, at: [0, 2.92, 0.5] });
  for (const x of [-0.14, -0.05, 0.05, 0.14]) b.spike([x, 3.06, 0.46], [0, 1, 0], 0.06, 0.025, { color: CREAM, bone: jaw, sides: 4 });
  // vine beard
  b.cards(
    [-0.2, -0.1, 0, 0.1, 0.2, -0.28, 0.28].map((x, i) => frame([x, 2.95 - Math.abs(x) * 0.1, 0.45 - Math.abs(x)], [0, 1, 0])),
    VINE, { size: [0.14, 0.5], lean: 180, flow: [0, 0, 1], bone: jaw, vary: 0.3, rng: R, cross: true },
  );

  // antlers + crown branches
  const crown = (name: string, pts: number[][], r: number, leaves: number, clump: boolean) => {
    const ch = b.chain(name, catmull(pts), { parent: head, count: 3 });
    const sw = b.sweep(ch, (t) => r * (1 - 0.75 * t) + 0.02, { color: BARKP, sides: 6, caps: "round" });
    b.cards(b.surface(sw).scatter(leaves, { rng: R, minDist: 0.1 }), LEAF, {
      size: [0.24, 0.34], lean: 55, bend: 20, vary: 0.3, rng: R, flow: [0, -0.4, 0.5], cross: true,
    });
    if (clump) {
      const e = pts[pts.length - 1];
      b.part(new THREE.IcosahedronGeometry(0.32, 1), mix(MOSS_D, MOSS, 0.5), { bone: ch.joints[2], at: [e[0], e[1] + 0.05, e[2]], flat: true });
    }
  };
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    crown(`antler${n}`, [[s * 0.25, 3.5, 0.05], [s * 0.6, 3.75, 0], [s * 0.85, 4.15, -0.05], [s * 0.8, 4.6, 0.05]], 0.09, 10, false);
    crown(`antler${n}b`, [[s * 0.45, 3.68, 0.0], [s * 0.9, 3.8, 0.1], [s * 1.25, 3.95, 0.2]], 0.06, 6, false);
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3, c = Math.cos(a), s = Math.sin(a);
    crown(`crown${i}`, [[c * 0.15, 3.55, s * 0.15 - 0.05], [c * 0.4, 3.95, s * 0.4 - 0.05], [c * 0.75, 4.35, s * 0.75 - 0.05], [c * 1.0, 4.7 + (i % 2) * 0.2, s * 1.0 - 0.05]], 0.08, 12, true);
  }

  // legs
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const pts = limb([s * 0.38, 1.5, 0], [s * 0.5, 0.22, 0.12], [0.85, 0.75], [0, 0, 1]);
    const leg = b.chain(`leg${n}`, catmull(pts), { parent: hips, names: [`hip${n}`, `knee${n}`, `ankle${n}`], role: "leg" });
    const lg = b.sweep(leg, (t) => 0.34 - 0.1 * t, { color: BARKP, sides: 8 });
    const ankle = leg.tip!;
    b.part(new THREE.BoxGeometry(0.75, 0.24, 0.9), BARKP, { bone: ankle, at: [s * 0.5, 0.12, 0.2], flat: true });
    b.part(new THREE.SphereGeometry(0.26, 7, 5), mix(MOSS_D, MOSS, 0.5), { bone: leg.joints[1], at: [s * 0.52, pts[1].y + 0.05, pts[1].z + 0.25], scale: [1, 0.7, 1], flat: true });
    for (let k = 0; k < 4; k++) {
      const x = s * 0.5 + (k - 1.5) * 0.19;
      const toe = b.chain(`toe${n}${k + 1}`, catmull([[x, 0.1, 0.5], [x * 1.05, 0.08, 0.75], [x * 1.1, 0.06, 0.95]]), {
        parent: ankle, count: 2, role: "digit",
      });
      b.sweep(toe, [0.1, 0.04], { color: BARKP, sides: 6, caps: "round" });
    }
    b.cards(b.surface(lg).scatter(10, { rng: R, minDist: 0.2, filter: (h) => h.n.y > 0 }), VINE, {
      size: [0.1, 0.3], lean: 120, flow: [0, -1, 0], rng: R, vary: 0.3,
    });
  }

  // arms
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${n}`,
      catmull([[s * 0.7, 2.7, 0], [s * 1.15, 2.0, 0.2], [s * 1.25, 1.2, 0.5]]),
      { parent: chest, names: [`shoulder${n}`, `elbow${n}`, `hand${n}`], role: "arm" },
    );
    const as = b.sweep(arm, (t) => 0.3 - 0.1 * t, { color: BARKP, sides: 8 });
    const hand = arm.tip!;
    const w = [s * 1.25, 1.2, 0.5];
    b.part(new THREE.IcosahedronGeometry(0.2, 0), BARKP, { bone: hand, at: [w[0], w[1] - 0.05, w[2]], flat: true });
    for (let k = 0; k < 4; k++) {
      const dx = (k - 1.5) * 0.11;
      const f = b.chain(`finger${n}${k + 1}`, catmull([[w[0] + dx, w[1] - 0.1, w[2]], [w[0] + dx * 1.5, w[1] - 0.35, w[2] + 0.15], [w[0] + dx * 2, w[1] - 0.58, w[2] + 0.2]]), {
        parent: hand, count: 2, role: "digit",
      });
      b.sweep(f, [0.06, 0.015], { color: BARKP, sides: 5, caps: "point" });
    }
    // shoulder moss mound, mushrooms, leaves
    const m = b.part(new THREE.SphereGeometry(0.42, 9, 6), mix(MOSS_D, MOSS, 0.5), { bone: chest, at: [s * 0.8, 2.82, -0.02], scale: [1, 0.65, 1], flat: true });
    b.cards(b.surface(m).scatter(22, { rng: R, minDist: 0.14, filter: (h) => h.n.y > 0 }), LEAF, {
      size: [0.2, 0.28], lean: 50, rng: R, vary: 0.3, flow: [s, -0.3, 0], cross: true,
    });
    for (const [mx, mz, sc] of [[0.95, 0.12, 1], [0.7, -0.15, 0.7]] as number[][]) {
      const p: [number, number, number] = [s * mx, 3.02, mz];
      b.part(new THREE.CylinderGeometry(0.035 * sc, 0.045 * sc, 0.16 * sc, 6), CREAM, { bone: chest, at: [p[0], p[1] + 0.03, p[2]] });
      b.part(new THREE.SphereGeometry(0.13 * sc, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), CAP, { bone: chest, at: [p[0], p[1] + 0.1 * sc, p[2]], flat: true });
      b.part(new THREE.SphereGeometry(0.02 * sc, 4, 3), CREAM, { bone: chest, at: [p[0] + 0.04, p[1] + 0.2 * sc, p[2]] });
    }
    // gold bracer with rune
    b.sweep(arm, 0.3 - 0.1 * 0.8 + 0.03, { from: 0.72, to: 0.8, color: GOLD, sides: 8, caps: "flat" });
    b.cards(b.surface(as).scatter(8, { rng: R, minDist: 0.25, filter: (h) => h.n.y > 0 }), VINE, {
      size: [0.1, 0.35], lean: 130, flow: [0, -1, 0], rng: R,
    });
  }

  return b.root;
}
```