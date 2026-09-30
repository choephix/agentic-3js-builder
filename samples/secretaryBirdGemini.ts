// Secretary Bird (Sagittarius serpentarius)
// Height ~1.3m, standing rest pose on y=0
import { SphereGeometry, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { lerp } from "../src/math";
import { gradient, mix, paint, smoothstep } from "../src/paint";
import { catmull } from "../src/path";

export const meta = {
  name: "Secretary Bird · Gemini",
  description:
    "A secretary bird about 1.3 m tall: long stilt-like legs with black feathered thighs and bare scaly lower legs, short toes planted on the floor; grey body; black flight feathers with wings held slightly out; two long central tail feathers; bare orange-red face, hooked grey beak with separate lower jaw, and a crest of long black-tipped quills fanning out behind the head.",
};

// --- Palette ---
const GREY_BODY = "#a4a8af";
const GREY_LIGHT = "#cbd0d6";
const GREY_DARK = "#666a71";
const BLACK = "#151618";
const BLACK_QUILL = "#0f1012";
const WHITE_QUILL = "#e2e4e8";
const LEG_SCALES = "#c6b8a2";
const LEG_JOINT = "#a89982";
const CLAW = "#222120";
const FACE_ORANGE = "#e65100";
const FACE_RED = "#d82b18";
const BEAK_GREY = "#989ea4";
const BEAK_TIP = "#3e4246";
const EYE_BROWN = "#5c3317";
const PUPIL = "#111111";

export default function build() {
  const b = createBuilder({ name: "secretaryBirdGemini" });

  // 1.3m target height.
  // Hip joint sits at y=0.76, body stretches y=0.68..0.92, neck rises to 1.15, head at 1.18..1.27.
  // Crest quills arch to ~1.30m.
  const hips = b.joint("hips", { at: [0, 0.76, -0.06], role: "spine", group: "body" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.77, -0.04],
      [0, 0.79, 0.08],
      [0, 0.83, 0.18],
    ]),
    { parent: hips, count: 2, names: ["spine", "chest"], role: "spine", group: "body" },
  );

  // Body stations for loft:
  // Slender, deep keel, smooth raptorial contouring into the upright neck
  const stations = [
    { at: [0, 0.81, -0.27], w: 0.07, h: 0.08 },
    { at: [0, 0.79, -0.16], w: 0.14, h: 0.15 },
    { at: [0, 0.77, -0.05], w: 0.17, h: 0.20 },
    { at: [0, 0.79, 0.08], w: 0.18, h: 0.22 },
    { at: [0, 0.83, 0.18], w: 0.15, h: 0.19 },
    { at: [0, 0.90, 0.23], w: 0.10, h: 0.12 },
    { at: [0, 0.98, 0.24], w: 0.065, h: 0.075 },
    { at: [0, 1.06, 0.22], w: 0.052, h: 0.06 },
    { at: [0, 1.14, 0.19], w: 0.046, h: 0.052 },
  ] as const;

  const bodyPath = catmull(stations.map(({ at }) => at));
  const neckStart = bodyPath.closestT(stations[5].at);

  const neck = b.chain("neck", bodyPath.slice(neckStart, 1), {
    parent: spine.joints[1],
    count: 3,
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
    group: "neck",
  });

  const bodyPaint = paint((_p, n) => {
    // Countershading: light grey belly and breast, darker grey back
    const under = smoothstep(-0.2, 0.3, -n.y);
    const dorsal = smoothstep(0.0, 0.5, n.y);
    const base = mix(GREY_BODY, GREY_LIGHT, under * 0.45);
    return mix(base, GREY_DARK, dorsal * 0.35);
  });

  b.loft(stations, {
    bone: [spine, neck],
    color: bodyPaint,
    group: "body",
  });

  // ---- Head & Beak ----
  const head = b.joint("head", {
    parent: neck.joints[2],
    at: neck.at(1),
    dir: [0, 0.1, 1],
    role: "head",
    group: "head",
  });

  // Skull: raptor skull
  b.part(
    new SphereGeometry(1, b.segments(10), b.segments(8)),
    GREY_BODY,
    { bone: head, frame: head.moved([0, 0.026, 0.008]), scale: [0.032, 0.044, 0.035], group: "head", name: "skull" },
  );

  // Bare orange-red facial skin mask: secretary birds have vivid orange/red skin surrounding the eyes and lores
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // Facial bare skin mask (flatter, wrapping closely over the eye region)
    b.part(
      new SphereGeometry(1, b.segments(8), b.segments(6)),
      gradient(FACE_ORANGE, FACE_RED, head.local([s * 0.015, 0.025, 0]), head.local([s * 0.03, 0.045, 0.015])),
      {
        bone: head,
        frame: head.moved([s * 0.023, 0.036, 0.010]),
        scale: [0.011, 0.020, 0.016],
        group: "head",
        name: `faceSkin${side}`,
      },
    );

    // Eye: large, dark brown raptorial eye nestled in the orange mask
    b.lathe(
      [
        [0, 0],
        [0.0065, 0],
        [0.0060, 0.002],
        [0.0030, 0.004],
        [0, 0.0046],
      ],
      {
        at: head.local([s * 0.031, 0.034, 0.014]),
        axis: head.dir([s * 1, 0.08, 0.08]),
        bone: head,
        segments: 8,
        color: EYE_BROWN,
        group: "head",
        name: `eye${side}`,
      },
    );

    // Pupil
    b.lathe(
      [
        [0, 0],
        [0.0030, 0],
        [0.0022, 0.0014],
        [0, 0.0018],
      ],
      {
        at: head.local([s * 0.034, 0.035, 0.015]),
        axis: head.dir([s * 1, 0.08, 0.08]),
        bone: head,
        segments: 6,
        color: PUPIL,
        group: "head",
        name: `pupil${side}`,
      },
    );
  }

  // Hooked raptorial beak: strongly curved, predatory
  // Upper beak: curved culmen
  const beakUpperPath = catmull([
    head.local([0, 0.052, 0.008]),
    head.local([0, 0.075, 0.004]),
    head.local([0, 0.096, -0.006]),
    head.local([0, 0.108, -0.022]),
  ]);

  b.sweep(
    beakUpperPath,
    (t) => [0.013 * (1 - 0.7 * t), 0.016 * (1 - 0.65 * t)],
    {
      bone: head,
      color: BEAK_GREY,
      group: "head",
      name: "beakUpper",
    },
  );

  // Hook tip at end of upper beak
  b.spike(
    head.local([0, 0.108, -0.022]),
    head.dir([0, 0.1, -1]),
    0.012,
    0.0032,
    { bone: head, color: BEAK_TIP, sides: 6, group: "head", name: "beakHook" },
  );

  // Lower jaw
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.048, -0.012]),
    dir: head.dir([0, 1, -0.22]),
    role: "jaw",
    group: "head",
  });

  b.lathe(
    [
      [0, 0],
      [0.010, 0],
      [0.009, 0.012],
      [0.006, 0.03],
      [0.0025, 0.044],
      [0, 0.050],
    ],
    {
      at: jaw.local([0, 0.003, 0]),
      axis: jaw.axis,
      bone: jaw,
      segments: 8,
      color: BEAK_GREY,
      group: "head",
      name: "beakLower",
    },
  );

  // ---- Crest of Quills ----
  // "crest of long black-tipped quills fanning out behind the head"
  // Arranged in natural tiers trailing backward and arching gracefully down
  const crestFan = [
    // [yawDeg, pitchDeg, length]
    // Low tier (shorter, trailing back along the nape)
    [0, -10, 0.16],
    [-7, -12, 0.15],
    [7, -12, 0.15],
    [-14, -15, 0.14],
    [14, -15, 0.14],
    // Mid tier (long, horizontal / slightly raised)
    [0, 5, 0.22],
    [-9, 3, 0.21],
    [9, 3, 0.21],
    [-18, 0, 0.19],
    [18, 0, 0.19],
    [-25, -4, 0.17],
    [25, -4, 0.17],
    // High tier (elevated, arching proudly backward)
    [0, 22, 0.24],
    [-8, 19, 0.23],
    [8, 19, 0.23],
    [-16, 15, 0.21],
    [16, 15, 0.21],
    // Top crown crest
    [0, 38, 0.22],
    [-7, 34, 0.20],
    [7, 34, 0.20],
  ];

  const quillPaint = paint((_p, _n, s) => {
    // Pale grey/white base, transition to jet black on terminal 40%
    return s[0] > 0.60 ? BLACK_QUILL : WHITE_QUILL;
  });

  const crestRoot = head.local([0, 0.005, 0.022]);
  for (let i = 0; i < crestFan.length; i++) {
    const [yawDeg, pitchDeg, len] = crestFan[i];
    const yaw = (yawDeg * Math.PI) / 180;
    const pitch = (pitchDeg * Math.PI) / 180;
    // Aim vector in head coords: backward (-Y), up (+Z), sideways (+X)
    const localDir = new Vector3(
      Math.sin(yaw) * Math.cos(pitch),
      -Math.cos(pitch),
      Math.sin(pitch),
    ).normalize();
    const quillDir = head.dir(localDir);

    // Quill curve: gentle droop along its length
    const p0 = crestRoot.clone().add(head.dir([Math.sin(yaw) * 0.012, 0, Math.sin(pitch) * 0.008]));
    const p1 = p0.clone().addScaledVector(quillDir, len * 0.52).add(new Vector3(0, -0.015 * (len / 0.2), 0));
    const p2 = p0.clone().addScaledVector(quillDir, len).add(new Vector3(0, -0.04 * (len / 0.2), 0));

    b.sweep(
      catmull([p0, p1, p2]),
      (t) => [0.007 * (1 - 0.45 * t), 0.002],
      {
        bone: head,
        section: "box",
        color: quillPaint,
        group: "head",
        name: `quill${i}`,
      },
    );
  }

  // ---- Wings ----
  // "black flight feathers with the wings held slightly out"
  // Natural rest pose: held slightly out from flank, drooping gently back and down
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const g = `wing${side}`;
    // Shoulder, elbow, wrist, wingtip
    const S = new Vector3(s * 0.09, 0.81, 0.12);
    const E = new Vector3(s * 0.16, 0.77, -0.02);
    const W = new Vector3(s * 0.18, 0.73, -0.19);
    const T = new Vector3(s * 0.16, 0.68, -0.37);

    const wing = b.chain(g, [S, E, W, T], {
      parent: spine.joints[1],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "wing",
      group: g,
    });
    const [, elbow, wrist] = wing.joints;

    // Wing bone arm sweep
    b.sweep(wing, [0.022, 0.016, 0.013, 0.008], { color: GREY_BODY, group: g });

    // Scapulars and coverts: grey mantle extending over the wing
    const trail = catmull([
      [s * 0.095, 0.80, -0.05],
      [s * 0.15, 0.75, -0.14],
      [s * 0.17, 0.71, -0.25],
      [s * 0.15, 0.67, -0.39],
    ]);
    b.membrane(wing, trail, { bone: wing, thickness: 0.011, color: GREY_BODY, group: g });

    // Flight feathers: long, wide, jet black quills
    // Secondaries along the forearm (elbow to wrist)
    for (let i = 0; i < 9; i++) {
      const u = i / 8;
      const root = lerp(E, W, u).add(new Vector3(s * 0.005, -0.006, -0.012));
      const tip = root.clone().add(new Vector3(s * 0.01, -0.10, -0.22));
      b.sweep(
        catmull([root, tip]),
        (t) => [0.025 * (1 - 0.35 * t), 0.003],
        { bone: elbow, section: "box", color: BLACK, group: g, name: `secondary${side}_${i}` },
      );
    }

    // Primaries along the hand (wrist to tip)
    for (let i = 0; i < 9; i++) {
      const u = i / 8;
      const root = lerp(W, T, u).add(new Vector3(s * 0.004, -0.006, -0.01));
      const tip = root.clone().add(new Vector3(s * (0.01 + 0.02 * u), -0.13 - 0.015 * u, -0.25 + 0.025 * u));
      b.sweep(
        catmull([root, tip]),
        (t) => [0.023 * (1 - 0.4 * t), 0.003],
        { bone: wrist, section: "box", color: BLACK, group: g, name: `primary${side}_${i}` },
      );
    }
  }

  // ---- Tail ----
  // "two long central tail feathers"
  // Tail base with short grey feathers, and two magnificent elongated central streamer rectrices
  // Ground clearance check: bird stands on y=0, tail tip stays safely above y=0.30
  const tailPath = catmull([
    [0, 0.81, -0.25],
    [0, 0.77, -0.38],
    [0, 0.71, -0.52],
    [0, 0.63, -0.68],
    [0, 0.52, -0.84],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    count: 4,
    names: (i) => `tail${i + 1}`,
    role: "tail",
    group: "tail",
  });

  // Lateral short grey rectrices
  for (let s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const u = i / 3;
      const p0 = tailPath.at(0.05).add(new Vector3(s * (0.015 + 0.02 * u), 0.008, 0));
      const p1 = tailPath.at(0.38).add(new Vector3(s * (0.035 + 0.025 * u), -0.01, 0));
      b.sweep(
        catmull([p0, p1]),
        (t) => [0.026 * (1 - 0.4 * t), 0.004],
        { bone: tail.joints[0], section: "box", color: GREY_BODY, group: "tail" },
      );
    }
  }

  // Two long central streamer feathers extending far behind
  for (let s of [-0.014, 0.014]) {
    const pts = [
      tailPath.at(0.04).add(new Vector3(s, 0.006, 0)),
      tailPath.at(0.28).add(new Vector3(s * 1.1, 0.004, 0)),
      tailPath.at(0.55).add(new Vector3(s * 1.2, 0.002, 0)),
      tailPath.at(0.80).add(new Vector3(s * 1.1, 0.001, 0)),
      tailPath.at(1.0).add(new Vector3(s, 0, 0)),
    ];
    // Patterned rectrix: pale grey shaft and web, wide black band near tip, crisp white tip
    const featherPaint = paint((_p, _n, s) => {
      if (s[0] > 0.93) return WHITE_QUILL;
      if (s[0] > 0.75) return BLACK;
      return GREY_LIGHT;
    });

    b.sweep(
      catmull(pts),
      (t) => [0.024 * (t < 0.85 ? 1 : 0.75), 0.003],
      {
        bone: tail.joints,
        section: "box",
        color: featherPaint,
        group: "tail",
        name: s > 0 ? "centralTailL" : "centralTailR",
      },
    );
  }

  // ---- Legs ----
  // "long legs with black feathered thighs and bare scaly lower legs, short toes planted on the floor"
  // Leg stands straight down with gentle, natural bird articulation
  // Total leg reach down to y=0.
  const TOE_R = 0.008;
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const g = `leg${side}`;

    const footX = s * 0.075;
    const footZ = -0.01;
    const footY = TOE_R + 0.002;

    // Segment lengths:
    // Thigh = 0.22m, Shin = 0.28m, Tarsus = 0.28m, Ball/foot = 0.04m
    const leg = b.chain(
      g,
      limb(
        [s * 0.07, 0.75, -0.06],
        [footX, footY, footZ],
        [0.22, 0.28, 0.28, 0.04],
        [
          [0, 0, 1],   // knee forward
          [0, 0, -1],  // hock backward
          [0, 0, 1],   // ankle forward
        ],
        { sole: [0, 0, 1] },
      ),
      {
        parent: hips,
        names: ["thigh", "shin", "tarsus", "toe"].map((n) => n + side),
        role: "leg",
        contact: [footX, 0, footZ],
        group: g,
      },
    );

    const [thighJoint, shinJoint, tarsusJoint, ballJoint] = leg.joints;

    // 1. Thigh: thick feathered black plumage ("black feathered thighs")
    b.capsule(
      thighJoint.at,
      shinJoint.at,
      [0.036, 0.024],
      { bone: thighJoint, color: BLACK, sides: 8, group: g, name: `thighMesh${side}` },
    );

    // Knee cap / transition joint
    b.part(
      new SphereGeometry(1, b.segments(8), b.segments(6)),
      LEG_JOINT,
      {
        bone: shinJoint,
        frame: shinJoint,
        scale: [0.016, 0.018, 0.018],
        group: g,
        name: `knee${side}`,
      },
    );

    // 2. Shin (tibiotarsus): bare pale scaly bone
    b.capsule(
      shinJoint.at,
      tarsusJoint.at,
      [0.014, 0.011],
      { bone: shinJoint, color: LEG_SCALES, sides: 6, group: g, name: `shinMesh${side}` },
    );

    // Hock joint (intertarsal joint)
    b.part(
      new SphereGeometry(1, b.segments(8), b.segments(6)),
      LEG_JOINT,
      {
        bone: tarsusJoint,
        frame: tarsusJoint,
        scale: [0.014, 0.016, 0.016],
        group: g,
        name: `hock${side}`,
      },
    );

    // 3. Tarsus (tarsometatarsus): long, thin bare scaly lower leg
    b.capsule(
      tarsusJoint.at,
      ballJoint.at,
      [0.012, 0.010],
      { bone: tarsusJoint, color: LEG_SCALES, sides: 6, group: g, name: `tarsusMesh${side}` },
    );

    // Spur on rear of tarsus
    b.spike(
      lerp(tarsusJoint.at, ballJoint.at, 0.72),
      [0, -0.2, -1],
      0.014,
      0.0035,
      { bone: tarsusJoint, color: CLAW, sides: 5, group: g, name: `spur${side}` },
    );

    // 4. Foot and Toes
    const b0 = new Vector3(ballJoint.at.x, TOE_R, ballJoint.at.z);

    // Foot central pad
    b.capsule(
      ballJoint.at,
      b0,
      [0.012, 0.011],
      { bone: ballJoint, color: LEG_SCALES, sides: 6, group: g, name: `footPad${side}` },
    );

    // Short, thick toes planted flat on the floor for snake-stomping
    // Anisodactyl: 3 forward, 1 hallux back
    const toes: [number, number, number][] = [
      [s * 0.024, 0.052, 0.85],  // outer toe (toe 4)
      [0, 0.064, 1.0],           // middle toe (toe 3)
      [-s * 0.022, 0.048, 0.85], // inner toe (toe 2)
      [0, 0.030, -0.9],          // hind toe (hallux, toe 1)
    ];

    for (let tIdx = 0; tIdx < toes.length; tIdx++) {
      const [dx, len, fwd] = toes[tIdx];
      const dir = new Vector3(dx / 0.064, 0, fwd).normalize();
      const tip = b0.clone().addScaledVector(dir, len).setY(0.006);
      b.capsule(b0, tip, [0.008, 0.006], { bone: ballJoint, color: LEG_SCALES, sides: 6, group: g, name: `toe${side}_${tIdx}` });
      // Sturdy curved raptorial talon
      b.spike(tip, dir.clone().add(new Vector3(0, -0.32, 0)), 0.013, 0.0040, {
        bone: ballJoint,
        color: CLAW,
        sides: 5,
        group: g,
        name: `claw${side}_${tIdx}`,
      });
    }
  }

  return b.root;
}
