```ts
import * as THREE from "three";
import { countershade, createBuilder, gradient, mottle, paint, rng, spots } from "agentic-3js-builder";

export const meta = {
  name: "Startled pufferfish",
  description:
    "A pufferfish puffed into a ball: a spotted cream back fading to a white belly, short spines, big worried eyes, a pouting mouth, fluttering side fins, a fan tail and a few rising bubbles.",
};

const DEG = Math.PI / 180;
/** Body radius in meters: a fully puffed fish about 18 cm across. The ball rests on y = 0. */
const R = 0.09;
const CENTRE = new THREE.Vector3(0, R, 0);

/** Unit direction from the body centre: azimuth 0 = front (+Z), +90 = the fish's left (+X); elevation above the equator. */
function dirOf(azimuth: number, elevation: number) {
  const a = azimuth * DEG;
  const e = elevation * DEG;
  return new THREE.Vector3(Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e));
}

/** A point on the body, `lift` meters off its surface, in that direction. */
function onBody(azimuth: number, elevation: number, lift = 0) {
  return CENTRE.clone().addScaledVector(dirOf(azimuth, elevation), R + lift);
}

const COLOUR = {
  cream: "#f4dd98",
  gold: "#e9c46a",
  spot: "#6d4524",
  belly: "#fcf8ea",
  spine: "#c49a5c",
  eyeWhite: "#fffdf4",
  pupil: "#17110d",
  brow: "#4a2b17",
  lip: "#ea7b5e",
  mouth: "#3a1711",
  fin: "#f0b865",
  bubble: "#bfe8f7",
  shine: "#ffffff",
};

// Paints. A mottled cream skin, rosette spots on the back, fading to a white belly by which way the surface faces.
const skin = mottle(COLOUR.cream, COLOUR.gold, { size: 0.05, contrast: 0.6, seed: 3 });
const coat = spots(skin, COLOUR.spot, { size: 0.045, amount: 0.55, rosette: true, seed: 11 });
const bodyPaint = countershade(coat, COLOUR.belly, { level: -0.12, soft: 0.42 });

// The fan: gold at the stalk fading to ivory, with brown ray tips.
const tailTint = gradient(COLOUR.gold, "#fff3c9", [0, R, -0.13], [0, R, -0.19]);
const fanPaint = paint((_p, _n, s) => (Math.hypot(s[0], s[1]) > 0.052 ? COLOUR.spot : tailTint));

export default function pufferfish() {
  const b = createBuilder({ name: "pufferfish", detail: 1, paintSize: 1024 });

  // ---- Skeleton -----------------------------------------------------------------------------------------------
  const body = b.joint("body", { at: CENTRE });
  const eyeL = b.joint("eyeL", { parent: body, at: onBody(34, 16) });
  const eyeR = b.joint("eyeR", { parent: body, at: onBody(-34, 16) });
  const mouth = onBody(0, -7, 0.003);
  const jawU = b.joint("jawU", { parent: body, at: mouth, dir: dirOf(0, -7), up: [0, 1, 0], role: "jaw" });
  const jaw = b.joint("jaw", { parent: body, at: mouth, dir: dirOf(0, -7), up: [0, 1, 0], role: "jaw" });
  const finL = b.joint("finL", { parent: body, at: onBody(64, -4), dir: [1, 0.35, 0], up: [0, 0, -1], role: "fan" });
  const finR = b.joint("finR", { parent: body, at: onBody(-64, -4), dir: [-1, 0.35, 0], up: [0, 0, -1], role: "fan" });
  const tail = b.chain("tail", [[0, R, -0.04], [0, R, -0.095], [0, R, -0.13]], {
    parent: body,
    role: "tail",
    names: ["tail1", "tail2", "tail3"],
  });

  // ---- Body: a ball of lathe, the sphere's profile from pole to pole -----------------------------------------
  const profile: Array<[number, number]> = [];
  for (let i = 0; i <= 12; i++) {
    const a = (Math.PI * i) / 12;
    profile.push([R * Math.sin(a), R * Math.cos(a)]);
  }
  const ball = b.lathe(profile, { color: bodyPaint, at: CENTRE, bone: body, segments: 18, name: "body" });

  // ---- Spines: short cones over the skin, kept off the face, the fins and the tail stalk ---------------------
  const skinSurface = b.surface(ball);
  const keepClear: Array<[THREE.Vector3, number]> = [
    [onBody(34, 16), 0.05],
    [onBody(-34, 16), 0.05],
    [onBody(0, -7), 0.03],
    [onBody(68, -4), 0.05],
    [onBody(-68, -4), 0.05],
    [onBody(34, 46), 0.03],
    [onBody(-34, 46), 0.03],
  ];
  const spines = skinSurface.scatter(140, {
    rng: rng(7),
    minDist: 0.02,
    keepOut: (p) => p.clone().sub(CENTRE).normalize().z < -0.8 || keepClear.some(([c, r]) => c.distanceTo(p) < r),
    filter: (hit) => hit.n.y > -0.6,
  });
  for (const hit of spines)
    b.spike(hit, hit, 0.02, 0.0045, { color: COLOUR.spine, bone: body, sides: 6, group: "spines" });

  // ---- Eyes: big white balls on the front-top, pupils looking up and in: worried -----------------------------
  const EYE_R = 0.031;
  for (const [joint, az] of [
    [eyeL, 34],
    [eyeR, -34],
  ] as const) {
    const centre = onBody(az, 16);
    const look = dirOf(az - Math.sign(az) * 8, 28);
    b.part(new THREE.SphereGeometry(EYE_R, b.segments(16), b.segments(12)), COLOUR.eyeWhite, {
      at: centre,
      bone: joint,
      name: "eyeball",
    });
    const pupil = centre.clone().addScaledVector(look, EYE_R * 0.78);
    b.part(new THREE.SphereGeometry(0.0145, b.segments(10), b.segments(8)), COLOUR.pupil, {
      at: pupil,
      bone: joint,
      name: "pupil",
    });
    const glint = pupil
      .clone()
      .addScaledVector(look.clone().add(new THREE.Vector3(0, 0.45, 0)).normalize(), 0.0125);
    b.part(new THREE.SphereGeometry(0.0042, 6, 5), COLOUR.shine, { at: glint, bone: joint, name: "glint" });
  }

  // ---- Brows: slanted up toward the middle, the worried look -------------------------------------------------
  for (const s of [1, -1])
    b.sweep([onBody(24 * s, 50, 0.003), onBody(34 * s, 46, 0.003), onBody(44 * s, 40, 0.003)], 0.0055, {
      color: COLOUR.brow,
      bone: body,
      sides: 6,
      group: "brows",
    });

  // ---- Mouth: a tiny pouting O, the upper and lower lip on their own jaw joints ------------------------------
  const lipUp = new THREE.TorusGeometry(0.0095, 0.0042, b.segments(6), b.segments(14), Math.PI * 1.06);
  const lipDown = new THREE.TorusGeometry(0.0095, 0.0042, b.segments(6), b.segments(14), Math.PI * 1.06).rotateZ(
    Math.PI,
  );
  b.part(lipUp, COLOUR.lip, { at: mouth, dir: dirOf(0, -7), axis: "z", bone: jawU, name: "lipUpper" });
  b.part(lipDown, COLOUR.lip, { at: mouth, dir: dirOf(0, -7), axis: "z", bone: jaw, name: "lipLower" });
  b.part(new THREE.CircleGeometry(0.0048, 8), COLOUR.mouth, {
    at: onBody(0, -7, 0.002),
    dir: dirOf(0, -7),
    axis: "z",
    bone: body,
    name: "mouthHole",
  });

  // ---- Side fins: flat fans tilted up and back, caught mid-flutter -------------------------------------------
  const FIN: Array<[number, number]> = [
    [-0.014, -0.012],
    [-0.014, 0.012],
    [0.008, 0.02],
    [0.03, 0.02],
    [0.042, 0.006],
    [0.036, -0.012],
    [0.016, -0.018],
  ];
  for (const [side, joint] of [
    [1, finL],
    [-1, finR],
  ] as const)
    b.extrude(FIN, {
      color: COLOUR.fin,
      at: onBody(side * 64, -4),
      x: [side, 0.35, 0],
      y: [0, 0, -1],
      thickness: 0.005,
      bevel: 0.0015,
      smoothing: 1,
      bone: joint,
      name: side > 0 ? "finL" : "finR",
    });

  // ---- Tail: a short stalk on the tail chain, ending in a scalloped fan --------------------------------------
  b.sweep(tail, [0.022, 0.011], { color: COLOUR.gold, sides: 8, group: "tail" });
  const FAN: Array<[number, number]> = [[0, 0]];
  for (let k = 0; k <= 8; k++) {
    const a = (-62 + (124 * k) / 8) * DEG;
    const r = k % 2 === 0 ? 0.058 : 0.047;
    FAN.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  b.extrude(FAN, {
    color: fanPaint,
    at: [0, R, -0.13],
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.006,
    bevel: 0.0015,
    bone: "tail3",
    name: "tailFan",
  });

  // ---- Bubbles: four rising from the mouth, each with a small shine -----------------------------------------
  const bubbles: Array<[number, number, number, number]> = [
    [0.004, 0.104, 0.124, 0.0065],
    [0.012, 0.137, 0.14, 0.0095],
    [0.002, 0.176, 0.152, 0.012],
    [0.02, 0.214, 0.166, 0.0085],
  ];
  const shineDir = new THREE.Vector3(-0.35, 0.4, 0.85).normalize();
  for (const [x, y, z, r] of bubbles) {
    const c = new THREE.Vector3(x, y, z);
    b.part(new THREE.SphereGeometry(r, b.segments(10), b.segments(8)), COLOUR.bubble, {
      at: c,
      bone: body,
      name: "bubble",
    });
    b.part(new THREE.SphereGeometry(r * 0.25, 5, 4), COLOUR.shine, {
      at: c.clone().addScaledVector(shineDir, r * 0.92),
      bone: body,
      name: "bubbleShine",
    });
  }

  return b.root;
}
```