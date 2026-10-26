```ts
import * as THREE from "three";
import { createBuilder, paint, noise, mix, smoothstep, svg } from "agentic-3js-builder";
import type { Paint } from "agentic-3js-builder";

export const meta = {
  name: "Spitfire Mk.I Cyanotype",
  description:
    "Supermarine Spitfire fighter in a cyanotype blueprint style: prussian-blue skin with white drafting grid, white edge lines, outlined roundels and stencilled labels.",
};

// ------------------------------------------------------------------ palette
const LINE = "#e9f5ff";
const CYAN = "#8fd0ff";
const DEEP = "#0a2f66";
const NAVY = "#06224a";
const TIRE = "#04162e";
const MIDB = "#1b5aa6";
const fract = (x: number) => x - Math.floor(x);

/** Blueprint skin: lit blue gradient with mottled cyanotype unevenness and a white drafting grid on the dominant face. */
const bp = (lo: string, hi: string, seed: number, size = 0.4): Paint =>
  paint((p, n) => {
    const t = smoothstep(-0.7, 0.9, n.y);
    const m = noise(p, 0.6, seed);
    const c = mix(lo, hi, Math.min(1, Math.max(0, t * 0.8 + (m - 0.5) * 0.35 + 0.1)));
    const ax = Math.abs(n.x);
    const ay = Math.abs(n.y);
    const az = Math.abs(n.z);
    const [u, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
    const du = fract(u / size) * size;
    const dv = fract(v / size) * size;
    if (du < 0.008 || dv < 0.008) return mix(c, LINE, 0.7);
    const fu = fract(u / (size / 4)) * (size / 4);
    const fv = fract(v / (size / 4)) * (size / 4);
    if (fu < 0.003 || fv < 0.003) return mix(c, LINE, 0.18);
    return c;
  });

/** White outline on the walls of an extruded plate (walls are square to the thickness axis). */
const edged = (base: Paint, ax: "x" | "y" | "z"): Paint => paint((_p, n) => (Math.abs(n[ax]) < 0.5 ? LINE : base));

const SKIN = bp("#0c3d7e", "#3a82cc", 3);
const CTRL = bp("#0f4a94", "#5aa2e2", 5, 0.2);
const BODY = bp("#0b3874", "#2f78c4", 7);
const GEAR = bp("#06224a", "#16508f", 9, 0.2);
const CANOPY = paint((p, n) => {
  if ([0.62, 0.1, -0.5, -1.2].some((z) => Math.abs(p.z - z) < 0.02)) return LINE;
  if (Math.abs(p.x) < 0.012 && n.y > 0.5) return LINE;
  return mix("#5fb0ea", "#d4efff", smoothstep(-0.5, 0.9, n.y));
});

// ------------------------------------------------------------------ textures
const ROUNDEL = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#0a2f66" stroke="#e9f5ff" stroke-width="3.5"/>
  <circle cx="50" cy="50" r="36" fill="#8fd0ff" stroke="#e9f5ff" stroke-width="2.5"/>
  <circle cx="50" cy="50" r="23" fill="#0a2f66" stroke="#e9f5ff" stroke-width="2.5"/>
  <circle cx="50" cy="50" r="10" fill="#e9f5ff" stroke="#0a2f66" stroke-width="2"/>
  <path d="M50 14V30M50 70V86M14 50H30M70 50H86" stroke="#0a2f66" stroke-width="3"/></svg>`,
  { size: 256 },
);
const LABEL = svg(
  `<svg viewBox="0 0 460 80"><text x="2" y="34" font-family="monospace" font-weight="bold" font-size="33" fill="#e9f5ff">SUPERMARINE SPITFIRE</text>
  <path d="M2 42H452" stroke="#e9f5ff" stroke-width="3"/><path d="M2 36V48M452 36V48" stroke="#e9f5ff" stroke-width="3"/>
  <text x="2" y="70" font-family="monospace" font-size="19" fill="#cfe6ff">Mk.I  SPAN 11.23 m  LENGTH 9.12 m</text></svg>`,
  { size: 1024 },
);
const CODE = svg(
  `<svg viewBox="0 0 140 44"><text x="70" y="36" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="40" fill="#e9f5ff" stroke="#0a2f66" stroke-width="1.5">QV-K</text></svg>`,
  { size: 512 },
);
const FLASH = svg(
  `<svg viewBox="0 0 60 100"><rect x="1" y="1" width="19" height="98" fill="#0a2f66" stroke="#e9f5ff" stroke-width="2"/>
  <rect x="20" y="1" width="20" height="98" fill="#e9f5ff" stroke="#e9f5ff" stroke-width="2"/>
  <rect x="40" y="1" width="19" height="98" fill="#3f86cf" stroke="#e9f5ff" stroke-width="2"/></svg>`,
  { size: 128 },
);
const HUB = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#123f80" stroke="#e9f5ff" stroke-width="3"/>
  <circle cx="50" cy="50" r="34" fill="none" stroke="#e9f5ff" stroke-width="2" stroke-dasharray="5 4"/>
  <path d="M50 50L50 8M50 50L86 29M50 50L86 71M50 50L50 92M50 50L14 71M50 50L14 29" stroke="#e9f5ff" stroke-width="3"/>
  <circle cx="50" cy="50" r="12" fill="#e9f5ff"/></svg>`,
  { size: 192 },
);

// ------------------------------------------------------------------ geometry helpers
const chord = (u: number) => 2.5 * Math.sqrt(Math.max(0, 1 - (u / 5.7) ** 2));
const LE = (u: number, f: number) => 0.3 + chord(u) * f;
const TE = (u: number, f: number) => 0.3 - chord(u) * f;
const wingOutline = (fF: number, rF: number, us: number[]): [number, number][] => [
  ...us.map((u) => [u, LE(u, fF)] as [number, number]),
  ...[...us].reverse().map((u) => [u, TE(u, rF)] as [number, number]),
];
const DIH = 0.0995;

export default function build() {
  const b = createBuilder({ name: "spitfire", paintSize: 2048 });
  const fuse = b.joint("fuselage", { at: [0, 2, 0], role: "spine" });
  const P = (geo: THREE.BufferGeometry, color: any, o: any = {}) => b.part(geo, color, { bone: fuse, ...o });

  // ---------------------------------------------------------- fuselage
  const stations: [number, number, number, number][] = [
    [3.6, 2.1, 0.75, 0.85],
    [3.0, 2.1, 0.86, 0.96],
    [2.0, 2.08, 0.95, 1.1],
    [1.0, 2.05, 1.0, 1.25],
    [0, 2.0, 0.95, 1.3],
    [-1, 1.95, 0.85, 1.1],
    [-2.5, 1.95, 0.6, 0.85],
    [-4, 2.0, 0.32, 0.5],
    [-4.95, 2.05, 0.14, 0.28],
  ];
  const body = b.loft(
    stations.map(([z, y, w, h]) => ({ at: [0, y, z] as [number, number, number], w, h })),
    { color: BODY, bone: fuse },
  );
  const skin = b.surface(body);

  // drafting seams round the body
  for (const z of [2.9, 1.9, -3.2]) {
    const loop = skin.loop([0, z > 0 ? 2.1 : 1.97, z], { dir: [0, 0, 1], lift: 0.012 });
    b.sweep(loop, 0.012, { color: LINE, bone: fuse });
  }
  for (const deg of [0, 90, -90, 180]) b.sweep(body.line(deg, 0.006), 0.008, { color: LINE, bone: fuse });

  // cowl lip
  b.lathe(
    [
      [0.3, 0],
      [0.39, 0],
      [0.39, 0.08],
      [0.3, 0.08],
    ],
    { at: [0, 2.1, 3.52], axis: [0, 0, 1], segments: 16, color: CYAN, bone: fuse },
  );
  // ejector exhaust stacks
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++) {
      const hit = skin.ray([s * 1.2, 2.3, 3.05 - i * 0.2], [-s, 0, 0]);
      if (hit) b.stick(new THREE.CylinderGeometry(0.035, 0.055, 0.2, 6), CYAN, hit, { embed: 0.4 });
    }
  // chin scoop
  P(new THREE.BoxGeometry(0.34, 0.2, 0.7), NAVY, { at: [0, 1.42, 1.15] });
  P(new THREE.BoxGeometry(0.28, 0.12, 0.02), LINE, { at: [0, 1.42, 1.51] });

  // roundels, codes
  for (const s of [1, -1]) {
    b.decal(body, ROUNDEL, { at: [s * 0.4, 1.98, -1.9], dir: [s, 0, 0], size: [0.6, 0.6] });
    b.decal(body, CODE, { at: [s * 0.3, 1.97, -3.3], dir: [s, 0, 0], size: [0.7, 0.22] });
  }

  // ---------------------------------------------------------- canopy
  const canopyJ = b.joint("canopy", { parent: fuse, at: [0, 2.6, -0.8], dir: [0, 0, -1], role: "hinge" });
  const canopyStations: [number, number, number, number][] = [
    [1.0, 2.66, 0.42, 0.2],
    [0.6, 2.8, 0.62, 0.45],
    [-0.2, 2.86, 0.66, 0.52],
    [-1.0, 2.78, 0.56, 0.5],
    [-1.9, 2.55, 0.34, 0.3],
  ];
  b.loft(
    canopyStations.map(([z, y, w, h]) => ({ at: [0, y, z] as [number, number, number], w, h })),
    { color: CANOPY, bone: canopyJ },
  );
  // headrest & mast, aerial wire
  P(new THREE.BoxGeometry(0.3, 0.12, 0.2), NAVY, { at: [0, 2.58, -1.35] });
  b.rod([0, 2.42, -2.05], [0, 2.95, -2.15], 0.018, { color: LINE, bone: fuse });
  b.rod([0, 2.95, -2.15], [0, 3.15, -4.15], 0.006, { color: LINE, bone: fuse });

  // ---------------------------------------------------------- propeller
  const prop = b.joint("prop", { parent: fuse, at: [0, 2.1, 3.55], dir: [0, 0, 1], role: "hinge" });
  b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.3, 0.06],
      [0.27, 0.2],
      [0.19, 0.4],
      [0.08, 0.57],
      [0, 0.62],
    ],
    {
      at: [0, 2.1, 3.5],
      axis: [0, 0, 1],
      segments: 12,
      bone: prop,
      color: paint((_p, _n, s) => (s[0] > 0.2 && s[0] < 0.25 ? LINE : mix("#2f78c4", "#9bd2ff", s[0] / 0.7))),
    },
  );
  const bladePaint = paint((_p, n, s) =>
    Math.abs(n.z) < 0.5 ? LINE : s[0] > 1.33 ? LINE : mix("#0c3d7e", "#2f78c4", s[0] / 1.5),
  );
  for (let i = 0; i < 3; i++) {
    const a = (i * 120 * Math.PI) / 180;
    const c = Math.cos(a);
    const sn = Math.sin(a);
    b.extrude(
      [
        [0.12, -0.07],
        [0.5, -0.1],
        [1.0, -0.13],
        [1.4, -0.1],
        [1.55, -0.04],
        [1.55, 0.05],
        [1.2, 0.12],
        [0.6, 0.13],
        [0.12, 0.08],
      ],
      { at: [0, 2.1, 3.58], x: [c, sn, 0], y: [-sn, c, 0], thickness: 0.035, bevel: 0.006, color: bladePaint, bone: prop },
    );
    b.part(new THREE.CylinderGeometry(0.07, 0.08, 0.3, 8), CYAN, { bone: prop, at: [c * 0.2, 2.1 + sn * 0.2, 3.58], dir: [c, sn, 0] });
  }
  b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.07, 14), NAVY, { bone: prop, at: [0, 2.1, 3.55], dir: [0, 0, 1] });

  // ---------------------------------------------------------- wings
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const xdir: [number, number, number] = [s, DIH, 0];
    b.extrude(wingOutline(0.25, 0.75, [0, 1, 2, 3, 4, 4.8, 5.3, 5.6]), {
      at: [0, 1.5, 0], x: xdir, y: [0, 0, 1], thickness: 0.08, bevel: 0.01, color: edged(SKIN, "y"), bone: fuse,
    });
    b.extrude(wingOutline(0.15, 0.45, [0, 1, 2, 3, 4, 5]), {
      at: [0, 1.5, 0], x: xdir, y: [0, 0, 1], thickness: 0.2, bevel: 0.02, color: edged(SKIN, "y"), bone: fuse,
    });

    // aileron on its own hinge
    const H0 = new THREE.Vector3(s * 2.7 * 0.995, 1.5 + 2.7 * DIH, -0.91);
    const H1 = new THREE.Vector3(s * 5 * 0.995, 1.5 + 5 * DIH, -0.36);
    const d = H1.clone().sub(H0);
    const L = d.length();
    const dn = d.clone().normalize();
    const upv = new THREE.Vector3(0, 1, 0);
    const yv = s > 0 ? dn.clone().cross(upv) : upv.clone().cross(dn);
    const ail = b.joint(`aileron${S}`, { parent: fuse, at: H0.toArray() as [number, number, number], dir: d.toArray() as [number, number, number], role: "hinge" });
    b.extrude(
      [
        [0, 0],
        [L, 0],
        [L, -0.25],
        [L * 0.5, -0.38],
        [0, -0.44],
      ],
      { at: H0.toArray() as [number, number, number], x: dn.toArray() as [number, number, number], y: yv.toArray() as [number, number, number], thickness: 0.1, bevel: 0.01, color: edged(CTRL, "y"), bone: ail },
    );

    // roundel on the upper wing
    const nrm: [number, number, number] = [-0.1 * s, 1, 0];
    b.part(new THREE.PlaneGeometry(0.9, 0.9), "#ffffff", {
      bone: fuse, at: [s * 3.3, 1.5 + 3.3 * DIH + 0.112, 0], dir: nrm, axis: "z", up: [0, 0, 1], texture: ROUNDEL,
    });

    // guns
    for (const u of [1.9, 2.3, 2.7, 3.1]) {
      const zl = LE(u, 0.25);
      b.rod([s * u, 1.5 + u * DIH, zl - 0.1], [s * u, 1.5 + u * DIH, zl + 0.3], 0.022, { color: CYAN, bone: fuse });
    }

    // radiator / oil cooler
    const big = s < 0;
    const len = big ? 1.1 : 0.8;
    const thick = big ? 0.4 : 0.28;
    const rx = s * (big ? 2.2 : 1.9);
    b.extrude(
      [
        [0, 0.3],
        [0.05, 0.1],
        [0.25, 0],
        [len - 0.25, 0],
        [len, 0.12],
        [len, 0.3],
      ],
      { at: [rx, 1.38, 0.55], x: [0, 0, -1], y: [0, 1, 0], thickness: thick, bevel: 0.015, color: edged(GEAR, "x"), bone: fuse },
    );
    P(new THREE.BoxGeometry(thick * 0.8, 0.12, 0.02), NAVY, { at: [rx, 1.46, 0.555] });
    for (let k = 0; k < 4; k++) P(new THREE.BoxGeometry(thick * 0.8, 0.008, 0.024), LINE, { at: [rx, 1.42 + k * 0.03, 0.56] });

    // ------------------------------------------------------ undercarriage
    const top = new THREE.Vector3(s * 1.38, 1.66, 0.42);
    const wheelC = new THREE.Vector3(s * 1.0, 0.38, 0.5);
    const gear = b.joint(`gear${S}`, { parent: fuse, at: top.toArray() as [number, number, number], aim: wheelC.toArray() as [number, number, number], role: "leg" });
    const wheel = b.joint(`wheel${S}`, { parent: gear, at: wheelC.toArray() as [number, number, number], dir: [s, 0, 0] });
    const mid = top.clone().lerp(wheelC, 0.5);
    b.rod(top.toArray(), mid.toArray(), 0.08, { color: GEAR, bone: gear });
    b.rod(mid.toArray(), wheelC.toArray(), 0.045, { color: CYAN, bone: gear });
    b.part(new THREE.BoxGeometry(0.02, 1.0, 0.26), MIDB, {
      bone: gear, at: [mid.x + s * 0.09, mid.y + 0.15, mid.z - 0.05], dir: wheelC.clone().sub(top).normalize().toArray(),
    });
    b.part(new THREE.CylinderGeometry(0.38, 0.38, 0.17, 14), TIRE, { bone: wheel, at: wheelC.toArray(), dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.2, 10), NAVY, { bone: wheel, at: wheelC.toArray(), dir: [1, 0, 0] });
    b.part(new THREE.CircleGeometry(0.29, 16), "#ffffff", {
      bone: wheel, at: [wheelC.x + s * 0.092, wheelC.y, wheelC.z], dir: [s, 0, 0], axis: "z", texture: HUB,
    });

    // ------------------------------------------------------ tail plane
    b.extrude(
      [
        [0, -3.6],
        [1.45, -4.1],
        [1.55, -4.35],
        [1.5, -4.45],
        [0, -4.45],
      ],
      { at: [0, 2.04, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.06, bevel: 0.008, color: edged(SKIN, "y"), bone: fuse },
    );
    const elev = b.joint(`elevator${S}`, { parent: fuse, at: [0, 2.04, -4.45], dir: [s, 0, 0], role: "hinge" });
    b.extrude(
      [
        [0, 0],
        [1.5, 0],
        [1.55, -0.2],
        [1.3, -0.5],
        [0.9, -0.62],
        [0, -0.62],
      ],
      { at: [0, 2.04, -4.45], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.055, bevel: 0.008, color: edged(CTRL, "y"), bone: elev },
    );

    // fin flash
    b.part(new THREE.PlaneGeometry(0.45, 0.8), "#ffffff", {
      bone: fuse, at: [s * 0.034, 2.7, -3.75], dir: [s, 0, 0], axis: "z", up: [0, 1, 0], texture: FLASH,
    });
  }

  // wing label on the port wing
  b.part(new THREE.PlaneGeometry(2.3, 0.4), "#ffffff", {
    bone: fuse, at: [1.65, 1.5 + 1.65 * DIH + 0.113, -0.05], dir: [-0.1, 1, 0], axis: "z", up: [0, 0, 1], texture: LABEL,
  });

  // pitot tube
  b.rod([3.6, 1.82, 0.75], [3.6, 1.8, 1.3], 0.012, { color: LINE, bone: fuse });

  // ---------------------------------------------------------- fin & rudder
  b.extrude(
    [
      [0, 0],
      [1.0, 0],
      [1.0, 1.1],
      [0.72, 1.2],
    ],
    { at: [0, 2.0, -3.4], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.06, bevel: 0.008, color: edged(SKIN, "x"), bone: fuse },
  );
  const rudder = b.joint("rudder", { parent: fuse, at: [0, 2.0, -4.4], dir: [0, 1, 0], role: "hinge" });
  b.extrude(
    [
      [0, -0.12],
      [0.42, -0.12],
      [0.62, 0.35],
      [0.52, 0.95],
      [0.25, 1.2],
      [0, 1.2],
    ],
    { at: [0, 2.0, -4.4], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.055, bevel: 0.008, color: edged(CTRL, "x"), bone: rudder },
  );

  // ---------------------------------------------------------- tail wheel
  const tw = b.joint("tailWheel", { parent: fuse, at: [0, 1.85, -4.0], aim: [0, 0.17, -4.25], role: "leg" });
  b.rod([0, 1.85, -4.0], [0, 0.17, -4.25], 0.03, { color: CYAN, bone: tw });
  b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.07, 10), TIRE, { bone: tw, at: [0, 0.17, -4.25], dir: [1, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.09, 8), LINE, { bone: tw, at: [0, 0.17, -4.25], dir: [1, 0, 0] });

  return b.root;
}
```