```ts
import * as THREE from "three";
import {
  createBuilder, rng, svg, paint, mix, noise,
  grain, catmull, bezier, spiral,
} from "agentic-3js-builder";
import type { Paint } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

/*
Art-direction changes:
1. Taper the crescent's actual thickness into its tip and cutting edge.
   The low view exposed a blunt, plank-like end; it is now a true blade.
2. Add a broad, faceted steel bevel and a finer luminous cutting line.
   This gives the large dark blade a readable material hierarchy.
3. Warm the ivory highlights, cool the fossil recesses, and simplify the
   gold's tarnish. The weapon should feel hand-painted, not uniformly beige.
4. Seat skull fractures on the skull itself, strengthen the blade inscriptions,
   and give the captive soul a clearer face.
5. Add restrained bone-edge highlights and socket ornament, retaining the
   successful silhouette, separated teeth, hanging cage, and magical motes.
*/

export const meta = {
  name: "Gravetide — Dragonbone Soul Scythe",
  description:
    "A heroic dragonbone scythe with a razor-tapered fossil crescent, horned dragon skull, engraved soulsteel, violet bindings and a captive turquoise soul.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Gravetide", paintSize: 2048 });
  const root = b.joint("weaponRoot", { at: [0, 0, 0] });
  const random = rng(419);
  type Fill = string | Paint;

  const C = {
    ink: "#111724",
    dark: "#222638",
    steel: "#344859",
    bone: "#dfcea4",
    ivory: "#fff0bf",
    boneDark: "#766b66",
    gold: "#caa05b",
    paleGold: "#f8d28c",
    violet: "#442c59",
    purple: "#71517e",
    teal: "#15bda9",
    cyan: "#7affdf",
    white: "#dafff3",
    stone: "#303341",
  };

  const bone = paint((p, n) => {
    const age = noise(p, 0.16, 31);
    const light = Math.max(0, Math.min(1, 0.48 + n.y * 0.32 + n.z * 0.10));
    const ivory = mix("#8c8691", "#ffedbe", light);
    return mix(ivory, "#b7a17a", Math.max(0, age - 0.52) * 0.45);
  });
  const boneHighlight = paint((_p, n) =>
    mix("#baa68d", "#fff1cf", 0.65 + n.y * 0.25)
  );
  const gold = metal("brass", {
    tarnish: 0.22, verdigris: 0.08, polish: 0.40, size: 0.15,
  });
  const bladeMetal = paint((p, n) =>
    mix("#101c30", "#345369",
      0.12 + Math.max(0, n.y) * 0.22 + Math.abs(n.z) * 0.25 + noise(p, 0.32, 12) * 0.14)
  );
  const bevelMetal = paint((p, n) =>
    mix("#286477", "#78b6b6",
      0.25 + Math.max(0, n.y) * 0.35 + noise(p, 0.28, 19) * 0.20)
  );
  const wood = grain("#171526", "#454054", { size: 0.017, axis: "y", seed: 9 });
  const leather = paint((p, n) =>
    mix("#2b203e", "#76557e",
      noise(p, 0.026, 5) * 0.55 + Math.max(0, n.y) * 0.15)
  );
  const stone = paint((p, n) =>
    mix("#1c2230", "#4e5260",
      noise(p, 0.2, 16) * 0.5 + Math.max(0, n.y) * 0.3)
  );

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
      <g fill="none" stroke="#665b59" stroke-width="3.2">
        <path d="M12 9 L39 30 L34 49 L60 63 L68 95 L82 117 M36 45 L16 58 M61 64 L88 50 L105 55"/>
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
      <path d="M40 63 L57 73 L54 91 L40 81 Z M79 61 L63 74 L65 91 L80 77Z"
            fill="#102d42"/>
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
      <g fill="none" stroke="#358d8e" stroke-width="3">
        <circle cx="128" cy="128" r="116"/><circle cx="128" cy="128" r="104"/>
        <path d="M128 25 L217 179 L39 179 Z M128 231 L39 77 L217 77Z"/>
        <circle cx="128" cy="128" r="58"/>
      </g>
      <g stroke="#94d3bb" stroke-width="4">
        <path d="M128 14 V31 M128 225 V242 M14 128 H31 M225 128 H242
                 M47 47 L60 60 M196 196 L209 209 M47 209 L60 196 M196 60 L209 47"/>
      </g>
      <path d="M128 77 L149 115 L139 143 L128 165 L117 143 L107 115Z"
            fill="none" stroke="#65b6a2" stroke-width="4"/>
    </svg>`, { size: 512 });

  function box(at: number[], size: number[], color: Fill, rotation: number[] = [0, 0, 0]) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at, rotation, bone: root,
    });
  }
  function ellipsoid(at: number[], scale: number[], color: Fill, segments = 10) {
    return b.part(new THREE.SphereGeometry(1, segments, 6), color, {
      at, scale, bone: root, flat: true,
    });
  }
  function plate(points: number[][], z: number, thickness: number, color: Fill, name: string) {
    return b.extrude(points, {
      at: [0, 0, z], x: [1, 0, 0], y: [0, 1, 0],
      thickness, color, bone: root, name,
    });
  }
  function tube(points: number[][], radius: number | number[], color: Fill, name?: string) {
    return b.sweep(catmull(points), radius, {
      color, bone: root, sides: 6, smooth: false, name,
    });
  }
  function disk(at: number[], radius: number, depth: number, color: Fill, dir = [0, 0, 1]) {
    return b.part(new THREE.CylinderGeometry(radius, radius, depth, 12), color, {
      at, dir, bone: root,
    });
  }
  function ring(at: number[], radius: number, thickness: number, color: Fill, rotation = [0, 0, 0]) {
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

  // A blade shares one thickness field across its ivory shell, steel faces,
  // bevel and emissive edge. All layers converge at precisely the same tip.
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
    const bevel = 0.07 + 0.93 * Math.min(1, edgeDistance(x, y) / 0.085);
    return tip * bevel;
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
      const x = positions.getX(i), y = positions.getY(i);
      positions.setZ(i,
        (z + positions.getZ(i) - thickness / 2) * bladeThicknessFactor(x, y));
    }
    geometry.clearGroups();
    geometry.computeVertexNormals();
    return b.part(geometry, color, {
      at: [0, 0, 0], bone: root, name, flat: true,
    });
  }

  // Broken summoning plinth.
  disk([0, 0.045, 0], 0.74, 0.09, C.ink, [0, 1, 0]);
  disk([0, 0.097, 0], 0.69, 0.07, stone, [0, 1, 0]);
  ring([0, 0.131, 0], 0.64, 0.009, C.teal, [90, 0, 0]);
  drawing(sealTexture, [0, 0.136, 0], [1.18, 1.18], [-90, 0, 0], true);

  for (let i = 0; i < 14; i++) {
    const a = i / 14 * Math.PI * 2;
    const h = 0.065 + random() * 0.04;
    box([Math.sin(a) * 0.66, 0.08 + h / 2, Math.cos(a) * 0.66],
      [0.17, h, 0.12], stone, [0, a * 180 / Math.PI, 0]);
    if (i % 2 === 0)
      ellipsoid([Math.sin(a) * 0.7, 0.145, Math.cos(a) * 0.7],
        [0.07, 0.045, 0.055], C.steel, 5);
  }
  for (let i = 0; i < 7; i++) {
    const a = 1.9 + i * 0.37;
    const x = Math.sin(a) * 0.46, z = Math.cos(a) * 0.46;
    const h = 0.13 + random() * 0.15;
    b.part(new THREE.ConeGeometry(0.07, h, 5), stone, {
      at: [x, 0.13 + h / 2, z], rotation: [12, i * 38, -15], bone: root,
    });
    tube([[x, 0.14, z + 0.04],
      [x + 0.012, 0.17 + h * 0.3, z + 0.045],
      [x, 0.14 + h * 0.7, z + 0.025]], 0.004, C.teal);
  }

  // Crooked blackwood shaft and piercing heel.
  tube([[0.16, 0.29, 0], [0.19, 0.95, 0], [0.17, 1.6, 0], [0.11, 2.4, 0]],
    [0.04, 0.047, 0.045, 0.061], wood, "blackwoodHaft");
  b.lathe([[0, 0], [0.015, 0.015], [0.061, 0.16], [0.056, 0.2], [0, 0.2]], {
    at: [0.16, 0.137, 0], segments: 8, color: bone, bone: root, name: "heelSpike",
  });
  disk([0.16, 0.325, 0], 0.062, 0.034, gold, [0, 1, 0]);
  ellipsoid([0.16, 0.31, 0.057], [0.023, 0.039, 0.016], C.teal, 6);

  for (const [bottom, top, x] of [[0.4, 0.92, 0.18], [1.69, 2.04, 0.145]]) {
    b.rod([x, bottom, 0], [x, top, 0], 0.057, {
      color: leather, sides: 10, bone: root,
    });
    b.sweep(spiral([x, bottom, 0], [x + 0.058, bottom, 0], [0, 1, 0], {
      turns: (top - bottom) / 0.052, pitch: 0.052,
    }), 0.006, { color: C.purple, sides: 5, bone: root });
    for (const y of [bottom, top]) {
      disk([x, y, 0], 0.066, 0.029, gold, [0, 1, 0]);
      disk([x, y + 0.019, 0], 0.059, 0.009, C.ink, [0, 1, 0]);
      for (const s of [-1, 1]) rivet([x + s * 0.039, y, 0.052], 0.009);
    }
    drawing(bindingTexture, [x, bottom + 0.07, 0.059], [0.107, 0.035]);
    drawing(bindingTexture, [x, top - 0.07, 0.059], [0.107, 0.035]);
  }

  // Vertebral grip.
  for (let i = 0; i < 8; i++) {
    const y = 1.005 + i * 0.083, x = 0.185 - i * 0.003;
    disk([x, y, 0], 0.064, 0.039, C.boneDark, [0, 1, 0]);
    ellipsoid([x, y + 0.008, 0], [0.087, 0.035, 0.074], bone, 8);
    plate([[x - 0.031, y + 0.027], [x + 0.031, y + 0.027],
      [x + 0.025, y - 0.018], [x, y - 0.048], [x - 0.025, y - 0.018]],
      0.065, 0.025, bone, `vertebralKeel${i}`);
    glow(ellipsoid([x, y + 0.005, 0.084], [0.008, 0.015, 0.005], C.teal, 6), 0.7);
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
  bladePlate(outerBlade, 0, 0.13, bone, "fossilCrescent");

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
    bladePlate(innerBlade, side * 0.071, 0.022, bladeMetal, `soulsteelFace${side}`);
    bladePlate(cuttingBevel, side * 0.086, 0.006, bevelMetal, `honedBevel${side}`);
    glow(bladePlate(luminousEdge, side * 0.092, 0.005, C.cyan,
      `spectralEdge${side}`), 1.1);
    tube([[-0.18, 2.51, side * 0.093], [-0.53, 2.66, side * 0.093],
      [-0.88, 2.61, side * 0.093], [-1.18, 2.42, side * 0.093],
      [-1.40, 2.1, side * 0.088]], 0.009, gold, "bladeInlay");

    // Ivory catches along the fossil spine, broken into broad deliberate strokes.
    tube([[-0.30, 2.733, side * 0.066], [-0.51, 2.753, side * 0.067],
      [-0.72, 2.748, side * 0.067]], [0.005, 0.009, 0.003], boneHighlight);
    tube([[-0.81, 2.72, side * 0.067], [-0.96, 2.655, side * 0.067],
      [-1.10, 2.578, side * 0.067]], [0.004, 0.008, 0.002], boneHighlight);
  }

  const ribs = [
    [-0.39, 2.71, -0.42, 2.40, -14],
    [-0.62, 2.72, -0.65, 2.39, -9],
    [-0.86, 2.64, -0.83, 2.35, 11],
    [-1.07, 2.53, -1.00, 2.25, 19],
    [-1.26, 2.35, -1.15, 2.12, 28],
    [-1.41, 2.12, -1.29, 1.94, 35],
  ];
  ribs.forEach(([ax, ay, bx, by, rot], i) => {
    for (const side of [-1, 1]) {
      const dx = bx - ax, dy = by - ay;
      const length = Math.hypot(dx, dy);
      const nx = -dy / length, ny = dx / length;
      const w = 0.037 - i * 0.002;
      plate([
        [ax + nx * w, ay + ny * w], [ax - nx * w, ay - ny * w],
        [bx - nx * w * 0.6, by - ny * w * 0.6],
        [bx + dx * 0.15, by + dy * 0.15],
        [bx + nx * w * 0.6, by + ny * w * 0.6],
      ], side * 0.103, 0.027, bone, `bladeRib${i}_${side}`);
      rivet([ax, ay, side * 0.125], 0.015);
      tube([[ax + nx * w * 0.65, ay + ny * w * 0.65, side * 0.118],
        [bx + nx * w * 0.3, by + ny * w * 0.3, side * 0.118]],
      [0.004, 0.001], boneHighlight);
      if (side > 0)
        drawing(cracksTexture, [(ax + bx) / 2, (ay + by) / 2, 0.12],
          [0.052, 0.14], [0, 0, rot]);
    }
  });

  for (const [x, y, rotation, h] of [
    [-0.54, 2.465, 8, 0.205], [-0.78, 2.43, -14, 0.195],
    [-1.00, 2.32, -31, 0.19], [-1.20, 2.15, -42, 0.175],
    [-1.38, 1.93, -25, 0.14],
  ]) {
    drawing(runesTexture, [x, y, 0.089], [0.067, h], [0, 0, rotation], true);
    drawing(runesTexture, [x, y, -0.089], [0.067, h], [0, 180, -rotation], true);
  }

  // Large, asymmetric fossil serrations.
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
    const g = new THREE.ExtrudeGeometry(spur, { depth: 0.09, bevelEnabled: false });
    const p = g.getAttribute("position");
    for (let k = 0; k < p.count; k++) {
      const distance = Math.hypot(p.getX(k) - (x + dx), p.getY(k) - (y + dy));
      p.setZ(k, (p.getZ(k) - 0.045) * Math.min(1, distance / 0.12));
    }
    g.clearGroups();
    g.computeVertexNormals();
    b.part(g, bone, { at: [0, 0, 0], bone: root, name: "fossilSpur", flat: true });
  }

  // Distinct upper skull and lower jaw.
  const cranium = ellipsoid([0.065, 2.405, 0], [0.235, 0.212, 0.17], bone, 10);
  const nasalBridge = ellipsoid([-0.15, 2.345, 0], [0.195, 0.118, 0.139], bone, 8);
  const muzzle = plate([
    [-0.08, 2.43], [-0.25, 2.39], [-0.44, 2.31], [-0.47, 2.25],
    [-0.39, 2.22], [-0.17, 2.245], [0.03, 2.30],
  ], 0, 0.255, bone, "upperDragonMuzzle");
  plate([
    [0.18, 2.32], [0.23, 2.20], [0.08, 2.08], [-0.24, 2.045],
    [-0.43, 2.13], [-0.45, 2.18], [-0.35, 2.15], [-0.18, 2.115],
    [0.035, 2.16], [0.10, 2.30],
  ], 0, 0.19, bone, "lowerDragonJaw");

  for (const side of [-1, 1]) {
    const z = side * 0.165;
    plate([
      [-0.17, 2.43], [-0.035, 2.505], [0.15, 2.47],
      [0.09, 2.355], [-0.08, 2.34], [-0.185, 2.37],
    ], z, 0.021, C.ink, `eyeSocket${side}`);
    drawing(eyeTexture, [-0.015, 2.418, side * 0.179], [0.27, 0.136],
      side > 0 ? [0, 0, 0] : [0, 180, 0], true);
    plate([
      [-0.205, 2.43], [-0.06, 2.54], [0.20, 2.51],
      [0.135, 2.455], [-0.035, 2.46],
    ], side * 0.184, 0.047, bone, "heavyDragonBrow");
    tube([[-0.19, 2.435, side * 0.211], [-0.057, 2.523, side * 0.211],
      [0.16, 2.503, side * 0.211]], [0.002, 0.006, 0.002], boneHighlight);
    plate([
      [0.135, 2.45], [0.31, 2.41], [0.38, 2.27], [0.19, 2.31],
      [0.11, 2.18], [0.035, 2.23],
    ], side * 0.148, 0.045, bone, "cheekFlare");
    ellipsoid([-0.356, 2.299, side * 0.135], [0.046, 0.022, 0.008], C.ink, 6);
    tube([[-0.42, 2.26, side * 0.135], [-0.30, 2.257, side * 0.143],
      [-0.18, 2.278, side * 0.147]], 0.005, C.boneDark);
    disk([0.12, 2.22, side * 0.14], 0.054, 0.028, gold, [0, 0, side]);
    disk([0.12, 2.22, side * 0.159], 0.033, 0.018, C.ink, [0, 0, side]);
    glow(ellipsoid([0.12, 2.22, side * 0.173],
      [0.018, 0.025, 0.012], C.teal, 6), 1);

    for (let i = 0; i < 5; i++) {
      const x = -0.355 + i * 0.065, y = 2.239 + i * 0.004;
      b.spike([x, y, side * 0.093],
        [x + 0.013, y - (i === 0 ? 0.094 : 0.057), side * 0.10],
        null, i === 0 ? 0.021 : 0.015,
        { color: bone, sides: 5, bone: root });
      if (i < 4)
        b.spike([x + 0.03, 2.104, side * 0.075],
          [x + 0.024, 2.145, side * 0.079],
          null, 0.013, { color: C.ivory, sides: 5, bone: root });
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
  }

  for (const side of [-1, 1]) {
    const z = side * 0.095;
    const horn = tube([
      [0.14, 2.52, z], [0.30, 2.63, z * 1.35],
      [0.45, 2.80, z * 1.5], [0.56, 2.88, z * 1.55],
    ], [0.074, 0.058, 0.026, 0], bone, `crownHorn${side}`);
    const skin = b.surface(horn);
    for (let j = 0; j < 3; j++) {
      const hit = skin.nearest([0.23 + j * 0.06, 2.59 + j * 0.06, side * 0.3]);
      b.stick(new THREE.CylinderGeometry(0.014, 0.018, 0.008, 6), gold, hit);
    }
    tube([[0.22, 2.40, z], [0.43, 2.43, z * 1.6],
      [0.65, 2.57, z * 1.8]], [0.053, 0.037, 0], bone, "templeHorn");
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
    [0.15, 2.195], [0.095, 2.14]],
    0.063, 0.018, gold, "socketEscutcheon");
  plate([[0.123, 2.095], [0.175, 2.095], [0.183, 2.137],
    [0.15, 2.169], [0.117, 2.137]],
    0.075, 0.009, C.violet, "socketEnamel");
  drawing(runesTexture, [0.15, 2.131, 0.082], [0.032, 0.06], [0, 0, 0], true);

  // The reliquary's support and linked suspension.
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
    [0.035, 0.083, 0.031], "#125560", 6), 0.45);
  for (let i = 0; i < 6; i++) {
    // Offset the bars so none cuts straight through the soul's face.
    const a = (i + 0.5) * Math.PI / 3;
    const x = lanternX + Math.sin(a) * 0.075;
    const z = Math.cos(a) * 0.075;
    b.rod([x, lanternY - 0.1, z], [x, lanternY + 0.09, z],
      0.006, { color: gold, sides: 5, bone: root });
  }
  drawing(soulTexture, [lanternX, lanternY, 0.047],
    [0.11, 0.16], [0, 0, 0], true);
  drawing(soulTexture, [lanternX, lanternY, -0.047],
    [0.11, 0.16], [0, 180, 0], true);
  b.spike([lanternX, lanternY - 0.13, 0], [0, -1, 0], 0.09, 0.027, {
    color: gold, sides: 6, bone: root,
  });

  // Grounded spell ribbons; the isolated shards are intentional magical motes.
  for (const side of [-1, 1]) {
    const pts = [
      [0.16, 0.18, side * 0.08],
      [0.16 + side * 0.23, 0.24, side * 0.15],
      [0.16 + side * 0.34, 0.41, side * 0.1],
      [0.16 + side * 0.24, 0.58, side * 0.04],
      [0.16 + side * 0.27, 0.70, side * 0.03],
    ];
    glow(tube(pts, [0.032, 0.047, 0.031, 0.018, 0],
      "#168b89", "escapingSoulRibbon"), 0.55);
    glow(tube(pts.map(p => [p[0], p[1], p[2] + 0.025]),
      [0.01, 0.012, 0.008, 0.004, 0], C.cyan, "soulRibbonVein"), 1);
  }
  drawing(soulTexture, [-0.18, 0.46, 0.16],
    [0.09, 0.14], [0, 0, -18], true);
  for (let i = 0; i < 9; i++) {
    const a = i * 2.4;
    const x = 0.14 + Math.sin(a) * (0.16 + random() * 0.18);
    const z = Math.cos(a) * 0.23;
    const y = 0.24 + random() * 0.30;
    glow(b.part(new THREE.OctahedronGeometry(0.014 + random() * 0.009), C.cyan, {
      at: [x, y, z], scale: [0.6, 1.6, 0.6],
      rotation: [i * 17, i * 21, 20], bone: root,
      name: `suspendedSoulMote${i + 1}`,
    }), 0.8);
  }

  return b.root;
}
```