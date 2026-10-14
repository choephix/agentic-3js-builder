import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";

export const meta = {
  name: "typewriter",
  description: "A green desktop typewriter with a chrome carriage, black platen, a sheet of typed paper and a lettered keyboard.",
};

const BODY = "#2d6a4f";
const BLACK = "#1b1b1d";
const CHROME = "#c4c9ce";
const KEY = "#f3ead2";
const PAPER = "#f7f1e1";
const RED = "#c0392b";
const BRASS = "#c9a24a";

// Key layout: rows from the back of the machine to the front.
const PITCH = 0.027;
const ROWS = [
  { z: -0.075, keys: "1234567890".split("") },
  { z: -0.045, keys: "QWERTYUIOP".split("") },
  { z: -0.015, keys: "ASDFGHJKL".split("") },
  { z: 0.015, keys: "ZXCVBNM".split("") },
];
const SPACE_Z = 0.045;

// Keyboard decal frame: centred on the deck, 320 x 150 mm.
const LAYOUT_W = 0.32;
const LAYOUT_H = 0.15;
const LAYOUT_CZ = -0.0175;
// Deck normal (the slope runs from (z,y) = (0.2,0.12) to (-0.18,0.2)).
const DECK_NORMAL: [number, number, number] = [0, 0.9786, 0.2058];

export default function build() {
  const b = createBuilder({ name: "typewriter" });
  const root = b.joint("body", { at: [0, 0, 0] });

  // Main shell: the side profile is drawn as [z, y] and extruded 36 cm across X.
  const shell = b.extrude(
    [
      [-0.21, 0.03],
      [0.23, 0.03],
      [0.23, 0.1],
      [0.2, 0.12],
      [-0.18, 0.2],
      [-0.21, 0.2],
    ],
    { at: [0, 0, 0], thickness: 0.36, bevel: 0.01, color: BODY },
  );

  // Black base plate sitting on the floor.
  b.part(new THREE.BoxGeometry(0.44, 0.03, 0.48), BLACK, { at: [0, 0.015, 0.01], bone: root });

  // Chrome pinstripe along the front wall.
  b.part(new THREE.BoxGeometry(0.37, 0.012, 0.012), CHROME, { at: [0, 0.075, 0.233], bone: root });

  // Carriage rails: two posts, a chrome carriage bar and a black platen.
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.012, 0.014, 0.13, 8), CHROME, {
      at: [s * 0.16, 0.26, -0.2],
      bone: root,
    });
  }
  b.part(new THREE.BoxGeometry(0.44, 0.02, 0.04), CHROME, { at: [0, 0.33, -0.2], bone: root });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.42, 18), BLACK, {
    at: [0, 0.3, -0.2],
    rotation: [0, 0, 90],
    bone: root,
  });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 12), s > 0 ? CHROME : RED, {
      at: [s * 0.235, 0.3, -0.2],
      rotation: [0, 0, 90],
      bone: root,
    });
  }

  // Paper wrapped around the platen, with typed lines drawn on it.
  const paperTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 260">
      <rect width="200" height="260" fill="${PAPER}"/>
      <line x1="28" y1="0" x2="28" y2="260" stroke="${RED}" stroke-width="0.8"/>
      <g font-family="monospace" font-size="9" fill="#2a2a2a">
        <text x="34" y="34">Dear Ada,</text>
        <text x="34" y="54">The new machine arrived</text>
        <text x="34" y="66">this morning. The keys are</text>
        <text x="34" y="78">stiff but the ink is bold and</text>
        <text x="34" y="90">the carriage returns with a</text>
        <text x="34" y="102">satisfying ring.</text>
        <text x="34" y="132">I will type you a letter</text>
        <text x="34" y="144">every Sunday until the</text>
        <text x="34" y="156">ribbon runs out.</text>
        <text x="34" y="200">Yours,</text>
        <text x="34" y="220">M.</text>
      </g>
    </svg>`,
    { size: 512 },
  );
  b.part(new THREE.PlaneGeometry(0.2, 0.26), "#ffffff", {
    at: [0, 0.44, -0.166],
    dir: [0, 0, 1],
    axis: "z",
    texture: paperTex,
    bone: root,
  });

  // Brass brand plate on the front wall.
  const brandTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 30">
      <rect width="120" height="30" rx="3" fill="${BRASS}"/>
      <text x="60" y="21" text-anchor="middle" font-family="serif" font-size="17" letter-spacing="3" fill="${BLACK}">OLYMPIA</text>
    </svg>`,
    { size: 512 },
  );
  b.decal(shell, brandTex, { at: [0, 0.066, 0.25], dir: [0, 0, 1], size: [0.12, 0.03] });

  // Keys: each one is seated on the deck by a downward ray.
  const deck = b.surface(shell);
  const keyGeo = new THREE.BoxGeometry(0.022, 0.014, 0.022);
  const spaceGeo = new THREE.BoxGeometry(0.13, 0.012, 0.03);
  const keys = [] as ReturnType<typeof keyOn>[];
  const letters: { x: number; z: number; label: string }[] = [];

  function keyOn(x: number, z: number, geo: THREE.BufferGeometry) {
    const hit = deck.ray([x, 1, z], [0, -1, 0]);
    if (!hit) throw new Error(`no deck under the key at x=${x}, z=${z}`);
    return b.stick(geo, KEY, hit);
  }

  for (const row of ROWS) {
    const n = row.keys.length;
    row.keys.forEach((label, i) => {
      const x = (i - (n - 1) / 2) * PITCH;
      keys.push(keyOn(x, row.z, keyGeo));
      letters.push({ x, z: row.z, label });
    });
  }
  keys.push(keyOn(0, SPACE_Z, spaceGeo));

  // Lettering over the keys, one decal on the keyboard plane.
  const letterSvg = letters
    .map(({ x, z, label }) => {
      const px = (x + LAYOUT_W / 2) * 1000;
      const py = (z - (LAYOUT_CZ - LAYOUT_H / 2)) * 1000 + 4;
      return `<text x="${px.toFixed(1)}" y="${py.toFixed(1)}" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="${BLACK}">${label}</text>`;
    })
    .join("");
  const keyTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 150">${letterSvg}</svg>`,
    { size: 1024 },
  );
  b.decal(keys, keyTex, {
    at: [0, 0.2, LAYOUT_CZ],
    dir: DECK_NORMAL,
    size: [LAYOUT_W, LAYOUT_H],
    segments: 24,
  });

  // Side knobs and the carriage-return lever, all seated on the side walls.
  const feedHit = deck.ray([0.6, 0.08, 0.05], [-1, 0, 0]);
  if (feedHit) b.stick(new THREE.CylinderGeometry(0.02, 0.024, 0.03, 14), CHROME, feedHit);

  const leverHit = deck.ray([-0.6, 0.12, -0.12], [1, 0, 0]);
  if (leverHit) b.stick(new THREE.BoxGeometry(0.02, 0.05, 0.03), RED, leverHit);

  // Keep the shell in the scene graph as the body of the machine.
  void shell;

  return b.root;
}
