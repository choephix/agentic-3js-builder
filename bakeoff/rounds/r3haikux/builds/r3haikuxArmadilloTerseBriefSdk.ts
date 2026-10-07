import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Armadillo",
  description:
    "A nine-banded armadillo at rest: a tan banded carapace on pebbled shields, a cream underside, pink-lined ears, pale front claws and a ringed, tapering tail.",
};

type V3 = [number, number, number];
type Builder = ReturnType<typeof createBuilder>;
type Bone = ReturnType<Builder["joint"]>;

// Palette: warm carapace, dark and light bands, cream underside, pale claws.
const SHELL = "#b07543";
const SHELL_DARK = "#7b4a28";
const SHELL_LIGHT = "#d9a467";
const BELLY = "#efd6ae";
const LEG = "#5e3f2a";
const CLAW = "#f5ebd3";
const EYE = "#1d1511";
const GLINT = "#fff7e6";
const PINK = "#e8a08f";
const NOSE = "#3b2a2a";

const sph = (r: number, seg: number) =>
  new THREE.SphereGeometry(r, seg, Math.max(4, Math.round(seg * 0.7)));

// Point on an ellipsoid c + r. phi runs from the top pole, th turns around Y.
const onEllipsoid = (c: V3, r: V3, phi: number, th: number): V3 => [
  c[0] + r[0] * Math.sin(phi) * Math.cos(th),
  c[1] + r[1] * Math.cos(phi),
  c[2] + r[2] * Math.sin(phi) * Math.sin(th),
];

const pis = (...xs: number[]) => xs.map((x) => x * Math.PI);

export default function build() {
  const b = createBuilder({ name: "armadillo" });

  // ---------- helpers (pure geometry, every piece goes through b.part)
  const ell = (c: V3, r: V3, color: string, bone: Bone, seg = 14) =>
    b.part(sph(1, seg), color, { at: c, bone, scale: r });
  const ball = (c: V3, rad: number, color: string, bone: Bone) =>
    b.part(sph(rad, 8), color, { at: c, bone });
  const post = (c: V3, rt: number, rb: number, h: number, color: string, bone: Bone) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, 10, 1), color, { at: c, bone });
  const box = (c: V3, size: V3, color: string, bone: Bone) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at: c, bone });
  const claw = (at: V3, len: number, rad: number, bone: Bone) => {
    const g = new THREE.ConeGeometry(rad, len, 8, 1);
    g.rotateX(Math.PI / 2 + 0.35); // apex points forward and a little down
    b.part(g, CLAW, { at, bone });
  };
  const studs = (
    c: V3,
    r: V3,
    phis: number[],
    thetas: number[],
    rad: number,
    color: string,
    bone: Bone,
  ) => {
    for (const phi of phis)
      for (const th of thetas) ball(onEllipsoid(c, r, phi, th), rad, color, bone);
  };

  // ---------- skeleton, rest pose (+Z forward, +X is the animal's left)
  const hips = b.joint("hips", { at: [0, 0.13, 0] });
  const neck = b.joint("neck", { at: [0, 0.16, 0.19], parent: hips });
  const head = b.joint("head", { at: [0, 0.17, 0.25], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.128, 0.3], parent: head });
  const earL = b.joint("earL", { at: [0.055, 0.225, 0.2], parent: head });
  const earR = b.joint("earR", { at: [-0.055, 0.225, 0.2], parent: head });

  // ---------- legs: stout and short, planted under the shell
  for (const sd of ["L", "R"] as const) {
    const s = sd === "L" ? 1 : -1;

    // front leg with four long pale claws
    const sh = b.joint(`shoulder${sd}`, { at: [0.08 * s, 0.1, 0.13], parent: hips });
    const el = b.joint(`elbow${sd}`, { at: [0.08 * s, 0.05, 0.135], parent: sh });
    const wr = b.joint(`wrist${sd}`, { at: [0.08 * s, 0.014, 0.14], parent: el });
    post([0.08 * s, 0.075, 0.13], 0.03, 0.026, 0.06, LEG, sh);
    post([0.08 * s, 0.031, 0.135], 0.025, 0.022, 0.04, LEG, el);
    box([0.08 * s, 0.011, 0.165], [0.062, 0.022, 0.075], LEG, wr);
    for (const dx of [-0.0225, -0.0075, 0.0075, 0.0225])
      claw([0.08 * s + dx, 0.009, 0.212], 0.03, 0.0085, wr);

    // hind leg, broader, with shorter claws
    const hp = b.joint(`hip${sd}`, { at: [0.075 * s, 0.1, -0.12], parent: hips });
    const kn = b.joint(`knee${sd}`, { at: [0.078 * s, 0.05, -0.125], parent: hp });
    const an = b.joint(`ankle${sd}`, { at: [0.078 * s, 0.014, -0.12], parent: kn });
    post([0.075 * s, 0.075, -0.12], 0.034, 0.027, 0.06, LEG, hp);
    post([0.078 * s, 0.031, -0.122], 0.027, 0.023, 0.04, LEG, kn);
    box([0.078 * s, 0.011, -0.12], [0.066, 0.022, 0.07], LEG, an);
    for (const dx of [-0.0225, -0.0075, 0.0075, 0.0225])
      claw([0.078 * s + dx, 0.008, -0.088], 0.02, 0.007, an);
  }

  // ---------- ringed tail, tapering from the rump
  const tailPts: V3[] = [
    [0, 0.11, -0.2],
    [0, 0.1, -0.26],
    [0, 0.092, -0.32],
    [0, 0.084, -0.38],
    [0, 0.077, -0.43],
    [0, 0.07, -0.48],
  ];
  const tailTip: V3 = [0, 0.064, -0.525];
  const tailR = [0.03, 0.027, 0.024, 0.02, 0.016, 0.012, 0.005];
  const tail: Bone[] = [];
  tailPts.forEach((p, i) => {
    tail.push(b.joint(`tail${i + 1}`, { at: p, parent: i === 0 ? hips : tail[i - 1] }));
  });
  const seq: V3[] = [...tailPts, tailTip];
  for (let i = 0; i < seq.length - 1; i++) {
    const p0 = seq[i];
    const p1 = seq[i + 1];
    const d = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
    const len = Math.hypot(d[0], d[1], d[2]);
    const g = new THREE.CylinderGeometry(tailR[i + 1], tailR[i], len * 1.12, 10, 1);
    g.rotateX(Math.atan2(d[2], d[1])); // lay the tube along its segment
    const mid: V3 = [
      (p0[0] + p1[0]) / 2,
      (p0[1] + p1[1]) / 2,
      (p0[2] + p1[2]) / 2,
    ];
    b.part(g, i % 2 ? SHELL_DARK : SHELL_LIGHT, { at: mid, bone: tail[i] });
  }

  // ---------- carapace: tan core, a belly strip, nine bands, two shields
  ell([0, 0.13, 0], [0.115, 0.08, 0.19], SHELL, hips, 18);
  ell([0, 0.075, 0], [0.1, 0.04, 0.165], BELLY, hips, 12);

  // Bands are open rings that follow the carapace section at their station.
  for (let i = 0; i < 9; i++) {
    const z = -0.085 + i * 0.0163;
    const k = Math.sqrt(1 - (z / 0.19) ** 2) * 1.06;
    const g = new THREE.CylinderGeometry(1, 1, 1, 24, 1, true, Math.PI * 0.3, Math.PI * 1.4);
    g.rotateX(Math.PI / 2); // ring axis runs along Z
    b.part(g, i % 2 ? SHELL_LIGHT : SHELL_DARK, {
      at: [0, 0.13, z],
      bone: hips,
      scale: [0.115 * k, 0.08 * k, 0.012],
    });
  }

  // Shoulder shield (front) and pelvic shield (rear).
  ell([0, 0.14, 0.13], [0.12, 0.08, 0.08], SHELL, hips, 18);
  ell([0, 0.12, -0.16], [0.105, 0.065, 0.065], SHELL, hips, 16);
  studs(
    [0, 0.14, 0.13],
    [0.12, 0.08, 0.08],
    [0.6, 0.95, 1.25],
    pis(0.22, 0.36, 0.5, 0.64, 0.78),
    0.0085,
    SHELL_LIGHT,
    hips,
  );
  studs(
    [0, 0.12, -0.16],
    [0.105, 0.065, 0.065],
    [0.7, 1.1],
    pis(1.15, 1.3, 1.5, 1.7, 1.85),
    0.008,
    SHELL_LIGHT,
    hips,
  );

  // ---------- head: neck bridge, bony head shield, long tapering snout
  ell([0, 0.15, 0.2], [0.07, 0.06, 0.05], SHELL, neck, 14);
  ell([0, 0.17, 0.25], [0.085, 0.055, 0.08], SHELL, head, 18);
  studs(
    [0, 0.17, 0.25],
    [0.085, 0.055, 0.08],
    [0.75, 1.05],
    pis(0.3, 0.5, 0.7, 1.3, 1.5, 1.7),
    0.0075,
    SHELL_LIGHT,
    head,
  );
  ell([0, 0.155, 0.32], [0.06, 0.05, 0.05], SHELL, head, 12);
  ell([0, 0.148, 0.37], [0.042, 0.038, 0.05], SHELL, head, 12);
  ell([0, 0.148, 0.415], [0.03, 0.024, 0.02], NOSE, head, 10);

  // Separate lower jaw on its own joint: a pale chin under the snout.
  ell([0, 0.118, 0.35], [0.036, 0.017, 0.07], BELLY, jaw, 12);

  // Small eyes with a glint, set on the sides of the head shield.
  for (const s of [1, -1]) {
    ball([0.075 * s, 0.178, 0.275], 0.017, EYE, head);
    ball([0.082 * s, 0.186, 0.283], 0.005, GLINT, head);
  }

  // Ears: dark outer shell with a pink inner face turned forward.
  for (const s of [1, -1]) {
    const bone = s > 0 ? earL : earR;
    ell([0.055 * s, 0.225, 0.2], [0.02, 0.028, 0.009], SHELL_DARK, bone, 10);
    ell([0.055 * s, 0.224, 0.209], [0.013, 0.02, 0.005], PINK, bone, 10);
  }

  return b.root;
}
