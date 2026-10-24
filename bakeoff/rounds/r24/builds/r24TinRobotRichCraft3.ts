import * as THREE from "three";
import { createBuilder, mix, noise, paint, polyline, smoothstep, svg } from "../../../../src/index";
import { coil, gaugeTexture, metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Tin Wind-Up Robot",
  description:
    "A 1950s Japanese lithographed tin-toy robot: riveted red torso with a dial and lamp panel, corrugated silver limbs, claw hands, a speaker-eared head with a grille mouth, glowing eyes and antenna, and a big gilt wind-up key on its back.",
};

type V = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Palette (lithographed tin)
const SILVER = "#b9c5cc";
const SILVER_D = "#8d9aa4";
const RED = "#d33a2c";
const BLUE = "#2e62ab";
const YELLOW = "#f4c230";
const CREAM = "#f3e6c0";
const BLACK = "#1c1a24";
const AMBER = "#ffb736";
const SCRATCH = "#eef2f3";

/** Tin paint: warm light on top, cool dark below, and little silvery chips where the litho paint has worn off. */
function tin(base: string, seed: number, wear = 0.5) {
  const dark = mix(base, "#1c1226", 0.32);
  const light = mix(base, "#fff1cf", 0.24);
  return paint((p, n) => {
    let c = mix(dark, light, smoothstep(-0.7, 0.8, n.y));
    c = mix(c, base, 0.3);
    const chip = noise(p, 0.012, seed) * 0.6 + noise(p, 0.004, seed + 3) * 0.4;
    if (chip > 0.74 - wear * 0.1) c = mix(c, SCRATCH, 0.75);
    const grime = noise(p, 0.05, seed + 8);
    if (grime > 0.68 && n.y < 0.2) c = mix(c, "#3a2418", 0.18);
    return c;
  });
}

const P_RED = panelled(tin(RED, 1, 0.6), { size: 0.062, aspect: 0.8, rivets: 0.016, seam: "#6e1a14" });
const P_REDP = tin(RED, 11, 0.5);
const P_SIL = tin(SILVER, 2, 0.3);
const P_SILD = tin(SILVER_D, 3, 0.4);
const P_BLUE = tin(BLUE, 4, 0.6);
const P_YEL = tin(YELLOW, 5, 0.4);
const P_CREAM = tin(CREAM, 6, 0.2);
const P_HEAD = panelled(tin(SILVER, 7, 0.35), { size: 0.055, aspect: 0.75, rivets: 0, seam: "#59646c" });
const GILT = metal("gilt", { tarnish: 0.25 });
const STEEL = metal("steel", { polish: 0.7 });

const BELT = paint((p, n) => {
  const u = Math.abs(n.x) > 0.7 ? p.z : p.x;
  const k = ((Math.floor((u + p.y) / 0.008) % 2) + 2) % 2;
  return k === 0 ? YELLOW : BLACK;
});

const FOOT = paint((_p, n, s) => {
  if (n.y < -0.6) return BLACK;
  if (Math.abs(n.y) < 0.5 && s[1] > 0.013 && s[1] < 0.018) return CREAM;
  return P_BLUE;
});

// ---------------------------------------------------------------------------------------------------------------
// Textures (SVG drawings)
function star(cx: number, cy: number, ro: number, ri: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? ri : ro;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

const FONT = "Impact, 'Arial Black', sans-serif";

const PANEL = svg(
  `<svg viewBox="0 0 90 62" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="88" height="60" rx="5" fill="${CREAM}" stroke="#3b2a1c" stroke-width="2"/>
    <rect x="6" y="5" width="78" height="15" rx="2" fill="${RED}" stroke="#3b2a1c" stroke-width="1.5"/>
    <text x="45" y="17" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="13" letter-spacing="4" fill="${CREAM}">ROBOT</text>
    <circle cx="24" cy="40" r="17.5" fill="#2b2a33" stroke="#3b2a1c" stroke-width="1.5"/>
    <circle cx="58" cy="36" r="8" fill="${BLUE}" stroke="#3b2a1c" stroke-width="1.5" stroke-dasharray="1.6 1.2"/>
    <circle cx="58" cy="36" r="5" fill="#6f98d4" stroke="#3b2a1c" stroke-width="1"/>
    <path d="M58 36 L61 30" stroke="#1c1a24" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="76" cy="36" r="8" fill="${RED}" stroke="#3b2a1c" stroke-width="1.5" stroke-dasharray="1.6 1.2"/>
    <circle cx="76" cy="36" r="5" fill="#ec7a6c" stroke="#3b2a1c" stroke-width="1"/>
    <path d="M76 36 L72 31" stroke="#1c1a24" stroke-width="1.6" stroke-linecap="round"/>
    <polygon points="52,26 58,22 64,26" fill="#3b2a1c"/><polygon points="70,26 76,22 82,26" fill="#3b2a1c"/>
    <rect x="50" y="49" width="34" height="5" rx="2.5" fill="#2b2a33" stroke="#3b2a1c" stroke-width="1"/>
    <rect x="53" y="50.5" width="14" height="2" rx="1" fill="${YELLOW}"/>
    <circle cx="5" cy="5" r="1.6" fill="#7b6a4a"/><circle cx="85" cy="5" r="1.6" fill="#7b6a4a"/>
    <circle cx="5" cy="57" r="1.6" fill="#7b6a4a"/><circle cx="85" cy="57" r="1.6" fill="#7b6a4a"/>
  </svg>`,
  { size: 512 },
);

const GAUGE = gaugeTexture({ needle: 55, label: "VOLT" });

const PUPIL = svg(
  `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="10.5" fill="${BLACK}"/>
    <circle cx="20" cy="20" r="10.5" fill="none" stroke="#7a3a08" stroke-width="1.4"/>
    <path d="M20 2 V10 M20 30 V38 M2 20 H10 M30 20 H38" stroke="#7a3a08" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="16" cy="15.5" r="3.4" fill="#ffffff"/><circle cx="24" cy="25" r="1.6" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

let grilleBars = "";
for (let i = 0; i < 11; i++)
  grilleBars += `<rect x="${6 + i * 7.5}" y="4" width="4.4" height="18" rx="1.6" fill="#d6dde0" stroke="#5b6770" stroke-width="0.8"/>`;
const GRILLE = svg(
  `<svg viewBox="0 0 90 26" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="88" height="24" rx="4" fill="#23222b" stroke="#7e8b94" stroke-width="2"/>${grilleBars}
  </svg>`,
  { size: 384 },
);

let teethRects = "";
for (let i = 0; i < 11; i++)
  teethRects += `<rect x="${3 + i * 7.7}" y="0.5" width="6.4" height="7.5" rx="1.2" fill="${CREAM}" stroke="#3b2a1c" stroke-width="0.8"/>`;
const TEETH = svg(
  `<svg viewBox="0 0 90 10" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="90" height="10" rx="2" fill="#23222b"/>${teethRects}</svg>`,
  { size: 384 },
);

const EAR = svg(
  `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="19" fill="#8e9ba3" stroke="#3b4650" stroke-width="1.5"/>
    <circle cx="20" cy="20" r="14" fill="none" stroke="#4a5560" stroke-width="1.6"/>
    <circle cx="20" cy="20" r="9" fill="none" stroke="#4a5560" stroke-width="1.6"/>
    <circle cx="20" cy="20" r="4.2" fill="${YELLOW}" stroke="#3b2a1c" stroke-width="1"/>
    <path d="M20 6 V34 M6 20 H34" stroke="#59646c" stroke-width="0.8"/>
  </svg>`,
  { size: 128 },
);

const EMBLEM = svg(
  `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="19" fill="${YELLOW}" stroke="#3b2a1c" stroke-width="1.5"/>
    <circle cx="20" cy="20" r="15" fill="${RED}" stroke="#3b2a1c" stroke-width="1"/>
    <polygon points="${star(20, 21, 11.5, 4.8)}" fill="${CREAM}" stroke="#3b2a1c" stroke-width="0.8" stroke-linejoin="round"/>
  </svg>`,
  { size: 128 },
);

const TAG = svg(
  `<svg viewBox="0 0 70 50" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="68" height="48" rx="6" fill="${YELLOW}" stroke="#3b2a1c" stroke-width="2"/>
    <text x="35" y="11" text-anchor="middle" font-family="${FONT}" font-size="8" letter-spacing="1.5" fill="${RED}">WIND-UP</text>
    <text x="35" y="46" text-anchor="middle" font-family="${FONT}" font-size="6.2" letter-spacing="1" fill="#2a1a14">MADE IN JAPAN</text>
    <circle cx="35" cy="26" r="13" fill="none" stroke="${RED}" stroke-width="2.4" stroke-dasharray="58 8"/>
    <polygon points="45,15 51,21 42,22" fill="${RED}"/>
    <circle cx="8" cy="8" r="1.8" fill="#7b5a14"/><circle cx="62" cy="8" r="1.8" fill="#7b5a14"/>
    <circle cx="8" cy="42" r="1.8" fill="#7b5a14"/><circle cx="62" cy="42" r="1.8" fill="#7b5a14"/>
  </svg>`,
  { size: 384 },
);

let ventSlots = "";
for (let i = 0; i < 5; i++)
  ventSlots += `<rect x="4" y="${5 + i * 7}" width="22" height="4" rx="2" fill="#2a1a14"/><rect x="5" y="${9.4 + i * 7}" width="20" height="1.1" fill="#f4d7a0" opacity="0.7"/>`;
const VENT = svg(
  `<svg viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="29" height="39" rx="4" fill="#9a2a20" stroke="#3b2a1c" stroke-width="1.2"/>${ventSlots}</svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "tin-robot" });

  // ---- helpers -------------------------------------------------------------------------------------------------
  const plate = (
    w: number,
    h: number,
    d: number,
    at: V,
    color: any,
    bone: any,
    bevel?: number,
    name?: string,
  ) => {
    const hw = w / 2;
    const hh = h / 2;
    return b.extrude(
      [
        [-hw, -hh],
        [hw, -hh],
        [hw, hh],
        [-hw, hh],
      ],
      {
        at,
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: d,
        bevel: bevel ?? Math.min(w, h, d) * 0.18,
        smoothing: 1,
        color,
        bone,
        name,
      },
    );
  };

  const rivet = (at: V, dir: V, r: number, color: any, bone: any) =>
    b.part(new THREE.SphereGeometry(1, 6, 4), color, { at, bone, dir, scale: [r, r * 0.6, r] });

  const decalPlane = (tex: THREE.Texture, w: number, h: number, at: V, dir: V, bone: any, round = false) =>
    b.part(round ? new THREE.CircleGeometry(w / 2, 20) : new THREE.PlaneGeometry(w, h), "#ffffff", {
      at,
      dir,
      axis: "z",
      texture: tex,
      bone,
    });

  const ribs = (ch: any, n: number, r: number, color: any, from: number, to: number) =>
    b.along(
      ch,
      n,
      (at: any) => {
        b.part(new THREE.CylinderGeometry(r, r, 0.0035, 8), color, { frame: at, flat: true });
      },
      { from, to },
    );

  // ---- skeleton ------------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.125, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.125, 0],
      [0, 0.2, 0],
      [0, 0.253, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const spine1 = spine.joints[0];
  const chest = spine.joints[1];
  const neck = b.chain(
    "neck",
    polyline([
      [0, 0.253, 0],
      [0, 0.272, 0.002],
      [0, 0.288, 0.004],
    ]),
    { parent: spine, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 0.288, 0.004], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.3, -0.03], aim: [0, 0.3, 0.04], role: "jaw" });

  // ---- pelvis, torso, belt ---------------------------------------------------------------------------------------
  plate(0.1, 0.034, 0.07, [0, 0.125, 0], P_SILD, hips, 0.004, "pelvis");
  for (const s of [1, -1]) rivet([s * 0.04, 0.125, 0.0355], [0, 0, 1], 0.003, YELLOW, hips);

  const torso = b.extrude(
    [
      [-0.059, 0.142],
      [0.059, 0.142],
      [0.07, 0.255],
      [-0.07, 0.255],
    ],
    {
      at: [0, 0, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.088,
      bevel: 0.005,
      smoothing: 1,
      color: P_RED,
      bone: chest,
      name: "torso",
    },
  );
  // top lid flange and bottom hem
  plate(0.15, 0.008, 0.098, [0, 0.2575, 0], P_YEL, chest, 0.002, "lid");
  const belt = plate(0.13, 0.016, 0.096, [0, 0.15, 0], BELT, spine1, 0.003, "belt");
  void belt;
  b.part(new THREE.CylinderGeometry(0.0105, 0.0105, 0.004, 12), GILT, {
    at: [0, 0.15, 0.0505],
    dir: [0, 0, 1],
    bone: spine1,
  });
  decalPlane(EMBLEM, 0.019, 0.019, [0, 0.15, 0.0528], [0, 0, 1], spine1, true);

  // chest panel: plate, litho drawing, dial, knobs, lamps
  plate(0.098, 0.068, 0.004, [0, 0.212, 0.045], P_YEL, chest, 0.0012, "panelPlate");
  decalPlane(PANEL, 0.09, 0.062, [0, 0.212, 0.0485], [0, 0, 1], chest);
  decalPlane(GAUGE, 0.031, 0.031, [-0.021, 0.203, 0.0495], [0, 0, 1], chest, true);
  const lamps: [number, string][] = [
    [-0.022, "#ff3b2a"],
    [0, "#ffd23a"],
    [0.022, "#55e060"],
  ];
  for (const [x, c] of lamps) {
    b.part(new THREE.CylinderGeometry(0.0085, 0.0085, 0.003, 10), STEEL, {
      at: [x, 0.168, 0.0455],
      dir: [0, 0, 1],
      bone: chest,
    });
    glow(
      b.part(new THREE.SphereGeometry(0.0065, 8, 6), c, {
        at: [x, 0.168, 0.047],
        bone: chest,
        scale: [1, 1, 0.8],
      }),
      1.1,
    );
  }

  // side vents and folded tin tabs
  const tsurf = b.surface(torso);
  for (const s of [1, -1]) {
    const vh = tsurf.ray([s, 0.205, 0.0], [-s, 0, 0]);
    if (vh) b.decal(torso, VENT, { at: vh, size: [0.04, 0.05], bone: chest });
    for (const y of [0.166, 0.243]) {
      const th = tsurf.ray([s, y, -0.032], [-s, 0, 0]);
      if (th) b.stick(new THREE.BoxGeometry(0.014, 0.004, 0.022), P_YEL, th, { embed: 0.3, bone: chest });
    }
  }

  // back: label tag
  decalPlane(TAG, 0.07, 0.05, [0, 0.2, -0.045], [0, 0, -1], chest);

  // ---- neck collar (ribbed lathe) ---------------------------------------------------------------------------------
  const prof: [number, number][] = [[0, 0]];
  for (let k = 0; k < 5; k++) {
    const y0 = k * 0.0075;
    prof.push([0.0235, y0], [0.028, y0 + 0.0012], [0.028, y0 + 0.0045], [0.0235, y0 + 0.0057]);
  }
  prof.push([0.0235, 0.0375], [0, 0.0375]);
  b.lathe(prof, { at: [0, 0.253, 0.001], segments: 10, color: P_SILD, bone: neck.joints[0], name: "neckCollar" });

  // ---- head ---------------------------------------------------------------------------------------------------------
  const FZ = 0.048; // upper-head face plane
  plate(0.108, 0.064, 0.088, [0, 0.348, 0.004], P_HEAD, head, 0.006, "skull");
  // red cap with antenna
  b.lathe(
    [
      [0, 0],
      [0.048, 0],
      [0.048, 0.004],
      [0.04, 0.012],
      [0.022, 0.019],
      [0, 0.021],
    ],
    { at: [0, 0.38, 0.004], segments: 12, color: P_REDP, bone: head, name: "cap" },
  );
  b.part(new THREE.CylinderGeometry(0.006, 0.0075, 0.008, 8), P_YEL, { at: [0, 0.4015, 0.004], bone: head });
  b.rod([0, 0.4, 0.004], [0, 0.43, 0.004], 0.0013, GILT, { bone: head });
  b.sweep(coil([0, 0.404, 0.004], [0, 0.428, 0.004], 0.0045, 5), 0.0009, { color: GILT, bone: head, sides: 5 });
  glow(
    b.part(new THREE.SphereGeometry(0.0078, 8, 6), "#ff3b2a", { at: [0, 0.4375, 0.004], bone: head }),
    1.3,
  );

  // eyes and brows
  for (const s of [1, -1]) {
    const x = s * 0.027;
    b.part(new THREE.CylinderGeometry(0.0205, 0.0205, 0.007, 14), STEEL, {
      at: [x, 0.346, FZ + 0.0035],
      dir: [0, 0, 1],
      bone: head,
    });
    glow(
      b.part(new THREE.SphereGeometry(0.0165, 10, 8), AMBER, {
        at: [x, 0.346, 0.054],
        bone: head,
        scale: [1, 1, 0.5],
      }),
      1.0,
    );
    decalPlane(PUPIL, 0.021, 0.021, [x, 0.346, 0.0628], [0, 0, 1], head);
    b.part(new THREE.BoxGeometry(0.032, 0.006, 0.008), P_REDP, {
      at: [s * 0.028, 0.37, 0.0505],
      bone: head,
      rotation: [0, 0, s * 12],
    });
    // ears: speaker discs
    b.part(new THREE.CylinderGeometry(0.0235, 0.0235, 0.008, 12), P_YEL, {
      at: [s * 0.056, 0.348, 0.004],
      dir: [s, 0, 0],
      bone: head,
    });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.003, 12), P_SILD, {
      at: [s * 0.0615, 0.348, 0.004],
      dir: [s, 0, 0],
      bone: head,
    });
    decalPlane(EAR, 0.04, 0.04, [s * 0.0635, 0.348, 0.004], [s, 0, 0], head, true);
    // face corner rivets
    rivet([s * 0.0475, 0.3745, FZ], [0, 0, 1], 0.0035, YELLOW, head);
    rivet([s * 0.0475, 0.3225, FZ], [0, 0, 1], 0.0035, YELLOW, head);
    // jaw hinge bolts
    rivet([s * 0.0545, 0.318, -0.03], [s, 0, 0], 0.004, STEEL, head);
  }
  // nose plate
  b.part(new THREE.BoxGeometry(0.01, 0.014, 0.006), P_YEL, { at: [0, 0.336, FZ + 0.002], bone: head });
  // upper teeth
  decalPlane(TEETH, 0.09, 0.01, [0, 0.3215, FZ + 0.0005], [0, 0, 1], head);

  // lower jaw with grille
  plate(0.1, 0.03, 0.08, [0, 0.303, 0.006], P_SILD, jaw, 0.004, "jawBox");
  decalPlane(GRILLE, 0.09, 0.026, [0, 0.303, 0.0465], [0, 0, 1], jaw);
  plate(0.04, 0.006, 0.03, [0, 0.286, 0.02], P_YEL, jaw, 0.002, "chin");
  for (const s of [1, -1]) rivet([s * 0.047, 0.303, 0.0465], [0, 0, 1], 0.003, YELLOW, jaw);

  // ---- shoulders, arms, hands ---------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const shP: V = [s * 0.092, 0.228, 0];
    const elP: V = [s * 0.118, 0.165, 0.004];
    const wrP: V = [s * 0.135, 0.11, 0.04];
    const arm = b.chain(`arm${S}`, polyline([shP, elP, wrP]), {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const sj = arm.joints[0];
    const ej = arm.joints[1];
    const wj = arm.tip!;

    // shoulder drum
    b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.014, 8), P_SILD, {
      at: [s * 0.0725, 0.228, 0],
      dir: [s, 0, 0],
      bone: sj,
    });
    b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.03, 12), P_RED, {
      at: shP,
      dir: [s, 0, 0],
      bone: sj,
      flat: true,
    });
    decalPlane(EMBLEM, 0.044, 0.044, [s * 0.1072, 0.228, 0], [s, 0, 0], sj, true);
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 + 0.3;
      rivet([s * 0.1065, 0.228 + 0.0245 * Math.cos(a), 0.0245 * Math.sin(a)], [s, 0, 0], 0.0028, YELLOW, sj);
    }

    // corrugated arm
    b.sweep(arm, 0.0125, { color: P_SIL, sides: 8 });
    ribs(arm, 4, 0.0138, P_SILD, 0.1, 0.42);
    ribs(arm, 4, 0.0138, P_SILD, 0.58, 0.88);
    b.part(new THREE.SphereGeometry(0.0185, 8, 6), P_REDP, { at: elP, bone: ej });

    // wrist cuff and palm
    const E = new THREE.Vector3(...elP);
    const W = new THREE.Vector3(...wrP);
    const d = W.clone().sub(E).normalize();
    const h = new THREE.Vector3(0, -0.25, 0.97).normalize();
    b.part(new THREE.CylinderGeometry(0.0165, 0.0165, 0.012, 10), P_YEL, {
      at: W.clone().addScaledVector(d, -0.003),
      dir: d,
      bone: wj,
    });
    b.part(new THREE.BoxGeometry(0.03, 0.022, 0.026), P_YEL, {
      at: W.clone().addScaledVector(h, 0.014),
      dir: h,
      axis: "z",
      bone: wj,
    });
    rivet(
      W.clone().addScaledVector(h, 0.014).add(new THREE.Vector3(s * 0.0155, 0, 0)).toArray() as V,
      [s, 0, 0],
      0.003,
      SILVER_D,
      wj,
    );

    // three claw digits
    const up = new THREE.Vector3(0, 1, 0).addScaledVector(h, -h.y).normalize();
    const X = new THREE.Vector3(1, 0, 0);
    const specs = [
      { n: "fingerA", ox: s * 0.012, oy: 0 },
      { n: "fingerB", ox: -s * 0.012, oy: 0 },
      { n: "thumb", ox: 0, oy: -0.011 },
    ];
    for (const f of specs) {
      const p0 = W.clone().addScaledVector(h, 0.025).addScaledVector(X, f.ox).addScaledVector(up, f.oy);
      const p1 = p0
        .clone()
        .addScaledVector(h, 0.022)
        .addScaledVector(X, -f.ox * 0.1)
        .addScaledVector(up, f.oy ? 0.003 : 0);
      const p2 = p1
        .clone()
        .addScaledVector(h, 0.02)
        .addScaledVector(X, -f.ox * 0.4)
        .addScaledVector(up, f.oy ? 0.006 : 0);
      const fc = b.chain(`${f.n}${S}`, polyline([p0, p1, p2]), {
        parent: arm,
        names: [`${f.n}1${S}`, `${f.n}2${S}`, `${f.n}3${S}`],
        role: "digit",
      });
      b.sweep(fc, [0.0055, 0.0028], { color: P_YEL, sides: 6, caps: { start: "round", end: "point" } });
    }
  }

  // ---- legs and feet -----------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hipP: V = [s * 0.038, 0.12, 0];
    const kneeP: V = [s * 0.039, 0.083, 0.004];
    const ankP: V = [s * 0.04, 0.044, 0];
    const leg = b.chain(`leg${S}`, polyline([hipP, kneeP, ankP]), {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [s * 0.04, 0, 0.02],
    });
    const hipJ = leg.joints[0];
    const kneeJ = leg.joints[1];
    const ankleJ = leg.tip!;
    b.sweep(leg, 0.0135, { color: P_SIL, sides: 8 });
    ribs(leg, 4, 0.0148, P_SILD, 0.08, 0.42);
    ribs(leg, 4, 0.0148, P_SILD, 0.6, 0.94);
    b.part(new THREE.SphereGeometry(0.02, 8, 6), P_REDP, { at: hipP, bone: hipJ });
    b.part(new THREE.SphereGeometry(0.0175, 8, 6), P_REDP, { at: kneeP, bone: kneeJ });
    b.part(new THREE.CylinderGeometry(0.0175, 0.0175, 0.008, 10), P_YEL, { at: [s * 0.04, 0.04, 0], bone: ankleJ });

    // tin shoe: side profile extruded across the foot
    b.extrude(
      [
        [-0.04, 0],
        [0.062, 0],
        [0.07, 0.007],
        [0.068, 0.016],
        [0.045, 0.024],
        [0.02, 0.03],
        [0.01, 0.037],
        [-0.038, 0.037],
        [-0.042, 0.03],
      ],
      {
        at: [s * 0.04, -0.001, 0.01],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.058,
        bevel: 0.004,
        smoothing: 1,
        color: FOOT,
        bone: ankleJ,
        name: `foot${S}`,
      },
    );
    for (const dx of [-1, 1]) rivet([s * 0.04 + dx * 0.02, 0.0225, 0.062], [0, 0.5, 0.85], 0.0032, YELLOW, ankleJ);
  }

  // ---- the wind-up key ---------------------------------------------------------------------------------------------
  const KY = 0.2;
  const key = b.joint("key", { parent: chest, at: [0, KY, -0.0442], dir: [0, 0, -1], role: "hinge" });
  // back boss
  b.lathe(
    [
      [0, 0],
      [0.016, 0],
      [0.016, 0.002],
      [0.012, 0.004],
      [0, 0.0045],
    ],
    { at: [0, KY, -0.0442], axis: [0, 0, -1], segments: 12, color: GILT, bone: key, name: "keyBoss" },
  );
  b.part(new THREE.CylinderGeometry(0.0035, 0.0035, 0.036, 8), GILT, {
    at: [0, KY, -0.0622],
    dir: [0, 0, -1],
    bone: key,
  });
  b.part(new THREE.CylinderGeometry(0.0068, 0.0068, 0.004, 8), GILT, {
    at: [0, KY, -0.058],
    dir: [0, 0, -1],
    bone: key,
  });
  const wing: [number, number][] = [
    [0.006, 0.004],
    [0.014, 0.011],
    [0.024, 0.012],
    [0.03, 0.006],
    [0.03, -0.006],
    [0.024, -0.012],
    [0.014, -0.011],
    [0.006, -0.004],
    [-0.006, -0.004],
    [-0.014, -0.011],
    [-0.024, -0.012],
    [-0.03, -0.006],
    [-0.03, 0.006],
    [-0.024, 0.012],
    [-0.014, 0.011],
    [-0.006, 0.004],
  ];
  const scaled = (k: number) => wing.map(([x, y]) => [x * k, y * k] as [number, number]);
  const KZ = -0.0802;
  b.extrude(scaled(1.2), {
    at: [0, KY, KZ],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.005,
    bevel: 0.0012,
    smoothing: 1,
    color: GILT,
    bone: key,
    name: "keyBow",
  });
  for (const dz of [-0.0029, 0.0029])
    b.extrude(scaled(0.84), {
      at: [0, KY, KZ + dz],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.0014,
      smoothing: 1,
      color: P_REDP,
      bone: key,
      name: "keyEnamel",
    });
  b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.0092, 8), GILT, { at: [0, KY, KZ], dir: [0, 0, 1], bone: key });
  b.pose(key, { axis: [0, 0, -1], deg: 28 });

  return b.root;
}
