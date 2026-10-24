```ts
import * as THREE from "three";
import {
  bezier,
  catmull,
  cells,
  createBuilder,
  frame,
  limb,
  mix,
  noise,
  offset,
  paint,
  rgb,
  rng,
  smoothstep,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Stained Glass Peacock",
  description:
    "A peacock with a fully fanned train, built as a leaded stained-glass window: jewel-coloured glass panes divided by lead came on the body, glowing drawn feathers with eyes in the fan.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: lead came and jewel glass

type RGB = readonly [number, number, number];
const pal = (...c: string[]): RGB[] => c.map((x) => rgb(x));

const LEADC = "#15171e";
const LEAD_RGB = rgb(LEADC);
const LEAD_HI = rgb("#4d5565");
const GLOW_TINT = rgb("#fff3c0");
const QUILL = "#1d1f27";
const HORN = "#e8b650";
const CLAW = "#2a2620";
const TOE = "#8f8466";

const BLUES = pal("#1b44c4", "#2a66e6", "#1189cc", "#0e36a0", "#16a9c8", "#2f7ff0");
const TEALS = pal("#0f9f9a", "#14b3a8", "#1585b8", "#0c7f86", "#1fa8d0");
const GREENS = pal("#1f9f56", "#10803f", "#58bf36", "#0e9e86", "#c2b02a", "#2db36a");
const INDIGO = pal("#2c2a8e", "#3b2088", "#1c5a9e", "#251a6c", "#4a2aa0");
const AMBERS = pal("#e8a024", "#d4741a", "#f2c447", "#b8501a", "#a0602a");
const LEGS = pal("#b8a98a", "#8f8a6a", "#cdbf9a", "#a08a58");

/** A stained-glass paint: Worley panes of jewel glass, each one colour from the zone's palette, divided by lead came. */
function glass(zone: (c: THREE.Vector3) => RGB[], size: number, seed: number, gap = 0.13) {
  return paint((p, n) => {
    const c = cells(p, size, seed);
    const e = c.d2 - c.d1;
    const colors = zone(c.center);
    const base = colors[Math.min(Math.floor(c.id * colors.length), colors.length - 1)];
    const centre = 1 - smoothstep(0, 0.8, c.d1);
    const tinted = mix(base, GLOW_TINT, 0.28 * centre);
    const light = (0.86 + 0.14 * n.y) * (0.92 + 0.16 * noise(p, size * 0.7, seed + 4));
    const edge = 1 - 0.22 * (1 - smoothstep(gap, gap + 0.4, e));
    const k = light * edge;
    const lit: RGB = [Math.min(tinted[0] * k, 1), Math.min(tinted[1] * k, 1), Math.min(tinted[2] * k, 1)];
    const rim = e > gap * 0.3 && e < gap * 0.65 ? LEAD_HI : LEAD_RGB;
    return mix(rim, lit, smoothstep(gap - 0.03, gap + 0.03, e));
  });
}

/** Colour zones of the body: sapphire neck and breast, emerald back, teal flank, indigo belly. */
const bodyZone = (c: THREE.Vector3): RGB[] => {
  const cl = 0.5 + 0.35 * Math.max(0, c.z + 0.08);
  if (c.y > 0.76) return BLUES;
  if (c.z > 0.15 && c.y > 0.5) return BLUES;
  if (c.y > cl + 0.05) return GREENS;
  if (c.y < cl - 0.06) return INDIGO;
  return TEALS;
};
const BODY_PAINT = glass(bodyZone, 0.06, 3, 0.14);
const HEAD_PAINT = glass(() => BLUES, 0.032, 3, 0.15);
const LEG_PAINT = glass(() => LEGS, 0.034, 11, 0.1);
const TAIL_PAINT = glass(() => AMBERS, 0.05, 5, 0.14);

/** Smoothly keyed [t, rx, ry] radius profile. */
function keyed(keys: number[][]) {
  return (t: number): [number, number] => {
    if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const a = keys[i - 1];
        const c = keys[i];
        const u = smoothstep(a[0], c[0], t);
        return [a[1] + (c[1] - a[1]) * u, a[2] + (c[2] - a[2]) * u];
      }
    }
    const l = keys[keys.length - 1];
    return [l[1], l[2]];
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Textures: leaded glass drawings

const VANE =
  "M25 1 C38 1 47 18 47 50 C47 80 38 110 28 150 L26.5 199 L23.5 199 L22 150 C12 110 3 80 3 50 C3 18 12 1 25 1Z";

type FeatherPal = { bands: string[]; gold: string; ring: string; mid: string; core: string; pupil: string };

/** A tail feather as a leaded window: chevron barb panes, a shaft, and (when eyeY is given) the jewelled eye. */
function featherTex(p: FeatherPal, eyeY: number | null) {
  let bands = "";
  let leads = "";
  for (let y = -20, i = 0; y < 210; y += 20, i++) {
    bands += `<path d="M0 ${y} L25 ${y + 14} L50 ${y} L50 ${y + 20} L25 ${y + 34} L0 ${y + 20}Z" fill="${p.bands[i % p.bands.length]}"/>`;
    leads += `<path d="M0 ${y + 20} L25 ${y + 34} L50 ${y + 20}" fill="none" stroke="${LEADC}" stroke-width="2"/>`;
  }
  let eye = "";
  if (eyeY !== null) {
    const E = eyeY;
    eye = `
      <ellipse cx="25" cy="${E}" rx="14" ry="20" fill="${p.gold}" stroke="${LEADC}" stroke-width="2.2"/>
      <ellipse cx="25" cy="${E}" rx="11.5" ry="16.5" fill="${p.ring}" stroke="${LEADC}" stroke-width="1.8"/>
      <ellipse cx="25" cy="${E}" rx="9" ry="13" fill="${p.mid}" stroke="${LEADC}" stroke-width="1.6"/>
      <ellipse cx="25" cy="${E}" rx="6" ry="9" fill="${p.core}" stroke="${LEADC}" stroke-width="1.6"/>
      <ellipse cx="25" cy="${E + 1}" rx="2.8" ry="4.4" fill="${p.pupil}"/>
      <path d="M25 ${E - 20} L25 ${E + 20}" stroke="${LEADC}" stroke-width="1.4"/>
      <path d="M11 ${E + 3} L39 ${E - 3}" stroke="${LEADC}" stroke-width="1.2"/>
      <ellipse cx="22" cy="${E - 5}" rx="1.5" ry="2.4" fill="#ffffff" opacity="0.85"/>`;
  }
  return svg(
    `<svg viewBox="0 0 50 200" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="v"><path d="${VANE}"/></clipPath></defs>
      <g clip-path="url(#v)">${bands}${leads}</g>
      <path d="M25 2 L25 198" stroke="${LEADC}" stroke-width="2.2"/>
      ${eye}
      <path d="${VANE}" fill="none" stroke="${LEADC}" stroke-width="2.6" stroke-linejoin="round"/>
    </svg>`,
    { size: 480 },
  );
}

function wingTex(p: string[]) {
  const SH = "M20 1 C33 1 38 14 38 30 L36 63 L4 63 L2 30 C2 14 7 1 20 1Z";
  return svg(
    `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
      <path d="${SH}" fill="${p[0]}"/>
      <path d="M20 8 C29 8 32 18 32 31 L31 63 L9 63 L8 31 C8 18 11 8 20 8Z" fill="${p[1]}" stroke="${LEADC}" stroke-width="1.8"/>
      <path d="M20 17 C26 17 27 24 27 34 L26 63 L14 63 L13 34 C13 24 14 17 20 17Z" fill="${p[2]}" stroke="${LEADC}" stroke-width="1.8"/>
      <path d="M20 8 L20 63" stroke="${LEADC}" stroke-width="1.6"/>
      <path d="M8 40 L20 46 L32 40 M9 52 L20 58 L31 52" fill="none" stroke="${LEADC}" stroke-width="1.5"/>
      <path d="${SH}" fill="none" stroke="${LEADC}" stroke-width="2.2" stroke-linejoin="round"/>
    </svg>`,
    { size: 256 },
  );
}

function scaleTex(top: string, bottom: string, mid: string) {
  return svg(
    `<svg viewBox="0 0 30 34" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 1 C25 1 29 9 29 18 C29 28 21 33 15 33 C9 33 1 28 1 18 C1 9 5 1 15 1Z" fill="${bottom}"/>
      <path d="M15 1 C25 1 29 9 29 16 C22 13 8 13 1 16 C1 9 5 1 15 1Z" fill="${top}"/>
      <path d="M8 22 C11 17 19 17 22 22 C20 28 10 28 8 22Z" fill="${mid}" stroke="${LEADC}" stroke-width="1.4"/>
      <path d="M1 16 C8 13 22 13 29 16 M15 16 L15 33" fill="none" stroke="${LEADC}" stroke-width="1.6"/>
      <path d="M15 1 C25 1 29 9 29 18 C29 28 21 33 15 33 C9 33 1 28 1 18 C1 9 5 1 15 1Z" fill="none" stroke="${LEADC}" stroke-width="2.2"/>
    </svg>`,
    { size: 160 },
  );
}

function crestTex() {
  return svg(
    `<svg viewBox="0 0 24 44" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 1 C20 8 23 18 20 28 C18 36 14 42 12 43 C10 42 6 36 4 28 C1 18 4 8 12 1Z" fill="#12b6b0"/>
      <path d="M12 8 C17 13 18 20 16 27 C15 32 13 36 12 37 C11 36 9 32 8 27 C6 20 7 13 12 8Z" fill="#1f46d0"/>
      <path d="M12 3 L12 42 M5 22 L12 26 L19 22" fill="none" stroke="${LEADC}" stroke-width="1.6"/>
      <path d="M12 1 C20 8 23 18 20 28 C18 36 14 42 12 43 C10 42 6 36 4 28 C1 18 4 8 12 1Z" fill="none" stroke="${LEADC}" stroke-width="2.2" stroke-linejoin="round"/>
    </svg>`,
    { size: 192 },
  );
}

function headEyeTex() {
  return svg(
    `<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 22 C18 6 50 2 76 16 C58 14 30 18 4 30Z" fill="#f6f1de" stroke="${LEADC}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M30 11 L35 22 M52 8 L54 17" stroke="${LEADC}" stroke-width="2"/>
      <path d="M10 42 C24 58 56 60 74 44 C56 46 30 46 10 42Z" fill="#ebe8d6" stroke="${LEADC}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M34 46 L37 56 M56 46 L58 53" stroke="${LEADC}" stroke-width="2"/>
      <circle cx="40" cy="33" r="11" fill="${LEADC}"/>
      <circle cx="40" cy="33" r="8.2" fill="#e8a020"/>
      <path d="M40 25 L40 41 M32 33 L48 33" stroke="#a8620f" stroke-width="1.2"/>
      <circle cx="40" cy="33" r="4.2" fill="#0d0d12"/>
      <circle cx="36.5" cy="29.5" r="1.9" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );
}

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "peacock" });
  const R = rng(11);

  // Textures.
  const FEATHER_A = featherTex(
    { bands: ["#1fa65a", "#0f8a82", "#c9b030", "#16a36a"], gold: "#f2b930", ring: "#c8741a", mid: "#13b3b0", core: "#1f3fc8", pupil: "#2a1470" },
    40,
  );
  const FEATHER_B = featherTex(
    { bands: ["#1db37a", "#d9a82a", "#0e8f9f", "#3aa845"], gold: "#f6d04a", ring: "#2a8fd8", mid: "#0f55c8", core: "#6a2bbf", pupil: "#1a0f4a" },
    68,
  );
  const FEATHER_C = featherTex(
    { bands: ["#c8982a", "#1f9f56", "#0f6fa8", "#0f8f7a"], gold: "#e89a2a", ring: "#1fb08a", mid: "#1f4fd0", core: "#17a6c9", pupil: "#12104a" },
    96,
  );
  const FRINGE = featherTex(
    { bands: ["#e3b53a", "#1f9f56", "#c23a3a", "#0f9a8a"], gold: "", ring: "", mid: "", core: "", pupil: "" },
    null,
  );
  const SUPPORT = featherTex(
    { bands: ["#b86a1c", "#8a4a1a", "#d99a3a", "#6a3a1a"], gold: "", ring: "", mid: "", core: "", pupil: "" },
    null,
  );
  const COVERT = featherTex(
    { bands: ["#0f9a8a", "#1f6fd0", "#2db36a", "#12b6b0"], gold: "", ring: "", mid: "", core: "", pupil: "" },
    null,
  );
  const WING_A = wingTex(["#9a5a1a", "#e2a82c", "#1f9f56"]);
  const WING_B = wingTex(["#1f46d0", "#14a9b8", "#f0c040"]);
  const SCALE_A = scaleTex("#2a66e6", "#1b44c4", "#16a9c8");
  const SCALE_B = scaleTex("#14b3a8", "#1585b8", "#2f7ff0");
  const CREST_TIP = crestTex();
  const HEAD_EYE = headEyeTex();

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton
  const bodyPts: number[][] = [
    [0, 0.5, -0.3],
    [0, 0.5, -0.08],
    [0, 0.56, 0.12],
    [0, 0.67, 0.25],
    [0, 0.83, 0.31],
    [0, 0.97, 0.28],
    [0, 1.065, 0.31],
  ];
  const bodyPath = catmull(bodyPts);
  const tA = bodyPath.closestT(bodyPts[1]);
  const tB = bodyPath.closestT(bodyPts[3]);

  const hips = b.joint("hips", { at: bodyPts[0], aim: bodyPts[1], role: "spine" });
  const spine = b.chain("spine", bodyPath.slice(tA, tB), { parent: hips, count: 3, role: "spine" });
  const neck = b.chain("neck", bodyPath.slice(tB, 1), { parent: spine, count: 4, role: "neck" });
  const head = b.joint("head", { parent: neck, at: bodyPts[6], dir: [0, -0.05, 1], role: "head" });
  const hp = (x: number, y: number, z: number) => head.local({ left: x, up: y, forward: z });
  const jaw = b.joint("jaw", { parent: head, at: hp(0, -0.012, 0.025), aim: hp(0, -0.016, 0.1), role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.52, -0.27],
      [0, 0.56, -0.35],
      [0, 0.585, -0.43],
    ]),
    { parent: hips, count: 2, role: "tail" },
  );

  const wings: Record<string, ReturnType<typeof b.chain>> = {};
  const legs: Record<string, ReturnType<typeof b.chain>> = {};
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    wings[S] = b.chain(
      `wing${S}`,
      catmull([
        [s * 0.12, 0.63, 0.15],
        [s * 0.15, 0.58, -0.03],
        [s * 0.1, 0.56, -0.25],
      ]),
      { parent: spine.joints[2], names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "wing" },
    );
    const pts = limb(
      [s * 0.075, 0.44, 0.0],
      [s * 0.085, 0.012, 0.02],
      [0.15, 0.13, 0.19],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    legs[S] = b.chain(`leg${S}`, pts, {
      parent: spine.joints[1],
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`],
      role: "leg",
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Body, neck, head
  const bodyTube = b.sweep(
    bodyPath,
    keyed([
      [0, 0.035, 0.035],
      [0.06, 0.085, 0.09],
      [0.2, 0.125, 0.13],
      [0.4, 0.15, 0.15],
      [0.52, 0.135, 0.14],
      [0.6, 0.095, 0.1],
      [0.7, 0.052, 0.055],
      [0.78, 0.036, 0.036],
      [0.9, 0.03, 0.03],
      [1, 0.03, 0.03],
    ]),
    { bone: [hips, spine, neck], color: BODY_PAINT, sides: 10 },
  );
  const skin = b.surface(bodyTube);

  // Lead came rings round the neck and body.
  for (const on of [neck.joints[0], neck.joints[2], spine.joints[2], spine.joints[0]]) {
    try {
      b.sweep(skin.loop(on, { lift: 0.003 }), 0.0035, { color: LEADC, sides: 4 });
    } catch {
      /* the plane missed the surface: skip this ring */
    }
  }

  // Head.
  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), HEAD_PAINT, {
    bone: head,
    at: hp(0, 0.012, 0.01),
    scale: [0.048, 0.05, 0.062],
  });
  for (const s of [1, -1]) {
    b.decal(skull, HEAD_EYE, {
      at: hp(s * 0.045, 0.014, 0.022),
      dir: [s, 0, 0],
      size: [0.075, 0.056],
      mirror: s < 0,
    });
  }
  // Beak: separate upper and lower jaw.
  b.sweep([hp(0, 0.0, 0.045), hp(0, -0.012, 0.125)], (t) => [0.02 * (1 - t) + 0.002, 0.016 * (1 - t) + 0.002], {
    bone: head,
    color: HORN,
    sides: 6,
    caps: { start: "flat", end: "point" },
  });
  b.sweep([hp(0, -0.014, 0.04), hp(0, -0.02, 0.105)], (t) => [0.014 * (1 - t) + 0.002, 0.009 * (1 - t) + 0.002], {
    bone: jaw,
    color: "#c9983c",
    sides: 6,
    caps: { start: "flat", end: "point" },
  });

  // Crest: a spray of lead wires tipped with glowing glass.
  const crownPt = hp(0, 0.048, -0.01);
  const crestTips: ReturnType<typeof frame>[] = [];
  b.ring(frame(crownPt, [0, 1, 0]), { count: 9, radius: 0.012, tilt: 62 }, (it) => {
    const ctrl = offset(it, it, 0.06);
    ctrl.y += 0.015;
    const tip = offset(it, it, 0.12);
    tip.y += 0.02;
    b.sweep(bezier(it, ctrl, tip), [0.0035, 0.002], { color: LEADC, sides: 4 });
    crestTips.push(frame(tip, tip.clone().sub(ctrl)));
  });
  glow(b.cards(crestTips, CREST_TIP, { size: [0.045, 0.075], cross: true, flow: [0, 0, 1], bone: head }), 1);

  // Neck and breast hackles: little leaded scales.
  const hackles = skin.scatter(170, {
    rng: R,
    minDist: 0.03,
    filter: (h) => h.at.z > 0.1 && h.at.y > 0.58 && h.at.y < 1.02 && Math.abs(h.at.x) < 0.1 && h.n.y > -0.4,
  });
  glow(
    b.cards(hackles, [SCALE_A, SCALE_B], { size: [0.042, 0.058], lean: 72, flow: [0, -1, -0.25], vary: 0.2, rng: R }),
    0.5,
  );

  // -------------------------------------------------------------------------------------------------------------
  // Folded wings: shingled leaded feathers
  const tShoulder = bodyPath.closestT([0, 0.6, 0.16]);
  const tRump = bodyPath.closestT([0, 0.5, -0.2]);
  const ROWS = [38, 55, 72, 90, 108];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const frames: ReturnType<typeof bodyTube.at>[] = [];
    ROWS.forEach((deg, row) => {
      for (let i = 0; i < 9; i++) {
        const t = tShoulder + ((tRump - tShoulder) * i) / 8;
        frames.push(bodyTube.at(t, -s * deg, 0.004 * row + 0.003 * (i % 2)));
      }
    });
    glow(
      b.cards(frames, [WING_A, WING_B], {
        size: [0.085, 0.15],
        lean: 84,
        flow: [0, -0.12, -1],
        vary: 0.12,
        rng: R,
        bend: 10,
        bone: wings[S].joints[0],
      }),
      0.45,
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Legs and feet
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const leg = legs[S];
    b.sweep(leg, (t) => 0.014 + 0.05 * Math.pow(Math.max(0, 1 - t / 0.4), 2), {
      color: LEG_PAINT,
      sides: 6,
      smooth: false,
    });
    const foot = leg.joints[leg.joints.length - 1];
    const F = [s * 0.085, 0.011, 0.02];
    const spread = [-34, 0, 34];
    for (const a of spread) {
      const r = (a * Math.PI) / 180;
      const E = [F[0] + Math.sin(r) * 0.09, 0.011, F[2] + Math.cos(r) * 0.09];
      b.rod(F, E, [0.011, 0.0065], { color: TOE, bone: foot, sides: 6 });
      b.spike(E, [Math.sin(r), 0, Math.cos(r)], 0.03, 0.0065, { color: CLAW, bone: foot, sides: 5 });
    }
    b.rod(F, [F[0], 0.011, F[2] - 0.06], [0.011, 0.0065], { color: TOE, bone: foot, sides: 6 });
    // Spur on the back of the tarsus.
    const ankle = leg.joints[2];
    b.spike(ankle.local({ forward: -0.01, up: 0.0 }), [0, -0.3, -1], 0.04, 0.007, { color: CLAW, bone: ankle, sides: 5 });
  }

  // -------------------------------------------------------------------------------------------------------------
  // The train: a fan of leaded, glowing eyed feathers, in three interleaved layers
  const FAN_Y = 0.58;
  b.sweep(tail, [0.05, 0.035], { color: TAIL_PAINT, sides: 8 });

  const DELTA = 200 / 32;
  const LAYERS = [
    { name: "fanA", z: -0.33, k: 0, tex: FEATHER_A },
    { name: "fanB", z: -0.35, k: 1, tex: FEATHER_B },
    { name: "fanC", z: -0.37, k: 2, tex: FEATHER_C },
  ];
  for (const L of LAYERS) {
    const ring = b.ring(
      frame([0, FAN_Y, L.z], [0, 0, 1]),
      {
        count: 11,
        radius: 0.03,
        fromDeg: -100 + L.k * DELTA,
        toDeg: -100 + (L.k + 30) * DELTA,
        joints: 4,
        name: L.name,
        parent: tail,
        role: "fan",
      },
      (it) => {
        b.spike(it, it, 0.28, 0.006, { color: QUILL, sides: 5 });
      },
    );
    glow(b.cards(ring.items, L.tex, { size: [0.21, 0.84], flow: [0, 0, 1], lean: 6, sink: 0.02 }), 0.9);
  }

  // Fringe feathers behind the eyes, tall support quills at the back, short coverts hiding the roots.
  const fringe = b.ring(frame([0, FAN_Y, -0.39], [0, 0, 1]), {
    count: 21,
    radius: 0.035,
    fromDeg: -105,
    toDeg: 105,
    parent: tail,
    role: "fan",
  });
  glow(b.cards(fringe.items, FRINGE, { size: [0.17, 0.66], flow: [0, 0, 1], lean: 6, sink: 0.02 }), 0.8);

  const support = b.ring(frame([0, FAN_Y, -0.43], [0, 0, 1]), {
    count: 7,
    radius: 0.03,
    fromDeg: -48,
    toDeg: 48,
    parent: tail,
    role: "fan",
  });
  glow(b.cards(support.items, SUPPORT, { size: [0.12, 0.95], flow: [0, 0, 1], lean: 4, sink: 0.02 }), 0.6);

  const covert = b.ring(frame([0, FAN_Y, -0.3], [0, 0, 1]), {
    count: 17,
    radius: 0.04,
    fromDeg: -92,
    toDeg: 92,
    parent: tail,
    role: "fan",
  });
  glow(b.cards(covert.items, COVERT, { size: [0.1, 0.3], flow: [0, 0, 1], lean: 8, sink: 0.02 }), 0.8);

  return b.root;
}
```