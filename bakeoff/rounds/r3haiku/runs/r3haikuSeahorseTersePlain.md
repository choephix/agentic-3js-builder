```ts
import * as THREE from "three";

export const meta = {
  name: "Seahorse",
  description:
    "A stylized seahorse: segmented armoured trunk, curled prehensile tail, fan dorsal fin, and a crown on its head.",
};

const UP = new THREE.Vector3(0, 1, 0);

const palette = {
  body: 0xe8703a,
  belly: 0xf6cf7a,
  dark: 0xa8421f,
  fin: 0xf9a25c,
  crown: 0xf2b84b,
  eye: 0xffffff,
  pupil: 0x141414,
  snout: 0xc85a2c,
};

const mats = {};
function mat(key, rough = 0.5, side = THREE.FrontSide) {
  if (!mats[key]) {
    mats[key] = new THREE.MeshStandardMaterial({
      color: palette[key],
      roughness: rough,
      metalness: 0.02,
      side,
    });
  }
  return mats[key];
}

const sphereBig = new THREE.SphereGeometry(1, 12, 9);
const sphereSmall = new THREE.SphereGeometry(1, 8, 6);

function ellipsoid(geo, material, x, y, z, sx, sy, sz, parent) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.scale.set(sx, sy, sz);
  parent.add(m);
  return m;
}

// Cylinder/cone-like strut from point a to point b, radius r0 at a, r1 at b.
function strut(a, b, r0, r1, material, parent, seg = 8) {
  const d = new THREE.Vector3().subVectors(b, a);
  const L = d.length();
  const g = new THREE.CylinderGeometry(r1, r0, L, seg);
  const m = new THREE.Mesh(g, material);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(UP, d.normalize());
  parent.add(m);
  return m;
}

function spike(base, dir, radius, height, material, parent) {
  const g = new THREE.ConeGeometry(radius, height, 5);
  const m = new THREE.Mesh(g, material);
  m.position.copy(base).addScaledVector(dir.clone().normalize(), height / 2);
  m.quaternion.setFromUnitVectors(UP, dir.clone().normalize());
  parent.add(m);
  return m;
}

export default function createSeahorse() {
  const root = new THREE.Group();
  const bodyM = mat("body", 0.5);
  const bellyM = mat("belly", 0.6);
  const darkM = mat("dark", 0.6);
  const finM = mat("fin", 0.45, THREE.DoubleSide);
  const crownM = mat("crown", 0.4);
  const eyeM = mat("eye", 0.2);
  const pupilM = mat("pupil", 0.3);
  const snoutM = mat("snout", 0.5);

  // ---- Trunk: chain of armoured segments curving from chest down to the tail ----
  const N = 12;
  const spine = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const y = 0.21 - 0.15 * t;
    const z = 0.045 * Math.sin(Math.PI * t * 0.9) - 0.035 * t;
    const r = 0.046 * (1 - 0.42 * t) + 0.004;
    spine.push({ y, z, r });

    ellipsoid(sphereBig, bodyM, 0, y, z, r * 0.9, r * 1.1, r * 1.05, root);
    // Pale belly plate on the forward face of each segment
    ellipsoid(
      sphereSmall,
      bellyM,
      0,
      y - 0.002,
      z + r * 0.45,
      r * 0.6,
      r * 0.9,
      r * 0.5,
      root
    );
  }

  // Bony rings between segments read as the seahorse's armour plates
  for (let i = 1; i < N - 1; i += 2) {
    const s = spine[i];
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(s.r * 0.98, 0.0032, 4, 14),
      darkM
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, s.y, s.z);
    root.add(ring);
  }

  // ---- Head ----
  const headY = 0.265;
  const headZ = 0.035;
  ellipsoid(sphereBig, bodyM, 0, headY, headZ, 0.042, 0.048, 0.045, root);
  // Cheek/jaw shading
  ellipsoid(sphereSmall, bellyM, 0, headY - 0.02, headZ + 0.01, 0.03, 0.02, 0.03, root);

  // Snout: tapered tube angled forward and slightly down
  const snoutBase = new THREE.Vector3(0, 0.268, 0.07);
  const snoutTip = new THREE.Vector3(0, 0.245, 0.165);
  strut(snoutBase, snoutTip, 0.015, 0.009, snoutM, root, 8);
  // Mouth opening at the tip
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.008, 0.01), darkM);
  mouth.position.set(0, 0.246, 0.167);
  root.add(mouth);

  // Eyes: bright white with dark pupils pointed forward
  for (const side of [-1, 1]) {
    ellipsoid(sphereSmall, eyeM, side * 0.028, 0.282, 0.054, 0.013, 0.013, 0.013, root);
    ellipsoid(sphereSmall, pupilM, side * 0.036, 0.283, 0.062, 0.006, 0.006, 0.006, root);
  }

  // Coronet: a small crown of spikes on top of the head
  const crownDirs = [
    { p: [0, 0.31, 0.02], d: [0, 1, -0.5], h: 0.04 },
    { p: [0.012, 0.305, 0.012], d: [0.3, 1, -0.5], h: 0.028 },
    { p: [-0.012, 0.305, 0.012], d: [-0.3, 1, -0.5], h: 0.028 },
  ];
  for (const c of crownDirs) {
    spike(
      new THREE.Vector3(...c.p),
      new THREE.Vector3(...c.d),
      0.008,
      c.h,
      crownM,
      root
    );
  }

  // ---- Dorsal fin: fan shape on the back of the trunk ----
  const fanShape = new THREE.Shape();
  fanShape.moveTo(0, 0);
  fanShape.lineTo(0.05, 0);
  fanShape.quadraticCurveTo(0.065, 0.05, 0.02, 0.078);
  fanShape.quadraticCurveTo(0.0, 0.04, 0, 0);
  const finGeo = new THREE.ExtrudeGeometry(fanShape, {
    depth: 0.004,
    bevelEnabled: false,
    curveSegments: 6,
  });
  finGeo.translate(0, 0, -0.002);
  finGeo.rotateY(Math.PI / 2);
  const dorsal = new THREE.Mesh(finGeo, finM);
  dorsal.position.set(0, 0.14, -0.005);
  root.add(dorsal);

  // Fan rays: thin dark struts across the dorsal fin
  for (let k = 0; k < 4; k++) {
    const a = k / 4;
    const base = new THREE.Vector3(0, 0.14, -0.005 - a * 0.05);
    const tip = new THREE.Vector3(0, 0.14 + 0.02 + a * 0.02, -0.005 - a * 0.05 - 0.008);
    strut(base, tip, 0.0018, 0.0012, darkM, root, 4);
  }

  // ---- Pectoral fin: small rounded fin on the side ----
  const pec = new THREE.Mesh(new THREE.CircleGeometry(0.028, 10), finM);
  pec.scale.set(1, 0.7, 1);
  pec.rotation.y = Math.PI / 2;
  pec.position.set(0.046, 0.18, 0.012);
  root.add(pec);

  // ---- Prehensile tail: a spiral curling forward under the body ----
  const cy = 0.03;
  const cz = -0.03;
  const R0 = 0.03;
  const turns = 3.2;
  const pts = [];
  const steps = 64;
  for (let i = 0; i <= steps; i++) {
    const s = i / steps;
    const th = s * turns * Math.PI;
    const R = R0 * (1 - 0.45 * s);
    pts.push(new THREE.Vector3(0, cy + R * Math.cos(th), cz + R * Math.sin(th)));
  }
  const tailCurve = new THREE.CatmullRomCurve3(pts);
  const tailGeo = new THREE.TubeGeometry(tailCurve, 120, 0.008, 6, false);
  const tail = new THREE.Mesh(tailGeo, bodyM);
  root.add(tail);

  // Tail-tip ornament: small dark bead where the curl tapers
  const tipPos = pts[pts.length - 1];
  ellipsoid(sphereSmall, darkM, tipPos.x, tipPos.y, tipPos.z, 0.007, 0.007, 0.007, root);

  // Join the trunk to the tail base
  const tailStart = pts[0];
  const tailJoin = spine[N - 1];
  ellipsoid(
    sphereSmall,
    bodyM,
    0,
    (tailJoin.y + tailStart.y) / 2,
    (tailJoin.z + tailStart.z) / 2,
    0.02,
    0.02,
    0.02,
    root
  );

  return root;
}
```