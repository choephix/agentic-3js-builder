import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { paint, stripes, gradient } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";

export const meta = {
  name: "Barnstormer Biplane",
  description:
    "A whimsical open-cockpit barnstormer biplane: fat round fuselage, big cheerful cowl and propeller, striped cloth wings with rigging wires, a goggled pilot with a long scarf, patched repairs and a trailing banner.",
  style: "whimsical",
  commit: "88fc1f0",
};

// ---------- palette ----------
const CREAM = cel("#fff0c8", "#e8c9a0");
const RED = cel("#e5412d", "#a8244a");
const TEAL = cel("#2bb6b0", "#1f7d96");
const YELLOW = cel("#ffc93a", "#e8892a");
const WOOD = cel("#c98a4b", "#8f5a3a");
const DARKWOOD = cel("#8a5530", "#5a3050");
const METAL = cel("#9aa7b4", "#5f6a8c");
const DARKMETAL = cel("#4b4f66", "#2c2c46");
const LEATHER = cel("#8c4a2b", "#5a2a3a");
const TIRE = cel("#3a3340", "#1f1a2c");
const HUB = cel("#f4d35e", "#c98a2e");
const PINK = cel("#ff8fa3", "#d45a8a");
const WIRE = "#3b3346";
const SKIN = cel("#f2b48f", "#d17f78");
const GLASS = "#9fe3ee";
const SPOKE = cel("#d9a45a", "#a8683a");

const WING_TOP = cel(stripes("#fff0c8", "#ffd9a0", { size: 0.28, axis: "x", width: 0.12, wobble: 0.15, seed: 3 }), "#d9b98c");
const WING_BOT = cel(stripes("#fff0c8", "#9fe3ee", { size: 0.3, axis: "x", width: 0.1, seed: 9 }), "#cfae88");
const WING_UNDER = cel("#f6e2b0", "#cfae88");
const FUSE_PAINT = paint((p, n) => {
  const base = p.y < 0.85 && n.y < -0.1 ? CREAM : RED;
  return p.z < -1.7 ? TEAL : base;
});
const FUSE = cel(FUSE_PAINT);
const COWL = cel(gradient("#e5412d", "#ff7a4a", [0, 0.8, 1.2], [0, 0.8, 2.1]));
const PLANK = paint((p) => ((Math.floor(p.x / 0.1) + Math.floor(p.z / 0.1)) % 2 ? "#c98a4b" : "#b57a40"));
const SCARF = stripes("#ffc93a", "#e5412d", { size: 0.14, axis: "z", width: 0.5 });

// ---------- decals ----------
const STAR = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#fff0c8" stroke="#22112f" stroke-width="4"/><circle cx="32" cy="32" r="20" fill="#2bb6b0"/><polygon points="32,12 37,26 52,26 40,35 45,50 32,41 19,50 24,35 12,26 27,26" fill="#ffc93a" stroke="#22112f" stroke-width="2.5"/></svg>`,
  { size: 128 },
);
const NUM = svg(
  `<svg viewBox="0 0 96 48"><text x="48" y="38" font-size="40" font-family="Arial Black, Impact, sans-serif" font-weight="900" text-anchor="middle" fill="#fff0c8" stroke="#22112f" stroke-width="3" paint-order="stroke">B-17</text></svg>`,
  { size: 192 },
);
const BANNER = svg(
  `<svg viewBox="0 0 256 64"><path d="M2 8 Q64 0 128 8 T254 8 L240 32 L254 56 Q192 64 128 56 T2 56 Z" fill="#fff0c8" stroke="#22112f" stroke-width="4"/><text x="128" y="42" font-size="30" font-family="Georgia, serif" font-weight="bold" text-anchor="middle" fill="#e5412d">AIR SHOW TODAY!</text></svg>`,
  { size: 512 },
);
const FLAG = svg(
  `<svg viewBox="0 0 48 48"><path d="M2 4 L46 24 L2 44 Z" fill="#ffc93a" stroke="#22112f" stroke-width="3"/><circle cx="14" cy="24" r="5" fill="#e5412d"/></svg>`,
  { size: 96 },
);
const PATCH = svg(
  `<svg viewBox="0 0 48 48"><rect x="3" y="3" width="42" height="42" rx="4" fill="#2bb6b0" stroke="#22112f" stroke-width="3"/><path d="M8 8 L40 40 M40 8 L8 40" stroke="#fff0c8" stroke-width="3" stroke-dasharray="5 4"/></svg>`,
  { size: 96 },
);
const DIAL = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#fff0c8" stroke="#22112f" stroke-width="5"/><path d="M32 32 L46 20" stroke="#e5412d" stroke-width="5"/><path d="M12 32 h6 M46 32 h6 M32 12 v6" stroke="#22112f" stroke-width="4"/></svg>`,
  { size: 96 },
);
const EYE = svg(
  `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="#fff" stroke="#22112f" stroke-width="3"/><circle cx="18" cy="17" r="6" fill="#3a2a1a"/><circle cx="20" cy="14" r="2.4" fill="#fff"/></svg>`,
  { size: 64 },
);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "barnstormerBiplane", paintSize: 2048 });
  const R = rng(7);

  // Coordinates: +Z forward (nose), +Y up, +X left. Wheels' bottom at y=0.
  const AX = 1.3; // fuselage axis height

  // ---------- fuselage: fat rounded teardrop ----------
  b.loft(
    [
      { at: [0, AX - 0.02, -3.15], w: 0.05, h: 0.1 },
      { at: [0, AX + 0.04, -2.6], w: 0.16, h: 0.26 },
      { at: [0, AX + 0.07, -1.8], w: 0.34, h: 0.52 },
      { at: [0, AX + 0.05, -0.9], w: 0.56, h: 0.78 },
      { at: [0, AX, 0.0], w: 0.68, h: 0.86 },
      { at: [0, AX - 0.02, 0.9], w: 0.74, h: 0.9 },
      { at: [0, AX - 0.02, 1.5], w: 0.72, h: 0.88 },
      { at: [0, AX - 0.02, 1.9], w: 0.62, h: 0.76 },
    ],
    { color: FUSE, sides: 10, caps: "round", detail: 0.8 },
  );
  // belly keel stripe
  b.loft(
    [
      { at: [0, AX - 0.38, -1.6], w: 0.04, h: 0.04 },
      { at: [0, AX - 0.44, -0.4], w: 0.16, h: 0.06 },
      { at: [0, AX - 0.44, 1.2], w: 0.18, h: 0.06 },
    ],
    { color: YELLOW, sides: 6, caps: "round", detail: 0.6 },
  );
  // spine fairing behind cockpit (turtle deck)
  b.loft(
    [
      { at: [0, AX + 0.42, -0.5], w: 0.3, h: 0.14 },
      { at: [0, AX + 0.5, -1.2], w: 0.28, h: 0.14 },
      { at: [0, AX + 0.34, -2.1], w: 0.14, h: 0.1 },
    ],
    { color: RED, sides: 8, caps: "round", detail: 0.7 },
  );
  // collar at tail root
  b.lathe(
    [
      [0, 0],
      [0.2, 0],
      [0.2, 0.1],
      [0, 0.1],
    ],
    { at: [0, AX, -3.2], axis: [0, 0, 1], segments: 8, color: DARKMETAL },
  );

  // ---------- engine cowl (big, cheerful) ----------
  const cowlC: [number, number, number] = [0, AX - 0.02, 2.0];
  b.lathe(
    [
      [0, 0],
      [0.48, 0],
      [0.56, 0.18],
      [0.58, 0.42],
      [0.52, 0.62],
      [0.4, 0.72],
      [0.12, 0.76],
      [0, 0.76],
    ],
    { at: cowlC, axis: [0, 0, 1], segments: 14, smoothing: 1, color: COWL },
  );
  // cowl front ring (silver lip)
  b.sweep(
    new THREE.EllipseCurve(0, 0, 0.42, 0.42, 0, Math.PI * 2).getPoints(14).map((q) => [q.x, AX - 0.02 + q.y, 2.74]),
    0.025,
    { color: METAL, section: { ngon: 6 }, caps: "none", closed: true },
  );
  // spinner
  b.spike([0, AX - 0.02, 2.72], [0, 0, 1], 0.4, 0.15, { color: YELLOW, sides: 10, caps: "round" });
  b.part(new THREE.SphereGeometry(0.16, 10, 8), HUB, { at: [0, AX - 0.02, 2.76], scale: [1, 1, 0.8] });
  // cowl rivet ring
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.018, 5, 4), METAL, {
      at: [Math.cos(a) * 0.55, AX - 0.02 + Math.sin(a) * 0.55, 2.2],
    });
  }
  // cowl louvre vents
  for (const s of [1, -1]) {
    for (let k = 0; k < 4; k++) {
      b.part(new THREE.BoxGeometry(0.02, 0.1, 0.22), DARKMETAL, {
        at: [s * 0.572, AX - 0.1, 2.0 + k * 0.1 - 0.15],
        rotation: [0, 0, s * 8],
      });
    }
  }
  // exhaust stacks
  for (const s of [1, -1]) {
    b.sweep(
      [
        [s * 0.5, AX - 0.1, 2.35],
        [s * 0.68, AX - 0.12, 2.3],
        [s * 0.78, AX - 0.22, 1.7],
        [s * 0.8, AX - 0.28, 1.2],
      ],
      [0.05, 0.065],
      { color: DARKMETAL, sides: 6, caps: "flat" },
    );
    b.rod([s * 0.8, AX - 0.28, 1.2], [s * 0.8, AX - 0.28, 1.28], 0.075, { color: "#2a2433", sides: 6 });
  }

  // ---------- propeller ----------
  const PZ = 2.84;
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, -0.05],
        [0.2, -0.09],
        [0.7, -0.15],
        [1.05, -0.1],
        [1.1, 0.02],
        [0.8, 0.14],
        [0.3, 0.07],
        [0, 0.05],
      ],
      {
        at: [0, AX - 0.02, PZ],
        x: [0, s, 0],
        y: [1, 0, 0],
        thickness: [0.05, 0.025],
        bevel: 0.012,
        smoothing: 1,
        color: WOOD,
      },
    );
    // yellow tips
    b.rod([0, AX - 0.02 + s * 0.98, PZ], [0, AX - 0.02 + s * 1.1, PZ], [0.09, 0.07], { color: YELLOW, sides: 4 });
  }
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 10), HUB, { at: [0, AX - 0.02, PZ - 0.02], rotation: [90, 0, 0] });

  // ---------- cockpits ----------
  const cockpitZ = [-0.15, 0.95];
  for (const cz of cockpitZ) {
    b.part(new THREE.BoxGeometry(0.46, 0.06, 0.62), "#2a1c22", { at: [0, AX + 0.42, cz] });
    // padded leather coaming
    b.sweep(
      [
        [0.25, AX + 0.43, cz - 0.34],
        [0.28, AX + 0.45, cz],
        [0.25, AX + 0.43, cz + 0.34],
        [0, AX + 0.46, cz + 0.4],
        [-0.25, AX + 0.43, cz + 0.34],
        [-0.28, AX + 0.45, cz],
        [-0.25, AX + 0.43, cz - 0.34],
        [0, AX + 0.45, cz - 0.4],
      ],
      0.045,
      { color: LEATHER, sides: 6, closed: true, caps: "none" },
    );
    // seat cushion
    b.part(new THREE.BoxGeometry(0.4, 0.07, 0.34), TEAL, { at: [0, AX + 0.3, cz - 0.02] });
  }
  // windscreens
  for (const [cz, h] of [
    [1.38, 0.3],
    [0.38, 0.26],
  ] as Array<[number, number]>) {
    b.part(new THREE.BoxGeometry(0.44, h, 0.02), GLASS, { at: [0, AX + 0.6, cz], rotation: [-18, 0, 0] });
    b.rod([-0.23, AX + 0.46, cz - 0.04], [-0.23, AX + 0.74, cz + 0.04], 0.012, { color: METAL, sides: 4 });
    b.rod([0.23, AX + 0.46, cz - 0.04], [0.23, AX + 0.74, cz + 0.04], 0.012, { color: METAL, sides: 4 });
  }
  // instrument dials in the front cockpit
  for (const dx of [-0.1, 0.1]) {
    b.part(new THREE.CircleGeometry(0.05, 12), "#ffffff", {
      at: [dx, AX + 0.47, 1.26],
      dir: [0, 0.35, -1],
      axis: "z",
      texture: DIAL,
    });
  }

  // ---------- pilot ----------
  const PZP = -0.15;
  b.capsule([0, AX + 0.36, PZP - 0.05], [0, AX + 0.62, PZP - 0.02], [0.17, 0.15], { color: LEATHER, sides: 8 });
  for (const s of [1, -1]) {
    b.capsule([s * 0.17, AX + 0.6, PZP - 0.02], [s * 0.1, AX + 0.5, PZP + 0.28], 0.055, { color: LEATHER, sides: 6 });
    b.part(new THREE.SphereGeometry(0.055, 6, 5), SKIN, { at: [s * 0.1, AX + 0.5, PZP + 0.3] });
  }
  // control stick
  b.rod([0, AX + 0.32, PZP + 0.32], [0, AX + 0.55, PZP + 0.34], 0.015, { color: DARKMETAL, sides: 5 });
  b.part(new THREE.SphereGeometry(0.03, 6, 5), RED, { at: [0, AX + 0.57, PZP + 0.34] });
  // head (big, whimsical)
  b.part(new THREE.SphereGeometry(0.2, 12, 9), SKIN, { at: [0, AX + 0.9, PZP - 0.02] });
  b.part(new THREE.SphereGeometry(0.045, 6, 5), PINK, { at: [0, AX + 0.88, PZP + 0.2] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.035, 6, 4), PINK, { at: [s * 0.13, AX + 0.84, PZP + 0.15], scale: [1, 0.7, 0.5] });
  }
  // leather cap
  b.lathe(
    [
      [0, 0],
      [0.22, 0],
      [0.23, 0.05],
      [0.2, 0.14],
      [0.1, 0.22],
      [0, 0.24],
    ],
    { at: [0, AX + 0.9, PZP - 0.03], segments: 10, smoothing: 1, color: LEATHER },
  );
  // ear flaps
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.07, 6, 5), LEATHER, { at: [s * 0.2, AX + 0.88, PZP - 0.02], scale: [0.5, 1, 0.9] });
  }
  // goggle strap over the cap
  b.sweep(
    [
      [-0.2, AX + 0.96, PZP - 0.02],
      [-0.19, AX + 0.97, PZP + 0.08],
      [-0.1, AX + 0.99, PZP + 0.17],
      [0.1, AX + 0.99, PZP + 0.17],
      [0.19, AX + 0.97, PZP + 0.08],
      [0.2, AX + 0.96, PZP - 0.02],
    ],
    0.014,
    { color: DARKMETAL, sides: 4, caps: "round" },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 10), METAL, {
      at: [s * 0.09, AX + 0.98, PZP + 0.16],
      rotation: [75, 0, 0],
    });
    b.part(new THREE.CircleGeometry(0.05, 10), GLASS, {
      at: [s * 0.09, AX + 0.995, PZP + 0.183],
      dir: [0, 0.3, 1],
      axis: "z",
    });
    // eyes
    b.part(new THREE.CircleGeometry(0.045, 10), "#ffffff", {
      at: [s * 0.08, AX + 0.9, PZP + 0.185],
      dir: [0, 0, 1],
      axis: "z",
      texture: EYE,
    });
  }
  // smile
  b.sweep(
    [
      [-0.06, AX + 0.8, PZP + 0.185],
      [-0.02, AX + 0.775, PZP + 0.2],
      [0.02, AX + 0.775, PZP + 0.2],
      [0.06, AX + 0.8, PZP + 0.185],
    ],
    0.008,
    { color: "#8a3a3a", sides: 4 },
  );
  // scarf: wrap + long flowing tail
  b.sweep(
    new THREE.EllipseCurve(0, 0, 0.17, 0.17, 0, Math.PI * 2).getPoints(12).map((q) => [q.x, AX + 0.7, PZP - 0.02 + q.y * 0.9]),
    0.05,
    { color: RED, sides: 6, closed: true, caps: "none" },
  );
  b.sweep(
    [
      [0.1, AX + 0.68, PZP - 0.15],
      [0.2, AX + 0.74, PZP - 0.6],
      [0.34, AX + 0.7, PZP - 1.1],
      [0.3, AX + 0.78, PZP - 1.6],
      [0.42, AX + 0.74, PZP - 2.0],
    ],
    [0.06, 0.03],
    { color: SCARF, sides: 4, caps: "flat" },
  );

  // ---------- tail group ----------
  // vertical fin + rudder
  b.extrude(
    [
      [0, 0],
      [0.7, 0],
      [0.74, 0.12],
      [0.55, 0.9],
      [0.12, 1.0],
      [-0.1, 0.7],
    ],
    {
      at: [0, AX + 0.02, -3.1],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.06,
      bevel: 0.015,
      smoothing: 1,
      color: RED,
    },
  );
  b.extrude(
    [
      [0, 0],
      [0.52, 0],
      [0.6, 0.55],
      [0.4, 0.95],
      [0.1, 0.85],
    ],
    {
      at: [0, AX + 0.02, -3.58],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.055,
      bevel: 0.012,
      smoothing: 1,
      color: YELLOW,
    },
  );
  // horizontal stabilisers + elevators
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.95, 0.05],
        [1.2, 0.35],
        [0.9, 0.62],
        [0.0, 0.7],
      ],
      {
        at: [0, AX + 0.02, -2.85],
        x: [s, 0, 0],
        y: [0, 0, -1],
        thickness: 0.07,
        bevel: 0.02,
        smoothing: 1,
        color: TEAL,
      },
    );
    b.extrude(
      [
        [0, 0],
        [1.0, 0.05],
        [1.22, 0.3],
        [0.0, 0.3],
      ],
      {
        at: [0, AX + 0.02, -3.52],
        x: [s, 0, 0],
        y: [0, 0, -1],
        thickness: 0.05,
        bevel: 0.012,
        smoothing: 1,
        color: YELLOW,
      },
    );
    // tail bracing wires
    b.rod([s * 0.6, AX + 0.05, -3.0], [0.02, AX + 0.65, -3.15], 0.008, { color: WIRE, sides: 3 });
    b.rod([s * 0.6, AX - 0.02, -3.0], [0.02, AX - 0.18, -2.7], 0.008, { color: WIRE, sides: 3 });
  }
  // tail skid
  b.sweep(
    [
      [0, AX - 0.12, -2.95],
      [0, AX - 0.5, -3.15],
      [0, AX - 0.9, -3.3],
      [0, 0.34, -3.45],
    ],
    [0.045, 0.035],
    { color: DARKWOOD, sides: 6 },
  );
  b.part(new THREE.SphereGeometry(0.07, 8, 6), METAL, { at: [0, 0.3, -3.46], scale: [1, 0.7, 1.3] });
  b.part(new THREE.SphereGeometry(0.13, 8, 6), TIRE, { at: [0, 0.13, -3.5], scale: [0.5, 1, 1] });
  // rudder hinge pins
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.SphereGeometry(0.02, 5, 4), METAL, { at: [0, AX + 0.1 + i * 0.22, -3.56] });
  }

  // ---------- wings ----------
  const wing = (
    y: number,
    zc: number,
    span: number,
    chord: number,
    top: ReturnType<typeof cel>,
    tipColor: string,
    sweepZ: number,
    dihedral: number,
  ) => {
    for (const s of [1, -1]) {
      b.extrude(
        [
          [0, chord / 2],
          [span * 0.88, chord / 2 - sweepZ * 0.88 - 0.02],
          [span, chord / 2 - sweepZ - chord * 0.22],
          [span + 0.02, chord / 2 - sweepZ - chord * 0.5],
          [span, -chord / 2 - sweepZ + chord * 0.2],
          [span * 0.88, -chord / 2 - sweepZ * 0.88 + 0.01],
          [0, -chord / 2],
        ],
        {
          at: [0, y, zc],
          x: [s, dihedral * s, 0],
          y: [0, 0, 1],
          thickness: [0.1, 0.05],
          bevel: 0.025,
          smoothing: 1,
          color: paint((p, n) => (n.y > 0.2 ? top : n.y < -0.2 ? WING_UNDER : CREAM)),
        },
      );
      // wing tip bow cap
      b.part(new THREE.SphereGeometry(0.1, 8, 6), tipColor, {
        at: [s * span, y + dihedral * span, zc - sweepZ - chord * 0.15],
        scale: [0.5, 0.55, chord * 3.0],
      });
      // leading edge tube
      b.rod(
        [s * 0.05, y, zc + chord / 2 - 0.02],
        [s * span * 0.97, y + dihedral * span * 0.97, zc + chord / 2 - sweepZ * 0.97 - 0.04],
        0.045,
        { color: RED, sides: 6 },
      );
      // ribs on top (little raised stitches)
      const nRib = 9;
      for (let i = 1; i <= nRib; i++) {
        const t = i / (nRib + 1);
        const xx = s * span * t;
        const yy = y + dihedral * span * t + 0.054 - 0.015 * t;
        b.rod([xx, yy, zc + chord / 2 - sweepZ * t - 0.12], [xx, yy, zc - chord / 2 - sweepZ * t + 0.1], 0.014, {
          color: "#e7d2a0",
          sides: 4,
        });
      }
      // aileron outline
      const a0 = 0.5;
      const a1 = 0.94;
      b.rod(
        [s * span * a0, y + dihedral * span * a0 + 0.058, zc - chord / 2 - sweepZ * a0 + chord * 0.3],
        [s * span * a1, y + dihedral * span * a1 + 0.055, zc - chord / 2 - sweepZ * a1 + chord * 0.3],
        0.012,
        { color: INK, sides: 4 },
      );
    }
  };
  const TOPY = AX + 1.0;
  const BOTY = AX - 0.45;
  wing(TOPY, 0.7, 3.8, 1.25, WING_TOP, "#e5412d", 0.12, 0.012);
  wing(BOTY, 0.85, 3.7, 1.15, WING_BOT, "#2bb6b0", 0.1, 0.03);
  // centre-section for the top wing
  b.part(new THREE.BoxGeometry(0.6, 0.11, 1.2), CREAM, { at: [0, TOPY, 0.7] });
  for (const s of [1, -1]) {
    // cabane struts from fuselage to top wing
    b.rod([s * 0.22, AX + 0.45, 1.25], [s * 0.38, TOPY - 0.03, 1.05], 0.03, { color: DARKWOOD, sides: 5 });
    b.rod([s * 0.22, AX + 0.45, 0.2], [s * 0.38, TOPY - 0.03, 0.45], 0.03, { color: DARKWOOD, sides: 5 });
    // interplane struts
    for (const [sx, zf] of [
      [1.55, 1.15],
      [1.6, 0.35],
    ] as Array<[number, number]>) {
      const y0 = BOTY + 0.03 + 0.03 * sx;
      const y1 = TOPY - 0.03 + 0.012 * sx;
      b.rod([s * sx, y0, zf + 0.15], [s * sx, y1, zf - 0.05], [0.04, 0.035], { color: DARKWOOD, sides: 6 });
      b.part(new THREE.BoxGeometry(0.1, 0.05, 0.1), YELLOW, { at: [s * sx, y0, zf + 0.15] });
      b.part(new THREE.BoxGeometry(0.1, 0.05, 0.1), YELLOW, { at: [s * sx, y1, zf - 0.05] });
    }
    // outer struts
    b.rod([s * 3.3, BOTY + 0.1, 1.0], [s * 3.3, TOPY + 0.04, 0.82], [0.035, 0.03], { color: DARKWOOD, sides: 6 });
    // flying wires
    b.rod([s * 1.55, BOTY + 0.08, 1.3], [s * 1.6, TOPY - 0.02, 0.3], 0.01, { color: WIRE, sides: 3 });
    b.rod([s * 1.55, BOTY + 0.08, 0.3], [s * 1.6, TOPY - 0.02, 1.1], 0.01, { color: WIRE, sides: 3 });
    b.rod([s * 3.3, BOTY + 0.12, 0.95], [s * 1.6, TOPY - 0.02, 0.35], 0.009, { color: WIRE, sides: 3 });
    b.rod([s * 3.3, TOPY, 0.85], [s * 1.55, BOTY + 0.08, 1.3], 0.009, { color: WIRE, sides: 3 });
    b.rod([s * 3.3, BOTY + 0.12, 0.95], [s * 0.3, AX - 0.1, 0.9], 0.009, { color: WIRE, sides: 3 });
    // landing wire from top wing to nose
    b.rod([s * 1.6, TOPY + 0.04, 1.2], [s * 0.2, AX + 0.45, 2.0], 0.009, { color: WIRE, sides: 3 });
    // turnbuckle
    b.part(new THREE.BoxGeometry(0.02, 0.02, 0.06), METAL, { at: [s * 1.58, (BOTY + TOPY) / 2, 0.7] });
    // roundels on top wing and underside
    b.part(new THREE.CircleGeometry(0.42, 16), "#ffffff", {
      at: [s * 2.35, TOPY + 0.064 + 0.012 * 2.35, 0.62],
      dir: [0, 1, 0],
      axis: "z",
      texture: STAR,
      up: [0, 0, 1],
    });
    b.part(new THREE.CircleGeometry(0.4, 16), "#ffffff", {
      at: [s * 2.3, BOTY - 0.054 + 0.03 * 2.3 - 0.01, 0.8],
      dir: [0, -1, 0],
      axis: "z",
      texture: STAR,
      up: [0, 0, 1],
    });
    // repair patches
    b.part(new THREE.PlaneGeometry(0.24, 0.24), "#ffffff", {
      at: [s * 3.0, TOPY + 0.057 + 0.012 * 3.0 + 0.008, 0.5],
      dir: [0, 1, 0],
      axis: "z",
      texture: PATCH,
      up: [0, 0, 1],
    });
    b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
      at: [s * 1.0, BOTY + 0.059 + 0.03 * 1.0 + 0.008, 0.7],
      dir: [0, 1, 0],
      axis: "z",
      texture: PATCH,
      up: [0, 0, 1],
    });
    // wing-tip lamps
    b.part(new THREE.SphereGeometry(0.04, 6, 5), s > 0 ? "#ff5050" : "#50ff80", {
      at: [s * 3.84, TOPY + 0.012 * 3.84, 0.4],
    });
  }
  // fuselage-to-bottom-wing root fairing
  b.part(new THREE.BoxGeometry(0.9, 0.1, 1.15), CREAM, { at: [0, BOTY, 0.85] });
  // top-wing plank trim
  b.part(new THREE.BoxGeometry(0.62, 0.02, 1.22), PLANK, { at: [0, TOPY + 0.06, 0.7] });

  // ---------- landing gear ----------
  for (const s of [1, -1]) {
    // V struts
    b.rod([s * 0.3, AX - 0.5, 1.2], [s * 0.78, 0.46, 1.1], 0.045, { color: DARKWOOD, sides: 6 });
    b.rod([s * 0.3, AX - 0.5, 0.6], [s * 0.78, 0.46, 1.1], 0.045, { color: DARKWOOD, sides: 6 });
    // axle
    b.rod([s * 0.78, 0.46, 1.1], [s * 0.82, 0.42, 1.1], 0.03, { color: METAL, sides: 6 });
    // bungee coils
    for (let i = 0; i < 6; i++) {
      b.part(new THREE.TorusGeometry(0.05, 0.012, 4, 8), DARKMETAL, {
        at: [s * (0.5 + i * 0.03), AX - 0.75 - i * 0.05, 1.1],
        rotation: [90, 0, 0],
      });
    }
    // wheel
    b.part(new THREE.TorusGeometry(0.28, 0.1, 8, 14), TIRE, { at: [s * 0.84, 0.42, 1.1], rotation: [0, 90, 0] });
    b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.12, 14), SPOKE, { at: [s * 0.84, 0.42, 1.1], rotation: [0, 0, 90] });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.2, 8), HUB, { at: [s * 0.86, 0.42, 1.1], rotation: [0, 0, 90] });
    b.part(new THREE.CircleGeometry(0.08, 8), "#ffffff", {
      at: [s * 0.97, 0.42, 1.1],
      dir: [s, 0, 0],
      axis: "z",
      texture: FLAG,
    });
    // mud splats
    for (let i = 0; i < 4; i++) {
      const a = R() * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.03, 5, 4), "#7a5a3a", {
        at: [s * 0.94, 0.42 + Math.cos(a) * 0.3, 1.1 + Math.sin(a) * 0.3],
        scale: [0.4, 1, 1],
      });
    }
  }
  // cross-axle
  b.rod([-0.84, 0.42, 1.1], [0.84, 0.42, 1.1], 0.025, { color: DARKMETAL, sides: 5 });

  // ---------- details on fuselage ----------
  for (const s of [1, -1]) {
    b.part(new THREE.CircleGeometry(0.28, 14), "#ffffff", {
      at: [s * 0.4, AX + 0.02, -1.05],
      dir: [s, 0, 0],
      axis: "z",
      texture: STAR,
    });
    b.part(new THREE.PlaneGeometry(0.62, 0.31), "#ffffff", {
      at: [s * 0.3, AX + 0.12, -2.0],
      dir: [s, 0.05, 0],
      axis: "z",
      texture: NUM,
    });
    // cheeky eyebrow stripes on cowl
    b.sweep(
      [
        [s * 0.25, AX + 0.3, 2.64],
        [s * 0.34, AX + 0.34, 2.6],
        [s * 0.44, AX + 0.3, 2.54],
      ],
      0.012,
      { color: INK, sides: 4 },
    );
    // panel line and handles
    b.rod([s * 0.4, AX - 0.25, 1.7], [s * 0.4, AX - 0.25, -0.9], 0.006, { color: INK, sides: 3 });
    b.part(new THREE.BoxGeometry(0.03, 0.03, 0.1), METAL, { at: [s * 0.42, AX + 0.2, 0.4] });
    b.part(new THREE.BoxGeometry(0.03, 0.03, 0.1), METAL, { at: [s * 0.42, AX + 0.2, 1.3] });
    // rivet row
    for (let i = 0; i < 10; i++) {
      b.part(new THREE.SphereGeometry(0.014, 4, 3), METAL, { at: [s * 0.38, AX + 0.3, -1.5 + i * 0.28] });
    }
    // patch on fuselage
    b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
      at: [s * 0.74, AX - 0.15, 0.9],
      dir: [s, 0, 0],
      axis: "z",
      texture: PATCH,
    });
  }
  // pennant on a mast above the top wing
  b.rod([0, TOPY + 0.06, 1.2], [0, TOPY + 0.55, 1.2], 0.012, { color: METAL, sides: 4 });
  b.part(new THREE.PlaneGeometry(0.4, 0.3), "#ffffff", {
    at: [0.004, TOPY + 0.42, 0.97],
    dir: [1, 0, 0],
    axis: "z",
    texture: FLAG,
  });
  b.part(new THREE.PlaneGeometry(0.4, 0.3), "#ffffff", {
    at: [-0.004, TOPY + 0.42, 0.97],
    dir: [-1, 0, 0],
    axis: "z",
    texture: FLAG,
  });
  // pitot tube
  b.rod([-1.6, TOPY - 0.1, 1.3], [-1.6, TOPY - 0.1, 1.65], [0.012, 0.008], { color: METAL, sides: 4 });

  // ---------- trailing banner ----------
  b.sweep(
    [
      [0, AX - 0.1, -3.35],
      [0.0, AX - 0.35, -3.9],
      [0.1, AX - 0.5, -4.4],
    ],
    0.01,
    { color: WIRE, sides: 3 },
  );
  b.cards([frame([0.1, AX - 0.45, -4.4], [0, 1, 0])], BANNER, {
    size: [1.6, 0.4],
    lean: 90,
    flow: [0, 0, -1],
    mirror: true,
  });

  // luggage trunk behind the pilot
  b.part(new THREE.BoxGeometry(0.3, 0.2, 0.34), LEATHER, { at: [0, AX + 0.6, -0.7] });
  b.part(new THREE.BoxGeometry(0.32, 0.03, 0.08), YELLOW, { at: [0, AX + 0.6, -0.7] });
  b.part(new THREE.BoxGeometry(0.04, 0.22, 0.36), METAL, { at: [0, AX + 0.6, -0.7] });

  return b.root;
}
