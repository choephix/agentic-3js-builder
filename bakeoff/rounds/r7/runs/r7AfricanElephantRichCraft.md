```ts
import * as THREE from "three";
import { catmull, cells, createBuilder, frame, limb, mix, mottle, noise, paint, rng, smoothstep, svg } from "agentic-3js-builder";
import type { Rgb } from "agentic-3js-builder";

export const meta = {
  name: "African Bush Elephant",
  description:
    "Low-poly adult bull African bush elephant standing in a rest pose on a small savannah base: huge Africa-shaped ears, ringed trunk, curved ivory tusks, dust and mud painted skin, with a termite mound, acacia, puddle, grass and a sign.",
};

type Pt = [number, number, number];
type Outline = Array<[number, number] | [number, number, "sharp"]>;

/** Linear lookup in an evenly keyed list, t in 0..1. */
const keyed = (keys: number[], t: number) => {
  const x = Math.min(Math.max(t, 0), 1) * (keys.length - 1);
  const i = Math.min(Math.floor(x), keys.length - 2);
  return keys[i] + (keys[i + 1] - keys[i]) * (x - i);
};

// ---------------------------------------------------------------------------------------------------------------
// Flat colours
const HAIR = "#2a211d";
const IVORY = "#efe3c4";
const IVORY_TIP = "#c7b185";
const GUM = "#85766a";
const NAIL = "#d9cfba";
const LIP = "#a58882";
const DARK = "#2b1e1c";
const WRINKLE = "#6a645e";
const FINGER = "#a8857f";
const BARK = "#5c4630";
const WOOD = "#8f6a40";
const DIRT = "#b07c4a";
const DIRT_EDGE = "#8a5d36";
const MUD = "#5b4230";
const WATER = "#7ea2b0";

export default function build() {
  const b = createBuilder({ name: "african_bush_elephant" });
  const R = rng(2024);

  // ------------------------------------------------------------------------------------------------------------
  // Paints
  const makeSkin = (mudK: number) =>
    paint((p, n) => {
      const big = noise(p, 0.7, 3);
      let c: Rgb = mix("#6f6a64", "#a29b92", big);
      const cell = cells(p, 0.3, 5);
      c = mix(c, "#3f3a36", 0.5 * (1 - smoothstep(0, 0.09, cell.d2 - cell.d1)));
      c = mix(c, "#b88a62", 0.45 * smoothstep(0.1, 0.9, n.y) * smoothstep(0.35, 0.65, noise(p, 0.4, 9)));
      const mud = smoothstep(0.95, 0.25, p.y + 0.3 * (noise(p, 0.25, 11) - 0.5));
      c = mix(c, "#7b5a3e", mudK * mud);
      const k = 0.8 + 0.25 * smoothstep(-1, 1, n.y);
      return [c[0] * k, c[1] * k, c[2] * k] as const;
    });
  const SKIN = makeSkin(0.8);
  const SKIN_LOW = makeSkin(0.3);

  const TRUNK = paint((p, n, s) => {
    let c: Rgb = SKIN_LOW.at(p, n);
    const d = Math.abs((((s[1] % 360) + 360) % 360) - 180);
    c = mix(c, [0.62, 0.5, 0.46], 0.4 * smoothstep(70, 25, d));
    c = mix(c, [0.72, 0.52, 0.5], 0.6 * smoothstep(0.86, 0.97, s[0]));
    return c;
  });

  const EAR = paint((p, n, s) => {
    let c: Rgb = SKIN_LOW.at(p, n);
    const [u, v] = s;
    const ang = Math.atan2(v + 0.25, u + 0.2);
    const f = (((ang * 8) / Math.PI) % 1) + 0;
    const vein = smoothstep(0.06, 0.0, Math.abs(f - Math.round(f)));
    const pink = smoothstep(0.3, 1.2, Math.hypot(u, v + 0.2));
    c = mix(c, [0.66, 0.5, 0.48], 0.5 * pink);
    c = mix(c, [0.3, 0.25, 0.23], 0.4 * vein * smoothstep(0.2, 0.5, Math.hypot(u, v)));
    return c;
  });

  const STONE = mottle("#8b8378", "#6c655c", { size: 0.25, seed: 8 });
  const MOUND = mottle("#b4623b", "#8a4a2d", { size: 0.3, seed: 12 });
  const CANOPY_PAINT = mottle("#6b8c2a", "#9db046", { size: 0.5, seed: 4 });

  // ------------------------------------------------------------------------------------------------------------
  // Textures
  const EYE = svg(
    `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 22 Q32 -6 63 22 Q32 42 1 22Z" fill="#4a3426"/>
      <ellipse cx="32" cy="22" rx="17" ry="12" fill="#c98b2c"/>
      <ellipse cx="32" cy="22" rx="11" ry="10" fill="#8a5a1c"/>
      <circle cx="32" cy="22" r="7" fill="#150c08"/>
      <circle cx="27.5" cy="17.5" r="3.2" fill="#ffffff"/>
      <path d="M1 22 Q32 -6 63 22" stroke="#241610" stroke-width="3.5" fill="none"/>
      <path d="M8 31 Q32 44 56 31" stroke="#5a463a" stroke-width="2.5" fill="none"/>
    </svg>`,
    { size: 256 },
  );
  const GRASS_A = svg(
    `<svg viewBox="0 0 48 80" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 80 Q10 40 0 6 Q20 34 20 80Z" fill="#7d9a35"/>
      <path d="M14 80 Q22 30 24 0 Q34 36 30 80Z" fill="#94b043"/>
      <path d="M28 80 Q38 44 48 14 Q44 50 38 80Z" fill="#6d8a2e"/>
    </svg>`,
    { size: 128 },
  );
  const GRASS_B = svg(
    `<svg viewBox="0 0 48 80" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 80 Q8 44 4 10 Q18 38 18 80Z" fill="#c9a64a"/>
      <path d="M16 80 Q20 34 30 2 Q34 40 30 80Z" fill="#dcc067"/>
      <path d="M30 80 Q40 50 46 20 Q44 54 40 80Z" fill="#a98a34"/>
    </svg>`,
    { size: 128 },
  );
  const FLOWER = svg(
    `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 48 Q15 30 16 14" stroke="#5e7a2c" stroke-width="3" fill="none"/>
      <g fill="#fff0a8" stroke="#d4a62c" stroke-width="0.8">
        <ellipse cx="16" cy="5" rx="3.4" ry="5.5"/>
        <ellipse cx="16" cy="5" rx="3.4" ry="5.5" transform="rotate(60 16 12)"/>
        <ellipse cx="16" cy="5" rx="3.4" ry="5.5" transform="rotate(120 16 12)"/>
        <ellipse cx="16" cy="5" rx="3.4" ry="5.5" transform="rotate(180 16 12)"/>
        <ellipse cx="16" cy="5" rx="3.4" ry="5.5" transform="rotate(240 16 12)"/>
        <ellipse cx="16" cy="5" rx="3.4" ry="5.5" transform="rotate(300 16 12)"/>
      </g>
      <circle cx="16" cy="12" r="3.6" fill="#e08a1c"/>
    </svg>`,
    { size: 128 },
  );
  const LEAF = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 62 L32 4" stroke="#5c7a24" stroke-width="2.4"/>
      <g fill="#8fae3c" stroke="#5c7a24" stroke-width="0.8">
        <ellipse cx="22" cy="52" rx="9" ry="3.6" transform="rotate(-20 22 52)"/><ellipse cx="42" cy="52" rx="9" ry="3.6" transform="rotate(20 42 52)"/>
        <ellipse cx="21" cy="40" rx="10" ry="3.8" transform="rotate(-20 21 40)"/><ellipse cx="43" cy="40" rx="10" ry="3.8" transform="rotate(20 43 40)"/>
        <ellipse cx="22" cy="28" rx="9" ry="3.4" transform="rotate(-20 22 28)"/><ellipse cx="42" cy="28" rx="9" ry="3.4" transform="rotate(20 42 28)"/>
        <ellipse cx="25" cy="17" rx="7" ry="3" transform="rotate(-20 25 17)"/><ellipse cx="39" cy="17" rx="7" ry="3" transform="rotate(20 39 17)"/>
        <ellipse cx="32" cy="7" rx="3.4" ry="5.5"/>
      </g>
    </svg>`,
    { size: 128 },
  );
  const SIGN = svg(
    `<svg viewBox="0 0 120 48" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1.5" width="117" height="45" rx="4" fill="#b5884f" stroke="#4a3220" stroke-width="3"/>
      <path d="M6 24 H114" stroke="#9a7240" stroke-width="1"/>
      <text x="60" y="21" text-anchor="middle" font-family="serif" font-weight="bold" font-size="12" fill="#2f1f12">BUSH ELEPHANT</text>
      <text x="60" y="38" text-anchor="middle" font-family="serif" font-style="italic" font-size="10" fill="#4a3220">Loxodonta africana</text>
    </svg>`,
    { size: 384 },
  );

  // ------------------------------------------------------------------------------------------------------------
  // Skeleton
  const root = b.joint("root", { at: [0, 0, 0], dir: [0, 1, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, 2.3, -1.65], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.3, -1.25],
      [0, 2.3, -0.2],
      [0, 2.35, 0.8],
      [0, 2.4, 1.4],
    ]),
    { parent: hips, role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.4, 1.4],
      [0, 2.5, 1.7],
      [0, 2.6, 2.0],
    ]),
    { parent: spine.joints[2], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 2.6, 2.0], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.25, 2.3], aim: [0, 2.15, 2.75], role: "jaw" });

  // ------------------------------------------------------------------------------------------------------------
  // Body
  const body = b.loft(
    [
      { at: [0, 2.4, -1.9], w: 1.15, h: 1.5 },
      { at: [0, 2.3, -1.2], w: 1.85, h: 1.95 },
      { at: [0, 2.2, -0.2], w: 1.9, h: 1.95 },
      { at: [0, 2.3, 0.8], w: 1.85, h: 2.1 },
      { at: [0, 2.4, 1.5], w: 1.45, h: 1.75 },
    ],
    { bone: [hips, spine, neck], color: SKIN },
  );
  b.sweep(neck, (): [number, number] => [0.62, 0.68], { color: SKIN });

  // skin folds scattered on the flanks
  const bodySkin = b.surface(body);
  const folds = bodySkin.scatter(34, {
    rng: rng(3),
    minDist: 0.4,
    filter: (h) => h.n.y > -0.25 && Math.abs(h.n.x) > 0.35,
  });
  folds.forEach((h, i) => {
    b.stick(new THREE.SphereGeometry(1, 6, 4), SKIN, h, {
      embed: 0.5,
      flow: [0, 0, 1],
      spin: (i % 5) * 10 - 20,
      scale: [0.04, 0.04, 0.2 + (i % 3) * 0.05],
    });
  });

  // ------------------------------------------------------------------------------------------------------------
  // Head
  const C: Pt = [0, 2.75, 2.25];
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), SKIN, { bone: head, at: C, scale: [0.52, 0.68, 0.62], flat: true });
  b.part(new THREE.SphereGeometry(1, 10, 7), SKIN, { bone: head, at: [0, 3.08, 2.15], scale: [0.36, 0.33, 0.38], flat: true });
  b.frustumBox([0, 2.5, 2.45], [0, 2.4, 2.95], [0.72, 0.5], [0.5, 0.4], { bone: head, color: SKIN });
  b.frustumBox([0, 2.25, 2.3], [0, 2.15, 2.75], [0.6, 0.2], [0.42, 0.16], { bone: jaw, color: LIP });

  const skullSkin = b.surface(skull);
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { bone: head, at: [s * 0.38, 2.5, 2.45], scale: [0.2, 0.24, 0.3], flat: true });
    const eyeHit = skullSkin.around(C).at(s * 70, 4);
    if (eyeHit) b.decal(skull, EYE, { at: eyeHit, size: [0.17, 0.11] });
    const browHit = skullSkin.around(C).at(s * 70, 24);
    if (browHit) b.stick(new THREE.SphereGeometry(1, 6, 4), SKIN, browHit, { embed: 0.4, scale: [0.11, 0.035, 0.08] });
  }
  for (const h of skullSkin.scatter(14, { rng: rng(5), minDist: 0.1, filter: (hit) => hit.n.y > 0.55 }))
    b.stick(new THREE.ConeGeometry(0.014, 0.09, 4), HAIR, h);

  // Ears
  const K = 0.85;
  const earRaw: Array<[number, number, boolean?]> = [
    [-0.1, 0.55],
    [0.3, 0.82],
    [0.85, 0.8],
    [1.3, 0.5],
    [1.47, -0.05],
    [1.35, -0.65],
    [1.0, -1.15],
    [0.6, -1.5, true],
    [0.4, -1.0],
    [0.15, -0.55],
    [-0.1, -0.25],
  ];
  const earOutline: Outline = earRaw.map(([x, y, sh]) =>
    sh ? ([x * K, y * K, "sharp"] as [number, number, "sharp"]) : ([x * K, y * K] as [number, number]),
  );
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${S}`, { parent: head, at: [s * 0.42, 2.9, 2.2], dir: [s * 0.5, 0, -1], role: "hinge" });
    b.extrude(earOutline, {
      at: ear.at,
      x: new THREE.Vector3(s * 0.5, 0, -1).normalize(),
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.012,
      bone: ear,
      color: EAR,
    });
  }

  // Tusks
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const path = catmull([
      [s * 0.3, 2.42, 2.5],
      [s * 0.46, 2.0, 2.95],
      [s * 0.53, 1.7, 3.5],
      [s * 0.45, 1.8, 4.1],
    ]);
    b.sweep(path, [0.095, 0.012], {
      bone: head,
      color: IVORY,
      bands: [
        [0.9, IVORY],
        [1, IVORY_TIP],
      ],
      caps: { start: "flat", end: "point" },
      sides: 8,
      name: `tusk${S}`,
    });
    b.sweep(path.slice(0, 0.12), 0.115, { bone: head, color: GUM, caps: { start: "flat", end: "flat" }, sides: 8 });
  }

  // ------------------------------------------------------------------------------------------------------------
  // Trunk
  const trunkR = (t: number) => 0.095 + 0.215 * Math.pow(1 - t, 1.25);
  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 2.55, 2.6],
      [0, 2.2, 3.0],
      [0, 1.55, 3.2],
      [0, 0.95, 3.25],
      [0, 0.55, 3.3],
      [0, 0.36, 3.55],
      [0, 0.42, 3.8],
    ]),
    { parent: head, role: "tentacle" },
  );
  const trunkSweep = b.sweep(trunk, trunkR, { color: TRUNK, sides: 10, smooth: false });
  for (let i = 0; i < 20; i++) {
    const t = 0.1 + i * 0.043;
    const cp = trunk.at(t);
    b.part(new THREE.TorusGeometry(trunkR(t) * 1.04, 0.02 + (i % 2) * 0.008, 4, 10), WRINKLE, {
      at: cp,
      dir: cp.tangent,
      axis: "z",
      flat: true,
    });
  }
  const fp = trunkSweep.at(0.965, 0);
  b.spike(fp, fp.tangent, 0.13, 0.045, { color: FINGER });
  const tip = trunk.at(1);
  for (const s of [1, -1]) {
    const nostril = tip.at.clone().addScaledVector(tip.tangent, 0.08).addScaledVector(tip.binormal, s * 0.03);
    b.part(new THREE.SphereGeometry(0.028, 6, 4), DARK, { at: [nostril.x, nostril.y, nostril.z], bone: trunk.joints[5] });
  }

  // ------------------------------------------------------------------------------------------------------------
  // Legs
  const legR = (t: number) => keyed([0.43, 0.4, 0.34, 0.31, 0.33], t);
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    for (const front of [true, false]) {
      const rootPt: Pt = front ? [s * 0.56, 1.9, 0.85] : [s * 0.58, 1.95, -1.3];
      const footPt: Pt = front ? [s * 0.58, 0.2, 0.9] : [s * 0.6, 0.2, -1.25];
      const lens = front ? [0.76, 0.7, 0.3] : [0.78, 0.72, 0.3];
      const bends: Pt[] = front
        ? [
            [0, 0, -1],
            [0, 0, 1],
          ]
        : [
            [0, 0, 1],
            [0, 0, -1],
          ];
      const names = front
        ? [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `foot${S}`]
        : [`hip${S}`, `knee${S}`, `hock${S}`, `foot${S}`];
      const pts = limb(rootPt, footPt, lens, bends);
      const leg = b.chain(`leg${front ? "F" : "H"}${S}`, pts, {
        parent: front ? spine.joints[2] : spine.joints[0],
        names,
        role: "leg",
      });
      b.sweep(leg, legR, { color: SKIN, caps: { start: "round", end: "flat" }, smooth: false });
      for (const t of [0.43, 0.86]) {
        const cp = leg.at(t);
        b.part(new THREE.TorusGeometry(legR(t) * 1.06, 0.03, 4, 10), WRINKLE, { at: cp, dir: cp.tangent, axis: "z", flat: true });
      }
      const foot = leg.joints[3];
      b.part(new THREE.CylinderGeometry(0.34, 0.4, 0.23, 10), SKIN, {
        bone: foot,
        at: [footPt[0], 0.115, footPt[2]],
        flat: true,
      });
      const angles = front ? [-48, -16, 16, 48] : [-34, 0, 34];
      for (const deg of angles) {
        const a = (deg * Math.PI) / 180;
        b.part(new THREE.BoxGeometry(0.13, 0.1, 0.08), NAIL, {
          bone: foot,
          at: [footPt[0] + Math.sin(a) * 0.375, 0.15, footPt[2] + Math.cos(a) * 0.375],
          dir: [Math.sin(a), 0, Math.cos(a)],
          axis: "z",
        });
      }
    }
  }

  // ------------------------------------------------------------------------------------------------------------
  // Tail with a bristle tuft
  const rump = bodySkin.around([0, 2.4, -1.4]).at(180, 8)!;
  const rp = rump.at;
  const tail = b.sprout(
    "tail",
    rump,
    catmull([
      [rp.x, rp.y, rp.z],
      [0, rp.y - 0.3, rp.z - 0.3],
      [0, rp.y - 0.9, rp.z - 0.36],
      [0, rp.y - 1.5, rp.z - 0.3],
    ]),
    [0.11, 0.045],
    { count: 4, role: "tail", color: SKIN },
  );
  const tEnd = tail.chain!.at(1);
  b.spike(tEnd, tEnd, 0.34, 0.032, { color: HAIR });
  b.ring(tEnd, { count: 8, radius: 0.03, tilt: 70 }, (it) => {
    b.spike(it, it, 0.3, 0.02, { color: HAIR });
  });
  b.ring(tEnd, { count: 6, radius: 0.045, tilt: 50 }, (it) => {
    b.spike(it, it, 0.2, 0.018, { color: HAIR });
  });

  // ------------------------------------------------------------------------------------------------------------
  // Savannah base
  const base: Array<[number, number]> = [
    [0, 0],
    [3.1, 0],
    [3.3, 0.03],
    [3.25, 0.07],
    [2.9, 0.08],
    [0, 0.08],
  ];
  b.lathe(base, { at: [0, 0, 0.6], bone: root, segments: 20, color: DIRT });
  b.lathe(
    [
      [0, 0],
      [3.34, 0],
      [3.34, 0.035],
      [0, 0.035],
    ],
    { at: [0, 0, 0.6], bone: root, segments: 20, color: DIRT_EDGE },
  );

  // puddle
  b.lathe(
    [
      [0, 0],
      [0.78, 0],
      [0.78, 0.008],
      [0, 0.008],
    ],
    { at: [1.4, 0.076, 2.5], bone: root, segments: 12, color: MUD },
  );
  b.lathe(
    [
      [0, 0],
      [0.6, 0],
      [0.6, 0.01],
      [0, 0.01],
    ],
    { at: [1.4, 0.078, 2.5], bone: root, segments: 12, color: WATER },
  );

  // termite mound
  b.lathe(
    [
      [0, 0],
      [0.6, 0],
      [0.5, 0.3],
      [0.42, 0.7],
      [0.3, 1.05],
      [0.16, 1.3],
      [0, 1.42],
    ],
    { at: [2.2, 0.07, -1.5], bone: root, segments: 9, color: MOUND },
  );
  for (const [dx, dz, h] of [
    [0.38, 0.15, 0.7],
    [-0.3, 0.3, 0.55],
  ]) {
    b.lathe(
      [
        [0, 0],
        [0.2, 0],
        [0.1, h * 0.6],
        [0, h],
      ],
      { at: [2.2 + dx, 0.07, -1.5 + dz], bone: root, segments: 7, color: MOUND },
    );
  }

  // acacia tree
  const tx = -2.3;
  const tz = -1.6;
  b.sweep(
    catmull([
      [tx, 0.05, tz],
      [tx - 0.05, 0.9, tz - 0.05],
      [tx + 0.1, 1.7, tz + 0.05],
      [tx, 2.3, tz],
    ]),
    [0.14, 0.07],
    { bone: root, color: BARK, sides: 7, smooth: false },
  );
  for (const [ex, ez] of [
    [0.7, 0.3],
    [-0.7, -0.2],
    [0.1, 0.7],
  ]) {
    b.sweep(
      catmull([
        [tx + 0.1, 1.7, tz + 0.05],
        [tx + ex * 0.5, 2.1, tz + ez * 0.5],
        [tx + ex, 2.35, tz + ez],
      ]),
      [0.07, 0.035],
      { bone: root, color: BARK, sides: 6, smooth: false },
    );
  }
  const canopyProfile: Array<[number, number]> = [
    [0, 0],
    [1.0, 0.04],
    [1.25, 0.14],
    [1.0, 0.3],
    [0.5, 0.42],
    [0, 0.44],
  ];
  const canopy = (cx: number, cy: number, cz: number, r: number) => {
    b.lathe(
      canopyProfile.map(([x, y]) => [x * r, y * r * 0.8] as [number, number]),
      { at: [cx, cy, cz], bone: root, segments: 10, color: CANOPY_PAINT },
    );
    const leaves = [];
    for (let i = 0; i < 12; i++) {
      const a = R() * Math.PI * 2;
      const d = Math.sqrt(R()) * r * 0.8;
      leaves.push(frame([cx + Math.cos(a) * d, cy + r * 0.8 * 0.4 * (1 - (d / (r * 1.25)) ** 2) + 0.03, cz + Math.sin(a) * d], [0, 1, 0]));
    }
    b.cards(leaves, LEAF, { size: 0.32, lean: 90, flow: [1, 0, 0], mirror: true, spin: 180, vary: 0.25, rng: R, bone: root });
  };
  canopy(tx, 2.3, tz, 0.9);
  canopy(tx + 0.7, 2.4, tz + 0.3, 0.55);
  canopy(tx - 0.7, 2.4, tz - 0.2, 0.55);

  // rocks
  for (const [x, z, r, deg] of [
    [-1.9, 1.9, 0.32, 20],
    [-2.3, 1.3, 0.2, 70],
    [2.2, 1.3, 0.26, 40],
  ]) {
    b.part(new THREE.DodecahedronGeometry(r, 0), STONE, {
      bone: root,
      at: [x, 0.08 + r * 0.3, z],
      scale: [1, 0.6, 0.85],
      rotation: [0, deg, 0],
      flat: true,
    });
  }

  // sign
  b.part(new THREE.BoxGeometry(0.08, 1.0, 0.08), WOOD, { bone: root, at: [-1.6, 0.5, 2.5], flat: true });
  b.part(new THREE.BoxGeometry(0.8, 0.32, 0.05), "#ffffff", {
    bone: root,
    at: [-1.6, 0.92, 2.55],
    rotation: [0, 18, 0],
    texture: SIGN,
  });

  // grass and flowers
  const blades = [];
  for (let i = 0; i < 46; i++) {
    const a = R() * Math.PI * 2;
    const d = 2.35 + R() * 0.8;
    const x = Math.sin(a) * d;
    const z = 0.6 + Math.cos(a) * d;
    if (Math.abs(x) < 0.7 && z > 2.6) continue;
    blades.push(frame([x, 0.07, z], [0, 1, 0]));
  }
  b.cards(blades, [GRASS_A, GRASS_B], { size: [0.22, 0.4], lean: 8, vary: 0.35, rng: R, spin: 180, cross: true, bone: root });
  const blooms = [];
  for (let i = 0; i < 14; i++) {
    const a = R() * Math.PI * 2;
    const d = 1.9 + R() * 0.9;
    const x = Math.sin(a) * d;
    const z = 0.6 + Math.cos(a) * d;
    if (Math.abs(x) < 1.1 && z > 2.0) continue;
    if (Math.hypot(x - 1.4, z - 2.5) < 0.9) continue;
    blooms.push(frame([x, 0.07, z], [0, 1, 0]));
  }
  b.cards(blooms, FLOWER, { size: [0.12, 0.2], lean: 5, vary: 0.3, rng: R, cross: true, bone: root });

  return b.root;
}
```