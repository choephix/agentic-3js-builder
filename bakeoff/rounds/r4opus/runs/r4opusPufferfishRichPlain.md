```ts
import * as THREE from "three";

export const meta = {
  name: "Startled Pufferfish",
  description:
    "A fully puffed pufferfish ball with creamy yellow leopard-spotted skin fading to a white belly. It is covered in short pyramid spikes and has big worried eyes, a tiny pouting mouth, fluttering side fins and a stubby fan tail. Bubbles rise from its mouth.",
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

export default function build(): THREE.Object3D {
  const rng = mulberry32(1337);
  const root = new THREE.Group();
  const R = 0.15;
  const up = new THREE.Vector3(0, 1, 0);

  // ---------- skin texture ----------
  const cw = 512, ch = 256;
  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 0, ch);
  grad.addColorStop(0, "#efd27a");
  grad.addColorStop(0.42, "#f4dd96");
  grad.addColorStop(0.58, "#f9efd2");
  grad.addColorStop(0.7, "#fcf8ee");
  grad.addColorStop(1, "#fdfbf6");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, cw, ch);
  const drawSpot = (x: number, y: number, rx: number, ry: number, col: string, alpha: number) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = col;
    for (const ox of [-cw, 0, cw]) {
      ctx.beginPath();
      ctx.ellipse(x + ox, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  for (let i = 0; i < 150; i++) {
    const y = 4 + rng() * 150;
    const x = rng() * cw;
    const theta = (y / ch) * Math.PI;
    const stretch = Math.min(3, 1 / Math.max(0.15, Math.sin(theta)));
    const r = 5 + rng() * 11;
    const alpha = y < 100 ? 1 : Math.max(0, 1 - (y - 100) / 55);
    if (alpha <= 0.02) continue;
    const rx = r * stretch * (0.8 + rng() * 0.4);
    const ry = r * (0.8 + rng() * 0.4);
    if (rng() < 0.45) {
      // rosette
      drawSpot(x, y, rx, ry, "#6b3d1c", alpha);
      drawSpot(x, y, rx * 0.55, ry * 0.55, "#b07a3c", alpha);
    } else {
      drawSpot(x, y, rx * 0.8, ry * 0.8, "#7e4a22", alpha);
    }
  }
  ctx.globalAlpha = 1;
  const skinTex = new THREE.CanvasTexture(canvas);
  skinTex.colorSpace = THREE.SRGBColorSpace;
  skinTex.wrapS = THREE.RepeatWrapping;

  // ---------- materials ----------
  const skinMat = new THREE.MeshStandardMaterial({ map: skinTex, roughness: 0.6, flatShading: true });
  const yellowMat = new THREE.MeshStandardMaterial({ color: "#f0d488", roughness: 0.6, flatShading: true });
  const spikeTopMat = new THREE.MeshStandardMaterial({ color: "#d9b25e", roughness: 0.5, flatShading: true });
  const spikeBellyMat = new THREE.MeshStandardMaterial({ color: "#f3ece0", roughness: 0.5, flatShading: true });
  const whiteMat = new THREE.MeshStandardMaterial({ color: "#fdfdf8", roughness: 0.25 });
  const ringMat = new THREE.MeshStandardMaterial({ color: "#e6a92e", roughness: 0.4, flatShading: true });
  const irisMat = new THREE.MeshStandardMaterial({ color: "#5a3818", roughness: 0.3 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: "#0e0b09", roughness: 0.15 });
  const browMat = new THREE.MeshStandardMaterial({ color: "#5b3518", roughness: 0.7, flatShading: true });
  const lipMat = new THREE.MeshStandardMaterial({ color: "#e8806e", roughness: 0.45, flatShading: true });
  const mouthInMat = new THREE.MeshStandardMaterial({ color: "#3e1717", roughness: 0.8 });
  const cheekMat = new THREE.MeshStandardMaterial({ color: "#f3a397", roughness: 0.7 });
  const finMat = new THREE.MeshStandardMaterial({
    color: "#f2b042", roughness: 0.5, transparent: true, opacity: 0.85, side: THREE.DoubleSide,
  });
  const rayMat = new THREE.MeshStandardMaterial({ color: "#c2701e", roughness: 0.6, flatShading: true });
  const bubbleMat = new THREE.MeshStandardMaterial({
    color: "#bfe9ff", roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.42,
  });

  const basisQuat = (d: THREE.Vector3) => {
    const x = new THREE.Vector3().crossVectors(up, d).normalize();
    const y = new THREE.Vector3().crossVectors(d, x);
    const m = new THREE.Matrix4().makeBasis(x, y, d);
    return new THREE.Quaternion().setFromRotationMatrix(m);
  };

  // ---------- body ----------
  const body = new THREE.Mesh(new THREE.SphereGeometry(R, 22, 16), skinMat);
  root.add(body);

  // ---------- feature directions ----------
  const eyeDirs = [1, -1].map((s) => new THREE.Vector3(0.45 * s, 0.32, 0.83).normalize());
  const mouthDir = new THREE.Vector3(0, -0.18, 1).normalize();
  const pecDirs = [1, -1].map((s) => new THREE.Vector3(s, -0.1, -0.07).normalize());
  const tailDir = new THREE.Vector3(0, 0, -1);
  const dorsalDir = new THREE.Vector3(0, 0.55, -0.83).normalize();
  const analDir = new THREE.Vector3(0, -0.55, -0.83).normalize();
  const cheekDirs = [1, -1].map((s) => new THREE.Vector3(0.62 * s, -0.08, 0.78).normalize());

  // ---------- spikes ----------
  const spikeGeo = new THREE.ConeGeometry(0.0075, 1, 4);
  const N = 190;
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const rr = Math.sqrt(1 - y * y);
    const phi = i * golden;
    const n = new THREE.Vector3(Math.cos(phi) * rr, y, Math.sin(phi) * rr);
    let skip = false;
    for (const e of eyeDirs) if (n.dot(e) > 0.88) skip = true;
    for (const p of pecDirs) if (n.dot(p) > 0.95) skip = true;
    for (const c of cheekDirs) if (n.dot(c) > 0.97) skip = true;
    if (n.dot(mouthDir) > 0.94) skip = true;
    if (n.dot(tailDir) > 0.93) skip = true;
    if (n.dot(dorsalDir) > 0.96 || n.dot(analDir) > 0.96) skip = true;
    if (skip) continue;
    const h = 0.022 + rng() * 0.014;
    const spike = new THREE.Mesh(spikeGeo, n.y > -0.15 ? spikeTopMat : spikeBellyMat);
    spike.scale.set(1, h, 1);
    spike.quaternion.setFromUnitVectors(up, n);
    spike.position.copy(n).multiplyScalar(R + h / 2 - 0.004);
    root.add(spike);
  }

  // ---------- eyes ----------
  const scleraGeo = new THREE.SphereGeometry(0.046, 14, 10);
  const ringGeo = new THREE.TorusGeometry(0.044, 0.006, 6, 16);
  const irisGeo = new THREE.SphereGeometry(0.03, 12, 8);
  const pupilGeo = new THREE.SphereGeometry(0.019, 10, 8);
  const hlGeo = new THREE.SphereGeometry(0.007, 6, 5);
  const hl2Geo = new THREE.SphereGeometry(0.0035, 5, 4);
  const browGeo = new THREE.BoxGeometry(0.052, 0.01, 0.012);
  for (const d of eyeDirs) {
    const eye = new THREE.Group();
    eye.position.copy(d).multiplyScalar(R * 0.93);
    eye.quaternion.copy(basisQuat(d));
    const sclera = new THREE.Mesh(scleraGeo, whiteMat);
    sclera.scale.set(1, 1, 0.75);
    eye.add(sclera);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.z = 0.012;
    eye.add(ring);
    const iris = new THREE.Mesh(irisGeo, irisMat);
    iris.scale.set(1, 1, 0.35);
    iris.position.set(0, 0.004, 0.029);
    eye.add(iris);
    const pupil = new THREE.Mesh(pupilGeo, pupilMat);
    pupil.scale.set(1, 1, 0.35);
    pupil.position.set(0, 0.005, 0.034);
    eye.add(pupil);
    const hl = new THREE.Mesh(hlGeo, whiteMat);
    hl.position.set(-0.009 * Math.sign(d.x), 0.014, 0.04);
    eye.add(hl);
    const hl2 = new THREE.Mesh(hl2Geo, whiteMat);
    hl2.position.set(0.008 * Math.sign(d.x), -0.005, 0.041);
    eye.add(hl2);
    const brow = new THREE.Mesh(browGeo, browMat);
    brow.position.set(0, 0.06, 0.004);
    brow.rotation.z = -Math.sign(d.x) * 0.38;
    eye.add(brow);
    root.add(eye);
  }

  // ---------- cheeks ----------
  const cheekGeo = new THREE.SphereGeometry(0.022, 10, 6);
  for (const d of cheekDirs) {
    const c = new THREE.Mesh(cheekGeo, cheekMat);
    c.quaternion.copy(basisQuat(d));
    c.scale.set(1, 0.7, 0.25);
    c.position.copy(d).multiplyScalar(R * 0.995);
    root.add(c);
  }

  // ---------- pouting mouth ----------
  const mouth = new THREE.Group();
  mouth.position.copy(mouthDir).multiplyScalar(R * 0.97);
  mouth.quaternion.copy(basisQuat(mouthDir));
  mouth.scale.set(1, 0.85, 1);
  const pout = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.021, 0.022, 12), lipMat);
  pout.rotation.x = Math.PI / 2;
  pout.position.z = 0.011;
  mouth.add(pout);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(0.014, 0.0065, 6, 14), lipMat);
  lip.position.z = 0.022;
  mouth.add(lip);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.009, 10), mouthInMat);
  hole.position.z = 0.0226;
  mouth.add(hole);
  root.add(mouth);

  // ---------- fins ----------
  const makeFan = (r: number, half: number, n: number) => {
    const g = new THREE.Group();
    const shape = new THREE.Shape();
    const tip = (a: number, rr: number): [number, number] => [Math.cos(a) * rr, Math.sin(a) * rr];
    shape.moveTo(0, 0);
    const t0 = tip(-half, r);
    shape.lineTo(t0[0], t0[1]);
    for (let i = 1; i <= n; i++) {
      const a = -half + (2 * half * i) / n;
      const am = -half + (2 * half * (i - 0.5)) / n;
      const c = tip(am, r * 0.8);
      const t = tip(a, r);
      shape.quadraticCurveTo(c[0], c[1], t[0], t[1]);
    }
    shape.lineTo(0, 0);
    g.add(new THREE.Mesh(new THREE.ShapeGeometry(shape, 3), finMat));
    const len = r * 0.82;
    const rayGeo = new THREE.BoxGeometry(len, 0.0024, 0.003);
    for (let i = 0; i <= n; i++) {
      const a = -half + (2 * half * i) / n;
      const ray = new THREE.Mesh(rayGeo, rayMat);
      const p = tip(a, r * 0.08 + len / 2);
      ray.position.set(p[0], p[1], 0);
      ray.rotation.z = a;
      g.add(ray);
    }
    const knob = new THREE.Mesh(new THREE.SphereGeometry(r * 0.16, 8, 6), yellowMat);
    knob.scale.set(1, 1, 0.6);
    g.add(knob);
    return g;
  };

  // pectoral fins (fluttering)
  for (const s of [1, -1]) {
    const wrap = new THREE.Group();
    wrap.position.set(s * R * 0.94, -0.015, -0.012);
    wrap.scale.x = s;
    const fan = makeFan(0.058, 0.9, 6);
    fan.rotation.y = 0.65;
    fan.rotation.z = s > 0 ? 0.22 : -0.05; // asymmetric flutter
    fan.rotation.x = 0.25;
    wrap.add(fan);
    root.add(wrap);
  }

  // tail
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.032, 0.04, 8), yellowMat);
  ped.rotation.x = -Math.PI / 2;
  ped.position.z = -(R + 0.002);
  root.add(ped);
  const tailWrap = new THREE.Group();
  tailWrap.position.z = -(R + 0.02);
  const tail = makeFan(0.078, 0.78, 7);
  tail.rotation.y = Math.PI / 2;
  tailWrap.add(tail);
  root.add(tailWrap);

  // dorsal + anal fins
  const median = (theta: number) => {
    const outer = new THREE.Group();
    outer.rotation.x = theta;
    const off = new THREE.Group();
    off.position.z = -R * 0.96;
    const fan = makeFan(0.036, 0.7, 4);
    fan.rotation.y = Math.PI / 2;
    off.add(fan);
    outer.add(off);
    root.add(outer);
  };
  median(Math.atan2(0.55, 0.83));
  median(-Math.atan2(0.55, 0.83));

  // ---------- bubbles ----------
  const bubbleGeo = new THREE.IcosahedronGeometry(1, 1);
  const bubbleHlGeo = new THREE.SphereGeometry(1, 6, 4);
  const bubbles: [number, number, number, number][] = [
    [0.004, 0.0, 0.205, 0.007],
    [-0.012, 0.05, 0.215, 0.011],
    [0.012, 0.115, 0.226, 0.016],
    [-0.006, 0.19, 0.232, 0.01],
    [0.016, 0.255, 0.24, 0.02],
  ];
  for (const [x, y, z, r] of bubbles) {
    const b = new THREE.Mesh(bubbleGeo, bubbleMat);
    b.scale.setScalar(r);
    b.position.set(x, y, z);
    root.add(b);
    const h = new THREE.Mesh(bubbleHlGeo, whiteMat);
    h.scale.setScalar(r * 0.25);
    h.position.set(x - r * 0.35, y + r * 0.4, z + r * 0.6);
    root.add(h);
  }

  // ---------- rest on floor ----------
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const out = new THREE.Group();
  root.position.y = -box.min.y;
  out.add(root);
  return out;
}
```