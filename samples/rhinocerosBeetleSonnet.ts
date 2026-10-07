import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, type OutlinePoint } from "../src/builder";
import { cells, mix, noise, paint, smoothstep, type Rgb } from "../src/paint";
import { rng } from "../src/math";
import { bezier, catmull, polyline } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Hercules Rhinoceros Beetle",
  description:
    "Male Dynastes hercules at real size (about 17 cm with horns): a gleaming black thoracic horn and a shorter lower head horn closing like pincers, olive elytra with black blotches and ridge rows, orange pubescence under the horn and belly, six spined legs and lamellate antennae, low-poly and fully rigged.",
  style: "low-poly",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Units: everything below is written in centimetres and converted once.
const cm = 0.01;
const P = (x: number, y: number, z: number): [number, number, number] => [x * cm, y * cm, z * cm];
/** Linear lookup through evenly spaced keys. */
const K = (keys: number[], t: number) => {
  const f = Math.min(Math.max(t, 0), 1) * (keys.length - 1);
  const i = Math.min(Math.floor(f), keys.length - 2);
  return keys[i] + (keys[i + 1] - keys[i]) * (f - i);
};
/** An outline drawn in centimetres, as metres. */
const O = (pts: [number, number][]): OutlinePoint[] => pts.map(([x, y]) => [x * cm, y * cm]);

// Palette ---------------------------------------------------------------------------------------------------------
const JET = "#1d1921";
const JET_HI = "#585266";
const CHESTNUT = "#53281a";
const RUST = "#964318";
const AMBER = "#d27a22";
const OLIVE_D = "#434f20";
const OLIVE = "#738034";
const OLIVE_L = "#b0ae66";
const BLACK = "#0d0a0e";
const EYE = "#2b1208";
const SHINE = "#ddd6c6";
const WING = "#7a5530";
const WING_V = "#34200f";

export default function build() {
  const b = createBuilder({ name: "herculesBeetle", paintSize: 2048 });
  const rand = rng(11);

  // =============================================================================================================
  // Skeleton
  const body = b.joint("body", { at: P(0, 3.5, -0.4), dir: [0, 0, 1], role: "spine" });
  const abdomen = b.joint("abdomen", { parent: body, at: P(0, 3.4, -0.4), aim: P(0, 3.3, -5.8), role: "spine" });
  const prothorax = b.joint("prothorax", { parent: body, at: P(0, 3.6, 0.8), aim: P(0, 3.7, 3.8), role: "spine" });
  const head = b.joint("head", { parent: prothorax, at: P(0, 3.4, 3.7), aim: P(0, 3.15, 5.6), role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: P(0, 2.6, 4.6), aim: P(0, 2.5, 5.8), role: "jaw" });

  // =============================================================================================================
  // Paints
  const elytraPaint = paint((p, n) => {
    const zf = smoothstep(-0.054, -0.004, p.z); // 0 at the rear tip, 1 near the shoulders
    const warm = noise(p, 0.026, 2);
    let c = mix(OLIVE, OLIVE_L, Math.min(Math.max(warm * 1.6 - 0.35 + zf * 0.3, 0), 1));
    c = mix(c, OLIVE_D, (1 - zf) * 0.55);
    // big black blotches with ragged edges
    const cl = cells(p, 0.0105, 5);
    const rad = 0.3 + cl.id * 0.34 + (noise(p, 0.006, 6) - 0.5) * 0.45;
    if (cl.id > 0.25) c = mix(c, BLACK, 1 - smoothstep(rad - 0.07, rad, cl.d1));
    // medium blotches, smaller and sparser
    const cm2 = cells(p, 0.0056, 14);
    if (cm2.id > 0.62) c = mix(c, BLACK, 0.9 * (1 - smoothstep(0.13, 0.2, cm2.d1)));
    // fine puncture dots
    const sp = cells(p, 0.0026, 9);
    if (sp.id > 0.4) c = mix(c, OLIVE_D, 0.75 * (1 - smoothstep(0.1, 0.2, sp.d1)));
    // dark margin skirt and sutural line
    c = mix(c, BLACK, smoothstep(-0.25, -0.75, n.y) * 0.95);
    const x = Math.abs(p.x);
    c = mix(c, BLACK, 1 - smoothstep(0.0009, 0.0024, x));
    c = mix(c, OLIVE_D, 0.35 * (1 - smoothstep(0.0024, 0.007, x)));
    // sheen on the crown
    return mix(c, "#dde08f", smoothstep(0.82, 1, n.y) * 0.2);
  });

  const pronotumPaint = paint((p, n) => {
    const hl = smoothstep(0.45, 1, n.y) * (0.5 + 0.5 * noise(p, 0.02, 4));
    let c = mix(JET, JET_HI, hl * 0.85);
    const pit = cells(p, 0.0034, 11);
    if (pit.id > 0.35) c = mix(c, BLACK, 0.7 * (1 - smoothstep(0.1, 0.2, pit.d1)));
    c = mix(c, BLACK, 0.7 * (1 - smoothstep(0.0006, 0.0016, Math.abs(p.x))));
    c = mix(c, CHESTNUT, smoothstep(0.1, -0.5, n.y) * 0.5 * (0.6 + 0.4 * noise(p, 0.01, 8)));
    return mix(c, RUST, smoothstep(-0.5, -0.9, n.y) * 0.5);
  });

  const hornPaint = (t0: number) =>
    paint((p, n, s) => {
      const hl = smoothstep(0.4, 1, n.y) * (0.55 + 0.45 * noise(p, 0.015, 3));
      let c = mix(JET, JET_HI, hl * 0.8);
      c = mix(c, CHESTNUT, smoothstep(0.0, -0.7, n.y) * 0.75);
      return mix(c, RUST, smoothstep(t0, 1, s[0]) * 0.8);
    });

  const bellyPaint = paint((p, n) => {
    const seam = ((((p.z + 0.053) / 0.0074) % 1) + 1) % 1;
    let c = mix(CHESTNUT, "#2c140c", noise(p, 0.012, 7));
    c = mix(c, RUST, smoothstep(0.12, 0.0, seam) * 0.8);
    c = mix(c, BLACK, 1 - smoothstep(0.0008, 0.002, Math.abs(p.x)));
    return mix(c, JET, smoothstep(0.1, 0.9, n.y) * 0.8);
  });

  const headPaint = paint((p, n) => {
    const hl = smoothstep(0.5, 1, n.y) * (0.45 + 0.55 * noise(p, 0.012, 13));
    let c = mix(JET, JET_HI, hl * 0.85);
    const pit = cells(p, 0.0026, 17);
    if (pit.id > 0.3) c = mix(c, BLACK, 0.8 * (1 - smoothstep(0.1, 0.22, pit.d1)));
    return mix(c, CHESTNUT, smoothstep(0.0, -0.7, n.y) * 0.75);
  });

  const wingPaint = paint((p) => {
    const rib = (((p.z / 0.0034) % 1) + 1) % 1;
    const v = Math.abs(rib - 0.5);
    return mix(mix(WING, "#a07a48", noise(p, 0.01, 4)), WING_V, (1 - smoothstep(0.02, 0.1, v)) * 0.65);
  });

  // =============================================================================================================
  // Hair texture (the orange pubescence)
  const tuft = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 48">
      <path d="M12 0 L16 48 H8Z" fill="#e39a33"/>
      <path d="M5 9 L9 48 H1Z" fill="#c9701d"/>
      <path d="M19 12 L23 48 H15Z" fill="#f0b855"/>
      <path d="M9 20 L13 48 H5Z" fill="#a85a17"/>
    </svg>`,
    { size: 120 },
  );
  const hairOpts = { lean: 62, bend: 16, vary: 0.35, spin: 25 };

  // =============================================================================================================
  // Elytra, wings, scutellum, pygidium
  const ELY_RX = [0.47, 1.05, 1.34, 1.4, 1.28, 1.0];
  const ELY_RY = [0.47, 1.1, 1.48, 1.54, 1.36, 1.0];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hinge = b.joint(`elytron${side}`, {
      parent: body,
      at: P(s * 0.8, 4.7, 0.7),
      aim: P(s * 1.0, 3.5, -5.0),
      role: "hinge",
    });
    const path = catmull([
      P(s * 0.95, 3.3, -5.6),
      P(s * 0.95, 3.5, -3.7),
      P(s * 0.95, 3.6, -1.2),
      P(s * 0.95, 3.55, 0.2),
    ]);
    const shell = b.sweep(path, (t) => [K(ELY_RX, t) * cm, K(ELY_RY, t) * cm], {
      bone: hinge,
      color: elytraPaint,
      sides: 10,
      smooth: false,
      name: `elytron${side}`,
    });
    // raised ridge rows (costae)
    for (const a of [64, 38, 12, -14, -40]) {
      b.sweep(shell.line(-s * a, -0.0006).slice(0.06, 0.92), [0.0003, 0.0003], {
        bone: hinge,
        color: elytraPaint,
        sides: 4,
        smooth: false,
        caps: "none",
        name: `ridge${side}`,
      });
    }
    // dark lower margin rim
    b.sweep(shell.line(-s * 108, -0.0004).slice(0.04, 0.96), [0.0005, 0.0005], {
      bone: hinge,
      color: BLACK,
      sides: 4,
      smooth: false,
      caps: "none",
      name: `rim${side}`,
    });
    // humeral callus at the shoulder
    b.part(new THREE.SphereGeometry(0.0036, 6, 4), OLIVE_L, { bone: hinge, at: P(s * 1.95, 4.5, 0.15), flat: true, name: "callus" });
    // folded hind wing: a brown membrane that peeks out under the elytron tip
    const wingBone = b.joint(`wing${side}`, {
      parent: body,
      at: P(s * 0.8, 3.8, 0.3),
      aim: P(s * 0.95, 3.1, -6.6),
      role: "wing",
    });
    b.extrude(
      O([
        [0, 0],
        [1.5, 0.5],
        [3.2, 0.45],
        [5.7, 0.2],
        [6.5, -0.1],
        [5.5, -0.6],
        [2.8, -0.75],
        [0.8, -0.5],
      ]),
      {
        at: P(s * 0.8, 3.05, -0.15),
        x: [0, 0, -1],
        y: [-s, 0, 0],
        thickness: 0.0008,
        color: wingPaint,
        bone: wingBone,
        name: `hindwing${side}`,
      },
    );
  }
  // scutellum
  b.extrude(
    O([
      [-0.5, 0],
      [0.5, 0],
      [0, 0.7],
    ]),
    { at: P(0, 4.75, 0.95), x: [1, 0, 0], y: [0, 0.3, -1], thickness: 0.0016, bevel: 0.0004, color: JET, bone: body, name: "scutellum" },
  );
  // pygidium (last tergite) peeking past the elytra
  b.part(new THREE.SphereGeometry(0.0065, 6, 4), CHESTNUT, {
    bone: abdomen,
    at: P(0, 2.95, -5.9),
    scale: [1.5, 0.85, 0.85],
    flat: true,
    name: "pygidium",
  });

  // =============================================================================================================
  // Belly, prothorax, head
  const belly = b.sweep(
    catmull([P(0, 2.5, -5.5), P(0, 2.45, -1.9), P(0, 2.45, 1.5), P(0, 2.6, 3.3)]),
    (t) => [K([0.6, 1.3, 1.55, 1.5, 1.0], t) * cm, K([0.45, 0.7, 0.72, 0.68, 0.55], t) * cm],
    { bone: body, color: bellyPaint, sides: 10, smooth: false, name: "belly" },
  );
  const pron = b.sweep(
    catmull([P(0, 3.7, 0.55), P(0, 3.8, 2.2), P(0, 3.65, 3.7)]),
    (t) => [K([1.45, 1.8, 1.78, 1.45, 0.95], t) * cm, K([1.0, 1.25, 1.25, 1.1, 0.75], t) * cm],
    { bone: prothorax, color: pronotumPaint, sides: 10, smooth: false, name: "pronotum" },
  );
  for (const s of [1, -1]) {
    // glossy rim ridge along each pronotum margin
    b.sweep(pron.line(-s * 80, -0.0005).slice(0.12, 0.9), [0.0004, 0.0004], {
      bone: prothorax,
      color: JET,
      sides: 4,
      smooth: false,
      caps: "none",
      name: "pronotumRim",
    });
  }
  const skull = b.sweep(
    catmull([P(0, 3.3, 3.4), P(0, 3.2, 4.4), P(0, 3.0, 5.25)]),
    (t) => [K([1.15, 1.1, 0.78], t) * cm, K([0.95, 0.85, 0.58], t) * cm],
    { bone: head, color: headPaint, sides: 10, smooth: false, name: "skull" },
  );
  // clypeus, a notched plate in front of the head
  b.extrude(
    O([
      [-0.8, 0],
      [0.8, 0],
      [0.95, 0.5],
      [0.6, 1.05],
      [0.2, 1.15],
      [0, 0.8],
      [-0.2, 1.15],
      [-0.6, 1.05],
      [-0.95, 0.5],
    ]),
    { at: P(0, 3.15, 4.55), x: [1, 0, 0], y: [0, 0, 1], thickness: 0.0042, bevel: 0.001, color: headPaint, bone: head, name: "clypeus" },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0034, 6, 5), EYE, { bone: head, at: P(s * 0.98, 3.25, 4.15), scale: [0.7, 1, 1.2], flat: true, name: "eye" });
    b.part(new THREE.SphereGeometry(0.0007, 4, 3), SHINE, { bone: head, at: P(s * 1.17, 3.38, 4.2), flat: true, name: "eyeGlint" });
    // brow ridge over each eye
    b.capsule(P(s * 1.05, 3.55, 3.8), P(s * 1.0, 3.5, 4.7), 0.0011, { bone: head, color: JET, sides: 5, name: "brow" });
  }

  // =============================================================================================================
  // Horns
  const thPath = catmull([P(0, 4.3, 2.0), P(0, 5.5, 3.3), P(0, 6.4, 5.3), P(0, 6.9, 7.7), P(0, 6.6, 9.7), P(0, 5.7, 11.0)]);
  const TH = [1.1, 0.92, 0.7, 0.5, 0.36, 0.14];
  const thoracicHorn = b.sweep(thPath, (t) => [K(TH, t) * cm, K(TH, t) * 0.92 * cm], {
    bone: prothorax,
    color: hornPaint(0.8),
    section: { ngon: 6 },
    caps: "point",
    name: "thoracicHorn",
  });
  const cephPath = catmull([P(0, 3.5, 4.4), P(0, 3.55, 6.2), P(0, 3.85, 8.0), P(0, 4.6, 9.4), P(0, 5.2, 10.3)]);
  const CE = [0.72, 0.56, 0.44, 0.32, 0.14];
  const cephalicHorn = b.sweep(cephPath, (t) => [K(CE, t) * cm, K(CE, t) * 0.9 * cm], {
    bone: head,
    color: hornPaint(0.82),
    section: { ngon: 6 },
    caps: "point",
    name: "cephalicHorn",
  });
  // teeth on the cephalic horn, and prongs on the thoracic horn
  for (const [t, len, r] of [
    [0.46, 0.55, 0.19],
    [0.62, 0.45, 0.15],
    [0.78, 0.32, 0.11],
  ] as const) {
    const at = cephalicHorn.at(t, 0);
    b.spike(at, at, len * cm, r * cm, { color: JET, sides: 5, name: "cephTooth" });
  }
  for (const s of [1, -1]) {
    const lat = thoracicHorn.at(0.9, -s * 70);
    b.spike(lat, lat, 0.3 * cm, 0.09 * cm, { color: JET, sides: 5, name: "thoracicProng" });
    const lat2 = thoracicHorn.at(0.55, -s * 60);
    b.spike(lat2, lat2, 0.24 * cm, 0.12 * cm, { color: JET, sides: 5, name: "thoracicTubercle" });
    const lat3 = thoracicHorn.at(0.2, -s * 75);
    b.spike(lat3, lat3, 0.26 * cm, 0.13 * cm, { color: JET, sides: 5, name: "thoracicTubercle" });
  }
  // orange fringe under the thoracic horn and the cephalic horn
  b.cards(
    b.surface(thoracicHorn).scatter(100, { rng: rand, minDist: 0.0032, filter: (h) => h.n.y < -0.4 }),
    tuft,
    { size: [0.0034, 0.0075], flow: [0, -0.35, -1], ...hairOpts, rng: rand },
  );
  b.cards(
    b.surface(cephalicHorn).scatter(55, { rng: rand, minDist: 0.0032, filter: (h) => h.n.y < -0.35 && h.at.z > 0.055 }),
    tuft,
    { size: [0.0028, 0.006], flow: [0, -0.35, -1], ...hairOpts, rng: rand },
  );

  // =============================================================================================================
  // Mouthparts and antennae
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const mand = b.joint(`mandible${side}`, { parent: head, at: P(s * 0.6, 2.85, 4.85), aim: P(s * 0.28, 2.75, 6.2), role: "jaw" });
    b.sweep(bezier(P(s * 0.6, 2.85, 4.85), P(s * 0.88, 2.8, 5.7), P(s * 0.2, 2.75, 6.25)), [0.0036, 0.0003], {
      bone: mand,
      color: BLACK,
      section: { ngon: 5 },
      caps: "point",
      name: "mandible",
    });
    b.spike(P(s * 0.55, 2.8, 5.7), [-s, 0.1, 0.3], 0.0045, 0.0012, { bone: mand, color: BLACK, sides: 5, name: "mandibleTooth" });
    // palps on the lower lip
    b.capsule(P(s * 0.3, 2.5, 5.1), P(s * 0.5, 2.45, 5.75), [0.0009, 0.0006], { bone: jaw, color: RUST, sides: 5, name: "palp" });

    // antenna: three stalk joints, then a three-leaf lamellate club
    const a = [P(s * 0.65, 3.15, 4.85), P(s * 1.0, 3.2, 5.5), P(s * 1.32, 3.3, 6.0), P(s * 1.62, 3.42, 6.4)];
    const antenna = b.chain(`antenna${side}`, polyline(a), {
      parent: head,
      names: [`antenna${side}1`, `antenna${side}2`, `antenna${side}3`],
      role: "tentacle",
    });
    b.sweep(antenna, [0.0013, 0.0008], { color: CHESTNUT, section: { ngon: 5 }, name: "antennaStalk" });
    const end = new THREE.Vector3(...a[3]);
    const dir = end.clone().sub(new THREE.Vector3(...a[2])).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    for (let j = 0; j < 3; j++) {
      const yDir = up.clone().applyAxisAngle(dir, (j * Math.PI) / 3 + 0.3);
      b.extrude(
        O([
          [0, 0],
          [0.15, 0.2],
          [0.6, 0.25],
          [0.95, 0.1],
          [1.0, 0],
          [0.95, -0.1],
          [0.6, -0.25],
          [0.15, -0.2],
        ]),
        { at: end, x: dir.toArray(), y: yDir.toArray(), thickness: 0.0004, color: j === 1 ? AMBER : RUST, bone: antenna.joints[2], name: "antennaLeaf" },
      );
    }
  }
  b.extrude(
    O([
      [-0.55, 0],
      [0.55, 0],
      [0.62, 0.55],
      [0.2, 1.05],
      [-0.2, 1.05],
      [-0.62, 0.55],
    ]),
    { at: P(0, 2.52, 4.55), x: [1, 0, 0], y: [0, 0, 1], thickness: 0.0025, bevel: 0.0006, color: CHESTNUT, bone: jaw, name: "labium" },
  );

  // =============================================================================================================
  // Legs
  type Leg = { name: string; hip: number[]; knee: number[]; ankle: number[]; toe: number[]; parent: typeof body; front: boolean };
  const legs: Leg[] = [
    { name: "1", hip: [1.2, 2.4, 2.5], knee: [3.1, 2.9, 3.5], ankle: [4.3, 1.3, 4.6], toe: [5.1, 0.68, 5.9], parent: prothorax, front: true },
    { name: "2", hip: [1.3, 2.4, 0.3], knee: [3.4, 2.9, 0.8], ankle: [5.0, 1.3, 1.2], toe: [6.0, 0.68, 1.9], parent: body, front: false },
    { name: "3", hip: [1.2, 2.4, -1.9], knee: [3.1, 2.8, -3.0], ankle: [4.5, 1.3, -4.0], toe: [5.5, 0.68, -5.0], parent: abdomen, front: false },
  ];
  const legColor = (t1: number, t2: number) =>
    paint((p, n, s) => {
      const t = s[0];
      let c: Rgb;
      if (t < t1) c = mix(JET, CHESTNUT, smoothstep(t1 * 0.55, t1, t) * 0.85 + (1 - smoothstep(0, t1 * 0.25, t)) * 0.4);
      else if (t < t2) c = mix(CHESTNUT, JET, 0.45 + 0.4 * noise(p, 0.01, 21));
      else c = mix(CHESTNUT, RUST, 0.5);
      return mix(c, JET_HI, smoothstep(0.6, 1, n.y) * 0.35 * (1 - smoothstep(t2 - 0.02, t2, t)));
    });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const leg of legs) {
      const m = (q: number[]) => P(s * q[0], q[1], q[2]);
      const hip = m(leg.hip);
      const knee = m(leg.knee);
      const ankle = m(leg.ankle);
      const toe = m(leg.toe);
      const id = `${side}${leg.name}`;
      const chain = b.chain(`leg${id}`, polyline([hip, knee, ankle, toe]), {
        parent: leg.parent,
        names: [`hip${id}`, `knee${id}`, `ankle${id}`, `foot${id}`],
        role: "leg",
        contact: [toe[0], 0, toe[2]],
      });
      const L1 = new THREE.Vector3(...hip).distanceTo(new THREE.Vector3(...knee));
      const L2 = new THREE.Vector3(...knee).distanceTo(new THREE.Vector3(...ankle));
      const L3 = new THREE.Vector3(...ankle).distanceTo(new THREE.Vector3(...toe));
      const tot = L1 + L2 + L3;
      const t1 = L1 / tot;
      const t2 = (L1 + L2) / tot;
      const fw = leg.front ? 1.2 : 1;
      const r = (t: number) => {
        if (t < t1) return (0.54 - 0.1 * (t / t1) + 0.08 * Math.sin((t / t1) * Math.PI)) * cm;
        if (t < t2) return (0.4 * fw - 0.12 * ((t - t1) / (t2 - t1))) * cm;
        return (0.2 - 0.06 * ((t - t2) / (1 - t2))) * cm;
      };
      const tube = b.sweep(chain, r, { section: { ngon: 6 }, color: legColor(t1, t2), name: `leg${id}` });
      const [hipJ, kneeJ, ankleJ] = chain.joints;
      const foot = chain.tip ?? ankleJ;

      // coxa and knee knuckles
      b.part(new THREE.SphereGeometry(0.0068, 6, 4), CHESTNUT, { bone: hipJ, at: hip, flat: true, name: "coxa" });
      b.part(new THREE.SphereGeometry(0.0046, 6, 4), CHESTNUT, { bone: kneeJ, at: knee, flat: true, name: "knee" });

      const kv = new THREE.Vector3(...knee);
      const av = new THREE.Vector3(...ankle);
      const tv = new THREE.Vector3(...toe);
      const shin = av.clone().sub(kv).normalize();
      const out = new THREE.Vector3(s, 0, 0);
      // tibial teeth along the outer edge (broad on the digging fore legs)
      const teeth: number[] = leg.front ? [0.4, 0.62, 0.84] : [0.5, 0.8];
      for (const u of teeth) {
        const base = kv.clone().lerp(av, u).addScaledVector(out, r(t1 + (t2 - t1) * u) * 0.8);
        const d = out.clone().addScaledVector(shin, leg.front ? 0.9 : 0.5).addScaledVector(new THREE.Vector3(0, -1, 0), 0.1).normalize();
        b.spike(base, d, (leg.front ? 0.55 : 0.34) * cm, (leg.front ? 0.19 : 0.11) * cm, { bone: kneeJ, color: BLACK, sides: 5, name: "tibialTooth" });
      }
      // end spurs
      const spread = new THREE.Vector3().crossVectors(shin, out).normalize();
      for (const k of [-1, 1]) {
        const d = shin.clone().addScaledVector(spread, 0.35 * k).addScaledVector(out, 0.25).normalize();
        b.spike(av.clone().addScaledVector(spread, 0.14 * cm * k).addScaledVector(shin, -0.2 * cm), d, 0.45 * cm, 0.09 * cm, { bone: ankleJ, color: CHESTNUT, sides: 5, name: "spur" });
      }
      // beaded tarsus segments
      const beads: THREE.BufferGeometry[] = [];
      for (let i = 0; i < 5; i++) {
        const q = av.clone().lerp(tv, (i + 0.6) / 5.2);
        beads.push(new THREE.SphereGeometry((0.23 - 0.02 * i) * cm, 5, 4).translate(q.x, q.y, q.z));
      }
      const merged = mergeGeometries(beads);
      if (merged) b.part(merged, CHESTNUT, { bone: ankleJ, at: [0, 0, 0], flat: true, name: "tarsus" });
      // claws and sole pad
      const d = tv.clone().sub(av).normalize();
      const lat = new THREE.Vector3().crossVectors(d, new THREE.Vector3(0, 1, 0)).normalize();
      for (const k of [-1, 1]) {
        const root = tv.clone().addScaledVector(lat, 0.08 * cm * k);
        const mid = root.clone().addScaledVector(d, 0.4 * cm).addScaledVector(lat, 0.12 * cm * k);
        const tip = root.clone().addScaledVector(d, 0.65 * cm).addScaledVector(lat, 0.3 * cm * k).add(new THREE.Vector3(0, -0.34 * cm, 0));
        b.sweep(bezier(root, mid, tip), [0.0008, 0.0001], { bone: foot, color: BLACK, section: { ngon: 4 }, caps: "point", name: "claw" });
      }
      b.part(new THREE.SphereGeometry(0.0018, 5, 4), AMBER, { bone: foot, at: tv.clone().addScaledVector(d, 0.1 * cm).toArray(), flat: true, name: "pad" });
      // hairs on the thigh
      b.cards(b.surface(tube).scatter(14, { rng: rand, minDist: 0.003, filter: (h) => h.n.y < -0.3 && h.at.y > 0.017 }), tuft, {
        size: [0.0024, 0.0052],
        flow: [0, -0.3, -1],
        ...hairOpts,
        rng: rand,
      });
    }
  }

  // =============================================================================================================
  // Underside pubescence
  b.cards(b.surface(belly).scatter(260, { rng: rand, minDist: 0.0034, filter: (h) => h.n.y < -0.15 }), tuft, {
    size: [0.0032, 0.0068],
    flow: [0, -0.3, -1],
    ...hairOpts,
    rng: rand,
  });
  b.cards(b.surface(skull).scatter(25, { rng: rand, minDist: 0.0032, filter: (h) => h.n.y < -0.2 }), tuft, {
    size: [0.0024, 0.005],
    flow: [0, -0.3, -1],
    ...hairOpts,
    rng: rand,
  });

  return b.root;
}
