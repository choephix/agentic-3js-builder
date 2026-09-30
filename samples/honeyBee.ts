import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { glow } from "../kits/glow";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Honey Bee",
  description:
    "A roly-poly bumblebee about 0.4 m long on a honeycomb hive block: fuzzy striped body, big shiny eyes, curly antennae, a hinged smiling jaw, four spread wings, six stubby legs, a honey dipper in its front hands and a labelled honey jar.",
};

// ---------------------------------------------------------------- palette
const HONEY = "#ffc93f";
const PLUM = "#56365f";
const CREAM = "#fff3d4";
const BERRY = "#7d2a55";
const BOOT = "#ffeaa8";
const WOOD = "#eeb97d";
const AMBER = "#ffb02a";
const GLASS = "#fff0c4";
const LID = "#ff93b5";
const WAX = "#ffd98c";

// ---------------------------------------------------------------- drawings
const TUFT = svg(
  `<svg viewBox="0 0 64 64"><path d="M6 64 L2 30 L20 44 L24 6 L38 38 L52 18 L58 64 Z" fill="#ffffff"/></svg>`,
  { size: 128 },
);

const EYE = svg(
  `<svg viewBox="0 0 100 130">
    <ellipse cx="50" cy="65" rx="47" ry="62" fill="#3b2348"/>
    <path d="M12 82 Q50 140 88 82 Q84 120 50 126 Q16 120 12 82 Z" fill="#7a4aa0"/>
    <ellipse cx="50" cy="65" rx="47" ry="62" fill="none" stroke="#2a1633" stroke-width="5"/>
    <circle cx="34" cy="38" r="18" fill="#ffffff"/>
    <circle cx="68" cy="92" r="8" fill="#ffffff"/>
    <circle cx="60" cy="74" r="4" fill="#ffffff"/>
  </svg>`,
  { size: 256 },
);

const BLUSH = svg(
  `<svg viewBox="0 0 80 40">
    <ellipse cx="40" cy="20" rx="38" ry="18" fill="#ff8fb0"/>
    <path d="M22 8 L16 30 M40 6 L34 32 M58 8 L52 30" stroke="#ff6b95" stroke-width="4" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 160 },
);

const MOUTH = svg(
  `<svg viewBox="0 0 64 34">
    <path d="M0 0 H64 A32 32 0 0 1 0 0 Z" fill="#7d2a55"/>
    <path d="M6 0 H58 V9 Q32 14 6 9 Z" fill="#ffffff"/>
    <ellipse cx="32" cy="27" rx="15" ry="9" fill="#ff7b9f"/>
    <path d="M32 18 V29" stroke="#e85582" stroke-width="3"/>
  </svg>`,
  { size: 256 },
);

const WING = svg(
  `<svg viewBox="0 0 100 200">
    <path d="M50 198 C12 150 4 62 38 8 C66 -4 97 48 89 112 C83 160 64 188 50 198 Z" fill="#e3f6ff" stroke="#8fcbe8" stroke-width="5" stroke-linejoin="round"/>
    <path d="M50 192 L42 14 M50 192 L76 40 M50 192 L86 100 M50 192 L18 80" stroke="#b4e0f4" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M26 70 C28 50 34 34 42 22" stroke="#ffffff" stroke-width="7" stroke-linecap="round" fill="none"/>
    <circle cx="62" cy="64" r="4.5" fill="#ffffff"/>
  </svg>`,
  { size: 400 },
);

// Honeycomb for the six walls: flat-top hexagons, 36 columns around, nearly two rows high.
function combWall() {
  const R = 6.67;
  const cells: string[] = [];
  for (let c = 0; c < 38; c++) {
    const cx = c * 1.5 * R;
    for (let r = -1; r < 3; r++) {
      const cy = r * Math.sqrt(3) * R + (c % 2 ? (Math.sqrt(3) * R) / 2 : 0) + 2;
      const pts = [0, 1, 2, 3, 4, 5]
        .map((k) => `${(cx + (R - 0.9) * Math.cos((k * Math.PI) / 3)).toFixed(2)},${(cy + (R - 0.9) * Math.sin((k * Math.PI) / 3)).toFixed(2)}`)
        .join(" ");
      const fill = (c * 7 + r * 3 + 11) % 5 === 0 ? "#ffd05a" : "#c97d1e";
      cells.push(`<polygon points="${pts}" fill="${fill}" stroke="#ffe7a6" stroke-width="1.3" stroke-linejoin="round"/>`);
    }
  }
  return svg(`<svg viewBox="0 0 360 20"><rect width="360" height="20" fill="#ffe7a6"/>${cells.join("")}</svg>`, {
    size: 1024,
  });
}

function combTop() {
  const R = 19;
  const cells: string[] = [];
  for (let c = -2; c < 9; c++) {
    for (let r = -2; r < 9; r++) {
      const cx = 100 + (c - 3) * 1.5 * R;
      const cy = 100 + (r - 3) * Math.sqrt(3) * R + (c % 2 ? (Math.sqrt(3) * R) / 2 : 0);
      const pts = [0, 1, 2, 3, 4, 5]
        .map((k) => `${(cx + (R - 1.6) * Math.cos((k * Math.PI) / 3)).toFixed(2)},${(cy + (R - 1.6) * Math.sin((k * Math.PI) / 3)).toFixed(2)}`)
        .join(" ");
      const k = (c * 5 + r * 3 + 40) % 7;
      const fill = k < 3 ? "#ffc12e" : k < 5 ? "#ffe39a" : "#b86f17";
      cells.push(`<polygon points="${pts}" fill="${fill}" stroke="#fff0c2" stroke-width="3" stroke-linejoin="round"/>`);
      if (k < 3) cells.push(`<ellipse cx="${(cx - 5).toFixed(1)}" cy="${(cy - 6).toFixed(1)}" rx="4.5" ry="2.6" fill="#fff3c4"/>`);
    }
  }
  return svg(`<svg viewBox="0 0 200 200"><rect width="200" height="200" fill="#fff0c2"/>${cells.join("")}</svg>`, {
    size: 1024,
  });
}

const LABEL = svg(
  `<svg viewBox="0 0 140 100">
    <path d="M6 14 Q70 4 134 14 L134 86 Q70 96 6 86 Z" fill="#fff6df" stroke="#e7892f" stroke-width="5" stroke-linejoin="round"/>
    <ellipse cx="70" cy="34" rx="15" ry="11" fill="#ffc93f"/>
    <path d="M62 24 V44 M74 24 V44" stroke="#56365f" stroke-width="5"/>
    <ellipse cx="55" cy="22" rx="9" ry="6" fill="#e3f6ff" stroke="#8fcbe8" stroke-width="2"/>
    <ellipse cx="85" cy="22" rx="9" ry="6" fill="#e3f6ff" stroke="#8fcbe8" stroke-width="2"/>
    <circle cx="61" cy="32" r="2.6" fill="#3b2348"/><circle cx="79" cy="32" r="2.6" fill="#3b2348"/>
    <text x="70" y="72" text-anchor="middle" font-family="Verdana, DejaVu Sans, sans-serif" font-weight="bold" font-size="20" fill="#c4561b">HONEY</text>
    <path d="M22 82 Q70 90 118 82" stroke="#ff93b5" stroke-width="5" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 512 },
);

const SHINE = svg(
  `<svg viewBox="0 0 40 100"><path d="M8 4 L32 4 L34 60 L6 60 Z" fill="#fffbe8" stroke="#fffbe8" stroke-width="6" stroke-linejoin="round"/><circle cx="20" cy="88" r="7" fill="#fffbe8"/></svg>`,
  { size: 128 },
);

const DAISY = svg(
  `<svg viewBox="0 0 64 128">
    <path d="M32 126 C30 100 34 80 32 58" stroke="#59b87e" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M32 100 C16 100 10 90 8 82 C24 82 30 90 32 100 Z" fill="#7ed9a0"/>
    <path d="M32 88 C46 88 54 80 56 72 C42 72 34 78 32 88 Z" fill="#7ed9a0"/>
    <g fill="#ffffff" stroke="#ffb3c9" stroke-width="2">
      <ellipse cx="32" cy="22" rx="8" ry="15"/><ellipse cx="32" cy="58" rx="8" ry="15"/>
      <ellipse cx="14" cy="40" rx="15" ry="8"/><ellipse cx="50" cy="40" rx="15" ry="8"/>
      <ellipse cx="19" cy="27" rx="8" ry="14" transform="rotate(-45 19 27)"/><ellipse cx="45" cy="27" rx="8" ry="14" transform="rotate(45 45 27)"/>
      <ellipse cx="19" cy="53" rx="8" ry="14" transform="rotate(45 19 53)"/><ellipse cx="45" cy="53" rx="8" ry="14" transform="rotate(-45 45 53)"/>
    </g>
    <circle cx="32" cy="40" r="10" fill="#ffc93f" stroke="#e7a320" stroke-width="2"/>
  </svg>`,
  { size: 256 },
);

const TULIP = svg(
  `<svg viewBox="0 0 64 128">
    <path d="M32 126 C34 100 30 80 32 56" stroke="#59b87e" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M32 110 C14 108 8 94 6 84 C24 86 30 96 32 110 Z" fill="#7ed9a0"/>
    <path d="M12 14 L22 30 L32 8 L42 30 L52 14 C54 46 46 62 32 62 C18 62 10 46 12 14 Z" fill="#ff93b5" stroke="#ff6f9c" stroke-width="3" stroke-linejoin="round"/>
    <path d="M32 8 L32 40" stroke="#ff6f9c" stroke-width="3"/>
  </svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------- helpers
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Smooth interpolation through evenly spaced keys (cosine eased), for radius profiles. */
function profile(keys: number[]) {
  return (t: number) => {
    const f = Math.min(Math.max(t, 0), 1) * (keys.length - 1);
    const i = Math.min(Math.floor(f), keys.length - 2);
    const u = (1 - Math.cos((f - i) * Math.PI)) / 2;
    return keys[i] * (1 - u) + keys[i + 1] * u;
  };
}

export default function build() {
  const b = createBuilder({ name: "honeyBee" });
  const rand = rng(11);
  const SIDES = [1, -1] as const;
  const tag = (s: number) => (s > 0 ? "L" : "R");

  // ================================================================ skeleton
  const root = b.joint("root", { at: [0, 0, 0], dir: [0, 1, 0] });
  const body = b.joint("body", { parent: root, at: [0, 0.25, 0.0], dir: [0, 0.04, 1], role: "spine" });

  const abdomenPath = catmull([
    [0, 0.246, -0.03],
    [0, 0.234, -0.095],
    [0, 0.224, -0.15],
    [0, 0.218, -0.19],
  ]);
  const abdomen = b.chain("abdomen", abdomenPath, {
    parent: body,
    names: ["abdomen1", "abdomen2", "abdomen3", "abdomenTip"],
    role: "tail",
  });

  const HEAD_C = v3(0, 0.285, 0.105);
  const neck = b.joint("neck", { parent: body, at: [0, 0.256, 0.06], aim: HEAD_C, role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.272, 0.095], dir: [0, 0.04, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.252, 0.13], dir: [0, 0, 1], role: "jaw" });

  // ================================================================ body: fuzzy striped tube
  const bodyPath = catmull([
    [0, 0.22, -0.172],
    [0, 0.232, -0.1],
    [0, 0.246, -0.03],
    [0, 0.256, 0.035],
    [0, 0.258, 0.07],
  ]);
  const radius = profile([0.03, 0.078, 0.1, 0.108, 0.106, 0.096, 0.08, 0.088, 0.088, 0.08, 0.066]);
  const STRIPES: [number, string][] = [
    [0.09, HONEY],
    [0.22, PLUM],
    [0.34, HONEY],
    [0.47, PLUM],
    [0.56, HONEY],
    [0.64, PLUM],
    [1, HONEY],
  ];
  const torso = b.sweep(bodyPath, (t) => [radius(t) * 1.04, radius(t) * 0.97], {
    bone: [abdomen, body, neck],
    sides: 8,
    smooth: false,
    bands: STRIPES,
  });
  // A plum shield on the thorax back.
  b.part(new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), PLUM, {
    bone: body,
    at: [0, 0.296, 0.012],
    scale: [0.05, 0.05, 0.055],
    flat: true,
  });

  // stinger
  b.spike([0, 0.219, -0.2], [0, -0.02, -1], 0.04, 0.014, { color: PLUM, sides: 5, smooth: false, bone: abdomen.joints[3] });

  // fuzz tufts, tinted to the stripe under them
  const skin = b.surface(torso);
  const fuzzHits = skin.scatter(85, { rng: rng(5), minDist: 0.045, filter: (h) => h.n.y > -0.35 });
  const tuftsBy = new Map<string, typeof fuzzHits>();
  for (const h of fuzzHits) {
    const t = bodyPath.closestT(h.at);
    const color = STRIPES.find(([end]) => t <= end)![1];
    tuftsBy.set(color, [...(tuftsBy.get(color) ?? []), h]);
  }
  for (const [color, hits] of tuftsBy)
    b.cards(hits, TUFT, { size: [0.046, 0.046], lean: 40, flow: [0, -0.25, -1], vary: 0.2, spin: 20, rng: rand, color, sink: 0.25 });

  // ================================================================ head
  const headPart = b.part(new THREE.SphereGeometry(1, 10, 8), HONEY, {
    bone: head,
    at: HEAD_C,
    scale: [0.1, 0.088, 0.092],
    flat: true,
  });
  const face = b.surface(headPart);
  for (const s of SIDES) {
    const eye = face.around(HEAD_C).at(s * 32, 12)!;
    b.decal(face, EYE, { at: eye, size: [0.078, 0.098], segments: 8 });
    const cheek = face.around(HEAD_C).at(s * 60, -24)!;
    b.decal(face, BLUSH, { at: cheek, size: [0.05, 0.025], roll: s * -12, segments: 5 });
  }
  // head fuzz: a little crown and a neck ruff
  const crown = face.around(HEAD_C).at(0, 68)!;
  b.cards([crown, face.around(HEAD_C).at(-14, 62)!, face.around(HEAD_C).at(14, 62)!], TUFT, {
    size: [0.04, 0.05],
    lean: 25,
    flow: [0, 0.2, 1],
    color: HONEY,
    cross: true,
    sink: 0.25,
  });
  const ruff = b.ring(frame([0, 0.26, 0.05], [0, 0, 1]), { count: 11, radius: 0.088 });
  b.cards(ruff.items, TUFT, { size: [0.038, 0.042], lean: 55, flow: [0, 0, -1], color: CREAM, vary: 0.2, rng: rand, bone: neck });

  // jaw: a separate smiling D that hangs from the lip line
  const lip = face.around(HEAD_C).at(0, -19)!;
  const SMILE: OutlinePoint[] = [
    [0.032, 0, "sharp"],
    [0.0277, -0.0115],
    [0.016, -0.0195],
    [0, -0.0225],
    [-0.016, -0.0195],
    [-0.0277, -0.0115],
    [-0.032, 0, "sharp"],
  ];
  const up = lip.dir([0, 0, 1]); // surface tangent leaning up the face
  const mouth = b.extrude(SMILE, {
    at: lip.at,
    x: [1, 0, 0],
    y: up.toArray(),
    thickness: 0.016,
    bevel: 0.004,
    color: BERRY,
    bone: jaw,
    name: "jaw",
  });
  b.part(new THREE.PlaneGeometry(0.0625, 0.0332), "#ffffff", {
    bone: jaw,
    at: mouth.local([0, -0.0114, 0.0093]),
    dir: mouth.dir([0, 0, 1]),
    up: mouth.dir([0, 1, 0]),
    axis: "z",
    texture: MOUTH,
  });

  // ================================================================ antennae
  for (const s of SIDES) {
    const base = face.around(HEAD_C).at(s * 22, 70)!;
    const p0 = base.at.clone().add(v3(s * 0.016, 0.056, 0.012));
    const pts: THREE.Vector3[] = [base.at.clone(), base.at.clone().add(v3(s * 0.008, 0.028, 0.004)), p0];
    const r0 = 0.026;
    const steps = 9;
    for (let i = 1; i <= steps; i++) {
      const th = (i / steps) * Math.PI * 2.2;
      const r = r0 * (1 - 0.55 * (i / steps));
      pts.push(v3(p0.x + s * 0.012 * (i / steps), p0.y + r * Math.sin(th), p0.z + r0 - r * Math.cos(th)));
    }
    const chain = b.chain(`antenna${tag(s)}`, catmull(pts), {
      parent: head,
      count: 4,
      names: [`antenna${tag(s)}1`, `antenna${tag(s)}2`, `antenna${tag(s)}3`, `antenna${tag(s)}4`],
      role: "tentacle",
    });
    b.sweep(chain, [0.009, 0.006], { color: PLUM, sides: 5, smooth: false, caps: "round" });
    b.part(new THREE.SphereGeometry(0.016, 6, 4), HONEY, { bone: chain.joints[3], at: chain.at(1), flat: true });
  }

  // ================================================================ honey dipper held in front
  const DIP_DIR = v3(-0.5, 0.5, 0.7).normalize();
  const dipBot = v3(0.0, 0.1, 0.07);
  const dipTop = dipBot.clone().addScaledVector(DIP_DIR, 0.27);
  b.capsule(dipBot, dipTop, 0.0105, { color: WOOD, sides: 6, smooth: false, bone: body });
  const GROOVE: OutlinePoint[] = [
    [0, 0],
    [0.02, 0],
    [0.03, 0.007],
    [0.021, 0.015],
    [0.031, 0.023],
    [0.021, 0.031],
    [0.031, 0.039],
    [0.021, 0.047],
    [0.028, 0.055],
    [0, 0.062],
  ];
  b.lathe(GROOVE, { at: dipTop, axis: DIP_DIR.toArray(), segments: 8, color: AMBER, bone: body });
  // honey drip running down the stick
  for (const [t, r] of [
    [0.205, 0.0145],
    [0.165, 0.011],
  ] as const) {
    const at = dipBot.clone().addScaledVector(DIP_DIR, t);
    b.part(new THREE.SphereGeometry(r, 6, 4), AMBER, { bone: body, at, scale: [1, 1.5, 1], dir: DIP_DIR, flat: true });
  }
  // a fat drip hanging from the ridged head
  const down = v3(0, -1, 0).addScaledVector(DIP_DIR, DIP_DIR.y).normalize();
  const dripTop = dipTop.clone().addScaledVector(DIP_DIR, 0.028).addScaledVector(down, 0.026);
  const dripEnd = dripTop.clone().add(v3(0, -0.03, 0));
  b.capsule(dripTop, dripEnd, [0.011, 0.007], { color: AMBER, sides: 5, smooth: false, bone: body });
  b.part(new THREE.SphereGeometry(0.0115, 6, 4), AMBER, { bone: body, at: dripEnd.clone().add(v3(0, -0.012, 0)), scale: [1, 1.35, 1], flat: true });

  // ================================================================ legs (stubby)
  const grips: Record<number, THREE.Vector3> = {};
  for (const s of SIDES) grips[s] = dipBot.clone().addScaledVector(DIP_DIR, s > 0 ? 0.1 : 0.165).add(v3(s * 0.021, 0, 0));

  const LEG_COLOR = PLUM;
  const FOOT_Y = 0.1 + 0.013 - 0.001;
  for (const s of SIDES) {
    const t = tag(s);
    // front arm holds the dipper
    const shoulder = v3(s * 0.055, 0.205, 0.055);
    const armPts = limb(shoulder, grips[s], [0.078, 0.074], [[s * 0.6, -0.5, 0.0]]);
    const arm = b.chain(`arm${t}`, armPts, {
      parent: body,
      names: [`shoulder${t}`, `elbow${t}`, `hand${t}`],
      role: "arm",
    });
    b.sweep(arm, [0.022, 0.016], { color: LEG_COLOR, sides: 6, smooth: false });
    b.part(new THREE.SphereGeometry(0.024, 6, 4), BOOT, { bone: arm.tip!, at: arm.at(1), scale: [1, 0.95, 1.1], flat: true });

    // middle and hind legs stand on the block
    const pairs: [string, number, number, number, number][] = [
      ["M", -0.012, 0.116, -0.004, 0.058],
      ["H", -0.1, 0.12, -0.098, 0.06],
    ];
    for (const [name, hz, hipX, footZ, hipY] of pairs) {
      const hip = v3(s * hipX * 0.52, 0.18 - (name === "H" ? 0.006 : 0), hz);
      const foot = v3(s * (hipX + hipY * 0.1), FOOT_Y, footZ);
      const pts = limb(hip, foot, [0.056, 0.052], [[s * 0.5, 1, 0]]);
      const leg = b.chain(`leg${name}${t}`, pts, {
        parent: body,
        names: [`hip${name}${t}`, `knee${name}${t}`, `foot${name}${t}`],
        role: "leg",
      });
      b.sweep(leg, [0.021, 0.015], { color: LEG_COLOR, sides: 6, smooth: false });
      b.part(new THREE.SphereGeometry(0.023, 6, 4), BOOT, {
        bone: leg.tip!,
        at: leg.at(1),
        scale: [1, 0.6, 1.25],
        flat: true,
      });
    }
  }

  // ================================================================ wings
  const wingSpec = [
    { key: "F", root: [0.04, 0.328, 0.008], dir: [0.8, 0.5, -0.3], chord: [0, 0.55, -0.83], size: [0.115, 0.23] },
    { key: "H", root: [0.04, 0.322, -0.04], dir: [0.9, 0.25, -0.45], chord: [0, 0.75, -0.66], size: [0.09, 0.17] },
  ] as const;
  for (const s of SIDES) {
    for (const w of wingSpec) {
      const a = v3(s * w.dir[0], w.dir[1], w.dir[2]).normalize();
      const rootP = v3(s * w.root[0], w.root[1], w.root[2]);
      const tipP = rootP.clone().addScaledVector(a, w.size[1]);
      const midP = rootP.clone().addScaledVector(a, w.size[1] * 0.5);
      const chain = b.chain(`wing${w.key}${tag(s)}`, [rootP, midP, tipP], {
        parent: body,
        names: [`wing${w.key}${tag(s)}1`, `wing${w.key}${tag(s)}2`],
        role: "wing",
      });
      const normal = a.clone().cross(v3(0, w.chord[1], w.chord[2])).normalize();
      // self-lit so the thin wing reads pale and glassy from every side
      glow(
        b.cards([frame(rootP, a)], WING, {
          size: [w.size[0], w.size[1]],
          flow: normal.toArray(),
          bone: chain.joints[0],
          sink: 0.04,
          mirror: s < 0,
        }),
        0.9,
      );
    }
  }

  // ================================================================ hive block (honeycomb), jar, flowers
  const R = 0.36;
  const H = 0.1;
  const hexSide = new THREE.CylinderGeometry(R, R, H, 6, 1, true);
  b.part(hexSide, "#ffffff", { bone: root, at: [0, H / 2, 0], rotation: [0, 30, 0], texture: combWall(), flat: true });
  b.part(new THREE.CircleGeometry(R * 0.996, 6), "#ffffff", {
    bone: root,
    at: [0, H + 0.0015, 0],
    dir: [0, 1, 0],
    up: [0, 0, -1],
    axis: "z",
    texture: combTop(),
  });
  // wax trim and foot
  b.part(new THREE.CylinderGeometry(R + 0.014, R + 0.014, 0.016, 6), WAX, { bone: root, at: [0, H - 0.008, 0], rotation: [0, 30, 0], flat: true });
  b.part(new THREE.CylinderGeometry(R + 0.014, R + 0.014, 0.018, 6), WAX, { bone: root, at: [0, 0.009, 0], rotation: [0, 30, 0], flat: true });
  // honey drips over the front trim
  const apothem = R * Math.cos(Math.PI / 6) + 0.014;
  const DRIP: OutlinePoint[] = [
    [-0.055, 0.002, "sharp"],
    [0.055, 0.002, "sharp"],
    [0.055, -0.012],
    [0.03, -0.02],
    [0.027, -0.052],
    [0.013, -0.064],
    [-0.003, -0.052],
    [-0.006, -0.03],
    [-0.032, -0.03],
    [-0.055, -0.016],
  ];
  for (const deg of [0, 60, -60, 120]) {
    const rad = (deg * Math.PI) / 180;
    const n = v3(Math.sin(rad), 0, Math.cos(rad));
    const tan = v3(Math.cos(rad), 0, -Math.sin(rad));
    b.extrude(DRIP, {
      at: [n.x * (apothem - 0.001), H, n.z * (apothem - 0.001)],
      x: tan.toArray(),
      y: [0, 1, 0],
      thickness: 0.01,
      bevel: 0.003,
      color: AMBER,
      bone: root,
    });
  }

  // honey jar
  const JX = 0.2;
  const JZ = 0.05;
  const jarAt = v3(JX, H, JZ);
  const HONEY_LINE = 0.098;
  const jarHoney = b.lathe(
    [
      [0, 0],
      [0.052, 0],
      [0.06, 0.012],
      [0.06, HONEY_LINE],
      [0, HONEY_LINE],
    ],
    { at: jarAt, segments: 8, color: AMBER, bone: root },
  );
  b.lathe(
    [
      [0.06, HONEY_LINE],
      [0.06, 0.104],
      [0.042, 0.128],
      [0.04, 0.138],
      [0.036, 0.138],
      [0.036, 0.13],
      [0.052, 0.104],
      [0.052, HONEY_LINE],
    ],
    { at: jarAt, segments: 8, color: GLASS, bone: root },
  );
  // honey top surface
  b.lathe(
    [
      [0, HONEY_LINE],
      [0.052, HONEY_LINE],
      [0.052, HONEY_LINE + 0.002],
      [0, HONEY_LINE + 0.002],
    ],
    { at: jarAt, segments: 8, color: "#ffc447", bone: root },
  );
  // lid
  b.lathe(
    [
      [0, 0.138],
      [0.046, 0.138],
      [0.048, 0.146],
      [0.044, 0.158],
      [0, 0.158],
    ],
    { at: jarAt, segments: 8, color: LID, bone: root },
  );
  b.part(new THREE.SphereGeometry(0.014, 6, 4), HONEY, { bone: root, at: jarAt.clone().add(v3(0, 0.162, 0)), flat: true });
  // label and glass shine conformed onto the jar
  const jarFront = v3(-0.26, 0, 0.97);
  b.decal(jarHoney, LABEL, {
    at: jarAt.clone().add(v3(jarFront.x * 0.06, 0.052, jarFront.z * 0.06)),
    dir: jarFront.clone().negate().toArray(),
    size: [0.094, 0.067],
    segments: [14, 8],
  });
  b.decal(jarHoney, SHINE, {
    at: jarAt.clone().add(v3(0.042, 0.052, 0.042)),
    dir: [-0.6, 0, -0.8],
    size: [0.014, 0.05],
    segments: [3, 8],
  });

  // flowers
  const flowerSpots: [number, number, number][] = [
    [-0.2, 0.0, 0],
    [-0.25, 0.08, 1],
    [-0.14, -0.07, 1],
    [-0.23, -0.09, 0],
    [0.12, -0.17, 1],
    [0.26, -0.15, 0],
  ];
  for (const [i, tex] of [DAISY, TULIP].entries()) {
    const fr = flowerSpots.filter((f) => f[2] === i).map((f) => frame([f[0], H, f[1]], [0, 1, 0]));
    b.cards(fr, tex, { size: [0.075, 0.15], cross: true, vary: 0.15, rng: rand, flow: [0, 0, 1], sink: 0.05, bone: root });
  }

  return b.root;
}
