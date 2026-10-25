```ts
import * as THREE from "three";
import { createBuilder, rng, svg, paint, mix, noise, smoothstep, catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Ghost Rat Hover Pickup",
  description:
    "A militarized pickup converted to hover: four ducted fan nacelles, armored cab, roof turret, rocket launcher and fusion core in the bed, neon underglow, low-poly cyberpunk.",
};

// ---------------------------------------------------------------- palette
const DARK = "#14171f";
const STEEL = "#6b7385";
const GUNM = "#2b303b";
const CYAN = "#25f2ff";
const MAG = "#ff2bd6";
const AMBER = "#ffb62b";
const GLASS = "#0f3440";
const RUBBER = "#1c1e24";

// ---------------------------------------------------------------- paints
const BODY = paint((p, n) => {
  let c = mix("#2c3342", "#485267", noise(p, 0.55, 3));
  c = mix(c, "#171a22", smoothstep(0.55, 0.9, noise(p, 0.09, 5)) * 0.55);
  c = mix(c, "#5a4a3a", 0.4 * smoothstep(0.85, 0.35, p.y)); // road dust low down
  if (n.y > 0.7) c = mix(c, "#7a88a2", 0.22); // sky-lit roof
  const zz = (((p.z / 0.8) % 1) + 1) % 1;
  if (Math.abs(zz - 0.5) > 0.488) c = mix(c, "#0b0d12", 0.8); // panel seams
  if (Math.abs(n.x) > 0.7) {
    if (Math.abs(p.y - 1.12) < 0.022) return CYAN_RGB; // racing stripe
    if (Math.abs(p.y - 1.07) < 0.008) return MAG_RGB;
  }
  return c;
});
const CYAN_RGB: [number, number, number] = [0.15, 0.95, 1];
const MAG_RGB: [number, number, number] = [1, 0.17, 0.84];
const ARMOR = paint((p, n) => {
  let c = mix("#232833", "#3b4354", noise(p, 0.3, 8));
  c = mix(c, "#0d0f14", smoothstep(0.6, 0.85, noise(p, 0.05, 2)) * 0.6); // scuffs
  if (n.y > 0.6) c = mix(c, "#6f7d96", 0.18);
  return c;
});
const METAL = paint((p, n) => {
  let c = mix("#4c5466", "#8a93a8", noise(p, 0.12, 11));
  c = mix(c, "#1b1d24", smoothstep(0.55, 0.85, noise(p, 0.04, 4)) * 0.5);
  return n.y > 0.5 ? mix(c, "#c4cde0", 0.2) : c;
});

// ---------------------------------------------------------------- textures
let hz = "";
for (let i = -4; i < 14; i++) hz += `<polygon points="${i * 8},32 ${i * 8 + 8},32 ${i * 8 + 24},0 ${i * 8 + 16},0" fill="#ffc21a"/>`;
const HAZARD = svg(
  `<svg viewBox="0 0 96 32"><rect width="96" height="32" fill="#15171c"/>${hz}<rect width="96" height="32" fill="none" stroke="#000" stroke-width="3"/></svg>`,
  { size: 192 },
);
const NUM = svg(
  `<svg viewBox="0 0 64 40"><rect x="1" y="1" width="62" height="38" rx="5" fill="#0a0c12" stroke="#ff2bd6" stroke-width="2.5"/>
  <text x="32" y="29" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="28" fill="#ff2bd6">07</text>
  <rect x="6" y="5" width="52" height="2" fill="#25f2ff"/></svg>`,
  { size: 192 },
);
const SIGN = svg(
  `<svg viewBox="0 0 128 48"><rect x="2" y="2" width="124" height="44" rx="8" fill="#0a0c14" stroke="#25f2ff" stroke-width="3"/>
  <text x="64" y="30" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="19" fill="#ff2bd6">GHOST RAT</text>
  <path d="M10 39 H118" stroke="#ffb62b" stroke-width="2"/><circle cx="14" cy="14" r="3" fill="#25f2ff"/><circle cx="114" cy="14" r="3" fill="#25f2ff"/></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64"><polygon points="32,3 58,18 58,46 32,61 6,46 6,18" fill="#10131b" stroke="#25f2ff" stroke-width="3"/>
  <ellipse cx="32" cy="28" rx="15" ry="14" fill="#ff2bd6"/><rect x="24" y="38" width="16" height="10" rx="2" fill="#ff2bd6"/>
  <ellipse cx="26" cy="28" rx="4.5" ry="5.5" fill="#10131b"/><ellipse cx="38" cy="28" rx="4.5" ry="5.5" fill="#10131b"/>
  <path d="M30 36 L32 32 L34 36Z" fill="#10131b"/><path d="M27 43v5M32 43v5M37 43v5" stroke="#10131b" stroke-width="1.6"/></svg>`,
  { size: 192 },
);
const SCREEN = svg(
  `<svg viewBox="0 0 64 48"><rect width="64" height="48" fill="#041016"/>
  <circle cx="32" cy="24" r="20" fill="none" stroke="#25f2ff" stroke-width="1.2"/><circle cx="32" cy="24" r="12" fill="none" stroke="#25f2ff" stroke-width="1"/>
  <path d="M32 24 L50 12" stroke="#7dffb0" stroke-width="2"/><path d="M12 24H52M32 4V44" stroke="#0e5560" stroke-width="1"/>
  <circle cx="22" cy="18" r="2" fill="#ff2bd6"/><circle cx="41" cy="31" r="2" fill="#ff2bd6"/><rect x="2" y="2" width="60" height="44" fill="none" stroke="#25f2ff" stroke-width="2"/></svg>`,
  { size: 192 },
);
const WARN = svg(
  `<svg viewBox="0 0 48 48"><polygon points="24,3 46,43 2,43" fill="#ffc21a" stroke="#111" stroke-width="3" stroke-linejoin="round"/>
  <path d="M27 14 L19 28 H25 L21 38 L31 23 H25Z" fill="#111"/></svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------- builder + helpers
export default function build() {
  const b = createBuilder({ name: "hoverTruck" });
  const chassis = b.joint("chassis", { at: [0, 0.7, 0], role: "spine" });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);
  type V = [number, number, number];
  const P = (geo: THREE.BufferGeometry, color: any, at: V, o: any = {}) =>
    b.part(geo, color, { bone: chassis, at, flat: true, ...o });
  const N = (geo: THREE.BufferGeometry, color: string, at: V, o: any = {}, k = 1) => glow(P(geo, color, at, o), k);
  const rod = (a: V, c: V, r: number, color: any, o: any = {}) => b.rod(a, c, r, color, { bone: chassis, sides: 6, ...o });
  const decal = (tex: THREE.Texture, w: number, h: number, at: V, dir: V, g = 0, o: any = {}) => {
    const part = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: chassis, at, dir, axis: "z", texture: tex, ...o });
    return g ? glow(part, g) : part;
  };
  const bolts = (pts: V[], dir: V, r = 0.022, color: any = STEEL) =>
    pts.forEach((p) => P(cyl(r, 0.03, 6), color, p, { dir }));

  // ------------------------------------------------ hull, frame, skids
  P(box(1.7, 0.3, 5.4), GUNM, [0, 0.62, -0.1]);
  P(box(1.5, 0.12, 5.2), DARK, [0, 0.45, -0.1]); // belly plate
  for (let i = 0; i < 6; i++) P(box(1.52, 0.04, 0.06), STEEL, [0, 0.38, -2.4 + i * 0.95]); // belly ribs
  for (const s of [1, -1]) {
    rod([s * 0.58, 0.06, -2.7], [s * 0.58, 0.06, 2.5], 0.06, RUBBER, { sides: 8 }); // skid
    P(new THREE.SphereGeometry(0.06, 6, 4), RUBBER, [s * 0.58, 0.06, 2.55]);
    for (const z of [-2.2, -0.9, 0.6, 1.9]) rod([s * 0.58, 0.06, z], [s * 0.6, 0.5, z], 0.035, STEEL);
    N(box(0.04, 0.04, 4.6), CYAN, [s * 0.88, 0.48, -0.1]); // underglow strips
    N(box(0.04, 0.04, 4.6), MAG, [s * 0.88, 0.42, -0.1]);
    P(box(0.06, 0.2, 5.0), ARMOR, [s * 0.88, 0.68, -0.1]); // side sill armor
    for (let i = 0; i < 6; i++) P(box(0.07, 0.06, 0.1), STEEL, [s * 0.9, 0.68, -2.3 + i * 0.9]);
  }

  // ------------------------------------------------ hover nacelles
  const fans: THREE.Object3D[] = [];
  const pod = (s: number, zs: number) => {
    const x = s * 1.32;
    const z = zs * 1.6;
    const tag = (s > 0 ? "L" : "R") + (zs > 0 ? "F" : "R");
    const y0 = 0.25; // pod bottom
    // pylon arm and wing stub
    rod([s * 0.8, 0.7, z], [x - s * 0.2, 0.55, z], 0.09, GUNM, { sides: 6 });
    P(box(0.55, 0.1, 0.5), ARMOR, [s * 1.05, 0.62, z]);
    for (const dz of [-0.15, 0.15]) rod([s * 0.8, 0.5, z + dz], [x - s * 0.3, 0.45, z + dz], 0.025, STEEL);
    b.lathe(
      [
        [0.34, 0.0],
        [0.44, 0.04],
        [0.46, 0.46],
        [0.38, 0.5],
        [0.35, 0.46],
        [0.35, 0.04],
      ],
      { at: [x, y0, z], axis: [0, 1, 0], segments: 10, bone: chassis, color: BODY },
    );
    P(new THREE.TorusGeometry(0.46, 0.03, 4, 10), STEEL, [x, y0 + 0.5, z], { rotation: [90, 0, 0] }); // intake lip
    N(new THREE.TorusGeometry(0.45, 0.02, 4, 12), MAG, [x, y0 + 0.04, z], { rotation: [90, 0, 0] }, 1.4);
    N(cyl(0.3, 0.02, 12), CYAN, [x, y0 + 0.12, z], {}, 1.5); // downwash glow
    // stator vanes + hub
    for (let a = 0; a < 3; a++) {
      const an = (a / 3) * Math.PI;
      rod([x + 0.35 * Math.sin(an), y0 + 0.26, z + 0.35 * Math.cos(an)], [x - 0.35 * Math.sin(an), y0 + 0.26, z - 0.35 * Math.cos(an)], 0.012, DARK, { sides: 4 });
    }
    const fan = b.joint(`fan${tag}`, { parent: chassis, at: [x, y0 + 0.3, z], dir: [0, 1, 0], role: "hinge" });
    P(cyl(0.07, 0.12, 8), STEEL, [x, y0 + 0.3, z], { bone: fan });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      P(box(0.07, 0.015, 0.26), i % 2 ? STEEL : DARK, [x + 0.2 * Math.sin(a), y0 + 0.3, z + 0.2 * Math.cos(a)], { bone: fan, rotation: [0, (a * 180) / Math.PI, 12] });
    }
    // side vents + status light
    for (let i = 0; i < 3; i++) P(box(0.1, 0.03, 0.18), DARK, [x + s * 0.44, y0 + 0.2 + i * 0.07, z], { rotation: [0, 0, s * 20] });
    N(new THREE.SphereGeometry(0.035, 6, 4), zs > 0 ? CYAN : MAG, [x + s * 0.47, y0 + 0.4, z + zs * 0.12]);
    decal(WARN, 0.14, 0.14, [x, y0 + 0.52, z + zs * 0.0], [0, 1, 0], 0, { up: [0, 0, 1] });
  };
  for (const s of [1, -1]) for (const zs of [1, -1]) pod(s, zs);

  // ------------------------------------------------ cab
  P(box(1.9, 0.5, 1.7), BODY, [0, 1.0, 0.35]);
  P(box(1.76, 0.55, 1.3), BODY, [0, 1.52, 0.2]);
  P(box(1.84, 0.1, 1.45), ARMOR, [0, 1.84, 0.15]); // roof plate
  P(box(1.88, 0.08, 1.0), ARMOR, [0, 1.8, 0.1]);
  P(box(1.55, 0.5, 0.05), GLASS, [0, 1.52, 0.9], { rotation: [-32, 0, 0] }); // raked windscreen
  decal(svg(`<svg viewBox="0 0 64 20"><path d="M0 20 L20 0 H26 L6 20Z M14 20 L34 0 H38 L18 20Z" fill="#ffffff" opacity="0.18"/></svg>`, { size: 128 }), 1.5, 0.45, [0, 1.52, 0.925], [0, 0.55, 0.85], 0);
  P(box(1.6, 0.4, 0.05), GLASS, [0, 1.56, -0.5]); // rear glass
  for (const s of [1, -1]) {
    P(box(0.04, 0.26, 1.0), GLASS, [s * 0.9, 1.56, 0.25]); // armored side slit
    for (let i = 0; i < 4; i++) P(box(0.06, 0.3, 0.03), ARMOR, [s * 0.91, 1.56, -0.1 + i * 0.3]);
    P(box(0.08, 0.04, 1.1), ARMOR, [s * 0.9, 1.72, 0.25]); // brow
    rod([s * 0.86, 1.25, 0.82], [s * 0.76, 1.8, 0.4], 0.05, ARMOR, { section: "box" }); // A pillar
    // doors
    P(box(0.06, 0.45, 0.95), ARMOR, [s * 0.97, 0.98, 0.35]);
    P(box(0.07, 0.03, 0.96), DARK, [s * 0.97, 1.22, 0.35]); // seams
    P(box(0.07, 0.45, 0.03), DARK, [s * 0.97, 0.98, -0.14]);
    P(box(0.07, 0.45, 0.03), DARK, [s * 0.97, 0.98, 0.84]);
    P(box(0.05, 0.04, 0.18), STEEL, [s * 1.01, 1.1, 0.0]); // handle
    bolts([[s * 1.0, 0.82, -0.05], [s * 1.0, 0.82, 0.75], [s * 1.0, 1.15, 0.75], [s * 1.0, 1.15, -0.05]] as V[], [s, 0, 0]);
    decal(NUM, 0.34, 0.21, [s * 1.003, 0.98, 0.38], [s, 0, 0], 1.2);
    // mirror camera
    rod([s * 0.95, 1.5, 0.85], [s * 1.12, 1.55, 0.9], 0.02, STEEL);
    P(new THREE.SphereGeometry(0.07, 6, 4), DARK, [s * 1.14, 1.55, 0.9]);
    N(cyl(0.025, 0.02, 6), CYAN, [s * 1.14, 1.55, 0.97], { rotation: [90, 0, 0] });
    // fenders / intake armor
    P(box(0.3, 0.12, 1.5), ARMOR, [s * 0.9, 1.22, 1.45]);
    P(box(0.25, 0.1, 0.5), GUNM, [s * 0.8, 1.31, 1.6]); // smoke launcher base
    for (let i = 0; i < 3; i++) rod([s * (0.7 + i * 0.07), 1.34, 1.5], [s * (0.7 + i * 0.07), 1.5, 1.7], 0.025, DARK, { sides: 6 });
  }
  // hood
  b.frustumBox([0, 1.02, 1.2], [0, 0.92, 2.55], [1.9, 0.5], [1.74, 0.34], { bone: chassis, color: BODY });
  decal(HAZARD, 1.3, 0.45, [0, 1.275, 1.75], [0, 1, 0.1], 0, { up: [0, 0, 1] });
  for (let i = 0; i < 5; i++) {
    P(box(0.5, 0.025, 0.04), DARK, [0, 1.275, 2.15 + i * 0.07], { rotation: [-6, 0, 0] });
    N(box(0.44, 0.01, 0.015), MAG, [0, 1.29, 2.15 + i * 0.07]);
  }
  for (const s of [1, -1]) {
    P(box(0.08, 0.05, 1.2), ARMOR, [s * 0.8, 1.27, 1.8]); // hood rails
    P(box(0.24, 0.12, 0.3), ARMOR, [s * 0.5, 1.32, 1.5]); // vent scoops
  }
  // face: grille, lights, ram bumper
  P(box(1.2, 0.3, 0.06), DARK, [0, 0.93, 2.57]);
  for (let i = 0; i < 6; i++) N(box(1.1, 0.015, 0.02), CYAN, [0, 0.82 + i * 0.045, 2.6], {}, 1.2);
  for (const s of [1, -1]) {
    P(box(0.4, 0.14, 0.08), DARK, [s * 0.7, 1.0, 2.55]);
    N(box(0.34, 0.05, 0.03), "#d6fbff", [s * 0.7, 1.0, 2.6], {}, 2);
    P(box(0.4, 0.04, 0.12), ARMOR, [s * 0.7, 1.1, 2.54]);
    P(box(0.2, 0.3, 0.3), GUNM, [s * 0.55, 0.62, 2.45]); // bumper bracket
    for (let i = 0; i < 3; i++) b.spike([s * (0.2 + i * 0.3), 0.62, 2.74], [0, 0, 1], 0.2, 0.05, { bone: chassis, color: STEEL, sides: 4 });
  }
  P(box(2.05, 0.3, 0.2), ARMOR, [0, 0.64, 2.68]);
  P(box(2.1, 0.06, 0.24), STEEL, [0, 0.8, 2.68]);
  P(new THREE.TorusGeometry(0.07, 0.02, 5, 8), STEEL, [0, 0.62, 2.8]);
  decal(EMBLEM, 0.34, 0.34, [0, 0.64, 2.782], [0, 0, 1], 1);
  // dash screen visible through the screen
  decal(SCREEN, 0.4, 0.3, [0.35, 1.3, 0.78], [0, 0.2, -1], 1.2);

  // ------------------------------------------------ roof gear: light bar, turret, antennae
  const bar = (z: number) => {
    P(box(1.3, 0.08, 0.12), DARK, [0, 1.93, z]);
    for (let i = 0; i < 6; i++) N(box(0.18, 0.05, 0.02), i % 2 ? MAG : CYAN, [-0.55 + i * 0.22, 1.94, z + 0.07], {}, 1.6);
    for (const s of [1, -1]) P(box(0.06, 0.06, 0.1), STEEL, [s * 0.6, 1.89, z]);
  };
  bar(0.8);
  // turret
  P(new THREE.TorusGeometry(0.34, 0.04, 5, 12), STEEL, [0, 1.91, -0.1], { rotation: [90, 0, 0] });
  const yaw = b.joint("yaw", { parent: chassis, at: [0, 1.93, -0.1], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 2.22, -0.1], dir: [0, 0, 1], role: "hinge" });
  P(cyl(0.3, 0.14, 10), METAL, [0, 2.02, -0.1], { bone: yaw });
  P(box(0.7, 0.1, 0.6), ARMOR, [0, 2.1, -0.1], { bone: yaw });
  for (const s of [1, -1]) {
    P(box(0.08, 0.32, 0.4), ARMOR, [s * 0.3, 2.22, -0.1], { bone: yaw });
    P(box(0.2, 0.26, 0.36), GUNM, [s * 0.5, 2.2, -0.2], { bone: yaw }); // ammo box
    P(box(0.22, 0.05, 0.38), HAZ_DARK(), [s * 0.5, 2.34, -0.2], { bone: yaw });
    rod([s * 0.4, 2.2, -0.2], [s * 0.2, 2.2, -0.1], 0.03, DARK, { bone: yaw }); // feed belt
    rod([s * 0.13, 2.22, -0.1], [s * 0.13, 2.22, 1.0], 0.045, METAL, { bone: pitch, sides: 8 });
    P(cyl(0.08, 0.3, 8), GUNM, [s * 0.13, 2.22, 0.5], { bone: pitch, rotation: [90, 0, 0] });
    P(box(0.14, 0.14, 0.14), DARK, [s * 0.13, 2.22, 1.02], { bone: pitch }); // muzzle brake
    N(cyl(0.03, 0.02, 6), AMBER, [s * 0.13, 2.22, 1.1], { bone: pitch, rotation: [90, 0, 0] });
  }
  P(box(0.34, 0.26, 0.5), ARMOR, [0, 2.22, 0.12], { bone: pitch }); // gun cradle
  P(box(0.3, 0.2, 0.2), GUNM, [0, 2.4, -0.25], { bone: pitch });
  N(new THREE.SphereGeometry(0.07, 6, 4), MAG, [0, 2.4, -0.14], { bone: pitch }, 1.8);
  // antennae
  b.spike([-0.8, 1.9, -0.2], [0, 1, 0], 1.1, 0.015, { bone: chassis, color: STEEL, sides: 5 });
  N(new THREE.SphereGeometry(0.03, 6, 4), MAG, [-0.8, 3.0, -0.2], {}, 2);
  P(cyl(0.05, 0.1, 6), DARK, [-0.8, 1.93, -0.2]);
  rod([0.8, 1.9, 0.1], [0.8, 2.3, 0.1], 0.025, STEEL);
  b.lathe([[0, 0], [0.22, 0.1], [0.22, 0.12], [0, 0.03]], { at: [0.8, 2.3, 0.1], axis: [-0.4, 0.6, 0.7], segments: 10, bone: chassis, color: METAL });
  P(new THREE.SphereGeometry(0.2, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), GLASS, [-0.5, 1.89, 0.55]); // sensor dome
  N(cyl(0.05, 0.12, 6), CYAN, [-0.5, 1.99, 0.55]);

  // ------------------------------------------------ bed
  P(box(1.9, 0.1, 2.3), ARMOR, [0, 0.88, -1.68]);
  for (let i = 0; i < 7; i++) P(box(1.8, 0.03, 0.06), DARK, [0, 0.95, -0.7 - i * 0.33]);
  P(box(1.92, 1.0, 0.1), BODY, [0, 1.3, -0.58]); // headboard
  P(box(1.92, 0.08, 0.14), ARMOR, [0, 1.82, -0.58]);
  P(box(1.9, 0.5, 0.08), BODY, [0, 1.15, -2.82]); // tailgate
  for (const s of [1, -1]) {
    P(box(0.08, 0.5, 2.3), BODY, [s * 0.95, 1.15, -1.68]);
    P(box(0.12, 0.05, 2.3), ARMOR, [s * 0.95, 1.42, -1.68]);
    P(box(0.12, 0.3, 2.3), ARMOR, [s * 0.98, 1.0, -1.68]);
    for (let i = 0; i < 5; i++) {
      P(box(0.04, 0.38, 0.06), STEEL, [s * 1.0, 1.15, -0.85 - i * 0.45]);
      P(new THREE.TorusGeometry(0.035, 0.01, 4, 6), STEEL, [s * 0.9, 1.3, -0.95 - i * 0.45], { rotation: [0, 90, 0] });
    }
    // roll hoops
    rod([s * 0.9, 1.4, -0.7], [s * 0.88, 2.2, -0.75], 0.04, ARMOR);
    rod([s * 0.88, 1.4, -2.7], [s * 0.85, 2.0, -2.65], 0.04, ARMOR);
    rod([s * 0.88, 2.2, -0.75], [s * 0.85, 2.0, -2.65], 0.04, ARMOR);
    N(box(0.03, 0.03, 1.6), CYAN, [s * 0.86, 2.12, -1.7], {}, 1.2); // strip lights
    bolts([[s * 1.045, 1.0, -0.9], [s * 1.045, 1.0, -1.7], [s * 1.045, 1.0, -2.5]] as V[], [s, 0, 0]);
  }
  rod([-0.88, 2.2, -0.75], [0.88, 2.2, -0.75], 0.04, ARMOR);
  rod([-0.85, 2.0, -2.65], [0.85, 2.0, -2.65], 0.04, ARMOR);
  rod([-0.87, 2.1, -1.7], [0.87, 2.1, -1.7], 0.03, ARMOR);
  // fusion core
  P(cyl(0.34, 0.1, 10), GUNM, [-0.4, 0.99, -1.3]);
  N(cyl(0.22, 0.85, 10), CYAN, [-0.4, 1.45, -1.3], {}, 1.6);
  P(cyl(0.26, 0.06, 10), STEEL, [-0.4, 1.9, -1.3]);
  for (let i = 0; i < 4; i++) P(new THREE.TorusGeometry(0.24, 0.02, 4, 10), STEEL, [-0.4, 1.15 + i * 0.22, -1.3], { rotation: [90, 0, 0] });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.78;
    rod([-0.4 + 0.27 * Math.sin(a), 1.0, -1.3 + 0.27 * Math.cos(a)], [-0.4 + 0.27 * Math.sin(a), 1.9, -1.3 + 0.27 * Math.cos(a)], 0.02, DARK, { sides: 4 });
  }
  decal(WARN, 0.2, 0.2, [-0.4, 1.0, -0.95], [0, 0.3, 1]);
  // rocket launcher
  const lx = 0.45;
  P(box(0.9, 0.18, 1.1), GUNM, [lx, 1.0, -2.0]);
  P(box(0.9, 0.5, 0.1), ARMOR, [lx, 1.35, -1.5], { rotation: [-18, 0, 0] });
  for (const cx of [-0.22, 0, 0.22])
    for (const cy of [0, 1]) {
      const y0 = 1.25 + cy * 0.26;
      rod([lx + cx, y0, -2.4], [lx + cx, y0 + 0.28, -1.5], 0.1, DARK, { sides: 8 });
      b.spike([lx + cx, y0 + 0.2, -1.62], [0, 0.3, 1], 0.2, 0.07, { bone: chassis, color: cy ? MAG : AMBER, sides: 8 });
    }
  P(box(0.96, 0.05, 1.0), METAL, [lx, 1.65, -2.05], { rotation: [-18, 0, 0] });
  // jerry cans + crate
  for (let i = 0; i < 2; i++) {
    P(box(0.22, 0.34, 0.4), i ? "#7a3b1d" : "#3b5a2a", [-0.7 + i * 0.02, 1.1, -2.45 + i * 0.01 - i * 0.0]);
    P(box(0.08, 0.05, 0.1), STEEL, [-0.7, 1.3, -2.45]);
    break;
  }
  P(box(0.5, 0.35, 0.5), ARMOR, [-0.4, 1.12, -2.25]);
  decal(HAZARD, 0.4, 0.13, [-0.4, 1.2, -1.995], [0, 0, 1]);
  // neon sign on headboard rear and on cab
  decal(SIGN, 1.0, 0.375, [0, 1.55, -0.635], [0, 0, -1], 1.5);
  decal(SIGN, 0.72, 0.27, [0, 1.3, 2.0 + 0.0], [0, 0, 1], 0, { visible: false } as any);

  // ------------------------------------------------ rear
  for (const s of [1, -1]) {
    b.lathe(
      [[0, 0], [0.2, 0], [0.16, 0.1], [0.3, 0.45], [0.26, 0.45], [0.12, 0.12], [0, 0.14]],
      { at: [s * 0.6, 0.75, -2.78], axis: [0, 0, -1], segments: 10, bone: chassis, color: METAL },
    );
    N(cyl(0.12, 0.03, 10), CYAN, [s * 0.6, 0.75, -2.92], { rotation: [90, 0, 0] }, 2);
    P(new THREE.TorusGeometry(0.24, 0.02, 4, 10), STEEL, [s * 0.6, 0.75, -3.05]);
    N(box(0.36, 0.06, 0.03), MAG, [s * 0.55, 1.28, -2.88], {}, 1.6); // tail light
  }
  P(box(2.0, 0.2, 0.18), ARMOR, [0, 0.62, -2.82]); // rear bumper
  decal(EMBLEM, 0.38, 0.38, [0, 1.12, -2.865], [0, 0, -1], 1);
  decal(NUM, 0.3, 0.19, [0, 0.62, -2.915], [0, 0, -1], 1);
  P(box(0.3, 0.1, 0.1), DARK, [0, 0.9, -2.78]); // tow hitch
  rod([0, 0.9, -2.83], [0, 0.9, -2.98], 0.04, STEEL);

  // cable run: fusion core to turret
  b.sweep(catmull([[-0.4, 1.95, -1.3], [-0.5, 2.15, -0.85], [-0.3, 2.1, -0.4], [0.0, 2.05, -0.1]]), 0.02, { bone: chassis, color: DARK, sides: 6 });
  b.sweep(catmull([[-0.4, 1.9, -1.2], [-0.7, 2.0, -0.9], [-0.85, 1.9, 0.0]]), 0.015, { bone: chassis, color: MAG, sides: 5 });

  // sparse hull edge neon on cab
  N(box(1.6, 0.025, 0.025), MAG, [0, 1.12, 1.2 + 0.0], {}, 0.0001 + 1);
  const r = rng(5);
  for (let i = 0; i < 10; i++) // scattered rivets / patch plates on the nose
    P(box(0.06 + r() * 0.08, 0.04, 0.02), STEEL, [(r() - 0.5) * 1.5, 0.85 + r() * 0.2, 2.585]);

  return b.root;

  function HAZ_DARK() {
    return GUNM;
  }
}
```