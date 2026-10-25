import * as THREE from "three";
import { createBuilder, paint, noise, mix, smoothstep, svg } from "../../../../src/index";
import type { ColorInput } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Hover Technical",
  description:
    "A militarized pickup converted to run on four vertical hover thrusters, with a bed-mounted twin gun, armor plates and neon cyberpunk lighting.",
};

// ---- palette ---------------------------------------------------------------
const CYAN = "#3ff6ff";
const MAGENTA = "#ff2fa8";
const AMBER = "#ffb347";
const RED = "#ff3040";
const DARK = "#14161d";
const GUN = "#262a33";
const RUBBER = "#0d0e12";

const camo = paint((p, n) => {
  const a = noise(p, 0.5, 3);
  const c = mix(mix("#2b3530", "#3e4b40", smoothstep(0.35, 0.65, a)), "#1f262d", smoothstep(0.55, 0.8, noise(p, 0.28, 8)));
  if (n.y > 0.7 && Math.abs(p.x) < 0.1 && p.z > 1.3) return MAGENTA;
  const top = 0.85 + 0.2 * smoothstep(0, 1, n.y);
  return [c[0] * top, c[1] * top, c[2] * top];
});
const HULL = panelled(camo, { size: 0.32, aspect: 0.6, rivets: 0.07 });
const ARMOR = panelled(metal("iron", { tarnish: 0.5 }), { size: 0.22, rivets: 0.05 });
const PODMETAL = metal("steel", { tarnish: 0.5, polish: 0.1 });

// ---- textures --------------------------------------------------------------
const WINDSHIELD = svg(
  `<svg viewBox="0 0 140 90"><rect width="140" height="90" rx="6" fill="#06141c" stroke="#0b0d12" stroke-width="5"/>
  <polygon points="10,5 60,5 30,85 5,85" fill="#0f3a4a" opacity="0.7"/>
  <polygon points="80,5 100,5 70,85 52,85" fill="#0f3a4a" opacity="0.5"/>
  <path d="M10 70 H130" stroke="${CYAN}" stroke-width="2" opacity="0.7"/>
  <path d="M20 78 H50 M90 78 H120" stroke="${MAGENTA}" stroke-width="2"/>
  <text x="70" y="64" font-size="9" fill="${CYAN}" text-anchor="middle" font-family="monospace">HVR 034 ▲ ALT 0.4</text></svg>`,
  { size: 256 },
);
const SIDEWIN = svg(
  `<svg viewBox="0 0 130 50"><polygon points="5,5 85,5 122,36 122,45 5,45" fill="#071820" stroke="#0b0d12" stroke-width="3"/>
  <polygon points="12,8 40,8 22,42 12,42" fill="#17566a" opacity="0.6"/>
  <path d="M8 40 H118" stroke="${CYAN}" stroke-width="1.5" opacity="0.8"/></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 60"><rect width="100" height="60" rx="5" fill="#101218" stroke="${MAGENTA}" stroke-width="3"/>
  <path d="M8 8 L40 8 L30 52 L8 52Z" fill="${MAGENTA}"/>
  <text x="68" y="40" font-size="30" font-weight="bold" fill="${CYAN}" text-anchor="middle" font-family="monospace">07</text>
  <text x="19" y="38" font-size="20" font-weight="bold" fill="#101218" text-anchor="middle" font-family="monospace">H</text></svg>`,
  { size: 192 },
);
const HAZARD = svg(
  `<svg viewBox="0 0 120 30"><rect width="120" height="30" fill="#e8b81c"/>
  ${Array.from({ length: 8 }, (_, i) => `<polygon points="${i * 18 - 10},30 ${i * 18 + 2},0 ${i * 18 + 12},0 ${i * 18},30" fill="#15161b"/>`).join("")}
  <rect x="0" y="0" width="120" height="30" fill="none" stroke="#15161b" stroke-width="3"/></svg>`,
  { size: 256 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 90 30"><rect width="90" height="30" fill="#0a0b0f"/>
  ${Array.from({ length: 7 }, (_, i) => `<rect x="4" y="${3 + i * 4}" width="82" height="2" fill="${i % 3 === 0 ? MAGENTA : "#3a4152"}"/>`).join("")}</svg>`,
  { size: 192 },
);
const SIGN = svg(
  `<svg viewBox="0 0 80 40"><rect width="80" height="40" rx="4" fill="#0a0b10"/>
  <text x="40" y="27" font-size="22" fill="${CYAN}" text-anchor="middle" font-family="monospace" font-weight="bold">浮遊</text></svg>`,
  { size: 192 },
);

// ---- builder ---------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });
  type V = [number, number, number];
  const box = (s: V, c: ColorInput, at: V, o: Record<string, unknown> = {}) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), c, { at, ...o });
  const cyl = (r0: number, r1: number, h: number, seg: number, c: ColorInput, at: V, dir: V = [0, 1, 0]) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, seg), c, { at, dir });
  const decal = (geo: THREE.BufferGeometry, tex: THREE.Texture, at: V, dir: V) =>
    b.part(geo, "#ffffff", { at, dir, axis: "z", texture: tex });

  // chassis and hull
  box([1.5, 0.22, 4.7], DARK, [0, 0.45, 0]);
  b.extrude(
    [[-2.5, 0.55], [2.5, 0.55], [2.6, 0.8], [2.45, 1.0], [1.4, 1.14], [-2.5, 1.14]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.9, bevel: 0.03, color: HULL },
  );
  // cab
  b.extrude(
    [[-0.55, 1.1], [-0.55, 1.85], [-0.4, 1.95], [0.5, 1.95], [1.3, 1.12]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.8, bevel: 0.03, color: HULL },
  );
  // windshield on slope
  decal(new THREE.PlaneGeometry(1.5, 1.0), WINDSHIELD, [0, 1.54 + 0.01, 0.9 + 0.01], [0, 0.8, 0.83]);
  glow(
    b.part(new THREE.PlaneGeometry(1.5, 1.0), "#ffffff", { at: [0, 1.55, 0.91], dir: [0, 0.8, 0.83], axis: "z", texture: WINDSHIELD }),
    0.5,
  );
  for (const s of [1, -1]) {
    decal(new THREE.PlaneGeometry(1.3, 0.5), SIDEWIN, [s * 0.905, 1.65, 0.25], [s, 0, 0]);
    // door armor + emblem
    box([0.06, 0.4, 0.85], ARMOR, [s * 0.93, 1.3, 0.2]);
    decal(new THREE.PlaneGeometry(0.4, 0.24), EMBLEM, [s * 0.965, 1.3, 0.2], [s, 0, 0]);
    // fender armor
    box([0.07, 0.28, 1.0], ARMOR, [s * 0.985, 0.95, 1.8]);
    // skirts + neon
    box([0.1, 0.2, 2.0], DARK, [s * 0.98, 0.65, 0]);
    glow(box([0.02, 0.04, 2.0], CYAN, [s * 1.035, 0.62, 0]), 1.4);
    glow(box([0.02, 0.03, 4.2], MAGENTA, [s * 0.9, 0.34, 0]), 1.2);
    // headlights, taillights
    glow(box([0.4, 0.14, 0.1], "#e8ffff", [s * 0.66, 0.9, 2.52]), 1.8);
    glow(box([0.3, 0.1, 0.06], RED, [s * 0.7, 1.0, -2.53]), 1.6);
    // mirrors
    box([0.2, 0.03, 0.03], GUN, [s * 1.0, 1.55, 1.0]);
    box([0.04, 0.2, 0.14], DARK, [s * 1.1, 1.55, 1.0]);
    // bed walls
    box([0.1, 0.35, 1.95], HULL, [s * 0.85, 1.31, -1.525]);
    glow(box([0.04, 0.03, 1.9], CYAN, [s * 0.85, 1.5, -1.525]), 1.3);
    // roll-bar uprights
    b.rod([s * 0.82, 1.14, -0.65], [s * 0.82, 2.25, -0.65], 0.04, GUN);
    // hover pods
    for (const z of [1.6, -1.6]) {
      const px = s * 1.2;
      box([0.7, 0.14, 0.24], DARK, [s * 0.95, 0.62, z]);
      b.lathe(
        [[0.32, 0], [0.5, 0.06], [0.52, 0.35], [0.4, 0.55], [0, 0.55], [0, 0.25], [0.3, 0.25]],
        { at: [px, 0, z], segments: 10, color: PODMETAL },
      );
      glow(cyl(0.29, 0.29, 0.03, 10, CYAN, [px, 0.22, z]), 2);
      cyl(0.38, 0.4, 0.3, 8, GUN, [px, 0.7, z]);
      glow(b.part(new THREE.TorusGeometry(0.52, 0.02, 4, 12), MAGENTA, { at: [px, 0.3, z], rotation: [90, 0, 0] }), 1.5);
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        box([0.05, 0.3, 0.2], DARK, [px + Math.sin(a) * 0.5, 0.35, z + Math.cos(a) * 0.5], { rotation: [0, (a * 180) / Math.PI, 0] });
      }
    }
    // gun barrels
    cyl(0.04, 0.045, 1.0, 6, GUN, [s * 0.12, 1.78, -1.0], [0, 0, 1]);
    cyl(0.07, 0.07, 0.12, 6, "#555b6a", [s * 0.12, 1.78, -0.5], [0, 0, 1]);
    // hood vents
    box([0.25, 0.03, 0.5], DARK, [s * 0.5, 1.09, 1.9], { rotation: [6, 0, 0] });
    glow(box([0.2, 0.01, 0.04], MAGENTA, [s * 0.5, 1.115, 1.9], { rotation: [6, 0, 0] }), 1.4);
  }
  // rear roll-bar crossbar + rear tailgate
  b.rod([0.82, 2.25, -0.65], [-0.82, 2.25, -0.65], 0.04, GUN);
  b.rod([0.82, 1.7, -0.65], [-0.82, 1.7, -0.65], 0.03, GUN);
  box([1.9, 0.35, 0.1], HULL, [0, 1.31, -2.45]);
  decal(new THREE.PlaneGeometry(1.7, 0.28), HAZARD, [0, 1.3, -2.505], [0, 0, -1]);
  glow(box([1.2, 0.04, 0.04], RED, [0, 0.95, -2.53]), 1.4);
  // front bumper, grille
  box([2.0, 0.28, 0.25], ARMOR, [0, 0.66, 2.62]);
  b.extrude([[-0.9, 0], [0.9, 0], [0.7, 0.22], [-0.7, 0.22]], { at: [0, 0.8, 2.75], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.1, color: GUN });
  decal(new THREE.PlaneGeometry(0.9, 0.3), GRILLE, [0, 0.88, 2.55], [0, 0, 1]);
  glow(box([1.9, 0.03, 0.03], CYAN, [0, 0.5, 2.76]), 1.5);
  // hood scoop
  box([0.6, 0.12, 0.6], HULL, [0, 1.15, 1.7], { rotation: [8, 0, 0] });
  // turret
  b.lathe([[0, 0], [0.45, 0], [0.45, 0.08], [0.3, 0.12], [0, 0.12]], { at: [0, 1.14, -1.5], segments: 12, color: ARMOR });
  cyl(0.12, 0.15, 0.4, 6, GUN, [0, 1.35, -1.5]);
  box([0.5, 0.3, 0.7], GUN, [0, 1.78, -1.5]);
  b.extrude([[-0.45, 0], [0.45, 0], [0.32, 0.55], [-0.32, 0.55]], { at: [0, 1.5, -1.12], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.04, color: ARMOR });
  glow(box([0.3, 0.04, 0.02], AMBER, [0, 1.9, -1.1]), 1.5);
  box([0.3, 0.2, 0.3], DARK, [0.38, 1.7, -1.6]); // ammo box
  // roof gear
  box([1.2, 0.1, 0.2], DARK, [0, 2.01, 0.1]);
  glow(box([0.5, 0.08, 0.22], CYAN, [0.3, 2.07, 0.1]), 1.8);
  glow(box([0.5, 0.08, 0.22], MAGENTA, [-0.3, 2.07, 0.1]), 1.8);
  b.rod([-0.8, 1.95, -0.3], [-0.9, 2.9, -0.5], 0.012, GUN);
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), RED, { at: [-0.9, 2.9, -0.5] }), 2);
  b.rod([0.8, 1.95, -0.3], [0.7, 2.5, -0.4], 0.01, GUN);
  // bed cargo
  box([0.55, 0.4, 0.5], ARMOR, [-0.3, 1.34, -2.05]);
  decal(new THREE.PlaneGeometry(0.4, 0.2), SIGN, [-0.3, 1.38, -1.795], [0, 0, 1]);
  glow(b.part(new THREE.PlaneGeometry(0.4, 0.2), "#ffffff", { at: [-0.3, 1.38, -1.793], dir: [0, 0, 1], axis: "z", texture: SIGN }), 1.2);
  cyl(0.18, 0.18, 0.5, 8, "#8a2a3a", [0.35, 1.39, -2.0]);
  // underbody glow bar
  glow(box([0.9, 0.03, 3.0], CYAN, [0, 0.33, 0]), 1.0);
  // rear turbine
  for (const s of [1, -1]) {
    cyl(0.14, 0.12, 0.2, 8, GUN, [s * 0.5, 0.75, -2.58], [0, 0, 1]);
    glow(cyl(0.1, 0.1, 0.02, 8, CYAN, [s * 0.5, 0.75, -2.68], [0, 0, 1]), 2);
  }

  return b.root;
}
