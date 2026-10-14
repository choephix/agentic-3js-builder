import * as THREE from "three";
import { createBuilder, catmull, bezier, paint, grain, svg } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Gramophone",
  description:
    "A stylized wind-up gramophone: grained walnut cabinet with gilt inlay, felt platter and record, brass gooseneck and a fluted gold-and-oxblood horn.",
};

const WOOD_A = "#5a2a12";
const WOOD_B = "#7d4320";
const WOOD_DARK = "#3a1a0a";
const BRASS = "#d4a23c";
const BRASS_DARK = "#9c6d1e";
const GOLD = "#f0c65a";
const MAROON = "#6e1420";
const MAROON2 = "#4e0c16";
const SILVER = "#c9c9cf";
const FELT = "#1f5a3a";
const VINYL = "#141416";

export default function build() {
  const b = createBuilder({ name: "gramophone" });
  const root = b.joint("base", { at: [0, 0, 0] });

  // ---------- cabinet ----------
  const wood = grain(WOOD_A, WOOD_B, { size: 0.015, axis: "x" });
  const geoBox = (w: number, h: number, d: number, y: number) =>
    new THREE.BoxGeometry(w, h, d).translate(0, y, 0);
  b.part(geoBox(0.36, 0.125, 0.36, 0.0925), wood, { bone: root, at: [0, 0, 0], name: "cabinet" });
  b.part(geoBox(0.385, 0.016, 0.385, 0.028), WOOD_DARK, { bone: root, at: [0, 0, 0], name: "plinth" });
  b.part(geoBox(0.378, 0.012, 0.378, 0.161), WOOD_DARK, { bone: root, at: [0, 0, 0], name: "topMould" });

  // brass corner posts
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.rod([sx * 0.18, 0.036, sz * 0.18], [sx * 0.18, 0.155, sz * 0.18], 0.008, { color: BRASS, sides: 6 });

  // bun feet
  const foot: OutlinePoint[] = [
    [0, 0],
    [0.017, 0],
    [0.023, 0.01],
    [0.017, 0.021],
    [0, 0.021],
  ];
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.lathe(foot, { at: [sx * 0.165, 0, sz * 0.165], segments: 10, color: BRASS_DARK, bone: root });

  // gilt inlay panels
  const panelTex = svg(
    `<svg viewBox="0 0 320 96" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="308" height="84" rx="6" fill="none" stroke="#e2ad48" stroke-width="3.5"/>
      <rect x="15" y="15" width="290" height="66" rx="4" fill="none" stroke="#b07d2a" stroke-width="2.5"/>
      <path d="M30 48 C55 22 85 74 112 48 S 120 30 124 40" fill="none" stroke="#e2ad48" stroke-width="3"/>
      <path d="M290 48 C265 22 235 74 208 48 S 200 30 196 40" fill="none" stroke="#e2ad48" stroke-width="3"/>
      <circle cx="30" cy="48" r="5" fill="#f0c65a"/><circle cx="290" cy="48" r="5" fill="#f0c65a"/>
      <ellipse cx="160" cy="48" rx="36" ry="23" fill="#2a1408" stroke="#f0c65a" stroke-width="3.5"/>
      <text x="160" y="54" font-family="Georgia, serif" font-size="15" font-weight="bold" fill="#f6cf68" text-anchor="middle">ORPHEON</text>
    </svg>`,
    { size: 512 },
  );
  const sideTex = svg(
    `<svg viewBox="0 0 320 96" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="308" height="84" rx="6" fill="none" stroke="#e2ad48" stroke-width="3.5"/>
      <rect x="15" y="15" width="290" height="66" rx="4" fill="none" stroke="#b07d2a" stroke-width="2.5"/>
      <path d="M40 48 C80 18 120 78 160 48 C200 18 240 78 280 48" fill="none" stroke="#e2ad48" stroke-width="3"/>
      <circle cx="160" cy="48" r="7" fill="#f0c65a"/>
    </svg>`,
    { size: 512 },
  );
  b.part(new THREE.PlaneGeometry(0.31, 0.093), "#ffffff", {
    bone: root, at: [0, 0.094, 0.1818], dir: [0, 0, 1], axis: "z", texture: panelTex, name: "panelFront",
  });
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.31, 0.093), "#ffffff", {
      bone: root, at: [s * 0.1818, 0.094, 0], dir: [s, 0, 0], axis: "z", texture: sideTex, name: s > 0 ? "panelL" : "panelR",
    });

  // ---------- crank (model right, -X) ----------
  b.part(new THREE.CylinderGeometry(0.024, 0.026, 0.006, 12), BRASS, {
    bone: root, at: [-0.183, 0.095, 0.05], dir: [-1, 0, 0],
  });
  b.rod([-0.18, 0.095, 0.05], [-0.232, 0.095, 0.05], 0.006, { color: SILVER, sides: 6 });
  b.rod([-0.232, 0.087, 0.05], [-0.236, 0.172, 0.05], 0.006, { color: SILVER, sides: 6 });
  b.capsule([-0.238, 0.168, 0.05], [-0.28, 0.168, 0.05], [0.009, 0.012], { color: WOOD_DARK, sides: 8 });

  // speed knob front-left of the top
  b.part(new THREE.CylinderGeometry(0.012, 0.014, 0.014, 8), BRASS, { bone: root, at: [0.15, 0.174, 0.15], flat: true });

  // ---------- turntable ----------
  b.part(new THREE.CylinderGeometry(0.152, 0.152, 0.012, 28), FELT, { bone: root, at: [0, 0.173, 0], name: "platter" });
  b.part(new THREE.CylinderGeometry(0.146, 0.146, 0.004, 28), VINYL, { bone: root, at: [0, 0.181, 0], name: "record" });
  const grooves = Array.from({ length: 22 }, (_, i) => {
    const r = 36 + i * 2.8;
    return `<circle cx="100" cy="100" r="${r}" fill="none" stroke="${i % 3 ? "#2b2b30" : "#3c3c44"}" stroke-width="1"/>`;
  }).join("");
  const recordTex = svg(
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="100" fill="#141416"/>
      ${grooves}
      <path d="M100 100 L170 40 A92 92 0 0 1 188 70 Z" fill="#ffffff" opacity="0.07"/>
      <circle cx="100" cy="100" r="31" fill="#9c1c24"/>
      <circle cx="100" cy="100" r="27" fill="none" stroke="#f0c65a" stroke-width="1.5"/>
      <text x="100" y="94" font-family="Georgia, serif" font-size="10" font-weight="bold" fill="#f6cf68" text-anchor="middle">ORPHEON</text>
      <text x="100" y="116" font-family="Georgia, serif" font-size="6" fill="#f6cf68" text-anchor="middle">78 R.P.M.</text>
      <circle cx="100" cy="100" r="2.5" fill="#000"/>
    </svg>`,
    { size: 512 },
  );
  b.part(new THREE.CircleGeometry(0.146, 32), "#ffffff", {
    bone: root, at: [0, 0.1836, 0], dir: [0, 1, 0], up: [0, 0, -1], axis: "z", texture: recordTex, name: "recordFace",
  });
  b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.018, 6), SILVER, { bone: root, at: [0, 0.19, 0] });

  // ---------- tone arm & sound box ----------
  const P: [number, number, number] = [-0.13, 0.25, -0.13];
  b.part(new THREE.CylinderGeometry(0.03, 0.036, 0.012, 12), BRASS_DARK, { bone: root, at: [-0.13, 0.173, -0.13] });
  b.rod([-0.13, 0.17, -0.13], P, [0.019, 0.016], { color: BRASS, sides: 10 });
  b.part(new THREE.SphereGeometry(0.025, 10, 8), BRASS, { bone: root, at: P });

  const S = new THREE.Vector3(-0.03, 0.24, 0.07);
  const armEnd: [number, number, number] = [S.x, S.y, S.z - 0.009];
  b.sweep(bezier(P, [-0.125, 0.285, -0.05], [-0.05, 0.27, 0.0], armEnd), [0.014, 0.01], {
    color: BRASS, sides: 8, caps: "flat",
  });
  b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.016, 16), SILVER, {
    bone: root, at: S, dir: [0, 0, 1], name: "soundbox",
  });
  b.part(new THREE.TorusGeometry(0.034, 0.004, 4, 16), BRASS, { bone: root, at: [S.x, S.y, S.z + 0.008], dir: [0, 0, 1], axis: "z" });
  const micaTex = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#c9c9cf"/>
      <circle cx="50" cy="50" r="40" fill="#8a6a3a"/>
      <circle cx="50" cy="50" r="32" fill="none" stroke="#c4a168" stroke-width="3"/>
      <circle cx="50" cy="50" r="20" fill="none" stroke="#6a4c22" stroke-width="3"/>
      <circle cx="50" cy="50" r="6" fill="#e0e0e6"/>
      <path d="M36 30 Q50 24 64 30" stroke="#fff" stroke-width="3" fill="none" opacity="0.5"/>
      ${[0, 90, 180, 270]
        .map((a) => {
          const r = 45, x = 50 + r * Math.cos((a * Math.PI) / 180), y = 50 + r * Math.sin((a * Math.PI) / 180);
          return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="#7a7a80"/>`;
        })
        .join("")}
    </svg>`,
    { size: 192 },
  );
  b.part(new THREE.CircleGeometry(0.031, 16), "#ffffff", {
    bone: root, at: [S.x, S.y, S.z + 0.0095], dir: [0, 0, 1], axis: "z", texture: micaTex,
  });
  b.rod([S.x, S.y - 0.036, S.z + 0.002], [S.x, S.y - 0.02, S.z + 0.002], 0.005, { color: BRASS_DARK, sides: 6 });
  b.spike([S.x, S.y - 0.036, S.z + 0.002], [S.x, 0.1838, S.z + 0.002], null, 0.0025, { color: SILVER, sides: 5 });

  // ---------- horn ----------
  const A = new THREE.Vector3(0.12, 0.6, 0.8).normalize();
  const H0 = new THREE.Vector3(-0.06, 0.42, -0.15);
  const LEN = 0.5;
  const rOut = (h: number) => 0.025 + 0.225 * Math.pow(Math.max(0, Math.min(1, h / LEN)), 2.4);

  const neckPath = catmull([
    P,
    [-0.13, 0.305, -0.175],
    [-0.11, 0.365, -0.2],
    H0.clone().addScaledVector(A, -0.05),
    H0.clone().addScaledVector(A, 0.01),
  ]);
  b.sweep(neckPath, [0.017, 0.024], { color: BRASS, sides: 10, caps: "round" });
  b.along(neckPath, 3, (at) =>
    b.part(new THREE.TorusGeometry(0.023, 0.004, 4, 12), BRASS_DARK, { bone: root, at: at.at, dir: at.axis, axis: "z" }),
  );

  const outline: OutlinePoint[] = [];
  const N = 14;
  for (let i = 0; i <= N; i++) {
    const h = (LEN * i) / N;
    outline.push([rOut(h), h]);
  }
  for (let i = N; i >= 0; i--) {
    const h = (LEN * i) / N;
    outline.push([rOut(h) - 0.006, h]);
  }
  const hornPaint = paint((p, _n, s) => {
    const d = new THREE.Vector3(p.x, p.y, p.z).sub(H0);
    const h = d.dot(A);
    const rad = d.addScaledVector(A, -h).length();
    const inside = rad < rOut(h) - 0.003;
    const deg = ((s[1] % 360) + 360) % 360;
    const k = deg % 30;
    const panel = Math.floor(deg / 30) % 2;
    const seam = k < 1.6 || k > 28.4;
    if (inside) {
      if (seam) return BRASS_DARK;
      return panel ? MAROON : MAROON2;
    }
    if (h > LEN - 0.03) return GOLD;
    if (seam) return BRASS_DARK;
    return panel ? GOLD : BRASS;
  });
  b.lathe(outline, { at: H0, axis: A, segments: 24, color: hornPaint, bone: root, name: "horn" });

  // rolled rim around the mouth
  const U = A.clone().cross(new THREE.Vector3(1, 0, 0)).normalize();
  const V = A.clone().cross(U).normalize();
  const mouth = H0.clone().addScaledVector(A, LEN - 0.002);
  const rimR = rOut(LEN) - 0.002;
  const rimPts = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    return mouth.clone().addScaledVector(U, Math.cos(a) * rimR).addScaledVector(V, Math.sin(a) * rimR);
  });
  b.sweep(catmull(rimPts, { closed: true }), 0.0065, { color: GOLD, sides: 6, bone: root });

  // throat collar where the neck meets the horn
  b.part(new THREE.TorusGeometry(0.027, 0.006, 5, 14), BRASS_DARK, {
    bone: root, at: H0.clone().addScaledVector(A, 0.02), dir: A, axis: "z",
  });

  return b.root;
}
