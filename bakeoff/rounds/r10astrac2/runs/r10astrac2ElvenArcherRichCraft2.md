```ts
import * as THREE from "three";
import {
  createBuilder, catmull, bezier, svg, rng, paint, mix, noise, grain
} from "agentic-3js-builder";
import { animeEye, cel } from "agentic-3js-builder/kits/toon";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";
import type { Joint, Fill, PointInput } from "agentic-3js-builder";

export const meta = {
  name: "Sylva — Warden of the Silverwood",
  description:
    "A silver-haired elven archer in layered emerald leaf armour, embroidered woodland cloak and gilded moonwood bow, standing on an ancient forest waystone."
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Silverwood ranger", paintSize: 2048 });
  const random = rng(319);

  // Revision priorities:
  // 1. Flat-ended tailoring fixes the tunic's oversized, neck-swallowing cap.
  // 2. A solid rear hair mass, swept fringe and longer locks replace the sparse helmet silhouette.
  // 3. Sculpted shoulder shells and layered, embroidered armour enrich the large green shapes.
  // 4. Embroidery is projected onto the cloak instead of floating behind its folds.
  // 5. A smaller engraved waystone and richer bow fittings strengthen the fantasy narrative.

  const C = {
    ink: "#202936", green: "#235d4a", darkGreen: "#153b36",
    gold: "#dfb866", lightGold: "#f6df9d",
    leather: "#694735", darkLeather: "#392d2c",
    sole: "#252b30", cream: "#eee5c4", cyan: "#97ffda"
  };
  const skin = paint((_p, n) =>
    mix("#e0b3a3", "#ffe3ce", Math.max(0, Math.min(1, 0.68 + n.y * 0.2 + n.z * 0.15)))
  );
  const green = cel("#36765a", "#244e48");
  const greenLight = cel("#629b76", "#376656");
  const greenDark = cel("#214a42", "#182e35");
  const gold = metal("gilt", { polish: 0.35, tarnish: 0.12 });
  const steel = metal("steel", { polish: 0.25, tarnish: 0.15 });
  const leather = paint((p, n) =>
    mix("#513b32", "#806047",
      Math.max(0, Math.min(1, 0.42 + n.y * 0.2 + noise(p, 0.038, 8) * 0.22)))
  );
  const wood = grain("#795337", "#bf9962", { size: 0.034, axis: "y", seed: 7 });
  const hairPaint = paint((p, n) => {
    const streak = 0.5 + 0.5 * Math.sin(p.x * 260 + p.y * 12 + p.z * 90);
    return mix(n.y > -0.3 ? "#edf0dc" : "#b1c2bb", "#d0d9c4", streak * 0.2);
  });
  const stone = paint((p, n) =>
    mix(n.y > 0.45 ? "#6b827a" : "#344c4e", "#879387", noise(p, 0.12, 2) * 0.45)
  );

  const eyeTexture = animeEye({
    iris: "#389f91", irisLight: "#a5e7be", irisDark: "#255663",
    ink: "#283246", blush: false, brow: false
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

  const bodiceEmbroidery = svg(`
    <svg viewBox="0 0 220 260">
      <g fill="none" stroke-linejoin="round">
        <path d="M12 8Q24 108 79 189L110 242L141 189Q196 108 208 8"
              stroke="#152f32" stroke-width="12"/>
        <path d="M12 8Q24 108 79 189L110 242L141 189Q196 108 208 8"
              stroke="#d0bd80" stroke-width="4"/>
        <path d="M26 20Q41 104 87 180M194 20Q179 104 133 180"
              stroke="#88ab81" stroke-width="3" stroke-dasharray="4 6"/>
        <path d="M37 76Q61 99 72 136Q36 122 37 76
                 M183 76Q159 99 148 136Q184 122 183 76
                 M64 143Q82 153 94 186Q62 175 64 143
                 M156 143Q138 153 126 186Q158 175 156 143"
              fill="#477d61" stroke="#99b483" stroke-width="3"/>
        <path d="M87 213L110 195L133 213M100 227L110 218L120 227"
              stroke="#e0ce94" stroke-width="3"/>
      </g>
    </svg>`, { size: 512 });

  const cloakBorder = svg(`
    <svg viewBox="0 0 96 192">
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

  const treeEmblem = svg(`
    <svg viewBox="0 0 200 240">
      <g fill="none" stroke="#b6c59a" stroke-width="4" stroke-linecap="round">
        <path d="M100 207V51M100 173Q46 159 37 119M100 142Q151 128 166 88
                 M100 112Q61 93 56 61M100 86Q134 64 131 38"/>
        <path d="M61 153Q32 143 23 121Q51 123 61 153
                 M73 168Q55 191 29 184Q43 164 73 168
                 M129 132Q156 145 177 126Q154 115 129 132
                 M145 115Q172 109 178 84Q154 88 145 115
                 M75 93Q45 91 37 66Q65 67 75 93
                 M116 71Q141 72 154 50Q129 47 116 71
                 M100 61Q76 35 100 13Q124 35 100 61"/>
        <path d="M67 211Q99 186 133 211M48 222Q100 200 152 222"/>
      </g>
      <path d="M18 102Q0 166 51 203M182 102Q200 166 149 203"
            fill="none" stroke="#6e967f" stroke-width="3"/>
    </svg>`, { size: 512 });

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

  const cheekTexture = svg(`
    <svg viewBox="0 0 120 35">
      <path d="M8 17L31 20M89 20L112 17" stroke="#d7978d"
            stroke-width="5" stroke-linecap="round"/>
      <g fill="#cba18a">
        <circle cx="15" cy="8" r="2"/><circle cx="29" cy="11" r="2"/>
        <circle cx="91" cy="11" r="2"/><circle cx="105" cy="8" r="2"/>
      </g>
    </svg>`, { size: 256 });

  // Skeleton and fingers are created before the visible assemblies.
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
    [0, 1.42, -0.12], [0, 1.02, -0.21], [0, 0.57, -0.285], [0, 0.32, -0.31]
  ], { parent: spine.tip!, count: 3, role: "fan" });

  function ellipsoid(name: string, at: PointInput, size: number[], color: Fill, bone: Joint) {
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

  // Smaller, slightly more almond-like eyes and a defined jaw leave room for the expression.
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), skin, {
    at: [0, 1.745, 0.019], scale: [0.143, 0.163, 0.119],
    bone: head, name: "face"
  });
  b.part(new THREE.SphereGeometry(1, 12, 8), skin, {
    at: [0, 1.631, 0.035], scale: [0.074, 0.051, 0.076],
    bone: jaw, name: "separate_lower_jaw"
  });
  for (const s of [1, -1]) {
    b.decal(skull, eyeTexture, {
      at: [s * 0.061, 1.752, 0.13],
      dir: [s * 0.12, 0, 1], size: [0.096, 0.106],
      mirror: s > 0, bone: head, lift: 0.002, segments: 10
    });
    b.sweep(bezier(
      [s * 0.029, 1.807, 0.121],
      [s * 0.066, 1.82, 0.119],
      [s * 0.099, 1.803, 0.099]
    ), 0.0035, { color: "#788576", bone: head, sides: 5 });

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
  b.decal(skull, cheekTexture, {
    at: [0, 1.706, 0.14], dir: [0, 0, 1], size: [0.199, 0.04],
    segments: 12, bone: head, lift: 0.002
  });
  b.part(new THREE.ConeGeometry(0.016, 0.035, 4), skin, {
    at: [0, 1.699, 0.135], dir: [0, -0.25, 1], bone: head
  });
  b.sweep([[-0.026, 1.66, 0.128], [0, 1.657, 0.136], [0.027, 1.664, 0.128]],
    0.0024, { color: "#a45e66", bone: head, sides: 5 });
  b.sweep([[-0.015, 1.65, 0.127], [0, 1.648, 0.131], [0.015, 1.651, 0.127]],
    0.0023, { color: "#efb4ac", bone: jaw, sides: 5 });

  // A coherent rear hair shape fills the holes between the cap and the long locks.
  b.loft([
    { at: [0, 1.82, -0.043], w: 0.235, h: 0.15 },
    { at: [0, 1.7, -0.078], w: 0.27, h: 0.122 },
    { at: [0, 1.58, -0.091], w: 0.228, h: 0.102 },
    { at: [0, 1.485, -0.11], w: 0.13, h: 0.052 }
  ], { color: hairPaint, bone: head, sides: 8, caps: "flat", name: "solid_rear_hair" });
  b.part(new THREE.SphereGeometry(1, 12, 7, 0, Math.PI * 2, 0, 1.38), hairPaint, {
    at: [0, 1.767, 0.002], scale: [0.151, 0.157, 0.13],
    bone: head, name: "silver_hair_cap", flat: true
  });
  function hairLock(name: string, points: number[][], width: number, depth = 0.019) {
    return b.sweep(catmull(points), t => [
      width * (0.92 - t * 0.89), depth * (1 - t * 0.9)
    ], {
      color: hairPaint, bone: head, section: { ngon: 5 }, caps: "flat", name
    });
  }
  hairLock("swept_fringe_L", [
    [-0.044, 1.916, 0.043], [0.036, 1.877, 0.124], [0.112, 1.794, 0.099]
  ], 0.046, 0.023);
  hairLock("swept_fringe_R", [
    [-0.042, 1.911, 0.047], [-0.102, 1.866, 0.111], [-0.129, 1.769, 0.076]
  ], 0.044, 0.022);
  hairLock("central_fringe", [
    [-0.016, 1.906, 0.075], [0.007, 1.859, 0.138], [0.023, 1.811, 0.128]
  ], 0.023);
  for (const s of [1, -1]) {
    hairLock(`temple_lock_${s}`, [
      [s * 0.119, 1.842, 0.038], [s * 0.14, 1.716, 0.045],
      [s * 0.137, 1.572, 0.031]
    ], 0.028);
    hairLock(`outer_lock_${s}`, [
      [s * 0.117, 1.843, -0.06], [s * 0.163, 1.642, -0.075],
      [s * 0.148, 1.476, -0.079]
    ], 0.042);
    hairLock(`back_lock_${s}`, [
      [s * 0.075, 1.859, -0.091], [s * 0.098, 1.651, -0.145],
      [s * 0.071, 1.424, -0.142]
    ], 0.05, 0.023);
    for (let i = 0; i < 6; i++) {
      const y = 1.738 - i * 0.034;
      ellipsoid(`braid_${s}_${i}`,
        [s * (0.146 + (i % 2 ? 0.006 : -0.003)), y, -0.023],
        [0.018, 0.024, 0.019], hairPaint, head);
    }
    b.rod([s * 0.148, 1.536, -0.023], [s * 0.148, 1.55, -0.023], 0.019, {
      color: gold, bone: head, sides: 8
    });
    hairLock(`braid_tip_${s}`, [
      [s * 0.148, 1.54, -0.023], [s * 0.15, 1.512, -0.02],
      [s * 0.144, 1.485, -0.014]
    ], 0.019);
  }
  b.sweep(bezier([-0.127, 1.855, 0.071], [0, 1.887, 0.129], [0.127, 1.855, 0.071]),
    0.005, { color: gold, bone: head, sides: 6 });
  leafPlate("forehead_diadem", [0, 1.836, 0.143], 0.036, 0.052, gold, head);
  bead([0, 1.862, 0.157], 0.012, "#7ad3b4", head);

  b.sweep(neck, 0.052, { color: skin, sides: 8, name: "neck_skin" });
  const torso = b.loft([
    { at: [0, 0.98, 0], w: 0.27, h: 0.19 },
    { at: [0, 1.1, 0], w: 0.245, h: 0.17 },
    { at: [0, 1.26, 0], w: 0.33, h: 0.205 },
    { at: [0, 1.38, 0], w: 0.405, h: 0.2 },
    { at: [0, 1.425, 0], w: 0.205, h: 0.145 }
  ], {
    bone: spine, color: green, sides: 8, caps: "flat", name: "fitted_emerald_tunic"
  });
  b.decal(torso, bodiceEmbroidery, {
    at: [0, 1.241, 0.15], dir: [0, 0, 1], size: [0.283, 0.294],
    lift: 0.002, segments: 14, name: "tailored_leaf_embroidery"
  });
  b.decal(torso, leafEmblem, {
    at: [0, 1.32, 0.12], dir: [0, 0, 1], size: [0.089, 0.105],
    bone: spine.joints[1], lift: 0.003, name: "wardens_crest"
  });

  // Fitted open collar, rather than two unattached leaves in front of the throat.
  for (const s of [1, -1]) {
    const collar = b.slab([
      [s * 0.045, 1.445, 0.045],
      [s * 0.102, 1.413, 0.063],
      [s * 0.081, 1.367, 0.104],
      [s * 0.025, 1.399, 0.088]
    ], { color: greenDark, thickness: 0.012, bone: spine.tip!, name: `open_collar_${s}` });
    b.sweep([
      [s * 0.045, 1.445, 0.052],
      [s * 0.102, 1.413, 0.07],
      [s * 0.081, 1.367, 0.111]
    ], 0.004, { color: C.gold, bone: collar.bone!, sides: 5 });
  }

  for (const { s, side, arm, leg, fingers, thumb } of sides) {
    b.sweep(arm, t => t < 0.49 ? 0.062 - t * 0.035 : 0.044 - (t - 0.49) * 0.023, {
      color: skin, sides: 8, to: 0.89, name: `arm_skin_${side}`
    });
    b.sweep(arm, [0.078, 0.062], {
      color: greenDark, from: 0, to: 0.28, sides: 8, caps: "flat", name: `sleeve_${side}`
    });
    const shoulder = ellipsoid(`shoulder_shell_${side}`,
      [s * 0.242, 1.401, -0.001], [0.116, 0.073, 0.112], green, arm.joints[0]);
    const shoulderSkin = b.surface(shoulder);
    const shoulderRim = shoulderSkin.loop([s * 0.242, 1.395, 0], {
      dir: [0, 1, 0], lift: 0.001
    });
    b.sweep(shoulderRim, 0.004, { color: gold, bone: arm.joints[0], sides: 5 });
    for (let i = 0; i < 3; i++) {
      const x = s * (0.205 + i * 0.053);
      const plateHeight = 0.139 - i * 0.012;
      const plate = leafPlate(
        `shoulder_leaf_${side}_${i}`, [x, 1.322 - i * 0.018, 0.085],
        0.125 - i * 0.013, plateHeight, i % 2 ? greenLight : green,
        arm.joints[0], [s, 0, 0], [s * 0.25, 1, -0.12]
      );
      const front = s * 0.012;
      b.rod(plate.local([0, 0.016, front]), plate.local([0, plateHeight * 0.88, front]),
        0.003, { color: C.gold, bone: arm.joints[0], sides: 5 });
      for (const sign of [1, -1]) {
        b.rod(plate.local([0, plateHeight * 0.42, front]),
          plate.local([sign * 0.026, plateHeight * 0.63, front]),
          0.002, { color: "#a3bd86", bone: arm.joints[0], sides: 4 });
      }
      bead(plate.local([0, plateHeight * 0.75, front]), 0.0055, C.lightGold, arm.joints[0]);
    }

    b.sweep(arm, [0.058, 0.045], {
      color: leather, from: 0.53, to: 0.88, sides: 8, caps: "flat",
      name: `archery_bracer_${side}`
    });
    for (const t of [0.55, 0.83]) {
      b.sweep(arm, 0.059 - (t - 0.55) * 0.04, {
        color: gold, from: t, to: t + 0.025, sides: 8, caps: "flat"
      });
    }
    const bracerPlate = leafPlate(`bracer_leaf_${side}`, [s * 0.64, 1.257, 0.059],
      0.082, 0.12, greenDark, arm.joints[1], [1, 0, 0], [s, 0.2, 0]);
    b.rod(bracerPlate.local([0, 0.02, s * 0.012]),
      bracerPlate.local([0, 0.103, s * 0.012]),
      0.003, { color: C.gold, bone: arm.joints[1], sides: 5 });
    for (let i = 0; i < 4; i++) {
      bead([s * (0.58 + i * 0.035), 1.297 - i * 0.007, 0.061],
        0.005, C.gold, arm.joints[1]);
    }
    ellipsoid(`gloved_palm_${side}`, [s * 0.839, 1.267, 0.016],
      [0.055, 0.032, 0.054], leather, arm.tip!);
    for (const finger of fingers) {
      b.sweep(finger, [0.01, 0.007], { color: skin, sides: 6 });
      b.sweep(finger, [0.011, 0.01], { color: leather, sides: 6, to: 0.3 });
    }
    b.sweep(thumb, [0.013, 0.009], { color: skin, sides: 6 });

    b.sweep(leg, t => 0.082 - t * 0.037, {
      color: cel("#b9c3a7", "#87998a"), to: 0.77, sides: 8, name: `leggings_${side}`
    });
    b.sweep(leg, [0.074, 0.052], {
      color: leather, from: 0.45, to: 0.92, sides: 8, caps: "flat", name: `tall_boot_${side}`
    });
    b.sweep(leg, [0.079, 0.077], {
      color: C.darkLeather, from: 0.445, to: 0.49, sides: 8, caps: "flat",
      name: `turned_boot_cuff_${side}`
    });
    box(`boot_sole_${side}`, [s * 0.17, 0.121, 0.074],
      [0.14, 0.041, 0.245], C.sole, leg.tip!);
    ellipsoid(`boot_toe_${side}`, [s * 0.17, 0.169, 0.1],
      [0.073, 0.054, 0.128], leather, leg.tip!);
    leafPlate(`shin_guard_${side}`, [s * 0.16, 0.26, 0.063],
      0.107, 0.265, greenDark, leg.joints[1]);
    b.rod([s * 0.16, 0.291, 0.078], [s * 0.16, 0.486, 0.078],
      0.0035, { color: C.gold, bone: leg.joints[1], sides: 5 });
    for (let i = 0; i < 5; i++) {
      const y = 0.295 + i * 0.042;
      b.rod([s * 0.16 - 0.031, y, 0.077], [s * 0.16 + 0.031, y + 0.023, 0.077],
        0.003, { color: "#b59b6c", bone: leg.joints[1], sides: 5 });
      b.rod([s * 0.16 + 0.031, y, 0.078], [s * 0.16 - 0.031, y + 0.023, 0.078],
        0.003, { color: "#b59b6c", bone: leg.joints[1], sides: 5 });
    }
    leafPlate(`knee_leaf_${side}`, [s * 0.14, 0.535, 0.082],
      0.117, 0.123, greenLight, leg.joints[1]);
    bead([s * 0.14, 0.602, 0.099], 0.01, gold, leg.joints[1]);
  }

  // Split skirt and fitted belt.
  for (const s of [1, -1]) {
    const skirt = b.extrude([
      [-0.055, 0], [-0.072, -0.22], [-0.016, -0.33],
      [0.105, -0.235], [0.067, 0]
    ], {
      at: [s * 0.104, 1.02, 0.105], x: [s, 0, 0], y: [0, 1, -0.22],
      thickness: 0.025, bevel: 0.004, color: green, bone: hips, name: `split_tunic_${s}`
    });
    b.sweep([
      skirt.local([0.06, -0.012, s * 0.014]),
      skirt.local([0.099, -0.231, s * 0.014]),
      skirt.local([-0.016, -0.319, s * 0.014])
    ], 0.004, { color: C.gold, bone: hips, sides: 5 });
    b.sweep([
      skirt.local([0.012, -0.035, s * 0.014]),
      skirt.local([0.025, -0.16, s * 0.014]),
      skirt.local([-0.013, -0.29, s * 0.014])
    ], 0.003, { color: "#8dbb84", bone: hips, sides: 5 });
    for (let i = 0; i < 3; i++) {
      b.rod(skirt.local([0.024, -0.11 - i * 0.045, s * 0.014]),
        skirt.local([-0.023, -0.082 - i * 0.045, s * 0.014]),
        0.0025, { color: "#7da47a", bone: hips, sides: 4 });
    }
  }
  b.extrude([
    [-0.073, 0], [0.073, 0], [0.081, -0.25], [0, -0.335], [-0.081, -0.25]
  ], {
    at: [0, 1.012, 0.121], x: [1, 0, 0], y: [0, 1, -0.05],
    thickness: 0.012, color: greenDark, bone: hips, name: "embroidered_front_tabard"
  });
  drawing("tabard_brocade", brocade, [0, 0.87, 0.139], 0.14, 0.264, hips);
  for (const s of [1, -1]) {
    box(`tabard_belt_loop_${s}`, [s * 0.052, 1.025, 0.12],
      [0.023, 0.07, 0.022], leather, hips);
    bead([s * 0.052, 1.005, 0.135], 0.0055, gold, hips);
  }
  const beltLoop = b.surface(torso).loop([0, 1.055, 0], { dir: [0, 1, 0], lift: 0.006 });
  b.sweep(beltLoop, 0.026, { color: leather, sides: 6, bone: hips, name: "waist_belt" });
  box("belt_buckle", [0, 1.055, 0.125], [0.067, 0.06, 0.021], gold, hips);
  box("buckle_inset", [0, 1.055, 0.138], [0.043, 0.035, 0.008], C.darkLeather, hips);
  b.rod([-0.027, 1.055, 0.145], [0.022, 1.055, 0.145], 0.004,
    { color: C.gold, bone: hips });
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      bead([s * (0.047 + i * 0.024), 1.057, 0.114 - i * 0.007], 0.0045, gold, hips);
    }
  }
  const strap = b.surface(torso).drape([
    [-0.155, 1.4, 0.081], [-0.08, 1.29, 0.12], [0.03, 1.16, 0.12], [0.105, 1.065, 0.1]
  ], { lift: 0.013 });
  b.sweep(strap, 0.018, { color: leather, sides: 6, name: "quiver_shoulder_strap" });
  b.along(strap, 8, p => bead(p, 0.0035, C.gold, p.bone!));

  // The cloak has a bowed profile, broad folds, and embroidery actually on its surface.
  const cloakPanels: ReturnType<typeof b.membrane>[] = [];
  const capeEdge = (u: number) => [
    [u * 0.195, 1.421, -0.112],
    [u * 0.245, 1.12, -0.205 - 0.025 * Math.cos(u * Math.PI * 3)],
    [u * 0.338, 0.7, -0.29 - 0.026 * Math.cos(u * Math.PI * 3)],
    [u * 0.382, 0.34 + 0.044 * Math.abs(u), -0.31 + 0.028 * Math.abs(u)]
  ];
  for (let i = 0; i < 6; i++) {
    const u0 = -1 + i / 3;
    const u1 = -1 + (i + 1) / 3;
    cloakPanels.push(b.membrane(capeEdge(u0), capeEdge(u1), {
      color: i % 2 ? greenDark : green, thickness: 0.013,
      bone: capeJoints, rows: 3, cols: 7, name: `cloak_fold_${i}`
    }));
  }
  for (const s of [1, -1]) {
    b.sweep(capeEdge(s), 0.006, {
      color: C.gold, bone: capeJoints, sides: 5, name: "cloak_gold_selvedge"
    });
    b.decal(cloakPanels, cloakBorder, {
      at: [s * 0.263, 0.835, -0.4], dir: [0, 0, -1],
      size: [0.065, 0.61], roll: s * -10, lift: 0.002,
      segments: 14, name: `woven_cloak_border_${s}`
    });
    bead([s * 0.155, 1.418, 0.055], 0.024, gold, spine.tip!);
    bead([s * 0.155, 1.418, 0.077], 0.013, "#8dc7aa", spine.tip!);
  }
  b.decal(cloakPanels, treeEmblem, {
    at: [0, 0.95, -0.4], dir: [0, 0, -1], size: [0.31, 0.4],
    lift: 0.002, segments: 16, name: "silverwood_tree_on_cloak"
  });
  b.sweep(Array.from({ length: 13 }, (_, i) => capeEdge(-1 + i / 6)[3]),
    0.006, { color: C.gold, bone: capeJoints.joints[2], sides: 5, name: "cloak_hem" });
  b.sweep(bezier([-0.15, 1.421, 0.075], [0, 1.327, 0.131], [0.15, 1.421, 0.075]),
    0.0035, { color: C.gold, bone: spine.tip!, sides: 5 });

  box("belt_pouch", [-0.19, 0.99, 0.015], [0.105, 0.13, 0.095], leather, hips, [0, 0, -8]);
  leafPlate("pouch_flap", [-0.19, 0.958, 0.068], 0.115, 0.083, C.darkLeather, hips);
  bead([-0.19, 0.991, 0.083], 0.009, gold, hips);
  b.sweep([[0.19, 1.013, 0], [0.255, 0.8, 0.01], [0.28, 0.67, 0.01]],
    [0.028, 0.017], { color: C.darkLeather, bone: hips, sides: 6, name: "knife_scabbard" });
  b.rod([0.183, 1.033, 0], [0.16, 1.11, 0], 0.019, { color: wood, bone: hips, sides: 6 });
  b.rod([0.15, 1.027, 0], [0.219, 1.047, 0], 0.009, { color: gold, bone: hips, sides: 6 });
  bead([0.158, 1.117, 0], 0.022, gold, hips);
  bead([0.281, 0.667, 0.012], 0.022, gold, hips);

  const quiverA = new THREE.Vector3(-0.155, 1.055, -0.223);
  const quiverB = new THREE.Vector3(-0.313, 1.563, -0.243);
  b.sweep([
    [-0.155, 1.405, 0.075], [-0.186, 1.445, -0.035],
    [-0.215, 1.424, -0.143], [-0.259, 1.391, -0.221]
  ], 0.019, {
    color: leather, bone: spine.joints[1], sides: 6, name: "quiver_upper_suspension"
  });
  b.sweep([
    [-0.116, 1.077, -0.049], [-0.142, 1.09, -0.125], [-0.177, 1.125, -0.211]
  ], 0.018, {
    color: leather, bone: spine.joints[1], sides: 6, name: "quiver_lower_suspension"
  });
  const quiver = b.sweep([quiverA, quiverB], [0.071, 0.083], {
    color: leather, bone: spine.joints[1], sides: 10, caps: "flat", name: "leather_quiver"
  });
  for (const t of [0.04, 0.78, 0.98]) {
    const p = quiverA.clone().lerp(quiverB, t);
    const q = quiverA.clone().lerp(quiverB, Math.min(1, t + 0.025));
    b.rod(p, q, 0.085, { color: gold, bone: spine.joints[1], sides: 10 });
  }
  b.decal(quiver, leafEmblem, {
    at: [-0.275, 1.351, -0.125], dir: [0, 0, 1], size: [0.093, 0.13],
    lift: 0.002, bone: spine.joints[1], roll: -17, name: "quiver_crest"
  });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.005, 10), C.darkLeather, {
    at: quiverB, dir: quiverB.clone().sub(quiverA), bone: spine.joints[1]
  });
  for (let i = 0; i < 5; i++) {
    const x = -0.313 + (i - 2) * 0.025;
    const z = -0.244 + (i % 2) * 0.032;
    const y = 1.85 + (i % 3) * 0.038;
    const tip = [x - 0.074, y, z - 0.008];
    b.rod([x + 0.026, 1.48, z], tip, 0.0035, {
      color: wood, bone: spine.joints[1], sides: 5
    });
    for (const s of [1, -1]) {
      b.slab([
        [tip[0], y - 0.016, tip[2]],
        [tip[0] + s * 0.025, y - 0.034, tip[2]],
        [tip[0] + s * 0.019, y - 0.09, tip[2]],
        [tip[0] + 0.018, y - 0.105, tip[2]]
      ], { color: i % 2 ? C.cream : "#90c3aa", thickness: 0.003, bone: spine.joints[1] });
    }
    b.rod([tip[0], y - 0.009, tip[2]], [tip[0] - 0.004, y + 0.012, tip[2]],
      0.006, { color: gold, bone: spine.joints[1], sides: 5 });
  }

  // A gilded moonwood bow: broad enough for its inlaid runes to read.
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
  const bow = b.sweep(bowPath, t => 0.012 + 0.017 * Math.sin(Math.PI * t), {
    color: wood, bone: bowHand, sides: 6, name: "recurved_moonwood_bow"
  });
  b.sweep(bow.line(90), 0.0035, { color: C.gold, bone: bowHand, sides: 5 });
  b.sweep(bow.line(-90), 0.002, { color: C.lightGold, bone: bowHand, sides: 5 });
  b.rod(
    [bowX - 0.037, bowY - 0.64, bowZ], [bowX - 0.037, bowY + 0.64, bowZ],
    0.0016, { color: "#dce5cf", bone: bowHand, sides: 4, name: "taut_bowstring" }
  );
  b.rod([bowX, bowY - 0.055, bowZ], [bowX, bowY + 0.055, bowZ],
    0.029, { color: C.darkLeather, bone: bowHand, sides: 8, name: "bow_grip" });
  for (let i = 0; i < 7; i++) {
    b.rod([bowX, bowY - 0.05 + i * 0.015, bowZ],
      [bowX, bowY - 0.046 + i * 0.015, bowZ], 0.03,
      { color: "#a98b5f", bone: bowHand, sides: 8 });
  }
  const bowSurface = b.surface(bow);
  for (const s of [1, -1]) {
    const seat = bowSurface.nearest([bowX + 0.14, bowY + s * 0.29, bowZ + 0.07]);
    const fitting = leafPlate(
      `bow_leaf_fitting_${s}`, [seat.at.x, seat.at.y - 0.056, seat.at.z + 0.004],
      0.066, 0.112, gold, bowHand
    );
    leafPlate(`bow_fitting_inlay_${s}`,
      fitting.local([0, 0.02, 0.012]), 0.036, 0.074, greenDark, bowHand);
    glow(bead(fitting.local([0, 0.057, 0.024]), 0.013, "#8ce0b7", bowHand), 0.65);
    glow(b.decal(bow, runes, {
      at: [bowX + 0.105, bowY + s * 0.40, bowZ + 0.065],
      dir: [0, 0, 1], size: [0.024, 0.145],
      segments: 12, lift: 0.0015, bone: bowHand, name: `bow_runes_${s}`
    }), 0.8);
    const tip = [bowX - 0.037, bowY + s * 0.64, bowZ];
    bead(tip, 0.017, gold, bowHand);
    b.sweep([
      [bowX + 0.011, bowY + s * 0.591, bowZ],
      tip
    ], [0.02, 0.012], { color: steel, bone: bowHand, sides: 6, caps: "flat" });
  }

  // A tighter footprint: the platform frames the figure without becoming a second subject.
  const baseX = 1.01;
  const baseZ = 0.55;
  b.part(new THREE.CylinderGeometry(baseX, baseX + 0.04, 0.066, 12), "#283d42", {
    at: [0, 0.033, 0], scale: [1, 1, baseZ], bone: hips, name: "shrine_plinth"
  });
  b.part(new THREE.CylinderGeometry(baseX - 0.04, baseX, 0.034, 12), stone, {
    at: [0, 0.083, 0], scale: [1, 1, baseZ], bone: hips, name: "mossy_stone_platform"
  });
  drawing("warden_nameplate", plaqueTexture, [0, 0.057, 0.572], 0.35, 0.087, hips);

  // The exposed incised ring is restrained and never luminous.
  for (let j = 0; j < 12; j++) {
    const a = j * Math.PI * 2 / 12;
    bead([Math.sin(a) * 0.995, 0.054, Math.cos(a) * 0.548], 0.009, C.gold, hips);
    const path = Array.from({ length: 5 }, (_, k) => {
      const t = a + (k / 4) * Math.PI * 2 / 12 * 0.82;
      return [Math.sin(t) * 0.865, 0.101, Math.cos(t) * 0.438];
    });
    b.sweep(path, 0.0024, { color: "#a6ad8a", bone: hips, sides: 4, caps: "flat" });
    if (j % 2 === 0) {
      const x = Math.sin(a) * 0.8;
      const z = Math.cos(a) * 0.4;
      b.slab([
        [x - 0.012, 0.1015, z], [x, 0.1015, z + 0.023],
        [x + 0.012, 0.1015, z], [x, 0.1015, z - 0.023]
      ], { thickness: 0.001, color: "#a6ad8a", bone: hips });
    }
  }
  for (const points of [
    [[-0.62, 0.102, -0.33], [-0.51, 0.102, -0.18], [-0.56, 0.102, -0.04]],
    [[0.56, 0.102, 0.34], [0.47, 0.102, 0.22], [0.53, 0.102, 0.11]],
    [[0.16, 0.102, -0.49], [0.21, 0.102, -0.38], [0.17, 0.102, -0.33]]
  ]) {
    b.sweep(points, 0.0025, { color: "#374d4b", bone: hips, sides: 4, caps: "flat" });
  }

  for (let i = 0; i < 15; i++) {
    const a = random() * Math.PI * 2;
    const r = 0.4 + random() * 0.43;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r * 0.49;
    if (Math.abs(x) < 0.28 && z > -0.2) continue;
    b.part(new THREE.DodecahedronGeometry(0.04 + random() * 0.027, 0), stone, {
      at: [x, 0.112, z], scale: [1.35, 0.42, 1], bone: hips, rotation: [0, random() * 180, 0]
    });
    ellipsoid("moss_patch", [x + 0.02, 0.109, z], [0.064, 0.009, 0.039],
      i % 2 ? "#526e4a" : "#779268", hips);
  }
  function fern(x: number, z: number, size: number) {
    const root = [x, 0.107, z];
    for (let j = 0; j < 5; j++) {
      const a = (j - 2) * 0.62;
      const tip = [x + Math.sin(a) * size, 0.11 + size * 0.65, z + Math.cos(a) * size * 0.45];
      const frond = bezier(root, [x, 0.11 + size * 0.85, z], tip);
      b.sweep(frond, [0.003, 0.001], { color: "#86a66d", bone: hips, sides: 4 });
      for (let k = 1; k <= 3; k++) {
        const p = frond.at(k / 4);
        for (const s of [1, -1]) {
          b.slab([
            [p.x, p.y, p.z],
            [p.x + s * size * 0.19, p.y + size * 0.055, p.z + size * 0.02],
            [p.x + s * size * 0.09, p.y, p.z + size * 0.07]
          ], { color: k % 2 ? "#4f8662" : "#82a875", thickness: 0.003, bone: hips });
        }
      }
    }
  }
  fern(-0.61, -0.16, 0.235);
  fern(0.57, -0.21, 0.21);
  for (const [x, z] of [[-0.75, 0.12], [0.72, -0.08], [-0.43, -0.34]]) {
    b.rod([x, 0.103, z], [x, 0.19, z], 0.003, { color: "#4f8662", bone: hips, sides: 4 });
    for (let j = 0; j < 5; j++) {
      const a = j * Math.PI * 2 / 5;
      b.part(new THREE.OctahedronGeometry(0.023, 0), "#b9d9d0", {
        at: [x + Math.cos(a) * 0.018, 0.19, z + Math.sin(a) * 0.018],
        scale: [1, 0.42, 1], bone: hips
      });
    }
    glow(bead([x, 0.198, z], 0.008, C.cyan, hips), 1.2);
  }
  return b.root;
}
```