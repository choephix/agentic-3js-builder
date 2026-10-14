import * as THREE from "three";

export const meta = {
  name: "Keel-billed Toucan on Mossy Branch",
  description:
    "A glossy black keel-billed toucan with a rainbow beak, perched on a mossy branch beside a single pink orchid.",
};

type V3 = [number, number, number];

function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function build(): THREE.Object3D {
  const rand = seeded(20240611);

  const std = (color: number, roughness = 0.6, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });

  const M = {
    bark: std(0x6e4b2f, 0.95),
    moss: std(0x5fa035, 1),
    mossDeep: std(0x2e6b2a, 1),
    black: std(0x0a0a0d, 0.18, 0.1),
    yellow: std(0xfff04a, 0.4),
    skin: std(0xb4ec3c, 0.45),
    lime: std(0x7fd62a, 0.4),
    blue: std(0x4cc3ff, 0.4),
    orange: std(0xff8a1f, 0.4),
    red: std(0xd7142a, 0.35),
    feet: std(0x1f6fff, 0.4),
    pink: std(0xff7fc2, 0.5),
    magenta: std(0xd81b8c, 0.5),
    stem: std(0x4d8a3a, 0.7),
    white: std(0xffffff, 0.2),
    leaf: std(0x3f8f36, 0.6),
  };

  const add = (
    parent: THREE.Object3D,
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    p: V3,
    r: V3 = [0, 0, 0],
    s: V3 = [1, 1, 1],
  ): THREE.Mesh => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(p[0], p[1], p[2]);
    m.rotation.set(r[0], r[1], r[2]);
    m.scale.set(s[0], s[1], s[2]);
    parent.add(m);
    return m;
  };

  const root = new THREE.Group();
  const branchG = new THREE.Group();
  const toucanG = new THREE.Group();
  const orchidG = new THREE.Group();
  root.add(branchG, toucanG, orchidG);

  // ---------- Branch and support ----------
  add(
    branchG,
    new THREE.CylinderGeometry(0.045, 0.06, 1.0, 8),
    M.bark,
    [0, 0.3, 0],
    [0, 0, Math.PI / 2 + 0.04],
  );
  // Stump holding the branch up off the ground
  add(branchG, new THREE.CylinderGeometry(0.07, 0.085, 0.32, 8), M.bark, [-0.42, 0.16, 0]);
  // Forked twig on the stump
  add(branchG, new THREE.CylinderGeometry(0.018, 0.026, 0.14, 6), M.bark, [-0.46, 0.36, 0.02], [0.3, 0, -0.5]);
  // Moss mound at the base of the stump (sinks slightly into the floor)
  add(branchG, new THREE.SphereGeometry(1, 12, 8), M.mossDeep, [-0.42, -0.004, 0.02], [0, 0, 0], [0.16, 0.035, 0.13]);

  // Moss patches along the branch (upper half)
  for (let i = 0; i < 18; i++) {
    const x = rand() * 0.96 - 0.48;
    if (Math.abs(x - 0.34) < 0.1) continue;
    const a = (rand() * 2 - 1) * 1.1;
    const y = 0.3 + 0.047 * Math.cos(a);
    const z = 0.047 * Math.sin(a);
    const sx = 0.03 + rand() * 0.03;
    add(
      branchG,
      new THREE.IcosahedronGeometry(1, 1),
      rand() > 0.4 ? M.moss : M.mossDeep,
      [x, y, z],
      [a, 0, 0],
      [sx, 0.013, sx * 0.8],
    );
  }
  // Moss on the stump
  for (let i = 0; i < 4; i++) {
    const a = rand() * Math.PI * 2;
    add(
      branchG,
      new THREE.IcosahedronGeometry(1, 1),
      M.moss,
      [-0.42 + Math.cos(a) * 0.075, 0.08 + rand() * 0.16, Math.sin(a) * 0.075],
      [0, -a, 0],
      [0.035, 0.012, 0.03],
    );
  }

  // ---------- Toucan ----------
  // Body
  add(toucanG, new THREE.SphereGeometry(1, 20, 14), M.black, [0, 0.49, 0], [0, 0, 0], [0.1, 0.11, 0.17]);

  // Folded wings along the flanks
  add(toucanG, new THREE.SphereGeometry(1, 12, 8), M.black, [0.095, 0.48, -0.03], [0, 0, -0.12], [0.03, 0.085, 0.14]);
  add(toucanG, new THREE.SphereGeometry(1, 12, 8), M.black, [-0.095, 0.48, -0.03], [0, 0, 0.12], [0.03, 0.085, 0.14]);

  // Tail, angled down and back, with scarlet undertail patch
  const tail = add(toucanG, new THREE.BoxGeometry(0.07, 0.018, 0.22), M.black, [0, 0.45, -0.3], [-0.25, 0, 0]);
  add(tail, new THREE.BoxGeometry(0.05, 0.008, 0.06), M.red, [0, -0.011, 0.06]);

  // Lemon-yellow bib
  add(toucanG, new THREE.SphereGeometry(0.075, 14, 10), M.yellow, [0, 0.53, 0.13], [0, 0, 0], [1, 0.85, 0.7]);

  // Head
  add(toucanG, new THREE.SphereGeometry(0.085, 20, 14), M.black, [0, 0.61, 0.09]);

  // Rainbow beak: lime -> sky blue -> orange -> cherry-red tip
  const seg = (z0: number, z1: number, rBack: number, rFront: number, mat: THREE.Material) => {
    add(
      toucanG,
      new THREE.CylinderGeometry(rFront, rBack, z1 - z0, 12, 1),
      mat,
      [0, 0.605, (z0 + z1) / 2],
      [Math.PI / 2, 0, 0],
      [0.8, 1, 1.15],
    );
  };
  seg(0.16, 0.3, 0.085, 0.078, M.lime);
  seg(0.3, 0.36, 0.078, 0.07, M.blue);
  seg(0.36, 0.42, 0.07, 0.058, M.orange);
  seg(0.42, 0.46, 0.058, 0.03, M.red);
  // Dark keel line along the top of the beak
  add(toucanG, new THREE.BoxGeometry(0.012, 0.012, 0.2), M.black, [0, 0.66, 0.3]);
  // Nostrils
  for (const s of [-1, 1]) {
    add(toucanG, new THREE.SphereGeometry(0.009, 8, 6), M.black, [s * 0.025, 0.648, 0.2]);
  }

  // Eyes with lime-green skin rings
  for (const s of [-1, 1]) {
    const cx = s * 0.078;
    add(toucanG, new THREE.TorusGeometry(0.03, 0.011, 8, 14), M.skin, [cx, 0.625, 0.135], [0, Math.PI / 2, 0]);
    add(toucanG, new THREE.SphereGeometry(0.02, 10, 8), M.black, [cx + s * 0.004, 0.625, 0.138]);
    add(toucanG, new THREE.SphereGeometry(0.006, 6, 4), M.white, [cx + s * 0.012, 0.634, 0.152]);
  }

  // Legs and bright blue feet gripping the branch
  for (const s of [-1, 1]) {
    const lx = s * 0.045;
    add(toucanG, new THREE.CylinderGeometry(0.012, 0.012, 0.06, 6), M.feet, [lx, 0.375, 0.02]);
    add(toucanG, new THREE.BoxGeometry(0.008, 0.01, 0.05), M.feet, [lx - 0.008, 0.35, 0.035]);
    add(toucanG, new THREE.BoxGeometry(0.008, 0.01, 0.05), M.feet, [lx + 0.008, 0.35, 0.035]);
    add(toucanG, new THREE.BoxGeometry(0.02, 0.01, 0.012), M.feet, [lx, 0.35, -0.02]);
  }

  // ---------- Orchid ----------
  // Leaves at the base
  add(orchidG, new THREE.SphereGeometry(1, 10, 6), M.leaf, [0.3, 0.36, 0.08], [0.3, 0, 0.5], [0.05, 0.006, 0.02]);
  add(orchidG, new THREE.SphereGeometry(1, 10, 6), M.leaf, [0.37, 0.36, 0.09], [0.2, 0, -0.4], [0.045, 0.006, 0.018]);

  // Curving stem
  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.34, 0.34, 0.03),
    new THREE.Vector3(0.345, 0.42, 0.045),
    new THREE.Vector3(0.36, 0.5, 0.05),
    new THREE.Vector3(0.38, 0.56, 0.03),
  ]);
  orchidG.add(new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 20, 0.005, 5, false), M.stem));

  // Buds
  add(orchidG, new THREE.SphereGeometry(1, 8, 6), M.pink, [0.352, 0.47, 0.046], [0, 0, 0.2], [0.012, 0.018, 0.012]);
  add(orchidG, new THREE.SphereGeometry(1, 8, 6), M.pink, [0.368, 0.52, 0.055], [0, 0, -0.2], [0.01, 0.015, 0.01]);

  // Bloom
  const flower = new THREE.Group();
  flower.position.set(0.38, 0.58, 0.03);
  flower.rotation.set(-0.5, 0.3, 0);
  orchidG.add(flower);

  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5 + 0.3;
    const big = i === 0 ? 1.2 : 1.0;
    add(
      flower,
      new THREE.SphereGeometry(1, 12, 8),
      M.pink,
      [Math.cos(a) * 0.034, 0, Math.sin(a) * 0.034],
      [0, -a, 0],
      [0.04 * big, 0.007, 0.026 * big],
    );
  }
  // Magenta lip
  add(flower, new THREE.SphereGeometry(1, 10, 8), M.magenta, [0, -0.004, 0.028], [0, 0, 0], [0.018, 0.008, 0.024]);
  // Column and centre
  add(flower, new THREE.SphereGeometry(1, 8, 6), M.yellow, [0, 0.004, 0], [0, 0, 0], [0.008, 0.008, 0.008]);

  return root;
}
