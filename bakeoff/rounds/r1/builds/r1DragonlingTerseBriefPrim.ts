import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Baby Dragon",
  description: "Chubby green hatchling dragon with cream belly, little wings, horns and a curled tail, rigged on a named skeleton.",
};

export default function build() {
  const b = createBuilder({ name: "babyDragon" });
  const GREEN = "#5fb860", DARK = "#3e8a4a", CREAM = "#f3e3a8", ORANGE = "#f0903a", HORN = "#f6efd8", EYE = "#ffcf3a", BLACK = "#1b1b24", PINK = "#f08aa0";

  const J: Record<string, any> = {};
  const joint = (name: string, at: number[], parent?: string, role?: string) => {
    const o: any = { at };
    if (parent) o.parent = J[parent];
    if (role) o.role = role;
    J[name] = b.joint(name, o);
    return J[name];
  };

  joint("hips", [0, 0.27, -0.02], undefined, "spine");
  joint("spine", [0, 0.3, 0.1], "hips", "spine");
  joint("chest", [0, 0.34, 0.2], "spine", "spine");
  joint("neck", [0, 0.42, 0.27], "chest", "neck");
  joint("head", [0, 0.5, 0.31], "neck", "head");
  joint("jaw", [0, 0.5, 0.4], "head", "jaw");
  let prev = "hips";
  for (let i = 1; i <= 5; i++) {
    joint("tail" + i, [0, 0.24 - i * 0.015, -0.1 - i * 0.1], prev, "tail");
    prev = "tail" + i;
  }
  for (const [s, x] of [["L", 1], ["R", -1]] as const) {
    joint("shoulder" + s, [x * 0.13, 0.28, 0.2], "chest", "arm");
    joint("hand" + s, [x * 0.16, 0.12, 0.26], "shoulder" + s, "arm");
    joint("hip" + s, [x * 0.13, 0.2, -0.03], "hips", "leg");
    joint("knee" + s, [x * 0.14, 0.12, 0.02], "hip" + s, "leg");
    joint("foot" + s, [x * 0.14, 0.04, 0.05], "knee" + s, "leg");
    joint("wingRoot" + s, [x * 0.1, 0.4, 0.08], "spine", "wing");
    joint("wingTip" + s, [x * 0.38, 0.62, -0.05], "wingRoot" + s, "wing");
  }

  const P = (geo: THREE.BufferGeometry, color: string, at: number[], bone: string, o: any = {}) =>
    b.part(geo, color, { at, bone: J[bone], ...o });
  const sph = (r: number, w = 10, h = 8) => new THREE.SphereGeometry(r, w, h);
  const cone = (r: number, h: number, s = 6) => new THREE.ConeGeometry(r, h, s);
  const rot = (x: number, y: number, z: number) => ({ rotation: [x, y, z] });

  // body
  P(sph(1, 12, 10), GREEN, [0, 0.28, 0.07], "spine", { scale: [0.2, 0.19, 0.27] });
  P(sph(1, 12, 10), CREAM, [0, 0.24, 0.14], "chest", { scale: [0.15, 0.16, 0.2] });
  for (let i = 0; i < 5; i++)
    P(new THREE.BoxGeometry(0.15 - i * 0.005, 0.012, 0.025), "#e6cf8a", [0, 0.16 + i * 0.002, 0.28 - i * 0.055], "chest");
  // neck
  P(new THREE.CylinderGeometry(0.07, 0.09, 0.14, 8), GREEN, [0, 0.4, 0.26], "neck", rot(0.5, 0, 0));
  // head
  P(sph(1, 12, 10), GREEN, [0, 0.52, 0.33], "head", { scale: [0.17, 0.15, 0.16] });
  P(sph(1, 10, 8), GREEN, [0, 0.49, 0.43], "head", { scale: [0.1, 0.07, 0.09] });
  P(sph(1, 8, 6), DARK, [0.035, 0.51, 0.5], "head", { scale: [0.012, 0.012, 0.012] });
  P(sph(1, 8, 6), DARK, [-0.035, 0.51, 0.5], "head", { scale: [0.012, 0.012, 0.012] });
  P(sph(1, 10, 8), CREAM, [0, 0.43, 0.42], "jaw", { scale: [0.085, 0.03, 0.09] });
  P(sph(1, 8, 6), PINK, [0, 0.44, 0.42], "jaw", { scale: [0.05, 0.012, 0.06] });
  // eyes, cheeks, brows
  for (const x of [1, -1]) {
    const bn = "head";
    P(sph(0.047, 10, 8), "#ffffff", [x * 0.085, 0.57, 0.43], bn);
    P(sph(0.034, 10, 8), EYE, [x * 0.09, 0.57, 0.462], bn);
    P(sph(0.019, 8, 6), BLACK, [x * 0.092, 0.57, 0.48], bn);
    P(sph(0.007, 6, 4), "#ffffff", [x * 0.098, 0.58, 0.487], bn);
    P(new THREE.BoxGeometry(0.07, 0.014, 0.03), DARK, [x * 0.085, 0.62, 0.43], bn, rot(0, 0, -x * 0.25));
    P(sph(0.025, 8, 6), PINK, [x * 0.12, 0.48, 0.4], bn, { scale: [0.6, 0.8, 0.4] });
    // horns
    P(cone(0.03, 0.15, 6), HORN, [x * 0.08, 0.67, 0.27], "head", rot(-0.5, 0, -x * 0.35));
    // ears / frills
    P(cone(0.04, 0.12, 4), ORANGE, [x * 0.16, 0.54, 0.26], "head", rot(0, 0, -x * 1.2));
  }
  // nostrils & teeth
  P(sph(0.011, 6, 4), BLACK, [0.026, 0.505, 0.5], "head");
  P(sph(0.011, 6, 4), BLACK, [-0.026, 0.505, 0.5], "head");
  for (const x of [0.04, -0.04]) P(cone(0.01, 0.025, 4), "#ffffff", [x, 0.452, 0.48], "jaw", rot(Math.PI, 0, 0));
  // head crest spikes
  for (let i = 0; i < 3; i++) P(cone(0.022 - i * 0.003, 0.07, 4), ORANGE, [0, 0.66 - i * 0.02, 0.23 - i * 0.07], "head", rot(-0.4 - i * 0.2, 0, 0));
  // back spikes
  const bones = ["chest", "spine", "spine", "hips"];
  for (let i = 0; i < 4; i++)
    P(cone(0.03 - i * 0.003, 0.07, 4), ORANGE, [0, 0.46 - i * 0.02, 0.2 - i * 0.1], bones[i], rot(-0.3, 0, 0));

  // tail
  const tr = [0.1, 0.085, 0.07, 0.055, 0.04];
  for (let i = 1; i <= 5; i++) {
    const y = 0.24 - i * 0.015;
    const z = -0.05 - i * 0.1;
    P(sph(1, 8, 6), GREEN, [0, y, z], "tail" + i, { scale: [tr[i - 1], tr[i - 1], 0.085] });
    if (i < 5) P(cone(0.025 - i * 0.003, 0.06, 4), ORANGE, [0, y + tr[i - 1], z], "tail" + i, rot(-0.2, 0, 0));
  }
  P(new THREE.OctahedronGeometry(0.06), ORANGE, [0, 0.165, -0.6], "tail5", { scale: [0.5, 0.8, 1] });

  for (const [s, x] of [["L", 1], ["R", -1]] as const) {
    // legs
    P(sph(1, 8, 6), GREEN, [x * 0.14, 0.17, 0.0], "hip" + s, { scale: [0.08, 0.1, 0.1] });
    P(new THREE.CylinderGeometry(0.045, 0.05, 0.1, 7), GREEN, [x * 0.14, 0.09, 0.03], "knee" + s);
    P(sph(1, 8, 6), GREEN, [x * 0.14, 0.03, 0.07], "foot" + s, { scale: [0.06, 0.035, 0.09] });
    for (const t of [-1, 0, 1])
      P(cone(0.012, 0.035, 4), HORN, [x * 0.14 + t * 0.03, 0.025, 0.15], "foot" + s, rot(Math.PI / 2, 0, 0));
    // arms
    P(new THREE.CylinderGeometry(0.035, 0.04, 0.16, 7), GREEN, [x * 0.15, 0.2, 0.25], "shoulder" + s, rot(0.2, 0, -x * 0.25));
    P(sph(1, 8, 6), GREEN, [x * 0.17, 0.12, 0.28], "hand" + s, { scale: [0.045, 0.035, 0.05] });
    for (const t of [-1, 0, 1])
      P(cone(0.01, 0.03, 4), HORN, [x * 0.17 + t * 0.025, 0.11, 0.33], "hand" + s, rot(Math.PI / 2, 0, 0));
    // wings
    P(new THREE.CylinderGeometry(0.014, 0.018, 0.36, 5), DARK, [x * 0.24, 0.52, 0.03], "wingRoot" + s, rot(0, 0, -x * 0.9));
    P(new THREE.CylinderGeometry(0.01, 0.014, 0.3, 5), DARK, [x * 0.3, 0.44, -0.12], "wingRoot" + s, rot(0.9, 0, -x * 1.3));
    P(new THREE.BoxGeometry(0.28, 0.008, 0.2), ORANGE, [x * 0.26, 0.46, -0.04], "wingRoot" + s, rot(0.1, x * 0.2, -x * 0.5));
    P(cone(0.02, 0.07, 4), HORN, [x * 0.4, 0.66, 0.03], "wingTip" + s, rot(0, 0, -x * 0.9));
  }

  return b.root;
}
