import * as THREE from "three";
import { createBuilder, patches, paint } from "../../../../src/index";

export const meta = {
  name: "Giraffe",
  description:
    "A stylized, rigged giraffe: patchwork-painted body, long jointed neck with mane, ossicones, separate jaw, four straight legs with hooves and a tufted tail.",
};

export default function build() {
  const b = createBuilder({ name: "giraffe" });

  const coat = patches("#efd7a0", ["#8f4f1c", "#a8662a", "#7a4018"], { size: 0.42, gap: 0.12, seed: 5 });
  const legPaint = paint((p) => (p.y < 1.1 ? "#e6cf9c" : coat));
  const SKIN = "#d9b06c";
  const DARK = "#4a2c16";
  const HOOF = "#2a2018";

  // ---- skeleton: pelvis, spine, neck, head, jaw, tail
  b.joint("pelvis", { at: [0, 2.65, -0.9], dir: [0, 0, 1] });
  const spinePath = [
    [0, 2.65, -0.9],
    [0, 2.7, -0.2],
    [0, 2.8, 0.5],
    [0, 2.85, 0.85],
  ];
  const spine = b.chain("spine", spinePath.map((p) => new THREE.Vector3(...p)), {
    parent: "pelvis",
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });
  const catmullPts = (pts: number[][]) => pts.map((p) => new THREE.Vector3(...p));

  // body
  b.sweep(spine, {
    radius: (t: number) => [
      0.28 + 0.07 * Math.sin(Math.PI * t),
      0.38 + 0.1 * Math.sin(Math.PI * t) + 0.07 * Math.exp(-(((t - 0.8) / 0.13) ** 2)),
    ],
    color: coat,
    sides: 10,
  });

  // neck
  const neck = b.chain(
    "neck",
    catmullPts([
      [0, 2.95, 0.7],
      [0, 3.5, 0.95],
      [0, 4.2, 1.25],
      [0, 4.85, 1.5],
    ]),
    { parent: "spine3", names: ["neck1", "neck2", "neck3", "head"], role: "neck" },
  );
  const neckS = b.sweep(neck, { radius: (t: number) => 0.28 - 0.14 * t, color: coat, sides: 9 });

  // mane
  for (let i = 0; i < 14; i++) {
    const t = 0.04 + i * 0.07;
    const pt = neckS.at(t, 0, 0);
    b.stick(new THREE.BoxGeometry(0.05, 0.1 - 0.02 * t, 0.15), DARK, pt, { embed: 0.3 });
  }

  // ---- head
  const o = new THREE.Vector3(0, 4.9, 1.5);
  const f = new THREE.Vector3(0, -0.45, 0.89).normalize();
  const up = new THREE.Vector3(0, 0.89, 0.45).normalize();
  const H = (u: number, v: number, w: number): [number, number, number] => [
    u,
    o.y + v * up.y + w * f.y,
    o.z + v * up.z + w * f.z,
  ];
  const hp = (g: THREE.BufferGeometry, c: string, at: [number, number, number], bone = "head") =>
    b.part(g, c, { at, dir: f, axis: "z", bone });

  hp(new THREE.BoxGeometry(0.26, 0.28, 0.42), SKIN, H(0, 0.08, 0.18));
  hp(new THREE.BoxGeometry(0.18, 0.17, 0.32), SKIN, H(0, 0.02, 0.5));
  hp(new THREE.BoxGeometry(0.19, 0.16, 0.05), "#6b4a3a", H(0, 0.0, 0.68));
  b.joint("jaw", { parent: "head", at: H(0, -0.05, 0.3), dir: f, up, role: "jaw" });
  hp(new THREE.BoxGeometry(0.14, 0.07, 0.36), "#c9a266", H(0, -0.09, 0.5), "jaw");
  hp(new THREE.BoxGeometry(0.15, 0.07, 0.04), "#6b4a3a", H(0, -0.09, 0.69), "jaw");
  for (const s of [1, -1]) {
    hp(new THREE.BoxGeometry(0.035, 0.03, 0.03), "#241810", H(s * 0.05, 0.04, 0.7));
    // eyes
    b.part(new THREE.SphereGeometry(0.05, 8, 6), "#150f0c", { at: H(s * 0.125, 0.14, 0.2), bone: "head" });
    b.part(new THREE.SphereGeometry(0.014, 5, 4), "#ffffff", { at: H(s * 0.162, 0.16, 0.22), bone: "head" });
    // ears
    b.part(new THREE.BoxGeometry(0.17, 0.03, 0.09), SKIN, {
      at: H(s * 0.22, 0.2, 0.0),
      rotation: [0, 0, s * 18],
      bone: "head",
    });
    b.part(new THREE.BoxGeometry(0.13, 0.03, 0.06), "#e0a58f", {
      at: H(s * 0.22, 0.2, 0.012),
      rotation: [0, 0, s * 18],
      bone: "head",
    });
    // ossicones
    const base = H(s * 0.07, 0.17, -0.02);
    const tip: [number, number, number] = [base[0] + s * 0.015, base[1] + 0.28, base[2] - 0.05];
    b.rod(base, tip, [0.035, 0.025], { color: SKIN, bone: "head", sides: 6 });
    b.part(new THREE.SphereGeometry(0.055, 7, 5), DARK, { at: tip, bone: "head", scale: [1, 1.1, 1] });
  }
  const mb = H(0, 0.17, 0.28);
  b.rod(mb, [mb[0], mb[1] + 0.08, mb[2] - 0.01], [0.03, 0.02], { color: SKIN, bone: "head", sides: 6 });

  // ---- legs
  for (const [S, s] of [["L", 1], ["R", -1]] as const) {
    const x = s * 0.26;
    // front
    const fl = b.chain(
      `legF${S}`,
      catmullPts([
        [x, 2.5, 0.65],
        [x, 1.3, 0.7],
        [x, 0.3, 0.72],
      ]),
      { parent: "spine3", names: [`shoulder${S}`, `knee${S}`, `fetlock${S}`], role: "leg" },
    );
    b.sweep(fl, { radius: [0.17, 0.1, 0.075, 0.07], color: legPaint, sides: 8 });
    b.part(new THREE.SphereGeometry(0.095, 7, 5), "#e0c58f", { at: [x, 1.3, 0.7], bone: `knee${S}` });
    b.rod([x, 0.3, 0.72], [x, 0.14, 0.74], 0.07, { color: "#e6cf9c", bone: `fetlock${S}`, sides: 7 });
    for (const d of [-1, 1])
      b.part(new THREE.BoxGeometry(0.075, 0.13, 0.17), HOOF, {
        at: [x + d * 0.04, 0.065, 0.76],
        bone: `fetlock${S}`,
      });

    // hind
    const hl = b.chain(
      `legH${S}`,
      catmullPts([
        [x, 2.5, -0.85],
        [x, 1.35, -0.97],
        [x, 0.3, -0.9],
      ]),
      { parent: "pelvis", names: [`hip${S}`, `hock${S}`, `fetlockH${S}`], role: "leg" },
    );
    b.sweep(hl, { radius: [0.18, 0.1, 0.075, 0.07], color: legPaint, sides: 8 });
    b.part(new THREE.SphereGeometry(0.095, 7, 5), "#e0c58f", { at: [x, 1.35, -0.99], bone: `hock${S}` });
    b.rod([x, 0.3, -0.9], [x, 0.14, -0.88], 0.07, { color: "#e6cf9c", bone: `fetlockH${S}`, sides: 7 });
    for (const d of [-1, 1])
      b.part(new THREE.BoxGeometry(0.075, 0.13, 0.17), HOOF, {
        at: [x + d * 0.04, 0.065, -0.86],
        bone: `fetlockH${S}`,
      });
  }

  // ---- tail
  const tail = b.chain(
    "tail",
    catmullPts([
      [0, 2.9, -1.05],
      [0, 2.5, -1.3],
      [0, 1.9, -1.38],
      [0, 1.4, -1.32],
    ]),
    { parent: "pelvis", names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  b.sweep(tail, { radius: [0.045, 0.03, 0.025], color: "#d7b878", sides: 6 });
  b.part(new THREE.SphereGeometry(0.07, 7, 6), DARK, {
    at: [0, 1.27, -1.32],
    scale: [1, 2.4, 1],
    bone: "tail3",
  });

  return b.root;
}
