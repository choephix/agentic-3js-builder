```ts
import * as THREE from "three";
import { createBuilder, catmull, grain, limb, mottle, rng, scales, spots, svg } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Forest spirit",
  description:
    "A tall forest spirit: birch mask with glowing amber eyes, an antler crown of twigs and leaves, moss hair, leaf ears, a moss-bell robe, a bark torso with a glowing knot, vine bracelets and root feet.",
};

const BIRCH = "#ece5d3";
const BIRCH_SHADE = "#b9ae94";
const BARK = "#5e3f28";
const BARK_DARK = "#382518";
const BARK_LIGHT = "#8e6a45";
const MOSS = "#5f9a42";
const MOSS_DARK = "#2d5c2a";
const LEAF = "#8fd05a";
const LEAF_VEIN = "#3f7f33";
const AMBER = "#ffb13b";
const INK = "#1d140e";
const CAP = "#d8492c";
const CREAM = "#f6eedb";
const GLOW = "#ffe27a";

function leafArt(fill: string, vein: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 48">
  <path d="M12 47C0 34 1 13 12 1C23 13 24 34 12 47Z" fill="${fill}"/>
  <path d="M12 46V6" stroke="${vein}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <path d="M12 31L5 23M12 31L19 23M12 19L7 12M12 19L17 12" stroke="${vein}" stroke-width="1.1" fill="none" stroke-linecap="round"/>
</svg>`;
}

const EYE_ART = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 30">
  <ellipse cx="20" cy="16" rx="18" ry="13" fill="${AMBER}"/>
  <ellipse cx="20" cy="17" rx="7.5" ry="10" fill="${INK}"/>
  <ellipse cx="13.5" cy="13" rx="3" ry="2.6" fill="#fff7dc"/>
  <path d="M1 15Q20 -3 39 15" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
</svg>`;

export default function build() {
  const b = createBuilder({ name: "forest-spirit" });

  // ---- paints and drawings
  const skinPaint = mottle(BIRCH, BIRCH_SHADE, { size: 0.07, contrast: 0.5 });
  const antlerPaint = grain(BIRCH, BIRCH_SHADE, { size: 0.02, axis: "y" });
  const torsoPaint = scales(BARK, BARK_DARK, { size: 0.09 });
  const barkStreak = grain(BARK_LIGHT, BARK, { size: 0.025, axis: "y" });
  const legPaint = grain(BARK, BARK_DARK, { size: 0.02, axis: "y" });
  const robePaint = mottle(MOSS_DARK, MOSS, { size: 0.12, contrast: 0.6 });
  const capPaint = spots(CAP, CREAM, { size: 0.035, amount: 0.4 });

  const eyeTex = svg(EYE_ART, { size: 192 });
  const leafA = svg(leafArt(LEAF, LEAF_VEIN), { size: 128 });
  const leafB = svg(leafArt(MOSS, MOSS_DARK), { size: 128 });

  // ---- skeleton: hips, spine, neck, head, jaw
  const hips = b.joint("hips", { at: [0, 0.96, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.0, 0],
      [0, 1.17, 0],
      [0, 1.33, 0],
      [0, 1.45, 0],
    ]),
    { parent: hips, names: ["waist", "chest", "upper"], role: "spine" },
  );
  const upper = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.45, 0],
      [0, 1.55, 0],
      [0, 1.61, 0],
    ]),
    { parent: upper, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 1.64, 0],
    dir: [0, 1, 0.06],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.57, 0.02],
    dir: [0, -1, 0.3],
    role: "jaw",
  });

  // ---- torso: bark loft over the spine, scale plates, leaf tufts, glowing knot
  const torso = b.loft(
    [
      { at: [0, 1.0, 0], w: 0.3, h: 0.2 },
      { at: [0, 1.17, 0], w: 0.36, h: 0.23 },
      { at: [0, 1.31, 0], w: 0.38, h: 0.2 },
      { at: [0, 1.44, 0], w: 0.16, h: 0.14 },
    ],
    { bone: spine, color: torsoPaint },
  );
  const torsoSurf = b.surface(torso);
  const knot = torsoSurf.nearest([0, 1.2, 0.6]);
  b.stick(new THREE.CylinderGeometry(0.058, 0.064, 0.016, 12), BARK_DARK, knot, { embed: 0.5 });
  b.stick(new THREE.CylinderGeometry(0.036, 0.042, 0.02, 12), AMBER, knot, { embed: 0.5 });
  const tufts = torsoSurf.scatter(16, {
    rng: rng(41),
    minDist: 0.07,
    filter: (h) => h.at.y > 1.2 && h.n.y > 0.1,
  });
  b.cards(tufts, [leafA, leafB], { size: [0.075, 0.11], lean: 25, vary: 0.25, rng: rng(42) });

  // neck
  b.sweep(neck, [0.066, 0.05], { color: barkStreak });

  // ---- arms, hands and vine bracelets
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${side}`,
      catmull([
        [s * 0.19, 1.33, 0],
        [s * 0.34, 1.1, 0],
        [s * 0.42, 0.88, 0.06],
        [s * 0.46, 0.73, 0.12],
      ]),
      {
        parent: upper,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
        role: "arm",
      },
    );
    const armBody = b.sweep(arm, [0.054, 0.042, 0.032, 0.026], { color: barkStreak });
    const vine = b.surface(armBody).loop(arm.joints[2], { lift: 0.008 });
    b.sweep(vine, 0.0095, { color: MOSS_DARK });

    const hand = arm.joints[3];
    for (const k of [-1, 0, 1]) {
      const sp = k * 0.024;
      const base = hand.local({ left: s * sp * 0.3 });
      const mid = hand.local({ down: 0.05, left: s * sp * 0.8, forward: 0.006 });
      const tip = hand.local({ down: 0.1, left: s * sp * 1.4, forward: 0 });
      b.sweep(catmull([base, mid, tip]), [0.011, 0.004], {
        bone: hand,
        color: BARK_LIGHT,
        caps: { start: "round", end: "point" },
      });
    }
    b.sweep(
      catmull([
        hand.local({ forward: 0.01, left: s * 0.02 }),
        hand.local({ down: 0.04, left: s * 0.05, forward: 0.03 }),
        hand.local({ down: 0.07, left: s * 0.07, forward: 0.035 }),
      ]),
      [0.012, 0.004],
      { bone: hand, color: BARK_LIGHT, caps: { start: "round", end: "point" } },
    );
  }

  // ---- legs and root feet
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.1, 0.94, 0], [s * 0.12, 0.08, 0.03], [0.44, 0.44], [0, 0, 1]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    b.sweep(leg, [0.072, 0.05, 0.036], { color: legPaint });

    const ankle = leg.joints[2];
    b.part(new THREE.SphereGeometry(0.075, 10, 7).scale(0.9, 0.45, 1.5), BARK_DARK, {
      bone: ankle,
      at: [s * 0.12, 0.034, 0.07],
      flat: true,
    });
    for (const g of [
      [s * 0.22, 0.02, 0.16],
      [s * 0.25, 0.02, -0.02],
      [s * 0.04, 0.02, -0.15],
    ]) {
      b.rod([s * 0.12, 0.06, 0.03], g, [0.022, 0.008], { bone: ankle, color: BARK });
    }
  }

  // ---- robe: a faceted bell of moss, fringed with hanging leaves
  const robe = b.lathe(
    [
      [0, 0.27],
      [0.335, 0.27],
      [0.34, 0.3],
      [0.31, 0.48],
      [0.27, 0.7],
      [0.23, 0.9],
      [0.2, 1.04],
      [0.19, 1.1],
      [0, 1.1],
    ],
    { at: [0, 0, 0], bone: hips, segments: 10, color: robePaint },
  );
  const robeSurf = b.surface(robe);

  const hemJoint = b.joint("hem", { parent: hips, at: [0, 0.27, 0], dir: [0, 1, 0] });
  const sashJoint = b.joint("sash", { parent: hips, at: [0, 0.62, 0], dir: [0, 1, 0] });
  const hemRing = b.ring(hemJoint, { count: 20, radius: 0.35 });
  b.cards(hemRing.items, [leafA, leafB], {
    size: [0.12, 0.17],
    lean: 72,
    flow: [0, -1, 0],
    bend: 15,
    vary: 0.2,
    rng: rng(31),
  });
  const sashRing = b.ring(sashJoint, { count: 14, radius: 0.29 });
  b.cards(sashRing.items, [leafB, leafA], {
    size: [0.1, 0.15],
    lean: 48,
    flow: [0, -1, 0],
    vary: 0.2,
    rng: rng(32),
  });

  // ---- mushrooms bracketed onto the robe
  const dome = (r: number) =>
    new THREE.SphereGeometry(r, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.7, 1);
  b.stick(dome(0.05), capPaint, robeSurf.nearest([0.3, 0.55, 0.15]), { embed: 0.25, flat: true });
  b.stick(dome(0.032), capPaint, robeSurf.nearest([-0.22, 0.4, 0.27]), { embed: 0.25, flat: true });
  b.stick(dome(0.024), capPaint, robeSurf.nearest([0.26, 0.85, -0.2]), { embed: 0.25, flat: true });

  // ---- moss hair on the crown
  b.lathe(
    [
      [0, 1.7],
      [0.135, 1.7],
      [0.14, 1.72],
      [0.125, 1.755],
      [0.085, 1.785],
      [0.04, 1.8],
      [0, 1.805],
    ],
    { at: [0, 0, 0], bone: head, segments: 10, color: robePaint },
  );

  // ---- head: birch mask, lower jaw, carved smile, glowing eyes, leaf ears
  const skull = b.part(new THREE.SphereGeometry(0.13, 14, 10).scale(0.92, 1.06, 0.98), skinPaint, {
    bone: head,
    at: head.at,
    flat: true,
  });
  b.part(new THREE.SphereGeometry(0.075, 10, 7).scale(0.95, 0.42, 0.9), skinPaint, {
    bone: jaw,
    at: head.local({ up: -0.095, forward: 0.035 }),
    flat: true,
  });

  for (const s of [1, -1]) {
    b.decal(skull, eyeTex, {
      at: head.local({ left: s * 0.055, up: 0, forward: 0.2 }),
      dir: [0, 0, 1],
      size: [0.08, 0.06],
      mirror: s > 0,
    });
  }

  const faceSurf = b.surface(skull);
  const smile = faceSurf.drape(
    catmull([
      head.local({ left: 0.056, up: -0.04, forward: 0.17 }),
      head.local({ left: 0, up: -0.07, forward: 0.2 }),
      head.local({ left: -0.056, up: -0.04, forward: 0.17 }),
    ]),
    { lift: 0.003 },
  );
  b.sweep(smile, 0.0062, { color: INK });

  const earOutline: OutlinePoint[] = [
    [0, -0.03],
    [0.07, 0.03],
    [0.14, 0.05],
    [0.2, 0.035, "sharp"],
    [0.15, -0.01],
    [0.07, -0.04],
  ];
  for (const s of [1, -1]) {
    b.extrude(earOutline, {
      at: head.local({ left: s * 0.08, up: 0, forward: 0 }),
      x: [s, 0, 0],
      thickness: 0.012,
      bevel: 0.003,
      smoothing: 1,
      color: MOSS,
      bone: head,
    });
  }

  // ---- antlers: birch branches hung with leaves
  const H = (left: number, up: number, forward: number) => head.local({ left, up, forward });
  for (const s of [1, -1]) {
    const P = (x: number, y: number, z: number) => H(s * x, y, z);
    const main = b.sweep(
      catmull([P(0.05, 0.1, 0), P(0.1, 0.2, -0.02), P(0.16, 0.3, -0.07), P(0.2, 0.39, -0.13)]),
      [0.024, 0.007],
      { bone: head, color: antlerPaint, caps: { start: "round", end: "point" } },
    );
    const tine1 = b.sweep(
      catmull([P(0.1, 0.2, -0.02), P(0.19, 0.25, 0.03), P(0.25, 0.3, 0.07)]),
      [0.016, 0.004],
      { bone: head, color: antlerPaint, caps: { start: "round", end: "point" } },
    );
    const tine2 = b.sweep(
      catmull([P(0.16, 0.3, -0.07), P(0.25, 0.36, -0.05), P(0.3, 0.4, -0.03)]),
      [0.015, 0.004],
      { bone: head, color: antlerPaint, caps: { start: "round", end: "point" } },
    );
    b.cards(
      [main.at(0.45, 90), main.at(0.8, -90), tine1.at(0.55, 0), tine2.at(0.5, 180)],
      [leafA, leafB],
      { size: [0.07, 0.1], lean: 40, vary: 0.2, rng: rng(50 + (s > 0 ? 1 : 2)) },
    );
  }

  // ---- fireflies drifting around the spirit
  const flies: [number, number, number][] = [
    [0.42, 1.5, 0.22],
    [-0.38, 1.66, 0.2],
    [0.3, 1.05, 0.36],
    [-0.52, 0.9, 0.16],
    [0.12, 1.98, -0.2],
    [-0.22, 1.4, 0.44],
    [0.6, 1.2, -0.1],
  ];
  for (const p of flies) {
    b.part(new THREE.SphereGeometry(0.016, 6, 4), GLOW, { bone: hips, at: p });
  }

  return b.root;
}
```