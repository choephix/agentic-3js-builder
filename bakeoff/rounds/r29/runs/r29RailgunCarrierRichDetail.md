```ts
import * as THREE from "three";
import { createBuilder, svg, patches, lerp } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Six-wheeled railgun carrier",
  description:
    "Low-poly sci-fi military 6x6 carrier with a tilted capacitor-ringed railgun, deployed outrigger stabiliser legs, glowing cab glass, hazard stencils and riveted camo plating.",
};

export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- palette ----------
  const CAMO = panelled(patches("#566540", ["#4a5836", "#6a7650", "#3f4a30"], { size: 0.9, gap: 0, seed: 4 }), {
    size: 0.7,
    rivets: 0.1,
    seam: "#20241a",
  });
  const DARK = "#2a2e26";
  const GUN = "#363c44";
  const STEEL = metal("steel", { tarnish: 0.35 });
  const IRON = metal("iron");
  const TIRE = "#1b1c1e";
  const CYAN = "#46ecff";
  const AMBER = "#ffb53a";
  const RED = "#d23a2c";
  const YEL = "#e8c230";
  const TAN = "#8c8660";

  // ---------- textures ----------
  const HAZARD = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#e8c230"/>
    ${[-32, -16, 0, 16, 32, 48].map((x) => `<path d="M${x} 32 L${x + 12} 0 L${x + 24} 0 L${x + 12} 32Z" fill="#1c1a14"/>`).join("")}
    <rect width="64" height="32" fill="none" stroke="#1c1a14" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  const WINDOW = svg(
    `<svg viewBox="0 0 100 46"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7ff3ff"/><stop offset="1" stop-color="#0f4a66"/></linearGradient></defs>
    <rect width="100" height="46" rx="4" fill="#12161a"/>
    <rect x="3" y="3" width="94" height="40" rx="3" fill="url(#g)"/>
    <path d="M10 43 L30 3 L40 3 L20 43Z M52 43 L72 3 L78 3 L58 43Z" fill="#ffffff" opacity="0.35"/>
    <path d="M49 3 V43" stroke="#12161a" stroke-width="3"/>
    <path d="M8 36 H30 M70 36 H92" stroke="#c8fff8" stroke-width="1.5"/></svg>`,
    { size: 256 },
  );
  const NUMBER = svg(
    `<svg viewBox="0 0 120 40"><text x="60" y="31" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="30" fill="#efe9d0" stroke="#1c1a14" stroke-width="2.5" paint-order="stroke">RG-6</text></svg>`,
    { size: 256 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#1d2118" stroke="#efe9d0" stroke-width="3"/>
    <path d="M32 6 V58 M6 32 H58" stroke="#d23a2c" stroke-width="3"/>
    <path d="M36 12 L22 36 H31 L27 54 L43 28 H33Z" fill="#46ecff" stroke="#0b2a33" stroke-width="2"/></svg>`,
    { size: 128 },
  );
  const WARN = svg(
    `<svg viewBox="0 0 40 40"><path d="M20 3 L38 35 H2Z" fill="#e8c230" stroke="#1c1a14" stroke-width="3" stroke-linejoin="round"/>
    <rect x="18" y="14" width="4" height="12" fill="#1c1a14"/><rect x="18" y="28" width="4" height="4" fill="#1c1a14"/></svg>`,
    { size: 64 },
  );

  // ---------- helpers ----------
  const box = (s: [number, number, number], color: any, at: any, o: any = {}) =>
    b.part(new THREE.BoxGeometry(...s), color, { at, ...o });
  const cyl = (r: number, len: number, seg: number, color: any, at: any, dir: any = [0, 1, 0], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at, dir, flat: true, ...o });
  const plane = (w: number, h: number, tex: THREE.Texture, at: any, dir: any, o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, ...o });
  const bolts = (pts: number[][], dir: any, r = 0.035) =>
    pts.forEach((p) => cyl(r, 0.04, 6, IRON, p, dir));

  // ---------- hull ----------
  const hullProfile: [number, number][] = [
    [-4.4, 0.7], [4.3, 0.7], [4.6, 1.0], [4.6, 1.6], [4.2, 1.9], [-4.4, 1.9],
  ];
  b.extrude(hullProfile, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.4, color: CAMO });
  // hazard stripe skirt along lower hull
  for (const s of [1, -1]) {
    plane(7.6, 0.16, HAZARD, [s * 1.205, 0.82, 0], [s, 0, 0]);
    plane(1.3, 0.42, NUMBER, [s * 1.205, 1.62, 0.2], [s, 0, 0]);
    plane(0.55, 0.55, EMBLEM, [s * 1.205, 1.6, 2.6], [s, 0, 0]);
    // recessed door panels with handles and rivets
    for (const z of [-1.5, 1.5, -3.5]) {
      box([0.04, 0.5, 0.9], DARK, [s * 1.21, 1.2, z + (z === 1.5 ? 0 : 0)]);
      box([0.05, 0.06, 0.16], STEEL, [s * 1.235, 1.2, z + 0.3]);
    }
    // vents
    for (let i = 0; i < 4; i++) box([0.05, 0.04, 0.8], DARK, [s * 1.215, 1.5 + i * 0.07 - 0.1, -3.55]);
  }
  // hull top chamfer rails and deck plate
  box([2.2, 0.06, 7.8], IRON, [0, 1.93, -0.2]);
  for (const s of [1, -1]) {
    box([0.12, 0.12, 8.6], DARK, [s * 1.18, 1.92, -0.05]);
    // deck handrail posts
    for (const z of [-3.9, -2, 0.4, 3.9]) bolts([[s * 1.0, 1.99, z]], [0, 1, 0], 0.05);
  }

  // front: bumper, grille, lamps, hooks
  box([2.6, 0.3, 0.4], DARK, [0, 0.85, 4.65]);
  box([2.4, 0.1, 0.5], YEL, [0, 0.98, 4.66], { texture: HAZARD });
  for (let i = 0; i < 5; i++) box([1.0, 0.045, 0.06], GUN, [0, 1.12 + i * 0.1, 4.62]);
  for (const s of [1, -1]) {
    glow(box([0.4, 0.22, 0.08], "#fff3c0", [s * 0.95, 1.4, 4.62]), 1.6);
    box([0.5, 0.3, 0.05], DARK, [s * 0.95, 1.4, 4.59]);
    glow(box([0.16, 0.08, 0.06], AMBER, [s * 1.1, 1.18, 4.64]), 1.2);
    cyl(0.05, 0.25, 6, STEEL, [s * 0.5, 0.85, 4.9], [0, 0, 1]);
    b.rod([s * 0.5, 0.85, 4.8], [s * 0.5, 0.85, 4.95], 0.08, RED);
  }
  // rear: lights, plate, exhaust, hitch
  box([2.4, 0.3, 0.3], DARK, [0, 0.85, -4.5]);
  for (const s of [1, -1]) {
    glow(box([0.3, 0.2, 0.06], RED, [s * 0.95, 1.4, -4.43]), 1.4);
    cyl(0.14, 1.0, 8, IRON, [s * 1.0, 2.35, -4.0]);
    cyl(0.18, 0.08, 8, STEEL, [s * 1.0, 2.88, -4.0]);
    cyl(0.1, 0.1, 8, "#101010", [s * 1.0, 2.9, -4.0]);
    box([0.1, 0.12, 0.1], STEEL, [s * 1.0, 1.95, -4.0]);
  }
  plane(1.0, 0.5, HAZARD, [0, 1.3, -4.42], [0, 0, -1]);
  cyl(0.08, 0.5, 8, STEEL, [0, 0.85, -4.85], [0, 0, 1]);

  // ---------- cab ----------
  const cabProfile: [number, number][] = [
    [1.2, 1.9], [3.9, 1.9], [3.9, 2.15], [3.3, 2.7], [1.6, 2.7], [1.2, 2.4],
  ];
  b.extrude(cabProfile, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.0, color: CAMO });
  // roof plate & light bar
  box([1.8, 0.06, 1.5], IRON, [0, 2.73, 2.45]);
  for (const x of [-0.6, -0.2, 0.2, 0.6]) glow(box([0.3, 0.1, 0.12], AMBER, [x, 2.82, 3.15]), 1.3);
  box([2.0, 0.08, 0.2], DARK, [0, 2.76, 3.15]);
  // windshield
  const wn = V(0, 0.737, 0.676).normalize();
  glow(plane(1.7, 0.78, WINDOW, V(0, 2.425, 3.6).addScaledVector(wn, 0.012), wn), 0.6);
  box([1.8, 0.06, 0.06], DARK, V(0, 2.18, 3.9));
  for (const s of [1, -1]) {
    glow(plane(1.2, 0.42, WINDOW, [s * 1.012, 2.35, 2.9], [s, 0, 0]), 0.5);
    box([0.04, 0.5, 1.3], DARK, [s * 1.0, 2.35, 2.9]);
    box([0.04, 0.06, 0.2], STEEL, [s * 1.03, 2.1, 2.3]);
    // mirrors
    b.rod([s * 1.0, 2.5, 3.5], [s * 1.35, 2.55, 3.65], 0.025, IRON);
    box([0.06, 0.3, 0.2], GUN, [s * 1.38, 2.5, 3.68]);
    // rear window slit
    plane(0.5, 0.3, WARN, [s * 1.012, 2.0, 1.6], [s, 0, 0]);
  }
  // sensor dome and hatch
  b.lathe([[0, 0], [0.22, 0], [0.2, 0.1], [0.1, 0.18], [0, 0.2]], { at: [0.5, 2.76, 1.9], color: STEEL, segments: 8 });
  glow(cyl(0.05, 0.03, 8, CYAN, [0.5, 2.97, 1.9]), 1.4);
  cyl(0.3, 0.06, 10, IRON, [-0.5, 2.75, 1.9]);

  // ---------- wheels & suspension ----------
  const WZ = [3.0, 0, -3.0];
  const WR = 0.62;
  for (const z of WZ) {
    cyl(0.12, 3.0, 8, IRON, [0, WR, z], [1, 0, 0]);
    b.part(new THREE.SphereGeometry(0.32, 8, 6), IRON, { at: [0, WR, z], flat: true });
    for (const s of [1, -1]) {
      const x = s * 1.55;
      cyl(WR, 0.52, 14, TIRE, [x, WR, z], [1, 0, 0]);
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2;
        box([0.54, 0.07, 0.17], "#26272a", [x, WR + Math.cos(a) * 0.62, z + Math.sin(a) * 0.62], {
          rotation: [(a * 180) / Math.PI, 0, 0],
        });
      }
      cyl(0.4, 0.04, 12, DARK, [x + s * 0.27, WR, z], [1, 0, 0]);
      cyl(0.36, 0.07, 10, STEEL, [x + s * 0.28, WR, z], [1, 0, 0]);
      cyl(0.17, 0.12, 8, IRON, [x + s * 0.31, WR, z], [1, 0, 0]);
      glow(cyl(0.07, 0.14, 6, CYAN, [x + s * 0.33, WR, z], [1, 0, 0]), 1.0);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        cyl(0.03, 0.06, 6, "#c9ccd2", [x + s * 0.33, WR + Math.cos(a) * 0.26, z + Math.sin(a) * 0.26], [1, 0, 0]);
      }
      // fender, mud flap, arch trim
      box([0.8, 0.09, 1.7], CAMO, [x, 1.4, z]);
      box([0.8, 0.12, 0.08], YEL, [x, 1.4, z + 0.87], { texture: HAZARD });
      box([0.8, 0.12, 0.08], YEL, [x, 1.4, z - 0.87], { texture: HAZARD });
      box([0.05, 0.3, 0.45], DARK, [x + s * 0.2, 0.62 + 0.4, z - 0.95 + (z > 0 ? 0 : 0)]);
      box([0.5, 0.4, 0.04], "#15161a", [x, 0.45, z - 0.78]);
      // shock absorber
      b.rod([s * 0.8, 0.95, z + 0.3], [s * 0.8, 0.6, z + 0.3], 0.05, RED);
    }
  }

  // ---------- stabiliser legs ----------
  for (const s of [1, -1])
    for (const z of [1.5, -1.5]) {
      box([1.5, 0.28, 0.42], GUN, [s * 1.95, 1.35, z]);
      box([1.5, 0.06, 0.3], YEL, [s * 1.95, 1.5, z], { texture: HAZARD });
      cyl(0.2, 1.0, 8, CAMO, [s * 2.7, 1.3, z]);
      cyl(0.26, 0.1, 8, IRON, [s * 2.7, 1.82, z]);
      cyl(0.26, 0.1, 8, IRON, [s * 2.7, 0.8, z]);
      cyl(0.11, 1.0, 8, STEEL, [s * 2.7, 0.55, z]);
      b.part(new THREE.SphereGeometry(0.17, 6, 5), IRON, { at: [s * 2.7, 0.14, z], flat: true });
      cyl(0.5, 0.14, 6, GUN, [s * 2.7, 0.07, z]);
      cyl(0.42, 0.04, 6, YEL, [s * 2.7, 0.15, z]);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2 + 0.5;
        cyl(0.03, 0.05, 6, "#c9ccd2", [s * 2.7 + Math.cos(a) * 0.34, 0.16, z + Math.sin(a) * 0.34]);
      }
      b.rod([s * 1.2, 0.95, z], [s * 2.62, 1.0, z], 0.07, IRON);
      b.rod([s * 2.7, 1.1, z], [s * 2.7, 0.9, z], 0.15, STEEL);
      plane(0.3, 0.3, WARN, [s * 2.7 + s * 0.205, 1.3, z], [s, 0, 0]);
      glow(cyl(0.04, 0.05, 6, AMBER, [s * 2.7, 1.9, z]), 1.4);
      bolts([[s * 1.3, 1.5, z + 0.22], [s * 2.6, 1.5, z + 0.22]], [0, 0, 1]);
    }

  // ---------- turret ----------
  const TZ = -1.0;
  b.lathe([[0, 0], [1.7, 0], [1.7, 0.12], [1.5, 0.16], [0, 0.16]], { at: [0, 1.9, TZ], color: IRON, segments: 16 });
  box([3.0, 0.8, 3.2], CAMO, [0, 2.3, TZ + 0.05]);
  for (const s of [1, -1]) {
    box([0.25, 0.25, 3.2], CAMO, [s * 1.45, 2.74, TZ + 0.05], { rotation: [0, 0, s * 45] });
    plane(0.7, 0.7, EMBLEM, [s * 1.505, 2.35, TZ + 0.5], [s, 0, 0]);
    plane(1.0, 0.18, HAZARD, [s * 1.505, 2.0, TZ - 0.7], [s, 0, 0]);
    box([0.1, 0.4, 0.8], DARK, [s * 1.52, 2.3, TZ - 0.6]);
    for (let i = 0; i < 3; i++) box([0.12, 0.04, 0.7], GUN, [s * 1.54, 2.2 + i * 0.1, TZ - 0.6]);
  }
  cyl(0.3, 0.1, 10, IRON, [0.9, 2.74, TZ + 0.3]);
  glow(cyl(0.12, 0.04, 8, CYAN, [0.9, 2.8, TZ + 0.3]), 1.2);
  box([0.5, 0.2, 0.6], GUN, [-0.9, 2.78, TZ - 0.5]);
  // radar mast
  b.rod([-1.1, 2.7, TZ - 1.2], [-1.2, 4.2, TZ - 1.4], 0.025, IRON);
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), RED, { at: [-1.2, 4.24, TZ - 1.4] }), 1.6);
  b.rod([1.1, 2.7, TZ - 1.2], [1.1, 3.4, TZ - 1.4], 0.04, IRON);
  box([0.5, 0.3, 0.05], STEEL, [1.1, 3.5, TZ - 1.4]);

  // ---------- railgun ----------
  const ang = (25 * Math.PI) / 180;
  const d = V(0, Math.sin(ang), Math.cos(ang));
  const u = V(0, Math.cos(ang), -Math.sin(ang));
  const O = V(0, 3.3, TZ);
  const P = (t: number, x = 0, h = 0) =>
    O.clone().addScaledVector(d, t).addScaledVector(u, h).add(V(x, 0, 0));
  const gbox = (w: number, h: number, l: number, color: any, t: number, x = 0, hh = 0, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, l), color, { at: P(t, x, hh), dir: d, axis: "z", ...o });
  const gcyl = (r: number, len: number, seg: number, color: any, t: number, x = 0, hh = 0) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at: P(t, x, hh), dir: d, flat: true });

  // cradle plates
  for (const s of [1, -1]) {
    b.extrude([[-0.9, 0], [0.9, 0], [0.5, 0.95], [-0.5, 0.95]], {
      at: [s * 0.78, 2.7, TZ], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.18, color: GUN,
    });
    cyl(0.17, 0.3, 8, STEEL, [s * 0.86, 3.3, TZ], [1, 0, 0]);
    bolts([[s * 0.88, 3.0, TZ + 0.4], [s * 0.88, 3.0, TZ - 0.4]], [s, 0, 0], 0.04);
  }
  // breech
  gbox(1.3, 1.1, 1.8, GUN, -0.55);
  gbox(1.0, 0.2, 1.2, HAZARD, -0.55, 0, 0.6, { texture: HAZARD });
  for (let i = 0; i < 5; i++) gbox(1.4, 0.05, 0.1, IRON, -1.1 + i * 0.28, 0, 0);
  gbox(1.0, 0.9, 0.2, IRON, -1.5);
  glow(gbox(0.5, 0.3, 0.05, CYAN, -1.62), 1.3);
  // rails
  for (const s of [1, -1]) {
    gbox(0.18, 0.24, 7.0, STEEL, 3.1, s * 0.3);
    gbox(0.06, 0.26, 6.9, IRON, 3.1, s * 0.4);
    glow(gbox(0.035, 0.1, 6.5, CYAN, 3.15, s * 0.19), 1.8);
  }
  // spacers
  for (let i = 0; i < 12; i++) gbox(0.5, 0.1, 0.14, GUN, 0.3 + i * 0.55, 0, -0.14);
  // capacitor coil rings
  [0.9, 1.9, 2.9, 3.9, 4.9, 5.7].forEach((t, i) => {
    const big = i < 3 ? 0.66 : 0.58;
    gcyl(big, 0.34, 8, GUN, t);
    gcyl(big + 0.03, 0.07, 8, IRON, t - 0.17);
    gcyl(big + 0.03, 0.07, 8, IRON, t + 0.17);
    glow(gcyl(big + 0.015, 0.05, 8, CYAN, t), 1.5);
    for (const s of [1, -1]) gbox(0.08, 0.2, 0.2, YEL, t, s * (big + 0.05), 0);
    gbox(0.3, 0.12, 0.25, DARK, t, 0, big + 0.05);
  });
  // spine cable runs
  for (const s of [1, -1]) b.rod(P(0.2, s * 0.62, 0.15), P(5.8, s * 0.55, 0.15), 0.04, "#14161a");
  // muzzle brake
  gbox(1.0, 0.9, 0.7, GUN, 6.55);
  gbox(1.1, 0.12, 0.9, IRON, 6.55, 0, 0.5);
  for (const s of [1, -1]) {
    glow(gbox(0.04, 0.5, 0.4, CYAN, 6.55, s * 0.5), 1.6);
    gbox(0.14, 0.7, 0.14, IRON, 6.85, s * 0.46);
  }
  gbox(0.55, 0.4, 0.1, "#05090c", 6.92);
  // rail hazard stripes + stencil
  gbox(0.9, 0.04, 0.6, HAZARD, 4.4, 0, 0.78, { texture: HAZARD });
  // elevation hydraulics
  for (const s of [1, -1]) {
    const a = V(s * 0.5, 2.7, TZ + 0.9);
    const e = P(-0.6, s * 0.5, -0.6);
    const m = lerp(a, e, 0.5);
    b.rod(a, m, 0.11, IRON);
    b.rod(m, e, 0.065, STEEL);
    b.part(new THREE.SphereGeometry(0.12, 6, 4), STEEL, { at: a, flat: true });
  }

  // ---------- rear power bank ----------
  box([2.2, 0.7, 1.3], CAMO, [0, 2.3, -3.4]);
  box([2.3, 0.08, 1.4], IRON, [0, 2.68, -3.4]);
  for (let i = 0; i < 4; i++) {
    const x = -0.78 + i * 0.52;
    cyl(0.2, 0.5, 8, GUN, [x, 2.88, -3.4]);
    glow(cyl(0.21, 0.06, 8, CYAN, [x, 2.9, -3.4]), 1.5);
    cyl(0.07, 0.1, 6, YEL, [x, 3.15, -3.4]);
    glow(box([0.3, 0.08, 0.04], CYAN, [x, 2.2, -2.74]), 1.4);
  }
  plane(0.5, 0.5, WARN, [0.8, 2.35, -2.73], [0, 0, 1]);
  // crates on deck
  for (const s of [1, -1]) {
    box([0.6, 0.45, 0.9], TAN, [s * 0.85, 2.15, 1.0]);
    box([0.62, 0.06, 0.2], YEL, [s * 0.85, 2.4, 1.0], { texture: HAZARD });
    box([0.1, 0.1, 0.1], STEEL, [s * 0.85, 2.42, 0.6]);
  }
  // rear ladder
  for (const s of [1, -1]) b.rod([s * 0.35, 0.85, -4.65], [s * 0.35, 2.0, -4.65], 0.03, STEEL);
  for (let i = 0; i < 5; i++) b.rod([-0.35, 1.0 + i * 0.22, -4.65], [0.35, 1.0 + i * 0.22, -4.65], 0.025, STEEL);

  return b.root;
}
```