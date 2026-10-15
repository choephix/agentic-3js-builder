// Kraken rising: a colossal armoured cephalopod heaving out of the sea, arms spread in a ring, two club-tipped
// feeding tentacles raised like claws. Overwatch look: clean bold blue/cream colour blocks, white bevelled armour
// plates and cuffs with navy panel trims, and ONE strong accent, hot orange, used for glowing eyes, suckers, tips,
// bio-circuit decals and light dots.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import type { Frame } from "../../../../src/frame";
import { DEG, offset, rng } from "../../../../src/math";
import { countershade, mottle, paint, spots } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { interpolate } from "../../../../src/sweep";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel } from "../../../../kits/toon";

export const meta = {
  name: "Kraken Rising",
  description:
    "A colossal armoured kraken heaving out of the sea: eight spread arms, two club-tipped raised feeding tentacles, bevelled white armour plating and a single hot-orange glow accent.",
  style: "Overwatch",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: cool blue hide, cream belly, white armour, navy trims, one orange accent.
const NAVY = "#14213d";
const ARMOR = "#e8eef4";
const ORANGE = "#ff7a1a";
const CREAM = "#f6e6c6";
const WATER = "#2fb4d4";
const FOAM = "#d9f8ff";
const DROP = "#8fe3f5";
const HORN = "#262f4a";
const TOOTH = "#f4ecd8";

const HIDE = cel(
  spots(mottle("#2e8dc6", "#2279b4", { size: 0.55, seed: 11 }), "#1a5698", { size: 0.3, amount: 0.3, seed: 7 }),
);
const HIDE_D = cel(mottle("#1f6aa8", "#17508f", { size: 0.5, seed: 4 }));
const BELLY = cel(CREAM, "#e3b48f");
const ARMOR_C = cel(ARMOR, "#aab9cf");
const NAVY_C = cel(NAVY, "#0b1226");
const ORANGE_C = cel(ORANGE, "#d8480a");
const FIN_C = cel("#47c6e2", "#2a97c0");
const FIN_RIB = cel("#1e6fa6", "#164f86");

const ARM_COAT = countershade(HIDE, BELLY, { level: -0.25, soft: 0.3 });
const HEAD_COAT = countershade(HIDE, BELLY, { level: -0.55, soft: 0.25 });
const MANTLE = paint((_p, n) => (n.z < -0.4 ? HIDE_D : HIDE));

// Cuff / collar paint on a swept range [a, c] of the source t: navy end trims, white body, orange centre line.
const cuffPaint = (a: number, c: number) =>
  paint((_p, _n, s) => {
    const u = (s[0] - a) / (c - a);
    if (u < 0.13 || u > 0.87) return NAVY_C;
    if (Math.abs(u - 0.5) < 0.07) return ORANGE_C;
    return ARMOR_C;
  });

// Fin: radiating ribs from the root, orange outer rim.
const finPaint = paint((_p, _n, s) => {
  const r = Math.hypot(s[0] + 0.1, s[1] - 0.1);
  if (r > 1.2) return ORANGE_C;
  const a = Math.atan2(s[1] - 0.1, s[0] + 0.1);
  const k = (a / Math.PI) * 9;
  if (r > 0.3 && Math.abs(k - Math.round(k)) < 0.09) return FIN_RIB;
  return FIN_C;
});

const EYE = svg(
  `<svg viewBox="0 0 100 100">
    <defs><radialGradient id="g" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#ffefb0"/><stop offset="0.45" stop-color="#ff9a1f"/><stop offset="1" stop-color="#d2470a"/>
    </radialGradient></defs>
    <circle cx="50" cy="50" r="48" fill="url(#g)"/>
    <circle cx="50" cy="50" r="46" fill="none" stroke="#7a2300" stroke-width="4"/>
    <rect x="14" y="41" width="72" height="18" rx="9" fill="#1a0b1a"/>
    <ellipse cx="33" cy="29" rx="10" ry="6" fill="#ffffff"/>
    <circle cx="68" cy="70" r="4" fill="#ffffff"/>
  </svg>`,
  { size: 256 },
);

const CIRCUIT = svg(
  `<svg viewBox="0 0 60 100">
    <g fill="none" stroke="#ff8a2a" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M30 8 V92"/>
      <path d="M10 26 L30 42 L50 26"/>
      <path d="M6 50 L30 68 L54 50"/>
      <path d="M12 74 L30 86 L48 74"/>
    </g>
    <g fill="#ffd9a0">
      <circle cx="30" cy="8" r="5"/><circle cx="30" cy="92" r="5"/>
      <circle cx="10" cy="26" r="3.6"/><circle cx="50" cy="26" r="3.6"/>
      <circle cx="6" cy="50" r="3.6"/><circle cx="54" cy="50" r="3.6"/>
      <circle cx="12" cy="74" r="3.6"/><circle cx="48" cy="74" r="3.6"/>
    </g>
  </svg>`,
  { size: 256 },
);

function need<T>(x: T | null | undefined, what: string): T {
  if (x === null || x === undefined) throw new Error(`kraken: no surface hit for ${what}`);
  return x;
}

// Mantle radius profile (evenly keyed over the chain), also sampled to place fins and collars.
const MR = [0.8, 1.0, 1.06, 0.9, 0.55, 0.14];
const MR_XS = MR.map((_, i) => i / (MR.length - 1));
const mr = (t: number) => interpolate(MR_XS, MR, t);

// Arm radius profiles over source t.
const groundRad = (t: number) => 0.04 + 0.3 * Math.pow(1 - t, 1.2);
const clubRad = (t: number) => {
  const stalk = 0.07 + 0.23 * Math.pow(Math.max(0, 1 - t / 0.65), 1.3);
  const bump = Math.sin(Math.PI * Math.min(Math.max((t - 0.66) / 0.4, 0), 1));
  return stalk + 0.11 * bump;
};
const CUFFS: Array<[number, number]> = [
  [0.1, 0.17],
  [0.31, 0.37],
  [0.52, 0.57],
];
const inCuff = (t: number) => CUFFS.some(([a, c]) => t > a - 0.025 && t < c + 0.025);

export default function build() {
  const b = createBuilder({ name: "kraken", paintSize: 2048 });
  const rand = rng(2024);

  // ------------------------------------------------------------------------------------------------ skeleton
  const pelvis = b.joint("pelvis", { at: [0, 1.95, -0.15], role: "spine" });
  const mantle = b.chain(
    "mantle",
    catmull([
      [0, 1.95, -0.15],
      [0, 2.85, -0.5],
      [0, 3.75, -1.0],
      [0, 4.6, -1.6],
    ]),
    { parent: pelvis, names: ["mantleA", "mantleB", "mantleC", "mantleTip"], role: "spine" },
  );
  const HC = new THREE.Vector3(0, 1.85, 0.55);
  const head = b.joint("head", { parent: pelvis, at: HC, aim: [0, 1.85, 1.5], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.25, 0.55], aim: [0, 0.95, 0.9], role: "jaw" });

  // ------------------------------------------------------------------------------------------------ water base
  b.lathe(
    [
      [0, 0],
      [5.7, 0],
      [5.7, 0.12],
      [5.2, 0.2],
      [2.6, 0.23],
      [1.8, 0.3],
      [1.3, 0.55],
      [0.9, 0.7],
      [0, 0.7],
    ],
    { at: [0, 0, 0.2], bone: pelvis, segments: 32, color: WATER, name: "water" },
  );
  for (const r of [2.3, 3.4, 4.5]) {
    b.part(new THREE.TorusGeometry(r, 0.04, 4, 48), FOAM, { bone: pelvis, at: [0, 0.26, 0.2], rotation: [90, 0, 0] });
  }
  b.part(new THREE.TorusGeometry(5.55, 0.07, 4, 48), FOAM, { bone: pelvis, at: [0, 0.14, 0.2], rotation: [90, 0, 0] });
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + 0.2;
    const r0 = 1.25 + (i % 2) * 0.1;
    b.spike(
      [Math.sin(a) * r0, 0.45, 0.2 + Math.cos(a) * r0],
      [Math.sin(a) * (r0 + 0.55), 1.05 + (i % 3) * 0.18, 0.2 + Math.cos(a) * (r0 + 0.55)],
      null,
      0.12,
      { color: FOAM, bone: pelvis },
    );
  }
  for (let i = 0; i < 28; i++) {
    const a = rand() * Math.PI * 2;
    const r = 1.2 + rand() * 4.4;
    const sz = 0.04 + rand() * 0.06;
    b.part(new THREE.IcosahedronGeometry(sz, 0), DROP, {
      bone: pelvis,
      at: [Math.sin(a) * r, 0.5 + rand() * 2.4, 0.2 + Math.cos(a) * r],
    });
  }

  // ------------------------------------------------------------------------------------------------ mantle
  const mantleSw = b.sweep(mantle, MR, { color: MANTLE, sides: 12, name: "mantle" });
  const collars: Array<[number, number]> = [
    [0.05, 0.12],
    [0.42, 0.47],
  ];
  for (const [a, c] of collars)
    b.sweep(mantle, (t) => mr(t) + 0.04, { from: a, to: c, color: cuffPaint(a, c), caps: "flat", sides: 12 });
  glow(
    b.sweep(mantle, (t) => mr(t) + 0.015, {
      from: 0.88,
      to: 1,
      color: ORANGE,
      caps: { start: "flat", end: "round" },
      sides: 8,
    }),
    1.3,
  );

  // Layered, bevelled armour plates stand on any frame: navy base, white cap, orange chevron.
  const scaled = (pts: OutlinePoint[], k: number): OutlinePoint[] =>
    pts.map((p) => [p[0] * k, p[1] * k] as OutlinePoint);
  const plate = (f: Frame, tan: THREE.Vector3, w: number, l: number, h: number) => {
    const n = f.axis.clone().normalize();
    const t = tan.clone().addScaledVector(n, -tan.dot(n)).normalize();
    const x = t.clone().cross(n).normalize();
    const bone = f.bone ?? undefined;
    const put = (outline: OutlinePoint[], lift: number, thick: number, color: string | Paint, bevel: number) =>
      b.extrude(outline, {
        at: f.at.clone().addScaledVector(n, lift + thick / 2),
        x,
        y: t,
        thickness: thick,
        bevel,
        color,
        bone,
      });
    const base: OutlinePoint[] = [
      [-w * 0.55, -l],
      [w * 0.55, -l],
      [w, -l * 0.4],
      [w, l * 0.4],
      [w * 0.55, l],
      [-w * 0.55, l],
      [-w, l * 0.4],
      [-w, -l * 0.4],
    ];
    const chevron: OutlinePoint[] = [
      [0, l * 0.5],
      [w * 0.55, l * 0.05],
      [w * 0.55, -l * 0.25],
      [0, l * 0.2],
      [-w * 0.55, -l * 0.25],
      [-w * 0.55, l * 0.05],
    ];
    put(base, -h * 0.3, h, NAVY_C, h * 0.3);
    put(scaled(base, 0.78), h * 0.7, h * 0.6, ARMOR_C, h * 0.25);
    put(chevron, h * 1.28, h * 0.3, ORANGE_C, h * 0.1);
  };

  for (let k = 0; k < 6; k++) {
    const t = 0.12 + 0.13 * k;
    const f = mantleSw.at(t, 180);
    plate(f, f.tangent, mr(t) * 0.3, 0.2 - 0.02 * k, 0.1);
  }
  for (const ang of [125, 235]) {
    for (let k = 0; k < 4; k++) {
      const t = 0.2 + 0.16 * k;
      const f = mantleSw.at(t, ang);
      plate(f, f.tangent, mr(t) * 0.17, 0.16, 0.08);
    }
  }

  // Bio-circuit decals on the flanks and scattered light dots.
  const mSurf = b.surface(mantleSw);
  for (const s of [1, -1]) {
    const hit = need(mSurf.around().at(s * 90, -30), "mantle flank");
    glow(b.decal(mSurf, CIRCUIT, { at: hit, up: [0, 1, 0], size: [0.7, 1.1], segments: 12, color: "#ffffff" }), 1.2);
  }
  for (const hit of mSurf.scatter(26, { rng: rng(5), minDist: 0.55, filter: (h) => h.n.y > -0.4 }))
    glow(b.stick(new THREE.SphereGeometry(0.06, 6, 4), ORANGE, hit, { embed: 0.45 }), 1.2);

  // Fins: wide ribbed fans on the upper mantle.
  const FIN: OutlinePoint[] = [
    [0, -0.45],
    [0.55, -0.4],
    [1.15, -0.1],
    [1.35, 0.25, "sharp"],
    [1.0, 0.65],
    [0.45, 0.7],
    [0, 0.55],
  ];
  const fp = mantle.at(0.6);
  for (const s of [1, -1]) {
    const root = fp.at.clone().add(new THREE.Vector3(s * mr(0.6) * 0.8, 0, 0));
    const fj = b.joint(s > 0 ? "finL" : "finR", {
      parent: mantle.joints[1],
      at: root,
      aim: root.clone().add(new THREE.Vector3(s, 0, 0)),
      role: "fan",
    });
    b.extrude(FIN, {
      at: root,
      x: [s, 0, 0],
      y: fp.tangent.clone(),
      thickness: [0.1, 0.03],
      bevel: 0.02,
      smoothing: 1,
      color: finPaint,
      bone: fj,
      name: s > 0 ? "finL" : "finR",
    });
  }

  // ------------------------------------------------------------------------------------------------ head
  const skull = b.part(new THREE.SphereGeometry(1, 18, 12), HEAD_COAT, {
    bone: head,
    at: HC,
    scale: [0.9, 0.72, 0.85],
    name: "skull",
  });
  const headSurf = b.surface(skull);

  for (const s of [1, -1]) {
    const hit = need(headSurf.around(HC).at(s * 42, 6), "eye");
    const n = hit.axis.clone().normalize();
    const eyeC = offset(hit, n, 0.05);
    const eyeJ = b.joint(s > 0 ? "eyeL" : "eyeR", { parent: head, at: eyeC, aim: offset(eyeC, n, 0.3) });
    const ball = b.part(new THREE.SphereGeometry(0.27, 12, 8), "#101c33", { bone: eyeJ, at: eyeC });
    b.part(new THREE.TorusGeometry(0.25, 0.04, 6, 18), ARMOR, { bone: eyeJ, at: offset(eyeC, n, 0.1), dir: n, axis: "z" });
    glow(
      b.decal(ball, EYE, {
        at: offset(eyeC, n, 0.27),
        dir: n,
        up: [0, 1, 0],
        size: [0.36, 0.36],
        segments: 8,
        color: "#ffffff",
        bone: eyeJ,
      }),
      1.2,
    );
    // Heavy brow ridge draped over the skull.
    const brow = headSurf.drape(
      catmull([
        [s * 0.3, 2.28, 1.32],
        [s * 0.62, 2.25, 1.2],
        [s * 0.95, 2.1, 0.95],
      ]),
      { lift: 0.05 },
    );
    b.sweep(brow, [0.075, 0.04], { color: ARMOR_C, bone: head, caps: { start: "round", end: "point" }, sides: 6 });
    // Cheek plate and a small horn on the crown.
    const cheek = need(headSurf.around(HC).at(s * 72, -22), "cheek");
    plate(cheek, new THREE.Vector3(0, 0, 1), 0.16, 0.2, 0.08);
    const horn = need(headSurf.around(HC).at(s * 22, 66), "crown horn");
    b.stick(new THREE.ConeGeometry(0.075, 0.34, 6), ARMOR, horn, { embed: 0.15 });
  }
  const crown = need(headSurf.around(HC).at(0, 62), "forehead");
  plate(crown, new THREE.Vector3(0, 0, 1), 0.28, 0.32, 0.1);

  // Mouth: dark throat, hooked upper and lower beak, ring of teeth.
  b.part(new THREE.SphereGeometry(0.24, 8, 6), "#1a0f1c", { bone: jaw, at: [0, 1.2, 0.6], scale: [1, 0.6, 1] });
  b.sweep(
    catmull([
      [0, 1.42, 0.42],
      [0, 1.25, 0.8],
      [0, 1.0, 0.98],
      [0, 0.78, 0.93],
    ]),
    (t) => [0.17 * (1 - t) + 0.015, 0.12 * (1 - t) + 0.015],
    { color: ORANGE, bands: [[0.78, HORN]], bone: head, sides: 8, name: "beakUpper" },
  );
  b.sweep(
    catmull([
      [0, 1.3, 0.48],
      [0, 1.08, 0.76],
      [0, 0.95, 0.85],
    ]),
    (t) => [0.13 * (1 - t) + 0.015, 0.09 * (1 - t) + 0.015],
    { color: HORN, bone: jaw, sides: 8, name: "beakLower" },
  );
  b.ring(frame([0, 1.2, 0.62], [0, -0.5, 0.85]), { count: 10, radius: 0.3, tilt: 25 }, (item) =>
    b.spike(item, item, 0.15, 0.04, { color: TOOTH, bone: jaw }),
  );

  // ------------------------------------------------------------------------------------------------ arms
  const C = new THREE.Vector3(0, 1.5, 0.45);

  const sucker = (f: Frame, r: number) => {
    const ring = new THREE.TorusGeometry(r * 0.72, r * 0.26, 4, 8);
    ring.rotateX(Math.PI / 2);
    glow(b.stick(ring, ORANGE, f, { embed: 0.3 }), 1);
    b.stick(new THREE.CylinderGeometry(r * 0.62, r * 0.7, r * 0.3, 8), NAVY, f, { embed: 0.2 });
  };

  const makeArm = (name: string, pts: number[][], rad: (t: number) => number, club: boolean) => {
    const names = [1, 2, 3, 4, 5, 6].map((i) => `${name}${i}`).concat(`${name}Tip`);
    const chain = b.chain(name, catmull(pts), { parent: pelvis, names, role: "tentacle" });
    const tube = b.sweep(chain, rad, { color: ARM_COAT, sides: 10, name: `${name}Tube` });
    for (const [a, c] of CUFFS)
      b.sweep(chain, (t) => rad(t) + 0.035, {
        from: a,
        to: c,
        color: cuffPaint(a, c),
        caps: "flat",
        sides: 10,
      });
    for (let k = 0; k < 8; k++) {
      const t = 0.12 + 0.1 * k;
      if (t > 0.88 || (club && t > 0.6)) break;
      const f = tube.at(t, 0);
      b.spike(f, f, rad(t) + 0.05, rad(t) * 0.3, { color: ARMOR });
    }
    for (let k = 0; k < 11; k++) {
      const t = 0.2 + 0.065 * k;
      if (inCuff(t) || (club && t > 0.66)) continue;
      sucker(tube.at(t, 180), rad(t) * 0.62);
    }
    if (club) {
      for (let k = 0; k < 5; k++) {
        const t = 0.7 + 0.062 * k;
        for (const ang of [150, 180, 210]) sucker(tube.at(t, ang), clubRad(t) * 0.5);
      }
    } else {
      glow(
        b.sweep(chain, (t) => rad(t) + 0.012, {
          from: 0.9,
          to: 1,
          color: ORANGE,
          caps: { start: "flat", end: "round" },
          sides: 8,
        }),
        1,
      );
    }
    return chain;
  };

  const groundPath = (az: number, reach: number, arch: number, sway: number) => {
    const a = az * DEG;
    const F = [0, 0.2, 0.42, 0.62, 0.8, 0.93, 1.0];
    const Y = [1.5, 1.95, 2.0, 1.45, 0.62, 0.1, 0.42];
    const L = [0, 0, 0.1, 0.3, 0.55, 0.85, 1.0];
    return F.map((f, i) => {
      const rho = 0.75 + (reach - 0.75) * f;
      const y = i === 0 || i >= 5 ? Y[i] : 0.1 + (Y[i] - 0.1) * arch;
      const l = sway * Math.sign(az) * L[i];
      return [
        C.x + Math.sin(a) * rho + Math.cos(a) * l,
        y,
        C.z + Math.cos(a) * rho - Math.sin(a) * l,
      ];
    });
  };

  const GROUND: Array<[string, number, number, number, number]> = [
    ["armF", 22, 3.4, 1.0, 0.5],
    ["armS", 58, 3.9, 1.15, -0.4],
    ["armB", 125, 4.0, 0.75, 0.5],
    ["armR", 160, 3.2, 0.7, -0.3],
  ];
  for (const [base, az, reach, arch, sway] of GROUND) {
    for (const s of [1, -1]) {
      const pts = groundPath(s * az, reach, arch, sway);
      makeArm(base + (s > 0 ? "L" : "R"), pts, groundRad, false);
      // Foam ring where the arm meets the water.
      b.part(new THREE.TorusGeometry(0.3, 0.04, 4, 20), FOAM, {
        bone: pelvis,
        at: [pts[5][0], 0.26, pts[5][2]],
        rotation: [90, 0, 0],
      });
    }
  }

  // Raised, club-tipped feeding tentacles.
  const RAISED = [
    [0.75, 1.5, 0],
    [1.5, 2.0, 0.2],
    [2.25, 2.85, 0.35],
    [2.85, 3.7, 0.5],
    [3.15, 4.5, 0.65],
    [3.05, 5.1, 0.7],
    [2.7, 5.45, 0.7],
  ];
  for (const s of [1, -1]) {
    const pts = RAISED.map(([rho, y, lat]) => [s * rho, y, C.z + lat]);
    makeArm(s > 0 ? "clubL" : "clubR", pts, clubRad, true);
  }

  return b.root;
}
