```ts
import * as THREE from "three";

export const meta = {
  name: "Nine-Banded Armadillo (Trotting)",
  description:
    "A stylized low-poly nine-banded armadillo mid-trot: overlapping banded carapace in dusty pinkish-tan with scute-patterned shields, pointy snout, tall leathery ears, beady eyes, clawed feet, a ringed tapering tail and coarse pale hairs poking between the bands.",
};

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  if (!g) return null;
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export default function build(): THREE.Object3D {
  const rng = mulberry32(90210);
  const root = new THREE.Group();
  const Yv = new THREE.Vector3(0, 1, 0);
  const Zv = new THREE.Vector3(0, 0, 1);

  // ---------- textures ----------
  const shieldTex = canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = "#8e6a5c";
    g.fillRect(0, 0, w, h);
    const rows = 6, cols = 16;
    for (let r = 0; r < rows; r++) {
      for (let c = -1; c <= cols; c++) {
        const x = ((c + (r % 2) * 0.5 + 0.5) / cols) * w;
        const y = ((r + 0.5) / rows) * h;
        const rx = (w / cols) * 0.44, ry = (h / rows) * 0.42;
        g.beginPath();
        g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        g.fillStyle = "#cfa48c";
        g.fill();
        g.beginPath();
        g.ellipse(x - rx * 0.15, y - ry * 0.2, rx * 0.6, ry * 0.5, 0, 0, Math.PI * 2);
        g.fillStyle = "#dfbba3";
        g.fill();
        g.beginPath();
        g.arc(x - rx * 0.25, y - ry * 0.3, rx * 0.14, 0, Math.PI * 2);
        g.fillStyle = "#ecd2bf";
        g.fill();
      }
    }
  });
  const bandTex = canvasTex(256, 64, (g, w, h) => {
    g.fillStyle = "#7f5d50";
    g.fillRect(0, 0, w, h);
    const cols = 22;
    const pw = w / cols;
    for (let c = 0; c < cols; c++) {
      const x = c * pw;
      const grd = g.createLinearGradient(0, h, 0, 0);
      grd.addColorStop(0, "#b48b78");
      grd.addColorStop(1, "#d8b29b");
      g.fillStyle = grd;
      g.fillRect(x + 1.5, 4, pw - 3, h - 8);
      g.fillStyle = "#e7c9b4";
      g.fillRect(x + 1.5, 4, pw - 3, 7);
    }
  });

  // ---------- materials ----------
  const cache = new Map<string, THREE.MeshStandardMaterial>();
  const mat = (key: string, color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) => {
    let m = cache.get(key);
    if (!m) {
      m = new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.0, flatShading: true, ...extra });
      cache.set(key, m);
    }
    return m;
  };
  const shieldMat = mat("shield", shieldTex ? "#ffffff" : "#c9a08a", { map: shieldTex, side: THREE.DoubleSide, roughness: 0.7 });
  const bandA = mat("bandA", bandTex ? "#ffffff" : "#c49b86", { map: bandTex, side: THREE.DoubleSide, roughness: 0.7 });
  const bandB = mat("bandB", bandTex ? "#e6d2c8" : "#b48c79", { map: bandTex, side: THREE.DoubleSide, roughness: 0.7 });
  const rimMat = mat("rim", "#e8c9b2", { roughness: 0.6 });
  const skin = mat("skin", "#b18a82");
  const belly = mat("belly", "#d6b2a4");
  const earMat = mat("ear", "#8a655d", { side: THREE.DoubleSide });
  const innerEar = mat("innerEar", "#6a4744", { side: THREE.DoubleSide });
  const clawMat = mat("claw", "#4f3d35", { roughness: 0.5 });
  const eyeMat = mat("eye", "#120c0b", { roughness: 0.2 });
  const glint = mat("glint", "#ffffff", { roughness: 0.1, emissive: "#ffffff", emissiveIntensity: 0.4 });
  const noseMat = mat("nose", "#6e4b49", { roughness: 0.45 });
  const hairMat = mat("hair", "#f3e8d6");
  const padMat = mat("pad", "#9a7770");

  // ---------- shell ----------
  const SPAN = Math.PI * 1.3;
  const PHI0 = Math.PI - SPAN / 2;
  const R = (z: number) => 0.13 * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(z) / 0.26, 2.5)), 0.4);

  const shell = new THREE.Group();
  shell.position.y = 0.135;
  shell.scale.set(1, 1.08, 1);
  root.add(shell);

  const lathe = (pts: THREE.Vector2[], m: THREE.Material) => {
    const g = new THREE.LatheGeometry(pts, 20, PHI0, SPAN);
    g.rotateX(Math.PI / 2);
    const mesh = new THREE.Mesh(g, m);
    shell.add(mesh);
    return mesh;
  };
  const arcRim = (radius: number, z: number, tube: number) => {
    const g = new THREE.TorusGeometry(radius, tube, 3, 22, SPAN);
    const m = new THREE.Mesh(g, rimMat);
    m.rotation.z = Math.PI / 2 - SPAN / 2;
    m.position.z = z;
    shell.add(m);
  };
  const toothGeo = new THREE.ConeGeometry(0.006, 0.014, 4);
  toothGeo.translate(0, 0.007, 0);
  const tooth = (z: number, r: number) => {
    for (const s of [1, -1]) {
      const a = Math.PI / 2 + (s * SPAN) / 2;
      const m = new THREE.Mesh(toothGeo, rimMat);
      m.position.set(r * Math.cos(a), r * Math.sin(a), z);
      const dir = new THREE.Vector3(-Math.sin(a) * s, Math.cos(a) * s, 0).normalize();
      m.quaternion.setFromUnitVectors(Yv, dir);
      shell.add(m);
    }
  };

  // front (scapular) shield
  {
    const pts: THREE.Vector2[] = [];
    const z0 = 0.085, z1 = 0.215, n = 8;
    for (let j = 0; j <= n; j++) {
      const z = z0 + (j / n) * (z1 - z0);
      pts.push(new THREE.Vector2(R(z) * (j === 0 ? 1.04 : 1), z));
    }
    pts.push(new THREE.Vector2(R(z1) * 0.85, z1 + 0.007));
    pts.push(new THREE.Vector2(R(z1) * 0.55, z1 + 0.011));
    lathe(pts, shieldMat);
    arcRim(R(z0) * 1.04, z0, 0.003);
    for (let j = 0; j < 6; j++) {
      const z = z0 + 0.01 + (j / 5) * 0.11;
      tooth(z, R(z));
    }
  }
  // rear (pelvic) shield
  {
    const pts: THREE.Vector2[] = [];
    const z0 = -0.075, z1 = -0.225, n = 8;
    pts.push(new THREE.Vector2(R(z0) * 0.95, z0));
    for (let j = 1; j <= n; j++) {
      const z = z0 + (j / n) * (z1 - z0);
      pts.push(new THREE.Vector2(R(z), z));
    }
    pts.push(new THREE.Vector2(R(z1) * 0.8, z1 - 0.007));
    pts.push(new THREE.Vector2(R(z1) * 0.45, z1 - 0.011));
    lathe(pts, shieldMat);
    for (let j = 0; j < 6; j++) {
      const z = -0.09 - (j / 5) * 0.12;
      tooth(z, R(z));
    }
  }
  // nine bands
  const bandZ: number[] = [];
  for (let k = 0; k < 9; k++) {
    const zc = 0.072 - k * 0.0175;
    bandZ.push(zc);
    const zf = zc + 0.014, zr = zc - 0.0115;
    const pts = [
      new THREE.Vector2(R(zf) * 0.95, zf),
      new THREE.Vector2(R(zc) * 1.0, zc),
      new THREE.Vector2(R(zr) * 1.035, zr),
    ];
    lathe(pts, k % 2 === 0 ? bandA : bandB);
    arcRim(R(zr) * 1.035, zr, 0.0022);
    tooth(zr + 0.002, R(zr) * 1.03);
  }

  // hairs between bands
  const hairGeo = new THREE.CylinderGeometry(0.0006, 0.0014, 1, 3);
  hairGeo.translate(0, 0.5, 0);
  const hair = (parent: THREE.Object3D, pos: THREE.Vector3, dir: THREE.Vector3, len: number) => {
    const m = new THREE.Mesh(hairGeo, hairMat);
    m.position.copy(pos);
    m.scale.set(1, len, 1);
    m.quaternion.setFromUnitVectors(Yv, dir.normalize());
    parent.add(m);
  };
  for (let i = 0; i < 80; i++) {
    const k = Math.floor(rng() * 10);
    const z = k < 9 ? bandZ[k] - 0.0115 : 0.085;
    const a = Math.PI / 2 + (rng() - 0.5) * SPAN * 0.96;
    const r = R(z) * 1.03;
    const pos = new THREE.Vector3(r * Math.cos(a), r * Math.sin(a), z);
    const dir = new THREE.Vector3(
      Math.cos(a) + (rng() - 0.5) * 0.4,
      Math.sin(a) + (rng() - 0.5) * 0.4,
      -0.3 - rng() * 0.4
    );
    hair(shell, pos, dir, 0.016 + rng() * 0.02);
  }

  // belly
  {
    const g = new THREE.SphereGeometry(1, 12, 8);
    const m = new THREE.Mesh(g, belly);
    m.scale.set(0.105, 0.062, 0.205);
    m.position.set(0, 0.115, 0);
    root.add(m);
    for (let i = 0; i < 14; i++) {
      const z = (rng() - 0.5) * 0.3;
      const x = (rng() - 0.5) * 0.14;
      hair(root, new THREE.Vector3(x, 0.07, z), new THREE.Vector3(x * 2, -1, -0.3), 0.012 + rng() * 0.012);
    }
  }

  // ---------- helpers ----------
  const limb = (a: THREE.Vector3, b: THREE.Vector3, r1: number, r2: number, m: THREE.Material, seg = 7) => {
    const d = b.clone().sub(a);
    const g = new THREE.CylinderGeometry(r2, r1, d.length(), seg);
    const mesh = new THREE.Mesh(g, m);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(Yv, d.normalize());
    root.add(mesh);
    return mesh;
  };
  const ball = (p: THREE.Vector3, r: number, m: THREE.Material, parent: THREE.Object3D = root) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 7, 5), m);
    mesh.position.copy(p);
    parent.add(mesh);
    return mesh;
  };

  // neck
  limb(new THREE.Vector3(0, 0.112, 0.19), new THREE.Vector3(0, 0.122, 0.255), 0.042, 0.034, skin, 8);

  // ---------- head ----------
  const head = new THREE.Group();
  head.position.set(0, 0.125, 0.245);
  head.rotation.x = 0.2;
  root.add(head);
  {
    const skull = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), skin);
    skull.scale.set(0.05, 0.045, 0.065);
    skull.position.z = 0.0;
    head.add(skull);

    const sg = new THREE.CylinderGeometry(0.014, 0.04, 0.11, 8);
    sg.rotateX(Math.PI / 2);
    const snout = new THREE.Mesh(sg, skin);
    snout.position.set(0, 0.0, 0.1);
    snout.scale.set(1, 0.8, 1);
    head.add(snout);

    const nose = ball(new THREE.Vector3(0, 0.0, 0.155), 0.016, noseMat, head);
    nose.scale.set(1, 0.85, 0.7);
    ball(new THREE.Vector3(0.006, 0.002, 0.166), 0.0035, eyeMat, head);
    ball(new THREE.Vector3(-0.006, 0.002, 0.166), 0.0035, eyeMat, head);

    // mouth line
    const mouth = limb(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1), 0.002, 0.002, eyeMat, 4);
    head.add(mouth);
    mouth.position.set(0, -0.016, 0.11);
    mouth.quaternion.setFromUnitVectors(Yv, new THREE.Vector3(0, 0.05, 1).normalize());
    mouth.scale.set(1, 0.08, 1);

    // head shield
    const hs = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), shieldMat);
    hs.scale.set(0.04, 0.022, 0.088);
    hs.position.set(0, 0.026, 0.06);
    hs.rotation.x = 0.22;
    head.add(hs);

    // eyes
    for (const s of [1, -1]) {
      ball(new THREE.Vector3(0.04 * s, 0.012, 0.035), 0.007, eyeMat, head);
      ball(new THREE.Vector3(0.045 * s, 0.016, 0.039), 0.0022, glint, head);
    }

    // ears
    const eg = new THREE.ConeGeometry(0.024, 0.078, 6);
    eg.translate(0, 0.039, 0);
    const ig = new THREE.ConeGeometry(0.016, 0.058, 6);
    ig.translate(0, 0.029, 0);
    for (const s of [1, -1]) {
      const ear = new THREE.Mesh(eg, earMat);
      ear.position.set(0.03 * s, 0.03, -0.025);
      ear.rotation.set(-0.3, s * 0.4, -s * 0.42);
      ear.scale.set(1, 1, 0.35);
      head.add(ear);
      const inner = new THREE.Mesh(ig, innerEar);
      inner.position.set(0, 0.006, 0.012);
      ear.add(inner);
    }

    // cheek whisker-hairs
    for (let i = 0; i < 8; i++) {
      const s = i % 2 ? 1 : -1;
      const p = new THREE.Vector3(s * (0.03 + rng() * 0.01), -0.015 - rng() * 0.01, 0.02 + rng() * 0.06);
      hair(head, p, new THREE.Vector3(s, -0.6, 0.2), 0.014 + rng() * 0.01);
    }
  }

  // ---------- legs ----------
  const clawGeos = new Map<number, THREE.ConeGeometry>();
  const clawGeo = (len: number) => {
    let g = clawGeos.get(len);
    if (!g) {
      g = new THREE.ConeGeometry(0.0045, len, 5);
      g.translate(0, len / 2, 0);
      g.rotateX(Math.PI / 2);
      clawGeos.set(len, g);
    }
    return g;
  };
  const foot = (ankle: THREE.Vector3, front: boolean, pitch: number) => {
    const f = new THREE.Group();
    f.position.copy(ankle);
    f.rotation.x = pitch;
    root.add(f);
    const pad = ball(new THREE.Vector3(0, 0, 0.012), 1, skin, f);
    pad.scale.set(front ? 0.022 : 0.025, 0.012, front ? 0.03 : 0.034);
    const sole = ball(new THREE.Vector3(0, -0.004, 0.014), 1, padMat, f);
    sole.scale.set(0.018, 0.008, 0.024);
    const lens = front ? [0.016, 0.03, 0.027, 0.014] : [0.012, 0.018, 0.021, 0.018, 0.012];
    const n = lens.length;
    for (let i = 0; i < n; i++) {
      const x = (i - (n - 1) / 2) * (front ? 0.009 : 0.0085);
      const zt = 0.034 + (lens[i] > 0.02 ? 0.004 : 0);
      ball(new THREE.Vector3(x, -0.002, zt), 0.006, skin, f);
      const c = new THREE.Mesh(clawGeo(lens[i]), clawMat);
      c.position.set(x, -0.002, zt + 0.003);
      c.rotation.x = 0.15;
      c.rotation.y = x * 4;
      f.add(c);
    }
  };
  const leg = (hip: THREE.Vector3, knee: THREE.Vector3, ankle: THREE.Vector3, front: boolean, pitch: number) => {
    limb(hip, knee, 0.028, 0.02, skin);
    ball(knee, 0.019, skin);
    limb(knee, ankle, 0.018, 0.014, skin);
    ball(ankle, 0.014, skin);
    // scaly leg rings
    for (const t of [0.35, 0.65]) {
      const p = knee.clone().lerp(ankle, t);
      const d = ankle.clone().sub(knee).normalize();
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.017 - t * 0.004, 0.0025, 3, 8), padMat);
      ring.position.copy(p);
      ring.quaternion.setFromUnitVectors(Zv, d);
      root.add(ring);
    }
    foot(ankle, front, pitch);
    for (let i = 0; i < 3; i++) {
      const p = hip.clone().lerp(knee, 0.6 + rng() * 0.4);
      hair(root, p, new THREE.Vector3(hip.x * 8, -0.6, -0.5), 0.012 + rng() * 0.01);
    }
  };
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  // trot: front-left + rear-right swing, front-right + rear-left stance
  leg(V(0.07, 0.11, 0.13), V(0.077, 0.066, 0.168), V(0.077, 0.036, 0.19), true, 0.5);
  leg(V(-0.07, 0.11, 0.13), V(-0.076, 0.06, 0.112), V(-0.077, 0.013, 0.1), true, 0);
  leg(V(-0.075, 0.11, -0.13), V(-0.082, 0.068, -0.098), V(-0.082, 0.036, -0.092), false, 0.4);
  leg(V(0.075, 0.11, -0.13), V(0.082, 0.06, -0.126), V(0.082, 0.013, -0.172), false, 0);

  // ---------- tail ----------
  {
    const P = (t: number) => new THREE.Vector3(0.018 * Math.sin(t * Math.PI), 0.115 - 0.06 * t - 0.025 * t * t, -0.2 - 0.33 * t);
    const Rt = (t: number) => 0.034 * Math.pow(1 - t, 0.9) + 0.004;
    const N = 16;
    for (let i = 0; i < N; i++) {
      const t0 = i / N, t1 = Math.min(1, (i + 1) / N + 0.015);
      const a = P(t0), b = P(t1);
      const d = b.clone().sub(a);
      const g = new THREE.CylinderGeometry(Rt(t0), Rt(t0) * 0.88, d.length(), 8);
      const m = new THREE.Mesh(g, i % 2 ? bandB : bandA);
      m.position.copy(a).add(b).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(Yv, d.clone().normalize());
      root.add(m);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(Rt(t0) * 1.01, 0.0018, 3, 10), rimMat);
      rim.position.copy(b);
      rim.quaternion.setFromUnitVectors(Zv, d.clone().normalize());
      root.add(rim);
      if (i < 10 && i % 2 === 0) {
        const side = i % 4 === 0 ? 1 : -1;
        hair(root, b.clone().add(V(side * Rt(t0), 0.004, 0)), V(side, 0.6, -0.5), 0.012 + rng() * 0.008);
      }
    }
    const tipA = P(1), tipDir = P(1).sub(P(0.95)).normalize();
    const tg = new THREE.ConeGeometry(0.0045, 0.02, 6);
    tg.translate(0, 0.01, 0);
    const tip = new THREE.Mesh(tg, bandA);
    tip.position.copy(tipA);
    tip.quaternion.setFromUnitVectors(Yv, tipDir);
    root.add(tip);
  }

  return root;
}
```