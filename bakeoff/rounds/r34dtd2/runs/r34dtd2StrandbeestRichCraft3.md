```ts
import * as THREE from "three";
import { createBuilder, frame, paint, mix, noise, smoothstep, svg, countershade, mottle } from "agentic-3js-builder";

export const meta = {
  name: "Strandbeest",
  description:
    "A wind-walking beach creature of yellow tubes: eight Jansen-linkage legs, a triangulated frame, bottle bladders, wing sails and a prow with a wind-vane flag.",
};

const YEL = countershade(mottle("#f4c81c", "#dba80d", { size: 0.35, seed: 3 }), "#b98a0a", { level: -0.3 });
const YEL2 = mottle("#f2c21b", "#e0ae12", { size: 0.2, seed: 8 });
const CONN = "#26323f";
const RUBBER = "#1b1d22";
const BOTTLE = "#8fdde0";
const CAP = "#e9f1f2";
const CORD = "#e8dcc0";

// cloth: pale, with panel seams and sun/sand stains by place
const CLOTH = paint((_p, n, s) => {
  const gx = Math.abs(((s[0] / 0.22) % 1 + 1) % 1 - 0.5);
  const gy = Math.abs(((s[1] / 0.28) % 1 + 1) % 1 - 0.5);
  let c = mix("#f6f1e2", "#d9d2bd", smoothstep(0.2, 1.6, 1.2 - s[1]) * 0.6);
  if (gx > 0.47 || gy > 0.47) c = mix(c, "#8a8470", 0.7);
  return mix(c, "#cbbf9d", 0.15 * (1 - Math.abs(n.x)) * noise(_p, 0.2, 5));
});

const FLAG = svg(
  `<svg viewBox="0 0 100 60">
  <path d="M0 0 L100 8 L78 30 L100 52 L0 60Z" fill="#e8472b" stroke="#3a1008" stroke-width="3"/>
  <path d="M0 14 L82 16 M0 30 L66 30 M0 46 L82 44" stroke="#ffe39a" stroke-width="4"/>
  <circle cx="24" cy="30" r="9" fill="#ffe39a" stroke="#3a1008" stroke-width="2"/>
</svg>`,
  { size: 192 },
);
const LABEL = svg(
  `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#2d9fb0"/>
  <path d="M0 8H64M0 24H64" stroke="#fff" stroke-width="3"/>
  <circle cx="32" cy="16" r="6" fill="#fff"/></svg>`,
  { size: 96 },
);

type V2 = { u: number; v: number };
const K = 0.0125;

function circ(a: V2, ra: number, b: V2, rb: number): V2 {
  const du = b.u - a.u;
  const dv = b.v - a.v;
  const d = Math.hypot(du, dv) || 1e-6;
  if (d > ra + rb - 1e-4 || d < Math.abs(ra - rb) + 1e-4) {
    const t = ra / (ra + rb);
    return { u: a.u + du * t, v: a.v + dv * t };
  }
  const l = (ra * ra - rb * rb + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(ra * ra - l * l, 0));
  const bu = a.u + (du * l) / d;
  const bv = a.v + (dv * l) / d;
  const p1 = { u: bu - (dv / d) * h, v: bv + (du / d) * h };
  const p2 = { u: bu + (dv / d) * h, v: bv - (du / d) * h };
  return p1.v < p2.v ? p1 : p2;
}

function leg(theta: number) {
  const F: V2 = { u: 0, v: 0 };
  const C: V2 = { u: 38, v: 7.8 };
  const Q: V2 = { u: C.u + 15 * Math.cos(theta), v: C.v + 15 * Math.sin(theta) };
  const J1 = circ(F, 41.5, Q, 50);
  const J2 = circ(F, 39.3, Q, 61.9);
  const J3 = circ(J1, 55.8, J2, 39.4);
  const foot = circ(J3, 49, J2, 65.7);
  return { F, C, Q, J1, J2, J3, foot };
}

export default function build() {
  const b = createBuilder({ name: "strandbeest" });

  const stations = [-0.95, -0.32, 0.32, 0.95];
  const SX = 0.58;
  const legsSpec: { s: number; z: number; theta: number; tag: string }[] = [];
  stations.forEach((z, i) => {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      legsSpec.push({ s, z, theta: (i * Math.PI) / 2 + (s > 0 ? 0 : Math.PI) + 0.4, tag: `${side}${i}` });
    }
  });
  let minV = 0;
  for (const l of legsSpec) {
    const g = leg(l.theta);
    minV = Math.min(minV, g.foot.v, g.J3.v);
  }
  const PAD = 0.04;
  const H = -minV * K + PAD;

  const hips = b.joint("hips", { at: [0, H, 0], dir: [0, 0, 1], role: "spine" });
  b.joint("prow", { parent: hips, at: [0, H + 0.2, 1.7], dir: [0, 0, 1], role: "head" });
  b.joint("mast", { parent: hips, at: [0, H + 0.5, -1.4], dir: [0, 1, 0], role: "spine" });

  const R = 0.017;
  const tube = (a: number[], c: number[], r = R, col: any = YEL) => b.rod(a, c, r, col, { detail: 0.7 });
  const node = (p: number[], r = 0.03) => b.part(new THREE.SphereGeometry(r, 6, 4), CONN, { at: p, flat: true });

  // ---------- frame ----------
  const zs = [-1.45, 1.6];
  const top = H + 0.5;
  for (const s of [1, -1]) {
    tube([s * SX, H, zs[0]], [s * SX, H, zs[1]], 0.02);
    tube([s * SX * 0.62, top, zs[0] + 0.1], [s * SX * 0.62, top, 1.35], 0.02, YEL2);
    for (const z of [-1.35, -0.65, 0, 0.65, 1.3]) {
      tube([s * SX, H, z], [s * SX * 0.62, top, z < 1.3 ? z + 0.05 : 1.35], 0.014);
      node([s * SX, H, z], 0.026);
    }
    for (let i = 0; i < 4; i++) {
      const z0 = -1.35 + i * 0.7;
      tube([s * SX, H, z0], [s * SX * 0.62, top, z0 + 0.7], 0.012, YEL2);
    }
    // prow
    tube([s * SX, H, zs[1]], [0, H + 0.2, 1.95], 0.02);
    tube([s * SX * 0.62, top, 1.35], [0, H + 0.55, 1.9], 0.016, YEL2);
  }
  for (const z of [-1.35, -0.65, 0, 0.65, 1.3]) {
    tube([SX, H, z], [-SX, H, z], 0.018);
    tube([SX * 0.62, top, z + 0.05], [-SX * 0.62, top, z + 0.05], 0.014, YEL2);
  }
  tube([0, H, zs[0]], [0, H + 0.2, 1.95], 0.018);
  tube([0, H + 0.2, 1.95], [0, H + 0.55, 1.9], 0.014);
  tube([0, H, -1.45], [0, top + 0.05, 1.3], 0.014, YEL2);
  node([0, H + 0.2, 1.95], 0.04);

  // ---------- legs ----------
  const P = (s: number, z0: number, p: V2) => [s * SX, H + p.v * K, z0 + p.u * K];
  for (const l of legsSpec) {
    const g = leg(l.theta);
    const F = P(l.s, l.z, g.F), C = P(l.s, l.z, g.C), Q = P(l.s, l.z, g.Q);
    const J1 = P(l.s, l.z, g.J1), J2 = P(l.s, l.z, g.J2), J3 = P(l.s, l.z, g.J3), T = P(l.s, l.z, g.foot);
    const ch = b.chain(
      `leg${l.tag}`,
      [F, J2, T],
      { parent: hips, names: [`hip${l.tag}`, `knee${l.tag}`, `foot${l.tag}`], role: "leg", contact: [T[0], 0, T[2]] },
    );
    void ch;
    tube(F, J1); tube(F, J2); tube(Q, J1); tube(Q, J2);
    tube(C, Q, 0.012, CONN);
    tube(J1, J3); tube(J2, J3); tube(J2, T); tube(J3, T);
    for (const p of [F, C, Q, J1, J2, J3]) node(p, 0.026);
    node(T, 0.03);
    b.part(new THREE.CylinderGeometry(0.03, 0.04, 0.07, 7), RUBBER, { at: [T[0], T[1] - 0.02, T[2]], flat: true });
    // fixed crank mount
    tube(C, [C[0] - l.s * 0.0, H, C[2]], 0.012, CONN);
  }

  // crank axles across at each station
  for (const z of stations) {
    tube([SX, H + 0.1, z + 0.475], [-SX, H + 0.1, z + 0.475], 0.012, YEL2);
  }

  // ---------- bottle bladders ----------
  const bottle = new THREE.LatheGeometry(
    [[0, 0], [0.06, 0], [0.065, 0.04], [0.065, 0.24], [0.035, 0.31], [0.03, 0.36], [0, 0.36]].map(
      ([x, y]) => new THREE.Vector2(x, y),
    ),
    8,
  );
  for (const s of [1, -1])
    for (let i = 0; i < 5; i++) {
      const z = -1.1 + i * 0.5;
      const at = [s * 0.2, top + 0.07, z];
      b.part(bottle, BOTTLE, { at, dir: [0, 0, 1], bone: hips, flat: true });
      b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.04, 6), CAP, { at: [at[0], at[1], z + 0.37], dir: [0, 0, 1], bone: hips });
      b.part(new THREE.CylinderGeometry(0.067, 0.067, 0.1, 8), "#ffffff", {
        at: [at[0], at[1], z + 0.12], dir: [0, 0, 1], bone: hips, texture: LABEL,
      });
      tube([at[0], top, z + 0.05], [at[0], top + 0.07, z + 0.05], 0.01, CORD);
    }
  tube([0.2, top + 0.07, -1.2], [0.2, top + 0.07, 1.2], 0.01, CORD);
  tube([-0.2, top + 0.07, -1.2], [-0.2, top + 0.07, 1.2], 0.01, CORD);

  // ---------- sails ----------
  const mastTop = H + 1.9;
  for (const x of [-0.46, 0, 0.46]) {
    const zb = -1.35;
    tube([x, top, zb], [x, mastTop, zb], 0.016);
    tube([x, top, zb - 0.9], [x, mastTop - 0.5, zb - 0.9], 0.014, YEL2);
    b.extrude(
      [[0, 0], [0.9, 0.0], [0.82, 1.0], [0.55, 1.35, "sharp"], [0.0, 1.38]],
      { at: [x, top + 0.05, zb - 0.9], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.01, color: CLOTH, bone: "mast", smoothing: 1 },
    );
    tube([x, mastTop, zb], [x, mastTop - 0.5, zb - 0.9], 0.012, YEL2);
    node([x, mastTop, zb], 0.028);
    // rigging
    tube([x, mastTop, zb], [x * 1.2, H, 0.3], 0.005, CORD);
  }
  for (const x of [-0.46, 0.46]) tube([x, mastTop, -1.35], [0, top, 1.3], 0.005, CORD);

  // ---------- wind vane on prow ----------
  tube([0, H + 0.55, 1.9], [0, H + 1.25, 1.9], 0.012, YEL2);
  node([0, H + 1.25, 1.9], 0.025);
  b.part(new THREE.SphereGeometry(0.05, 6, 4), "#e8472b", { at: [0, H + 1.3, 1.9], flat: true });
  b.cards([frame([0, H + 0.95, 1.9], [0, 1, 0])], FLAG, {
    size: [0.55, 0.3], lean: 0, flow: [1, 0, 0], sink: 0, color: "#ffffff", bone: "prow",
  });

  return b.root;
}
```