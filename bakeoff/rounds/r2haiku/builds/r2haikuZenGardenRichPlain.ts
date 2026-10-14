import * as THREE from "three";

export const meta = {
  name: "Japanese Garden Diorama",
  description:
    "A stylised garden on a square base: a red arched bridge over a koi pond, a stone lantern, a cloud-pruned pine, a cherry tree shedding petals, raked gravel, mossy rocks and stepping stones.",
};

// Seeded generator so every build is identical.
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

function M(geo: THREE.BufferGeometry, mat: THREE.Material) {
  return new THREE.Mesh(geo, mat);
}

function place<T extends THREE.Object3D>(
  o: T,
  x: number,
  y: number,
  z: number,
  rx = 0,
  ry = 0,
  rz = 0,
  sx = 1,
  sy = 1,
  sz = 1
): T {
  o.position.set(x, y, z);
  o.rotation.set(rx, ry, rz);
  o.scale.set(sx, sy, sz);
  return o;
}

export default function build(): THREE.Object3D {
  const rand = rng(20240607);
  const root = new THREE.Group();

  // ---------- Materials (one per colour) ----------
  const std = (color: string, rough = 0.8, extra: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra });

  const woodBase = std("#5a4030", 0.7);
  const redBridge = std("#b8322a", 0.55);
  const redDark = std("#8c231e", 0.6);
  const water = new THREE.MeshStandardMaterial({
    color: "#3f8fa8",
    roughness: 0.15,
    metalness: 0.1,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  const mud = std("#2a3b3a", 0.9);
  const koiOrange = std("#f2741c", 0.5);
  const koiWhite = std("#f4f1e8", 0.5);
  const stoneLight = std("#c4bfb2", 0.9);
  const stoneDark = std("#6e6a62", 0.95);
  const rockGrey = std("#7a766d", 0.95);
  const moss = std("#6f9e3e", 0.95);
  const pineA = std("#2f5d3a", 0.9);
  const pineB = std("#22472c", 0.9);
  const trunk = std("#5b3a26", 0.9);
  const pinkA = std("#f7b6c8", 0.85);
  const pinkB = std("#f29bb4", 0.85);
  const pinkC = std("#fde0e8", 0.85);
  const petalMat = new THREE.MeshStandardMaterial({
    color: "#ffc2d4",
    roughness: 0.7,
    side: THREE.DoubleSide,
  });
  const roofMat = std("#3a3a40", 0.7);
  const glowMat = new THREE.MeshStandardMaterial({
    color: "#ffd27a",
    emissive: "#ff9a33",
    emissiveIntensity: 0.9,
    roughness: 0.5,
  });

  // ---------- Base ----------
  root.add(place(M(new THREE.BoxGeometry(7, 0.3, 7), woodBase), 0, 0.15, 0));
  root.add(place(M(new THREE.BoxGeometry(7.12, 0.04, 7.12), redDark), 0, 0.28, 0));

  // ---------- Raked gravel with canvas-drawn rake rings ----------
  const cv = document.createElement("canvas");
  cv.width = 512;
  cv.height = 512;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#ebe8e1";
  g.fillRect(0, 0, 512, 512);
  const ppm = 512 / 6.9;
  g.strokeStyle = "rgba(140,134,124,0.55)";
  g.lineWidth = 2;
  for (let r = 1.95; r < 5; r += 0.14) {
    g.beginPath();
    g.arc(256, 256, r * ppm, 0, Math.PI * 2);
    g.stroke();
  }
  for (let i = 0; i < 2600; i++) {
    const shade = 150 + Math.floor(rand() * 70);
    g.fillStyle = `rgb(${shade},${shade - 4},${shade - 12})`;
    g.fillRect(rand() * 512, rand() * 512, 2, 2);
  }
  const gravelTex = new THREE.CanvasTexture(cv);
  gravelTex.colorSpace = THREE.SRGBColorSpace;
  gravelTex.wrapS = THREE.RepeatWrapping;
  gravelTex.wrapT = THREE.RepeatWrapping;
  gravelTex.repeat.set(1 / 6.9, 1 / 6.9);
  gravelTex.offset.set(0.5, 0.5);
  const gravelMat = new THREE.MeshStandardMaterial({ map: gravelTex, roughness: 1 });

  const gShape = new THREE.Shape();
  const h = 3.45;
  gShape.moveTo(-h, -h);
  gShape.lineTo(h, -h);
  gShape.lineTo(h, h);
  gShape.lineTo(-h, h);
  gShape.lineTo(-h, -h);
  const pondHole = new THREE.Path();
  pondHole.absarc(0, 0, 1.9, 0, Math.PI * 2, false);
  gShape.holes.push(pondHole);
  const gravelGeo = new THREE.ShapeGeometry(gShape, 48);
  gravelGeo.rotateX(-Math.PI / 2);
  root.add(place(M(gravelGeo, gravelMat), 0, 0.301, 0));

  // ---------- Pond ----------
  root.add(place(M(new THREE.CylinderGeometry(1.9, 1.9, 0.02, 48), mud), 0, 0.3, 0));
  root.add(place(M(new THREE.CylinderGeometry(1.85, 1.85, 0.02, 48), water), 0, 0.33, 0));
  const rim = new THREE.TorusGeometry(1.9, 0.1, 8, 48);
  rim.rotateX(Math.PI / 2);
  root.add(place(M(rim, stoneLight), 0, 0.32, 0));

  // ---------- Koi ----------
  function koi(x: number, z: number, ry: number) {
    const grp = new THREE.Group();
    const body = M(new THREE.SphereGeometry(1, 10, 8), koiOrange);
    place(body, 0, 0, 0, 0, 0, 0, 0.11, 0.09, 0.32);
    grp.add(body);
    const patch = M(new THREE.SphereGeometry(1, 8, 6), koiWhite);
    place(patch, 0.02, 0.06, 0.05, 0, 0, 0, 0.07, 0.03, 0.12);
    grp.add(patch);
    const patch2 = M(new THREE.SphereGeometry(1, 8, 6), koiWhite);
    place(patch2, -0.03, 0.05, -0.12, 0, 0, 0, 0.06, 0.03, 0.08);
    grp.add(patch2);
    const tailGeo = new THREE.ConeGeometry(0.1, 0.22, 4);
    tailGeo.rotateX(-Math.PI / 2);
    const tail = M(tailGeo, koiWhite);
    place(tail, 0, 0, -0.42, 0, 0, 0, 1, 0.35, 1);
    grp.add(tail);
    place(grp, x, 0.32, z, 0, ry, 0);
    return grp;
  }
  root.add(koi(-0.7, -0.6, 0.5));
  root.add(koi(0.6, 0.5, -0.8));
  root.add(koi(0.2, -1.2, 2.2));

  // ---------- Bridge (arched, red) ----------
  const bridge = new THREE.Group();
  const N = 24;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    pts.push(new THREE.Vector3(0, 0.33 + 0.75 * Math.sin(Math.PI * t), -2.5 + 5 * t));
  }
  for (let i = 0; i < N; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const len = a.distanceTo(b);
    const plank = M(new THREE.BoxGeometry(0.9, 0.06, len * 1.08), redBridge);
    plank.position.copy(mid);
    plank.lookAt(b);
    bridge.add(plank);
  }
  for (const side of [-1, 1]) {
    const rail: THREE.Vector3[] = pts.map(
      (p) => new THREE.Vector3(side * 0.42, p.y + 0.28, p.z)
    );
    for (let i = 0; i < N; i++) {
      const a = rail[i];
      const b = rail[i + 1];
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const len = a.distanceTo(b);
      const seg = M(new THREE.BoxGeometry(0.05, 0.05, len * 1.08), redDark);
      seg.position.copy(mid);
      seg.lookAt(b);
      bridge.add(seg);
    }
    for (let i = 0; i <= N; i += 2) {
      const p = pts[i];
      bridge.add(place(M(new THREE.CylinderGeometry(0.03, 0.03, 0.28, 6), redDark), side * 0.42, p.y + 0.14, p.z));
    }
  }
  root.add(bridge);

  // ---------- Stepping stones ----------
  const stoneGeo = new THREE.CylinderGeometry(0.22, 0.26, 0.08, 7);
  root.add(place(M(stoneGeo, stoneDark), 0.6, 0.34, 3.15, 0, 0.4, 0));
  root.add(place(M(stoneGeo, stoneDark), 0.15, 0.34, 2.8, 0, -0.3, 0, 0.9, 1, 0.9));

  // ---------- Mossy rocks ----------
  function mossRock(x: number, z: number, s: number, ry: number) {
    const grp = new THREE.Group();
    const rock = M(new THREE.DodecahedronGeometry(0.35 * s, 0), rockGrey);
    place(rock, 0, 0.3 + 0.14 * s, 0, 0, ry, 0, 1.2, 0.8, 1);
    grp.add(rock);
    const cap = M(new THREE.IcosahedronGeometry(0.22 * s, 1), moss);
    place(cap, 0, 0.3 + 0.3 * s, 0, 0, ry, 0, 1.1, 0.35, 1);
    grp.add(cap);
    grp.position.set(x, 0, z);
    return grp;
  }
  root.add(mossRock(2.5, 0.6, 1.0, 0.3));
  root.add(mossRock(-2.2, -0.9, 0.8, 1.2));
  root.add(mossRock(1.6, 2.4, 0.7, 2.0));

  // ---------- Stone lantern ----------
  const lantern = new THREE.Group();
  lantern.add(place(M(new THREE.BoxGeometry(0.42, 0.12, 0.42), stoneLight), 0, 0.36, 0));
  lantern.add(place(M(new THREE.CylinderGeometry(0.14, 0.18, 0.14, 6), stoneLight), 0, 0.49, 0));
  lantern.add(place(M(new THREE.CylinderGeometry(0.09, 0.11, 0.55, 6), stoneLight), 0, 0.83, 0));
  lantern.add(place(M(new THREE.BoxGeometry(0.36, 0.06, 0.36), stoneLight), 0, 1.14, 0));
  lantern.add(place(M(new THREE.BoxGeometry(0.26, 0.3, 0.26), glowMat), 0, 1.3, 0));
  for (const [cx, cz] of [
    [-0.13, -0.13],
    [0.13, -0.13],
    [-0.13, 0.13],
    [0.13, 0.13],
  ]) {
    lantern.add(place(M(new THREE.BoxGeometry(0.03, 0.3, 0.03), stoneDark), cx, 1.3, cz));
  }
  const roofGeo = new THREE.ConeGeometry(0.34, 0.22, 4);
  roofGeo.rotateY(Math.PI / 4);
  lantern.add(place(M(roofGeo, roofMat), 0, 1.56, 0));
  lantern.add(place(M(new THREE.ConeGeometry(0.06, 0.12, 6), stoneDark), 0, 1.72, 0));
  lantern.add(place(M(new THREE.SphereGeometry(0.05, 8, 6), stoneDark), 0, 1.8, 0));
  lantern.position.set(-1.9, 0.3, 1.6);
  root.add(lantern);

  // ---------- Cloud-pruned pine ----------
  const pine = new THREE.Group();
  pine.add(place(M(new THREE.CylinderGeometry(0.06, 0.13, 1.5, 6), trunk), 0, 0.75, 0, 0, 0, 0.1));
  const cloudGeo = new THREE.IcosahedronGeometry(1, 1);
  const pineClouds: [number, number, number, number, number, number][] = [
    [0, 1.25, 0, 0.7, 0.3, 0.7],
    [0.3, 1.55, 0.1, 0.55, 0.25, 0.5],
    [-0.28, 1.6, -0.15, 0.5, 0.25, 0.5],
    [0.05, 1.95, 0, 0.45, 0.22, 0.45],
    [0.12, 2.2, 0.02, 0.3, 0.18, 0.3],
  ];
  pineClouds.forEach(([x, y, z, sx, sy, sz], i) => {
    pine.add(place(M(cloudGeo, i % 2 ? pineB : pineA), x, y, z, 0, i * 0.7, 0, sx, sy, sz));
  });
  pine.position.set(-2.4, 0.3, -1.8);
  root.add(pine);

  // ---------- Cherry tree ----------
  const cherry = new THREE.Group();
  cherry.add(place(M(new THREE.CylinderGeometry(0.07, 0.14, 1.4, 6), trunk), 0, 0.7, 0, 0, 0, -0.08));
  for (let k = 0; k < 4; k++) {
    const br = new THREE.Group();
    const limb = M(new THREE.CylinderGeometry(0.02, 0.04, 0.8, 5), trunk);
    limb.position.set(0.36, 0.35, 0);
    limb.rotation.z = -0.8;
    br.add(limb);
    br.position.set(0, 1.25, 0);
    br.rotation.y = k * 1.6 + 0.4;
    cherry.add(br);
  }
  const clumpGeo = new THREE.IcosahedronGeometry(0.42, 1);
  const clumpMats = [pinkA, pinkB, pinkC];
  for (let i = 0; i < 16; i++) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * 0.95;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const y = 1.7 + rand() * 0.9;
    const s = 0.8 + rand() * 0.5;
    cherry.add(
      place(M(clumpGeo, clumpMats[i % 3]), x, y, z, rand(), rand(), rand(), s * 1.1, s * 0.9, s * 1.1)
    );
  }
  cherry.position.set(2.4, 0.3, -2.0);
  root.add(cherry);

  // ---------- Falling petals ----------
  const petalGeo = new THREE.PlaneGeometry(0.07, 0.045);
  for (let i = 0; i < 36; i++) {
    const x = 2.4 + (rand() - 0.5) * 3.6;
    const z = -2.0 + (rand() - 0.5) * 3.6;
    const onGround = i < 8;
    const y = onGround ? 0.315 : 0.5 + rand() * 1.9;
    const p = M(petalGeo, petalMat);
    place(p, x, y, z, rand() * Math.PI, rand() * Math.PI * 2, rand() * Math.PI);
    if (onGround) p.rotation.set(-Math.PI / 2, 0, rand() * Math.PI * 2);
    root.add(p);
  }

  // ---------- Stepping-stone path accent: a few loose pebbles ----------
  const pebbleGeo = new THREE.DodecahedronGeometry(0.05, 0);
  for (let i = 0; i < 10; i++) {
    const a = rand() * Math.PI * 2;
    const r = 2.1 + rand() * 0.5;
    root.add(
      place(M(pebbleGeo, rockGrey), Math.cos(a) * r + 0.2, 0.31, Math.sin(a) * r * 0.6 + 1.2, rand(), rand(), rand(), 1, 0.6, 1)
    );
  }

  return root;
}
