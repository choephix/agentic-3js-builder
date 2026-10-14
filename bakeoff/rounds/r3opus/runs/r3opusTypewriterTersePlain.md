```ts
import * as THREE from "three";

export const meta = {
  name: "Meridian Deluxe Typewriter",
  description:
    "A 1950s-style portable typewriter in teal enamel with chrome trim, black glass keys, a fan of typebars, red and black ribbon spools, and a sheet of paper with a typed letter.",
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const rand = rng(1947);

  // ---------- materials ----------
  const M = (c: string, r = 0.5, m = 0) =>
    new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, flatShading: true });
  const body = M("#2c6e68", 0.32, 0.15);
  const bodyDeep = M("#163b38", 0.75, 0.05);
  const chrome = M("#dfe3e8", 0.25, 0.85);
  const darkMetal = M("#3a3d42", 0.4, 0.6);
  const rubber = M("#1a1a1c", 0.85, 0);
  const glass = M("#101012", 0.15, 0.1);
  const gold = M("#d8a83c", 0.3, 0.75);
  const ribbonRed = M("#b8262b", 0.6, 0);
  const ribbonBlack = M("#141414", 0.6, 0);
  const felt = M("#6b2a2e", 0.95, 0);
  const paperBlank = new THREE.MeshStandardMaterial({ color: "#f3ead2", roughness: 0.9, side: THREE.DoubleSide });

  const mkCanvas = (w: number, h: number) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  };
  const tex = (c: HTMLCanvasElement) => {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };

  // ---------- key atlas ----------
  const labels = "1234567890-QWERTYUIOPASDFGHJKL;ZXCVBNM,.".split("");
  labels.push("SHIFT");
  const atlas = mkCanvas(512, 512);
  {
    const g = atlas.getContext("2d")!;
    labels.forEach((L, i) => {
      const cx = (i % 8) * 64, cy = Math.floor(i / 8) * 64;
      g.fillStyle = "#121214";
      g.fillRect(cx, cy, 64, 64);
      g.strokeStyle = "#f1e7cc";
      g.lineWidth = 2.5;
      g.beginPath();
      g.arc(cx + 32, cy + 32, 27, 0, Math.PI * 2);
      g.stroke();
      g.fillStyle = "#f1e7cc";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.font = L.length > 1 ? "bold 13px Georgia, serif" : "bold 30px Georgia, serif";
      g.fillText(L, cx + 32, cy + 34);
    });
  }
  const keyMat = new THREE.MeshStandardMaterial({ map: tex(atlas), roughness: 0.15, metalness: 0.1 });

  // ---------- badge ----------
  const badgeC = mkCanvas(512, 96);
  {
    const g = badgeC.getContext("2d")!;
    g.fillStyle = "#111";
    g.fillRect(0, 0, 512, 96);
    g.strokeStyle = "#e0b04a";
    g.lineWidth = 5;
    g.strokeRect(8, 8, 496, 80);
    g.lineWidth = 2;
    g.strokeRect(18, 18, 476, 60);
    g.fillStyle = "#e8bb52";
    g.font = "italic bold 52px Georgia, serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("M e r i d i a n", 256, 50);
  }
  const badgeMat = new THREE.MeshStandardMaterial({ map: tex(badgeC), roughness: 0.3, metalness: 0.4 });

  // ---------- ruler ----------
  const rulerC = mkCanvas(1024, 40);
  {
    const g = rulerC.getContext("2d")!;
    g.fillStyle = "#efe5c8";
    g.fillRect(0, 0, 1024, 40);
    g.fillStyle = "#1a1a1a";
    for (let i = 0; i <= 80; i++) {
      const x = 12 + i * 12.5;
      const h = i % 10 === 0 ? 22 : i % 5 === 0 ? 14 : 8;
      g.fillRect(x, 0, 2, h);
      if (i % 10 === 0) {
        g.font = "bold 13px monospace";
        g.fillText(String(i), x + 3, 36);
      }
    }
  }
  const rulerMat = new THREE.MeshStandardMaterial({ map: tex(rulerC), roughness: 0.5 });

  // ---------- paper ----------
  const paperC = mkCanvas(516, 480);
  {
    const g = paperC.getContext("2d")!;
    g.fillStyle = "#f3ead2";
    g.fillRect(0, 0, 516, 480);
    g.fillStyle = "rgba(160,130,80,0.08)";
    for (let i = 0; i < 40; i++) g.fillRect(rand() * 516, rand() * 480, 2 + rand() * 30, 1);
    const lines = [
      "         THE LAST LETTER",
      "",
      "Dear Margaret,",
      "",
      "The rain has not stopped since Tuesday,",
      "and the old Meridian is the only thing",
      "in this house that still sings. Every",
      "key lands like a small promise; every",
      "bell at the margin is a door closing",
      "softly behind a thought.",
      "",
      "I am writing to tell you that I have",
      "finally finished the book. Two hundred",
      "and twelve pages, one ribbon, and more",
      "coffee than is reasonable.",
      "",
      "Come home soon. The kettle is wa",
    ];
    g.font = 'bold 18px "Courier New", Courier, monospace';
    g.textBaseline = "alphabetic";
    const adv = g.measureText("M").width;
    lines.forEach((ln, li) => {
      const y = 92 + li * 22;
      for (let ci = 0; ci < ln.length; ci++) {
        const ch = ln[ci];
        if (ch === " ") continue;
        const a = 0.6 + rand() * 0.4;
        g.fillStyle = li === 0 ? `rgba(170,25,30,${a})` : `rgba(20,20,24,${a})`;
        g.fillText(ch, 40 + ci * adv + (rand() - 0.5) * 0.8, y + (rand() - 0.5) * 1.4);
      }
    });
    g.fillStyle = "rgba(20,20,24,0.9)";
    g.fillRect(40 + lines[16].length * adv, 92 + 16 * 22 + 3, adv, 2);
  }
  const paperMat = new THREE.MeshStandardMaterial({ map: tex(paperC), roughness: 0.9, side: THREE.DoubleSide });

  // ---------- helpers ----------
  const add = (g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, p: THREE.Object3D = root) => {
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(x, y, z);
    p.add(mesh);
    return mesh;
  };
  const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number, p: THREE.Object3D = root) =>
    add(new THREE.BoxGeometry(w, h, d), m, x, y, z, p);
  const cylX = (r: number, len: number, seg: number, m: THREE.Material, x: number, y: number, z: number) => {
    const c = add(new THREE.CylinderGeometry(r, r, len, seg), m, x, y, z);
    c.rotation.z = Math.PI / 2;
    return c;
  };
  const beam = (a: THREE.Vector3, b: THREE.Vector3, w: number, h: number, m: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, a.distanceTo(b)), m);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.lookAt(b);
    root.add(mesh);
    return mesh;
  };
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const profileMesh = (pts: [number, number][], depth: number, x0: number, m: THREE.Material) => {
    const s = new THREE.Shape();
    pts.forEach(([z, y], i) => (i === 0 ? s.moveTo(-z, y) : s.lineTo(-z, y)));
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
    const mesh = new THREE.Mesh(geo, m);
    mesh.rotation.y = Math.PI / 2;
    mesh.position.x = x0;
    root.add(mesh);
    return mesh;
  };

  // ---------- chassis ----------
  const centerProfile: [number, number][] = [
    [0.15, 0.012], [0.15, 0.042], [0.045, 0.084], [0.045, 0.095], [-0.13, 0.095], [-0.13, 0.012],
  ];
  profileMesh(centerProfile, 0.24, -0.12, body);
  const sideProfile: [number, number][] = [
    [0.15, 0.012], [0.15, 0.05], [0.07, 0.09], [0.03, 0.125], [-0.05, 0.13], [-0.13, 0.125], [-0.13, 0.012],
  ];
  profileMesh(sideProfile, 0.03, 0.12, body);
  profileMesh(sideProfile, 0.03, -0.15, body);

  // feet
  const footGeo = new THREE.CylinderGeometry(0.013, 0.014, 0.012, 10);
  for (const [x, z] of [[0.125, 0.125], [-0.125, 0.125], [0.125, -0.105], [-0.125, -0.105]]) add(footGeo, rubber, x, 0.006, z);

  // badge + trim
  const badge = add(new THREE.PlaneGeometry(0.11, 0.0206), badgeMat, 0, 0.027, 0.1506);
  badge.renderOrder = 1;
  box(0.24, 0.002, 0.002, gold, 0, 0.041, 0.151);
  box(0.24, 0.002, 0.002, gold, 0, 0.013, 0.151);
  for (const s of [1, -1]) {
    box(0.001, 0.002, 0.27, gold, s * 0.1505, 0.032, 0.01);
    box(0.001, 0.002, 0.27, gold, s * 0.1505, 0.026, 0.01);
    const screwGeo = new THREE.CylinderGeometry(0.0028, 0.0028, 0.002, 8);
    for (const [z, y] of [[0.12, 0.05], [-0.11, 0.05], [-0.11, 0.105], [0.02, 0.105]]) {
      const sc = add(screwGeo, chrome, s * 0.1508, y, z);
      sc.rotation.z = Math.PI / 2;
    }
  }

  // rear cover
  box(0.24, 0.017, 0.095, body, 0, 0.1035, -0.0825);
  box(0.24, 0.002, 0.002, gold, 0, 0.111, -0.0345);
  const emblem = add(new THREE.CylinderGeometry(0.006, 0.006, 0.002, 10), gold, 0, 0.1035, -0.0345);
  emblem.rotation.x = Math.PI / 2;

  // ---------- typebar well ----------
  const disc = add(new THREE.CircleGeometry(0.075, 16, Math.PI, Math.PI), bodyDeep, 0, 0.0957, -0.035);
  disc.rotation.x = -Math.PI / 2;
  const rest = add(new THREE.TorusGeometry(0.072, 0.003, 4, 16, Math.PI), felt, 0, 0.0975, -0.035);
  rest.rotation.x = Math.PI / 2;
  const seg = add(new THREE.TorusGeometry(0.03, 0.005, 4, 14, Math.PI), chrome, 0, 0.0985, -0.035);
  seg.rotation.x = Math.PI / 2;
  const barGeo = new THREE.BoxGeometry(0.0022, 0.002, 0.038);
  const headGeo = new THREE.BoxGeometry(0.0045, 0.0035, 0.006);
  for (let k = 0; k < 28; k++) {
    const a = 0.12 + ((Math.PI - 0.24) * k) / 27;
    const dx = Math.cos(a), dz = Math.sin(a);
    const b = add(barGeo, chrome, dx * 0.049, 0.0988, -0.035 + dz * 0.049);
    b.rotation.y = Math.atan2(dx, dz);
    const h = add(headGeo, darkMetal, dx * 0.069, 0.0995, -0.035 + dz * 0.069);
    h.rotation.y = Math.atan2(dx, dz);
  }

  // ---------- keyboard ----------
  const deckY = (z: number) => 0.042 + 0.4 * (0.15 - z);
  const rimGeo = new THREE.CylinderGeometry(0.0086, 0.0086, 0.003, 12);
  const capGeo = new THREE.CylinderGeometry(0.0076, 0.0079, 0.004, 12);
  const stemGeo = new THREE.CylinderGeometry(0.0013, 0.0013, 1, 5);
  const letterGeo = (idx: number) => {
    const g = new THREE.CircleGeometry(0.0067, 12);
    const uv = g.attributes.uv as THREE.BufferAttribute;
    const c = idx % 8, r = Math.floor(idx / 8);
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (c + uv.getX(i)) / 8, 1 - (r + 1) / 8 + uv.getY(i) / 8);
    return g;
  };
  const key = (x: number, z: number, ytop: number, idx: number, sx = 1) => {
    const g = new THREE.Group();
    g.position.set(x, ytop, z);
    g.rotation.x = 0.18;
    g.scale.x = sx;
    root.add(g);
    add(rimGeo, chrome, 0, -0.003, 0, g);
    add(capGeo, glass, 0, -0.0015, 0, g);
    const l = add(letterGeo(idx), keyMat, 0, 0.0007, 0, g);
    l.rotation.x = -Math.PI / 2;
    const d = deckY(z);
    const len = ytop - 0.0045 - d;
    const st = add(stemGeo, chrome, x, d + len / 2, z);
    st.scale.y = len;
  };
  const rows = [
    { z: 0.06, y: 0.104, k: "1234567890-", off: -0.006 },
    { z: 0.085, y: 0.092, k: "QWERTYUIOP", off: -0.002 },
    { z: 0.11, y: 0.08, k: "ASDFGHJKL;", off: 0.004 },
    { z: 0.135, y: 0.068, k: "ZXCVBNM,.", off: 0 },
  ];
  for (const r of rows) {
    const n = r.k.length;
    for (let i = 0; i < n; i++) key(r.off + (i - (n - 1) / 2) * 0.0196, r.z, r.y, labels.indexOf(r.k[i]));
  }
  const shiftIdx = labels.indexOf("SHIFT");
  key(-0.104, 0.135, 0.068, shiftIdx, 1.3);
  key(0.104, 0.135, 0.068, shiftIdx, 1.3);

  // space bar
  box(0.16, 0.006, 0.011, chrome, 0, 0.058, 0.158);
  for (const s of [1, -1]) {
    beam(V(s * 0.07, 0.058, 0.155), V(s * 0.07, 0.05, 0.128), 0.004, 0.003, chrome);
    box(0.003, 0.0075, 0.012, glass, s * 0.0815, 0.058, 0.158);
  }

  // ---------- ribbon spools ----------
  for (const s of [1, -1]) {
    const x = s * 0.095, z = -0.06;
    add(new THREE.CylinderGeometry(0.022, 0.022, 0.004, 14), chrome, x, 0.114, z);
    add(new THREE.CylinderGeometry(0.017, 0.017, 0.006, 14), ribbonBlack, x, 0.119, z);
    add(new THREE.CylinderGeometry(0.017, 0.017, 0.006, 14), ribbonRed, x, 0.125, z);
    add(new THREE.CylinderGeometry(0.022, 0.022, 0.0025, 14), chrome, x, 0.1293, z);
    add(new THREE.CylinderGeometry(0.004, 0.004, 0.006, 8), darkMetal, x, 0.133, z);
    // spoke holes on top flange
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      add(new THREE.CylinderGeometry(0.0032, 0.0032, 0.0006, 6), bodyDeep, x + Math.cos(a) * 0.012, 0.1307, z + Math.sin(a) * 0.012);
    }
    // ribbon strands
    beam(V(s * 0.078, 0.1225, -0.048), V(s * 0.012, 0.149, -0.0565), 0.0008, 0.006, ribbonBlack);
    beam(V(s * 0.078, 0.1285, -0.048), V(s * 0.012, 0.155, -0.0565), 0.0008, 0.006, ribbonRed);
  }
  box(0.024, 0.006, 0.0008, ribbonBlack, 0, 0.149, -0.0565);
  box(0.024, 0.006, 0.0008, ribbonRed, 0, 0.155, -0.0565);
  // ribbon vibrator / card guide
  box(0.03, 0.003, 0.0015, chrome, 0, 0.1445, -0.0555);
  for (const s of [1, -1]) box(0.003, 0.016, 0.0015, chrome, s * 0.0135, 0.152, -0.0555);
  box(0.004, 0.012, 0.003, darkMetal, 0, 0.136, -0.056);

  // ---------- carriage ----------
  cylX(0.005, 0.38, 8, chrome, 0, 0.133, -0.1); // rail
  box(0.33, 0.016, 0.02, body, 0, 0.142, -0.116);
  box(0.33, 0.0015, 0.0015, gold, 0, 0.1505, -0.1055);
  for (const s of [1, -1]) box(0.008, 0.05, 0.07, body, s * 0.163, 0.155, -0.09);

  // platen
  cylX(0.022, 0.31, 16, rubber, 0, 0.158, -0.085);
  cylX(0.004, 0.39, 6, chrome, 0, 0.158, -0.085);
  for (const s of [1, -1]) {
    cylX(0.0235, 0.006, 16, chrome, s * 0.158, 0.158, -0.085);
    cylX(0.017, 0.018, 12, rubber, s * 0.183, 0.158, -0.085);
    cylX(0.0105, 0.004, 12, chrome, s * 0.194, 0.158, -0.085);
    cylX(0.0185, 0.002, 12, chrome, s * 0.1735, 0.158, -0.085);
  }

  // paper
  const wrap = add(
    new THREE.CylinderGeometry(0.0235, 0.0235, 0.215, 14, 1, true, -0.7, Math.PI / 2 + 0.7),
    paperBlank, 0, 0.158, -0.085
  );
  wrap.rotation.z = Math.PI / 2;
  const tilt = -0.2;
  const paper = add(new THREE.PlaneGeometry(0.215, 0.2), paperMat, 0, 0.1815 + 0.1 * Math.cos(tilt), -0.085 + 0.1 * Math.sin(tilt));
  paper.rotation.x = tilt;

  // paper table
  const tt = -0.35;
  const table = box(0.24, 0.11, 0.003, body, 0, 0.165 + 0.055 * Math.cos(tt), -0.11 + 0.055 * Math.sin(tt) - 0.003);
  table.rotation.x = tt;
  for (const s of [1, -1]) beam(V(s * 0.1, 0.15, -0.118), V(s * 0.1, 0.2, -0.135), 0.003, 0.003, chrome);
  const topWire = cylX(0.0022, 0.25, 6, chrome, 0, 0.165 + 0.11 * Math.cos(tt), -0.113 + 0.11 * Math.sin(tt));
  topWire.rotation.x = tt;

  // paper bail + rollers
  cylX(0.0022, 0.27, 6, chrome, 0, 0.1785, -0.067);
  for (const s of [1, -1]) {
    beam(V(s * 0.135, 0.1785, -0.067), V(s * 0.159, 0.165, -0.08), 0.003, 0.003, chrome);
    cylX(0.005, 0.012, 8, rubber, s * 0.06, 0.1785, -0.067);
  }

  // margin scale
  box(0.27, 0.011, 0.002, chrome, 0, 0.1385, -0.0635).rotation.x = -0.5;
  const scale = add(new THREE.PlaneGeometry(0.26, 0.009), rulerMat, 0, 0.1392, -0.0622);
  scale.rotation.x = -0.5;
  for (const s of [1, -1]) {
    const tab = box(0.006, 0.01, 0.003, glass, s * 0.07, 0.1445, -0.0605);
    tab.rotation.x = -0.5;
  }

  // carriage return lever (typist's left, -X)
  box(0.012, 0.012, 0.012, chrome, -0.173, 0.18, -0.078);
  beam(V(-0.175, 0.182, -0.075), V(-0.205, 0.198, -0.02), 0.004, 0.009, chrome);
  beam(V(-0.205, 0.198, -0.02), V(-0.212, 0.2, 0.012), 0.004, 0.007, chrome);
  add(new THREE.SphereGeometry(0.0075, 10, 8), glass, -0.212, 0.2, 0.016);

  // paper release lever (+X)
  beam(V(0.168, 0.165, -0.1), V(0.172, 0.208, -0.112), 0.004, 0.006, chrome);
  add(new THREE.SphereGeometry(0.006, 8, 6), glass, 0.172, 0.211, -0.113);

  // line-space selector on right end plate
  const sel = add(new THREE.CylinderGeometry(0.006, 0.006, 0.004, 8), gold, 0.168, 0.14, -0.07);
  sel.rotation.z = Math.PI / 2;

  return root;
}
```