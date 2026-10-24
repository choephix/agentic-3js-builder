import * as THREE from "three";
import { createBuilder, frame, rng, lerp, offset, catmull, limb, paint, noise, mix, smoothstep, svg } from "../../../../src/index";
import type { ColorInput, DirectionInput, Joint, PointInput } from "../../../../src/index";
import { coil, gaugeTexture, metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "RX-7 Maintenance Droid",
  description:
    "A weathered, chunky Star Wars style repair droid: photoreceptor eye with hinged brow, vocoder jaw, hazard-striped joints, welding torch forearm, gripper hand, gas bottles with hoses, tool belt and glowing panels.",
};

type Rgb3 = readonly [number, number, number];
const shade = (c: Rgb3, k: number): [number, number, number] => [c[0] * k, c[1] * k, c[2] * k];

// ------------------------------------------------------------------------------------------------
// Paints: weathered Outer-Rim metal
// ------------------------------------------------------------------------------------------------
const SHELL = paint((p, n) => {
  let c: Rgb3 = mix("#dcd6c2", "#bcb6a0", smoothstep(0.3, 0.7, noise(p, 0.16, 11)));
  c = mix(c, "#8e8672", 0.7 * smoothstep(0.62, 0.78, noise(p, 0.035, 12)));
  const streak = smoothstep(0.62, 0.78, noise(new THREE.Vector3(p.x * 6, p.y * 0.7, p.z * 6), 0.06, 14));
  c = mix(c, "#8a5a35", 0.45 * streak);
  c = mix(c, "#463b30", Math.min(0.8, smoothstep(0.55, 0.05, p.y) * (0.45 + 0.4 * noise(p, 0.08, 13))));
  return shade(c, 0.82 + 0.22 * Math.max(n.y, -0.3));
});
const ORANGE_BASE = paint((p, n) => {
  let c: Rgb3 = mix("#e5702a", "#c4531c", smoothstep(0.3, 0.7, noise(p, 0.12, 21)));
  c = mix(c, "#8d909a", smoothstep(0.66, 0.74, noise(p, 0.03, 22)));
  c = mix(c, "#3a2e24", 0.6 * smoothstep(0.5, 0.0, p.y));
  return shade(c, 0.84 + 0.22 * Math.max(n.y, -0.3));
});
const HAZARD = paint((p, n) => {
  const u = (p.x + p.y * 1.3 + p.z) / 0.035;
  const on = ((Math.floor(u) % 2) + 2) % 2 === 0;
  const c = mix(on ? "#efb81c" : "#201d1b", "#6b665c", 0.6 * smoothstep(0.6, 0.78, noise(p, 0.03, 31)));
  return shade(c, 0.85 + 0.2 * Math.max(n.y, -0.3));
});
const worn = (base: string, seed: number) =>
  paint((p, n) => {
    const c = mix(base, "#2a241e", 0.35 * smoothstep(0.5, 0.0, p.y) + 0.25 * smoothstep(0.6, 0.8, noise(p, 0.04, seed)));
    return shade(c, 0.8 + 0.24 * Math.max(n.y, -0.3));
  });

const SHELL_P = panelled(SHELL, { size: 0.12, rivets: 0.04 });
const ORANGE = panelled(ORANGE_BASE, { size: 0.1, rivets: 0.035 });
const DARK = metal("iron");
const STEEL = metal("steel", { tarnish: 0.3 });
const BRASS = metal("brass", { tarnish: 0.5, verdigris: 0.15 });
const BLUED = metal("blued");
const BOTTLE_BLUE = worn("#2f78b8", 41);
const BOTTLE_RED = worn("#b8352a", 42);

const RUBBER = "#26231f";
const LEATHER = "#6b4a2c";
const ORANGE_FLAT = "#e07a2c";
const RED = "#b5382a";
const BLUE_HOSE = "#2d6fb3";
const AMBER = "#ffb020";
const GREEN = "#47e07a";
const LAMP = "#fff1c2";

// ------------------------------------------------------------------------------------------------
// Textures
// ------------------------------------------------------------------------------------------------
const lensSvg = (c0: string, c1: string, c2: string, c3: string, pupil: string) => {
  let blades = "";
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 + 0.3;
    const x0 = (50 + Math.cos(a) * 16).toFixed(1);
    const y0 = (50 + Math.sin(a) * 16).toFixed(1);
    const x1 = (50 + Math.cos(a + 0.9) * 42).toFixed(1);
    const y1 = (50 + Math.sin(a + 0.9) * 42).toFixed(1);
    blades += `<path d="M${x0} ${y0} L${x1} ${y1}" stroke="${c3}" stroke-width="2.6" fill="none" opacity="0.8"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="g" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${c0}"/><stop offset="0.35" stop-color="${c1}"/><stop offset="0.8" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/></radialGradient></defs>
      <circle cx="50" cy="50" r="50" fill="url(#g)"/>
      <circle cx="50" cy="50" r="44" fill="none" stroke="${c3}" stroke-width="2" opacity="0.7"/>
      <circle cx="50" cy="50" r="30" fill="none" stroke="${c3}" stroke-width="1.5" opacity="0.6"/>
      ${blades}
      <circle cx="50" cy="50" r="12" fill="${pupil}"/>
      <ellipse cx="38" cy="35" rx="8" ry="5.5" fill="#ffffff" opacity="0.85" transform="rotate(-30 38 35)"/>
      <circle cx="62" cy="64" r="3" fill="#ffffff" opacity="0.6"/>
    </svg>`,
    { size: 192 },
  );
};
const EYE_TEX = lensSvg("#fff3c0", "#ffc02e", "#e0640e", "#6a1c04", "#2a0b02");
const SENSOR_TEX = lensSvg("#e6fbff", "#5fdcff", "#1d86c8", "#0a3a66", "#06182c");

const panelSvg = () => {
  const hs = [18, 30, 22, 34, 28, 16, 32, 24];
  let bars = "";
  hs.forEach((h, i) => {
    bars += `<rect x="${18 + i * 12}" y="${78 - h}" width="8" height="${h}" fill="${i % 3 === 0 ? "#ffb020" : "#3dfad0"}"/>`;
  });
  let toggles = "";
  for (let i = 0; i < 5; i++)
    toggles += `<rect x="${14 + i * 24}" y="114" width="16" height="14" rx="3" fill="#0c0d10" stroke="#59606b" stroke-width="2"/><rect x="${18 + i * 24}" y="${i % 2 ? 117 : 122}" width="8" height="6" fill="${i % 2 ? "#ff3b2a" : "#d0d4da"}"/>`;
  return svg(
    `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="196" height="136" rx="10" fill="#23262b" stroke="#0c0d10" stroke-width="4"/>
      <rect x="12" y="12" width="110" height="70" rx="5" fill="#0b2a2e" stroke="#2b4c52" stroke-width="3"/>
      <polyline points="16,34 30,24 42,36 56,20 70,32 84,22 98,34 116,24" fill="none" stroke="#3dfad0" stroke-width="3"/>
      ${bars}
      <circle cx="146" cy="26" r="9" fill="#ff3b2a"/><circle cx="174" cy="26" r="9" fill="#ffb020"/>
      <circle cx="146" cy="56" r="9" fill="#47e07a"/><circle cx="174" cy="56" r="9" fill="#4ad8ff"/>
      <rect x="12" y="90" width="176" height="16" rx="3" fill="#0b2a2e" stroke="#2b4c52" stroke-width="2"/>
      <text x="18" y="102" font-family="monospace" font-weight="bold" font-size="11" fill="#3dfad0">DIAG 87% // HYDRO OK</text>
      ${toggles}
    </svg>`,
    { size: 256 },
  );
};
const PANEL_TEX = panelSvg();
const GAUGE_TEX = gaugeTexture({ needle: 62, label: "PWR" });

const STENCIL_TEX = svg(
  `<svg viewBox="0 0 160 52" xmlns="http://www.w3.org/2000/svg">
    <text x="80" y="34" text-anchor="middle" font-family="Impact, 'Arial Black', sans-serif" font-weight="900" font-size="36" fill="#2b2824" letter-spacing="3">R7-W3</text>
    <rect x="8" y="39" width="144" height="2.6" fill="#2b2824"/>
    <text x="80" y="50" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="8" fill="#2b2824">MAINTENANCE - CLASS III</text>
  </svg>`,
  { size: 256 },
);
const WARN_TEX = svg(
  `<svg viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,6 96,84 4,84" fill="#f2b705" stroke="#1d1b19" stroke-width="7" stroke-linejoin="round"/>
    <rect x="45" y="30" width="10" height="28" rx="3" fill="#1d1b19"/><circle cx="50" cy="70" r="6" fill="#1d1b19"/>
  </svg>`,
  { size: 128 },
);
const grilleSvg = () => {
  let slats = "";
  for (let i = 0; i < 6; i++) slats += `<rect x="8" y="${3 + i * 3.4}" width="104" height="1.9" fill="#8a909c"/>`;
  return svg(
    `<svg viewBox="0 0 120 24" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="118" height="22" rx="3" fill="#14161a" stroke="#3b3f47" stroke-width="2"/>${slats}</svg>`,
    { size: 192 },
  );
};
const GRILLE_TEX = grilleSvg();
const fanSvg = () => {
  let blades = "";
  for (let i = 0; i < 7; i++)
    blades += `<ellipse cx="50" cy="31" rx="7" ry="17" fill="#4d535e" stroke="#14161a" stroke-width="1" transform="rotate(${((i * 360) / 7).toFixed(1)} 50 50)"/>`;
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#14161a" stroke="#5b616c" stroke-width="3"/>
      ${blades}
      <circle cx="50" cy="50" r="42" fill="none" stroke="#7a808c" stroke-width="1.6"/>
      <circle cx="50" cy="50" r="33" fill="none" stroke="#7a808c" stroke-width="1.6"/>
      <circle cx="50" cy="50" r="24" fill="none" stroke="#7a808c" stroke-width="1.6"/>
      <line x1="50" y1="4" x2="50" y2="96" stroke="#7a808c" stroke-width="1.6"/><line x1="4" y1="50" x2="96" y2="50" stroke="#7a808c" stroke-width="1.6"/>
      <circle cx="50" cy="50" r="8" fill="#2a2d33" stroke="#7a808c" stroke-width="1.5"/>
      <circle cx="14" cy="14" r="3" fill="#b08d48"/><circle cx="86" cy="14" r="3" fill="#b08d48"/><circle cx="14" cy="86" r="3" fill="#b08d48"/><circle cx="86" cy="86" r="3" fill="#b08d48"/>
    </svg>`,
    { size: 192 },
  );
};
const FAN_TEX = fanSvg();
const SPEAKER_TEX = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#1a1c20" stroke="#e5702a" stroke-width="5"/>
    <circle cx="50" cy="50" r="36" fill="none" stroke="#6e7480" stroke-width="4"/>
    <circle cx="50" cy="50" r="25" fill="none" stroke="#6e7480" stroke-width="4"/>
    <circle cx="50" cy="50" r="13" fill="none" stroke="#6e7480" stroke-width="4"/>
    <circle cx="50" cy="50" r="4" fill="#6e7480"/>
  </svg>`,
  { size: 128 },
);
const cogPath = (cx: number, cy: number, r0: number, r1: number, n: number) => {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const w = (Math.PI / n) * 0.5;
    for (const [t, r] of [[a - w, r0], [a - w * 0.6, r1], [a + w * 0.6, r1], [a + w, r0]])
      pts.push(`${(cx + Math.cos(t) * r).toFixed(1)},${(cy + Math.sin(t) * r).toFixed(1)}`);
  }
  return pts.join(" ");
};
const EMBLEM_TEX = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="${cogPath(50, 50, 38, 48, 12)}" fill="#f2e8cf" stroke="#1d1b19" stroke-width="3.5" stroke-linejoin="round"/>
    <circle cx="50" cy="50" r="28" fill="#1d1b19"/><circle cx="50" cy="50" r="23" fill="#e5702a"/>
    <g transform="rotate(-45 50 50)">
      <rect x="46" y="26" width="8" height="52" fill="#1d1b19"/>
      <circle cx="50" cy="26" r="10" fill="#1d1b19"/><rect x="46.5" y="14" width="7" height="13" fill="#e5702a"/>
      <circle cx="50" cy="78" r="6" fill="#1d1b19"/>
    </g>
    <g transform="rotate(45 50 50)"><rect x="47" y="22" width="6" height="56" fill="#1d1b19"/><rect x="40" y="20" width="20" height="9" rx="2" fill="#1d1b19"/></g>
  </svg>`,
  { size: 192 },
);

// Wrench outline, hanging head-down from its origin.
const WRENCH: [number, number][] = [
  [-0.01, 0], [-0.01, -0.115], [-0.028, -0.135], [-0.028, -0.18], [-0.01, -0.2], [-0.01, -0.168],
  [0.01, -0.168], [0.01, -0.2], [0.028, -0.18], [0.028, -0.135], [0.01, -0.115], [0.01, 0],
];
const BROW: [number, number][] = [
  [-0.075, -0.012], [0.075, -0.012], [0.075, 0.012], [0.05, 0.03], [0, 0.038], [-0.05, 0.03], [-0.075, 0.012],
];

// ------------------------------------------------------------------------------------------------
export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "repair-droid" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---- helpers ----
  const box = (w: number, h: number, d: number, color: ColorInput, bone: Joint, at: PointInput, extra: Record<string, any> = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, flat: true, ...extra });
  const cyl = (rt: number, rb: number, h: number, color: ColorInput, bone: Joint, at: PointInput, dir: DirectionInput = [0, 1, 0], seg = 10, extra: Record<string, any> = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, dir, flat: true, ...extra });
  const ball = (r: number, color: ColorInput, bone: Joint, at: PointInput) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { bone, at, flat: true });
  const bolt = (bone: Joint, at: PointInput, dir: DirectionInput, r = 0.012) => cyl(r, r, r * 0.8, BRASS, bone, at, dir, 6);

  // ---- skeleton ----
  const pelvis = b.joint("pelvis", { at: [0, 0.62, 0], role: "spine" });
  const spine = b.joint("spine", { parent: pelvis, at: [0, 0.72, 0], dir: [0, 1, 0], role: "spine" });
  const chest = b.joint("chest", { parent: spine, at: [0, 0.86, 0], dir: [0, 1, 0], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 1.14, 0], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.2, 0], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.212, 0.07], dir: [0, 0, 1], role: "jaw" });
  const lid = b.joint("lid", { parent: head, at: [-0.03, 1.352, 0.16], dir: [1, 0, 0], role: "hinge" });

  // =========================================================== PELVIS + BELT
  box(0.34, 0.14, 0.24, SHELL_P, pelvis, [0, 0.63, 0]);
  box(0.36, 0.04, 0.26, LEATHER, pelvis, [0, 0.705, 0]);
  box(0.07, 0.055, 0.02, BRASS, pelvis, [0, 0.705, 0.135]);
  box(0.04, 0.03, 0.01, DARK, pelvis, [0, 0.705, 0.147]);
  for (const s of [1, -1]) {
    box(0.04, 0.1, 0.15, ORANGE, pelvis, [s * 0.185, 0.69, 0]);
    box(0.075, 0.075, 0.045, LEATHER, pelvis, [s * 0.1, 0.665, -0.14]);
    box(0.02, 0.02, 0.01, BRASS, pelvis, [s * 0.1, 0.68, -0.167]);
  }
  // tools hanging in front of the belt
  b.extrude(WRENCH, { at: [-0.055, 0.69, 0.135], x: [1, 0, 0], thickness: 0.012, color: STEEL, bone: pelvis });
  box(0.04, 0.02, 0.018, LEATHER, pelvis, [-0.055, 0.69, 0.138]);
  cyl(0.016, 0.014, 0.075, ORANGE_FLAT, pelvis, [0.055, 0.655, 0.14]);
  b.rod([0.055, 0.618, 0.14], [0.055, 0.5, 0.14], 0.005, STEEL, { bone: pelvis });
  box(0.034, 0.02, 0.018, LEATHER, pelvis, [0.055, 0.69, 0.14]);

  // waist accordion
  for (let i = 0; i < 5; i++) cyl(i % 2 ? 0.105 : 0.118, i % 2 ? 0.105 : 0.118, 0.024, i % 2 ? DARK : STEEL, spine, [0, 0.715 + 0.024 * i, 0], [0, 1, 0], 8);

  // =========================================================== LEGS
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const pts = limb(V(s * 0.14, 0.62, 0), V(s * 0.15, 0.15, 0.02), [0.25, 0.25], [[0, 0, 1]]);
    const leg = b.chain(`leg${L}`, pts, {
      parent: pelvis,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`],
      role: "leg",
      contact: [s * 0.15, 0, 0.04],
    });
    const [hipJ, kneeJ, ankleJ] = leg.joints;
    const [hp, kp, ap] = pts;
    const PZ = 0.095;

    cyl(0.078, 0.078, 0.13, DARK, pelvis, hp, [1, 0, 0]);
    bolt(pelvis, offset(hp, [1, 0, 0], s * 0.075), [s, 0, 0], 0.024);
    // thigh
    b.rod(lerp(hp, kp, 0.06), lerp(hp, kp, 0.95), [0.07, 0.058], SHELL_P, { bone: hipJ });
    b.rod(lerp(hp, kp, 0.12), lerp(hp, kp, 0.42), 0.078, ORANGE, { bone: hipJ, caps: "flat" });
    b.rod(lerp(hp, kp, 0.72), lerp(hp, kp, 0.8), 0.07, HAZARD, { bone: hipJ, caps: "flat" });
    // hydraulic piston with spring
    b.rod(offset(hp, [0, 0, 1], PZ - 0.005), offset(lerp(hp, kp, 0.75), [0, 0, 1], PZ - 0.012), 0.012, STEEL, { bone: hipJ });
    b.rod(offset(kp, [0, 0, 1], PZ - 0.01), offset(lerp(kp, hp, 0.45), [0, 0, 1], PZ - 0.003), 0.022, DARK, { bone: kneeJ });
    b.sweep(coil(offset(lerp(hp, kp, 0.22), [0, 0, 1], PZ), offset(lerp(hp, kp, 0.66), [0, 0, 1], PZ - 0.008), 0.034, 7), 0.0045, {
      bone: hipJ,
      color: BLUED,
      sides: 4,
    });
    // knee
    cyl(0.064, 0.064, 0.16, DARK, kneeJ, kp, [1, 0, 0]);
    for (const e of [1, -1]) bolt(kneeJ, offset(kp, [1, 0, 0], e * 0.082), [e, 0, 0], 0.022);
    box(0.1, 0.08, 0.045, ORANGE, kneeJ, offset(kp, [0, 0, 1], 0.07), { rotation: [-10, 0, 0] });
    // shin
    const shinW = (t: number) => 0.11 + 0.04 * ((t - 0.1) / 0.8);
    b.frustumBox(lerp(kp, ap, 0.1), lerp(kp, ap, 0.9), [0.11, 0.115], [0.15, 0.12], { bone: kneeJ, color: SHELL_P });
    const guard = b.frustumBox(
      offset(lerp(kp, ap, 0.18), [0, 0, 1], 0.058),
      offset(lerp(kp, ap, 0.68), [0, 0, 1], 0.058),
      [shinW(0.18) - 0.02, 0.025],
      [shinW(0.68) - 0.02, 0.025],
      { bone: kneeJ, color: ORANGE },
    );
    b.frustumBox(lerp(kp, ap, 0.74), lerp(kp, ap, 0.84), [shinW(0.74) + 0.012, 0.13], [shinW(0.84) + 0.012, 0.132], { bone: kneeJ, color: HAZARD });
    b.decal(guard, WARN_TEX, { at: offset(lerp(kp, ap, 0.42), [0, 0, 1], 0.07), dir: [0, 0, 1], size: [0.05, 0.045] });
    // ankle + foot
    cyl(0.056, 0.056, 0.17, DARK, ankleJ, ap, [1, 0, 0]);
    for (const e of [1, -1]) bolt(ankleJ, offset(ap, [1, 0, 0], e * 0.088), [e, 0, 0], 0.02);
    const fx = s * 0.15;
    box(0.18, 0.02, 0.27, RUBBER, ankleJ, [fx, 0.01, 0.035]);
    box(0.165, 0.055, 0.22, SHELL_P, ankleJ, [fx, 0.0475, 0.03]);
    box(0.15, 0.03, 0.12, ORANGE, ankleJ, [fx, 0.09, 0.0]);
    box(0.17, 0.045, 0.07, DARK, ankleJ, [fx, 0.04, 0.17]);
    for (const e of [1, -1]) {
      box(0.05, 0.02, 0.05, HAZARD, ankleJ, [fx + e * 0.05, 0.075, 0.1]);
      bolt(ankleJ, [fx + e * 0.06, 0.08, -0.05], [0, 1, 0], 0.012);
    }
  }

  // =========================================================== CHEST
  const chestBody = b.frustumBox([0, 0.82, 0], [0, 1.14, 0], [0.36, 0.26], [0.5, 0.31], { bone: chest, color: SHELL_P });
  box(0.365, 0.025, 0.265, HAZARD, chest, [0, 0.832, 0]);
  box(0.5, 0.03, 0.31, DARK, chest, [0, 1.145, 0]);
  box(0.38, 0.07, 0.012, ORANGE, chest, [0, 1.1, 0.155]);
  for (const s of [1, -1]) bolt(chest, [s * 0.17, 1.1, 0.163], [0, 0, 1], 0.012);

  glow(b.decal(chestBody, PANEL_TEX, { at: [-0.05, 0.97, 0.15], dir: [0, 0, 1], size: [0.2, 0.14] }), 0.85);
  b.decal(chestBody, GAUGE_TEX, { at: [0.125, 1.0, 0.15], dir: [0, 0, 1], size: [0.085, 0.085] });
  b.decal(chestBody, STENCIL_TEX, { at: [-0.05, 0.885, 0.15], dir: [0, 0, 1], size: [0.16, 0.052] });
  b.decal(chestBody, GRILLE_TEX, { at: [0.125, 0.9, 0.15], dir: [0, 0, 1], size: [0.1, 0.05] });

  // neck
  for (let i = 0; i < 3; i++) cyl(i % 2 ? 0.062 : 0.07, i % 2 ? 0.062 : 0.07, 0.02, i % 2 ? DARK : STEEL, neck, [0, 1.15 + 0.02 * i, 0], [0, 1, 0], 8);
  // neck cables
  const cableCols = ["#c23b2a", "#2d6fb3", "#e0b020"];
  cableCols.forEach((c, i) => {
    const x = -0.03 + i * 0.03;
    b.sweep(catmull([[x, 1.14, -0.075], [x + 0.01, 1.165, -0.105], [x, 1.2, -0.09]]), 0.007, { bone: neck, color: c, sides: 5 });
  });

  // shoulders: housings, pauldrons, emblems
  for (const s of [1, -1]) {
    cyl(0.085, 0.085, 0.11, DARK, chest, [s * 0.27, 1.03, 0], [1, 0, 0]);
    const paul = b.lathe(
      [[0, 0], [0.095, 0], [0.1, 0.02], [0.085, 0.05], [0.05, 0.075], [0, 0.085]],
      { at: [s * 0.335, 1.03, 0], axis: [s, 0, 0], segments: 10, bone: chest, color: ORANGE },
    );
    cyl(0.103, 0.103, 0.02, HAZARD, chest, [s * 0.34, 1.03, 0], [1, 0, 0]);
    b.decal(paul, EMBLEM_TEX, { at: [s * 0.412, 1.04, 0], dir: [s, 0, 0], size: [0.07, 0.07] });
  }

  // left shoulder floodlight
  const lampDir = V(0, 0.25, 1).normalize();
  cyl(0.045, 0.05, 0.025, DARK, chest, [0.15, 1.16, 0.09]);
  cyl(0.042, 0.03, 0.07, STEEL, chest, [0.15, 1.205, 0.11], lampDir);
  glow(
    b.part(new THREE.CircleGeometry(0.036, 12), LAMP, {
      bone: chest,
      at: V(0.15, 1.205, 0.11).addScaledVector(lampDir, 0.037),
      dir: lampDir,
      axis: "z",
    }),
    1.8,
  );
  // right shoulder fuse rack
  [AMBER, RED, GREEN].forEach((c, i) => {
    cyl(0.009, 0.009, 0.05, "#2a2a2e", chest, [-0.12 - i * 0.03, 1.17, 0.09], [0, 1, 0], 6);
    glow(cyl(0.006, 0.006, 0.042, c, chest, [-0.12 - i * 0.03, 1.17, 0.09], [0, 1, 0], 6), 1.2);
  });

  // =========================================================== HEAD
  const dome = b.lathe(
    [[0, 0], [0.11, 0], [0.13, 0.015], [0.135, 0.08], [0.12, 0.135], [0.08, 0.172], [0, 0.185]],
    { at: [0, 1.2, 0], axis: [0, 1, 0], segments: 10, bone: head, color: SHELL_P },
  );
  cyl(0.137, 0.137, 0.02, HAZARD, head, [0, 1.218, 0], [0, 1, 0], 10);
  box(0.23, 0.115, 0.09, DARK, head, [0, 1.295, 0.095]);
  for (const s of [1, -1]) box(0.02, 0.12, 0.09, ORANGE, head, [s * 0.12, 1.295, 0.09]);

  // photoreceptor
  b.lathe([[0.038, 0], [0.062, 0], [0.062, 0.022], [0.052, 0.034], [0.038, 0.028]], {
    at: [-0.03, 1.297, 0.138], axis: [0, 0, 1], segments: 10, bone: head, color: STEEL,
  });
  glow(b.part(new THREE.CircleGeometry(0.04, 16), "#ffffff", { bone: head, at: [-0.03, 1.297, 0.1475], dir: [0, 0, 1], axis: "z", texture: EYE_TEX }), 1.4);
  // secondary sensor
  b.lathe([[0.02, 0], [0.036, 0], [0.036, 0.016], [0.03, 0.024], [0.02, 0.02]], {
    at: [0.075, 1.31, 0.138], axis: [0, 0, 1], segments: 8, bone: head, color: BRASS,
  });
  glow(b.part(new THREE.CircleGeometry(0.023, 12), "#ffffff", { bone: head, at: [0.075, 1.31, 0.1455], dir: [0, 0, 1], axis: "z", texture: SENSOR_TEX }), 1.2);
  [RED, AMBER, GREEN].forEach((c, i) => glow(box(0.014, 0.009, 0.006, c, head, [0.05 + i * 0.026, 1.262, 0.1425]), 1.4));

  // brow hood on its hinge
  b.extrude(BROW, { at: [-0.03, 1.352, 0.16], x: [1, 0, 0], thickness: 0.022, color: ORANGE, bone: lid, smoothing: 1 });

  // chin vocoder on the jaw
  box(0.15, 0.036, 0.07, DARK, jaw, [0, 1.228, 0.115]);
  b.part(new THREE.PlaneGeometry(0.12, 0.024), "#ffffff", { bone: jaw, at: [0, 1.228, 0.1505], dir: [0, 0, 1], axis: "z", texture: GRILLE_TEX });

  // ears
  for (const s of [1, -1]) {
    cyl(0.05, 0.05, 0.05, DARK, head, [s * 0.145, 1.285, 0], [1, 0, 0]);
    cyl(0.056, 0.056, 0.012, ORANGE, head, [s * 0.128, 1.285, 0], [1, 0, 0]);
    b.part(new THREE.CircleGeometry(0.036, 12), "#ffffff", { bone: head, at: [s * 0.1715, 1.285, 0], dir: [s, 0, 0], axis: "z", texture: SPEAKER_TEX });
  }
  // rear vent
  b.part(new THREE.PlaneGeometry(0.1, 0.05), "#ffffff", { bone: head, at: [0, 1.27, -0.129], dir: [0, 0, -1], axis: "z", texture: GRILLE_TEX });

  // beacon, whip antenna, comm dish
  cyl(0.052, 0.058, 0.02, DARK, head, [0, 1.38, 0], [0, 1, 0], 10);
  glow(
    b.lathe([[0, 0], [0.045, 0], [0.045, 0.014], [0.034, 0.04], [0, 0.052]], {
      at: [0, 1.39, 0], axis: [0, 1, 0], segments: 8, bone: head, color: AMBER,
    }),
    1.6,
  );
  b.rod([0.075, 1.36, -0.04], [0.082, 1.5, -0.045], [0.006, 0.003], STEEL, { bone: head });
  glow(ball(0.014, RED, head, [0.082, 1.512, -0.045]), 1.6);
  b.rod([-0.07, 1.36, -0.03], [-0.072, 1.4, -0.035], 0.007, DARK, { bone: head });
  b.lathe([[0, 0], [0.04, 0.032], [0.04, 0.037], [0, 0.009]], {
    at: [-0.073, 1.4, -0.035], axis: V3n(0.3, 1, 0.4), segments: 8, bone: head, color: STEEL,
  });
  void dome;

  // =========================================================== ARMS
  const rArm = {} as { P0: THREE.Vector3; P1: THREE.Vector3; shJ: Joint; elJ: Joint; rear: THREE.Vector3 };

  const hand = (s: number, L: string, wrJ: Joint, elbowP: THREE.Vector3, wristP: THREE.Vector3) => {
    const d = wristP.clone().sub(elbowP).normalize();
    const out = V(s, 0, 0);
    out.addScaledVector(d, -out.dot(d)).normalize();
    const fwd = V(0, 0, 1);
    fwd.addScaledVector(d, -fwd.dot(d));
    fwd.addScaledVector(out, -fwd.dot(out));
    fwd.normalize();
    const palmC = wristP.clone().addScaledVector(d, 0.05);
    const palmEnd = wristP.clone().addScaledVector(d, 0.092);
    b.part(new THREE.BoxGeometry(0.09, 0.09, 0.056), DARK, { bone: wrJ, at: palmC, dir: d, up: fwd, flat: true });
    b.part(new THREE.BoxGeometry(0.076, 0.07, 0.012), ORANGE, { bone: wrJ, at: palmC.clone().addScaledVector(fwd, -0.033), dir: d, up: fwd, flat: true });
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.1, 6), STEEL, { bone: wrJ, at: palmEnd, dir: out, flat: true });
    const digit = (name: string, base: THREE.Vector3, dir: THREE.Vector3, curl: THREE.Vector3, l1: number, l2: number, r: number) => {
      const p2 = base.clone().addScaledVector(dir, l1);
      const d2 = dir.clone().addScaledVector(curl, 0.6).normalize();
      const p3 = p2.clone().addScaledVector(d2, l2);
      const ch = b.chain(name, [base, p2, p3], { parent: wrJ, names: [`${name}1`, `${name}2`, `${name}3`], role: "digit" });
      b.rod(base, p2, r, DARK, { bone: ch.joints[0] });
      b.rod(p2, p3, r * 0.88, STEEL, { bone: ch.joints[1] });
      b.part(new THREE.BoxGeometry(r * 2.2, r * 1.6, r * 2.0), RUBBER, { bone: ch.joints[2], at: p3, dir: d2, flat: true });
    };
    digit(`index${L}`, palmEnd.clone().addScaledVector(out, 0.026), d.clone().addScaledVector(out, 0.1).normalize(), fwd, 0.055, 0.046, 0.013);
    digit(`middle${L}`, palmEnd.clone().addScaledVector(out, -0.026), d.clone().addScaledVector(out, -0.1).normalize(), fwd, 0.055, 0.046, 0.013);
    const thumbBase = palmC.clone().addScaledVector(fwd, 0.034).addScaledVector(d, 0.015);
    digit(`thumb${L}`, thumbBase, d.clone().multiplyScalar(0.55).addScaledVector(fwd, 0.75).normalize(), fwd.clone().multiplyScalar(-1), 0.045, 0.04, 0.013);
    return { d, out, fwd };
  };

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const ap = limb(V(s * 0.3, 1.02, 0), V(s * 0.5, 0.58, 0.06), [0.25, 0.24], [[0, 0, -1]]);
    const arm = b.chain(`arm${L}`, ap, {
      parent: chest,
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`],
      role: "arm",
    });
    const [shJ, elJ, wrJ] = arm.joints;
    const [P0, P1, P2] = ap;

    ball(0.072, DARK, shJ, P0);
    b.rod(lerp(P0, P1, 0.08), lerp(P0, P1, 0.94), [0.058, 0.05], SHELL_P, { bone: shJ });
    b.rod(lerp(P0, P1, 0.3), lerp(P0, P1, 0.62), 0.064, ORANGE, { bone: shJ, caps: "flat" });
    b.rod(lerp(P0, P1, 0.72), lerp(P0, P1, 0.8), 0.058, HAZARD, { bone: shJ, caps: "flat" });
    // elbow
    ball(0.058, DARK, elJ, P1);
    cyl(0.046, 0.046, 0.13, STEEL, elJ, P1, [1, 0, 0]);
    for (const e of [1, -1]) bolt(elJ, offset(P1, [1, 0, 0], e * 0.068), [e, 0, 0], 0.018);
    // forearm
    const fa = b.rod(lerp(P1, P2, 0.07), lerp(P1, P2, 0.97), [0.047, 0.058], SHELL_P, { bone: elJ });
    b.rod(lerp(P1, P2, 0.62), lerp(P1, P2, 0.78), 0.066, ORANGE, { bone: elJ, caps: "flat" });
    b.rod(lerp(P1, P2, 0.88), lerp(P1, P2, 0.97), 0.064, DARK, { bone: elJ, caps: "flat" });
    ball(0.05, DARK, wrJ, P2);

    const { d, out } = hand(s, L, wrJ, P1, P2);

    if (s > 0) {
      // pressure gauge on the left forearm
      const hit = b.surface(fa).around(lerp(P1, P2, 0.4)).at(90, 5);
      if (hit) {
        b.stick(new THREE.CylinderGeometry(0.036, 0.04, 0.016, 10), BRASS, hit, { embed: 0.35 });
        b.part(new THREE.CircleGeometry(0.031, 16), "#ffffff", {
          bone: elJ,
          at: hit.at.clone().addScaledVector(hit.n, 0.012),
          dir: hit.n,
          axis: "z",
          texture: GAUGE_TEX,
        });
      }
      // little amber work lamp on the inner forearm
      glow(ball(0.014, AMBER, elJ, lerp(P1, P2, 0.2).addScaledVector(out, -0.055)), 1.4);
    } else {
      // forearm welding torch
      const o = out.clone().multiplyScalar(0.082);
      const rear = P1.clone().addScaledVector(d, 0.1).add(o);
      const front = P2.clone().addScaledVector(d, 0.1).add(o);
      b.rod(rear, front, 0.021, STEEL, { bone: elJ, caps: "flat" });
      for (const t of [0.25, 0.7]) {
        const pos = lerp(P1, P2, t);
        cyl(0.068, 0.068, 0.022, DARK, elJ, pos, d);
        b.rod(pos.clone().addScaledVector(out, 0.05), pos.clone().add(o), 0.01, DARK, { bone: elJ });
      }
      const tip1 = front.clone().addScaledVector(d, 0.06);
      b.rod(front, tip1, [0.027, 0.011], BRASS, { bone: elJ, caps: "flat" });
      glow(b.spike(tip1, d, 0.075, 0.013, { color: "#9fefff", bone: elJ }), 1.6);
      ball(0.027, RED, elJ, rear);
      cyl(0.03, 0.03, 0.008, "#d8c25a", elJ, rear.clone().addScaledVector(out, 0.025), out, 8);
      box(0.02, 0.035, 0.02, DARK, elJ, rear.clone().addScaledVector(d, 0.07).addScaledVector(out, 0.03));
      rArm.P0 = P0;
      rArm.P1 = P1;
      rArm.shJ = shJ;
      rArm.elJ = elJ;
      rArm.rear = rear.clone().addScaledVector(d, -0.02);
    }
  }

  // =========================================================== BACKPACK, BOTTLES, HOSES
  const pack = box(0.36, 0.34, 0.15, SHELL_P, chest, [0, 0.98, -0.22]);
  box(0.38, 0.03, 0.17, DARK, chest, [0, 1.165, -0.22]);
  box(0.365, 0.03, 0.155, HAZARD, chest, [0, 0.825, -0.22]);
  for (const s of [1, -1]) {
    cyl(0.034, 0.04, 0.09, DARK, chest, [s * 0.1, 1.21, -0.24], [0, 1, 0], 8);
    cyl(0.04, 0.04, 0.012, STEEL, chest, [s * 0.1, 1.256, -0.24], [0, 1, 0], 8);
  }
  b.decal(pack, FAN_TEX, { at: [0, 1.03, -0.3], dir: [0, 0, -1], size: [0.19, 0.19] });
  b.decal(pack, WARN_TEX, { at: [-0.1, 0.89, -0.3], dir: [0, 0, -1], size: [0.065, 0.058] });
  [RED, AMBER, GREEN].forEach((c, i) => glow(box(0.02, 0.012, 0.006, c, chest, [0.07 + i * 0.035, 0.885, -0.2985]), 1.3));
  // pipe strapped across the lower back, with a coil spring cable
  b.rod([0.16, 0.845, -0.312], [-0.16, 0.845, -0.312], 0.012, STEEL, { bone: chest, caps: "flat" });
  b.sweep(coil([-0.14, 0.94, -0.312], [0.14, 0.94, -0.312], 0.018, 8), 0.004, { bone: chest, color: BLUED, sides: 4 });
  for (const x of [-0.14, 0.14]) box(0.03, 0.04, 0.01, LEATHER, chest, [x, 0.845, -0.31]);
  // scattered rivets
  for (const h of b.surface(pack).scatter(16, { rng: rng(5), minDist: 0.06, filter: (hh) => hh.n.z < -0.7 }))
    b.stick(new THREE.CylinderGeometry(0.01, 0.01, 0.008, 6), BRASS, h, { embed: 0.3 });

  // gas bottles
  for (const s of [1, -1]) {
    const col = s > 0 ? BOTTLE_BLUE : BOTTLE_RED;
    const x = s * 0.235;
    cyl(0.052, 0.052, 0.34, col, chest, [x, 0.93, -0.22], [0, 1, 0], 10);
    b.lathe([[0, 0], [0.052, 0], [0.048, 0.02], [0.026, 0.036], [0, 0.04]], {
      at: [x, 1.1, -0.22], axis: [0, 1, 0], segments: 10, bone: chest, color: col,
    });
    cyl(0.014, 0.016, 0.04, BRASS, chest, [x, 1.158, -0.22], [0, 1, 0], 6);
    cyl(0.03, 0.03, 0.008, "#d8c25a", chest, [x, 1.182, -0.22], [0, 1, 0], 8);
    for (const y of [0.86, 1.0]) cyl(0.057, 0.057, 0.022, DARK, chest, [x, y, -0.22], [0, 1, 0], 10);
    cyl(0.058, 0.058, 0.02, DARK, chest, [x, 0.77, -0.22], [0, 1, 0], 10);
  }

  // hoses to the torch
  const back = V(-0.4, 0, -1).normalize();
  const route = [
    V(-0.3, 1.19, -0.14),
    V(-0.38, 1.08, -0.09),
    lerp(rArm.P0, rArm.P1, 0.55).addScaledVector(back, 0.075),
    rArm.P1.clone().addScaledVector(back, 0.07),
    rArm.rear,
  ];
  const hoseBones = [chest, rArm.shJ, rArm.elJ];
  const redHose = catmull([V(-0.235, 1.16, -0.22), V(-0.262, 1.225, -0.2), ...route]);
  b.sweep(redHose, 0.011, { bone: hoseBones, color: RED, sides: 6 });
  const lift = V(0, 0.016, -0.01);
  const blueHose = catmull([
    V(0.235, 1.16, -0.22), V(0.2, 1.275, -0.25), V(0.0, 1.295, -0.26), V(-0.18, 1.265, -0.22),
    ...route.map((p) => p.clone().add(lift)),
  ]);
  b.sweep(blueHose, 0.011, { bone: hoseBones, color: BLUE_HOSE, sides: 6 });
  for (const t of [0.12, 0.24]) {
    b.part(new THREE.CylinderGeometry(0.0165, 0.0165, 0.012, 6), BRASS, {
      frame: frame(redHose.at(t), redHose.tangentAt(t)),
      bone: chest,
      flat: true,
    });
  }
  for (const t of [0.12, 0.3]) {
    b.part(new THREE.CylinderGeometry(0.0165, 0.0165, 0.012, 6), BRASS, {
      frame: frame(blueHose.at(t), blueHose.tangentAt(t)),
      bone: chest,
      flat: true,
    });
  }

  return b.root;
}

function V3n(x: number, y: number, z: number): THREE.Vector3 {
  return new THREE.Vector3(x, y, z).normalize();
}
