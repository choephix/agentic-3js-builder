```ts
import * as THREE from "three";
import { createBuilder, rng, polyline, arc, catmull, paint, grain, mix, noise, cells, svg } from "agentic-3js-builder";

export const meta = {
  name: "Starlite Jukebox",
  description:
    "A 1950s diner jukebox: walnut arch cabinet framed by glowing red, amber and teal tubes, chrome trim, a glass dome over a record stack with its picker arm, lit title cards with chrome selector keys, a coin entry plate and a starburst speaker grille.",
};

export default function build() {
  const b = createBuilder({ name: "jukebox", paintSize: 2048 });
  b.joint("root", { at: [0, 0, 0] });
  const R = rng(1950);

  const YC = 1.12; // centre of the arch
  const FZ = 0.27; // front face of the cabinet

  // ---------- palette & materials ----------
  const CHROME = "#e4e9ef";
  const SATIN = "#b8c0c9";
  const DARK = "#1b1b22";
  const CREAM = "#efe3c6";
  const BRASS = "#d9a640";
  const RED = "#ff2f22";
  const AMBER = "#ffaa18";
  const TEAL = "#1fe3cf";
  const TOPGLOW = "#ffc456";
  const RUBY = "#e0182c";
  const GLASS = "#cdeeff";
  const SHINE = "#fdfdff";

  const chrome = b.material(CHROME);
  chrome.metalness = 0.65;
  chrome.roughness = 0.2;
  const satin = b.material(SATIN);
  satin.metalness = 0.5;
  satin.roughness = 0.35;
  const brass = b.material(BRASS);
  brass.metalness = 0.55;
  brass.roughness = 0.3;
  const glow = (c: string, k: number) => {
    const m = b.material(c);
    m.emissive.set(c);
    m.emissiveIntensity = k;
    m.roughness = 0.3;
    return c;
  };
  glow(RED, 1.1);
  glow(AMBER, 1.1);
  glow(TEAL, 1.1);
  glow(TOPGLOW, 0.8);
  glow(RUBY, 0.7);
  const glass = b.material(GLASS);
  glass.transparent = true;
  glass.opacity = 0.18;
  glass.depthWrite = false;
  glass.roughness = 0.05;
  glass.metalness = 0;
  const shine = b.material(SHINE);
  shine.transparent = true;
  shine.opacity = 0.6;
  shine.depthWrite = false;
  shine.emissive.set("#ffffff");
  shine.emissiveIntensity = 0.5;

  const WOOD = grain("#7d4524", "#552a13", { size: 0.012, axis: "y" });
  const CLOTH = paint((p) => {
    const w = Math.sin(p.x * 900) * Math.sin(p.y * 900);
    const n = noise(p, 0.06, 3);
    return mix(mix("#4a1f1c", "#82402e", w > 0 ? 0.7 : 0.15), "#22090a", 0.4 * n);
  });
  const BACKDROP = paint((p) => {
    const dx = p.x;
    const dy = p.y - YC;
    const d = Math.min(1, Math.hypot(dx, dy) / 0.24);
    const ang = Math.atan2(dy, dx);
    const ray = Math.pow(0.5 + 0.5 * Math.cos(ang * 16), 6);
    let c = mix("#2a9aa8", "#0a1534", Math.min(1, d * 1.15));
    c = mix(c, "#f6c25a", ray * 0.4 * (1 - d));
    const s = cells(p, 0.022, 4);
    if (s.id > 0.55 && s.d1 < 0.08) c = mix(c, "#fff4cc", 0.85);
    return c;
  });
  const RECORD = paint((p) => {
    const r = Math.hypot(p.x + 0.04, p.z - 0.37);
    const groove = 0.5 + 0.5 * Math.sin(r * 2600);
    if (Math.abs(r - 0.058) < 0.0018 || Math.abs(r - 0.072) < 0.0014) return "#34343a";
    return mix("#0b0b0d", "#202024", groove);
  });

  // ---------- plinth & cabinet ----------
  b.part(new THREE.BoxGeometry(0.9, 0.02, 0.62), "#141416", { at: [0, 0.01, 0] });
  b.part(new THREE.BoxGeometry(0.88, 0.045, 0.58), CHROME, { at: [0, 0.0425, 0] });
  b.part(new THREE.BoxGeometry(0.885, 0.008, 0.585), BRASS, { at: [0, 0.062, 0] });

  const archOutline = (r: number, y0: number, n: number) => {
    const pts: [number, number][] = [
      [-r, y0],
      [r, y0],
    ];
    for (let k = 0; k <= n; k++) {
      const a = (k / n) * Math.PI;
      pts.push([r * Math.cos(a), YC + r * Math.sin(a)]);
    }
    return pts;
  };
  b.extrude(archOutline(0.42, 0.06, 20), {
    at: [0, 0, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.54,
    bevel: 0.012,
    color: WOOD,
    name: "cabinet",
  });
  // cream inner face plate inside the arch
  b.extrude(archOutline(0.276, 0.565, 18), {
    at: [0, 0, FZ + 0.002],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.006,
    color: CREAM,
    name: "facePlate",
  });

  // ---------- arch tubes (torus arch + straight legs) ----------
  const archTube = (r: number, z: number, tr: number, color: string, yb: number, seg = 10) => {
    b.part(new THREE.TorusGeometry(r, tr, seg, 64, Math.PI), color, { at: [0, YC, z] });
    for (const s of [1, -1])
      b.part(new THREE.CylinderGeometry(tr, tr, YC - yb, seg), color, { at: [s * r, (YC + yb) / 2, z] });
  };
  archTube(0.4, FZ + 0.006, 0.006, CHROME, 0.12, 8);
  archTube(0.376, FZ + 0.013, 0.016, RED, 0.12, 12);
  archTube(0.338, FZ + 0.013, 0.016, AMBER, 0.12, 12);
  archTube(0.3, FZ + 0.013, 0.016, TEAL, 0.12, 12);
  archTube(0.279, FZ + 0.006, 0.005, CHROME, 0.12, 8);

  // bubbles rising in the tubes
  const bubbleCols: Array<[number, string]> = [
    [0.376, glow("#ffd6a0", 1.0)],
    [0.338, glow("#fff2c0", 1.0)],
    [0.3, glow("#d6fff8", 1.0)],
  ];
  for (const [r, c] of bubbleCols)
    for (const s of [1, -1])
      for (let k = 0; k < 8; k++) {
        const y = 0.2 + (k + R() * 0.8) * 0.11;
        const rad = 0.005 + R() * 0.003;
        b.part(new THREE.SphereGeometry(rad, 8, 6), c, { at: [s * r, y, FZ + 0.013 + 0.0165 - rad * 0.6] });
      }

  // chrome clamps across the tube band
  const clamp = (x: number, y: number, deg: number) => {
    b.part(new THREE.BoxGeometry(0.118, 0.016, 0.01), CHROME, { at: [x, y, FZ + 0.034], rotation: [0, 0, deg] });
    const a = (deg * Math.PI) / 180;
    for (const e of [-0.052, 0.052])
      b.part(new THREE.SphereGeometry(0.0055, 8, 6), BRASS, {
        at: [x + Math.cos(a) * e, y + Math.sin(a) * e, FZ + 0.04],
      });
  };
  for (const s of [1, -1]) for (const y of [0.36, 0.78]) clamp(s * 0.338, y, 0);
  for (const deg of [30, 90, 150]) {
    const a = (deg * Math.PI) / 180;
    clamp(Math.cos(a) * 0.338, YC + Math.sin(a) * 0.338, deg);
  }

  // tube base blocks with collars and jewels
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.15, 0.05, 0.056), CHROME, { at: [s * 0.338, 0.12, FZ + 0.015] });
    b.part(new THREE.BoxGeometry(0.154, 0.006, 0.06), BRASS, { at: [s * 0.338, 0.148, FZ + 0.015] });
    for (const r of [0.376, 0.338, 0.3])
      b.part(new THREE.CylinderGeometry(0.021, 0.021, 0.018, 12), CHROME, { at: [s * r, 0.158, FZ + 0.013] });
    b.part(new THREE.SphereGeometry(0.011, 10, 8), RUBY, { at: [s * 0.338, 0.115, FZ + 0.043], scale: [1, 1, 0.6] });
  }

  // ---------- top: glowing crown band, ribs and finial ----------
  b.part(new THREE.TorusGeometry(0.42, 0.02, 8, 56, Math.PI), TOPGLOW, { at: [0, YC, 0], scale: [1, 1, 3.2] });
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.05, 0.016, 0.15), CHROME, { at: [s * 0.42, YC - 0.004, 0] });
  for (const z of [0.17, -0.17]) {
    b.part(new THREE.TorusGeometry(0.42, 0.008, 6, 56, Math.PI), CHROME, { at: [0, YC, z] });
    for (const s of [1, -1])
      b.part(new THREE.CylinderGeometry(0.008, 0.008, YC - 0.065, 6), CHROME, {
        at: [s * 0.42, (YC + 0.065) / 2, z],
      });
  }
  b.part(new THREE.CylinderGeometry(0.022, 0.034, 0.035, 12), CHROME, { at: [0, 1.567, 0] });
  b.part(new THREE.SphereGeometry(0.02, 12, 8), CHROME, { at: [0, 1.592, 0] });
  b.rod([0, 1.59, 0], [0, 1.645, 0], 0.006, { color: CHROME });
  const star: [number, number][] = [];
  for (let k = 0; k < 10; k++) {
    const a = Math.PI / 2 + (k * Math.PI) / 5;
    const r = k % 2 ? 0.024 : 0.056;
    star.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  b.extrude(star, { at: [0, 1.665, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.016, bevel: 0.004, color: CHROME });
  for (const z of [0.008, -0.008])
    b.part(new THREE.SphereGeometry(0.011, 10, 8), RUBY, { at: [0, 1.665, z], scale: [1, 1, 0.55] });

  // side louvers
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.006, 0.25, 0.26), "#2a1810", { at: [s * 0.419, 0.33, 0] });
    for (let k = 0; k < 5; k++) {
      const y = 0.24 + k * 0.045;
      b.capsule([s * 0.424, y, -0.11], [s * 0.424, y, 0.11], 0.006, { color: CHROME });
    }
  }

  // ---------- dome window ----------
  b.part(new THREE.CircleGeometry(0.24, 40), BACKDROP, { at: [0, YC, FZ + 0.0065] });
  b.part(new THREE.CylinderGeometry(0.178, 0.178, 0.012, 24, 1, false, -Math.PI / 2, Math.PI), CHROME, {
    at: [0, 0.96, FZ],
  });
  b.part(new THREE.CylinderGeometry(0.18, 0.18, 0.004, 24, 1, false, -Math.PI / 2, Math.PI), "#8e1b22", {
    at: [0, 0.967, FZ],
  });
  b.part(new THREE.TorusGeometry(0.245, 0.011, 8, 56), CHROME, { at: [0, YC, FZ + 0.007] });
  b.part(new THREE.SphereGeometry(0.24, 32, 18, 0, Math.PI), GLASS, { at: [0, YC, FZ], name: "domeGlass" });
  const C = new THREE.Vector3(0, YC, FZ);
  const shineArc = (startDeg: number, sweepDeg: number, zf: number, r: number) => {
    const rr = 0.2435;
    const s = Math.sqrt(1 - zf * zf);
    const a = (startDeg * Math.PI) / 180;
    const from = C.clone().add(new THREE.Vector3(Math.cos(a) * s * rr, Math.sin(a) * s * rr, zf * rr));
    b.sweep(arc(C, from, [0, 0, 1], sweepDeg), [r * 0.2, r, r * 0.2], { color: SHINE, sides: 6 });
  };
  shineArc(98, 42, 0.72, 0.004);
  shineArc(150, 14, 0.62, 0.0028);

  // ---------- selection panel ----------
  b.part(new THREE.BoxGeometry(0.52, 0.215, 0.03), CHROME, { at: [0, 0.7275, FZ + 0.02] });
  const songs = [
    ["A1", "SUGAR SHAKE", "The Moonbeams"],
    ["B2", "COMET RIDE", "Rita & the Rays"],
    ["C3", "NEON HEART", "Johnny Chrome"],
    ["D4", "CHERRY POP", "The Fizztones"],
    ["E5", "JIVE TIME", "Big Al Bop"],
    ["F6", "MOON GLOW", "Dot Lacey"],
    ["G7", "HOT ROD GAL", "The Starlites"],
    ["H8", "MILKSHAKE", "Penny Rivers"],
    ["J9", "BLUE DINER", "Sonny Teal"],
    ["K0", "ROCKET BOP", "Cat Amberly"],
  ];
  let cardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 100"><rect width="460" height="100" fill="#26262e"/>`;
  songs.forEach(([code, title, artist], i) => {
    const x = 5 + (i % 5) * 90;
    const y = 4 + Math.floor(i / 5) * 48;
    const band = i < 5 ? "#d33a2c" : "#1f8f8a";
    cardSvg +=
      `<rect x="${x}" y="${y}" width="86" height="44" rx="2" fill="#fbf2d8" stroke="#bfa772" stroke-width="1"/>` +
      `<rect x="${x}" y="${y}" width="86" height="10" fill="${band}"/>` +
      `<text x="${x + 4}" y="${y + 8}" font-family="Arial, Helvetica, sans-serif" font-size="7.5" font-weight="bold" fill="#ffffff">${code}</text>` +
      `<text x="${x + 82}" y="${y + 8}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="6" fill="#ffffff">45 RPM</text>` +
      `<text x="${x + 43}" y="${y + 23}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="8.5" font-weight="bold" fill="#1d1d1d">${title}</text>` +
      `<line x1="${x + 10}" y1="${y + 28}" x2="${x + 76}" y2="${y + 28}" stroke="${band}" stroke-width="0.8"/>` +
      `<text x="${x + 43}" y="${y + 38}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="7.5" fill="#6b2a1e">${artist}</text>`;
  });
  cardSvg += `</svg>`;
  const cardTex = svg(cardSvg, { size: 1024 });
  const cards = b.part(new THREE.PlaneGeometry(0.46, 0.1), "#ffffff", {
    at: [0, 0.782, FZ + 0.0355],
    texture: cardTex,
    name: "titleCards",
  });
  const cardMat = cards.mesh.material as THREE.MeshStandardMaterial;
  cardMat.emissive.set("#ffffff");
  cardMat.emissiveMap = cardTex;
  cardMat.emissiveIntensity = 0.45;
  b.sweep(
    polyline(
      [
        [0, 0.729, FZ + 0.036],
        [0.235, 0.729, FZ + 0.036],
        [0.235, 0.835, FZ + 0.036],
        [-0.235, 0.835, FZ + 0.036],
        [-0.235, 0.729, FZ + 0.036],
      ],
      { closed: true },
    ),
    0.004,
    { color: CHROME, sides: 6 },
  );

  b.part(new THREE.BoxGeometry(0.48, 0.088, 0.006), DARK, { at: [0, 0.682, FZ + 0.036] });
  const keyXs = Array.from({ length: 10 }, (_, i) => -0.207 + i * 0.046);
  const rows: Array<{ y: number; key: string; text: string; labels: string[] }> = [
    { y: 0.703, key: "#f3ead2", text: "#2b1a12", labels: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"] },
    { y: 0.661, key: "#c8202a", text: "#fff6e6", labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"] },
  ];
  for (const row of rows) {
    for (const x of keyXs) {
      b.part(new THREE.BoxGeometry(0.038, 0.034, 0.008), CHROME, { at: [x, row.y, FZ + 0.04] });
      b.part(new THREE.BoxGeometry(0.03, 0.026, 0.012), row.key, { at: [x, row.y, FZ + 0.045] });
    }
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 44">`;
    row.labels.forEach((l, i) => {
      s += `<text x="${23 + i * 46}" y="29" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="18" fill="#000000">${l}</text>`;
    });
    s += `</svg>`;
    b.part(new THREE.PlaneGeometry(0.46, 0.044), row.text, {
      at: [0, row.y, FZ + 0.0512],
      texture: svg(s, { size: 512 }),
    });
  }

  // ---------- coin entry ----------
  b.part(new THREE.BoxGeometry(0.5, 0.036, 0.026), CHROME, { at: [0, 0.585, FZ + 0.015] });
  b.extrude(
    [
      [-0.09, -0.016],
      [0.09, -0.016],
      [0.09, 0.016],
      [-0.09, 0.016],
    ],
    { at: [0, 0.585, FZ + 0.032], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.01, bevel: 0.003, smoothing: 2, color: SATIN },
  );
  const slotXs = [-0.055, -0.015, 0.025];
  for (const x of slotXs) {
    b.part(new THREE.BoxGeometry(0.03, 0.009, 0.004), CHROME, { at: [x, 0.592, FZ + 0.0365] });
    b.part(new THREE.BoxGeometry(0.022, 0.0035, 0.004), "#050506", { at: [x, 0.592, FZ + 0.0385] });
  }
  b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.01, 14), RUBY, { at: [0.066, 0.587, FZ + 0.038], rotation: [90, 0, 0] });
  b.part(
    new THREE.PlaneGeometry(0.18, 0.012),
    "#ffffff",
    {
      at: [0, 0.5765, FZ + 0.0375],
      texture: svg(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 12">` +
          `<text x="35" y="10" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="9" fill="#c0281e">5¢</text>` +
          `<text x="75" y="10" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="9" fill="#c0281e">10¢</text>` +
          `<text x="115" y="10" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="9" fill="#c0281e">25¢</text>` +
          `<text x="156" y="10" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="7" fill="#c0281e">RETURN</text>` +
          `</svg>`,
        { size: 512 },
      ),
    },
  );

  // ---------- speaker grille with starburst ----------
  const GY = 0.355;
  b.part(new THREE.BoxGeometry(0.48, 0.38, 0.016), CLOTH, { at: [0, GY, FZ + 0.008], name: "grilleCloth" });
  b.sweep(
    polyline(
      [
        [0, GY - 0.195, FZ + 0.017],
        [0.245, GY - 0.195, FZ + 0.017],
        [0.245, GY + 0.195, FZ + 0.017],
        [-0.245, GY + 0.195, FZ + 0.017],
        [-0.245, GY - 0.195, FZ + 0.017],
      ],
      { closed: true },
    ),
    0.008,
    { color: CHROME },
  );
  const hw = 0.232;
  const hh = 0.182;
  for (let k = 0; k < 16; k++) {
    const a = (k * Math.PI) / 8;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const edge = Math.min(Math.abs(c) > 1e-6 ? hw / Math.abs(c) : 9, Math.abs(s) > 1e-6 ? hh / Math.abs(s) : 9);
    const len = k % 2 ? edge * 0.58 : edge - 0.006;
    const p0: [number, number, number] = [c * 0.045, GY + s * 0.045, FZ + 0.021];
    const p1: [number, number, number] = [c * len, GY + s * len, FZ + 0.021];
    b.rod(p0, p1, [0.0058, 0.0022], { color: CHROME, sides: 6 });
    if (k % 2) b.part(new THREE.SphereGeometry(0.0065, 8, 6), BRASS, { at: p1 });
  }
  b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.012, 20), CHROME, { at: [0, GY, FZ + 0.023], rotation: [90, 0, 0] });
  b.part(new THREE.TorusGeometry(0.056, 0.004, 6, 32), AMBER, { at: [0, GY, FZ + 0.022] });
  b.part(new THREE.TorusGeometry(0.027, 0.004, 6, 24), BRASS, { at: [0, GY, FZ + 0.03] });
  b.part(new THREE.SphereGeometry(0.021, 14, 10), RUBY, { at: [0, GY, FZ + 0.03], scale: [1, 1, 0.6] });

  // nameplate
  b.part(new THREE.BoxGeometry(0.27, 0.042, 0.012), CHROME, { at: [0, 0.11, FZ + 0.006] });
  const plate = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 32">` +
      `<rect x="1" y="1" width="248" height="30" rx="15" fill="#15151c" stroke="#e8c76a" stroke-width="2"/>` +
      `<polygon points="40,8 43,15 50,16 43,18 40,25 37,18 30,16 37,15" fill="#e8c76a"/>` +
      `<polygon points="210,8 213,15 220,16 213,18 210,25 207,18 200,16 207,15" fill="#e8c76a"/>` +
      `<text x="125" y="23" text-anchor="middle" font-family="Brush Script MT, Georgia, serif" font-style="italic" font-weight="bold" font-size="22" fill="#ff5a3c">Starlite</text>` +
      `</svg>`,
    { size: 512 },
  );
  const np = b.part(new THREE.PlaneGeometry(0.25, 0.032), "#ffffff", { at: [0, 0.11, FZ + 0.0125], texture: plate });
  const npMat = np.mesh.material as THREE.MeshStandardMaterial;
  npMat.emissive.set("#ffffff");
  npMat.emissiveMap = plate;
  npMat.emissiveIntensity = 0.35;

  // ---------- mechanism joints (built last so static parts ride the root) ----------
  const TT: [number, number, number] = [-0.04, 0.972, 0.37];
  b.joint("turntable", { at: TT, dir: [0, 1, 0], parent: "root", group: "mechanism" });
  b.joint("picker", { at: [0.14, 0.966, 0.34], dir: [0, 1, 0], parent: "root", group: "mechanism" });

  // record stack
  b.part(new THREE.CylinderGeometry(0.088, 0.091, 0.012, 28), SATIN, { at: TT, bone: "turntable" });
  b.part(new THREE.CylinderGeometry(0.084, 0.084, 0.003, 28), "#2a2a2c", { at: [TT[0], 0.979, TT[2]], bone: "turntable" });
  const labels = ["#d63a2c", "#f2b632", "#2ab3a6", "#f4ecd6"];
  for (let i = 0; i < 8; i++) {
    const y = 0.99 + i * 0.0105;
    b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.0035, 32), RECORD, { at: [TT[0], y, TT[2]], bone: "turntable" });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.0039, 20), labels[i % 4], {
      at: [TT[0], y, TT[2]],
      bone: "turntable",
    });
  }
  b.rod([TT[0], 0.97, TT[2]], [TT[0], 1.15, TT[2]], 0.004, { color: CHROME, bone: "turntable", sides: 6 });
  b.part(new THREE.SphereGeometry(0.007, 8, 6), CHROME, { at: [TT[0], 1.152, TT[2]], bone: "turntable" });

  // overhang balance arm resting on the stack
  b.rod([-0.16, 0.966, 0.32], [-0.16, 1.1, 0.32], 0.006, { color: CHROME, bone: "root", sides: 6 });
  b.sweep(
    catmull([
      [-0.16, 1.1, 0.32],
      [-0.105, 1.1, 0.35],
      [-0.062, 1.075, 0.37],
    ]),
    0.0045,
    { color: CHROME, bone: "root", sides: 6 },
  );
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.004, 14), "#2a2a2c", { at: [-0.062, 1.068, 0.37], bone: "root" });
  b.part(new THREE.CylinderGeometry(0.014, 0.016, 0.01, 12), BRASS, { at: [-0.16, 0.971, 0.32], bone: "root" });

  // picker arm: geared post, reaching arm with gripper fingers, counterweight, lamp
  const PX = 0.14;
  const PZ = 0.34;
  b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.01, 14), BRASS, { at: [PX, 0.975, PZ], bone: "picker" });
  for (let k = 0; k < 14; k++) {
    const a = (k / 14) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.008, 0.01, 0.006), BRASS, {
      at: [PX + Math.cos(a) * 0.028, 0.975, PZ + Math.sin(a) * 0.028],
      rotation: [0, (-a * 180) / Math.PI, 0],
      bone: "picker",
    });
  }
  b.rod([PX, 0.97, PZ], [PX, 1.09, PZ], 0.007, { color: CHROME, bone: "picker", sides: 8 });
  b.part(new THREE.SphereGeometry(0.011, 10, 8), CHROME, { at: [PX, 1.088, PZ], bone: "picker" });
  b.part(new THREE.SphereGeometry(0.006, 8, 6), AMBER, { at: [PX, 1.1, PZ], bone: "picker" });
  b.sweep(
    catmull([
      [PX, 1.086, PZ],
      [0.125, 1.082, 0.385],
      [0.075, 1.066, 0.405],
    ]),
    0.0048,
    { color: CHROME, bone: "picker", sides: 6 },
  );
  b.part(new THREE.BoxGeometry(0.02, 0.016, 0.024), DARK, { at: [0.068, 1.064, 0.405], bone: "picker" });
  for (const y of [1.0595, 1.0675])
    b.part(new THREE.BoxGeometry(0.018, 0.003, 0.012), CHROME, { at: [0.052, y, 0.405], bone: "picker" });
  b.rod([PX, 1.086, PZ], [0.162, 1.088, 0.312], 0.004, { color: CHROME, bone: "picker", sides: 6 });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.018, 12), SATIN, {
    at: [0.165, 1.088, 0.308],
    rotation: [90, 0, -35],
    bone: "picker",
  });

  return b.root;
}
```