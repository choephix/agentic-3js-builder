import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import type { Sweep } from "../src/sweep";
import { DEG, lerp, rng } from "../src/math";
import { catmull } from "../src/path";
import { limb } from "../src/ik";
import { paint } from "../src/paint";
import { svg } from "../src/texture";
import { cel, furEdge, INK, zigzag } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description:
    "A spirit fox of white fur and vermilion kumadori markings, wearing gold regalia, a shide-hung rope collar and a trailing violet sash; nine fanned tails end in cyan spirit-fire and eight fox-fire wisps circle her over a glowing summoning circle.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: white coat, vermilion markings, gold regalia, indigo sash, cyan spirit-fire.

const WHITE = cel("#fff8ee", "#d9c8ea");
const CREAM = cel("#ffe8c4", "#e9b9a8");
const VERM = cel("#f2502e", "#c32d48");
const GOLD = cel("#ffcb3d", "#d1822a");
const PLUM = cel("#3d2459", "#1f1032");
const INDIGO = cel("#5f4ede", "#33269c");
const JADE = cel("#3fdcb4", "#238fa6");
const ROPE = cel("#f1dfb4", "#c79d86");
const PINK = cel("#ff9db5", "#d3567f");
const NOSE = cel("#2b1639", INK);
const FANG = cel("#fffaf0", "#d9c8ea");
const FLAME_CORE = "#eaffff";

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const STROKE = 'stroke-linecap="round" stroke-linejoin="round"';

const EYE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 96">
  <defs>
    <linearGradient id="iris" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#b3280f"/><stop offset="0.38" stop-color="#ff7a1a"/>
      <stop offset="0.75" stop-color="#ffc534"/><stop offset="1" stop-color="#fff0a0"/>
    </linearGradient>
    <clipPath id="lid"><path d="M10 56 C18 22 52 12 66 52 C54 86 22 90 10 56 Z"/></clipPath>
  </defs>
  <path d="M10 56 C18 22 52 12 66 52 C54 86 22 90 10 56 Z" fill="#fffaf2"/>
  <g clip-path="url(#lid)">
    <ellipse cx="40" cy="54" rx="21" ry="33" fill="url(#iris)"/>
    <path d="M10 56 C18 22 52 12 66 52 L66 20 L10 20 Z" fill="#6b1a22" opacity="0.5"/>
    <ellipse cx="40" cy="54" rx="7" ry="22" fill="#2a1233"/>
  </g>
  <circle cx="31" cy="38" r="7" fill="#ffffff"/>
  <circle cx="48" cy="72" r="3.4" fill="#ffffff" opacity="0.95"/>
  <path d="M10 56 C18 22 52 12 66 52" fill="none" stroke="#e8402a" stroke-width="9" ${STROKE} opacity="1"/>
  <path d="M12 54 C20 24 52 14 66 50" fill="none" stroke="#22112f" stroke-width="6" ${STROKE}/>
  <path d="M12 52 C6 40 3 30 1 16" fill="none" stroke="#e8402a" stroke-width="6" ${STROKE}/>
  <path d="M14 46 C8 36 6 30 4 22" fill="none" stroke="#22112f" stroke-width="3.4" ${STROKE}/>
  <path d="M30 80 C42 88 56 76 63 60" fill="none" stroke="#22112f" stroke-width="2.4" ${STROKE} opacity="0.85"/>
</svg>`,
  { size: 384 },
);

const FLAME = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 128">
  <path d="M32 126 C10 118 3 92 14 68 C18 58 24 50 21 34 C28 40 32 44 33 54 C36 40 35 20 46 2 C50 22 62 44 60 80 C59 106 50 122 32 126 Z" fill="#6c5cff"/>
  <path d="M32 121 C16 113 11 92 19 74 C22 66 28 60 28 50 C32 56 34 60 35 66 C38 54 40 44 46 30 C52 54 54 72 52 90 C50 108 44 117 32 121 Z" fill="#34d8ff"/>
  <path d="M32 114 C22 106 22 92 28 82 C30 90 33 94 36 90 C40 80 42 74 44 66 C48 84 48 98 44 106 C41 111 37 114 32 114 Z" fill="#eaffff"/>
</svg>`,
  { size: 256 },
);

const SPARK = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
  <path d="M8 0 L11.5 8 L8 16 L4.5 8 Z" fill="#7be9ff"/><path d="M8 3 L9.6 8 L8 13 L6.4 8 Z" fill="#f2ffff"/>
</svg>`,
  { size: 64 },
);

const TUFT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 64">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ececf4"/><stop offset="0.5" stop-color="#fafafd"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
  <path d="M0 64 C2 44 6 30 9 18 C11 28 13 36 14 42 C15 26 17 10 20 0 C23 14 25 30 26 44 C28 36 30 30 33 20 C34 34 38 50 40 64 Z" fill="url(#g)"/>
</svg>`,
  { size: 128 },
);

const SHIDE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 96">
  <polyline points="16,2 8,20 24,38 8,56 24,74 16,94" fill="none" stroke="#fffdf8" stroke-width="11" stroke-linejoin="miter"/>
  <polyline points="16,2 8,20 24,38 8,56 24,74 16,94" fill="none" stroke="#cdbbea" stroke-width="2.4" stroke-linejoin="miter"/>
  <rect x="10" y="0" width="12" height="5" fill="#f2502e"/>
</svg>`,
  { size: 192 },
);

const TASSEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 64">
  <rect x="7" y="0" width="2" height="22" fill="#d79a2c"/>
  <circle cx="8" cy="24" r="4.5" fill="#ffcb3d"/><circle cx="7" cy="22.6" r="1.4" fill="#fff2b0"/>
  <path d="M3 28 L13 28 L15 62 C11 64 5 64 1 62 Z" fill="#f2502e"/>
  <path d="M5 30 L5.6 62 M8 30 L8 63 M11 30 L10.4 62" stroke="#b8223f" stroke-width="1.2" fill="none"/>
  <rect x="3" y="28" width="10" height="3.2" fill="#ffcb3d"/>
</svg>`,
  { size: 192 },
);

const SWIRL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M22 84 C4 56 14 22 46 12 C70 6 90 20 86 44 C84 58 70 66 58 60 C70 52 72 42 62 34 C50 26 32 34 34 52 C35 64 44 72 56 74 C46 90 34 94 22 84 Z" fill="#f2502e"/>
  <path d="M26 80 C10 56 20 28 46 19 C66 14 80 24 80 42" fill="none" stroke="#ffcb3d" stroke-width="3.4" ${STROKE}/>
  <circle cx="52" cy="48" r="5.5" fill="#ffcb3d"/><circle cx="52" cy="48" r="2.4" fill="#f2502e"/>
</svg>`,
  { size: 256 },
);

const OFUDA = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 100">
  <rect x="2" y="2" width="36" height="96" fill="#fff5dc" stroke="#d3392c" stroke-width="3"/>
  <path d="M2 2 L38 2 L38 16 L20 26 L2 16 Z" fill="#d3392c"/>
  <circle cx="20" cy="46" r="9" fill="none" stroke="#d3392c" stroke-width="3.2"/>
  <path d="M20 37 C26 42 26 50 20 55 C14 50 14 42 20 37 Z" fill="#d3392c"/>
  <path d="M20 62 L20 90 M12 68 L12 84 M28 68 L28 84" stroke="#d3392c" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M8 72 L16 72 M24 72 L32 72 M8 80 L16 80 M24 80 L32 80" stroke="#d3392c" stroke-width="2.2" stroke-linecap="round"/>
</svg>`,
  { size: 256 },
);

const CHEEK = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50">
  <path d="M0 22 C30 18 66 8 98 0 C70 18 34 26 0 28 Z" fill="#f2502e"/>
  <path d="M6 33 C34 31 64 27 92 21 C66 38 34 41 6 41 Z" fill="#f2502e"/>
  <path d="M14 45 C38 44 58 40 80 36 C62 48 38 50 14 49 Z" fill="#ffcb3d"/>
</svg>`,
  { size: 256 },
);

const BROW = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 70">
  <path d="M20 0 C28 18 40 34 34 52 C30 64 24 68 20 70 C16 68 10 64 6 52 C0 34 12 18 20 0 Z" fill="#f2502e"/>
  <path d="M20 12 C25 24 31 34 28 46 C26 54 23 58 20 60 C17 58 14 54 12 46 C9 34 15 24 20 12 Z" fill="#ffcb3d"/>
  <ellipse cx="20" cy="44" rx="4" ry="7" fill="#f2502e"/>
</svg>`,
  { size: 192 },
);

const CIRCLE = (() => {
  const petals = Array.from({ length: 9 }, (_, i) => {
    const a = i * 40;
    return `<g transform="rotate(${a})"><path d="M0 -178 C16 -160 16 -138 0 -112 C-16 -138 -16 -160 0 -178 Z" fill="none" stroke="#5ff0ff" stroke-width="3"/>
      <path d="M0 -164 C7 -154 7 -144 0 -134 C-7 -144 -7 -154 0 -164 Z" fill="#b8a4ff"/></g>`;
  }).join("");
  const star = Array.from({ length: 9 }, (_, i) => {
    const a = ((i * 4 * 40 - 90) * Math.PI) / 180;
    return `${(Math.cos(a) * 128).toFixed(1)},${(Math.sin(a) * 128).toFixed(1)}`;
  }).join(" ");
  const nodes = Array.from({ length: 9 }, (_, i) => {
    const a = ((i * 40 - 90) * Math.PI) / 180;
    return `<circle cx="${(Math.cos(a) * 128).toFixed(1)}" cy="${(Math.sin(a) * 128).toFixed(1)}" r="6" fill="#5ff0ff"/>`;
  }).join("");
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const long = i % 2 === 0;
    return `<line x1="0" y1="-192" x2="0" y2="${long ? -206 : -199}" stroke="#5ff0ff" stroke-width="${long ? 3.4 : 2.6}" transform="rotate(${i * 5})"/>`;
  }).join("");
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-210 -210 420 420">
    <circle r="190" fill="none" stroke="#5ff0ff" stroke-width="3.4"/>
    <circle r="183" fill="none" stroke="#b8a4ff" stroke-width="2.6"/>
    <circle r="100" fill="none" stroke="#5ff0ff" stroke-width="3.2"/>
    <circle r="92" fill="none" stroke="#b8a4ff" stroke-width="2.6"/>
    <circle r="30" fill="none" stroke="#5ff0ff" stroke-width="3.2"/>
    ${ticks}${petals}
    <polygon points="${star}" fill="none" stroke="#7be9ff" stroke-width="3"/>
    ${nodes}
    <path d="M0 -22 C14 -12 14 6 0 14 C-14 6 -14 -12 0 -22 Z" fill="#7be9ff"/>
    <path d="M0 -10 C6 -4 6 3 0 7 C-6 3 -6 -4 0 -10 Z" fill="#eaffff"/>
  </svg>`,
    { size: 1024 },
  );
})();

// ---------------------------------------------------------------------------------------------------------------

function smooth(x: number) {
  const t = Math.min(Math.max(x, 0), 1);
  return t * t * (3 - 2 * t);
}
function angleFrom0(deg: number) {
  return Math.abs((((deg + 180) % 360) + 360) % 360 - 180);
}

type Corner = [number, number] | [number, number, "sharp"];
function scaled(outline: Corner[], k: number): Corner[] {
  return outline.map((c): Corner => (c.length === 3 ? [c[0] * k, c[1] * k, "sharp"] : [c[0] * k, c[1] * k]));
}

export default function build() {
  const b = createBuilder({ name: "nineTailedKitsune" });
  const R = rng(11);

  // ===== skeleton =======================================================================================
  const hips = b.joint("hips", { at: [0, 0.69, -0.42], dir: [0, 0.05, 1], role: "spine" });

  const bodyPts: number[][] = [
    [0, 0.68, -0.56],
    [0, 0.7, -0.42],
    [0, 0.72, -0.22],
    [0, 0.75, 0.0],
    [0, 0.78, 0.2],
    [0, 0.82, 0.38],
    [0, 0.98, 0.5],
    [0, 1.12, 0.59],
    [0, 1.2, 0.65],
  ];
  const spinePath = catmull(bodyPts.slice(2, 6));
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "chest"],
    role: "spine",
  });
  const neckPath = catmull(bodyPts.slice(5, 9));
  const neck = b.chain("neck", neckPath, {
    parent: spine.joints[3],
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[2], at: neckPath.at(1), dir: [0, -0.22, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.03, up: -0.045 }),
    aim: head.local({ forward: 0.27, up: -0.062 }),
    role: "jaw",
  });

  // ===== body ===========================================================================================
  const bodyPath = catmull(bodyPts);
  const stationT = bodyPts.map((p) => bodyPath.closestT(p));
  // [rx, ry, shiftY] per body point
  const stationR: number[][] = [
    [0.1, 0.11, 0],
    [0.17, 0.18, -0.005],
    [0.138, 0.165, -0.01],
    [0.15, 0.19, -0.02],
    [0.166, 0.22, -0.03],
    [0.17, 0.235, -0.04],
    [0.125, 0.135, -0.01],
    [0.1, 0.105, 0],
    [0.092, 0.092, 0],
  ];
  const stationAt = (t: number) => {
    let i = 0;
    while (i < stationT.length - 2 && t > stationT[i + 1]) i++;
    const k = smooth((t - stationT[i]) / (stationT[i + 1] - stationT[i]));
    return stationR[i].map((v, j) => v + (stationR[i + 1][j] - v) * k);
  };
  const tChest = stationT[5];
  const coat = cel(
    paint((_p, n, s) => {
      const [t, deg] = s;
      const d = angleFrom0(deg);
      const wob = zigzag(t / 0.045);
      if (t > stationT[1] - 0.01 && t < tChest + 0.02) {
        const half = 14 + 17 * wob;
        if (d < half - 3.5) return VERM;
        if (d < half) return GOLD;
      }
      if (n.y < -0.55) return CREAM;
      return WHITE;
    }),
  );
  const body = b.sweep(bodyPath, (t) => [stationAt(t)[0], stationAt(t)[1]], {
    bone: [hips, spine, neck],
    shift: (t) => [0, stationAt(t)[2]],
    color: coat,
    sides: 10,
  });

  // ===== legs ===========================================================================================
  const SOCK = (top: number) =>
    cel(furEdge(WHITE, PLUM, { by: "position", level: top, teeth: 0.045, period: 0.055, along: [1, 0, 1] }));

  const legSweeps: Record<string, Sweep> = {};
  const pawTips: Record<string, THREE.Vector3> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // front
    const fRoot: number[] = [s * 0.115, 0.7, 0.3];
    const fPts = limb(
      fRoot,
      [s * 0.115, 0.045, 0.37],
      [0.3, 0.3, 0.12],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    const fLeg = b.chain(`legF${side}`, catmull(fPts), {
      parent: spine.joints[3],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `pawF${side}`],
      role: "leg",
      contact: [s * 0.115, 0, 0.4],
    });
    legSweeps[`F${side}`] = b.sweep(fLeg, [0.095, 0.073, 0.054, 0.047, 0.042, 0.035], {
      color: SOCK(0.3),
      sides: 8,
      name: `legF${side}`,
    });
    pawTips[`F${side}`] = fPts[fPts.length - 1].clone();

    // hind
    const hRoot: number[] = [s * 0.13, 0.68, -0.4];
    const hPts = limb(
      hRoot,
      [s * 0.125, 0.045, -0.24],
      [0.3, 0.3, 0.24, 0.12],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
      { sole: [0, 0, 1] },
    );
    const hLeg = b.chain(`legH${side}`, catmull(hPts), {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `ball${side}`, `toe${side}`],
      role: "leg",
      contact: [s * 0.125, 0, -0.26],
    });
    legSweeps[`H${side}`] = b.sweep(hLeg, [0.15, 0.1, 0.065, 0.05, 0.043, 0.037], {
      color: SOCK(0.34),
      sides: 8,
      name: `legH${side}`,
    });
    pawTips[`H${side}`] = hPts[hPts.length - 1].clone();
  }

  // paws: dark toe pads with cream claws
  for (const key of Object.keys(pawTips)) {
    const tip = pawTips[key];
    const sx = tip.x > 0 ? 1 : -1;
    const centre = tip.clone().add(new THREE.Vector3(0, -0.01, key.startsWith("F") ? 0.025 : -0.015));
    b.part(new THREE.SphereGeometry(1, 10, 7), cel(PLUM), {
      at: centre,
      scale: [0.046, 0.034, 0.078],
      name: `paw${key}`,
    });
    for (const dx of [-1, 0, 1]) {
      const toe = centre.clone().add(new THREE.Vector3(dx * 0.027 * sx, -0.004 - 0.0 * dx * dx, 0.066 - Math.abs(dx) * 0.012));
      b.part(new THREE.SphereGeometry(0.019, 6, 5), cel(PLUM), { at: toe, name: `toe${key}` });
      b.part(new THREE.ConeGeometry(0.0085, 0.036, 5), FANG, {
        at: toe.clone().add(new THREE.Vector3(0, -0.004, 0.022)),
        dir: [0, -0.35, 1],
        name: `claw${key}`,
      });
    }
  }

  // gold bracelets on the forelegs, anklets on the hind legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const key of [`F${side}`, `H${side}`]) {
      const leg = legSweeps[key];
      const t = key.startsWith("F") ? 0.72 : 0.86;
      const pt = leg.at(t);
      const loop = b.surface(leg).loop(pt, { lift: 0.006, dir: pt.tangent });
      b.sweep(loop, 0.011, { color: GOLD, sides: 6, name: `bangle${key}` });
      const bead = leg.at(t, 0, 0.018);
      b.part(new THREE.SphereGeometry(0.02, 8, 6), VERM, { at: bead.at, name: `bangleJewel${key}` });
    }
  }

  // ===== head ===========================================================================================
  // The head is authored at fox scale in meters and enlarged by H for the anime proportion.
  const H = 1.22;
  const hp = (o: { forward?: number; up?: number; left?: number }) =>
    head.local({ forward: (o.forward ?? 0) * H, up: (o.up ?? 0) * H, left: (o.left ?? 0) * H });
  const HC = hp({ forward: 0.07, up: 0.0 });
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), cel(WHITE), {
    at: HC,
    scale: [0.118 * H, 0.1 * H, 0.128 * H],
    name: "skull",
  });
  const muzzlePath = catmull([hp({ forward: 0.1, up: 0.0 }), hp({ forward: 0.2, up: -0.022 }), hp({ forward: 0.305, up: -0.042 })]);
  const muzzle = b.sweep(muzzlePath, (t) => [(0.062 - 0.04 * t) * H, (0.056 - 0.032 * t) * H], {
    bone: head,
    color: cel(furEdge(WHITE, CREAM, { axis: [0, 1, 0], level: -0.55, teeth: 0.1, period: 0.022, along: [1, 0, 0] })),
    sides: 10,
    name: "muzzle",
  });
  const chinPath = catmull([hp({ forward: 0.02, up: -0.05 }), hp({ forward: 0.14, up: -0.062 }), hp({ forward: 0.285, up: -0.062 })]);
  b.sweep(chinPath, [0.044 * H, 0.017 * H], { bone: jaw, color: cel(CREAM), sides: 8, name: "lowerJaw" });
  // nose, fangs, tongue
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, {
    at: hp({ forward: 0.312, up: -0.028 }),
    scale: [0.027 * H, 0.02 * H, 0.022 * H],
    bone: head,
    name: "nose",
  });
  b.part(new THREE.SphereGeometry(0.007 * H, 5, 4), "#ffffff", {
    at: hp({ forward: 0.318, up: -0.019, left: 0.008 }),
    bone: head,
    name: "noseGlint",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.007 * H, 0.03 * H, 5), FANG, {
      at: hp({ forward: 0.255, up: -0.068, left: s * 0.017 }),
      dir: [0, -1, 0],
      bone: head,
      name: "fangUp",
    });
    b.part(new THREE.ConeGeometry(0.005 * H, 0.02 * H, 5), FANG, {
      at: hp({ forward: 0.262, up: -0.056, left: s * 0.011 }),
      dir: [0, 1, 0],
      bone: jaw,
      name: "fangLow",
    });
  }
  b.part(new THREE.SphereGeometry(1, 8, 5), cel(PINK), {
    at: hp({ forward: 0.17, up: -0.062 }),
    scale: [0.022 * H, 0.008 * H, 0.07 * H],
    bone: jaw,
    name: "tongue",
  });
  // mouth line
  const faceSkin = b.surface([muzzle, skull]);
  for (const s of [1, -1]) {
    const lip = faceSkin.drape(
      [
        hp({ forward: 0.322, up: -0.05, left: s * 0.006 }),
        hp({ forward: 0.27, up: -0.056, left: s * 0.022 }),
        hp({ forward: 0.2, up: -0.052, left: s * 0.04 }),
        hp({ forward: 0.12, up: -0.04, left: s * 0.062 }),
        hp({ forward: 0.082, up: -0.012, left: s * 0.085 }),
      ],
      { lift: 0.002 },
    );
    b.sweep(lip, 0.0036, { color: INK, sides: 4, bone: head, name: "lip", detail: 0.4 });
    // whiskers
    for (let w = 0; w < 3; w++) {
      const base = hp({ forward: 0.2 - w * 0.01, up: -0.018 - w * 0.012, left: s * 0.043 });
      const tip = hp({ forward: 0.14 - w * 0.06, up: -0.025 - w * 0.07 + 0.03, left: s * (0.21 - w * 0.025) });
      const mid = lerp(base, tip, 0.5);
      mid.y += 0.03;
      b.sweep(catmull([base, mid, tip]), [0.0048, 0.0006], {
        color: cel("#fff4e6"),
        sides: 4,
        bone: head,
        caps: "point",
        name: "whisker",
      });
    }
  }

  // eyes and markings (decals)
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const eyeHit = skin.around(HC).at(s * 41, 9);
    if (!eyeHit) throw new Error("no eye hit");
    b.decal(skin, EYE, { at: eyeHit, size: [0.078 * H, 0.106 * H], mirror: s > 0, roll: -s * 7, lift: 0.003, segments: 8 });
    const cheekHit = skin.around(HC).at(s * 80, -14);
    if (!cheekHit) throw new Error("no cheek hit");
    b.decal(skin, CHEEK, { at: cheekHit, size: [0.12 * H, 0.06 * H], mirror: s < 0, roll: 0, lift: 0.002, segments: 8 });
  }
  const browHit = skin.around(HC).at(0, 38);
  if (!browHit) throw new Error("no forehead hit");
  b.decal(skin, BROW, { at: browHit, size: [0.05 * H, 0.085 * H], lift: 0.002, segments: 8 });

  // forehead crest: gold crescent with a ruby
  const crestHit = skin.around(HC).at(0, 66);
  if (!crestHit) throw new Error("no crest hit");
  const crestAt = crestHit.at.clone().add(new THREE.Vector3(0, 0.005, 0.006));
  const crestOutline: Array<[number, number] | [number, number, "sharp"]> = [
    [-0.05, 0.01],
    [-0.052, 0.04],
    [-0.036, 0.074],
    [-0.012, 0.09, "sharp"],
    [-0.004, 0.066],
    [0, 0.058],
    [0.004, 0.066],
    [0.012, 0.09, "sharp"],
    [0.036, 0.074],
    [0.052, 0.04],
    [0.05, 0.01],
    [0.032, 0.026],
    [0.0, 0.034],
    [-0.032, 0.026],
  ];
  b.extrude(scaled(crestOutline, H), {
    at: crestAt,
    x: [1, 0, 0],
    y: [0, 0.85, 0.5],
    thickness: 0.013,
    bevel: 0.003,
    smoothing: 1,
    color: GOLD,
    bone: head,
    name: "crest",
    detail: 0.5,
  });
  b.part(new THREE.OctahedronGeometry(0.016, 0), VERM, {
    at: crestAt.clone().add(new THREE.Vector3(0, 0.03, 0.022)),
    bone: head,
    name: "crestGem",
  });

  // ears
  const EH = H * 1.1;
  const earOuter: Array<[number, number] | [number, number, "sharp"]> = [
    [-0.056, 0],
    [-0.06, 0.045],
    [-0.044, 0.13],
    [-0.014, 0.215],
    [0.0, 0.265, "sharp"],
    [0.022, 0.205],
    [0.052, 0.115],
    [0.06, 0.045],
    [0.05, 0],
    [0, -0.018],
  ];
  const earInner: Array<[number, number] | [number, number, "sharp"]> = [
    [-0.034, 0.012],
    [-0.034, 0.05],
    [-0.022, 0.12],
    [-0.002, 0.2, "sharp"],
    [0.016, 0.12],
    [0.03, 0.05],
    [0.03, 0.012],
    [0, -0.002],
  ];
  const earPaint = cel(paint((_p, _n, s) => (s[1] > 0.19 * EH ? PLUM : WHITE)));
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const base = hp({ left: s * 0.066, up: 0.068, forward: 0.035 });
    const ear = b.joint(`ear${side}`, {
      parent: head,
      at: base,
      dir: [s * 0.32, 1, -0.12],
      role: "hinge",
    });
    const up: number[] = [s * 0.32, 1, -0.14];
    b.extrude(scaled(earOuter, EH), {
      at: base,
      x: [1, 0, 0],
      y: up,
      thickness: [0.022, 0.008],
      bevel: 0.005,
      smoothing: 1,
      color: earPaint,
      bone: ear,
      name: `ear${side}`,
      detail: 0.5,
    });
    b.extrude(scaled(earInner, EH), {
      at: base.clone().add(new THREE.Vector3(0, 0, 0.013)),
      x: [1, 0, 0],
      y: up,
      thickness: 0.008,
      bevel: 0.002,
      smoothing: 1,
      color: cel(paint((_p, _n, st) => (st[1] > 0.08 * EH ? VERM : CREAM))),
      bone: ear,
      name: `earInner${side}`,
      detail: 0.5,
    });
    // inner ear fluff
    const earFluff = [0, 1, 2, 3].map((i) => {
      const y = (0.02 + i * 0.035) * EH;
      const w = (0.03 - i * 0.006) * EH;
      return frame(
        base.clone().add(new THREE.Vector3(s * (i % 2 ? w : -w) * 0.5 + s * 0.318 * y * 0.5, y, 0.022)),
        [0, 0.4, 1],
        [0, 1, 0],
      );
    });
    b.cards(earFluff, TUFT, { size: [0.04, 0.056], lean: 40, flow: [s * 0.2, 1, 0.3], color: WHITE, bone: ear, sink: 0.1 });
    // gold cuff + dangling tassel earring
    const cuffAt = base.clone().add(new THREE.Vector3(s * 0.318 * 0.06, 0.06, 0));
    b.part(new THREE.TorusGeometry(0.042, 0.0085, 4, 9), GOLD, {
      at: cuffAt,
      dir: [s * 0.32, 1, -0.14],
      bone: ear,
      name: "earCuff",
    });
    b.part(new THREE.SphereGeometry(0.016, 6, 5), VERM, {
      at: cuffAt.clone().add(new THREE.Vector3(s * 0.04, -0.002, 0.012)),
      bone: ear,
      name: "earStud",
    });
    b.cards([frame(cuffAt.clone().add(new THREE.Vector3(s * 0.042, -0.014, 0.014)), [0, 1, 0])], TASSEL, {
      size: [0.032, 0.125],
      lean: 180,
      flow: [0, 0, 1],
      bone: ear,
      sink: 0,
    });
  }

  // cheek ruff
  for (const s of [1, -1]) {
    const hits = skin.scatter(22, {
      rng: rng(5 + (s > 0 ? 1 : 0)),
      minDist: 0.032,
      filter: (h) => s * h.at.x > 0.085 && h.at.y < HC.y + 0.0 && h.n.z < 0.5,
    });
    b.cards(hits, TUFT, {
      size: [0.065, 0.13],
      lean: 78,
      bend: 20,
      flow: [s * 0.45, -0.35, -1],
      vary: 0.25,
      rng: rng(9),
      color: WHITE,
    });
  }

  // ===== neck regalia ===================================================================================
  const bodySkin = b.surface(body);
  const ropeLoop = bodySkin.loop(neck.at(0.22), { lift: 0.014, dir: [0, 0.8, 0.6] });
  b.sweep(ropeLoop, 0.02, {
    color: cel(
      paint((_p, _n, st) => {
        const ph = (((st[1] / 90 + st[0] * 46) % 1) + 1) % 1;
        return ph < 0.5 ? ROPE : CREAM;
      }),
    ),
    sides: 6,
    name: "shimenawa",
  });
  const collarLoop = bodySkin.loop(neck.at(0.5), { lift: 0.009, dir: [0, 0.8, 0.6] });
  b.sweep(collarLoop, 0.012, { color: GOLD, sides: 6, name: "collar" });
  b.along(collarLoop, 14, (at) => b.part(new THREE.SphereGeometry(0.012, 6, 4), VERM, { at: at.at, name: "collarBead" }));
  // shide hanging from the rope
  const shideFrames = [0.3, 0.38, 0.46, 0.54, 0.62, 0.7].map((t) => {
    const p = ropeLoop.at(t);
    return frame(ropeLoop.at(t) ?? p, [0, 1, 0]);
  });
  b.cards(shideFrames, SHIDE, { size: [0.045, 0.14], lean: 180, flow: [0, 0, 1], cross: false, sink: 0 });
  // medallion + magatama on the throat of the collar
  const throat = collarLoop.at(0.5);
  const medal = b.lathe(
    [
      [0, -0.002],
      [0.028, 0],
      [0.03, 0.006],
      [0.022, 0.012],
      [0.012, 0.018],
      [0, 0.02],
    ],
    { at: throat.clone().add(new THREE.Vector3(0, -0.035, 0.02)), axis: [0, 0.25, 1], color: GOLD, segments: 10, bone: neck.joints[0], name: "medal" },
  );
  void medal;
  b.extrude(
    [
      [0, 0],
      [0.014, 0.004],
      [0.022, 0.018],
      [0.018, 0.034],
      [0.004, 0.04],
      [-0.008, 0.034],
      [-0.002, 0.026],
      [0.004, 0.02],
      [-0.006, 0.012],
    ],
    {
      at: throat.clone().add(new THREE.Vector3(-0.01, -0.105, 0.03)),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.016,
      bevel: 0.004,
      smoothing: 1,
      color: JADE,
      bone: neck.joints[0],
      name: "magatama",
      detail: 0.5,
    },
  );
  b.rod(throat.clone().add(new THREE.Vector3(0, -0.05, 0.02)), throat.clone().add(new THREE.Vector3(0, -0.075, 0.03)), 0.004, {
    color: GOLD,
    bone: neck.joints[0],
  });
  b.cards(
    [frame(throat.clone().add(new THREE.Vector3(0.03, -0.045, 0.03)), [0, 1, 0]), frame(throat.clone().add(new THREE.Vector3(-0.03, -0.045, 0.03)), [0, 1, 0])],
    TASSEL,
    { size: [0.03, 0.12], lean: 180, flow: [0, 0, 1], bone: neck.joints[0], sink: 0 },
  );

  // chest ruff
  const ruffHits = bodySkin.scatter(48, {
    rng: rng(21),
    minDist: 0.036,
    filter: (h) => h.at.z > 0.36 && h.at.y > 0.74 && h.n.z > -0.1 && h.n.y < 0.75,
  });
  b.cards(ruffHits, TUFT, {
    size: [0.075, 0.16],
    lean: 55,
    bend: 24,
    flow: [0, -1, -0.15],
    vary: 0.3,
    rng: rng(2),
    color: WHITE,
  });

  // ===== sash (obi) and trailing ribbons ==================================================================
  const sashLoop = bodySkin.loop(spine.joints[1], { lift: 0.014 });
  b.sweep(sashLoop, [0.052, 0.022], {
    section: "box",
    color: cel(paint((_p, _n, st) => ((st[0] * 64) % 1 < 0.13 ? GOLD : INDIGO))),
    name: "sash",
  });
  b.sweep(bodySkin.loop(spine.joints[1].moved([0, 0.0, 0.05]), { lift: 0.03 }), 0.0085, { color: GOLD, sides: 5, name: "sashTrimA" });
  b.sweep(bodySkin.loop(spine.joints[1].moved([0, 0.0, -0.05]), { lift: 0.03 }), 0.0085, { color: GOLD, sides: 5, name: "sashTrimB" });

  const ribbonColor = cel(
    paint((_p, _n, st) => {
      const across = st[1];
      if (across < 0.1 || across > 0.9) return GOLD;
      if (Math.abs(across - 0.5) < 0.035) return CREAM;
      return (st[0] * 16) % 1 < 0.14 ? VERM : INDIGO;
    }),
  );
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sashHit = bodySkin.around([0, 0.75, 0.0]).at(s * 90, 5);
    if (!sashHit) throw new Error("no sash hit");
    const A: number[][] = [];
    const B: number[][] = [];
    for (let i = 0; i <= 7; i++) {
      const u = i / 7;
      const x = s * (0.16 + 0.5 * Math.pow(u, 0.9) + 0.03 * Math.sin(u * 9));
      const z = 0.0 - 0.98 * u;
      const y = 0.76 - 0.18 * Math.sin(u * Math.PI * 0.8) + 0.36 * u * u + 0.035 * Math.sin(u * 11);
      A.push([x, y, z]);
      const phi = u * 85 * DEG;
      const w = 0.19 * (1 - 0.4 * u);
      B.push([x + s * w * Math.sin(phi), y + w * Math.cos(phi), z + 0.03 * Math.sin(u * 7 + 1)]);
    }
    const ribbon = b.chain(`ribbon${side}`, catmull(A), { parent: spine.joints[1], count: 6, role: "tentacle" });
    b.membrane(ribbon, catmull(B), { color: ribbonColor, thickness: 0.008, rows: 3, cols: 24, name: `ribbon${side}` });
    // gold bell and tassel on the ribbon's free end
    const endJoint = ribbon.joints[ribbon.joints.length - 1];
    const endAt = new THREE.Vector3(...(A[7] as [number, number, number]));
    b.part(new THREE.SphereGeometry(0.024, 8, 6), GOLD, { at: endAt, bone: endJoint, name: "ribbonBell" });
    b.cards([frame(endAt, [0, 1, 0])], TASSEL, { size: [0.034, 0.14], lean: 180, flow: [0, 0, 1], bone: endJoint, sink: 0 });
    // gold knot ring + tassel at the sash
    b.part(new THREE.TorusGeometry(0.035, 0.009, 5, 10), GOLD, {
      at: sashHit.at.clone().add(new THREE.Vector3(0, 0.03, 0)),
      dir: [s, 0, 0],
      name: "sashRing",
    });
  }

  // gold bead chain down the spine
  const spineLine = body.line(0, 0.012);
  const chainPath = spineLine.slice(
    spineLine.closestT([0, 0.9, -0.36]),
    spineLine.closestT([0, 0.94, 0.36]),
  );
  b.sweep(chainPath, 0.0075, { color: GOLD, sides: 5, bone: [hips, spine], name: "spineChain" });
  b.along(chainPath, 9, (at) => b.part(new THREE.SphereGeometry(0.017, 6, 4), JADE, { at: at.at, name: "spineBead" }));

  // floating paper charms (ofuda) hovering over the circle
  const ofudaAz = [-150, -14, 14, 150];
  const ofudaR = [1.25, 1.35, 1.35, 1.25];
  const ofudaH = [0.25, 0.4, 0.34, 0.25];
  ofudaAz.forEach((az, i) => {
    const a = az * DEG;
    const pos = new THREE.Vector3(Math.sin(a) * ofudaR[i], ofudaH[i], 0.1 + Math.cos(a) * ofudaR[i]);
    const j = b.joint(`ofuda${i + 1}`, { parent: hips, at: pos, dir: [0, 1, 0], role: "hinge" });
    const inward = [-Math.sin(a), 0, -Math.cos(a)];
    b.cards([frame(pos, [0, 1, 0])], OFUDA, { size: [0.11, 0.25], lean: 6, flow: inward, bone: j, sink: 0 });
  });

  // ===== shoulder / thigh swirl markings ====================================================================
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = bodySkin.around([0, 0.76, 0.24]).at(s * 90, 14);
    if (sh) b.decal(bodySkin, SWIRL, { at: sh, size: [0.2, 0.2], mirror: s < 0, roll: s * 20, lift: 0.0025 });
    const hp = b.surface(legSweeps[`H${side}`]).around([s * 0.14, 0.6, -0.4]).at(s * 90, 22);
    if (hp) b.decal(legSweeps[`H${side}`], SWIRL, { at: hp, size: [0.2, 0.2], mirror: s < 0, roll: s * -15, lift: 0.0025 });
  }

  // leg tufts (elbows, hocks)
  for (const key of Object.keys(legSweeps)) {
    const leg = legSweeps[key];
    const front = key.startsWith("F");
    const hits = b.surface(leg).scatter(14, {
      rng: rng(31 + key.charCodeAt(0) + key.charCodeAt(1)),
      minDist: 0.03,
      filter: (h) => (front ? h.at.y > 0.3 && h.n.z < -0.2 : h.at.y > 0.2 && h.at.y < 0.55 && h.n.z < -0.25),
    });
    b.cards(hits, TUFT, { size: [0.05, 0.11], lean: 60, bend: 20, flow: [0, -1, -0.4], vary: 0.25, rng: rng(4), color: WHITE });
  }

  // rump / haunch tufts
  b.cards(
    bodySkin.scatter(22, {
      rng: rng(8),
      minDist: 0.04,
      filter: (h) => h.at.z < -0.3 && h.at.y < 0.8 && h.n.z < 0.3,
    }),
    TUFT,
    { size: [0.06, 0.13], lean: 62, bend: 20, flow: [0, -0.5, -1], vary: 0.25, rng: rng(3), color: WHITE },
  );

  // ===== nine tails ======================================================================================
  const tailNames = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
  const tailProfile = [0.05, 0.085, 0.118, 0.13, 0.112, 0.066, 0.0];
  const flameFrames: Frame[] = [];
  const sparkFrames: Frame[] = [];
  const tailEnds: Array<{ at: THREE.Vector3; size: number }> = [];
  tailNames.forEach((letter, k) => {
    const u = (k - 4) / 4;
    const a = Math.abs(u);
    const th = u * 70 * DEG;
    const P0 = new THREE.Vector3(u * 0.05, 0.74, -0.55);
    const T = new THREE.Vector3(Math.sin(th) * 0.82, 1.0 + Math.cos(th) * 0.62, -1.1 + (1 - Math.cos(th)) * 0.95);
    const A = P0.clone().add(new THREE.Vector3(u * 0.1, 0.1, -0.2));
    const Bp = P0.clone().lerp(T, 0.52).add(new THREE.Vector3(u * 0.12, 0.0 - 0.02 * a, -0.14 * (1 - a) - 0.05));
    const C = P0.clone().lerp(T, 0.84).add(new THREE.Vector3(u * 0.14, 0.07, -0.02));
    const tip = T.clone().add(new THREE.Vector3(u * 0.18, 0.06, 0.06));
    const path = catmull([P0, A, Bp, C, tip]);
    const chain = b.chain(`tail${letter}`, path, { parent: hips, count: 5, role: "tail", names: (i) => `tail${letter}${i + 1}` });
    const scale = 1 - 0.14 * a;
    const radii = tailProfile.map((r) => r * scale);
    const bandA = 0.4;
    const bandB = 0.66;
    const paintTail = cel(
      paint((_p, _n, s) => {
        const [t, deg] = s;
        const z = zigzag(deg / 40 + (k % 2) * 0.3);
        if (t > bandA + 0.014 * z && t < bandB - 0.014 * (1 - z) && t > 0.1) {
          if (t > bandA + 0.014 * z + 0.014 && t < bandB - 0.014 * (1 - z) - 0.014) return VERM;
          return GOLD;
        }
        if (t > 0.86) return cel("#c9f6ff", "#9bc6f5");
        return WHITE;
      }),
    );
    const sweep = b.sweep(chain, radii, { color: paintTail, sides: 9, name: `tail${letter}` });
    // fur tufts along the tail
    const hits = b.surface(sweep).scatter(60, {
      rng: rng(100 + k),
      minDist: 0.04,
      filter: (h) => path.closestT(h.at) > 0.08,
    });
    const tailColor = paint((p, n) => {
      const t = path.closestT(p);
      const z = 0;
      void z;
      void n;
      if (t > bandA + 0.02 && t < bandB - 0.02 && t > 0.1) return VERM;
      if (t > 0.86) return "#c9f6ff";
      return WHITE;
    });
    b.cards(hits, TUFT, {
      size: [0.05, 0.11],
      lean: 70,
      bend: 20,
      flow: (f) => path.tangentAt(path.closestT(f.at)).toArray(),
      vary: 0.3,
      rng: rng(200 + k),
      color: tailColor,
    });
    // gold ring near the root with a hanging tassel
    const prof = (t: number) => {
      const x = Math.min(Math.max(t, 0), 1) * 6;
      const i = Math.min(Math.floor(x), 5);
      return (tailProfile[i] + (tailProfile[i + 1] - tailProfile[i]) * (x - i)) * scale;
    };
    const cp = chain.at(0.22);
    const rr = prof(0.22) * 1.06 + 0.012;
    const items = b.ring(cp, { count: 9, radius: rr }).items;
    b.sweep(catmull(items, { closed: true }), 0.0125, { color: GOLD, sides: 5, name: `tailRing${letter}` });
    b.cards([frame(cp.at.clone().add(new THREE.Vector3(0, -rr, 0)), [0, 1, 0])], TASSEL, {
      size: [0.034, 0.135],
      lean: 180,
      flow: [0, 0, 1],
      sink: 0,
      bone: cp.bone ?? undefined,
    });
    // a second, thinner gold ring below the flame
    const cq = chain.at(0.8);
    const rq = prof(0.8) * 1.08 + 0.008;
    b.sweep(catmull(b.ring(cq, { count: 8, radius: rq }).items, { closed: true }), 0.009, {
      color: GOLD,
      sides: 5,
      name: `tailTipRing${letter}`,
    });
    // spirit flame on the tip
    tailEnds.push({ at: path.at(1), size: 0.95 + 0.25 * (1 - a) });
    flameFrames.push(frame(chain.at(1), [0, 1, 0]));
    for (let i = 0; i < 4; i++) {
      const o = path.at(1).clone().add(new THREE.Vector3((R() - 0.5) * 0.4, 0.12 + R() * 0.4, (R() - 0.5) * 0.4));
      sparkFrames.push(frame(o, [0, 1, 0]));
    }
  });
  tailEnds.forEach((e, i) => {
    glow(
      b.cards([flameFrames[i]], FLAME, { size: [0.22 * e.size, 0.44 * e.size], lean: 0, flow: [0, 0, -1], cross: true, sink: 0.12 }),
      1.25,
    );
  });
  glow(b.cards(sparkFrames, SPARK, { size: [0.035, 0.05], lean: 0, flow: [0, 0, -1], cross: true, vary: 0.4, rng: rng(77), spin: 180 }), 1.2);

  // ===== fox-fire wisps (hitodama) and summoning circle ======================================================
  const wispAz = [-118, -88, -62, -40, 40, 64, 90, 118];
  const wispH = [0.55, 1.1, 0.4, 0.62, 0.9, 0.38, 1.3, 0.72];
  const wispR = [1.05, 1.22, 1.32, 1.18, 1.2, 1.32, 1.14, 1.02];
  wispAz.forEach((az, i) => {
    const a = az * DEG;
    const pos = new THREE.Vector3(Math.sin(a) * wispR[i], wispH[i], 0.1 + Math.cos(a) * wispR[i]);
    const w = b.joint(`wisp${i + 1}`, { parent: hips, at: pos, dir: [0, 1, 0], role: "hinge" });
    const sz = 0.8 + 0.2 * Math.sin(i * 2.3);
    glow(b.part(new THREE.IcosahedronGeometry(0.052 * sz, 1), FLAME_CORE, { bone: w, at: pos, name: "wispOrb" }), 1.4);
    glow(
      b.cards([frame(pos.clone().add(new THREE.Vector3(0, 0.03 * sz, 0)), [0, 1, 0])], FLAME, {
        size: [0.2 * sz, 0.4 * sz],
        lean: 0,
        flow: [0, 0, -1],
        cross: true,
        sink: 0.2,
        bone: w,
      }),
      1.2,
    );
  });
  // fire licking at the paws
  for (const key of Object.keys(pawTips)) {
    const t = pawTips[key];
    glow(
      b.cards([frame(new THREE.Vector3(t.x, 0.01, t.z + (key.startsWith("F") ? 0.0 : -0.04)), [0, 1, 0])], FLAME, {
        size: [0.1, 0.2],
        lean: 0,
        flow: [0, 0, -1],
        cross: true,
        sink: 0.1,
      }),
      1.0,
    );
  }
  glow(
    b.part(new THREE.PlaneGeometry(3.1, 3.1), "#ffffff", {
      at: [0, 0.004, -0.1],
      dir: [0, 1, 0],
      up: [0, 0, -1],
      axis: "z",
      bone: hips,
      texture: CIRCLE,
      name: "summoningCircle",
    }),
    1.0,
  );

  return b.root;
}
