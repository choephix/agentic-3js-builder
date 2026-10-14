import * as THREE from "three";
import { catmull, createBuilder, gradient, grain, paint, svg } from "../../../../src/index";

export const meta = {
  name: "Gramophone",
  description:
    "A wind-up gramophone: a grained wood cabinet with brass edging, a felt-topped turntable with a grooved record and label, a brass tonearm with sound box and needle, and a flared horn that fades from deep red at the throat to brass at the bell.",
};

const BRASS = "#cfa452";
const FELT = "#7a1f22";
const RUBBER = "#1c1c1c";
const DARK = "#2a1a0c";
const KNOB = "#3a1d0b";

/** Turntable centre on z (x = 0). */
const TT_Z = 0.03;
/** Horn radius along its length: t = 0 at the throat, 1 at the bell. */
const flare = (t: number) => 0.012 * Math.exp(2.7 * t);

export default function gramophone() {
  const b = createBuilder({ name: "gramophone", detail: 1, paintSize: 1024 });

  // Paints: wood grain for the cabinet, a throat-to-bell fade for the horn, and grooves on the record.
  const wood = grain("#8e5226", "#4f2a12", { size: 0.06, axis: "x" });
  const hornPaint = gradient("#7b1d22", BRASS, [0, 0.2, -0.13], [0, 0.56, 0.1]);
  const grooves = paint((p) => (Math.sin(Math.hypot(p.x, p.z - TT_Z) * 900) > 0.3 ? "#1d1d1d" : "#0c0c0c"));

  // Textures: a gold-and-red record label and a gold sunburst for the fret panel.
  const label = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#8e1b22"/>
      <circle cx="50" cy="50" r="43" fill="none" stroke="#e7b75a" stroke-width="2.5"/>
      <path d="M50 12 A38 38 0 0 1 88 50" fill="none" stroke="#e7b75a" stroke-width="4" stroke-linecap="round"/>
      <path d="M50 88 A38 38 0 0 1 12 50" fill="none" stroke="#e7b75a" stroke-width="4" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="9" fill="#e7b75a"/>
      <circle cx="50" cy="50" r="3" fill="#1c1c1c"/>
    </svg>`,
    { size: 256 },
  );
  const sunburst = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">
      <path d="M10 100 A90 90 0 0 1 190 100" fill="none" stroke="#d9a548" stroke-width="3"/>
      <g stroke="#d9a548" stroke-width="2.5" stroke-linecap="round">
        <line x1="100" y1="100" x2="184.6" y2="69.2"/>
        <line x1="100" y1="100" x2="169" y2="42.1"/>
        <line x1="100" y1="100" x2="145" y2="22.1"/>
        <line x1="100" y1="100" x2="115.6" y2="11.4"/>
        <line x1="100" y1="100" x2="84.4" y2="11.4"/>
        <line x1="100" y1="100" x2="55" y2="22.1"/>
        <line x1="100" y1="100" x2="31" y2="42.1"/>
        <line x1="100" y1="100" x2="15.4" y2="69.2"/>
      </g>
      <circle cx="100" cy="100" r="7" fill="#d9a548"/>
    </svg>`,
    { size: 384 },
  );

  // Skeleton: body (root), turntable, horn throat, tonearm pivot, crank.
  b.joint("body", { at: [0, 0.12, 0], dir: [0, 1, 0] });
  b.joint("turntable", { parent: "body", at: [0, 0.246, TT_Z], dir: [0, 1, 0] });
  b.joint("horn", { parent: "body", at: [0, 0.19, -0.13], dir: [0, 1, -0.1] });
  b.joint("tonearm", { parent: "body", at: [0.12, 0.262, -0.12], dir: [0, 1, 0], role: "hinge" });
  b.joint("crank", { parent: "body", at: [-0.19, 0.12, 0.05], dir: [-1, 0, 0], role: "hinge" });

  // Cabinet: grained box, brass edging around the top, brass front pillars, rubber feet.
  b.part(new THREE.BoxGeometry(0.36, 0.2, 0.34), wood, { at: [0, 0.13, 0], bone: "body", name: "cabinet" });
  for (const z of [0.17, -0.17])
    b.part(new THREE.BoxGeometry(0.37, 0.012, 0.012), BRASS, { at: [0, 0.236, z], bone: "body", name: "trim" });
  for (const x of [0.18, -0.18])
    b.part(new THREE.BoxGeometry(0.012, 0.012, 0.34), BRASS, { at: [x, 0.236, 0], bone: "body", name: "trim" });
  for (const x of [0.178, -0.178])
    b.part(new THREE.BoxGeometry(0.014, 0.2, 0.014), BRASS, { at: [x, 0.13, 0.168], bone: "body", name: "pillar" });
  for (const x of [0.15, -0.15])
    for (const z of [0.12, -0.12])
      b.part(new THREE.CylinderGeometry(0.022, 0.024, 0.03, b.segments(14)), RUBBER, {
        at: [x, 0.015, z],
        bone: "body",
        name: "foot",
      });

  // Front fret: a dark panel with a gold sunburst decal and brass screws.
  const fret = b.part(new THREE.BoxGeometry(0.2, 0.1, 0.004), DARK, {
    at: [0, 0.12, 0.172],
    bone: "body",
    name: "fret",
  });
  b.decal(fret, sunburst, { at: [0, 0.115, 0.174], dir: [0, 0, 1], size: [0.17, 0.085], name: "fretDecal" });
  for (const x of [0.093, -0.093])
    for (const y of [0.082, 0.158])
      b.part(new THREE.SphereGeometry(0.0035, b.segments(8), b.segments(6)), BRASS, {
        at: [x, y, 0.176],
        bone: "body",
        name: "screw",
      });

  // Turntable: brass platter, red felt mat, grooved record with a label, and a spindle.
  b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.008, b.segments(40)), BRASS, {
    at: [0, 0.246, TT_Z],
    bone: "turntable",
    name: "platter",
  });
  b.part(new THREE.CylinderGeometry(0.122, 0.122, 0.002, b.segments(40)), FELT, {
    at: [0, 0.251, TT_Z],
    bone: "turntable",
    name: "felt",
  });
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.004, b.segments(48)), grooves, {
    at: [0, 0.254, TT_Z],
    bone: "turntable",
    name: "record",
  });
  b.part(new THREE.CircleGeometry(0.04, b.segments(32)), "#ffffff", {
    at: [0, 0.2566, TT_Z],
    dir: [0, 1, 0],
    axis: "z",
    texture: label,
    bone: "turntable",
    name: "label",
  });
  b.part(new THREE.CylinderGeometry(0.0035, 0.0035, 0.03, b.segments(12)), BRASS, {
    at: [0, 0.262, TT_Z],
    bone: "turntable",
    name: "spindle",
  });
  b.part(new THREE.SphereGeometry(0.006, b.segments(10), b.segments(8)), BRASS, {
    at: [0, 0.278, TT_Z],
    bone: "turntable",
    name: "spindleCap",
  });

  // Tonearm: pivot base, post, a curved brass arm, a sound box and a needle on the record.
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.006, b.segments(20)), BRASS, {
    at: [0.12, 0.245, -0.12],
    bone: "tonearm",
    name: "armBase",
  });
  b.part(new THREE.CylinderGeometry(0.008, 0.009, 0.04, b.segments(14)), BRASS, {
    at: [0.12, 0.262, -0.12],
    bone: "tonearm",
    name: "armPost",
  });
  b.sweep(
    catmull([
      [0.12, 0.28, -0.12],
      [0.112, 0.292, -0.094],
      [0.085, 0.29, -0.062],
      [0.06, 0.281, -0.04],
      [0.05, 0.272, -0.032],
    ]),
    0.0045,
    { color: BRASS, bone: "tonearm", sides: 8, name: "tonearm" },
  );
  b.part(new THREE.CylinderGeometry(0.011, 0.009, 0.02, b.segments(14)), RUBBER, {
    at: [0.05, 0.272, -0.032],
    bone: "tonearm",
    name: "soundBox",
  });
  b.spike([0.05, 0.263, -0.032], [0, -1, 0], 0.0065, 0.0022, {
    color: BRASS,
    bone: "tonearm",
    name: "needle",
  });

  // Horn: a flared sweep from inside the cabinet, up and forward to the bell, with brass collars and a dark mouth.
  const horn = catmull([
    [0, 0.19, -0.13],
    [0, 0.28, -0.14],
    [0, 0.4, -0.1],
    [0, 0.5, 0],
    [0, 0.56, 0.1],
  ]);
  b.sweep(horn, flare, {
    color: hornPaint,
    bone: "horn",
    sides: 16,
    caps: { start: "round", end: "none" },
    name: "horn",
  });
  b.part(new THREE.TorusGeometry(0.022, 0.0045, b.segments(8), b.segments(28)), BRASS, {
    at: [0, 0.242, -0.136],
    dir: [0, 1, 0],
    axis: "z",
    bone: "horn",
    name: "throatCollar",
  });
  b.part(new THREE.TorusGeometry(flare(0.42) + 0.004, 0.0045, b.segments(8), b.segments(28)), BRASS, {
    at: horn.at(0.42),
    dir: horn.tangentAt(0.42),
    axis: "z",
    bone: "horn",
    name: "hornCollar",
  });
  const mouth = horn.at(1);
  const bell = horn.tangentAt(1);
  b.part(new THREE.TorusGeometry(flare(1) + 0.004, 0.007, b.segments(8), b.segments(36)), BRASS, {
    at: mouth,
    dir: bell,
    axis: "z",
    bone: "horn",
    name: "bellRim",
  });
  b.part(new THREE.CircleGeometry(flare(1) - 0.03, b.segments(28)), DARK, {
    at: mouth.clone().addScaledVector(bell, -0.02),
    dir: bell,
    axis: "z",
    bone: "horn",
    name: "bellMouth",
  });

  // Crank on the cabinet's left-hand side (world -X): hub, arm and wooden knob.
  b.part(new THREE.CylinderGeometry(0.017, 0.017, 0.02, b.segments(16)), BRASS, {
    at: [-0.2, 0.12, 0.05],
    dir: [-1, 0, 0],
    bone: "crank",
    name: "crankHub",
  });
  b.rod([-0.21, 0.12, 0.05], [-0.24, 0.1, 0.07], 0.005, { color: BRASS, bone: "crank", name: "crankArm" });
  b.part(new THREE.SphereGeometry(0.012, b.segments(12), b.segments(8)), KNOB, {
    at: [-0.245, 0.097, 0.072],
    bone: "crank",
    name: "crankKnob",
  });

  return b.root;
}
