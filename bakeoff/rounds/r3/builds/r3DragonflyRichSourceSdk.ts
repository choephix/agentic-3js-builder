import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  paint,
  stripes,
  countershade,
  mottle,
  scales,
  catmull,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Emperor Dragonfly Over a Pond",
  description:
    "An emperor dragonfly hovering above a small pond: electric-blue abdomen with black dorsal markings, apple-green thorax, wraparound turquoise eyes, four veined golden-tinted wings held flat, six legs tucked under.",
};

// A wing drawn as a cut-out card: a pale golden membrane, a net of dark veins and a dark pterostigma.
function wingSvg(W: number, H: number, rootWidth: number) {
  const outline = `M 3 ${H} L 3 ${H * 0.12} Q 3 0 38 0 Q 82 ${H * 0.02} 88 ${H * 0.3} Q 98 ${H * 0.62} 72 ${H * 0.86} Q ${rootWidth + 20} ${H} ${rootWidth} ${H} Z`;
  let longi = "";
  for (let k = 0; k < 7; k++) {
    const x0 = 3 + (k * (rootWidth - 3)) / 6;
    const xe = 4 + k * 15;
    longi += `<path d="M ${x0} ${H} Q ${(x0 + xe) / 2 + 4} ${H * 0.5} ${xe} -4" fill="none" stroke="#2a2418" stroke-width="${k === 0 ? 3.2 : 1.5}"/>`;
  }
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="#f0c868"/>
      <stop offset="0.5" stop-color="#e6ead0"/>
      <stop offset="1" stop-color="#d3eceb"/>
    </linearGradient>
    <pattern id="net" width="9" height="12" patternUnits="userSpaceOnUse">
      <path d="M 0 6 L 4.5 0 L 9 6 L 4.5 12 Z M 0 6 L 0 6" fill="none" stroke="#3a3020" stroke-width="0.7"/>
    </pattern>
    <clipPath id="c"><path d="${outline}"/></clipPath>
  </defs>
  <path d="${outline}" fill="url(#g)" fill-opacity="0.62"/>
  <g clip-path="url(#c)">
    <rect x="0" y="0" width="${W}" height="${H}" fill="url(#net)" opacity="0.85"/>
    ${longi}
  </g>
  <path d="${outline}" fill="none" stroke="#3a2d18" stroke-width="1.6"/>
  <rect x="3" y="${H * 0.1}" width="7" height="${H * 0.06}" fill="#3b2a10"/>
</svg>`;
}

export default function build() {
  const b = createBuilder({ name: "emperorDragonfly" });
  const random = rng(11);
  const Y0 = 0.32;

  // ---------------- skeleton ----------------
  b.joint("thorax", { at: [0, Y0, 0], dir: [0, 0, 1] });
  b.joint("head", { parent: "thorax", at: [0, 0.325, 0.028], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.3175, 0.044], dir: [0, 0, 1], role: "jaw" });

  const abdPts: [number, number, number][] = [
    [0, 0.318, -0.018],
    [0, 0.317, -0.04],
    [0, 0.314, -0.065],
    [0, 0.311, -0.087],
  ];
  const abdNames = Array.from({ length: 8 }, (_, i) => `abd${i + 1}`);
  const abd = b.chain("abd", catmull(abdPts), { parent: "thorax", role: "tail", count: 8, names: abdNames });

  // ---------------- thorax ----------------
  b.capsule([0, 0.319, -0.012], [0, 0.322, 0.024], 0.0085, {
    color: stripes("#93d63a", "#3f8a22", { size: 0.007, axis: "z", width: 0.28, wobble: 0.3, seed: 3 }),
    bone: "thorax",
    name: "thorax",
  });
  // dark ridge on the back
  b.rod([0, 0.3292, -0.008], [0, 0.3305, 0.016], 0.0013, { color: "#2f6b1a", bone: "thorax" });

  // ---------------- abdomen ----------------
  const rad = (t: number) => {
    const taper = 1 - 0.4 * Math.max(0, (t - 0.9) / 0.1);
    return (0.0036 + 0.0024 * Math.exp(-((t / 0.07) ** 2)) + 0.0014 * Math.exp(-(((t - 0.2) / 0.08) ** 2)) - 0.0007 * t) * taper;
  };
  const abdPaint = paint((_p, _n, s) => {
    const t = s[0];
    const deg = s[1];
    const seg = t * 9.5;
    const f = seg - Math.floor(seg);
    const dors = deg < 30 || deg > 330;
    if (t > 0.94) return "#16161c";
    if (t < 0.09) return "#8fcf3c";
    if (f < 0.07 || f > 0.95) return "#14141c";
    if (dors && f > 0.12 && f < 0.88) return "#101018";
    if ((deg > 70 && deg < 100) || (deg > 260 && deg < 290)) if (f > 0.15 && f < 0.5) return "#1a1a2a";
    return f > 0.5 && f < 0.6 ? "#4a8dff" : "#1565ff";
  });
  b.sweep(abd, rad, { color: abdPaint, name: "abdomen" });
  for (const s of [1, -1])
    b.spike([0.0012 * s, 0.3108, -0.0865], [0.25 * s, 0, -1], 0.009, 0.0009, { color: "#111118", bone: "abd8" });

  // ---------------- head ----------------
  const eyePaint = countershade("#1456d6", "#1fd6c6", { level: 0.15, soft: 0.7 });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0105, 10, 8), eyePaint, {
      at: [0.0072 * s, 0.3285, 0.038],
      bone: "head",
      scale: [1, 0.95, 1.08],
      name: s > 0 ? "eyeL" : "eyeR",
    });
    // antenna
    b.rod([0.002 * s, 0.3325, 0.046], [0.003 * s, 0.3385, 0.055], 0.0003, { color: "#111", bone: "head" });
  }
  b.part(new THREE.SphereGeometry(0.0065, 8, 6), "#c8ee72", { at: [0, 0.3225, 0.0435], bone: "head", scale: [1.35, 0.95, 1] });
  b.part(new THREE.BoxGeometry(0.009, 0.0016, 0.004), "#1b1b22", { at: [0, 0.3300, 0.0475], bone: "head" });
  b.part(new THREE.BoxGeometry(0.006, 0.0022, 0.0035), "#f0f4a8", { at: [0, 0.3185, 0.0492], bone: "head", name: "labrum" });
  b.part(new THREE.SphereGeometry(0.0013, 6, 5), "#ffe45c", { at: [0, 0.3385, 0.0455], bone: "head" });
  b.part(new THREE.BoxGeometry(0.0065, 0.0022, 0.0045), "#2a2a1c", { at: [0, 0.3158, 0.0465], bone: "jaw", name: "mandible" });
  b.part(new THREE.BoxGeometry(0.0085, 0.0016, 0.0045), "#8ab43c", { at: [0, 0.3162, 0.0435], bone: "jaw" });

  // ---------------- legs (tucked under) ----------------
  for (const [sd, s] of [["L", 1], ["R", -1]] as const) {
    for (let i = 0; i < 3; i++) {
      const hz = 0.018 - i * 0.012;
      const leg = b.chain(
        `leg${sd}${i + 1}`,
        [
          [0.004 * s, 0.3135, hz],
          [0.0095 * s, 0.305, hz + 0.009],
          [0.0055 * s, 0.2975, hz + 0.017],
        ],
        { parent: "thorax", role: "leg", names: [`hip${sd}${i + 1}`, `knee${sd}${i + 1}`, `foot${sd}${i + 1}`] },
      );
      b.sweep(leg, [0.0013, 0.0006], { color: i === 1 ? "#2a321c" : "#232a18", name: `leg${sd}${i + 1}` });
    }
  }

  // ---------------- wings ----------------
  const foreTex = svg(wingSvg(100, 360, 46), { size: 512 });
  const hindTex = svg(wingSvg(100, 280, 86), { size: 512 });
  const wings = [
    { n: "F", z: 0.005, y: 0.3232, w: 0.015, len: 0.056, tex: foreTex },
    { n: "H", z: -0.007, y: 0.3222, w: 0.019, len: 0.053, tex: hindTex },
  ];
  for (const [sd, s] of [["L", 1], ["R", -1]] as const) {
    for (const wg of wings) {
      const name = `wing${wg.n}${sd}`;
      b.joint(name, { parent: "thorax", at: [0.006 * s, wg.y, wg.z], dir: [s, 0, 0], up: [0, 1, 0], role: "wing" });
      const yoff = wg.n === "F" ? 0.0008 : -0.0004;
      const root = frame([0.006 * s, wg.y + yoff + 0.0006, wg.z], [0, 1, 0]);
      b.cards([root], wg.tex, {
        size: [wg.w, wg.len],
        lean: 90,
        flow: [s, 0, 0],
        sink: 0,
        bone: name,
        mirror: s < 0,
        name: `${name}Blade`,
      });
      // leading-edge spar
      const lead = wg.z + wg.w / 2 - 0.0004;
      b.rod([0.005 * s, wg.y + yoff + 0.0006, lead], [(0.006 + wg.len) * s, wg.y + yoff + 0.0006, lead], [0.0008, 0.0004], {
        color: "#3a2c18",
        bone: name,
      });
    }
  }

  // ---------------- pond ----------------
  b.lathe(
    [[0, 0], [0.3, 0], [0.3, -0.004], [0, -0.004]],
    { color: mottle("#17505f", "#2c8b86", { size: 0.06, seed: 4 }), at: [0, 0, 0], bone: "thorax", segments: 28, name: "water" },
  );
  b.lathe(
    [[0.28, -0.004], [0.34, -0.004], [0.34, 0.012], [0.28, 0.012]],
    { color: scales(["#7a6a55", "#8f7e66", "#6c5d4a"], "#40362a", { size: 0.035, seed: 2 }), at: [0, 0, 0], bone: "thorax", segments: 20, name: "bank" },
  );
  const pads: [number, number, number][] = [[-0.12, -0.08, 0.05], [0.1, 0.12, 0.04], [0.14, -0.14, 0.035]];
  for (const [x, z, r] of pads) {
    b.part(new THREE.CylinderGeometry(r, r, 0.004, 10), "#3f8f3c", { at: [x, 0.002, z], bone: "thorax", name: "lilyPad" });
  }
  b.part(new THREE.ConeGeometry(0.012, 0.03, 6), "#f08ab8", { at: [-0.12, 0.019, -0.08], bone: "thorax", name: "lotusBud" });
  b.part(new THREE.SphereGeometry(0.01, 6, 5), "#f7b3d0", { at: [-0.12, 0.034, -0.08], bone: "thorax" });
  for (let i = 0; i < 7; i++) {
    const a = 2.2 + random() * 1.6;
    const rr = 0.27;
    const x = Math.cos(a) * rr;
    const z = Math.sin(a) * rr;
    b.rod([x, 0.005, z], [x + (random() - 0.5) * 0.04, 0.16 + random() * 0.12, z + (random() - 0.5) * 0.04], [0.004, 0.0015], {
      color: "#5f9440",
      bone: "thorax",
      name: "reed",
    });
  }

  return b.root;
}
