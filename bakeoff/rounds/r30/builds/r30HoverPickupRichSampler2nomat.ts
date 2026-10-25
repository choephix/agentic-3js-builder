import * as THREE from "three";
import type { Fill, Joint } from "../../../../src/index";
import { catmull, createBuilder, frame, mix, noise, paint, polyline, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Hover Technical",
  description:
    "A militarized pickup converted to ducted-fan hover thrusters: armoured hull, neon underglow, roof remote weapon station, bed-mounted VLS cells, rear boosters. Low-poly cyberpunk.",
};

// ---------------------------------------------------------------- palette
const MAG = "#ff2e9a";
const CY = "#35e8ff";
const YEL = "#ffd23a";
const BLK = "#14161f";
const RUB = "#1a1b22";
const LAMP = "#d8fbff";
const MISSILE = "#cfd3dc";

// ---------------------------------------------------------------- paints
const hullPaint = (base: string, seed: number) =>
  paint((p, n) => {
    const up = smoothstep(0.2, 0.95, n.y);
    const down = smoothstep(0.1, -0.8, n.y);
    let c = mix(base, "#aeb9d4", 0.16 * up);
    c = mix(c, "#0a0b14", 0.35 * down);
    // road grime and soot gather near the floor
    c = mix(c, "#1a1612", Math.min(1, smoothstep(1.15, 0.5, p.y) * (0.3 + 0.7 * noise(p, 0.22, seed))) * 0.6);
    // panel seams
    const u = Math.abs(n.x) > Math.abs(n.z) ? p.z : p.x;
    const du = ((u % 0.55) + 0.55) % 0.55;
    const dv = (((p.y + 0.1) % 0.4) + 0.4) % 0.4;
    if (Math.abs(n.y) < 0.8 && (du < 0.007 || dv < 0.007)) c = mix(c, "#07080d", 0.8);
    // scuffed bare metal
    if (noise(p, 0.04, seed + 7) > 0.74) c = mix(c, "#c9d3e6", 0.25);
    return c;
  });

const HULLP = hullPaint("#3f4b5e", 1);
const ARM = hullPaint("#2b3140", 2);
const BODYP = paint((p, n) => {
  if (Math.abs(n.x) > 0.7 && p.y > 1.0 && p.y < 1.065) return MAG; // belt-line neon stripe
  if (n.y > 0.85 && Math.abs(p.x) < 0.03 && p.z > 1.35 && p.z < 2.4) return CY; // hood pinstripe
  return HULLP;
});
const STEELP = paint((p, n) => mix("#59627a", "#a3aec6", 0.5 * noise(p, 0.08, 5) + 0.4 * smoothstep(0.3, 1, n.y)));
const HAZP = paint((p) => ((Math.floor((p.x + p.y) / 0.09) % 2) + 2) % 2 ? YEL : BLK);
const GLASSP = paint((p) => {
  const base = mix("#0c1a24", "#1c4a5c", smoothstep(1.34, 2.02, p.y) * 0.8);
  const t = (((p.z + p.y * 0.8) / 0.55) % 1 + 1) % 1;
  return mix(base, "#9be8ff", t < 0.09 ? 0.22 : 0);
});

// ---------------------------------------------------------------- textures
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,4 91,27 91,73 50,96 9,73 9,27" fill="#10121c" stroke="#ff2e9a" stroke-width="5"/>
  <polygon points="50,12 84,31 84,69 50,88 16,69 16,31" fill="none" stroke="#35e8ff" stroke-width="2.5"/>
  <path d="M26 28 L40 42 L60 42 L74 28 L72 58 L60 72 L50 78 L40 72 L28 58 Z" fill="#ff2e9a" stroke="#0a0b14" stroke-width="2.5"/>
  <path d="M34 50 L46 54 L36 57 Z" fill="#35e8ff"/><path d="M66 50 L54 54 L64 57 Z" fill="#35e8ff"/>
  <path d="M46 66 L54 66 L50 73 Z" fill="#0a0b14"/>
  <text x="50" y="86" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="11" fill="#ffd23a">HX-07</text>
</svg>`,
  { size: 256 },
);
const SIGN = svg(
  `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="196" height="56" rx="6" fill="#0b0d18" stroke="#35e8ff" stroke-width="3"/>
  <text x="100" y="31" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="24" letter-spacing="2" fill="#35e8ff">NIGHT RUNNER</text>
  <rect x="14" y="38" width="172" height="3" fill="#ff2e9a"/>
  <text x="100" y="53" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="10" letter-spacing="3" fill="#ff2e9a">HOVER UNIT 07</text>
</svg>`,
  { size: 512 },
);
let bars = "";
for (let i = -1; i < 8; i++) {
  const x = i * 20;
  bars += `<polygon points="${x},24 ${x + 10},24 ${x + 22},0 ${x + 12},0" fill="#ffd23a"/>`;
}
const HAZ_T = svg(
  `<svg viewBox="0 0 140 24" xmlns="http://www.w3.org/2000/svg"><rect width="140" height="24" fill="#14161f"/>${bars}<rect x="1" y="1" width="138" height="22" fill="none" stroke="#14161f" stroke-width="2"/></svg>`,
  { size: 512 },
);
const HUD = svg(
  `<svg viewBox="0 0 160 60" xmlns="http://www.w3.org/2000/svg">
  <rect width="160" height="60" rx="5" fill="#04100f"/>
  <rect x="2" y="2" width="156" height="56" rx="4" fill="none" stroke="#35e8ff" stroke-width="2"/>
  <circle cx="32" cy="32" r="20" fill="none" stroke="#35e8ff" stroke-width="2"/>
  <circle cx="32" cy="32" r="10" fill="none" stroke="#35e8ff" stroke-width="1.5"/>
  <path d="M32 32 L48 20" stroke="#7dff9a" stroke-width="2.5"/>
  <circle cx="42" cy="40" r="2.8" fill="#ff2e9a"/>
  <text x="64" y="22" font-family="monospace" font-size="11" font-weight="bold" fill="#7dff9a">CELLS 6/6</text>
  <text x="64" y="36" font-family="monospace" font-size="11" font-weight="bold" fill="#35e8ff">BAT 87%</text>
  <rect x="64" y="42" width="88" height="7" fill="none" stroke="#35e8ff" stroke-width="1.5"/>
  <rect x="66" y="44" width="68" height="3" fill="#35e8ff"/>
</svg>`,
  { size: 512 },
);
const SLIT = svg(
  `<svg viewBox="0 0 120 16" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#35e8ff"/><stop offset="0.5" stop-color="#ffffff"/><stop offset="1" stop-color="#35e8ff"/></linearGradient></defs>
  <rect x="2" y="3" width="116" height="10" rx="4" fill="url(#g)"/>
  <path d="M20 3V13M40 3V13M60 3V13M80 3V13M100 3V13" stroke="#14161f" stroke-width="2"/>
</svg>`,
  { size: 256 },
);
const THRUST = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="r"><stop offset="0" stop-color="#ffffff"/><stop offset="0.35" stop-color="#35e8ff"/><stop offset="0.8" stop-color="#6a3cff"/><stop offset="1" stop-color="#ff2e9a"/></radialGradient></defs>
  <rect width="100" height="100" fill="url(#r)"/>
  <circle cx="50" cy="50" r="22" fill="none" stroke="#0a0b14" stroke-width="2.5" opacity="0.5"/>
  <circle cx="50" cy="50" r="36" fill="none" stroke="#0a0b14" stroke-width="2.5" opacity="0.5"/>
  <path d="M50 8V92M8 50H92M20 20L80 80M80 20L20 80" stroke="#0a0b14" stroke-width="2" opacity="0.4"/>
</svg>`,
  { size: 256 },
);
const GLASS_T = svg(
  `<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d5566"/><stop offset="1" stop-color="#08141c"/></linearGradient></defs>
  <rect width="160" height="100" fill="url(#v)"/>
  <polygon points="20,0 40,0 10,100 -10,100" fill="#9be8ff" opacity="0.28"/>
  <polygon points="60,0 70,0 40,100 30,100" fill="#9be8ff" opacity="0.2"/>
  <path d="M8 22V8H22M152 22V8H138M8 78V92H22M152 78V92H138" fill="none" stroke="#35e8ff" stroke-width="2.5"/>
  <text x="80" y="94" text-anchor="middle" font-family="monospace" font-size="7" font-weight="bold" fill="#35e8ff">TGT LOCK // 00</text>
</svg>`,
  { size: 512 },
);
const PLATE = svg(
  `<svg viewBox="0 0 60 20" xmlns="http://www.w3.org/2000/svg">
  <rect width="60" height="20" rx="3" fill="#e8ecf5" stroke="#14161f" stroke-width="1.5"/>
  <rect x="2" y="2" width="56" height="3" fill="#ff2e9a"/>
  <text x="30" y="16" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="10" fill="#14161f">H0V-3R</text>
</svg>`,
  { size: 256 },
);
const STENCIL = svg(
  `<svg viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="50" fill="#2a3326"/>
  <text x="40" y="26" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#ffd23a">AP-HEAT</text>
  <polygon points="12,42 20,30 28,42" fill="#ffd23a"/><polygon points="52,42 60,30 68,42" fill="#ffd23a"/>
  <rect x="2" y="2" width="76" height="46" fill="none" stroke="#ffd23a" stroke-width="2"/>
</svg>`,
  { size: 256 },
);
const PLUME = svg(
  `<svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 0 C34 30 40 70 28 100 L12 100 C0 70 6 30 20 0 Z" fill="#ff2e9a"/>
  <path d="M20 24 C30 48 33 76 25 100 L15 100 C7 76 10 48 20 24 Z" fill="#35e8ff"/>
  <path d="M20 52 C26 68 26 86 22 100 L18 100 C14 86 14 68 20 52 Z" fill="#ffffff"/>
</svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------- model
type V = [number, number, number];
type Opts = {
  bone?: Joint;
  rotation?: V;
  dir?: V;
  up?: V;
  axis?: "x" | "y" | "z";
  scale?: V;
  flat?: boolean;
  texture?: THREE.Texture;
  name?: string;
};

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });
  const TAU = Math.PI * 2;
  const deg = (r: number) => (r * 180) / Math.PI;
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);
  const hoodY = (z: number) => 1.22 + (2.4 - z) * 0.109;
  const HT = 6.2;

  // ---- skeleton
  const chassis = b.joint("chassis", { at: [0, 0.9, 0], role: "spine" });
  const pods = [
    ["FL", 1, 1.55],
    ["FR", -1, 1.55],
    ["RL", 1, -1.55],
    ["RR", -1, -1.55],
  ] as const;
  const tiltJ: Record<string, Joint> = {};
  const fanJ: Record<string, Joint> = {};
  for (const [k, s, z] of pods) {
    tiltJ[k] = b.joint(`thrustTilt${k}`, { parent: chassis, at: [s * 1.2, 0.5, z], dir: [0, 1, 0], role: "hinge" });
    fanJ[k] = b.joint(`fan${k}`, { parent: tiltJ[k], at: [s * 1.2, 0.3, z], dir: [0, 1, 0], role: "hinge" });
  }
  const doorJ: Record<string, Joint> = {};
  for (const s of [1, -1])
    doorJ[s > 0 ? "L" : "R"] = b.joint(s > 0 ? "doorL" : "doorR", {
      parent: chassis,
      at: [s * 0.97, 1.0, 0.85],
      dir: [0, 1, 0],
      role: "hinge",
    });
  const gateJ = b.joint("tailgate", { parent: chassis, at: [0, 0.9, -2.58], dir: [1, 0, 0], role: "hinge" });
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 2.07, -0.05], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("turretPitch", { parent: yaw, at: [0, 2.38, -0.05], dir: [0, 0, 1], role: "hinge" });
  const lidJ = b.joint("vlsHatch", { parent: chassis, at: [0.4, 1.2, -1.3], dir: [1, 0, 0], role: "hinge" });

  // ---- helpers
  const P = (geo: THREE.BufferGeometry, color: Fill, at: V, o: Opts = {}) => b.part(geo, color, { bone: chassis, at, ...o });
  const plane = (w: number, h: number, tex: THREE.Texture, at: V, dir: V, o: Opts = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: chassis, at, dir, axis: "z", texture: tex, ...o });
  const rod = (a: V, c: V, r: number, color: Fill, o: { bone?: Joint; sides?: number } = {}) =>
    b.rod(a, c, r, color, { bone: chassis, sides: 6, ...o });

  // ================================================================ hull
  b.extrude(
    [
      [-2.6, 0.55],
      [2.45, 0.55],
      [2.62, 0.72],
      [2.6, 1.08],
      [2.4, 1.22],
      [1.3, 1.34],
      [-0.72, 1.34],
      [-0.72, 0.85],
      [-2.6, 0.85],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.9, bevel: 0.035, color: BODYP, bone: chassis, name: "hullLower" },
  );
  b.extrude(
    [
      [-0.72, 1.34],
      [1.3, 1.34],
      [0.5, 2.02],
      [-0.55, 2.02],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: [1.84, 1.52], color: GLASSP, bone: chassis, name: "greenhouse" },
  );
  P(box(1.62, 0.07, 1.28), HULLP, [0, 2.04, -0.03]); // roof hat
  P(box(1.66, 0.025, 0.04), CY, [0, 2.04, 0.62]); // roof brow glow
  glow(b.part(box(1.66, 0.025, 0.04), CY, { bone: chassis, at: [0, 2.04, 0.62] }));
  for (const s of [1, -1]) {
    rod([s * 0.93, 1.34, 1.3], [s * 0.8, 2.03, 0.5], 0.045, HULLP); // A pillar
    rod([s * 0.93, 1.34, -0.12], [s * 0.8, 2.03, -0.1], 0.04, HULLP); // B pillar
    rod([s * 0.93, 1.34, -0.72], [s * 0.77, 2.03, -0.55], 0.06, HULLP); // C pillar
  }
  // windscreen decal, wipers
  plane(1.5, 0.95, GLASS_T, [0, 1.689, 0.908], [0, 0.76, 0.65]);
  for (const x of [-0.28, 0.28]) P(box(0.7, 0.015, 0.02), BLK, [x, 1.465, 1.185], { dir: [0, 0.76, 0.65], axis: "z" });
  // rear bulkhead with HUD readout
  P(box(1.5, 0.5, 0.06), ARM, [0, 1.62, -0.68], { dir: [0, 0.24, -0.97], axis: "z" });
  glow(plane(0.9, 0.34, HUD, [0, 1.636, -0.713], [0, 0.24, -0.97]));
  for (const s of [1, -1]) P(box(0.1, 0.46, 0.05), STEELP, [s * 0.74, 1.62, -0.7], { dir: [0, 0.24, -0.97], axis: "z" });

  // ---- hood
  P(box(0.34, 0.07, 1.0), ARM, [0, hoodY(1.9) + 0.04, 1.9], { rotation: [HT, 0, 0] });
  glow(b.part(box(0.04, 0.012, 0.9), CY, { bone: chassis, at: [0, hoodY(1.9) + 0.08, 1.9], rotation: [HT, 0, 0] }));
  for (const s of [1, -1]) {
    glow(b.part(box(0.3, 0.02, 0.34), MAG, { bone: chassis, at: [s * 0.42, hoodY(2.0) + 0.012, 2.0], rotation: [HT, 0, 0] }), 1.2);
    for (const z of [1.88, 2.0, 2.12]) P(box(0.32, 0.03, 0.03), BLK, [s * 0.42, hoodY(z) + 0.03, z], { rotation: [HT, 0, 0] });
    for (const x of [0.62, 0.84])
      for (const z of [1.6, 1.9, 2.2])
        P(box(0.2, 0.06, 0.26), ARM, [s * x, hoodY(z) + 0.03, z], { rotation: [HT, 0, 0] }); // ERA bricks
  }

  // ---- front fascia
  P(box(0.8, 0.28, 0.06), BLK, [0, 0.88, 2.62]);
  glow(b.part(box(0.7, 0.2, 0.01), MAG, { bone: chassis, at: [0, 0.88, 2.65] }), 1.2);
  for (const y of [0.8, 0.86, 0.92, 0.98]) rod([-0.38, y, 2.67], [0.38, y, 2.67], 0.014, STEELP);
  P(box(0.05, 0.3, 0.03), STEELP, [0, 0.89, 2.69]);
  glow(b.part(cyl(0.07, 0.02, 6), CY, { bone: chassis, at: [0, 0.89, 2.71], rotation: [90, 0, 0], flat: true }));
  glow(b.part(box(1.7, 0.025, 0.03), CY, { bone: chassis, at: [0, 1.2, 2.62] }));
  for (const s of [1, -1]) {
    P(box(0.5, 0.13, 0.1), BLK, [s * 0.7, 0.98, 2.62]); // headlight housing
    glow(plane(0.44, 0.06, SLIT, [s * 0.7, 0.98, 2.672], [0, 0, 1]), 1.3);
    P(box(0.54, 0.04, 0.14), ARM, [s * 0.7, 1.06, 2.62]);
    // sloped side plates and centre ram
    P(box(0.62, 0.3, 0.1), ARM, [s * 0.78, 0.68, 2.62], { rotation: [0, s * 22, 0] });
  }
  P(box(1.0, 0.3, 0.12), HAZP, [0, 0.68, 2.7]);
  plane(0.34, 0.11, PLATE, [0, 0.68, 2.762], [0, 0, 1]);
  for (let i = -2; i <= 2; i++) b.spike([i * 0.2, 0.56, 2.7], [0, -0.1, 1], 0.16, 0.035, STEELP, { bone: chassis, sides: 4 });

  // ================================================================ sides: skirts, doors, mirrors
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const dj = doorJ[sd];
    P(box(0.08, 0.22, 2.0), ARM, [s * 0.99, 0.66, 0]);
    plane(1.7, 0.13, HAZ_T, [s * 1.035, 0.62, 0], [s, 0, 0]);
    glow(b.part(box(0.02, 0.025, 1.9), CY, { bone: chassis, at: [s * 1.04, 0.77, 0] }));
    glow(b.part(box(0.03, 0.04, 1.9), MAG, { bone: chassis, at: [s * 0.9, 0.535, 0] }), 1.2);
    // door
    P(box(0.07, 0.66, 1.4), BODYP, [s * 0.985, 1.0, 0.15], { bone: dj });
    P(box(0.05, 0.5, 1.2), ARM, [s * 1.045, 0.98, 0.15], { bone: dj });
    plane(0.5, 0.5, EMBLEM, [s * 1.073, 1.0, 0.15], [s, 0, 0], { bone: dj });
    for (const z of [-0.38, 0.68])
      for (const y of [0.8, 1.16]) P(cyl(0.025, 0.03, 6), STEELP, [s * 1.075, y, z], { bone: dj, rotation: [0, 0, 90] });
    P(box(0.04, 0.05, 0.2), STEELP, [s * 1.03, 1.26, -0.35], { bone: dj });
    // mirror camera
    rod([s * 0.92, 1.52, 1.18], [s * 1.1, 1.58, 1.12], 0.02, STEELP);
    P(box(0.16, 0.12, 0.2), BLK, [s * 1.15, 1.58, 1.1]);
    glow(b.part(box(0.12, 0.07, 0.01), CY, { bone: chassis, at: [s * 1.15, 1.58, 0.995] }));
  }

  // ================================================================ bed
  for (const x of [-0.7, -0.3, 0.3, 0.7]) P(box(0.07, 0.02, 1.7), BLK, [x, 0.86, -1.65]);
  for (const s of [1, -1]) {
    P(box(0.1, 0.55, 1.8), HULLP, [s * 0.9, 1.125, -1.62]);
    P(box(0.14, 0.05, 1.84), ARM, [s * 0.9, 1.425, -1.62]);
    for (const z of [-2.3, -1.8, -1.3, -0.95]) P(box(0.04, 0.5, 0.07), ARM, [s * 0.97, 1.12, z]);
    P(box(0.3, 0.16, 0.5), ARM, [s * 0.82, 0.93, -0.9]); // stowage lockers
  }
  P(box(1.9, 0.8, 0.1), ARM, [0, 1.25, -0.77]); // headboard
  b.sweep(
    polyline([
      [0.88, 1.4, -0.84],
      [0.8, 2.0, -0.84],
      [-0.8, 2.0, -0.84],
      [-0.88, 1.4, -0.84],
    ]),
    0.035,
    STEELP,
    { bone: chassis, sides: 6, caps: "flat" },
  ); // roll hoop
  for (const s of [1, -1]) {
    P(box(0.2, 0.14, 0.14), BLK, [s * 0.45, 2.08, -0.84]);
    glow(b.part(box(0.16, 0.08, 0.01), LAMP, { bone: chassis, at: [s * 0.45, 2.08, -0.917] }), 1.4);
  }
  // tailgate
  P(box(1.7, 0.55, 0.07), HULLP, [0, 1.17, -2.58], { bone: gateJ });
  glow(plane(1.4, 0.4, SIGN, [0, 1.17, -2.618], [0, 0, -1], { bone: gateJ }), 1.2);
  glow(b.part(box(1.7, 0.03, 0.02), CY, { bone: gateJ, at: [0, 1.45, -2.62] }));
  for (const s of [1, -1]) P(cyl(0.03, 0.12, 6), STEELP, [s * 0.8, 0.92, -2.6], { bone: gateJ, rotation: [0, 0, 90] });
  P(box(0.3, 0.05, 0.04), STEELP, [0, 1.38, -2.63], { bone: gateJ });
  plane(0.36, 0.12, PLATE, [0, 0.7, -2.612], [0, 0, -1]);

  // VLS cells
  P(box(1.3, 0.34, 0.8), ARM, [0, 1.02, -1.35]);
  plane(1.2, 0.14, HAZ_T, [0, 1.0, -1.753], [0, 0, -1]);
  for (const x of [-0.4, 0, 0.4])
    for (const z of [-1.15, -1.55]) {
      if (x === 0.4 && z === -1.15) continue;
      P(cyl(0.15, 0.04, 6), STEELP, [x, 1.21, z], { flat: true });
      glow(b.part(cyl(0.025, 0.02, 6), MAG, { bone: chassis, at: [x, 1.235, z] }));
    }
  // the open cell: hinged lid, glowing well, live missile
  P(cyl(0.15, 0.04, 6), STEELP, [0.4, 1.215, -1.15], { bone: lidJ, flat: true });
  P(box(0.12, 0.03, 0.04), BLK, [0.4, 1.2, -1.3], { bone: lidJ });
  glow(b.part(cyl(0.13, 0.02, 6), MAG, { bone: chassis, at: [0.4, 1.2, -1.15] }), 1.3);
  P(cyl(0.07, 0.22, 8), MISSILE, [0.4, 1.3, -1.15]);
  b.spike([0.4, 1.41, -1.15], [0, 1, 0], 0.17, 0.07, MAG, { bone: chassis, sides: 6 });
  b.pose(lidJ, { axis: [1, 0, 0], deg: -70 });

  // battery cells, tank, crate, cables
  for (const s of [1, -1]) {
    P(cyl(0.16, 0.56, 8), BLK, [s * 0.5, 1.13, -2.35], { flat: true });
    for (const y of [1.02, 1.2]) {
      glow(b.part(new THREE.TorusGeometry(0.165, 0.02, 4, 10), CY, { bone: chassis, at: [s * 0.5, y, -2.35], rotation: [90, 0, 0] }));
    }
    P(cyl(0.08, 0.06, 6), STEELP, [s * 0.5, 1.44, -2.35]);
  }
  P(cyl(0.17, 0.4, 8), STEELP, [0.6, 1.03, -1.98], { rotation: [90, 0, 0], flat: true });
  P(cyl(0.175, 0.06, 8), YEL, [0.6, 1.03, -1.9], { rotation: [90, 0, 0] });
  P(box(0.5, 0.3, 0.4), ARM, [-0.55, 1.01, -2.0]);
  plane(0.44, 0.27, STENCIL, [-0.55, 1.01, -1.798], [0, 0, 1]);
  b.sweep(catmull([[0.5, 1.45, -2.35], [0.56, 1.64, -2.05], [0.62, 1.26, -1.7]]), 0.02, RUB, { bone: chassis, sides: 5 });
  b.sweep(catmull([[-0.5, 1.45, -2.35], [-0.56, 1.64, -2.05], [-0.62, 1.26, -1.7]]), 0.02, RUB, { bone: chassis, sides: 5 });

  // ================================================================ hover pods
  const DUCT: [number, number][] = [
    [0.34, 0.0],
    [0.44, 0.06],
    [0.46, 0.3],
    [0.4, 0.5],
    [0.34, 0.5],
    [0.33, 0.4],
    [0.33, 0.12],
    [0.3, 0.04],
  ];
  for (const [k, s, z] of pods) {
    const x = s * 1.2;
    const tj = tiltJ[k];
    const fj = fanJ[k];
    b.lathe(DUCT, { at: [x, 0, z], axis: [0, 1, 0], segments: 12, bone: tj, color: ARM });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      P(box(0.05, 0.22, 0.05), STEELP, [x + 0.47 * Math.sin(a), 0.27, z + 0.47 * Math.cos(a)], { bone: tj, rotation: [0, deg(a), 0] });
    }
    glow(b.part(new THREE.TorusGeometry(0.39, 0.025, 5, 12), CY, { bone: tj, at: [x, 0.05, z], rotation: [90, 0, 0] }), 1.2);
    glow(b.part(new THREE.TorusGeometry(0.335, 0.018, 4, 12), CY, { bone: tj, at: [x, 0.46, z], rotation: [90, 0, 0] }));
    glow(
      b.part(new THREE.CircleGeometry(0.3, 12), "#ffffff", {
        bone: tj,
        at: [x, 0.035, z],
        dir: [0, -1, 0],
        axis: "z",
        texture: THRUST,
      }),
      1.4,
    );
    rod([x - 0.33, 0.49, z], [x + 0.33, 0.49, z], 0.014, STEELP, { bone: tj, sides: 5 });
    rod([x, 0.49, z - 0.33], [x, 0.49, z + 0.33], 0.014, STEELP, { bone: tj, sides: 5 });
    P(cyl(0.07, 0.1, 8), STEELP, [x, 0.34, z], { bone: fj });
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * TAU;
      P(box(0.05, 0.012, 0.26), i % 2 ? BLK : "#3a4258", [x + 0.18 * Math.sin(a), 0.32, z + 0.18 * Math.cos(a)], {
        bone: fj,
        rotation: [0, deg(a), 25],
      });
    }
    for (const dz of [-0.4, 0.4]) P(box(0.52, 0.09, 0.12), ARM, [s * 0.95, 0.55, z + dz]); // outrigger beams
    P(box(0.12, 0.1, 0.12), YEL, [s * 0.72, 0.53, z]); // beacon stub
  }

  // ================================================================ rear boosters
  for (const s of [1, -1]) {
    const x = s * 0.55;
    P(box(0.62, 0.62, 0.1), ARM, [x, 0.68, -2.65]);
    b.lathe(
      [
        [0, 0],
        [0.18, 0],
        [0.14, 0.1],
        [0.28, 0.5],
        [0.24, 0.5],
        [0.11, 0.12],
        [0, 0.14],
      ],
      { at: [x, 0.68, -2.7], axis: [0, 0, -1], segments: 10, bone: chassis, color: STEELP },
    );
    glow(b.part(cyl(0.1, 0.03, 10), MAG, { bone: chassis, at: [x, 0.68, -2.83], rotation: [90, 0, 0] }), 1.5);
    for (const dz of [-3.0, -3.1])
      P(new THREE.TorusGeometry(0.26, 0.015, 4, 10), BLK, [x, 0.68, dz + 0.1]);
    glow(b.cards([frame([x, 0.68, -3.22], [0, 0, -1])], PLUME, { size: [0.34, 0.8], cross: true, bone: chassis }), 1.4);
  }

  // ================================================================ underbody
  P(box(1.7, 0.05, 3.2), BLK, [0, 0.525, 0]);
  for (const z of [-0.9, 0, 0.9])
    glow(b.part(cyl(0.2, 0.02, 10), CY, { bone: chassis, at: [0, 0.495, z], flat: true }), 1.3);
  glow(b.part(box(0.5, 0.02, 3.0), MAG, { bone: chassis, at: [0, 0.495, 0] }), 1);

  // ================================================================ roof gear
  P(box(1.1, 0.09, 0.12), BLK, [0, 2.12, 0.45]); // light bar
  glow(b.part(box(1.0, 0.04, 0.02), CY, { bone: chassis, at: [0, 2.125, 0.515] }), 1.4);
  for (const s of [1, -1]) P(box(0.05, 0.08, 0.1), STEELP, [s * 0.55, 2.1, 0.45]);
  // smoke launchers
  for (const s of [1, -1]) {
    P(box(0.22, 0.06, 0.16), BLK, [s * 0.72, 2.1, 0.22]);
    for (let i = -1; i <= 1; i++) {
      rod([s * 0.72 + i * 0.065, 2.13, 0.2], [s * 0.75 + i * 0.065, 2.27, 0.36], 0.025, STEELP, { sides: 6 });
      P(cyl(0.03, 0.02, 6), BLK, [s * 0.75 + i * 0.065, 2.275, 0.365], { rotation: [50, 0, 0] });
    }
  }
  // antennas and sensor dome
  P(cyl(0.03, 0.5, 6), STEELP, [0.6, 2.33, -0.4]);
  rod([0.4, 2.5, -0.4], [0.8, 2.5, -0.4], 0.012, STEELP, { sides: 5 });
  rod([0.46, 2.4, -0.4], [0.74, 2.4, -0.4], 0.012, STEELP, { sides: 5 });
  b.spike([-0.78, 2.06, -0.42], [0.05, 1, -0.05], 0.95, 0.014, STEELP, { bone: chassis, sides: 5 });
  glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), MAG, { bone: chassis, at: [-0.74, 3.0, -0.47] }), 1.5);
  P(cyl(0.18, 0.04, 10), ARM, [-0.5, 2.095, -0.3], { flat: true });
  P(new THREE.SphereGeometry(0.15, 10, 5, 0, TAU, 0, Math.PI / 2), "#2a6a7a", [-0.5, 2.115, -0.3], { flat: true });
  glow(b.part(cyl(0.04, 0.1, 6), CY, { bone: chassis, at: [-0.5, 2.15, -0.3] }), 1.2);

  // remote weapon station
  P(new THREE.TorusGeometry(0.3, 0.03, 6, 14), STEELP, [0, 2.09, -0.05], { rotation: [90, 0, 0] });
  P(cyl(0.26, 0.12, 10), ARM, [0, 2.15, -0.05], { bone: yaw, flat: true });
  P(box(0.56, 0.2, 0.5), ARM, [0, 2.27, -0.05], { bone: yaw });
  for (const s of [1, -1]) {
    P(box(0.05, 0.28, 0.34), ARM, [s * 0.24, 2.4, -0.02], { bone: yaw });
    P(box(0.18, 0.2, 0.3), YEL, [s * 0.4, 2.3, -0.1], { bone: yaw });
    P(box(0.2, 0.04, 0.32), BLK, [s * 0.4, 2.2, -0.1], { bone: yaw });
  }
  P(box(0.36, 0.22, 0.46), ARM, [0, 2.38, 0.12], { bone: pitch });
  for (const s of [1, -1]) {
    rod([s * 0.1, 2.38, 0.3], [s * 0.1, 2.38, 1.4], 0.035, STEELP, { bone: pitch, sides: 8 });
    P(cyl(0.065, 0.42, 8), ARM, [s * 0.1, 2.38, 0.56], { bone: pitch, rotation: [90, 0, 0], flat: true });
    P(box(0.08, 0.08, 0.12), BLK, [s * 0.1, 2.38, 1.38], { bone: pitch });
    for (const dz of [0.45, 0.62])
      glow(b.part(box(0.14, 0.012, 0.03), MAG, { bone: pitch, at: [s * 0.1, 2.445, dz] }));
  }
  P(cyl(0.05, 0.06, 8), BLK, [0, 2.52, 0.3], { bone: pitch, rotation: [90, 0, 0] });
  glow(b.part(cyl(0.035, 0.02, 8), MAG, { bone: pitch, at: [0, 2.52, 0.335], rotation: [90, 0, 0] }), 1.5);

  return b.root;
}
