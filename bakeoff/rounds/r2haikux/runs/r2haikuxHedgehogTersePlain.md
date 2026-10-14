```ts
import * as THREE from "three";

export const meta = {
  name: "Hedgehog",
  description:
    "A stylised hedgehog in a rest pose: a dark-brown ball of spines with cream-tipped quills, a pale face with a pointed black snout, and four stubby legs.",
};

// Small seeded PRNG (mulberry32) so every build produces the same hedgehog.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

export default function createHedgehog(): THREE.Object3D {
  const rand = mulberry32(7731);
  const root = new THREE.Group();
  root.name = "hedgehog";

  // ---- Materials: one per colour, shared across meshes ----
  const mat = (color: number, roughness = 0.8) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 });

  const bodyMat = mat(0x4a3224, 0.9);
  const snoutMat = mat(0x7b5443, 0.7);
  const noseMat = mat(0x161110, 0.35);
  const eyeMat = mat(0x0c0908, 0.25);
  const glintMat = mat(0xffffff, 0.2);
  const legMat = mat(0x33241b, 0.85);
  const footMat = mat(0x6a4c40, 0.8);
  const earMat = mat(0x6e4a3c, 0.85);
  const spineMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.55,
    metalness: 0,
  });
  const headMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.85,
    metalness: 0,
  });

  // ---- Body and head proportions (metres) ----
  const BODY_C = new THREE.Vector3(0, 0.09, -0.03);
  const BODY_R = new THREE.Vector3(0.085, 0.07, 0.105);
  const HEAD_C = new THREE.Vector3(0, 0.09, 0.075);
  const HEAD_R = new THREE.Vector3(0.045, 0.042, 0.05);

  // Body: the dark core visible between the quills.
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), bodyMat);
  body.position.copy(BODY_C);
  body.scale.copy(BODY_R);
  root.add(body);

  // Head: vertex-painted so the lower front is a pale face and the crown stays brown.
  const headGeo = new THREE.SphereGeometry(1, 18, 12);
  {
    const pos = headGeo.attributes.position;
    const col = new Float32Array(pos.count * 3);
    const fur = new THREE.Color(0x5b3e2c);
    const face = new THREE.Color(0xd9bd8f);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      void x;
      const t = smooth(0.15, 0.55, z) * (1 - smooth(-0.1, 0.5, y));
      c.lerpColors(fur, face, t);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    headGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  }
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.copy(HEAD_C);
  head.scale.copy(HEAD_R);
  root.add(head);

  // Pointed snout: a cone whose apex points along +Z.
  const snoutGeo = new THREE.ConeGeometry(0.026, 0.06, 9, 1, false);
  snoutGeo.rotateX(Math.PI / 2);
  const snout = new THREE.Mesh(snoutGeo, snoutMat);
  snout.position.set(0, 0.084, 0.11);
  root.add(snout);

  // Flattened black nose at the tip of the snout.
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.0115, 12, 9), noseMat);
  nose.position.set(0, 0.085, 0.137);
  nose.scale.set(1.15, 0.9, 0.9);
  root.add(nose);

  // Eyes with small glints for life.
  const eyeGeo = new THREE.SphereGeometry(0.0085, 10, 8);
  const glintGeo = new THREE.SphereGeometry(0.0026, 6, 5);
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(s * 0.02, 0.104, 0.114);
    root.add(eye);

    const glint = new THREE.Mesh(glintGeo, glintMat);
    glint.position.set(s * 0.0235, 0.1075, 0.1205);
    root.add(glint);
  }

  // Small rounded ears, tilted outward and half-hidden in the quills.
  const earGeo = new THREE.SphereGeometry(1, 10, 8);
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(earGeo, earMat);
    ear.scale.set(0.012, 0.015, 0.005);
    ear.position.set(s * 0.04, 0.122, 0.058);
    ear.rotation.z = -s * 0.35;
    root.add(ear);
  }

  // Four stubby legs with flat feet. Each leg rises into the body so no gap shows.
  const legGeo = new THREE.CylinderGeometry(0.015, 0.017, 0.09, 8);
  const footGeo = new THREE.SphereGeometry(1, 10, 6);
  const legPositions: [number, number][] = [
    [-0.04, 0.045],
    [0.04, 0.045],
    [-0.042, -0.085],
    [0.042, -0.085],
  ];
  for (const [x, z] of legPositions) {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(x, 0.045, z);
    root.add(leg);

    const foot = new THREE.Mesh(footGeo, footMat);
    foot.scale.set(0.021, 0.0095, 0.025);
    foot.position.set(x, 0.0095, z + 0.006);
    root.add(foot);
  }

  // ---- Spines: one faceted cone, vertex-coloured dark base to cream tip ----
  const spineGeo = new THREE.ConeGeometry(1, 1, 5, 3, false);
  spineGeo.translate(0, 0.5, 0); // base at y = 0, tip at y = 1
  {
    const pos = spineGeo.attributes.position;
    const col = new Float32Array(pos.count * 3);
    const dark = new THREE.Color(0x3b2417);
    const mid = new THREE.Color(0xa77a50);
    const tip = new THREE.Color(0xf4e7cc);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const t = pos.getY(i);
      if (t < 0.5) c.lerpColors(dark, mid, t / 0.5);
      else c.lerpColors(mid, tip, (t - 0.5) / 0.5);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    spineGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  }

  // Spread spines over the back and flanks with a Fibonacci sphere, skipping
  // the face, the belly and anything that would sink into the head.
  const up = new THREE.Vector3(0, 1, 0);
  const back = new THREE.Vector3(0, 0.22, -0.9); // quills lean toward the tail
  const N = 640;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const d = new THREE.Vector3();
  const n = new THREE.Vector3();
  const p = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const jit = () => rand() - 0.5;

  for (let i = 0; i < N; i++) {
    const y = 1 - (2 * i) / (N - 1);
    const rr = Math.sqrt(Math.max(0, 1 - y * y));
    const th = golden * i;
    d.set(
      Math.cos(th) * rr + jit() * 0.12,
      y + jit() * 0.12,
      Math.sin(th) * rr + jit() * 0.12
    ).normalize();

    if (d.y < -0.3) continue; // soft underside
    if (d.z > 0.5) continue; // face

    p.set(
      BODY_C.x + d.x * BODY_R.x,
      BODY_C.y + d.y * BODY_R.y,
      BODY_C.z + d.z * BODY_R.z
    );
    if (p.distanceTo(HEAD_C) < 0.085) continue;

    // Surface normal of the ellipsoid at this point.
    n.set(d.x / BODY_R.x, d.y / BODY_R.y, d.z / BODY_R.z).normalize();

    // Spine direction: normal, leaning back toward the tail, with jitter.
    dir.copy(n).addScaledVector(back, 0.8);
    dir.x += jit() * 0.25;
    dir.y += jit() * 0.2;
    dir.z += jit() * 0.25;
    dir.normalize();

    // Size: longest on the back, shorter toward the head, with variety.
    const frontShrink = 1 - 0.4 * smooth(0.0, 0.45, d.z);
    const rearBoost = 1 + 0.2 * smooth(0.0, -0.8, d.z);
    const len = 0.036 * frontShrink * rearBoost * (0.8 + rand() * 0.4);
    const rad = 0.0068 * (0.85 + rand() * 0.3) * (0.75 + 0.25 * frontShrink);

    const spine = new THREE.Mesh(spineGeo, spineMat);
    spine.position.copy(p).addScaledVector(n, -0.004); // root sunk slightly into the skin
    spine.quaternion.setFromUnitVectors(up, dir);
    spine.scale.set(rad, len, rad);
    root.add(spine);
  }

  return root;
}
```