```ts
import * as THREE from "three";

export const meta = {
  name: "Emperor Dragonfly over a Pond",
  description:
    "A stylized low-poly emperor dragonfly hovering above a small pond: electric-blue abdomen with a black dorsal line, apple-green thorax, huge faceted turquoise eyes and four glassy, gold-sheened wings with a dark net of veins, over still water with ripples, lily pads, reeds and rim stones.",
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const UP = new THREE.Vector3(0, 1, 0);

function rod(a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material, seg = 5, rb?: number) {
  const d = b.clone().sub(a);
  const len = d.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rb ?? r, r, len, seg), mat);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(UP, d.normalize());
  return m;
}

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, ctx: c.getContext("2d") as CanvasRenderingContext2D };
}

function wingTexture(R: () => number) {
  const W = 1024, H = 256;
  const { c, ctx } = makeCanvas(W, H);
  ctx.clearRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, "rgba(235,180,60,0.50)");
  g.addColorStop(0.3, "rgba(240,205,110,0.22)");
  g.addColorStop(0.7, "rgba(225,235,245,0.12)");
  g.addColorStop(1, "rgba(200,220,255,0.16)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const sm = (e0: number, e1: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  };
  const Y = (v: number, u: number) => {
    const s = sm(0, 0.35, u);
    const vv = 0.8 + (v - 0.8) * s;
    return (1 - vv * (1 - 0.08 * u * (1 - v))) * H;
  };
  const veins = [0.97, 0.9, 0.8, 0.68, 0.55, 0.42, 0.29, 0.17, 0.06];
  ctx.lineCap = "round";
  veins.forEach((v, i) => {
    ctx.strokeStyle = "rgba(20,16,12,0.9)";
    ctx.lineWidth = i === 0 ? 7 : i < 3 ? 3.2 : 2.2;
    ctx.beginPath();
    for (let k = 0; k <= 60; k++) {
      const u = k / 60;
      const x = u * W, y = Y(v, u);
      if (k === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  });
  // cross veins net
  ctx.strokeStyle = "rgba(25,20,15,0.75)";
  ctx.lineWidth = 1.4;
  for (let i = 0; i < veins.length; i++) {
    const v1 = veins[i];
    const v2 = i + 1 < veins.length ? veins[i + 1] : -0.05;
    let u = 0.04 + R() * 0.01;
    while (u < 0.99) {
      const x1 = u * W, x2 = (u + (R() - 0.5) * 0.01) * W;
      ctx.beginPath();
      ctx.moveTo(x1, Y(v1, u));
      if (v2 < 0) ctx.lineTo(x2, H);
      else ctx.lineTo(x2, Y(v2, u));
      ctx.stroke();
      // occasional mid-cell split
      if (R() < 0.35 && v2 >= 0) {
        const ym = (Y(v1, u) + Y(v2, u)) / 2;
        ctx.beginPath();
        ctx.moveTo(x1, ym);
        ctx.lineTo(x1 + 0.012 * W, ym + (R() - 0.5) * 8);
        ctx.stroke();
      }
      u += 0.011 + R() * 0.012;
    }
  }
  // nodus
  ctx.fillStyle = "rgba(20,15,10,0.95)";
  ctx.fillRect(0.48 * W, Y(0.97, 0.48) - 4, 10, 30);
  // pterostigma
  ctx.fillStyle = "rgba(70,45,18,0.97)";
  ctx.fillRect(0.86 * W, Y(0.97, 0.86) - 2, 0.05 * W, 26);
  // sheen streaks
  for (let k = 0; k < 6; k++) {
    ctx.fillStyle = `rgba(255,230,150,${0.05 + R() * 0.06})`;
    ctx.fillRect(R() * W * 0.7, R() * H, W * 0.25, 6 + R() * 10);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function eyeTexture() {
  const { c, ctx } = makeCanvas(256, 128);
  const g = ctx.createLinearGradient(0, 0, 0, 128);
  g.addColorStop(0, "#9bfff0");
  g.addColorStop(0.4, "#2ad3c8");
  g.addColorStop(0.75, "#11829a");
  g.addColorStop(1, "#0a3f55");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 128);
  for (let y = 2; y < 128; y += 5) {
    for (let x = (y % 10 === 2 ? 0 : 2.5); x < 256; x += 5) {
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      ctx.beginPath();
      ctx.arc(x, y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function waterTexture(R: () => number) {
  const { c, ctx } = makeCanvas(512, 512);
  const g = ctx.createRadialGradient(256, 256, 10, 256, 256, 256);
  g.addColorStop(0, "#3fa39a");
  g.addColorStop(0.6, "#21686c");
  g.addColorStop(1, "#123e47");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  [30, 60, 95, 135, 180, 228].forEach((r, i) => {
    ctx.strokeStyle = `rgba(200,255,245,${0.42 - i * 0.06})`;
    ctx.lineWidth = 4 - i * 0.4;
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.stroke();
  });
  for (let k = 0; k < 60; k++) {
    const a = R() * Math.PI * 2, r = 40 + R() * 200;
    ctx.strokeStyle = `rgba(255,255,255,${0.1 + R() * 0.25})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(256, 256, r, a, a + 0.08 + R() * 0.15);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function wingGeometry(pts: number[][], len: number, chord: number) {
  const curve = new THREE.SplineCurve(pts.map((p) => new THREE.Vector2(p[0], p[1])));
  const shape = new THREE.Shape(curve.getPoints(48));
  const geo = new THREE.ShapeGeometry(shape);
  geo.scale(len, chord, 1);
  geo.translate(0, -0.78 * chord, 0);
  geo.rotateX(Math.PI / 2);
  return geo;
}

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const R = rng(20240611);
  const M = (c: number, o: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, ...o });

  // ---------- materials ----------
  const blue = M(0x1ea6ff, { emissive: 0x0b3f9a, emissiveIntensity: 0.35, roughness: 0.3, metalness: 0.15, flatShading: true });
  const teal = M(0x3fd0c0, { emissive: 0x0d5560, emissiveIntensity: 0.25, roughness: 0.3, flatShading: true });
  const black = M(0x101216, { roughness: 0.35, metalness: 0.2 });
  const green = M(0x8fd636, { roughness: 0.4, flatShading: true });
  const greenDark = M(0x5a9a25, { roughness: 0.5, flatShading: true });
  const faceYellow = M(0xd4e650, { roughness: 0.45, flatShading: true });
  const suture = M(0x3e3a1a, { roughness: 0.6 });
  const ocellus = M(0xfff2a0, { emissive: 0x665500, emissiveIntensity: 0.4 });
  const eyeMat = new THREE.MeshStandardMaterial({ map: eyeTexture(), roughness: 0.12, metalness: 0.1, flatShading: true, emissive: 0x0a4a4a, emissiveIntensity: 0.3 });
  const wingMat = new THREE.MeshStandardMaterial({
    map: wingTexture(R), transparent: true, side: THREE.DoubleSide, depthWrite: false,
    roughness: 0.15, metalness: 0.35, emissive: 0x3a2a08, emissiveIntensity: 0.15,
  });

  const earth = M(0x5b4330, { flatShading: true });
  const waterMat = new THREE.MeshStandardMaterial({ map: waterTexture(R), roughness: 0.08, metalness: 0.3 });
  const stoneMats = [M(0x8a8a86, { flatShading: true }), M(0x6f7470, { flatShading: true }), M(0xa39b8c, { flatShading: true })];
  const padMat = M(0x3f8f3a, { flatShading: true, roughness: 0.4 });
  const padMat2 = M(0x5fae45, { flatShading: true, roughness: 0.4 });
  const reedMat = M(0x6c9c3a, { flatShading: true });
  const reedMat2 = M(0x8bb04a, { flatShading: true });
  const cattail = M(0x5a3518, { flatShading: true, roughness: 0.9 });
  const petal = M(0xf6a8c8, { flatShading: true });
  const petalTip = M(0xffe3ef, { flatShading: true });
  const pollen = M(0xffd23a, { emissive: 0x553300, emissiveIntensity: 0.3 });

  // ---------- pond ----------
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.265, 0.285, 0.04, 14), earth);
  base.position.y = 0.02;
  root.add(base);
  const water = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.012, 20), waterMat);
  water.position.y = 0.037;
  root.add(water);
  const WT = 0.0435;

  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2 + R() * 0.15;
    const r = 0.235 + R() * 0.03;
    const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.018 + R() * 0.017, 0), stoneMats[i % 3]);
    s.position.set(Math.cos(a) * r, 0.04 + R() * 0.005, Math.sin(a) * r);
    s.scale.set(1.2, 0.6 + R() * 0.3, 1);
    s.rotation.set(R() * 3, R() * 3, R() * 3);
    root.add(s);
  }

  // lily pads
  const pads = [[0.1, 0.08, 0.05], [-0.12, 0.1, 0.045], [0.06, -0.13, 0.038], [-0.07, -0.05, 0.03], [0.15, -0.04, 0.028]];
  pads.forEach((p, i) => {
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(p[2], p[2], 0.003, 12, 1, false, 0.3, Math.PI * 2 - 0.6), i % 2 ? padMat2 : padMat);
    pad.position.set(p[0], WT + 0.0015, p[1]);
    pad.rotation.y = R() * Math.PI * 2;
    root.add(pad);
  });
  // flower on first pad
  const fl = new THREE.Group();
  fl.position.set(0.1, WT + 0.004, 0.08);
  for (let i = 0; i < 10; i++) {
    const outer = i < 6;
    const a = (i / (outer ? 6 : 4)) * Math.PI * 2 + (outer ? 0 : 0.4);
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.008, outer ? 0.03 : 0.024, 4), outer ? petal : petalTip);
    const tilt = outer ? 1.0 : 0.55;
    c.position.set(Math.cos(a) * 0.009, 0.01, Math.sin(a) * 0.009);
    c.rotation.set(0, -a, 0);
    c.rotateZ(-tilt);
    c.scale.z = 0.5;
    fl.add(c);
  }
  const ctr = new THREE.Mesh(new THREE.IcosahedronGeometry(0.006, 0), pollen);
  ctr.position.y = 0.008;
  fl.add(ctr);
  root.add(fl);

  // reeds & grass
  const reedSpots: number[][] = [];
  for (let i = 0; i < 9; i++) reedSpots.push([2.2 + R() * 0.9, 0.22 + R() * 0.16]); // back-left
  for (let i = 0; i < 5; i++) reedSpots.push([-0.6 + R() * 0.5, 0.1 + R() * 0.1]);  // right side
  reedSpots.forEach((sp, i) => {
    const a = sp[0], h = sp[1];
    const r = 0.235 + R() * 0.02;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.006, h, 4), i % 2 ? reedMat : reedMat2);
    leaf.scale.z = 0.4;
    leaf.position.set(x, 0.04 + h / 2, z);
    leaf.rotation.set((R() - 0.5) * 0.25, R() * 3, (R() - 0.5) * 0.25);
    root.add(leaf);
    if (i % 3 === 0 && h > 0.25) {
      const stemH = h + 0.06;
      const stem = rod(new THREE.Vector3(x + 0.01, 0.04, z), new THREE.Vector3(x + 0.012, 0.04 + stemH, z), 0.0025, reedMat, 4);
      root.add(stem);
      const head = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.05, 6), cattail);
      head.position.set(x + 0.012, 0.04 + stemH - 0.04, z);
      root.add(head);
    }
  });
  for (let i = 0; i < 16; i++) {
    const a = R() * Math.PI * 2, r = 0.245 + R() * 0.03;
    const h = 0.03 + R() * 0.04;
    const g = new THREE.Mesh(new THREE.ConeGeometry(0.004, h, 3), i % 2 ? reedMat2 : reedMat);
    g.position.set(Math.cos(a) * r, 0.04 + h / 2, Math.sin(a) * r);
    g.rotation.set((R() - 0.5) * 0.6, 0, (R() - 0.5) * 0.6);
    root.add(g);
  }

  // ---------- dragonfly (built in cm, scaled) ----------
  const fly = new THREE.Group();
  fly.scale.setScalar(0.01);
  fly.position.set(0, 0.2, 0.01);
  fly.rotation.x = -0.06;
  root.add(fly);

  // thorax
  const thorax = new THREE.Mesh(new THREE.SphereGeometry(1, 9, 7), green);
  thorax.scale.set(0.55, 0.62, 0.85);
  thorax.rotation.x = -0.15;
  fly.add(thorax);
  const crest = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.9), greenDark);
  crest.position.set(0, 0.58, 0.05);
  crest.rotation.x = -0.15;
  fly.add(crest);
  [1, -1].forEach((sx) => {
    [0.25, -0.2].forEach((z) => {
      const st = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.85, 0.06), suture);
      st.position.set(sx * 0.49, 0, z);
      st.rotation.set(0.55, 0, sx * -0.12);
      fly.add(st);
    });
    // wing-root sclerites
    [0.25, -0.35].forEach((z) => {
      const sc = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.32), black);
      sc.position.set(sx * 0.22, 0.5, z);
      fly.add(sc);
    });
  });

  // prothorax + head
  const pro = new THREE.Mesh(new THREE.SphereGeometry(0.28, 7, 5), greenDark);
  pro.position.set(0, 0.08, 0.82);
  fly.add(pro);
  [1, -1].forEach((sx) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.6, 10, 8), eyeMat);
    eye.position.set(sx * 0.31, 0.17, 1.22);
    eye.scale.set(1, 0.95, 0.92);
    fly.add(eye);
    const ant = rod(new THREE.Vector3(sx * 0.08, 0.32, 1.65), new THREE.Vector3(sx * 0.18, 0.48, 1.9), 0.025, black, 4, 0.012);
    fly.add(ant);
  });
  const frons = new THREE.Mesh(new THREE.SphereGeometry(0.3, 7, 5), faceYellow);
  frons.position.set(0, 0.02, 1.68);
  frons.scale.set(1.15, 0.8, 0.65);
  fly.add(frons);
  const tMark = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.05, 0.08), black);
  tMark.position.set(0, 0.2, 1.73);
  fly.add(tMark);
  const tStem = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.08), black);
  tStem.position.set(0, 0.12, 1.79);
  fly.add(tStem);
  const labrum = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.12, 0.14), faceYellow);
  labrum.position.set(0, -0.22, 1.72);
  fly.add(labrum);
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.16), black);
  mouth.position.set(0, -0.33, 1.66);
  fly.add(mouth);
  [[0, 0.42, 1.55], [0.09, 0.38, 1.6], [-0.09, 0.38, 1.6]].forEach((p) => {
    const o = new THREE.Mesh(new THREE.IcosahedronGeometry(0.04, 0), ocellus);
    o.position.set(p[0], p[1], p[2]);
    fly.add(o);
  });

  // abdomen
  const segs = [
    [0.3, 0.36, 0.34], [0.55, 0.38, 0.3], [0.62, 0.25, 0.25], [0.6, 0.26, 0.27], [0.6, 0.27, 0.27],
    [0.6, 0.27, 0.27], [0.58, 0.27, 0.27], [0.48, 0.27, 0.27], [0.36, 0.27, 0.25], [0.26, 0.25, 0.21],
  ];
  let p = new THREE.Vector3(0, -0.05, -0.62);
  let ang = 0.04;
  segs.forEach((s, i) => {
    ang += 0.028;
    const d = new THREE.Vector3(0, -Math.sin(ang), -Math.cos(ang));
    const [len, rf, rb] = s;
    const g = new THREE.Group();
    g.position.copy(p).addScaledVector(d, len / 2);
    g.quaternion.setFromUnitVectors(UP, d);
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(rb, rf, len * 0.97, 7), i < 2 ? teal : blue);
    g.add(cyl);
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(rb * 1.06, rb * 1.06, 0.07, 7), black);
    ring.position.y = len / 2 - 0.035;
    g.add(ring);
    const rm = (rf + rb) / 2;
    if (i >= 1) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.1, len * 0.92, 0.06), black);
      stripe.position.set(0, 0, rm * 0.96);
      g.add(stripe);
    }
    if (i >= 2 && i <= 8) {
      const arrow = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), black);
      arrow.scale.set(0.2, len * 0.3, 0.06);
      arrow.position.set(0, len * 0.18, rm * 0.9);
      g.add(arrow);
      [1, -1].forEach((sx) => {
        const side = new THREE.Mesh(new THREE.BoxGeometry(0.05, len * 0.6, 0.05), black);
        side.position.set(sx * rm * 0.92, len * 0.05, -rm * 0.25);
        g.add(side);
      });
    }
    if (i === 1) {
      [1, -1].forEach((sx) => {
        const aur = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), green);
        aur.position.set(sx * rf * 0.98, len * 0.2, 0.05);
        g.add(aur);
      });
    }
    fly.add(g);
    p = p.clone().addScaledVector(d, len);
  });
  [1, -1].forEach((sx) => {
    fly.add(rod(p.clone().add(new THREE.Vector3(sx * 0.06, 0.02, 0.05)), p.clone().add(new THREE.Vector3(sx * 0.16, 0.06, -0.38)), 0.045, black, 4, 0.02));
  });
  fly.add(rod(p.clone().add(new THREE.Vector3(0, -0.06, 0.05)), p.clone().add(new THREE.Vector3(0, -0.12, -0.2)), 0.035, black, 4, 0.015));

  // legs (tucked)
  [[0.45, 0.35], [0.05, 0.2], [-0.35, 0.1]].forEach(([z, fwd], li) => {
    [1, -1].forEach((sx) => {
      const a = new THREE.Vector3(sx * 0.15, -0.4, z);
      const b = new THREE.Vector3(sx * (0.42 + li * 0.04), -0.72, z + fwd);
      const c = new THREE.Vector3(sx * (0.36 + li * 0.04), -0.95, z - 0.25);
      const e = new THREE.Vector3(sx * 0.28, -0.88, z - 0.52);
      fly.add(rod(a, b, 0.05, black, 4, 0.04));
      fly.add(rod(b, c, 0.04, black, 4, 0.03));
      fly.add(rod(c, e, 0.028, black, 4, 0.018));
      // spines
      const mid = b.clone().lerp(c, 0.5);
      fly.add(rod(mid, mid.clone().add(new THREE.Vector3(0, -0.08, 0.08)), 0.012, black, 3, 0.004));
    });
  });

  // wings
  const foreShape = [[0, 0.86], [0.25, 0.97], [0.6, 1.0], [0.88, 0.97], [0.995, 0.8], [0.98, 0.55], [0.86, 0.3], [0.62, 0.2], [0.35, 0.22], [0.12, 0.38], [0, 0.62]];
  const hindShape = [[0, 0.86], [0.25, 0.97], [0.6, 1.0], [0.88, 0.97], [0.995, 0.8], [0.98, 0.5], [0.85, 0.24], [0.6, 0.08], [0.32, 0.01], [0.13, 0.0], [0.04, 0.22], [0, 0.6]];
  const foreLen = 4.9, foreChord = 1.1, hindLen = 4.7, hindChord = 1.5;
  const foreGeo = wingGeometry(foreShape, foreLen, foreChord);
  const hindGeo = wingGeometry(hindShape, hindLen, hindChord);
  const wingDefs = [
    { geo: foreGeo, len: foreLen, chord: foreChord, z: 0.28, sweep: -0.1, dih: 0.05 },
    { geo: hindGeo, len: hindLen, chord: hindChord, z: -0.36, sweep: 0.14, dih: 0.03 },
  ];
  [1, -1].forEach((sx) => {
    wingDefs.forEach((w) => {
      const side = new THREE.Group();
      side.scale.x = sx;
      const pivot = new THREE.Group();
      pivot.position.set(0.18, 0.52, w.z);
      pivot.rotation.set(0, w.sweep, w.dih);
      const wing = new THREE.Mesh(w.geo, wingMat);
      wing.renderOrder = 2;
      pivot.add(wing);
      const costaZ = (0.97 - 0.78) * w.chord;
      const costa = new THREE.Mesh(new THREE.BoxGeometry(w.len * 0.85, 0.045, 0.045), black);
      costa.position.set(w.len * 0.44, 0.01, costaZ);
      pivot.add(costa);
      const stigma = new THREE.Mesh(new THREE.BoxGeometry(w.len * 0.05, 0.03, 0.09), cattail);
      stigma.position.set(w.len * 0.885, 0.01, costaZ - 0.06);
      pivot.add(stigma);
      side.add(pivot);
      fly.add(side);
    });
  });

  return root;
}
```