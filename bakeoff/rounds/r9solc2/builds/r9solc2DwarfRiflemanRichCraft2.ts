import * as THREE from "three";
import {
  createBuilder,
  aim,
  frame,
  catmull,
  bezier,
  rng,
  svg,
  paint,
  grain,
  mottle,
  mix,
  noise,
} from "../../../../src/index";
import type { Fill, Joint, PointInput } from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Borin Brassbore — Mountain Watch",
  description:
    "A stout, broad-shouldered dwarven rifleman with a copper-red braided beard, green mountain hood, ram-emblazoned armor and an enormous engraved blunderbuss. Built as a riggable, low-poly fantasy puppet on a snowy mountain outpost base.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Borin_Brassbore", paintSize: 2048 });
  const random = rng(7419);

  // A deliberately tight, warm/cool palette: cold steel, pine cloth, hot copper hair.
  const C = {
    ink: "#252733",
    dark: "#30343b",
    leather: "#543724",
    leatherLight: "#98603b",
    stitch: "#dcc391",
    gold: "#d2a957",
    goldLight: "#f5d28a",
    green: "#355944",
    greenLight: "#577751",
    greenDark: "#233e36",
    skin: "#ce9277",
    skinLight: "#efb695",
    skinDark: "#a96353",
    pink: "#ce8171",
    beard: "#b74e25",
    beardLight: "#e18b3c",
    beardDark: "#76381f",
    snow: "#e5eef0",
    snowShadow: "#abbfc9",
    turquoise: "#84dce6",
  };

  const STEEL = paint((p, n) => {
    const light = Math.max(0, n.dot(new THREE.Vector3(0.3, 0.8, 0.5)));
    return mix("#465464", "#c2d0d5",
      0.22 + light * 0.65 + (noise(p, 0.19, 11) - 0.5) * 0.1);
  });
  const IRON = paint((p, n) =>
    mix("#222b37", "#596879",
      0.24 + Math.max(0, n.y) * 0.4 + noise(p, 0.24, 15) * 0.12));
  const BRASS = paint((p, n) =>
    mix("#95632e", "#f2cd79",
      0.38 + Math.max(0, n.y) * 0.43 + noise(p, 0.16, 9) * 0.1));
  const COPPER = metal("copper", { polish: 0.25, tarnish: 0.16 });
  const WOOD = grain("#613921", "#845031", { size: 0.025, axis: "z", seed: 18 });
  const LEATHER = paint((p, n) =>
    mix("#493025", "#78503a",
      0.25 + Math.max(0, n.y) * 0.42 + noise(p, 0.12, 7) * 0.15));
  const HAIR = grain("#b54e24", "#c5622b", { size: 0.022, seed: 8 });
  const HAIR_LIGHT = grain("#d2752f", "#e18b39", { size: 0.022, seed: 8 });
  const STONE = mottle("#52616d", "#667580", { size: 0.34, seed: 13 });
  const SKIN = paint((p, n) => {
    const warm = 0.28 + 0.35 * Math.max(0, n.y) + 0.12 * noise(p, 0.07, 3);
    return mix("#b87765", "#efb99b", warm);
  });
  const CLOTH = paint((p, n) => {
    const weave =
      Math.sin(p.x * 1500) * Math.sin(p.y * 1500) * 0.018;
    const wear = (noise(p, 0.11, 23) - 0.5) * 0.065;
    return mix(
      "#234334",
      "#658252",
      0.38 + Math.max(0, n.y) * 0.3 + wear + weave,
    );
  });

  // All joints are laid out before the puppet's geometry.
  const root = b.joint("root", { at: [0, 0, 0], role: "spine" });
  const hips = b.joint("hips", {
    parent: root,
    at: [0, 0.79, 0],
    dir: [0, 1, 0],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [
      [0, 0.79, 0],
      [0, 1.04, -0.015],
      [0, 1.25, 0],
    ],
    { parent: hips, names: ["spine1", "chest", "neckBase"], role: "spine" },
  );
  const neck = b.joint("neck", {
    parent: spine.tip!,
    at: [0, 1.3, 0.015],
    dir: [0, 1, 0],
    role: "neck",
  });
  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.465, 0.035],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.36, 0.125],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const legs: Record<string, ReturnType<typeof b.chain>> = {};
  const arms: Record<string, ReturnType<typeof b.chain>> = {};
  const fingers: Record<string, ReturnType<typeof b.chain>[]> = {};
  const thumbs: Record<string, ReturnType<typeof b.chain>> = {};

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    legs[side] = b.chain(
      `leg${side}`,
      [
        [s * 0.225, 0.795, 0],
        [s * 0.27, 0.525, 0.035],
        [s * 0.28, 0.275, 0.035],
      ],
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
        contact: [s * 0.28, 0.12, 0.11],
      },
    );
    arms[side] = b.chain(
      `arm${side}`,
      [
        [s * 0.415, 1.225, 0],
        [s * 0.7, 1.115, 0.005],
        [s * 0.91, 1.065, 0.045],
        [s * 0.985, 1.04, 0.085],
      ],
      {
        parent: spine.joints[1],
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
        role: "arm",
      },
    );
    const hand = arms[side].tip!;
    fingers[side] = [];
    for (let i = 0; i < 4; i++) {
      const z = -0.006 + i * 0.047;
      fingers[side].push(
        b.chain(
          `finger${side}${i + 1}`,
          [
            [s * 1.005, 1.018, z],
            [s * 1.055, 0.969, z + 0.006],
            [s * 1.035, 0.932, z + 0.024],
          ],
          {
            parent: hand,
            names: [`finger${side}${i + 1}A`, `finger${side}${i + 1}B`],
            role: "digit",
          },
        ),
      );
    }
    thumbs[side] = b.chain(
      `thumb${side}`,
      [
        [s * 0.96, 1.048, 0.155],
        [s * 0.985, 1.005, 0.205],
        [s * 1.028, 0.983, 0.2],
      ],
      { parent: hand, role: "digit", count: 2 },
    );
  }

  type P = number[];
  function box(
    at: PointInput,
    size: P,
    color: Fill,
    bone: Joint = root,
    rotation: P = [0, 0, 0],
    name?: string,
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at, bone, rotation, name,
    });
  }
  function ell(
    at: PointInput,
    size: P,
    color: Fill,
    bone: Joint = root,
    rotation: P = [0, 0, 0],
    name?: string,
  ) {
    return b.part(new THREE.SphereGeometry(1, 10, 7), color, {
      at, bone, scale: size, rotation, flat: true, name,
    });
  }
  function cylinder(
    at: PointInput,
    r: number,
    length: number,
    color: Fill,
    bone: Joint = root,
    dir: P = [0, 1, 0],
    top = r,
    segments = 10,
  ) {
    return b.part(new THREE.CylinderGeometry(top, r, length, segments, 1), color, {
      at, bone, dir, flat: true,
    });
  }
  function torus(
    at: PointInput,
    r: number,
    tube: number,
    color: Fill,
    bone: Joint = root,
    dir: P = [0, 0, 1],
  ) {
    return b.part(new THREE.TorusGeometry(r, tube, 5, 14), color, {
      at, bone, dir, axis: "z", flat: true,
    });
  }
  function line(
    a: PointInput,
    c: PointInput,
    radius: number,
    color: Fill,
    bone: Joint = root,
  ) {
    return b.rod(a, c, radius, { color, bone, sides: 6 });
  }

  // Eight little drawings, used across the larger primitive silhouettes.
  const eyeTexture = svg(`
    <svg viewBox="0 0 100 70">
      <path d="M4 36 Q20 7 54 11 Q83 12 97 33 Q80 59 49 61 Q18 60 4 36Z"
        fill="#32252b"/>
      <path d="M12 35 Q29 17 53 20 Q77 18 89 33 Q73 52 49 52 Q24 52 12 35Z"
        fill="#fff0d7"/>
      <ellipse cx="51" cy="35" rx="17" ry="20" fill="#235876"/>
      <path d="M36 36 Q52 53 67 35 L65 49 Q49 60 37 47Z" fill="#70d9ed"/>
      <ellipse cx="52" cy="34" rx="8" ry="17" fill="#152934"/>
      <path d="M11 30 Q47 8 91 29" fill="none" stroke="#4d3430" stroke-width="7"/>
      <path d="M37 25 L44 21 L47 29 L40 32Z" fill="#ffffff"/>
      <circle cx="62" cy="44" r="3" fill="#dbfbff"/>
    </svg>`, { size: 384 });

  const ramTexture = svg(`
    <svg viewBox="0 0 128 128">
      <path d="M64 5 L113 27 L108 86 L64 121 L20 86 L15 27Z"
        fill="#223e45" stroke="#e8c57b" stroke-width="7"/>
      <path d="M47 58 C14 57 20 21 43 27 C61 31 52 51 40 46
               M81 58 C114 57 108 21 85 27 C67 31 76 51 88 46"
        fill="none" stroke="#e7c079" stroke-width="12" stroke-linecap="square"/>
      <path d="M42 48 L53 43 L64 49 L75 43 L86 48 L80 77 L64 97 L48 77Z"
        fill="#e7c079" stroke="#142a31" stroke-width="4"/>
      <path d="M50 61 L60 65 M78 61 L68 65 M59 83 L69 83"
        stroke="#273c3e" stroke-width="5" fill="none"/>
      <path d="M60 51 L64 59 L68 51 M64 69 L60 77 L68 77Z"
        fill="#fff1bc"/>
    </svg>`, { size: 256 });

  const knotTexture = svg(`
    <svg viewBox="0 0 256 64">
      <rect width="256" height="64" fill="#294438"/>
      <path d="M0 7H256 M0 57H256" stroke="#d4b270" stroke-width="4"/>
      <path d="M-32 32 L0 12 L32 32 L64 52 L96 32 L128 12 L160 32 L192 52 L224 32 L256 12 L288 32
               M-32 32 L0 52 L32 32 L64 12 L96 32 L128 52 L160 32 L192 12 L224 32 L256 52 L288 32"
        fill="none" stroke="#142e2a" stroke-width="12"/>
      <path d="M-32 32 L0 12 L32 32 L64 52 L96 32 L128 12 L160 32 L192 52 L224 32 L256 12 L288 32
               M-32 32 L0 52 L32 32 L64 12 L96 32 L128 52 L160 32 L192 12 L224 32 L256 52 L288 32"
        fill="none" stroke="#d7b773" stroke-width="5"/>
    </svg>`, { size: 512 });

  const runeTexture = svg(`
    <svg viewBox="0 0 128 128">
      <path d="M15 15H113V113H15Z" fill="#6b432b" stroke="#d4ae69" stroke-width="6"/>
      <path d="M26 25H102V103H26Z" fill="none" stroke="#34271e" stroke-width="3"/>
      <path d="M43 83V39L64 58L85 39V83 M43 69L64 88L85 69 M64 58V88"
        fill="none" stroke="#edcf8b" stroke-width="7" stroke-linejoin="miter"/>
      <path d="M32 18v9 M64 18v9 M96 18v9 M32 101v9 M64 101v9 M96 101v9"
        stroke="#f6d9a0" stroke-width="3"/>
    </svg>`, { size: 192 });

  const engravingTexture = svg(`
    <svg viewBox="0 0 128 256">
      <path d="M16 8H112V248H16Z" fill="#465766" stroke="#c6d2d3" stroke-width="5"/>
      <path d="M25 22H103V234H25Z" fill="none" stroke="#26333d" stroke-width="3"/>
      <path d="M64 26L88 53L64 80L40 53Z M64 176L88 203L64 230L40 203Z"
        fill="none" stroke="#d7b26a" stroke-width="5"/>
      <path d="M64 81V175 M64 102C25 82 29 138 58 126
               M64 102C103 82 99 138 70 126
               M64 154C24 171 30 119 58 138
               M64 154C104 171 98 119 70 138"
        fill="none" stroke="#cbd6d5" stroke-width="4"/>
      <path d="M64 112L76 128L64 144L52 128Z" fill="#c5a969"/>
    </svg>`, { size: 384 });

  const plaqueTexture = svg(`
    <svg viewBox="0 0 512 160">
      <path d="M17 8H495L506 80L495 152H17L6 80Z"
        fill="#263d40" stroke="#d3b173" stroke-width="9"/>
      <path d="M28 24H484 M28 136H484" stroke="#708f8d" stroke-width="3"/>
      <text x="256" y="75" text-anchor="middle" font-family="Georgia,serif"
        font-weight="bold" font-size="47" letter-spacing="5" fill="#f0d49b">IRONHOLD</text>
      <text x="256" y="117" text-anchor="middle" font-family="Georgia,serif"
        font-weight="bold" font-size="24" letter-spacing="7" fill="#b7ced0">MOUNTAIN WATCH</text>
    </svg>`, { size: 768 });

  const kegTexture = svg(`
    <svg viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="59" fill="#d5b67e" stroke="#503527" stroke-width="7"/>
      <circle cx="64" cy="64" r="48" fill="none" stroke="#6d4930" stroke-width="3"/>
      <path d="M34 48H79V88H34Z M79 52H92V77H79"
        fill="#765033" stroke="#503527" stroke-width="6"/>
      <path d="M32 47Q35 27 46 35Q52 22 63 34Q76 28 81 47Z" fill="#fff0c4"/>
      <path d="M46 56V79 M60 56V79" stroke="#e8ce94" stroke-width="5"/>
      <path d="M36 101H89" stroke="#503527" stroke-width="5"/>
    </svg>`, { size: 192 });

  const scarTexture = svg(`
    <svg viewBox="0 0 128 64">
      <path d="M18 46L110 16" stroke="#975447" stroke-width="6" fill="none"/>
      <path d="M19 51L110 22" stroke="#f3b397" stroke-width="4" fill="none"/>
      <path d="M37 32L42 46 M59 24L64 38 M81 17L86 31"
        stroke="#a76556" stroke-width="4"/>
    </svg>`, { size: 192 });

  function drawing(
    at: PointInput,
    width: number,
    height: number,
    texture: THREE.Texture,
    bone: Joint = root,
    dir: P = [0, 0, 1],
    up: P = [0, 1, 0],
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at, bone, texture, dir, up, axis: "z",
    });
  }

  // The cold, shallow display plinth leaves the silhouette open from every side.
  cylinder([0, 0.055, 0], 1.22, 0.11, IRON, root, [0, 1, 0], 1.22, 12)
    .mesh.scale.z *= 0.74;
  cylinder([0, 0.108, 0], 1.2, 0.025, STONE, root, [0, 1, 0], 1.17, 12)
    .mesh.scale.z *= 0.74;

  for (let i = 0; i < 13; i++) {
    const a = i * Math.PI * 2 / 13;
    const x = Math.cos(a) * 1.06;
    const z = Math.sin(a) * 0.73;
    if (z > 0.62 && Math.abs(x) < 0.5) continue;
    ell([x, 0.12, z], [0.2, 0.065, 0.13], STONE, root, [0, -a * 180 / Math.PI, 0]);
    if (i % 3 !== 1) {
      ell([x, 0.181, z], [0.17, 0.028, 0.105], C.snow, root);
    }
  }
  for (let i = 0; i < 15; i++) {
    const x = (random() - 0.5) * 1.95;
    const z = (random() - 0.5) * 1.32;
    if (Math.abs(x) < 0.46 && z > -0.18 && z < 0.4) continue;
    ell([x, 0.133, z], [0.075 + random() * 0.1, 0.017, 0.045 + random() * 0.06], C.snow);
  }
  box([0, 0.12, 0.875], [0.67, 0.185, 0.06], BRASS, root);
  drawing([0, 0.12, 0.908], 0.64, 0.18, plaqueTexture, root);
  for (const s of [1, -1]) {
    ell([s * 0.316, 0.12, 0.912], [0.009, 0.009, 0.005], C.goldLight);
  }

  // Boots, short sturdy legs, and skirt panels.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = legs[side];
    const foot = leg.tip!;
    b.sweep(leg, [0.145, 0.126, 0.105], {
      color: CLOTH, section: { ngon: 8 }, caps: "flat",
    });

    box([s * 0.28, 0.158, 0.135], [0.3, 0.075, 0.405], IRON, foot);
    box([s * 0.28, 0.199, 0.135], [0.305, 0.027, 0.408], C.leatherLight, foot);
    ell([s * 0.28, 0.285, 0.12], [0.153, 0.117, 0.204], LEATHER, foot);
    cylinder([s * 0.28, 0.37, 0.025], 0.128, 0.2, LEATHER, foot, [0, 1, 0], 0.145, 8);
    cylinder([s * 0.28, 0.452, 0.025], 0.151, 0.052, C.leatherLight, foot, [0, 1, 0], 0.15, 8);
    b.frustumBox(
      [s * 0.28, 0.294, 0.16],
      [s * 0.28, 0.272, 0.335],
      [0.305, 0.155],
      [0.275, 0.115],
      { color: STEEL, bone: foot },
    );
    box([s * 0.28, 0.316, 0.339], [0.245, 0.018, 0.018], BRASS, foot);
    line(
      [s * 0.28, 0.367, 0.164],
      [s * 0.28, 0.331, 0.325],
      0.009,
      BRASS,
      foot,
    );
    for (const dx of [-0.085, 0.085]) {
      ell([s * 0.28 + dx, 0.326, 0.304], [0.014, 0.014, 0.009], C.goldLight, foot);
    }
    box([s * 0.28, 0.395, 0.153], [0.23, 0.038, 0.032], C.leather, foot);
    box([s * 0.28, 0.395, 0.176], [0.085, 0.066, 0.018], BRASS, foot);
    box([s * 0.28, 0.395, 0.189], [0.047, 0.033, 0.012], C.leather, foot);

    const knee = leg.joints[1];
    ell([s * 0.27, 0.555, 0.13], [0.153, 0.125, 0.068], IRON, knee);
    b.extrude(
      [[-0.12, 0.065], [0, 0.105], [0.12, 0.065], [0.09, -0.07], [0, -0.125], [-0.09, -0.07]],
      { at: [s * 0.27, 0.55, 0.181], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.04, bevel: 0.009, color: STEEL, bone: knee },
    );
    box([s * 0.27, 0.555, 0.208], [0.1, 0.035, 0.015], BRASS, knee);
    for (const dx of [-0.078, 0.078]) {
      ell([s * 0.27 + dx, 0.59, 0.207], [0.012, 0.012, 0.008], C.goldLight, knee);
    }
  }

  const torso = b.loft(
    [
      { at: [0, 0.775, 0], w: 0.6, h: 0.39 },
      { at: [0, 0.91, -0.005], w: 0.66, h: 0.46 },
      { at: [0, 1.1, -0.015], w: 0.72, h: 0.47 },
      { at: [0, 1.245, 0], w: 0.67, h: 0.39 },
    ],
    { bone: spine, color: CLOTH, sides: 10, caps: "flat" },
  );
  cylinder([0, 1.278, 0.015], 0.13, 0.1, SKIN, neck, [0, 1, 0], 0.13, 8);

  for (const s of [1, -1]) {
    b.extrude(
      [[-0.145, 0.15], [0.13, 0.15], [0.17, -0.12], [0.06, -0.19], [-0.13, -0.15]],
      {
        at: [s * 0.18, 0.765, 0.207],
        x: [1, 0, 0], y: [0, 1, 0],
        thickness: 0.045, bevel: 0.008, color: CLOTH, bone: hips,
      },
    );
    line([s * 0.31, 0.87, 0.234], [s * 0.33, 0.645, 0.234], 0.008, C.gold, hips);
  }
  drawing([0, 0.667, 0.242], 0.27, 0.065, knotTexture, hips);
  box([0, 0.866, 0.035], [0.715, 0.105, 0.48], LEATHER, hips);
  box([0, 0.866, 0.283], [0.2, 0.143, 0.045], BRASS, hips);
  box([0, 0.866, 0.31], [0.137, 0.083, 0.019], IRON, hips);
  drawing([0, 0.866, 0.324], 0.1, 0.087, runeTexture, hips);
  for (const s of [1, -1]) {
    for (let i = 0; i < 2; i++) {
      box([s * (0.205 + i * 0.075), 0.868, 0.278], [0.025, 0.11, 0.025], C.leatherLight, hips);
      ell([s * (0.205 + i * 0.075), 0.898, 0.297], [0.009, 0.009, 0.006], C.goldLight, hips);
    }
  }

  // A heavy split cloak, with a separate inset rear panel and woven edging.
  b.extrude(
    [[-0.38, 0.32], [-0.48, 0.2], [-0.53, -0.34], [-0.15, -0.4],
     [0, -0.31], [0.15, -0.4], [0.53, -0.34], [0.48, 0.2], [0.38, 0.32]],
    {
      at: [0, 0.96, -0.245], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.055, bevel: 0.01, color: CLOTH, bone: spine.joints[1],
    },
  );
  for (const s of [1, -1]) {
    b.slab(
      [[s * 0.34, 1.245, -0.28], [s * 0.48, 1.13, -0.281],
       [s * 0.5, 0.64, -0.282], [s * 0.17, 0.59, -0.282]],
      { thickness: 0.018, color: C.greenDark, bone: spine.joints[1] },
    );
    line([s * 0.45, 1.15, -0.286], [s * 0.49, 0.64, -0.286], 0.012, C.gold, spine.joints[1]);
  }
  drawing([0, 0.87, -0.282], 0.31, 0.34, ramTexture, spine.joints[1], [0, 0, -1]);
  drawing([0, 0.617, -0.292], 0.82, 0.085, knotTexture, spine.joints[1], [0, 0, -1]);

  // Broad pauldrons: a single readable shell, then rims, layered lames and insignia.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = arms[side];
    const shoulder = arm.joints[0];
    b.sweep(arm, [0.14, 0.112, 0.085, 0.075], {
      color: CLOTH, sides: 8, caps: "flat",
    });

    ell([s * 0.455, 1.258, 0], [0.245, 0.175, 0.245], C.leather, shoulder);
    ell([s * 0.465, 1.291, 0], [0.25, 0.151, 0.25], BRASS, shoulder);
    const shoulderShell = ell(
      [s * 0.467, 1.318, 0],
      [0.229, 0.137, 0.232],
      STEEL,
      shoulder,
    );
    const shoulderSurface = b.surface(shoulderShell);
    for (const azimuth of [-125, -65, 0, 65, 125, 180]) {
      const hit = shoulderSurface
        .around([s * 0.467, 1.318, 0])
        .at(azimuth, 28);
      if (hit) {
        b.stick(
          new THREE.CylinderGeometry(0.014, 0.018, 0.012, 6),
          BRASS,
          hit,
          { embed: 0.35, bone: shoulder },
        );
      }
    }
    const crownRib = shoulderSurface.drape(
      [
        [s * 0.467, 1.37, -0.21],
        [s * 0.467, 1.48, -0.1],
        [s * 0.467, 1.48, 0.075],
        [s * 0.467, 1.37, 0.21],
      ],
      { lift: 0.006 },
    );
    b.sweep(crownRib, 0.011, {
      color: BRASS,
      bone: shoulder,
      sides: 5,
    });

    for (let i = 0; i < 3; i++) {
      const x = s * (0.56 + i * 0.052);
      const y = 1.257 - i * 0.061;
      box([x, y, 0.005], [0.15, 0.098, 0.365 - i * 0.035], IRON, shoulder, [0, 0, -s * 18]);
      box([x, y + 0.018, 0.012], [0.158, 0.073, 0.35 - i * 0.035], STEEL, shoulder, [0, 0, -s * 18]);
      line([x - s * 0.06, y - 0.035, 0.174 - i * 0.017],
           [x + s * 0.06, y - 0.035, 0.174 - i * 0.017], 0.009, BRASS, shoulder);
    }
    b.extrude(
      [[-0.108, 0.087], [0, 0.125], [0.108, 0.087],
       [0.096, -0.055], [0, -0.13], [-0.096, -0.055]],
      {
        at: [s * 0.458, 1.306, 0.249],
        x: [1, 0, 0], y: [0, 1, 0],
        thickness: 0.06, bevel: 0.006,
        color: BRASS, bone: shoulder,
        name: `ram_shield_${side}`,
      },
    );
    drawing([s * 0.458, 1.307, 0.283], 0.184, 0.213, ramTexture, shoulder);
    for (const hornSide of [1, -1]) {
      const cx = s * 0.458;
      b.sweep(
        catmull([
          [cx + hornSide * 0.035, 1.339, 0.295],
          [cx + hornSide * 0.061, 1.372, 0.299],
          [cx + hornSide * 0.085, 1.351, 0.3],
          [cx + hornSide * 0.079, 1.318, 0.302],
          [cx + hornSide * 0.055, 1.319, 0.304],
          [cx + hornSide * 0.057, 1.338, 0.306],
        ]),
        [0.012, 0.014, 0.013, 0.011, 0.008, 0.003],
        {
          color: BRASS,
          bone: shoulder,
          sides: 6,
          caps: "flat",
        },
      );
    }
    for (const dx of [-0.073, 0.073]) {
      ell([s * 0.46 + dx, 1.381, 0.174], [0.017, 0.017, 0.012], C.goldLight, shoulder);
    }
    b.spike([s * 0.555, 1.405, -0.055], [s * 0.27, 0.92, -0.08], 0.14, 0.05, {
      color: C.stitch, bone: shoulder, sides: 5,
    });

    const elbow = arm.joints[1];
    ell([s * 0.711, 1.108, 0.005], [0.108, 0.11, 0.112], LEATHER, elbow);
    cylinder([s * 0.718, 1.115, 0.1], 0.073, 0.036, IRON, elbow, [0, 0, 1], 0.073, 8);
    cylinder([s * 0.718, 1.115, 0.123], 0.043, 0.018, BRASS, elbow, [0, 0, 1], 0.043, 8);
    line([s * 0.745, 1.079, 0.114], [s * 0.88, 1.045, 0.142], 0.06, STEEL, elbow);
    line([s * 0.752, 1.155, -0.063], [s * 0.875, 1.122, -0.03], 0.045, LEATHER, elbow);
    for (const t of [0.59, 0.81]) {
      const p = arm.at(t).at;
      cylinder(p, 0.111, 0.042, C.leatherLight, elbow, [s, -0.24, 0.17], 0.111, 8);
      box([p.x, p.y + 0.027, p.z + 0.102], [0.046, 0.052, 0.02], BRASS, elbow, [0, 0, -s * 13]);
    }

    const hand = arm.tip!;
    ell([s * 0.984, 1.025, 0.083], [0.092, 0.079, 0.115], LEATHER, hand);
    box([s * 0.982, 1.077, 0.082], [0.117, 0.038, 0.168], STEEL, hand, [0, 0, -s * 12]);
    for (let i = 0; i < 4; i++) {
      b.sweep(fingers[side][i], [0.025, 0.024, 0.018], {
        color: LEATHER, sides: 6, caps: "round",
      });
      ell([s * 1.027, 1.017, -0.005 + i * 0.047], [0.027, 0.019, 0.023], STEEL, hand);
    }
    b.sweep(thumbs[side], [0.031, 0.025, 0.021], { color: LEATHER, sides: 6 });
  }

  // Ammunition and field gear live beside the beard, rather than across the face.
  b.slab(
    [[0.19, 1.225, 0.232], [0.31, 1.19, 0.232],
     [0.12, 0.92, 0.276], [-0.005, 0.947, 0.276]],
    { color: LEATHER, thickness: 0.035, bone: spine.joints[1] },
  );
  for (let i = 0; i < 5; i++) {
    const x = 0.267 - i * 0.035;
    const y = 1.19 - i * 0.05;
    cylinder([x, y, 0.273], 0.02, 0.098, BRASS, spine.joints[1], [0.18, 1, 0], 0.02, 8);
    b.spike([x + 0.009, y + 0.047, 0.273], [0.18, 1, 0], 0.031, 0.02, {
      color: COPPER, bone: spine.joints[1], sides: 8,
    });
    box([x, y - 0.018, 0.292], [0.044, 0.028, 0.025], C.leatherLight, spine.joints[1], [0, 0, -10]);
  }
  for (const s of [1, -1]) {
    box([s * 0.405, 0.79, 0.065], [0.15, 0.2, 0.155], LEATHER, hips, [0, 0, s * 7]);
    box([s * 0.408, 0.863, 0.123], [0.17, 0.08, 0.055], C.leatherLight, hips, [0, 0, s * 7]);
    ell([s * 0.408, 0.826, 0.161], [0.018, 0.021, 0.01], BRASS, hips);
  }
  const hornRoute = catmull([[0.38, 0.96, -0.05], [0.5, 0.84, -0.08], [0.52, 0.69, -0.06], [0.47, 0.61, -0.015]]);
  b.sweep(hornRoute, [0.07, 0.065, 0.044, 0.01], { color: C.stitch, bone: hips, sides: 8 });
  cylinder([0.385, 0.955, -0.05], 0.073, 0.045, BRASS, hips, [0.5, -0.8, -0.1], 0.073, 8);
  line([0.335, 0.91, -0.02], [0.45, 0.82, -0.06], 0.018, LEATHER, hips);

  // Settle the face before adding the hood and beard. The head is intentionally oversized.
  const H = 1.08;
  const face = b.region({ at: [0, 1.465, 0.035], scale: H, bone: head });
  const skull = face.part(new THREE.SphereGeometry(1, 12, 9), SKIN, {
    at: [0, 0, 0],
    scale: [0.222, 0.225, 0.203],
    bone: head, flat: true, name: "broad_dwarven_skull",
  });

  for (const s of [1, -1]) {
    ell(face.p([s * 0.155, -0.04, 0.132]), [0.105, 0.1, 0.075], SKIN, head);
    ell(face.p([s * 0.236, -0.005, 0]), [0.071, 0.105, 0.049], SKIN, head, [0, 0, s * 12]);
    ell(face.p([s * 0.259, -0.005, 0.032]), [0.032, 0.063, 0.02], C.skinDark, head);
    ell(face.p([s * 0.249, -0.067, 0.037]), [0.034, 0.032, 0.026], C.skinLight, head);

    const eye = ell(
      face.p([s * 0.105, 0.05, 0.179]),
      [0.077, 0.055, 0.039],
      C.skinDark, head,
    );
    b.decal(eye, eyeTexture, {
      at: face.p([s * 0.105, 0.049, 0.214]),
      dir: [s * 0.1, 0, 1],
      size: [0.139, 0.083],
      mirror: s > 0,
      lift: 0.002,
      segments: 6,
      bone: head,
    });

    b.sweep(
      bezier(
        face.p([s * 0.035, 0.079, 0.212]),
        face.p([s * 0.104, 0.119, 0.219]),
        face.p([s * 0.192, 0.133, 0.17]),
      ),
      [0.029, 0.038, 0.006],
      { color: HAIR_LIGHT, bone: head, sides: 5, caps: "flat" },
    );
    line(face.p([s * 0.05, -0.005, 0.211]), face.p([s * 0.15, -0.017, 0.204]), 0.006, C.skinDark, head);
  }

  b.decal(skull, scarTexture, {
    at: face.p([0.174, -0.026, 0.16]),
    dir: [0.35, 0, 1],
    size: [0.088, 0.043],
    lift: 0.0025,
    bone: head,
  });
  ell(face.p([0, -0.032, 0.215]), [0.068, 0.105, 0.065], SKIN, head);
  ell(face.p([0, -0.065, 0.278]), [0.094, 0.071, 0.076], C.pink, head);
  ell(face.p([0, -0.045, 0.309]), [0.054, 0.032, 0.028], C.skinLight, head);
  for (const s of [1, -1]) {
    ell(face.p([s * 0.065, -0.086, 0.268]), [0.036, 0.038, 0.039], C.pink, head);
    ell(face.p([s * 0.052, -0.105, 0.286]), [0.021, 0.012, 0.012], C.skinDark, head);
  }
  ell([0, 1.345, 0.242], [0.132, 0.057, 0.074], SKIN, jaw);
  ell([0, 1.349, 0.32], [0.095, 0.016, 0.022], "#613a34", jaw);
  ell([0, 1.33, 0.321], [0.067, 0.014, 0.022], C.pink, jaw);

  // Hair mass first; only a handful of bold tapered locks describe the outer beard.
  b.extrude(
    [[-0.205, 0.2], [-0.24, 0.075], [-0.183, -0.09], [-0.103, -0.245],
     [0, -0.3], [0.103, -0.245], [0.183, -0.09], [0.24, 0.075], [0.205, 0.2]],
    {
      at: [0, 1.14, 0.245], x: [1, 0, 0], y: [0, 1, 0],
      thickness: [0.09, 0.145], bevel: 0.012, color: HAIR, bone: jaw,
      name: "beard_silhouette",
    },
  );

  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.213, 1.47, 0.112],
        [s * 0.224, 1.356, 0.206],
        [s * 0.212, 1.223, 0.275],
      ]),
      [0.052, 0.064, 0.027],
      { color: HAIR, bone: head, sides: 6, caps: "flat" },
    );
    for (let i = 0; i < 3; i++) {
      b.sweep(
        bezier(
          [s * (0.19 - i * 0.042), 1.31 - i * 0.015, 0.29],
          [s * (0.22 - i * 0.04), 1.18 - i * 0.02, 0.343],
          [s * (0.14 - i * 0.025), 0.99 - i * 0.055, 0.335],
        ),
        [0.047, 0.051, 0],
        { color: i % 2 ? HAIR_LIGHT : HAIR, bone: jaw, sides: 5, caps: "flat" },
      );
    }

    // Each moustache half is a stout swept shape, not a cloud of tiny hairs.
    const moustache = catmull([
      [s * 0.016, 1.375, 0.354],
      [s * 0.083, 1.393, 0.365],
      [s * 0.163, 1.361, 0.348],
      [s * 0.209, 1.319, 0.307],
      [s * 0.224, 1.34, 0.282],
    ]);
    b.sweep(moustache, [0.035, 0.052, 0.043, 0.026, 0], {
      color: HAIR_LIGHT, bone: head, sides: 6, caps: "flat",
    });
    b.sweep(
      catmull([
        [s * 0.03, 1.387, 0.383],
        [s * 0.11, 1.386, 0.402],
        [s * 0.188, 1.342, 0.373],
      ]),
      [0.009, 0.011, 0],
      { color: C.beardLight, bone: head, sides: 5, caps: "flat" },
    );
  }

  // Three interwoven braids: two crossing lozenges per course, with a dark seam.
  function beardBraid(x: number, top: number, bottom: number, z: number, width: number, courses: number) {
    b.sweep(
      [[x, top, z], [x, bottom, z + 0.025]],
      [width * 0.25, width * 0.18],
      { color: C.beardDark, bone: jaw, sides: 6, caps: "flat" },
    );
    const pitch = (top - bottom) / courses;
    for (let i = 0; i < courses; i++) {
      const y = top - pitch * (i + 0.5);
      const taper = 1 - i * 0.04;
      const w = width * taper;
      for (const side of [-1, 1]) {
        const cy = y + side * pitch * 0.19;
        const front = z + 0.047 + (side > 0 ? 0.009 : 0);
        const plait = b.extrude(
          [
            [-w * 0.46, pitch * 0.37],
            [-w * 0.22, pitch * 0.64],
            [w * 0.37, pitch * 0.05],
            [w * 0.38, -pitch * 0.31],
            [w * 0.13, -pitch * 0.53],
            [-w * 0.25, -pitch * 0.06],
          ],
          {
            at: [x, cy, front],
            x: [side, 0, 0],
            y: [0, 1, 0],
            thickness: w * 0.47,
            bevel: w * 0.075,
            color: side > 0 ? HAIR_LIGHT : HAIR,
            bone: jaw,
            name: `braid_${x < 0 ? "R" : x > 0 ? "L" : "C"}_${i}_${side > 0 ? "over" : "under"}`,
          },
        );
        const faceSign = side > 0 ? 1 : -1;
        for (const groove of [-0.075, 0.075]) {
          b.sweep(
            bezier(
              plait.local([
                -w * 0.25 + groove * w,
                pitch * 0.37,
                faceSign * w * 0.244,
              ]),
              plait.local([
                w * 0.02 + groove * w,
                pitch * 0.1,
                faceSign * w * 0.247,
              ]),
              plait.local([
                w * 0.23 + groove * w,
                -pitch * 0.25,
                faceSign * w * 0.244,
              ]),
            ),
            [0.0018, 0.0022, 0.0008],
            {
              color: groove < 0 ? C.beardDark : C.beardLight,
              bone: jaw,
              sides: 4,
              caps: "flat",
            },
          );
        }
      }
    }
    const bandY = bottom + 0.017;
    cylinder([x, bandY, z + 0.04], width * 0.62, 0.068, BRASS, jaw, [0, 1, 0], width * 0.62, 8);
    cylinder([x, bandY + 0.029, z + 0.04], width * 0.68, 0.012, C.goldLight, jaw, [0, 1, 0], width * 0.68, 8);
    cylinder([x, bandY - 0.029, z + 0.04], width * 0.68, 0.012, C.goldLight, jaw, [0, 1, 0], width * 0.68, 8);
    drawing(
      [x, bandY, z + 0.043 + width * 0.68],
      width * 0.72, 0.047, runeTexture, jaw,
    );
    b.spike([x, bottom - 0.015, z + 0.04], [0, -1, 0.13], 0.09, width * 0.48, {
      color: HAIR_LIGHT, bone: jaw, sides: 5,
    });
  }
  beardBraid(-0.146, 1.265, 1.012, 0.349, 0.081, 5);
  beardBraid(0.146, 1.265, 1.012, 0.349, 0.081, 5);
  beardBraid(0, 1.25, 0.906, 0.371, 0.1, 6);

  // Rifleman's green peaked hood: forehead clear, folded sides, thick woven lip.
  b.loft(
    [
      { at: [0, 1.365, -0.158], w: 0.33, h: 0.105 },
      { at: [0, 1.47, -0.186], w: 0.44, h: 0.115 },
      { at: [0, 1.58, -0.172], w: 0.48, h: 0.14 },
      { at: [0, 1.687, -0.128], w: 0.43, h: 0.15 },
    ],
    {
      color: CLOTH,
      bone: head,
      sides: 8,
      caps: "flat",
      name: "hood_rear_drape",
    },
  );
  const hoodShell = b.lathe(
    [[0, 0], [0.267, 0], [0.274, 0.05], [0.247, 0.151],
     [0.185, 0.236], [0.075, 0.263], [0, 0.249]],
    { at: [0, 1.628, 0.005], axis: [0, 1, -0.1], segments: 10, color: CLOTH, bone: head },
  );
  b.decal(hoodShell, knotTexture, {
    at: [0, 1.717, 0.246],
    dir: [0, 0.16, 1],
    up: [0, 1, 0],
    size: [0.39, 0.047],
    segments: 10,
    lift: 0.002,
    bone: head,
    name: "embroidered_hood_band",
  });
  b.sweep(
    catmull([[0.035, 1.847, -0.01], [0.081, 1.903, -0.025], [0.159, 1.888, -0.069], [0.209, 1.833, -0.092]]),
    [0.085, 0.074, 0.048, 0],
    { color: CLOTH, bone: head, sides: 6, caps: "flat" },
  );
  b.sweep(
    catmull([[-0.255, 1.638, 0.026], [-0.197, 1.665, 0.176], [0, 1.679, 0.22], [0.197, 1.665, 0.176], [0.255, 1.638, 0.026]]),
    0.034,
    { color: C.greenDark, bone: head, sides: 6 },
  );
  b.sweep(
    catmull([[-0.25, 1.65, 0.026], [-0.19, 1.676, 0.18], [0, 1.689, 0.221], [0.19, 1.676, 0.18], [0.25, 1.65, 0.026]]),
    0.008,
    { color: C.gold, bone: head, sides: 5 },
  );
  for (const s of [1, -1]) {
    b.slab(
      [[s * 0.203, 1.681, -0.04], [s * 0.285, 1.622, -0.055],
       [s * 0.294, 1.379, -0.03], [s * 0.223, 1.332, 0.08],
       [s * 0.204, 1.535, 0.103]],
      { color: CLOTH, thickness: 0.044, bone: head },
    );
    line([s * 0.285, 1.61, -0.024], [s * 0.277, 1.393, 0.018], 0.01, C.gold, head);
    cylinder([s * 0.236, 1.642, 0.075], 0.028, 0.022, BRASS, head, [s, 0, 0.3], 0.028, 8);
  }
  b.extrude(
    [[-0.04, 0], [0, 0.075], [0.04, 0], [0, -0.033]],
    { at: [0, 1.733, 0.231], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, color: BRASS, bone: head },
  );
  glow(ell([0, 1.745, 0.249], [0.016, 0.023, 0.009], C.turquoise, head), 0.65);

  // The blunderbuss is an assembly, rigidly carried by the right hand.
  const gunBone = arms.R.tip!;
  const gun = b.region({
    at: [-0.99, 1.115, 0.165],
    quat: aim([-0.065, 0.1, 1], [0, 1, 0], "z"),
    bone: gunBone,
  });
  const gp = (p: P) => gun.p(p);
  const gd = (p: P) => gun.d(p);

  b.extrude(
    [[-0.53, -0.2], [-0.51, -0.105], [-0.423, 0.059], [-0.12, 0.07],
     [0.108, 0.033], [0.13, -0.079], [-0.19, -0.105], [-0.32, -0.23]],
    {
      at: gp([0, 0, 0]), x: gd([0, 0, 1]), y: gd([0, 1, 0]),
      thickness: 0.135, bevel: 0.012, color: WOOD, bone: gunBone,
      name: "carved_walnut_stock",
    },
  );
  b.part(new THREE.BoxGeometry(0.155, 0.195, 0.041), IRON, {
    at: gp([0, -0.137, -0.485]), quat: gun.q(), bone: gunBone,
  });
  b.part(new THREE.BoxGeometry(0.157, 0.17, 0.035), BRASS, {
    at: gp([0, -0.14, -0.494]), quat: gun.q(), bone: gunBone,
  });
  b.part(new THREE.BoxGeometry(0.16, 0.055, 0.18), LEATHER, {
    at: gp([0, -0.005, -0.33]), quat: gun.q(), bone: gunBone,
  });

  const barrel = b.lathe(
    [[0.055, -0.12], [0.083, -0.08], [0.092, 0.04], [0.098, 0.30],
     [0.128, 0.48], [0.184, 0.615], [0.196, 0.657], [0.196, 0.69],
     [0.155, 0.69], [0.149, 0.646], [0.102, 0.49], [0.065, 0.3],
     [0.052, 0.04], [0.043, -0.12]],
    {
      at: gp([0, 0.072, 0]), axis: gd([0, 0, 1]), segments: 12,
      color: STEEL, bone: gunBone, name: "flared_hollow_blunderbuss_barrel",
    },
  );
  b.part(new THREE.CircleGeometry(0.089, 12), "#101822", {
    at: gp([0, 0.072, 0.41]), dir: gd([0, 0, 1]), axis: "z", bone: gunBone,
  });
  b.lathe(
    [[0.09, 0.43], [0.13, 0.57], [0.153, 0.651],
     [0.157, 0.67], [0.151, 0.67], [0.126, 0.57], [0.086, 0.43]],
    {
      at: gp([0, 0.072, 0]),
      axis: gd([0, 0, 1]), segments: 12,
      color: IRON, bone: gunBone,
      name: "soot_darkened_inner_bore",
    },
  );
  b.part(new THREE.TorusGeometry(0.177, 0.022, 5, 12), BRASS, {
    at: gp([0, 0.072, 0.687]), dir: gd([0, 0, 1]), axis: "z", bone: gunBone,
  });
  for (const band of [
    { z: -0.045, r: 0.094, w: 0.053 },
    { z: 0.257, r: 0.105, w: 0.045 },
    { z: 0.478, r: 0.137, w: 0.036 },
    { z: 0.624, r: 0.189, w: 0.032 },
  ]) {
    b.lathe(
      [
        [band.r - 0.009, -band.w / 2],
        [band.r + 0.005, -band.w / 2],
        [band.r + 0.005, band.w / 2],
        [band.r - 0.009, band.w / 2],
      ],
      {
        at: gp([0, 0.072, band.z]),
        axis: gd([0, 0, 1]), segments: 12,
        color: BRASS, bone: gunBone,
      },
    );
  }

  b.decal(barrel, engravingTexture, {
    at: gp([-0.083, 0.115, 0.136]),
    dir: gd([-1, 0.25, 0]),
    up: gd([0, 0, 1]),
    size: [0.115, 0.22],
    segments: 6, lift: 0.002, bone: gunBone,
  });
  for (const s of [1, -1]) {
    line(gp([s * 0.087, 0.034, 0.06]), gp([s * 0.112, 0.034, 0.43]), 0.011, BRASS, gunBone);
  }
  b.ring(frame(gp([0, 0.072, 0.694]), gd([0, 0, 1])), { count: 8, radius: 0.177 }, (item) => {
    ell(item.at, [0.009, 0.009, 0.009], C.goldLight, gunBone);
  });

  b.part(new THREE.BoxGeometry(0.025, 0.095, 0.245), BRASS, {
    at: gp([-0.078, -0.012, -0.13]), quat: gun.q(), bone: gunBone,
  });
  drawing(gp([-0.092, -0.012, -0.13]), 0.19, 0.072, runeTexture, gunBone,
    gd([-1, 0, 0]).toArray(), gd([0, 1, 0]).toArray());
  for (const z of [-0.222, -0.045]) {
    ell(gp([-0.097, -0.012, z]), [0.013, 0.013, 0.013], IRON, gunBone);
  }

  b.sweep(
    catmull([
      gp([-0.085, 0.036, -0.13]),
      gp([-0.113, 0.13, -0.156]),
      gp([-0.113, 0.195, -0.106]),
      gp([-0.108, 0.202, -0.061]),
    ]),
    [0.023, 0.022, 0.02, 0.013],
    { color: IRON, bone: gunBone, sides: 6, caps: "flat" },
  );
  b.part(new THREE.BoxGeometry(0.056, 0.035, 0.055), "#b4b2a2", {
    at: gp([-0.108, 0.202, -0.052]), quat: gun.q(), bone: gunBone, rotation: undefined,
  });
  b.sweep(
    catmull([
      gp([0, -0.08, -0.255]),
      gp([0, -0.185, -0.237]),
      gp([0, -0.195, -0.095]),
      gp([0, -0.082, -0.063]),
    ], { closed: true }),
    0.012, { color: BRASS, bone: gunBone, sides: 6 },
  );
  b.sweep(
    bezier(gp([0, -0.075, -0.143]), gp([0, -0.16, -0.153]), gp([0, -0.151, -0.18])),
    0.01, { color: IRON, bone: gunBone, sides: 5 },
  );
  for (const z of [-0.024, 0.51]) {
    b.part(new THREE.BoxGeometry(0.035, 0.052, 0.045), IRON, {
      at: gp([0, z > 0 ? 0.231 : 0.184, z]), quat: gun.q(), bone: gunBone,
    });
  }

  // A small round field keg and a few spent cases tell the mountain-watch story.
  const kegAt = [0.86, 0.133, -0.37];
  b.lathe(
    [[0, 0], [0.128, 0], [0.155, 0.065], [0.167, 0.145],
     [0.155, 0.235], [0.128, 0.285], [0, 0.285]],
    { at: kegAt, axis: [0, 1, 0], segments: 10, color: WOOD, bone: root },
  );
  for (const y of [0.165, 0.225, 0.365, 0.404]) {
    cylinder([0.86, y, -0.37], y < 0.2 || y > 0.4 ? 0.143 : 0.165, 0.027, IRON, root, [0, 1, 0],
      y < 0.2 || y > 0.4 ? 0.143 : 0.165, 10);
  }
  drawing([0.86, 0.28, -0.198], 0.172, 0.172, kegTexture);
  cylinder([0.86, 0.435, -0.37], 0.13, 0.028, WOOD, root, [0, 1, 0], 0.13, 10);
  ell([0.885, 0.454, -0.39], [0.117, 0.019, 0.1], C.snow);
  line([0.975, 0.24, -0.29], [1.055, 0.24, -0.25], 0.022, BRASS);
  line([1.052, 0.213, -0.25], [1.052, 0.279, -0.25], 0.012, IRON);
  for (let i = 0; i < 3; i++) {
    const x = -0.63 - i * 0.103;
    const z = 0.34 + (i % 2) * 0.11;
    const dir = [0.65 + i * 0.15, 0, 0.8 - i * 0.22];
    cylinder([x, 0.148, z], 0.018, 0.086, BRASS, root, dir, 0.018, 8);
  }

  // Dry alpine tufts stay low, framing rather than competing with the dwarf.
  for (const p of [[-0.82, 0.15, -0.48], [0.71, 0.15, 0.43], [-0.95, 0.15, 0.04]]) {
    for (let i = 0; i < 4; i++) {
      const dx = (i - 1.5) * 0.024;
      b.spike(
        [p[0] + dx, p[1], p[2]],
        [dx * 4, 1, (i % 2 ? 1 : -1) * 0.2],
        0.075 + random() * 0.045,
        0.009,
        { color: i % 2 ? "#8c936f" : "#64795f", bone: root, sides: 4 },
      );
    }
  }

  // A tiny chest catch is surface-seated, keeping the layered construction honest.
  const catchHit = b.surface(torso).around([0, 1.1, 0]).at(-42, 0);
  if (catchHit) {
    b.stick(new THREE.CylinderGeometry(0.025, 0.025, 0.014, 8), BRASS, catchHit, {
      embed: 0.3, bone: spine.joints[1], name: "cloak_clasp",
    });
  }

  return b.root;
}
