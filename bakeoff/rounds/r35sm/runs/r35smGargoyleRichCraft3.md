```ts
import * as THREE from "three";
import { createBuilder, rng, paint, noise, mix, smoothstep, svg, catmull, polyline, bezier } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Cathedral Gargoyle",
  description: "A crouched gothic stone gargoyle with horns, bat wings and glowing eyes, perched on a carved cathedral ledge.",
};

// ---------- palette & paints ----------
const DARK = "#26252a";
const BONE = "#d9d2c2";
const MAW = "#5a1a1a";
const TONGUE = "#9a3a3a";

const weathered = (seed: number, tone: number) =>
  paint((p, n) => {
    let c = mix("#6c6a66", "#9b978d", noise(p, 0.13, seed));
    c = mix(c, "#44433f", 0.8 * smoothstep(0.6, 0.8, noise(p, 0.045, seed + 3)));
    c = mix(c, "#b5b0a3", 0.35 * smoothstep(0.4, 0.95, n.y) * smoothstep(0.4, 0.7, noise(p, 0.05, seed + 4)));
    if (tone < 1) c = mix(c, "#2c2b30", 1 - tone);
    // moss on upward faces
    c = mix(c, "#5d7a38", 0.75 * smoothstep(0.25, 0.7, n.y) * smoothstep(0.58, 0.68, noise(p, 0.18, seed + 7)));
    // rain stains / soot under overhangs
    c = mix(c, "#33322f", 0.45 * smoothstep(0.1, -0.7, n.y) * smoothstep(0.35, 0.7, noise(p, 0.06, seed + 9)));
    return c;
  });
const STONE = weathered(1, 1);
const STONE_D = weathered(5, 0.7);
const STONE_L = weathered(9, 1.0);
const LEDGE = weathered(13, 0.95);

// ---------- textures ----------
const EYE = svg(
  `<svg viewBox="0 0 64 40">
    <path d="M2 26 Q32 -2 62 26 Q32 42 2 26Z" fill="#150c07"/>
    <path d="M7 26 Q32 5 57 26 Q32 37 7 26Z" fill="#ff8f2a"/>
    <path d="M14 26 Q32 14 50 26 Q32 33 14 26Z" fill="#ffd36a"/>
    <ellipse cx="32" cy="25" rx="3.6" ry="11" fill="#150c07"/>
    <path d="M0 6 L64 18 L64 0 L0 0Z" fill="#150c07"/>
  </svg>`,
  { size: 192 },
);
const QUATREFOIL = svg(
  `<svg viewBox="0 0 100 100">
    <g fill="none" stroke="#2a2a2e" stroke-width="4.5">
      <circle cx="50" cy="29" r="19"/><circle cx="50" cy="71" r="19"/>
      <circle cx="29" cy="50" r="19"/><circle cx="71" cy="50" r="19"/>
      <circle cx="50" cy="50" r="46"/>
    </g>
    <circle cx="50" cy="50" r="6" fill="#2a2a2e"/>
  </svg>`,
  { size: 192 },
);
function arcade() {
  let s = "";
  for (let i = 0; i < 5; i++) {
    const x = 4 + i * 23;
    s += `<path d="M${x} 17 L${x} 8 Q${x} 3 ${x + 9.5} 1 Q${x + 19} 3 ${x + 19} 8 L${x + 19} 17Z" fill="#37363c" stroke="#a9a59a" stroke-width="1.4"/>`;
    s += `<path d="M${x + 4} 17 L${x + 4} 9 Q${x + 5} 6 ${x + 9.5} 5 Q${x + 14} 6 ${x + 15} 9 L${x + 15} 17Z" fill="#24232a"/>`;
  }
  return svg(`<svg viewBox="0 0 120 18">${s}</svg>`, { size: 768 });
}
const ARCADE = arcade();

export default function build() {
  const b = createBuilder({ name: "gargoyle" });
  const R = rng(11);
  const L = 0.3; // ledge top height

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, L + 0.36, -0.38] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, L + 0.36, -0.38],
      [0, L + 0.42, -0.15],
      [0, L + 0.58, 0.12],
      [0, L + 0.78, 0.28],
    ]),
    { parent: hips, role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];
  const HP = { y: L + 0.98, z: 0.52 };
  const neck = b.chain(
    "neck",
    catmull([
      [0, L + 0.78, 0.28],
      [0, L + 0.9, 0.38],
      [0, HP.y, HP.z],
    ]),
    { parent: chest, role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: [0, HP.y, HP.z],
    dir: [0, -0.05, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, HP.y - 0.07, HP.z + 0.04],
    aim: [0, HP.y - 0.08, HP.z + 0.3],
    role: "jaw",
  });
  const hp = (x: number, y: number, z: number) => [x, HP.y + y, HP.z + z] as [number, number, number];

  // ---------- ledge ----------
  const ledgeFront = 0.8;
  b.part(new THREE.BoxGeometry(1.4, 0.22, 1.6), LEDGE, { bone: hips, at: [0, 0.11, 0.0] });
  b.part(new THREE.BoxGeometry(1.5, 0.08, 1.7), STONE_L, { bone: hips, at: [0, 0.26, 0.0] });
  b.part(new THREE.BoxGeometry(1.46, 0.04, 1.66), LEDGE, { bone: hips, at: [0, 0.02, 0.0] });
  for (let i = 0; i < 11; i++) {
    b.part(new THREE.BoxGeometry(0.07, 0.04, 0.05), STONE_L, {
      bone: hips,
      at: [-0.6 + i * 0.12, 0.215, ledgeFront + 0.02],
    });
  }
  b.part(new THREE.PlaneGeometry(1.15, 0.17), "#ffffff", {
    bone: hips,
    at: [0, 0.1, ledgeFront + 0.003],
    dir: [0, 0, 1],
    axis: "z",
    texture: ARCADE,
  });
  // corbel blocks under the front lip
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.1), STONE_D, { bone: hips, at: [s * 0.62, 0.17, ledgeFront - 0.02] });

  // ---------- body ----------
  const body = b.sweep(spine, [0.19, 0.25, 0.27, 0.17], {
    color: STONE,
    sides: 8,
    smooth: false,
    shift: () => [0, -0.03],
  });
  b.along(body, 6, (at) => {
    b.spike(at, at, 0.12, 0.034, { color: STONE_D });
  });
  b.sweep(neck, [0.15, 0.12], { color: STONE, sides: 8, smooth: false });
  b.along(b.sweep(neck, [0.16, 0.13], { color: STONE_D, sides: 6, smooth: false }), 3, (at) => {
    b.spike(at, at, 0.09, 0.03, { color: STONE_D });
  });
  // chest carving
  b.decal(body, QUATREFOIL, { at: [0, L + 0.56, 0.38], dir: [0, 0.2, 1], size: [0.22, 0.22], segments: 12 });
  // chest ribs
  for (let i = 0; i < 3; i++)
    b.part(new THREE.BoxGeometry(0.34 - i * 0.04, 0.025, 0.05), STONE_L, {
      bone: chest,
      at: [0, L + 0.43 + i * 0.07, 0.31 + i * 0.03],
      rotation: [-15, 0, 0],
    });

  // ---------- head ----------
  b.part(new THREE.BoxGeometry(0.38, 0.27, 0.32), STONE, { bone: head, at: hp(0, 0.02, 0.02) });
  b.part(new THREE.BoxGeometry(0.28, 0.12, 0.24), STONE, { bone: head, at: hp(0, -0.035, 0.25) });
  b.part(new THREE.BoxGeometry(0.1, 0.06, 0.2), STONE_L, { bone: head, at: hp(0, 0.04, 0.27), rotation: [-8, 0, 0] });
  b.part(new THREE.BoxGeometry(0.42, 0.075, 0.13), STONE_D, { bone: head, at: hp(0, 0.125, 0.12), rotation: [14, 0, 0] });
  for (const s of [1, -1]) {
    // nostrils, cheeks
    b.part(new THREE.SphereGeometry(0.022, 6, 4), DARK, { bone: head, at: hp(s * 0.05, 0.01, 0.375) });
    b.part(new THREE.BoxGeometry(0.06, 0.12, 0.18), STONE_D, { bone: head, at: hp(s * 0.2, -0.03, 0.06), rotation: [0, s * 10, 0] });
    // eyes
    glow(
      b.part(new THREE.PlaneGeometry(0.1, 0.0625), "#ffffff", {
        bone: head,
        at: hp(s * 0.1, 0.065, 0.186),
        dir: [0, 0, 1],
        axis: "z",
        texture: EYE,
        rotation: [0, 0, s * 8],
      }),
      1.4,
    );
    // horns
    b.sweep(
      bezier(hp(s * 0.12, 0.13, -0.02), hp(s * 0.26, 0.22, -0.1), hp(s * 0.26, 0.3, -0.18), hp(s * 0.2, 0.45, -0.3)),
      [0.055, 0.0],
      { bone: head, color: STONE_L, sides: 6, caps: { start: "flat", end: "point" } },
    );
    // ears
    b.spike(hp(s * 0.18, 0.06, -0.04), [s, 0.5, -0.45], 0.17, 0.05, { bone: head, color: STONE_D, sides: 5 });
    // fangs
    b.spike(hp(s * 0.085, -0.09, 0.35), [0, -1, 0.1], 0.1, 0.02, { bone: head, color: BONE, sides: 5 });
    b.spike(hp(s * 0.1, -0.09, 0.3), [0, -1, 0.05], 0.05, 0.016, { bone: head, color: BONE, sides: 5 });
    b.spike(hp(s * 0.075, -0.115, 0.34), [0, 1, 0.05], 0.09, 0.019, { bone: jaw, color: BONE, sides: 5 });
    // brow spikes
    b.spike(hp(s * 0.17, 0.14, 0.08), [s * 0.7, 0.5, 0.3], 0.09, 0.025, { bone: head, color: STONE_L, sides: 5 });
    // jaw side
    b.part(new THREE.BoxGeometry(0.04, 0.07, 0.16), STONE, { bone: jaw, at: hp(s * 0.13, -0.11, 0.1) });
  }
  // lower jaw, interior, tongue
  b.part(new THREE.BoxGeometry(0.26, 0.065, 0.3), STONE, { bone: jaw, at: hp(0, -0.12, 0.2) });
  b.part(new THREE.BoxGeometry(0.2, 0.02, 0.22), MAW, { bone: jaw, at: hp(0, -0.082, 0.22) });
  b.part(new THREE.BoxGeometry(0.1, 0.02, 0.14), TONGUE, { bone: jaw, at: hp(0, -0.07, 0.24) });
  b.part(new THREE.BoxGeometry(0.2, 0.01, 0.2), MAW, { bone: head, at: hp(0, -0.098, 0.22) });
  b.spike(hp(0, -0.15, 0.34), [0, -0.6, 0.6], 0.11, 0.03, { bone: jaw, color: STONE_L, sides: 5 }); // beard
  b.spike(hp(0, 0.15, 0.0), [0, 0.7, -0.4], 0.12, 0.035, { bone: head, color: STONE_D, sides: 5 }); // crest

  // ---------- legs ----------
  const claw = (base: number[], dir: number[], bone: any, len = 0.1, r = 0.028) =>
    b.spike(base, dir, len, r, { bone, color: BONE, sides: 5 });
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const legChain = b.chain(
      `leg${S}`,
      polyline([
        [s * 0.24, L + 0.45, -0.36],
        [s * 0.3, L + 0.42, -0.1],
        [s * 0.26, L + 0.14, -0.36],
        [s * 0.26, L + 0.065, -0.14],
      ]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`], role: "leg" },
    );
    b.sweep(legChain, [0.13, 0.1, 0.06, 0.055], { color: STONE, sides: 8, smooth: false });
    const hipJ = legChain.joints[0];
    const foot = legChain.joints[legChain.joints.length - 1];
    b.part(new THREE.SphereGeometry(0.2, 8, 6), STONE, { bone: hipJ, at: [s * 0.27, L + 0.4, -0.3], scale: [0.8, 1, 1.15] });
    b.part(new THREE.SphereGeometry(0.07, 6, 5), STONE_L, { bone: legChain.joints[1], at: [s * 0.33, L + 0.43, -0.08] });
    b.spike([s * 0.27, L + 0.18, -0.4], [0, 0.2, -1], 0.1, 0.03, { bone: legChain.joints[2], color: STONE_L, sides: 5 });
    b.part(new THREE.BoxGeometry(0.15, 0.06, 0.18), STONE, { bone: foot, at: [s * 0.26, L + 0.04, -0.11] });
    for (let i = -1; i <= 1; i++) claw([s * 0.26 + i * 0.05, L + 0.04, -0.03], [i * 0.2, -0.3, 1], foot);
  }

  // ---------- arms ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${S}`,
      polyline([
        [s * 0.3, L + 0.68, 0.2],
        [s * 0.37, L + 0.34, 0.0],
        [s * 0.3, L + 0.14, 0.32],
        [s * 0.3, L + 0.075, 0.5],
      ]),
      { parent: chest, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`], role: "arm" },
    );
    b.sweep(arm, [0.12, 0.09, 0.07, 0.065], { color: STONE, sides: 8, smooth: false });
    const hand = arm.joints[arm.joints.length - 1];
    b.part(new THREE.SphereGeometry(0.15, 8, 6), STONE, { bone: arm.joints[0], at: [s * 0.3, L + 0.68, 0.17] });
    b.spike([s * 0.34, L + 0.78, 0.15], [s, 1, -0.2], 0.14, 0.04, { bone: arm.joints[0], color: STONE_D, sides: 5 });
    b.spike([s * 0.4, L + 0.34, -0.06], [s * 0.5, 0.2, -1], 0.13, 0.035, { bone: arm.joints[1], color: STONE_L, sides: 5 });
    b.part(new THREE.BoxGeometry(0.15, 0.07, 0.16), STONE, { bone: hand, at: [s * 0.3, L + 0.045, 0.48] });
    for (let i = -1; i <= 1; i++) claw([s * 0.3 + i * 0.05, L + 0.045, 0.55], [i * 0.25, -0.3, 1], hand, 0.11, 0.03);
  }

  // ---------- wings ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const W: [number, number, number] = [s * 0.46, L + 1.35, -0.35];
    const wingArm = b.chain(
      `wing${S}`,
      polyline([
        [s * 0.16, L + 0.8, -0.05],
        [s * 0.38, L + 1.02, -0.28],
        W,
      ]),
      { parent: chest, names: [`wingA${S}`, `wingB${S}`, `wingWrist${S}`], role: "wing" },
    );
    b.sweep(wingArm, [0.07, 0.05, 0.04], { color: STONE, sides: 6, smooth: false });
    const wrist = wingArm.joints[wingArm.joints.length - 1];
    b.part(new THREE.SphereGeometry(0.06, 6, 5), STONE_L, { bone: wrist, at: W });
    b.spike(W, [s * 0.3, 1, 0.5], 0.14, 0.03, { bone: wrist, color: BONE, sides: 5 });
    const tips: [number, number, number][] = [
      [s * 0.98, L + 1.5, -0.55],
      [s * 0.88, L + 1.08, -0.95],
      [s * 0.52, L + 0.72, -1.0],
    ];
    const fingers = tips.map((t, i) => {
      const f = b.chain(`wingFinger${i + 1}${S}`, polyline([W, t]), {
        parent: wrist,
        names: [`wingFinger${i + 1}${S}`],
        role: "digit",
      });
      b.sweep(f, [0.032, 0.008], { color: STONE_L, sides: 5 });
      return f;
    });
    const back: [number, number, number] = [s * 0.12, L + 0.55, -0.62];
    const wingSkin = weathered(21, 0.75);
    b.membrane(fingers[0], fingers[1], { color: wingSkin, thickness: 0.014, scallop: 0.15 });
    b.membrane(fingers[1], fingers[2], { color: wingSkin, thickness: 0.014, scallop: 0.15 });
    b.membrane(fingers[2], [W, back], { color: wingSkin, thickness: 0.014, bone: wrist });
  }

  // ---------- tail ----------
  const tailPath = catmull([
    [0, L + 0.34, -0.42],
    [0.02, L + 0.2, -0.7],
    [0.3, L + 0.1, -0.75],
    [0.55, L + 0.075, -0.5],
    [0.55, L + 0.075, -0.2],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, count: 5, role: "tail" });
  b.sweep(tail, [0.1, 0.07, 0.03], { color: STONE, sides: 8, smooth: false });
  b.along(tail, 4, (at) => {
    b.spike(at, [0, 1, 0], 0.08, 0.025, { bone: at.bone, color: STONE_D, sides: 5 });
  });
  const tt = tailPath.tangentAt(1);
  b.extrude(
    [
      [0, 0],
      [0.06, 0.07],
      [0.2, 0.0, "sharp"],
      [0.06, -0.07],
    ],
    {
      at: [0.55 + tt.x * 0.02, L + 0.08, -0.2 + tt.z * 0.02],
      x: [tt.x, 0, tt.z],
      y: [0, 1, 0],
      thickness: 0.03,
      bevel: 0.006,
      color: STONE_L,
      bone: tail.joints[tail.joints.length - 1],
    },
  );

  // ---------- debris on the ledge (rubble) ----------
  for (let i = 0; i < 4; i++) {
    const sx = (R() - 0.5) * 1.1;
    b.part(new THREE.DodecahedronGeometry(0.03 + R() * 0.03, 0), STONE_D, {
      bone: hips,
      at: [sx, L + 0.03, 0.4 + R() * 0.2],
      flat: true,
    });
  }

  // open the mouth a little
  b.pose(jaw, { axis: [1, 0, 0], deg: 14 });

  return b.root;
}
```