import * as THREE from "three";

export const meta = {
  name: "Unicorn Foal",
  description:
    "A pearl-white unicorn foal with a spiral gold horn, a rainbow mane and tail, pink blush and a gold star on its flank. About a metre at the withers.",
};

type V3 = [number, number, number];

// ---- proportions (metres) ----
const NECK_LEN = 0.34;
const NECK_TILT = 0.8; // neck leans forward from vertical
const HEAD_TILT = 0.1; // head's tilt in the world (muzzle a touch down)
const FLANK_Y = 0.72; // torso axis height
const FLANK_Z = -0.02; // flank decal centre along Z
const FLANK_R = 0.205; // radius for decals sitting just off the 0.19 torso

const COLOR = {
  coat: 0xfcf7ff,
  muzzle: 0xffc2d4,
  blush: 0xff98bd,
  ink: 0x2b2146,
  white: 0xffffff,
  hoof: 0xf2c46a,
  horn: 0xffd86b,
  hornRidge: 0xff8fc4,
  star: 0xffd25a,
  pink: 0xff8fc4,
  lilac: 0xb99cff,
  sky: 0x8fd9ff,
  mint: 0x9ff3d3,
  butter: 0xffe27a,
  peach: 0xffb598,
};

const RAINBOW = [
  COLOR.pink,
  COLOR.lilac,
  COLOR.sky,
  COLOR.mint,
  COLOR.butter,
  COLOR.peach,
];

// Small seeded generator (mulberry32) so every build is identical.
function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// One shared MeshStandardMaterial per colour.
const matCache = new Map<number, THREE.MeshStandardMaterial>();
function mat(color: number): THREE.MeshStandardMaterial {
  let m = matCache.get(color);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.5,
      metalness: 0.05,
    });
    matCache.set(color, m);
  }
  return m;
}

function part(
  parent: THREE.Object3D,
  geo: THREE.BufferGeometry,
  color: number,
  pos: V3 = [0, 0, 0],
  rot: V3 = [0, 0, 0],
  scale: V3 = [1, 1, 1],
): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat(color));
  m.position.set(pos[0], pos[1], pos[2]);
  m.rotation.set(rot[0], rot[1], rot[2]);
  m.scale.set(scale[0], scale[1], scale[2]);
  parent.add(m);
  return m;
}

// A flowing hair strand: a thin tube through control points.
function strand(
  parent: THREE.Object3D,
  pts: V3[],
  radius: number,
  color: number,
): void {
  const curve = new THREE.CatmullRomCurve3(
    pts.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  );
  part(parent, new THREE.TubeGeometry(curve, 12, radius, 5, false), color);
}

export default function createUnicornFoal(): THREE.Object3D {
  const rand = makeRng(7);
  const root = new THREE.Group();
  root.name = "unicorn-foal";

  // ---------- Torso: capsule along Z, with shoulder and haunch knobs ----------
  const torso = new THREE.CapsuleGeometry(0.19, 0.56, 4, 12);
  torso.rotateX(Math.PI / 2);
  part(root, torso, COLOR.coat, [0, FLANK_Y, 0]);
  for (const s of [1, -1]) {
    part(
      root,
      new THREE.SphereGeometry(0.135, 12, 9),
      COLOR.coat,
      [s * 0.1, 0.76, 0.2],
      [0, 0, 0],
      [0.8, 1, 1],
    );
    part(
      root,
      new THREE.SphereGeometry(0.14, 12, 9),
      COLOR.coat,
      [s * 0.1, 0.74, -0.2],
      [0, 0, 0],
      [0.8, 1, 1.1],
    );
  }

  // ---------- Legs: tapered cannon, fetlock knob, gold hoof ----------
  const legGeo = new THREE.CylinderGeometry(0.056, 0.038, 0.54, 9);
  const fetlockGeo = new THREE.SphereGeometry(0.042, 9, 7);
  const hoofGeo = new THREE.CylinderGeometry(0.042, 0.05, 0.08, 9);
  const legSpots: [number, number][] = [
    [0.12, 0.22],
    [-0.12, 0.22],
    [0.12, -0.2],
    [-0.12, -0.2],
  ];
  for (const [x, z] of legSpots) {
    part(root, legGeo, COLOR.coat, [x, 0.34, z]);
    part(root, fetlockGeo, COLOR.coat, [x, 0.12, z], [0, 0, 0], [1, 0.9, 1]);
    part(root, hoofGeo, COLOR.hoof, [x, 0.04, z]);
  }

  // ---------- Tail: rainbow strands falling from the croup ----------
  const tail = new THREE.Group();
  tail.position.set(0, 0.86, -0.4);
  root.add(tail);
  part(tail, new THREE.SphereGeometry(0.05, 10, 8), COLOR.coat);
  for (let i = 0; i < 16; i++) {
    const sx = (i / 15 - 0.5) * 0.09;
    const sway = Math.sin(i * 1.3) * 0.02;
    const j = () => (rand() - 0.5) * 0.024;
    strand(
      tail,
      [
        [sx * 0.2, 0.0, 0.02],
        [sx, -0.08 + j(), -0.05],
        [sx * 1.6 + sway, -0.2 + j(), -0.12],
        [sx * 2.0 + sway * 1.5, -0.34 + j(), -0.17],
        [sx * 2.2 + sway * 2, -0.46 + j(), -0.19],
      ],
      0.02,
      RAINBOW[(i * 5) % RAINBOW.length],
    );
  }

  // ---------- Neck (tilted group) with a rainbow mane along its crest ----------
  const neck = new THREE.Group();
  neck.position.set(0, 0.8, 0.28);
  neck.rotation.x = NECK_TILT;
  root.add(neck);
  part(
    neck,
    new THREE.CylinderGeometry(0.1, 0.14, NECK_LEN, 12),
    COLOR.coat,
    [0, NECK_LEN / 2, 0],
  );
  const neckRadius = (h: number) => 0.14 - 0.04 * (h / NECK_LEN);
  for (let i = 0; i < 20; i++) {
    const h = 0.03 + (i / 19) * (NECK_LEN - 0.05);
    const r = neckRadius(h);
    const sx = (rand() - 0.5) * 0.11;
    const drop = 0.1 + rand() * 0.05;
    strand(
      neck,
      [
        [sx * 0.2, h + 0.03, -(r - 0.012)],
        [sx * 0.7, h + 0.005, -(r + 0.05)],
        [sx * 1.1, h - 0.05, -(r + 0.085)],
        [sx * 1.3, h - drop, -(r + 0.06)],
      ],
      0.016,
      RAINBOW[i % RAINBOW.length],
    );
  }

  // ---------- Head ----------
  const head = new THREE.Group();
  head.position.set(0, NECK_LEN, 0);
  head.rotation.x = HEAD_TILT - NECK_TILT;
  neck.add(head);

  // Skull, jaw, pink muzzle
  part(
    head,
    new THREE.SphereGeometry(0.11, 18, 14),
    COLOR.coat,
    [0, 0.05, 0.04],
    [0, 0, 0],
    [0.9, 0.95, 1.2],
  );
  part(
    head,
    new THREE.SphereGeometry(0.085, 12, 9),
    COLOR.coat,
    [0, -0.045, 0.1],
    [0, 0, 0],
    [0.85, 0.7, 1.35],
  );
  part(
    head,
    new THREE.SphereGeometry(0.075, 12, 9),
    COLOR.muzzle,
    [0, -0.02, 0.2],
    [0, 0, 0],
    [0.95, 0.95, 1.5],
  );

  // Eyes, glints, lash arcs, cheek blush, nostrils
  for (const s of [1, -1]) {
    part(head, new THREE.SphereGeometry(0.03, 12, 10), COLOR.ink, [
      s * 0.09,
      0.06,
      0.06,
    ]);
    part(head, new THREE.SphereGeometry(0.0095, 6, 5), COLOR.white, [
      s * 0.112,
      0.076,
      0.08,
    ]);
    part(
      head,
      new THREE.TorusGeometry(0.04, 0.0068, 5, 14, Math.PI),
      COLOR.ink,
      [s * 0.09, 0.06, 0.06],
      [0, Math.PI / 2, 0],
    );
    part(
      head,
      new THREE.SphereGeometry(0.03, 10, 8),
      COLOR.blush,
      [s * 0.078, -0.012, 0.13],
      [0, 0, 0],
      [0.35, 0.8, 1.3],
    );
    part(head, new THREE.SphereGeometry(0.011, 6, 5), COLOR.ink, [
      s * 0.03,
      0.0,
      0.3,
    ]);
  }

  // Ears: coat cones with pink inners, fanned out and back
  for (const s of [1, -1]) {
    const ear = new THREE.Group();
    ear.position.set(s * 0.06, 0.13, -0.03);
    ear.rotation.set(-0.22, 0, -s * 0.32);
    head.add(ear);
    part(ear, new THREE.ConeGeometry(0.04, 0.16, 10), COLOR.coat, [0, 0.08, 0]);
    part(ear, new THREE.ConeGeometry(0.022, 0.1, 8), COLOR.blush, [
      0,
      0.05,
      0.018,
    ]);
  }

  // Forelock: rainbow tufts falling over the forehead
  const forelockSides = [-1, -0.6, 0.6, 1];
  for (let i = 0; i < forelockSides.length; i++) {
    const s = forelockSides[i];
    strand(
      head,
      [
        [s * 0.05, 0.14, -0.01],
        [s * 0.085, 0.16, 0.04],
        [s * 0.105, 0.13, 0.11],
        [s * 0.115, 0.08, 0.16],
      ],
      0.013,
      RAINBOW[(i + 1) % RAINBOW.length],
    );
  }

  // Spiral horn: gold cone with a pink helix wrapped around it
  const HORN_H = 0.22;
  const HORN_RB = 0.034;
  const HORN_RT = 0.003;
  const horn = new THREE.Group();
  horn.position.set(0, 0.12, 0.1);
  horn.rotation.x = 0.12;
  head.add(horn);
  part(
    horn,
    new THREE.CylinderGeometry(HORN_RT, HORN_RB, HORN_H, 14, 1),
    COLOR.horn,
    [0, HORN_H / 2, 0],
  );
  const ridge: THREE.Vector3[] = [];
  for (let i = 0; i <= 80; i++) {
    const t = 0.03 + (i / 80) * 0.9;
    const r = HORN_RB * (1 - t) + HORN_RT * t + 0.0015;
    const a = t * Math.PI * 2 * 2.6;
    ridge.push(new THREE.Vector3(Math.cos(a) * r, t * HORN_H, Math.sin(a) * r));
  }
  part(
    horn,
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ridge), 80, 0.0055, 5, false),
    COLOR.hornRidge,
  );

  // ---------- Flank decal: gold star with dots, wrapped onto the left side ----------
  // Maps shape-space (u along body, v up) onto the torso surface at radius FLANK_R.
  const flankAt = (v: number, u: number): V3 => [
    Math.sqrt(Math.max(0, FLANK_R * FLANK_R - v * v)),
    FLANK_Y + v,
    FLANK_Z - u,
  ];
  const starShape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? 0.052 : 0.022;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) starShape.moveTo(px, py);
    else starShape.lineTo(px, py);
  }
  starShape.closePath();
  const starGeo = new THREE.ShapeGeometry(starShape);
  const sp = starGeo.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < sp.count; i++) {
    const [x, y, z] = flankAt(sp.getY(i), sp.getX(i));
    sp.setXYZ(i, x, y, z);
  }
  sp.needsUpdate = true;
  starGeo.computeVertexNormals();
  part(root, starGeo, COLOR.star);

  const flankDots: [number, number, number][] = [
    [0.085, 0.1, COLOR.pink],
    [0.075, -0.1, COLOR.sky],
    [-0.095, -0.03, COLOR.mint],
  ];
  for (const [v, u, color] of flankDots) {
    part(root, new THREE.SphereGeometry(0.013, 8, 6), color, flankAt(v, u));
  }

  return root;
}
