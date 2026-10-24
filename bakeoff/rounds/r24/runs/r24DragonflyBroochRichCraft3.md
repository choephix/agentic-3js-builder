```ts
import * as THREE from "three";
import { createBuilder, rng, limb, paint, mix, svg, catmull, spiral } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Lalique Dragonfly",
  description:
    "Art Nouveau jewel dragonfly: gilt body with cloisonné enamel abdomen, plique-à-jour wings of gold wire and open enamel cells, mosaic peridot-sapphire eyes, opal ocelli and amethyst thorax gem. Rest pose with wings spread.",
};

// ---------- palette ----------
const GOLD = "#d9a83c";
const GOLD_L = "#f4d77a";
const GOLD_D = "#8f6a20";
const TEAL = "#1f8f8a";
const GREEN = "#2f7a4a";
const DARKGREEN = "#134a3e";
const PERIDOT = "#a5c93c";
const AMBER = "#e8942a";
const AMETHYST = "#7c4aa8";
const SAPPHIRE = "#2a4fa0";
const OPAL = "#e9f2ef";
const IVORY = "#efe6cc";
const HORN = "#3a2a1c";

const GOLDP = metal("gilt", { size: 0.02, tarnish: 0.12, seed: 3 });
const LEGP = metal("brass", { size: 0.02, tarnish: 0.2, verdigris: 0.15, seed: 5 });

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const hex = (c: readonly number[]) =>
  "#" +
  c
    .map((v) =>
      Math.round(Math.min(1, Math.max(0, v)) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");
const lighter = (c: string, t: number) => hex(mix(c, "#ffffff", t));

// ---------- wing drawing (viewBox 100 x H, root at the bottom, leading edge at the right) ----------
type WingKind = "fore" | "hind";

function wingShape(kind: WingKind) {
  const H = kind === "fore" ? 300 : 270;
  const lead = (u: number) => 96 + 2 * Math.sin(Math.PI * u) - 10 * Math.pow(u, 6);
  const chord = (u: number) => {
    if (kind === "fore") {
      if (u < 0.65) return 26 + 60 * Math.sin(((u / 0.65) * Math.PI) / 2);
      return 86 * Math.sqrt(Math.max(0, 1 - ((u - 0.65) / 0.35) ** 2));
    }
    if (u < 0.5) return 40 + 50 * Math.sin(((u / 0.5) * Math.PI) / 2);
    return 90 * Math.sqrt(Math.max(0, 1 - ((u - 0.5) / 0.5) ** 2));
  };
  const pt = (u: number, k: number): [number, number] => [lead(u) - chord(u) * (1 - k), H - (H - 4) * u];
  return { H, pt };
}

const KS = [0, 0.15, 0.32, 0.5, 0.68, 0.84, 1];

function wingTexture(kind: WingKind, mirror: boolean) {
  const { H, pt } = wingShape(kind);
  const r = rng(kind === "fore" ? 11 : 23);
  // ordered tip -> base
  const pal =
    kind === "fore"
      ? ["#1f6fa8", "#2aa89e", "#7cc47a", "#d9b33a", "#e08a2c"]
      : ["#3b4aa0", "#7a4a9e", "#2aa89e", "#c9a02f", "#d9622c"];
  const N = 13;
  const C = KS.length - 1;
  const grid: [number, number][][] = [];
  for (let j = 0; j <= N; j++) {
    const row: [number, number][] = [];
    for (let i = 0; i <= C; i++) {
      const u = j / N + (j > 0 && j < N ? (r() - 0.5) * 0.02 : 0);
      row.push(pt(u, KS[i]));
    }
    grid.push(row);
  }
  const f = (v: number) => v.toFixed(1);
  const poly = (q: [number, number][]) => q.map((p) => `${f(p[0])},${f(p[1])}`).join(" ");
  let fills = "";
  let lines = "";
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < C; i++) {
      const q = [grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]];
      const u = (j + 0.5) / N;
      const rr = r();
      const r2 = r();
      const fillIt = u < 0.16 || rr < 0.34 * (1 - 0.5 * u) + (i === 0 ? 0.2 : 0) + (i === C - 1 ? 0.12 : 0);
      if (fillIt) {
        const ci = Math.min(pal.length - 1, Math.floor(Math.min(0.999, 0.6 * r2 + 0.4 * (1 - u)) * pal.length));
        const col = pal[ci];
        fills += `<polygon points="${poly(q)}" fill="${col}"/>`;
        const cx = q.reduce((a, p) => a + p[0], 0) / 4;
        const cy = q.reduce((a, p) => a + p[1], 0) / 4;
        const inner = q.map((p) => [cx + (p[0] - cx) * 0.55, cy + (p[1] - cy) * 0.55] as [number, number]);
        fills += `<polygon points="${poly(inner)}" fill="${lighter(col, 0.3)}"/>`;
      }
      lines += `<polygon points="${poly(q)}" fill="none" stroke="${GOLD}" stroke-width="2.2" stroke-linejoin="round"/>`;
    }
  }
  const outlinePts: [number, number][] = [];
  for (let s = 0; s <= 40; s++) outlinePts.push(pt(s / 40, 1));
  for (let s = 40; s >= 0; s--) outlinePts.push(pt(s / 40, 0));
  const outline = "M" + outlinePts.map((p) => `${f(p[0])} ${f(p[1])}`).join(" L") + " Z";
  const stig = [pt(0.78, 0.82), pt(0.78, 1), pt(0.88, 1), pt(0.88, 0.82)];
  const stigma = `<polygon points="${poly(stig)}" fill="#4b2a6e" stroke="${GOLD}" stroke-width="1.6"/>`;
  const body = `${fills}${stigma}${lines}<path d="${outline}" fill="none" stroke="${GOLD}" stroke-width="4" stroke-linejoin="round"/>`;
  return svg(
    `<svg viewBox="0 0 100 ${H}" xmlns="http://www.w3.org/2000/svg">${
      mirror ? `<g transform="translate(100 0) scale(-1 1)">${body}</g>` : body
    }</svg>`,
    { size: 640 },
  );
}

// ---------- eye mosaic ----------
function eyeTexture() {
  return svg(
    `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#2f6fd0"/><stop offset="0.5" stop-color="#1fa59a"/><stop offset="1" stop-color="#b6d84a"/>
        </linearGradient>
        <radialGradient id="r" cx="0.5" cy="0.45" r="0.5">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.3"/><stop offset="1" stop-color="#001a2a" stop-opacity="0.55"/>
        </radialGradient>
        <pattern id="h" width="12" height="10" patternUnits="userSpaceOnUse">
          <path d="M0 5 L6 0 L12 5 L6 10Z" fill="none" stroke="#f4d77a" stroke-width="0.9" opacity="0.75"/>
        </pattern>
      </defs>
      <rect width="200" height="100" fill="url(#g)"/>
      <rect width="200" height="100" fill="url(#r)"/>
      <rect width="200" height="100" fill="url(#h)"/>
      <ellipse cx="86" cy="30" rx="14" ry="8" fill="#ffffff" opacity="0.55"/>
      <ellipse cx="112" cy="66" rx="5" ry="3" fill="#ffffff" opacity="0.4"/>
    </svg>`,
    { size: 512 },
  );
}

// ---------- abdomen profile ----------
const RK = [0.0072, 0.0056, 0.0036, 0.0031, 0.003, 0.0031, 0.0033, 0.0034, 0.003, 0.0022];
const rAt = (t: number) => {
  const x = Math.min(Math.max(t, 0), 1) * (RK.length - 1);
  const i = Math.min(Math.floor(x), RK.length - 2);
  return RK[i] + (RK[i + 1] - RK[i]) * (x - i);
};

const ABD = paint((_p, _n, s) => {
  const t = s[0];
  const seg = t * 10;
  const fr = seg - Math.floor(seg);
  const deg = ((s[1] % 360) + 360) % 360;
  const d = Math.min(deg, 360 - deg);
  if (fr < 0.1) return GOLD;
  if (d < 9) return GOLD_L;
  if (d > 150) return "#eac37a";
  if (fr > 0.3 && fr < 0.7 && Math.abs(d - 90) < 18) return AMBER;
  const k = Math.min(Math.max(t, 0), 1);
  return k < 0.5 ? mix(DARKGREEN, TEAL, k * 2) : mix(TEAL, SAPPHIRE, (k - 0.5) * 2);
});

const THORAX = paint((p, n) => {
  if (n.y < -0.45) return "#e9dcb0";
  if (n.y > 0.8) return Math.abs(p.x) < 0.0016 ? GOLD_L : GOLD;
  const dz = p.z - 0.004;
  const dy = p.y - 0.032;
  const band = (dz - dy * 0.9) / 0.0072 + 0.37;
  const fr = band - Math.floor(band);
  if (fr < 0.3) return TEAL;
  if (fr < 0.38) return GOLD;
  return mix(DARKGREEN, GREEN, fr);
});

export default function build() {
  const b = createBuilder({ name: "dragonfly" });

  // ---------- skeleton ----------
  const thorax = b.joint("thorax", { at: [0, 0.032, 0.004], dir: [0, 0, 1], role: "spine" });
  const head = b.joint("head", { parent: thorax, at: [0, 0.0365, 0.023], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.0295, 0.0415], dir: [0, -0.15, 1], role: "jaw" });

  const abdPath = catmull([
    [0, 0.0335, -0.012],
    [0, 0.0335, -0.03],
    [0, 0.0325, -0.055],
    [0, 0.0345, -0.075],
    [0, 0.039, -0.092],
  ]);
  const abd = b.chain("abd", abdPath, { parent: thorax, count: 8, names: (i) => `abd${i + 1}`, role: "tail" });

  // ---------- thorax ----------
  b.part(new THREE.SphereGeometry(1, 10, 8), THORAX, {
    bone: thorax,
    at: [0, 0.032, 0.004],
    scale: [0.0115, 0.0125, 0.017],
    flat: true,
  });
  glow(
    b.part(new THREE.IcosahedronGeometry(0.0035, 0), AMETHYST, {
      bone: thorax,
      at: [0, 0.0448, 0.0045],
      scale: [1, 0.8, 1],
      flat: true,
    }),
    0.5,
  );
  b.part(new THREE.TorusGeometry(0.0038, 0.0007, 4, 8), GOLDP, {
    bone: thorax,
    at: [0, 0.0448, 0.0045],
    dir: [0, 1, 0],
    axis: "z",
    flat: true,
  });
  b.part(new THREE.SphereGeometry(0.003, 6, 4), GOLD, { bone: thorax, at: [0, 0.0365, 0.0205] });

  // filigree scrolls on the thorax sides
  for (const s of [1, -1]) {
    for (const zc of [0.014, -0.007]) {
      const center = V(s * 0.0118, 0.0305, zc);
      const from = V(s * 0.0118, 0.0345, zc);
      const curl = spiral(center, from, [s, 0, 0], { turns: -s * 1.4, r1: 0.0012, pitch: 0 });
      b.sweep(curl, [0.0005, 0.0003], { bone: thorax, color: GOLDP, sides: 6 });
    }
  }

  // ---------- abdomen ----------
  const abdSweep = b.sweep(abd, rAt, { color: ABD });
  for (let i = 1; i < 10; i++) {
    const t = i / 10;
    const cp = abd.at(t);
    b.part(new THREE.TorusGeometry(rAt(t) * 1.08 + 0.0003, 0.0006, 4, 8), GOLDP, {
      at: cp.at,
      dir: cp.tangent,
      axis: "z",
      bone: cp.bone ?? undefined,
      flat: true,
    });
  }
  b.along(abdSweep, 10, (at) => {
    const alt = Math.floor(at.t * 10) % 2 === 0;
    glow(b.stick(new THREE.OctahedronGeometry(0.0013, 0), alt ? PERIDOT : AMBER, at, { embed: 0.3, flat: true }), 0.5);
  });
  for (const t of [0.07, 0.17, 0.27]) {
    for (const a of [90, 270]) {
      b.stick(new THREE.SphereGeometry(0.0012, 6, 4), OPAL, abdSweep.at(t, a), { embed: 0.3 });
    }
  }
  for (let i = 0; i < 10; i++) {
    b.stick(new THREE.SphereGeometry(0.0009, 5, 4), GOLD, abdSweep.at((i + 0.5) / 10, 180), { embed: 0.3 });
  }
  // tail claspers and pearl
  const endCp = abd.at(0.97);
  for (const s of [1, -1]) {
    b.spike(endCp.at, [s * 0.4, 0.15, -1], 0.009, 0.0012, { color: GOLD, bone: endCp.bone ?? undefined });
  }
  const last = abd.at(1);
  glow(
    b.part(new THREE.SphereGeometry(0.0018, 6, 5), OPAL, {
      at: last.at.clone().addScaledVector(last.tangent, 0.0032),
      bone: last.bone ?? undefined,
    }),
    0.5,
  );

  // ---------- head ----------
  const eyeTex = eyeTexture();
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.SphereGeometry(0.0125, 12, 8), "#ffffff", {
        bone: head,
        at: [s * 0.0108, 0.0365, 0.0325],
        texture: eyeTex,
        rotation: [0, s > 0 ? 0 : 180, 0],
      }),
      0.35,
    );
  }
  b.part(new THREE.SphereGeometry(1, 8, 6), TEAL, {
    bone: head,
    at: [0, 0.0335, 0.042],
    scale: [0.0068, 0.0058, 0.0055],
    flat: true,
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), GOLDP, {
    bone: head,
    at: [0, 0.0415, 0.0385],
    scale: [0.0085, 0.0055, 0.0075],
    flat: true,
  });
  const ocelli: [number, number, number][] = [
    [0, 0.0462, 0.0405],
    [0.0038, 0.0447, 0.0392],
    [-0.0038, 0.0447, 0.0392],
  ];
  for (const o of ocelli) {
    glow(b.part(new THREE.SphereGeometry(0.0017, 6, 4), OPAL, { bone: head, at: o }), 0.8);
  }
  // upper jaw (labrum) and lower jaw
  b.part(new THREE.BoxGeometry(0.0085, 0.0028, 0.0045), AMBER, { bone: head, at: [0, 0.0302, 0.0462] });
  b.part(new THREE.BoxGeometry(0.0075, 0.0022, 0.004), GOLD_D, { bone: jaw, at: [0, 0.0278, 0.0455] });
  for (const s of [1, -1]) {
    b.spike([s * 0.0025, 0.0288, 0.0472], [0, 0.7, 0.5], 0.003, 0.0007, { color: IVORY, bone: jaw });
  }
  // antennae
  for (const s of [1, -1]) {
    const ant = catmull([
      [s * 0.0028, 0.0456, 0.0425],
      [s * 0.0045, 0.0525, 0.0495],
      [s * 0.0075, 0.0575, 0.0585],
    ]);
    b.sweep(ant, [0.0006, 0.0003], { bone: head, color: GOLD, sides: 6 });
    glow(b.part(new THREE.SphereGeometry(0.0013, 6, 4), OPAL, { bone: head, at: [s * 0.0079, 0.0579, 0.0594] }), 0.6);
  }

  // ---------- legs ----------
  const legSpecs = [
    { tag: "F", z: 0.012, fx: 0.02, fz: 0.025 },
    { tag: "M", z: 0.002, fx: 0.026, fz: 0.006 },
    { tag: "H", z: -0.008, fx: 0.022, fz: -0.016 },
  ];
  for (const s of [1, -1]) {
    for (const spec of legSpecs) {
      const name = spec.tag + (s > 0 ? "L" : "R");
      const root = V(s * 0.006, 0.0235, spec.z);
      const foot = V(s * spec.fx, 0.0016, spec.fz);
      const pts = limb(root, foot, [0.013, 0.016, 0.011], [s * 0.5, 1, 0.2]);
      const leg = b.chain(`leg${name}`, pts, {
        parent: thorax,
        names: [`hip${name}`, `knee${name}`, `ankle${name}`, `foot${name}`],
        role: "leg",
        contact: [foot.x, 0, foot.z],
      });
      const legSw = b.sweep(leg, [0.0032, 0.0026, 0.0019, 0.0015, 0.0012], { color: LEGP, sides: 6 });
      b.along(legSw, 3, (at) => b.spike(at, at, 0.0034, 0.0007, { color: GOLD_D }), { from: 0.45, to: 0.9 });
      const knee = leg.joints[1];
      glow(
        b.part(new THREE.SphereGeometry(0.0029, 6, 4), spec.tag === "M" ? TEAL : AMBER, { at: knee.at, bone: knee }),
        0.5,
      );
      const footJoint = leg.joints[leg.joints.length - 1];
      b.part(new THREE.SphereGeometry(0.0016, 6, 4), GOLD_D, { at: foot, bone: footJoint });
      const dz = spec.fz > spec.z ? 1 : -1;
      for (const c of [-1, 1]) {
        const dir = V(s * 0.5 + c * 0.35, 0, dz).normalize();
        b.spike(foot, dir, 0.0045, 0.0007, { color: HORN, bone: footJoint });
      }
    }
  }

  // ---------- wings ----------
  const tex = {
    fore: [wingTexture("fore", false), wingTexture("fore", true)],
    hind: [wingTexture("hind", false), wingTexture("hind", true)],
  };
  const wingDefs: { kind: WingKind; z0: number; tip: [number, number, number] }[] = [
    { kind: "fore", z0: 0.008, tip: [0.068, 0.0475, 0.018] },
    { kind: "hind", z0: -0.004, tip: [0.064, 0.0455, -0.016] },
  ];
  for (const s of [1, -1]) {
    for (const def of wingDefs) {
      const kind = def.kind;
      const tag = (kind === "fore" ? "F" : "H") + (s > 0 ? "L" : "R");
      const root = V(s * 0.0075, 0.0425, def.z0);
      const tip = V(s * def.tip[0], def.tip[1], def.tip[2]);
      const ch = b.chain(`wc${tag}`, [root, tip], {
        parent: thorax,
        names: [`wing${tag}`, `wing${tag}Tip`],
        role: "wing",
      });
      const j = ch.joints[0];
      const axis = tip.clone().sub(root);
      const L = axis.length();
      const a = axis.clone().normalize();
      const n = V(0, 1, 0).addScaledVector(a, -a.y).normalize();
      const lat = a.clone().cross(n);
      if (lat.z < 0) lat.negate();
      const sh = wingShape(kind);
      const W = (L * 100) / sh.H;
      const center = root.clone().addScaledVector(a, L / 2);

      for (const face of [1, -1]) {
        const dir = n.clone().multiplyScalar(face);
        const right = a.clone().cross(dir);
        const tx = right.z > 0 ? tex[kind][0] : tex[kind][1];
        glow(
          b.part(new THREE.PlaneGeometry(W, L), "#ffffff", {
            bone: j,
            at: center.clone().addScaledVector(n, face * 0.0003),
            dir,
            axis: "z",
            up: a,
            texture: tx,
          }),
          0.4,
        );
      }

      // gold wire veins on the texture's vein lines
      const wp = (u: number, k: number) => {
        const [x, y] = sh.pt(u, k);
        return root
          .clone()
          .addScaledVector(a, (1 - y / sh.H) * L)
          .addScaledVector(lat, (x / 100 - 0.5) * W);
      };
      const us = [0.02, 0.14, 0.26, 0.38, 0.5, 0.62, 0.74, 0.86, 0.96];
      const veins: [number, number][] = [
        [0, 0.0006],
        [0.32, 0.00045],
        [0.68, 0.00045],
        [1, 0.0009],
      ];
      for (const [k, rad] of veins) {
        b.sweep(catmull(us.map((u) => wp(u, k))), rad, { bone: j, color: GOLDP, sides: 6 });
      }

      // base cup and gem
      b.part(new THREE.SphereGeometry(0.0034, 8, 6), GOLDP, { bone: j, at: root });
      glow(
        b.part(new THREE.SphereGeometry(0.0018, 6, 4), kind === "fore" ? TEAL : AMETHYST, {
          bone: j,
          at: root.clone().add(V(0, 0.0022, 0)),
        }),
        0.6,
      );
    }
  }

  return b.root;
}
```