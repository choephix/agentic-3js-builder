import * as THREE from "three";

export const meta = {
  name: "Lighthouse on a Tiny Island",
  description:
    "A red-and-white striped lighthouse with a glowing lantern and sweeping beams, standing on a tiny rocky island with a keeper's cottage, a wooden dock, a rowboat, and a perched seagull.",
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
  const root = new THREE.Group();
  const rng = mulberry32(1337);
  const R = (a: number, b: number) => a + (b - a) * rng();

  const mats = new Map<string, THREE.MeshStandardMaterial>();
  const M = (hex: string, o: any = {}) => {
    const k = hex + JSON.stringify(o);
    if (!mats.has(k))
      mats.set(k, new THREE.MeshStandardMaterial({ color: hex, flatShading: true, roughness: 0.8, ...o }));
    return mats.get(k)!;
  };

  const add = (
    geo: THREE.BufferGeometry, mat: THREE.Material,
    x = 0, y = 0, z = 0, parent: THREE.Object3D = root,
    rx = 0, ry = 0, rz = 0
  ) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    parent.add(m);
    return m;
  };

  const jitter = (geo: THREE.BufferGeometry, a: number, ay: number, minY = -Infinity) => {
    const p = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const f = (s: number) => {
        const v = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + s * 11.13) * 43758.5453;
        return (v - Math.floor(v)) * 2 - 1;
      };
      p.setXYZ(i, x + f(1) * a, Math.max(minY, y + f(2) * ay), z + f(3) * a);
    }
    geo.computeVertexNormals();
    return geo;
  };

  // ---------- palette ----------
  const foam = M("#e8f7fb");
  const rock = M("#7d8590");
  const rockDark = M("#5b616c");
  const sand = M("#e6cf96");
  const grass = M("#6dbb4a");
  const grassDark = M("#4c9638");
  const white = M("#f4f1e8");
  const red = M("#d23a32");
  const metal = M("#2d3440", { roughness: 0.5, metalness: 0.4 });
  const glass = M("#ffe9a0", { transparent: true, opacity: 0.55, emissive: "#ffcf5a", emissiveIntensity: 0.6, roughness: 0.1 });
  const lamp = M("#fff3b0", { emissive: "#ffe27a", emissiveIntensity: 2.0 });
  const beamMat = new THREE.MeshStandardMaterial({
    color: "#fff6c0", emissive: "#fff2a8", emissiveIntensity: 1, transparent: true,
    opacity: 0.18, depthWrite: false, side: THREE.DoubleSide,
  });
  const wood = M("#8a5a35");
  const woodDark = M("#5e3b22");
  const cream = M("#f2e3c4");
  const slate = M("#3e5a7a");
  const brick = M("#a8553a");
  const pane = M("#26415e", { roughness: 0.2, metalness: 0.2 });
  const glint = M("#9fd3ef", { roughness: 0.1 });
  const yellow = M("#ffd23f");
  const pink = M("#ff7aa8");
  const violet = M("#a77bff");
  const boatOrange = M("#e8743b");
  const stone = M("#b9b2a3");
  const gullGray = M("#9aa3ad");
  const beak = M("#f2a33a");

  // ---------- water ----------
  let waterMat: THREE.MeshStandardMaterial;
  if (typeof document !== "undefined") {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "#2f9fc7";
    g.fillRect(0, 0, 256, 256);
    const wr = mulberry32(99);
    for (let i = 0; i < 70; i++) {
      g.strokeStyle = wr() < 0.5 ? "rgba(140,220,240,0.55)" : "rgba(30,120,170,0.6)";
      g.lineWidth = 2 + wr() * 2;
      const x = wr() * 256, y = wr() * 256, w = 10 + wr() * 22;
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x + w / 2, y - 5, x + w, y);
      g.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3);
    waterMat = new THREE.MeshStandardMaterial({ color: "#ffffff", map: tex, roughness: 0.3, flatShading: true });
  } else {
    waterMat = M("#2f9fc7", { roughness: 0.3 });
  }
  add(new THREE.CylinderGeometry(18, 18, 0.3, 24), waterMat, 0, 0.15, 0);
  add(jitter(new THREE.CylinderGeometry(11.2, 11.2, 0.06, 16), 0.35, 0), foam, 0, 0.32, 0);

  // waves
  const waveGeo = new THREE.BoxGeometry(1.3, 0.05, 0.14);
  for (let i = 0; i < 22; i++) {
    const a = R(0, Math.PI * 2), r = R(12, 17.2);
    const g = new THREE.Group();
    g.position.set(Math.sin(a) * r, 0.32, Math.cos(a) * r);
    g.rotation.y = a + Math.PI / 2;
    root.add(g);
    add(waveGeo, foam, 0, 0, 0, g);
    add(waveGeo, foam, 0.4, 0, 0.25, g).scale.set(0.6, 1, 1);
  }

  // ---------- island ----------
  add(jitter(new THREE.CylinderGeometry(9.2, 10.4, 2.0, 11, 2), 0.4, 0.2, -1), rock, 0, 1.0, 0);
  add(jitter(new THREE.CylinderGeometry(9.6, 10.1, 0.35, 11), 0.2, 0.05), sand, 0, 1.92, 0);
  add(jitter(new THREE.CylinderGeometry(8.6, 9.3, 0.6, 11), 0.3, 0.1), grass, 0, 2.3, 0);

  const T = new THREE.Vector3(-1.5, 0, -2);
  add(jitter(new THREE.CylinderGeometry(3.4, 4.6, 0.8, 9), 0.2, 0.04), grassDark, T.x, 2.65, T.z);

  // perimeter rocks
  const dockAng = Math.atan2(1.5, 9);
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2 + R(-0.08, 0.08);
    if (Math.abs(a - dockAng) < 0.22) continue;
    const r = R(9.3, 10.6);
    const s = R(0.6, 1.5);
    const m = add(new THREE.DodecahedronGeometry(s, 0), i % 3 === 0 ? rockDark : rock,
      Math.sin(a) * r, R(0.3, 1.4), Math.cos(a) * r, root, R(0, 3), R(0, 3), R(0, 3));
    m.scale.set(R(0.9, 1.3), R(0.6, 1.0), R(0.9, 1.3));
  }
  // sea rocks
  for (let i = 0; i < 6; i++) {
    const a = R(0, Math.PI * 2);
    if (Math.abs(a - dockAng) < 0.4) continue;
    const r = R(12, 15.5);
    const m = add(new THREE.DodecahedronGeometry(R(0.4, 0.9), 0), rockDark,
      Math.sin(a) * r, 0.2, Math.cos(a) * r, root, R(0, 3), R(0, 3), 0);
    m.scale.y = 0.7;
    add(new THREE.CylinderGeometry(0.9, 0.9, 0.04, 7), foam, Math.sin(a) * r, 0.31, Math.cos(a) * r);
  }

  // ---------- lighthouse ----------
  add(new THREE.CylinderGeometry(2.7, 2.9, 0.7, 12), stone, T.x, 3.25, T.z);
  const baseY = 3.6, H = 11.4, n = 6;
  const rAt = (y: number) => 2.2 - 0.8 * ((y - baseY) / H);
  for (let i = 0; i < n; i++) {
    const y0 = baseY + (i * H) / n, y1 = y0 + H / n;
    add(new THREE.CylinderGeometry(rAt(y1), rAt(y0), H / n, 14), i % 2 === 0 ? red : white, T.x, (y0 + y1) / 2, T.z);
  }
  const pivot = (a: number) => {
    const g = new THREE.Group();
    g.position.set(T.x, 0, T.z);
    g.rotation.y = a;
    root.add(g);
    return g;
  };

  // door
  {
    const g = pivot(0.55);
    const r = rAt(4.4);
    add(new THREE.BoxGeometry(1.2, 1.9, 0.2), white, 0, 4.4, r - 0.02, g);
    add(new THREE.BoxGeometry(0.9, 1.5, 0.3), woodDark, 0, 4.3, r, g);
    add(new THREE.CylinderGeometry(0.45, 0.45, 0.3, 8, 1, false, Math.PI / 2, Math.PI), woodDark, 0, 5.05, r, g, Math.PI / 2);
    add(new THREE.SphereGeometry(0.06, 6, 4), yellow, 0.3, 4.3, r + 0.17, g);
    add(new THREE.BoxGeometry(1.4, 0.25, 0.6), stone, 0, 3.47, r + 0.45, g);
    add(new THREE.BoxGeometry(1.6, 0.25, 0.6), stone, 0, 3.12, r + 0.95, g);
  }
  // windows
  const winSpots = [
    { a: 2.2, y: 6.2 }, { a: -1.0, y: 8.4 }, { a: 1.1, y: 10.6 }, { a: 3.6, y: 12.6 }, { a: 0.1, y: 13.6 },
  ];
  for (const w of winSpots) {
    const g = pivot(w.a);
    const r = rAt(w.y);
    add(new THREE.BoxGeometry(0.7, 1.0, 0.16), metal, 0, w.y, r - 0.02, g);
    add(new THREE.BoxGeometry(0.5, 0.8, 0.18), pane, 0, w.y, r, g);
    add(new THREE.BoxGeometry(0.12, 0.3, 0.2), glint, -0.12, w.y + 0.18, r, g);
    add(new THREE.BoxGeometry(0.85, 0.08, 0.3), white, 0, w.y - 0.52, r + 0.05, g);
  }

  // gallery
  add(new THREE.CylinderGeometry(2.45, 1.45, 0.6, 14), metal, T.x, 14.75, T.z);
  add(new THREE.CylinderGeometry(2.55, 2.55, 0.25, 16), metal, T.x, 15.12, T.z);
  const postGeo = new THREE.BoxGeometry(0.07, 0.9, 0.07);
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    add(postGeo, metal, T.x + Math.sin(a) * 2.4, 15.7, T.z + Math.cos(a) * 2.4);
  }
  const railGeo = new THREE.TorusGeometry(2.4, 0.05, 4, 28);
  add(railGeo, metal, T.x, 16.15, T.z, root, Math.PI / 2);
  add(railGeo, metal, T.x, 15.7, T.z, root, Math.PI / 2);

  // lantern room
  add(new THREE.CylinderGeometry(1.25, 1.3, 0.7, 12), red, T.x, 15.6, T.z);
  add(new THREE.CylinderGeometry(1.15, 1.15, 1.8, 8), glass, T.x, 16.85, T.z);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    add(new THREE.BoxGeometry(0.09, 1.8, 0.09), metal, T.x + Math.sin(a) * 1.15, 16.85, T.z + Math.cos(a) * 1.15);
  }
  add(new THREE.CylinderGeometry(1.32, 1.32, 0.16, 8), metal, T.x, 17.82, T.z);
  add(new THREE.CylinderGeometry(0.35, 0.45, 0.4, 8), metal, T.x, 16.15, T.z);
  add(new THREE.IcosahedronGeometry(0.5, 0), lamp, T.x, 16.85, T.z);
  add(new THREE.ConeGeometry(1.6, 1.3, 8), red, T.x, 18.55, T.z);
  add(new THREE.CylinderGeometry(0.18, 0.25, 0.25, 8), metal, T.x, 19.25, T.z);
  add(new THREE.SphereGeometry(0.22, 8, 6), metal, T.x, 19.5, T.z);
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 4), metal, T.x, 20.1, T.z);

  // beams
  const beamGeo = new THREE.ConeGeometry(2.4, 10, 10, 1, true);
  for (const k of [0, Math.PI]) {
    const g = new THREE.Group();
    g.position.set(T.x, 16.85, T.z);
    g.rotation.y = k + 0.6;
    root.add(g);
    add(beamGeo, beamMat, 5, 0, 0, g, 0, 0, Math.PI / 2);
  }

  // ---------- cottage ----------
  const cot = new THREE.Group();
  cot.position.set(4.3, 2.5, 1.8);
  cot.rotation.y = -0.35;
  root.add(cot);
  add(new THREE.BoxGeometry(3.9, 0.4, 3.1), stone, 0, 0.15, 0, cot);
  add(new THREE.BoxGeometry(3.6, 2.1, 2.8), cream, 0, 1.4, 0, cot);
  {
    const s = new THREE.Shape();
    s.moveTo(-1.8, 0); s.lineTo(1.8, 0); s.lineTo(0, 1.29); s.closePath();
    const gg = new THREE.ExtrudeGeometry(s, { depth: 2.8, bevelEnabled: false });
    gg.translate(0, 0, -1.4);
    add(gg, cream, 0, 2.45, 0, cot);
  }
  const th = Math.atan2(1.5, 2.1);
  const slabGeo = new THREE.BoxGeometry(2.62, 0.16, 3.4);
  add(slabGeo, slate, -1.05, 3.28, 0, cot, 0, 0, th);
  add(slabGeo, slate, 1.05, 3.28, 0, cot, 0, 0, -th);
  add(new THREE.BoxGeometry(0.25, 0.2, 3.5), slate, 0, 4.03, 0, cot);
  add(new THREE.BoxGeometry(0.5, 1.4, 0.5), brick, 1.0, 3.6, -0.6, cot);
  add(new THREE.BoxGeometry(0.62, 0.15, 0.62), metal, 1.0, 4.33, -0.6, cot);
  // door
  add(new THREE.BoxGeometry(1.0, 1.6, 0.08), white, 0, 1.15, 1.41, cot);
  add(new THREE.BoxGeometry(0.8, 1.4, 0.12), wood, 0, 1.08, 1.42, cot);
  add(new THREE.SphereGeometry(0.05, 6, 4), yellow, 0.28, 1.05, 1.5, cot);
  add(new THREE.BoxGeometry(1.2, 0.08, 0.5), slate, 0, 2.0, 1.6, cot, 0.25);
  // round gable window
  add(new THREE.CylinderGeometry(0.32, 0.32, 0.08, 8), white, 0, 3.05, 1.41, cot, Math.PI / 2);
  add(new THREE.CylinderGeometry(0.24, 0.24, 0.1, 8), pane, 0, 3.05, 1.42, cot, Math.PI / 2);
  // front windows with flower boxes
  const flowerMats = [yellow, pink, violet];
  const fGeo = new THREE.IcosahedronGeometry(0.08, 0);
  const winBox = (x: number, z: number, ry: number) => {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    cot.add(g);
    add(new THREE.BoxGeometry(0.8, 0.8, 0.06), white, 0, 1.55, 0, g);
    add(new THREE.BoxGeometry(0.62, 0.62, 0.08), pane, 0, 1.55, 0.01, g);
    add(new THREE.BoxGeometry(0.06, 0.62, 0.1), white, 0, 1.55, 0.02, g);
    add(new THREE.BoxGeometry(0.62, 0.06, 0.1), white, 0, 1.55, 0.02, g);
    add(new THREE.BoxGeometry(0.85, 0.2, 0.25), wood, 0, 1.08, 0.12, g);
    for (let i = 0; i < 5; i++) add(fGeo, flowerMats[i % 3], -0.32 + i * 0.16, 1.24, 0.12, g);
  };
  winBox(-1.15, 1.41, 0);
  winBox(1.15, 1.41, 0);
  winBox(1.81, -0.3, Math.PI / 2);
  winBox(-1.81, 0, -Math.PI / 2);
  // lifebuoy
  {
    const g = new THREE.Group();
    g.position.set(1.85, 1.3, 0.85);
    g.rotation.y = Math.PI / 2;
    cot.add(g);
    const tg = new THREE.TorusGeometry(0.28, 0.08, 5, 4, Math.PI / 2);
    for (let k = 0; k < 4; k++) add(tg, k % 2 ? white : red, 0, 0, 0, g, 0, 0, (k * Math.PI) / 2);
  }
  // seagull on ridge
  {
    const g = new THREE.Group();
    g.position.set(0, 4.13, 0.6);
    g.rotation.y = 0.9;
    cot.add(g);
    add(new THREE.BoxGeometry(0.03, 0.12, 0.03), beak, 0.05, 0.06, 0, g);
    add(new THREE.BoxGeometry(0.03, 0.12, 0.03), beak, -0.05, 0.06, 0, g);
    const body = add(new THREE.SphereGeometry(0.2, 7, 5), white, 0, 0.25, 0, g);
    body.scale.set(0.7, 0.65, 1.3);
    add(new THREE.SphereGeometry(0.11, 7, 5), white, 0, 0.42, 0.22, g);
    add(new THREE.ConeGeometry(0.035, 0.14, 4), beak, 0, 0.41, 0.38, g, Math.PI / 2);
    add(new THREE.BoxGeometry(0.02, 0.03, 0.03), metal, 0.07, 0.45, 0.28, g);
    add(new THREE.BoxGeometry(0.02, 0.03, 0.03), metal, -0.07, 0.45, 0.28, g);
    add(new THREE.BoxGeometry(0.05, 0.1, 0.36), gullGray, 0.14, 0.28, -0.04, g, 0.1, 0, 0.2);
    add(new THREE.BoxGeometry(0.05, 0.1, 0.36), gullGray, -0.14, 0.28, -0.04, g, 0.1, 0, -0.2);
    add(new THREE.BoxGeometry(0.16, 0.04, 0.16), metal, 0, 0.27, -0.3, g, 0.3);
  }

  // ---------- dock ----------
  const DX = 1.5;
  for (let i = 0; i < 5; i++)
    add(new THREE.BoxGeometry(1.6, 0.3, 0.5), stone, DX, 2.45 - i * 0.3, 7.9 + i * 0.45);
  const plankGeo = new THREE.BoxGeometry(1.8, 0.1, 0.34);
  for (let i = 0; i < 14; i++) {
    const p = add(plankGeo, i % 3 === 1 ? woodDark : wood, DX + R(-0.04, 0.04), 1.05, 9.8 + i * 0.38);
    p.rotation.y = R(-0.03, 0.03);
  }
  const strGeo = new THREE.BoxGeometry(0.15, 0.15, 5.6);
  add(strGeo, woodDark, DX - 0.7, 0.93, 12.3);
  add(strGeo, woodDark, DX + 0.7, 0.93, 12.3);
  const postG = new THREE.CylinderGeometry(0.12, 0.12, 1.45, 6);
  for (const z of [10.0, 12.4, 14.8]) {
    add(postG, woodDark, DX - 0.95, 0.72, z);
    add(postG, woodDark, DX + 0.95, 0.72, z);
  }
  // rope coil & bollard
  add(new THREE.TorusGeometry(0.18, 0.06, 4, 8), beak, DX - 0.5, 1.13, 14.4, root, Math.PI / 2);
  // barrels
  const barrelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.7, 8);
  const hoopGeo = new THREE.CylinderGeometry(0.315, 0.315, 0.06, 8);
  for (const [bx, bz] of [[DX + 0.45, 10.3], [DX + 0.4, 10.95]]) {
    add(barrelGeo, wood, bx, 1.45, bz);
    add(hoopGeo, metal, bx, 1.25, bz);
    add(hoopGeo, metal, bx, 1.65, bz);
  }

  // rowboat
  {
    const g = new THREE.Group();
    g.position.set(3.4, 0.12, 12.6);
    g.rotation.y = 0.15;
    root.add(g);
    const s = new THREE.Shape();
    s.moveTo(-0.6, 0.5); s.lineTo(0.6, 0.5); s.lineTo(0.35, 0); s.lineTo(-0.35, 0); s.closePath();
    const hg = new THREE.ExtrudeGeometry(s, { depth: 2.6, steps: 4, bevelEnabled: false });
    hg.translate(0, 0, -1.3);
    const p = hg.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const z = p.getZ(i);
      if (z > 0.3) p.setX(i, p.getX(i) * (1 - ((z - 0.3) / 1.0) * 0.9));
      else if (z < -0.9) p.setX(i, p.getX(i) * 0.85);
    }
    hg.computeVertexNormals();
    add(hg, boatOrange, 0, 0, 0, g);
    add(new THREE.BoxGeometry(0.9, 0.04, 1.8), woodDark, 0, 0.47, -0.2, g);
    add(new THREE.BoxGeometry(1.1, 0.06, 0.25), wood, 0, 0.42, -0.5, g);
    add(new THREE.BoxGeometry(0.95, 0.06, 0.25), wood, 0, 0.42, 0.4, g);
    add(new THREE.BoxGeometry(1.25, 0.06, 0.08), white, 0, 0.5, -1.27, g);
    const oarGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.8, 4);
    add(oarGeo, wood, 0.25, 0.52, -0.1, g, Math.PI / 2, 0, 0);
    add(new THREE.BoxGeometry(0.16, 0.03, 0.4), wood, 0.25, 0.52, 0.85, g);
    add(new THREE.TorusGeometry(0.08, 0.025, 4, 6), metal, 0, 0.45, 1.25, g);
  }

  // ---------- path stones ----------
  const stoneGeo = new THREE.CylinderGeometry(0.35, 0.38, 0.15, 6);
  const pathPts: [number, number, number, number][] = [
    [4.7, 3.2, DX, 7.6],
    [T.x + 2.0, T.z + 3.2, 3.6, 3.4],
  ];
  for (const [x0, z0, x1, z1] of pathPts) {
    const steps = 6;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const m = add(stoneGeo, stone, x0 + (x1 - x0) * t + R(-0.15, 0.15), 2.68, z0 + (z1 - z0) * t + R(-0.15, 0.15));
      m.rotation.y = R(0, 2);
      m.scale.set(R(0.8, 1.1), 1, R(0.8, 1.1));
    }
  }

  // ---------- grass tufts & flowers ----------
  const tuftGeo = new THREE.ConeGeometry(0.12, 0.5, 4);
  const free = (x: number, z: number) => {
    if (Math.hypot(x, z) > 8.1) return false;
    if (Math.hypot(x - T.x, z - T.z) < 3.4) return false;
    if (Math.hypot(x - 4.3, z - 1.8) < 2.7) return false;
    if (Math.abs(x - DX) < 1.1 && z > 6.0) return false;
    return true;
  };
  let placed = 0;
  for (let tries = 0; tries < 400 && placed < 45; tries++) {
    const x = R(-8, 8), z = R(-8, 8);
    if (!free(x, z)) continue;
    placed++;
    const mat = placed % 2 ? grassDark : grass;
    for (let k = 0; k < 3; k++) {
      add(tuftGeo, mat, x + R(-0.15, 0.15), 2.75, z + R(-0.15, 0.15), root, R(-0.3, 0.3), 0, R(-0.3, 0.3));
    }
  }
  const flowerGeo = new THREE.IcosahedronGeometry(0.1, 0);
  placed = 0;
  for (let tries = 0; tries < 400 && placed < 30; tries++) {
    const x = R(-8, 8), z = R(-8, 8);
    if (!free(x, z)) continue;
    placed++;
    add(flowerGeo, flowerMats[placed % 3], x, 2.78, z);
  }

  return root;
}
