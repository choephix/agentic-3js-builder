import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  frame,
  rng,
  paint,
  noise,
  mix,
  svg,
  type Fill,
  type Joint,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "The Apricot Oasis",
  description:
    "A little desert caravan haven: jade palms, turquoise water, patterned pavilion tents and two tasselled camels on a sculpted island of warm sand.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "ApricotOasis", paintSize: 2048 });
  const random = rng(41823);
  const root = b.joint("oasis", { at: [0, 0, 0] });

  const C = {
    sand: "#eac082",
    sandLight: "#f8d99d",
    sandEdge: "#bb7750",
    sandDark: "#cf9562",
    cream: "#fff0c4",
    coral: "#d96447",
    coralLight: "#f28a59",
    wine: "#823f43",
    teal: "#217a79",
    tealDark: "#175453",
    turquoise: "#39bdb2",
    water: "#168d96",
    waterLight: "#8fe5d0",
    wood: "#805434",
    woodLight: "#b27d46",
    green: "#347d50",
    greenDark: "#21624b",
    lime: "#83ae53",
    gold: "#eab558",
    ink: "#382b2d",
    camel: "#ce9455",
    camelLight: "#e3b476",
    camelDark: "#9c653f",
    rope: "#c69960",
  };

  const sandPaint = paint((p, n) => {
    const wind = Math.sin(p.x * 1.5 + p.z * 2.3 + noise(p, 1.9, 8) * 3);
    const tone = 0.43 + noise(p, 0.65, 3) * 0.2 + wind * 0.06;
    return n.y > 0.5
      ? mix("#e7ba7d", "#f7d59a", tone)
      : mix("#c28657", "#e0ab71", 0.35 + 0.3 * noise(p, 0.8, 9));
  });
  const trunkPaint = paint((p, n) =>
    mix("#805333", "#b78048", 0.4 + n.y * 0.2 + noise(p, 0.18, 2) * 0.2),
  );
  const camelPaint = paint((p, n) =>
    mix("#b57a49", "#e3b273", 0.52 + 0.25 * n.y + 0.15 * noise(p, 0.22, 7)),
  );
  const waterPaint = paint((p) => {
    const ripple = Math.sin(p.z * 11 + Math.sin(p.x * 4) * 1.8);
    return mix("#168d96", "#2aada8", 0.42 + 0.12 * ripple + 0.16 * noise(p, 0.8, 6));
  });
  const coralCloth = paint((p, n) => {
    const stripe = ((p.x * 2.5 + 50) % 1) < 0.16;
    return stripe ? "#f2bd7f" : n.y > 0.3 ? "#e87950" : "#cb5847";
  });
  const tealCloth = paint((p, n) => {
    const stripe = ((p.x * 3 + 50) % 1) < 0.12;
    return stripe ? "#a3b994" : n.y > 0.3 ? "#398d85" : "#236a6b";
  });

  function drawing(body: string, w = 256, h = 256) {
    return svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`,
      { size: 512 },
    );
  }

  const carpet = drawing(`
    <rect width="256" height="256" fill="#873f45"/>
    <rect x="9" y="9" width="238" height="238" fill="#efb977"/>
    <rect x="16" y="16" width="224" height="224" fill="#246d70"/>
    <path d="M24 24H232V232H24Z" fill="none" stroke="#f4d5a0" stroke-width="6" stroke-dasharray="8 10"/>
    <rect x="40" y="40" width="176" height="176" fill="#bb5746"/>
    <path d="M128 49L205 128 128 207 51 128Z" fill="#f1c17f" stroke="#6a3940" stroke-width="7"/>
    <path d="M128 75L180 128 128 181 76 128Z" fill="#246d70"/>
    <path d="M128 102L153 128 128 154 103 128Z" fill="#ffdfaa"/>
    <g fill="#edb774">
      <path d="M55 48L66 60 55 72 44 60ZM201 48L212 60 201 72 190 60Z"/>
      <path d="M55 184L66 196 55 208 44 196ZM201 184L212 196 201 208 190 196Z"/>
    </g>
  `);

  const blueCarpet = drawing(`
    <rect width="256" height="256" fill="#173f50"/>
    <rect x="10" y="10" width="236" height="236" fill="#c59054"/>
    <rect x="19" y="19" width="218" height="218" fill="#378c85"/>
    <path d="M28 28H228V228H28Z" stroke="#f5d79c" fill="none" stroke-width="6" stroke-dasharray="5 9"/>
    <g fill="#f3d59d" stroke="#164c59" stroke-width="5">
      <path d="M128 43L170 85 128 127 86 85Z"/>
      <path d="M128 129L170 171 128 213 86 171Z"/>
      <path d="M53 94L85 128 53 162 21 128Z"/>
      <path d="M203 94L235 128 203 162 171 128Z"/>
    </g>
    <path d="M128 66L148 85 128 105 108 85ZM128 151L148 171 128 191 108 171Z" fill="#bc634d"/>
  `);

  const woven = drawing(`
    <rect width="256" height="256" fill="#c39359"/>
    <path d="${Array.from({ length: 17 }, (_, i) => `M0 ${i * 16}H256`).join(" ")}"
      stroke="#e8c38b" stroke-width="5"/>
    <path d="${Array.from({ length: 17 }, (_, i) => `M${i * 16} 0V256`).join(" ")}"
      stroke="#a77743" stroke-width="3"/>
    <rect x="7" y="7" width="242" height="242" fill="none" stroke="#704d33" stroke-width="8"/>
  `);

  const sunBadge = drawing(`
    <g fill="none" stroke="#ffe1a4" stroke-width="7" stroke-linecap="round">
      <circle cx="128" cy="128" r="46"/>
      <path d="M128 24V57M128 199V232M24 128H57M199 128H232
      M54 54L77 77M179 179L202 202M54 202L77 179M179 77L202 54"/>
    </g>
    <path d="M128 91L139 117 166 128 139 139 128 165 117 139 90 128 117 117Z" fill="#ffe1a4"/>
  `);

  const eyeTex = drawing(`
    <path d="M18 132Q58 53 136 72Q205 81 239 131Q180 189 110 177Q50 172 18 132Z" fill="#56362b"/>
    <path d="M32 131Q80 83 139 89Q186 94 220 131Q168 162 113 158Q62 157 32 131Z" fill="#fff1d1"/>
    <ellipse cx="139" cy="126" rx="48" ry="44" fill="#51362e"/>
    <ellipse cx="144" cy="124" rx="28" ry="36" fill="#211f26"/>
    <circle cx="126" cy="109" r="12" fill="#ffffff"/>
    <circle cx="155" cy="140" r="5" fill="#fff3d6"/>
    <path d="M19 125Q68 53 142 71Q207 81 240 127M43 95L27 74M64 82L53 58" fill="none" stroke="#493126" stroke-width="10" stroke-linecap="round"/>
  `);

  function box(
    at: number[],
    size: number[],
    color: Fill,
    bone: Joint = root,
    name = "box",
    rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at, bone, name, rotation,
    });
  }
  function ball(
    at: number[],
    size: number[],
    color: Fill,
    bone: Joint = root,
    name = "facetedForm",
    detail = 1,
  ) {
    return b.part(new THREE.IcosahedronGeometry(1, detail), color, {
      at, scale: size, bone, name, flat: true,
    });
  }
  function rod(a: number[], c: number[], r: number, color: Fill, bone = root, name = "rod") {
    return b.rod(a, c, r, { color, bone, sides: 6, name });
  }
  function flatDrawing(
    at: number[], size: number[], texture: THREE.Texture,
    direction: number[] = [0, 0, 1], bone = root, name = "wovenDrawing",
  ) {
    return b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
      at, dir: direction, axis: "z", up: [0, 1, 0], texture, bone, name,
    });
  }

  // The island has an actual recess, rather than a blue disc laid over sand.
  const island = [
    [-7.7, -4.9], [-5.6, -6.1], [-1.7, -6.45], [2.3, -6.1],
    [6.2, -5.55], [8.0, -3.65], [8.55, -0.6], [8.25, 3.0],
    [6.5, 5.2], [3.7, 6.0], [-0.5, 6.25], [-4.2, 5.8],
    [-7.25, 4.3], [-8.3, 1.25], [-8.4, -1.7],
  ];
  const pondCenter = [-1.55, 1.25];
  const pond = Array.from({ length: 22 }, (_, i) => {
    const a = i * Math.PI * 2 / 22;
    const r = 1 + Math.sin(a * 3 + 0.4) * 0.07 + Math.cos(a * 5) * 0.035;
    return [
      pondCenter[0] + Math.cos(a) * 3.7 * r,
      pondCenter[1] + Math.sin(a) * 2.55 * r,
    ];
  });

  function shapeFrom(points: number[][]) {
    const s = new THREE.Shape();
    points.forEach(([x, z], i) => i === 0 ? s.moveTo(x, -z) : s.lineTo(x, -z));
    s.closePath();
    return s;
  }
  function groundLayer(points: number[][], y: number, height: number, color: Fill, hole?: number[][]) {
    const shape = shapeFrom(points);
    if (hole) {
      const path = new THREE.Path();
      hole.forEach(([x, z], i) => i === 0 ? path.moveTo(x, -z) : path.lineTo(x, -z));
      path.closePath();
      shape.holes.push(path);
    }
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: height, bevelEnabled: false, steps: 1, curveSegments: 1,
    });
    geo.rotateX(-Math.PI / 2);
    return b.part(geo, color, { at: [0, y, 0], bone: root, name: "sculptedSandIsland", flat: true });
  }
  groundLayer(island, 0, 0.15, C.sandEdge);
  groundLayer(island, 0.15, 0.29, sandPaint, pond);
  const pondGeo = new THREE.ShapeGeometry(shapeFrom(pond));
  pondGeo.rotateX(-Math.PI / 2);
  b.part(pondGeo, C.turquoise, { at: [0, 0.405, 0], bone: root, name: "shallowJadeWater" });
  const deepPond = pond.map(([x, z]) => [
    pondCenter[0] + (x - pondCenter[0]) * 0.87,
    pondCenter[1] + (z - pondCenter[1]) * 0.84,
  ]);
  const deepGeo = new THREE.ShapeGeometry(shapeFrom(deepPond));
  deepGeo.rotateX(-Math.PI / 2);
  b.part(deepGeo, waterPaint, { at: [0, 0.408, 0], bone: root, name: "oasisDeepWater" });

  // Broken, angular glints leave most of the water calm.
  [
    [-2.9, 2.0, 1.15], [-0.9, 0.1, 1.3], [0.1, 2.5, 0.7],
    [-3.9, 0.65, 0.65], [-1.5, 3.15, 1.0], [0.2, 1.25, 0.85],
  ].forEach(([x, z, length], i) => {
    b.slab([
      [x - length / 2, 0.414, z],
      [x - length * 0.12, 0.414, z + 0.045],
      [x + length / 2, 0.414, z + 0.015],
      [x + length * 0.25, 0.414, z + 0.085],
      [x - length * 0.3, 0.414, z + 0.075],
    ], { color: i % 2 ? "#72d4c3" : "#a0e5cb", thickness: 0.003, bone: root, name: "waterGlint" });
  });

  // Broad dune shoulders soften the edge of the miniature.
  [
    [-6.5, -4.3, 1.3, 0.31, 1.1], [6.8, -4.3, 1.15, 0.35, 0.9],
    [-5.8, 4.1, 1.3, 0.23, 0.8], [4.0, 4.8, 1.4, 0.24, 0.85],
    [0.8, -5.1, 1.8, 0.23, 0.9],
  ].forEach(([x, z, sx, sy, sz]) => ball([x, 0.38, z], [sx, sy, sz], sandPaint, root, "duneShoulder"));

  // Palm fronds: creased ribbons with cut, feather-like margins.
  // Each side is one primitive mesh, with a raised central rib.
  function palmLeaf(
    origin: THREE.Vector3, angle: number, length: number,
    rise: number, drop: number, width: number, index: number,
  ) {
    const forward = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
    const sideways = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle));
    const center = (t: number) =>
      origin.clone()
        .addScaledVector(forward, length * t)
        .add(new THREE.Vector3(0, rise * Math.sin(Math.PI * t) - drop * t * t, 0));
    for (const side of [-1, 1]) {
      const vertices: number[] = [];
      const triangles: number[] = [];
      const count = 16;
      for (let j = 0; j <= count; j++) {
        const t = j / count;
        const mid = center(t);
        const envelope = Math.pow(Math.sin(Math.PI * t), 0.72) * width;
        const tooth = j % 2 ? 1 : 0.48;
        const edge = mid.clone().addScaledVector(sideways, side * envelope * tooth);
        edge.y -= envelope * 0.25;
        vertices.push(mid.x, mid.y + envelope * 0.08, mid.z, edge.x, edge.y, edge.z);
        if (j < count) {
          const k = j * 2;
          if (side > 0) triangles.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
          else triangles.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
        }
      }
      // Duplicate the back faces; fronds remain visible from below the crown.
      const back = triangles.slice();
      for (let k = 0; k < back.length; k += 3) triangles.push(back[k], back[k + 2], back[k + 1]);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
      geo.setIndex(triangles);
      geo.computeVertexNormals();
      b.part(geo, side > 0 ? (index % 3 ? C.green : C.lime) : C.greenDark, {
        at: [0, 0, 0], bone: root, name: "creasedPalmFrond", flat: true,
      });
    }
    const rib = [0, 0.25, 0.55, 0.8, 1].map(t => center(t));
    b.sweep(polyline(rib), [0.027, 0.004], {
      color: "#96af58", sides: 5, bone: root, caps: "flat", name: "palmLeafMidrib",
    });
  }

  function palm(x: number, z: number, height: number, leanX: number, leanZ: number, phase: number) {
    const base = new THREE.Vector3(x, 0.42, z);
    const points = [
      base,
      new THREE.Vector3(x + leanX * 0.18, 0.42 + height * 0.34, z + leanZ * 0.18),
      new THREE.Vector3(x + leanX * 0.65, 0.42 + height * 0.71, z + leanZ * 0.65),
      new THREE.Vector3(x + leanX, 0.42 + height, z + leanZ),
    ];
    const trunk = b.sweep(catmull(points), [0.3, 0.25, 0.2, 0.16], {
      bone: root, color: trunkPaint, sides: 7, smooth: false,
      caps: "flat", name: "leaningPalmTrunk",
    });
    b.along(trunk.curve(), 10, (at) => {
      const t = at.t;
      b.part(new THREE.CylinderGeometry(0.29 - t * 0.115, 0.31 - t * 0.12, 0.09, 7), C.woodLight, {
        frame: at, bone: root, name: "oldPalmLeafCollar",
      });
    }, { from: 0.07, to: 0.95 });
    const crown = points[3];
    ball([crown.x, crown.y - 0.08, crown.z], [0.36, 0.4, 0.36], C.greenDark, root, "palmCrown");
    for (let i = 0; i < 9; i++) {
      const a = phase + i * Math.PI * 2 / 9;
      palmLeaf(crown, a, 2.05 + random() * 0.65, 0.42 + random() * 0.25,
        0.68 + random() * 0.48, 0.36 + random() * 0.1, i);
    }
    for (let i = 0; i < 3; i++) {
      const a = phase + i * 2.1;
      palmLeaf(crown, a, 1.05, 0.85, -0.2, 0.23, i);
    }
    for (let i = 0; i < 4; i++) {
      const a = phase + i * 1.8;
      ball(
        [crown.x + Math.cos(a) * 0.26, crown.y - 0.32 - (i % 2) * 0.1, crown.z + Math.sin(a) * 0.26],
        [0.18, 0.22, 0.18], i % 2 ? "#876039" : "#b3954c", root, "coconut", 0,
      );
    }
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + 0.4;
      rod([x, 0.55, z], [x + Math.cos(a) * 0.55, 0.455, z + Math.sin(a) * 0.55],
        0.075, C.wood, root, "exposedPalmRoot");
    }
  }

  palm(-6.3, 2.2, 5.35, 0.3, -0.2, 0.2);
  palm(-6.6, -3.55, 5.65, -0.35, 0.3, 0.65);
  palm(-0.95, -5.1, 6.1, 0.4, 0.05, 0.1);
  palm(6.15, -3.8, 5.8, -0.6, -0.15, 0.5);

  function rug(x: number, z: number, width: number, depth: number, texture: THREE.Texture) {
    const g = new THREE.PlaneGeometry(width, depth);
    g.rotateX(-Math.PI / 2);
    b.part(g, "#ffffff", { at: [x, 0.462, z], texture, bone: root, name: "campCarpet" });
    for (const s of [-1, 1]) {
      for (let i = 0; i < 11; i++) {
        const px = x - width * 0.46 + width * 0.092 * i;
        rod([px, 0.46, z + s * depth * 0.5], [px, 0.46, z + s * (depth * 0.5 + 0.12)],
          0.015, C.cream, root, "carpetFringe");
      }
    }
  }

  function tent(
    x: number, z: number, width: number, depth: number, height: number,
    cloth: Fill, trim: string, texture: THREE.Texture, title: string,
  ) {
    const y = 0.46;
    const eave = y + height * 0.48;
    const peak = y + height;
    const front = z + depth / 2;
    const back = z - depth / 2;
    const left = x - width / 2;
    const right = x + width / 2;
    // A generous ridge, curved eaves, and an open dark interior.
    b.slab([[left, y, back], [right, y, back], [right, eave, back], [x, peak, back], [left, eave, back]], {
      color: cloth, thickness: 0.035, bone: root, name: `${title}RearWall`,
    });
    for (const side of [-1, 1]) {
      const edgeX = x + side * width / 2;
      b.membrane(
        [[x, peak, back - 0.15], [x, peak + 0.07, z], [x, peak, front + 0.22]],
        [[edgeX, eave, back - 0.15], [edgeX + side * 0.1, eave - 0.08, z], [edgeX, eave, front + 0.22]],
        { color: cloth, thickness: 0.035, rows: 3, cols: 5, bone: root, name: `${title}Canopy` },
      );
      b.slab([
        [edgeX, y, back], [edgeX, y, front],
        [edgeX, eave, front], [edgeX, eave, back],
      ], { color: cloth, thickness: 0.025, bone: root, name: `${title}SideWall` });
      rod([x, peak + 0.015, front + 0.24], [edgeX, eave + 0.015, front + 0.24],
        0.045, trim, root, "tentRoofBinding");
      rod([edgeX, eave, back - 0.15], [edgeX, eave, front + 0.25],
        0.045, trim, root, "longTentBinding");
      // Gathered triangular front curtains leave a wide central doorway.
      b.slab([
        [edgeX, y, front + 0.02],
        [x + side * width * 0.19, y + 0.08, front + 0.055],
        [x + side * width * 0.32, eave * 0.71, front + 0.08],
        [x, peak - 0.035, front + 0.04],
        [edgeX, eave, front + 0.04],
      ], { color: cloth, thickness: 0.028, bone: root, name: "gatheredEntryCurtain" });
      rod(
        [x + side * width * 0.32, eave * 0.71, front + 0.1],
        [edgeX, eave * 0.71 - 0.04, front + 0.1],
        0.033, C.gold, root, "curtainTie",
      );
      for (const end of [back, front]) {
        rod([edgeX, y, end], [edgeX, eave + 0.08, end], 0.055, C.wood, root, "tentCornerPole");
        const peg = [edgeX + side * 0.72, 0.46, end + (end === front ? 0.55 : -0.45)];
        rod([edgeX, eave - 0.03, end], peg, 0.018, C.rope, root, "guyRope");
        rod([peg[0], 0.44, peg[2]], [peg[0] + side * 0.05, 0.69, peg[2] - 0.03],
          0.035, C.wood, root, "tentPeg");
      }
      for (let j = 0; j < 7; j++) {
        const zz = back - 0.07 + j * (depth + 0.16) / 6;
        b.slab([
          [edgeX, eave, zz - 0.13], [edgeX, eave, zz + 0.13],
          [edgeX, eave - 0.18, zz],
        ], { color: trim, thickness: 0.025, bone: root, name: "scallopedTentValance" });
      }
    }
    rod([x, y, back], [x, peak + 0.26, back], 0.065, C.wood, root, "rearRidgePole");
    rod([x, y, front + 0.16], [x, peak + 0.28, front + 0.16], 0.065, C.woodLight, root, "frontRidgePole");
    rod([x, peak + 0.045, back - 0.22], [x, peak + 0.045, front + 0.32],
      0.065, trim, root, "ridgeCap");
    ball([x, peak + 0.3, front + 0.16], [0.12, 0.15, 0.12], C.gold, root, "tentFinial", 0);
    b.slab([
      [x, peak + 0.26, front + 0.16],
      [x + 0.65, peak + 0.38, front + 0.16],
      [x + 0.43, peak + 0.57, front + 0.16],
      [x, peak + 0.53, front + 0.16],
    ], { color: trim, thickness: 0.018, bone: root, name: "tentPennant" });
    flatDrawing([x - width * 0.24, peak - height * 0.43, front + 0.09],
      [0.43, 0.43], sunBadge, [0, 0, 1], root, "embroideredSun");
    rug(x, front + 0.55, width * 0.66, 1.6, texture);
    box([x - width * 0.25, 0.59, z + 0.25], [0.75, 0.24, 0.65], trim, root, "interiorCushion");
    box([x + width * 0.24, 0.59, z + 0.14], [0.68, 0.22, 0.6], C.gold, root, "interiorCushion");
  }

  tent(-3.65, -3.5, 3.7, 2.65, 2.75, coralCloth, C.cream, carpet, "Apricot");
  tent(3.0, -4.4, 2.9, 2.15, 2.35, tealCloth, C.gold, blueCarpet, "Jade");

  // Each camel is rigged independently under the scene root.
  function camel(x: number, z: number, scale: number, suffix: string, blanket: THREE.Texture) {
    const p = (v: number[]) => [x + v[0] * scale, 0.455 + v[1] * scale, z + v[2] * scale];
    const hips = b.joint(`hips${suffix}`, { parent: root, at: p([0, 1.55, -0.58]), role: "spine" });
    const spine = b.chain(`spine${suffix}`, [
      p([0, 1.55, -0.58]), p([0, 1.65, 0.0]), p([0, 1.66, 0.58]),
    ], { parent: hips, count: 2, role: "spine" });
    const neck = b.chain(`neck${suffix}`, [
      p([0, 1.6, 0.56]), p([0, 1.85, 0.96]),
      p([0, 2.38, 1.11]), p([0, 2.68, 1.35]),
    ], { parent: spine.joints[1], count: 3, role: "neck" });
    const head = b.joint(`head${suffix}`, {
      parent: neck.joints[2], at: p([0, 2.69, 1.4]), dir: [0, 0, 1], role: "head",
    });
    const jaw = b.joint(`jaw${suffix}`, {
      parent: head, at: p([0, 2.57, 1.4]), dir: [0, 0, 1], role: "jaw",
    });
    const tail = b.chain(`tail${suffix}`, [
      p([0, 1.63, -0.86]), p([0.13, 1.38, -1.18]), p([0.2, 0.97, -1.3]),
    ], { parent: hips, role: "tail", count: 2 });

    const legs = [];
    for (const front of [true, false]) {
      for (const s of [-1, 1]) {
        const side = s > 0 ? "L" : "R";
        const label = `${front ? "F" : "H"}${side}${suffix}`;
        const zz = front ? 0.53 : -0.62;
        const chain = b.chain(`leg${label}`, [
          p([s * 0.32, 1.62, zz]),
          p([s * 0.37, 0.85, zz + (front ? 0.09 : -0.13)]),
          p([s * 0.42, 0.18, zz + 0.03]),
        ], {
          parent: front ? spine.joints[1] : hips,
          names: [`hip${label}`, `knee${label}`, `ankle${label}`],
          role: "leg",
          contact: p([s * 0.42, 0, zz + 0.13]),
        });
        legs.push({ chain, s, zz, label });
      }
    }

    const cb = (at: number[], size: number[], color: Fill, bone: Joint, name: string, detail = 1) =>
      ball(p(at), size.map(v => v * scale), color, bone, `${name}${suffix}`, detail);
    const cr = (a: number[], c: number[], r: number, color: Fill, bone: Joint, name: string) =>
      rod(p(a), p(c), r * scale, color, bone, `${name}${suffix}`);

    b.sweep(spine, () => [0.43 * scale, 0.47 * scale], {
      bone: spine, color: camelPaint, sides: 8, smooth: false,
      caps: "round", extend: 0.08 * scale, name: `camelBody${suffix}`,
    });
    b.loft([
      { at: p([0, 1.82, -0.1]), w: 0.86 * scale, h: 1.13 * scale },
      { at: p([0, 2.16, -0.14]), w: 0.62 * scale, h: 0.77 * scale },
      { at: p([0, 2.4, -0.2]), w: 0.22 * scale, h: 0.27 * scale },
      { at: p([0, 2.43, -0.2]), w: 0.08 * scale, h: 0.12 * scale },
    ], { color: camelPaint, bone: spine.joints[0], sides: 7, smooth: false, name: `singleCamelHump${suffix}` });
    b.sweep(neck, [0.32 * scale, 0.26 * scale, 0.2 * scale, 0.19 * scale], {
      color: camelPaint, sides: 7, smooth: false, name: `archedCamelNeck${suffix}`,
    });
    b.sweep(tail, [0.055 * scale, 0.025 * scale], {
      color: C.camel, sides: 6, name: `camelTail${suffix}`,
    });
    cb([0.2, 0.98, -1.3], [0.1, 0.2, 0.1], C.camelDark, tail.joints[1], "tailTassel", 0);

    for (const { chain, s, zz, label } of legs) {
      b.sweep(chain, [0.15 * scale, 0.105 * scale, 0.075 * scale], {
        color: camelPaint, sides: 6, smooth: false, name: `slenderLeg${label}`,
      });
      cb([s * 0.37, 0.85, zz + (zz > 0 ? 0.09 : -0.13)],
        [0.135, 0.13, 0.14], C.camelDark, chain.joints[1], "kneePad", 0);
      const foot = chain.joints[2];
      for (const toe of [-1, 1]) {
        cb([s * 0.42 + toe * 0.067, 0.105, zz + 0.13],
          [0.095, 0.105, 0.21], C.camelDark, foot, "splitCamelFoot");
        cb([s * 0.42 + toe * 0.067, 0.075, zz + 0.28],
          [0.065, 0.06, 0.065], "#73513a", foot, "camelToenail", 0);
      }
    }

    // Face first: projecting muzzle, separate lower jaw, broad eyelids.
    cb([0, 2.7, 1.44], [0.255, 0.24, 0.32], camelPaint, head, "camelSkull");
    cb([0, 2.65, 1.75], [0.22, 0.16, 0.34], C.camelLight, head, "upperMuzzle");
    cb([0, 2.525, 1.72], [0.19, 0.085, 0.32], C.camel, jaw, "lowerJaw");
    for (const s of [-1, 1]) {
      const eyeAt = [s * 0.215, 2.76, 1.56];
      const eye = cb(eyeAt, [0.065, 0.09, 0.09], C.camelLight, head, "eyeSocket");
      b.decal(eye, eyeTex, {
        at: p([s * 0.26, 2.76, 1.6]),
        dir: [s * 0.8, 0.03, 0.65],
        up: [0, 1, 0], size: [0.145 * scale, 0.12 * scale],
        bone: head, mirror: s > 0, lift: 0.002 * scale, name: `camelEye${suffix}`,
      });
      cr([s * 0.2, 2.875, 1.48], [s * 0.23, 2.86, 1.65],
        0.035, C.camelDark, head, "gentleBrow");
      cb([s * 0.12, 2.71, 1.99], [0.037, 0.026, 0.025], C.ink, head, "nostril", 0);
      cr([s * 0.18, 2.575, 1.62], [s * 0.17, 2.575, 1.94],
        0.011, C.camelDark, head, "muzzleSeam");
      b.extrude([
        [-0.075 * scale, 0], [0.075 * scale, 0],
        [0.11 * scale, 0.19 * scale], [0.015 * scale, 0.34 * scale],
        [-0.08 * scale, 0.2 * scale],
      ], {
        at: p([s * 0.2, 2.81, 1.3]), x: [s, 0, 0], y: [s * 0.45, 1, -0.2],
        thickness: 0.065 * scale, color: camelPaint, bone: head, name: `camelEar${suffix}`,
      });
      b.extrude([
        [-0.035 * scale, 0.055 * scale], [0.045 * scale, 0.055 * scale],
        [0.05 * scale, 0.18 * scale], [0.008 * scale, 0.26 * scale],
        [-0.035 * scale, 0.18 * scale],
      ], {
        at: p([s * 0.2, 2.81, 1.337]), x: [s, 0, 0], y: [s * 0.45, 1, -0.2],
        thickness: 0.012 * scale, color: "#b47c60", bone: head, name: `camelInnerEar${suffix}`,
      });
    }
    for (let i = 0; i < 3; i++) {
      b.spike(p([(i - 1) * 0.08, 2.87, 1.36]), [0, 1, -0.2],
        0.15 * scale, 0.06 * scale, { color: C.camelDark, bone: head, sides: 5, name: "camelForelock" });
    }

    // Textile saddle panels hang below the hump rather than hiding it.
    for (const s of [-1, 1]) {
      const panel = b.extrude([
        [-0.58 * scale, 0], [0.48 * scale, 0],
        [0.42 * scale, -0.55 * scale], [-0.52 * scale, -0.55 * scale],
      ], {
        at: p([s * 0.455, 1.98, -0.12]),
        x: [0, 0, 1], y: [s * 0.16, 1, 0], thickness: 0.035 * scale,
        color: C.wine, bone: spine.joints[0], name: `saddleBlanket${suffix}`,
      });
      b.decal(panel, blanket, {
        at: p([s * 0.52, 1.72, -0.16]), dir: [s, 0, 0], up: [0, 1, 0],
        size: [0.94 * scale, 0.48 * scale], bone: spine.joints[0],
        lift: 0.003 * scale, name: `wovenSaddleMotif${suffix}`,
      });
      for (let j = 0; j < 6; j++) {
        const zz = -0.6 + j * 0.17;
        cr([s * 0.54, 1.43, zz], [s * 0.55, 1.31, zz], 0.012, C.gold, spine.joints[0], "saddleFringe");
        cb([s * 0.55, 1.29, zz], [0.035, 0.065, 0.035],
          j % 2 ? C.teal : C.coral, spine.joints[0], "saddleTassel", 0);
      }
      cr([s * 0.47, 1.93, -0.66], [s * 0.47, 1.4, -0.66],
        0.025, C.rope, spine.joints[0], "saddleStrap");
    }
    b.part(new THREE.CylinderGeometry(0.16 * scale, 0.16 * scale, 0.82 * scale, 8), C.teal, {
      at: p([0, 2.02, -0.67]), dir: [1, 0, 0], bone: hips, name: "rolledCaravanBlanket",
    });
    for (const s of [-1, 1]) {
      b.part(new THREE.TorusGeometry(0.163 * scale, 0.024 * scale, 5, 10), C.gold, {
        at: p([s * 0.25, 2.02, -0.67]), dir: [1, 0, 0], axis: "z", bone: hips, name: "bedrollTie",
      });
    }
    const halter = [
      p([-0.2, 2.76, 1.77]), p([0, 2.8, 1.84]), p([0.2, 2.76, 1.77]),
      p([0.2, 2.56, 1.76]), p([0, 2.49, 1.8]), p([-0.2, 2.56, 1.76]),
    ];
    b.sweep(polyline(halter, { closed: true }), 0.018 * scale, {
      color: C.coral, bone: head, sides: 5, name: `camelHalter${suffix}`,
    });
    cr([0.2, 2.68, 1.77], [0.25, 2.83, 1.34], 0.016, C.coral, head, "halterCheekStrap");
    cr([-0.2, 2.68, 1.77], [-0.25, 2.83, 1.34], 0.016, C.coral, head, "halterCheekStrap");
    cb([0, 2.42, 1.8], [0.065, 0.075, 0.065], C.gold, jaw, "halterBell", 0);
  }

  camel(4.25, 1.55, 1, "A", carpet);
  camel(6.5, -0.2, 0.82, "B", blueCarpet);

  function pot(x: number, z: number, scale: number, color: string) {
    const y = 0.45;
    b.lathe([
      [0.12 * scale, 0], [0.24 * scale, 0.06 * scale],
      [0.31 * scale, 0.29 * scale], [0.27 * scale, 0.51 * scale],
      [0.14 * scale, 0.64 * scale], [0.14 * scale, 0.72 * scale],
      [0.18 * scale, 0.75 * scale], [0.18 * scale, 0.79 * scale],
      [0.12 * scale, 0.79 * scale], [0.105 * scale, 0.69 * scale],
      [0.1 * scale, 0.6 * scale], [0.08 * scale, 0.08 * scale],
    ], { at: [x, y, z], color, segments: 10, bone: root, name: "waterJar" });
    b.part(new THREE.CylinderGeometry(0.105 * scale, 0.105 * scale, 0.015, 10), C.ink, {
      at: [x, y + 0.65 * scale, z], bone: root, name: "jarDarkInterior",
    });
    for (const h of [0.26, 0.38]) {
      b.part(new THREE.TorusGeometry(0.3 * scale, 0.017 * scale, 4, 10), C.cream, {
        at: [x, y + h * scale, z], rotation: [90, 0, 0], bone: root, name: "jarPaintedBand",
      });
    }
    for (const s of [-1, 1]) {
      b.sweep(catmull([
        [x + s * 0.15 * scale, y + 0.64 * scale, z],
        [x + s * 0.36 * scale, y + 0.59 * scale, z],
        [x + s * 0.36 * scale, y + 0.4 * scale, z],
        [x + s * 0.27 * scale, y + 0.34 * scale, z],
      ]), 0.035 * scale, { color, sides: 6, bone: root, name: "jarHandle" });
    }
  }
  pot(-5.5, -1.55, 1, C.coral);
  pot(-5.95, -1.05, 0.65, "#d9a064");
  pot(1.0, -2.55, 0.85, C.teal);
  pot(1.7, -2.7, 0.57, C.coral);

  // A few useful camp furnishings, kept low around the tent openings.
  box([-2.4, 0.66, -1.2], [0.72, 0.38, 0.52], C.wine, root, "travelChest");
  flatDrawing([-2.4, 0.67, -0.932], [0.6, 0.28], woven, [0, 0, 1], root, "chestWeave");
  for (const s of [-1, 1]) {
    box([-2.4 + s * 0.23, 0.67, -1.2], [0.055, 0.4, 0.54], C.gold, root, "chestBinding");
  }
  box([-2.4, 0.69, -0.921], [0.1, 0.12, 0.03], C.wood, root, "chestLatch");
  box([-4.3, 0.58, -0.7], [0.68, 0.22, 0.58], C.teal, root, "lowCampCushion", [0, -12, 0]);
  box([-3.4, 0.57, -0.35], [0.62, 0.2, 0.5], C.coral, root, "lowCampCushion", [0, 9, 0]);

  // Small hanging lantern beside, not across, the entrance.
  rod([-1.55, 0.44, -2.25], [-1.55, 2.28, -2.25], 0.045, C.wood, root, "lanternPost");
  rod([-1.55, 2.28, -2.25], [-1.83, 2.28, -2.25], 0.035, C.wood, root, "lanternArm");
  rod([-1.8, 2.28, -2.25], [-1.8, 2.06, -2.25], 0.016, C.rope, root, "lanternHanger");
  glow(box([-1.8, 1.87, -2.25], [0.2, 0.31, 0.2], "#ffd68a", root, "amberLanternGlass"), 0.65);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    rod([-1.8 + sx * 0.11, 1.69, -2.25 + sz * 0.11],
      [-1.8 + sx * 0.11, 2.04, -2.25 + sz * 0.11], 0.015, C.wood, root, "lanternFrame");
  }
  box([-1.8, 1.69, -2.25], [0.27, 0.045, 0.27], C.wood, root, "lanternBase");
  b.part(new THREE.ConeGeometry(0.2, 0.15, 4), C.gold, {
    at: [-1.8, 2.075, -2.25], rotation: [0, 45, 0], bone: root, name: "lanternRoof",
  });

  function reeds(x: number, z: number, size: number, seedOffset: number) {
    for (let i = 0; i < 7; i++) {
      const a = i * 2.4 + seedOffset;
      const dx = Math.cos(a), dz = Math.sin(a);
      const height = size * (0.55 + random() * 0.45);
      const start = [x + dx * 0.07, 0.43, z + dz * 0.07];
      b.slab([
        start,
        [x + dx * 0.16 + dz * 0.045, 0.43 + height * 0.55, z + dz * 0.16 - dx * 0.045],
        [x + dx * 0.31, 0.43 + height, z + dz * 0.31],
        [x + dx * 0.16 - dz * 0.045, 0.43 + height * 0.55, z + dz * 0.16 + dx * 0.045],
      ], { thickness: 0.012, color: i % 3 ? "#789753" : "#a7b56a", bone: root, name: "oasisReedBlade" });
    }
  }
  reeds(-4.85, 0.1, 0.72, 1);
  reeds(-3.7, 3.35, 0.6, 2);
  reeds(1.55, 0.2, 0.7, 4);
  reeds(-0.7, -1.25, 0.55, 7);
  reeds(-5.2, 2.4, 0.78, 3);

  [
    [-5.1, 0.5, 0.37], [-4.8, 0.95, 0.25], [-4.9, 2.9, 0.35],
    [-3.9, 3.65, 0.29], [1.65, 0.6, 0.34], [1.9, 0.15, 0.23],
    [0.8, -1.25, 0.3], [-0.3, -1.45, 0.24], [-6.7, 3.2, 0.31],
  ].forEach(([x, z, r], i) => {
    ball([x, 0.44 + r * 0.35, z], [r, r * 0.65, r * 0.8],
      i % 2 ? "#c89d75" : "#e2b787", root, "shoreStone", 0);
  });

  // Sand marks give the caravan a direction without adding another prop.
  for (let i = 0; i < 8; i++) {
    const z = 3.25 + i * 0.25;
    const x = 4.35 + Math.sin(i * 0.55) * 0.12;
    for (const s of [-1, 1]) {
      const g = new THREE.CircleGeometry(0.065, 6);
      g.rotateX(-Math.PI / 2);
      b.part(g, "#d3a16a", {
        at: [x + s * 0.17, 0.446, z + (s > 0 ? 0.09 : 0)],
        scale: [1, 1, 1.55], bone: root, name: "softCamelTrack",
      });
    }
  }

  return b.root;
}
