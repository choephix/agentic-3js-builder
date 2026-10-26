import * as THREE from "three";
import {
  catmull,
  createBuilder,
  frame,
  grain,
  line,
  mottle,
  rng,
  stripes,
} from "../../../../src/index";
import { limb } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { cel, furEdge, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";
import { metal } from "../../../../kits/clockwork";

export const meta = {
  name: "Dwarf Blacksmith at an Anvil",
  description:
    "A chunky Warcraft-inspired dwarf blacksmith with a braided beard, leather apron, raised hammer, glowing forge, and rune-marked anvil.",
};

const SKIN = cel(
  mottle("#c9824b", "#a95835", { size: 0.11, contrast: 1.25, seed: 17 }),
  "#713622",
);
const SKIN_LIGHT = cel("#e09a5b", "#a94f2f");
const BEARD = cel(
  furEdge(
    mottle("#d97535", "#a84325", { size: 0.075, seed: 23 }),
    "#71301e",
    {
      level: -0.03,
      teeth: 0.1,
      period: 0.032,
      along: [1, 0, 0],
      ink: "#4a1e1c",
      inkWidth: 0.018,
    },
  ),
  "#6b271b",
);
const BEARD_DARK = cel("#8f3821", "#4e1d1b");
const TUNIC = cel(
  stripes("#693548", "#49283d", {
    size: 0.16,
    axis: "z",
    width: 0.22,
    wobble: 0.12,
    seed: 31,
  }),
  "#302034",
);
const LEATHER = cel(
  grain("#713d28", "#382018", { size: 0.045, axis: "y", seed: 39 }),
  "#28171a",
);
const DARK_LEATHER = cel("#3f2724", "#1e1820");
const APRON = cel(
  grain("#9a5c32", "#60311f", { size: 0.055, axis: "y", seed: 44 }),
  "#44231d",
);
const IRON = metal("iron", {
  tarnish: 0.5,
  verdigris: 0.08,
  polish: 0.25,
  size: 0.11,
  seed: 51,
});
const STEEL = metal("steel", {
  tarnish: 0.2,
  polish: 0.55,
  size: 0.08,
  seed: 52,
});
const BRASS = metal("brass", {
  tarnish: 0.32,
  verdigris: 0.12,
  polish: 0.45,
  size: 0.06,
  seed: 53,
});
const COPPER = metal("copper", {
  tarnish: 0.2,
  verdigris: 0.18,
  polish: 0.32,
  size: 0.055,
  seed: 54,
});
const WOOD = grain("#8b542d", "#422619", {
  size: 0.07,
  axis: [0, 1, 0],
  seed: 61,
});
const COAL = cel("#38232c", "#120f18");
const HOT_METAL = "#ff9b32";
const HOT_CORE = "#fff0a0";
const GOLD = "#f2c35b";
const EYE_WHITE = "#fff4d3";

const EYE_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 104">
    <defs>
      <linearGradient id="iris" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#56321d"/>
        <stop offset="0.42" stop-color="#b96825"/>
        <stop offset="1" stop-color="#ffd66c"/>
      </linearGradient>
    </defs>
    <path d="M7 51 Q35 8 73 42 Q77 51 73 61 Q38 96 7 61 Q3 55 7 51Z" fill="#271622"/>
    <path d="M14 51 Q37 17 67 43 Q70 51 67 59 Q38 84 14 59 Q11 55 14 51Z" fill="url(#iris)"/>
    <ellipse cx="42" cy="54" rx="10" ry="24" fill="#241622"/>
    <path d="M14 43 Q39 16 68 43" fill="none" stroke="#f6cf70" stroke-width="4"/>
    <path d="M18 64 Q39 82 64 61" fill="none" stroke="#8e421d" stroke-width="4"/>
    <ellipse cx="29" cy="35" rx="10" ry="12" fill="#ffffff"/>
    <circle cx="53" cy="70" r="4" fill="#fff8d7"/>
    <path d="M8 43 Q25 10 61 18" fill="none" stroke="#241522" stroke-width="7" stroke-linecap="round"/>
    <path d="M13 72 Q8 78 5 84 M20 75 Q17 83 14 89" fill="none" stroke="#241522" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const BEARD_TUFT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
    <path d="M16 1 C10 13 4 19 7 28 C9 34 4 42 2 48 C8 47 12 44 16 38 C20 45 24 48 30 49 C27 42 23 34 25 28 C28 19 22 13 16 1Z" fill="#bf5d2e"/>
    <path d="M16 5 C14 19 13 31 16 56 C19 31 18 19 16 5Z" fill="#f09a47"/>
    <path d="M8 43 Q14 39 16 31 Q18 40 25 44" fill="none" stroke="#67231c" stroke-width="2"/>
  </svg>`,
  { size: 128 },
);

const HAIR_TUFT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48">
    <path d="M16 0 C14 12 4 15 5 26 C6 33 2 39 0 44 C8 43 13 39 16 32 C19 39 24 43 32 44 C29 37 26 31 27 25 C28 15 18 11 16 0Z" fill="#3b1c1b"/>
    <path d="M16 5 C15 18 15 27 16 39 C19 28 20 15 16 5Z" fill="#7d3421"/>
  </svg>`,
  { size: 128 },
);

const BUCKLE_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <rect x="5" y="5" width="118" height="118" rx="20" fill="#f4c95d" stroke="#2d1c20" stroke-width="8"/>
    <path d="M64 20 L74 48 L104 48 L80 66 L89 96 L64 78 L39 96 L48 66 L24 48 L54 48Z"
      fill="#6f2a22" stroke="#2d1c20" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="64" cy="62" r="8" fill="#ffd878"/>
  </svg>`,
  { size: 192 },
);

const APRON_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <path d="M16 110 L25 18 L103 18 L112 110Z" fill="#d89851" stroke="#44231d" stroke-width="7"/>
    <path d="M30 31 H98 M28 49 H100 M26 67 H102 M24 85 H104" stroke="#7a3c26" stroke-width="4"/>
    <path d="M39 18 Q64 40 89 18" fill="none" stroke="#f1bd6c" stroke-width="4"/>
    <path d="M64 40 L71 57 L89 58 L75 68 L80 85 L64 75 L48 85 L53 68 L39 58 L57 57Z"
      fill="#512329" stroke="#3a1c20" stroke-width="3"/>
  </svg>`,
  { size: 192 },
);

const HAMMER_RUNE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64">
    <rect width="128" height="64" rx="12" fill="#8a2e22" stroke="#231822" stroke-width="6"/>
    <path d="M16 44 L34 18 L48 44 M26 31 H42 M61 17 V47 M61 17 L82 31 L61 32 M94 17 V47 M94 17 L113 47 M113 17 L94 47"
      fill="none" stroke="#ffd26d" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  { size: 192 },
);

const ANVIL_MARK = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <circle cx="64" cy="64" r="57" fill="#d9a84f" stroke="#291a1e" stroke-width="6"/>
    <path d="M64 17 L72 50 L106 50 L79 69 L89 103 L64 82 L39 103 L49 69 L22 50 L56 50Z"
      fill="#54252a" stroke="#2b1820" stroke-width="5"/>
    <path d="M64 30 V93 M30 64 H98" stroke="#f5d46e" stroke-width="4"/>
  </svg>`,
  { size: 192 },
);

const COAL_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <rect width="96" height="96" rx="18" fill="#241826"/>
    <circle cx="24" cy="30" r="13" fill="#ff6a27"/>
    <circle cx="52" cy="22" r="15" fill="#ffb43c"/>
    <circle cx="75" cy="42" r="13" fill="#e94b24"/>
    <circle cx="34" cy="64" r="16" fill="#d63a25"/>
    <circle cx="70" cy="73" r="16" fill="#ff8d29"/>
    <path d="M16 30 Q24 20 31 30 M44 23 Q53 10 61 23 M62 43 Q74 30 85 43 M22 66 Q34 48 46 65 M58 76 Q70 57 82 74"
      fill="none" stroke="#ffe28a" stroke-width="4"/>
  </svg>`,
  { size: 160 },
);

export default function build() {
  const b = createBuilder({
    name: "dwarf-blacksmith",
    detail: 1,
    paintSize: 2048,
  });

  const hips = b.joint("hips", {
    at: [0, 1.0, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    [
      [0, 1.0, 0],
      [0, 1.18, 0],
      [0, 1.38, 0],
      [0, 1.5, 0],
    ],
    {
      parent: hips,
      names: ["spineBase", "spineMid", "chest", "shoulderHub"],
      role: "spine",
    },
  );
  const chest = spine.joints[spine.joints.length - 1];

  const neck = b.chain(
    "neck",
    [
      [0, 1.48, 0],
      [0, 1.57, 0],
      [0, 1.64, 0.02],
    ],
    {
      parent: chest,
      names: ["neck", "neckTop", "neckTip"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip ?? neck.joints[neck.joints.length - 1],
    at: [0, 1.65, 0.035],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.55, 0.16],
    dir: [0, -0.16, 0.38],
    role: "jaw",
    group: "head",
  });

  const armData: Array<{
    side: number;
    chain: ReturnType<typeof b.chain>;
    hand: THREE.Vector3;
  }> = [];

  for (const side of [1, -1]) {
    const shoulder: [number, number, number] = [side * 0.31, 1.39, 0.01];
    const handTarget: [number, number, number] =
      side === -1 ? [-0.47, 1.16, 0.38] : [0.47, 1.02, 0.46];

    const points = limb(
      shoulder,
      handTarget,
      [0.25, 0.27, 0.18],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );

    const arm = b.chain(`arm${side > 0 ? "L" : "R"}`, points, {
      parent: chest,
      names:
        side > 0
          ? ["shoulderL", "elbowL", "wristL", "handL"]
          : ["shoulderR", "elbowR", "wristR", "handR"],
      role: "arm",
      contact: handTarget,
    });

    armData.push({
      side,
      chain: arm,
      hand: new THREE.Vector3(...handTarget),
    });
  }

  const legData: Array<{
    side: number;
    chain: ReturnType<typeof b.chain>;
    foot: [number, number, number];
  }> = [];

  for (const side of [1, -1]) {
    const hipPoint: [number, number, number] = [side * 0.17, 0.98, 0];
    const foot: [number, number, number] = [side * 0.18, 0.17, 0.13];

    const points = limb(
      hipPoint,
      foot,
      [0.36, 0.31, 0.22],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );

    const leg = b.chain(`leg${side > 0 ? "L" : "R"}`, points, {
      parent: hips,
      names:
        side > 0
          ? ["hipL", "kneeL", "ankleL", "footL"]
          : ["hipR", "kneeR", "ankleR", "footR"],
      role: "leg",
      contact: [foot[0], 0, foot[2]],
    });

    legData.push({ side, chain: leg, foot });
  }

  const box = (
    size: readonly [number, number, number],
    color: any,
    at: readonly [number, number, number],
    options: any = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      flat: true,
      ...options,
    });

  const sphere = (
    radius: number,
    color: any,
    at: readonly [number, number, number],
    scale: readonly [number, number, number] = [1, 1, 1],
    options: any = {},
  ) =>
    b.part(new THREE.SphereGeometry(radius, 10, 7), color, {
      at,
      scale,
      flat: true,
      ...options,
    });

  const cylinder = (
    radius: number,
    height: number,
    color: any,
    at: readonly [number, number, number],
    options: any = {},
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, 8), color, {
      at,
      flat: true,
      ...options,
    });

  const body = b.sweep(
    spine,
    (t): readonly [number, number] => [0.27 - 0.035 * t, 0.23 - 0.018 * t],
    {
      color: TUNIC,
      section: { ngon: 8 },
      sides: 8,
      shift: (): readonly [number, number] => [0, -0.012],
      caps: "round",
      name: "barrel",
      group: "body",
    },
  );

  const belly = b.sweep(
    spine.path.slice(0.05, 0.8),
    (t): readonly [number, number] => [0.19 - 0.025 * t, 0.18],
    {
      color: SKIN,
      bone: [hips, ...spine.joints],
      section: { ngon: 8 },
      shift: [0, -0.12],
      caps: "round",
      name: "belly",
      group: "body",
    },
  );

  for (const armInfo of armData) {
    const side = armInfo.side;
    const arm = armInfo.chain;
    const upper = arm.path.slice(0, 0.47);
    const lower = arm.path.slice(0.42, 1);

    b.sweep(upper, [0.095, 0.075], {
      bone: arm,
      color: TUNIC,
      section: { ngon: 8 },
      caps: "round",
      name: `sleeve${side > 0 ? "L" : "R"}`,
      group: "arms",
    });

    b.sweep(lower, [0.07, 0.058], {
      bone: arm,
      color: SKIN,
      section: { ngon: 7 },
      caps: "round",
      name: `forearm${side > 0 ? "L" : "R"}`,
      group: "arms",
    });

    const shoulder = arm.at(0).at;
    const elbow = arm.at(0.46).at;
    const wrist = arm.at(1).at;

    sphere(
      0.12,
      TUNIC,
      [shoulder.x, shoulder.y, shoulder.z],
      [1.15, 0.8, 1.05],
      { bone: arm.joints[0], group: "arms", name: `shoulderPad${side > 0 ? "L" : "R"}` },
    );

    sphere(
      0.084,
      SKIN,
      [wrist.x, wrist.y, wrist.z],
      [1.15, 0.92, 1.12],
      { bone: arm.tip ?? arm.joints[arm.joints.length - 1], group: "hands" },
    );

    sphere(
      0.103,
      BRASS,
      [elbow.x, elbow.y, elbow.z],
      [1.08, 0.72, 1.08],
      { bone: arm.joints[Math.min(1, arm.joints.length - 1)], group: "armor" },
    );

    const cuff = b.ring(arm.at(0.53), {
      count: 10,
      radius: 0.067,
      fromDeg: 0,
      toDeg: 360,
      group: "arms",
      name: `cuff${side > 0 ? "L" : "R"}`,
      role: "fan",
    });
    b.sweep(catmull(cuff.items, { closed: true }), 0.016, {
      color: BRASS,
      bone: arm.joints[Math.min(1, arm.joints.length - 1)],
      caps: "none",
      name: `cuffBand${side > 0 ? "L" : "R"}`,
    });
  }

  for (const legInfo of legData) {
    const side = legInfo.side;
    const leg = legInfo.chain;
    b.sweep(leg, (t): readonly [number, number] => [0.105 - 0.03 * t, 0.095 - 0.025 * t], {
      color: DARK_LEATHER,
      bone: leg,
      section: { ngon: 7 },
      caps: "round",
      name: `trouser${side > 0 ? "L" : "R"}`,
      group: "legs",
    });

    const knee = leg.at(0.47).at;
    sphere(
      0.105,
      BRASS,
      [knee.x, knee.y, knee.z + 0.015],
      [1.05, 0.72, 1.2],
      {
        bone: leg.joints[Math.min(1, leg.joints.length - 1)],
        group: "armor",
        name: `kneeGuard${side > 0 ? "L" : "R"}`,
      },
    );

    const foot = legInfo.foot;
    box(
      [0.18, 0.18, 0.31],
      LEATHER,
      [foot[0], 0.095, 0.16],
      {
        bone: leg.tip ?? leg.joints[leg.joints.length - 1],
        group: "boots",
        name: `boot${side > 0 ? "L" : "R"}`,
      },
    );

    box(
      [0.19, 0.045, 0.055],
      BRASS,
      [foot[0], 0.145, 0.235],
      {
        bone: leg.tip ?? leg.joints[leg.joints.length - 1],
        group: "boots",
        name: `bootStrap${side > 0 ? "L" : "R"}`,
      },
    );

    sphere(
      0.028,
      BRASS,
      [foot[0] + side * 0.065, 0.145, 0.238],
      [1, 0.7, 1],
      {
        bone: leg.tip ?? leg.joints[leg.joints.length - 1],
        group: "boots",
      },
    );
  }

  const belt = b.ring(hips, {
    count: 14,
    radius: 0.245,
    fromDeg: 0,
    toDeg: 360,
    group: "clothing",
    name: "belt",
    role: "fan",
  });
  b.sweep(catmull(belt.items, { closed: true }), 0.035, {
    color: LEATHER,
    bone: hips,
    caps: "none",
    name: "beltStrap",
  });

  for (let i = 0; i < belt.items.length; i += 2) {
    const p = belt.items[i];
    b.stick(new THREE.SphereGeometry(0.018, 7, 5), BRASS, p, {
      embed: 0.3,
      group: "belt",
      name: `beltStud${i}`,
    });
  }

  b.part(new THREE.BoxGeometry(0.085, 0.16, 0.035), GOLD, {
    at: [0, 1.115, 0.285],
    bone: hips,
    flat: true,
    group: "belt",
    name: "beltBuckle",
    texture: BUCKLE_TEXTURE,
  });

  const apron = b.extrude(
    [
      [-0.19, 0],
      [0.19, 0],
      [0.18, 0.25],
      [0.13, 0.48],
      [-0.13, 0.48],
      [-0.18, 0.25],
    ],
    {
      at: [0, 1.08, 0.235],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.012,
      smoothing: 1,
      color: APRON,
      bone: chest,
      group: "apron",
      name: "heavyApron",
    },
  );

  b.part(new THREE.PlaneGeometry(0.16, 0.22), "#ffffff", {
    at: [0, 1.34, 0.259],
    dir: [0, 0, 1],
    axis: "z",
    texture: APRON_TEXTURE,
    bone: chest,
    group: "apron",
    name: "apronRune",
  });

  for (const side of [1, -1]) {
    b.rod(
      [side * 0.22, 1.45, 0.16],
      [side * 0.135, 1.33, 0.255],
      0.018,
      BRASS,
      {
        bone: chest,
        group: "apron",
        name: `apronStrap${side > 0 ? "L" : "R"}`,
      },
    );
    b.rod(
      [side * 0.16, 1.32, 0.255],
      [side * 0.14, 1.08, 0.255],
      0.012,
      DARK_LEATHER,
      {
        bone: chest,
        group: "apron",
      },
    );
  }

  const skull = sphere(
    0.255,
    SKIN,
    [0, 1.665, 0.055],
    [1.0, 1.04, 0.94],
    {
      bone: head,
      group: "head",
      name: "broadSkull",
    },
  );

  const skullSurface = b.surface(skull);

  for (const side of [1, -1]) {
    b.decal(skullSurface, EYE_TEXTURE, {
      at: [side * 0.098, 1.69, 0.285],
      dir: [0, 0, 1],
      up: [0, 1, 0],
      size: [0.105, 0.137],
      lift: 0.003,
      mirror: side > 0,
      bone: head,
      group: "face",
      name: `eye${side > 0 ? "L" : "R"}`,
    });

    b.rod(
      [side * 0.14, 1.785, 0.245],
      [side * 0.045, 1.82, 0.265],
      0.018,
      BEARD_DARK,
      {
        bone: head,
        group: "face",
        name: `brow${side > 0 ? "L" : "R"}`,
      },
    );

    sphere(
      0.088,
      SKIN,
      [side * 0.25, 1.67, 0.035],
      [1.0, 1.12, 0.62],
      {
        bone: head,
        group: "face",
        name: `ear${side > 0 ? "L" : "R"}`,
      },
    );

    sphere(
      0.047,
      "#e88b6a",
      [side * 0.267, 1.67, 0.085],
      [1.0, 1.2, 0.5],
      {
        bone: head,
        group: "face",
        name: `earInner${side > 0 ? "L" : "R"}`,
      },
    );

    b.spike(
      [side * 0.262, 1.71, 0.075],
      [side * 0.08, 0.03, 0.015],
      0.09,
      0.018,
      BEARD_DARK,
      {
        bone: head,
        group: "face",
        caps: "point",
        name: `earRidge${side > 0 ? "L" : "R"}`,
      },
    );
  }

  sphere(0.09, SKIN_LIGHT, [0, 1.585, 0.29], [1.25, 0.85, 1.05], {
    bone: head,
    group: "face",
    name: "bulbousNose",
  });

  b.rod([-0.105, 1.535, 0.315], [0.105, 1.535, 0.315], 0.018, INK, {
    bone: head,
    group: "face",
    name: "mouthLine",
  });

  b.part(
    new THREE.SphereGeometry(0.17, 12, 8),
    SKIN,
    {
      bone: jaw,
      at: [0, 1.525, 0.235],
      scale: [1.0, 0.54, 0.75],
      flat: true,
      group: "jaw",
      name: "lowerJaw",
    },
  );

  b.rod([-0.105, 1.52, 0.33], [0.105, 1.52, 0.33], 0.012, BEARD_DARK, {
    bone: jaw,
    group: "jaw",
    name: "lowerLip",
  });

  const cap = b.lathe(
    [
      [0, 0],
      [0.2, 0],
      [0.235, 0.025],
      [0.22, 0.07],
      [0.18, 0.115],
      [0.125, 0.155],
      [0, 0.18],
    ],
    {
      at: [0, 1.755, 0.02],
      axis: [0, 1, 0],
      segments: 12,
      smoothing: 1,
      color: DARK_LEATHER,
      bone: head,
      group: "helmet",
      name: "leatherCap",
    },
  );

  b.part(
    new THREE.TorusGeometry(0.215, 0.026, 6, 14),
    LEATHER,
    {
      at: [0, 1.77, 0.025],
      rotation: [Math.PI / 2, 0, 0],
      bone: head,
      flat: true,
      group: "helmet",
      name: "capBrim",
    },
  );

  b.part(new THREE.PlaneGeometry(0.105, 0.12), "#ffffff", {
    at: [0, 1.775, 0.238],
    dir: [0, 0, 1],
    axis: "z",
    texture: HAMMER_RUNE,
    bone: head,
    group: "helmet",
    name: "capBadge",
  });

  const beard = b.sweep(
    catmull([
      [0, 1.525, 0.26],
      [0, 1.43, 0.255],
      [0, 1.28, 0.215],
      [0, 1.1, 0.17],
      [0, 0.98, 0.12],
    ]),
    (t) => [0.19 - 0.15 * t, 0.15 - 0.115 * t],
    {
      color: BEARD,
      bone: jaw,
      section: { ngon: 8 },
      caps: { start: "round", end: "point" },
      name: "greatBeard",
      group: "beard",
    },
  );

  for (const side of [1, -1]) {
    const cheek = b.sweep(
      catmull([
        [side * 0.13, 1.54, 0.22],
        [side * 0.2, 1.47, 0.18],
        [side * 0.235, 1.34, 0.115],
        [side * 0.14, 1.23, 0.12],
      ]),
      [0.095, 0.025],
      {
        color: BEARD,
        bone: head,
        section: { ngon: 7 },
        caps: { start: "round", end: "point" },
        name: `cheekRuff${side > 0 ? "L" : "R"}`,
        group: "beard",
      },
    );

    const braid = b.sweep(
      catmull([
        [side * 0.14, 1.39, 0.16],
        [side * 0.2, 1.27, 0.13],
        [side * 0.17, 1.1, 0.095],
        [side * 0.095, 0.91, 0.065],
      ]),
      [0.043, 0.024],
      {
        color: BEARD_DARK,
        bone: head,
        bands: [
          [0.24, BEARD],
          [0.49, BEARD_DARK],
          [0.74, BEARD],
          [1, BEARD_DARK],
        ],
        section: { ngon: 7 },
        caps: { start: "round", end: "point" },
        name: `braid${side > 0 ? "L" : "R"}`,
        group: "beard",
      },
    );

    b.along(braid, 5, (at) => {
      b.stick(new THREE.SphereGeometry(0.031, 7, 5), BRASS, at, {
        embed: 0.22,
        group: "beard",
        name: `braidBead${side > 0 ? "L" : "R"}${at.t.toFixed(2)}`,
      });
    });
  }

  const beardHits = b.surface(beard).scatter(18, {
    rng: rng(71),
    minDist: 0.035,
    filter: (hit) => hit.n.y > -0.85 && hit.n.z > -0.7,
  });
  b.cards(beardHits, BEARD_TUFT, {
    size: [0.035, 0.085],
    lean: 48,
    flow: [0, -0.25, -1],
    bend: 22,
    vary: 0.28,
    spin: 18,
    rng: rng(72),
    color: "#ffffff",
    group: "beard",
  });

  const hairHits = b.surface(skull).scatter(10, {
    rng: rng(73),
    minDist: 0.055,
    filter: (hit) => hit.n.y > 0.15 && hit.n.z < 0.5,
  });
  b.cards(hairHits, HAIR_TUFT, {
    size: [0.045, 0.085],
    lean: 35,
    flow: [0, -0.25, -1],
    bend: 20,
    vary: 0.25,
    rng: rng(74),
    color: "#ffffff",
    group: "hair",
  });

  function makeDigits(
    side: number,
    arm: ReturnType<typeof b.chain>,
    hand: THREE.Vector3,
  ) {
    const names = ["index", "middle", "ring"];
    const spreads = [-0.045, 0, 0.045];

    for (let i = 0; i < names.length; i++) {
      const x = hand.x + side * spreads[i];
      const start: [number, number, number] = [x, hand.y + 0.005, hand.z + 0.045];
      const end: [number, number, number] = [
        x + side * spreads[i] * 0.25,
        hand.y - 0.025 + Math.abs(spreads[i]) * 0.25,
        hand.z + 0.145,
      ];

      const finger = b.chain(
        `digit${side > 0 ? "L" : "R"}${i}`,
        [start, end],
        {
          parent: arm.tip ?? arm.joints[arm.joints.length - 1],
          names: [
            `${names[i]}${side > 0 ? "L" : "R"}`,
            `${names[i]}Tip${side > 0 ? "L" : "R"}`,
          ],
          role: "digit",
        },
      );

      b.sweep(finger, [0.022, 0.012], {
        color: SKIN,
        bone: finger,
        section: { ngon: 6 },
        caps: "round",
        name: `${names[i]}Finger${side > 0 ? "L" : "R"}`,
        group: "hands",
      });

      sphere(
        0.014,
        "#f4d09a",
        end,
        [1.1, 0.55, 1.3],
        {
          bone: finger.tip ?? finger.joints[finger.joints.length - 1],
          group: "hands",
          name: `${names[i]}Nail${side > 0 ? "L" : "R"}`,
        },
      );
    }

    const thumbStart: [number, number, number] = [
      hand.x + side * 0.07,
      hand.y + 0.035,
      hand.z + 0.025,
    ];
    const thumbEnd: [number, number, number] = [
      hand.x + side * 0.13,
      hand.y - 0.005,
      hand.z + 0.09,
    ];
    const thumb = b.chain(
      `thumb${side > 0 ? "L" : "R"}`,
      [thumbStart, thumbEnd],
      {
        parent: arm.tip ?? arm.joints[arm.joints.length - 1],
        names: [`thumb${side > 0 ? "L" : "R"}`, `thumbTip${side > 0 ? "L" : "R"}`],
        role: "digit",
      },
    );
    b.sweep(thumb, [0.026, 0.014], {
      color: SKIN,
      bone: thumb,
      section: { ngon: 6 },
      caps: "round",
      name: `thumb${side > 0 ? "L" : "R"}Mesh`,
      group: "hands",
    });
  }

  for (const armInfo of armData) {
    makeDigits(armInfo.side, armInfo.chain, armInfo.hand);
  }

  const anvilBase = box([0.46, 0.15, 0.36], IRON, [0, 0.105, 0.58], {
    group: "anvil",
    name: "anvilBase",
  });

  for (const x of [-0.17, 0.17]) {
    for (const z of [0.46, 0.7]) {
      box([0.13, 0.12, 0.13], IRON, [x, 0.065, z], {
        group: "anvil",
        name: "anvilFoot",
      });
    }
  }

  b.frustumBox(
    [0, 0.2, 0.58],
    [0, 0.55, 0.58],
    [0.36, 0.17],
    [0.22, 0.22],
    {
      color: IRON,
      section: { ngon: 6 },
      caps: "flat",
      group: "anvil",
      name: "anvilWaist",
    },
  );

  box([0.58, 0.105, 0.33], IRON, [0, 0.59, 0.58], {
    group: "anvil",
    name: "anvilFace",
  });

  b.spike(
    [0, 0.62, 0.71],
    [0, 0, 1],
    0.29,
    0.105,
    IRON,
    {
      caps: "point",
      section: { ngon: 8 },
      group: "anvil",
      name: "anvilHorn",
    },
  );

  box([0.3, 0.13, 0.13], IRON, [0, 0.6, 0.405], {
    group: "anvil",
    name: "anvilHeel",
  });

  const anvilMark = b.part(new THREE.CircleGeometry(0.09, 16), "#ffffff", {
    at: [0, 0.648, 0.58],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, 1],
    texture: ANVIL_MARK,
    group: "anvil",
    name: "anvilMakerMark",
  });

  for (const x of [-0.2, -0.07, 0.07, 0.2]) {
    cylinder(0.014, 0.012, BRASS, [x, 0.65, 0.43], {
      group: "anvil",
      name: "anvilRivet",
    });
  }

  const hotBillet = box([0.15, 0.04, 0.075], HOT_METAL, [0, 0.68, 0.58], {
    group: "hotMetal",
    name: "hotBillet",
  });
  glow(hotBillet, 1.7);

  const hotCore = sphere(0.035, HOT_CORE, [0, 0.705, 0.58], [1.8, 0.32, 0.8], {
    group: "hotMetal",
    name: "hotBilletCore",
  });
  glow(hotCore, 2.5);

  for (const armInfo of armData) {
    if (armInfo.side > 0) {
      const hand = armInfo.hand;
      b.rod(
        [hand.x, hand.y, hand.z + 0.02],
        [-0.04, 0.72, 0.58],
        0.014,
        STEEL,
        {
          bone: armInfo.chain.tip ?? armInfo.chain.joints[armInfo.chain.joints.length - 1],
          group: "tongs",
          name: "tongsUpper",
        },
      );
      b.rod(
        [hand.x + 0.035, hand.y - 0.015, hand.z + 0.01],
        [0.015, 0.72, 0.58],
        0.012,
        STEEL,
        {
          bone: armInfo.chain.tip ?? armInfo.chain.joints[armInfo.chain.joints.length - 1],
          group: "tongs",
          name: "tongsLower",
        },
      );
      b.spike([0, 0.72, 0.58], [0, 0, 1], 0.09, 0.009, STEEL, {
        caps: "point",
        group: "tongs",
        name: "tongsJaw",
      });
    }
  }

  const hammerHand = armData.find((entry) => entry.side < 0)!;
  const hammerStart = hammerHand.hand;
  const hammerGrip: [number, number, number] = [-0.31, 1.51, 0.57];

  b.rod(
    [hammerStart.x, hammerStart.y, hammerStart.z],
    hammerGrip,
    0.027,
    WOOD,
    {
      bone: hammerHand.chain.tip ?? hammerHand.chain.joints[hammerHand.chain.joints.length - 1],
      group: "hammer",
      name: "hammerHandle",
    },
  );

  for (let i = 0; i < 4; i++) {
    const t = 0.18 + i * 0.12;
    const p = new THREE.Vector3(
      hammerStart.x + (hammerGrip[0] - hammerStart.x) * t,
      hammerStart.y + (hammerGrip[1] - hammerStart.y) * t,
      hammerStart.z + (hammerGrip[2] - hammerStart.z) * t,
    );
    b.stick(new THREE.TorusGeometry(0.032, 0.006, 5, 8), BRASS, frame(p, [0.33, 0.92, 0.15]), {
      embed: 0.1,
      group: "hammer",
      name: "hammerGripBand",
    });
  }

  box([0.32, 0.16, 0.17], STEEL, [-0.27, 1.57, 0.57], {
    bone: hammerHand.chain.joints[Math.min(1, hammerHand.chain.joints.length - 1)],
    group: "hammer",
    name: "hammerHead",
  });

  cylinder(0.096, 0.18, STEEL, [-0.44, 1.57, 0.57], {
    bone: hammerHand.chain.joints[Math.min(1, hammerHand.chain.joints.length - 1)],
    rotation: [0, 0, Math.PI / 2],
    group: "hammer",
    name: "hammerPoll",
  });

  cylinder(0.087, 0.18, STEEL, [-0.1, 1.57, 0.57], {
    bone: hammerHand.chain.joints[Math.min(1, hammerHand.chain.joints.length - 1)],
    rotation: [0, 0, Math.PI / 2],
    group: "hammer",
    name: "hammerFace",
  });

  b.part(new THREE.PlaneGeometry(0.11, 0.065), "#ffffff", {
    at: [-0.27, 1.57, 0.66],
    dir: [0, 0, 1],
    axis: "z",
    texture: HAMMER_RUNE,
    bone: hammerHand.chain.joints[Math.min(1, hammerHand.chain.joints.length - 1)],
    group: "hammer",
    name: "hammerRune",
  });

  for (const side of [-1, 1]) {
    sphere(
      0.035,
      BRASS,
      [-0.27 + side * 0.11, 1.57, 0.66],
      [0.8, 0.8, 0.4],
      {
        bone: hammerHand.chain.joints[Math.min(1, hammerHand.chain.joints.length - 1)],
        group: "hammer",
        name: "hammerRivet",
      },
    );
  }

  const forgeX = 0.74;
  const forgeZ = 0.2;

  box([0.4, 0.2, 0.34], IRON, [forgeX, 0.1, forgeZ], {
    group: "forge",
    name: "forgeBase",
  });

  box([0.3, 0.34, 0.25], IRON, [forgeX, 0.34, forgeZ], {
    group: "forge",
    name: "forgeBody",
  });

  const forgeBowl = b.lathe(
    [
      [0, 0],
      [0.15, 0],
      [0.19, 0.035],
      [0.18, 0.085],
      [0.13, 0.16],
      [0.08, 0.19],
      [0, 0.2],
    ],
    {
      at: [forgeX, 0.52, forgeZ],
      axis: [0, 1, 0],
      segments: 10,
      smoothing: 1,
      color: IRON,
      group: "forge",
      name: "forgeBowl",
    },
  );

  for (const p of [
    [forgeX - 0.09, 0.72, forgeZ - 0.04],
    [forgeX, 0.73, forgeZ + 0.015],
    [forgeX + 0.09, 0.72, forgeZ + 0.035],
    [forgeX - 0.02, 0.76, forgeZ - 0.07],
    [forgeX + 0.045, 0.765, forgeZ - 0.015],
  ] as const) {
    const coal = sphere(0.055, COAL, p, [1.1, 0.7, 0.9], {
      group: "forge",
      name: "coal",
    });
    glow(coal, 0.35);
  }

  b.part(new THREE.PlaneGeometry(0.22, 0.22), "#ffffff", {
    at: [forgeX, 0.39, forgeZ + 0.13],
    dir: [0, 0, 1],
    axis: "z",
    texture: COAL_TEXTURE,
    group: "forge",
    name: "forgeEmblem",
  });

  const chimneyPath = catmull([
    [forgeX, 0.65, forgeZ],
    [forgeX, 0.9, forgeZ],
    [forgeX + 0.02, 1.12, forgeZ - 0.015],
  ]);
  b.sweep(chimneyPath, [0.09, 0.075], {
    color: IRON,
    section: { ngon: 8 },
    caps: "flat",
    group: "forge",
    name: "forgeChimney",
  });

  b.part(new THREE.TorusGeometry(0.095, 0.012, 5, 10), BRASS, {
    at: [forgeX, 0.91, forgeZ],
    rotation: [Math.PI / 2, 0, 0],
    group: "forge",
    name: "chimneyBand",
  });

  const sparks = [
    [0.05, 0.82, 0.58],
    [-0.07, 0.79, 0.6],
    [0.095, 0.86, 0.62],
    [-0.12, 0.88, 0.55],
    [0.02, 0.93, 0.6],
  ] as const;

  for (let i = 0; i < sparks.length; i++) {
    const spark = b.spike(
      sparks[i],
      [i % 2 === 0 ? 0.015 : -0.01, 0.06 + (i % 3) * 0.015, 0.025],
      1,
      0.008,
      HOT_CORE,
      {
        caps: "point",
        group: "sparks",
        name: `spark${i}`,
      },
    );
    glow(spark, 2.2);
  }

  const floorRivets = [
    [-0.34, 0.015, 0.39],
    [0.34, 0.015, 0.39],
    [-0.34, 0.015, 0.77],
    [0.34, 0.015, 0.77],
  ] as const;

  for (const p of floorRivets) {
    cylinder(0.025, 0.02, BRASS, p, {
      group: "anvil",
      name: "baseRivet",
    });
  }

  for (const side of [-1, 1]) {
    b.spike(
      [side * 0.265, 0.64, 0.5],
      [side * 0.1, 0.02, -0.01],
      0.12,
      0.018,
      BRASS,
      {
        caps: "point",
        group: "anvil",
        name: "anvilHandle",
      },
    );
  }

  return b.root;
}
