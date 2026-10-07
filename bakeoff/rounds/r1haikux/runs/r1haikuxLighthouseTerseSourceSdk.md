```ts
import * as THREE from "three";
import { createBuilder, gradient, mix, mottle, noise, paint, rng, smoothstep, svg } from "agentic-3js-builder";

export const meta = {
  name: "Lighthouse on a tiny island",
  description:
    "A red-and-white striped stone lighthouse with a glowing lantern and a light beam, a keeper's cottage, and a rocky islet with boulders and grass tufts in a foamy sea.",
};

// Palette
const WHITE = "#f2eee3";
const RED = "#c63f2c";
const IRON = "#2a333b";
const ROOF = "#2e4854";
const DOOR = "#5a3423";
const BRASS = "#d9a23d";
const STONE = "#cbc5b4";
const WARM = "#ffd66b";
const GLASS_DARK = "#22364a";
const GLASS_LIGHT = "#6f93ad";

// Paints: colour as a function of model-space position and normal, baked into one texture.
const rock = mottle("#7a786b", "#a8a492", { size: 1.6, seed: 4, contrast: 1.1 });
const turf = mottle("#4e7f3a", "#8ab85a", { size: 0.8, seed: 9 });
const isletPaint = paint((p, n) =>
  mix(rock.at(p, n), turf.at(p, n), smoothstep(0.66, 0.84, n.y + 0.14 * (noise(p, 2.4, 13) - 0.5))),
);
const boulderPaint = mottle("#6b6a60", "#9f9c8c", { size: 0.7, seed: 12 });

const seaPaint = paint((p) => {
  const r = Math.hypot(p.x, p.z);
  const edge = 8.95 + 0.4 * (noise(p, 2.6, 21) - 0.5);
  const foam = 1 - smoothstep(0.2, 0.55, Math.abs(r - edge));
  const depth = smoothstep(9.5, 12.5, r);
  const streak = smoothstep(0.58, 0.75, noise(p, 1.2, 7));
  const water = mix(mix("#44c9b8", "#1d78a8", depth), "#8fe6dc", streak * 0.35 * (1 - depth));
  return mix(water, "#f6fcff", foam * 0.92);
});

const lanternPaint = gradient("#ffb53a", "#fff6cc", [0, 14.8, 0], [0, 17, 0]);
const beamPaint = gradient("#ffe36e", "#fffbe6", [0, 16.3, 0], [-10, 16.3, 3.3]);

const BAND = 3.2;
const DOOR_TOP = 2.75;
const WINDOWS = [
  { theta: 0, y0: 4.7, y1: 6.0 },
  { theta: 0, y0: 9.5, y1: 10.8 },
  { theta: 2.2, y0: 7.4, y1: 8.7 },
  { theta: -2.2, y0: 7.4, y1: 8.7 },
];

/** Inside a door of the given half width: square sides up to DOOR_TOP, a semicircular head above. */
function inDoor(across: number, y: number, half: number, floor: number) {
  if (Math.abs(across) > half || y < floor) return false;
  if (y <= DOOR_TOP) return true;
  return across * across + (y - DOOR_TOP) ** 2 <= half * half;
}

const shaftPaint = paint((p) => {
  const r = Math.hypot(p.x, p.z);
  const turn = Math.atan2(p.x, p.z);
  if (p.z > 0) {
    if (inDoor(p.x, p.y, 0.5, 1.45)) return DOOR;
    if (inDoor(p.x, p.y, 0.66, 1.4)) return WHITE;
  }
  for (const w of WINDOWS) {
    const across = Math.atan2(Math.sin(turn - w.theta), Math.cos(turn - w.theta)) * r;
    if (Math.abs(across) < 0.44 && p.y > w.y0 - 0.14 && p.y < w.y1 + 0.14) {
      if (Math.abs(across) < 0.3 && p.y > w.y0 && p.y < w.y1)
        return mix(GLASS_DARK, GLASS_LIGHT, (p.y - w.y0) / (w.y1 - w.y0));
      return WHITE;
    }
  }
  const f = (p.y - 1.6) / BAND;
  return f - Math.floor(f) < 0.5 ? RED : WHITE;
});

export default function lighthouse() {
  const b = createBuilder({ name: "lighthouse", paintSize: 2048 });

  // Joints: the base is the root; the lamp sits in the lantern and turns the light.
  b.joint("base", { at: [0, 0, 0] });
  b.joint("lamp", { at: [0, 16.3, 0], parent: "base", dir: [0, 1, 0] });

  // Sea: a flat plate with a foam ring where the islet meets it.
  b.lathe(
    [
      [0, -0.25],
      [12.5, -0.25],
      [12.5, 0],
      [0, 0],
    ],
    { color: seaPaint, at: [0, 0, 0], segments: 40, bone: "base", name: "sea" },
  );

  // Islet: a squat rock, grassy on top, bulging at the shore.
  const isle = b.lathe(
    [
      [0, -0.25],
      [7.6, -0.25],
      [8.6, 0],
      [9.25, 0.35],
      [9.0, 0.75],
      [8.1, 0.98],
      [6.8, 1.14],
      [5.0, 1.34],
      [3.0, 1.5],
      [1.2, 1.56],
      [0, 1.58],
    ],
    { color: isletPaint, at: [0, 0, 0], segments: 14, bone: "base", name: "islet" },
  );
  const isleSurface = b.surface(isle);

  // Tower: a tapering shaft on a flared plinth. Its bands, windows and door are paint.
  b.lathe(
    [
      [0, 0.4],
      [3.25, 0.4],
      [3.15, 1.25],
      [2.7, 1.7],
      [2.45, 8.0],
      [2.25, 14.2],
      [2.05, 14.6],
      [0, 14.6],
    ],
    { color: shaftPaint, at: [0, 0, 0], segments: 16, bone: "base", name: "tower" },
  );
  b.part(new THREE.BoxGeometry(1.6, 0.24, 0.8), STONE, { at: [0, 1.42, 3.3], bone: "base", name: "step" });

  // Gallery deck, posts and rails.
  b.lathe(
    [
      [1.3, 14.45],
      [3.3, 14.45],
      [3.4, 14.62],
      [3.3, 14.8],
      [1.3, 14.8],
    ],
    { color: IRON, at: [0, 0, 0], segments: 16, bone: "base", name: "gallery" },
  );
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const x = Math.sin(a) * 3.2;
    const z = Math.cos(a) * 3.2;
    b.rod([x, 14.75, z], [x, 15.72, z], 0.055, { color: IRON, caps: "flat", bone: "base", name: "post" });
  }
  const railRing = (radius: number, y: number, tube: number, name: string) => {
    const profile: [number, number][] = [];
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      profile.push([radius + tube * Math.cos(a), y + tube * Math.sin(a)]);
    }
    b.lathe(profile, { color: IRON, at: [0, 0, 0], segments: 16, bone: "base", name });
  };
  railRing(3.2, 15.72, 0.06, "rail");
  railRing(3.2, 15.2, 0.035, "midrail");

  // Lantern: warm glass in an iron frame, a dark cap and a brass finial. The lamp joint turns it all.
  b.lathe(
    [
      [0, 14.75],
      [1.55, 14.75],
      [1.55, 17.0],
      [0, 17.0],
    ],
    { color: lanternPaint, at: [0, 0, 0], segments: 8, bone: "lamp", name: "lantern" },
  );
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const x = Math.sin(a) * 1.6;
    const z = Math.cos(a) * 1.6;
    b.rod([x, 14.75, z], [x, 17.03, z], 0.07, { color: IRON, caps: "flat", bone: "lamp", name: "mullion" });
  }
  b.lathe(
    [
      [0, 16.95],
      [1.9, 16.95],
      [1.75, 17.25],
      [1.15, 17.7],
      [0.5, 17.95],
      [0, 18.05],
    ],
    { color: ROOF, at: [0, 0, 0], segments: 8, bone: "lamp", name: "cap" },
  );
  b.lathe(
    [
      [0, 18.0],
      [0.2, 18.1],
      [0.24, 18.22],
      [0.17, 18.34],
      [0, 18.4],
    ],
    { color: BRASS, at: [0, 0, 0], segments: 10, bone: "lamp", name: "finial" },
  );

  // The beam: a tapered cone of light leaving the lantern just above the gallery rail.
  const lamp = new THREE.Vector3(0, 16.3, 0);
  const dir = new THREE.Vector3(-1, 0, 0.32).normalize();
  b.rod(lamp.clone().addScaledVector(dir, 1.5), lamp.clone().addScaledVector(dir, 10.5), [0.35, 1.8], {
    color: beamPaint,
    caps: "flat",
    bone: "lamp",
    name: "beam",
  });

  // Keeper's cottage on the islet.
  const H = { x: 4.6, y: 0.9, z: 0.1 };
  const front = H.z + 1.1;
  b.extrude(
    [
      [-1.25, 0],
      [1.25, 0],
      [1.25, 1.5],
      [0, 2.25],
      [-1.25, 1.5],
    ],
    {
      color: WHITE,
      at: [H.x, H.y, H.z],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 2.2,
      bone: "base",
      name: "cottage",
    },
  );
  b.extrude(
    [
      [-1.5, 1.35],
      [1.5, 1.35],
      [0, 2.7],
    ],
    {
      color: ROOF,
      at: [H.x, H.y, H.z],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 2.7,
      bone: "base",
      name: "cottage roof",
    },
  );
  b.part(new THREE.BoxGeometry(0.5, 0.95, 0.1), DOOR, { at: [H.x, 1.42, front], bone: "base", name: "cottage door" });
  b.part(new THREE.BoxGeometry(0.54, 0.5, 0.08), WHITE, {
    at: [H.x - 0.75, 1.9, front],
    bone: "base",
    name: "window frame",
  });
  b.part(new THREE.BoxGeometry(0.44, 0.4, 0.1), WARM, {
    at: [H.x - 0.75, 1.9, front + 0.01],
    bone: "base",
    name: "window",
  });
  b.part(new THREE.BoxGeometry(0.36, 0.95, 0.36), STONE, {
    at: [H.x - 0.6, 3.05, H.z + 0.3],
    bone: "base",
    name: "chimney",
  });

  // Boulders on the rim and grass tufts on the turf, kept clear of the tower and cottage.
  const clear = (p: THREE.Vector3) =>
    Math.hypot(p.x, p.z) < 3.9 || (Math.abs(p.x - H.x) < 1.9 && Math.abs(p.z - H.z) < 1.8);

  const stones = isleSurface.scatter(20, {
    rng: rng(21),
    minDist: 2.2,
    keepOut: clear,
    filter: (h) => h.at.y > 0.15 && Math.hypot(h.at.x, h.at.z) > 5.4,
  });
  const shape = rng(33);
  for (const hit of stones) {
    const s = 0.45 + 0.6 * shape();
    const stone = new THREE.DodecahedronGeometry(1, 0).scale(
      s * (0.9 + 0.3 * shape()),
      s * (0.6 + 0.35 * shape()),
      s * (0.85 + 0.3 * shape()),
    );
    b.stick(stone, boulderPaint, hit, { embed: 0.4, spin: 360 * shape() });
  }

  const tufts = isleSurface.scatter(36, {
    rng: rng(55),
    minDist: 0.9,
    keepOut: clear,
    filter: (h) => h.n.y > 0.8 && Math.hypot(h.at.x, h.at.z) > 3.9,
  });
  const blades = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 90">
      <path d="M5 90 Q1 50 13 14 Q19 50 21 90Z" fill="#3f7233"/>
      <path d="M17 90 Q19 32 32 2 Q40 46 38 90Z" fill="#6aa34b"/>
      <path d="M34 90 Q39 50 51 24 Q55 58 53 90Z" fill="#4a8538"/>
      <path d="M24 90 Q26 62 30 50 Q34 62 34 90Z" fill="#8cc160"/>
    </svg>`,
    { size: 128 },
  );
  b.cards(tufts, blades, {
    size: [0.7, 0.85],
    lean: 12,
    bend: 24,
    cross: true,
    vary: 0.25,
    spin: 40,
    rng: rng(7),
  });

  return b.root;
}
```