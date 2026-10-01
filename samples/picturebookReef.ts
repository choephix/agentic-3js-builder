import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { offset, rng } from "../src/math";
import { arc, bezier, catmull, polyline } from "../src/path";
import { countershade, gradient, mottle, patches, spots, stripes } from "../src/paint";
import type { Paint } from "../src/paint";
import { svg } from "../src/texture";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  name: "Picture-book Coral Reef",
  description:
    "A watercolour tabletop reef diorama: branching and brain corals, sea fans, anemones, kelp, anchor and treasure chest, with a swimming turtle, striped fish school and a peeking octopus.",
};

// Watercolour picture-book palette: soft washes, pale edges.
const SAND = "#e8d5a8";
const SAND_D = "#d9bd8a";
const ROCK = "#b9a4b3";
const ROCK_D = "#9a8296";
const CORAL_PINK = "#f2a0b5";
const CORAL_ROSE = "#e2728c";
const CORAL_ORANGE = "#f6b17a";
const CORAL_RED = "#e0785e";
const BRAIN = "#e9c88f";
const BRAIN_LINE = "#c08d5a";
const FAN = "#c9a6dd";
const FAN_EDGE = "#9a72c0";
const KELP = "#8fc39a";
const KELP_D = "#5e9a6e";
const ANEM = "#f7d3c4";
const ANEM_TIP = "#e88ca0";
const WOOD = "#a4764e";
const WOOD_D = "#7d5736";
const GOLD = "#e8c05e";
const GOLD_D = "#b98d2e";
const ANCHOR = "#7d8b99";
const ANCHOR_D = "#55606c";
const TURTLE = "#9ccb8e";
const TURTLE_D = "#5f9a6d";
const BELLY = "#f4ead0";
const EYE_W = "#fdfdf6";
const EYE_B = "#3a3a44";
const CHEEK = "#f5a8a0";
const FISH_B = "#8fc7e8";
const FISH_S = "#3d6fa8";
const FISH_Y = "#f6d87a";
const OCTO = "#c78fc0";
const OCTO_L = "#e8c4e2";
const STAR = "#f0a35e";
const SHELL = "#d9b8d4";
const PEARL = "#f6f2ea";

export default function build() {
  const b = createBuilder({ name: "picturebookReef" });
  const R = rng(11);

  // ---------- root + sandy base ----------
  const root = b.joint("reef", { at: [0, 0.02, 0] });
  const sandPaint = mottle(SAND, SAND_D, { size: 0.16, seed: 5 });
  b.lathe(
    [
      [0, 0.02],
      [0.62, 0.02],
      [0.7, 0.05],
      [0.7, 0.1],
      [0.62, 0.12],
      [0, 0.12],
    ],
    { at: [0, 0, 0], bone: root, color: sandPaint, segments: 28 },
  );
  // sand ripples: thin pale rings
  for (let i = 0; i < 3; i++) {
    const r = 0.28 + i * 0.11;
    b.sweep(arc([0, 0.121, 0], [r, 0.121, 0], [0, 1, 0], 300), 0.006, {
      bone: root,
      color: SAND_D,
    });
  }
  // scattered pebbles + tiny shells (merged, one part)
  {
    const geos: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 14; i++) {
      const a = R() * Math.PI * 2;
      const r = 0.15 + R() * 0.45;
      const p = new THREE.SphereGeometry(0.012 + R() * 0.014, 6, 4);
      p.scale(1, 0.55, 1);
      p.translate(Math.cos(a) * r, 0.125, Math.sin(a) * r);
      geos.push(p);
    }
    b.part(mergeGeometries(geos)!, ROCK, { bone: root, at: [0, 0, 0] });
  }
  // starfish (picture-book five-arm blob)
  {
    const c = b.joint("starfish", { parent: root, at: [0.42, 0.13, 0.3] });
    b.part(new THREE.SphereGeometry(0.035, 8, 6), STAR, { bone: c, at: c.at });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const tip: [number, number, number] = [0.42 + Math.cos(a) * 0.075, 0.125, 0.3 + Math.sin(a) * 0.075];
      b.capsule(c.at, tip, [0.02, 0.008], { bone: c, color: STAR });
    }
    b.part(new THREE.SphereGeometry(0.012, 6, 4), CORAL_ROSE, { bone: c, at: offset(c.at, [0, 1, 0], 0.028) });
  }

  // ---------- rocks (scenery, rigid on root) ----------
  const rockPaint = mottle(ROCK, ROCK_D, { size: 0.09, seed: 9 });
  const rockL = b.joint("rockL", { parent: root, at: [-0.42, 0.1, -0.12] });
  b.part(new THREE.SphereGeometry(0.16, 9, 7), rockPaint, {
    bone: rockL,
    at: rockL.at,
    scale: [1.1, 0.75, 1],
  });
  b.part(new THREE.SphereGeometry(0.1, 8, 6), rockPaint, {
    bone: rockL,
    at: offset(rockL.at, [1, 0, 0], -0.13),
  });
  const rockR = b.joint("rockR", { parent: root, at: [0.44, 0.1, -0.2] });
  b.part(new THREE.SphereGeometry(0.14, 9, 7), rockPaint, {
    bone: rockR,
    at: rockR.at,
    scale: [1, 0.8, 1.1],
  });
  // octopus rock den with dark opening
  const den = b.joint("den", { parent: root, at: [0.38, 0.1, 0.28] });
  b.part(new THREE.SphereGeometry(0.13, 9, 7), rockPaint, {
    bone: den,
    at: den.at,
    scale: [1.15, 0.85, 1],
  });
  b.part(new THREE.SphereGeometry(0.055, 8, 6), "#4a3f52", {
    bone: den,
    at: offset(den.at, [0, 0, 1], 0.1),
  });

  // ---------- branching corals ----------
  const branchPaint = gradient(
    mottle(CORAL_PINK, "#f7c6d4", { size: 0.05, seed: 3 }),
    CORAL_ROSE,
    [0, 0.5, 0],
    [0, 0.1, 0],
  );
  function branchingCoral(base: [number, number, number], s: number, seed: number, tint: string | Paint) {
    const cb = b.joint(`coral${seed}`, { parent: root, at: base });
    const rr = rng(seed);
    b.sweep(
      bezier(cb.at, offset(cb.at, [0, 1, 0], 0.16 * s), offset(cb.at, [0.02, 1, 0.02], 0.3 * s)),
      [0.035 * s, 0.02 * s],
      {
        bone: cb,
        color: tint,
      },
    );
    for (let i = 0; i < 5; i++) {
      const t0: [number, number, number] = [
        base[0] + (rr() - 0.5) * 0.06,
        base[1] + 0.1 * s + rr() * 0.14 * s,
        base[2] + (rr() - 0.5) * 0.06,
      ];
      const dir: [number, number, number] = [(rr() - 0.5) * 1.4, 0.9, (rr() - 0.5) * 1.4];
      const tip = offset(t0, dir, 0.12 * s + rr() * 0.06);
      b.sprout(`twig${seed}_${i}`, frame(t0, dir), tip, [0.018 * s, 0.004], {
        count: 0,
        color: tint,
        caps: { end: "round" },
      });
      // pale polyp dots at tips
      b.part(new THREE.SphereGeometry(0.011 * s, 6, 4), "#fbe3ea", {
        bone: cb,
        at: tip,
      });
    }
  }
  branchingCoral([-0.3, 0.1, 0.12], 1.1, 21, branchPaint);
  branchingCoral([-0.12, 0.1, -0.28], 0.9, 22, mottle(CORAL_ORANGE, CORAL_RED, { size: 0.05, seed: 4 }));
  branchingCoral([0.24, 0.1, -0.05], 0.8, 23, mottle(CORAL_RED, "#f2a0b5", { size: 0.05, seed: 6 }));

  // ---------- brain coral ----------
  {
    const bb = b.joint("brain", { parent: root, at: [-0.05, 0.12, 0.3] });
    const brainPaint = spots(BRAIN, BRAIN_LINE, { size: 0.035, amount: 0.45, seed: 8 });
    b.part(new THREE.SphereGeometry(0.11, 12, 8), brainPaint, {
      bone: bb,
      at: bb.at,
      scale: [1, 0.62, 1],
    });
  }

  // ---------- sea fans (flat lacy slabs via extrude + svg texture cards) ----------
  const fanTex = svg(
    `<svg viewBox="0 0 64 64"><g stroke="#9a72c0" stroke-width="2.4" fill="none" opacity="0.95"><path d="M32 62 L32 6 M32 58 L10 20 M32 58 L54 20 M32 52 L16 34 M32 52 L48 34 M32 44 L22 28 M32 44 L42 28"/><circle cx="32" cy="6" r="3" fill="#9a72c0"/><circle cx="10" cy="20" r="2.4" fill="#9a72c0"/><circle cx="54" cy="20" r="2.4" fill="#9a72c0"/></g></svg>`,
    { size: 256 },
  );
  function seaFan(x: number, z: number, s: number, flip: boolean) {
    const fb = b.joint(`fan${x > 0 ? "R" : "L"}`, { parent: root, at: [x, 0.1, z] });
    b.rod(fb.at, offset(fb.at, [0, 1, 0], 0.1 * s), 0.012, { bone: fb, color: FAN_EDGE });
    b.extrude(
      [
        [0, 0],
        [0.16 * s, 0.05 * s],
        [0.13 * s, 0.22 * s],
        [0, 0.3 * s, "sharp"],
        [-0.13 * s, 0.22 * s],
        [-0.16 * s, 0.05 * s],
      ],
      {
        at: offset(fb.at, [0, 1, 0], 0.1 * s),
        x: [flip ? -1 : 1, 0, 0],
        thickness: 0.008,
        smoothing: 2,
        color: FAN,
        bone: fb,
      },
    );
    // lacy drawn overlay both faces
    for (const dz of [0.006, -0.006]) {
      b.part(new THREE.PlaneGeometry(0.3 * s, 0.3 * s), "#ffffff", {
        at: offset(offset(fb.at, [0, 1, 0], 0.1 * s + 0.15 * s), [0, 0, 1], dz),
        dir: [0, 0, flip ? -1 : 1],
        axis: "z",
        bone: fb,
        texture: fanTex,
      });
    }
  }
  seaFan(-0.52, -0.3, 1, false);
  seaFan(0.55, 0.05, 0.85, true);

  // ---------- anemones (lathe base + tentacle ring) ----------
  function anemone(x: number, z: number, s: number, seed: number) {
    const ab = b.joint(`anem${seed}`, { parent: root, at: [x, 0.11, z] });
    b.lathe(
      [
        [0, 0],
        [0.05 * s, 0],
        [0.055 * s, 0.02 * s],
        [0.04 * s, 0.05 * s],
        [0, 0.055 * s],
      ],
      { at: ab.at, bone: ab, color: ANEM, segments: 10 },
    );
    const tips = b.ring(frame(offset(ab.at, [0, 1, 0], 0.05 * s), [0, 1, 0]), {
      count: 9,
      radius: 0.032 * s,
    });
    for (const t of tips.items) {
      b.sweep(bezier(t.at, t.moved([0, 0.05 * s, 0]).at, t.moved([0, 0.09 * s, 0]).at), [0.009 * s, 0.006 * s], {
        bone: ab,
        color: gradient(ANEM, ANEM_TIP, ab.at, offset(ab.at, [0, 1, 0], 0.14 * s)),
      });
      b.part(new THREE.SphereGeometry(0.009 * s, 6, 4), ANEM_TIP, { bone: ab, at: t.moved([0, 0.09 * s, 0]).at });
    }
  }
  anemone(0.12, 0.32, 1, 31);
  anemone(-0.28, -0.08, 0.8, 32);
  anemone(0.52, -0.28, 0.9, 33);

  // ---------- kelp (tall wavy blades) ----------
  {
    const kb = b.joint("kelp", { parent: root, at: [-0.55, 0.1, 0.2] });
    for (let i = 0; i < 4; i++) {
      const bx = -0.55 + (i - 1.5) * 0.05;
      const top: [number, number, number] = [bx + (R() - 0.5) * 0.2, 0.55 + R() * 0.2, 0.2 + (R() - 0.5) * 0.14];
      b.sweep(catmull([[bx, 0.1, 0.2], [bx + 0.03, 0.3, 0.22], top]), [0.016, 0.006], {
        bone: kb,
        color: i % 2 ? KELP : KELP_D,
      });
      b.extrude(
        [
          [0, 0],
          [0.035, 0.02],
          [0.02, 0.12, "sharp"],
          [-0.03, 0.04],
        ],
        {
          at: offset(top, [0, 1, 0], -0.06),
          x: [1, 0, 0.3],
          thickness: 0.004,
          smoothing: 1,
          color: i % 2 ? KELP_D : KELP,
          bone: kb,
        },
      );
    }
  }

  // ---------- sunken anchor + chain ----------
  {
    const ab = b.joint("anchor", { parent: root, at: [0.18, 0.16, -0.38] });
    b.capsule(offset(ab.at, [0, 1, 0], -0.06), offset(ab.at, [0, 1, 0], 0.16), 0.02, { bone: ab, color: ANCHOR });
    b.rod(offset(ab.at, [-1, 0, 0], 0.09), offset(ab.at, [1, 0, 0], 0.09), 0.014, { bone: ab, color: ANCHOR_D });
    for (const sd of [1, -1]) {
      b.sweep(
        bezier(
          offset(ab.at, [1, 0, 0], sd * 0.09),
          offset(ab.at, [1, 0, 0], sd * 0.13),
          offset(ab.at, [0, 1, 0], -0.05),
        ),
        0.014,
        { bone: ab, color: ANCHOR },
      );
      b.spike(offset(ab.at, [0, 1, 0], -0.05), offset(ab.at, [1, 0.3, 0], sd * 0.05), null, 0.016, {
        bone: ab,
        color: ANCHOR,
      });
    }
    // chain: torus links trailing across sand
    const linkGeos: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 7; i++) {
      const g = new THREE.TorusGeometry(0.018, 0.006, 4, 8);
      g.rotateY((i % 2) * Math.PI * 0.5 + 0.3);
      g.translate(0.18 - i * 0.034, 0.128, -0.3 + i * 0.028);
      linkGeos.push(g);
    }
    b.part(mergeGeometries(linkGeos)!, ANCHOR_D, { bone: ab, at: [0, 0, 0] });
  }

  // ---------- treasure chest half in sand ----------
  {
    const cb = b.joint("chest", { parent: root, at: [-0.15, 0.12, 0.48] });
    const chestPaint = mottle(WOOD, WOOD_D, { size: 0.05, seed: 12 });
    b.part(new THREE.BoxGeometry(0.2, 0.11, 0.13), chestPaint, { bone: cb, at: cb.at });
    b.lathe(
      [
        [0, 0],
        [0.065, 0],
        [0.065, 0.05],
        [0, 0.07],
      ],
      { at: offset(cb.at, [0, 1, 0], 0.055), axis: [1, 0, 0], bone: cb, color: chestPaint, segments: 10 },
    );
    // gold bands
    for (const dx of [-0.06, 0.06]) {
      b.part(new THREE.BoxGeometry(0.02, 0.115, 0.135), GOLD_D, { bone: cb, at: offset(cb.at, [1, 0, 0], dx) });
    }
    // open lid leaning back + gold coins + pearl
    const lid = b.joint("lid", { parent: cb, at: offset(cb.at, [0, 1, 0], 0.05) });
    b.part(new THREE.BoxGeometry(0.2, 0.03, 0.13), chestPaint, {
      bone: lid,
      at: offset(offset(lid.at, [0, 1, 0], 0.06), [0, 0, -1], 0.1),
    });
    b.pose(lid, { axis: [1, 0, 0], deg: -62 });
    const coinGeos: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 10; i++) {
      const g = new THREE.CylinderGeometry(0.014, 0.014, 0.006, 8);
      g.translate(cb.at.x + (R() - 0.5) * 0.14, cb.at.y + 0.06 + R() * 0.015, cb.at.z + (R() - 0.5) * 0.08);
      coinGeos.push(g);
    }
    b.part(mergeGeometries(coinGeos)!, GOLD, { bone: lid, at: [0, 0, 0] });
    // spilled coins + goblet
    const spill: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 8; i++) {
      const g = new THREE.CylinderGeometry(0.014, 0.014, 0.006, 8);
      g.translate(-0.15 + 0.14 + R() * 0.12, 0.125, 0.48 + 0.1 + R() * 0.08);
      spill.push(g);
    }
    b.part(mergeGeometries(spill)!, GOLD, { bone: cb, at: [0, 0, 0] });
    b.lathe(
      [
        [0, 0],
        [0.03, 0],
        [0.012, 0.04],
        [0.025, 0.07],
        [0.02, 0.075],
      ],
      {
        at: [0.12, 0.12, 0.55],
        bone: cb,
        color: GOLD,
        segments: 10,
      },
    );
    b.part(new THREE.SphereGeometry(0.018, 8, 6), PEARL, { bone: cb, at: [0.05, 0.13, 0.6] });
    // little shell
    b.part(new THREE.SphereGeometry(0.025, 8, 6), SHELL, {
      bone: cb,
      at: [-0.32, 0.13, 0.55],
      scale: [1, 0.5, 1],
    });
  }

  // ================= TURTLE (rigged, swimming above reef) =================
  const turtleRoot = b.joint("turtle", { parent: root, at: [0, 0.95, 0.05] });
  const shellPaint = patches(TURTLE, TURTLE_D, { size: 0.07, seed: 15 });
  const shellMesh = b.part(new THREE.SphereGeometry(0.16, 12, 8), shellPaint, {
    bone: turtleRoot,
    at: turtleRoot.at,
    scale: [1, 0.55, 1.25],
  });
  b.part(new THREE.SphereGeometry(0.13, 10, 8), BELLY, {
    bone: turtleRoot,
    at: offset(turtleRoot.at, [0, -1, 0], 0.045),
    scale: [1, 0.4, 1.2],
  });
  const turtleSurf = b.surface(shellMesh);
  // shell rim spots
  for (const h of turtleSurf.scatter(8, { rng: rng(16), minDist: 0.08, filter: (hh) => hh.n.y > 0.4 })) {
    b.stick(new THREE.SphereGeometry(0.014, 6, 4), BELLY, h, { embed: 0.5 });
  }
  const tHead = b.joint("turtleNeck", {
    parent: turtleRoot,
    at: offset(turtleRoot.at, [0, 0, 1], 0.18),
    dir: [0, 0.1, 1],
    role: "neck",
  });
  const tSkull = b.joint("turtleHead", {
    parent: tHead,
    at: offset(tHead.at, [0, 0.02, 1], 0.07),
    dir: [0, 0, 1],
    role: "head",
  });
  b.sweep(polyline([tHead.at, tSkull.at]), [0.05, 0.055], { bone: tHead, color: TURTLE });
  b.part(new THREE.SphereGeometry(0.065, 10, 8), countershade(TURTLE, BELLY, { level: -0.2 }), {
    bone: tSkull,
    at: offset(tSkull.at, [0, 0, 1], 0.03),
    scale: [1, 0.85, 1.1],
  });
  const tJaw = b.joint("turtleJaw", {
    parent: tSkull,
    at: offset(tSkull.at, [0, -1, 0], 0.03),
    dir: [0, -0.2, 1],
    role: "jaw",
  });
  b.part(new THREE.SphereGeometry(0.045, 8, 6), BELLY, {
    bone: tJaw,
    at: offset(tJaw.at, [0, 0, 1], 0.045),
    scale: [0.9, 0.4, 1],
  });
  // friendly eyes + cheeks
  for (const s of [1, -1]) {
    const eyeAt = tSkull.local([s * -0.045, 0.07, 0.03]);
    b.part(new THREE.SphereGeometry(0.016, 8, 6), EYE_W, { bone: tSkull, at: eyeAt });
    b.part(new THREE.SphereGeometry(0.008, 6, 4), EYE_B, {
      bone: tSkull,
      at: offset(eyeAt, [0, 0, 1], 0.011),
    });
    b.part(new THREE.SphereGeometry(0.011, 6, 4), CHEEK, {
      bone: tSkull,
      at: tSkull.local([s * -0.06, 0.045, -0.015]),
    });
  }
  // flippers: chains so they can flap
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = offset(turtleRoot.at, [1, 0, 0], s * 0.12);
    const fch = b.chain(
      `flipper${side}`,
      catmull([sh, offset(sh, [1, 0.1, 0], s * 0.12), offset(sh, [1, 0.15, 0.1], s * 0.24)]),
      {
        parent: turtleRoot,
        count: 2,
        role: "arm",
        names: [`shoulder${side}`, `flipper${side}`],
      },
    );
    b.sweep(fch, [0.045, 0.012], { color: countershade(TURTLE, BELLY, { level: -0.3 }) });
    const ftip = offset(sh, [1, 0.1, 0.1], s * 0.24);
    b.slab([sh, offset(ftip, [0, 0, -1], 0.09), offset(ftip, [0, 0, 1], 0.02)], {
      color: TURTLE_D,
      thickness: 0.014,
      bone: fch.joints[1],
    });
  }
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip = offset(turtleRoot.at, [1, 0, -1], s * 0.1);
    const hch = b.chain(`legT${side}`, polyline([hip, offset(hip, [1, 0, -1], s * 0.1)]), {
      parent: turtleRoot,
      count: 1,
      role: "leg",
      names: [`hipT${side}`],
    });
    b.sweep(hch, [0.035, 0.015], { color: TURTLE });
  }
  const tTail = b.chain(
    "tailT",
    polyline([offset(turtleRoot.at, [0, 0, -1], 0.19), offset(turtleRoot.at, [0, 0, -1], 0.3)]),
    {
      parent: turtleRoot,
      count: 1,
      role: "tail",
      names: ["tailT"],
    },
  );
  b.sweep(tTail, [0.025, 0.008], { color: TURTLE });

  // ================= FISH SCHOOL (rigged, striped) =================
  const fishStripe = stripes(FISH_B, FISH_S, { size: 0.05, axis: [0, 0, 1], seed: 20 });
  function fish(name: string, pos: [number, number, number], seed: number, yellow: boolean) {
    const spine = b.chain(`${name}Spine`, catmull([offset(pos, [0, 0, -1], 0.09), pos, offset(pos, [0, 0, 1], 0.09)]), {
      parent: root,
      count: 2,
      role: "spine",
      names: [`${name}Back`, `${name}Body`],
    });
    const bodyC = yellow ? FISH_Y : fishStripe;
    b.sweep(spine, (t) => 0.045 * Math.sin(Math.PI * (0.15 + 0.7 * t)) + 0.008, { color: bodyC });
    const headJ = b.joint(`${name}Head`, {
      parent: spine.joints[1],
      at: offset(pos, [0, 0, 1], 0.09),
      dir: [0, 0, 1],
      role: "head",
    });
    b.part(new THREE.SphereGeometry(0.035, 8, 6), bodyC, {
      bone: headJ,
      at: offset(headJ.at, [0, 0, 1], 0.02),
      scale: [0.9, 1, 1.1],
    });
    const jaw = b.joint(`${name}Jaw`, {
      parent: headJ,
      at: offset(headJ.at, [0, -1, 0], 0.02),
      dir: [0, -0.3, 1],
      role: "jaw",
    });
    b.part(new THREE.SphereGeometry(0.02, 6, 4), yellow ? "#e8a83e" : FISH_S, {
      bone: jaw,
      at: offset(jaw.at, [0, 0, 1], 0.03),
      scale: [0.9, 0.4, 0.9],
    });
    for (const s of [1, -1]) {
      const e = headJ.local([s * -0.025, 0.035, 0.012]);
      b.part(new THREE.SphereGeometry(0.009, 6, 4), EYE_W, { bone: headJ, at: e });
      b.part(new THREE.SphereGeometry(0.0045, 6, 4), EYE_B, { bone: headJ, at: offset(e, [0, 0, 1], 0.006) });
    }
    // tail fin joint + fan tail
    const tailJ = b.joint(`${name}Tail`, {
      parent: spine.joints[0],
      at: offset(pos, [0, 0, -1], 0.09),
      dir: [0, 0, -1],
      role: "tail",
    });
    b.extrude(
      [
        [0, 0.045],
        [0.05, 0.01],
        [0.05, -0.01],
        [0, -0.045, "sharp"],
        [-0.015, 0],
      ],
      {
        at: offset(tailJ.at, [0, 0, -1], 0.05),
        x: [0, 0, -1],
        thickness: 0.008,
        smoothing: 1,
        color: yellow ? "#e8a83e" : FISH_S,
        bone: tailJ,
      },
    );
    // dorsal fin
    b.extrude(
      [
        [0, 0],
        [0.05, 0],
        [0.025, 0.035, "sharp"],
      ],
      {
        at: offset(pos, [0, 1, 0], 0.04),
        x: [0, 0, 1],
        thickness: 0.006,
        smoothing: 1,
        color: yellow ? "#e8a83e" : FISH_S,
        bone: spine.joints[1],
      },
    );
    void seed;
  }
  fish("fishA", [-0.25, 0.72, 0.15], 41, false);
  fish("fishB", [-0.05, 0.78, 0.22], 42, false);
  fish("fishC", [0.15, 0.7, 0.12], 43, false);
  fish("fishD", [0.32, 0.8, -0.05], 44, true);
  fish("fishE", [-0.12, 0.62, -0.1], 45, true);

  // ================= OCTOPUS (rigged, peeking from den) =================
  const octoBase: [number, number, number] = [0.3, 0.2, 0.36];
  const octoRoot = b.joint("octo", { parent: den, at: octoBase });
  b.part(new THREE.SphereGeometry(0.07, 12, 10), mottle(OCTO, OCTO_L, { size: 0.04, seed: 25 }), {
    bone: octoRoot,
    at: offset(octoBase, [0, 1, 0], 0.06),
    scale: [1, 1.15, 1],
  });
  const octoHead = b.joint("octoHead", {
    parent: octoRoot,
    at: offset(octoBase, [0, 1, 0], 0.13),
    dir: [0, 1, 0.3],
    role: "head",
  });
  for (const s of [1, -1]) {
    const e = octoHead.local([s * -0.045, 0.03, -0.05]);
    b.part(new THREE.SphereGeometry(0.018, 8, 6), EYE_W, { bone: octoHead, at: e });
    b.part(new THREE.SphereGeometry(0.009, 6, 4), EYE_B, { bone: octoHead, at: offset(e, [0, 0, 1], 0.012) });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), CHEEK, {
      bone: octoHead,
      at: octoHead.local([s * -0.06, -0.02, -0.035]),
    });
  }
  const octoJaw = b.joint("octoJaw", {
    parent: octoHead,
    at: offset(octoHead.at, [0, -0.3, 1], 0.03),
    dir: [0, -0.3, 1],
    role: "jaw",
  });
  b.part(new THREE.SphereGeometry(0.03, 8, 6), OCTO_L, {
    bone: octoJaw,
    at: offset(octoJaw.at, [0, 0, 1], 0.02),
    scale: [1, 0.45, 1],
  });
  // 8 curling arms, each a 2-joint tentacle chain
  {
    const armRing = b.ring(frame(octoBase, [0, -1, 0]), { count: 8, radius: 0.05 });
    armRing.items.forEach((item, i) => {
      const out = item.outward;
      const tipP = offset(item.at, out, 0.16);
      const midP = offset(offset(item.at, out, 0.09), [0, 1, 0], -0.02);
      const ch = b.chain(`arm${i}`, catmull([item.at, midP, [tipP.x, 0.12, tipP.z]]), {
        parent: octoRoot,
        count: 2,
        role: "tentacle",
        names: [`arm${i}Base`, `arm${i}Mid`],
      });
      b.sweep(ch, [0.02, 0.006], { color: gradient(OCTO, OCTO_L, item.at, midP) });
      // suckers: small pale dots along underside
      b.along(ch, 3, (at) => {
        b.stick(new THREE.SphereGeometry(0.007, 6, 4), PEARL, at, { embed: 0.4 });
      });
    });
  }

  // ---------- bubbles (picture-book dots rising) ----------
  {
    const geos: THREE.BufferGeometry[] = [];
    const br = rng(77);
    for (let i = 0; i < 12; i++) {
      const g = new THREE.SphereGeometry(0.008 + br() * 0.012, 6, 4);
      g.translate((br() - 0.5) * 1.0, 0.35 + br() * 0.6, (br() - 0.5) * 0.8);
      geos.push(g);
    }
    b.part(mergeGeometries(geos)!, "#cfe6f2", { bone: root, at: [0, 0, 0] });
  }

  return b.root;
}
