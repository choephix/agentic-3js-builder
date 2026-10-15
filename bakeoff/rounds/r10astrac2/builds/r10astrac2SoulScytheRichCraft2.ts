import * as THREE from "three";
import {
  createBuilder, rng, svg, paint, mix, noise, grain,
  catmull, bezier, spiral,
} from "../../../../src/index";
import type { Paint } from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gravetide — Dragonbone Soul Scythe",
  description:
    "A monumental dragonbone scythe: sculpted fossil ribs, a razor-edged soulsteel crescent, a horned skull and a chained spirit reliquary above a restrained summoning dais.",
};

/*
Revision:
1. Preserve the successful crescent, skull, tapered edge and intentional motes.
2. Replace flat nail-like blade ribs with curved, tapered fossil ribs.
3. Give ivory warmer light planes and violet-grey recesses; add fine fossil
   fractures and horn growth rings instead of increasing surface noise.
4. Sculpt the lower jaw and reinforce the fangs and sockets.
5. Replace the solid basal magic tubes with thin, twisting spectral ribbons.
6. Reduce the dais and its brightness so the weapon remains the focal point.
*/
export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Gravetide", paintSize: 2048 });
  const root = b.joint("weaponRoot", { at: [0, 0, 0] });
  const random = rng(419);
  type Fill = string | Paint;

  const C = {
    ink: "#111724",
    dark: "#222638",
    steel: "#344859",
    ivory: "#fff0bf",
    boneDark: "#766b66",
    gold: "#caa05b",
    violet: "#442c59",
    purple: "#71517e",
    teal: "#15bda9",
    cyan: "#7affdf",
  };

  const bone = paint((p, n) => {
    const light = Math.max(0, Math.min(1,
      0.60 + n.y * 0.30 + Math.abs(n.z) * 0.16));
    const ivory = mix("#777186", "#ffe8b0", light);
    return mix(ivory, "#a88d70",
      Math.max(0, noise(p, 0.16, 31) - 0.57) * 0.38);
  });
  const boneHighlight = paint((_p, n) =>
    mix("#b8a293", "#fff3d3", 0.72 + n.y * 0.23));
  const hornPaint = paint((p, n) => {
    const light = 0.60 + n.y * 0.24 + Math.abs(n.z) * 0.14;
    const tip = Math.max(0, Math.min(1, (p.y - 2.70) / 0.18));
    return mix(mix("#73677c", "#f9dfaa", light), "#514352", tip * 0.65);
  });
  const gold = metal("brass", {
    tarnish: 0.20, verdigris: 0.08, polish: 0.4, size: 0.15,
  });
  const bladeMetal = paint((p, n) =>
    mix("#101c30", "#345369",
      0.12 + Math.max(0, n.y) * 0.22 +
      Math.abs(n.z) * 0.25 + noise(p, 0.32, 12) * 0.14));
  const bevelMetal = paint((p, n) =>
    mix("#286477", "#78b6b6",
      0.25 + Math.max(0, n.y) * 0.35 + noise(p, 0.28, 19) * 0.20));
  const wood = grain("#171526", "#454054", {
    size: 0.017, axis: "y", seed: 9,
  });
  const leather = paint((p, n) =>
    mix("#2b203e", "#76557e",
      noise(p, 0.026, 5) * 0.55 + Math.max(0, n.y) * 0.15));
  const stone = paint((p, n) =>
    mix("#1c2230", "#4e5260",
      noise(p, 0.2, 16) * 0.5 + Math.max(0, n.y) * 0.3));

  const eyeTexture = svg(`
    <svg viewBox="0 0 160 96">
      <path d="M7 55 L48 18 L150 12 L118 73 L45 86 Z" fill="#092b37"/>
      <path d="M18 54 L55 31 L139 22 L111 62 L47 73 Z" fill="#18aa9c"/>
      <path d="M32 53 L66 37 L126 30 L103 55 L53 63 Z" fill="#83ffe0"/>
      <path d="M83 32 L91 40 L79 65 L73 52 Z" fill="#effff3"/>
      <path d="M35 53 L65 41" fill="none" stroke="#dcfff2" stroke-width="4"/>
    </svg>`, { size: 256 });

  const runesTexture = svg(`
    <svg viewBox="0 0 96 320">
      <g fill="none" stroke="#123e48" stroke-width="13" stroke-linejoin="miter">
        <path d="M48 15 V68 M24 30 L48 48 L73 28 M28 74 L48 88 L68 74"/>
        <path d="M48 110 L23 138 L48 165 L73 138 Z M48 119 V154"/>
        <path d="M24 196 L48 178 L72 196 L48 214 V244 M25 225 L48 239 L71 225"/>
        <path d="M48 264 V306 M24 278 L48 291 L72 278"/>
      </g>
      <g fill="none" stroke="#75f4d2" stroke-width="6">
        <path d="M48 15 V68 M24 30 L48 48 L73 28 M28 74 L48 88 L68 74"/>
        <path d="M48 110 L23 138 L48 165 L73 138 Z M48 119 V154"/>
        <path d="M24 196 L48 178 L72 196 L48 214 V244 M25 225 L48 239 L71 225"/>
        <path d="M48 264 V306 M24 278 L48 291 L72 278"/>
      </g>
    </svg>`, { size: 512 });

  const cracksTexture = svg(`
    <svg viewBox="0 0 180 120">
      <g fill="none" stroke="#665b69" stroke-width="3.2">
        <path d="M12 9 L39 30 L34 49 L60 63 L68 95 L82 117 M36 45 L16 58
                 M61 64 L88 50 L105 55"/>
        <path d="M150 0 L139 27 L150 43 L124 67 L129 89 M140 27 L116 21"/>
      </g>
      <g fill="none" stroke="#fff0c3" stroke-width="2">
        <path d="M15 8 L42 29 L37 48 L63 62 L71 94"/>
        <path d="M153 0 L142 27 L153 43 L127 67"/>
      </g>
    </svg>`, { size: 256 });

  const soulTexture = svg(`
    <svg viewBox="0 0 120 160">
      <path d="M61 7 C88 30 103 48 95 79 C90 101 68 115 73 145 L49 131 L34 153
               C37 122 15 103 20 75 C25 40 50 33 61 7Z" fill="#087b80"/>
      <path d="M61 20 C81 48 88 56 81 83 C75 105 52 115 52 132
               C47 106 33 98 35 75 C37 49 53 41 61 20Z" fill="#75ffe0"/>
      <path d="M40 63 L57 73 L54 91 L40 81 Z
               M79 61 L63 74 L65 91 L80 77Z" fill="#102d42"/>
      <path d="M55 98 L61 89 L67 98 L65 114 L60 107 L54 115Z" fill="#102d42"/>
      <path d="M50 43 Q59 33 62 29" fill="none" stroke="#e3fff0" stroke-width="5"/>
    </svg>`, { size: 256 });

  const bindingTexture = svg(`
    <svg viewBox="0 0 256 64">
      <rect width="256" height="64" fill="#3d2b50"/>
      <path d="M0 9 H256 M0 55 H256" stroke="#a27e88" stroke-width="3"/>
      <path d="M0 32 L32 14 L64 32 L96 14 L128 32 L160 14 L192 32 L224 14 L256 32
               M0 32 L32 50 L64 32 L96 50 L128 32 L160 50 L192 32 L224 50 L256 32"
            fill="none" stroke="#c9a365" stroke-width="3"/>
      <g fill="#80cbb8">
        <path d="M27 32 L32 25 L37 32 L32 39Z"/>
        <path d="M91 32 L96 25 L101 32 L96 39Z"/>
        <path d="M155 32 L160 25 L165 32 L160 39Z"/>
        <path d="M219 32 L224 25 L229 32 L224 39Z"/>
      </g>
    </svg>`, { size: 512 });

  const sealTexture = svg(`
    <svg viewBox="0 0 256 256">
      <g fill="none" stroke="#286367" stroke-width="3">
        <circle cx="128" cy="128" r="116"/><circle cx="128" cy="128" r="104"/>
        <path d="M128 25 L217 179 L39 179 Z M128 231 L39 77 L217 77Z"/>
        <circle cx="128" cy="128" r="58"/>
      </g>
      <g stroke="#59988b" stroke-width="4">
        <path d="M128 14 V31 M128 225 V242 M14 128 H31 M225 128 H242
                 M47 47 L60 60 M196 196 L209 209 M47 209 L60 196 M196 60 L209 47"/>
      </g>
      <path d="M128 77 L149 115 L139 143 L128 165 L117 143 L107 115Z"
            fill="none" stroke="#4d8c80" stroke-width="4"/>
    </svg>`, { size: 512 });

  const fossilTexture = svg(`
    <svg viewBox="0 0 280 100">
      <g fill="none" stroke="#9d8b80" stroke-width="3">
        <path d="M5 61 Q73 12 139 36 T275 29"/>
        <path d="M12 72 Q77 28 140 47 T269 41"/>
        <path d="M19 82 Q83 43 143 58 T257 54"/>
        <path d="M65 18 L78 40 L72 54 L88 75 M78 40 L101 34"/>
        <path d="M215 18 L204 37 L212 52 L199 77"/>
      </g>
      <g fill="none" stroke="#fff0ca" stroke-width="2.5">
        <path d="M7 57 Q73 8 139 32 T275 25"/>
        <path d="M17 78 Q83 39 143 54 T257 50"/>
      </g>
    </svg>`, { size: 512 });

  function box(at: number[], size: number[], color: Fill, rotation = [0, 0, 0]) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at, rotation, bone: root,
    });
  }
  function ellipsoid(at: number[], scale: number[], color: Fill, segments = 10) {
    return b.part(new THREE.SphereGeometry(1, segments, 6), color, {
      at, scale, bone: root, flat: true,
    });
  }
  function plate(
    points: number[][], z: number, thickness: number, color: Fill,
    name: string, bevel = 0,
  ) {
    return b.extrude(points, {
      at: [0, 0, z], x: [1, 0, 0], y: [0, 1, 0],
      thickness, bevel, color, bone: root, name,
    });
  }
  function tube(
    points: number[][], radius: number | number[], color: Fill, name?: string,
  ) {
    return b.sweep(catmull(points), radius, {
      color, bone: root, sides: 6, smooth: false, name,
    });
  }
  function disk(
    at: number[], radius: number, depth: number, color: Fill,
    dir = [0, 0, 1],
  ) {
    return b.part(new THREE.CylinderGeometry(radius, radius, depth, 12), color, {
      at, dir, bone: root,
    });
  }
  function ring(
    at: number[], radius: number, thickness: number, color: Fill,
    rotation = [0, 0, 0],
  ) {
    return b.part(new THREE.TorusGeometry(radius, thickness, 5, 12), color, {
      at, rotation, bone: root,
    });
  }
  function drawing(
    texture: THREE.Texture, at: number[], size: number[],
    rotation = [0, 0, 0], lit = false,
  ) {
    const p = b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
      at, rotation, texture, bone: root,
    });
    if (lit) glow(p, 0.8);
    return p;
  }
  function rivet(at: number[], radius = 0.012) {
    return ellipsoid(at, [radius, radius, radius * 0.65], gold, 6);
  }

  // One thickness field makes all blade layers converge at the cutting edge.
  const cuttingContour = [
    [-1.63, 1.22], [-1.46, 1.67], [-1.20, 1.98],
    [-0.88, 2.18], [-0.49, 2.28], [-0.18, 2.23], [0.09, 2.13],
  ];
  function edgeDistance(x: number, y: number) {
    let closest = Infinity;
    for (let i = 0; i < cuttingContour.length - 1; i++) {
      const a = cuttingContour[i], c = cuttingContour[i + 1];
      const dx = c[0] - a[0], dy = c[1] - a[1];
      const t = Math.max(0, Math.min(1,
        ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy)));
      closest = Math.min(closest,
        Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy));
    }
    return closest;
  }
  function bladeThicknessFactor(x: number, y: number) {
    const tip = Math.max(0, Math.min(1, (y - 1.22) / 0.55));
    return tip * (0.07 + 0.93 * Math.min(1, edgeDistance(x, y) / 0.085));
  }
  function bladePlate(
    points: number[][], z: number, thickness: number, color: Fill, name: string,
  ) {
    const shape = new THREE.Shape();
    shape.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1]);
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: thickness, bevelEnabled: false, curveSegments: 1, steps: 1,
    });
    const positions = geometry.getAttribute("position");
    for (let i = 0; i < positions.count; i++) {
      positions.setZ(i,
        (z + positions.getZ(i) - thickness / 2) *
        bladeThicknessFactor(positions.getX(i), positions.getY(i)));
    }
    geometry.clearGroups();
    geometry.computeVertexNormals();
    return b.part(geometry, color, {
      at: [0, 0, 0], bone: root, name, flat: true,
    });
  }

  // A smaller, darker display stage leaves the silhouette to the weapon.
  const BASE = 0.86;
  disk([0, 0.045, 0], 0.74 * BASE, 0.09, C.ink, [0, 1, 0]);
  disk([0, 0.097, 0], 0.69 * BASE, 0.07, stone, [0, 1, 0]);
  ring([0, 0.131, 0], 0.64 * BASE, 0.006, "#287571", [90, 0, 0]);
  drawing(sealTexture, [0, 0.136, 0],
    [1.18 * BASE, 1.18 * BASE], [-90, 0, 0]);

  for (let i = 0; i < 14; i++) {
    const a = i / 14 * Math.PI * 2;
    const h = 0.065 + random() * 0.04;
    box([Math.sin(a) * 0.66 * BASE, 0.08 + h / 2, Math.cos(a) * 0.66 * BASE],
      [0.17 * BASE, h, 0.12 * BASE], stone, [0, a * 180 / Math.PI, 0]);
    if (i % 2 === 0)
      ellipsoid([Math.sin(a) * 0.7 * BASE, 0.145, Math.cos(a) * 0.7 * BASE],
        [0.06, 0.035, 0.047], C.steel, 5);
  }
  for (let i = 0; i < 7; i++) {
    const a = 1.9 + i * 0.37;
    const x = Math.sin(a) * 0.46 * BASE;
    const z = Math.cos(a) * 0.46 * BASE;
    const h = 0.11 + random() * 0.12;
    b.part(new THREE.ConeGeometry(0.06, h, 5), stone, {
      at: [x, 0.13 + h / 2, z], rotation: [12, i * 38, -15], bone: root,
    });
    tube([[x, 0.14, z + 0.04],
      [x + 0.012, 0.17 + h * 0.3, z + 0.045],
      [x, 0.14 + h * 0.7, z + 0.025]], 0.003, "#287571");
  }

  // Blackwood, purple bindings, ivory heel.
  tube([[0.16, 0.29, 0], [0.19, 0.95, 0],
    [0.17, 1.6, 0], [0.11, 2.4, 0]],
  [0.04, 0.047, 0.045, 0.061], wood, "blackwoodHaft");
  b.lathe([[0, 0], [0.015, 0.015], [0.061, 0.16],
    [0.056, 0.2], [0, 0.2]], {
    at: [0.16, 0.137, 0], segments: 8, color: bone,
    bone: root, name: "heelSpike",
  });
  disk([0.16, 0.325, 0], 0.062, 0.034, gold, [0, 1, 0]);
  ellipsoid([0.16, 0.31, 0.057], [0.023, 0.039, 0.016], C.teal, 6);

  for (const [bottom, top, x] of [[0.4, 0.92, 0.18], [1.69, 2.04, 0.145]]) {
    b.rod([x, bottom, 0], [x, top, 0], 0.057, {
      color: leather, sides: 10, bone: root,
    });
    b.sweep(spiral([x, bottom, 0], [x + 0.058, bottom, 0], [0, 1, 0], {
      turns: (top - bottom) / 0.052, pitch: 0.052,
    }), 0.005, { color: C.purple, sides: 5, bone: root });
    for (const y of [bottom, top]) {
      disk([x, y, 0], 0.066, 0.029, gold, [0, 1, 0]);
      disk([x, y + 0.019, 0], 0.059, 0.009, C.ink, [0, 1, 0]);
      for (const s of [-1, 1]) rivet([x + s * 0.039, y, 0.052], 0.009);
    }
    for (const side of [-1, 1]) {
      drawing(bindingTexture, [x, bottom + 0.07, side * 0.059],
        [0.107, 0.035], [0, side < 0 ? 180 : 0, 0]);
      drawing(bindingTexture, [x, top - 0.07, side * 0.059],
        [0.107, 0.035], [0, side < 0 ? 180 : 0, 0]);
    }
  }

  // Eight vertebrae: central keels, paired processes and a dorsal ridge.
  for (let i = 0; i < 8; i++) {
    const y = 1.005 + i * 0.083;
    const x = 0.185 - i * 0.003;
    disk([x, y, 0], 0.064, 0.039, C.boneDark, [0, 1, 0]);
    ellipsoid([x, y + 0.008, 0], [0.087, 0.035, 0.074], bone, 8);
    plate([[x - 0.031, y + 0.027], [x + 0.031, y + 0.027],
      [x + 0.025, y - 0.018], [x, y - 0.048], [x - 0.025, y - 0.018]],
    0.065, 0.025, bone, `vertebralKeel${i}`, 0.003);
    glow(ellipsoid([x, y + 0.005, 0.084],
      [0.008, 0.015, 0.005], C.teal, 6), 0.7);
    plate([[x - 0.023, y + 0.025], [x + 0.023, y + 0.025],
      [x + 0.018, y - 0.014], [x, y - 0.036], [x - 0.018, y - 0.014]],
    -0.066, 0.024, bone, `dorsalKeel${i}`, 0.003);
    for (const side of [-1, 1]) {
      b.sweep(bezier(
        [x + side * 0.055, y, -0.012],
        [x + side * 0.125, y - 0.01, -0.02],
        [x + side * 0.115, y - 0.064, -0.015],
      ), [0.024, 0], { color: bone, sides: 6, bone: root });
    }
  }

  const outerBlade = [
    [0.20, 2.34], [0.02, 2.57], [-0.33, 2.75], [-0.76, 2.77],
    [-1.13, 2.59], [-1.43, 2.27], [-1.61, 1.86], [-1.66, 1.46],
    [-1.63, 1.22], [-1.46, 1.67], [-1.20, 1.98], [-0.88, 2.18],
    [-0.49, 2.28], [-0.18, 2.23], [0.09, 2.13],
  ];
  const fossilCrescent = bladePlate(outerBlade, 0, 0.13, bone, "fossilCrescent");
  const innerBlade = [
    [-0.18, 2.49], [-0.50, 2.62], [-0.81, 2.60], [-1.12, 2.43],
    [-1.37, 2.12], [-1.52, 1.79], [-1.63, 1.22], [-1.46, 1.67],
    [-1.20, 1.98], [-0.88, 2.18], [-0.49, 2.28], [-0.18, 2.23],
  ];
  const cuttingBevel = [
    [-0.18, 2.30], [-0.49, 2.355], [-0.905, 2.255],
    [-1.25, 2.055], [-1.505, 1.72], [-1.63, 1.22],
    [-1.46, 1.67], [-1.20, 1.98], [-0.88, 2.18],
    [-0.49, 2.28], [-0.18, 2.23],
  ];
  const luminousEdge = [
    [-0.18, 2.243], [-0.49, 2.295], [-0.886, 2.196],
    [-1.216, 1.997], [-1.476, 1.684], [-1.63, 1.22],
    [-1.46, 1.67], [-1.20, 1.98], [-0.88, 2.18],
    [-0.49, 2.28], [-0.18, 2.23],
  ];

  for (const side of [-1, 1]) {
    bladePlate(innerBlade, side * 0.071, 0.022,
      bladeMetal, `soulsteelFace${side}`);
    bladePlate(cuttingBevel, side * 0.086, 0.006,
      bevelMetal, `honedBevel${side}`);
    glow(bladePlate(luminousEdge, side * 0.092, 0.005,
      C.cyan, `spectralEdge${side}`), 1.1);
    tube([[-0.18, 2.51, side * 0.093], [-0.53, 2.66, side * 0.093],
      [-0.88, 2.61, side * 0.093], [-1.18, 2.42, side * 0.093],
      [-1.40, 2.1, side * 0.088]], 0.007, gold, "bladeInlay");
    tube([[-0.30, 2.733, side * 0.066], [-0.51, 2.753, side * 0.067],
      [-0.72, 2.748, side * 0.067]],
    [0.005, 0.009, 0.003], boneHighlight);
    tube([[-0.81, 2.72, side * 0.067], [-0.96, 2.655, side * 0.067],
      [-1.10, 2.578, side * 0.067]],
    [0.004, 0.008, 0.002], boneHighlight);

    for (const [x, y, angle, w, h] of [
      [-0.53, 2.705, 0, 0.28, 0.075],
      [-0.98, 2.603, 29, 0.22, 0.07],
      [-1.405, 2.20, 63, 0.24, 0.07],
    ]) {
      b.decal(fossilCrescent, fossilTexture, {
        at: [x, y, side * 0.07], dir: [0, 0, side],
        size: [w, h], roll: side * angle, lift: 0.0015,
        bone: root, name: `fossilGrowth${side}_${x}`,
      });
    }
  }

  // Organic, swept ribs rather than planar strips.
  const ribs = [
    [-0.39, 2.71, -0.42, 2.40],
    [-0.62, 2.72, -0.65, 2.39],
    [-0.86, 2.64, -0.83, 2.35],
    [-1.07, 2.53, -1.00, 2.25],
    [-1.26, 2.35, -1.15, 2.12],
    [-1.41, 2.12, -1.29, 1.94],
  ];
  ribs.forEach(([ax, ay, bx, by], i) => {
    const dx = bx - ax, dy = by - ay;
    const length = Math.hypot(dx, dy);
    const nx = -dy / length, ny = dx / length;
    const w = 0.034 - i * 0.002;
    for (const side of [-1, 1]) {
      const ribPath = catmull([
        [ax, ay, side * 0.074],
        [ax + dx * 0.24 + nx * 0.014,
          ay + dy * 0.24 + ny * 0.014, side * 0.116],
        [ax + dx * 0.67 + nx * 0.009,
          ay + dy * 0.67 + ny * 0.009, side * 0.113],
        [bx + dx * 0.07, by + dy * 0.07, side * 0.084],
      ]);
      const rib = b.sweep(ribPath, [w, w * 0.83, w * 0.49, 0.002], {
        color: bone, sides: 5, smooth: false, bone: root,
        name: `curvedFossilRib${i}_${side}`,
      });
      rivet([ax, ay, side * 0.111], 0.012);
      b.decal(rib, cracksTexture, {
        at: [ax + dx * 0.42, ay + dy * 0.42, side * 0.15],
        dir: [0, 0, side], size: [w * 1.3, 0.1],
        lift: 0.0016, bone: root,
      });
    }
  });

  for (const [x, y, rotation, h] of [
    [-0.54, 2.465, 8, 0.205], [-0.78, 2.43, -14, 0.195],
    [-1.00, 2.32, -31, 0.19], [-1.20, 2.15, -42, 0.175],
    [-1.38, 1.93, -25, 0.14],
  ]) {
    drawing(runesTexture, [x, y, 0.089],
      [0.067, h], [0, 0, rotation], true);
    drawing(runesTexture, [x, y, -0.089],
      [0.067, h], [0, 180, -rotation], true);
  }

  // Fossil serrations taper in three dimensions.
  for (const [x, y, dx, dy] of [
    [-0.31, 2.73, -0.03, 0.15], [-0.60, 2.77, -0.06, 0.14],
    [-0.92, 2.69, -0.10, 0.13], [-1.18, 2.51, -0.13, 0.09],
    [-1.43, 2.24, -0.14, 0.04],
  ]) {
    const spur = new THREE.Shape();
    spur.moveTo(x + 0.045, y - 0.04);
    spur.lineTo(x + dx, y + dy);
    spur.lineTo(x - 0.065, y - 0.06);
    spur.closePath();
    const g = new THREE.ExtrudeGeometry(spur, {
      depth: 0.09, bevelEnabled: false,
    });
    const p = g.getAttribute("position");
    for (let k = 0; k < p.count; k++) {
      const distance = Math.hypot(p.getX(k) - x - dx, p.getY(k) - y - dy);
      p.setZ(k, (p.getZ(k) - 0.045) * Math.min(1, distance / 0.12));
    }
    g.clearGroups();
    g.computeVertexNormals();
    b.part(g, bone, {
      at: [0, 0, 0], bone: root, name: "fossilSpur", flat: true,
    });
  }

  // A trophy skull rather than a living creature.
  const cranium = ellipsoid([0.065, 2.405, 0],
    [0.235, 0.212, 0.17], bone, 10);
  const nasalBridge = ellipsoid([-0.15, 2.345, 0],
    [0.195, 0.118, 0.139], bone, 8);
  const muzzle = plate([
    [-0.08, 2.43], [-0.25, 2.39], [-0.44, 2.31], [-0.47, 2.25],
    [-0.39, 2.22], [-0.17, 2.245], [0.03, 2.30],
  ], 0, 0.255, bone, "upperDragonMuzzle", 0.009);

  const lowerJaw = plate([
    [0.18, 2.32], [0.23, 2.20], [0.13, 2.11], [-0.04, 2.075],
    [-0.24, 2.07], [-0.37, 2.115], [-0.43, 2.16], [-0.42, 2.185],
    [-0.34, 2.148], [-0.19, 2.13], [0.035, 2.16], [0.10, 2.30],
  ], 0, 0.17, bone, "lowerDragonJaw", 0.012);

  for (const side of [-1, 1]) {
    plate([
      [-0.17, 2.43], [-0.035, 2.505], [0.15, 2.47],
      [0.09, 2.355], [-0.08, 2.34], [-0.185, 2.37],
    ], side * 0.165, 0.021, C.ink, `eyeSocket${side}`);
    drawing(eyeTexture, [-0.015, 2.418, side * 0.179],
      [0.27, 0.136], [0, side < 0 ? 180 : 0, 0], true);
    plate([
      [-0.205, 2.43], [-0.06, 2.54], [0.20, 2.51],
      [0.135, 2.455], [-0.035, 2.46],
    ], side * 0.184, 0.047, bone, "heavyDragonBrow", 0.004);
    tube([[-0.19, 2.435, side * 0.211], [-0.057, 2.523, side * 0.211],
      [0.16, 2.503, side * 0.211]],
    [0.002, 0.006, 0.002], boneHighlight);
    plate([
      [0.135, 2.45], [0.31, 2.41], [0.38, 2.27], [0.19, 2.31],
      [0.11, 2.18], [0.035, 2.23],
    ], side * 0.148, 0.045, bone, "cheekFlare", 0.005);
    ellipsoid([-0.356, 2.299, side * 0.135],
      [0.046, 0.022, 0.008], C.ink, 6);
    tube([[-0.42, 2.26, side * 0.135], [-0.30, 2.257, side * 0.143],
      [-0.18, 2.278, side * 0.147]], 0.005, C.boneDark);
    disk([0.12, 2.22, side * 0.14], 0.054, 0.028, gold, [0, 0, side]);
    disk([0.12, 2.22, side * 0.159], 0.033, 0.018, C.ink, [0, 0, side]);
    glow(ellipsoid([0.12, 2.22, side * 0.173],
      [0.018, 0.025, 0.012], C.teal, 6), 1);

    for (let i = 0; i < 5; i++) {
      const x = -0.355 + i * 0.065, y = 2.239 + i * 0.004;
      if (i === 0) {
        b.sweep(bezier([x, y, side * 0.093],
          [x - 0.004, y - 0.063, side * 0.104],
          [x + 0.026, y - 0.092, side * 0.098]),
        [0.023, 0], { color: boneHighlight, sides: 5, bone: root });
      } else {
        b.spike([x, y, side * 0.093],
          [x + 0.013, y - 0.057, side * 0.10], null, 0.015,
          { color: boneHighlight, sides: 5, bone: root });
      }
      if (i < 4)
        b.spike([x + 0.03, 2.126, side * 0.065],
          [x + 0.024, 2.158, side * 0.069], null, 0.012,
          { color: C.ivory, sides: 5, bone: root });
    }

    b.decal([cranium, nasalBridge], cracksTexture, {
      at: [0.04, 2.555, side * 0.14], dir: [0, 0, side],
      size: [0.12, 0.09], lift: 0.0018, bone: root,
      name: `foreheadFractures${side}`,
    });
    b.decal(muzzle, cracksTexture, {
      at: [-0.28, 2.32, side * 0.13], dir: [0, 0, side],
      size: [0.14, 0.075], lift: 0.0018, bone: root,
      name: `muzzleFractures${side}`,
    });
    b.decal(lowerJaw, fossilTexture, {
      at: [-0.16, 2.106, side * 0.09], dir: [0, 0, side],
      size: [0.23, 0.039], lift: 0.0018, bone: root,
      name: `mandibleGrowth${side}`,
    });
  }

  for (const side of [-1, 1]) {
    const z = side * 0.095;
    const hornPath = catmull([
      [0.14, 2.52, z], [0.30, 2.63, z * 1.35],
      [0.45, 2.80, z * 1.5], [0.56, 2.88, z * 1.55],
    ]);
    const horn = b.sweep(hornPath, [0.074, 0.058, 0.026, 0], {
      color: hornPaint, sides: 6, smooth: false,
      bone: root, name: `crownHorn${side}`,
    });
    const skin = b.surface(horn);
    for (let j = 0; j < 3; j++) {
      const hit = skin.nearest([0.23 + j * 0.06, 2.59 + j * 0.06, side * 0.3]);
      b.stick(new THREE.CylinderGeometry(0.014, 0.018, 0.008, 6), gold, hit);
    }
    // Broken growth rings hug the actual horn instead of floating around it.
    for (const t of [0.25, 0.40, 0.55, 0.70]) {
      const section = skin.loop(hornPath.at(t), {
        dir: hornPath.tangentAt(t), lift: 0.0006,
      });
      b.sweep(section.slice(0.08, 0.84), 0.0026, {
        color: "#8b7980", sides: 4, bone: root,
        name: `hornGrowthRing${side}_${t}`,
      });
    }
    tube([[0.22, 2.40, z], [0.43, 2.43, z * 1.6],
      [0.65, 2.57, z * 1.8]],
    [0.053, 0.037, 0], hornPaint, "templeHorn");
  }

  plate([[0.015, 2.54], [0.095, 2.73], [0.18, 2.59], [0.16, 2.49]],
    0, 0.12, gold, "crownSocket");
  glow(ellipsoid([0.099, 2.619, 0.063],
    [0.026, 0.057, 0.018], C.teal, 6), 0.9);

  for (const side of [-1, 1]) {
    tube([[0.17 + side * 0.06, 2.025, 0],
      [0.19 + side * 0.10, 2.13, 0.025],
      [0.14 + side * 0.13, 2.24, 0.06]],
    [0.026, 0.034, 0.012], gold, "socketTalon");
    rivet([0.17 + side * 0.058, 2.055, 0.054], 0.014);
  }
  plate([[0.105, 2.075], [0.19, 2.075], [0.205, 2.14],
    [0.15, 2.195], [0.095, 2.14]], 0.063, 0.018, gold, "socketEscutcheon");
  plate([[0.123, 2.095], [0.175, 2.095], [0.183, 2.137],
    [0.15, 2.169], [0.117, 2.137]], 0.075, 0.009, C.violet, "socketEnamel");
  drawing(runesTexture, [0.15, 2.131, 0.082],
    [0.032, 0.06], [0, 0, 0], true);

  // Linked suspension and six-sided spirit cage.
  tube([[0.29, 2.25, 0], [0.39, 2.18, 0], [0.48, 2.10, 0]], 0.008, gold);
  for (let i = 0; i < 5; i++)
    ring([0.48, 2.095 - i * 0.029, 0], 0.021, 0.005, gold,
      i % 2 ? [0, 90, 0] : [0, 0, 0]);

  const lanternX = 0.48, lanternY = 1.79;
  ring([lanternX, lanternY + 0.15, 0], 0.038, 0.009, gold);
  b.lathe([[0, 0], [0.075, 0], [0.091, 0.024], [0.055, 0.058], [0, 0.075]], {
    at: [lanternX, lanternY + 0.066, 0], segments: 6, color: gold, bone: root,
  });
  b.lathe([[0, 0], [0.047, 0.015], [0.083, 0.044], [0.086, 0.061], [0, 0.061]], {
    at: [lanternX, lanternY - 0.15, 0], segments: 6, color: gold, bone: root,
  });
  glow(ellipsoid([lanternX, lanternY, 0],
    [0.027, 0.071, 0.025], "#125560", 6), 0.45);
  for (let i = 0; i < 6; i++) {
    const a = (i + 0.5) * Math.PI / 3;
    const x = lanternX + Math.sin(a) * 0.075;
    const z = Math.cos(a) * 0.075;
    b.rod([x, lanternY - 0.1, z], [x, lanternY + 0.09, z], 0.006, {
      color: gold, sides: 5, bone: root,
    });
  }
  drawing(soulTexture, [lanternX, lanternY, 0.047],
    [0.11, 0.16], [0, 0, 0], true);
  drawing(soulTexture, [lanternX, lanternY, -0.047],
    [0.11, 0.16], [0, 180, 0], true);
  // A perpendicular view also sees a spirit, not a featureless opaque core.
  drawing(soulTexture, [lanternX + 0.036, lanternY, 0],
    [0.075, 0.14], [0, 90, 0], true);
  drawing(soulTexture, [lanternX - 0.036, lanternY, 0],
    [0.075, 0.14], [0, -90, 0], true);
  b.spike([lanternX, lanternY - 0.13, 0], [0, -1, 0], 0.09, 0.027, {
    color: gold, sides: 6, bone: root,
  });

  // Thin, twisting spectral sheets: bright veins with dark translucent-looking
  // outer colours, built opaque so their silhouettes remain robust in export.
  for (const side of [-1, 1]) {
    const center = catmull([
      [0.16, 0.15, side * 0.045],
      [0.16 + side * 0.17, 0.21, side * 0.12],
      [0.16 + side * 0.30, 0.34, side * 0.14],
      [0.16 + side * 0.27, 0.46, side * 0.07],
      [0.16 + side * 0.20, 0.56, side * 0.025],
      [0.16 + side * 0.23, 0.67, side * 0.01],
    ]);
    const a: number[][] = [];
    const middle: number[][] = [];
    const c: number[][] = [];
    for (let i = 0; i <= 18; i++) {
      const t = i / 18;
      const p = center.at(t);
      const width = (0.012 + 0.04 * Math.sin(Math.PI * t)) * (1 - t) + 0.0007;
      const twist = 0.35 + t * 2.7;
      const v = new THREE.Vector3(
        Math.cos(twist) * side, 0.22, Math.sin(twist),
      ).normalize().multiplyScalar(width);
      a.push(p.clone().add(v).toArray());
      middle.push(p.toArray());
      c.push(p.clone().addScaledVector(v, -0.7).toArray());
    }
    glow(b.membrane(a, middle, {
      thickness: 0.0025, rows: 1, cols: 18,
      color: "#167c81", bone: root, name: `spectralRibbonOuter${side}`,
    }), 0.45);
    glow(b.membrane(middle, c, {
      thickness: 0.0025, rows: 1, cols: 18,
      color: "#39c6b7", bone: root, name: `spectralRibbonInner${side}`,
    }), 0.65);
    glow(b.sweep(center, [0.006, 0.008, 0.005, 0.002, 0], {
      color: C.cyan, sides: 4, bone: root, name: `soulRibbonVein${side}`,
    }), 1);
  }
  drawing(soulTexture, [-0.13, 0.41, 0.16],
    [0.062, 0.105], [0, 0, -18], true);

  // Suspended shards are intentional magical motes, not assembly debris.
  for (let i = 0; i < 9; i++) {
    const a = i * 2.4;
    const x = 0.14 + Math.sin(a) * (0.14 + random() * 0.13);
    const z = Math.cos(a) * 0.19;
    const y = 0.24 + random() * 0.30;
    glow(b.part(new THREE.OctahedronGeometry(0.011 + random() * 0.006), C.cyan, {
      at: [x, y, z], scale: [0.6, 1.6, 0.6],
      rotation: [i * 17, i * 21, 20], bone: root,
      name: `suspendedSoulMote${i + 1}`,
    }), 0.8);
  }

  return b.root;
}
