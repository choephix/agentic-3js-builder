import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { lerp, rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { paint, stripes } from "../src/paint";
import { svg } from "../src/texture";
import { animeEye, cel, INK, zigzag } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Scarlet macaw, wings open",
  description:
    "A scarlet macaw standing with its wings spread wide in a shallow V, cel-shaded in a Genshin-style palette: gold filigree collar, headband and tassels, a crystal pendant, and an elemental glow ring on the floor.",
  style: "Genshin Impact",
  commit: "b816db2",
};

type V3 = [number, number, number];

const P = (v: THREE.Vector3): V3 => [v.x, v.y, v.z];
const UP = new THREE.Vector3(0, 1, 0);
const X1 = new THREE.Vector3(1, 0, 0);
const FWD = new THREE.Vector3(0, 0, 1);

// Palette: bright cel-shaded colours (kits/toon), one flat glow colour (kits/glow).
const RED = cel("#e8352b");
const RED_DEEP = cel("#c21f2e");
const BELLY = cel("#ff7a2e");
const YELLOW = cel("#ffd23f");
const BLUE = cel("#2a7de8");
const BLUE_DEEP = cel("#1d4fc2");
const TEAL = cel("#2fd9d2");
const WHITE = cel("#fbf5e6", "#e4d2bb");
const FACE_LINE = cel("#c7b59e");
const HORN = cel("#f3e4bc", "#c9a877");
const BEAK_LOW = cel("#4a4358");
const FOOT = cel("#6d7388");
const GOLD = cel("#ffd15a", "#c9832a");
const CLAW = "#2b2736";
const GEM = "#7af4ff";

// Feather cards: a grey-barbed vane, tinted by the card colour.
const barbs: string[] = [];
for (let y = 12; y <= 58; y += 4) {
  barbs.push(`<path d="M16 ${y} L7 ${y + 6} M16 ${y} L25 ${y + 6}" stroke="#9c9c9c" stroke-width="0.9" fill="none"/>`);
}
const CONTOUR = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
<path d="M16 1 C27 14 29 40 16 63 C3 40 5 14 16 1Z" fill="#ffffff"/>
<path d="M16 4 L16 60" stroke="#8c8c8c" stroke-width="1" fill="none"/>
${barbs.join("\n")}
</svg>`,
  { size: 256 },
);

// Gold filigree plate: two rings, six scrolls and a boss, drawn in gold.
const scrolls: string[] = [];
for (let i = 0; i < 6; i++) {
  const a = (i / 6) * Math.PI * 2;
  const cx = 50 + 24 * Math.cos(a);
  const cy = 50 + 24 * Math.sin(a);
  const tx = 50 + 42 * Math.cos(a);
  const ty = 50 + 42 * Math.sin(a);
  scrolls.push(
    `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="6"/>`,
    `<path d="M${cx.toFixed(2)} ${cy.toFixed(2)}L${tx.toFixed(2)} ${ty.toFixed(2)}"/>`,
    `<circle cx="${tx.toFixed(2)}" cy="${ty.toFixed(2)}" r="3"/>`,
  );
}
const FILIGREE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="none" stroke="#ffd15a" stroke-width="2.6"><circle cx="50" cy="50" r="46"/><circle cx="50" cy="50" r="36"/>${scrolls.join("")}</g><circle cx="50" cy="50" r="5" fill="#ffe79a"/></svg>`,
  { size: 512 },
);

const EYE = animeEye({
  iris: "#ffc83a",
  irisLight: "#fff3a6",
  irisDark: "#b8741c",
  ink: INK,
  blush: false,
  brow: false,
});

const HC: V3 = [0, 0.478, 0.205]; // head centre
const N: V3 = [0, 0.41, 0.16]; // neck base, top of the torso

// Paints. Wing skin and tail carry the bands of the macaw's colours; the head keeps a bare white face.
const FACE = stripes(WHITE, FACE_LINE, { size: 0.016, width: 0.12, axis: "y" });
const HEAD_PAINT = paint((p, n) => {
  const dy = p.y - HC[1];
  const dz = p.z - HC[2];
  if (n.z > 0.15 && dz > -0.01 && dy < 0.035 && dy > -0.08) return FACE;
  return dy > 0.03 ? RED : RED_DEEP;
});
const BODY = paint((_p, n) => (n.y < -0.4 ? BELLY : RED));
const WING_PAINT = paint((_p, _n, s) => {
  if (s[1] > 0.86) return BLUE_DEEP; // outer trailing edge
  const a = s[0] + 0.035 * zigzag(s[1] * 5); // wavy band edges, like covert rows
  if (a < 0.3) return RED;
  if (a < 0.58) return YELLOW;
  return BLUE;
});
const COVERT_COLOR = paint((p) => (Math.abs(p.x) < 0.17 ? "#e8352b" : Math.abs(p.x) < 0.3 ? "#ffd23f" : "#2a7de8"));
const BODY_CARD = paint((_p, n) => (n.y < -0.3 ? "#ff8a3d" : "#e8352b"));

// A flight or tail feather: a pointed, slightly bowed vane in its own outline space (x across, y along).
function feather(L: number, w: number): OutlinePoint[] {
  return [
    [-w * 0.55, 0],
    [w * 0.55, 0],
    [w, L * 0.3],
    [w * 0.92, L * 0.7],
    [w * 0.35, L * 0.95],
    [0, L, "sharp"],
    [-w * 0.35, L * 0.95],
    [-w * 0.92, L * 0.7],
    [-w, L * 0.3],
  ];
}

// A closed loop of n points on the ellipse through c spanned by the offsets u and v.
function loop(c: V3, u: V3, v: V3, n: number): V3[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const cs = Math.cos(a);
    const sn = Math.sin(a);
    return [0, 1, 2].map((k) => c[k] + u[k] * cs + v[k] * sn) as V3;
  });
}

export default function build() {
  const b = createBuilder({ name: "scarletMacaw" });
  const R = rng(11);

  // Skeleton: hips, spine, neck, head with a separate jaw; tail and legs from the hips; wings from the chest.
  const hips = b.joint("hips", { at: [0, 0.215, -0.09], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.215, -0.09],
      [0, 0.24, 0.0],
      [0, 0.3, 0.07],
      [0, 0.36, 0.12],
      N,
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "spine4"], role: "spine" },
  );
  const neck = b.joint("neck", { parent: spine.joints[3], at: N, aim: HC, role: "neck" });
  const head = b.joint("head", { parent: neck, at: HC, aim: [0, 0.44, 0.6], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.466, 0.25], aim: [0, 0.43, 0.36], role: "jaw" });

  // Torso: a plump, slightly forward-leaning body. Belly reads orange, back and breast scarlet.
  const torso = b.sweep(spine, [0.03, 0.062, 0.075, 0.07, 0.05], { color: BODY });
  const torsoSurf = b.surface(torso);

  // Tail: a long core tube and five fanned rectrices in red, blue and teal, with a gold ferrule and a tassel.
  const TB: V3 = [0, 0.19, -0.11];
  const TT: V3 = [0, 0.06, -0.37];
  const tail = b.chain("tail", catmull([TB, [0, 0.16, -0.2], [0, 0.115, -0.29], TT]), {
    parent: hips,
    names: ["tail1", "tail2", "tail3"],
    role: "tail",
  });
  b.sweep(tail, [0.03, 0.02, 0.012], { color: RED });
  const tdv = new THREE.Vector3(0, TT[1] - TB[1], TT[2] - TB[2]).normalize();
  const tailFeathers: Array<[number, number, number]> = [
    [-0.024, -0.09, 0.31],
    [-0.012, -0.045, 0.345],
    [0, 0, 0.36],
    [0.012, 0.045, 0.345],
    [0.024, 0.09, 0.31],
  ];
  for (const [lat, yaw, L] of tailFeathers) {
    const y = tdv.clone().addScaledVector(X1, yaw).normalize();
    const x = y.clone().cross(X1).normalize();
    b.extrude(feather(L, 0.03), {
      at: [lat, TB[1], TB[2] - 0.012],
      x: P(x),
      y: P(y),
      thickness: 0.005,
      bevel: 0.002,
      smoothing: 1,
      color: paint((_p, _n, s) => {
        const u = s[1] / L;
        return u > 0.86 ? TEAL : u > 0.72 ? BLUE : RED;
      }),
      bone: tail.joints[0],
    });
  }
  const ferrule = tdv.clone().multiplyScalar(0.16).add(new THREE.Vector3(...TB));
  const xa = tdv.clone().cross(X1).normalize(); // vertical across the tail fan
  b.sweep(catmull(loop(P(ferrule), [0.032, 0, 0], P(xa.clone().multiplyScalar(0.045)), 12), { closed: true }), 0.0055, {
    color: GOLD,
    bone: tail.joints[0],
  });
  const tasselTop = ferrule.clone().addScaledVector(xa, 0.045);
  const tasselMid = tasselTop.clone().add(new THREE.Vector3(0, -0.02, 0.003));
  const tasselEnd = tasselTop.clone().add(new THREE.Vector3(0, -0.04, 0.006));
  b.sweep(catmull([P(tasselTop), P(tasselMid), P(tasselEnd)]), [0.005, 0.003], { color: GOLD, bone: tail.joints[0] });
  glow(b.part(new THREE.OctahedronGeometry(0.014), GEM, { bone: tail.joints[0], at: P(tasselEnd) }));

  // Head: a big round skull, a bare white face and a red crown. Bright anime eyes sit on the face.
  const headPart = b.part(new THREE.SphereGeometry(1, 18, 12), HEAD_PAINT, {
    bone: head,
    at: HC,
    scale: [0.088, 0.092, 0.098],
  });
  const headSurf = b.surface(headPart);
  for (const s of [1, -1]) {
    const hit = headSurf.around(HC).at(s * 40, 6)!;
    b.decal(headSurf, EYE, { at: hit, size: [0.05, 0.066], mirror: s > 0 });
  }

  // Beak: a deep hooked upper mandible and a separate lower mandible that rides the jaw joint.
  b.sweep(
    bezier([0, 0.512, 0.262], [0, 0.53, 0.302], [0, 0.515, 0.338], [0, 0.45, 0.33]),
    (t) => [0.03 * (1 - t) + 0.007, 0.042 * (1 - t) + 0.006],
    { bone: head, color: HORN, caps: { start: "round", end: "point" } },
  );
  b.sweep(
    bezier([0, 0.468, 0.25], [0, 0.462, 0.3], [0, 0.45, 0.322], [0, 0.44, 0.31]),
    (t) => [0.024 * (1 - t) + 0.006, 0.018 * (1 - t) + 0.005],
    { bone: jaw, color: BEAK_LOW, caps: { start: "round", end: "point" } },
  );

  // Gold filigree headband with a glowing gem at the brow, and two hanging tassels.
  const band = loop([0, 0.522, 0.205], [0.084, 0, 0], [0, 0, 0.096], 16);
  b.sweep(catmull(band, { closed: true }), 0.0075, { color: GOLD, bone: head });
  glow(b.part(new THREE.OctahedronGeometry(0.012), GEM, { bone: head, at: [0, 0.524, 0.304] }));
  for (const s of [1, -1]) {
    const top: V3 = [s * 0.086, 0.52, 0.205];
    b.sweep(catmull([top, [s * 0.092, 0.49, 0.18], [s * 0.096, 0.455, 0.17]]), [0.005, 0.003], {
      color: GOLD,
      bone: head,
    });
    b.part(new THREE.SphereGeometry(0.007, 8, 6), GOLD, { bone: head, at: [s * 0.096, 0.45, 0.17] });
  }

  // Crown feathers: small red cards lying back over the skull.
  const crown = headSurf.scatter(36, { rng: R, minDist: 0.025, filter: (h) => h.n.y > 0.45 });
  b.cards(crown, CONTOUR, {
    size: [0.028, 0.05],
    lean: 70,
    flow: [0, 0.1, -1],
    rng: R,
    color: "#e8352b",
    sink: 0.15,
  });

  // Gold collar around the neck, with beads and a short chain to a glowing crystal pendant.
  const collarPts = loop([0, 0.398, 0.148], [0.06, 0, 0], [0, -0.037, 0.047], 16);
  b.sweep(catmull(collarPts, { closed: true }), 0.0085, { color: GOLD, bone: spine.joints[3] });
  b.along(catmull(collarPts, { closed: true }), 10, (at) =>
    b.stick(new THREE.SphereGeometry(0.0065, 6, 4), GOLD, at, { embed: 0.3 }),
  );
  b.sweep(catmull([[0, 0.36, 0.196], [0, 0.335, 0.2], [0, 0.318, 0.198]]), [0.003, 0.0025], {
    color: GOLD,
    bone: spine.joints[3],
  });
  const chest = torsoSurf.nearest([0, 0.342, 0.2]);
  b.decal(torsoSurf, FILIGREE, { at: chest, size: [0.085, 0.09] });
  const gemHit = torsoSurf.nearest([0, 0.292, 0.19]);
  glow(b.stick(new THREE.OctahedronGeometry(0.024), GEM, gemHit, { embed: 0.3 }));

  // Contour feathers over the body: small cards lying back toward the tail.
  const bodyHits = torsoSurf.scatter(240, { rng: R, minDist: 0.021, filter: (h) => h.n.y > -0.7 });
  b.cards(bodyHits, CONTOUR, {
    size: [0.034, 0.072],
    lean: 40,
    flow: [0, -0.4, -1],
    bend: 18,
    vary: 0.25,
    rng: R,
    color: BODY_CARD,
    sink: 0.15,
  });

  // Legs: red thigh feathers over bare grey tarsi, four toes each, with dark claws.
  for (const s of [1, -1]) {
    const nm = s > 0 ? "L" : "R";
    const F = (x: number, y: number, z: number): V3 => [s * x, y, z];
    const leg = b.chain(
      "leg" + nm,
      catmull([F(0.06, 0.215, -0.02), F(0.065, 0.13, 0.0), F(0.05, 0.045, 0.03), F(0.05, 0.012, 0.09)]),
      { parent: hips, names: ["hip" + nm, "knee" + nm, "ankle" + nm, "foot" + nm], role: "leg" },
    );
    b.sweep(leg, [0.036, 0.03, 0.02, 0.015], { color: FOOT, bands: [[0.42, RED], [1, FOOT]] });
    const foot = F(0.05, 0.012, 0.09);
    const ankle = F(0.05, 0.02, 0.03);
    const toes: V3[] = [F(0.078, 0.008, 0.15), F(0.03, 0.008, 0.156), F(0.07, 0.008, -0.03), F(0.035, 0.008, -0.025)];
    for (const [i, tip] of toes.entries()) {
      const front = i < 2;
      b.rod(front ? foot : ankle, tip, [0.009, 0.006], { color: FOOT });
      b.spike(tip, front ? [0, -0.25, 1] : [0, -0.25, -1], 0.022, 0.005, { color: CLAW });
    }
  }

  // Wings, open: raised in a shallow V from the shoulders. Each wing is laid out flat, then turned about its
  // shoulder so the leading edge rises outward. A shoulder-elbow-wrist-hand chain carries a gold leading edge,
  // a wing skin banded red, yellow and blue, primaries, secondaries, covert cards and wrist tassels.
  const LIFT = THREE.MathUtils.degToRad(26);
  for (const s of [1, -1]) {
    const nm = s > 0 ? "L" : "R";
    const ph = s * LIFT;
    const SH = new THREE.Vector3(s * 0.05, 0.37, 0.06);
    const W = (x: number, y: number, z: number): V3 =>
      P(new THREE.Vector3(s * x, y, z).sub(SH).applyAxisAngle(FWD, ph).add(SH));
    const normal = UP.clone().applyAxisAngle(FWD, ph); // the wing's upper face
    const wing = b.chain(
      "wing" + nm,
      catmull([W(0.05, 0.37, 0.06), W(0.16, 0.39, 0.07), W(0.28, 0.42, 0.03), W(0.36, 0.44, -0.04)]),
      { parent: spine.joints[3], names: ["shoulder" + nm, "elbow" + nm, "wrist" + nm, "hand" + nm], role: "wing" },
    );
    const hand = wing.tip!;
    b.sweep(wing, [0.016, 0.006], { color: GOLD });
    const trailing: V3[] = [W(0.06, 0.34, -0.12), W(0.17, 0.37, -0.05), W(0.29, 0.4, -0.05), W(0.38, 0.43, -0.13)];
    const membrane = b.membrane(wing, trailing, { color: WING_PAINT, thickness: 0.008, rows: 8 });
    const skin = b.surface(membrane);
    b.decal(skin, FILIGREE, { at: skin.nearest(W(0.2, 0.41, -0.01)), size: [0.08, 0.08] });

    // Primaries: a fan of nine feathers along the hand, tips outward and backward.
    for (let k = 0; k < 9; k++) {
      const base = lerp(W(0.28, 0.42, 0.03), W(0.36, 0.44, -0.04), k / 8);
      const a = THREE.MathUtils.degToRad(18 - 2 * k);
      const L = 0.11 + 0.006 * k;
      const y = new THREE.Vector3(s * Math.cos(a), 0, -Math.sin(a)).normalize().applyAxisAngle(FWD, ph);
      const x = y.clone().cross(normal).normalize();
      b.extrude(feather(L, 0.026), {
        at: P(base),
        x: P(x),
        y: P(y),
        thickness: 0.006,
        bevel: 0.002,
        smoothing: 1,
        color: paint((_p, _n, s) => {
          if (Math.abs(s[0]) < 0.0022) return WHITE; // shaft
          const u = s[1] / L;
          return u > 0.8 ? TEAL : u > 0.5 ? BLUE : BLUE_DEEP;
        }),
        bone: hand,
      });
    }

    // Secondaries: eight feathers along the forearm, trailing back over the wing skin.
    for (let j = 0; j < 8; j++) {
      const base = lerp(W(0.16, 0.39, 0.07), W(0.28, 0.42, 0.03), 0.15 + 0.85 * (j / 7));
      const L = 0.13 + 0.004 * j;
      const y = new THREE.Vector3(s * 0.14, 0, -1).normalize().applyAxisAngle(FWD, ph);
      const x = y.clone().cross(normal).normalize();
      b.extrude(feather(L, 0.03), {
        at: P(base),
        x: P(x),
        y: P(y),
        thickness: 0.005,
        bevel: 0.002,
        smoothing: 1,
        color: paint((_p, _n, s) => {
          if (Math.abs(s[0]) < 0.002) return WHITE;
          const u = s[1] / L;
          return u > 0.72 ? TEAL : u > 0.35 ? BLUE : YELLOW;
        }),
        bone: wing.joints[1],
      });
    }

    // Covert cards scattered over the upper wing skin, leaning out toward the tip.
    const covert = skin.scatter(120, { rng: R, minDist: 0.03, filter: (h) => h.n.y > 0.2 });
    b.cards(covert, CONTOUR, {
      size: [0.05, 0.08],
      lean: 62,
      flow: [s * 0.6, 0, -0.5],
      rng: R,
      vary: 0.25,
      color: COVERT_COLOR,
      sink: 0.12,
    });

    // Gold beads along the leading edge, and a wrist tassel with a glowing gem.
    b.along(wing, 3, (at) => b.stick(new THREE.SphereGeometry(0.009, 6, 4), GOLD, at, { embed: 0.3 }), {
      from: 0.2,
      to: 0.7,
    });
    const wr = W(0.28, 0.42, 0.03);
    const wrV = new THREE.Vector3(...wr);
    const hang = (k: number) => P(wrV.clone().add(new THREE.Vector3(0, -0.05 * k, 0.01 * k)));
    b.sweep(catmull([wr, hang(1), hang(2)]), [0.004, 0.003], { color: GOLD, bone: wing.joints[2] });
    glow(b.part(new THREE.OctahedronGeometry(0.012), GEM, { bone: wing.joints[2], at: hang(2.4) }));
  }

  // Elemental glow ring on the floor under the feet.
  glow(b.sweep(catmull(loop([0, 0.004, 0.02], [0.3, 0, 0], [0, 0, 0.3], 24), { closed: true }), 0.0035, { color: GEM }));
  glow(b.sweep(catmull(loop([0, 0.003, 0.02], [0.2, 0, 0], [0, 0, 0.2], 20), { closed: true }), 0.003, { color: GEM }));

  return b.root;
}
