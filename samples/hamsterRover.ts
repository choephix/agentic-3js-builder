// Hamster Rover: a cute flat low-poly space hamster (about 0.5 m tall) at the wheel of a tiny six-wheeled planetary
// rover. Faceted shapes, flat colours and SVG drawings (faces, stickers, glass glints, solar cells, fur tufts).
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { catmull, polyline } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Hamster Rover",
  description:
    "A space hamster in a glass bubble helmet, cheeks stuffed with seeds, driving a six-wheeled candy-coloured planetary rover with solar wings and a star-flag antenna.",
};

type V = [number, number, number];
const SIDES = [1, -1] as const;
const DEG = Math.PI / 180;

// Palette
const MINT = "#86e5cf";
const MINT_D = "#55c7ae";
const CORAL = "#ff8fa3";
const BUTTER = "#ffe27d";
const CREAM = "#fff2d9";
const LILAC = "#bba4f4";
const LILAC_D = "#8a78d1";
const TIRE = "#5b4b9e";
const TIRE_D = "#45387f";
const PLUM = "#3a2a55";
const FUR = "#f5a95b";
const FUR_D = "#d9803f";
const PINK = "#ff9dbb";
const WHITE = "#ffffff";
const GLASS = "#bfe8ff";
const SEED = "#ead9b0";
const SEED_D = "#4a3a45";
const SKY = "#8fd3ff";

const starPath = (cx: number, cy: number, outer: number, inner: number) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i * 36 - 90) * DEG;
    const r = i % 2 === 0 ? outer : inner;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
};
const sparklePath = (cx: number, cy: number, r: number) =>
  `M${cx} ${cy - r}L${cx + r * 0.28} ${cy - r * 0.28}L${cx + r} ${cy}L${cx + r * 0.28} ${cy + r * 0.28}L${cx} ${cy + r}L${cx - r * 0.28} ${cy + r * 0.28}L${cx - r} ${cy}L${cx - r * 0.28} ${cy - r * 0.28}Z`;

// ---------------------------------------------------------------------------------------------------- drawings
const EYE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 72">
    <ellipse cx="30" cy="36" rx="28" ry="34" fill="${PLUM}"/>
    <ellipse cx="30" cy="53" rx="22" ry="14" fill="#6a4fa0"/>
    <circle cx="20" cy="21" r="10" fill="#fff"/>
    <circle cx="41" cy="50" r="5" fill="#fff"/>
    <circle cx="43" cy="25" r="3" fill="#fff"/>
  </svg>`,
  { size: 256 },
);
const BROW = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 24"><ellipse cx="20" cy="12" rx="19" ry="10" fill="${CREAM}"/></svg>`,
  { size: 128 },
);
const BLUSH = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 36">
    <ellipse cx="32" cy="18" rx="31" ry="17" fill="#ff86ab"/>
    <path d="M17 26L23 10M29 28L35 9M41 26L47 10" stroke="#ff5c8e" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 256 },
);
const STRIPE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 96">
    <path d="M18 2C33 28 32 70 29 94L7 94C4 70 3 28 18 2Z" fill="${FUR_D}"/>
    <circle cx="18" cy="60" r="3" fill="${FUR}"/><circle cx="18" cy="42" r="2.4" fill="${FUR}"/>
  </svg>`,
  { size: 192 },
);
const WHISKER = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
    <path d="M30 60L8 6M30 60L30 2M30 60L52 6" stroke="#7c6aa8" stroke-width="3" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 192 },
);
const tuftSvg = (base: string, dark: string) =>
  svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 60">
      <path d="M2 60L8 20L15 42L21 3L28 40L35 18L38 60Z" fill="${base}"/>
      <path d="M14 60L17 40L21 20L25 40L28 60Z" fill="${dark}"/>
    </svg>`,
    { size: 128 },
  );
const TUFT_FUR = tuftSvg(FUR, FUR_D);
const TUFT_CREAM = tuftSvg(CREAM, "#ffe0b5");
const SEED_DECAL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 64">
    <path d="M20 3C35 16 38 44 20 62C2 44 5 16 20 3Z" fill="#f4ecd8" stroke="${SEED_D}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M20 10L20 56M12 18Q8 38 15 52M28 18Q32 38 25 52" stroke="${SEED_D}" stroke-width="3" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 128 },
);
const SEED_STRIPES = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" fill="#f4ecd8"/>
    <rect x="0" width="8" height="64" fill="${SEED_D}"/><rect x="16" width="8" height="64" fill="${SEED_D}"/>
    <rect x="32" width="8" height="64" fill="${SEED_D}"/><rect x="48" width="8" height="64" fill="${SEED_D}"/>
  </svg>`,
  { size: 64 },
);
// Bubble helmet: only glints, seams and a rim band are opaque; the rest of the glass is cut away.
const rivets = [40, 100, 160, 215]
  .map((y) => `<circle cx="180" cy="${y}" r="9" fill="#8fc9f5"/><circle cx="540" cy="${y}" r="9" fill="#8fc9f5"/>`)
  .join("");
const HELMET = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 264">
    <rect x="172" y="0" width="16" height="264" fill="${GLASS}"/>
    <rect x="532" y="0" width="16" height="264" fill="${GLASS}"/>
    <rect x="0" y="0" width="720" height="16" fill="${GLASS}"/>

    ${rivets}
    <path d="M318 26C288 40 270 70 268 106L288 108C290 78 304 56 330 44Z" fill="#fff"/>
    <circle cx="262" cy="134" r="8" fill="#fff"/>
    <path d="M498 176C510 160 518 136 518 108L502 106C502 130 496 152 486 166Z" fill="#fff"/>
    <path d="${sparklePath(452, 62, 24)}" fill="#fff"/>
    <path d="${sparklePath(402, 34, 11)}" fill="#fff"/>
  </svg>`,
  { size: 1024 },
);
const JAR_GLASS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100">
    <rect x="0" y="0" width="160" height="7" fill="${GLASS}"/>
    <rect x="0" y="93" width="160" height="7" fill="${GLASS}"/>
    <rect x="58" y="14" width="9" height="62" rx="4" fill="#fff"/>
    <rect x="71" y="14" width="9" height="12" rx="4" fill="#fff"/>
  </svg>`,
  { size: 512 },
);
const PANEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80">
    <rect width="120" height="80" fill="#3f5fd6"/>
    <path d="M0 26H120M0 53H120M30 0V80M60 0V80M90 0V80" stroke="#93b3ff" stroke-width="3"/>
    <path d="M14 0H34L8 80H-12Z" fill="#6b8cf0"/><path d="M58 0H72L46 80H32Z" fill="#6b8cf0"/>
    <path d="${sparklePath(98, 14, 9)}" fill="#fff"/>
  </svg>`,
  { size: 512 },
);
const PATCH = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
    <circle cx="40" cy="40" r="38" fill="${BUTTER}"/>
    <circle cx="40" cy="40" r="32" fill="#3b3a7a"/>
    <path d="${starPath(16, 20, 5, 2.2)}" fill="#fff"/><path d="${starPath(63, 18, 4, 1.8)}" fill="#fff"/>
    <path d="${starPath(62, 58, 3.6, 1.6)}" fill="${BUTTER}"/>
    <circle cx="28" cy="27" r="9" fill="${FUR}"/><circle cx="52" cy="27" r="9" fill="${FUR}"/>
    <circle cx="28" cy="27" r="5" fill="${PINK}"/><circle cx="52" cy="27" r="5" fill="${PINK}"/>
    <circle cx="40" cy="44" r="19" fill="${FUR}"/>
    <ellipse cx="40" cy="51" rx="11" ry="8" fill="${CREAM}"/>
    <circle cx="32" cy="41" r="3" fill="${PLUM}"/><circle cx="48" cy="41" r="3" fill="${PLUM}"/>
    <circle cx="31" cy="40" r="1" fill="#fff"/><circle cx="47" cy="40" r="1" fill="#fff"/>
    <ellipse cx="40" cy="47" rx="3" ry="2.2" fill="${PINK}"/>
    <ellipse cx="27" cy="49" rx="4" ry="2.6" fill="#ff86ab"/><ellipse cx="53" cy="49" rx="4" ry="2.6" fill="#ff86ab"/>
  </svg>`,
  { size: 256 },
);
const LIVERY = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 24">
    <rect x="2" y="3" width="216" height="18" rx="9" fill="${CORAL}"/>
    <rect x="2" y="3" width="216" height="5" rx="2.5" fill="#ffb3c0"/>
    <text x="110" y="17.5" text-anchor="middle" font-family="Verdana, Arial, sans-serif" font-weight="bold" font-size="13" letter-spacing="2.5" fill="#fff">HAMSTER ROVER</text>
    <path d="${starPath(18, 12, 6.5, 2.8)}" fill="${BUTTER}"/><path d="${starPath(202, 12, 6.5, 2.8)}" fill="${BUTTER}"/>
  </svg>`,
  { size: 1024 },
);
const ROUNDEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="30" fill="${CREAM}"/><circle cx="32" cy="32" r="24" fill="${LILAC_D}"/>
    <text x="32" y="42" text-anchor="middle" font-family="Verdana, Arial, sans-serif" font-weight="bold" font-size="28" fill="#fff">01</text>
  </svg>`,
  { size: 128 },
);
const HUB = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="32" fill="${BUTTER}"/>
    <path d="${starPath(32, 33, 19, 8.5)}" fill="${CORAL}"/>
    <circle cx="32" cy="8" r="3" fill="${PLUM}"/><circle cx="56" cy="26" r="3" fill="${PLUM}"/><circle cx="47" cy="54" r="3" fill="${PLUM}"/>
    <circle cx="17" cy="54" r="3" fill="${PLUM}"/><circle cx="8" cy="26" r="3" fill="${PLUM}"/>
  </svg>`,
  { size: 128 },
);
const FLAG_STAR = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <path d="${starPath(32, 33, 28, 12.5)}" fill="${BUTTER}" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="26" cy="30" r="2.4" fill="${PLUM}"/><circle cx="38" cy="30" r="2.4" fill="${PLUM}"/>
    <path d="M28 38Q32 42 36 38" stroke="${PLUM}" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 128 },
);
const GAUGES = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40">
    <rect width="100" height="40" rx="6" fill="${PLUM}"/>
    <circle cx="24" cy="20" r="14" fill="${CREAM}"/><path d="M24 20L32 9" stroke="${CORAL}" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="24" cy="20" r="3" fill="${PLUM}"/>
    <circle cx="56" cy="14" r="6" fill="#7dffb3"/><circle cx="74" cy="14" r="6" fill="${BUTTER}"/><circle cx="56" cy="30" r="6" fill="${CORAL}"/>
    <rect x="68" y="25" width="22" height="10" rx="5" fill="${LILAC}"/>
  </svg>`,
  { size: 256 },
);
const CHEST = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 64">
    <rect x="2" y="2" width="76" height="60" rx="12" fill="${CREAM}"/>
    <rect x="10" y="9" width="60" height="22" rx="6" fill="${PLUM}"/>
    <path d="M40 26C30 20 27 14 32 13C36 12 40 16 40 16C40 16 44 12 48 13C53 14 50 20 40 26Z" fill="${CORAL}"/>
    <circle cx="20" cy="46" r="6" fill="#7dffb3"/><circle cx="40" cy="46" r="6" fill="${BUTTER}"/><circle cx="60" cy="46" r="6" fill="${CORAL}"/>
  </svg>`,
  { size: 256 },
);
const CLOUD = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 60">
    <circle cx="22" cy="38" r="18" fill="#fff"/><circle cx="44" cy="28" r="22" fill="#fff"/><circle cx="62" cy="40" r="16" fill="#fff"/>
    <rect x="22" y="38" width="40" height="16" fill="#fff"/>
    <path d="M14 52Q44 60 70 52L70 56Q44 62 14 56Z" fill="#dcd2ff"/>
  </svg>`,
  { size: 192 },
);
const SPARKLE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <path d="${sparklePath(32, 32, 30)}" fill="${BUTTER}" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="32" cy="32" r="5" fill="#fff"/>
  </svg>`,
  { size: 128 },
);

const GRILLE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 40">
    <rect width="80" height="40" rx="8" fill="${PLUM}"/>
    <rect x="8" y="7" width="64" height="5" rx="2.5" fill="${LILAC}"/><rect x="8" y="17" width="64" height="5" rx="2.5" fill="${LILAC}"/>
    <rect x="8" y="27" width="64" height="5" rx="2.5" fill="${LILAC}"/>
  </svg>`,
  { size: 192 },
);

const HOOD_STICKERS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40">
    <path d="${starPath(17, 21, 15, 6.5)}" fill="${CORAL}" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>
    <path d="M42 34C26 24 28 11 36 11C40 11 42 14 42 16C42 14 44 11 48 11C56 11 58 24 42 34Z" fill="${LILAC}" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>
    <path d="${sparklePath(66, 20, 15)}" fill="${BUTTER}" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="86" cy="20" r="14" fill="${MINT}" stroke="#fff" stroke-width="3"/>
    <ellipse cx="86" cy="24" rx="6" ry="5" fill="#fff"/>
    <circle cx="78.5" cy="17" r="2.6" fill="#fff"/><circle cx="83" cy="12.5" r="2.6" fill="#fff"/>
    <circle cx="89" cy="12.5" r="2.6" fill="#fff"/><circle cx="93.5" cy="17" r="2.6" fill="#fff"/>
  </svg>`,
  { size: 512 },
);

// ---------------------------------------------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "hamsterRover" });

  // Geometry helpers ----------------------------------------------------------------------------------------
  const ball = (w = 8, h = 6) => new THREE.SphereGeometry(1, w, h);
  const plane = (w: number, h: number) => new THREE.PlaneGeometry(w, h);
  const placed = (g: THREE.BufferGeometry, p: V, q = new THREE.Quaternion(), s: V = [1, 1, 1]) =>
    g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...p), q, new THREE.Vector3(...s)));

  const chassis = b.joint("chassis", { at: [0, 0.3, 0] });

  // ------------------------------------------------------------------------------------------ hamster skeleton
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.44, -0.04],
      [0, 0.5, -0.03],
      [0, 0.56, -0.02],
    ]),
    { parent: chassis, names: ["hips", "spine", "chest"], role: "spine" },
  );
  const hips = spine.joints[0];
  const chest = spine.tip!;
  const neck = b.joint("neck", { parent: chest, at: [0, 0.6, -0.01], dir: [0, 1, 0.3], role: "neck" });
  const HEAD_C: V = [0, 0.69, 0];
  const head = b.joint("head", { parent: neck, at: HEAD_C, dir: [0, 0, 1], role: "head" });
  // head frame: local [right, forward, up]; hl(left, up, forward) reads in model terms
  const hl = (l: number, u: number, f: number) => head.local([-l, f, u]);
  const jaw = b.joint("jaw", { parent: head, at: hl(0, -0.085, 0.07), aim: hl(0, -0.1, 0.2), role: "jaw" });

  // ------------------------------------------------------------------------------------------ rover: hull
  b.extrude(
    [
      [-0.62, 0.27],
      [-0.54, 0.17],
      [0.5, 0.17],
      [0.64, 0.25],
      [0.64, 0.34],
      [-0.62, 0.34],
    ],
    { at: [0, 0, 0], thickness: 0.66, bevel: 0.03, detail: 0.34, color: MINT, bone: chassis, name: "hull" },
  );
  b.extrude(
    [
      [0.27, 0.33],
      [0.27, 0.43],
      [0.36, 0.45],
      [0.46, 0.41],
      [0.62, 0.385],
      [0.69, 0.35],
      [0.66, 0.33],
    ],
    { at: [0, 0, 0], thickness: 0.64, bevel: 0.03, detail: 0.34, color: BUTTER, bone: chassis, name: "hood" },
  );
  b.extrude(
    [
      [-0.34, 0.33],
      [-0.34, 0.5],
      [-0.4, 0.64],
      [-0.58, 0.66],
      [-0.66, 0.58],
      [-0.66, 0.3],
    ],
    { at: [0, 0, 0], thickness: 0.64, bevel: 0.03, detail: 0.34, color: MINT_D, bone: chassis, name: "cowl" },
  );
  // seat cushion and the cockpit rim
  b.part(new THREE.BoxGeometry(0.5, 0.06, 0.5), CORAL, { at: [0, 0.36, -0.1], bone: chassis, flat: true, name: "seat" });
  b.sweep(
    polyline(
      [
        [-0.22, 0.37, -0.33],
        [0.22, 0.37, -0.33],
        [0.3, 0.37, -0.25],
        [0.3, 0.37, 0.19],
        [0.22, 0.37, 0.27],
        [-0.22, 0.37, 0.27],
        [-0.3, 0.37, 0.19],
        [-0.3, 0.37, -0.25],
      ],
      { closed: true },
    ),
    0.028,
    { color: CORAL, sides: 8, smooth: false, bone: chassis, name: "rim" },
  );
  // bumper, headlights
  b.capsule([-0.3, 0.26, 0.675], [0.3, 0.26, 0.675], 0.035, { color: CORAL, sides: 8, smooth: false, bone: chassis, name: "bumper" });
  for (const s of SIDES) {
    b.part(ball(6, 4), MINT_D, { at: [s * 0.22, 0.395, 0.69], scale: [0.058, 0.052, 0.036], bone: chassis, flat: true, name: "lampHousing" });
    b.part(ball(6, 4), WHITE, { at: [s * 0.22, 0.395, 0.71], scale: [0.04, 0.036, 0.022], bone: chassis, flat: true, name: "lamp" });
  }

  // livery stickers on the hull, roundels on the hood, patches on the cowl
  for (const s of SIDES) {
    const out: V = [s, 0, 0];
    b.part(plane(0.64, 0.07), WHITE, { at: [s * 0.3335, 0.275, 0], dir: out, axis: "z", texture: LIVERY, bone: chassis, name: "livery" });
    b.part(plane(0.085, 0.085), WHITE, { at: [s * 0.3225, 0.4, 0.42], dir: out, axis: "z", texture: ROUNDEL, bone: chassis, name: "roundel" });
    b.part(plane(0.17, 0.17), WHITE, { at: [s * 0.3225, 0.485, -0.5], dir: out, axis: "z", texture: PATCH, bone: chassis, name: "patch" });
  }
  b.part(plane(0.36, 0.14), WHITE, {
    at: [0, 0.4035, 0.54],
    dir: [0, 1, 0.156],
    axis: "z",
    up: [0, 0, -1],
    texture: HOOD_STICKERS,
    bone: chassis,
    name: "hoodStickers",
  });
  b.part(plane(0.18, 0.09), WHITE, { at: [0, 0.51, -0.6635], dir: [0, 0, -1], axis: "z", texture: GRILLE, bone: chassis, name: "grille" });
  b.part(plane(0.24, 0.096), WHITE, { at: [0, 0.486, 0.2396], dir: [0, -0.15, -1], axis: "z", texture: GAUGES, bone: chassis, name: "gauges" });

  // ------------------------------------------------------------------------------------------ rover: six wheels
  const AXLE_Y = 0.165;
  const wheelNames: string[] = [];
  for (const s of SIDES) {
    const side = s > 0 ? "L" : "R";
    const pivot: V = [s * 0.4, 0.2, 0.02];
    const front: V = [s * 0.4, AXLE_Y, 0.5];
    const bogiePivot: V = [s * 0.4, 0.19, -0.16];
    const midA: V = [s * 0.4, AXLE_Y, 0];
    const rearA: V = [s * 0.4, AXLE_Y, -0.5];
    const rocker = b.joint(`rocker${side}`, { parent: chassis, at: pivot, aim: front, role: "hinge" });
    const bogie = b.joint(`bogie${side}`, { parent: rocker, at: bogiePivot, aim: rearA, role: "hinge" });
    const arm = { color: LILAC_D, sides: 8, smooth: false } as const;
    b.rod([s * 0.3, 0.2, 0.02], pivot, 0.03, { ...arm, bone: chassis });
    b.rod(front, pivot, 0.03, { ...arm, bone: rocker });
    b.rod(pivot, bogiePivot, 0.03, { ...arm, bone: rocker });
    b.rod(bogiePivot, midA, 0.03, { ...arm, bone: bogie });
    b.rod(bogiePivot, rearA, 0.03, { ...arm, bone: bogie });
    b.part(ball(6, 4), BUTTER, { at: pivot, scale: 0.045, bone: rocker, flat: true });
    b.part(ball(6, 4), BUTTER, { at: bogiePivot, scale: 0.038, bone: bogie, flat: true });
    const axles: Array<[string, typeof rocker, number]> = [
      ["F", rocker, 0.5],
      ["M", bogie, 0],
      ["R", bogie, -0.5],
    ];
    for (const [tag, parent, z] of axles) {
      const name = `wheel${tag}${side}`;
      wheelNames.push(name);
      const hub: V = [s * 0.54, AXLE_Y, z];
      const wheel = b.joint(name, { parent, at: hub, dir: [s, 0, 0], role: "hinge" });
      b.rod([s * 0.4, AXLE_Y, z], hub, 0.024, { ...arm, bone: parent });
      const axis: V = [s, 0, 0];
      b.lathe(
        [
          [0, -0.07],
          [0.12, -0.07],
          [0.148, -0.045],
          [0.148, 0.045],
          [0.12, 0.07],
          [0, 0.07],
        ],
        { at: hub, axis, segments: 10, spin: 0, color: TIRE, bone: wheel, name: "tire" },
      );
      b.lathe(
        [
          [0, -0.085],
          [0.095, -0.085],
          [0.095, 0.085],
          [0, 0.085],
        ],
        { at: hub, axis, segments: 10, color: BUTTER, bone: wheel, name: "hubcap" },
      );
      b.part(new THREE.CircleGeometry(0.088, 10), WHITE, {
        at: [s * 0.54 + s * 0.0865, AXLE_Y, z],
        dir: axis,
        axis: "z",
        texture: HUB,
        bone: wheel,
        name: "hubSticker",
      });
      // tread lugs: one merged part per wheel, a lug at the very bottom
      const lugs: THREE.BufferGeometry[] = [];
      for (let k = 0; k < 10; k++) {
        const a = k * 36 * DEG;
        lugs.push(
          placed(
            new THREE.BoxGeometry(0.12, 0.03, 0.055),
            [s * 0.54, AXLE_Y + 0.15 * Math.cos(a), z + 0.15 * Math.sin(a)],
            new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), a),
          ),
        );
      }
      b.part(mergeGeometries(lugs), TIRE_D, { at: [0, 0, 0], bone: wheel, flat: true, name: "lugs" });
    }
  }

  // ------------------------------------------------------------------------------------------ solar wings
  const tilt = 32 * DEG;
  for (const s of SIDES) {
    const side = s > 0 ? "L" : "R";
    const d: V = [s * Math.cos(tilt), Math.sin(tilt), 0];
    const n: V = [-s * Math.sin(tilt), Math.cos(tilt), 0];
    const hinge: V = [s * 0.34, 0.6, -0.5];
    const panel = b.joint(`panel${side}`, { parent: chassis, at: hinge, dir: d, role: "hinge" });
    const at = (t: number, lift = 0): V => [hinge[0] + d[0] * t + n[0] * lift, hinge[1] + d[1] * t + n[1] * lift, hinge[2]];
    const frameBox = b.part(new THREE.BoxGeometry(0.5, 0.03, 0.38), BUTTER, {
      at: at(0.27),
      dir: d,
      axis: "x",
      bone: panel,
      flat: true,
      name: "panelFrame",
    });
    b.part(plane(0.46, 0.34), WHITE, {
      at: at(0.27, 0.0165),
      dir: n,
      axis: "z",
      up: [0, 0, 1],
      texture: PANEL,
      bone: panel,
      name: "cells",
    });
    b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.3, 8), LILAC_D, {
      at: at(0.02),
      dir: [0, 0, 1],
      bone: panel,
      flat: true,
      name: "hingeBarrel",
    });
    for (const z of [-0.36, -0.62]) {
      const top = at(0.3, -0.02);
      b.rod([s * 0.33, 0.56, z], [top[0], top[1], z], 0.014, { color: LILAC_D, sides: 8, smooth: false, bone: chassis, name: "strut" });
    }
    void frameBox;
  }

  // ------------------------------------------------------------------------------------------ antenna and flag
  const mast = b.chain(
    "antenna",
    catmull([
      [0.22, 0.64, -0.52],
      [0.225, 0.8, -0.53],
      [0.225, 0.96, -0.52],
      [0.215, 1.12, -0.5],
    ]),
    { parent: chassis, role: "tail" },
  );
  b.sweep(mast, [0.018, 0.008], {
    bands: [
      [0.25, CORAL],
      [0.5, CREAM],
      [0.75, CORAL],
      [1, CREAM],
    ],
    sides: 8,
    smooth: false,
    caps: "flat",
    name: "mast",
  });
  b.part(ball(6, 4), BUTTER, { at: [0.213, 1.14, -0.5], scale: 0.03, bone: mast.joints[2], flat: true, name: "tipBall" });
  b.part(ball(6, 4), LILAC_D, { at: [0.22, 0.64, -0.52], scale: 0.04, bone: chassis, flat: true, name: "mastBase" });
  const flagHinge = b.joint("flagHinge", { parent: mast.joints[2], at: [0.216, 1.1, -0.505], dir: [1, 0, 0], role: "hinge" });
  const flag = b.extrude(
    [
      [0, 0],
      [0.32, 0],
      [0.25, -0.09],
      [0.32, -0.18],
      [0, -0.18],
    ],
    { at: flagHinge.at, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, color: CORAL, bone: flagHinge, name: "flag" },
  );
  for (const z of [1, -1]) {
    b.part(plane(0.13, 0.13), WHITE, {
      at: flag.local([0.15, -0.09, z * 0.0075]),
      dir: [0, 0, z],
      axis: "z",
      texture: FLAG_STAR,
      bone: flagHinge,
      name: "flagStar",
    });
  }

  // ------------------------------------------------------------------------------------------ exhaust and steam
  b.rod([0, 0.41, -0.64], [0, 0.43, -0.75], [0.055, 0.04], { color: LILAC_D, sides: 8, smooth: false, bone: chassis, name: "exhaust" });
  b.cards([frame([0, 0.45, -0.77], [0, 1, 0]), frame([0.03, 0.53, -0.9], [0, 1, 0])], CLOUD, {
    size: [0.2, 0.15],
    flow: [0, 0, 1],
    bone: chassis,
  });
  // sparkles floating around the rover
  b.cards(
    [
      frame([-0.44, 0.95, 0.06], [0, 1, 0]),
      frame([0.5, 0.9, 0.18], [0, 1, 0]),
      frame([-0.62, 0.6, 0.45], [0, 1, 0]),
      frame([-0.55, 1.05, -0.1], [0, 1, 0]),
      frame([-0.12, 1.06, 0.12], [0, 1, 0]),
    ],
    SPARKLE,
    { size: 0.11, cross: true, flow: [0, 0, 1], vary: 0.3, rng: rng(5), bone: chassis },
  );

  // ------------------------------------------------------------------------------------------ seed jar
  const JAR_C: V = [-0.22, 0.76, -0.52];
  b.part(new THREE.CylinderGeometry(0.088, 0.088, 0.22, 8, 1, true), WHITE, {
    at: JAR_C,
    rotation: [0, 180, 0],
    texture: JAR_GLASS,
    bone: chassis,
    flat: true,
    name: "jarGlass",
  });
  b.part(new THREE.CylinderGeometry(0.098, 0.098, 0.03, 8), CORAL, { at: [JAR_C[0], 0.655, JAR_C[2]], bone: chassis, flat: true, name: "jarBase" });
  b.part(new THREE.CylinderGeometry(0.098, 0.098, 0.035, 8), CORAL, { at: [JAR_C[0], 0.885, JAR_C[2]], bone: chassis, flat: true, name: "jarLid" });
  b.part(ball(6, 4), BUTTER, { at: [JAR_C[0], 0.915, JAR_C[2]], scale: 0.028, bone: chassis, flat: true });
  const seedRng = rng(11);
  const jarSeeds: THREE.BufferGeometry[][] = [[], []];
  for (let i = 0; i < 16; i++) {
    const r = 0.055 * Math.sqrt(seedRng());
    const a = seedRng() * Math.PI * 2;
    const y = 0.675 + seedRng() * 0.17;
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(seedRng() * 3, seedRng() * 3, seedRng() * 3));
    jarSeeds[i % 2].push(placed(ball(5, 3), [JAR_C[0] + r * Math.cos(a), y, JAR_C[2] + r * Math.sin(a)], q, [0.02, 0.034, 0.013]));
  }
  b.part(mergeGeometries(jarSeeds[0]), SEED, { at: [0, 0, 0], bone: chassis, flat: true, name: "jarSeeds" });
  b.part(mergeGeometries(jarSeeds[1]), SEED_D, { at: [0, 0, 0], bone: chassis, flat: true, name: "jarSeedsDark" });

  // ------------------------------------------------------------------------------------------ hamster body
  const torso = b.sweep(spine, [0.15, 0.17, 0.16], { color: LILAC, sides: 8, smooth: false, name: "torso" });
  const torsoSkin = b.surface(torso);
  const chestHit = torsoSkin.around([0, 0.5, -0.03]).at(0, -8);
  if (chestHit) b.decal(torsoSkin, CHEST, { at: chestHit, dir: [0, 0, -1], size: [0.13, 0.104], lift: 0.004, segments: 12 });
  const beltPath = torsoSkin.loop([0, 0.455, -0.04], { dir: [0, 1, 0], lift: 0.006 });
  b.sweep(beltPath, 0.014, { color: BUTTER, sides: 8, smooth: false, name: "belt" });
  // tail nub
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.4, -0.18],
      [0, 0.41, -0.25],
      [0, 0.43, -0.3],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  b.sweep(tail, [0.05, 0.035], { color: FUR, sides: 8, smooth: false, caps: "flat", name: "tailNub" });
  b.part(ball(6, 4), CREAM, { at: [0, 0.43, -0.3], scale: 0.05, bone: tail.tip ?? tail.joints[2], flat: true, name: "tailPom" });

  // legs with round boots
  for (const s of SIDES) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.11, 0.43, -0.03], [s * 0.125, 0.43, 0.2], [0.13, 0.12], [0, 1, 0]);
    const leg = b.chain(`leg${side}`, pts, { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg" });
    b.sweep(leg, [0.055, 0.048, 0.046], { color: LILAC, sides: 8, smooth: false, name: "leg" });
    b.part(ball(8, 6), BUTTER, {
      at: [s * 0.125, 0.425, 0.225],
      scale: [0.06, 0.05, 0.075],
      bone: leg.tip ?? leg.joints[2],
      flat: true,
      name: "boot",
    });
  }

  // steering wheel
  const WC: V = [0, 0.5, 0.25];
  const nWheel = new THREE.Vector3(0, 0.8, -0.6).normalize();
  const uWheel = new THREE.Vector3(0, 1, 0).addScaledVector(nWheel, -nWheel.y).normalize();
  const steering = b.joint("steering", { parent: chassis, at: WC, dir: nWheel.toArray(), role: "hinge" });
  const wheelPoint = (deg: number, r = 0.085): V => {
    const a = deg * DEG;
    return [r * Math.cos(a), WC[1] + r * Math.sin(a) * uWheel.y, WC[2] + r * Math.sin(a) * uWheel.z];
  };
  const ringPts: V[] = [];
  for (let k = 0; k < 8; k++) ringPts.push(wheelPoint(k * 45));
  b.sweep(polyline(ringPts, { closed: true }), 0.013, { color: CORAL, sides: 8, smooth: false, bone: steering, name: "steeringRing" });
  for (const deg of [90, 210, 330]) b.rod(WC, wheelPoint(deg, 0.08), 0.01, { color: CORAL, sides: 8, smooth: false, bone: steering });
  b.part(ball(6, 4), BUTTER, { at: WC, scale: 0.03, bone: steering, flat: true, name: "steeringHub" });
  b.rod([0, 0.42, 0.32], WC, 0.014, { color: LILAC_D, sides: 8, smooth: false, bone: chassis, name: "column" });

  // arms: shoulders to paws on the wheel
  for (const s of SIDES) {
    const side = s > 0 ? "L" : "R";
    const grip = wheelPoint(s > 0 ? 25 : 155);
    const pts = limb([s * 0.15, 0.53, -0.01], grip, [0.17, 0.16], [s * 0.6, -0.8, -0.2]);
    const arm = b.chain(`arm${side}`, pts, { parent: chest, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm" });
    b.sweep(arm, [0.056, 0.047, 0.042], {
      bands: [
        [0.86, LILAC],
        [1, BUTTER],
      ],
      sides: 8,
      smooth: false,
      caps: "flat",
      name: "arm",
    });
    const wrist = arm.tip ?? arm.joints[2];
    b.part(ball(7, 5), CREAM, { at: grip, scale: [0.05, 0.048, 0.05], bone: wrist, flat: true, name: "paw" });
    for (const dx of [-0.024, 0, 0.024])
      b.part(ball(5, 4), CREAM, { at: [grip[0] + dx, grip[1] - 0.004, grip[2] + 0.04], scale: 0.02, bone: wrist, flat: true, name: "toe" });
  }

  // ------------------------------------------------------------------------------------------ hamster head
  const skull = b.part(ball(10, 8), FUR, { at: HEAD_C, scale: [0.17, 0.16, 0.165], bone: head, flat: true, name: "skull" });
  const skin = b.surface(skull);
  const cheeks = SIDES.map((s) =>
    b.part(ball(8, 6), CREAM, { at: hl(s * 0.14, -0.065, 0.06), scale: [0.1, 0.095, 0.1], bone: head, flat: true, name: "cheek" }),
  );
  const muzzle = b.part(ball(8, 6), CREAM, { at: hl(0, -0.045, 0.135), scale: [0.075, 0.05, 0.065], bone: head, flat: true, name: "muzzle" });
  b.part(ball(6, 4), PINK, { at: hl(0, -0.022, 0.197), scale: [0.024, 0.018, 0.018], bone: head, flat: true, name: "nose" });
  b.part(ball(7, 4), PLUM, { at: hl(0, -0.09, 0.135), scale: [0.055, 0.02, 0.05], bone: head, flat: true, name: "mouthInside" });
  for (const s of SIDES)
    b.part(new THREE.BoxGeometry(0.024, 0.036, 0.013), WHITE, { at: hl(s * 0.014, -0.092, 0.178), bone: head, flat: true, name: "tooth" });
  b.part(ball(8, 6), CREAM, { at: hl(0, -0.118, 0.135), scale: [0.06, 0.03, 0.058], bone: jaw, flat: true, name: "lowerJaw" });
  b.part(ball(6, 4), PINK, { at: hl(0, -0.103, 0.14), scale: [0.03, 0.012, 0.03], bone: jaw, flat: true, name: "tongue" });

  for (const s of SIDES) {
    const side = s > 0 ? "L" : "R";
    const eyeHit = skin.around(HEAD_C).at(s * 33, 10);
    if (eyeHit) b.decal(skin, EYE, { at: eyeHit, size: [0.066, 0.079], lift: 0.003, segments: 14 });
    const browHit = skin.around(HEAD_C).at(s * 34, 35);
    if (browHit) b.decal(skin, BROW, { at: browHit, size: [0.04, 0.022], lift: 0.003, roll: s * -12 });
    const cheekSkin = b.surface(cheeks[s > 0 ? 0 : 1]);
    const blushHit = cheekSkin.around(cheeks[s > 0 ? 0 : 1].at).at(s * 40, 28);
    if (blushHit) b.decal(cheekSkin, BLUSH, { at: blushHit, dir: [-s * 0.35, -0.1, -1], size: [0.06, 0.034], lift: 0.003, roll: s * 8 });
    // seeds bulging in the cheek
    const seedSpots: Array<[number, number, number, number]> = [
      [s * 12, -34, 20 * s, 0.072],
      [s * 36, -20, -15 * s, 0.07],
      [s * 54, -4, 25 * s, 0.065],
    ];
    for (const [az, el, roll, h] of seedSpots) {
      const hit = cheekSkin.around(cheeks[s > 0 ? 0 : 1].at).at(az, el);
      if (hit) b.decal(cheekSkin, SEED_DECAL, { at: hit, size: [h * 0.62, h], lift: 0.003, roll, segments: 8 });
    }
    // ears
    const ear = b.joint(`ear${side}`, { parent: head, at: hl(s * 0.105, 0.115, -0.01), dir: [s * 0.4, 1, 0], role: "hinge" });
    const earAt = hl(s * 0.12, 0.135, -0.012);
    const octagon = (r: number): Array<[number, number]> =>
      Array.from({ length: 8 }, (_, k) => [r * Math.cos(k * 45 * DEG), r * Math.sin(k * 45 * DEG)]);
    b.extrude(octagon(0.058), { at: earAt, x: [1, 0, 0], y: [s * 0.25, 1, 0], thickness: 0.022, color: FUR, bone: ear, name: "ear" });
    b.extrude(octagon(0.036), { at: earAt, x: [1, 0, 0], y: [s * 0.25, 1, 0], thickness: 0.028, color: PINK, bone: ear, name: "earInner" });
    // whiskers
    b.cards([frame(hl(s * 0.07, -0.05, 0.17), [s, -0.1, 0.4])], WHISKER, { size: [0.11, 0.1], flow: [0, 0, 1], bone: head });
    // fur tufts flaring from the lower cheek
    const tuftFrames = [-10, -32, -54].map((el) => cheekSkin.around(cheeks[s > 0 ? 0 : 1].at).at(s * 78, el)!);
    b.cards(tuftFrames, TUFT_CREAM, { size: [0.04, 0.05], lean: 55, flow: [0, -1, 0.3], bone: head });
  }
  const stripeHit = skin.around(HEAD_C).at(0, 76);
  if (stripeHit) b.decal(skin, STRIPE, { at: stripeHit, size: [0.05, 0.13], lift: 0.003, segments: 12 });
  b.cards(
    [-28, 0, 28].map((az) => skin.around(HEAD_C).at(az, 74)!),
    TUFT_FUR,
    { size: [0.05, 0.06], lean: 18, flow: [0, 0, 1], bone: head },
  );
  void muzzle;

  // a seed sticking out of each mouth corner
  for (const s of SIDES)
    b.part(ball(6, 4), WHITE, {
      at: hl(s * 0.075, -0.098, 0.18),
      dir: [s * 0.9, 0.35, 0.5],
      scale: [0.013, 0.03, 0.011],
      texture: SEED_STRIPES,
      bone: head,
      flat: true,
      name: "mouthSeed",
    });

  // floating seeds inside the helmet (zero-g)
  const floaters: Array<[THREE.Vector3, V]> = [
    [hl(0.21, 0.17, -0.03), [0.4, 1, 0.3]],
    [hl(-0.2, 0.2, -0.05), [-0.3, 1, 0.5]],
    [hl(0.02, 0.2, 0.12), [0.5, 1, -0.2]],
  ];
  for (const [p, d] of floaters)
    b.part(ball(6, 4), WHITE, { at: p, dir: d, scale: [0.014, 0.027, 0.011], texture: SEED_STRIPES, bone: head, flat: true, name: "floatSeed" });

  // ------------------------------------------------------------------------------------------ helmet
  const HELMET_C: V = [0, 0.715, 0];
  b.part(new THREE.SphereGeometry(1, 12, 9, 0, Math.PI * 2, 0, 2.3), WHITE, {
    at: HELMET_C,
    scale: 0.28,
    rotation: [0, -90, 0],
    texture: HELMET,
    bone: chest,
    flat: true,
    name: "helmet",
  });
  b.lathe(
    [
      [0.16, -0.04],
      [0.235, -0.04],
      [0.255, -0.005],
      [0.235, 0.035],
      [0.17, 0.05],
    ],
    { at: [0, 0.495, 0], segments: 10, color: SKY, bone: chest, name: "collar" },
  );
  for (let k = 0; k < 8; k++) {
    const a = (k * 45 + 22) * DEG;
    b.part(ball(5, 4), k % 2 ? CORAL : MINT, {
      at: [0.252 * Math.sin(a), 0.496, 0.252 * Math.cos(a)],
      scale: 0.018,
      bone: chest,
      flat: true,
      name: "collarLight",
    });
  }

  return b.root;
}
