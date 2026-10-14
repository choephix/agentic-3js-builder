```ts
import * as THREE from "three";

export const meta = {
  name: "Proud Hatchling Dragon",
  description:
    "A cat-sized baby dragon sitting proudly beside its broken speckled egg. It has teal scales, a buttery belly, soft orange spines, oversized amber-membraned wings, a spade-tipped tail, big amber eyes, a toothy grin and a curl of smoke from one nostril.",
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

export default function build(): THREE.Object3D {
  const rng = mulberry32(20240611);
  const root = new THREE.Group();

  // ---------- textures ----------
  function canvasTex(draw: (c: CanvasRenderingContext2D, s: number) => void, size = 256) {
    const cv = document.createElement("canvas");
    cv.width = cv.height = size;
    const ctx = cv.getContext("2d")!;
    draw(ctx, size);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  const scaleTex = canvasTex((c, s) => {
    c.fillStyle = "#2bb0a4";
    c.fillRect(0, 0, s, s);
    const step = 16;
    for (let r = -1; r < s / step + 2; r++) {
      for (let k = -1; k < s / step + 2; k++) {
        const cx = k * step + (r % 2 ? step / 2 : 0);
        const cy = r * step * 0.75;
        const v = rng();
        c.fillStyle = v < 0.33 ? "#31bdb0" : v < 0.66 ? "#28a69b" : "#2fb6a9";
        c.beginPath();
        c.arc(cx, cy, step * 0.55, 0, Math.PI);
        c.fill();
        c.strokeStyle = "#1b7d75";
        c.lineWidth = 2;
        c.beginPath();
        c.arc(cx, cy, step * 0.55, 0.15, Math.PI - 0.15);
        c.stroke();
        c.fillStyle = "rgba(255,255,255,0.12)";
        c.beginPath();
        c.arc(cx - 2, cy + 3, 2.2, 0, Math.PI * 2);
        c.fill();
      }
    }
  });
  scaleTex.wrapS = scaleTex.wrapT = THREE.RepeatWrapping;
  scaleTex.repeat.set(3, 2);

  const eggTex = canvasTex((c, s) => {
    const g = c.createLinearGradient(0, 0, 0, s);
    g.addColorStop(0, "#fbf3dc");
    g.addColorStop(1, "#efe0bd");
    c.fillStyle = g;
    c.fillRect(0, 0, s, s);
    const cols = ["#8b5e3c", "#a8743f", "#4f8f80", "#c79a5b", "#6b4a35"];
    for (let i = 0; i < 260; i++) {
      c.fillStyle = cols[Math.floor(rng() * cols.length)];
      const r = 1 + rng() * rng() * 7;
      c.beginPath();
      c.ellipse(rng() * s, rng() * s, r, r * (0.6 + rng() * 0.6), rng() * 3, 0, Math.PI * 2);
      c.fill();
    }
  });

  const toC = (x: number, y: number): [number, number] => [
    ((x + 0.02) / 0.4) * 256,
    (1 - (y + 0.15) / 0.55) * 256,
  ];
  const wristP = new THREE.Vector2(0.13, 0.17);
  const tips = [
    new THREE.Vector2(0.1, 0.36),
    new THREE.Vector2(0.27, 0.3),
    new THREE.Vector2(0.33, 0.13),
    new THREE.Vector2(0.25, -0.02),
  ];
  const memTex = canvasTex((c, s) => {
    const [wx, wy] = toC(wristP.x, wristP.y);
    const g = c.createRadialGradient(wx, wy, 5, wx, wy, s * 0.8);
    g.addColorStop(0, "#e8641e");
    g.addColorStop(0.45, "#f99a32");
    g.addColorStop(1, "#ffd27a");
    c.fillStyle = g;
    c.fillRect(0, 0, s, s);
    c.strokeStyle = "rgba(170,60,20,0.55)";
    c.lineWidth = 2;
    const veinTargets: THREE.Vector2[] = [];
    for (let i = 0; i < tips.length - 1; i++) veinTargets.push(tips[i].clone().lerp(tips[i + 1], 0.5));
    veinTargets.push(new THREE.Vector2(0.12, -0.08));
    for (const v of veinTargets) {
      const [tx, ty] = toC(v.x, v.y);
      c.beginPath();
      c.moveTo(wx, wy);
      c.quadraticCurveTo((wx + tx) / 2 + 8, (wy + ty) / 2 - 6, tx, ty);
      c.stroke();
    }
  });
  memTex.repeat.set(1 / 0.4, 1 / 0.55);
  memTex.offset.set(0.02 / 0.4, 0.15 / 0.55);

  // ---------- materials ----------
  const M = (o: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(o);
  const scaleMat = M({ map: scaleTex, roughness: 0.55 });
  const tealDark = M({ color: "#1d7f78", roughness: 0.6 });
  const bellyMat = M({ color: "#ffe08a", roughness: 0.7 });
  const bellyLine = M({ color: "#efbe58", roughness: 0.7 });
  const spineMat = M({ color: "#ff8a3d", roughness: 0.6 });
  const hornMat = M({ color: "#f6e3b4", roughness: 0.5 });
  const eyeMat = M({ color: "#ffaa00", emissive: "#7a3d00", emissiveIntensity: 0.5, roughness: 0.25 });
  const pupilMat = M({ color: "#1a0f0a", roughness: 0.3 });
  const whiteMat = M({ color: "#ffffff", roughness: 0.3 });
  const mouthMat = M({ color: "#5a1e2a", roughness: 0.8 });
  const cheekMat = M({ color: "#ff9aa2", roughness: 0.8 });
  const memMat = M({
    map: memTex,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
    emissive: "#ff7a1a",
    emissiveIntensity: 0.15,
    roughness: 0.6,
    depthWrite: false,
  });
  const smokeMat = M({ color: "#dcdce4", transparent: true, opacity: 0.6, roughness: 1, depthWrite: false });
  const eggMat = M({ map: eggTex, roughness: 0.65, side: THREE.DoubleSide });
  const eggInner = M({ color: "#fff6e0", roughness: 0.8, side: THREE.DoubleSide });

  // ---------- helpers ----------
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  function add(
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    parent: THREE.Object3D,
    p: [number, number, number],
    s?: [number, number, number],
    r?: [number, number, number]
  ) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(p[0], p[1], p[2]);
    if (s) m.scale.set(s[0], s[1], s[2]);
    if (r) m.rotation.set(r[0], r[1], r[2]);
    parent.add(m);
    return m;
  }
  const UP = new THREE.Vector3(0, 1, 0);
  function limb(a: THREE.Vector3, b: THREE.Vector3, r1: number, r2: number, mat: THREE.Material, parent: THREE.Object3D, seg = 7) {
    const d = b.clone().sub(a);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, d.length(), seg), mat);
    m.position.copy(a).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(UP, d.normalize());
    parent.add(m);
    return m;
  }
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const dragon = new THREE.Group();
  root.add(dragon);

  // ---------- body ----------
  add(sph(0.1, 10, 8), scaleMat, dragon, [0, 0.13, -0.01], [1, 1.25, 0.95]);
  add(sph(0.11, 10, 7), scaleMat, dragon, [0, 0.08, -0.02], [1.05, 0.7, 1]);
  add(sph(0.085, 10, 8), bellyMat, dragon, [0, 0.13, 0.045], [0.85, 1.2, 0.6]);
  // belly plate ridges
  for (let k = 0; k < 5; k++) {
    const dy = -0.06 + 0.03 * k;
    const f = Math.sqrt(1 - (dy / 0.102) ** 2);
    const R = 0.0723 * f * 1.02;
    const g = new THREE.TorusGeometry(R, 0.003, 3, 12, Math.PI * 0.7);
    g.rotateZ(Math.PI * 0.15);
    g.rotateX(Math.PI / 2);
    add(g, bellyLine, dragon, [0, 0.13 + dy, 0.045], [1, 1, (0.051 / 0.0723) * 1.02]);
  }

  // neck
  limb(V(0, 0.19, -0.005), V(0, 0.3, 0.03), 0.05, 0.042, scaleMat, dragon, 9);
  add(sph(0.035, 8, 6), bellyMat, dragon, [0, 0.24, 0.035], [1, 1.3, 0.8]);

  // ---------- head ----------
  add(sph(0.075, 10, 8), scaleMat, dragon, [0, 0.32, 0.02], [1, 0.92, 0.95]);
  add(sph(0.055, 9, 7), scaleMat, dragon, [0, 0.3, 0.075], [1.0, 0.75, 1.1]);
  add(sph(0.045, 8, 6), bellyMat, dragon, [0, 0.275, 0.07], [1, 0.5, 1.1]);
  // grin
  {
    const g = new THREE.TorusGeometry(0.05, 0.005, 4, 14, Math.PI * 0.9);
    g.rotateZ(Math.PI * 0.05);
    g.rotateX(Math.PI / 2);
    add(g, mouthMat, dragon, [0, 0.285, 0.075], [1.03, 1, 1.13]);
    for (const a of [0.05 * Math.PI, 0.95 * Math.PI]) {
      add(sph(0.007, 6, 4), mouthMat, dragon, [0.052 * Math.cos(a), 0.29, 0.075 + 0.057 * Math.sin(a)]);
    }
    const toothG = new THREE.ConeGeometry(0.006, 0.016, 5);
    for (const da of [-0.75, -0.45, -0.15, 0.15, 0.45, 0.75]) {
      const a = Math.PI / 2 + da;
      add(toothG, whiteMat, dragon, [0.052 * Math.cos(a), 0.278, 0.075 + 0.058 * Math.sin(a)], undefined, [Math.PI, 0, 0]);
    }
    // little bottom fangs poking up
    for (const s of [-1, 1]) {
      const a = Math.PI / 2 + s * 0.6;
      add(toothG, whiteMat, dragon, [0.05 * Math.cos(a), 0.29, 0.075 + 0.056 * Math.sin(a)], [0.8, 0.8, 0.8]);
    }
  }
  // nostrils
  for (const s of [-1, 1]) add(sph(0.008, 6, 4), pupilMat, dragon, [s * 0.018, 0.315, 0.127], [1, 0.8, 0.5]);
  // nose nub
  add(new THREE.ConeGeometry(0.008, 0.018, 5), hornMat, dragon, [0, 0.335, 0.112], undefined, [0.5, 0, 0]);

  // eyes
  for (const s of [-1, 1]) {
    const ep = V(s * 0.04, 0.335, 0.07);
    add(sph(0.028, 10, 8), eyeMat, dragon, [ep.x, ep.y, ep.z]);
    const dir = V(s * 0.35, 0.05, 1).normalize();
    const pp = ep.clone().addScaledVector(dir, 0.025);
    const pupil = add(sph(0.012, 8, 6), pupilMat, dragon, [pp.x, pp.y, pp.z], [0.4, 1.35, 0.35]);
    pupil.lookAt(ep.clone().addScaledVector(dir, 1));
    const hp = ep.clone().addScaledVector(V(s * 0.2 - 0.25, 0.55, 0.8).normalize(), 0.027);
    add(sph(0.006, 6, 4), whiteMat, dragon, [hp.x, hp.y, hp.z]);
    const hp2 = ep.clone().addScaledVector(V(s * 0.5 + 0.2, -0.3, 0.8).normalize(), 0.027);
    add(sph(0.003, 5, 3), whiteMat, dragon, [hp2.x, hp2.y, hp2.z]);
    // heavy proud lid
    add(sph(0.031, 9, 6), tealDark, dragon, [ep.x, ep.y + 0.02, ep.z - 0.006], [1.1, 0.42, 0.95], [0.25, 0, -s * 0.18]);
    // cheek blush
    add(sph(0.016, 8, 5), cheekMat, dragon, [s * 0.058, 0.3, 0.064], [0.5, 0.45, 0.35], [0, s * 0.9, 0]);
    // horns
    const hornG = new THREE.ConeGeometry(0.016, 0.055, 6);
    add(hornG, hornMat, dragon, [s * 0.036, 0.385, -0.01], undefined, [-0.55, 0, -s * 0.35]);
    add(new THREE.TorusGeometry(0.015, 0.004, 4, 8), hornMat, dragon, [s * 0.034, 0.37, -0.002], undefined, [Math.PI / 2 - 0.55, 0, -s * 0.35]);
    // ear frills
    add(new THREE.ConeGeometry(0.014, 0.045, 4), spineMat, dragon, [s * 0.075, 0.33, -0.015], [1, 1, 0.35], [-0.6, 0, -s * 1.2]);
  }

  // ---------- spines ----------
  const spineG = sph(1, 6, 5);
  function spine(x: number, y: number, z: number, theta: number, size: number, yaw = 0) {
    const m = new THREE.Mesh(spineG, spineMat);
    m.rotation.order = "YXZ";
    m.rotation.set(theta, yaw, 0);
    const n = V(0, Math.cos(theta), Math.sin(theta)).applyAxisAngle(UP, yaw);
    m.position.set(x, y, z).addScaledVector(n, size * 0.45);
    m.scale.set(size * 0.32, size, size * 0.7);
    dragon.add(m);
  }
  const backSpines: [number, number, number, number][] = [
    [0.385, 0.0, -0.3, 0.016],
    [0.35, -0.042, -1.0, 0.02],
    [0.305, -0.05, -1.4, 0.018],
    [0.26, -0.025, -1.45, 0.02],
    [0.21, -0.083, -1.1, 0.024],
    [0.165, -0.101, -1.35, 0.027],
    [0.12, -0.114, -1.5, 0.028],
    [0.075, -0.128, -1.65, 0.026],
  ];
  for (const [y, z, t, s] of backSpines) spine(0, y, z, t, s);

  // ---------- tail ----------
  const tailCurve = new THREE.CatmullRomCurve3([
    V(0, 0.05, -0.1),
    V(-0.05, 0.04, -0.19),
    V(-0.15, 0.03, -0.21),
    V(-0.23, 0.03, -0.12),
    V(-0.24, 0.03, 0.0),
    V(-0.19, 0.05, 0.09),
    V(-0.13, 0.08, 0.115),
  ]);
  const N = 24;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const p = tailCurve.getPointAt(t);
    const r = 0.05 * (1 - t) + 0.016 * t + 0.008 * Math.sin(Math.PI * t);
    const y = Math.max(p.y, r * 0.92);
    add(sph(r, 8, 6), scaleMat, dragon, [p.x, y, p.z], [1, 0.92, 1]);
    if (i % 2 === 1 && i < N - 1) {
      const tg = tailCurve.getTangentAt(t);
      spine(p.x, y + r * 0.85, p.z, 0, 0.024 * (1 - t) + 0.01, Math.atan2(tg.x, tg.z));
    }
  }
  // spade
  {
    const sh = new THREE.Shape();
    sh.moveTo(0.01, 0);
    sh.bezierCurveTo(-0.01, 0.01, -0.015, 0.04, 0.01, 0.035);
    sh.bezierCurveTo(0.03, 0.03, 0.05, 0.015, 0.07, 0);
    sh.bezierCurveTo(0.05, -0.015, 0.03, -0.03, 0.01, -0.035);
    sh.bezierCurveTo(-0.015, -0.04, -0.01, -0.01, 0.01, 0);
    const g = new THREE.ExtrudeGeometry(sh, {
      depth: 0.008,
      bevelEnabled: true,
      bevelThickness: 0.003,
      bevelSize: 0.003,
      bevelSegments: 1,
      curveSegments: 5,
    });
    g.translate(0, 0, -0.004);
    const end = tailCurve.getPointAt(1);
    const tg = tailCurve.getTangentAt(1);
    const m = add(g, spineMat, dragon, [end.x, end.y, end.z]);
    m.rotation.y = Math.atan2(-tg.z, tg.x);
  }

  // ---------- legs ----------
  const clawG = new THREE.ConeGeometry(0.005, 0.014, 5);
  for (const s of [-1, 1]) {
    // hind
    add(sph(0.062, 9, 7), scaleMat, dragon, [s * 0.088, 0.065, 0.015], [0.85, 1, 1.25]);
    add(sph(0.04, 8, 6), scaleMat, dragon, [s * 0.095, 0.02, 0.085], [1, 0.5, 1.5]);
    for (const dx of [-0.022, 0, 0.022]) {
      add(sph(0.016, 7, 5), scaleMat, dragon, [s * 0.095 + dx, 0.016, 0.14], [1, 0.9, 1]);
      add(clawG, hornMat, dragon, [s * 0.095 + dx, 0.012, 0.158], undefined, [Math.PI / 2 + 0.3, 0, 0]);
    }
    // front
    const sh = V(s * 0.07, 0.2, 0.04);
    const el = V(s * 0.065, 0.1, 0.1);
    const wr = V(s * 0.05, 0.03, 0.125);
    add(sph(0.03, 8, 6), scaleMat, dragon, [sh.x, sh.y, sh.z]);
    limb(sh, el, 0.026, 0.021, scaleMat, dragon);
    add(sph(0.021, 7, 5), scaleMat, dragon, [el.x, el.y, el.z]);
    limb(el, wr, 0.021, 0.018, scaleMat, dragon);
    add(sph(0.024, 8, 6), scaleMat, dragon, [s * 0.05, 0.017, 0.13], [1.1, 0.6, 1.2]);
    for (const dx of [-0.012, 0, 0.012]) {
      add(clawG, hornMat, dragon, [s * 0.05 + dx, 0.01, 0.157], [0.85, 0.85, 0.85], [Math.PI / 2 + 0.3, 0, 0]);
    }
  }

  // ---------- wings ----------
  function buildWing() {
    const g = new THREE.Group();
    const r0 = new THREE.Vector2(0, 0);
    const elbow = new THREE.Vector2(0.07, 0.08);
    const bodyEnd = new THREE.Vector2(0.0, -0.11);
    const shape = new THREE.Shape();
    shape.moveTo(r0.x, r0.y);
    shape.lineTo(elbow.x, elbow.y);
    shape.lineTo(wristP.x, wristP.y);
    shape.lineTo(tips[0].x, tips[0].y);
    for (let i = 0; i < tips.length - 1; i++) {
      const c = tips[i].clone().lerp(tips[i + 1], 0.5).lerp(wristP, 0.3);
      shape.quadraticCurveTo(c.x, c.y, tips[i + 1].x, tips[i + 1].y);
    }
    const c = tips[3].clone().lerp(bodyEnd, 0.5).lerp(wristP, 0.3);
    shape.quadraticCurveTo(c.x, c.y, bodyEnd.x, bodyEnd.y);
    shape.lineTo(r0.x, r0.y);
    g.add(new THREE.Mesh(new THREE.ShapeGeometry(shape, 6), memMat));

    const v3 = (p: THREE.Vector2) => V(p.x, p.y, 0);
    limb(v3(r0), v3(elbow), 0.016, 0.012, tealDark, g);
    add(sph(0.014, 7, 5), tealDark, g, [elbow.x, elbow.y, 0]);
    limb(v3(elbow), v3(wristP), 0.012, 0.011, tealDark, g);
    add(sph(0.014, 7, 5), tealDark, g, [wristP.x, wristP.y, 0]);
    for (const t of tips) {
      limb(v3(wristP), v3(t), 0.008, 0.0035, tealDark, g, 5);
      add(sph(0.0055, 5, 4), spineMat, g, [t.x, t.y, 0]);
    }
    // thumb claw
    add(new THREE.ConeGeometry(0.008, 0.026, 5), hornMat, g, [wristP.x - 0.005, wristP.y + 0.016, 0.004], undefined, [0.3, 0, 0.5]);
    g.scale.setScalar(0.9);
    return g;
  }
  for (const s of [-1, 1]) {
    const outer = new THREE.Group();
    outer.scale.x = s;
    outer.position.set(s * 0.06, 0.24, -0.07);
    const w = buildWing();
    w.rotation.set(-0.1, 0.6, 0.05);
    outer.add(w);
    dragon.add(outer);
    add(sph(0.026, 8, 6), scaleMat, dragon, [s * 0.055, 0.24, -0.065]);
  }

  // ---------- smoke ----------
  for (let i = 0; i < 11; i++) {
    const t = i / 10;
    const x = -0.02 - 0.03 * t + 0.028 * Math.sin(t * 5.5);
    const y = 0.325 + 0.18 * t;
    const z = 0.138 + 0.03 * Math.sin(t * 4) + 0.02 * t;
    const r = 0.006 + 0.016 * t;
    add(sph(r, 6, 4), smokeMat, dragon, [x, y, z]);
    if (i > 3 && i % 2 === 0) add(sph(r * 0.7, 6, 4), smokeMat, dragon, [x + r * 0.9, y + r * 0.3, z - r * 0.4]);
  }

  // ---------- egg ----------
  const eggR = (y: number) => {
    const c = 0.085;
    const a = y < c ? 0.085 : 0.115;
    const d = (y - c) / a;
    return 0.075 * Math.sqrt(Math.max(0, 1 - d * d));
  };
  const SEG = 14;
  function shell(y0: number, y1: number, n: number, jagTop: boolean, offs: number[], rScale: number) {
    const pts: THREE.Vector2[] = [];
    for (let j = 0; j <= n; j++) {
      const y = y0 + ((y1 - y0) * j) / n;
      pts.push(new THREE.Vector2(eggR(y) * rScale, y));
    }
    const g = new THREE.LatheGeometry(pts, SEG);
    const pos = g.attributes.position;
    const L = pts.length;
    for (let i = 0; i <= SEG; i++) {
      const idx = i * L + (jagTop ? L - 1 : 0);
      pos.setY(idx, pos.getY(idx) + offs[i % SEG]);
    }
    g.computeVertexNormals();
    return g;
  }
  const offsA: number[] = [];
  const offsB: number[] = [];
  for (let i = 0; i < SEG; i++) {
    offsA.push((i % 2 ? 0.022 : -0.012) * (0.6 + 0.8 * rng()));
    offsB.push((i % 2 ? -0.02 : 0.012) * (0.6 + 0.8 * rng()));
  }
  const egg = new THREE.Group();
  egg.position.set(0.25, 0, 0.06);
  egg.rotation.set(0.05, 0.4, 0.1);
  root.add(egg);
  egg.add(new THREE.Mesh(shell(0, 0.13, 9, true, offsA, 1), eggMat));
  egg.add(new THREE.Mesh(shell(0.006, 0.13, 9, true, offsA, 0.93), eggInner));

  // fallen cap
  {
    const outer = shell(0.12, 0.2, 5, false, offsB, 1);
    const inner = shell(0.12, 0.196, 5, false, offsB, 0.93);
    for (const g of [outer, inner]) {
      g.translate(0, -0.16, 0);
      g.rotateZ(2.1);
      g.rotateY(0.7);
    }
    outer.computeBoundingBox();
    const bb = outer.boundingBox!;
    for (const g of [outer, inner]) g.translate(0, -bb.min.y, 0);
    add(outer, eggMat, root, [0.38, 0, 0.2]);
    add(inner, eggInner, root, [0.38, 0, 0.2]);
  }

  // shards
  const shardSpots: [number, number][] = [
    [0.16, 0.17],
    [0.33, -0.05],
    [0.42, 0.08],
    [0.26, 0.25],
    [0.12, 0.24],
  ];
  for (const [x, z] of shardSpots) {
    const g = new THREE.SphereGeometry(0.075, 4, 3, rng() * 6, 0.35 + rng() * 0.3, 1.2, 0.35 + rng() * 0.3);
    g.rotateX(rng() * 6);
    g.rotateZ(rng() * 6);
    g.computeBoundingBox();
    const b = g.boundingBox!;
    const c = new THREE.Vector3();
    b.getCenter(c);
    g.translate(-c.x, -b.min.y, -c.z);
    add(g, eggMat, root, [x, 0, z]);
  }

  return root;
}
```