import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  frame,
  rng,
  paint,
  mix,
  noise,
  svg,
} from "../../../../src/index";
import type { Fill, Joint } from "../../../../src/index";
import { animeEye, cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Tsukihime — Ninefold Spirit",
  description:
    "An ivory nine-tailed kitsune with vermilion brush-tipped tails, gilded celestial markings, jade anime eyes and nine floating foxfires.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Tsukihime", detail: 1, paintSize: 2048 });
  const random = rng(2917);

  const C = {
    ivory: "#fff0d6",
    white: "#fff9e9",
    shadow: "#b8c9d6",
    red: "#bc234b",
    scarlet: "#ed4760",
    rose: "#ff8990",
    plum: "#39223e",
    gold: "#dda94a",
    paleGold: "#ffe6a0",
    turquoise: "#24c9bc",
    blue: "#248caf",
    mint: "#9cffe4",
    light: "#edfff3",
  };

  const coat = paint((p, n) => {
    const warmth = Math.max(0, Math.min(1, 0.52 + n.y * 0.46 + n.z * 0.12));
    const base = mix("#b8cbd8", "#fff4dc", warmth);
    return mix(base, "#ffffff", noise(p, 0.085, 13) * 0.075);
  });
  const cream = cel("#fff8e5", "#d5d6d3");
  const red = cel("#e64460", "#a72750");
  const innerEar = cel("#e9838d", "#a83d66");
  const gold = paint((_p, n) =>
    mix("#b78037", "#ffe6a0", Math.max(0, Math.min(1, 0.5 + n.y * 0.4 + n.z * 0.15))),
  );

  // Drawings are deliberately bold enough to read across the complete tail fan.
  const eyeTexture = animeEye({
    iris: "#35cdb2",
    irisLight: "#c3ffd8",
    irisDark: "#146575",
    ink: C.plum,
    blush: false,
    brow: false,
    size: 512,
  });

  const foreheadTexture = svg(
    `<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 C42 31 20 44 22 67 C24 85 38 92 50 111
               C62 92 76 85 78 67 C80 44 58 31 50 5Z"
            fill="#b9234c" stroke="#ffe4a2" stroke-width="4"/>
      <path d="M50 33 C43 50 34 57 36 69 L50 90 L64 69 C66 57 57 50 50 33Z"
            fill="#ef7582"/>
      <path d="M50 44 L56 65 L50 78 L44 65Z" fill="#fff0bc"/>
      <circle cx="50" cy="127" r="6" fill="#b9234c"/>
      <path d="M13 85 Q12 107 30 114 M87 85 Q88 107 70 114"
            stroke="#b9234c" stroke-width="5" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const cheekTexture = svg(
    `<svg viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 66 C37 68 35 31 71 33 C94 34 112 60 147 27
               C128 68 102 74 79 57 C55 39 49 81 12 66Z" fill="#c82c50"/>
      <path d="M43 20 Q88 5 133 16 Q101 26 65 27Z" fill="#e44d64"/>
      <path d="M66 45 Q99 62 130 44" fill="none" stroke="#ffe7a3" stroke-width="4"/>
      <circle cx="22" cy="36" r="5" fill="#d19a45"/>
    </svg>`,
    { size: 256 },
  );

  const tailTexture = svg(
    `<svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 7 L65 43 L89 62 L68 79 L77 117 L50 151 L23 117
               L32 79 L11 62 L35 43Z"
            fill="none" stroke="#ffe7a6" stroke-width="5" stroke-linejoin="round"/>
      <path d="M50 28 L57 56 L72 63 L57 72 L50 98 L43 72 L28 63 L43 56Z"
            fill="#fff2c2"/>
      <path d="M34 107 Q50 126 66 107 Q61 135 50 139 Q39 135 34 107Z"
            fill="#ffe7a6"/>
      <circle cx="50" cy="116" r="4" fill="#fff8de"/>
    </svg>`,
    { size: 256 },
  );

  const collarTexture = svg(
    `<svg viewBox="0 0 320 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="64" fill="#9d254b"/>
      <path d="M0 7H320 M0 57H320" stroke="#ffe6a0" stroke-width="5"/>
      ${Array.from({ length: 8 }, (_, i) => {
        const x = 20 + 40 * i;
        return `<path d="M${x} 16L${x + 12} 32L${x} 48L${x - 12} 32Z"
                       fill="none" stroke="#efba66" stroke-width="3"/>
                <circle cx="${x}" cy="32" r="3" fill="#fff0bd"/>`;
      }).join("")}
    </svg>`,
    { size: 512 },
  );

  const talismanTexture = svg(
    `<svg viewBox="0 0 80 160" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="74" height="154" rx="6" fill="#fff0c7"
            stroke="#b42a4b" stroke-width="6"/>
      <path d="M13 16H67 M13 144H67" stroke="#d5a44d" stroke-width="4"/>
      <circle cx="40" cy="36" r="12" fill="none" stroke="#b42a4b" stroke-width="4"/>
      <path d="M40 21V53 M23 62H57 M40 53V126 M24 81L54 96
               M56 78L24 103 M24 115H56 M28 129L40 119L52 129"
            fill="none" stroke="#b42a4b" stroke-width="5" stroke-linecap="square"/>
    </svg>`,
    { size: 256 },
  );

  // Skeleton first: a quiet, four-footed neutral stance.
  const hips = b.joint("hips", {
    at: [0, 0.55, -0.32],
    dir: [0, 0, 1],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [
      [0, 0.55, -0.32],
      [0, 0.56, -0.08],
      [0, 0.59, 0.22],
    ],
    { parent: hips, names: ["spine1", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 0.59, 0.22],
      [0, 0.73, 0.36],
      [0, 0.84, 0.49],
    ],
    { parent: spine.joints[1], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.84, 0.49],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.735, 0.575],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const H = 1.08;
  const face = b.region({ at: [0, 0.84, 0.52], scale: H, bone: head });
  const ears = [1, -1].map((s) =>
    b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: face.p([s * 0.135, 0.135, -0.045]),
      dir: [s * 0.35, 1, 0],
      role: "hinge",
    }),
  );

  const legs = [];
  for (const front of [true, false]) {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const label = `${front ? "F" : "H"}${side}`;
      const x = s * (front ? 0.145 : 0.16);
      const z = front ? 0.23 : -0.31;
      const points = front
        ? [
            [x, 0.59, z],
            [s * 0.165, 0.32, z - 0.015],
            [s * 0.18, 0.105, z + 0.035],
          ]
        : [
            [x, 0.54, z],
            [s * 0.18, 0.34, z + 0.085],
            [s * 0.19, 0.105, z - 0.025],
          ];
      const chain = b.chain(`leg${label}`, points, {
        parent: front ? spine.joints[1] : hips,
        names: front
          ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`]
          : [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
        contact: [points[2][0], 0, points[2][2] + 0.06],
      });
      const foot = points[2];
      const toes = [-1, 0, 1].map((i) => {
        const tx = foot[0] + i * 0.042;
        return b.chain(
          `toe${label}${i + 2}`,
          [
            [tx, 0.055, foot[2] + 0.07],
            [tx + i * 0.006, 0.035, foot[2] + 0.14],
          ],
          {
            parent: chain.tip!,
            names: [`toe${label}${i + 2}`],
            role: "digit",
          },
        );
      });
      legs.push({ chain, front, s, foot, toes });
    }
  }

  // Nine distinct radial tail chains. Their roots belong to the rump, not to
  // a floating decorative fan; the z offsets keep the fan behind the face.
  const tails = [];
  for (let i = 0; i < 9; i++) {
    const angle = ((i - 4) * 20.5 * Math.PI) / 180;
    const dx = Math.sin(angle);
    const dy = Math.cos(angle);
    const reach = 1.17 + 0.11 * dy;
    const root = [dx * 0.065, 0.57 + dy * 0.025, -0.405];
    const path = catmull([
      root,
      [dx * 0.31, 0.59 + dy * 0.30, -0.64],
      [dx * reach * 0.72, 0.57 + dy * reach * 0.75, -0.82],
      [dx * reach, 0.57 + dy * reach, -0.77],
      [dx * (reach + 0.09), 0.61 + dy * (reach + 0.07), -0.69],
    ]);
    const chain = b.chain(`tail${i + 1}`, path, {
      parent: hips,
      count: 4,
      names: (j) => `tail${i + 1}_${j + 1}`,
      role: "tail",
    });
    tails.push({ chain, path, dx, dy, i });
  }

  function ellipsoid(
    name: string,
    at: number[] | THREE.Vector3,
    scale: number[],
    color: Fill,
    bone: Joint,
    segments = 12,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 8), color, {
      name,
      at,
      scale,
      bone,
      flat: true,
    });
  }

  function bead(at: number[] | THREE.Vector3, radius: number, color: Fill, bone: Joint) {
    return b.part(new THREE.IcosahedronGeometry(radius, 0), color, { at, bone });
  }

  function tuft(
    at: number[] | THREE.Vector3,
    direction: number[],
    length: number,
    width: number,
    color: Fill,
    bone: Joint,
  ) {
    const start = at instanceof THREE.Vector3 ? at : new THREE.Vector3(...(at as [number, number, number]));
    const d = new THREE.Vector3(...(direction as [number, number, number])).normalize();
    const tip = start.clone().addScaledVector(d, length);
    const mid = start.clone().addScaledVector(d, length * 0.42);
    mid.z += width * 0.2;
    return b.sweep(bezier(start, mid, tip), [width, width * 0.64, 0], {
      bone,
      color,
      sides: 5,
      smooth: false,
      caps: "flat",
    });
  }

  // The face is built before its ornaments.
  const skull = ellipsoid(
    "ivorySkull",
    face.p([0, 0.015, 0]),
    [0.215 * H, 0.192 * H, 0.184 * H],
    coat,
    head,
    16,
  );

  for (const s of [1, -1]) {
    const eyeHit = b.surface(skull).around(skull.at).at(s * 34, 12);
    b.decal(skull, eyeTexture, {
      at: eyeHit,
      size: [0.119 * H, 0.151 * H],
      mirror: s > 0,
      lift: 0.002,
      bone: head,
      name: s > 0 ? "eyeL" : "eyeR",
    });

    const cheek = ellipsoid(
      `cheek${s}`,
      face.p([s * 0.148, -0.074, 0.071]),
      [0.111 * H, 0.083 * H, 0.109 * H],
      cream,
      head,
    );
    b.decal(cheek, cheekTexture, {
      at: face.p([s * 0.166, -0.071, 0.173]),
      dir: [s * 0.3, 0, 1],
      size: [0.138 * H, 0.072 * H],
      mirror: s < 0,
      lift: 0.002,
    });

    for (let k = 0; k < 3; k++) {
      tuft(
        face.p([s * (0.158 + k * 0.012), -0.035 - k * 0.048, 0.045]),
        [s * (1 + k * 0.08), -0.12 - k * 0.25, -0.08],
        (0.12 - k * 0.012) * H,
        (0.052 - k * 0.005) * H,
        k === 1 ? coat : cream,
        head,
      );
    }

    b.sweep(
      bezier(
        face.p([s * 0.065, 0.119, 0.141]),
        face.p([s * 0.106, 0.145, 0.141]),
        face.p([s * 0.158, 0.121, 0.103]),
      ),
      [0.008, 0.012, 0.002],
      { bone: head, color: C.red, sides: 5, caps: "flat" },
    );
  }

  b.decal(skull, foreheadTexture, {
    at: face.p([0, 0.116, 0.158]),
    dir: [0, 0.18, 1],
    size: [0.081 * H, 0.111 * H],
    bone: head,
    lift: 0.002,
    name: "foreheadSpiritSeal",
  });

  // A separate upper muzzle and hinged lower jaw, with a clear dark mouth seam.
  b.loft(
    [
      { at: face.p([0, -0.067, 0.115]), w: 0.19 * H, h: 0.105 * H },
      { at: face.p([0, -0.087, 0.215]), w: 0.135 * H, h: 0.075 * H },
      { at: face.p([0, -0.079, 0.263]), w: 0.075 * H, h: 0.049 * H },
    ],
    { bone: head, color: cream, sides: 8, caps: "flat", name: "upperMuzzle" },
  );
  ellipsoid(
    "mouthSeam",
    face.p([0, -0.121, 0.184]),
    [0.078 * H, 0.013 * H, 0.073 * H],
    C.plum,
    jaw,
  );
  ellipsoid(
    "lowerJaw",
    face.p([0, -0.138, 0.174]),
    [0.081 * H, 0.028 * H, 0.082 * H],
    cream,
    jaw,
  );
  b.extrude(
    [
      [-0.039, 0.009],
      [-0.028, 0.026],
      [0.028, 0.026],
      [0.039, 0.009],
      [0, -0.021],
    ],
    {
      at: face.p([0, -0.079, 0.27]),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.005,
      color: C.plum,
      bone: head,
      name: "foxNose",
    },
  );
  ellipsoid(
    "noseGlint",
    face.p([-0.012, -0.065, 0.285]),
    [0.012, 0.004, 0.003],
    "#ab91ae",
    head,
    8,
  );

  for (const s of [1, -1]) {
    const ear = ears[s > 0 ? 0 : 1];
    const base = face.p([s * 0.128, 0.126, -0.05]);
    b.extrude(
      [
        [-0.07, -0.015],
        [0.092, -0.02],
        [0.115, 0.13],
        [0.075, 0.295],
        [-0.025, 0.19],
      ],
      {
        at: base,
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: [0.09, 0.025],
        bevel: 0.009,
        color: coat,
        bone: ear,
        name: `outerEar${s}`,
      },
    );
    b.extrude(
      [
        [-0.039, 0.024],
        [0.062, 0.018],
        [0.079, 0.127],
        [0.064, 0.246],
        [0.004, 0.16],
      ],
      {
        at: base.clone().add(new THREE.Vector3(0, 0, 0.049)),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.008,
        color: innerEar,
        bone: ear,
      },
    );
    b.sweep(
      [
        base.clone().add(new THREE.Vector3(s * 0.075, 0.075, 0.048)),
        base.clone().add(new THREE.Vector3(s * 0.085, 0.14, 0.04)),
        base.clone().add(new THREE.Vector3(s * 0.067, 0.254, 0.018)),
      ],
      [0.009, 0.008, 0.002],
      { bone: ear, color: gold, sides: 5, caps: "flat" },
    );
    for (let k = 0; k < 3; k++) {
      tuft(
        base.clone().add(new THREE.Vector3(s * (-0.02 + k * 0.03), 0.015, 0.057)),
        [s * 0.15, 1, 0.1],
        0.07 + k * 0.009,
        0.024,
        cream,
        ear,
      );
    }
    bead(base.clone().add(new THREE.Vector3(s * 0.087, 0.107, 0.057)), 0.018, gold, ear);
    const dropTop = base.clone().add(new THREE.Vector3(s * 0.096, 0.095, 0.057));
    const dropBottom = dropTop.clone().add(new THREE.Vector3(s * 0.01, -0.073, 0.004));
    b.rod(dropTop, dropBottom, 0.0045, { bone: ear, color: gold, sides: 5 });
    glow(bead(dropBottom, 0.017, C.turquoise, ear), 0.45);
  }

  // Compact fox body, with angular fur rather than a uniformly fuzzy surface.
  b.sweep(spine, () => [0.177, 0.193], {
    color: coat,
    sides: 10,
    caps: "round",
    name: "torso",
  });
  b.sweep(neck, [0.174, 0.158, 0.125], {
    color: coat,
    sides: 10,
    caps: "round",
    name: "uprightNeck",
  });

  const bib = ellipsoid(
    "chestBib",
    [0, 0.535, 0.285],
    [0.158, 0.213, 0.105],
    cream,
    spine.joints[1],
  );
  const bibSurface = b.surface(bib);
  for (const az of [-65, -34, 0, 34, 65]) {
    const hit = bibSurface.around(bib.at).at(az, -25);
    tuft(hit.at, [Math.sin((az * Math.PI) / 180) * 0.4, -1, 0.25], 0.105, 0.041, cream, spine.joints[1]);
  }
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      tuft(
        [s * (0.115 + k * 0.012), 0.69 - k * 0.065, 0.27 - k * 0.025],
        [s * 0.85, -0.4, -0.45],
        0.105,
        0.042,
        coat,
        spine.joints[1],
      );
    }
  }

  for (const leg of legs) {
    const { chain, front, s, foot, toes } = leg;
    b.sweep(chain, front ? [0.076, 0.056, 0.036] : [0.108, 0.074, 0.039], {
      color: coat,
      sides: 8,
      caps: "round",
      name: `${front ? "fore" : "hind"}Leg${s}`,
    });

    b.sweep(chain, [0.076, 0.056, 0.036], {
      from: 0.77,
      to: 0.94,
      color: red,
      sides: 8,
      caps: "flat",
      shift: [0, 0],
      name: "vermilionSock",
    });

    ellipsoid(
      "paw",
      [foot[0], 0.067, foot[2] + 0.045],
      [0.075, 0.064, 0.095],
      cream,
      chain.tip!,
    );
    for (const toe of toes) {
      b.sweep(toe, [0.026, 0.023], {
        color: cream,
        sides: 6,
        caps: "round",
      });
      const end = toe.at(1).at;
      b.spike(
        [end.x, end.y + 0.004, end.z + 0.01],
        [0, -0.10, 1],
        0.022,
        0.009,
        { color: gold, bone: toe.joints[0], sides: 5 },
      );
    }
    const bandPath = b.surface(chain.joints[1]).loop(
      [foot[0], 0.158, foot[2] - 0.005],
      { dir: [0, 1, 0], lift: 0.004 },
    );
    b.sweep(bandPath, 0.006, { color: gold, bone: chain.joints[1], sides: 5 });
    bead([foot[0], 0.155, foot[2] + 0.044], 0.016, gold, chain.joints[1]);
    if (!front) {
      for (let k = 0; k < 2; k++) {
        tuft(
          [s * 0.207, 0.42 - k * 0.065, -0.31],
          [s * 0.35, -0.5, -1],
          0.09,
          0.033,
          cream,
          chain.joints[0],
        );
      }
    }
  }

  // Ceremonial collar, bell, and two paper wards.
  const collarLoop = catmull(
    [
      [0, 0.729, 0.475],
      [0.133, 0.745, 0.378],
      [0, 0.76, 0.255],
      [-0.133, 0.745, 0.378],
    ],
    { closed: true },
  );
  b.sweep(collarLoop, 0.024, {
    color: C.red,
    bone: neck.joints[1],
    sides: 8,
  });
  for (const dy of [-0.018, 0.018]) {
    b.sweep(
      catmull(
        [
          [0, 0.729 + dy, 0.478],
          [0.134, 0.745 + dy, 0.378],
          [0, 0.76 + dy, 0.254],
          [-0.134, 0.745 + dy, 0.378],
        ],
        { closed: true },
      ),
      0.004,
      { color: gold, bone: neck.joints[1], sides: 5 },
    );
  }
  b.part(new THREE.PlaneGeometry(0.16, 0.038), "#ffffff", {
    at: [0, 0.729, 0.5],
    texture: collarTexture,
    bone: neck.joints[1],
  });
  b.part(new THREE.TorusGeometry(0.025, 0.005, 5, 12), gold, {
    at: [0, 0.697, 0.49],
    bone: neck.joints[1],
  });
  ellipsoid("sacredBell", [0, 0.65, 0.494], [0.043, 0.044, 0.038], gold, neck.joints[1]);
  b.sweep(
    [[-0.027, 0.639, 0.522], [0, 0.632, 0.532], [0.027, 0.639, 0.522]],
    0.0035,
    { color: C.plum, bone: neck.joints[1], sides: 5 },
  );
  bead([0, 0.63, 0.529], 0.008, C.plum, neck.joints[1]);

  for (const s of [1, -1]) {
    b.sweep(
      bezier(
        [s * 0.116, 0.726, 0.414],
        [s * 0.205, 0.66, 0.41],
        [s * 0.207, 0.58, 0.375],
      ),
      0.008,
      { bone: neck.joints[0], color: C.red, sides: 6 },
    );
    b.part(new THREE.BoxGeometry(0.049, 0.11, 0.008), cream, {
      at: [s * 0.208, 0.535, 0.379],
      rotation: [0, 0, s * 10],
      bone: neck.joints[0],
    });
    b.part(new THREE.PlaneGeometry(0.047, 0.106), "#ffffff", {
      at: [s * 0.208, 0.535, 0.384],
      rotation: [0, 0, s * 10],
      texture: talismanTexture,
      bone: neck.joints[0],
    });
  }

  // Rich construction is concentrated on the nine tails.
  for (const tail of tails) {
    const { chain, path, dx, dy, i } = tail;
    const tube = b.sweep(
      chain,
      (t) => {
        const r =
          t < 0.19
            ? 0.055 + (t / 0.19) * 0.035
            : t < 0.60
              ? 0.09 + Math.sin(((t - 0.19) / 0.41) * Math.PI * 0.72) * 0.035
              : 0.121 * Math.pow(Math.max(0, (1 - t) / 0.4), 0.8);
        return [r, r * 0.79];
      },
      {
        color: coat,
        bands: [
          [0.704, coat],
          [0.727, gold],
          [0.91, red],
          [1, C.scarlet],
        ],
        sides: 8,
        smooth: false,
        caps: { start: "round", end: "point" },
        name: `tail${i + 1}Plume`,
      },
    );

    // Fine gold fillets travel with the individual tail's skeleton.
    for (const angle of [-90, 90]) {
      b.sweep(tube.line(angle, 0.001).slice(0.36, 0.705), [0.002, 0.004, 0.002], {
        color: gold,
        sides: 5,
        name: `tail${i + 1}Fillet`,
      });
    }

    const sealPoint = path.at(0.81);
    b.decal(tube, tailTexture, {
      at: sealPoint.clone().add(new THREE.Vector3(0, 0, 0.16)),
      dir: [0, 0, 1],
      size: [0.091, 0.143],
      roll: (-Math.atan2(dx, dy) * 180) / Math.PI,
      lift: 0.002,
      name: `tail${i + 1}CelestialSeal`,
    });

    // Two pairs of broad, swept fur barbs break the clean tube silhouette.
    for (const t of [0.47, 0.60]) {
      for (const side of [-1, 1]) {
        const hit = tube.at(t, side * 90);
        const tangent = chain.at(t).tangent;
        const outward = hit.n;
        const dir = tangent.clone().multiplyScalar(0.9).addScaledVector(outward, 0.5);
        tuft(hit.at, dir.toArray(), 0.095, 0.026, coat, hit.bone!);
      }
    }

    const tip = path.at(1);
    const fireBase = tip.clone().add(new THREE.Vector3(dx * 0.075, 0.11 + dy * 0.025, 0.015));
    const fireHeight = 0.18 + random() * 0.055;
    foxfire(fireBase, fireHeight, i % 2 === 0 ? 1 : -1, chain.joints[3], i);
  }

  function foxfire(
    base: THREE.Vector3,
    height: number,
    bend: number,
    bone: Joint,
    index: number,
  ) {
    const w = height * 0.35;
    const flameOutline = [
      [-w * 0.30, 0],
      [-w * 0.88, height * 0.17],
      [-w, height * 0.35],
      [-w * 0.48, height * 0.62],
      [-w * 0.33, height * 0.40],
      [w * bend * 0.47, height * 0.74],
      [w * bend * 0.65, height],
      [w * 0.92, height * 0.60],
      [w * 0.79, height * 0.28],
      [w * 0.31, 0],
    ];
    // Flip only the placement of the flame's interior curl. The outline itself
    // stays a simple non-crossing silhouette for either bend direction.
    const safeOutline = bend > 0
      ? flameOutline
      : flameOutline.map(([x, y]) => [-x, y]).reverse();

    glow(
      b.extrude(safeOutline, {
        at: base,
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: height * 0.27,
        bevel: 0.009,
        color: C.blue,
        bone,
        name: `foxfire${index + 1}Outer`,
      }),
      0.8,
    );

    glow(
      b.extrude(
        [
          [-w * 0.2, height * 0.025],
          [-w * 0.61, height * 0.20],
          [-w * 0.55, height * 0.39],
          [w * 0.08, height * 0.60],
          [w * 0.34, height * 0.83],
          [w * 0.57, height * 0.42],
          [w * 0.43, height * 0.16],
          [w * 0.18, height * 0.025],
        ],
        {
          at: base.clone().add(new THREE.Vector3(0, 0, height * 0.145)),
          x: [bend, 0, 0],
          y: [0, 1, 0],
          thickness: 0.012,
          color: C.turquoise,
          bone,
          name: `foxfire${index + 1}Inner`,
        },
      ),
      1.3,
    );

    glow(
      b.extrude(
        [
          [-w * 0.12, height * 0.065],
          [-w * 0.29, height * 0.21],
          [-w * 0.13, height * 0.39],
          [w * 0.18, height * 0.56],
          [w * 0.25, height * 0.29],
          [w * 0.21, height * 0.12],
        ],
        {
          at: base.clone().add(new THREE.Vector3(0, 0, height * 0.19)),
          x: [bend, 0, 0],
          y: [0, 1, 0],
          thickness: 0.009,
          color: C.light,
          bone,
          name: `foxfire${index + 1}Heart`,
        },
      ),
      1.7,
    );

    // A three-dimensional pale flamelet prevents the fire reading as just a card.
    glow(
      b.sweep(
        bezier(
          base.clone().add(new THREE.Vector3(0, height * 0.09, 0)),
          base.clone().add(new THREE.Vector3(-bend * w * 0.35, height * 0.31, -0.015)),
          base.clone().add(new THREE.Vector3(bend * w * 0.2, height * 0.64, 0)),
        ),
        [height * 0.095, height * 0.075, 0],
        { color: C.mint, bone, sides: 5, caps: "flat" },
      ),
      1.0,
    );

    for (let j = 0; j < 2; j++) {
      const p = base.clone().add(
        new THREE.Vector3(
          bend * (j === 0 ? -w * 1.0 : w * 0.72),
          height * (0.64 + j * 0.54),
          0.015,
        ),
      );
      glow(
        b.part(new THREE.OctahedronGeometry(j === 0 ? 0.013 : 0.009), C.mint, {
          at: p,
          scale: [0.7, 1.55, 0.7],
          bone,
          name: `foxfire${index + 1}Spark${j + 1}`,
        }),
        1.4,
      );
    }
  }

  return b.root;
}
