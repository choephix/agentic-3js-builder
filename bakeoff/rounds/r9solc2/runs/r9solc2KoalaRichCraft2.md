```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  rng,
  svg,
} from "agentic-3js-builder";
import type { Joint, Paint } from "agentic-3js-builder";
import {
  pixelTexture,
  cellPaint,
} from "agentic-3js-builder/kits/pixel";

export const meta = {
  name: "Eucalyptus Embrace",
  description:
    "A softly rounded voxel koala holding a eucalyptus climbing stand, with enormous woolly ears, glossy pixel eyes, opposed thumbs and silver-green foliage.",
};

export default function build(): THREE.Object3D {
  /*
   * 1. Replace the extruded, box-shaped head with a genuinely rounded voxel
   *    volume. The profile now reads as a koala, not a rectangular helmet.
   * 2. Widen and lower the fluffy ears; enlarge the eyes and simplify their
   *    highlights. Round the nose and tuck the muzzle into the face.
   * 3. Replace angular limb armour with chunky voxel-rounded limbs, remove
   *    the projecting chest shield, and paint the cream bib onto the fur.
   * 4. Unify the pixel scale, soften fur contrast, and add fuller eucalyptus
   *    clusters without obstructing the face or the gripping hands.
   */

  const b = createBuilder({
    name: "Eucalyptus Embrace",
    detail: 0.8,
    paintSize: 2048,
  });
  const random = rng(4619);

  const INK = "#2b3c43";
  const CLAW = "#29383c";
  const PALE = "#e0e5d7";
  const WOOL = "#bccac5";
  const DARK_WOOL = "#8ca1a3";
  const TEAL = "#719b84";
  const GOLD = "#cfb47b";
  const VOXEL = 0.018;

  const furRamp = [
    "#71878d",
    "#879da1",
    "#9cafb1",
    "#b1c1c0",
    "#c4d0ca",
    "#d6ddd2",
  ];
  const creamRamp = [
    "#b3c2b6",
    "#cbd5c4",
    "#dde3ce",
    "#e9ead6",
    "#f0eddb",
  ];
  const barkRamp = [
    "#544c42",
    "#6c6350",
    "#88785e",
    "#a49070",
    "#b6a487",
    "#c7b79a",
  ];

  const fur = cellPaint(VOXEL, (c) =>
    c.pick(
      furRamp,
      0.48 +
        c.n.y * 0.12 +
        c.n.z * 0.08 +
        (c.random(8) - 0.5) * 0.075,
    ),
  );
  const lightFur = cellPaint(VOXEL, (c) =>
    c.pick(
      creamRamp,
      0.57 + c.n.y * 0.11 + (c.random(3) - 0.5) * 0.09,
    ),
  );
  const earFur = cellPaint(VOXEL, (c) =>
    c.pick(
      furRamp,
      0.49 + c.n.y * 0.12 + (c.random(18) - 0.5) * 0.095,
    ),
  );
  const bark = cellPaint(0.014, (c) => {
    const vertical = Math.sin(c.at.x * 116 + c.at.z * 97);
    const stripe = vertical > 0.62 ? -0.15 : vertical < -0.72 ? 0.14 : 0;
    return c.pick(
      barkRamp,
      0.46 + c.n.y * 0.12 + stripe + (c.random(25) - 0.5) * 0.13,
    );
  });
  const earth = cellPaint(0.024, (c) =>
    c.pick(
      ["#314d46", "#405b4c", "#546a50", "#657857", "#7d8662"],
      0.32 + c.n.y * 0.2 + (c.random(12) - 0.5) * 0.25,
    ),
  );
  const stone = cellPaint(0.02, (c) =>
    c.pick(
      ["#627574", "#80918a", "#9ca89a", "#bac0aa"],
      0.32 + c.n.y * 0.28 + (c.random(9) - 0.5) * 0.25,
    ),
  );

  // Skeleton precedes all geometry.
  const stage = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", {
    parent: stage,
    at: [0, 0.47, -0.035],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [hips, [0, 0.63, -0.025], [0, 0.775, 0]],
    {
      parent: hips,
      names: ["spineLower", "chest", "spineTop"],
      role: "spine",
    },
  );
  const neck = b.chain(
    "neck",
    [[0, 0.77, 0], [0, 0.86, 0.005]],
    {
      parent: spine.tip!,
      names: ["neck", "neckTop"],
      role: "neck",
    },
  );
  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 0.975, 0.01],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.85, 0.145],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const ears: { side: number; joint: Joint }[] = [];
  const limbs: {
    side: number;
    arm: ReturnType<typeof b.chain>;
    leg: ReturnType<typeof b.chain>;
    fingers: ReturnType<typeof b.chain>[];
    toes: ReturnType<typeof b.chain>[];
    thumbFlags: boolean[];
  }[] = [];

  for (const s of [1, -1]) {
    const suffix = s === 1 ? "L" : "R";
    ears.push({
      side: s,
      joint: b.joint(`ear${suffix}`, {
        parent: head,
        at: [s * 0.294, 1.063, -0.018],
        dir: [0, 0, 1],
        role: "hinge",
      }),
    });

    const arm = b.chain(
      `arm${suffix}`,
      [
        [s * 0.177, 0.751, 0.005],
        [s * 0.282, 0.703, 0.105],
        [s * 0.275, 0.692, 0.259],
      ],
      {
        parent: spine.joints[1],
        names: [`shoulder${suffix}`, `elbow${suffix}`, `wrist${suffix}`],
        role: "arm",
      },
    );
    const leg = b.chain(
      `leg${suffix}`,
      [
        [s * 0.13, 0.453, -0.027],
        [s * 0.204, 0.365, 0.045],
        [s * 0.16, 0.315, 0.179],
      ],
      {
        parent: hips,
        names: [`hip${suffix}`, `knee${suffix}`, `ankle${suffix}`],
        role: "leg",
        contact: [s * 0.16, 0.273, 0.164],
      },
    );

    const fingers: ReturnType<typeof b.chain>[] = [];
    const thumbFlags: boolean[] = [];
    for (let i = 0; i < 3; i++) {
      const x = s * (0.253 + i * 0.022);
      fingers.push(
        b.chain(
          `finger${suffix}${i + 1}`,
          [
            [x, 0.713, 0.282],
            [x, 0.685, 0.316],
            [x, 0.642, 0.291],
          ],
          {
            parent: arm.tip!,
            names: [
              `finger${suffix}${i + 1}Base`,
              `finger${suffix}${i + 1}Tip`,
            ],
            role: "digit",
          },
        ),
      );
      thumbFlags.push(false);
    }
    for (let i = 0; i < 2; i++) {
      fingers.push(
        b.chain(
          `thumb${suffix}${i + 1}`,
          [
            [s * (0.24 - i * 0.019), 0.687, 0.256],
            [s * (0.227 - i * 0.019), 0.657, 0.222],
            [s * (0.231 - i * 0.019), 0.633, 0.245],
          ],
          {
            parent: arm.tip!,
            names: [
              `thumb${suffix}${i + 1}Base`,
              `thumb${suffix}${i + 1}Tip`,
            ],
            role: "digit",
          },
        ),
      );
      thumbFlags.push(true);
    }

    const toes: ReturnType<typeof b.chain>[] = [];
    for (let i = 0; i < 3; i++) {
      const x = s * (0.134 + i * 0.026);
      toes.push(
        b.chain(
          `toe${suffix}${i + 1}`,
          [
            [x, 0.321, 0.205],
            [x, 0.289, 0.237],
            [x, 0.255, 0.209],
          ],
          {
            parent: leg.tip!,
            names: [`toe${suffix}${i + 1}Base`, `toe${suffix}${i + 1}Tip`],
            role: "digit",
          },
        ),
      );
    }
    limbs.push({ side: s, arm, leg, fingers, toes, thumbFlags });
  }

  /*
   * Exposed voxel faces only: one primitive-built volume, not hundreds of
   * overlapping cubes. A rounded form remains stepped from every angle.
   */
  function voxelGeometry(
    lower: number[],
    upper: number[],
    step: number,
    inside: (x: number, y: number, z: number) => boolean,
  ): THREE.BufferGeometry {
    const lo = lower.map((v) => Math.floor(v / step));
    const hi = upper.map((v) => Math.ceil(v / step));
    const filled = new Set<string>();
    const key = (x: number, y: number, z: number) => `${x},${y},${z}`;

    for (let x = lo[0]; x < hi[0]; x++) {
      for (let y = lo[1]; y < hi[1]; y++) {
        for (let z = lo[2]; z < hi[2]; z++) {
          if (inside((x + 0.5) * step, (y + 0.5) * step, (z + 0.5) * step)) {
            filled.add(key(x, y, z));
          }
        }
      }
    }

    const directions = [
      {
        n: [1, 0, 0],
        corners: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]],
      },
      {
        n: [-1, 0, 0],
        corners: [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]],
      },
      {
        n: [0, 1, 0],
        corners: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]],
      },
      {
        n: [0, -1, 0],
        corners: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]],
      },
      {
        n: [0, 0, 1],
        corners: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]],
      },
      {
        n: [0, 0, -1],
        corners: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]],
      },
    ];

    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    for (const cell of filled) {
      const [x, y, z] = cell.split(",").map(Number);
      for (const face of directions) {
        const n = face.n;
        if (filled.has(key(x + n[0], y + n[1], z + n[2]))) continue;
        const start = positions.length / 3;
        for (let i = 0; i < 4; i++) {
          const c = face.corners[i];
          positions.push((x + c[0]) * step, (y + c[1]) * step, (z + c[2]) * step);
          normals.push(n[0], n[1], n[2]);
          uvs.push(i === 1 || i === 2 ? 1 : 0, i >= 2 ? 1 : 0);
        }
        indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    return geometry;
  }

  function woolVolume(
    center: number[],
    radius: number[],
    color: string | Paint,
    bone: Joint,
    name: string,
    step = VOXEL,
  ) {
    const lower = center.map((v, i) => v - radius[i]);
    const upper = center.map((v, i) => v + radius[i]);
    const geometry = voxelGeometry(lower, upper, step, (x, y, z) => {
      const dx = (x - center[0]) / radius[0];
      const dy = (y - center[1]) / radius[1];
      const dz = (z - center[2]) / radius[2];
      return dx * dx + dy * dy + dz * dz <= 1;
    });
    return b.part(geometry, color, { at: [0, 0, 0], bone, name });
  }

  function woolSegment(
    a: THREE.Vector3,
    end: THREE.Vector3,
    r0: number,
    r1: number,
    bone: Joint,
    name: string,
  ) {
    const radius = Math.max(r0, r1);
    const lower = [
      Math.min(a.x, end.x) - radius,
      Math.min(a.y, end.y) - radius,
      Math.min(a.z, end.z) - radius,
    ];
    const upper = [
      Math.max(a.x, end.x) + radius,
      Math.max(a.y, end.y) + radius,
      Math.max(a.z, end.z) + radius,
    ];
    const d = end.clone().sub(a);
    const lengthSquared = d.lengthSq();
    const geometry = voxelGeometry(lower, upper, VOXEL, (x, y, z) => {
      const t = THREE.MathUtils.clamp(
        ((x - a.x) * d.x + (y - a.y) * d.y + (z - a.z) * d.z) / lengthSquared,
        0,
        1,
      );
      const radiusAt = r0 + (r1 - r0) * t;
      const dx = x - a.x - d.x * t;
      const dy = y - a.y - d.y * t;
      const dz = z - a.z - d.z * t;
      return dx * dx + dy * dy + dz * dz <= radiusAt * radiusAt;
    });
    return b.part(geometry, fur, { at: [0, 0, 0], bone, name });
  }

  function box(
    at: number[],
    size: number[],
    color: string | Paint,
    bone: Joint = stage,
    name?: string,
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at, bone, name,
    });
  }

  function plate(
    at: number[],
    width: number,
    height: number,
    texture: THREE.Texture,
    bone: Joint,
    dir: number[] = [0, 0, 1],
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at, bone, dir, axis: "z", texture,
    });
  }

  // Drawings share the same hard-edged atlas sampler as the painted voxels.
  const eyeTexture = pixelTexture(24, 26, (g) => {
    for (let y = 0; y < 26; y++) {
      for (let x = 0; x < 24; x++) {
        const d = ((x - 11.5) / 9.7) ** 2 + ((y - 12.5) / 11.4) ** 2;
        if (d > 1) continue;
        let col = d > 0.79 ? "#607a7b" : "#23353d";
        if (y >= 16 && y <= 21 && x >= 7 && x <= 17 && d < 0.73) {
          col = "#6e7e6d";
        }
        if (x >= 10 && x <= 14 && y >= 8 && y <= 19) col = "#23353d";
        if (x >= 6 && x <= 10 && y >= 5 && y <= 9) col = "#fff8e3";
        if (x === 6 && y === 9) col = "#c9d6cc";
        if (x >= 16 && x <= 17 && y >= 17 && y <= 18) col = "#e3e7d5";
        g.set(x, y, col);
      }
    }
  });

  const noseTexture = pixelTexture(20, 26, (g) => {
    for (let y = 0; y < 26; y++) {
      for (let x = 0; x < 20; x++) {
        const d = ((x - 9.5) / 10) ** 2 + ((y - 12.5) / 13.5) ** 2;
        if (d > 1) continue;
        let col = x < 10 && y < 15 ? "#3b515b" : "#2b3e46";
        if (x >= 4 && x <= 7 && y >= 4 && y <= 8) col = "#849394";
        if (x >= 3 && x <= 5 && y >= 8 && y <= 10) col = "#617b80";
        if (y > 21) col = "#25373e";
        g.set(x, y, col);
      }
    }
  });

  const innerEarTexture = pixelTexture(28, 30, (g) => {
    for (let y = 0; y < 30; y++) {
      for (let x = 0; x < 28; x++) {
        const dx = (x - 13.5) / 13;
        const dy = (y - 14.5) / 14;
        const d = dx * dx + dy * dy;
        const tooth = ((x * 7 + y * 11) % 11) / 11;
        if (d > 0.9 - (tooth > 0.7 ? 0.14 : 0)) continue;
        let col = d > 0.6 ? "#c4d1c5" : "#e5e9d8";
        if (d > 0.48 && tooth > 0.75) col = "#a4bab4";
        if (y > 21 && Math.abs(x - 14) < 6) col = "#ccd6c6";
        if (y < 14 && tooth < 0.2) col = "#f1efde";
        g.set(x, y, col);
      }
    }
  });

  const chestTexture = pixelTexture(28, 34, (g) => {
    for (let y = 0; y < 34; y++) {
      for (let x = 0; x < 28; x++) {
        const t = y / 33;
        const hw = Math.floor(9 + Math.sin(t * Math.PI) * 4 - t * 3);
        if (Math.abs(x - 13.5) > hw || y > 32 - (x % 4 === 0 ? 2 : 0)) continue;
        if (y < 2 && Math.abs(x - 13.5) > 7) continue;
        const hash = (x * 13 + y * 7) % 19;
        g.set(
          x,
          y,
          hash < 2 ? "#cbd7c5" : hash > 16 ? "#edead7" : "#dfe5d0",
        );
      }
    }
  });

  const cutTexture = pixelTexture(32, 32, (g) => {
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        const dx = Math.abs(x - 15.5);
        const dy = Math.abs(y - 15.5);
        const r = Math.max(dx, dy) + Math.min(dx, dy) * 0.33;
        if (r > 17.5) continue;
        let col = Math.floor(r / 3) % 2 ? "#bfaa7b" : "#ddc89b";
        if (r > 14) col = "#6c6551";
        if (x > 15 && y === 15 + Math.floor((x - 16) / 4)) col = "#8e7d59";
        g.set(x, y, col);
      }
    }
  });

  const leafTexture = pixelTexture(18, 48, (g) => {
    for (let y = 0; y < 48; y++) {
      const t = y / 47;
      const center = 8 + Math.floor(Math.sin(t * 3.5) * 2);
      const half = Math.max(0, Math.floor(Math.sin(Math.PI * t) * 6));
      for (let x = center - half; x <= center + half; x++) {
        let col = x < center ? "#adc9ac" : "#84ae96";
        if (x === center) col = "#d3dfb7";
        if (Math.abs(x - center) === half) col = "#648f80";
        if (y % 8 === 2 && x === center - 2) col = "#c3d4af";
        g.set(x, y, col);
      }
    }
  });

  const labelTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 64">
      <rect width="192" height="64" fill="#253e3b"/>
      <path d="M4 4H188V60H4Z" fill="none" stroke="#aabd96" stroke-width="3"/>
      <path d="M13 18H19V24H13ZM173 18H179V24H173Z" fill="#cdb984"/>
      <text x="96" y="29" text-anchor="middle" font-family="monospace"
        font-size="22" font-weight="bold" fill="#e7e7cb">KOALA</text>
      <text x="96" y="48" text-anchor="middle" font-family="monospace"
        font-size="10" font-weight="bold" fill="#aabd96">EUCALYPTUS GROVE</text>
    </svg>`,
    { size: 384, pixelated: true },
  );

  function branch(points: number[][], radii: number[], name: string) {
    return b.sweep(points, radii, {
      bone: stage,
      color: bark,
      sides: 6,
      smooth: false,
      caps: "flat",
      name,
    });
  }

  function endGrain(at: number[], radius: number, dir: number[]) {
    b.part(new THREE.CircleGeometry(radius, 8), "#ffffff", {
      at, bone: stage, dir, axis: "z", texture: cutTexture,
      name: "exposedEndGrain",
    });
  }

  // Compact botanical display stand.
  b.part(new THREE.CylinderGeometry(0.545, 0.555, 0.058, 12), "#29443f", {
    at: [0, 0.029, 0.015], scale: [1, 1, 0.73],
    bone: stage, name: "darkCutBase",
  });
  b.part(new THREE.CylinderGeometry(0.531, 0.536, 0.019, 12), earth, {
    at: [0, 0.066, 0.015], scale: [1, 1, 0.73],
    bone: stage, name: "groveFloor",
  });
  b.part(new THREE.CylinderGeometry(0.548, 0.548, 0.009, 12), "#91a486", {
    at: [0, 0.016, 0.015], scale: [1, 1, 0.73],
    bone: stage, name: "baseInlay",
  });

  const trunk = branch(
    [
      [0.335, 0.07, -0.055],
      [0.353, 0.36, -0.012],
      [0.385, 0.65, 0.075],
      [0.421, 0.91, -0.015],
      [0.455, 1.156, -0.047],
    ],
    [0.069, 0.061, 0.05, 0.038, 0.027],
    "eucalyptusTrunk",
  );
  endGrain([0.455, 1.157, -0.047], 0.027, [0.13, 0.98, -0.13]);

  branch(
    [
      [0.371, 0.64, 0.07],
      [0.325, 0.662, 0.236],
      [0.06, 0.658, 0.253],
      [-0.25, 0.661, 0.25],
      [-0.415, 0.694, 0.224],
    ],
    [0.047, 0.039, 0.036, 0.033, 0.025],
    "handholdBranch",
  );
  endGrain([-0.416, 0.694, 0.224], 0.025, [-1, 0.17, -0.1]);

  branch(
    [
      [0.349, 0.256, -0.012],
      [0.26, 0.277, 0.16],
      [-0.02, 0.275, 0.172],
      [-0.29, 0.282, 0.153],
    ],
    [0.046, 0.039, 0.034, 0.025],
    "footrestBranch",
  );
  endGrain([-0.291, 0.282, 0.153], 0.025, [-1, 0.02, -0.05]);

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    b.rod(
      [0.335, 0.12, -0.055],
      [0.335 + Math.cos(a) * 0.13, 0.078, -0.055 + Math.sin(a) * 0.095],
      [0.035, 0.016],
      { color: bark, bone: stage, sides: 5, smooth: false },
    );
  }

  const trunkSkin = b.surface(trunk);
  for (let i = 0; i < 14; i++) {
    const y = 0.17 + i * 0.063;
    const hit = trunkSkin.nearest([
      0.344 + (y - 0.17) * 0.1 + (i % 2 ? 0.055 : -0.055),
      y,
      0.10,
    ]);
    b.stick(
      new THREE.BoxGeometry(
        0.014 + random() * 0.013,
        0.007,
        0.035 + random() * 0.035,
      ),
      i % 3 ? "#b5a78b" : "#746b56",
      hit,
      { embed: 0.5, flow: [0, 1, 0], name: "peelingBark" },
    );
  }

  // Soft, pear-shaped voxel body with an uninterrupted fur silhouette.
  const torso = b.loft(
    [
      { at: [0, 0.385, -0.025], w: 0.25, h: 0.22 },
      { at: [0, 0.455, -0.036], w: 0.365, h: 0.294 },
      { at: [0, 0.605, -0.017], w: 0.385, h: 0.305 },
      { at: [0, 0.732, 0.002], w: 0.32, h: 0.265 },
      { at: [0, 0.8, 0.002], w: 0.22, h: 0.2 },
    ],
    {
      bone: [hips, spine, neck],
      color: fur,
      sides: 10,
      smooth: false,
      caps: "round",
      name: "woollyTorso",
    },
  );

  woolVolume([0, 0.795, 0.005], [0.123, 0.087, 0.12], fur, neck.joints[0], "neckWool");
  b.decal(torso, chestTexture, {
    at: [0, 0.638, 0.16],
    dir: [0, 0, 1],
    size: [0.263, 0.299],
    segments: 10,
    lift: 0.002,
    name: "creamFurBib",
  });

  const skull = woolVolume(
    [0, 0.973, 0.01],
    [0.247, 0.185, 0.191],
    fur,
    head,
    "roundedVoxelHead",
  );

  // Facial drawings follow the head's stepped front instead of hovering flat.
  for (const s of [1, -1]) {
    b.decal(skull, eyeTexture, {
      at: [s * 0.108, 1.009, 0.208],
      dir: [0, 0, 1],
      size: [0.119, 0.128],
      segments: 9,
      lift: 0.0025,
      bone: head,
      mirror: s < 0,
      name: s > 0 ? "eyeL" : "eyeR",
    });
    const browHit = b.surface(skull).nearest([s * 0.106, 1.079, 0.19]);
    b.stick(
      new THREE.BoxGeometry(0.042, 0.009, 0.012),
      WOOL,
      browHit,
      { embed: 0.5, bone: head, flow: [0, 1, 0], name: "softBrowWool" },
    );
  }

  // A small integrated muzzle avoids the former pale, protruding moustache.
  woolVolume(
    [0, 0.874, 0.158],
    [0.09, 0.034, 0.04],
    lightFur,
    head,
    "upperMuzzle",
    0.012,
  );
  woolVolume(
    [0, 0.851, 0.167],
    [0.062, 0.019, 0.029],
    lightFur,
    jaw,
    "lowerJaw",
    0.012,
  );

  const nose = woolVolume(
    [0, 0.948, 0.205],
    [0.065, 0.082, 0.055],
    INK,
    head,
    "roundedLeatheryNose",
    0.012,
  );
  b.decal(nose, noseTexture, {
    at: [0, 0.948, 0.265],
    dir: [0, 0, 1],
    size: [0.128, 0.163],
    segments: 10,
    lift: 0.0017,
    bone: head,
    name: "nosePixelHighlight",
  });

  box([0, 0.865, 0.197], [0.009, 0.017, 0.006], INK, head, "philtrum");
  for (const s of [1, -1]) {
    box(
      [s * 0.015, 0.856, 0.196],
      [0.025, 0.006, 0.006],
      INK, jaw, "quietSmile",
    );
    box(
      [s * 0.029, 0.86, 0.193],
      [0.007, 0.01, 0.006],
      INK, jaw, "smileCorner",
    );
  }

  // Big lateral discs, with woolly pixel fringes around the pale inner ears.
  for (const ear of ears) {
    const s = ear.side;
    const center = [s * 0.294, 1.063, -0.018];
    const outer = woolVolume(
      center,
      [0.145, 0.145, 0.064],
      earFur,
      ear.joint,
      s > 0 ? "fluffyEarL" : "fluffyEarR",
    );
    b.decal(outer, innerEarTexture, {
      at: [center[0], center[1], 0.055],
      dir: [0, 0, 1],
      size: [0.248, 0.258],
      segments: 9,
      lift: 0.002,
      bone: ear.joint,
      name: "creamInnerEar",
    });

    for (let i = 0; i < 13; i++) {
      const a = (i / 13) * Math.PI * 2;
      const hit = b.surface(outer).nearest([
        center[0] + Math.cos(a) * 0.142,
        center[1] + Math.sin(a) * 0.142,
        0.018,
      ]);
      b.stick(
        new THREE.BoxGeometry(0.019, 0.014, 0.025),
        i % 4 === 0 ? PALE : WOOL,
        hit,
        {
          embed: 0.5,
          bone: ear.joint,
          flow: [0, 0, 1],
          name: "earFringePixel",
        },
      );
    }
  }

  // Short, rounded cheek tufts repeat the woolly ear motif.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const hit = b.surface(skull).nearest([
        s * (0.223 - i * 0.013),
        0.955 - i * 0.035,
        0.09,
      ]);
      b.stick(
        new THREE.BoxGeometry(0.034, 0.014, 0.03),
        i === 2 ? lightFur : fur,
        hit,
        {
          embed: 0.6,
          bone: head,
          flow: [0, -1, 0],
          name: "cheekWoolTuft",
        },
      );
    }
  }

  for (const entry of limbs) {
    const s = entry.side;
    const armJoints = entry.arm.joints;
    const legJoints = entry.leg.joints;

    woolSegment(
      armJoints[0].at, armJoints[1].at,
      0.074, 0.068, armJoints[0], "woollyUpperArm",
    );
    woolSegment(
      armJoints[1].at, armJoints[2].at,
      0.068, 0.049, armJoints[1], "woollyForearm",
    );
    woolVolume(
      [s * 0.165, 0.428, -0.03],
      [0.112, 0.12, 0.117],
      fur, legJoints[0], "roundHaunch",
    );
    woolSegment(
      legJoints[0].at, legJoints[1].at,
      0.078, 0.071, legJoints[0], "woollyThigh",
    );
    woolSegment(
      legJoints[1].at, legJoints[2].at,
      0.068, 0.044, legJoints[1], "woollyShin",
    );

    woolVolume(
      [s * 0.271, 0.698, 0.26],
      [0.055, 0.039, 0.048],
      fur, entry.arm.tip!, "graspingPalm", 0.012,
    );
    woolVolume(
      [s * 0.16, 0.319, 0.182],
      [0.059, 0.033, 0.05],
      fur, entry.leg.tip!, "hindPaw", 0.012,
    );

    entry.fingers.forEach((finger, i) => {
      b.sweep(finger, [0.0145, 0.011], {
        color: i === 1 ? lightFur : fur,
        sides: 4,
        smooth: false,
        caps: "flat",
        name: entry.thumbFlags[i] ? "opposedThumb" : "curledFinger",
      });
      const tip = finger.at(1);
      b.spike(
        tip,
        [
          tip.at.x,
          tip.at.y - 0.017,
          tip.at.z + (entry.thumbFlags[i] ? 0.013 : -0.013),
        ],
        null,
        0.007,
        {
          color: CLAW,
          bone: finger.joints[finger.joints.length - 1],
          sides: 4,
        },
      );
      b.part(new THREE.BoxGeometry(0.016, 0.011, 0.015), WOOL, {
        at: finger.at(0.4),
        bone: finger.joints[0],
        name: "knucklePixel",
      });
    });

    entry.toes.forEach((toe) => {
      b.sweep(toe, [0.017, 0.012], {
        color: fur,
        sides: 4,
        smooth: false,
        caps: "flat",
        name: "grippingToe",
      });
      const tip = toe.at(1);
      b.spike(
        tip,
        [tip.at.x, tip.at.y - 0.016, tip.at.z - 0.01],
        null,
        0.008,
        {
          color: CLAW,
          bone: toe.joints[toe.joints.length - 1],
          sides: 4,
        },
      );
    });

    // A few broad wool pixels, not high-contrast speckling over every surface.
    for (let i = 0; i < 3; i++) {
      box(
        [
          s * (0.204 + i * 0.019),
          0.766 - i * 0.014,
          0.055 + i * 0.016,
        ],
        [0.021, 0.013, 0.022],
        WOOL,
        entry.arm.joints[0],
        "shoulderWool",
      );
    }
  }

  const woolHits = b.surface(torso).scatter(12, {
    rng: rng(72),
    minDist: 0.055,
    filter: (h) => h.n.z < 0.35 && h.n.y > -0.35,
  });
  woolHits.forEach((hit, i) => {
    b.stick(
      new THREE.BoxGeometry(0.022, 0.007, 0.023),
      i % 3 === 0 ? WOOL : DARK_WOOL,
      hit,
      { embed: 0.6, name: "squareWoolFleck" },
    );
  });

  // Foliage frames the animal at the sides and behind its ears.
  const sprigs = [
    {
      points: [
        [0.424, 0.934, -0.02],
        [0.505, 1.039, -0.048],
        [0.548, 1.115, -0.073],
      ],
      side: 1,
    },
    {
      points: [
        [0.447, 1.091, -0.038],
        [0.4, 1.174, -0.13],
        [0.355, 1.216, -0.18],
      ],
      side: -1,
    },
    {
      points: [
        [-0.354, 0.682, 0.235],
        [-0.442, 0.752, 0.18],
        [-0.482, 0.825, 0.148],
      ],
      side: -1,
    },
    {
      points: [
        [0.355, 0.394, -0.004],
        [0.47, 0.461, -0.072],
        [0.505, 0.542, -0.098],
      ],
      side: 1,
    },
  ];

  for (let index = 0; index < sprigs.length; index++) {
    const sprig = sprigs[index];
    b.sweep(sprig.points, [0.012, 0.006, 0.003], {
      color: bark,
      bone: stage,
      sides: 4,
      smooth: false,
      caps: "flat",
      name: "leafTwig",
    });
    const route = catmull(sprig.points);

    for (let i = 0; i < 6; i++) {
      const p = route.at(0.19 + i * 0.155);
      const side = i % 2 ? -1 : 1;
      const leafRoot = [
        p.x + side * 0.029,
        p.y + 0.01,
        p.z + (i % 3 - 1) * 0.018,
      ];
      b.rod([p.x, p.y, p.z], leafRoot, 0.003, {
        color: TEAL,
        bone: stage,
        sides: 4,
      });
      const frames = [
        frame(leafRoot, [
          -(side * 0.4 + sprig.side * 0.2),
          0.94,
          -0.13,
        ]),
      ];
      b.cards(frames, leafTexture, {
        size: [0.059 + (i % 3) * 0.004, 0.139 + (i % 3) * 0.019],
        flow: [index % 2 ? 0.28 : -0.15, 0, 1],
        lean: 180,
        bend: 0,
        sink: 0,
        bone: stage,
        name: "silverGreenEucalyptusLeaf",
      });
    }

    // Small squared gum-nut clusters are secondary, natural botanical detail.
    if (index === 0 || index === 2) {
      const p = route.at(0.72);
      for (let j = 0; j < 3; j++) {
        const at = [p.x + (j - 1) * 0.015, p.y - 0.024, p.z - 0.012];
        b.rod([p.x, p.y, p.z], at, 0.0025, {
          color: TEAL, bone: stage, sides: 4,
        });
        box(at, [0.014, 0.016, 0.014], "#a9b58f", stage, "gumNut");
        box(
          [at[0], at[1] - 0.008, at[2]],
          [0.01, 0.004, 0.01],
          "#5c7868",
          stage,
          "gumNutRim",
        );
      }
    }
  }

  const rockPositions = [
    [-0.36, 0.095, -0.13],
    [-0.29, 0.091, -0.19],
    [0.16, 0.096, -0.22],
    [0.424, 0.098, 0.136],
    [-0.43, 0.092, 0.08],
  ];
  for (let i = 0; i < rockPositions.length; i++) {
    b.part(new THREE.DodecahedronGeometry(1, 0), stone, {
      at: rockPositions[i],
      scale: [0.045 + (i % 2) * 0.015, 0.023, 0.035],
      bone: stage,
      flat: true,
      name: "groveStone",
    });
  }

  for (let i = 0; i < 11; i++) {
    const a = random() * Math.PI * 2;
    const r = 0.24 + random() * 0.19;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r * 0.66;
    if (Math.abs(x) < 0.2 && z > 0.15) continue;
    b.cards([frame([x, 0.078, z], [0, 1, 0])], leafTexture, {
      size: [0.032, 0.083],
      lean: 90,
      flow: [Math.cos(a + 1), 0, Math.sin(a + 1)],
      mirror: true,
      sink: 0,
      bone: stage,
      name: "fallenLeaf",
    });
  }

  for (let i = 0; i < 8; i++) {
    const x = -0.32 + random() * 0.63;
    const z = -0.19 + random() * 0.29;
    b.part(
      new THREE.BoxGeometry(
        0.015 + random() * 0.02,
        0.009,
        0.039 + random() * 0.03,
      ),
      i % 2 ? "#b4a27c" : "#82785c",
      {
        at: [x, 0.083, z],
        rotation: [0, (random() - 0.5) * 85, 0],
        bone: stage,
        name: "shedBarkChip",
      },
    );
  }

  box(
    [0, 0.106, 0.335],
    [0.286, 0.091, 0.025],
    "#233b37", stage, "labelBacking",
  );
  box(
    [0, 0.106, 0.349],
    [0.267, 0.077, 0.007],
    GOLD, stage, "labelRim",
  );
  plate([0, 0.106, 0.353], 0.254, 0.073, labelTexture, stage);

  return b.root;
}
```