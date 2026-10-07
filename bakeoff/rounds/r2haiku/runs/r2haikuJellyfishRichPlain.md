```ts
import * as THREE from "three";

export const meta = {
  name: "Glowing Moon Jellyfish",
  description:
    "A translucent pale-blue moon jellyfish drifting upward, with four pink horseshoe gonads, a frilly rim of fine tentacles, and four ruffled pearly oral arms lit from within.",
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function createMoonJellyfish(): THREE.Object3D {
  const rand = mulberry32(20417);
  const root = new THREE.Group();

  // Materials: one per colour, shared.
  const bellMat = new THREE.MeshStandardMaterial({
    color: 0xbfe6ff,
    emissive: 0x5aaeff,
    emissiveIntensity: 0.55,
    roughness: 0.3,
    metalness: 0.0,
    transparent: true,
    opacity: 0.38,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const pinkMat = new THREE.MeshStandardMaterial({
    color: 0xff6fae,
    emissive: 0xff3c8a,
    emissiveIntensity: 0.25,
    roughness: 0.5,
  });
  const pearlMat = new THREE.MeshStandardMaterial({
    color: 0xfff6ee,
    emissive: 0xf0e6ff,
    emissiveIntensity: 0.15,
    roughness: 0.35,
    metalness: 0.05,
  });
  const lilacMat = new THREE.MeshStandardMaterial({
    color: 0xc9a6ff,
    emissive: 0x7d4fd6,
    emissiveIntensity: 0.2,
    roughness: 0.45,
    transparent: true,
    opacity: 0.92,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xe4f6ff,
    emissive: 0x9fd8ff,
    emissiveIntensity: 0.4,
    roughness: 0.4,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
  });

  // Bell origin: rim sits at y = RIM_Y, dome rises above it.
  const RIM_Y = 0.7;
  const BELL_R = 0.14;
  const BELL_SQUASH = 0.8;

  // Dome: upper hemisphere, squashed vertically.
  const bellGeo = new THREE.SphereGeometry(BELL_R, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2);
  const bell = new THREE.Mesh(bellGeo, bellMat);
  bell.scale.set(1, BELL_SQUASH, 1);
  bell.position.y = RIM_Y;
  bell.renderOrder = 2;
  root.add(bell);

  // Glowing core light from within the bell.
  const core = new THREE.PointLight(0x9fd8ff, 0.7, 1.6, 1.5);
  core.position.set(0, RIM_Y + 0.05, 0);
  root.add(core);

  // Soft inner glow sphere, a faint halo.
  const glowMat = new THREE.MeshStandardMaterial({
    color: 0x8fd0ff,
    emissive: 0x6fbfff,
    emissiveIntensity: 0.9,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
  });
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), glowMat);
  glow.position.set(0, RIM_Y + 0.06, 0);
  glow.scale.set(1, 0.7, 1);
  root.add(glow);

  // Four pink horseshoe gonads inside the bell.
  const ARC = Math.PI * 1.3;
  const horseGeo = new THREE.TorusGeometry(0.045, 0.011, 8, 22, ARC);
  horseGeo.rotateZ(-ARC / 2); // centre the opening arc on +X
  horseGeo.rotateX(-Math.PI / 2); // lay flat in XZ plane
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const m = new THREE.Mesh(horseGeo, pinkMat);
    m.position.set(Math.cos(a) * 0.072, RIM_Y + 0.03, Math.sin(a) * 0.072);
    m.rotation.y = -a;
    root.add(m);
  }

  // Rim ring: a pale band around the bell edge.
  const rimRing = new THREE.Mesh(
    new THREE.TorusGeometry(BELL_R * 0.99, 0.006, 6, 56),
    rimMat
  );
  rimRing.rotation.x = Math.PI / 2;
  rimRing.position.y = RIM_Y;
  root.add(rimRing);

  // Frilly rim of fine tentacles hanging from the bell edge.
  const tentGeo = new THREE.ConeGeometry(0.0045, 1, 4, 1);
  tentGeo.rotateX(Math.PI);
  tentGeo.translate(0, -0.5, 0); // base at origin, tip at -1
  const TENT_COUNT = 72;
  for (let i = 0; i < TENT_COUNT; i++) {
    const a = (i / TENT_COUNT) * Math.PI * 2;
    const len = 0.05 + rand() * 0.04;
    const t = new THREE.Mesh(tentGeo, rimMat);
    const r = BELL_R * 0.98;
    t.position.set(Math.cos(a) * r, RIM_Y - 0.005, Math.sin(a) * r);
    t.scale.set(1, len, 1);
    // Tilt slightly outward so the fringe flares.
    t.rotation.z = Math.cos(a) * 0.12;
    t.rotation.x = Math.sin(a) * 0.12;
    root.add(t);
  }

  // Four ruffled oral arms trailing below the bell.
  const frillGeo = new THREE.SphereGeometry(0.02, 8, 6);
  const armCount = 4;
  for (let i = 0; i < armCount; i++) {
    const a = (i / armCount) * Math.PI * 2 + Math.PI / 4;
    const dx = Math.cos(a);
    const dz = Math.sin(a);
    const wob = (rand() - 0.5) * 0.05;

    const pts = [
      new THREE.Vector3(dx * 0.03, RIM_Y - 0.01, dz * 0.03),
      new THREE.Vector3(dx * 0.06, RIM_Y - 0.09, dz * 0.06),
      new THREE.Vector3(dx * 0.09 + wob, RIM_Y - 0.19, dz * 0.09 - wob),
      new THREE.Vector3(dx * 0.11, RIM_Y - 0.29, dz * 0.11 + wob),
      new THREE.Vector3(dx * 0.13 - wob, RIM_Y - 0.39, dz * 0.13),
      new THREE.Vector3(dx * 0.12, RIM_Y - 0.46, dz * 0.12 + wob * 0.5),
    ];
    const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);

    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 48, 0.007, 6, false),
      pearlMat
    );
    root.add(tube);

    // Ruffle frills alternating either side of each arm.
    const FRILLS = 16;
    for (let f = 1; f < FRILLS; f++) {
      const t = f / FRILLS;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t).normalize();
      const side = f % 2 === 0 ? 1 : -1;
      const perp = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
      const frillMat = f % 3 === 0 ? pearlMat : lilacMat;
      const frill = new THREE.Mesh(frillGeo, frillMat);
      frill.position.copy(p).addScaledVector(perp, side * 0.012);
      frill.scale.set(0.35, 1.0, 1.6 + rand() * 0.6);
      frill.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tan);
      root.add(frill);
    }

    // Small fringed tip at the end of each arm.
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), lilacMat);
    tip.position.copy(pts[pts.length - 1]);
    tip.scale.set(1, 1.6, 1);
    root.add(tip);
  }

  // Fine glowing mouth nub at the centre of the arms.
  const mouth = new THREE.Mesh(
    new THREE.SphereGeometry(0.02, 10, 8),
    pearlMat
  );
  mouth.position.set(0, RIM_Y - 0.015, 0);
  mouth.scale.set(1, 0.6, 1);
  root.add(mouth);

  // Hover the jellyfish: lowest arm tip stays well above the floor.
  root.position.y = 0.05;

  return root;
}
```