```ts
import * as THREE from "three";
import {
  createBuilder, frame, catmull, bezier, svg, rng,
  paint, mix, noise, grain
} from "agentic-3js-builder";
import { animeEye, cel } from "agentic-3js-builder/kits/toon";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";
import type { Joint, Fill, PointInput } from "agentic-3js-builder";

export const meta = {
  name: "Sylva — Warden of the Silverwood",
  description:
    "An anime elven ranger in emerald leaf armour, with silver-blond hair, a moonwood bow, embroidered cloak and a full quiver. Built in a separated, rig-ready rest pose on a small forest shrine."
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Silverwood ranger", paintSize: 2048 });
  const random = rng(319);
  const C = {
    ink: "#202936",
    green: "#235d4a",
    darkGreen: "#153b36",
    mint: "#a4d3a2",
    gold: "#dfb866",
    lightGold: "#f6df9d",
    leather: "#694735",
    darkLeather: "#392d2c",
    sole: "#252b30",
    cream: "#eee5c4",
    skin: "#f5d3b9",
    blush: "#d98f87",
    hair: "#e6e9d0",
    silver: "#b9d8d4",
    cyan: "#97ffda"
  };
  const skin = cel(C.skin, "#dca7a0");
  const green = cel("#377e59", "#204e43");
  const greenLight = cel("#5e9870", "#315c50");
  const greenDark = cel(C.darkGreen, "#132e33");
  const gold = metal("gilt", { polish: 0.35, tarnish: 0.12 });
  const steel = metal("steel", { polish: 0.25, tarnish: 0.15 });
  const leather = grain("#553a2f", "#79553b", { size: 0.014, axis: "y", seed: 8 });
  const wood = grain("#7a4931", "#d7a465", { size: 0.019, axis: "y", seed: 7 });
  const hairPaint = paint((p, n) => {
    const streak = 0.5 + 0.5 * Math.sin(p.x * 310 + p.y * 12 + p.z * 90);
    return mix(n.y > -0.3 ? "#eef0d6" : "#acbeb2", "#d0d9bc", streak * 0.25);
  });
  const stone = paint((p, n) =>
    mix(n.y > 0.45 ? "#667e77" : "#344c4e", "#879387", noise(p, 0.12, 2) * 0.45)
  );

  // Drawings are shared across repeated panels and accessories.
  const eyeTexture = animeEye({
    iris: "#44b9a4", irisLight: "#b0f3bf",
    irisDark: "#27696e", ink: "#283246", blush: false, brow: false
  });

  const brocade = svg(`
    <svg viewBox="0 0 120 200">
      <rect width="120" height="200" fill="#245446"/>
      <path d="M8 0V200M112 0V200" stroke="#b5c588" stroke-width="4"/>
      <path d="M16 0V200M104 0V200" stroke="#66866a" stroke-width="2"/>
      <path d="M60 185V20 M60 150Q20 132 29 108Q61 112 60 150
               M60 122Q97 102 91 80Q61 87 60 122
               M60 91Q31 76 35 52Q61 60 60 91
               M60 57Q82 38 60 17Q40 36 60 57"
            fill="#829e6d" stroke="#d9d09a" stroke-width="2.5"/>
      <path d="M30 184L60 167L90 184M25 14L37 26M95 14L83 26"
            fill="none" stroke="#d9d09a" stroke-width="3"/>
    </svg>`, { size: 512 });

  const leafEmblem = svg(`
    <svg viewBox="0 0 100 100">
      <path d="M50 6L87 27L82 68L50 94L18 68L13 27Z"
            fill="#183d3b" stroke="#efd28b" stroke-width="5"/>
      <path d="M50 79C17 60 27 32 69 19C76 49 69 67 50 79Z"
            fill="#8cba8a" stroke="#e8dda4" stroke-width="3"/>
      <path d="M39 73L65 28M48 58L32 47M55 46L69 43"
            stroke="#e8dda4" stroke-width="3" fill="none"/>
      <circle cx="50" cy="86" r="3" fill="#f5e5ad"/>
    </svg>`, { size: 256 });

  const cloakBorder = svg(`
    <svg viewBox="0 0 96 192">
      <rect width="96" height="192" fill="#285d50"/>
      <path d="M7 0V192M89 0V192" stroke="#d6c890" stroke-width="4"/>
      <path d="M48 0Q3 24 48 48T48 96T48 144T48 192
               M48 0Q93 24 48 48T48 96T48 144T48 192"
            stroke="#a4bb89" fill="none" stroke-width="3"/>
      <path d="M48 15L62 24L48 33L34 24Z
               M48 63L62 72L48 81L34 72Z
               M48 111L62 120L48 129L34 120Z
               M48 159L62 168L48 177L34 168Z"
            fill="#d6c890"/>
    </svg>`, { size: 384 });

  const runes = svg(`
    <svg viewBox="0 0 64 256">
      <path d="M32 8V248M18 32L32 16L46 32M19 55L32 68L45 55
               M16 95L32 79L48 95L32 111Z
               M17 139L32 124L47 139M17 151L32 166L47 151
               M16 199L32 183L48 199L32 215Z
               M18 234L32 248L46 234"
            fill="none" stroke="#adf9cd" stroke-width="4"/>
    </svg>`, { size: 384 });

  const plaqueTexture = svg(`
    <svg viewBox="0 0 320 90">
      <rect x="3" y="3" width="314" height="84" rx="12"
            fill="#233f41" stroke="#c9ba83" stroke-width="5"/>
      <path d="M16 45H46M274 45H304" stroke="#c9ba83" stroke-width="3"/>
      <text x="160" y="39" text-anchor="middle" fill="#f1dfae"
            font-family="serif" font-size="27" letter-spacing="5">SYLVA</text>
      <text x="160" y="66" text-anchor="middle" fill="#b7d2b8"
            font-family="serif" font-size="13" letter-spacing="2">SILVERWOOD WARDEN</text>
    </svg>`, { size: 512 });

  // Skeleton first: an easy-to-read A/T rest pose, including all fingers.
  const hips = b.joint("hips", { at: [0, 0.99, 0], role: "spine" });
  const spine = b.chain("spine", [
    [0, 0.99, 0], [0, 1.17, 0], [0, 1.39, 0]
  ], { parent: hips, names: ["spineLower", "chest", "chestTop"], role: "spine" });
  const neck = b.chain("neck", [
    [0, 1.39, 0], [0, 1.52, 0], [0, 1.57, 0.015]
  ], { parent: spine.tip!, names: ["neckBase", "neckTop"], role: "neck" });
  const head = b.joint("head", {
    parent: neck.joints[1], at: [0, 1.72, 0.015], dir: [0, 0, 1], role: "head"
  });
  const jaw = b.joint("jaw", {
    parent: head, at: [0, 1.635, 0.025], dir: [0, 0, 1], role: "jaw"
  });

  const sides = [1, -1].map(s => {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(`leg${side}`, [
      [s * 0.105, 0.98, 0], [s * 0.14, 0.59, 0.025],
      [s * 0.17, 0.235, 0], [s * 0.17, 0.16, 0.09]
    ], {
      parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
      role: "leg", contact: [s * 0.17, 0.1, 0.09]
    });
    const arm = b.chain(`arm${side}`, [
      [s * 0.205, 1.395, 0], [s * 0.49, 1.335, 0],
      [s * 0.76, 1.28, 0.015], [s * 0.84, 1.265, 0.015]
    ], {
      parent: spine.tip!, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      role: "arm"
    });
    const fingers = [0, 1, 2, 3].map(i => b.chain(`finger${side}${i + 1}`, [
      [s * 0.865, 1.274, -0.026 + i * 0.025],
      [s * (0.922 + (i === 1 ? 0.012 : 0)), 1.26, -0.033 + i * 0.03],
      [s * (0.963 + (i === 1 ? 0.014 : 0)), 1.245, -0.036 + i * 0.034]
    ], { parent: arm.tip!, count: 2, role: "digit" }));
    const thumb = b.chain(`thumb${side}`, [
      [s * 0.825, 1.259, 0.054], [s * 0.85, 1.225, 0.089],
      [s * 0.887, 1.215, 0.104]
    ], { parent: arm.tip!, count: 2, role: "digit" });
    return { s, side, leg, arm, fingers, thumb };
  });

  const capeJoints = b.chain("cloak", [
    [0, 1.42, -0.12], [0, 1.02, -0.19], [0, 0.57, -0.26], [0, 0.32, -0.28]
  ], { parent: spine.tip!, count: 3, role: "fan" });

  function ellipsoid(
    name: string, at: PointInput, size: number[], color: Fill, bone: Joint
  ) {
    return b.part(new THREE.SphereGeometry(1, 12, 8), color, {
      at, scale: size, bone, name, flat: true
    });
  }
  function box(
    name: string, at: PointInput, size: number[], color: Fill, bone: Joint,
    rotation: number[] = [0, 0, 0]
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at, bone, name, rotation
    });
  }
  function bead(at: PointInput, radius: number, color: Fill, bone: Joint) {
    return b.part(new THREE.IcosahedronGeometry(radius, 0), color, { at, bone });
  }
  function drawing(
    name: string, texture: THREE.Texture, at: PointInput, w: number, h: number,
    bone: Joint, dir: number[] = [0, 0, 1]
  ) {
    return b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
      name, at, bone, texture, dir, axis: "z"
    });
  }
  function leafPlate(
    name: string, at: PointInput, w: number, h: number, color: Fill, bone: Joint,
    x: number[] = [1, 0, 0], y: number[] = [0, 1, 0]
  ) {
    return b.extrude([
      [-w * 0.5, h * 0.32], [-w * 0.38, h * 0.78], [0, h],
      [w * 0.38, h * 0.78], [w * 0.5, h * 0.32], [0, 0]
    ], { at, x, y, thickness: 0.018, bevel: 0.003, color, bone, name });
  }

  // The face is deliberately unobstructed: large turquoise eyes and long elven ears.
  const skull = ellipsoid("face", [0, 1.732, 0.019], [0.143, 0.177, 0.119], skin, head);
  ellipsoid("separate_lower_jaw", [0, 1.631, 0.049], [0.092, 0.069, 0.085], skin, jaw);
  for (const s of [1, -1]) {
    b.decal(skull, eyeTexture, {
      at: [s * 0.064, 1.752, 0.13],
      dir: [s * 0.12, 0, 1], size: [0.087, 0.115],
      mirror: s > 0, bone: head, lift: 0.002, segments: 8
    });
    b.sweep(bezier(
      [s * 0.028, 1.817, 0.117],
      [s * 0.064, 1.836, 0.115],
      [s * 0.101, 1.819, 0.092]
    ), 0.004, { color: "#7d8b75", bone: head, sides: 5 });
    b.extrude([
      [0, -0.038], [0.055, -0.022], [0.17, 0.085],
      [0.068, 0.069], [0, 0.043]
    ], {
      at: [s * 0.116, 1.733, 0.005], x: [s, 0, -0.18], y: [0, 1, 0],
      thickness: 0.029, bevel: 0.005, color: skin, bone: head, name: `pointed_ear_${s}`
    });
    b.extrude([
      [0.023, -0.018], [0.07, 0.006], [0.132, 0.064], [0.039, 0.038]
    ], {
      at: [s * 0.116, 1.733, 0.022], x: [s, 0, -0.18], y: [0, 1, 0],
      thickness: 0.004, color: "#d49a90", bone: head
    });
    b.part(new THREE.TorusGeometry(0.021, 0.004, 5, 10), gold, {
      at: [s * 0.174, 1.709, 0.013], bone: head
    });
    bead([s * 0.174, 1.68, 0.016], 0.012, "#72c6b3", head);
  }
  b.part(new THREE.ConeGeometry(0.017, 0.038, 4), skin, {
    at: [0, 1.699, 0.135], dir: [0, -0.25, 1], bone: head
  });
  b.sweep([[ -0.027, 1.66, 0.13 ], [0, 1.657, 0.138], [0.027, 1.662, 0.13]],
    0.0027, { color: "#a45e66", bone: head, sides: 5 });
  b.sweep([[-0.018, 1.65, 0.131], [0, 1.647, 0.135], [0.018, 1.65, 0.131]],
    0.0025, { color: "#efb4ac", bone: jaw, sides: 5 });

  // Hair is a simple faceted cap plus broad tapered locks, rather than fine strands.
  b.part(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, 1.5), hairPaint, {
    at: [0, 1.762, 0.002], scale: [0.151, 0.168, 0.13],
    bone: head, name: "silver_hair_cap", flat: true
  });
  function hairLock(name: string, points: number[][], width: number) {
    return b.sweep(catmull(points), t => [width * (1 - t * 0.92), 0.018 * (1 - t * 0.8)], {
      color: hairPaint, bone: head, section: { ngon: 5 }, caps: "flat", name
    });
  }
  hairLock("swept_fringe_L", [
    [-0.04, 1.916, 0.055], [0.042, 1.888, 0.115], [0.104, 1.811, 0.104]
  ], 0.044);
  hairLock("swept_fringe_R", [
    [-0.035, 1.915, 0.051], [-0.094, 1.877, 0.099], [-0.126, 1.798, 0.067]
  ], 0.045);
  hairLock("central_fringe", [
    [-0.012, 1.907, 0.082], [0.011, 1.869, 0.13], [0.024, 1.819, 0.13]
  ], 0.023);
  for (const s of [1, -1]) {
    hairLock(`temple_lock_${s}`, [
      [s * 0.122, 1.845, 0.024], [s * 0.139, 1.715, 0.041],
      [s * 0.13, 1.586, 0.025]
    ], 0.033);
    hairLock(`back_lock_${s}`, [
      [s * 0.09, 1.85, -0.088], [s * 0.142, 1.645, -0.098],
      [s * 0.116, 1.465, -0.105]
    ], 0.055);
    for (let i = 0; i < 5; i++) {
      const y = 1.733 - i * 0.043;
      ellipsoid(`braid_${s}_${i}`, [s * (0.146 + (i % 2 ? 0.009 : -0.004)), y, -0.039],
        [0.021, 0.029, 0.022], hairPaint, head);
    }
    b.rod([s * 0.148, 1.529, -0.039], [s * 0.148, 1.548, -0.039], 0.023, {
      color: gold, bone: head, sides: 8
    });
  }
  b.sweep(bezier([-0.127, 1.855, 0.071], [0, 1.895, 0.125], [0.127, 1.855, 0.071]),
    0.007, { color: gold, bone: head, sides: 6 });
  leafPlate("forehead_diadem", [0, 1.839, 0.135], 0.038, 0.055, gold, head);
  bead([0, 1.865, 0.149], 0.013, "#7ad3b4", head);

  // Fitted tunic, pale neck, layered shoulder leaves.
  b.sweep(neck, 0.057, { color: skin, sides: 8, name: "neck_skin" });
  const torso = b.loft([
    { at: [0, 0.98, 0], w: 0.27, h: 0.19 },
    { at: [0, 1.1, 0], w: 0.245, h: 0.17 },
    { at: [0, 1.26, 0], w: 0.33, h: 0.205 },
    { at: [0, 1.38, 0], w: 0.405, h: 0.2 },
    { at: [0, 1.425, 0], w: 0.275, h: 0.17 }
  ], { bone: spine, color: green, sides: 8, name: "fitted_emerald_tunic" });

  b.decal(torso, leafEmblem, {
    at: [0, 1.305, 0.112], dir: [0, 0, 1], size: [0.115, 0.135],
    bone: spine.joints[1], lift: 0.002
  });
  for (const s of [1, -1]) {
    b.sweep([
      [s * 0.055, 1.467, 0.037], [s * 0.12, 1.408, 0.09], [s * 0.042, 1.357, 0.114]
    ], 0.012, { color: C.gold, bone: spine.tip!, sides: 6 });
    leafPlate(`collar_leaf_${s}`, [s * 0.087, 1.365, 0.089],
      0.075, 0.105, greenLight, spine.tip!, [s, 0, 0], [-s * 0.35, 1, 0]);
  }
  for (const { s, side, arm, leg, fingers, thumb } of sides) {
    b.sweep(arm, t => t < 0.49 ? 0.062 - t * 0.035 : 0.044 - (t - 0.49) * 0.023, {
      color: skin, sides: 8, to: 0.89, name: `arm_skin_${side}`
    });
    b.sweep(arm, [0.083, 0.064], {
      color: greenDark, from: 0, to: 0.28, sides: 8, name: `sleeve_${side}`
    });
    for (let i = 0; i < 3; i++) {
      const x = s * (0.205 + i * 0.053);
      leafPlate(`shoulder_leaf_${side}_${i}`, [x, 1.354 - i * 0.013, 0.043],
        0.123 - i * 0.013, 0.143 - i * 0.012,
        i % 2 ? greenLight : green, arm.joints[0],
        [s, 0, 0], [s * 0.25, 1, -0.12]);
      b.rod([x, 1.365 - i * 0.013, 0.057], [x + s * 0.023, 1.474 - i * 0.023, 0.043],
        0.003, { color: C.gold, bone: arm.joints[0], sides: 5 });
    }
    b.sweep(arm, [0.058, 0.045], {
      color: leather, from: 0.53, to: 0.88, sides: 8, name: `archery_bracer_${side}`
    });
    for (const t of [0.55, 0.83]) {
      b.sweep(arm, 0.059 - (t - 0.55) * 0.04, {
        color: gold, from: t, to: t + 0.035, sides: 8
      });
    }
    leafPlate(`bracer_leaf_${side}`, [s * 0.64, 1.257, 0.058],
      0.088, 0.12, greenDark, arm.joints[1], [1, 0, 0], [s, 0.2, 0]);
    for (let i = 0; i < 4; i++) {
      bead([s * (0.58 + i * 0.035), 1.297 - i * 0.007, 0.061], 0.006, C.gold, arm.joints[1]);
    }
    ellipsoid(`gloved_palm_${side}`, [s * 0.839, 1.267, 0.016],
      [0.055, 0.034, 0.054], leather, arm.tip!);
    for (const finger of fingers) {
      b.sweep(finger, [0.011, 0.008], { color: skin, sides: 6 });
      b.sweep(finger, [0.012, 0.011], { color: leather, sides: 6, to: 0.3 });
    }
    b.sweep(thumb, [0.014, 0.01], { color: skin, sides: 6 });

    b.sweep(leg, t => 0.082 - t * 0.037, {
      color: cel("#c4c9ab", "#8b9d8d"), to: 0.77, sides: 8, name: `leggings_${side}`
    });
    b.sweep(leg, [0.074, 0.052], {
      color: leather, from: 0.45, to: 0.92, sides: 8, name: `tall_boot_${side}`
    });
    box(`boot_sole_${side}`, [s * 0.17, 0.121, 0.074], [0.14, 0.041, 0.245], C.sole, leg.tip!);
    ellipsoid(`boot_toe_${side}`, [s * 0.17, 0.169, 0.1],
      [0.073, 0.054, 0.128], leather, leg.tip!);
    leafPlate(`shin_guard_${side}`, [s * 0.16, 0.26, 0.063],
      0.107, 0.265, greenDark, leg.joints[1]);
    b.rod([s * 0.16, 0.291, 0.078], [s * 0.16, 0.486, 0.078],
      0.004, { color: C.gold, bone: leg.joints[1], sides: 5 });
    for (let i = 0; i < 5; i++) {
      const y = 0.295 + i * 0.042;
      b.rod([s * 0.16 - 0.031, y, 0.077], [s * 0.16 + 0.031, y + 0.023, 0.077],
        0.0035, { color: "#b59b6c", bone: leg.joints[1], sides: 5 });
      b.rod([s * 0.16 + 0.031, y, 0.078], [s * 0.16 - 0.031, y + 0.023, 0.078],
        0.0035, { color: "#b59b6c", bone: leg.joints[1], sides: 5 });
    }
    leafPlate(`knee_leaf_${side}`, [s * 0.14, 0.535, 0.082],
      0.117, 0.123, greenLight, leg.joints[1]);
    bead([s * 0.14, 0.602, 0.099], 0.012, gold, leg.joints[1]);
  }

  // Split leaf-skirt panels leave both legs distinct.
  for (const s of [1, -1]) {
    b.extrude([
      [-0.055, 0], [-0.109, -0.22], [-0.016, -0.33],
      [0.069, -0.235], [0.067, 0]
    ], {
      at: [s * 0.104, 1.02, 0.016], x: [s, 0, 0], y: [0, 1, -0.22],
      thickness: 0.035, bevel: 0.005, color: green, bone: hips, name: `split_tunic_${s}`
    });
    b.sweep([
      [s * 0.165, 1.015, 0.046], [s * 0.211, 0.802, 0.097], [s * 0.121, 0.707, 0.115]
    ], 0.006, { color: C.gold, bone: hips, sides: 5 });
  }
  b.extrude([
    [-0.073, 0], [0.073, 0], [0.081, -0.25], [0, -0.335], [-0.081, -0.25]
  ], {
    at: [0, 1.012, 0.121], x: [1, 0, 0], y: [0, 1, -0.05],
    thickness: 0.012, color: greenDark, bone: hips, name: "embroidered_front_tabard"
  });
  drawing("tabard_brocade", brocade, [0, 0.87, 0.139], 0.14, 0.264, hips);

  const beltLoop = b.surface(torso).loop([0, 1.055, 0], { dir: [0, 1, 0], lift: 0.006 });
  b.sweep(beltLoop, 0.026, { color: leather, sides: 6, bone: hips, name: "waist_belt" });
  box("belt_buckle", [0, 1.055, 0.125], [0.067, 0.06, 0.021], gold, hips);
  box("buckle_inset", [0, 1.055, 0.138], [0.043, 0.035, 0.008], C.darkLeather, hips);
  b.rod([-0.027, 1.055, 0.145], [0.022, 1.055, 0.145], 0.004, { color: C.gold, bone: hips });
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      bead([s * (0.047 + i * 0.024), 1.057, 0.114 - i * 0.007], 0.0045, gold, hips);
    }
  }

  // Backpack strap follows the tunic rather than cutting a chord through it.
  const strap = b.surface(torso).drape([
    [-0.155, 1.4, 0.081], [-0.08, 1.29, 0.12], [0.03, 1.16, 0.12], [0.105, 1.065, 0.1]
  ], { lift: 0.013 });
  b.sweep(strap, 0.018, { color: leather, sides: 6, name: "quiver_shoulder_strap" });
  b.along(strap, 8, p => bead(p, 0.004, C.gold, p.bone!));

  // Cloak: a broad low-poly silhouette with alternating long folds.
  for (let i = 0; i < 6; i++) {
    const u0 = -1 + i / 3;
    const u1 = -1 + (i + 1) / 3;
    const edge = (u: number) => [
      [u * 0.195, 1.421, -0.112],
      [u * 0.245, 1.12, -0.19 - 0.022 * Math.cos(u * Math.PI * 3)],
      [u * 0.343, 0.7, -0.25 - 0.022 * Math.cos(u * Math.PI * 3)],
      [u * 0.40, 0.34 + 0.045 * Math.abs(u), -0.29]
    ];
    b.membrane(edge(u0), edge(u1), {
      color: i % 2 ? greenDark : green, thickness: 0.012,
      bone: capeJoints, rows: 2, cols: 5, name: `cloak_fold_${i}`
    });
  }
  for (const s of [1, -1]) {
    b.sweep([
      [s * 0.195, 1.421, -0.112], [s * 0.245, 1.12, -0.19],
      [s * 0.343, 0.7, -0.25], [s * 0.4, 0.385, -0.29]
    ], 0.008, { color: C.gold, bone: capeJoints, sides: 5, name: "cloak_gold_selvedge" });
    drawing(`cloak_woven_border_${s}`, cloakBorder,
      [s * 0.272, 0.866, -0.275], 0.062, 0.52, capeJoints.joints[1], [0, 0, -1]);
    bead([s * 0.155, 1.418, 0.055], 0.026, gold, spine.tip!);
    bead([s * 0.155, 1.418, 0.079], 0.014, "#8dc7aa", spine.tip!);
  }
  b.sweep(bezier([-0.15, 1.421, 0.075], [0, 1.327, 0.131], [0.15, 1.421, 0.075]),
    0.0045, { color: C.gold, bone: spine.tip!, sides: 5 });

  // Small belt pouch and a leaf-shaped hunting knife.
  box("belt_pouch", [-0.19, 0.99, 0.015], [0.105, 0.13, 0.095], leather, hips, [0, 0, -8]);
  leafPlate("pouch_flap", [-0.19, 0.958, 0.068], 0.115, 0.083, C.darkLeather, hips);
  bead([-0.19, 0.991, 0.083], 0.009, gold, hips);
  b.sweep([[0.19, 1.013, 0], [0.255, 0.8, 0.01], [0.28, 0.67, 0.01]],
    [0.028, 0.017], { color: C.darkLeather, bone: hips, sides: 6, name: "knife_scabbard" });
  b.rod([0.183, 1.033, 0], [0.16, 1.11, 0], 0.019, { color: wood, bone: hips, sides: 6 });
  b.rod([0.15, 1.027, 0], [0.219, 1.047, 0], 0.009, { color: gold, bone: hips, sides: 6 });
  bead([0.158, 1.117, 0], 0.022, gold, hips);
  bead([0.281, 0.667, 0.012], 0.022, gold, hips);

  // Quiver and individually constructed arrows, all behind the face.
  const quiverA = new THREE.Vector3(-0.155, 1.055, -0.223);
  const quiverB = new THREE.Vector3(-0.313, 1.563, -0.243);
  b.sweep([quiverA, quiverB], [0.071, 0.083], {
    color: leather, bone: spine.joints[1], sides: 10, caps: "flat", name: "leather_quiver"
  });
  for (const t of [0.04, 0.78, 0.98]) {
    const p = quiverA.clone().lerp(quiverB, t);
    const q = quiverA.clone().lerp(quiverB, Math.min(1, t + 0.025));
    b.rod(p, q, 0.085, { color: gold, bone: spine.joints[1], sides: 10 });
  }
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.005, 10), C.darkLeather, {
    at: quiverB, dir: quiverB.clone().sub(quiverA), bone: spine.joints[1]
  });
  for (let i = 0; i < 5; i++) {
    const x = -0.313 + (i - 2) * 0.025;
    const z = -0.244 + (i % 2) * 0.032;
    const y = 1.85 + (i % 3) * 0.038;
    const base = [x + 0.026, 1.48, z];
    const tip = [x - 0.074, y, z - 0.008];
    b.rod(base, tip, 0.004, { color: wood, bone: spine.joints[1], sides: 5 });
    for (const s of [1, -1]) {
      b.slab([
        [tip[0], y - 0.016, tip[2]],
        [tip[0] + s * 0.025, y - 0.034, tip[2]],
        [tip[0] + s * 0.019, y - 0.09, tip[2]],
        [tip[0] + 0.018, y - 0.105, tip[2]]
      ], { color: i % 2 ? C.cream : "#90c3aa", thickness: 0.003, bone: spine.joints[1] });
    }
    b.rod([tip[0], y - 0.009, tip[2]], [tip[0] - 0.004, y + 0.012, tip[2]],
      0.007, { color: gold, bone: spine.joints[1], sides: 5 });
  }

  // The moonwood bow is kept to the side: the character's eyes stay the focal point.
  const bowHand = sides[0].arm.tip!;
  const bowX = 0.949;
  const bowY = 1.26;
  const bowZ = 0.047;
  const bowPath = catmull([
    [bowX - 0.037, bowY - 0.64, bowZ],
    [bowX + 0.074, bowY - 0.49, bowZ],
    [bowX + 0.135, bowY - 0.26, bowZ],
    [bowX, bowY, bowZ],
    [bowX + 0.135, bowY + 0.26, bowZ],
    [bowX + 0.074, bowY + 0.49, bowZ],
    [bowX - 0.037, bowY + 0.64, bowZ]
  ]);
  const bow = b.sweep(bowPath, t => 0.012 + 0.013 * Math.sin(Math.PI * t), {
    color: wood, bone: bowHand, sides: 6, name: "recurved_moonwood_bow"
  });
  b.sweep(bow.line(90), 0.0035, { color: C.gold, bone: bowHand, sides: 5 });
  b.rod(
    [bowX - 0.037, bowY - 0.64, bowZ],
    [bowX - 0.037, bowY + 0.64, bowZ],
    0.0018, { color: "#dce5cf", bone: bowHand, sides: 4, name: "taut_bowstring" }
  );
  b.rod([bowX, bowY - 0.055, bowZ], [bowX, bowY + 0.055, bowZ],
    0.029, { color: C.darkLeather, bone: bowHand, sides: 8, name: "bow_grip" });
  for (let i = 0; i < 7; i++) {
    b.rod([bowX, bowY - 0.05 + i * 0.015, bowZ],
      [bowX, bowY - 0.046 + i * 0.015, bowZ], 0.03,
      { color: "#a98b5f", bone: bowHand, sides: 8 });
  }
  for (const s of [1, -1]) {
    leafPlate(`bow_leaf_fitting_${s}`, [bowX + 0.063, bowY + s * 0.29 - 0.065, bowZ + 0.016],
      0.075, 0.13, gold, bowHand);
    bead([bowX + 0.071, bowY + s * 0.29, bowZ + 0.034], 0.019, "#64bea9", bowHand);
    glow(drawing(`bow_runes_${s}`, runes,
      [bowX + 0.105, bowY + s * 0.39, bowZ + 0.025], 0.025, 0.15, bowHand), 0.6);
    bead([bowX - 0.037, bowY + s * 0.64, bowZ], 0.017, gold, bowHand);
  }

  // A low forest-shrine plinth, kept below the figure and out of the face.
  b.part(new THREE.CylinderGeometry(1.12, 1.16, 0.066, 12), "#283d42", {
    at: [0, 0.033, 0], scale: [1, 1, 0.57], bone: hips, name: "shrine_plinth"
  });
  b.part(new THREE.CylinderGeometry(1.08, 1.12, 0.034, 12), stone, {
    at: [0, 0.083, 0], scale: [1, 1, 0.57], bone: hips, name: "mossy_stone_platform"
  });
  drawing("warden_nameplate", plaqueTexture, [0, 0.057, 0.651], 0.35, 0.098, hips);
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI * 2 / 12;
    const x = Math.sin(a) * 1.075;
    const z = Math.cos(a) * 0.611;
    bead([x, 0.058, z], 0.013, C.gold, hips);
  }

  // Angular stones, moss pads, fern leaves and a few luminous forest flowers.
  for (let i = 0; i < 15; i++) {
    const a = random() * Math.PI * 2;
    const r = 0.45 + random() * 0.5;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r * 0.53;
    if (Math.abs(x) < 0.28 && z > -0.2) continue;
    b.part(new THREE.DodecahedronGeometry(0.045 + random() * 0.035, 0), stone, {
      at: [x, 0.112, z], scale: [1.35, 0.42, 1], bone: hips, rotation: [0, random() * 180, 0]
    });
    ellipsoid("moss_patch", [x + 0.02, 0.109, z], [0.072, 0.009, 0.043],
      i % 2 ? "#526e4a" : "#779268", hips);
  }
  function fern(x: number, z: number, size: number) {
    const root = [x, 0.107, z];
    for (let j = 0; j < 5; j++) {
      const a = (j - 2) * 0.62;
      const tip = [x + Math.sin(a) * size, 0.11 + size * 0.52, z + Math.cos(a) * size * 0.45];
      b.sweep(bezier(root, [x, 0.11 + size * 0.75, z], tip), [0.003, 0.001], {
        color: "#86a66d", bone: hips, sides: 4
      });
      for (let k = 1; k <= 3; k++) {
        const t = k / 4;
        const px = x + (tip[0] - x) * t;
        const py = 0.11 + size * 0.65 * Math.sin(t * Math.PI * 0.7);
        const pz = z + (tip[2] - z) * t;
        for (const s of [1, -1]) {
          b.slab([
            [px, py, pz],
            [px + s * size * 0.16, py + size * 0.06, pz + size * 0.02],
            [px + s * size * 0.09, py, pz + size * 0.07]
          ], { color: k % 2 ? "#4f8662" : "#82a875", thickness: 0.003, bone: hips });
        }
      }
    }
  }
  fern(-0.66, -0.18, 0.21);
  fern(0.59, -0.21, 0.18);
  for (const p of [[-0.78, 0.15], [0.75, -0.08], [-0.46, -0.37]]) {
    const [x, z] = p;
    b.rod([x, 0.103, z], [x, 0.19, z], 0.003, { color: "#4f8662", bone: hips, sides: 4 });
    for (let j = 0; j < 5; j++) {
      const a = j * Math.PI * 2 / 5;
      b.part(new THREE.OctahedronGeometry(0.02, 0), "#b9d9d0", {
        at: [x + Math.cos(a) * 0.017, 0.19, z + Math.sin(a) * 0.017],
        scale: [1, 0.42, 1], bone: hips
      });
    }
    glow(bead([x, 0.198, z], 0.008, C.cyan, hips), 1.2);
  }

  return b.root;
}
```