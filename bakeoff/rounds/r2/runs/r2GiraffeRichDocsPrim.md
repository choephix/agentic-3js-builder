```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  vec,
  patches,
  countershade,
  gradient,
} from "agentic-3js-builder";

export const meta = {
  name: "Young Reticulated Giraffe",
  description:
    "A young reticulated giraffe with chestnut patches outlined in cream, a stiff mane, fuzzy black-tufted ossicones, big ears, lashes, a peeking tongue and cream-faded legs.",
};

const CHEST = "#a8531f";
const CHEST2 = "#8a3c14";
const CREAM = "#f6e6bc";
const BELLY = "#efdcae";
const MANE = "#4a2a16";
const BLACK = "#16110f";
const HOOF = "#2b2220";
const TONGUE = "#4b2c3c";
const TAN = "#c48a52";
const MUZZLE = "#dcb98e";
const EAR = "#b9794a";
const EARIN = "#e9b9a0";
const OSS = "#b98c5c";
const FUZZ = "#6b4426";

export default function build() {
  const b = createBuilder({ name: "giraffe" });

  const coat = countershade(patches(CREAM, [CHEST, CHEST2], { size: 0.2, seed: 3 }), BELLY, { level: -0.55 });
  const legCoat = gradient(coat, CREAM, [0, 0.42, 0], [0, 0.2, 0]);

  // ---------- skeleton: spine ----------
  const hips = b.joint("hips", { at: [0, 1.28, -0.4], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.28, -0.4],
      [0, 1.31, 0.0],
      [0, 1.4, 0.42],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];

  b.sweep(
    spine,
    (t: number) => [0.18 + 0.04 * Math.sin(Math.PI * t), 0.25 + 0.08 * Math.sin(Math.PI * Math.min(1, t * 1.2))],
    { color: coat },
  );

  // ---------- neck ----------
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.4, 0.42],
      [0, 1.75, 0.6],
      [0, 2.05, 0.8],
      [0, 2.3, 0.95],
    ]),
    { parent: chest, names: ["neck1", "neck2", "neck3", "neckTip"], role: "neck" },
  );
  const neckSw = b.sweep(neck, [0.18, 0.13, 0.1, 0.085], { color: coat });

  // stiff mane
  let mi = 0;
  b.along(neckSw, 18, (at: any) => {
    const n = vec(at.n).add(new THREE.Vector3(0, 0.9, 0.3)).normalize();
    const len = 0.075 + 0.025 * Math.sin(mi * 1.7);
    mi++;
    return b.spike(at, n.toArray() as number[], len, 0.02, { color: MANE, sides: 5 });
  });

  // ---------- head ----------
  const head = b.joint("head", { parent: neck, at: neck.at(1).at, dir: [0, 0.3, 1], role: "head" });
  const hd = new THREE.Vector3(0, 0.3, 1).normalize();
  const hu = new THREE.Vector3(0, 1, -0.3).normalize();
  const hp = vec(head.at);
  const H = (x: number, f: number, u: number) =>
    hp.clone().add(new THREE.Vector3(x, 0, 0)).addScaledVector(hd, f).addScaledVector(hu, u);

  const jaw = b.joint("jaw", { parent: head, at: H(0, 0.12, -0.07), aim: H(0, 0.4, -0.085), role: "jaw" });

  const headCoat = countershade(TAN, MUZZLE, { level: -0.4 });
  b.capsule(H(0, -0.06, 0), H(0, 0.2, 0), [0.1, 0.085], { bone: head, color: headCoat });
  b.capsule(H(0, 0.18, -0.005), H(0, 0.4, -0.03), [0.082, 0.065], { bone: head, color: MUZZLE });
  b.part(new THREE.SphereGeometry(0.052, 8, 6), BLACK, { bone: head, at: H(0, 0.435, -0.035) });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.012, 5, 4), "#000000", { bone: head, at: H(s * 0.03, 0.47, -0.01) });

  // lower jaw + tongue
  b.capsule(H(0, 0.14, -0.075), H(0, 0.4, -0.085), [0.06, 0.045], { bone: jaw, color: MUZZLE });
  b.capsule(H(0, 0.3, -0.075), H(0, 0.58, -0.13), [0.02, 0.016], { bone: jaw, color: TONGUE });

  for (const s of [1, -1]) {
    // eyes
    const out = new THREE.Vector3(s, 0.1, 0.3).normalize();
    const eyeAt = H(s * 0.085, 0.08, 0.03);
    const eye = b.part(new THREE.SphereGeometry(0.042, 8, 6), BLACK, {
      bone: head,
      at: eyeAt,
      dir: out.toArray() as number[],
    });
    b.part(new THREE.SphereGeometry(0.01, 5, 4), "#ffffff", {
      bone: head,
      at: eyeAt.clone().addScaledVector(out, 0.034).addScaledVector(hu, 0.016).addScaledVector(hd, 0.012),
    });
    b.ring(eye, { count: 7, radius: 0.034, fromDeg: -85, toDeg: 85, tilt: 55 }, (lash: any) =>
      b.spike(lash, lash, 0.055, 0.006, { color: BLACK, sides: 4 }),
    );
    // brow bump
    b.part(new THREE.SphereGeometry(0.04, 6, 4), TAN, {
      bone: head,
      at: H(s * 0.075, 0.1, 0.075),
      scale: [1, 0.7, 1],
    });

    // ears
    const ed = new THREE.Vector3(s, 0.4, -0.1).normalize();
    const eb = H(s * 0.085, -0.03, 0.07);
    const ec = eb.clone().addScaledVector(ed, 0.1);
    b.part(new THREE.SphereGeometry(0.08, 8, 6), EAR, {
      bone: head,
      at: ec,
      dir: ed.toArray() as number[],
      up: [0, 1, 0],
      scale: [0.3, 1.4, 0.9],
    });
    b.part(new THREE.SphereGeometry(0.07, 8, 6), EARIN, {
      bone: head,
      at: ec.clone().add(new THREE.Vector3(0, 0, 0.012)),
      dir: ed.toArray() as number[],
      up: [0, 1, 0],
      scale: [0.2, 1.25, 0.7],
    });

    // ossicones
    const base = H(s * 0.05, 0.03, 0.085);
    const tip = base
      .clone()
      .addScaledVector(hu, 0.21)
      .add(new THREE.Vector3(s * 0.02, 0, 0))
      .addScaledVector(hd, -0.03);
    b.rod(base, tip, [0.03, 0.023], { bone: head, color: OSS, sides: 6 });
    const axisDir = tip.clone().sub(base).normalize();
    for (const u of [0.35, 0.65]) {
      const c = base.clone().lerp(tip, u);
      b.ring(
        { at: c, axis: axisDir } as any,
        { count: 6, radius: 0.025, tilt: 55 },
        (it: any) => b.spike(it, it, 0.045, 0.009, { color: FUZZ, sides: 4, bone: head }),
      );
    }
    b.part(new THREE.IcosahedronGeometry(0.045, 0), BLACK, { bone: head, at: tip, flat: true });
    b.ring(
      { at: tip, axis: axisDir } as any,
      { count: 8, radius: 0.02, tilt: 60 },
      (it: any) => b.spike(it, it, 0.065, 0.011, { color: BLACK, sides: 4, bone: head }),
    );
    b.spike(tip, axisDir.toArray() as number[], 0.09, 0.014, { color: BLACK, sides: 4, bone: head });
  }

  b.pose(jaw, { axis: [1, 0, 0], deg: 8 });

  // ---------- legs ----------
  const radii = [0.1, 0.075, 0.05, 0.04, 0.045];
  const hoofGeo = () => new THREE.CylinderGeometry(0.042, 0.058, 0.1, 6);
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    // front
    const fp = limb([s * 0.13, 1.2, 0.3], [s * 0.13, 0.1, 0.34], [0.57, 0.57], [0, 0, 1]);
    const fl = b.chain(`legF${sd}`, fp, {
      parent: chest,
      names: [`shoulder${sd}`, `knee${sd}`, `hoofF${sd}`],
      role: "leg",
      contact: [s * 0.13, 0, 0.34],
    });
    b.sweep(fl, radii, { color: legCoat });
    b.part(hoofGeo(), HOOF, { at: [s * 0.13, 0.05, 0.34], bone: fl.joints[fl.joints.length - 1], flat: true });

    // hind
    const hpts = limb(
      [s * 0.13, 1.17, -0.5],
      [s * 0.12, 0.1, -0.56],
      [0.45, 0.45, 0.25],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hl = b.chain(`legH${sd}`, hpts, {
      parent: hips,
      names: [`hip${sd}`, `stifle${sd}`, `hock${sd}`, `hoofH${sd}`],
      role: "leg",
      contact: [s * 0.12, 0, -0.56],
    });
    b.sweep(hl, radii, { color: legCoat });
    b.part(hoofGeo(), HOOF, { at: [s * 0.12, 0.05, -0.56], bone: hl.joints[hl.joints.length - 1], flat: true });
  }

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.32, -0.5],
      [0, 1.2, -0.72],
      [0, 0.85, -0.82],
      [0, 0.5, -0.82],
    ]),
    { parent: hips, role: "tail" },
  );
  b.sweep(tail, [0.04, 0.022], { color: CHEST2 });
  b.spike([0, 0.55, -0.82], [0, -1, 0], 0.32, 0.055, {
    color: BLACK,
    sides: 6,
    bone: tail.joints[tail.joints.length - 1],
  });

  return b.root;
}
```