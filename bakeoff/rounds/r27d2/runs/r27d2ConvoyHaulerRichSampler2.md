```ts
import * as THREE from "three";
import { createBuilder, paint, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { panelled } from "agentic-3js-builder/kits/clockwork";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Convoy Hauler MK-V",
  description:
    "Low-poly cyberpunk armoured six-wheel convoy hauler: plated cab with roof gun, neon-seamed octagonal sealed cargo pod, rear remote cannon.",
};

// ---------- palette
const CY = "#2bf0ff";
const MG = "#ff2bd6";
const AMB = "#ffb000";
const RED = "#ff2a2a";
const HAZ = "#f2c20a";
const STEEL = "#7a828f";
const DARK = "#14171c";
const TYRE = "#16181b";
const RIB = "#1d2128";
const GLASS = "#0b1c26";

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);
type V3 = [number, number, number];

// ---------- paints
const hull = paint((p, n) => {
  let c = mix("#272d37", "#3b4452", noise(p, 0.5, 3));
  c = mix(c, "#12151a", smoothstep(1.7, 1.0, p.y) * (0.35 + 0.5 * noise(p, 0.18, 5)));
  if (n.y > 0.7) c = mix(c, "#6a778a", 0.28 * noise(p, 0.14, 8));
  if (noise(p, 0.05, 11) > 0.8) c = mix(c, "#7d8794", 0.5); // chipped paint
  return c;
});
const ARMOUR = panelled(hull, { size: 0.9, aspect: 0.7, rivets: 0.14 });
const HAZARD = paint((p) => ((((Math.floor((p.x + p.y + p.z) / 0.1) % 2) + 2) % 2) ? HAZ : "#15161a"));

// ---------- textures
const FONT = 'font-family="Arial Black, Arial, sans-serif" font-weight="900"';
const SCREEN_TEX = svg(
  `<svg viewBox="0 0 200 80"><rect width="200" height="80" fill="#07141c"/>
  <polygon points="0,0 60,0 30,80 0,80" fill="#0e2a38"/><polygon points="120,0 150,0 120,80 90,80" fill="#0e2a38"/>
  <rect x="10" y="34" width="180" height="6" fill="#2bf0ff"/><rect x="10" y="48" width="110" height="3" fill="#ff2bd6"/>
  <rect x="10" y="12" width="40" height="4" fill="#2bf0ff"/><text x="190" y="22" text-anchor="end" font-family="monospace" font-size="12" fill="#2bf0ff">LINK 99%</text></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 160 110"><rect x="2" y="2" width="156" height="106" rx="8" fill="#10131a" stroke="#f2c20a" stroke-width="4"/>
  <polygon points="50,14 84,14 100,44 84,74 50,74 34,44" fill="none" stroke="#2bf0ff" stroke-width="4"/>
  <polygon points="58,28 76,28 85,44 76,60 58,60 49,44" fill="#ff2bd6"/>
  <polyline points="20,86 40,96 60,86" fill="none" stroke="#f2c20a" stroke-width="5"/>
  <polyline points="100,86 120,96 140,86" fill="none" stroke="#f2c20a" stroke-width="5"/>
  <text x="130" y="38" text-anchor="middle" ${FONT} font-size="20" fill="#f2f2f2">SEALED</text>
  <text x="130" y="58" text-anchor="middle" font-family="monospace" font-size="12" fill="#2bf0ff">PAYLOAD 7C</text></svg>`,
  { size: 384 },
);
const DOOR_TEX = svg(
  `<svg viewBox="0 0 120 56"><rect x="3" y="3" width="114" height="50" rx="6" fill="#0d0f13" stroke="#ff2bd6" stroke-width="4"/>
  <text x="60" y="40" text-anchor="middle" ${FONT} font-size="30" fill="#f2f2f2">CV-77</text></svg>`,
  { size: 256 },
);
const REAR_TEX = svg(
  `<svg viewBox="0 0 160 60"><rect width="160" height="60" fill="#0d0f13" stroke="#f2c20a" stroke-width="4"/>
  <polygon points="26,8 48,48 4,48" fill="#f2c20a"/><rect x="24" y="22" width="4" height="14" fill="#111"/>
  <text x="104" y="26" text-anchor="middle" ${FONT} font-size="16" fill="#f2f2f2">CLASS-5</text>
  <text x="104" y="46" text-anchor="middle" font-family="monospace" font-size="12" fill="#ff2bd6">DO NOT OPEN</text></svg>`,
  { size: 320 },
);

export default function build() {
  const b = createBuilder({ name: "hauler" });
  const chassis = b.joint("chassis", { at: [0, 0.9, 0], role: "spine" });
  const add = (g: THREE.BufferGeometry, color: any, at: V3, o: any = {}) => b.part(g, color, { bone: chassis, at, ...o });
  const rod = (a: V3, c: V3, r: number, color: any, sides = 6) => b.rod(a, c, r, color, { bone: chassis, sides });
  const plane = (tex: THREE.Texture, w: number, h: number, at: V3, dir: V3, lit = 0, rot?: V3) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
      bone: chassis,
      at,
      ...(rot ? { rotation: rot } : { dir, axis: "z", up: [0, 1, 0] }),
      texture: tex,
    });
    return lit ? glow(p, lit) : p;
  };

  // ---------- frame and running gear
  for (const s of [1, -1]) {
    add(box(0.2, 0.3, 8.8), DARK, [s * 0.7, 0.9, -0.2]);
    add(cyl(0.28, 1.5, 10), STEEL, [s * 1.0, 0.72, 0.65], { rotation: [90, 0, 0], flat: true }); // fuel tank
    for (const dz of [-0.3, 0.3]) add(box(0.06, 0.08, 0.5), DARK, [s * 1.0, 0.95, 0.65 + dz * 2]);
    // mid skirt
    add(box(0.06, 0.5, 2.8), ARMOUR, [s * 1.42, 1.05, 0.65]);
    add(box(0.07, 0.07, 2.8), HAZARD, [s * 1.42, 0.78, 0.65]);
    glow(rod([s * 1.46, 1.3, -0.7], [s * 1.46, 1.3, 2.0], 0.025, s > 0 ? MG : CY), 1.6);
    // underglow
    glow(rod([s * 0.95, 0.62, -3.8], [s * 0.95, 0.62, 3.6], 0.03, s > 0 ? CY : MG), 1.5);
  }
  for (const z of [-4.2, -2.4, -0.8, 1.0, 2.9, 4.0]) add(box(1.5, 0.12, 0.14), DARK, [0, 0.82, z]);
  rod([0, 0.7, 2.9], [0, 0.7, -3.0], 0.07, STEEL, 8); // driveshaft
  const axles = [2.9, -1.6, -3.0];
  axles.forEach((z, i) => {
    rod([-1.3, 0.62, z], [1.3, 0.62, z], 0.09, DARK, 8);
    add(new THREE.SphereGeometry(0.28, 8, 6), STEEL, [0, 0.62, z], { flat: true }); // differential
    add(box(0.5, 0.06, 0.04), HAZ, [0, 0.62, z + 0.27]);
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const j = b.joint(`wheel${side}${i}`, { parent: chassis, at: [s * 1.3, 0.62, z], dir: [1, 0, 0], role: "hinge" });
      const o = { bone: j };
      b.part(cyl(0.62, 0.46, 12), TYRE, { ...o, at: [s * 1.3, 0.62, z], rotation: [0, 0, 90], flat: true });
      b.part(cyl(0.64, 0.12, 12), "#0c0d0f", { ...o, at: [s * 1.3, 0.62, z], rotation: [0, 0, 90], flat: true });
      b.part(cyl(0.38, 0.5, 10), "#4a515b", { ...o, at: [s * 1.3, 0.62, z], rotation: [0, 0, 90], flat: true });
      b.part(cyl(0.3, 0.1, 10), DARK, { ...o, at: [s * 1.56, 0.62, z], rotation: [0, 0, 90], flat: true });
      b.part(cyl(0.1, 0.16, 6), STEEL, { ...o, at: [s * 1.6, 0.62, z], rotation: [0, 0, 90] });
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        b.part(cyl(0.025, 0.06, 6), STEEL, {
          ...o,
          at: [s * 1.6, 0.62 + 0.22 * Math.cos(a), z + 0.22 * Math.sin(a)],
          rotation: [0, 0, 90],
        });
      }
      glow(b.part(new THREE.TorusGeometry(0.43, 0.022, 5, 16), (i + (s > 0 ? 0 : 1)) % 2 ? CY : MG, { ...o, at: [s * 1.57, 0.62, z], rotation: [0, 90, 0] }), 1.6);
      // mud flap
      add(box(0.5, 0.45, 0.04), RIB, [s * 1.3, 0.55, z - 0.78]);
    }
  });
  // front fenders
  for (const s of [1, -1]) {
    add(box(0.6, 0.08, 1.7), ARMOUR, [s * 1.3, 1.34, 2.95]);
    add(box(0.6, 0.08, 0.5), ARMOUR, [s * 1.3, 1.22, 3.95], { rotation: [-25, 0, 0] });
    add(box(0.08, 0.3, 1.7), HAZARD, [s * 1.58, 1.2, 2.95]);
  }

  // ---------- cab
  b.extrude(
    [
      [1.8, 1.0], [4.5, 1.0], [4.5, 1.65], [3.55, 2.2], [3.0, 3.3], [1.9, 3.3], [1.8, 3.2],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.2, bevel: 0.05, color: ARMOUR, bone: chassis },
  );
  plane(SCREEN_TEX, 2.0, 0.9, [0, 2.75 + 0.02, 3.27 + 0.04], [0, 0, 1], 0.9, [-24.4, 0, 0]);
  add(box(2.3, 0.12, 0.5), ARMOUR, [0, 3.34, 3.0], { rotation: [-10, 0, 0] }); // brow
  add(box(0.1, 1.0, 0.1), DARK, [0.97, 2.75, 3.28], { rotation: [-24.4, 0, 0] });
  add(box(0.1, 1.0, 0.1), DARK, [-0.97, 2.75, 3.28], { rotation: [-24.4, 0, 0] });
  // hood armour ribs
  for (const dx of [-0.7, 0, 0.7]) add(box(0.14, 0.06, 1.0), DARK, [dx, 1.95, 4.0], { rotation: [-30, 0, 0] });
  for (const s of [1, -1]) {
    // door
    add(box(0.05, 1.0, 1.2), RIB, [s * 1.11, 1.75, 2.45]);
    add(box(0.08, 0.06, 0.25), STEEL, [s * 1.13, 1.9, 2.0]);
    plane(DOOR_TEX, 0.7, 0.33, [s * 1.14, 1.35, 2.45], [s, 0, 0]);
    // side window slit
    add(box(0.05, 0.42, 0.9), GLASS, [s * 1.11, 2.8, 2.55]);
    glow(add(box(0.06, 0.04, 0.85), CY, [s * 1.12, 2.62, 2.55]), 1.4);
    // side armour plate (angled)
    add(box(0.07, 0.8, 0.9), ARMOUR, [s * 1.14, 2.75, 2.55], { rotation: [0, 0, s * 6] });
    // exhaust stack
    add(cyl(0.1, 1.9, 8), STEEL, [s * 1.18, 2.7, 1.95]);
    add(cyl(0.14, 0.12, 8), DARK, [s * 1.18, 3.7, 1.95]);
    glow(add(cyl(0.09, 0.04, 8), AMB, [s * 1.18, 3.74, 1.95]), 1.2);
    for (const y of [1.9, 2.5, 3.1]) add(box(0.06, 0.06, 0.2), DARK, [s * 1.1, y, 1.95]);
    // mirror
    rod([s * 1.1, 2.7, 3.15], [s * 1.55, 2.9, 3.3], 0.025, STEEL);
    add(box(0.1, 0.4, 0.28), DARK, [s * 1.6, 2.9, 3.3]);
    glow(add(box(0.02, 0.3, 0.2), CY, [s * 1.66, 2.9, 3.3]), 1.2);
    // headlights
    glow(add(box(0.34, 0.14, 0.05), "#fff6d0", [s * 0.95, 1.38, 4.52]), 1.5);
    add(box(0.4, 0.2, 0.04), DARK, [s * 0.95, 1.38, 4.5]);
    // bumper corner plates
    add(box(0.8, 0.5, 0.12), ARMOUR, [s * 1.2, 1.0, 4.45], { rotation: [0, -s * 35, 0] });
  }
  // grille
  add(box(1.1, 0.5, 0.06), DARK, [0, 1.35, 4.52]);
  for (let k = 0; k < 4; k++) glow(add(box(0.9, 0.03, 0.03), CY, [0, 1.2 + k * 0.1, 4.56]), 1.3);
  // bumper
  add(box(2.7, 0.45, 0.35), ARMOUR, [0, 0.98, 4.62]);
  add(box(2.7, 0.08, 0.37), HAZARD, [0, 0.78, 4.62]);
  for (let k = -3; k <= 3; k++) b.spike([k * 0.38, 0.98, 4.75], [0, 0, 1], 0.3, 0.075, STEEL, { sides: 5, bone: chassis });
  add(box(0.6, 0.3, 0.06), DARK, [0, 0.98, 5.08]);
  glow(add(box(0.4, 0.05, 0.02), RED, [0, 0.98, 5.12]), 1.3);
  // tow hooks
  for (const s of [1, -1]) add(new THREE.TorusGeometry(0.07, 0.02, 5, 8, Math.PI), STEEL, [s * 0.9, 0.7, 4.8], { rotation: [0, 0, 180] });

  // roof light bar + antennas
  add(box(1.5, 0.1, 0.14), DARK, [0, 3.4, 2.85]);
  for (let k = 0; k < 5; k++) glow(add(box(0.22, 0.06, 0.04), k % 2 ? MG : CY, [-0.56 + k * 0.28, 3.42, 2.92]), 1.8);
  for (const s of [1, -1]) {
    b.spike([s * 0.9, 3.3, 2.2], [0, 1, 0], 1.3, 0.025, STEEL, { sides: 5, bone: chassis });
    glow(add(new THREE.SphereGeometry(0.04, 5, 4), RED, [s * 0.9, 4.65, 2.2], { flat: true }), 1.6);
  }

  // ---------- turret builder
  function turret(tag: string, base: V3, k: number, len: number, twin: boolean) {
    const [x, y, z] = base;
    add(new THREE.TorusGeometry(0.46 * k, 0.04 * k, 6, 14), STEEL, [x, y + 0.03, z], { rotation: [90, 0, 0] });
    const yaw = b.joint(`yaw${tag}`, { parent: chassis, at: [x, y + 0.05, z], role: "hinge" });
    const pitch = b.joint(`pitch${tag}`, { parent: yaw, at: [x, y + 0.5 * k, z + 0.1 * k], dir: [0, 0, 1], role: "hinge" });
    b.part(cyl(0.4 * k, 0.28 * k, 10), ARMOUR, { bone: yaw, at: [x, y + 0.2 * k, z], flat: true });
    for (const s of [1, -1]) {
      b.part(box(0.06 * k, 0.4 * k, 0.5 * k), ARMOUR, { bone: yaw, at: [x + s * 0.28 * k, y + 0.5 * k, z] });
      b.part(box(0.22 * k, 0.24 * k, 0.4 * k), DARK, { bone: yaw, at: [x + s * 0.5 * k, y + 0.28 * k, z - 0.1 * k] });
      glow(b.part(box(0.2 * k, 0.03 * k, 0.04 * k), AMB, { bone: yaw, at: [x + s * 0.5 * k, y + 0.4 * k, z + 0.1 * k] }), 1.3);
    }
    b.part(box(0.5 * k, 0.36 * k, 0.8 * k), ARMOUR, { bone: pitch, at: [x, y + 0.5 * k, z + 0.2 * k] });
    b.part(box(0.4 * k, 0.05 * k, 0.5 * k), DARK, { bone: pitch, at: [x, y + 0.7 * k, z + 0.1 * k] });
    glow(b.part(new THREE.SphereGeometry(0.07 * k, 6, 4), CY, { bone: pitch, at: [x + 0.18 * k, y + 0.62 * k, z + 0.6 * k], flat: true }), 1.6);
    const xs = twin ? [-0.15 * k, 0.15 * k] : [0];
    for (const dx of xs) {
      b.rod([x + dx, y + 0.5 * k, z + 0.5 * k], [x + dx, y + 0.5 * k, z + len], 0.055 * k, STEEL, { bone: pitch, sides: 8 });
      b.part(box(0.14 * k, 0.14 * k, 0.2 * k), DARK, { bone: pitch, at: [x + dx, y + 0.5 * k, z + len] });
      b.part(cyl(0.085 * k, 0.3 * k, 8), DARK, { bone: pitch, at: [x + dx, y + 0.5 * k, z + 0.9 * k], rotation: [90, 0, 0] });
      glow(b.part(cyl(0.03 * k, 0.02, 6), MG, { bone: pitch, at: [x + dx, y + 0.5 * k, z + len + 0.11 * k], rotation: [90, 0, 0] }), 1.4);
    }
  }
  turret("F", [0, 3.3, 2.35], 1, 1.7, true);

  // ---------- fifth wheel / coupling
  add(cyl(0.55, 0.12, 12), STEEL, [0, 1.12, 1.6], { flat: true });
  add(box(1.4, 0.2, 0.5), DARK, [0, 1.0, 1.7]);
  for (const s of [1, -1]) rod([s * 0.3, 1.4, 1.8], [s * 0.3, 2.9, 1.65], 0.035, MG, 6), glow(add(new THREE.SphereGeometry(0.001, 3, 2), MG, [0, 0, 0]), 0);

  // ---------- cargo pod
  const oct = (hw: number, h: number, c: number): [number, number][] => [
    [-hw + c, 0], [hw - c, 0], [hw, c], [hw, h - c], [hw - c, h], [-hw + c, h], [-hw, h - c], [-hw, c],
  ];
  b.extrude(oct(1.35, 2.2, 0.5), { at: [0, 1.3, -1.4], x: [1, 0, 0], y: [0, 1, 0], thickness: 5.8, bevel: 0.04, color: ARMOUR, bone: chassis });
  for (const z of [-4.1, -2.7, -1.3, 0.1, 1.3]) {
    b.extrude(oct(1.42, 2.3, 0.52), { at: [0, 1.25, z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.22, bevel: 0.03, color: RIB, bone: chassis });
    add(box(0.5, 0.08, 0.26), HAZARD, [0, 3.58, z]); // top clamp
  }
  for (const z of [-3.4, -2.0, -0.6, 0.7]) {
    b.extrude(oct(1.37, 2.22, 0.5), { at: [0, 1.29, z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.07, color: z > -1 ? MG : CY, bone: chassis });
  }
  // glow ring parts made earlier are plain; make seams emissive via rods on top chamfers
  for (const s of [1, -1]) {
    glow(rod([s * 0.85, 3.53, -4.2], [s * 0.85, 3.53, 1.4], 0.035, MG), 1.6);
    glow(rod([s * 1.37, 1.9, -4.2], [s * 1.37, 1.9, 1.4], 0.03, CY), 1.6);
    plane(EMBLEM, 1.7, 1.17, [s * 1.37, 2.55, -1.8], [s, 0, 0]);
    add(box(0.05, 0.4, 1.2), DARK, [s * 1.37, 1.6, -0.2]); // access plate
    for (const dz of [-0.6, 0.6]) add(cyl(0.04, 0.05, 6), STEEL, [s * 1.4, 1.6, -0.2 + dz * 0.8], { rotation: [0, 0, 90] });
    // seal clamps
    for (const z of [-3.4, -2.0]) {
      add(box(0.12, 0.7, 0.3), HAZARD, [s * 1.4, 1.75, z]);
      glow(add(cyl(0.07, 0.04, 8), RED, [s * 1.47, 1.75, z], { rotation: [0, 0, 90] }), 1.6);
    }
  }
  // pod top gear
  add(box(1.2, 0.08, 1.2), RIB, [0, 3.53, -0.5]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(cyl(0.03, 0.04, 6), STEEL, [sx * 0.5, 3.59, -0.5 + sz * 0.5]);
  for (let k = 0; k < 6; k++) rod([-0.4 + k * 0.16, 3.6, -0.9], [-0.4 + k * 0.16, 3.6, -0.1], 0.015, STEEL, 4);
  add(box(0.9, 0.14, 0.7), DARK, [0, 3.62, -2.0]); // vent housing
  for (let k = 0; k < 4; k++) add(box(0.8, 0.02, 0.06), STEEL, [0, 3.7, -2.2 + k * 0.14], { rotation: [25, 0, 0] });
  // beacon
  const beacon = b.joint("beacon", { parent: chassis, at: [0, 3.55, 0.7], role: "hinge" });
  b.part(cyl(0.14, 0.06, 8), DARK, { bone: chassis, at: [0, 3.58, 0.7] });
  b.part(box(0.12, 0.1, 0.03), STEEL, { bone: beacon, at: [0, 3.7, 0.74] });
  glow(b.part(new THREE.SphereGeometry(0.13, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), MG, { bone: beacon, at: [0, 3.61, 0.7], flat: true }), 1.8);
  // antenna dish
  rod([0.85, 3.5, -3.0], [0.85, 4.1, -3.0], 0.03, STEEL);
  b.lathe([[0, 0], [0.25, 0.1], [0.25, 0.12], [0, 0.03]], { at: [0.85, 4.1, -3.0], axis: [0, 0.6, -0.8], segments: 10, color: STEEL, bone: chassis });
  // rear turret
  turret("R", [0, 3.55, -3.5], 0.8, 1.5, false);

  // ---------- rear door
  const rz = -4.3;
  add(box(2.0, 1.75, 0.08), DARK, [0, 2.4, rz - 0.04]);
  add(box(0.06, 1.7, 0.06), STEEL, [0, 2.4, rz - 0.1]);
  for (const y of [1.85, 2.4, 2.95]) {
    add(box(2.1, 0.1, 0.09), STEEL, [0, y, rz - 0.12]);
    for (const s of [1, -1]) glow(add(box(0.12, 0.06, 0.04), y === 2.4 ? RED : AMB, [s * 0.8, y, rz - 0.18]), 1.6);
  }
  for (const s of [1, -1]) for (const y of [1.85, 2.95]) add(cyl(0.07, 0.2, 6), STEEL, [s * 1.0, y, rz - 0.06], { rotation: [0, 0, 90] }); // hinges
  add(new THREE.TorusGeometry(0.2, 0.035, 6, 10), STEEL, [0, 2.4, rz - 0.2]);
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    rod([0, 2.4, rz - 0.2], [0.2 * Math.cos(a), 2.4 + 0.2 * Math.sin(a), rz - 0.2], 0.015, STEEL, 4);
  }
  plane(REAR_TEX, 1.2, 0.45, [0, 1.68, rz - 0.1], [0, 0, -1]);
  // tail bumper + lights
  add(box(2.7, 0.4, 0.3), HAZARD, [0, 1.0, -4.45]);
  for (const s of [1, -1]) {
    glow(add(box(0.3, 0.14, 0.05), RED, [s * 1.0, 1.35, -4.6]), 1.6);
    add(cyl(0.07, 0.4, 8), DARK, [s * 0.5, 0.9, -4.45], { rotation: [90, 0, 0] }); // exhaust tips
    glow(add(cyl(0.05, 0.03, 8), AMB, [s * 0.5, 0.9, -4.66], { rotation: [90, 0, 0] }), 1.2);
    add(new THREE.TorusGeometry(0.08, 0.02, 5, 8, Math.PI), STEEL, [s * 1.1, 0.75, -4.65], { rotation: [0, 0, 180] });
  }

  return b.root;
}
```