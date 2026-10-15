import * as THREE from "three";
import {
  createBuilder,
  frame,
  line,
  rng,
  offset,
  catmull,
  bezier,
  arc,
  limb,
  mottle,
  grain,
  stripes,
  patches,
  svg,
} from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dwarf Rifleman",
  description:
    "Stout Ironforge-style dwarf rifleman with a braided ginger beard, horned steel helm, spiked pauldrons, bandolier and a flared brass blunderbuss with glowing runes, standing on a snowy stone plinth with banner, keg and pine.",
};

// The character stands on a 7 cm plinth; every character height is lifted by FY.
const FY = 0.07;
type T3 = [number, number, number];
const P = (x: number, y: number, z: number): T3 => [x, y + FY, z];
const PV = (x: number, y: number, z: number) => new THREE.Vector3(x, y + FY, z);

export default function build() {
  const b = createBuilder({ name: "dwarf_rifleman" });

  // ---------------------------------------------------------------- palette
  const SKIN = mottle("#e3a27e", "#cf8764", { size: 0.06, seed: 3 });
  const NOSE = mottle("#e08a6a", "#c96f55", { size: 0.04, seed: 8 });
  const BEARD = grain("#e58a2a", "#a9460f", { size: 0.012, axis: "y", seed: 4 });
  const BEARD_HI = "#f0a345";
  const BEARD_LO = "#b9561a";
  const COAT = mottle("#2b4a8d", "#37589f", { size: 0.07, seed: 5 });
  const PANTS = mottle("#5d4731", "#6c5339", { size: 0.05, seed: 9 });
  const LEATHER = mottle("#6d4326", "#80542f", { size: 0.05, seed: 6 });
  const LEATHER_D = mottle("#3e2615", "#4f311b", { size: 0.05, seed: 7 });
  const GLOVE = mottle("#4a2d19", "#5d3a21", { size: 0.03, seed: 12 });
  const STEEL = metal("steel", { tarnish: 0.12 });
  const BLUED = metal("blued");
  const BRASS = metal("brass", { tarnish: 0.2 });
  const GILT = metal("gilt");
  const IRONP = metal("iron");
  const FUR = mottle("#f1ede2", "#bdb5a5", { size: 0.04, seed: 14 });
  const HORN = grain("#efe4c8", "#c8b68c", { size: 0.01, axis: "y", seed: 15 });
  const STONE = patches("#4c515d", ["#6f7686", "#626879", "#7c8394"], { size: 0.15, gap: 0.07, seed: 2 });
  const ROCK = mottle("#5c6270", "#7c8393", { size: 0.08, seed: 21 });
  const SNOW = mottle("#f6f9ff", "#cddff0", { size: 0.1, seed: 22 });
  const SOLE = "#2a1a10";
  const DARK = "#0d0d12";
  const RED = "#b82a1e";
  const WHITE = "#f4efe6";
  const GOLD = "#e8b84a";

  // ---------------------------------------------------------------- textures
  const EYE = svg(
    `<svg viewBox="0 0 40 28"><path d="M2 16 Q20 -2 38 16 Q20 30 2 16Z" fill="#f4efe6" stroke="#3a1c10" stroke-width="2.4" stroke-linejoin="round"/><circle cx="21" cy="15" r="7.5" fill="#3e8fd0"/><circle cx="21" cy="15" r="7.5" fill="none" stroke="#1f4c80" stroke-width="1.5"/><circle cx="21" cy="15" r="3.4" fill="#0c0c12"/><circle cx="23.6" cy="12.4" r="1.9" fill="#ffffff"/><path d="M2 15 Q20 -4 38 15" fill="none" stroke="#3a1c10" stroke-width="3.4" stroke-linecap="round"/></svg>`,
    { size: 256 },
  );
  const TABARD = svg(
    `<svg viewBox="0 0 100 130"><path d="M4 2 H96 V104 L50 128 L4 104 Z" fill="#2a4a96" stroke="#e8b84a" stroke-width="5" stroke-linejoin="round"/><path d="M13 11 H87 V99 L50 118 L13 99 Z" fill="none" stroke="#e8b84a" stroke-width="1.8"/><path d="M20 84 L41 44 L51 58 L60 40 L80 84 Z" fill="#eef4ff" stroke="#1b2f66" stroke-width="2" stroke-linejoin="round"/><line x1="24" y1="30" x2="76" y2="96" stroke="#6b3c18" stroke-width="5" stroke-linecap="round"/><line x1="76" y1="30" x2="24" y2="96" stroke="#6b3c18" stroke-width="5" stroke-linecap="round"/><rect x="45" y="22" width="10" height="52" fill="#c9962f" stroke="#6a4a12" stroke-width="1.5"/><rect x="33" y="14" width="34" height="15" rx="2" fill="#f4d070" stroke="#6a4a12" stroke-width="2"/></svg>`,
    { size: 256 },
  );
  const BADGE = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#f0c050" stroke="#7a5418" stroke-width="3"/><circle cx="32" cy="32" r="22" fill="#24418a" stroke="#7a5418" stroke-width="2"/><path d="M14 46 L28 24 L34 32 L40 22 L50 46Z" fill="#eef4ff"/><rect x="30" y="13" width="5" height="24" fill="#f0c050"/><rect x="24" y="10" width="17" height="8" rx="1.5" fill="#f4d070" stroke="#7a5418" stroke-width="1.2"/></svg>`,
    { size: 128 },
  );
  const glyphs = [
    (x: number) => `M${x} 4 V26 M${x} 10 L${x + 10} 4`,
    (x: number) => `M${x} 4 V26 M${x} 8 L${x + 9} 15 L${x} 22`,
    (x: number) => `M${x} 26 L${x + 5} 4 L${x + 10} 26 M${x + 1} 17 H${x + 9}`,
    (x: number) => `M${x} 4 H${x + 10} L${x} 26 H${x + 10}`,
    (x: number) => `M${x + 5} 4 V26 M${x} 10 L${x + 5} 15 L${x + 10} 10`,
  ];
  let runePath = "";
  for (let i = 0; i < 7; i++) runePath += glyphs[(i * 3) % 5](8 + i * 27);
  const RUNES = svg(
    `<svg viewBox="0 0 200 30"><path d="${runePath}" fill="none" stroke="#ff8a24" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    { size: 512 },
  );
  const TUFT = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 64 C6 46 8 22 14 2 C18 20 26 40 16 64Z" fill="#f5f1e6"/><path d="M8 64 C2 52 2 36 6 22 C10 38 14 50 8 64Z" fill="#d9d3c4"/><path d="M24 64 C30 52 30 40 28 26 C22 40 20 52 24 64Z" fill="#e6e0d2"/></svg>`,
    { size: 128 },
  );
  const GRASS = svg(
    `<svg viewBox="0 0 32 40"><path d="M16 40 C14 28 10 16 6 4 C14 14 18 26 16 40Z" fill="#5b8a6a"/><path d="M16 40 C18 24 22 14 28 6 C26 20 22 30 16 40Z" fill="#6f9f7b"/><path d="M16 40 C15 26 15 14 16 2 C19 14 19 28 16 40Z" fill="#8fbf95"/><path d="M6 4 L7 8 L9 6Z M16 2 L15 7 L18 6Z M28 6 L26 11 L29 10Z" fill="#f2f8ff"/></svg>`,
    { size: 128 },
  );
  const LABEL = svg(
    `<svg viewBox="0 0 80 44"><rect x="2" y="2" width="76" height="40" rx="5" fill="#e9dcb4" stroke="#3a2412" stroke-width="3"/><text x="40" y="19" text-anchor="middle" font-family="serif" font-weight="bold" font-size="13" fill="#2a1608">BLACK</text><text x="40" y="35" text-anchor="middle" font-family="serif" font-weight="bold" font-size="13" fill="#7a1a10">POWDER</text></svg>`,
    { size: 256 },
  );
  const BANNER = svg(
    `<svg viewBox="0 0 100 150"><path d="M2 2 H98 V120 L50 148 L2 120 Z" fill="#8f1d22" stroke="#e8b84a" stroke-width="5" stroke-linejoin="round"/><path d="M12 12 H88 V112 L50 134 L12 112 Z" fill="none" stroke="#e8b84a" stroke-width="2"/><path d="M18 100 L40 56 L52 72 L62 50 L84 100 Z" fill="#f2f6ff" stroke="#4a0e12" stroke-width="2" stroke-linejoin="round"/><rect x="45" y="24" width="10" height="64" fill="#d9a63a" stroke="#5a3a0a" stroke-width="1.5"/><rect x="31" y="18" width="38" height="17" rx="2" fill="#f4d070" stroke="#5a3a0a" stroke-width="2"/></svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: P(0, 0.5, 0), role: "spine" });
  const spine = b.chain("spine", catmull([P(0, 0.58, 0), P(0, 0.76, 0.01), P(0, 0.92, 0.02)]), {
    parent: hips,
    names: ["spine", "chest"],
    role: "spine",
  });
  const chest = spine.joints[1];
  const neck = b.joint("neck", { parent: chest, at: P(0, 0.92, 0.02), aim: P(0, 1.0, 0.05), role: "neck" });
  const head = b.joint("head", { parent: neck, at: P(0, 1.0, 0.05), dir: [0, 1, 0.12], role: "head" });
  const H = (o: { up?: number; forward?: number; back?: number; left?: number; right?: number; down?: number }) =>
    head.local(o);
  const HL = (l: number, u: number, f: number) => head.local({ left: l, up: u, forward: f });
  const jaw = b.joint("jaw", {
    parent: head,
    at: H({ up: 0.04, back: 0.02 }),
    aim: H({ up: 0.01, forward: 0.1 }),
    role: "jaw",
  });

  // ---------------------------------------------------------------- legs and boots
  const legR = (t: number) => (t < 0.5 ? 0.098 - 0.028 * (t * 2) : 0.07 + 0.018 * ((t - 0.5) * 2));
  const fwdKnee = new THREE.Vector3(0, 0.15, 1).normalize();
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const pts = limb(P(s * 0.11, 0.5, 0), P(s * 0.12, 0.1, 0.02), [0.22, 0.22], [[0, 0, 1]]);
    const leg = b.chain(`leg${L}`, pts, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`],
      role: "leg",
    });
    b.sweep(leg, legR, {
      bands: [
        [0.6, PANTS],
        [1, LEATHER_D],
      ],
      sides: 8,
      smooth: false,
    });
    // folded boot cuff
    b.sweep(leg, (t: number) => legR(t) + 0.016, {
      from: 0.6,
      to: 0.72,
      color: LEATHER,
      caps: "flat",
      sides: 8,
      smooth: false,
    });
    // knee guard
    const kneeAt = offset(pts[1], fwdKnee, 0.05);
    b.part(new THREE.SphereGeometry(1, 6, 4), STEEL, {
      bone: leg.joints[1],
      at: kneeAt,
      dir: fwdKnee,
      axis: "z",
      scale: [0.058, 0.052, 0.034],
    });
    b.part(new THREE.SphereGeometry(0.014, 5, 3), GILT, {
      bone: leg.joints[1],
      at: offset(pts[1], fwdKnee, 0.08),
    });
    b.spike(offset(pts[1], fwdKnee, 0.07), fwdKnee, 0.05, 0.014, {
      color: GILT,
      bone: leg.joints[1],
      sides: 5,
      smooth: false,
    });
    // boot
    const ank = leg.tip!;
    b.part(new THREE.BoxGeometry(0.155, 0.035, 0.3), SOLE, { bone: ank, at: P(s * 0.12, 0.0175, 0.07) });
    b.part(new THREE.BoxGeometry(0.138, 0.075, 0.26), LEATHER_D, { bone: ank, at: P(s * 0.12, 0.072, 0.06) });
    b.part(new THREE.SphereGeometry(1, 7, 5), LEATHER_D, {
      bone: ank,
      at: P(s * 0.12, 0.052, 0.19),
      scale: [0.072, 0.05, 0.085],
    });
    b.part(new THREE.BoxGeometry(0.15, 0.012, 0.035), LEATHER, { bone: ank, at: P(s * 0.12, 0.112, 0.1) });
    b.part(new THREE.BoxGeometry(0.03, 0.016, 0.03), BRASS, { bone: ank, at: P(s * 0.12, 0.12, 0.1) });
    b.part(new THREE.BoxGeometry(0.15, 0.012, 0.035), LEATHER, { bone: ank, at: P(s * 0.12, 0.1, 0.17) });
    b.part(new THREE.BoxGeometry(0.03, 0.016, 0.03), BRASS, { bone: ank, at: P(s * 0.12, 0.108, 0.17) });
    // hip plate (tasset)
    b.extrude(
      [
        [-0.09, 0],
        [0.09, 0],
        [0.075, -0.14],
        [0, -0.18],
        [-0.075, -0.14],
      ],
      {
        at: P(s * 0.225, 0.62, 0.02),
        x: [0, 0, 1],
        y: [s * 0.25, 1, 0],
        thickness: 0.016,
        bevel: 0.004,
        color: STEEL,
        bone: hips,
      },
    );
    b.part(new THREE.SphereGeometry(0.012, 5, 3), GILT, { bone: hips, at: P(s * 0.236, 0.58, 0.02) });
  }

  // ---------------------------------------------------------------- torso, belt, bandolier
  b.part(new THREE.SphereGeometry(1, 8, 6), PANTS, { bone: hips, at: P(0, 0.5, 0), scale: [0.19, 0.1, 0.13] });
  const torso = b.loft(
    [
      { at: P(0, 0.48, 0), w: 0.3, h: 0.2 },
      { at: P(0, 0.58, 0.005), w: 0.34, h: 0.23 },
      { at: P(0, 0.72, 0.015), w: 0.37, h: 0.26 },
      { at: P(0, 0.86, 0.02), w: 0.42, h: 0.27 },
      { at: P(0, 0.94, 0.015), w: 0.36, h: 0.22 },
    ],
    { bone: [hips, spine], color: COAT },
  );
  const skinT = b.surface(torso);

  b.capsule(P(0, 0.9, 0.02), P(0, 1.0, 0.05), 0.075, { color: SKIN, bone: neck });

  const waist = skinT.loop(P(0, 0.6, 0), { dir: [0, 1, 0], lift: 0.006 });
  b.sweep(waist, 0.032, { color: LEATHER, sides: 6, smooth: false });
  const studPath = skinT.loop(P(0, 0.6, 0), { dir: [0, 1, 0], lift: 0.034 });
  b.along(studPath, 18, (at) => b.part(new THREE.SphereGeometry(0.01, 5, 3), BRASS, { at }));
  const bh = skinT.ray(P(0, 0.6, 1), [0, 0, -1])!;
  const buckleAt = bh.moved([0, 0.044, 0]);
  b.part(new THREE.BoxGeometry(0.1, 0.014, 0.075), GILT, { frame: buckleAt, bone: hips });
  b.part(new THREE.PlaneGeometry(0.06, 0.06), WHITE, {
    at: bh.moved([0, 0.053, 0]),
    dir: bh.n,
    axis: "z",
    texture: BADGE,
    bone: hips,
  });

  // tabard hanging from the belt (front and back faces)
  const tz = bh.at.z + 0.05;
  b.part(new THREE.PlaneGeometry(0.2, 0.26), WHITE, {
    bone: hips,
    at: [0, 0.47 + FY, tz],
    dir: [0, 0, 1],
    axis: "z",
    texture: TABARD,
  });
  b.part(new THREE.PlaneGeometry(0.2, 0.26), WHITE, {
    bone: hips,
    at: [0, 0.47 + FY, tz - 0.004],
    dir: [0, 0, -1],
    axis: "z",
    texture: TABARD,
  });

  // bandolier with brass cartridges
  const strapRough = catmull([P(-0.2, 1.0, 0.0), P(-0.17, 0.9, 0.14), P(-0.06, 0.78, 0.2), P(0.07, 0.66, 0.2), P(0.19, 0.56, 0.12)]);
  const strapPath = skinT.drape(strapRough, { lift: 0.014 });
  b.sweep(strapPath, 0.02, { color: LEATHER_D, sides: 6, smooth: false });
  for (let i = 0; i < 7; i++) {
    const t = (i + 0.5) / 7;
    const pos = strapPath.at(t);
    const tan = strapPath.tangentAt(t);
    const h = skinT.nearest(pos);
    const side = h.n.clone().cross(tan).normalize();
    b.part(new THREE.CylinderGeometry(0.0125, 0.0125, 0.065, 6), BRASS, {
      at: h.moved([0, 0.03, 0]),
      dir: side,
    });
    b.part(new THREE.ConeGeometry(0.0125, 0.03, 6), "#8a8f9c", {
      at: offset(h.moved([0, 0.03, 0]), side, 0.047),
      dir: side,
    });
  }

  // ---------------------------------------------------------------- head
  const skull = b.part(new THREE.SphereGeometry(1, 10, 7), SKIN, {
    bone: head,
    at: H({ up: 0.1, forward: 0.015 }),
    scale: [0.125, 0.12, 0.13],
  });
  b.part(new THREE.SphereGeometry(1, 7, 5), NOSE, {
    bone: head,
    at: H({ up: 0.073, forward: 0.145 }),
    scale: [0.042, 0.042, 0.05],
  });
  b.part(new THREE.BoxGeometry(0.13, 0.065, 0.15), SKIN, { bone: jaw, at: H({ up: -0.012, forward: 0.07 }) });
  b.part(new THREE.BoxGeometry(0.12, 0.05, 0.14), SKIN, { bone: head, at: H({ up: 0.04, forward: 0.075 }) });
  b.part(new THREE.BoxGeometry(0.05, 0.012, 0.01), "#3a1410", { bone: head, at: H({ up: 0.022, forward: 0.15 }) });
  b.part(new THREE.BoxGeometry(0.08, 0.012, 0.008), WHITE, { bone: jaw, at: H({ up: 0.018, forward: 0.146 }) });
  b.part(new THREE.SphereGeometry(1, 7, 5), BEARD, {
    bone: head,
    at: H({ back: 0.095, up: 0.06 }),
    scale: [0.105, 0.095, 0.085],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 6, 4), SKIN, {
      bone: head,
      at: HL(s * 0.075, 0.06, 0.09),
      scale: [0.05, 0.05, 0.05],
    });
    // ears with gold hoops
    b.part(new THREE.SphereGeometry(1, 6, 4), SKIN, {
      bone: head,
      at: HL(s * 0.128, 0.075, -0.005),
      scale: [0.016, 0.035, 0.028],
    });
    b.part(new THREE.TorusGeometry(0.012, 0.0035, 4, 8), GILT, {
      bone: head,
      at: HL(s * 0.132, 0.04, -0.005),
      dir: [1, 0, 0],
      axis: "z",
    });
    // bushy brows
    b.capsule(HL(s * 0.012, 0.135, 0.125), HL(s * 0.078, 0.152, 0.082), [0.024, 0.015], {
      color: BEARD,
      bone: head,
      sides: 6,
    });
    // eyes
    b.decal(skull, EYE, {
      at: HL(s * 0.05, 0.1, 0.13),
      dir: [s * 0.2, 0, 1],
      size: [0.085, 0.06],
      mirror: s > 0,
      bone: head,
    });
    // handlebar moustache
    b.sweep(
      catmull([HL(0, 0.04, 0.158), HL(s * 0.05, 0.028, 0.164), HL(s * 0.1, 0.02, 0.148), HL(s * 0.135, 0.042, 0.115), HL(s * 0.14, 0.078, 0.095)]),
      [0.042, 0.012],
      { color: BEARD, bone: head, sides: 6, smooth: false },
    );
    // sideburns
    b.capsule(HL(s * 0.115, 0.1, 0.03), HL(s * 0.105, 0.0, 0.1), [0.025, 0.04], {
      color: BEARD,
      bone: head,
      sides: 6,
    });
  }
  // nasal guard
  b.rod(H({ up: 0.17, forward: 0.14 }), H({ up: 0.095, forward: 0.19 }), 0.011, {
    color: STEEL,
    bone: head,
    sides: 6,
  });

  // helmet
  const helmAt = H({ up: 0.15 });
  b.lathe(
    [
      [0, 0],
      [0.145, 0],
      [0.15, 0.02],
      [0.135, 0.06],
      [0.1, 0.1],
      [0.05, 0.125],
      [0, 0.13],
    ],
    { at: helmAt, axis: [0, 1, 0], segments: 10, smoothing: 1, color: STEEL, bone: head },
  );
  b.lathe(
    [
      [0.13, 0],
      [0.178, 0.004],
      [0.178, 0.016],
      [0.13, 0.022],
    ],
    { at: H({ up: 0.155 }), axis: [0, 1, 0], segments: 12, color: BLUED, bone: head },
  );
  b.lathe(
    [
      [0.14, 0],
      [0.153, 0],
      [0.153, 0.032],
      [0.14, 0.032],
    ],
    { at: H({ up: 0.16 }), axis: [0, 1, 0], segments: 12, color: GILT, bone: head },
  );
  b.ring(frame(H({ up: 0.18 }), [0, 1, 0]), { count: 10, radius: 0.148 }, (it) =>
    b.stick(new THREE.SphereGeometry(0.011, 5, 3), BRASS, it, { embed: 0.4, bone: head }),
  );
  b.extrude(
    [
      [-0.14, 0],
      [0.12, 0],
      [0.1, 0.03],
      [0.02, 0.07],
      [-0.06, 0.09],
      [-0.12, 0.06],
    ],
    { at: H({ up: 0.268 }), x: [0, 0, 1], thickness: 0.022, bevel: 0.004, smoothing: 1, color: RED, bone: head },
  );
  b.part(new THREE.SphereGeometry(0.016, 5, 3), GILT, { bone: head, at: H({ up: 0.28, forward: 0.0 }) });
  glow(
    b.part(new THREE.OctahedronGeometry(0.02, 0), "#4fc3ff", {
      bone: head,
      at: H({ up: 0.178, forward: 0.158 }),
      scale: [1, 1.2, 0.7],
      flat: true,
    }),
    1.8,
  );
  for (const s of [1, -1]) {
    b.sweep(bezier(HL(s * 0.135, 0.2, 0.0), HL(s * 0.22, 0.24, 0.0), HL(s * 0.215, 0.35, 0.0)), [0.032, 0.004], {
      color: HORN,
      bone: head,
      sides: 6,
      caps: { start: "flat", end: "point" },
    });
    b.part(new THREE.TorusGeometry(0.03, 0.007, 4, 8), GILT, {
      bone: head,
      at: HL(s * 0.153, 0.215, 0.0),
      dir: [s * 0.8, 0.5, 0],
      axis: "z",
    });
  }

  // ---------------------------------------------------------------- beard and braids
  const beard = b.loft(
    [
      { at: P(0, 1.02, 0.14), w: 0.22, h: 0.1 },
      { at: P(0, 0.94, 0.19), w: 0.27, h: 0.13 },
      { at: P(0, 0.84, 0.215), w: 0.27, h: 0.13 },
      { at: P(0, 0.74, 0.22), w: 0.2, h: 0.11 },
      { at: P(0, 0.66, 0.2), w: 0.08, h: 0.07 },
    ],
    { bone: jaw, color: BEARD },
  );
  const bsk = b.surface(beard);
  const locks = bsk.scatter(18, {
    rng: rng(21),
    minDist: 0.05,
    filter: (h) => h.n.z > 0.2 && h.at.y > 0.7 + FY,
  });
  locks.forEach((h, i) =>
    b.spike(h, [0, -1, 0.2], 0.1, 0.022, { color: i % 2 ? BEARD_HI : BEARD_LO, bone: jaw, sides: 5, smooth: false }),
  );
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const braid = b.chain(
      `braid${L}`,
      catmull([P(s * 0.07, 0.78, 0.23), P(s * 0.075, 0.68, 0.255), P(s * 0.07, 0.56, 0.255), P(s * 0.06, 0.46, 0.25)]),
      { parent: head, count: 3, names: [`braid${L}1`, `braid${L}2`, `braid${L}3`], role: "tail" },
    );
    b.sweep(braid, [0.03, 0.02], { color: BEARD_LO, sides: 6, smooth: false });
    let k = 0;
    b.along(braid, 10, (at) => {
      k++;
      b.stick(new THREE.SphereGeometry(0.03, 6, 4), k % 2 ? BEARD_HI : BEARD, at, {
        embed: 0.5,
        spin: k % 2 ? 40 : -40,
        scale: [1.2, 1.0, 0.55],
      });
    });
    for (const t of [0.4, 0.97]) {
      const cp = braid.at(t);
      b.part(new THREE.TorusGeometry(0.026 - 0.006 * t, 0.009, 5, 8), GILT, { at: cp, dir: cp, axis: "z" });
    }
    b.spike(braid.at(0.99), [0, -1, 0.05], 0.075, 0.022, { color: BEARD_HI, sides: 5, smooth: false });
    b.part(new THREE.SphereGeometry(0.014, 5, 3), "#3d7fd0", { at: braid.at(0.69), bone: braid.joints[2] });
  }

  // ---------------------------------------------------------------- arms and hands
  const arms: { arm: ReturnType<typeof b.chain>; pts: THREE.Vector3[]; fist: THREE.Vector3; s: number }[] = [];
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const tgt = s > 0 ? P(-0.06, 0.8, 0.5) : P(-0.16, 0.76, 0.3);
    const pts = limb(P(s * 0.25, 0.88, 0), tgt, [0.3, 0.3], [[s, -0.6, -0.3]]);
    const arm = b.chain(`arm${L}`, pts, {
      parent: chest,
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`],
      role: "arm",
    });
    b.sweep(arm, [0.085, 0.076, 0.066, 0.06, 0.055], {
      bands: [
        [0.55, COAT],
        [1, SKIN],
      ],
      sides: 8,
      smooth: false,
    });
    b.rod(arm.at(0.6), arm.at(0.9), [0.067, 0.059], { color: STEEL, sides: 8, smooth: false });
    for (const t of [0.6, 0.9]) {
      const cp = arm.at(t);
      b.part(new THREE.TorusGeometry(t < 0.7 ? 0.068 : 0.06, 0.008, 4, 8), GILT, { at: cp, dir: cp, axis: "z" });
    }
    const wrist = pts[2];
    const el = pts[1];
    const fist = wrist.clone().add(wrist.clone().sub(el).normalize().multiplyScalar(0.05));
    arms.push({ arm, pts, fist, s });
  }
  const armL = arms.find((a) => a.s > 0)!;
  const armR = arms.find((a) => a.s < 0)!;
  const fistR = armR.fist;
  const fistL = armL.fist;

  // gun frame: origin at the right fist, axis toward the left fist
  const Yv = new THREE.Vector3(0, 1, 0);
  const Dg = fistL.clone().sub(fistR).normalize();
  const Lg = new THREE.Vector3().crossVectors(Yv, Dg).normalize();
  const Ug = new THREE.Vector3().crossVectors(Dg, Lg).normalize();
  const Rg = Lg.clone().negate();
  const gp = (d: number, u = 0, l = 0) =>
    fistR.clone().addScaledVector(Dg, d).addScaledVector(Ug, u).addScaledVector(Lg, l);
  const GB = armR.arm.tip!;

  // hands (fingers wrap around the gun axis)
  for (const a of arms) {
    const L = a.s > 0 ? "L" : "R";
    const tip = a.arm.tip!;
    const U = Yv.clone().addScaledVector(Dg, -Yv.dot(Dg)).normalize();
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.09), GLOVE, { bone: tip, at: a.fist, dir: Dg, up: Ug });
    b.part(new THREE.CylinderGeometry(0.058, 0.066, 0.045, 8), LEATHER, {
      bone: tip,
      at: a.fist.clone().addScaledVector(Dg, -0.07),
      dir: Dg,
    });
    const names = ["index", "middle", "ring", "pinky"];
    [-0.03, -0.01, 0.01, 0.03].forEach((off, i) => {
      const c = a.fist.clone().addScaledVector(Dg, off);
      const from = c.clone().addScaledVector(U, a.s < 0 ? 0.043 : -0.043);
      const fch = b.chain(`${names[i]}${L}`, arc(c, from, Dg, 110), {
        parent: tip,
        count: 2,
        names: [`${names[i]}${L}1`, `${names[i]}${L}2`],
        role: "digit",
      });
      b.sweep(fch, 0.0115, { color: GLOVE, sides: 5, smooth: false });
    });
    const R = new THREE.Vector3().crossVectors(U, Dg).normalize();
    const T = R.clone().multiplyScalar(Math.sign(R.x || 1) * -a.s);
    const t0 = a.fist.clone().addScaledVector(Dg, -0.03).addScaledVector(T, 0.04);
    const t1 = a.fist.clone().addScaledVector(Dg, 0.0).addScaledVector(T, 0.052);
    const t2 = a.fist.clone().addScaledVector(Dg, 0.04).addScaledVector(T, 0.042);
    const th = b.chain(`thumb${L}`, [t0, t1, t2], {
      parent: tip,
      names: [`thumb${L}1`, `thumb${L}2`],
      role: "digit",
    });
    b.sweep(th, [0.016, 0.012], { color: GLOVE, sides: 5, smooth: false });
  }

  // ---------------------------------------------------------------- blunderbuss
  const down = new THREE.Vector3(0, -1, 0);
  const stock = b.sweep(
    catmull([gp(-0.2).addScaledVector(down, 0.045), gp(-0.1).addScaledVector(down, 0.028), gp(0.01)]),
    (t: number) => [0.022, 0.05 * (1 - t) + 0.027],
    { section: "box", color: grain("#7a4a22", "#5a3318", { size: 0.01, axis: Dg, seed: 31 }), bone: GB },
  );
  void stock;
  b.part(new THREE.BoxGeometry(0.05, 0.11, 0.012), BRASS, {
    bone: GB,
    at: gp(-0.202).addScaledVector(down, 0.046),
    dir: Dg,
    axis: "z",
    up: Ug,
  });
  // lock plate, hammer, jewel
  b.part(new THREE.BoxGeometry(0.012, 0.05, 0.11), BRASS, {
    bone: GB,
    at: gp(0.045, 0.02).addScaledVector(Rg, 0.028),
    dir: Dg,
    axis: "z",
    up: Ug,
  });
  b.rod(gp(0.03, 0.045).addScaledVector(Rg, 0.034), gp(-0.005, 0.085).addScaledVector(Rg, 0.034), 0.011, {
    color: STEEL,
    bone: GB,
    sides: 5,
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.016, 0), "#ff7a1a", {
      bone: GB,
      at: gp(0.06, 0.012).addScaledVector(Rg, 0.038),
      flat: true,
    }),
    1.6,
  );
  // wooden fore-end, steel barrel, ramrod
  b.rod(gp(0.0), gp(0.42), [0.034, 0.03], {
    color: grain("#7a4a22", "#5a3318", { size: 0.01, axis: Dg, seed: 32 }),
    bone: GB,
    sides: 6,
    smooth: false,
  });
  const barrel = b.rod(gp(0.0, 0.028), gp(0.6, 0.026), 0.0235, { color: BLUED, bone: GB, sides: 8 });
  b.rod(gp(0.0, -0.047), gp(0.46, -0.047), 0.007, { color: LEATHER, bone: GB, sides: 5 });
  b.part(new THREE.SphereGeometry(0.01, 5, 3), BRASS, { bone: GB, at: gp(0.465, -0.047) });
  for (const d of [0.1, 0.2, 0.34, 0.42]) {
    b.part(new THREE.TorusGeometry(0.036, 0.007, 4, 8), GILT, { bone: GB, at: gp(d), dir: Dg, axis: "z" });
  }
  b.part(new THREE.TorusGeometry(0.0255, 0.007, 4, 8), GILT, { bone: GB, at: gp(0.52, 0.027), dir: Dg, axis: "z" });
  // flared brass muzzle
  b.lathe(
    [
      [0, 0],
      [0.024, 0],
      [0.03, 0.04],
      [0.05, 0.1],
      [0.066, 0.15],
      [0.066, 0.16],
      [0, 0.16],
    ],
    { at: gp(0.58, 0.0265), axis: Dg, segments: 10, color: BRASS, bone: GB },
  );
  b.part(new THREE.TorusGeometry(0.066, 0.008, 4, 10), GILT, { bone: GB, at: gp(0.738, 0.0265), dir: Dg, axis: "z" });
  b.part(new THREE.CircleGeometry(0.055, 10), DARK, { bone: GB, at: gp(0.7425, 0.0265), dir: Dg, axis: "z" });
  glow(
    b.part(new THREE.CircleGeometry(0.03, 8), "#ff6a1a", { bone: GB, at: gp(0.7435, 0.0265), dir: Dg, axis: "z" }),
    2,
  );
  b.spike(gp(0.55, 0.05), Ug, 0.022, 0.007, { color: GILT, bone: GB, sides: 5 });
  glow(
    b.decal(barrel, RUNES, {
      at: gp(0.3, 0.028, 0.026),
      dir: Lg,
      up: Ug,
      size: [0.2, 0.03],
      bone: GB,
    }),
    1.5,
  );

  // ---------------------------------------------------------------- pauldrons and fur collar
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const sj = (s > 0 ? armL : armR).arm.joints[0];
    const ax = new THREE.Vector3(s * 0.6, 0.8, 0.05).normalize();
    const base = PV(s * 0.27, 0.89, 0);
    const low = base.clone().addScaledVector(ax, -0.035);
    b.lathe(
      [
        [0, 0],
        [0.16, 0],
        [0.175, 0.02],
        [0.15, 0.05],
        [0, 0.075],
      ],
      { at: low, axis: ax, segments: 10, color: BLUED, bone: sj },
    );
    const dome = b.lathe(
      [
        [0, 0],
        [0.125, 0],
        [0.14, 0.025],
        [0.125, 0.06],
        [0.085, 0.095],
        [0, 0.112],
      ],
      { at: base, axis: ax, segments: 10, smoothing: 1, color: STEEL, bone: sj },
    );
    b.part(new THREE.TorusGeometry(0.135, 0.01, 4, 10), GILT, { bone: sj, at: base, dir: ax, axis: "z" });
    b.part(new THREE.TorusGeometry(0.168, 0.009, 4, 10), GILT, { bone: sj, at: low, dir: ax, axis: "z" });
    b.spike(base.clone().addScaledVector(ax, 0.1), ax, 0.1, 0.03, { color: GILT, bone: sj, sides: 6, smooth: false });
    b.ring(line(base.clone().addScaledVector(ax, 0.035), base.clone().addScaledVector(ax, 0.2)), { count: 8, radius: 0.128 }, (it) =>
      b.stick(new THREE.SphereGeometry(0.011, 5, 3), BRASS, it, { embed: 0.4, bone: sj }),
    );
    const Q = new THREE.Vector3(s, 0.1, 0.45).normalize();
    b.decal(dome, BADGE, {
      at: base.clone().addScaledVector(ax, 0.05).addScaledVector(Q, 0.1),
      dir: Q,
      size: [0.075, 0.075],
      bone: sj,
    });
    void L;
  }
  // fur mantle
  const collarPts: T3[] = [];
  const tufts: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    collarPts.push(P(Math.sin(a) * 0.22, 0.95, Math.cos(a) * 0.15));
  }
  b.sweep(catmull(collarPts, { closed: true }), 0.05, { color: FUR, bone: chest, sides: 6, smooth: false });
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const x = Math.sin(a);
    const z = Math.cos(a);
    tufts.push(frame(P(x * 0.225, 0.965, z * 0.155), [x * 0.8, 0.7, z * 0.8]));
  }
  b.cards(tufts, TUFT, { size: [0.055, 0.085], lean: 35, bend: 20, vary: 0.25, rng: rng(5), bone: chest });

  // ---------------------------------------------------------------- pack, pick, lantern, horn
  b.part(new THREE.BoxGeometry(0.3, 0.3, 0.14), LEATHER, { bone: chest, at: P(0, 0.76, -0.185) });
  b.part(new THREE.BoxGeometry(0.31, 0.04, 0.15), LEATHER_D, { bone: chest, at: P(0, 0.9, -0.185) });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.36, 8), stripes("#6f5a3a", "#d8c9a0", { size: 0.05, axis: "x", seed: 3 }), {
    bone: chest,
    at: P(0, 0.99, -0.2),
    dir: [1, 0, 0],
  });
  for (const x of [-0.1, 0.1]) {
    b.part(new THREE.BoxGeometry(0.03, 0.34, 0.012), LEATHER_D, { bone: chest, at: P(x, 0.8, -0.258) });
    b.part(new THREE.BoxGeometry(0.03, 0.02, 0.014), BRASS, { bone: chest, at: P(x, 0.7, -0.262) });
  }
  b.lathe(
    [
      [0, 0],
      [0.06, 0],
      [0.075, 0.04],
      [0.07, 0.08],
      [0.075, 0.085],
      [0, 0.085],
    ],
    { at: P(-0.1, 0.52, -0.25), axis: [0, 1, 0], segments: 9, color: IRONP, bone: chest },
  );
  // pickaxe
  b.rod(P(0.15, 0.48, -0.275), P(0.19, 1.1, -0.285), 0.016, {
    color: grain("#7a4a22", "#5a3318", { size: 0.01, axis: "y", seed: 33 }),
    bone: chest,
    sides: 6,
  });
  b.extrude(
    [
      [-0.13, -0.02, "sharp"],
      [-0.06, 0.025],
      [0, 0.03],
      [0.06, 0.025],
      [0.13, -0.02, "sharp"],
      [0.06, 0.005],
      [0.02, -0.025],
      [-0.02, -0.025],
      [-0.06, 0.005],
    ],
    { at: P(0.19, 1.08, -0.285), x: [1, 0, 0], thickness: 0.026, bevel: 0.004, color: STEEL, bone: chest },
  );
  // lantern
  b.rod(P(0.2, 0.6, 0.0), P(0.26, 0.5, 0.0), 0.006, { color: IRONP, bone: hips, sides: 4 });
  b.lathe(
    [
      [0, 0],
      [0.03, 0],
      [0.042, 0.035],
      [0.042, 0.08],
      [0.03, 0.115],
      [0, 0.115],
    ],
    { at: P(0.26, 0.36, 0), axis: [0, 1, 0], segments: 8, color: "#ffb347", bone: hips, name: "lanternGlass" },
  );
  glow(b.part(new THREE.SphereGeometry(0.02, 5, 4), "#ffe08a", { bone: hips, at: P(0.26, 0.42, 0) }), 2);
  for (const [x, z] of [
    [0.045, 0],
    [-0.045, 0],
    [0, 0.045],
    [0, -0.045],
  ])
    b.rod(P(0.26 + x, 0.36, z), P(0.26 + x, 0.48, z), 0.004, { color: BRASS, bone: hips, sides: 4 });
  b.part(new THREE.ConeGeometry(0.055, 0.045, 6), BRASS, { bone: hips, at: P(0.26, 0.5, 0) });
  b.part(new THREE.CylinderGeometry(0.048, 0.04, 0.02, 8), BRASS, { bone: hips, at: P(0.26, 0.35, 0) });
  b.part(new THREE.TorusGeometry(0.016, 0.004, 4, 8), BRASS, { bone: hips, at: P(0.26, 0.535, 0), dir: [1, 0, 0], axis: "z" });
  // powder horn
  b.sweep(bezier(PV(0.17, 0.57, -0.1), PV(0.3, 0.52, -0.16), PV(0.28, 0.3, -0.14)), [0.036, 0.008], {
    color: HORN,
    bone: hips,
    sides: 6,
    caps: { start: "flat", end: "point" },
  });
  b.part(new THREE.SphereGeometry(0.04, 6, 4), BRASS, { bone: hips, at: P(0.17, 0.57, -0.1) });

  // ---------------------------------------------------------------- plinth and scenery
  b.lathe(
    [
      [0, 0],
      [0.56, 0],
      [0.62, 0.02],
      [0.62, 0.05],
      [0.58, 0.07],
      [0, 0.07],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], segments: 12, color: STONE, bone: hips, name: "plinth" },
  );
  b.part(new THREE.TorusGeometry(0.5, 0.008, 4, 24), GILT, { bone: hips, at: P(0, 0.003, 0), dir: [0, 1, 0], axis: "z" });
  const snow = b.lathe(
    [
      [0, 0],
      [0.38, 0],
      [0.42, 0.006],
      [0.4, 0.012],
      [0.3, 0.016],
      [0, 0.016],
    ],
    { at: [0, 0.066, 0], axis: [0, 1, 0], segments: 9, color: SNOW, bone: hips, name: "snow" },
  );
  const tufts2 = b.surface(snow).scatter(34, {
    rng: rng(77),
    minDist: 0.07,
    filter: (h) => h.n.y > 0.5 && Math.hypot(h.at.x, h.at.z) > 0.24,
  });
  b.cards(tufts2, GRASS, { size: [0.05, 0.07], lean: 15, vary: 0.3, rng: rng(78), bone: hips });

  // glowing rune ring on the plinth
  const runeFrames: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.2;
    runeFrames.push(frame([Math.sin(a) * 0.52, 0.072, Math.cos(a) * 0.52], [0, 1, 0]));
  }
  glow(
    b.cards(runeFrames, RUNES, {
      size: [0.24, 0.05],
      lean: 90,
      mirror: true,
      bone: hips,
      flow: (_f: unknown, i: number) => {
        const a = (i / 10) * Math.PI * 2 + 0.2;
        return [Math.sin(a), 0, Math.cos(a)];
      },
    }),
    2.2,
  );

  // rocks
  const rockSpecs: [number, number, number, number, number, number][] = [
    [0.45, 0.2, 0.09, 0.07, 0.1, 20],
    [0.52, -0.05, 0.12, 0.09, 0.11, 70],
    [-0.5, -0.3, 0.1, 0.08, 0.09, 130],
  ];
  for (const [x, z, a, h, c, rot] of rockSpecs) {
    b.part(new THREE.DodecahedronGeometry(1, 0), ROCK, {
      bone: hips,
      at: P(x, h * 0.55, z),
      scale: [a, h, c],
      rotation: [0, rot, 0],
      flat: true,
    });
    b.part(new THREE.DodecahedronGeometry(1, 0), SNOW, {
      bone: hips,
      at: P(x, h * 1.05, z),
      scale: [a * 0.7, h * 0.35, c * 0.7],
      rotation: [0, rot, 0],
      flat: true,
    });
  }
  // powder keg
  const keg = b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.12, 0.04],
      [0.13, 0.1],
      [0.12, 0.16],
      [0.1, 0.2],
      [0, 0.2],
    ],
    {
      at: P(-0.43, 0, -0.08),
      axis: [0, 1, 0],
      segments: 10,
      color: stripes("#7a4a22", "#5a3318", { size: 0.04, axis: "x", seed: 4 }),
      bone: hips,
      name: "keg",
    },
  );
  for (const y of [0.04, 0.16])
    b.part(new THREE.TorusGeometry(0.118 + (y > 0.1 ? 0.0 : 0.0), 0.008, 4, 10), IRONP, {
      bone: hips,
      at: P(-0.43, y, -0.08),
      dir: [0, 1, 0],
      axis: "z",
    });
  b.decal(keg, LABEL, { at: P(-0.43, 0.1, 0.05), dir: [0, 0, 1], size: [0.11, 0.06], bone: hips });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 6), BRASS, { bone: hips, at: P(-0.43, 0.205, -0.08) });
  // pine sapling
  const PINE = mottle("#27562f", "#3b7b45", { size: 0.06, seed: 51 });
  b.part(new THREE.CylinderGeometry(0.025, 0.035, 0.2, 6), LEATHER_D, { bone: hips, at: P(-0.28, 0.1, -0.36) });
  for (let i = 0; i < 4; i++) {
    const r = 0.14 - i * 0.03;
    b.part(new THREE.ConeGeometry(r, 0.2, 7), PINE, { bone: hips, at: P(-0.28, 0.18 + i * 0.11, -0.36), flat: true });
    b.part(new THREE.ConeGeometry(r * 0.75, 0.1, 7), SNOW, { bone: hips, at: P(-0.28, 0.22 + i * 0.11, -0.36), flat: true });
  }
  // glowing crystals by the rocks
  for (const [cx, cz, ch] of [
    [0.3, -0.36, 0.15],
    [0.38, -0.29, 0.09],
    [-0.1, -0.5, 0.11],
  ] as [number, number, number][]) {
    glow(
      b.part(new THREE.ConeGeometry(0.035, ch, 5), "#4fb6ff", { bone: hips, at: P(cx, ch / 2, cz), flat: true }),
      1.8,
    );
  }
  // banner
  b.rod(P(0.5, 0, -0.22), P(0.5, 1.15, -0.22), 0.018, {
    color: grain("#7a4a22", "#5a3318", { size: 0.01, axis: "y", seed: 40 }),
    bone: hips,
    sides: 6,
  });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), GILT, { bone: hips, at: P(0.5, 1.17, -0.22) });
  b.rod(P(0.36, 1.08, -0.22), P(0.64, 1.08, -0.22), 0.012, { color: BRASS, bone: hips, sides: 5 });
  b.part(new THREE.PlaneGeometry(0.24, 0.36), WHITE, {
    bone: hips,
    at: P(0.5, 0.88, -0.215),
    dir: [0, 0, 1],
    axis: "z",
    texture: BANNER,
  });
  b.part(new THREE.PlaneGeometry(0.24, 0.36), WHITE, {
    bone: hips,
    at: P(0.5, 0.88, -0.225),
    dir: [0, 0, -1],
    axis: "z",
    texture: BANNER,
  });

  return b.root;
}
