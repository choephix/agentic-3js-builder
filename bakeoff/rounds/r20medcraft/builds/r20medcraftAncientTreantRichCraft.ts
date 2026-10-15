import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { cells, grain, mix, noise, paint, resolve, scales, smoothstep } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import type { SurfaceTarget } from "../../../../src/surface";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Ancient Treant",
  description:
    "A towering, moss-cloaked walking tree guardian: heavy bark-plated torso, oversized gnarled hands, glowing amber eyes under a stern brow, a leafy antler crown, a bronze-cuffed, vine-belted hand-painted look.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

type P = number[];
const add = (a: P, c: P): P => [a[0] + c[0], a[1] + c[1], a[2] + c[2]];
const sub = (a: P, c: P): P => [a[0] - c[0], a[1] - c[1], a[2] - c[2]];
const mul = (a: P, k: number): P => [a[0] * k, a[1] * k, a[2] * k];
const norm = (a: P): P => mul(a, 1 / Math.hypot(a[0], a[1], a[2]));
const lerpP = (a: P, c: P, t: number): P => add(a, mul(sub(c, a), t));

// Palette
const BARK_L = "#8a6038";
const BARK_M = "#6a4727";
const BARK_D = "#3f2a18";
const BARK_X = "#4d3822";
const CREV = "#24160c";
const LEAFS = ["#3f8a2a", "#58a832", "#2f7a2e", "#7fbf3a"];
const BRONZE = "#c98a3a";
const GOLD = "#f0c14a";
const AMBER = "#ffbe3d";
const SAP = "#ffb347";
const BONE = "#e9dcae";
const CREAM = "#f3ead0";
const SHROOM = "#d9562b";
const SHROOM2 = "#e8a23a";
const VINE = "#4a7a2a";
const CLAW = "#2a1a10";
const EYEDARK = "#1b0f08";
const MOUTH = "#2a0f12";

// Hand-painted bark: plated, grained, lit warm from above, mossy on top, muddy at the feet, amber sap seams.
const plates = scales(
  [
    grain(BARK_L, BARK_M, { size: 0.08, axis: "y", seed: 3 }),
    grain(BARK_M, BARK_D, { size: 0.08, axis: "y", seed: 4 }),
    grain("#7b5330", "#573a1f", { size: 0.07, axis: "y", seed: 5 }),
  ],
  CREV,
  { size: 0.32, width: 0.1, seed: 2 },
);
const bark = paint((p, n) => {
  let c = resolve(plates, p, n);
  c = n.y > 0 ? mix(c, "#ffd993", n.y * 0.2) : mix(c, "#1f1636", -n.y * 0.38);
  c = mix(c, "#2f2214", smoothstep(0.7, 0.0, p.y) * 0.6);
  const moss = smoothstep(0.2, 0.55, n.y) * smoothstep(0.46, 0.6, noise(p, 0.55, 5));
  c = mix(c, mix("#4f8a2a", "#86b83a", noise(p, 0.2, 9)), moss);
  const seam = cells(p, 0.8, 11);
  if (seam.d2 - seam.d1 < 0.018 && p.y > 1.6 && noise(p, 1.2, 13) > 0.58) c = mix(c, SAP, 0.9);
  return c;
});

// Textures
const leafSvg = (a: string, c: string, rib: string, ink: string) =>
  svg(
    `<svg viewBox="0 0 32 48"><path d="M16 47C2 34 0 14 16 1C32 14 30 34 16 47Z" fill="${a}"/><path d="M16 47C9 36 8 16 16 1C24 16 23 36 16 47Z" fill="${c}"/><path d="M16 46V8" stroke="${rib}" stroke-width="2" fill="none"/><path d="M16 16L9 10M16 24L8 18M16 32L10 27M16 16L23 10M16 24L24 18M16 32L22 27" stroke="${rib}" stroke-width="1.5" fill="none"/><path d="M16 47C2 34 0 14 16 1C32 14 30 34 16 47Z" fill="none" stroke="${ink}" stroke-width="1.8"/></svg>`,
    { size: 128 },
  );
const LEAF_A = leafSvg("#3f8a2a", "#62b032", "#2c6a22", "#27561d");
const LEAF_B = leafSvg("#5aa82f", "#8ccf45", "#3a7a26", "#2f6422");
const LEAF_G = leafSvg("#d98a2b", "#f0b840", "#9a5a1a", "#7a4412");
const TUFT = svg(
  `<svg viewBox="0 0 40 32"><path d="M4 32L8 6L12 32Z" fill="#4f8a2a"/><path d="M10 32L18 2L24 32Z" fill="#7cb83a"/><path d="M20 32L30 8L32 32Z" fill="#5a9a2e"/><path d="M26 32L36 14L38 32Z" fill="#3f7a2a"/><path d="M14 32L12 14L18 32Z" fill="#9acb3c"/></svg>`,
  { size: 128 },
);
const MOSSH_A = svg(
  `<svg viewBox="0 0 24 64"><path d="M12 64C4 50 20 40 10 28C4 18 14 10 12 0C16 10 20 18 14 28C24 40 8 50 14 64Z" fill="#6f8f3a"/><path d="M12 62C8 48 16 40 11 30C9 22 12 14 12 6" stroke="#a8c85a" stroke-width="2.6" fill="none"/></svg>`,
  { size: 192 },
);
const MOSSH_B = svg(
  `<svg viewBox="0 0 24 64"><path d="M12 64C6 52 18 42 9 30C5 20 15 12 13 0C17 12 21 22 15 30C22 42 10 52 14 64Z" fill="#587a34"/><path d="M12 62C10 50 15 42 11 32C9 24 13 14 13 6" stroke="#8fb050" stroke-width="2.6" fill="none"/></svg>`,
  { size: 192 },
);
const RUNE = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="none" stroke="#8dffb0" stroke-width="3"/><circle cx="32" cy="32" r="22" fill="none" stroke="#8dffb0" stroke-width="1.8"/><path d="M32 50V26M32 34L22 24M32 30L42 20M32 26L26 16M32 26L38 14M32 50L24 54M32 50L40 54M32 42L25 46M32 42L39 46" stroke="#8dffb0" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M32 3V8M32 56V61M3 32H8M56 32H61M11 11L15 15M53 11L49 15M11 53L15 49M53 53L49 49" stroke="#8dffb0" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "ancientTreant", paintSize: 2048 });

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 1.75, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.75, 0],
      [0, 2.5, 0.05],
      [0, 3.2, 0.12],
      [0, 3.8, 0.18],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 3.8, 0.18],
      [0, 4.05, 0.3],
      [0, 4.3, 0.45],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 4.3, 0.45], dir: [0, 0.25, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 4.3, 0.7], dir: [0, -0.05, 1], role: "jaw" });

  // ---------------------------------------------------------------- helpers
  const foliage = (c: P, r: number, bone: Joint, seed: number, n: number, textures: THREE.Texture[]) => {
    const rnd = rng(seed);
    for (let k = 0; k < 4; k++) {
      const o: P = [(rnd() - 0.5) * r * 0.9, (rnd() - 0.3) * r * 0.8, (rnd() - 0.5) * r * 0.9];
      const sz = r * (0.5 + 0.3 * rnd());
      b.part(new THREE.IcosahedronGeometry(sz, 0), LEAFS[Math.floor(rnd() * LEAFS.length)], {
        bone,
        at: add(c, o),
        flat: true,
        rotation: [rnd() * 180, rnd() * 180, 0],
      });
    }
    const frames = Array.from({ length: n }, () => {
      const th = rnd() * Math.PI * 2;
      const y = rnd() * 1.6 - 0.6;
      const rr = Math.sqrt(1 - y * y);
      const d: P = [rr * Math.cos(th), y, rr * Math.sin(th)];
      return frame(add(c, mul(d, r * 0.9)), d);
    });
    const s = 0.22 + 0.22 * r;
    b.cards(frames, textures, {
      size: [0.7 * s, s],
      lean: 30,
      bend: 25,
      vary: 0.3,
      spin: 180,
      rng: rnd,
      bone,
      sink: 0.15,
    });
  };
  const LEAVES = [LEAF_A, LEAF_B, LEAF_A, LEAF_G];

  const branch = (name: string, parent: Joint, pts: P[], rad: [number, number], leafR: number, seed: number) => {
    const r = rng(seed);
    const names = pts.slice(1).map((_, i) => `${name}${i + 1}`);
    const ch = b.chain(name, catmull(pts), { parent, names, role: "tentacle" });
    b.sweep(ch, rad, bark);
    for (let i = 1; i < pts.length - 1; i++) {
      const j = ch.joints[i];
      const dn = norm([(r() - 0.5) * 1.6, 0.5 + r() * 0.6, (r() - 0.5) * 1.6]);
      const len = 0.5 + r() * 0.3;
      b.spike(pts[i], dn, len, 0.07, BARK_M, { bone: j });
      foliage(add(pts[i], mul(dn, len)), leafR * 0.45, j, seed * 7 + i, 10, LEAVES);
    }
    const last = ch.joints[ch.joints.length - 1];
    foliage(add(pts[pts.length - 1], [0, leafR * 0.3, 0]), leafR, last, seed * 3, 34, LEAVES);
  };

  const hang = (pts: P[], bone: Joint, w: number, h: number, seed: number) =>
    b.cards(
      pts.map((p) => frame(p, [0, 1, 0])),
      [MOSSH_A, MOSSH_B],
      { size: [w, h], lean: 180, flow: [0, 0, 1], vary: 0.35, spin: 50, rng: rng(seed), bone, sink: 0.05 },
    );

  const tufts = (target: SurfaceTarget, count: number, seed: number, minDist: number) =>
    b.cards(
      b.surface(target).scatter(count, { rng: rng(seed), minDist, filter: (h) => h.n.y > 0.25 }),
      TUFT,
      { size: [0.22, 0.18], lean: 20, cross: true, vary: 0.3, spin: 180, rng: rng(seed + 1) },
    );

  const shrooms = (target: SurfaceTarget, count: number, seed: number, fallback: Joint) => {
    const hits = b.surface(target).scatter(count, { rng: rng(seed), minDist: 0.25, filter: (h) => h.n.y > 0.7 });
    hits.forEach((h, i) => {
      const k = 0.7 + (i % 3) * 0.25;
      const bone = h.bone ?? fallback;
      b.stick(new THREE.CylinderGeometry(0.035 * k, 0.05 * k, 0.16 * k, 6), CREAM, h, { bone });
      b.part(new THREE.SphereGeometry(0.12 * k, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), i % 2 ? SHROOM : SHROOM2, {
        bone,
        at: [h.at.x, h.at.y + 0.15 * k, h.at.z],
        scale: [1, 0.75, 1],
      });
      b.part(new THREE.SphereGeometry(0.025 * k, 5, 3), CREAM, {
        bone,
        at: [h.at.x + 0.04 * k, h.at.y + 0.15 * k + 0.085 * k, h.at.z],
      });
    });
  };

  const band = (target: SurfaceTarget, at: P, dir: P, color: string, radius: number, rivets: boolean) => {
    const skin = b.surface(target);
    b.sweep(skin.loop(at, { dir, lift: 0.03 }), radius, color);
    if (rivets) {
      const outer = skin.loop(at, { dir, lift: 0.03 + radius * 0.9 });
      b.along(outer, 10, (a) => {
        b.part(new THREE.SphereGeometry(0.03, 5, 4), GOLD, { at: a });
      });
    }
  };

  // ---------------------------------------------------------------- torso
  const torso = b.loft(
    [
      { at: [0, 1.85, 0], w: 1.4, h: 1.1 },
      { at: [0, 2.4, 0.03], w: 1.9, h: 1.5 },
      { at: [0, 3.0, 0.1], w: 2.4, h: 1.7 },
      { at: [0, 3.55, 0.16], w: 2.5, h: 1.5 },
      { at: [0, 3.95, 0.2], w: 1.3, h: 1.0 },
    ],
    { bone: spine, color: bark },
  );
  const torsoSkin = b.surface(torso);
  b.sweep(neck, [0.55, 0.5], bark);

  // Belt of vines, buckle, leaf skirt
  band(torso, [0, 2.1, 0.05], [0, 1, 0], VINE, 0.08, false);
  band(torso, [0, 2.26, 0.05], [0, 1, 0], "#5d8f34", 0.06, false);
  const buckleHit = torsoSkin.ray([0, 2.18, 3], [0, 0, -1]);
  if (buckleHit) {
    b.part(new THREE.TorusGeometry(0.17, 0.045, 6, 12), BRONZE, {
      bone: hips,
      at: buckleHit.moved([0, 0.03, 0]),
      dir: buckleHit.n,
      axis: "z",
    });
    b.part(new THREE.SphereGeometry(0.08, 6, 5), AMBER, { bone: hips, at: buckleHit.moved([0, 0.04, 0]) });
  }
  const skirt = torsoSkin.loop([0, 2.05, 0.05], { dir: [0, 1, 0], lift: 0.05 });
  for (const [row, off] of [
    [0, 0],
    [1, 0.5],
  ]) {
    const pts = Array.from({ length: 20 }, (_, i) => skirt.at((i + off) / 20));
    b.cards(
      pts.map((p) => frame([p.x, p.y - row * 0.12, p.z], [0, 1, 0])),
      [LEAF_A, LEAF_B, LEAF_G],
      {
        size: [0.3, 0.6 - row * 0.08],
        lean: 180,
        flow: (f) => [f.at.x, 0, f.at.z],
        vary: 0.2,
        spin: 10,
        rng: rng(31 + row),
        bone: hips,
        sink: 0.05,
      },
    );
  }

  // Chest rune and glowing sap veins
  const runeHit = torsoSkin.ray([0, 3.1, 3], [0, 0, -1]);
  if (runeHit) glow(b.decal(torso, RUNE, { at: runeHit, size: [0.95, 0.95] }), 1.2);
  for (const s of [1, -1]) {
    const vein = torsoSkin.drape(
      catmull([
        [s * 0.15, 2.95, 1.2],
        [s * 0.4, 2.65, 1.2],
        [s * 0.6, 2.3, 1.1],
        [s * 0.75, 1.95, 0.9],
      ]),
      { lift: 0.02 },
    );
    glow(b.sweep(vein, [0.035, 0.015], SAP), 1.2);
  }

  // Bark plates and burls
  const plateRng = rng(5);
  const plateColors = [BARK_M, BARK_X, "#7b5330", BARK_L];
  torsoSkin.scatter(34, { rng: rng(6), minDist: 0.3, filter: (h) => h.n.z > 0.2 && h.at.y > 2.2 }).forEach((h, i) => {
    b.stick(new THREE.BoxGeometry(0.36, 0.1, 0.26), plateColors[i % 4], h, { spin: plateRng() * 360, embed: 0.4 });
  });
  torsoSkin.scatter(16, { rng: rng(8), minDist: 0.3 }).forEach((h, i) => {
    b.stick(new THREE.IcosahedronGeometry(0.1 + (i % 3) * 0.04, 0), plateColors[(i + 1) % 4], h, {
      embed: 0.35,
      flat: true,
    });
  });
  tufts(torso, 70, 21, 0.18);
  shrooms(torso, 4, 23, chest);

  // Saplings on the back
  for (const s of [1, -1]) {
    const hit = torsoSkin.ray([s * 0.65, 3.7, -3], [0, 0, 1]);
    if (!hit) continue;
    const bone = hit.bone ?? chest;
    b.spike(hit, hit, 0.8, 0.07, BARK_M, { bone });
    foliage(add([hit.at.x, hit.at.y, hit.at.z], mul([hit.n.x, hit.n.y, hit.n.z], 0.8)), 0.45, bone, 40 + s, 18, LEAVES);
  }

  // ---------------------------------------------------------------- shoulders and back branches
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const burl = b.part(new THREE.SphereGeometry(1, 12, 9), bark, {
      bone: chest,
      at: [s * 1.45, 3.4, 0.1],
      scale: [0.72, 0.62, 0.68],
    });
    shrooms(burl, 3, 60 + s, chest);
    tufts(burl, 12, 70 + s, 0.2);
    const ring: P[] = Array.from({ length: 7 }, (_, i) => {
      const a = (i / 7) * Math.PI * 2;
      return [s * 1.45 + Math.cos(a) * 0.5, 2.95, 0.1 + Math.sin(a) * 0.45];
    });
    hang(ring, chest, 0.2, 0.55, 80 + s);
    branch(
      `shoulderBranch${S}`,
      chest,
      [
        [s * 1.5, 3.8, 0.0],
        [s * 1.9, 4.4, -0.1],
        [s * 2.2, 4.95, -0.2],
        [s * 2.4, 5.4, -0.25],
      ],
      [0.2, 0.07],
      0.8,
      90 + S.charCodeAt(0),
    );
    branch(
      `backBranch${S}`,
      chest,
      [
        [s * 0.6, 3.8, -0.55],
        [s * 0.9, 4.4, -0.85],
        [s * 1.0, 5.0, -1.0],
        [s * 1.0, 5.5, -1.05],
      ],
      [0.18, 0.06],
      0.7,
      110 + S.charCodeAt(0),
    );
  }

  // ---------------------------------------------------------------- head
  b.part(new THREE.SphereGeometry(1, 12, 9), bark, { bone: head, at: [0, 4.66, 0.62], scale: [0.64, 0.6, 0.62] });
  b.frustumBox([0, 4.48, 0.9], [0, 4.46, 1.28], [0.85, 0.24], [0.6, 0.2], { bone: head, color: bark });
  b.part(new THREE.BoxGeometry(0.62, 0.05, 0.5), MOUTH, { bone: head, at: [0, 4.345, 1.0] });
  b.sweep(
    catmull([
      [0, 4.7, 1.1],
      [0, 4.6, 1.28],
      [0, 4.45, 1.36],
    ]),
    [0.14, 0.1, 0.06],
    { color: bark, bone: head },
  );
  b.frustumBox([0, 4.2, 0.78], [0, 4.2, 1.2], [0.9, 0.26], [0.66, 0.24], { bone: jaw, color: bark });
  for (const s of [1, -1]) {
    b.spike([s * 0.28, 4.32, 1.15], [0, 1, 0.15], 0.22, 0.06, BONE, { bone: jaw });
    for (const x of [0.12, 0.26]) b.spike([s * x, 4.37, 1.22], [0, -1, 0.1], 0.1, 0.03, BONE, { bone: head });
    // cheek burls and ear stubs
    b.part(new THREE.SphereGeometry(1, 8, 6), bark, { bone: head, at: [s * 0.5, 4.5, 0.8], scale: 0.28 });
    b.spike([s * 0.6, 4.75, 0.5], [s, 0.3, -0.2], 0.32, 0.12, BARK_M, { bone: head });
    // eyes under a stern brow
    b.part(new THREE.SphereGeometry(0.14, 8, 6), EYEDARK, {
      bone: head,
      at: [s * 0.27, 4.72, 1.06],
      scale: [1, 0.8, 0.7],
    });
    glow(b.part(new THREE.SphereGeometry(0.085, 8, 6), AMBER, { bone: head, at: [s * 0.27, 4.72, 1.11] }), 1.5);
    b.part(new THREE.SphereGeometry(1, 6, 5), EYEDARK, {
      bone: head,
      at: [s * 0.27, 4.72, 1.19],
      scale: [0.02, 0.06, 0.02],
    });
    const brow = b.capsule([s * 0.06, 4.86, 1.12], [s * 0.55, 4.97, 0.9], 0.1, bark, { bone: head });
    b.cards([0.15, 0.4, 0.65, 0.9].map((t) => brow.at(t, 0, 0)), TUFT, {
      size: [0.14, 0.16],
      lean: 30,
      flow: [0, 0, 1],
      bone: head,
    });
  }
  // beard of roots and moss
  for (let k = 0; k < 7; k++) {
    const x = (k - 3) * 0.12;
    const z = 1.15 - Math.abs(x) * 0.4;
    b.sweep(
      catmull([
        [x, 4.15, z],
        [x * 1.2, 3.85, z + 0.05],
        [x * 1.3, 3.5 - (k % 3) * 0.1, z - 0.05],
      ]),
      [0.07, 0.015],
      BARK_X,
      { bone: jaw, caps: { end: "point" } },
    );
  }
  hang(
    Array.from({ length: 8 }, (_, i): P => [(i - 3.5) * 0.14, 4.1, 1.0 - Math.abs(i - 3.5) * 0.1]),
    jaw,
    0.2,
    0.55,
    120,
  );

  // crown
  branch(
    "crownA",
    head,
    [
      [0.25, 5.1, 0.45],
      [0.55, 5.5, 0.4],
      [0.95, 5.85, 0.3],
      [1.3, 6.15, 0.25],
    ],
    [0.17, 0.06],
    0.8,
    131,
  );
  branch(
    "crownB",
    head,
    [
      [-0.25, 5.1, 0.45],
      [-0.55, 5.5, 0.4],
      [-0.95, 5.85, 0.3],
      [-1.3, 6.15, 0.25],
    ],
    [0.17, 0.06],
    0.8,
    132,
  );
  branch(
    "crownC",
    head,
    [
      [0.1, 5.2, 0.35],
      [0.15, 5.65, 0.3],
      [0.05, 6.1, 0.35],
      [0.1, 6.5, 0.4],
    ],
    [0.18, 0.06],
    0.9,
    133,
  );
  branch(
    "crownD",
    head,
    [
      [-0.1, 5.2, 0.35],
      [-0.4, 5.55, 0.2],
      [-0.75, 5.95, 0.25],
      [-0.9, 6.35, 0.3],
    ],
    [0.16, 0.06],
    0.7,
    134,
  );
  branch(
    "crownE",
    head,
    [
      [0, 5.1, 0.15],
      [0, 5.45, -0.2],
      [0.2, 5.85, -0.5],
      [0.3, 6.2, -0.7],
    ],
    [0.16, 0.06],
    0.75,
    135,
  );

  // ---------------------------------------------------------------- arms
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts: P[] = [
      [s * 1.4, 3.3, 0.1],
      [s * 2.15, 2.45, 0.3],
      [s * 2.65, 1.55, 0.6],
      [s * 2.85, 1.1, 0.75],
    ];
    const arm = b.chain(`arm${S}`, catmull(pts), {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`],
      role: "arm",
    });
    const armTube = b.sweep(arm, [0.52, 0.42, 0.36, 0.34, 0.3], bark);
    const handJ = arm.tip!;
    b.part(new THREE.SphereGeometry(1, 10, 8), bark, { bone: arm.joints[1], at: pts[1], scale: 0.46 });
    b.spike(add(pts[1], [s * 0.3, 0.15, -0.2]), [s, 0.2, -0.6], 0.38, 0.1, BARK_X, { bone: arm.joints[1] });
    tufts(armTube, 28, 150 + s, 0.2);
    shrooms(armTube, 2, 160 + s, arm.joints[0]);
    band(armTube, lerpP(pts[1], pts[2], 0.75), sub(pts[2], pts[1]), BRONZE, 0.06, true);
    band(armTube, lerpP(pts[0], pts[1], 0.55), sub(pts[1], pts[0]), VINE, 0.06, false);
    // hand
    const hand = pts[3];
    b.part(new THREE.SphereGeometry(1, 10, 8), bark, {
      bone: handJ,
      at: add(hand, [0, -0.12, 0.08]),
      scale: [0.36, 0.3, 0.34],
    });
    [-0.22, -0.07, 0.08, 0.23].forEach((dx, i) => {
      const p0 = add(hand, [dx, -0.12, 0.08]);
      const p1 = add(hand, [dx * 1.4, -0.5, 0.2]);
      const p2 = add(hand, [dx * 1.7, -0.85, 0.38]);
      const f = b.chain(`finger${S}${i}`, catmull([p0, p1, p2]), {
        parent: handJ,
        names: [`finger${S}${i}a`, `finger${S}${i}b`],
        role: "digit",
      });
      b.sweep(f, [0.11, 0.04], bark, { caps: { start: "round", end: "point" } });
      b.spike(p2, sub(p2, p1), 0.16, 0.035, CLAW, { bone: f.joints[1] });
    });
    const t0: P = add(hand, [-s * 0.2, -0.05, 0.15]);
    const t1: P = add(hand, [-s * 0.42, -0.25, 0.35]);
    const t2: P = add(hand, [-s * 0.5, -0.5, 0.55]);
    const thumb = b.chain(`thumb${S}`, catmull([t0, t1, t2]), {
      parent: handJ,
      names: [`thumb${S}a`, `thumb${S}b`],
      role: "digit",
    });
    b.sweep(thumb, [0.12, 0.04], bark, { caps: { start: "round", end: "point" } });
    b.spike(t2, sub(t2, t1), 0.16, 0.035, CLAW, { bone: thumb.joints[1] });
  }

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.75, 1.7, 0], [s * 0.85, 0.38, 0.12], [0.85, 0.85], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, catmull(pts), {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
    });
    const legTube = b.sweep(leg, [0.55, 0.46, 0.38], bark);
    const ankle = leg.tip!;
    b.part(new THREE.SphereGeometry(1, 10, 8), bark, { bone: leg.joints[1], at: pts[1], scale: 0.5 });
    b.spike(pts[1].clone().add(new THREE.Vector3(0, 0.05, 0.35)), [0, 0.1, 1], 0.3, 0.12, BARK_X, {
      bone: leg.joints[1],
    });
    tufts(legTube, 22, 170 + s, 0.22);
    const shin = pts[1].clone().lerp(pts[2], 0.7);
    band(legTube, shin.toArray(), pts[2].clone().sub(pts[1]).toArray(), BRONZE, 0.06, true);
    // foot, toes and gripping roots
    const fx = s * 0.85;
    b.part(new THREE.SphereGeometry(1, 10, 8), bark, { bone: ankle, at: [fx, 0.22, 0.35], scale: [0.55, 0.24, 0.7] });
    [-0.25, 0, 0.25].forEach((dx, i) => {
      const p0: P = [fx + dx, 0.2, 0.7];
      const p1: P = [fx + dx * 1.3, 0.14, 1.2];
      const toe = b.chain(`toe${S}${i}`, [p0, p1], { parent: ankle, names: [`toe${S}${i}`], role: "digit" });
      b.sweep(toe, [0.15, 0.08], bark);
      b.spike(p1, sub(p1, p0), 0.14, 0.045, CLAW, { bone: toe.joints[0] });
    });
    const ends: P[] = [
      [1.5, 0.04, -0.5],
      [1.7, 0.04, 0.2],
      [1.35, 0.04, -0.95],
    ];
    ends.forEach((e) => {
      const start: P = [s * 0.9, 0.45, -0.05];
      const end: P = [s * e[0], e[1], e[2]];
      const m = add(lerpP(start, end, 0.5), [0, 0.12, 0]);
      b.sweep(catmull([start, m, end]), [0.16, 0.03], bark, { bone: ankle, caps: { end: "point" } });
    });
  }

  return b.root;
}
