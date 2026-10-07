import * as THREE from "three";
import { createBuilder, catmull, countershade, gradient, stripes, mottle, limb, offset } from "../../../../src/index";

export const meta = {
  name: "Fennec Fox Kit on a Dune",
  description:
    "Alert fennec fox kit on a sand dune at dusk: huge peach-lined ears, cream-to-gold coat, black-tipped fluffy tail, oversized paws, woven leather collar with a brass bell.",
};

const GOLD = "#dca566";
const CREAM = "#f6e6c8";
const PEACH = "#f4bda0";
const EAR = "#e2b077";
const DARK = "#1b1210";
const TAILTIP = "#241b19";
const LEATHER = "#7a4a2b";
const LEATHER2 = "#a8683a";
const BRASS = "#dba92c";
const TOE = "#e8cfa5";

export default function build() {
  const b = createBuilder({ name: "fennecKit" });
  const Y0 = 0.07; // dune top height under the paws

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.21, -0.13], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.21, -0.13],
      [0, 0.22, -0.02],
      [0, 0.23, 0.09],
    ]),
    { parent: hips, role: "spine", names: ["spine1", "spine2"] },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.23, 0.09],
      [0, 0.27, 0.14],
      [0, 0.31, 0.19],
    ]),
    { parent: spine.joints[1], role: "neck", names: ["neck1", "neck2"] },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: neck.at(1).at,
    dir: [0, -0.05, 1],
    role: "head",
  });
  const H = (f: number, u: number, l = 0) => head.local({ forward: f, up: u, left: l });
  const jaw = b.joint("jaw", { parent: head, at: H(0.04, -0.025), aim: H(0.14, -0.03), role: "jaw" });

  const coat = countershade(GOLD, CREAM, { level: -0.1, soft: 0.5 });

  // ---------- dune ----------
  const dune = b.lathe(
    [
      [0, 0],
      [0.62, 0],
      [0.5, 0.025],
      [0.3, 0.06],
      [0.18, 0.078],
      [0, 0.082],
    ],
    { at: [0, 0, 0], bone: hips, segments: 18, color: mottle("#d6a96c", "#e6c58c", { size: 0.12, contrast: 0.6, seed: 3 }) },
  );
  void dune;
  // dry grass tuft
  for (let i = 0; i < 4; i++) {
    b.spike([0.3 + i * 0.012, 0.035, 0.12 - i * 0.01], [0.25 * (i - 1.5), 1, 0.2], 0.07 + 0.01 * i, 0.006, {
      color: "#a38b4c",
      bone: hips,
      sides: 4,
    });
  }

  // ---------- body ----------
  b.sweep(spine, [0.072, 0.086, 0.08], { color: coat });
  b.sweep(neck, [0.062, 0.05], { color: coat });
  b.part(new THREE.SphereGeometry(0.075, 8, 6), CREAM, { at: [0, 0.2, 0.1], bone: spine.joints[1] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.062, 8, 6), GOLD, { at: [s * 0.055, 0.2, -0.12], bone: hips });
    b.part(new THREE.SphereGeometry(0.052, 8, 6), GOLD, { at: [s * 0.05, 0.21, 0.07], bone: spine.joints[1] });
  }

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(0.068, 10, 8), coat, { bone: head, at: H(0.0, 0.0), scale: [1.18, 1, 1.05] });
  b.frustumBox(H(0.04, 0.005), H(0.15, -0.005), [0.08, 0.06], [0.034, 0.032], { bone: head, color: CREAM });
  b.frustumBox(H(0.045, -0.028), H(0.135, -0.03), [0.06, 0.022], [0.03, 0.016], { bone: jaw, color: CREAM });
  b.part(new THREE.SphereGeometry(0.014, 6, 5), DARK, { bone: head, at: H(0.156, 0.003), scale: [1.25, 0.9, 1] });

  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    // eyes
    b.part(new THREE.SphereGeometry(0.025, 8, 6), DARK, { bone: head, at: H(0.07, 0.025, s * 0.048) });
    b.part(new THREE.SphereGeometry(0.0065, 5, 4), "#ffffff", { bone: head, at: H(0.09, 0.034, s * 0.054) });
    // cheek fur
    for (let i = 0; i < 3; i++) {
      b.spike(H(0.02 + i * 0.012, -0.02 - i * 0.004, s * 0.06), [s * 0.8, -0.3 - 0.1 * i, -0.5], 0.05, 0.012, {
        color: CREAM,
        bone: head,
        sides: 5,
      });
    }
    // whiskers
    for (let i = 0; i < 3; i++) {
      b.spike(H(0.115, 0.004 + 0.008 * (i - 1), s * 0.022), [s * 0.9, 0.12 * (i - 1), 0.25], 0.08, 0.002, {
        color: "#fff4de",
        bone: head,
        sides: 3,
      });
    }
    // ears
    const base = H(-0.01, 0.05, s * 0.045);
    const ear = b.joint(`ear${n}`, { parent: head, at: base, dir: [s * 0.3, 1, -0.15], role: "hinge" });
    const X: [number, number, number] = [s, 0, 0];
    const Y: [number, number, number] = [s * 0.35, 1, -0.1];
    b.extrude(
      [
        [-0.036, 0],
        [-0.048, 0.07],
        [-0.022, 0.15],
        [0, 0.19, "sharp"],
        [0.022, 0.15],
        [0.048, 0.07],
        [0.036, 0],
      ],
      { at: base, x: X, y: Y, thickness: 0.01, smoothing: 1, color: EAR, bone: ear },
    );
    b.extrude(
      [
        [-0.025, 0.012],
        [-0.033, 0.07],
        [-0.013, 0.14],
        [0, 0.168],
        [0.013, 0.14],
        [0.033, 0.07],
        [0.025, 0.012],
      ],
      { at: [base.x, base.y, base.z + 0.006], x: X, y: Y, thickness: 0.006, smoothing: 1, color: PEACH, bone: ear },
    );
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    // front
    const fpts = limb([s * 0.055, 0.2, 0.08], [s * 0.058, Y0 + 0.032, 0.11], [0.065, 0.065], [[0, 0, -1]]);
    const fl = b.chain(`legF${n}`, fpts, {
      parent: spine.joints[1],
      role: "leg",
      names: [`shoulder${n}`, `elbow${n}`, `wrist${n}`],
    });
    b.sweep(fl, [0.032, 0.02], { color: gradient(GOLD, CREAM, [0, 0.2, 0], [0, 0.1, 0]) });
    const ff = fpts[fpts.length - 1];
    // hind
    const hpts = limb(
      [s * 0.06, 0.2, -0.13],
      [s * 0.06, Y0 + 0.032, -0.15],
      [0.07, 0.07, 0.04],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hl = b.chain(`legH${n}`, hpts, {
      parent: hips,
      role: "leg",
      names: [`hip${n}`, `knee${n}`, `hock${n}`, `ankle${n}`],
    });
    b.sweep(hl, [0.034, 0.02], { color: gradient(GOLD, CREAM, [0, 0.2, 0], [0, 0.1, 0]) });
    const hf = hpts[hpts.length - 1];

    for (const [foot, ch] of [
      [ff, fl],
      [hf, hl],
    ] as const) {
      const bone = ch.tip!;
      b.part(new THREE.SphereGeometry(0.04, 8, 6), CREAM, {
        bone,
        at: [foot.x, Y0 + 0.022, foot.z + 0.022],
        scale: [0.9, 0.6, 1.35],
      });
      for (let i = -1; i <= 1; i++) {
        b.part(new THREE.SphereGeometry(0.011, 5, 4), TOE, {
          bone,
          at: [foot.x + i * 0.017, Y0 + 0.012, foot.z + 0.05],
          scale: [1, 0.8, 1.2],
        });
      }
    }
  }

  // ---------- tail ----------
  const tailPath = catmull([
    [0, 0.21, -0.17],
    [0, 0.19, -0.3],
    [0, 0.15, -0.42],
    [0, 0.12, -0.54],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, role: "tail" });
  b.sweep(tail, [0.04, 0.06, 0.058, 0.03], {
    bands: [
      [0.8, countershade(GOLD, CREAM, { level: -0.1, soft: 0.5 })],
      [1, TAILTIP],
    ],
  });

  // ---------- collar and bell ----------
  const neckTube = b.sweep(neck, [0.062, 0.05], { color: coat });
  const skin = b.surface(neckTube);
  const c = neck.at(0.4);
  const collar = skin.loop(c, { lift: 0.006 });
  b.sweep(collar, () => [0.013, 0.007], {
    section: "box",
    color: stripes(LEATHER, LEATHER2, { size: 0.012, axis: "z" }),
    bone: neck.joints[0],
  });
  b.along(collar, 8, (at) =>
    b.part(new THREE.SphereGeometry(0.0055, 5, 4), BRASS, { at, bone: neck.joints[0] }),
  );
  const bh = skin.nearest(offset(c.at, [0, -1, 0.3], 0.1));
  const bp = offset(bh.at, bh.n, 0.024);
  b.part(new THREE.SphereGeometry(0.02, 8, 6), BRASS, { at: bp, bone: neck.joints[0] });
  b.part(new THREE.BoxGeometry(0.016, 0.003, 0.004), "#6b4a12", {
    at: [bp.x, bp.y - 0.008, bp.z + 0.017],
    bone: neck.joints[0],
  });
  b.part(new THREE.TorusGeometry(0.007, 0.002, 4, 8), BRASS, {
    at: [bp.x, bp.y + 0.02, bp.z],
    bone: neck.joints[0],
  });

  return b.root;
}
