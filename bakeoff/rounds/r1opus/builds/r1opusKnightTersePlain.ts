import * as THREE from "three";

export const meta = {
  name: "Knight of the Azure Cross",
  description:
    "A blocky, puppet-like armored knight in faceted steel plate with gold trim, an azure heraldic tabard, crimson cape, crowned great helm with a red-and-white plume, a quartered heater shield and a longsword resting point-down.",
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
  const rng = mulberry32(1337);
  const root = new THREE.Group();
  const V = THREE.Vector3;

  // ---------- materials ----------
  const std = (color: number, metal = 0, rough = 0.6, extra: any = {}) =>
    new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: rough, flatShading: true, ...extra });
  const steel = std(0xb4bec9, 0.6, 0.32, { side: THREE.DoubleSide });
  const dark = std(0x48505a, 0.5, 0.5);
  const gold = std(0xd8a82c, 0.7, 0.3);
  const leather = std(0x5a3820, 0.0, 0.85);
  const black = std(0x0a0a0e, 0.0, 0.9);
  const red = std(0xc8102e, 0.0, 0.7);
  const white = std(0xf2efe6, 0.0, 0.7);
  const capeMat = std(0x7a1020, 0.0, 0.9, { side: THREE.DoubleSide });
  const blue = std(0x1f3a8a, 0.0, 0.85);
  const bladeMat = std(0xe2e8ef, 0.85, 0.18);

  // ---------- canvas textures ----------
  function canvasTex(w: number, h: number, draw: (c: CanvasRenderingContext2D, w: number, h: number) => void) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    draw(c.getContext("2d")!, w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }
  function pattee(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, col: string) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = col;
    ctx.strokeStyle = "#3a2508";
    ctx.lineWidth = Math.max(1.5, s * 0.05);
    ctx.beginPath();
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2;
      const rot = (x: number, y: number): [number, number] => [
        x * Math.cos(a) - y * Math.sin(a),
        x * Math.sin(a) + y * Math.cos(a),
      ];
      const p0 = rot(-s * 0.13, -s * 0.13);
      const p1 = rot(-s * 0.42, -s);
      const pc = rot(0, -s * 0.82);
      const p2 = rot(s * 0.42, -s);
      if (k === 0) ctx.moveTo(...p0);
      else ctx.lineTo(...p0);
      ctx.lineTo(...p1);
      ctx.quadraticCurveTo(pc[0], pc[1], p2[0], p2[1]);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  function diaper(ctx: CanvasRenderingContext2D, w: number, h: number, step: number) {
    ctx.strokeStyle = "rgba(120,150,230,0.25)";
    ctx.lineWidth = 1;
    for (let i = -h; i < w + h; i += step) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + h, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(i, h);
      ctx.lineTo(i + h, 0);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(230,190,80,0.35)";
    for (let x = step / 2; x < w; x += step)
      for (let y = 0; y < h; y += step) {
        const j = (rng() - 0.5) * 0.6;
        ctx.fillRect(x - 1 + j, y - 1, 2, 2);
      }
  }
  function star(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, col: string) {
    ctx.fillStyle = col;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rr = i % 2 ? r * 0.42 : r;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  const chestTex = canvasTex(128, 128, (c, w, h) => {
    c.fillStyle = "#1f3a8a";
    c.fillRect(0, 0, w, h);
    diaper(c, w, h, 16);
    c.strokeStyle = "#d8a82c";
    c.lineWidth = 7;
    c.strokeRect(5, -10, w - 10, h + 4);
    c.strokeStyle = "#0e1c48";
    c.lineWidth = 1.5;
    c.strokeRect(10, -10, w - 20, h - 1);
    pattee(c, w / 2, h / 2 - 2, 40, "#e6b830");
    c.fillStyle = "#c8102e";
    c.beginPath();
    c.arc(w / 2, h / 2 - 2, 7, 0, Math.PI * 2);
    c.fill();
  });
  const skirtTex = canvasTex(128, 150, (c, w, h) => {
    c.fillStyle = "#1f3a8a";
    c.fillRect(0, 0, w, h);
    diaper(c, w, h, 16);
    c.fillStyle = "#d8a82c";
    c.fillRect(0, 0, 7, h);
    c.fillRect(w - 7, 0, 7, h);
    c.fillRect(0, h - 10, w, 10);
    c.fillStyle = "#0b1230";
    c.fillRect(w / 2 - 2, h * 0.45, 4, h * 0.55);
    for (let x = 14; x < w - 8; x += 14) {
      c.fillStyle = "#e6b830";
      c.beginPath();
      c.moveTo(x, h - 26);
      c.lineTo(x + 5, h - 20);
      c.lineTo(x, h - 14);
      c.lineTo(x - 5, h - 20);
      c.fill();
    }
  });
  const shieldTex = canvasTex(256, 308, (c, w, h) => {
    const hw = w / 2, hh = h * (0.25 / 0.6) + 0; // cross center near upper-mid
    const cy = h * 0.42;
    c.fillStyle = "#1f3a8a";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#b50e2a";
    c.fillRect(hw, 0, hw, cy);
    c.fillRect(0, cy, hw, h - cy);
    diaper(c, w, h, 22);
    star(c, hw * 0.5, cy * 0.5, 22, "#f2efe6");
    star(c, hw * 1.5, cy + (h - cy) * 0.35, 22, "#f2efe6");
    c.fillStyle = "#e6b830";
    for (let i = 0; i < 3; i++) star(c, hw * 1.5 + (i - 1) * 26, cy * 0.5, 9, "#e6b830");
    for (let i = 0; i < 3; i++) star(c, hw * 0.5 + (i - 1) * 26, cy + (h - cy) * 0.35, 9, "#e6b830");
    void hh;
    pattee(c, hw, cy, 70, "#e6b830");
    c.fillStyle = "#f2efe6";
    c.beginPath();
    c.arc(hw, cy, 12, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#c8102e";
    c.beginPath();
    c.arc(hw, cy, 7, 0, Math.PI * 2);
    c.fill();
  });
  const chestMat = new THREE.MeshStandardMaterial({ map: chestTex, roughness: 0.85 });
  const skirtMat = new THREE.MeshStandardMaterial({ map: skirtTex, roughness: 0.85 });
  shieldTex.repeat.set(1 / 0.5, 1 / 0.6);
  shieldTex.offset.set(0.5, 0.35 / 0.6);
  const shieldMat = new THREE.MeshStandardMaterial({ map: shieldTex, roughness: 0.6, metalness: 0.1 });

  // ---------- helpers ----------
  function add(geo: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, p: THREE.Object3D = root) {
    const me = new THREE.Mesh(geo, m);
    me.position.set(x, y, z);
    p.add(me);
    return me;
  }
  const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number, p: THREE.Object3D = root) =>
    add(new THREE.BoxGeometry(w, h, d), m, x, y, z, p);
  const sph = (r: number, m: THREE.Material, x: number, y: number, z: number, p: THREE.Object3D = root, ws = 8, hs = 6) =>
    add(new THREE.SphereGeometry(r, ws, hs), m, x, y, z, p);
  const rivet = (x: number, y: number, z: number, p: THREE.Object3D = root) => sph(0.009, gold, x, y, z, p, 5, 3);
  function limb(a: THREE.Vector3, b: THREE.Vector3, rA: number, rB: number, m: THREE.Material, seg = 8) {
    const d = new V().subVectors(b, a);
    const len = d.length();
    const me = new THREE.Mesh(new THREE.CylinderGeometry(rB, rA, len, seg), m);
    me.position.copy(a).addScaledVector(d, 0.5);
    me.quaternion.setFromUnitVectors(new V(0, 1, 0), d.normalize());
    root.add(me);
    return me;
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const x = s * 0.12;
    // sabaton: overlapping lames + pointed toe
    box(0.11, 0.075, 0.1, steel, x, 0.037, -0.04);
    box(0.105, 0.065, 0.07, steel, x, 0.032, 0.04);
    box(0.1, 0.055, 0.06, steel, x, 0.027, 0.095);
    box(0.112, 0.012, 0.012, gold, x, 0.07, 0.006);
    box(0.108, 0.012, 0.012, gold, x, 0.06, 0.076);
    const toe = add(new THREE.ConeGeometry(0.05, 0.09, 4), steel, x, 0.025, 0.165);
    toe.rotation.set(Math.PI / 2, Math.PI / 4, 0);
    toe.scale.set(1, 1, 0.55);
    box(0.09, 0.03, 0.03, dark, x, 0.015, -0.1); // heel / spur strap
    const spur = add(new THREE.ConeGeometry(0.012, 0.06, 4), gold, x, 0.05, -0.13);
    spur.rotation.x = -Math.PI / 2;
    // greave
    limb(new V(x, 0.07, 0), new V(x, 0.5, 0.0), 0.055, 0.07, steel);
    box(0.016, 0.38, 0.012, gold, x, 0.29, 0.064).rotation.x = -0.035;
    // knee cop + fan
    sph(0.068, steel, x, 0.53, 0.035);
    const fan = add(new THREE.CylinderGeometry(0.058, 0.058, 0.012, 8), steel, x + s * 0.07, 0.53, 0.01);
    fan.rotation.z = Math.PI / 2;
    rivet(x + s * 0.077, 0.53, 0.01);
    rivet(x, 0.53, 0.103);
    // cuisse
    limb(new V(x, 0.56, 0.0), new V(x * 1.05, 0.94, 0), 0.072, 0.088, steel);
    box(0.13, 0.014, 0.12, gold, x * 1.02, 0.6, 0.0).rotation.y = 0.0;
  }

  // ---------- faulds (skirt plates) ----------
  for (let i = 0; i < 3; i++) {
    const f = add(new THREE.CylinderGeometry(0.175 + i * 0.012, 0.2 + i * 0.012, 0.065, 10, 1, true), steel, 0, 0.97 - i * 0.055, 0);
    f.scale.z = 0.72;
  }

  // ---------- torso ----------
  box(0.44, 0.36, 0.26, steel, 0, 1.24, 0);
  box(0.36, 0.14, 0.22, steel, 0, 1.03, 0);
  box(0.4, 0.4, 0.012, chestMat, 0, 1.2, 0.137);
  box(0.4, 0.4, 0.012, blue, 0, 1.2, -0.137);
  box(0.42, 0.02, 0.016, gold, 0, 1.4, 0.14);
  // skirts of the tabard
  const sf = new THREE.Group();
  sf.position.set(0, 1.0, 0.152);
  sf.rotation.x = -0.12;
  root.add(sf);
  box(0.36, 0.42, 0.012, skirtMat, 0, -0.21, 0, sf);
  const sb = new THREE.Group();
  sb.position.set(0, 1.0, -0.152);
  sb.rotation.x = 0.12;
  root.add(sb);
  box(0.36, 0.42, 0.012, blue, 0, -0.21, 0, sb);
  // belt
  const belt = add(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 10), leather, 0, 1.0, 0);
  belt.scale.z = 0.82;
  box(0.06, 0.06, 0.02, gold, 0, 1.0, 0.168);
  box(0.03, 0.035, 0.022, black, 0, 1.0, 0.17);
  for (const a of [-0.9, -0.5, 0.5, 0.9]) rivet(Math.sin(a) * 0.2, 1.0, Math.cos(a) * 0.164);
  // pouch on right hip
  box(0.07, 0.08, 0.04, leather, -0.17, 0.94, 0.09).rotation.y = -0.6;
  box(0.074, 0.03, 0.044, dark, -0.17, 0.975, 0.09).rotation.y = -0.6;

  // ---------- gorget & helm ----------
  add(new THREE.CylinderGeometry(0.1, 0.13, 0.08, 8), steel, 0, 1.45, 0).rotation.y = Math.PI / 8;
  const gRim = add(new THREE.TorusGeometry(0.125, 0.01, 4, 8), gold, 0, 1.415, 0);
  gRim.rotation.x = Math.PI / 2;
  const helm = add(new THREE.CylinderGeometry(0.13, 0.13, 0.24, 8), steel, 0, 1.6, 0);
  helm.rotation.y = Math.PI / 8;
  add(new THREE.CylinderGeometry(0.045, 0.13, 0.08, 8), steel, 0, 1.76, 0).rotation.y = Math.PI / 8;
  for (const y of [1.67, 1.72, 1.49]) {
    const band = add(new THREE.TorusGeometry(0.133, 0.009, 4, 8), gold, 0, y, 0);
    band.rotation.set(Math.PI / 2, 0, Math.PI / 8);
  }
  // crown spikes
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const sp = add(new THREE.ConeGeometry(0.014, i % 2 ? 0.04 : 0.06, 4), gold, Math.sin(a) * 0.13, i % 2 ? 1.74 : 1.75, Math.cos(a) * 0.13);
    sp.rotation.y = a;
  }
  // visor
  box(0.034, 0.016, 0.01, black, 0.026, 1.64, 0.121);
  box(0.034, 0.016, 0.01, black, -0.026, 1.64, 0.121);
  box(0.016, 0.2, 0.014, gold, 0, 1.6, 0.124);
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 2; c++) {
      box(0.008, 0.008, 0.01, black, 0.024 + c * 0.016, 1.555 + r * 0.02, 0.121);
      box(0.008, 0.008, 0.01, black, -0.024 - c * 0.016, 1.555 + r * 0.02, 0.121);
    }
  // plume
  add(new THREE.CylinderGeometry(0.02, 0.028, 0.05, 6), gold, 0, 1.82, -0.01);
  const plumePts: THREE.Vector3[] = [];
  const N = 10;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    plumePts.push(new V(0, 1.84 + 0.17 * Math.sin(t * Math.PI * 0.85) - 0.12 * t, -0.01 - 0.36 * t));
  }
  for (let i = 0; i < N; i++) {
    const a = plumePts[i], b = plumePts[i + 1];
    const t = i / N;
    const r = 0.055 * (1 - 0.55 * t);
    const p = sph(r, i % 2 ? white : red, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, root, 6, 4);
    p.scale.set(1.15, 0.85, 1.7);
    const dir = new V().subVectors(b, a).normalize();
    p.quaternion.setFromUnitVectors(new V(0, 0, 1), dir);
  }

  // ---------- pauldrons ----------
  for (const s of [1, -1]) {
    const g = new THREE.Group();
    g.position.set(s * 0.27, 1.4, 0);
    g.rotation.z = -s * 0.32;
    root.add(g);
    const dome = add(new THREE.SphereGeometry(0.135, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), steel, 0, 0, 0, g);
    dome.scale.set(1, 0.78, 1.05);
    const rim = add(new THREE.TorusGeometry(0.135, 0.011, 4, 8), gold, 0, 0, 0, g);
    rim.rotation.x = Math.PI / 2;
    rim.scale.set(1, 1.05, 1);
    for (let i = 0; i < 3; i++) {
      const l = add(new THREE.CylinderGeometry(0.13 - i * 0.006, 0.14 - i * 0.006, 0.05, 8, 1, true), i === 1 ? dark : steel, s * 0.008 * i, -0.035 - 0.042 * i, 0, g);
      l.scale.z = 1.02;
    }
    const lr = add(new THREE.TorusGeometry(0.128, 0.008, 4, 8), gold, s * 0.016, -0.14, 0, g);
    lr.rotation.x = Math.PI / 2;
    for (const a of [-1.2, -0.6, 0, 0.6, 1.2]) rivet(Math.sin(a) * 0.05 + s * 0.06, 0.07, Math.cos(a) * 0.08, g);
    // raised haute-piece guard
    box(0.012, 0.06, 0.18, gold, -s * 0.06, 0.08, 0, g);
  }

  // ---------- arms ----------
  function arm(s: number, S: THREE.Vector3, E: THREE.Vector3, H: THREE.Vector3) {
    limb(S, E, 0.058, 0.05, steel);
    sph(0.062, steel, E.x, E.y, E.z);
    const fanE = add(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 8), steel, E.x + s * 0.055, E.y, E.z - 0.01);
    fanE.rotation.z = Math.PI / 2;
    rivet(E.x + s * 0.062, E.y, E.z - 0.01);
    const W = new V().lerpVectors(E, H, 0.75);
    limb(E, W, 0.048, 0.044, steel);
    const C = new V().lerpVectors(E, H, 0.58);
    limb(C, W, 0.05, 0.068, steel);
    const ring = limb(new V().lerpVectors(C, W, 0.98), W, 0.07, 0.07, gold);
    ring.scale.y = 1;
  }
  const RS = new V(-0.27, 1.34, 0), RE = new V(-0.34, 1.12, 0.0), RH = new V(-0.37, 0.9, 0.06);
  arm(-1, RS, RE, RH);
  const LS = new V(0.27, 1.34, 0), LE = new V(0.36, 1.12, -0.03), LH = new V(0.4, 0.98, 0.15);
  arm(1, LS, LE, LH);
  // gauntlets
  box(0.07, 0.09, 0.085, dark, RH.x, RH.y, RH.z);
  for (let i = 0; i < 4; i++) box(0.012, 0.016, 0.09, steel, RH.x + 0.035, RH.y + 0.03 - i * 0.02, RH.z);
  box(0.075, 0.08, 0.08, dark, LH.x, LH.y, LH.z);

  // ---------- sword ----------
  const sx = RH.x, sz = RH.z;
  box(0.045, 0.66, 0.012, bladeMat, sx, 0.45, sz);
  box(0.012, 0.6, 0.014, dark, sx, 0.48, sz);
  const tip = add(new THREE.ConeGeometry(0.032, 0.12, 4), bladeMat, sx, 0.06, sz);
  tip.rotation.set(Math.PI, Math.PI / 4, 0);
  tip.scale.set(1, 1, 0.3);
  box(0.24, 0.03, 0.03, gold, sx, 0.795, sz);
  for (const d of [-1, 1]) {
    const q = add(new THREE.ConeGeometry(0.02, 0.04, 4), gold, sx + d * 0.13, 0.81, sz);
    q.rotation.z = -d * 0.6;
  }
  sph(0.022, red, sx, 0.795, sz + 0.016, root, 6, 4);
  add(new THREE.CylinderGeometry(0.016, 0.016, 0.17, 6), leather, sx, 0.9, sz);
  sph(0.032, gold, sx, 1.0, sz, root, 8, 5);

  // ---------- shield ----------
  function heater(k: number) {
    const sh = new THREE.Shape();
    sh.moveTo(-0.25 * k, 0.25 * k);
    sh.lineTo(0.25 * k, 0.25 * k);
    sh.lineTo(0.25 * k, 0.0);
    sh.quadraticCurveTo(0.24 * k, -0.22 * k, 0, -0.35 * k);
    sh.quadraticCurveTo(-0.24 * k, -0.22 * k, -0.25 * k, 0);
    sh.closePath();
    return sh;
  }
  const shield = new THREE.Group();
  shield.position.set(0.5, 0.97, 0.17);
  shield.rotation.set(-0.05, 0.55, -0.04);
  root.add(shield);
  add(new THREE.ExtrudeGeometry(heater(1.08), { depth: 0.03, bevelEnabled: false, curveSegments: 6 }), gold, 0, 0, 0, shield);
  add(new THREE.ExtrudeGeometry(heater(1.04), { depth: 0.02, bevelEnabled: false, curveSegments: 6 }), dark, 0, 0, -0.012, shield);
  add(new THREE.ShapeGeometry(heater(1), 6), shieldMat, 0, 0, 0.032, shield);
  for (const [x, y] of [[-0.22, 0.22], [0.22, 0.22], [0, 0.24], [-0.24, 0.05], [0.24, 0.05], [-0.16, -0.2], [0.16, -0.2], [0, -0.34]])
    rivet(x * 1.03, y * 1.03 - (y < -0.3 ? -0.02 : 0), 0.036, shield);
  box(0.04, 0.16, 0.04, leather, -0.02, 0.02, -0.03, shield); // strap

  // ---------- cape ----------
  box(0.46, 0.03, 0.05, capeMat, 0, 1.42, -0.15);
  for (const s of [1, -1]) {
    sph(0.026, gold, s * 0.2, 1.42, -0.12, root, 8, 4);
    box(0.012, 0.012, 0.012, red, s * 0.2, 1.42, -0.095);
  }
  const strips = 6;
  for (let i = 0; i < strips; i++) {
    const g = new THREE.Group();
    const x = -0.25 + (i + 0.5) * (0.5 / strips);
    const fold = i % 2 ? -0.012 : 0.006;
    g.position.set(x * 1.0, 1.41, -0.16 + fold);
    g.rotation.x = 0.1 + (i % 2) * 0.02;
    g.rotation.y = (i % 2 ? 0.18 : -0.18) * (i === 0 || i === strips - 1 ? 0.5 : 1);
    g.rotation.z = (x / 0.25) * -0.06;
    root.add(g);
    const h = 1.12 - Math.abs(i - (strips - 1) / 2) * 0.015;
    box(0.5 / strips + 0.012, h, 0.012, capeMat, 0, -h / 2, 0, g);
    box(0.5 / strips + 0.014, 0.025, 0.016, gold, 0, -h + 0.03, 0, g);
  }

  return root;
}
