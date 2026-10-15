import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { lerp, rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { countershade, grain, mottle, noise, paint } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Swamp Troll",
  description:
    "Hulking moss-streaked swamp troll with upturned tusks, a blood-red mohawk and bone fetishes: skull trophies, fang necklace, rope-wrapped limbs and a tattered loincloth.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

type Fill = string | Paint;

const BONE = "#e8dcbc";
const BONE_SH = "#b9a883";
const IVORY = "#f1e6c4";
const IVORY_SH = "#a8956a";
const ROPE = "#7b5a34";
const ROPE_DK = "#4d3622";
const CLAW = "#2f2330";
const MOUTH = "#5a1420";
const PINK = "#d98a86";
const WART = "#86a866";
const SKIN_DK = "#3f6a45";
const WOOD = "#7a4a26";
const BRONZE = "#c79a3a";
const DARK = "#2b2118";
const BEADS = ["#c8302a", "#e8dcbc", "#2f7a4a", "#d9a23a"];

const prof = (a: number[], t: number) => {
  const x = Math.min(Math.max(t, 0), 1) * (a.length - 1);
  const i = Math.min(Math.floor(x), a.length - 2);
  return a[i] + (a[i + 1] - a[i]) * (x - i);
};

export default function build() {
  const b = createBuilder({ name: "swampTroll", paintSize: 2048 });
  const rand = rng(11);

  // ---------------------------------------------------------------- paints
  const skinBase = countershade(
    mottle("#5f9059", "#4b7a4d", { size: 0.2, seed: 2 }),
    "#93a96c",
    { level: -0.15, soft: 0.5 },
  );
  const SKIN = paint((p) => {
    if (p.y < 0.35 && noise(p, 0.12, 9) > 0.45) return "#59553a";
    if (noise(p, 0.17, 5) > 0.72) return "#7b9233";
    if (noise(p, 0.09, 21) > 0.8) return "#6f7f3a";
    return skinBase;
  });
  const RED_CLOTH = grain("#a02424", "#6a1212", { size: 0.015, axis: "y" });
  const BROWN_CLOTH = grain("#7d5733", "#4a3320", { size: 0.015, axis: "y" });
  const HIDE = grain("#6b4a2a", "#3f2b18", { size: 0.02, axis: "z", seed: 3 });

  // -------------------------------------------------------------- textures
  const MOHAWK = svg(
    `<svg viewBox="0 0 32 96"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#4a0710"/><stop offset="1" stop-color="#e33030"/></linearGradient></defs>
    <path d="M16 0 C19 26 30 58 30 96 L2 96 C2 58 13 26 16 0Z" fill="url(#g)"/>
    <path d="M16 8 C16 40 15 70 15 96" stroke="#ff8a60" stroke-width="3" fill="none"/></svg>`,
    { size: 128 },
  );
  const MOSS = svg(
    `<svg viewBox="0 0 32 32"><path d="M2 32 Q5 14 9 2 Q14 16 14 32Z" fill="#6d9028"/><path d="M12 32 Q16 10 20 0 Q24 14 24 32Z" fill="#88aa34"/><path d="M20 32 Q25 16 30 6 Q30 20 30 32Z" fill="#587a20"/></svg>`,
    { size: 64 },
  );
  const FUR = svg(
    `<svg viewBox="0 0 32 48"><path d="M2 0 L30 0 L26 34 L21 48 L17 30 L12 44 L7 28 Z" fill="#6b4a2a"/><path d="M8 0 L12 40" stroke="#8a6a3a" stroke-width="3" fill="none"/></svg>`,
    { size: 96 },
  );
  const SPIRAL = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#e0d4b0" stroke="#8a7a50" stroke-width="3"/>
    <path d="M32 32 m0 -4 a4 4 0 1 1 -4 4 a8 8 0 1 1 8 8 a13 13 0 1 1 -13 -13 a19 19 0 1 1 19 19" stroke="#3a2a20" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );

  // -------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 1.15, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.2, 0.02],
      [0, 1.5, 0.1],
      [0, 1.85, 0.22],
      [0, 2.08, 0.32],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    [
      [0, 2.0, 0.28],
      [0, 2.2, 0.46],
    ],
    { parent: spine.joints[3], names: ["neck", "head"], role: "neck" },
  );
  const head = neck.joints[1];
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 2.22, 0.5],
    aim: [0, 2.2, 0.8],
    role: "jaw",
  });

  const ball = (r: number, sc: number[], at: number[] | THREE.Vector3, color: Fill, bone: Joint, seg = 10) =>
    b.part(new THREE.SphereGeometry(r, seg, Math.max(4, Math.round(seg * 0.7))), color, { bone, at, scale: sc });

  // ------------------------------------------------------------------ torso
  const torso = b.sweep(
    spine,
    (t): [number, number] => [prof([0.4, 0.46, 0.62, 0.5], t), prof([0.34, 0.36, 0.42, 0.34], t)],
    { color: SKIN, sides: 10, shift: [0, -0.05] },
  );
  const pelvis = ball(1, [0.42, 0.3, 0.36], [0, 1.1, 0], SKIN, hips);
  const hump = ball(1, [0.4, 0.3, 0.3], [0, 2.0, -0.1], SKIN, chest);
  const gut = ball(1, [0.34, 0.3, 0.26], [0, 1.5, 0.3], SKIN, spine.joints[1]);
  for (const s of [1, -1]) {
    ball(1, [0.24, 0.2, 0.18], [s * 0.24, 1.95, 0.48], SKIN, chest);
    ball(1, [0.22, 0.16, 0.2], [s * 0.26, 2.12, 0.15], SKIN, chest);
  }
  const skin = b.surface([torso, pelvis]);
  const front = (y: number, x = 0) => {
    const h = skin.ray([x, y, 2], [0, 0, -1]);
    return h ? h.at.clone() : new THREE.Vector3(x, y, 0.5);
  };

  // ------------------------------------------------------------------ neck
  b.sweep(neck, [0.2, 0.17], { color: SKIN, sides: 8 });

  // ------------------------------------------------------------------ head
  ball(1, [0.2, 0.19, 0.22], [0, 2.33, 0.55], SKIN, head, 12);
  ball(1, [0.08, 0.08, 0.1], [0.15, 2.25, 0.68], SKIN, head, 8);
  ball(1, [0.08, 0.08, 0.1], [-0.15, 2.25, 0.68], SKIN, head, 8);
  ball(1, [0.11, 0.09, 0.12], [0, 2.27, 0.78], SKIN, head, 10);
  ball(0.045, [1.2, 0.8, 1], [0, 2.3, 0.9], PINK, head, 8);
  ball(0.012, [1, 1, 1], [0.025, 2.285, 0.94], DARK, head, 5);
  ball(0.012, [1, 1, 1], [-0.025, 2.285, 0.94], DARK, head, 5);
  ball(1, [0.13, 0.04, 0.13], [0, 2.19, 0.7], MOUTH, head, 8);
  ball(1, [0.17, 0.07, 0.16], [0, 2.15, 0.7], SKIN, jaw, 10);
  ball(0.07, [1.1, 0.9, 1], [0, 2.1, 0.82], SKIN, jaw, 8);
  for (const s of [1, -1]) {
    // brow
    b.rod([s * 0.04, 2.39, 0.77], [s * 0.18, 2.44, 0.68], 0.045, SKIN_DK, { bone: head, caps: "round", sides: 6 });
    // eyes
    ball(0.045, [1, 1, 0.7], [s * 0.09, 2.355, 0.735], DARK, head, 6);
    glow(b.part(new THREE.SphereGeometry(0.032, 8, 6), "#ffcf2a", { bone: head, at: [s * 0.09, 2.36, 0.74] }), 0.8);
    b.part(new THREE.BoxGeometry(0.008, 0.03, 0.01), DARK, { bone: head, at: [s * 0.09, 2.36, 0.772] });
    // ears
    b.spike([s * 0.19, 2.38, 0.5], [s * 0.9, 0.5, -0.3], 0.27, 0.075, SKIN_DK, { bone: head, sides: 6 });
    b.spike([s * 0.2, 2.38, 0.53], [s * 0.9, 0.5, -0.3], 0.2, 0.045, PINK, { bone: head, sides: 6 });
    b.part(new THREE.TorusGeometry(0.03, 0.007, 5, 10), BRONZE, {
      bone: head,
      at: [s * 0.29, 2.34, 0.46],
      rotation: [0, 90, 0],
    });
    // tusks
    b.sweep(
      catmull([
        [s * 0.11, 2.14, 0.74],
        [s * 0.17, 2.2, 0.84],
        [s * 0.19, 2.36, 0.88],
        [s * 0.15, 2.5, 0.82],
      ]),
      [0.05, 0],
      { color: IVORY, bands: [[0.2, IVORY_SH]], bone: jaw, caps: { start: "round", end: "point" }, sides: 7 },
    );
    // beaded dreadlocks
    const lock = catmull([
      [s * 0.18, 2.42, 0.4],
      [s * 0.24, 2.3, 0.36],
      [s * 0.26, 2.15, 0.38],
    ]);
    b.sweep(lock, 0.014, ROPE_DK, { bone: head, sides: 5 });
    [0.3, 0.65, 1].forEach((t, i) =>
      ball(0.022, [1, 1, 1], lock.at(t), BEADS[(i + (s > 0 ? 0 : 1)) % 4], head, 6),
    );
  }
  for (const x of [-0.07, -0.035, 0.035, 0.07])
    b.spike([x, 2.19, 0.84], [0, -1, 0], 0.05, 0.014, BONE, { bone: head, sides: 5 });
  for (const x of [-0.05, 0, 0.05])
    b.spike([x, 2.19, 0.85], [0, 1, 0.2], 0.05, 0.014, BONE, { bone: jaw, sides: 5 });

  // ---------------------------------------------------------------- mohawk
  const crest = catmull([
    [0, 2.45, 0.78],
    [0, 2.52, 0.62],
    [0, 2.55, 0.45],
    [0, 2.42, 0.28],
    [0, 2.22, 0.16],
    [0, 2.0, 0.1],
  ]);
  const crestFrames = [];
  for (let i = 0; i < 34; i++) {
    const t = i / 33;
    const p = crest.at(t);
    crestFrames.push(frame([p.x + (rand() - 0.5) * 0.06, p.y, p.z], [0, 1, -0.2 - t * 0.8]));
  }
  b.cards(crestFrames, MOHAWK, {
    size: [0.08, 0.34],
    lean: 25,
    bend: 25,
    flow: [0, 0, -1],
    vary: 0.3,
    spin: 15,
    rng: rand,
    cross: true,
    bone: head,
  });

  // ------------------------------------------------------------------ arms
  const arms: Record<string, ReturnType<typeof b.chain>> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const root = [s * 0.68, 1.95, 0.1];
    const wrist = [s * 0.98, 0.9, 0.35];
    const pts = limb(root, wrist, [0.62, 0.6], [0, 0, -1]);
    const arm = b.chain(`arm${side}`, pts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    arms[side] = arm;
    const shoulder = arm.joints[0];
    const wristJ = arm.joints[2];
    const armTube = b.sweep(arm, [0.25, 0.21, 0.19, 0.17], { color: SKIN, sides: 9 });
    ball(1, [0.32, 0.3, 0.3], [s * 0.72, 1.95, 0.1], SKIN, shoulder, 12);
    ball(0.22, [1, 1.1, 1], lerp(pts[0], pts[1], 0.45).add(new THREE.Vector3(s * 0.03, 0, 0)), SKIN, shoulder, 9);
    ball(0.2, [1, 1.1, 1], lerp(pts[1], pts[2], 0.35), SKIN, arm.joints[1], 9);
    ball(0.14, [1, 1, 1], [pts[1].x, pts[1].y, pts[1].z - 0.06], SKIN_DK, arm.joints[1], 8);
    const skinA = b.surface(armTube);
    for (const h of skinA.scatter(7, { rng: rand, minDist: 0.12 }))
      b.stick(new THREE.SphereGeometry(0.028, 6, 4), WART, h, { embed: 0.5 });
    // rope + bone wraps
    for (const t of [0.7, 0.9]) {
      const band = b.ring(arm.at(t), { count: 8, radius: 0.185 });
      b.sweep(catmull(band.items, { closed: true }), 0.03, ROPE, { sides: 5 });
      band.items.forEach((it, i) => {
        if (i % 2 === 0) b.spike(it, it, 0.12 + 0.03 * (i % 4 === 0 ? 1 : 0), 0.03, BONE, { sides: 6 });
      });
    }
    // hand
    ball(1, [0.12, 0.17, 0.2], [wrist[0], wrist[1] - 0.12, wrist[2] + 0.07], SKIN, wristJ, 10);
    [-0.07, 0.03, 0.13, 0.23].forEach((dz, i) => {
      const k = i === 3 ? 0.8 : 1;
      const path = catmull([
        [wrist[0], wrist[1] - 0.2, wrist[2] + dz],
        [wrist[0] - s * 0.02, wrist[1] - 0.2 - 0.16 * k, wrist[2] + dz + 0.06],
        [wrist[0] - s * 0.08, wrist[1] - 0.2 - 0.27 * k, wrist[2] + dz],
      ]);
      const fch = b.chain(`finger${side}${i}`, path, {
        parent: wristJ,
        names: [`finger${side}${i}a`, `finger${side}${i}b`, `finger${side}${i}c`],
        role: "digit",
      });
      b.sweep(fch, [0.05 * k, 0.04 * k, 0.03 * k], { color: SKIN, sides: 6 });
      ball(0.05, [1, 1, 1], path.at(0), SKIN, wristJ, 6);
      b.spike(path.at(1), path.tangentAt(1), 0.1, 0.03, CLAW, { bone: fch.joints[2], sides: 6 });
    });
  }
  // wrist trophy skull
  skull([0.99, 0.82, 0.33], [0.3, -0.7, 0.4], 0.12, arms["L"].joints[2], false);

  // ------------------------------------------------------------------ legs
  const legs: Array<ReturnType<typeof b.chain>> = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const root = [s * 0.3, 1.1, 0];
    const foot = [s * 0.4, 0.14, 0.12];
    const pts = limb(root, foot, [0.55, 0.55], [0, 0, 1]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [foot[0], 0, foot[2]],
    });
    legs.push(leg);
    const ankle = leg.joints[2];
    b.sweep(leg, [0.3, 0.24, 0.17], { color: SKIN, sides: 9 });
    ball(0.27, [1, 1.1, 1], lerp(pts[0], pts[1], 0.45), SKIN, leg.joints[0], 10);
    ball(0.14, [1, 1, 1], [pts[1].x, pts[1].y, pts[1].z + 0.08], SKIN_DK, leg.joints[1], 8);
    ball(0.17, [1, 1.1, 1], lerp(pts[1], pts[2], 0.3), SKIN, leg.joints[1], 9);
    ball(1, [0.2, 0.13, 0.33], [foot[0], 0.13, foot[2] + 0.16], SKIN, ankle, 10);
    for (let i = 0; i < 4; i++) {
      const x = foot[0] + (i - 1.5) * 0.075;
      ball(1, [0.055, 0.05, 0.09], [x, 0.07, foot[2] + 0.5], SKIN, ankle, 6);
      b.spike([x, 0.065, foot[2] + 0.56], [0, -0.15, 1], 0.09, 0.035, CLAW, { bone: ankle, sides: 6 });
    }
    for (const t of [0.8, 0.93]) {
      const band = b.ring(leg.at(t), { count: 8, radius: 0.2 });
      b.sweep(catmull(band.items, { closed: true }), 0.03, ROPE_DK, { sides: 5 });
      band.items.forEach((it, i) => {
        if (i % 2 === 0) b.spike(it, it, 0.1, 0.028, BONE, { sides: 6 });
      });
    }
  }

  // ------------------------------------------------------------ warts, moss
  for (const h of skin.scatter(26, { rng: rand, minDist: 0.14 }))
    b.stick(new THREE.SphereGeometry(0.03, 6, 4), WART, h, { embed: 0.5 });
  const topSkin = b.surface([torso, hump, gut]);
  b.cards(
    topSkin.scatter(70, { rng: rand, minDist: 0.1, filter: (h) => h.n.y > 0.5 }),
    MOSS,
    { size: [0.09, 0.1], lean: 60, flow: [0, 0, -1], vary: 0.4, spin: 40, rng: rand },
  );

  // ------------------------------------------------------------ loincloth
  const ell = (y: number, rx: number, rz: number, cz: number) =>
    Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return [rx * Math.sin(a), y, cz + rz * Math.cos(a)];
    });
  const belt = skin.drape(catmull(ell(1.3, 0.45, 0.38, 0.05), { closed: true }), { lift: 0.03 });
  b.sweep(belt, 0.05, ROPE, { sides: 6, bone: hips });
  b.sweep(
    skin.drape(catmull(ell(1.2, 0.46, 0.4, 0.04), { closed: true }), { lift: 0.03 }),
    0.025,
    ROPE_DK,
    { sides: 5, bone: hips },
  );
  b.along(belt, 14, (at) => b.part(new THREE.SphereGeometry(0.02, 6, 4), BRONZE, { at, bone: hips }));
  let k = 0;
  b.along(belt, 12, (at) => {
    if (k++ % 2 === 0) b.spike(at, [0, -1, 0], 0.1 + rand() * 0.08, 0.022, BONE, { bone: hips, sides: 6 });
  });
  const stripAngles: number[] = [];
  for (let i = 0; i < 11; i++) stripAngles.push(-75 + i * 15);
  for (let i = 0; i < 5; i++) stripAngles.push(120 + i * 30);
  stripAngles.forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const w = 0.065 + rand() * 0.03;
    const len = 0.45 + rand() * 0.4;
    const x = [Math.cos(a), 0, -Math.sin(a)];
    const col = i % 3 === 0 ? RED_CLOTH : i % 3 === 1 ? BROWN_CLOTH : "#5a1616";
    b.extrude(
      [
        [-w, 0],
        [-w * 0.9, -len * 0.9],
        [0, -len],
        [w * 0.9, -len * 0.8],
        [w, 0],
      ],
      {
        at: [0.46 * Math.sin(a) + (i % 2 ? 0.02 : 0) * Math.sin(a), 1.3, 0.05 + 0.4 * Math.cos(a) + 0.03 + (i % 2 ? 0.015 : 0)],
        x,
        thickness: 0.018,
        color: col,
        bone: hips,
      },
    );
  });
  // totem and bone charms
  b.rod([0, 1.28, 0.47], [0, 1.0, 0.5], 0.01, ROPE_DK, { bone: hips, sides: 4 });
  b.part(new THREE.BoxGeometry(0.1, 0.22, 0.03), WOOD, { bone: hips, at: [0, 0.9, 0.5] });
  b.part(new THREE.PlaneGeometry(0.08, 0.08), "#ffffff", {
    bone: hips,
    at: [0, 0.92, 0.517],
    dir: [0, 0, 1],
    axis: "z",
    texture: SPIRAL,
  });
  for (const s of [1, -1]) {
    const x = s * 0.38;
    b.rod([x, 1.28, 0.3], [x, 0.95 - (s > 0 ? 0 : 0.1), 0.34], 0.022, BONE, { bone: hips, caps: "round", sides: 6 });
    ball(0.04, [1, 1, 1], [x, 0.95 - (s > 0 ? 0 : 0.1), 0.34], BONE, hips, 6);
    ball(0.04, [1, 1, 1], [x, 1.26, 0.3], BONE, hips, 6);
  }
  b.part(new THREE.TorusGeometry(0.06, 0.013, 6, 12), BONE, { bone: hips, at: [0.2, 1.22, 0.5], rotation: [0, 0, 0] });
  skull(front(1.32).add(new THREE.Vector3(0, 0, 0.09)), [0, -0.3, 1], 0.2, hips, false);
  for (const s of [1, -1])
    skull(front(1.32, s * 0.28).add(new THREE.Vector3(0, 0, 0.07)), [s * 0.4, -0.3, 1], 0.13, hips, false);

  // -------------------------------------------------------------- necklace
  const neckRough = (s: number) => [
    [s * 0.3, 2.12, 0.15],
    [s * 0.3, 2.0, 0.5],
    [s * 0.15, 1.82, 0.62],
  ];
  const cord = skin.drape(
    catmull([...neckRough(1), [0, 1.74, 0.64], ...neckRough(-1).reverse()]),
    { lift: 0.025 },
  );
  b.sweep(cord, 0.022, ROPE_DK, { sides: 5, bone: chest });
  let n = 0;
  b.along(cord, 11, (at) => {
    const big = n % 2 === 0;
    n++;
    b.spike(at, [0, -1, 0.15], big ? 0.17 : 0.11, big ? 0.03 : 0.022, BONE, { bone: chest, sides: 6 });
    if (!big) ball(0.022, [1, 1, 1], at.at.clone().add(new THREE.Vector3(0, 0.0, 0.02)), BEADS[n % 4], chest, 6);
  });
  skull(front(1.62).add(new THREE.Vector3(0, 0, 0.04)), [0, -0.5, 0.85], 0.17, chest, false);
  b.part(new THREE.CircleGeometry(0.065, 14), "#ffffff", {
    bone: chest,
    at: front(1.8).add(new THREE.Vector3(0, 0, 0.035)),
    dir: [0, 0, 1],
    axis: "z",
    texture: SPIRAL,
  });
  const collar = b.ring(neck.at(0.6), { count: 9, radius: 0.2 });
  b.sweep(catmull(collar.items, { closed: true }), 0.022, ROPE_DK, { sides: 5 });
  collar.items.forEach((it, i) => {
    if (i % 2 === 0) b.spike(it, it, 0.06, 0.02, BONE, { sides: 5 });
  });

  // ---------------------------------------------------- shoulder pelt trophy
  const shL = arms["L"].joints[0];
  b.part(new THREE.SphereGeometry(1, 10, 7), HIDE, {
    bone: shL,
    at: [0.74, 2.2, 0.08],
    scale: [0.4, 0.16, 0.36],
  });
  const rim: ReturnType<typeof frame>[] = [];
  const mossRim: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const f = frame([0.74 + 0.38 * Math.sin(a), 2.15, 0.08 + 0.34 * Math.cos(a)], [0, 1, 0]);
    (i % 3 === 0 ? mossRim : rim).push(f);
  }
  b.cards(rim, FUR, { size: [0.1, 0.28], lean: 180, flow: [0, 0, 1], vary: 0.3, rng: rand, bone: shL });
  b.cards(mossRim, MOSS, { size: [0.12, 0.3], lean: 180, flow: [0, 0, 1], vary: 0.3, rng: rand, bone: shL });
  skull([0.62, 2.32, 0.12], [0, 0.5, 1], 0.17, shL, true);
  skull([0.88, 2.28, 0.15], [0.5, 0.2, 1], 0.14, shL, false);
  b.spike([0.55, 2.3, -0.05], [-0.2, 1, -0.3], 0.32, 0.055, BONE, { bone: shL, sides: 6 });
  const shR = arms["R"].joints[0];
  b.ring(frame([-0.74, 2.22, 0.08], [0, 1, 0]), { count: 6, radius: 0.28 }, (it) =>
    b.spike(it, it, 0.14, 0.035, BONE, { bone: shR, sides: 6 }),
  );

  void legs;
  return b.root;

  // --------------------------------------------------------------- helpers
  function skull(at: number[] | THREE.Vector3, dir: number[], s: number, bone: Joint, horned: boolean) {
    const f = frame(at, dir, [0, 1, 0]);
    b.part(new THREE.SphereGeometry(0.5, 8, 6), BONE, { frame: f, bone, scale: [s * 0.85, s, s * 0.8] });
    b.part(new THREE.BoxGeometry(s * 0.45, s * 0.55, s * 0.32), BONE, {
      frame: f.moved([0, s * 0.62, -s * 0.12]),
      bone,
    });
    b.part(new THREE.BoxGeometry(s * 0.38, s * 0.5, s * 0.14), BONE_SH, {
      frame: f.moved([0, s * 0.55, -s * 0.38]),
      bone,
    });
    for (const sg of [1, -1]) {
      b.part(new THREE.SphereGeometry(s * 0.15, 6, 4), DARK, {
        frame: f.moved([sg * s * 0.22, s * 0.3, s * 0.12]),
        bone,
      });
      if (horned)
        b.spike(f.moved([sg * s * 0.35, 0, s * 0.3]), [sg * 0.8, 0.7, 0.1], s * 1.1, s * 0.14, BONE, {
          bone,
          sides: 6,
        });
    }
    b.part(new THREE.SphereGeometry(s * 0.08, 5, 4), DARK, { frame: f.moved([0, s * 0.9, -s * 0.08]), bone });
  }
}
