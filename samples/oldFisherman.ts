// Old Fisherman: a weathered sea-dog in a yellow oilskin coat over a cable-knit sweater, flat low-poly.
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Chain, Joint } from "../src/skeleton";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { catmull, polyline } from "../src/path";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Old Fisherman",
  description:
    "A 1.75 m weathered fisherman in a knitted cap, grey beard and pipe, yellow oilskin coat over a cable-knit sweater, rubber boots, rope coil on his shoulder, rod in one hand, lantern in the other, and a crate of fish at his feet.",
};

// ---------------------------------------------------------------- palette
const YEL = "#d3a21f";
const YEL_D = "#a27712";
const WOOL = "#d8ceb0";
const NAVY = "#3f5367";
const BOOT = "#2b3a30";
const BOOT_L = "#46604e";
const SOLE = "#8a3b2c";
const SKIN = "#c68f6a";
const NOSE = "#c7705a";
const GREY = "#b4b2aa";
const GREY_L = "#dcdbd3";
const CAP = "#2e4566";
const RUST = "#b5482e";
const WOOD = "#9a7447";
const WOOD_D = "#6e4f2e";
const ROPE = "#b89a62";
const IRON = "#2b2b2e";
const BRIAR = "#5a3520";
const CORK = "#b98a54";
const ROD = "#5b4630";
const STEEL = "#8d8f94";
const FISH_BACK = "#46707a";
const FISH_BELLY = "#c9d6da";
const ICE = "#dcecf2";
const RED = "#c2382c";
const CREAM = "#e9e0c8";

type P = THREE.Vector3;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const lerpTable = (table: ReadonlyArray<readonly number[]>, y: number) => {
  if (y <= table[0][0]) return table[0].slice(1);
  for (let i = 1; i < table.length; i++) {
    if (y <= table[i][0]) {
      const k = (y - table[i - 1][0]) / (table[i][0] - table[i - 1][0]);
      return table[i].slice(1).map((v, j) => table[i - 1][j + 1] + (v - table[i - 1][j + 1]) * k);
    }
  }
  return table[table.length - 1].slice(1);
};
const basisQuat = (x: P, y: P, z: P) =>
  new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));

// ---------------------------------------------------------------- drawings
function drawings() {
  // knitted cap: vertical ribs with V stitches, a cream and a rust stripe low on the dome
  const cap = svg(
    `<svg viewBox="0 0 96 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="96" height="48" fill="${CAP}"/>
      <g stroke="#243652" stroke-width="0.7">${Array.from({ length: 48 }, (_, i) => `<line x1="${i * 2 + 1}" y1="0" x2="${i * 2 + 1}" y2="48"/>`).join("")}</g>
      <rect y="6" width="96" height="5" fill="${CREAM}"/>
      <rect y="14" width="96" height="3" fill="${RUST}"/>
      <g stroke="#4a6a93" stroke-width="0.8" fill="none">${Array.from({ length: 6 }, (_, r) => Array.from({ length: 24 }, (_, i) => `<path d="M${i * 4} ${20 + r * 4} l2 3 l2 -3"/>`).join("")).join("")}</g>
    </svg>`,
    { size: 192 },
  );
  // folded cuff: 2x2 rib
  const cuff = svg(
    `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="16" fill="${CAP}"/>
      ${Array.from({ length: 16 }, (_, i) => `<rect x="${i * 4}" width="2" height="16" fill="#3c5a84"/>`).join("")}
      <rect y="0" width="64" height="1.2" fill="#243652"/><rect y="14.8" width="64" height="1.2" fill="#243652"/>
    </svg>`,
    { size: 128 },
  );
  // sweater rib for turtleneck and cuffs
  const wool = svg(
    `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="16" fill="${WOOL}"/>
      ${Array.from({ length: 16 }, (_, i) => `<rect x="${i * 4}" width="2" height="16" fill="#b9ae8d"/>`).join("")}
    </svg>`,
    { size: 128 },
  );
  // cable-knit panel for the open coat front (portrait)
  const cable = svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="128" fill="${WOOL}"/>
      ${[8, 56]
        .map(
          (x) =>
            `<rect x="${x - 4}" width="8" height="128" fill="#c2b797"/><g stroke="#a89c7c" stroke-width="1.2">${Array.from({ length: 16 }, (_, r) => `<line x1="${x - 4}" y1="${r * 8 + 2}" x2="${x + 4}" y2="${r * 8 + 6}"/>`).join("")}</g>`,
        )
        .join("")}
      ${[20, 44]
        .map((x) =>
          Array.from(
            { length: 8 },
            (_, r) =>
              `<path d="M${x} ${r * 16} q-9 8 0 16 q9 8 0 16" fill="none" stroke="#a89c7c" stroke-width="3.4"/><path d="M${x} ${r * 16} q-9 8 0 16" fill="none" stroke="#efe8d2" stroke-width="1.4" transform="translate(-0.4 0)"/>`,
          ).join(""),
        )
        .join("")}
      <g>${Array.from({ length: 8 }, (_, r) => `<path d="M32 ${r * 16 + 8} l5 -4 l-5 -4 l-5 4 z" fill="#c2b797" stroke="#a89c7c" stroke-width="1.6" transform="translate(0 ${r * 16 - r * 16})"/>`).join("")}</g>
    </svg>`,
    { size: 256 },
  );
  // face: squinting eyes, crow's feet, forehead lines, ruddy cheeks (1 unit = 1 mm)
  const face = svg(
    `<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
      <g fill="#c9705a"><ellipse cx="34" cy="78" rx="17" ry="11"/><ellipse cx="126" cy="78" rx="17" ry="11"/></g>
      <g stroke="#8c5640" stroke-width="2.2" fill="none" stroke-linecap="round">
        <path d="M40 10 q40 -6 80 0"/><path d="M36 20 q44 -7 88 0"/><path d="M46 29 q34 -5 68 0"/>
        <path d="M14 46 l-10 -5 M14 52 l-12 2 M16 58 l-10 7"/>
        <path d="M146 46 l10 -5 M146 52 l12 2 M144 58 l10 7"/>
        <path d="M40 66 q14 7 28 0 M92 66 q14 7 28 0"/>
        <path d="M70 46 q-4 18 -2 28 M90 46 q4 18 2 28"/>
      </g>
      ${[50, 110]
        .map(
          (x) => `<g><path d="M${x - 15} 50 q15 -13 30 0 q-15 9 -30 0z" fill="#f0e6d2"/>
        <circle cx="${x}" cy="49.5" r="5.2" fill="#3b2a1f"/><circle cx="${x + 1.5}" cy="47.8" r="1.5" fill="#f0e6d2"/>
        <path d="M${x - 17} 50 q17 -17 34 0" fill="none" stroke="#6b4030" stroke-width="4" stroke-linecap="round"/>
        <path d="M${x - 12} 55 q12 7 24 0" fill="none" stroke="#8c5640" stroke-width="2" stroke-linecap="round"/></g>`,
        )
        .join("")}
    </svg>`,
    { size: 640 },
  );
  // grey beard strands for cards
  const strands = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 64 q-6 -30 -2 -60 q6 26 8 60z" fill="${GREY}"/>
      <path d="M12 64 q2 -34 10 -62 q4 30 -2 62z" fill="${GREY_L}"/>
      <path d="M20 64 q4 -24 10 -44 q0 26 -6 44z" fill="#9a9992"/>
    </svg>`,
    { size: 128 },
  );
  // pipe smoke puffs (flat grey polygons)
  const smoke = svg(
    `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
      <polygon points="26,96 18,86 20,74 30,68 40,74 40,88 34,96" fill="#d5d6d8"/>
      <polygon points="22,72 14,62 18,50 30,46 42,52 42,66 34,72" fill="#e3e4e6"/>
      <polygon points="34,52 28,42 32,30 44,26 54,32 54,44 46,52" fill="#eeeff0"/>
      <polygon points="40,28 36,20 40,10 50,6 58,12 56,22 48,28" fill="#f6f6f7"/>
    </svg>`,
    { size: 192 },
  );
  // rope twist (diagonal strands) for the coil
  const rope = svg(
    `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="16" fill="${ROPE}"/>
      ${Array.from({ length: 8 }, (_, i) => `<polygon points="${i * 8},0 ${i * 8 + 4},0 ${i * 8 + 12},16 ${i * 8 + 8},16" fill="#8a6f3f"/>`).join("")}
    </svg>`,
    { size: 128 },
  );
  // fringe of a rope end
  const fringe = svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0 l-6 32 l4 -6 z" fill="${ROPE}"/><path d="M16 0 l0 32 l4 -10 z" fill="#8a6f3f"/><path d="M16 0 l8 28 l-12 -8 z" fill="#d1b77f"/>
    </svg>`,
    { size: 96 },
  );
  // wooden planks for crate walls
  const planks = svg(
    `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="32" fill="${WOOD}"/>
      <rect y="10" width="64" height="1.6" fill="${WOOD_D}"/><rect y="21" width="64" height="1.6" fill="${WOOD_D}"/>
      <g stroke="#83603a" stroke-width="0.8">
        <line x1="4" y1="3" x2="30" y2="3"/><line x1="20" y1="7" x2="52" y2="7"/><line x1="8" y1="15" x2="40" y2="15"/>
        <line x1="30" y1="18" x2="60" y2="18"/><line x1="2" y1="26" x2="24" y2="26"/><line x1="26" y1="29" x2="58" y2="29"/>
      </g>
      <g fill="#3b2b1a"><circle cx="3" cy="5" r="1"/><circle cx="61" cy="5" r="1"/><circle cx="3" cy="16" r="1"/><circle cx="61" cy="16" r="1"/><circle cx="3" cy="27" r="1"/><circle cx="61" cy="27" r="1"/></g>
    </svg>`,
    { size: 192 },
  );
  // stencil on crate side
  const stencil = svg(
    `<svg viewBox="0 0 128 48" xmlns="http://www.w3.org/2000/svg">
      <text x="64" y="30" font-family="Impact, Arial Black, sans-serif" font-weight="900" font-size="26" text-anchor="middle" fill="#1f2a33">HERRING</text>
      <text x="64" y="44" font-family="Arial, sans-serif" font-weight="700" font-size="11" text-anchor="middle" fill="#1f2a33">No. 7  -  LK 147</text>
      <path d="M8 6 q14 -8 28 0 l8 -4 l0 8 l-8 -4 q-14 8 -28 0z" fill="#1f2a33"/>
      <path d="M120 6 q-14 -8 -28 0 l-8 -4 l0 8 l8 -4 q14 8 28 0z" fill="#1f2a33"/>
    </svg>`,
    { size: 384 },
  );
  // hurricane lantern glass: six flame windows
  const glass = svg(
    `<svg viewBox="0 0 96 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="96" height="32" fill="#ffb347"/>
      ${Array.from({ length: 6 }, (_, i) => `<path d="M${i * 16 + 8} 4 q6 10 3 18 q-3 7 -3 7 q-6 0 -6 -8 q0 -8 6 -17z" fill="#ffe9a0"/><path d="M${i * 16 + 8} 12 q3 6 1.6 11 q-1.6 4 -1.6 4 q-3 -1 -3 -5 q0 -5 3 -10z" fill="#fff8d6"/>`).join("")}
    </svg>`,
    { size: 192 },
  );
  // coat weathering: salt streaks and stains
  const stains = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="8,10 30,6 44,16 38,30 20,34 6,24" fill="${YEL_D}" opacity="0.85"/>
      <polygon points="60,50 82,44 94,56 88,74 70,78 56,66" fill="${YEL_D}" opacity="0.85"/>
      <polygon points="30,70 46,64 52,78 42,92 26,90" fill="#e3bd45"/>
      <polygon points="70,8 90,12 86,26 72,24" fill="#e3bd45"/>
      <g stroke="#ecd98f" stroke-width="2" stroke-linecap="round"><line x1="14" y1="44" x2="40" y2="44"/><line x1="18" y1="50" x2="52" y2="50"/><line x1="10" y1="56" x2="34" y2="56"/></g>
    </svg>`,
    { size: 256 },
  );
  // boat number on the back
  const boatNo = svg(
    `<svg viewBox="0 0 160 80" xmlns="http://www.w3.org/2000/svg">
      <text x="80" y="44" font-family="Impact, Arial Black, sans-serif" font-weight="900" font-size="44" text-anchor="middle" fill="#2a2620">LK 147</text>
      <text x="80" y="68" font-family="Arial, sans-serif" font-weight="700" font-size="17" text-anchor="middle" fill="#2a2620">SEA WOLF</text>
      <g fill="${YEL}"><rect x="20" y="14" width="18" height="2"/><rect x="92" y="28" width="22" height="2"/><rect x="44" y="52" width="16" height="2"/><rect x="120" y="36" width="14" height="2"/></g>
    </svg>`,
    { size: 384 },
  );
  // pocket with flap and stitches
  const pocket = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="60" height="58" fill="#c69319"/>
      <rect x="2" y="4" width="60" height="22" fill="#b98616"/>
      <g stroke="${YEL_D}" stroke-width="2" fill="none" stroke-dasharray="4 3"><rect x="5" y="7" width="54" height="52"/></g>
      <rect x="28" y="20" width="8" height="10" fill="${IRON}"/>
      <rect x="2" y="26" width="60" height="2" fill="${YEL_D}"/>
    </svg>`,
    { size: 192 },
  );
  // trouser knee patch
  const patch = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <polygon points="8,6 58,4 60,56 6,60" fill="#4a5664"/>
      <g stroke="#9aa6b2" stroke-width="2" fill="none" stroke-dasharray="4 3"><polygon points="12,10 54,8 56,52 10,55"/></g>
      <g stroke="#232c36" stroke-width="2"><line x1="20" y1="22" x2="44" y2="20"/><line x1="18" y1="34" x2="46" y2="33"/></g>
    </svg>`,
    { size: 128 },
  );
  // boot grime and scuffs
  const grime = svg(
    `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
      <polygon points="0,50 0,36 10,28 18,38 28,26 38,36 50,24 62,38 72,28 84,40 92,30 100,38 100,50" fill="#5a4a36"/>
      <polygon points="14,14 30,10 36,18 22,22" fill="#4c6152"/>
      <polygon points="60,8 78,6 82,14 66,16" fill="#4c6152"/>
    </svg>`,
    { size: 256 },
  );
  // mackerel stripes seen from above
  const mackerel = svg(
    `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#1f3f47" stroke-width="3" stroke-linecap="round">
        ${Array.from({ length: 9 }, (_, i) => `<path d="M${24 + i * 10} 4 q4 6 0 12 q-4 6 0 12"/>`).join("")}
      </g>
    </svg>`,
    { size: 240 },
  );
  // elbow patch / darker stitched oval
  const elbow = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <polygon points="10,10 54,8 58,50 14,56" fill="${YEL_D}"/>
      <g stroke="#e3bd45" stroke-width="2" fill="none" stroke-dasharray="4 3"><polygon points="14,14 50,12 54,46 18,51"/></g>
    </svg>`,
    { size: 128 },
  );
  // strands of kelp hanging off the crate
  const kelp = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
      <polygon points="14,0 20,0 22,14 18,26 24,40 20,52 16,64 12,50 14,38 10,26 14,12" fill="#4d6b3a"/>
      <polygon points="20,0 24,4 26,18 22,30 26,44 22,54 20,52 24,40 18,26 22,14" fill="#6f8a4a"/>
      <polygon points="6,10 12,14 14,30 10,44 6,34 4,22" fill="#3c5530"/>
    </svg>`,
    { size: 128 },
  );
  // salt bloom on oilskin trousers
  const salt = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="10,14 34,8 46,22 36,38 14,36" fill="#5d7489"/>
      <polygon points="58,44 82,38 92,54 80,70 60,66" fill="#5d7489"/>
      <polygon points="20,60 40,54 48,72 30,88 14,78" fill="#36485a"/>
      <polygon points="64,8 84,12 80,26 66,24" fill="#36485a"/>
    </svg>`,
    { size: 192 },
  );
  // tide line and drips on rubber boots
  const tide = svg(
    `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
      <polygon points="0,8 10,2 20,10 30,3 40,11 50,2 60,10 70,3 80,11 90,2 100,8 100,18 0,18" fill="#8fa693"/>
      <polygon points="14,18 20,18 17,34" fill="#8fa693"/><polygon points="52,18 60,18 56,38" fill="#8fa693"/><polygon points="82,18 88,18 85,30" fill="#8fa693"/>
    </svg>`,
    { size: 192 },
  );
  return {
    cap,
    cuff,
    wool,
    cable,
    face,
    strands,
    smoke,
    rope,
    fringe,
    planks,
    stencil,
    glass,
    stains,
    boatNo,
    pocket,
    patch,
    grime,
    mackerel,
    elbow,
    kelp,
    salt,
    tide,
  };
}

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "oldFisherman", paintSize: 512 });
  const T = drawings();
  const rand = rng(11);

  // ---- skeleton: hips, spine, neck, head, jaw
  const hips = b.joint("hips", { at: [0, 0.93, 0], role: "spine" });
  const spine = b.chain("spine", polyline([V(0, 0.93, 0), V(0, 1.06, 0.005), V(0, 1.2, 0.01), V(0, 1.35, 0.01)]), {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const chest = spine.joints[2];
  const neck = b.chain("neck", catmull([V(0, 1.35, 0.01), V(0, 1.425, 0.015), V(0, 1.5, 0.025)]), {
    parent: chest,
    names: ["neck1", "neck2"],
    role: "neck",
    count: 2,
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.5, 0.025], dir: [0, 1, 0.03], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.565, -0.005], aim: [0, 1.525, 0.1], role: "jaw" });

  // ---- legs: hip, knee, ankle (foot tip)
  const legs = {} as Record<string, { chain: Chain; pts: P[]; knee: Joint; ankle: Joint }>;
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb(V(s * 0.095, 0.9, 0), V(s * 0.105, 0.085, 0), [0.415, 0.41], [0, 0, 1]);
    const chain = b.chain(`leg${side}`, polyline(pts), {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    legs[side] = { chain, pts, knee: chain.joints[1], ankle: chain.tip ?? chain.joints[2] };
  }

  // ---- arms held out: shoulder, elbow, hand
  const arms = {} as Record<string, { chain: Chain; sh: P; el: P; wr: P; hand: Joint; f: P }>;
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = V(s * 0.225, 1.37, 0);
    const el = sh.clone().add(
      V(s * 0.86, -0.5, 0.06)
        .normalize()
        .multiplyScalar(0.29),
    );
    const f = V(s * 0.84, -0.42, 0.34).normalize();
    const wr = el.clone().addScaledVector(f, 0.26);
    const chain = b.chain(`arm${side}`, polyline([sh, el, wr]), {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `hand${side}`],
      role: "arm",
    });
    arms[side] = { chain, sh, el, wr, hand: chain.tip ?? chain.joints[2], f };
  }

  // ---- torso: oilskin coat with the sweater showing through the open front
  const COAT = [
    [0.72, 0.24, 0.195],
    [0.85, 0.215, 0.175],
    [1.0, 0.2, 0.14],
    [1.15, 0.21, 0.145],
    [1.3, 0.225, 0.15],
    [1.38, 0.215, 0.14],
    [1.42, 0.12, 0.1],
    [1.45, 0.07, 0.06],
  ] as const;
  const coatPath = polyline([V(0, 0.72, 0), V(0, 1.06, 0.005), V(0, 1.45, 0.012)]);
  const coat = b.sweep(
    coatPath,
    (t) => {
      const [rx, ry] = lerpTable(COAT, 0.72 + t * 0.73);
      return [rx, ry] as const;
    },
    {
      bone: spine,
      sides: 8,
      smooth: false,
      caps: { start: "flat", end: "flat" },
      color: YEL,
      sectors: [[158, 202, WOOL, 0.3, 0.98]],
    },
  );

  // ================================================================ head
  const skull = b.part(new THREE.SphereGeometry(1, 9, 6), SKIN, {
    bone: head,
    at: [0, 1.595, 0],
    scale: [0.088, 0.1, 0.098],
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.13, 0.07, 0.12), SKIN, { bone: jaw, at: [0, 1.51, 0.045], flat: true });
  b.decal(skull, T.face, { at: [0, 1.6, 0.1], dir: [0, 0, 1], size: [0.16, 0.1], segments: [16, 10], bone: head });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 5, 4), SKIN, {
      bone: head,
      at: [s * 0.088, 1.59, -0.005],
      scale: [0.012, 0.03, 0.022],
      flat: true,
    });
    b.part(new THREE.BoxGeometry(0.052, 0.015, 0.022), GREY, {
      bone: head,
      at: [s * 0.038, 1.628, 0.09],
      rotation: [-8, 0, -12 * s],
      flat: true,
    });
  }
  b.part(new THREE.SphereGeometry(1, 6, 4), NOSE, {
    bone: head,
    at: [0, 1.578, 0.106],
    scale: [0.024, 0.032, 0.03],
    flat: true,
  });
  b.part(new THREE.SphereGeometry(1, 5, 4), SKIN, {
    bone: head,
    at: [0, 1.603, 0.094],
    scale: [0.014, 0.028, 0.02],
    flat: true,
  });

  // knitted cap with folded cuff and pom
  b.part(new THREE.SphereGeometry(1, 12, 7, 0, Math.PI * 2, 0, Math.PI * 0.56), CAP, {
    bone: head,
    at: [0, 1.665, -0.008],
    scale: [0.108, 0.072, 0.112],
    texture: T.cap,
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(1, 1, 1, 12), CAP, {
    bone: head,
    at: [0, 1.668, -0.006],
    scale: [0.112, 0.05, 0.118],
    texture: T.cuff,
    flat: true,
  });
  b.part(new THREE.IcosahedronGeometry(0.026, 0), RUST, { bone: head, at: [0, 1.725, -0.012], flat: true });

  // grey hair under the cap
  const hairHits = b
    .surface(skull)
    .scatter(18, { rng: rand, minDist: 0.03, filter: (h) => h.at.y < 1.64 && h.at.y > 1.52 && h.n.z < 0.35 });
  b.cards(hairHits, T.strands, {
    size: [0.028, 0.05],
    lean: 60,
    flow: [0, -1, -0.2],
    vary: 0.25,
    rng: rand,
    bone: head,
  });
  const hair = b.part(new THREE.SphereGeometry(1, 8, 5), GREY, {
    bone: head,
    at: [0, 1.585, -0.022],
    scale: [0.093, 0.075, 0.092],
    flat: true,
  });
  const locks = b
    .surface(hair)
    .scatter(24, { rng: rand, minDist: 0.03, filter: (h) => h.n.z < 0.1 && h.at.y < 1.6 && h.at.y > 1.53 });
  b.cards(locks, T.strands, {
    size: [0.045, 0.085],
    lean: 20,
    bend: 10,
    flow: [0, -1, -0.1],
    vary: 0.25,
    rng: rand,
    bone: head,
  });

  // beard: a bib on the jaw, whiskers on the cheeks, a drooping moustache
  const bib = b.loft(
    [
      { at: [0, 1.535, 0.07], w: 0.17, h: 0.07 },
      { at: [0, 1.49, 0.096], w: 0.17, h: 0.1 },
      { at: [0, 1.44, 0.108], w: 0.12, h: 0.1 },
      { at: [0, 1.385, 0.1], w: 0.045, h: 0.05 },
    ],
    { bone: jaw, color: GREY, sides: 6, smooth: false, caps: { start: "flat", end: "point" } },
  );
  for (const s of [1, -1]) {
    b.sweep(
      catmull([V(s * 0.085, 1.572, 0.01), V(s * 0.08, 1.545, 0.04), V(s * 0.065, 1.515, 0.075)]),
      [0.019, 0.017],
      {
        bone: head,
        color: GREY,
        sides: 6,
        smooth: false,
      },
    );
    b.sweep(
      catmull([V(s * 0.004, 1.543, 0.108), V(s * 0.036, 1.538, 0.112), V(s * 0.066, 1.512, 0.098)]),
      [0.018, 0.01],
      {
        bone: head,
        color: GREY_L,
        sides: 5,
        smooth: false,
      },
    );
  }
  const beardHits = b
    .surface(bib)
    .scatter(26, { rng: rand, minDist: 0.035, filter: (h) => h.n.z > -0.2 && h.at.y < 1.5 });
  b.cards(beardHits, T.strands, {
    size: [0.04, 0.05],
    lean: 60,
    bend: 10,
    flow: [0, -1, 0.3],
    vary: 0.3,
    rng: rand,
    bone: jaw,
  });

  // pipe
  const pipeStem = [V(0.032, 1.536, 0.112), V(0.05, 1.528, 0.16), V(0.058, 1.52, 0.2)];
  b.sweep(catmull(pipeStem), 0.0055, { bone: jaw, color: IRON, sides: 4, smooth: false, detail: 0.6 });
  b.lathe(
    [
      [0, 0],
      [0.013, 0],
      [0.02, 0.01],
      [0.023, 0.03],
      [0.021, 0.044],
      [0.015, 0.042],
      [0, 0.046],
    ],
    { at: [0.06, 1.51, 0.212], segments: 6, bone: jaw, color: BRIAR },
  );
  glow(
    b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.004, 8), "#ff8a3c", {
      bone: jaw,
      at: [0.06, 1.549, 0.212],
      flat: true,
    }),
    1.4,
  );
  const smokeFrames = [0, 1].map((i) => frame([0.06 + i * 0.012, 1.56 + i * 0.075, 0.212 + i * 0.012], [0, 1, 0]));
  b.cards(smokeFrames, T.smoke, { size: [0.07, 0.1], flow: [0, 0, 1], cross: true, rng: rand, bone: jaw });

  // ================================================================ legs and boots
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const { chain, pts, knee, ankle } = legs[side];
    const pants = b.sweep(chain, [0.098, 0.092, 0.09], {
      color: NAVY,
      sides: 6,
      smooth: false,
      from: 0.15,
      to: 0.6,
      caps: { start: "flat", end: "none" },
    });
    const shinAt = (y: number) => pts[1].clone().lerp(pts[2], (pts[1].y - y) / (pts[1].y - pts[2].y));
    const shaft = b.sweep(polyline([shinAt(0.4), shinAt(0.1)]), [0.088, 0.072], {
      bone: knee,
      color: BOOT,
      sides: 6,
      smooth: false,
      caps: { start: "flat", end: "flat" },
    });
    b.part(new THREE.CylinderGeometry(0.098, 0.092, 0.04, 6), BOOT_L, { bone: knee, at: shinAt(0.395), flat: true });
    const x0 = s * 0.105;
    b.extrude(
      [
        [-0.095, 0],
        [0.31, 0],
        [0.318, 0.028],
        [-0.095, 0.03],
      ],
      { at: [x0, 0, 0], thickness: 0.136, bevel: 0.004, bone: ankle, color: SOLE },
    );
    const foot = b.extrude(
      [
        [-0.08, 0.03],
        [0.28, 0.03],
        [0.305, 0.05],
        [0.305, 0.085],
        [0.2, 0.118],
        [0.07, 0.175],
        [-0.07, 0.175],
        [-0.087, 0.09],
      ],
      { at: [x0, 0, 0], thickness: 0.13, bevel: 0.012, bone: ankle, color: BOOT },
    );
    b.decal(foot, T.grime, {
      at: [x0 + s * 0.2, 0.07, 0.11],
      dir: [s, 0, 0],
      size: [0.3, 0.12],
      segments: [12, 5],
      bone: ankle,
    });
    b.decal(shaft, T.grime, {
      at: [shinAt(0.2).x + s * 0.2, 0.2, shinAt(0.2).z],
      dir: [s, 0, 0],
      size: [0.18, 0.12],
      segments: [8, 5],
      bone: knee,
    });
    for (const dz of [0.2, -0.2]) {
      b.decal(pants, T.salt, {
        at: [pts[0].x, 0.62, dz],
        dir: [0, 0, -(-Math.sign(dz))],
        size: [0.16, 0.16],
        segments: 6,
        mirror: dz < 0,
      });
      b.decal(shaft, T.tide, {
        at: [shinAt(0.3).x, 0.3, dz],
        dir: [0, 0, -(-Math.sign(dz))],
        size: [0.17, 0.07],
        segments: [8, 3],
        mirror: dz < 0,
        bone: knee,
      });
    }
    b.decal(pants, T.patch, {
      at: [pts[1].x, pts[1].y + 0.02, pts[1].z + 0.12],
      dir: [0, 0, 1],
      size: [0.1, 0.1],
      segments: 6,
    });
  }

  // ================================================================ arms, sleeves and fists
  // A fist closes around a grip of radius `bar` centred at `c`; fingers wrap in the plane square to the grip.
  const fist = (hand: Joint, f: P, g0: P, bar: number, palmSide: 1 | -1, tag: string) => {
    const g = g0.clone().addScaledVector(f, -g0.dot(f)).normalize();
    const n = new THREE.Vector3().crossVectors(g, f).normalize();
    if (n.y * palmSide < 0) n.negate();
    const a = new THREE.Vector3().crossVectors(n, f).normalize();
    const palmT = 0.04;
    const c = hand.at.addScaledVector(f, 0.108).addScaledVector(n, -(bar + palmT / 2));
    const palmAt = c
      .clone()
      .addScaledVector(n, bar + palmT / 2)
      .addScaledVector(f, -0.054);
    b.part(new THREE.BoxGeometry(0.104, palmT, 0.108), SKIN, {
      bone: hand,
      at: palmAt,
      quat: basisQuat(a, n, f),
      flat: true,
    });
    const wrap = (off: number, radius: number, from: number, to: number) =>
      Array.from({ length: 5 }, (_, k) => {
        const phi = ((from + ((to - from) * k) / 4) * Math.PI) / 180;
        return c
          .clone()
          .addScaledVector(a, off)
          .addScaledVector(f, radius * Math.cos(phi))
          .addScaledVector(n, radius * Math.sin(phi));
      });
    const names = ["pinky", "ring", "middle", "index"];
    [-0.0378, -0.0126, 0.0126, 0.0378].forEach((off, i) => {
      const chain = b.chain(`${names[i]}${tag}`, catmull(wrap(off, bar + 0.015, 90, -140)), {
        parent: hand,
        count: 3,
        role: "digit",
        names: (k) => `${names[i]}${tag}${k + 1}`,
      });
      b.sweep(chain, [0.013, 0.0105], { color: SKIN, sides: 4, smooth: false, detail: 0.35 });
    });
    const thumb = b.chain(`thumb${tag}`, catmull(wrap(0.066, bar + 0.02, 112, 8)), {
      parent: hand,
      count: 2,
      role: "digit",
      names: (k) => `thumb${tag}${k + 1}`,
    });
    b.sweep(thumb, [0.015, 0.0108], { color: SKIN, sides: 4, smooth: false, detail: 0.35 });
    return { c, g, n, a };
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const { chain, sh, el, wr, f } = arms[side];
    const sleeve = b.sweep(chain, [0.092, 0.082, 0.072, 0.066], {
      color: YEL,
      sides: 6,
      smooth: false,
      caps: { start: "round", end: "flat" },
    });
    b.part(new THREE.SphereGeometry(0.098, 7, 5), YEL, { bone: chain.joints[0], at: sh, flat: true });
    b.part(new THREE.CylinderGeometry(0.057, 0.054, 0.06, 8), WOOL, {
      bone: chain.joints[1],
      at: wr.clone().addScaledVector(f, -0.012),
      dir: f,
      texture: T.wool,
      flat: true,
    });
    b.decal(sleeve, T.elbow, { at: el.clone().add(V(0, 0, -0.1)), dir: [0, 0, -1], size: [0.1, 0.1], segments: 6 });
    b.decal(sleeve, T.stains, {
      at: sh
        .clone()
        .lerp(el, 0.55)
        .add(V(0, 0.12, 0)),
      dir: [0, 1, 0],
      up: [0, 0, 1],
      size: [0.12, 0.16],
      segments: [6, 8],
    });
  }
  const fR = fist(arms.R.hand, arms.R.f, V(-0.15, 0.12, 0.9), 0.0195, -1, "R");
  const fL = fist(arms.L.hand, arms.L.f, V(0, 0, 1), 0.008, 1, "L");

  // ---- fishing rod
  {
    const { c, g, n, a } = fR;
    const hand = arms.R.hand;
    const butt = c.clone().addScaledVector(g, -0.2);
    const tip = c
      .clone()
      .addScaledVector(g, 1.35)
      .add(V(0, -0.08, 0));
    const rodPath = catmull([
      butt,
      c.clone().addScaledVector(g, 0.3),
      c
        .clone()
        .addScaledVector(g, 0.85)
        .add(V(0, -0.02, 0)),
      tip,
    ]);
    b.sweep(rodPath, [0.0125, 0.0035], {
      bone: hand,
      color: ROD,
      sides: 5,
      smooth: false,
      caps: { start: "flat", end: "round" },
    });
    b.sweep(polyline([butt, c.clone().addScaledVector(g, 0.17)]), 0.0205, {
      bone: hand,
      color: CORK,
      sides: 6,
      smooth: false,
    });
    b.part(new THREE.SphereGeometry(0.023, 6, 4), IRON, { bone: hand, at: butt, flat: true });
    const reelAt = c.clone().addScaledVector(g, 0.2).addScaledVector(n, 0.05);
    b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.028, 8), STEEL, { bone: hand, at: reelAt, dir: a, flat: true });
    b.rod(reelAt, c.clone().addScaledVector(g, 0.2), 0.008, { bone: hand, color: IRON, sides: 4, smooth: false });
    b.rod(
      reelAt.clone().addScaledVector(a, 0.015),
      reelAt.clone().addScaledVector(a, 0.045).addScaledVector(n, 0.03),
      0.004,
      {
        bone: hand,
        color: IRON,
        sides: 4,
        smooth: false,
      },
    );
    for (const t of [0.24, 0.42, 0.6, 0.78, 0.94]) {
      b.part(new THREE.TorusGeometry(0.011, 0.0018, 3, 5), IRON, {
        bone: hand,
        at: rodPath.at(t).addScaledVector(n, 0.012),
        dir: rodPath.tangentAt(t),
        axis: "z",
        flat: true,
      });
    }
    // line, bobber and hook
    const linePath = catmull([
      tip,
      tip.clone().add(V(0, -0.22, 0.05)),
      tip.clone().add(V(0.01, -0.5, 0.09)),
      tip.clone().add(V(0, -0.8, 0.1)),
    ]);
    b.sweep(linePath, 0.0028, {
      bone: hand,
      color: CREAM,
      sides: 4,
      smooth: false,
      detail: 0.35,
      caps: { start: "none", end: "round" },
    });
    const bob = linePath.at(0.55);
    b.part(new THREE.SphereGeometry(0.02, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2), RED, {
      bone: hand,
      at: bob,
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.02, 6, 3, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), CREAM, {
      bone: hand,
      at: bob,
      flat: true,
    });
    const end = linePath.at(1);
    b.sweep(
      catmull([
        end,
        end.clone().add(V(0, -0.03, 0.0)),
        end.clone().add(V(0, -0.05, 0.02)),
        end.clone().add(V(0, -0.03, 0.035)),
      ]),
      0.0025,
      {
        bone: hand,
        color: STEEL,
        sides: 4,
        smooth: false,
        detail: 0.35,
      },
    );
  }

  // ---- hurricane lantern
  {
    const { c, g } = fL;
    const hand = arms.L.hand;
    const top = c.y - 0.095;
    const x = c.x;
    const z = c.z;
    const wire = [
      V(x, top + 0.018, z).addScaledVector(g, -0.012),
      c.clone().addScaledVector(g, -0.05),
      c.clone().addScaledVector(g, 0.05),
      V(x, top + 0.018, z).addScaledVector(g, 0.012),
    ];
    b.sweep(polyline(wire), 0.0045, { bone: hand, color: IRON, sides: 4, smooth: false });
    b.part(new THREE.ConeGeometry(0.052, 0.045, 6), IRON, { bone: hand, at: [x, top - 0.0225, z], flat: true });
    b.part(new THREE.CylinderGeometry(0.012, 0.016, 0.022, 6), IRON, {
      bone: hand,
      at: [x, top + 0.008, z],
      flat: true,
    });
    glow(
      b.part(new THREE.CylinderGeometry(0.046, 0.046, 0.13, 6), "#ffffff", {
        bone: hand,
        at: [x, top - 0.11, z],
        texture: T.glass,
        flat: true,
      }),
      1.2,
    );
    b.part(new THREE.CylinderGeometry(0.05, 0.043, 0.04, 6), IRON, { bone: hand, at: [x, top - 0.195, z], flat: true });
    for (let i = 0; i < 6; i++) {
      const th = (i * Math.PI) / 3;
      const cx = x + 0.047 * Math.sin(th);
      const cz = z + 0.047 * Math.cos(th);
      b.rod([cx, top - 0.05, cz], [cx, top - 0.178, cz], 0.0028, { bone: hand, color: IRON, sides: 4, smooth: false });
    }
  }

  // ================================================================ coat details
  b.part(new THREE.CylinderGeometry(1, 1, 1, 8), WOOL, {
    bone: neck.joints[0],
    at: [0, 1.475, 0.02],
    scale: [0.07, 0.09, 0.07],
    texture: T.wool,
    flat: true,
  });
  b.lathe(
    [
      [0.074, 0],
      [0.102, 0],
      [0.12, 0.06],
      [0.108, 0.066],
      [0.084, 0.04],
    ],
    { at: [0, 1.425, 0.012], segments: 8, bone: neck.joints[0], color: YEL },
  );
  b.decal(coat, T.cable, { at: [0, 1.18, 0.17], dir: [0, 0, 1], size: [0.125, 0.46], segments: [5, 14] });
  for (const angle of [158, 202]) {
    b.sweep(coat.line(angle, 0.004).slice(0.3, 0.98), 0.006, { bone: spine, color: YEL_D, sides: 4, smooth: false });
  }
  for (const t of [0.5, 0.63, 0.76]) {
    b.stick(new THREE.BoxGeometry(0.014, 0.014, 0.055), BRIAR, coat.at(t, 158), {
      spin: 90,
      bone: spine.joints[1],
      flat: true,
    });
  }
  for (const s of [1, -1]) {
    b.decal(coat, T.pocket, { at: [s * 0.115, 0.86, 0.17], dir: [0, 0, 1], size: [0.11, 0.11], segments: 6 });
  }
  b.decal(coat, T.stains, { at: [0.13, 0.85, 0.17], dir: [0, 0, 1], size: [0.15, 0.15], segments: 7 });
  b.decal(coat, T.stains, { at: [-0.12, 1.1, -0.16], dir: [0, 0, -1], size: [0.16, 0.16], segments: 7, mirror: true });
  b.decal(coat, T.boatNo, { at: [0, 1.2, -0.16], dir: [0, 0, -1], size: [0.2, 0.1], segments: [10, 5] });
  b.sweep(b.surface(coat).loop(V(0, 0.76, 0), { lift: 0.004 }), 0.007, { color: YEL_D, sides: 4, smooth: false });
  b.sweep(b.surface(coat).loop(V(0, 1.3, 0), { lift: 0.003 }), 0.006, { color: YEL_D, sides: 4, smooth: false });
  b.sweep(coat.line(0, 0.003).slice(0.08, 0.9), 0.006, { bone: spine, color: YEL_D, sides: 4, smooth: false });

  // ---- rope coil on the right shoulder, with a tail down the chest
  {
    const cR = V(-0.17, 1.44, 0.005);
    const ax = V(-0.45, 0.88, 0.1).normalize();
    for (let k = 0; k < 4; k++) {
      b.part(new THREE.TorusGeometry(0.105, 0.02, 5, 12), ROPE, {
        bone: chest,
        at: cR.clone().addScaledVector(ax, k * 0.036),
        dir: ax,
        axis: "z",
        texture: T.rope,
        flat: true,
      });
    }
    const tailPath = b
      .surface(coat)
      .drape(catmull([V(-0.15, 1.47, 0.09), V(-0.16, 1.38, 0.15), V(-0.17, 1.25, 0.17), V(-0.16, 1.12, 0.17)]), {
        lift: 0.012,
      });
    b.sweep(tailPath, 0.016, {
      bone: chest,
      color: ROPE,
      sides: 5,
      smooth: false,
      caps: { start: "round", end: "flat" },
    });
    const endAt = tailPath.at(1);
    b.cards(
      [0, 1, 2].map((i) => frame([endAt.x + (i - 1) * 0.012, endAt.y, endAt.z + 0.004], [0, 1, 0])),
      T.fringe,
      { size: [0.04, 0.06], lean: 180, flow: [0, 0, 1], bone: chest },
    );
  }

  // ================================================================ crate of fish at his feet
  {
    const yaw = 14;
    const C = V(0.43, 0, 0.17);
    const toW = (lx: number, ly: number, lz: number) =>
      V(lx, ly, lz)
        .applyAxisAngle(V(0, 1, 0), (yaw * Math.PI) / 180)
        .add(C);
    const box = (
      sx: number,
      sy: number,
      sz: number,
      lx: number,
      ly: number,
      lz: number,
      color: string,
      texture?: THREE.Texture,
    ) =>
      b.part(new THREE.BoxGeometry(sx, sy, sz), color, {
        bone: hips,
        at: toW(lx, ly, lz),
        rotation: [0, yaw, 0],
        texture,
        flat: true,
      });
    box(0.4, 0.02, 0.28, 0, 0.01, 0, WOOD_D);
    for (const z of [-1, 1]) {
      box(0.42, 0.17, 0.018, 0, 0.105, z * 0.141, WOOD, T.planks);
    }
    for (const x of [-1, 1]) {
      box(0.018, 0.17, 0.264, x * 0.201, 0.105, 0, WOOD, T.planks);
    }
    for (const x of [-1, 1]) {
      for (const z of [-1, 1]) {
        box(0.032, 0.2, 0.032, x * 0.202, 0.1, z * 0.142, WOOD_D);
      }
    }
    box(0.385, 0.03, 0.265, 0, 0.165, 0, ICE);
    b.cards(
      [toW(0.205, 0.2, 0.07), toW(0.205, 0.2, -0.06), toW(-0.17, 0.2, 0.152), toW(0.12, 0.2, 0.152)].map((p) =>
        frame(p, [0, 1, 0]),
      ),
      T.kelp,
      { size: [0.06, 0.13], lean: 180, flow: [0.4, 0, 1], cross: true, vary: 0.2, rng: rand, bone: hips },
    );
    const iceRand = rng(5);
    for (let i = 0; i < 11; i++) {
      const r = 0.018 + iceRand() * 0.016;
      b.part(new THREE.IcosahedronGeometry(r, 0), ICE, {
        bone: hips,
        at: toW((iceRand() - 0.5) * 0.36, 0.185 + iceRand() * 0.01, (iceRand() - 0.5) * 0.24),
        rotation: [iceRand() * 180, iceRand() * 180, 0],
        flat: true,
      });
    }
    b.part(new THREE.PlaneGeometry(0.26, 0.097), "#ffffff", {
      bone: hips,
      at: toW(0, 0.105, 0.1515),
      dir: V(0, 0, 1).applyAxisAngle(V(0, 1, 0), (yaw * Math.PI) / 180),
      axis: "z",
      texture: T.stencil,
    });
    const fishSpecs = [
      { x: -0.05, z: -0.07, phi: 8, y: 0.212 },
      { x: 0.03, z: 0.02, phi: -12, y: 0.214 },
      { x: -0.08, z: 0.09, phi: 4, y: 0.212 },
      { x: 0.09, z: -0.08, phi: 170, y: 0.23 },
      { x: -0.02, z: 0.0, phi: 192, y: 0.235 },
      { x: 0.05, z: 0.1, phi: 184, y: 0.232 },
      { x: 0.0, z: -0.02, phi: 96, y: 0.252 },
    ];
    const fishTable = [
      [0, 0.008, 0.005],
      [0.1, 0.026, 0.014],
      [0.35, 0.038, 0.021],
      [0.65, 0.03, 0.017],
      [0.9, 0.013, 0.008],
      [1, 0.009, 0.006],
    ] as const;
    const Y = V(0, 1, 0);
    for (const fs of fishSpecs) {
      const ph = (fs.phi * Math.PI) / 180;
      const d = V(Math.cos(ph), 0, Math.sin(ph)).applyAxisAngle(Y, (yaw * Math.PI) / 180);
      const centre = toW(fs.x, fs.y, fs.z);
      const head = centre.clone().addScaledVector(d, 0.15);
      const tail = centre.clone().addScaledVector(d, -0.14);
      const lat = new THREE.Vector3().crossVectors(d.clone().negate(), Y).normalize();
      const body = b.sweep(
        polyline([head, tail]),
        (t) => {
          const [rx, ry] = lerpTable(fishTable, t);
          return [rx, ry] as const;
        },
        {
          bone: hips,
          color: FISH_BELLY,
          sectors: [[55, 125, FISH_BACK]],
          sides: 6,
          smooth: false,
          caps: { start: "round", end: "flat" },
        },
      );
      b.extrude(
        [
          [0, 0],
          [0.05, 0.035],
          [0.038, 0],
          [0.05, -0.035],
        ],
        { at: tail, x: d.clone().negate(), y: lat, thickness: 0.004, bone: hips, color: FISH_BACK },
      );
      b.part(new THREE.SphereGeometry(0.0075, 5, 4), IRON, {
        bone: hips,
        at: head
          .clone()
          .addScaledVector(d, -0.04)
          .addScaledVector(lat, 0.01)
          .add(V(0, 0.013, 0)),
        flat: true,
      });
      b.decal(body, T.mackerel, {
        at: centre.clone().add(V(0, 0.04, 0)),
        dir: [0, 1, 0],
        up: lat,
        size: [0.25, 0.07],
        segments: [14, 5],
        bone: hips,
      });
    }
  }

  return b.root;
}
