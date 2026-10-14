```ts
import * as THREE from "three";
import { createBuilder, paint, patches, mix, smoothstep } from "agentic-3js-builder";

export const meta = {
  name: "Young Reticulated Giraffe",
  description:
    "A rigged calf with chestnut patches outlined in cream, a stiff brown mane, fuzzy black-tufted ossicones, big ears, long lashes, a peeking dark tongue and cream-fading legs.",
};

export default function build() {
  const b = createBuilder({ name: "giraffe" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const CREAM = "#f3e5c0";
  const coat = patches(CREAM, ["#a3521e", "#8d4416", "#b86228", "#97491a"], { size: 0.2, gap: 0.13, seed: 3 });
  const legPaint = paint((p, n) => mix(CREAM, coat.at(p, n), smoothstep(0.3, 0.7, p.y)));
  const SKIN = "#c68b52";
  const MUZZLE = "#d9a56c";
  const DARK = "#1e1612";
  const MANE = "#5a3418";

  // ---------- skeleton: spine ----------
  b.joint("root", { at: [0, 1.3, -0.1], dir: [0, 0, 1] });
  const spine = b.chain("spine", [[0, 1.3, -0.6], [0, 1.35, -0.25], [0, 1.45, 0.15], [0, 1.52, 0.5]], {
    parent: "root",
    role: "spine",
    up: [0, 1, 0],
  });
  b.sweep(
    spine,
    (t: number) => [0.16 + 0.05 * Math.sin(Math.PI * Math.min(1, t * 1.3)), 0.25 + 0.04 * t] as const,
    { color: coat, sides: 10 },
  );

  // ---------- neck ----------
  const neck = b.chain(
    "neck",
    [[0, 1.5, 0.42], [0, 1.8, 0.62], [0, 2.15, 0.82], [0, 2.45, 0.97]],
    { parent: spine, role: "neck", up: [0, 1, 0] },
  );
  const neckSweep = b.sweep(
    neck,
    (t: number) => {
      const r = 0.15 - 0.075 * t;
      return [r * 0.85, r] as const;
    },
    { color: coat, sides: 8 },
  );

  // mane down the dorsal line
  for (let i = 0; i < 16; i++) {
    const t = 0.03 + (i / 15) * 0.95;
    for (const ang of [0, 16, -16]) {
      const p = neckSweep.at(t, ang, -0.012);
      const dir = p.n.clone().add(V(0, 0.15, -0.7)).normalize();
      b.spike(p.at, dir, ang === 0 ? 0.09 : 0.07, 0.015, { color: MANE, sides: 4, bone: neck.jointAt(t) });
    }
  }

  // ---------- head ----------
  const head = b.joint("head", { parent: neck, at: [0, 2.45, 0.97], dir: [0, -0.3, 1], role: "head" });
  b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, { at: [0, 2.52, 1.04], scale: [0.105, 0.105, 0.16], bone: head });
  // upper jaw / muzzle
  b.capsule([0, 2.52, 1.1], [0, 2.47, 1.42], { radius: [0.085, 0.06], color: MUZZLE, sides: 8, bone: head });
  b.part(new THREE.SphereGeometry(1, 8, 6), "#6b4a40", { at: [0, 2.465, 1.43], scale: [0.058, 0.05, 0.04], bone: head });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.014, 5, 4), DARK, { at: [s * 0.028, 2.475, 1.465], bone: head });
  // jaw
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.45, 1.12], dir: [0, -0.1, 1], role: "jaw" });
  b.capsule([0, 2.43, 1.12], [0, 2.395, 1.4], { radius: [0.05, 0.035], color: MUZZLE, sides: 8, bone: jaw });
  // tongue
  b.capsule([0, 2.395, 1.3], [0, 2.355, 1.5], { radius: 0.021, color: "#3a2a3e", sides: 6, bone: jaw });
  b.part(new THREE.SphereGeometry(0.024, 6, 5), "#3a2a3e", { at: [0, 2.35, 1.505], scale: [1, 0.7, 1.1], bone: jaw });

  // eyes + lashes
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.044, 7, 6), "#5a3a2a", { at: [s * 0.085, 2.575, 1.06], bone: head });
    b.part(new THREE.SphereGeometry(0.036, 8, 6), DARK, { at: [s * 0.093, 2.575, 1.07], bone: head });
    b.part(new THREE.SphereGeometry(0.011, 5, 4), "#ffffff", { at: [s * 0.108, 2.588, 1.098], bone: head });
    for (let k = -2; k <= 2; k++) {
      const base = V(s * 0.085, 2.605, 1.09);
      const d = V(s * 0.45, 0.75, 0.45 + k * 0.35).normalize();
      b.rod(base, base.clone().addScaledVector(d, 0.055), 0.004, { color: DARK, sides: 3, bone: head, caps: "none" });
    }
  }

  // ears
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const ear = b.joint("ear" + S, { parent: head, at: [s * 0.12, 2.6, 0.95], dir: [s * 0.9, 0.5, -0.1] });
    const rot: [number, number, number] = [0, 0, -s * 65];
    b.part(new THREE.SphereGeometry(0.1, 8, 6), SKIN, {
      at: [s * 0.185, 2.65, 0.94], rotation: rot, scale: [0.5, 1, 0.2], bone: ear,
    });
    b.part(new THREE.SphereGeometry(0.1, 8, 6), "#e8b4a2", {
      at: [s * 0.185, 2.65, 0.955], rotation: rot, scale: [0.33, 0.8, 0.18], bone: ear,
    });
  }

  // ossicones
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const base = V(s * 0.05, 2.6, 0.97);
    const dir = V(s * 0.12, 1, -0.25).normalize();
    const tip = base.clone().addScaledVector(dir, 0.18);
    const oss = b.joint("ossicone" + S, { parent: head, at: base, dir });
    b.rod(base, tip, { radius: [0.03, 0.021], color: "#a8703f", sides: 6, bone: oss });
    b.part(new THREE.SphereGeometry(0.04, 7, 6), DARK, { at: tip, bone: oss });
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2;
      const d = V(Math.cos(a) * 0.9, 1, Math.sin(a) * 0.9).normalize();
      b.spike(tip, d, 0.065, 0.009, { color: DARK, sides: 3, bone: oss });
    }
  }

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    [[0, 1.5, -0.6], [0, 1.3, -0.72], [0, 1.05, -0.76], [0, 0.8, -0.75], [0, 0.62, -0.74]],
    { parent: spine.joints[0], role: "tail" },
  );
  b.sweep(tail, [0.03, 0.025, 0.02, 0.016], { color: "#b8793e", sides: 6 });
  b.capsule([0, 0.66, -0.74], [0, 0.46, -0.73], { radius: [0.03, 0.045], color: DARK, sides: 6, bone: tail });

  // ---------- legs ----------
  const hoofGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.09, 6);
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = s * 0.16;
    const defs: Array<[string, number, number[], string[]]> = [
      ["F", 0.4, [1.12, 0.62, 0.17, 0.07], ["shoulder", "wrist", "fetlockF", "hoofF"]],
      ["H", -0.5, [1.12, 0.65, 0.2, 0.07], ["hip", "hock", "fetlockH", "hoofH"]],
    ];
    for (const [tag, z, ys, nm] of defs) {
      const dz = tag === "F" ? [0, 0.01, 0.02, 0.025] : [0, -0.06, -0.02, -0.01];
      const pts = ys.map((y, i) => [x, y, z + dz[i]]);
      const leg = b.chain("leg" + tag + S, pts, {
        parent: tag === "F" ? spine.joints[2] : spine.joints[0],
        role: "leg",
        names: nm.map((n) => n + S),
      });
      b.sweep(leg, [0.08, 0.05, 0.04, 0.034], { color: legPaint, sides: 7 });
      b.part(new THREE.SphereGeometry(0.052, 7, 6), CREAM, { at: pts[1], bone: leg.joints[1] });
      b.part(new THREE.SphereGeometry(0.044, 7, 6), CREAM, { at: pts[2], bone: leg.joints[2] });
      b.part(hoofGeo, "#2c211c", {
        at: [x, 0.045, z + dz[3] + 0.005], scale: [1, 1, 1.3], bone: leg.joints[3],
      });
    }
  }

  return b.root;
}
```