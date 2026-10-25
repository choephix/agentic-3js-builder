import * as THREE from "three";
import { createBuilder, svg, paint, mix, noise, smoothstep, rng, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { panelled, metal } from "../../../../kits/clockwork";

export const meta = {
  name: "KIRO-9 Riot Interceptor",
  description:
    "Corporate riot-control interceptor: armoured six-light cab, roof-mounted water cannon with tank, neon light bars and underglow, cyberpunk styling.",
};

const CY = "#19f0ff", MG = "#ff2d9b", YL = "#ffd21f", WH = "#e9edf2", DK = "#16181f", GR = "#3a3f4b";

const logo = svg(
  `<svg viewBox="0 0 256 96"><rect width="256" height="96" rx="8" fill="#0d0f14"/>
  <rect x="4" y="4" width="248" height="88" rx="6" fill="none" stroke="#19f0ff" stroke-width="3"/>
  <path d="M20 20h22v56H20z M42 48l24-28h26L66 48l26 28H66z" fill="#ff2d9b"/>
  <text x="104" y="48" font-family="sans-serif" font-weight="bold" font-size="30" fill="#ffffff">KIRO</text>
  <text x="104" y="76" font-family="monospace" font-size="19" fill="#19f0ff">RIOT CONTROL</text></svg>`,
  { size: 512 },
);
const chevrons = svg(
  `<svg viewBox="0 0 128 32"><rect width="128" height="32" fill="#ffd21f"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${i * 20 - 8} 0h10l10 32h-10z" fill="#111"/>`).join("")}</svg>`,
  { size: 256 },
);
const grilleTex = svg(
  `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#0b0c10"/>
  ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="4" y="${4 + i * 4.5}" width="56" height="2" fill="#19f0ff"/>`).join("")}
  <path d="M28 2h8v28h-8z" fill="#ff2d9b" opacity=".6"/></svg>`,
  { size: 128 },
);
const number = svg(
  `<svg viewBox="0 0 128 64"><text x="64" y="50" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="56" fill="#111" stroke="#fff" stroke-width="2">K-09</text></svg>`,
  { size: 256 },
);

const bodyPaint = panelled(
  paint((p, n) => {
    const base = mix("#cfd5de", "#f4f6f9", noise(p, 0.4, 3));
    const grime = smoothstep(0.7, 0.0, p.y) * 0.5 + (n.y < -0.3 ? 0.4 : 0);
    return mix(base, "#2a2c33", Math.min(grime, 0.7) * smoothstep(0.35, 0.8, noise(p, 0.15, 5)) + grime * 0.3);
  }),
  { size: 0.55, aspect: 0.6, rivets: 0.07, seam: "#20232b" },
);
const steel = metal("steel", { tarnish: 0.4 });
const iron = metal("iron");

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 10) => new THREE.CylinderGeometry(r, r, h, s);

export default function build() {
  const b = createBuilder({ name: "riot_interceptor" });
  const ch = b.joint("chassis", { at: [0, 0.8, 0], role: "spine" });
  const P = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) =>
    b.part(g, c, { bone: ch, at: at as any, ...o });
  const G = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}, s = 1.4) => glow(P(g, c, at, o), s);

  // ---- chassis & lower hull
  P(box(2.2, 0.75, 5.4), bodyPaint, [0, 0.95, 0]);
  P(box(2.3, 0.12, 5.5), DK, [0, 0.58, 0]); // skid plate
  P(box(1.5, 0.12, 5.2), iron, [0, 0.48, 0]);
  for (const s of [1, -1]) {
    P(box(0.08, 0.5, 4.6), GR, [s * 1.12, 0.85, 0]); // side armour skirt
    G(box(0.05, 0.06, 4.4), CY, [s * 1.16, 0.62, 0], {}, 2); // underglow strip
    G(box(0.05, 0.04, 3.6), MG, [s * 1.16, 1.0, 0], {}, 1.6);
    // door seams + handles
    P(box(0.04, 0.7, 0.03), DK, [s * 1.11, 1.1, 0.75]);
    P(box(0.04, 0.7, 0.03), DK, [s * 1.11, 1.1, -0.45]);
    P(box(0.05, 0.05, 0.22), steel, [s * 1.12, 1.25, 0.55]);
    for (const z of [-2.2, -1.6, 1.8, 2.3]) P(cyl(0.025, 0.04, 6), steel, [s * 1.16, 0.95, z], { rotation: [0, 0, 90] });
    // fender flares
    for (const z of [1.7, -1.7]) {
      P(box(0.3, 0.1, 1.5), DK, [s * 1.05, 1.42, z]);
      P(box(0.34, 0.5, 0.1), DK, [s * 1.05, 1.15, z + 0.78]);
      P(box(0.34, 0.5, 0.1), DK, [s * 1.05, 1.15, z - 0.78]);
    }
    // side decal
    b.part(new THREE.PlaneGeometry(1.5, 0.56), "#ffffff", {
      bone: ch, at: [s * 1.121, 1.0, -0.9] as any, dir: [s, 0, 0], axis: "z", texture: logo,
    });
    b.part(new THREE.PlaneGeometry(0.7, 0.22), "#ffffff", {
      bone: ch, at: [s * 1.123, 1.35, 1.2] as any, dir: [s, 0, 0], axis: "z", texture: number,
    });
  }

  // ---- hood and nose
  b.frustumBox([0, 1.35, 1.25], [0, 1.2, 2.65], [2.2, 0.3], [2.1, 0.5], { bone: ch, color: bodyPaint });
  P(box(0.7, 0.05, 1.2), DK, [0, 1.52, 1.9], { rotation: [-4, 0, 0] }); // hood vent plate
  for (let i = 0; i < 5; i++) G(box(0.55, 0.012, 0.03), CY, [0, 1.555, 1.5 + i * 0.2], {}, 1.2);
  P(box(1.4, 0.45, 0.08), DK, [0, 1.0, 2.68]);
  b.part(new THREE.PlaneGeometry(1.3, 0.38), "#ffffff", { bone: ch, at: [0, 1.0, 2.725] as any, dir: [0, 0, 1], axis: "z", texture: grilleTex });
  for (const s of [1, -1]) {
    G(box(0.5, 0.08, 0.06), "#f2fbff", [s * 0.82, 1.2, 2.66], {}, 2); // slit headlights
    P(box(0.56, 0.04, 0.1), DK, [s * 0.82, 1.27, 2.64]);
    G(box(0.1, 0.1, 0.05), MG, [s * 1.0, 0.9, 2.68], {}, 1.5);
  }
  // push bar
  P(box(2.3, 0.3, 0.2), iron, [0, 0.62, 2.78]);
  P(box(2.2, 0.16, 0.06), "#ffffff", [0, 0.62, 2.9], { texture: chevrons });
  for (const s of [1, -1]) {
    P(box(0.14, 0.7, 0.14), GR, [s * 0.85, 0.95, 2.78]);
    P(box(0.14, 0.7, 0.14), GR, [s * 0.35 * -s, 0.95, 2.78]);
  }
  b.rod([-0.85, 1.28, 2.8], [0.85, 1.28, 2.8], 0.05, steel, { bone: ch, sides: 8 });
  for (let i = 0; i < 6; i++) b.spike([-0.75 + i * 0.3, 0.62, 2.88], [0, 0, 1], 0.12, 0.035, steel, { bone: ch, sides: 5 });
  P(cyl(0.12, 0.2, 10), DK, [0.0, 0.62, 2.95], { rotation: [90, 0, 0] }); // winch
  G(cyl(0.05, 0.02, 8), CY, [0, 0.62, 3.06], { rotation: [90, 0, 0] }, 2);

  // ---- cab
  P(box(2.1, 0.12, 2.0), bodyPaint, [0, 2.32, 0.2]); // roof
  P(box(2.2, 0.9, 0.12), bodyPaint, [0, 1.8, -0.8]); // rear wall
  P(box(2.2, 0.15, 1.9), bodyPaint, [0, 1.42, 0.2]);
  P(box(2.1, 0.1, 0.1), DK, [0, 1.4, 1.2]);
  for (const s of [1, -1]) {
    for (const z of [1.15, -0.8]) P(box(0.12, 0.95, 0.12), bodyPaint, [s * 1.0, 1.85, z]); // pillars
    P(box(0.06, 0.55, 1.6), "#0b2630", [s * 1.04, 1.9, 0.2]); // armoured side glass
    for (let i = 0; i < 6; i++) b.rod([s * 1.08, 1.62, -0.55 + i * 0.28], [s * 1.08, 2.18, -0.55 + i * 0.28], 0.012, steel, { bone: ch, sides: 4 });
    P(box(0.08, 0.06, 1.7), GR, [s * 1.06, 1.62, 0.2]);
    // mirrors
    b.rod([s * 1.08, 1.8, 1.1], [s * 1.4, 1.9, 1.2], 0.02, steel, { bone: ch, sides: 6 });
    P(box(0.06, 0.3, 0.2), DK, [s * 1.42, 1.9, 1.2]);
    G(box(0.02, 0.26, 0.04), CY, [s * 1.4, 1.9, 1.3], {}, 1.5);
  }
  // windscreen, raked
  P(box(1.9, 0.75, 0.06), "#12323d", [0, 1.92, 1.3], { rotation: [-18, 0, 0] });
  P(box(1.95, 0.07, 0.1), DK, [0, 2.3, 1.2]); // brow visor
  P(box(2.0, 0.06, 0.2), DK, [0, 2.22, 1.34]);
  P(box(1.9, 0.5, 0.05), "#12323d", [0, 1.9, -0.88]);
  // wiper
  b.rod([-0.6, 1.55, 1.42], [0.2, 1.7, 1.38], 0.012, DK, { bone: ch, sides: 4 });

  // ---- roof light bars
  P(box(2.0, 0.1, 0.22), DK, [0, 2.44, 1.05]);
  const cols = [CY, MG, CY, MG, MG, CY, MG, CY];
  cols.forEach((c, i) => G(box(0.23, 0.07, 0.04), c, [-0.88 + i * 0.25, 2.45, 1.17], {}, 2.2));
  P(box(1.4, 0.07, 0.16), DK, [0, 2.4, -0.7]);
  for (let i = 0; i < 6; i++) G(box(0.2, 0.05, 0.03), i % 2 ? MG : CY, [-0.55 + i * 0.22, 2.41, -0.79], {}, 2);
  for (const s of [1, -1]) {
    G(cyl(0.07, 0.1, 8), s > 0 ? CY : MG, [s * 0.95, 2.42, 0.5], {}, 2);
    b.rod([s * 0.9, 2.38, -0.4], [s * 0.95, 3.2, -0.55], 0.012, DK, { bone: ch, sides: 4 });
  }
  b.sweep(catmull([[0.9, 2.38, -0.35], [1.05, 2.9, -0.45], [0.95, 3.3, -0.6]]), 0.012, steel, { bone: ch, sides: 4 });

  // ---- rear deck, tank, hoses
  P(box(2.1, 0.12, 2.2), iron, [0, 1.42, -1.75]);
  for (const z of [-1.2, -2.3]) {
    P(box(1.8, 0.25, 0.14), DK, [0, 1.6, z]);
    b.part(new THREE.TorusGeometry(0.62, 0.035, 5, 14), steel, { bone: ch, at: [0, 2.1, z] as any });
  }
  P(cyl(0.58, 2.0, 14), bodyPaint, [0, 2.1, -1.75], { rotation: [90, 0, 0], flat: true });
  for (const z of [-0.72, -2.78]) P(cyl(0.5, 0.08, 14), steel, [0, 2.1, z], { rotation: [90, 0, 0], flat: true });
  b.part(new THREE.PlaneGeometry(1.4, 0.52), "#ffffff", { bone: ch, at: [0.595, 2.16, -1.75] as any, dir: [1, 0, 0], axis: "z", texture: logo, rotation: [0, 0, 0] });
  b.part(new THREE.PlaneGeometry(1.4, 0.52), "#ffffff", { bone: ch, at: [-0.595, 2.16, -1.75] as any, dir: [-1, 0, 0], axis: "z", texture: logo });
  G(box(0.05, 0.06, 1.6), CY, [0.0, 2.69, -1.75], {}, 1.6); // fill-level neon along top
  P(cyl(0.16, 0.14, 8), steel, [0, 2.75, -1.4]); // filler cap
  P(box(0.3, 0.05, 0.05), YL, [0, 2.84, -1.4]);
  P(cyl(0.05, 0.4, 6), steel, [0.35, 2.85, -2.2]);
  b.sweep(catmull([[0, 1.6, -0.75], [0.2, 1.5, -0.2], [0.35, 1.9, 0.0], [0.1, 2.5, 0.0]]), 0.045, DK, { bone: ch, sides: 7 });
  for (const t of [0.2, 0.5, 0.8]) P(cyl(0.06, 0.07, 8), steel, [0.2, 1.6 + t * 0.9, t * 0.0 - 0.1], { rotation: [90, 0, 0] });
  // rear lights + hazard
  P(box(2.0, 0.18, 0.08), "#ffffff", [0, 1.1, -2.72], { texture: chevrons });
  for (const s of [1, -1]) {
    G(box(0.5, 0.1, 0.05), "#ff1f3d", [s * 0.7, 1.35, -2.72], {}, 2);
    P(box(0.4, 0.3, 0.1), GR, [s * 0.7, 0.75, -2.78]);
  }
  P(box(2.3, 0.2, 0.14), iron, [0, 0.62, -2.78]);
  G(box(1.6, 0.04, 0.03), MG, [0, 0.72, -2.86], {}, 2);

  // ---- water cannon turret
  const yaw = b.joint("yaw", { parent: ch, at: [0, 2.4, 0.2], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 2.72, 0.2], dir: [0, 0, 1], role: "hinge" });
  b.part(new THREE.TorusGeometry(0.4, 0.04, 6, 16), steel, { bone: ch, at: [0, 2.4, 0.2] as any, rotation: [90, 0, 0] });
  b.part(cyl(0.34, 0.2, 12), bodyPaint, { } as any); // placeholder replaced below
  b.part(cyl(0.34, 0.2, 12), bodyPaint, { bone: yaw, at: [0, 2.52, 0.2] as any, flat: true });
  for (const s of [1, -1]) {
    b.part(box(0.07, 0.4, 0.4), GR, { bone: yaw, at: [s * 0.22, 2.68, 0.2] as any });
    G(box(0.02, 0.2, 0.3), s > 0 ? CY : MG, [s * 0.26, 2.7, 0.2], { bone: yaw }, 1.8);
  }
  b.part(cyl(0.12, 0.5, 10), DK, { bone: pitch, at: [0, 2.72, 0.35] as any, rotation: [90, 0, 0] });
  b.rod([0, 2.72, 0.5], [0, 2.72, 1.9], 0.1, steel, { bone: pitch, sides: 10 }); // barrel
  b.rod([0, 2.72, 1.9], [0, 2.72, 2.2], 0.15, DK, { bone: pitch, sides: 10 }); // nozzle
  for (const z of [0.9, 1.35, 1.8]) b.part(new THREE.TorusGeometry(0.115, 0.025, 5, 10), YL, { bone: pitch, at: [0, 2.72, z] as any });
  glow(b.part(cyl(0.09, 0.03, 10), CY, { bone: pitch, at: [0, 2.72, 2.21] as any, rotation: [90, 0, 0] }), 2.5);
  b.part(box(0.12, 0.18, 0.3), DK, { bone: pitch, at: [0, 2.9, 0.55] as any }); // sight
  glow(b.part(box(0.08, 0.06, 0.02), MG, { bone: pitch, at: [0, 2.92, 0.71] as any }), 2);
  b.part(box(0.22, 0.2, 0.4), GR, { bone: pitch, at: [0, 2.72, 0.0] as any });
  for (const z of [1.05, 1.6]) b.part(box(0.2, 0.05, 0.05), YL, { bone: pitch, at: [0, 2.85, z] as any });

  // ---- wheels (spin joints)
  const rng1 = rng(5);
  for (const [k, s, z] of [["FL", 1, 1.75], ["FR", -1, 1.75], ["RL", 1, -1.75], ["RR", -1, -1.75]] as const) {
    const hub = [s * 1.0, 0.55, z];
    const spin = b.joint(`wheel${k}`, { parent: ch, at: hub as any, dir: [0, 1, 0], role: "hinge" });
    const W = (g: THREE.BufferGeometry, c: any, dx = 0, o: any = {}) =>
      b.part(g, c, { bone: spin, at: [hub[0] + s * dx, hub[1], hub[2]] as any, rotation: [0, 0, 90], ...o });
    W(cyl(0.55, 0.42, 14), DK, 0, { flat: true });
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      b.part(box(0.44, 0.09, 0.14), "#0c0d11", {
        bone: spin, at: [hub[0], hub[1] + 0.56 * Math.cos(a), hub[2] + 0.56 * Math.sin(a)] as any,
        rotation: [(a * 180) / Math.PI, 0, 0],
      });
    }
    W(cyl(0.34, 0.1, 14), iron, 0.2, { flat: true });
    W(cyl(0.22, 0.06, 10), GR, 0.25, { flat: true });
    glow(b.part(new THREE.TorusGeometry(0.32, 0.018, 5, 18), s * z > 0 ? CY : MG, { bone: spin, at: [hub[0] + s * 0.26, hub[1], hub[2]] as any, rotation: [0, 90, 0] }), 2);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + rng1() * 0.01;
      b.part(cyl(0.025, 0.05, 6), steel, { bone: spin, at: [hub[0] + s * 0.29, hub[1] + 0.14 * Math.cos(a), hub[2] + 0.14 * Math.sin(a)] as any, rotation: [0, 0, 90] });
    }
    W(cyl(0.07, 0.1, 8), steel, 0.3);
    // suspension
    b.rod([s * 0.5, 0.75, z], [s * 0.9, 0.55, z], 0.05, steel, { bone: ch, sides: 6 });
    b.rod([s * 0.75, 0.7, z + 0.1], [s * 0.8, 1.2, z + 0.15], 0.04, YL, { bone: ch, sides: 6 });
  }

  // ---- antennas, camera pods, misc
  b.spike([-0.85, 2.38, 0.0], [0, 1, 0], 1.0, 0.018, DK, { bone: ch, sides: 5 });
  P(new THREE.SphereGeometry(0.1, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), "#0e3a47", [0.7, 2.38, -0.2]);
  P(cyl(0.12, 0.05, 10), DK, [0.7, 2.38, -0.2]);
  for (const s of [1, -1]) {
    P(box(0.3, 0.08, 0.3), YL, [s * 0.55, 1.58, 1.0]); // hood hazard blocks
    P(cyl(0.05, 0.3, 8), GR, [s * 0.5, 1.2, 2.3], { rotation: [90, 0, 0] }); // smoke launchers
  }
  P(new THREE.OctahedronGeometry(0.1), CY, [0, 1.62, 0.9], { flat: true });
  glow(P(new THREE.OctahedronGeometry(0.08), CY, [0, 2.0, 1.28]), 2);
  return b.root;
}
