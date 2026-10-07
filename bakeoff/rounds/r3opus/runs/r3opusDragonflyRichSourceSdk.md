```ts
import * as THREE from "three";
import { createBuilder, paint, mix, smoothstep, svg, catmull, rng } from "agentic-3js-builder";

export const meta = {
  name: "Emperor Dragonfly",
  description:
    "An emperor dragonfly (Anax imperator) hovering about 8 cm above the water. It has an electric-blue abdomen with a black dorsal line, an apple-green thorax, glossy wraparound turquoise eyes, and four iridescent glassy wings with a fine net of dark veins. Its six spiny legs are tucked into a basket under the thorax.",
};

const H = 0.08; // hover height of the thorax centre

type WingSpec = { L: number; c: number; base: number; lobe: number };

function wingEdges(spec: WingSpec) {
  const hw = (s: number) =>
    0.5 * spec.c * (spec.base + (1 - spec.base) * smoothstep(0, 0.3, s)) * Math.sqrt(Math.max(0, 1 - Math.pow(s, 5)));
  const mid = (s: number) => spec.c * 0.06 * s;
  const le = (s: number) => mid(s) + hw(s) * 0.9;
  const te = (s: number) => mid(s) - hw(s) * (1.1 + spec.lobe * Math.exp(-(((s - 0.15) / 0.15) ** 2)));
  return { le, te };
}

function wingOutline(spec: WingSpec) {
  const { le, te } = wingEdges(spec);
  const N = 30;
  const ss = Array.from({ length: N + 1 }, (_, i) => Math.sin(((i / N) * Math.PI) / 2));
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= N; i++) pts.push([ss[i] * spec.L, le(ss[i])]);
  for (let i = N - 1; i >= 0; i--) pts.push([ss[i] * spec.L, te(ss[i])]);
  const ys = pts.map((p) => p[1]);
  return { pts, ymin: Math.min(...ys), ymax: Math.max(...ys), le, te, ss };
}

function wingGeometry(pts: Array<[number, number]>, L: number, ymin: number, ymax: number) {
  const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ShapeGeometry(shape);
  const pos = g.getAttribute("position");
  const uv = g.getAttribute("uv");
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / L, (pos.getY(i) - ymin) / (ymax - ymin));
  uv.needsUpdate = true;
  return g;
}

function wingSvg(spec: WingSpec, seed: number) {
  const o = wingOutline(spec);
  const { le, te, ymin, ymax } = o;
  const W = 1000;
  const Hh = Math.round((W * (ymax - ymin)) / spec.L);
  const X = (s: number) => (s * W).toFixed(1);
  const Y = (y: number) => (((ymax - y) / (ymax - ymin)) * Hh).toFixed(1);
  const at = (s: number, f: number) => `${X(s)},${Y(le(s) + f * (te(s) - le(s)))}`;
  const r = rng(seed);
  const parts: string[] = [];

  // outline
  parts.push(
    `<polygon points="${o.pts.map(([x, y]) => `${X(x / spec.L)},${Y(y)}`).join(" ")}" stroke-width="3"/>`,
  );
  // costa (thick leading edge)
  const costa = o.ss.filter((s) => s < 0.99).map((s) => at(s, 0));
  parts.push(`<polyline points="${costa.join(" ")}" stroke-width="7"/>`);
  // longitudinal veins
  const F = [0.05, 0.13, 0.24, 0.37, 0.52, 0.68, 0.84];
  for (const f of F) {
    const line = Array.from({ length: 32 }, (_, i) => at((i / 31) * 0.975, f));
    parts.push(`<polyline points="${line.join(" ")}" stroke-width="${f < 0.3 ? 3.4 : 2.6}"/>`);
  }
  // cross veins: the fine net
  const fr = [0, ...F, 1];
  for (let g = 0; g < fr.length - 1; g++) {
    const step = 0.016 + 0.004 * (g % 3);
    for (let s = 0.02 + r() * 0.01; s < 0.965; s += step * (0.7 + 0.6 * r())) {
      const s2 = Math.min(0.97, s + (r() - 0.5) * 0.014);
      parts.push(`<line x1="${at(s, fr[g]).split(",")[0]}" y1="${at(s, fr[g]).split(",")[1]}" x2="${at(s2, fr[g + 1]).split(",")[0]}" y2="${at(s2, fr[g + 1]).split(",")[1]}" stroke-width="1.8"/>`);
    }
  }
  // forked branch veins toward the trailing edge
  for (let a = 0.04; a < 0.8; a += 0.06 + r() * 0.02) {
    const [x0, y0] = at(a, 0.84).split(",");
    const [cx, cy] = at(a + 0.02, 0.93).split(",");
    const [x1, y1] = at(a + 0.06, 1).split(",");
    parts.push(`<path d="M${x0},${y0} Q${cx},${cy} ${x1},${y1}" stroke-width="2"/>`);
  }
  // nodus
  {
    const [x0, y0] = at(0.47, 0).split(",");
    const [x1, y1] = at(0.48, 0.3).split(",");
    parts.push(`<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke-width="4.5"/>`);
  }
  // pterostigma
  const ptero = `<polygon points="${[at(0.8, 0.0), at(0.875, 0.0), at(0.875, 0.11), at(0.8, 0.11)].join(" ")}" fill="#7a5418" stroke="#2a1c0a" stroke-width="2.5"/>`;

  const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${Hh}"><g fill="none" stroke="#1d1b14" stroke-linecap="round" stroke-linejoin="round">${parts.join("")}</g>${ptero}</svg>`;
  return { texture: svg(markup, { size: 1024 }), outline: o };
}

export default function build() {
  const b = createBuilder({ name: "emperorDragonfly", paintSize: 1024 });

  // ---------------- skeleton core
  b.joint("thorax", { at: [0, H, 0], dir: [0, 0, 1], role: "spine" });
  b.joint("head", { at: [0, H + 0.0005, 0.0072], dir: [0, 0, 1], parent: "thorax", role: "head" });
  b.joint("jaw", { at: [0, H - 0.0022, 0.011], dir: [0, -0.6, 0.8], parent: "head", role: "jaw" });

  // ---------------- paints
  const BLUE = "#1f9cff";
  const BLUE_L = "#5ad4ff";
  const BLACK = "#0b0d14";
  const BELLY = "#0f3f86";
  const TEAL = "#3cc9b4";

  const abdPaint = paint((p, n, s) => {
    const t = s[0];
    const deg = s[1];
    const dd = Math.min(deg, 360 - deg);
    if (t > 0.985) return BLACK;
    const seg = t * 10;
    const k = Math.floor(seg);
    const u = seg - k;
    const base = k < 2 ? mix(TEAL, BLUE, smoothstep(0.5, 2, seg)) : mix(BLUE_L, BLUE, smoothstep(30, 90, dd));
    const col = mix(base, BELLY, smoothstep(110, 155, dd));
    if (k >= 1 && u < 0.05) return BLACK;
    let w = 0;
    if (k === 1) w = 8 + 22 * smoothstep(0.5, 1, u);
    else if (k >= 2) w = 15 + 48 * Math.pow(smoothstep(0.25, 1, u), 1.5);
    if (k >= 8) w += 30;
    if (dd < w) return BLACK;
    if (k >= 2 && Math.abs(dd - 96) < 6) return BLACK;
    return col;
  });

  const thoraxPaint = paint((p, n) => {
    const y = p.y - H;
    const q = p.z + 0.6 * y;
    if (Math.abs(p.x) > 0.0018 && (Math.abs(q - 0.0012) < 0.0003 || Math.abs(q + 0.0022) < 0.0003)) return "#2c4a1a";
    if (Math.abs(p.x) < 0.00028 && n.y > 0.4 && p.z > -0.004) return "#3d5c22";
    if (p.z < -0.0052) return mix("#5f9e2a", "#1a2a14", smoothstep(-0.0052, -0.0068, p.z));
    return mix("#9be04a", "#5c9a28", smoothstep(0.3, -0.7, n.y));
  });

  const fronsPaint = paint((p) =>
    p.y > H + 0.0008 ? "#14301f" : mix("#a6d040", "#e2e650", smoothstep(H - 0.003, H + 0.0004, p.y)),
  );

  // ---------------- thorax
  b.loft(
    [
      { at: [0, H + 0.0003, 0.0068], w: 0.0034, h: 0.0034 },
      { at: [0, H + 0.0003, 0.005], w: 0.007, h: 0.0075 },
      { at: [0, H + 0.0006, 0.0015], w: 0.0086, h: 0.0098 },
      { at: [0, H + 0.0003, -0.0025], w: 0.008, h: 0.0092 },
      { at: [0, H, -0.0062], w: 0.0048, h: 0.0052 },
    ],
    { color: thoraxPaint, bone: "thorax", sides: 12 },
  );

  // ---------------- abdomen
  const abdPath = catmull([
    [0, H + 0.0003, -0.0055],
    [0, H - 0.0002, -0.018],
    [0, H - 0.001, -0.032],
    [0, H - 0.002, -0.046],
    [0, H - 0.003, -0.0605],
  ]);
  const abd = b.chain("abd", abdPath, { count: 6, role: "tail", parent: "thorax", names: (i) => `abd${i + 1}` });
  const kt = [0, 0.05, 0.12, 0.17, 0.3, 0.8, 0.92, 1];
  const kr = [0.0023, 0.0026, 0.0014, 0.0013, 0.0015, 0.0015, 0.0017, 0.0011];
  const abdR = (t: number): [number, number] => {
    let i = 0;
    while (i < kt.length - 2 && kt[i + 1] <= t) i++;
    const f = Math.min(Math.max((t - kt[i]) / (kt[i + 1] - kt[i]), 0), 1);
    const r = kr[i] + (kr[i + 1] - kr[i]) * f;
    return [r, r * 1.12];
  };
  b.sweep(abd, abdR, { color: abdPaint, sides: 10 });
  const tip = abdPath.at(1);
  for (const sx of [1, -1]) {
    b.spike(
      [sx * 0.0004, tip.y + 0.0002, tip.z + 0.0006],
      [sx * 0.0011, tip.y + 0.0003, tip.z - 0.0042],
      null,
      0.00032,
      { color: "#101014", bone: "abd6", sides: 5 },
    );
  }
  b.spike([0, tip.y - 0.0003, tip.z + 0.0004], [0, tip.y - 0.0006, tip.z - 0.0018], null, 0.00028, {
    color: "#101014",
    bone: "abd6",
    sides: 5,
  });

  // ---------------- head
  b.part(new THREE.SphereGeometry(0.0027, 10, 8), "#24382a", { at: [0, H + 0.0004, 0.0074], bone: "head" });

  const eyeMat = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.18,
    metalness: 0.0,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  });
  const cTeal = new THREE.Color("#22c9d4");
  const cBlue = new THREE.Color("#2a86e0");
  const cGreen = new THREE.Color("#5ae0a4");
  const cDark = new THREE.Color("#0e4a66");
  for (const sx of [1, -1]) {
    const R = 0.0036;
    const geo = new THREE.SphereGeometry(R, 18, 13);
    const pos = geo.getAttribute("position");
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = (pos.getX(i) / R) * sx;
      const y = pos.getY(i) / R;
      const z = pos.getZ(i) / R;
      c.copy(cTeal).lerp(cBlue, smoothstep(-0.1, 0.85, y));
      c.lerp(cGreen, smoothstep(-0.2, -0.9, y) * 0.8);
      // a soft dark pseudopupil looking outward-forward
      const look = new THREE.Vector3(0.75, 0.15, 0.65).normalize();
      const d = x * look.x + y * look.y + z * look.z;
      c.lerp(cDark, smoothstep(0.88, 0.97, d) * 0.7);
      colors.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    const eye = b.part(geo, "#22c9d4", {
      at: [sx * 0.0025, H + 0.0013, 0.0099],
      bone: "head",
      scale: [0.95, 1, 1.05],
    });
    eye.mesh.material = eyeMat;
  }
  // yellow vertex spot where the eyes meet
  b.part(new THREE.SphereGeometry(0.0006, 8, 6), "#e6d24a", { at: [0, H + 0.0037, 0.0079], bone: "head" });
  // ocelli
  for (const sx of [-1, 0, 1])
    b.part(new THREE.SphereGeometry(0.00022, 6, 4), "#2a2014", {
      at: [sx * 0.0005, H + 0.0026 - Math.abs(sx) * 0.0002, 0.0128 - Math.abs(sx) * 0.0003],
      bone: "head",
    });
  // frons, labrum
  b.part(new THREE.SphereGeometry(1, 12, 9), fronsPaint, {
    at: [0, H - 0.0008, 0.0121],
    bone: "head",
    scale: [0.0034, 0.0026, 0.0022],
  });
  b.part(new THREE.SphereGeometry(1, 10, 6), "#d0d84e", {
    at: [0, H - 0.0031, 0.0129],
    bone: "head",
    scale: [0.0019, 0.0008, 0.0011],
  });
  // labium (lower jaw)
  b.part(new THREE.SphereGeometry(1, 10, 6), "#d9c35a", {
    at: [0, H - 0.0036, 0.0117],
    bone: "jaw",
    scale: [0.0019, 0.0008, 0.0016],
  });
  // antennae
  for (const sx of [1, -1])
    b.spike([sx * 0.0007, H + 0.001, 0.0131], [sx * 0.0013, H + 0.0024, 0.0146], null, 0.0001, {
      color: "#1a1a14",
      bone: "head",
      sides: 4,
    });

  // ---------------- wings
  const membraneMat = new THREE.MeshPhysicalMaterial({
    color: "#f4e6b0",
    transparent: true,
    opacity: 0.3,
    roughness: 0.1,
    metalness: 0.15,
    iridescence: 0.9,
    iridescenceIOR: 1.35,
    iridescenceThicknessRange: [250, 650],
    side: THREE.DoubleSide,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
  const fore: WingSpec = { L: 0.048, c: 0.0115, base: 0.55, lobe: 0.0 };
  const hind: WingSpec = { L: 0.047, c: 0.0128, base: 0.7, lobe: 0.7 };
  const foreArt = wingSvg(fore, 11);
  const hindArt = wingSvg(hind, 23);

  const addWing = (
    name: string,
    sx: number,
    root: [number, number, number],
    dir: [number, number, number],
    spec: WingSpec,
    art: ReturnType<typeof wingSvg>,
  ) => {
    const r = new THREE.Vector3(...root);
    const xDir = new THREE.Vector3(dir[0] * sx, dir[1], dir[2]).normalize();
    const t = r.clone().addScaledVector(xDir, spec.L);
    b.chain(name, [r, t], { names: [name, `${name}Tip`], role: "wing", parent: "thorax" });
    const yDir = new THREE.Vector3(0, 0, 1).addScaledVector(xDir, -xDir.z).normalize();
    const zDir = new THREE.Vector3().crossVectors(xDir, yDir);
    const quat = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(xDir, yDir, zDir));
    const { pts, ymin, ymax } = art.outline;
    const mem = b.part(wingGeometry(pts, spec.L, ymin, ymax), "#f4e6b0", { at: r, quat, bone: name });
    mem.mesh.material = membraneMat;
    const veins = b.part(wingGeometry(pts, spec.L, ymin, ymax), "#ffffff", {
      at: r,
      quat,
      bone: name,
      texture: art.texture,
    });
    (veins.mesh.material as THREE.Material).side = THREE.DoubleSide;
    b.part(new THREE.SphereGeometry(0.0007, 8, 6), "#2b2618", { at: r, bone: "thorax", scale: [1.4, 0.8, 1.6] });
  };
  for (const [sx, s] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    addWing(`wingF${s}`, sx, [sx * 0.0024, H + 0.0046, 0.0019], [1, 0.06, 0.08], fore, foreArt);
    addWing(`wingH${s}`, sx, [sx * 0.0024, H + 0.0041, -0.0033], [1, 0.05, -0.05], hind, hindArt);
  }

  // ---------------- legs, tucked into a basket
  const pairs = [
    { id: "F", z: 0.0045, reach: 0.0045, drop: 0.0085 },
    { id: "M", z: 0.0018, reach: 0.0028, drop: 0.0095 },
    { id: "H", z: -0.0012, reach: 0.0012, drop: 0.0105 },
  ];
  for (const pr of pairs)
    for (const [sx, s] of [
      [1, "L"],
      [-1, "R"],
    ] as const) {
      const root = new THREE.Vector3(sx * 0.0013, H - 0.0040, pr.z);
      const knee = new THREE.Vector3(sx * 0.0042, H - 0.0056, pr.z + 0.0018);
      const ankle = new THREE.Vector3(sx * 0.003, H - pr.drop, pr.z + pr.reach);
      const foot = new THREE.Vector3(sx * 0.0024, H - pr.drop - 0.0008, pr.z + pr.reach + 0.0022);
      const id = `${pr.id}${s}`;
      const leg = b.chain(`leg${id}`, [root, knee, ankle, foot], {
        names: [`hip${id}`, `knee${id}`, `ankle${id}`, `foot${id}`],
        role: "leg",
        parent: "thorax",
      });
      b.sweep(leg, [0.00038, 0.00028, 0.00016], {
        color: (t: number) => (t < 0.33 ? "#5a3e22" : "#15130f"),
        sides: 6,
      });
      for (const f of [0.25, 0.45, 0.65, 0.85]) {
        const base = knee.clone().lerp(ankle, f);
        b.spike(base, [-sx * 0.6, -0.25, 0.55], 0.0007, 0.00008, {
          color: "#1a1a1a",
          bone: `knee${id}`,
          sides: 4,
        });
      }
      for (const cx of [-1, 1])
        b.spike(foot, [cx * 0.4, -1, 0.5], 0.0005, 0.00007, { color: "#0d0d0d", bone: `ankle${id}`, sides: 4 });
    }

  return b.root;
}
```