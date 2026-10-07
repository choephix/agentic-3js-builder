import * as THREE from "three";

export const meta = {
  name: "Dragonfly",
  description:
    "A dragonfly resting on a pebble with its wings held flat: turquoise compound eyes with glints, an emerald thorax with black stripes, a banded cobalt abdomen with an amber tail, and amber-tinted wings with dark veins.",
};

const UP = new THREE.Vector3(0, 1, 0);
type Vec3 = [number, number, number];

// Ellipsoid built from a unit sphere: centre c, radii r, optional Euler rotation.
function ellipsoid(
  c: Vec3,
  r: Vec3,
  mat: THREE.Material,
  w = 12,
  h = 8,
  rot: Vec3 = [0, 0, 0]
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, w, h), mat);
  m.position.set(c[0], c[1], c[2]);
  m.scale.set(r[0], r[1], r[2]);
  m.rotation.set(rot[0], rot[1], rot[2]);
  return m;
}

// Tapered cylinder from point a (radius ra) to point b (radius rb).
function limb(
  a: THREE.Vector3,
  b: THREE.Vector3,
  ra: number,
  rb: number,
  mat: THREE.Material,
  seg = 6
): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rb, ra, len, seg, 1), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(UP, dir.divideScalar(len));
  return m;
}

// A flat, tapered wing spread horizontally from `origin`.
// side: +1 for the left wing (+X), -1 for the right.
// sweep: radians; positive sweeps the tip forward (+Z).
function buildWing(
  parent: THREE.Object3D,
  origin: THREE.Vector3,
  side: number,
  sweep: number,
  length: number,
  baseHalf: number,
  tipHalf: number,
  wingMat: THREE.Material,
  veinMat: THREE.Material
): void {
  const d = new THREE.Vector3(side * Math.cos(sweep), 0, Math.sin(sweep));
  const w = new THREE.Vector3().crossVectors(d, UP).normalize();
  const fs = Math.sign(w.z); // which local X side is the leading edge

  const geo = new THREE.CylinderGeometry(tipHalf, baseHalf, length, 8, 1);
  geo.scale(1, 1, 0.12); // flatten: local Z becomes thickness
  geo.translate(0, length / 2, 0); // base at origin, tip along +Y

  const wing = new THREE.Mesh(geo, wingMat);
  wing.position.copy(origin);
  wing.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(w, d, UP));
  parent.add(wing);

  const halfAt = (t: number) => baseHalf + (tipHalf - baseHalf) * t;

  // Leading vein along the front edge
  wing.add(
    limb(
      new THREE.Vector3(fs * baseHalf, 0, 0),
      new THREE.Vector3(fs * tipHalf, length, 0),
      0.00028,
      0.00028,
      veinMat,
      4
    )
  );

  // Cross veins reaching into the wing
  for (const t of [0.3, 0.52, 0.74]) {
    const r = halfAt(t);
    const y = length * t;
    wing.add(
      limb(
        new THREE.Vector3(fs * r, y, 0),
        new THREE.Vector3(-fs * r * 0.4, y + length * 0.05, 0),
        0.00013,
        0.00013,
        veinMat,
        3
      )
    );
  }

  // Pterostigma: dark mark on the leading edge near the tip
  const ts = 0.84;
  wing.add(
    ellipsoid(
      [fs * (halfAt(ts) - 0.0002), length * ts, 0],
      [0.0009, 0.0024, 0.0004],
      veinMat,
      6,
      4
    )
  );
}

export default function createDragonfly(): THREE.Object3D {
  const root = new THREE.Group();
  root.name = "dragonfly";

  // One material per colour, shared where used
  const mat = {
    black: new THREE.MeshStandardMaterial({ color: 0x0e1116, roughness: 0.55 }),
    blue: new THREE.MeshStandardMaterial({ color: 0x2b63dc, roughness: 0.35, metalness: 0.1 }),
    green: new THREE.MeshStandardMaterial({ color: 0x1d9e68, roughness: 0.4 }),
    eye: new THREE.MeshStandardMaterial({
      color: 0x19c8dc,
      roughness: 0.18,
      metalness: 0.35,
      flatShading: true,
    }),
    glint: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      emissive: 0xffffff,
      emissiveIntensity: 0.35,
    }),
    amber: new THREE.MeshStandardMaterial({ color: 0xffb13b, roughness: 0.4 }),
    wing: new THREE.MeshStandardMaterial({
      color: 0xffe6b0,
      transparent: true,
      opacity: 0.38,
      roughness: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    vein: new THREE.MeshStandardMaterial({ color: 0x2a1f14, roughness: 0.6 }),
    stone: new THREE.MeshStandardMaterial({ color: 0x8f8779, roughness: 0.9, flatShading: true }),
  };

  // Pebble the dragonfly rests on; its bottom sits on y = 0
  const STONE_TOP = 0.010;
  const stone = new THREE.Mesh(
    new THREE.CylinderGeometry(0.026, 0.030, STONE_TOP, 9, 1),
    mat.stone
  );
  stone.position.y = STONE_TOP / 2;
  root.add(stone);

  // Body centre height (thorax centre)
  const YB = STONE_TOP + 0.022;

  // Thorax
  root.add(ellipsoid([0, YB, 0], [0.0066, 0.0066, 0.0128], mat.green, 12, 8));
  // Dark dorsal ridge along the top of the thorax
  root.add(ellipsoid([0, YB + 0.0060, 0.0002], [0.0010, 0.0008, 0.0100], mat.black, 6, 4));
  // Two oblique black stripes per side
  for (const s of [1, -1]) {
    root.add(
      ellipsoid([s * 0.0061, YB + 0.0008, 0.0060], [0.0013, 0.0034, 0.0016], mat.black, 6, 4, [0.5, 0, 0])
    );
    root.add(
      ellipsoid([s * 0.0061, YB + 0.0004, -0.0018], [0.0013, 0.0032, 0.0015], mat.black, 6, 4, [-0.3, 0, 0])
    );
  }

  // Head
  root.add(ellipsoid([0, YB + 0.0006, 0.0186], [0.0056, 0.0050, 0.0056], mat.black, 12, 8));

  // Compound eyes: faceted icosphere with a specular glint on each
  const eyeGeo = new THREE.IcosahedronGeometry(1, 2);
  for (const s of [1, -1]) {
    const eyeC = new THREE.Vector3(s * 0.0034, YB + 0.0030, 0.0192);
    const eye = new THREE.Mesh(eyeGeo, mat.eye);
    eye.position.copy(eyeC);
    eye.scale.setScalar(0.0046);
    root.add(eye);

    const gdir = new THREE.Vector3(s * 0.45, 0.55, 0.7).normalize();
    const glint = new THREE.Mesh(new THREE.SphereGeometry(1, 6, 4), mat.glint);
    glint.position.copy(eyeC).addScaledVector(gdir, 0.0043);
    glint.scale.setScalar(0.0008);
    root.add(glint);
  }

  // Abdomen: ten banded segments that droop gently toward the tail
  const ABD_Z0 = -0.012;
  const ABD_LEN = 0.052;
  const abdAt = (t: number) =>
    new THREE.Vector3(0, YB - 0.006 * t * t, ABD_Z0 - ABD_LEN * t);
  const prof = [0.0040, 0.0046, 0.0046, 0.0042, 0.0038, 0.0035, 0.0032, 0.0030, 0.0028, 0.0027, 0.0026];
  const bands = [
    mat.blue, mat.blue, mat.black, mat.blue, mat.blue,
    mat.black, mat.blue, mat.blue, mat.black, mat.blue,
  ];
  for (let i = 0; i < 10; i++) {
    const front = abdAt(i / 10);
    const back = abdAt((i + 1) / 10);
    root.add(limb(back, front, prof[i + 1] * 0.9, prof[i], bands[i], 8));
  }

  // Amber tail club and two pointed cerci
  const tailEnd = abdAt(1);
  root.add(
    limb(
      tailEnd,
      new THREE.Vector3(0, tailEnd.y - 0.0004, -0.07),
      0.0021,
      0.0015,
      mat.amber,
      8
    )
  );
  for (const s of [1, -1]) {
    root.add(
      limb(
        new THREE.Vector3(s * 0.0006, tailEnd.y - 0.0003, -0.0676),
        new THREE.Vector3(s * 0.0018, tailEnd.y - 0.0008, -0.0728),
        0.00055,
        0.00012,
        mat.amber,
        4
      )
    );
  }

  // Legs: three pairs, splayed out to grip the pebble
  const FOOT_Y = STONE_TOP + 0.0006;
  const legDefs = [
    { z: 0.007, knee: [0.0128, 0.02, 0.008], foot: [0.0186, 0.0128] }, // front, reaching forward
    { z: 0.0005, knee: [0.015, 0.0178, 0.0005], foot: [0.0206, 0.0006] }, // middle, wide
    { z: -0.0065, knee: [0.0128, 0.02, -0.0085], foot: [0.0176, -0.0128] }, // rear, reaching back
  ];
  for (const s of [1, -1]) {
    for (const L of legDefs) {
      const hip = new THREE.Vector3(s * 0.004, YB - 0.003, L.z);
      const knee = new THREE.Vector3(s * L.knee[0], L.knee[1], L.knee[2]);
      const foot = new THREE.Vector3(s * L.foot[0], FOOT_Y, L.foot[1]);
      root.add(limb(hip, knee, 0.0006, 0.0005, mat.black, 5));
      root.add(limb(knee, foot, 0.0005, 0.00035, mat.black, 5));
      const joint = new THREE.Mesh(new THREE.SphereGeometry(0.0007, 6, 4), mat.black);
      joint.position.copy(knee);
      root.add(joint);
    }
  }

  // Wings: two pairs spread flat, forewings swept slightly forward
  const wingY = YB + 0.0035;
  for (const s of [1, -1]) {
    buildWing(
      root,
      new THREE.Vector3(s * 0.0045, wingY, 0.004),
      s,
      0.22,
      0.048,
      0.002,
      0.005,
      mat.wing,
      mat.vein
    );
    buildWing(
      root,
      new THREE.Vector3(s * 0.004, wingY, -0.004),
      s,
      -0.12,
      0.044,
      0.0028,
      0.0058,
      mat.wing,
      mat.vein
    );
  }

  return root;
}
