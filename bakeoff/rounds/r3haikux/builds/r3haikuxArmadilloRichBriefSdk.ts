import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Nine-banded armadillo",
  description:
    "A trotting nine-banded armadillo: a shell of overlapping banded plates in dusty pinkish-tan, a pointed snout, tall leathery ears, small beady eyes, clawed feet, a long tapering armoured tail and coarse pale hairs between the bands.",
};

type Pt = [number, number, number];
/** A profile as [z, radius] pairs with z ascending. Radius is in units of the shell ellipse. */
type Prof = [number, number][];

// Palette
const SHELL = "#c9a090"; // dusty pinkish-tan plates
const BAND = "#d6ad9c"; // bands, a shade lighter
const SKIN = "#986f67"; // leathery skin showing in the gaps
const SCUTE = "#ab7d72"; // small scutes on the plates
const LEG = "#b98c7e";
const PAD = "#8a6760";
const CLAW = "#eee1cb";
const HAIR = "#f5eee0";
const EAR = "#dba89b";
const JAW_C = "#d6b1a2";
const EYE = "#120d0c";
const GLINT = "#fbf8f0";
const NOSE = "#3c2827";

// Metres. +Y up, nose at +Z, left side is +X.
const CY = 0.2; // shell centre height
const RX = 0.1; // shell half-width at radius 1
const RY = 0.085; // shell half-height at radius 1
const HRX = 0.066; // head half-width at radius 1
const HRY = 0.05; // head half-height at radius 1

const BODY: Prof = [
  [-0.225, 0.0], [-0.21, 0.3], [-0.19, 0.62], [-0.15, 0.85], [-0.09, 0.97],
  [0.0, 1.0], [0.07, 1.0], [0.12, 0.96], [0.16, 0.84], [0.168, 0.5], [0.172, 0.0],
];
const HEAD: Prof = [
  [0.08, 0.7], [0.11, 1.0], [0.15, 0.98], [0.185, 0.84], [0.22, 0.62],
  [0.255, 0.4], [0.28, 0.2], [0.3, 0.0],
];
const JAW: Prof = [
  [0.13, 0.0], [0.14, 0.8], [0.19, 0.9], [0.24, 0.7], [0.27, 0.42], [0.29, 0.14], [0.295, 0.0],
];

function radiusAt(p: Prof, z: number): number {
  if (z <= p[0][0]) return p[0][1];
  for (let i = 0; i < p.length - 1; i++) {
    const [z0, r0] = p[i];
    const [z1, r1] = p[i + 1];
    if (z <= z1) return z1 === z0 ? r1 : r0 + ((r1 - r0) * (z - z0)) / (z1 - z0);
  }
  return p[p.length - 1][1];
}

/** A raised band or plate that follows the body profile between zLo and zHi. */
function ridge(zLo: number, zHi: number, lift: number, steps: number): Prof {
  const out: Prof = [[zLo, Math.max(0, radiusAt(BODY, zLo) - 0.05)]];
  for (let k = 0; k <= steps; k++) {
    const t = k / steps;
    const z = zLo + (zHi - zLo) * t;
    out.push([z, radiusAt(BODY, z) + lift * Math.sin(Math.PI * t)]);
  }
  out.push([zHi, Math.max(0, radiusAt(BODY, zHi) - 0.05)]);
  return out;
}

/** A lathe turned along Z and squashed into an elliptical section. */
function shell(p: Prof, rx: number, ry: number, seg: number): THREE.BufferGeometry {
  const g = new THREE.LatheGeometry(
    p.map(([z, r]) => new THREE.Vector2(r, z)),
    seg,
  );
  g.scale(rx, 1, ry);
  g.rotateX(Math.PI / 2);
  return g;
}

export default function build() {
  const b = createBuilder({ name: "nine-banded-armadillo" });
  const rand = rng(9);

  // ---- skeleton --------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, CY, -0.11] });
  type J = typeof hips;
  const chest = b.joint("chest", { at: [0, CY, 0.08], parent: hips });
  const head = b.joint("head", { at: [0, CY, 0.14], parent: chest });
  const jaw = b.joint("jaw", { at: [0, 0.15, 0.15], parent: head });

  const tailAt = (t: number): Pt => [0, CY - 0.08 * t, -0.2 - 0.3 * t];
  let prev: J = hips;
  for (let i = 0; i < 6; i++) {
    prev = b.joint(`tail${i + 1}`, { at: tailAt(i / 5), parent: prev });
  }

  const limb = (
    names: [string, string, string, string],
    parent: J,
    p: [Pt, Pt, Pt, Pt],
    reach: number,
  ) => {
    const j1 = b.joint(names[0], { at: p[0], parent });
    const j2 = b.joint(names[1], { at: p[1], parent: j1 });
    const j3 = b.joint(names[2], { at: p[2], parent: j2 });
    const j4 = b.joint(names[3], { at: p[3], parent: j3 });

    b.sweep([p[0], p[1]], 0.026, { color: LEG });
    b.sweep([p[1], p[2], p[3]], 0.017, { color: LEG });

    const pad = new THREE.SphereGeometry(1, 10, 7);
    pad.scale(0.024, 0.016, 0.03);
    b.part(pad, PAD, { at: p[3], bone: j4 });

    const [x, y, z] = p[3];
    for (const dx of [-0.011, -0.0037, 0.0037, 0.011]) {
      b.sweep(
        [
          [x + dx, y - 0.006, z + 0.014],
          [x + dx * 1.3, y - 0.012, z + 0.014 + reach],
        ],
        0.0036,
        { color: CLAW },
      );
    }
  };

  // Trotting: front-left and hind-right step forward, the other diagonal back.
  limb(
    ["shoulderL", "elbowL", "wristL", "pawL"], chest,
    [[0.072, 0.175, 0.075], [0.076, 0.095, 0.11], [0.072, 0.045, 0.135], [0.072, 0.016, 0.15]],
    0.04,
  );
  limb(
    ["shoulderR", "elbowR", "wristR", "pawR"], chest,
    [[-0.072, 0.175, 0.075], [-0.076, 0.095, 0.06], [-0.072, 0.045, 0.045], [-0.072, 0.016, 0.035]],
    0.04,
  );
  limb(
    ["hipL", "kneeL", "ankleL", "toeL"], hips,
    [[0.07, 0.17, -0.11], [0.078, 0.095, -0.13], [0.072, 0.045, -0.155], [0.07, 0.016, -0.17]],
    0.03,
  );
  limb(
    ["hipR", "kneeR", "ankleR", "toeR"], hips,
    [[-0.07, 0.17, -0.11], [-0.078, 0.095, -0.085], [-0.072, 0.045, -0.06], [-0.07, 0.016, -0.04]],
    0.03,
  );

  // ---- tail: tapering leather core with bony rings --------------------------
  const tr = (t: number) => 0.034 * (1 - 0.85 * t) + 0.004;
  for (let i = 0; i < 5; i++) {
    const t0 = i / 5;
    const t1 = (i + 1) / 5;
    b.sweep([tailAt(t0), tailAt(t1)], tr((t0 + t1) / 2), { color: LEG });
  }
  b.sweep([tailAt(1), [0, 0.116, -0.52]], 0.005, { color: LEG });
  const SLOPE = Math.atan(0.08 / 0.3);
  for (let k = 0; k < 10; k++) {
    const t = 0.04 + k * 0.1;
    const ring = new THREE.TorusGeometry(tr(t) + 0.002, 0.0032, 6, 14);
    ring.rotateX(-SLOPE);
    b.part(ring, SHELL, { at: tailAt(t) });
  }

  // ---- body and nine bands ---------------------------------------------------
  b.part(shell(BODY, RX, RY, 14), SKIN, { at: [0, CY, 0], bone: hips });

  const scapular = ridge(0.053, 0.158, 0.1, 6);
  const pelvic = ridge(-0.222, -0.19, 0.07, 4);
  b.part(shell(scapular, RX, RY, 16), SHELL, { at: [0, CY, 0], bone: chest });
  b.part(shell(pelvic, RX, RY, 16), SHELL, { at: [0, CY, 0], bone: hips });
  for (let i = 0; i < 9; i++) {
    const c = 0.035 - 0.026 * i;
    b.part(shell(ridge(c - 0.008, c + 0.008, 0.06, 4), RX, RY, 16), BAND, {
      at: [0, CY, 0],
      bone: c > 0 ? chest : hips,
    });
  }

  // Small scutes on the plates and the head shield.
  const dots = (
    prof: Prof,
    rows: number[],
    angles: number[],
    rx: number,
    ry: number,
    rad: number,
    color: string,
    bone: J,
  ) => {
    for (const z of rows) {
      const r = radiusAt(prof, z);
      for (const deg of angles) {
        const a = (deg * Math.PI) / 180;
        const g = new THREE.SphereGeometry(rad, 6, 4);
        g.scale(1, 0.6, 1);
        b.part(g, color, {
          at: [rx * r * Math.sin(a), CY + ry * r * Math.cos(a), z],
          bone,
        });
      }
    }
  };
  dots(scapular, [0.075, 0.105, 0.135], [-100, -64, -30, 0, 30, 64, 100], RX, RY, 0.0034, SCUTE, chest);
  dots(pelvic, [-0.198, -0.212], [-70, -35, 0, 35, 70], RX, RY, 0.0034, SCUTE, hips);

  // ---- coarse pale hairs poking out of the gaps between bands ----------------
  const gapZ = [0.048, 0.022, -0.004, -0.03, -0.056, -0.082, -0.108, -0.134, -0.16, -0.1855];
  for (const z of gapZ) {
    const r = radiusAt(BODY, z);
    for (let k = 0; k < 6; k++) {
      const a = ((-140 + (280 * (k + rand())) / 6) * Math.PI) / 180;
      const nx = Math.sin(a) / RX;
      const ny = Math.cos(a) / RY;
      const nl = Math.hypot(nx, ny);
      const base: Pt = [RX * r * Math.sin(a), CY + RY * r * Math.cos(a), z];
      const len = 0.024 + 0.012 * rand();
      const dx = (nx / nl) * 0.75 + (rand() - 0.5) * 0.25;
      const dy = (ny / nl) * 0.75 + (rand() - 0.5) * 0.25;
      const dz = -0.6 + (rand() - 0.5) * 0.3;
      const dl = Math.hypot(dx, dy, dz);
      const tip: Pt = [
        base[0] + (dx / dl) * len,
        base[1] + (dy / dl) * len,
        base[2] + (dz / dl) * len,
      ];
      b.sweep([base, tip], 0.0016, { color: HAIR });
    }
  }

  // ---- head: pointed snout, shield, lower jaw, eyes, nose, ears ---------------
  b.part(shell(HEAD, HRX, HRY, 14), SHELL, { at: [0, CY, 0], bone: head });
  dots(HEAD, [0.13, 0.165, 0.2], [-40, 0, 40], HRX, HRY, 0.003, SCUTE, head);

  const nose = new THREE.SphereGeometry(0.011, 10, 8);
  nose.scale(1, 0.8, 0.9);
  b.part(nose, NOSE, { at: [0, CY, 0.292], bone: head });

  b.part(shell(JAW, 0.032, 0.015, 12), JAW_C, { at: [0, 0.15, 0], bone: jaw });

  for (const s of [1, -1]) {
    const eye = new THREE.SphereGeometry(0.0068, 10, 8);
    b.part(eye, EYE, { at: [0.045 * s, 0.21, 0.2], bone: head });
    const glint = new THREE.SphereGeometry(0.002, 6, 4);
    b.part(glint, GLINT, { at: [(0.045 + 0.0028) * s, 0.2135, 0.2055], bone: head });
  }

  const earShape = new THREE.Shape();
  earShape.moveTo(-0.017, 0);
  earShape.quadraticCurveTo(-0.025, 0.04, -0.009, 0.07);
  earShape.quadraticCurveTo(0.004, 0.08, 0.013, 0.062);
  earShape.quadraticCurveTo(0.024, 0.036, 0.017, 0);
  earShape.closePath();
  for (const s of [1, -1]) {
    const ear = new THREE.ExtrudeGeometry(earShape, {
      depth: 0.004,
      bevelEnabled: false,
      curveSegments: 6,
    });
    ear.translate(0, 0, -0.002);
    ear.rotateX(-0.22); // lean back
    ear.rotateY(s * 1.25); // plane faces out to the side
    b.part(ear, EAR, { at: [0.036 * s, 0.236, 0.14], bone: head });
  }

  // ---- hairs' base colour helper is shared above; the model is complete -------
  return b.root;
}
