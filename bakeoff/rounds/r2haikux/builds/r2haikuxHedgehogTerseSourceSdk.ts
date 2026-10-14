import * as THREE from "three";
import { catmull, countershade, createBuilder, mix, paint, rng, smoothstep } from "../../../../src/index";

export const meta = {
  name: "Hedgehog",
  description:
    "A European hedgehog in a rest pose: a dark quilled body with cream-tipped spines, a pale pointed face with a black nose and glinting eyes, and short legs with toes.",
};

const SPINE_BASE = "#4a3022";
const SPINE_TIPS = ["#f2e4c6", "#e8d2a9", "#d8b98c"];
const BODY_BACK = "#4f3526";
const BODY_BELLY = "#dcb98e";
const FACE_DARK = "#5e4030";
const FACE_PALE = "#efd9b2";
const LEG = "#7d5a43";
const PAW = "#3a2a21";
const EAR = "#a66f5c";
const MOUTH = "#7a4a44";
const EYE = "#120d0b";
const NOSE = "#15100d";
const GLINT = "#ffffff";

// Left-side leg joints (hip, knee, ankle). The right side mirrors them across the middle.
const FRONT_LEG = [
  [0.045, 0.06, 0.02],
  [0.052, 0.03, 0.024],
  [0.05, 0.009, 0.03],
];
const BACK_LEG = [
  [0.05, 0.06, -0.065],
  [0.056, 0.03, -0.075],
  [0.052, 0.009, -0.06],
];

export default function hedgehog() {
  const b = createBuilder({ name: "hedgehog", paintSize: 1024 });

  // Skeleton: root at the middle of the body, spine to the shoulders, neck to a head joint, a jaw hinge, a stub tail.
  b.joint("root", { at: [0, 0.09, -0.02] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.088, -0.07],
      [0, 0.09, -0.02],
      [0, 0.088, 0.03],
    ]),
    { parent: "root", names: ["spine1", "spine2"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.088, 0.03],
      [0, 0.094, 0.062],
      [0, 0.086, 0.088],
    ]),
    { parent: "spine2", names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: "neck2", at: [0, 0.086, 0.088], dir: [0, 0.2, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: "head", at: [0, 0.058, 0.108], aim: [0, 0.05, 0.152], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.088, -0.1], [0, 0.09, -0.13]]), {
    parent: "spine1",
    names: ["tail1", "tail2"],
    role: "tail",
  });

  // Body: one smooth loft from rump to neck that bends with the spine and neck bones, dark back to pale belly.
  const body = b.loft(
    [
      { at: [0, 0.088, -0.07], w: 0.09, h: 0.09 },
      { at: [0, 0.09, -0.02], w: 0.13, h: 0.115 },
      { at: [0, 0.088, 0.03], w: 0.12, h: 0.11 },
      { at: [0, 0.084, 0.065], w: 0.085, h: 0.085 },
    ],
    {
      color: countershade(BODY_BACK, BODY_BELLY, { level: -0.1, soft: 0.45 }),
      bone: [spine, neck],
      sides: 10,
      name: "body",
    },
  );

  // Head: a tapering loft rigid on the head joint, dark crown fading to a pale face.
  const skull = b.loft(
    [
      { at: [0, 0.086, 0.085], w: 0.09, h: 0.09 },
      { at: [0, 0.082, 0.107], w: 0.09, h: 0.085 },
      { at: [0, 0.076, 0.127], w: 0.066, h: 0.062 },
      { at: [0, 0.07, 0.142], w: 0.034, h: 0.034 },
    ],
    {
      color: paint((_p, n) => mix(FACE_DARK, FACE_PALE, smoothstep(0.1, 0.55, n.z))),
      bone: head,
      sides: 10,
      name: "head",
    },
  );

  // Lower jaw on its hinge, and a short tail stub.
  b.capsule([0, 0.058, 0.108], [0, 0.05, 0.152], [0.0105, 0.0065], { color: MOUTH, bone: jaw, name: "jaw" });
  b.sweep(tail, [0.0085, 0.0045], { color: SPINE_BASE, name: "tail" });

  // Legs: tapered tubes on chains, each with a dark paw and three toes.
  for (const sx of [1, -1]) {
    const side = sx > 0 ? "L" : "R";
    for (const fore of ["F", "B"] as const) {
      const [hip, knee, ankle] = (fore === "F" ? FRONT_LEG : BACK_LEG).map(([x, y, z]) => [sx * x, y, z]);
      const leg = b.chain(`leg${fore}${side}`, catmull([hip, knee, ankle]), {
        parent: "root",
        names: [`hip${fore}${side}`, `knee${fore}${side}`, `ankle${fore}${side}`],
        role: "leg",
      });
      b.sweep(leg, (t) => 0.0115 - 0.0042 * t, { color: LEG, name: `leg${fore}${side}` });

      const foot = leg.tip!;
      const [ax, , az] = ankle;
      const paw = new THREE.SphereGeometry(0.0135, 12, 8);
      paw.scale(1, 0.5, 1.25);
      b.part(paw, PAW, { at: [ax, 0.0065, az + 0.005], bone: foot });
      for (const dx of [-0.0058, 0, 0.0058]) {
        b.part(new THREE.SphereGeometry(0.0042, 8, 6), PAW, { at: [ax + dx, 0.0042, az + 0.016], bone: foot });
      }
    }
  }

  // Face details, seated on the skull's real surface by rays cast from outside.
  const skin = b.surface(skull);
  const onSkull = (dir: THREE.Vector3, from: THREE.Vector3) => {
    const hit = skin.ray(from.clone().addScaledVector(dir, 0.6), dir.clone().negate());
    if (!hit) throw new Error("hedgehog: a ray missed the head");
    return hit;
  };

  // Eyes with a glint each, on the front-sides of the face.
  for (const sx of [1, -1]) {
    const dir = new THREE.Vector3(sx * 0.62, 0.25, 0.74).normalize();
    const hit = onSkull(dir, new THREE.Vector3(0, 0.08, 0.115));
    const eye = hit.at.addScaledVector(hit.n, 0.0035);
    b.part(new THREE.SphereGeometry(0.0105, 14, 10), EYE, { at: eye, bone: head, name: "eye" });
    const lit = hit.n.clone().multiplyScalar(0.5).add(new THREE.Vector3(0, 0.8, 0)).normalize();
    b.part(new THREE.SphereGeometry(0.0036, 8, 6), GLINT, {
      at: eye.clone().addScaledVector(lit, 0.0097),
      bone: head,
      name: "glint",
    });
  }

  // Nose: a flattened black pad on the tip of the snout.
  const tip = skin.ray(new THREE.Vector3(0, 0.07, 0.3), new THREE.Vector3(0, 0, -1));
  if (!tip) throw new Error("hedgehog: the nose ray missed the head");
  const nose = new THREE.SphereGeometry(0.0095, 12, 8);
  nose.scale(1.25, 0.7, 1);
  b.stick(nose, NOSE, tip, { embed: 0.3, name: "nose" });

  // Ears: flattened discs set into the sides of the crown.
  for (const sx of [1, -1]) {
    const dir = new THREE.Vector3(sx * 0.75, 0.6, -0.2).normalize();
    const hit = onSkull(dir, new THREE.Vector3(0, 0.082, 0.1));
    const ear = new THREE.SphereGeometry(0.0135, 12, 8);
    ear.scale(1, 0.3, 1);
    b.stick(ear, EAR, hit, { embed: 0.1, name: "ear" });
  }

  // Quills: spikes scattered over the back and flanks, leaning back, each with a cream-or-tan tip band.
  const back = new THREE.Vector3(0, 0, -1);
  const random = rng(7);
  const quills = b.surface(body).scatter(320, {
    rng: random,
    minDist: 0.0105,
    keepOut: (p) => p.z > 0.068 || p.y < 0.05 || (p.z < -0.095 && Math.abs(p.x) < 0.03),
    filter: (hit) => hit.n.y > -0.35,
  });
  for (const hit of quills) {
    const tipColour = SPINE_TIPS[Math.floor(random() * SPINE_TIPS.length)];
    const dir = hit.n
      .clone()
      .lerp(back, 0.5 + 0.3 * (random() - 0.5))
      .normalize();
    const length = 0.022 + 0.012 * random();
    b.spike(hit.moved([0, -0.0015, 0]), dir.toArray(), length, 0.0024, {
      sides: 6,
      bands: [
        [0.62, SPINE_BASE],
        [1, tipColour],
      ],
      group: "quills",
    });
  }

  return b.root;
}
