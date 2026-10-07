```ts
import * as THREE from "three";

export const meta = {
  name: "Brass Explorer's Telescope",
  description:
    "A polished brass explorer's telescope with leather-wrapped sections, engraved rings, a finder scope and focusing knobs, on a mahogany tripod with brass fittings and a tray holding a rolled star chart.",
};

// ---------- canvas textures ----------

function woodTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#b67a4a";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 60; i++) {
    g.strokeStyle = `rgba(60,25,10,${0.15 + (i % 5) * 0.05})`;
    g.lineWidth = 1 + (i % 3);
    const y0 = (i * 37) % 256;
    g.beginPath();
    g.moveTo(0, y0);
    for (let x = 0; x <= 256; x += 32) {
      g.lineTo(x, y0 + Math.sin(x * 0.03 + i) * 4);
    }
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function chartTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#efe0b8";
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "#5a3b1e";
  g.lineWidth = 6;
  g.strokeRect(10, 10, 236, 236);
  g.strokeStyle = "rgba(90,59,30,0.5)";
  g.lineWidth = 1.5;
  g.beginPath();
  g.arc(128, 128, 90, 0, Math.PI * 2);
  g.stroke();
  g.beginPath();
  g.arc(128, 128, 55, 0, Math.PI * 2);
  g.stroke();
  // star field
  g.fillStyle = "#3a2612";
  let s = 7;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  for (let i = 0; i < 70; i++) {
    const x = 20 + rnd() * 216;
    const y = 20 + rnd() * 216;
    g.beginPath();
    g.arc(x, y, 1 + rnd() * 2.2, 0, Math.PI * 2);
    g.fill();
  }
  g.font = "bold 22px serif";
  g.fillStyle = "#5a3b1e";
  g.fillText("STAR CHART", 62, 240);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------- materials ----------

const brass = new THREE.MeshStandardMaterial({
  color: 0xd2a852,
  metalness: 1,
  roughness: 0.28,
});
const brassDark = new THREE.MeshStandardMaterial({
  color: 0x9a7030,
  metalness: 1,
  roughness: 0.45,
});
const leather = new THREE.MeshStandardMaterial({
  color: 0x6a3519,
  roughness: 0.85,
});
const rubber = new THREE.MeshStandardMaterial({
  color: 0x151515,
  roughness: 0.6,
});
const glass = new THREE.MeshStandardMaterial({
  color: 0x8fd0ff,
  metalness: 0,
  roughness: 0.05,
  transparent: true,
  opacity: 0.55,
});
const mahogany = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  map: woodTexture(),
  roughness: 0.6,
});
const paper = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  map: chartTexture(),
  roughness: 0.9,
});

// ---------- helpers ----------

// Cylinder whose axis runs along Z; +z end gets radiusTop.
function zCyl(
  rt: number,
  rb: number,
  len: number,
  z: number,
  mat: THREE.Material,
  seg = 16
): THREE.Mesh {
  const g = new THREE.CylinderGeometry(rt, rb, len, seg);
  g.rotateX(Math.PI / 2);
  const m = new THREE.Mesh(g, mat);
  m.position.z = z;
  return m;
}

// Cylinder whose axis runs along X.
function xCyl(
  rt: number,
  rb: number,
  len: number,
  x: number,
  y: number,
  z: number,
  mat: THREE.Material,
  seg = 14
): THREE.Mesh {
  const g = new THREE.CylinderGeometry(rt, rb, len, seg);
  g.rotateZ(Math.PI / 2);
  const m = new THREE.Mesh(g, mat);
  m.position.set(x, y, z);
  return m;
}

function box(
  w: number,
  h: number,
  d: number,
  mat: THREE.Material,
  x: number,
  y: number,
  z: number
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  return m;
}

// Tapered strut from point a to point b (radius rB applies at b).
function strut(
  a: THREE.Vector3,
  b: THREE.Vector3,
  rA: number,
  rB: number,
  mat: THREE.Material
): THREE.Mesh {
  const dir = b.clone().sub(a);
  const len = dir.length();
  const g = new THREE.CylinderGeometry(rB, rA, len, 10);
  const m = new THREE.Mesh(g, mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.normalize()
  );
  return m;
}

// ---------- builder ----------

export default function build(): THREE.Object3D {
  const root = new THREE.Group();

  // ===== Tripod =====

  // Head block
  const head = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.11, 0.1, 18),
    mahogany
  );
  head.position.set(0, 0.9, 0);
  root.add(head);

  const headRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.1, 0.007, 8, 24),
    brass
  );
  headRing.rotation.x = Math.PI / 2;
  headRing.position.set(0, 0.95, 0);
  root.add(headRing);

  // Legs
  const legTop = new THREE.Vector3(0, 0.88, 0);
  const angles = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];
  for (const th of angles) {
    const foot = new THREE.Vector3(
      0.42 * Math.cos(th),
      0.01,
      0.42 * Math.sin(th)
    );
    root.add(strut(legTop, foot, 0.014, 0.026, mahogany));
    // brass ferrule at foot
    const ferrule = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.014, 0.03, 12),
      brass
    );
    ferrule.position.set(foot.x, 0.015, foot.z);
    root.add(ferrule);
    // leather-wrapped grip mid-leg
    const mid = legTop.clone().lerp(foot, 0.4);
    const gripDir = foot.clone().sub(legTop).normalize();
    const grip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.1, 12),
      leather
    );
    grip.position.copy(mid);
    grip.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), gripDir);
    root.add(grip);
    // brass collar at the top of each leg
    const collar = new THREE.Mesh(
      new THREE.TorusGeometry(0.026, 0.005, 6, 14),
      brass
    );
    const cdir = gripDir.clone();
    collar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), cdir);
    collar.position.copy(legTop).add(cdir.clone().multiplyScalar(0.06));
    root.add(collar);
  }

  // Spreader shelf with tray on top
  const shelf = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.014, 24),
    mahogany
  );
  shelf.position.y = 0.3;
  root.add(shelf);

  const shelfRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.006, 6, 30),
    brassDark
  );
  shelfRim.rotation.x = Math.PI / 2;
  shelfRim.position.y = 0.307;
  root.add(shelfRim);

  // Little tray with walls
  const trayBase = box(0.2, 0.012, 0.14, mahogany, 0, 0.313, 0);
  root.add(trayBase);
  root.add(box(0.2, 0.024, 0.008, mahogany, 0, 0.325, 0.066));
  root.add(box(0.2, 0.024, 0.008, mahogany, 0, 0.325, -0.066));
  root.add(box(0.008, 0.024, 0.14, mahogany, 0.096, 0.325, 0));
  root.add(box(0.008, 0.024, 0.14, mahogany, -0.096, 0.325, 0));

  // Rolled star chart lying in the tray
  const chart = xCyl(0.022, 0.022, 0.16, 0, 0.363, 0, paper, 16);
  root.add(chart);
  root.add(xCyl(0.024, 0.024, 0.008, 0.084, 0.363, 0, brass, 14));
  root.add(xCyl(0.024, 0.024, 0.008, -0.084, 0.363, 0, brass, 14));

  // ===== Yoke and trunnion =====
  root.add(box(0.02, 0.08, 0.05, brass, 0.08, 0.97, 0));
  root.add(box(0.02, 0.08, 0.05, brass, -0.08, 0.97, 0));
  root.add(xCyl(0.012, 0.012, 0.17, 0, 1.0, 0, brass, 14));
  // pivot caps
  root.add(xCyl(0.02, 0.02, 0.006, 0.0875, 1.0, 0, brass, 14));
  root.add(xCyl(0.02, 0.02, 0.006, -0.0875, 1.0, 0, brass, 14));

  // ===== Telescope tube group (pivots about trunnion) =====
  const scope = new THREE.Group();
  scope.position.set(0, 1.0, 0);
  scope.rotation.x = -0.35; // tilt the front end upward
  root.add(scope);

  // Main tube
  scope.add(zCyl(0.035, 0.035, 0.56, 0, brass, 18));

  // Leather wraps
  scope.add(zCyl(0.0365, 0.0365, 0.09, 0.12, leather, 16));
  scope.add(zCyl(0.0365, 0.0365, 0.09, -0.1, leather, 16));

  // Engraved bands on the brass (darker rings with leather edges)
  for (const z of [0.2, 0.225, -0.2, -0.225]) {
    scope.add(zCyl(0.0372, 0.0372, 0.006, z, brassDark, 16));
  }

  // Focus collar in the middle
  scope.add(zCyl(0.044, 0.044, 0.05, 0.0, brass, 20));

  // Focus knobs on either side
  for (const side of [1, -1]) {
    scope.add(xCyl(0.006, 0.006, 0.03, side * 0.05, 0, 0.0, brassDark, 8));
    const knob = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 12, 10),
      brass
    );
    knob.position.set(side * 0.07, 0, 0);
    scope.add(knob);
  }

  // Objective cell and lens
  scope.add(zCyl(0.042, 0.042, 0.04, 0.3, brass, 18));
  scope.add(zCyl(0.036, 0.036, 0.004, 0.322, glass, 18));
  scope.add(zCyl(0.046, 0.046, 0.006, 0.32, brassDark, 18));

  // Eyepiece barrel, rubber cup
  scope.add(zCyl(0.022, 0.022, 0.1, -0.34, brass, 14));
  scope.add(zCyl(0.024, 0.032, 0.035, -0.4, rubber, 16));
  scope.add(zCyl(0.02, 0.02, 0.006, -0.292, brassDark, 14));

  // Saddle under the tube
  scope.add(box(0.07, 0.02, 0.05, brass, 0, -0.045, 0));

  // Finder scope on two rings
  const finderY = 0.072;
  scope.add(zCyl(0.016, 0.016, 0.22, 0.02, brass, 12).translateY(finderY));
  scope.add(zCyl(0.02, 0.02, 0.012, 0.12, brassDark, 12).translateY(finderY));
  scope.add(zCyl(0.02, 0.02, 0.012, -0.09, brassDark, 12).translateY(finderY));
  scope.add(box(0.012, 0.03, 0.02, brass, 0, 0.05, 0.12));
  scope.add(box(0.012, 0.03, 0.02, brass, 0, 0.05, -0.09));
  scope.add(zCyl(0.014, 0.014, 0.004, 0.132, glass, 12).translateY(finderY));
  scope.add(zCyl(0.011, 0.013, 0.03, -0.12, rubber, 12).translateY(finderY));

  return root;
}
```