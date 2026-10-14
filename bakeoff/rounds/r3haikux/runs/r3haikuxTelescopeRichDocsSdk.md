```ts
import * as THREE from "three";
import {
  catmull,
  createBuilder,
  grain,
  mix,
  mottle,
  paint,
  smoothstep,
  spots,
} from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

// ---- palette ----------------------------------------------------------------
const BRASS = "#c48f36";
const BRASS_HI = "#f2d88f";
const BRASS_DK = "#6b4619";
const MAHOG_LT = "#9c5731";
const MAHOG_DK = "#4a2213";
const RUBBER = "#17130f";
const LENS = "#1d3c5e";
const LEATHER_LT = "#6e4628";
const LEATHER_DK = "#3a2215";
const STITCH = "#e6cc98";
const CHART = "#f0e4c2";
const CHART_INK = "#1f2d52";
const RIBBON = "#8c2b26";

// ---- telescope frame --------------------------------------------------------
// The tube runs along DIR from its eyepiece (s = 0) to its objective (s = LEN),
// pivoting on the altitude axle at s = S_PIVOT. UP is the tube's top side.
const LEN = 0.76;
const S_PIVOT = 0.34;
const TILT = (38 * Math.PI) / 180;
const DIR = new THREE.Vector3(0, Math.sin(TILT), Math.cos(TILT));
const UP = new THREE.Vector3(0, Math.cos(TILT), -Math.sin(TILT));
const SIDE = new THREE.Vector3(1, 0, 0);
const PIVOT = new THREE.Vector3(0, 1.0, 0);

const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const axisAt = (s: number) => PIVOT.clone().addScaledVector(DIR, s - S_PIVOT);
const finderAt = (s: number) => axisAt(s).addScaledVector(UP, 0.1);
const rT = (t: number) => 0.038 + 0.01 * t; // tube radius at source t (0 rear, 1 front)
const rS = (s: number) => rT(s / LEN);
const TUBE = [axisAt(0), axisAt(LEN)];

// ---- tripod -----------------------------------------------------------------
const TOPS: [number, number][] = [
  [0, 0.03],
  [0.026, -0.015],
  [-0.026, -0.015],
];
const FEET: [number, number][] = [
  [0, 0.44],
  [0.381, -0.22],
  [-0.381, -0.22],
];
const legR = (t: number) => 0.024 - 0.006 * t + 0.004 * Math.sin(Math.PI * t);

// ---- outlines -----------------------------------------------------------------
const HUB: OutlinePoint[] = [
  [0, 0],
  [0.066, 0],
  [0.072, 0.012],
  [0.06, 0.05],
  [0.042, 0.08],
  [0, 0.088],
];
const TRAY: OutlinePoint[] = [
  [0, 0],
  [0.2, 0],
  [0.2, 0.022],
  [0.188, 0.022],
  [0.188, 0.008],
  [0, 0.008],
];
const CUP_PTS: OutlinePoint[] = [
  [0, 0],
  [0.019, 0],
  [0.02, 0.006],
  [0.026, 0.024],
  [0.031, 0.04],
  [0.032, 0.052],
  [0.027, 0.056],
  [0.022, 0.05],
  [0, 0.044],
];
const cup = (k: number): OutlinePoint[] => CUP_PTS.map(([x, y]): OutlinePoint => [x * k, y * k]);
const disc = (r: number, h: number): OutlinePoint[] => [
  [0, 0],
  [r, 0],
  [r, h],
  [0, h],
];
const wheel = (r: number, h: number): OutlinePoint[] => [
  [0, 0],
  [r, 0],
  [r + 0.003, h * 0.3],
  [r + 0.003, h * 0.7],
  [r, h],
  [0, h],
];

// ---- paints -------------------------------------------------------------------
const ENGRAVED = [0.03, 0.055, 0.25, 0.265, 0.7, 0.71];
const wrapDeg = (d: number) => ((((d + 180) % 360) + 360) % 360) - 180;

// Polished brass: lighter where the tube faces the sky, with engraved rings and a
// graduated scale on the bare top of the tube.
const brass = paint((_p, n, s) => {
  const x = s[0] * LEN;
  const engraved = ENGRAVED.some((e) => Math.abs(x - e) < 0.0018);
  const tick = x > 0.515 && x < 0.545 && Math.abs(wrapDeg(s[1])) < 3 && (x - 0.515) % 0.0075 < 0.0013;
  if (engraved || tick) return BRASS_DK;
  return mix(BRASS, BRASS_HI, smoothstep(0.25, 0.85, n.y));
});

// Leather wrap with a dashed cream stitch line near each end.
const leatherBase = mottle(LEATHER_LT, LEATHER_DK, { size: 0.02 });
const leather = (a: number, c: number) =>
  paint((_p, _n, s) => {
    const x = s[0] * LEN;
    const edge = Math.min(Math.abs(x - a), Math.abs(x - c));
    const stitched = edge > 0.005 && edge < 0.0075 && Math.floor(Math.abs(s[1]) / 6) % 2 === 0;
    return stitched ? STITCH : leatherBase;
  });

const WOOD = grain(MAHOG_LT, MAHOG_DK, { size: 0.012, axis: "y" });
const WOOD_FLAT = grain(MAHOG_LT, MAHOG_DK, { size: 0.02, axis: "x" });
const CHART_PAPER = spots(CHART, CHART_INK, { size: 0.011, amount: 0.2 });

export const meta = {
  name: "Brass explorer's telescope",
  description:
    "A polished brass telescope with leather-wrapped sections, engraved rings, a finder scope, a rubber eyecup and focusing knobs, on a mahogany tripod with brass fittings and a star-chart tray.",
};

export default function build() {
  const b = createBuilder({ name: "explorer-telescope" });

  const stand = b.joint("stand", { at: [0, 0, 0] });
  const tube = b.joint("tube", { parent: stand, at: PIVOT, aim: axisAt(LEN) });

  // ---- tripod --------------------------------------------------------------
  b.lathe(HUB, { at: [0, 0.84, 0], segments: 12, color: BRASS, bone: stand, name: "hub" });

  for (let i = 0; i < 3; i++) {
    const top = v3(TOPS[i][0], 0.87, TOPS[i][1]);
    const foot = v3(FEET[i][0], 0.03, FEET[i][1]);
    const legPath = [top, foot];

    b.sweep(legPath, legR, { color: WOOD, sides: 8, bone: stand, name: `leg${i}` });
    b.sweep(legPath, (t) => legR(t) + 0.0035, {
      from: 0.36,
      to: 0.4,
      color: BRASS,
      sides: 8,
      caps: "flat",
      bone: stand,
      name: `legClamp${i}`,
    });
    b.spike(foot, v3(foot.x, 0, foot.z), null, 0.017, { color: BRASS, bone: stand, name: `shoe${i}` });

    // brass bracket from the leg up to the tray underside
    const lp = top.clone().lerp(foot, 0.687);
    const k = 0.16 / Math.hypot(lp.x, lp.z);
    b.rod(lp, v3(lp.x * k, lp.y, lp.z * k), 0.008, { color: BRASS, bone: stand, name: `bracket${i}` });
  }

  // little mahogany tray with a brass band round its rim
  b.lathe(TRAY, { at: [0, 0.3, 0], segments: 24, color: WOOD_FLAT, bone: stand, name: "tray" });
  const bandRing: THREE.Vector3[] = [];
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    bandRing.push(v3(0.194 * Math.cos(a), 0.322, 0.194 * Math.sin(a)));
  }
  b.sweep(catmull(bandRing, { closed: true }), 0.003, { color: BRASS, sides: 6, bone: stand, name: "trayBand" });

  // rolled star chart tied with a ribbon
  b.sweep([v3(-0.085, 0.326, 0), v3(0.085, 0.326, 0)], 0.018, {
    color: CHART_PAPER,
    sides: 10,
    caps: "flat",
    bone: stand,
    name: "starChart",
  });
  const ribbon: THREE.Vector3[] = [];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    ribbon.push(v3(0.03, 0.326 + 0.0205 * Math.cos(a), 0.0205 * Math.sin(a)));
  }
  b.sweep(catmull(ribbon, { closed: true }), 0.0035, { color: RIBBON, sides: 6, bone: stand, name: "chartRibbon" });

  // brass yoke arms carrying the altitude axle
  for (const sg of [1, -1]) {
    b.sweep(catmull([v3(0.03 * sg, 0.9, 0), v3(0.09 * sg, 0.93, 0), v3(0.105 * sg, 1.0, 0)]), 0.011, {
      color: BRASS,
      sides: 8,
      bone: stand,
      name: sg > 0 ? "yokeL" : "yokeR",
    });
    b.lathe(wheel(0.024, 0.016), {
      at: PIVOT.clone().addScaledVector(SIDE, sg * 0.108),
      axis: SIDE.clone().multiplyScalar(sg),
      segments: 14,
      color: BRASS,
      bone: tube,
      name: "altitudeKnob",
    });
  }
  b.rod(PIVOT.clone().addScaledVector(SIDE, -0.105), PIVOT.clone().addScaledVector(SIDE, 0.105), 0.012, {
    color: BRASS,
    bone: tube,
    name: "axle",
  });

  // ---- telescope tube --------------------------------------------------------
  b.sweep(TUBE, rT, { color: brass, sides: 10, caps: "flat", bone: tube, name: "tubeBrass" });
  b.sweep(TUBE, (t) => rT(t) + 0.003, {
    from: 0,
    to: 0.022 / LEN,
    color: brass,
    sides: 10,
    caps: "flat",
    bone: tube,
    name: "rearCollar",
  });
  b.sweep(TUBE, (t) => rT(t) + 0.0045, {
    from: 0.32 / LEN,
    to: 0.36 / LEN,
    color: BRASS,
    sides: 10,
    caps: "flat",
    bone: tube,
    name: "trunnionClamp",
  });
  b.sweep(TUBE, (t) => rT(t) + 0.006, {
    from: 0.72 / LEN,
    to: 1,
    color: BRASS,
    sides: 10,
    caps: "flat",
    bone: tube,
    name: "objectiveCollar",
  });
  b.lathe(disc(0.0425, 0.004), {
    at: axisAt(LEN),
    axis: DIR.clone(),
    segments: 16,
    color: LENS,
    bone: tube,
    name: "objectiveLens",
  });

  // leather-wrapped grip sections, each capped by brass ferrules
  const leatherBand = (a: number, c: number) => {
    b.sweep(TUBE, (t) => rT(t) + 0.0028, {
      from: a / LEN,
      to: c / LEN,
      color: leather(a, c),
      sides: 10,
      caps: "flat",
      bone: tube,
      name: "leatherWrap",
    });
    for (const e of [a, c]) {
      b.sweep(TUBE, (t) => rT(t) + 0.0045, {
        from: (e - 0.004) / LEN,
        to: (e + 0.004) / LEN,
        color: BRASS,
        sides: 10,
        caps: "flat",
        bone: tube,
        name: "wrapFerrule",
      });
    }
  };
  leatherBand(0.4, 0.5);
  leatherBand(0.56, 0.68);

  // eyepiece barrel and rubber eyecup at the rear
  b.rod(axisAt(0), axisAt(-0.03), 0.019, { color: BRASS, bone: tube, name: "eyepieceBarrel" });
  b.lathe(cup(1), {
    at: axisAt(-0.03),
    axis: DIR.clone().negate(),
    segments: 16,
    smoothing: 1,
    color: RUBBER,
    bone: tube,
    name: "eyecup",
  });

  // focusing knobs on either side of the draw tube
  const focusKnob = (s: number, sg: number, r: number) => {
    const hub = axisAt(s).addScaledVector(SIDE, sg * (rS(s) + 0.018));
    b.rod(axisAt(s).addScaledVector(SIDE, sg * rS(s) * 0.5), hub, 0.006, {
      color: BRASS,
      bone: tube,
      name: "focusShaft",
    });
    b.lathe(wheel(r, 0.012), {
      at: hub,
      axis: SIDE.clone().multiplyScalar(sg),
      segments: 14,
      color: BRASS,
      bone: tube,
      name: "focusKnob",
    });
  };
  focusKnob(0.07, 1, 0.026);
  focusKnob(0.1, -1, 0.019);

  // finder scope riding above the tube on two posts
  b.sweep([finderAt(0.12), finderAt(0.44)], 0.02, {
    color: BRASS,
    sides: 10,
    caps: "flat",
    bone: tube,
    name: "finder",
  });
  b.sweep([finderAt(0.12), finderAt(0.14)], 0.0235, {
    color: BRASS,
    sides: 10,
    caps: "flat",
    bone: tube,
    name: "finderEyeRing",
  });
  b.sweep([finderAt(0.415), finderAt(0.44)], 0.0235, {
    color: BRASS,
    sides: 10,
    caps: "flat",
    bone: tube,
    name: "finderObjRing",
  });
  b.lathe(disc(0.0175, 0.003), {
    at: finderAt(0.44),
    axis: DIR.clone(),
    segments: 14,
    color: LENS,
    bone: tube,
    name: "finderLens",
  });
  b.lathe(cup(0.55), {
    at: finderAt(0.12),
    axis: DIR.clone().negate(),
    segments: 12,
    smoothing: 1,
    color: RUBBER,
    bone: tube,
    name: "finderCup",
  });
  for (const s of [0.18, 0.38]) {
    b.rod(axisAt(s).addScaledVector(UP, rS(s) * 0.4), finderAt(s).addScaledVector(UP, -0.025), 0.0065, {
      color: BRASS,
      bone: tube,
      name: "finderPost",
    });
    b.sweep(TUBE, (t) => rT(t) + 0.0045, {
      from: (s - 0.006) / LEN,
      to: (s + 0.006) / LEN,
      color: BRASS,
      sides: 10,
      caps: "flat",
      bone: tube,
      name: "postClamp",
    });
  }

  return b.root;
}
```