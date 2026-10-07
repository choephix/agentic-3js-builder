import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { Joint } from "../src/skeleton";
import { createBuilder } from "../src/builder";
import { DEG, rng } from "../src/math";
import { catmull, polyline, spiral } from "../src/path";
import { countershade, mix, mottle, noise, paint, smoothstep, spots } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Strawberry Poison Dart Frog on a Leaf",
  description:
    "A chubby, big-eyed strawberry poison dart frog (red body, blue-jeans legs, sticky toe discs) sitting on a veined, curled leaf over a mossy island with toadstools, a snail, a fly and dewdrops. Whimsical storybook proportions in faceted low-poly shapes.",
  style: "whimsical low-poly mix",
  commit: "88fc1f0",
};

// Authored in centimetres; S converts to the meters the SDK works in.
const S = 0.01;
type V = [number, number, number];

// palette
const RED = "#e8321f";
const RED_L = "#ff6b45";
const BLACK = "#2a1018";
const BLUE = "#2f7fe0";
const BLUE_L = "#78c0ff";
const NAVY = "#1c2670";
const BELLY_A = "#ffd9cf";
const BELLY_B = "#a9cdf5";
const EYE = "#0b0711";
const WHITE = "#ffffff";
const HILITE = "#ff9a80";
const BLUSH = "#ff7f86";
const TYMP = "#a91a22";
const LEAF_MID = "#46a844";
const LEAF_EDGE = "#2b7f3f";
const LEAF_HI = "#9ad84e";
const LEAF_VEIN = "#c4ec74";
const LEAF_UNDER = "#7dbd5c";
const STEM = "#82ac3c";
const MOSS_A = "#5fa83c";
const MOSS_B = "#8cc84c";
const MOSS_D = "#376a2e";
const CREAM = "#f6ecd2";
const DEW = "#cdeeff";

// piecewise-linear profile through [t, value] keys
function keys(k: [number, number][]) {
  return (t: number) => {
    if (t <= k[0][0]) return k[0][1];
    for (let i = 1; i < k.length; i++) {
      if (t <= k[i][0]) {
        const f = (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]);
        return k[i - 1][1] + (k[i][1] - k[i - 1][1]) * f;
      }
    }
    return k[k.length - 1][1];
  };
}

export default function build() {
  const b = createBuilder({ name: "strawberryPoisonDartFrog" });
  const R = rng(11);

  // -------------------------------------------------------------------------------------------
  // Leaf and moss, described analytically so the frog's feet can find the ground
  // -------------------------------------------------------------------------------------------
  const LEAF_L = 9.6;
  const LEAF_W = 3.5;
  const LEAF_Y = 1.1;
  const LEAF_T = 0.15;
  const YAW = 25 * DEG;
  const A0 = 3.9; // leaf coordinate that lies under the frog
  const sinY = Math.sin(YAW);
  const cosY = Math.cos(YAW);
  const O: [number, number] = [-A0 * sinY, -A0 * cosY]; // leaf base, world cm

  const halfW = (u: number) =>
    u <= 0 || u >= 1 ? 0 : LEAF_W * Math.sin(Math.PI * Math.pow(u, 0.9)) * (1 - 0.18 * smoothstep(0.55, 1, u));
  const toLeaf = (x: number, z: number) => {
    const rx = x - O[0];
    const rz = z - O[1];
    return { a: rx * sinY + rz * cosY, xl: rx * cosY - rz * sinY };
  };
  const leafY = (a: number, xl: number) => {
    const u = a / LEAF_L;
    const edge = Math.pow(Math.min(1.3, Math.abs(xl) / LEAF_W), 2);
    const hw = Math.max(0.2, halfW(u));
    return (
      LEAF_Y + 0.15 * edge + 1.1 * Math.pow(Math.max(0, u), 4) + 0.08 * Math.sin(u * 11) * Math.min(1, Math.abs(xl) / hw)
    );
  };
  const MOSS_PROFILE: [number, number][] = [
    [0, 1.08],
    [2.6, 1.05],
    [4.4, 0.95],
    [5.4, 0.65],
    [5.8, 0.3],
  ];
  const mossTop = keys(MOSS_PROFILE);
  const onLeaf = (x: number, z: number, pad = 0) => {
    const { a, xl } = toLeaf(x, z);
    const u = a / LEAF_L;
    return u > 0.01 && u < 0.99 && Math.abs(xl) < halfW(u) + pad;
  };
  const groundAt = (x: number, z: number) => {
    if (onLeaf(x, z)) {
      const { a, xl } = toLeaf(x, z);
      return leafY(a, xl) + LEAF_T / 2;
    }
    return mossTop(Math.hypot(x, z));
  };
  const Y0 = groundAt(0, 0);

  const K = 1.2; // frog scale: a storybook-sized frog, a little larger than life
  const U = S * K;
  const F = (x: number, y: number, z: number): V => [x * U, (y * K + Y0) * S, z * U]; // frog space (cm) -> model
  const W3 = (x: number, y: number, z: number): V => [x * S, y * S, z * S]; // world cm -> model
  const G = (x: number, z: number) => (groundAt(x * K, z * K) - Y0) / K;
  const plant = (x: number, z: number, r: number): V => F(x, G(x, z) + r, z);

  // -------------------------------------------------------------------------------------------
  // Skeleton
  // -------------------------------------------------------------------------------------------
  const root = b.joint("root", { at: [0, 0, 0] });
  const spine = b.chain(
    "spine",
    catmull([F(0, 0.98, -0.65), F(0, 0.95, -0.25), F(0, 0.9, 0.15), F(0, 0.88, 0.5)]),
    { parent: root, names: ["hips", "spine1", "chest", "chestTip"], role: "spine" },
  );
  const head = b.joint("head", { parent: spine.joints[2], at: F(0, 0.92, 0.42), aim: F(0, 0.9, 1.4), role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: F(0, 0.62, 0.4), aim: F(0, 0.56, 1.3), role: "jaw" });

  // -------------------------------------------------------------------------------------------
  // Paints
  // -------------------------------------------------------------------------------------------
  const redBack = mottle(RED, RED_L, { size: 0.006, seed: 2, contrast: 0.7 });
  const bellyMarble = mottle(BELLY_A, BELLY_B, { size: 0.004, seed: 5, contrast: 1 });
  const coat = countershade(spots(redBack, BLACK, { size: 0.0064, amount: 0.27, seed: 7 }), bellyMarble, {
    level: -0.15,
    soft: 0.3,
  });
  const jeans = mottle(BLUE, BLUE_L, { size: 0.0045, seed: 3, contrast: 0.8 });
  const legBack = spots(jeans, NAVY, { size: 0.0048, amount: 0.3, seed: 4 });
  const legPaint = countershade(legBack, mix(BLUE_L, BELLY_B, 0.5), { level: -0.2, soft: 0.3 });
  const thighPaint = paint((p, _n, s) => (s[0] < 0.1 + 0.1 * noise(p, 0.004, 2) ? coat : legPaint));

  // -------------------------------------------------------------------------------------------
  // Body, head, jaw
  // -------------------------------------------------------------------------------------------
  const bodyTube = b.sweep(spine, (t) => [(0.9 + 0.1 * Math.sin(t * Math.PI) - 0.12 * t) * U, (0.88 + 0.03 * Math.sin(t * Math.PI) - 0.16 * t) * U], {
    color: coat,
    sides: 8,
    smooth: false,
    caps: "round",
    name: "body",
  });

  const rxHead = keys([
    [0, 0.95],
    [0.35, 0.97],
    [0.7, 0.66],
    [1, 0.3],
  ]);
  const ryHead = keys([
    [0, 0.45],
    [0.35, 0.44],
    [0.7, 0.38],
    [1, 0.26],
  ]);
  const skull = b.sweep(catmull([F(0, 1.0, 0.3), F(0, 1.03, 0.85), F(0, 0.93, 1.3)]), (t) => [rxHead(t) * U, ryHead(t) * U], {
    bone: head,
    color: coat,
    sides: 8,
    smooth: false,
    caps: "round",
    name: "skull",
  });
  b.sweep(catmull([F(0, 0.6, 0.5), F(0, 0.55, 0.95), F(0, 0.5, 1.3)]), (t) => [(0.8 - 0.45 * t) * U, (0.2 - 0.07 * t) * U], {
    bone: jaw,
    color: coat,
    sides: 8,
    smooth: false,
    caps: "round",
    name: "lowerJaw",
  });

  // eyes: big dark bulbs with a red lid cap and a painted gleam
  const eyeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="28" fill="#3f2f9c"/>
      <circle cx="32" cy="32" r="22" fill="#2a1d66"/>
      <circle cx="32" cy="32" r="14" fill="#06030b"/>
      <ellipse cx="22" cy="20" rx="9" ry="6.5" fill="#ffffff" transform="rotate(-35 22 20)"/>
      <circle cx="43" cy="44" r="4" fill="#ffffff" opacity="0.92"/>
    </svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    const c = F(s * 0.67, 1.4, 0.72);
    const eye = b.part(new THREE.SphereGeometry(0.43 * U, 8, 6), EYE, { bone: head, at: c });
    const out = new THREE.Vector3(s * 0.3, 0.28, 0.9).normalize();
    b.decal(eye, eyeTex, {
      at: [c[0] + out.x * 0.43 * U, c[1] + out.y * 0.43 * U, c[2] + out.z * 0.43 * U],
      dir: [out.x, out.y, out.z],
      size: [0.66 * U, 0.66 * U],
      segments: 10,
      bone: head,
    });
    b.part(new THREE.SphereGeometry(0.47 * U, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.44), coat, {
      bone: head,
      at: c,
      rotation: [-28, 0, s * 12],
    });
  }

  // snout, cheeks and ear-drums, seated on the skull's own surface
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const nose = skin.ray(F(s * 0.17, 2, 1.55), [0, -1, 0]);
    if (nose) b.stick(new THREE.SphereGeometry(0.075 * U, 5, 3), BLACK, nose, { embed: 0.45 });
    const drum = skin.ray(F(s * 3, 1.0, 0.3), [-s, 0, 0]);
    if (drum) b.stick(new THREE.CylinderGeometry(0.22 * U, 0.22 * U, 0.06 * U, 8), TYMP, drum, { embed: 0.5 });
    const cheek = skin.ray(F(s * 3, 0.85, 0.85), [-s, 0, 0]);
    if (cheek) {
      b.stick(new THREE.SphereGeometry(0.25 * U, 6, 4), BLUSH, cheek, { embed: 0.62, scale: [1, 0.35, 0.8] });
    }
  }
  // lip seam
  const lip = [
    [0.9, 0.74, 0.5],
    [0.82, 0.7, 1.0],
    [0.5, 0.66, 1.42],
    [0, 0.63, 1.58],
    [-0.5, 0.66, 1.42],
    [-0.82, 0.7, 1.0],
    [-0.9, 0.74, 0.5],
  ].map((q) => F(q[0], q[1], q[2]));
  b.sweep(skin.drape(catmull(lip), { lift: 0.004 * U }), 0.028 * U, { color: BLACK, sides: 4, name: "lipSeam" });
  // glossy gleams along the back
  const backSkin = b.surface(bodyTube);
  for (const [gx, gz, gs] of [
    [0.5, -0.3, 1],
    [-0.45, -0.75, 0.8],
    [0.05, -1.15, 0.7],
  ]) {
    const g = backSkin.ray(F(gx, 3, gz), [0, -1, 0]);
    if (g) b.stick(new THREE.SphereGeometry(0.24 * gs * U, 6, 4), HILITE, g, { embed: 0.8, scale: [1.5, 0.3, 0.8] });
  }

  // -------------------------------------------------------------------------------------------
  // Legs
  // -------------------------------------------------------------------------------------------
  const discTone = "#9fd6ff";
  function digit(
    name: string,
    parent: Joint,
    x: number,
    z: number,
    side: number,
    angDeg: number,
    len: number,
    r: number,
    discR: number,
  ) {
    const dx = side * Math.sin(angDeg * DEG);
    const dz = Math.cos(angDeg * DEG);
    const pts = [0, 0.5, 1].map((k) => plant(x + dx * len * k, z + dz * len * k, r * (1 - 0.25 * k)));
    const ch = b.chain(name, polyline(pts), { parent, names: [`${name}A`, `${name}B`], role: "digit" });
    b.sweep(ch, [r * U, r * 0.8 * U], { color: legPaint, sides: 5, smooth: false, caps: "round" });
    const tip = plant(x + dx * len, z + dz * len, discR * 0.5);
    b.part(new THREE.SphereGeometry(discR * U, 6, 4), discTone, { bone: ch.joints[1], at: tip, scale: [1, 0.5, 1] });
  }

  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    // front limb
    const shoulder: V = F(s * 0.82, 0.68, 0.2);
    const elbow = plant(s * 1.15, -0.1, 0.38);
    const wrist = plant(s * 1.25, 0.52, 0.2);
    const palm = plant(s * 1.35, 0.85, 0.15);
    const armPts = [shoulder, elbow, wrist, palm];
    const arm = b.chain(`arm${sd}`, polyline(armPts), {
      parent: spine.joints[2],
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`, `hand${sd}`],
      role: "arm",
    });
    const armR = keys([
      [0, 0.3],
      [0.4, 0.24],
      [0.7, 0.18],
      [1, 0.15],
    ]);
    b.sweep(arm, (t) => armR(t) * U, { color: legPaint, sides: 6, smooth: false, caps: "round", name: `armTube${sd}` });
    const hand = arm.joints[arm.joints.length - 1];
    [-26, -9, 9, 27].forEach((ang, i) => {
      digit(`finger${sd}${i + 1}`, hand, s * 1.35 + s * (i - 1.5) * 0.12, 0.85, s, ang, [0.5, 0.65, 0.65, 0.48][i], 0.085, 0.15);
    });

    // hind limb: thigh forward, shin back, long foot
    const hip: V = F(s * 0.9, 0.7, -0.85);
    const knee = plant(s * 1.6, -0.05, 0.5);
    const ankle = plant(s * 1.3, -1.4, 0.2);
    const ball = plant(s * 1.7, -0.5, 0.14);
    const legPts = [hip, knee, ankle, ball];
    const leg = b.chain(`leg${sd}`, polyline(legPts), {
      parent: spine.joints[0],
      names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`, `foot${sd}`],
      role: "leg",
    });
    const lens = [0, 1, 2].map((i) => new THREE.Vector3(...legPts[i]).distanceTo(new THREE.Vector3(...legPts[i + 1])));
    const tot = lens[0] + lens[1] + lens[2];
    const k1 = lens[0] / tot;
    const k2 = (lens[0] + lens[1]) / tot;
    const legR = keys([
      [0, 0.5],
      [k1, 0.36],
      [k1 + 0.02, 0.3],
      [k2, 0.19],
      [1, 0.14],
    ]);
    b.sweep(leg, (t) => legR(t) * U, { color: thighPaint, sides: 7, smooth: false, caps: "round", name: `legTube${sd}` });
    // knee and heel studs, like a patch on denim
    b.part(new THREE.SphereGeometry(0.2 * U, 6, 4), NAVY, { bone: leg.joints[1], at: knee, scale: [1, 0.7, 1] });
    const foot = leg.joints[leg.joints.length - 1];
    [-30, -15, 0, 15, 30].forEach((ang, i) => {
      digit(`toe${sd}${i + 1}`, foot, s * 1.7 + s * (i - 2) * 0.1, -0.5, s, ang, [0.5, 0.72, 0.92, 1.12, 0.8][i], 0.12, 0.18);
    });
  }

  // -------------------------------------------------------------------------------------------
  // Leaf, stem and the bits on it
  // -------------------------------------------------------------------------------------------
  const spotsOnLeaf: [number, number, number][] = [
    [7.0, 0.9, 0.28],
    [2.0, -1.6, 0.22],
    [8.4, -0.3, 0.18],
    [5.6, 2.3, 0.25],
  ];
  const leafPaint = paint((p, n) => {
    const qx = p.x / S - O[0];
    const qz = p.z / S - O[1];
    const a = qx * sinY + qz * cosY;
    const xl = qx * cosY - qz * sinY;
    const u = a / LEAF_L;
    const hw = Math.max(0.15, halfW(u));
    const vv = Math.abs(xl) / hw;
    const mott = noise(p, 0.012, 4);
    if (n.y < -0.35) return mix(LEAF_UNDER, "#6aab55", mott);
    for (const [sa, sx, sr] of spotsOnLeaf) {
      const d = Math.hypot(a - sa, xl - sx);
      if (d < sr * 0.55) return "#4a2e1a";
      if (d < sr) return "#a8662d";
      if (d < sr * 1.25) return "#6f4a22";
    }
    if (vv > 0.93) return LEAF_HI;
    if (Math.abs(xl) < 0.07 + 0.09 * (1 - u)) return LEAF_VEIN;
    const ph = (a - 1.15 * Math.abs(xl)) / 0.85;
    const f = ph - Math.floor(ph);
    if (Math.min(f, 1 - f) * 0.85 < 0.04 && vv < 0.9) return mix(LEAF_VEIN, LEAF_MID, 0.35);
    return mix(mix(LEAF_MID, LEAF_EDGE, smoothstep(0.15, 1, vv)), "#58b84a", mott * 0.7);
  });
  const N = 12;
  const edgeLine = (v: number) =>
    catmull(
      Array.from({ length: N }, (_, i) => {
        const u = 0.012 + (0.976 * i) / (N - 1);
        const a = u * LEAF_L;
        const xl = v * halfW(u);
        const x = O[0] + a * sinY + xl * cosY;
        const z = O[1] + a * cosY - xl * sinY;
        return W3(x, leafY(a, xl), z);
      }),
    );
  const vs = [-1, -0.5, 0, 0.5, 1];
  for (let i = 0; i < vs.length - 1; i++) {
    b.membrane(edgeLine(vs[i]), edgeLine(vs[i + 1]), {
      color: leafPaint,
      thickness: LEAF_T * S,
      bone: root,
      rows: 2,
      name: `leaf${i}`,
    });
  }
  // stem
  const stemPts = [
    [0.25, 1.1, 0],
    [-0.5, 1.06, 0],
    [-1.1, 1.0, 0.03],
    [-1.7, 0.92, 0.05],
  ].map(([a, y, xl]) => {
    return W3(O[0] + a * sinY + xl * cosY, y, O[1] + a * cosY - xl * sinY);
  });
  b.sweep(catmull(stemPts), [0.22 * S, 0.17 * S], { bone: root, color: STEM, sides: 6, name: "stem" });

  // dewdrops, with a gleam each
  const dewAt = (a: number, xl: number, r: number) => {
    const x = O[0] + a * sinY + xl * cosY;
    const z = O[1] + a * cosY - xl * sinY;
    const y = leafY(a, xl) + LEAF_T / 2;
    b.part(new THREE.SphereGeometry(r * S, 6, 4), DEW, { bone: root, at: W3(x, y + r * 0.35, z), scale: [1, 0.7, 1] });
    b.part(new THREE.SphereGeometry(r * 0.28 * S, 5, 3), WHITE, {
      bone: root,
      at: W3(x - r * 0.3, y + r * 0.62, z + r * 0.3),
    });
  };
  dewAt(6.9, -0.8, 0.28);
  dewAt(1.4, 0.5, 0.2);
  dewAt(8.9, 0.3, 0.18);
  dewAt(4.4, 2.3, 0.24);
  dewAt(2.9, -2.1, 0.18);
  dewAt(7.7, 0.55, 0.15);

  // a fly on the leaf tip, just out of tongue range
  {
    const a = 8.3;
    const xl = -0.25;
    const fx = O[0] + a * sinY + xl * cosY;
    const fz = O[1] + a * cosY - xl * sinY;
    const fy = leafY(a, xl) + LEAF_T / 2 + 0.17;
    const yawDeg = YAW / DEG + 140;
    const fly = new THREE.Vector3(fx, fy, fz);
    const fp = (dx: number, dy: number, dz: number): V => {
      const c = Math.cos(yawDeg * DEG);
      const s = Math.sin(yawDeg * DEG);
      return W3(fly.x + dx * c + dz * s, fly.y + dy, fly.z - dx * s + dz * c);
    };
    b.part(new THREE.SphereGeometry(0.17 * S, 6, 4), "#2b2f3a", {
      bone: root,
      at: fp(0, 0, 0),
      rotation: [0, yawDeg, 0],
      scale: [1, 0.8, 1.7],
    });
    b.part(new THREE.SphereGeometry(0.11 * S, 6, 4), "#2b2f3a", { bone: root, at: fp(0, 0.03, 0.34) });
    for (const e of [1, -1]) {
      b.part(new THREE.SphereGeometry(0.065 * S, 5, 3), "#d83a3a", { bone: root, at: fp(e * 0.08, 0.06, 0.4) });
      b.extrude(
        (
          [
            [0, 0],
            [0.12, 0.1],
            [0.42, 0.12],
            [0.52, 0.0],
            [0.42, -0.08],
            [0.1, -0.06],
          ] as [number, number][]
        ).map(([wx, wy]): [number, number] => [wx * S, wy * S]),
        {
          at: fp(e * 0.06, 0.13, 0.05),
          x: [e * Math.cos(yawDeg * DEG), 0.35, -e * Math.sin(yawDeg * DEG)],
          y: [-Math.sin(yawDeg * DEG), 0, -Math.cos(yawDeg * DEG)],
          thickness: 0.012 * S,
          smoothing: 1,
          color: "#d9ecff",
          bone: root,
          name: "flyWing",
        },
      );
      for (const k of [-0.15, 0.05, 0.22]) {
        b.rod(fp(e * 0.06, -0.04, k), fp(e * 0.22, -0.17, k + 0.05), 0.014 * S, { bone: root, color: "#2b2f3a" });
      }
    }
  }

  // -------------------------------------------------------------------------------------------
  // Moss island
  // -------------------------------------------------------------------------------------------
  const mossPaint = countershade(
    mottle(MOSS_A, MOSS_B, { size: 0.012, seed: 9, contrast: 0.9 }),
    mottle(MOSS_D, "#4c8a36", { size: 0.01, seed: 10 }),
    { level: -0.35, soft: 0.3 },
  );
  const moss = b.lathe(
    [
      [0, 0],
      [5.8 * S, 0],
      ...MOSS_PROFILE.slice()
        .reverse()
        .map(([r, y]): [number, number] => [r * S, y * S]),
    ],
    { at: [0, 0, 0], bone: root, segments: 14, color: mossPaint, name: "mossBase" },
  );
  for (let i = 0; i < 11; i++) {
    const ang = (i / 11) * Math.PI * 2 + R() * 0.3;
    const rad = 5.3 + R() * 0.4;
    const size = 0.3 + R() * 0.3;
    b.part(new THREE.IcosahedronGeometry(size * S, 1), mossPaint, {
      bone: root,
      at: W3(Math.cos(ang) * rad, size * 0.5, Math.sin(ang) * rad),
      scale: [1, 0.55, 1],
      flat: true,
      name: "mossLump",
    });
  }
  const tuft = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32">
      <path d="M12 32 L3 5 L10 30 Z" fill="#6bb248"/>
      <path d="M12 32 L12 1 L15 30 Z" fill="#8cd053"/>
      <path d="M12 32 L21 8 L14 30 Z" fill="#4f9a3d"/>
    </svg>`,
    { size: 96 },
  );
  const mossHits = b
    .surface(moss)
    .scatter(140, { rng: rng(21), minDist: 0.007, filter: (h) => h.n.y > 0.2 && !onLeaf(h.at.x / S, h.at.z / S, 0.5) });
  b.cards(mossHits, tuft, { size: [0.7 * S, 0.65 * S], lean: 15, vary: 0.4, rng: rng(22), cross: true });

  // grass tufts (merged cones)
  const blades: THREE.BufferGeometry[] = [];
  const bladesDark: THREE.BufferGeometry[] = [];
  const tufts: [number, number][] = [
    [-0.8, -4.5],
    [4.2, 1.8],
    [-4.4, -2.3],
    [-3.4, 3.2],
    [4.5, -2.8],
    [2.8, -4.0],
  ];
  for (const [tx, tz] of tufts) {
    const gy = mossTop(Math.hypot(tx, tz)) - 0.05;
    for (let k = 0; k < 7; k++) {
      const h = 0.9 + R() * 0.9;
      const g = new THREE.ConeGeometry(0.1, h, 3, 1);
      g.translate(0, h / 2, 0);
      g.rotateZ((R() - 0.5) * 0.7);
      g.rotateY(R() * 6.28);
      g.translate(tx + (R() - 0.5) * 0.5, gy, tz + (R() - 0.5) * 0.5);
      (k % 2 ? bladesDark : blades).push(g);
    }
  }
  b.part(mergeGeometries(blades.map((g) => g.scale(S, S, S))), "#74b83f", { bone: root, at: [0, 0, 0], flat: true, name: "grass" });
  b.part(mergeGeometries(bladesDark.map((g) => g.scale(S, S, S))), "#4a8f36", { bone: root, at: [0, 0, 0], flat: true, name: "grassDark" });

  // toadstools
  const mush = (x: number, z: number, h: number, r: number, capColor: string, dotColor: string) => {
    const base = mossTop(Math.hypot(x, z)) - 0.05;
    b.part(new THREE.CylinderGeometry(r * 0.26 * S, r * 0.36 * S, h * S, 6), CREAM, { bone: root, at: W3(x, base + h / 2, z), flat: true });
    b.part(new THREE.SphereGeometry(r * S, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), spots(capColor, dotColor, { size: r * 0.0042, amount: 0.34, seed: 13 }), {
      bone: root,
      at: W3(x, base + h - 0.05, z),
      scale: [1, 0.7, 1],
      flat: true,
    });
    b.part(new THREE.CircleGeometry(r * 0.98 * S, 8), "#f3e2b0", {
      bone: root,
      at: W3(x, base + h - 0.07, z),
      rotation: [90, 0, 0],
    });
  };
  mush(-4.2, -0.6, 1.3, 0.85, "#37b5b0", CREAM);
  mush(-4.8, 0.6, 0.85, 0.55, "#f2c640", "#fff6cf");
  mush(-3.6, -1.8, 0.6, 0.4, "#37b5b0", CREAM);

  // little flowers
  const petalGeo: THREE.BufferGeometry[] = [];
  const flowers: [number, number, number][] = [
    [3.8, -2.6, 1.9],
    [4.4, -1.2, 1.5],
    [1.2, -4.4, 1.7],
  ];
  for (const [fx, fz, fh] of flowers) {
    const gy = mossTop(Math.hypot(fx, fz)) - 0.05;
    b.sweep(catmull([W3(fx, gy, fz), W3(fx + 0.1, gy + fh * 0.5, fz - 0.1), W3(fx, gy + fh, fz)]), 0.045 * S, {
      bone: root,
      color: "#4f9a3d",
      sides: 4,
      caps: "flat",
      name: "flowerStem",
    });
    for (let k = 0; k < 5; k++) {
      const ang = (k / 5) * Math.PI * 2;
      const g = new THREE.SphereGeometry(0.2, 5, 3);
      g.scale(1, 0.35, 0.65);
      g.translate(0.27, 0, 0);
      g.rotateY(ang);
      g.rotateZ(0.15);
      g.translate(fx, gy + fh, fz);
      petalGeo.push(g);
    }
    b.part(new THREE.SphereGeometry(0.13 * S, 6, 4), "#f0b323", { bone: root, at: W3(fx, gy + fh + 0.05, fz) });
  }
  b.part(mergeGeometries(petalGeo.map((g) => g.scale(S, S, S))), "#fff3dc", { bone: root, at: [0, 0, 0], flat: true, name: "petals" });

  // pebbles
  const pebs: [number, number, number, string][] = [
    [0.6, 5.0, 0.45, "#8d94a8"],
    [-4.4, -2.5, 0.38, "#a6a39a"],
    [4.2, -2.6, 0.33, "#8d94a8"],
    [-2.8, 4.0, 0.28, "#a6a39a"],
  ];
  for (const [px, pz, pr, pc] of pebs) {
    b.part(new THREE.IcosahedronGeometry(pr * S, 0), pc, {
      bone: root,
      at: W3(px, mossTop(Math.hypot(px, pz)) + pr * 0.25, pz),
      scale: [1.2, 0.7, 1],
      rotation: [0, px * 40, 0],
      flat: true,
    });
  }

  // snail crawling past, shell facing the frog
  {
    const sx = 4.4;
    const sz = 0.2;
    const hdir = new THREE.Vector3(0.3, 0, 0.95).normalize();
    const side = new THREE.Vector3(-hdir.z, 0, hdir.x);
    const gy = mossTop(Math.hypot(sx, sz));
    const at = (f: number, up: number, sh = 0) =>
      W3(sx + hdir.x * f + side.x * sh, gy + up, sz + hdir.z * f + side.z * sh);
    const bodyR = keys([
      [0, 0.08],
      [0.3, 0.2],
      [0.75, 0.2],
      [1, 0.15],
    ]);
    b.sweep(catmull([at(-1.4, 0.1), at(-0.5, 0.2), at(0.45, 0.28), at(1.15, 0.52)]), (t) => bodyR(t) * S, {
      bone: root,
      color: countershade("#d8b077", "#f5e3b8", { level: 0.1, soft: 0.3 }),
      sides: 6,
      name: "snailBody",
    });
    for (const e of [1, -1]) {
      b.sweep(catmull([at(1.1, 0.6, e * 0.08), at(1.25, 1.0, e * 0.14), at(1.3, 1.3, e * 0.17)]), 0.03 * S, {
        bone: root,
        color: "#d8b077",
        sides: 4,
        caps: "flat",
        name: "snailStalk",
      });
      b.part(new THREE.SphereGeometry(0.075 * S, 5, 3), EYE, { bone: root, at: at(1.3, 1.34, e * 0.17) });
    }
    const c = new THREE.Vector3(...at(-0.15, 0.75));
    const shellStart = new THREE.Vector3(...at(0.1, 0.33)); // aperture, low and forward
    const axis = side.clone();
    const coil = spiral(c, shellStart, axis, { turns: 2.1, r1: 0.1 * S, pitch: 0.03 * S });
    b.sweep(coil, (t) => (0.3 - 0.24 * t) * S, {
      bone: root,
      color: paint((_p, _n, s) => (Math.floor(s[0] * 18) % 2 ? "#f2a73a" : "#c9622c")),
      sides: 6,
      smooth: false,
      caps: "round",
      name: "snailShell",
    });
  }

  // a wild strawberry, the frog's namesake, lying on the moss
  {
    const bx = -3.4;
    const bz = 2.6;
    const gy = mossTop(Math.hypot(bx, bz));
    const A = new THREE.Vector3(0.9, 0.3, 0.35).normalize(); // tip -> top
    const C = new THREE.Vector3(bx, gy + 0.5, bz);
    const tip = C.clone().addScaledVector(A, -0.55);
    const top = tip.clone().addScaledVector(A, 1.08);
    const berryPaint = spots(mottle("#e0233a", "#ff4a52", { size: 0.004, seed: 31 }), "#ffe27a", {
      size: 0.0017,
      amount: 0.5,
      seed: 32,
    });
    b.lathe(
      (
        [
          [0, 0],
          [0.2, 0.03],
          [0.42, 0.25],
          [0.55, 0.55],
          [0.5, 0.85],
          [0.32, 1.05],
          [0, 1.1],
        ] as [number, number][]
      ).map(([x, y]): [number, number] => [x * S, y * S]),
      { at: W3(tip.x, tip.y, tip.z), axis: [A.x, A.y, A.z], bone: root, segments: 8, color: berryPaint, name: "strawberry" },
    );
    const u = new THREE.Vector3().crossVectors(A, new THREE.Vector3(0, 1, 0)).normalize();
    const v = new THREE.Vector3().crossVectors(A, u).normalize();
    for (let k = 0; k < 6; k++) {
      const th = (k / 6) * Math.PI * 2;
      const rad = u.clone().multiplyScalar(Math.cos(th)).addScaledVector(v, Math.sin(th));
      const base = top.clone().addScaledVector(rad, 0.12).addScaledVector(A, -0.05);
      const dir = rad.clone().multiplyScalar(0.85).addScaledVector(A, 0.15).normalize();
      b.spike(W3(base.x, base.y, base.z), [dir.x, dir.y, dir.z], 0.38 * S, 0.09 * S, { bone: root, color: "#3f9a3c", sides: 4 });
    }
    const sTop = top.clone().addScaledVector(A, 0.45);
    b.rod(W3(top.x, top.y, top.z), W3(sTop.x, sTop.y, sTop.z), 0.05 * S, { bone: root, color: STEM, sides: 4 });
  }

  // clover patches
  for (const [cx, cz] of [
    [-1.8, 4.1],
    [2.2, -3.5],
  ]) {
    const gy = mossTop(Math.hypot(cx, cz));
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 + cx;
      const dx = Math.cos(a);
      const dz = Math.sin(a);
      b.extrude(
        (
          [
            [0, 0],
            [0.3, 0.28],
            [0.32, 0.5],
            [0.12, 0.6],
            [0, 0.48],
            [-0.12, 0.6],
            [-0.32, 0.5],
            [-0.3, 0.28],
          ] as [number, number][]
        ).map(([x, y]): [number, number] => [x * S, y * S]),
        {
          at: W3(cx + dx * 0.1, gy + 0.18 + k * 0.02, cz + dz * 0.1),
          x: [dz, 0, -dx],
          y: [dx, 0.05, dz],
          thickness: 0.03 * S,
          smoothing: 1,
          color: paint((_p, _n, s) => (Math.abs(s[0]) < 0.00025 && s[1] > 0.0008 ? "#c6eda0" : "#4faa4a")),
          bone: root,
          name: "clover",
        },
      );
    }
    b.rod(W3(cx, gy - 0.05, cz), W3(cx, gy + 0.2, cz), 0.03 * S, { bone: root, color: "#3f8a3c", sides: 4 });
  }

  return b.root;
}
