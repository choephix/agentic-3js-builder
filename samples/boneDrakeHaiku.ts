import * as THREE from "three";
import { createBuilder, type OutlinePoint } from "../src/builder";
import type { Surface } from "../src/surface";
import { arc, bezier, catmull, polyline } from "../src/path";
import { cells, mix, noise, paint, scales, smoothstep } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Bone Drake",
  description:
    "An undead drake, about 9.6 m across the wings, 11 m nose to tail and 4.8 m tall: a skeletal wyvern with a bone-plated torso open to a dark void between the ribs, iron-banded bone, tattered teal wing membranes and green soul-fire in its sockets, throat and flanks.",
  style: "Blizzard/Warcraft",
  commit: "b816db2",
};

// Palette: ivory-to-ash bone, marrow cracks, violet void, teal wing skin, iron and brass, sickly soul-fire.
const LIGHT = new THREE.Vector3(-0.45, 0.8, 0.4).normalize();
const BONE_LIT = "#f8efdb";
const BONE_MID = "#cbb386";
const BONE_SHADOW = "#5c4730";
const BONE_AGED = "#b08a4c";
const MARROW = "#2a1e18";
const VOID_DARK = "#17111d";
const VOID_LIT = "#3b2648";
const TEAL = "#2a5157";
const TEAL_LIT = "#5fb1a4";
const VIOLET = "#2a1d3e";
const GLOW = "#8dffcf";
const IRON = "#6e7680";
const BRASS = "#c9994c";
const TOOTH = "#f0e7cc";
const CLAW = "#e2d3ae";

// Hand-painted bone: a lit-from-above gradient with warm highlights, aged yellowing and marrow cracks.
const boneP = paint((p, n) => {
  const d = n.dot(LIGHT);
  let c = mix(BONE_SHADOW, BONE_MID, smoothstep(-0.3, 0.4, d));
  c = mix(c, BONE_LIT, smoothstep(0.6, 0.95, d));
  c = mix(c, BONE_AGED, smoothstep(0.45, 0.85, noise(p, 0.8, 3)) * 0.4);
  const k = cells(p, 0.55, 11);
  const crack = (1 - smoothstep(0, 0.022, k.d2 - k.d1)) * smoothstep(0.5, 0.7, noise(p, 0.4, 5));
  return mix(c, MARROW, crack * 0.85);
});

// Dark void inside the rib cage and neck, violet-black with a faint ghostly mottle.
const voidP = paint((p) => mix(VOID_DARK, VOID_LIT, smoothstep(0.35, 0.7, noise(p, 0.5, 2))));

// Wing skin: teal with brighter veins, fading to violet at the tattered trailing edge (s[0] runs root to tip).
const wingP = paint((p, _n, s) => {
  const k = cells(p, 0.35, 21);
  const vein = 1 - smoothstep(0, 0.05, k.d2 - k.d1);
  let c = mix(TEAL, TEAL_LIT, vein * 0.55);
  c = mix(c, VIOLET, smoothstep(0.55, 1, s[0]) * 0.8);
  return mix(c, VIOLET, smoothstep(0.6, 0.9, noise(p, 0.6, 9)) * 0.4);
});

// Torn strips hanging from the wing: teal at the top, violet ragged bottoms.
const tatterP = paint((_p, _n, s) => mix(TEAL, VIOLET, smoothstep(-0.05, -0.5, s[1])));

// Armour plates: scaled bone with dark seams.
const plateP = scales([BONE_MID, BONE_LIT], BONE_SHADOW, { size: 0.2, width: 0.1, seed: 4 });

const EYE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 44">
<ellipse cx="32" cy="22" rx="31" ry="21" fill="#0e0a0b"/>
<ellipse cx="32" cy="22" rx="22" ry="14" fill="${GLOW}"/>
<ellipse cx="32" cy="22" rx="7" ry="13" fill="#06140f"/>
<ellipse cx="25" cy="16" rx="4" ry="3" fill="#f4fff9"/>
</svg>`;

const RUNE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<circle cx="32" cy="32" r="28" fill="none" stroke="${GLOW}" stroke-width="3"/>
<path d="M32 8 L32 56 M16 20 L48 44 M48 20 L16 44 M22 32 L42 32" stroke="${GLOW}" stroke-width="4" fill="none" stroke-linecap="round"/>
<circle cx="32" cy="32" r="5" fill="${GLOW}"/>
</svg>`;

export default function build() {
  const b = createBuilder({ name: "boneDrake", paintSize: 2048 });
  const eyeTex = svg(EYE_SVG, { size: 256 });
  const runeTex = svg(RUNE_SVG, { size: 128 });

  // Iron-band rivets, seated on the band surface facing outward.
  const rivets = (path: { at(t: number): THREE.Vector3 }, surf: Surface, count: number, r: number) => {
    for (let i = 0; i < count; i++) {
      const hit = surf.nearest(path.at(i / count));
      b.stick(new THREE.SphereGeometry(r, 6, 4), BRASS, hit, { embed: 0.35 });
    }
  };

  // ---- torso: pelvis root, spine, bone belly over a dark void, exposed ribs
  const hips = b.joint("hips", { at: [0, 2.42, -1.25], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.45, -1.0],
      [0, 2.52, -0.2],
      [0, 2.64, 0.6],
      [0, 2.8, 1.25],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const bodyR = (t: number): [number, number] => [0.6 + 0.22 * t, 0.56 + 0.24 * t];
  const body = b.sweep(spine, bodyR, {
    color: voidP,
    sectors: [[120, 240, boneP]],
    caps: "round",
  });
  const bodySurf = b.surface(body);

  // Ribs: one arc per side from the spine's crest round to the belly, standing off the void.
  for (const t of [0.1, 0.3, 0.5, 0.7, 0.9]) {
    for (const s of [1, -1]) {
      const c = spine.at(t).at;
      const R = bodyR(t)[1] + 0.1;
      const rib = arc([c.x, c.y, c.z], [c.x, c.y + R, c.z], [0, 0, -s], 165);
      b.sweep(rib, [0.08, 0.04], { color: boneP, caps: "round" });
    }
  }

  // Dorsal spines and sail-like armour plates along the crest.
  for (const t of [0.04, 0.16, 0.28, 0.4, 0.52, 0.64, 0.76, 0.88]) {
    const p = spine.at(t).at;
    const top = bodyR(t)[1];
    b.spike([p.x, p.y + top * 0.6, p.z], [0, 1, -0.3], 0.6 - 0.3 * t, 0.1, { color: boneP });
  }
  const plate = (k: number): OutlinePoint[] => [
    [-0.22 * k, 0],
    [0.2 * k, 0],
    [0.1 * k, 0.42 * k],
    [0.02 * k, 0.8 * k, "sharp"],
    [-0.16 * k, 0.4 * k],
  ];
  for (const [t, k] of [
    [0.22, 1.3],
    [0.5, 1.6],
    [0.8, 1.1],
  ] as const) {
    const p = spine.at(t).at;
    b.extrude(plate(k), {
      x: [0, 0, 1],
      at: [p.x, p.y + bodyR(t)[1] * 0.5, p.z],
      thickness: 0.07,
      bevel: 0.015,
      smoothing: 1,
      color: plateP,
    });
  }

  // Hip armour plates on each flank, and a breastplate under the neck.
  for (const s of [1, -1]) {
    b.extrude(plate(1.0), {
      at: [s * 0.66, 2.55, -0.85],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.08,
      bevel: 0.015,
      smoothing: 1,
      color: plateP,
    });
  }
  b.extrude(
    [
      [-0.42, 0],
      [0.42, 0],
      [0.36, 0.55],
      [0, 0.85, "sharp"],
      [-0.36, 0.55],
    ],
    { at: [0, 2.0, 1.5], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.16, bevel: 0.03, smoothing: 1, color: plateP },
  );

  // Iron bands with brass rivets round the pelvis and the chest.
  const hipLoop = bodySurf.loop(spine.joints[0], { lift: 0.03 });
  const hipBand = b.sweep(hipLoop, 0.045, { color: IRON });
  rivets(hipLoop, b.surface(hipBand), 14, 0.03);
  const chestLoop = bodySurf.loop(spine.joints[1], { lift: 0.03 });
  const chestBand = b.sweep(chestLoop, 0.045, { color: IRON });
  rivets(chestLoop, b.surface(chestBand), 18, 0.03);

  // Glowing rune sigils on both flanks, between the ribs.
  for (const s of [1, -1]) {
    const p = spine.at(0.4).at;
    const flank = bodySurf.nearest([s * (bodyR(0.4)[0] + 0.02), p.y, p.z]);
    glow(b.decal(body, runeTex, { at: flank, size: [0.22, 0.22] }));
  }

  // ---- neck: dark throat with bone vertebra collars and spines
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.8, 1.2],
      [0, 3.22, 1.9],
      [0, 3.5, 2.6],
      [0, 3.6, 3.2],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2", "neck3", "head"], role: "neck" },
  );
  const head = neck.tip;
  if (!head) throw new Error("neck has no head tip");
  b.sweep(neck, (t) => [0.36 - 0.1 * t, 0.34 - 0.1 * t], { color: voidP, caps: "round" });
  for (const t of [0.08, 0.22, 0.36, 0.5, 0.64, 0.78, 0.9]) {
    const rr = 0.38 - 0.1 * t + 0.03;
    b.part(new THREE.CylinderGeometry(rr, rr, 0.1, 12), boneP, { frame: neck.at(t) });
  }
  for (const t of [0.2, 0.4, 0.6, 0.8]) {
    const p = neck.at(t).at;
    b.spike([p.x, p.y + 0.32, p.z], [0, 1, -0.4], 0.32, 0.07, { color: boneP });
  }

  // ---- head: cranium and snout sweep on the head bone, brow, horns, eyes, teeth, lower jaw
  const skullPath = catmull([
    [0, 3.58, 3.12],
    [0, 3.7, 3.5],
    [0, 3.7, 3.95],
    [0, 3.6, 4.4],
    [0, 3.46, 4.82],
  ]);
  const skullR = (t: number): [number, number] => [0.3 - 0.14 * t, 0.27 - 0.13 * t];
  const skull = b.sweep(skullPath, skullR, { bone: head, color: boneP, caps: "round" });
  const skullSurf = b.surface(skull);
  // Bone crest over the crown.
  for (const t of [0.1, 0.25, 0.4]) {
    const p = skullPath.at(t);
    const r = skullR(t);
    b.spike([p.x, p.y + r[1] * 0.85, p.z], [0, 1, -0.25], 0.26 - 0.1 * t, 0.06, { bone: head, color: boneP });
  }

  // Lower jaw hangs open slightly, so the void and the throat glow show between the jaws.
  const jaw = b.joint("jaw", { parent: head, at: [0, 3.34, 3.3], aim: [0, 3.2, 4.6], role: "jaw" });
  const jawPath = catmull([
    [0, 3.2, 3.25],
    [0, 3.17, 3.7],
    [0, 3.14, 4.2],
    [0, 3.2, 4.6],
  ]);
  const jawR = (t: number): [number, number] => [0.16 - 0.08 * t, 0.12 - 0.06 * t];
  b.sweep(jawPath, jawR, { bone: jaw, color: boneP, caps: "round" });
  b.sweep(
    catmull([
      [0, 3.4, 3.3],
      [0, 3.38, 3.9],
      [0, 3.4, 4.4],
    ]),
    [0.12, 0.04],
    { bone: head, color: voidP, caps: "round" },
  );
  glow(b.part(new THREE.SphereGeometry(0.08, 10, 8), GLOW, { bone: head, at: [0, 3.37, 3.92] }));

  for (const s of [1, -1]) {
    // Glowing eye sockets: a decal on the cranium, lit from within.
    const eyeHit = skullSurf.nearest([s * 0.21, 3.8, 3.72]);
    glow(b.decal(skull, eyeTex, { at: eyeHit, size: [0.2, 0.14], mirror: s < 0 }));

    // Brow ridge and a pair of backswept horns.
    b.sweep(
      bezier([s * 0.22, 3.92, 3.35], [s * 0.24, 4.0, 3.6], [s * 0.2, 3.97, 3.85], [s * 0.1, 3.86, 3.95]),
      [0.06, 0.02],
      { bone: head, color: boneP, caps: { start: "round", end: "point" } },
    );
    b.sweep(
      bezier([s * 0.15, 3.88, 3.2], [s * 0.4, 4.25, 3.42], [s * 0.5, 4.4, 2.95], [s * 0.3, 4.55, 2.42]),
      [0.085, 0.012],
      { bone: head, color: boneP, caps: { start: "round", end: "point" } },
    );

    // Upper and lower fangs along the jaw lines.
    for (let i = 0; i < 12; i++) {
      const t = 0.38 + i * 0.05;
      const p = skullPath.at(t);
      const r = skullR(t);
      b.spike([s * r[0] * 0.8, p.y - r[1] * 0.85, p.z], [0, -1, 0], 0.13 - 0.05 * t, 0.026, {
        bone: head,
        color: TOOTH,
      });
    }
    for (let i = 0; i < 12; i++) {
      const t = 0.2 + i * 0.07;
      const p = jawPath.at(t);
      const r = jawR(t);
      b.spike([s * r[0] * 0.7, p.y + r[1] * 0.85, p.z], [0, 1, 0], 0.12 - 0.04 * t, 0.024, {
        bone: jaw,
        color: TOOTH,
      });
    }
  }

  // ---- wings: arm chain, four fingers with claws, membranes and torn strips
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const W: number[] = [s * 2.9, 4.25, 0.3];
    const wing = b.chain(
      "wing" + L,
      catmull([
        [s * 0.7, 2.95, 0.95],
        [s * 1.7, 3.95, 1.0],
        W,
      ]),
      { parent: spine.joints[2], names: ["arm" + L, "forearm" + L, "wrist" + L], role: "wing" },
    );
    const wrist = wing.tip;
    if (!wrist) throw new Error("wing has no wrist");
    const armTube = b.sweep(wing, (t) => 0.36 - 0.14 * t, { color: boneP, caps: "round" });
    b.spike(W, [s * 0.3, 0.6, 0.5], 0.36, 0.06, { bone: wrist, color: CLAW });
    const cuffLoop = b.surface(armTube).loop(wing.joints[1], { lift: 0.02 });
    const cuff = b.sweep(cuffLoop, 0.03, { color: IRON });
    rivets(cuffLoop, b.surface(cuff), 10, 0.02);
    b.extrude(plate(0.8), { x: [0, 0, 1], at: [s * 0.75, 3.1, 0.9], thickness: 0.07, bevel: 0.015, smoothing: 1, color: plateP });

    const f2 = b.chain(
      "finger2" + L,
      polyline([W, [s * 3.6, 4.75, 0.25], [s * 4.6, 4.5, -0.2]]),
      { parent: wrist, names: ["f2" + L + "a", "f2" + L + "b"], role: "digit" },
    );
    const f3 = b.chain(
      "finger3" + L,
      polyline([W, [s * 3.5, 4.15, -0.45], [s * 4.15, 3.9, -1.2]]),
      { parent: wrist, names: ["f3" + L + "a", "f3" + L + "b"], role: "digit" },
    );
    const f4 = b.chain(
      "finger4" + L,
      polyline([W, [s * 3.05, 3.75, -0.8], [s * 3.35, 3.3, -1.6]]),
      { parent: wrist, names: ["f4" + L + "a", "f4" + L + "b"], role: "digit" },
    );
    for (const f of [f2, f3, f4]) b.sweep(f, [0.07, 0.025], { color: boneP, caps: "round" });
    b.spike([s * 4.6, 4.5, -0.2], [s * 0.4, -0.05, -0.1], 0.24, 0.04, { bone: f2.joints[1], color: CLAW });
    b.spike([s * 4.15, 3.9, -1.2], [s * 0.3, -0.1, -0.3], 0.21, 0.036, { bone: f3.joints[1], color: CLAW });
    b.spike([s * 3.35, 3.3, -1.6], [s * 0.2, -0.2, -0.3], 0.19, 0.034, { bone: f4.joints[1], color: CLAW });

    // Membranes: leading edge, two webs, and the sweep back to the flank.
    const armEdge: number[][] = [W, [s * 1.7, 3.95, 1.0], [s * 0.7, 2.95, 0.95]];
    const bodyEdge: number[][] = [W, [s * 2.0, 3.25, -0.1], [s * 1.2, 2.95, -0.7], [s * 0.8, 2.6, -1.15]];
    b.membrane(f2, armEdge, { color: wingP, thickness: 0.025, scallop: 0.05 });
    b.membrane(f2, f3, { color: wingP, thickness: 0.025, scallop: 0.1 });
    b.membrane(f3, f4, { color: wingP, thickness: 0.025, scallop: 0.12 });
    b.membrane(f4, bodyEdge, { color: wingP, thickness: 0.025, scallop: 0.08 });
    b.membrane(armEdge, bodyEdge, { color: wingP, thickness: 0.025 });

    // Torn strips hanging from the trailing edge.
    const tatter = (sc: number): OutlinePoint[] => [
      [-0.1, 0],
      [0.1, 0],
      [0.07, -0.6 * sc],
      [0.0, -0.42 * sc],
      [-0.07, -0.8 * sc, "sharp"],
      [-0.11, -0.42 * sc],
    ];
    for (const [f, t, sc] of [
      [f3, 0.55, 1.2],
      [f3, 0.15, 0.9],
      [f4, 0.5, 0.95],
      [f4, 0.85, 1.0],
      [f2, 0.7, 0.8],
    ] as const) {
      b.extrude(tatter(sc), {
        at: f.at(t).at,
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.014,
        color: tatterP,
        bone: f.joints[0],
      });
    }
  }

  // ---- legs: digitigrade hind legs with iron hock bands, three clawed toes each
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const leg = b.chain(
      "leg" + L,
      catmull([
        [s * 0.6, 2.25, -1.0],
        [s * 0.8, 1.2, -0.25],
        [s * 0.62, 0.42, -0.92],
        [s * 0.68, 0.04, -0.02],
      ]),
      { parent: hips, names: ["hip" + L, "knee" + L, "hock" + L, "foot" + L], role: "leg" },
    );
    const legTube = b.sweep(leg, [0.4, 0.28, 0.19, 0.1], { color: boneP, caps: "round" });
    b.spike([s * 0.8, 1.2, -0.25], [s * 0.15, 0.35, 1], 0.32, 0.07, { bone: leg.joints[1], color: boneP });
    const hockLoop = b.surface(legTube).loop(leg.joints[2], { lift: 0.02 });
    const hockBand = b.sweep(hockLoop, 0.032, { color: IRON });
    rivets(hockLoop, b.surface(hockBand), 8, 0.02);

    const foot = leg.tip;
    if (!foot) throw new Error("leg has no foot");
    const f0: number[] = [s * 0.68, 0.04, -0.02];
    for (const k of [-1, 0, 1]) {
      const tipPt: number[] = [f0[0] + k * 0.07, 0.04, f0[2] + 0.32];
      const toe = b.chain("toeChain" + L + (k + 2), polyline([f0, tipPt]), {
        parent: foot,
        names: ["toe" + L + (k + 2)],
        role: "digit",
      });
      b.sweep(toe, [0.06, 0.04], { color: boneP, caps: "round" });
      b.spike(tipPt, [k * 0.07, -0.12, 0.3], 0.14, 0.035, { bone: toe.joints[0], color: CLAW });
    }
  }

  // ---- tail: bone spine tapering to a spiked blade, with vertebra rings
  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.36, -1.35],
      [0, 2.22, -2.3],
      [0, 1.98, -3.3],
      [0, 1.6, -4.3],
      [0, 1.15, -5.05],
      [0, 0.62, -5.65],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"], role: "tail" },
  );
  const tailR = (t: number) => 0.5 * (1 - t) ** 1.2 + 0.08;
  b.sweep(tail, tailR, { color: boneP, caps: { start: "round", end: "point" } });
  for (const t of [0.12, 0.26, 0.4, 0.54, 0.68, 0.8]) {
    const p = tail.at(t).at;
    const r = tailR(t);
    b.spike([p.x, p.y + r * 0.7, p.z], [0, 1, -0.35], 0.36 * (1 - t) + 0.14, 0.06, { color: boneP });
    const rr = r + 0.03;
    b.part(new THREE.CylinderGeometry(rr, rr, 0.08, 10), boneP, { frame: tail.at(t) });
  }
  const tailTip = tail.tip;
  if (!tailTip) throw new Error("tail has no tip");
  const blade: OutlinePoint[] = [
    [0.1, 0],
    [0.02, 0.22],
    [-0.3, 0.38],
    [-0.8, 0.1, "sharp"],
    [-0.46, 0.02],
    [-0.2, -0.24],
    [0.06, -0.12],
  ];
  b.extrude(blade, {
    x: [0, 0, 1],
    at: [0, 0.62, -5.65],
    thickness: 0.08,
    bevel: 0.02,
    smoothing: 1,
    bone: tailTip,
    color: plateP,
  });

  return b.root;
}
