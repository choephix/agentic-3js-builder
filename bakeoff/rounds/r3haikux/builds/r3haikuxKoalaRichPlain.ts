import * as THREE from "three";

export const meta = {
  name: "Sleepy Koala on a Gum Branch",
  description:
    "A drowsy ash-grey koala with a cream chest and cream-lined ears, half-closed brown eyes and a big black nose, hugging a eucalyptus branch while it munches a sprig of blue-green leaves.",
};

type V = [number, number, number];
type Mats = ReturnType<typeof makeMaterials>;

const UP = new THREE.Vector3(0, 1, 0);
const TAU = Math.PI * 2;

// Seeded PRNG (mulberry32): every build produces the same model.
function makeRng(seed: number) {
  let s = seed >>> 0;
  return (): number => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const vec = (v: THREE.Vector3): V => [v.x, v.y, v.z];

// Canvas-drawn texture. Returns null when no canvas exists, and the flat colour is used instead.
function canvasTexture(
  w: number,
  h: number,
  draw: (g: CanvasRenderingContext2D, w: number, h: number) => void,
): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext("2d");
  if (!g) return null;
  draw(g, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeMaterials() {
  const furTex = canvasTexture(256, 256, (g, w, h) => {
    const r = makeRng(7);
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 3000; i++) {
      const v = 185 + Math.floor(r() * 70);
      const s = 1 + r() * 2;
      g.fillStyle = `rgba(${v},${v},${v},0.5)`;
      g.fillRect(r() * w, r() * h, s, s * 1.8);
    }
  });

  const barkTex = canvasTexture(256, 256, (g, w, h) => {
    const r = makeRng(11);
    g.fillStyle = "#9da696";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 150; i++) {
      g.strokeStyle = r() < 0.5 ? "rgba(60,68,60,0.22)" : "rgba(246,246,236,0.28)";
      g.lineWidth = 1 + r() * 3;
      let x = r() * w;
      g.beginPath();
      g.moveTo(x, 0);
      for (let y = 0; y <= h; y += 12) {
        x += (r() - 0.5) * 2.5;
        g.lineTo(x, y);
      }
      g.stroke();
    }
    for (let i = 0; i < 60; i++) {
      g.fillStyle = "rgba(250,248,240,0.3)";
      g.beginPath();
      g.ellipse(r() * w, r() * h, 3 + r() * 9, 1.5 + r() * 4, r() * 3, 0, TAU);
      g.fill();
    }
  });

  if (barkTex) barkTex.repeat.set(1, 3);
  if (furTex) furTex.repeat.set(1.5, 1.5);

  const std = (color: number, extra: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0, ...extra });

  return {
    fur: std(0x9fa19d, { map: furTex }),
    furDark: std(0x7b7f7d, { map: furTex }),
    cream: std(0xf0e6cc),
    nose: std(0x16120f, { roughness: 0.55 }),
    eye: std(0x5a3920, { roughness: 0.3 }),
    pupil: std(0x120b07, { roughness: 0.3 }),
    glint: std(0xfff7e6, { roughness: 0.15 }),
    mouth: std(0x2a1710),
    claw: std(0x2a2a2d, { roughness: 0.35 }),
    bark: std(0xffffff, { map: barkTex }),
    barkDark: std(0x4f4c44),
    stem: std(0x7d6b52),
    leafA: std(0x6d9c93, { side: THREE.DoubleSide, roughness: 0.6 }),
    leafB: std(0x8fbcb1, { side: THREE.DoubleSide, roughness: 0.6 }),
    leafC: std(0x567f78, { side: THREE.DoubleSide, roughness: 0.6 }),
  };
}

// Ellipsoid built from a unit sphere.
function blob(parent: THREE.Object3D, mat: THREE.Material, radii: V, pos: V, seg = 14) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, seg, Math.round(seg * 0.7)), mat);
  m.scale.set(radii[0], radii[1], radii[2]);
  m.position.set(pos[0], pos[1], pos[2]);
  parent.add(m);
  return m;
}

// Rounded limb between two points.
function limb(parent: THREE.Object3D, mat: THREE.Material, a: V, b: V, r: number) {
  const A = new THREE.Vector3(a[0], a[1], a[2]);
  const B = new THREE.Vector3(b[0], b[1], b[2]);
  const d = new THREE.Vector3().subVectors(B, A);
  const len = d.length();
  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(r, Math.max(0.001, len - 2 * r), 4, 8),
    mat,
  );
  mesh.position.addVectors(A, B).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(UP, d.normalize());
  parent.add(mesh);
  return mesh;
}

// Pointed claw; base sits at `base`, tip points along `dir`.
function claw(parent: THREE.Object3D, mat: THREE.Material, base: V, dir: V, len: number) {
  const d = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
  const mesh = new THREE.Mesh(new THREE.ConeGeometry(0.0055, len, 5), mat);
  mesh.position.set(base[0], base[1], base[2]).addScaledVector(d, len / 2);
  mesh.quaternion.setFromUnitVectors(UP, d);
  parent.add(mesh);
  return mesh;
}

// Koala paw: palm, three fingers, claws.
function paw(parent: THREE.Object3D, m: Mats, center: V, fingerDir: V, s: number) {
  const c = new THREE.Vector3(center[0], center[1], center[2]);
  const f = new THREE.Vector3(fingerDir[0], fingerDir[1], fingerDir[2]).normalize();
  const side = new THREE.Vector3().crossVectors(f, UP).normalize();
  blob(parent, m.furDark, [0.04 * s, 0.034 * s, 0.038 * s], center, 12);
  for (const k of [-1, 0, 1]) {
    const base = c.clone().addScaledVector(side, k * 0.018 * s).addScaledVector(f, 0.025 * s);
    const tip = base.clone().addScaledVector(f, 0.035 * s);
    limb(parent, m.furDark, vec(base), vec(tip), 0.011 * s);
    const curl = f.clone().add(new THREE.Vector3(0, -0.35, 0));
    claw(parent, m.claw, vec(tip), vec(curl), 0.022 * s);
  }
}

// Lance-shaped eucalyptus leaf, base at origin, extending along +Y.
function leafGeometry(len: number, width: number) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.quadraticCurveTo(width * 1.1, len * 0.45, 0, len);
  s.quadraticCurveTo(-width * 0.7, len * 0.55, 0, 0);
  return new THREE.ShapeGeometry(s, 3);
}

// Stem with leaves scattered along it.
function sprig(
  parent: THREE.Object3D,
  m: Mats,
  geos: THREE.BufferGeometry[],
  rng: () => number,
  base: V,
  dir: V,
  len: number,
  count: number,
  tStart: number,
) {
  const A = new THREE.Vector3(base[0], base[1], base[2]);
  const D = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0065, len, 5), m.stem);
  stem.position.copy(A).addScaledVector(D, len / 2);
  stem.quaternion.setFromUnitVectors(UP, D);
  parent.add(stem);

  const ref = Math.abs(D.y) < 0.9 ? UP : new THREE.Vector3(1, 0, 0);
  const p1 = new THREE.Vector3().crossVectors(D, ref).normalize();
  const p2 = new THREE.Vector3().crossVectors(D, p1).normalize();
  const leafMats = [m.leafA, m.leafB, m.leafC];

  for (let i = 0; i < count; i++) {
    const t = tStart + (1 - tStart) * ((i + 0.2 + rng() * 0.6) / count);
    const pos = A.clone().addScaledVector(D, len * Math.min(1, t));
    const a = rng() * TAU;
    const out = p1.clone().multiplyScalar(Math.cos(a)).addScaledVector(p2, Math.sin(a));
    const ld = out.addScaledVector(D, 0.4).add(new THREE.Vector3(0, -0.35, 0)).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(UP, ld);
    q.multiply(new THREE.Quaternion().setFromAxisAngle(UP, rng() * TAU));
    const leaf = new THREE.Mesh(
      geos[Math.floor(rng() * geos.length)],
      leafMats[Math.floor(rng() * leafMats.length)],
    );
    leaf.position.copy(pos);
    leaf.quaternion.copy(q);
    parent.add(leaf);
  }
}

function buildBranch(root: THREE.Object3D, m: Mats, geos: THREE.BufferGeometry[], rng: () => number) {
  const L = 1.5;
  const R = 0.055;

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.9, R * 1.05, L, 14, 1), m.bark);
  trunk.rotation.z = Math.PI / 2;
  trunk.position.set(0, 0.28, 0);
  root.add(trunk);

  // Knots on the trunk surface.
  blob(root, m.barkDark, [0.014, 0.012, 0.009], [0.22, 0.28 + 0.033, 0.044], 8);
  blob(root, m.barkDark, [0.012, 0.01, 0.008], [-0.4, 0.28 - 0.04, 0.035], 8);

  // Stumps holding the branch, with root flares resting on the floor.
  const stumps: [number, number][] = [
    [-0.66, 0.28],
    [0.66, 0.26],
  ];
  for (const [x, h] of stumps) {
    const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.09, h, 12), m.bark);
    stump.position.set(x, h / 2, 0);
    root.add(stump);
    blob(root, m.bark, [0.11, 0.028, 0.11], [x, 0.016, 0], 12);
  }

  // Leafy twigs.
  sprig(root, m, geos, rng, [-0.46, 0.31, -0.03], [-0.3, 0.8, -0.5], 0.23, 8, 0.25);
  sprig(root, m, geos, rng, [0.5, 0.31, -0.05], [0.35, 0.75, -0.55], 0.2, 8, 0.25);
  sprig(root, m, geos, rng, [0.25, 0.25, 0.05], [0.25, -0.7, 0.55], 0.18, 6, 0.35);
}

function buildBody(g: THREE.Object3D, m: Mats) {
  blob(g, m.fur, [0.165, 0.18, 0.155], [0, 0.46, -0.02], 18); // torso
  blob(g, m.fur, [0.15, 0.09, 0.13], [0, 0.34, -0.05], 14); // rump settled on the branch
  blob(g, m.cream, [0.115, 0.14, 0.045], [0, 0.47, 0.135], 14); // cream chest

  for (const s of [-1, 1]) {
    blob(g, m.fur, [0.085, 0.08, 0.1], [s * 0.11, 0.35, 0.06], 12); // thigh
    limb(g, m.furDark, [s * 0.11, 0.3, 0.13], [s * 0.1, 0.19, 0.18], 0.038); // shin
    blob(g, m.furDark, [0.05, 0.034, 0.07], [s * 0.1, 0.18, 0.2], 12); // foot
    for (const k of [-0.02, 0, 0.02]) {
      claw(g, m.claw, [s * 0.1 + k, 0.17, 0.265], [0, -0.3, 1], 0.03);
    }
  }
}

function buildEar(head: THREE.Object3D, m: Mats, s: number) {
  const dir = new THREE.Vector3(s * 0.7, 0.35, 0.6).normalize();
  const ear = new THREE.Group();
  ear.position.set(s * 0.112, 0.07, -0.005);
  ear.quaternion.setFromUnitVectors(UP, dir);

  ear.add(new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.07, 0.03, 16), m.fur));
  ear.add(new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.034, 14), m.cream));

  // Fluffy cream rim made of little tufts.
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * TAU;
    blob(ear, m.cream, [0.02, 0.016, 0.02], [Math.cos(a) * 0.063, 0.004, Math.sin(a) * 0.063], 8);
  }
  head.add(ear);
}

function buildHead(parent: THREE.Object3D, m: Mats) {
  const head = new THREE.Group();
  head.name = "head";
  head.position.set(0, 0.71, 0.01);
  head.rotation.x = 0.12; // heavy, drowsy nod
  parent.add(head);

  blob(head, m.fur, [0.13, 0.115, 0.12], [0, 0, 0], 18); // skull
  blob(head, m.fur, [0.07, 0.05, 0.065], [0, -0.045, 0.1], 14); // muzzle
  blob(head, m.nose, [0.056, 0.038, 0.034], [0, -0.005, 0.155], 14); // big black nose

  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.007, 0.014), m.mouth);
  mouth.position.set(0, -0.07, 0.152);
  head.add(mouth);

  for (const s of [-1, 1]) {
    const ex = s * 0.058;
    const ey = 0.045;
    const ez = 0.1;
    blob(head, m.eye, [0.027, 0.027, 0.022], [ex, ey, ez], 12);
    blob(head, m.pupil, [0.013, 0.013, 0.01], [ex, ey - 0.009, ez + 0.02], 8);
    blob(head, m.glint, [0.005, 0.005, 0.004], [ex + s * 0.005, ey - 0.012, ez + 0.03], 6);

    // Heavy lid: a dome over the upper half of the eye.
    const lid = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 12, 5, 0, TAU, 0, Math.PI / 2),
      m.fur,
    );
    lid.position.set(ex, ey - 0.004, ez + 0.002);
    head.add(lid);
  }

  buildEar(head, m, -1);
  buildEar(head, m, 1);
}

function buildArms(g: THREE.Object3D, m: Mats) {
  // Koala's left arm (+X) lifts the sprig to its mouth.
  limb(g, m.fur, [0.13, 0.52, 0.05], [0.21, 0.44, 0.1], 0.042);
  blob(g, m.fur, [0.04, 0.04, 0.04], [0.21, 0.44, 0.1], 10);
  limb(g, m.fur, [0.21, 0.44, 0.1], [0.16, 0.55, 0.17], 0.036);
  paw(g, m, [0.15, 0.58, 0.2], [-0.5, 0.25, 0.8], 1.0);

  // Koala's right arm (-X) wraps around the branch.
  limb(g, m.fur, [-0.13, 0.52, 0.05], [-0.21, 0.42, 0.1], 0.042);
  blob(g, m.fur, [0.04, 0.04, 0.04], [-0.21, 0.42, 0.1], 10);
  limb(g, m.fur, [-0.21, 0.42, 0.1], [-0.11, 0.3, 0.14], 0.036);
  paw(g, m, [-0.08, 0.27, 0.12], [0.35, -0.5, -0.8], 1.0);
}

function groundLeaves(root: THREE.Object3D, m: Mats, geos: THREE.BufferGeometry[], rng: () => number) {
  const mats = [m.leafA, m.leafB, m.leafC];
  const flat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  for (let i = 0; i < 16; i++) {
    const leaf = new THREE.Mesh(
      geos[Math.floor(rng() * geos.length)],
      mats[Math.floor(rng() * mats.length)],
    );
    const yaw = new THREE.Quaternion().setFromAxisAngle(UP, rng() * TAU);
    leaf.quaternion.copy(yaw).multiply(flat);
    leaf.position.set((rng() * 2 - 1) * 0.6, 0.002 + i * 0.0002, 0.12 + rng() * 0.4);
    root.add(leaf);
  }
}

export default function buildSleepyKoala(): THREE.Object3D {
  const rng = makeRng(20417);
  const m = makeMaterials();
  const geos = [leafGeometry(0.058, 0.02), leafGeometry(0.075, 0.024), leafGeometry(0.09, 0.026)];

  const root = new THREE.Group();
  root.name = "sleepy-koala-on-eucalyptus";

  buildBranch(root, m, geos, rng);

  const koala = new THREE.Group();
  koala.name = "koala";
  root.add(koala);

  buildBody(koala, m);
  buildHead(koala, m);
  buildArms(koala, m);

  // Sprig held up to the mouth, mid-munch.
  sprig(koala, m, geos, rng, [0.15, 0.58, 0.2], [-0.955, 0.287, 0.127], 0.16, 7, 0.35);

  groundLeaves(root, m, geos, rng);

  return root;
}
