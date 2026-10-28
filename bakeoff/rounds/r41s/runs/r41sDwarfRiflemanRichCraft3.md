```ts
import * as THREE from "three";
import { createBuilder, catmull, polyline, limb, paint, mottle, stripes, grain, countershade, mix, noise, smoothstep, svg } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Dwarf Rifleman",
  description: "Chunky Warcraft-style dwarf rifleman with a braided beard, plate pauldrons, bedroll pack and a flared brass blunderbuss.",
};

const SKIN = mottle("#e3a47c", "#d08a64", { size: 0.05, seed: 3 });
const HAIR = grain("#c9651f", "#8f3c10", { size: 0.02, axis: "y", seed: 2 });
const HAIR_LT = "#e68a2e";
const STEEL = metal("steel", { tarnish: 0.15 });
const BRASS = metal("brass");
const GILT = metal("gilt");
const IRON = metal("iron");
const LEATHER = paint((p, n) => {
  const c = mix("#6a3f22", "#8a5630", noise(p, 0.05, 4));
  const k = 0.85 + 0.15 * smoothstep(-0.5, 0.8, n.y);
  return [c[0] * k, c[1] * k, c[2] * k];
});
const BOOT = paint((p, n) => {
  const c = mix("#3b2414", "#5a3a20", noise(p, 0.04, 6));
  const k = p.y < 0.03 ? 0.6 : 1;
  return [c[0] * k, c[1] * k, c[2] * k * (n.y > 2 ? 1 : 1)];
});
const WOOD = grain("#7a4a24", "#4e2c12", { size: 0.018, axis: "z", seed: 8 });
const CLOTH = stripes(stripes("#4a5a3a", "#2e3a24", { size: 0.07, axis: "y", width: 0.25, seed: 1 }), "#7a3a2a", { size: 0.07, axis: "x", width: 0.18, seed: 2 });
const SLEEVE = countershade("#2f4f8f", "#223a6a", { level: -0.2 });
const CANVAS = grain("#cdb88a", "#a8946a", { size: 0.02, axis: "x", seed: 5 });
const DARK = "#14100c";
const WHITE = "#f4efe6";
const RED = "#c62d28";

const EMBLEM = svg(
  `<svg viewBox="0 0 64 80"><path d="M4 4 H60 V46 Q60 70 32 78 Q4 70 4 46Z" fill="#c9a23a"/>
  <path d="M8 8 H56 V46 Q56 66 32 73 Q8 66 8 46Z" fill="#1f3f86"/>
  <g stroke="#6b4a22" stroke-width="4" stroke-linecap="round"><path d="M18 20 L46 52"/><path d="M46 20 L18 52"/></g>
  <rect x="10" y="14" width="16" height="9" rx="2" transform="rotate(40 18 18)" fill="#9aa4b4" stroke="#222" stroke-width="1.5"/>
  <rect x="38" y="14" width="16" height="9" rx="2" transform="rotate(-40 46 18)" fill="#9aa4b4" stroke="#222" stroke-width="1.5"/>
  <circle cx="32" cy="36" r="7" fill="#f2cf5a" stroke="#6b4a22" stroke-width="2"/><path d="M32 28 L34 34 L40 36 L34 38 L32 44 L30 38 L24 36 L30 34Z" fill="#c62d28"/></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "dwarf_rifleman" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.62, 0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.66, 0], [0, 0.85, 0.02], [0, 1.02, 0.03]]), { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" });
  const chest = spine.tip!;
  const neck = b.chain("neck", catmull([[0, 1.02, 0.03], [0, 1.1, 0.05]]), { parent: chest, names: ["neck", "head"], role: "neck" });
  const head = neck.tip!;
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.15, 0.08], aim: [0, 1.13, 0.2], role: "jaw" });

  // ---------- torso ----------
  const torso = b.loft(
    [
      { at: [0, 0.6, 0.0], w: 0.42, h: 0.28 },
      { at: [0, 0.78, 0.02], w: 0.5, h: 0.32 },
      { at: [0, 1.0, 0.03], w: 0.6, h: 0.34 },
      { at: [0, 1.1, 0.04], w: 0.42, h: 0.26 },
    ],
    { bone: [hips, ...spine.joints] as any, color: LEATHER },
  );
  b.decal(torso, EMBLEM, { at: [0, 0.9, 0.3], dir: [0, 0, 1], size: [0.2, 0.25], bone: chest });
  // belt
  const belt = catmull([[0.25, 0.7, 0.0], [0, 0.7, 0.17], [-0.25, 0.7, 0.0], [0, 0.7, -0.15]], { closed: true });
  b.sweep(belt, 0.028, { bone: hips, color: BOOT });
  b.part(new THREE.BoxGeometry(0.09, 0.08, 0.02), GILT, { bone: hips, at: [0, 0.7, 0.185] });
  b.part(new THREE.BoxGeometry(0.05, 0.045, 0.025), BOOT, { bone: hips, at: [0, 0.7, 0.19] });
  // bandolier with cartridges
  b.rod([0.2, 1.08, 0.15], [-0.22, 0.74, 0.16], 0.022, { bone: chest, color: BOOT });
  for (let i = 0; i < 6; i++) {
    const t = (i + 0.5) / 6;
    const at = V(0.2 + (-0.42) * t, 1.08 - 0.34 * t, 0.2);
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.06, 6), BRASS, { bone: chest, at });
    b.part(new THREE.SphereGeometry(0.014, 5, 4), "#444", { bone: chest, at: at.clone().add(V(0, 0.03, 0)) });
  }
  // gorget + collar
  b.part(new THREE.TorusGeometry(0.13, 0.035, 5, 10), STEEL, { bone: chest, at: [0, 1.1, 0.04], rotation: [90, 0, 0] });
  // hip pouches + powder horn
  b.part(new THREE.BoxGeometry(0.1, 0.12, 0.07), LEATHER, { bone: hips, at: [0.26, 0.62, 0.05] });
  b.part(new THREE.BoxGeometry(0.104, 0.03, 0.074), GILT, { bone: hips, at: [0.26, 0.67, 0.05] });
  b.sweep(catmull([[-0.25, 0.62, 0.06], [-0.28, 0.5, 0.1], [-0.25, 0.42, 0.17]]), [0.04, 0.012], { bone: hips, color: "#d9c9a0", caps: { end: "point" } });
  b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.02, 7), BRASS, { bone: hips, at: [-0.25, 0.62, 0.06], dir: [0.1, 1, 0.1] });
  // backpack + bedroll
  b.part(new THREE.BoxGeometry(0.34, 0.3, 0.16), LEATHER, { bone: chest, at: [0, 0.88, -0.2] });
  b.part(new THREE.BoxGeometry(0.36, 0.04, 0.18), GILT, { bone: chest, at: [0, 1.0, -0.2] });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.46, 8), CANVAS, { bone: chest, at: [0, 1.08, -0.24], dir: [1, 0, 0] });
  for (const x of [-0.12, 0.12]) b.part(new THREE.CylinderGeometry(0.074, 0.074, 0.03, 8), BOOT, { bone: chest, at: [x, 1.08, -0.24], dir: [1, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 8), STEEL, { bone: chest, at: [0.1, 0.78, -0.3], dir: [0, 0, 1] });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hip = V(s * 0.11, 0.6, 0);
    const foot = V(s * 0.13, 0.1, 0.02);
    const pts = limb(hip, foot, [0.26, 0.26], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, catmull(pts), { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" });
    b.sweep(leg, [0.105, 0.075], { color: CLOTH });
    const ankle = leg.tip!;
    const knee = leg.joints[1];
    b.part(new THREE.SphereGeometry(0.065, 6, 5), STEEL, { bone: knee, at: knee.local({ forward: 0.07 }), scale: [1, 1, 0.8] });
    b.part(new THREE.CylinderGeometry(0.1, 0.108, 0.1, 8), BOOT, { bone: ankle, at: [s * 0.13, 0.16, 0.02] });
    b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.025, 8), BRASS, { bone: ankle, at: [s * 0.13, 0.215, 0.02] });
    b.part(new THREE.BoxGeometry(0.16, 0.11, 0.28), BOOT, { bone: ankle, at: [s * 0.13, 0.065, 0.07] });
    b.part(new THREE.BoxGeometry(0.17, 0.03, 0.3), "#24150b", { bone: ankle, at: [s * 0.13, 0.015, 0.07] });
    b.part(new THREE.SphereGeometry(0.08, 6, 4), BOOT, { bone: ankle, at: [s * 0.13, 0.07, 0.2], scale: [1, 0.8, 0.9] });
    b.part(new THREE.BoxGeometry(0.1, 0.02, 0.03), BRASS, { bone: ankle, at: [s * 0.13, 0.13, 0.15] });
  }

  // ---------- arms ----------
  const hands: Record<string, any> = {};
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh = V(s * 0.3, 0.98, 0), el = V(s * 0.42, 0.78, 0.04), wr = V(s * 0.5, 0.6, 0.1);
    const arm = b.chain(`arm${S}`, catmull([sh, el, wr]), { parent: chest, names: [`shoulder${S}`, `elbow${S}`, `hand${S}`], role: "arm" });
    b.sweep(arm, [0.085, 0.065], { color: SLEEVE });
    const hand = arm.tip!;
    hands[S] = hand;
    b.part(new THREE.CylinderGeometry(0.07, 0.075, 0.07, 7), LEATHER, { bone: arm.joints[1], at: [s * 0.485, 0.65, 0.09], dir: [s * 0.3, -1, 0.5] });
    b.part(new THREE.SphereGeometry(0.06, 6, 5), STEEL, { bone: arm.joints[1], at: [s * 0.42, 0.78, 0.04] });
    // pauldron
    const pc = V(s * 0.34, 1.03, 0);
    b.part(new THREE.SphereGeometry(0.16, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, { bone: arm.joints[0], at: pc, scale: [1.05, 0.8, 1], dir: [s * 0.5, 1, 0] });
    b.part(new THREE.TorusGeometry(0.15, 0.015, 4, 10), GILT, { bone: arm.joints[0], at: pc.clone().add(V(s * 0.03, -0.01, 0)), rotation: [90, 0, s * 20] });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.014, 5, 4), GILT, { bone: arm.joints[0], at: pc.clone().add(V(Math.cos(a) * 0.1 + s * 0.02, 0.07, Math.sin(a) * 0.1)) });
    }
    b.part(new THREE.ConeGeometry(0.025, 0.07, 5), GILT, { bone: arm.joints[0], at: pc.clone().add(V(s * 0.05, 0.13, 0)), dir: [s * 0.3, 1, 0] });
    // hand
    b.part(new THREE.BoxGeometry(0.08, 0.09, 0.07), LEATHER, { bone: hand, at: wr.clone().add(V(0, -0.04, 0)) });
    b.part(new THREE.CapsuleGeometry(0.018, 0.05, 3, 5), LEATHER, { bone: hand, at: wr.clone().add(V(-s * 0.05, -0.03, 0.03)), dir: [-s * 0.5, -1, 0.5] });
    for (let i = 0; i < 4; i++) {
      const x = wr.x + s * (0.03 - i * 0.02);
      if (s > 0) b.part(new THREE.CapsuleGeometry(0.014, 0.05, 3, 5), SKIN, { bone: hand, at: [x, wr.y - 0.1, wr.z + 0.01] });
      else b.part(new THREE.SphereGeometry(0.022, 5, 4), SKIN, { bone: hand, at: [x, wr.y - 0.035, wr.z + 0.045] });
    }
  }

  // ---------- blunderbuss (right hand) ----------
  const g = V(0, -0.1, 1).normalize();
  const hr = V(-0.5, 0.58, 0.12);
  const gp = (o: number) => hr.clone().addScaledVector(g, o);
  const hb = hands.R;
  b.part(new THREE.BoxGeometry(0.07, 0.11, 0.36), WOOD, { bone: hb, at: gp(-0.2), dir: g, axis: "z" });
  b.part(new THREE.BoxGeometry(0.08, 0.13, 0.02), GILT, { bone: hb, at: gp(-0.38), dir: g, axis: "z" });
  b.part(new THREE.BoxGeometry(0.075, 0.06, 0.12), BRASS, { bone: hb, at: gp(0.02).add(V(0, 0.045, 0)), dir: g, axis: "z" });
  b.part(new THREE.BoxGeometry(0.03, 0.06, 0.03), IRON, { bone: hb, at: gp(-0.06).add(V(0, 0.1, 0)), dir: g, axis: "z", rotation: [-30, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.033, 0.038, 0.5, 8), IRON, { bone: hb, at: gp(0.3), dir: g });
  for (const o of [0.12, 0.26, 0.4]) b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.025, 8), BRASS, { bone: hb, at: gp(o), dir: g });
  b.part(new THREE.CylinderGeometry(0.095, 0.04, 0.2, 8), BRASS, { bone: hb, at: gp(0.64), dir: g });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 8), GILT, { bone: hb, at: gp(0.75), dir: g });
  b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.01, 8), DARK, { bone: hb, at: gp(0.755), dir: g });
  b.part(new THREE.TorusGeometry(0.04, 0.008, 4, 8, Math.PI), IRON, { bone: hb, at: gp(-0.03).add(V(0, -0.07, 0)), dir: g, axis: "z", rotation: [180, 0, 0] });

  // ---------- head ----------
  const HC = V(0, 1.25, 0.06);
  b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, { bone: head, at: HC, scale: [0.155, 0.155, 0.16] });
  b.part(new THREE.SphereGeometry(0.05, 7, 5), SKIN, { bone: head, at: [0, 1.215, 0.21], scale: [1, 0.9, 1] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 7, 5), WHITE, { bone: head, at: [s * 0.06, 1.265, 0.185] });
    b.part(new THREE.SphereGeometry(0.016, 6, 4), "#2b6fa8", { bone: head, at: [s * 0.062, 1.265, 0.21] });
    b.part(new THREE.SphereGeometry(0.008, 5, 4), DARK, { bone: head, at: [s * 0.062, 1.265, 0.222] });
    b.part(new THREE.BoxGeometry(0.1, 0.03, 0.04), HAIR, { bone: head, at: [s * 0.06, 1.305, 0.2], rotation: [0, 0, -s * 15] });
    b.part(new THREE.SphereGeometry(0.045, 6, 4), "#e08a68", { bone: head, at: [s * 0.1, 1.2, 0.15], scale: [1, 0.8, 0.7] });
    b.part(new THREE.ConeGeometry(0.035, 0.11, 5), SKIN, { bone: head, at: [s * 0.16, 1.27, 0.03], dir: [s, 0.6, -0.1] });
    b.part(new THREE.TorusGeometry(0.012, 0.004, 4, 6), GILT, { bone: head, at: [s * 0.162, 1.225, 0.03], dir: [1, 0, 0], axis: "z" });
    // mustache
    b.capsule([s * 0.01, 1.18, 0.205], [s * 0.1, 1.155, 0.19], 0.026, { bone: jaw, color: HAIR });
    b.part(new THREE.SphereGeometry(0.03, 6, 4), HAIR_LT, { bone: jaw, at: [s * 0.12, 1.16, 0.18] });
  }
  // jaw + beard
  b.part(new THREE.BoxGeometry(0.2, 0.05, 0.17), SKIN, { bone: jaw, at: [0, 1.15, 0.09] });
  b.sweep(polyline([[0, 1.2, 0.1], [0, 1.08, 0.16], [0, 0.92, 0.17]]), (t) => [0.15 - 0.09 * t, 0.1 - 0.04 * t], { bone: jaw, color: HAIR });
  b.part(new THREE.SphereGeometry(0.1, 7, 5), HAIR, { bone: jaw, at: [0, 1.15, 0.15], scale: [1.4, 0.8, 0.9] });
  for (const s of [1, -1]) {
    const path = catmull([[s * 0.07, 1.1, 0.22], [s * 0.085, 0.98, 0.24], [s * 0.075, 0.86, 0.24], [s * 0.065, 0.74, 0.23]]);
    let k = 0;
    b.along(path, 10, (at) => {
      const j = k++;
      b.part(new THREE.SphereGeometry(0.03, 5, 4), j % 2 ? HAIR : HAIR_LT, { bone: jaw, at: at.at.clone().add(V((j % 2 ? 1 : -1) * 0.012, 0, 0)), scale: [1, 0.8, 1] });
    });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 8), GILT, { bone: jaw, at: [s * 0.065, 0.715, 0.23] });
    b.part(new THREE.ConeGeometry(0.035, 0.08, 6), HAIR_LT, { bone: jaw, at: [s * 0.065, 0.66, 0.23], dir: [0, -1, 0] });
    b.part(new THREE.TorusGeometry(0.035, 0.008, 4, 8), GILT, { bone: jaw, at: [s * 0.075, 0.95, 0.24], rotation: [90, 0, 0] });
  }
  // hat
  const hatPt = V(0, 1.32, 0.06);
  b.lathe([[0, 0], [0.24, 0], [0.25, 0.03], [0.17, 0.045], [0.165, 0.12], [0.11, 0.19], [0, 0.21]], { at: hatPt, bone: head, color: LEATHER, segments: 10 });
  b.part(new THREE.CylinderGeometry(0.172, 0.176, 0.035, 10), BRASS, { bone: head, at: hatPt.clone().add(V(0, 0.08, 0)) });
  b.part(new THREE.BoxGeometry(0.05, 0.05, 0.02), GILT, { bone: head, at: hatPt.clone().add(V(0, 0.08, 0.175)) });
  b.part(new THREE.SphereGeometry(0.02, 5, 4), RED, { bone: head, at: hatPt.clone().add(V(0, 0.22, 0)) });
  b.extrude([[0, 0], [0.1, 0.07], [0.22, 0.08], [0.32, 0.03], [0.2, -0.02], [0.1, -0.04]], { at: [0.17, 1.4, 0.0], x: [0, 0, -1], thickness: 0.012, smoothing: 1, color: RED, bone: head });
  b.rod([0.17, 1.4, 0.0], [0.17, 1.42, -0.3], 0.004, { bone: head, color: WHITE });

  return b.root;
}
```