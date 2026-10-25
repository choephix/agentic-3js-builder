```ts
import * as THREE from "three";
import { createBuilder, stripes, mottle, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Six-wheeled railgun carrier",
  description: "Six-wheel heavy railgun carrier with stabiliser legs deployed, low-poly sci-fi military.",
};

const OLIVE = "#59644a";
const DARK = "#2c3138";
const STEEL = "#7b838c";
const TYRE = "#1d1f22";
const ORANGE = "#e8832a";
const CYAN = "#5ee6ff";
const GLASS = "#173845";
const HULL = panelled(mottle("#62704f", "#4d5a40", { size: 0.8 }), { size: 0.9, rivets: 0.22 });
const GUNMETAL = metal("iron", { tarnish: 0.2 });
const HAZARD = stripes("#22252a", "#e8b02a", { size: 0.28, axis: "x", width: 0.55, wobble: 0.05 });

const bx = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cy = (r: number, h: number, n = 8) => new THREE.CylinderGeometry(r, r, h, n);

const EMBLEM = svg(
  `<svg viewBox="0 0 120 80"><rect x="2" y="2" width="116" height="76" rx="6" fill="#1b1e22" stroke="#e8832a" stroke-width="4"/>
  <circle cx="34" cy="40" r="22" fill="none" stroke="#5ee6ff" stroke-width="5"/>
  <path d="M34 14 L34 66 M8 40 L60 40" stroke="#5ee6ff" stroke-width="3"/>
  <path d="M62 30 L110 30 L110 38 L62 38Z M62 44 L110 44 L110 50 L62 50Z" fill="#e8832a"/>
  <text x="62" y="68" font-family="monospace" font-weight="bold" font-size="14" fill="#e9edf0">RG-6</text></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });
  const chassis = b.joint("chassis", { at: [0, 1.3, 0], role: "spine" });

  // ---------- hull
  const P = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) =>
    b.part(g, c, { bone: chassis, at: at as [number, number, number], ...o });
  P(bx(2.2, 0.9, 9.6), HULL, [0, 1.25, 0]); // lower hull
  P(bx(1.9, 0.12, 9.4), DARK, [0, 0.72, 0]); // belly plate
  P(bx(2.1, 0.5, 6.6), HULL, [0, 1.85, -1.5]); // rear deck
  P(bx(2.2, 0.9, 1.4), HULL, [0, 1.25, 5.0], { rotation: [0, 0, 0] });
  P(bx(2.2, 0.08, 1.4), HULL, [0, 1.5, 4.9], { rotation: [-20, 0, 0] }); // glacis
  // cab
  P(bx(2.2, 1.1, 1.9), HULL, [0, 2.25, 3.0]);
  P(bx(2.0, 0.9, 0.12), GLASS, [0, 2.4, 4.0], { rotation: [-25, 0, 0] });
  glow(P(bx(1.7, 0.08, 0.05), CYAN, [0, 2.7, 4.06], { rotation: [-25, 0, 0] }), 1.2);
  P(bx(2.3, 0.14, 2.0), DARK, [0, 2.86, 3.0]); // roof
  for (const s of [1, -1]) {
    P(bx(0.08, 0.5, 1.0), GLASS, [s * 1.12, 2.4, 3.2]);
    b.part(new THREE.PlaneGeometry(1.2, 0.8), "#ffffff", {
      bone: chassis, at: [s * 1.121, 1.3, -0.4], dir: [s, 0, 0], axis: "z", texture: EMBLEM,
    });
    P(bx(0.25, 0.5, 2.6), DARK, [s * 1.2, 1.15, 0.0]); // side skirt tool lockers
    for (const z of [-0.9, 0, 0.9]) P(cy(0.04, 0.06, 6), STEEL, [s * 1.34, 1.15, z], { rotation: [0, 0, 90] });
    // mirror
    b.rod([s * 1.1, 2.6, 3.9], [s * 1.5, 2.8, 4.0], 0.03, STEEL, { bone: chassis, sides: 6 });
    P(bx(0.06, 0.35, 0.22), DARK, [s * 1.5, 2.7, 4.0]);
    // headlights
    glow(P(bx(0.4, 0.14, 0.06), "#fff2b0", [s * 0.8, 1.5, 5.72]), 1.2);
    P(bx(0.5, 0.2, 0.08), DARK, [s * 0.8, 1.5, 5.68]);
  }
  // bumper
  P(bx(2.4, 0.4, 0.3), HAZARD, [0, 0.95, 5.8]);
  P(bx(1.0, 0.5, 0.1), DARK, [0, 1.3, 5.72]); // intake grille
  for (let i = 0; i < 5; i++) P(bx(0.9, 0.03, 0.04), STEEL, [0, 1.15 + i * 0.1, 5.78]);
  // rear
  P(bx(2.3, 0.4, 0.3), HAZARD, [0, 0.95, -4.9]);
  glow(P(bx(0.5, 0.1, 0.05), "#ff3b2e", [0.8, 1.6, -4.82]), 1.2);
  glow(P(bx(0.5, 0.1, 0.05), "#ff3b2e", [-0.8, 1.6, -4.82]), 1.2);
  // deck details
  for (let i = 0; i < 4; i++) P(bx(0.5, 0.06, 0.2), DARK, [0.7, 2.13, -3.9 + i * 0.3]); // vents
  P(cy(0.28, 0.5, 10), GUNMETAL, [-0.75, 2.3, -3.6]); // coolant tank
  P(cy(0.1, 0.12, 8), ORANGE, [-0.75, 2.6, -3.6]);
  P(bx(0.8, 0.5, 0.9), DARK, [0.7, 2.3, -3.0]); // power unit
  glow(P(bx(0.6, 0.06, 0.04), CYAN, [0.7, 2.35, -2.54]), 1.3);
  b.rod([-1.0, 2.2, 1.9], [-1.0, 4.4, 1.9], 0.025, STEEL, { bone: chassis, sides: 5 }); // antenna
  P(new THREE.SphereGeometry(0.06, 6, 4), ORANGE, [-1.0, 4.42, 1.9]);
  P(cy(0.2, 0.12, 8), DARK, [0.8, 2.99, 3.0]); // sensor
  P(new THREE.SphereGeometry(0.17, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), GLASS, [0.8, 3.03, 3.0]);

  // ---------- wheels
  const hubY = 0.75;
  for (const [zi, z] of [[0, 3.0], [1, 0.9], [2, -1.2]] as const) {
    for (const s of [1, -1]) {
      const tag = `${zi}${s > 0 ? "L" : "R"}`;
      const at: [number, number, number] = [s * 1.5, hubY, z];
      const spin = b.joint(`wheel${tag}`, { parent: chassis, at, dir: [0, 1, 0], role: "hinge" });
      b.part(cy(0.68, 0.62, 12), TYRE, { bone: spin, at, rotation: [0, 0, 90], flat: true });
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        b.part(bx(0.64 - (i % 2) * 0.1, 0.12, 0.26), TYRE, {
          bone: spin, flat: true,
          at: [s * 1.5 + (i % 2 ? 0.05 : -0.05), hubY + 0.68 * Math.cos(a), z + 0.68 * Math.sin(a)],
          rotation: [(a * 180) / Math.PI, 0, 0],
        });
      }
      b.part(cy(0.4, 0.66, 10), STEEL, { bone: spin, at, rotation: [0, 0, 90], flat: true });
      b.part(cy(0.28, 0.7, 6), DARK, { bone: spin, at: [s * 1.5 + s * 0.02, hubY, z], rotation: [0, 0, 90], flat: true });
      b.part(cy(0.12, 0.78, 6), ORANGE, { bone: spin, at: [s * 1.5 + s * 0.04, hubY, z], rotation: [0, 0, 90], flat: true });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        b.part(cy(0.03, 0.05, 6), STEEL, {
          bone: spin, at: [s * 1.84, hubY + 0.2 * Math.cos(a), z + 0.2 * Math.sin(a)], rotation: [0, 0, 90],
        });
      }
      b.rod([s * 1.1, hubY, z], [s * 1.5, hubY, z], 0.1, DARK, { bone: chassis, sides: 8 });
      P(bx(0.7, 0.1, 1.9), HULL, [s * 1.5, 1.62, z]); // fender
      P(bx(0.7, 0.3, 0.1), HULL, [s * 1.5, 1.5, z + 0.95], { rotation: [0, 0, 0] });
      P(bx(0.7, 0.25, 0.08), DARK, [s * 1.5, 0.45, z - 1.0]); // mud flap
    }
  }

  // ---------- stabiliser legs (deployed)
  for (const [name, sz, pz] of [["FL", 1, 4.4], ["RL", -1, -4.2]] as const) {
    for (const s of [1, -1]) {
      const hinge: [number, number, number] = [s * 1.1, 1.45, sz * 4.0];
      const pad: [number, number, number] = [s * 3.0, 0.14, pz];
      const leg = b.joint(`stab${name[0]}${s > 0 ? "L" : "R"}`, {
        parent: chassis, at: hinge, aim: pad, role: "leg",
      });
      const mid: [number, number, number] = [hinge[0] + (pad[0] - hinge[0]) * 0.45, hinge[1] + (pad[1] - hinge[1]) * 0.45, hinge[2] + (pad[2] - hinge[2]) * 0.45];
      b.part(bx(0.5, 0.45, 0.5), DARK, { bone: chassis, at: [s * 1.2, 1.45, sz * 4.0] }); // mount block
      b.rod(hinge, mid, 0.16, OLIVE, { bone: leg, sides: 8 });
      b.rod(mid, [pad[0], pad[1] + 0.12, pad[2]], 0.1, STEEL, { bone: leg, sides: 8 });
      b.part(cy(0.18, 0.12, 8), ORANGE, { bone: leg, at: mid });
      b.part(cy(0.5, 0.28, 8), HAZARD, { bone: leg, at: [pad[0], 0.14, pad[2]], flat: true }); // foot pad
      b.part(new THREE.SphereGeometry(0.16, 6, 4), STEEL, { bone: leg, at: [pad[0], 0.32, pad[2]], flat: true });
      b.rod([s * 1.2, 0.95, sz * 3.6], mid, 0.06, STEEL, { bone: leg, sides: 6 }); // brace
    }
  }

  // ---------- turret + railgun
  const pivot: [number, number, number] = [0, 2.1, -1.6];
  const yaw = b.joint("turretYaw", { parent: chassis, at: pivot, dir: [0, 1, 0], role: "hinge" });
  const pitchAt: [number, number, number] = [0, 3.2, -1.6];
  const pitch = b.joint("railPitch", { parent: yaw, at: pitchAt, dir: [0, 0, 1], role: "hinge" });
  b.part(new THREE.TorusGeometry(1.0, 0.1, 6, 16), STEEL, { bone: chassis, at: [0, 2.12, -1.6], rotation: [90, 0, 0] });
  b.part(cy(0.95, 0.5, 12), OLIVE, { bone: yaw, at: [0, 2.4, -1.6], flat: true });
  for (const s of [1, -1]) {
    b.part(bx(0.25, 1.2, 1.6), HULL, { bone: yaw, at: [s * 0.8, 3.1, -1.6] }); // cheeks
    b.part(cy(0.2, 0.2, 8), STEEL, { bone: yaw, at: [s * 0.95, 3.2, -1.6], rotation: [0, 0, 90] });
  }
  const Q = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) =>
    b.part(g, c, { bone: pitch, at: at as [number, number, number], ...o });
  Q(bx(1.1, 0.8, 1.6), GUNMETAL, [0, 3.2, -1.7]); // breech
  Q(bx(0.9, 0.5, 0.2), DARK, [0, 3.2, -2.6]);
  for (const s of [1, -1]) {
    Q(bx(0.2, 0.38, 7.6), STEEL, [s * 0.3, 3.2, 2.0]); // rails
    Q(bx(0.22, 0.1, 7.6), DARK, [s * 0.3, 3.45, 2.0]);
    for (const z of [-0.6, 0.6, 1.8]) {
      Q(cy(0.3, 1.0, 10), OLIVE, [s * 0.95, 3.1, z], { rotation: [90, 0, 0], flat: true }); // capacitor drums
      Q(cy(0.31, 0.08, 10), ORANGE, [s * 0.95, 3.1, z - 0.45], { rotation: [90, 0, 0] });
      glow(Q(cy(0.12, 0.05, 8), CYAN, [s * 0.95, 3.1, z + 0.52], { rotation: [90, 0, 0] }), 1.3);
    }
    Q(bx(0.1, 0.1, 5.2), DARK, [s * 0.65, 3.1, 2.4]); // power bus
  }
  glow(Q(bx(0.36, 0.1, 7.4), CYAN, [0, 3.2, 2.0]), 1.5); // rail gap glow
  Q(bx(0.36, 0.14, 0.9), DARK, [0, 3.2, 1.4]); // armature
  for (let i = 0; i < 6; i++) {
    const z = 0.6 + i * 1.1;
    Q(bx(1.0, 0.7, 0.14), HULL, [0, 3.2, z]); // clamp ribs
    glow(Q(new THREE.TorusGeometry(0.42, 0.03, 4, 12), CYAN, [0, 3.2, z + 0.08]), 1.2);
  }
  Q(bx(1.0, 0.8, 0.5), DARK, [0, 3.2, 5.9]); // muzzle block
  for (const s of [1, -1]) Q(bx(0.05, 0.5, 0.4), STEEL, [s * 0.52, 3.2, 5.9]);
  glow(Q(bx(0.4, 0.06, 0.05), CYAN, [0, 3.2, 6.17]), 1.4);
  b.part(bx(0.5, 0.35, 0.5), ORANGE, { bone: pitch, at: [0, 3.78, -1.8] }); // sight box
  b.part(cy(0.08, 0.3, 6), GLASS, { bone: pitch, at: [0, 3.78, -1.5], rotation: [90, 0, 0] });

  b.pose(pitch, { axis: [1, 0, 0], deg: -7 });
  return b.root;
}
```