import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { cells, mottle, noise, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, furEdge, INK, zigzag } from "../../../../kits/toon";

export const meta = {
  name: "Red Panda on a Mossy Stone",
  description:
    "A cel-shaded, big-eyed red panda balancing on a moss-capped boulder with a bushy ringed tail, a gold-and-dendro leaf pendant, a tasselled ear cuff and glowing rune inlays on the stone.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette (every surface colour is a two-tone cel)
const RUST_LIT = "#f77a31";
const RUST_DARK = "#cf4a2c";
const RUST = cel(RUST_LIT, RUST_DARK);
const RUST_D = "#c84a22";
const BELLY_LIT = "#4f2a35";
const DARKFUR = cel("#45242f", "#2c1626");
const CREAM = cel("#fff5e0", "#f2cfae");
const GOLD = cel("#ffd465", "#d98a2b");
const GOLD_FLAT = "#f4c24a";
const GOLD_DEEP = "#b86d1c";
const CORD = cel("#d8334a", "#9d2150");
const TEAR = "#c2452a";
const NOSE = "#3a2438";
const CLAW = "#f3e2c8";
const TEAL = "#58f0cc";
const LEAF_GLOW = "#9dff8a";
const MOTE = "#ffe99a";

// ---------------------------------------------------------------------------------------------------------------
// Textures
const TUFT = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 1 C22 18 31 40 29 63 L3 63 C1 40 10 18 16 1Z" fill="#ffffff"/><path d="M16 12 C18 28 22 46 21 63" stroke="#cfcfcf" stroke-width="3.2" fill="none"/></svg>`,
  { size: 128 },
);
const MOSS_TUFT = svg(
  `<svg viewBox="0 0 40 48">
    <path d="M4 48 C4 30 8 14 13 2 C17 16 19 32 20 48Z" fill="#4fb54a"/>
    <path d="M14 48 C16 28 22 10 30 4 C30 20 28 36 30 48Z" fill="#74d455"/>
    <path d="M26 48 C28 34 32 22 38 14 C38 28 38 40 38 48Z" fill="#4fb54a"/>
    <path d="M18 48 C19 36 22 26 25 18 C26 30 26 40 27 48Z" fill="#a6ea62"/>
    <path d="M13 40 C14 26 17 14 19 9" stroke="#bff77a" stroke-width="2" fill="none"/>
  </svg>`,
  { size: 160 },
);
const GRASS = svg(
  `<svg viewBox="0 0 40 56">
    <path d="M6 56 C6 36 9 18 14 3 C18 20 20 38 22 56Z" fill="#3f9d55"/>
    <path d="M16 56 C18 34 24 16 33 8 C32 26 31 42 33 56Z" fill="#62c75a"/>
    <path d="M26 56 C28 40 32 28 38 20 C38 34 38 46 38 56Z" fill="#3f9d55"/>
    <path d="M14 56 C14 40 16 28 14 14" stroke="#a6ea62" stroke-width="2" fill="none"/>
  </svg>`,
  { size: 160 },
);
const FLOWER = svg(
  `<svg viewBox="0 0 32 44">
    <path d="M16 44 C16 36 15 28 16 20" stroke="#3f9d55" stroke-width="3" fill="none"/>
    <path d="M16 36 C22 34 26 30 27 26 C21 26 17 30 16 36Z" fill="#62c75a"/>
    <g fill="#fffaf0" stroke="#f3b6c8" stroke-width="1.2">
      <ellipse cx="16" cy="8" rx="4.4" ry="6.6"/>
      <ellipse cx="9" cy="13" rx="4.4" ry="6.6" transform="rotate(-62 9 13)"/>
      <ellipse cx="23" cy="13" rx="4.4" ry="6.6" transform="rotate(62 23 13)"/>
      <ellipse cx="11" cy="21" rx="4.4" ry="6.6" transform="rotate(-140 11 21)"/>
      <ellipse cx="21" cy="21" rx="4.4" ry="6.6" transform="rotate(140 21 21)"/>
    </g>
    <circle cx="16" cy="15" r="4.2" fill="#ffd465"/>
    <circle cx="15" cy="14" r="1.4" fill="#fff3a8"/>
  </svg>`,
  { size: 128 },
);
const TASSEL = svg(
  `<svg viewBox="0 0 24 64">
    <rect x="8" y="52" width="8" height="12" rx="3" fill="#f4c24a"/>
    <rect x="8" y="55" width="8" height="2.2" fill="#b86d1c"/>
    <path d="M12 52 C9 38 6 20 5 4" stroke="#d8334a" stroke-width="3.6" fill="none" stroke-linecap="round"/>
    <path d="M12 52 C12 38 12 20 12 2" stroke="#58f0cc" stroke-width="3.6" fill="none" stroke-linecap="round"/>
    <path d="M12 52 C15 38 18 20 19 4" stroke="#d8334a" stroke-width="3.6" fill="none" stroke-linecap="round"/>
    <circle cx="5" cy="4.5" r="2.6" fill="#f4c24a"/><circle cx="12" cy="3" r="2.6" fill="#f4c24a"/><circle cx="19" cy="4.5" r="2.6" fill="#f4c24a"/>
  </svg>`,
  { size: 192 },
);
const FILIGREE = svg(
  `<svg viewBox="0 0 36 60">
    <g fill="none" stroke="#b86d1c" stroke-width="1.8" stroke-linecap="round">
      <path d="M18 7 C26 14 28 26 24 36 C22 42 20 46 18 52 C16 46 14 42 12 36 C8 26 10 14 18 7Z"/>
      <path d="M18 14 L18 48"/>
      <path d="M18 24 C23 22 25 19 26 16 M18 24 C13 22 11 19 10 16"/>
      <path d="M18 34 C22 33 24 31 25 28 M18 34 C14 33 12 31 11 28"/>
      <path d="M13 42 C15 44 16 45 18 45 C20 45 21 44 23 42" />
    </g>
    <g fill="#b86d1c"><circle cx="18" cy="5" r="1.6"/><circle cx="18" cy="55" r="1.4"/></g>
  </svg>`,
  { size: 240 },
);
const RUNE = svg(
  `<svg viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="29" fill="none" stroke="#ffd66b" stroke-width="2.4"/>
    <circle cx="32" cy="32" r="24" fill="none" stroke="#7dffd9" stroke-width="1.8" stroke-dasharray="3 3.4"/>
    <path d="M32 12 C45 22 45 42 32 53 C19 42 19 22 32 12Z" fill="none" stroke="#7dffd9" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M32 17 L32 49 M32 27 C38 26 40 23 41 20 M32 27 C26 26 24 23 23 20 M32 37 C37 36 39 34 40 31 M32 37 C27 36 25 34 24 31" fill="none" stroke="#7dffd9" stroke-width="2" stroke-linecap="round"/>
    <g fill="#ffd66b"><circle cx="32" cy="3.4" r="2"/><circle cx="32" cy="60.6" r="2"/><circle cx="3.4" cy="32" r="2"/><circle cx="60.6" cy="32" r="2"/></g>
  </svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------
// Rock helper: a displaced icosphere, squashed, flat-bottomed on y = 0 (and flat-topped when `top` clips it).
type RockOptions = { cx: number; cz: number; y0?: number; detail?: number; bottom?: number; top?: number; yaw?: number; rough?: number };
function rockGeo(seed: number, sx: number, sy: number, sz: number, o: RockOptions) {
  const g = new THREE.IcosahedronGeometry(1, o.detail ?? 1);
  const pos = g.attributes.position;
  const v = new THREE.Vector3();
  const bottom = o.bottom ?? -0.5;
  const top = o.top ?? 0.9;
  const rough = o.rough ?? 0.1;
  const yaw = o.yaw ?? 0;
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    const f =
      0.5 * Math.sin(v.x * 3.7 + seed) +
      0.3 * Math.sin(v.y * 5.3 + seed * 2) +
      0.4 * Math.sin(v.z * 4.1 + seed * 3) +
      0.25 * Math.sin((v.x + v.z) * 7.3 + seed);
    const r = 1 + (rough * f) / 1.2;
    const lx = v.x * r * sx;
    const lz = v.z * r * sz;
    const yl = Math.min(Math.max(v.y * r, bottom), top);
    pos.setXYZ(i, o.cx + lx * c - lz * s, (o.y0 ?? 0) + (yl - bottom) * sy, o.cz + lx * s + lz * c);
  }
  pos.needsUpdate = true;
  g.computeVertexNormals();
  return g;
}

export default function build() {
  const b = createBuilder({ name: "redPandaOnMossyStone" });
  const rand = rng(77);

  // ------------------------------------------------------------------------------------------------------------
  // Skeleton
  const base = b.joint("base", { at: [0, 0.12, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.405, -0.165],
      [0, 0.425, -0.05],
      [0, 0.435, 0.06],
      [0, 0.445, 0.15],
    ]),
    { parent: base, names: ["hips", "spine", "chest"], role: "spine" },
  );
  const hips = spine.joints[0];
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    [
      [0, 0.445, 0.15],
      [0, 0.49, 0.21],
    ],
    { parent: chest, names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 0.49, 0.21], aim: [0, 0.505, 0.3], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.478, 0.3], aim: [0, 0.462, 0.37], role: "jaw" });

  // Tail raised in an S-curve for balance
  const tailPath = catmull([
    [0, 0.41, -0.19],
    [0, 0.42, -0.34],
    [0, 0.45, -0.5],
    [0.05, 0.52, -0.62],
    [0.13, 0.6, -0.68],
    [0.21, 0.67, -0.66],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, role: "tail", count: 6, names: (i) => `tail${i + 1}` });

  // ------------------------------------------------------------------------------------------------------------
  // Paints
  const coat = cel(
    furEdge(
      paint((p, n) =>
        n.y > 0.55 && Math.abs(p.x) < 0.01 + 0.012 * zigzag(p.z / 0.035) && p.z > -0.2 && p.z < 0.1 ? RUST_D : RUST_LIT,
      ),
      BELLY_LIT,
      { level: -0.15, teeth: 0.22, period: 0.03, ink: INK },
    ),
  );
  const legPaint = cel(
    paint((p) => (p.y > 0.372 + 0.014 * zigzag((p.x * 0.8 + p.z) / 0.028) ? RUST_LIT : "#45242f")),
    undefined,
  );
  const RING_A = "#f77a31";
  const RING_B = "#d4552a";
  const ringColor = (p: THREE.Vector3) => {
    const t = tailPath.closestT(p);
    if (t > 0.94) return "#4f2a35";
    if (t < 0.1) return RING_A;
    const u = t * 10 + 0.14 * zigzag((p.x + p.y * 0.8 + p.z * 0.6) / 0.03);
    return Math.floor(u) % 2 ? RING_B : RING_A;
  };
  const tailPaint = cel(paint((p) => ringColor(p)));

  // ------------------------------------------------------------------------------------------------------------
  // Stone, turf and rocks (all ride the root joint)
  const STONE = cel(
    paint((p, n) => {
      const nz = noise(p, 0.14, 5);
      const m = 0.8 * n.y + 0.9 * (nz - 0.5) + 2.2 * (p.y - 0.1) + 0.05;
      if (m > 0.4) {
        if (m < 0.5) return "#3e9a4a";
        const d = noise(p, 0.05, 9);
        return d > 0.62 ? "#a6ea62" : d < 0.35 ? "#4fb54a" : "#74d455";
      }
      const c = cells(p, 0.2, 3);
      if (c.d2 - c.d1 < 0.04) return "#555d7c";
      return nz > 0.55 ? "#b6bed3" : "#9ca5c0";
    }),
  );
  const MOSS = cel(mottle("#74d455", "#a6ea62", { size: 0.05, seed: 3 }));
  const TURF = cel(mottle("#3f9d55", "#62c75a", { size: 0.08, seed: 6 }));

  const stone = b.part(rockGeo(1.3, 0.4, 0.25 / 1.4, 0.34, { cx: 0, cz: 0, detail: 2, bottom: -0.7, top: 0.7, rough: 0.12 }), STONE, {
    bone: base,
    at: [0, 0, 0],
    flat: true,
    name: "stone",
  });
  b.lathe(
    [
      [0, 0],
      [0.66, 0],
      [0.68, 0.01],
      [0.6, 0.026],
      [0.4, 0.036],
      [0, 0.04],
    ],
    { at: [0, 0, 0], bone: base, segments: 12, color: TURF, name: "turf" },
  );
  const smallRocks: Array<[number, number, number, number, number, number, number]> = [
    [2.1, 0.46, 0.17, 0.13, 0.062, 0.11, 0.5],
    [3.4, -0.44, -0.14, 0.15, 0.085, 0.13, 1.1],
    [4.7, 0.12, -0.4, 0.12, 0.05, 0.1, 2.0],
    [5.9, -0.22, 0.38, 0.1, 0.045, 0.09, 0.3],
    [6.3, 0.34, -0.3, 0.07, 0.035, 0.06, 0.9],
    [7.7, -0.5, 0.22, 0.06, 0.03, 0.05, 1.7],
  ];
  const rockParts = smallRocks.map(([seed, cx, cz, sx, sy, sz, yaw], i) =>
    b.part(rockGeo(seed, sx, sy, sz, { cx, cz, y0: 0, yaw, bottom: -0.45, top: 0.95 }), STONE, {
      bone: base,
      at: [0, 0, 0],
      flat: true,
      name: `rock${i}`,
    }),
  );
  for (let i = 0; i < 9; i++) {
    const a = rand() * Math.PI * 2;
    const rr = 0.52 + rand() * 0.18;
    const cx = Math.cos(a) * rr;
    const cz = Math.sin(a) * rr * 0.85;
    const r = 0.014 + rand() * 0.016;
    b.part(rockGeo(10 + i, r * 1.3, r * 0.7, r, { cx, cz, y0: 0.012, bottom: -0.4, top: 1, rough: 0.14 }), STONE, {
      bone: base,
      at: [0, 0, 0],
      flat: true,
      name: `pebble${i}`,
    });
  }
  // Moss cushions rounding the plateau edge
  const cushions: Array<[number, number, number]> = [
    [0.24, 0.12, 0.5],
    [0.27, -0.05, 1.2],
    [0.2, -0.2, 2.0],
    [0.0, -0.265, 0.2],
    [-0.23, -0.16, 2.8],
    [-0.27, 0.05, 1.7],
    [-0.19, 0.19, 0.9],
    [0.06, 0.255, 2.4],
  ];
  cushions.forEach(([cx, cz, yaw], i) => {
    b.part(rockGeo(20 + i, 0.062, 0.034, 0.056, { cx, cz, y0: 0.232, yaw, bottom: -0.4, top: 1, rough: 0.16 }), MOSS, {
      bone: base,
      at: [0, 0, 0],
      flat: true,
      name: `cushion${i}`,
    });
  });

  // Gold inlay band round the stone with studs, and glowing rune roundels
  const stoneSkin = b.surface(stone);
  const bandLoop = stoneSkin.loop([0, 0.07, 0], { lift: 0.003 });
  b.sweep(bandLoop, 0.0045, { color: GOLD, bone: base, sides: 5, name: "stoneBand" });
  b.along(stoneSkin.loop([0, 0.07, 0], { lift: 0.006 }), 26, (at) =>
    b.part(new THREE.SphereGeometry(0.0085, 6, 4), GOLD_FLAT, { at, bone: base }),
  );
  for (const [az, size] of [
    [4, 0.15],
    [64, 0.13],
    [-62, 0.13],
    [128, 0.12],
    [-125, 0.12],
  ] as const) {
    const hit = stoneSkin.around([0, 0.12, 0]).at(az, 0);
    if (hit) glow(b.decal(stoneSkin, RUNE, { at: hit, size: [size, size], bone: base, lift: 0.004, name: `rune${az}` }), 1.3);
  }

  // ------------------------------------------------------------------------------------------------------------
  // Body, hips and shoulders
  const body = b.sweep(
    catmull([
      [0, 0.4, -0.235],
      [0, 0.405, -0.165],
      [0, 0.425, -0.05],
      [0, 0.435, 0.06],
      [0, 0.445, 0.15],
      [0, 0.49, 0.21],
    ]),
    [0.055, 0.095, 0.108, 0.11, 0.104, 0.088],
    { bone: [spine, neck], color: coat, name: "body" },
  );

  // Legs: 4 chains with a tip joint, thighs and shoulder blobs, paws, toes and claws
  const legs: Record<string, ReturnType<typeof b.chain>> = {};
  const thighs: THREE.Object3D[] = [];
  void thighs;
  const limbSkin: ReturnType<typeof b.sweep>[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const front of [true, false]) {
      const root: [number, number, number] = front ? [s * 0.085, 0.405, 0.09] : [s * 0.09, 0.4, -0.18];
      const wristZ = front ? 0.12 : -0.2;
      const target: [number, number, number] = [s * 0.1, 0.288, wristZ];
      const pts = limb(root, target, [0.085, 0.085], [0, 0, front ? -1 : 1]);
      const names = front ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`] : [`hip${side}`, `knee${side}`, `ankle${side}`];
      const chain = b.chain(`leg${front ? "F" : "H"}${side}`, pts, {
        parent: front ? chest : hips,
        names,
        role: "leg",
        contact: [s * 0.1, 0.25, wristZ + (front ? 0.07 : 0.05)],
      });
      legs[`${front ? "F" : "H"}${side}`] = chain;
      limbSkin.push(b.sweep(chain, [0.052, 0.04, 0.034], { color: legPaint, sides: 7, name: `leg${front ? "F" : "H"}${side}` }));
      // shoulder / thigh mass
      b.part(new THREE.SphereGeometry(1, 9, 7), legPaint, {
        bone: chain.joints[0],
        at: front ? [s * 0.088, 0.395, 0.1] : [s * 0.095, 0.372, -0.175],
        scale: front ? [0.058, 0.075, 0.075] : [0.068, 0.088, 0.1],
        name: `${front ? "shoulder" : "thigh"}${side}`,
      });
      // paw
      const tip = chain.tip!;
      const pawZ = wristZ + (front ? 0.045 : 0.05);
      b.part(new THREE.SphereGeometry(1, 9, 6), DARKFUR, {
        bone: tip,
        at: [s * 0.1, 0.272, pawZ],
        scale: [0.037, 0.022, front ? 0.046 : 0.052],
        name: `paw${front ? "F" : "H"}${side}`,
      });
      // toes + claws
      for (let k = 0; k < 4; k++) {
        const dx = (k - 1.5) * 0.0165;
        const zb = pawZ + 0.025;
        const toe = b.chain(
          `toe${front ? "F" : "H"}${side}${k + 1}`,
          [
            [s * 0.1 + dx, 0.263, zb],
            [s * 0.1 + dx * 1.15, 0.258, zb + 0.032],
          ],
          { parent: tip, names: [`toe${front ? "F" : "H"}${side}${k + 1}`], role: "digit" },
        );
        b.sweep(toe, 0.0082, { color: DARKFUR, sides: 6, name: `toe${front ? "F" : "H"}${side}${k + 1}` });
        b.spike([s * 0.1 + dx * 1.15, 0.258, zb + 0.036], [0, -0.35, 1], 0.017, 0.0055, {
          color: CLAW,
          bone: toe.joints[0],
          sides: 5,
        });
      }
    }
  }
  const legFL = legs.FL;
  const legFR = legs.FR;

  // ------------------------------------------------------------------------------------------------------------
  // Head
  const HC: [number, number, number] = [0, 0.512, 0.262];
  const facePaint = cel(
    paint((p) => {
      const x = Math.abs(p.x);
      const y = p.y - HC[1];
      const z = p.z - HC[2];
      // pale eyebrow spots
      if (z > 0.02 && ((x - 0.044) / 0.02) ** 2 + ((y - 0.034) / 0.01) ** 2 < 1) return "#fff5e0";
      // tear marks running from the eye down to the muzzle
      const tearX = 0.04 + Math.max(-y, 0) * 0.55;
      if (z > 0.035 && y < 0.004 && y > -0.058 && Math.abs(x - tearX) < 0.0065) return TEAR;
      // forehead diamond
      if (y > 0.03 && z > 0 && x < 0.016 - (y - 0.03) * 0.5 + 0.006 * zigzag(y / 0.01)) return "#ff9a4d";
      // white cheeks and muzzle
      if (z > -0.03 && y < 0.002 + 0.01 * zigzag(x / 0.017)) return "#fff5e0";
      return RUST_LIT;
    }),
  );
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), facePaint, {
    bone: head,
    at: HC,
    scale: [0.105, 0.088, 0.092],
    name: "skull",
  });
  const skin = b.surface(skull);
  const snout = b.part(new THREE.SphereGeometry(1, 10, 8), CREAM, {
    bone: head,
    at: [0, 0.495, 0.348],
    scale: [0.047, 0.04, 0.052],
    name: "snout",
  });
  b.part(new THREE.SphereGeometry(1, 10, 7), CREAM, {
    bone: jaw,
    at: [0, 0.464, 0.336],
    scale: [0.034, 0.02, 0.048],
    name: "chin",
  });
  const nose = b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, {
    bone: head,
    at: [0, 0.5, 0.397],
    scale: [0.017, 0.012, 0.012],
    name: "nose",
  });
  b.part(new THREE.SphereGeometry(0.0035, 5, 4), "#fff5e0", {
    bone: head,
    at: nose.local([-0.005, 0.0, 0.0085]),
  });
  b.sweep(b.surface(snout).drape(
    catmull([
      [-0.036, 0.484, 0.355],
      [-0.014, 0.477, 0.385],
      [0, 0.489, 0.397],
      [0.014, 0.477, 0.385],
      [0.036, 0.484, 0.355],
    ]),
    { lift: 0.002 },
  ), 0.0022, { color: INK, bone: head, sides: 4, name: "mouthLine" });

  // eyes: big anime eyes on the face, bright dendro green
  const EYE = animeEye({ iris: "#3fd69a", irisLight: "#c4ffd8", blush: "#ff8aa4", brow: false });
  for (const s of [1, -1]) {
    const hit = skin.around(HC).at(s * 36, 3);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.056, 0.077], mirror: s > 0, lift: 0.002, name: `eye${s > 0 ? "L" : "R"}` });
  }

  // cheek fluff, forehead tufts and whiskers
  const cheekHits = skin.scatter(70, {
    rng: rng(5),
    minDist: 0.021,
    filter: (h) => Math.abs(h.at.x) > 0.06 && h.at.y < HC[1] + 0.0 && h.at.z > HC[2] - 0.03 && h.at.y > HC[1] - 0.075,
  });
  b.cards(cheekHits, TUFT, {
    size: [0.03, 0.055],
    lean: 62,
    bend: 20,
    flow: (f) => [Math.sign(f.at.x) * 0.9, -0.35, -0.5],
    vary: 0.25,
    rng: rng(6),
    color: CREAM,
    bone: head,
  });
  const foreheadHits = skin.scatter(14, {
    rng: rng(8),
    minDist: 0.03,
    filter: (h) => h.at.y > HC[1] + 0.05 && h.at.z > HC[2] - 0.03,
  });
  b.cards(foreheadHits, TUFT, { size: [0.022, 0.04], lean: 55, flow: [0, -0.1, -1], vary: 0.2, rng: rng(9), color: RUST, bone: head });
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      b.rod([s * 0.03, 0.494 - k * 0.003, 0.37], [s * (0.115 + k * 0.006), 0.508 + (k - 1) * 0.022, 0.33], 0.0014, {
        color: "#fff7e8",
        sides: 3,
        bone: head,
      });
    }
  }

  // ears with gold cuff on the left one
  const earPaintFor = (thick: THREE.Vector3) =>
    cel(
      paint((_p, n, c) => {
        const front = n.dot(thick) > 0.5;
        const x = Math.abs(c[0]);
        const y = c[1];
        const inner = y > 0.004 + 0.006 * zigzag(x / 0.012) && x < 0.04 - 0.4 * y;
        return front && inner ? "#fff5e0" : RUST_LIT;
      }),
    );
  const earOutline: Array<[number, number]> = [
    [-0.052, -0.012],
    [-0.057, 0.03],
    [-0.041, 0.07],
    [0, 0.098],
    [0.041, 0.07],
    [0.057, 0.03],
    [0.052, -0.012],
  ];
  const ears: Record<string, ReturnType<typeof b.extrude>> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const earJoint = b.joint(`ear${side}`, { parent: head, at: [s * 0.07, 0.572, 0.235], dir: [s * 0.4, 1, 0.12], role: "hinge" });
    const X: [number, number, number] = [1, -s * 0.4, 0];
    const Y: [number, number, number] = [s * 0.4, 1, 0.12];
    const thick = new THREE.Vector3(...X).cross(new THREE.Vector3(...Y)).normalize();
    const ear = b.extrude(earOutline, {
      at: earJoint.at,
      x: X,
      y: Y,
      thickness: 0.018,
      bevel: 0.005,
      smoothing: 2,
      color: earPaintFor(thick),
      bone: earJoint,
      name: `ear${side}`,
    });
    ears[side] = ear;
    const dir = ear.dir([0, 1, 0]);
    const tuftFrames = [-0.016, 0, 0.016].map((u, i) => frame(ear.local([u, 0.016 + i * 0.002, 0.006]), dir));
    b.cards(tuftFrames, TUFT, { size: [0.016, 0.036], lean: 20, flow: [0, 0, 1], vary: 0.2, rng: rng(30 + i2(s)), color: CREAM, bone: earJoint });
  }
  function i2(s: number) {
    return s > 0 ? 1 : 2;
  }
  // gold ear cuff, gem and tassel on the left ear
  {
    const ear = ears.L;
    const ringAt = ear.local([0.051, 0.036, 0]);
    const along = ear.dir([0, 1, 0]);
    b.part(new THREE.TorusGeometry(0.0175, 0.0042, 5, 12), GOLD, { at: ringAt, dir: along, axis: "z", bone: head === null ? undefined : (b.root, undefined) });
    const outer = ear.local([0.069, 0.036, 0]);
    glow(b.part(new THREE.OctahedronGeometry(0.0085), TEAL, { at: outer, bone: undefined }), 1.4);
    b.part(new THREE.SphereGeometry(0.0055, 6, 4), GOLD_FLAT, { at: ear.local([0.069, 0.016, 0]) });
    b.cards([frame(ear.local([0.07, 0.006, 0]), [0, 1, 0])], TASSEL, { size: [0.022, 0.058], lean: 180, flow: [0, 0, 1] });
  }

  // jaw/ear joints are now defined; head sweeps neck collar
  // ------------------------------------------------------------------------------------------------------------
  // Collar, pendant and tassel
  const collar = b.surface(body).loop(neck.at(0.2), { lift: 0.011 });
  b.sweep(collar, 0.0095, { color: CORD, sides: 6, name: "collar" });
  let frontT = 0;
  let frontZ = -9;
  for (let i = 0; i <= 40; i++) {
    const q = collar.at(i / 40);
    if (q.z > frontZ) {
      frontZ = q.z;
      frontT = i / 40;
    }
  }
  const collarFront = collar.at(frontT);
  const pend = b.surface(body).ray([0, collarFront.y - 0.04, 0.6], [0, 0, -1]);
  if (pend) {
    const P = pend.at;
    const leaf = b.extrude(
      [
        [0, 0.03],
        [0.016, 0.012],
        [0.02, -0.006],
        [0.01, -0.024],
        [0, -0.034, "sharp"],
        [-0.01, -0.024],
        [-0.02, -0.006],
        [-0.016, 0.012],
      ],
      { at: [P.x, P.y, P.z + 0.007], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.008, bevel: 0.002, smoothing: 1, color: GOLD, bone: chest, name: "pendant" },
    );
    b.part(new THREE.PlaneGeometry(0.036, 0.06), "#ffffff", {
      at: [P.x, P.y - 0.002, P.z + 0.0125],
      dir: [0, 0, 1],
      axis: "z",
      texture: FILIGREE,
      bone: chest,
    });
    glow(b.part(new THREE.OctahedronGeometry(0.0085, 0), LEAF_GLOW, { at: [P.x, P.y + 0.003, P.z + 0.0155], bone: chest, scale: [0.85, 1.3, 0.8] }), 1.5);
    b.part(new THREE.SphereGeometry(0.006, 6, 4), GOLD_FLAT, { at: [P.x, P.y + 0.034, P.z + 0.007], bone: chest });
    b.cards([frame([P.x, P.y - 0.035, P.z + 0.008], [0, 1, 0])], TASSEL, { size: [0.028, 0.075], lean: 180, flow: [0, 0, 1], bone: chest });
    void leaf;
  }

  // ------------------------------------------------------------------------------------------------------------
  // Tail
  const tailSweep = b.sweep(tail, [0.05, 0.072, 0.09, 0.092, 0.075, 0.055], { color: tailPaint, name: "tail" });
  const tailHits = b.surface(tailSweep).scatter(190, { rng: rng(21), minDist: 0.03 });
  b.cards(tailHits, TUFT, {
    size: [0.04, 0.07],
    lean: 58,
    bend: 18,
    flow: (f) => {
      const t = tailPath.closestT(f.at);
      return tailPath.tangentAt(Math.min(t + 0.02, 1));
    },
    vary: 0.3,
    rng: rng(22),
    color: tailPaint,
  });
  // gold tail band + tassel, wrist bangles
  {
    const band = b.surface(tailSweep).loop(tail.at(0.74), { lift: 0.007 });
    b.sweep(band, 0.0085, { color: GOLD, sides: 5, name: "tailBand" });
    b.sweep(b.surface(tailSweep).loop(tail.at(0.8), { lift: 0.006 }), 0.005, { color: "#d8334a", sides: 5, name: "tailBand2" });
    glow(b.part(new THREE.OctahedronGeometry(0.01), TEAL, { at: band.at(0.5) }), 1.4);
    const lowest = band.at(0.5);
    b.cards([frame([lowest.x, lowest.y - 0.002, lowest.z], [0, 1, 0])], TASSEL, { size: [0.03, 0.075], lean: 180, flow: [0, 0, 1] });
  }
  for (const [chain, sk] of [
    [legFL, limbSkin[0]],
    [legFR, limbSkin[2]],
  ] as const) {
    const bangle = b.surface(sk).loop(chain.at(0.86), { lift: 0.004 });
    b.sweep(bangle, 0.0055, { color: GOLD, sides: 5 });
    b.sweep(b.surface(sk).loop(chain.at(0.78), { lift: 0.003 }), 0.003, { color: "#d8334a", sides: 5 });
  }

  // fur cards on the body, thighs and chest
  const bodyHits = b.surface(body).scatter(150, {
    rng: rng(31),
    minDist: 0.03,
    filter: (h) => h.n.y > -0.3 && h.at.z > -0.22 && h.at.z < 0.14,
  });
  b.cards(bodyHits, TUFT, { size: [0.04, 0.065], lean: 68, bend: 22, vary: 0.3, rng: rng(32), color: coat });
  const chestHits = b.surface(body).scatter(40, {
    rng: rng(33),
    minDist: 0.026,
    filter: (h) => h.at.z > 0.1 && h.n.y < 0.3,
  });
  b.cards(chestHits, TUFT, { size: [0.03, 0.05], lean: 60, flow: [0, -1, -0.3], vary: 0.25, rng: rng(34), color: coat });

  // ------------------------------------------------------------------------------------------------------------
  // Dressing: moss, grass, flowers, mushrooms, dendro sprout, motes
  const mossHits = stoneSkin.scatter(90, {
    rng: rng(41),
    minDist: 0.05,
    filter: (h) => h.n.y > -0.1 && h.n.y < 0.55 && h.at.y > 0.14 && h.at.y < 0.255,
  });
  b.cards(mossHits, MOSS_TUFT, { size: [0.05, 0.06], lean: 175, flow: [0, 0, 1], vary: 0.3, rng: rng(42), bone: base });
  const grassFrames: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 44; i++) {
    const a = rand() * Math.PI * 2;
    const rr = 0.46 + rand() * 0.22;
    grassFrames.push(frame([Math.cos(a) * rr, 0.02, Math.sin(a) * rr * 0.85], [0, 1, 0]));
  }
  b.cards(grassFrames, GRASS, { size: [0.07, 0.1], lean: 8, flow: [0.3, 0, 1], cross: true, vary: 0.35, rng: rng(43), bone: base });
  const flowerFrames = [
    [0.52, 0.34],
    [0.38, 0.5],
    [-0.52, -0.38],
    [-0.4, 0.47],
    [0.55, -0.2],
    [-0.58, 0.1],
    [0.1, 0.58],
    [-0.15, -0.55],
  ].map(([x, z]) => frame([x, 0.025, z], [0, 1, 0]));
  b.cards(flowerFrames, FLOWER, { size: [0.045, 0.062], lean: 6, flow: [0.2, 0, 1], cross: true, vary: 0.25, rng: rng(44), bone: base });
  // flowers up on the moss cushions too
  b.cards(
    [
      [0.27, 0.0],
      [-0.26, 0.08],
      [0.07, 0.26],
    ].map(([x, z]) => frame([x, 0.262, z], [0, 1, 0])),
    FLOWER,
    { size: [0.035, 0.048], lean: 8, flow: [0, 0, 1], cross: true, rng: rng(45), bone: base },
  );

  // glowing mushrooms
  for (const [x, z, h, r] of [
    [0.36, 0.4, 0.034, 0.03],
    [0.41, 0.35, 0.024, 0.021],
    [0.32, 0.45, 0.02, 0.017],
  ] as const) {
    b.part(new THREE.CylinderGeometry(r * 0.28, r * 0.34, h, 6), "#f6e6c8", { at: [x, 0.03 + h / 2, z], bone: base });
    glow(
      b.lathe(
        [
          [0, 0],
          [r, 0],
          [r * 1.06, h * 0.22],
          [r * 0.72, h * 0.62],
          [0, h * 0.82],
        ],
        { at: [x, 0.03 + h * 0.9, z], bone: base, segments: 9, color: TEAL, name: "mushroomCap" },
      ),
      1.3,
    );
  }

  // dendro sprout on the back-left rock
  {
    const rock = rockParts[1];
    const rb = new THREE.Box3().setFromObject(rock.mesh, true);
    const top = rb.max.y - 0.02;
    const sx = -0.43;
    const sz = -0.14;
    const stem = catmull([
      [sx, top, sz],
      [sx + 0.006, top + 0.05, sz + 0.004],
      [sx - 0.004, top + 0.1, sz],
    ]);
    b.sweep(stem, [0.0075, 0.0045], { color: "#3f9d55", bone: base, sides: 5 });
    const leafOutline: Array<[number, number]> = [
      [0, 0],
      [0.014, 0.018],
      [0.011, 0.045],
      [0, 0.064],
      [-0.011, 0.045],
      [-0.014, 0.018],
    ];
    for (const s of [1, -1]) {
      glow(
        b.extrude(leafOutline, {
          at: [sx + 0.0, top + 0.07, sz],
          x: [0, 0, 1],
          y: [s * 0.8, 0.6, 0],
          thickness: 0.004,
          smoothing: 2,
          color: LEAF_GLOW,
          bone: base,
        }),
        1.2,
      );
    }
    glow(b.part(new THREE.IcosahedronGeometry(0.011, 0), "#fff3a0", { at: [sx - 0.004, top + 0.108, sz], bone: base }), 1.6);
  }

  // drifting motes
  const motes: Array<[number, number, number, string]> = [
    [0.24, 0.62, 0.12, MOTE],
    [-0.22, 0.7, 0.02, TEAL],
    [0.3, 0.46, -0.28, MOTE],
    [-0.14, 0.8, -0.2, MOTE],
    [0.12, 0.74, 0.3, TEAL],
    [-0.32, 0.5, 0.24, MOTE],
    [0.35, 0.82, -0.52, TEAL],
  ];
  for (const [x, y, z, c] of motes)
    glow(b.part(new THREE.OctahedronGeometry(0.0095, 0), c, { at: [x, y, z], bone: base, scale: [0.8, 1.35, 0.8] }), 1.5);

  return b.root;
}
