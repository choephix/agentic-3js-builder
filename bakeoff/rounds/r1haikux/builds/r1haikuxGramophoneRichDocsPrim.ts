import * as THREE from "three";
import {
  catmull,
  createBuilder,
  gradient,
  grain,
  mottle,
  paint,
  polyline,
  svg,
} from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "gramophone",
  description:
    "Antique horn gramophone: a morning-glory brass horn gone verdigris at the lip, a carved walnut cabinet with pale floral inlay, a black 78 with a red label, a silver tonearm, a side crank and claw feet.",
};

// ---- palette ---------------------------------------------------------------
const WALNUT_LIGHT = "#8a5b33";
const WALNUT_DARK = "#3c2515";
const BRASS_HI = "#e6bd6c";
const BRASS = "#c8933b";
const BRASS_DARK = "#8c6a34";
const PATINA = "#6e9c86";
const SILVER = "#cdd3da";
const RECORD = "#1c1c1f";
const GROOVE = "#0d0d0f";
const INTERIOR = "#3a2b15";
const WHITE = "#ffffff";

// ---- surfaces --------------------------------------------------------------
const wood = grain(WALNUT_DARK, WALNUT_LIGHT, { size: 0.03, axis: "x", seed: 3 });
const brassSkin = mottle(BRASS_HI, BRASS, { size: 0.09, contrast: 0.35, seed: 2 });
const patinaSkin = mottle(BRASS, PATINA, { size: 0.08, contrast: 0.6, seed: 9 });

// Concentric record grooves, read from model-space position.
const grooves = (cx: number, cz: number) =>
  paint((p) => (Math.sin(Math.hypot(p.x - cx, p.z - cz) * 560) > 0.2 ? RECORD : GROOVE));

// ---- horn geometry ---------------------------------------------------------
const MOUTH: [number, number, number] = [0, 1.18, 0.24];
const MOUTH_R = 0.27;
const AXIS = new THREE.Vector3(0, 0.43, 0.9).normalize();
const HORN = catmull([
  [0, 0.42, -0.18],
  [0, 0.62, -0.2],
  [0, 0.84, -0.16],
  [0, 0.99, -0.07],
  [0, 1.09, 0.05],
  MOUTH,
]);
const hornSkin = gradient(brassSkin, patinaSkin, HORN.at(0.55), HORN.at(1));

// Two unit vectors spanning the mouth plane.
const SIDE_A = new THREE.Vector3(1, 0, 0);
const SIDE_B = new THREE.Vector3().crossVectors(AXIS, SIDE_A).normalize();
const radial = (deg: number) => {
  const a = THREE.MathUtils.degToRad(deg);
  return SIDE_A.clone().multiplyScalar(Math.cos(a)).addScaledVector(SIDE_B, Math.sin(a));
};
const rimPoint = (deg: number, r: number) =>
  new THREE.Vector3(...MOUTH).addScaledVector(radial(deg), r);

// One scalloped petal of the morning-glory lip (x across the rim, y down the flare).
const LOBE: OutlinePoint[] = [
  [-0.17, -0.03],
  [0.17, -0.03],
  [0.17, 0.02],
  [0.12, 0.06],
  [0.05, 0.09],
  [-0.05, 0.09],
  [-0.12, 0.06],
  [-0.17, 0.02],
];

// Five-lobed printed flower for the cabinet inlay (ivory on walnut).
const blossom = (x: number, y: number) => `
  <g transform="translate(${x} ${y}) scale(0.8)">
    <g fill="#eadcbb">
      <ellipse cx="0" cy="-13" rx="8" ry="13"/>
      <ellipse cx="0" cy="-13" rx="8" ry="13" transform="rotate(72)"/>
      <ellipse cx="0" cy="-13" rx="8" ry="13" transform="rotate(144)"/>
      <ellipse cx="0" cy="-13" rx="8" ry="13" transform="rotate(216)"/>
      <ellipse cx="0" cy="-13" rx="8" ry="13" transform="rotate(288)"/>
    </g>
    <circle r="5" fill="#c7b58a"/>
    <circle r="2" fill="#eadcbb"/>
  </g>`;

const FLORAL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 300">
  <rect x="12" y="12" width="436" height="276" rx="10" fill="none" stroke="#eadcbb" stroke-width="3"/>
  <rect x="24" y="24" width="412" height="252" rx="6" fill="none" stroke="#c7b58a" stroke-width="1.5"/>
  <g fill="none" stroke="#a9b79a" stroke-width="3" stroke-linecap="round">
    <path d="M230 150 C190 120 130 108 74 74"/>
    <path d="M230 150 C270 120 330 108 386 74"/>
    <path d="M230 150 C190 180 130 192 74 226"/>
    <path d="M230 150 C270 180 330 192 386 226"/>
  </g>
  <g fill="#a9b79a">
    <ellipse cx="128" cy="112" rx="18" ry="7" transform="rotate(-24 128 112)"/>
    <ellipse cx="332" cy="112" rx="18" ry="7" transform="rotate(24 332 112)"/>
    <ellipse cx="128" cy="188" rx="18" ry="7" transform="rotate(24 128 188)"/>
    <ellipse cx="332" cy="188" rx="18" ry="7" transform="rotate(-24 332 188)"/>
  </g>
  <g transform="translate(230 150)">
    <g fill="#eadcbb">
      <ellipse cx="0" cy="-30" rx="15" ry="26"/>
      <ellipse cx="0" cy="-30" rx="15" ry="26" transform="rotate(60)"/>
      <ellipse cx="0" cy="-30" rx="15" ry="26" transform="rotate(120)"/>
      <ellipse cx="0" cy="-30" rx="15" ry="26" transform="rotate(180)"/>
      <ellipse cx="0" cy="-30" rx="15" ry="26" transform="rotate(240)"/>
      <ellipse cx="0" cy="-30" rx="15" ry="26" transform="rotate(300)"/>
    </g>
    <circle r="12" fill="#c7b58a"/>
    <circle r="4.5" fill="#eadcbb"/>
  </g>
  ${blossom(74, 74)}
  ${blossom(386, 74)}
  ${blossom(74, 226)}
  ${blossom(386, 226)}
</svg>`,
  { size: 512 },
);

// Brass nameplate on the front.
const PLATE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60">
  <rect width="200" height="60" rx="8" fill="#d9a94e"/>
  <rect x="7" y="7" width="186" height="46" rx="5" fill="none" stroke="#6e4f1f" stroke-width="2.5"/>
  <text x="100" y="41" text-anchor="middle" font-family="Georgia, serif" font-size="27" letter-spacing="4" fill="#3c2612">LARK</text>
</svg>`,
  { size: 256 },
);

// Red 78 label with gold lettering and a centre hole.
const LABEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="49" fill="#a3251f"/>
  <circle cx="50" cy="50" r="42" fill="none" stroke="#e6bd6c" stroke-width="1.6"/>
  <text x="50" y="46" text-anchor="middle" font-family="Georgia, serif" font-size="14" letter-spacing="1" fill="#f3dc9c">LARK</text>
  <text x="50" y="60" text-anchor="middle" font-family="Georgia, serif" font-size="5.5" fill="#f3dc9c">78 RPM</text>
  <circle cx="50" cy="50" r="3" fill="#1c1c1f"/>
</svg>`,
  { size: 256 },
);

// ---- model -----------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "gramophone" });

  // Skeleton: a root for the cabinet, and a hinge for the side crank.
  const base = b.joint("base", { at: [0, 0.12, 0] });
  const crank = b.joint("crank", { parent: base, at: [-0.282, 0.36, 0.1], dir: [-1, 0, 0] });

  // ---- claw feet -----------------------------------------------------------
  const FEET: [number, number][] = [
    [-0.22, -0.18],
    [0.22, -0.18],
    [-0.22, 0.18],
    [0.22, 0.18],
  ];
  for (const [fx, fz] of FEET) {
    b.part(new THREE.CylinderGeometry(0.022, 0.03, 0.05, 10), WALNUT_DARK, { at: [fx, 0.095, fz] });
    b.part(new THREE.SphereGeometry(0.026, 12, 8), BRASS, { at: [fx, 0.044, fz] });
    for (let i = 0; i < 3; i++) {
      const a = THREE.MathUtils.degToRad(i * 120 + 60);
      b.spike(
        [fx + Math.cos(a) * 0.018, 0.03, fz + Math.sin(a) * 0.018],
        [Math.cos(a) * 0.8, -0.6, Math.sin(a) * 0.8],
        0.05,
        0.0085,
        { color: BRASS },
      );
    }
  }

  // ---- walnut cabinet ------------------------------------------------------
  b.part(new THREE.BoxGeometry(0.6, 0.03, 0.5), WALNUT_DARK, { at: [0, 0.135, 0] }); // plinth
  b.part(new THREE.BoxGeometry(0.56, 0.37, 0.46), wood, { at: [0, 0.335, 0] }); // carcass
  b.part(new THREE.BoxGeometry(0.58, 0.03, 0.48), wood, { at: [0, 0.535, 0] }); // top rim

  // Carved front pilasters and a bead moulding under the top rim.
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.035, 0.37, 0.014), WALNUT_DARK, { at: [s * 0.262, 0.335, 0.237] });
  }
  b.along(polyline([[-0.25, 0.512, 0.242], [0.25, 0.512, 0.242]]), 12, (at) => {
    b.part(new THREE.SphereGeometry(0.011, 8, 6), WALNUT_DARK, { at });
  });

  // Pale floral inlay across the front panel, and the brass nameplate.
  b.part(new THREE.PlaneGeometry(0.46, 0.3), WHITE, {
    at: [0, 0.335, 0.2315],
    dir: [0, 0, 1],
    axis: "z",
    texture: FLORAL,
  });
  b.part(new THREE.PlaneGeometry(0.1, 0.03), WHITE, {
    at: [0, 0.165, 0.2345],
    dir: [0, 0, 1],
    axis: "z",
    texture: PLATE,
  });

  // ---- turntable, record and label ----------------------------------------
  b.part(new THREE.CylinderGeometry(0.16, 0.165, 0.02, 40), BRASS_DARK, { at: [0, 0.56, 0.02] }); // platter
  b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.008, 48), grooves(0, 0.02), { at: [0, 0.574, 0.02] }); // 78
  b.part(new THREE.CircleGeometry(0.055, 40), WHITE, {
    at: [0, 0.5792, 0.02],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    texture: LABEL,
  });
  b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.022, 10), SILVER, { at: [0, 0.589, 0.02] }); // spindle

  // ---- horn ----------------------------------------------------------------
  // Throat rising out of the cabinet top, flaring into the bell.
  b.sweep(HORN, (t) => 0.03 + 0.24 * t ** 5, {
    sides: 16,
    color: hornSkin,
    caps: { start: "round", end: "none" },
  });

  // Brass collar where the throat leaves the cabinet.
  b.part(new THREE.TorusGeometry(0.046, 0.008, 8, 20), BRASS_HI, {
    at: [0, 0.555, -0.193],
    dir: [0, 1, 0],
    axis: "z",
  });

  // Dark throat inside the bell, seen through the mouth.
  b.part(new THREE.CircleGeometry(0.135, 20), INTERIOR, {
    at: new THREE.Vector3(...MOUTH).addScaledVector(AXIS, -0.13).toArray(),
    dir: AXIS.toArray(),
    axis: "z",
  });

  // Bright bead around the mouth rim.
  const bead: number[][] = [];
  for (let i = 0; i < 24; i++) bead.push(rimPoint(i * 15, MOUTH_R).toArray());
  b.sweep(catmull(bead, { closed: true }), 0.011, { sides: 8, color: BRASS_HI });

  // Five scalloped petals continuing the flare past the rim.
  const FLARE = THREE.MathUtils.degToRad(50);
  for (let k = 0; k < 5; k++) {
    const deg = -90 + 72 * k;
    const r = radial(deg);
    const tangent = new THREE.Vector3().crossVectors(AXIS, r).normalize();
    const flare = AXIS.clone().multiplyScalar(Math.cos(FLARE)).addScaledVector(r, Math.sin(FLARE));
    b.extrude(LOBE, {
      at: rimPoint(deg, MOUTH_R).toArray(),
      x: tangent.toArray(),
      y: flare.toArray(),
      thickness: 0.012,
      bevel: 0.003,
      smoothing: 2,
      color: hornSkin,
    });
  }

  // ---- silver tonearm and sound box ---------------------------------------
  b.sweep(
    catmull([
      [-0.02, 0.68, -0.19],
      [-0.08, 0.72, -0.13],
      [-0.14, 0.68, -0.03],
      [-0.12, 0.63, 0.03],
      [-0.09, 0.61, 0.06],
    ]),
    [0.01, 0.008],
    { sides: 8, color: SILVER },
  );
  b.part(new THREE.BoxGeometry(0.034, 0.03, 0.05), BRASS_DARK, { at: [-0.09, 0.6, 0.075] });
  b.part(new THREE.CylinderGeometry(0.0022, 0.0022, 0.012, 6), SILVER, { at: [-0.088, 0.584, 0.07] }); // needle

  // ---- side crank ----------------------------------------------------------
  b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.012, 16), BRASS_HI, {
    bone: crank,
    at: [-0.288, 0.36, 0.1],
    dir: [-1, 0, 0],
  });
  b.sweep(
    catmull([
      [-0.29, 0.36, 0.1],
      [-0.335, 0.36, 0.1],
      [-0.36, 0.345, 0.1],
      [-0.37, 0.312, 0.1],
    ]),
    0.008,
    { bone: crank, sides: 8, color: BRASS_HI },
  );
  b.part(new THREE.SphereGeometry(0.02, 12, 8), WALNUT_DARK, { bone: crank, at: [-0.372, 0.298, 0.1] });

  return b.root;
}
