```ts
import * as THREE from "three";
import { createBuilder, mix, noise, paint, rgb, rng, smoothstep, svg } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

type Rgb = readonly [number, number, number];

export const meta = {
  name: "Treasure hoard",
  description:
    "A heap of gold coins and cut gems around a banded oak chest, with a jewelled crown, two goblets and a velvet pouch on a smaller pile in front.",
};

// ---------------------------------------------------------------------------------------------------------------
// Layout (meters). The hoard stands on y = 0; the chest sits on a flat top of coins.

const PILE_C = new THREE.Vector3(0, 0, -0.2); // centre of the main pile, under the chest
const BASE_Y = 0.12; // height of the flat coin top the chest rests on
const BODY_W = 0.64;
const BODY_H = 0.26;
const BODY_D = 0.4;
const CHEST_Z = -0.2;
const TOP_Y = BASE_Y + BODY_H; // the lid's flat side meets the body here
const LID_R = BODY_D / 2;
const LOCK_Y = BASE_Y + BODY_H / 2;

const FRONT_P = new THREE.Vector3(0.12, 0, 0.3); // a smaller pile in front, holding the crown
const CROWN_C = new THREE.Vector3(FRONT_P.x, 0.13, FRONT_P.z);
const GOB_A = new THREE.Vector3(-0.08, 0.1, 0.25);
const GOB_B = new THREE.Vector3(0.34, 0.08, 0.38);
const POUCH = new THREE.Vector3(-0.1, 0.07, 0.42);

/** Things coins and gems must not poke through: centre (x, z) and radius. */
const BLOCKERS: [THREE.Vector3, number][] = [
  [CROWN_C, 0.13],
  [GOB_A, 0.085],
  [GOB_B, 0.085],
  [POUCH, 0.08],
];

const blocked = (p: THREE.Vector3) =>
  p.y > 0.05 && BLOCKERS.some(([c, r]) => Math.hypot(p.x - c.x, p.z - c.z) < r);

/** Inside the chest's footprint, on or under its base: nothing there is seen. */
const inChest = (p: THREE.Vector3) =>
  p.y > BASE_Y - 0.02 &&
  Math.abs(p.x) < BODY_W / 2 + 0.01 &&
  p.z > CHEST_Z - BODY_D / 2 - 0.01 &&
  p.z < CHEST_Z + BODY_D / 2 + 0.01;

const free = (p: THREE.Vector3) => !blocked(p) && !inChest(p);

// ---------------------------------------------------------------------------------------------------------------
// Lighting and paints

const LIGHT = new THREE.Vector3(0.4, 0.8, 0.45).normalize();
const SHADE: Rgb = [0.34, 0.16, 0.44]; // violet shadow tint, so shade reads as coloured light
const fract = (x: number) => x - Math.floor(x);

/** Two-band painterly shading: lit faces warm and bright, the rest cool and violet. */
function toned(c: Rgb, n: THREE.Vector3, depth = 0.45): Rgb {
  const lit = smoothstep(-0.15, 0.7, n.dot(LIGHT));
  const low: Rgb = [
    c[0] * (1 - depth) + SHADE[0] * depth,
    c[1] * (1 - depth) + SHADE[1] * depth,
    c[2] * (1 - depth) + SHADE[2] * depth,
  ];
  const high: Rgb = [Math.min(c[0] * 1.12, 1), Math.min(c[1] * 1.1, 1), Math.min(c[2] * 1.08, 1)];
  return mix(low, high, lit);
}

const WOOD_LIGHT = rgb("#b56d2f");
const WOOD_DARK = rgb("#5a3118");
const INK_C = rgb("#1d0f08");
const VEL_D = rgb("#3b1262");
const VEL_L = rgb("#8f44d6");

/** Oak boards running level across the chest, with dark seams and a grain of light and dark. */
const WOOD = paint((p, n) => {
  const row = fract(p.y / 0.065);
  let c: Rgb = mix(WOOD_DARK, WOOD_LIGHT, smoothstep(0.25, 0.8, noise(p, 0.025, 4)));
  if (row < 0.035) c = mix(c, INK_C, 0.8);
  return toned(c, n, 0.4);
});

/** Plum velvet for the pouch, with a soft fold pattern. */
const VELVET = paint((p, n) => toned(mix(VEL_D, VEL_L, smoothstep(0.3, 0.7, noise(p, 0.03, 9))), n, 0.5));

const GILT = metal("gilt", { tarnish: 0.08 });
const PILE = metal("brass", { tarnish: 0.3, polish: 0.35 });
const IRON = metal("iron", { polish: 0.4 });

const COINS = ["#f6c142", "#ffdb6e", "#e39a22", "#f3c85a", "#dfe5ee", "#c9793c"];
const GEM_COLORS = ["#e0173d", "#1fd17a", "#2f8bff", "#b14dff", "#ffa52b"];

// ---------------------------------------------------------------------------------------------------------------
// Drawings (textures)

/** A coin face: gold with a dark rim and a crown in relief. */
const COIN_A = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="g" cx="0.38" cy="0.32" r="0.8">
      <stop offset="0" stop-color="#fff4a8"/><stop offset="0.55" stop-color="#f2b632"/><stop offset="1" stop-color="#a95f12"/>
    </radialGradient></defs>
    <circle cx="32" cy="32" r="31" fill="#5a300a"/>
    <circle cx="32" cy="32" r="27.5" fill="url(#g)"/>
    <circle cx="32" cy="32" r="22" fill="none" stroke="#7a4210" stroke-width="2.4"/>
    <path d="M19 42 L19 27 L26 34 L32 21 L38 34 L45 27 L45 42 Z" fill="#7a4210"/>
    <path d="M19 42 H45" stroke="#7a4210" stroke-width="3"/>
    <circle cx="32" cy="30" r="1.8" fill="#fff4a8"/>
  </svg>`,
  { size: 128 },
);

/** The other coin face: a star in a dotted ring. */
const COIN_B = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="31" fill="#5a300a"/>
    <circle cx="32" cy="32" r="27.5" fill="#ffd45c"/>
    <circle cx="32" cy="32" r="24.5" fill="none" stroke="#8a5514" stroke-width="2" stroke-dasharray="1.5 2.5"/>
    <circle cx="32" cy="32" r="19" fill="#e39a22"/>
    <path d="M32 13 L35.5 26.5 L49 27 L38.5 35 L42.5 48 L32 40 L21.5 48 L25.5 35 L15 27 L28.5 26.5Z"
      fill="#fff1a0" stroke="#7a4210" stroke-width="2" stroke-linejoin="round"/>
  </svg>`,
  { size: 128 },
);

/** The chest's lock emblem: a dark shield, gold rim and a star, with a ruby at its foot. */
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 3 L57 11 L55 36 Q51 53 32 61 Q13 53 9 36 L7 11 Z" fill="#2b1409" stroke="#ffc84a" stroke-width="4" stroke-linejoin="round"/>
    <path d="M32 16 L36 27 L48 27 L38 34 L42 46 L32 39 L22 46 L26 34 L16 27 L28 27 Z" fill="#ffd45c"/>
    <circle cx="32" cy="51" r="3.2" fill="#e0173d"/>
  </svg>`,
  { size: 256 },
);

/** A four-point glint for sparkles that glow over the gold. */
const SPARK = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 2 Q37 27 62 32 Q37 37 32 62 Q27 37 2 32 Q27 27 32 2 Z" fill="#fff6b8"/>
    <path d="M32 12 Q34.5 29.5 52 32 Q34.5 34.5 32 52 Q29.5 34.5 12 32 Q29.5 29.5 32 12 Z" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
// Profiles and shared geometry

/** The main pile: a flat top under the chest, sloping down into the floor. */
const MOUND: [number, number][] = [
  [0, 0],
  [0.72, 0],
  [0.7, 0.03],
  [0.6, 0.07],
  [0.5, 0.105],
  [0.42, 0.12],
  [0, 0.12],
];

/** The pile in front: a rounded heap for the crown and the goblets. */
const FRONT: [number, number][] = [
  [0, 0],
  [0.3, 0],
  [0.28, 0.03],
  [0.22, 0.075],
  [0.13, 0.118],
  [0.06, 0.13],
  [0, 0.13],
];

/** A goblet: a stepped foot, a stem, and a flared cup with a rim, its floor at 0.15. */
const GOBLET: [number, number][] = [
  [0, 0],
  [0.056, 0],
  [0.06, 0.012],
  [0.016, 0.045],
  [0.012, 0.1],
  [0.05, 0.13],
  [0.075, 0.19],
  [0.078, 0.212],
  [0.068, 0.214],
  [0.058, 0.2],
  [0.045, 0.155],
  [0, 0.15],
];

/** A velvet pouch with a gathered neck. */
const POUCH_SHAPE: [number, number][] = [
  [0, 0],
  [0.055, 0],
  [0.07, 0.04],
  [0.058, 0.085],
  [0.03, 0.102],
  [0.034, 0.11],
  [0, 0.11],
];

/** The crown band: a ring with a lip on top. */
const CROWN_RING: [number, number][] = [
  [0.092, 0],
  [0.108, 0],
  [0.108, 0.05],
  [0.118, 0.05],
  [0.118, 0.062],
  [0.1, 0.062],
  [0.092, 0.05],
];

/** Faceted gem profile (x across, y along the axis), scaled per gem. */
const GEM_PROFILE: [number, number][] = [
  [0, -0.6],
  [0.7, -0.2],
  [0.8, 0],
  [0.7, 0.25],
  [0, 0.9],
];

const gemGeo = (s: number) =>
  new THREE.LatheGeometry(
    GEM_PROFILE.map(([x, y]) => new THREE.Vector2(x * s, y * s)),
    6,
  );
const GEM_S = gemGeo(0.016);
const GEM_M = gemGeo(0.022);
const GEM_L = gemGeo(0.03);

const COIN = new THREE.CylinderGeometry(0.024, 0.024, 0.006, 10);
const TINY = new THREE.SphereGeometry(0.008, 6, 4);
const STUD = new THREE.SphereGeometry(0.008, 6, 4);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "treasure-hoard" });
  b.joint("hoard", { at: [0, 0, 0] });

  const rA = rng(11);
  const rB = rng(29);
  const rC = rng(47);

  // -------- Piles ------------------------------------------------------------------------------------------
  const mound = b.lathe(MOUND, { at: PILE_C, segments: 14, color: PILE });
  const front = b.lathe(FRONT, { at: FRONT_P, segments: 12, color: PILE });

  // -------- Chest -------------------------------------------------------------------------------------------
  // Body: oak box on the coin top.
  b.part(new THREE.BoxGeometry(BODY_W, BODY_H, BODY_D), WOOD, {
    at: [0, BASE_Y + BODY_H / 2, CHEST_Z],
  });
  // Lid: a half cylinder with its arch up, its flat side on the body top.
  b.part(new THREE.CylinderGeometry(LID_R, LID_R, BODY_W, 18, 1, false, 0, Math.PI), WOOD, {
    at: [0, TOP_Y, CHEST_Z],
    rotation: [0, 0, 90],
  });
  // Iron bands wrapped over the lid.
  for (const x of [-0.2, 0, 0.2]) {
    b.part(new THREE.CylinderGeometry(LID_R + 0.006, LID_R + 0.006, 0.03, 18, 1, true, 0, Math.PI), IRON, {
      at: [x, TOP_Y, CHEST_Z],
      rotation: [0, 0, 90],
    });
  }
  // Vertical iron straps on the front, each with gilt studs.
  for (const x of [-0.2, 0, 0.2]) {
    b.part(new THREE.BoxGeometry(0.035, BODY_H + 0.01, 0.014), IRON, {
      at: [x, LOCK_Y, 0.004],
    });
  }
  for (const x of [-0.2, 0.2])
    for (const y of [BASE_Y + 0.04, BASE_Y + 0.1, TOP_Y - 0.1, TOP_Y - 0.04]) {
      b.part(STUD, GILT, { at: [x, y, 0.017] });
    }
  // Gilt corner caps.
  for (const x of [-0.32, 0.32])
    for (const z of [-0.005, CHEST_Z * 2 - 0.395]) {
      b.part(new THREE.BoxGeometry(0.05, BODY_H + 0.01, 0.05), GILT, {
        at: [x, LOCK_Y, z],
      });
    }
  // Iron end handles.
  for (const x of [-0.33, 0.33]) {
    b.part(new THREE.TorusGeometry(0.04, 0.008, 6, 12), IRON, {
      at: [x, LOCK_Y, CHEST_Z],
      rotation: [0, 90, 0],
    });
  }
  // Lock plate and its emblem.
  b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.022, 18), GILT, {
    at: [0, LOCK_Y, 0.012],
    rotation: [90, 0, 0],
  });
  b.part(new THREE.PlaneGeometry(0.085, 0.085), "#ffffff", {
    at: [0, LOCK_Y, 0.0245],
    dir: [0, 0, 1],
    axis: "z",
    texture: EMBLEM,
  });

  // -------- Crown -----------------------------------------------------------------------------------------
  const crownBand = b.lathe(CROWN_RING, { at: CROWN_C, segments: 16, color: GILT });
  const gemsOnCrown = ["#e0173d", "#2f8bff", "#1fd17a", "#b14dff", "#ffa52b"];
  for (let k = 0; k < 5; k++) {
    const a = (k * Math.PI * 2) / 5;
    const sx = Math.sin(a);
    const cz = Math.cos(a);
    // A spike on every fifth of the band.
    b.part(new THREE.ConeGeometry(0.022, 0.085, 6), GILT, {
      at: [CROWN_C.x + 0.1 * sx, CROWN_C.y + 0.062 + 0.0425, CROWN_C.z + 0.1 * cz],
    });
    const tip = b.part(TINY, gemsOnCrown[k], {
      at: [CROWN_C.x + 0.1 * sx, CROWN_C.y + 0.147 + 0.006, CROWN_C.z + 0.1 * cz],
    });
    glow(tip, 1.3);
  }
  // Cabochons set in the band's front.
  for (const [i, a] of [0, 144, 288].map((d, i) => [i, (d * Math.PI) / 180] as const)) {
    const dir: [number, number, number] = [Math.sin(a), 0, Math.cos(a)];
    const at: [number, number, number] = [
      CROWN_C.x + 0.11 * dir[0],
      CROWN_C.y + 0.028,
      CROWN_C.z + 0.11 * dir[2],
    ];
    const cab = b.part(GEM_S, GEM_COLORS[(i * 2) % GEM_COLORS.length], { at, dir });
    glow(cab, 1.4);
  }
  void crownBand;

  // -------- Goblets -------------------------------------------------------------------------------------
  for (const [g, filled] of [
    [GOB_A, true],
    [GOB_B, false],
  ] as const) {
    b.lathe(GOBLET, { at: g, segments: 12, color: GILT });
    // A jewel set in the bowl's front.
    const jewel = b.part(GEM_M, GEM_COLORS[filled ? 2 : 0], {
      at: [g.x, g.y + 0.12, g.z + 0.056],
      dir: [0, 0, 1],
    });
    glow(jewel, 1.3);
    if (filled) {
      // Coins spilling over inside the cup.
      for (let i = 0; i < 4; i++) {
        b.part(COIN, COINS[i % 3], {
          at: [g.x + (rC() - 0.5) * 0.02, g.y + 0.165 + i * 0.0065, g.z + (rC() - 0.5) * 0.02],
          rotation: [(rC() - 0.5) * 20, rC() * 360, (rC() - 0.5) * 20],
        });
      }
    }
  }

  // -------- Velvet pouch -------------------------------------------------------------------------------
  b.lathe(POUCH_SHAPE, { at: POUCH, segments: 12, color: VELVET });
  b.lathe(
    [
      [0.03, 0.1],
      [0.042, 0.1],
      [0.042, 0.115],
      [0.03, 0.115],
    ],
    { at: POUCH, segments: 12, color: GILT },
  );

  // -------- Coins on the piles -------------------------------------------------------------------------
  const pile = b.surface([mound, front]);
  const coins = pile.scatter(260, {
    rng: rA,
    minDist: 0.03,
    filter: (h) => h.n.y > 0.22 && free(h.at),
  });
  coins.forEach((h, i) => {
    const tex = i % 9 === 0 ? COIN_A : i % 13 === 4 ? COIN_B : null;
    const color = tex ? "#ffffff" : COINS[Math.floor(rA() * COINS.length)];
    b.stick(COIN, color, h, {
      embed: 0.45,
      spin: rA() * 360,
      ...(tex ? { texture: tex } : {}),
    });
  });

  // -------- Gems set into the pile -------------------------------------------------------------------
  const gems = pile.scatter(20, {
    rng: rB,
    minDist: 0.1,
    filter: (h) => h.n.y > 0.45 && free(h.at),
  });
  gems.forEach((h, i) => {
    const geo = i % 3 === 0 ? GEM_L : i % 3 === 1 ? GEM_M : GEM_S;
    glow(b.stick(geo, GEM_COLORS[i % GEM_COLORS.length], h, { embed: 0.4, flat: true }), 1.25);
  });

  // -------- Glints over the gold ----------------------------------------------------------------------
  const glints = pile.scatter(12, {
    rng: rC,
    minDist: 0.14,
    filter: (h) => h.n.y > 0.4 && free(h.at),
  });
  if (glints.length) glow(b.cards(glints, SPARK, { size: 0.06, lean: 0 }), 1.3);

  // -------- Spilt on the floor ---------------------------------------------------------------------------
  for (let i = 0; i < 48; i++) {
    const a = rC() * Math.PI * 2;
    const d = 0.76 + rC() * 0.26;
    const x = PILE_C.x + Math.sin(a) * d;
    const z = PILE_C.z + Math.cos(a) * d;
    if (Math.hypot(x - FRONT_P.x, z - FRONT_P.z) < 0.36) continue;
    b.part(COIN, COINS[Math.floor(rC() * COINS.length)], {
      at: [x, 0.003, z],
      rotation: [(rC() - 0.5) * 14, rC() * 360, (rC() - 0.5) * 14],
    });
  }
  // Three upright gems lying in the spill, tips up.
  const floorGems: [number, number, number][] = [
    [-0.58, 0, 0.12],
    [0.56, 0, 0.5],
    [-0.42, 0, -0.78],
  ];
  floorGems.forEach(([x, , z], i) => {
    const s = i === 0 ? GEM_M : GEM_S;
    const sc = i === 0 ? 0.022 : 0.016;
    glow(
      b.part(s, GEM_COLORS[(i * 2 + 1) % GEM_COLORS.length], {
        at: [x, 0.6 * sc, z],
      }),
      1.2,
    );
  });

  return b.root;
}
```