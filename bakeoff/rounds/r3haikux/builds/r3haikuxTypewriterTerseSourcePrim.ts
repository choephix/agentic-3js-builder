import * as THREE from "three";
import { createBuilder, mottle, rng, svg } from "../../../../src/index";

export const meta = {
  name: "Typewriter",
  description:
    "A cherry-red portable typewriter with cream keycaps printed with their letters, a black platen holding a typed sheet, chrome trim, a carriage-return lever and a badge on its side.",
};

const RED_LIGHT = "#c4402f";
const RED_DARK = "#a02c24";
const CREAM = "#f2e9d4";
const BLACK = "#1f1f23";
const STEEL = "#2a2a2f";
const CHROME = "#c9ced6";
const INK = "#2b2420";
const PAPER = "#f6f1e3";
const PAPER_BACK = "#ebe4d0";

// The keyboard deck runs from the front lip (y 0.09, z 0.19) back to its rear edge (y 0.14, z 0.03).
// Keys stand on it, tilted toward the typist.
const DECK_LEN = Math.hypot(0.16, 0.05);
const DECK_FRONT = new THREE.Vector3(0, 0.09, 0.19);
const BACK = new THREE.Vector3(0, 0.05 / DECK_LEN, -0.16 / DECK_LEN); // along the deck, front to back
const NORMAL = new THREE.Vector3(0, 0.16 / DECK_LEN, 0.05 / DECK_LEN); // off the deck, up and toward the typist

const deckAt = (d: number, x: number) =>
  new THREE.Vector3(x, DECK_FRONT.y, DECK_FRONT.z).addScaledVector(BACK, d);

const frameQuat = (x: THREE.Vector3, y: THREE.Vector3, z: THREE.Vector3) =>
  new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));

const PITCH = 0.026;
// Key rows: distance along the deck from the front lip, and the x of the first key. Rows step along +X as they come forward.
const ROWS = [
  { d: 0.145, keys: "1234567890", x0: -0.122 },
  { d: 0.115, keys: "QWERTYUIOP", x0: -0.1155 },
  { d: 0.085, keys: "ASDFGHJKL", x0: -0.109 },
  { d: 0.055, keys: "ZXCVBNM", x0: -0.1025 },
];

// Side profile of the body in (z, y): the deck slopes up from the front lip to the carriage housing at the back.
const SIDE = [
  [-0.16, 0.035],
  [0.19, 0.035],
  [0.19, 0.09],
  [0.03, 0.14],
  [-0.02, 0.19],
  [-0.16, 0.19],
];
// A black band just above the floor, a little wider than the body, so it reads as a plinth.
const PLINTH = [
  [-0.165, 0.035],
  [0.195, 0.035],
  [0.195, 0.052],
  [-0.165, 0.052],
];

const PLATEN_AT = [0, 0.228, -0.095];

export default function typewriter() {
  const b = createBuilder({ name: "typewriter", detail: 1, paintSize: 1024 });

  // Skeleton: the body, the carriage that carries the platen, the spacebar and the return lever.
  const body = b.joint("body", { at: [0, 0, 0] });
  const carriage = b.joint("carriage", { parent: body, at: PLATEN_AT });
  const spaceAt = deckAt(0.022, 0).addScaledVector(NORMAL, 0.012);
  const spaceBar = b.joint("spaceBar", { parent: body, at: spaceAt, role: "hinge" });
  const lever = b.joint("returnLever", { parent: carriage, at: [-0.2, 0.225, -0.095] });

  // Shell: red enamel side profile pushed across the width, a black plinth band and four feet.
  b.extrude(SIDE, {
    color: mottle(RED_LIGHT, RED_DARK, { size: 0.22, contrast: 0.7, seed: 4 }),
    at: [0, 0, 0],
    thickness: 0.4,
    bevel: 0.006,
    bone: body,
    name: "body",
  });
  b.extrude(PLINTH, { color: BLACK, at: [0, 0, 0], thickness: 0.408, bone: body, name: "plinth" });
  const foot = new THREE.CylinderGeometry(0.018, 0.02, 0.036, 12);
  for (const [x, z] of [
    [-0.165, -0.12],
    [0.165, -0.12],
    [-0.165, 0.14],
    [0.165, 0.14],
  ])
    b.part(foot, BLACK, { at: [x, 0.018, z], bone: body, group: "feet" });

  // Housing: the black carriage rail, and two ribbon spools with cream flanges.
  b.part(new THREE.BoxGeometry(0.4, 0.012, 0.035), BLACK, { at: [0, 0.196, -0.095], bone: body, name: "rail" });
  for (const x of [-0.13, 0.13]) {
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.016, 14), BLACK, {
      at: [x, 0.198, -0.14],
      bone: body,
      group: "spools",
    });
    b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.004, 14), CREAM, {
      at: [x, 0.208, -0.14],
      bone: body,
      group: "spools",
    });
  }

  // Carriage: the rubber platen between two end plates, a chrome platen knob with a black grip.
  b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.4, 18), STEEL, {
    at: PLATEN_AT,
    dir: [1, 0, 0],
    bone: carriage,
    name: "platen",
  });
  for (const x of [-0.2, 0.2])
    b.part(new THREE.BoxGeometry(0.012, 0.07, 0.06), BLACK, {
      at: [x, PLATEN_AT[1], PLATEN_AT[2]],
      bone: carriage,
      group: "plates",
    });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 14), CHROME, {
    at: [0.216, PLATEN_AT[1], PLATEN_AT[2]],
    dir: [1, 0, 0],
    bone: carriage,
    name: "knobShaft",
  });
  b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.008, 14), BLACK, {
    at: [0.23, PLATEN_AT[1], PLATEN_AT[2]],
    dir: [1, 0, 0],
    bone: carriage,
    name: "knobGrip",
  });

  // Carriage-return lever on the machine's right: a chrome arm with a black knob.
  b.capsule([-0.2, 0.225, -0.095], [-0.245, 0.262, -0.07], 0.005, {
    color: CHROME,
    bone: lever,
    name: "returnArm",
  });
  b.part(new THREE.SphereGeometry(0.014, 12, 8), BLACK, {
    at: [-0.25, 0.268, -0.066],
    bone: lever,
    name: "returnKnob",
  });

  // The sheet on the platen: a page typed in courier, each glyph jittered like a real strike.
  const jitter = rng(7);
  const TYPED = [
    "Dear Ada,",
    "The machine hums and the carriage",
    "rings its small bell at the margin.",
    "Every key is a decision made twice:",
    "once with the hand, once with the page.",
    "Yours in ribbon and ink,",
    "M.",
  ];
  const typedLines = TYPED.map((text, row) => {
    const chars = [...text];
    const baseY = 26 + row * 11;
    const rotate = chars.map(() => ((jitter() - 0.5) * 4).toFixed(1)).join(" ");
    const ys = chars.map(() => (baseY + (jitter() - 0.5) * 0.8).toFixed(2)).join(" ");
    return `<text x="22" y="${ys}" rotate="${rotate}" font-family="'Courier New', Courier, monospace" font-size="6.6" fill="${INK}">${text}</text>`;
  });
  const sheet = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 200">` +
      `<rect width="210" height="200" fill="${PAPER}"/>` +
      `<line x1="18" y1="0" x2="18" y2="200" stroke="#e2a7a2" stroke-width="0.6"/>` +
      typedLines.join("") +
      `</svg>`,
    { size: 1024 },
  );
  b.part(new THREE.PlaneGeometry(0.21, 0.2), "#ffffff", {
    at: [0, 0.338, -0.058],
    texture: sheet,
    bone: carriage,
    name: "paper",
  });
  b.part(new THREE.PlaneGeometry(0.21, 0.2), PAPER_BACK, {
    at: [0, 0.338, -0.058],
    rotation: [0, 180, 0],
    bone: carriage,
    name: "paperBack",
  });

  // Keyboard: cream keycaps standing on the deck, black shift keys at the ends of the bottom row,
  // and a cream spacebar along the front lip.
  const keyCap = new THREE.CylinderGeometry(0.0095, 0.0108, 0.012, 12);
  const keyAt = (d: number, x: number) => deckAt(d, x).addScaledVector(NORMAL, 0.008);
  for (const row of ROWS)
    for (let i = 0; i < row.keys.length; i++)
      b.part(keyCap, CREAM, {
        at: keyAt(row.d, row.x0 + i * PITCH),
        dir: NORMAL,
        bone: body,
        group: "keys",
      });
  for (const x of [ROWS[3].x0 - PITCH, ROWS[3].x0 + 7 * PITCH])
    b.part(keyCap, BLACK, { at: keyAt(0.055, x), dir: NORMAL, bone: body, group: "keys" });
  b.capsule(
    deckAt(0.022, -0.1).addScaledVector(NORMAL, 0.012),
    deckAt(0.022, 0.1).addScaledVector(NORMAL, 0.012),
    0.011,
    { color: CREAM, bone: spaceBar, name: "spaceBar" },
  );

  // Letters printed on the keycaps: one transparent card floating just above the key tops, with every letter
  // placed at its key (x in mm from the left edge, y in mm from the back edge of the deck).
  const letterMarks = ROWS.flatMap(({ d, keys, x0 }) =>
    [...keys].map((ch, i) => {
      const x = ((x0 + i * PITCH + 0.16) * 1000).toFixed(2);
      const y = ((DECK_LEN - d) * 1000).toFixed(2);
      return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="${INK}">${ch}</text>`;
    }),
  );
  const keyLetters = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 ${(DECK_LEN * 1000).toFixed(2)}">${letterMarks.join("")}</svg>`,
    { size: 1024 },
  );
  b.part(new THREE.PlaneGeometry(0.32, DECK_LEN), "#ffffff", {
    at: deckAt(DECK_LEN / 2, 0).addScaledVector(NORMAL, 0.0146),
    quat: frameQuat(new THREE.Vector3(1, 0, 0), BACK, NORMAL),
    texture: keyLetters,
    bone: body,
    name: "keyLetters",
  });

  // Chrome trim along the front lip.
  b.capsule([-0.2, 0.09, 0.19], [0.2, 0.09, 0.19], 0.004, { color: CHROME, bone: body, name: "frontTrim" });

  // A badge on the machine's left side, reading correctly from that side.
  const badge = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 60">` +
      `<rect width="180" height="60" rx="8" fill="#f3ead6"/>` +
      `<rect x="5" y="5" width="170" height="50" rx="5" fill="none" stroke="#8e2a22" stroke-width="2.5"/>` +
      `<text x="90" y="40" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="24" font-weight="700" letter-spacing="2" fill="#8e2a22">TILDA 40</text>` +
      `</svg>`,
    { size: 512 },
  );
  b.part(new THREE.PlaneGeometry(0.072, 0.024), "#ffffff", {
    at: [0.2012, 0.086, 0.08],
    quat: frameQuat(new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0)),
    texture: badge,
    bone: body,
    name: "badge",
  });

  return b.root;
}
