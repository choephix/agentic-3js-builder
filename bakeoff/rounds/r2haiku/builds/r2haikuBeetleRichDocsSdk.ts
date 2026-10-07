import * as THREE from "three";
import { createBuilder, rng, limb, paint, grain, noise, svg, catmull, polyline } from "../../../../src/index";

export const meta = {
  name: "Stag beetle on a mossy log",
  description: "A proud chestnut-winged stag beetle with branched jaws, elbowed antennae and spiny legs, gripping a moss-covered log with a dewdrop on one antler.",
};

const CHESTNUT = "#8c4219";
const CHESTNUT_DARK = "#5a2610";
const CHESTNUT_SHINE = "#b8643a";
const BLACK = "#16120f";
const JAW = "#7a3a20";
const LEG = "#1d1915";
const ANT = "#2a2420";
const FEATHER = "#8d6b3c";
const EYE = "#5b4632";
const DEW = "#c4ecff";
const BARK = "#6e4c2d";
const BARK_DARK = "#432e1a";
const MOSS = "#5f9034";

// Elytra: chestnut grain with a bright band across the top that reads as a glossy sheen.
const elytra = grain(CHESTNUT, CHESTNUT_DARK, { size: 0.012, axis: "z", seed: 3 });
const body = paint((_p, _n, s) => {
  if (s[0] > 0.6) return BLACK; // black pronotum and head end
  const a = ((((s[1] % 360) + 540) % 360) - 180); // clock angle, 0 = world up
  return Math.abs(a) < 22 ? CHESTNUT_SHINE : elytra;
});

// Log: bark streaks with moss on the upward faces.
const logPaint = paint((p, n) => {
  if (n.y > 0.25 && noise(p, 0.045, 4) > 0.45) return MOSS;
  return noise(p, 0.02, 9) > 0.6 ? BARK_DARK : grain(BARK, BARK_DARK, { size: 0.02, axis: "z", seed: 5 });
});

// Body profile along the spine: fullest over the elytra, narrowing into the neck.
const prof = (t: number) => 0.45 + 0.55 * Math.sin(Math.PI * Math.min(1, Math.max(0, t * 0.9 + 0.1)));

export default function build() {
  const b = createBuilder({ name: "stagBeetleOnLog" });

  // ---- Log (scenery, lying on y = 0; axis at height r so its flat bottom touches the floor)
  const logPath = polyline([
    [0, 0.06, -0.24],
    [0, 0.06, 0.24],
  ]);
  const log = b.sweep(logPath, 0.06, { color: logPaint, caps: "flat" });

  const mossTuft = svg(
    `<svg viewBox="0 0 32 32"><path d="M16 32 Q9 18 3 9 Q13 15 16 3 Q19 15 29 9 Q23 18 16 32Z" fill="#6aa23c"/><path d="M16 32 Q14 20 12 14 Q16 20 16 32Z" fill="#3f6e24"/></svg>`,
    { size: 128 },
  );
  const mossHits = b.surface(log).scatter(90, {
    rng: rng(5),
    minDist: 0.025,
    filter: (h) => h.n.y > 0.25 && Math.abs(h.at.z) > 0.09,
  });
  b.cards(mossHits, mossTuft, { size: [0.03, 0.035], lean: 25, vary: 0.3, rng: rng(6) });

  // ---- Spine: hips, thorax, neck (root is the first joint)
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.16, -0.075],
      [0, 0.168, -0.025],
      [0, 0.17, 0.015],
      [0, 0.16, 0.045],
    ]),
    { names: ["hips", "thorax", "neck"], role: "spine" },
  );
  b.sweep(spine, (t: number): [number, number] => [0.034 * prof(t), 0.03 * prof(t)], { color: body });

  // ---- Head
  const head = b.joint("head", {
    parent: spine.joints[2],
    at: [0, 0.158, 0.052],
    aim: [0, 0.146, 0.14],
    role: "head",
  });
  b.capsule(head.local([0, -0.01, 0]), head.local([0, 0.022, 0]), 0.017, { color: BLACK, bone: head });

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0085, 6, 4), EYE, {
      bone: head,
      at: head.local([s * 0.0165, 0.012, 0.004]),
    });
  }

  // ---- Branched jaws (antler-like mandibles), each with inward teeth
  let rightTube: ReturnType<typeof b.sweep> | null = null;
  for (const s of [1, -1]) {
    const side = s > 0 ? "R" : "L";
    const mand = b.chain(
      `mandible${side}`,
      [
        head.local([s * 0.009, -0.004, -0.004]),
        head.local([s * 0.016, 0.03, 0.002]),
        head.local([s * 0.02, 0.07, 0.0]),
        head.local([s * 0.006, 0.1, 0.012]),
      ],
      { parent: head, names: [`mand${side}1`, `mand${side}2`, `mand${side}3`], role: "jaw" },
    );
    const tube = b.sweep(mand, [0.0075, 0.0035], { color: JAW });
    if (s > 0) rightTube = tube;

    b.spike(mand.at(0.35), head.dir([-s * 0.7, 0.3, 0.45]), 0.02, 0.0045, { color: JAW });
    b.spike(mand.at(0.7), head.dir([-s * 0.6, 0.2, 0.7]), 0.014, 0.0035, { color: JAW });
  }

  // Dewdrop clinging to the outer top of the right antler.
  if (rightTube) {
    const rightMand = rightTube;
    const dewHit = b.surface(rightMand).nearest(rightMand.at(0.6).at);
    b.stick(new THREE.SphereGeometry(0.0055, 8, 6), DEW, dewHit);
  }

  // ---- Elbowed antennae with feathery lamellae at the tips
  for (const s of [1, -1]) {
    const side = s > 0 ? "R" : "L";
    const ant = b.chain(
      `antenna${side}`,
      [
        head.local([s * 0.007, 0.024, 0.012]),
        head.local([s * 0.02, 0.04, 0.02]),
        head.local([s * 0.03, 0.055, 0.0]),
        head.local([s * 0.024, 0.078, -0.01]),
      ],
      { parent: head, names: [`ant${side}1`, `ant${side}2`, `ant${side}3`] },
    );
    b.sweep(ant, [0.0028, 0.0014], { color: ANT });
    b.ring(ant.at(1), { count: 8, radius: 0.0045, tilt: 35 }, (lam) =>
      b.spike(lam, lam, 0.011, 0.0022, { color: FEATHER }),
    );
    b.spike(ant.at(1), ant.at(1), 0.008, 0.0016, { color: FEATHER });
  }

  // ---- Six spiny legs gripping the log's flanks
  const legRows = [
    { z: 0.03, theta: 40, parent: spine.joints[1], tag: "F" },
    { z: 0.0, theta: 60, parent: spine.joints[1], tag: "M" },
    { z: -0.03, theta: 80, parent: spine.joints[0], tag: "H" },
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "R" : "L";
    for (const row of legRows) {
      const th = (row.theta * Math.PI) / 180;
      const r = 0.064; // slightly outside the log so the claws sit on the bark
      const foot: [number, number, number] = [s * r * Math.sin(th), 0.06 + r * Math.cos(th), row.z];
      const root: [number, number, number] = [s * 0.026, 0.15, row.z];
      const pts = limb(root, foot, [0.04, 0.04, 0.03], [
        [s, 0.4, 0],
        [s, 0.4, 0],
      ]);
      const leg = b.chain(`leg${side}${row.tag}`, pts, {
        parent: row.parent,
        names: [`hip${side}${row.tag}`, `knee${side}${row.tag}`, `ankle${side}${row.tag}`, `foot${side}${row.tag}`],
        role: "leg",
      });
      b.sweep(leg, (t: number) => 0.0072 - 0.003 * t, { color: LEG });
      b.spike(leg.at(0.4), [s * 0.6, 0.2, -0.5], 0.012, 0.0028, { color: LEG });
      b.spike(leg.at(0.72), [s * 0.5, 0.3, -0.6], 0.009, 0.0024, { color: LEG });
      b.spike(leg.at(1), [-s * 0.3, -0.7, 0], 0.01, 0.0028, { color: LEG });
    }
  }

  return b.root;
}
