import * as THREE from "three";
import {
  bezier,
  catmull,
  createBuilder,
  frame,
  limb,
  noise,
  offset,
  paint,
  polyline,
  rng,
  svg,
} from "../../../../src/index";
import { animeEye, cel, furEdge, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dendro Red Panda on a Mossy Stone",
  description:
    "A Genshin-style cel-shaded red panda with anime eyes, a Dendro Vision, a teal scarf and a ringed, bushy tail, balancing on a mossy boulder. The stage is a carved platform with glowing rune ring, mushrooms, sweet flowers and floating Dendro motes.",
};

type T3 = [number, number, number];
type Outline = ([number, number] | [number, number, "sharp"])[];

const T = (v: THREE.Vector3): T3 => [v.x, v.y, v.z];

// ---------------------------------------------------------------- palette
const C = {
  orange: "#f56a2b",
  rust: "#d9511f",
  cream: "#fff1d6",
  creamSh: "#f1cdb0",
  dark: "#4b2a25",
  nose: "#2b1731",
  gold: "#f3c64f",
  teal: "#2fb8a2",
  leather: "#7a4630",
  stem: "#4fae45",
  petal: "#fff6f0",
  yolk: "#ffd23f",
  capGlow: "#7ef5c4",
  capSpot: "#e9fff4",
  mote: "#9dff8a",
  moteB: "#6df0d0",
  gem: "#8dffb0",
  platform: "#6c7f78",
  platformDk: "#54665f",
  pebble: "#8a9a95",
};

// ---------------------------------------------------------------- paints
const ORANGE_P = cel(C.orange);
const CREAM_P = cel(C.cream, C.creamSh);
const MUZZLE_P = cel("#fffaf0", "#f4dcc6");
const DARK_P = cel(C.dark);
const NOSE_P = cel(C.nose, INK);
const SCARF_P = cel(C.teal);
const LEATHER_P = cel(C.leather);
const BODY_P = cel(furEdge(C.orange, C.dark, { level: -0.15, teeth: 0.28, period: 0.04, along: [0, 0, 1] }));
const TAIL_P = cel(
  paint((_p, _n, s) => (s[0] > 0.93 ? "#5a2c36" : Math.floor(s[0] * 11) % 2 ? C.rust : C.orange)),
);
const MOSS_P = cel(paint((p) => (noise(p, 0.05, 2) > 0.5 ? "#8fdc45" : "#58ad3a")));
const STONE_P = cel(
  paint((p, n) => {
    const m = (noise(p, 0.12, 3) - 0.5) * 0.9 + n.y;
    if (m > 0.55) return noise(p, 0.05, 8) > 0.58 ? "#a6e655" : noise(p, 0.07, 9) > 0.45 ? "#7fd13f" : "#5faa3a";
    if (p.y < 0.12) return "#5f7a70";
    return noise(p, 0.08, 4) > 0.6 ? "#a7b3ad" : "#8c9a96";
  }),
);

// ---------------------------------------------------------------- textures
const EYE = animeEye({ iris: "#2bd48a", brow: false });

const TEAR = svg(
  `<svg viewBox="0 0 20 60"><path d="M10 0 C15 14 11 36 5 60 C1 40 3 16 10 0Z" fill="#d4562a"/></svg>`,
  { size: 128 },
);
const BROW = svg(`<svg viewBox="0 0 40 24"><ellipse cx="20" cy="12" rx="19" ry="10" fill="#fff6e0"/></svg>`, { size: 128 });
const MOUTH = svg(
  `<svg viewBox="0 0 40 22"><path d="M20 0 L20 8 M20 8 Q14 17 6 11 M20 8 Q26 17 34 11" stroke="#22112f" stroke-width="2.6" stroke-linecap="round" fill="none"/></svg>`,
  { size: 256 },
);
const TUFT = svg(
  `<svg viewBox="0 0 32 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#c4c4c4"/></linearGradient></defs><path d="M16 64 C8 46 6 26 10 4 C16 18 18 34 20 44 C22 30 26 20 30 10 C32 30 26 50 16 64Z" fill="url(#g)"/></svg>`,
  { size: 128 },
);
const GRASS = svg(
  `<svg viewBox="0 0 48 64"><path d="M24 64 C22 40 18 24 8 2 C22 16 29 40 31 64Z" fill="#5fbf3f"/><path d="M20 64 C26 44 34 28 44 12 C40 34 34 50 30 64Z" fill="#8ae04e"/><path d="M14 64 C12 48 8 38 2 28 C12 36 18 48 20 64Z" fill="#3f9c3a"/></svg>`,
  { size: 128 },
);
const LEAF = svg(
  `<svg viewBox="0 0 40 64"><path d="M20 2 C36 16 36 46 20 62 C4 46 4 16 20 2Z" fill="#9cf07a"/><path d="M20 10 L20 58 M20 26 L29 18 M20 36 L11 28 M20 44 L29 36" stroke="#e8ffc8" stroke-width="2.5" stroke-linecap="round" fill="none"/></svg>`,
  { size: 160 },
);
const RUNE = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="#b6ff8a" stroke-width="3.2"/><circle cx="50" cy="50" r="36" fill="none" stroke="#7df0b8" stroke-width="2"/><path d="M50 22 C64 36 64 58 50 76 C36 58 36 36 50 22Z" fill="none" stroke="#b6ff8a" stroke-width="3.2" stroke-linejoin="round"/><path d="M50 30 L50 70 M50 46 L58 38 M50 56 L42 48" stroke="#b6ff8a" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M50 3 L54 9 L50 15 L46 9Z M50 97 L54 91 L50 85 L46 91Z M3 50 L9 46 L15 50 L9 54Z M97 50 L91 46 L85 50 L91 54Z" fill="#b6ff8a"/></svg>`,
  { size: 256 },
);
const RING = (() => {
  let g = "";
  for (let i = 0; i < 16; i++) {
    const a = i * 22.5;
    g +=
      i % 2 === 0
        ? `<g transform="rotate(${a} 100 100)"><path d="M100 8 C107 14 107 22 100 28 C93 22 93 14 100 8Z" fill="none" stroke="#b6ff8a" stroke-width="1.6" stroke-linejoin="round"/><path d="M100 12 L100 24" stroke="#b6ff8a" stroke-width="1.4"/></g>`
        : `<g transform="rotate(${a} 100 100)"><path d="M100 11 L105 18 L100 25 L95 18Z" fill="#7df0b8"/></g>`;
  }
  return svg(
    `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="95" fill="none" stroke="#b6ff8a" stroke-width="1.6"/><circle cx="100" cy="100" r="71" fill="none" stroke="#b6ff8a" stroke-width="1.6"/>${g}</svg>`,
    { size: 1024 },
  );
})();

// ---------------------------------------------------------------- shape helpers
const leafOutline = (L: number, W: number): Outline => [
  [0, 0],
  [L * 0.32, W],
  [L, 0, "sharp"],
  [L * 0.32, -W],
];
const scaled = (o: Outline, k: number): Outline => o.map((p) => (p.length === 3 ? [p[0] * k, p[1] * k, "sharp"] : [p[0] * k, p[1] * k]) as Outline[number]);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "red_panda" });
  const R = rng(7);

  const ST = 0.3; // stone top
  const FOOT = ST + 0.03; // paw centre height

  // ================================================================= skeleton
  const hips = b.joint("hips", { at: [0, 0.62, -0.2], aim: [0, 0.62, -0.05], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.62, -0.05], [0, 0.635, 0.08], [0, 0.645, 0.2]]), { parent: hips, role: "spine" });
  const chest = spine.joints[1];
  const neck = b.chain("neck", polyline([[0, 0.645, 0.2], [0, 0.69, 0.33]]), { parent: spine, names: ["neck"], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.69, 0.33], dir: [0, 0.08, 1], role: "head" });
  const HC: T3 = [0, 0.71, 0.42];
  const H = (x: number, y: number, z: number): T3 => [HC[0] + x, HC[1] + y, HC[2] + z];
  const jaw = b.joint("jaw", { parent: head, at: H(0, -0.05, 0.02), aim: H(0, -0.065, 0.12), role: "jaw" });

  const tailPts: T3[] = [
    [0, 0.62, -0.26],
    [0, 0.64, -0.45],
    [0, 0.72, -0.62],
    [0, 0.89, -0.7],
    [0, 1.06, -0.66],
    [0, 1.16, -0.55],
  ];
  const tailChain = b.chain("tail", catmull(tailPts), { parent: hips, role: "tail" });

  const blade = (outline: Outline, at: T3, dir: T3, up: T3, thick: number, color: any, bone: any) => {
    const x = new THREE.Vector3(...dir).normalize();
    const u = new THREE.Vector3(...up);
    const y = u.sub(x.clone().multiplyScalar(u.dot(x))).normalize();
    return b.extrude(outline, { at, x: T(x), y: T(y), thickness: thick, bevel: thick * 0.3, smoothing: 1, color, bone });
  };

  // ================================================================= body
  const body = b.loft(
    [
      { at: [0, 0.58, -0.27], w: 0.2, h: 0.2 },
      { at: [0, 0.61, -0.16], w: 0.29, h: 0.28 },
      { at: [0, 0.62, 0.0], w: 0.3, h: 0.28 },
      { at: [0, 0.63, 0.15], w: 0.29, h: 0.28 },
      { at: [0, 0.64, 0.26], w: 0.22, h: 0.22 },
    ],
    { bone: [hips, spine, neck], color: BODY_P },
  );
  const bodySurf = b.surface(body);
  b.capsule([0, 0.64, 0.2], [0, 0.69, 0.34], 0.105, { color: ORANGE_P, bone: neck });

  // ================================================================= tail
  const tail = b.sweep(
    tailChain,
    (t) => 0.045 + 0.055 * Math.sin(Math.PI * Math.pow(t, 0.7)) - 0.02 * t * t * t,
    { color: TAIL_P },
  );
  const tailHits = b.surface(tail).scatter(70, { rng: R, minDist: 0.035, filter: (h) => h.at.y > 0.62 || h.n.y > 0 });
  b.cards(tailHits, TUFT, { size: [0.036, 0.05], lean: 72, bend: 25, vary: 0.25, rng: R, color: "#ff9444" });

  // ================================================================= legs
  const wristlet = (a: THREE.Vector3, c: THREE.Vector3, k: number, bone: any) => {
    const pos = a.clone().lerp(c, k);
    b.part(new THREE.TorusGeometry(0.04, 0.007, 5, 10), C.gold, { bone, at: T(pos), dir: T(c.clone().sub(a)), axis: "z" });
  };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // front
    const fFoot: T3 = s < 0 ? [s * 0.1, FOOT + 0.1, 0.3] : [s * 0.105, FOOT, 0.2];
    const fPts = limb([s * 0.095, 0.56, 0.17], fFoot, [0.13, 0.13], [[0, 0, -1]]);
    const fl = b.chain(`foreleg${side}`, fPts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    b.sweep(fl, [0.055, 0.045, 0.037], { color: DARK_P });
    wristlet(fPts[1], fPts[2], 0.84, fl.joints[1]);
    // hind
    const hPts = limb([s * 0.1, 0.56, -0.17], [s * 0.11, FOOT, -0.2], [0.11, 0.11, 0.08], [[0, 0, 1], [0, 0, -1]]);
    const hl = b.chain(`hindleg${side}`, hPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
      role: "leg",
    });
    b.sweep(hl, [0.075, 0.055, 0.042, 0.037], { color: DARK_P });
    wristlet(hPts[2], hPts[3], 0.7, hl.joints[2]);

    // paws
    const paws: [any, T3, number, number][] = [
      [fl.tip!, fFoot, 0.058, 0.04],
      [hl.tip!, [s * 0.11, FOOT, -0.2], 0.07, 0.042],
    ];
    for (const [tip, p, len, wid] of paws) {
      b.part(new THREE.SphereGeometry(1, 8, 6), DARK_P, {
        bone: tip,
        at: [p[0], p[1] - 0.002, p[2] + len * 0.45],
        scale: [wid, 0.029, len],
      });
      for (const k of [-1, 0, 1]) {
        b.part(new THREE.SphereGeometry(1, 6, 4), DARK_P, {
          bone: tip,
          at: [p[0] + k * wid * 0.5, p[1] - 0.004, p[2] + len * 1.05],
          scale: [0.018, 0.015, 0.02],
        });
        b.part(new THREE.ConeGeometry(0.006, 0.022, 5), C.cream, {
          bone: tip,
          at: [p[0] + k * wid * 0.55, p[1] - 0.01, p[2] + len * 1.3],
          dir: [k * 0.12, -0.3, 1],
        });
      }
    }
  }

  // ================================================================= head
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), cel(
    paint((p, n) => {
      const cutoff = HC[1] + 0.03 + 0.022 * zigzag(p.x / 0.026);
      return n.z < -0.25 || p.y > cutoff ? C.orange : C.cream;
    }),
    C.creamSh,
  ), { bone: head, at: HC, scale: [0.135, 0.11, 0.118] });
  // the cel above would shade cream with its shadow; orange parts get their own hue shift via cel's default? keep skull readable
  const skin = b.surface(skull);

  // muzzle, nose, jaws
  const muzzle = b.part(new THREE.SphereGeometry(1, 10, 8), MUZZLE_P, { bone: head, at: H(0, -0.04, 0.1), scale: [0.066, 0.047, 0.058] });
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE_P, { bone: head, at: H(0, -0.017, 0.152), scale: [0.024, 0.017, 0.017] });
  b.part(new THREE.SphereGeometry(1, 8, 6), MUZZLE_P, { bone: jaw, at: H(0, -0.094, 0.1), scale: [0.046, 0.022, 0.05] });
  b.decal(b.surface(muzzle), MOUTH, { at: H(0, -0.058, 0.15), dir: [0, 0, 1], size: [0.045, 0.025] });

  // eyes and face markings
  for (const s of [1, -1]) {
    const eye = skin.around(HC).at(s * 38, 2);
    if (eye) b.decal(skin, EYE, { at: eye, size: [0.06, 0.082], mirror: s > 0 });
    const tear = skin.around(HC).at(s * 27, -26);
    if (tear) b.decal(skin, TEAR, { at: tear, size: [0.022, 0.052], roll: s * 8 });
    const brow = skin.around(HC).at(s * 36, 31);
    if (brow) b.decal(skin, BROW, { at: brow, size: [0.042, 0.025], roll: -s * 22 });
  }

  // ears
  const EAR: Outline = [[-0.06, 0], [0.06, 0], [0.069, 0.046], [0, 0.106], [-0.069, 0.046]];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const a = (25 * Math.PI) / 180;
    const x: T3 = [Math.cos(a), -s * Math.sin(a), 0];
    const y: T3 = [s * Math.sin(a), Math.cos(a), 0.15];
    const earJ = b.joint(`ear${side}`, { parent: head, at: H(s * 0.088, 0.07, 0), dir: [s * 0.4, 1, 0.1], role: "hinge" });
    const ear = b.extrude(EAR, { at: H(s * 0.088, 0.07, 0), x, y, thickness: 0.028, bevel: 0.008, smoothing: 2, color: ORANGE_P, bone: earJ });
    b.extrude(scaled(EAR, 0.62), { at: ear.local([0, 0.008, 0.014]), x, y, thickness: 0.02, bevel: 0.006, smoothing: 2, color: CREAM_P, bone: earJ });
    // cheek ruff blades
    const specs: { at: T3; dir: T3; L: number }[] = [
      { at: H(s * 0.112, -0.012, 0.03), dir: [s * 0.45, 0.0, -0.9], L: 0.05 },
      { at: H(s * 0.108, -0.046, 0.015), dir: [s * 0.4, -0.25, -0.85], L: 0.055 },
      { at: H(s * 0.092, -0.078, 0.01), dir: [s * 0.3, -0.5, -0.8], L: 0.05 },
    ];
    for (const sp of specs) blade(leafOutline(sp.L, 0.03), sp.at, sp.dir, [0, 1, 0], 0.014, CREAM_P, head);
  }
  // forehead tufts
  for (const k of [-1, 0, 1])
    blade(leafOutline(0.055, 0.02), H(k * 0.035, 0.096, 0.04), [k * 0.4, 1, -0.3], [1, 0, 0], 0.012, ORANGE_P, head);

  // ================================================================= scarf, belt, Vision
  const scarfRing = b.ring(frame([0, 0.675, 0.285], [0, 0.08, 1]), { count: 12, radius: 0.115 }).items;
  b.sweep(catmull(scarfRing, { closed: true }), 0.026, { color: SCARF_P, bone: neck, sides: 8 });
  for (const dz of [-0.024, 0.024]) {
    const trimRing = b.ring(frame([0, 0.675 + dz * 0.08, 0.285 + dz], [0, 0.08, 1]), { count: 12, radius: 0.13 }).items;
    b.sweep(catmull(trimRing, { closed: true }), 0.006, { color: C.gold, bone: neck, sides: 6 });
  }
  const K = new THREE.Vector3(...T(new THREE.Vector3().copy(scarfRing[0].at as any)));
  b.part(new THREE.SphereGeometry(1, 8, 6), SCARF_P, { bone: chest, at: T(K), scale: [0.036, 0.03, 0.04] });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 8), C.gold, { bone: chest, at: T(K.clone().add(new THREE.Vector3(0, 0.022, 0.02))), dir: [0, 0.6, 1] });
  for (const s of [1, -1]) {
    const kp = (dx: number, dy: number, dz: number): T3 => [K.x + dx, K.y + dy, K.z + dz];
    const rib = bezier(kp(0, 0, 0), kp(s * 0.04, 0.035, -0.06), kp(s * 0.1, 0.0, -0.14), kp(s * 0.15, -0.1, -0.26));
    b.sweep(rib, (t) => [0.03 * (1 - 0.25 * t), 0.0045], {
      section: "box",
      caps: "flat",
      up: [0, 1, 0],
      bone: chest,
      bands: [[0.84, SCARF_P], [0.89, C.gold], [1, SCARF_P]],
    });
    const end = rib.at(1);
    b.spike(T(new THREE.Vector3().copy(end as any)), [0, -1, -0.5], 0.05, 0.014, { color: C.gold, bone: chest });
  }
  // belt
  const beltLoop = bodySurf.loop(frame([0, 0.62, -0.02], [0, 0, 1]), { lift: 0.008 });
  b.sweep(beltLoop, 0.014, { color: LEATHER_P });
  b.along(beltLoop, 10, (at) => b.part(new THREE.SphereGeometry(0.009, 6, 4), C.gold, { at }));
  const bk = new THREE.Vector3().copy(beltLoop.at(0) as any);
  b.part(new THREE.BoxGeometry(0.05, 0.014, 0.04), C.gold, { bone: chest, at: T(bk.clone().add(new THREE.Vector3(0, 0.008, 0))) });
  // Dendro Vision
  const vh = bodySurf.nearest([0.3, 0.57, -0.02]);
  const VP = offset(vh, vh, 0.006);
  const VFRAME: Outline = [[0, -0.052, "sharp"], [0.03, -0.01], [0.026, 0.03], [0, 0.05], [-0.026, 0.03], [-0.03, -0.01]];
  b.extrude(VFRAME, { at: T(VP), x: [0, 0, 1], y: [0, 1, 0], thickness: 0.016, bevel: 0.004, smoothing: 1, color: C.gold, bone: hips });
  glow(
    b.part(new THREE.OctahedronGeometry(0.028, 0), C.gem, {
      bone: hips,
      at: [VP.x + 0.01, VP.y - 0.004, VP.z],
      scale: [0.4, 1.3, 0.9],
    }),
    1.6,
  );
  b.part(new THREE.TorusGeometry(0.012, 0.004, 5, 10), C.gold, { bone: hips, at: [VP.x, VP.y + 0.056, VP.z], dir: [1, 0, 0], axis: "z" });

  // body fur tufts
  const bodyHits = bodySurf.scatter(70, { rng: R, minDist: 0.045, filter: (h) => h.n.y > 0.3 && Math.abs(h.at.z - 0.215) > 0.04 && Math.abs(h.at.z + 0.02) > 0.03 });
  b.cards(bodyHits, TUFT, { size: [0.035, 0.055], lean: 70, bend: 20, vary: 0.3, rng: R, color: C.orange });

  // ================================================================= stage
  const root = hips;
  b.lathe([[0, 0], [0.64, 0], [0.665, 0.012], [0.665, 0.034], [0.625, 0.05], [0, 0.05]], {
    at: [0, 0, 0],
    segments: 24,
    color: C.platform,
    bone: root,
  });
  b.lathe([[0.5, 0.0], [0.64, 0.0], [0.665, 0.012], [0.665, 0.02], [0.5, 0.02]], { at: [0, 0, 0], segments: 24, color: C.platformDk, bone: root });
  b.part(new THREE.TorusGeometry(0.6, 0.007, 5, 48), C.gold, { bone: root, at: [0, 0.05, 0], rotation: [90, 0, 0] });
  b.part(new THREE.TorusGeometry(0.664, 0.006, 5, 48), C.gold, { bone: root, at: [0, 0.026, 0], rotation: [90, 0, 0] });
  glow(
    b.part(new THREE.PlaneGeometry(1.2, 1.2), "#ffffff", { bone: root, at: [0, 0.054, 0], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: RING }),
    1,
  );

  // boulder
  const boulder = b.lathe(
    [[0, 0.04], [0.38, 0.04], [0.415, 0.11], [0.385, 0.2], [0.35, 0.272], [0.305, 0.3], [0, 0.3]],
    { at: [0, 0, 0], segments: 9, spin: 12, color: STONE_P, bone: root },
  );
  const bSurf = b.surface(boulder);
  for (const az of [0, 58, -58]) {
    const h = bSurf.around([0, 0.17, 0]).at(az, 0);
    if (h) glow(b.decal(bSurf, RUNE, { at: h, size: [0.14, 0.14], roll: az * 0.3 }), 1);
  }
  // moss blobs
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + R() * 0.3;
    const r = 0.345 + R() * 0.02;
    const sz = 0.022 + R() * 0.012;
    b.part(new THREE.SphereGeometry(1, 7, 5), MOSS_P, { bone: root, at: [Math.sin(a) * r, 0.272, Math.cos(a) * r], scale: [sz, sz * 0.6, sz], flat: true });
  }
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + R() * 0.5;
    const sz = 0.04 + R() * 0.02;
    b.part(new THREE.SphereGeometry(1, 7, 5), MOSS_P, { bone: root, at: [Math.sin(a) * 0.4, 0.13 + R() * 0.05, Math.cos(a) * 0.4], scale: [sz, sz * 0.7, sz], flat: true });
  }
  for (const [x, z, r] of [[0, 0.28, 0.04], [0.24, -0.12, 0.045], [-0.24, 0.0, 0.04], [-0.16, -0.24, 0.035]] as T3[])
    b.part(new THREE.SphereGeometry(1, 7, 5), MOSS_P, { bone: root, at: [x, 0.3, z], scale: [r, r * 0.5, r], flat: true });
  // grass clumps on the stone rim and on the platform
  const clumps: T3[] = [];
  for (const [r, ang] of [[0.29, 0.9], [0.29, -0.9], [0.29, 2.2], [0.29, -2.4], [0.3, 3.1]] as T3[])
    clumps.push([Math.sin(ang) * r, 0.298, Math.cos(ang) * r]);
  for (const ang of [0.5, 1.2, 2.0, 2.7, -0.4, -1.3, -2.1])
    clumps.push([Math.sin(ang) * 0.52, 0.05, Math.cos(ang) * 0.52]);
  b.cards(clumps.map((p) => frame(p, [0, 1, 0])), GRASS, { size: [0.08, 0.09], cross: true, vary: 0.3, rng: R, bone: root });

  // pebbles
  for (const [x, z, s, h] of [[0.5, -0.3, 0.11, 0.07], [-0.48, 0.22, 0.09, 0.06], [0.14, 0.52, 0.07, 0.045], [-0.3, -0.45, 0.08, 0.05]] as T3[]) {
    b.part(new THREE.IcosahedronGeometry(1, 0), R() > 0.5 ? STONE_P : C.pebble, {
      bone: root,
      at: [x, 0.05 + h * 0.4, z],
      scale: [s, h, s * 0.9],
      rotation: [R() * 20, R() * 90, R() * 20],
      flat: true,
    });
    b.part(new THREE.SphereGeometry(1, 6, 4), MOSS_P, { bone: root, at: [x, 0.05 + h * 0.9, z], scale: [s * 0.7, h * 0.35, s * 0.7], flat: true });
  }

  // glowing mushrooms
  const mushroom = (x: number, z: number, k: number) => {
    b.part(new THREE.CylinderGeometry(0.009 * k, 0.012 * k, 0.05 * k, 6), C.cream, { bone: root, at: [x, 0.05 + 0.025 * k, z] });
    glow(
      b.lathe([[0, 0], [0.034 * k, 0], [0.04 * k, 0.008 * k], [0.028 * k, 0.028 * k], [0, 0.038 * k]], {
        at: [x, 0.05 + 0.048 * k, z],
        segments: 8,
        color: C.capGlow,
        bone: root,
      }),
      1.2,
    );
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1 + x * 40;
      b.part(new THREE.SphereGeometry(0.005 * k, 5, 4), C.capSpot, {
        bone: root,
        at: [x + Math.sin(a) * 0.02 * k, 0.05 + 0.048 * k + 0.027 * k, z + Math.cos(a) * 0.02 * k],
      });
    }
  };
  mushroom(0.46, 0.2, 1.3);
  mushroom(0.5, 0.12, 0.8);
  mushroom(-0.44, -0.1, 1.1);
  mushroom(-0.5, 0.0, 0.7);

  // sweet flowers
  const flower = (x: number, z: number, h: number) => {
    b.sweep(catmull([[x, 0.05, z], [x + 0.012, 0.05 + h * 0.5, z], [x, 0.05 + h, z]]), 0.003, { color: C.stem, bone: root });
    const top: T3 = [x, 0.05 + h, z];
    b.ring(frame(top, [0, 1, 0]), { count: 5, radius: 0.006, tilt: 25 }, (item) =>
      b.stick(new THREE.SphereGeometry(1, 6, 4), C.petal, item, { bone: root, scale: [0.009, 0.017, 0.004] }),
    );
    b.part(new THREE.SphereGeometry(0.006, 6, 4), C.yolk, { bone: root, at: [x, top[1] + 0.003, z] });
  };
  flower(-0.36, 0.38, 0.07);
  flower(0.3, 0.42, 0.06);
  flower(-0.2, 0.5, 0.05);

  // floating Dendro motes and leaves
  const leafPts: T3[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (R() - 0.5) * 4.4;
    const r = 0.58 + R() * 0.25;
    const y = 0.4 + R() * 0.8;
    glow(
      b.part(new THREE.OctahedronGeometry(0.012 + R() * 0.012, 0), i % 3 ? C.mote : C.moteB, {
        bone: root,
        at: [Math.sin(a) * r, y, Math.cos(a) * r],
        rotation: [R() * 90, R() * 90, 0],
      }),
      1.4,
    );
    if (i % 4 === 0) leafPts.push([Math.sin(a + 0.3) * (r + 0.05), y + 0.05, Math.cos(a + 0.3) * (r + 0.05)]);
  }
  glow(
    b.cards(leafPts.map((p) => frame(p, [R() - 0.5, 1, R() - 0.5])), LEAF, {
      size: [0.05, 0.08],
      lean: 30,
      vary: 0.2,
      rng: R,
      bone: root,
    }),
    0.8,
  );

  return b.root;
}
