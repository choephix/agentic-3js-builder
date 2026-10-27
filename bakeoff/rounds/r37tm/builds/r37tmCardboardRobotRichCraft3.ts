import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  rng,
  paint,
  noise,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "cardboard-box-robot-kid",
  description: "A cheerful kid wearing a handmade cardboard-box robot costume.",
};

export default function build() {
  const b = createBuilder({ name: "cardboard-box-robot-kid", detail: 1 });

  const INK = "#241b16";
  const DARK = "#35251c";
  const CARDBOARD = paint((p, n) => {
    const grain = noise(p, 0.075, 11);
    const warm = 0.82 + 0.18 * Math.max(0, n.y);
    const r = (0.58 + grain * 0.14) * warm;
    const g = (0.32 + grain * 0.1) * warm;
    const bl = (0.13 + grain * 0.045) * warm;
    return [r, g, bl];
  });
  const LIGHT_CARD = paint((p, n) => {
    const grain = noise(p, 0.06, 21);
    return [
      0.78 + grain * 0.1 + Math.max(0, n.y) * 0.04,
      0.52 + grain * 0.08 + Math.max(0, n.y) * 0.03,
      0.27 + grain * 0.05,
    ];
  });
  const EDGE_CARD = "#9b5d2e";
  const TAPE = "#d99d50";
  const TAPE_LIGHT = "#f0c477";
  const RED = "#b83b2e";
  const BLUE = "#3f75a5";
  const GREEN = "#5f8d59";
  const CREAM = "#f0d29d";
  const RUBBER = "#25252a";
  const METAL = "#77736a";
  const YELLOW = "#e6b83f";

  const faceTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 180">
      <rect width="256" height="180" fill="#17191d"/>
      <rect x="7" y="7" width="242" height="166" rx="9" fill="#292d32" stroke="#d99d50" stroke-width="7"/>
      <path d="M24 28H232M24 151H232" stroke="#734421" stroke-width="4" opacity=".85"/>
      <rect x="30" y="45" width="74" height="67" rx="13" fill="#111316" stroke="#d9b16c" stroke-width="5"/>
      <rect x="152" y="45" width="74" height="67" rx="13" fill="#111316" stroke="#d9b16c" stroke-width="5"/>
      <ellipse cx="67" cy="79" rx="24" ry="28" fill="#55c9db"/>
      <ellipse cx="189" cy="79" rx="24" ry="28" fill="#55c9db"/>
      <ellipse cx="67" cy="83" rx="10" ry="18" fill="#15263b"/>
      <ellipse cx="189" cy="83" rx="10" ry="18" fill="#15263b"/>
      <circle cx="59" cy="68" r="6" fill="#fff4c9"/>
      <circle cx="181" cy="68" r="6" fill="#fff4c9"/>
      <path d="M83 129 Q128 155 173 129" fill="none" stroke="#e7c477" stroke-width="7" stroke-linecap="round"/>
      <path d="M103 129 Q128 139 153 129" fill="none" stroke="#b83b2e" stroke-width="4"/>
      <circle cx="22" cy="22" r="5" fill="#e6b83f"/>
      <circle cx="234" cy="22" r="5" fill="#e6b83f"/>
      <text x="128" y="25" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#f0d29d">ROBO-KID 3000</text>
    </svg>`,
    { size: 512 },
  );

  const warningTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 96">
      <rect width="128" height="96" rx="7" fill="#e6b83f" stroke="#241b16" stroke-width="7"/>
      <path d="M64 13 L113 80 H15 Z" fill="#241b16"/>
      <path d="M64 30 L64 57" stroke="#e6b83f" stroke-width="8" stroke-linecap="round"/>
      <circle cx="64" cy="68" r="5" fill="#e6b83f"/>
      <text x="64" y="92" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold">CAUTION</text>
    </svg>`,
    { size: 256 },
  );

  const boltTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="28" fill="#77736a" stroke="#241b16" stroke-width="5"/>
      <path d="M37 8L21 36H31L27 57L45 28H34Z" fill="#f0d29d"/>
    </svg>`,
    { size: 128 },
  );

  // ---------------- Skeleton first ----------------

  const hips = b.joint("hips", {
    at: [0, 0.92, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.9, 0],
      [0, 1.2, 0],
      [0, 1.48, 0],
      [0, 1.67, 0],
    ]),
    {
      parent: hips,
      names: ["pelvis", "torso", "chest", "neck"],
      role: "spine",
    },
  );

  const head = b.joint("head", {
    parent: spine.tip,
    at: [0, 1.88, 0.035],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.71, 0.15],
    dir: [0, 0.08, 1],
    role: "jaw",
    group: "head",
  });

  const leftLeg = b.chain(
    "legL",
    polyline([
      [0.2, 0.94, 0],
      [0.22, 0.57, 0.045],
      [0.2, 0.2, 0.08],
      [0.2, 0.1, 0.13],
    ]),
    {
      parent: hips,
      names: ["hipL", "kneeL", "ankleL", "footL"],
      role: "leg",
      contact: [0.2, 0, 0.16],
    },
  );

  const rightLeg = b.chain(
    "legR",
    polyline([
      [-0.2, 0.94, 0],
      [-0.22, 0.57, 0.045],
      [-0.2, 0.2, 0.08],
      [-0.2, 0.1, 0.13],
    ]),
    {
      parent: hips,
      names: ["hipR", "kneeR", "ankleR", "footR"],
      role: "leg",
      contact: [-0.2, 0, 0.16],
    },
  );

  const leftArm = b.chain(
    "armL",
    polyline([
      [0.39, 1.5, 0],
      [0.63, 1.3, 0.015],
      [0.75, 1.03, 0.05],
      [0.76, 0.86, 0.08],
    ]),
    {
      parent: spine.joints[2],
      names: ["shoulderL", "elbowL", "wristL", "handL"],
      role: "arm",
    },
  );

  const rightArm = b.chain(
    "armR",
    polyline([
      [-0.39, 1.5, 0],
      [-0.63, 1.3, 0.015],
      [-0.75, 1.03, 0.05],
      [-0.76, 0.86, 0.08],
    ]),
    {
      parent: spine.joints[2],
      names: ["shoulderR", "elbowR", "wristR", "handR"],
      role: "arm",
    },
  );

  const antenna = b.chain(
    "antenna",
    polyline([
      [0, 2.2, 0],
      [0, 2.43, 0],
      [0, 2.6, 0],
    ]),
    {
      parent: head,
      names: ["antennaBase", "antennaStem", "antennaTip"],
      role: "fan",
    },
  );

  // ---------------- Reusable cardboard helpers ----------------

  const box = (
    size: [number, number, number],
    at: THREE.Vector3 | [number, number, number],
    color: any = CARDBOARD,
    bone?: any,
    texture?: THREE.Texture,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      texture,
      flat: true,
    });

  const cylinder = (
    radius: number,
    height: number,
    at: THREE.Vector3 | [number, number, number],
    color: any,
    bone?: any,
    dir: [number, number, number] = [0, 1, 0],
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, 8), color, {
      at,
      bone,
      dir,
      flat: true,
    });

  const seam = (
    at: [number, number, number],
    size: [number, number, number],
    bone?: any,
    color: any = EDGE_CARD,
  ) => box(size, at, color, bone);

  const rivet = (at: [number, number, number], bone?: any, color: any = METAL) =>
    b.part(new THREE.SphereGeometry(0.022, 8, 5), color, {
      at,
      bone,
      flat: true,
    });

  const button = (
    at: [number, number, number],
    color: string,
    radius = 0.045,
    bone?: any,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, 0.018, 10), color, {
      at,
      bone,
      dir: [0, 0, 1],
      flat: true,
    });

  // ---------------- Body costume ----------------

  const torso = box([0.78, 0.82, 0.52], [0, 1.28, 0], CARDBOARD, spine.joints[1]);
  const chest = box([0.7, 0.56, 0.04], [0, 1.31, 0.285], LIGHT_CARD, spine.joints[1]);
  const chestLabel = b.part(new THREE.PlaneGeometry(0.25, 0.19), "#ffffff", {
    at: [0, 1.36, 0.309],
    bone: spine.joints[1],
    dir: [0, 0, 1],
    axis: "z",
    texture: warningTexture,
  });

  // Box folds and broad packing-tape corners.
  seam([0, 1.28, 0.27], [0.025, 0.78, 0.012], spine.joints[1], EDGE_CARD);
  seam([0, 0.88, 0.01], [0.76, 0.025, 0.54], spine.joints[0], TAPE);
  seam([0, 1.68, 0.01], [0.76, 0.025, 0.54], spine.joints[2], TAPE);
  seam([0.39, 1.28, 0], [0.018, 0.78, 0.45], spine.joints[1], TAPE);
  seam([-0.39, 1.28, 0], [0.018, 0.78, 0.45], spine.joints[1], TAPE);

  for (const x of [-0.29, 0.29]) {
    rivet([x, 1.62, 0.286], spine.joints[2]);
    rivet([x, 1.02, 0.286], spine.joints[0]);
  }

  // Control panel: chunky buttons, dial, and a tiny antenna icon.
  box([0.42, 0.24, 0.025], [0, 1.05, 0.318], EDGE_CARD, spine.joints[1]);
  button([-0.13, 1.08, 0.341], RED, 0.043, spine.joints[1]);
  button([0, 1.08, 0.341], BLUE, 0.043, spine.joints[1]);
  button([0.13, 1.08, 0.341], GREEN, 0.043, spine.joints[1]);
  cylinder(0.058, 0.022, [0, 1.17, 0.342], METAL, spine.joints[1], [0, 0, 1]);
  cylinder(0.017, 0.028, [0, 1.17, 0.36], RED, spine.joints[1], [0, 0, 1]);

  // Side flap tabs.
  box([0.16, 0.34, 0.035], [0.48, 1.36, -0.03], LIGHT_CARD, spine.joints[1]);
  box([0.16, 0.34, 0.035], [-0.48, 1.36, -0.03], LIGHT_CARD, spine.joints[1]);
  seam([0.48, 1.36, -0.055], [0.015, 0.32, 0.018], spine.joints[1], TAPE);
  seam([-0.48, 1.36, -0.055], [0.015, 0.32, 0.018], spine.joints[1], TAPE);

  // ---------------- Head box and face ----------------

  const helmet = box([0.62, 0.58, 0.54], [0, 1.99, 0.03], LIGHT_CARD, head);
  const facePanel = b.part(new THREE.PlaneGeometry(0.53, 0.37), "#ffffff", {
    at: [0, 1.99, 0.309],
    bone: head,
    dir: [0, 0, 1],
    axis: "z",
    texture: faceTexture,
  });

  // Helmet seams and taped corners.
  seam([0, 2.285, 0.03], [0.56, 0.025, 0.5], head, TAPE);
  seam([0, 1.705, 0.03], [0.56, 0.025, 0.5], head, TAPE);
  seam([0.31, 1.99, 0.03], [0.022, 0.53, 0.5], head, EDGE_CARD);
  seam([-0.31, 1.99, 0.03], [0.022, 0.53, 0.5], head, EDGE_CARD);

  // Big cheek bolts.
  rivet([0.285, 1.84, 0.31], head, METAL);
  rivet([-0.285, 1.84, 0.31], head, METAL);
  rivet([0.285, 2.14, 0.31], head, METAL);
  rivet([-0.285, 2.14, 0.31], head, METAL);

  // Side ear-like cardboard flaps.
  box([0.07, 0.26, 0.32], [0.35, 2.08, 0.03], CARDBOARD, head);
  box([0.07, 0.26, 0.32], [-0.35, 2.08, 0.03], CARDBOARD, head);
  seam([0.37, 2.08, 0.03], [0.012, 0.23, 0.27], head, TAPE);
  seam([-0.37, 2.08, 0.03], [0.012, 0.23, 0.27], head, TAPE);

  // Separate lower jaw, slightly dropped for an expressive robot grin.
  box([0.48, 0.16, 0.38], [0, 1.73, 0.14], CARDBOARD, jaw);
  box([0.38, 0.045, 0.025], [0, 1.76, 0.345], RED, jaw);
  seam([0, 1.65, 0.14], [0.44, 0.018, 0.34], jaw, TAPE);

  // ---------------- Antenna ----------------

  b.sweep(antenna, (t: number) => 0.025 - t * 0.008, {
    bone: antenna,
    color: EDGE_CARD,
    section: { ngon: 6 },
    caps: "round",
  });
  b.part(new THREE.SphereGeometry(0.075, 8, 6), RED, {
    bone: antenna.tip,
    at: [0, 2.64, 0],
    flat: true,
  });
  b.part(new THREE.SphereGeometry(0.038, 8, 5), TAPE_LIGHT, {
    bone: antenna.tip,
    at: [0, 2.64, 0.065],
    flat: true,
  });

  // ---------------- Arms ----------------

  b.sweep(leftArm, (t: number) => (t < 0.25 ? 0.13 : 0.1), {
    bone: leftArm,
    color: CARDBOARD,
    section: "box",
    skin: "rigid",
    caps: "round",
  });
  b.sweep(rightArm, (t: number) => (t < 0.25 ? 0.13 : 0.1), {
    bone: rightArm,
    color: CARDBOARD,
    section: "box",
    skin: "rigid",
    caps: "round",
  });

  for (const s of [1, -1]) {
    const arm = s > 0 ? leftArm : rightArm;
    box([0.18, 0.18, 0.04], [s * 0.67, 1.23, 0.1], TAPE, arm.joints[0]);
    seam([s * 0.72, 1.08, 0.08], [0.2, 0.025, 0.2], arm.joints[2], TAPE);
    b.part(new THREE.SphereGeometry(0.105, 8, 6), CREAM, {
      bone: arm.tip,
      at: [s * 0.76, 0.86, 0.1],
      flat: true,
    });
    // mitten seam and three little cardboard finger marks
    seam([s * 0.76, 0.86, 0.205], [0.12, 0.018, 0.012], arm.tip, EDGE_CARD);
    for (let i = -1; i <= 1; i++) {
      seam([s * (0.72 + i * 0.035), 0.82, 0.205], [0.012, 0.045, 0.01], arm.tip, EDGE_CARD);
    }
    rivet([s * 0.63, 1.31, 0.13], arm.joints[1], METAL);
    rivet([s * 0.63, 1.28, 0.13], arm.joints[1], METAL);
  }

  // ---------------- Legs and shoes ----------------

  b.sweep(leftLeg, (t: number) => (t < 0.35 ? 0.14 : 0.115), {
    bone: leftLeg,
    color: CARDBOARD,
    section: "box",
    skin: "rigid",
    caps: "round",
  });
  b.sweep(rightLeg, (t: number) => (t < 0.35 ? 0.14 : 0.115), {
    bone: rightLeg,
    color: CARDBOARD,
    section: "box",
    skin: "rigid",
    caps: "round",
  });

  for (const s of [1, -1]) {
    const leg = s > 0 ? leftLeg : rightLeg;
    box([0.22, 0.12, 0.25], [s * 0.2, 0.76, 0.02], TAPE, leg.joints[0]);
    seam([s * 0.2, 0.5, 0.13], [0.2, 0.02, 0.2], leg.joints[1], EDGE_CARD);
    seam([s * 0.2, 0.23, 0.13], [0.2, 0.025, 0.2], leg.joints[2], TAPE);

    // Oversized rubbery shoes touch the floor.
    box([0.29, 0.18, 0.38], [s * 0.2, 0.1, 0.12], RUBBER, leg.tip);
    box([0.25, 0.07, 0.07], [s * 0.2, 0.2, 0.285], EDGE_CARD, leg.tip);
    for (let i = -1; i <= 1; i++) {
      seam([s * (0.2 + i * 0.07), 0.035, 0.12], [0.025, 0.012, 0.3], leg.tip, METAL);
    }
  }

  // ---------------- Decorative cardboard craft details ----------------

  // Shoulder badges made from thin layered cardboard circles.
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.105, 0.105, 0.018, 10), TAPE_LIGHT, {
      at: [s * 0.42, 1.53, 0.08],
      bone: spine.joints[2],
      dir: [0, 0, 1],
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.022, 8), RED, {
      at: [s * 0.42, 1.53, 0.097],
      bone: spine.joints[2],
      dir: [0, 0, 1],
      flat: true,
    });
  }

  // A belt made of separate taped blocks.
  for (let i = -4; i <= 4; i++) {
    const x = i * 0.085;
    box([0.07, 0.09, 0.03], [x, 0.91, 0.275], i === 0 ? YELLOW : TAPE, spine.joints[0]);
  }
  box([0.13, 0.13, 0.035], [0, 0.91, 0.302], METAL, spine.joints[0]);
  b.part(new THREE.PlaneGeometry(0.08, 0.08), "#ffffff", {
    at: [0, 0.91, 0.324],
    bone: spine.joints[0],
    dir: [0, 0, 1],
    axis: "z",
    texture: boltTexture,
  });

  // Corrugated exposed top flaps: overlapping, visibly handmade.
  for (const s of [1, -1]) {
    box([0.28, 0.035, 0.46], [s * 0.16, 2.31, -0.01], LIGHT_CARD, head);
    box([0.2, 0.025, 0.38], [s * 0.12, 2.335, 0.02], TAPE_LIGHT, head);
  }

  // A few little punched holes and drawn seams around the costume.
  for (const y of [1.12, 1.23, 1.34, 1.45]) {
    rivet([0.395, y, 0.275], spine.joints[1], EDGE_CARD);
    rivet([-0.395, y, 0.275], spine.joints[1], EDGE_CARD);
  }

  // Loose-looking cardboard tail tab at the back, purely decorative.
  const tailTab = b.extrude(
    [
      [-0.11, 0],
      [0.11, 0],
      [0.08, 0.19],
      [0, 0.27, "sharp"],
      [-0.08, 0.19],
    ],
    {
      at: [0, 1.04, -0.29],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.004,
      color: LIGHT_CARD,
      bone: spine.joints[0],
      name: "rearCardboardTab",
    },
  );
  seam([0, 1.075, -0.315], [0.12, 0.014, 0.01], spine.joints[0], TAPE);

  // Tiny screws around the warning plate.
  for (const x of [-0.17, 0.17]) {
    for (const y of [0.96, 1.14]) rivet([x, y, 0.345], spine.joints[1], METAL);
  }

  return b.root;
}
