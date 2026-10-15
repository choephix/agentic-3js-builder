import * as THREE from "three";
import {
  createBuilder, rng, catmull, bezier, paint, noise, mix, grain, mottle, svg,
  type Joint, type Fill,
} from "../../../../src/index";
import {
  metal, gearGeometry, gaugeTexture, coil,
} from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Pip Copperwhistle, Gnome Tinkerer",
  description:
    "An ivory-bearded gnome inventor with a stitched vermilion cap, expressive amber eyes, and a framed backpack of working copper gadgets. A rig-ready workshop puppet on a compact wooden stage.",
};

export default function build(): THREE.Object3D {
  /*
   * Art-direction changes:
   * 1. Reveal the power-cell glass: its previous opaque outer cylinder hid the glow.
   * 2. Seat the eyes more deeply, expose a small smile, and give the beard and
   *    rear hair real volume so the face works in profile as well as head-on.
   * 3. Replace rectangular boot soles with shaped soles; tighten the stage.
   * 4. Quiet the metal mottling and enrich the cap, canvas pockets, and carrier
   *    with purposeful seams, stitching, ventilation, and instrument fittings.
   * 5. Preserve the clear T-pose, large head, simple primitive construction,
   *    and unobstructed face.
   */
  const b = createBuilder({ name: "Pip Copperwhistle", paintSize: 2048 });
  const rand = rng(73019);

  const C = {
    ink: "#26313b", deep: "#172c32", teal: "#24777b",
    lightTeal: "#58ada2", red: "#b7493b", rust: "#773c33",
    gold: "#e5b864", cream: "#f4e8c8", beard: "#fff0cc",
    beardShade: "#d7c5a1", skin: "#edb38b", skinLight: "#ffd0a0",
    rose: "#cf806c", leather: "#865433", leatherDark: "#49372d",
    sole: "#303332", paper: "#f4ddb3", blue: "#194856",
  };

  const brass = metal("brass", {
    polish: 0.35, tarnish: 0.065, size: 0.16,
  });
  const copper = metal("copper", {
    polish: 0.3, tarnish: 0.11, verdigris: 0.06, size: 0.14,
  });
  const steel = metal("steel", { polish: 0.35, tarnish: 0.11 });
  const iron = metal("iron", { polish: 0.15, tarnish: 0.15 });
  const woodGrain = grain("#76543e", "#886449", {
    axis: "x", size: 0.042, seed: 3,
  });
  const wood = paint((p, n) =>
    mix(woodGrain.at(p, n), "#ad855f", 0.10 + Math.max(0, n.y) * 0.08),
  );
  const leather = mottle("#765033", "#ac7748", {
    size: 0.11, contrast: 0.6, seed: 17,
  });
  const cloth = paint((p, n) =>
    mix("#1d535f", "#3f9290",
      0.47 + n.y * 0.2 +
      Math.sin(p.y * 680) * Math.sin(p.x * 680 + p.z * 240) * 0.025),
  );
  const felt = paint((p, n) =>
    mix("#873b38", "#cf5c48",
      0.42 + 0.22 * n.y + noise(p, 0.035, 8) * 0.2),
  );
  const skin = paint((_p, n) =>
    mix("#d99178", "#ffd0a2", 0.5 + 0.28 * n.y + 0.12 * n.z),
  );
  const ivory = paint((p, n) =>
    mix("#c7b995", "#fff2d1",
      0.6 + n.y * 0.23 + noise(p, 0.065, 5) * 0.1),
  );
  const packCloth = mottle("#294a40", "#497464", {
    size: 0.095, contrast: 0.4, seed: 22,
  });

  const eyeTex = svg(`
    <svg viewBox="0 0 100 112">
      <defs><clipPath id="e"><ellipse cx="50" cy="56" rx="43" ry="49"/></clipPath></defs>
      <ellipse cx="50" cy="56" rx="48" ry="54" fill="#34323a"/>
      <ellipse cx="50" cy="56" rx="42" ry="48" fill="#fff4d9"/>
      <g clip-path="url(#e)">
        <ellipse cx="49" cy="60" rx="27" ry="35" fill="#5e4533"/>
        <ellipse cx="49" cy="64" rx="23" ry="29" fill="#bd883e"/>
        <path d="M29 72 Q49 96 70 71" fill="none" stroke="#edc86b" stroke-width="9"/>
        <ellipse cx="49" cy="60" rx="13" ry="24" fill="#202c31"/>
        <ellipse cx="39" cy="42" rx="10" ry="13" fill="#ffffff"/>
        <circle cx="61" cy="75" r="5" fill="#ffffff"/>
      </g>
      <path d="M9 39 Q44 1 90 34" fill="none" stroke="#423737"
        stroke-width="8" stroke-linecap="round"/>
    </svg>`, { size: 256 });

  const blueprintTex = svg(`
    <svg viewBox="0 0 160 180">
      <rect width="160" height="180" rx="7" fill="#164451"/>
      <path d="M16 13H144V167H16Z" stroke="#75aaa6" stroke-width="3" fill="none"/>
      <g stroke="#a5dbcf" stroke-width="3" fill="none">
        <circle cx="81" cy="72" r="31"/><circle cx="81" cy="72" r="13"/>
        <path d="M81 29V115M38 72H124M52 43L110 101M52 101L110 43"/>
        <path d="M44 121H117M44 116V127M117 116V127"/>
        <path d="M25 40V104M20 40H30M20 104H30"/>
        <path d="M45 142H116M45 152H91"/>
      </g>
      <text x="80" y="23" text-anchor="middle" font-family="monospace"
        font-size="11" fill="#f5dfac">MK. VII</text>
      <circle cx="122" cy="149" r="9" fill="#e2ae5d"/>
    </svg>`, { size: 256 });

  const patchTex = svg(`
    <svg viewBox="0 0 100 100">
      <path d="M8 12L88 8L94 87L13 94Z" fill="#d5a65b" stroke="#643f33" stroke-width="5"/>
      <path d="M17 20L80 17L85 80L21 85Z" fill="none" stroke="#f9df9e"
        stroke-width="4" stroke-dasharray="5 6"/>
      <path d="M30 64L65 30M29 27L41 30L43 42L31 45L24 38M61 59L73 62L76 74L64 78L57 70"
        fill="none" stroke="#5f4939" stroke-width="9" stroke-linecap="round"/>
    </svg>`, { size: 192 });

  const badgeTex = svg(`
    <svg viewBox="0 0 160 100">
      <rect x="3" y="3" width="154" height="94" rx="12" fill="#eed8a4"
        stroke="#433b31" stroke-width="5"/>
      <path d="M16 20H144M16 78H144" stroke="#9d733b" stroke-width="3"/>
      <text x="80" y="44" text-anchor="middle" fill="#344d46"
        font-family="serif" font-weight="bold" font-size="23">P. COPPER</text>
      <text x="80" y="66" text-anchor="middle" fill="#7a5333"
        font-family="monospace" font-weight="bold" font-size="15">FIELD KIT • 07</text>
    </svg>`, { size: 256 });

  const warningTex = svg(`
    <svg viewBox="0 0 100 100">
      <path d="M50 5L96 89H4Z" fill="#e8b655" stroke="#44382d" stroke-width="6"/>
      <path d="M55 22L32 57H48L42 78L71 43H54Z" fill="#44382d"/>
    </svg>`, { size: 160 });

  const plaqueTex = svg(`
    <svg viewBox="0 0 360 95">
      <rect x="3" y="3" width="354" height="89" rx="10" fill="#263e3b"
        stroke="#d2a65e" stroke-width="5"/>
      <text x="180" y="42" text-anchor="middle" font-family="serif"
        font-weight="bold" font-size="27" fill="#f2dba7">PIP COPPERWHISTLE</text>
      <text x="180" y="69" text-anchor="middle" font-family="monospace"
        font-size="17" fill="#b8c9ac">SMALL GNOME · BIG IDEAS</text>
    </svg>`, { size: 512 });

  const pocketTex = svg(`
    <svg viewBox="0 0 100 140">
      <rect x="3" y="3" width="94" height="134" rx="10"
        fill="#416c5b" stroke="#233e36" stroke-width="5"/>
      <path d="M11 18V123Q11 130 20 130H80Q89 130 89 122V18"
        fill="none" stroke="#b9b58a" stroke-width="2.8" stroke-dasharray="5 5"/>
      <path d="M5 34H95L82 55H18Z" fill="#527d67" stroke="#233e36" stroke-width="4"/>
      <circle cx="50" cy="47" r="5" fill="#d6b365"/>
      <g fill="none" stroke="#213c36" stroke-width="6" stroke-linecap="round">
        <path d="M27 79H73M27 94H73M27 109H73"/>
      </g>
      <path d="M26 76H74M26 91H74M26 106H74" stroke="#6d9275" stroke-width="2"/>
    </svg>`, { size: 256 });

  const gaugeTex = gaugeTexture({ needle: 48, label: "STEAM", size: 256 });

  // Skeleton, including separated fingers and an independently hinged lower jaw.
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", {
    parent: root, at: [0, 0.385, 0], role: "spine",
  });
  const spine = b.chain("spine", [
    [0, 0.385, 0], [0, 0.53, -0.01], [0, 0.67, -0.015],
  ], {
    parent: hips, names: ["spine1", "chest", "neck"], role: "spine",
  });
  const chest = spine.joints[1];
  const neck = spine.tip!;
  const head = b.joint("head", {
    parent: neck, at: [0, 0.875, 0.02], dir: [0, 0, 1], role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head, at: [0, 0.807, 0.055], dir: [0, 0, 1], role: "jaw",
  });

  const sides = [1, -1].map((s) => {
    const side = s === 1 ? "L" : "R";
    const leg = b.chain(`leg${side}`, [
      [s * 0.105, 0.395, 0],
      [s * 0.125, 0.282, 0.018],
      [s * 0.137, 0.175, 0.035],
    ], {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg", contact: [s * 0.137, 0.075, 0.075],
    });
    const arm = b.chain(`arm${side}`, [
      [s * 0.205, 0.652, 0],
      [s * 0.405, 0.646, 0],
      [s * 0.56, 0.638, 0.008],
    ], {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const hand = b.joint(`hand${side}`, {
      parent: arm.tip!, at: [s * 0.605, 0.637, 0.015],
      dir: [s, 0, 0], role: "arm",
    });
    const fingers = [0, 1, 2, 3].map((i) => {
      const y = 0.602 + i * 0.022;
      const length = [0.064, 0.085, 0.082, 0.065][i];
      return b.chain(`finger${side}${i + 1}`, [
        [s * 0.637, y, 0.02],
        [s * (0.659 + length * 0.42), y + (i - 1.5) * 0.005, 0.025],
        [s * (0.655 + length), y + (i - 1.5) * 0.012, 0.029],
      ], { parent: hand, role: "digit" });
    });
    const thumb = b.chain(`thumb${side}`, [
      [s * 0.594, 0.609, 0.04],
      [s * 0.609, 0.576, 0.075],
      [s * 0.636, 0.559, 0.09],
    ], { parent: hand, role: "digit" });
    return { s, side, leg, arm, hand, fingers, thumb };
  });

  const packBone = b.joint("backpack", {
    parent: chest, at: [0, 0.59, -0.26],
  });
  const fanBone = b.joint("fan", {
    parent: packBone, at: [0.365, 0.892, -0.26],
    dir: [0, 0, 1], role: "hinge",
  });

  function box(
    at: number[], size: number[], color: Fill, bone: Joint = root,
    rotation: number[] = [0, 0, 0], name?: string,
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at, bone, rotation, name,
    });
  }

  function ball(
    at: number[], size: number[], color: Fill,
    bone: Joint = root, name?: string,
  ) {
    return b.part(new THREE.SphereGeometry(1, 12, 8), color, {
      at, bone, scale: size, flat: true, name,
    });
  }

  function cylinder(
    at: number[], radius: number, height: number, color: Fill,
    bone: Joint = root, dir: number[] = [0, 1, 0], segments = 12,
  ) {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, height, segments),
      color, { at, bone, dir },
    );
  }

  function torus(
    at: number[], radius: number, tube: number, color: Fill,
    bone: Joint, dir: number[] = [0, 0, 1],
  ) {
    return b.part(new THREE.TorusGeometry(radius, tube, 5, 16), color, {
      at, bone, dir, axis: "z",
    });
  }

  function drawing(
    texture: THREE.Texture, at: number[], size: number[],
    bone: Joint, dir: number[] = [0, 0, 1],
  ) {
    return b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
      at, bone, texture, dir, axis: "z",
    });
  }

  function rivet(at: number[], bone: Joint, radius = 0.008) {
    return ball(at, [radius, radius, radius * 0.55], brass, bone);
  }

  function buckle(at: number[], w: number, h: number, bone: Joint) {
    const [x, y, z] = at;
    box([x - w / 2, y, z], [0.01, h, 0.012], brass, bone);
    box([x + w / 2, y, z], [0.01, h, 0.012], brass, bone);
    box([x, y - h / 2, z], [w, 0.01, 0.012], brass, bone);
    box([x, y + h / 2, z], [w, 0.01, 0.012], brass, bone);
    box([x, y, z + 0.007], [w * 0.8, 0.006, 0.008], steel, bone);
  }

  function beardLock(
    start: number[], end: number[], width: number, color: Fill, bone: Joint,
  ) {
    const mid = [
      start[0] * 0.45 + end[0] * 0.55,
      start[1] * 0.47 + end[1] * 0.53,
      Math.max(start[2], end[2]) + 0.015,
    ];
    return b.sweep(catmull([start, mid, end]), (t) => {
      const taper = 1 - t * t;
      return [width * taper + 0.001, width * 0.64 * taper + 0.001];
    }, {
      bone, color, sides: 6, smooth: false,
      caps: { start: "round", end: "flat" },
      name: "carved ivory hair lock",
    });
  }

  // Compact workshop stage. The main character remains the composition's hero.
  b.part(new THREE.CylinderGeometry(0.71, 0.73, 0.055, 8), C.deep, {
    at: [0, 0.0275, -0.04], scale: [1, 1, 0.79],
    bone: root, name: "octagonal workshop plinth",
  });
  for (let i = 0; i < 7; i++) {
    const z = -0.46 + i * 0.139;
    const width = i === 0 || i === 6 ? 0.99 : i === 1 || i === 5 ? 1.22 : 1.32;
    box([0, 0.062, z], [width, 0.025, 0.132], wood);
    for (const s of [-1, 1]) {
      cylinder([s * (width / 2 - 0.045), 0.075, z + 0.035],
        0.007, 0.003, iron, root, [0, 1, 0], 6);
    }
  }
  for (const x of [-0.22, 0.22]) {
    box([x, 0.037, 0.535], [0.038, 0.035, 0.105], C.deep);
  }
  box([0, 0.039, 0.586], [0.62, 0.071, 0.018], brass);
  drawing(plaqueTex, [0, 0.041, 0.597], [0.593, 0.062], root);

  // Eight-corner soles follow the boots instead of reading as black pedestals.
  const soleOutline = [
    [-0.067, -0.123], [0.067, -0.123], [0.092, -0.093],
    [0.092, 0.081], [0.061, 0.12], [-0.061, 0.12],
    [-0.092, 0.081], [-0.092, -0.093],
  ];
  for (const { s, leg, arm, hand, fingers, thumb } of sides) {
    b.sweep(leg, [0.079, 0.068], {
      color: cloth, sides: 8, caps: "flat", name: "trouser leg",
    });
    b.extrude(soleOutline, {
      at: [s * 0.137, 0.09, 0.1],
      x: [1, 0, 0], y: [0, 0, -1],
      thickness: 0.03, bevel: 0.004,
      color: C.sole, bone: leg.tip!, name: "shaped boot sole",
    });
    b.extrude(soleOutline, {
      at: [s * 0.137, 0.108, 0.1],
      x: [1, 0, 0], y: [0, 0, -1],
      thickness: 0.009, color: C.leather, bone: leg.tip!,
      name: "leather boot welt",
    });
    ball([s * 0.137, 0.142, 0.105], [0.095, 0.065, 0.135],
      leather, leg.tip!, "broad work boot");
    cylinder([s * 0.137, 0.181, 0.023], 0.079, 0.069,
      C.leatherDark, leg.tip!, [0, 1, 0], 10);
    cylinder([s * 0.137, 0.209, 0.023], 0.083, 0.022,
      leather, leg.tip!, [0, 1, 0], 10);
    box([s * 0.137, 0.166, 0.194], [0.126, 0.026, 0.018],
      C.leatherDark, leg.tip!);
    buckle([s * 0.137, 0.168, 0.207], 0.049, 0.034, leg.tip!);

    b.sweep(arm, (t) => 0.087 - t * 0.031, {
      color: cloth, sides: 8, caps: "round", name: "teal coat sleeve",
    });
    b.rod([s * 0.512, 0.641, 0.006], [s * 0.568, 0.638, 0.008],
      0.073, { color: leather, bone: arm.joints[1], sides: 8 });
    b.rod([s * 0.557, 0.639, 0.008], [s * 0.571, 0.638, 0.008],
      0.075, { color: C.gold, bone: arm.joints[1], sides: 8 });
    ball([s * 0.605, 0.636, 0.016], [0.055, 0.052, 0.035],
      skin, hand, "open hand");
    for (const finger of fingers) {
      b.sweep(finger, [0.0135, 0.009], {
        color: skin, sides: 6, caps: "round",
      });
    }
    b.sweep(thumb, [0.018, 0.011], {
      color: skin, sides: 6, caps: "round",
    });
    for (let i = 0; i < 3; i++) {
      box([s * (0.529 + i * 0.008), 0.67, 0.052],
        [0.003, 0.015, 0.004], C.paper, arm.joints[1], [0, 0, -s * 15]);
    }
  }

  const torso = b.loft([
    { at: [0, 0.323, 0], w: 0.357, h: 0.255 },
    { at: [0, 0.405, 0], w: 0.395, h: 0.29 },
    { at: [0, 0.535, -0.006], w: 0.376, h: 0.285 },
    { at: [0, 0.65, -0.012], w: 0.4, h: 0.252 },
    { at: [0, 0.697, -0.012], w: 0.255, h: 0.2 },
  ], {
    bone: spine, color: cloth, sides: 10, caps: "flat",
    name: "short teal workshop coat",
  });
  b.rod([0, 0.676, 0], [0, 0.765, 0.015], 0.079, {
    bone: neck, color: skin, sides: 8,
  });

  const bodySurface = b.surface(torso);
  b.sweep(bodySurface.loop([0, 0.412, 0], { lift: 0.006 }),
    () => [0.023, 0.012], {
      color: C.leatherDark, bone: hips, sides: 6,
      caps: "none", name: "waist belt",
    });
  buckle([0, 0.412, 0.161], 0.078, 0.05, hips);

  b.extrude([
    [-0.148, 0], [0.148, 0], [0.124, 0.19],
    [0.079, 0.264], [-0.079, 0.264], [-0.124, 0.19],
  ], {
    at: [0, 0.304, 0.156], x: [1, 0, 0], y: [0, 1, 0],
    thickness: 0.018, bevel: 0.003, color: leather,
    bone: chest, name: "leather apron",
  });
  for (const s of [-1, 1]) {
    b.rod([s * 0.071, 0.558, 0.165], [s * 0.142, 0.688, 0.092],
      0.015, { color: C.leatherDark, bone: chest, section: "box" });
    rivet([s * 0.077, 0.549, 0.169], chest);
  }
  box([0.075, 0.389, 0.174], [0.119, 0.129, 0.009], C.leatherDark, chest);
  drawing(blueprintTex, [0.075, 0.395, 0.18], [0.105, 0.119], chest);
  b.rod([-0.096, 0.352, 0.178], [-0.11, 0.482, 0.181],
    0.008, { color: C.gold, bone: chest, sides: 6 });
  b.spike([-0.11, 0.482, 0.181], [-0.111, 0.499, 0.181],
    null, 0.008, { color: C.paper, bone: chest, sides: 6 });
  box([-0.08, 0.365, 0.184], [0.062, 0.065, 0.012], leather, chest);
  for (let i = 0; i < 9; i++) {
    box([-0.126 + i * 0.031, 0.321, 0.169],
      [0.012, 0.003, 0.003], C.paper, chest);
  }

  // Face: eyes embedded in the head, not projecting as large white cylinders.
  ball([0, 0.888, 0.028], [0.212, 0.197, 0.174],
    skin, head, "gnome head");
  ball([0, 0.886, -0.054], [0.202, 0.169, 0.151],
    ivory, head, "solid rear hair silhouette");

  for (const s of [-1, 1]) {
    b.extrude([
      [0, -0.046], [0.066, -0.023], [0.108, 0.027],
      [0.082, 0.069], [0.019, 0.045], [-0.012, 0.005],
    ], {
      at: [s * 0.179, 0.882, 0.016],
      x: [s, 0, 0], y: [0, 1, 0],
      thickness: 0.048, bevel: 0.007, color: skin,
      bone: head, name: "pointed gnome ear",
    });
    b.extrude([
      [0.007, -0.021], [0.055, -0.008], [0.081, 0.029],
      [0.057, 0.039], [0.013, 0.019],
    ], {
      at: [s * 0.188, 0.884, 0.042],
      x: [s, 0, 0], y: [0, 1, 0],
      thickness: 0.006, color: C.rose, bone: head,
    });
    ball([s * 0.132, 0.846, 0.143], [0.064, 0.055, 0.051],
      skin, head, "round cheek");
    ball([s * 0.151, 0.855, 0.177], [0.028, 0.017, 0.008],
      C.rose, head);

    const eye = ball([s * 0.087, 0.921, 0.166],
      [0.058, 0.068, 0.025], C.cream, head, "seated eye");
    b.decal(eye, eyeTex, {
      at: [s * 0.087, 0.925, 0.202], dir: [0, 0, 1],
      size: [0.09, 0.106], segments: 8,
      bone: head, lift: 0.0015,
    });
    b.sweep(bezier(
      [s * 0.039, 0.99, 0.165],
      [s * 0.087, 1.02, 0.173],
      [s * 0.149, 0.986, 0.147],
    ), [0.022, 0.014], {
      color: ivory, bone: head, sides: 5, smooth: false,
      name: "expressive white eyebrow",
    });

    // Sideburns join the white rear hair to the beard below each ear.
    beardLock([s * 0.182, 0.854, 0.05],
      [s * 0.158, 0.748, 0.117], 0.033, ivory, head);
  }

  ball([0, 0.874, 0.232], [0.078, 0.06, 0.077], skin, head, "button nose");
  ball([0, 0.885, 0.277], [0.045, 0.033, 0.03], C.skinLight, head);
  for (const s of [-1, 1]) {
    ball([s * 0.043, 0.848, 0.276], [0.011, 0.006, 0.005], C.rose, head);
  }

  ball([0, 0.785, 0.207], [0.065, 0.025, 0.024],
    "#663e35", head, "smiling upper mouth");
  ball([0, 0.765, 0.206], [0.061, 0.022, 0.025],
    skin, jaw, "separate lower jaw");
  box([0, 0.792, 0.23], [0.035, 0.009, 0.006], C.cream, head);
  ball([0, 0.773, 0.229], [0.024, 0.007, 0.004], C.rose, jaw);

  ball([0, 0.687, 0.132], [0.147, 0.151, 0.105],
    ivory, jaw, "volumetric beard understructure");

  for (const s of [-1, 1]) {
    beardLock([s * 0.164, 0.979, -0.035],
      [s * 0.182, 0.81, -0.018], 0.033, ivory, head);
    beardLock([s * 0.139, 0.968, -0.096],
      [s * 0.135, 0.784, -0.084], 0.039, ivory, head);
    beardLock([s * 0.075, 0.958, -0.135],
      [s * 0.069, 0.784, -0.15], 0.041, ivory, head);
  }
  beardLock([0, 0.965, -0.173], [0, 0.775, -0.145],
    0.043, ivory, head);

  b.extrude([
    [-0.17, 0.245], [-0.187, 0.183], [-0.145, 0.075],
    [-0.08, 0.005], [0, -0.045], [0.085, 0.012],
    [0.153, 0.083], [0.188, 0.184], [0.169, 0.245],
    [0.097, 0.208], [0, 0.177], [-0.097, 0.208],
  ], {
    at: [0, 0.555, 0.145], x: [1, 0, 0], y: [0, 1, 0],
    thickness: 0.084, bevel: 0.006, color: ivory,
    bone: jaw, name: "carved ivory beard silhouette",
  });
  for (const s of [-1, 1]) {
    beardLock([s * 0.16, 0.807, 0.156],
      [s * 0.17, 0.67, 0.169], 0.038, ivory, jaw);
    beardLock([s * 0.125, 0.751, 0.192],
      [s * 0.105, 0.589, 0.21], 0.043, ivory, jaw);
    beardLock([s * 0.067, 0.729, 0.207],
      [s * 0.045, 0.548, 0.231], 0.042, ivory, jaw);
    beardLock([s * 0.155, 0.753, 0.175],
      [s * 0.133, 0.62, 0.185], 0.022, C.beardShade, jaw);
    b.sweep(bezier(
      [s * 0.014, 0.825, 0.242],
      [s * 0.078, 0.804, 0.253],
      [s * 0.152, 0.833, 0.192],
    ), [0.029, 0.035, 0.003], {
      color: ivory, bone: head, sides: 6, smooth: false,
      name: "upturned moustache",
    });
  }
  beardLock([0, 0.716, 0.232], [0.012, 0.518, 0.226],
    0.043, C.beard, jaw);

  // Red cap, stitched brim, and deliberately off-center patch.
  const brim = b.lathe([
    [0, 0], [0.203, 0], [0.231, 0.018], [0.23, 0.055],
    [0.201, 0.069], [0, 0.069],
  ], {
    at: [0, 1.018, 0.008], color: felt, bone: head,
    segments: 12, name: "rolled cap brim",
  });
  const capCrown = b.sweep(catmull([
    [0, 1.062, -0.003],
    [-0.021, 1.166, -0.015],
    [0.008, 1.269, -0.018],
    [0.078, 1.345, 0.002],
    [0.154, 1.326, 0.023],
  ]), [0.191, 0.155, 0.105, 0.049, 0.008], {
    color: felt, bone: head, sides: 10, smooth: false,
    caps: "flat", name: "crooked red gnome cap",
  });
  ball([0.155, 1.326, 0.023], [0.023, 0.023, 0.023], C.gold, head);
  b.decal(capCrown, patchTex, {
    at: [-0.061, 1.183, 0.16], dir: [0, 0, 1],
    size: [0.069, 0.075], segments: 8, lift: 0.002,
    bone: head, name: "stitched wrench patch",
  });

  const brimSkin = b.surface(brim);
  for (let i = 0; i < 22; i++) {
    const a = -172 + i * 16;
    const hit = brimSkin.around([0, 1.042, 0.008]).at(a, 0);
    if (hit) {
      b.stick(new THREE.BoxGeometry(0.009, 0.003, 0.003),
        "#edaf79", hit, { embed: 0.15, spin: -25, bone: head });
    }
  }
  b.sweep(capCrown.line(100, 0.001).slice(0.06, 0.76), 0.0028, {
    color: C.rust, bone: head, sides: 5, name: "cap panel seam",
  });
  b.sweep(catmull([
    [-0.199, 1.068, 0.063], [-0.136, 1.076, 0.177],
    [0, 1.081, 0.205], [0.136, 1.076, 0.177], [0.199, 1.068, 0.063],
  ]), 0.018, { color: C.leatherDark, bone: head, sides: 6 });

  for (const s of [-1, 1]) {
    cylinder([s * 0.081, 1.084, 0.192], 0.057, 0.024,
      C.leatherDark, head, [0, 0, 1], 12);
    cylinder([s * 0.081, 1.084, 0.208], 0.049, 0.014,
      brass, head, [0, 0, 1], 12);
    cylinder([s * 0.081, 1.084, 0.218], 0.039, 0.004,
      "#497d80", head, [0, 0, 1], 12);
    torus([s * 0.081, 1.084, 0.22], 0.04, 0.005, brass, head);
    b.rod([s * 0.093, 1.106, 0.223], [s * 0.065, 1.083, 0.223],
      0.0037, { color: "#c4e4d4", bone: head, sides: 5 });
  }
  b.rod([-0.027, 1.084, 0.208], [0.027, 1.084, 0.208],
    0.009, { color: brass, bone: head });

  // The harness is draped onto the actual coat, then joined to its carrier.
  for (const s of [-1, 1]) {
    const strap = bodySurface.drape([
      [s * 0.13, 0.433, 0.16],
      [s * 0.17, 0.543, 0.16],
      [s * 0.17, 0.665, 0.118],
      [s * 0.14, 0.696, -0.016],
      [s * 0.14, 0.63, -0.153],
    ], { lift: 0.009 });
    b.sweep(strap, () => [0.023, 0.009], {
      color: C.leatherDark, bone: chest, sides: 6,
      name: "backpack shoulder harness",
    });
    box([s * 0.177, 0.569, 0.121], [0.054, 0.086, 0.038],
      C.leatherDark, chest, [0, 0, -s * 9]);
    buckle([s * 0.177, 0.569, 0.144], 0.041, 0.051, chest);
    b.sweep([
      [s * 0.14, 0.658, -0.103],
      [s * 0.145, 0.702, -0.155],
      [s * 0.145, 0.711, -0.224],
    ], () => [0.021, 0.009], {
      color: C.leatherDark, bone: packBone, sides: 6,
      name: "carrier load-bearing strap",
    });
  }
  box([0, 0.557, -0.15], [0.279, 0.29, 0.072],
    C.leatherDark, packBone, [0, 0, 0], "backpack contact cushion");

  // Canvas carrier and its external metal frame.
  box([0, 0.57, -0.267], [0.365, 0.391, 0.215],
    packCloth, packBone, [0, 0, 0], "gadget backpack");
  box([0, 0.576, -0.387], [0.327, 0.337, 0.03], C.leatherDark, packBone);
  for (const s of [-1, 1]) {
    b.rod([s * 0.187, 0.38, -0.298], [s * 0.187, 0.786, -0.298],
      0.017, { color: brass, bone: packBone, sides: 8 });
    ball([s * 0.187, 0.781, -0.298], [0.023, 0.023, 0.023], brass, packBone);
    box([s * 0.113, 0.571, -0.408], [0.032, 0.345, 0.021],
      leather, packBone);
    buckle([s * 0.113, 0.468, -0.424], 0.045, 0.045, packBone);

    box([s * 0.186, 0.523, -0.221], [0.023, 0.203, 0.109],
      packCloth, packBone);
    drawing(pocketTex, [s * 0.199, 0.523, -0.221],
      [0.104, 0.193], packBone, [s, 0, 0]);
  }
  b.rod([-0.18, 0.381, -0.302], [0.18, 0.381, -0.302],
    0.017, { color: brass, bone: packBone, sides: 8 });
  box([0, 0.735, -0.326], [0.385, 0.062, 0.229], leather, packBone);
  box([0, 0.688, -0.418], [0.335, 0.094, 0.027], leather, packBone);
  drawing(badgeTex, [0, 0.687, -0.434], [0.179, 0.078], packBone, [0, 0, -1]);

  b.rod([-0.217, 0.805, -0.284], [0.217, 0.805, -0.284],
    0.064, { color: "#a7a678", bone: packBone, sides: 10 });
  for (const s of [-1, 1]) {
    b.rod([s * 0.12, 0.805, -0.284], [s * 0.151, 0.805, -0.284],
      0.067, { color: C.leatherDark, bone: packBone, sides: 10 });
    torus([s * 0.219, 0.805, -0.284], 0.044, 0.006,
      "#6e7857", packBone, [s, 0, 0]);
    torus([s * 0.22, 0.805, -0.284], 0.024, 0.005,
      "#6e7857", packBone, [s, 0, 0]);
  }

  b.lathe([
    [0, 0], [0.07, 0], [0.087, 0.027], [0.089, 0.21],
    [0.065, 0.242], [0.032, 0.25], [0, 0.25],
  ], {
    at: [0, 0.405, -0.447], bone: packBone,
    color: copper, segments: 10, name: "copper backpack boiler",
  });
  for (const y of [0.444, 0.602]) {
    cylinder([0, y, -0.447], 0.093, 0.022, brass, packBone, [0, 1, 0], 10);
  }
  drawing(warningTex, [0, 0.521, -0.538], [0.071, 0.071], packBone, [0, 0, -1]);

  b.sweep([
    [-0.145, 0.56, -0.38], [-0.276, 0.56, -0.38], [-0.276, 0.747, -0.251],
  ], 0.017, { color: copper, bone: packBone, sides: 8 });
  cylinder([-0.283, 0.781, -0.229], 0.064, 0.039,
    brass, packBone, [0, 0, 1], 12);
  drawing(gaugeTex, [-0.283, 0.781, -0.207], [0.109, 0.109], packBone);
  torus([-0.283, 0.781, -0.206], 0.056, 0.007, brass, packBone);

  b.sweep([
    [-0.115, 0.63, -0.448], [-0.26, 0.678, -0.448],
    [-0.303, 0.794, -0.435], [-0.303, 1.044, -0.435],
  ], 0.033, {
    color: copper, bone: packBone, sides: 8, caps: "flat",
    name: "bent exhaust chimney",
  });
  for (const y of [0.828, 0.965, 1.041]) {
    cylinder([-0.303, y, -0.435], 0.039, 0.025,
      brass, packBone, [0, 1, 0], 8);
  }
  cylinder([-0.303, 1.056, -0.435], 0.028, 0.002, C.deep, packBone);
  b.rod([-0.332, 1.052, -0.435], [-0.332, 1.095, -0.435],
    0.006, { color: steel, bone: packBone });
  b.part(new THREE.ConeGeometry(0.058, 0.026, 8), iron, {
    at: [-0.303, 1.092, -0.435], bone: packBone, rotation: [0, 0, -12],
  });

  b.rod([0.245, 0.509, -0.355], [0.274, 0.967, -0.337],
    0.038, { color: brass, bone: packBone, sides: 8 });
  b.rod([0.274, 0.941, -0.337], [0.278, 1.052, -0.333],
    0.047, { color: C.leatherDark, bone: packBone, sides: 10 });
  cylinder([0.279, 1.053, -0.333], 0.053, 0.024,
    brass, packBone, [0.06, 1, 0.04], 10);
  cylinder([0.28, 1.068, -0.333], 0.04, 0.004,
    "#80b7a9", packBone, [0.06, 1, 0.04], 10);
  for (const y of [0.565, 0.709]) {
    box([0.218, y, -0.355], [0.094, 0.031, 0.109], C.leatherDark, packBone);
    rivet([0.255, y, -0.295], packBone);
  }

  // Three-bladed generator, static guard cage, independently rigged rotor.
  b.rod([0.165, 0.707, -0.321], [0.365, 0.892, -0.304],
    0.018, { color: steel, bone: packBone, sides: 6 });
  cylinder([0.365, 0.892, -0.273], 0.048, 0.064,
    copper, fanBone, [0, 0, 1], 10);
  torus([0.365, 0.892, -0.231], 0.108, 0.007, brass, packBone);
  for (let i = 0; i < 3; i++) {
    const a = i * Math.PI * 2 / 3;
    b.extrude([
      [0.016, -0.012], [0.09, -0.031], [0.102, -0.013],
      [0.076, 0.018], [0.019, 0.014],
    ], {
      at: [0.365, 0.892, -0.223],
      x: [Math.cos(a), Math.sin(a), 0],
      y: [-Math.sin(a), Math.cos(a), 0],
      thickness: 0.008, color: C.lightTeal, bone: fanBone,
      name: "little generator propeller",
    });
    b.rod([0.365, 0.892, -0.259], [
      0.365 + Math.cos(a) * 0.108,
      0.892 + Math.sin(a) * 0.108, -0.231,
    ], 0.004, { color: brass, bone: packBone, sides: 5 });
  }
  b.part(gearGeometry({ teeth: 12, radius: 0.028, thickness: 0.012 }),
    brass, { at: [0.365, 0.892, -0.211], dir: [0, 0, 1], bone: fanBone });
  glow(ball([0.365, 0.892, -0.198], [0.011, 0.011, 0.009],
    "#b8f7db", fanBone, "generator indicator"), 1.15);

  // Exposed glowing glass: no opaque outer cylinder conceals the light.
  cylinder([0.213, 0.479, -0.423], 0.021, 0.166,
    C.deep, packBone, [0, 1, 0], 8);
  glow(cylinder([0.213, 0.48, -0.423], 0.035, 0.137,
    "#75dfc7", packBone, [0, 1, 0], 8), 1.5);
  for (const y of [0.403, 0.557]) {
    cylinder([0.213, y, -0.423], 0.047, 0.026,
      brass, packBone, [0, 1, 0], 8);
  }
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2;
    b.rod([
      0.213 + 0.041 * Math.cos(a), 0.411, -0.423 + 0.041 * Math.sin(a),
    ], [
      0.213 + 0.041 * Math.cos(a), 0.55, -0.423 + 0.041 * Math.sin(a),
    ], 0.005, { color: brass, bone: packBone, sides: 5 });
  }
  for (const y of [0.447, 0.512]) {
    cylinder([0.213, y, -0.423], 0.037, 0.007,
      brass, packBone, [0, 1, 0], 8);
  }
  b.sweep(catmull([
    [0.213, 0.564, -0.423], [0.289, 0.603, -0.466],
    [0.325, 0.719, -0.398], [0.365, 0.865, -0.287],
  ]), 0.009, { color: C.deep, bone: packBone, sides: 6 });
  b.sweep(coil([0.213, 0.56, -0.423], [0.233, 0.62, -0.433], 0.016, 4),
    0.003, { color: copper, bone: packBone, sides: 5 });

  b.rod([-0.045, 0.574, -0.485], [-0.093, 0.574, -0.536],
    0.024, { color: copper, bone: packBone, sides: 8 });
  cylinder([-0.093, 0.574, -0.537], 0.029, 0.024,
    brass, packBone, [0, 0, 1], 10);
  b.rod([-0.093, 0.574, -0.505], [-0.093, 0.574, -0.596],
    0.012, { color: steel, bone: packBone });
  b.part(gearGeometry({
    teeth: 18, radius: 0.052, thickness: 0.015, holes: 4,
  }), brass, {
    at: [-0.093, 0.574, -0.598], bone: packBone, dir: [0, 0, 1],
  });
  b.rod([-0.093, 0.574, -0.611], [-0.093, 0.618, -0.611],
    0.01, { color: brass, bone: packBone });
  for (const s of [-1, 1]) {
    torus([-0.093 + s * 0.031, 0.633, -0.611], 0.025, 0.009, brass, packBone);
  }
  cylinder([0.046, 0.678, -0.447], 0.017, 0.05, brass, packBone);
  torus([0.046, 0.709, -0.447], 0.035, 0.007, C.red, packBone, [0, 1, 0]);
  for (const d of [[1, 0, 0], [0, 0, 1]]) {
    b.rod([
      0.046 - d[0] * 0.031, 0.709, -0.447 - d[2] * 0.031,
    ], [
      0.046 + d[0] * 0.031, 0.709, -0.447 + d[2] * 0.031,
    ], 0.005, { color: C.red, bone: packBone, sides: 5 });
  }

  // Side holster with an open-ended wrench and screwdriver.
  box([-0.228, 0.469, -0.286], [0.067, 0.144, 0.103], leather, packBone);
  b.rod([-0.235, 0.436, -0.285], [-0.252, 0.706, -0.285],
    0.014, { color: steel, bone: packBone, section: "box" });
  b.extrude([
    [-0.018, -0.027], [-0.046, 0.007], [-0.039, 0.055],
    [-0.017, 0.067], [-0.016, 0.029], [0.012, 0.018],
    [0.033, 0.037], [0.028, 0.067], [0.049, 0.044],
    [0.051, 0.008], [0.02, -0.027],
  ], {
    at: [-0.252, 0.706, -0.285], x: [1, 0, 0], y: [0, 1, 0],
    thickness: 0.018, color: steel, bone: packBone,
    name: "open-ended wrench in holster",
  });
  b.rod([-0.212, 0.459, -0.232], [-0.205, 0.642, -0.232],
    0.009, { color: steel, bone: packBone, sides: 6 });
  b.rod([-0.205, 0.627, -0.232], [-0.201, 0.695, -0.232],
    0.019, { color: C.red, bone: packBone, sides: 6 });
  for (const y of [0.643, 0.661, 0.679]) {
    box([-0.201, y, -0.211], [0.021, 0.005, 0.004], C.rust, packBone);
  }

  cylinder([-0.194, 0.383, 0.127], 0.034, 0.015, brass, hips, [0, 0, 1], 12);
  drawing(gaugeTex, [-0.194, 0.383, 0.136], [0.057, 0.057], hips);
  b.sweep(catmull([
    [-0.082, 0.418, 0.164], [-0.13, 0.348, 0.178],
    [-0.19, 0.344, 0.156], [-0.194, 0.418, 0.128],
  ]), 0.0035, { color: brass, bone: hips, sides: 5 });

  // Restrained workshop dressing.
  for (let i = 0; i < 3; i++) {
    b.part(gearGeometry({
      teeth: 12 + i * 2, radius: 0.041 - i * 0.005,
      thickness: 0.009, bore: 0.009, holes: 3,
    }), i % 2 ? copper : brass, {
      at: [-0.36 - i * 0.07, 0.084, -0.14 + (i % 2) * 0.1],
      bone: root, rotation: [0, i * 19, 0], name: "spare cog on floor",
    });
  }
  cylinder([0.418, 0.101, -0.135], 0.078, 0.046, iron, root, [0, 1, 0], 10);
  cylinder([0.418, 0.126, -0.135], 0.066, 0.003, C.deep, root, [0, 1, 0], 10);
  torus([0.418, 0.127, -0.135], 0.072, 0.005, steel, root, [0, 1, 0]);
  for (let i = 0; i < 4; i++) {
    cylinder([0.382 + rand() * 0.066, 0.13, -0.168 + rand() * 0.066],
      0.01, 0.011, brass, root, [0, 1, 0], 6);
  }
  box([0.414, 0.079, 0.098], [0.151, 0.006, 0.119], C.paper, root,
    [0, 13, 0], "loose workshop plan");
  drawing(blueprintTex, [0.414, 0.083, 0.098], [0.132, 0.106], root, [0, 1, 0]);

  for (const s of [-1, 1]) {
    for (const y of [0.399, 0.51, 0.625, 0.753]) {
      rivet([s * 0.182, y, -0.278], packBone, 0.007);
    }
  }
  box([0.382, 0.659, 0.066], [0.072, 0.04, 0.009],
    C.paper, sides[0].arm.joints[0], [0, 0, -8], "patched sleeve");
  for (const x of [0.36, 0.377, 0.394]) {
    box([x, 0.659, 0.072], [0.004, 0.025, 0.003],
      C.leather, sides[0].arm.joints[0], [0, 0, -8]);
  }

  root.object.userData.subject = "gnome tinkerer";
  head.object.userData.features = ["eyes", "nose", "ears", "cap", "goggles"];
  jaw.object.userData.features = ["lower mouth", "beard"];
  packBone.object.userData.assembly = "removable gadget backpack";
  return b.root;
}
