import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Emperor Dragonfly",
  description:
    "A stylized emperor dragonfly (Anax imperator) hovering over a little lily pond: electric-blue abdomen with a black dorsal line, apple-green thorax, huge wraparound turquoise eyes, four glassy gold-sheened wings with a dark vein net, and six tucked legs. Rigged with thorax, head, jaw, abdomen tail chain, wing chains and leg chains.",
};

export default function build() {
  const B: any = createBuilder({ name: "emperor_dragonfly" });

  // ---------- units & helpers (all authoring in millimetres) ----------
  const k = 0.001;
  const P = (x: number, y: number, z: number) => [x * k, y * k, z * k];
  const Pv = (v: number[]) => P(v[0], v[1], v[2]);
  const r0: any = rng(7);
  const rand: () => number =
    typeof r0 === "function"
      ? r0
      : r0.next
      ? () => r0.next()
      : r0.float
      ? () => r0.float()
      : () => r0.random();

  const H = 120; // hover height of the body axis (mm)

  // palette
  const BLACK = "#15161a";
  const BLUE = "#1e86ff";
  const BLUE2 = "#2fa4ff";
  const TEAL_BASE = "#45c3c4";
  const GREEN = "#8fd13a";
  const GREEN_DK = "#5f9e2a";
  const EYE = "#22d3c8";
  const EYE_LOW = "#3fbf8f";
  const GLASS = "#f4e3a1";
  const VEIN = "#2a2418";
  const COSTA = "#17120b";
  const STIGMA = "#5a3812";

  function seg(a: number[], b: number[], ra: number, rb: number, color: string, bone: any, sides = 6, open = false) {
    const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const len = Math.hypot(d[0], d[1], d[2]);
    if (len < 1e-4) return null;
    const g = new THREE.CylinderGeometry(rb * k, ra * k, len * k, sides, 1, open);
    return B.part(g, color, {
      at: P((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2),
      bone,
      dir: d,
    });
  }
  function ball(c: number[], r: number, color: string, bone: any, sx = 1, sy = 1, sz = 1, detail = 1) {
    const g = new THREE.IcosahedronGeometry(r * k, detail);
    g.scale(sx, sy, sz);
    return B.part(g, color, { at: Pv(c), bone });
  }
  function box(c: number[], w: number, h: number, d: number, color: string, bone: any) {
    return B.part(new THREE.BoxGeometry(w * k, h * k, d * k), color, { at: Pv(c), bone });
  }

  // ---------- skeleton ----------
  const root = B.joint("root", { at: [0, 0, 0] });
  const thorax = B.joint("thorax", { at: P(0, H, 18), parent: root, role: "spine" });
  const head = B.joint("head", { at: P(0, H + 0.5, 25.5), parent: thorax, role: "head" });
  const jaw = B.joint("jaw", { at: P(0, H - 3, 31.5), parent: head, role: "jaw" });

  // abdomen stations
  const zs = [10, 6, 1, -5, -12, -19, -26, -33, -38, -42, -46];
  const rs = [3.0, 3.4, 2.5, 1.95, 2.05, 2.15, 2.2, 2.25, 2.3, 2.3, 2.0];
  const dy = [0, 0, -0.2, -0.4, -0.6, -0.8, -1.1, -1.5, -2.0, -2.6, -3.3];
  const abd: any[] = [];
  let prev = thorax;
  for (let i = 0; i < zs.length; i++) {
    const nm = i < zs.length - 1 ? `abdomen${i + 1}` : "abdomenTip";
    const j = B.joint(nm, { at: P(0, H + dy[i], zs[i]), parent: prev, role: "tail" });
    abd.push(j);
    prev = j;
  }

  // ---------- thorax ----------
  const TC = [0, H + 0.5, 18];
  ball(TC, 1, GREEN, thorax, 5.2, 6.2, 8, 1);
  ball([0, H + 0.5, 24.2], 2.6, GREEN_DK, thorax, 1.1, 1, 0.9, 1); // prothorax collar
  ball([0, H - 3.5, 18], 1, "#b9e36a", thorax, 3.6, 2.4, 5.5, 1); // pale underside
  // side sutures (black seams) on the ellipsoid surface
  const surfX = (y: number, z: number) => {
    const a = (y - TC[1]) / 6.2, c = (z - TC[2]) / 8;
    return 5.2 * Math.sqrt(Math.max(0, 1 - a * a - c * c)) + 0.05;
  };
  for (const s of [1, -1]) {
    for (const [ya, za, yb, zb] of [
      [3.5, 21, -3, 15.5],
      [3.0, 16, -2.5, 11.5],
    ]) {
      const n = 4;
      for (let i = 0; i < n; i++) {
        const t0 = i / n, t1 = (i + 1) / n;
        const y0 = H + 0.5 + ya + (yb - ya) * t0, z0 = za + (zb - za) * t0;
        const y1 = H + 0.5 + ya + (yb - ya) * t1, z1 = za + (zb - za) * t1;
        seg([s * surfX(y0, z0), y0, z0], [s * surfX(y1, z1), y1, z1], 0.28, 0.28, BLACK, thorax, 4);
      }
    }
    // spiracle dot
    ball([s * surfX(H + 2, 22.5), H + 2, 22.5], 0.5, "#e8e06a", thorax);
  }
  // wing-root plates
  for (const s of [1, -1]) {
    box([s * 2.2, H + 4.9, 20.5], 2.2, 0.8, 3, "#3b5a22", thorax);
    box([s * 2.2, H + 4.6, 15], 2.2, 0.8, 3.4, "#3b5a22", thorax);
  }

  // ---------- head ----------
  for (const s of [1, -1]) {
    const ec = [s * 2.6, H + 1.8, 29];
    ball([s * 2.6, H + 1.0, 29.3], 4.05, EYE_LOW, head, 1, 1, 1, 1);
    ball(ec, 4.3, EYE, head, 1, 1, 1, 2);
    // gleam highlights
    const hd = new THREE.Vector3(s * 0.35, 0.75, 0.55).normalize();
    ball([ec[0] + hd.x * 3.9, ec[1] + hd.y * 3.9, ec[2] + hd.z * 3.9], 0.85, "#effffb", head);
    const hd2 = new THREE.Vector3(s * 0.6, 0.45, 0.65).normalize();
    ball([ec[0] + hd2.x * 4.0, ec[1] + hd2.y * 4.0, ec[2] + hd2.z * 4.0], 0.45, "#effffb", head);
    // pseudopupil
    const pd = new THREE.Vector3(s, 0.1, 0.15).normalize();
    ball([ec[0] + pd.x * 3.5, ec[1] + pd.y * 3.5, ec[2] + pd.z * 3.5], 1.1, "#0b5258", head);
  }
  ball([0, H + 0.8, 25.8], 2.4, "#1d3a2a", head); // occiput
  ball([0, H - 0.6, 32.6], 1, "#bfe04a", head, 3.0, 2.2, 1.6); // frons
  box([0, H + 0.6, 33.9], 2.6, 0.45, 0.5, BLACK, head); // T-mark bar
  box([0, H - 0.3, 34.1], 0.5, 1.6, 0.5, BLACK, head); // T-mark stem
  ball([0, H - 2.6, 33.2], 1, "#e6cf3e", head, 2.2, 1.0, 1.0); // labrum
  for (const s of [1, -1]) {
    seg([s * 1.1, H - 3.0, 33.0], [s * 0.5, H - 4.0, 34.0], 0.5, 0.1, "#2a2a1a", head, 4); // mandibles
    seg([s * 0.8, H + 1.8, 32.8], [s * 1.6, H + 3.4, 34.4], 0.18, 0.15, BLACK, head, 3); // antennae
    seg([s * 1.6, H + 3.4, 34.4], [s * 2.2, H + 4.0, 35.6], 0.15, 0.08, BLACK, head, 3);
    ball([s * 0.9, H + 2.6, 31.8], 0.35, "#f6e27a", head);
  }
  ball([0, H + 2.3, 32.4], 0.4, "#f6e27a", head); // median ocellus
  ball([0, H - 3.9, 32.3], 1, "#d8c86a", jaw, 2.4, 0.9, 1.6); // labium (lower jaw)

  // ---------- abdomen ----------
  for (let i = 0; i < zs.length - 1; i++) {
    const a = [0, H + dy[i], zs[i]], b = [0, H + dy[i + 1], zs[i + 1]];
    const color = i === 0 ? TEAL_BASE : i === 1 ? BLUE2 : BLUE;
    seg(a, b, rs[i], rs[i + 1], color, abd[i], 8);
    const ra = rs[i], rb = rs[i + 1];
    // dorsal black line
    seg([0, a[1] + ra * 0.93, a[2]], [0, b[1] + rb * 0.93, b[2]], 0.42, 0.42, BLACK, abd[i], 4);
    // ventral black line
    seg([0, a[1] - ra * 0.9, a[2]], [0, b[1] - rb * 0.9, b[2]], 0.5, 0.5, BLACK, abd[i], 4);
    // diamond marking towards the rear of each segment
    if (i >= 1) {
      const t = 0.62;
      const rr = ra + (rb - ra) * t;
      const len = Math.abs(a[2] - b[2]);
      const og = new THREE.OctahedronGeometry(1 * k, 0);
      og.scale(rr * 0.55, 0.35, len * 0.24);
      B.part(og, BLACK, {
        at: P(0, a[1] + (b[1] - a[1]) * t + rr * 0.9, a[2] + (b[2] - a[2]) * t),
        bone: abd[i],
      });
    }
    // intersegment ring
    if (i >= 1) {
      const tg = new THREE.TorusGeometry(rs[i] * k, 0.3 * k, 4, 12);
      B.part(tg, BLACK, { at: Pv(a), bone: abd[i] });
    }
  }
  // anal appendages
  const tip = [0, H + dy[dy.length - 1], zs[zs.length - 1]];
  for (const s of [1, -1]) {
    seg([s * 0.7, tip[1] + 0.3, tip[2] + 0.5], [s * 1.7, tip[1] + 0.7, tip[2] - 4.5], 0.5, 0.12, BLACK, abd[abd.length - 2], 4);
  }
  seg([0, tip[1] - 0.6, tip[2] + 0.5], [0, tip[1] - 0.4, tip[2] - 2.5], 0.45, 0.1, BLACK, abd[abd.length - 2], 4);

  // ---------- wings ----------
  const interp = (ch: number[][], x: number) => {
    for (let i = 0; i < ch.length - 1; i++) {
      const a = ch[i], c = ch[i + 1];
      if (x <= c[0]) {
        const t = Math.max(0, Math.min(1, (x - a[0]) / Math.max(1e-6, c[0] - a[0])));
        return a[1] + (c[1] - a[1]) * t;
      }
    }
    return ch[ch.length - 1][1];
  };
  function wing(nm: string, s: number, base: number[], L: number, lead: number[][], trail: number[][]) {
    const midX = L * 0.5;
    const w1 = B.joint(nm + "1", { at: Pv(base), parent: thorax, role: "wing" });
    const w2 = B.joint(nm + "2", {
      at: P(base[0] + s * midX, base[1], base[2] + (interp(lead, midX) + interp(trail, midX)) / 2),
      parent: w1,
      role: "wing",
    });
    const tipZ = lead[lead.length - 1][1];
    B.joint(nm + "3", { at: P(base[0] + s * L, base[1], base[2] + tipZ), parent: w2, role: "wing" });

    // glass membrane
    const outline = lead.concat(trail.slice(0, -1).reverse());
    const shape = new THREE.Shape();
    outline.forEach((p, i) => {
      const X = s * p[0] * k, Y = -p[1] * k;
      if (i === 0) shape.moveTo(X, Y);
      else shape.lineTo(X, Y);
    });
    shape.closePath();
    const mg = new THREE.ExtrudeGeometry(shape, { depth: 0.2 * k, bevelEnabled: false, curveSegments: 1 });
    mg.rotateX(-Math.PI / 2);
    mg.translate(base[0] * k, base[1] * k, base[2] * k);
    B.part(mg, GLASS, { at: [0, 0, 0], bone: w1 });

    const pt = (x: number, f: number) => {
      const lo = interp(lead, x), tr = interp(trail, x);
      return [base[0] + s * x, base[1] + 0.3, base[2] + lo + (tr - lo) * f];
    };
    const boneAt = (x: number) => (x < midX ? w1 : w2);

    // longitudinal veins
    const fr = [0, 0.16, 0.34, 0.54, 0.76, 1];
    const N = 9;
    for (const f of fr) {
      const rad = f === 0 ? 0.32 : f === 1 ? 0.16 : 0.2;
      const col = f === 0 ? COSTA : VEIN;
      for (let i = 0; i < N; i++) {
        const x0 = L * (0.01 + (0.975 * i) / N), x1 = L * (0.01 + (0.975 * (i + 1)) / N);
        seg(pt(x0, f), pt(x1, f), rad, rad, col, boneAt((x0 + x1) / 2), 3, true);
      }
    }
    // cross veins: the fine net
    for (let g = 0; g < fr.length - 1; g++) {
      const cnt = g === fr.length - 2 ? 15 : 12;
      for (let j = 0; j < cnt; j++) {
        const x = L * (0.05 + (0.88 * (j + 0.2 + 0.6 * rand())) / cnt);
        const x2 = Math.min(L * 0.96, Math.max(0.5, x + (rand() - 0.5) * 1.6));
        seg(pt(x, fr[g]), pt(x2, fr[g + 1]), 0.11, 0.11, VEIN, boneAt(x), 3, true);
      }
    }
    // pterostigma and nodus
    seg(pt(L * 0.83, 0.08), pt(L * 0.92, 0.08), 0.6, 0.6, STIGMA, w2, 4);
    ball(pt(L * 0.48, 0.02), 0.45, COSTA, w1);
    // golden sheen at the wing root
    ball(pt(L * 0.03, 0.4), 1, "#c99a3a", w1, 1.2, 0.25, 2.2, 0);
  }

  const foreLead = [[0, 1], [10, 2], [25, 2.5], [40, 2], [47, 0.5], [50, -2.5]];
  const foreTrail = [[0, -1], [2, -3], [8, -6], [18, -8.5], [32, -9], [44, -8], [49, -5.5], [50, -2.5]];
  const hindLead = [[0, 1], [10, 1.5], [25, 2], [38, 1.5], [45, 0], [48, -3]];
  const hindTrail = [[0, -1], [1, -6], [5, -12], [12, -14], [24, -12], [38, -10], [46, -7], [48, -3]];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    wing("forewing" + side, s, [s * 2.2, H + 5.0, 21], 50, foreLead, foreTrail);
    wing("hindwing" + side, s, [s * 2.2, H + 4.4, 15], 48, hindLead, hindTrail);
  }

  // ---------- legs (tucked under the thorax) ----------
  const legPts = [
    [[1.8, H - 4.5, 22], [4.2, H - 7.0, 26], [3.6, H - 10.0, 22], [3.2, H - 11.0, 19]],
    [[2.0, H - 5.0, 18.5], [5.2, H - 7.5, 20], [4.6, H - 10.5, 16], [4.0, H - 11.5, 13]],
    [[2.0, H - 5.0, 15], [5.6, H - 7.5, 14.5], [5.0, H - 10.5, 9], [4.5, H - 11.5, 6]],
  ];
  legPts.forEach((pts, idx) => {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const p = pts.map((v) => [v[0] * s, v[1], v[2]]);
      const hip = B.joint(`hip${side}${idx + 1}`, { at: Pv(p[0]), parent: thorax, role: "leg" });
      const knee = B.joint(`knee${side}${idx + 1}`, { at: Pv(p[1]), parent: hip, role: "leg" });
      const ankle = B.joint(`ankle${side}${idx + 1}`, { at: Pv(p[2]), parent: knee, role: "leg" });
      B.joint(`foot${side}${idx + 1}`, { at: Pv(p[3]), parent: ankle, role: "leg" });
      ball(p[0], 0.8, GREEN_DK, hip);
      seg(p[0], p[1], 0.55, 0.45, BLACK, hip, 5);
      ball(p[1], 0.45, BLACK, knee);
      seg(p[1], p[2], 0.4, 0.3, BLACK, knee, 5);
      seg(p[2], p[3], 0.25, 0.14, BLACK, ankle, 4);
      // tibial spines
      for (const t of [0.35, 0.7]) {
        const q = [p[1][0] + (p[2][0] - p[1][0]) * t, p[1][1] + (p[2][1] - p[1][1]) * t, p[1][2] + (p[2][2] - p[1][2]) * t];
        seg(q, [q[0], q[1] - 0.9, q[2] - 0.6], 0.12, 0.03, BLACK, knee, 3);
      }
      // tiny claw
      seg(p[3], [p[3][0], p[3][1] - 0.4, p[3][2] - 0.9], 0.1, 0.03, BLACK, ankle, 3);
    }
  });

  // ---------- the pond below ----------
  B.part(new THREE.CylinderGeometry(108 * k, 114 * k, 4 * k, 14), "#2c7d93", { at: P(0, 2, 0), bone: root });
  B.part(new THREE.CylinderGeometry(70 * k, 70 * k, 0.6 * k, 12), "#226479", { at: P(0, 4.2, 0), bone: root });
  for (const rr of [12, 22, 33]) {
    const tg = new THREE.TorusGeometry(rr * k, 0.6 * k, 3, 28);
    tg.rotateX(Math.PI / 2);
    B.part(tg, "#a8e3e6", { at: P(0, 4.7, -4), bone: root });
  }
  const stones = ["#8a8f86", "#6f756d", "#a3a497"];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2 + rand() * 0.2;
    const sz = 7 + rand() * 7;
    const rad = 112 + rand() * 6;
    const g = new THREE.DodecahedronGeometry(sz * k, 0);
    g.scale(1.2, 0.7, 1);
    g.rotateY(rand() * Math.PI);
    B.part(g, stones[i % 3], { at: P(Math.cos(a) * rad, sz * 0.35, Math.sin(a) * rad), bone: root });
  }
  const pads = [[60, 50, 16], [-55, 62, 13], [75, -40, 12], [-30, -78, 15], [30, 85, 10]];
  pads.forEach(([x, z, r], i) => {
    const g = new THREE.CylinderGeometry(r * k, r * k, 1 * k, 12, 1, false, 0.45, Math.PI * 2 - 0.45);
    g.rotateY(rand() * Math.PI * 2);
    B.part(g, i % 2 ? "#4f9a3a" : "#5cab44", { at: P(x, 5, z), bone: root });
    B.part(new THREE.CylinderGeometry(r * 0.3 * k, r * 0.3 * k, 1.2 * k, 8), "#7cc25a", { at: P(x, 5.1, z), bone: root });
  });
  // a water lily on the first pad
  {
    const [x, , z] = pads[0];
    const c = [x, 6, z];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const d = [Math.cos(a), 0.9, Math.sin(a)];
      const g = new THREE.ConeGeometry(2.4 * k, 9 * k, 4);
      g.scale(1, 1, 0.45);
      B.part(g, i % 2 ? "#f2a6c6" : "#f7c6da", { at: P(c[0] + d[0] * 3, c[1] + 3.5, c[2] + d[2] * 3), dir: d, bone: root });
    }
    ball([c[0], c[1] + 2, c[2]], 2.2, "#f5d23a", root);
  }
  // reeds and cattails
  const reeds = [[-78, -55, 175, 1], [-90, -40, 140, 0], [-70, -70, 200, 1], [-98, -62, 120, 0], [85, -78, 150, 1]];
  reeds.forEach(([x, z, h, cat]) => {
    const lean = [(rand() - 0.5) * 0.12, 1, (rand() - 0.5) * 0.12];
    const top = [x + lean[0] * h, h, z + lean[2] * h];
    seg([x, 0, z], top, 1.6, 0.9, "#6f9d3c", root, 5);
    if (cat) {
      const t0 = 0.72, t1 = 0.86;
      seg([x + (top[0] - x) * t0, h * t0, z + (top[2] - z) * t0], [x + (top[0] - x) * t1, h * t1, z + (top[2] - z) * t1], 3.6, 3.6, "#6b3f1f", root, 6);
    }
    // leaf blade
    const bladeDir = [(rand() - 0.5) * 0.8, 1, (rand() - 0.5) * 0.8];
    const g = new THREE.ConeGeometry(3 * k, h * 0.6 * k, 4);
    g.scale(1, 1, 0.25);
    B.part(g, "#86b84a", { at: P(x + bladeDir[0] * h * 0.3, h * 0.3, z + bladeDir[2] * h * 0.3), dir: bladeDir, bone: root });
  });

  // ---------- make the wing membranes glassy ----------
  const glass = new THREE.Color(GLASS);
  B.root.traverse((o: any) => {
    if (!o.isMesh) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) {
      if (!m || !m.color) continue;
      if (
        Math.abs(m.color.r - glass.r) < 0.005 &&
        Math.abs(m.color.g - glass.g) < 0.005 &&
        Math.abs(m.color.b - glass.b) < 0.005 &&
        !m.map
      ) {
        m.transparent = true;
        m.opacity = 0.32;
        m.depthWrite = false;
        m.side = THREE.DoubleSide;
        if ("roughness" in m) m.roughness = 0.15;
        if ("metalness" in m) m.metalness = 0.35;
        if (m.emissive) {
          m.emissive.set("#6a5214");
          m.emissiveIntensity = 0.25;
        }
        m.needsUpdate = true;
      }
    }
  });

  return B.root;
}
