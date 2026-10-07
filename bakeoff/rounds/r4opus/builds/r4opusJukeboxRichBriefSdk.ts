import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Diner Jukebox",
  description:
    "A 1950s diner jukebox: walnut arch cabinet framed by glowing red, amber and teal tubes, chrome trim, a glass-glinted window onto a record stack and picker arm, a tilted selection console with title cards, chrome buttons and coin slots, and a starburst speaker grille.",
};

export default function build() {
  const b = createBuilder({ name: "jukebox" });
  const root = b.joint("root", { at: [0, 0, 0] });

  const C = {
    wood: "#6b2f1a",
    plinth: "#3a1a0e",
    chrome: "#dfe5ec",
    chromeShade: "#8f99a6",
    cream: "#f1e4c4",
    red: "#ff3b30",
    amber: "#ffb020",
    teal: "#16d4c4",
    redCore: "#ffd6cf",
    amberCore: "#fff3c4",
    tealCore: "#d4fff8",
    redSpill: "#a3241f",
    amberSpill: "#b8741a",
    tealSpill: "#0f8a80",
    liner: "#1a4452",
    backdrop: "#123a4a",
    ray: "#2a7a8c",
    vinyl: "#141416",
    groove: "#2c2c33",
    platter: "#3a3a40",
    gold: "#e0b03c",
    fabric: "#2a1414",
    fabricOuter: "#4a1a1a",
    enamel: "#c8302c",
    face: "#3d1416",
    card: "#fbf3dc",
    ink: "#3a2a2a",
    blueInk: "#2f5f9e",
    ivory: "#f4ead2",
    slot: "#0d0d0f",
    copper: "#b8733a",
    silver: "#c9ccd1",
    glint: "#ffffff",
    glintBlue: "#cfe8ff",
    bubble: "#ffffff",
  };

  const put = (geo: THREE.BufferGeometry, color: string, pos: number[], rot?: number[]) => {
    if (rot) {
      geo.applyQuaternion(new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2])));
    }
    b.part(geo, color, { at: [pos[0], pos[1], pos[2]], bone: root });
  };

  // ---------- arch outline helpers ----------
  const archPts = (r: number, y0: number, yc: number, nArc = 24): THREE.Vector2[] => {
    const pts: THREE.Vector2[] = [];
    const nS = 4;
    for (let i = 0; i < nS; i++) pts.push(new THREE.Vector2(r, y0 + ((yc - y0) * i) / nS));
    for (let i = 0; i <= nArc; i++) {
      const a = (Math.PI * i) / nArc;
      pts.push(new THREE.Vector2(r * Math.cos(a), yc + r * Math.sin(a)));
    }
    for (let i = 1; i <= nS; i++) pts.push(new THREE.Vector2(-r, yc + ((y0 - yc) * i) / nS));
    return pts;
  };
  const bandShape = (rOut: number, rIn: number, y0: number, yc: number) =>
    new THREE.Shape([...archPts(rOut, y0, yc), ...archPts(rIn, y0, yc).reverse()]);
  const archWithHole = (r: number, y0: number, hr: number, hy0: number, yc: number) => {
    const s = new THREE.Shape(archPts(r, y0, yc, 28));
    s.holes.push(new THREE.Path(archPts(hr, hy0, yc, 24)));
    return s;
  };
  const ext = (shape: THREE.Shape, depth: number, bevel = 0, curveSegments = 8) =>
    new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: bevel > 0,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 2,
      curveSegments,
    });
  const archTube = (r: number, y0: number, yc: number, z: number, radius: number, color: string, radial = 8) => {
    const pts = archPts(r, y0, yc, 22).map((p) => new THREE.Vector3(p.x, p.y, z));
    const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
    put(new THREE.TubeGeometry(curve, 72, radius, radial, false), color, [0, 0, 0]);
  };
  const starShape = (n: number, ro: number, ri: number) => {
    const s = new THREE.Shape();
    for (let i = 0; i < n * 2; i++) {
      const a = Math.PI / 2 + (i * Math.PI) / n;
      const r = i % 2 ? ri : ro;
      if (i === 0) s.moveTo(r * Math.cos(a), r * Math.sin(a));
      else s.lineTo(r * Math.cos(a), r * Math.sin(a));
    }
    s.closePath();
    return s;
  };
  const disc = (r: number, h: number, seg = 14) => new THREE.CylinderGeometry(r, r, h, seg).rotateX(Math.PI / 2);

  const YC = 1.12; // centre of the arch
  const BW = 0.445; // cabinet half width before bevel

  // ---------- plinth ----------
  put(new THREE.BoxGeometry(0.98, 0.1, 0.6), C.plinth, [0, 0.05, -0.02]);
  put(new THREE.BoxGeometry(0.94, 0.064, 0.008), C.chrome, [0, 0.05, 0.282]);
  for (let i = 0; i < 24; i++) {
    put(new THREE.BoxGeometry(0.005, 0.05, 0.004), C.chromeShade, [-0.44 + i * 0.0383, 0.05, 0.287]);
  }
  put(new THREE.BoxGeometry(0.98, 0.012, 0.012), C.chrome, [0, 0.094, 0.28]);

  // ---------- cabinet ----------
  put(ext(new THREE.Shape(archPts(BW, 0.115, YC, 28)), 0.27, 0.015), C.wood, [0, 0, -0.275]);
  put(ext(archWithHole(BW, 0.115, 0.27, 0.965, YC), 0.17, 0.015), C.wood, [0, 0, 0.025]);
  // chrome edge piping round the front bevel
  archTube(0.458, 0.12, YC, 0.198, 0.008, C.chrome, 6);

  // ---------- window interior ----------
  put(ext(archWithHole(0.254, 0.976, 0.247, 0.983, YC), 0.2), C.liner, [0, 0, 0.01]);
  put(ext(new THREE.Shape(archPts(0.26, 0.97, YC)), 0.003), C.backdrop, [0, 0, 0.011]);
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 + 0.09;
    const L = i % 2 ? 0.22 : 0.34;
    const w = i % 2 ? 0.05 : 0.07;
    const s = new THREE.Shape([
      new THREE.Vector2(0, 0),
      new THREE.Vector2(L * Math.cos(a - w), L * Math.sin(a - w)),
      new THREE.Vector2(L * Math.cos(a + w), L * Math.sin(a + w)),
    ]);
    put(ext(s, 0.002), C.ray, [0, 1.12, 0.0145]);
  }

  // turntable deck, platter and record stack
  put(new THREE.BoxGeometry(0.44, 0.016, 0.17), C.chromeShade, [0, 0.988, 0.1]);
  put(new THREE.CylinderGeometry(0.095, 0.095, 0.012, 24), C.platter, [-0.05, 1.002, 0.1]);
  put(new THREE.TorusGeometry(0.095, 0.004, 4, 24).rotateX(Math.PI / 2), C.chrome, [-0.05, 1.006, 0.1]);

  const labels = ["#e8402f", "#f4c430", "#2f6fd6", "#3fbf6a", "#f08a24", "#d94f9a", "#f4ead2", "#e8402f"];
  const record = (x: number, y: number, z: number, label: string, rot?: number[]) => {
    put(new THREE.CylinderGeometry(0.089, 0.089, 0.004, 26), C.vinyl, [x, y, z], rot);
    put(new THREE.CylinderGeometry(0.066, 0.066, 0.0043, 22), C.groove, [x, y, z], rot);
    put(new THREE.CylinderGeometry(0.046, 0.046, 0.0046, 20), C.vinyl, [x, y, z], rot);
    put(new THREE.CylinderGeometry(0.03, 0.03, 0.005, 16), label, [x, y, z], rot);
  };
  for (let i = 0; i < 7; i++) record(-0.05, 1.012 + i * 0.018, 0.1, labels[i]);
  put(new THREE.CylinderGeometry(0.0045, 0.0045, 0.17, 8), C.chrome, [-0.05, 1.085, 0.1]);
  put(new THREE.SphereGeometry(0.008, 8, 6), C.chrome, [-0.05, 1.172, 0.1]);

  // picker arm lifting a record
  put(new THREE.BoxGeometry(0.05, 0.03, 0.05), C.chromeShade, [0.17, 1.005, 0.1]);
  put(new THREE.CylinderGeometry(0.013, 0.015, 0.27, 10), C.chrome, [0.17, 1.13, 0.1]);
  put(new THREE.SphereGeometry(0.02, 10, 8), C.enamel, [0.17, 1.268, 0.1]);
  put(new THREE.BoxGeometry(0.235, 0.016, 0.018), C.chrome, [0.055, 1.266, 0.1]);
  put(new THREE.CylinderGeometry(0.006, 0.006, 0.035, 8), C.chrome, [-0.05, 1.245, 0.1]);
  put(new THREE.BoxGeometry(0.034, 0.016, 0.03), C.chromeShade, [-0.05, 1.222, 0.1]);
  put(new THREE.BoxGeometry(0.005, 0.02, 0.008), C.chrome, [-0.063, 1.208, 0.1]);
  put(new THREE.BoxGeometry(0.005, 0.02, 0.008), C.chrome, [-0.037, 1.208, 0.1]);
  record(-0.05, 1.198, 0.1, labels[7], [0.08, 0, 0.12]);

  // window frame and glass glints
  put(ext(archWithHole(0.285, 0.95, 0.25, 0.982, YC), 0.022, 0.004), C.chrome, [0, 0, 0.212]);
  const glint = (r: number, a0: number, a1: number, rad: number, color: string) => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 8; i++) {
      const a = a0 + ((a1 - a0) * i) / 8;
      const bulge = 0.035 * (1 - (r / 0.25) ** 2);
      pts.push(new THREE.Vector3(r * Math.cos(a), YC + r * Math.sin(a), 0.242 + bulge));
    }
    put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, rad, 5, false), color, [0, 0, 0]);
  };
  glint(0.205, 1.85, 2.65, 0.0045, C.glint);
  glint(0.17, 2.0, 2.45, 0.003, C.glintBlue);
  glint(0.205, 0.55, 0.75, 0.003, C.glintBlue);
  put(new THREE.BoxGeometry(0.006, 0.09, 0.004), C.glint, [-0.205, 1.05, 0.244]);
  put(new THREE.SphereGeometry(0.007, 6, 4), C.glint, [-0.12, 1.3, 0.27]);

  // ---------- cream inner plate ----------
  put(ext(archWithHole(0.33, 0.12, 0.272, 0.962, YC), 0.012), C.cream, [0, 0, 0.21]);

  // ---------- glowing tube arch ----------
  const tubes = [
    { r: 0.425, color: C.red, core: C.redCore, spill: C.redSpill },
    { r: 0.385, color: C.amber, core: C.amberCore, spill: C.amberSpill },
    { r: 0.345, color: C.teal, core: C.tealCore, spill: C.tealSpill },
  ];
  for (const t of tubes) {
    put(ext(bandShape(t.r + 0.02, t.r - 0.02, 0.14, YC), 0.006), t.spill, [0, 0, 0.21]);
    archTube(t.r, 0.15, YC, 0.238, 0.017, t.color, 8);
    archTube(t.r, 0.15, YC, 0.25, 0.0065, t.core, 6);
    for (const s of [1, -1]) {
      put(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 12), C.chrome, [s * t.r, 0.155, 0.238]);
    }
  }
  for (const r of [0.445, 0.405, 0.365, 0.327]) archTube(r, 0.14, YC, 0.222, 0.0055, C.chrome, 6);

  // rising bubbles in the side tubes
  const bubbleY = [0.27, 0.39, 0.52, 0.66, 0.79, 0.93, 1.05];
  tubes.forEach((t, ti) => {
    for (const s of [1, -1]) {
      bubbleY.forEach((y, i) => {
        if ((i + ti) % 2 === 0) {
          put(new THREE.IcosahedronGeometry(0.0068, 0), C.bubble, [s * t.r, y + ti * 0.03, 0.253]);
        }
      });
    }
  });

  // chrome straps clamping the tubes
  for (const a of [Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4]) {
    put(new THREE.BoxGeometry(0.14, 0.012, 0.01), C.chrome, [0.385 * Math.cos(a), YC + 0.385 * Math.sin(a), 0.258], [0, 0, a]);
  }
  for (const s of [1, -1]) {
    put(new THREE.BoxGeometry(0.14, 0.012, 0.01), C.chrome, [s * 0.385, 0.6, 0.258]);
    put(new THREE.BoxGeometry(0.14, 0.012, 0.01), C.chrome, [s * 0.385, 0.95, 0.258]);
  }

  // base rail
  put(new THREE.BoxGeometry(0.93, 0.04, 0.06), C.chrome, [0, 0.12, 0.235]);
  put(new THREE.BoxGeometry(0.93, 0.006, 0.004), C.chromeShade, [0, 0.12, 0.266]);

  // ---------- crest ----------
  const leaf = new THREE.Shape();
  leaf.moveTo(0, 0);
  leaf.quadraticCurveTo(0.028, 0.065, 0, 0.13);
  leaf.quadraticCurveTo(-0.028, 0.065, 0, 0);
  [-0.9, -0.45, 0, 0.45, 0.9].forEach((a, i) => {
    const g = ext(leaf, 0.016, 0, 5);
    const sc = i === 2 ? 1.1 : Math.abs(a) > 0.6 ? 0.85 : 1;
    g.scale(sc, sc, 1);
    put(g, i === 2 ? C.gold : C.chrome, [0, 1.52, 0.09], [0, 0, a]);
  });
  put(new THREE.SphereGeometry(0.02, 10, 8), C.enamel, [0, 1.585, 0.1]);

  // ---------- selection console ----------
  const conQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.4, 0, 0));
  const CON = new THREE.Vector3(0, 0.82, 0.255);
  const onCon = (geo: THREE.BufferGeometry, color: string, lx: number, ly: number, lz: number) => {
    geo.applyQuaternion(conQ);
    const p = new THREE.Vector3(lx, ly, lz).applyQuaternion(conQ).add(CON);
    b.part(geo, color, { at: [p.x, p.y, p.z], bone: root });
  };
  onCon(new THREE.BoxGeometry(0.6, 0.2, 0.1), C.chrome, 0, 0, 0);
  onCon(new THREE.BoxGeometry(0.58, 0.18, 0.004), C.face, 0, 0, 0.051);
  onCon(new THREE.BoxGeometry(0.56, 0.004, 0.002), C.gold, 0, 0.083, 0.054);
  onCon(new THREE.BoxGeometry(0.56, 0.004, 0.002), C.gold, 0, -0.083, 0.054);

  // title cards
  const inkW = [0.05, 0.04, 0.056, 0.034, 0.047, 0.052, 0.038, 0.044, 0.058, 0.036];
  const blueW = [0.034, 0.048, 0.03, 0.052, 0.04, 0.028, 0.05, 0.036, 0.032, 0.046];
  for (let row = 0; row < 2; row++) {
    for (let c = 0; c < 5; c++) {
      const k = row * 5 + c;
      const cx = -0.245 + c * 0.085;
      const cy = row === 0 ? 0.06 : 0.025;
      onCon(new THREE.BoxGeometry(0.082, 0.034, 0.003), C.chromeShade, cx, cy, 0.0535);
      onCon(new THREE.BoxGeometry(0.076, 0.028, 0.002), C.card, cx, cy, 0.0555);
      onCon(new THREE.BoxGeometry(0.07, 0.0025, 0.0012), C.enamel, cx, cy, 0.0568);
      onCon(new THREE.BoxGeometry(inkW[k], 0.003, 0.0012), C.ink, cx - (0.06 - inkW[k]) / 2, cy + 0.007, 0.0568);
      onCon(new THREE.BoxGeometry(blueW[k], 0.003, 0.0012), C.blueInk, cx - (0.06 - blueW[k]) / 2, cy - 0.007, 0.0568);
    }
  }

  // selection buttons: letters (ivory caps) and numbers (red caps)
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 10; i++) {
      const x = -0.255 + i * 0.04;
      const y = row === 0 ? -0.022 : -0.06;
      const r = row === 0 ? 0.0105 : 0.0095;
      onCon(disc(r + 0.004, 0.005), C.chromeShade, x, y, 0.055);
      onCon(disc(r, 0.016), C.chrome, x, y, 0.063);
      onCon(disc(r - 0.002, 0.003), row === 0 ? C.ivory : C.enamel, x, y, 0.072);
    }
  }

  // coin mechanism
  onCon(new THREE.BoxGeometry(0.006, 0.17, 0.008), C.chrome, 0.153, 0, 0.055);
  onCon(new THREE.BoxGeometry(0.115, 0.165, 0.006), C.chrome, 0.225, 0, 0.054);
  const coins = [
    { y: 0.05, r: 0.0065, color: C.copper },
    { y: 0.02, r: 0.0078, color: C.silver },
    { y: -0.01, r: 0.0092, color: C.gold },
  ];
  for (const c of coins) {
    onCon(new THREE.BoxGeometry(0.05, 0.017, 0.004), C.enamel, 0.205, c.y, 0.059);
    onCon(new THREE.BoxGeometry(0.036, 0.0045, 0.003), C.slot, 0.205, c.y, 0.0615);
    onCon(disc(c.r, 0.003), c.color, 0.262, c.y, 0.059);
  }
  onCon(disc(0.016, 0.005), C.chromeShade, 0.205, -0.05, 0.058);
  onCon(disc(0.012, 0.012), C.enamel, 0.205, -0.05, 0.064);
  onCon(new THREE.BoxGeometry(0.044, 0.026, 0.006), C.chromeShade, 0.258, -0.052, 0.058);
  onCon(new THREE.BoxGeometry(0.034, 0.016, 0.004), C.slot, 0.258, -0.052, 0.0605);

  // ---------- speaker grille ----------
  const G = { x: 0, y: 0.42 };
  put(disc(0.205, 0.008, 32), C.fabricOuter, [G.x, G.y, 0.225]);
  put(disc(0.13, 0.008, 28), C.fabric, [G.x, G.y, 0.227]);
  put(new THREE.TorusGeometry(0.205, 0.012, 6, 36), C.chrome, [G.x, G.y, 0.228]);
  put(new THREE.TorusGeometry(0.13, 0.004, 4, 32), C.chrome, [G.x, G.y, 0.234]);
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2 + Math.PI / 24;
    const long = i % 2 === 0;
    const r0 = 0.05;
    const L = long ? 0.142 : 0.08;
    const g = new THREE.BoxGeometry(L, long ? 0.008 : 0.006, 0.006);
    g.translate(r0 + L / 2, 0, 0);
    g.rotateZ(a);
    put(g, long ? C.chrome : C.gold, [G.x, G.y, 0.233]);
  }
  put(ext(starShape(8, 0.058, 0.026), 0.008), C.gold, [G.x, G.y, 0.236]);
  put(disc(0.024, 0.006, 16), C.enamel, [G.x, G.y, 0.246]);
  put(
    new THREE.SphereGeometry(0.014, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2).rotateX(Math.PI / 2),
    C.chrome,
    [G.x, G.y, 0.249],
  );

  // name plaque
  put(new THREE.BoxGeometry(0.26, 0.044, 0.008), C.chrome, [0, 0.174, 0.226]);
  put(new THREE.BoxGeometry(0.244, 0.03, 0.004), C.enamel, [0, 0.174, 0.231]);
  [-0.08, -0.045, -0.01, 0.025, 0.06, 0.09].forEach((x, i) => {
    put(new THREE.BoxGeometry(i % 2 ? 0.026 : 0.034, 0.004, 0.002), C.gold, [x, 0.174 + (i % 2 ? -0.003 : 0.004), 0.234], [0, 0, 0.35]);
  });

  // atomic sparkles on the cream plate
  for (const s of [1, -1]) {
    put(ext(starShape(4, 0.03, 0.007), 0.004), C.gold, [s * 0.28, 0.2, 0.222]);
    put(ext(starShape(4, 0.022, 0.005), 0.004), C.gold, [s * 0.282, 0.67, 0.222]);
    put(ext(starShape(4, 0.012, 0.003), 0.004), C.chrome, [s * 0.255, 0.255, 0.222]);
  }

  // ---------- sides ----------
  for (const s of [1, -1]) {
    const x = s * 0.461;
    put(new THREE.BoxGeometry(0.006, 0.76, 0.11), C.chrome, [x, 0.62, -0.15]);
    put(new THREE.BoxGeometry(0.008, 0.72, 0.078), C.amber, [s * 0.462, 0.62, -0.15]);
    put(new THREE.BoxGeometry(0.01, 0.7, 0.014), C.red, [s * 0.463, 0.62, -0.15]);
    for (const y of [0.4, 0.62, 0.84]) {
      put(new THREE.BoxGeometry(0.012, 0.012, 0.12), C.chrome, [s * 0.464, y, -0.15]);
    }
    put(new THREE.BoxGeometry(0.008, 0.016, 0.28), C.chrome, [x, 0.16, -0.14]);
    put(new THREE.BoxGeometry(0.008, 0.016, 0.28), C.chrome, [x, 1.08, -0.14]);
  }

  return b.root;
}
