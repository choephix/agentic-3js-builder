```ts
import * as THREE from "three";

export const meta = {
  name: "Nine-banded armadillo",
  description:
    "A trotting nine-banded armadillo with a banded dusty-tan shell, pointed snout, tall leathery ears, beady eyes, clawed feet, a tapering armoured tail and a sprinkle of coarse pale hairs.",
};

// ---- seeded random (mulberry32) so every build is identical ----
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20417);

// ---- body dimensions (metres, body-local, body origin = shell base centre) ----
const BY = 0.11; // height of body origin above the floor

function ell(z: number): number {
  const t = z / 0.34;
  return Math.sqrt(Math.max(0, 1 - t * t));
}
// half-width of carapace at z
function W(z: number): number {
  return 0.13 * Math.pow(ell(z), 0.6) + 0.01;
}
// height of carapace above shell base at z
function H(z: number): number {
  return 0.09 * Math.pow(ell(z), 0.5) + 0.01;
}

// one overlapping plate/band: a ribbed dome slice running across the body
function bandGeometry(z0: number, z1: number, grow: number, lip: number) {
  const NZ = 6;
  const NA = 18;
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= NZ; i++) {
    const u = i / NZ;
    const z = z0 + (z1 - z0) * u;
    const g = grow * (1 + lip * u * u); // trailing edge lifts, reads as a plate lip
    for (let j = 0; j <= NA; j++) {
      const a = (Math.PI * j) / NA;
      pos.push(W(z) * g * Math.cos(a), H(z) * g * Math.sin(a), z);
    }
  }
  for (let i = 0; i < NZ; i++) {
    for (let j = 0; j < NA; j++) {
      const a = i * (NA + 1) + j;
      const b = a + NA + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export default function build(): THREE.Object3D {
  // ---- materials: one per colour, shared ----
  const mat = (color: string, rough = 0.75) =>
    new THREE.MeshStandardMaterial({
      color,
      roughness: rough,
      metalness: 0,
      flatShading: true,
      side: THREE.DoubleSide,
    });

  const shellA = mat("#b99a88");
  const shellB = mat("#a48474");
  const belly = mat("#dcc6b6");
  const skin = mat("#c49489");
  const legSkin = mat("#ab8778");
  const eyeMat = mat("#150f10", 0.4);
  const clawMat = mat("#ebe2d0", 0.5);
  const hairMat = mat("#f3ece2", 0.9);
  const noseMat = mat("#2a1d1d", 0.5);

  const root = new THREE.Group();
  const body = new THREE.Group();
  body.position.set(0, BY, 0);
  root.add(body);

  // ---- nine overlapping bands of the carapace ----
  const zStart = -0.3;
  const step = 0.6 / 9;
  for (let i = 0; i < 9; i++) {
    const z0 = zStart + i * step;
    const z1 = z0 + step * 1.15;
    const band = new THREE.Mesh(
      bandGeometry(z0, z1, 1.0, 0.1),
      i % 2 === 0 ? shellA : shellB
    );
    body.add(band);
  }

  // ---- soft belly under the shell ----
  const bellyMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), belly);
  bellyMesh.scale.set(0.12, 0.07, 0.29);
  bellyMesh.position.set(0, 0.0, 0);
  body.add(bellyMesh);

  // ---- coarse pale hairs poking out of the seams ----
  const hairGeo = new THREE.CylinderGeometry(0.0022, 0.0008, 1, 4);
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < 70; i++) {
    const z = -0.28 + rand() * 0.56;
    const a = 0.15 + rand() * (Math.PI - 0.3);
    const w = W(z);
    const h = H(z);
    const bx = w * Math.cos(a) * 0.96;
    const by = h * Math.sin(a) * 0.96;
    // outward normal of the ellipse cross-section, with a little random splay
    const dir = new THREE.Vector3(
      Math.cos(a) / w,
      Math.sin(a) / h,
      (rand() - 0.5) * 0.4
    ).normalize();
    const len = 0.035 + rand() * 0.028;
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.scale.set(1, len, 1);
    hair.position.set(bx + dir.x * len * 0.5, by + dir.y * len * 0.5, z + dir.z * len * 0.5);
    hair.quaternion.setFromUnitVectors(up, dir);
    body.add(hair);
  }

  // ---- head: pointed snout, beady eyes, tall ears ----
  const head = new THREE.Group();
  head.position.set(0, 0.075, 0.33);
  head.rotation.x = 0.12; // snout dips slightly while trotting
  body.add(head);

  const skull = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), skin);
  skull.scale.set(0.072, 0.066, 0.085);
  head.add(skull);

  const snoutGeo = new THREE.ConeGeometry(0.042, 0.13, 8, 1);
  snoutGeo.rotateX(Math.PI / 2); // tip now points +Z
  const snout = new THREE.Mesh(snoutGeo, skin);
  snout.scale.set(1, 0.8, 1);
  snout.position.set(0, -0.012, 0.1);
  head.add(snout);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), noseMat);
  nose.position.set(0, -0.01, 0.166);
  head.add(nose);

  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.0115, 8, 6), eyeMat);
    eye.position.set(s * 0.05, 0.02, 0.06);
    head.add(eye);

    const ear = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), skin);
    ear.scale.set(0.024, 0.07, 0.01);
    ear.position.set(s * 0.04, 0.085, -0.02);
    ear.rotation.x = -0.25; // tilted back, leathery and tall
    head.add(ear);
  }

  // ---- tapering armoured tail ----
  const N = 12;
  const tailPt = (s: number) => new THREE.Vector3(0, 0.07 - 0.08 * s, -0.27 - 0.72 * s);
  const tailR = (s: number) => 0.05 * Math.pow(1 - s, 0.8) + 0.004;
  for (let i = 0; i < N; i++) {
    const s0 = i / N;
    const s1 = (i + 1) / N;
    const p0 = tailPt(s0);
    const p1 = tailPt(s1);
    const dir = p1.clone().sub(p0);
    const len = dir.length();
    const seg = new THREE.Mesh(
      new THREE.CylinderGeometry(tailR(s1), tailR(s0), len * 1.02, 8, 1),
      i % 2 === 0 ? shellA : shellB
    );
    seg.position.copy(p0.clone().add(p1).multiplyScalar(0.5));
    seg.quaternion.setFromUnitVectors(up, dir.normalize());
    body.add(seg);
  }
  // a few coarse hairs along the tail bands
  for (let i = 0; i < 10; i++) {
    const s = 0.1 + rand() * 0.8;
    const p = tailPt(s);
    const a = rand() * Math.PI * 2;
    const dir = new THREE.Vector3(Math.cos(a), Math.sin(a) * 0.6 + 0.3, -0.3).normalize();
    const len = 0.02 + rand() * 0.02;
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.scale.set(0.8, len, 0.8);
    hair.position.copy(p).addScaledVector(dir, len * 0.5 + tailR(s) * 0.8);
    hair.quaternion.setFromUnitVectors(up, dir);
    body.add(hair);
  }

  // ---- sturdy legs in a trotting diagonal pair pattern ----
  const legUpperGeo = new THREE.CylinderGeometry(0.03, 0.022, 0.09, 8, 1);
  const footGeo = new THREE.BoxGeometry(0.05, 0.03, 0.07, 1, 1, 1);
  const clawGeo = new THREE.ConeGeometry(0.007, 0.025, 6, 1);
  clawGeo.rotateX(Math.PI / 2); // tip +Z

  const legs = [
    { x: 0.075, z: 0.18, rot: -0.4 }, // front left, forward
    { x: -0.075, z: 0.18, rot: 0.35 }, // front right, back
    { x: 0.075, z: -0.16, rot: 0.35 }, // back left, back
    { x: -0.075, z: -0.16, rot: -0.4 }, // back right, forward
  ];
  for (const L of legs) {
    const pivot = new THREE.Group();
    pivot.position.set(L.x, 0, L.z);
    pivot.rotation.x = L.rot;
    body.add(pivot);

    const upper = new THREE.Mesh(legUpperGeo, legSkin);
    upper.position.set(0, -0.045, 0);
    pivot.add(upper);

    const foot = new THREE.Mesh(footGeo, legSkin);
    foot.position.set(0, -0.095, 0.01);
    pivot.add(foot);

    for (const cx of [-0.014, 0, 0.014]) {
      const claw = new THREE.Mesh(clawGeo, clawMat);
      claw.position.set(cx, -0.1, 0.045);
      claw.rotation.x = 0.4; // curved down toward the ground
      pivot.add(claw);
    }
  }

  return root;
}
```