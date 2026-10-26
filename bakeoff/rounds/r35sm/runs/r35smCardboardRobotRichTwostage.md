<!-- call: stage1 -->

```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";

export const meta = {
  name: "Cardboard Box Robot Kid",
  description:
    "A kid in a homemade cardboard-box robot costume: box torso with a clean chest panel, box helmet with a face window, foil-wrapped tube limbs, taped seams and antennae.",
};

// ---------- palette (stage 2 uses these by name) ----------
export const CARD = "#b98a55";
export const CARD_DARK = "#8f6637";
export const CARD_LIGHT = "#d3a96f";
export const CARD_INNER = "#a37846";
export const TAPE = "#dccaa0";
export const RED_TAPE = "#d4412f";
export const FOIL = "#c3c8d0";
export const FOIL_DARK = "#8d939e";
export const MARKER = "#26252b";
export const BLUE = "#3a72c2";
export const YELLOW = "#f2c230";
export const SKIN = "#f2c29c";
export const SKIN_SHADE = "#d99f7c";
export const HAIR = "#4b2f1e";
export const SHIRT = "#3d5f8f";
export const JEANS = "#34476b";
export const SOLE = "#f1eee6";
export const SNEAKER = "#d9473a";
export const WHITE = "#ffffff";
export const CHEEK = "#ee9a8c";

export const REQUESTS = [
  {
    id: "chestControls",
    kind: "add",
    part: "chestPanel",
    what: "Control panel on the chest panel: three bottle-cap knobs (RED_TAPE, YELLOW, BLUE) in a row with a notch line each, two big push buttons made from jar lids, a small row of five bottle-cap 'lights', and a slot cut like a coin slot. Keep it chunky and craft-made.",
    at: [0, 0.8, 0.156],
    normal: [0, 0, 1],
    bone: "spine",
    room: [0.3, 0.2, 0.05],
  },
  {
    id: "antennaArray",
    kind: "add",
    part: "headBox",
    what: "Antenna tops: on the left antenna a coiled pipe-cleaner spring (FOIL_DARK) ending in a foil ball; on the right a tiny paper-cup dish and a yellow bottle-cap light. Attach to the existing antenna rods and ball tips.",
    at: [0, 1.38, 0],
    normal: [0, 1, 0],
    bone: "head",
    room: [0.3, 0.2, 0.12],
  },
  {
    id: "earSpeakers",
    kind: "add",
    part: "earCupL",
    what: "Speaker detail on both side paper cups of the helmet: a grille of concentric rings and a centre cap in MARKER, plus a rim of tape bits and a little wire loop to the helmet.",
    at: [0.205, 1.14, 0],
    normal: [1, 0, 0],
    bone: "head",
    room: [0.08, 0.12, 0.12],
  },
  {
    id: "shoulderJoints",
    kind: "add",
    part: "torsoBox",
    what: "Jar-lid shoulder joints on both sides of the torso where the arms come out: a lid disc, four brass-paper-fastener bolts around it, and a ring of tape. Pair; at is the left one.",
    at: [0.225, 0.88, 0],
    normal: [1, 0, 0],
    bone: "spine",
    room: [0.06, 0.12, 0.12],
  },
  {
    id: "elbowHose",
    kind: "add",
    part: "forearmTubeL",
    what: "Elbow joints: a short accordion of dryer-hose rings (FOIL_DARK) at the top of each foil forearm tube, plus a strip of RED_TAPE round the wrist end. Pair; at is the left elbow.",
    at: [0.34, 0.7, 0],
    normal: [1, 0, 0],
    bone: "elbowL",
    room: [0.14, 0.14, 0.14],
  },
  {
    id: "beltBuckle",
    kind: "add",
    part: "beltTape",
    what: "Belt buckle on the red tape belt: a milk-bottle cap or square of foil with a MARKER outline and a small tab, centred on the front.",
    at: [0, 0.58, 0.155],
    normal: [0, 0, 1],
    bone: "spine",
    room: [0.1, 0.06, 0.03],
  },
  {
    id: "backPack",
    kind: "add",
    part: "torsoBox",
    what: "On the back of the torso: a small cereal-box battery pack with a toggle switch, a tape handle, vent slits cut into the cardboard and a looped curly wire running to the helmet.",
    at: [0, 0.76, -0.153],
    normal: [0, 0, -1],
    bone: "spine",
    room: [0.3, 0.3, 0.1],
  },
  {
    id: "kneeBolts",
    kind: "add",
    part: "shinTubeL",
    what: "Knee caps: a foil-covered half-ball cap on each shin top with a ring of four paper-fastener bolts, and a strip of TAPE round the middle of the shin. Pair; at is the left knee.",
    at: [0.09, 0.36, 0.07],
    normal: [0, 0, 1],
    bone: "kneeL",
    room: [0.14, 0.1, 0.1],
  },
  {
    id: "sneakerDetail",
    kind: "add",
    part: "sneakerL",
    what: "Sneaker details: laces zigzagging over the front (WHITE), a toe cap, and rocket-style stripes on the side in YELLOW on both shoes. Pair; at is the left shoe.",
    at: [0.09, 0.07, 0.04],
    normal: [0, 1, 0],
    bone: "ankleL",
    room: [0.11, 0.05, 0.2],
  },
  {
    id: "chestMarker",
    kind: "texture",
    part: "chestPanel",
    what: "Hand-drawn marker art on the CARD_LIGHT chest panel in MARKER: a wobbly 'ROBO' title across the top in blocky letters, small arrows and a hand-drawn grid of squares for a speaker, a couple of crossed-out mistakes. Childlike, imperfect lines.",
  },
  {
    id: "cardboardGrain",
    kind: "texture",
    part: "torsoBox",
    what: "Cardboard look on the torso box: fine corrugation streaks, scuffs and darker edges in CARD and CARD_DARK, a faded 'THIS SIDE UP' arrow and a FRAGILE stamp in a reddish ink on one side, and a shipping-label rectangle.",
  },
  {
    id: "helmetDoodles",
    kind: "texture",
    part: "headBox",
    what: "Helmet box: marker doodles in MARKER and BLUE: little lightning bolts, stars and a row of hand-drawn dots, with corrugation grain in CARD tones and a faint brand logo half torn off.",
  },
  {
    id: "foilWrinkles",
    kind: "texture",
    part: "forearmTubeL",
    what: "Crinkled aluminium foil on the arm and leg tubes: irregular bright and dark facets between FOIL and FOIL_DARK with creases and a few dull patches where tape is stuck.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "boxRobotKid" });
  const HY = 1.14; // kid head centre

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.52, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.joint("spine", { parent: hips, at: [0, 0.56, 0], dir: [0, 1, 0], role: "spine" });
  const neck = b.joint("neck", { parent: spine, at: [0, 0.96, 0], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.03, 0], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, HY - 0.05, 0.02], dir: [0, 0, 1], role: "jaw" });

  const arms: Record<string, any> = {};
  const legs: Record<string, any> = {};
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    arms[k] = b.chain(
      `arm${k}`,
      [[s * 0.26, 0.88, 0], [s * 0.34, 0.7, 0], [s * 0.41, 0.5, 0]],
      { parent: spine, names: [`shoulder${k}`, `elbow${k}`, `wrist${k}`], role: "arm" },
    );
    legs[k] = b.chain(
      `leg${k}`,
      [[s * 0.09, 0.5, 0], [s * 0.09, 0.3, 0.01], [s * 0.09, 0.1, 0]],
      { parent: hips, names: [`hip${k}`, `knee${k}`, `ankle${k}`], role: "leg", contact: [s * 0.09, 0, 0.04] },
    );
  }

  const box = (w: number, h: number, d: number, c: string, bone: any, at: number[], name?: string, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, name, ...extra });
  const ball = (r: number, c: string, bone: any, at: number[], sc: number[] = [1, 1, 1], name?: string) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { bone, at, scale: sc, name });

  // ---------- torso box ----------
  box(0.44, 0.44, 0.3, CARD, spine, [0, 0.74, 0], "torsoBox");
  box(0.3, 0.2, 0.006, CARD_LIGHT, spine, [0, 0.8, 0.153], "chestPanel");
  box(0.31, 0.012, 0.008, CARD_DARK, spine, [0, 0.9, 0.153]);
  box(0.31, 0.012, 0.008, CARD_DARK, spine, [0, 0.7, 0.153]);
  // tape seams
  box(0.448, 0.035, 0.308, TAPE, spine, [0, 0.94, 0], "topTape");
  box(0.448, 0.045, 0.308, RED_TAPE, spine, [0, 0.58, 0], "beltTape");
  for (const s of [1, -1]) {
    box(0.012, 0.44, 0.31, TAPE, spine, [s * 0.221, 0.74, 0]);
    box(0.01, 0.1, 0.01, CARD_DARK, spine, [s * 0.2, 0.52, 0.152]);
  }
  // top flaps (folded cardboard)
  for (const s of [1, -1]) {
    box(0.18, 0.012, 0.28, CARD_INNER, spine, [s * 0.13, 0.975, 0], `flap${s > 0 ? "L" : "R"}`, { rotation: [0, 0, -s * 14] });
    box(0.18, 0.004, 0.28, CARD_DARK, spine, [s * 0.13, 0.968, 0], undefined, { rotation: [0, 0, -s * 14] });
  }
  // jeans pelvis + neck
  box(0.28, 0.12, 0.2, JEANS, hips, [0, 0.48, 0], "pelvis");
  b.rod([0, 0.96, 0], [0, 1.03, 0], 0.035, SKIN, { bone: neck });

  // ---------- helmet box ----------
  const T = 0.012;
  box(0.34, 0.3, T, CARD, head, [0, 1.16, -0.15], "headBox");
  for (const s of [1, -1]) {
    box(T, 0.3, 0.3, CARD, head, [s * 0.164, 1.16, 0], "headBox");
    // front boards around window (opening x ±0.1, y 1.03..1.25)
    box(0.07, 0.3, T, CARD, head, [s * 0.13, 1.16, 0.15], "headBox");
  }
  box(0.34, T, 0.3, CARD_INNER, head, [0, 1.31, 0], "headBox");
  box(0.34, 0.05, T, CARD, head, [0, 1.285, 0.15], "headBox");
  box(0.2, 0.02, T, CARD, head, [0, 1.02, 0.15], "headBox");
  box(0.346, 0.03, 0.306, TAPE, head, [0, 1.3, 0]);
  // window trim
  box(0.21, 0.012, 0.008, TAPE, head, [0, 1.252, 0.153]);
  box(0.21, 0.012, 0.008, TAPE, head, [0, 1.034, 0.153]);
  for (const s of [1, -1]) box(0.012, 0.22, 0.008, TAPE, head, [s * 0.1, 1.143, 0.153]);
  // ear cups
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.04, 10), FOIL, {
      bone: head, at: [s * 0.185, HY, 0], rotation: [0, 0, 90], name: `earCup${k}`,
    });
    b.part(new THREE.CylinderGeometry(0.058, 0.058, 0.01, 10), RED_TAPE, {
      bone: head, at: [s * 0.168, HY, 0], rotation: [0, 0, 90],
    });
  }
  // antennae
  b.rod([-0.06, 1.314, -0.03], [-0.09, 1.43, -0.03], 0.007, FOIL_DARK, { bone: head });
  ball(0.03, FOIL, head, [-0.09, 1.45, -0.03], [1, 1, 1], "antBallL");
  b.rod([0.06, 1.314, -0.03], [0.1, 1.42, -0.03], 0.007, FOIL_DARK, { bone: head });
  b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.012, 10), RED_TAPE, { bone: head, at: [0.1, 1.428, -0.03], name: "antCapR" });
  for (const s of [1, -1])
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.016, 8), FOIL_DARK, { bone: head, at: [s * 0.06, 1.322, -0.03] });

  // ---------- kid's head ----------
  ball(0.095, SKIN, head, [0, HY, 0.015], [1, 1.05, 1], "kidHead");
  for (const s of [1, -1]) {
    ball(0.02, SKIN_SHADE, head, [s * 0.095, HY, 0.0], [0.5, 1.2, 0.9]); // ears
    ball(0.018, WHITE, head, [s * 0.037, HY + 0.015, 0.097], [1, 1.15, 0.7]);
    ball(0.01, "#3a2a1c", head, [s * 0.037, HY + 0.015, 0.108], [1, 1.1, 0.6]);
    ball(0.003, WHITE, head, [s * 0.034, HY + 0.02, 0.113]);
    box(0.04, 0.008, 0.01, HAIR, head, [s * 0.037, HY + 0.045, 0.097], undefined, { rotation: [0, 0, s * 8] });
    ball(0.018, CHEEK, head, [s * 0.062, HY - 0.025, 0.088], [1, 0.7, 0.4]);
  }
  ball(0.014, SKIN_SHADE, head, [0, HY - 0.012, 0.108], [1, 1, 1]);
  box(0.05, 0.007, 0.01, "#a8423a", head, [0, HY - 0.045, 0.098]);
  // lower jaw (separate)
  ball(0.05, SKIN, jaw, [0, HY - 0.075, 0.05], [1, 0.8, 0.95], "chin");
  box(0.04, 0.008, 0.01, "#d4685c", jaw, [0, HY - 0.056, 0.098]);
  // hair
  b.part(new THREE.SphereGeometry(0.103, 10, 7, 0, Math.PI * 2, 0, Math.PI * 0.38), HAIR, {
    bone: head, at: [0, HY + 0.015, -0.005], name: "hairCap",
  });
  ball(0.095, HAIR, head, [0, HY + 0.02, -0.045], [1, 0.95, 0.9], "hairBack");
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.034;
    box(0.04, 0.03, 0.012, HAIR, head, [x, HY + 0.062 - Math.abs(i - 2) * 0.004, 0.095 - Math.abs(i - 2) * 0.012], undefined, {
      rotation: [-20, 0, (i - 2) * 8],
    });
  }

  // ---------- arms ----------
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const ch = arms[k];
    const [sh, el, wr] = ch.joints;
    const P = [s * 0.26, 0.88, 0], E = [s * 0.34, 0.7, 0], W = [s * 0.41, 0.5, 0];
    b.rod(P, E, 0.042, SHIRT, { bone: sh });
    ball(0.045, SHIRT, sh, P);
    b.rod(E, [s * 0.4, 0.53, 0], 0.056, FOIL, { bone: el, name: `forearmTube${k}` });
    for (const t of [0.12, 0.88]) {
      const p = [E[0] + (0.4 * s - E[0] + 0) * t, 0.7 - 0.17 * t, 0];
      b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 10), t < 0.5 ? TAPE : RED_TAPE, {
        bone: el, at: p, aim: [s * 0.07, -0.2, 0], name: undefined,
      });
    }
    // hand
    ball(0.04, SKIN, wr, [s * 0.415, 0.47, 0], [1, 1, 0.8], `hand${k}`);
    for (let i = 0; i < 3; i++) {
      const a = (i - 1) * 0.5;
      b.capsule([s * 0.415, 0.45, 0], [s * (0.415 + 0.05 * Math.sin(a)), 0.4 - 0.01 * Math.abs(i - 1), 0.012 * (i - 1) + 0.02], 0.009, SKIN, { bone: wr });
    }
    b.capsule([s * 0.38, 0.47, 0.01], [s * 0.35, 0.43, 0.04], 0.01, SKIN, { bone: wr });
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const [hp, kn, an] = [legs[k].joints[0], legs[k].joints[1], legs[k].tip];
    b.rod([s * 0.09, 0.5, 0], [s * 0.09, 0.3, 0.01], 0.05, JEANS, { bone: hp });
    b.rod([s * 0.09, 0.4, 0.008], [s * 0.09, 0.1, 0], 0.07, FOIL, { bone: kn, name: `shinTube${k}` });
    b.part(new THREE.CylinderGeometry(0.073, 0.073, 0.02, 10), TAPE, { bone: kn, at: [s * 0.09, 0.39, 0.008] });
    b.part(new THREE.CylinderGeometry(0.073, 0.073, 0.02, 10), RED_TAPE, { bone: kn, at: [s * 0.09, 0.12, 0.002] });
    // sneakers
    box(0.1, 0.045, 0.21, SOLE, an, [s * 0.09, 0.0225, 0.04], `sole${k}`);
    box(0.1, 0.05, 0.2, SNEAKER, an, [s * 0.09, 0.07, 0.035], `sneaker${k}`);
    ball(0.05, SNEAKER, an, [s * 0.09, 0.055, 0.12], [1, 0.75, 0.9]);
  }

  for (const add of STAGE2) add(b);
  return b.root;
}
```

<!-- call: texture -->

Chest panel: a marker-drawn SVG texture with a blocky wobbly "ROBO" title, a speaker grid, arrows and crossed-out mistakes, laid on the panel box.
Torso box: a paint with corrugation streaks, scuffs, dark edges and warm/cool shading by normal. A "THIS SIDE UP" arrow, a FRAGILE stamp and a shipping label are drawn on the side faces.
Helmet box: a paint with the corrugation grain, plus marker doodles (bolts, stars, dots) and a half-torn logo on the front, side and back faces.
Foil wrinkles: a cell-based facet paint between FOIL and FOIL_DARK with creases and dull tape patches, shared by the arm and leg tubes.

<<<<<<< SEARCH
  const b = createBuilder({ name: "boxRobotKid" });
=======
  const b = createBuilder({ name: "boxRobotKid", paintSize: 2048 });

  // ---------- stage 2 surfaces ----------
  const corrug = (base: string, dark: string, seed: number) =>
    paint((p, n) => {
      const streak = Math.sin((Math.abs(n.y) > 0.5 ? p.x : p.y) * 380 + noise(p, 0.03, seed) * 6) * 0.5 + 0.5;
      let c: any = mix(base, dark, 0.18 + 0.3 * streak * noise(p, 0.12, seed + 1));
      c = mix(c, dark, 0.45 * smoothstep(0.62, 0.85, noise(p, 0.05, seed + 2)));
      c = mix(c, "#e2bb82", 0.25 * smoothstep(0.5, 1, n.y));
      return c;
    });
  const torsoPaint = paint((p, n, s) => {
    const base = corrug(CARD, CARD_DARK, 3);
    const ex = Math.abs(Math.abs(p.x) - 0.22) < 0.012 || Math.abs(p.y - 0.52) < 0.012 || Math.abs(p.y - 0.96) < 0.012;
    return ex ? mix(resolve(base, p, n), CARD_DARK, 0.5) : base;
  });
  const helmetPaint = corrug(CARD, CARD_DARK, 9);
  const foilPaint = paint((p, n) => {
    const c = cells(p, 0.035, 5);
    const e = c.d2 - c.d1;
    let col: any = mix(FOIL_DARK, "#eef1f6", 0.15 + 0.85 * c.id);
    col = mix(col, FOIL_DARK, 0.25 * (1 - smoothstep(0, 0.08, e)) + 0.1 * (1 - n.y));
    col = mix(col, "#9aa0ab", 0.35 * smoothstep(0.55, 0.75, noise(p, 0.05, 6)));
    const tape = smoothstep(0.7, 0.8, noise(p, 0.07, 14));
    return mix(col, "#b9ab8c", 0.55 * tape);
  });

  const CHEST_TEX = svg(
    `<svg viewBox="0 0 150 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="150" height="100" fill="${CARD_LIGHT}"/>
    <g fill="none" stroke="${MARKER}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 8 L8 30 M8 8 L20 9 L19 18 L8 19 L21 30"/>
      <path d="M28 9 L27 30 L41 31 L42 9 Z"/>
      <path d="M50 9 L49 29 L60 30 Q64 20 59 17 Q63 10 50 9 M50 19 L58 18"/>
      <path d="M71 9 L70 30 L85 31 L86 9 Z"/>
      <path d="M95 8 L94 30 L108 29 L109 9 Z M95 18 L108 19"/>
      <path d="M92 38 L92 38"/>
    </g>
    <g fill="none" stroke="${MARKER}" stroke-width="1.8" stroke-linecap="round">
      <path d="M12 45 L44 46 L44 82 L11 81 Z"/>
      <path d="M12 57 L44 58 M12 69 L44 69 M23 45 L22 81 M34 46 L33 82"/>
      <path d="M62 50 L100 51 M92 44 L101 51 L92 58"/>
      <path d="M62 66 L104 65 M70 60 L62 66 L70 72"/>
      <path d="M115 48 Q128 40 140 50 M135 42 L141 50 L131 53" />
      <path d="M112 62 L138 90 M138 62 L112 90" stroke="#c9302c" stroke-width="2.4"/>
      <circle cx="75" cy="86" r="5"/><circle cx="92" cy="86" r="5"/>
    </g>
    <path d="M60 78 Q66 74 72 79 Q78 74 84 78" fill="none" stroke="${MARKER}" stroke-width="1.6"/>
    <path d="M4 36 L146 37" stroke="${MARKER}" stroke-width="1" stroke-dasharray="3 3" opacity="0.5"/>
  </svg>`,
    { size: 512 },
  );

  const TORSO_DECAL = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.8">
      <rect x="6" y="8" width="52" height="30" fill="#efe6d2" stroke="#5a4a38" stroke-width="1.5"/>
      <path d="M10 16 L54 16 M10 22 L40 22 M10 28 L48 28" stroke="#5a4a38" stroke-width="2"/>
      <rect x="44" y="24" width="10" height="9" fill="none" stroke="#5a4a38" stroke-width="1"/>
      <g stroke="#6a5a42" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 90 L20 52 M10 62 L20 50 L30 62"/>
        <path d="M36 92 L36 70 M36 70 L46 70 M36 80 L44 80"/>
      </g>
      <rect x="58" y="56" width="38" height="30" fill="none" stroke="#b03a2e" stroke-width="3" transform="rotate(-8 77 71)"/>
      <text x="77" y="76" font-family="sans-serif" font-weight="bold" font-size="11" text-anchor="middle" fill="#b03a2e" transform="rotate(-8 77 71)">FRAGILE</text>
      <text x="22" y="98" font-family="sans-serif" font-size="6" fill="#6a5a42">THIS SIDE UP</text>
    </g></svg>`,
    { size: 256 },
  );
  const HELMET_DECAL = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="${MARKER}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 10 L6 24 L13 24 L8 40"/>
      <path d="M40 8 L43 15 L50 16 L45 21 L46 28 L40 24 L34 28 L35 21 L30 16 L37 15 Z" stroke="${BLUE}"/>
      <path d="M72 62 L66 74 L73 74 L68 90" stroke="${BLUE}"/>
      <path d="M20 70 L24 80 L16 80 Z"/>
    </g>
    <g fill="${MARKER}"><circle cx="10" cy="92" r="2"/><circle cx="20" cy="94" r="2"/><circle cx="30" cy="91" r="2"/><circle cx="40" cy="94" r="2"/><circle cx="50" cy="92" r="2"/></g>
    <path d="M62 8 L96 10 L92 30 L80 26 L74 34 L64 28 Z" fill="#8f6637" opacity="0.5"/>
    <text x="68" y="22" font-family="sans-serif" font-weight="bold" font-size="9" fill="#7a2a22" opacity="0.7">BOX</text>
  </svg>`,
    { size: 256 },
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
import { createBuilder, type Builder } from "agentic-3js-builder";
=======
import { createBuilder, type Builder, paint, noise, mix, smoothstep, resolve, cells, svg } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(0.44, 0.44, 0.3, CARD, spine, [0, 0.74, 0], "torsoBox");
  box(0.3, 0.2, 0.006, CARD_LIGHT, spine, [0, 0.8, 0.153], "chestPanel");
=======
  box(0.44, 0.44, 0.3, torsoPaint as any, spine, [0, 0.74, 0], "torsoBox");
  b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
    bone: spine, at: [0.2215, 0.72, 0.02], dir: [1, 0, 0], axis: "z", rotation: undefined, texture: TORSO_DECAL, name: "torsoDecalL",
  });
  b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
    bone: spine, at: [-0.2215, 0.72, -0.02], dir: [-1, 0, 0], axis: "z", texture: TORSO_DECAL, name: "torsoDecalR",
  });
  box(0.3, 0.2, 0.006, "#ffffff", spine, [0, 0.8, 0.153], "chestPanel");
  b.part(new THREE.PlaneGeometry(0.3, 0.2), "#ffffff", {
    bone: spine, at: [0, 0.8, 0.1565], dir: [0, 0, 1], axis: "z", texture: CHEST_TEX, name: "chestArt",
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(0.34, 0.3, T, CARD, head, [0, 1.16, -0.15], "headBox");
=======
  box(0.34, 0.3, T, helmetPaint as any, head, [0, 1.16, -0.15], "headBox");
  b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
    bone: head, at: [0, 1.16, -0.1565], dir: [0, 0, -1], axis: "z", texture: HELMET_DECAL, name: "helmetDecalBack",
  });
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
      bone: head, at: [s * 0.1705, 1.16, 0.0], dir: [s, 0, 0], axis: "z", texture: HELMET_DECAL, name: "helmetDecal",
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
    box(T, 0.3, 0.3, CARD, head, [s * 0.164, 1.16, 0], "headBox");
=======
    box(T, 0.3, 0.3, helmetPaint as any, head, [s * 0.164, 1.16, 0], "headBox");
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.rod(E, [s * 0.4, 0.53, 0], 0.056, FOIL, { bone: el, name: `forearmTube${k}` });
=======
    b.rod(E, [s * 0.4, 0.53, 0], 0.056, foilPaint, { bone: el, name: `forearmTube${k}` });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.rod([s * 0.09, 0.4, 0.008], [s * 0.09, 0.1, 0], 0.07, FOIL, { bone: kn, name: `shinTube${k}` });
=======
    b.rod([s * 0.09, 0.4, 0.008], [s * 0.09, 0.1, 0], 0.07, foilPaint, { bone: kn, name: `shinTube${k}` });
>>>>>>> REPLACE

<!-- call: add1 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";

export function addChestControls(b: Builder) {
  const BRASS = "#c9a24a";
  const LAMP = "#7be07a";
  const Z = 0.159; // chest panel front face is at z=0.156
  const cyl = (r: number, h: number, c: string, at: number[], seg = 10, extra: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, {
      bone: "spine",
      at,
      rotation: [90, 0, 0],
      ...extra,
    });

  // sunken dark slot backing + coin slot
  b.part(new THREE.BoxGeometry(0.1, 0.03, 0.004), CARD_DARK, { bone: "spine", at: [0.085, 0.725, Z - 0.001], name: "slotPlate" });
  b.part(new THREE.BoxGeometry(0.07, 0.008, 0.005), MARKER, { bone: "spine", at: [0.085, 0.725, Z + 0.002], name: "coinSlot" });
  b.part(new THREE.BoxGeometry(0.075, 0.004, 0.004), TAPE, { bone: "spine", at: [0.085, 0.7405, Z + 0.001] });

  // knobs: bottle caps with notch lines
  const knobCols = [RED_TAPE, YELLOW, BLUE];
  const dial = svg(
    `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="none" stroke="#26252b" stroke-width="3" stroke-dasharray="3 3.1"/><circle cx="16" cy="16" r="9" fill="#ffffff" opacity="0.18"/></svg>`,
    { size: 64 },
  );
  knobCols.forEach((c, i) => {
    const x = -0.095 + i * 0.065;
    const y = 0.86;
    cyl(0.026, 0.008, FOIL_DARK, [x, y, Z + 0.001], 12); // fluted base
    cyl(0.021, 0.014, c, [x, y, Z + 0.008], 12); // cap
    cyl(0.017, 0.004, c, [x, y, Z + 0.016], 12);
    // notch pointer
    const a = (-50 + i * 50) * (Math.PI / 180);
    b.part(new THREE.BoxGeometry(0.004, 0.016, 0.004), MARKER, {
      bone: "spine",
      at: [x + Math.sin(a) * 0.007, y + Math.cos(a) * 0.007, Z + 0.0195],
      rotation: [0, 0, -(a * 180) / Math.PI],
    });
    // tick ring decal
    b.part(new THREE.PlaneGeometry(0.06, 0.06), "#ffffff", {
      bone: "spine",
      at: [x, y, Z + 0.0005],
      dir: [0, 0, 1],
      axis: "z",
      texture: dial,
    });
  });

  // two big jar-lid push buttons
  [[-0.07, 0.755, RED_TAPE], [-0.005, 0.755, BLUE]].forEach(([x, y, c], i) => {
    cyl(0.03, 0.01, BRASS, [x as number, y as number, Z + 0.003], 14, { name: `lidRing${i}` });
    cyl(0.024, 0.016, FOIL, [x as number, y as number, Z + 0.008], 14);
    cyl(0.02, 0.012, c as string, [x as number, y as number, Z + 0.016], 14, { name: `pushBtn${i}` });
    b.part(new THREE.SphereGeometry(0.007, 6, 4), WHITE, {
      bone: "spine",
      at: [(x as number) - 0.007, (y as number) + 0.007, Z + 0.023],
      scale: [1, 1, 0.5],
    });
  });

  // five bottle-cap lights in a row
  const lc = [LAMP, YELLOW, RED_TAPE, LAMP, BLUE];
  lc.forEach((c, i) => {
    const x = -0.1 + i * 0.05;
    cyl(0.0125, 0.006, FOIL_DARK, [x, 0.7, Z + 0.001], 8);
    cyl(0.009, 0.01, c, [x, 0.7, Z + 0.006], 8);
  });

  // masking-tape strip labels + hand-drawn marker label under knobs
  const label = svg(
    `<svg viewBox="0 0 120 20"><rect width="120" height="20" fill="#dccaa0"/><text x="6" y="15" font-family="sans-serif" font-weight="bold" font-size="13" fill="#26252b">VOL   MIX   ZAP</text></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.18, 0.03), "#ffffff", {
    bone: "spine",
    at: [-0.03, 0.816, Z + 0.0005],
    dir: [0, 0, 1],
    axis: "z",
    texture: label,
  });

  // wobbly drawn wire from a knob down to the slot
  b.sweep(
    [[0.1, 0.845, Z + 0.003], [0.13, 0.82, Z + 0.004], [0.115, 0.775, Z + 0.004], [0.125, 0.745, Z + 0.004]],
    0.003,
    { color: MARKER, bone: "spine", sides: 5 } as any,
  );
  // tape corners holding the panel
  [[-0.14, 0.89], [0.14, 0.89], [-0.14, 0.71], [0.14, 0.71]].forEach(([x, y], i) => {
    b.part(new THREE.BoxGeometry(0.03, 0.012, 0.003), TAPE, {
      bone: "spine",
      at: [x, y, Z - 0.0005],
      rotation: [0, 0, i % 2 ? 40 : -40],
    });
  });
}
```

<!-- call: add2 -->

```ts
import * as THREE from "three";
import { type Builder, catmull, polyline } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addAntennaArray(b: Builder) {
  const HY = 1.14;
  const MARK = MARKER;

  // ---------- LEFT antenna: pipe-cleaner spring below foil ball ----------
  // rod runs from [-0.06,1.314,-0.03] to [-0.09,1.43,-0.03]; ball at [-0.09,1.45,-0.03]
  {
    const pts: number[][] = [];
    const turns = 6;
    const a0 = [-0.0625, 1.322, -0.03];
    const a1 = [-0.0865, 1.42, -0.03];
    const n = turns * 8;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const ang = t * turns * Math.PI * 2;
      const r = 0.017;
      pts.push([
        a0[0] + (a1[0] - a0[0]) * t + Math.cos(ang) * r,
        a0[1] + (a1[1] - a0[1]) * t,
        a0[2] + Math.sin(ang) * r,
      ]);
    }
    b.sweep(polyline(pts), 0.0035, { bone: "head", color: FOIL_DARK, sides: 5, caps: "round" } as any);
    // small collar rings top and bottom
    for (const y of [1.325, 1.418]) {
      const x = -0.0625 + (-0.0865 + 0.0625) * ((y - 1.322) / 0.098);
      b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.006, 8), TAPE, { bone: "head", at: [x, y, -0.03] });
    }
    // little foil nubs on the ball
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      b.part(new THREE.ConeGeometry(0.008, 0.016, 5), FOIL_DARK, {
        bone: "head",
        at: [-0.09 + Math.cos(a) * 0.027, 1.45 + (i % 2 ? 0.012 : -0.008), -0.03 + Math.sin(a) * 0.027],
        aim: [Math.cos(a), i % 2 ? 0.3 : -0.2, Math.sin(a)],
      });
    }
    b.part(new THREE.SphereGeometry(0.012, 6, 4), WHITE, { bone: "head", at: [-0.098, 1.462, -0.012], scale: [1, 0.7, 0.5] });
  }

  // ---------- RIGHT antenna: paper-cup dish + yellow light ----------
  {
    const tip = [0.1, 1.428, -0.03];
    // dish: cone-ish cup tilted forward
    const dish = b.lathe(
      [
        [0, 0],
        [0.012, 0],
        [0.05, 0.035],
        [0.052, 0.04],
        [0.046, 0.04],
        [0.01, 0.008],
        [0, 0.008],
      ],
      { at: [tip[0], tip[1] + 0.006, tip[2]], axis: [0.1, 1, 0.55], segments: 10, color: CARD_LIGHT, bone: "head", name: "antDish" },
    );
    b.part(new THREE.CylinderGeometry(0.047, 0.047, 0.004, 10), RED_TAPE, {
      bone: "head",
      at: [tip[0] + 0.007, tip[1] + 0.047, tip[2] + 0.021],
      aim: [0.1, 1, 0.55],
    });
    // feed rod from dish center
    b.rod([tip[0], tip[1] + 0.012, tip[2]], [tip[0] + 0.02, tip[1] + 0.05, tip[2] + 0.04], 0.003, FOIL_DARK, { bone: "head" });
    glow(b.part(new THREE.SphereGeometry(0.009, 6, 4), YELLOW, { bone: "head", at: [tip[0] + 0.02, tip[1] + 0.055, tip[2] + 0.043] }), 1.4);
    // yellow bottle-cap light on the stalk beside the dish
    b.rod([0.075, 1.36, -0.03], [0.075, 1.385, -0.03], 0.006, FOIL_DARK, { bone: "head" });
    const cap = b.part(new THREE.CylinderGeometry(0.02, 0.017, 0.012, 10), YELLOW, {
      bone: "head", at: [0.075, 1.392, -0.03], name: "antCapLight",
    });
    glow(cap, 1.3);
    b.part(new THREE.TorusGeometry(0.019, 0.003, 4, 10), FOIL, {
      bone: "head", at: [0.075, 1.388, -0.03], rotation: [90, 0, 0],
    });
    void dish;
  }

  // ---------- EAR SPEAKERS ----------
  for (const s of [1, -1]) {
    const x = s * 0.2; // outer face of cup (cup center 0.185, half thick 0.02)
    const out: [number, number, number] = [s, 0, 0];
    // concentric grille rings (lying in the YZ plane, facing +-X)
    for (const [r, tr] of [[0.044, 0.0035], [0.032, 0.0032], [0.02, 0.003]] as const) {
      b.part(new THREE.TorusGeometry(r, tr, 4, 14), MARK, {
        bone: "head", at: [x + s * 0.001, HY, 0], dir: out, axis: "z", name: "speakerRing",
      });
    }
    // grille fill disc (dark, slightly recessed look)
    b.part(new THREE.CircleGeometry(0.048, 14), FOIL_DARK, {
      bone: "head", at: [x - s * 0.0005, HY, 0], dir: out, axis: "z",
    });
    // centre cap
    b.part(new THREE.CylinderGeometry(0.012, 0.014, 0.008, 8), MARK, {
      bone: "head", at: [x + s * 0.003, HY, 0], aim: out,
    });
    // radial slits
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI;
      b.part(new THREE.BoxGeometry(0.003, 0.082, 0.002), MARK, {
        bone: "head", at: [x + s * 0.0005, HY, 0], rotation: [(a * 180) / Math.PI, 0, 0],
      });
    }
    // tape bits around the rim
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2;
      b.part(new THREE.BoxGeometry(0.006, 0.018, 0.009), i % 2 ? TAPE : RED_TAPE, {
        bone: "head",
        at: [x - s * 0.004, HY + Math.cos(a) * 0.056, Math.sin(a) * 0.056],
        rotation: [(-a * 180) / Math.PI, 0, 0],
      });
    }
    // wire loop from cup top to helmet side
    const wire = catmull(
      [
        [s * 0.19, HY + 0.056, 0.0],
        [s * 0.205, HY + 0.095, 0.01],
        [s * 0.215, HY + 0.13, -0.02],
        [s * 0.19, HY + 0.12, -0.05],
        [s * 0.17, HY + 0.07, -0.04],
        [s * 0.166, HY + 0.045, -0.02],
      ],
    );
    b.sweep(wire, 0.0028, { bone: "head", color: MARK, sides: 5 } as any);
    // wire staples
    for (const p of [[s * 0.19, HY + 0.056, 0.0], [s * 0.166, HY + 0.045, -0.02]]) {
      b.part(new THREE.BoxGeometry(0.01, 0.006, 0.01), TAPE, { bone: "head", at: p });
    }
  }
}
```

<!-- call: add3 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addShoulderJoints(b: Builder) {
  const BRASS = "#c9a24a";
  const LID = "#9aa3ae";
  const LID_RIM = "#6f7782";
  const GREEN = "#4f8a5a";

  for (const s of [1, -1]) {
    const cx = s * 0.228;
    const cy = 0.88;
    const bone = "spine";
    const X = s * 90; // rotation about Z turns a Y-cylinder to point along X

    // cardboard reinforcement washer under the lid
    b.part(new THREE.CylinderGeometry(0.058, 0.058, 0.006, 12), CARD_DARK, {
      bone, at: [cx + s * 0.003, cy, 0], rotation: [0, 0, -X],
    });
    // tape ring (torus-like, thin cylinder ring)
    b.part(new THREE.TorusGeometry(0.056, 0.008, 5, 14), TAPE, {
      bone, at: [cx + s * 0.008, cy, 0], rotation: [0, 90, 0],
    });
    // jar lid disc
    b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.014, 12), LID, {
      bone, at: [cx + s * 0.012, cy, 0], rotation: [0, 0, -X], name: `jarLid${s > 0 ? "L" : "R"}`,
    });
    // lid rim (ridged edge)
    b.part(new THREE.TorusGeometry(0.048, 0.005, 4, 12), LID_RIM, {
      bone, at: [cx + s * 0.017, cy, 0], rotation: [0, 90, 0],
    });
    // inset centre dish
    b.part(new THREE.CylinderGeometry(0.03, 0.034, 0.006, 10), LID_RIM, {
      bone, at: [cx + s * 0.02, cy, 0], rotation: [0, 0, -X],
    });
    // green marker-ink ring on the lid
    b.part(new THREE.TorusGeometry(0.039, 0.0022, 4, 14), GREEN, {
      bone, at: [cx + s * 0.0205, cy, 0], rotation: [0, 90, 0],
    });
    // arm pivot cap
    b.part(new THREE.SphereGeometry(0.014, 6, 4), BRASS, {
      bone, at: [cx + s * 0.024, cy, 0], scale: [0.6, 1, 1],
    });

    // four paper-fastener bolts: round head, split prongs, tiny flare
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + (i * Math.PI) / 2;
      const y = cy + Math.sin(a) * 0.04;
      const z = Math.cos(a) * 0.04;
      b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.005, 8), BRASS, {
        bone, at: [cx + s * 0.021, y, z], rotation: [0, 0, -X],
      });
      b.part(new THREE.SphereGeometry(0.005, 5, 3), "#f0d78a", {
        bone, at: [cx + s * 0.0235, y + 0.001, z + 0.001], scale: [0.4, 1, 1],
      });
      // splayed prong on lid face
      b.part(new THREE.BoxGeometry(0.002, 0.014, 0.003), BRASS, {
        bone, at: [cx + s * 0.019, y + Math.sin(a) * 0.006, z + Math.cos(a) * 0.006],
        rotation: [(-a * 180) / Math.PI, 0, 0],
      });
    }

    // little tape strips crossing the washer to hold it to the box
    for (const r of [35, -35]) {
      b.part(new THREE.BoxGeometry(0.004, 0.016, 0.115), TAPE, {
        bone, at: [cx - s * 0.002, cy, 0], rotation: [r, 0, 0],
      });
    }
    // marker tick marks around rim
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + 0.2;
      b.part(new THREE.BoxGeometry(0.003, 0.003, 0.009), MARKER, {
        bone, at: [cx + s * 0.0185, cy + Math.sin(a) * 0.0455, Math.cos(a) * 0.0455],
        rotation: [(-a * 180) / Math.PI, 0, 0],
      });
    }
  }
}
```

<!-- call: add4 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addElbowHose(b: Builder) {
  const FOILD = FOIL_DARK;
  // ---- elbow hose + wrist tape, both arms ----
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const bone = "elbow" + k;
    // forearm axis: elbow (s*0.34,0.7,0) -> (s*0.40,0.53,0)
    const ex = s * 0.34, ey = 0.7;
    const dx = s * 0.06, dy = -0.17;
    const len = Math.hypot(dx, dy);
    const ux = dx / len, uy = dy / len;
    const aimDir = [dx, dy, 0];
    // accordion rings near the top
    for (let i = 0; i < 5; i++) {
      const t = 0.01 + i * 0.026;
      const p = [ex + ux * t, ey + uy * t, 0];
      b.part(new THREE.CylinderGeometry(0.066, 0.066, 0.016, 10), i % 2 ? FOILD : FOIL, {
        bone, at: p, aim: aimDir, name: `s24hose${k}${i}`,
      });
      b.part(new THREE.TorusGeometry(0.066, 0.006, 4, 10), MARKER, {
        bone, at: [p[0] + ux * 0.008, p[1] + uy * 0.008, 0], aim: aimDir, axis: "z",
      });
    }
    // red tape at wrist end
    for (const [t, c] of [[0.155, RED_TAPE], [0.17, TAPE]] as [number, string][]) {
      const p = [ex + ux * t, ey + uy * t, 0];
      b.part(new THREE.CylinderGeometry(0.061, 0.061, t > 0.16 ? 0.006 : 0.02, 10), c, {
        bone, at: p, aim: aimDir, name: `s24wrist${k}${t}`,
      });
    }
    // loose tape tail
    b.part(new THREE.BoxGeometry(0.012, 0.035, 0.004), RED_TAPE, {
      bone, at: [ex + ux * 0.15 + s * 0.058, ey + uy * 0.15, 0.01], rotation: [0, 0, s * 20],
    });
  }

  // ---- belt buckle ----
  const bone = "spine";
  const z = 0.158;
  // foil plate with marker outline
  b.part(new THREE.BoxGeometry(0.1, 0.06, 0.006), MARKER, { bone, at: [0, 0.58, z], name: "s24buckleOutline" });
  b.part(new THREE.BoxGeometry(0.09, 0.05, 0.006), FOIL, { bone, at: [0, 0.58, z + 0.003], name: "s24buckle" });
  b.part(new THREE.BoxGeometry(0.06, 0.03, 0.004), FOILD, { bone, at: [0, 0.58, z + 0.007] });
  b.part(new THREE.BoxGeometry(0.048, 0.018, 0.004), FOIL, { bone, at: [0, 0.58, z + 0.009] });
  // prong / tab
  b.part(new THREE.BoxGeometry(0.008, 0.04, 0.005), MARKER, { bone, at: [0, 0.58, z + 0.012] });
  b.part(new THREE.BoxGeometry(0.03, 0.01, 0.004), TAPE, { bone, at: [0.05, 0.545, z + 0.002], rotation: [0, 0, -12] });
  // corner rivets
  for (const sx of [1, -1])
    for (const sy of [1, -1])
      b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.004, 6), YELLOW, {
        bone, at: [sx * 0.04, 0.58 + sy * 0.021, z + 0.008], dir: [0, 0, 1],
      });
  // crinkle highlights
  b.part(new THREE.BoxGeometry(0.02, 0.003, 0.003), WHITE, { bone, at: [-0.025, 0.597, z + 0.007], rotation: [0, 0, 15] });
}
```

<!-- call: add5 -->

```ts
import * as THREE from "three";
import { type Builder, catmull, svg } from "agentic-3js-builder";

export function addBackPack(b: Builder) {
  const BONE = "spine";
  const Z0 = -0.153; // torso back surface
  const D = 0.09; // pack depth
  const zc = Z0 - D / 2;
  const PACK = "#c9a566";
  const PACK_DARK = "#7a5530";
  const BLACKISH = MARKER;
  const SW = "#9aa0aa";

  const cardLabel = svg(
    `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="80" fill="#e6c98e"/>
      <rect x="3" y="3" width="58" height="74" fill="none" stroke="#b5432f" stroke-width="3"/>
      <rect x="9" y="10" width="46" height="18" fill="#b5432f"/>
      <path d="M14 19 H50" stroke="#e6c98e" stroke-width="4" stroke-linecap="round"/>
      <path d="M10 38 H54 M10 46 H44 M10 54 H50" stroke="#26252b" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M12 68 L20 62 L28 68 L36 62 L44 68" stroke="#26252b" stroke-width="2.6" fill="none"/>
    </svg>`,
    { size: 128 },
  );

  const part = (g: THREE.BufferGeometry, c: string, at: number[], extra: any = {}) =>
    b.part(g, c, { bone: BONE, at, ...extra });

  // main cereal box, with its slightly darker side walls and top/bottom flaps
  part(new THREE.BoxGeometry(0.26, 0.28, D), PACK, [0, 0.76, zc], { name: "packBox" });
  for (const s of [1, -1]) {
    part(new THREE.BoxGeometry(0.01, 0.285, D + 0.004), PACK_DARK, [s * 0.13, 0.76, zc]);
  }
  part(new THREE.BoxGeometry(0.262, 0.012, D + 0.006), PACK_DARK, [0, 0.9, zc]);
  part(new THREE.BoxGeometry(0.262, 0.012, D + 0.006), PACK_DARK, [0, 0.62, zc]);
  // tape straps fixing it to the torso
  for (const s of [1, -1]) {
    part(new THREE.BoxGeometry(0.04, 0.05, 0.012), TAPE, [s * 0.1, 0.9, Z0 - 0.003]);
    part(new THREE.BoxGeometry(0.04, 0.05, 0.012), TAPE, [s * 0.1, 0.62, Z0 - 0.003]);
  }

  // label on the back face (textured plane facing -Z)
  part(new THREE.PlaneGeometry(0.1, 0.125), WHITE, [-0.06, 0.8, Z0 - D - 0.002], {
    dir: [0, 0, -1],
    axis: "z",
    texture: cardLabel,
    name: "packLabel",
  });

  // vent slits cut into the back face
  for (let i = 0; i < 5; i++) {
    part(new THREE.BoxGeometry(0.075, 0.009, 0.004), BLACKISH, [0.065, 0.84 - i * 0.022, Z0 - D - 0.001]);
  }

  // tape handle on top: two posts and a loop bar
  for (const s of [1, -1]) {
    part(new THREE.BoxGeometry(0.014, 0.05, 0.014), RED_TAPE, [s * 0.05, 0.93, zc]);
  }
  part(new THREE.BoxGeometry(0.114, 0.016, 0.02), RED_TAPE, [0, 0.96, zc], { name: "packHandle" });

  // toggle switch: metal plate, base nut, lever and tip ball, plus status lights
  part(new THREE.BoxGeometry(0.06, 0.05, 0.008), FOIL_DARK, [0.065, 0.69, Z0 - D - 0.003]);
  part(new THREE.CylinderGeometry(0.01, 0.01, 0.01, 8), SW, [0.065, 0.69, Z0 - D - 0.01], { rotation: [90, 0, 0] });
  b.rod([0.065, 0.69, Z0 - D - 0.01], [0.075, 0.715, Z0 - D - 0.04], 0.004, FOIL, { bone: BONE });
  part(new THREE.SphereGeometry(0.009, 6, 4), RED_TAPE, [0.075, 0.715, Z0 - D - 0.042]);
  for (let i = 0; i < 2; i++) {
    part(new THREE.CylinderGeometry(0.008, 0.008, 0.008, 8), i ? YELLOW : BLUE, [-0.07 + i * 0.03, 0.69, Z0 - D - 0.004], {
      rotation: [90, 0, 0],
    });
  }

  // corrugated edge ticks on the box top
  for (let i = 0; i < 6; i++) {
    part(new THREE.BoxGeometry(0.005, 0.004, D - 0.01), CARD_DARK, [-0.11 + i * 0.044, 0.907, zc]);
  }

  // curly wire from the pack top up to the helmet (zigzag coil swept as tube)
  const pts: number[][] = [];
  const turns = 5;
  for (let i = 0; i <= turns * 6; i++) {
    const t = i / (turns * 6);
    const a = t * turns * Math.PI * 2;
    const y = 0.93 + t * 0.2;
    pts.push([-0.11 + 0.04 * Math.sin(t * 3) + 0.014 * Math.cos(a), y, zc - 0.01 + 0.014 * Math.sin(a) - t * 0.0]);
  }
  b.sweep(catmull(pts), 0.0035, { color: MARKER, bone: BONE, sides: 5 } as any);
  // wire ends: clamps
  part(new THREE.BoxGeometry(0.03, 0.02, 0.02), FOIL_DARK, [-0.11, 0.925, zc]);
  part(new THREE.BoxGeometry(0.02, 0.016, 0.016), FOIL_DARK, [-0.1, 1.135, zc + 0.045], { bone: "head" });
  b.rod([-0.11, 1.12, zc - 0.012], [-0.1, 1.135, zc + 0.04], 0.0035, MARKER, { bone: "head" });
}
```

<!-- call: add6 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addKneeBolts(b: Builder) {
  const BRASS = "#c9a24a";
  const BRASS_DARK = "#8a6a28";
  const LACE_SHADE = "#d8d4c8";

  const cyl = (rt: number, rb: number, h: number, seg = 8) => new THREE.CylinderGeometry(rt, rb, h, seg);

  // ---------- knee caps and shin tape (pair) ----------
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const bone = `knee${k}`;
    const cx = s * 0.09;

    // foil half-ball cap on the shin front
    b.part(new THREE.SphereGeometry(0.058, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), FOIL, {
      bone, at: [cx, 0.36, 0.05], rotation: [90, 0, 0], name: `kneeCap${k}`,
    });
    // rim of the cap
    b.part(new THREE.TorusGeometry(0.058, 0.007, 4, 12), FOIL_DARK, {
      bone, at: [cx, 0.36, 0.05], name: `kneeRim${k}`,
    });
    // four paper-fastener bolts
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + (i * Math.PI) / 2;
      const bx = cx + Math.cos(a) * 0.042;
      const by = 0.36 + Math.sin(a) * 0.042;
      b.part(cyl(0.01, 0.01, 0.006, 8), BRASS, {
        bone, at: [bx, by, 0.1], rotation: [90, 0, 0], name: `kneeBolt${k}${i}`,
      });
      b.part(new THREE.BoxGeometry(0.014, 0.003, 0.003), BRASS_DARK, {
        bone, at: [bx, by, 0.104], rotation: [0, 0, i * 45],
      });
    }
    // center dimple highlight
    b.part(cyl(0.012, 0.012, 0.004, 8), FOIL_DARK, { bone, at: [cx, 0.36, 0.107], rotation: [90, 0, 0] });

    // tape strip around middle of shin (tube radius 0.07)
    b.part(cyl(0.0735, 0.0735, 0.03, 12), TAPE, { bone, at: [cx, 0.24, 0.005], name: `shinTape${k}` });
    // tape edge lines and a loose tail
    for (const dy of [0.016, -0.016])
      b.part(cyl(0.0742, 0.0742, 0.003, 12), CARD_DARK, { bone, at: [cx, 0.24 + dy, 0.005] });
    b.part(new THREE.BoxGeometry(0.03, 0.04, 0.003), TAPE, {
      bone, at: [cx + s * 0.02, 0.215, 0.077], rotation: [-8, 0, s * 10], name: `tapeTail${k}`,
    });
  }

  // ---------- sneakers (pair) ----------
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const bone = `ankle${k}`;
    const cx = s * 0.09;

    // toe cap (rubber bumper)
    b.part(new THREE.SphereGeometry(0.052, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), SOLE, {
      bone, at: [cx, 0.047, 0.125], rotation: [90, 0, 0], scale: [1, 0.9, 0.9], name: `toeCap${k}`,
    });
    b.part(new THREE.BoxGeometry(0.1, 0.012, 0.004), CARD_DARK, { bone, at: [cx, 0.046, 0.175] });

    // tongue
    b.part(new THREE.BoxGeometry(0.056, 0.008, 0.07), WHITE, {
      bone, at: [cx, 0.098, 0.06], rotation: [-12, 0, 0], name: `tongue${k}`,
    });
    // eyelet strips on both sides of the lace opening
    for (const e of [1, -1])
      b.part(new THREE.BoxGeometry(0.01, 0.006, 0.09), SNEAKER, { bone, at: [cx + e * 0.032, 0.098, 0.05] });

    // zigzag laces
    for (let i = 0; i < 4; i++) {
      const z = 0.025 + i * 0.026;
      b.rod([cx - 0.03, 0.103, z], [cx + 0.03, 0.103, z + 0.013], 0.003, WHITE, { bone });
      b.rod([cx + 0.03, 0.103, z + 0.013], [cx - 0.03, 0.103, z + 0.026], 0.003, LACE_SHADE, { bone });
      for (const e of [1, -1]) b.part(new THREE.SphereGeometry(0.005, 5, 4), WHITE, { bone, at: [cx + e * 0.032, 0.104, z + 0.013] });
    }
    // bow
    for (const e of [1, -1]) {
      b.part(new THREE.TorusGeometry(0.014, 0.0035, 4, 8), WHITE, {
        bone, at: [cx + e * 0.014, 0.106, 0.01], rotation: [90, 0, e * 20],
      });
      b.rod([cx, 0.105, 0.012], [cx + e * 0.02, 0.1, -0.008], 0.003, LACE_SHADE, { bone });
    }

    // rocket stripes on the outer side
    const sx = cx + s * 0.051;
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.BoxGeometry(0.004, 0.011, 0.07 - i * 0.012), YELLOW, {
        bone, at: [sx, 0.057 + i * 0.016, 0.03 + i * 0.006], name: `stripe${k}${i}`,
      });
    }
    // rocket nose pointing forward
    b.part(new THREE.ConeGeometry(0.011, 0.03, 6), YELLOW, {
      bone, at: [sx, 0.073, 0.092], rotation: [90, 0, 0], name: `rocketNose${k}`,
    });
    // flame at the heel
    b.part(new THREE.ConeGeometry(0.01, 0.03, 5), RED_TAPE, {
      bone, at: [sx, 0.073, -0.012], rotation: [-90, 0, 0],
    });

    // heel tab
    b.part(new THREE.BoxGeometry(0.04, 0.03, 0.01), SOLE, { bone, at: [cx, 0.1, -0.065], name: `heelTab${k}` });
    // sole stripe
    b.part(new THREE.BoxGeometry(0.102, 0.006, 0.202), MARKER, { bone, at: [cx, 0.05, 0.04], name: `welt${k}` });
  }
}
```