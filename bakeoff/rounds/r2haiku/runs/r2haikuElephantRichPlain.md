```ts
import * as THREE from "three";

export const meta = {
  name: "African Elephant Calf",
  description:
    "A gentle, dust-dusted African elephant calf with huge pink-flushed ears, a curious curled trunk, stubby tusks, long lashes and a tufted tail.",
};

// Small seeded generator so every build is identical.
function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Canvas-drawn skin: slate grey with reddish dust blotches and wrinkle lines.
// The same drawing, in greyscale, drives the bump map so the wrinkles are felt in light.
function skinTexture(rand: () => number, bump: boolean) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const g = c.getContext("2d")!;

  g.fillStyle = bump ? "#808080" : "#6c7075";
  g.fillRect(0, 0, 512, 512);

  if (!bump) {
    for (let i = 0; i < 70; i++) {
      const x = rand() * 512;
      const y = rand() * 512;
      const r = 20 + rand() * 60;
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, "rgba(150,92,70,0.22)");
      grd.addColorStop(1, "rgba(150,92,70,0)");
      g.fillStyle = grd;
      g.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
  }

  g.strokeStyle = bump ? "#3a3a3a" : "rgba(30,31,36,0.45)";
  g.lineCap = "round";
  for (let i = 0; i < 160; i++) {
    let x = rand() * 512;
    let y = rand() * 512;
    let a = rand() * Math.PI * 2;
    g.lineWidth = 1 + rand() * 2.5;
    g.beginPath();
    g.moveTo(x, y);
    const n = 3 + Math.floor(rand() * 3);
    for (let k = 0; k < n; k++) {
      a += (rand() - 0.5) * 1.4;
      const len = 8 + rand() * 14;
      const nx = x + Math.cos(a) * len;
      const ny = y + Math.sin(a) * len;
      g.quadraticCurveTo(
        x + (rand() - 0.5) * 6,
        y + (rand() - 0.5) * 6,
        nx,
        ny
      );
      x = nx;
      y = ny;
    }
    g.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  if (!bump) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Fan-shaped ear outline in the XY plane (x points toward the back of the head).
function earShape() {
  const s = new THREE.Shape();
  s.moveTo(0.02, 0.2);
  s.quadraticCurveTo(0.3, 0.36, 0.36, 0.04);
  s.quadraticCurveTo(0.36, -0.3, 0.08, -0.24);
  s.quadraticCurveTo(-0.02, -0.1, 0.02, 0.2);
  return s;
}

export default function buildElephantCalf(): THREE.Object3D {
  const rand = mulberry32(20240611);

  // ---------- Materials (one per colour, shared) ----------
  const skinMat = new THREE.MeshStandardMaterial({
    map: skinTexture(rand, false),
    bumpMap: skinTexture(rand, true),
    bumpScale: 2.5,
    roughness: 0.92,
  });
  const pinkMat = new THREE.MeshStandardMaterial({
    color: 0xe8a3a0,
    roughness: 0.7,
    side: THREE.DoubleSide,
  });
  const creamMat = new THREE.MeshStandardMaterial({ color: 0xefe4cc, roughness: 0.5 });
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf1ebe0, roughness: 0.3 });
  const irisMat = new THREE.MeshStandardMaterial({ color: 0x5a3218, roughness: 0.35 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x140d09, roughness: 0.3 });
  const lashMat = new THREE.MeshStandardMaterial({ color: 0x1d1512, roughness: 0.6 });
  const tuftMat = new THREE.MeshStandardMaterial({ color: 0x3b2d25, roughness: 0.95 });

  const root = new THREE.Group();

  const add = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    pos: [number, number, number],
    scale: [number, number, number] = [1, 1, 1],
    rot: [number, number, number] = [0, 0, 0]
  ) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...pos);
    m.scale.set(...scale);
    m.rotation.set(...rot);
    root.add(m);
    return m;
  };

  // ---------- Body (chunky barrel) ----------
  const sphereHi = new THREE.SphereGeometry(1, 20, 14);
  add(sphereHi, skinMat, [0, 0.8, 0], [0.42, 0.44, 0.62]);

  // Shoulder hump and rump for a calf's soft silhouette.
  add(new THREE.SphereGeometry(1, 12, 10), skinMat, [0, 1.05, 0.2], [0.3, 0.16, 0.26]);
  add(new THREE.SphereGeometry(1, 12, 10), skinMat, [0, 0.92, -0.42], [0.32, 0.3, 0.22]);

  // ---------- Legs and padded feet ----------
  const legGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.6, 8);
  const footGeo = new THREE.CylinderGeometry(0.13, 0.15, 0.1, 10);
  const nailGeo = new THREE.SphereGeometry(1, 6, 5);
  const legXs = [0.24, -0.24];
  const legZs = [0.28, -0.28];
  for (const x of legXs) {
    for (const z of legZs) {
      add(legGeo, skinMat, [x, 0.34, z]);
      add(footGeo, skinMat, [x, 0.05, z]);
      for (const dx of [-0.06, 0, 0.06]) {
        add(nailGeo, creamMat, [x + dx, 0.03, z + 0.14], [0.035, 0.026, 0.022]);
      }
    }
  }

  // ---------- Head and brow ----------
  add(new THREE.SphereGeometry(1, 20, 16), skinMat, [0, 1.0, 0.55], [0.3, 0.32, 0.32]);
  add(new THREE.SphereGeometry(1, 12, 10), skinMat, [0, 1.2, 0.5], [0.22, 0.14, 0.2]);

  // ---------- Ears (flared, pink inner face) ----------
  const earSide = (side: number) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.3, 1.05, 0.62);
    pivot.rotation.z = -side * 0.3; // flare outward at the top

    const grey = new THREE.Mesh(
      new THREE.ExtrudeGeometry(earShape(), {
        depth: 0.012,
        bevelEnabled: true,
        bevelThickness: 0.005,
        bevelSize: 0.005,
        bevelSegments: 2,
        curveSegments: 12,
      }),
      skinMat
    );
    grey.rotation.y = Math.PI / 2;
    grey.scale.setScalar(0.8);
    pivot.add(grey);

    const pink = new THREE.Mesh(
      new THREE.ExtrudeGeometry(earShape(), {
        depth: 0.007,
        bevelEnabled: false,
        curveSegments: 10,
      }),
      pinkMat
    );
    pink.rotation.y = Math.PI / 2;
    pink.scale.setScalar(0.56);
    pink.position.x = side > 0 ? -0.004 : 0.012; // sits on the head-facing side
    pivot.add(pink);

    root.add(pivot);
  };
  earSide(1);
  earSide(-1);

  // ---------- Trunk (curling forward, tapering, sphere-chained) ----------
  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.98, 0.8),
    new THREE.Vector3(0, 0.88, 0.98),
    new THREE.Vector3(0, 0.7, 1.1),
    new THREE.Vector3(0, 0.5, 1.12),
    new THREE.Vector3(0, 0.36, 1.05),
    new THREE.Vector3(0.02, 0.27, 0.93),
    new THREE.Vector3(0.06, 0.3, 0.84),
    new THREE.Vector3(0.07, 0.38, 0.88),
  ]);
  const trunkGeo = new THREE.SphereGeometry(1, 10, 8);
  const TRUNK_N = 16;
  for (let i = 0; i < TRUNK_N; i++) {
    const t = i / (TRUNK_N - 1);
    const p = trunkCurve.getPointAt(t);
    const r = 0.105 * (1 - 0.6 * t) + 0.01;
    add(trunkGeo, skinMat, [p.x, p.y, p.z], [r, r, r]);
  }
  // Tip lip, slightly darker and pinker.
  const tipP = trunkCurve.getPointAt(1);
  add(trunkGeo, pinkMat, [tipP.x, tipP.y, tipP.z], [0.045, 0.04, 0.045]);

  // ---------- Stubby tusks ----------
  const tuskGeo = new THREE.CylinderGeometry(0.012, 0.03, 0.12, 8);
  for (const sx of [1, -1]) {
    add(
      tuskGeo,
      creamMat,
      [sx * 0.13, 0.78, 0.855],
      [1, 1, 1],
      [1.92, 0, -sx * 0.2]
    );
  }

  // ---------- Eyes: kind, brown, lashed ----------
  const eyeGeo = new THREE.SphereGeometry(1, 14, 10);
  const lashGeo = new THREE.BoxGeometry(0.008, 0.03, 0.006);
  for (const sx of [1, -1]) {
    const ex = sx * 0.265;
    const ey = 1.07;
    const ez = 0.68;
    add(eyeGeo, eyeWhiteMat, [ex, ey, ez], [0.036, 0.036, 0.036]);
    add(eyeGeo, irisMat, [ex + sx * 0.018, ey, ez + 0.016], [0.024, 0.024, 0.024]);
    add(eyeGeo, pupilMat, [ex + sx * 0.024, ey, ez + 0.02], [0.012, 0.012, 0.012]);
    add(eyeGeo, eyeWhiteMat, [ex + sx * 0.03, ey + 0.008, ez + 0.026], [0.005, 0.005, 0.005]);

    // Lashes along the upper lid arc.
    const r = 0.042;
    for (let k = 0; k < 5; k++) {
      const phi = -0.9 + (1.8 * k) / 4;
      const px = ex + sx * 0.01;
      const py = ey + (r + 0.01) * Math.cos(phi);
      const pz = ez + 0.012 + (r + 0.01) * Math.sin(phi);
      add(lashGeo, lashMat, [px, py, pz], [1, 1, 1], [phi, 0, 0]);
    }
  }

  // ---------- Tail with a small tuft ----------
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.92, -0.6),
    new THREE.Vector3(0, 0.8, -0.72),
    new THREE.Vector3(0, 0.62, -0.76),
    new THREE.Vector3(0, 0.45, -0.72),
  ]);
  const tailGeo = new THREE.TubeGeometry(tailCurve, 10, 0.02, 6, false);
  root.add(new THREE.Mesh(tailGeo, skinMat));
  const tuftGeo = new THREE.SphereGeometry(1, 8, 6);
  const tuftCenter = new THREE.Vector3(0, 0.4, -0.72);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const rr = 0.022 + rand() * 0.012;
    add(
      tuftGeo,
      tuftMat,
      [
        tuftCenter.x + Math.cos(a) * 0.012,
        tuftCenter.y - 0.02 + rand() * 0.02,
        tuftCenter.z + Math.sin(a) * 0.012,
      ],
      [rr, rr * 1.4, rr]
    );
  }

  return root;
}
```