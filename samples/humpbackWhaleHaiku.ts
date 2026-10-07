import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { cells, noise, paint } from "../src/paint";
import { svg } from "../src/texture";
import { animeEye, cel, INK, zigzag } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Humpback Whale",
  description:
    "A 14 m humpback whale gliding 0.5 m above the floor in high-fantasy anime style: indigo back dusted with gold stars and a dashed gold flank line, cream cel-shaded belly with throat pleats, gold filigree decals and bands, anime eyes, a gold-trimmed fluke and dorsal fin, and a silk ribbon trailing from the fin with teal glowing gems.",
  style: "high-fantasy anime",
  commit: "b816db2",
};

// A cel paint is two colours per region: [lit, shadow]. The shadow is set by hand, so
// the shadow of cream stays rose and the shadow of indigo stays violet (not muddy brown).
type Pair = readonly [string, string];
type Rule = (p: THREE.Vector3, n: THREE.Vector3, s: readonly [number, number]) => Pair;
const toon = (rule: Rule) => cel(paint((p, n, s) => rule(p, n, s)[0]), paint((p, n, s) => rule(p, n, s)[1]));

const INDIGO: Pair = ["#33408a", "#1f2766"];
const CREAM: Pair = ["#fff3dc", "#f0c2cf"];
const ROSE: Pair = ["#f6c9d2", "#dc92ab"];
const GOLD_P: Pair = ["#ffd15a", "#d98a34"];
const STAR: Pair = ["#ffe27a", "#f0a54a"];
const GEM = "#9af6ff";

const BODY = toon((p, _n, s) => {
  // s = [t along the body, dorsal clock deg]; 0 = spine, 180 = belly, 90 and 270 = flanks.
  const deg = (((s[1] % 360) + 360) % 360);
  const fromBelly = Math.abs(deg - 180);
  const edge = 72 + 5 * zigzag(p.z / 0.25); // small zig-zag line between indigo back and cream belly
  if (fromBelly < edge) {
    const pleat = s[0] > 0.42 && s[0] < 0.92 && fromBelly % 9 < 1.9; // ventral throat pleats
    return pleat ? ROSE : CREAM;
  }
  if (Math.abs(deg - 90) < 2.5 || Math.abs(deg - 270) < 2.5) {
    return ((p.z / 0.4) % 1 + 1) % 1 < 0.4 ? GOLD_P : INDIGO; // dashed gold line along each flank
  }
  return cells(p, 0.9, 7).d1 < 0.085 ? STAR : INDIGO; // gold star dots on the back
});
const FLIP = toon((_p, n) => (n.y < -0.3 ? CREAM : INDIGO));
const FLUKE = toon((p, n) => (n.y > -0.2 || noise(p, 0.3, 4) > 0.55 ? INDIGO : CREAM));
const GOLD = cel("#ffd15a", "#d98a34");
const TEAL = cel("#8ff0e6", "#3fb0c4");
const BUMP = cel("#4a66c8", "#2f3f9c");
const JAW = cel("#fff3dc", "#f0c2cf");

const EYE = animeEye({ iris: "#ffb12e" });

const FILIGREE = svg(
  `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <g stroke="${INK}" stroke-width="12">
      <path d="M96 50 C96 26 68 18 56 32 C44 44 52 62 66 60 C76 58 78 48 70 44"/>
      <path d="M104 50 C104 26 132 18 144 32 C156 44 148 62 134 60 C124 58 122 48 130 44"/>
      <path d="M10 50 C4 28 30 12 52 14"/>
      <path d="M190 50 C196 28 170 12 148 14"/>
      <path d="M10 50 C4 72 30 88 52 86"/>
      <path d="M190 50 C196 72 170 88 148 86"/>
    </g>
    <g stroke="#ffd15a" stroke-width="6">
      <path d="M96 50 C96 26 68 18 56 32 C44 44 52 62 66 60 C76 58 78 48 70 44"/>
      <path d="M104 50 C104 26 132 18 144 32 C156 44 148 62 134 60 C124 58 122 48 130 44"/>
      <path d="M10 50 C4 28 30 12 52 14"/>
      <path d="M190 50 C196 28 170 12 148 14"/>
      <path d="M10 50 C4 72 30 88 52 86"/>
      <path d="M190 50 C196 72 170 88 148 86"/>
    </g>
    <circle cx="100" cy="50" r="6" fill="#ffd15a" stroke="${INK}" stroke-width="3"/>
  </g>
</svg>`,
  { size: 512 },
);

// Body stations, tail to snout: centre (x = 0), centre height, full width and height of the section.
// The belly's lowest point sits at y = 0.5 m.
const STATIONS = [
  { at: [0, 2.0, -6.3], w: 0.8, h: 0.9 },
  { at: [0, 2.0, -5.2], w: 1.25, h: 1.4 },
  { at: [0, 2.05, -3.6], w: 2.2, h: 2.6 },
  { at: [0, 2.19, -1.5], w: 2.9, h: 3.25 },
  { at: [0, 2.33, 0.5], w: 3.1, h: 3.4 },
  { at: [0, 2.32, 2.5], w: 3.05, h: 3.3 },
  { at: [0, 2.05, 4.3], w: 2.9, h: 2.8 },
  { at: [0, 1.95, 5.5], w: 2.6, h: 2.3 },
  { at: [0, 1.9, 6.3], w: 1.8, h: 1.7 },
] as const;

// Fluke lobe, drawn for the +X side: origin at the fluke joint, x outward, y toward the snout.
const LOBE: OutlinePoint[] = [
  [0, 0.3],
  [0.95, 0.26],
  [2.0, 0.14],
  [2.8, -0.12],
  [2.95, -1.0, "sharp"],
  [1.9, -0.72],
  [0.95, -0.6],
  [0, -0.42],
];
const LOBE_EDGE: Array<[number, number]> = [
  [2.8, -0.12],
  [2.95, -1.0],
  [1.9, -0.72],
  [0.95, -0.6],
  [0, -0.42],
];

const FIN: OutlinePoint[] = [
  [0, 0],
  [0.7, 0.65],
  [1.25, 1.3, "sharp"],
  [1.55, 0.6],
  [1.8, 0],
];
const FIN_TRAIL: Array<[number, number]> = [
  [1.25, 1.3],
  [1.55, 0.6],
  [1.8, 0],
];

export default function build() {
  const b = createBuilder({ name: "humpbackWhale", paintSize: 2048 });

  // Skeleton: a root at the body's middle, a tail chain back and a chest chain forward.
  const body = catmull(STATIONS.map((s) => s.at));
  const core = b.joint("core", { at: [0, 2.2, 0], role: "spine" });
  const rootT = body.closestT(core.at);
  const back = b.chain("tail", body.slice(rootT, 0), {
    parent: core,
    count: 3,
    names: ["tailA", "tailB", "tailC", "tailTip"],
    role: "tail",
  });
  const front = b.chain("chest", body.slice(rootT, 1), {
    parent: core,
    count: 3,
    names: ["chestA", "chestB", "chestC", "head"],
    role: "spine",
  });
  const headJ = front.tip ?? front.joints[front.joints.length - 1];
  const tailJ = back.tip ?? back.joints[back.joints.length - 1];

  // Body: one tube skinned over the tail, core and chest bones.
  const hull = b.loft(
    STATIONS.map((s) => ({ at: s.at, w: s.w, h: s.h })),
    {
      bone: [back, core, front],
      color: BODY,
      sides: 12,
      caps: { start: "flat", end: "round" },
    },
  );
  const skin = b.surface(hull);

  // Gold bands round the body.
  b.sweep(skin.loop([0, 2.2, -0.8], { dir: [0, 0, 1], lift: 0.02 }), 0.05, { color: GOLD });
  b.sweep(skin.loop([0, 2.0, -5.4], { dir: [0, 0, 1], lift: 0.02 }), 0.06, { color: GOLD });

  // Jaw: a lower jaw on its own joint, opened a little at rest.
  const jaw = b.joint("jaw", { parent: front.jointAt(0.8), at: [0, 1.6, 4.3], aim: [0, 1.35, 6.2], role: "jaw" });
  b.frustumBox([0, 1.6, 4.3], [0, 1.3, 6.0], [1.6, 0.5], [0.9, 0.26], { bone: jaw, color: JAW, caps: "flat" });

  // Mouth line along the head, from each corner round to the snout tip.
  for (const s of [1, -1]) {
    const pts = [
      [1.45, 2.0, 4.4],
      [1.3, 1.75, 5.3],
      [0.85, 1.5, 6.1],
      [0.2, 1.35, 6.6],
    ].map(([x, y, z]) => skin.nearest([s * x, y, z]).at);
    b.sweep(catmull(pts), 0.035, { color: INK, bone: headJ });
  }

  // Blowholes and a glowing forehead gem.
  const blowGeo = new THREE.SphereGeometry(0.1, 8, 5).scale(1, 0.35, 1.5);
  for (const s of [1, -1]) b.stick(blowGeo, INK, skin.nearest([s * 0.3, 3.0, 5.5]), { embed: 0.3 });
  const gemGeo = new THREE.OctahedronGeometry(0.11).scale(0.8, 1.25, 0.7);
  glow(b.stick(gemGeo, GEM, skin.nearest([0, 3.0, 6.2]), { embed: 0.2 }), 1.4);

  // Teal crystal clusters on the back, glowing like a magic charm.
  const crystal = new THREE.OctahedronGeometry(0.16).scale(0.8, 1.6, 0.8);
  glow(b.stick(crystal, GEM, skin.nearest([0.9, 3.3, -4.6]), { embed: 0.35 }), 1.2);
  glow(b.stick(crystal, GEM, skin.nearest([-0.95, 3.3, -4.3]), { embed: 0.35 }), 1.2);
  glow(b.stick(crystal, GEM, skin.nearest([0.6, 3.4, -5.6]), { embed: 0.35 }), 1.2);

  // Anime eyes on each flank, drawn with the toon kit.
  for (const s of [1, -1]) {
    b.decal(skin, EYE, { at: skin.nearest([s * 1.5, 2.45, 4.6]), size: [0.5, 0.68], mirror: s > 0 });
  }

  // Filigree decals on the flanks.
  for (const s of [1, -1]) {
    b.decal(skin, FILIGREE, { at: skin.nearest([s * 3, 2.6, -2.2]), size: [1.6, 0.8] });
  }

  // Head tubercles: small raised bumps over the head and upper jaw.
  const bumps = skin.scatter(50, {
    rng: rng(11),
    minDist: 0.32,
    filter: (h) => h.at.z > 3.2 && h.n.y > -0.3,
  });
  const bumpGeo = new THREE.SphereGeometry(0.06, 6, 4);
  for (const h of bumps) b.stick(bumpGeo, BUMP, h, { embed: 0.35 });

  // Dorsal fin on the back: a falcate fin, gold-trimmed along its trailing edge.
  const dorsal = b.joint("dorsal", { parent: back.joints[1], at: [0, 3.3, -2.7], role: "hinge" });
  const fin = b.extrude(FIN, {
    at: [0, 3.3, -2.7],
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: [0.22, 0.05],
    bevel: 0.02,
    smoothing: 1,
    color: FLIP,
    bone: dorsal,
  });
  b.sweep(catmull(FIN_TRAIL.map(([u, v]) => fin.local([u, v, 0]))), 0.03, { color: GOLD, bone: dorsal });

  // Silk ribbon streaming back from the fin tip.
  const finTip = fin.local([1.25, 1.3, 0]);
  const ribbon = catmull([finTip, [0, 4.5, -5.2], [0, 4.0, -7.2], [0.5, 3.6, -8.6]]);
  b.sweep(ribbon, (t) => [0.22 - 0.14 * t, 0.012], {
    section: "box",
    caps: "flat",
    color: TEAL,
    bone: dorsal,
  });

  // Fluke: two lobes on one joint, indigo above, patterned cream below, gold trailing edge.
  const fluke = b.joint("fluke", { parent: tailJ, at: [0, 2.0, -6.45], role: "fan" });
  for (const s of [1, -1]) {
    const lobe = b.extrude(LOBE, {
      at: [0, 2.0, -6.45],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: [0.05, 0.2],
      bevel: 0.02,
      smoothing: 1,
      color: FLUKE,
      bone: fluke,
    });
    b.sweep(catmull(LOBE_EDGE.map(([u, v]) => lobe.local([u, v, 0]))), 0.03, { color: GOLD, bone: fluke });
  }

  // Flippers: a chain from the chest to the tip, a membrane for the blade, knobs on the leading
  // edge, gold cuffs and gems.
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const arm = b.chain(
      `flipper${L}`,
      catmull(
        [
          [1.9, 1.7, 3.4],
          [3.4, 1.35, 2.6],
          [4.5, 1.0, 1.5],
          [4.95, 0.85, 0.3],
        ].map(([x, y, z]) => [s * x, y, z]),
      ),
      {
        parent: front.joints[1],
        names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `tip${L}`],
        role: "arm",
      },
    );
    const tube = b.sweep(arm, (t) => 0.24 - 0.12 * t, { color: FLIP });
    b.membrane(
      arm,
      [
        [2.0, 1.4, 2.95],
        [3.2, 1.1, 1.95],
        [4.3, 0.8, 0.6],
        [4.9, 0.75, -0.6],
      ].map(([x, y, z]) => [s * x, y, z]),
      { thickness: 0.05, color: FLIP },
    );
    const armSkin = b.surface(tube);
    for (const t of [0.12, 0.27, 0.42, 0.57, 0.72, 0.87]) {
      const q = arm.at(t).at;
      const knob = armSkin.nearest([q.x, q.y + 0.3, q.z]);
      b.stick(new THREE.SphereGeometry(0.075, 6, 4), BUMP, knob, { embed: 0.35 });
    }
    b.sweep(armSkin.loop(arm.joints[1], { lift: 0.02 }), 0.045, { color: GOLD });
    b.sweep(armSkin.loop(arm.joints[2], { lift: 0.02 }), 0.04, { color: GOLD });
    glow(b.stick(gemGeo, GEM, armSkin.nearest([s * 3.75, 1.5, 2.6]), { embed: 0.2 }), 1.2);
  }

  return b.root;
}
