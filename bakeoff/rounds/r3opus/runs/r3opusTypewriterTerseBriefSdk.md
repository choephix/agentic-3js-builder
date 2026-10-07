```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Mint Portable Typewriter",
  description:
    "A stylized mid-century portable typewriter: mint enamel body, cream keycaps with chrome rims and tiny letter glyphs, a fanned typebar basket, red/black ribbon spools, a black platen with knurled knobs, and a sheet of paper with typed text.",
};

export default function build() {
  const b = createBuilder({ name: "typewriter" });
  const root = b.joint("root", { at: [0, 0, 0] });

  const R: any = rng(1957);
  const rand = (): number => (typeof R === "function" ? R() : R.next());

  // ---------- palette ----------
  const MINT = "#86cdb8";
  const MINT_DK = "#4e9a88";
  const CREAM = "#f2e8cf";
  const CHROME = "#d5dde3";
  const CHROME_DK = "#8d98a1";
  const BLACK = "#1c1e22";
  const RUBBER = "#2c2b2b";
  const RED = "#d8483a";
  const PAPER = "#fcfbf5";
  const INK = "#2a2a35";
  const GOLD = "#dcaa3e";

  type V = [number, number, number];
  const P = (geo: THREE.BufferGeometry, color: string, at: V = [0, 0, 0]) =>
    b.part(geo, color, { at, bone: root });

  // bar (box) between two points
  const barGeo = (a: V, c: V, w: number, h: number) => {
    const dx = c[0] - a[0], dy = c[1] - a[1], dz = c[2] - a[2];
    const len = Math.hypot(dx, dy, dz);
    const g = new THREE.BoxGeometry(w, h, len);
    g.rotateX(-Math.atan2(dy, Math.hypot(dx, dz)));
    g.rotateY(Math.atan2(dx, dz));
    g.translate((a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2);
    return g;
  };
  const bar = (a: V, c: V, w: number, h: number, color: string) => P(barGeo(a, c, w, h), color);
  // rod (cylinder) between two points
  const rod = (a: V, c: V, r: number, color: string, seg = 6) => {
    const dx = c[0] - a[0], dy = c[1] - a[1], dz = c[2] - a[2];
    const len = Math.hypot(dx, dy, dz);
    const g = new THREE.CylinderGeometry(r, r, len, seg);
    g.rotateX(Math.PI / 2);
    g.rotateX(-Math.atan2(dy, Math.hypot(dx, dz)));
    g.rotateY(Math.atan2(dx, dz));
    g.translate((a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2);
    return P(g, color);
  };
  // cylinder along X
  const cylX = (r: number, len: number, seg: number, color: string, at: V) => {
    const g = new THREE.CylinderGeometry(r, r, len, seg);
    g.rotateZ(Math.PI / 2);
    return P(g, color, at);
  };

  // ---------- body ----------
  const LIFT = 0.012;
  const BEV = 0.006;
  const prof: [number, number][] = [
    [-0.155, 0], [0.205, 0], [0.205, 0.028], [0.055, 0.082],
    [0.035, 0.094], [-0.125, 0.094], [-0.155, 0.078],
  ];
  const shape = new THREE.Shape();
  prof.forEach(([z, y], i) => (i === 0 ? shape.moveTo(z, y) : shape.lineTo(z, y)));
  shape.closePath();
  const DEPTH = 0.39;
  const bodyGeo = new THREE.ExtrudeGeometry(shape, {
    depth: DEPTH, bevelEnabled: true, bevelThickness: BEV, bevelSize: BEV, bevelSegments: 1,
  });
  bodyGeo.rotateY(-Math.PI / 2);
  bodyGeo.translate(DEPTH / 2, LIFT, 0);
  P(bodyGeo, MINT);

  const TOP = 0.094 + LIFT + BEV; // flat top height
  const slopeY = (z: number) =>
    z >= 0.055 ? 0.028 + ((0.205 - z) / 0.15) * 0.054 + LIFT + BEV + 0.0006 : TOP;

  // plinth + rubber feet
  P(new THREE.BoxGeometry(0.416, 0.014, 0.372), MINT_DK, [0, 0.013, 0.025]);
  for (const sx of [-1, 1])
    for (const fz of [-0.135, 0.185]) {
      P(new THREE.CylinderGeometry(0.014, 0.016, 0.008, 8), RUBBER, [sx * 0.175, 0.004, fz]);
    }

  // side chrome stripes with red dot accents
  for (const sx of [-1, 1]) {
    bar([sx * 0.2035, 0.05, -0.14], [sx * 0.2035, 0.05, 0.15], 0.003, 0.006, CHROME);
    bar([sx * 0.2035, 0.04, -0.14], [sx * 0.2035, 0.04, 0.17], 0.003, 0.003, CHROME_DK);
    const dot = new THREE.CylinderGeometry(0.007, 0.007, 0.003, 10);
    dot.rotateZ(Math.PI / 2);
    P(dot, RED, [sx * 0.204, 0.075, -0.1]);
  }

  // front brand badge
  P(new THREE.BoxGeometry(0.1, 0.014, 0.003), GOLD, [0, 0.032, 0.2125]);
  P(new THREE.BoxGeometry(0.092, 0.008, 0.002), BLACK, [0, 0.032, 0.2138]);
  {
    let x = -0.04;
    const ws = [0.006, 0.004, 0.007, 0.005, 0.006, 0.004, 0.007, 0.006];
    for (const w of ws) {
      P(new THREE.BoxGeometry(w, 0.004, 0.0015), GOLD, [x + w / 2, 0.032, 0.2148]);
      x += w + 0.004;
    }
  }

  // ---------- keyboard ----------
  const L: Record<string, number[][]> = {
    T: [[-1, -1, 1, -1], [0, -1, 0, 1]],
    L: [[-1, -1, -1, 1], [-1, 1, 1, 1]],
    H: [[-1, -1, -1, 1], [1, -1, 1, 1], [-1, 0, 1, 0]],
    E: [[-1, -1, -1, 1], [-1, -1, 1, -1], [-1, 0, 0.6, 0], [-1, 1, 1, 1]],
    F: [[-1, -1, -1, 1], [-1, -1, 1, -1], [-1, 0, 0.6, 0]],
    I: [[0, -1, 0, 1]],
    N: [[-1, 1, -1, -1], [-1, -1, 1, 1], [1, 1, 1, -1]],
    V: [[-1, -1, 0, 1], [0, 1, 1, -1]],
    X: [[-1, -1, 1, 1], [-1, 1, 1, -1]],
    Z: [[-1, -1, 1, -1], [1, -1, -1, 1], [-1, 1, 1, 1]],
    A: [[-1, 1, 0, -1], [0, -1, 1, 1], [-0.5, 0.2, 0.5, 0.2]],
    K: [[-1, -1, -1, 1], [1, -1, -1, 0.1], [-0.4, -0.2, 1, 1]],
    M: [[-1, 1, -1, -1], [-1, -1, 0, 0.3], [0, 0.3, 1, -1], [1, -1, 1, 1]],
    Y: [[-1, -1, 0, 0], [1, -1, 0, 0], [0, 0, 0, 1]],
  };
  const ARROW = [[0, 1, 0, -1], [-0.7, -0.3, 0, -1], [0.7, -0.3, 0, -1]];
  const letters = Object.keys(L);

  const key = (x: number, z: number, color: string, rad: number, strokes: number[][], glyphColor: string) => {
    const base = slopeY(z);
    const capB = base + 0.02;
    rod([x, base - 0.006, z], [x, capB, z], 0.0022, CHROME_DK, 5);
    P(new THREE.CylinderGeometry(rad, rad * 0.95, 0.007, 10), color, [x, capB + 0.0035, z]);
    const rim = new THREE.TorusGeometry(rad, 0.0018, 4, 12);
    rim.rotateX(Math.PI / 2);
    P(rim, CHROME, [x, capB + 0.0062, z]);
    const gy = capB + 0.0074;
    const s = rad * 0.38;
    for (const [x1, z1, x2, z2] of strokes) {
      bar([x + x1 * s, gy, z + z1 * s], [x + x2 * s, gy, z + z2 * s], 0.0011, 0.0008, glyphColor);
    }
  };

  const rows = [
    { z: 0.176, n: 10, off: 0 },
    { z: 0.149, n: 11, off: 0.009 },
    { z: 0.122, n: 11, off: 0.0 },
    { z: 0.095, n: 11, off: 0.009 },
  ];
  const SP = 0.028;
  for (const row of rows) {
    for (let i = 0; i < row.n; i++) {
      const x = (i - (row.n - 1) / 2) * SP + row.off;
      const ch = letters[Math.floor(rand() * letters.length)];
      key(x, row.z, CREAM, 0.0105, L[ch], INK);
    }
  }
  // red function keys
  key(-0.162, 0.176, RED, 0.012, ARROW, CREAM); // shift L
  key(0.162, 0.176, RED, 0.012, ARROW, CREAM); // shift R
  key(-0.165, 0.149, RED, 0.011, [[-1, 0, 1, 0], [-1, -1, -1, 1]], CREAM); // shift lock
  key(-0.172, 0.122, RED, 0.011, [[-1, 0, 1, 0], [1, -1, 1, 1]], CREAM); // tab
  key(0.182, 0.095, RED, 0.011, [[1, 0, -1, 0], [-0.3, -0.6, -1, 0], [-0.3, 0.6, -1, 0]], CREAM); // backspace

  // spacebar
  P(new THREE.BoxGeometry(0.21, 0.008, 0.013), CHROME, [0, 0.056, 0.203]);
  P(new THREE.BoxGeometry(0.2, 0.002, 0.009), CREAM, [0, 0.0605, 0.203]);
  for (const sx of [-1, 1]) bar([sx * 0.07, 0.055, 0.2], [sx * 0.07, 0.05, 0.178], 0.006, 0.004, CHROME_DK);

  // ---------- typebar basket ----------
  const BC: V = [0, TOP + 0.0012, -0.045];
  {
    const plate = new THREE.CylinderGeometry(0.095, 0.095, 0.003, 16, 1, false, -Math.PI / 2, Math.PI);
    P(plate, BLACK, BC);
    const seg = new THREE.TorusGeometry(0.088, 0.004, 4, 16, Math.PI);
    seg.rotateX(Math.PI / 2);
    P(seg, CHROME, [BC[0], BC[1] + 0.003, BC[2]]);
    const N = 25;
    for (let i = 0; i < N; i++) {
      const th = THREE.MathUtils.degToRad(-80 + (160 * i) / (N - 1));
      const o: V = [Math.sin(th) * 0.084, BC[1] + 0.004, BC[2] + Math.cos(th) * 0.084];
      const inn: V = [Math.sin(th) * 0.022, BC[1] + 0.012, BC[2] + Math.cos(th) * 0.022];
      bar(o, inn, 0.0032, 0.002, i % 2 ? CHROME : CHROME_DK);
      P(new THREE.BoxGeometry(0.004, 0.004, 0.004), BLACK, inn); // type slug
    }
    // type guide + ribbon vibrator
    P(new THREE.BoxGeometry(0.028, 0.02, 0.004), CHROME, [0, TOP + 0.022, -0.064]);
    P(new THREE.BoxGeometry(0.03, 0.006, 0.003), BLACK, [0, TOP + 0.031, -0.062]);
    P(new THREE.BoxGeometry(0.03, 0.006, 0.003), RED, [0, TOP + 0.025, -0.062]);
  }

  // ribbon spools
  for (const sx of [-1, 1]) {
    const c: V = [sx * 0.138, TOP, -0.045];
    P(new THREE.CylinderGeometry(0.034, 0.036, 0.012, 14), BLACK, [c[0], c[1] + 0.006, c[2]]);
    P(new THREE.CylinderGeometry(0.028, 0.028, 0.006, 14), RED, [c[0], c[1] + 0.015, c[2]]);
    P(new THREE.CylinderGeometry(0.026, 0.026, 0.005, 14), BLACK, [c[0], c[1] + 0.0205, c[2]]);
    const rim = new THREE.TorusGeometry(0.031, 0.003, 4, 14);
    rim.rotateX(Math.PI / 2);
    P(rim, CHROME, [c[0], c[1] + 0.023, c[2]]);
    P(new THREE.CylinderGeometry(0.009, 0.011, 0.008, 8), CHROME, [c[0], c[1] + 0.026, c[2]]);
    P(new THREE.CylinderGeometry(0.003, 0.003, 0.004, 6), BLACK, [c[0], c[1] + 0.031, c[2]]);
    // ribbon strip to the vibrator
    bar([sx * 0.11, c[1] + 0.017, -0.06], [sx * 0.016, TOP + 0.028, -0.061], 0.002, 0.008, BLACK);
  }

  // ---------- carriage ----------
  const PZ = -0.1;
  const PY = TOP + 0.043;
  const PR = 0.03;
  P(new THREE.BoxGeometry(0.36, 0.012, 0.064), MINT_DK, [0, TOP + 0.006, PZ]);
  cylX(0.004, 0.43, 6, CHROME, [0, TOP + 0.004, PZ + 0.036]);
  for (const sx of [-1, 1]) {
    P(new THREE.BoxGeometry(0.012, 0.07, 0.07), MINT, [sx * 0.172, PY - 0.008, PZ]);
    P(new THREE.BoxGeometry(0.0125, 0.012, 0.072), CHROME, [sx * 0.172, PY + 0.02, PZ]);
  }
  // platen
  cylX(PR, 0.33, 16, BLACK, [0, PY, PZ]);
  cylX(0.005, 0.4, 6, CHROME, [0, PY, PZ]);
  for (const sx of [-1, 1]) {
    cylX(0.022, 0.006, 12, CHROME, [sx * 0.182, PY, PZ]);
    cylX(0.025, 0.024, 10, BLACK, [sx * 0.198, PY, PZ]);
    cylX(0.026, 0.004, 10, RUBBER, [sx * 0.198, PY, PZ]);
    cylX(0.013, 0.005, 10, CHROME, [sx * 0.2115, PY, PZ]);
    // carriage release lever
    bar([sx * 0.165, PY + 0.02, PZ + 0.03], [sx * 0.155, PY + 0.04, PZ + 0.05], 0.005, 0.004, CHROME);
    P(new THREE.SphereGeometry(0.006, 6, 4), BLACK, [sx * 0.155, PY + 0.04, PZ + 0.05]);
  }

  // margin scale with ticks and red stops
  const MS: V = [0, TOP + 0.016, -0.058];
  P(new THREE.BoxGeometry(0.31, 0.007, 0.01), CHROME, MS);
  P(new THREE.BoxGeometry(0.3, 0.002, 0.006), CREAM, [0, MS[1] + 0.004, MS[2]]);
  for (let i = 0; i <= 30; i++) {
    const x = -0.145 + i * 0.00967;
    const big = i % 5 === 0;
    P(new THREE.BoxGeometry(0.0012, 0.0008, big ? 0.005 : 0.003), INK, [x, MS[1] + 0.0052, MS[2] - (big ? 0 : 0.001)]);
  }
  for (const x of [-0.1, 0.11]) P(new THREE.BoxGeometry(0.008, 0.008, 0.012), RED, [x, MS[1] + 0.007, MS[2]]);

  // carriage return lever (typist's left = -X)
  {
    const a: V = [-0.18, PY + 0.02, PZ + 0.02];
    const m: V = [-0.225, PY + 0.05, PZ + 0.06];
    const e: V = [-0.225, PY + 0.055, PZ + 0.13];
    P(new THREE.CylinderGeometry(0.008, 0.008, 0.012, 8).rotateZ(Math.PI / 2), CHROME_DK, [-0.18, PY + 0.02, PZ + 0.02]);
    rod(a, m, 0.0035, CHROME);
    rod(m, e, 0.0035, CHROME);
    P(new THREE.CapsuleGeometry(0.007, 0.018, 2, 8).rotateX(Math.PI / 2), BLACK, [e[0], e[1], e[2] + 0.008]);
  }

  // paper rest behind
  {
    const M = new THREE.Matrix4().makeTranslation(0, PY - 0.005, PZ - 0.036)
      .multiply(new THREE.Matrix4().makeRotationX(THREE.MathUtils.degToRad(-25)));
    const g = new THREE.BoxGeometry(0.3, 0.12, 0.004);
    g.translate(0, 0.06, 0);
    g.applyMatrix4(M);
    P(g, MINT_DK);
    const t = new THREE.BoxGeometry(0.3, 0.006, 0.005);
    t.translate(0, 0.12, 0.0005);
    t.applyMatrix4(M);
    P(t, CHROME);
    for (const sx of [-1, 1])
      rod([sx * 0.12, TOP + 0.01, PZ - 0.025], [sx * 0.12, PY, PZ - 0.038], 0.0025, CHROME);
  }

  // ---------- paper ----------
  {
    // wrap around the platen front/top
    const wrap = new THREE.CylinderGeometry(PR + 0.0012, PR + 0.0012, 0.2, 14, 1, true, -Math.PI / 2, Math.PI / 2 + 0.75);
    wrap.rotateZ(-Math.PI / 2);
    P(wrap, PAPER, [0, PY, PZ]);

    const M = new THREE.Matrix4().makeTranslation(0, PY + PR + 0.0012, PZ)
      .multiply(new THREE.Matrix4().makeRotationX(THREE.MathUtils.degToRad(-12)));
    const local = (g: THREE.BufferGeometry, x: number, y: number, z: number) => {
      g.translate(x, y, z);
      g.applyMatrix4(M);
      return g;
    };
    P(local(new THREE.BoxGeometry(0.2, 0.24, 0.0015), 0, 0.12, 0), PAPER);

    // typed text: red title, black body
    const lineH = 0.0022;
    // title
    {
      let x = -0.04;
      for (const w of [0.022, 0.016, 0.03]) {
        P(local(new THREE.BoxGeometry(w, 0.0032, 0.0006), x + w / 2, 0.212, 0.001), RED);
        x += w + 0.005;
      }
    }
    let y = 0.192;
    let lineIdx = 0;
    while (y > 0.05) {
      const paraEnd = lineIdx % 5 === 4;
      const limit = paraEnd ? -0.02 + rand() * 0.06 : 0.078;
      let x = lineIdx % 5 === 0 ? -0.068 : -0.08;
      while (true) {
        const w = 0.007 + rand() * 0.024;
        if (x + w > limit) break;
        P(local(new THREE.BoxGeometry(w, lineH, 0.0006), x + w / 2, y, 0.001), INK);
        x += w + 0.004;
      }
      y -= paraEnd ? 0.02 : 0.0115;
      lineIdx++;
    }
    // line being typed
    {
      let x = -0.08;
      for (const w of [0.014, 0.008, 0.02]) {
        P(local(new THREE.BoxGeometry(w, lineH, 0.0006), x + w / 2, 0.012, 0.001), INK);
        x += w + 0.004;
      }
    }
    // signature scribble near the bottom-right of the text
    P(local(barGeo([0.03, 0.03, 0.001], [0.05, 0.036, 0.001], 0.0012, 0.0006), 0, 0, 0), INK);
    P(local(barGeo([0.05, 0.036, 0.001], [0.062, 0.028, 0.001], 0.0012, 0.0006), 0, 0, 0), INK);

    // paper bail with rubber rollers
    {
      const bail = new THREE.CylinderGeometry(0.0025, 0.0025, 0.32, 6);
      bail.rotateZ(Math.PI / 2);
      P(local(bail, 0, 0.032, 0.006), CHROME);
      for (const x of [-0.06, 0.06]) {
        const r = new THREE.CylinderGeometry(0.0055, 0.0055, 0.014, 8);
        r.rotateZ(Math.PI / 2);
        P(local(r, x, 0.032, 0.006), RUBBER);
      }
      for (const sx of [-1, 1]) {
        P(barGeo([sx * 0.16, PY + 0.035, PZ + 0.001], [sx * 0.168, PY + 0.01, PZ], 0.004, 0.004), CHROME_DK);
      }
    }
  }

  return b.root;
}
```