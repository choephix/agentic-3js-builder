import * as THREE from "three";
import {
  catmull,
  createBuilder,
  frame,
  grain,
  mottle,
  paint,
  rng,
  scales,
  spots,
  stripes,
} from "../../../../src/index";

export const meta = {
  name: "Treehouse diorama",
  description:
    "A cosy treehouse cabin with a red shingle roof and a round window in an old oak on a grassy round base, with a swing, rope ladder, lantern, pennant, mushrooms and a bicycle.",
};

type V = [number, number, number];
type Builder = ReturnType<typeof createBuilder>;

/** Height of the grass top: everything on the ground stands here. */
const GROUND = 0.4;
/** The cabin: its centre (x, z), the deck top, the eave (top of the walls), the front face and the side wall. */
const HOUSE = { x: 0.25, z: 0.3 };
const FLOOR = 3.07;
const EAVE = 4.37;
const FRONT = HOUSE.z + 0.7;
const SIDE = HOUSE.x - 0.85;

const trim = "#f3e4c6";
const glow = "#ffd77a";
const rope = "#c9a66b";
const timber = "#4a2c1a";

/** Hex colour to 0..255 channels. */
function hex(c: string) {
  return [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
}

function lerpRgb(a: number[], b: number[], t: number) {
  return a.map((x, i) => x + (b[i] - x) * t);
}

/** A small RGBA DataTexture painted per texel: `pixel(u, v)` gives [r, g, b, a] with v = 0 at the bottom. */
function bitmap(w: number, h: number, pixel: (u: number, v: number) => number[]) {
  const data = new Uint8Array(w * h * 4);
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) {
      const rgba = pixel((i + 0.5) / w, (j + 0.5) / h);
      data.set(
        rgba.map((x) => Math.max(0, Math.min(255, Math.round(x)))),
        (j * w + i) * 4,
      );
    }
  const texture = new THREE.DataTexture(data, w, h, THREE.RGBAFormat, THREE.UnsignedByteType);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/** A leaf cut-out: lens-shaped, with a lighter midrib and faint veins. */
function leafTexture(dark: string, light: string) {
  const d = hex(dark);
  const l = hex(light);
  return bitmap(64, 64, (u, v) => {
    const x = (u - 0.5) * 2;
    const y = v * 2 - 1;
    const half = 0.94 * Math.pow(Math.max(0, 1 - y * y), 0.7);
    const cover = Math.min(1, Math.max(0, (half - Math.abs(x)) * 45));
    const midrib = Math.abs(x) < 0.04 ? 0.8 : 0;
    const vein = Math.abs(Math.sin((y - Math.abs(x) * 1.5) * 9)) < 0.1 ? 0.3 : 0;
    const c = lerpRgb(lerpRgb(d, l, 0.3 + 0.4 * v), l, Math.max(midrib, vein));
    return [c[0], c[1], c[2], cover * 255];
  });
}

/** A tapering grass blade: wide at the root, pointed at the tip. */
function bladeTexture() {
  const dark = hex("#2c6a26");
  const light = hex("#9bd660");
  return bitmap(16, 48, (u, v) => {
    const half = 0.5 * Math.pow(1 - v, 0.55);
    const cover = Math.min(1, Math.max(0, (half - Math.abs(u - 0.5)) * 40));
    const c = lerpRgb(dark, light, v);
    return [c[0], c[1], c[2], cover * 255];
  });
}

/** A red bicycle standing on the grass, side-on to +Z, nose toward +X. */
function bicycle(b: Builder, z: number) {
  const R = 0.3;
  const hubY = GROUND + 0.32;
  const rear: V = [-0.5, hubY, z];
  const front: V = [0.48, hubY, z];
  const bb: V = [-0.12, hubY - 0.08, z];
  const seat: V = [-0.24, 1.08, z];
  const head: V = [0.34, 1.06, z];
  const headLow: V = [0.37, 0.92, z];
  const bars: V = [0.4, 1.2, z];
  const tube = (a: V, c: V, r: number, color = "#d4462c") => b.rod(a, c, r, { color });

  tube(bb, seat, 0.02);
  tube(seat, head, 0.018);
  tube(bb, headLow, 0.02);
  tube(bb, rear, 0.016);
  tube(seat, rear, 0.014);
  tube(headLow, front, 0.016, "#9e3220");
  tube(head, bars, 0.016, "#333333");
  b.rod([0.4, 1.2, z - 0.24], [0.4, 1.2, z + 0.24], 0.014, { color: "#222222" });
  b.part(new THREE.BoxGeometry(0.2, 0.04, 0.09), "#2b2118", { at: [seat[0], 1.1, z], name: "saddle" });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.012, 12), "#7a7a7a", {
    at: [bb[0], bb[1], z + 0.04],
    rotation: [90, 0, 0],
    name: "chainring",
  });
  b.rod(bb, [bb[0] + 0.03, bb[1] - 0.13, z + 0.09], 0.014, { color: "#333333" });
  for (const hub of [rear, front]) {
    b.part(new THREE.TorusGeometry(R, 0.02, 6, 16), "#262626", { at: hub, name: "tyre" });
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 6), "#555555", {
      at: hub,
      rotation: [90, 0, 0],
      name: "hub",
    });
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4;
      b.rod(hub, [hub[0] + Math.cos(a) * R, hub[1] + Math.sin(a) * R, z], 0.005, { color: "#d9d9d9" });
    }
  }
}

export default function treehouse() {
  const b = createBuilder({ name: "treehouse", paintSize: 1024 });
  b.joint("root", { at: [0, 0, 0] });

  // Paints: colour as a function of place, so the wood, shingles, grass and leaves each carry their own pattern.
  const bark = grain("#5a3a21", "#825535", { size: 0.08, axis: "y" });
  const grassPaint = mottle("#3e8b2d", "#6cbb47", { size: 0.22 });
  const soilPaint = mottle("#5b3d24", "#7c5532", { size: 0.14 });
  const groundPaint = paint((_p, n) => (n.y > 0.6 ? grassPaint : soilPaint));
  const crownPaint = mottle("#215726", "#3f8636", { size: 0.35 });
  const wallPaint = stripes("#dea56d", "#a86f3e", { size: 0.16, axis: "y", width: 0.12, wobble: 0.1 });
  const gablePaint = stripes("#d49d60", "#93613a", { size: 0.2, axis: "x", width: 0.2 });
  const shingles = scales(["#cc4a2f", "#b93d28", "#dc5c3b"], "#5b1e13", { size: 0.14, width: 0.16 });
  const roofPaint = paint((_p, n) => (n.y > 0.3 ? shingles : gablePaint));
  const deckPaint = grain("#bb8653", "#94613a", { size: 0.05, axis: "x" });
  const pennantPaint = stripes("#f4c542", "#e0503a", { size: 0.13, axis: "y", width: 0.5 });
  const mushroomCap = spots("#c93d2b", ["#fbf3e4"], { size: 0.07, amount: 0.45, seed: 4 });

  const leafMaps = [
    leafTexture("#2b6a29", "#63ab40"),
    leafTexture("#3b8536", "#8fc954"),
    leafTexture("#245a2a", "#4e983b"),
  ];
  const blade = bladeTexture();

  // The round grassy base: a soil drum with a grass top.
  b.lathe([[0, 0], [2.2, 0], [2.36, 0.1], [2.42, 0.26], [2.34, GROUND], [0, GROUND]], {
    color: groundPaint,
    at: [0, 0, 0],
    segments: 20,
    name: "base",
  });

  // The oak: a flared trunk, three roots and limbs running back and up into the crown.
  b.sweep(
    catmull([
      [0, 0.2, 0],
      [0.02, 1.3, 0.03],
      [0, 2.2, 0],
      [0.02, 2.95, 0],
    ]),
    (t) => 0.26 + 0.27 * (1 - t) ** 2,
    { color: bark, sides: 10, name: "trunk" },
  );
  const rootFlare = (a: V, c: V, r: [number, number]) =>
    b.capsule(a, c, r, { color: bark, sides: 8, name: "root" });
  rootFlare([0.1, 0.25, 0.3], [0.95, 0.36, 0.5], [0.16, 0.05]);
  rootFlare([-0.2, 0.25, -0.35], [-0.85, 0.36, -0.7], [0.15, 0.05]);
  rootFlare([0.35, 0.25, -0.3], [0.7, 0.36, -0.95], [0.13, 0.04]);

  const bough = (pts: V[], r0: number, r1: number) =>
    b.sweep(catmull(pts), (t) => r0 + (r1 - r0) * t, { color: bark, sides: 8, name: "bough" });
  bough(
    [
      [0, 2.5, -0.1],
      [-0.45, 2.95, -0.95],
      [-1.05, 3.7, -1.25],
      [-1.75, 4.45, -1.05],
    ],
    0.2,
    0.07,
  );
  bough(
    [
      [0, 2.6, -0.1],
      [0.5, 3.2, -1.0],
      [1.05, 4.0, -1.35],
      [1.7, 4.6, -1.1],
    ],
    0.2,
    0.07,
  );
  bough(
    [
      [0, 2.85, -0.15],
      [0.05, 3.7, -1.2],
      [0.1, 4.6, -1.7],
      [0.05, 5.3, -1.6],
    ],
    0.16,
    0.05,
  );
  // The limb that carries the swing, running out under the deck's front-left corner.
  bough(
    [
      [0, 2.45, 0],
      [-0.6, 2.7, 0.4],
      [-1.0, 2.9, 0.9],
      [-1.6, 3.0, 0.9],
      [-2.2, 3.02, 0.9],
    ],
    0.13,
    0.05,
  );

  // The deck, resting on the trunk and the limbs.
  b.part(new THREE.BoxGeometry(2.4, 0.14, 1.9), deckPaint, {
    at: [HOUSE.x, FLOOR - 0.07, HOUSE.z],
    name: "deck",
  });

  // The cabin: plank walls and a gabled roof of red shingles, its ridge running front to back.
  b.part(new THREE.BoxGeometry(1.7, EAVE - FLOOR, 1.4), wallPaint, {
    at: [HOUSE.x, (FLOOR + EAVE) / 2, HOUSE.z],
    name: "walls",
  });
  b.extrude(
    [
      [-0.95, 0],
      [0.95, 0],
      [0, 0.9],
    ],
    { color: roofPaint, at: [HOUSE.x, EAVE, HOUSE.z], x: [1, 0, 0], y: [0, 1, 0], thickness: 1.4, name: "roof" },
  );

  // The round window in the front gable.
  const eye: V = [HOUSE.x, 4.6, FRONT];
  b.part(new THREE.TorusGeometry(0.2, 0.035, 8, 18), trim, {
    at: [eye[0], eye[1], FRONT + 0.02],
    name: "gable-window-frame",
  });
  b.part(new THREE.CylinderGeometry(0.19, 0.19, 0.03, 14), glow, {
    at: [eye[0], eye[1], FRONT + 0.01],
    rotation: [90, 0, 0],
    name: "gable-window-glass",
  });
  b.part(new THREE.BoxGeometry(0.36, 0.03, 0.03), trim, { at: [eye[0], eye[1], FRONT + 0.03], name: "mullion" });
  b.part(new THREE.BoxGeometry(0.03, 0.36, 0.03), trim, { at: [eye[0], eye[1], FRONT + 0.03], name: "mullion" });

  // A lit window on the side wall.
  b.part(new THREE.BoxGeometry(0.05, 0.5, 0.5), trim, { at: [SIDE - 0.01, 3.9, HOUSE.z], name: "side-frame" });
  b.part(new THREE.BoxGeometry(0.03, 0.4, 0.4), glow, { at: [SIDE - 0.04, 3.9, HOUSE.z], name: "side-glass" });

  // The door, with a brass knob.
  b.part(new THREE.BoxGeometry(0.42, 0.84, 0.05), timber, { at: [-0.12, FLOOR + 0.42, FRONT], name: "door" });
  b.part(new THREE.SphereGeometry(0.028, 8, 6), "#e8b84c", {
    at: [-0.02, FLOOR + 0.42, FRONT + 0.03],
    name: "knob",
  });

  // A lantern on a post beside the door.
  const lamp: V = [0.36, FLOOR, FRONT + 0.12];
  b.rod(lamp, [lamp[0], FLOOR + 0.5, lamp[2]], 0.02, { color: timber });
  b.part(new THREE.CylinderGeometry(0.1, 0.075, 0.2, 7), glow, {
    at: [lamp[0], FLOOR + 0.6, lamp[2]],
    name: "lantern",
  });
  b.part(new THREE.ConeGeometry(0.13, 0.09, 7), timber, {
    at: [lamp[0], FLOOR + 0.745, lamp[2]],
    name: "lantern-cap",
  });

  // A rope ladder hanging from the deck's front edge to the grass.
  const ladderZ = HOUSE.z + 0.92;
  for (const x of [1.1, 1.36]) b.rod([x, FLOOR - 0.12, ladderZ], [x, GROUND + 0.02, ladderZ], 0.018, { color: rope });
  for (const y of [2.6, 2.3, 2.0, 1.7, 1.4, 1.1, 0.8])
    b.rod([1.1, y, ladderZ], [1.36, y, ladderZ], 0.02, { color: timber });

  // A wooden swing hanging from the low limb.
  const seatY = 1.72;
  b.part(new THREE.BoxGeometry(0.52, 0.035, 0.22), "#b57a44", { at: [-1.25, seatY, 0.9], name: "swing-seat" });
  b.rod([-1.46, 2.95, 0.9], [-1.46, seatY + 0.02, 0.9], 0.016, { color: rope });
  b.rod([-1.04, 2.95, 0.9], [-1.04, seatY + 0.02, 0.9], 0.016, { color: rope });

  // The pennant on a pole at the ridge.
  b.rod([HOUSE.x, 5.2, HOUSE.z], [HOUSE.x, 6.05, HOUSE.z], 0.02, { color: timber });
  b.slab(
    [
      [HOUSE.x, 6.02, HOUSE.z],
      [HOUSE.x + 0.67, 5.93, HOUSE.z],
      [HOUSE.x, 5.8, HOUSE.z],
    ],
    { color: pennantPaint, thickness: 0.012, name: "pennant" },
  );

  // The oak's crown: lumpy painted blobs, wrapped round the cabin.
  const crown: Array<[number, number, number, number]> = [
    [-0.6, 5.5, -0.9, 1.1],
    [-1.75, 4.5, -0.9, 1.05],
    [1.7, 4.7, -1.1, 1.0],
    [-1.1, 4.2, 0.9, 0.85],
    [1.55, 4.15, 0.55, 0.8],
    [0.2, 6.0, -0.7, 0.9],
    [0.45, 4.9, -2.0, 0.9],
  ];
  for (const [x, y, z, r] of crown)
    b.part(new THREE.SphereGeometry(r, 12, 9), crownPaint, { at: [x, y, z], name: "crown" });

  // Leaves: cards scattered over the crown, kept out of the cabin and roof.
  const blocked = (p: number[]) => {
    const [x, y, z] = p;
    if (x > SIDE - 0.2 && x < HOUSE.x + 1.0 && y > FLOOR - 0.1 && y < EAVE + 0.05 && z > HOUSE.z - 0.8 && z < FRONT + 0.12)
      return true;
    const up = y - EAVE;
    return (
      up > 0 && up < 0.95 && Math.abs(z - HOUSE.z) < 0.8 && Math.abs(x - HOUSE.x) < 0.95 * (1 - up / 0.9) + 0.05
    );
  };
  const dice = rng(7);
  const onSphere = (): V => {
    const u = dice() * 2 - 1;
    const a = dice() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    return [s * Math.cos(a), u, s * Math.sin(a)];
  };
  const leaves: ReturnType<typeof frame>[] = [];
  for (const [x, y, z, r] of crown)
    for (let i = Math.round(60 * r * r); i > 0; i--) {
      const d = onSphere();
      if (d[1] < -0.45) continue;
      const p: V = [x + d[0] * r * 0.96, y + d[1] * r * 0.96, z + d[2] * r * 0.96];
      if (!blocked(p)) leaves.push(frame(p, d));
    }
  b.cards(leaves, leafMaps, {
    size: [0.34, 0.42],
    lean: 35,
    flow: () => [0, -1, 0],
    cross: true,
    vary: 0.3,
    spin: 60,
    rng: rng(12),
    name: "leaves",
  });

  // Mushrooms at the foot of the oak.
  const mushroom = (x: number, z: number, s: number) => {
    b.part(new THREE.CylinderGeometry(0.035 * s, 0.045 * s, 0.12 * s, 7), "#f1e5cc", {
      at: [x, GROUND + 0.06 * s, z],
      name: "stem",
    });
    b.part(new THREE.SphereGeometry(0.11 * s, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), mushroomCap, {
      at: [x, GROUND + 0.12 * s, z],
      name: "cap",
    });
  };
  mushroom(-0.95, 0.5, 1);
  mushroom(-0.75, 0.86, 0.8);
  mushroom(-1.13, 0.78, 0.62);

  // A few rocks on the grass.
  b.part(new THREE.IcosahedronGeometry(0.22, 0), "#8c9096", {
    at: [1.85, GROUND + 0.02, -1.25],
    scale: [1.2, 0.75, 1],
    flat: true,
    name: "rock",
  });
  b.part(new THREE.IcosahedronGeometry(0.18, 0), "#7d8187", {
    at: [-1.95, GROUND + 0.01, -0.2],
    scale: [1, 0.7, 1.1],
    flat: true,
    name: "rock",
  });
  b.part(new THREE.IcosahedronGeometry(0.13, 0), "#9a9ea4", {
    at: [-1.0, GROUND + 0.01, -1.6],
    scale: [1.1, 0.7, 1],
    flat: true,
    name: "rock",
  });

  // The bicycle, leaning in at the foot of the tree.
  bicycle(b, HOUSE.z + 1.05);

  // Grass: blade cards over the disc.
  const tuft = rng(21);
  const blades: ReturnType<typeof frame>[] = [];
  const flows: V[] = [];
  for (let i = 0; i < 260; i++) {
    const a = tuft() * Math.PI * 2;
    const r = 0.6 + 1.6 * Math.sqrt(tuft());
    blades.push(frame([Math.cos(a) * r, GROUND, Math.sin(a) * r], [0, 1, 0]));
    flows.push([tuft() * 2 - 1, 0, tuft() * 2 - 1]);
  }
  b.cards(blades, blade, {
    size: [0.075, 0.28],
    lean: 14,
    bend: 22,
    flow: (_f, i) => flows[i],
    vary: 0.3,
    spin: 45,
    rng: rng(5),
    name: "grass",
  });

  return b.root;
}
