```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Morning-Glory Gramophone",
  description:
    "An antique gramophone on a carved walnut cabinet with pale floral marquetry, brass claw-and-ball feet, a huge eight-gore morning-glory horn in warm patinated brass, a black record with a red label, a nickel tonearm and soundbox, and a wind-up crank on the side.",
};

type P = number[] | THREE.Vector3;
type RGB = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "gramophone" });
  const rootJ: any = b.joint("base", { at: [0, 0, 0] });
  const host: THREE.Object3D =
    rootJ && rootJ.isObject3D
      ? rootJ
      : rootJ && rootJ.bone && rootJ.bone.isObject3D
      ? rootJ.bone
      : rootJ && rootJ.object && rootJ.object.isObject3D
      ? rootJ.object
      : b.root;
  const G = new THREE.Group();
  G.name = "gramophone";
  host.add(G);

  const r0: any = rng(1907);
  const rnd = (): number =>
    typeof r0 === "function" ? r0() : r0.next ? r0.next() : r0.float ? r0.float() : Math.random();

  // ---------- helpers ----------
  const v = (a: P) => (a instanceof THREE.Vector3 ? a.clone() : new THREE.Vector3(a[0], a[1], a[2]));
  const qY = (dir: THREE.Vector3) => {
    const y = dir.clone().normalize();
    const ref = Math.abs(y.y) < 0.95 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    const x = new THREE.Vector3().crossVectors(ref, y).normalize();
    const z = new THREE.Vector3().crossVectors(x, y).normalize();
    const m = new THREE.Matrix4().makeBasis(x, y, z);
    return new THREE.Quaternion().setFromRotationMatrix(m);
  };
  const matCache = new Map<string, THREE.MeshStandardMaterial>();
  const M = (color: string, rough = 0.72, metal = 0.04, map?: THREE.Texture, flat = true) => {
    const key = `${color}|${rough}|${metal}|${map ? map.uuid : ""}|${flat}`;
    let m = matCache.get(key);
    if (!m) {
      m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, flatShading: flat });
      if (map) m.map = map;
      matCache.set(key, m);
    }
    return m;
  };
  const mesh = (geo: THREE.BufferGeometry, m: THREE.Material, p?: P, parent: THREE.Object3D = G) => {
    const o = new THREE.Mesh(geo, m);
    if (p) o.position.copy(v(p));
    o.castShadow = true;
    o.receiveShadow = true;
    parent.add(o);
    return o;
  };
  const rod = (a: P, bb: P, ra: number, rb: number, m: THREE.Material, seg = 8) => {
    const A = v(a), B = v(bb);
    const d = B.clone().sub(A);
    const o = mesh(new THREE.CylinderGeometry(rb, ra, Math.max(d.length(), 1e-4), seg), m);
    o.position.copy(A).add(B).multiplyScalar(0.5);
    o.quaternion.copy(qY(d));
    return o;
  };
  const disc = (c: P, axis: P, r: number, h: number, m: THREE.Material, seg = 16) => {
    const o = mesh(new THREE.CylinderGeometry(r, r, h, seg), m, c);
    o.quaternion.copy(qY(v(axis)));
    return o;
  };
  const torus = (c: P, axis: P, R: number, t: number, m: THREE.Material, seg = 20) => {
    const g = new THREE.TorusGeometry(R, t, 5, seg);
    g.rotateX(Math.PI / 2);
    const o = mesh(g, m, c);
    o.quaternion.copy(qY(v(axis)));
    return o;
  };
  const tube = (pts: P[], r: number, m: THREE.Material, radial = 6, segs = 24) => {
    const curve = new THREE.CatmullRomCurve3(pts.map(v), false, "centripetal");
    return mesh(new THREE.TubeGeometry(curve, segs, r, radial, false), m);
  };
  const ball = (c: P, r: number, m: THREE.Material, detail = 0) => mesh(new THREE.IcosahedronGeometry(r, detail), m, c);

  // ---------- pixel painter for textures ----------
  const hex = (h: string): RGB => {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const canvas = (w: number, h: number) => {
    const d = new Uint8Array(w * h * 4);
    const set = (x: number, y: number, c: RGB, a = 1) => {
      x = Math.floor(x); y = Math.floor(y);
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      const i = (y * w + x) * 4;
      d[i] = d[i] * (1 - a) + c[0] * a;
      d[i + 1] = d[i + 1] * (1 - a) + c[1] * a;
      d[i + 2] = d[i + 2] * (1 - a) + c[2] * a;
      d[i + 3] = 255;
    };
    const ellipse = (cx: number, cy: number, rx: number, ry: number, ang: number, c: RGB, a = 1) => {
      const R = Math.max(rx, ry) + 1;
      const ca = Math.cos(ang), sa = Math.sin(ang);
      for (let y = Math.floor(cy - R); y <= Math.ceil(cy + R); y++)
        for (let x = Math.floor(cx - R); x <= Math.ceil(cx + R); x++) {
          const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
          const u = (dx * ca + dy * sa) / rx, q = (-dx * sa + dy * ca) / ry;
          if (u * u + q * q <= 1) set(x, y, c, a);
        }
    };
    const stroke = (pts: number[][], r: number, c: RGB, a = 1) => {
      for (let k = 0; k < pts.length - 1; k++) {
        const [x0, y0] = pts[k], [x1, y1] = pts[k + 1];
        const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 0.6));
        for (let s = 0; s <= n; s++) ellipse(x0 + ((x1 - x0) * s) / n, y0 + ((y1 - y0) * s) / n, r, r, 0, c, a);
      }
    };
    const tex = () => {
      const t = new THREE.DataTexture(d, w, h, THREE.RGBAFormat);
      t.colorSpace = THREE.SRGBColorSpace;
      t.magFilter = THREE.LinearFilter;
      t.minFilter = THREE.LinearFilter;
      t.needsUpdate = true;
      return t;
    };
    return { d, set, ellipse, stroke, tex };
  };

  // walnut grain background
  const walnutFill = (cv: ReturnType<typeof canvas>, w: number, h: number, dark: RGB, light: RGB) => {
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const s = 0.5 + 0.5 * Math.sin(y * 0.42 + 3 * Math.sin(x * 0.018 + y * 0.03) + 1.5 * Math.sin(x * 0.051));
        const t = Math.pow(s, 3);
        const n = (rnd() - 0.5) * 10;
        cv.set(x, y, [
          dark[0] + (light[0] - dark[0]) * t + n,
          dark[1] + (light[1] - dark[1]) * t + n * 0.7,
          dark[2] + (light[2] - dark[2]) * t + n * 0.5,
        ] as RGB);
      }
  };

  // inlay panel texture
  const IW = 256, IH = 128;
  const inl = canvas(IW, IH);
  walnutFill(inl, IW, IH, hex("#45260f"), hex("#6f4123"));
  const cream = hex("#eedfb4"), sand = hex("#c9a466"), burnt = hex("#94612f");
  inl.stroke([[7, 7], [IW - 7, 7], [IW - 7, IH - 7], [7, IH - 7], [7, 7]], 1.4, cream);
  inl.stroke([[12, 12], [IW - 12, 12], [IW - 12, IH - 12], [12, IH - 12], [12, 12]], 0.6, sand, 0.8);
  for (const [cx, cy, a0] of [[12, 12, 0], [IW - 12, 12, Math.PI / 2], [IW - 12, IH - 12, Math.PI], [12, IH - 12, -Math.PI / 2]]) {
    for (let k = 0; k < 3; k++) {
      const a = a0 + (k + 0.5) * (Math.PI / 6);
      inl.ellipse(cx + Math.cos(a) * 7, cy + Math.sin(a) * 7, 5, 1.8, a, cream);
    }
  }
  // vines
  for (const s of [-1, 1]) {
    const pts: number[][] = [];
    for (let k = 0; k <= 60; k++) {
      const u = k / 60;
      pts.push([128 + s * (22 + u * 88), 64 + 20 * Math.sin(u * Math.PI * 2) * (1 - 0.3 * u)]);
    }
    inl.stroke(pts, 1.3, cream);
    const at = (u: number) => {
      const k = Math.min(59, Math.floor(u * 60));
      const [x0, y0] = pts[k], [x1, y1] = pts[k + 1];
      return { x: x0, y: y0, a: Math.atan2(y1 - y0, x1 - x0) };
    };
    [0.12, 0.32, 0.5, 0.7, 0.86].forEach((u, i) => {
      const p = at(u);
      const side = i % 2 ? 1 : -1;
      const la = p.a + side * 0.8;
      const lx = p.x + Math.cos(la) * 7, ly = p.y + Math.sin(la) * 7;
      inl.ellipse(lx, ly, 7.5, 2.8, la, cream);
      inl.stroke([[p.x, p.y], [lx + Math.cos(la) * 5, ly + Math.sin(la) * 5]], 0.45, burnt, 0.8);
    });
    for (const u of [0.24, 0.6]) {
      const p = at(u);
      const bx = p.x + Math.cos(p.a + Math.PI / 2) * 9, by = p.y + Math.sin(p.a + Math.PI / 2) * 9;
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        inl.ellipse(bx + Math.cos(a) * 3.2, by + Math.sin(a) * 3.2, 3.4, 1.8, a, cream);
      }
      inl.ellipse(bx, by, 1.4, 1.4, 0, burnt);
    }
    const e = pts[60];
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      inl.ellipse(e[0] + Math.cos(a) * 4.5, e[1] + Math.sin(a) * 4.5, 4.8, 2.2, a, cream);
    }
    inl.ellipse(e[0], e[1], 2, 2, 0, sand);
  }
  // central flower
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    inl.ellipse(128 + Math.cos(a) * 12, 64 + Math.sin(a) * 12, 11, 4.6, a, cream);
    inl.ellipse(128 + Math.cos(a) * 14, 64 + Math.sin(a) * 14, 6, 1.2, a, sand, 0.9);
  }
  for (let k = 0; k < 8; k++) {
    const a = ((k + 0.5) / 8) * Math.PI * 2;
    inl.ellipse(128 + Math.cos(a) * 6, 64 + Math.sin(a) * 6, 5, 2.4, a, sand);
  }
  inl.ellipse(128, 64, 3.8, 3.8, 0, burnt);
  inl.ellipse(128, 64, 1.6, 1.6, 0, cream);
  const inlayTex = inl.tex();

  // grain texture
  const gr = canvas(64, 128);
  walnutFill(gr, 64, 128, hex("#4a2a15"), hex("#7a4828"));
  const grainTex = gr.tex();

  // record texture
  const RS = 256;
  const rec = canvas(RS, RS);
  const gold: RGB = [226, 190, 104];
  for (let y = 0; y < RS; y++)
    for (let x = 0; x < RS; x++) {
      const dx = (x + 0.5 - 128) / 128, dy = (y + 0.5 - 128) / 128;
      const rr = Math.hypot(dx, dy), ang = Math.atan2(dy, dx);
      let c: RGB;
      if (rr < 0.33) {
        c = [170, 26, 36];
        if (rr > 0.295 && rr < 0.31) c = gold;
        if (rr > 0.095 && rr < 0.102) c = gold;
        if (rr > 0.2 && rr < 0.25 && ang > 0.35 && ang < 2.8 && Math.floor(ang * 30) % 3 !== 0 && Math.abs(rr - 0.225) < 0.018 - (Math.floor(ang * 30) % 2) * 0.006) c = gold;
        if (rr > 0.14 && rr < 0.165 && ang < -0.7 && ang > -2.45 && Math.floor(ang * 40) % 4 !== 0) c = [235, 210, 150];
        if (rr < 0.03) c = [30, 30, 30];
      } else {
        const gap = [0.52, 0.68, 0.84].some((g) => Math.abs(rr - g) < 0.009);
        const sheen = Math.pow(Math.abs(Math.cos(ang - 0.6)), 14) * 46;
        let val = 15 + (gap ? 2 : Math.sin(rr * 900) > 0.2 ? 8 : 0) + sheen * (gap ? 0.4 : 1);
        if (rr > 0.975) val = 36;
        if (rr < 0.36) val = 24 + sheen * 0.5;
        c = [val, val, val + 3];
      }
      rec.set(x, y, c);
    }
  const recordTex = rec.tex();

  // ---------- materials ----------
  const woodBody = M("#ffffff", 0.62, 0.02, grainTex);
  const woodDark = M("#3e2213", 0.66);
  const woodMid = M("#5e3519", 0.64);
  const woodCarve = M("#4b2915", 0.6);
  const woodTop = M("#ffffff", 0.55, 0.02, grainTex);
  const inlayMat = M("#ffffff", 0.55, 0.02, inlayTex, false);
  const brass = M("#c8933c", 0.38, 0.5);
  const brassDark = M("#9a6a28", 0.45, 0.45);
  const patina = M("#6e9c82", 0.6, 0.15);
  const silver = M("#d4d8dc", 0.28, 0.55);
  const steel = M("#3a3d42", 0.4, 0.5);
  const creamM = M("#e9dcb4", 0.5);
  const felt = M("#24452f", 0.95);
  const vinyl = M("#121214", 0.35);
  const recordTop = M("#ffffff", 0.32, 0.05, recordTex, false);
  const pearl = M("#efe8d6", 0.3, 0.1);
  const ebony = M("#1c1410", 0.45);
  const tinRed = M("#a3222b", 0.45, 0.2);

  // ---------- cabinet ----------
  const TOP = 0.276;
  mesh(new THREE.BoxGeometry(0.46, 0.024, 0.46), woodDark, [0, 0.073, 0]);
  mesh(new THREE.BoxGeometry(0.44, 0.008, 0.44), woodMid, [0, 0.089, 0]);
  mesh(new THREE.BoxGeometry(0.42, 0.165, 0.42), woodBody, [0, 0.1675, 0]);
  mesh(new THREE.BoxGeometry(0.44, 0.012, 0.44), woodDark, [0, 0.256, 0]);
  mesh(new THREE.BoxGeometry(0.47, 0.014, 0.47), woodTop, [0, 0.269, 0]);
  // top stringing inlay
  for (const s of [-1, 1]) {
    mesh(new THREE.BoxGeometry(0.43, 0.0016, 0.004), creamM, [0, TOP + 0.0004, s * 0.215]);
    mesh(new THREE.BoxGeometry(0.004, 0.0016, 0.43), creamM, [s * 0.215, TOP + 0.0004, 0]);
  }

  // corner pilasters
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const x = sx * 0.21, z = sz * 0.21;
      mesh(new THREE.CylinderGeometry(0.022, 0.024, 0.157, 8), woodCarve, [x, 0.1715, z]);
      mesh(new THREE.BoxGeometry(0.056, 0.012, 0.056), woodDark, [x, 0.244, z]);
      mesh(new THREE.BoxGeometry(0.056, 0.012, 0.056), woodDark, [x, 0.099, z]);
      torus([x, 0.125, z], [0, 1, 0], 0.025, 0.003, brassDark, 10);
      torus([x, 0.222, z], [0, 1, 0], 0.024, 0.003, brassDark, 10);
      ball([x + sx * 0.028, 0.244, z + sz * 0.028], 0.007, brass);
    }

  // panels, moldings, dentils, beads, aprons on all four sides
  const apronShape = new THREE.Shape();
  apronShape.moveTo(-0.17, 0);
  apronShape.lineTo(0.17, 0);
  apronShape.lineTo(0.17, -0.01);
  apronShape.quadraticCurveTo(0.12, -0.006, 0.07, -0.016);
  apronShape.quadraticCurveTo(0.03, -0.018, 0.012, -0.03);
  apronShape.quadraticCurveTo(0, -0.04, -0.012, -0.03);
  apronShape.quadraticCurveTo(-0.03, -0.018, -0.07, -0.016);
  apronShape.quadraticCurveTo(-0.12, -0.006, -0.17, -0.01);
  apronShape.lineTo(-0.17, 0);
  const apronGeo = new THREE.ExtrudeGeometry(apronShape, { depth: 0.014, bevelEnabled: false, curveSegments: 4 });

  for (let s = 0; s < 4; s++) {
    const g = new THREE.Group();
    g.rotation.y = (s * Math.PI) / 2;
    G.add(g);
    const pl = mesh(new THREE.PlaneGeometry(0.33, 0.12), inlayMat, [0, 0.1675, 0.2112], g);
    pl.castShadow = false;
    // frame molding
    for (const sy of [-1, 1]) mesh(new THREE.BoxGeometry(0.348, 0.009, 0.007), woodDark, [0, 0.1675 + sy * 0.0645, 0.2125], g);
    for (const sx of [-1, 1]) mesh(new THREE.BoxGeometry(0.009, 0.138, 0.007), woodDark, [sx * 0.1695, 0.1675, 0.2125], g);
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) ball([sx * 0.1695, 0.1675 + sy * 0.0645, 0.216], 0.0055, brass);
    // dentils
    for (let x = -0.176; x <= 0.1761; x += 0.016) mesh(new THREE.BoxGeometry(0.008, 0.009, 0.006), woodMid, [x, 0.2455, 0.213], g);
    // bead row
    for (let x = -0.16; x <= 0.1601; x += 0.02) ball([x, 0.0985, 0.2115], 0.0045, woodMid);
    // apron
    const ap = mesh(apronGeo, woodCarve, [0, 0.061, 0.207], g);
    ap.castShadow = true;
    ball([0, 0.026, 0.216], 0.0065, brass, 0).parent === g;
    const drop = g.children[g.children.length - 1];
    drop.position.set(0, 0.024, 0.215);
  }
  // brass nameplate on front plinth
  mesh(new THREE.BoxGeometry(0.09, 0.015, 0.003), brass, [0, 0.073, 0.2315]);
  mesh(new THREE.BoxGeometry(0.064, 0.0025, 0.002), ebony, [0, 0.0745, 0.2335]);
  mesh(new THREE.BoxGeometry(0.04, 0.0018, 0.002), ebony, [0, 0.0695, 0.2335]);

  // ---------- claw-and-ball feet ----------
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const fx = sx * 0.2, fz = sz * 0.2;
      ball([fx, 0.022, fz], 0.022, woodDark, 1);
      rod([fx, 0.036, fz], [fx, 0.063, fz], 0.013, 0.024, woodCarve, 8);
      torus([fx, 0.05, fz], [0, 1, 0], 0.019, 0.0035, brass, 10);
      const base = Math.atan2(sx, sz);
      for (const off of [-1.25, 0, 1.25, Math.PI]) {
        const a = base + off;
        const d = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
        const c = new THREE.Vector3(fx, 0, fz);
        const p0 = c.clone().addScaledVector(d, 0.011).setY(0.043);
        const p1 = c.clone().addScaledVector(d, 0.027).setY(0.034);
        const p2 = c.clone().addScaledVector(d, 0.025).setY(0.012);
        const p3 = c.clone().addScaledVector(d, 0.019).setY(0.002);
        tube([p0, p1, p2], 0.0055, brass, 5, 8);
        ball(p1, 0.0068, brass);
        rod(p2, p3, 0.0055, 0.0008, patina, 5);
      }
    }

  // ---------- turntable & record ----------
  const PC = new THREE.Vector3(0, 0, 0.02);
  disc([PC.x, 0.279, PC.z], [0, 1, 0], 0.04, 0.006, brassDark, 16);
  disc([PC.x, 0.289, PC.z], [0, 1, 0], 0.16, 0.014, silver, 32);
  disc([PC.x, 0.2962, PC.z], [0, 1, 0], 0.155, 0.0006, felt, 32);
  disc([PC.x, 0.298, PC.z], [0, 1, 0], 0.15, 0.003, vinyl, 32);
  const recFace = new THREE.CircleGeometry(0.1495, 48);
  recFace.rotateX(-Math.PI / 2);
  mesh(recFace, recordTop, [PC.x, 0.2997, PC.z]).castShadow = false;
  rod([PC.x, 0.2995, PC.z], [PC.x, 0.311, PC.z], 0.0035, 0.0032, silver, 8);
  ball([PC.x, 0.3115, PC.z], 0.0036, silver);

  // ---------- tonearm & soundbox ----------
  const pivot = new THREE.Vector3(-0.16, 0.345, -0.16);
  disc([pivot.x, TOP + 0.003, pivot.z], [0, 1, 0], 0.032, 0.006, brass, 14);
  rod([pivot.x, TOP, pivot.z], [pivot.x, 0.33, pivot.z], 0.016, 0.013, brass, 10);
  torus([pivot.x, 0.315, pivot.z], [0, 1, 0], 0.015, 0.003, brassDark, 12);
  ball(pivot, 0.023, brass, 1);
  const armPts = [
    pivot,
    new THREE.Vector3(-0.12, 0.352, -0.07),
    new THREE.Vector3(-0.08, 0.353, 0.02),
    new THREE.Vector3(-0.058, 0.346, 0.075),
    new THREE.Vector3(-0.052, 0.338, 0.093),
  ];
  tube(armPts, 0.0085, silver, 8, 30);
  torus(armPts[2], armPts[3].clone().sub(armPts[1]), 0.0095, 0.0025, silver, 10);
  const SB = new THREE.Vector3(-0.05, 0.336, 0.105);
  const sdir = SB.clone().sub(armPts[4]).setY(0).normalize();
  rod(armPts[4], SB, 0.011, 0.011, silver, 10);
  disc(SB, sdir, 0.03, 0.013, silver, 18);
  disc(SB, sdir, 0.023, 0.0146, pearl, 18);
  torus(SB.clone().addScaledVector(sdir, 0.0072), sdir, 0.0265, 0.0024, silver, 18);
  ball(SB.clone().addScaledVector(sdir, 0.008), 0.004, brass);
  const nTop = SB.clone().addScaledVector(sdir, 0.004).add(new THREE.Vector3(0, -0.03, 0));
  rod(SB.clone().addScaledVector(sdir, 0.004), nTop, 0.003, 0.003, silver, 6);
  ball(nTop, 0.0042, silver);
  rod(nTop, nTop.clone().setY(0.2998), 0.0013, 0.0003, steel, 5);

  // ---------- morning-glory horn ----------
  const hc = new THREE.CatmullRomCurve3(
    [
      pivot.clone(),
      new THREE.Vector3(-0.155, 0.44, -0.215),
      new THREE.Vector3(-0.1, 0.54, -0.245),
      new THREE.Vector3(-0.02, 0.62, -0.19),
      new THREE.Vector3(0, 0.69, -0.06),
      new THREE.Vector3(0, 0.735, 0.08),
    ],
    false,
    "centripetal"
  );
  const NL = 46, GORES = 8, S = GORES * 5;
  const rAt = (t: number) => 0.021 + 0.285 * Math.pow(t, 3.6);
  const bulge = (t: number) => 0.16 * Math.pow(t, 3);
  const Cs: THREE.Vector3[] = [], Ts: THREE.Vector3[] = [], Ns: THREE.Vector3[] = [], Bs: THREE.Vector3[] = [];
  let Nv = new THREE.Vector3(1, 0, 0);
  for (let i = 0; i <= NL; i++) {
    const t = i / NL;
    const C = hc.getPointAt(t), T = hc.getTangentAt(t).normalize();
    Nv = Nv.clone().addScaledVector(T, -Nv.dot(T)).normalize();
    Cs.push(C); Ts.push(T); Ns.push(Nv.clone()); Bs.push(new THREE.Vector3().crossVectors(T, Nv).normalize());
  }
  const hornPt = (i: number, th: number, extra = 0) => {
    const t = i / NL;
    const lobe = 0.5 + 0.5 * Math.cos(GORES * th);
    const rr = rAt(t) * (1 + bulge(t) * lobe) + extra;
    return Cs[i].clone()
      .addScaledVector(Ns[i], rr * Math.cos(th))
      .addScaledVector(Bs[i], rr * Math.sin(th))
      .addScaledVector(Ts[i], -0.045 * Math.pow(t, 10) * lobe);
  };
  const pos: number[] = [], col: number[] = [], idx: number[] = [];
  const cBrass = new THREE.Color("#c08a35"), cLight = new THREE.Color("#ecc46c"), cDeep = new THREE.Color("#7f561e");
  const cPat = new THREE.Color("#5d9a80"), cPatL = new THREE.Color("#93c6a8");
  for (let i = 0; i <= NL; i++)
    for (let j = 0; j <= S; j++) {
      const th = (j / S) * Math.PI * 2, t = i / NL;
      const p = hornPt(i, th);
      pos.push(p.x, p.y, p.z);
      const lobe = 0.5 + 0.5 * Math.cos(GORES * th);
      const c = cBrass.clone().lerp(cLight, Math.pow(lobe, 3) * 0.75).lerp(cDeep, Math.pow(1 - lobe, 6) * 0.55);
      const nz = 0.5 + 0.5 * Math.sin(p.x * 37 + Math.sin(p.y * 23) * 2) * Math.sin(p.z * 41 + p.y * 19);
      let pat = Math.pow(1 - lobe, 4) * 0.45 + (nz - 0.55) * 1.5 + (t < 0.15 ? 0.25 : 0) + (t > 0.97 ? 0.3 : 0);
      pat = Math.min(0.72, Math.max(0, pat));
      c.lerp(nz > 0.8 ? cPatL : cPat, pat * 0.75);
      col.push(c.r, c.g, c.b);
    }
  for (let i = 0; i < NL; i++)
    for (let j = 0; j < S; j++) {
      const a = i * (S + 1) + j, bq = a + S + 1;
      idx.push(a, bq, a + 1, a + 1, bq, bq + 1);
    }
  const hornGeo = new THREE.BufferGeometry();
  hornGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  hornGeo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  hornGeo.setIndex(idx);
  hornGeo.computeVertexNormals();
  const hornMat = new THREE.MeshStandardMaterial({
    vertexColors: true, side: THREE.DoubleSide, flatShading: true, roughness: 0.4, metalness: 0.42,
  });
  mesh(hornGeo, hornMat);

  // seam ribs and rivets
  for (let k = 0; k < GORES; k++) {
    const th = ((k + 0.5) / GORES) * Math.PI * 2;
    const pts: THREE.Vector3[] = [];
    for (let i = 8; i <= NL; i += 2) pts.push(hornPt(i, th, 0.0025));
    tube(pts, 0.0028, brassDark, 4, 40);
    for (const i of [22, 32, 40]) ball(hornPt(i, th, 0.004), 0.0042, brass);
  }
  // scalloped rim
  const rimPts: THREE.Vector3[] = [];
  for (let j = 0; j < 96; j++) rimPts.push(hornPt(NL, (j / 96) * Math.PI * 2, 0.002));
  mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rimPts, true, "centripetal"), 128, 0.006, 5, true), brass);
  // collars
  for (const t of [0.03, 0.3]) {
    torus(hc.getPointAt(t), hc.getTangentAt(t), rAt(t) + 0.004, 0.0045, brass, 16);
  }
  // support crane
  const ts = 0.55;
  const Cm = hc.getPointAt(ts);
  torus(Cm, hc.getTangentAt(ts), rAt(ts) + 0.005, 0.005, brassDark, 16);
  const rodTop = Cm.clone().add(new THREE.Vector3(0, -(rAt(ts) + 0.006), 0));
  const rodBase = new THREE.Vector3(rodTop.x, TOP, Math.max(-0.2, Math.min(0.2, rodTop.z)));
  disc([rodBase.x, TOP + 0.003, rodBase.z], [0, 1, 0], 0.024, 0.006, brass, 12);
  rod(rodBase, rodTop, 0.008, 0.006, brass, 8);
  torus(rodBase.clone().lerp(rodTop, 0.4), rodTop.clone().sub(rodBase), 0.009, 0.0025, brassDark, 10);
  ball(rodTop, 0.01, brass, 1);

  // ---------- wind-up crank (right side, -X) ----------
  const cy = 0.165;
  disc([-0.2125, cy, 0], [1, 0, 0], 0.028, 0.004, brass, 12);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const pe = ball([-0.214, cy + Math.sin(a) * 0.033, Math.cos(a) * 0.033], 0.0075, brassDark);
    pe.scale.set(0.5, 1, 1);
  }
  rod([-0.212, cy, 0], [-0.264, cy, 0], 0.0065, 0.0058, silver, 8);
  torus([-0.226, cy, 0], [1, 0, 0], 0.008, 0.003, brass, 10);
  tube([[-0.262, cy, 0], [-0.268, 0.15, 0.018], [-0.27, 0.125, 0.036], [-0.27, 0.106, 0.046]], 0.006, silver, 6, 16);
  ball([-0.262, cy, 0], 0.008, silver);
  rod([-0.27, 0.106, 0.046], [-0.29, 0.106, 0.046], 0.0035, 0.0035, silver, 6);
  rod([-0.286, 0.106, 0.046], [-0.326, 0.106, 0.046], 0.011, 0.0095, ebony, 8);
  ball([-0.328, 0.106, 0.046], 0.008, brass);

  // ---------- small top details ----------
  // speed dial
  disc([-0.175, TOP + 0.0015, 0.175], [0, 1, 0], 0.022, 0.003, brass, 14);
  disc([-0.175, TOP + 0.0035, 0.175], [0, 1, 0], 0.016, 0.002, ebony, 14);
  rod([-0.175, TOP + 0.005, 0.175], [-0.163, TOP + 0.006, 0.165], 0.0018, 0.0012, silver, 4);
  // brake lever
  rod([-0.15, TOP, 0.155], [-0.13, TOP + 0.02, 0.125], 0.003, 0.0025, silver, 6);
  ball([-0.13, TOP + 0.02, 0.125], 0.006, ebony);
  // needle tin
  disc([0.17, TOP + 0.005, 0.17], [0, 1, 0], 0.018, 0.01, tinRed, 12);
  disc([0.17, TOP + 0.011, 0.17], [0, 1, 0], 0.019, 0.003, brass, 12);
  disc([0.17, TOP + 0.0128, 0.17], [0, 1, 0], 0.011, 0.0008, creamM, 12);
  for (let k = 0; k < 3; k++)
    rod([0.14 + k * 0.006, TOP + 0.0015, 0.19], [0.14 + k * 0.006 + 0.003, TOP + 0.0015, 0.205], 0.0012, 0.0004, steel, 4);

  return b.root;
}
```