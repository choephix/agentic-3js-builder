import * as THREE from "three";
import { createBuilder, limb, countershade, gradient, paint, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description: "A white spirit fox with crimson markings, nine fanned tails tipped with blue spirit flames, and floating hitodama.",
};

const WHITE = "#fffaf0", CREAM = "#efe2d6", CRIM = "#d8283a", DARK = "#2a1020", GOLD = "#f2c04a";
const FLAME = "#6fe8ff", FLAME_IN = "#effeff", FLAME_V = "#a584ff";
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const EYE = svg(
  `<svg viewBox="0 0 64 40"><path d="M4 28 Q28 4 56 8 L62 2 L60 14 Q36 38 4 28Z" fill="#2a1020"/>
  <ellipse cx="32" cy="21" rx="14" ry="12" fill="#ffc83a"/><ellipse cx="32" cy="27" rx="12" ry="6" fill="#ff8a2a"/>
  <ellipse cx="32" cy="21" rx="4" ry="10" fill="#2a1020"/><circle cx="27" cy="16" r="4" fill="#fff"/><circle cx="38" cy="27" r="2" fill="#fff"/>
  <path d="M50 8 L63 0" stroke="#d8283a" stroke-width="4" stroke-linecap="round"/></svg>`,
  { size: 128 },
);
const CHEEK = svg(
  `<svg viewBox="0 0 64 48"><path d="M2 8 Q30 4 62 18" stroke="#d8283a" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M6 22 Q34 22 60 36" stroke="#d8283a" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`,
  { size: 128 },
);
const BROW = svg(
  `<svg viewBox="0 0 48 64"><path d="M24 2 L44 30 L24 62 L4 30Z" fill="#d8283a"/><path d="M24 16 L34 30 L24 46 L14 30Z" fill="#ffe3b0"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "kitsune" });
  const coat = paint((p, n) =>
    n.y > 0.55 && ((p.z * 14 + Math.abs(p.x) * 40) % 1 + 1) % 1 < 0.16 ? CRIM : countershade(WHITE, CREAM, { level: -0.2 }).at(p, n),
  );
  const legPaint = gradient(WHITE, DARK, [0, 0.24, 0], [0, 0.12, 0]);

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.58, -0.2], role: "spine" });
  const spine = b.chain("spine", [[0, 0.58, -0.2], [0, 0.6, 0.05], [0, 0.64, 0.3]], { parent: hips, role: "spine", names: ["spine1", "spine2"] });
  const neck = b.chain("neck", [[0, 0.64, 0.3], [0, 0.78, 0.42], [0, 0.9, 0.5]], { parent: spine.joints[1], role: "neck", names: ["neck1", "neck2"] });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.9, 0.5], dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.915, 0.6], aim: [0, 0.9, 0.78], role: "jaw" });

  // body
  b.sweep(spine, [0.125, 0.15, 0.135], { color: coat });
  b.sweep(neck, [0.11, 0.08, 0.075], { color: WHITE });
  b.part(new THREE.SphereGeometry(0.13, 10, 8), coat, { at: [0, 0.58, -0.25], bone: hips });

  // head
  const HC: [number, number, number] = [0, 0.96, 0.6];
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), WHITE, { at: HC, scale: [0.085, 0.075, 0.09], bone: head });
  b.capsule([0, 0.94, 0.65], [0, 0.925, 0.79], [0.055, 0.022], WHITE, { bone: head, sides: 8 });
  b.part(new THREE.SphereGeometry(0.02, 8, 6), DARK, { at: [0, 0.93, 0.815], bone: head });
  b.capsule([0, 0.905, 0.62], [0, 0.9, 0.76], [0.04, 0.018], CREAM, { bone: jaw, sides: 8 });
  for (const s of [1, -1]) {
    const base = V(s * 0.055, 1.02, 0.57), d = V(s * 0.3, 1, -0.1).normalize();
    b.part(new THREE.ConeGeometry(0.058, 0.18, 4), WHITE, { at: base.clone().addScaledVector(d, 0.09), dir: d, bone: head });
    b.part(new THREE.ConeGeometry(0.036, 0.14, 4), CRIM, { at: base.clone().addScaledVector(d, 0.08).add(V(0, 0, 0.012)), dir: d, bone: head });
    b.spike(base.clone().addScaledVector(d, 0.1), d, 0.08, 0.03, DARK, { bone: head, sides: 6 });
    b.decal(skull, EYE, { at: [s * 0.052, 0.985, 0.667], dir: [s * 0.4, 0.05, 1], size: [0.042, 0.027], mirror: s < 0 });
    b.decal(skull, CHEEK, { at: [s * 0.075, 0.945, 0.64], dir: [s, -0.1, 0.4], size: [0.055, 0.04], mirror: s < 0 });
  }
  b.decal(skull, BROW, { at: [0, 0.99, 0.683], dir: [0, 0.3, 1], size: [0.035, 0.05] });
  b.extrude([[-0.02, 0], [0.02, 0], [0.026, 0.03], [0, 0.085, "sharp"], [-0.026, 0.03]], {
    at: [0, 1.005, 0.665], x: [1, 0, 0], thickness: 0.01, color: GOLD, bone: head,
  });

  // ruff, cord and bell
  b.ring(neck.at(0.2), { count: 10, radius: 0.085, tilt: -35 }, (it) => b.spike(it, it, 0.1, 0.035, WHITE, { sides: 5 }));
  b.ring(neck.at(0.2), { count: 8, radius: 0.1, tilt: -50 }, (it) => b.spike(it, it, 0.08, 0.03, CRIM, { sides: 5 }));
  const cord = b.ring(neck.at(0.62), { count: 12, radius: 0.088 });
  b.sweep({ ...[] } as never === undefined ? [] : (cord.items as never), 0.012, { color: CRIM }) as unknown;
  b.stick(new THREE.SphereGeometry(0.03, 8, 6), GOLD, cord.items[6]);

  // legs
  const mkLeg = (tag: string, root: THREE.Vector3, target: number[], lens: number[], bends: number[][], parent: any, names: string[]) => {
    const pts = limb(root, target, lens, bends);
    const ch = b.chain(`leg${tag}`, pts, { parent, names, role: "leg" });
    b.sweep(ch, [0.055, 0.03], { color: legPaint });
    b.part(new THREE.SphereGeometry(1, 8, 6), DARK, { at: [target[0], 0.03, target[2] + 0.03], scale: [0.045, 0.03, 0.07], bone: ch.tip ?? ch.joints[ch.joints.length - 1] });
  };
  for (const s of [1, -1]) {
    const t = s > 0 ? "L" : "R";
    mkLeg(`F${t}`, V(s * 0.09, 0.55, 0.25), [s * 0.09, 0.04, 0.27], [0.27, 0.27], [[0, 0, -1]], spine.joints[1], [`shoulder${t}`, `elbow${t}`, `pawF${t}`]);
    mkLeg(`H${t}`, V(s * 0.09, 0.55, -0.22), [s * 0.09, 0.04, -0.25], [0.2, 0.2, 0.14], [[0, 0, 1], [0, 0, -1]], hips, [`hip${t}`, `knee${t}`, `hock${t}`, `pawH${t}`]);
  }

  // nine tails with spirit flames
  const P0 = V(0, 0.6, -0.36);
  for (let i = 0; i < 9; i++) {
    const th = ((i - 4) / 4) * 1.2, sx = Math.sin(th);
    const d = V(sx * 0.9, 0.35 + 0.45 * Math.cos(th), -0.55).normalize();
    const pts = [
      P0.clone(),
      P0.clone().addScaledVector(d, 0.3),
      P0.clone().addScaledVector(d, 0.58).add(V(0, 0.08, 0)),
      P0.clone().addScaledVector(d, 0.82).add(V(sx * 0.08, 0.2, -0.05)),
    ];
    const tail = b.chain(`tail${i}`, pts, { parent: hips, role: "tail", count: 3 });
    b.sweep(tail, [0.04, 0.09, 0.115, 0.09, 0.035], { bands: [[0.72, WHITE], [1, CRIM]] });
    const tip = tail.at(1);
    const up = [sx * 0.4, 1, -0.1];
    glow(b.spike(tip, up, 0.26, 0.065, FLAME, { sides: 6 }), 1.4);
    glow(b.spike(tip, up, 0.17, 0.035, FLAME_IN, { sides: 6 }), 1.6);
    glow(b.spike(tip, [sx * 1.2, 0.8, 0], 0.16, 0.03, FLAME_V, { sides: 5 }), 1.3);
    glow(b.spike(tip, [-sx * 1.2, 0.8, 0.2], 0.14, 0.028, FLAME_V, { sides: 5 }), 1.3);
  }

  // floating hitodama
  const orbs: [number, number, number][] = [[0.6, 1.0, 0.35], [-0.55, 1.2, 0.5], [0.45, 1.4, 0.0], [-0.5, 0.95, -0.1], [0.25, 1.3, 0.75], [-0.25, 1.45, 0.6]];
  orbs.forEach(([x, y, z], k) => {
    const r = 0.04 + (k % 3) * 0.008;
    glow(b.part(new THREE.SphereGeometry(r, 8, 6), FLAME, { at: [x, y, z], bone: hips }), 1.5);
    glow(b.part(new THREE.SphereGeometry(r * 0.5, 6, 4), FLAME_IN, { at: [x, y, z], bone: hips }), 1.8);
    glow(b.spike([x, y + r * 0.6, z], [0.2, 1, 0], r * 3.2, r * 0.9, k % 2 ? FLAME_V : FLAME, { bone: hips, sides: 6 }), 1.4);
  });

  return b.root;
}
