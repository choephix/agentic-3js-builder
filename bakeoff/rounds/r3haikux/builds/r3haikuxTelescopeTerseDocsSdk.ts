import * as THREE from "three";
import { createBuilder, frame, grain, svg } from "../../../../src/index";

type V = [number, number, number];

export const meta = {
  name: "Telescope",
  description:
    "A refractor on a walnut tripod: a cream tube with a navy dew shield, brass rings and rivets, a finder scope, and a constellation label on each side.",
};

const CREAM = "#efe4cc";
const NAVY = "#1f2d4d";
const BRASS = "#d1a94f";
const DARK = "#2d2f38";
const RUBBER = "#18191d";
const GLASS = "#7cc4dd";
const STAR = "#f6e3a1";
const WOOD_LIGHT = "#bb8752";
const WOOD_DARK = "#6b4226";

// The tube points forward and up at 42 degrees, turning about an altitude axis at PIVOT.
const ELEV = (42 * Math.PI) / 180;
const PIVOT: V = [0, 1.05, 0];
const D: V = [0, Math.sin(ELEV), Math.cos(ELEV)]; // along the tube, toward the objective
const U: V = [0, Math.cos(ELEV), -Math.sin(ELEV)]; // across the tube, toward the sky
const BACK: V = [0, -D[1], -D[2]]; // toward the eyepiece

/** A point on the tube: s metres along it from the pivot, `up` across it, `side` along +X (the model's left). */
const onTube = (s: number, up = 0, side = 0): V => [
  PIVOT[0] + side,
  PIVOT[1] + D[1] * s + U[1] * up,
  PIVOT[2] + D[2] * s + U[2] * up,
];

// Constellation label for the sides of the tube.
const LABEL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130">
  <rect x="1" y="1" width="98" height="128" rx="9" fill="${NAVY}"/>
  <rect x="6" y="6" width="88" height="118" rx="5" fill="none" stroke="${BRASS}" stroke-width="1.6"/>
  <g fill="none" stroke="${BRASS}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="28,30 46,44 40,66 60,84 76,68"/>
    <polyline points="46,44 68,38 76,68"/>
    <polyline points="40,66 34,92"/>
  </g>
  <g fill="${STAR}">
    <circle cx="28" cy="30" r="3"/>
    <circle cx="46" cy="44" r="2.4"/>
    <circle cx="68" cy="38" r="2"/>
    <circle cx="40" cy="66" r="2.6"/>
    <circle cx="60" cy="84" r="2.2"/>
    <circle cx="76" cy="68" r="3.2"/>
    <circle cx="34" cy="92" r="1.8"/>
    <circle cx="82" cy="20" r="1.2"/>
    <circle cx="18" cy="108" r="1.2"/>
  </g>
</svg>`;

export default function build() {
  const b = createBuilder({ name: "telescope" });

  // Skeleton: tripod base, mount head, and the tube on its altitude axis.
  const base = b.joint("base", { at: [0, 0, 0] });
  const mount = b.joint("mount", { parent: base, at: [0, 0.83, 0], dir: [0, 1, 0] });
  const tube = b.joint("tube", { parent: mount, at: PIVOT, dir: D, role: "hinge" });

  // Tripod: three walnut legs with grain running down each one, a brass brace ring, rubber feet.
  for (const deg of [0, 120, 240]) {
    const a = (deg * Math.PI) / 180;
    const top: V = [Math.sin(a) * 0.07, 0.79, Math.cos(a) * 0.07];
    const foot: V = [Math.sin(a) * 0.58, 0.03, Math.cos(a) * 0.58];
    const run: V = [foot[0] - top[0], foot[1] - top[1], foot[2] - top[2]];
    b.rod(top, foot, [0.03, 0.02], {
      color: grain(WOOD_LIGHT, WOOD_DARK, { size: 0.012, axis: run, seed: deg + 5 }),
      bone: base,
    });
    b.part(new THREE.CylinderGeometry(0.03, 0.034, 0.03, 10), RUBBER, {
      at: [foot[0], 0.015, foot[2]],
      bone: base,
      flat: true,
    });
  }
  b.part(new THREE.TorusGeometry(0.385, 0.011, 6, 24), BRASS, {
    at: [0, 0.32, 0],
    dir: [0, 1, 0],
    axis: "z",
    bone: base,
  });

  // Head: a turned hub, a pier, and a V yoke that cradles the tube.
  b.lathe(
    [[0, 0], [0.085, 0], [0.095, 0.025], [0.07, 0.06], [0.05, 0.09], [0, 0.09]],
    { at: [0, 0.74, 0], axis: [0, 1, 0], color: DARK, bone: base },
  );
  b.lathe(
    [[0.07, 0], [0.092, 0], [0.092, 0.012], [0.07, 0.012]],
    { at: [0, 0.775, 0], axis: [0, 1, 0], color: BRASS, bone: base },
  );
  b.part(new THREE.CylinderGeometry(0.034, 0.04, 0.08, 10), DARK, {
    at: [0, 0.87, 0],
    bone: mount,
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.02, 12), BRASS, {
    at: [0, 0.91, 0],
    bone: mount,
    flat: true,
  });
  for (const s of [1, -1]) {
    b.rod([0, 0.905, 0], [s * 0.095, PIVOT[1], 0], [0.02, 0.014], { color: DARK, bone: mount });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 12), BRASS, {
      at: [s * 0.124, PIVOT[1], 0],
      dir: [s, 0, 0],
      bone: tube,
      flat: true,
    });
  }
  // The cradle ring around the tube, on the altitude axis.
  b.part(new THREE.TorusGeometry(0.095, 0.018, 8, 20), BRASS, {
    at: PIVOT,
    dir: D,
    axis: "z",
    bone: tube,
  });

  // Optical tube: cream body, navy dew shield with a brass collar and rivets, glass objective.
  const body = b.lathe(
    [[0, 0], [0.064, 0], [0.072, 0.012], [0.072, 0.688], [0.066, 0.7], [0, 0.7]],
    { at: onTube(-0.3), axis: D, segments: 16, color: CREAM, bone: tube },
  );
  b.lathe([[0.068, 0], [0.077, 0], [0.077, 0.015], [0.068, 0.015]], {
    at: onTube(0.36),
    axis: D,
    color: BRASS,
    bone: tube,
  });
  b.lathe([[0.066, 0], [0.082, 0], [0.082, 0.1], [0.066, 0.1]], {
    at: onTube(0.4),
    axis: D,
    segments: 16,
    color: NAVY,
    bone: tube,
  });
  b.lathe([[0.08, 0.03], [0.088, 0.03], [0.088, 0.042], [0.08, 0.042]], {
    at: onTube(0.4),
    axis: D,
    color: BRASS,
    bone: tube,
  });
  b.lathe([[0, 0], [0.064, 0], [0.064, 0.006], [0, 0.006]], {
    at: onTube(0.398),
    axis: D,
    color: GLASS,
    bone: tube,
  });
  b.ring(frame(onTube(0.5), D), { count: 6, radius: 0.074 }, (item) => {
    b.part(new THREE.SphereGeometry(0.0065, 6, 4), BRASS, { at: item, bone: tube });
  });

  // Finder scope on a dovetail bar, with a brass cap and a glass objective.
  b.part(new THREE.BoxGeometry(0.036, 0.012, 0.23), DARK, {
    at: onTube(0.155, 0.076),
    dir: D,
    axis: "z",
    bone: tube,
    flat: true,
  });
  for (const s of [0.1, 0.22]) {
    b.rod(onTube(s, 0.05), onTube(s, 0.1), 0.008, { color: BRASS, bone: tube });
  }
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.24, 12), NAVY, {
    at: onTube(0.16, 0.125),
    dir: D,
    bone: tube,
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.012, 12), BRASS, {
    at: onTube(0.284, 0.125),
    dir: D,
    bone: tube,
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.004, 12), GLASS, {
    at: onTube(0.292, 0.125),
    dir: D,
    bone: tube,
    flat: true,
  });

  // Rear focuser with brass knobs, a brass drawtube, and a straight-through eyepiece.
  b.lathe(
    [[0, 0], [0.052, 0], [0.058, 0.008], [0.058, 0.052], [0.052, 0.06], [0, 0.06]],
    { at: onTube(-0.36), axis: D, color: DARK, bone: tube },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.03, 10), BRASS, {
      at: onTube(-0.33, 0, s * 0.07),
      dir: [s, 0, 0],
      bone: tube,
      flat: true,
    });
  }
  b.rod(onTube(-0.34), onTube(-0.46), 0.034, { color: DARK, bone: tube });
  b.lathe(
    [[0, 0], [0.03, 0], [0.03, 0.012], [0.026, 0.02], [0.026, 0.11], [0, 0.11]],
    { at: onTube(-0.42), axis: BACK, color: BRASS, bone: tube },
  );
  b.lathe(
    [[0, 0], [0.024, 0], [0.034, 0.03], [0.036, 0.04], [0, 0.04]],
    { at: onTube(-0.52), axis: BACK, color: DARK, bone: tube },
  );
  b.lathe([[0, 0], [0.022, 0], [0.022, 0.012], [0, 0.012]], {
    at: onTube(-0.55),
    axis: BACK,
    color: GLASS,
    bone: tube,
  });

  // Constellation label on both sides of the tube, top toward the objective.
  const label = svg(LABEL, { size: 256 });
  for (const s of [1, -1]) {
    b.decal(body, label, {
      at: onTube(0.1, 0, s * 0.07),
      dir: [s, 0, 0],
      up: D,
      size: [0.09, 0.117],
      bone: tube,
    });
  }

  return b.root;
}
