```ts
import * as THREE from "three";

export const meta = {
  name: "Mossback Fawn Spirit",
  description:
    "A small forest spirit: a grey river-stone deer body wrapped in soft moss, slender wooden legs on little hooves, a pale wooden mask with glowing green eyes, flowering branch antlers and a ring of fireflies.",
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

function makeTex(draw: (ctx: CanvasRenderingContext2D, s: number) => void): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  draw(ctx, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.NearestFilter;
  return t;
}

export default function build(): THREE.Object3D {
  const rng = mulberry32(20240611);
  const root = new THREE.Group();
  const Y = new THREE.Vector3(0, 1, 0);

  // ---------- textures ----------
  const texRng = mulberry32(77);
  const stoneTex = makeTex((ctx, s) => {
    ctx.fillStyle = "#8d9196";
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 260; i++) {
      const v = 110 + Math.floor(texRng() * 70);
      ctx.fillStyle = `rgb(${v},${v + 3},${v + 8})`;
      const r = 1 + texRng() * 4;
      ctx.fillRect(texRng() * s, texRng() * s, r, r);
    }
    ctx.strokeStyle = "rgba(60,64,70,0.5)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      let x = texRng() * s, y = texRng() * s;
      ctx.moveTo(x, y);
      for (let k = 0; k < 5; k++) {
        x += (texRng() - 0.5) * 30;
        y += texRng() * 20;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  });
  const mossTex = makeTex((ctx, s) => {
    ctx.fillStyle = "#5f8f35";
    ctx.fillRect(0, 0, s, s);
    const cols = ["#77a83f", "#4c7a2b", "#8dbb4d", "#3f6a26", "#a3c95a"];
    for (let i = 0; i < 700; i++) {
      ctx.fillStyle = cols[Math.floor(texRng() * cols.length)];
      const r = 1 + texRng() * 3;
      ctx.beginPath();
      ctx.arc(texRng() * s, texRng() * s, r, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  const woodTex = makeTex((ctx, s) => {
    ctx.fillStyle = "#e9dcc0";
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 14; i++) {
      ctx.strokeStyle = `rgba(170,140,100,${0.15 + texRng() * 0.25})`;
      ctx.lineWidth = 1 + texRng() * 1.5;
      ctx.beginPath();
      const x0 = texRng() * s;
      ctx.moveTo(x0, 0);
      ctx.bezierCurveTo(x0 + 10, s * 0.3, x0 - 10, s * 0.6, x0 + 4, s);
      ctx.stroke();
    }
  });
  const barkTex = makeTex((ctx, s) => {
    ctx.fillStyle = "#7a5636";
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = texRng() > 0.5 ? "#5e3f25" : "#9a7048";
      ctx.fillRect(texRng() * s, 0, 1 + texRng() * 3, s);
    }
  });

  // ---------- materials ----------
  const M = (color: number, o: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
    new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, ...o });
  const stone = M(0xffffff, { map: stoneTex ?? undefined, color: stoneTex ? 0xffffff : 0x8d9196 });
  const stoneDark = M(0x6c7176);
  const moss = M(0xffffff, { map: mossTex ?? undefined, color: mossTex ? 0xffffff : 0x5f8f35, roughness: 1 });
  const mossLight = M(0x9ccc52, { roughness: 1 });
  const mossDark = M(0x3e6b28, { roughness: 1 });
  const lichen = M(0xd6d98a, { roughness: 1 });
  const bark = M(0xffffff, { map: barkTex ?? undefined, color: barkTex ? 0xffffff : 0x7a5636 });
  const barkLight = M(0xa57a4c);
  const hoofMat = M(0x2e231b, { roughness: 0.5 });
  const mask = M(0xffffff, { map: woodTex ?? undefined, color: woodTex ? 0xffffff : 0xe9dcc0, roughness: 0.6 });
  const maskShade = M(0xc9b48e);
  const socket = M(0x1b1f17, { roughness: 1 });
  const eyeGlow = M(0x7dff6a, { emissive: 0x4dff3a, emissiveIntensity: 2.6, roughness: 0.3 });
  const paintGreen = M(0x4f9a3a, { roughness: 0.7 });
  const paintRed = M(0xc4553a, { roughness: 0.7 });
  const nose = M(0x3a2a20, { roughness: 0.4 });
  const petal = M(0xfbf8ee, { roughness: 0.6 });
  const petalPink = M(0xf6dbe3, { roughness: 0.6 });
  const flowerCore = M(0xf2c53d, { roughness: 0.6 });
  const leafMat = M(0x6fb043, { roughness: 0.7 });
  const leafMat2 = M(0x93c95a, { roughness: 0.7 });
  const shroomCap = M(0xd8603a, { roughness: 0.6 });
  const shroomStem = M(0xf3ead6, { roughness: 0.8 });
  const fireGlow = M(0xe9ff7a, { emissive: 0xc8ff3c, emissiveIntensity: 3, roughness: 0.3 });
  const fireHalo = new THREE.MeshStandardMaterial({
    color: 0xd8ff6a, emissive: 0xb8ff30, emissiveIntensity: 1.5,
    transparent: true, opacity: 0.22, depthWrite: false, flatShading: true,
  });
  const fireBody = M(0x2a2a1e);
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, transparent: true, opacity: 0.55, side: THREE.DoubleSide, roughness: 0.3,
  });

  const add = (
    geo: THREE.BufferGeometry, mat: THREE.Material, p: [number, number, number],
    s?: [number, number, number], r?: [number, number, number], parent: THREE.Object3D = root,
  ) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(p[0], p[1], p[2]);
    if (s) m.scale.set(s[0], s[1], s[2]);
    if (r) m.rotation.set(r[0], r[1], r[2]);
    parent.add(m);
    return m;
  };

  // shared geometries
  const ico1 = new THREE.IcosahedronGeometry(1, 1);
  const ico0 = new THREE.IcosahedronGeometry(1, 0);
  const sph = new THREE.SphereGeometry(1, 8, 6);
  const sphSmall = new THREE.SphereGeometry(1, 6, 4);
  const disc = new THREE.CylinderGeometry(1, 1, 1, 7);
  const oct = new THREE.OctahedronGeometry(1, 0);

  // ---------- body ----------
  const BC = new THREE.Vector3(0, 0.55, 0);
  const BS = new THREE.Vector3(0.27, 0.2, 0.4);
  add(ico1, stone, [0, 0.55, 0], [BS.x, BS.y, BS.z], [0, 0.2, 0]);
  // chest & haunch stones
  add(ico1, stone, [0, 0.6, 0.26], [0.2, 0.18, 0.18], [0.3, 0, 0.1]);
  add(ico1, stoneDark, [0, 0.57, -0.28], [0.21, 0.17, 0.17], [0, 0.5, 0.2]);
  for (const sx of [-1, 1]) {
    add(ico1, stone, [sx * 0.15, 0.47, 0.2], [0.085, 0.09, 0.09], [0.4, sx, 0]);
    add(ico1, stoneDark, [sx * 0.15, 0.48, -0.22], [0.1, 0.1, 0.11], [0.2, sx * 0.5, 0.3]);
  }

  // moss cap over the back
  const capGeo = new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, 1.15);
  add(capGeo, moss, [0, 0.555, 0], [0.285, 0.215, 0.415]);
  const capRim = 1.15;
  const rimY = 0.555 + Math.cos(capRim) * 0.215;
  const rimR = Math.sin(capRim);
  // rim tufts & hanging strands
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2 + rng() * 0.1;
    const x = Math.sin(a) * rimR * 0.29;
    const z = Math.cos(a) * rimR * 0.42;
    const sz = 0.03 + rng() * 0.025;
    add(ico0, i % 3 === 0 ? mossLight : moss, [x, rimY + 0.005, z], [sz, sz * 0.7, sz], [rng(), rng(), rng()]);
    if (rng() > 0.35) {
      const len = 0.04 + rng() * 0.06;
      const cone = new THREE.ConeGeometry(0.012 + rng() * 0.008, len, 4);
      add(cone, i % 2 ? mossDark : moss, [x * 1.02, rimY - len / 2, z * 1.02], undefined, [Math.PI, rng(), 0]);
    }
  }
  // soft bumps on top of moss
  const surfY = (x: number, z: number) => {
    const k = 1 - (x / 0.29) ** 2 - (z / 0.42) ** 2;
    return 0.555 + 0.215 * Math.sqrt(Math.max(k, 0));
  };
  for (let i = 0; i < 16; i++) {
    const a = rng() * Math.PI * 2;
    const rr = Math.sqrt(rng()) * 0.75;
    const x = Math.sin(a) * rr * 0.29, z = Math.cos(a) * rr * 0.42;
    const sz = 0.035 + rng() * 0.035;
    add(ico0, [mossLight, moss, mossDark][i % 3], [x, surfY(x, z) - 0.01, z], [sz, sz * 0.55, sz], [rng(), rng(), rng()]);
  }
  // tiny mushrooms on the back
  const capG = new THREE.SphereGeometry(1, 7, 3, 0, Math.PI * 2, 0, Math.PI / 2);
  const stemG = new THREE.CylinderGeometry(0.006, 0.008, 1, 5);
  const shrooms: [number, number, number][] = [[0.1, -0.16, 1], [0.13, -0.11, 0.7], [-0.09, 0.05, 0.85]];
  for (const [x, z, k] of shrooms) {
    const y = surfY(x, z);
    const h = 0.045 * k;
    add(stemG, shroomStem, [x, y + h / 2 - 0.005, z], [k, h, k]);
    add(capG, shroomCap, [x, y + h - 0.006, z], [0.028 * k, 0.022 * k, 0.028 * k]);
    for (let d = 0; d < 3; d++) {
      const a = d * 2.1 + 0.4;
      add(sphSmall, shroomStem, [x + Math.cos(a) * 0.014 * k, y + h + 0.011 * k, z + Math.sin(a) * 0.014 * k], [0.004, 0.003, 0.004]);
    }
  }
  // lichen spots on the stone flanks
  for (let i = 0; i < 12; i++) {
    const a = rng() * Math.PI * 2;
    const ny = -0.55 + rng() * 0.5;
    const nr = Math.sqrt(1 - ny * ny);
    const n = new THREE.Vector3(Math.sin(a) * nr, ny, Math.cos(a) * nr);
    const p = new THREE.Vector3(n.x * BS.x, n.y * BS.y, n.z * BS.z).add(BC);
    const normal = new THREE.Vector3(n.x / BS.x, n.y / BS.y, n.z / BS.z).normalize();
    const r = 0.012 + rng() * 0.02;
    const m = add(disc, lichen, [p.x, p.y, p.z], [r, 0.006, r]);
    m.quaternion.setFromUnitVectors(Y, normal);
  }

  // ---------- legs ----------
  const legSpots: [number, number, number][] = [
    [0.14, 0.2, 1], [-0.14, 0.2, 1], [0.15, -0.22, -1], [-0.15, -0.22, -1],
  ];
  for (const [x, z, f] of legSpots) {
    const kneeY = 0.24;
    // upper
    const up = new THREE.CylinderGeometry(0.034, 0.024, 0.22, 6);
    add(up, bark, [x, 0.35, z - f * 0.01], undefined, [f * -0.08, 0, 0]);
    add(sphSmall, barkLight, [x, kneeY, z], [0.027, 0.03, 0.027]);
    // lower
    const lo = new THREE.CylinderGeometry(0.022, 0.017, 0.2, 6);
    add(lo, bark, [x, 0.14, z + f * 0.005], undefined, [f * 0.05, 0, 0]);
    // tiny moss ring at knee
    add(ico0, mossLight, [x + Math.sign(x) * 0.012, kneeY + 0.02, z + 0.01], [0.018, 0.012, 0.018]);
    // fetlock & hoof
    add(sphSmall, barkLight, [x, 0.055, z], [0.02, 0.02, 0.02]);
    const hoof = new THREE.CylinderGeometry(0.02, 0.03, 0.05, 6);
    add(hoof, hoofMat, [x, 0.025, z + 0.004]);
    add(new THREE.BoxGeometry(0.004, 0.03, 0.02), socket, [x, 0.017, z + 0.022]);
  }

  // ---------- neck ----------
  add(ico1, stone, [0, 0.72, 0.33], [0.11, 0.11, 0.1], [0.5, 0.3, 0]);
  add(ico1, stoneDark, [0, 0.82, 0.38], [0.085, 0.09, 0.08], [0.2, 0.8, 0.1]);
  add(ico0, moss, [0, 0.79, 0.3], [0.08, 0.05, 0.08], [0.3, 0, 0]);
  add(ico0, mossLight, [0.04, 0.88, 0.35], [0.05, 0.03, 0.05], [0.1, 1, 0]);
  add(ico0, mossDark, [-0.05, 0.74, 0.27], [0.06, 0.04, 0.05], [0.4, 2, 0]);

  // ---------- head ----------
  const head = new THREE.Group();
  head.position.set(0, 0.93, 0.44);
  root.add(head);
  add(ico1, stone, [0, 0, -0.02], [0.095, 0.1, 0.09], [0, 0.4, 0], head);
  add(ico0, moss, [0, 0.07, -0.04], [0.08, 0.04, 0.07], [0, 0.5, 0], head);
  // mask face
  add(new THREE.SphereGeometry(1, 9, 7), mask, [0, 0.005, 0.07], [0.1, 0.12, 0.06], undefined, head);
  // snout
  const snoutLen = 0.13;
  const snout = add(new THREE.CylinderGeometry(0.03, 0.055, snoutLen, 6), mask, [0, -0.06, 0.12], undefined, [Math.PI / 2 + 0.45, 0, 0], head);
  const sdir = new THREE.Vector3(0, 1, 0).applyEuler(snout.rotation);
  const tip = snout.position.clone().addScaledVector(sdir, snoutLen / 2);
  add(sphSmall, nose, [tip.x, tip.y, tip.z], [0.026, 0.02, 0.018], undefined, head);
  // brow ridge
  add(new THREE.BoxGeometry(0.15, 0.022, 0.03), maskShade, [0, 0.045, 0.115], undefined, [0.2, 0, 0], head);
  // forehead point
  add(new THREE.ConeGeometry(0.02, 0.06, 4), mask, [0, 0.11, 0.07], undefined, [-0.2, Math.PI / 4, 0], head);
  // eyes
  for (const sx of [-1, 1]) {
    const ex = sx * 0.045, ey = 0.015, ez = 0.122;
    const sk = add(disc, socket, [ex, ey, ez], [0.027, 0.01, 0.022], [Math.PI / 2 - 0.15, 0, sx * -0.35], head);
    sk.rotation.order = "YXZ";
    sk.rotation.set(Math.PI / 2, sx * 0.4, 0);
    const eye = add(new THREE.SphereGeometry(1, 8, 6), eyeGlow, [ex, ey, ez + 0.006], [0.02, 0.016, 0.012], [0, sx * 0.4, 0], head);
    eye.rotation.order = "YXZ";
    // paint dots under eyes
    for (let d = 0; d < 3; d++) {
      add(sphSmall, paintGreen, [ex + sx * (d - 1) * 0.012, ey - 0.042 - Math.abs(d - 1) * -0.004, 0.122 - Math.abs(ex) * 0.4], [0.0055, 0.0055, 0.004], undefined, head);
    }
    // red cheek mark
    add(new THREE.BoxGeometry(0.008, 0.035, 0.006), paintRed, [sx * 0.078, -0.03, 0.098], undefined, [0, sx * 0.7, sx * 0.3], head);
    // ears (leaf-like)
    const ear = add(new THREE.ConeGeometry(0.03, 0.11, 4), mask, [sx * 0.11, 0.05, 0.0], [1, 1, 0.35], [0, 0, sx * -1.25], head);
    ear.rotation.order = "ZYX";
    add(new THREE.ConeGeometry(0.018, 0.075, 4), paintRed, [sx * 0.112, 0.05, 0.012], [1, 1, 0.3], [0, 0, sx * -1.25], head);
  }
  // green vertical stripe on forehead
  add(new THREE.BoxGeometry(0.01, 0.05, 0.006), paintGreen, [0, 0.08, 0.106], undefined, [-0.35, 0, 0], head);

  // ---------- antlers ----------
  const flowerGroupMake = (pos: THREE.Vector3, dir: THREE.Vector3, size: number, pink: boolean) => {
    const g = new THREE.Group();
    g.position.copy(pos);
    g.quaternion.setFromUnitVectors(Y, dir);
    g.scale.setScalar(size);
    add(sphSmall, flowerCore, [0, 0.004, 0], [0.007, 0.006, 0.007], undefined, g);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      const pm = add(sphSmall, pink && k % 2 ? petalPink : petal, [Math.cos(a) * 0.012, 0.002, Math.sin(a) * 0.012], [0.012, 0.003, 0.0075], undefined, g);
      pm.rotation.set(0, -a, 0.35);
    }
    root.add(g);
  };
  const leafMake = (pos: THREE.Vector3, dir: THREE.Vector3, size: number) => {
    const g = new THREE.Group();
    g.position.copy(pos);
    g.quaternion.setFromUnitVectors(Y, dir);
    add(oct, rng() > 0.5 ? leafMat : leafMat2, [0, 0.02 * size, 0], [0.011 * size, 0.024 * size, 0.003 * size], [0, rng() * 3, 0], g);
    root.add(g);
  };

  const branch = (p: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, depth: number, side: number) => {
    const g = new THREE.CylinderGeometry(r * 0.72, r, len, 5);
    g.translate(0, len / 2, 0);
    const m = new THREE.Mesh(g, depth >= 2 ? bark : barkLight);
    m.position.copy(p);
    m.quaternion.setFromUnitVectors(Y, dir);
    root.add(m);
    const end = p.clone().addScaledVector(dir, len);
    add(sphSmall, depth >= 2 ? bark : barkLight, [end.x, end.y, end.z], [r * 0.75, r * 0.75, r * 0.75]);

    // leaf along segment
    if (depth < 3 && rng() > 0.4) {
      const mid = p.clone().addScaledVector(dir, len * (0.4 + rng() * 0.3));
      const ld = dir.clone().add(new THREE.Vector3(side * (0.5 + rng()), 0.2, (rng() - 0.5))).normalize();
      leafMake(mid, ld, 1 + rng() * 0.4);
    }
    if (depth === 0) {
      if (rng() > 0.35) flowerGroupMake(end, dir, 0.9 + rng() * 0.5, rng() > 0.6);
      else leafMake(end, dir, 1.3);
      if (rng() > 0.5) {
        const ld = dir.clone().add(new THREE.Vector3(-side * 0.8, 0, rng() - 0.5)).normalize();
        leafMake(end, ld, 1.1);
      }
      return;
    }
    const d1 = dir.clone().add(new THREE.Vector3(side * 0.12 + (rng() - 0.5) * 0.2, 0.35, (rng() - 0.5) * 0.3)).normalize();
    const d2 = dir.clone().add(new THREE.Vector3(side * (0.55 + rng() * 0.3), -0.05 + rng() * 0.2, (rng() - 0.3) * 0.8)).normalize();
    branch(end, d1, len * 0.8, r * 0.72, depth - 1, side);
    branch(end, d2, len * 0.65, r * 0.65, depth - 1, side);
    if (depth === 2 && rng() > 0.4) flowerGroupMake(end, d1.clone().add(d2).normalize(), 0.8, false);
  };
  for (const sx of [-1, 1]) {
    const base = new THREE.Vector3(sx * 0.05, 1.02, 0.42);
    add(disc, barkLight, [base.x, base.y - 0.005, base.z], [0.024, 0.02, 0.024]);
    branch(base, new THREE.Vector3(sx * 0.45, 1, -0.15).normalize(), 0.13, 0.018, 3, sx);
  }

  // ---------- tail ----------
  add(ico0, moss, [0, 0.62, -0.42], [0.05, 0.05, 0.05], [0.3, 0.2, 0]);
  add(ico0, mossLight, [0, 0.66, -0.45], [0.035, 0.03, 0.035], [0.2, 1, 0]);
  flowerGroupMake(new THREE.Vector3(0.01, 0.68, -0.45), new THREE.Vector3(0, 1, -0.5).normalize(), 1.2, true);

  // ---------- fireflies ----------
  const wingGeo = new THREE.PlaneGeometry(0.014, 0.008);
  const center = new THREE.Vector3(0, 1.02, 0.4);
  const nFF = 7;
  for (let i = 0; i < nFF; i++) {
    const a = (i / nFF) * Math.PI * 2 + rng() * 0.4;
    const rad = 0.22 + rng() * 0.1;
    const ff = new THREE.Group();
    ff.position.set(center.x + Math.cos(a) * rad, center.y + (rng() - 0.3) * 0.22, center.z + Math.sin(a) * rad);
    ff.rotation.y = -a; // facing tangent to the orbit
    root.add(ff);
    add(sphSmall, fireGlow, [0, 0, -0.005], [0.009, 0.009, 0.012], undefined, ff);
    add(sphSmall, fireHalo, [0, 0, -0.005], [0.03, 0.03, 0.03], undefined, ff);
    add(sphSmall, fireBody, [0, 0.002, 0.01], [0.006, 0.006, 0.009], undefined, ff);
    for (const sx of [-1, 1]) {
      add(wingGeo, wingMat, [sx * 0.009, 0.008, 0.004], undefined, [-Math.PI / 2 + 0.3, 0, sx * 0.5], ff);
    }
  }

  // soft glow light from the eyes
  const glow = new THREE.PointLight(0x7dff6a, 0.4, 0.6, 2);
  glow.position.set(0, 0.95, 0.62);
  root.add(glow);

  return root;
}
```