```ts
import * as THREE from "three";
import { createBuilder, grain, mottle, paint, spots, svg } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Brass explorer's telescope",
  description:
    "A long brass field telescope on a mahogany tripod: leather-wrapped draw sections, engraved bands, a finder scope, a rubber eyecup, focusing knobs, and a tray holding a rolled star chart.",
};

// ── Palette ──────────────────────────────────────────────
const BRASS = "#d6a548";
const BRASS_MID = "#a9762d";
const BRASS_DARK = "#7a5220";
const BRASS_LIGHT = "#ecc96f";
const LEATHER = "#7d4d2e";
const LEATHER_DARK = "#55321d";
const STITCH = "#e8d7a8";
const MAHOGANY = "#5a2716";
const MAHOGANY_LIGHT = "#8c4b2b";
const RUBBER = "#18160f";
const GLASS = "#2d6282";
const GLASS_BLOOM = "#5e7fa8";
const LACQUER = "#26201b";
const RIBBON = "#8e1f22";
const PAPER = "#eee0bb";
const STAR_INK = "#2a3a66";

// ── Tube frame ───────────────────────────────────────────
// The tube turns about PIVOT (the trunnion), pointed 28 degrees above horizontal.
const ELEV = THREE.MathUtils.degToRad(28);
const D = new THREE.Vector3(0, Math.sin(ELEV), Math.cos(ELEV)); // along the tube: forward and up
const U = new THREE.Vector3(0, Math.cos(ELEV), -Math.sin(ELEV)); // across the tube, toward its top
const X = new THREE.Vector3(1, 0, 0); // model left
const PIVOT = new THREE.Vector3(0, 1.07, 0);

/** Point on the tube: s along the axis from the pivot, r out from the axis, deg round it (0 = model left, 90 = top). */
function at(s: number, r = 0, deg = 0): THREE.Vector3 {
  const a = THREE.MathUtils.degToRad(deg);
  return PIVOT.clone()
    .addScaledVector(D, s)
    .addScaledVector(X, r * Math.cos(a))
    .addScaledVector(U, r * Math.sin(a));
}

/** Axial position of a model-space point along the tube, in metres from the pivot. */
function along(p: { x: number; y: number; z: number }): number {
  return (p.x - PIVOT.x) * D.x + (p.y - PIVOT.y) * D.y + (p.z - PIVOT.z) * D.z;
}

// ── Paints ───────────────────────────────────────────────
// Brass body: engine-turned engraved bands and fine lines, placed along the tube's axis.
const HATCH: [number, number][] = [
  [0.044, 0.052],
  [0.088, 0.1],
  [0.27, 0.3],
];
const LINES = [0.056, 0.315];

const brassTube = paint((p, _n, s) => {
  const a = along(p);
  if (LINES.some((g) => Math.abs(a - g) < 0.0012)) return BRASS_DARK;
  if (HATCH.some(([lo, hi]) => a > lo && a < hi)) {
    return (Math.floor(s[1] / 6) + Math.floor(a / 0.0022)) % 2 === 0 ? BRASS : BRASS_MID;
  }
  return BRASS;
});

// Leather wrap: mottled hide with a cream stitched seam running down the side.
const hide = mottle(LEATHER, LEATHER_DARK, { size: 0.05 });
const leather = paint((p, _n, s) => {
  const stitch = Math.abs(s[1] - 90) < 2.5 && Math.floor(along(p) / 0.008) % 2 === 0;
  return stitch ? STITCH : hide;
});

// Coated optics: concentric bloom rings, like an anti-reflection coating.
function coatedGlass(centre: THREE.Vector3) {
  return paint((p) => {
    const r = Math.hypot(p.x - centre.x, p.y - centre.y, p.z - centre.z);
    return Math.floor(r / 0.006) % 2 === 0 ? GLASS : GLASS_BLOOM;
  });
}

// ── Model ────────────────────────────────────────────────
const FEET: [number, number][] = [
  [0, 0.5],
  [0.44, -0.25],
  [-0.44, -0.25],
];

export default function build() {
  const b = createBuilder({ name: "brass-explorer-telescope" });

  // Skeleton: the tripod stands on `base`; the tube turns on `tube` about the trunnion.
  const base = b.joint("base", { at: [0, 0, 0] });
  const tube = b.joint("tube", { parent: base, at: PIVOT, dir: D, role: "hinge" });

  // ── Tripod ─────────────────────────────────────────────
  const legs = FEET.map(([x, z]) => {
    const foot = new THREE.Vector3(x, 0.016, z); // rubber tip centre, sitting on the floor
    const top = new THREE.Vector3(x * 0.12, 0.93, z * 0.12); // up into the hub
    return { foot, top, dir: foot.clone().sub(top).normalize() };
  });

  for (const { foot, top, dir } of legs) {
    const shoe = foot.clone().addScaledVector(dir, -0.07); // where the brass ferrule starts

    // Turned mahogany leg, with a bulge and a taper.
    b.sweep([top, shoe], [0.027, 0.021, 0.025, 0.018, 0.016], {
      sides: 10,
      caps: { start: "flat", end: "flat" },
      color: grain(MAHOGANY, MAHOGANY_LIGHT, { size: 0.012, axis: dir }),
      bone: base,
      group: "legs",
    });
    // Brass collar under the hub.
    b.sweep([top, top.clone().addScaledVector(dir, 0.05)], 0.031, {
      sides: 10,
      caps: "flat",
      color: BRASS_LIGHT,
      bone: base,
      group: "fittings",
    });
    // Brass ferrule and rubber shoe.
    b.sweep([shoe, foot], 0.019, { sides: 10, caps: "flat", color: BRASS, bone: base, group: "fittings" });
    b.part(new THREE.SphereGeometry(0.016, 8, 6), RUBBER, { at: foot, bone: base, group: "fittings" });
  }

  // Hub: a turned brass casting the legs and yoke sit in.
  const HUB: OutlinePoint[] = [
    [0, 0],
    [0.07, 0],
    [0.086, 0.02],
    [0.086, 0.05],
    [0.06, 0.07],
    [0.032, 0.081],
    [0, 0.081],
  ];
  b.lathe(HUB, { at: [0, 0.9, 0], segments: 14, smoothing: 1, color: BRASS, bone: base, group: "head" });

  // Yoke: two arms rising from the hub to the trunnion, with a pin, a lock knob and an end cap.
  for (const sx of [1, -1]) {
    b.capsule([sx * 0.07, 0.95, 0], [sx * 0.1, PIVOT.y, 0], 0.012, { color: BRASS, bone: base, group: "yoke" });
  }
  b.capsule([-0.1, PIVOT.y, 0], [0.1, PIVOT.y, 0], 0.011, { color: BRASS_DARK, bone: base, group: "yoke" });
  b.part(new THREE.SphereGeometry(0.015, 8, 6), BRASS, { at: [0.1, PIVOT.y, 0], bone: base, group: "yoke" });
  const LOCK: OutlinePoint[] = [
    [0, 0],
    [0.024, 0],
    [0.029, 0.008],
    [0.026, 0.016],
    [0.018, 0.022],
    [0, 0.022],
  ];
  b.lathe(LOCK, {
    at: [-0.112, PIVOT.y, 0],
    axis: [-1, 0, 0],
    segments: 16,
    smoothing: 1,
    color: BRASS_LIGHT,
    bone: base,
    group: "yoke",
  });

  // Star-chart tray hung from the front leg on a brass bracket.
  const hangT = (0.93 - 0.5) / (0.93 - 0.016);
  const hang = legs[0].top.clone().lerp(legs[0].foot, hangT);
  const C = new THREE.Vector3(0.13, 0.5, hang.z);
  b.capsule([0, C.y - 0.005, hang.z], [C.x - 0.02, C.y - 0.005, hang.z], 0.008, {
    color: BRASS_DARK,
    bone: base,
    group: "tray",
  });
  const TRAY: OutlinePoint[] = [
    [0, 0],
    [0.075, 0],
    [0.088, 0.012],
    [0.094, 0.02],
    [0.084, 0.02],
    [0.072, 0.011],
    [0, 0.011],
  ];
  b.lathe(TRAY, {
    at: C,
    segments: 20,
    color: grain(MAHOGANY, MAHOGANY_LIGHT, { size: 0.012, axis: X }),
    bone: base,
    group: "tray",
  });
  // Rolled star chart, printed with stars, tied with a red ribbon.
  const roll = C.clone().add(new THREE.Vector3(0, 0.028, 0));
  b.sweep(
    [roll.clone().add(new THREE.Vector3(-0.045, 0, 0)), roll.clone().add(new THREE.Vector3(0.045, 0, 0))],
    0.016,
    {
      sides: 10,
      color: spots(PAPER, STAR_INK, { size: 0.014, amount: 0.12 }),
      bone: base,
      group: "tray",
    },
  );
  b.part(new THREE.TorusGeometry(0.0168, 0.0035, 6, 14), RIBBON, {
    at: roll,
    dir: X,
    axis: "z",
    bone: base,
    group: "tray",
  });

  // ── Telescope (turns on the trunnion) ──────────────────

  // Eyepiece barrel and rubber eyecup, pointing back along the axis.
  b.sweep([at(-0.3), at(-0.15)], 0.027, { sides: 12, caps: "flat", color: BRASS_LIGHT, bone: tube, group: "eyepiece" });
  const EYECUP: OutlinePoint[] = [
    [0, 0],
    [0.024, 0],
    [0.032, 0.012],
    [0.04, 0.03],
    [0.042, 0.04],
    [0.032, 0.05],
    [0, 0.05],
  ];
  b.lathe(EYECUP, {
    at: at(-0.29),
    axis: D.clone().negate(),
    segments: 14,
    smoothing: 1,
    color: RUBBER,
    bone: tube,
    group: "eyepiece",
  });

  // Focuser collar, with a knurled focusing knob on each side.
  b.sweep([at(-0.21), at(-0.14)], 0.05, { sides: 12, caps: "flat", color: BRASS_DARK, bone: tube, group: "focuser" });
  const KNOB: OutlinePoint[] = [
    [0, 0],
    [0.026, 0],
    [0.031, 0.006],
    [0.031, 0.014],
    [0.024, 0.02],
    [0, 0.02],
  ];
  for (const sx of [1, -1]) {
    b.lathe(KNOB, {
      at: at(-0.18, 0.04, sx > 0 ? 0 : 180),
      axis: new THREE.Vector3(sx, 0, 0),
      segments: 16,
      smoothing: 1,
      color: BRASS_LIGHT,
      bone: tube,
      group: "focuser",
    });
  }

  // Leather-wrapped draw sections.
  b.sweep([at(-0.16), at(0)], 0.047, { sides: 12, caps: "flat", color: leather, bone: tube, group: "leather" });
  b.sweep([at(0.1), at(0.26)], 0.047, { sides: 12, caps: "flat", color: leather, bone: tube, group: "leather" });

  // Engraved brass body from the focuser to the objective.
  const body = b.sweep([at(-0.2), at(0.4)], 0.043, {
    sides: 12,
    caps: "flat",
    color: brassTube,
    bone: tube,
    group: "body",
  });

  // Clamp on the trunnion, and brass rings where the leather meets the brass.
  b.sweep([at(-0.04), at(0.04)], 0.056, { sides: 12, caps: "flat", color: BRASS_LIGHT, bone: tube, group: "clamp" });
  for (const s of [0.1, 0.26]) {
    b.part(new THREE.TorusGeometry(0.048, 0.0035, 6, 20), BRASS_LIGHT, {
      at: at(s),
      dir: D,
      axis: "z",
      bone: tube,
      group: "rings",
    });
  }

  // Objective: brass cell, coated glass and a bezel.
  b.sweep([at(0.34), at(0.42)], 0.052, {
    sides: 12,
    caps: { start: "flat", end: "none" },
    color: BRASS_LIGHT,
    bone: tube,
    group: "objective",
  });
  b.sweep([at(0.405), at(0.419)], 0.043, {
    sides: 12,
    caps: "flat",
    color: coatedGlass(at(0.41)),
    bone: tube,
    group: "objective",
  });
  b.part(new THREE.TorusGeometry(0.047, 0.005, 6, 20), BRASS_LIGHT, {
    at: at(0.42),
    dir: D,
    axis: "z",
    bone: tube,
    group: "objective",
  });

  // Maker's compass-rose plate, decaled onto the brass body.
  const plate = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="29" fill="#e9c77a" stroke="#6b4716" stroke-width="3"/>
      <circle cx="32" cy="32" r="22" fill="none" stroke="#6b4716" stroke-width="1.5"/>
      <path d="M32 7 L36 28 L57 32 L36 36 L32 57 L28 36 L7 32 L28 28 Z" fill="#6b4716"/>
      <path d="M32 17 L34 30 L47 32 L34 34 L32 47 L30 34 L17 32 L30 30 Z" fill="#e9c77a"/>
      <circle cx="32" cy="32" r="2.5" fill="#6b4716"/>
    </svg>`,
    { size: 256 },
  );
  b.decal(body, plate, { at: at(0.07, 0.043, 0), dir: X, size: [0.034, 0.034], bone: tube, group: "plate" });

  // Finder scope on two brass saddles: lacquered tube, brass fittings, a rubber eyecup.
  const fAt = (s: number) => at(s, 0.08, 90);
  b.sweep([fAt(-0.07), fAt(0.2)], 0.02, { sides: 10, caps: "flat", color: LACQUER, bone: tube, group: "finder" });
  b.sweep([fAt(-0.1), fAt(-0.06)], 0.015, { sides: 10, caps: "flat", color: BRASS_LIGHT, bone: tube, group: "finder" });
  b.sweep([fAt(-0.115), fAt(-0.1)], 0.018, { sides: 10, caps: "flat", color: RUBBER, bone: tube, group: "finder" });
  b.sweep([fAt(0.18), fAt(0.225)], 0.025, {
    sides: 10,
    caps: { start: "flat", end: "none" },
    color: BRASS_LIGHT,
    bone: tube,
    group: "finder",
  });
  b.sweep([fAt(0.205), fAt(0.22)], 0.019, {
    sides: 10,
    caps: "flat",
    color: coatedGlass(fAt(0.212)),
    bone: tube,
    group: "finder",
  });
  b.part(new THREE.TorusGeometry(0.0255, 0.0035, 6, 16), BRASS_LIGHT, {
    at: fAt(0.225),
    dir: D,
    axis: "z",
    bone: tube,
    group: "finder",
  });
  for (const s of [0.05, 0.15]) {
    b.capsule(at(s, 0.03, 90), at(s, 0.062, 90), 0.008, { color: BRASS, bone: tube, group: "finder" });
    b.part(new THREE.TorusGeometry(0.0215, 0.0032, 6, 16), BRASS_LIGHT, {
      at: fAt(s),
      dir: D,
      axis: "z",
      bone: tube,
      group: "finder",
    });
  }

  return b.root;
}
```