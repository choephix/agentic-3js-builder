import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame, line } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { lerp, offset, rng } from "../../../../src/math";
import type { V3 } from "../../../../src/math";
import { cells, mix, mottle, noise, paint, smoothstep } from "../../../../src/paint";
import { arc, bezier, catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel, INK, inkLines } from "../../../../kits/toon";

export const meta = {
  name: "Pyroclast Archon Golem",
  description:
    "A towering Genshin Impact style volcanic colossus of hexagonal basalt armor plates, molten magma seams, ornate gold filigree, elemental Pyro runes, and a cel-shaded floating crown.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "lavaGolem", detail: 0.9, paintSize: 2048 });

  // ---------------------------------------------------------------------------
  // PALETTE & PAINTS (Genshin Impact Cel-Shaded Basalt, Gold Filigree & Pyro Glow)
  // ---------------------------------------------------------------------------
  const BASALT_DARK_HEX = "#26212c";
  const BASALT_MID_HEX = "#383140";
  const BASALT_LIGHT_HEX = "#4d4357";
  const OBSIDIAN_HEX = "#191521";
  const GOLD_BRIGHT_HEX = "#f2c659";
  const GOLD_ANTIQUE_HEX = "#c99232";
  const CRIMSON_SILK_HEX = "#9e2323";

  // Flat glowing colors (cannot be Paint objects when passed to glow())
  const MAGMA_CORE = "#fff3a8";
  const MAGMA_BRIGHT = "#ff7b14";
  const MAGMA_ORANGE = "#ff4508";
  const MAGMA_DEEP = "#c41e06";
  const PYRO_GOLD = "#ffcf40";

  // Cel-shaded stone with subtle columnar grain and cooling magma edge warmth
  const BASALT_PLATE = cel(
    paint((p, n) => {
      const c = cells(p, 0.22, 17);
      const edge = smoothstep(0.11, 0.015, c.d2 - c.d1);
      const nVal = noise(p, 0.35, 31);
      const base = mix(BASALT_DARK_HEX, BASALT_MID_HEX, smoothstep(0.25, 0.75, nVal));
      const facet = mix(base, BASALT_LIGHT_HEX, smoothstep(0.3, 0.85, n.y) * 0.55);
      // Warm scorched rim near cell borders
      return mix(facet, "#6e2718", edge * 0.45);
    }),
    "#18131f",
  );

  // Cracked magma core paint for non-glowing transition armor & inner limbs
  const MOLTEN_CRUST = cel(
    paint((p, n) => {
      const c = cells(p, 0.16, 43);
      const crack = smoothstep(0.09, 0.012, c.d2 - c.d1);
      const crust = mix(OBSIDIAN_HEX, BASALT_DARK_HEX, smoothstep(-0.3, 0.6, n.y));
      const hotRim = mix("#801b0a", "#ff5e0e", smoothstep(0.05, 0.0, c.d2 - c.d1));
      return mix(crust, hotRim, crack);
    }),
    "#120d17",
  );

  const BASALT_TRIM = inkLines(cel(BASALT_LIGHT_HEX, BASALT_DARK_HEX), {
    levels: [-0.55, 0.55],
    axis: [0, 1, 0],
    width: 0.07,
    ink: INK,
  });

  const OBSIDIAN_CEL = cel(OBSIDIAN_HEX, "#0d0912");

  const GOLD_ORNATE = cel(
    mottle(GOLD_BRIGHT_HEX, GOLD_ANTIQUE_HEX, { size: 0.18, seed: 9, contrast: 1.4 }),
    "#825318",
    { threshold: 0.02 },
  );

  const GOLD_RIMMED = inkLines(GOLD_ORNATE, {
    levels: [0.05],
    axis: [0, 0, 1],
    width: 0.06,
    ink: "#4a2709",
  });

  const CRIMSON_FABRIC = cel(
    paint((p) => {
      const wave = Math.sin(p.x * 28 + p.z * 18) * 0.015;
      const border = Math.abs((p.y + wave) % 0.18) < 0.024;
      return border ? GOLD_BRIGHT_HEX : CRIMSON_SILK_HEX;
    }),
    "#571018",
  );

  // ---------------------------------------------------------------------------
  // SVG TEXTURES (Genshin Pyro Emblem, Runic Sigils, Talisman & Flame Cards)
  // ---------------------------------------------------------------------------
  // Glowing Pyro Archon chest/halo sigil
  const PYRO_SIGIL_TEX = svg(
    `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <circle cx="128" cy="128" r="116" fill="none" stroke="#ff7b14" stroke-width="6"/>
      <circle cx="128" cy="128" r="98" fill="none" stroke="#ffcf40" stroke-width="4" stroke-dasharray="18 10"/>
      <polygon points="128,12 152,66 210,46 184,102 244,128 184,154 210,210 152,190 128,244 104,190 46,210 72,154 12,128 72,102 46,46 104,66"
        fill="none" stroke="#ff9e2c" stroke-width="5" stroke-linejoin="round"/>
      <polygon points="128,36 164,104 220,128 164,152 128,220 92,152 36,128 92,104"
        fill="#ff4508" stroke="#fff3a8" stroke-width="5"/>
      <path d="M128,58 C154,96 172,118 158,152 C148,176 108,176 98,152 C84,118 102,96 128,58 Z"
        fill="#ffcf40" stroke="#fff3a8" stroke-width="4"/>
      <circle cx="128" cy="134" r="22" fill="#fff6bd"/>
    </svg>`,
    { size: 512 },
  );

  // Glowing ferocious elemental eye decal
  const GOLEM_EYE_TEX = svg(
    `<svg viewBox="0 0 128 96" xmlns="http://www.w3.org/2000/svg">
      <polygon points="8,54 38,24 92,18 122,42 96,74 42,78" fill="#22112f"/>
      <polygon points="16,52 42,30 88,25 114,43 92,68 44,71" fill="#ff4508"/>
      <polygon points="28,50 48,34 84,30 104,44 86,62 48,64" fill="#ffcf40"/>
      <polygon points="58,28 68,48 58,68 48,48" fill="#fff8cc"/>
      <path d="M10,36 L44,14 L96,10" fill="none" stroke="#ff9e2c" stroke-width="5" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  // Glowing runic inscription strip for basalt armor plates
  const RUNE_STRIP_TEX = svg(
    `<svg viewBox="0 0 128 256" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="12" width="88" height="232" rx="14" fill="none" stroke="#ff6a14" stroke-width="6"/>
      <path d="M64,28 L88,60 L64,92 L40,60 Z" fill="#ffcf40"/>
      <path d="M40,108 L88,108 M64,92 L64,168 M42,138 L86,138" stroke="#fff3a8" stroke-width="8" stroke-linecap="round"/>
      <polygon points="64,172 90,204 64,228 38,204" fill="#ff7b14" stroke="#fff3a8" stroke-width="5"/>
      <circle cx="64" cy="60" r="10" fill="#fff6bd"/>
      <circle cx="64" cy="204" r="9" fill="#fff6bd"/>
    </svg>`,
    { size: 256 },
  );

  // Pyro flame & ember wisp card texture
  const FLAME_CARD_TEX = svg(
    `<svg viewBox="0 0 96 192" xmlns="http://www.w3.org/2000/svg">
      <path d="M48,188 C16,164 10,118 28,76 C36,56 30,32 48,6 C66,32 62,58 72,82 C88,120 80,164 48,188 Z"
        fill="#ff4508"/>
      <path d="M48,182 C26,160 22,122 36,88 C44,68 40,46 48,24 C58,46 56,70 64,90 C76,122 70,160 48,182 Z"
        fill="#ff9e1c"/>
      <path d="M48,176 C36,158 34,130 44,104 C48,90 46,72 48,56 C52,72 52,90 56,106 C64,130 60,158 48,176 Z"
        fill="#fff3a8"/>
      <circle cx="26" cy="44" r="6" fill="#ffcf40"/>
      <circle cx="72" cy="34" r="5" fill="#fff3a8"/>
    </svg>`,
    { size: 256 },
  );

  // Genshin ornate gold-and-crimson hanging talisman card
  const TALISMAN_TEX = svg(
    `<svg viewBox="0 0 96 256" xmlns="http://www.w3.org/2000/svg">
      <polygon points="48,6 86,38 78,214 48,250 18,214 10,38" fill="#8f1d1d" stroke="#f2c659" stroke-width="7"/>
      <polygon points="48,22 74,46 68,204 48,232 28,204 22,46" fill="#b82525" stroke="#ffcf40" stroke-width="4"/>
      <polygon points="48,44 66,76 48,108 30,76" fill="#ffcf40"/>
      <circle cx="48" cy="76" r="10" fill="#fff3a8"/>
      <path d="M34,126 L62,126 M48,112 L48,186 M34,154 L62,154 M38,186 L48,206 L58,186"
        stroke="#ffcf40" stroke-width="6" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // SKELETON (Full rigged monster hierarchy: pelvis -> spine -> neck -> head/jaw,
  //           plantigrade legs + 3 toes each, massive gorilla/archon arms + 4 digits,
  //           floating Pyro halo hinge & tail stub)
  // ---------------------------------------------------------------------------
  const pelvis = b.joint("pelvis", { at: [0, 1.06, 0], dir: [0, 1, 0.05], role: "spine", group: "torso" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.06, 0.0],
      [0, 1.34, -0.02],
      [0, 1.66, 0.03],
      [0, 1.98, 0.08],
    ]),
    {
      parent: pelvis,
      names: ["spine1", "chest", "upperChest"],
      role: "spine",
      group: "torso",
    },
  );
  const spine1 = spine.joints[0];
  const chest = spine.joints[1];
  const upperChest = spine.joints[2];

  const neck = b.joint("neck", {
    parent: upperChest,
    at: [0, 2.04, 0.11],
    dir: [0, 0.85, 0.45],
    role: "neck",
    group: "head",
  });

  const head = b.joint("head", {
    parent: neck,
    at: [0, 2.18, 0.2],
    dir: [0, 0.08, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 2.1, 0.24],
    dir: [0, -0.28, 0.96],
    role: "jaw",
    group: "head",
  });

  // Floating Pyro Archon Chakra/Halo behind the upper back
  const haloJoint = b.joint("halo", {
    parent: upperChest,
    at: [0, 2.26, -0.28],
    dir: [0, 0, -1],
    up: [0, 1, 0],
    role: "hinge",
    group: "halo",
  });

  // Tail / Pyroclast Basal Counterweight Spine
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.98, -0.16],
      [0, 0.84, -0.42],
      [0, 0.76, -0.68],
    ]),
    {
      parent: pelvis,
      names: ["tail1", "tail2"],
      role: "tail",
      group: "tail",
    },
  );

  // Store bilateral limb references
  type SideLimbs = {
    s: number;
    side: "L" | "R";
    leg: ReturnType<typeof b.chain>;
    hip: ReturnType<typeof b.joint>;
    knee: ReturnType<typeof b.joint>;
    ankle: ReturnType<typeof b.joint>;
    toes: ReturnType<typeof b.joint>[];
    clavicle: ReturnType<typeof b.joint>;
    arm: ReturnType<typeof b.chain>;
    shoulder: ReturnType<typeof b.joint>;
    elbow: ReturnType<typeof b.joint>;
    wrist: ReturnType<typeof b.joint>;
    pauldronJoint: ReturnType<typeof b.joint>;
    thumb: ReturnType<typeof b.chain>;
    fingers: ReturnType<typeof b.chain>[];
  };
  const sides: SideLimbs[] = [];

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";

    // LEGS (IK solved to plant cleanly above floor y=0)
    const hipPos: V3 = [s * 0.34, 1.02, 0.0];
    const anklePos: V3 = [s * 0.42, 0.18, 0.04];
    const legPts = limb(hipPos, anklePos, [0.48, 0.44], [s * 0.12, 0.15, 1]);
    const leg = b.chain(`leg${side}`, legPts, {
      parent: pelvis,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.42, 0.0, 0.1],
      group: `leg${side}`,
    });
    const [hip, knee, ankle] = leg.joints;

    const toes: ReturnType<typeof b.joint>[] = [];
    const toeOffsets = [
      { name: `toeIn${side}`, dx: -s * 0.1, dz: 0.22, dir: [-s * 0.15, -0.15, 1] as V3 },
      { name: `toeMid${side}`, dx: 0, dz: 0.25, dir: [0, -0.15, 1] as V3 },
      { name: `toeOut${side}`, dx: s * 0.11, dz: 0.21, dir: [s * 0.2, -0.15, 1] as V3 },
    ];
    for (const t of toeOffsets) {
      toes.push(
        b.joint(t.name, {
          parent: ankle,
          at: [s * 0.42 + t.dx, 0.08, 0.04 + t.dz * 0.55],
          dir: t.dir,
          role: "digit",
          group: `leg${side}`,
        }),
      );
    }

    // ARMS (Broad heroic T/A rest pose, separated from body, digits fanned cleanly)
    const clavicle = b.joint(`clavicle${side}`, {
      parent: upperChest,
      at: [s * 0.26, 1.94, 0.04],
      dir: [s, 0.08, 0],
      role: "arm",
      group: `arm${side}`,
    });

    const pauldronJoint = b.joint(`pauldron${side}`, {
      parent: clavicle,
      at: [s * 0.58, 2.08, 0.02],
      dir: [s * 0.85, 0.45, 0],
      role: "hinge",
      group: `arm${side}`,
    });

    const shoulderPos: V3 = [s * 0.56, 1.92, 0.02];
    const wristPos: V3 = [s * 1.18, 1.24, 0.22];
    const armPts = limb(shoulderPos, wristPos, [0.48, 0.52], [-s * 0.15, -0.2, -1]);
    const arm = b.chain(`arm${side}`, armPts, {
      parent: clavicle,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
      group: `arm${side}`,
    });
    const [shoulder, elbow, wrist] = arm.joints;

    // Massive stone-and-magma claws (1 thumb + 3 main fingers per hand)
    const thumb = b.chain(
      `thumb${side}`,
      [
        [s * 1.15, 1.21, 0.34],
        [s * 1.12, 1.11, 0.46],
        [s * 1.07, 1.01, 0.52],
      ],
      {
        parent: wrist,
        names: [`thumb1${side}`, `thumb2${side}`],
        role: "digit",
        group: `hand${side}`,
      },
    );

    const fingerSpecs = [
      {
        tag: "index",
        p0: [s * 1.25, 1.19, 0.33] as V3,
        p1: [s * 1.31, 1.05, 0.41] as V3,
        p2: [s * 1.29, 0.91, 0.44] as V3,
      },
      {
        tag: "mid",
        p0: [s * 1.27, 1.18, 0.22] as V3,
        p1: [s * 1.34, 1.03, 0.25] as V3,
        p2: [s * 1.32, 0.88, 0.27] as V3,
      },
      {
        tag: "ring",
        p0: [s * 1.24, 1.18, 0.11] as V3,
        p1: [s * 1.3, 1.04, 0.11] as V3,
        p2: [s * 1.28, 0.9, 0.12] as V3,
      },
    ];
    const fingers = fingerSpecs.map((f) =>
      b.chain(`${f.tag}${side}`, [f.p0, f.p1, f.p2], {
        parent: wrist,
        names: [`${f.tag}1${side}`, `${f.tag}2${side}`],
        role: "digit",
        group: `hand${side}`,
      }),
    );

    sides.push({
      s,
      side,
      leg,
      hip,
      knee,
      ankle,
      toes,
      clavicle,
      arm,
      shoulder,
      elbow,
      wrist,
      pauldronJoint,
      thumb,
      fingers,
    });
  }

  // ---------------------------------------------------------------------------
  // HELPER SHAPES (Hexagonal Basalt Columns, Armor Plates, Gold Filigree, Runes)
  // ---------------------------------------------------------------------------
  const hexPrism = (
    p0: V3,
    p1: V3,
    r0: number,
    r1: number,
    color: Parameters<typeof b.rod>[3],
    bone: Parameters<typeof b.rod>[4]["bone"],
    group: string,
    name?: string,
  ) =>
    b.rod(p0, p1, [r0, r1], color, {
      section: { ngon: 6 },
      smooth: false,
      bone,
      group,
      name,
    });

  const magmaVein = (
    pts: V3[],
    r: number | [number, number],
    bone: Parameters<typeof b.sweep>[2]["bone"],
    group: string,
    color = MAGMA_BRIGHT,
    strength = 1.6,
  ) =>
    glow(
      b.sweep(catmull(pts), r, color, {
        section: { ngon: 5 },
        smooth: false,
        bone,
        group,
      }),
      strength,
    );

  // ---------------------------------------------------------------------------
  // 1. TORSO & MOLTEN FURNACE CORE
  // ---------------------------------------------------------------------------
  // Inner glowing magma core body (seen through the gaps between basalt plates!)
  glow(
    b.loft(
      [
        { at: [0, 0.98, -0.02], w: 0.48, h: 0.38 },
        { at: [0, 1.28, 0.0], w: 0.44, h: 0.36 },
        { at: [0, 1.64, 0.03], w: 0.68, h: 0.52 },
        { at: [0, 1.98, 0.06], w: 0.82, h: 0.56 },
        { at: [0, 2.12, 0.08], w: 0.52, h: 0.38 },
      ],
      {
        bone: [pelvis, spine],
        section: { ngon: 8 },
        smooth: false,
        color: MAGMA_ORANGE,
        group: "torso",
        name: "moltenTorsoCore",
      },
    ),
    1.4,
  );

  // Blazing white-hot heart sphere suspended inside the chest cavity
  glow(
    b.part(new THREE.OctahedronGeometry(0.19, 1), MAGMA_CORE, {
      bone: chest,
      at: [0, 1.68, 0.14],
      scale: [1.1, 1.25, 0.9],
      flat: true,
      group: "torso",
      name: "pyroHeartCore",
    }),
    2.2,
  );

  // Pyro Emblem Decal shining on the front chest core
  glow(
    b.part(new THREE.PlaneGeometry(0.42, 0.42), "#ffffff", {
      bone: chest,
      at: [0, 1.72, 0.37],
      dir: [0, 0.12, 1],
      axis: "z",
      texture: PYRO_SIGIL_TEX,
      group: "torso",
      name: "chestPyroSigil",
    }),
    1.8,
  );

  // Basalt Rib & Pectoral Armor Plates (split left/right so glowing magma seams show between!)
  const chestPlateOutline: OutlinePoint[] = [
    [0.04, -0.14, "sharp"],
    [0.38, -0.08, "sharp"],
    [0.46, 0.12, "sharp"],
    [0.34, 0.26, "sharp"],
    [0.06, 0.22, "sharp"],
    [0.02, 0.04, "sharp"],
  ];

  const ribPlateOutline: OutlinePoint[] = [
    [0.05, -0.1, "sharp"],
    [0.32, -0.06, "sharp"],
    [0.36, 0.07, "sharp"],
    [0.24, 0.13, "sharp"],
    [0.04, 0.09, "sharp"],
  ];

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";

    // Upper pectoral basalt slab
    b.extrude(chestPlateOutline, {
      bone: upperChest,
      at: [s * 0.05, 1.78, 0.31],
      x: [s * 0.92, 0.05, -0.38],
      y: [0, 0.96, -0.26],
      thickness: [0.14, 0.08],
      bevel: 0.02,
      color: BASALT_PLATE,
      group: "torso",
      name: `pecPlate${side}`,
    });

    // Gold Genshin filigree frame bordering the pectoral plate
    b.sweep(
      catmull([
        [s * 0.08, 1.98, 0.28],
        [s * 0.34, 1.99, 0.2],
        [s * 0.45, 1.84, 0.16],
        [s * 0.36, 1.66, 0.25],
        [s * 0.09, 1.64, 0.33],
      ]),
      0.022,
      GOLD_ORNATE,
      {
        section: { ngon: 4 },
        smooth: false,
        bone: upperChest,
        group: "torso",
        name: `pecGoldTrim${side}`,
      },
    );

    // Glowing rune tablet inset into each pectoral plate
    glow(
      b.part(new THREE.PlaneGeometry(0.13, 0.24), "#ffffff", {
        bone: upperChest,
        at: [s * 0.24, 1.82, 0.34],
        dir: [s * 0.38, 0.18, 0.9],
        axis: "z",
        texture: RUNE_STRIP_TEX,
        group: "torso",
        name: `pecRune${side}`,
      }),
      1.7,
    );

    // Two tiers of abdominal/rib basalt plates with glowing magma channels between them
    for (let r = 0; r < 2; r++) {
      const y = 1.5 - r * 0.19;
      const z = 0.27 - r * 0.03;
      const scale = 1 - r * 0.12;
      b.extrude(
        ribPlateOutline.map(([x, y0]) => [x * scale, y0 * scale, "sharp"] as OutlinePoint),
        {
          bone: r === 0 ? chest : spine1,
          at: [s * 0.05, y, z],
          x: [s * 0.88, 0.04, -0.46],
          y: [0, 1, 0],
          thickness: 0.11,
          bevel: 0.015,
          color: BASALT_PLATE,
          group: "torso",
          name: `ribPlate${r + 1}${side}`,
        },
      );
    }

    // Lateral oblique basalt columns framing the ribs
    hexPrism(
      [s * 0.34, 1.24, 0.02],
      [s * 0.46, 1.68, 0.04],
      0.085,
      0.12,
      MOLTEN_CRUST,
      chest,
      "torso",
      `flankColumn${side}`,
    );

    // Back dorsal basalt armor plates + erupting volcanic vents
    b.extrude(chestPlateOutline, {
      bone: upperChest,
      at: [s * 0.05, 1.82, -0.26],
      x: [s * 0.9, 0.04, 0.42],
      y: [0, 0.96, 0.26],
      thickness: [0.15, 0.09],
      bevel: 0.02,
      color: BASALT_PLATE,
      group: "torso",
      name: `backPlate${side}`,
    });

    // Volcanic chimney columns on the upper back with glowing crater tips
    const ventBase: V3 = [s * 0.28, 1.98, -0.22];
    const ventTip: V3 = [s * 0.38, 2.38, -0.44];
    hexPrism(ventBase, ventTip, 0.11, 0.075, BASALT_PLATE, upperChest, "torso", `backVent${side}`);
    glow(
      b.rod(lerp(ventBase, ventTip, 0.72), offset(ventTip, [s * 0.2, 0.8, -0.5], 0.03), [0.055, 0.045], MAGMA_CORE, {
        section: { ngon: 6 },
        smooth: false,
        bone: upperChest,
        group: "torso",
        name: `backVentCore${side}`,
      }),
      2.0,
    );

    // Gold collar ring around each dorsal chimney
    b.rod(lerp(ventBase, ventTip, 0.55), lerp(ventBase, ventTip, 0.7), 0.095, GOLD_ORNATE, {
      section: { ngon: 6 },
      smooth: false,
      bone: upperChest,
      group: "torso",
    });
  }

  // Central Sternum & Spine Molten Seams (bright veins bridging the plates)
  magmaVein(
    [
      [0, 1.16, 0.24],
      [0, 1.46, 0.29],
      [0, 1.76, 0.34],
      [0, 2.02, 0.26],
    ],
    [0.035, 0.048],
    chest,
    "torso",
    MAGMA_CORE,
    2.0,
  );

  // Dorsal spine crags & molten ridge along the back
  const dorsalHeights = [1.18, 1.38, 1.6, 1.82, 2.02];
  dorsalHeights.forEach((y, i) => {
    const z = -0.22 - Math.sin((i / 4) * Math.PI) * 0.06;
    const owner = i < 2 ? spine1 : i < 4 ? chest : upperChest;
    const len = 0.16 + (i === 2 || i === 3 ? 0.08 : 0);
    hexPrism([0, y, z + 0.06], [0, y + 0.08, z - len], 0.075, 0.03, BASALT_PLATE, owner, "torso", `dorsalSpine${i}`);
    glow(
      b.spike([0, y + 0.05, z - len * 0.6], [0, 0.35, -1], 0.11, 0.032, MAGMA_BRIGHT, {
        section: { ngon: 5 },
        smooth: false,
        bone: owner,
        group: "torso",
      }),
      1.8,
    );
  });

  // Ornate Genshin gold collar / gorget framing the neck & upper chest
  b.sweep(
    catmull([
      [-0.36, 2.05, -0.08],
      [-0.28, 2.02, 0.22],
      [0, 1.94, 0.35],
      [0.28, 2.02, 0.22],
      [0.36, 2.05, -0.08],
      [0, 2.1, -0.24],
    ], { closed: true }),
    0.034,
    GOLD_RIMMED,
    {
      section: { ngon: 6 },
      smooth: false,
      bone: upperChest,
      group: "torso",
      name: "archonGoldGorget",
    },
  );

  // Front gold diamond breastplate clasp below the Pyro sigil
  b.part(new THREE.OctahedronGeometry(0.085, 0), GOLD_ORNATE, {
    bone: chest,
    at: [0, 1.54, 0.33],
    scale: [1.2, 1.5, 0.55],
    flat: true,
    group: "torso",
    name: "chestGoldClasp",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.048, 0), MAGMA_CORE, {
      bone: chest,
      at: [0, 1.54, 0.36],
      scale: [1.0, 1.3, 0.5],
      flat: true,
      group: "torso",
    }),
    2.0,
  );

  // ---------------------------------------------------------------------------
  // 2. PELVIS, BELT, TASSELS & TAIL CRAG
  // ---------------------------------------------------------------------------
  // Pelvis core block
  b.frustumBox([0, 0.9, -0.02], [0, 1.18, 0.02], [0.46, 0.36], [0.58, 0.42], {
    bone: pelvis,
    color: MOLTEN_CRUST,
    group: "torso",
    name: "pelvisCore",
  });

  // Heavy gold-and-basalt war belt around the waist
  b.sweep(
    catmull(
      [
        [0, 1.15, 0.26],
        [0.34, 1.16, 0.14],
        [0.36, 1.17, -0.14],
        [0, 1.18, -0.25],
        [-0.36, 1.17, -0.14],
        [-0.34, 1.16, 0.14],
      ],
      { closed: true },
    ),
    0.042,
    GOLD_RIMMED,
    {
      section: { ngon: 6 },
      smooth: false,
      bone: pelvis,
      group: "torso",
      name: "waistGoldGirdle",
    },
  );

  // Center belt buckle: ornate gold frame + blazing Pyro crystal
  const buckleOutline: OutlinePoint[] = [
    [0, -0.14, "sharp"],
    [0.13, -0.04, "sharp"],
    [0.09, 0.12, "sharp"],
    [0, 0.16, "sharp"],
    [-0.09, 0.12, "sharp"],
    [-0.13, -0.04, "sharp"],
  ];
  b.extrude(buckleOutline, {
    bone: pelvis,
    at: [0, 1.12, 0.27],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.06,
    bevel: 0.012,
    color: GOLD_ORNATE,
    group: "torso",
    name: "beltBuckleGold",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.065, 0), MAGMA_BRIGHT, {
      bone: pelvis,
      at: [0, 1.12, 0.3],
      scale: [0.9, 1.4, 0.6],
      flat: true,
      group: "torso",
      name: "beltBuckleGem",
    }),
    2.0,
  );

  // Hanging Genshin Talisman Cloth Banner (front & back tabards)
  const frontTabardOutline: OutlinePoint[] = [
    [-0.11, 0, "sharp"],
    [0.11, 0, "sharp"],
    [0.14, -0.34, "sharp"],
    [0, -0.48, "sharp"],
    [-0.14, -0.34, "sharp"],
  ];
  b.extrude(frontTabardOutline, {
    bone: pelvis,
    at: [0, 1.02, 0.25],
    x: [1, 0, 0],
    y: [0, 0.98, 0.18],
    thickness: 0.018,
    bevel: 0.004,
    color: CRIMSON_FABRIC,
    group: "torso",
    name: "frontTabard",
  });

  // Hip Tassets (layered hexagonal basalt plates flanking the hips)
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    for (let k = 0; k < 2; k++) {
      const y = 1.04 - k * 0.14;
      b.extrude(
        [
          [-0.12, 0.06, "sharp"],
          [0.12, 0.06, "sharp"],
          [0.15, -0.08, "sharp"],
          [0, -0.14, "sharp"],
          [-0.15, -0.08, "sharp"],
        ],
        {
          bone: pelvis,
          at: [s * (0.35 + k * 0.03), y, 0.04],
          x: [0, 0, 1],
          y: [s * 0.22, 0.97, 0],
          thickness: 0.045,
          bevel: 0.008,
          color: k === 0 ? BASALT_PLATE : GOLD_ORNATE,
          group: "torso",
          name: `hipTasset${k + 1}${side}`,
        },
      );
    }

    // Hanging Genshin gold-and-crimson talisman cards on both hips
    b.cards([frame([s * 0.26, 0.98, 0.22], [0, 1, 0])], TALISMAN_TEX, {
      size: [0.14, 0.36],
      lean: 175,
      flow: [s * 0.2, 0, 1],
      bone: pelvis,
      group: "torso",
      name: `hipTalisman${side}`,
    });
  }

  // Basal Volcanic Tail Crag
  b.sweep(tail, [0.16, 0.09, 0.03], BASALT_PLATE, {
    section: { ngon: 6 },
    smooth: false,
    caps: { start: "flat", end: "point" },
    group: "tail",
    name: "tailBasalt",
  });
  glow(
    b.spike(tail.joints[1].at, [0, -0.2, -1], 0.22, 0.055, MAGMA_BRIGHT, {
      section: { ngon: 5 },
      smooth: false,
      bone: tail.joints[1],
      group: "tail",
      name: "tailMagmaTip",
    }),
    1.8,
  );

  // ---------------------------------------------------------------------------
  // 3. HEAD, JAW & ARCHON CROWN HORNS
  // ---------------------------------------------------------------------------
  // Molten neck column
  glow(
    b.rod([0, 1.98, 0.09], [0, 2.2, 0.2], [0.16, 0.13], MAGMA_ORANGE, {
      section: { ngon: 6 },
      smooth: false,
      bone: neck,
      group: "head",
      name: "moltenNeck",
    }),
    1.5,
  );

  // Neck basalt armor plates
  for (const s of [1, -1] as const) {
    hexPrism(
      [s * 0.11, 2.0, 0.06],
      [s * 0.13, 2.18, 0.14],
      0.06,
      0.05,
      BASALT_PLATE,
      neck,
      "head",
      `neckPlate${s > 0 ? "L" : "R"}`,
    );
  }

  // Inner blazing skull furnace (visible inside mouth and eye sockets)
  glow(
    b.part(new THREE.DodecahedronGeometry(0.16, 0), MAGMA_CORE, {
      bone: head,
      at: [0, 2.22, 0.24],
      scale: [0.95, 0.9, 1.05],
      flat: true,
      group: "head",
      name: "skullFurnace",
    }),
    2.2,
  );

  // Upper Craggy Basalt Helmet / Visor Mask
  const helmOutline: OutlinePoint[] = [
    [-0.22, -0.04, "sharp"],
    [-0.14, -0.1, "sharp"],
    [-0.05, -0.03, "sharp"],
    [0, -0.09, "sharp"],
    [0.05, -0.03, "sharp"],
    [0.14, -0.1, "sharp"],
    [0.22, -0.04, "sharp"],
    [0.24, 0.12, "sharp"],
    [0.13, 0.22, "sharp"],
    [0, 0.26, "sharp"],
    [-0.13, 0.22, "sharp"],
    [-0.24, 0.12, "sharp"],
  ];
  const skullMask = b.extrude(helmOutline, {
    bone: head,
    at: [0, 2.22, 0.22],
    x: [1, 0, 0],
    y: [0, 0.96, -0.28],
    thickness: [0.24, 0.18],
    bevel: 0.02,
    color: BASALT_PLATE,
    group: "head",
    name: "skullBasaltHelm",
  });

  // Glowing ferocious eyes conformed onto the front of the visor
  const headSurf = b.surface(skullMask);
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    glow(
      b.decal(headSurf, GOLEM_EYE_TEX, {
        at: [s * 0.11, 2.24, 0.36],
        dir: [s * 0.22, 0.05, 1],
        size: [0.14, 0.095],
        mirror: s < 0,
        bone: head,
        group: "head",
        name: `eyeDecal${side}`,
      }),
      2.2,
    );

    // Swept-back golden brow crest above each eye
    b.sweep(
      bezier(
        [s * 0.03, 2.28, 0.38],
        [s * 0.15, 2.34, 0.35],
        [s * 0.27, 2.39, 0.22],
        [s * 0.34, 2.46, 0.06],
      ),
      [0.032, 0.024, 0.006],
      GOLD_ORNATE,
      {
        section: { ngon: 4 },
        smooth: false,
        caps: { start: "flat", end: "point" },
        bone: head,
        group: "head",
        name: `goldBrowCrest${side}`,
      },
    );

    // Massive curving basalt & magma horns (Archon Demon-King silhouette)
    const hornPath = bezier(
      [s * 0.16, 2.36, 0.2],
      [s * 0.38, 2.52, 0.12],
      [s * 0.46, 2.74, -0.06],
      [s * 0.32, 2.92, -0.18],
    );
    b.sweep(hornPath, [0.085, 0.065, 0.035, 0.0], BASALT_PLATE, {
      section: { ngon: 6 },
      smooth: false,
      caps: { start: "flat", end: "point" },
      bands: [
        [0.62, BASALT_PLATE],
        [0.72, GOLD_ORNATE],
        [1.0, MAGMA_BRIGHT],
      ],
      bone: head,
      group: "head",
      name: `archonHorn${side}`,
    });

    // Glowing magma tip on each horn
    glow(
      b.spike(hornPath.at(0.72), hornPath.at(1.0), null, 0.044, MAGMA_CORE, {
        section: { ngon: 6 },
        smooth: false,
        bone: head,
        group: "head",
        name: `hornGlowTip${side}`,
      }),
      2.0,
    );

    // Cheek & temple basalt guard plates
    hexPrism(
      [s * 0.2, 2.15, 0.22],
      [s * 0.25, 2.28, 0.12],
      0.055,
      0.042,
      BASALT_TRIM,
      head,
      "head",
      `cheekGuard${side}`,
    );
  }

  // Central Golden Archon Forehead Tiara / Crown Spire
  const crownOutline: OutlinePoint[] = [
    [-0.1, 0, "sharp"],
    [-0.05, 0.18, "sharp"],
    [0, 0.32, "sharp"],
    [0.05, 0.18, "sharp"],
    [0.1, 0, "sharp"],
    [0.04, -0.05, "sharp"],
    [-0.04, -0.05, "sharp"],
  ];
  b.extrude(crownOutline, {
    bone: head,
    at: [0, 2.34, 0.32],
    x: [1, 0, 0],
    y: [0, 0.94, -0.34],
    thickness: [0.045, 0.015],
    bevel: 0.008,
    color: GOLD_ORNATE,
    group: "head",
    name: "foreheadTiara",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.045, 0), MAGMA_CORE, {
      bone: head,
      at: [0, 2.42, 0.33],
      scale: [0.8, 1.5, 0.6],
      flat: true,
      group: "head",
      name: "tiaraPyroJewel",
    }),
    2.2,
  );

  // Separate Lower Jaw (craggy basalt mandible + glowing molten teeth)
  const jawOutline: OutlinePoint[] = [
    [-0.17, 0.04, "sharp"],
    [-0.13, -0.09, "sharp"],
    [0, -0.13, "sharp"],
    [0.13, -0.09, "sharp"],
    [0.17, 0.04, "sharp"],
    [0.11, 0.08, "sharp"],
    [0, 0.05, "sharp"],
    [-0.11, 0.08, "sharp"],
  ];
  b.extrude(jawOutline, {
    bone: jaw,
    at: [0, 2.08, 0.3],
    x: [1, 0, 0],
    y: [0, 0.95, 0.3],
    thickness: [0.18, 0.14],
    bevel: 0.016,
    color: BASALT_PLATE,
    group: "head",
    name: "lowerJawMandible",
  });

  // Chin basalt beard spike + gold chin guard
  b.spike([0, 1.98, 0.34], [0, -0.75, 0.65], 0.14, 0.055, GOLD_ORNATE, {
    section: { ngon: 4 },
    smooth: false,
    bone: jaw,
    group: "head",
    name: "chinGoldSpike",
  });

  // Jagged glowing magma fangs on upper & lower jaws
  for (const s of [1, -1] as const) {
    glow(
      b.spike([s * 0.08, 2.13, 0.35], [0, 1, 0.15], 0.065, 0.024, MAGMA_CORE, {
        section: { ngon: 4 },
        smooth: false,
        bone: jaw,
        group: "head",
      }),
      2.0,
    );
    glow(
      b.spike([s * 0.05, 2.19, 0.36], [0, -1, 0.1], 0.055, 0.02, MAGMA_BRIGHT, {
        section: { ngon: 4 },
        smooth: false,
        bone: head,
        group: "head",
      }),
      1.8,
    );
  }

  // Pose jaw slightly open so the roaring molten furnace mouth reads clearly
  b.pose(jaw, { axis: [1, 0, 0], deg: 14 });

  // ---------------------------------------------------------------------------
  // 4. FLOATING PYRO ARCHON HALO / CHAKRA RING (Signature Genshin Impact Motif)
  // ---------------------------------------------------------------------------
  const haloCenter: V3 = [0, 2.34, -0.34];
  const haloR = 0.56;

  // Main golden wheel arc behind the shoulders & head
  b.sweep(
    arc(haloCenter, [haloCenter[0] + haloR, haloCenter[1], haloCenter[2]], [0, 0, 1], 360),
    0.028,
    GOLD_ORNATE,
    {
      section: { ngon: 4 },
      smooth: false,
      bone: haloJoint,
      group: "halo",
      name: "haloGoldRing",
    },
  );

  // Inner blazing Pyro energy ring
  glow(
    b.sweep(
      arc(haloCenter, [haloCenter[0] + (haloR - 0.055), haloCenter[1], haloCenter[2] + 0.01], [0, 0, 1], 360),
      0.016,
      MAGMA_CORE,
      {
        section: { ngon: 4 },
        smooth: false,
        bone: haloJoint,
        group: "halo",
        name: "haloInnerGlowRing",
      },
    ),
    2.2,
  );

  // Radial spokes + 9 outer blazing Pyro sun-spikes around the halo
  b.ring(
    frame(haloCenter, [0, 0, -1], [0, 1, 0]),
    {
      count: 9,
      radius: haloR,
      fromDeg: -115,
      toDeg: 115,
      parent: haloJoint,
      group: "halo",
    },
    (spoke, idx) => {
      const major = idx % 2 === 0;
      const len = major ? 0.24 : 0.14;
      const r = major ? 0.048 : 0.032;
      // Gold base fin
      b.spike(spoke, spoke, len * 0.55, r, GOLD_ORNATE, {
        section: { ngon: 4 },
        smooth: false,
        bone: haloJoint,
        group: "halo",
      });
      // Blazing magma crystal tip
      glow(
        b.spike(spoke.moved([0, len * 0.42, 0]), spoke, len * 0.75, r * 0.82, major ? MAGMA_CORE : MAGMA_BRIGHT, {
          section: { ngon: 4 },
          smooth: false,
          bone: haloJoint,
          group: "halo",
        }),
        2.1,
      );
      // Basalt floating shard orbiting just outside major spikes
      if (major) {
        b.part(new THREE.OctahedronGeometry(0.055, 0), BASALT_PLATE, {
          bone: haloJoint,
          frame: spoke.moved([0, len + 0.08, 0]),
          scale: [0.7, 1.6, 0.5],
          flat: true,
          group: "halo",
        });
      }
    },
  );

  // ---------------------------------------------------------------------------
  // 5. BILATERAL ARMS, LAYERED PAULDRONS, GAUNTLETS & MOLTEN CLAWS
  // ---------------------------------------------------------------------------
  for (const limbSet of sides) {
    const { s, side, arm, shoulder, elbow, wrist, pauldronJoint, thumb, fingers } = limbSet;

    // Inner glowing magma arm core (runs from shoulder through elbow to wrist)
    glow(
      b.sweep(arm, [0.13, 0.11, 0.15], MAGMA_ORANGE, {
        section: { ngon: 6 },
        smooth: false,
        group: `arm${side}`,
        name: `armMagmaCore${side}`,
      }),
      1.5,
    );

    // Upper-arm basalt plates encasing the magma core with open glowing seams
    const shPos = shoulder.at;
    const elPos = elbow.at;
    const wrPos = wrist.at;

    hexPrism(
      lerp(shPos, elPos, 0.12),
      lerp(shPos, elPos, 0.86),
      0.16,
      0.135,
      MOLTEN_CRUST,
      shoulder,
      `arm${side}`,
      `upperArmBasalt${side}`,
    );

    // Ornate Pauldron (multi-tiered basalt + gold filigree + erupting magma crystals)
    const pCenter = pauldronJoint.at;
    const pauldronOutline: OutlinePoint[] = [
      [-0.22, -0.06, "sharp"],
      [0.22, -0.06, "sharp"],
      [0.28, 0.08, "sharp"],
      [0.16, 0.24, "sharp"],
      [0, 0.3, "sharp"],
      [-0.16, 0.24, "sharp"],
      [-0.28, 0.08, "sharp"],
    ];

    b.extrude(pauldronOutline, {
      bone: pauldronJoint,
      at: [pCenter.x + s * 0.06, pCenter.y - 0.02, pCenter.z],
      x: [0, 0, 1],
      y: [s * 0.65, 0.76, 0],
      thickness: [0.18, 0.1],
      bevel: 0.022,
      color: BASALT_PLATE,
      group: `arm${side}`,
      name: `pauldronMain${side}`,
    });

    // Gold wing-trim framing the pauldron
    b.extrude(
      pauldronOutline.map(([x, y]) => [x * 1.07, y * 1.05, "sharp"] as OutlinePoint),
      {
        bone: pauldronJoint,
        at: [pCenter.x + s * 0.03, pCenter.y - 0.05, pCenter.z],
        x: [0, 0, 1],
        y: [s * 0.65, 0.76, 0],
        thickness: 0.04,
        bevel: 0.01,
        color: GOLD_ORNATE,
        group: `arm${side}`,
        name: `pauldronGoldRim${side}`,
      },
    );

    // Three erupting hexagonal basalt & magma crystals crowning each shoulder
    const crystalSpecs = [
      { off: [s * 0.04, 0.14, 0.0] as V3, dir: [s * 0.55, 0.85, 0.05] as V3, len: 0.34, r: 0.085 },
      { off: [s * 0.14, 0.06, 0.11] as V3, dir: [s * 0.75, 0.62, 0.25] as V3, len: 0.25, r: 0.065 },
      { off: [s * 0.14, 0.06, -0.11] as V3, dir: [s * 0.75, 0.62, -0.25] as V3, len: 0.26, r: 0.065 },
    ];
    crystalSpecs.forEach((cr, idx) => {
      const base = offset(pCenter, [1, 0, 0], cr.off[0])
        .add(new THREE.Vector3(0, cr.off[1], cr.off[2]));
      const midPt = offset(base, cr.dir, cr.len * 0.58);
      const tipPt = offset(base, cr.dir, cr.len);
      hexPrism(base, midPt, cr.r, cr.r * 0.78, BASALT_PLATE, pauldronJoint, `arm${side}`, `pauldronCrag${idx}${side}`);
      glow(
        b.spike(lerp(base, midPt, 0.8), tipPt, null, cr.r * 0.76, idx === 0 ? MAGMA_CORE : MAGMA_BRIGHT, {
          section: { ngon: 6 },
          smooth: false,
          bone: pauldronJoint,
          group: `arm${side}`,
          name: `pauldronCrystal${idx}${side}`,
        }),
        2.0,
      );
    });

    // Elbow crag spike + golden elbow cuff
    b.rod(lerp(shPos, elPos, 0.88), lerp(elPos, wrPos, 0.14), 0.15, GOLD_RIMMED, {
      section: { ngon: 6 },
      smooth: false,
      bone: elbow,
      group: `arm${side}`,
      name: `elbowGoldCuff${side}`,
    });
    b.spike(elPos, [-s * 0.3, -0.2, -1], 0.22, 0.075, BASALT_PLATE, {
      section: { ngon: 5 },
      smooth: false,
      bone: elbow,
      group: `arm${side}`,
      name: `elbowSpike${side}`,
    });

    // Massive Hulking Forearm Gauntlet (clustered hexagonal basalt columns + glowing rune tablet)
    const gauntletColumns = [
      { ang: 0, r0: 0.12, r1: 0.15, t0: 0.12, t1: 0.92, col: BASALT_PLATE },
      { ang: 65, r0: 0.11, r1: 0.135, t0: 0.16, t1: 0.88, col: BASALT_TRIM },
      { ang: -65, r0: 0.11, r1: 0.135, t0: 0.16, t1: 0.88, col: BASALT_TRIM },
      { ang: 135, r0: 0.1, r1: 0.12, t0: 0.2, t1: 0.85, col: MOLTEN_CRUST },
      { ang: -135, r0: 0.1, r1: 0.12, t0: 0.2, t1: 0.85, col: MOLTEN_CRUST },
    ];
    const forearmAxis = wrPos.clone().sub(elPos).normalize();
    const forearmUp = new THREE.Vector3(s * 0.7, 0.3, 0.6).normalize();
    const forearmSide = forearmAxis.clone().cross(forearmUp).normalize();
    const forearmNorm = forearmSide.clone().cross(forearmAxis).normalize();

    gauntletColumns.forEach((gc, idx) => {
      const rad = (gc.ang * Math.PI) / 180;
      const dir = forearmNorm
        .clone()
        .multiplyScalar(Math.cos(rad))
        .addScaledVector(forearmSide, Math.sin(rad));
      const a = lerp(elPos, wrPos, gc.t0).addScaledVector(dir, 0.095);
      const bPt = lerp(elPos, wrPos, gc.t1).addScaledVector(dir, 0.115);
      hexPrism(a, bPt, gc.r0, gc.r1, gc.col, elbow, `arm${side}`, `gauntletCol${idx}${side}`);
    });

    // Glowing magma veins running between the forearm basalt columns
    for (const ang of [32, -32, 180]) {
      const rad = (ang * Math.PI) / 180;
      const dir = forearmNorm
        .clone()
        .multiplyScalar(Math.cos(rad))
        .addScaledVector(forearmSide, Math.sin(rad));
      magmaVein(
        [
          lerp(elPos, wrPos, 0.15).addScaledVector(dir, 0.15),
          lerp(elPos, wrPos, 0.52).addScaledVector(dir, 0.175),
          lerp(elPos, wrPos, 0.88).addScaledVector(dir, 0.185),
        ],
        [0.024, 0.032],
        elbow,
        `arm${side}`,
        MAGMA_CORE,
        1.9,
      );
    }

    // Ornate golden wrist shackle / cuff with glowing Pyro sigil
    b.rod(lerp(elPos, wrPos, 0.82), lerp(elPos, wrPos, 0.98), [0.22, 0.24], GOLD_ORNATE, {
      section: { ngon: 6 },
      smooth: false,
      bone: elbow,
      group: `arm${side}`,
      name: `wristGoldShackle${side}`,
    });

    const outerNormal = forearmNorm.clone();
    glow(
      b.part(new THREE.PlaneGeometry(0.16, 0.28), "#ffffff", {
        bone: elbow,
        at: lerp(elPos, wrPos, 0.54).addScaledVector(outerNormal, 0.235),
        dir: outerNormal,
        up: forearmAxis,
        axis: "z",
        texture: RUNE_STRIP_TEX,
        group: `arm${side}`,
        name: `gauntletRune${side}`,
      }),
      1.8,
    );

    // Hand Backplate & Knuckle Guard
    b.frustumBox(
      wrPos,
      [wrPos.x + s * 0.06, wrPos.y - 0.08, wrPos.z + 0.02],
      [0.28, 0.22],
      [0.32, 0.26],
      {
        bone: wrist,
        color: BASALT_PLATE,
        group: `hand${side}`,
        name: `handBackplate${side}`,
      },
    );

    // Glowing molten palm core
    glow(
      b.part(new THREE.SphereGeometry(0.11, 8, 6), MAGMA_CORE, {
        bone: wrist,
        at: [wrPos.x - s * 0.02, wrPos.y - 0.06, wrPos.z + 0.02],
        flat: true,
        group: `hand${side}`,
        name: `palmMagmaCore${side}`,
      }),
      2.0,
    );

    // Build thumb & 3 fingers: basalt proximal segment + glowing molten claw tip
    const allDigits = [thumb, ...fingers];
    allDigits.forEach((dChain, dIdx) => {
      const rBase = dIdx === 0 ? 0.058 : 0.064;
      b.sweep(dChain, [rBase, rBase * 0.82, rBase * 0.35], BASALT_PLATE, {
        section: { ngon: 5 },
        smooth: false,
        skin: "rigid",
        bands: [
          [0.55, BASALT_PLATE],
          [0.68, GOLD_ORNATE],
          [1.0, MAGMA_BRIGHT],
        ],
        caps: { start: "round", end: "point" },
        group: `hand${side}`,
        name: `digitSweep${dIdx}${side}`,
      });

      const tipJoint = dChain.joints[1];
      const tipEnd = dChain.path.at(1);
      glow(
        b.spike(tipJoint.at, tipEnd, null, rBase * 0.72, MAGMA_CORE, {
          section: { ngon: 5 },
          smooth: false,
          bone: tipJoint,
          group: `hand${side}`,
          name: `clawTip${dIdx}${side}`,
        }),
        2.0,
      );
    });
  }

  // ---------------------------------------------------------------------------
  // 6. PILLAR LEGS, KNEE CRAGS & PLANTED BASALT HOOF-FEET (Touch y = 0)
  // ---------------------------------------------------------------------------
  for (const limbSet of sides) {
    const { s, side, leg, hip, knee, ankle, toes } = limbSet;

    // Inner glowing magma leg core
    glow(
      b.sweep(leg, [0.15, 0.13, 0.16], MAGMA_ORANGE, {
        section: { ngon: 6 },
        smooth: false,
        group: `leg${side}`,
        name: `legMagmaCore${side}`,
      }),
      1.4,
    );

    const hPos = hip.at;
    const kPos = knee.at;
    const aPos = ankle.at;

    // Thigh hexagonal basalt armor casing
    hexPrism(
      lerp(hPos, kPos, 0.08),
      lerp(hPos, kPos, 0.88),
      0.19,
      0.16,
      BASALT_PLATE,
      hip,
      `leg${side}`,
      `thighBasalt${side}`,
    );

    // Outer thigh secondary basalt column + gold band
    hexPrism(
      [hPos.x + s * 0.11, hPos.y - 0.06, hPos.z + 0.02],
      [kPos.x + s * 0.1, kPos.y + 0.08, kPos.z + 0.02],
      0.1,
      0.085,
      BASALT_TRIM,
      hip,
      `leg${side}`,
      `thighOuterCol${side}`,
    );
    b.rod(lerp(hPos, kPos, 0.44), lerp(hPos, kPos, 0.56), 0.2, GOLD_ORNATE, {
      section: { ngon: 6 },
      smooth: false,
      bone: hip,
      group: `leg${side}`,
      name: `thighGoldBand${side}`,
    });

    // Ornate Golden & Basalt Knee Poleyn with glowing Pyro crystal
    const kneeOutline: OutlinePoint[] = [
      [-0.13, -0.1, "sharp"],
      [0.13, -0.1, "sharp"],
      [0.16, 0.05, "sharp"],
      [0, 0.2, "sharp"],
      [-0.16, 0.05, "sharp"],
    ];
    b.extrude(kneeOutline, {
      bone: knee,
      at: [kPos.x, kPos.y + 0.02, kPos.z + 0.16],
      x: [1, 0, 0],
      y: [0, 0.96, -0.28],
      thickness: 0.09,
      bevel: 0.015,
      color: GOLD_RIMMED,
      group: `leg${side}`,
      name: `kneePoleyn${side}`,
    });
    glow(
      b.spike([kPos.x, kPos.y + 0.05, kPos.z + 0.19], [0, 0.45, 1], 0.14, 0.055, MAGMA_CORE, {
        section: { ngon: 4 },
        smooth: false,
        bone: knee,
        group: `leg${side}`,
        name: `kneePyroSpike${side}`,
      }),
      2.0,
    );

    // Massive Columnar Basalt Greave (lower leg pillar)
    hexPrism(
      lerp(kPos, aPos, 0.1),
      lerp(kPos, aPos, 0.94),
      0.165,
      0.21,
      BASALT_PLATE,
      knee,
      `leg${side}`,
      `shinGreaveMain${side}`,
    );

    // Clustered basalt pillars around the lower shin & ankle
    const shinPillars = [
      { dx: s * 0.13, dz: 0.05, h0: 0.25, h1: 0.92, r0: 0.085, r1: 0.105 },
      { dx: s * 0.12, dz: -0.09, h0: 0.32, h1: 0.94, r0: 0.08, r1: 0.095 },
      { dx: -s * 0.11, dz: 0.04, h0: 0.35, h1: 0.92, r0: 0.075, r1: 0.09 },
    ];
    shinPillars.forEach((sp, idx) => {
      hexPrism(
        lerp(kPos, aPos, sp.h0).add(new THREE.Vector3(sp.dx, 0, sp.dz)),
        lerp(kPos, aPos, sp.h1).add(new THREE.Vector3(sp.dx * 1.1, 0, sp.dz)),
        sp.r0,
        sp.r1,
        MOLTEN_CRUST,
        knee,
        `leg${side}`,
        `shinSubCol${idx}${side}`,
      );
    });

    // Glowing magma fissure down the front of each shin greave
    magmaVein(
      [
        [kPos.x, kPos.y - 0.06, kPos.z + 0.16],
        [lerp(kPos, aPos, 0.55).x, lerp(kPos, aPos, 0.55).y, lerp(kPos, aPos, 0.55).z + 0.19],
        [aPos.x, aPos.y + 0.06, aPos.z + 0.21],
      ],
      [0.025, 0.035],
      knee,
      `leg${side}`,
      MAGMA_CORE,
      1.9,
    );

    // Golden ankle shackle ring
    b.rod(
      [aPos.x, aPos.y + 0.05, aPos.z],
      [aPos.x, aPos.y + 0.13, aPos.z],
      [0.24, 0.22],
      GOLD_ORNATE,
      {
        section: { ngon: 6 },
        smooth: false,
        bone: ankle,
        group: `leg${side}`,
        name: `ankleGoldRing${side}`,
      },
    );

    // Planted Foot Base Block (rests squarely on y = 0.0)
    b.frustumBox(
      [aPos.x, 0.0, aPos.z - 0.02],
      [aPos.x, 0.19, aPos.z + 0.02],
      [0.38, 0.42],
      [0.32, 0.34],
      {
        bone: ankle,
        color: BASALT_PLATE,
        group: `leg${side}`,
        name: `footBaseBlock${side}`,
      },
    );

    // Heel basalt spur resting on y = 0
    b.frustumBox(
      [aPos.x, 0.0, aPos.z - 0.18],
      [aPos.x, 0.12, aPos.z - 0.14],
      [0.22, 0.18],
      [0.16, 0.14],
      {
        bone: ankle,
        color: OBSIDIAN_CEL,
        group: `leg${side}`,
        name: `heelSpur${side}`,
      },
    );

    // Three Articulated Basalt & Magma Toe Claws planted at y = 0
    const toeDirs: V3[] = [
      [-s * 0.15, 0, 1],
      [0, 0, 1],
      [s * 0.2, 0, 1],
    ];
    toes.forEach((toeJoint, tIdx) => {
      const tOrigin = toeJoint.at;
      const dir = toeDirs[tIdx];
      // Basalt toe block touching y = 0
      b.frustumBox(
        [tOrigin.x, 0.0, tOrigin.z + 0.04],
        [tOrigin.x, 0.12, tOrigin.z + 0.02],
        [0.11, 0.18],
        [0.09, 0.14],
        {
          bone: toeJoint,
          color: BASALT_TRIM,
          group: `leg${side}`,
          name: `toeBlock${tIdx}${side}`,
        },
      );
      // Glowing molten claw tip projecting forward along the floor
      glow(
        b.spike(
          [tOrigin.x, 0.055, tOrigin.z + 0.09],
          [dir[0], -0.18, dir[2]],
          0.13,
          0.046,
          MAGMA_BRIGHT,
          {
            section: { ngon: 4 },
            smooth: false,
            bone: toeJoint,
            group: `leg${side}`,
            name: `toeClaw${tIdx}${side}`,
          },
        ),
        1.8,
      );
    });
  }

  // ---------------------------------------------------------------------------
  // 7. ELEMENTAL PYRO FLAME CARDS (Erupting from Vents, Shoulders & Crown)
  // ---------------------------------------------------------------------------
  const flameFrames = [
    // Upper back vents
    frame([0.38, 2.38, -0.44], [0.25, 1, -0.35]),
    frame([-0.38, 2.38, -0.44], [-0.25, 1, -0.35]),
    // Pauldron crests
    frame([0.74, 2.32, 0.02], [0.55, 0.85, 0]),
    frame([-0.74, 2.32, 0.02], [-0.55, 0.85, 0]),
    // Crown & neck furnace wisps
    frame([0, 2.48, 0.16], [0, 1, -0.25]),
    frame([0.22, 2.16, 0.26], [0.4, 0.9, 0.2]),
    frame([-0.22, 2.16, 0.26], [-0.4, 0.9, 0.2]),
    // Forearm vents
    frame([1.02, 1.54, 0.12], [0.6, 0.8, -0.2]),
    frame([-1.02, 1.54, 0.12], [-0.6, 0.8, -0.2]),
  ];

  glow(
    b.cards(flameFrames, FLAME_CARD_TEX, {
      size: [0.22, 0.42],
      lean: 12,
      bend: 22,
      cross: true,
      vary: 0.22,
      spin: 25,
      rng: rng(108),
      color: PYRO_GOLD,
      group: "flames",
      name: "pyroFlameWisps",
    }),
    2.0,
  );

  return b.root;
}
