import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  rng,
  svg,
  paint,
  mix,
  noise,
} from "../../../../src/index";
import type { Joint, Fill } from "../../../../src/index";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Aureate Dawn Phoenix",
  description:
    "A crimson-and-gold celestial phoenix with swept flame wings, a sculpted feather mantle, jade eyes, and five incandescent ribbon tails above an ancient sun seal.",
};

export default function build(): THREE.Object3D {
  /*
   * 1. Replace the repeated diamond-like feather pyramids with curved,
   *    ridged blades: less metallic armor, more living flame plumage.
   * 2. Restore a crimson-to-amber hierarchy, reserving pale gold for tips,
   *    quills and ornaments rather than making every feather equally yellow.
   * 3. Conceal the exposed wing spars and red web with seated feather layers;
   *    fan the outer primaries to break the straight, comb-like silhouette.
   * 4. Wrap the neck, shoulders and thighs in plumage, especially in side view.
   *    Broader brows and a feathered forehead frame the expressive jade eyes.
   * 5. Widen the flowing tails and give each a substantial flame-shaped end.
   *    Keep the low shrine and deliberately airborne embers.
   */
  const b = createBuilder({
    name: "AureateDawnPhoenix",
    detail: 0.8,
    paintSize: 2048,
  });
  const random = rng(83017);
  const V = (p: number[]) => new THREE.Vector3(p[0], p[1], p[2]);

  const C = {
    burgundy: "#652537",
    scarlet: "#e94c35",
    orange: "#ff963d",
    gold: "#edbb59",
    pale: "#ffe6a1",
    ivory: "#fff4cb",
    jade: "#75ead5",
    stoneEdge: "#142431",
  };
  const coat = cel("#ed6b35", "#ae3940");
  const deepCoat = cel("#d34a37", "#8c3040");
  const cream = cel("#ffe5a1", "#e79c4d");
  const gold = cel("#ffdc89", "#bd783e");
  const darkGold = cel("#d09a47", "#794438");
  const stone = paint((p, n) =>
    mix(n.y > 0.5 ? "#334b59" : "#172733", "#61717a", noise(p, 0.19, 5) * 0.22),
  );

  function featherDrawing(kind: "flight" | "covert" | "cream") {
    const palette =
      kind === "flight"
        ? ["#7e253e", "#d93a32", "#fb7934", "#ffdf86"]
        : kind === "covert"
          ? ["#912b3c", "#e44931", "#ff993e", "#ffe3a1"]
          : ["#b44d35", "#e78b41", "#ffcf73", "#fff0b5"];
    return svg(
      `<svg viewBox="0 0 100 240">
        <defs>
          <linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stop-color="${palette[0]}"/>
            <stop offset=".43" stop-color="${palette[1]}"/>
            <stop offset=".79" stop-color="${palette[2]}"/>
            <stop offset="1" stop-color="${palette[3]}"/>
          </linearGradient>
        </defs>
        <rect width="100" height="240" fill="url(#g)"/>
        <path d="M49 235 Q35 181 48 133 Q63 87 48 17"
          fill="none" stroke="#7d2940" stroke-width="7" opacity=".45"/>
        <path d="M50 235 Q37 179 50 132 Q65 84 50 15"
          fill="none" stroke="#ffd17a" stroke-width="3"/>
        <path d="M50 12 Q74 51 61 83 Q50 105 58 123
          Q36 109 44 83 Q49 64 50 12Z" fill="#ffe6a1"/>
        <path d="M49 20 Q56 57 49 80" fill="none" stroke="#fff7cc" stroke-width="3"/>
        <g fill="none" stroke="#ffb65f" stroke-width="2.2" opacity=".85">
          <path d="M44 198 Q25 179 12 157"/>
          <path d="M43 176 Q25 156 14 132"/>
          <path d="M47 151 Q31 134 24 111"/>
          <path d="M51 130 Q38 113 34 95"/>
          <path d="M47 202 Q70 189 89 165"/>
          <path d="M45 179 Q67 165 84 140"/>
          <path d="M49 155 Q70 140 79 115"/>
          <path d="M54 133 Q72 118 76 95"/>
        </g>
        <path d="M7 160 Q12 196 38 228 M93 160 Q86 199 59 229"
          fill="none" stroke="#f4974b" stroke-width="2"/>
      </svg>`,
      { size: 384 },
    );
  }
  const primaryTex = featherDrawing("flight");
  const covertTex = featherDrawing("covert");
  const creamTex = featherDrawing("cream");

  const eyeTex = svg(
    `<svg viewBox="0 0 120 100">
      <path d="M5 56 Q42 7 95 29 L117 14 L107 47 Q78 90 26 73Z" fill="#432439"/>
      <path d="M15 55 Q51 23 99 36 Q77 75 31 66Z" fill="#fff5d2"/>
      <path d="M39 34 Q63 23 83 34 L79 63 Q60 80 41 64Z" fill="#19767d"/>
      <path d="M42 47 Q61 58 80 44 L77 65 Q58 76 43 62Z" fill="#7df3d1"/>
      <ellipse cx="61" cy="49" rx="8" ry="20" fill="#24263a"/>
      <path d="M47 33 L58 32 L57 45 L46 44Z" fill="#fffdf0"/>
      <circle cx="73" cy="59" r="4" fill="#ffffff"/>
      <path d="M13 38 Q54 4 98 18" stroke="#ffe9b0" stroke-width="7"
        fill="none" stroke-linecap="round"/>
      <path d="M24 79 Q64 94 91 70" stroke="#fa9a52" stroke-width="4" fill="none"/>
    </svg>`,
    { size: 384 },
  );

  const sunTex = svg(
    `<svg viewBox="0 0 256 256">
      <g fill="none" stroke="#c49c59">
        <circle cx="128" cy="128" r="120" stroke-width="2"/>
        <circle cx="128" cy="128" r="110" stroke-width="2"/>
        <circle cx="128" cy="128" r="94" stroke-width="1.5"/>
        <circle cx="128" cy="128" r="78" stroke-width="1.5"/>
        <path d="M128 26 L146 81 L200 56 L175 110 L230 128 L175 146
          L200 200 L146 175 L128 230 L110 175 L56 200 L81 146
          L26 128 L81 110 L56 56 L110 81Z" stroke-width="2"/>
        <path d="M128 72 L144 112 L184 128 L144 144 L128 184 L112 144
          L72 128 L112 112Z" stroke-width="2"/>
        <circle cx="128" cy="128" r="23" stroke-width="2"/>
      </g>
      <g fill="#d5b16a">
        ${Array.from({ length: 16 }, (_, i) => {
          const a = (i * Math.PI) / 8;
          const x = 128 + Math.sin(a) * 102;
          const y = 128 + Math.cos(a) * 102;
          return `<path d="M${x} ${y - 5} l3 5 l-3 5 l-3 -5Z"/>`;
        }).join("")}
      </g>
    </svg>`,
    { size: 512 },
  );

  const emblemTex = svg(
    `<svg viewBox="0 0 100 160">
      <g fill="none" stroke="#ffe7a3" stroke-linejoin="round">
        <path d="M50 5 Q21 32 34 62 Q5 46 10 24 Q-2 74 36 102
          L50 150 L64 102 Q102 74 90 24 Q95 46 66 62 Q79 32 50 5Z"
          stroke-width="4"/>
        <path d="M50 20 Q33 55 50 82 Q67 55 50 20Z" stroke-width="4"/>
        <path d="M21 71 L41 94 L50 127 L59 94 L79 71" stroke-width="3"/>
      </g>
      <path d="M50 87 L59 101 L50 116 L41 101Z" fill="#8af0d2"/>
    </svg>`,
    { size: 256 },
  );

  const emberTex = svg(
    `<svg viewBox="0 0 64 128">
      <path d="M32 128 Q-2 100 14 65 Q27 43 21 21 Q44 36 36 57
        Q58 39 47 0 Q81 56 48 91 Q60 114 32 128Z" fill="#ff9e43"/>
      <path d="M31 122 Q10 99 29 76 Q38 64 35 48 Q55 71 38 94
        Q46 106 31 122Z" fill="#ffe6a0"/>
      <path d="M31 119 Q24 103 34 92 Q40 108 31 119Z" fill="#fff8d6"/>
    </svg>`,
    { size: 256 },
  );

  const tailPaint = paint((_p, _n, s) => {
    const t = s[0];
    const across = Math.abs(s[1] - 0.5) * 2;
    if (across > 0.91) return "#ffcc70";
    if (across < 0.055) return "#ffe6a1";
    const vein = Math.abs(((t * 8 + across * 0.8) % 1 + 1) % 1 - 0.5);
    if (vein < 0.024 && t > 0.12 && t < 0.88) return "#ef9e4c";
    return t < 0.66
      ? mix("#94243d", "#ef4d31", t / 0.66)
      : mix("#ef4d31", "#ffd777", (t - 0.66) / 0.34);
  });

  // Skeleton and independent animation chains.
  const pelvis = b.joint("pelvis", { at: [0, 0.99, -0.04], role: "spine" });
  const spine = b.chain(
    "spine",
    [[0, 0.99, -0.04], [0, 1.25, 0], [0, 1.53, 0.035]],
    {
      parent: pelvis,
      names: ["spineLower", "chest", "neckBase"],
      role: "spine",
    },
  );
  const neck = b.chain(
    "neck",
    [[0, 1.5, 0.035], [0, 1.7, 0.075], [0, 1.89, 0.17]],
    {
      parent: spine.tip!,
      names: ["neckLower", "neckUpper", "headBase"],
      role: "neck",
    },
  );
  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 1.945, 0.195],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.835, 0.295],
    dir: [0, 0, 1],
    role: "jaw",
  });
  const wings = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const chain = b.chain(
      `wing${side}`,
      [
        [s * 0.19, 1.47, -0.025],
        [s * 0.69, 1.69, -0.045],
        [s * 1.17, 1.84, -0.065],
        [s * 1.59, 1.94, -0.075],
      ],
      {
        parent: spine.joints[1],
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `wingTip${side}`],
        role: "wing",
      },
    );
    return { s, side, chain };
  });
  const legs = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${side}`,
      [
        [s * 0.14, 1.03, -0.03],
        [s * 0.195, 0.69, 0.045],
        [s * 0.19, 0.48, -0.045],
        [s * 0.22, 0.235, 0.105],
      ],
      {
        parent: pelvis,
        names: [`hip${side}`, `knee${side}`, `hock${side}`, `ankle${side}`],
        role: "leg",
        contact: [s * 0.22, 0.19, 0.19],
      },
    );
    const toes = [-1, 0, 1, 2].map((i) => {
      const back = i === 2;
      const x = s * 0.22;
      const dx = back ? -s * 0.035 : i * 0.065;
      return b.chain(
        `toe${side}${i + 2}`,
        [
          [x, 0.235, 0.105],
          [x + dx * 0.6, 0.22, back ? 0.015 : 0.245],
          [x + dx, 0.213, back ? -0.06 : 0.37 - Math.abs(i) * 0.035],
        ],
        {
          parent: leg.tip!,
          names: [`toe${side}${i + 2}Base`, `toe${side}${i + 2}Tip`],
          role: "digit",
        },
      );
    });
    return { s, leg, toes };
  });
  const tails = [-2, -1, 0, 1, 2].map((i) => {
    const a = Math.abs(i);
    const chain = b.chain(
      `tail${i + 3}`,
      catmull([
        [i * 0.055, 1.075, -0.19],
        [i * 0.15, 0.84, -0.43],
        [i * 0.36, 0.40 + a * 0.055, -0.83],
        [i * 0.54, 0.30 + a * 0.105, -1.18 + a * 0.10],
        [i * 0.61, 0.57 + a * 0.15, -1.58 + a * 0.14],
      ]),
      { parent: pelvis, count: 4, role: "tail" },
    );
    return { i, chain };
  });
  const pedestal = b.joint("sunSeal", {
    parent: pelvis,
    at: [0, 0, 0],
    dir: [0, 1, 0],
  });

  function ellipsoid(at: number[], scale: number[], color: Fill, bone: Joint, name: string) {
    return b.part(new THREE.SphereGeometry(1, 12, 8), color, {
      at, scale, bone, flat: true, name,
    });
  }

  // A closed feather with a softly swept shaft and faceted, lenticular section.
  // Its two faces share the artwork; no free-floating planes or hidden cards.
  function feather(
    name: string,
    root: number[],
    tip: number[],
    width: number,
    bone: Joint,
    texture: THREE.Texture = primaryTex,
    depth = 0.018,
    curl = 0.12,
    facing: number[] = [0, 0, 1],
  ) {
    const origin = V(root);
    const y = V(tip).sub(origin);
    const length = y.length();
    y.normalize();
    const preferred = V(facing);
    const x = y.clone().cross(preferred).normalize();
    const normal = x.clone().cross(y).normalize();
    const stations = [
      [0, 0.06],
      [0.12, 0.29],
      [0.29, 0.47],
      [0.47, 0.48],
      [0.64, 0.38],
      [0.78, 0.24],
      [0.9, 0.105],
      [1, 0],
    ];
    const points: number[][] = [];
    const uv: number[][] = [];
    for (const [t, w] of stations) {
      const bend = curl * width * (Math.sin(t * Math.PI * 1.5) - t * Math.sin(Math.PI * 1.5));
      const lift = Math.sin(t * Math.PI) * length * 0.025;
      const ridge = depth * Math.sin(Math.PI * t);
      const left = w * width * (1 + 0.09 * Math.sin(t * Math.PI * 4));
      const right = w * width * (1 - 0.08 * Math.sin(t * Math.PI * 3));
      points.push(
        [bend - left, t * length, lift],
        [bend, t * length, lift + ridge],
        [bend + right, t * length, lift],
        [bend, t * length, lift - ridge * 0.55],
      );
      uv.push(
        [0.5 - w, t], [0.5, t], [0.5 + w, t], [0.5, t],
      );
    }
    const positions: number[] = [];
    const texcoords: number[] = [];
    function add(index: number) {
      positions.push(...points[index]);
      texcoords.push(...uv[index]);
    }
    for (let row = 0; row < stations.length - 1; row++) {
      for (let k = 0; k < 4; k++) {
        const a = row * 4 + k;
        const d = row * 4 + (k + 1) % 4;
        const c = d + 4;
        const e = a + 4;
        add(a); add(d); add(e);
        add(d); add(c); add(e);
      }
    }
    add(0); add(3); add(1);
    add(1); add(3); add(2);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(texcoords, 2));
    geometry.computeVertexNormals();
    return b.part(geometry, "#ffffff", {
      at: origin,
      dir: normal,
      up: y,
      axis: "z",
      texture,
      bone,
      name,
    });
  }

  b.sweep(
    spine,
    (t) => [
      0.19 + Math.sin(t * Math.PI) * 0.105 - t * 0.06,
      0.19 + Math.sin(t * Math.PI) * 0.065 - t * 0.04,
    ],
    { color: deepCoat, sides: 10, caps: "round", name: "BreastCore" },
  );
  b.sweep(neck, (t) => [0.143 - t * 0.025, 0.14 - t * 0.02], {
    color: coat, sides: 10, name: "ArchedNeck",
  });

  const skull = ellipsoid(
    [0, 1.945, 0.195], [0.187, 0.19, 0.201], coat, head, "PhoenixSkull",
  );
  ellipsoid([0, 1.855, 0.253], [0.128, 0.085, 0.126], cream, head, "CheekBib");
  const skullSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSurface.around([0, 1.945, 0.195]).at(s * 36, 8);
    b.decal(skull, eyeTex, {
      at: hit,
      size: [0.176, 0.14],
      mirror: s < 0,
      lift: 0.002,
      bone: head,
      name: s > 0 ? "EyeL" : "EyeR",
    });
    // Swept brow sits above the eye rather than across its drawing.
    feather(
      `BrowFlame${s}`,
      [s * 0.045, 2.036, 0.341],
      [s * 0.231, 2.09, 0.15],
      0.065, head, creamTex, 0.012, s * 0.18,
    );
    feather(
      `TempleFlame${s}`,
      [s * 0.145, 1.975, 0.132],
      [s * 0.342, 2.095, -0.07],
      0.13, head, covertTex, 0.017, s * 0.3,
    );
    feather(
      `CheekFlame${s}`,
      [s * 0.115, 1.885, 0.23],
      [s * 0.272, 1.855, -0.025],
      0.116, head, creamTex, 0.018, s * 0.15,
    );
    feather(
      `LowerCheekFlame${s}`,
      [s * 0.10, 1.83, 0.207],
      [s * 0.215, 1.735, 0.065],
      0.09, head, creamTex, 0.013,
    );
  }
  b.extrude(
    [
      [0, 0], [0.075, 0.038], [0.158, 0.008], [0.215, -0.046],
      [0.188, -0.107], [0.164, -0.063], [0.028, -0.045],
    ],
    {
      at: [0, 1.905, 0.319], x: [0, 0, 1], y: [0, 1, 0],
      thickness: [0.081, 0.103], color: gold, bone: head, name: "HookedUpperBeak",
    },
  );
  b.extrude(
    [[0, 0], [0.145, -0.008], [0.164, 0.019], [0.035, 0.029]],
    {
      at: [0, 1.835, 0.328], x: [0, 0, 1], y: [0, 1, 0],
      thickness: 0.064, color: darkGold, bone: jaw, name: "LowerBeak",
    },
  );
  for (const s of [1, -1]) {
    ellipsoid(
      [s * 0.049, 1.916, 0.385], [0.006, 0.007, 0.013],
      C.burgundy, head, `Nostril${s}`,
    );
  }

  for (let i = -2; i <= 2; i++) {
    const a = Math.abs(i);
    feather(
      `CrownFlame${i + 3}`,
      [i * 0.045, 2.066 - a * 0.012, 0.12 - a * 0.024],
      [i * 0.12, 2.49 - a * 0.083, -0.06 - a * 0.035],
      0.125 - a * 0.009, head, covertTex, 0.018, i * 0.16,
    );
  }
  for (let i = -1; i <= 1; i++) {
    feather(
      `ForeheadFeather${i + 1}`,
      [i * 0.041, 2.072, 0.312],
      [i * 0.072, 2.20 - Math.abs(i) * 0.03, 0.16],
      0.074, head, covertTex, 0.013,
    );
  }
  b.part(new THREE.OctahedronGeometry(0.047), gold, {
    at: [0, 2.075, 0.343], scale: [0.75, 1.14, 0.35],
    bone: head, name: "ForeheadGoldSetting",
  });
  glow(b.part(new THREE.OctahedronGeometry(0.032), C.jade, {
    at: [0, 2.075, 0.357], scale: [0.68, 1.12, 0.4],
    bone: head, name: "ForeheadJade",
  }), 0.65);

  // A complete, overlapping mantle around the neck, not a narrow front bib.
  for (let row = 0; row < 3; row++) {
    const y = 1.82 - row * 0.105;
    const centerZ = 0.14 - row * 0.025;
    for (let k = 0; k < 7; k++) {
      const angle = (k / 7) * Math.PI * 2;
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);
      const radius = 0.125 + row * 0.009;
      const front = cos > 0.25;
      feather(
        `NeckMantle${row}_${k}`,
        [sin * radius, y, centerZ + cos * radius],
        [sin * (radius + 0.045), y - 0.24, centerZ + cos * (radius + 0.05) - 0.04],
        0.118 + row * 0.012,
        neck.joints[row === 0 ? 1 : 0],
        front ? creamTex : covertTex,
        0.017,
        sin * 0.2,
        [sin, 0, cos],
      );
    }
  }

  // Broad breast shingles taper into a short, avian abdominal fan.
  for (let row = 0; row < 3; row++) {
    const y = 1.50 - row * 0.145;
    for (let i = -2; i <= 2; i++) {
      const x = i * (0.067 + row * 0.003);
      const z = 0.239 - Math.abs(i) * 0.024;
      feather(
        `BreastFeather${row}_${i + 2}`,
        [x, y, z],
        [x * 1.13, y - 0.255, z + 0.02 - row * 0.015],
        0.139 + row * 0.006,
        spine.joints[row < 2 ? 1 : 0],
        row === 0 ? creamTex : covertTex,
        0.025,
        i * 0.10,
      );
    }
  }
  for (const s of [1, -1]) {
    for (let row = 0; row < 3; row++) {
      feather(
        `FlankFlame${s}_${row}`,
        [s * 0.205, 1.40 - row * 0.13, 0.09],
        [s * 0.29, 1.13 - row * 0.10, 0.045],
        0.18, spine.joints[row === 0 ? 1 : 0],
        primaryTex, 0.023, s * 0.2, [s * 0.8, 0, 0.6],
      );
      feather(
        `BackMantle${s}_${row}`,
        [s * 0.11, 1.49 - row * 0.14, -0.16],
        [s * 0.17, 1.21 - row * 0.13, -0.25],
        0.19, spine.joints[row < 2 ? 1 : 0],
        primaryTex, 0.023, s * 0.12, [s * 0.3, 0, -1],
      );
    }
  }
  for (let i = -1; i <= 1; i++) {
    feather(
      `AbdomenFan${i + 1}`,
      [i * 0.07, 1.09, 0.185],
      [i * 0.105, 0.79 + Math.abs(i) * 0.035, 0.18],
      0.14, pelvis, primaryTex, 0.022, i * 0.13,
    );
  }
  b.part(new THREE.OctahedronGeometry(0.085), gold, {
    at: [0, 1.345, 0.302], scale: [0.78, 1.24, 0.43],
    bone: spine.joints[1], name: "HeartGoldMount",
  });
  glow(b.part(new THREE.OctahedronGeometry(0.052), C.jade, {
    at: [0, 1.345, 0.336], scale: [0.72, 1.23, 0.4],
    bone: spine.joints[1], name: "DawnHeart",
  }), 0.7);
  b.part(new THREE.PlaneGeometry(0.135, 0.205), "#ffffff", {
    at: [0, 1.115, 0.279], texture: emblemTex,
    bone: spine.joints[0], name: "BreastFiligree",
  });

  for (const { s, side, chain } of wings) {
    b.sweep(chain, [0.101, 0.083, 0.051, 0.022], {
      color: deepCoat, sides: 8, name: `WingSpar${side}`,
    });
    b.membrane(
      chain,
      [
        [s * 0.27, 1.31, -0.06],
        [s * 0.77, 1.43, -0.07],
        [s * 1.25, 1.64, -0.08],
        [s * 1.59, 1.94, -0.075],
      ],
      {
        color: deepCoat, thickness: 0.044, bone: chain,
        rows: 3, cols: 12, name: `WingWeb${side}`,
      },
    );
    for (let i = 0; i < 8; i++) {
      const x = 0.30 + i * 0.092;
      feather(
        `Secondary${side}${i + 1}`,
        [s * x, 1.51 + i * 0.032, -0.025],
        [s * (0.34 + i * 0.13), 0.86 + i * 0.013 - (i % 2) * 0.035, -0.13],
        0.235, chain.joints[i < 4 ? 0 : 1],
        primaryTex, 0.02, s * (0.15 + i * 0.025),
      );
    }

    for (let i = 0; i < 9; i++) {
      const root = [s * (0.91 + i * 0.084), 1.735 + i * 0.025, -0.047];
      const tip = [
        s * (1.10 + i * 0.143),
        0.88 + i * 0.14 + Math.max(0, i - 5) * 0.025,
        -0.14 - i * 0.009,
      ];
      const bone = chain.joints[i < 4 ? 1 : 2];
      feather(
        `Primary${side}${i + 1}`, root, tip, 0.247 - i * 0.005,
        bone, primaryTex, 0.02, s * (0.2 + i * 0.045),
      );
      if (i >= 4) {
        const start = V(root).lerp(V(tip), 0.86);
        const end = V(tip);
        start.z += 0.012;
        end.z += 0.003;
        glow(b.sweep([start, end], [0.006, 0], {
          color: C.ivory, bone, sides: 5, caps: "flat",
          name: `IncandescentQuill${side}${i}`,
        }), 0.8);
      }
    }
    feather(
      `WingtipFlame${side}`,
      [s * 1.47, 1.90, -0.065],
      [s * 2.29, 2.29, -0.22],
      0.18, chain.tip!, creamTex, 0.018, s * 0.45,
    );

    for (let i = 0; i < 10; i++) {
      const x = 0.31 + i * 0.133;
      const y = 1.55 + i * 0.039;
      feather(
        `GreaterCovert${side}${i + 1}`,
        [s * x, y, 0.018],
        [s * (x + 0.17), y - 0.41 + i * 0.008, 0.06],
        0.195, chain.joints[Math.min(2, Math.floor(i / 4))],
        covertTex, 0.019, s * 0.2,
      );
    }
    for (let i = 0; i < 9; i++) {
      const x = 0.28 + i * 0.147;
      const y = 1.575 + i * 0.041;
      feather(
        `LesserCovert${side}${i + 1}`,
        [s * x, y, 0.052],
        [s * (x + 0.16), y - 0.24, 0.078],
        0.16, chain.joints[Math.min(2, Math.floor(i / 4))],
        covertTex, 0.017, s * 0.15,
      );
    }
    // Overlapping small scapular blades cover the long naked leading-edge tube.
    for (let i = 0; i < 11; i++) {
      const t = 0.04 + i * 0.085;
      const at = chain.at(t).at;
      feather(
        `LeadingPlumage${side}${i}`,
        [at.x, at.y + 0.053, at.z + 0.041],
        [at.x + s * 0.205, at.y + 0.012, at.z + 0.067],
        0.125 - i * 0.003,
        chain.jointAt(t),
        i < 3 ? creamTex : covertTex,
        0.016,
        s * 0.12,
      );
    }
    for (let i = 0; i < 8; i++) {
      const x = 0.30 + i * 0.17;
      const y = 1.55 + i * 0.05;
      feather(
        `BackCovert${side}${i}`,
        [s * x, y, -0.112],
        [s * (x + 0.15), y - 0.33, -0.14],
        0.205, chain.joints[Math.min(2, Math.floor(i / 3))],
        primaryTex, 0.017, s * 0.2, [0, 0, -1],
      );
    }
    b.sweep(
      catmull([
        [s * 0.24, 1.558, 0.049],
        [s * 0.69, 1.765, 0.035],
        [s * 1.19, 1.898, 0.012],
        [s * 1.58, 1.973, -0.025],
      ]),
      [0.012, 0.009, 0.004],
      { color: gold, bone: chain, sides: 6, name: `GildedLeadingEdge${side}` },
    );
    for (let i = 0; i < 3; i++) {
      feather(
        `ShoulderFlame${side}${i}`,
        [s * (0.18 + i * 0.085), 1.50 + i * 0.052, 0.06],
        [s * (0.35 + i * 0.13), 1.77 + i * 0.062, 0.015],
        0.16, chain.joints[0], covertTex, 0.019, s * 0.3,
      );
    }
    b.part(new THREE.OctahedronGeometry(0.062), gold, {
      at: [s * 1.17, 1.83, 0.09], scale: [1.3, 0.85, 0.5],
      bone: chain.joints[2], name: `CarpalMount${side}`,
    });
    glow(b.part(new THREE.OctahedronGeometry(0.036), C.jade, {
      at: [s * 1.17, 1.83, 0.119], scale: [1.35, 0.8, 0.4],
      bone: chain.joints[2], name: `CarpalJade${side}`,
    }), 0.6);
  }

  for (const { i, chain } of tails) {
    const left: THREE.Vector3[] = [];
    const right: THREE.Vector3[] = [];
    const center: THREE.Vector3[] = [];
    for (let k = 0; k <= 28; k++) {
      const t = k / 28;
      const p = chain.at(t).at.clone();
      const scallop = 1 + Math.sin(t * Math.PI * 8) * 0.15 * Math.sin(Math.PI * t);
      const width =
        (0.07 + 0.125 * Math.sin(Math.PI * Math.pow(t, 0.8))) *
        Math.pow(1 - t, 0.36) * scallop + 0.001;
      left.push(p.clone().add(new THREE.Vector3(-width, 0, 0)));
      right.push(p.clone().add(new THREE.Vector3(width, 0, 0)));
      center.push(p.clone().add(new THREE.Vector3(0, 0.018, 0.014)));
    }
    b.membrane(left, right, {
      color: tailPaint, bone: chain, thickness: 0.025,
      rows: 6, cols: 28, name: `FlameTailRibbon${i + 3}`,
    });
    b.sweep(left, [0.006, 0.005, 0.001], {
      color: gold, bone: chain, sides: 5, name: `TailLeftGold${i + 3}`,
    });
    b.sweep(right, [0.006, 0.005, 0.001], {
      color: gold, bone: chain, sides: 5, name: `TailRightGold${i + 3}`,
    });
    b.sweep(center, [0.008, 0.006, 0.001], {
      color: cream, bone: chain, sides: 5, name: `TailShaft${i + 3}`,
    });
    const end = chain.at(1).at;
    const direction = end.clone().sub(chain.at(0.76).at).normalize();
    const flameRoot = end.clone().addScaledVector(direction, -0.17);
    const flameTip = end.clone().addScaledVector(direction, 0.19);
    const terminal = feather(
      `TailTerminalFlame${i + 3}`,
      flameRoot.toArray(), flameTip.toArray(), 0.19,
      chain.joints[3], creamTex, 0.014, i * 0.17,
    );
    glow(terminal, 0.6);
    for (const s of [1, -1]) {
      const root = end.clone().addScaledVector(direction, -0.12);
      const tip = end.clone().addScaledVector(direction, 0.075);
      tip.x += s * 0.105;
      feather(
        `TailFlameBarb${i + 3}_${s}`,
        root.toArray(), tip.toArray(), 0.085,
        chain.joints[3], covertTex, 0.01, s * 0.4,
      );
    }
  }
  for (let i = -3; i <= 3; i++) {
    feather(
      `RumpFan${i + 3}`,
      [i * 0.043, 1.17, -0.17],
      [i * 0.12, 0.82, -0.43],
      0.15, pelvis, primaryTex, 0.021, i * 0.08, [0, 0, -1],
    );
  }

  for (const { s, leg, toes } of legs) {
    b.sweep(leg, [0.093, 0.082, 0.038, 0.031], {
      color: gold, sides: 8, name: s > 0 ? "LegL" : "LegR",
    });
    b.sweep(leg, [0.108, 0.084], {
      from: 0, to: 0.46, color: coat, sides: 8, name: `ThighPlumage${s}`,
    });
    for (let row = 0; row < 2; row++) {
      for (let j = -1; j <= 1; j++) {
        const x = s * (0.17 + row * 0.015) + j * 0.048;
        feather(
          `ThighFeather${s}_${row}_${j + 1}`,
          [x, 0.99 - row * 0.14, 0.079 + row * 0.025],
          [x + s * 0.025, 0.72 - row * 0.14, 0.114],
          0.112, leg.joints[0], row === 0 ? primaryTex : covertTex, 0.017,
        );
      }
      for (const back of [false, true]) {
        feather(
          `LegSideMantle${s}_${row}_${back}`,
          [s * (back ? 0.18 : 0.25), 0.96 - row * 0.13, back ? -0.07 : 0.015],
          [s * (back ? 0.21 : 0.30), 0.70 - row * 0.13, back ? -0.10 : 0.015],
          0.14, leg.joints[0], primaryTex, 0.018, s * 0.12,
          back ? [0, 0, -1] : [s, 0, 0],
        );
      }
    }
    for (let k = 0; k < 5; k++) {
      b.part(new THREE.CylinderGeometry(0.039, 0.041, 0.018, 8), darkGold, {
        frame: leg.at(0.68 + k * 0.055), name: `TarsalScale${s}_${k}`,
      });
    }
    for (let i = 0; i < toes.length; i++) {
      const toe = toes[i];
      b.sweep(toe, [0.026, 0.018, 0.011], {
        color: gold, sides: 6, name: `GoldenToe${s}_${i}`,
      });
      const end = toe.at(1).at;
      const back = i === 3;
      b.sweep(
        catmull([
          end,
          end.clone().add(new THREE.Vector3(0, 0.013, back ? -0.028 : 0.025)),
          end.clone().add(new THREE.Vector3(0, -0.018, back ? -0.05 : 0.052)),
        ]),
        [0.016, 0.013, 0],
        {
          color: cream, bone: toe.joints[1], sides: 6,
          caps: "flat", name: `Talon${s}_${i}`,
        },
      );
    }
  }

  b.part(new THREE.CylinderGeometry(1, 1.035, 0.12, 12), C.stoneEdge, {
    at: [0, 0.06, -0.38], scale: [1.18, 1, 1.25],
    bone: pedestal, name: "ObsidianFoundation",
  });
  b.part(new THREE.CylinderGeometry(0.98, 1, 0.035, 12), stone, {
    at: [0, 0.1375, -0.38], scale: [1.18, 1, 1.25],
    bone: pedestal, name: "SunSealStone",
  });
  b.part(new THREE.CylinderGeometry(0.43, 0.46, 0.035, 12), stone, {
    at: [0, 0.1725, 0.05], bone: pedestal, name: "PerchDais",
  });
  b.part(new THREE.CylinderGeometry(0.445, 0.445, 0.012, 12), darkGold, {
    at: [0, 0.16, 0.05], bone: pedestal, name: "PerchGoldRim",
  });
  b.part(new THREE.PlaneGeometry(2.19, 2.32), "#ffffff", {
    at: [0, 0.1565, -0.38], dir: [0, 1, 0], up: [0, 0, -1],
    axis: "z", texture: sunTex, bone: pedestal, name: "AncientSunSeal",
  });
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI * 2) / 12;
    b.part(new THREE.BoxGeometry(0.045, 0.065, 0.045), darkGold, {
      at: [Math.sin(a) * 1.155, 0.085, -0.38 + Math.cos(a) * 1.22],
      rotation: [0, (a * 180) / Math.PI, 0],
      bone: pedestal, name: `SealEdgeInlay${i}`,
    });
  }
  for (const s of [1, -1]) {
    const p = [s * 0.78, 0.155, -0.71];
    b.lathe(
      [[0, 0], [0.11, 0], [0.135, 0.07], [0.1, 0.105], [0, 0.105]],
      { at: p, color: darkGold, segments: 8, bone: pedestal, name: `EmberCup${s}` },
    );
    glow(b.part(new THREE.IcosahedronGeometry(0.076, 0), C.orange, {
      at: [p[0], 0.255, p[2]], scale: [1, 0.6, 1],
      bone: pedestal, name: `EmberBed${s}`,
    }), 1.1);
    glow(b.cards(
      [frame([p[0], 0.26, p[2]], [0, 1, 0])],
      emberTex,
      {
        size: [0.16, 0.29], cross: true, flow: [0, 0, 1],
        bone: pedestal, sink: 0.04, name: `ShrineFlame${s}`,
      },
    ), 1.2);
    for (let i = 0; i < 4; i++) {
      glow(b.part(new THREE.OctahedronGeometry(0.009 + random() * 0.006), C.pale, {
        at: [
          p[0] + (random() - 0.5) * 0.15,
          0.4 + i * 0.07,
          p[2] + (random() - 0.5) * 0.12,
        ],
        scale: [0.65, 1.7, 0.65],
        bone: pedestal, name: `RisingEmber${s}_${i}`,
      }), 1.2);
    }
  }

  return b.root;
}
