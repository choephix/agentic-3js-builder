import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  bezier,
  polyline,
  limb,
  countershade,
  mottle,
  grain,
  paint,
  mix,
  smoothstep,
  svg,
} from "../../../../src/index";
import type { Joint, ColorInput } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dwarf Blacksmith",
  description:
    "A stout Warcraft-style dwarf smith with braided orange beard, horned steel cap and goggles, spiked pauldrons, leather apron, hammer raised over a glowing sword blank held in tongs on an anvil and oak stump.",
};

type Col = ColorInput;

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const toV = (p: any): THREE.Vector3 => (Array.isArray(p) ? V(p[0], p[1], p[2]) : V(p.x, p.y, p.z));
const sd = (s: number) => (s > 0 ? "L" : "R");

/** Piecewise-linear profile through [t, value] keys. */
const lin = (ks: number[][]) => (t: number) => {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    if (t <= ks[i][0]) {
      const [t0, v0] = ks[i - 1];
      const [t1, v1] = ks[i];
      return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
    }
  }
  return ks[ks.length - 1][1];
};

// ---------------------------------------------------------------------------------------------------------
// Geometry shorthands
const sph = (w = 8, h = 6) => new THREE.SphereGeometry(1, w, h);
const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
const cyl = (r0: number, r1: number, h: number, seg = 8) => new THREE.CylinderGeometry(r0, r1, h, seg);
const cone = (r: number, h: number, seg = 6) => new THREE.ConeGeometry(r, h, seg);
const tor = (R: number, r: number, tub = 5, seg = 10) => new THREE.TorusGeometry(R, r, tub, seg);
const dome = () => new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2);

// ---------------------------------------------------------------------------------------------------------
// Paints (module level so parts continue one pattern)
const SKIN = countershade(mottle("#e2a37c", "#d58f69", { size: 0.05, seed: 2 }), "#b6694d", { level: -0.15, soft: 0.5 });
const NOSE = countershade(mottle("#e68a6a", "#d6755b", { size: 0.03, seed: 8 }), "#a9533f", { level: -0.1, soft: 0.5 });
const CLOTH = countershade(mottle("#2c4c94", "#25427f", { size: 0.025, seed: 5, contrast: 0.8 }), "#16264d", {
  level: -0.1,
  soft: 0.5,
});
const TROUSER = countershade(mottle("#5e4b3b", "#4f3f32", { size: 0.03, seed: 6 }), "#2e231b", { level: -0.1, soft: 0.5 });
const LEATHER = countershade(grain("#82532b", "#6b4220", { size: 0.015, axis: "x", seed: 3 }), "#3c2212", {
  level: -0.1,
  soft: 0.5,
});
const LEATHER_DARK = countershade(grain("#4d2e19", "#3a2112", { size: 0.014, axis: "x", seed: 4 }), "#1f120a", {
  level: -0.1,
  soft: 0.5,
});
const APRON = paint((p, n) => {
  const soot = smoothstep(0.85, 0.55, p.y) * 0.45 + smoothstep(0.3, 1, n.y) * 0.0;
  return soot > 0.04 ? mix("#6a4120", "#1a110c", soot) : LEATHER;
});
const BOOT = paint((p) => (p.y < 0.045 ? mix("#4a3322", "#2a1d12", 0.7) : LEATHER_DARK));
const FLEECE = countershade(mottle("#efe3c8", "#d4c19b", { size: 0.02, seed: 9 }), "#a89672", { level: 0, soft: 0.5 });
const HAIR = countershade(grain("#d2601f", "#f09a3c", { size: 0.01, axis: "y", seed: 7 }), "#8e3412", {
  level: -0.35,
  soft: 0.6,
});
const BONE = countershade(mottle("#f4ead2", "#e0d2b0", { size: 0.02, seed: 11 }), "#b7a57f", { level: -0.1, soft: 0.5 });
const WOOD = countershade(grain("#9c6a38", "#6c4322", { size: 0.012, axis: "y", seed: 12 }), "#3f2612", {
  level: -0.2,
  soft: 0.5,
});
const BARK = countershade(
  mottle(grain("#5e4429", "#3d2b18", { size: 0.02, axis: "y", seed: 13 }), "#4a3620", { size: 0.06, seed: 14 }),
  "#241a0e",
  { level: -0.2, soft: 0.5 },
);
const BEDROLL = countershade(mottle("#b79a62", "#9e8250", { size: 0.03, seed: 15 }), "#6c5a36", { level: -0.1, soft: 0.5 });

const STEEL = metal("steel", { tarnish: 0.2, polish: 0.4 });
const PLATE = panelled(metal("steel", { tarnish: 0.18, polish: 0.35 }), { size: 0.07, aspect: 0.8, rivets: 0.025 });
const GOLD = metal("gilt");
const BRASS = metal("brass", { tarnish: 0.3 });
const BRONZE = metal("bronze", { verdigris: 0.2 });
const IRONM = metal("iron", { polish: 0.35 });
const HAMMERM = metal("steel", { tarnish: 0.35, polish: 0.2, seed: 21 });

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "dwarfBlacksmith" });

  // ------------------------------------------------------------------------------------------------------
  // Textures
  const EYE = svg(
    `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
      <clipPath id="c"><path d="M7 24 Q32 5 57 22 Q34 36 7 24Z"/></clipPath>
      <path d="M3 24 Q32 -2 61 22 Q34 40 3 24Z" fill="#2a1612"/>
      <path d="M7 24 Q32 5 57 22 Q34 36 7 24Z" fill="#f4ecdc"/>
      <g clip-path="url(#c)">
        <circle cx="32" cy="22" r="13" fill="#2d78c9"/>
        <circle cx="32" cy="22" r="10" fill="none" stroke="#6bc1f5" stroke-width="2" opacity=".75"/>
        <circle cx="32" cy="22" r="13" fill="none" stroke="#12315c" stroke-width="2.5"/>
        <circle cx="32" cy="22" r="5" fill="#0a0a12"/>
        <rect x="0" y="0" width="64" height="15" fill="#3a1d16" opacity=".55"/>
      </g>
      <circle cx="27" cy="18" r="3" fill="#ffffff"/><circle cx="37" cy="26" r="1.4" fill="#ffffff"/>
      <path d="M3 24 Q32 -2 61 22" fill="none" stroke="#1b0d0a" stroke-width="5" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  const TUFT = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#8a3510"/><stop offset=".5" stop-color="#d9651f"/><stop offset="1" stop-color="#ffb04a"/>
      </linearGradient></defs>
      <path d="M4 64 Q2 36 12 18 Q16 8 18 0 Q22 12 26 26 Q32 44 28 64Z" fill="url(#g)"/>
      <path d="M12 64 Q12 38 17 14 M21 64 Q22 40 19 18" stroke="#7a2c0c" stroke-width="1.5" fill="none" opacity=".6"/>
      <path d="M16 60 Q15 36 18 8" stroke="#ffd88a" stroke-width="1.4" fill="none" opacity=".8"/>
    </svg>`,
    { size: 128 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6 H58 V34 Q58 54 32 62 Q6 54 6 34Z" fill="#14264f" stroke="#e8b84a" stroke-width="4" stroke-linejoin="round"/>
      <g transform="rotate(32 32 26)"><rect x="30" y="6" width="4.5" height="36" fill="#c99a52"/>
        <rect x="21" y="5" width="22" height="9" rx="1.5" fill="#c9d3e6" stroke="#2a3558" stroke-width="1.5"/></g>
      <path d="M13 36 H45 Q51 36 55 32 Q53 42 45 43 H41 V47 H45 V52 H21 V47 H25 V43 H20 Q13 42 13 36Z" fill="#f0c455" stroke="#7a5418" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M17 38 H44" stroke="#fff1b0" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  const RUNE = svg(
    `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="62" height="38" rx="4" fill="#2a1710" stroke="#ffb347" stroke-width="2"/>
      <g stroke="#ffb347" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <path d="M11 9 V31 M11 9 L19 16 L11 23"/>
        <path d="M25 31 L31 9 L37 31 M27 22 H35"/>
        <path d="M43 9 H51 L43 20 H52 L44 31"/>
        <path d="M57 9 V31"/>
      </g>
    </svg>`,
    { size: 256 },
  );
  const HRUNE = svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="30" height="30" rx="3" fill="#24150e" stroke="#ff9a3a" stroke-width="2"/>
      <path d="M8 6 V26 M8 6 L24 16 L8 26 M16 11 V21" stroke="#ffb347" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    { size: 128 },
  );
  const RINGS = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="31" fill="#cfa56d"/>
      <g fill="none" stroke="#8c6034" stroke-width="1.6">
        <circle cx="33" cy="31" r="6"/><circle cx="33" cy="31" r="12"/><circle cx="32" cy="32" r="18"/><circle cx="32" cy="32" r="24"/>
        <circle cx="32" cy="32" r="29.5" stroke="#4a3620" stroke-width="3"/>
      </g>
      <path d="M33 31 L52 24 M33 31 L12 40 M33 31 L36 8" stroke="#6b4725" stroke-width="1.4"/>
    </svg>`,
    { size: 256 },
  );

  // ------------------------------------------------------------------------------------------------------
  // Skeleton
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, 0.55, 0] });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.55, 0],
      [0, 0.77, 0.02],
      [0, 1.0, 0.04],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.0, 0.04], aim: [0, 1.1, 0.07], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.1, 0.07], dir: [0, 0.25, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.12, 0.09], aim: [0, 1.1, 0.22], role: "jaw" });

  const ball = (bone: Joint, color: Col, at: THREE.Vector3 | number[], sc: number[], extra: Record<string, unknown> = {}) =>
    b.part(sph(), color, { bone, at, scale: sc, flat: true, ...extra } as any);

  // ------------------------------------------------------------------------------------------------------
  // Torso
  const torsoRx = lin([[0, 0.2], [0.35, 0.235], [0.65, 0.25], [0.9, 0.27], [1, 0.23]]);
  const torsoRy = lin([[0, 0.17], [0.35, 0.225], [0.65, 0.215], [0.9, 0.19], [1, 0.16]]);
  const torso = b.sweep(spine, (t: number) => [torsoRx(t), torsoRy(t)], {
    color: CLOTH,
    caps: "flat",
    sides: 10,
    smooth: false,
  } as any);
  const tsurf = b.surface(torso);

  ball(hips, TROUSER, [0, 0.5, 0], [0.2, 0.14, 0.17]);
  ball(chest, CLOTH, [0, 1.0, 0.02], [0.25, 0.075, 0.17]); // trapezius yoke
  b.part(tor(0.1, 0.03, 6, 10), LEATHER_DARK, { bone: chest, at: [0, 1.0, 0.04], dir: [0, 1, 0], axis: "z" });
  b.rod([0, 0.98, 0.03], [0, 1.1, 0.07], 0.075, { bone: neck, color: SKIN, sides: 8 });

  // Leather apron hugging the torso: membranes between front arcs of horizontal loops
  const aprons: any[] = [];
  const rows: number[][] = [[0.97, 0.09], [0.9, 0.1], [0.8, 0.125], [0.7, 0.14], [0.6, 0.15]];
  const arcs = rows.map(([y, w]) => {
    const lp = tsurf.loop([0, y, 0.02], { lift: 0.012 });
    return lp.slice(1 - w, 1).concat(lp.slice(0, w));
  });
  for (let i = 0; i < arcs.length - 1; i++) {
    aprons.push(b.membrane(arcs[i], arcs[i + 1], { color: APRON, thickness: 0.012, rows: 2 }));
  }
  for (const a of arcs) b.sweep(a, 0.005, { color: "#2c1a0e", sides: 5, smooth: false } as any);
  b.decal(aprons, EMBLEM, { at: [0, 0.68, 0.25], dir: [0, 0, 1], size: [0.13, 0.13] });

  // Belt
  b.sweep(tsurf.loop([0, 0.575, 0.0], { lift: 0.022 }), 0.026, { color: LEATHER_DARK, sides: 6 });
  const bh = tsurf.around([0, 0.575, 0]).at(0, 0)!;
  b.stick(box(0.12, 0.014, 0.12), GOLD, bh.moved([0, 0.04, 0]), { embed: 0.1, flow: [0, 1, 0] });
  b.stick(box(0.09, 0.02, 0.09), "#ffffff", bh.moved([0, 0.05, 0]), { embed: 0.0, flow: [0, 1, 0], texture: EMBLEM } as any);
  for (const s of [1, -1]) {
    // pouches on the belt
    const ph = tsurf.around([0, 0.575, 0]).at(s * 72, 0)!;
    b.stick(box(0.1, 0.07, 0.1), LEATHER, ph.moved([0, 0.03, 0]), { embed: 0.2, flow: [0, -1, 0] });
    b.stick(box(0.105, 0.02, 0.05), LEATHER_DARK, ph.moved([0, 0.065, 0.02]), { embed: 0.2, flow: [0, -1, 0] });
    b.stick(sph(6, 4), GOLD, ph.moved([0, 0.09, 0.0]), { embed: 0.4, scale: 0.012 } as any);
    // shoulder straps draped over the torso
    const strap = tsurf.drape(
      catmull([
        [s * 0.07, 0.97, 0.18],
        [s * 0.13, 1.0, 0.0],
        [s * 0.1, 0.92, -0.17],
        [s * 0.08, 0.75, -0.19],
      ]),
      { lift: 0.012 },
    );
    b.sweep(strap, () => [0.03, 0.01], { color: LEATHER_DARK, section: "box" } as any);
  }
  // Front and back skirt flaps
  const flap: any[] = [
    [-0.17, 0],
    [0.17, 0],
    [0.19, -0.21],
    [0.12, -0.17],
    [0.06, -0.22],
    [0, -0.17],
    [-0.06, -0.22],
    [-0.12, -0.17],
    [-0.19, -0.21],
  ];
  b.extrude(flap, { at: [0, 0.575, 0.2], x: [1, 0, 0], y: [0, 1, -0.2], thickness: 0.014, bevel: 0.003, color: APRON, bone: hips });
  b.extrude(flap, { at: [0, 0.575, -0.18], x: [1, 0, 0], y: [0, 1, 0.2], thickness: 0.014, bevel: 0.003, color: LEATHER, bone: hips });

  // Bedroll on the back
  b.part(cyl(0.075, 0.075, 0.44, 10), BEDROLL, { bone: chest, at: [0, 0.8, -0.2], dir: [1, 0, 0], flat: true });
  for (const x of [-0.13, 0.13]) {
    b.part(tor(0.078, 0.011, 5, 10), LEATHER_DARK, { bone: chest, at: [x, 0.8, -0.2], dir: [1, 0, 0], axis: "z" });
    b.part(box(0.03, 0.02, 0.03), GOLD, { bone: chest, at: [x, 0.8, -0.28] });
  }
  b.part(cyl(0.05, 0.05, 0.02, 8), BEDROLL, { bone: chest, at: [0.226, 0.8, -0.2], dir: [1, 0, 0] });

  // ------------------------------------------------------------------------------------------------------
  // Legs
  for (const s of [1, -1]) {
    const L = sd(s);
    const pts = limb(V(s * 0.125, 0.52, 0), V(s * 0.135, 0.115, 0.02), [0.25, 0.24], [0, 0, 1]);
    const leg = b.chain(`leg${L}`, pts, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`],
      role: "leg",
      contact: [s * 0.135, 0, 0.1],
    });
    b.sweep(leg, lin([[0, 0.125], [0.5, 0.1], [1, 0.088]]), { color: TROUSER, sides: 8 });
    const ankle = leg.joints[2];
    const knee = leg.joints[1];
    const A = toV(pts[2]);
    const K = toV(pts[1]);
    const up = K.clone().sub(A).normalize();
    // boot shaft, cuff, straps
    b.rod(A.clone().addScaledVector(up, -0.02), A.clone().addScaledVector(up, 0.17), [0.094, 0.104], {
      bone: ankle,
      color: BOOT,
      sides: 8,
      caps: "flat",
    } as any);
    b.part(tor(0.108, 0.024, 6, 10), FLEECE, { bone: ankle, at: A.clone().addScaledVector(up, 0.17), dir: up, axis: "z" });
    b.part(tor(0.1, 0.01, 5, 10), LEATHER, { bone: ankle, at: A.clone().addScaledVector(up, 0.09), dir: up, axis: "z" });
    b.part(box(0.035, 0.02, 0.03), GOLD, {
      bone: ankle,
      at: A.clone().addScaledVector(up, 0.09).add(V(0, 0, 0.1)),
    });
    // foot
    b.frustumBox([s * 0.135, 0.074, -0.075], [s * 0.135, 0.074, 0.23], [0.17, 0.136], [0.15, 0.12], {
      bone: ankle,
      color: BOOT,
    });
    b.frustumBox([s * 0.135, 0.012, -0.085], [s * 0.135, 0.012, 0.24], [0.185, 0.024], [0.165, 0.024], {
      bone: ankle,
      color: LEATHER_DARK,
    });
    ball(ankle, PLATE, [s * 0.135, 0.075, 0.212], [0.085, 0.064, 0.068]);
    b.joint(`toe${L}`, {
      parent: ankle,
      at: [s * 0.135, 0.07, 0.12],
      aim: [s * 0.135, 0.07, 0.22],
      role: "digit",
    });
    // knee guard
    const f = V(0, 0.15, 1).normalize();
    b.part(sph(7, 5), PLATE, {
      bone: knee,
      at: K.clone().addScaledVector(f, 0.1),
      dir: f,
      axis: "z",
      scale: [0.075, 0.075, 0.045],
      flat: true,
    } as any);
    b.part(tor(0.07, 0.011, 5, 9), GOLD, { bone: knee, at: K.clone().addScaledVector(f, 0.095), dir: f, axis: "z" });
    b.part(sph(5, 4), GOLD, {
      bone: knee,
      at: K.clone().addScaledVector(f, 0.145),
      scale: [0.016, 0.016, 0.016],
      flat: true,
    } as any);
  }

  // ------------------------------------------------------------------------------------------------------
  // Arms
  const HAND_L = V(0.25, 0.82, 0.4);
  const HAND_R = V(-0.3, 0.86, 0.4);
  const hands: Record<string, Joint> = {};

  const pauldron = (s: number, bone: Joint) => {
    const base = V(s * 0.335, 0.985, 0);
    const th = (-s * 24 * Math.PI) / 180;
    const u = V(-Math.sin(th), Math.cos(th), 0);
    const tilt = -s * 24;
    const layers: number[][] = [
      [0, 0.17, 0.115],
      [0.04, 0.145, 0.1],
      [0.075, 0.115, 0.085],
    ];
    for (const [off, r, h] of layers) {
      const c = base.clone().addScaledVector(u, off);
      b.part(dome(), PLATE, { bone, at: c, scale: [r, h, r], rotation: [0, 0, tilt], flat: true } as any);
      b.part(tor(r * 0.99, 0.012, 5, 14), GOLD, { bone, at: c, dir: u, axis: "z" });
    }
    b.part(cone(0.032, 0.11, 6), GOLD, { bone, at: base.clone().addScaledVector(u, 0.2), dir: u, flat: true });
    b.ring(frame(base.clone().addScaledVector(u, 0.047), u), { count: 8, radius: 0.155 }, (it: any) =>
      b.part(sph(5, 4), GOLD, { bone, at: it.at, scale: [0.014, 0.014, 0.014], flat: true } as any),
    );
    b.ring(frame(base.clone().addScaledVector(u, 0.142), u), { count: 5, radius: 0.07 }, (it: any) =>
      b.part(sph(5, 4), GOLD, { bone, at: it.at, scale: [0.012, 0.012, 0.012], flat: true } as any),
    );
  };

  const gripFist = (L: string, handJ: Joint, c: THREE.Vector3, a: THREE.Vector3, n: THREE.Vector3) => {
    const side = n.clone().cross(a).normalize();
    b.part(cyl(0.056, 0.06, 0.1, 8), SKIN, { bone: handJ, at: c, dir: a, flat: true });
    const fj = b.joint(`fingers${L}`, {
      parent: handJ,
      at: c.clone().addScaledVector(n, 0.04),
      aim: c.clone().addScaledVector(n, 0.08),
      role: "digit",
    });
    const tj = b.joint(`thumb${L}`, {
      parent: handJ,
      at: c.clone().addScaledVector(side, 0.04),
      aim: c.clone().addScaledVector(side, 0.05).addScaledVector(a, 0.05),
      role: "digit",
    });
    b.rod(
      c.clone().addScaledVector(n, 0.046).addScaledVector(a, -0.05),
      c.clone().addScaledVector(n, 0.046).addScaledVector(a, 0.05),
      0.024,
      SKIN,
      { bone: fj, sides: 6 },
    );
    for (let i = 0; i < 4; i++) {
      ball(fj, SKIN, c.clone().addScaledVector(n, 0.058).addScaledVector(a, (i - 1.5) * 0.026), [0.014, 0.014, 0.014]);
      ball(fj, "#8a4a38", c.clone().addScaledVector(n, 0.066).addScaledVector(a, (i - 1.5) * 0.026), [0.007, 0.005, 0.007]);
    }
    b.capsule(
      c.clone().addScaledVector(side, 0.05).addScaledVector(a, -0.025),
      c.clone().addScaledVector(side, 0.02).addScaledVector(n, 0.03).addScaledVector(a, 0.035),
      0.02,
      SKIN,
      { bone: tj, sides: 6 },
    );
  };

  for (const s of [1, -1]) {
    const L = sd(s);
    const sh = V(s * 0.3, 0.95, 0);
    const hand = s > 0 ? HAND_L : HAND_R;
    const pts = limb(sh, hand, [0.23, 0.22], [s * 0.5, -1, -0.3]);
    const arm = b.chain(`arm${L}`, pts, {
      parent: chest,
      names: [`shoulder${L}`, `elbow${L}`, `hand${L}`],
      role: "arm",
    });
    const armR = lin([[0, 0.098], [0.25, 0.102], [0.5, 0.08], [0.75, 0.078], [1, 0.064]]);
    b.sweep(arm, armR, { color: SKIN, sides: 8 });
    const shoulderJ = arm.joints[0];
    const handJ = arm.joints[2];
    hands[L] = handJ;

    ball(shoulderJ, SKIN, [s * 0.31, 0.95, 0], [0.11, 0.1, 0.1]);
    pauldron(s, shoulderJ);

    // steel bracer with gold bands, leather wrist wrap
    b.sweep(arm, (t: number) => armR(t) + 0.014, { from: 0.6, to: 0.9, caps: "flat", color: PLATE, sides: 8 } as any);
    for (const [t0, t1] of [[0.58, 0.62], [0.88, 0.92]])
      b.sweep(arm, (t: number) => armR(t) + 0.02, { from: t0, to: t1, caps: "flat", color: GOLD, sides: 8 } as any);
    const hp = toV(pts[2]);
    const fd = hp.clone().sub(toV(pts[1])).normalize();
    b.part(tor(0.07, 0.016, 5, 9), LEATHER_DARK, { bone: handJ, at: hp.clone().addScaledVector(fd, -0.045), dir: fd, axis: "z" });
    // elbow stud
    const eh = toV(pts[1]);
    b.part(sph(5, 4), GOLD, {
      bone: arm.joints[1],
      at: eh.clone().add(V(s * 0.06, -0.02, -0.04)),
      scale: [0.018, 0.018, 0.018],
      flat: true,
    } as any);
  }

  // ------------------------------------------------------------------------------------------------------
  // Head
  const HC = V(0, 1.2, 0.06);
  const skull = b.part(sph(12, 9), SKIN, { bone: head, at: HC, scale: [0.155, 0.145, 0.15] } as any);
  const hs = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = hs.around(HC).at(s * 23, 8)!;
    b.decal(skull, EYE, { at: hit.at, dir: [s * 0.3, 0, 1], size: [0.064, 0.04], roll: s * 8 });
    ball(head, SKIN, [s * 0.098, 1.172, 0.125], [0.062, 0.05, 0.05]); // cheeks
    ball(head, NOSE, [s * 0.035, 1.148, 0.192], [0.032, 0.026, 0.032]); // nostril wings
    // ears
    b.extrude(
      [
        [0.0, -0.045],
        [0.035, -0.01],
        [0.03, 0.04],
        [-0.01, 0.065],
        [-0.075, 0.1, "sharp"],
        [-0.045, 0.02],
        [-0.035, -0.03],
      ] as any,
      { at: [s * 0.148, 1.175, 0.01], x: [0, 0, 1], y: [s * 0.5, 1, 0], thickness: 0.014, bevel: 0.003, color: SKIN, bone: head },
    );
    b.part(tor(0.011, 0.004, 4, 8), GOLD, { bone: head, at: [s * 0.152, 1.163, 0.02], dir: [1, 0, 0], axis: "z" });
    // eyebrows
    const brow = b.sweep(
      catmull([
        [s * 0.012, 1.268, 0.215],
        [s * 0.06, 1.28, 0.2],
        [s * 0.115, 1.292, 0.15],
        [s * 0.14, 1.286, 0.11],
      ]),
      [0.024, 0.012],
      { bone: head, color: HAIR, sides: 6, caps: "round" } as any,
    );
    b.along(brow, 5, (at: any) => b.spike(at, at, 0.04, 0.012, { color: HAIR, bone: head, sides: 4 } as any));
    // mustache
    const mp = catmull([
      [s * 0.008, 1.138, 0.222],
      [s * 0.05, 1.122, 0.222],
      [s * 0.1, 1.1, 0.19],
      [s * 0.15, 1.095, 0.14],
      [s * 0.185, 1.125, 0.09],
    ]);
    const must = b.sweep(mp, lin([[0, 0.03], [0.5, 0.027], [1, 0.008]]), {
      bone: head,
      color: HAIR,
      sides: 6,
      caps: { start: "round", end: "point" },
    } as any);
    b.along(must, 4, (at: any) => b.spike(at, at, 0.03, 0.01, { color: HAIR, bone: head, sides: 4 } as any));
    // tusk-like lower teeth
    b.part(cone(0.013, 0.04, 5), BONE, { bone: jaw, at: [s * 0.042, 1.115, 0.2], dir: [0, 1, 0.2], flat: true });
    // horns on the cap
    b.sweep(
      bezier(V(s * 0.16, 1.27, 0), V(s * 0.3, 1.27, 0), V(s * 0.32, 1.36, 0.02), V(s * 0.3, 1.46, 0.04)),
      [0.032, 0.003],
      { bone: head, color: BONE, caps: { start: "flat", end: "point" }, sides: 6 } as any,
    );
    b.rod([s * 0.15, 1.27, 0], [s * 0.2, 1.273, 0], 0.04, { bone: head, color: GOLD, sides: 8 });
  }

  // nose and brow ridge
  b.rod([0, 1.235, 0.19], [0, 1.172, 0.218], 0.03, { bone: head, color: SKIN, sides: 6 });
  ball(head, NOSE, [0, 1.165, 0.208], [0.055, 0.05, 0.06]);
  ball(head, "#7a3a30", [0, 1.14, 0.228], [0.024, 0.008, 0.012]);
  b.sweep(
    catmull([
      [0.13, 1.255, 0.12],
      [0.07, 1.262, 0.18],
      [0, 1.255, 0.205],
      [-0.07, 1.262, 0.18],
      [-0.13, 1.255, 0.12],
    ]),
    0.027,
    { bone: head, color: SKIN, sides: 7 } as any,
  );
  // lower jaw
  ball(jaw, SKIN, [0, 1.078, 0.12], [0.115, 0.045, 0.095]);
  ball(jaw, "#b0574b", [0, 1.1, 0.19], [0.05, 0.014, 0.02]);
  b.part(box(0.1, 0.012, 0.03), "#2a1210", { bone: jaw, at: [0, 1.106, 0.2] });

  // ------------------------------------------------------------------------------------------------------
  // Beard, hair, braids
  b.sweep(
    catmull([
      [0.15, 1.22, 0.0],
      [0.14, 1.13, 0.08],
      [0.1, 1.06, 0.17],
      [0, 1.04, 0.2],
      [-0.1, 1.06, 0.17],
      [-0.14, 1.13, 0.08],
      [-0.15, 1.22, 0.0],
    ]),
    lin([[0, 0.03], [0.15, 0.05], [0.5, 0.06], [0.85, 0.05], [1, 0.03]]),
    { bone: head, color: HAIR, sides: 7, smooth: false } as any,
  );
  const beardPath = catmull([
    [0, 1.07, 0.17],
    [0, 0.99, 0.265],
    [0, 0.89, 0.305],
    [0, 0.8, 0.3],
    [0, 0.74, 0.285],
  ]);
  const brx = lin([[0, 0.09], [0.25, 0.15], [0.55, 0.16], [0.85, 0.12], [1, 0.03]]);
  const bry = lin([[0, 0.05], [0.25, 0.07], [0.6, 0.08], [0.9, 0.06], [1, 0.02]]);
  const beard = b.sweep(beardPath, (t: number) => [brx(t), bry(t)], {
    bone: jaw,
    color: HAIR,
    sides: 8,
    smooth: false,
    caps: { start: "round", end: "point" },
  } as any);
  const bhits = b.surface(beard).scatter(70, { rng: rng(11), minDist: 0.04, filter: (h: any) => h.n.z > -0.3 });
  b.cards(bhits, TUFT, {
    size: [0.05, 0.11],
    lean: 70,
    flow: [0, -1, 0.05],
    bend: 25,
    vary: 0.3,
    rng: rng(12),
    spin: 15,
    bone: jaw,
  } as any);
  for (const t of [0.5, 0.78]) {
    const r = (brx(t) + bry(t)) / 2 + 0.008;
    b.part(tor(r, 0.011, 5, 12), GOLD, {
      bone: jaw,
      at: beardPath.at(t),
      dir: beardPath.tangentAt(t),
      axis: "z",
      scale: [1, 1, 1],
    } as any);
  }

  const braid = (pts: number[][], bone: Joint, links: number, w: number) => {
    const p = catmull(pts);
    let k = 0;
    b.along(p, links, (at: any) => {
      const off = (k % 2 ? 1 : -1) * w * 0.35;
      const pos = at.local([off, 0, 0]);
      b.part(sph(6, 4), HAIR, {
        bone,
        at: pos,
        dir: at.axis,
        up: k % 2 ? [1, 0, 0] : [0, 0, 1],
        scale: [w, w * 1.3, w * 0.85],
        flat: true,
      } as any);
      k++;
    });
    b.part(cyl(w * 1.05, w * 1.05, 0.026, 8), GOLD, { bone, at: p.at(0.97), dir: p.tangentAt(1), flat: true });
    b.spike(p.at(0.98), p.tangentAt(1), 0.075, w * 0.9, { color: HAIR, bone, sides: 6 } as any);
    b.part(tor(w * 1.1, 0.007, 4, 8), GOLD, { bone, at: p.at(0.05), dir: p.tangentAt(0.05), axis: "z" });
  };
  for (const s of [1, -1]) {
    braid(
      [
        [s * 0.1, 0.86, 0.3],
        [s * 0.125, 0.77, 0.315],
        [s * 0.12, 0.67, 0.3],
        [s * 0.125, 0.57, 0.28],
      ],
      jaw,
      10,
      0.03,
    );
  }
  // hair at the back of the head and the long back braid
  ball(head, HAIR, [0, 1.19, -0.07], [0.16, 0.13, 0.12]);
  braid(
    [
      [0, 1.17, -0.13],
      [0, 1.09, -0.21],
      [0, 1.0, -0.22],
      [0, 0.92, -0.2],
    ],
    head,
    8,
    0.034,
  );

  // ------------------------------------------------------------------------------------------------------
  // Helmet
  const CC = V(0, 1.228, 0.05);
  const rad14 = (14 * Math.PI) / 180;
  const capUp = V(0, Math.cos(rad14), -Math.sin(rad14));
  const capFwd = V(0, Math.sin(rad14), Math.cos(rad14));
  const cap = b.part(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, 1.35), PLATE, {
    bone: head,
    at: CC,
    scale: [0.172, 0.165, 0.176],
    rotation: [-14, 0, 0],
    flat: true,
  } as any);
  b.part(tor(0.168, 0.014, 5, 16), GOLD, {
    bone: head,
    at: CC.clone().addScaledVector(capUp, 0.036),
    dir: capUp,
    axis: "z",
  });
  b.extrude(
    [
      [-0.15, 0],
      [-0.12, 0.08],
      [-0.05, 0.13],
      [0.04, 0.14],
      [0.11, 0.1],
      [0.16, 0.02],
    ] as any,
    {
      at: CC.clone().addScaledVector(capUp, 0.085),
      x: capFwd,
      y: capUp,
      thickness: 0.026,
      bevel: 0.006,
      color: BRONZE,
      bone: head,
    } as any,
  );
  const cs = b.surface(cap);
  const lensHits = [1, -1].map((s) => cs.around(CC).at(s * 26, 38)!);
  for (const h of lensHits) {
    b.stick(cyl(0.042, 0.046, 0.035, 10), BRASS, h, { embed: 0.3 });
    glow(b.stick(cyl(0.031, 0.031, 0.01, 10), "#5fd0ff", h.moved([0, 0.026, 0]), { embed: 0 }), 0.7);
    b.stick(tor(0.04, 0.007, 4, 10), GOLD, h.moved([0, 0.02, 0]), { embed: 0 });
  }
  b.rod(lensHits[0], lensHits[1], 0.012, LEATHER_DARK, { bone: head, sides: 5 });
  // cheek guards peeking under the cap
  for (const s of [1, -1]) {
    b.part(box(0.015, 0.07, 0.07), PLATE, {
      bone: head,
      at: [s * 0.157, 1.225, 0.045],
      rotation: [0, 0, s * 8],
    });
  }

  // ------------------------------------------------------------------------------------------------------
  // Anvil, stump
  const AZ = 0.62;
  b.part(cyl(0.2, 0.235, 0.46, 10), BARK, { bone: root, at: [0, 0.23, AZ], flat: true });
  b.ring(frame(V(0, 0.03, AZ), V(0, 1, 0)), { count: 5, radius: 0.21 }, (it: any) =>
    b.part(sph(6, 4), BARK, { bone: root, at: it.at, scale: [0.07, 0.05, 0.06], flat: true } as any),
  );
  b.part(new THREE.CircleGeometry(0.2, 10), "#ffffff", {
    bone: root,
    at: [0, 0.4615, AZ],
    dir: [0, 1, 0],
    axis: "z",
    texture: RINGS,
  } as any);
  b.part(tor(0.232, 0.014, 5, 14), IRONM, { bone: root, at: [0, 0.09, AZ], dir: [0, 1, 0], axis: "z" });
  b.part(tor(0.205, 0.014, 5, 14), IRONM, { bone: root, at: [0, 0.38, AZ], dir: [0, 1, 0], axis: "z" });

  b.frustumBox([0, 0.46, AZ], [0, 0.54, AZ], [0.38, 0.22], [0.24, 0.15], { bone: root, color: IRONM });
  b.frustumBox([0, 0.54, AZ], [0, 0.68, AZ], [0.22, 0.14], [0.2, 0.13], { bone: root, color: IRONM });
  b.frustumBox([0, 0.68, AZ], [0, 0.74, AZ], [0.2, 0.13], [0.4, 0.18], { bone: root, color: IRONM });
  b.frustumBox([0, 0.74, AZ], [0, 0.8, AZ], [0.5, 0.19], [0.5, 0.19], { bone: root, color: IRONM });
  b.part(box(0.52, 0.012, 0.2), STEEL, { bone: root, at: [0, 0.8, AZ] });
  b.spike([0.25, 0.73, AZ], [1, 0, 0], 0.3, 0.07, { bone: root, color: IRONM, sides: 8 } as any);
  b.part(box(0.12, 0.05, 0.18), IRONM, { bone: root, at: [-0.31, 0.775, AZ] });
  b.part(box(0.12, 0.012, 0.19), STEEL, { bone: root, at: [-0.31, 0.8, AZ] });
  b.part(box(0.03, 0.004, 0.03), "#120c0a", { bone: root, at: [-0.15, 0.806, AZ] });
  b.part(cyl(0.011, 0.011, 0.004, 8), "#120c0a", { bone: root, at: [-0.24, 0.806, AZ] });
  b.part(box(0.46, 0.012, 0.012), GOLD, { bone: root, at: [0, 0.755, AZ - 0.0985] });
  glow(
    b.part(new THREE.PlaneGeometry(0.15, 0.094), "#ffffff", {
      bone: root,
      at: [0, 0.61, AZ - 0.0715],
      dir: [0, 0, -1],
      axis: "z",
      texture: RUNE,
    } as any),
    1.2,
  );

  // Sword blank, glowing hot toward the tip
  const hw = lin([[-0.27, 0.002], [-0.25, 0.012], [-0.1, 0.03], [0.05, 0.034], [0.1, 0.03], [0.105, 0.012], [0.22, 0.011]]);
  const seg = (x0: number, x1: number, col: Col, g: number) => {
    const part = b.extrude(
      [
        [x0, -hw(x0)],
        [x1, -hw(x1)],
        [x1, hw(x1)],
        [x0, hw(x0)],
      ] as any,
      { at: [0, 0.813, AZ - 0.02], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.014, color: col, bone: root } as any,
    );
    if (g > 0) glow(part, g);
  };
  seg(-0.27, -0.17, "#ffd36a", 1.7);
  seg(-0.17, -0.05, "#ff8a2a", 1.3);
  seg(-0.05, 0.06, "#d9421a", 0.9);
  seg(0.06, 0.1, "#7a2a1a", 0.4);
  seg(0.1, 0.22, IRONM, 0);

  // Sparks
  const R = rng(5);
  for (let i = 0; i < 16; i++) {
    const sz = 0.008 + R() * 0.009;
    glow(
      b.part(box(sz, sz * 0.6, sz * 0.6), i % 2 ? "#ffe08a" : "#ffb03a", {
        bone: root,
        at: [-0.06 + (R() - 0.5) * 0.4, 0.85 + R() * 0.25, AZ - 0.02 + (R() - 0.5) * 0.3],
        rotation: [R() * 180, R() * 180, 0],
      } as any),
      2,
    );
  }

  // ------------------------------------------------------------------------------------------------------
  // Hammer (right hand)
  const hRj = hands.R;
  const h = V(0.18, 0.26, 0.12).normalize();
  const headC = HAND_R.clone().addScaledVector(h, 0.37);
  const a = V(0, 1, 0).addScaledVector(h, -h.y).normalize();
  b.rod(HAND_R.clone().addScaledVector(h, -0.14), headC.clone().addScaledVector(h, 0.07), 0.021, WOOD, { bone: hRj, sides: 7 } as any);
  ball(hRj, GOLD, HAND_R.clone().addScaledVector(h, -0.15), [0.03, 0.03, 0.03]);
  b.part(box(0.125, 0.26, 0.125), HAMMERM, { bone: hRj, at: headC, dir: a, up: h, flat: true });
  for (const k of [1, -1]) {
    b.part(box(0.14, 0.035, 0.14), STEEL, { bone: hRj, at: headC.clone().addScaledVector(a, k * 0.13), dir: a, up: h, flat: true });
    b.part(box(0.135, 0.022, 0.135), GOLD, { bone: hRj, at: headC.clone().addScaledVector(a, k * 0.075), dir: a, up: h, flat: true });
  }
  ball(hRj, GOLD, headC.clone().addScaledVector(h, 0.075), [0.03, 0.03, 0.03]);
  glow(
    b.part(new THREE.PlaneGeometry(0.08, 0.08), "#ffffff", {
      bone: hRj,
      at: headC.clone().addScaledVector(h, 0.0645),
      dir: h,
      up: a,
      axis: "z",
      texture: HRUNE,
    } as any),
    0.9,
  );
  gripFist("R", hRj, HAND_R, h, V(0, -h.z, h.y).normalize());

  // ------------------------------------------------------------------------------------------------------
  // Tongs (left hand)
  const hLj = hands.L;
  const barPt = V(0.1, 0.822, 0.6);
  const dn = barPt.clone().sub(HAND_L).normalize();
  const perp = dn.clone().cross(V(0, 1, 0)).normalize();
  const pivot = barPt.clone().addScaledVector(dn, -0.1);
  for (const k of [1, -1]) {
    const hEnd = HAND_L.clone().addScaledVector(dn, -0.1).addScaledVector(perp, k * 0.05);
    b.rod(hEnd, pivot, 0.011, IRONM, { bone: hLj, sides: 6 } as any);
    b.rod(pivot, barPt.clone().addScaledVector(perp, k * 0.012), 0.011, IRONM, { bone: hLj, sides: 6 } as any);
    ball(hLj, LEATHER_DARK, hEnd, [0.02, 0.02, 0.02]);
  }
  b.part(cyl(0.017, 0.017, 0.03, 8), BRASS, { bone: hLj, at: pivot, dir: [0, 1, 0], flat: true });
  gripFist("L", hLj, HAND_L, dn, V(0.8, 0, 0.6));

  return b.root;
}
