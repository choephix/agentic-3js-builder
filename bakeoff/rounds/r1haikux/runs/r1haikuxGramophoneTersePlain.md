```ts
import * as THREE from "three";

export const meta = {
  name: "Gramophone",
  description:
    "A walnut-cabinet gramophone with a brass turntable and tonearm, a lacquered oxblood horn banded in brass, and a record with a red label.",
};

// Small seeded PRNG so every build produces the same model.
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Walnut grain drawn on a canvas. Each line wraps horizontally so the tile is seamless.
function makeWoodTexture(rand: () => number): THREE.CanvasTexture {
  const S = 256;
  const cv = document.createElement("canvas");
  cv.width = cv.height = S;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#6e3f26";
  g.fillRect(0, 0, S, S);
  for (let i = 0; i < 64; i++) {
    const y0 = rand() * S;
    const amp = 1 + rand() * 4;
    const k = 1 + Math.floor(rand() * 3);
    const ph = rand() * Math.PI * 2;
    const dark = rand() < 0.6;
    g.strokeStyle = dark
      ? `rgba(30,15,8,${0.08 + rand() * 0.18})`
      : `rgba(170,110,70,${0.05 + rand() * 0.12})`;
    g.lineWidth = 0.6 + rand() * 2;
    g.beginPath();
    for (let x = 0; x <= S; x += 8) {
      const y = y0 + Math.sin((x / S) * Math.PI * 2 * k + ph) * amp;
      if (x === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Record top: dark shellac grooves, a red centre label with a gold ring and cream dots.
function makeLabelTexture(rand: () => number): THREE.CanvasTexture {
  const S = 512;
  const c = S / 2;
  const cv = document.createElement("canvas");
  cv.width = cv.height = S;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#101010";
  g.fillRect(0, 0, S, S);
  for (let r = 126; r < 254; r += 2.4) {
    const v = Math.round(26 + rand() * 22);
    g.strokeStyle = `rgb(${v},${v},${v})`;
    g.lineWidth = 1.2;
    g.beginPath();
    g.arc(c, c, r, 0, Math.PI * 2);
    g.stroke();
  }
  g.fillStyle = "#a8222b";
  g.beginPath();
  g.arc(c, c, 120, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#d9ac55";
  g.lineWidth = 7;
  g.beginPath();
  g.arc(c, c, 108, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = "#f0e4c8";
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    g.beginPath();
    g.arc(c + Math.cos(a) * 88, c + Math.sin(a) * 88, 3.5, 0, Math.PI * 2);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function gramophone(): THREE.Object3D {
  const rand = seeded(1923);
  const root = new THREE.Group();
  root.name = "gramophone";

  // One material per colour or surface, shared where it repeats.
  const wood = new THREE.MeshStandardMaterial({ map: makeWoodTexture(rand), roughness: 0.5 });
  const woodDark = new THREE.MeshStandardMaterial({ color: 0x2a160c, roughness: 0.6 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xd9ac55, roughness: 0.28, metalness: 0.9 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xe8eaee, roughness: 0.14, metalness: 1.0 });
  const horn = new THREE.MeshStandardMaterial({
    color: 0x8e1c22,
    roughness: 0.28,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
  const black = new THREE.MeshStandardMaterial({ color: 0x161616, roughness: 0.35, metalness: 0.1 });
  const ivory = new THREE.MeshStandardMaterial({ color: 0xf0e4c8, roughness: 0.4 });
  const label = new THREE.MeshStandardMaterial({ map: makeLabelTexture(rand), roughness: 0.45 });

  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const add = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D = root,
  ) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };

  // Tapered tube between two points. ra is the radius at a, rb the radius at b.
  const link = (a: THREE.Vector3, b: THREE.Vector3, ra: number, rb: number, mat: THREE.Material) => {
    const dir = new THREE.Vector3().subVectors(b, a);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rb, ra, dir.length(), 10), mat);
    m.position.copy(a).addScaledVector(dir, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    root.add(m);
    return m;
  };

  // Flat band lying in the XZ plane, centred on the Y axis of the parent.
  const ring = (r: number, tube: number, y: number, mat: THREE.Material, parent: THREE.Object3D = root) => {
    const g = new THREE.TorusGeometry(r, tube, 8, 32);
    g.rotateX(Math.PI / 2);
    return add(g, mat, 0, y, 0, parent);
  };

  // ---- Cabinet ----
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      add(new THREE.CylinderGeometry(0.016, 0.02, 0.014, 14), brass, sx * 0.135, 0.007, sz * 0.135);
    }
  }
  add(new THREE.BoxGeometry(0.32, 0.08, 0.32), wood, 0, 0.054, 0);
  add(new THREE.BoxGeometry(0.34, 0.012, 0.34), wood, 0, 0.1, 0);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      add(new THREE.BoxGeometry(0.01, 0.082, 0.01), brass, sx * 0.16, 0.054, sz * 0.16);
    }
  }

  // Front door outline, brass nameplate.
  const fz = 0.1613;
  add(new THREE.BoxGeometry(0.24, 0.004, 0.003), woodDark, 0, 0.08, fz);
  add(new THREE.BoxGeometry(0.24, 0.004, 0.003), woodDark, 0, 0.02, fz);
  for (const sx of [-1, 1]) {
    add(new THREE.BoxGeometry(0.004, 0.064, 0.003), woodDark, sx * 0.12, 0.05, fz);
  }
  add(new THREE.BoxGeometry(0.09, 0.024, 0.003), brass, 0, 0.05, 0.1625);

  // ---- Turntable and record ----
  add(new THREE.CylinderGeometry(0.12, 0.12, 0.008, 40), brass, 0, 0.11, 0);
  ring(0.12, 0.0045, 0.114, chrome);

  // Cylinder groups: 0 side, 1 top cap, 2 bottom cap.
  const record = new THREE.Mesh(new THREE.CylinderGeometry(0.118, 0.118, 0.004, 48), [black, label, black]);
  record.position.y = 0.116;
  root.add(record);

  add(new THREE.CylinderGeometry(0.005, 0.005, 0.03, 12), chrome, 0, 0.133, 0);

  // ---- Tonearm ----
  const P = v(0.13, 0, -0.13);
  add(new THREE.CylinderGeometry(0.014, 0.014, 0.006, 20), brass, P.x, 0.109, P.z);
  add(new THREE.CylinderGeometry(0.007, 0.007, 0.058, 14), brass, P.x, 0.14, P.z);

  const A = v(0.13, 0.169, -0.13);
  const M = v(0.1, 0.158, -0.085);
  const Hs = v(0.07, 0.135, -0.04);
  add(new THREE.SphereGeometry(0.009, 14, 10), brass, A.x, A.y, A.z);
  link(A, M, 0.0055, 0.005, brass);
  add(new THREE.SphereGeometry(0.0065, 12, 8), brass, M.x, M.y, M.z);
  link(M, Hs, 0.005, 0.0038, brass);

  const head = add(new THREE.BoxGeometry(0.02, 0.014, 0.034), black, Hs.x, Hs.y, Hs.z);
  head.lookAt(M);

  const needleGeo = new THREE.ConeGeometry(0.0025, 0.012, 6);
  needleGeo.rotateX(Math.PI); // tip points down
  add(needleGeo, chrome, Hs.x, 0.124, Hs.z);

  // ---- Stalk and horn ----
  add(new THREE.CylinderGeometry(0.014, 0.014, 0.05, 16), brass, 0, 0.125, -0.145);

  const pivot = v(0, 0.15, -0.145);
  add(new THREE.SphereGeometry(0.018, 16, 12), brass, pivot.x, pivot.y, pivot.z);

  const hornGroup = new THREE.Group();
  hornGroup.position.copy(pivot);
  hornGroup.rotation.x = 0.5; // mouth tilts forward and up
  root.add(hornGroup);

  // Exponential-ish flare, 28 radial segments keeps it faceted and low-poly.
  const profile: [number, number][] = [
    [0.012, 0],
    [0.017, 0.02],
    [0.025, 0.06],
    [0.04, 0.11],
    [0.058, 0.16],
    [0.08, 0.21],
    [0.106, 0.255],
    [0.13, 0.3],
  ];
  hornGroup.add(
    new THREE.Mesh(
      new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 28),
      horn,
    ),
  );

  // Sound box at the throat, brass bands, and a bead around the mouth.
  add(new THREE.CylinderGeometry(0.026, 0.026, 0.04, 20), brass, 0, 0.02, 0, hornGroup);
  ring(0.026, 0.0035, 0.06, brass, hornGroup);
  ring(0.052, 0.004, 0.14, brass, hornGroup);
  ring(0.082, 0.0045, 0.21, brass, hornGroup);
  ring(0.131, 0.007, 0.3, brass, hornGroup);

  // ---- Hand crank on the left side ----
  const crankHub = new THREE.CylinderGeometry(0.02, 0.02, 0.012, 20);
  crankHub.rotateZ(Math.PI / 2); // axis now along X
  add(crankHub, brass, -0.166, 0.06, 0.06);
  link(v(-0.172, 0.06, 0.06), v(-0.215, 0.06, 0.06), 0.005, 0.0045, brass);
  add(new THREE.SphereGeometry(0.013, 16, 12), ivory, -0.222, 0.06, 0.06);

  return root;
}
```