import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { svg } from "../../../../src/index";

export const meta = {
  name: "Convoy Hauler 07",
  description:
    "Low-poly cyberpunk armoured convoy hauler: wedge-nosed six-wheel cab with roof turret and neon underglow, guarding a sealed octagonal cargo pod with glowing seams, hazard bands and a locked rear emblem.",
};

type V = [number, number, number];

// ---------- textures ----------
const hazardPolys = (() => {
  let s = "";
  for (let i = -1; i < 6; i++)
    s += `<polygon points="${i * 16},16 ${i * 16 + 8},16 ${i * 16 + 16},0 ${i * 16 + 8},0" fill="#f5c518"/>`;
  return s;
})();
const HAZARD = svg(
  `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="#101014"/>${hazardPolys}<rect width="64" height="16" fill="none" stroke="#101014" stroke-width="2"/></svg>`,
  { size: 128 },
);
const WARN = svg(
  `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="40" rx="3" fill="#f5c518" stroke="#101014" stroke-width="2"/>
  <polygon points="14,6 26,28 2,28" fill="#101014"/><rect x="13" y="12" width="2" height="9" fill="#f5c518"/><rect x="13" y="23" width="2" height="2" fill="#f5c518"/>
  <text x="30" y="16" font-family="monospace" font-weight="bold" font-size="8" fill="#101014">SEALED</text>
  <text x="30" y="25" font-family="monospace" font-weight="bold" font-size="6" fill="#101014">CARGO 77-K</text>
  <text x="6" y="36" font-family="monospace" font-size="5" fill="#101014">DO NOT BREACH // LETHAL</text></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><polygon points="32,3 58,18 58,46 32,61 6,46 6,18" fill="#0b0d14" stroke="#ff2fa0" stroke-width="3"/>
  <polygon points="32,11 51,22 51,42 32,53 13,42 13,22" fill="none" stroke="#22e8ff" stroke-width="1.6"/>
  <polygon points="36,14 22,35 31,35 27,50 43,28 33,28" fill="#f5c518"/></svg>`,
  { size: 192 },
);
const LOCK = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#05070c"/>
  <circle cx="50" cy="50" r="46" fill="none" stroke="#22e8ff" stroke-width="3"/><circle cx="50" cy="50" r="36" fill="none" stroke="#ff2fa0" stroke-width="2" stroke-dasharray="6 4"/>
  <rect x="32" y="44" width="36" height="28" rx="3" fill="#22e8ff"/><path d="M38 44 V34 A12 12 0 0 1 62 34 V44" fill="none" stroke="#22e8ff" stroke-width="5"/>
  <circle cx="50" cy="56" r="4" fill="#05070c"/><rect x="48.5" y="56" width="3" height="10" fill="#05070c"/>
  <path d="M8 50 h8 M84 50 h8 M50 8 v8 M50 84 v8" stroke="#f5c518" stroke-width="3"/></svg>`,
  { size: 256 },
);
const VISOR = svg(
  `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a2a38"/><stop offset="1" stop-color="#03080e"/></linearGradient></defs>
  <rect width="100" height="40" fill="url(#g)"/>
  <path d="M0 12 H100 M0 20 H100 M0 28 H100" stroke="#22e8ff" stroke-width="0.6" opacity="0.5"/>
  <polyline points="4,34 20,26 34,30 52,16 70,22 96,8" fill="none" stroke="#22e8ff" stroke-width="1.4"/>
  <rect x="70" y="30" width="22" height="4" fill="#ff2fa0"/><rect x="6" y="6" width="14" height="3" fill="#22e8ff"/></svg>`,
  { size: 256 },
);
const TAG = svg(
  `<svg viewBox="0 0 200 36" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="36" rx="4" fill="#07080d" stroke="#22e8ff" stroke-width="2"/>
  <text x="10" y="16" font-family="monospace" font-weight="bold" font-size="12" fill="#22e8ff">ARMOURED HAULER</text>
  <text x="10" y="30" font-family="monospace" font-size="9" fill="#ff2fa0">CONVOY 07 // ESCORT ACTIVE</text>
  <polygon points="168,6 194,6 182,30 156,30" fill="#f5c518"/></svg>`,
  { size: 512 },
);
const PLATE = svg(
  `<svg viewBox="0 0 70 24" xmlns="http://www.w3.org/2000/svg"><rect width="70" height="24" rx="3" fill="#e9e9ef" stroke="#101014" stroke-width="2"/>
  <text x="35" y="18" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="15" fill="#101014">NX-0777</text></svg>`,
  { size: 192 },
);

// ---------- paints ----------
function hullPaint(a: string, c: string, seed: number) {
  return paint((p, n) => {
    const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
    const [u, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
    const du = (((u / 0.8) % 1) + 1) % 1 * 0.8;
    const dv = (((v / 0.6) % 1) + 1) % 1 * 0.6;
    let col = mix(a, c, smoothstep(0.3, 0.7, noise(p, 0.6, seed)));
    if (du < 0.014 || dv < 0.014) col = mix(col, "#07080c", 0.85);
    else if (du < 0.03 || dv < 0.03) col = mix(col, "#8a93ad", 0.2);
    col = mix(col, "#8a93ad", 0.25 * smoothstep(0.6, 1, n.y));
    const dirt = smoothstep(1.7, 0.6, p.y) * smoothstep(0.35, 0.7, noise(p, 0.35, seed + 4));
    col = mix(col, "#3d3226", dirt * 0.8);
    col = mix(col, "#b9c0d4", smoothstep(0.72, 0.8, noise(p, 0.07, seed + 9)) * 0.35);
    return col;
  });
}
const HULL = hullPaint("#2a2f3d", "#373d50", 1);
const ARMOUR = hullPaint("#222633", "#2f3445", 7);
const POD = hullPaint("#c6ccd9", "#e2e6ee", 12);
const TYRE = paint((p, n) => {
  let col = mix("#15161b", "#23252d", noise(p, 0.1, 3));
  col = mix(col, "#4a3b2c", smoothstep(0.55, 0.05, p.y) * 0.8 * (0.5 + noise(p, 0.2, 5)) + 0 * n.y);
  return col;
});

export default function build() {
  const b = createBuilder({ name: "convoyHauler", paintSize: 2048 });
  const CH = b.joint("chassis", { at: [0, 0.9, 0], role: "spine" });

  const NEON_C = "#22e8ff", NEON_M = "#ff2fa0", YEL = "#f5c518", DARK = "#0d0f16", STEEL = "#6d7488";

  const box = (size: V, at: V, color: any, o: any = {}) =>
    b.part(new THREE.BoxGeometry(...size), color, { at, bone: o.bone ?? CH, rotation: o.rot });
  const cyl = (r: number, h: number, sides: number, at: V, color: any, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, sides), color, { at, bone: o.bone ?? CH, rotation: o.rot, flat: true });
  const rod = (a: V, c: V, r: number, color: any, bone: any = CH) => b.rod(a, c, r, color, { bone, sides: 6 });
  const plate = (tex: any, at: V, dir: V, w: number, h: number, str = 0, bone: any = CH) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", up: [0, 1, 0], texture: tex, bone });
    if (str > 0) glow(p, str);
    return p;
  };

  // ---------- chassis ----------
  box([1.9, 0.28, 8.2], [0, 0.82, 0], DARK);
  for (const z of [-3.9, -2.4, -0.4, 1.6]) box([2.2, 0.2, 0.25], [0, 0.82, z], ARMOUR);
  box([2.1, 0.24, 5.9], [0, 1.2, -1.1], HULL); // rear deck
  box([2.2, 0.5, 2.4], [0, 1.15, 3.0], ARMOUR); // under cab
  rod([0, 0.7, 3.8], [0, 0.7, -3.9], 0.07, STEEL);
  // underglow
  for (const s of [1, -1]) {
    glow(box([0.06, 0.05, 3.4], [s * 1.02, 0.7, 0.4], NEON_M), 1.2);
    glow(box([0.06, 0.05, 1.2], [s * 1.02, 0.7, -2.5], NEON_M), 1.2);
  }
  glow(box([2.2, 0.05, 0.06], [0, 0.78, 4.4], NEON_M), 1.2);

  // ---------- wheels ----------
  const axles = [2.9, -1.8, -3.1];
  for (const s of [1, -1]) {
    axles.forEach((z, i) => {
      const side = s > 0 ? "L" : "R";
      const hub: V = [s * 1.2, 0.55, z];
      const wj = b.joint(`wheel${side}${i}`, { parent: CH, at: hub, dir: [1, 0, 0], role: "hinge" });
      b.part(new THREE.CylinderGeometry(0.56, 0.56, 0.46, 12), TYRE, { at: hub, bone: wj, rotation: [0, 0, 90], flat: true });
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2 + 0.26;
        b.part(new THREE.BoxGeometry(0.48, 0.1, 0.16), TYRE, {
          at: [hub[0], hub[1] + 0.57 * Math.cos(a), hub[2] + 0.57 * Math.sin(a)],
          bone: wj,
          rotation: [(a * 180) / Math.PI, 0, 0],
        });
      }
      b.part(new THREE.CylinderGeometry(0.33, 0.33, 0.5, 8), "#4b5166", { at: hub, bone: wj, rotation: [0, 0, 90], flat: true });
      b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.58, 6), "#222633", { at: hub, bone: wj, rotation: [0, 0, 90], flat: true });
      glow(
        b.part(new THREE.TorusGeometry(0.23, 0.03, 5, 16), NEON_C, {
          at: [hub[0] + s * 0.26, hub[1], hub[2]],
          bone: wj,
          rotation: [0, 90, 0],
        }),
        1.3,
      );
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 6), "#c9cfdd", {
          at: [hub[0] + s * 0.27, hub[1] + 0.15 * Math.cos(a), hub[2] + 0.15 * Math.sin(a)],
          bone: wj,
          rotation: [0, 0, 90],
        });
      }
    });
    // fenders
    box([0.8, 0.14, 1.5], [s * 1.2, 1.32, 2.9], ARMOUR);
    box([0.8, 0.14, 2.8], [s * 1.2, 1.3, -2.45], ARMOUR);
    box([0.08, 0.35, 2.8], [s * 1.58, 1.1, -2.45], ARMOUR, { rot: [0, 0, s * -10] });
    plate(HAZARD, [s * 1.241, 1.12, -2.45], [s, 0, 0], 2.6, 0.14);
    box([0.8, 0.6, 0.05], [s * 1.2, 0.75, -3.5], DARK); // mudflap
    // side tanks & armour plates between axles
    cyl(0.33, 1.6, 8, [s * 1.1, 0.8, 1.0], "#3b4256", { rot: [90, 0, 0] });
    for (const z of [0.4, 1.6]) box([0.06, 0.1, 0.4], [s * 1.1, 0.8, z], YEL);
    box([0.1, 0.62, 1.1], [s * 1.2, 0.98, -0.55], ARMOUR);
    plate(HAZARD, [s * 1.255, 0.9, -0.55], [s, 0, 0], 1.0, 0.25);
    plate(WARN, [s * 1.255, 1.12, -0.55], [s, 0, 0], 0.7, 0.2);
  }

  // ---------- cab ----------
  const profile: any[] = [
    [1.8, 1.4], [4.1, 1.4], [4.1, 2.3, "sharp"], [3.6, 2.55, "sharp"], [3.0, 3.2, "sharp"], [2.0, 3.3, "sharp"], [1.8, 3.0, "sharp"],
  ];
  b.extrude(profile, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.5, bevel: 0.05, color: HULL, bone: CH });
  // windscreen
  plate(VISOR, [0, 2.9, 3.325], [0, 0.68, 0.735], 2.2, 0.88, 0.7);
  box([2.4, 0.1, 0.2], [0, 3.28, 2.95], ARMOUR, { rot: [-12, 0, 0] }); // brow
  box([2.4, 0.12, 0.2], [0, 2.52, 3.68], ARMOUR, { rot: [-12, 0, 0] }); // dash lip
  for (const s of [1, -1]) {
    plate(VISOR, [s * 1.262, 2.75, 2.55], [s, 0, 0], 0.9, 0.5, 0.5);
    plate(EMBLEM, [s * 1.262, 1.95, 3.3], [s, 0, 0], 0.55, 0.55, 0.3);
    box([0.04, 1.1, 0.04], [s * 1.26, 1.95, 2.15], DARK);
    box([0.04, 1.1, 0.04], [s * 1.26, 1.95, 3.7], DARK);
    box([0.05, 0.06, 0.25], [s * 1.27, 2.15, 2.4], STEEL);
    rod([s * 1.25, 2.9, 3.45], [s * 1.75, 2.95, 3.55], 0.03, STEEL); // mirror arm
    box([0.08, 0.5, 0.28], [s * 1.78, 2.95, 3.55], DARK);
    glow(box([0.02, 0.4, 0.2], [s * 1.735, 2.95, 3.55], NEON_C), 0.6);
    // headlights
    glow(box([0.7, 0.1, 0.06], [s * 0.85, 2.1, 4.12], NEON_C), 1.6);
    glow(box([0.4, 0.07, 0.06], [s * 0.85, 1.9, 4.12], NEON_M), 1.4);
    box([0.8, 0.25, 0.1], [s * 0.85, 2.0, 4.08], DARK);
    // exhaust stacks
    rod([s * 1.1, 1.4, 1.6], [s * 1.1, 3.5, 1.6], 0.09, "#3b4256");
    cyl(0.13, 0.1, 6, [s * 1.1, 3.55, 1.6], DARK);
    glow(cyl(0.1, 0.04, 6, [s * 1.1, 3.61, 1.6], NEON_M), 1.2);
    box([0.04, 1.0, 0.2], [s * 1.2, 2.2, 1.6], STEEL);
    // antennas
    b.spike([s * 1.0, 3.3, 1.95], [0, 1, 0], 1.5, 0.022, STEEL, { bone: CH, sides: 4 });
    glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), NEON_M, { at: [s * 1.0, 4.85, 1.95], bone: CH, flat: true }), 1.6);
  }
  // grille & bumper
  box([1.4, 0.55, 0.08], [0, 1.85, 4.1], DARK);
  for (let i = 0; i < 5; i++) glow(box([1.3, 0.025, 0.04], [0, 1.65 + i * 0.1, 4.15], NEON_C), 0.8);
  box([2.6, 0.5, 0.4], [0, 1.1, 4.15], ARMOUR);
  plate(HAZARD, [0, 1.15, 4.357], [0, 0, 1], 2.4, 0.3);
  b.frustumBox([0, 1.05, 4.35], [0, 1.0, 4.8], [2.5, 0.5], [1.7, 0.3], { bone: CH, color: ARMOUR });
  for (let i = 0; i < 5; i++)
    b.spike([-0.7 + i * 0.35, 0.95, 4.8], [0, -0.1, 1], 0.28, 0.07, STEEL, { bone: CH, sides: 4 });
  glow(box([1.6, 0.05, 0.05], [0, 0.88, 4.55], NEON_M), 1.4);
  // roof kit
  for (const z of [2.3, 2.6]) box([2.3, 0.08, 0.12], [0, 3.34, z], ARMOUR);
  box([1.8, 0.14, 0.2], [0, 3.3, 3.0], DARK);
  for (let i = 0; i < 6; i++)
    glow(box([0.24, 0.1, 0.05], [-0.75 + i * 0.3, 3.31, 3.12], i % 2 ? NEON_C : NEON_M), 1.5);
  plate(PLATE, [0, 1.5, 4.357], [0, 0, 1], 0.7, 0.24); // front plate on lower bumper area

  // ---------- turret ----------
  const yaw = b.joint("turretYaw", { parent: CH, at: [0, 3.32, 2.25], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("turretPitch", { parent: yaw, at: [0, 3.75, 2.4], dir: [0, 0, 1], role: "hinge" });
  cyl(0.5, 0.2, 8, [0, 3.42, 2.25], ARMOUR, { bone: yaw });
  box([0.95, 0.45, 0.8], [0, 3.72, 2.2], HULL, { bone: yaw });
  box([0.8, 0.3, 0.3], [0, 3.62, 1.8], ARMOUR, { bone: yaw }); // ammo
  b.part(new THREE.SphereGeometry(0.14, 6, 4), DARK, { at: [0.5, 3.95, 2.1], bone: yaw, flat: true });
  glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), NEON_M, { at: [0.5, 3.95, 2.22], bone: yaw, flat: true }), 1.6);
  for (const s of [1, -1]) {
    b.rod([s * 0.2, 3.78, 2.6], [s * 0.2, 3.78, 3.55], 0.07, "#4b5166", { bone: pitch, sides: 6 });
    cyl(0.1, 0.18, 6, [s * 0.2, 3.78, 3.55], DARK, { bone: pitch, rot: [90, 0, 0] });
    glow(cyl(0.04, 0.03, 6, [s * 0.2, 3.78, 3.65], NEON_C, { bone: pitch, rot: [90, 0, 0] }), 1.6);
  }
  box([0.6, 0.3, 0.5], [0, 3.78, 2.7], ARMOUR, { bone: pitch });

  // ---------- cargo pod ----------
  box([1.9, 0.3, 0.5], [0, 1.48, -3.2], DARK);
  box([1.9, 0.3, 0.5], [0, 1.48, -0.8], DARK);
  box([1.9, 0.3, 0.5], [0, 1.48, 0.8], DARK);
  const pod = b.lathe(
    [[0, 0], [0.8, 0], [1.1, 0.25], [1.1, 4.95], [0.8, 5.2], [0, 5.2]],
    { at: [0, 2.4, -3.9], axis: [0, 0, 1], segments: 16, color: POD, bone: CH },
  );
  for (const z of [-3.3, -2.1, -0.9, 0.3])
    b.part(new THREE.TorusGeometry(1.13, 0.06, 5, 16), ARMOUR, { at: [0, 2.4, z], bone: CH });
  for (const z of [-3.3, -0.9]) {
    for (const s of [1, -1]) glow(box([0.05, 0.05, 0.05], [s * 1.0, 3.2, z + 0.62], NEON_C), 1.4);
  }
  // glowing seal seams
  glow(box([0.3, 0.06, 4.4], [0, 3.49, -1.3], NEON_C), 1.5);
  for (const s of [1, -1]) {
    glow(box([0.05, 0.12, 4.4], [s * 0.77, 3.17, -1.3], NEON_C, { rot: [0, 0, s > 0 ? 45 : 135] }), 1.3);
    glow(box([0.05, 0.12, 4.4], [s * 0.77, 1.63, -1.3], NEON_M, { rot: [0, 0, s > 0 ? -45 : -135] }), 1.0);
    b.decal(pod, TAG, { at: [s * 1.1, 2.4, -1.6], dir: [s, 0, 0], size: [2.4, 0.43], segments: 12 });
    b.decal(pod, WARN, { at: [s * 1.1, 2.1, 0.55], dir: [s, 0, 0], size: [0.9, 0.56], segments: 8 });
    b.decal(pod, EMBLEM, { at: [s * 1.1, 2.55, -3.1], dir: [s, 0, 0], size: [0.7, 0.7], segments: 8 });
    b.decal(pod, HAZARD, { at: [s * 1.1, 1.85, -1.6], dir: [s, 0, 0], size: [3.2, 0.3], segments: 12 });
  }
  glow(b.decal(pod, LOCK, { at: [0, 2.4, -3.9], dir: [0, 0, -1], size: [1.4, 1.4], segments: 6 }), 1.2);
  plate(PLATE, [0, 0.95, -4.32], [0, 0, -1], 0.7, 0.24);
  // top hatches & beacons
  for (const z of [-2.7, -0.4]) {
    box([0.7, 0.06, 0.7], [0, 3.52, z], ARMOUR);
    for (const dx of [-0.28, 0.28]) cyl(0.03, 0.04, 6, [dx, 3.57, z + 0.28], STEEL);
  }
  for (const s of [1, -1]) {
    cyl(0.09, 0.14, 6, [s * 0.5, 3.52, 0.9], DARK);
    glow(cyl(0.07, 0.06, 6, [s * 0.5, 3.62, 0.9], "#ff3a2a"), 1.6);
    glow(cyl(0.07, 0.06, 6, [s * 0.5, 3.62, -3.6], "#ff3a2a"), 1.6);
    cyl(0.09, 0.14, 6, [s * 0.5, 3.52, -3.6], DARK);
    // tail lights, tow hooks
    glow(box([0.4, 0.14, 0.05], [s * 0.9, 1.15, -4.2], "#ff3a2a"), 1.4);
    box([0.18, 0.18, 0.1], [s * 0.6, 0.9, -4.3], STEEL);
  }
  box([2.4, 0.3, 0.3], [0, 0.98, -4.15], ARMOUR);
  rod([0, 0.95, -4.2], [0, 0.95, -4.5], 0.05, STEEL);

  return b.root;
}
