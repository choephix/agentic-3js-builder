import * as THREE from "three";
import { createBuilder, frame, rng, catmull } from "../../../../src/index";

export const meta = {
  name: "Keel-billed toucan",
  description: "A keel-billed toucan with a rainbow bill perched on a mossy branch beside a pink orchid.",
};

const BLACK = "#15120e";
const LIME = "#8ee02a";
const SKY = "#4fb3ff";
const ORANGE = "#ff8a1c";
const RED = "#e3202c";
const YELLOW = "#ffe14d";
const BLUE = "#1e5bff";
const MOSS = "#4f8a2b";
const MOSS_DARK = "#2f5e1c";
const BARK = "#5a4029";
const PINK = "#ff6fb5";
const PINK_DEEP = "#d known";

export default function build() {
  const b = createBuilder({ name: "keel-billed-toucan" });
  const rand = rng(11);

  // ---------- plain scenery: stump, branch, moss, orchid ----------
  const plainMat = (color: string) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.04 });

  const addPlain = (geo: THREE.BufferGeometry, color: string, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(geo, plainMat(color));
    m.position.set(x, y, z);
    b.root.add(m);
    return m;
  };

  // Broken stump standing on the floor, touching y = 0.
  addPlain(new THREE.CylinderGeometry(0.11, 0.13, 0.6, 9), BARK, 0, 0.3, -0.5);

  // Branch resting on the stump, running forward along +Z.
  const branchGeo = new THREE.CylinderGeometry(0.045, 0.035, 1.2, 8);
  branchGeo.rotateX(Math.PI / 2);
  addPlain(branchGeo, BARK, 0, 0.6, 0.02);

  // Moss clumps on the branch and the stump top.
  for (let i = 0; i < 18; i++) {
    const x = (rand() - 0.5) * 0.14;
    const z = -0.2 + rand() * 0.8;
    const s = 0.03 + rand() * 0.025;
    const m = addPlain(new THREE.SphereGeometry(s, 7, 5), i % 3 === 0 ? MOSS_DARK : MOSS, x, 0.64, z);
    m.scale.set(1.2, 0.5, 1.0);
  }
  for (let i = 0; i < 6; i++) {
    const a = rand() * Math.PI * 2;
    const m = addPlain(new THREE.SphereGeometry(0.05 + rand() * 0.02, 7, 5), MOSS, Math.cos(a) * 0.1, 0.58, -0.5 + Math.sin(a) * 0.1);
    m.scale.set(1.0, 0.45, 1.0);
  }

  // Pink orchid growing from the branch beside the bird.
  const orchidX = -0.2;
  const orchidZ = 0.3;
  addPlain(new THREE.CylinderGeometry(0.006, 0.006, 0.18, 6), MOSS_DARK, orchidX, 0.74, orchidZ);
  const orchidHead = [orchidX, 0.84, orchidZ] as const;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + rand() * 0.2;
    const petal = addPlain(new THREE.SphereGeometry(0.035, 8, 6), PINK, orchidHead[0] + Math.cos(a) * 0.03, orchidHead[1], orchidHead[2] + Math.sin(a) * 0.03);
    petal.scale.set(1.0, 0.35, 1.6);
    petal.rotation.y = -a;
  }
  // Lip of the orchid.
  const lip = addPlain(new THREE.SphereGeometry(0.02, 8, 6), PINK_DEEP, orchidHead[0], orchidHead[1] - 0.01, orchidHead[2] + 0.03);
  lip.scale.set(1.0, 0.5, 1.4);

  // ---------- skeleton ----------
  b.joint("hips", { at: [0, 0.8, -0.05] });

  // Body: a compact, tilted torso from hips up to the shoulders.
  const spinePath = catmull([
    [0, 0.8, -0.12],
    [0, 0.86, 0.0],
    [0, 0.9, 0.12],
  ]);
  b.chain("spine", spinePath);
  b.sweep(spinePath, { radius: [0.085, 0.095, 0.08], color: BLACK, segments: 14 });

  // Neck and head.
  const neckPath = catmull([
    [0, 0.9, 0.12],
    [0, 0.95, 0.19],
    [0, 0.99, 0.23],
  ]);
  b.chain("neck", neckPath);
  b.sweep(neckPath, { radius: [0.06, 0.068], color: BLACK, segments: 12 });

  b.joint("head", { at: [0, 0.99, 0.23] });
  const headFrame = frame([0, 0.99, 0.24], [0, 0, 1]);
  b.stick(new THREE.SphereGeometry(0.07, 16, 12), BLACK, headFrame);

  // Eyes: lime-green skin rings with dark eyes on each side of the head.
  for (const side of [1, -1]) {
    const ex = side * 0.062;
    const eyeAxis = frame([ex, 1.0, 0.25], [side, 0, 0]);
    b.stick(new THREE.TorusGeometry(0.03, 0.011, 6, 14), LIME, eyeAxis);
    b.stick(new THREE.SphereGeometry(0.014, 8, 6), "#0a0a0a", frame([side * 0.07, 1.005, 0.26], [side, 0, 0.2]));
  }

  // Lemon-yellow bib on the upper chest.
  const bibGeo = new THREE.SphereGeometry(0.05, 12, 8);
  bibGeo.scale(1, 0.8, 0.5);
  b.stick(bibGeo, YELLOW, frame([0, 0.9, 0.14], [0, -0.3, 1]));

  // ---------- rainbow bill: upper and lower mandibles on a hinge ----------
  b.joint("jaw", { at: [0, 0.96, 0.27] });

  const beakPoint = (s: number, lower: boolean): [number, number, number] => [
    0,
    1.0 - 0.07 * s - (lower ? 0.035 : 0),
    0.27 + 0.3 * s,
  ];

  const beakSegment = (
    s0: number,
    s1: number,
    color: string,
    rTop: number,
    rBot: number,
    lower: boolean,
  ) => {
    const p0 = beakPoint(s0, lower);
    const p1 = beakPoint(s1, lower);
    const mid: [number, number, number] = [
      (p0[0] + p1[0]) / 2,
      (p0[1] + p1[1]) / 2,
      (p0[2] + p1[2]) / 2,
    ];
    const dir: [number, number, number] = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
    const len = Math.hypot(dir[0], dir[1], dir[2]);
    const g = new THREE.CylinderGeometry(rTop, rBot, len, 10);
    g.scale(1, 0.85, 1);
    b.stick(g, color, frame(mid, dir));
  };

  const bands: Array<[number, number, string]> = [
    [0.0, 0.2, LIME],
    [0.2, 0.45, SKY],
    [0.45, 0.7, ORANGE],
    [0.7, 0.85, LIME],
    [0.85, 1.0, RED],
  ];
  const radii: Array<[number, number]> = [
    [0.036, 0.035],
    [0.035, 0.033],
    [0.033, 0.03],
    [0.03, 0.026],
    [0.026, 0.018],
  ];

  bands.forEach(([s0, s1, color], i) => {
    beakSegment(s0, s1, color, radii[i][0], radii[i][1], false);
  });
  bands.forEach(([s0, s1, color], i) => {
    beakSegment(s0, s1, color, radii[i][0] * 0.8, radii[i][1] * 0.8, true);
  });

  // Dark gape line where the mandibles meet.
  const gapeGeo = new THREE.BoxGeometry(0.012, 0.008, 0.29);
  b.stick(gapeGeo, BLACK, frame([0, 0.975, 0.42], [0, 0, 1]));

  // ---------- legs and feet ----------
  for (const side of [1, -1]) {
    const x = side * 0.06;
    const legPath = catmull([
      [x, 0.78, 0.0],
      [x * 1.05, 0.72, 0.04],
      [x, 0.665, 0.08],
    ]);
    b.chain(side > 0 ? "legL" : "legR", legPath);
    b.sweep(legPath, { radius: [0.013, 0.011], color: BLUE, segments: 8 });

    const ankle: [number, number, number] = [x, 0.66, 0.08];
    const toeDirs: Array<[number, number, number]> = [
      [0.45 * side, -0.1, 1],
      [0, -0.1, 1],
      [-0.45 * side, -0.1, 1],
      [0, -0.1, -1],
    ];
    for (const d of toeDirs) {
      const toeGeo = new THREE.CylinderGeometry(0.011, 0.008, 0.05, 6);
      b.stick(toeGeo, BLUE, frame(ankle, d));
    }
  }

  // ---------- tail with scarlet patch underneath ----------
  const tailPath = catmull([
    [0, 0.78, -0.1],
    [0, 0.72, -0.26],
    [0, 0.66, -0.4],
  ]);
  b.chain("tail", tailPath);
  b.sweep(tailPath, { radius: [0.035, 0.028, 0.02], color: BLACK, segments: 8 });

  const patchGeo = new THREE.SphereGeometry(0.04, 10, 6);
  patchGeo.scale(1, 0.3, 1.5);
  b.stick(patchGeo, RED, frame([0, 0.685, -0.22], [0, -1, 0]));

  return b.root;
}
