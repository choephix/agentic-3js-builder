import * as THREE from "three";
import { createBuilder, catmull, mottle, paint, rng } from "../../../../src/index";

export const meta = {
  name: "garden snail",
  description: "A garden snail with a caramel, chocolate and cream spiral shell, grey-green pebbly body, eye stalks and a ladybird riding the shell.",
};

const BODY_L = "#9fae97";
const BODY_D = "#6a7866";
const CARAMEL = "#c7863a";
const CHOCO = "#4e2c1e";
const CREAM = "#f2e3c2";
const DARK = "#2f2a24";
const BLACK = "#15110f";
const RED = "#d4291d";
const WHITE = "#fbfbf4";

const SHELL_AT: [number, number, number] = [0, 0.02, -0.01];

export default function build() {
  const b = createBuilder({ name: "garden-snail" });

  // Soft body: a mottled, slightly glossy grey-green skin.
  const bodyPaint = mottle(BODY_D, BODY_L, { size: 0.012, contrast: 0.6 });

  // Skeleton: root at mid-body, a body chain running tail to head.
  const hips = b.joint("hips", { at: [0, 0.011, -0.01] });
  const bodyPts: number[][] = [
    [0, 0.006, -0.095],
    [0, 0.009, -0.05],
    [0, 0.011, -0.01],
    [0, 0.013, 0.035],
    [0, 0.015, 0.08],
  ];
  const body = b.chain("body", catmull(bodyPts), {
    parent: hips,
    names: ["tail", "rear", "mid", "neck", "head"],
    role: "spine",
  });
  const mid = body.joints[2];
  const head = body.joints[body.joints.length - 1];

  // Soft foot-and-body skin: a loft over the spine, flat-bottomed.
  const bodyLoft = b.loft(
    [
      { at: [0, 0.006, -0.095], w: 0.012, h: 0.012 },
      { at: [0, 0.009, -0.05], w: 0.026, h: 0.02 },
      { at: [0, 0.011, -0.01], w: 0.034, h: 0.024 },
      { at: [0, 0.013, 0.035], w: 0.032, h: 0.026 },
      { at: [0, 0.015, 0.08], w: 0.028, h: 0.028 },
    ],
    { bone: body, color: bodyPaint },
  );

  // Pebbly texture: small darker bumps scattered over the flanks and foot.
  const bodySurf = b.surface(bodyLoft);
  const pebbles = bodySurf.scatter(60, {
    rng: rng(5),
    minDist: 0.011,
    filter: (h) => h.n.y < 0.6 && h.at.y < 0.03,
  });
  for (const h of pebbles) {
    b.stick(new THREE.SphereGeometry(0.0022, 5, 4), BODY_D, h, { embed: 0.5 });
  }

  // Eye stalks and feelers, one pair per side.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    const stalk = b.chain(
      `stalk${side}`,
      catmull([
        [s * 0.011, 0.022, 0.082],
        [s * 0.015, 0.05, 0.09],
        [s * 0.019, 0.082, 0.1],
      ]),
      { parent: head, names: [`stalk${side}1`, `stalk${side}2`, `eye${side}`], role: "tentacle" },
    );
    b.sweep(stalk, [0.0045, 0.0032], { color: bodyPaint });

    const eye = stalk.joints[stalk.joints.length - 1];
    b.part(new THREE.SphereGeometry(0.0045, 8, 6), BLACK, { bone: eye, at: eye.at });
    b.part(new THREE.SphereGeometry(0.0013, 5, 4), WHITE, {
      bone: eye,
      at: eye.local({ up: 0.0025, forward: 0.002 }),
    });

    const feeler = b.chain(
      `feeler${side}`,
      catmull([
        [s * 0.008, 0.024, 0.088],
        [s * 0.013, 0.038, 0.104],
        [s * 0.014, 0.046, 0.112],
      ]),
      { parent: head, names: [`feeler${side}1`, `feeler${side}2`], role: "tentacle" },
    );
    b.sweep(feeler, [0.0026, 0.0015], { color: BODY_L });
  }

  // Mouth: a separate lower jaw so it can open.
  const jaw = b.joint("jaw", { parent: head, at: head.local({ forward: 0.02, down: 0.004 }) });
  b.part(new THREE.BoxGeometry(0.02, 0.005, 0.01), DARK, { bone: jaw, at: jaw.at });

  // Spiral shell: a turned dome painted with spiralling caramel, chocolate and cream bands.
  const shellPaint = paint((p) => {
    const x = p.x;
    const z = p.z + 0.01;
    const ang = Math.atan2(x, z);
    const rad = Math.hypot(x, z);
    const ph = (ang / (2 * Math.PI)) * 3 + rad * 70;
    const f = ph - Math.floor(ph);
    if (rad < 0.004) return CREAM;
    return f < 0.34 ? CARAMEL : f < 0.5 ? CHOCO : CREAM;
  });
  b.lathe(
    [
      [0, 0],
      [0.024, 0],
      [0.025, 0.006],
      [0.022, 0.018],
      [0.016, 0.028],
      [0.008, 0.034],
      [0, 0.036],
    ],
    { at: SHELL_AT, bone: mid, smoothing: 1, color: shellPaint },
  );
  const shell = b.surface(b.root); // only used for the ladybird hit below

  // Ladybird hitching a ride on the top of the shell.
  const top = b.surface(shell).nearest([0.006, 0.07, -0.006]);
  const lb = b.stick(new THREE.SphereGeometry(0.0062, 12, 8), RED, top, { embed: 0.45 });
  const lbSurf = b.surface(lb);
  const lbC = top.at;
  const spotOffsets: [number, number][] = [
    [0.0035, 0.0015],
    [-0.0035, 0.0015],
    [0.0, -0.0035],
    [0.0022, -0.0025],
    [-0.0022, -0.0025],
  ];
  for (const [dx, dz] of spotOffsets) {
    const sp = lbSurf.nearest([lbC.x + dx, lbC.y + 0.012, lbC.z + dz]);
    b.stick(new THREE.SphereGeometry(0.0016, 5, 4), BLACK, sp, { embed: 0.4 });
  }
  const headHit = lbSurf.nearest([lbC.x, lbC.y + 0.012, lbC.z - 0.005]);
  b.stick(new THREE.SphereGeometry(0.0022, 6, 4), BLACK, headHit, { embed: 0.3 });

  return b.root;
}
