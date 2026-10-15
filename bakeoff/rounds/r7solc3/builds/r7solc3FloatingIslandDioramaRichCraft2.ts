import * as THREE from "three";
import {
  createBuilder,
  frame,
  catmull,
  bezier,
  rng,
  svg,
  paint,
  noise,
  mix,
} from "../../../../src/index";
import type { Paint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

/*
ART-DIRECTION CHANGES
1. Replace the visibly broken cloud surfaces with continuous, softly faceted
   billows, grouped into connected banks rather than isolated floor cushions.
2. Lighten the overwhelmingly dark cliff into blue, lavender and sunlit mineral
   strata. Keep its asymmetric fractures, but add deliberate embedded ruins.
3. Broaden and soften the waterfall: fewer bright wires, wider flowing ribbons,
   a foaming lip, and a mist bank that joins the surrounding clouds.
4. Make the suspended crystal a properly faceted jewel. Add a fine, incomplete
   celestial halo without filling the arch or obscuring its silhouette.
5. Preserve the golden trees and sanctuary composition; improve wind-shaped
   foliage, broken arch masonry, side-view ornament and restrained accents.
*/

export const meta = {
  name: "Sanctuary Above the Clouds",
  description:
    "A luminous anime-fantasy sky island, with golden wind-shaped trees, weathered celestial ruins, a suspended aether jewel and a waterfall dissolving into clouds.",
};

type P = number[];
type Tone = string | Paint;

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Sanctuary Above the Clouds",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(73129);
  const root = b.joint("island", { at: [0, 0, 0] });

  const C = {
    cream: "#f1e1b7",
    pale: "#fff0cc",
    gold: "#d9af57",
    goldLight: "#ffe6a1",
    teal: "#286b74",
    darkTeal: "#244858",
    moss: "#438a78",
    cyan: "#68e4df",
    ice: "#d2fff4",
    water: "#70c9ce",
    trunk: "#73524a",
    barkLight: "#b08158",
    leaf: "#e7b94f",
    leafLight: "#ffdd7c",
    leafOrange: "#cb8544",
    white: "#f5fbff",
    cloud: "#e0ecfa",
  };

  const cliffPaint = paint((p, n) => {
    const field = noise(p, 0.85, 18);
    const strata = Math.sin(
      p.y * 7.3 + p.x * 0.48 + p.z * 0.36 + noise(p, 1.1, 42) * 1.5,
    );
    let col = mix("#7898b0", "#bfd0cc", 0.30 + field * 0.55);
    if (strata > 0.72) col = mix(col, "#e0dcc1", 0.26);
    if (strata < -0.84) col = mix(col, "#678ca5", 0.20);
    col = mix(col, "#d6decf", Math.max(0, n.y) * 0.30);
    if (p.y < 2.6) col = mix(col, "#8da6ce", 0.24);
    if (p.y > 4.05 && noise(p, 0.46, 43) > 0.49)
      col = mix(col, "#69a38d", 0.34);
    return col;
  });

  const stonePaint = paint((p, n) => {
    let col = mix("#b1b9ae", C.cream, 0.45 + noise(p, 0.42, 8) * 0.45);
    col = mix(col, C.pale, Math.max(0, n.y) * 0.28);
    if (p.y < 5.15 && n.y < 0.25)
      col = mix(col, "#6c9c8a", noise(p, 0.22, 29) * 0.26);
    return col;
  });

  const turfPaint = paint((p, n) => {
    let col = mix("#66a18a", "#bad799", noise(p, 0.64, 5));
    if (n.y < 0.4) col = mix(col, "#548777", 0.36);
    return col;
  });

  const woodPaint = paint((p, n) => {
    const streak = Math.sin(p.y * 2 + noise(p, 0.22, 24) * 12);
    return mix(
      C.trunk,
      C.barkLight,
      0.22 + 0.17 * streak + Math.max(0, n.y) * 0.2,
    );
  });

  const waterPaint = paint((p) => {
    const x = p.x + Math.sin(p.y * 1.8 + p.x * 5) * 0.028;
    const flowing = Math.sin(x * 23 + Math.sin(p.y * 1.1) * 0.20);
    let col = mix("#559fbe", "#9de9e6", 0.50 + flowing * 0.36);
    if (Math.sin(x * 57) > 0.94) col = mix(col, "#dbfff4", 0.30);
    if (p.y > 4.35) col = mix(col, "#c2faed", 0.22);
    return col;
  });

  const rune = svg(
    `<svg viewBox="0 0 100 260">
      <path d="M50 8L78 38L50 68L22 38Z" fill="none" stroke="#746745" stroke-width="9"/>
      <path d="M50 13L70 38L50 61L30 38Z M50 19V56 M36 38H64"
        fill="none" stroke="#a4fff0" stroke-width="4"/>
      <path d="M50 85V115L27 134L50 152L73 134 M27 109V134 M73 109V134
        M50 169V197 M31 180L50 197L69 180 M50 215L36 231L50 247L64 231Z"
        fill="none" stroke="#857a52" stroke-width="9" stroke-linejoin="round"/>
      <path d="M50 85V115L27 134L50 152L73 134 M27 109V134 M73 109V134
        M50 169V197 M31 180L50 197L69 180 M50 215L36 231L50 247L64 231Z"
        fill="none" stroke="#a4fff0" stroke-width="4" stroke-linejoin="round"/>
    </svg>`,
    { size: 512 },
  );

  const sun = svg(
    `<svg viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="86" fill="#245465" stroke="#d8b667" stroke-width="7"/>
      <circle cx="100" cy="100" r="73" fill="none" stroke="#c5ba82" stroke-width="2"/>
      <path d="M100 21L113 71L155 45L130 87L179 100L130 113L155 155L113 130
        L100 179L87 130L45 155L71 113L21 100L71 87L45 45L87 71Z"
        fill="#e7c66f" stroke="#183e54" stroke-width="4"/>
      <path d="M100 57L129 100L100 143L71 100Z" fill="#95f6df"
        stroke="#fff0b3" stroke-width="4"/>
      <path d="M100 72L115 100L100 128L85 100Z" fill="#258c9e"/>
      <circle cx="100" cy="100" r="6" fill="#f4fff0"/>
    </svg>`,
    { size: 512 },
  );

  const mosaic = svg(
    `<svg viewBox="0 0 400 400">
      <circle cx="200" cy="200" r="191" fill="#557f80" stroke="#f1deb0" stroke-width="9"/>
      <circle cx="200" cy="200" r="169" fill="#ced0b0" stroke="#a69969" stroke-width="6"/>
      <circle cx="200" cy="200" r="142" fill="#557f80" stroke="#f1deb0" stroke-width="4"/>
      <g fill="none" stroke="#d3c595" stroke-width="3">
        <path d="M200 10V58 M200 342V390 M10 200H58 M342 200H390
          M65 65L100 100 M300 300L335 335 M335 65L300 100 M100 300L65 335"/>
        <path d="M200 58L300 100L342 200L300 300L200 342L100 300L58 200L100 100Z"/>
      </g>
      <path d="M200 70L220 155L292 108L245 180L330 200L245 220L292 292L220 245
        L200 330L180 245L108 292L155 220L70 200L155 180L108 108L180 155Z"
        fill="#e5d39a" stroke="#2a6570" stroke-width="6"/>
      <path d="M200 126L247 200L200 274L153 200Z" fill="#6daea3"
        stroke="#f6e8b6" stroke-width="5"/>
      <path d="M200 159L224 200L200 241L176 200Z" fill="#b9f5db"/>
      <g fill="none" stroke="#7b8b7e" stroke-width="3">
        <path d="M44 215L91 224L102 252 M296 92L278 120L291 145
          M214 343L229 317L250 311 M154 29L160 52L143 72"/>
      </g>
    </svg>`,
    { size: 768 },
  );

  const trimTexture = svg(
    `<svg viewBox="0 0 360 64">
      <rect width="360" height="64" fill="#286270"/>
      <path d="M0 7H360 M0 57H360" stroke="#e9ce82" stroke-width="5"/>
      <g fill="none" stroke="#d7bc74" stroke-width="4">
        <path d="M-30 32L0 14L30 32L0 50Z M30 32L60 14L90 32L60 50Z
          M90 32L120 14L150 32L120 50Z M150 32L180 14L210 32L180 50Z
          M210 32L240 14L270 32L240 50Z M270 32L300 14L330 32L300 50Z
          M330 32L360 14L390 32L360 50Z"/>
      </g>
      <g fill="#a8e9cb">
        <path d="M0 25L7 32L0 39L-7 32Z M60 25L67 32L60 39L53 32Z
          M120 25L127 32L120 39L113 32Z M180 25L187 32L180 39L173 32Z
          M240 25L247 32L240 39L233 32Z M300 25L307 32L300 39L293 32Z"/>
      </g>
    </svg>`,
    { size: 768 },
  );

  const leafTexture = svg(
    `<svg viewBox="0 0 80 112">
      <path d="M40 108C39 88 3 76 7 44C10 24 31 10 44 3
        C46 19 79 30 74 58C70 86 44 87 40 108Z"
        fill="#ffda70" stroke="#b78437" stroke-width="3"/>
      <path d="M40 103Q49 61 44 13 M44 69L18 49 M47 49L64 35
        M43 84L64 66" fill="none" stroke="#fff1aa" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  const grassTexture = svg(
    `<svg viewBox="0 0 100 120">
      <path d="M13 120L9 50L33 97L27 18L49 88L60 2L68 87L91 34L81 120Z"
        fill="#7ebc84"/>
      <path d="M30 120L27 58L48 112L60 34L61 120 M72 120L85 72L79 120Z"
        fill="#cee3a0"/>
    </svg>`,
    { size: 256 },
  );

  const flowerTexture = svg(
    `<svg viewBox="0 0 100 128">
      <path d="M48 128L52 46 M49 101Q18 100 21 77Q44 78 49 101
        M50 84Q81 82 79 61Q57 62 50 84"
        fill="#64a78c" stroke="#3c8276" stroke-width="3"/>
      <g fill="#eef9df" stroke="#b4dfd3" stroke-width="2">
        <ellipse cx="50" cy="28" rx="12" ry="22"/>
        <ellipse cx="50" cy="28" rx="12" ry="22" transform="rotate(72 50 43)"/>
        <ellipse cx="50" cy="28" rx="12" ry="22" transform="rotate(144 50 43)"/>
        <ellipse cx="50" cy="28" rx="12" ry="22" transform="rotate(216 50 43)"/>
        <ellipse cx="50" cy="28" rx="12" ry="22" transform="rotate(288 50 43)"/>
      </g>
      <circle cx="50" cy="43" r="11" fill="#f0c866"/>
      <circle cx="47" cy="40" r="4" fill="#fff2b8"/>
    </svg>`,
    { size: 256 },
  );

  const crackTexture = svg(
    `<svg viewBox="0 0 128 200">
      <path d="M80 0L67 39L79 67L48 91L54 123L31 158L39 200
        M76 66L104 74L128 65 M53 122L81 137L85 163
        M49 91L21 84L0 96"
        fill="none" stroke="#758c89" stroke-width="4" stroke-linejoin="bevel"/>
      <path d="M84 0L71 39L83 67 M58 125L35 160L43 200"
        fill="none" stroke="#fff0ce" stroke-width="2"/>
    </svg>`,
    { size: 256 },
  );

  const bannerTexture = svg(
    `<svg viewBox="0 0 160 360">
      <path d="M4 3H156V279L110 340L80 312L48 355L4 300Z"
        fill="#276777" stroke="#e9cf8c" stroke-width="7"/>
      <path d="M17 17H143V274L109 319L80 292L48 332L17 295Z"
        fill="none" stroke="#92bbb0" stroke-width="3"/>
      <path d="M29 38H131 M29 57H131 M29 241H131"
        stroke="#e9cf8c" stroke-width="5"/>
      <path d="M80 81L91 125L129 106L107 145L145 159L106 174L124 210
        L90 190L80 230L68 190L33 211L53 174L16 159L54 145L33 109L69 126Z"
        fill="#e9cf8c"/>
      <path d="M80 121L104 159L80 196L57 159Z" fill="#b4efdc"/>
      <path d="M80 135L94 159L80 181L66 159Z" fill="#3c9299"/>
    </svg>`,
    { size: 512 },
  );

  function box(at: P, size: P, color: Tone, rotation: P = [0, 0, 0], name?: string) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at, rotation, bone: root, name,
    });
  }

  function rock(at: P, scale: P, color: Tone, spin = 0) {
    return b.part(new THREE.IcosahedronGeometry(1, 0), color, {
      at, scale, rotation: [11, spin, 8], bone: root, flat: true,
    });
  }

  function ball(at: P, scale: P, color: Tone, detail = 0) {
    return b.part(new THREE.IcosahedronGeometry(1, detail), color, {
      at, scale, bone: root, flat: true,
    });
  }

  // A continuous triangular topology avoids the broken polar patches visible
  // on the previous exported latitude/longitude cloud spheres.
  function cloudPuff(at: P, scale: P, color: string) {
    return glow(
      b.part(new THREE.IcosahedronGeometry(1, 2), color, {
        at,
        scale,
        bone: root,
        flat: false,
        name: "continuous_cloud_billow",
      }),
      0.22,
    );
  }

  function rod(a: P, end: P, radius: number, color: Tone) {
    return b.rod(a, end, radius, {
      color, bone: root, sides: 6, caps: "flat",
    });
  }

  function picture(
    at: P,
    size: P,
    texture: THREE.Texture,
    normal: P = [0, 0, 1],
    up: P = [0, 1, 0],
    luminous = false,
  ) {
    const part = b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
      at, bone: root, dir: normal, up, axis: "z", texture,
    });
    if (luminous) glow(part, 0.48);
    return part;
  }

  function ring(
    at: P,
    radius: number,
    tube: number,
    color: Tone,
    normal: P = [0, 1, 0],
    arc = Math.PI * 2,
  ) {
    return b.part(new THREE.TorusGeometry(radius, tube, 5, 40, arc), color, {
      at, bone: root, dir: normal, axis: "z",
    });
  }

  function triangleGeometry(vertices: number[], reverse = false) {
    if (reverse) {
      for (let i = 0; i < vertices.length; i += 9) {
        for (let k = 0; k < 3; k++) {
          const saved = vertices[i + 3 + k];
          vertices[i + 3 + k] = vertices[i + 6 + k];
          vertices[i + 6 + k] = saved;
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }

  function convexPart(points: P[], faces: number[][], color: Tone, name: string) {
    const center = new THREE.Vector3();
    points.forEach((p) => center.add(new THREE.Vector3(p[0], p[1], p[2])));
    center.divideScalar(points.length);
    const vertices: number[] = [];
    for (const face of faces) {
      for (let i = 1; i < face.length - 1; i++) {
        const a = new THREE.Vector3(...(points[face[0]] as [number, number, number]));
        const c = new THREE.Vector3(...(points[face[i + 1]] as [number, number, number]));
        const d = new THREE.Vector3(...(points[face[i]] as [number, number, number]));
        const normal = d.clone().sub(a).cross(c.clone().sub(a));
        const outward = a.clone().add(d).add(c).multiplyScalar(1 / 3).sub(center);
        if (normal.dot(outward) > 0) vertices.push(...a.toArray(), ...d.toArray(), ...c.toArray());
        else vertices.push(...a.toArray(), ...c.toArray(), ...d.toArray());
      }
    }
    return b.part(triangleGeometry(vertices), color, {
      at: [0, 0, 0], bone: root, flat: true, name,
    });
  }

  function crystal(at: P, radius: number, height: number, color: string) {
    const [x, y, z] = at;
    const points: P[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      points.push([x + Math.cos(a) * radius, y, z + Math.sin(a) * radius]);
    }
    const vertices: number[] = [];
    for (let i = 0; i < 6; i++) {
      const a = points[i];
      const next = points[(i + 1) % 6];
      vertices.push(
        ...next, ...a, x, y + height * 0.68, z,
        ...a, ...next, x, y - height * 0.32, z,
      );
    }
    return b.part(triangleGeometry(vertices), color, {
      at: [0, 0, 0], bone: root, flat: true, name: "aether_crystal",
    });
  }

  // Irregular rings create one closed, asymmetric suspended landmass.
  const N = 13;
  const radii = Array.from({ length: N }, () => 0.92 + random() * 0.16);
  const levels = [
    [1.30, 0.20, -0.68, -0.12],
    [1.91, 0.86, -0.51, -0.18],
    [2.46, 1.96, -0.31, -0.14],
    [3.17, 2.91, 0.03, 0.02],
    [4.12, 3.64, 0.00, 0.00],
    [4.51, 3.85, 0.00, 0.00],
  ];
  const shell: P[][] = levels.map(([y, r, ox, oz], k) =>
    Array.from({ length: N }, (_, i) => {
      const a = (i / N) * Math.PI * 2;
      const fracture = k > 0 && k < 5 ? 1 + Math.sin(i * 2.1 + k * 0.8) * 0.085 : 1;
      const irregularY = k === 0 || k === levels.length - 1 ? 0 : (random() - 0.5) * 0.46;
      return [
        Math.cos(a) * r * radii[i] * fracture + ox,
        y + irregularY,
        Math.sin(a) * r * radii[i] * 0.83 * fracture + oz,
      ];
    }),
  );
  const cliffVertices: number[] = [];
  const rim: P[] = [];
  for (let j = 0; j < shell.length - 1; j++) {
    for (let i = 0; i < N; i++) {
      const k = (i + 1) % N;
      cliffVertices.push(
        ...shell[j][i], ...shell[j + 1][k], ...shell[j + 1][i],
        ...shell[j][i], ...shell[j][k], ...shell[j + 1][k],
      );
    }
  }
  for (let i = 0; i < N; i++) {
    const k = (i + 1) % N;
    cliffVertices.push(
      ...shell[0][k], ...shell[0][i], -0.68, 1.25, -0.12,
      ...shell[5][i], ...shell[5][k], 0, 4.51, 0,
    );
    rim.push([shell[5][i][0], 4.60, shell[5][i][2]]);
  }
  const cliff = b.part(triangleGeometry(cliffVertices, true), cliffPaint, {
    bone: root, at: [0, 0, 0], flat: true, name: "great_suspended_crag",
  });
  const turf = b.slab(rim.slice().reverse(), {
    color: turfPaint, thickness: 0.20, bone: root, name: "grassy_island_crown",
  });

  function cliffButtress(index: number, length: number, width: number) {
    const a = ((index + 0.48) / N) * Math.PI * 2;
    const radial = new THREE.Vector3(Math.cos(a), 0, Math.sin(a) * 0.83);
    const tangent = new THREE.Vector3(-Math.sin(a), 0, Math.cos(a));
    const r = 3.45 + Math.sin(index * 2.4) * 0.14;
    const top = 4.37 - (index % 3) * 0.09;
    const positions: P[] = [];
    for (let layer = 0; layer < 2; layer++) {
      const rr = layer === 0 ? r : r - length * 0.66;
      const yy = layer === 0 ? top : top - length;
      const w = width * (layer === 0 ? 1 : 0.43);
      for (const [side, depth] of [[-1, -0.20], [1, -0.20], [1, 0.32], [-1, 0.32]]) {
        const p = radial.clone().multiplyScalar(rr + depth).addScaledVector(tangent, side * w * 0.5);
        positions.push([p.x, yy + (side === 1 ? -0.10 : 0.05), p.z]);
      }
    }
    convexPart(
      positions,
      [[0, 1, 2, 3], [4, 7, 6, 5], [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]],
      cliffPaint,
      `fractured_cliff_${index}`,
    );
  }

  for (let i = 0; i < N; i++) {
    if (i === 2 || i === 3) continue;
    cliffButtress(i, 1.05 + random() * 1.45, 0.65 + random() * 0.56);
  }

  for (const info of [
    [-3.16, 3.92, 0.93, 0.66, 0.25, 0.39],
    [-2.32, 3.53, 1.74, 0.66, 0.19, 0.42],
    [2.86, 3.77, 0.73, 0.56, 0.22, 0.44],
    [1.92, 3.27, -1.92, 0.59, 0.18, 0.41],
    [-1.88, 4.19, -2.27, 0.55, 0.20, 0.48],
  ]) rock(info.slice(0, 3), info.slice(3), cliffPaint, random() * 160);

  for (const p of [
    [-2.59, 3.04, 0.85, 0.42, 1.28],
    [2.45, 2.92, 0.32, 0.40, 1.51],
    [-1.54, 2.10, -0.71, 0.34, 1.27],
    [0.45, 2.40, -1.66, 0.34, 1.12],
  ]) {
    b.part(new THREE.ConeGeometry(p[3], p[4], 5), cliffPaint, {
      at: [p[0], p[1], p[2]], bone: root,
      rotation: [180, p[0] * 27, 0], flat: true, name: "hanging_stone_spur",
    });
  }

  const cliffSurface = b.surface(cliff);
  for (const target of [
    [-2.15, 2.65, 1.40], [2.25, 2.90, 0.85], [-1.25, 3.20, 2.05],
  ]) {
    const hit = cliffSurface.nearest(target);
    for (let i = 0; i < 3; i++) {
      const h = 0.31 + random() * 0.25;
      const p = hit.at.clone().addScaledVector(hit.n, 0.045);
      p.x += (i - 1) * 0.13;
      p.y += h * 0.17;
      glow(crystal([p.x, p.y, p.z], 0.07 + random() * 0.025, h,
        i === 1 ? "#b9f9e9" : "#5fc7ca"), 0.30);
    }
  }

  // Half-buried celestial masonry ties the geology to the sanctuary above.
  for (const az of [-52, 104, 174]) {
    const hit = cliffSurface.around([0, 3.25, 0]).at(az, 4);
    if (!hit) continue;
    const plate = b.stick(
      new THREE.BoxGeometry(0.47, 0.105, 0.94),
      stonePaint,
      hit,
      { embed: 0.45, flow: [0, 1, 0], name: "embedded_celestial_tablet" },
    );
    const face = plate.at.clone().addScaledVector(hit.n, 0.063);
    b.decal(plate, rune, {
      at: face, dir: hit.n, up: [0, 1, 0],
      size: [0.29, 0.71], segments: 4, lift: 0.003, bone: root,
    });
  }

  const GX = -0.72;
  const GZ = -0.91;

  b.part(new THREE.CylinderGeometry(1.49, 1.60, 0.20, 12), stonePaint, {
    bone: root, at: [GX, 4.79, -0.22], name: "sanctuary_dais",
  });
  b.part(new THREE.CylinderGeometry(1.36, 1.40, 0.075, 12), C.cream, {
    bone: root, at: [GX, 4.92, -0.22],
  });
  picture([GX, 4.962, -0.22], [2.55, 2.55], mosaic, [0, 1, 0], [0, 0, -1]);
  ring([GX, 4.97, -0.22], 1.34, 0.017, C.gold);

  for (let i = 0; i < 3; i++) {
    box([GX, 4.71 + i * 0.065, 1.41 - i * 0.27],
      [1.54 - i * 0.09, 0.16, 0.35], stonePaint, [0, 0, 0], `sanctuary_step_${i + 1}`);
    rod(
      [GX - 0.66 + i * 0.035, 4.797 + i * 0.065, 1.56 - i * 0.27],
      [GX + 0.66 - i * 0.035, 4.797 + i * 0.065, 1.56 - i * 0.27],
      0.012, C.gold,
    );
  }
  for (let i = 0; i < 6; i++) {
    box([GX - 0.13 + Math.sin(i * 1.8) * 0.14, 4.718, 1.85 + i * 0.22],
      [0.56 + random() * 0.17, 0.075, 0.21], stonePaint,
      [0, (random() - 0.5) * 14, 0]);
  }

  const springY = 7.18;
  const archR = 1.18;
  const pillarXs = [GX - archR, GX + archR];

  for (let side = 0; side < 2; side++) {
    const x = pillarXs[side];
    box([x, 5.08, GZ], [0.86, 0.26, 0.90], stonePaint);
    box([x, 5.26, GZ], [0.69, 0.13, 0.74], C.pale);
    const shaft = box([x, 6.13, GZ], [0.53, 1.78, 0.57], stonePaint);
    for (const facing of [1, -1]) {
      box([x, 6.16, GZ + facing * 0.296], [0.30, 1.42, 0.025], C.teal);
      for (const s of [-1, 1])
        box([x + s * 0.225, 6.16, GZ + facing * 0.30], [0.045, 1.65, 0.043], C.gold);
      picture([x, 6.16, GZ + facing * 0.315], [0.27, 1.26],
        rune, [0, 0, facing], [0, 1, 0], true);
      for (const h of [5.37, 6.92])
        box([x, h, GZ + facing * 0.30], [0.60, 0.06, 0.055], C.goldLight);
    }

    // Narrow side moldings make the arch read as carved architecture in profile.
    for (const s of [-1, 1]) {
      box([x + s * 0.273, 6.13, GZ], [0.023, 1.51, 0.075], C.gold);
      box([x + s * 0.273, 5.53, GZ], [0.028, 0.10, 0.32], C.goldLight);
    }
    box([x, 7.05, GZ], [0.66, 0.16, 0.72], C.gold);
    box([x, 7.18, GZ], [0.83, 0.16, 0.83], stonePaint);
    picture([x, 7.105, GZ + 0.372], [0.63, 0.11], trimTexture);
    picture([x, 7.105, GZ - 0.372], [0.63, 0.11], trimTexture, [0, 0, -1]);
    picture([x + (side === 0 ? -0.13 : 0.13), 5.80, GZ + 0.291],
      [0.20, 0.49], crackTexture);
    b.decal(shaft, crackTexture, {
      at: [x + (side === 0 ? -0.267 : 0.267), 6.55, GZ],
      dir: [side === 0 ? -1 : 1, 0, 0],
      size: [0.35, 0.56], segments: 4, bone: root,
    });
    for (const yy of [5.35, 6.96])
      box([x, yy, GZ + 0.35], [0.105, 0.105, 0.055], C.goldLight, [0, 0, 45]);
  }

  for (let i = 0; i < 11; i++) {
    const a0 = (i / 11) * Math.PI + 0.009;
    const a1 = ((i + 1) / 11) * Math.PI - 0.009;
    const outer = archR + 0.38 + (i === 2 ? 0.095 : i === 8 ? -0.085 : 0);
    const inner = archR - 0.24;
    const am = (a0 + a1) * 0.5;
    const chipped = i === 2 || i === 7 || i === 9;
    const outline: number[][] = [
      [Math.cos(a0) * inner, Math.sin(a0) * inner],
      [Math.cos(a0) * outer, Math.sin(a0) * outer],
    ];
    if (chipped) {
      outline.push(
        [Math.cos(am - 0.025) * outer, Math.sin(am - 0.025) * outer],
        [Math.cos(am) * (outer - 0.14), Math.sin(am) * (outer - 0.14)],
        [Math.cos(am + 0.055) * outer, Math.sin(am + 0.055) * outer],
      );
    }
    outline.push(
      [Math.cos(a1) * outer, Math.sin(a1) * outer],
      [Math.cos(a1) * inner, Math.sin(a1) * inner],
    );
    b.extrude(outline, {
      at: [GX, springY, GZ], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.60, color: i === 5 ? C.gold : stonePaint,
      bone: root, name: `arch_voussoir_${i + 1}`,
    });
  }

  for (const facing of [1, -1]) {
    for (const r of [archR - 0.16, archR + 0.29]) {
      const pts: P[] = [];
      for (let i = 0; i <= 24; i++) {
        const a = (i / 24) * Math.PI;
        pts.push([GX + Math.cos(a) * r, springY + Math.sin(a) * r, GZ + facing * 0.313]);
      }
      b.sweep(pts, 0.019, { color: C.gold, bone: root, sides: 6, caps: "flat" });
    }
  }
  for (const p of [[GX - 0.87, 8.08, GZ + 0.306], [GX + 0.98, 7.76, GZ + 0.306]])
    picture(p, [0.15, 0.38], crackTexture);

  const crestY = springY + archR + 0.08;
  for (const facing of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.11, 12), C.gold, {
      at: [GX, crestY, GZ + facing * 0.34], dir: [0, 0, facing], bone: root,
    });
    picture([GX, crestY, GZ + facing * 0.401], [0.61, 0.61], sun, [0, 0, facing]);
  }
  rock([GX - 0.52, 8.59, GZ], [0.24, 0.15, 0.32], stonePaint, 21);
  rock([GX + 0.25, 8.69, GZ - 0.06], [0.21, 0.12, 0.29], stonePaint, 92);

  // Explicit facet colors preserve the jewel's structure even when emissive.
  const jewelY = 6.39;
  const jewelZ = GZ + 0.08;
  const jewelColors = ["#b6fff0", "#70e5d8", "#2aafaF", "#3ec9bf", "#76e8d8", "#dcfff0"];
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3;
    const next = (i + 1) * Math.PI / 3;
    const p0 = [GX + Math.cos(a) * 0.25, jewelY, jewelZ + Math.sin(a) * 0.25];
    const p1 = [GX + Math.cos(next) * 0.25, jewelY, jewelZ + Math.sin(next) * 0.25];
    glow(
      b.part(triangleGeometry([
        ...p1, ...p0, GX, jewelY + 0.80, jewelZ,
        ...p0, ...p1, GX, jewelY - 0.38, jewelZ,
      ]), jewelColors[i], {
        at: [0, 0, 0], bone: root, flat: true, name: `aether_jewel_facet_${i}`,
      }),
      0.48,
    );
  }

  // A broken celestial diagram frames the jewel, without crossing its front.
  for (const [start, end] of [[-28, 76], [106, 205], [240, 298]]) {
    const pts: P[] = [];
    for (let i = 0; i <= 18; i++) {
      const a = (start + (end - start) * i / 18) * Math.PI / 180;
      pts.push([GX + Math.cos(a) * 0.70, jewelY + 0.20 + Math.sin(a) * 0.70, GZ - 0.20]);
    }
    b.sweep(pts, 0.013, { color: C.goldLight, bone: root, sides: 5, caps: "round" });
  }
  for (const angle of [18, 128, 272]) {
    const a = angle * Math.PI / 180;
    box([GX + Math.cos(a) * 0.70, jewelY + 0.20 + Math.sin(a) * 0.70, GZ - 0.20],
      [0.085, 0.085, 0.035], C.goldLight, [0, 0, 45]);
  }

  ring([GX, 6.15, jewelZ], 0.43, 0.025, C.gold, [0.18, 1, 0.30]);
  glow(ring([GX, 6.15, jewelZ], 0.50, 0.010, C.cyan, [0.18, 1, 0.30]), 0.30);
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 0.4;
    glow(ball(
      [GX + Math.cos(a) * 0.46, 6.16 + Math.sin(a) * 0.10, jewelZ + Math.sin(a) * 0.46],
      [0.027, 0.027, 0.027], C.ice), 0.6);
  }

  for (const side of [-1, 1]) {
    const x = GX + side * 1.73;
    for (let row = 0; row < 3; row++) {
      for (let k = 0; k < (row === 2 ? 1 : 2); k++) {
        box([x + side * k * 0.53, 4.86 + row * 0.29, -1.40],
          [0.51, 0.27, 0.45], stonePaint,
          [0, (random() - 0.5) * 5, row === 2 ? side * 7 : 0]);
      }
    }
    box([x + side * 0.20, 4.82, -1.10], [1.10, 0.20, 0.68], stonePaint);
    rock([x + side * 0.45, 5.24, -1.40], [0.29, 0.17, 0.26], stonePaint, 49);
  }

  box([-1.76, 4.84, -2.28], [0.65, 0.24, 0.67], stonePaint);
  box([-1.76, 5.20, -2.28], [0.43, 0.55, 0.44], stonePaint);
  b.extrude(
    [[-0.22, 0], [0.22, 0], [0.22, 0.37], [0.08, 0.30], [-0.03, 0.45], [-0.22, 0.34]],
    {
      at: [-1.76, 5.45, -2.28], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.44, bone: root, color: stonePaint,
    },
  );
  box([-2.66, 4.83, 0.08], [0.62, 0.22, 0.64], stonePaint);
  box([-2.66, 5.10, 0.08], [0.43, 0.35, 0.45], stonePaint, [0, 9, -4]);
  box([-2.49, 4.88, 0.78], [0.48, 0.44, 1.07], stonePaint, [0, -22, 0]);
  box([-2.32, 5.03, 1.21], [0.64, 0.14, 0.62], C.cream, [19, -22, 0]);

  for (let i = 0; i < 5; i++)
    rock([-2.65 + random() * 0.90, 4.76 + random() * 0.04, 0.40 + random() * 1.05],
      [0.10 + random() * 0.11, 0.07 + random() * 0.06, 0.11 + random() * 0.12],
      stonePaint, random() * 180);

  rod([-2.21, 6.94, -0.98], [-2.94, 6.94, -0.98], 0.025, C.gold);
  ball([-2.96, 6.94, -0.98], [0.045, 0.045, 0.045], C.goldLight);
  b.cards([frame([-2.64, 6.93, -0.98], [0, 1, 0])], bannerTexture, {
    size: [0.49, 1.14], lean: 171, bend: -24, flow: [0, 0, 1], sink: 0, bone: root,
  });

  const poolOutline: P[] = [
    [0.40, 4.72, 0.81], [0.80, 4.72, 0.48], [1.56, 4.72, 0.47],
    [2.09, 4.72, 0.83], [2.13, 4.72, 1.43], [1.74, 4.72, 1.85],
    [1.70, 4.72, 2.75], [1.80, 4.72, 3.00], [0.68, 4.72, 3.07],
    [0.75, 4.72, 2.66], [0.99, 4.72, 1.91], [0.39, 4.72, 1.52],
  ];
  b.slab(poolOutline.slice().reverse(), {
    thickness: 0.06, color: C.darkTeal, bone: root, name: "spring_pool_basin",
  });
  const waterOutline = poolOutline.map((p) => [
    1.24 + (p[0] - 1.24) * 0.94, 4.758, 1.20 + (p[2] - 1.20) * 0.98,
  ]);
  b.slab(waterOutline.slice().reverse(), {
    thickness: 0.022, color: C.water, bone: root, name: "turquoise_spring",
  });
  for (let i = 0; i < 11; i++) {
    const p = poolOutline[i];
    if (p[2] > 2.6) continue;
    rock([p[0], 4.77, p[2]], [0.19, 0.105, 0.17], stonePaint, i * 27);
  }
  for (const rr of [0.20, 0.34, 0.52])
    ring([1.33, 4.781, 1.06], rr, 0.008, "#b9eddd", [0, 1, 0], Math.PI * 1.63);
  for (let i = 0; i < 5; i++) {
    const z = 1.73 + i * 0.22;
    b.sweep(bezier([1.12, 4.784, z], [1.31, 4.787, z + 0.045], [1.48, 4.784, z + 0.025]),
      0.007, { color: "#b9eddd", bone: root, sides: 4, caps: "flat" });
  }

  const leftFall: P[] = [
    [0.70, 4.77, 2.86], [0.70, 4.68, 3.16], [0.72, 4.35, 3.34],
    [0.76, 3.48, 3.40], [0.81, 2.40, 3.44], [0.78, 1.43, 3.53], [0.53, 1.00, 3.67],
  ];
  const rightFall: P[] = [
    [1.78, 4.77, 2.86], [1.79, 4.68, 3.16], [1.82, 4.35, 3.34],
    [1.83, 3.48, 3.40], [1.80, 2.40, 3.44], [1.87, 1.43, 3.53], [2.12, 1.00, 3.67],
  ];
  b.membrane(leftFall, rightFall, {
    color: waterPaint, thickness: 0.045, rows: 12, cols: 20,
    bone: root, name: "falling_skywater",
  });

  for (let i = 0; i < 3; i++) {
    const x = [0.79, 1.18, 1.70][i];
    const w = [0.034, 0.073, 0.043][i];
    const ribbonEdge = (side: number) => catmull([
      [x + w * side, 4.71, 3.17],
      [x + w * side + 0.015, 4.32, 3.375],
      [x + w * side + 0.045, 3.18, 3.455],
      [x + w * side + 0.020, 2.01, 3.505],
      [x + w * side * 1.8 + (i - 1) * 0.13, 1.08, 3.68],
    ]);
    b.membrane(ribbonEdge(-1), ribbonEdge(1), {
      color: i === 1 ? "#b9f8ec" : "#dbfff4",
      thickness: 0.008, rows: 2, cols: 18, bone: root,
    });
  }

  for (let i = 0; i < 9; i++) {
    cloudPuff(
      [0.77 + i * 0.12, 4.765 + random() * 0.015, 3.10 + random() * 0.08],
      [0.085, 0.022, 0.063], i % 3 ? C.ice : C.white,
    );
  }
  for (let i = 0; i < 7; i++) {
    const a = random() * Math.PI * 2;
    const d = 0.18 + random() * 0.48;
    cloudPuff(
      [1.32 + Math.cos(a) * d, 1.03 + random() * 0.23, 3.59 + Math.sin(a) * d * 0.60],
      [0.24 + random() * 0.14, 0.26 + random() * 0.15, 0.26 + random() * 0.16],
      i % 3 === 0 ? C.cloud : C.white,
    );
  }
  for (let i = 0; i < 9; i++) {
    const y = 1.4 + random() * 2.3;
    const x = i % 2 ? 0.62 - random() * 0.10 : 1.94 + random() * 0.13;
    ball([x, y, 3.48 + random() * 0.18], [0.016, 0.042, 0.016], C.ice);
  }

  function tree(base: P, size: number, seed: number) {
    const r = rng(seed);
    const [x, y, z] = base;
    const pt = (dx: number, dy: number, dz: number): P => [
      x + dx * size, y + dy * size, z + dz * size,
    ];
    b.sweep(
      catmull([
        pt(0, -0.05, 0), pt(-0.16, 0.58, 0.03), pt(-0.12, 1.20, -0.05),
        pt(0.12, 1.89, 0), pt(0.29, 2.44, -0.08),
      ]),
      [0.26 * size, 0.22 * size, 0.16 * size, 0.10 * size, 0.026 * size],
      { color: woodPaint, bone: root, sides: 7, name: `tree_${seed}_trunk` },
    );
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      b.sweep(catmull([
        pt(-0.05, 0.31, 0),
        pt(Math.cos(a) * 0.27, 0.08, Math.sin(a) * 0.27),
        pt(Math.cos(a) * 0.64, 0.015, Math.sin(a) * 0.57),
      ]), [0.12 * size, 0.07 * size, 0.014 * size],
      { color: woodPaint, bone: root, sides: 6 });
    }

    const foliage: ReturnType<typeof ball>[] = [];
    const branches = [
      [-0.88, 1.81, 0.03], [0.89, 2.09, 0.12], [-0.45, 2.55, -0.42],
      [0.65, 2.77, -0.27], [0.13, 2.88, 0.34], [-0.66, 2.20, 0.62],
    ];
    for (let i = 0; i < branches.length; i++) {
      const [dx, dy, dz] = branches[i];
      b.sweep([
        pt(-0.09 + i * 0.025, 0.97 + i * 0.19, -0.01),
        pt(dx * 0.62, dy - 0.35, dz * 0.68), pt(dx, dy, dz),
      ], [0.105 * size, 0.060 * size, 0.018 * size],
      { color: woodPaint, bone: root, sides: 6 });
      b.sweep([pt(dx * 0.60, dy - 0.36, dz * 0.67), pt(dx + 0.28, dy + 0.10, dz - 0.22)],
        [0.045 * size, 0.008 * size], { color: woodPaint, bone: root, sides: 5 });
      foliage.push(ball(pt(dx, dy + 0.13, dz),
        [(0.72 + r() * 0.13) * size, (0.32 + r() * 0.09) * size, 0.56 * size],
        i % 3 === 0 ? C.leafOrange : C.leaf, 1));
      foliage.push(ball(pt(dx + 0.02, dy + 0.36, dz - 0.07),
        [0.58 * size, 0.25 * size, 0.45 * size],
        i % 2 ? C.leafLight : "#f2c65d"));
    }
    const leafHits = b.surface(foliage).scatter(64, {
      rng: rng(seed + 200), minDist: 0.15 * size, filter: (h) => h.n.y > -0.30,
    });
    b.cards(leafHits, leafTexture, {
      size: [0.13 * size, 0.23 * size], lean: 64, bend: 20, vary: 0.30,
      flow: [0.3, -0.4, 1], rng: rng(seed + 500), sink: 0.16,
    });
  }

  tree([2.36, 4.70, -1.08], 1.03, 28);
  tree([-2.76, 4.70, -0.63], 0.67, 59);

  for (const p of [
    [2.61, 4.78, 1.19], [2.82, 4.78, 0.62], [-2.26, 4.77, -2.05],
    [-1.94, 4.76, -2.30], [-2.58, 4.76, 1.64],
  ]) {
    ball(p, [0.35, 0.23, 0.30], C.moss);
    ball([p[0] + 0.17, p[1] + 0.13, p[2] - 0.05], [0.25, 0.18, 0.23], "#79b294");
  }

  const grassSurface = b.surface(turf);
  const grassHits = grassSurface.scatter(90, {
    rng: rng(74), minDist: 0.25,
    filter: (h) => {
      if (h.n.y < 0.8) return false;
      const p = h.at;
      if (p.x > 0.25 && p.x < 2.30 && p.z > 0.25) return false;
      if (Math.hypot(p.x - GX, p.z + 0.22) < 1.65) return false;
      if (p.x > -1.3 && p.x < -0.1 && p.z > 1.3) return false;
      return true;
    },
  });
  b.cards(grassHits, grassTexture, {
    size: [0.23, 0.28], cross: true, lean: 10,
    vary: 0.40, spin: 40, rng: rng(76), flow: [0, 0, 1],
  });
  const flowerHits = grassSurface.scatter(25, {
    rng: rng(272), minDist: 0.22,
    filter: (h) => h.n.y > 0.8 &&
      ((h.at.x < -1.5 && h.at.z > 0.7) || (h.at.x > 2.20 && h.at.z > -0.3)),
  });
  b.cards(flowerHits, flowerTexture, {
    size: [0.18, 0.29], lean: 0, cross: true,
    vary: 0.25, rng: rng(273), flow: [0, 0, 1],
  });

  function ivy(path: P[], leaves: number, leafSize: number) {
    const vine = catmull(path);
    b.sweep(vine, 0.014, { color: "#467d65", bone: root, sides: 5 });
    b.along(vine, leaves, (at) => {
      const t = at.t;
      const p = at.at;
      const side = Math.sin(t * leaves * Math.PI) > 0 ? 1 : -1;
      const x = p.x + side * leafSize * 0.42;
      b.slab([
        [p.x, p.y, p.z],
        [x - leafSize * 0.40, p.y + leafSize * 0.22, p.z + 0.04],
        [x, p.y + leafSize * 0.65, p.z + 0.08],
        [x + leafSize * 0.47, p.y + leafSize * 0.19, p.z + 0.045],
        [x, p.y - leafSize * 0.12, p.z + 0.025],
      ], {
        color: Math.floor(t * leaves) % 3 === 0 ? "#9bb982" : "#5b9679",
        thickness: 0.012, bone: root,
      });
    });
  }

  ivy([[-2.42, 4.74, -0.65], [-2.22, 5.16, -0.57], [-2.25, 5.62, -0.58], [-2.22, 6.10, -0.58]], 9, 0.17);
  ivy([[-2.24, 6.10, -0.58], [-2.15, 6.53, -0.57], [-2.18, 6.94, -0.55], [-2.39, 7.25, -0.55]], 7, 0.13);
  ivy([[0.81, 4.75, -1.15], [0.96, 5.07, -1.12], [1.16, 5.35, -1.12]], 6, 0.18);
  for (const path of [
    [[-3.11, 4.65, 1.27], [-3.21, 4.20, 1.32], [-2.97, 3.68, 1.37]],
    [[2.80, 4.65, 1.51], [2.93, 4.22, 1.56], [2.72, 3.55, 1.60]],
    [[-0.72, 4.63, 2.94], [-0.75, 4.18, 3.01], [-0.67, 3.74, 2.87]],
  ]) ivy(path, 6, 0.15);

  const lx = 1.22;
  const lz = -2.15;
  box([lx, 4.84, lz], [0.58, 0.25, 0.58], stonePaint);
  box([lx, 5.06, lz], [0.39, 0.20, 0.39], stonePaint);
  box([lx, 5.22, lz], [0.55, 0.12, 0.55], C.gold);
  glow(box([lx, 5.48, lz], [0.30, 0.44, 0.30], "#c0ffdb"), 0.65);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1])
      box([lx + sx * 0.19, 5.47, lz + sz * 0.19], [0.055, 0.49, 0.055], C.teal);
  }
  box([lx, 5.74, lz], [0.55, 0.12, 0.55], C.gold);
  b.part(new THREE.ConeGeometry(0.44, 0.30, 4), stonePaint, {
    at: [lx, 5.94, lz], rotation: [0, 45, 0], bone: root, flat: true,
  });
  crystal([lx, 6.14, lz], 0.06, 0.20, C.goldLight);

  // Deliberately suspended remnant: its tiny ruin explains the floating rock.
  rock([-3.83, 3.04, -0.82], [0.43, 0.35, 0.34], cliffPaint, 32);
  rock([-3.81, 3.26, -0.82], [0.39, 0.07, 0.29], turfPaint);
  box([-3.83, 3.44, -0.82], [0.27, 0.35, 0.25], stonePaint, [0, 18, -9]);
  box([-3.85, 3.63, -0.82], [0.36, 0.10, 0.34], stonePaint, [0, 18, -9]);

  // Connected crescent banks: broad foundation volumes with smaller upper
  // lobes, open in front so the hovering cliff remains legible.
  const banks = [
    [-2.54, 0.68, -0.30, 1.24, 0.68, 0.99],
    [-1.10, 0.73, -1.09, 1.30, 0.73, 1.04],
    [0.55, 0.74, -1.17, 1.34, 0.74, 1.04],
    [2.06, 0.73, -0.55, 1.20, 0.73, 1.08],
    [2.55, 0.65, 0.63, 1.03, 0.65, 1.09],
    [-2.62, 0.60, 0.78, 1.06, 0.60, 0.96],
  ];
  for (let i = 0; i < banks.length; i++) {
    const [x, y, z, sx, sy, sz] = banks[i];
    cloudPuff([x, y, z], [sx, sy, sz], C.cloud);
    cloudPuff(
      [x - sx * 0.28, y + sy * 0.58, z - 0.08],
      [sx * 0.68, sy * 0.91, sz * 0.78],
      i % 2 ? "#edf6ff" : C.white,
    );
    cloudPuff(
      [x + sx * 0.40, y + sy * 0.25, z + 0.08],
      [sx * 0.65, sy * 0.80, sz * 0.75],
      "#e8f2fa",
    );
  }
  cloudPuff([-0.65, 1.27, -0.98], [1.18, 0.78, 0.97], "#e5eff8");
  cloudPuff([1.46, 1.21, -0.81], [1.01, 0.77, 0.94], "#eef7ff");

  // Mist and neighboring clouds now overlap, rather than forming a separate
  // pedestal at the bottom of the waterfall.
  cloudPuff([1.32, 0.58, 3.30], [1.10, 0.58, 0.84], C.cloud);
  cloudPuff([1.62, 0.94, 3.45], [0.67, 0.52, 0.61], C.white);
  cloudPuff([0.71, 0.79, 3.38], [0.61, 0.46, 0.57], "#edf8ff");
  cloudPuff([2.13, 0.56, 2.82], [0.72, 0.50, 0.79], "#e6f1fa");
  cloudPuff([2.57, 0.63, 1.94], [0.82, 0.55, 0.94], "#e8f2fa");
  cloudPuff([2.69, 1.00, 1.63], [0.53, 0.49, 0.64], C.white);

  b.cards([
    frame([3.30, 6.15, 0.16], [0.4, 1, 0.1]),
    frame([3.70, 5.40, 0.43], [-0.4, 1, 0.2]),
    frame([3.48, 4.72, 1.25], [0.3, 1, 0.4]),
    frame([-3.36, 5.44, 0.34], [-0.2, 1, 0.6]),
    frame([2.20, 6.30, 0.47], [0.6, 1, -0.1]),
  ], leafTexture, {
    size: [0.13, 0.23], lean: 60, bend: 20,
    flow: [0.1, -0.3, 1], spin: 25, rng: rng(944),
  });

  return b.root;
}
