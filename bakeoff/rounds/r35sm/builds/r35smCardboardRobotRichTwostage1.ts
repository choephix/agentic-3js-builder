import * as THREE from "three";
import { createBuilder, type Builder } from "../../../../src/index";

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
