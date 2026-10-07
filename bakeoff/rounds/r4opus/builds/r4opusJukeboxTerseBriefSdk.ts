import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Jukebox",
  description:
    "A 1940s-style arched jukebox: a wooden cabinet with rainbow bubble-tube arches, marquee bulbs, a record window with a sunburst and tonearm, selector title strips, push buttons, and a chrome-barred speaker grille with a gold music-note medallion.",
};

export default function build() {
  const b = createBuilder({ name: "jukebox" });
  b.joint("root", { at: [0, 0, 0] });

  // ---------- deterministic randomness ----------
  const _r: any = rng(1015);
  const rand = (): number =>
    typeof _r === "function" ? _r() : typeof _r.next === "function" ? _r.next() : _r.float();

  // ---------- palette ----------
  const C = {
    wood: "#8a4320",
    woodDark: "#4a2312",
    woodLight: "#b8682e",
    chrome: "#dfe4ea",
    chromeDark: "#8e98a4",
    gold: "#e8b23a",
    red: "#e0282e",
    amber: "#ff9b21",
    green: "#2fc27a",
    bubble: "#fff6c4",
    bubble2: "#ffe08a",
    bulb: "#fff1c1",
    bulb2: "#ffd23f",
    interior: "#2b1340",
    rayA: "#5a2a7a",
    rayB: "#c8902e",
    vinyl: "#141216",
    groove: "#3a3640",
    shine: "#7a7688",
    labelRed: "#d6232a",
    cream: "#fbf3dc",
    ink: "#2a3a8c",
    fabric: "#6e1222",
    plum: "#3b0f2e",
    black: "#0e0c10",
  };

  // ---------- primitive helpers ----------
  const put = (g: THREE.BufferGeometry, c: string, at: number[]) => b.part(g, c, { at });
  const box = (w: number, h: number, d: number, c: string, at: number[], rotZ = 0) => {
    const g = new THREE.BoxGeometry(w, h, d);
    if (rotZ) g.rotateZ(rotZ);
    return put(g, c, at);
  };
  const cylY = (r: number, h: number, c: string, at: number[], seg = 12) =>
    put(new THREE.CylinderGeometry(r, r, h, seg), c, at);
  const cylZ = (r: number, len: number, c: string, at: number[], seg = 16) => {
    const g = new THREE.CylinderGeometry(r, r, len, seg);
    g.rotateX(Math.PI / 2);
    return put(g, c, at);
  };
  const cylX = (r: number, len: number, c: string, at: number[], seg = 14) => {
    const g = new THREE.CylinderGeometry(r, r, len, seg);
    g.rotateZ(Math.PI / 2);
    return put(g, c, at);
  };
  const ball = (r: number, c: string, at: number[], ws = 8, hs = 6) =>
    put(new THREE.SphereGeometry(r, ws, hs), c, at);
  const arcT = (
    R: number,
    tube: number,
    c: string,
    at: number[],
    arc = Math.PI,
    seg = 28,
    rad = 8,
    rotZ = 0
  ) => {
    const g = new THREE.TorusGeometry(R, tube, rad, seg, arc);
    if (rotZ) g.rotateZ(rotZ);
    return put(g, c, at);
  };
  const rodXY = (a: number[], e: number[], r: number, c: string, z: number) => {
    const dx = e[0] - a[0];
    const dy = e[1] - a[1];
    const L = Math.hypot(dx, dy);
    const g = new THREE.CylinderGeometry(r, r, L, 8);
    g.rotateZ(Math.atan2(-dx, dy));
    return put(g, c, [(a[0] + e[0]) / 2, (a[1] + e[1]) / 2, z]);
  };

  // ---------- key dimensions ----------
  const W = 0.9; // cabinet width
  const D = 0.58; // cabinet depth
  const Z0 = D / 2; // front face z
  const AY = 1.15; // arch centre height
  const AR = 0.45; // arch radius
  const BOT = 0.07; // cabinet bottom

  // ---------- plinth & feet ----------
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      cylY(0.035, 0.02, C.chromeDark, [sx * 0.42, 0.01, sz * 0.27], 12);
    }
  box(0.96, 0.06, 0.64, C.woodDark, [0, 0.045, 0]);
  box(0.96, 0.012, 0.006, C.chrome, [0, 0.05, 0.322]);
  box(0.006, 0.012, 0.64, C.chrome, [0.481, 0.05, 0]);
  box(0.006, 0.012, 0.64, C.chrome, [-0.481, 0.05, 0]);

  // ---------- cabinet body & arch ----------
  box(W, AY - BOT, D, C.wood, [0, (AY + BOT) / 2, 0]);
  {
    const g = new THREE.CylinderGeometry(AR, AR, D, 24, 1, false, Math.PI / 2, Math.PI);
    g.rotateX(Math.PI / 2);
    put(g, C.wood, [0, AY, 0]);
  }
  // chrome edge trim front & back
  for (const z of [Z0, -Z0]) {
    arcT(AR, 0.012, C.chrome, [0, AY, z], Math.PI, 32, 6);
    for (const s of [1, -1]) cylY(0.012, AY - BOT, C.chrome, [s * AR, (AY + BOT) / 2, z], 6);
  }

  // ---------- rainbow arches (bubble tubes) ----------
  const band = (R: number, tube: number, c: string, yB: number, z: number, seg = 32) => {
    arcT(R, tube, c, [0, AY, z], Math.PI, seg, 8);
    const h = AY - yB;
    for (const s of [1, -1]) {
      cylY(tube, h, c, [s * R, yB + h / 2, z], 10);
      cylY(tube * 1.45, 0.035, C.chrome, [s * R, yB, z], 10);
      cylY(tube * 1.7, 0.01, C.chromeDark, [s * R, yB - 0.02, z], 10);
    }
  };
  const zb = 0.3;
  band(0.42, 0.025, C.red, 0.1, zb);
  band(0.37, 0.035, C.amber, 0.1, zb);
  band(0.325, 0.008, C.chrome, 0.62, zb, 28);
  band(0.3, 0.016, C.green, 0.62, zb);

  // bubbles rising in the amber tube
  {
    const R = 0.37;
    const yB = 0.13;
    const h = AY - yB;
    const total = 2 * h + Math.PI * R;
    let u = 0.04;
    let i = 0;
    while (u < total - 0.04) {
      let x: number, y: number, nx: number, ny: number;
      if (u < h) {
        x = R; y = yB + u; nx = 1; ny = 0;
      } else if (u < h + Math.PI * R) {
        const a = (u - h) / R;
        x = R * Math.cos(a); y = AY + R * Math.sin(a); nx = Math.cos(a); ny = Math.sin(a);
      } else {
        x = -R; y = AY - (u - h - Math.PI * R); nx = -1; ny = 0;
      }
      const j = (rand() - 0.5) * 0.026;
      const r = 0.007 + rand() * 0.007;
      ball(r, i % 3 === 0 ? C.bubble2 : C.bubble, [x + nx * j, y + ny * j, zb + 0.027], 7, 5);
      u += 0.03 + rand() * 0.045;
      i++;
    }
  }

  // marquee bulbs along the chrome divider
  {
    const R = 0.325;
    const n = 13;
    for (let i = 0; i < n; i++) {
      const a = ((i + 0.5) / n) * Math.PI;
      ball(0.012, i % 2 ? C.bulb2 : C.bulb, [R * Math.cos(a), AY + R * Math.sin(a), zb + 0.006]);
    }
    let k = 0;
    for (let y = 0.68; y < 1.12; y += 0.07, k++) {
      for (const s of [1, -1]) ball(0.012, k % 2 ? C.bulb : C.bulb2, [s * R, y, zb + 0.006]);
    }
  }

  // crown gem at the apex
  cylZ(0.05, 0.02, C.chrome, [0, AY + 0.42, 0.315], 16);
  arcT(0.05, 0.006, C.gold, [0, AY + 0.42, 0.326], Math.PI * 2, 16, 4);
  {
    const g = new THREE.OctahedronGeometry(0.04, 0);
    g.scale(1, 1.15, 0.6);
    put(g, C.gold, [0, AY + 0.42, 0.335]);
  }

  // ---------- record window ----------
  const WR = 0.285;
  {
    const g = new THREE.CylinderGeometry(WR, WR, 0.006, 20, 1, false, Math.PI / 2, Math.PI);
    g.rotateX(Math.PI / 2);
    put(g, C.interior, [0, AY, 0.293]);
  }
  box(WR * 2, AY - 0.92, 0.006, C.interior, [0, (AY + 0.92) / 2, 0.293]);

  // sunburst behind the record
  const RC = [0, 1.12];
  {
    const n = 17;
    for (let i = 0; i < n; i++) {
      const a = (-30 + (240 * i) / (n - 1)) * (Math.PI / 180);
      const rm = 0.22;
      box(0.011, 0.07, 0.003, i % 2 ? C.rayA : C.rayB,
        [RC[0] + Math.cos(a) * rm, RC[1] + Math.sin(a) * rm, 0.298], a - Math.PI / 2);
    }
  }

  // the record
  cylZ(0.17, 0.008, C.vinyl, [RC[0], RC[1], 0.305], 32);
  for (let R = 0.075; R <= 0.16; R += 0.022)
    arcT(R, 0.0016, C.groove, [RC[0], RC[1], 0.309], Math.PI * 2, 32, 3);
  arcT(0.125, 0.003, C.shine, [RC[0], RC[1], 0.3095], 0.7, 8, 3, 2.0);
  arcT(0.145, 0.003, C.shine, [RC[0], RC[1], 0.3095], 0.5, 8, 3, 2.1 + Math.PI);
  cylZ(0.055, 0.003, C.labelRed, [RC[0], RC[1], 0.3095], 20);
  arcT(0.04, 0.002, C.cream, [RC[0], RC[1], 0.311], Math.PI * 2, 20, 3);
  box(0.05, 0.006, 0.002, C.cream, [RC[0], RC[1] + 0.022, 0.311]);
  box(0.034, 0.005, 0.002, C.gold, [RC[0], RC[1] - 0.024, 0.311]);
  cylZ(0.008, 0.02, C.chrome, [RC[0], RC[1], 0.315], 10);

  // tonearm
  {
    const pivot = [0.21, 1.27];
    const head = [0.11, 1.1];
    cylZ(0.026, 0.012, C.chromeDark, [pivot[0], pivot[1], 0.304], 16);
    cylZ(0.014, 0.024, C.chrome, [pivot[0], pivot[1], 0.316], 12);
    rodXY(pivot, head, 0.006, C.chrome, 0.322);
    const dx = pivot[0] - head[0];
    const dy = pivot[1] - head[1];
    const ang = Math.atan2(-dx, dy);
    box(0.026, 0.042, 0.012, C.chromeDark, [head[0], head[1], 0.322], ang);
    box(0.016, 0.01, 0.006, C.black, [head[0] - dx * 0.12, head[1] - dy * 0.12, 0.316], ang);
    const cw = [pivot[0] + dx * 0.15, pivot[1] + dy * 0.15];
    rodXY(pivot, cw, 0.006, C.chrome, 0.322);
    cylZ(0.015, 0.02, C.chromeDark, [cw[0], cw[1], 0.322], 12);
  }

  // ---------- sill ----------
  box(0.56, 0.025, 0.03, C.chrome, [0, 0.905, 0.3]);
  box(0.13, 0.03, 0.01, C.red, [0, 0.905, 0.318]);
  for (let i = -2; i <= 2; i++) ball(0.004, C.gold, [i * 0.022, 0.905, 0.324], 6, 4);

  // ---------- selection panel ----------
  box(0.54, 0.26, 0.02, C.chrome, [0, 0.76, 0.3]);
  box(0.5, 0.22, 0.004, C.interior, [0, 0.76, 0.311]);
  box(0.008, 0.22, 0.006, C.chrome, [0, 0.76, 0.313]);
  for (let col = 0; col < 2; col++) {
    const cx = col === 0 ? -0.125 : 0.125;
    for (let row = 0; row < 5; row++) {
      const y = 0.85 - row * 0.035;
      box(0.22, 0.029, 0.004, C.cream, [cx, y, 0.314]);
      box(0.2, 0.0025, 0.002, C.labelRed, [cx + 0.008, y + 0.007, 0.3165]);
      const L1 = 0.08 + rand() * 0.1;
      box(L1, 0.003, 0.002, C.ink, [cx - 0.09 + L1 / 2, y - 0.002, 0.3165]);
      const L2 = 0.05 + rand() * 0.09;
      box(L2, 0.003, 0.002, C.ink, [cx - 0.09 + L2 / 2, y - 0.009, 0.3165]);
      box(0.014, 0.022, 0.002, (row + col) % 2 ? C.labelRed : C.gold, [cx - 0.1, y + 0.001, 0.3165]);
    }
  }

  // ---------- selector buttons ----------
  box(0.54, 0.05, 0.04, C.chrome, [0, 0.585, 0.3]);
  box(0.5, 0.034, 0.004, C.chromeDark, [0, 0.585, 0.321]);
  for (let i = 0; i < 10; i++) {
    const x = -0.225 + i * 0.05;
    cylZ(0.017, 0.02, C.cream, [x, 0.585, 0.326], 12);
    cylZ(0.011, 0.004, i % 2 ? C.labelRed : C.ink, [x, 0.585, 0.337], 10);
  }

  // ---------- speaker grille ----------
  box(0.6, 0.42, 0.006, C.fabric, [0, 0.34, 0.292]);
  for (let i = 0; i < 13; i++) {
    const x = -0.28 + (i * 0.56) / 12;
    cylY(0.006, 0.42, C.chrome, [x, 0.34, 0.299], 6);
  }
  box(0.6, 0.03, 0.01, C.chrome, [0, 0.36, 0.304]);
  box(0.6, 0.008, 0.012, C.gold, [0, 0.36, 0.307]);
  // medallion
  cylZ(0.085, 0.014, C.gold, [0, 0.36, 0.31], 20);
  arcT(0.088, 0.008, C.chrome, [0, 0.36, 0.316], Math.PI * 2, 24, 5);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ball(0.006, C.chrome, [Math.cos(a) * 0.07, 0.36 + Math.sin(a) * 0.07, 0.318], 6, 4);
  }
  // beamed music notes
  {
    const heads = [
      [-0.03, 0.325],
      [0.025, 0.335],
    ];
    for (const hpos of heads) {
      const g = new THREE.SphereGeometry(0.016, 10, 6);
      g.scale(1.35, 0.95, 0.5);
      g.rotateZ(0.4);
      put(g, C.plum, [hpos[0], hpos[1], 0.319]);
      box(0.007, 0.075, 0.006, C.plum, [hpos[0] + 0.018, hpos[1] + 0.037, 0.319]);
    }
    rodXY([-0.012, 0.402], [0.043, 0.412], 0.006, C.plum, 0.319);
    rodXY([-0.012, 0.387], [0.043, 0.397], 0.004, C.plum, 0.319);
  }

  // ---------- sides ----------
  for (const s of [1, -1]) {
    box(0.004, 0.86, 0.46, C.woodLight, [s * 0.452, 0.6, 0]);
    box(0.008, 0.74, 0.13, C.chrome, [s * 0.456, 0.62, -0.08]);
    box(0.008, 0.7, 0.1, C.amber, [s * 0.459, 0.62, -0.08]);
    for (const y of [0.4, 0.62, 0.84]) box(0.01, 0.01, 0.13, C.chrome, [s * 0.462, y, -0.08]);
    for (let i = 0; i < 9; i++) {
      const y = 0.29 + rand() * 0.66;
      ball(0.006 + rand() * 0.006, C.bubble, [s * 0.463, y, -0.08 + (rand() - 0.5) * 0.06], 6, 4);
    }
    // feet trim strip on side
    box(0.006, 0.02, 0.5, C.chrome, [s * 0.453, 0.12, 0]);
  }
  // coin plate on the right side (-X)
  box(0.012, 0.15, 0.08, C.chrome, [-0.457, 0.78, 0.17]);
  box(0.006, 0.042, 0.008, C.black, [-0.464, 0.815, 0.17]);
  box(0.006, 0.026, 0.032, C.black, [-0.464, 0.74, 0.17]);
  arcT(0.012, 0.003, C.gold, [-0.4635, 0.86, 0.17], Math.PI * 2, 12, 3);
  // volume knob on the left side (+X)
  cylX(0.03, 0.012, C.chromeDark, [0.458, 0.78, 0.17], 16);
  cylX(0.02, 0.02, C.chrome, [0.468, 0.78, 0.17], 12);
  box(0.004, 0.018, 0.004, C.labelRed, [0.479, 0.79, 0.17]);

  // ---------- back panel ----------
  box(0.78, 0.95, 0.008, C.woodDark, [0, 0.6, -0.293]);
  for (let i = 0; i < 6; i++) box(0.5, 0.018, 0.004, C.black, [0, 0.85 - i * 0.05, -0.298]);
  for (const sx of [1, -1])
    for (const sy of [1, -1]) ball(0.008, C.chrome, [sx * 0.36, 0.6 + sy * 0.44, -0.298], 6, 4);

  return b.root;
}
