```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  svg,
  grain,
  paint,
  mix,
  noise,
  rng,
} from "agentic-3js-builder";
import type { Joint, Fill } from "agentic-3js-builder";
import { animeEye, cel } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Aelith, Ranger of the Starwood",
  description:
    "An anime elven archer in embroidered forest-green leathers, with ivory braids, long pointed ears, a leaf-shaped mantle, a full quiver and a luminous recurved bow. Built in a separated, animation-ready rest pose.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Aelith_Starwood_Ranger", paintSize: 2048 });
  const random = rng(3187);

  const C = {
    ink: "#172b32",
    deep: "#143d40",
    forest: "#276657",
    jade: "#478773",
    mint: "#9dc6a5",
    gold: "#d5ae61",
    lightGold: "#f4d999",
    leather: "#62432f",
    leatherDark: "#352e2b",
    ivory: "#eee5cb",
    hair: "#f2e7c8",
    hairShadow: "#b8b9a0",
    skin: "#ffdbbf",
    skinShade: "#dba497",
    pink: "#cc817f",
    red: "#a24748",
    gem: "#48dec0",
    silver: "#b6c4bc",
  };

  const skin = cel(C.skin, "#e9b4a4");
  const cloth = paint((p, n) => {
    const weave = 0.5 + 0.5 * Math.sin(p.y * 1150) * Math.sin(p.x * 980);
    return mix(
      n.z > 0.25 || n.y > 0.4 ? C.forest : C.deep,
      C.jade,
      0.07 * weave + 0.12 * noise(p, 0.085, 4),
    );
  });
  const paleCloth = cel("#e8e3cd", "#b8c6b1");
  const leather = grain("#47382d", "#77573a", { size: 0.014, axis: "y", seed: 2 });
  const hairPaint = grain("#c8c8ab", "#fff0cd", { size: 0.012, axis: "y", seed: 7 });
  const goldPaint = cel(C.gold, "#947342");
  const darkCloth = cel("#263f41", "#1b2e37");

  // Drawings are shared between their mirrored or repeated placements.
  const eyeTexture = animeEye({
    iris: "#329e88",
    irisLight: "#b4edb1",
    irisDark: "#19565d",
    ink: "#273438",
    blush: false,
    brow: false,
    size: 512,
  });

  const mouthTexture = svg(`
    <svg viewBox="0 0 128 64">
      <path d="M28 29 Q62 39 99 27" fill="none" stroke="#a86d6a" stroke-width="4" stroke-linecap="round"/>
      <path d="M47 43 Q64 47 79 41" fill="none" stroke="#f7b7a6" stroke-width="4" stroke-linecap="round"/>
    </svg>`, { size: 256 });

  const leafEmblem = svg(`
    <svg viewBox="0 0 160 220">
      <path d="M80 8 L143 70 L131 155 L80 211 L29 155 L17 70Z"
            fill="#184b47" stroke="#e9cd86" stroke-width="5"/>
      <path d="M80 27 L128 76 L117 149 L80 190 L43 149 L32 76Z"
            fill="none" stroke="#769e7e" stroke-width="3"/>
      <path d="M80 42 C135 78 115 139 80 166 C45 139 25 78 80 42Z"
            fill="#a4c4a0" stroke="#f1d998" stroke-width="4"/>
      <path d="M80 48V180 M80 93L57 74 M80 118L104 91 M80 141L58 117"
            fill="none" stroke="#295b51" stroke-width="4"/>
      <path d="M80 15L87 25L80 35L73 25Z" fill="#f9e5a6"/>
      <circle cx="80" cy="197" r="4" fill="#f9e5a6"/>
    </svg>`, { size: 384 });

  const embroidery = svg(`
    <svg viewBox="0 0 128 256">
      <path d="M12 0V256 M116 0V256" stroke="#dcc18a" stroke-width="4"/>
      <path d="M25 0V256 M103 0V256" stroke="#6fa58b" stroke-width="3" stroke-dasharray="5 7"/>
      <path d="M64 0 C103 35 25 60 64 90 S103 145 64 175 S25 225 64 256"
            fill="none" stroke="#e3c885" stroke-width="4"/>
      <g fill="#93b799" stroke="#e3c885" stroke-width="2">
        <path d="M65 40Q35 16 38 48Q48 60 65 40Z"/>
        <path d="M65 88Q93 62 94 91Q83 109 65 88Z"/>
        <path d="M64 140Q33 116 35 147Q48 163 64 140Z"/>
        <path d="M64 194Q95 170 94 201Q79 214 64 194Z"/>
      </g>
      <path d="M64 8L69 15L64 22L59 15Z M64 231L69 238L64 245L59 238Z" fill="#f0dca4"/>
    </svg>`, { size: 384 });

  const bracerTexture = svg(`
    <svg viewBox="0 0 160 100">
      <rect x="3" y="3" width="154" height="94" rx="10" fill="#275a50" stroke="#e0be78" stroke-width="5"/>
      <path d="M13 15H147 M13 85H147" stroke="#86aa87" stroke-width="3" stroke-dasharray="5 6"/>
      <path d="M24 50Q80 5 136 50Q80 95 24 50Z" fill="none" stroke="#d4b675" stroke-width="4"/>
      <path d="M39 50H121 M61 50L78 32 M80 50L98 68" stroke="#efdaa3" stroke-width="4" fill="none"/>
      <circle cx="18" cy="50" r="4" fill="#f2d18b"/>
      <circle cx="142" cy="50" r="4" fill="#f2d18b"/>
    </svg>`, { size: 256 });

  const quiverTexture = svg(`
    <svg viewBox="0 0 128 256">
      <rect width="128" height="256" fill="#543e30"/>
      <path d="M10 0V256 M118 0V256" stroke="#e1bd78" stroke-width="4"/>
      <path d="M22 0V256 M106 0V256" stroke="#b58d5b" stroke-width="3" stroke-dasharray="5 7"/>
      <path d="M64 40L94 77L64 114L34 77Z" fill="#2c6657" stroke="#d6b978" stroke-width="4"/>
      <path d="M64 50V104 M46 77H82" stroke="#e9cf8d" stroke-width="4"/>
      <path d="M42 145Q91 170 43 193T65 241" stroke="#b79d67" stroke-width="4" fill="none"/>
    </svg>`, { size: 384 });

  // Skeleton: all creature joints are established before adding geometry.
  const hips = b.joint("hips", { at: [0, 0.91, 0], role: "spine" });
  const spine = b.chain("spine", [
    [0, 0.91, 0],
    [0, 1.11, 0],
    [0, 1.32, 0],
  ], {
    parent: hips,
    names: ["spineLower", "spineUpper", "chest"],
    role: "spine",
  });
  const chest = spine.tip!;
  const neck = b.chain("neck", [
    [0, 1.32, 0],
    [0, 1.46, 0.008],
    [0, 1.52, 0.015],
  ], { parent: chest, names: ["neckBase", "neck"], role: "neck" });
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 1.64, 0.025],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.555, 0.02],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const sides = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(`arm${side}`, [
      [s * 0.18, 1.36, 0],
      [s * 0.49, 1.355, 0],
      [s * 0.76, 1.345, 0.012],
    ], {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const leg = b.chain(`leg${side}`, [
      [s * 0.105, 0.91, 0],
      [s * 0.135, 0.535, 0.025],
      [s * 0.155, 0.145, 0.002],
    ], {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.155, 0, 0.06],
    });
    const digits = [];
    for (let i = 0; i < 4; i++) {
      const z = -0.046 + i * 0.032;
      const length = [0.075, 0.098, 0.104, 0.087][i];
      const y = 1.34 + (i - 1.5) * 0.006;
      digits.push(b.chain(`finger${i + 1}${side}`, [
        [s * 0.852, y, z],
        [s * (0.852 + length * 0.53), y - 0.005, z + (i - 1.5) * 0.008],
        [s * (0.852 + length), y - 0.011, z + (i - 1.5) * 0.014],
      ], {
        parent: arm.tip!,
        names: [`finger${i + 1}${side}`, `finger${i + 1}Tip${side}`],
        role: "digit",
      }));
    }
    const thumb = b.chain(`thumb${side}`, [
      [s * 0.797, 1.325, 0.047],
      [s * 0.825, 1.305, 0.09],
      [s * 0.86, 1.301, 0.112],
    ], { parent: arm.tip!, count: 2, role: "digit" });
    const braid = b.chain(`braid${side}`, [
      [s * 0.137, 1.66, -0.005],
      [s * 0.164, 1.48, 0.045],
      [s * 0.198, 1.29, 0.092],
    ], { parent: head, count: 2, role: "tail" });
    const cloak = b.joint(`cloak${side}`, {
      parent: chest,
      at: [s * 0.12, 1.35, -0.06],
      dir: [0, -1, -0.1],
      role: "hinge",
    });
    return { s, side, arm, leg, digits, thumb, braid, cloak };
  });

  // Placement helpers retain model-space dimensions and explicit ownership.
  function ellipsoid(
    name: string, at: number[], scale: number[], color: Fill, bone: Joint,
    segments = 12,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 8), color, {
      name, at, scale, bone,
    });
  }
  function box(
    name: string, at: number[], size: number[], color: Fill, bone: Joint,
    rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      name, at, bone, rotation,
    });
  }
  function bead(name: string, at: number[], r: number, color: Fill, bone: Joint) {
    return b.part(new THREE.IcosahedronGeometry(r, 0), color, { name, at, bone });
  }
  function frontDrawing(
    name: string, at: number[], width: number, height: number,
    texture: THREE.Texture, bone: Joint,
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      name, at, bone, texture,
    });
  }
  function edge(name: string, points: number[][], r: number, color: Fill, bone: Joint) {
    return b.sweep(catmull(points), r, {
      name, bone, color, sides: 6, caps: "round",
    });
  }
  function frontLeaf(
    name: string, at: number[], w: number, h: number, color: Fill, bone: Joint,
  ) {
    return b.extrude([
      [0, -h * 0.52],
      [-w * 0.5, -h * 0.03],
      [-w * 0.36, h * 0.26],
      [0, h * 0.5],
      [w * 0.36, h * 0.26],
      [w * 0.5, -h * 0.03],
    ], {
      name, at, x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.009, bevel: 0.002, color, bone,
    });
  }

  // The face is deliberately unobstructed: large eyes, narrow nose and a separate chin.
  const skull = ellipsoid("face_upper", [0, 1.66, 0.025], [0.158, 0.193, 0.143], skin, head, 16);
  ellipsoid("chin_lower_jaw", [0, 1.552, 0.067], [0.111, 0.085, 0.104], skin, jaw, 12);

  for (const { s, side } of sides) {
    b.decal(skull, eyeTexture, {
      name: `eye_${side}`,
      at: [s * 0.071, 1.682, 0.157],
      dir: [s * 0.13, 0, 1],
      size: [0.089, 0.119],
      mirror: s > 0,
      bone: head,
      segments: 10,
    });
    edge(`brow_${side}`, [
      [s * 0.036, 1.752, 0.148],
      [s * 0.069, 1.763, 0.148],
      [s * 0.109, 1.754, 0.127],
    ], 0.004, "#8c8d77", head);
    ellipsoid(`blush_${side}`, [s * 0.098, 1.613, 0.134], [0.026, 0.009, 0.006], "#edb2a1", head, 8);

    // Each ear is a thick pointed silhouette with an inset rose-coloured bowl.
    b.extrude([
      [0, -0.054], [0.042, -0.039], [0.163, 0.085],
      [0.065, 0.046], [0, 0.035],
    ], {
      name: `ear_${side}`, at: [s * 0.132, 1.662, 0.015],
      x: [s, 0, 0], y: [0, 1, 0], thickness: 0.032,
      bevel: 0.006, color: skin, bone: head,
    });
    b.extrude([
      [0.014, -0.028], [0.045, -0.018], [0.126, 0.061],
      [0.056, 0.027], [0.015, 0.019],
    ], {
      name: `ear_inner_${side}`, at: [s * 0.132, 1.662, 0.033],
      x: [s, 0, 0], y: [0, 1, 0], thickness: 0.004,
      color: "#dba092", bone: head,
    });
    b.part(new THREE.TorusGeometry(0.017, 0.003, 5, 12), goldPaint, {
      name: `earring_${side}`, at: [s * 0.178, 1.616, 0.032], bone: head,
    });
    bead(`earring_stone_${side}`, [s * 0.179, 1.59, 0.034], 0.009, C.gem, head);
  }

  b.extrude([
    [-0.012, 0.018], [0, 0.039], [0.014, -0.016], [0.004, -0.026], [-0.012, -0.015],
  ], {
    name: "nose", at: [0, 1.625, 0.158],
    x: [1, 0, 0], y: [0, 1, 0], thickness: 0.025,
    bevel: 0.004, color: skin, bone: head,
  });
  frontDrawing("mouth", [0, 1.565, 0.1725], 0.067, 0.0335, mouthTexture, jaw);

  b.sweep(neck, [0.073, 0.057], { name: "neck_skin", color: skin, sides: 10 });
  b.loft([
    { at: [0, 0.9, 0], w: 0.27, h: 0.17 },
    { at: [0, 1.055, 0], w: 0.245, h: 0.155 },
    { at: [0, 1.21, 0], w: 0.33, h: 0.205 },
    { at: [0, 1.35, 0], w: 0.365, h: 0.185 },
  ], { name: "fitted_tunic", bone: spine, color: cloth, sides: 10, caps: "flat" });

  // Cream collar and overlapping leaf-shaped lapels.
  for (const { s, side } of sides) {
    b.slab([
      [s * 0.052, 1.445, 0.045],
      [s * 0.145, 1.345, 0.096],
      [s * 0.09, 1.273, 0.111],
      [s * 0.016, 1.365, 0.102],
    ], { name: `collar_${side}`, bone: chest, thickness: 0.014, color: paleCloth });
    edge(`collar_trim_${side}`, [
      [s * 0.052, 1.445, 0.056],
      [s * 0.145, 1.345, 0.108],
      [s * 0.09, 1.273, 0.122],
    ], 0.004, goldPaint, chest);
  }
  frontLeaf("throat_clasp", [0, 1.358, 0.122], 0.046, 0.073, goldPaint, chest);
  bead("clasp_emerald", [0, 1.363, 0.138], 0.013, C.gem, chest);
  frontDrawing("heartwood_badge", [0, 1.205, 0.111], 0.098, 0.135, leafEmblem, chest);
  for (const s of [-1, 1]) {
    edge(`tunic_seam_${s}`, [
      [s * 0.12, 1.31, 0.084],
      [s * 0.096, 1.16, 0.091],
      [s * 0.091, 1.02, 0.079],
    ], 0.003, "#75a089", chest);
  }

  // Split tunic skirts preserve clear leg silhouettes.
  for (const { s, side, leg } of sides) {
    const thigh = leg.joints[0];
    b.extrude([
      [-0.066, 0.14], [0.068, 0.14], [0.103, -0.139],
      [0.022, -0.205], [-0.079, -0.145],
    ], {
      name: `tunic_skirt_${side}`, at: [s * 0.092, 0.85, 0.074],
      x: [s, 0, 0], y: [0, 1, 0], thickness: 0.025,
      color: cloth, bone: hips,
    });
    edge(`skirt_gold_hem_${side}`, [
      [s * 0.013, 0.708, 0.091],
      [s * 0.114, 0.647, 0.091],
      [s * 0.195, 0.711, 0.091],
    ], 0.0045, goldPaint, hips);
    frontDrawing(`skirt_embroidery_${side}`, [s * 0.102, 0.811, 0.091], 0.075, 0.21, embroidery, hips);

    b.sweep(leg, (t) => t < 0.45 ? 0.079 - t * 0.025 : 0.067 - (t - 0.45) * 0.032, {
      name: `trousers_${side}`, color: darkCloth, sides: 8,
    });
    edge(`trouser_piping_${side}`, [
      [s * 0.174, 0.84, 0.03],
      [s * 0.198, 0.67, 0.033],
      [s * 0.197, 0.54, 0.031],
    ], 0.0035, C.mint, thigh);

    const shin = leg.joints[1];
    b.sweep([
      [s * 0.138, 0.51, 0.019],
      [s * 0.153, 0.29, 0.01],
      [s * 0.155, 0.115, 0.01],
    ], [0.078, 0.066, 0.059], {
      name: `boot_shaft_${side}`, color: leather, bone: shin, sides: 8, caps: "flat",
    });
    b.part(new THREE.CylinderGeometry(0.087, 0.082, 0.045, 8), C.deep, {
      name: `boot_cuff_${side}`, at: [s * 0.138, 0.492, 0.019], bone: shin,
    });
    b.part(new THREE.CylinderGeometry(0.088, 0.088, 0.009, 8), goldPaint, {
      name: `boot_cuff_rim_${side}`, at: [s * 0.138, 0.514, 0.019], bone: shin,
    });
    frontLeaf(`kneeguard_${side}`, [s * 0.136, 0.517, 0.096], 0.107, 0.134, C.forest, shin);
    frontLeaf(`kneeguard_inlay_${side}`, [s * 0.136, 0.522, 0.103], 0.038, 0.082, goldPaint, shin);
    for (let i = 0; i < 5; i++) {
      const y = 0.225 + i * 0.044;
      const x = s * (0.155 - (y - 0.225) * 0.04);
      for (const k of [-1, 1]) {
        bead(`boot_eyelet_${side}_${i}_${k}`, [x + k * 0.023, y, 0.077], 0.004, C.gold, shin);
      }
      b.rod([x - 0.022, y, 0.08], [x + 0.022, y + 0.027, 0.08], 0.003, {
        name: `boot_lace_${side}_${i}`, color: C.ivory, bone: shin, sides: 5,
      });
    }
    const foot = leg.tip!;
    box(`boot_sole_${side}`, [s * 0.155, 0.026, 0.069], [0.137, 0.052, 0.265], C.leatherDark, foot);
    ellipsoid(`boot_foot_${side}`, [s * 0.155, 0.085, 0.071], [0.068, 0.069, 0.137], leather, foot, 10);
    frontLeaf(`boot_toe_plate_${side}`, [s * 0.155, 0.078, 0.197], 0.08, 0.064, C.deep, foot);
    box(`boot_sole_trim_${side}`, [s * 0.155, 0.052, 0.187], [0.106, 0.009, 0.023], goldPaint, foot);
  }

  // Broad waist belt, a squared buckle and tiny punched holes.
  b.part(new THREE.CylinderGeometry(0.151, 0.154, 0.068, 12), leather, {
    name: "waist_belt", at: [0, 0.988, 0], scale: [1, 1, 0.67], bone: hips,
  });
  box("buckle_back", [0, 0.988, 0.112], [0.084, 0.064, 0.014], C.leatherDark, hips);
  for (const y of [0.961, 1.015])
    box("buckle_horizontal", [0, y, 0.123], [0.084, 0.008, 0.009], goldPaint, hips);
  for (const x of [-0.038, 0.038])
    box("buckle_vertical", [x, 0.988, 0.123], [0.008, 0.058, 0.009], goldPaint, hips);
  box("buckle_tongue", [0, 0.988, 0.129], [0.043, 0.005, 0.007], C.lightGold, hips);
  for (const x of [-0.109, -0.087, 0.087, 0.109])
    bead("belt_stud", [x, 0.987, 0.079], 0.005, C.gold, hips);

  // Rear mantle: two broad leaf panels with a contrasting lining and gold stitched edge.
  for (const { s, side, cloak } of sides) {
    const outline = [
      [0.018, 1.379, -0.093],
      [s * 0.18, 1.374, -0.07],
      [s * 0.25, 1.24, -0.13],
      [s * 0.316, 0.775, -0.235],
      [s * 0.236, 0.58, -0.265],
      [s * 0.077, 0.675, -0.254],
      [s * 0.014, 0.965, -0.185],
    ];
    b.slab(outline, { name: `mantle_${side}`, color: cloth, thickness: 0.024, bone: cloak });
    b.slab(outline.map(([x, y, z]) => [x, y, z - 0.014]), {
      name: `mantle_lining_${side}`, color: "#527f70", thickness: 0.005, bone: cloak,
    });
    edge(`mantle_border_${side}`, [
      [s * 0.18, 1.374, -0.088],
      [s * 0.25, 1.24, -0.148],
      [s * 0.316, 0.775, -0.253],
      [s * 0.236, 0.58, -0.283],
      [s * 0.077, 0.675, -0.272],
    ], 0.006, goldPaint, cloak);
    edge(`mantle_fold_${side}`, [
      [s * 0.12, 1.325, -0.12],
      [s * 0.178, 0.988, -0.216],
      [s * 0.231, 0.647, -0.285],
    ], 0.009, "#326556", cloak);
    // Gold stylised vein embroidery on the back.
    for (let i = 0; i < 4; i++) {
      const y = 0.79 + i * 0.105;
      const x = s * (0.21 - i * 0.019);
      const z = -0.266 + i * 0.025;
      edge(`mantle_leaf_vein_${side}_${i}`, [
        [x, y, z],
        [x + s * 0.047, y + 0.035, z + 0.009],
        [x + s * 0.057, y + 0.068, z + 0.015],
      ], 0.0026, C.gold, cloak);
    }
  }

  // Arms are outstretched for rigging, with separated, readable fingers.
  for (const { s, side, arm, digits, thumb } of sides) {
    const upper = arm.joints[0];
    const fore = arm.joints[1];
    const wrist = arm.tip!;
    b.sweep(arm, [0.061, 0.049, 0.034], {
      name: `arm_skin_${side}`, color: skin, sides: 8,
    });
    b.sweep(arm, [0.078, 0.066], {
      name: `short_sleeve_${side}`, color: paleCloth, from: 0, to: 0.32,
      caps: "flat", sides: 8,
    });
    b.sweep([
      [s * 0.225, 1.405, -0.01],
      [s * 0.295, 1.397, -0.009],
      [s * 0.346, 1.376, -0.009],
    ], (t) => [0.09 - t * 0.035, 0.045 - t * 0.012], {
      name: `leaf_pauldron_${side}`, color: cloth, bone: upper,
      caps: "flat", sides: 6,
    });
    edge(`pauldron_front_rim_${side}`, [
      [s * 0.196, 1.393, 0.071],
      [s * 0.271, 1.401, 0.079],
      [s * 0.352, 1.368, 0.047],
    ], 0.005, goldPaint, upper);
    for (let i = 0; i < 3; i++)
      bead(`shoulder_rivet_${side}_${i}`, [s * (0.23 + 0.035 * i), 1.401 - i * 0.009, 0.075], 0.006, C.lightGold, upper);

    b.sweep([
      [s * 0.545, 1.353, 0.006],
      [s * 0.704, 1.347, 0.01],
    ], [0.063, 0.048], {
      name: `vambrace_${side}`, color: leather, bone: fore,
      sides: 8, caps: "flat",
    });
    for (const x of [0.554, 0.693]) {
      b.part(new THREE.CylinderGeometry(x < 0.6 ? 0.064 : 0.05, x < 0.6 ? 0.064 : 0.05, 0.014, 8), goldPaint, {
        name: `vambrace_binding_${side}`, at: [s * x, 1.35, 0.008],
        dir: [s, 0, 0], bone: fore,
      });
    }
    frontDrawing(`vambrace_engraving_${side}`, [s * 0.623, 1.351, 0.067], 0.136, 0.069, bracerTexture, fore);
    for (const y of [1.322, 1.378])
      box(`bracer_rim_${side}`, [s * 0.623, y, 0.067], [0.139, 0.005, 0.009], C.gold, fore);

    ellipsoid(`palm_${side}`, [s * 0.812, 1.338, 0.007], [0.065, 0.028, 0.058], skin, wrist, 10);
    ellipsoid(`glove_back_${side}`, [s * 0.798, 1.348, -0.009], [0.049, 0.025, 0.043], leather, wrist, 10);
    frontLeaf(`glove_leaf_${side}`, [s * 0.794, 1.348, 0.049], 0.048, 0.036, C.forest, wrist);
    digits.forEach((digit, i) => {
      b.sweep(digit, [0.012, 0.0085], { name: `finger_skin_${side}_${i}`, color: skin, sides: 6 });
      b.sweep(digit, [0.013, 0.0115], {
        name: `fingerless_glove_${side}_${i}`, color: leather,
        sides: 6, from: 0, to: 0.29, caps: "flat",
      });
    });
    b.sweep(thumb, [0.015, 0.009], { name: `thumb_skin_${side}`, color: skin, sides: 6 });
  }

  // Leather diagonal quiver harness, visibly crossing the fitted tunic.
  b.slab([
    [-0.145, 1.345, 0.097],
    [-0.102, 1.369, 0.11],
    [0.143, 1.033, 0.088],
    [0.107, 1.006, 0.095],
  ], { name: "diagonal_harness", color: leather, bone: chest, thickness: 0.017 });
  edge("harness_stitch_left", [
    [-0.138, 1.341, 0.112],
    [-0.019, 1.183, 0.126],
    [0.113, 1.023, 0.11],
  ], 0.0028, C.gold, chest);
  edge("harness_stitch_right", [
    [-0.106, 1.355, 0.123],
    [0.013, 1.194, 0.126],
    [0.139, 1.035, 0.103],
  ], 0.0028, C.gold, chest);
  box("harness_keeper", [-0.072, 1.298, 0.126], [0.06, 0.019, 0.017], goldPaint, chest, [0, 0, -37]);

  // Small belt pouch and a sheathed ranger knife.
  box("belt_pouch", [0.191, 0.909, -0.007], [0.104, 0.132, 0.09], leather, hips, [0, 0, -7]);
  box("pouch_flap", [0.191, 0.947, 0.047], [0.112, 0.057, 0.018], C.leatherDark, hips, [0, 0, -7]);
  frontLeaf("pouch_clasp", [0.191, 0.925, 0.062], 0.025, 0.044, goldPaint, hips);
  bead("pouch_button", [0.191, 0.935, 0.074], 0.005, C.gem, hips);
  b.sweep([
    [-0.191, 0.989, -0.008],
    [-0.222, 0.808, -0.018],
    [-0.234, 0.696, -0.026],
  ], [0.028, 0.023, 0.009], {
    name: "knife_sheath", section: "box", color: leather, bone: hips, caps: "flat",
  });
  b.rod([-0.181, 1.06, -0.003], [-0.194, 0.985, -0.009], 0.018, {
    name: "knife_grip", color: C.deep, bone: hips, sides: 8,
  });
  b.rod([-0.228, 0.985, -0.008], [-0.158, 0.985, -0.008], 0.008, {
    name: "knife_guard", color: goldPaint, bone: hips,
  });
  bead("knife_pommel", [-0.181, 1.067, -0.003], 0.019, goldPaint, hips);

  // Ivory hair: a simple faceted cap with broad locks and paired segmented braids.
  ellipsoid("hair_back_mass", [0, 1.694, -0.057], [0.169, 0.205, 0.122], hairPaint, head, 12);
  ellipsoid("hair_crown", [0, 1.803, 0.008], [0.165, 0.101, 0.137], hairPaint, head, 12);
  const fringe = [
    { x: -0.116, root: 1.854, end: 1.734, w: 0.074, lean: -0.027 },
    { x: -0.067, root: 1.877, end: 1.755, w: 0.069, lean: -0.035 },
    { x: -0.012, root: 1.889, end: 1.781, w: 0.072, lean: -0.02 },
    { x: 0.046, root: 1.882, end: 1.765, w: 0.071, lean: 0.012 },
    { x: 0.105, root: 1.852, end: 1.726, w: 0.07, lean: 0.032 },
  ];
  fringe.forEach((f, i) => {
    const h = f.root - f.end;
    b.extrude([
      [-f.w / 2, 0], [-f.w * 0.46, h * 0.62],
      [-f.w * 0.11, h], [f.w * 0.43, h * 0.77],
      [f.w / 2, h * 0.36], [f.lean, -0.024],
    ], {
      name: `fringe_lock_${i}`, at: [f.x, f.end, 0.12],
      x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.037, bevel: 0.007, color: hairPaint, bone: head,
    });
    edge(`fringe_highlight_${i}`, [
      [f.x - 0.008, f.root - 0.017, 0.144],
      [f.x + f.lean * 0.3, (f.root + f.end) / 2, 0.146],
      [f.x + f.lean, f.end + 0.001, 0.143],
    ], 0.0023, C.ivory, head);
  });

  for (const { s, side, braid } of sides) {
    b.sweep(braid, [0.037, 0.032, 0.012], {
      name: `braid_core_${side}`, color: hairPaint, sides: 6,
    });
    for (let i = 0; i < 8; i++) {
      const t = (i + 0.5) / 9;
      const p = braid.at(t);
      const w = 0.027 * (1 - t * 0.3);
      ellipsoid(`braid_crossing_${side}_${i}`, [
        p.at.x + (i % 2 === 0 ? 1 : -1) * 0.009,
        p.at.y,
        p.at.z + 0.012,
      ], [w, 0.032, 0.022], i % 2 ? hairPaint : C.hair, p.bone!, 8);
    }
    const p = braid.at(0.91);
    b.part(new THREE.CylinderGeometry(0.023, 0.022, 0.029, 8), goldPaint, {
      name: `braid_cuff_${side}`, at: p.at, bone: p.bone!,
    });
    b.spike(braid.at(0.95), [s * 0.025, -1, 0.1], 0.077, 0.024, {
      name: `braid_tassel_${side}`, color: hairPaint, bone: braid.joints[1], sides: 6,
    });
    bead(`braid_cuff_gem_${side}`, [p.at.x, p.at.y, p.at.z + 0.025], 0.008, C.gem, p.bone!);
  }

  // A fine gold circlet sits above the eyes, beneath the fringe tips.
  edge("brow_circlet", [
    [-0.154, 1.751, 0.07],
    [-0.112, 1.788, 0.13],
    [0, 1.792, 0.158],
    [0.112, 1.788, 0.13],
    [0.154, 1.751, 0.07],
  ], 0.005, goldPaint, head);
  frontLeaf("circlet_setting", [0, 1.783, 0.164], 0.037, 0.055, goldPaint, head);
  glow(bead("circlet_starstone", [0, 1.786, 0.175], 0.012, "#80f2ce", head), 0.45);

  // Back-mounted quiver with a visibly open, dark mouth and individual arrows.
  const qBottom = [-0.09, 0.995, -0.225];
  const qTop = [-0.235, 1.481, -0.227];
  b.sweep([qBottom, qTop], [0.066, 0.083], {
    name: "quiver_body", color: leather, bone: chest, sides: 10, caps: "flat",
  });
  for (const t of [0.06, 0.82, 0.99]) {
    const p = qBottom.map((a, i) => a + (qTop[i] - a) * t);
    b.part(new THREE.CylinderGeometry(0.071 + t * 0.017, 0.071 + t * 0.017, 0.021, 10), goldPaint, {
      name: "quiver_band", at: p, dir: [-0.145, 0.486, -0.002], bone: chest,
    });
  }
  b.part(new THREE.CylinderGeometry(0.072, 0.072, 0.005, 10), C.leatherDark, {
    name: "quiver_dark_opening", at: [-0.239, 1.491, -0.227],
    dir: [-0.145, 0.486, -0.002], bone: chest,
  });
  b.part(new THREE.PlaneGeometry(0.102, 0.31), "#ffffff", {
    name: "quiver_embossed_panel", at: [-0.164, 1.238, -0.305],
    dir: [0, 0, -1], axis: "z", texture: quiverTexture, bone: chest,
    up: [-0.28, 0.96, 0],
  });

  for (let i = 0; i < 6; i++) {
    const x = -0.255 + (i % 3) * 0.025;
    const z = -0.255 + Math.floor(i / 3) * 0.04;
    const y = 1.695 + random() * 0.095;
    const start = [x + 0.066, 1.28, z];
    const end = [x - 0.035, y, z];
    b.rod(start, end, 0.004, {
      name: `arrow_shaft_${i}`, color: "#c3a575", bone: chest, sides: 6,
    });
    b.rod([end[0], y - 0.015, z], [end[0] - 0.006, y + 0.016, z], 0.006, {
      name: `arrow_nock_${i}`, color: C.ivory, bone: chest, sides: 6,
    });
    for (const s of [-1, 1]) {
      b.slab([
        [end[0] + 0.002, y - 0.014, z],
        [end[0] + s * 0.027, y - 0.029, z],
        [end[0] + s * 0.026 + 0.013, y - 0.098, z],
        [end[0] + 0.02, y - 0.093, z],
      ], {
        name: `arrow_fletching_${i}_${s}`, color: i % 2 ? C.ivory : C.red,
        bone: chest, thickness: 0.003,
      });
    }
  }

  // Hero recurve bow: paired tapering limbs, sculpted leaf tips and a taut string.
  // It is held at the left palm, away from the face and body.
  const bowBone = sides[0].arm.tip!;
  const BX = 0.85;
  const BY = 1.34;
  const BZ = 0.078;
  const bowPoints = [
    [BX - 0.015, BY - 0.64, BZ],
    [BX + 0.075, BY - 0.57, BZ],
    [BX + 0.137, BY - 0.39, BZ],
    [BX + 0.095, BY - 0.19, BZ],
    [BX, BY, BZ],
    [BX + 0.095, BY + 0.19, BZ],
    [BX + 0.137, BY + 0.39, BZ],
    [BX + 0.075, BY + 0.57, BZ],
    [BX - 0.015, BY + 0.64, BZ],
  ];
  const bowCurve = catmull(bowPoints);
  b.sweep(bowCurve, (t) => 0.011 + 0.014 * Math.sin(Math.PI * t), {
    name: "recurved_heartwood_bow", color: grain("#554532", "#998052", {
      size: 0.013, axis: "y", seed: 8,
    }), bone: bowBone, sides: 8, caps: "flat",
  });
  edge("bow_gilded_front_edge", bowPoints.map(([x, y, z]) => [x, y, z + 0.022]), 0.004, goldPaint, bowBone);
  edge("bow_green_laminate", bowPoints.map(([x, y, z]) => [x + 0.016, y, z]), 0.007, C.deep, bowBone);

  b.rod([BX, BY - 0.065, BZ], [BX, BY + 0.065, BZ], 0.029, {
    name: "bow_leather_grip", color: C.leatherDark, bone: bowBone, sides: 8,
  });
  for (let i = 0; i < 7; i++) {
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.006, 8), i % 2 ? leather : C.gold, {
      name: `bow_grip_wrap_${i}`, at: [BX, BY - 0.052 + i * 0.017, BZ], bone: bowBone,
    });
  }
  // The string is displaced behind the palm, with serving at the nocking point.
  b.rod(
    [BX - 0.015, BY - 0.64, BZ],
    [BX - 0.015, BY + 0.64, BZ],
    0.0018,
    { name: "taut_bowstring", color: "#e5dfbf", bone: bowBone, sides: 5 },
  );
  b.rod([BX - 0.015, BY - 0.045, BZ], [BX - 0.015, BY + 0.045, BZ], 0.0031, {
    name: "string_serving", color: C.red, bone: bowBone, sides: 5,
  });

  for (const s of [-1, 1]) {
    const y = BY + s * 0.38;
    frontLeaf(`bow_leaf_plate_${s}`, [BX + 0.135, y, BZ + 0.027], 0.072, 0.2, goldPaint, bowBone);
    frontLeaf(`bow_leaf_inset_${s}`, [BX + 0.135, y, BZ + 0.035], 0.043, 0.151, C.forest, bowBone);
    edge(`bow_leaf_vein_${s}`, [
      [BX + 0.135, y - 0.063, BZ + 0.042],
      [BX + 0.135, y, BZ + 0.045],
      [BX + 0.135, y + 0.063, BZ + 0.042],
    ], 0.003, C.lightGold, bowBone);
    glow(bead(`bow_soulstone_${s}`, [BX + 0.135, y, BZ + 0.053], 0.016, C.gem, bowBone), 0.7);
    frontLeaf(`bow_tip_cap_${s}`, [BX - 0.008, BY + s * 0.63, BZ + 0.009], 0.033, 0.094, goldPaint, bowBone);
    for (let i = 0; i < 3; i++) {
      const yy = BY + s * (0.22 + i * 0.045);
      const xx = BX + 0.11 + i * 0.008;
      b.slab([
        [xx - 0.008, yy, BZ + 0.029],
        [xx, yy + 0.01, BZ + 0.029],
        [xx + 0.008, yy, BZ + 0.029],
        [xx, yy - 0.01, BZ + 0.029],
      ], { name: `bow_rune_${s}_${i}`, color: C.lightGold, thickness: 0.002, bone: bowBone });
    }
  }

  return b.root;
}
```