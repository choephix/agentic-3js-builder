import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  lerp,
  catmull,
  limb,
  paint,
  cells,
  noise,
  mix,
  smoothstep,
  svg,
} from "../../../../src/index";
import type { Frame, Paint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Stained-Glass Peacock",
  description:
    "A displaying peacock built as a leaded stained-glass window: jewel-tone glass panes divided by dark lead came on body, neck and wings, a four-layer fanned train of glowing eyed feathers with cabochon jewels, a pom-pom crest and a rose medallion at the hub of the fan.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: lead came and jewel glass

const LEAD = "#24201d";
const LEAD_HI = "#8a8279";

const BLUE = ["#1638c4", "#1f4fe0", "#122c9c", "#2a66f0", "#1a45cf", "#0f2580", "#2e7cff"];
const NECK_TEAL = ["#138a9e", "#1aa3a8", "#1d6fd0"];
const BRONZE = ["#3f7d2a", "#5e9230", "#2f6b3d", "#8c8a2c", "#b08a2a", "#2a5f4f"];
const BELLY = ["#1a1f33", "#232a45", "#2b2438"];
const TAIL_COV = ["#4f8f2a", "#8aa02c", "#c6a032", "#2f7a4a", "#6a9a20"];
const HORN = ["#8f7d66", "#a28e72", "#7a6a58", "#b39d7e"];
const THIGH_C = ["#3a3530", "#2c2a2e", "#4a4038", "#3d3a44"];
const COV_LIGHT = ["#efe2bd", "#e2d2a2", "#f6ecd0"];
const COV_DARK = ["#2e241c", "#3a2c20", "#33281e"];
const PRIM_C = ["#b4501f", "#c96a2c", "#9e3f18", "#d98538"];
const SEC_C = ["#16405e", "#1d5a72", "#21365a", "#0f6a6a"];
const ARM_C = ["#123a6a", "#175a7a", "#1b4a9a", "#0e5a5a"];
const RECT_C = ["#5a3a22", "#6e4a2a", "#4a2f1c", "#7a5530"];

const JEWEL = "#3358ff";
const AMBER = "#ffb02e";
const CLAW = "#2e2620";

const pickc = (list: readonly string[], t: number) =>
  list[Math.min(list.length - 1, Math.max(0, Math.floor(t * list.length)))];

// ---------------------------------------------------------------------------------------------------------------
// Glass paint: Worley panes, each one colour chosen by where its centre sits, split by lead came with a bright
// ridge, rippled cathedral-glass sheen, a dark bevel inside every pane and a soft glint at its centre.

type Region = (c: THREE.Vector3, id: number) => string;

function glass(region: Region, size: number, seed: number, lead = 0.1): Paint {
  return paint((p, n) => {
    const c = cells(p, size, seed);
    const e = c.d2 - c.d1;
    if (e < lead) return e < lead * 0.3 && n.y > -0.3 ? LEAD_HI : LEAD;
    const base = region(c.center, c.id);
    const ripple = noise(p, size * 0.3, seed + 7);
    let col = mix(base, "#ffffff", 0.22 * smoothstep(0.6, 0.9, ripple));
    col = mix(col, "#05040a", 0.35 * smoothstep(lead + 0.15, lead, e));
    col = mix(col, "#fff6d8", 0.14 * smoothstep(0.35, 0.05, c.d1));
    const lit = 0.86 + 0.22 * smoothstep(-0.7, 0.9, n.y);
    return [Math.min(1, col[0] * lit), Math.min(1, col[1] * lit), Math.min(1, col[2] * lit)];
  });
}

/** An extruded blade of glass: lead on its walls and down its rachis, glass on its faces. */
function bladeGlass(base: Paint, thick: THREE.Vector3): Paint {
  return paint((_p, n, s) => {
    if (Math.abs(n.dot(thick)) < 0.5) return LEAD;
    if (Math.abs(s[1]) < 0.0022) return LEAD;
    return base;
  });
}

// Body: cobalt breast and neck, bronze-green back, dark belly, gold-green tail coverts.
const BODY = glass(
  (c, id) => {
    const j = (id - 0.5) * 0.06;
    if (c.z + j > 0.03 || (c.z + j > -0.08 && c.y > 0.72)) return pickc(BLUE, id);
    if (c.y < 0.52 && c.z > -0.22) return pickc(BELLY, id);
    if (c.z < -0.24) return pickc(TAIL_COV, id);
    return pickc(BRONZE, id);
  },
  0.042,
  11,
  0.1,
);
const NECK = glass(
  (c, id) => (c.z < 0.18 && c.y < 0.86 && id > 0.78 ? pickc(NECK_TEAL, id) : pickc(BLUE, id)),
  0.026,
  13,
  0.12,
);
const HEADP = glass((_c, id) => pickc(BLUE, id), 0.016, 17, 0.15);
const LEGP = glass((_c, id) => pickc(HORN, id), 0.012, 19, 0.15);
const THIGH = glass((_c, id) => pickc(THIGH_C, id), 0.02, 23, 0.12);
const COVERT = glass(
  (c, id) => ((Math.floor((c.y + c.z * 0.7) / 0.028) & 1) === 1 ? pickc(COV_DARK, id) : pickc(COV_LIGHT, id)),
  0.022,
  31,
  0.12,
);
const COVERT_SHEET = paint((_p, _n, s) => (s[1] > 0.93 || s[0] > 0.965 ? LEAD : COVERT));
const ARM = glass((_c, id) => pickc(ARM_C, id), 0.02, 37, 0.13);
const PRIM = glass((_c, id) => pickc(PRIM_C, id), 0.026, 41, 0.12);
const SEC = glass((_c, id) => pickc(SEC_C, id), 0.024, 43, 0.12);
const RECT = glass((_c, id) => pickc(RECT_C, id), 0.03, 47, 0.12);

// ---------------------------------------------------------------------------------------------------------------
// Drawings

type FeatherInk = {
  barbs: string[];
  fringe: string;
  band: string;
  turq: string;
  ring: string;
  heart: string;
  hl: string;
};

/** A train feather pane: glass barb shards up a lead shaft, then the leaded eye with its radial cames. */
function featherSvg(c: FeatherInk) {
  let barbs = "";
  for (let k = 0; k < 9; k++) {
    const y = 194 - k * 12;
    const w = 6 + k * 2;
    const col = c.barbs[k % c.barbs.length];
    for (const sd of [-1, 1]) {
      barbs += `<path d="M30 ${y} L${30 + sd * w} ${y - 10} L${(30 + sd * w * 0.7).toFixed(1)} ${y - 19} L30 ${y - 8} Z" fill="${col}" stroke="${LEAD}" stroke-width="1.6" stroke-linejoin="round"/>`;
    }
  }
  const pts: string[] = [];
  for (let j = 0; j < 36; j++) {
    const a = (j / 36) * Math.PI * 2;
    const r = j % 2 ? 0.9 : 1;
    pts.push(`${(30 + Math.sin(a) * 28 * r).toFixed(1)} ${(52 - Math.cos(a) * 42 * r).toFixed(1)}`);
  }
  const fringe = `M${pts.join(" L")} Z`;
  let spokes = "";
  for (let j = 0; j < 10; j++) {
    const a = (j / 10) * Math.PI * 2 + 0.3;
    spokes += `<path d="M30 56 L${(30 + Math.sin(a) * 40).toFixed(1)} ${(56 - Math.cos(a) * 52).toFixed(1)}" stroke="${LEAD}" stroke-width="1.8"/>`;
  }
  return `<svg viewBox="0 0 60 200" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="eye"><path d="${fringe}"/></clipPath></defs>
    ${barbs}
    <path d="M30 200 L30 94" stroke="${LEAD}" stroke-width="3.4" stroke-linecap="round"/>
    <path d="${fringe}" fill="${c.fringe}" stroke="${LEAD}" stroke-width="2.4" stroke-linejoin="round"/>
    <ellipse cx="30" cy="54" rx="21" ry="31" fill="${c.band}" stroke="${LEAD}" stroke-width="2.2"/>
    <ellipse cx="30" cy="57" rx="15.5" ry="23" fill="${c.turq}" stroke="${LEAD}" stroke-width="2.2"/>
    <g clip-path="url(#eye)">${spokes}</g>
    <ellipse cx="30" cy="58" rx="10.5" ry="15.5" fill="${c.ring}" stroke="${LEAD}" stroke-width="2"/>
    <path d="M30 46 C37 46 39 56 37 64 C35 70 25 70 23 64 C21 56 23 46 30 46 Z" fill="${c.heart}" stroke="${LEAD}" stroke-width="2"/>
    <ellipse cx="27.5" cy="53" rx="2.6" ry="4.2" fill="${c.hl}"/>
    <circle cx="33" cy="62" r="1.4" fill="#ffffff"/>
  </svg>`;
}

/** A fishtail "sword" feather for the lower edges of the fan: long bronze shards and a notched tip. */
function swordSvg() {
  let shards = "";
  const cols = ["#5e9230", "#8c8a2c", "#3f7d2a", "#b08a2a"];
  for (let k = 0; k < 11; k++) {
    const y = 196 - k * 13;
    const w = 5 + k * 1.7;
    for (const sd of [-1, 1]) {
      shards += `<path d="M30 ${y} L${(30 + sd * w).toFixed(1)} ${y - 14} L${(30 + sd * w * 0.6).toFixed(1)} ${y - 22} L30 ${y - 10} Z" fill="${cols[(k + (sd > 0 ? 1 : 0)) % 4]}" stroke="${LEAD}" stroke-width="1.6" stroke-linejoin="round"/>`;
    }
  }
  return `<svg viewBox="0 0 60 200" xmlns="http://www.w3.org/2000/svg">
    ${shards}
    <path d="M30 64 L6 14 L17 6 L30 30 L43 6 L54 14 Z" fill="#c6a032" stroke="${LEAD}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M30 60 L14 16 M30 60 L46 16 M30 44 L30 30" stroke="${LEAD}" stroke-width="1.8"/>
    <path d="M30 200 L30 30" stroke="${LEAD}" stroke-width="3.2" stroke-linecap="round"/>
  </svg>`;
}

/** A crest pom-pom: a leaded teardrop of turquoise round a cobalt heart, on a short stalk. */
const CREST_SVG = `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 60 L20 38" stroke="${LEAD}" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M20 3 C35 9 37 30 20 42 C3 30 5 9 20 3 Z" fill="#1fb8c8" stroke="${LEAD}" stroke-width="2.6"/>
  <path d="M20 12 C28 16 29 28 20 34 C11 28 12 16 20 12 Z" fill="#1a3cc0" stroke="${LEAD}" stroke-width="2.2"/>
  <path d="M20 3 L20 12 M8 20 L13 22 M32 20 L27 22" stroke="${LEAD}" stroke-width="2"/>
  <ellipse cx="17" cy="20" rx="2" ry="3.5" fill="#8fb4ff"/>
</svg>`;

/** The face as drawn for the bird's right side (beak toward the drawing's right): white stripes and a leaded eye. */
const FACE_SVG = `<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M88 40 Q62 18 12 32 Q58 30 86 50 Z" fill="#f4f1e6" stroke="${LEAD}" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M86 62 Q62 92 22 70 Q60 80 80 58 Z" fill="#f4f1e6" stroke="${LEAD}" stroke-width="3.2" stroke-linejoin="round"/>
  <circle cx="64" cy="52" r="17" fill="#3a2414" stroke="${LEAD}" stroke-width="4.5"/>
  <circle cx="64" cy="52" r="12" fill="#c0862a" stroke="${LEAD}" stroke-width="2.5"/>
  <circle cx="65" cy="53" r="7.5" fill="#0a0806"/>
  <circle cx="59" cy="46" r="4.2" fill="#ffffff"/>
  <circle cx="70" cy="58" r="1.8" fill="#ffffff"/>
  <path d="M47 52 L35 52 M81 52 L90 52" stroke="${LEAD}" stroke-width="2.6"/>
</svg>`;

/** The rose medallion at the hub of the fan, seen from behind. */
function roseSvg() {
  const pt = (r: number, deg: number) =>
    `${(50 + r * Math.sin((deg * Math.PI) / 180)).toFixed(2)} ${(50 - r * Math.cos((deg * Math.PI) / 180)).toFixed(2)}`;
  const cols = ["#c0182c", "#1d3fbf", "#e0a020", "#1f8a5a"];
  let petals = "";
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * 360;
    petals += `<path d="M50 50 L${pt(46, a - 15)} A46 46 0 0 1 ${pt(46, a + 15)} Z" fill="${cols[k % 4]}" stroke="${LEAD}" stroke-width="2.6"/>`;
  }
  let inner = "";
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * 360 + 15;
    inner += `<path d="M50 50 Q${pt(22, a - 30)} ${pt(28, a)} Q${pt(22, a + 30)} 50 50 Z" fill="${k % 2 ? "#2e7cff" : "#ffcf4a"}" stroke="${LEAD}" stroke-width="2.2"/>`;
  }
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#3f7d2a" stroke="${LEAD}" stroke-width="3"/>
    ${petals}
    <circle cx="50" cy="50" r="31" fill="#123a6a" stroke="${LEAD}" stroke-width="2.6"/>
    ${inner}
    <circle cx="50" cy="50" r="8" fill="#c0182c" stroke="${LEAD}" stroke-width="2.4"/>
    <circle cx="47.5" cy="47.5" r="2.4" fill="#ffd0d0"/>
  </svg>`;
}

const FEATHER_A = svg(
  featherSvg({
    barbs: ["#5e9230", "#8c8a2c", "#3f7d2a", "#b08a2a"],
    fringe: "#7aa52a",
    band: "#c2782a",
    turq: "#22c4b2",
    ring: "#8a5a1e",
    heart: "#1530b0",
    hl: "#6f9cff",
  }),
  { size: 512 },
);
const FEATHER_B = svg(
  featherSvg({
    barbs: ["#8aa02c", "#c6a032", "#4f8f2a", "#6a9a20"],
    fringe: "#a8a82a",
    band: "#d08a30",
    turq: "#2ad0a0",
    ring: "#7a4a18",
    heart: "#1a3cd0",
    hl: "#8fb4ff",
  }),
  { size: 512 },
);
const FEATHER_C = svg(
  featherSvg({
    barbs: ["#3f7d2a", "#2f6b3d", "#5e9230"],
    fringe: "#4f8f2a",
    band: "#b06a24",
    turq: "#1aa8c8",
    ring: "#6a4214",
    heart: "#0f2590",
    hl: "#5a88ff",
  }),
  { size: 512 },
);
const SWORD = svg(swordSvg(), { size: 512 });
const CREST = svg(CREST_SVG, { size: 128 });
const FACE = svg(FACE_SVG, { size: 256 });
const ROSE = svg(roseSvg(), { size: 384 });

type OP = [number, number] | [number, number, "sharp"];
const bladeOutline = (len: number, w: number): OP[] => [
  [0, -w * 0.6],
  [len * 0.3, -w],
  [len * 0.8, -w * 0.85],
  [len, 0, "sharp"],
  [len * 0.8, w * 0.85],
  [len * 0.3, w],
  [0, w * 0.6],
];

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "peacock", paintSize: 2048 });
  const r = rng(20250);

  // ----- Skeleton: hips, spine, neck, head, tail base -----
  const hips = b.joint("hips", { at: [0, 0.6, -0.1] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.61, 0.0],
      [0, 0.66, 0.12],
    ],
    { parent: hips, names: ["spine1", "chest"], role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];
  const tailBase = b.joint("tailBase", { parent: hips, at: [0, 0.66, -0.3], dir: [0, 0.25, -1], role: "tail" });

  const neckPath = catmull([
    [0, 0.68, 0.14],
    [0, 0.8, 0.205],
    [0, 0.93, 0.2],
    [0, 1.02, 0.24],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: chest,
    count: 3,
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[2], at: neckPath.at(1), dir: [0, -0.12, 1], role: "head" });

  // ----- Body: one leaded loft from rump to breast -----
  b.loft(
    [
      { at: [0, 0.66, -0.36], w: 0.1, h: 0.08 },
      { at: [0, 0.64, -0.25], w: 0.24, h: 0.22 },
      { at: [0, 0.61, -0.08], w: 0.32, h: 0.3 },
      { at: [0, 0.63, 0.07], w: 0.3, h: 0.3 },
      { at: [0, 0.7, 0.17], w: 0.2, h: 0.22 },
      { at: [0, 0.76, 0.2], w: 0.12, h: 0.14 },
    ],
    { bone: [hips, spine], color: BODY },
  );

  // ----- Neck: slender cobalt S-curve -----
  b.sweep(neck, [0.068, 0.05, 0.04, 0.034], { color: NECK });

  // ----- Head -----
  const HC = head.local({ forward: 0.022, up: 0.02 });
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), HEADP, {
    bone: head,
    at: HC,
    scale: [0.05, 0.056, 0.066],
  });
  const skin = b.surface(skull);

  // Face: white stripes and leaded eyes, decaled onto the skull.
  for (const s of [1, -1]) {
    const eyeHit = skin.around(HC).at(s * 55, 12)!;
    b.decal(skull, FACE, { at: eyeHit, size: [0.066, 0.055], mirror: s > 0 });
  }

  // Beak: upper on the head, lower on its own jaw.
  b.part(new THREE.ConeGeometry(0.019, 0.066, 6), LEGP, {
    bone: head,
    at: head.local({ forward: 0.11, up: 0.012 }),
    dir: [0, -0.2, 1],
    scale: [1, 1, 0.62],
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.074, down: 0.004 }),
    aim: head.local({ forward: 0.13, down: 0.016 }),
    role: "jaw",
  });
  b.part(new THREE.ConeGeometry(0.013, 0.05, 6), LEGP, {
    bone: jaw,
    at: jaw.local([0, 0.025, 0]),
    dir: jaw,
    scale: [1, 1, 0.6],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0035, 6, 4), LEAD, {
      bone: head,
      at: head.local({ forward: 0.1, up: 0.02, left: s * 0.008 }),
    });
  }

  // Crest: a sagittal fan of lead stalks tipped with glowing glass pom-poms.
  const crown = skin.around(HC).at(0, 68)!;
  const crestTips: Frame[] = [];
  b.ring(
    frame(crown, [1, 0, 0]),
    { count: 11, radius: 0.005, fromDeg: -50, toDeg: 38, joints: 1, name: "crest", parent: head, role: "fan" },
    (item) => {
      const len = 0.07 + 0.012 * Math.cos(((item.i - 5) / 5) * 1.2);
      b.spike(item, item, len, 0.0024, { color: LEAD, sides: 4 });
      crestTips.push(item.moved(item.local([0, len - 0.012, 0])));
    },
  );
  glow(b.cards(crestTips, CREST, { size: [0.026, 0.038], cross: true, flow: [1, 0, 0], sink: 0 }), 1.25);
  b.part(new THREE.SphereGeometry(0.008, 6, 4), AMBER, { bone: head, at: crown.at });

  // ----- Wings: drooped and half open, as in display -----
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const P = (x: number, y: number, z: number): [number, number, number] => [s * x, y, z];
    const wing = b.chain(
      `wing${S}`,
      catmull([P(0.12, 0.7, 0.1), P(0.25, 0.65, 0.07), P(0.37, 0.57, 0.02), P(0.48, 0.47, -0.02)]),
      { parent: chest, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `wingTip${S}`], role: "wing" },
    );
    const elbow = wing.joints[1];
    const wrist = wing.joints[2];
    const tip = wing.joints[3];

    const arm = b.sweep(wing, [0.034, 0.026, 0.017], { color: ARM });
    b.along(arm, 4, (at) => {
      glow(b.stick(new THREE.SphereGeometry(0.009, 6, 4), AMBER, at, { embed: 0.45 }), 1.3);
    });

    const trail = catmull([P(0.11, 0.6, -0.03), P(0.24, 0.53, -0.09), P(0.36, 0.45, -0.11), P(0.47, 0.4, -0.09)]);
    b.membrane(wing, trail, { color: COVERT_SHEET, thickness: 0.01 });

    const W0 = wrist.at.clone();
    const W1 = tip.at.clone();
    const span = W1.clone().sub(W0).normalize();
    const Nw = new THREE.Vector3().crossVectors(span, new THREE.Vector3(0, -0.35, -1)).normalize();

    // Primaries: chestnut glass blades fanning from the hand.
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const base = lerp(W0, W1, 0.05 + 0.9 * t);
      const dir = new THREE.Vector3(s * (0.3 + 0.45 * t), -0.6, -0.8 + 0.55 * t).normalize();
      const yv = new THREE.Vector3().crossVectors(Nw, dir).normalize();
      const thick = new THREE.Vector3().crossVectors(dir, yv).normalize();
      base.addScaledVector(thick, 0.004 * i);
      b.extrude(bladeOutline(0.17 + 0.07 * t, 0.024), {
        at: base,
        x: dir,
        y: yv,
        thickness: 0.007,
        bevel: 0.002,
        smoothing: 1,
        color: bladeGlass(PRIM, thick),
        bone: wrist,
      });
    }

    // Secondaries: blue-green blades along the trailing edge.
    for (let i = 0; i < 5; i++) {
      const t = 0.12 + 0.19 * i;
      const dir = new THREE.Vector3(s * (0.05 + 0.1 * (i / 4)), -0.55, -0.82).normalize();
      const yv = new THREE.Vector3().crossVectors(Nw, dir).normalize();
      const thick = new THREE.Vector3().crossVectors(dir, yv).normalize();
      const base = trail.at(t).clone().addScaledVector(dir, -0.025).addScaledVector(thick, 0.006 + 0.003 * i);
      b.extrude(bladeOutline(0.14, 0.026), {
        at: base,
        x: dir,
        y: yv,
        thickness: 0.006,
        bevel: 0.002,
        smoothing: 1,
        color: bladeGlass(SEC, thick),
        bone: t < 0.5 ? elbow : wrist,
      });
    }
  }

  // ----- Legs: feathered thighs, scaled horn shanks, four toes and a spur each -----
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const fx = s * 0.09;
    const fz = 0.05;
    const pts = limb([s * 0.075, 0.52, -0.03], [fx, 0.014, fz], [0.15, 0.22, 0.22], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`],
      role: "leg",
      contact: [fx, 0, fz],
    });
    const [hipJ, kneeJ, ankleJ, footJ] = leg.joints;
    b.sweep(leg, [0.024, 0.018, 0.014, 0.012], { color: LEGP });
    b.capsule(hipJ, lerp(kneeJ.at, ankleJ.at, 0.3), [0.05, 0.03], { color: THIGH });

    // Spur on the back of the shank.
    b.spike(lerp(ankleJ.at, footJ.at, 0.55), [0, -0.1, -1], 0.022, 0.005, { color: CLAW, bone: ankleJ });

    const footAt = footJ.at.clone();
    const toes: [number, number, string][] = [
      [-28, 0.075, "In"],
      [0, 0.085, "Mid"],
      [28, 0.075, "Out"],
      [180, 0.045, "Back"],
    ];
    for (const [deg, len, nm] of toes) {
      const a = (deg * Math.PI) / 180;
      const tipP = new THREE.Vector3(fx + s * Math.sin(a) * len, 0.009, fz + Math.cos(a) * len);
      const toe = b.joint(`toe${nm}${S}`, { parent: footJ, at: footAt, aim: tipP, role: "digit" });
      b.capsule(footAt, tipP, [0.011, 0.008], { color: LEGP, bone: toe });
      const cd = tipP.clone().sub(footAt).setY(0).normalize().add(new THREE.Vector3(0, -0.25, 0)).normalize();
      b.spike(tipP, cd, 0.02, 0.006, { color: CLAW, bone: toe });
    }
  }

  // ----- The train: four layers of glowing glass feathers fanned round the rump -----
  const FAN_AXIS: [number, number, number] = [0, 0.12, 1];
  type Layer = {
    name: string;
    count: number;
    len: number;
    from: number;
    to: number;
    dz: number;
    card: number;
    joints: number;
    jewel: boolean;
    sword: boolean;
    texA: THREE.Texture;
    texB: THREE.Texture;
  };
  const LAYERS: Layer[] = [
    { name: "trainA", count: 27, len: 1.12, from: -98, to: 98, dz: 0, card: 0.6, joints: 7, jewel: true, sword: true, texA: FEATHER_A, texB: FEATHER_B },
    { name: "trainB", count: 23, len: 0.86, from: -92, to: 92, dz: 0.035, card: 0.48, joints: 6, jewel: true, sword: false, texA: FEATHER_B, texB: FEATHER_A },
    { name: "trainC", count: 19, len: 0.62, from: -86, to: 86, dz: 0.07, card: 0.36, joints: 5, jewel: false, sword: false, texA: FEATHER_C, texB: FEATHER_A },
    { name: "trainD", count: 13, len: 0.4, from: -78, to: 78, dz: 0.1, card: 0.26, joints: 4, jewel: false, sword: false, texA: FEATHER_A, texB: FEATHER_C },
  ];

  for (const L of LAYERS) {
    const framesA: Frame[] = [];
    const framesB: Frame[] = [];
    const framesS: Frame[] = [];
    const cardLen = L.card;
    const swordLen = cardLen * 0.9;
    b.ring(
      frame([0, 0.66, -0.33 + L.dz], FAN_AXIS),
      {
        count: L.count,
        radius: 0.05,
        fromDeg: L.from,
        toDeg: L.to,
        tilt: 10,
        joints: L.joints,
        name: L.name,
        parent: tailBase,
        role: "tail",
      },
      (item) => {
        const u = item.i / (L.count - 1);
        const ang = ((L.from + (L.to - L.from) * u) * Math.PI) / 180;
        const len = L.len * (0.9 + 0.1 * Math.cos(ang)) * (0.97 + 0.06 * r());
        const dz = (item.i % 2 ? 1 : -1) * 0.007;
        const sword = L.sword && (item.i < 2 || item.i > L.count - 3);
        const cl = sword ? swordLen : cardLen;
        // The rachis is a strip of lead came.
        b.spike(item.moved(item.local([0, 0, dz])), item, len - cl * 0.3, 0.0055, { color: LEAD, sides: 5 });
        const root = item.moved(item.local([0, len - cl, dz]));
        if (sword) framesS.push(root);
        else if (item.i % 2) framesB.push(root);
        else framesA.push(root);
        if (L.jewel && !sword) {
          glow(
            b.part(new THREE.SphereGeometry((0.016 * L.card) / 0.6, 8, 6), JEWEL, {
              frame: item.moved(item.local([0, len - cl * 0.24, dz + 0.006])),
              scale: [1, 1, 0.5],
            }),
            1.5,
          );
        }
      },
    );
    if (framesA.length)
      glow(b.cards(framesA, L.texA, { size: [cardLen * 0.3, cardLen], flow: [0, 0, 1], sink: 0 }), 1.1);
    if (framesB.length)
      glow(b.cards(framesB, L.texB, { size: [cardLen * 0.3, cardLen], flow: [0, 0, 1], sink: 0 }), 1.1);
    if (framesS.length)
      glow(b.cards(framesS, SWORD, { size: [swordLen * 0.3, swordLen], flow: [0, 0, 1], sink: 0 }), 1.05);
  }

  // Rectrices: the stiff brown tail feathers that prop the train from behind.
  b.ring(
    frame([0, 0.66, -0.365], FAN_AXIS),
    { count: 13, radius: 0.04, fromDeg: -84, toDeg: 84, tilt: 6 },
    (item) => {
      b.spike(item, item, 0.58, 0.016, { color: RECT, bone: tailBase, sides: 6 });
    },
  );

  // Rose medallion at the hub of the fan, facing back, with its lead rim.
  const hubAt: [number, number, number] = [0, 0.68, -0.397];
  const hubDir: [number, number, number] = [0, -0.12, -1];
  glow(
    b.part(new THREE.CircleGeometry(0.14, 24), "#ffffff", {
      bone: tailBase,
      at: hubAt,
      dir: hubDir,
      axis: "z",
      texture: ROSE,
    }),
    1.2,
  );
  b.part(new THREE.TorusGeometry(0.14, 0.009, 5, 24), LEAD, { bone: tailBase, at: hubAt, dir: hubDir, axis: "z" });
  glow(
    b.part(new THREE.SphereGeometry(0.018, 8, 6), "#c0182c", {
      bone: tailBase,
      at: [0, 0.68, -0.402],
      scale: [1, 1, 0.5],
    }),
    1.4,
  );

  return b.root;
}
