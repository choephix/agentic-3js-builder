import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull } from "../src/path";

export const meta = {
  name: "Spore Brute",
  description:
    "A hulking mushroom monster: a squat stalk body under a broad red-spotted cap with gills, a grinning jaw with fangs, huge knuckled fists, and spore sacs and moss on its back and shoulders.",
  style: "low-poly",
  commit: "b816db2",
};

// Flat palette, one colour per role.
const CAP = "#c93a2e";
const CAP_DARK = "#8c2320";
const SPOT = "#f6eedb";
const GILL = "#efdfae";
const STALK = "#e4d6b0";
const BELLY = "#c9b07e";
const BOOT = "#5b4530";
const STRAW = "#c9a95a";
const SPORE = "#c6d84a";
const SPORE_DARK = "#8ea22e";
const MOSS = "#6a9a3c";
const DARK = "#2a1f19";
const TEETH = "#fbf7ea";
const EYE = "#fffdf3";
const PUPIL = "#1f1a18";

type Key = [number, number, number]; // [t, sideways radius, front-back radius]

// Piecewise-linear tube radius along a tube, keyed by source t.
function taper(keys: Key[]): (t: number) => [number, number] {
  return (t) => {
    for (let i = 1; i < keys.length; i++) {
      const [t1, x1, y1] = keys[i];
      if (t <= t1) {
        const [t0, x0, y0] = keys[i - 1];
        const k = (t - t0) / (t1 - t0);
        return [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k];
      }
    }
    const last = keys[keys.length - 1];
    return [last[1], last[2]];
  };
}

// Model-space geometry merged into one non-indexed piece.
function merged(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const out = mergeGeometries(geos.map((g) => (g.index ? g.toNonIndexed() : g)));
  if (!out) throw new Error("geometry merge failed");
  return out;
}

export default function build() {
  const b = createBuilder({ name: "sporeBrute" });
  const rand = rng(21);

  // Skeleton: root hips, stalk spine, the cap's head joint, and a jaw on the chest.
  const hips = b.joint("hips", { at: [0, 0.9, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.0, 0],
      [0, 1.22, 0],
      [0, 1.46, 0],
      [0, 1.7, 0],
      [0, 1.9, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "spine4"], role: "spine" },
  );
  const head = b.joint("head", { parent: spine.joints[3], at: [0, 1.9, 0], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: spine.joints[2], at: [0, 1.56, 0.3], dir: [0, 1, 0], role: "jaw" });

  // Stalk body: a squat, broad-shouldered sack, widest at the belly, with a pale belly sector.
  const body = b.sweep(
    spine,
    taper([
      [0, 0.36, 0.36],
      [0.25, 0.46, 0.44],
      [0.55, 0.45, 0.41],
      [0.8, 0.4, 0.35],
      [1, 0.29, 0.28],
    ]),
    { sides: 8, smooth: false, color: STALK, sectors: [[120, 240, BELLY]] },
  );
  const skin = b.surface(body);

  // Grinning mouth on the chest. The upper edge and the dark gap sit on the body;
  // the lower lip rides the jaw bone so the mouth can open.
  const front = (x: number, y: number): [number, number, number] => [x, y, 1.0];
  const upperEdge = skin.drape(
    catmull([front(-0.27, 1.5), front(-0.14, 1.47), front(0, 1.45), front(0.14, 1.47), front(0.27, 1.5)]),
    { lift: 0.004 },
  );
  b.sweep(upperEdge, 0.03, { sides: 6, smooth: false, color: DARK });
  const gap = skin.drape(
    catmull([front(-0.2, 1.47), front(-0.1, 1.43), front(0, 1.4), front(0.1, 1.43), front(0.2, 1.47)]),
    { lift: 0.0 },
  );
  b.sweep(gap, 0.035, { sides: 6, smooth: false, color: DARK });
  const lowerLip = skin.drape(
    catmull([front(-0.25, 1.44), front(-0.14, 1.36), front(0, 1.33), front(0.14, 1.36), front(0.25, 1.44)]),
    { lift: 0.02 },
  );
  const lip = b.sweep(lowerLip, 0.04, { bone: jaw, sides: 6, smooth: false, color: BELLY });
  const lipSkin = b.surface(lip);
  for (const x of [-0.18, -0.06, 0.06, 0.18]) {
    const hit = skin.nearest(front(x, 1.5));
    b.spike(hit, [0, -1, 0], 0.07, 0.016, { color: TEETH });
  }
  for (const x of [-0.14, -0.05, 0.05, 0.14]) {
    const hit = lipSkin.nearest(front(x, 1.4));
    b.spike(hit, [0, 1, 0], 0.06, 0.017, { color: TEETH });
  }

  // Straw belt round the waist.
  const belt = skin.loop(spine.joints[1], { lift: 0.03 });
  b.sweep(belt, 0.04, { sides: 6, smooth: false, color: STRAW });

  // Cap: a solid lathe with a tall red dome, a cream rim bead and gills underneath.
  const capBase: [number, number, number] = [0, 1.9, 0];
  const cap = b.lathe(
    [
      [0, 0],
      [0.52, 0],
      [0.76, 0],
      [0.84, 0.06],
      [0.84, 0.18],
      [0.76, 0.31],
      [0.62, 0.43],
      [0.42, 0.52],
      [0.2, 0.56],
      [0, 0.57],
    ],
    { at: capBase, bone: head, segments: 9, color: CAP },
  );
  const capSkin = b.surface(cap);

  const rim = b.ring(frame(capBase, [0, 1, 0]), { count: 16, radius: 0.79 }).items;
  b.sweep(catmull(rim.map((f) => f.at), { closed: true }), 0.035, {
    bone: head,
    sides: 6,
    smooth: false,
    color: CAP_DARK,
  });

  const gills: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const g = new THREE.BoxGeometry(0.035, 0.05, 0.42);
    g.rotateY(a);
    g.translate(Math.sin(a) * 0.5, 1.885, Math.cos(a) * 0.5);
    gills.push(g);
  }
  b.part(merged(gills), GILL, { bone: head, at: [0, 0, 0], flat: true });

  // Cream spots on the dome.
  for (const hit of capSkin.scatter(20, { rng: rand, minDist: 0.19, filter: (h) => h.n.y > 0.2 })) {
    const size = 0.05 + 0.045 * rand();
    b.stick(new THREE.CylinderGeometry(size, size * 1.1, 0.03, 6), SPOT, hit, { embed: 0.4, flat: true });
  }

  // Eyes peek from under the front of the cap, with angry brows.
  for (const s of [1, -1]) {
    const eye = capSkin.nearest([s * 0.25, 2.0, 1.2]);
    b.stick(new THREE.SphereGeometry(0.12, 8, 6), EYE, eye, { embed: 0.35, flat: true });
    b.stick(new THREE.SphereGeometry(0.06, 6, 4), PUPIL, eye.moved([0, 0.1, 0]), { embed: 0.2, flat: true });
    const brow = capSkin.drape(
      catmull([
        [s * 0.38, 2.2, 1.2],
        [s * 0.23, 2.15, 1.2],
        [s * 0.1, 2.09, 1.2],
      ]),
      { lift: 0.01 },
    );
    b.sweep(brow, 0.03, { sides: 6, smooth: false, color: DARK });
  }

  // Spore sacs on the back, each with a dark nub.
  const sacs: [number, number, number][] = [
    [150, 18, 0.2],
    [204, 4, 0.17],
    [126, 42, 0.14],
    [234, 36, 0.13],
    [178, 64, 0.11],
    [102, -14, 0.12],
    [258, -14, 0.12],
  ];
  for (const [az, el, rad] of sacs) {
    const hit = skin.around([0, 1.45, 0]).at(az, el);
    if (!hit) throw new Error(`no torso hit at ${az},${el}`);
    b.stick(new THREE.IcosahedronGeometry(rad, 0), SPORE, hit, { embed: 0.35, flat: true });
    b.stick(
      new THREE.CylinderGeometry(rad * 0.45, rad * 0.5, rad * 0.3, 6),
      SPORE_DARK,
      hit.moved([0, rad * 0.75, 0]),
      { embed: 0.2, flat: true },
    );
  }
  // Spore vent: a row of dark pores low on the back.
  for (const az of [168, 180, 192]) {
    const hit = skin.around([0, 1.3, 0]).at(az, 0);
    if (!hit) throw new Error("no back hit");
    b.stick(new THREE.CylinderGeometry(0.03, 0.035, 0.02, 6), DARK, hit, { embed: 0.3, flat: true });
  }
  // Warts over the back and sides.
  for (const hit of skin.scatter(24, { rng: rand, minDist: 0.2, filter: (h) => h.n.z < 0.2 })) {
    b.stick(new THREE.ConeGeometry(0.03, 0.05, 5), SPORE_DARK, hit, { embed: 0.2, flat: true });
  }

  // Moss clumps on the shoulders.
  for (const s of [1, -1]) {
    for (const [az, el, rad] of [
      [80, 40, 0.11],
      [68, 15, 0.08],
      [100, 60, 0.07],
    ] as const) {
      const hit = skin.around([0, 1.6, 0]).at(s > 0 ? az : 360 - az, el);
      if (!hit) throw new Error("no shoulder hit");
      b.stick(new THREE.IcosahedronGeometry(rad, 0), MOSS, hit, { embed: 0.3, flat: true });
    }
  }

  // Two tiny mushrooms sprout from the shoulder moss.
  for (const s of [1, -1]) {
    const hit = skin.around([0, 1.6, 0]).at(s > 0 ? 62 : 298, 52);
    if (!hit) throw new Error("no shoulder hit");
    b.stick(new THREE.CylinderGeometry(0.022, 0.028, 0.08, 6), SPOT, hit, { embed: 0.1, flat: true });
    b.stick(new THREE.SphereGeometry(0.06, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2), CAP, hit.moved([0, 0.08, 0]), {
      embed: 0,
      flat: true,
    });
  }

  // Legs: stout tubes, a knee lump, and a chunky clog-like foot with toes and claws.
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const legChain = b.chain(
      `leg${S}`,
      catmull([
        [s * 0.22, 1.0, 0],
        [s * 0.28, 0.56, 0.05],
        [s * 0.26, 0.17, 0],
      ]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" },
    );
    b.sweep(legChain, taper([[0, 0.19, 0.18], [0.5, 0.15, 0.15], [1, 0.13, 0.13]]), {
      sides: 8,
      smooth: false,
      color: STALK,
    });
    const knee = legChain.joints[1];
    b.part(new THREE.IcosahedronGeometry(0.13, 0).translate(s * 0.28, 0.56, 0.05), STALK, {
      bone: knee,
      at: [0, 0, 0],
      flat: true,
    });
    for (const [y, rad] of [
      [0.4, 0.07],
      [0.3, 0.05],
    ] as const) {
      b.part(new THREE.IcosahedronGeometry(rad, 0).translate(s * 0.27, y, -0.12), MOSS, {
        bone: knee,
        at: [0, 0, 0],
        flat: true,
      });
    }
    const ankle = legChain.tip;
    if (!ankle) throw new Error("leg has no tip");
    const foot = new THREE.DodecahedronGeometry(0.23, 0).scale(1, 0.5, 1.25).translate(s * 0.26, 0.11, 0.12);
    const toes = [-0.11, 0, 0.11].map((dx) =>
      new THREE.IcosahedronGeometry(0.08, 0).translate(s * 0.26 + dx, 0.07, 0.38),
    );
    b.part(merged([foot, ...toes]), BOOT, { bone: ankle, at: [0, 0, 0], flat: true });
    const claws = [-0.11, 0, 0.11].map((dx) =>
      new THREE.ConeGeometry(0.022, 0.07, 4).rotateX(Math.PI / 2).translate(s * 0.26 + dx, 0.07, 0.49),
    );
    b.part(merged(claws), TEETH, { bone: ankle, at: [0, 0, 0], flat: true });
  }

  // Arms: chunky tubes with straw bracers and oversized knuckled fists.
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const armChain = b.chain(
      `arm${S}`,
      catmull([
        [s * 0.36, 1.5, 0],
        [s * 0.6, 1.24, 0.1],
        [s * 0.72, 0.98, 0.28],
      ]),
      { parent: spine.joints[2], names: [`shoulder${S}`, `elbow${S}`, `hand${S}`], role: "arm" },
    );
    const armTube = b.sweep(armChain, taper([[0, 0.17, 0.17], [0.5, 0.15, 0.15], [1, 0.13, 0.13]]), {
      sides: 8,
      smooth: false,
      color: STALK,
    });
    const bracer = b.surface(armTube).loop(armChain.joints[1], { lift: 0.02 });
    b.sweep(bracer, 0.035, { sides: 6, smooth: false, color: STRAW });

    const hand = armChain.tip;
    if (!hand) throw new Error("arm has no tip");
    const fist = new THREE.IcosahedronGeometry(0.24, 0).translate(s * 0.72, 0.98, 0.28);
    const thumb = new THREE.IcosahedronGeometry(0.09, 0).translate(s * 0.72 - s * 0.2, 0.95, 0.2);
    const knuckles = [-1.5, -0.5, 0.5, 1.5].map((k) =>
      new THREE.DodecahedronGeometry(0.065, 0).translate(s * 0.72 + k * 0.085, 1.04, 0.5),
    );
    b.part(merged([fist, thumb, ...knuckles]), STALK, { bone: hand, at: [0, 0, 0], flat: true });
  }

  return b.root;
}
