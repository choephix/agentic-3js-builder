```ts
import * as THREE from "three";

export const meta = {
  name: "Brass Star-Gazer Refractor",
  description:
    "A stylized antique refractor telescope: a star-speckled navy tube with brass bands, dew shield and finder scope, on a brass fork mount over a wooden tripod with an eyepiece tray.",
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function woodTexture(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#8b5a30";
  g.fillRect(0, 0, 64, 256);
  const r = rng(7);
  for (let i = 0; i < 18; i++) {
    const x = r() * 64;
    g.strokeStyle = r() > 0.5 ? "rgba(70,38,16,0.55)" : "rgba(180,120,70,0.35)";
    g.lineWidth = 1 + r() * 2.5;
    g.beginPath();
    g.moveTo(x, 0);
    for (let y = 0; y <= 256; y += 16) g.lineTo(x + Math.sin(y * 0.05 + i) * 3, y);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function starTexture(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#1c2a5e";
  g.fillRect(0, 0, 512, 256);
  const r = rng(42);
  // small stars
  for (let i = 0; i < 160; i++) {
    g.fillStyle = r() > 0.3 ? "#f3d27a" : "#ffffff";
    const s = 1 + r() * 2;
    g.fillRect(r() * 512, r() * 256, s, s);
  }
  // constellation lines
  for (let k = 0; k < 5; k++) {
    let x = r() * 512,
      y = r() * 256;
    g.strokeStyle = "rgba(243,210,122,0.6)";
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(x, y);
    for (let j = 0; j < 4; j++) {
      x += (r() - 0.5) * 80;
      y += (r() - 0.5) * 60;
      g.lineTo(x, y);
      g.fillStyle = "#ffe9a8";
      g.fillRect(x - 2.5, y - 2.5, 5, 5);
    }
    g.stroke();
  }
  // gold pinstripe bands
  g.fillStyle = "#d8b05a";
  g.fillRect(0, 10, 512, 3);
  g.fillRect(0, 243, 512, 3);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export default function build(): THREE.Object3D {
  const root = new THREE.Group();

  const brass = new THREE.MeshStandardMaterial({ color: 0xd2a650, metalness: 0.8, roughness: 0.32, flatShading: true });
  const darkBrass = new THREE.MeshStandardMaterial({ color: 0x8c6a2c, metalness: 0.75, roughness: 0.45, flatShading: true });
  const tubeMat = new THREE.MeshStandardMaterial({ map: starTexture(), metalness: 0.3, roughness: 0.45, side: THREE.DoubleSide });
  const wood = new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.7, flatShading: true });
  const black = new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.6, flatShading: true });
  const glass = new THREE.MeshStandardMaterial({ color: 0x8fd4ff, emissive: 0x1d4a6a, metalness: 0.4, roughness: 0.08 });
  const red = new THREE.MeshStandardMaterial({ color: 0xb8322a, roughness: 0.5, flatShading: true });
  const cream = new THREE.MeshStandardMaterial({ color: 0xf1e4c4, roughness: 0.6, flatShading: true });

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Object3D, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };
  const cylZ = (p: THREE.Object3D, rT: number, rB: number, len: number, seg: number, mat: THREE.Material, z: number, x = 0, y = 0, open = false) => {
    const m = add(new THREE.CylinderGeometry(rT, rB, len, seg, 1, open), mat, p, x, y, z);
    m.rotation.x = Math.PI / 2;
    return m;
  };
  const cylX = (p: THREE.Object3D, r: number, len: number, seg: number, mat: THREE.Material, x: number, y = 0, z = 0) => {
    const m = add(new THREE.CylinderGeometry(r, r, len, seg), mat, p, x, y, z);
    m.rotation.z = Math.PI / 2;
    return m;
  };
  const cylY = (p: THREE.Object3D, rT: number, rB: number, len: number, seg: number, mat: THREE.Material, x: number, y: number, z: number) =>
    add(new THREE.CylinderGeometry(rT, rB, len, seg), mat, p, x, y, z);

  const Yv = new THREE.Vector3(0, 1, 0);
  const strut = (a: THREE.Vector3, b: THREE.Vector3, w: number, d: number, mat: THREE.Material, round = false) => {
    const dir = b.clone().sub(a);
    const len = dir.length();
    const geo = round ? new THREE.CylinderGeometry(w, w, len, 6) : new THREE.BoxGeometry(w, len, d);
    const m = add(geo, mat, root);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(Yv, dir.normalize());
    return m;
  };

  // ---------- Tripod ----------
  const legAngles = [Math.PI, Math.PI / 3, -Math.PI / 3];
  const topY = 1.04,
    footY = 0.04,
    topR = 0.07,
    footR = 0.55;
  const legPt = (a: number, t: number) => {
    const r = topR + (footR - topR) * t;
    return new THREE.Vector3(Math.sin(a) * r, topY + (footY - topY) * t, Math.cos(a) * r);
  };
  for (const a of legAngles) {
    const T = legPt(a, 0),
      F = legPt(a, 1);
    const leg = strut(T, F, 0.05, 0.03, wood);
    leg.rotateY(a);
    // hinge cap
    const hinge = add(new THREE.BoxGeometry(0.06, 0.07, 0.045), brass, root);
    hinge.position.copy(legPt(a, 0.03));
    hinge.quaternion.copy(leg.quaternion);
    // clamp with knob
    const cp = legPt(a, 0.42);
    const clamp = add(new THREE.BoxGeometry(0.066, 0.05, 0.042), brass, root);
    clamp.position.copy(cp);
    clamp.quaternion.copy(leg.quaternion);
    const knob = add(new THREE.SphereGeometry(0.016, 6, 4), red, root);
    knob.position.set(cp.x + Math.sin(a) * 0.035, cp.y, cp.z + Math.cos(a) * 0.035);
    // ferrule + spike foot
    const fe = add(new THREE.CylinderGeometry(0.028, 0.028, 0.06, 8), brass, root);
    fe.position.copy(legPt(a, 0.97));
    fe.quaternion.copy(leg.quaternion);
    const spike = add(new THREE.ConeGeometry(0.022, 0.05, 8), darkBrass, root, F.x, 0.025, F.z);
    spike.rotation.x = Math.PI;
  }

  // Spreader tray
  const trayY = 0.42;
  const tray = add(new THREE.CylinderGeometry(0.22, 0.22, 0.016, 3), wood, root, 0, trayY, 0);
  tray.rotation.y = Math.PI / 3;
  const rim = add(new THREE.CylinderGeometry(0.228, 0.228, 0.008, 3), brass, root, 0, trayY - 0.011, 0);
  rim.rotation.y = Math.PI / 3;
  cylY(root, 0.03, 0.03, 0.03, 8, brass, 0, trayY + 0.02, 0);
  const tLeg = (topY - trayY) / (topY - footY);
  for (const a of legAngles) {
    const inner = new THREE.Vector3(Math.sin(a) * 0.2, trayY, Math.cos(a) * 0.2);
    const outer = legPt(a, tLeg);
    strut(inner, outer, 0.008, 0, brass, true);
    // eyepieces stored on the tray
    const ea = a + Math.PI / 3;
    const ex = Math.sin(ea) * 0.07,
      ez = Math.cos(ea) * 0.07;
    cylY(root, 0.016, 0.016, 0.05, 8, black, ex, trayY + 0.033, ez);
    cylY(root, 0.019, 0.019, 0.012, 8, brass, ex, trayY + 0.064, ez);
    cylY(root, 0.011, 0.011, 0.003, 8, glass, ex, trayY + 0.071, ez);
  }

  // ---------- Mount head ----------
  cylY(root, 0.12, 0.12, 0.04, 12, wood, 0, 1.06, 0);
  cylY(root, 0.125, 0.125, 0.012, 12, brass, 0, 1.04, 0);
  cylY(root, 0.075, 0.085, 0.05, 10, brass, 0, 1.1, 0);
  cylY(root, 0.02, 0.02, 0.02, 6, red, 0.1, 1.09, 0).rotation.z = Math.PI / 2;

  const pivotY = 1.29;
  add(new THREE.BoxGeometry(0.2, 0.025, 0.07), brass, root, 0, 1.135, 0);
  for (const s of [-1, 1]) {
    add(new THREE.BoxGeometry(0.018, 0.17, 0.06), darkBrass, root, s * 0.09, 1.215, 0);
    add(new THREE.CylinderGeometry(0.03, 0.03, 0.018, 12), darkBrass, root, s * 0.09, pivotY, 0).rotation.z = Math.PI / 2;
    cylX(root, 0.026, 0.02, 10, brass, s * 0.108, pivotY, 0);
    cylX(root, 0.012, 0.03, 6, black, s * 0.13, pivotY, 0);
  }
  // slow-motion rod
  strut(new THREE.Vector3(0.1, 1.2, 0), new THREE.Vector3(0.14, 0.98, -0.2), 0.006, 0, brass, true);
  add(new THREE.SphereGeometry(0.018, 6, 4), black, root, 0.14, 0.98, -0.2);

  // ---------- Optical tube ----------
  const ota = new THREE.Group();
  ota.position.set(0, pivotY, 0);
  ota.rotation.x = -0.5;
  root.add(ota);

  const R = 0.055;
  cylZ(ota, R, R, 0.95, 16, tubeMat, 0.025);
  for (const z of [-0.43, 0.48]) cylZ(ota, R + 0.006, R + 0.006, 0.025, 16, brass, z);
  cylZ(ota, R + 0.009, R + 0.009, 0.09, 16, brass, 0); // cradle ring
  for (const z of [-0.04, 0.04]) cylZ(ota, R + 0.013, R + 0.013, 0.01, 16, darkBrass, z);
  // dew shield
  cylZ(ota, 0.068, 0.068, 0.2, 16, tubeMat, 0.6, 0, 0, true);
  cylZ(ota, 0.073, 0.073, 0.025, 16, brass, 0.7);
  cylZ(ota, 0.073, 0.073, 0.02, 16, brass, 0.505);
  cylZ(ota, 0.066, 0.066, 0.004, 16, black, 0.51);
  cylZ(ota, 0.058, 0.058, 0.01, 16, glass, 0.53);
  cylZ(ota, 0.06, 0.06, 0.012, 16, brass, 0.52);

  // rear cell + focuser
  cylZ(ota, R, 0.042, 0.05, 16, brass, -0.475);
  cylZ(ota, 0.024, 0.024, 0.13, 10, brass, -0.565);
  cylZ(ota, 0.03, 0.03, 0.04, 8, darkBrass, -0.53);
  cylX(ota, 0.006, 0.12, 6, brass, 0, 0, -0.53);
  for (const s of [-1, 1]) cylX(ota, 0.018, 0.018, 10, black, s * 0.06, 0, -0.53);
  // star diagonal + eyepiece (pointing local up)
  add(new THREE.BoxGeometry(0.045, 0.045, 0.045), brass, ota, 0, 0, -0.645);
  cylY(ota, 0.019, 0.019, 0.05, 10, brass, 0, 0.045, -0.645);
  cylY(ota, 0.022, 0.022, 0.06, 10, black, 0, 0.1, -0.645);
  cylY(ota, 0.025, 0.025, 0.01, 10, brass, 0, 0.075, -0.645);
  cylY(ota, 0.026, 0.022, 0.025, 10, black, 0, 0.142, -0.645);
  cylY(ota, 0.012, 0.012, 0.004, 8, glass, 0, 0.156, -0.645);

  // finder scope
  const fy = R + 0.045;
  for (const z of [-0.02, 0.2]) {
    add(new THREE.BoxGeometry(0.012, 0.035, 0.014), darkBrass, ota, 0, R + 0.018, z);
    cylZ(ota, 0.024, 0.024, 0.018, 10, brass, z, 0, fy);
    cylX(ota, 0.004, 0.06, 4, black, 0, fy + 0.02, z).rotation.set(0, 0, 0);
  }
  cylZ(ota, 0.017, 0.017, 0.3, 10, tubeMat, 0.09, 0, fy);
  cylZ(ota, 0.024, 0.018, 0.06, 10, brass, 0.26, 0, fy);
  cylZ(ota, 0.02, 0.02, 0.004, 10, glass, 0.291, 0, fy);
  cylZ(ota, 0.011, 0.011, 0.04, 8, black, -0.08, 0, fy);
  cylZ(ota, 0.013, 0.013, 0.008, 8, brass, -0.1, 0, fy);

  // little maker's plaque
  const plaque = add(new THREE.BoxGeometry(0.004, 0.03, 0.08), cream, ota, R + 0.001, 0, -0.25);
  plaque.rotation.y = 0;
  add(new THREE.BoxGeometry(0.003, 0.034, 0.086), brass, ota, R - 0.001, 0, -0.25);

  return root;
}
```