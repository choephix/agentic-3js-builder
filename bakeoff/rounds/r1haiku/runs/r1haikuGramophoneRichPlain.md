```ts
import * as THREE from "three";

export const meta = {
  name: "Antique Gramophone",
  description:
    "A walnut cabinet gramophone with a flared morning-glory brass horn, black record with red label, silver tonearm, crank and claw feet.",
};

// Seeded generator so every build is identical.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

// Walnut body with grain and a pale floral inlay pattern.
function woodTexture(rand: () => number): THREE.CanvasTexture {
  const c = makeCanvas(512, 512);
  const g = c.getContext("2d")!;
  g.fillStyle = "#5a3923";
  g.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 90; i++) {
    const y0 = rand() * 512;
    g.strokeStyle = `rgba(25,12,4,${0.15 + rand() * 0.25})`;
    g.lineWidth = 0.6 + rand() * 2;
    g.beginPath();
    g.moveTo(0, y0);
    for (let x = 0; x <= 512; x += 16) {
      g.lineTo(x, y0 + Math.sin(x * 0.02 + i) * 6 + Math.sin(x * 0.05 + i * 1.7) * 2);
    }
    g.stroke();
  }

  // Pale five-petal flowers on an offset grid.
  for (let gy = 0; gy < 4; gy++) {
    for (let gx = 0; gx < 4; gx++) {
      const cx = (gx * 128 + (gy % 2) * 64 + 32) % 512;
      const cy = gy * 128 + 32;
      for (let p = 0; p < 5; p++) {
        g.save();
        g.translate(cx, cy);
        g.rotate((p / 5) * Math.PI * 2);
        g.beginPath();
        g.ellipse(0, -15, 6, 13, 0, 0, Math.PI * 2);
        g.fillStyle = "#eadcc0";
        g.fill();
        g.restore();
      }
      g.beginPath();
      g.arc(cx, cy, 4.5, 0, Math.PI * 2);
      g.fillStyle = "#c49a5a";
      g.fill();
      // small pale leaf tick
      g.save();
      g.translate(cx, cy);
      g.rotate(gx * 0.8 + gy * 0.5);
      g.beginPath();
      g.ellipse(24, 0, 9, 3, 0, 0, Math.PI * 2);
      g.fillStyle = "rgba(230,215,180,0.8)";
      g.fill();
      g.restore();
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Brass with a warm base and greenish verdigris patina blotches.
function brassTexture(rand: () => number): THREE.CanvasTexture {
  const c = makeCanvas(256, 256);
  const g = c.getContext("2d")!;
  g.fillStyle = "#b58b47";
  g.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 40; i++) {
    const x = rand() * 256;
    const y = rand() * 256;
    const r = 10 + rand() * 30;
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, "rgba(92,140,108,0.55)");
    grd.addColorStop(1, "rgba(92,140,108,0)");
    g.fillStyle = grd;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  for (let i = 0; i < 220; i++) {
    g.fillStyle = `rgba(240,205,130,${0.12 + rand() * 0.2})`;
    g.fillRect(rand() * 256, rand() * 256, 1 + rand() * 2, 1 + rand() * 2);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Flared horn: radius grows along Y with scalloped morning-glory lobes at the mouth.
function hornGeometry(
  len: number,
  mouthR: number,
  throatR: number,
  lobes: number,
  seg: number,
  rings: number
): THREE.BufferGeometry {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];

  for (let i = 0; i <= rings; i++) {
    const t = i / rings;
    const r0 = throatR + (mouthR - throatR) * Math.pow(t, 2.6);
    for (let j = 0; j <= seg; j++) {
      const th = (j / seg) * Math.PI * 2;
      const s = Math.abs(Math.cos(lobes * th * 0.5));
      const lobe = 1 + 0.12 * Math.pow(t, 2.5) * s;
      const r = r0 * lobe;
      pos.push(Math.cos(th) * r, len * t, Math.sin(th) * r);
      uv.push(j / seg, t);
    }
  }

  const row = seg + 1;
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < seg; j++) {
      const a = i * row + j;
      const b = (i + 1) * row + j;
      const c = (i + 1) * row + j + 1;
      const d = i * row + j + 1;
      idx.push(a, b, d, b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

// Cylinder-like segment from a to b with separate end radii.
function between(
  a: THREE.Vector3,
  b: THREE.Vector3,
  rA: number,
  rB: number,
  mat: THREE.Material,
  seg = 10
): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rB, rA, len, seg), mat);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return m;
}

function cyl(rt: number, rb: number, h: number, seg: number, mat: THREE.Material): THREE.Mesh {
  return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
}

function clawFoot(brass: THREE.Material): THREE.Group {
  const g = new THREE.Group();
  const leg = cyl(0.014, 0.018, 0.07, 12, brass);
  leg.position.y = 0.035;
  g.add(leg);

  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.022, 14, 10), brass);
  ball.position.y = 0.03;
  g.add(ball);

  for (let i = 0; i < 3; i++) {
    const ang = (i / 3) * Math.PI * 2 + Math.PI / 6;
    const base = new THREE.Vector3(Math.cos(ang) * 0.016, 0.022, Math.sin(ang) * 0.016);
    const tip = new THREE.Vector3(Math.cos(ang) * 0.032, 0.0, Math.sin(ang) * 0.032);
    g.add(between(base, tip, 0.008, 0.002, brass, 6));
  }
  return g;
}

export default function createGramophone(): THREE.Object3D {
  const rand = mulberry32(1911);

  // Materials (shared per colour/finish).
  const walnut = new THREE.MeshStandardMaterial({
    map: woodTexture(rand),
    roughness: 0.55,
    metalness: 0,
  });
  const brass = new THREE.MeshStandardMaterial({
    map: brassTexture(rand),
    color: 0xffffff,
    metalness: 0.85,
    roughness: 0.38,
    side: THREE.DoubleSide,
  });
  const silver = new THREE.MeshStandardMaterial({
    color: 0xc9ccd2,
    metalness: 1,
    roughness: 0.22,
  });
  const black = new THREE.MeshStandardMaterial({
    color: 0x141416,
    roughness: 0.28,
    metalness: 0.1,
  });
  const grooveMat = new THREE.MeshStandardMaterial({
    color: 0x2b2b30,
    roughness: 0.2,
  });
  const red = new THREE.MeshStandardMaterial({ color: 0xb3221c, roughness: 0.5 });
  const pale = new THREE.MeshStandardMaterial({ color: 0xe9dcc0, roughness: 0.5 });

  const root = new THREE.Group();

  // Cabinet body, raised on feet.
  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.34, 0.42), walnut);
  cabinet.position.set(0, 0.21, 0);
  root.add(cabinet);

  // Pale inlay bands on the front face.
  const inlayTop = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.012, 0.003), pale);
  inlayTop.position.set(0, 0.335, 0.2115);
  root.add(inlayTop);
  const inlayBottom = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.012, 0.003), pale);
  inlayBottom.position.set(0, 0.065, 0.2115);
  root.add(inlayBottom);

  // Brass trim around the top edge.
  const trimFront = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.01, 0.008), brass);
  trimFront.position.set(0, 0.379, 0.21);
  root.add(trimFront);
  const trimBack = trimFront.clone();
  trimBack.position.z = -0.21;
  root.add(trimBack);
  const trimLeft = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.01, 0.42), brass);
  trimLeft.position.set(0.25, 0.379, 0);
  root.add(trimLeft);
  const trimRight = trimLeft.clone();
  trimRight.position.x = -0.25;
  root.add(trimRight);

  // Claw feet.
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const foot = clawFoot(brass);
      foot.position.set(sx * 0.2, 0, sz * 0.16);
      root.add(foot);
    }
  }

  // Turntable.
  const turntable = cyl(0.13, 0.13, 0.02, 48, brass);
  turntable.position.set(0, 0.39, 0.02);
  root.add(turntable);

  // Record: black disc, faint grooves, red label, silver spindle.
  const record = cyl(0.12, 0.12, 0.006, 56, black);
  record.position.set(0, 0.402, 0.02);
  root.add(record);
  for (const r of [0.07, 0.095]) {
    const groove = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.0015, 64), grooveMat);
    groove.rotation.x = -Math.PI / 2;
    groove.position.set(0, 0.4055, 0.02);
    root.add(groove);
  }
  const label = cyl(0.045, 0.045, 0.002, 36, red);
  label.position.set(0, 0.4055, 0.02);
  root.add(label);
  const spindle = cyl(0.006, 0.006, 0.03, 12, silver);
  spindle.position.set(0, 0.42, 0.02);
  root.add(spindle);

  // Tonearm: pivot column, arm, head shell, counterweight.
  const pivotBase = cyl(0.03, 0.03, 0.01, 24, brass);
  pivotBase.position.set(0.18, 0.385, -0.14);
  root.add(pivotBase);
  const Pv = new THREE.Vector3(0.18, 0.44, -0.14);
  const H = new THREE.Vector3(0.09, 0.44, 0.03);
  root.add(between(new THREE.Vector3(0.18, 0.385, -0.14), Pv, 0.011, 0.011, silver, 12));
  root.add(between(Pv, H, 0.006, 0.006, silver, 10));

  const headShell = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.012, 0.034), silver);
  headShell.position.copy(H);
  headShell.lookAt(Pv);
  root.add(headShell);

  const counterDir = new THREE.Vector3().subVectors(Pv, H).normalize();
  const counterweight = new THREE.Mesh(new THREE.SphereGeometry(0.018, 14, 10), silver);
  counterweight.position.copy(Pv).addScaledVector(counterDir, 0.04);
  root.add(counterweight);

  // Morning-glory horn, built along local +Y then tilted forward.
  const hornLen = 0.5;
  const mouthR = 0.27;
  const throat = new THREE.Vector3(0, 0.38, -0.13);
  const dir = new THREE.Vector3(0, 0.55, 0.85).normalize();

  const horn = new THREE.Group();
  horn.position.copy(throat);
  horn.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

  const hornMesh = new THREE.Mesh(hornGeometry(hornLen, mouthR, 0.025, 10, 72, 44), brass);
  horn.add(hornMesh);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(mouthR, 0.009, 8, 60), brass);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = hornLen;
  horn.add(rim);

  // Reproducer housing at the throat.
  const reproducer = cyl(0.035, 0.03, 0.06, 20, brass);
  reproducer.position.y = 0.03;
  horn.add(reproducer);
  const collar = cyl(0.02, 0.02, 0.02, 16, silver);
  collar.position.y = 0.075;
  horn.add(collar);

  root.add(horn);

  // Gooseneck from cabinet top up into the reproducer.
  root.add(
    between(new THREE.Vector3(0, 0.38, -0.2), new THREE.Vector3(0, 0.38, -0.13), 0.03, 0.03, brass, 16)
  );

  // Wind-up crank on the right side (-X).
  const housing = cyl(0.03, 0.03, 0.02, 20, brass);
  housing.rotation.z = Math.PI / 2;
  housing.position.set(-0.26, 0.24, 0);
  root.add(housing);

  root.add(
    between(new THREE.Vector3(-0.27, 0.24, 0), new THREE.Vector3(-0.31, 0.24, 0), 0.008, 0.008, silver, 10)
  );
  root.add(
    between(new THREE.Vector3(-0.31, 0.24, 0), new THREE.Vector3(-0.31, 0.31, 0), 0.007, 0.007, silver, 10)
  );
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.016, 14, 10), black);
  knob.position.set(-0.31, 0.32, 0);
  root.add(knob);

  return root;
}
```