import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import type { Chain } from "../src/skeleton";
import type { Sweep } from "../src/sweep";
import { svg } from "../src/texture";

export const meta = {
  name: "Dromedary Caravan",
  description:
    "A one-humped dromedary laden for the desert: woven saddle blanket with tassels, wooden saddle frame, water skins, rolled carpets, sacks, a halter and a lead rope, in flat low-poly.",
};

// ---- palette ---------------------------------------------------------------------------------------------------
const TAN = "#c99d63";
const TAN_L = "#d8b47d";
const BELLY = "#e3c994";
const FUR = "#6d4526";
const FUR_L = "#8a5d34";
const PAD = "#8b6847";
const CALLUS = "#7b5636";
const NAIL = "#3a2a1d";
const DARK = "#1d130d";
const LIP = "#b98a62";
const MOUTH = "#4a2b22";
const RED = "#a3301f";
const WOOD = "#5d3a20";
const WOOD_L = "#80552f";
const ROPE = "#d9c794";
const ROPE_D = "#b39c68";
const LEATHER = "#8d5b33";
const LEATHER_D = "#5e3a21";
const BRASS = "#cda43a";
const TEAL = "#1f7074";
const BURLAP = "#b89d6c";
const INDIGO = "#21345e";
const MUSTARD = "#d9a42c";
const CREAM = "#eadbb3";
const WHITE = "#ffffff";

// ---- drawings --------------------------------------------------------------------------------------------------
/** A fur tuft: three curved blades, root at the bottom edge. */
const tuft = (a: string, b: string) =>
  svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 48">
      <polygon points="0,48 6,24 13,6 18,30 22,48" fill="${a}"/>
      <polygon points="10,48 18,20 30,2 28,30 32,48" fill="${b}"/>
      <polygon points="20,48 28,22 40,14 36,38 40,48" fill="${a}"/>
    </svg>`,
    { size: 96 },
  );

/** A hanging tassel: the knot and binding at the bottom edge (the root), strands above it in the weave colours. */
const tassel = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 48">
    <rect x="6" y="0" width="12" height="9" fill="${MUSTARD}"/>
    <rect x="5" y="9" width="14" height="3" fill="${INDIGO}"/>
    <polygon points="2,12 7,12 6,48 3,48" fill="${RED}"/>
    <polygon points="8,12 12,12 12,48 8,48" fill="${MUSTARD}"/>
    <polygon points="12,12 16,12 16,48 12,48" fill="${CREAM}"/>
    <polygon points="17,12 22,12 21,48 18,48" fill="${RED}"/>
  </svg>`,
  { size: 96 },
);

/** Stepped diamonds between plain bands: the blanket's woven panels. */
const weave = (w: number, h: number, base: string, c1: string, c2: string, c3: string) => {
  let bits = `<rect width="${w}" height="${h}" fill="${base}"/>`;
  const cols = Math.round(w / 40);
  const step = w / cols;
  for (let i = 0; i < cols; i++) {
    const cx = step * (i + 0.5);
    const cy = h / 2;
    const r = Math.min(step * 0.46, h * 0.28);
    for (const [k, c] of [
      [1, c1],
      [0.62, c2],
      [0.26, c3],
    ] as const)
      bits += `<polygon points="${cx},${cy - r * k} ${cx + r * k},${cy} ${cx},${cy + r * k} ${cx - r * k},${cy}" fill="${c}"/>`;
    bits += `<polygon points="${cx - step / 2},${h * 0.2} ${cx - step / 2 + 6},${h * 0.2 + 6} ${cx - step / 2},${h * 0.2 + 12}" fill="${c3}"/>`;
    bits += `<polygon points="${cx - step / 2},${h * 0.8 - 12} ${cx - step / 2 + 6},${h * 0.8 - 6} ${cx - step / 2},${h * 0.8}" fill="${c3}"/>`;
  }
  bits += `<rect y="${h * 0.14}" width="${w}" height="${h * 0.03}" fill="${c2}"/><rect y="${h * 0.83}" width="${w}" height="${h * 0.03}" fill="${c2}"/>`;
  bits += `<rect width="${w}" height="${h * 0.07}" fill="${c1}"/><rect y="${h * 0.93}" width="${w}" height="${h * 0.07}" fill="${c1}"/>`;
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${bits}</svg>`, { size: 384 });
};

/** Sun-bleached, rubbed patches on the blanket (drawn over it with a transparent ground). */
const wear = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80">
    <polygon points="8,20 30,10 44,22 34,40 14,38" fill="#c9684f" opacity="1"/>
    <polygon points="70,50 96,42 112,58 92,72 74,68" fill="#c9684f"/>
    <polygon points="56,8 72,6 76,16 62,20" fill="#c9684f"/>
    <polygon points="14,60 26,54 34,64 22,72" fill="#c9684f"/>
  </svg>`,
  { size: 128 },
);

/** Carpet roll wall: u runs round the roll, v along it; borders at both ends, medallions between. */
const carpetWall = (field: string, c1: string, c2: string, c3: string) => {
  let bits = `<rect width="160" height="200" fill="${field}"/>`;
  bits += `<rect y="0" width="160" height="22" fill="${c1}"/><rect y="178" width="160" height="22" fill="${c1}"/>`;
  bits += `<rect y="22" width="160" height="8" fill="${c3}"/><rect y="170" width="160" height="8" fill="${c3}"/>`;
  bits += `<rect y="6" width="160" height="5" fill="${c2}"/><rect y="189" width="160" height="5" fill="${c2}"/>`;
  for (let i = 0; i < 4; i++) {
    const cx = 20 + i * 40;
    bits += `<polygon points="${cx},52 ${cx + 17},100 ${cx},148 ${cx - 17},100" fill="${c2}"/>`;
    bits += `<polygon points="${cx},68 ${cx + 9},100 ${cx},132 ${cx - 9},100" fill="${c1}"/>`;
    bits += `<polygon points="${cx},88 ${cx + 4},100 ${cx},112 ${cx - 4},100" fill="${c3}"/>`;
    bits += `<polygon points="${cx + 20},40 ${cx + 27},50 ${cx + 20},60 ${cx + 13},50" fill="${c3}"/>`;
    bits += `<polygon points="${cx + 20},140 ${cx + 27},150 ${cx + 20},160 ${cx + 13},150" fill="${c3}"/>`;
  }
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 200">${bits}</svg>`, { size: 256 });
};

/** Carpet roll end: the spiral of layers seen edge-on. */
const carpetEnd = (colors: string[]) => {
  let bits = `<rect width="100" height="100" fill="${colors[0]}"/>`;
  for (let k = 0; k < 14; k++) {
    const r = 49 - k * 3.3;
    const pts: string[] = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + k * 0.5;
      pts.push(`${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`);
    }
    bits += `<polygon points="${pts.join(" ")}" fill="${colors[k % colors.length]}"/>`;
  }
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${bits}</svg>`, { size: 192 });
};

/** Burlap sack: weave, a stitched patch and a stencilled trader's mark. Wraps a sphere once (middle = front). */
const sackSkin = (mark: string) => {
  let bits = `<rect width="200" height="100" fill="${BURLAP}"/>`;
  for (let y = 4; y < 100; y += 8) bits += `<rect y="${y}" width="200" height="1.6" fill="#a58a5a"/>`;
  for (let x = 4; x < 200; x += 10) bits += `<rect x="${x}" width="1.6" height="100" fill="#ad9262"/>`;
  bits += `<polygon points="126,22 160,18 163,50 130,54" fill="#8c6a48"/><polygon points="129,25 157,22 160,47 132,51" fill="#a1805a"/>`;
  bits += `<polygon points="129,25 133,25 132,51 128,51" fill="#5d4029"/>`;
  bits += mark;
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">${bits}</svg>`, { size: 256 });
};
const markA = `<circle cx="100" cy="50" r="15" fill="none" stroke="#3b2a1d" stroke-width="4"/><polygon points="100,30 104,50 100,70 96,50" fill="#3b2a1d"/><rect x="80" y="48" width="40" height="4" fill="#3b2a1d"/>`;
const markB = `<polygon points="80,68 100,30 120,68" fill="none" stroke="#7a2a1c" stroke-width="5"/><rect x="94" y="52" width="12" height="6" fill="#7a2a1c"/>`;
const sackA = sackSkin(markA);
const sackB = sackSkin(markB);

/** Goatskin: patchy hide with a stitched seam down the middle. Wraps a sphere (seam = middle). */
const skinHide = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">
    <rect width="200" height="100" fill="${LEATHER}"/>
    <polygon points="10,0 60,0 50,40 20,55" fill="#7e4e2b"/>
    <polygon points="110,100 170,100 175,55 130,48" fill="#9a683c"/>
    <polygon points="30,100 70,100 65,70 38,78" fill="#774a29"/>
    <polygon points="140,0 190,0 192,30 150,36" fill="#9a683c"/>
    <rect x="96" y="0" width="8" height="100" fill="${LEATHER_D}"/>
    ${Array.from({ length: 12 }, (_, i) => `<rect x="90" y="${i * 8 + 3}" width="20" height="3" fill="#d8bc8a"/>`).join("")}
    <polygon points="60,80 66,70 74,80 66,90" fill="#5e3a21"/><polygon points="150,14 156,4 164,14 156,24" fill="#5e3a21"/>
  </svg>`,
  { size: 256 },
);

/** A folded cloth bundle: woven bands. */
const cloth = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">
    <rect width="200" height="100" fill="${TEAL}"/>
    <rect y="14" width="200" height="10" fill="${CREAM}"/><rect y="30" width="200" height="4" fill="${MUSTARD}"/>
    <rect y="66" width="200" height="4" fill="${MUSTARD}"/><rect y="76" width="200" height="10" fill="${CREAM}"/>
    ${Array.from({ length: 10 }, (_, i) => `<polygon points="${i * 20 + 10},38 ${i * 20 + 18},50 ${i * 20 + 10},62 ${i * 20 + 2},50" fill="${i % 2 ? RED : MUSTARD}"/>`).join("")}
  </svg>`,
  { size: 256 },
);

const eyeDecal = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40">
    <polygon points="6,26 18,12 40,8 58,16 62,24 50,32 28,36" fill="#2a1a12"/>
    <polygon points="14,25 22,16 40,13 54,19 56,23 46,29 28,32" fill="#120a06"/>
    <polygon points="34,14 42,14 40,22 34,22" fill="#f4e7cf"/>
    <polygon points="4,20 0,12 8,16" fill="#120a06"/><polygon points="12,12 10,4 18,9" fill="#120a06"/>
    <polygon points="22,8 22,1 30,6" fill="#120a06"/><polygon points="33,6 35,0 40,5" fill="#120a06"/>
  </svg>`,
  { size: 128 },
);

const nostrilDecal = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polygon points="2,6 22,2 20,14 4,20" fill="${DARK}"/></svg>`,
  { size: 64 },
);

/** A burned-in clan brand: ring, stem and two prongs. */
const brand = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
    <polygon points="20,2 30,8 34,18 30,28 20,32 10,28 6,18 10,8 14,10 11,18 14,25 20,28 26,25 29,18 26,10 20,6" fill="#6f4a2b"/>
    <rect x="18" y="28" width="4" height="10" fill="#6f4a2b"/>
    <polygon points="8,38 18,30 20,33 11,40" fill="#6f4a2b"/><polygon points="32,38 22,30 20,33 29,40" fill="#6f4a2b"/>
  </svg>`,
  { size: 128 },
);

/** Sand and dried mud splashed up the lower legs. */
const dust = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
    <polygon points="0,40 4,22 10,30 16,14 22,28 30,10 36,26 44,16 48,30 56,22 60,40" fill="#a98559"/>
    <polygon points="6,40 10,30 16,36 24,26 30,38" fill="#8e6b44"/>
  </svg>`,
  { size: 128 },
);

// ---- helpers ---------------------------------------------------------------------------------------------------
/** Piecewise-linear profile through [t, value] keys. */
const prof = (keys: ReadonlyArray<readonly [number, number]>) => (t: number) => {
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
    }
  }
  return keys[keys.length - 1][1];
};

const ball = (r: number, w = 6, h = 4) => new THREE.SphereGeometry(r, w, h);

export default function build() {
  const b = createBuilder({ name: "dromedaryCaravan", paintSize: 512 });

  // =================================================================================================================
  // Skeleton: spine, neck, head, jaw, tail, four legs
  // =================================================================================================================
  const pelvis = b.joint("pelvis", { at: [0, 1.34, -0.62], dir: [0, 0.02, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull(
      [
        [0, 1.34, -0.62],
        [0, 1.35, -0.2],
        [0, 1.37, 0.2],
        [0, 1.4, 0.45],
        [0, 1.43, 0.6],
      ],
      { tension: 0.5 },
    ),
    { parent: pelvis, names: ["spine1", "spine2", "spine3", "chest"], role: "spine", count: 4 },
  );
  const [, spine2, , chest] = spine.joints;

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.5, 0.6],
      [0, 1.6, 1.05],
      [0, 1.92, 1.27],
      [0, 2.22, 1.3],
      [0, 2.42, 1.42],
    ]),
    { parent: chest, role: "neck", names: ["neck1", "neck2", "neck3", "neck4"] },
  );

  const head = b.joint("head", { parent: neck.joints[3], at: [0, 2.42, 1.42], dir: [0, -0.32, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.12, -0.07]),
    aim: head.local([0, 0.46, -0.1]),
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.28, -0.92],
      [0, 1.1, -1.05],
      [0, 0.92, -1.08],
      [0, 0.78, -1.07],
    ]),
    { parent: pelvis, role: "tail", names: ["tail1", "tail2", "tail3"] },
  );

  // ---- legs ------------------------------------------------------------------------------------------------------
  type Leg = { name: string; hind: boolean; w: number; chain: Chain };
  const legs: Leg[] = [];
  for (const [side, w] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    // front: shoulder, elbow (points back), knee (points forward), foot
    const fx = w * 0.26;
    const frontPts = limb(
      [fx, 1.22, 0.5],
      [fx, 0.17, 0.6],
      [0.42, 0.4, 0.36],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    legs.push({
      name: `F${side}`,
      hind: false,
      w,
      chain: b.chain(`legF${side}`, frontPts, {
        parent: chest,
        role: "leg",
        names: [`shoulder${side}`, `elbow${side}`, `knee${side}`, `foot${side}`],
      }),
    });
    // hind: hip, stifle (forward), hock (back), foot
    const hx = w * 0.27;
    const hindPts = limb(
      [hx, 1.25, -0.6],
      [hx, 0.17, -0.78],
      [0.46, 0.46, 0.34],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    legs.push({
      name: `H${side}`,
      hind: true,
      w,
      chain: b.chain(`legH${side}`, hindPts, {
        parent: pelvis,
        role: "leg",
        names: [`hip${side}`, `stifle${side}`, `hock${side}`, `footH${side}`],
      }),
    });
  }

  // =================================================================================================================
  // Body
  // =================================================================================================================
  const bodyR = prof([
    [0, 0.27],
    [0.15, 0.34],
    [0.5, 0.37],
    [0.85, 0.36],
    [1, 0.3],
  ]);
  // deep ribcage, tucked-up flank, croup sloping away: the belly rises toward the hips, the top line stays level
  const bodyH = prof([
    [0, 0.29],
    [0.12, 0.37],
    [0.3, 0.44],
    [0.55, 0.47],
    [0.85, 0.47],
    [1, 0.4],
  ]);
  const bodyTop = prof([
    [0, 1.7],
    [0.3, 1.78],
    [1, 1.8],
  ]);
  const spineY = prof([
    [0, 1.34],
    [0.25, 1.35],
    [0.5, 1.37],
    [0.75, 1.4],
    [1, 1.43],
  ]);
  const body = b.sweep(spine, (t) => [bodyR(t), bodyH(t)], {
    sides: 8,
    smooth: false,
    color: TAN,
    shift: (t) => [0, bodyTop(t) - spineY(t) - bodyH(t)],
    sectors: [[112.5, 247.5, BELLY]],
  });

  const hump = b.part(ball(1, 8, 5), TAN, {
    bone: spine2,
    at: [0, 1.68, 0.2],
    scale: [0.3, 0.4, 0.31],
    flat: true,
  });
  // chest pad (the sternum callus a camel kneels on)
  b.part(ball(1, 7, 4), CALLUS, { bone: chest, at: [0, 0.97, 0.62], scale: [0.18, 0.1, 0.22], flat: true });

  // ---- legs: swept tubes, knobbly ---------------------------------------------------------------------------------
  const frontR = prof([
    [0, 0.13],
    [0.3, 0.085],
    [0.5, 0.075],
    [0.56, 0.09],
    [0.62, 0.06],
    [0.9, 0.052],
    [1, 0.07],
  ]);
  const hindR = prof([
    [0, 0.16],
    [0.25, 0.11],
    [0.45, 0.075],
    [0.52, 0.088],
    [0.58, 0.06],
    [0.9, 0.05],
    [1, 0.07],
  ]);
  const legSweeps: Record<string, Sweep> = {};
  for (const leg of legs) {
    const R = leg.hind ? hindR : frontR;
    legSweeps[leg.name] = b.sweep(leg.chain, (t) => R(t), {
        sides: 6,
        smooth: false,
        bands: [
          [0.6, TAN],
          [1, TAN_L],
        ],
        caps: { start: "round", end: "round" },
        extend: [0, 0.1],
    });
    const joints = leg.chain.joints;
    const kneeJ = joints[2];
    // knee / hock callus
    b.part(ball(1, 6, 4), CALLUS, {
      bone: kneeJ,
      at: kneeJ.at.clone().add(new THREE.Vector3(0, 0, leg.hind ? -0.055 : 0.06)),
      scale: [0.06, 0.085, 0.05],
      flat: true,
    });
    // foot: wide padded sole, two toes with nails
    const foot = joints[3];
    const fp = foot.at;
    b.part(ball(1, 7, 4), PAD, {
      bone: foot,
      at: [fp.x, 0.05, fp.z - 0.005],
      scale: [0.085, 0.055, 0.12],
      flat: true,
    });
    for (const tx of [-0.042, 0.042]) {
      const toe = b.joint(`toe${tx > 0 ? "A" : "B"}${leg.name}`, {
        parent: foot,
        at: [fp.x + tx * leg.w, 0.05, fp.z + 0.06],
        dir: [0, -0.15, 1],
        role: "digit",
      });
      b.part(new THREE.CylinderGeometry(0.046, 0.054, 0.1, 6), PAD, {
        bone: toe,
        at: [fp.x + tx * leg.w, 0.05, fp.z + 0.075],
        scale: [1, 1, 1.45],
        flat: true,
      });
      b.part(new THREE.BoxGeometry(0.06, 0.045, 0.035), NAIL, {
        bone: toe,
        at: [fp.x + tx * leg.w, 0.04, fp.z + 0.16],
        flat: true,
      });
    }
  }
  // dust splashed up the lower legs
  for (const leg of legs) {
    const sw = legSweeps[leg.name];
    if (!sw) continue;
    const foot = leg.chain.joints[3];
    for (const dirX of [1, -1]) {
      const at = [foot.at.x, 0.36, foot.at.z + (leg.hind ? 0.02 : 0)];
      b.decal(sw, dust, { at, dir: [dirX, 0, 0], size: [0.12, 0.17], up: [0, 1, 0], mirror: dirX < 0 });
    }
  }

  // ---- neck, head ------------------------------------------------------------------------------------------------
  const neckR = prof([
    [0, 0.22],
    [0.3, 0.165],
    [0.7, 0.125],
    [1, 0.11],
  ]);
  const neckSweep = b.sweep(neck, (t) => [neckR(t) * 0.86, neckR(t)], {
    sides: 7,
    smooth: false,
    color: TAN,
    sectors: [[120, 240, TAN_L]],
    caps: { start: "round", end: "round" },
  });

  const hq = head.quat;
  const skull = b.part(ball(1, 7, 5), TAN, {
    bone: head,
    at: head.local([0, 0.08, 0.02]),
    quat: hq,
    scale: [0.115, 0.19, 0.125],
    flat: true,
  });
  const muzzle = b.sweep(
    [head.local([0, 0.14, 0.0]), head.local([0, 0.5, -0.035])],
    (t) => [0.095 - 0.025 * t, 0.098 - 0.026 * t],
    { bone: head, sides: 6, smooth: false, color: TAN_L, caps: { start: "none", end: "flat" } },
  );
  // split upper lip that hangs over the jaw, nostril slits
  b.part(ball(1, 6, 4), LIP, {
    bone: head,
    at: head.local([0, 0.5, -0.055]),
    quat: hq,
    scale: [0.07, 0.06, 0.065],
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.006, 0.03, 0.06), MOUTH, {
    bone: head,
    at: head.local([0, 0.552, -0.06]),
    quat: hq,
    flat: true,
  });
  for (const w of [1, -1]) {
    b.decal(muzzle, nostrilDecal, {
      at: head.local([-w * 0.05, 0.47, 0.02]),
      dir: [0, -1, 0],
      up: [0, 0, 1],
      size: [0.05, 0.05],
      mirror: w > 0,
    });
  }

  // lower jaw with a drooping lip pad, and the dark of the mouth beneath the upper lip
  b.sweep([jaw.at.clone(), jaw.local([0, 0.34, 0])], [0.06, 0.042], {
    bone: jaw,
    sides: 6,
    smooth: false,
    color: TAN_L,
    caps: { start: "round", end: "flat" },
  });
  b.part(ball(1, 6, 4), LIP, {
    bone: jaw,
    at: jaw.local([0, 0.35, -0.01]),
    quat: jaw.quat,
    scale: [0.05, 0.045, 0.035],
    flat: true,
  });
  b.rod(jaw.local([0, 0.06, 0.05]), jaw.local([0, 0.44, 0.045]), 0.03, {
    bone: jaw,
    sides: 4,
    smooth: false,
    color: MOUTH,
  });
  for (const w of [1, -1]) {
    b.sweep(
      catmull([
        head.local([-w * 0.074, 0.51, -0.066]),
        head.local([-w * 0.084, 0.32, -0.068]),
        head.local([-w * 0.1, 0.17, -0.055]),
      ]),
      0.007,
      { bone: head, sides: 4, smooth: false, color: MOUTH },
    );
  }

  // eyes under heavy brows; ears
  for (const w of [1, -1]) {
    b.part(ball(1, 6, 4), TAN, {
      bone: head,
      at: head.local([-w * 0.085, 0.13, 0.078]),
      quat: hq,
      scale: [0.042, 0.075, 0.04],
      flat: true,
    });
    b.decal(skull, eyeDecal, {
      at: head.local([-w * 0.11, 0.12, 0.03]),
      dir: [-w, 0, 0],
      size: [0.1, 0.064],
      segments: 6,
      mirror: w > 0,
    });
    b.extrude(
      [
        [0, 0],
        [0.05, 0.02],
        [0.055, 0.08],
        [0.01, 0.125, "sharp"],
        [-0.035, 0.07],
        [-0.03, 0.02],
      ],
      {
        bone: head,
        at: head.local([-w * 0.07, -0.03, 0.1]),
        x: [0, 0, 1],
        y: [w * 0.55, 1, 0],
        thickness: 0.022,
        smoothing: 1,
        color: TAN,
      },
    );
  }

  // ---- tail ------------------------------------------------------------------------------------------------------
  const tailSweep = b.sweep(tail, [0.045, 0.022], { sides: 5, smooth: false, color: TAN, caps: { start: "round", end: "round" } });

  // =================================================================================================================
  // Saddle blanket, frame and cargo: all rigid on the spine
  // =================================================================================================================
  const skin = b.surface(body);
  // the owner's brand, burned into the left shoulder
  b.decal(body, brand, { at: [0.36, 1.52, 0.38], dir: [-1, 0, 0], size: [0.17, 0.17], segments: 6 });
  const cargo = spine2;
  // a path round the barrel at z, from +phi over the back to -phi degrees, found with rays fired outward from the
  // spine, then lifted off the skin
  const wrap = (z: number, phi: number, lift: number, n = 13) =>
    catmull(
      Array.from({ length: n }, (_, i) => {
        const a = ((phi - (2 * phi * i) / (n - 1)) * Math.PI) / 180;
        const hit = skin.ray([0, 1.35, z], [Math.sin(a), Math.cos(a), 0]);
        if (!hit) throw new Error(`wrap: no surface at z=${z}, ${phi} deg`);
        return hit.at.clone().addScaledVector(hit.n, lift);
      }),
    );

  // the blanket: a thick woven pad draped over the barrel, with hem tassels
  const blanketZ = -0.42;
  const blanketHalf = 0.3;
  const blanketPath = wrap(blanketZ, 128, 0.03);
  const blanket = b.sweep(blanketPath, () => [blanketHalf, 0.015], {
    bone: cargo,
    section: "box",
    up: [1, 0, 0],
    color: RED,
    caps: "flat",
  });
  const sidePanel = weave(240, 150, RED, INDIGO, MUSTARD, CREAM);
  const topPanel = weave(240, 150, INDIGO, RED, MUSTARD, CREAM);
  for (const w of [1, -1]) {
    b.decal(blanket, sidePanel, {
      at: [w * 0.45, 1.36, blanketZ],
      dir: [-w, 0, 0],
      size: [blanketHalf * 2, 0.56],
      segments: [8, 10],
    });
    b.decal(blanket, wear, {
      at: [w * 0.42, 1.2, blanketZ + 0.06],
      dir: [-w, 0, 0],
      size: [0.3, 0.2],
      segments: 6,
      mirror: w > 0,
    });
  }
  b.decal(blanket, topPanel, {
    at: [0, 1.9, blanketZ],
    dir: [0, -1, 0],
    up: [0, 0, 1],
    size: [0.3, blanketHalf * 2],
    segments: [6, 8],
  });

  // tassels: along the front and rear edges and down both hems
  const tassels: THREE.Vector3[] = [];
  for (const dz of [-blanketHalf - 0.002, blanketHalf + 0.002]) {
    for (let i = 0; i <= 26; i++) {
      const p = blanketPath.at(0.06 + (0.88 * i) / 26);
      tassels.push(new THREE.Vector3(p.x, p.y - 0.012, blanketZ + dz));
    }
  }
  b.cards(
    tassels.map((p) => frame(p, [0, 1, 0])),
    tassel,
    { size: [0.05, 0.12], lean: 180, flow: [0, 0, 1], bone: cargo, sink: 0, vary: 0.12, rng: rng(5) },
  );
  for (const [end, w] of [
    [0, 1],
    [1, -1],
  ] as const) {
    const p = blanketPath.at(end);
    b.cards(
      Array.from({ length: 11 }, (_, i) => frame([p.x, p.y - 0.012, blanketZ - blanketHalf + 0.055 + i * 0.049], [0, 1, 0])),
      tassel,
      { size: [0.06, 0.16], lean: 180, flow: [w, 0, 0], bone: cargo, sink: 0 },
    );
  }

  // wooden saddle frame: two arches with horned tops, side bars and top rails
  const archF = wrap(-0.2, 122, 0.075);
  const archR = wrap(-0.64, 122, 0.075);
  for (const arch of [archF, archR]) {
    b.sweep(arch, 0.027, { bone: cargo, sides: 6, smooth: false, color: WOOD, caps: "round" });
    const top = arch.at(0.5);
    b.spike(top, [0, 1, 0], 0.12, 0.034, { bone: cargo, sides: 6, smooth: false, color: WOOD_L });
    for (const end of [0, 1]) {
      const e = arch.at(end);
      b.part(ball(0.04, 6, 4), WOOD_L, { bone: cargo, at: e, flat: true });
    }
  }
  for (const t of [0.07, 0.93]) {
    b.rod(archF.at(t), archR.at(t), 0.024, { bone: cargo, sides: 6, smooth: false, color: WOOD });
  }
  for (const t of [0.4, 0.6]) {
    b.rod(archF.at(t), archR.at(t), 0.022, { bone: cargo, sides: 6, smooth: false, color: WOOD_L });
  }
  // lashing wraps at the bar joints
  for (const arch of [archF, archR]) {
    for (const t of [0.07, 0.93, 0.4, 0.6]) {
      const p = arch.at(t);
      b.part(new THREE.TorusGeometry(0.036, 0.012, 3, 6), ROPE, {
        bone: cargo,
        at: p,
        dir: [0, 0, 1],
        axis: "z",
        flat: true,
      });
    }
  }

  const topY = skin.ray([0, 3, -0.42], [0, -1, 0])?.at.y ?? 1.8;
  const railY = topY + 0.075 + 0.022;

  // ---- rolled carpets on top --------------------------------------------------------------------------------------
  const carpet = (x: number, y: number, z: number, r: number, len: number, wall: THREE.Texture, end: THREE.Texture, tilt: number) => {
    const q = { bone: cargo, at: [x, y, z] as [number, number, number], rotation: [0, 0, 90] as [number, number, number] };
    b.part(new THREE.CylinderGeometry(r, r, len, 8, 1, true), WHITE, { ...q, rotation: [0, tilt, 90], texture: wall, flat: true });
    for (const e of [-1, 1]) {
      const a = new THREE.Vector3(Math.cos((tilt * Math.PI) / 180), 0, -Math.sin((tilt * Math.PI) / 180));
      b.part(new THREE.CircleGeometry(r * 0.99, 8), WHITE, {
        bone: cargo,
        at: [x + a.x * e * (len / 2 + 0.003), y, z + a.z * e * (len / 2 + 0.003)],
        dir: [a.x * e, 0, a.z * e],
        axis: "z",
        texture: end,
        flat: true,
      });
      b.part(new THREE.TorusGeometry(r + 0.01, 0.013, 3, 8), ROPE, {
        bone: cargo,
        at: [x + a.x * e * len * 0.3, y, z + a.z * e * len * 0.3],
        dir: [a.x, 0, a.z],
        axis: "z",
        flat: true,
      });
    }
  };
  const wallA = carpetWall(RED, INDIGO, MUSTARD, CREAM);
  const endA = carpetEnd([RED, INDIGO, CREAM, MUSTARD, INDIGO, RED]);
  const wallB = carpetWall(TEAL, RED, CREAM, MUSTARD);
  const endB = carpetEnd([TEAL, MUSTARD, RED, CREAM]);
  carpet(0.03, railY + 0.115, -0.26, 0.12, 1.1, wallA, endA, 0);
  carpet(-0.03, railY + 0.105, -0.58, 0.11, 1.0, wallB, endB, 0);

  // ---- hanging loads ----------------------------------------------------------------------------------------------
  const barL = (u: number) => archF.at(0.07).clone().lerp(archR.at(0.07), u);
  const barR = (u: number) => archF.at(0.93).clone().lerp(archR.at(0.93), u);

  const hang = (from: THREE.Vector3, to: THREE.Vector3) => {
    b.sweep(catmull([from, from.clone().lerp(to, 0.5).add(new THREE.Vector3(Math.sign(from.x) * 0.03, 0, 0)), to]), 0.011, {
      bone: cargo,
      sides: 4,
      smooth: false,
      color: ROPE,
      caps: "round",
    });
  };

  const waterSkin = (x: number, y: number, z: number, size: number, w: number, yaw: number) => {
    const sc = size;
    b.part(ball(1, 8, 5), WHITE, {
      bone: cargo,
      at: [x, y, z],
      scale: [0.13 * sc, 0.23 * sc, 0.12 * sc],
      rotation: [0, w > 0 ? yaw : 180 + yaw, 0],
      texture: skinHide,
      flat: true,
    });
    // tied neck with a cord
    b.part(new THREE.CylinderGeometry(0.03 * sc, 0.045 * sc, 0.1 * sc, 5), LEATHER_D, {
      bone: cargo,
      at: [x, y + 0.23 * sc, z],
      flat: true,
    });
    b.part(new THREE.TorusGeometry(0.038 * sc, 0.01, 3, 5), ROPE, {
      bone: cargo,
      at: [x, y + 0.21 * sc, z],
      dir: [0, 1, 0],
      axis: "z",
      flat: true,
    });
    // four stubby leg ties
    for (const [dx, dz, dy] of [
      [1, 1, -1],
      [-1, 1, -1],
      [1, -1, -1],
      [-1, -1, -1],
    ] as const) {
      b.spike([x + dx * 0.09 * sc, y + dy * 0.14 * sc, z + dz * 0.07 * sc], [dx * 0.5, dy, dz * 0.4], 0.055 * sc, 0.034 * sc, {
        bone: cargo,
        sides: 5,
        smooth: false,
        color: LEATHER_D,
      });
    }
  };

  const sack = (x: number, y: number, z: number, size: number, w: number, mark: THREE.Texture) => {
    b.part(ball(1, 8, 5), WHITE, {
      bone: cargo,
      at: [x, y, z],
      scale: [0.14 * size, 0.2 * size, 0.14 * size],
      rotation: [0, w > 0 ? 0 : 180, 0],
      texture: mark,
      flat: true,
    });
    b.spike([x, y + 0.17 * size, z], [0.15, 1, 0.05], 0.12 * size, 0.055 * size, {
      bone: cargo,
      sides: 5,
      smooth: false,
      color: BURLAP,
    });
    b.part(new THREE.TorusGeometry(0.058 * size, 0.012, 3, 5), ROPE, {
      bone: cargo,
      at: [x, y + 0.165 * size, z],
      dir: [0, 1, 0],
      axis: "z",
      flat: true,
    });
  };

  // left flank
  {
    const p1 = barL(0.2);
    const p2 = barL(0.78);
    waterSkin(p1.x + 0.14, p1.y - 0.27, p1.z, 1.05, 1, 25);
    hang(p1, new THREE.Vector3(p1.x + 0.12, p1.y - 0.06, p1.z));
    sack(p2.x + 0.14, p2.y - 0.2, p2.z, 0.95, 1, sackB);
    hang(p2, new THREE.Vector3(p2.x + 0.1, p2.y - 0.07, p2.z));
  }
  // right flank
  {
    const p1 = barR(0.2);
    const p2 = barR(0.78);
    sack(p1.x - 0.15, p1.y - 0.22, p1.z, 1.15, -1, sackA);
    hang(p1, new THREE.Vector3(p1.x - 0.12, p1.y - 0.04, p1.z));
    waterSkin(p2.x - 0.13, p2.y - 0.25, p2.z, 0.95, -1, 10);
    hang(p2, new THREE.Vector3(p2.x - 0.1, p2.y - 0.07, p2.z));
  }
  // cloth bundle tied over the croup, behind the rear arch
  const bundle = b.part(ball(1, 8, 5), WHITE, {
    bone: cargo,
    at: [0, 1.62, -0.84],
    scale: [0.2, 0.15, 0.17],
    texture: cloth,
    flat: true,
  });
  for (const dz of [-0.06, 0.06]) {
    b.sweep(b.surface(bundle).loop([0, 1.62, -0.84 + dz], { dir: [0, 0, 1], lift: 0.008 }), 0.011, {
      bone: cargo,
      sides: 5,
      smooth: false,
      color: ROPE,
    });
  }

  // =================================================================================================================
  // Halter, lead rope, bell
  // =================================================================================================================
  const noseband = b.surface(muzzle).loop(head.local([0, 0.33, -0.01]), { dir: head.dir([0, 1, 0]), lift: 0.012 });
  b.sweep(noseband, 0.014, { bone: head, sides: 5, smooth: false, color: TEAL });
  const crown = b.surface(skull).loop(head.local([0, 0.0, 0.02]), { dir: head.dir([0, 1, 0]), lift: 0.012 });
  b.sweep(crown, 0.014, { bone: head, sides: 5, smooth: false, color: TEAL });
  for (const w of [1, -1]) {
    b.sweep(
      catmull([
        head.local([-w * 0.112, 0.02, 0.0]),
        head.local([-w * 0.12, 0.14, -0.04]),
        head.local([-w * 0.1, 0.27, -0.04]),
        head.local([-w * 0.088, 0.33, -0.04]),
      ]),
      0.013,
      { bone: head, sides: 5, smooth: false, color: TEAL },
    );
    b.part(new THREE.TorusGeometry(0.022, 0.008, 3, 6), BRASS, {
      bone: head,
      at: head.local([-w * 0.088, 0.33, -0.05]),
      dir: head.dir([-w, 0, 0]),
      axis: "z",
      flat: true,
    });
  }
  // chin strap down to the lead ring
  const ringAt = head.local([0, 0.36, -0.2]);
  b.sweep(
    catmull([head.local([-0.088, 0.33, -0.05]), head.local([-0.06, 0.35, -0.14]), ringAt, head.local([0.06, 0.35, -0.14]), head.local([0.088, 0.33, -0.05])]),
    0.012,
    { bone: head, sides: 5, smooth: false, color: TEAL },
  );
  b.part(new THREE.TorusGeometry(0.035, 0.01, 3, 6), BRASS, {
    bone: head,
    at: ringAt.clone().add(new THREE.Vector3(0, -0.02, 0)),
    dir: [1, 0, 0],
    axis: "z",
    flat: true,
  });

  // lead rope: hangs slack from the ring, then lies in loose loops on the floor
  const floorY = 0.016;
  const coil: THREE.Vector3[] = [];
  const cz = ringAt.z + 0.05;
  const landing = new THREE.Vector3(0.3, floorY, cz - 0.02);
  const a0 = 3.2;
  for (let i = 0; i <= 18; i++) {
    const u = i / 18;
    const a = a0 + u * Math.PI * 3.4;
    const r = 0.2 - 0.07 * u;
    const c0x = landing.x - 0.2 * Math.sin(a0);
    const c0z = landing.z - 0.2 * Math.cos(a0);
    coil.push(new THREE.Vector3(c0x + 0.05 * u + r * Math.sin(a), floorY + 0.012 * Math.floor(u * 3), c0z + r * Math.cos(a)));
  }
  const lead = b.chain(
    "lead",
    catmull([
      ringAt.clone().add(new THREE.Vector3(0, -0.04, 0)),
      new THREE.Vector3(0.07, ringAt.y - 0.3, ringAt.z + 0.08),
      new THREE.Vector3(0.22, 1.45, cz + 0.1),
      new THREE.Vector3(0.33, 0.9, cz + 0.08),
      new THREE.Vector3(0.36, 0.4, cz + 0.02),
      new THREE.Vector3(0.33, 0.1, cz - 0.02),
      ...coil,
    ]),
    { parent: head, role: "tentacle", count: 7 },
  );
  b.sweep(lead, 0.015, { sides: 5, smooth: false, color: ROPE_D, caps: "round" });

  // caravan bell on a woven strap round the neck
  const bellHit = b.surface(neckSweep).ray([0, 1.85, 2.5], [0, 0, -1]);
  if (bellHit) {
    const neckBone = neck.joints[1];
    b.sweep(b.surface(neckSweep).loop(bellHit.at, { dir: [0, 1, 0.25], lift: 0.014 }), 0.02, {
      bone: neckBone,
      sides: 5,
      smooth: false,
      color: RED,
    });
    const top = bellHit.at.clone().add(new THREE.Vector3(0, -0.03, 0.05));
    b.rod(top, top.clone().add(new THREE.Vector3(0, -0.05, 0.01)), 0.012, { bone: neckBone, sides: 4, smooth: false, color: LEATHER_D });
    b.lathe(
      [
        [0, 0],
        [0.035, 0],
        [0.045, -0.03],
        [0.075, -0.09],
        [0.08, -0.11],
        [0, -0.11],
      ],
      { at: top.clone().add(new THREE.Vector3(0, -0.05, 0.01)), bone: neckBone, segments: 8, color: BRASS },
    );
    b.part(ball(0.02, 5, 4), LEATHER_D, { bone: neckBone, at: top.clone().add(new THREE.Vector3(0, -0.17, 0.01)), flat: true });
  }

  // =================================================================================================================
  // Hair: tufts as cards
  // =================================================================================================================
  const tuftDark = tuft(FUR, FUR_L);
  b.cards(
    b.surface(hump).scatter(26, { rng: rng(3), minDist: 0.08, filter: (h) => h.n.y > 0.35 }),
    tuftDark,
    { size: [0.1, 0.1], lean: 50, bend: 30, flow: [0, 0, -1], cross: true, vary: 0.25, rng: rng(4), bone: spine2 },
  );
  b.cards(
    b.surface(neckSweep).scatter(70, { rng: rng(6), minDist: 0.06, filter: (h) => h.n.y < -0.1 && h.n.z > -0.2 }),
    tuftDark,
    { size: [0.07, 0.15], lean: 30, bend: 25, flow: [0, -1, 0.1], cross: true, vary: 0.3, rng: rng(7) },
  );
  b.cards(
    b.surface(neckSweep).scatter(40, { rng: rng(8), minDist: 0.07, filter: (h) => h.n.y > 0.4 }),
    tuftDark,
    { size: [0.05, 0.1], lean: 40, bend: 20, flow: [0, 0.1, -1], cross: true, vary: 0.3, rng: rng(9) },
  );

  // tail tuft: a dark plume of hair on the tail's end
  b.spike([0, 0.84, -1.07], [0, -1, 0.05], 0.22, 0.055, { bone: tail.joints[2], sides: 5, smooth: false, color: FUR });
  b.cards(
    Array.from({ length: 8 }, (_, i) => tailSweep.at(0.9 + 0.03 * (i % 4), i * 45)),
    tuftDark,
    { size: [0.1, 0.24], lean: 25, bend: 20, flow: [0, -1, 0], cross: true, vary: 0.2, rng: rng(12) },
  );

  return b.root;
}
