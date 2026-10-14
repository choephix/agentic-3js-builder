```ts
import * as THREE from "three";
import { catmull, createBuilder, frame, gradient, grain, mottle, paint, svg } from "agentic-3js-builder";
import type { Fill } from "agentic-3js-builder";

export const meta = {
  name: "Brass explorer's telescope",
  description:
    "A polished brass telescope tube with leather-wrapped grips, engraved rings, a finder scope, a rubber eyecup and knurled focusing knobs, on a mahogany tripod with brass fittings, a compass plaque and a tray holding a rolled star chart.",
};

const DEG = Math.PI / 180;
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// The telescope: its centre, its axis (forward and 40 degrees up), the side the finder rides on, and the side axis.
const CENTRE = v3(0, 1.1, 0);
const ELEVATION = 40 * DEG;
const AXIS = v3(0, Math.sin(ELEVATION), Math.cos(ELEVATION));
const UP = v3(0, Math.cos(ELEVATION), -Math.sin(ELEVATION));
const SIDE = v3(1, 0, 0);

/** A point `s` metres along the tube from its centre (negative toward the eyepiece), moved by `offset`. */
const onAxis = (s: number, offset: THREE.Vector3 = v3(0, 0, 0)) =>
  CENTRE.clone().addScaledVector(AXIS, s).add(offset);

// Colour. Brass, mahogany and leather are paints (streaks, seams and engraving come from the surface); rubber,
// glass and the star chart are plain.
const BRASS = "#dfb35c";
const BRASS_DEEP = "#7a5316";
const ENGRAVING = "#3a2508";
const KNURL = "#6b4a1a";
const MAHOGANY = "#4a1f0e";
const MAHOGANY_LIGHT = "#8e4824";
const LEATHER = "#5c3319";
const LEATHER_LIGHT = "#804d28";
const LEATHER_SEAM = "#1d0e06";
const RUBBER = "#161411";
const LENS_FINDER = "#2a5a8c";
const LENS_DARK = "#17395f";
const LENS_LIGHT = "#6d9fd0";
const PAPER = "#efe4c6";

/** Polished brass, its streaks running along the tube. */
const brassTube = grain(BRASS, BRASS_DEEP, { size: 0.02, axis: AXIS, seed: 2 });
/** Brass fittings, streaks running up. */
const brassFitting = grain(BRASS, BRASS_DEEP, { size: 0.02, axis: "y", seed: 7 });

/** Mahogany with its grain running along `axis`. */
const mahogany = (axis: THREE.Vector3 | "x" | "y" | "z") =>
  grain(MAHOGANY, MAHOGANY_LIGHT, { size: 0.03, axis, seed: 5 });

const leatherBase = mottle(LEATHER, LEATHER_LIGHT, { size: 0.012, seed: 4, contrast: 1.4 });

/** Leather cord wound round a grip `turns` times along its length: dark seams over mottled hide. */
function leatherWrap(turns: number) {
  return paint((_p, _n, [t, deg]) => ((t * turns + deg / 360) % 1 < 0.16 ? LEATHER_SEAM : leatherBase));
}

/** `base`, with thin dark rings engraved where the rod from `from` to `to` (metres along the axis) crosses each `rings`. */
function engraved(base: Fill, rings: number[], from: number, to: number) {
  const span = to - from;
  const centres = rings.map((s) => (s - from) / span);
  const half = 0.003 / span;
  return paint((_p, _n, [t]) => (centres.some((c) => Math.abs(t - c) < half) ? ENGRAVING : base));
}

const PLAQUE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 220">
<rect width="300" height="220" fill="#d9ab55"/>
<rect x="12" y="12" width="276" height="196" fill="none" stroke="#5a3608" stroke-width="7"/>
<circle cx="150" cy="112" r="68" fill="none" stroke="#5a3608" stroke-width="4"/>
<circle cx="150" cy="112" r="46" fill="none" stroke="#5a3608" stroke-width="2"/>
<path d="M150 42 L158 112 L150 182 L142 112 Z" fill="#5a3608"/>
<path d="M82 112 L150 104 L218 112 L150 120 Z" fill="#5a3608"/>
<path d="M150 72 L154 112 L150 152 L146 112 Z" fill="#f2d68f"/>
<path d="M104 66 L196 158 M196 66 L104 158" stroke="#5a3608" stroke-width="3"/>
<text x="150" y="34" font-family="serif" font-size="22" font-weight="bold" text-anchor="middle" fill="#5a3608">N</text>
</svg>`;

const STAR_CHART = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160">
<rect width="240" height="160" fill="#14233f"/>
<circle cx="120" cy="80" r="70" fill="none" stroke="#c9b27a" stroke-width="1.5" stroke-dasharray="4 3"/>
<circle cx="120" cy="80" r="44" fill="none" stroke="#c9b27a" stroke-width="1"/>
<path d="M60 52 L92 40 L118 66 L104 98 M150 58 L176 84 L160 112 L134 104" fill="none" stroke="#8fa8cf" stroke-width="1.3"/>
<g fill="#f6f1d8">
<circle cx="60" cy="52" r="2.6"/><circle cx="92" cy="40" r="2"/><circle cx="118" cy="66" r="3"/><circle cx="104" cy="98" r="2.2"/>
<circle cx="150" cy="58" r="1.6"/><circle cx="176" cy="84" r="2.8"/><circle cx="160" cy="112" r="1.8"/><circle cx="134" cy="104" r="2.4"/>
<circle cx="38" cy="120" r="1.4"/><circle cx="200" cy="34" r="1.6"/><circle cx="196" cy="128" r="1.2"/><circle cx="30" cy="30" r="1"/>
<circle cx="88" cy="136" r="1.3"/><circle cx="150" cy="22" r="1.1"/><circle cx="220" cy="90" r="1.4"/>
</g>
<text x="120" y="156" font-family="serif" font-size="9" text-anchor="middle" fill="#c9b27a">STAR CHART</text>
</svg>`;

export default function telescope() {
  const b = createBuilder({ name: "brass-telescope" });

  // Bones: the tripod stands on `base`, its head sits on `head`, and the telescope pivots on `tube`.
  b.joint("base", { at: v3(0, 0, 0), dir: v3(0, 1, 0) });
  b.joint("head", { at: v3(0, 0.87, 0), dir: v3(0, 1, 0), parent: "base" });
  b.joint("tube", { at: CENTRE, dir: AXIS, parent: "head" });

  // ---------- Tripod ----------
  const LEG_TOP = 0.84;
  const LEG_SPLAY = 0.07;
  const FOOT_RADIUS = 0.34;
  const HUB = v3(0, 0.24, 0);
  const S = Math.sqrt(3) / 2;
  const legs: Array<[number, number]> = [
    [0, 1],
    [S, -0.5],
    [-S, -0.5],
  ];
  for (const [dx, dz] of legs) {
    const top = v3(dx * LEG_SPLAY, LEG_TOP, dz * LEG_SPLAY);
    const foot = v3(dx * FOOT_RADIUS, 0, dz * FOOT_RADIUS);
    const down = foot.clone().sub(top).normalize();
    b.sweep([top, foot], (t) => 0.034 - 0.013 * t, {
      color: mahogany(down),
      bone: "base",
      caps: "flat",
      sides: 8,
      name: "leg",
    });
    b.part(new THREE.CylinderGeometry(0.024, 0.021, 0.05, 10), brassFitting, {
      at: foot.clone().addScaledVector(down, -0.025),
      dir: down,
      bone: "base",
      name: "ferrule",
    });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 12), brassFitting, {
      at: top.clone().lerp(foot, 0.5),
      dir: down,
      bone: "base",
      name: "leg clamp",
    });
    b.rod(HUB, top.clone().lerp(foot, (LEG_TOP - HUB.y) / LEG_TOP), 0.007, {
      color: brassFitting,
      bone: "base",
      sides: 6,
      name: "spreader",
    });
  }
  b.part(new THREE.SphereGeometry(0.026, 12, 8), brassFitting, { at: HUB, bone: "base", name: "spreader knuckle" });

  // Tripod head, its brass band and column.
  const head = b.part(new THREE.CylinderGeometry(0.11, 0.095, 0.075, 8), mahogany(v3(0, 1, 0)), {
    at: v3(0, 0.87, 0),
    bone: "head",
    name: "tripod head",
  });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.012, 12), brassFitting, {
    at: v3(0, 0.905, 0),
    bone: "head",
    name: "head band",
  });
  b.part(new THREE.CylinderGeometry(0.026, 0.03, 0.075, 10), brassFitting, {
    at: v3(0, 0.9375, 0),
    bone: "head",
    name: "column",
  });

  // A compass plaque, seated on the head's front facet by a surface hit.
  const facet = 22.5 * DEG;
  const spot = b.surface(head).nearest(v3(Math.sin(facet) * 0.2, 0.87, Math.cos(facet) * 0.2));
  b.stick(new THREE.BoxGeometry(0.05, 0.004, 0.036), "#ffffff", spot, {
    texture: svg(PLAQUE, { size: 384 }),
    bone: "head",
    embed: 0.5,
    name: "plaque",
  });

  // ---------- Telescope tube (bone: tube) ----------
  const TUBE_REAR = -0.3;
  const TUBE_FRONT = 0.2;
  b.rod(onAxis(TUBE_REAR), onAxis(TUBE_FRONT), 0.04, {
    color: engraved(brassTube, [-0.283, -0.06, -0.04, 0.15, 0.165], TUBE_REAR, TUBE_FRONT),
    bone: "tube",
    sides: 12,
    name: "tube",
  });

  // Objective cell, flange and glass.
  b.rod(onAxis(TUBE_FRONT), onAxis(0.296), 0.048, {
    color: engraved(brassTube, [0.225, 0.268], TUBE_FRONT, 0.296),
    bone: "tube",
    sides: 12,
    name: "objective cell",
  });
  b.part(new THREE.CylinderGeometry(0.0495, 0.0495, 0.008, 12), brassFitting, {
    at: onAxis(TUBE_FRONT),
    dir: AXIS,
    bone: "tube",
    name: "cell flange",
  });
  const glass = gradient(
    LENS_DARK,
    LENS_LIGHT,
    onAxis(0.3, SIDE.clone().multiplyScalar(-0.04)),
    onAxis(0.3, SIDE.clone().multiplyScalar(0.04)),
  );
  b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.008, 14), glass, {
    at: onAxis(0.3),
    dir: AXIS,
    bone: "tube",
    name: "objective glass",
  });

  // Eyepiece, its ring, and the rubber eyecup.
  b.rod(onAxis(TUBE_REAR), onAxis(-0.36), 0.024, { color: brassTube, bone: "tube", sides: 10, name: "eyepiece" });
  b.part(new THREE.CylinderGeometry(0.0255, 0.0255, 0.006, 12), brassFitting, {
    at: onAxis(-0.335),
    dir: AXIS,
    bone: "tube",
    name: "eyepiece ring",
  });
  b.lathe(
    [
      [0, 0],
      [0.022, 0],
      [0.03, 0.018],
      [0.031, 0.03],
      [0, 0.03],
    ],
    { color: RUBBER, at: onAxis(-0.36), axis: AXIS.clone().negate(), bone: "tube", name: "eyecup" },
  );

  // Leather-wrapped grips between brass bands.
  b.rod(onAxis(-0.2), onAxis(-0.1), 0.0415, { color: leatherWrap(14), bone: "tube", sides: 12, name: "grip" });
  b.rod(onAxis(0), onAxis(0.1), 0.0415, { color: leatherWrap(14), bone: "tube", sides: 12, name: "grip" });
  for (const s of [-0.292, -0.205, -0.095, 0.005, 0.105]) {
    b.part(new THREE.CylinderGeometry(0.0425, 0.0425, 0.008, 12), brassFitting, {
      at: onAxis(s),
      dir: AXIS,
      bone: "tube",
      name: "brass band",
    });
  }

  // Trunnion collar, the yoke that carries it, and the elevation handle.
  b.part(new THREE.CylinderGeometry(0.056, 0.056, 0.04, 14), brassFitting, {
    at: CENTRE,
    dir: AXIS,
    bone: "tube",
    name: "trunnion collar",
  });
  b.sweep(
    catmull([
      v3(0.058, CENTRE.y, 0),
      v3(0.04, 1.0, 0),
      v3(0, 0.985, 0),
      v3(-0.04, 1.0, 0),
      v3(-0.058, CENTRE.y, 0),
    ]),
    0.011,
    { color: brassFitting, bone: "head", sides: 8, caps: "round", name: "yoke" },
  );
  b.rod(CENTRE.clone().addScaledVector(SIDE, -0.054), CENTRE.clone().addScaledVector(SIDE, -0.11), 0.008, {
    color: brassFitting,
    bone: "tube",
    sides: 8,
    name: "elevation handle",
  });
  b.part(new THREE.SphereGeometry(0.02, 12, 8), brassFitting, {
    at: CENTRE.clone().addScaledVector(SIDE, -0.12),
    bone: "tube",
    name: "elevation knob",
  });

  // Focusing knobs: a knurled disc on each side of the tube, its rim ringed with teeth.
  function focusKnob(side: 1 | -1, s: number, radius: number, teeth: number) {
    const axis = [side, 0, 0];
    const disc = onAxis(s, v3(side * 0.06, 0, 0));
    b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.02, 10), brassFitting, {
      at: onAxis(s, v3(side * 0.046, 0, 0)),
      dir: axis,
      bone: "tube",
      name: "knob boss",
    });
    b.part(new THREE.CylinderGeometry(radius, radius, 0.012, 18), brassFitting, {
      at: disc,
      dir: axis,
      bone: "tube",
      name: "focus knob",
    });
    b.ring(frame(disc, axis), { count: teeth, radius: radius - 0.001 }, (item) => {
      b.stick(new THREE.BoxGeometry(0.006, 0.006, 0.01), KNURL, item, { bone: "tube", embed: 0.4, name: "knurl" });
    });
  }
  focusKnob(1, -0.262, 0.032, 16);
  focusKnob(-1, -0.262, 0.022, 12);

  // Finder scope riding on top of the tube, held by two struts.
  const finderAt = (s: number) => onAxis(s, UP.clone().multiplyScalar(0.085));
  b.rod(finderAt(-0.12), finderAt(0.14), 0.02, { color: brassTube, bone: "tube", sides: 10, name: "finder" });
  b.part(new THREE.CylinderGeometry(0.014, 0.017, 0.022, 10), RUBBER, {
    at: finderAt(-0.128),
    dir: AXIS,
    bone: "tube",
    name: "finder eyecup",
  });
  b.part(new THREE.CylinderGeometry(0.023, 0.023, 0.012, 10), brassFitting, {
    at: finderAt(0.136),
    dir: AXIS,
    bone: "tube",
    name: "finder ring",
  });
  b.part(new THREE.CylinderGeometry(0.017, 0.017, 0.004, 10), LENS_FINDER, {
    at: finderAt(0.143),
    dir: AXIS,
    bone: "tube",
    name: "finder glass",
  });
  for (const s of [-0.06, 0.07]) {
    b.rod(onAxis(s, UP.clone().multiplyScalar(0.032)), onAxis(s, UP.clone().multiplyScalar(0.07)), 0.007, {
      color: brassFitting,
      bone: "tube",
      sides: 6,
      name: "finder strut",
    });
  }

  // ---------- Tray with a rolled star chart (bone: base) ----------
  const trayWood = mahogany(v3(1, 0, 0));
  b.extrude(
    [
      [-0.21, -0.08],
      [0.21, -0.08],
      [0.21, 0.08],
      [-0.21, 0.08],
    ],
    {
      color: trayWood,
      at: v3(0, 0.352, -0.1),
      x: v3(1, 0, 0),
      y: v3(0, 0, 1),
      thickness: 0.016,
      bevel: 0.005,
      smoothing: 2,
      bone: "base",
      name: "tray",
    },
  );
  const rimY = 0.372;
  const rimH = 0.024;
  b.part(new THREE.BoxGeometry(0.432, rimH, 0.012), trayWood, { at: v3(0, rimY, -0.174), bone: "base", name: "tray rim" });
  b.part(new THREE.BoxGeometry(0.432, rimH, 0.012), trayWood, { at: v3(0, rimY, -0.026), bone: "base", name: "tray rim" });
  b.part(new THREE.BoxGeometry(0.012, rimH, 0.16), trayWood, { at: v3(0.204, rimY, -0.1), bone: "base", name: "tray rim" });
  b.part(new THREE.BoxGeometry(0.012, rimH, 0.16), trayWood, { at: v3(-0.204, rimY, -0.1), bone: "base", name: "tray rim" });

  // The star chart, unrolled a little onto the tray.
  const chartSheet = new THREE.PlaneGeometry(0.19, 0.127);
  chartSheet.rotateX(-Math.PI / 2);
  b.part(chartSheet, "#ffffff", {
    at: v3(-0.05, 0.3615, -0.1),
    texture: svg(STAR_CHART, { size: 512 }),
    bone: "base",
    name: "star chart",
  });

  // The rest of the chart, rolled, with two brass straps.
  b.rod(v3(0.07, 0.38, -0.1), v3(0.19, 0.38, -0.1), 0.02, { color: PAPER, bone: "base", sides: 10, name: "rolled chart" });
  for (const x of [0.12, 0.18]) {
    b.part(new THREE.CylinderGeometry(0.0215, 0.0215, 0.01, 10), brassFitting, {
      at: v3(x, 0.38, -0.1),
      dir: [1, 0, 0],
      bone: "base",
      name: "roll strap",
    });
  }

  return b.root;
}
```