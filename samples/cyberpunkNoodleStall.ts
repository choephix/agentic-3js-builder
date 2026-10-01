import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { svg } from "../src/texture";
import { mottle, grain } from "../src/paint";
import { glow } from "../kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  name: "Cyberpunk Noodle Stall",
  description:
    "Rain-soaked night-market diorama: steaming noodle counter, neon sign, lanterns, cooking robot, stools, vending machine and overhead cables on a wet street base.",
};

// Palette
const ASPHALT = "#181b22";
const PUDDLE = "#2e5a7a";
const DARKMETAL = "#23262e";
const STEEL = "#3a4150";
const WOOD = "#6b4a2f";
const WOODDARK = "#3d2a18";
const CREAM = "#e8dcc3";
const MAGENTA = "#ff2d95";
const CYAN = "#22e6ff";
const AMBER = "#ffb347";
const LANTERNRED = "#ff4438";
const ROBOT = "#9fb3b5";
const ROBOTDARK = "#39424a";
const CANVAS_DARK = "#14262e";
const BOWL = "#dfe9ec";
const NOODLE = "#ffcf5c";

const neonSignTex = svg(
  `<svg viewBox="0 0 128 192" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="128" height="192" fill="#0b0d14"/>
    <rect x="4" y="4" width="120" height="184" fill="none" stroke="#ff2d95" stroke-width="5"/>
    <text x="64" y="72" font-size="52" text-anchor="middle" fill="#ff2d95" font-family="sans-serif" font-weight="bold">麺</text>
    <text x="64" y="100" font-size="17" text-anchor="middle" fill="#22e6ff" font-family="monospace" font-weight="bold">NOODLE</text>
    <text x="64" y="120" font-size="15" text-anchor="middle" fill="#ffb347" font-family="monospace">24H • 熱</text>
    <path d="M28 140 h72 M34 150 h60 M44 160 h40" stroke="#22e6ff" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="64" cy="172" rx="22" ry="7" fill="none" stroke="#ffb347" stroke-width="4"/>
  </svg>`,
  { size: 256 },
);

const menuTex = svg(
  `<svg viewBox="0 0 128 96" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="128" height="96" fill="#06181d"/>
    <text x="64" y="18" font-size="14" text-anchor="middle" fill="#22e6ff" font-family="monospace" font-weight="bold">MENU 麺</text>
    <g font-family="monospace" font-size="9" fill="#bff3ff">
      <text x="10" y="36">RAMEN .... 12</text>
      <text x="10" y="50">UDON ..... 10</text>
      <text x="10" y="64">SOBA ..... 11</text>
      <text x="10" y="78">GIOZA .... 6</text>
    </g>
    <rect x="4" y="4" width="120" height="88" fill="none" stroke="#22e6ff" stroke-width="3"/>
  </svg>`,
  { size: 256 },
);

const menuTex2 = svg(
  `<svg viewBox="0 0 128 96" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="128" height="96" fill="#1d0a14"/>
    <text x="64" y="18" font-size="13" text-anchor="middle" fill="#ff2d95" font-family="monospace" font-weight="bold">食べ物 FOOD</text>
    <g font-family="monospace" font-size="9" fill="#ffd3e8">
      <text x="10" y="36">SPICY ... 14</text>
      <text x="10" y="50">PORK .... 13</text>
      <text x="10" y="64">VEG ..... 9</text>
      <text x="10" y="78">BEER .... 5</text>
    </g>
    <rect x="4" y="4" width="120" height="88" fill="none" stroke="#ff2d95" stroke-width="3"/>
  </svg>`,
  { size: 256 },
);

const vendTex = svg(
  `<svg viewBox="0 0 96 160" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="96" height="160" fill="#0a0e16"/>
    <rect x="6" y="6" width="84" height="26" fill="none" stroke="#ffb347" stroke-width="3"/>
    <text x="48" y="25" font-size="14" text-anchor="middle" fill="#ffb347" font-family="monospace" font-weight="bold">DRINK</text>
    <g>
      <rect x="12" y="40" width="18" height="26" fill="#22e6ff"/>
      <rect x="36" y="40" width="18" height="26" fill="#ff2d95"/>
      <rect x="60" y="40" width="18" height="26" fill="#ffb347"/>
      <rect x="12" y="72" width="18" height="26" fill="#ff2d95"/>
      <rect x="36" y="72" width="18" height="26" fill="#ffb347"/>
      <rect x="60" y="72" width="18" height="26" fill="#22e6ff"/>
    </g>
    <rect x="12" y="108" width="72" height="34" fill="none" stroke="#22e6ff" stroke-width="3"/>
    <text x="48" y="130" font-size="13" text-anchor="middle" fill="#bff3ff" font-family="monospace">¥¥¥</text>
  </svg>`,
  { size: 256 },
);

const steamTex = svg(
  `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#ffffff" stroke-width="9" stroke-linecap="round" opacity="0.85">
      <path d="M22 120 C 14 95, 30 85, 22 60 C 16 42, 26 30, 22 12"/>
      <path d="M44 120 C 36 95, 52 85, 44 60 C 38 42, 48 30, 44 12" opacity="0.6"/>
    </g>
  </svg>`,
  { size: 128 },
);

const hangSignTex = svg(
  `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="128" height="64" fill="#0b0d14"/>
    <rect x="3" y="3" width="122" height="58" fill="none" stroke="#ffb347" stroke-width="4"/>
    <text x="64" y="28" font-size="19" text-anchor="middle" fill="#ffb347" font-family="sans-serif" font-weight="bold">うまい</text>
    <text x="64" y="48" font-size="13" text-anchor="middle" fill="#22e6ff" font-family="monospace">HOT NOODLE</text>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "cyberpunkNoodleStall" });
  const root = b.joint("base", { at: [0, 0.02, 0] });

  const box = (
    w: number,
    h: number,
    d: number,
    color: Parameters<typeof b.part>[1],
    x: number,
    y: number,
    z: number,
    opts: { ry?: number; rx?: number; rz?: number; bone?: typeof root; texture?: THREE.Texture } = {},
  ) => {
    const g = new THREE.BoxGeometry(w, h, d);
    return b.part(g, color, {
      bone: opts.bone ?? root,
      at: [x, y, z],
      rotation: [opts.rx ?? 0, opts.ry ?? 0, opts.rz ?? 0],
      ...(opts.texture ? { texture: opts.texture } : {}),
    });
  };
  const cyl = (
    rt: number,
    rb: number,
    h: number,
    color: Parameters<typeof b.part>[1],
    x: number,
    y: number,
    z: number,
    seg = 10,
  ) => b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone: root, at: [x, y, z] });

  // ---- Wet street base ----
  const asphalt = mottle(ASPHALT, "#232936", { size: 0.22, seed: 5 });
  box(1.4, 0.08, 1.0, asphalt, 0, 0.04, 0);
  box(1.44, 0.02, 1.04, DARKMETAL, 0, 0.005, 0); // curb rim
  // puddles: thin discs + neon rim slivers
  const puddles: Array<[number, number, number, number]> = [
    [0.42, 0.38, 0.13, 0.09],
    [-0.45, 0.33, 0.1, 0.07],
    [0.1, 0.44, 0.07, 0.05],
    [-0.15, -0.4, 0.09, 0.06],
  ];
  for (const [px, pz, rx, rz] of puddles) {
    const g = new THREE.CylinderGeometry(1, 1, 0.004, 18);
    g.scale(rx, 1, rz);
    b.part(g, PUDDLE, { bone: root, at: [px, 0.082, pz] });
  }
  // glowing reflections in puddles
  glow(
    b.part(new THREE.PlaneGeometry(0.09, 0.012), MAGENTA, {
      bone: root,
      at: [0.42, 0.0845, 0.38],
      dir: [0, 1, 0],
      axis: "z",
    }),
    1.6,
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.07, 0.01), CYAN, {
      bone: root,
      at: [-0.45, 0.0845, 0.33],
      dir: [0, 1, 0],
      axis: "z",
    }),
    1.6,
  );

  // ---- Stall counter ----
  const woodPaint = grain(WOOD, WOODDARK, { size: 0.05, axis: "x", seed: 3 });
  box(0.72, 0.06, 0.36, woodPaint, 0.05, 0.52, 0.08); // counter top
  box(0.66, 0.42, 0.3, DARKMETAL, 0.05, 0.28, 0.08); // counter body
  box(0.6, 0.3, 0.02, STEEL, 0.05, 0.28, 0.24); // front panel
  // neon strip under counter top + kick
  glow(box(0.68, 0.018, 0.012, MAGENTA, 0.05, 0.47, 0.26), 2.2);
  glow(box(0.6, 0.014, 0.014, CYAN, 0.05, 0.09, 0.24), 1.8);
  // side crates under counter
  box(0.2, 0.16, 0.24, WOODDARK, -0.32, 0.16, 0.05);
  box(0.16, 0.12, 0.2, STEEL, 0.42, 0.14, 0.02);

  // ---- Pots, steamer, bowls on counter ----
  // big soup pot
  cyl(0.095, 0.085, 0.13, STEEL, -0.12, 0.615, 0.05, 14);
  cyl(0.088, 0.088, 0.012, "#14161c", -0.12, 0.678, 0.05, 14); // broth surface
  glow(cyl(0.02, 0.02, 0.014, AMBER, -0.12, 0.686, 0.05, 8), 1.2); // broth glow
  cyl(0.02, 0.02, 0.05, DARKMETAL, -0.12, 0.7, 0.05, 8); // pot handle knob? (lid knob stem)
  b.part(new THREE.SphereGeometry(0.016, 8, 6), AMBER, { bone: root, at: [-0.12, 0.73, 0.05] });
  // steamer basket stack
  cyl(0.08, 0.08, 0.05, WOOD, 0.12, 0.58, 0.0, 12);
  cyl(0.082, 0.082, 0.05, WOODDARK, 0.12, 0.63, 0.0, 12);
  cyl(0.05, 0.02, 0.03, WOODDARK, 0.12, 0.67, 0.0, 10); // lid
  // noodle bowl with noodles + chopsticks
  b.lathe(
    [
      [0.001, 0],
      [0.045, 0],
      [0.062, 0.035],
      [0.065, 0.05],
    ],
    { at: [0.28, 0.55, 0.12], bone: root, segments: 14, color: BOWL },
  );
  cyl(0.05, 0.05, 0.012, NOODLE, 0.28, 0.598, 0.12, 12); // noodle mass
  b.rod([0.26, 0.6, 0.1], [0.36, 0.72, 0.2], 0.004, { bone: root, color: WOODDARK });
  // stacked bowls (left)
  for (let i = 0; i < 4; i++) {
    b.lathe(
      [
        [0.001, 0],
        [0.04, 0],
        [0.055, 0.03],
        [0.058, 0.042],
      ],
      { at: [-0.3, 0.55 + i * 0.035, 0.14], bone: root, segments: 12, color: i % 2 ? LANTERNRED : BOWL },
    );
  }
  // chopstick bundle cup
  cyl(0.03, 0.026, 0.07, CYAN, -0.02, 0.585, 0.18, 10);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    b.rod(
      [-0.02 + Math.cos(a) * 0.012, 0.6, 0.18 + Math.sin(a) * 0.012],
      [-0.02 + Math.cos(a) * 0.02, 0.72, 0.18 + Math.sin(a) * 0.02],
      0.0025,
      { bone: root, color: WOODDARK },
    );
  }
  // steam cards above pots
  b.cards(
    [frame([-0.12, 0.69, 0.05], [0, 1, 0]), frame([0.12, 0.685, 0.0], [0, 1, 0]), frame([0.28, 0.62, 0.12], [0, 1, 0])],
    steamTex,
    { size: [0.09, 0.2], lean: 12, flow: [0, 0, 1], color: "#cfe6ea" },
  );

  // ---- Stall frame: posts + awning ----
  const postX = [-0.33, 0.43];
  for (const px of postX) {
    box(0.045, 1.1, 0.045, DARKMETAL, px, 0.6, 0.24); // front posts
    box(0.045, 1.28, 0.045, DARKMETAL, px, 0.69, -0.18); // back posts
  }
  // awning: dark oiled canvas with a faint sheen
  b.part(new THREE.BoxGeometry(0.95, 0.025, 0.62), mottle(CANVAS_DARK, "#1b3540", { size: 0.18, seed: 9 }), {
    bone: root,
    at: [0.05, 1.22, 0.03],
    rotation: [-12, 0, 0],
  });
  // awning front valance with neon edge
  box(0.95, 0.09, 0.015, DARKMETAL, 0.05, 1.1, 0.325);
  glow(box(0.93, 0.016, 0.01, CYAN, 0.05, 1.06, 0.332), 2.2);
  // rain drips along valance: thin rods
  const drips: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 12; i++) {
    const x = -0.38 + i * 0.078;
    const len = 0.03 + (((i * 37) % 10) / 10) * 0.05;
    const dg = new THREE.CylinderGeometry(0.0016, 0.001, len, 4);
    dg.translate(x, 1.055 - len / 2, 0.328);
    drips.push(dg);
  }
  b.part(mergeGeometries(drips)!, "#9fd8e8", { bone: root, at: [0, 0, 0] });

  // ---- Hanging lanterns ----
  const lanternX = [-0.04, 0.2, 0.4];
  lanternX.forEach((lx, i) => {
    const col = i === 1 ? AMBER : LANTERNRED;
    b.rod([lx, 1.12, 0.3], [lx, 1.0, 0.3], 0.003, { bone: root, color: DARKMETAL });
    glow(
      b.lathe(
        [
          [0.001, 0],
          [0.035, 0],
          [0.05, 0.045],
          [0.035, 0.09],
          [0.001, 0.09],
        ],
        { at: [lx, 0.91, 0.3], bone: root, segments: 10, color: col },
      ),
      1.8,
    );
    cyl(0.02, 0.02, 0.015, DARKMETAL, lx, 0.905, 0.3, 8);
    cyl(0.015, 0.015, 0.015, DARKMETAL, lx, 1.005, 0.3, 8);
  });

  // ---- Hanging sign (hinged joint) ----
  const signHinge = b.joint("signSwing", { at: [-0.22, 1.05, 0.22], role: "hinge" });
  box(0.24, 0.13, 0.02, DARKMETAL, -0.22, 0.96, 0.22, { bone: signHinge });
  const signFace = b.part(new THREE.PlaneGeometry(0.22, 0.11), "#ffffff", {
    bone: signHinge,
    at: [-0.22, 0.96, 0.231],
    dir: [0, 0, 1],
    axis: "z",
    texture: hangSignTex,
  });
  glow(signFace, 1.6);
  b.rod([-0.22, 1.1, 0.22], [-0.22, 0.96, 0.22], 0.004, { bone: signHinge, color: DARKMETAL });

  // ---- Tall neon sign (invented lettering) ----
  box(0.05, 1.0, 0.05, DARKMETAL, 0.62, 0.55, -0.2); // pole
  box(0.3, 0.44, 0.08, DARKMETAL, 0.55, 0.98, -0.2); // cabinet
  const neonFace = b.part(new THREE.PlaneGeometry(0.26, 0.4), "#ffffff", {
    bone: root,
    at: [0.55, 0.98, -0.155],
    dir: [0, 0, 1],
    axis: "z",
    texture: neonSignTex,
  });
  glow(neonFace, 1.7);
  glow(box(0.02, 0.4, 0.02, MAGENTA, 0.4, 0.98, -0.17), 2.0); // side tube
  glow(box(0.02, 0.4, 0.02, CYAN, 0.7, 0.98, -0.17), 2.0);

  // ---- Holographic menu panels ----
  const menu1 = b.part(new THREE.PlaneGeometry(0.24, 0.18), "#ffffff", {
    bone: root,
    at: [-0.26, 0.86, -0.16],
    dir: [0.15, 0.25, 1],
    axis: "z",
    texture: menuTex,
  });
  glow(menu1, 1.4);
  const menu2 = b.part(new THREE.PlaneGeometry(0.24, 0.18), "#ffffff", {
    bone: root,
    at: [0.34, 0.86, -0.16],
    dir: [-0.15, 0.25, 1],
    axis: "z",
    texture: menuTex2,
  });
  glow(menu2, 1.4);
  b.rod([-0.26, 0.72, -0.17], [-0.26, 0.82, -0.15], 0.004, { bone: root, color: DARKMETAL });
  b.rod([0.34, 0.72, -0.17], [0.34, 0.82, -0.15], 0.004, { bone: root, color: DARKMETAL });

  // ---- Cooking robot (articulated arms) ----
  const torso = b.joint("cookBody", { at: [0.05, 0.62, -0.1] });
  box(0.22, 0.26, 0.16, ROBOT, 0.05, 0.78, -0.12, { bone: torso });
  box(0.16, 0.12, 0.02, ROBOTDARK, 0.05, 0.79, -0.035, { bone: torso }); // chest plate
  glow(box(0.1, 0.03, 0.012, CYAN, 0.05, 0.82, -0.028, { bone: torso }), 1.8); // chest light
  box(0.18, 0.16, 0.01, LANTERNRED, 0.05, 0.68, -0.03, { bone: torso }); // apron flap
  const neckJ = b.joint("cookNeck", { parent: torso, at: [0.05, 0.93, -0.11], dir: [0, 1, 0.2] });
  b.part(new THREE.SphereGeometry(0.075, 12, 10), ROBOT, { bone: neckJ, at: [0.05, 1.02, -0.09] });
  box(0.11, 0.04, 0.03, DARKMETAL, 0.05, 1.03, -0.03, { bone: neckJ }); // visor bar
  glow(box(0.095, 0.022, 0.012, CYAN, 0.05, 1.03, -0.012, { bone: neckJ }), 2.4); // visor glow
  box(0.05, 0.02, 0.03, MAGENTA, 0.05, 1.06, -0.1, { bone: neckJ }); // head crest fin
  glow(box(0.052, 0.012, 0.032, MAGENTA, 0.05, 1.07, -0.1, { bone: neckJ }), 1.8);
  // chef hat: small cylinder + brim
  b.part(new THREE.CylinderGeometry(0.045, 0.05, 0.06, 10), CREAM, { bone: neckJ, at: [0.05, 1.14, -0.1] });
  b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.015, 10), CREAM, { bone: neckJ, at: [0.05, 1.11, -0.1] });
  // arms: two 2-bone chains with ladle + cleaver
  for (const s of [1, -1]) {
    const shX = 0.05 + s * 0.13;
    const arm = b.chain(
      `cookArm${s > 0 ? "L" : "R"}`,
      [
        [shX, 0.86, -0.1],
        [shX + s * 0.06, 0.78, 0.0],
        [shX - s * 0.02, 0.68, 0.08],
      ],
      { parent: torso, names: s > 0 ? ["shoulderL", "elbowL"] : ["shoulderR", "elbowR"], role: "arm" },
    );
    b.sweep(arm, [0.028, 0.022], { color: ROBOTDARK });
    const tip = arm.at(1);
    // claw hands
    for (const a of [-0.5, 0, 0.5]) {
      b.spike(tip.moved([a * 0.02, -0.03, 0.02]), tip.moved([a * 0.03, -0.08, 0.05]), null, 0.008, {
        color: STEEL,
      });
    }
    if (s > 0) {
      // ladle in left hand
      b.rod(tip.moved([0, -0.03, 0.02]).at, tip.moved([0, -0.16, 0.1]).at, 0.006, {
        bone: arm.joints[1],
        color: STEEL,
      });
      b.lathe(
        [
          [0.001, 0],
          [0.03, 0],
          [0.038, 0.02],
        ],
        { at: tip.moved([0, -0.15, 0.095]).at, bone: arm.joints[1], segments: 10, color: STEEL },
      );
    } else {
      // cleaver in right hand
      b.extrude(
        [
          [0, 0],
          [0.09, 0],
          [0.09, 0.05],
          [0, 0.05],
        ],
        {
          at: tip.moved([0, -0.12, 0.02]).at,
          x: [0, 0, 1],
          thickness: 0.008,
          color: STEEL,
          bone: arm.joints[1],
        },
      );
    }
  }
  // robot lower: tracked base behind counter
  box(0.2, 0.18, 0.18, ROBOTDARK, 0.05, 0.5, -0.16, { bone: torso });
  glow(box(0.16, 0.025, 0.01, AMBER, 0.05, 0.52, -0.065, { bone: torso }), 1.6);

  // ---- Stools ----
  for (const [sx, sz] of [
    [-0.18, 0.42],
    [0.28, 0.46],
  ] as Array<[number, number]>) {
    cyl(0.09, 0.09, 0.03, LANTERNRED, sx, 0.32, sz, 12);
    cyl(0.02, 0.02, 0.3, DARKMETAL, sx, 0.16, sz, 8);
    const legs: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const g = new THREE.CylinderGeometry(0.008, 0.008, 0.32, 6);
      g.translate(0, -0.16, 0);
      g.rotateZ(0.25 * Math.cos(a));
      g.rotateX(-0.25 * Math.sin(a));
      g.translate(sx, 0.31, sz);
      legs.push(g);
    }
    b.part(mergeGeometries(legs)!, STEEL, { bone: root, at: [0, 0, 0] });
    // bowl left on one stool
    if (sx < 0) {
      b.lathe(
        [
          [0.001, 0],
          [0.04, 0],
          [0.052, 0.03],
        ],
        { at: [sx, 0.335, sz], bone: root, segments: 12, color: BOWL },
      );
      b.rod([sx - 0.015, 0.365, sz - 0.01], [sx + 0.06, 0.42, sz + 0.03], 0.003, { bone: root, color: WOODDARK });
    }
  }

  // ---- Vending machine ----
  box(0.3, 0.72, 0.3, MAGENTA, -0.55, 0.42, -0.25); // body
  box(0.26, 0.66, 0.02, DARKMETAL, -0.55, 0.42, -0.1);
  box(0.26, 0.6, 0.02, DARKMETAL, -0.55, 0.42, -0.4); // back panel
  const vendFace = b.part(new THREE.PlaneGeometry(0.22, 0.5), "#ffffff", {
    bone: root,
    at: [-0.55, 0.44, -0.088],
    dir: [0, 0, 1],
    axis: "z",
    texture: vendTex,
  });
  glow(vendFace, 1.5);
  glow(box(0.26, 0.02, 0.02, CYAN, -0.55, 0.76, -0.1), 2.0);

  // ---- Overhead cables ----
  b.sweep(
    [
      [-0.33, 1.32, -0.18],
      [0.05, 1.2, -0.13],
      [0.43, 1.33, -0.18],
    ],
    0.012,
    { bone: root, color: "#0c0d11" },
  );
  b.sweep(
    [
      [-0.33, 1.28, -0.18],
      [0.1, 1.16, -0.14],
      [0.62, 1.04, -0.2],
    ],
    0.008,
    { bone: root, color: "#0c0d11" },
  );
  // hanging cable bundle + junction box
  box(0.1, 0.08, 0.06, DARKMETAL, 0.0, 1.14, -0.12);
  glow(box(0.03, 0.02, 0.01, AMBER, 0.0, 1.14, -0.085), 1.6);
  b.sweep(
    [
      [0.05, 1.2, -0.13],
      [0.03, 1.1, -0.12],
      [0.0, 1.17, -0.12],
    ],
    0.006,
    {
      bone: root,
      color: "#0c0d11",
    },
  );

  // ---- Grime: crates, barrel, bottles ----
  cyl(0.09, 0.09, 0.22, STEEL, -0.62, 0.19, 0.2, 12);
  cyl(0.07, 0.07, 0.16, WOODDARK, 0.58, 0.16, 0.25, 12);
  cyl(0.055, 0.055, 0.12, WOOD, 0.58, 0.3, 0.25, 12);
  const bottleCols = [CYAN, MAGENTA, AMBER];
  bottleCols.forEach((c, i) => {
    cyl(0.016, 0.016, 0.09, c, -0.28 + i * 0.045, 0.6, -0.06, 8);
    cyl(0.006, 0.006, 0.03, c, -0.28 + i * 0.045, 0.66, -0.06, 6);
  });
  // paper lantern string light across front posts
  b.sweep(
    [
      [-0.33, 1.08, 0.24],
      [-0.1, 1.02, 0.28],
      [0.15, 1.02, 0.28],
      [0.43, 1.08, 0.24],
    ],
    0.004,
    { bone: root, color: "#0c0d11" },
  );
  [-0.2, -0.03, 0.13, 0.3].forEach((lx, i) => {
    const wy = lx < -0.15 || lx > 0.25 ? 1.07 : 1.02;
    b.rod([lx, wy, 0.27], [lx, wy - 0.03, 0.27], 0.002, { bone: root, color: "#0c0d11" });
    glow(
      b.part(new THREE.SphereGeometry(0.016, 8, 6), i % 2 ? CYAN : MAGENTA, {
        bone: root,
        at: [lx, wy - 0.045, 0.27],
      }),
      2.0,
    );
  });

  return b.root;
}
