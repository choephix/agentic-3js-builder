import * as THREE from "three";
import { createBuilder, mottle, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "Nomad-77 Armored Hauler",
  description:
    "Low-poly cyberpunk 6x6 militarized truck from 2077: armored cab, camo container bed, roof railgun, missile pods, neon underglow, signage decals.",
};

type V = [number, number, number];

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "nomad77", paintSize: 2048 });

  // ---------- palette ----------
  const DARK = "#14171d";
  const DARK2 = "#1d2129";
  const STEEL = "#59616e";
  const STEELD = "#3a404b";
  const TAN = "#7b6e52";
  const TIRE = "#0f1013";
  const RIMC = "#2d333f";
  const CYAN = "#19f0ff";
  const MAG = "#ff2a8a";
  const AMB = "#ffb020";
  const RED = "#ff2030";
  const WHITE = "#e8fbff";

  const HULL = panelled(mottle("#2c323d", "#3d4656", { size: 0.7 }), { size: 0.45, aspect: 0.7, rivets: 0.06 });
  const CAMO = panelled(mottle("#6b5f45", "#8a7b5a", { size: 0.5, seed: 3 }), {
    size: 0.5,
    aspect: 0.6,
    rivets: 0.07,
  });
  const IRON = metal("iron", { tarnish: 0.3 });

  // ---------- textures ----------
  let hz = "";
  for (let i = -2; i < 14; i++)
    hz += `<polygon points="${i * 10},20 ${i * 10 + 5},20 ${i * 10 + 15},0 ${i * 10 + 10},0" fill="#111"/>`;
  const HAZARD = svg(
    `<svg viewBox="0 0 120 20" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="20" fill="#e8b21a"/>${hz}<rect width="120" height="20" fill="none" stroke="#111" stroke-width="2"/></svg>`,
    { size: 256 },
  );
  const WINDSHIELD = svg(
    `<svg viewBox="0 0 220 118" xmlns="http://www.w3.org/2000/svg"><rect width="220" height="118" fill="#07202e"/>
    <polygon points="0,118 60,0 90,0 30,118" fill="#19f0ff" fill-opacity="0.18"/>
    <polygon points="110,118 170,0 185,0 125,118" fill="#ff2a8a" fill-opacity="0.14"/>
    <rect x="0" y="0" width="220" height="10" fill="#0f1319"/>
    <path d="M10 108 L100 60 M110 108 L200 60" stroke="#0f1319" stroke-width="3"/>
    <rect x="2" y="2" width="216" height="114" fill="none" stroke="#0f1319" stroke-width="5"/></svg>`,
    { size: 256 },
  );
  const SIDEWIN = svg(
    `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg"><path d="M0 38 L10 2 L96 2 L96 38Z" fill="#0a2230" stroke="#0f1319" stroke-width="3"/>
    <polygon points="20,38 40,4 52,4 32,38" fill="#19f0ff" fill-opacity="0.2"/><path d="M52 2 L52 38" stroke="#0f1319" stroke-width="2"/></svg>`,
    { size: 256 },
  );
  let slats = "";
  for (let i = 0; i < 9; i++) slats += `<rect x="8" y="${8 + i * 6}" width="154" height="3" fill="#59616e"/>`;
  const GRILLE = svg(
    `<svg viewBox="0 0 170 70" xmlns="http://www.w3.org/2000/svg"><rect width="170" height="70" rx="6" fill="#0b0d11" stroke="#3a404b" stroke-width="4"/>${slats}
    <rect x="70" y="4" width="30" height="62" fill="#ff2a8a" fill-opacity="0.55"/><rect x="82" y="4" width="6" height="62" fill="#111"/></svg>`,
    { size: 256 },
  );
  const SIGN = svg(
    `<svg viewBox="0 0 280 100" xmlns="http://www.w3.org/2000/svg"><rect width="280" height="100" rx="8" fill="#0b0d14"/>
    <rect x="5" y="5" width="270" height="90" rx="6" fill="none" stroke="#19f0ff" stroke-width="3"/>
    <text x="140" y="55" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="40" fill="#ff2a8a">NOMAD-77</text>
    <text x="140" y="82" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="16" fill="#19f0ff">MIL-SEC // 2077</text>
    <path d="M14 20 h40 M226 20 h40" stroke="#ffb020" stroke-width="3"/></svg>`,
    { size: 512 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#0b0d14"/>
    <polygon points="50,6 90,28 90,72 50,94 10,72 10,28" fill="none" stroke="#ff2a8a" stroke-width="5"/>
    <polygon points="50,22 76,36 76,64 50,78 24,64 24,36" fill="none" stroke="#19f0ff" stroke-width="3"/>
    <circle cx="50" cy="50" r="10" fill="#ffb020"/><path d="M50 22 V40 M50 60 V78 M24 36 L40 45 M60 55 L76 64" stroke="#ff2a8a" stroke-width="4"/></svg>`,
    { size: 256 },
  );
  let vslots = "";
  for (let i = 0; i < 8; i++) vslots += `<rect x="${10 + i * 18}" y="8" width="9" height="44" fill="#050607" stroke="#ffb020" stroke-width="1.5"/>`;
  const VENTS = svg(
    `<svg viewBox="0 0 160 60" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="60" rx="4" fill="#20252e" stroke="#0b0d11" stroke-width="3"/>${vslots}</svg>`,
    { size: 256 },
  );
  let tubes = "";
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 3; c++)
      tubes += `<circle cx="${17 + c * 28}" cy="${17 + r * 26}" r="10" fill="#050607" stroke="#ff2030" stroke-width="2.5"/>`;
  const PODS = svg(
    `<svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg"><rect width="90" height="60" fill="#1d2129"/>${tubes}</svg>`,
    { size: 256 },
  );
  const PLATE = svg(
    `<svg viewBox="0 0 60 20" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="20" rx="2" fill="#e8e0b0" stroke="#111" stroke-width="1.5"/>
    <text x="30" y="15" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="12" fill="#111">2077-MIL</text></svg>`,
    { size: 128 },
  );
  const STENCIL = svg(
    `<svg viewBox="0 0 100 36" xmlns="http://www.w3.org/2000/svg"><text x="50" y="26" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="24" fill="#d9d2b8" fill-opacity="0.85">UNIT 07</text></svg>`,
    { size: 256 },
  );

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, color: any, at: V, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: V, dir: V = [0, 1, 0]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, dir });
  const decal = (w: number, h: number, tex: THREE.Texture, at: V, dir: V) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex });
  const lit = <T extends { mesh: THREE.Mesh }>(p: T, s = 1.4) => glow(p, s);
  const ball = (r: number, color: string, at: V) => b.part(new THREE.SphereGeometry(r, 6, 4), color, { at });

  const AX = [2.9, -1.0, -3.0];
  const WY = 0.72;

  // ---------- chassis ----------
  box(2.0, 0.4, 8.6, DARK, [0, 0.9, 0]);
  box(2.4, 0.5, 5.0, DARK2, [0, 1.35, -1.6]);
  box(1.4, 0.3, 8.0, IRON, [0, 0.6, 0]);
  box(0.16, 0.12, 8.0, DARK, [0.45, 0.5, 0]);
  box(0.16, 0.12, 8.0, DARK, [-0.45, 0.5, 0]);
  cyl(0.09, 0.09, 6.4, 6, STEEL, [0, 0.55, -0.4], [0, 0, 1]); // driveshaft
  for (const s of [1, -1]) {
    lit(box(0.07, 0.06, 7.2, CYAN, [s * 0.72, 0.4, -0.2]), 1.6); // underglow
    lit(box(0.07, 0.06, 7.2, MAG, [s * 0.98, 0.4, -0.2]), 1.2);
  }

  // ---------- axles, wheels, fenders ----------
  for (const z of AX) {
    cyl(0.1, 0.1, 3.2, 6, STEEL, [0, WY, z], [1, 0, 0]);
    b.part(new THREE.SphereGeometry(0.27, 8, 6), STEELD, { at: [0, WY, z] });
    for (const s of [1, -1]) {
      const x = s * 1.55;
      cyl(0.66, 0.66, 0.5, 12, TIRE, [x, WY, z], [s, 0, 0]);
      cyl(0.4, 0.4, 0.54, 8, RIMC, [x, WY, z], [s, 0, 0]);
      cyl(0.3, 0.3, 0.07, 8, STEEL, [x + s * 0.27, WY, z], [s, 0, 0]);
      lit(
        b.part(new THREE.TorusGeometry(0.5, 0.025, 4, 16), CYAN, { at: [x + s * 0.26, WY, z], dir: [s, 0, 0], axis: "z" }),
        1.6,
      );
      for (let k = 0; k < 8; k++) {
        const a = (k * Math.PI) / 4;
        cyl(0.025, 0.025, 0.06, 6, STEELD, [x + s * 0.3, WY + Math.cos(a) * 0.2, z + Math.sin(a) * 0.2], [s, 0, 0]);
      }
      for (let k = 0; k < 12; k++) {
        const a = (k * Math.PI) / 6;
        box(0.52, 0.1, 0.22, TIRE, [x, WY + Math.cos(a) * 0.7, z + Math.sin(a) * 0.7], { rotation: [(a * 180) / Math.PI, 0, 0] });
      }
      box(0.7, 0.12, 1.7, STEELD, [x, 1.55, z]);
      box(0.08, 0.3, 1.7, STEELD, [s * 1.9, 1.42, z]);
      b.rod([s * 1.0, 0.95, z], [s * 1.2, 0.72, z + 0.15], 0.05, STEEL); // shock
    }
  }
  for (const s of [1, -1]) {
    box(0.5, 0.5, 0.04, DARK, [s * 1.55, 0.5, -3.95]); // mud flap
    cyl(0.3, 0.3, 1.6, 8, STEELD, [s * 1.2, 0.8, 0.9], [0, 0, 1]); // fuel tank
    cyl(0.31, 0.31, 0.08, 8, AMB, [s * 1.2, 0.8, 0.5], [0, 0, 1]);
    cyl(0.31, 0.31, 0.08, 8, AMB, [s * 1.2, 0.8, 1.3], [0, 0, 1]);
  }

  // ---------- cab ----------
  b.extrude(
    [[1.0, 1.0], [4.3, 1.0], [4.45, 1.75], [3.7, 2.0], [3.0, 2.95], [1.0, 2.95]],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.5, bevel: 0.05, color: HULL },
  );
  // roof fairing
  b.extrude([[0.9, 2.95], [2.4, 2.95], [0.9, 3.35]], {
    at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.3, color: HULL,
  });
  decal(2.2, 1.18, WINDSHIELD, [0, 2.5, 3.37], [0, 0.8, 0.59]);
  box(2.3, 0.05, 0.05, DARK, [0, 3.0, 3.0]);
  // hood and grille
  decal(1.6, 0.6, VENTS, [0, 1.89, 4.08], [0, 0.95, 0.32]);
  decal(1.7, 0.7, GRILLE, [0, 1.35, 4.395], [0, -0.2, 0.98]);
  lit(box(1.9, 0.04, 0.06, CYAN, [0, 1.75, 4.5]), 1.5);
  for (const s of [1, -1]) {
    lit(box(0.5, 0.2, 0.12, WHITE, [s * 0.95, 1.45, 4.44]), 1.8);
    lit(box(0.5, 0.05, 0.14, MAG, [s * 0.95, 1.62, 4.44]), 1.4);
    box(0.6, 0.3, 0.1, DARK, [s * 0.95, 1.45, 4.41]);
    // side window and details
    decal(2.0, 0.8, SIDEWIN, [s * 1.265, 2.35, 2.3], [s, 0, 0]);
    decal(1.0, 0.36, STENCIL, [s * 1.265, 1.65, 2.0], [s, 0, 0]);
    box(0.04, 0.06, 0.22, STEEL, [s * 1.28, 1.9, 1.6]);
    box(0.02, 0.95, 0.03, DARK, [s * 1.265, 1.95, 1.2]);
    box(0.02, 0.8, 0.03, DARK, [s * 1.265, 1.85, 3.3]);
    for (let i = 0; i < 6; i++)
      for (const y of [1.2, 1.4]) box(0.3, 0.17, 0.06, TAN, [s * 1.27, y, 1.5 + i * 0.4]);
    // steps
    box(0.35, 0.06, 0.5, STEEL, [s * 1.4, 0.95, 1.55]);
    box(0.35, 0.06, 0.5, STEEL, [s * 1.4, 0.6, 1.55]);
    // mirrors
    b.rod([s * 1.25, 2.5, 3.2], [s * 1.8, 2.6, 3.35], 0.025, STEEL);
    box(0.06, 0.45, 0.3, DARK, [s * 1.85, 2.55, 3.35]);
    lit(box(0.02, 0.06, 0.12, AMB, [s * 1.89, 2.78, 3.35]), 1.4);
    // exhaust stacks
    cyl(0.1, 0.1, 2.4, 8, STEEL, [s * 1.4, 2.35, 1.15]);
    cyl(0.13, 0.13, 0.1, 8, DARK, [s * 1.4, 3.58, 1.15]);
    lit(cyl(0.08, 0.08, 0.06, 8, RED, [s * 1.4, 3.6, 1.15]), 1.4);
    box(0.14, 0.08, 0.2, STEELD, [s * 1.33, 1.6, 1.15]);
    box(0.14, 0.08, 0.2, STEELD, [s * 1.33, 2.4, 1.15]);
    // fog lights / bumper
    lit(box(0.25, 0.1, 0.08, AMB, [s * 1.15, 0.95, 4.82]), 1.4);
    // tail lights
    lit(box(0.3, 0.3, 0.1, RED, [s * 1.1, 2.0, -4.12]), 1.5);
    lit(box(0.3, 0.08, 0.1, AMB, [s * 1.1, 2.25, -4.12]), 1.3);
  }
  // bumper
  box(2.9, 0.45, 0.5, DARK, [0, 0.78, 4.55]);
  decal(2.4, 0.34, HAZARD, [0, 0.72, 4.806], [0, 0, 1]);
  for (let i = 0; i < 9; i++) b.part(new THREE.ConeGeometry(0.08, 0.35, 5), STEEL, { at: [-1.2 + i * 0.3, 0.6, 4.98], dir: [0, 0, 1] });
  cyl(0.14, 0.14, 0.7, 8, STEELD, [0, 0.85, 4.84], [1, 0, 0]); // winch
  b.rod([-0.3, 0.85, 4.85], [0.3, 0.85, 4.85], 0.03, AMB);
  box(0.12, 0.2, 0.3, STEEL, [0.9, 0.55, 4.8]);

  // ---------- cab roof gear ----------
  box(2.1, 0.06, 0.14, DARK, [0, 3.0, 2.9]);
  const cols = [AMB, MAG, CYAN, MAG, AMB, MAG, CYAN];
  cols.forEach((c, i) => lit(box(0.26, 0.09, 0.1, c, [-0.9 + i * 0.3, 3.07, 2.9]), 1.7));
  b.part(new THREE.SphereGeometry(0.22, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), DARK2, { at: [-0.6, 2.95, 1.8] });
  lit(ball(0.07, CYAN, [-0.6, 3.1, 1.95]), 1.8);
  cyl(0.2, 0.25, 0.15, 8, STEEL, [0.8, 3.03, 2.0]);
  box(0.3, 0.25, 0.45, STEELD, [0.8, 3.25, 2.0]);
  cyl(0.035, 0.035, 0.9, 6, DARK, [0.8, 3.27, 2.6], [0, 0, 1]);
  lit(box(0.12, 0.1, 0.1, CYAN, [0.8, 3.4, 2.2]), 1.6);
  b.rod([-0.95, 2.95, 1.3], [-0.95, 4.3, 1.25], 0.015, STEEL);
  lit(ball(0.04, RED, [-0.95, 4.32, 1.25]), 2);
  b.rod([0.95, 2.95, 1.3], [0.95, 3.9, 1.35], 0.015, STEEL);
  b.rod([-0.3, 2.95, 1.4], [-0.3, 3.6, 1.2], 0.012, STEEL);

  // ---------- cargo container ----------
  box(2.7, 1.6, 5.0, CAMO, [0, 2.4, -1.6]);
  box(2.76, 0.1, 5.06, DARK, [0, 3.2, -1.6]);
  box(2.76, 0.1, 5.06, DARK, [0, 1.62, -1.6]);
  for (const s of [1, -1]) {
    for (const z of [0.65, 0.3, -3.5, -3.85]) box(0.12, 1.6, 0.1, STEEL, [s * 1.38, 2.4, z]);
    box(0.08, 0.1, 5.0, DARK, [s * 1.39, 1.78, -1.6]);
    box(0.08, 0.1, 5.0, DARK, [s * 1.39, 3.12, -1.6]);
    for (let i = 0; i < 9; i++) box(0.42, 0.2, 0.06, TAN, [s * 1.38, 1.95, 0.3 - i * 0.5 + (i > 0 ? 0 : 0)]);
  }
  lit(decal(2.8, 1.0, SIGN, [1.362, 2.6, -1.95], [1, 0, 0]), 1.3);
  lit(decal(1.0, 1.0, EMBLEM, [-1.362, 2.6, -2.9], [-1, 0, 0]), 1.3);
  lit(decal(1.6, 0.57, SIGN, [-1.362, 2.6, -1.1], [-1, 0, 0]), 1.3);
  // rear
  box(2.7, 0.4, 0.4, DARK, [0, 0.9, -4.5]);
  decal(2.5, 0.35, HAZARD, [0, 0.9, -4.705], [0, 0, -1]);
  decal(0.5, 0.17, PLATE, [0, 1.85, -4.112], [0, 0, -1]);
  for (const x of [-0.6, 0, 0.6]) box(0.06, 1.2, 0.08, DARK, [x, 2.4, -4.14]);
  for (const y of [2.1, 2.8]) box(0.05, 0.12, 0.1, STEEL, [0, y, -4.15]);
  lit(box(2.0, 0.05, 0.05, RED, [0, 3.05, -4.12]), 1.4);
  b.rod([-0.8, 0.9, -4.6], [-0.8, 1.5, -4.2], 0.03, AMB);

  // ---------- roof railgun turret ----------
  cyl(0.75, 0.85, 0.2, 12, DARK, [0, 3.35, -2.2]);
  lit(b.part(new THREE.TorusGeometry(0.82, 0.025, 4, 20), CYAN, { at: [0, 3.46, -2.2], dir: [0, 1, 0], axis: "z" }), 1.6);
  box(1.3, 0.55, 1.5, HULL, [0, 3.8, -2.2]);
  box(1.1, 0.4, 0.5, STEEL, [0, 3.82, -1.3]);
  for (const s of [1, -1]) {
    box(0.14, 0.16, 3.4, DARK, [s * 0.22, 3.85, -0.3]);
    box(0.3, 0.45, 0.9, STEELD, [s * 0.8, 3.8, -2.2]);
    lit(box(0.05, 0.1, 0.5, CYAN, [s * 0.97, 3.85, -2.2]), 1.5);
  }
  lit(box(0.1, 0.1, 3.4, CYAN, [0, 3.85, -0.3]), 1.8);
  for (let i = 0; i < 5; i++)
    lit(b.part(new THREE.TorusGeometry(0.3, 0.035, 4, 8), CYAN, { at: [0, 3.85, -1.5 + i * 0.6] }), 1.5);
  box(0.7, 0.3, 0.3, DARK, [0, 3.85, 1.45]);
  box(0.5, 0.5, 0.5, STEELD, [0.5, 3.52, -3.5]); // ammo
  box(0.5, 0.5, 0.5, STEELD, [-0.1, 3.52, -3.6]);

  // ---------- missile pods ----------
  for (const s of [1, -1]) {
    box(0.9, 0.6, 1.2, HULL, [s * 0.95, 3.5, -0.2]);
    decal(0.84, 0.56, PODS, [s * 0.95, 3.5, 0.405], [0, 0, 1]);
    box(0.9, 0.08, 1.0, DARK, [s * 0.95, 3.2, -0.2]);
    lit(box(0.1, 0.06, 0.1, RED, [s * 0.95, 3.84, 0.3]), 1.5);
  }

  // ---------- radar dish and roof clutter ----------
  b.lathe(
    [[0, 0], [0.45, 0.18], [0.47, 0.18], [0.47, 0.2], [0.43, 0.2], [0, 0.03]],
    { at: [-0.85, 3.3, -3.5], axis: [0.4, 1, -0.5], color: STEEL, segments: 10 },
  );
  b.rod([-0.85, 3.25, -3.5], [-0.72, 3.65, -3.7], 0.02, STEELD);
  lit(ball(0.05, MAG, [-0.71, 3.68, -3.72]), 1.6);
  cyl(0.06, 0.06, 0.2, 6, DARK, [-0.85, 3.3, -3.5]);
  for (const s of [1, -1]) {
    box(0.5, 0.08, 0.5, DARK2, [s * 0.7, 3.28, -3.0 - 0.0]);
    b.rod([s * 1.2, 3.25, -4.0], [s * 1.2, 4.2, -4.0], 0.014, STEEL);
    lit(ball(0.035, AMB, [s * 1.2, 4.22, -4.0]), 1.8);
  }
  b.sweep(
    [[0.45, 3.3, -1.8], [0.55, 3.28, -0.9], [0.8, 3.25, 0.5], [0.8, 3.1, 1.8]],
    0.03,
    { color: DARK },
  );

  // ---------- drone-pad light & misc details ----------
  for (let i = 0; i < 4; i++) lit(box(0.35, 0.03, 0.03, AMB, [0, 3.27, -3.0 - i * 0.3 + 0.9]), 1.2);
  b.rod([0, 0.7, 4.3], [0, 0.5, 4.7], 0.05, STEEL); // tow hook arm
  b.part(new THREE.TorusGeometry(0.1, 0.03, 4, 8), STEEL, { at: [0, 0.48, 4.72] });

  return b.root;
}
