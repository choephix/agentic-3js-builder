```ts
import * as THREE from "three";

export const meta = {
  name: "Teal Baby Dragon with Speckled Egg",
  description:
    "A proud teal baby dragon with orange spines, oversized amber-membrane wings, a toothy grin and a wisp of smoke, sitting beside its broken speckled egg.",
};

// Seeded generator so every build is identical.
function mulberry32(seed: number) {
  let a = seed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(2024);
const UP = new THREE.Vector3(0, 1, 0);

// ---------- textures ----------

function scaleTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#2fb3a6";
  g.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 16; col++) {
      const x = col * 16 + (row % 2) * 8;
      const y = row * 16;
      g.fillStyle = "#1d8a82";
      g.beginPath();
      g.arc(x, y, 9, 0, Math.PI);
      g.fill();
      g.fillStyle = "#5fd3c2";
      g.beginPath();
      g.arc(x - 2, y - 2, 4, Math.PI * 1.1, Math.PI * 1.6);
      g.lineTo(x - 2, y - 2);
      g.fill();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 2);
  return t;
}

function speckleTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#f3ead2";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 260; i++) {
    g.fillStyle = `rgba(120,78,40,${0.45 + rng() * 0.5})`;
    g.beginPath();
    g.arc(rng() * 256, rng() * 256, 1 + rng() * 3, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------- helpers ----------

function orient(obj: THREE.Object3D, dir: THREE.Vector3) {
  obj.quaternion.setFromUnitVectors(UP, dir.clone().normalize());
  return obj;
}

function blob(
  parent: THREE.Object3D,
  mat: THREE.Material,
  x: number,
  y: number,
  z: number,
  sx: number,
  sy: number,
  sz: number
) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), mat);
  m.position.set(x, y, z);
  m.scale.set(sx, sy, sz);
  parent.add(m);
  return m;
}

function beam(
  parent: THREE.Object3D,
  a: number[],
  b: number[],
  ra: number,
  rb: number,
  mat: THREE.Material
) {
  const A = new THREE.Vector3(...a);
  const B = new THREE.Vector3(...b);
  const d = B.clone().sub(A);
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(rb, ra, d.length(), 8, 1),
    mat
  );
  m.position.copy(A).add(B).multiplyScalar(0.5);
  orient(m, d);
  parent.add(m);
  return m;
}

function cone(
  parent: THREE.Object3D,
  mat: THREE.Material,
  base: THREE.Vector3,
  dir: THREE.Vector3,
  r: number,
  h: number
) {
  const d = dir.clone().normalize();
  const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), mat);
  m.position.copy(base).addScaledVector(d, h / 2);
  orient(m, d);
  parent.add(m);
  return m;
}

// ---------- builder ----------

export default function build(): THREE.Object3D {
  const scaleTex = scaleTexture();
  const eggTex = speckleTexture();

  const M = {
    teal: new THREE.MeshStandardMaterial({ map: scaleTex, color: 0xffffff, roughness: 0.55 }),
    belly: new THREE.MeshStandardMaterial({ color: 0xf4d774, roughness: 0.6 }),
    spine: new THREE.MeshStandardMaterial({ color: 0xff8a2a, roughness: 0.5, emissive: 0x3a1400 }),
    horn: new THREE.MeshStandardMaterial({ color: 0xefe3c4, roughness: 0.45 }),
    amber: new THREE.MeshStandardMaterial({ color: 0xffa41a, roughness: 0.25, emissive: 0x4a2000 }),
    pupil: new THREE.MeshStandardMaterial({ color: 0x140a05, roughness: 0.4 }),
    mouth: new THREE.MeshStandardMaterial({ color: 0x4a0f16, roughness: 0.7 }),
    teeth: new THREE.MeshStandardMaterial({ color: 0xfff8e8, roughness: 0.35 }),
    membrane: new THREE.MeshStandardMaterial({
      color: 0xffb050,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      roughness: 0.3,
      emissive: 0x2a1000,
    }),
    shell: new THREE.MeshStandardMaterial({
      map: eggTex,
      color: 0xffffff,
      roughness: 0.5,
      side: THREE.DoubleSide,
    }),
    smoke: new THREE.MeshStandardMaterial({
      color: 0xf2f2f2,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      roughness: 1,
    }),
    claw: new THREE.MeshStandardMaterial({ color: 0xf5efe0, roughness: 0.4 }),
  };

  const root = new THREE.Group();
  const dragon = new THREE.Group();
  root.add(dragon);

  // Torso and belly
  blob(dragon, M.teal, 0, 0.16, 0, 0.11, 0.13, 0.11);
  blob(dragon, M.belly, 0, 0.15, 0.05, 0.085, 0.11, 0.08);

  // Neck
  beam(dragon, [0, 0.22, 0.03], [0, 0.34, 0.07], 0.06, 0.07, M.teal);

  // Head
  blob(dragon, M.teal, 0, 0.37, 0.07, 0.1, 0.095, 0.105);
  blob(dragon, M.belly, 0, 0.34, 0.14, 0.07, 0.05, 0.06); // jaw underside
  blob(dragon, M.teal, 0, 0.345, 0.2, 0.065, 0.055, 0.09); // snout

  // Nostrils and smoke source
  for (const s of [-1, 1]) {
    blob(dragon, M.mouth, s * 0.025, 0.37, 0.27, 0.009, 0.009, 0.009);
  }

  // Big amber eyes with slit pupils and soft brows
  for (const s of [-1, 1]) {
    blob(dragon, M.amber, s * 0.045, 0.39, 0.14, 0.03, 0.033, 0.03);
    blob(dragon, M.pupil, s * 0.045, 0.39, 0.166, 0.008, 0.024, 0.006);
    blob(dragon, M.teal, s * 0.045, 0.425, 0.13, 0.04, 0.012, 0.035);
  }

  // Stubby horns sweeping back
  for (const s of [-1, 1]) {
    cone(
      dragon,
      M.horn,
      new THREE.Vector3(s * 0.05, 0.42, 0.04),
      new THREE.Vector3(s * 0.3, 1, -0.4),
      0.022,
      0.06
    );
  }

  // Grin: torus arc with teeth
  const grinCenter = new THREE.Vector3(0, 0.345, 0.28);
  const grinR = 0.05;
  const arc = Math.PI * 0.8;
  const grin = new THREE.Mesh(
    new THREE.TorusGeometry(grinR, 0.008, 6, 14, arc),
    M.mouth
  );
  grin.position.copy(grinCenter);
  grin.rotation.z = -Math.PI / 2 - arc / 2;
  dragon.add(grin);
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const ang = -Math.PI / 2 - arc / 2 + arc * t;
    const p = new THREE.Vector3(
      grinCenter.x + Math.cos(ang) * grinR,
      grinCenter.y + Math.sin(ang) * grinR + 0.004,
      grinCenter.z
    );
    cone(dragon, M.teeth, p, new THREE.Vector3(0, -1, 0.25), 0.007, 0.02);
  }

  // Orange spines along the back and neck
  for (let i = 0; i < 8; i++) {
    const a = 0.45 + i * 0.24;
    const base = new THREE.Vector3(0, 0.16 + 0.12 * Math.cos(a), -0.1 * Math.sin(a));
    const dir = new THREE.Vector3(0, Math.cos(a), -Math.sin(a));
    cone(dragon, M.spine, base, dir, 0.014, 0.05 - i * 0.002);
  }
  for (let i = 0; i < 3; i++) {
    const t = i / 2;
    const base = new THREE.Vector3(0, 0.27 + t * 0.07, 0.03 + t * 0.04 - 0.02);
    cone(dragon, M.spine, base, new THREE.Vector3(0, 1, -0.5), 0.013, 0.04);
  }

  // Front arms resting on the knees
  for (const s of [-1, 1]) {
    beam(dragon, [s * 0.1, 0.25, 0.02], [s * 0.12, 0.15, 0.1], 0.03, 0.025, M.teal);
    beam(dragon, [s * 0.12, 0.15, 0.1], [s * 0.1, 0.035, 0.17], 0.025, 0.02, M.teal);
    blob(dragon, M.belly, s * 0.1, 0.027, 0.18, 0.04, 0.026, 0.045);
    for (let k = -1; k <= 1; k++) {
      cone(
        dragon,
        M.claw,
        new THREE.Vector3(s * 0.1 + k * 0.012, 0.03, 0.21),
        new THREE.Vector3(0, -0.2, 1),
        0.006,
        0.02
      );
    }
  }

  // Chubby seated legs
  for (const s of [-1, 1]) {
    blob(dragon, M.teal, s * 0.115, 0.08, 0.06, 0.06, 0.065, 0.09);
    blob(dragon, M.teal, s * 0.12, 0.028, 0.2, 0.05, 0.028, 0.07);
    for (let k = -1; k <= 1; k++) {
      cone(
        dragon,
        M.claw,
        new THREE.Vector3(s * 0.12 + k * 0.015, 0.025, 0.26),
        new THREE.Vector3(0, -0.15, 1),
        0.007,
        0.025
      );
    }
  }

  // Oversized wings with amber membrane
  for (const s of [-1, 1]) {
    const S = [s * 0.09, 0.27, -0.03];
    const E = [s * 0.2, 0.37, -0.06];
    const W = [s * 0.3, 0.44, -0.02];
    const F1 = [s * 0.4, 0.36, 0.02];
    const F2 = [s * 0.37, 0.25, -0.03];
    const F3 = [s * 0.3, 0.17, -0.07];
    const Hip = [s * 0.1, 0.11, -0.1];

    beam(dragon, S, E, 0.016, 0.014, M.teal);
    beam(dragon, E, W, 0.014, 0.012, M.teal);
    beam(dragon, W, F1, 0.008, 0.006, M.horn);
    beam(dragon, W, F2, 0.008, 0.006, M.horn);
    beam(dragon, W, F3, 0.008, 0.006, M.horn);

    const pts = [S, W, F1, F2, F3, Hip].flat();
    const verts: number[] = [];
    const ring = [S, W, F1, F2, F3, Hip];
    for (let i = 1; i < ring.length - 1; i++) {
      verts.push(...S, ...ring[i], ...ring[i + 1]);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    geo.computeVertexNormals();
    dragon.add(new THREE.Mesh(geo, M.membrane));
    void pts;
  }

  // Chubby tail with a spade tip
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.07, -0.1),
    new THREE.Vector3(0, 0.05, -0.2),
    new THREE.Vector3(0.03, 0.04, -0.28),
    new THREE.Vector3(0.09, 0.04, -0.34),
  ]);
  for (let i = 0; i < 10; i++) {
    const t = i / 9;
    const p = tailCurve.getPoint(t);
    const r = THREE.MathUtils.lerp(0.05, 0.013, t);
    blob(dragon, M.teal, p.x, p.y, p.z, r, r, r);
  }
  for (let i = 2; i < 7; i++) {
    const t = i / 9;
    const p = tailCurve.getPoint(t);
    cone(dragon, M.spine, p.clone().add(new THREE.Vector3(0, 0.03, 0)), new THREE.Vector3(0, 1, 0), 0.01, 0.025);
  }

  const tipPos = tailCurve.getPoint(1);
  const tipDir = tailCurve.getTangent(1);
  const spadeShape = new THREE.Shape();
  spadeShape.moveTo(0, 0.045);
  spadeShape.lineTo(0.032, 0.005);
  spadeShape.lineTo(0.02, -0.03);
  spadeShape.lineTo(0, -0.012);
  spadeShape.lineTo(-0.02, -0.03);
  spadeShape.lineTo(-0.032, 0.005);
  spadeShape.closePath();
  const spade = new THREE.Mesh(new THREE.ShapeGeometry(spadeShape), M.spine);
  spade.position.copy(tipPos).addScaledVector(tipDir, 0.02);
  spade.rotation.y = Math.atan2(tipDir.x, tipDir.z) + Math.PI / 2;
  dragon.add(spade);

  // Smoke wisp curling from the right nostril
  const smokeRoot = new THREE.Group();
  smokeRoot.position.set(0.025, 0.38, 0.27);
  root.add(smokeRoot);
  for (let i = 0; i < 6; i++) {
    const r = 0.012 + i * 0.006;
    const sx = Math.sin(i * 0.9) * 0.02 * (i / 5);
    const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), M.smoke);
    puff.position.set(sx + i * 0.004, i * 0.035, i * 0.012);
    puff.scale.set(1, 0.8, 1);
    smokeRoot.add(puff);
  }

  // Speckled egg, broken open, with its cracked cap and shards
  const eggGroup = new THREE.Group();
  eggGroup.position.set(0.27, 0, 0.1);
  eggGroup.rotation.z = -0.12;
  root.add(eggGroup);

  const bowlGeo = new THREE.SphereGeometry(1, 28, 20, 0, Math.PI * 2, Math.PI * 0.4, Math.PI * 0.6);
  const bowl = new THREE.Mesh(bowlGeo, M.shell);
  bowl.scale.set(0.1, 0.13, 0.1);
  bowl.position.y = 0.13;
  eggGroup.add(bowl);

  const capGeo = new THREE.SphereGeometry(1, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.42);
  const cap = new THREE.Mesh(capGeo, M.shell);
  cap.scale.set(0.1, 0.13, 0.1);
  cap.position.set(0.2, 0.06, 0.12);
  cap.rotation.set(0.4, 0.3, -1.2);
  eggGroup.add(cap);

  const shardGeo = new THREE.DodecahedronGeometry(0.02, 0);
  for (let i = 0; i < 4; i++) {
    const sh = new THREE.Mesh(shardGeo, M.shell);
    sh.position.set(-0.06 + rng() * 0.16, 0.008, 0.12 + rng() * 0.12);
    sh.scale.set(1 + rng(), 0.4 + rng() * 0.3, 1 + rng() * 0.6);
    sh.rotation.set(rng() * 3, rng() * 3, rng() * 3);
    eggGroup.add(sh);
  }

  dragon.position.set(0, 0, -0.02);
  return root;
}
```