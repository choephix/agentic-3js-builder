```ts
import * as THREE from "three";
import {
  bezier,
  catmull,
  cells,
  countershade,
  createBuilder,
  frame,
  gradient,
  limb,
  mottle,
  noise,
  offset,
  paint,
  rng,
  scales,
  svg,
} from "agentic-3js-builder";
import type { Builder, ColorInput, Frame, Joint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Hydra of the Broken Chains",
  description:
    "A five-headed Norse-brutal hydra in a God of War mood: soot-dark scaled hide cracked with ember seams, bone armour and horns, shackle cuffs with snapped chains, a glowing rune sigil on each flank, rune plaques on iron neck collars, a frost-rune axe and spears buried in its back, and a tattered crimson war banner.",
};

type V3 = [number, number, number];

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
/** A point in a frame's own axes (x right, y along, z up-ish), scaled by s. */
const P = (f: Frame, x: number, y: number, z: number, s = 1) =>
  new THREE.Vector3().copy(f.local([x * s, y * s, z * s]));
/** A model-space direction from a frame-local direction. */
const Dr = (f: Frame, x: number, y: number, z: number) => new THREE.Vector3().copy(f.dir([x, y, z])).normalize();

/** A cone tooth / claw / thorn whose base sits at `base` and whose tip points along `dir`. */
const tooth = (
  b: Builder,
  base: THREE.Vector3,
  dir: THREE.Vector3,
  len: number,
  r: number,
  color: ColorInput,
  bone: Joint,
) => {
  const d = dir.clone().normalize();
  return b.part(new THREE.ConeGeometry(r, len, 5, 1), color, {
    bone,
    at: base.clone().addScaledVector(d, len / 2),
    dir: d,
    flat: true,
  });
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const BONE = "#d8ccae";
const BONE_D = "#8f8366";
const TOOTH = "#e9e0c6";
const WOOD = "#5a4128";
const CLAW = "#cfc3a2";
const MAW = "#6e1a1c";
const TONGUE = "#a8323a";
const SCARC = "#d2bfa0";
const CRIM = "#7c1f1f";
const FRILLC = "#5b2220";
const EYEBALL = "#8c2d0c";
const EMBER = "#ff8a2a";

// Paints
const HIDE = countershade(
  scales(["#3e4b3b", "#35433a", "#475340"], "#131915", { size: 0.075, width: 0.15, seed: 3 }),
  scales(["#b3a07a", "#a28f69", "#bba984"], "#463a27", { size: 0.1, width: 0.14, seed: 4 }),
  { level: -0.2, soft: 0.3 },
);
const SOOTED = mottle(HIDE, "#161a18", { size: 0.45, seed: 9, contrast: 1.2 });
const BODYP = paint((p) => {
  const c = cells(p, 0.26, 5);
  const e = c.d2 - c.d1;
  const m = noise(p, 0.7, 8);
  if (e < 0.05 && m > 0.52) return m > 0.66 ? "#ffcf5a" : "#ff7a22";
  return SOOTED;
});
const HEADP = mottle(scales(["#38443a", "#2f3b33"], "#101512", { size: 0.05, width: 0.16, seed: 6 }), "#14181a", {
  size: 0.3,
  seed: 2,
});
const PLATE = mottle(BONE, "#8f8467", { size: 0.12, seed: 12, contrast: 1.4 });
const THROAT = paint((_p, _n, s) => (Math.floor(s[0] * 34) % 2 === 0 ? "#b6a47c" : "#8f7e5a"));
const IRON = metal("iron", { tarnish: 0.6 });
const BRONZE = metal("bronze", { tarnish: 0.5, verdigris: 0.25 });
const STEEL = metal("steel");

// ---------------------------------------------------------------------------------------------------------------
// Textures
const eyeTex = () =>
  svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="g" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff2a0"/><stop offset=".55" stop-color="#ffab2e"/><stop offset="1" stop-color="#c8431a"/></radialGradient></defs>
      <circle cx="32" cy="32" r="30" fill="url(#g)" stroke="#1a0c08" stroke-width="3"/>
      <path d="M32 6 C43 20 43 44 32 58 C21 44 21 20 32 6Z" fill="#120806"/>
      <ellipse cx="24" cy="21" rx="4.5" ry="2.8" fill="#ffffff" opacity="0.9"/>
    </svg>`,
    { size: 128 },
  );

const runeTex = (path: string, col: string) =>
  svg(
    `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="60" height="76" rx="6" fill="#16130f" stroke="#7a6a48" stroke-width="4"/>
      <rect x="8" y="8" width="48" height="64" rx="3" fill="none" stroke="#3a3226" stroke-width="2"/>
      <path d="${path}" fill="none" stroke="${col}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="9" cy="9" r="2.5" fill="#c8a24a"/><circle cx="55" cy="9" r="2.5" fill="#c8a24a"/>
      <circle cx="9" cy="71" r="2.5" fill="#c8a24a"/><circle cx="55" cy="71" r="2.5" fill="#c8a24a"/>
    </svg>`,
    { size: 160 },
  );

const RUNE_PATHS = [
  "M32 14 V66 M32 28 L48 42 M32 28 L16 42",
  "M22 14 V66 M22 14 L44 30 L22 46",
  "M20 14 V66 M44 14 V66 M20 28 L44 52",
  "M32 12 L50 40 L32 68 L14 40 Z M32 12 V68",
  "M18 66 L32 12 L46 66 M22 48 H42",
];

const sigilTex = () => {
  const f = (v: number) => v.toFixed(1);
  const runes = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return `<path d="M${f(64 + c * 52)} ${f(64 + s * 52)}L${f(64 + c * 58)} ${f(64 + s * 58)}M${f(64 + c * 55)} ${f(64 + s * 55)}l${f(-s * 3 + c * 3)} ${f(c * 3 + s * 3)}" stroke="#ff9a2e" stroke-width="3" stroke-linecap="round" fill="none"/>`;
  }).join("");
  const tris = [0, 40, 80]
    .map((rot) => {
      const pts = [0, 1, 2]
        .map((j) => {
          const a = ((rot + j * 120 - 90) * Math.PI) / 180;
          return `${f(64 + Math.cos(a) * 36)},${f(64 + Math.sin(a) * 36)}`;
        })
        .join(" ");
      return `<polygon points="${pts}" fill="none" stroke="#ffb447" stroke-width="3.5" stroke-linejoin="round"/>`;
    })
    .join("");
  return svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="60" fill="none" stroke="#ff9a2e" stroke-width="5"/>
      <circle cx="64" cy="64" r="49" fill="none" stroke="#ff9a2e" stroke-width="3"/>
      ${runes}${tris}
      <circle cx="64" cy="64" r="5" fill="#ffd36a"/>
    </svg>`,
    { size: 384 },
  );
};

const scarTex = () =>
  svg(
    `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 34 L30 22 L24 20 L56 14 L50 12 L84 8 L116 4" fill="none" stroke="#d9c7a8" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M4 34 L30 22 L24 20 L56 14 L50 12 L84 8 L116 4" fill="none" stroke="#5a2a24" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16 26 l-2 -8 M40 18 l-1 -9 M66 12 l-1 -8 M92 7 l0 -7 M20 34 l3 6 M46 24 l2 7 M72 16 l2 7" stroke="#2a1a14" stroke-width="2.4" stroke-linecap="round"/>
    </svg>`,
    { size: 480 },
  );

const flameTex = () =>
  svg(
    `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="f" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#d8321a"/><stop offset=".5" stop-color="#ff8a1e"/><stop offset="1" stop-color="#ffe27a"/></linearGradient></defs>
      <path d="M20 78 C4 70 2 52 12 40 C14 48 18 48 18 42 C16 30 22 16 24 2 C32 18 38 34 36 52 C36 66 30 76 20 78Z" fill="url(#f)"/>
      <path d="M20 74 C12 68 12 58 18 50 C20 56 24 58 24 62 C28 66 26 72 20 74Z" fill="#fff0a8"/>
    </svg>`,
    { size: 192 },
  );

const bannerTex = () =>
  svg(
    `<svg viewBox="0 0 60 90" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(0 90) scale(1 -1)">
        <path d="M3 0 H57 V80 L50 90 L44 78 L36 88 L30 76 L22 90 L15 78 L8 86 L3 74 Z" fill="#8c1c1c"/>
        <path d="M6 4 H54 V76 L48 84 L43 74 L36 83 L30 72 L22 84 L16 74 L9 80 L6 70 Z" fill="none" stroke="#c9a04a" stroke-width="2.2" stroke-linejoin="round"/>
        <rect x="3" y="0" width="54" height="8" fill="#c9a04a"/>
        <path d="M30 70 C30 56 8 54 12 36 M30 70 C30 54 18 50 20 32 M30 70 L30 30 M30 70 C30 54 42 50 40 32 M30 70 C30 56 52 54 48 36" fill="none" stroke="#e0b85a" stroke-width="3" stroke-linecap="round"/>
        <circle cx="12" cy="33" r="4.5" fill="#e0b85a"/><circle cx="20" cy="29" r="4.5" fill="#e0b85a"/>
        <circle cx="30" cy="27" r="5" fill="#e0b85a"/><circle cx="40" cy="29" r="4.5" fill="#e0b85a"/>
        <circle cx="48" cy="33" r="4.5" fill="#e0b85a"/>
        <path d="M14 20 L46 60" stroke="#3a0c0c" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
      </g>
    </svg>`,
    { size: 256 },
  );

// ---------------------------------------------------------------------------------------------------------------
const FRILL: [number, number][] = [
  [0, 0.1],
  [0.12, 0.22],
  [0.1, 0.12],
  [0.26, 0.14],
  [0.16, 0.02],
  [0.28, -0.06],
  [0.1, -0.07],
  [0, -0.1],
];
const AXE_OUT: [number, number][] = [
  [0, -0.12],
  [0.08, -0.14],
  [0.27, -0.21],
  [0.31, -0.07],
  [0.29, 0.07],
  [0.31, 0.2],
  [0.08, 0.16],
  [0, 0.15],
  [-0.13, 0.03],
  [-0.13, -0.04],
];
const DOME: [number, number][] = [
  [0, 0],
  [0.3, 0],
  [0.28, 0.07],
  [0.17, 0.19],
  [0, 0.23],
];

export default function build() {
  const b = createBuilder({ name: "hydra" });
  const rand = rng(21);

  const EYE = eyeTex();
  const RUNES = RUNE_PATHS.map((p) => runeTex(p, "#ffa530"));
  const RUNE_BLUE = runeTex(RUNE_PATHS[3], "#8fe0ff");
  const SIGIL = sigilTex();
  const SCAR = scarTex();
  const FLAME = flameTex();
  const BANNER = bannerTex();

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton: hips, spine, tail
  const hips = b.joint("hips", { at: [0, 1.55, -0.9], dir: [0, 0.05, 1], role: "spine" });
  const spinePath = catmull([
    [0, 1.55, -0.9],
    [0, 1.62, -0.2],
    [0, 1.72, 0.45],
    [0, 1.82, 1.0],
  ]);
  const spine = b.chain("spine", spinePath, { parent: hips, role: "spine" });
  const boneForZ = (z: number): Joint => (z > 0.35 ? spine.joints[2] : z > -0.4 ? spine.joints[1] : spine.joints[0]);

  const tailPath = catmull([
    [0, 1.55, -0.9],
    [0, 1.4, -1.9],
    [0, 0.95, -2.9],
    [0, 0.5, -3.75],
    [0.55, 0.15, -4.4],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, count: 6, role: "tail" });

  // -------------------------------------------------------------------------------------------------------------
  // Body
  const body = b.sweep(
    spine,
    (t: number): [number, number] => [0.5 + 0.14 * Math.sin(Math.PI * Math.min(1, t * 1.15)), 0.55 + 0.1 * t],
    { color: BODYP, extend: [0.5, 0.25], shift: [0, -0.04], sides: 10, smooth: false },
  );

  // dorsal bone plates
  let pi = 0;
  b.along(
    body,
    8,
    (at) => {
      const sz = 0.7 + 0.5 * Math.sin((Math.PI * (pi + 0.5)) / 8);
      pi++;
      b.stick(new THREE.ConeGeometry(0.1 * sz, 0.38 * sz, 4), PLATE, at, {
        embed: 0.2,
        flow: [0, 0, 1],
        scale: [1, 1, 0.35],
      });
    },
    { from: 0.04, to: 0.96 },
  );

  // tail
  const tailSw = b.sweep(tail, (t: number) => 0.34 * (1 - t) + 0.07, { color: BODYP, sides: 8, smooth: false });
  let ti = 0;
  b.along(
    tailSw,
    7,
    (at) => {
      const sz = 1 - ti * 0.1;
      ti++;
      b.stick(new THREE.ConeGeometry(0.08 * sz, 0.3 * sz, 4), PLATE, at, {
        embed: 0.2,
        flow: [0, 0, 1],
        scale: [1, 1, 0.35],
      });
    },
    { from: 0.05, to: 0.88 },
  );
  b.ring(tail.at(0.97), { count: 6, radius: 0.09, tilt: 40 }, (it) =>
    b.spike(it, it, 0.24, 0.045, { color: BONE, sides: 5 }),
  );
  b.part(new THREE.SphereGeometry(0.14, 7, 5), PLATE, {
    bone: tail.joints[tail.joints.length - 1],
    at: tailPath.at(1),
    flat: true,
  });

  // body surface decorations
  const bodySurf = b.surface(body);

  const spurHits = bodySurf.scatter(26, {
    rng: rng(4),
    minDist: 0.22,
    filter: (h) => h.n.y > 0.15 && h.at.y > 1.5,
  });
  for (const h of spurHits) b.stick(new THREE.ConeGeometry(0.035, 0.14 + rand() * 0.1, 5), BONE_D, h, { embed: 0.2 });

  const flameHits = bodySurf.scatter(14, {
    rng: rng(5),
    minDist: 0.45,
    filter: (h) => h.n.y > 0.6,
  });
  glow(
    b.cards(flameHits, FLAME, {
      size: [0.13, 0.28],
      cross: true,
      vary: 0.4,
      bend: 20,
      rng: rng(6),
    }),
    1.6,
  );

  // flank sigils and scar
  for (const s of [1, -1]) {
    const sg = bodySurf.around([0, 1.65, s > 0 ? 0.05 : -0.25]).at(s * 90, 4);
    if (sg)
      glow(
        b.decal(body, SIGIL, {
          at: sg,
          dir: [s, 0, 0],
          size: [0.85, 0.85],
          segments: 16,
          lift: 0.004,
        }),
        1.3,
      );
  }
  const scarHit = bodySurf.around([0, 1.75, 0.85]).at(90, 18);
  if (scarHit)
    b.decal(body, SCAR, { at: scarHit, dir: [1, 0, 0], size: [0.7, 0.23], segments: 14, roll: 28, lift: 0.004 });

  // axe buried in the right flank, spear in the left flank
  const axeHit = bodySurf.around([0, 1.7, 0.5]).at(-85, 30);
  if (axeHit) {
    const n = axeHit.n.clone().normalize();
    const ab = spine.joints[2];
    b.rod(axeHit.moved([0, -0.3, 0]), offset(axeHit.at, n, 1.15), 0.032, WOOD, { bone: ab });
    for (const d of [0.25, 0.55, 0.85])
      b.rod(offset(axeHit.at, n, d), offset(axeHit.at, n, d + 0.07), 0.042, IRON, { bone: ab });
    const top = offset(axeHit.at, n, 1.15);
    tooth(b, top, n, 0.14, 0.035, STEEL, ab);
    const xd = V(0, 1, 0).cross(n).normalize();
    const thick = new THREE.Vector3().crossVectors(xd, n).normalize();
    b.extrude(AXE_OUT, { at: top, x: xd, y: n, thickness: 0.05, bevel: 0.01, color: STEEL, bone: ab });
    for (const side of [1, -1]) {
      const pos = top.clone().addScaledVector(xd, 0.17).addScaledVector(thick, side * 0.028);
      glow(
        b.part(new THREE.PlaneGeometry(0.15, 0.19), "#ffffff", {
          bone: ab,
          at: pos,
          dir: thick.clone().multiplyScalar(side),
          axis: "z",
          up: n,
          texture: RUNE_BLUE,
        }),
        1.4,
      );
    }
  }

  const spHit = bodySurf.around([0, 1.75, -0.55]).at(88, 45);
  if (spHit) {
    const n = spHit.n.clone().add(V(0, 0, -0.15)).normalize();
    const sb = spine.joints[1];
    b.rod(spHit.moved([0, -0.3, 0]), offset(spHit.at, n, 1.2), 0.026, WOOD, { bone: sb });
    b.rod(offset(spHit.at, n, 0.7), offset(spHit.at, n, 0.82), 0.04, CRIM, { bone: sb });
    tooth(b, offset(spHit.at, n, 1.2), n, 0.12, 0.022, WOOD, sb);
  }

  const arrowHits = bodySurf.scatter(7, {
    rng: rng(31),
    minDist: 0.45,
    filter: (h) => (h.at.z > 0.6 || h.at.z < -0.5) && Math.abs(h.n.x) > 0.5 && h.at.y > 1.4,
  });
  for (const h of arrowHits) {
    const dA = h.n.clone().add(V(0, 0.25, -0.55)).normalize();
    const ab = boneForZ(h.at.z);
    b.rod(h.moved([0, -0.12, 0]), offset(h.at, dA, 0.55), 0.009, WOOD, { bone: ab });
    b.rod(offset(h.at, dA, 0.4), offset(h.at, dA, 0.55), 0.02, CRIM, { bone: ab });
  }

  // war banner on a pole planted in the back
  const topHit = bodySurf.around([0, 1.9, -0.5]).at(0, 90);
  if (topHit) {
    const pb = topHit.at;
    const bb = spine.joints[1];
    const poleTop = V(pb.x + 0.17, pb.y + 1.5, pb.z - 0.15);
    b.rod(V(pb.x, pb.y - 0.25, pb.z), poleTop, 0.03, WOOD, { bone: bb });
    const armY = poleTop.y - 0.05;
    b.rod(V(poleTop.x - 0.42, armY, poleTop.z), V(poleTop.x + 0.42, armY, poleTop.z), 0.022, WOOD, { bone: bb });
    for (const s of [1, -1])
      b.part(new THREE.SphereGeometry(0.04, 6, 4), BRONZE, {
        bone: bb,
        at: V(poleTop.x + s * 0.44, armY, poleTop.z),
        flat: true,
      });
    tooth(b, poleTop, V(0, 1, 0), 0.22, 0.035, BRONZE, bb);
    b.cards([frame([poleTop.x, armY - 0.02, poleTop.z], [0, 1, 0])], BANNER, {
      size: [0.74, 1.1],
      lean: 180,
      flow: [0, 0, 1],
      bone: bb,
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Legs
  const toes = (tip: Joint, cx: number, cy: number, cz: number, len: number, r: number) => {
    for (const dx of [-1, 0, 1]) {
      const a = V(cx + dx * 0.09, cy, cz);
      const e = V(cx + dx * 0.13, cy - 0.01, cz + len);
      b.capsule(a, e, r, { bone: tip, color: BODYP });
      tooth(b, e.clone().add(V(0, 0, r * 0.7)), V(dx * 0.15, -0.3, 1), 0.2, 0.045, CLAW, tip);
    }
  };
  const shackle = (leg: ReturnType<Builder["chain"]>, t: number, rad: number, tip: Joint, s: number) => {
    const band = b.ring(leg.at(t), { count: 9, radius: rad });
    b.sweep(catmull(band.items, { closed: true }), 0.04, { color: IRON, sides: 6 });
    band.items.forEach((it, i) => {
      if (i % 3 === 0) b.part(new THREE.SphereGeometry(0.035, 5, 4), BRONZE, { at: it, flat: true });
    });
    // snapped chain hanging to the ground and trailing
    const c = leg.at(t).at;
    const ax = c.x + s * 0.24;
    const lastY = 0.05;
    const step = 0.085;
    b.rod(V(c.x + s * (rad - 0.02), c.y, c.z), V(ax, c.y, c.z), 0.015, IRON, { bone: tip });
    let y = c.y;
    let i = 0;
    while (y > lastY + step) {
      b.part(new THREE.TorusGeometry(0.045, 0.012, 5, 8), IRON, {
        bone: tip,
        at: V(ax, y, c.z),
        rotation: [0, i % 2 ? 90 : 0, 0],
        scale: [0.8, 1.3, 1],
      });
      y -= step;
      i++;
    }
    for (let j = 0; j < 3; j++) {
      b.part(new THREE.TorusGeometry(0.045, 0.012, 5, 8), IRON, {
        bone: tip,
        at: V(ax, 0.03, c.z - 0.05 - j * step),
        rotation: [90, j % 2 ? 90 : 0, 0],
        scale: [0.8, 1.3, 1],
      });
    }
  };

  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";

    // front leg
    const sho: V3 = [s * 0.64, 1.55, 0.7];
    const fpt: V3 = [s * 0.8, 0.17, 1.0];
    const fp = limb(sho, fpt, [0.78, 0.78], [[s * 0.6, 0, -0.8]]);
    const fl = b.chain(`legF${sd}`, fp, {
      parent: spine.joints[2],
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`],
      role: "leg",
      contact: [fpt[0], 0, fpt[2]],
    });
    const ftip = fl.joints[fl.joints.length - 1];
    b.sweep(fl, [0.27, 0.14], { color: BODYP, sides: 8, smooth: false });
    b.part(new THREE.SphereGeometry(1, 8, 6), BODYP, {
      bone: fl.joints[0],
      at: sho,
      scale: [0.3, 0.36, 0.36],
      flat: true,
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), BODYP, {
      bone: ftip,
      at: [fpt[0], 0.12, fpt[2] + 0.1],
      scale: [0.2, 0.11, 0.26],
      flat: true,
    });
    toes(ftip, fpt[0], 0.075, fpt[2] + 0.2, 0.26, 0.07);
    tooth(b, V(fpt[0], 0.12, fpt[2] - 0.08), V(0, 0.4, -1), 0.18, 0.04, CLAW, ftip);
    shackle(fl, 0.72, 0.2, ftip, s);

    // pauldron: a bone dome crowned with thorns
    const pax = V(s * 0.55, 1, 0).normalize();
    const pat = V(sho[0] + s * 0.16, sho[1] + 0.26, sho[2]);
    b.lathe(DOME, {
      at: pat,
      axis: [pax.x, pax.y, pax.z],
      segments: 7,
      smoothing: 1,
      color: PLATE,
      bone: fl.joints[0],
    });
    b.ring(
      frame(pat.clone().addScaledVector(pax, 0.07), pax),
      { count: 5, radius: 0.28, tilt: 30 },
      (it) => b.spike(it, it, 0.2, 0.045, { color: BONE, sides: 5 }),
    );

    // hind leg
    const hip: V3 = [s * 0.64, 1.45, -0.95];
    const toe: V3 = [s * 0.8, 0.1, -0.5];
    const hp = limb(hip, toe, [0.8, 0.75, 0.4], [[s * 0.2, 0, 1]], { sole: [0, 0, 1] });
    const hl = b.chain(`legH${sd}`, hp, {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`, `toe${sd}`],
      role: "leg",
      contact: [toe[0], 0, toe[2]],
    });
    const htip = hl.joints[hl.joints.length - 1];
    b.sweep(hl, [0.32, 0.25, 0.18, 0.12, 0.1], { color: BODYP, sides: 8, smooth: false });
    b.part(new THREE.SphereGeometry(1, 8, 6), BODYP, {
      bone: hl.joints[0],
      at: hip,
      scale: [0.3, 0.45, 0.42],
      flat: true,
    });
    toes(htip, toe[0], 0.07, toe[2], 0.22, 0.065);
    tooth(b, V(toe[0], 0.15, -0.92), V(0, 0.4, -1), 0.22, 0.045, CLAW, htip);
    shackle(hl, 0.55, 0.22, htip, s);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Heads
  const buildHead = (head: Joint, sn: string, hs: number, k: number, open: number) => {
    const L = (x: number, y: number, z: number) => P(head, x, y, z, hs);
    const Dl = (x: number, y: number, z: number) => Dr(head, x, y, z);
    const ax = new THREE.Vector3().copy(head.axis);

    // cranium and snout
    const skull = b.part(new THREE.SphereGeometry(1, 8, 6), HEADP, {
      bone: head,
      at: L(0, 0.1, 0.03),
      dir: ax,
      scale: [0.24 * hs, 0.3 * hs, 0.21 * hs],
      flat: true,
    });
    b.frustumBox(L(0, 0.2, 0.02), L(0, 0.86, -0.03), [0.4 * hs, 0.29 * hs], [0.25 * hs, 0.16 * hs], {
      bone: head,
      color: HEADP,
    });
    for (let i = 0; i < 3; i++)
      tooth(b, L(0, 0.34 + 0.17 * i, 0.12 - 0.02 * i), Dl(0, 0.2, 1), (0.1 - i * 0.015) * hs, 0.05 * hs, PLATE, head);
    tooth(b, L(0, 0.8, 0.08), Dl(0, 0.5, 1), 0.18 * hs, 0.04 * hs, BONE, head);

    // mouth glow deep in the throat
    glow(
      b.part(new THREE.SphereGeometry(0.09 * hs, 6, 4), EMBER, {
        bone: head,
        at: L(0, 0.2, -0.08),
        flat: true,
      }),
      1.2,
    );

    // palate
    b.frustumBox(L(0, 0.25, -0.128), L(0, 0.8, -0.118), [0.3 * hs, 0.02 * hs], [0.18 * hs, 0.02 * hs], {
      bone: head,
      color: MAW,
    });

    for (const s of [1, -1]) {
      // nostrils
      b.part(new THREE.SphereGeometry(1, 5, 4), "#0c0807", {
        bone: head,
        at: L(-s * 0.07, 0.87, 0.0),
        scale: [0.025 * hs, 0.02 * hs, 0.03 * hs],
        flat: true,
      });
      // eyes
      const ec = L(-s * 0.185, 0.27, 0.09);
      const out = Dl(-s * 0.85, 0.35, 0.3);
      glow(
        b.part(new THREE.SphereGeometry(0.05 * hs, 6, 5), EYEBALL, { bone: head, at: ec, flat: true }),
        0.7,
      );
      glow(
        b.part(new THREE.CircleGeometry(0.042 * hs, 10), "#ffffff", {
          bone: head,
          at: ec.clone().addScaledVector(out, 0.046 * hs),
          dir: out,
          axis: "z",
          texture: EYE,
        }),
        1.6,
      );
      // heavy bone brows
      b.capsule(L(-s * 0.07, 0.2, 0.185), L(-s * 0.255, 0.37, 0.13), 0.04 * hs, { bone: head, color: PLATE });
      // swept horns
      const h0 = L(-s * 0.15, 0.03, 0.17);
      const h3 = L(-s * 0.46, -0.46, 0.26);
      b.sweep(bezier(h0, L(-s * 0.26, -0.02, 0.32), L(-s * 0.4, -0.2, 0.36), h3), [0.06 * hs, 0.004], {
        bone: head,
        color: gradient("#4a4030", "#e2d8bb", h0, h3),
        sides: 6,
      });
      // cheek frills
      b.extrude(
        FRILL.map(([x, y]): [number, number] => [x * hs, y * hs]),
        {
          at: L(-s * 0.21, 0.07, 0.0),
          x: Dl(-s * 0.55, -0.83, 0),
          y: Dl(0, 0, 1),
          thickness: 0.02 * hs,
          color: FRILLC,
          bone: head,
        },
      );
    }

    // crest thorns
    for (let i = 0; i < 3; i++) tooth(b, L(0, 0.12 - 0.12 * i, 0.2), Dl(0, -0.5, 1), (0.16 + 0.03 * (1 - i)) * hs, 0.045 * hs, BONE, head);

    // battle scar across one eye
    const sk = b.surface(skull);
    const ss = k >= 0 ? 1 : -1;
    b.sweep(
      sk.drape(
        catmull([
          L(-ss * 0.1, 0.38, 0.19),
          L(-ss * 0.2, 0.27, 0.12),
          L(-ss * 0.23, 0.12, 0.0),
        ]),
        { lift: 0.004 },
      ),
      0.01 * hs,
      { color: SCARC, sides: 4, bone: head },
    );

    // lower jaw
    const jaw = b.joint(`jaw${sn}`, {
      parent: head,
      at: L(0, 0.08, -0.1),
      aim: L(0, 0.84, -0.15),
      role: "jaw",
    });
    b.frustumBox(L(0, 0.1, -0.15), L(0, 0.84, -0.16), [0.34 * hs, 0.11 * hs], [0.2 * hs, 0.07 * hs], {
      bone: jaw,
      color: HEADP,
    });
    const jtop = (y: number) => -0.095 + ((y - 0.1) / 0.74) * -0.03;
    b.part(new THREE.BoxGeometry(0.14 * hs, 0.55 * hs, 0.02 * hs), TONGUE, {
      bone: jaw,
      at: L(0, 0.5, jtop(0.5) + 0.005),
      dir: ax,
    });
    for (const s of [1, -1]) {
      tooth(b, L(-s * 0.1, 0.8, -0.12), Dl(0, 0.3, 1), 0.22 * hs, 0.032 * hs, BONE, jaw);
      tooth(b, L(-s * (0.2 - 0.075 * 0.65 - 0.03), 0.62, -0.115), Dl(0, 0.15, -1), 0.2 * hs, 0.03 * hs, TOOTH, head);
      for (let i = 0; i < 5; i++) {
        const y = 0.28 + 0.125 * i;
        const hw = 0.2 - 0.075 * ((y - 0.2) / 0.66);
        tooth(
          b,
          L(-s * (hw - 0.025), y, -0.11),
          Dl(0, 0, -1),
          (0.09 + (i % 2) * 0.04) * hs,
          0.017 * hs,
          TOOTH,
          head,
        );
        const jhw = 0.17 - 0.07 * ((y - 0.1) / 0.74);
        tooth(
          b,
          L(-s * (jhw - 0.02), y + 0.02, jtop(y + 0.02) - 0.01),
          Dl(0, 0.1, 1),
          (0.07 + ((i + 1) % 2) * 0.03) * hs,
          0.016 * hs,
          TOOTH,
          jaw,
        );
      }
    }
    b.pose(jaw, { axis: [1, 0, 0], deg: open });
  };

  // -------------------------------------------------------------------------------------------------------------
  // Five necks
  const BX = [0, 0.34, 0.62];
  const BY = [2.25, 2.2, 2.05];
  const BZ = [0.6, 0.7, 0.65];
  const EX = [0, 1.2, 2.2];
  const EY = [3.95, 3.45, 2.7];
  const EZ = [2.2, 2.5, 2.1];
  const HS = [1.2, 1.05, 0.95];
  const OPEN = [28, 20, 16];
  const nr = (t: number) => 0.37 - 0.19 * Math.pow(t, 0.75);

  for (const k of [0, 1, -1, 2, -2]) {
    const a = Math.abs(k);
    const sgn = Math.sign(k);
    const sn = k === 0 ? "C" : `${k > 0 ? "L" : "R"}${a}`;
    const bx = sgn * BX[a];
    const by = BY[a];
    const bz = BZ[a];
    const ex = sgn * EX[a];
    const ey = EY[a];
    const ez = EZ[a];
    const pts: V3[] = [
      [bx, by, bz],
      [bx + (ex - bx) * 0.12, by + 0.8, bz + (ez - bz) * 0.05],
      [bx + (ex - bx) * 0.45, (by + ey) / 2 + 0.45, bz + (ez - bz) * 0.25],
      [bx + (ex - bx) * 0.8, ey + 0.35, ez - 0.55],
      [ex, ey, ez],
    ];
    const neck = b.chain(`neck${sn}`, catmull(pts), {
      parent: spine.joints[2],
      names: [`neck${sn}1`, `neck${sn}2`, `neck${sn}3`, `neck${sn}4`, `head${sn}`],
      role: "neck",
    });
    const neckSw = b.sweep(neck, nr, {
      color: BODYP,
      sides: 8,
      smooth: false,
      sectors: [[140, 220, THROAT]],
    });

    // dorsal thorns
    let ni = 0;
    b.along(
      neckSw,
      6,
      (at) => {
        const sz = 1 - ni * 0.1;
        ni++;
        b.stick(new THREE.ConeGeometry(0.07 * sz, 0.28 * sz, 4), PLATE, at, {
          embed: 0.2,
          flow: [0, 0.6, 1],
          scale: [1, 1, 0.35],
        });
      },
      { from: 0.12, to: 0.8 },
    );

    // iron collar, bronze studs and rune plaque
    const collarR = nr(0.42) * 1.12 + 0.03;
    const band = b.ring(neck.at(0.42), { count: 10, radius: collarR });
    b.sweep(catmull(band.items, { closed: true }), 0.04, { color: IRON, sides: 6 });
    band.items.forEach((it, i) => {
      if (i % 2 === 0) b.part(new THREE.SphereGeometry(0.03, 5, 4), BRONZE, { at: it, flat: true });
    });
    const cp = neck.at(0.42);
    const T = new THREE.Vector3().copy(cp.tangent);
    const F = V(0, 0, 1).sub(T.clone().multiplyScalar(T.z)).normalize();
    glow(
      b.part(new THREE.BoxGeometry(0.2, 0.26, 0.05), "#ffffff", {
        bone: neck.jointAt(0.42),
        at: cp.at.clone().addScaledVector(F, collarR + 0.03),
        dir: F,
        axis: "z",
        up: T,
        texture: RUNES[k + 2],
      }),
      1.1,
    );

    buildHead(neck.joints[neck.joints.length - 1], sn, HS[a], k, OPEN[a]);
  }

  return b.root;
}
```