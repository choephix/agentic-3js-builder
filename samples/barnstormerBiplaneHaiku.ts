import * as THREE from "three";
import { createBuilder, type OutlinePoint } from "../src/builder";
import { catmull } from "../src/path";
import { grain, paint } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Barnstormer Biplane",
  description:
    "A 1920s open-cockpit barnstorming biplane on fat wooden wheels: candy-striped wings and fuselage, a pilot in goggles, a passenger in a boater hat and a dog in the front seat.",
  style: "whimsical",
  commit: "b816db2",
};

// Palette: candy red, cream, sunshine yellow, navy trim, varnished wood, leather, brass.
const RED = "#d8453a";
const CREAM = "#fbf0d6";
const YELLOW = "#f6c445";
const NAVY = "#2e3f73";
const WOOD = "#c08a55";
const WOOD_DARK = "#8a5a33";
const LEATHER = "#7a4a2e";
const DARK = "#2a2320";
const INTERIOR = "#4b3424";
const TYRE = "#2b2b30";
const STEEL = "#9aa3ab";
const COPPER = "#c98a4b";
const SKIN = "#f4cba3";
const GOGGLE = "#9fe8ff";
const GLASS = "#bfeaff";
const STRAW = "#e9d28c";
const BRASS = "#e2b44e";
const DOG = "#c9864f";
const DOG_EAR = "#5a3a24";
const LIGHT_RED = "#ff5a4a";
const LIGHT_GREEN = "#5be08a";

// Fuselage paint. The two open cockpits cut into its top (pilot rear, passenger front) read as dark interior.
const bodyPaint = paint((p, n) => {
  if (p.z > 2.3) return Math.abs(p.x) > 0.3 && Math.floor(p.z * 35) % 3 === 0 ? DARK : YELLOW; // cowl louvres
  const inCockpit = Math.abs(p.x) < 0.2 && ((p.z > -0.6 && p.z < -0.05) || (p.z > 0.2 && p.z < 0.8));
  if (n.y > 0.2 && p.y > 1.3 && inCockpit) return INTERIOR;
  if (Math.abs(p.y - 1.33) < 0.022) return YELLOW; // racing pinstripe
  return p.y < 1.3 ? CREAM : RED;
});

// Half-chord edge of a wing: full chord `root` inboard of |x| = 1.2, tapering to `tip` at the tip.
const edge = (root: number, tip: number, half: number) => (x: number) => {
  const a = Math.abs(x);
  return a <= 1.2 ? root : root + ((tip - root) * (a - 1.2)) / (half - 1.2);
};

// Fabric wing: rib lines every 0.6 m across the span, a trim band along both edges, underside in its own colour.
const wingPaint = (top: string, under: string, trim: string, le: (x: number) => number, te: (x: number) => number) =>
  paint((_p, n, s) => {
    const [x, y] = s;
    if (le(x) - y < 0.12 || y - te(x) < 0.12) return trim;
    if (((x % 0.6) + 0.6) % 0.6 < 0.025) return WOOD_DARK;
    return n.y < 0 ? under : top;
  });

const stripeSpan = paint((_p, _n, s) => (Math.floor(s[0] * 5) % 2 ? CREAM : RED));
const checker = paint((_p, _n, s) => ((Math.floor(s[0] * 7) + Math.floor(s[1] * 7)) % 2 ? CREAM : RED));
const stabPaint = paint((_p, _n, s) => (s[1] < 0.08 || s[1] > 0.62 ? RED : CREAM));
const finPaint = paint((_p, _n, s) => (s[1] > 0.95 ? CREAM : s[1] < 0.08 ? NAVY : RED));
const tankPaint = paint((_p, _n, s) => (s[0] > 0.38 ? BRASS : s[0] > 0.1 && s[0] < 0.18 ? NAVY : CREAM));
const spinnerPaint = paint((_p, _n, s) => (Math.floor((s[1] + 480 * s[0]) / 60) % 2 ? CREAM : RED));
const scarfPaint = paint((_p, _n, s) => (Math.floor(s[0] * 6) % 2 ? CREAM : RED));
const woodGrain = grain(WOOD, WOOD_DARK, { size: 0.04, axis: "y" });
const propPaint = paint((_p, _n, s) => (Math.abs(s[1]) > 1.0 ? RED : woodGrain));

// Two-blade wooden prop, one long outline through the hub (x = chord, y = span).
const blade: OutlinePoint[] = [
  [0, -1.22, "sharp"],
  [0.045, -1.15],
  [0.08, -0.8],
  [0.1, -0.3],
  [0.11, -0.15],
  [0.11, 0.15],
  [0.1, 0.3],
  [0.08, 0.8],
  [0.045, 1.15],
  [0, 1.22, "sharp"],
  [-0.045, 1.15],
  [-0.08, 0.8],
  [-0.1, 0.3],
  [-0.11, 0.15],
  [-0.11, -0.15],
  [-0.1, -0.3],
  [-0.08, -0.8],
  [-0.045, -1.15],
];

const roundel = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="31" fill="#2e3f73"/><circle cx="32" cy="32" r="25" fill="#fbf0d6"/><circle cx="32" cy="32" r="19" fill="#d8453a"/><polygon points="32,18 35.5,27 45,27 37.5,32.5 40.5,42 32,36.5 23.5,42 26.5,32.5 19,27 28.5,27" fill="#f6c445"/></svg>`,
  { size: 256 },
);
const lettering = svg(
  `<svg viewBox="0 0 440 64" xmlns="http://www.w3.org/2000/svg"><text x="220" y="48" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-size="52" letter-spacing="3" fill="#2e3f73">MERRY MAY</text></svg>`,
  { size: 1024 },
);

export default function build() {
  const b = createBuilder({ name: "barnstormerBiplane", detail: 1.25 });

  // Skeleton: one static airframe, and a hinge for every part that moves.
  const airframe = b.joint("airframe", { at: [0, 1.4, 0] });
  const prop = b.joint("prop", { parent: airframe, at: [0, 1.32, 3.58], dir: [0, 0, 1], role: "hinge" });

  // Fuselage: a chunky loft from the round engine cowl to the tail post.
  const body = b.loft(
    [
      { at: [0, 1.3, 3.42], w: 0.56, h: 0.62 },
      { at: [0, 1.3, 3.15], w: 0.8, h: 0.82 },
      { at: [0, 1.3, 2.55], w: 0.84, h: 0.86 },
      { at: [0, 1.32, 1.9], w: 0.78, h: 0.84 },
      { at: [0, 1.36, 1.2], w: 0.72, h: 0.86 },
      { at: [0, 1.4, 0.4], w: 0.72, h: 0.88 },
      { at: [0, 1.42, -0.5], w: 0.68, h: 0.84 },
      { at: [0, 1.44, -1.5], w: 0.52, h: 0.66 },
      { at: [0, 1.46, -2.5], w: 0.36, h: 0.42 },
      { at: [0, 1.45, -3.2], w: 0.22, h: 0.26 },
      { at: [0, 1.42, -3.55], w: 0.12, h: 0.14 },
    ],
    { color: bodyPaint, bone: airframe },
  );

  // Navy coaming rings round the two cockpit openings, draped onto the fuselage top.
  const skin = b.surface(body);
  const coaming = (z0: number, z1: number) => {
    const loop = catmull(
      [
        [-0.2, 1.8, z0 + 0.05],
        [-0.15, 1.8, z0],
        [0.15, 1.8, z0],
        [0.2, 1.8, z0 + 0.05],
        [0.2, 1.8, z1 - 0.05],
        [0.15, 1.8, z1],
        [-0.15, 1.8, z1],
        [-0.2, 1.8, z1 - 0.05],
      ],
      { closed: true },
    );
    b.sweep(skin.drape(loop, { lift: 0.004 }), 0.02, { color: NAVY, bone: airframe });
  };
  coaming(-0.6, -0.05);
  coaming(0.2, 0.8);

  // Side lettering and roundels on the fuselage flanks.
  for (const s of [1, -1]) {
    const word = skin.around([0, 1.12, 1.6]).at(s * 90, 0);
    const emblem = skin.around([0, 1.3, 2.75]).at(s * 90, 0);
    if (!word || !emblem) throw new Error("fuselage flank not found");
    b.decal(body, lettering, { at: word, size: [1.1, 0.16] });
    b.decal(body, roundel, { at: emblem, size: [0.42, 0.42] });
  }

  // Spinner and two-blade prop, spinning on the prop hinge.
  b.extrude(blade, {
    at: [0, 1.32, 3.58],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.03,
    smoothing: 1,
    color: propPaint,
    bone: prop,
  });
  b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.31, 0.18],
      [0.27, 0.34],
      [0.16, 0.45],
      [0, 0.5],
    ],
    { at: [0, 1.32, 3.2], axis: [0, 0, 1], color: spinnerPaint, bone: prop },
  );

  // Exhaust stacks down both cowl flanks.
  for (const s of [1, -1])
    for (const z of [2.2, 2.42, 2.64])
      b.rod([s * 0.25, 1.1, z], [s * 0.56, 0.9, z + 0.12], 0.035, { color: DARK, bone: airframe });

  // Wings: upper (chord 1.5 m, span 10 m) and lower (span 8.8 m), both extruded slabs.
  const upperWing = b.extrude(
    [
      [-5.0, -0.35],
      [-5.0, 0.55],
      [-1.2, 0.8],
      [1.2, 0.8],
      [5.0, 0.55],
      [5.0, -0.35],
      [1.2, -0.7],
      [-1.2, -0.7],
    ],
    {
      at: [0, 2.45, 0],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.08,
      bevel: 0.02,
      smoothing: 1,
      color: wingPaint(CREAM, RED, RED, edge(0.8, 0.55, 5.0), edge(-0.7, -0.35, 5.0)),
      bone: airframe,
    },
  );
  b.extrude(
    [
      [-4.4, -0.3],
      [-4.4, 0.5],
      [-1.2, 0.7],
      [1.2, 0.7],
      [4.4, 0.5],
      [4.4, -0.3],
      [1.2, -0.6],
      [-1.2, -0.6],
    ],
    {
      at: [0, 1.05, 0],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.08,
      bevel: 0.02,
      smoothing: 1,
      color: wingPaint(RED, CREAM, YELLOW, edge(0.7, 0.5, 4.4), edge(-0.6, -0.3, 4.4)),
      bone: airframe,
    },
  );
  for (const s of [1, -1])
    b.decal(upperWing, roundel, { at: [s * 2.3, 2.49, 0], dir: [0, 1, 0], up: [0, 0, 1], size: [0.55, 0.55] });

  // Ailerons on the upper wing trailing edge, each on its own hinge.
  for (const s of [1, -1]) {
    const aileron = b.joint(s > 0 ? "aileronL" : "aileronR", {
      parent: airframe,
      at: [s * 3.45, 2.45, -0.34],
      role: "hinge",
    });
    b.extrude(
      [
        [0, 0],
        [1.4, 0],
        [1.4, 0.3],
        [0, 0.3],
      ],
      { at: [s * 3.45, 2.45, -0.34], x: [s, 0, 0], y: [0, 0, -1], thickness: 0.1, color: stripeSpan, bone: aileron },
    );
  }

  // Interplane struts with brass bolts at each wing, flying wires, and cabane struts over the cockpits.
  for (const s of [1, -1]) {
    for (const x of [1.6, 3.3, 4.3])
      for (const z of [0.3, -0.2]) {
        b.rod([s * x, 1.0, z], [s * x, 2.42, z], 0.03, { color: WOOD, bone: airframe });
        for (const y of [1.1, 2.4])
          b.part(new THREE.SphereGeometry(0.04, 6, 4), BRASS, { bone: airframe, at: [s * x, y, z] });
      }
    const bays: [number, number][] = [
      [0.85, 1.6],
      [1.6, 3.3],
      [3.3, 4.3],
    ];
    for (const [a, c] of bays) {
      b.rod([s * a, 1.07, 0.3], [s * c, 2.42, -0.2], 0.008, { color: STEEL, bone: airframe });
      b.rod([s * c, 1.07, 0.3], [s * a, 2.42, -0.2], 0.008, { color: STEEL, bone: airframe });
    }
    b.rod([s * 0.34, 1.5, 0.55], [s * 0.9, 2.42, 0.3], 0.03, { color: WOOD, bone: airframe });
    b.rod([s * 0.3, 1.5, -0.45], [s * 0.9, 2.42, -0.2], 0.03, { color: WOOD, bone: airframe });
  }

  // Gravity tank on the upper wing, with a brass cap.
  b.lathe(
    [
      [0, 0],
      [0.26, 0],
      [0.27, 0.05],
      [0.22, 0.3],
      [0.12, 0.42],
      [0, 0.45],
    ],
    { at: [0, 2.49, 0.25], color: tankPaint, bone: airframe },
  );

  // Tail: stabiliser with elevators, fin with rudder, and a wooden tail skid.
  b.extrude(
    [
      [-1.05, 0],
      [1.05, 0],
      [1.0, 0.7],
      [-1.0, 0.7],
    ],
    { at: [0, 1.5, -2.45], x: [1, 0, 0], y: [0, 0, -1], thickness: 0.05, smoothing: 1, color: stabPaint, bone: airframe },
  );
  for (const s of [1, -1]) {
    const elevator = b.joint(s > 0 ? "elevatorL" : "elevatorR", {
      parent: airframe,
      at: [s * 0.12, 1.5, -2.93],
      role: "hinge",
    });
    b.extrude(
      [
        [0, 0],
        [0.9, 0],
        [0.9, 0.22],
        [0, 0.22],
      ],
      { at: [s * 0.12, 1.5, -2.93], x: [s, 0, 0], y: [0, 0, -1], thickness: 0.07, color: stripeSpan, bone: elevator },
    );
  }
  b.extrude(
    [
      [0, 0],
      [0.72, 0],
      [0.6, 1.05],
      [0.3, 1.22],
      [0, 0.85],
    ],
    { at: [0, 1.5, -2.45], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.06, smoothing: 1, color: finPaint, bone: airframe },
  );
  const rudder = b.joint("rudder", { parent: airframe, at: [0, 1.65, -2.93], role: "hinge" });
  b.extrude(
    [
      [0, 0],
      [0.22, 0],
      [0.18, 0.9],
      [0, 0.9],
    ],
    { at: [0, 1.65, -2.93], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.06, color: checker, bone: rudder },
  );
  b.sweep(catmull([[0, 1.3, -2.45], [0, 0.62, -3.0], [0, 0.04, -3.3]]), 0.035, { color: WOOD_DARK, bone: airframe });

  // Landing gear: a bent axle, two struts a side, and wheels that spin on their own hinges.
  b.rod([-0.95, 0.43, 0.25], [0.95, 0.43, 0.25], 0.03, { color: STEEL, bone: airframe });
  for (const s of [1, -1]) {
    const cx = s * 0.95;
    b.rod([s * 0.25, 1.1, 0.7], [cx, 0.43, 0.25], 0.035, { color: WOOD, bone: airframe });
    b.rod([s * 0.25, 1.1, -0.2], [cx, 0.43, 0.25], 0.035, { color: WOOD, bone: airframe });

    const wheel = b.joint(s > 0 ? "wheelL" : "wheelR", { parent: airframe, at: [cx, 0.43, 0.25], role: "hinge" });
    b.part(new THREE.TorusGeometry(0.36, 0.07, 8, 16).rotateY(Math.PI / 2).translate(cx, 0.43, 0.25), TYRE, {
      bone: wheel,
      at: [0, 0, 0],
    });
    b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.2, 10).rotateZ(Math.PI / 2).translate(cx, 0.43, 0.25), RED, {
      bone: wheel,
      at: [0, 0, 0],
    });
    for (let k = 0; k < 3; k++)
      b.part(
        new THREE.BoxGeometry(0.05, 0.62, 0.035).rotateX((k * Math.PI) / 3).translate(cx, 0.43, 0.25),
        WOOD,
        { bone: wheel, at: [0, 0, 0] },
      );

    // Wedge chock on the ground behind each wheel.
    b.extrude(
      [
        [0, 0],
        [0.36, 0],
        [0, 0.16],
      ],
      { at: [cx, 0, -0.2], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.2, color: WOOD_DARK, bone: airframe },
    );
  }

  // Wing-tip navigation lights: red to port (+X), green to starboard.
  b.part(new THREE.SphereGeometry(0.07, 8, 6), LIGHT_RED, { bone: airframe, at: [5.0, 2.47, 0.1] });
  b.part(new THREE.SphereGeometry(0.07, 8, 6), LIGHT_GREEN, { bone: airframe, at: [-5.0, 2.47, 0.1] });

  // Windscreen between the cockpits, a pale glass pane.
  b.extrude(
    [
      [-0.22, 0],
      [0.22, 0],
      [0.2, 0.24],
      [-0.2, 0.24],
    ],
    { at: [0, 1.78, 0.02], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, color: GLASS, bone: airframe },
  );

  // Pilot in the rear cockpit: leather jacket, leather helmet, copper-rimmed goggles, a flying scarf.
  b.part(new THREE.BoxGeometry(0.34, 0.1, 0.3).translate(0, 1.84, -0.32), LEATHER, { bone: airframe, at: [0, 0, 0] });
  b.part(new THREE.SphereGeometry(0.2, 10, 8).scale(1, 0.85, 0.95).translate(0, 1.84, -0.32), LEATHER, {
    bone: airframe,
    at: [0, 0, 0],
  });
  b.part(new THREE.SphereGeometry(0.15, 12, 9).translate(0, 2.09, -0.32), SKIN, { bone: airframe, at: [0, 0, 0] });
  b.part(
    new THREE.SphereGeometry(0.165, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55).translate(0, 2.11, -0.32),
    LEATHER,
    { bone: airframe, at: [0, 0, 0] },
  );
  b.part(new THREE.TorusGeometry(0.158, 0.012, 6, 18).rotateX(Math.PI / 2).translate(0, 2.1, -0.32), LEATHER, {
    bone: airframe,
    at: [0, 0, 0],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.02, 10).rotateX(Math.PI / 2).translate(s * 0.075, 2.1, -0.18), GOGGLE, {
      bone: airframe,
      at: [0, 0, 0],
    });
    b.part(new THREE.TorusGeometry(0.062, 0.014, 6, 10).translate(s * 0.075, 2.1, -0.175), COPPER, {
      bone: airframe,
      at: [0, 0, 0],
    });
  }
  b.sweep(
    catmull([
      [0, 1.98, -0.42],
      [0.0, 2.0, -0.75],
      [0.03, 1.98, -1.1],
      [-0.02, 1.95, -1.45],
      [0.02, 1.9, -1.8],
    ]),
    (t: number): [number, number] => [0.05 - 0.02 * t, 0.012],
    { color: scarfPaint, bone: airframe },
  );
  b.rod([0, 1.86, -0.12], [0, 1.99, -0.06], 0.02, { color: DARK, bone: airframe });
  b.part(new THREE.SphereGeometry(0.035, 8, 6).translate(0, 2.0, -0.06), RED, { bone: airframe, at: [0, 0, 0] });

  // Passenger in the front cockpit: navy jacket, a boater hat, a waxed moustache.
  b.part(new THREE.BoxGeometry(0.34, 0.1, 0.3).translate(0, 1.83, 0.5), LEATHER, { bone: airframe, at: [0, 0, 0] });
  b.part(new THREE.SphereGeometry(0.2, 10, 8).scale(1, 0.85, 0.95).translate(0, 1.84, 0.5), NAVY, {
    bone: airframe,
    at: [0, 0, 0],
  });
  b.part(new THREE.SphereGeometry(0.15, 12, 9).translate(0, 2.09, 0.5), SKIN, { bone: airframe, at: [0, 0, 0] });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.018, 6, 4).translate(s * 0.05, 2.12, 0.635), DARK, {
      bone: airframe,
      at: [0, 0, 0],
    });
  b.sweep(
    catmull([
      [-0.07, 2.02, 0.635],
      [0, 2.0, 0.65],
      [0.07, 2.02, 0.635],
    ]),
    0.012,
    { color: DARK, bone: airframe },
  );
  b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.31, 0.01],
      [0.27, 0.03],
      [0.14, 0.035],
      [0, 0.035],
    ],
    { at: [0, 2.14, 0.5], color: STRAW, bone: airframe },
  );
  b.lathe(
    [
      [0, 0],
      [0.14, 0],
      [0.145, 0.04],
      [0.14, 0.1],
      [0.125, 0.17],
      [0.1, 0.21],
      [0, 0.22],
    ],
    { at: [0, 2.175, 0.5], color: STRAW, bone: airframe },
  );
  b.part(new THREE.TorusGeometry(0.146, 0.013, 6, 18).rotateX(Math.PI / 2).translate(0, 2.19, 0.5), RED, {
    bone: airframe,
    at: [0, 0, 0],
  });

  // Dog on the front seat, looking out past the windscreen with its ears up.
  b.part(new THREE.SphereGeometry(0.09, 10, 8).scale(1, 0.9, 1.1).translate(0.14, 1.87, 0.2), DOG, {
    bone: airframe,
    at: [0, 0, 0],
  });
  b.part(new THREE.SphereGeometry(0.085, 10, 8).translate(0.14, 1.99, 0.24), DOG, { bone: airframe, at: [0, 0, 0] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.035, 6, 4).scale(0.6, 1.4, 0.5).translate(0.14 + s * 0.07, 2.05, 0.22), DOG_EAR, {
      bone: airframe,
      at: [0, 0, 0],
    });
    b.part(new THREE.SphereGeometry(0.013, 6, 4).translate(0.14 + s * 0.035, 2.02, 0.315), DARK, {
      bone: airframe,
      at: [0, 0, 0],
    });
  }
  b.part(new THREE.SphereGeometry(0.045, 8, 6).translate(0.14, 1.96, 0.32), SKIN, { bone: airframe, at: [0, 0, 0] });
  b.part(new THREE.SphereGeometry(0.018, 6, 4).translate(0.14, 1.99, 0.35), DARK, { bone: airframe, at: [0, 0, 0] });

  return b.root;
}
