import * as THREE from "three";
import { createBuilder, rng, mottle, offset, catmull, polyline } from "../../../../src/index";

export const meta = {
  name: "Old Lion",
  description:
    "A proud old lion lying in a sphinx pose, head held high, with a huge shaggy mane fading from golden to dark chocolate, a scar over one brow, and a dark-tufted tail.",
};

const TAWNY = "#c8924a";
const TAWNY2 = "#b8823d";
const CREAM = "#ecd9ae";
const PAW = "#bf8c4a";
const DARK = "#34200f";
const NOSE = "#16110f";
const AMBER = "#e8a02a";
const SCAR = "#7a2f2a";
const MANE = ["#ecb64e", "#cf8f32", "#9d6226", "#6c3f1c", "#44270f"];

export default function build() {
  const b = createBuilder({ name: "lion" });
  const R = rng(11);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.4, -0.62], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.4, -0.62],
      [0, 0.43, -0.1],
      [0, 0.47, 0.4],
    ]),
    { parent: hips, count: 3, role: "spine" },
  );
  const chest = spine.joints[2];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.6, 0.38],
      [0, 0.82, 0.5],
      [0, 1.0, 0.6],
    ]),
    { parent: chest, count: 3, role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[2], at: neck.at(1).at, dir: [0, 0.05, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.1, up: -0.08 }),
    aim: head.local({ forward: 0.35, up: -0.1 }),
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.3, -0.9],
      [0.05, 0.16, -1.3],
      [0.3, 0.08, -1.6],
      [0.6, 0.08, -1.55],
      [0.8, 0.08, -1.3],
    ]),
    { parent: hips, count: 5, role: "tail" },
  );

  // ---------- body ----------
  const coat = mottle(TAWNY, TAWNY2, { size: 0.25, contrast: 0.5 });
  b.sweep(spine, (t) => [0.3 + 0.05 * t, 0.38 + 0.04 * t], {
    color: coat,
    sectors: [[115, 245, CREAM]],
  });
  b.sweep(neck, [0.2, 0.17], { color: coat, sectors: [[120, 240, CREAM]] });
  b.sweep(tail, [0.05, 0.032], { color: TAWNY });

  // shoulders and haunches
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.2, 10, 8), TAWNY, { bone: chest, at: [s * 0.27, 0.45, 0.25] });
    b.part(new THREE.SphereGeometry(0.27, 10, 8), TAWNY, {
      bone: hips,
      at: [s * 0.3, 0.3, -0.62],
      scale: [0.7, 1, 1.2],
    });
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // front legs stretched forward
    const fl = b.chain(
      `legF${S}`,
      polyline([
        [s * 0.25, 0.5, 0.32],
        [s * 0.27, 0.2, 0.28],
        [s * 0.27, 0.12, 0.62],
        [s * 0.27, 0.08, 0.8],
      ]),
      { parent: chest, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `paw${S}`], role: "leg" },
    );
    b.sweep(fl, [0.11, 0.09, 0.075, 0.07], { color: TAWNY });
    b.part(new THREE.SphereGeometry(1, 9, 7), PAW, {
      bone: fl.tip ?? fl.joints[2],
      at: [s * 0.27, 0.09, 0.78],
      scale: [0.115, 0.09, 0.17],
    });
    for (let j = -1; j <= 1; j++) {
      b.part(new THREE.SphereGeometry(0.036, 6, 5), CREAM, {
        bone: fl.tip ?? fl.joints[2],
        at: [s * 0.27 + j * 0.06, 0.05, 0.92 - Math.abs(j) * 0.02],
      });
      b.spike([s * 0.27 + j * 0.06, 0.035, 0.95 - Math.abs(j) * 0.02], [0, -0.3, 1], 0.05, 0.012, {
        color: "#efe6d0",
        bone: fl.tip ?? fl.joints[2],
        sides: 5,
      });
    }

    // hind legs, folded under
    const hl = b.chain(
      `legH${S}`,
      polyline([
        [s * 0.3, 0.38, -0.65],
        [s * 0.36, 0.2, -0.35],
        [s * 0.36, 0.1, -0.82],
        [s * 0.34, 0.07, -0.48],
      ]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `hock${S}`, `foot${S}`], role: "leg" },
    );
    b.sweep(hl, [0.13, 0.09, 0.07, 0.065], { color: TAWNY });
    b.part(new THREE.SphereGeometry(1, 9, 7), PAW, {
      bone: hl.tip ?? hl.joints[2],
      at: [s * 0.34, 0.07, -0.42],
      scale: [0.1, 0.07, 0.15],
    });
  }

  // ---------- head ----------
  const hp = (o: Record<string, number>) => head.local(o);
  b.part(new THREE.SphereGeometry(0.2, 12, 9), TAWNY, { bone: head, at: hp({ forward: 0.08 }), scale: [0.95, 0.9, 1] });
  // muzzle (cream), bridge, nose
  b.frustumBox(hp({ forward: 0.15, up: -0.02 }), hp({ forward: 0.38, up: -0.05 }), [0.22, 0.18], [0.17, 0.12], {
    bone: head,
    color: CREAM,
  });
  b.part(new THREE.BoxGeometry(0.1, 0.035, 0.22), TAWNY, { bone: head, at: hp({ forward: 0.25, up: 0.05 }) });
  b.part(new THREE.BoxGeometry(0.115, 0.06, 0.05), NOSE, { bone: head, at: hp({ forward: 0.385, up: 0.0 }) });
  b.part(new THREE.BoxGeometry(0.03, 0.04, 0.03), NOSE, { bone: head, at: hp({ forward: 0.385, up: -0.045 }) });
  // lower jaw
  b.frustumBox(hp({ forward: 0.1, up: -0.115 }), hp({ forward: 0.36, up: -0.115 }), [0.16, 0.06], [0.12, 0.05], {
    bone: jaw,
    color: CREAM,
  });
  for (const s of [1, -1]) {
    // lip line
    b.rod(hp({ left: s * 0.075, forward: 0.38, up: -0.085 }), hp({ left: s * 0.085, forward: 0.2, up: -0.09 }), 0.006, {
      color: DARK,
      bone: head,
    });
    // fangs
    b.spike(hp({ left: s * 0.05, forward: 0.36, up: -0.1 }), [0, -1, 0], 0.045, 0.012, {
      color: "#fbf6e6",
      bone: head,
      sides: 5,
    });
    // whisker pad spots
    for (let j = 0; j < 3; j++)
      b.part(new THREE.SphereGeometry(0.009, 5, 4), DARK, {
        bone: head,
        at: hp({ left: s * 0.092, forward: 0.27 + 0.04 * j, up: -0.055 + 0.012 * (j % 2) }),
      });
    // eyes
    b.part(new THREE.SphereGeometry(0.03, 8, 6), AMBER, { bone: head, at: hp({ left: s * 0.09, up: 0.07, forward: 0.24 }) });
    b.part(new THREE.SphereGeometry(0.014, 6, 5), NOSE, {
      bone: head,
      at: hp({ left: s * 0.093, up: 0.07, forward: 0.265 }),
      scale: [0.8, 1.3, 0.8],
    });
    // heavy brow
    b.part(new THREE.BoxGeometry(0.1, 0.03, 0.07), TAWNY2, {
      bone: head,
      at: hp({ left: s * 0.09, up: 0.115, forward: 0.225 }),
      rotation: [0, 0, s * -12],
    });
    // ears
    b.part(new THREE.SphereGeometry(0.055, 8, 6), TAWNY, {
      bone: head,
      at: hp({ left: s * 0.14, up: 0.17, forward: 0.0 }),
      scale: [1, 1.1, 0.55],
    });
    b.part(new THREE.SphereGeometry(0.035, 6, 5), DARK, {
      bone: head,
      at: hp({ left: s * 0.14, up: 0.165, forward: 0.025 }),
      scale: [1, 1.1, 0.4],
    });
  }
  // scar across the left brow
  b.rod(hp({ left: 0.115, up: 0.16, forward: 0.2 }), hp({ left: 0.07, up: 0.075, forward: 0.255 }), 0.009, {
    color: SCAR,
    bone: head,
    sides: 5,
  });
  // chin tuft
  b.spike(hp({ forward: 0.3, up: -0.14 }), [0, -0.7, 0.3], 0.07, 0.03, { color: CREAM, bone: head, sides: 5 });

  // ---------- mane ----------
  const C = head.local({ forward: -0.12 });
  b.part(new THREE.SphereGeometry(1, 10, 8), MANE[3], { bone: head, at: [C.x, C.y - 0.06, C.z - 0.16], scale: [0.5, 0.52, 0.32] });
  b.part(new THREE.SphereGeometry(1, 9, 7), MANE[4], { bone: neck.joints[1], at: [0, 0.75, 0.15], scale: [0.45, 0.4, 0.45] });
  for (let k = 0; k < 5; k++) {
    const n = 12 + 3 * k;
    const rad = 0.26 + 0.085 * k;
    for (let i = 0; i < n; i++) {
      const a = ((i + (k % 2) * 0.5) / n) * Math.PI * 2 + k * 0.12;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const down = sa < 0;
      const base: [number, number, number] = [C.x + ca * rad * 1.05, C.y + sa * rad, C.z - 0.06 * k];
      const d = new THREE.Vector3(ca, down ? sa * 0.5 : sa, -(0.5 + 0.12 * k)).normalize();
      const len = (0.22 + 0.07 * k) * (down ? 0.75 : 1) * (0.85 + 0.3 * R());
      const col = MANE[Math.min(4, k + (R() < 0.3 ? 1 : 0))];
      b.spike(base, [d.x, d.y, d.z], len, 0.065 + 0.014 * k, { color: col, bone: head, sides: 5 });
    }
  }

  // ---------- tail tuft ----------
  const tip = tail.at(1);
  b.part(new THREE.SphereGeometry(1, 8, 6), DARK, {
    bone: tail.joints[tail.joints.length - 1],
    at: offset(tip.at, tip.tangent, 0.09),
    dir: [tip.tangent.x, tip.tangent.y, tip.tangent.z],
    scale: [0.065, 0.17, 0.065],
  });
  b.ring(tip, { count: 7, radius: 0.025, tilt: 75 }, (item) =>
    b.spike(item, item, 0.2, 0.04, { color: DARK, sides: 5 }),
  );

  return b.root;
}
