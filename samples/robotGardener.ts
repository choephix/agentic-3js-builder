import * as THREE from "three";
import type { Joint } from "../src/skeleton";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Robot Gardener",
  description:
    "A small round tin robot (about 0.6 m) with a glowing screen face, a hinged chin, a sprouting pot hat, a watering can, a trowel, rubber boots and three flower pots at its feet. Cute flat low-poly.",
};

// ---------------------------------------------------------------- palette
const TIN = "#cfe6ee";
const TIN_D = "#9dc0d0";
const PINK = "#ff9fbf";
const PINK_D = "#ff6f9c";
const YELLOW = "#ffd45e";
const YELLOW_D = "#f2a93c";
const MINT = "#9ae6c0";
const LAV = "#c9b3f2";
const CORAL = "#ff9b85";
const LEAF = "#7be08a";
const LEAF_D = "#4fbf78";
const STEM = "#5fcf7a";
const SOIL = "#7a5646";
const NAVY = "#2c2a52";
const CAVITY = "#3d2747";
const SILVER = "#eef5f8";
const WHITE = "#ffffff";

// ---------------------------------------------------------------- drawings
const FACE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">
  <rect x="0" y="0" width="200" height="100" rx="20" fill="${NAVY}"/>
  <rect x="5" y="5" width="190" height="90" rx="16" fill="none" stroke="#4b4896" stroke-width="3"/>
  <g fill="#2fbfbd"><ellipse cx="58" cy="46" rx="25" ry="30"/><ellipse cx="142" cy="46" rx="25" ry="30"/></g>
  <g fill="#7ff7e8"><ellipse cx="58" cy="41" rx="20" ry="24"/><ellipse cx="142" cy="41" rx="20" ry="24"/></g>
  <g fill="${WHITE}"><circle cx="49" cy="28" r="8"/><circle cx="133" cy="28" r="8"/>
  <circle cx="70" cy="52" r="4"/><circle cx="154" cy="52" r="4"/></g>
  <g fill="${NAVY}"><ellipse cx="58" cy="86" rx="34" ry="17"/><ellipse cx="142" cy="86" rx="34" ry="17"/></g>
  <g fill="#ff7aa8"><ellipse cx="24" cy="70" rx="11" ry="6"/><ellipse cx="176" cy="70" rx="11" ry="6"/></g>
  <g fill="${WHITE}" opacity="0.14"><polygon points="14,14 40,14 14,44"/></g>
  <g fill="#ffe27a"><polygon points="100,8 103,17 112,20 103,23 100,32 97,23 88,20 97,17"/></g>
</svg>`,
  { size: 512 },
);

const MOUTH = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 40">
  <path d="M0 0 H200 V24 Q200 40 184 40 H16 Q0 40 0 24 Z" fill="${NAVY}"/>
  <path d="M72 7 Q100 44 128 7 Z" fill="#ff7aa8"/>
  <path d="M90 25 Q100 15 110 25 Q100 34 90 25 Z" fill="#ff4f86"/>
  <rect x="82" y="7" width="36" height="5" fill="${WHITE}"/>
</svg>`,
  { size: 384 },
);

const BODY = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">
  <rect width="200" height="100" fill="${TIN}"/>
  <g fill="#e2f2f6"><rect x="0" y="8" width="200" height="3"/><rect x="0" y="86" width="200" height="4"/><rect x="0" y="94" width="200" height="3"/></g>
  <rect x="0" y="64" width="200" height="13" fill="${TIN_D}"/>
  <g fill="${WHITE}">${Array.from({ length: 20 }, (_, i) => `<circle cx="${i * 10 + 5}" cy="70.5" r="2.6"/>`).join("")}</g>
  <g stroke="${TIN_D}" stroke-width="2.5"><line x1="0" y1="0" x2="0" y2="64"/><line x1="25" y1="0" x2="25" y2="64"/><line x1="175" y1="0" x2="175" y2="64"/><line x1="0" y1="77" x2="0" y2="100"/><line x1="25" y1="77" x2="25" y2="100"/><line x1="175" y1="77" x2="175" y2="100"/></g>
  <rect x="68" y="16" width="64" height="42" rx="9" fill="#eaf8fb" stroke="${TIN_D}" stroke-width="2.5"/>
  <path d="M100 44 L82 29 Q77 19 87 18 Q95 17 100 24 Q105 17 113 18 Q123 19 118 29 Z" fill="${PINK_D}"/>
  <circle cx="89" cy="23" r="2.6" fill="${WHITE}"/>
  <g><circle cx="84" cy="51" r="3.6" fill="${PINK}"/><circle cx="100" cy="51" r="3.6" fill="${YELLOW}"/><circle cx="116" cy="51" r="3.6" fill="${MINT}"/></g>
  <g transform="translate(16 40)"><polygon points="0,-8 2.4,-2.4 8,0 2.4,2.4 0,8 -2.4,2.4 -8,0 -2.4,-2.4" fill="${YELLOW}"/></g>
  <g transform="translate(184 40)"><polygon points="0,-8 2.4,-2.4 8,0 2.4,2.4 0,8 -2.4,2.4 -8,0 -2.4,-2.4" fill="${PINK}"/></g>
</svg>`,
  { size: 512 },
);

const BACKPLATE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60">
  <rect width="100" height="60" rx="8" fill="${TIN_D}"/>
  <rect x="4" y="4" width="92" height="52" rx="6" fill="#b9d6e0"/>
  <g fill="#6f94a8">${[0, 1, 2, 3].map((i) => `<rect x="10" y="${10 + i * 7}" width="52" height="4" rx="2"/>`).join("")}</g>
  <rect x="68" y="10" width="22" height="12" rx="3" fill="${NAVY}"/>
  <g fill="${LEAF}"><rect x="71" y="13" width="4.5" height="6"/><rect x="77.5" y="13" width="4.5" height="6"/></g>
  <rect x="84" y="13" width="3.5" height="6" fill="#ff7a8a"/>
  <path d="M79 46 L70 38 Q67 32 72 31 Q77 30 79 35 Q81 30 86 31 Q91 32 88 38 Z" fill="${PINK_D}"/>
</svg>`,
  { size: 256 },
);

const BOOT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50">
  <rect width="100" height="50" fill="${YELLOW}"/>
  <g fill="${WHITE}"><circle cx="10" cy="14" r="5"/><circle cx="35" cy="34" r="5"/><circle cx="60" cy="14" r="5"/><circle cx="85" cy="34" r="5"/></g>
  <g fill="${PINK}"><circle cx="35" cy="12" r="3.5"/><circle cx="85" cy="12" r="3.5"/><circle cx="10" cy="36" r="3.5"/><circle cx="60" cy="36" r="3.5"/></g>
</svg>`,
  { size: 192 },
);

const CAN = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60">
  <rect width="100" height="60" fill="${PINK}"/>
  <rect x="0" y="0" width="100" height="8" fill="${PINK_D}"/><rect x="0" y="52" width="100" height="8" fill="${PINK_D}"/>
  <g fill="${WHITE}"><rect x="0" y="20" width="100" height="3"/><rect x="0" y="37" width="100" height="3"/></g>
  <g transform="translate(25 30)"><g fill="${WHITE}">${Array.from({ length: 6 }, (_, i) => `<ellipse cx="0" cy="-8" rx="4.6" ry="7" transform="rotate(${i * 60})"/>`).join("")}</g><circle r="4.6" fill="${YELLOW}"/></g>
  <g transform="translate(75 30)"><g fill="${WHITE}">${Array.from({ length: 6 }, (_, i) => `<ellipse cx="0" cy="-8" rx="4.6" ry="7" transform="rotate(${i * 60})"/>`).join("")}</g><circle r="4.6" fill="${YELLOW}"/></g>
</svg>`,
  { size: 256 },
);

const potTexture = (bg: string, fg: string, kind: "dots" | "stripes" | "hearts") =>
  svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><rect width="100" height="60" fill="${bg}"/>${
      kind === "dots"
        ? [0, 1, 2, 3, 4, 5, 6, 7]
            .map((i) => `<circle cx="${i * 12.5 + 6}" cy="${i % 2 ? 40 : 22}" r="5" fill="${fg}"/>`)
            .join("")
        : kind === "stripes"
          ? [0, 1, 2, 3].map((i) => `<rect x="0" y="${i * 15 + 3}" width="100" height="7" fill="${fg}"/>`).join("")
          : [0, 1, 2, 3].map((i) => `<path d="M${i * 25 + 12} 42 L${i * 25 + 3} 30 Q${i * 25 + 1} 21 ${i * 25 + 8} 21 Q${i * 25 + 12} 21 ${i * 25 + 12} 26 Q${i * 25 + 12} 21 ${i * 25 + 17} 21 Q${i * 25 + 24} 21 ${i * 25 + 22} 30 Z" fill="${fg}"/>`).join("")
    }</svg>`,
    { size: 192 },
  );

const POT_A = potTexture(CORAL, WHITE, "dots");
const POT_B = potTexture(LAV, "#f3eaff", "stripes");
const POT_C = potTexture(MINT, WHITE, "hearts");
const POT_HEAD = potTexture(YELLOW, CORAL, "stripes");

const petals = (n: number, rx: number, ry: number, off: number, fill: string, cy = 50) =>
  `<g fill="${fill}">${Array.from({ length: n }, (_, i) => `<ellipse cx="50" cy="${cy - off}" rx="${rx}" ry="${ry}" transform="rotate(${(i * 360) / n} 50 ${cy})"/>`).join("")}</g>`;

const DAISY = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  ${petals(9, 8, 19, 26, "#ffd6e7")}${petals(9, 7, 17, 25, "#fffdf4").replace(/rotate\((\d+)/g, (_m, a) => `rotate(${Number(a) + 20}`)}
  <circle cx="50" cy="50" r="13" fill="#ffc93c"/><circle cx="46" cy="46" r="4" fill="#ffe89a"/></svg>`,
  { size: 256 },
);

const SUN = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  ${petals(12, 7, 17, 30, "#ffb72e")}${petals(12, 7, 16, 29, YELLOW).replace(/rotate\((\d+)/g, (_m, a) => `rotate(${Number(a) + 15}`)}
  <circle cx="50" cy="50" r="21" fill="#8a5a44"/>
  <g fill="${NAVY}"><circle cx="43" cy="47" r="2.8"/><circle cx="57" cy="47" r="2.8"/></g>
  <g fill="${WHITE}"><circle cx="44" cy="46" r="1"/><circle cx="58" cy="46" r="1"/></g>
  <path d="M43 55 Q50 62 57 55" fill="none" stroke="${NAVY}" stroke-width="2.6" stroke-linecap="round"/>
  <g fill="#ff8fae"><circle cx="36" cy="54" r="3.2"/><circle cx="64" cy="54" r="3.2"/></g></svg>`,
  { size: 256 },
);

const TULIP = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M50 8 Q70 30 66 62 Q50 98 34 62 Q30 30 50 8 Z" fill="${PINK_D}"/>
  <path d="M24 16 Q46 30 50 64 Q50 96 34 90 Q14 72 16 40 Q16 24 24 16 Z" fill="#ff93b4"/>
  <path d="M76 16 Q54 30 50 64 Q50 96 66 90 Q86 72 84 40 Q84 24 76 16 Z" fill="#ff93b4"/>
  <ellipse cx="32" cy="46" rx="4" ry="9" fill="${WHITE}" opacity="0.6"/></svg>`,
  { size: 256 },
);

const LEAF_CARD = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 100">
  <path d="M20 99 Q0 60 20 2 Q40 60 20 99 Z" fill="${LEAF}"/>
  <path d="M20 99 Q0 60 20 2 Z" fill="${LEAF_D}"/>
  <line x1="20" y1="92" x2="20" y2="12" stroke="#d6f9da" stroke-width="3"/></svg>`,
  { size: 256 },
);

const DROP = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 60">
  <path d="M20 4 Q38 34 34 42 Q30 57 20 57 Q10 57 6 42 Q2 34 20 4 Z" fill="#8fd8ff"/>
  <ellipse cx="14" cy="42" rx="3.2" ry="6" fill="${WHITE}" opacity="0.85"/></svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "robotGardener" });
  type J = Joint;
  type V = [number, number, number];

  // --- skeleton ---
  const root = b.joint("root", { at: [0, 0.02, 0] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.15, 0],
      [0, 0.21, 0],
      [0, 0.285, 0],
    ],
    { parent: root, names: ["hips", "chest"], role: "spine" },
  );
  const hips = spine.joints[0];
  const chest = spine.joints[1];
  const HEAD_Y = 0.395;
  const head = b.joint("head", { parent: chest, at: [0, 0.285, 0], dir: [0, 1, 0], role: "head", group: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, HEAD_Y - 0.035, -0.085],
    dir: [0, 0, 1],
    role: "jaw",
    group: "head",
  });

  const keyJoint = b.joint("key", { parent: chest, at: [0, 0.2, -0.105], dir: [0, 0, -1], role: "hinge" });

  const arms = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    return b.chain(
      `arm${side}`,
      [
        [s * 0.1, 0.215, 0],
        [s * 0.175, 0.215, 0],
        [s * 0.25, 0.215, 0.005],
      ],
      { parent: chest, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm" },
    );
  });
  const legs = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    return b.chain(
      `leg${side}`,
      [
        [s * 0.06, 0.13, 0],
        [s * 0.06, 0.1, 0],
        [s * 0.06, 0.072, 0],
      ],
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg" },
    );
  });

  const POT_TOP = 0.505;
  const sprout = b.chain(
    "sprout",
    [
      [0, POT_TOP + 0.03, -0.01],
      [0.004, POT_TOP + 0.065, -0.008],
      [0, POT_TOP + 0.1, -0.01],
    ],
    { parent: head, names: ["sprout1", "sprout2", "sproutTip"], role: "tentacle" },
  );
  const leafJoints = [1, -1].map((s) =>
    b.joint(`leaf${s > 0 ? "L" : "R"}`, {
      parent: sprout.tip ?? sprout.joints[sprout.joints.length - 1],
      at: [0, POT_TOP + 0.1, -0.01],
      dir: [s * 0.8, 0.45, 0],
      role: "hinge",
    }),
  );

  const part = (geo: THREE.BufferGeometry, color: string, bone: J, at: V, extra: Record<string, unknown> = {}) =>
    b.part(geo, color, { bone, at, flat: true, ...extra });

  // --- body ---
  const bodyGeo = new THREE.SphereGeometry(1, 10, 7).rotateY(-Math.PI / 2).scale(0.115, 0.095, 0.105);
  b.part(bodyGeo, WHITE, { bone: hips, at: [0, 0.198, 0], flat: true, texture: BODY });
  part(new THREE.CylinderGeometry(0.056, 0.066, 0.04, 8), TIN_D, chest, [0, 0.293, 0]);
  part(new THREE.CylinderGeometry(0.06, 0.06, 0.012, 8), PINK, chest, [0, 0.31, 0]);

  // --- head: upper shell, screen, rivets ---
  const upper = [
    [-0.16, -0.035, "sharp"],
    [0.16, -0.035, "sharp"],
    [0.16, 0.07],
    [0.118, 0.11],
    [-0.118, 0.11],
    [-0.16, 0.07],
  ] as const;
  b.extrude(upper, {
    at: [0, HEAD_Y, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.2,
    bevel: 0.014,
    smoothing: 1,
    detail: 0.34,
    color: TIN,
    bone: head,
    name: "headShell",
  });
  glow(part(new THREE.PlaneGeometry(0.262, 0.131), WHITE, head, [0, HEAD_Y + 0.0375, 0.103], { dir: [0, 0, 1], axis: "z", texture: FACE }), 1);
  const rivets: THREE.BufferGeometry[] = [];
  for (const s of [1, -1])
    for (const y of [0.0, 0.075]) rivets.push(new THREE.SphereGeometry(0.008, 6, 4).translate(s * 0.142, HEAD_Y + y, 0.1));
  // merge by hand: same attributes, all indexed
  rivets.forEach((g) => part(g, YELLOW_D, head, [0, 0, 0]));
  // ears: speaker discs
  for (const s of [1, -1]) {
    part(new THREE.CylinderGeometry(0.05, 0.05, 0.028, 8), PINK, head, [s * 0.166, HEAD_Y + 0.005, -0.005], { dir: [s, 0, 0] });
    part(new THREE.CylinderGeometry(0.028, 0.028, 0.042, 8), YELLOW, head, [s * 0.168, HEAD_Y + 0.005, -0.005], { dir: [s, 0, 0] });
    part(new THREE.CylinderGeometry(0.01, 0.01, 0.05, 6), PINK_D, head, [s * 0.17, HEAD_Y + 0.005, -0.005], { dir: [s, 0, 0] });
  }
  // dark cavity under the shell
  part(new THREE.BoxGeometry(0.27, 0.004, 0.17), CAVITY, head, [0, HEAD_Y - 0.037, 0]);

  // --- jaw ---
  const chin = [
    [-0.155, -0.035, "sharp"],
    [0.155, -0.035, "sharp"],
    [0.155, -0.07],
    [0.115, -0.11],
    [-0.115, -0.11],
    [-0.155, -0.07],
  ] as const;
  b.extrude(chin, {
    at: [0, HEAD_Y, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.2,
    bevel: 0.014,
    smoothing: 1,
    detail: 0.34,
    color: TIN,
    bone: jaw,
    name: "chin",
  });
  glow(part(new THREE.PlaneGeometry(0.2, 0.04), WHITE, jaw, [0, HEAD_Y - 0.0735, 0.103], { dir: [0, 0, 1], axis: "z", texture: MOUTH }), 1);
  part(new THREE.BoxGeometry(0.27, 0.004, 0.17), CAVITY, jaw, [0, HEAD_Y - 0.033, 0]);
  part(new THREE.SphereGeometry(1, 6, 4).scale(0.05, 0.014, 0.06), "#ff7aa8", jaw, [0, HEAD_Y - 0.03, 0.03]);

  // --- pot hat + sprout ---
  part(new THREE.CylinderGeometry(0.05, 0.036, 0.05, 8), WHITE, head, [0, POT_TOP + 0.012, -0.01], { texture: POT_HEAD });
  part(new THREE.CylinderGeometry(0.056, 0.056, 0.014, 8), YELLOW_D, head, [0, POT_TOP + 0.04, -0.01]);
  part(new THREE.CylinderGeometry(0.049, 0.052, 0.008, 8), SOIL, head, [0, POT_TOP + 0.05, -0.01]);
  b.sweep(sprout, 0.0065, { color: STEM, sides: 5, smooth: false, caps: "round" });
  const leafOutline = [
    [0, 0],
    [0.022, 0.024],
    [0.055, 0.026],
    [0.085, 0, "sharp"],
    [0.055, -0.024],
    [0.022, -0.024],
  ] as const;
  leafJoints.forEach((lj, i) => {
    const s = i === 0 ? 1 : -1;
    b.extrude(leafOutline, {
      at: [0, POT_TOP + 0.1, -0.01],
      x: [s, 0.5, 0],
      y: [0, 0.6, 0.8],
      thickness: 0.007,
      bevel: 0.002,
      smoothing: 1,
      detail: 0.34,
      color: LEAF,
      bone: lj,
      name: `leaf${s > 0 ? "L" : "R"}`,
    });
  });
  part(new THREE.SphereGeometry(0.011, 6, 4), PINK_D, sprout.joints[sprout.joints.length - 1], [0, POT_TOP + 0.103, -0.01]);

  // --- arms, shoulders, hands ---
  const armBones = arms.map((a) => a.joints[a.joints.length - 1]);
  arms.forEach((arm, i) => {
    const s = i === 0 ? 1 : -1;
    b.sweep(arm, 0.025, { color: TIN, sides: 6, smooth: false });
    part(new THREE.SphereGeometry(0.031, 6, 4), PINK, arm.joints[0], [s * 0.1, 0.215, 0]);
    part(new THREE.CylinderGeometry(0.029, 0.029, 0.018, 6), PINK_D, armBones[i], [s * 0.227, 0.215, 0.003], { dir: [s, 0, 0] });
    part(new THREE.SphereGeometry(0.034, 7, 5), YELLOW, armBones[i], [s * 0.255, 0.215, 0.006]);
    part(new THREE.SphereGeometry(0.015, 5, 4), YELLOW, armBones[i], [s * 0.26, 0.24, 0.02]);
  });
  const wristL = armBones[0];
  const wristR = armBones[1];

  // --- watering can (left hand) ---
  const CX = 0.262;
  const canTop = 0.165;
  part(new THREE.CylinderGeometry(0.055, 0.06, 0.085, 8), WHITE, wristL, [CX, canTop - 0.0425, 0.006], { texture: CAN });
  part(new THREE.CylinderGeometry(0.058, 0.058, 0.012, 8), PINK_D, wristL, [CX, canTop + 0.004, 0.006]);
  part(new THREE.CylinderGeometry(0.044, 0.048, 0.008, 8), "#ffc2d6", wristL, [CX, canTop + 0.012, 0.006]);
  part(new THREE.TorusGeometry(0.05, 0.0075, 4, 8, Math.PI), PINK_D, wristL, [CX, canTop + 0.006, 0.006], { rotation: [0, 90, 0] });
  // rear grip
  part(new THREE.TorusGeometry(0.03, 0.007, 4, 8, Math.PI), PINK_D, wristL, [CX, canTop - 0.048, -0.05], { rotation: [0, 0, -90], scale: [0.8, 1, 1] });
  // spout and rose, angled in towards the pots
  const spoutA: V = [CX - 0.012, 0.105, 0.05];
  const spoutB: V = [CX - 0.048, 0.178, 0.13];
  b.capsule(spoutA, spoutB, [0.018, 0.009], { color: PINK_D, bone: wristL, sides: 6, smooth: false });
  const dir: V = [spoutB[0] - spoutA[0], spoutB[1] - spoutA[1], spoutB[2] - spoutA[2]];
  const rose = part(new THREE.CylinderGeometry(0.03, 0.019, 0.022, 8), YELLOW, wristL, [spoutB[0], spoutB[1], spoutB[2]], { dir });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    b.stick(new THREE.SphereGeometry(0.0055, 4, 3), NAVY, rose.moved([Math.cos(a) * 0.017, 0.011, Math.sin(a) * 0.017]), { embed: 0.5, bone: wristL });
  }
  b.stick(new THREE.SphereGeometry(0.0055, 4, 3), NAVY, rose.moved([0, 0.011, 0]), { embed: 0.5, bone: wristL });
  // a few water drops below the rose
  b.cards(
    [
      frame([spoutB[0] - 0.02, 0.136, spoutB[2] + 0.03], [0, 1, 0]),
      frame([spoutB[0] - 0.03, 0.105, spoutB[2] + 0.045], [0, 1, 0]),
      frame([spoutB[0] - 0.012, 0.085, spoutB[2] + 0.034], [0, 1, 0]),
    ],
    DROP,
    { size: [0.014, 0.021], flow: [0, 0, 1], cross: true, bone: wristL },
  );

  // --- trowel (right hand) ---
  const hand: V = [-0.262, 0.215, 0.008];
  const d = new THREE.Vector3(0, 1, -0.5).normalize();
  const at = (u: number): V => [hand[0], hand[1] + d.y * u, hand[2] + d.z * u];
  const tdir: V = [d.x, d.y, d.z];
  part(new THREE.CylinderGeometry(0.013, 0.013, 0.06, 6), YELLOW_D, wristR, at(0.008), { dir: tdir });
  part(new THREE.SphereGeometry(0.0165, 6, 4), YELLOW_D, wristR, at(0.04));
  part(new THREE.CylinderGeometry(0.016, 0.016, 0.014, 6), PINK, wristR, at(-0.028), { dir: tdir });
  b.extrude(
    [
      [-0.014, 0],
      [-0.036, -0.032],
      [0, -0.088, "sharp"],
      [0.036, -0.032],
      [0.014, 0],
    ],
    {
      at: at(-0.034),
      x: [1, 0, 0],
      y: tdir,
      thickness: 0.007,
      bevel: 0.002,
      smoothing: 1,
      detail: 0.34,
      color: SILVER,
      bone: wristR,
      name: "trowelBlade",
    },
  );

  // --- legs and boots ---
  legs.forEach((leg, i) => {
    const s = i === 0 ? 1 : -1;
    const ankle = leg.joints[leg.joints.length - 1];
    b.sweep(leg, 0.021, { color: TIN_D, sides: 6, smooth: false });
    part(new THREE.CylinderGeometry(0.028, 0.028, 0.01, 6), PINK, leg.joints[1], [s * 0.06, 0.098, 0]);
    part(new THREE.CylinderGeometry(0.04, 0.042, 0.066, 8), WHITE, ankle, [s * 0.06, 0.042, -0.004], { texture: BOOT });
    part(new THREE.CylinderGeometry(0.048, 0.048, 0.014, 8), PINK, ankle, [s * 0.06, 0.076, -0.004]);
    part(new THREE.SphereGeometry(1, 8, 5).scale(0.044, 0.034, 0.062), YELLOW, ankle, [s * 0.06, 0.034, 0.024]);
    part(new THREE.CylinderGeometry(1, 1, 0.012, 8).scale(0.047, 1, 0.07), YELLOW_D, ankle, [s * 0.06, 0.006, 0.02]);
    b.stick(new THREE.SphereGeometry(0.012, 5, 3), PINK, b.surface(ankle).nearest([s * 0.06, 0.04, 0.1]), { embed: 0.6, bone: ankle });
  });

  // --- three flower pots at the feet ---
  type Pot = { x: number; z: number; tex: typeof POT_A; rim: string; h: number; flower: typeof DAISY; size: number; attach: number; lean: number };
  const pots: Pot[] = [
    { x: -0.165, z: 0.08, tex: POT_A, rim: PINK_D, h: 0.15, flower: TULIP, size: 0.075, attach: 0.05, lean: 0.02 },
    { x: 0.0, z: 0.19, tex: POT_B, rim: "#a48be0", h: 0.135, flower: DAISY, size: 0.1, attach: 0.5, lean: 0 },
    { x: 0.155, z: 0.12, tex: POT_C, rim: "#5fcf9c", h: 0.16, flower: SUN, size: 0.105, attach: 0.5, lean: -0.02 },
  ];
  for (const p of pots) {
    part(new THREE.CylinderGeometry(0.05, 0.036, 0.06, 8), WHITE, root, [p.x, 0.03, p.z], { texture: p.tex });
    part(new THREE.CylinderGeometry(0.057, 0.057, 0.014, 8), p.rim, root, [p.x, 0.067, p.z]);
    part(new THREE.CylinderGeometry(0.05, 0.053, 0.008, 8), SOIL, root, [p.x, 0.076, p.z]);
    const top: V = [p.x + p.lean, p.h, p.z];
    b.sweep(
      [
        [p.x, 0.075, p.z],
        [p.x + p.lean * 0.4, (p.h + 0.075) / 2, p.z + 0.004],
        top,
      ],
      0.0045,
      { color: STEM, sides: 4, smooth: false, caps: "round", bone: root },
    );
    b.cards([frame([top[0], top[1] - p.attach * p.size, top[2]], [0, 1, 0])], p.flower, {
      size: p.size,
      flow: [0, 0, 1],
      cross: true,
      sink: 0,
      bone: root,
    });
    for (const s of [1, -1])
      b.cards([frame([p.x, 0.082, p.z], [s * 0.75, 0.65, 0.12])], LEAF_CARD, {
        size: [0.03, 0.068],
        flow: [0, 0, 1],
        bend: 0,
        bone: root,
      });
  }

  // --- back: vent plate on the head, wind-up key on the body ---
  part(new THREE.PlaneGeometry(0.19, 0.114), WHITE, head, [0, HEAD_Y + 0.0, -0.103], { dir: [0, 0, -1], axis: "z", texture: BACKPLATE });
  part(new THREE.CylinderGeometry(0.009, 0.009, 0.04, 6), YELLOW_D, keyJoint, [0, 0.2, -0.122], { dir: [0, 0, 1] });
  part(new THREE.CylinderGeometry(0.02, 0.02, 0.012, 8), PINK, keyJoint, [0, 0.2, -0.108], { dir: [0, 0, 1] });
  b.extrude(
    [
      [-0.006, -0.012],
      [-0.034, -0.026],
      [-0.052, -0.004],
      [-0.04, 0.026],
      [-0.006, 0.012],
      [0.006, 0.012],
      [0.04, 0.026],
      [0.052, -0.004],
      [0.034, -0.026],
      [0.006, -0.012],
    ],
    {
      at: [0, 0.2, -0.145],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.003,
      smoothing: 1,
      detail: 0.34,
      color: YELLOW,
      bone: keyJoint,
      name: "windUpKey",
    },
  );

  // neutral open-mouth rest pose
  b.pose(jaw, { axis: [1, 0, 0], deg: 5 });

  return b.root;
}
