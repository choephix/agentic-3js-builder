```ts
import * as THREE from "three";
import { createBuilder, catmull, bezier, rng, paint, mix, noise, smoothstep, svg, frame, offset } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Bioluminescent Alien Plant",
  description: "Pandora-style glowing fern-tree with curled fronds, luminous bulbs and a rooted base.",
};

const DEEP = "#0b2a3a";
const TEAL = "#17b8b0";
const CYAN = "#5cf2e6";
const VIOLET = "#7a3fd1";
const PINK = "#ff63c8";
const BULB = "#9dfff0";

export default function build() {
  const b = createBuilder({ name: "alienPlant" });
  const R = rng(11);

  const stemPaint = paint((p, n, s) => {
    const base = mix("#0e3b4a", "#1f8f8f", smoothstep(0, 1.4, p.y));
    const dots = noise(p, 0.07, 3) > 0.68 ? 0.7 : 0;
    return mix(base, CYAN, dots * 0.8);
  });
  const leafPaint = paint((p, n, s) => {
    const t = Math.min(1, Math.max(0, s[0]));
    const veins = Math.abs(((s[1] / 12) % 1) - 0.5) < 0.06 ? 0.5 : 0;
    return mix(mix(DEEP, TEAL, 0.4 + 0.5 * t), CYAN, veins + 0.25 * noise(p, 0.1, 5));
  });

  // skeleton
  const root = b.joint("root", { at: [0, 0.05, 0], dir: [0, 1, 0], role: "spine" });
  const stemPath = catmull([[0, 0.05, 0], [0.05, 0.5, 0.02], [-0.04, 1.0, 0], [0.03, 1.5, 0.04], [0, 1.9, 0.06]]);
  const stem = b.chain("stem", stemPath, { parent: root, count: 5, role: "spine" });
  b.sweep(stem, (t) => 0.13 - 0.085 * t, { color: stemPaint, sides: 8 });

  // buttress roots
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const c = Math.cos(a), sn = Math.sin(a);
    const len = 0.45 + R() * 0.25;
    const p = catmull([[c * 0.05, 0.25, sn * 0.05], [c * len * 0.5, 0.12, sn * len * 0.5], [c * len, 0.0, sn * len]]);
    b.sweep(p, [0.06, 0.012], { color: stemPaint, sides: 6, bone: root, caps: { end: "point" } });
    const tip = p.at(0.85);
    glow(b.part(new THREE.SphereGeometry(0.02, 6, 4), CYAN, { at: tip, bone: root }), 1.6);
  }

  // fronds
  const FRONDS = 9;
  for (let i = 0; i < FRONDS; i++) {
    const a = i * 2.4;
    const h = 1.0 + (i / FRONDS) * 0.85;
    const c = Math.cos(a), sn = Math.sin(a);
    const base = stem.at(Math.min(1, h / 1.9)).at;
    const L = 0.75 - (i / FRONDS) * 0.25 + R() * 0.1;
    const p = bezier(
      base,
      [base.x + c * L * 0.5, base.y + 0.3, base.z + sn * L * 0.5],
      [base.x + c * L, base.y + 0.28, base.z + sn * L],
      [base.x + c * L * 1.15, base.y - 0.25 - R() * 0.15, base.z + sn * L * 1.15],
    );
    const fr = b.chain(`frond${i}`, p, { parent: stem.jointAt(h / 1.9), count: 4, role: "arm" });
    b.sweep(fr, [0.03, 0.008], { color: stemPaint, sides: 6 });
    // leaflets
    b.along(p, 9, (at) => {
      for (const s of [1, -1]) {
        const side = new THREE.Vector3().crossVectors(at.tangent, new THREE.Vector3(0, 1, 0)).normalize().multiplyScalar(s);
        const q = at.t;
        const w = 0.16 * (1 - q * 0.6);
        const tipP = offset(at, side, w);
        tipP.y -= 0.05;
        b.extrude(
          [[0, 0], [0.05, 0.035], [0.12 * (w / 0.16), 0.012], [w, 0, "sharp"], [0.1, -0.03], [0.04, -0.025]],
          { at: at.at, x: [side.x, 0, side.z], y: [0, 1, 0], thickness: 0.008, smoothing: 0, color: leafPaint, bone: fr.jointAt(Math.min(0.99, q)) },
        );
        if (q > 0.2 && q < 0.95)
          glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), PINK, { at: tipP, bone: fr.jointAt(Math.min(0.99, q)) }), 1.8);
      }
    });
    glow(b.part(new THREE.SphereGeometry(0.035, 7, 5), BULB, { at: p.at(1), bone: fr.joints[fr.joints.length - 1] }), 2);
  }

  // crown bloom: petals
  const top = stem.at(1).at;
  const topBone = stem.joints[stem.joints.length - 1];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const c = Math.cos(a), sn = Math.sin(a);
    const pp = bezier(top, [top.x + c * 0.12, top.y + 0.2, top.z + sn * 0.12], [top.x + c * 0.28, top.y + 0.42, top.z + sn * 0.28]);
    b.sweep(pp, [0.05, 0.005], { color: i % 2 ? VIOLET : PINK, sides: 5, bone: topBone, caps: { end: "point" } });
  }
  glow(b.part(new THREE.IcosahedronGeometry(0.11, 1), BULB, { at: [top.x, top.y + 0.12, top.z], bone: topBone, flat: true }), 2.2);
  glow(b.part(new THREE.OctahedronGeometry(0.05), PINK, { at: [top.x, top.y + 0.32, top.z], bone: topBone }), 2.5);

  // hanging tendrils with glow beads
  for (let i = 0; i < 6; i++) {
    const a = i * 1.05 + 0.4;
    const base = stem.at(0.75).at;
    const p = catmull([base, [base.x + Math.cos(a) * 0.12, base.y - 0.2, base.z + Math.sin(a) * 0.12], [base.x + Math.cos(a) * 0.2, base.y - 0.55, base.z + Math.sin(a) * 0.2]]);
    b.sweep(p, [0.012, 0.004], { color: VIOLET, sides: 5, bone: stem.jointAt(0.75) });
    glow(b.part(new THREE.SphereGeometry(0.025, 6, 4), CYAN, { at: p.at(1), bone: stem.jointAt(0.75) }), 2);
  }

  // glowing ground spore pods
  for (let i = 0; i < 12; i++) {
    const a = R() * 6.28, d = 0.3 + R() * 0.5;
    const r = 0.015 + R() * 0.025;
    glow(b.part(new THREE.SphereGeometry(r, 6, 4), i % 3 ? CYAN : PINK, { at: [Math.cos(a) * d, r * 0.6, Math.sin(a) * d], bone: root }), 1.8);
  }

  return b.root;
}
```