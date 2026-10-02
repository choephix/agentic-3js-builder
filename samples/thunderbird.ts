import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull, polyline } from "../src/path";
import { rng } from "../src/math";
import { animeEye, cel, furEdge, INK } from "../kits/toon";
import { glow } from "../kits/glow";
import { svg } from "../src/texture";

const BODY = cel("#2167b4", "#17346f");
const BODY_EDGE = cel(furEdge("#2c8bd1", "#17295d", { level: -0.12, teeth: 0.2, period: 0.06, ink: INK }));
const BELLY = cel("#e8f3ff", "#94b9df");
const WING = cel("#3158a9", "#1b245e");
const WING_MEMBRANE = cel(furEdge("#527bd0", "#22235d", { level: -0.05, teeth: 0.05, period: 0.04 }));
const FEATHER_DARK = cel("#172451", "#0d1230");
const BEAK = cel("#f2a623", "#9c3f22");
const BEAK_TIP = cel("#ffd66a", "#c35b29");
const TALON = cel("#f0c45e", "#9e542d");
const GOLD = cel("#ffd45e", "#b96531");
const ARC = "#8deaff";
const ARC_DEEP = "#3f8fff";
const INK_BLUE = "#111a42";

const featherMark = svg(
  `<svg viewBox="0 0 64 128"><path d="M32 2C13 27 9 57 20 83c4 10 10 24 12 43 3-19 8-32 14-44C58 54 53 27 32 2Z" fill="#d8f7ff"/><path d="M32 8v108M32 48L18 68M32 63l16-21M32 83L19 98M32 91l14-13" fill="none" stroke="#4e96e8" stroke-width="5" stroke-linecap="round"/></svg>`,
  { size: 128 },
);
const lightningMark = svg(
  `<svg viewBox="0 0 64 128"><path d="M37 2 9 66h20l-7 60 33-77H34Z" fill="#e9ffff" stroke="#2d83ff" stroke-width="5" stroke-linejoin="round"/></svg>`,
  { size: 128 },
);
const EYE = animeEye({ iris: "#38d9ff", irisLight: "#e8ffff", irisDark: "#164da8", blush: "#6df6ff", size: 384 });

export const meta = {
  name: "Thunderbird",
  description: "A storm eagle with a lightning crown, electric wing membranes, and a spread tail of sky-feathers.",
  style: "Overwatch/League mix",
  commit: "07503e3",
};

export default function build() {
  const b = createBuilder({ name: "thunderbird", detail: 1.2, paintSize: 1024 });
  const random = rng(23);

  // The creature is rooted in a neutral, readable rest pose.
  const root = b.joint("root", { at: [0, 1.52, -0.12], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.52, -0.12],
      [0, 1.78, -0.03],
      [0, 2.02, 0.04],
      [0, 2.21, 0.08],
    ]),
    { parent: root, names: ["pelvis", "spineMid", "chest", "shoulder", "shoulderTip"], role: "spine", count: 4 },
  );
  const body = b.sweep(spine, (t) => 0.32 - 0.08 * t, {
    color: (t) => (t > 0.56 ? BODY_EDGE : BODY),
    section: { ngon: 8 },
    group: "body",
    name: "stormBody",
    sectors: [[120, 240, BELLY]],
  });

  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.17, 0.08],
      [0, 2.39, 0.15],
      [0, 2.57, 0.28],
      [0, 2.68, 0.4],
    ]),
    { parent: spine.tip!, names: ["neck1", "neck2", "neck3", "neckBase", "neckTip"], role: "neck", count: 4 },
  );
  b.sweep(neck, (t) => 0.2 - 0.045 * t, {
    color: BODY_EDGE,
    section: { ngon: 8 },
    group: "neck",
    name: "stormNeck",
    sectors: [[110, 250, BELLY]],
  });
  const head = b.joint("head", { parent: neck.tip!, at: [0, 2.72, 0.43], dir: [0, 0.08, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.64, 0.48], aim: [0, 2.61, 0.95], role: "jaw", group: "head" });

  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), BODY_EDGE, {
    bone: head,
    at: [0, 2.73, 0.48],
    scale: [0.28, 0.28, 0.34],
    name: "skull",
    group: "head",
  });
  b.part(new THREE.SphereGeometry(1, 12, 8), FEATHER_DARK, {
    bone: head,
    at: [0, 2.84, 0.66],
    scale: [0.24, 0.1, 0.18],
    name: "brow",
    group: "head",
  });
  const skullSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSurface.around([0, 2.73, 0.48]).at(s * 42, 10);
    if (hit) {
      b.decal(skullSurface, EYE, {
        at: hit,
        size: [0.13, 0.17],
        mirror: s > 0,
        name: `eye${s > 0 ? "L" : "R"}`,
        group: "face",
      });
    }
  }

  // Layered beak: upper and lower jaws remain independently riggable.
  b.spike([0, 2.73, 0.66], [0, 2.72, 1.12], null, 0.16, { color: BEAK, bone: head, name: "upperBeak", group: "beak" });
  b.spike([0, 2.64, 0.62], [0, 2.59, 1.02], null, 0.11, { color: BEAK_TIP, bone: jaw, name: "lowerBeak", group: "beak" });
  b.part(new THREE.SphereGeometry(1, 8, 6), INK_BLUE, { bone: head, at: [0, 2.69, 0.79], scale: [0.09, 0.035, 0.13], name: "beakMouth", group: "beak" });

  // Crown feathers are explicit spikes so the silhouette reads in a three-quarter shot.
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 0.065;
    const z = 0.31 + Math.abs(i - 3) * 0.018;
    const tipY = 3.05 + (i === 3 ? 0.14 : i % 2 ? 0.08 : 0.02);
    b.spike([x, 2.86, z], [x * 1.1, tipY, z - 0.04], null, 0.055, {
      color: i === 3 ? ARC : FEATHER_DARK,
      bone: head,
      name: `crown${i + 1}`,
      group: "crown",
    });
  }
  for (const s of [1, -1]) {
    const cheek = skullSurface.around([0, 2.73, 0.48]).at(s * 75, -14);
    if (cheek) {
      b.cards([cheek, cheek.moved([0, 0.015, -0.05]), cheek.moved([0, 0.025, -0.1])], featherMark, {
        size: [0.1, 0.22],
        lean: 18,
        bend: -12,
        mirror: s < 0,
        color: BODY,
        group: "cheekFeathers",
      });
    }
  }

  // Wing bones, one articulated chain per side.
  const wings: { chain: typeof spine; edge: typeof body }[] = [];
  for (const s of [1, -1]) {
    const wing = b.chain(
      `wing${s > 0 ? "L" : "R"}`,
      catmull([
        [s * 0.25, 2.16, 0.03],
        [s * 0.72, 2.42, 0.05],
        [s * 1.26, 2.45, 0.08],
        [s * 1.75, 2.25, 0.14],
      ]),
      { parent: spine.joints[3], names: [`shoulder${s > 0 ? "L" : "R"}`, `elbow${s > 0 ? "L" : "R"}`, `wrist${s > 0 ? "L" : "R"}`, `wingTip${s > 0 ? "L" : "R"}`, `wingEnd${s > 0 ? "L" : "R"}`], role: "wing", count: 4 },
    );
    const edge = b.sweep(wing, (t) => 0.16 - 0.1 * t, {
      color: WING,
      group: "wingBones",
      name: `wingArm${s > 0 ? "L" : "R"}`,
      sectors: [[-55, 55, BODY_EDGE]],
    });
    wings.push({ chain: wing, edge });

    // Primary feather fingers make the wing a full skeleton rather than a single fin.
    const fingers: typeof spine[] = [];
    const wrist = [s * 1.73, 2.24, 0.15] as [number, number, number];
    for (let j = 0; j < 4; j++) {
      const tipX = s * (2.08 + j * 0.22);
      const tipY = 2.03 - j * 0.1;
      const tipZ = 0.25 - j * 0.16;
      const finger = b.chain(
        `wing${s > 0 ? "L" : "R"}Finger${j + 1}`,
        polyline([wrist, [s * (1.86 + j * 0.1), 2.15 - j * 0.04, 0.18 - j * 0.04], [tipX, tipY, tipZ]]),
        { parent: wing.tip!, names: [`digit${s > 0 ? "L" : "R"}${j + 1}`, `digit${s > 0 ? "L" : "R"}${j + 1}Tip`], role: "digit", count: 2 },
      );
      fingers.push(finger);
      b.sweep(finger, [0.07 - j * 0.01, 0.018], { color: FEATHER_DARK, section: { ngon: 5 }, group: "wingDigits", name: `primary${s > 0 ? "L" : "R"}${j + 1}`, caps: "point" });
    }
    for (let j = 0; j < fingers.length - 1; j++) {
      b.membrane(fingers[j], fingers[j + 1], {
        color: WING_MEMBRANE,
        thickness: 0.018,
        scallop: 0.18,
        rows: 3,
        cols: 5,
        group: "wingMembrane",
        name: `membrane${s > 0 ? "L" : "R"}${j + 1}`,
      });
    }
    b.cards(
      fingers.flatMap((f) => [f.at(0.38), f.at(0.7)]),
      featherMark,
      { size: [0.12, 0.3], lean: 24, bend: -18, vary: 0.2, rng: random, color: BODY_EDGE, group: "wingFeathers" },
    );
  }

  // Tail fan with a separate chain and five feather fingers.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.55, -0.28],
      [0, 1.42, -0.72],
      [0, 1.34, -1.18],
      [0, 1.42, -1.62],
    ]),
    { parent: spine.joints[0], names: ["tail1", "tail2", "tail3", "tail4"], role: "tail", count: 4 },
  );
  b.sweep(tail, (t) => 0.15 - t * 0.11, { color: FEATHER_DARK, section: { ngon: 6 }, name: "tailCore", group: "tail" });
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.17;
    const feather = b.chain(
      `tailFeather${i + 1}`,
      catmull([[0, 1.42, -0.95], [x * 0.6, 1.3 + Math.abs(i - 2) * 0.05, -1.35], [x, 1.2 + Math.abs(i - 2) * 0.11, -2.08 - Math.abs(i - 2) * 0.08]]),
      { parent: tail.joints[1], names: [`tailFan${i + 1}`, `tailFan${i + 1}Tip`], role: "fan", count: 2 },
    );
    b.sweep(feather, [0.11, 0.012], { color: i === 2 ? BODY_EDGE : WING, section: { ngon: 5 }, caps: "point", name: `tailPlume${i + 1}`, group: "tail" });
    b.cards([feather.at(0.35), feather.at(0.68)], lightningMark, { size: [0.1, 0.26], lean: 82, bend: 8, mirror: i % 2 === 0, color: ARC_DEEP, group: "tailMarks" });
  }

  // Legs and three-toed feet, planted just above y=0.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(`leg${side}`, polyline([[s * 0.18, 1.54, -0.02], [s * 0.23, 1.03, 0.08], [s * 0.2, 0.47, 0.16]]), {
      parent: spine.joints[0],
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
      role: "leg",
      count: 3,
    });
    b.sweep(leg, [0.095, 0.065], { color: TALON, section: { ngon: 6 }, name: `leg${side}Tube`, group: "legs" });
    for (let t = 0; t < 3; t++) {
      const toe = b.chain(`toe${side}${t + 1}`, polyline([[s * 0.2, 0.47, 0.16], [s * (0.18 + (t - 1) * 0.06), 0.24, 0.3 + Math.abs(t - 1) * 0.04], [s * (0.18 + (t - 1) * 0.08), 0, 0.62 + Math.abs(t - 1) * 0.06]]), {
        parent: leg.tip!,
        names: [`toe${side}${t + 1}`, `claw${side}${t + 1}`],
        role: "digit",
        count: 2,
      });
      b.sweep(toe, [0.045, 0.012], { color: TALON, section: { ngon: 5 }, caps: "point", name: `toe${side}${t + 1}`, group: "talons" });
    }
    b.spike([s * 0.2, 0.47, 0.12], [s * 0.2, 0.27, -0.2], null, 0.045, { color: TALON, bone: leg.tip!, name: `rearClaw${side}`, group: "talons" });
  }

  // A serrated dorsal ridge and two orbiting arcs sell the storm-magic silhouette.
  b.along(spine, 6, (at) => {
    b.spike(at, at, 0.12, 0.035, {
      color: FEATHER_DARK,
      group: "dorsalRidge",
    });
  });
  for (const s of [1, -1]) {
    const arcPath = polyline([
      [s * 0.5, 2.22, 0.2],
      [s * 0.78, 2.06, 0.34],
      [s * 1.05, 2.18, 0.28],
      [s * 1.33, 2.05, 0.4],
    ]);
    const spark = b.sweep(arcPath, [0.022, 0.004], {
      color: ARC,
      section: { ngon: 4 },
      caps: "point",
      name: `wingArc${s > 0 ? "L" : "R"}`,
      group: "lightning",
    });
    glow(spark, 2.8);
  }

  // Gold storm bracers and chest lightning marks.
  for (const s of [1, -1]) {
    const shoulder = wings[s > 0 ? 0 : 1].chain.joints[0];
    b.part(new THREE.TorusGeometry(0.18, 0.025, 6, 12), GOLD, {
      bone: shoulder,
      at: shoulder.at,
      rotation: [0, 90, 0],
      name: `shoulderRing${s > 0 ? "L" : "R"}`,
      group: "ornaments",
    });
  }
  b.part(new THREE.SphereGeometry(1, 12, 8), ARC_DEEP, { bone: spine.joints[2], at: [0, 2.02, 0.32], scale: [0.13, 0.2, 0.03], name: "chestCore", group: "stormCore" });
  const bolts = [
    [[-0.17, 1.86, 0.33], [-0.08, 2.02, 0.38], [-0.14, 2.18, 0.35]],
    [[0.17, 1.84, 0.32], [0.08, 2.01, 0.38], [0.15, 2.16, 0.34]],
    [[0, 2.22, 0.27], [0.06, 2.38, 0.31], [-0.01, 2.51, 0.28]],
  ];
  for (let i = 0; i < bolts.length; i++) {
    const bolt = b.sweep(polyline(bolts[i]), [0.028, 0.004], { color: ARC, section: { ngon: 4 }, caps: "point", name: `lightning${i + 1}`, group: "lightning" });
    glow(bolt, 2.4);
  }

  // A few deliberate ink-like contour studs break up the large wing surfaces.
  for (const s of [1, -1]) {
    const wing = wings[s > 0 ? 0 : 1].chain;
    for (let i = 1; i <= 3; i++) {
      const p = wing.at(i / 4);
      b.part(new THREE.SphereGeometry(0.035, 8, 5), INK, { bone: p.bone, at: p.at, name: `wingStud${s > 0 ? "L" : "R"}${i}`, group: "surfaceDetail" });
    }
  }

  return b.root;
}
