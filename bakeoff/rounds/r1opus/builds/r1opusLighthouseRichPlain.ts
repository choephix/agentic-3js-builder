import * as THREE from "three";

export const meta = {
  name: "Gull Rock Lighthouse Diorama",
  description:
    "A cozy tabletop diorama: a red-and-white striped lighthouse with a glowing lantern room and black iron gallery, a keeper's cottage with a crooked brick chimney and blue door, a wooden jetty with a moored rowboat, seagulls, grass tufts and wildflowers on a rocky islet, ringed by foamy turquoise water on a round walnut display base.",
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
  const rng = mulberry32(20240611);
  const R = (a: number, b: number) => a + (b - a) * rng();

  const root = new THREE.Group();
  const S = new THREE.Group();
  S.scale.setScalar(0.06);
  root.add(S);

  // ---------- helpers ----------
  const mat = (hex: string, o: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
    new THREE.MeshStandardMaterial({ color: hex, roughness: 0.8, metalness: 0, flatShading: true, ...o });

  function put(geo: THREE.BufferGeometry, m: THREE.Material | THREE.Material[], x: number, y: number, z: number, p: THREE.Object3D) {
    const me = new THREE.Mesh(geo, m as any);
    me.position.set(x, y, z);
    p.add(me);
    return me;
  }
  const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number, p: THREE.Object3D) =>
    put(new THREE.BoxGeometry(w, h, d), m, x, y, z, p);
  const cyl = (rt: number, rb: number, h: number, seg: number, m: THREE.Material, x: number, y: number, z: number, p: THREE.Object3D) =>
    put(new THREE.CylinderGeometry(rt, rb, h, seg), m, x, y, z, p);

  function beam(a: THREE.Vector3, b: THREE.Vector3, r: number, m: THREE.Material, p: THREE.Object3D) {
    const d = b.clone().sub(a);
    const len = d.length();
    const me = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 5), m);
    me.position.copy(a).add(b).multiplyScalar(0.5);
    me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    p.add(me);
    return me;
  }

  function jitter(g: THREE.BufferGeometry, ax: number, ay: number, az: number) {
    const p = g.attributes.position as THREE.BufferAttribute;
    const m = new Map<string, number[]>();
    for (let i = 0; i < p.count; i++) {
      const k = `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
      let o = m.get(k);
      if (!o) {
        o = [(rng() - 0.5) * 2 * ax, (rng() - 0.5) * 2 * ay, (rng() - 0.5) * 2 * az];
        m.set(k, o);
      }
      p.setXYZ(i, p.getX(i) + o[0], p.getY(i) + o[1], p.getZ(i) + o[2]);
    }
    g.computeVertexNormals();
    return g;
  }

  function canvasTex(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    const c = cv.getContext("2d")!;
    draw(c);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }

  // ---------- textures ----------
  const waterTex = canvasTex(512, 512, (c) => {
    const g = c.createRadialGradient(256, 256, 60, 256, 256, 256);
    g.addColorStop(0, "#7ff0dc");
    g.addColorStop(0.55, "#43d3cc");
    g.addColorStop(0.8, "#22aec0");
    g.addColorStop(1, "#167f9f");
    c.fillStyle = g;
    c.fillRect(0, 0, 512, 512);
    // shoreline foam ring
    for (let i = 0; i < 260; i++) {
      const a = rng() * Math.PI * 2;
      const r = 150 + R(-8, 22);
      c.fillStyle = `rgba(255,255,255,${R(0.35, 0.8)})`;
      c.beginPath();
      c.arc(256 + Math.cos(a) * r, 256 + Math.sin(a) * r, R(2, 7), 0, Math.PI * 2);
      c.fill();
    }
    // ripples
    c.lineWidth = 2;
    for (let i = 0; i < 90; i++) {
      const a = rng() * Math.PI * 2;
      const r = R(175, 250);
      const x = 256 + Math.cos(a) * r, y = 256 + Math.sin(a) * r;
      c.strokeStyle = `rgba(255,255,255,${R(0.25, 0.55)})`;
      c.beginPath();
      c.arc(x, y, R(6, 14), Math.PI * 1.1, Math.PI * 1.9);
      c.stroke();
    }
  });

  const brickTex = canvasTex(64, 64, (c) => {
    c.fillStyle = "#d8cfc2";
    c.fillRect(0, 0, 64, 64);
    const cols = ["#a8442f", "#b9533a", "#94392a", "#c0623f"];
    for (let r = 0; r < 8; r++) {
      const off = r % 2 ? 8 : 0;
      for (let k = -1; k < 4; k++) {
        c.fillStyle = cols[Math.floor(rng() * cols.length)];
        c.fillRect(k * 16 + off + 1, r * 8 + 1, 14, 6);
      }
    }
  });

  const shingleTex = canvasTex(128, 128, (c) => {
    c.fillStyle = "#3f4f6e";
    c.fillRect(0, 0, 128, 128);
    const cols = ["#4a5c80", "#43547a", "#56688c", "#3c4b6a"];
    for (let r = 0; r < 8; r++) {
      const off = r % 2 ? 8 : 0;
      for (let k = -1; k < 9; k++) {
        c.fillStyle = cols[Math.floor(rng() * cols.length)];
        c.fillRect(k * 16 + off + 1, r * 16 + 1, 14, 14);
      }
      c.fillStyle = "#2a3550";
      c.fillRect(0, r * 16 + 14, 128, 2);
    }
  });

  const clapTex = canvasTex(128, 128, (c) => {
    c.fillStyle = "#f3e6c8";
    c.fillRect(0, 0, 128, 128);
    for (let r = 0; r < 10; r++) {
      c.fillStyle = "#dcc9a2";
      c.fillRect(0, r * 12.8 + 10, 128, 2.5);
    }
  });

  const plaqueTex = canvasTex(256, 64, (c) => {
    c.fillStyle = "#c9a24a";
    c.fillRect(0, 0, 256, 64);
    c.strokeStyle = "#8a6a22";
    c.lineWidth = 4;
    c.strokeRect(5, 5, 246, 54);
    c.fillStyle = "#3b2a10";
    c.font = "bold 26px Georgia, serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("GULL ROCK LIGHT", 128, 34);
  });

  // ---------- materials ----------
  const M = {
    walnut: mat("#5a3a24", { roughness: 0.55 }),
    walnutDark: mat("#3a2416", { roughness: 0.5 }),
    brass: mat("#d4a94a", { metalness: 0.7, roughness: 0.35 }),
    plaque: mat("#ffffff", { map: plaqueTex, metalness: 0.5, roughness: 0.4 }),
    waterTop: mat("#ffffff", { map: waterTex, roughness: 0.15, metalness: 0.1, flatShading: false }),
    waterSide: mat("#1b98ad", { roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.92 }),
    foam: mat("#f7fdff", { roughness: 0.9 }),
    rockA: mat("#8a8f96"),
    rockB: mat("#6c727b"),
    rockC: mat("#a7a69c"),
    earth: mat("#7a6a55"),
    grass: mat("#6fbf4a"),
    grassDark: mat("#4c9a3a"),
    grassLight: mat("#9bd65a"),
    red: mat("#d7372f", { roughness: 0.6 }),
    white: mat("#f6f2ea", { roughness: 0.6 }),
    iron: mat("#1d1f24", { roughness: 0.45, metalness: 0.6 }),
    glow: mat("#ffe08a", { emissive: "#ffb733", emissiveIntensity: 1.8, roughness: 0.3 }),
    beamM: new THREE.MeshStandardMaterial({
      color: "#fff3b0", emissive: "#ffd866", emissiveIntensity: 1.2, transparent: true, opacity: 0.16,
      depthWrite: false, side: THREE.DoubleSide,
    }),
    winGlow: mat("#ffd98a", { emissive: "#ffae40", emissiveIntensity: 1.0 }),
    stone: mat("#b8b2a6"),
    wall: mat("#ffffff", { map: clapTex }),
    roof: mat("#ffffff", { map: shingleTex }),
    roofTrim: mat("#2f3a52"),
    brick: mat("#ffffff", { map: brickTex }),
    terracotta: mat("#c86b3c"),
    blueDoor: mat("#2f6fd6", { roughness: 0.5 }),
    wood: mat("#9b6b3f"),
    woodLight: mat("#b88553"),
    woodDark: mat("#6b4527"),
    boat: mat("#f2b632", { roughness: 0.55, side: THREE.DoubleSide }),
    rope: mat("#d9c08a"),
    smoke: mat("#e8e8ea", { transparent: true, opacity: 0.85 }),
    gullGrey: mat("#a9b3bd"),
    black: mat("#141414"),
    beak: mat("#f5a623"),
    stem: mat("#3f8a32"),
    fPink: mat("#ff7eb6"),
    fYellow: mat("#ffd23f"),
    fWhite: mat("#fffaf0"),
    fPurple: mat("#a77bff"),
    shirtRed: mat("#e85a4f"),
    shirtYel: mat("#ffe066"),
    shirtBlue: mat("#5fa8ff"),
  };
  const flowerMats = [M.fPink, M.fYellow, M.fWhite, M.fPurple];
  const rockMats = [M.rockA, M.rockB, M.rockC];

  // ---------- display base ----------
  const baseG = new THREE.CylinderGeometry(6.2, 6.3, 0.72, 24);
  const base = put(baseG, M.walnut, 0, 0.36, 0, S);
  base.rotation.y = Math.PI / 24;
  const trim = cyl(6.24, 6.24, 0.1, 24, M.walnutDark, 0, 0.76, 0, S);
  trim.rotation.y = Math.PI / 24;
  const foot = cyl(6.3, 6.2, 0.06, 24, M.walnutDark, 0, 0.03, 0, S);
  foot.rotation.y = Math.PI / 24;
  box(1.5, 0.38, 0.06, M.plaque, 0, 0.38, 6.17, S);

  // ---------- water ----------
  const W = 1.15;
  put(new THREE.CylinderGeometry(6.0, 6.0, 0.35, 32, 1), [M.waterSide, M.waterTop, M.waterSide], 0, 0.975, 0, S);

  // ---------- island ----------
  const G = 2.15;
  const islandGeo = jitter(new THREE.CylinderGeometry(3.0, 3.6, 1.25, 11, 2), 0.3, 0.1, 0.3);
  put(islandGeo, M.earth, 0, 1.405, 0, S);
  const capGeo = jitter(new THREE.CylinderGeometry(3.05, 3.12, 0.22, 12, 1), 0.08, 0.04, 0.08);
  put(capGeo, M.grass, 0, 2.04, 0, S);

  const jettyAng = Math.atan2(-1.2, 3.0);
  // shore rocks
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2 + R(-0.08, 0.08);
    let da = Math.atan2(Math.sin(a - jettyAng), Math.cos(a - jettyAng));
    if (Math.abs(da) < 0.22) continue;
    const r = R(3.0, 3.7);
    const s = R(0.35, 0.8);
    const g = jitter(new THREE.DodecahedronGeometry(1, 0), 0.22, 0.22, 0.22);
    const m = put(g, rockMats[i % 3], Math.sin(a) * r, r < 3.3 ? R(1.5, 1.95) : R(1.1, 1.35), Math.cos(a) * r, S);
    m.scale.set(s, s * R(0.6, 0.85), s * R(0.8, 1.0));
    m.rotation.set(R(-0.3, 0.3), R(0, 6), R(-0.3, 0.3));
  }
  // rim pebbles breaking the edge
  for (let i = 0; i < 16; i++) {
    const a = rng() * Math.PI * 2;
    let da = Math.atan2(Math.sin(a - jettyAng), Math.cos(a - jettyAng));
    if (Math.abs(da) < 0.3) continue;
    const r = R(2.75, 3.0);
    const s = R(0.18, 0.32);
    const m = put(jitter(new THREE.IcosahedronGeometry(1, 0), 0.2, 0.2, 0.2), rockMats[i % 3], Math.sin(a) * r, G - 0.03, Math.cos(a) * r, S);
    m.scale.set(s, s * 0.7, s);
  }
  // rocks out in the water with foam
  const foamGeo = new THREE.IcosahedronGeometry(1, 0);
  const seaRocks: [number, number, number][] = [
    [4.6, 0, 0.55], [-4.2, -2.6, 0.5], [3.4, -3.8, 0.4], [-5.0, 1.0, 0.35], [4.9, 2.2, 0.3],
  ];
  for (const [x, z, s] of seaRocks) {
    const m = put(jitter(new THREE.DodecahedronGeometry(1, 0), 0.25, 0.2, 0.25), rockMats[Math.floor(rng() * 3)], x, W + 0.05, z, S);
    m.scale.set(s, s * 0.8, s * 0.9);
    m.rotation.y = rng() * 6;
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 + R(0, 1);
      const f = put(foamGeo, M.foam, x + Math.sin(a) * s * 1.05, W, z + Math.cos(a) * s * 1.05, S);
      f.scale.set(R(0.18, 0.3), 0.05, R(0.18, 0.3));
    }
  }
  // shore foam blobs
  for (let i = 0; i < 46; i++) {
    const a = (i / 46) * Math.PI * 2 + R(-0.05, 0.05);
    const r = R(3.55, 3.95);
    const f = put(foamGeo, M.foam, Math.sin(a) * r, W + 0.005, Math.cos(a) * r, S);
    f.scale.set(R(0.2, 0.45), R(0.04, 0.08), R(0.2, 0.4));
    f.rotation.y = rng() * 6;
  }

  // ---------- lighthouse ----------
  const LH = new THREE.Group();
  LH.position.set(-1.0, G, -0.8);
  S.add(LH);
  cyl(1.05, 1.18, 0.4, 10, M.stone, 0, 0.15, 0, LH);
  for (let i = 0; i < 5; i++) {
    const rb = 0.85 - 0.25 * (i / 5);
    const rt = 0.85 - 0.25 * ((i + 1) / 5);
    cyl(rt, rb, 1.0, 12, i % 2 === 0 ? M.red : M.white, 0, 0.35 + i + 0.5, 0, LH);
  }
  // door
  const dz = 0.86;
  box(0.52, 0.86, 0.12, M.white, 0, 0.8, dz - 0.02, LH);
  box(0.4, 0.74, 0.12, M.woodDark, 0, 0.76, dz + 0.01, LH);
  cyl(0.03, 0.03, 0.05, 6, M.brass, 0.12, 0.76, dz + 0.08, LH).rotation.x = Math.PI / 2;
  box(0.7, 0.1, 0.3, M.stone, 0, 0.32, dz + 0.12, LH);
  // windows spiralling up
  const winSpots: [number, number][] = [[1.9, 0.5], [3.1, -0.7], [4.3, 0.25]];
  for (const [y, a] of winSpots) {
    const r = 0.85 - 0.25 * ((y - 0.35) / 5) + 0.01;
    const w = new THREE.Group();
    w.position.set(Math.sin(a) * r, y, Math.cos(a) * r);
    w.rotation.y = a;
    LH.add(w);
    box(0.28, 0.4, 0.06, M.iron, 0, 0, 0, w);
    box(0.2, 0.3, 0.07, M.winGlow, 0, 0, 0.005, w);
    box(0.34, 0.05, 0.12, M.white, 0, -0.22, 0.03, w);
  }
  // gallery
  cyl(0.98, 0.62, 0.25, 12, M.iron, 0, 5.475, 0, LH);
  cyl(1.02, 1.02, 0.08, 16, M.iron, 0, 5.64, 0, LH);
  const railR = 0.95;
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    cyl(0.022, 0.022, 0.46, 4, M.iron, Math.sin(a) * railR, 5.91, Math.cos(a) * railR, LH);
  }
  for (const y of [5.9, 6.13]) {
    const t = put(new THREE.TorusGeometry(railR, 0.025, 4, 18), M.iron, 0, y, 0, LH);
    t.rotation.x = Math.PI / 2;
  }
  // lantern room
  cyl(0.56, 0.58, 0.3, 8, M.red, 0, 5.83, 0, LH);
  const glass = cyl(0.48, 0.48, 0.75, 8, M.glow, 0, 6.355, 0, LH);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const mm = box(0.05, 0.78, 0.05, M.iron, Math.sin(a) * 0.49, 6.355, Math.cos(a) * 0.49, LH);
    mm.rotation.y = a;
  }
  cyl(0.57, 0.57, 0.08, 8, M.iron, 0, 6.77, 0, LH);
  cyl(0.02, 0.62, 0.55, 8, M.red, 0, 7.085, 0, LH);
  put(new THREE.IcosahedronGeometry(0.12, 0), M.iron, 0, 7.38, 0, LH);
  cyl(0.018, 0.018, 0.4, 4, M.iron, 0, 7.6, 0, LH);
  const vane = box(0.32, 0.06, 0.02, M.iron, 0.05, 7.72, 0, LH);
  vane.rotation.y = 0.4;
  const vtip = put(new THREE.ConeGeometry(0.05, 0.12, 3), M.iron, 0.2, 7.72, -0.09, LH);
  vtip.rotation.set(0, 0.4, -Math.PI / 2);
  const lamp = new THREE.PointLight("#ffcc66", 2.5, 12, 1.5);
  lamp.position.set(0, 6.35, 0);
  LH.add(lamp);
  // light beam
  const beamGeo = new THREE.ConeGeometry(0.85, 5, 10, 1, true);
  beamGeo.translate(0, -2.5, 0);
  const bm = new THREE.Mesh(beamGeo, M.beamM);
  bm.position.set(0, 6.35, 0);
  bm.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), new THREE.Vector3(-1, -0.06, 0.45).normalize());
  LH.add(bm);
  void glass;

  // ---------- keeper's cottage ----------
  const CT = new THREE.Group();
  CT.position.set(1.4, G, 0.6);
  CT.rotation.y = -0.35;
  S.add(CT);
  box(2.2, 0.16, 1.6, M.stone, 0, 0.06, 0, CT);
  box(2.0, 1.2, 1.4, M.wall, 0, 0.75, 0, CT);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.08, 1.2, 0.08, M.white, sx * 1.0, 0.75, sz * 0.7, CT);
  // gables
  const gs = new THREE.Shape();
  gs.moveTo(-0.7, 0);
  gs.lineTo(0.7, 0);
  gs.lineTo(0, 0.75);
  const gGeo = new THREE.ExtrudeGeometry(gs, { depth: 2.0, bevelEnabled: false });
  gGeo.translate(0, 0, -1);
  gGeo.rotateY(Math.PI / 2);
  put(gGeo, M.wall, 0, 1.35, 0, CT);
  // roof slabs
  const ang = Math.atan2(0.75, 0.7);
  const slopeLen = Math.hypot(0.7, 0.75);
  for (const s of [-1, 1]) {
    const slab = box(2.4, 0.1, 1.25, M.roof, 0, 0, 0, CT);
    slab.rotation.x = s * ang;
    const dirZ = (s * 0.7) / slopeLen, dirY = -0.75 / slopeLen;
    slab.position.set(0, 1.35 + 0.375 + Math.cos(ang) * 0.06 + dirY * 0.1, s * 0.35 + s * Math.sin(ang) * 0.06 + dirZ * 0.1);
    // eave fascia
    const fas = box(2.42, 0.08, 0.06, M.roofTrim, 0, 0, 0, CT);
    fas.position.set(0, 1.27, s * 0.86);
  }
  box(2.46, 0.1, 0.16, M.roofTrim, 0, 2.17, 0, CT);
  // crooked chimney
  const CH = new THREE.Group();
  CH.position.set(-0.6, 1.55, -0.3);
  CT.add(CH);
  const c1 = box(0.34, 0.85, 0.34, M.brick, 0, 0.42, 0, CH);
  c1.rotation.z = 0.08;
  const c2 = box(0.32, 0.45, 0.32, M.brick, -0.02, 1.02, 0, CH);
  c2.rotation.z = -0.16;
  const c3 = box(0.42, 0.08, 0.42, M.stone, 0.03, 1.27, 0, CH);
  c3.rotation.z = -0.2;
  const pot = cyl(0.07, 0.09, 0.2, 6, M.terracotta, 0.06, 1.39, 0, CH);
  pot.rotation.z = -0.25;
  const puffs: [number, number, number, number][] = [
    [0.12, 1.65, 0.0, 0.12], [0.25, 1.95, -0.05, 0.16], [0.45, 2.3, -0.1, 0.2], [0.72, 2.7, -0.12, 0.24],
  ];
  for (const [x, y, z, r] of puffs) {
    const p = put(new THREE.IcosahedronGeometry(r, 0), M.smoke, x, y, z, CH);
    p.rotation.set(rng(), rng(), rng());
  }
  // blue door
  const fz = 0.7;
  box(0.52, 0.86, 0.06, M.white, 0.35, 0.58, fz + 0.01, CT);
  box(0.42, 0.78, 0.07, M.blueDoor, 0.35, 0.55, fz + 0.03, CT);
  box(0.34, 0.03, 0.08, M.white, 0.35, 0.45, fz + 0.04, CT);
  put(new THREE.IcosahedronGeometry(0.035, 0), M.brass, 0.5, 0.55, fz + 0.08, CT);
  box(0.6, 0.06, 0.25, M.stone, 0.35, 0.16, fz + 0.15, CT);
  // window
  function cottageWindow(x: number, y: number, z: number, ry: number, shutters: boolean, flowerbox: boolean) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = ry;
    CT.add(g);
    box(0.5, 0.44, 0.04, M.white, 0, 0, 0, g);
    box(0.4, 0.34, 0.05, M.winGlow, 0, 0, 0.005, g);
    box(0.03, 0.34, 0.06, M.white, 0, 0, 0.01, g);
    box(0.4, 0.03, 0.06, M.white, 0, 0, 0.01, g);
    if (shutters) for (const s of [-1, 1]) box(0.16, 0.44, 0.04, M.blueDoor, s * 0.34, 0, 0.01, g);
    if (flowerbox) {
      box(0.5, 0.1, 0.12, M.woodDark, 0, -0.28, 0.06, g);
      for (let i = 0; i < 5; i++) {
        put(new THREE.IcosahedronGeometry(0.05, 0), flowerMats[i % 4], -0.18 + i * 0.09, -0.19, 0.07, g);
      }
      for (let i = 0; i < 3; i++) put(new THREE.IcosahedronGeometry(0.05, 0), M.grassDark, -0.13 + i * 0.13, -0.21, 0.1, g);
    }
  }
  cottageWindow(-0.45, 0.85, fz + 0.01, 0, true, true);
  cottageWindow(1.01, 0.85, 0.0, Math.PI / 2, false, false);
  cottageWindow(-1.01, 0.85, 0.15, -Math.PI / 2, false, false);
  // lifebuoy
  const LB = new THREE.Group();
  LB.position.set(0.8, 0.88, fz + 0.06);
  CT.add(LB);
  for (let k = 0; k < 4; k++) {
    const t = put(new THREE.TorusGeometry(0.14, 0.045, 5, 4, Math.PI / 2), k % 2 ? M.white : M.red, 0, 0, 0, LB);
    t.rotation.z = (k * Math.PI) / 2 + Math.PI / 4;
  }
  // barrel by the cottage
  cyl(0.18, 0.16, 0.42, 8, M.wood, -1.25, 0.22, 0.75, CT);
  for (const y of [0.09, 0.35]) cyl(0.19, 0.19, 0.04, 8, M.iron, -1.25, y, 0.75, CT);

  // ---------- path stones ----------
  const bez = (p0: number[], p1: number[], p2: number[], t: number) => [
    (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
    (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1],
  ];
  const stoneGeo = new THREE.CylinderGeometry(0.17, 0.19, 0.06, 6);
  const pathPts: number[][] = [];
  for (let i = 0; i <= 6; i++) pathPts.push(bez([1.5, 1.75], [0.1, 1.5], [-0.9, 0.45], i / 6));
  for (let i = 1; i <= 3; i++) pathPts.push(bez([0.1, 1.5], [-0.6, 1.9], [-1.2, 2.55], i / 3));
  for (const [x, z] of pathPts) {
    const s = put(stoneGeo, M.stone, x + R(-0.05, 0.05), G + 0.005, z + R(-0.05, 0.05), S);
    s.rotation.y = rng() * 3;
  }

  // ---------- jetty ----------
  const JX = -1.2, deckY = 1.6;
  const J = new THREE.Group();
  S.add(J);
  for (let i = 0; i < 10; i++) {
    const z = 2.95 + i * 0.25;
    const p = box(1.0 + R(-0.06, 0.06), 0.07, 0.22, i % 2 ? M.wood : M.woodLight, JX + R(-0.04, 0.04), deckY - 0.035, z, J);
    p.rotation.y = R(-0.04, 0.04);
  }
  for (const s of [-1, 1]) box(0.1, 0.12, 2.5, M.woodDark, JX + s * 0.36, deckY - 0.13, 4.05, J);
  for (const z of [3.4, 4.3, 5.2]) {
    for (const s of [-1, 1]) {
      const top = z === 5.2 || (z === 4.3 && s === 1) ? 1.9 : 1.7;
      cyl(0.075, 0.08, top - 0.8, 6, M.woodDark, JX + s * 0.52, (top + 0.8) / 2, z, J);
      cyl(0.09, 0.09, 0.04, 6, M.wood, JX + s * 0.52, top, z, J);
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI * 2 + 0.4;
        const f = put(foamGeo, M.foam, JX + s * 0.52 + Math.sin(a) * 0.13, W, z + Math.cos(a) * 0.13, J);
        f.scale.set(0.1, 0.03, 0.1);
      }
    }
  }
  // steps up to the island
  for (let i = 0; i < 3; i++) {
    const s = box(0.9, 0.2, 0.3, M.stone, JX, deckY + 0.1 + i * 0.18, 2.85 - i * 0.22, J);
    s.rotation.y = R(-0.05, 0.05);
  }
  // rope coil and crate on deck
  const coil = put(new THREE.TorusGeometry(0.13, 0.04, 4, 10), M.rope, JX - 0.25, deckY + 0.03, 4.75, J);
  coil.rotation.x = Math.PI / 2;
  const crate = box(0.3, 0.3, 0.3, M.woodLight, JX - 0.22, deckY + 0.15, 3.3, J);
  crate.rotation.y = 0.3;
  const slat = box(0.32, 0.05, 0.32, M.woodDark, JX - 0.22, deckY + 0.24, 3.3, J);
  slat.rotation.y = 0.3;

  // ---------- rowboat ----------
  const BT = new THREE.Group();
  BT.position.set(0.0, W, 4.4);
  BT.rotation.y = 0.12;
  S.add(BT);
  const hull = put(new THREE.SphereGeometry(1, 10, 4, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.boat, 0, 0.25, 0, BT);
  hull.scale.set(0.55, 0.38, 1.25);
  const rimGeo = new THREE.TorusGeometry(1, 0.05, 4, 18);
  rimGeo.rotateX(Math.PI / 2);
  const rim = put(rimGeo, M.white, 0, 0.25, 0, BT);
  rim.scale.set(0.56, 1, 1.26);
  const floor = cyl(1, 1, 0.04, 10, M.woodLight, 0, 0.02, 0, BT);
  floor.scale.set(0.4, 1, 0.9);
  for (const z of [0.4, -0.35]) box(1.0, 0.05, 0.2, M.wood, 0, 0.2, z, BT);
  for (const s of [-1, 1]) {
    const oar = new THREE.Group();
    oar.position.set(s * 0.18, 0.26, 0.0);
    oar.rotation.set(0, s * 0.18, s * 0.08);
    BT.add(oar);
    const sh = cyl(0.025, 0.025, 1.6, 5, M.woodLight, 0, 0, 0, oar);
    sh.rotation.x = Math.PI / 2;
    box(0.12, 0.02, 0.35, M.woodLight, 0, 0, -0.85, oar);
  }
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2;
    const f = put(foamGeo, M.foam, Math.sin(a) * 0.55, 0.005, Math.cos(a) * 1.15, BT);
    f.scale.set(0.12, 0.03, 0.12);
  }
  BT.updateMatrix();
  const bow = new THREE.Vector3(0, 0.3, 1.2).applyMatrix4(BT.matrix);
  beam(bow, new THREE.Vector3(JX + 0.52, 1.75, 4.3), 0.018, M.rope, S);

  // ---------- seagulls ----------
  function gull(flying: boolean) {
    const g = new THREE.Group();
    const body = put(new THREE.SphereGeometry(0.16, 7, 5), M.white, 0, 0, 0, g);
    body.scale.set(0.9, 0.85, 1.9);
    put(new THREE.SphereGeometry(0.12, 6, 4), M.white, 0, 0.13, 0.27, g);
    const bk = put(new THREE.ConeGeometry(0.035, 0.14, 4), M.beak, 0, 0.11, 0.43, g);
    bk.rotation.x = Math.PI / 2;
    for (const s of [-1, 1]) put(new THREE.IcosahedronGeometry(0.02, 0), M.black, s * 0.075, 0.16, 0.33, g);
    const tail = box(0.16, 0.04, 0.2, M.gullGrey, 0, 0.03, -0.36, g);
    tail.rotation.x = -0.2;
    box(0.16, 0.042, 0.06, M.black, 0, 0.05, -0.46, g).rotation.x = -0.2;
    if (flying) {
      for (const s of [-1, 1]) {
        const wg = new THREE.Group();
        wg.position.set(s * 0.1, 0.06, 0);
        wg.rotation.z = s * 0.28;
        g.add(wg);
        box(0.42, 0.03, 0.26, M.gullGrey, s * 0.21, 0, 0, wg);
        const outer = new THREE.Group();
        outer.position.set(s * 0.42, 0, 0);
        outer.rotation.z = -s * 0.4;
        wg.add(outer);
        box(0.3, 0.025, 0.2, M.gullGrey, s * 0.15, 0, -0.02, outer);
        box(0.14, 0.026, 0.16, M.black, s * 0.36, 0, -0.04, outer);
      }
    } else {
      for (const s of [-1, 1]) {
        const w = box(0.05, 0.12, 0.36, M.gullGrey, s * 0.13, 0.04, -0.06, g);
        w.rotation.x = 0.12;
        box(0.051, 0.08, 0.1, M.black, s * 0.13, 0.06, -0.28, g);
        cyl(0.012, 0.012, 0.13, 4, M.beak, s * 0.05, -0.18, 0, g);
        box(0.06, 0.015, 0.08, M.beak, s * 0.05, -0.24, 0.02, g);
      }
    }
    return g;
  }
  const g1 = gull(false);
  g1.position.set(JX - 0.52, 1.92 + 0.25, 5.2);
  g1.rotation.y = 0.7;
  S.add(g1);
  const g2 = gull(false);
  g2.position.set(0.5, 2.22 + 0.25, 0.0);
  g2.rotation.y = -0.4;
  CT.add(g2);
  const g3 = gull(true);
  g3.position.set(2.8, 8.4, 2.2);
  g3.rotation.set(0.05, -0.9, 0.18);
  g3.scale.setScalar(1.15);
  S.add(g3);

  // ---------- clothesline ----------
  const p1 = new THREE.Vector3(2.3, G, -0.9), p2 = new THREE.Vector3(0.7, G, -1.9);
  for (const p of [p1, p2]) {
    cyl(0.04, 0.05, 1.3, 5, M.woodDark, p.x, G + 0.65, p.z, S);
    box(0.3, 0.05, 0.05, M.woodDark, p.x, G + 1.25, p.z, S).rotation.y = Math.atan2(p2.x - p1.x, p2.z - p1.z) + Math.PI / 2;
  }
  const la = new THREE.Vector3(p1.x, G + 1.22, p1.z), lb = new THREE.Vector3(p2.x, G + 1.22, p2.z);
  beam(la, lb, 0.012, M.white, S);
  const lineAng = Math.atan2(p2.x - p1.x, p2.z - p1.z);
  const clothes: [number, THREE.Material, number, number][] = [
    [0.25, M.shirtRed, 0.34, 0.38], [0.5, M.shirtYel, 0.3, 0.28], [0.75, M.shirtBlue, 0.36, 0.42],
  ];
  for (const [t, m, w, h] of clothes) {
    const p = la.clone().lerp(lb, t);
    const c = box(w, h, 0.03, m, p.x, p.y - h / 2 - 0.01, p.z, S);
    c.rotation.y = lineAng + Math.PI / 2;
    const pin = box(0.03, 0.06, 0.04, M.woodLight, p.x, p.y, p.z, S);
    pin.rotation.y = lineAng;
  }

  // ---------- grass and wildflowers ----------
  const bladeGeo = new THREE.ConeGeometry(0.045, 0.38, 3);
  bladeGeo.translate(0, 0.19, 0);
  const stemGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.28, 3);
  stemGeo.translate(0, 0.14, 0);
  const headGeo = new THREE.IcosahedronGeometry(0.065, 0);
  const grassMats = [M.grass, M.grassDark, M.grassLight];

  function tuft(x: number, y: number, z: number, s: number) {
    const n = 4 + Math.floor(rng() * 3);
    for (let i = 0; i < n; i++) {
      const b = put(bladeGeo, grassMats[Math.floor(rng() * 3)], x + R(-0.07, 0.07), y, z + R(-0.07, 0.07), S);
      b.rotation.set(R(-0.45, 0.45), rng() * 3, R(-0.45, 0.45));
      b.scale.setScalar(s * R(0.7, 1.2));
    }
  }
  function flower(x: number, y: number, z: number) {
    const st = put(stemGeo, M.stem, x, y, z, S);
    st.rotation.set(R(-0.15, 0.15), 0, R(-0.15, 0.15));
    const h = put(headGeo, flowerMats[Math.floor(rng() * 4)], x, y + 0.29, z, S);
    h.rotation.set(rng(), rng(), rng());
  }
  const blocked = (x: number, z: number) =>
    Math.hypot(x + 1.0, z + 0.8) < 1.3 ||
    Math.hypot(x - 1.4, z - 0.6) < 1.45 ||
    Math.hypot(x - JX, z - 2.6) < 0.5 ||
    pathPts.some(([px, pz]) => Math.hypot(x - px, z - pz) < 0.25);
  let placed = 0, tries = 0;
  while (placed < 32 && tries < 500) {
    tries++;
    const a = rng() * Math.PI * 2, r = Math.sqrt(rng()) * 2.75;
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    if (blocked(x, z)) continue;
    placed++;
    tuft(x, G - 0.02, z, R(0.8, 1.2));
    const nf = Math.floor(rng() * 3);
    for (let k = 0; k < nf; k++) flower(x + R(-0.22, 0.22), G - 0.02, z + R(-0.22, 0.22));
  }
  // tufts nestled between shore rocks
  for (let i = 0; i < 14; i++) {
    const a = rng() * Math.PI * 2;
    let da = Math.atan2(Math.sin(a - jettyAng), Math.cos(a - jettyAng));
    if (Math.abs(da) < 0.3) continue;
    const r = R(3.05, 3.3);
    tuft(Math.sin(a) * r, R(1.75, 1.95), Math.cos(a) * r, R(0.7, 1.0));
    if (rng() < 0.5) flower(Math.sin(a) * r + 0.1, 1.85, Math.cos(a) * r);
  }
  // flowers hugging the lighthouse foundation
  for (let i = 0; i < 7; i++) {
    const a = R(-1.2, 1.6);
    flower(-1.0 + Math.sin(a) * 1.28, G - 0.02, -0.8 + Math.cos(a) * 1.28);
  }

  return root;
}
