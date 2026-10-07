import * as THREE from "three";

export const meta = {
  name: "Moon Jellyfish",
  description: "Glowing low-poly moon jellyfish with translucent bell, four pink gonad horseshoes, frilly rim tentacles and four ruffled oral arms, drifting upward.",
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const rand = rng(7);

  const bellMat = new THREE.MeshStandardMaterial({
    color: 0xa8d8f5, emissive: 0x4a90c8, emissiveIntensity: 0.55,
    transparent: true, opacity: 0.45, roughness: 0.2, flatShading: true,
    side: THREE.DoubleSide, depthWrite: false,
  });
  const innerMat = new THREE.MeshStandardMaterial({
    color: 0xcfeaff, emissive: 0x8fd0ff, emissiveIntensity: 0.9,
    transparent: true, opacity: 0.3, roughness: 0.3, flatShading: true, depthWrite: false,
  });
  const pinkMat = new THREE.MeshStandardMaterial({
    color: 0xff8fc0, emissive: 0xff4f9a, emissiveIntensity: 0.7, roughness: 0.5, flatShading: true,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xd8f0ff, emissive: 0x7fc4f0, emissiveIntensity: 0.6,
    transparent: true, opacity: 0.8, roughness: 0.4,
  });
  const pearlMat = new THREE.MeshStandardMaterial({
    color: 0xf6f2ff, emissive: 0xc8c0ee, emissiveIntensity: 0.45, roughness: 0.4, flatShading: true,
    transparent: true, opacity: 0.92,
  });
  const lilacMat = new THREE.MeshStandardMaterial({
    color: 0xc4a4f0, emissive: 0x8a62d0, emissiveIntensity: 0.5, roughness: 0.4, flatShading: true,
    transparent: true, opacity: 0.92,
  });
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xe8b8ff, emissive: 0xb070e0, emissiveIntensity: 0.6, roughness: 0.4, flatShading: true,
  });

  // Whole animal group, bell top about y=1.5
  const jelly = new THREE.Group();
  root.add(jelly);

  // Bell: dome
  const bellR = 0.5;
  const bellY = 0.95;
  const bell = new THREE.Mesh(
    new THREE.SphereGeometry(bellR, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
    bellMat
  );
  bell.scale.set(1, 0.62, 1);
  bell.position.y = bellY;
  jelly.add(bell);

  // Inner dome (glowing core)
  const inner = new THREE.Mesh(
    new THREE.SphereGeometry(bellR * 0.82, 14, 7, 0, Math.PI * 2, 0, Math.PI * 0.5),
    innerMat
  );
  inner.scale.set(1, 0.55, 1);
  inner.position.y = bellY + 0.01;
  jelly.add(inner);

  // Bell ridges (radial ribs)
  const ribMat = rimMat;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 0.5), ribMat);
    // approximate arc with a tilted thin box
    rib.position.set(Math.cos(a) * 0.25, bellY + 0.22, Math.sin(a) * 0.25);
    rib.rotation.order = "YXZ";
    rib.rotation.y = Math.PI / 2 - a;
    rib.rotation.x = -0.75;
    rib.scale.z = 0.85;
    jelly.add(rib);
  }

  // Rim torus
  const rim = new THREE.Mesh(new THREE.TorusGeometry(bellR, 0.02, 5, 24), rimMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = bellY;
  jelly.add(rim);

  // Frilly rim of fine tentacles
  const N = 72;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const len = 0.14 + rand() * 0.08;
    const segs = 3;
    let px = Math.cos(a) * (bellR - 0.005);
    let pz = Math.sin(a) * (bellR - 0.005);
    let py = bellY - 0.005;
    for (let s = 0; s < segs; s++) {
      const l = len / segs;
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.007, l, 4), rimMat);
      const wob = Math.sin(i * 0.9 + s) * 0.02;
      seg.position.set(px + wob * 0.5, py - l / 2, pz);
      jelly.add(seg);
      py -= l;
      px += Math.cos(a) * 0.012 * (s + 1);
      pz += Math.sin(a) * 0.012 * (s + 1);
    }
  }

  // Pink horseshoes (4 gonads) arranged in a ring
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const g = new THREE.Group();
    const arcN = 7;
    for (let k = 0; k < arcN; k++) {
      const t = -0.5 + k / (arcN - 1); // -0.5..0.5
      const ang = t * Math.PI * 1.45;
      // horseshoe opening towards center
      const hx = Math.sin(ang) * 0.075;
      const hz = Math.cos(ang) * 0.075;
      const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(0.032, 0), pinkMat);
      blob.position.set(hx, 0, hz);
      blob.scale.set(1, 0.55, 1);
      g.add(blob);
    }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.016, 4, 12, Math.PI * 1.45), pinkMat);
    ring.rotation.x = Math.PI / 2;
    ring.rotation.z = Math.PI / 2 - Math.PI * 0.725 + Math.PI / 2 * 0;
    ring.visible = false;
    g.add(ring);
    g.position.set(Math.cos(a) * 0.19, bellY + 0.1, Math.sin(a) * 0.19);
    g.rotation.y = a + Math.PI / 2 - Math.PI / 2;
    // face opening toward center: local +z points outward after rotation
    g.rotation.y = Math.PI / 2 - a;
    jelly.add(g);
  }

  // Manubrium (central stalk)
  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.12, 8), pearlMat);
  stalk.position.y = bellY - 0.04;
  jelly.add(stalk);
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.07, 0.04, 8), ringMat);
  knob.position.y = bellY + 0.04;
  jelly.add(knob);

  // Four long ruffled oral arms
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const arm = new THREE.Group();
    const L = 0.75;
    const segs = 14;
    let y = 0;
    for (let s = 0; s < segs; s++) {
      const t = s / (segs - 1);
      const h = L / segs;
      const w = 0.075 * (1 - t * 0.7);
      const mat = s % 2 ? pearlMat : lilacMat;
      const sway = Math.sin(t * 5 + i * 1.7) * 0.03 * t;
      // ruffle: flat wide box rotated alternately
      const ruffle = new THREE.Mesh(new THREE.BoxGeometry(w * 2.2, h * 1.1, 0.012), mat);
      ruffle.position.set(sway, y - h / 2, 0);
      ruffle.rotation.y = (s % 2 ? 1 : -1) * 0.5 + t * 0.6;
      ruffle.rotation.z = Math.sin(s * 1.3) * 0.12;
      arm.add(ruffle);
      const core = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, h * 1.05, w * 0.7), mat);
      core.position.set(sway, y - h / 2, 0);
      core.rotation.y = s * 0.5;
      arm.add(core);
      y -= h;
    }
    // frilly tip
    const tip = new THREE.Mesh(new THREE.OctahedronGeometry(0.03, 0), lilacMat);
    tip.position.set(Math.sin(5 + i * 1.7) * 0.03, y - 0.02, 0);
    tip.scale.set(1, 1.8, 1);
    arm.add(tip);

    arm.position.set(Math.cos(a) * 0.09, bellY - 0.1, Math.sin(a) * 0.09);
    arm.rotation.y = -a;
    arm.rotation.z = 0.0;
    jelly.add(arm);
  }

  // A few long thin trailing tentacle wisps
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.2;
    const l = 0.35 + rand() * 0.2;
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.005, l, 4), rimMat);
    w.position.set(Math.cos(a) * 0.46, bellY - 0.15 - l / 2, Math.sin(a) * 0.46);
    w.rotation.z = (rand() - 0.5) * 0.15;
    jelly.add(w);
  }

  // Inner light
  const light = new THREE.PointLight(0x9fd8ff, 1.2, 4);
  light.position.y = bellY + 0.12;
  jelly.add(light);

  // Rise: lowest point (arm tips) to y=0 -> arms bottom ~ bellY-0.1-0.75-0.05 = 0.05
  jelly.position.y = 0;
  // shift so lowest at ~0
  jelly.position.y = -0.04;

  // Slight upward-drift tilt
  jelly.rotation.x = 0.04;

  return root;
}
